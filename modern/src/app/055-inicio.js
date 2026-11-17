/* =====================================================================
   INÍCIO
   ===================================================================== */
function vInicio0(){
  const c=S.cfg,a=A();const TF=turmasFiltradas(a);
  const hojeAulas=a?proximasAulas(TF.flatMap(t=>aulasTurma(t,a).map(x=>({...x,t}))),40).filter(p=>p.k===0):[];
  const passos=[
    {ok:!!(c.escola&&c.professor),t:'Preencher escola e professor',v:'definicoes'},
    {ok:S.anos.length>0,t:'Criar o ano letivo',v:'turmas'},
    {ok:!!a&&minhasDisc().length>0,t:'Escolher as disciplinas que leciona neste ano letivo',v:'turmas'},
    {ok:!!(a&&a.turmas.length),t:'Criar as turmas (importando o Excel com as fotos)',v:'turmas'},
    {ok:!!(a&&a.turmas.some(t=>t.alunos.length)),t:'Assinalar os alunos que frequentam a sua disciplina',v:'alunos'}
  ];
  const tudo=passos.every(p=>p.ok)||!!(a&&a.demo);
  $('#view').innerHTML=`<div class="inlay"><div class="in-hero">${heroEscola(a)}</div>${ladoInicio(a)}<div class="in-main">
  ${lembreteCopia()}${cartaoMatrizes(a)}${cartoesInicioAval(a)}
  ${!tudo?`<div class="card"><h2>Primeiros passos</h2><ol class="steps">${passos.map((p,i)=>`<li class="${p.ok?'done':''}"><span class="sp1">${esc(p.t)}</span>${p.ok?'':`<button class="btn sm ${passos.findIndex(x=>!x.ok)===i?'pri':''}" data-go="${p.v}">Abrir</button>`}</li>`).join('')}</ol></div>`:''}
  ${a?cartaoCalendario(a):''}
  ${a&&hojeAulas.length?`<div class="card"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">Hoje · ${esc(DIAS[new Date().getDay()])}</h2><span class="sp1"></span><button class="btn sm" data-go="meuhorario">O meu horário</button></div>
    ${hojeAulas.map(p=>`<button class="lin hjl ${p.agora?'now':''}" data-t="${p.t.id}"><span class="hh">${fmtHM(p.ini)}–${fmtHM(p.fim)}</span>${anoBadge(p.t,'sm')}<b>${esc(p.t.nome)}</b> ${esc(p.t.disciplina)}${p.sala?`<span class="mut">Sala ${esc(p.sala)}</span>`:''}${ofertaTag(p.t)}${p.agora?'<span class="tag now">agora</span>':''}</button>`).join('')}</div>`:''}
  ${a?`<div class="card"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Ano letivo ${esc(a.nome)}</h2><span class="sp1"></span></div>
    ${TF.length?gruposOferta(TF).map(g=>`<h3 class="gof"><span class="dot" style="background:${OFERTAS[g.k].cor}"></span>${esc(g.nome)} <span class="mut">· ${g.L.length} turma${g.L.length>1?'s':''}</span></h3><div class="tcards">${g.L.map(t=>{const al=alunosAval(t);const ns=al.map(x=>ponderada(t,pctsFinal(t,x.id,perAtual(t))));const v=ns.filter(x=>x!=null);const neg=ns.filter(x=>negativa(t,x)).length;const px=proximasAulas(aulasTurma(t,a),1,null,t)[0];
      return `<button class="tcard ${t.id===S.turmaAtiva?'on':''} ${ofertaDe(t)}" data-t="${t.id}"><div class="tch">${anoBadge(t,'lg')}<div class="tchn"><b><span class="tnm">${esc(t.nome)}</span>${t.origens?' <span class="tag">conjunta</span>':''}${ofertaTag(t)}</b><div class="d">${icDisc(t.disciplina,14)} ${esc(t.disciplina)}</div></div><span class="sp1"></span>${sparkTurma(t)}</div>
      <div class="s">${(()=>{const pt=proxTeste(t,a);return pt?`<span class="tcpt">${ic('target',13)} ${esc(pt.i.nome)} · ${esc(fmtIso(pt.i.data))}${pt.aulas?' · '+pt.aulas+' aula'+(pt.aulas>1?'s':'')+' antes':''}</span><br>`:''})()}${ic('users',13)} ${(()=>{const n=al.filter(y=>typeof foraEm==='function'&&foraEm(y)).length;return (al.length-n)+' alunos na disciplina'+(n?' (+'+n+' transferido'+(n>1?'s':'')+')':'')})()}${t.alunos.length!==al.length?' (de '+t.alunos.length+' na turma)':''}<br>${ic('clipboard',13)} ${t.instrumentos.length} instrumento${t.instrumentos.length===1?'':'s'} · ${v.length?'média '+fmtNota(t,avg(v)):'sem avaliações'}${neg?` · <span class="neg">${neg} negativa${neg>1?'s':''}</span>`:''}${px?`<br><span class="${px.agora?'neg':''}" style="${px.agora?'color:var(--ok)':''}">${ic('calendar',13)} ${esc(quando(px))}</span>`:''}</div></button>`}).join('')}</div>`).join(''):`<div class="empty">${S.filtroOferta?'Sem turmas de '+OFERTAS[S.filtroOferta].nome+' neste ano letivo.':'Ainda sem turmas neste ano letivo.'}</div>`}
  </div>`:''}</div></div>`;
  iniciarContagem();{const cp=$('#cp-agora');if(cp)cp.onclick=()=>exportarCopia({})}
  $$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
  $$('[data-tst]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.tst;save();go('testes')});
  $$('[data-t]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.t;UI.alView='lista';save();go('alunos')});
  $$('.tcard[data-t]').forEach(b=>longoToque(b,(x,y)=>{const id=b.dataset.t;const ir=v=>()=>{S.turmaAtiva=id;save();go(v)};menuContexto(x,y,[{t:'Alunos',ic:'users',f:ir('alunos')},{t:'Horário',ic:'calendar',f:ir('horario')},{t:'Marcação de Testes',ic:'target',f:ir('testes')},{t:'Instrumentos',ic:'clipboard',f:ir('instrumentos')},{t:'Avaliação Final',ic:'grad',f:ir('avaliacao')},'-',{t:'Editar Turma',ic:'pencil',f:()=>editarTurmaDlg(A().turmas.find(q=>q.id===id))}])}));
}
const perAtual=t=>{const p=periodoDe();if(p&&CAL())return Math.min(p,periodos().length);return Math.max(1,...t.instrumentos.map(i=>+i.periodo||1))};

