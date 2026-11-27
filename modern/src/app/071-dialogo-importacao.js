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
    ${ok.map(h=>{const lig=a.turmas.filter(t=>escId(escolaDe(t))===escAtiva()&&turmasDaClasse(t).some(c=>normTurma(c)===normTurma(h.turma)));const meus=siglasDoProfessor(h);
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
  ${slots.map((s,i)=>`${i&&s.ini-slots[i-1].fim>=15?(()=>{const f0=slots[i-1].fim,alm=s.ini-f0>=45&&f0>=11*60&&f0<=14*60+30;return `<tr class="pausa${alm?' alm':''}"><td colspan="${ds.length+1}">${alm?`<span>${ic('clock',13)} Almoço · ${fmtHM(f0)}–${fmtHM(s.ini)}</span>`:''}</td></tr>`})():''}<tr><td class="tm">${fmtHM(s.ini)}<br><span>${fmtHM(s.fim)}</span></td>
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
  <div class="card wide"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">As Suas Aulas em ${esc(t.nome)}</h2><span class="sp1"></span><span class="mut">Do seu horário (PDF) · sem horário da turma</span></div>${grelhaSemanal(minhas,{minha:()=>true,rotulo:()=>t.disciplina,titulo:()=>t.disciplina})}</div>
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
