/* =====================================================================
   HORÁRIOS — importação do Excel do horário da turma (ClassSchedule)
   Guardados por ano letivo: A().horarios[nome da turma] = {turma, aulas, legenda, diretor}
   ===================================================================== */
const DIAS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const DIAS_C=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const normT=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const normTurma=s=>normT(s).replace(/[^a-z0-9/]/g,'');            // "10ºA" == "10.º A" == "10 a"
const hm=s=>{const m=String(s).match(/(\d{1,2})[:hH.](\d{2})/);return m?(+m[1])*60+(+m[2]):null};
const fmtHM=m=>m==null?'':String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const diaIdx=s=>{const n=normT(s);return n.startsWith('seg')?1:n.startsWith('ter')?2:n.startsWith('qua')?3:n.startsWith('qui')?4:n.startsWith('sex')?5:n.startsWith('sab')?6:0};
async function lerHorarioXlsx(file){
  const z=await unzip(await file.arrayBuffer());
  const wbPath='xl/workbook.xml';const wb=xmlDoc(await z.text(wbPath)||'<x/>');const wbRels=await relsDe(z,wbPath);
  let sst=[];const ss=await z.text('xl/sharedStrings.xml');if(ss)sst=tagsNS(xmlDoc(ss),'si').map(si=>tagsNS(si,'t').map(t=>t.textContent).join(''));
  const out=[];
  for(const sh of tagsNS(wb,'sheet')){
    const rid=sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh.getAttribute('r:id');
    const rel=wbRels[rid];if(!rel)continue;const sx=await z.text(rel.target);if(!sx)continue;
    const doc=xmlDoc(sx);const cells=new Map();
    tagsNS(doc,'c').forEach(c=>{const ref=c.getAttribute('r');const m=ref&&ref.match(/^([A-Z]+)(\d+)$/);if(!m)return;
      const t=c.getAttribute('t');let v='';
      if(t==='inlineStr')v=tagsNS(c,'t').map(x=>x.textContent).join('');else{const ve=tagsNS(c,'v')[0];v=ve?ve.textContent:'';if(t==='s')v=sst[+v]||''}
      if(String(v).trim()!=='')cells.set((+m[2]-1)+','+colNum(m[1]),{r:+m[2]-1,c:colNum(m[1]),v:String(v)})});
    // células unidas: o valor do canto superior esquerdo vale para todo o bloco
    tagsNS(doc,'mergeCell').forEach(mc=>{const [a,b]=(mc.getAttribute('ref')||'').split(':');if(!b)return;
      const pa=a.match(/^([A-Z]+)(\d+)$/),pb=b.match(/^([A-Z]+)(\d+)$/);if(!pa||!pb)return;
      const r1=+pa[2]-1,c1=colNum(pa[1]),r2=+pb[2]-1,c2=colNum(pb[1]);const top=cells.get(r1+','+c1);if(!top)return;
      for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(!cells.has(r+','+c))cells.set(r+','+c,{r,c,v:top.v,m:1})});
    const h=parseHorario(cells);if(h){h.folha=sh.getAttribute('name');out.push(h)}
  }
  return out;
}
function parseHorario(cells){
  const all=[...cells.values()];
  const get=(r,c)=>{const x=cells.get(r+','+c);return x?String(x.v).trim():''};
  const reDia=/^(segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado)/i;
  const porLinha={};all.forEach(x=>{if(reDia.test(x.v.trim()))(porLinha[x.r]=porLinha[x.r]||[]).push(x)});
  const hr=Object.keys(porLinha).map(Number).sort((a,b)=>new Set(porLinha[b].map(x=>diaIdx(x.v))).size-new Set(porLinha[a].map(x=>diaIdx(x.v))).size)[0];
  if(hr==null||new Set(porLinha[hr].map(x=>diaIdx(x.v))).size<3)return null;
  const dias=[];porLinha[hr].sort((a,b)=>a.c-b.c).forEach(x=>{const d=diaIdx(x.v);if(d&&!dias.find(y=>y.d===d))dias.push({d,c:x.c})});
  const maxC=Math.max(...all.map(x=>x.c));
  dias.forEach((d,i)=>{d.c2=i<dias.length-1?dias[i+1].c-1:maxC;d.sala=null;
    for(let r=hr+1;r<=hr+2&&d.sala==null;r++)for(let c=d.c;c<=d.c2;c++)if(/^sala$/i.test(get(r,c))){d.sala=c;break}});
  const reT=/(\d{1,2}[:hH]\d{2})\s*[\n\r\-–—a]+\s*(\d{1,2}[:hH]\d{2})/;
  const tcount={};all.forEach(x=>{if(x.r>hr&&reT.test(x.v))tcount[x.c]=(tcount[x.c]||0)+1});
  const tcol=Object.keys(tcount).sort((a,b)=>tcount[b]-tcount[a])[0];if(tcol==null)return null;const tc=+tcol;
  const legC=all.filter(x=>x.r>hr&&/^disciplina$/i.test(x.v.trim())&&all.some(y=>y.r===x.r&&/professor/i.test(y.v)));
  const legR=legC.length?Math.min(...legC.map(x=>x.r)):null;
  const fimR=legR!=null?legR:Math.max(...all.map(x=>x.r))+1;
  const aulas=[];let slot=null;
  for(let r=hr+1;r<fimR;r++){
    const m=get(r,tc).match(reT);if(m)slot={ini:hm(m[1]),fim:hm(m[2])};
    if(!slot)continue;
    dias.forEach(d=>{const ab=get(r,d.c);if(!ab||/^(disciplina|sala)$/i.test(ab)||reT.test(ab))return;
      const sala=d.sala!=null?get(r,d.sala):'';
      if(!aulas.some(a=>a.dia===d.d&&a.ini===slot.ini&&a.ab===ab))aulas.push({dia:d.d,ini:slot.ini,fim:slot.fim,ab,sala})});
  }
  const leg=[];
  if(legR!=null){
    const hc=all.filter(x=>x.r===legR&&!x.m).sort((a,b)=>a.c-b.c);
    const cD=(hc.find(x=>/^disciplina$/i.test(x.v.trim()))||{c:0}).c,cP=(hc.find(x=>/professor/i.test(x.v))||{c:99}).c;
    for(let r=legR+1;r<legR+60;r++){
      const row=all.filter(x=>x.r===r&&!x.m).sort((a,b)=>a.c-b.c);if(!row.length)continue;
      if(row.some(x=>/diretor/i.test(x.v)))break;
      const ab=get(r,cD);if(!ab)continue;
      const nome=row.find(x=>x.c>cD&&x.c<cP);const prof=row.find(x=>x.c>=cP);
      leg.push({ab,nome:nome?nome.v.trim():ab,profs:prof?prof.v.split(/;|\n/).map(x=>x.trim()).filter(Boolean):[]});
    }
  }
  let turma='';const tt=all.find(x=>/hor[aá]rio/i.test(x.v)&&/turma/i.test(x.v));
  if(tt)turma=detTurma(tt.v)||tt.v.replace(/.*turma\s*:?\s*/i,'').trim();
  if(!turma){const x=all.find(x=>x.r<hr&&detTurma(x.v));if(x)turma=detTurma(x.v)}
  let diretor='';const dr=all.find(x=>/diretor/i.test(x.v)&&!x.m);
  if(dr){const nx=all.filter(x=>x.r===dr.r&&x.c>dr.c&&!x.m&&x.v.trim()).sort((a,b)=>a.c-b.c)[0];if(nx)diretor=nx.v.trim()}
  aulas.sort((a,b)=>a.dia-b.dia||a.ini-b.ini);
  return aulas.length?{turma,aulas,legenda:leg,diretor}:null;
}
/* que siglas do horário correspondem à disciplina (prefere as do próprio professor) */
const mesmoNome=(a,b)=>{const x=normT(a).replace(/[^a-z ]/g,' ').split(' ').filter(w=>w.length>1),y=normT(b).replace(/[^a-z ]/g,' ').split(' ').filter(w=>w.length>1);
  return !!x.length&&!!y.length&&x[0]===y[0]&&x[x.length-1]===y[y.length-1]};
