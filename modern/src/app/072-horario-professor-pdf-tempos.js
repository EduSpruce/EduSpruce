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
