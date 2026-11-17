/* ---------- 5. Início no iPhone ---------- */
const imSaud=()=>{const h=new Date().getHours();return h<12?'Bom dia':h<20?'Boa tarde':'Boa noite'};
const imMin=m=>m>=60?Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':''):m+' min';
function imProxTurma(t,a){try{const hj=isoData(new Date());const m=new Date().getHours()*60+new Date().getMinutes();const x=listaAulas(t,a).find(z=>(z.data>hj||(z.data===hj&&z.fim>m))&&!(z.falta&&!z.falta.subst));if(!x)return '';const d=dataDeIso(x.data);const dd=x.data===hj?'Hoje':diasEntre(hj,x.data)===1?'Amanhã':DIAS_C[d.getDay()]+' '+d.getDate();return dd+' · '+fmtHM(x.ini)}catch(_){return ''}}
function imSemSum(t,a){try{return listaAulas(t,a).filter(x=>x.licao&&x.passada&&!(x.falta&&!x.falta.subst)&&!((x.s&&x.s.texto)||'').trim()).length}catch(_){return 0}}
function vInicioMovel(){const a=A();const s=SESSAO||{};const nome=(S.cfg.professor||s.nome||'').trim().split(/\s+/)[0]||'';const hoje=new Date();
  if(!a){$('#view').innerHTML=`<div class="im"><div class="card"><h2>${imSaud()}${nome?', '+esc(nome):''}</h2><p class="mut">Comece por criar o ano letivo e as turmas.</p><button class="btn pri" data-imgo="turmas">Ano Letivo e Turmas</button></div></div>`;return imBind()}
  const off=UI.imOff||0;const D=meuDiaDados(off);const mins=hoje.getHours()*60+hoje.getMinutes();const AU=D.ev.filter(e=>e.tp==='aula');
  const atual=off===0?AU.find(e=>e.h<=mins&&e.f>mins&&!e.falta):null;const prox=off===0?AU.find(e=>e.h>mins&&!e.falta):null;
  let hero='';
  if(atual){const pc=Math.round((mins-atual.h)/(atual.f-atual.h)*100);hero=`<section class="imhero now" style="--tc:${'var(--acc)'}"><div class="imhl">${ic('clock',14)} A decorrer · até às ${fmtHM(atual.f)}</div><button type="button" class="imht" data-imt="${atual.t.id}">${anoBadge(atual.t)}<span><b>${esc(atual.t.nome)}</b><small>${esc(atual.t.disciplina)}${atual.sala?' · Sala '+esc(atual.sala):''}${atual.x.licao?' · Lição '+atual.x.licao:''}</small></span></button><div class="imbar"><i style="width:${pc}%"></i></div><div class="imha"><button class="btn pri" data-imsum="${atual.t.id}|${atual.x.k}">${ic('pen',15)} Sumário</button><button class="btn" data-impres="${atual.t.id}|${atual.x.k}">${ic('users',15)} Presenças</button></div></section>`}
  else if(prox){hero=`<section class="imhero"><div class="imhl">${ic('clock',14)} Próxima aula daqui a <b>${imMin(prox.h-mins)}</b> · ${fmtHM(prox.h)}</div><button type="button" class="imht" data-imt="${prox.t.id}">${anoBadge(prox.t)}<span><b>${esc(prox.t.nome)}</b><small>${esc(prox.t.disciplina)}${prox.sala?' · Sala '+esc(prox.sala):''}${prox.x.licao?' · Lição '+prox.x.licao:''}</small></span></button><div class="imha"><button class="btn" data-imt="${prox.t.id}">${ic('grid',15)} Abrir Turma</button><button class="btn" data-imsum="${prox.t.id}|${prox.x.k}">${ic('pen',15)} Preparar Sumário</button></div></section>`}
  else if(off===0&&AU.length){hero=`<section class="imhero fim"><div class="imhl">${ic('check',14)} Aulas de hoje terminadas</div><p>${D.semSum?`Falta${D.semSum>1?'m':''} <b>${D.semSum} sumário${D.semSum>1?'s':''}</b>.`:'Todos os sumários escritos. Bom trabalho!'}</p>${D.semSum?`<div class="imha"><button class="btn pri" data-imgo="sumarios">${ic('pen',15)} Escrever Sumários</button></div>`:''}</section>`}
  else if(off===0){hero=`<section class="imhero livre"><div class="imhl">${ic('sun',14)} Sem aulas hoje</div><p>${D.ev.length?'Veja abaixo o que tem para hoje.':'Dia livre de aulas e de compromissos.'}</p></section>`}
  /* atenção */
  let urg=[];try{urg=avisosUrgentes()}catch(_){}const tAtr=tarefas().filter(x=>!x.feito&&x.prazo&&x.prazo<isoData(hoje)).length;
  let sumF=0;try{turmasFiltradas(a).forEach(t=>sumF+=imSemSum(t,a))}catch(_){}
  let mz=0;try{mz=matrizes(a).filter(x=>!x.enviada&&x.data<=isoData(hoje)).length}catch(_){}
  const pills=[urg.length?`<button class="impl bad" data-imav="1">${ic('bell',14)} ${urg.length} aviso${urg.length>1?'s':''}</button>`:'',tAtr?`<button class="impl w" data-imgo="tarefas">${ic('checks',14)} ${tAtr} tarefa${tAtr>1?'s':''} em atraso</button>`:'',sumF?`<button class="impl w" data-imgo="sumarios">${ic('pen',14)} ${sumF} sumário${sumF>1?'s':''} por escrever</button>`:'',mz?`<button class="impl" data-imgo="testes">${ic('file',14)} ${mz} matriz${mz>1?'es':''} por enviar</button>`:''].filter(Boolean);
  /* notificações (iPhone instalado, ainda por decidir) */
  const ntE=ntEstado();const ntPede=(ntE==='default'||ntE==='instalar')&&!S.cfg.ntDispensa;
  /* linha do tempo compacta */
  const evs=D.ev.filter(e=>e.tp!=='furo');const abertos=UI.imTudo;const lista=abertos?evs:evs.slice(0,5);
  const li=e=>{if(e.tp==='aula'){const st=e.falta?'<span class="tag bad">falta</span>':e.x.passada?(e.sum?`<span class="tag ok">${ic('check',10)}</span>`:'<span class="tag w">sem sumário</span>'):'';const cur=off===0&&e.h<=mins&&e.f>mins;
      return `<li class="imli ${cur?'cur':''} ${off===0&&e.f<=mins?'pas':''}"><span class="imh">${fmtHM(e.h)}</span><button type="button" class="imlb" data-imt="${e.t.id}">${anoBadge(e.t,'sm')}<span><b>${esc(e.t.nome)}</b> <small>${esc(e.t.disciplina)}${e.sala?' · '+esc(e.sala):''}</small></span></button>${st}</li>`}
    if(e.tp==='reun')return `<li class="imli"><span class="imh">${e.h<0?'—':fmtHM(e.h)}</span><button type="button" class="imlb" data-imreun="${e.r.id}"><span class="imic" style="--c:#0f8b8d">${ic('meet',13)}</span><span><b>${esc(reunTitulo(e.r,a))}</b>${e.r.local?' <small>'+esc(e.r.local)+'</small>':''}</span></button></li>`;
    if(e.tp==='aval')return `<li class="imli"><span class="imh">${ic('target',13)}</span><button type="button" class="imlb" data-iminst="${e.t.id}|${e.i.id}"><span><b>${esc(e.i.nome)}</b> <small>${esc(e.t.nome)}</small></span></button></li>`;
    if(e.tp==='tar')return `<li class="imli"><span class="imh"><input type="checkbox" data-imtk="${e.x.id}" aria-label="Feita"></span><span class="imlb"><span><b class="${e.atraso?'neg':''}">${esc(e.x.t)}</b>${e.atraso?' <small class="neg">em atraso</small>':''}</span></span></li>`;
    if(e.tp==='matriz')return `<li class="imli"><span class="imh">${ic('file',13)}</span><button type="button" class="imlb" data-imgo="testes"><span><b>Enviar matriz</b> <small>${esc(e.m.i.nome)} · ${esc(e.m.t.nome)}</small></span></button></li>`;
    if(e.tp==='aniv')return `<li class="imli"><span class="imh">🎂</span><span class="imlb"><span><b>${esc(e.v.x.nome)}</b> <small>faz anos · ${esc((e.v.turmas||[]).join(', '))}</small></span></span></li>`;return ''};
  const rot=off===0?'Hoje':off===1?'Amanhã':off===-1?'Ontem':DIAS[D.d.getDay()];
  /* próximos dias */
  const hj=isoData(hoje),lim=isoData(new Date(Date.now()+7*864e5));const PX=[];
  try{proximosTestes(a,7).filter(x=>x.i.data>hj).forEach(x=>PX.push({d:x.i.data,ic:'target',t:x.i.nome,s:x.t.nome+' · '+x.t.disciplina,at:`data-iminst="${x.t.id}|${x.i.id}"`}))}catch(_){}
  try{reunioes(a).filter(r=>reunAtiva(r)&&r.data>hj&&r.data<=lim).forEach(r=>PX.push({d:r.data,ic:'meet',t:reunTitulo(r,a),s:(r.semHora?'':fmtHM(r.ini))+(r.local?' · '+r.local:''),at:`data-imreun="${r.id}"`}))}catch(_){}
  try{tarefas().filter(x=>!x.feito&&x.prazo>hj&&x.prazo<=lim).forEach(x=>PX.push({d:x.prazo,ic:'checks',t:x.t,s:'tarefa',at:'data-imgo="tarefas"'}))}catch(_){}
  PX.sort((x,y)=>x.d.localeCompare(y.d));
  /* turmas */
  const TF=turmasFiltradas(a);
  /* período */
  let per='';try{const f=fimPeriodoAlvo(a);if(f&&!f.antes){const r=resumoPeriodoAtual(a.calendario);const tot=f.p.dias,rest=r.rest;const pc=Math.round(100*(tot-rest)/Math.max(1,tot));const W=a.calendario.periodos.length===2?'Semestre':'Período';per=`<button type="button" class="card imper" data-imgo="calendario"><div><b>${rest}</b> dias letivos até ao fim do ${f.p.n}.º ${W.toLowerCase()}<small>${esc(fmtIsoL(f.p.fim))}</small></div><div class="imbar"><i style="width:${pc}%"></i></div></button>`}}catch(_){}
  const dataTxt=hoje.toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'});
  $('#view').innerHTML=`<div class="im">
   <header class="imtop"><div><small>${esc(dataTxt.charAt(0).toUpperCase()+dataTxt.slice(1))}</small><h2>${imSaud()}${nome?', '+esc(nome):''}</h2></div><button type="button" class="imav" data-imgo="definicoes" data-imdef="prof" aria-label="Perfil">${(()=>{const f=(perfil()||{}).foto||s.foto;return f?`<img src="${esc(f)}" alt="">`:esc((nome||'?').slice(0,1))})()}</button></header>
   ${ntPede?`<div class="imnt">${ic('bell',18)}<div><b>Receber avisos das aulas e reuniões?</b><small>${ntE==='instalar'?'Adicione primeiro a app ao ecrã principal.':'Ative as notificações neste iPhone.'}</small></div><button class="btn sm pri" data-imnt="1">${ntE==='instalar'?'Como':'Ativar'}</button><button class="btn sm ico" data-imntx="1" aria-label="Agora não">${ic('x',13)}</button></div>`:''}
   ${hero}
   ${pills.length?`<div class="impls">${pills.join('')}</div>`:''}
   <div class="imq">${[['sumarios','pen','Sumário'],['tarefas','checks','Tarefa'],['testes','target','Teste'],['reunioes','meet','Reunião'],['alunos','users','Alunos'],['meuhorario','calendar','Horário']].map(([v,i,l])=>`<button type="button" data-imgo="${v}"><span>${ic(i,20)}</span>${l}</button>`).join('')}</div>
   <section class="card imday"><div class="imdh"><h3>${rot}</h3><small class="mut">${D.aulas} aula${D.aulas!==1?'s':''}${D.ev.filter(e=>e.tp==='tar').length?' · '+D.ev.filter(e=>e.tp==='tar').length+' tarefa(s)':''}</small><span class="sp1"></span><div class="seg sm"><button type="button" data-imoff="-1" aria-label="Dia anterior">‹</button><button type="button" data-imoff="0" class="${off===0?'on':''}">Hoje</button><button type="button" data-imoff="1" aria-label="Dia seguinte">›</button></div></div>
     ${evs.length?`<ul class="iml">${lista.map(li).join('')}</ul>${evs.length>5?`<button type="button" class="imver" data-imtudo="1">${abertos?'Mostrar menos':'Ver o dia todo ('+evs.length+')'}</button>`:''}`:`<p class="mut" style="margin:6px 0 0">Nada marcado.</p>`}
     <div class="imnew"><input id="im-t" placeholder="Nova tarefa para ${off===0?'hoje':rot.toLowerCase()}…" enterkeyhint="done"><button class="btn pri ico" id="im-ok" aria-label="Juntar tarefa">${ic('plus',16)}</button></div></section>
   ${PX.length?`<section class="card imnx"><div class="imdh"><h3>Próximos 7 dias</h3><span class="sp1"></span><button class="btn sm" data-imgo="calendario">Calendário</button></div><ul class="iml">${PX.slice(0,6).map(x=>{const d=dataDeIso(x.d);return `<li class="imli"><span class="imdt"><b>${d.getDate()}</b><small>${DIAS_C[d.getDay()]}</small></span><button type="button" class="imlb" ${x.at}><span class="imic">${ic(x.ic,13)}</span><span><b>${esc(x.t)}</b> <small>${esc(x.s)}</small></span></button></li>`}).join('')}</ul></section>`:''}
   ${TF.length?`<section class="imts"><div class="imdh"><h3>As Minhas Turmas</h3><span class="sp1"></span><button class="btn sm" data-imgo="turmas">Todas</button></div><div class="imtc">${TF.map(t=>{const ss=imSemSum(t,a);const al=(t.alunos||[]).filter(x=>x.frequenta!==false).length;return `<button type="button" class="imtcard" data-imt="${t.id}">${anoBadge(t)}<b>${esc(t.nome)}</b><small>${esc(t.disciplina)}</small><span class="imtm">${ic('users',12)} ${al}${ss?` · <em>${ss} sem sumário</em>`:''}</span><span class="imtp">${esc(imProxTurma(t,a)||'—')}</span></button>`}).join('')}</div></section>`:''}
   ${per}
   <button type="button" class="imfull" data-imfull="1">${ic('grid',14)} Ver o Início completo</button></div>`;
  imBind()}