function siglasDaDisciplina(h,disc){
  const d=normT(disc).replace(/\(.*\)/,'').trim();if(!h||!d)return [];
  const cand=h.legenda.filter(l=>{const n=normT(l.nome);return n===d||n.includes(d)||d.includes(n)||normT(l.ab)===d});
  const prof=S.cfg.professor;const meus=cand.filter(l=>prof&&l.profs.some(p=>mesmoNome(p,prof)));
  return (meus.length?meus:cand).map(l=>l.ab);
}
function siglasDoProfessor(h){const prof=S.cfg.professor;return prof&&h?h.legenda.filter(l=>l.profs.some(p=>mesmoNome(p,prof))):[]}
const horarioDe=(a,nome)=>{const H=(a||{}).horarios||{};const k=Object.keys(H).find(k=>normTurma(k)===normTurma(nome));return k?H[k]:null};
const turmasDaClasse=t=>t.origens||[t.nome];
/* aulas da turma·disciplina */
function comEscola(id,fn){const ant=S.escolaAtiva;S.escolaAtiva=id;try{return fn()}finally{S.escolaAtiva=ant}}
function aulasTurma(t,a){const e=escId(escolaDe(t));if(e!==escAtiva())return comEscola(e,()=>aulasTurma0(t,a));return aulasTurma0(t,a)}
function aulasTurma0(t,a){
  a=a||A();const out=[];
  turmasDaClasse(t).forEach(c=>{const h=horarioDe(a,c);if(!h)return;
    const sig=t.horAbs&&t.horAbs.length?t.horAbs:siglasDaDisciplina(h,t.disciplina);
    h.aulas.filter(x=>sig.includes(x.ab)).forEach(x=>{if(!out.some(o=>o.dia===x.dia&&o.ini===x.ini&&o.ab===x.ab))out.push({...x,classe:c})})});
  // o horário do professor (PDF), quando associado a esta turma, tem prioridade: diz exatamente quando o professor tem aula
  const P_=aulasProfTurma(t,a);if(P_.length){const o2=[];P_.forEach(x=>{if(!o2.some(o=>o.dia===x.dia&&o.ini===x.ini))o2.push(x)});return o2.sort((x,y)=>x.dia-y.dia||x.ini-y.ini)}
  return out.sort((x,y)=>x.dia-y.dia||x.ini-y.ini);
}
/* junta tempos seguidos da mesma disciplina/sala num bloco (ex.: 08:30–10:00) */
function blocos(aulas){
  const L=aulas.slice().sort((x,y)=>x.dia-y.dia||x.ini-y.ini);const out=[];
  L.forEach(x=>{const p=out[out.length-1];if(p&&p.dia===x.dia&&p.ab===x.ab&&p.sala===x.sala&&x.ini-p.fim<=5&&x.ini>=p.ini){p.fim=x.fim;p.tempos++}else out.push({...x,tempos:1})});
  return out;
}
/* próximas aulas a partir de agora */
function proximasAulas(aulas,n,desde,t){
  const B=blocos(aulas);if(!B.length)return [];
  const agora=desde||new Date();const out=[];
  for(let k=0;k<(CAL()?240:70)&&out.length<(n||1);k++){
    const d=new Date(agora.getFullYear(),agora.getMonth(),agora.getDate()+k);const dow=d.getDay();
    const mins=agora.getHours()*60+agora.getMinutes();
    const temC=!!CAL();const iso=isoData(d);
    blocosDiaP(B,d,t).filter(b=>b.dia===dow&&(k>0||b.fim>mins)&&(!temC||letivoPara(b.t||t,iso))).forEach(b=>{if(out.length<(n||1))out.push({...b,data:d,agora:k===0&&b.ini<=mins,k})});
  }
  return out;
}
function quando(p){if(!p)return '';const d=p.data;const dd=String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
  return (p.agora?'Agora':p.k===0?'Hoje':p.k===1?'Amanhã':DIAS_C[d.getDay()]+', '+dd)+' · '+fmtHM(p.ini)+'–'+fmtHM(p.fim)+(p.sala?' · Sala '+p.sala:'')}
const isoData=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function proxAulaHtml(t){const p=proximasAulas(aulasTurma(t),1,null,t)[0];return p?`<span class="prox ${p.agora?'now':''}">${ic('calendar',13)} ${p.agora?'Aula a decorrer':'Próxima aula'}: <b>${esc(quando(p))}</b></span>`:''}
/* ---------- diálogo de importação ---------- */
const pickHorarios=cb=>{const f=$('#horIn');f.value='';f.onchange=async()=>{const fs=[...f.files];if(!fs.length)return;ocupado('A ler '+fs.length+' horário'+(fs.length>1?'s':'')+'…');
  const res=[];for(const file of fs){try{const hs=await lerHorarioXlsx(file);hs.forEach(h=>{h.ficheiro=file.name;res.push(h)});if(!hs.length)res.push({erro:true,ficheiro:file.name})}catch(e){res.push({erro:true,ficheiro:file.name,msg:e.message})}}
  livre();cb(res)};f.click()};
function importarHorariosDlg(res){
  const a=A();const ok=res.filter(h=>!h.erro);
  openDrawer('Importar Horários',`<div class="ed">
    ${res.filter(h=>h.erro).map(h=>`<div class="alert w">${ic('alert',15)} ${esc(h.ficheiro)}: não encontrei um horário de turma${h.msg?' ('+esc(h.msg)+')':''}.</div>`).join('')}
    ${ok.length?`<p class="hint" style="margin-top:0">Os horários ficam associados às turmas com o mesmo nome. As aulas da sua disciplina são reconhecidas pela legenda (nome da disciplina e professor).</p>
    <table class="lst"><thead><tr><th>Turma</th><th>Tempos da Turma</th><th>Turmas na App</th><th>As suas disciplinas</th><th>Diretor(a) de Turma</th></tr></thead><tbody>
    ${ok.map(h=>{const lig=a.turmas.filter(t=>turmasDaClasse(t).some(c=>normTurma(c)===normTurma(h.turma)));const meus=siglasDoProfessor(h);
      return `<tr><td><b>${esc(h.turma||'?')}</b><div class="hint">${esc(h.ficheiro)}</div></td><td>${h.aulas.length}</td>
      <td>${lig.length?lig.map(t=>`<span class="tag">${esc(t.nome)} · ${esc(t.disciplina)}</span> <span class="mut" style="font-size:12px">${esc(siglasDaDisciplina(h,t.disciplina).join(', ')||'—')}</span>`).join('<br>'):'<span class="mut">ainda sem turma com este nome</span>'}</td>
      <td>${meus.length?meus.map(l=>`<span class="tag">${esc(l.ab)}</span> ${esc(l.nome)}`).join('<br>'):'<span class="mut">—</span>'}</td><td>${esc(h.diretor||'—')}</td></tr>`}).join('')}
    </tbody></table>
    ${!S.cfg.professor?`<div class="alert w">Indique o seu nome em Definições para a app reconhecer automaticamente as suas aulas.</div>`:''}
    <div class="row" style="margin-top:14px"><button class="btn pri" id="h-ok">${ic('check',15)} Guardar Horários</button></div>`:''}</div>`);
  const b=$('#h-ok');if(b)b.onclick=()=>{a.horarios=a.horarios||{};
    ok.forEach(h=>{const k=Object.keys(a.horarios).find(k=>normTurma(k)===normTurma(h.turma))||h.turma;a.horarios[k]={turma:h.turma,aulas:h.aulas,legenda:h.legenda,diretor:h.diretor,ficheiro:h.ficheiro,importado:new Date().toISOString()}});
    regista('Horários das turmas (Excel)',ok.map(h=>h.ficheiro).join(', '),ok.map(h=>h.turma).join(', '));saveNow();closeDrawer();go(VIEW);toast(ok.length+' horário'+(ok.length>1?'s':'')+' guardado'+(ok.length>1?'s':''))};
}
/* ---------- grelha semanal ---------- */
function grelhaSemanal(aulas,opts){
  opts=opts||{};if(!aulas.length)return '<div class="empty">Sem aulas.</div>';
  const dias=[...new Set(aulas.map(a=>a.dia))].sort();const ds=dias.length?[1,2,3,4,5,...(dias.includes(6)?[6]:[])]:[1,2,3,4,5];
  const slots=[];[...(opts.slots||[]),...aulas].forEach(a=>{if(!slots.some(s=>s.ini===a.ini))slots.push({ini:a.ini,fim:a.fim})});slots.sort((x,y)=>x.ini-y.ini);
  if(opts.semVazias){for(let i=slots.length-1;i>=0;i--)if(!aulas.some(a=>a.ini===slots[i].ini))slots.splice(i,1)}
  const hoje=new Date().getDay(),mins=new Date().getHours()*60+new Date().getMinutes();
  return `<div style="overflow:auto"><table class="hor"><thead><tr><th class="tm"></th>${ds.map(d=>`<th class="${d===hoje?'hj':''}">${DIAS[d]}</th>`).join('')}</tr></thead><tbody>
  ${slots.map((s,i)=>`${i&&s.ini-slots[i-1].fim>=15?`<tr class="pausa"><td colspan="${ds.length+1}"></td></tr>`:''}<tr><td class="tm">${fmtHM(s.ini)}<br><span>${fmtHM(s.fim)}</span></td>
    ${ds.map(d=>{const L=aulas.filter(a=>a.dia===d&&a.ini===s.ini);const now=d===hoje&&s.ini<=mins&&s.fim>mins;
      return `<td class="${d===hoje?'hj':''} ${now?'agora':''}" data-cel="${d}|${s.ini}">${L.map(a=>{const m=opts.minha?opts.minha(a):false;return `<div class="aula ${m?'minha':''} ${opts.cls?opts.cls(a):''}" ${opts.attr?opts.attr(a):''} style="${opts.cor&&opts.cor(a)?'--ac:'+opts.cor(a):''}" title="${esc((opts.titulo?opts.titulo(a):a.ab)+(a.sala?' · Sala '+a.sala:''))}"><b>${esc(opts.rotulo?opts.rotulo(a):a.ab)}</b>${a.sala?`<span>${esc(a.sala)}</span>`:''}</div>`}).join('')}</td>`}).join('')}</tr>`).join('')}
  </tbody></table></div>`;
}
/* ---------- vista: horário da turma ---------- */
function apagarHorarioTurma(t,a){
  const cls=turmasDaClasse(t);const ks=Object.keys(a.horarios||{}).filter(k=>cls.some(c=>normTurma(c)===normTurma(k)));const H=a.horProf;const pk=H?Object.keys(H.mapa||{}).filter(k=>H.mapa[k]===t.id):[];
  if(!ks.length&&!pk.length)return toast('Esta turma não tem horário.');
  openDrawer('Apagar Horário — '+t.nome,`<div class="ed"><p class="hint" style="margin-top:0">Escolha o que quer apagar. As avaliações, alunos e faltas mantêm-se.</p>
    ${ks.map(k=>`<label class="chk"><input type="checkbox" data-hk="${esc(k)}" checked> Horário da turma ${esc(k)} <span class="mut">(${a.horarios[k].aulas.length} tempos, ${esc(a.horarios[k].ficheiro||'')})</span></label>`).join('')}
    ${pk.length?`<label class="chk"><input type="checkbox" id="hx-p" ${ks.length?'':'checked'}> Desassociar das aulas do Meu Horário (PDF)</label>`:''}
    <div class="row" style="margin-top:16px"><button class="btn dng" id="hx-ok">${ic('trash',15)} Apagar</button></div></div>`);
  $('#hx-ok').onclick=()=>{$$('[data-hk]').forEach(c=>{if(c.checked)delete a.horarios[c.dataset.hk]});const p=$('#hx-p');if(p&&p.checked)pk.forEach(k=>H.mapa[k]='');saveNow();closeDrawer();go(VIEW);toast('Horário apagado')};
}
function apagarMeuHorarioDlg(){
  const a=A();const NLp=(a.naoLetivos||[]).filter(x=>x.origem==='pdf').length,NLm=(a.naoLetivos||[]).filter(x=>x.origem!=='pdf').length,nH=Object.keys(a.horarios||{}).length;
  if(!a.horProf&&!NLp&&!NLm&&!nH)return toast('Não há horários para apagar.');
  openDrawer('Apagar Horários',`<div class="ed"><p class="hint" style="margin-top:0">Escolha o que quer apagar neste ano letivo (${esc(a.nome)}). Não é possível desfazer.</p>
    ${a.horProf?`<label class="chk"><input type="checkbox" id="ax-p" checked> O Meu Horário (PDF) — ${a.horProf.aulas.length} tempos letivos e associações às turmas</label>`:''}
    ${NLp?`<label class="chk"><input type="checkbox" id="ax-np" checked> Tempos não letivos importados do PDF (${NLp})</label>`:''}
    ${NLm?`<label class="chk"><input type="checkbox" id="ax-nm"> Tempos não letivos acrescentados à mão (${NLm})</label>`:''}
    ${nH?`<label class="chk"><input type="checkbox" id="ax-h"> Horários das turmas (${nH}: ${Object.keys(a.horarios).map(esc).join(', ')})</label>`:''}
    <div class="row" style="margin-top:16px"><button class="btn dng" id="ax-ok">${ic('trash',15)} Apagar Selecionados</button></div></div>`);
  $('#ax-ok').onclick=()=>{const c=id=>{const e=$('#'+id);return e&&e.checked};if(!['ax-p','ax-np','ax-nm','ax-h'].some(c))return alert('Escolha pelo menos uma opção.');if(!confirm('Apagar os itens selecionados?'))return;
    if(c('ax-p'))delete a.horProf;if(c('ax-np'))a.naoLetivos=a.naoLetivos.filter(x=>x.origem!=='pdf');if(c('ax-nm'))a.naoLetivos=a.naoLetivos.filter(x=>x.origem==='pdf');if(c('ax-h'))a.horarios={};
    saveNow();closeDrawer();go('meuhorario');toast('Apagado')};
}
function vHorario(){
  const t=T(),a=A();const cls=turmasDaClasse(t);UI.horC=cls.includes(UI.horC)?UI.horC:cls[0];
  barBtns([{id:'b-hi',t:'Importar Horários…',f:()=>pickHorarios(importarHorariosDlg)},{id:'b-hx',t:ic('calx',15)+' Apagar Horário',c:'dng',f:()=>apagarHorarioTurma(t,a)},{id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  const h=horarioDe(a,UI.horC);const minhas=aulasTurma(t);const prox=proximasAulas(minhas,4,null,t);
  const sig=h?(t.horAbs&&t.horAbs.length?t.horAbs:siglasDaDisciplina(h,t.disciplina)):[];
  const tempos=minhas.length;
  $('#view').innerHTML=h?`
  <div class="kpis">
    <div class="kpi"><div class="l">${ic('calendar',14)} Próxima aula</div><div class="v" style="font-size:19px">${prox[0]?esc((prox[0].agora?'Agora':prox[0].k===0?'Hoje':prox[0].k===1?'Amanhã':DIAS[prox[0].data.getDay()])+' '+fmtHM(prox[0].ini)):'—'}</div><div class="mut">${prox[0]?esc(fmtHM(prox[0].ini)+'–'+fmtHM(prox[0].fim)+(prox[0].sala?' · Sala '+prox[0].sala:'')):''}</div></div>
    <div class="kpi"><div class="l">${ic('clipboard',14)} Tempos semanais (${esc(t.disciplina)})</div><div class="v">${tempos}</div><div class="mut">${blocos(minhas).length} aulas por semana</div></div>
    ${(()=>{const c=CAL();const r=c&&resumoPeriodoAtual(c,t);if(!r||r.estado==='fim')return '';const fim=r.p.fim;const L=proximasAulas(minhas,400,null,t).filter(p=>isoData(p.data)<=fim);
      return `<div class="kpi"><div class="l">${ic('calcheck',14)} Até ao Fim do ${r.p.n}.º ${esc(r.W)}</div><div class="v">${L.length}</div><div class="mut">${L.reduce((s,p)=>s+p.tempos,0)} tempos · até ${esc(fmtIsoL(fim))}</div></div>`})()}
    <div class="kpi"><div class="l">${ic('crown',14)} ${tituloDT(h.diretor)}${h.turma?' do '+esc(h.turma):''}</div><div class="v vt">${esc(h.diretor?profNome(h.diretor):'—')}</div><div class="mut">${souDT(A(),h.turma)?'<b style="color:var(--acc)">É você — é '+tituloDT(S.cfg.professor,false)+' desta turma</b>':(h.diretor?contEmailHtml(h.diretor):'')}</div></div>
  </div>
  <div class="card wide"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Horário da Turma ${esc(UI.horC)}</h2>${cls.length>1?`<div class="tabs" style="margin:0">${cls.map(c=>`<button data-hc="${esc(c)}" class="${c===UI.horC?'on':''}">${esc(c)}</button>`).join('')}</div>`:''}<span class="sp1"></span>
    <span class="leg"><span class="aula minha mini"></span> ${esc(t.disciplina)}</span><button class="btn sm dng hdel" id="h-del">${ic('calx',15)} Apagar Horário</button></div>
    ${grelhaSemanal(h.aulas,{minha:x=>sig.includes(x.ab)&&(!minhas.some(m=>m.prof)||minhas.some(m=>m.dia===x.dia&&m.ini===x.ini)),titulo:x=>{const l=h.legenda.find(l=>l.ab===x.ab);return l?l.nome+(l.profs.length?' — '+l.profs.join(', '):''):x.ab}})}
  </div>
  <div class="card"><h2>Disciplina Nesta Turma</h2><p class="hint" style="margin-top:0">Assinale as siglas do horário que correspondem a <b>${esc(t.disciplina)}</b> (reconhecidas automaticamente pelo nome da disciplina${S.cfg.professor?' e pelo seu nome':''}).</p>
    <div class="sigs">${h.legenda.map(l=>`<label class="sig ${sig.includes(l.ab)?'on':''}"><input type="checkbox" data-sig="${esc(l.ab)}" ${sig.includes(l.ab)?'checked':''}><b>${esc(l.ab)}</b> ${esc(l.nome)}<span class="mut">${esc(l.profs.join(', '))}</span></label>`).join('')}</div>
    ${t.horAbs&&t.horAbs.length?'<button class="btn sm" id="sig-auto" style="margin-top:8px">Voltar ao Reconhecimento Automático</button>':''}</div>
  ${(()=>{const r=aulasPrevistas(t,a);if(!r)return CAL()?'':`<div class="card"><h2>Aulas Previstas</h2><p class="hint" style="margin:0">Importe ou crie o <a href="#" id="go-cal">calendário escolar</a> para calcular as aulas previstas por ${perW().toLowerCase()}.</p></div>`;const W=perW();const hj=isoData(new Date());
    return `<div class="card"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Aulas Previstas</h2><span class="sp1"></span><button class="btn sm" id="pv-det">Detalhe</button></div><div class="pvn">${r.P.map(p=>`<div class="${hj>=p.ini&&hj<=p.fim?'on':''}"><b>${p.tempos}</b><span>${p.n}.º ${W}</span><span class="mut">${p.aulas} aulas</span>${hj>=p.ini&&hj<=p.fim?`<span class="mut">${p.tDadas} dados · faltam ${porDar(p)}${p.tFaltas?' · '+p.tFaltas+' F':''}</span>`:''}</div>`).join('')}<div><b>${r.tot.tempos}</b><span>Total de Tempos</span><span class="mut">${r.tot.tDadas} dados</span></div></div></div>`})()}
  ${prox.length?`<div class="card"><h2>Próximas Aulas</h2>${prox.map(p=>`<div class="lin">${ic('calendar',15)} ${esc(quando(p))}</div>`).join('')}</div>`:''}`
  :minhas.length?`<div class="kpis"><div class="kpi"><div class="l">${ic('calendar',14)} Próxima Aula</div><div class="v" style="font-size:19px">${prox[0]?esc(quando(prox[0]).split(' · ')[0]+' '+fmtHM(prox[0].ini)):'—'}</div><div class="mut">${prox[0]&&prox[0].sala?'Sala '+esc(prox[0].sala):''}</div></div><div class="kpi"><div class="l">${ic('clipboard',14)} Tempos Semanais (${esc(t.disciplina)})</div><div class="v">${minhas.length}</div><div class="mut">${blocos(minhas).length} aulas por semana</div></div></div>
  <div class="card wide"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">As Suas Aulas em ${esc(t.nome)}</h2><span class="sp1"></span><span class="mut">Do seu horário (PDF) · sem horário da turma</span></div>${grelhaSemanal(minhas,{minha:()=>true,rotulo:x=>x.ab})}</div>
  ${(()=>{const r=aulasPrevistas(t,a);if(!r)return '';const W=perW();return `<div class="card"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Aulas Previstas</h2><span class="sp1"></span><button class="btn sm" id="pv-det">Detalhe</button></div><div class="pvn">${r.P.map(p=>`<div><b>${p.tempos}</b><span>${p.n}.º ${W}</span><span class="mut">${p.aulas} aulas</span></div>`).join('')}<div><b>${r.tot.tempos}</b><span>Total de Tempos</span></div></div></div>`})()}
  ${prox.length?`<div class="card"><h2>Próximas Aulas</h2>${prox.map(p=>`<div class="lin">${ic('calendar',15)} ${esc(quando(p))}</div>`).join('')}</div>`:''}`
  :`<div class="card empty">${ic('calendar',28)}<br><b>Ainda não há horário para ${esc(cls.join(' e '))}</b><br><span class="mut">Importe o horário da turma a partir do Excel exportado do programa de gestão da escola. As aulas, salas e turnos ficam associados automaticamente.</span><br><br><button class="btn pri" id="h-imp">${ic('upload',17)} Importar Horário (Excel)</button></div>`;
  $$('[data-hc]').forEach(b=>b.onclick=()=>{UI.horC=b.dataset.hc;vHorario()});
  $$('[data-sig]').forEach(el=>el.onchange=()=>{const cur=new Set(sig);if(el.checked)cur.add(el.dataset.sig);else cur.delete(el.dataset.sig);t.horAbs=[...cur];save();vHorario()});
  const sa=$('#sig-auto');if(sa)sa.onclick=()=>{delete t.horAbs;save();vHorario()};
  const hi=$('#h-imp');if(hi)hi.onclick=()=>pickHorarios(importarHorariosDlg);
  const hd=$('#h-del');if(hd)hd.onclick=()=>apagarHorarioTurma(t,a);
  const pd=$('#pv-det');if(pd)pd.onclick=()=>prevDetalheDlg(t);const gc=$('#go-cal');if(gc)gc.onclick=e=>{e.preventDefault();go('calendario')};
}
/* =====================================================================
   HORÁRIO DO PROFESSOR (PDF) E TEMPOS NÃO LETIVOS
   A().horProf = {ficheiro, docente, aulas:[{dia,ini,fim,turma,sig,sala}], linhas:[{ini,fim}], obs:[], mapa:{chave:turmaId|''}}
   A().naoLetivos = [{id,g,dia,ini,fim,sig,nome,sala,obs,origem}]
   ===================================================================== */
const normSig=s=>normT(s).replace(/[^a-z0-9]/g,'');
const NL_CAT=[
  {sig:'DT',n:'Direção de Turma',cor:'#7a4fd0'},
  {sig:'DT-AP',n:'Direção de Turma — Atendimento',cor:'#9a6ad6'},
  {sig:'CNL-E',n:'Componente Não Letiva de Estabelecimento',cor:'#0f8b8d'},
  {sig:'CNL-E/s',n:'Atividades Colaborativas / Projetos',cor:'#2a9d8f'},
  {sig:'Biblioteca',n:'Biblioteca',cor:'#b0457b'},
  {sig:'Tutoria',n:'Tutoria',cor:'#d98b00'},
  {sig:'Clube',n:'Clube',cor:'#c0392b'},
  {sig:'Apoio',n:'Apoio Educativo',cor:'#1a7f37'},
  {sig:'Coadj.',n:'Coadjuvação',cor:'#2f7fd0'},
  {sig:'Reunião',n:'Reunião',cor:'#5b6b7f'}
];
const NL_PAL=['#7a4fd0','#0f8b8d','#b0457b','#d98b00','#c0392b','#1a7f37','#5b6b7f','#2a9d8f'];
const nlTipos=()=>(S.cfg&&S.cfg.nlTipos)||NL_CAT;
function corNL(sig){const c=nlTipos().find(x=>normSig(x.sig)===normSig(sig));if(c)return c.cor;let h=0;for(const ch of normSig(sig))h=(h*31+ch.charCodeAt(0))>>>0;return NL_PAL[h%NL_PAL.length]}
function nomeNL(sig,obsMap){const k=normSig(sig);if(obsMap&&obsMap[k])return obsMap[k];const c=nlTipos().find(x=>normSig(x.sig)===k);return c?c.n:sig}
const chaveAula=x=>normTurma(x.turma)+'|'+normSig(x.sig);
const siglaCasa=(sig,disc)=>{const s=normSig(sig),d=normSig(disc);return s.length>=2&&(d.startsWith(s)||normSig((disc||'').split(/\s+/).map(w=>w[0]).join(''))===s)};
async function lerHorarioProfPdf(file){
  const lib=await getPdfLib();const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;const RES=[];
  for(let pn=1;pn<=doc.numPages;pn++){
    const page=await doc.getPage(pn);const tc=await page.getTextContent();
    const items=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>{const t=i.transform;const h=Math.hypot(t[2],t[3])||8;return {s:i.str.replace(/\s+/g,' ').trim(),x:t[4],y:t[5],w:i.width||0,h,cx:t[4]+(i.width||0)/2,cy:t[5]+h*0.35}});
    const seg=items.find(i=>normT(i.s)==='segunda');if(!seg)continue;
    const DN={segunda:1,terca:2,quarta:3,quinta:4,sexta:5,sabado:6};
    const hdr=items.filter(i=>Math.abs(i.y-seg.y)<2).map(i=>({...i,k:normT(i.s)})).filter(i=>DN[i.k]||i.k==='sala'||i.k==='tempos').sort((a,b)=>a.cx-b.cx);
    const RE_T=/^(\d{1,2})[:hH.](\d{2})\s*[-–]\s*(\d{1,2})[:hH.](\d{2})$/;
    const linhas=items.filter(i=>i.y<seg.y&&RE_T.test(i.s)).map(i=>{const m=i.s.match(RE_T);return {ini:+m[1]*60+ +m[2],fim:+m[3]*60+ +m[4],cy:i.cy,x:i.x+i.w}}).sort((a,b)=>b.cy-a.cy);
    if(linhas.length<3)continue;
    const yMin=linhas[linhas.length-1].cy-(linhas[0].cy-linhas[1].cy);const xMin=Math.max(...linhas.map(l=>l.x));
    const grupos={};
    items.forEach(i=>{if(i.y>=seg.y-1||i.cy<yMin||i.x<xMin-2||RE_T.test(i.s))return;
      let hi=0,bd=1e9;hdr.forEach((hh,k)=>{const d=Math.abs(hh.cx-i.cx);if(d<bd){bd=d;hi=k}});const H=hdr[hi];if(!H||H.k==='tempos')return;
      let dia,sala=false;if(H.k==='sala'){sala=true;const L=hdr.slice(0,hi).reverse().find(h=>DN[h.k]);if(!L)return;dia=DN[L.k]}else dia=DN[H.k];
      let r0=0,d0=1e9;linhas.forEach((l,k)=>{const d=Math.abs(l.cy-i.cy);if(d<d0){d0=d;r0=k}});
      let rows=[r0];for(let k=0;k<linhas.length-1;k++){const mid=(linhas[k].cy+linhas[k+1].cy)/2;const d=Math.abs(mid-i.cy);if(d<d0*0.8&&d<(linhas[k].cy-linhas[k+1].cy)*0.25){rows=[k,k+1];d0=d}}
      const key=dia+':'+rows.join(',');const g=grupos[key]=grupos[key]||{dia,rows,txt:[],sala:[]};(sala?g.sala:g.txt).push(i)});
    const aulas=[],nl=[];
    Object.values(grupos).forEach(g=>{if(!g.txt.length)return;
      const t=g.txt.sort((a,b)=>b.cy-a.cy||a.x-b.x).map(i=>i.s).join(' ').replace(/\s+/g,' ').trim();const sala=g.sala.map(i=>i.s).join(' ').trim();
      const m=t.match(/^(.*?)\s*\.\s+(.+?)\.?$/)||t.match(/^\s*\.\s*(.+?)\.?$/)&&[null,'',t.replace(/^\s*\.\s*/,'').replace(/\.$/,'')];
      const turma=m?(m[1]||'').trim():'',sig=(m?m[2]:t).replace(/\.$/,'').trim();const gid=uid();
      g.rows.forEach(r=>{const L=linhas[r];const o={dia:g.dia,ini:L.ini,fim:L.fim,sig,sala};if(turma)aulas.push({...o,turma});else nl.push({...o,g:gid})})});
    // observações (legenda das siglas)
    const ob=items.find(i=>/^observa[cç][oõ]es/i.test(i.s));const obs=[],obsMap={};
    if(ob)items.filter(i=>i.y<ob.y-1).sort((a,b)=>b.y-a.y||a.x-b.x).forEach(i=>{obs.push(i.s);const mm=i.s.match(/^(.*?)\s*-\s+(.+)$/);if(mm&&mm[1].length<=30){const d=mm[2].trim();obsMap[normSig(mm[1])]=d.charAt(0).toUpperCase()+d.slice(1)}});
    nl.forEach(x=>x.nome=nomeNL(x.sig,obsMap));
    const val=(lbl)=>{const L=items.find(i=>normT(i.s)===normT(lbl));if(!L)return '';const R=items.filter(i=>Math.abs(i.y-L.y)<2&&i.x>L.x+L.w-1).sort((a,b)=>a.x-b.x)[0];return R?R.s:''};
    const txt=items.map(i=>i.s).join(' ');const am=txt.match(/(\d{4})\s*[-\/]\s*(\d{4})/);
    const esc_=items.slice().sort((a,b)=>b.h-a.h||b.y-a.y)[0];
    let preview='';if(!RES.length)try{const vp=page.getViewport({scale:1.25});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await page.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;preview=cv.toDataURL('image/jpeg',.7)}catch(_){}
    RES.push({ficheiro:file.name,docente:val('Docente:'),grupo:val('Grupo:'),escola:esc_&&/escola|agrupamento/i.test(esc_.s)?esc_.s:'',ano:am?am[1]+'/'+am[2]:'',preview,
      linhas:linhas.map(l=>({ini:l.ini,fim:l.fim})),aulas,naoLetivos:nl,obs,obsMap});
  }
  if(!RES.length)throw new Error('Não encontrei a grelha do horário (cabeçalho Tempos / Segunda / Sala…).');
  // várias páginas (ex.: semanas A/B ou continuação): junta tudo, sem repetir tempos
  const r=RES[0];RES.slice(1).forEach(x=>{x.aulas.forEach(a=>{if(!r.aulas.some(b=>b.dia===a.dia&&b.ini===a.ini&&b.turma===a.turma))r.aulas.push(a)});x.naoLetivos.forEach(a=>{if(!r.naoLetivos.some(b=>b.dia===a.dia&&b.ini===a.ini))r.naoLetivos.push(a)});
    x.linhas.forEach(l=>{if(!r.linhas.some(m=>m.ini===l.ini))r.linhas.push(l)});x.obs.forEach(o=>{if(!r.obs.includes(o))r.obs.push(o)});Object.assign(r.obsMap,x.obsMap)});
  r.paginas=RES.length;r.aulas.sort((a,b)=>a.dia-b.dia||a.ini-b.ini);r.naoLetivos.sort((a,b)=>a.dia-b.dia||a.ini-b.ini);r.linhas.sort((a,b)=>a.ini-b.ini);return r;
}
const escolaTitulo=s=>s&&s===s.toUpperCase()?s.toLowerCase().replace(/(^|\s)(\S)/g,(m,a,b)=>a+b.toUpperCase()).replace(/\b(De|Da|Do|Das|Dos|E)\b/g,w=>w.toLowerCase()):s;
function mapaAuto(a,aulas){const m={};aulas.forEach(x=>{const k=chaveAula(x);if(k in m)return;
  const t=a.turmas.find(t=>turmasDaClasse(t).concat([t.nome]).some(c=>normTurma(c)===normTurma(x.turma))&&siglaCasa(x.sig,t.disciplina))||a.turmas.find(t=>normTurma(t.nome)===normTurma(x.turma)&&a.turmas.filter(u=>normTurma(u.nome)===normTurma(x.turma)).length===1);
  const t2=!t&&/^ufcd|^mod/i.test(x.sig)?a.turmas.find(q=>ofertaDe(q)==='profij'&&(normTurma(q.nome)===normTurma(x.turma)||normT(q.nome).replace(/\D/g,'')===normT(x.turma).replace(/\D/g,''))):null;
  m[k]=t?t.id:t2?t2.id:''});return m}
const pickHorProf=()=>{const f=$('#hpIn');f.value='';f.onchange=async()=>{const file=f.files[0];if(!file)return;ocupado('A ler '+file.name+'…');
  try{const r=await lerHorarioProfPdf(file);livre();importarHorProfDlg(r)}catch(e){livre();alert('Não foi possível ler o horário.\n\n'+e.message+'\n\nSugestão: '+sugestaoErro(e.message))}};f.click()};
function importarHorProfDlg(r){
  const a=A();const mapa=Object.assign(mapaAuto(a,r.aulas),(a.horProf&&a.horProf.mapa)||{});
  const dist=[];r.aulas.forEach(x=>{const k=chaveAula(x);const d=dist.find(d=>d.k===k);if(d)d.n++;else dist.push({k,turma:x.turma,sig:x.sig,n:1})});
  const nlG=[];r.naoLetivos.forEach(x=>{const d=nlG.find(d=>normSig(d.sig)===normSig(x.sig));if(d)d.n++;else nlG.push({sig:x.sig,nome:x.nome,n:1})});
  const difAno=r.ano&&r.ano!==a.nome;const temPdf=(a.naoLetivos||[]).some(x=>x.origem==='pdf');
  openDrawer('Importar o Meu Horário',`<div class="ed">
    <p class="hint" style="margin-top:0">${ic('file',14)} ${esc(r.ficheiro)}${r.docente?' · '+esc(r.docente):''}${r.ano?' · '+esc(r.ano):''}</p>
    ${difAno?`<div class="alert w">${ic('alert',15)} O horário é de ${esc(r.ano)} e o ano letivo ativo é ${esc(a.nome)}.</div>`:''}
    <div class="pvn" style="margin-bottom:14px"><div><b>${r.aulas.length}</b><span>Tempos Letivos</span></div><div><b>${r.naoLetivos.length}</b><span>Tempos Não Letivos</span></div><div><b>${r.aulas.length+r.naoLetivos.length}</b><span>Total Semanal</span></div></div>
    <h3>Tempos Não Letivos</h3>
    ${nlG.length?`<div class="nlg">${nlG.map(g=>`<div class="nlr"><span class="nlb" style="--nc:${corNL(g.sig)}">${esc(g.sig)}</span><span>${esc(g.nome)}</span><span class="mut">${g.n} tempo${g.n>1?'s':''}</span></div>`).join('')}</div>`:'<p class="mut">Nenhum tempo não letivo encontrado.</p>'}
    ${temPdf?`<label class="chk" style="margin-top:8px"><input type="checkbox" id="hp-sub" checked> Substituir os tempos não letivos importados antes (os acrescentados à mão mantêm-se)</label>`:''}
    <h3>Aulas e Turmas</h3><p class="hint" style="margin-top:0">Associe cada linha do horário a uma turma da app. As aulas associadas passam a ser as da turma (próxima aula, horário, aulas previstas), com prioridade sobre o horário da turma, porque indicam exatamente quando tem aula com ela.</p>
    ${dist.some(d=>!mapa[d.k])?`<div class="row" style="margin-bottom:8px"><button class="btn sm" id="hp-cria">${ic('plus',14)} Criar as turmas em falta (${dist.filter(d=>!mapa[d.k]).length})</button><span class="hint" style="margin:0">Cria turmas vazias com o nome e a disciplina do horário; os alunos importam-se depois.</span></div>`:''}
    <table class="lst"><thead><tr><th>No Horário</th><th class="num">Tempos</th><th>Turma na App</th></tr></thead><tbody>
    ${dist.map(d=>`<tr><td><b>${esc(d.turma)}</b> · ${esc(d.sig)}</td><td class="num">${d.n}</td><td><select data-hm="${esc(d.k)}"><option value="">— não associar —</option>${a.turmas.map(t=>`<option value="${t.id}" ${mapa[d.k]===t.id?'selected':''}>${esc(t.nome)} · ${esc(t.disciplina)}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table>
    ${r.obs.length?`<h3>Observações do Horário</h3><div class="hint">${r.obs.map(esc).join('<br>')}</div>`:''}
    ${r.preview?`<details class="pdfprev"><summary>${ic('file',14)} Ver o PDF lido${r.paginas>1?' ('+r.paginas+' páginas)':''}</summary><img src="${r.preview}" alt="Pré-visualização do PDF do horário"></details>`:''}
    <div class="row" style="margin-top:16px"><button class="btn pri" id="hp-ok">${ic('check',15)} Guardar o Meu Horário</button></div></div>`);
  const hc=$('#hp-cria');if(hc)hc.onclick=()=>{$$('[data-hm]').forEach(s=>mapa[s.dataset.hm]=s.value);const n=criarTurmasEmFalta(r,mapa);a.horProf=Object.assign(a.horProf||{},{mapa});toast(n+' turma'+(n!==1?'s':'')+' criada'+(n!==1?'s':''),'ok');importarHorProfDlg(r)};
  $('#hp-ok').onclick=()=>{
    $$('[data-hm]').forEach(s=>mapa[s.dataset.hm]=s.value);
    a.horProf={ficheiro:r.ficheiro,docente:r.docente,ano:r.ano,aulas:r.aulas,linhas:r.linhas,obs:r.obs,obsMap:r.obsMap,mapa,importado:new Date().toISOString()};
    const sub=$('#hp-sub');a.naoLetivos=(a.naoLetivos||[]).filter(x=>x.origem!=='pdf'||(sub&&!sub.checked));
    r.naoLetivos.forEach(x=>a.naoLetivos.push({id:uid(),g:x.g,dia:x.dia,ini:x.ini,fim:x.fim,sig:x.sig,nome:x.nome,sala:x.sala,obs:'',origem:'pdf'}));
    if(!S.cfg.escola&&r.escola)S.cfg.escola=escolaTitulo(r.escola);if(!S.cfg.grupo&&r.grupo)S.cfg.grupo=r.grupo;if(!S.cfg.professor&&r.docente)S.cfg.professor=r.docente;
    regista('Horário do professor (PDF)',r.ficheiro,r.aulas.length+' tempos letivos, '+r.naoLetivos.length+' não letivos');saveNow();closeDrawer();go('meuhorario');toast('Horário guardado · '+r.naoLetivos.length+' tempos não letivos','ok')};
}
/* aulas vindas do horário do professor, para uma turma */
function aulasProfTurma(t,a){a=a||A();const H=a&&a.horProf;if(!H)return [];
  return H.aulas.filter(x=>H.mapa[chaveAula(x)]===t.id).map(x=>({dia:x.dia,ini:x.ini,fim:x.fim,ab:x.sig,sala:x.sala,classe:x.turma,prof:true}))}
/* slots (tempos) conhecidos: horário do professor, horários das turmas ou padrão */
function slotsConhecidos(a){const L=[];const add=(i,f)=>{if(!L.some(s=>s.ini===i))L.push({ini:i,fim:f})};
  ((a.horProf||{}).linhas||[]).forEach(s=>add(s.ini,s.fim));
  Object.values(a.horarios||{}).forEach(h=>h.aulas.forEach(x=>add(x.ini,x.fim)));
  if(!L.length)[[510,555],[555,600],[620,665],[665,710],[720,765],[765,810],[825,870],[870,915],[930,975],[975,1020]].forEach(([i,f])=>add(i,f));
  return L.sort((x,y)=>x.ini-y.ini)}
/* ---------- arrastar tempos não letivos na grelha (rato ou dedo) ---------- */
function ativarArrastoNL(tab){
  if(!tab)return;let st=null;
  const alvo=(x,y)=>{const el=document.elementFromPoint(x,y);return el&&el.closest?el.closest('td[data-cel]'):null};
  tab.querySelectorAll('.aula.nl[data-nid]').forEach(el=>{
    el.addEventListener('pointerdown',e=>{if(e.button>0)return;st={el,id:el.dataset.nid,x:e.clientX,y:e.clientY,on:false,td:null};try{el.setPointerCapture(e.pointerId)}catch(_){}});
    el.addEventListener('pointermove',e=>{if(!st||st.el!==el)return;
      if(!st.on){if(Math.hypot(e.clientX-st.x,e.clientY-st.y)<8)return;st.on=true;const r=el.getBoundingClientRect();
        st.gh=el.cloneNode(true);st.gh.classList.add('ghost');Object.assign(st.gh.style,{width:r.width+'px',left:r.left+'px',top:r.top+'px'});st.dx=e.clientX-r.left;st.dy=e.clientY-r.top;document.body.appendChild(st.gh);
        el.classList.add('drag-src');tab.classList.add('arrastar')}
      e.preventDefault();st.gh.style.left=(e.clientX-st.dx)+'px';st.gh.style.top=(e.clientY-st.dy)+'px';
      const td=alvo(e.clientX,e.clientY);if(td!==st.td){if(st.td)st.td.classList.remove('drop');st.td=td;if(td)td.classList.add('drop')}});
    const fim=e=>{if(!st||st.el!==el)return;const s_=st;st=null;if(!s_.on)return;
      s_.gh.remove();el.classList.remove('drag-src');tab.classList.remove('arrastar');if(s_.td)s_.td.classList.remove('drop');el._arrastou=true;setTimeout(()=>el._arrastou=false,400);
      const td=s_.td||alvo(e.clientX,e.clientY);if(!td)return;const [d,ini]=td.dataset.cel.split('|').map(Number);moverNL(s_.id,d,ini)};
    el.addEventListener('pointerup',fim);el.addEventListener('pointercancel',fim);
  });
}
function moverNL(id,dia,ini){
  const a=A();const x=(a.naoLetivos||[]).find(n=>n.id===id);if(!x)return;if(x.dia===dia&&x.ini===ini)return;
  const slots=slotsConhecidos(a);const ix=k=>slots.findIndex(s=>s.ini===k);const G=a.naoLetivos.filter(n=>n.g===x.g);
  const delta=ix(ini)-ix(x.ini);if(ix(ini)<0||ix(x.ini)<0)return;
  const novos=G.map(n=>{const k=ix(n.ini)+delta;return k>=0&&k<slots.length?{n,s:slots[k]}:null});
  if(novos.some(v=>!v))return toast('Não cabe nesse horário (passa do fim do dia).');
  const outrosNL=a.naoLetivos.filter(n=>n.g!==x.g);
  const aulasDia=[];turmasFiltradas(a).forEach(t=>aulasTurma(t,a).forEach(l=>aulasDia.push(l)));if(a.horProf)a.horProf.aulas.forEach(l=>aulasDia.push(l));
  const choque=novos.some(v=>outrosNL.some(o=>o.dia===dia&&o.ini===v.s.ini)||aulasDia.some(l=>l.dia===dia&&l.ini===v.s.ini));
  novos.forEach(v=>{v.n.dia=dia;v.n.ini=v.s.ini;v.n.fim=v.s.fim});
  saveNow();go('meuhorario');
  toast(x.sig+' → '+DIAS_C[dia]+' '+fmtHM(novos[0].s.ini)+'–'+fmtHM(novos[novos.length-1].s.fim)+(choque?' · atenção: sobrepõe-se a outro tempo':''));
}
/* ---------- tipos de tempo não letivo: acrescentar, editar, apagar ---------- */
function gerirTiposNL(depois){
  S.cfg.nlTipos=(S.cfg.nlTipos||NL_CAT).map(x=>({...x}));const L=S.cfg.nlTipos;const a=A();
  const usos=sig=>((a&&a.naoLetivos)||[]).filter(n=>normSig(n.sig)===normSig(sig)).length;
  const desenha=()=>{openDrawer('Tipos de Tempo Não Letivo',`<div class="ed">
    <p class="hint" style="margin-top:0">Estes tipos aparecem ao acrescentar tempos não letivos. Mudar a sigla aqui também a muda nos tempos já marcados.</p>
    <div class="tnl">${L.map((x,k)=>`<div class="tnlr" data-k="${k}"><input type="color" data-f="cor" value="${esc(x.cor)}" aria-label="Cor"><input data-f="sig" value="${esc(x.sig)}" placeholder="Sigla" class="tsig"><input data-f="n" value="${esc(x.n)}" placeholder="Designação"><span class="mut tu">${usos(x.sig)?usos(x.sig)+' t.':''}</span><button type="button" class="btn sm ico dng" data-del="${k}" aria-label="Apagar tipo">${ic('trash',15)}</button></div>`).join('')}</div>
    <div class="row" style="margin-top:12px"><button class="btn" id="tn-add">${ic('plus',15)} Novo Tipo</button><span class="sp1"></span><button class="btn sm" id="tn-rep">Repor predefinidos</button></div>
    ${depois?`<div class="row" style="margin-top:16px"><button class="btn pri" id="tn-ok">${ic('check',15)} Concluído</button></div>`:''}</div>`);
    $$('.tnlr [data-f]').forEach(el=>el.onchange=()=>{const k=+el.closest('.tnlr').dataset.k;const f=el.dataset.f;const old=L[k].sig;L[k][f]=el.value.trim()||L[k][f];
      if(f==='sig'&&a&&old!==L[k].sig)(a.naoLetivos||[]).forEach(n=>{if(normSig(n.sig)===normSig(old))n.sig=L[k].sig});save();if(f!=='cor')desenha()});
    $$('[data-del]').forEach(b=>b.onclick=()=>{const k=+b.dataset.del;const u=usos(L[k].sig);if(!confirm('Apagar o tipo '+L[k].sig+'?'+(u?'\nOs '+u+' tempos já marcados com esta sigla mantêm-se.':'')))return;L.splice(k,1);save();desenha()});
    $('#tn-add').onclick=()=>{L.push({sig:'Novo',n:'Novo tipo',cor:NL_PAL[L.length%NL_PAL.length]});save();desenha();const r=$$('.tnlr').pop();if(r){r.querySelector('.tsig').select()}};
    $('#tn-rep').onclick=()=>{if(confirm('Repor os tipos predefinidos?')){S.cfg.nlTipos=NL_CAT.map(x=>({...x}));L.length=0;L.push(...S.cfg.nlTipos);save();desenha()}};
    const ok=$('#tn-ok');if(ok)ok.onclick=()=>{depois()};
  };desenha();
}
function nlDlg(g){
  const a=A();a.naoLetivos=a.naoLetivos||[];const L=g?a.naoLetivos.filter(x=>x.g===g):[];const b=L[0]||{dia:1,sig:'',nome:'',sala:'',obs:''};
  const slots=slotsConhecidos(a);let dia=b.dia;let sel=new Set(L.map(x=>x.ini));const om=(a.horProf||{}).obsMap||{};
  openDrawer(g?'Editar Tempo Não Letivo':'Novo Tempo Não Letivo',`<div class="ed">
    <div class="row" style="margin-bottom:4px"><label style="margin:0">Tipo</label><span class="sp1"></span><a href="#" class="lnk" id="nl-gt">${ic('sliders',13)} Gerir tipos</a></div><div class="nlcat">${nlTipos().map(c=>`<button type="button" data-nc="${esc(c.sig)}" class="${normSig(c.sig)===normSig(b.sig)?'on':''}"><span class="nlb" style="--nc:${c.cor}">${esc(c.sig)}</span></button>`).join('')}</div>
    <div class="g2" style="margin-top:10px"><div><label>Sigla</label><input id="nl-sig" value="${esc(b.sig)}" placeholder="ex.: DT"></div><div><label>Designação</label><input id="nl-nome" value="${esc(b.nome)}" placeholder="ex.: Direção de Turma"></div></div>
    <label style="margin-top:10px">Dia</label><div class="seg" id="nl-dia">${[1,2,3,4,5].map(d=>`<button type="button" data-d="${d}" class="${d===dia?'on':''}">${DIAS_C[d]}</button>`).join('')}</div>
    <label style="margin-top:10px">Tempos</label><div class="nlslots">${slots.map(s=>`<button type="button" data-sl="${s.ini}" class="${sel.has(s.ini)?'on':''}">${fmtHM(s.ini)}–${fmtHM(s.fim)}</button>`).join('')}</div>
    <label style="margin-top:10px">Frequência</label><div class="seg" id="nl-freq">${[['','Todas as semanas'],['par','Semanas pares'],['impar','Semanas ímpares']].map(([k,l])=>`<button type="button" data-fq="${k}" class="${(b.freq||'')===k?'on':''}">${l}</button>`).join('')}</div><p class="hint" style="margin:4px 0 0">Esta semana é ${semanaISO(isoData(new Date()))%2===0?'par':'ímpar'} (semana ${semanaISO(isoData(new Date()))}).</p>
    <div class="g2" style="margin-top:10px"><div><label>Sala</label><input id="nl-sala" value="${esc(b.sala)}"></div><div><label>Observações</label><input id="nl-obs" value="${esc(b.obs||'')}" placeholder="ex.: 6.º A (Gonçalo e Ismael)"></div></div>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="nl-ok">${ic('check',15)} Guardar</button>${g?`<button class="btn dng" id="nl-del">${ic('trash',15)} Apagar</button>`:''}</div></div>`);
  $('#nl-gt').onclick=e=>{e.preventDefault();gerirTiposNL(()=>nlDlg(g))};
  $$('[data-nc]').forEach(x=>x.onclick=()=>{$$('[data-nc]').forEach(y=>y.classList.toggle('on',y===x));$('#nl-sig').value=x.dataset.nc;$('#nl-nome').value=nomeNL(x.dataset.nc,om)});
  $$('#nl-dia [data-d]').forEach(x=>x.onclick=()=>{dia=+x.dataset.d;$$('#nl-dia [data-d]').forEach(y=>y.classList.toggle('on',y===x))});
  let freq=b.freq||'';$$('#nl-freq [data-fq]').forEach(x=>x.onclick=()=>{freq=x.dataset.fq;$$('#nl-freq [data-fq]').forEach(y=>y.classList.toggle('on',y===x))});
  $$('[data-sl]').forEach(x=>x.onclick=()=>{const v=+x.dataset.sl;if(sel.has(v))sel.delete(v);else sel.add(v);x.classList.toggle('on',sel.has(v))});
  $('#nl-ok').onclick=()=>{const sig=$('#nl-sig').value.trim();if(!sig)return alert('Indique a sigla (ex.: DT).');if(!sel.size)return alert('Escolha pelo menos um tempo.');
    const gid=g||uid();const orig=L.length?L[0].origem:'manual';a.naoLetivos=a.naoLetivos.filter(x=>x.g!==gid);
    [...sel].sort((x,y)=>x-y).forEach(ini=>{const s=slots.find(s=>s.ini===ini);a.naoLetivos.push({id:uid(),g:gid,dia,ini,fim:s.fim,sig,nome:$('#nl-nome').value.trim()||nomeNL(sig,om),sala:$('#nl-sala').value.trim(),obs:$('#nl-obs').value.trim(),freq,origem:orig})});
    saveNow();closeDrawer();go('meuhorario')};
  const d=$('#nl-del');if(d)d.onclick=()=>{if(confirm('Apagar este tempo não letivo?')){a.naoLetivos=a.naoLetivos.filter(x=>x.g!==g);saveNow();closeDrawer();go('meuhorario')}};
}

/* ---------- vista: o meu horário (todas as turmas + tempos não letivos) ---------- */
function vMeuHorario(){
  const a=A();if(!a){$('#view').innerHTML='<div class="card empty">Crie primeiro o ano letivo.</div>';return}
  barBtns([{id:'b-hp',t:ic('upload',15)+' Importar o Meu Horário (PDF ou Excel)…',f:pickHorProf},{id:'b-nl',t:ic('plus',15)+' Tempo Não Letivo',f:()=>nlDlg(null)},{id:'b-hi',t:'Horários das Turmas…',f:()=>pickHorarios(importarHorariosDlg)},{id:'b-hx',t:ic('calx',15)+' Apagar Horário…',c:'dng',f:apagarMeuHorarioDlg},{id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  const TT=turmasFiltradas(a);const H=a.horProf;
  const aulas=[];TT.forEach(t=>aulasTurma(t,a).forEach(x=>aulas.push({...x,t})));
  // aulas do horário do professor sem turma na app (ex.: turmas que não acompanha aqui)
  const outras=H&&!S.filtroOferta?H.aulas.filter(x=>!H.mapa[chaveAula(x)]&&!aulas.some(y=>y.dia===x.dia&&y.ini<x.fim&&x.ini<y.fim)).map(x=>({dia:x.dia,ini:x.ini,fim:x.fim,ab:x.sig,sala:x.sala,turma:x.turma,outra:true})):[];
  const NL=(a.naoLetivos||[]).map(x=>({...x,ab:x.sig,nl:true}));
  const semH=TT.filter(t=>!aulasTurma(t,a).length);
  const hojeL=proximasAulas(aulas,40).filter(p=>p.k===0);
  const dow=new Date().getDay(),mins=new Date().getHours()*60+new Date().getMinutes(),hjIso=isoData(new Date());const diaLet=!CAL()||letivoPara(null,hjIso);
  const extraHoje=diaLet?blocos([...outras,...NL.filter(x=>nlAtivoHoje(x,hjIso))].filter(x=>x.dia===dow)).filter(b=>b.fim>mins).map(b=>({...b,agora:b.ini<=mins})):[];
  const hoje=[...hojeL,...extraHoje].sort((x,y)=>x.ini-y.ini);
  const prox=proximasAulas(aulas,1)[0];
  const cores=['#2f7fd0','#d98b00','#7a4fd0','#c0392b','#0f8b8d','#b0457b','#5b6b7f','#1a7f37'];
  const corT=t=>(t.oferta==='profij'?['#1a7f37','#0f8b8d','#4f8a2b','#2e7d5b']:cores)[TT.filter(x=>x.oferta===t.oferta).indexOf(t)%4];
  const todos=[...aulas,...outras,...NL];
  const nTL=aulas.length+outras.length,nNL=NL.length;
  const gNL=[];NL.forEach(x=>{const d=gNL.find(d=>normSig(d.sig)===normSig(x.sig));if(d){d.n++;if(!d.gs.includes(x.g))d.gs.push(x.g)}else gNL.push({sig:x.sig,nome:x.nome,n:1,gs:[x.g]})});
  const linhaHoje=p=>p.nl?`<button class="lin hjl nl ${p.agora?'now':''}" data-nl="${p.g}"><span class="hh">${fmtHM(p.ini)}–${fmtHM(p.fim)}</span><span class="nlb" style="--nc:${corNL(p.sig)}">${esc(p.sig)}</span><b>${esc(p.nome)}</b>${p.sala?`<span class="mut">Sala ${esc(p.sala)}</span>`:''}</button>`
    :p.outra?`<div class="lin hjl ${p.agora?'now':''}"><span class="hh">${fmtHM(p.ini)}–${fmtHM(p.fim)}</span><span class="dot" style="background:#8e8e93"></span><b>${esc(p.turma)}</b> ${esc(p.ab)}${p.sala?`<span class="mut">Sala ${esc(p.sala)}</span>`:''}</div>`
    :`<button class="lin hjl ${p.agora?'now':''}" data-tt="${p.t.id}"><span class="hh">${fmtHM(p.ini)}–${fmtHM(p.fim)}</span><span class="dot" style="background:${corT(p.t)}"></span>${anoBadge(p.t,'sm')}<b>${esc(p.t.nome)}</b> ${esc(p.t.disciplina)}${p.sala?`<span class="mut">Sala ${esc(p.sala)}</span>`:''}${ofertaTag(p.t)}</button>`;
  $('#view').innerHTML=`
  <div class="kpis">
    <div class="kpi"><div class="l">${ic('clipboard',14)} Tempos Letivos</div><div class="v">${nTL}</div><div class="mut">por semana</div></div>
    <div class="kpi"><div class="l">${ic('layers',14)} Tempos Não Letivos</div><div class="v">${nNL}</div><div class="mut">${gNL.map(g=>esc(g.sig)+' '+g.n).join(' · ')||'—'}</div></div>
    <div class="kpi"><div class="l">${ic('clock',14)} Total Semanal</div><div class="v">${nTL+nNL}</div><div class="mut">tempos no horário</div></div>
  </div>
  <div class="card"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">Hoje · ${esc(DIAS[dow])}</h2><span class="sp1"></span>${prox?`<span class="prox ${prox.agora?'now':''}">${ic('calendar',13)} ${prox.agora?'A decorrer':'Próxima'}: <b>${esc(prox.t.nome)} · ${esc(prox.t.disciplina)} — ${esc(quando(prox))}</b></span>`:''}</div>
    ${hoje.length?hoje.map(linhaHoje).join(''):`<p class="mut" style="margin:4px 0">${diaLet?'Sem mais tempos hoje.':'Hoje não há atividades letivas.'}</p>`}</div>
  <div class="card wide"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">O Meu Horário Semanal</h2>${a.horProf||NL.length||Object.keys(a.horarios||{}).length?`<button class="btn sm dng hdel" id="mh-del">${ic('calx',15)} Apagar Horário</button>`:''}${NL.length?'<span class="hint noprint" style="margin:0 0 0 6px">Arraste um tempo não letivo para outro dia ou hora.</span>':''}<span class="sp1"></span>
    <span class="hleg">${TT.filter(t=>aulasTurma(t,a).length).map(t=>`<span class="leg"><span class="dot" style="background:${corT(t)}"></span>${esc(t.nome)} · ${esc(t.disciplina)}</span>`).join('')}${outras.length?'<span class="leg"><span class="dot" style="background:#8e8e93"></span>Outras turmas</span>':''}${NL.length?'<span class="leg"><span class="aula nl mini"></span>Não letivo</span>':''}</span></div>
    ${todos.length?grelhaSemanal(todos,{semVazias:true,minha:x=>!x.nl&&!x.outra,cor:x=>x.nl?corNL(x.sig):x.outra?'':corT(x.t),slots:slotsConhecidos(a),cls:x=>x.nl?'nl':x.outra?'outra':'',attr:x=>x.nl?`data-nl="${x.g}" data-nid="${x.id}"`:'',rotulo:x=>x.nl?x.sig:x.outra?x.turma+' · '+x.ab:x.t.nome,titulo:x=>x.nl?x.nome:x.outra?x.turma+' · '+x.ab:x.t.nome+' · '+x.t.disciplina})
      :`<div class="empty">${ic('calendar',26)}<br>Importe o PDF do seu horário (programa da escola → Horário do professor) para ver as aulas e os tempos não letivos, ou importe os horários das turmas.<br><br><button class="btn pri" id="hp-imp">${ic('upload',15)} Importar o Meu Horário (PDF ou Excel)</button></div>`}
  </div>
  <div class="card"><div class="row" style="margin-bottom:8px"><h2 style="margin:0">Tempos Não Letivos</h2><span class="sp1"></span><button class="btn sm" id="nl-tipos">${ic('sliders',14)} Tipos</button><button class="btn sm" id="nl-add">${ic('plus',14)} Acrescentar</button></div>
    ${NL.length?`<div class="nlg">${[...new Set(NL.map(x=>x.g))].map(gid=>{const L=NL.filter(x=>x.g===gid).sort((x,y)=>x.ini-y.ini);const x=L[0];
      return `<button class="nlr clk" data-nl="${gid}"><span class="nlb" style="--nc:${corNL(x.sig)}">${esc(x.sig)}</span><span><b>${esc(x.nome)}</b>${x.obs?`<span class="mut"> · ${esc(x.obs)}</span>`:''}</span><span class="mut">${DIAS_C[x.dia]} ${fmtHM(L[0].ini)}–${fmtHM(L[L.length-1].fim)}${x.sala?' · '+esc(x.sala):''}${x.freq?' · quinzenal ('+(x.freq==='par'?'semanas pares':'semanas ímpares')+')':''}</span><span class="tag">${L.length} t.</span></button>`}).join('')}</div>`
      :'<p class="mut" style="margin:0">Ainda sem tempos não letivos. Importe o PDF do seu horário ou acrescente-os à mão (DT, CNL-E, Biblioteca, Tutoria, Clube…).</p>'}
    ${H&&H.obs&&H.obs.length?`<details class="hobs"><summary>Observações do Horário</summary><div class="hint">${H.obs.map(esc).join('<br>')}</div></details>`:''}
    ${H?`<p class="hint">Importado de ${esc(H.ficheiro)}${H.docente?' · '+esc(H.docente):''}. <a href="#" id="hp-map">Associar aulas às turmas…</a></p>`:''}</div>
  ${(()=>{const C=sobreposicoes(a);return C.length?`<div class="card"><div class="alert w" style="margin:0">${ic('alert',15)} <b>Sobreposições no horário:</b> ${C.map(c=>esc(DIAS_C[c.n.dia]+' '+fmtHM(c.n.ini)+': '+c.n.sig+' com '+c.o)).join(' · ')}</div></div>`:''})()}
  ${semH.length?`<div class="card"><h2>Turmas sem Horário</h2><p class="hint" style="margin-top:0">${semH.map(t=>esc(t.nome+' · '+t.disciplina)).join(' · ')}</p></div>`:''}`;
  $$('[data-tt]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.tt;save();go('horario')});
  $$('[data-nl]').forEach(b=>b.onclick=()=>{if(b._arrastou){b._arrastou=false;return}nlDlg(b.dataset.nl)});
  $$('.nlr.clk[data-nl]').forEach(r=>deslizarApagar(r,()=>{const g=r.dataset.nl;a.naoLetivos=a.naoLetivos.filter(x=>x.g!==g);saveNow();go('meuhorario');toast('Tempo não letivo apagado (⌘Z para anular)','aviso')}));
  ativarArrastoNL($('.card.wide table.hor'));
  const mhd=$('#mh-del');if(mhd)mhd.onclick=apagarMeuHorarioDlg;
  $('#nl-add').onclick=()=>nlDlg(null);$('#nl-tipos').onclick=()=>gerirTiposNL(null);const hi=$('#hp-imp');if(hi)hi.onclick=pickHorProf;
  const hm=$('#hp-map');if(hm)hm.onclick=e=>{e.preventDefault();importarHorProfDlg({...H,naoLetivos:[],ficheiro:H.ficheiro,obs:H.obs||[]})};
}

/* ---------- pré-visualização ---------- */
let PREV=[],PREVT='';
function avatar(a,sz){sz=sz||34;const src=fotoSrc(a);return src?`<img class="foto-al" src="${src}" alt="" style="width:${sz}px;height:${Math.round(sz*1.25)}px;object-fit:cover;object-position:50% 0;border-radius:6px;display:block;max-width:none;flex-shrink:0">`:`<span class="ava" style="width:${sz}px;min-width:${sz}px;height:${Math.round(sz*1.25)}px;font-size:${Math.round(sz*.38)}px">${esc((a.nome||'?').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase())}</span>`}
function infoLeitura(r){
  if(!r||!r.ficheiro)return '';
  if(r.falhou)return `<div class="alert w">Não consegui identificar alunos neste ficheiro. Confirme que é o Excel exportado em <b>${esc(CAMINHO_EXCEL)}</b>.</div>`;
  return `<div class="alert">${ic('check',15)} Lidos <b>${r.alunos.length} alunos</b>${r.nImgs?` e <b>${r.nFotos} fotos</b>`:' (o ficheiro não tem fotos)'}${r.turmas&&r.turmas.length>1?' · <b>'+r.turmas.length+' turmas</b> no mesmo ficheiro':''}</div>`;
}
function tabelaPreview(al,turmas){
  PREV=al.map(x=>({...x,inc:true}));turmas=turmas||[];PREVT='';
  if(!al.length)return '';
  return `${turmas.length>1?`<div class="row" style="margin:6px 0"><label class="mut" style="margin:0">Importar alunos da turma</label><select id="prev-t" class="fld" style="width:auto"><option value="">Todas (${turmas.join(' + ')})</option>${turmas.map(t=>`<option>${esc(t)}</option>`).join('')}</select></div>`:''}
  <p class="hint">Verifique e corrija os nomes. Desmarque “Frequenta” para quem não tem a sua disciplina.${turmas.length>1?' Ao importar todas juntas, cada aluno mantém o número e a indicação da sua turma.':''}</p>
  <div style="max-height:46vh;overflow:auto;border:1px solid var(--line);border-radius:8px"><table class="lst" id="prev"><thead><tr><th>Incluir</th><th></th><th>N.º</th><th>Processo</th><th>Nome</th><th>Sexo</th>${turmas.length>1?'<th>Turma</th>':''}<th>Frequenta</th></tr></thead><tbody>
  ${PREV.map((a,k)=>`<tr data-k="${k}" data-t="${esc(a.turma||'')}"><td><input type="checkbox" data-p="inc" checked></td><td style="width:70px">${avatar(a,56)}</td><td style="width:56px"><input data-p="num" value="${esc(a.num)}"></td><td style="width:76px"><input data-p="processo" value="${esc(a.processo)}"></td><td><input data-p="nome" value="${esc(a.nome)}"></td><td style="width:66px"><select data-p="genero"><option ${a.genero==='M'?'selected':''}>M</option><option ${a.genero==='F'?'selected':''}>F</option></select></td>${turmas.length>1?`<td class="mut" style="white-space:nowrap">${esc(a.turma)}</td>`:''}<td><input type="checkbox" data-p="frequenta" ${a.frequenta?'checked':''}></td></tr>`).join('')}
  </tbody></table></div>`;
}
function bindPreview(onTurma){
  $$('#prev [data-p]').forEach(el=>el.addEventListener('change',()=>{const a=PREV[+el.closest('tr').dataset.k];const f=el.dataset.p;a[f]=el.type==='checkbox'?el.checked:el.value;if(f==='genero')a.generoManual=true;if(f==='nome'&&!a.generoManual){a.genero=guessGen(a.nome);const sg=el.closest('tr').querySelector('[data-p=genero]');if(sg)sg.value=a.genero}if(f==='inc')el.closest('tr').classList.toggle('off',!el.checked)}));
  const st=$('#prev-t');if(st)st.onchange=()=>{PREVT=st.value;$$('#prev tbody tr').forEach(tr=>{tr.style.display=!PREVT||tr.dataset.t===PREVT?'':'none'});if(onTurma)onTurma(PREVT)};
}
function textoLido(r){return r.falhou&&r.linhas&&r.linhas.length?`<h3>Conteúdo lido</h3><textarea readonly style="min-height:160px;font-size:11px;width:100%">${esc(r.linhas.map(c=>c.join(' | ')).join('\n'))}</textarea>`:''}
function previewRows(){return PREV.filter(a=>a.inc!==false&&(!PREVT||a.turma===PREVT)).map(a=>({...a,num:+a.num||a.num}))}