function imBind(){const v=$('#view');const re=()=>vInicioMovel();
  v.querySelectorAll('[data-imgo]').forEach(b=>b.onclick=()=>{if(b.dataset.imdef)UI.defTab=b.dataset.imdef;const w=b.dataset.imgo;if(['testes','alunos','sumarios'].includes(w)&&!T()){const TF=turmasFiltradas(A()||{turmas:[]});if(TF[0])S.turmaAtiva=TF[0].id}go(w)});
  v.querySelectorAll('[data-imt]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.imt;save();go('painel')});
  const kx=(val,fn)=>{const j=val.indexOf('|');const tid=val.slice(0,j),k=val.slice(j+1);const t=A().turmas.find(x=>x.id===tid);if(!t)return;S.turmaAtiva=tid;save();try{aulaDlg(t,k,fn)}catch(_){go('sumarios')}};
  v.querySelectorAll('[data-imsum]').forEach(b=>b.onclick=()=>kx(b.dataset.imsum,'sum'));v.querySelectorAll('[data-impres]').forEach(b=>b.onclick=()=>kx(b.dataset.impres,'pres'));
  v.querySelectorAll('[data-imreun]').forEach(b=>b.onclick=()=>{try{reuniaoVer(b.dataset.imreun)}catch(_){go('reunioes')}});
  v.querySelectorAll('[data-iminst]').forEach(b=>b.onclick=()=>{const [tid,iid]=b.dataset.iminst.split('|');S.turmaAtiva=tid;UI.inst=iid;UI.instTab='notas';save();go('instrumentos')});
  v.querySelectorAll('[data-imtk]').forEach(c=>c.onchange=()=>{const x=tarefas().find(z=>z.id===c.dataset.imtk);if(!x)return;x.feito=c.checked;x.feitaEm=Date.now();save();try{tarBadge()}catch(_){}setTimeout(re,300)});
  v.querySelectorAll('[data-imoff]').forEach(b=>b.onclick=()=>{const k=+b.dataset.imoff;UI.imOff=k===0?0:(UI.imOff||0)+k;re()});
  const td=v.querySelector('[data-imtudo]');if(td)td.onclick=()=>{UI.imTudo=!UI.imTudo;re()};
  const av=v.querySelector('[data-imav]');if(av)av.onclick=()=>{try{mostrarAvisos(true)}catch(_){}};
  const nt=v.querySelector('[data-imnt]');if(nt)nt.onclick=()=>{if(ntEstado()==='instalar'){UI.defTab='notif';go('definicoes')}else ntAtivar()};
  const nx=v.querySelector('[data-imntx]');if(nx)nx.onclick=()=>{S.cfg.ntDispensa=Date.now();save();re()};
  const fl=v.querySelector('[data-imfull]');if(fl)fl.onclick=()=>{S.cfg.inicioMovel='completo';save();go('inicio')};
  const it=$('#im-t'),ok=$('#im-ok');const add=()=>{if(!it.value.trim())return;const d=new Date();d.setDate(d.getDate()+(UI.imOff||0));tarefas().push({id:uid(),t:it.value.trim(),prazo:isoData(d),prio:'normal',feito:false,criada:Date.now()});save();audit('Tarefas','Tarefa criada',it.value.trim());re();setTimeout(()=>$('#im-t')&&$('#im-t').focus(),60)};
  if(ok){ok.onclick=add;it.onkeydown=e=>{if(e.key==='Enter')add()}}}
{const _vIM=vInicio;vInicio=function(){if(ES_MOVEL()&&S.cfg.inicioMovel!=='completo'&&!document.body.classList.contains('apres')){try{barBtns([])}catch(_){}return vInicioMovel()}const r=_vIM.apply(this,arguments);
  try{if(ES_MOVEL()&&!$('#im-volta')){$('#view').insertAdjacentHTML('afterbegin',`<button type="button" class="imvolta" id="im-volta">${ic('sun',14)} Vista «Hoje» para o telemóvel</button>`);$('#im-volta').onclick=()=>{S.cfg.inicioMovel='hoje';save();go('inicio')}}}catch(_){}return r};if(go._f)go._f.inicio=vInicio}

