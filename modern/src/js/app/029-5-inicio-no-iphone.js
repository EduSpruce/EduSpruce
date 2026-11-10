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

/* ---------- 6. Painel da turma no iPhone ---------- */
function vPainelMovel(){const t=T();if(!t)return go('turmas');const a=A();const C=PNL();const P=periodos();const per=C.per==='ano'?null:(C.per?+C.per:perAtual(t));const D=pnlDados(t,a,per);const hj=isoHoje();
  barBtns([{id:'pn-sum',t:ic('pen',15)+' Sumário / Faltas',f:()=>go('sumarios')},{id:'pn-av',t:ic('plus',15)+' Avaliação',c:'pri',f:()=>{go('instrumentos');try{novoInstrumento()}catch(_){}}}]);
  const L=D.linhas;const comNota=L.filter(l=>l.nota!=null);const negs=L.filter(l=>l.neg);const assV=L.map(l=>l.ass).filter(x=>x!=null);const ass=assV.length?Math.round(avg(assV)):null;const med=comNota.length?avg(comNota.map(l=>l.nota)):null;
  const EST=t.instrumentos.filter(i=>(per==null||+i.periodo===+per)&&instMax(i)).map(i=>instEstado(t,i));const pend=EST.filter(x=>['porclass','parcial','incompleta'].includes(x.e)).length;
  const AT=pnlAtencao(t,a,D);const AG=pnlAgenda(t,a,14);const tab=UI.pnmTab||(AT.length?'at':'al');
  const prof=t.oferta==='profij'||t.oferta==='profissional';
  const q=normT(C.q||'');let LL=L.filter(l=>!q||normT(l.a.nome).includes(q)||String(l.a.num)===q);
  if(C.fil==='neg')LL=LL.filter(l=>l.neg);else if(C.fil==='risco')LL=LL.filter(l=>l.risco);else if(C.fil==='pend')LL=LL.filter(l=>l.pend||l.oralP);else if(C.fil==='sit')LL=LL.filter(l=>l.risco||l.neg||l.pend);
  LL.sort((x,y)=>(+x.a.num||0)-(+y.a.num||0));
  const sc=[['alunos','users','Alunos'],['sumarios','pen','Sumários'],['testes','target','Testes'],['instrumentos','clipboard','Instrumentos'],['avaliacao','grad','Avaliação'],['horario','calendar','Horário'],['planta','grid','Planta'],['relatorios','file','Relatórios'],...(prof?[['modulos','layers','Módulos'],['mra','refresh','MRA']]:[])];
  const kp=(k,l,v,s,cls)=>`<button type="button" class="pmk ${cls||''}" data-pmk="${k}"><small>${l}</small><b>${v}</b><span>${s}</span></button>`;
  const prox=imProxTurma(t,a);
  $('#view').innerHTML=`<div class="pm">
   <section class="pmhd">${anoBadge(t)}<div><h2>${esc(t.nome)}</h2><small>${esc(t.disciplina)} · ${D.al.length} aluno${D.al.length!==1?'s':''}${t.dt?' · Diretor(a) de turma':''}</small>${prox?`<span class="pmnx">${ic('clock',12)} Próxima aula: ${esc(prox)}</span>`:''}</div></section>
   <div class="seg pmper" role="group" aria-label="Período">${P.map(p=>`<button type="button" data-pnper="${p}" class="${per===p?'on':''}">${p}.º ${perW().slice(0,3).toLowerCase()}.</button>`).join('')}<button type="button" data-pnper="ano" class="${per==null?'on':''}">Ano</button></div>
   <div class="pmks">${kp('av','Média',med==null?'—':fmtNota(t,med),comNota.length?comNota.length+' com nota':'sem classificações')}${kp('ass','Assiduidade',ass==null?'—':ass+'%',D.porConf?D.porConf+' por confirmar':'limite '+D.LF.lim+' faltas',ass!=null&&ass<90?'w':'')}${kp('neg','Abaixo do limiar',comNota.length?negs.length:'—','alunos',negs.length?'bad':'')}${kp('pend','Por classificar',pend,'avaliações',pend?'w':'')}</div>
   <div class="pmsc">${sc.map(([v,i,l])=>`<button type="button" data-pmgo="${v}"><span>${ic(i,19)}</span>${l}</button>`).join('')}</div>
   <div class="seg pmtab" role="tablist">${[['at','Atenção',AT.length],['al','Alunos',D.al.length],['ag','Agenda',AG.E.length]].map(([k,l,n])=>`<button type="button" role="tab" data-pmtab="${k}" class="${tab===k?'on':''}" aria-selected="${tab===k}">${l}${n?` <em>${n}</em>`:''}</button>`).join('')}</div>
   ${tab==='at'?`<section class="card pmat">${AT.length?AT.slice(0,15).map(x=>`<div class="pmai ${x.c}"><span class="pmaic">${ic(x.ic,15)}</span><span class="pmait"><b>${esc(x.tit)}</b><small>${esc(x.mot)}</small></span><button type="button" class="btn sm" data-pnact="${x.k}">${esc(x.ac)}</button></div>`).join(''):`<p class="mut">${ic('check',14)} Nada pendente nesta turma.</p>`}</section>`:''}
   ${tab==='al'?`<section class="card pmal"><input type="search" id="pn-q" placeholder="Pesquisar nome ou n.º" value="${esc(C.q||'')}"><div class="pmfil">${[['','Todos'],['sit','A acompanhar'],['neg','Abaixo do limiar'],['risco','Faltas'],['pend','Pendências']].map(([k,l])=>`<button type="button" data-pnfil="${k}" class="${(C.fil||'')===k?'on':''}">${l}</button>`).join('')}</div>
     <ul class="pml">${LL.map(l=>`<li><button type="button" class="pmr ${l.risco==='lim'||l.neg?'bad':l.risco||l.pend?'w':''}" data-pnp="${l.a.id}">${avatar(l.a,34)}<span class="pmrn"><b>${esc(numAl(l.a))}. ${esc(l.a.nome)}</b><small>${[l.f.tot?l.f.tot+'/'+D.LF.lim+' faltas':'sem faltas',l.ass!=null?l.ass+'% assid.':'',l.pend?l.pend+' por classificar':'',l.oralP?'oral':''].filter(Boolean).join(' · ')}</small></span><span class="pmrv">${l.nota==null?'<span class="mut">—</span>':`<b class="${l.neg?'neg':''}">${fmtNota(t,l.nota)}</b>${!isSec(t)?`<small>nível ${nivel(t,l.nota)}</small>`:''}`}</span></button></li>`).join('')||'<li class="mut" style="padding:12px">Nenhum aluno com este filtro.</li>'}</ul></section>`:''}
   ${tab==='ag'?`<section class="card pmag">${AG.E.length?`<ul class="iml">${AG.E.slice(0,20).map(x=>{const d=dataDeIso(x.d);return `<li class="imli"><span class="imdt"><b>${d.getDate()}</b><small>${DIAS_C[d.getDay()]}</small></span><span class="imlb"><span class="imic">${ic(x.ic,13)}</span><span><b>${esc(x.t)}</b>${x.s?` <small>${esc(x.s)}</small>`:''}</span></span><small class="mut">${x.d===hj?'hoje':diasEntre(hj,x.d)+' d'}</small></li>`}).join('')}</ul>`:'<p class="mut">Sem eventos nos próximos 14 dias.</p>'}</section>`:''}
   <button type="button" class="imfull" data-pmfull="1">${ic('chart',14)} Ver o painel completo</button></div>`;
  const v=$('#view');const re=()=>vPainelMovel();
  v.querySelectorAll('[data-pnper]').forEach(b=>b.onclick=()=>{C.per=b.dataset.pnper;save();re()});
  v.querySelectorAll('[data-pmtab]').forEach(b=>b.onclick=()=>{UI.pnmTab=b.dataset.pmtab;re()});
  v.querySelectorAll('[data-pmgo]').forEach(b=>b.onclick=()=>{if(b.dataset.pmgo==='instrumentos')UI.inst=null;go(b.dataset.pmgo)});
  v.querySelectorAll('[data-pmk]').forEach(b=>b.onclick=()=>{const k=b.dataset.pmk;UI.pnmTab='al';C.fil=k==='neg'?'neg':k==='pend'?'pend':k==='ass'?'risco':'';if(k==='av'){go('avaliacao');return}save();re()});
  v.querySelectorAll('[data-pnfil]').forEach(b=>b.onclick=()=>{C.fil=b.dataset.pnfil;save();re()});
  const qi=$('#pn-q');if(qi)qi.oninput=()=>{C.q=qi.value;clearTimeout(qi._t);qi._t=setTimeout(()=>{const p=qi.selectionStart;re();const n=$('#pn-q');if(n){n.focus();n.setSelectionRange(p,p)}},250)};
  v.querySelectorAll('[data-pnp]').forEach(b=>b.onclick=()=>{try{perfilAluno(b.dataset.pnp,{p:per||perAtual(t)})}catch(_){go('alunos')}});
  const AI=Object.fromEntries(AT.map(x=>[x.k,x]));
  v.querySelectorAll('[data-pnact]').forEach(b=>b.onclick=()=>{const x=AI[b.dataset.pnact];if(!x)return;if(x.fn){x.fn();toast('Feito','ok');return re()}if(x.inst){UI.inst=x.inst;UI.instTab=x.tab||'notas';return go('instrumentos')}if(x.aluno){try{return perfilAluno(x.aluno,{p:per||perAtual(t)})}catch(_){}}if(x.go)go(x.go)});
  const fl=v.querySelector('[data-pmfull]');if(fl)fl.onclick=()=>{S.cfg.painelMovel='completo';save();go('painel')}}
{const _vPM=vPainel;vPainel=function(){if(ES_MOVEL()&&S.cfg.painelMovel!=='completo'&&!document.body.classList.contains('apres'))return vPainelMovel();const r=_vPM.apply(this,arguments);
  try{if(ES_MOVEL()&&!$('#pm-volta')){$('#view').insertAdjacentHTML('afterbegin',`<button type="button" class="imvolta" id="pm-volta">${ic('grid',14)} Vista compacta para o telemóvel</button>`);$('#pm-volta').onclick=()=>{S.cfg.painelMovel='';save();go('painel')}}}catch(_){}return r};if(go._f)go._f.painel=vPainel}
/* mudar de orientação/tamanho: volta a desenhar o Início e o Painel */
{let _mv=ES_MOVEL();addEventListener('resize',()=>{const m=ES_MOVEL();if(m!==_mv){_mv=m;if(['inicio','painel'].includes(VIEW))go(VIEW)}})}

/* v0.91 · ajuda */
{const _aa=ajudaAtualizar;ajudaAtualizar=function(){const pr=AJUDA._v91;_aa.apply(this,arguments);if(pr)return;AJUDA._v91=1;
  const N=[{id:'notificacoes',ic:'bell',t:'Notificações no iPhone, iPad e Computador',gif:null,txt:`<ol><li><b>iPhone/iPad</b>: no Safari, Partilhar › <b>Adicionar ao ecrã principal</b> e abra a app pelo ícone (a Apple só permite notificações assim, iOS 16.4+).</li><li>Em <b>Definições › Notificações</b> toque em <b>Ativar Notificações</b> e aceite.</li><li>Escolha o que quer receber: aula a começar (5, 10 ou 15 min antes), sumário por escrever depois da aula, resumo do dia (07:45), avaliações de amanhã (18:00), lembretes de reuniões e avisos urgentes, número no ícone da app. Defina o horário de silêncio e os fins de semana.</li></ol><p>Tocar numa notificação abre a secção certa. <b>Com a app fechada</b> o iPhone não deixa as apps web avisar: use <b>Juntar ao Calendário (.ics)</b> — reuniões, avaliações, tarefas e avisos dos próximos 45 dias ficam no Calendário com alarmes.</p>`},
   {id:'contasg',ic:'shield',t:'Contas Autorizadas e Dados Só na Nuvem',gif:null,txt:`<p>Não basta ter uma conta Google: <b>só entram as contas que o administrador autorizar</b>. Em <b>Definições › Conta e Acesso › Quem Pode Entrar com Google</b> o administrador acrescenta o e-mail e o perfil (Professor, Direção, Administrador), descarrega a configuração e publica-a no site — vale para todos os aparelhos. O ficheiro guarda só uma impressão digital (SHA-256) de cada e-mail. Uma conta retirada perde o acesso na próxima vez que a app abrir.</p><p>Neste site os dados <b>só existem sincronizados com a conta Google</b>, encriptados: entra-se com Google (a conta local é só uma entrada de emergência do administrador), a sincronização não se desliga e, ao terminar a sessão, a app envia as últimas alterações e limpa a cópia do aparelho.</p>`}];
  N.forEach(n=>{if(!AJUDA.find(x=>x.id===n.id)){const i=AJUDA.findIndex(x=>x.id==='instalar');AJUDA.splice(i>=0?i+1:AJUDA.length,0,n)}})}}

/* v0.92 · ecrã de arranque: sai quando a app (ou o ecrã de entrada) está pronta */
window.esSplash=function(txt){let d=document.getElementById('splash');if(txt===false){if(d){d.classList.add('fora');setTimeout(()=>d&&d.remove(),400)}return}
  if(!d){d=document.createElement('div');d.id='splash';d.innerHTML='<div class="spw">'+(document.querySelector('#splash-tpl')||{innerHTML:''}).innerHTML+'</div>';document.body.appendChild(d)}const t=document.getElementById('splash-t');if(t&&txt)t.textContent=txt};
{const _sl=()=>{const d=document.getElementById('splash');if(!d)return clearInterval(_slT);const pronto=document.body.classList.contains('login-on')&&document.getElementById('login')||(document.getElementById('view')&&document.getElementById('view').children.length>0&&SESSAO);if(pronto){clearInterval(_slT);esSplash(false)}};const _slT=setInterval(_sl,80);setTimeout(()=>{clearInterval(_slT);esSplash(false)},25000)}
/* v0.92 · sincroniza antes de sair (fechar, mudar de app, recarregar, terminar sessão) */
function nvPendenteAgora(){try{const L=nvL();if(!L.prov||!_nvK||L.auto===false)return false;try{saveNow()}catch(_){}return Object.keys(nvL().mod||{}).length>0}catch(_){return false}}
let _nvSaida=null;
function nvSyncSaida(){if(_nvSaida)return _nvSaida;if(!nvPendenteAgora())return null;clearTimeout(_nvT);
  _nvSaida=(async()=>{for(let i=0;i<4;i++){if(_nvBusy){await new Promise(r=>setTimeout(r,350));continue}await nvSincronizar(false);if(!Object.keys(nvL().mod||{}).length)break}})().catch(()=>{}).finally(()=>{_nvSaida=null;try{nvBadge()}catch(_){}});return _nvSaida}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')nvSyncSaida()});
addEventListener('pagehide',()=>{nvSyncSaida()});
addEventListener('beforeunload',e=>{if(window.__efApagar||window.__nvSemAviso)return;if(nvPendenteAgora()){nvSyncSaida();e.preventDefault();e.returnValue='Ainda há alterações a enviar para a nuvem. Espere uns segundos.';return e.returnValue}});
{const _gl=gLogin;gLogin=function(){window.__nvSemAviso=true;setTimeout(()=>{window.__nvSemAviso=false},8000);return _gl.apply(this,arguments)}}
{const _ts2=terminarSessao;terminarSessao=async function(){if(nvPendenteAgora()){esSplash('A guardar as últimas alterações na nuvem…');const d=document.getElementById('splash');if(d){d.style.animation='none';d.style.opacity='1'}
    await Promise.race([nvSyncSaida()||Promise.resolve(),new Promise(r=>setTimeout(r,20000))]);if(Object.keys(nvL().mod||{}).length){esSplash(false);const r=await avisoModal('Alterações ainda por enviar',['Não foi possível enviar tudo para a nuvem (sem internet?). As alterações ficam guardadas neste aparelho e são enviadas na próxima vez que abrir a app aqui.'],[{t:'Ficar',c:'pri',v:null},{t:'Sair Mesmo Assim',v:'sim'}]);if(r!=='sim')return}}
  window.__nvSemAviso=true;return _ts2.apply(this,arguments)}}

/* v0.93 · palavra-passe de encriptação numérica, com teclado numérico em todos os aparelhos */
const NV_PIN_IDS=['nvas-p1','nvas-p2','nv2-p1','nv2-p2','np-1','np-2','nv-pw1','nv-pw2','mc-0','mc-1','mc-2'];
const NV_PIN_MIN=8;
function nvPinErro(a,id,novo){if(novo===undefined)novo=true;const el=document.getElementById(id);const letras=el&&el.dataset.letras==='1';a=String(a||'');
  if(letras)return a.length<8?'Use pelo menos 8 caracteres.':'';
  if(!/^\d+$/.test(a))return 'O código de encriptação tem só algarismos.';
  if(a.length<NV_PIN_MIN)return 'Use pelo menos '+NV_PIN_MIN+' algarismos.';
  if(novo&&(/^(\d)\1+$/.test(a)||'01234567890123456789'.includes(a)||'98765432109876543210'.includes(a)))return 'Esse código é fácil de adivinhar — evite repetições e sequências.';return ''}
const nvToque=()=>{try{return matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0}catch(_){return false}};
function nvPinPrep(){NV_PIN_IDS.forEach(id=>{const el=document.getElementById(id);if(!el||el.dataset.pin)return;el.dataset.pin='1';
    const letras=()=>el.dataset.letras==='1';
    const aplicar=()=>{if(letras()){el.setAttribute('inputmode','text');el.removeAttribute('pattern')}else{el.setAttribute('inputmode',nvToque()?'none':'numeric');el.setAttribute('pattern','[0-9]*')}};aplicar();
    el.setAttribute('enterkeyhint','done');el.setAttribute('autocapitalize','off');el.setAttribute('spellcheck','false');
    el.addEventListener('input',()=>{if(!letras()){const v=el.value.replace(/\D/g,'');if(v!==el.value)el.value=v}});
    const grp=el.closest('form')||el.closest('dialog')||el.parentElement;if(!grp)return;
    grp.addEventListener('focusin',e=>{if(NV_PIN_IDS.includes(e.target.id))grp._pinAlvo=e.target});
    if(!grp._pinAlvo)grp._pinAlvo=el;
    const ultimo=[...grp.querySelectorAll('input[type=password]')].filter(x=>NV_PIN_IDS.includes(x.id)).pop();
    if(grp.querySelector('.pinpad')||el!==ultimo)return;
    const pad=document.createElement('div');pad.className='pinpad';pad.setAttribute('role','group');pad.setAttribute('aria-label','Teclado numérico');
    pad.innerHTML=['1','2','3','4','5','6','7','8','9','apagar','0','ok'].map(k=>`<button type="button" data-pk="${k}" ${k==='apagar'?'aria-label="Apagar"':k==='ok'?'aria-label="Seguinte"':''}>${k==='apagar'?ic('back',18):k==='ok'?ic('check',18):k}</button>`).join('')+(grp.querySelector('#nvas-p2,#np-2,#nv-pw2')&&!grp.querySelector('[data-antigo]')?'':`<button type="button" class="pinlet" data-pk="letras">A minha palavra-passe antiga tem letras</button>`);
    ultimo.insertAdjacentElement('afterend',pad);
    pad.addEventListener('pointerdown',e=>{if(e.target.closest('[data-pk]'))e.preventDefault()});
    pad.addEventListener('click',e=>{const b=e.target.closest('[data-pk]');if(!b)return;const k=b.dataset.pk;const campos=[...grp.querySelectorAll('input[type=password]')].filter(x=>NV_PIN_IDS.includes(x.id)&&!x.hidden&&x.offsetParent!==null);
      let alvo=grp._pinAlvo&&campos.includes(grp._pinAlvo)?grp._pinAlvo:campos[0];if(!alvo)return;
      if(k==='letras'){const ant=campos.filter(c=>!c.dataset.novo);ant.forEach(c=>{c.dataset.letras='1';c.setAttribute('inputmode','text');c.removeAttribute('pattern')});if(ant.length===campos.length)pad.classList.add('letras');else b.remove();(ant[0]||alvo).focus();return}
      if(k==='apagar'){alvo.value=alvo.value.slice(0,-1)}
      else if(k==='ok'){const i=campos.indexOf(alvo);if(i<campos.length-1&&!campos[i+1].value){grp._pinAlvo=campos[i+1];campos[i+1].classList.add('pinfoco');setTimeout(()=>campos[i+1].classList.remove('pinfoco'),600);return}
        const bt=grp.querySelector('#nvas-ok,#nv2-pwok,#nv-pwok,[data-np="1"],button[type=submit].pri,.btn.pri');if(bt)bt.click();return}
      else{if(alvo.value.length>=32)return;alvo.value+=k}
      alvo.dispatchEvent(new Event('input',{bubbles:true}));if(!nvToque())alvo.focus();if(navigator.vibrate)try{navigator.vibrate(8)}catch(_){}})})}
setInterval(nvPinPrep,350);document.addEventListener('focusin',()=>setTimeout(nvPinPrep,0));

/* v0.94 · o ID da Google nunca falta (configuração lenta ou bloqueada) */
const ES_G_ID='275856895734-48n60vhatvltml3t601o24cbak7ndjq2.apps.googleusercontent.com';
{const _gid=gLoginId;gLoginId=function(){return _gid.apply(this,arguments)||(/(^|\.)eduspruce\.(pt|app)$/.test(location.hostname)?ES_G_ID:'')}}
{const _gl3=gLogin;gLogin=async function(A_){if(!gLoginId(A_)){try{await nvCentralCarregar()}catch(_){}}return _gl3.apply(this,arguments)}}
setTimeout(()=>{try{if(!NV_CENTRAL.google&&/(^|\.)eduspruce\.(pt|app)$/.test(location.hostname))NV_CENTRAL.google=ES_G_ID}catch(_){}},4000);
/* v0.94 · mudar o código de encriptação (volta a encriptar tudo na nuvem) */
async function nvMudarCodigo(antigo,novo,prog){const prov=nvProv();const L=nvL();prog=prog||(()=>{});if(!prov||!L.k)throw new Error('A sincronização não está ligada neste aparelho.');
  let kOld=null;if(L.rekey&&L.rekey.kOld){kOld=await crypto.subtle.importKey('raw',unb64(L.rekey.kOld),'AES-GCM',true,['encrypt','decrypt'])}
  else{const k0=await nvChaveDe(antigo,L.salt);if(b64(await crypto.subtle.exportKey('raw',k0))!==L.k)throw new Error('O código atual está errado.');kOld=k0}
  let salt,kNew;if(L.rekey&&L.rekey.k){salt=L.rekey.salt;kNew=await crypto.subtle.importKey('raw',unb64(L.rekey.k),'AES-GCM',true,['encrypt','decrypt'])}
  else{prog('A sincronizar antes de mudar…');await nvSincronizar(true);if(Object.keys(nvL().mod||{}).length)throw new Error('Não foi possível sincronizar antes de mudar o código. Verifique a internet e tente de novo.');
    salt=b64(crypto.getRandomValues(new Uint8Array(16)));kNew=await nvChaveDe(novo,salt);nvSet({rekey:{salt,k:b64(await crypto.subtle.exportKey('raw',kNew)),kOld:b64(await crypto.subtle.exportKey('raw',kOld)),desde:Date.now()}})}
  while(_nvBusy)await new Promise(r=>setTimeout(r,300));_nvBusy=true;
  try{const man=JSON.parse(await prov.ler(NV_PREF+'manifest.json')||'null');if(!man)throw new Error('Não há dados na nuvem.');
    const re=async nome=>{const txt=await prov.ler(nome);if(txt==null)return;let pt;try{pt=await nvDecifrar(txt,kOld)}catch(_){try{await nvDecifrar(txt,kNew);return}catch(__){throw new Error('Um ficheiro na nuvem não abre com nenhum dos códigos: '+nome)}}await prov.escrever(nome,await nvCifrar(pt,kNew))};
    const P=Object.keys(man.partes||{}),F=Object.keys(man.fotos||{});const tot=P.length+F.length;let i=0;
    for(const n of P){prog('A encriptar de novo… '+(++i)+' de '+tot);await re(NV_PREF+n+'.bin')}
    for(const id of F){prog('A encriptar de novo… '+(++i)+' de '+tot);await re(nvNomeF(id))}
    man.salt=salt;man.chk=await nvCifrar('eduflow',kNew);man.rev=(man.rev||0)+1;man.rekeyEm=Date.now();await prov.escrever(NV_PREF+'manifest.json',JSON.stringify(man));
    await nvGuardarChave(kNew);nvSet({salt,rekey:null,erro:null});try{audit('Segurança','Código de encriptação da nuvem mudado',tot+' ficheiros')}catch(_){}return tot}
  finally{_nvBusy=false}}
/* noutro aparelho: o código mudou → pede o novo em vez de dar erro */
{const _nsR=nvSincronizar;nvSincronizar=async function(){const L=nvL();if(L.rekey&&L.rekey.k&&!_nvBusy){try{await nvMudarCodigo('','',()=>{});toast('Acabou de mudar o código de encriptação na nuvem','ok')}catch(e){console.warn(e)}}
  const r=await _nsR.apply(this,arguments);try{const e=nvL().erro||'';if(!r&&/não corresponde/.test(e)&&SESSAO){_nvK=null;try{localStorage.removeItem('eskeep')}catch(_){}nvSet({k:null,erro:null});toast('O código de encriptação foi mudado noutro aparelho. Escreva o código novo.','aviso');try{sessionStorage.removeItem('es.assist')}catch(_){}setTimeout(()=>nvAssist(true),400)}}catch(_){}return r}}
function nvMudarDlg(){const d=document.createElement('dialog');d.className='nvmc';d.setAttribute('aria-labelledby','mc-t');
  d.innerHTML=`<form class="nvmcf" onsubmit="return false" autocomplete="on"><input type="text" name="username" autocomplete="username" value="${esc(gsCfg().email||(SESSAO||{}).u||'')}" hidden readonly><h2 id="mc-t">${ic('shield',18)} Mudar o Código de Encriptação</h2>
   <p class="hint">Os dados na nuvem são encriptados de novo com o código novo. Nos outros aparelhos a app vai pedir o código novo. Faça-o com a internet ligada e, se possível, com a app fechada nos outros aparelhos.</p>
   <label for="mc-0">Código atual</label><input type="password" id="mc-0" data-antigo="1" autocomplete="current-password" placeholder="Código atual">
   <label for="mc-1">Código novo (só algarismos, mín. 8)</label><input type="password" id="mc-1" data-novo="1" name="new-password" autocomplete="new-password" placeholder="Código novo">
   <input type="password" id="mc-2" data-novo="1" autocomplete="new-password" placeholder="Repetir o código novo" aria-label="Repetir o código novo">
   <div class="nverr" id="mc-e" role="alert"></div><div class="mut" id="mc-p" aria-live="polite"></div>
   <div class="row" style="gap:8px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn" id="mc-x">Cancelar</button><button type="button" class="btn pri" id="mc-ok">${ic('shield',15)} Mudar o Código</button></div></form>`;
  document.body.appendChild(d);d.showModal();setTimeout(nvPinPrep,0);const er=d.querySelector('#mc-e'),pg=d.querySelector('#mc-p');
  d.querySelector('#mc-x').onclick=()=>{d.close();d.remove()};
  d.querySelector('#mc-ok').onclick=async()=>{er.textContent='';const a=d.querySelector('#mc-0').value,b=d.querySelector('#mc-1').value,c=d.querySelector('#mc-2').value;
    if(!a)return er.textContent='Escreva o código atual.';{const e=nvPinErro(b,'mc-1',true);if(e)return er.textContent=e}if(b!==c)return er.textContent='Os códigos novos não coincidem.';if(a===b)return er.textContent='O código novo é igual ao atual.';
    const bt=d.querySelector('#mc-ok');bt.disabled=true;d.querySelector('#mc-x').disabled=true;
    try{const n=await nvMudarCodigo(a,b,t=>pg.textContent=t);try{if(window.PasswordCredential&&navigator.credentials){const cr=new PasswordCredential({id:gsCfg().email||(SESSAO||{}).u||'eduspruce',password:b,name:'EduSpruce — código de encriptação'});navigator.credentials.store(cr).catch(()=>{})}}catch(_){}
      d.close();d.remove();toast('Código mudado — '+n+' ficheiro(s) encriptados de novo','ok');if(VIEW==='definicoes')vDefinicoes()}
    catch(e){er.textContent=e.message;pg.textContent='';bt.disabled=false;d.querySelector('#mc-x').disabled=false}}}
{const _bs2=bindSync;bindSync=function(){const r=_bs2.apply(this,arguments);try{const pm=$('#nv2-pwm');if(pm&&!$('#nv2-mc')){pm.insertAdjacentHTML('beforebegin',`<button class="btn" id="nv2-mc">${ic('shield',14)} Mudar o Código</button>`);$('#nv2-mc').onclick=nvMudarDlg}}catch(e){console.warn(e)}return r}}

/* v0.95 · iPad: menu lateral que abre com os nomes (botão, toque no logótipo ou deslizar da margem) */
const railModo=()=>{try{return matchMedia('(min-width:701px) and (max-width:1100px)').matches}catch(_){return false}};
const RAIL_IC_ABRIR='<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/><path d="M13 10l2 2-2 2"/></svg>';
const RAIL_IC_FECHAR='<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/><path d="M16 10l-2 2 2 2"/></svg>';
function railAbrir(on){if(on&&!railModo())on=false;document.body.classList.toggle('rail-aberta',!!on);const b=$('#railTgl');if(b){b.setAttribute('aria-expanded',on?'true':'false');b.setAttribute('aria-label',on?'Recolher o menu':'Mostrar o menu com os nomes');b.innerHTML=on?RAIL_IC_FECHAR+'<span class="lbl">Recolher</span>':RAIL_IC_ABRIR}
  let bg=$('#railBg');if(on&&!bg){bg=document.createElement('div');bg.id='railBg';bg.onclick=()=>railAbrir(false);document.body.appendChild(bg)}else if(!on&&bg)bg.remove();try{if(on)$('#side').scrollTop=0}catch(_){}}
function railPrep(){const sd=$('#side');if(!sd||$('#railTgl'))return;const br=sd.querySelector('.brand');const b=document.createElement('button');b.type='button';b.id='railTgl';b.className='railtgl';b.innerHTML=RAIL_IC_ABRIR;b.setAttribute('aria-label','Mostrar o menu com os nomes');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','side');
  if(br)br.insertAdjacentElement('afterend',b);else sd.prepend(b);b.onclick=e=>{e.stopPropagation();railAbrir(!document.body.classList.contains('rail-aberta'))};
  if(br){br.style.cursor='pointer';br.addEventListener('click',()=>{if(railModo())railAbrir(!document.body.classList.contains('rail-aberta'))})}
  sd.addEventListener('click',e=>{if(!document.body.classList.contains('rail-aberta'))return;const n=e.target.closest('[data-v],[data-go],.tsec');if(n&&!e.target.closest('.chev'))setTimeout(()=>railAbrir(false),60)})}
railPrep();setInterval(railPrep,1500);
addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('rail-aberta'))railAbrir(false)});
addEventListener('resize',()=>{if(!railModo()&&document.body.classList.contains('rail-aberta'))railAbrir(false)});
{let x0=null,y0r=null,dentro=false;document.addEventListener('touchstart',e=>{if(!railModo()||e.touches.length!==1)return;const t=e.touches[0];const ab=document.body.classList.contains('rail-aberta');dentro=ab&&!!e.target.closest('#side');if(t.clientX<28||dentro||(!ab&&e.target.closest('#side'))){x0=t.clientX;y0r=t.clientY}else x0=null},{passive:true});
  document.addEventListener('touchmove',e=>{if(x0==null)return;const t=e.touches[0];const dx=t.clientX-x0,dy=Math.abs(t.clientY-y0r);if(dy>40){x0=null;return}const ab=document.body.classList.contains('rail-aberta');if(!ab&&dx>48){railAbrir(true);x0=null}else if(ab&&dx<-60){railAbrir(false);x0=null}},{passive:true});
  document.addEventListener('touchend',()=>{x0=null},{passive:true})}

/* v0.97 · o endereço principal passa a ser eduspruce.pt — no eduspruce.app a app guarda tudo na nuvem e muda de endereço sozinha */
const ES_DOM='eduspruce.pt';
(async()=>{try{if(!/^(www\.)?eduspruce\.app$/.test(location.hostname))return;if(/access_token=|[?&#]code=|state=/.test(location.hash+location.search))return;
  const ok=await fetch('https://'+ES_DOM+'/eduspruce-config.json',{cache:'no-store',mode:'cors'}).then(r=>r.ok).catch(()=>false);if(!ok)return; /* o .pt ainda não está no ar (ou a rede bloqueia-o): fica aqui */
  const destino='https://'+ES_DOM+location.pathname+location.search;
  try{esSplash('A EduSpruce mudou para '+ES_DOM+' — a guardar as últimas alterações…');const d=document.getElementById('splash');if(d){d.style.animation='none';d.style.opacity='1'}}catch(_){}
  for(let i=0;i<30;i++){let L={};try{L=nvL()}catch(_){}const pend=Object.keys(L.mod||{}).length;if(!L.prov||!_nvK||!pend)break;if(!_nvBusy){try{await nvSincronizar(false)}catch(_){}}await new Promise(r=>setTimeout(r,1200))}
  try{esSplash('A abrir '+ES_DOM+'… Entre com Google e escreva o seu código: os dados vêm da nuvem.')}catch(_){}
  setTimeout(()=>location.replace(destino),1600)}catch(e){console.warn(e)}})();

/* v1.00 · bloqueio dos dados de base: aviso só 5 s; desbloquear apenas em Definições › Dados e Segurança */
let _bloqBanAte=0;
function bloqIrDef(){toast('Para desbloquear: Definições › Dados e Segurança','aviso');UI.defTab='dados';go('definicoes');setTimeout(()=>{const c=$('#bloq-card');if(c){c.scrollIntoView({behavior:'smooth',block:'center'});c.classList.add('realce');setTimeout(()=>c.classList.remove('realce'),1800)}},350)}
{const _gBB=go;go=function(v){if(v!==go._bbUlt){_bloqBanAte=Date.now()+5000;go._bbUlt=v}return _gBB.apply(this,arguments)};if(go._f)go._f=go._f}
{const _ba=bloqAlternar;bloqAlternar=async function(ligar){if(ligar)_bloqBanAte=Date.now()+5000;return _ba.apply(this,arguments)}}
{const _bu3=bloqUI;bloqUI=function(){const r=_bu3.apply(this,arguments);try{
  const bb=$('#view .bloqban:not(.sug)');if(bb){const falta=_bloqBanAte-Date.now();if(falta<=0){bb.remove()}else{
      const b=bb.querySelector('[data-bloqoff]');if(b){b.innerHTML=ic('gear',14)+' Definições';b.onclick=bloqIrDef}
      const t=bb.querySelector('span:not(.sp1)');if(t&&!t.querySelector('.bloqdef'))t.insertAdjacentHTML('beforeend',' <span class="bloqdef">Para desbloquear: <b>Definições › Dados e Segurança</b>.</span>');
      clearTimeout(bloqUI._t);bloqUI._t=setTimeout(()=>{const x=$('#view .bloqban:not(.sug)');if(x){x.classList.add('fora');setTimeout(()=>x.remove(),450)}},falta)}}
  if(bloqOn())['#bloqBar','#bloqNav'].forEach(q=>{const e=$(q);if(e){e.onclick=bloqIrDef;e.title='Dados de base bloqueados — desbloqueie em Definições › Dados e Segurança';e.setAttribute('aria-label',e.title)}});
  else['#bloqBar','#bloqNav'].forEach(q=>{const e=$(q);if(e)e.onclick=()=>bloqAlternar(true)});
}catch(e){console.warn(e)}return r}}

/* 0.992 · versão discreta junto ao logótipo na barra lateral */
function verSide(){const n=$('#side .brand .bt')||$('#side .brand');if(!n)return;let v=$('#side .bver');if(v&&v.parentElement!==n){v.remove();v=null}if(!v){v=document.createElement('span');v.className='bver';v.title='Versão da app — toque para ver as novidades';n.appendChild(v);v.onclick=e=>{e.stopPropagation();try{UI.defTab='geral';go('ajuda')}catch(_){}}}v.textContent='v'+VERSAO}
verSide();setInterval(verSide,3000);

/* 0.994 · sincronização discreta: só o ícone a rodar; o código escreve-se uma vez por aparelho */
let _nvSil=0,_nvGoPend=null;
{const _nsS=nvSincronizar;nvSincronizar=async function(interativo){if(interativo)return _nsS.apply(this,arguments);_nvSil++;try{return await _nsS.apply(this,arguments)}finally{_nvSil--;if(!_nvSil){try{nvBadge()}catch(_){}}}}}
{const _tS=toast;toast=function(m,tipo){if(_nvSil&&tipo!=='erro'&&/sincroniz|recebid|conflit|parte\(s\)|nuvem|fotografia|enviad/i.test(String(m)))return;return _tS.apply(this,arguments)}}
/* dados que chegam de outro aparelho: não redesenha a página por baixo do dedo */
{const _gS=go;go=function(v){if(_nvSil&&v===VIEW){const ae=document.activeElement;if(ae&&ae.closest&&ae.closest('#view,dialog')&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)||document.querySelector('dialog[open]:not(.nvas)')){_nvGoPend=v;return}try{return manterPosicao(()=>_gS.call(this,v))}catch(_){return _gS.call(this,v)}}return _gS.apply(this,arguments)};if(go._f)go._f=go._f}
document.addEventListener('focusout',()=>setTimeout(()=>{if(_nvGoPend&&!document.querySelector('dialog[open]')){const ae=document.activeElement;if(!(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))){const v=_nvGoPend;_nvGoPend=null;try{manterPosicao(()=>go(v))}catch(_){go(v)}}}},300));
/* código de encriptação lembrado neste aparelho para a mesma conta Google (mesmo depois de terminar a sessão) */
const NV_KEEP='eskeep';
function nvKeepGuardar(){try{const L=nvL();const em=String((gsCfg().email||(SESSAO&&SESSAO.u)||'')).toLowerCase();if(L.k&&L.salt&&em&&L.prov==='google')localStorage.setItem(NV_KEEP,JSON.stringify({e:em,k:L.k,salt:L.salt,t:Date.now()}))}catch(_){}}
function nvKeepRepor(){try{const L=nvL();if(L.k)return false;const K=JSON.parse(localStorage.getItem(NV_KEEP)||'null');if(!K)return false;const em=String((gsCfg().email||(SESSAO&&SESSAO.u)||'')).toLowerCase();if(!em||K.e!==em)return false;nvSet({k:K.k,salt:K.salt,prov:'google',base:null,mod:{}});_nvK=null;return true}catch(_){return false}}
setInterval(nvKeepGuardar,10000);setTimeout(nvKeepGuardar,3000);
{const _sn=sairNuvem;sairNuvem=async function(){nvKeepGuardar();return _sn.apply(this,arguments)}}

/* o código mudou noutro aparelho: a chave lembrada deixa de servir */
{const _nsK=nvSincronizar;nvSincronizar=async function(){const r=await _nsK.apply(this,arguments);try{if(!nvL().k){const K=JSON.parse(localStorage.getItem(NV_KEEP)||'null');if(K&&/não corresponde/.test(nvL().erro||''))localStorage.removeItem(NV_KEEP)}}catch(_){}return r}}
/* assistente: no fim fecha sozinho */
setInterval(()=>{const b=document.querySelector('dialog.nvas #nvas-fim');if(b&&!b.dataset.auto){b.dataset.auto=1;setTimeout(()=>{if(document.body.contains(b))b.click()},2500)}},500);

/* =====================================================================
   0.995 · Módulo opcional «Coord. PROFIJ» — Coordenador(a) do Programa PROFIJ
   (Regulamento PROFIJ: Portaria n.º 52/2016, alterada pela Portaria n.º 86/2018)
   ===================================================================== */
TITLES.cprofij='Coordenação PROFIJ';
if(!CARGOS.includes('Coordenador(a) do PROFIJ'))CARGOS.splice(CARGOS.indexOf('Coordenador(a) do jornal da escola'),0,'Coordenador(a) do PROFIJ');
const cpCargo=()=>{try{const pf=perfil();return Object.values(pf.porEscola||{}).concat([pf]).some(o=>((o&&o.cargos)||[]).some(c=>/profij/i.test(c)))}catch(_){return false}};
const cpTurmas=a=>(a?a.turmas:[]).filter(t=>ofertaDe(t)==='profij');
const cpOn=()=>{const m=S.cfg.modulos&&S.cfg.modulos.cprofij;if(m===false)return false;if(m===true)return true;return cpCargo()||!!(A()&&A().demo&&cpTurmas(A()).length)};
const CP_LEG0=[{id:'l1',t:'Portaria n.º 52/2016 — Regulamento dos cursos do Programa Formativo de Inserção de Jovens (PROFIJ)',u:'',n:'Regulamento base do programa.'},
  {id:'l2',t:'Portaria n.º 86/2018 — altera o Regulamento PROFIJ',u:'https://edu.azores.gov.pt/wp-content/uploads/2017/05/Portaria-N.º-86-2018.pdf',n:'Turmas de 10 a 25 alunos; média de cada componente, FPCT, PAF e classificação final do curso ≥ 10.'},
  {id:'l3',t:'Regimento do Conselho dos Cursos de Formação Profissional (da escola)',u:'',n:'Acrescente a ligação para o regimento da sua escola.'}];
function CP(){const c=S.cprofij=S.cprofij||{};c.leg=c.leg||CP_LEG0.map(x=>({...x}));c.anos=c.anos||{};const a=A();const k=a?a.id:'_';const y=c.anos[k]=c.anos[k]||{};
  y.ent=y.ent||[];y.fpct=y.fpct||{};y.provas=y.provas||[];y.dts=y.dts||{};y.man=y.man||{};return {c,y,a}}
const CP_COMP=[['sociocultural','Sociocult.'],['cientifica','Científica'],['tecnologica','Tecnológica']];
const cpCompKey=t=>{const n=compDe(t.disciplina)||'';return /Sociocultural/.test(n)?'sociocultural':/Científica/.test(n)?'cientifica':/Tecnológica/.test(n)||ehComp(t.disciplina)?'tecnologica':/Prática/.test(n)?'pratica':'sociocultural'};
const cpAlKey=x=>String(x.proc||x.processo||'')||((x.num||'')+'|'+normT(x.nome||''));
/* turmas PROFIJ agrupadas pela classe (o mesmo nome em várias disciplinas) */
function cpClasses(a){const M={};cpTurmas(a).forEach(t=>{const n=t.nome;(M[n]=M[n]||{nome:n,disc:[],al:{}}).disc.push(t);alunosAval(t).forEach(x=>{const k=cpAlKey(x);if(!M[n].al[k])M[n].al[k]={k,nome:x.nome,num:x.num,ref:x,t}})});
  return Object.values(M).map(c=>({...c,curso:(c.disc.find(t=>t.curso)||{}).curso||'',anoEsc:(c.disc[0]||{}).anoEsc||'',formandos:Object.values(c.al).sort((p,q)=>(+p.num||0)-(+q.num||0)||p.nome.localeCompare(q.nome,'pt'))})).sort((p,q)=>p.nome.localeCompare(q.nome,'pt',{numeric:true}))}
/* classificação 0–20 de um formando numa disciplina registada na app */
function cpNotaDisc(t,a,al){const x=alunosAval(t).find(z=>cpAlKey(z)===al.k);if(!x)return null;
  if(Array.isArray(t.modulos)&&t.modulos.length){const v=t.modulos.map(m=>{try{return notaMod(t,x.id,m.id)}catch(_){return null}}).filter(v=>v!=null);if(v.length)return avg(v)}
  try{const f=ponderada(t,pctsFinal(t,x.id));if(f!=null)return f*20}catch(_){}try{const P=periodos();for(let i=P.length-1;i>=0;i--){const f=ponderada(t,pctsPer(t,x.id,P[i]));if(f!=null)return f*20}}catch(_){}return null}
function cpLinha(cl,al,a){const {y}=CP();const man=y.man[cl.nome+'|'+al.k]||{};const r={comp:{},fp:null,paf:null};
  CP_COMP.forEach(([k])=>{if(man[k]!=null&&man[k]!==''){r.comp[k]={v:+man[k],man:true};return}const v=cl.disc.filter(t=>cpCompKey(t)===k).map(t=>cpNotaDisc(t,a,al)).filter(v=>v!=null);r.comp[k]=v.length?{v:avg(v),n:v.length}:null});
  const f=y.fpct[cl.nome+'|'+al.k];if(f&&f.nota!=null&&f.nota!=='')r.fp=+f.nota;
  const pv=y.provas.filter(p=>p.tipo==='PAF'&&p.turma===cl.nome&&(p.alunos||[]).includes(al.k)&&p.notas&&p.notas[al.k]!=null&&p.notas[al.k]!=='');if(pv.length)r.paf=+pv[pv.length-1].notas[al.k];
  const vals=[...CP_COMP.map(([k])=>r.comp[k]&&r.comp[k].v),r.fp,r.paf];const neg=vals.some(v=>v!=null&&Math.round(v)<10);const todos=vals.every(v=>v!=null);
  r.sit=neg?'risco':todos?'ok':'curso';return r}
const cpFmt=v=>v==null?'—':(Math.round(v*10)/10).toString().replace('.',',');
const cpCls=v=>v==null?'mut':Math.round(v)<10?'neg':'pos';
function cpFpctEst(f){if(!f||!f.ent)return 'colocar';const hj=isoHoje();if(f.nota!=null&&f.nota!=='')return 'avaliado';if(f.fim&&f.fim<hj)return 'avaliar';if(f.ini&&f.ini<=hj)return 'curso';return 'colocado'}
const CP_FE={colocar:['Por colocar','bad'],colocado:['Colocado',''],curso:['Em curso','w'],avaliar:['Por avaliar','w'],avaliado:['Avaliado','ok']};
function cpAtencao(){const {y,a}=CP();if(!a)return [];const L=[];const hj=isoHoje();const C=cpClasses(a);
  C.forEach(cl=>cl.formandos.forEach(al=>{const r=cpLinha(cl,al,a);if(r.sit==='risco')L.push({c:'bad',ic:'alert',t:al.nome+' · '+cl.nome,s:'Componente, FPCT ou PAF abaixo de 10',tab:'turmas'});
    const e=cpFpctEst(y.fpct[cl.nome+'|'+al.k]);if(e==='colocar')L.push({c:'w',ic:'building',t:al.nome+' · '+cl.nome,s:'FPCT por colocar numa entidade',tab:'fpct'});else if(e==='avaliar')L.push({c:'w',ic:'clipboard',t:al.nome+' · '+cl.nome,s:'FPCT terminada — falta a classificação',tab:'fpct'})}));
  y.provas.forEach(p=>{if(p.data&&p.data>=hj&&diasEntre(hj,p.data)<=21){if(!(p.juri||'').trim())L.push({c:'w',ic:'users',t:p.tipo+' · '+p.turma+' · '+fmtIsoL(p.data),s:'Prova sem júri definido',tab:'provas'});else L.push({c:'',ic:'calendar',t:p.tipo+' · '+p.turma,s:'Prova '+(p.data===hj?'hoje':'daqui a '+diasEntre(hj,p.data)+' dias')+(p.hora?' às '+p.hora:''),tab:'provas'})}
    if(p.data&&p.data<hj&&(p.alunos||[]).some(k=>!p.notas||p.notas[k]==null||p.notas[k]===''))L.push({c:'w',ic:'pen',t:p.tipo+' · '+p.turma+' · '+fmtIsoL(p.data),s:'Prova realizada — faltam classificações',tab:'provas'})});
  return L}
function cpNav(){const side=$('#side');if(!side)return;let b=$('#side [data-v="cprofij"]');if(!b){const j=$('#side [data-v="jornal"]');if(!j)return;j.insertAdjacentHTML('afterend',`<button class="nav" data-v="cprofij" title="Coordenação do Programa PROFIJ"><span data-ico>${ic('award',18)}</span><span class="lbl">Coord. PROFIJ</span><span class="nbadge" id="cpBadge" hidden></span></button>`);b=$('#side [data-v="cprofij"]');b.onclick=()=>go('cprofij')}
  b.style.display=cpOn()?'':'none';const n=cpOn()?cpAtencao().filter(x=>x.c==='bad').length:0;const bd=$('#cpBadge');if(bd){bd.hidden=!n;bd.textContent=n}}
function vCProfij(){if(!cpOn()){$('#view').innerHTML=`<div class="card empty">${ic('award',30)}<br><b>O módulo Coord. PROFIJ está desativado</b><br><span class="mut">Aparece sozinho quando assinala o cargo «Coordenador(a) do PROFIJ» em Definições › Professor, ou ative-o em Definições › Geral › Módulos Opcionais.</span><br><br><button class="btn pri" id="cp-on">Ativar o Módulo</button></div>`;$('#cp-on').onclick=()=>{cpAtivar(true);go('cprofij')};return}
  const {y,a,c}=CP();const tab=UI.cpTab||'painel';const C=cpClasses(a);const nF=C.reduce((s,x)=>s+x.formandos.length,0);const AT=cpAtencao();
  barBtns([{id:'b-cpcsv',t:ic('download',15)+' Exportar CSV',f:cpCSV},{id:'b-cpics',t:ic('calendar',15)+' Provas (.ics)',f:cpICS},{id:'b-cpcfg',t:ic('gear',15)+' Opções',f:cpOpcoes}]);
  const linhas=[];C.forEach(cl=>cl.formandos.forEach(al=>linhas.push({cl,al,r:cpLinha(cl,al,a)})));
  const risco=linhas.filter(l=>l.r.sit==='risco').length,porCol=linhas.filter(l=>cpFpctEst(y.fpct[l.cl.nome+'|'+l.al.k])==='colocar').length;const hj=isoHoje();const prox=y.provas.filter(p=>p.data&&p.data>=hj&&diasEntre(hj,p.data)<=30).length;
  const kp=(k,i,l,v,s,cls)=>`<button type="button" class="pnk ${cls||''}" data-cpk="${k}"><span class="pnkl">${ic(i,15)} ${l}</span><b>${v}</b><small>${s}</small></button>`;
  const tabs=[['painel','chart','Painel'],['turmas','users','Turmas e Formandos'],['matriz','grid','Matriz e Ponto de Situação'],['plano','calendar','Planeamento Anual'],['fpct','building','FPCT'],['provas','clipboard','PAF e PEA'],['cc','meet','Conselho dos Cursos'],['leg','book','Legislação']];
  let corpo='';
  if(tab==='painel')corpo=`<div class="png2"><section class="card pnat"><div class="row"><h2 style="margin:0">${ic('alert',18)} Precisa da Sua Atenção</h2><span class="tag ${AT.length?'bad':'ok'}">${AT.length||'tudo em dia'}</span></div>
      ${AT.length?`<div class="pnatl">${AT.slice(0,14).map(x=>`<div class="pnai ${x.c}"><span class="pnaic">${ic(x.ic,16)}</span><span class="pnaib"><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span><span class="pnaia"><button type="button" class="btn sm" data-cptab="${x.tab}">Abrir</button></span></div>`).join('')}${AT.length>14?`<p class="mut" style="margin:6px 0 0">… e mais ${AT.length-14}</p>`:''}</div>`:`<p class="mut" style="margin:10px 0 0">${ic('check',14)} Nada pendente no programa.</p>`}</section>
    <section class="card"><div class="row"><h2 style="margin:0">${ic('layers',18)} Turmas do Programa</h2><span class="sp1"></span><button class="btn sm" data-cptab="turmas">Ver</button></div>
      ${C.length?`<table class="lst cpres"><thead><tr><th>Turma</th><th>Curso</th><th>Formandos</th><th>Em risco</th><th>FPCT</th></tr></thead><tbody>${C.map(cl=>{const L=linhas.filter(l=>l.cl===cl);const col=L.filter(l=>cpFpctEst(y.fpct[cl.nome+'|'+l.al.k])!=='colocar').length;return `<tr><td><b>${esc(cl.nome)}</b></td><td>${esc(cl.curso||'—')}</td><td>${cl.formandos.length}</td><td>${L.filter(l=>l.r.sit==='risco').length?`<span class="tag bad">${L.filter(l=>l.r.sit==='risco').length}</span>`:'0'}</td><td>${col}/${L.length} colocados</td></tr>`}).join('')}</tbody></table>`:`<p class="mut">Ainda não há turmas PROFIJ neste ano letivo. Crie-as em Ano Letivo e Turmas (oferta PROFIJ).</p>`}</section></div>`;
  if(tab==='turmas')corpo=C.map(cl=>{const dt=y.dts[cl.nome]!=null?y.dts[cl.nome]:(()=>{try{return dtDe(a,cl.nome)||''}catch(_){return ''}})();
    return `<section class="card cpcl"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('users',18)} ${esc(cl.nome)}</h2><span class="mut">${esc(cl.curso||'Curso por definir')}${cl.anoEsc?' · '+esc(cl.anoEsc):''} · ${cl.formandos.length} formandos · ${cl.disc.length} disciplina(s) nesta app</span><span class="sp1"></span><label class="cpdt">Diretor(a) de turma <input data-cpdt="${esc(cl.nome)}" value="${esc(dt)}" placeholder="Nome"></label></div>
     <div class="tblw"><table class="lst cpt"><thead><tr><th>N.º</th><th>Formando</th>${CP_COMP.map(([,l])=>`<th>${l}</th>`).join('')}<th>FPCT</th><th>PAF</th><th>Situação</th></tr></thead><tbody>
     ${cl.formandos.map(al=>{const r=cpLinha(cl,al,a);return `<tr><td class="n">${esc(al.num||'')}</td><td style="text-align:left">${esc(al.nome)}</td>${CP_COMP.map(([k])=>{const v=r.comp[k];return `<td><button type="button" class="cpv ${cpCls(v&&v.v)} ${v&&v.man?'man':''}" data-cpman="${esc(cl.nome)}|${esc(al.k)}|${k}" title="${v&&v.man?'Média escrita à mão — toque para mudar':v?'Calculada a partir de '+v.n+' disciplina(s) desta app — toque para escrever a média da pauta':'Toque para escrever a média da pauta'}">${cpFmt(v&&v.v)}</button></td>`}).join('')}
       <td><span class="${cpCls(r.fp)}">${cpFmt(r.fp)}</span></td><td><span class="${cpCls(r.paf)}">${cpFmt(r.paf)}</span></td><td>${r.sit==='risco'?'<span class="tag bad">Em risco</span>':r.sit==='ok'?'<span class="tag ok">Tudo ≥ 10</span>':'<span class="tag">Em curso</span>'}</td></tr>`}).join('')}</tbody></table></div></section>`}).join('')||`<div class="card empty">Sem turmas PROFIJ neste ano letivo.</div>`;
  if(tab==='turmas'&&C.length)corpo=`<p class="hint" style="margin:0 0 10px">As médias vêm das disciplinas registadas nesta app (as suas). Para as dos colegas, toque na célula e escreva a média da pauta. A conclusão exige média ≥ 10 em cada componente, na FPCT e na PAF (Portaria n.º 86/2018, art. 27.º).</p>`+corpo;
  if(tab==='fpct')corpo=`<section class="card"><div class="row" style="gap:10px"><h2 style="margin:0">${ic('building',18)} Entidades de Acolhimento</h2><span class="sp1"></span><button class="btn pri sm" id="cp-ent">${ic('plus',14)} Entidade</button></div>
     ${y.ent.length?`<div class="cpents">${y.ent.map(e=>{const n=Object.values(y.fpct).filter(f=>f.ent===e.id).length;return `<button type="button" class="cpent" data-cpent="${e.id}"><b>${esc(e.nome)}</b><small>${esc([e.area,e.tutor?'Tutor: '+e.tutor:'',e.tel].filter(Boolean).join(' · '))}</small><span class="tag">${n} formando(s)</span>${e.prot?`<span class="tag ok">${ic('check',11)} protocolo</span>`:'<span class="tag w">sem protocolo</span>'}</button>`}).join('')}</div>`:'<p class="mut">Ainda não há entidades. Acrescente as empresas e instituições que recebem os formandos.</p>'}</section>
    ${C.map(cl=>`<section class="card"><h2>${ic('clipboard',18)} Formação Prática em Contexto de Trabalho · ${esc(cl.nome)}</h2><div class="tblw"><table class="lst cpf"><thead><tr><th>Formando</th><th>Entidade</th><th>Início</th><th>Fim</th><th>Horas prev.</th><th>Horas feitas</th><th>Classif.</th><th>Estado</th></tr></thead><tbody>
      ${cl.formandos.map(al=>{const K=cl.nome+'|'+al.k;const f=y.fpct[K]||{};const e=cpFpctEst(f);return `<tr><td style="text-align:left">${esc(al.nome)}</td><td><select data-cpf="${esc(K)}|ent"><option value="">— escolher —</option>${y.ent.map(x=>`<option value="${x.id}" ${f.ent===x.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select></td>
        <td><input type="date" data-cpf="${esc(K)}|ini" value="${esc(f.ini||'')}"></td><td><input type="date" data-cpf="${esc(K)}|fim" value="${esc(f.fim||'')}"></td><td><input type="number" min="0" step="1" data-cpf="${esc(K)}|hp" value="${esc(f.hp!=null?f.hp:'')}" style="width:76px"></td><td><input type="number" min="0" step="1" data-cpf="${esc(K)}|hr" value="${esc(f.hr!=null?f.hr:'')}" style="width:76px"></td><td><input type="number" min="0" max="20" step="1" data-cpf="${esc(K)}|nota" value="${esc(f.nota!=null?f.nota:'')}" style="width:64px"></td><td><span class="tag ${CP_FE[e][1]}">${CP_FE[e][0]}</span></td></tr>`}).join('')}</tbody></table></div></section>`).join('')}`;
  if(tab==='provas'){const P=y.provas.slice().sort((p,q)=>(p.data||'9').localeCompare(q.data||'9'));corpo=`<section class="card"><div class="row" style="gap:10px"><h2 style="margin:0">${ic('clipboard',18)} Provas</h2><span class="mut">PAF — Prova de Avaliação Final · PEA — Provas Especiais de Avaliação</span><span class="sp1"></span><button class="btn pri sm" id="cp-prova">${ic('plus',14)} Prova</button></div>
     ${P.length?`<div class="tblw"><table class="lst"><thead><tr><th>Tipo</th><th>Turma</th><th>Data</th><th>Hora</th><th>Sala</th><th>Formandos</th><th>Júri</th><th>Classificadas</th><th></th></tr></thead><tbody>${P.map(p=>{const n=(p.alunos||[]).length,cl=(p.alunos||[]).filter(k=>p.notas&&p.notas[k]!=null&&p.notas[k]!=='').length;return `<tr><td><span class="tag ${p.tipo==='PAF'?'ok':''}">${esc(p.tipo)}</span>${p.ufcd?' <small class="mut">'+esc(p.ufcd)+'</small>':''}</td><td><b>${esc(p.turma)}</b></td><td>${p.data?esc(fmtIsoL(p.data)):'—'}</td><td>${esc(p.hora||'—')}</td><td>${esc(p.sala||'—')}</td><td>${n}</td><td>${(p.juri||'').trim()?esc(p.juri):'<span class="tag w">por definir</span>'}</td><td>${cl}/${n}</td><td class="act"><button class="btn sm" data-cpp="${p.id}">${ic('pencil',14)} Abrir</button></td></tr>`}).join('')}</tbody></table></div>`:'<p class="mut">Ainda não há provas marcadas. Marque a PAF de cada turma e as PEA (recuperação) quando forem precisas.</p>'}</section>`}
  if(tab==='cc'){const R=(()=>{try{return reunioes(a).filter(r=>/profij|conselho dos cursos|forma[çc][ãa]o profissional/i.test(reunTitulo(r,a)+' '+(r.tipo||'')+' '+(r.notas||'')))}catch(_){return []}})().sort((p,q)=>q.data.localeCompare(p.data));
    corpo=`<section class="card"><h2>${ic('meet',18)} Conselho dos Cursos (PROFIJ)</h2><p class="hint" style="margin-top:0">Presidido pelo(a) coordenador(a), com os diretores de turma das turmas PROFIJ. Planeia e acompanha as Provas Especiais de Avaliação, a Formação Prática em Contexto de Trabalho e a Prova de Avaliação Final.</p>
      <h3>Membros</h3><ul class="cpmem"><li><b>${esc(S.cfg.professor||'Coordenador(a)')}</b> — coordenador(a)</li>${C.map(cl=>{const dt=y.dts[cl.nome]!=null?y.dts[cl.nome]:(()=>{try{return dtDe(a,cl.nome)||''}catch(_){return ''}})();return `<li>${dt?esc(dt):'<span class="mut">DT por indicar</span>'} — diretor(a) de turma do ${esc(cl.nome)}</li>`}).join('')}</ul>
      <div class="row" style="gap:8px;margin-top:10px"><button class="btn pri" id="cp-reun">${ic('plus',14)} Convocar Reunião</button><span class="mut" style="font-size:12.5px">Ponha «Conselho dos Cursos PROFIJ» no título para a reunião aparecer aqui.</span></div></section>
      <section class="card"><h2>${ic('list',18)} Reuniões</h2>${R.length?`<ul class="iml">${R.map(r=>{const d=dataDeIso(r.data);return `<li class="imli"><span class="imdt"><b>${d.getDate()}</b><small>${MESES[d.getMonth()+1].slice(0,3)}</small></span><button type="button" class="imlb" data-cpr="${r.id}"><span><b>${esc(reunTitulo(r,a))}</b> <small>${r.semHora?'':fmtHM(r.ini)}${r.local?' · '+esc(r.local):''}</small></span></button>${r.data<isoHoje()?(r.ata||(r.notas||'').trim()?'<span class="tag ok">ata</span>':'<span class="tag w">sem ata</span>'):''}</li>`}).join('')}</ul>`:'<p class="mut">Ainda não há reuniões do Conselho dos Cursos.</p>'}</section>`}
  if(tab==='leg')corpo=`<section class="card"><div class="row"><h2 style="margin:0">${ic('book',18)} Legislação e Documentos de Referência</h2><span class="sp1"></span><button class="btn sm" id="cp-leg">${ic('plus',14)} Acrescentar</button></div>
      <ul class="cpleg">${c.leg.map(l=>`<li><div><b>${l.u?`<a href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t)}</a>`:esc(l.t)}</b>${l.n?`<small>${esc(l.n)}</small>`:''}</div><button class="btn sm ico" data-cplx="${l.id}" aria-label="Editar">${ic('pencil',14)}</button></li>`).join('')}</ul>
      <p class="hint">As ligações ficam guardadas na sua conta e servem para partilhar com os diretores de turma nas reuniões.</p></section>`;
  if(tab==='matriz')corpo=cpmMatrizHTML(a,C);if(tab==='plano')corpo=cpmPlanoHTML(a,C);
  $('#view').innerHTML=`<div class="cp"><div class="pnks">${kp('turmas','layers','Turmas PROFIJ',C.length,nF+' formandos')}${kp('risco','alert','Em Risco',risco,'componente, FPCT ou PAF < 10',risco?'bad':'')}${kp('fpct','building','FPCT por Colocar',porCol,y.ent.length+' entidade(s)',porCol?'w':'')}${kp('provas','clipboard','Provas (30 dias)',prox,y.provas.length+' marcadas')}</div>
    <div class="tabs noprint cptabs">${tabs.map(([k,i,l])=>`<button data-cptab="${k}" class="${tab===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>${corpo}</div>`;
  const v=$('#view');const re=()=>manterPosicao(vCProfij);
  v.querySelectorAll('[data-cptab]').forEach(b=>b.onclick=()=>{UI.cpTab=b.dataset.cptab;vCProfij()});
  if(tab==='matriz')cpmBindMatriz(v,a);if(tab==='plano')cpmBindPlano(v,a);
  v.querySelectorAll('[data-cpk]').forEach(b=>b.onclick=()=>{UI.cpTab={turmas:'turmas',risco:'turmas',fpct:'fpct',provas:'provas'}[b.dataset.cpk];vCProfij()});
  v.querySelectorAll('[data-cpdt]').forEach(i=>i.onchange=()=>{y.dts[i.dataset.cpdt]=i.value.trim();save()});
  v.querySelectorAll('[data-cpman]').forEach(b=>b.onclick=()=>{const [cn,k,comp]=b.dataset.cpman.split('|');const K=cn+'|'+k;const atual=(y.man[K]||{})[comp];const r=prompt('Média da componente '+CP_COMP.find(x=>x[0]===comp)[1]+' (0–20), tal como na pauta.\nDeixe vazio para voltar ao cálculo automático.',atual!=null?atual:'');if(r==null)return;const n=r.trim()===''?null:+r.replace(',','.');if(n!=null&&(isNaN(n)||n<0||n>20))return toast('Escreva um valor de 0 a 20','erro');y.man[K]=y.man[K]||{};if(n==null)delete y.man[K][comp];else y.man[K][comp]=n;save();re()});
  v.querySelectorAll('[data-cpf]').forEach(i=>i.onchange=()=>{const p=i.dataset.cpf.split('|');const campo=p.pop();const K=p.join('|');const f=y.fpct[K]=y.fpct[K]||{};let val=i.value;if(['hp','hr','nota'].includes(campo))val=val===''?null:Math.max(0,campo==='nota'?Math.min(20,+val):+val);f[campo]=val;save();re()});
  const be=$('#cp-ent');if(be)be.onclick=()=>cpEntDlg();v.querySelectorAll('[data-cpent]').forEach(b=>b.onclick=()=>cpEntDlg(b.dataset.cpent));
  const bp=$('#cp-prova');if(bp)bp.onclick=()=>cpProvaDlg();v.querySelectorAll('[data-cpp]').forEach(b=>b.onclick=()=>cpProvaDlg(b.dataset.cpp));
  const br=$('#cp-reun');if(br)br.onclick=()=>{go('reunioes');toast('Nova reunião: escreva «Conselho dos Cursos PROFIJ» no título e convoque os diretores de turma','ok')};
  v.querySelectorAll('[data-cpr]').forEach(b=>b.onclick=()=>{try{reuniaoVer(b.dataset.cpr)}catch(_){go('reunioes')}});
  const bl=$('#cp-leg');if(bl)bl.onclick=()=>cpLegDlg();v.querySelectorAll('[data-cplx]').forEach(b=>b.onclick=()=>cpLegDlg(b.dataset.cplx));
  cpNav()}
function cpEntDlg(id){const {y}=CP();const e=id?y.ent.find(x=>x.id===id):{id:uid(),nome:''};if(!e)return;const F=[['nome','Nome da entidade'],['area','Área / setor'],['morada','Morada'],['tutor','Tutor(a) na entidade'],['tel','Telefone'],['email','E-mail'],['prot','Protocolo assinado em (data)','date'],['nota','Notas']];
  openDrawer(id?'Entidade de Acolhimento':'Nova Entidade de Acolhimento',`<div class="ed">${F.map(([k,l,tp])=>`<label>${l}</label>${k==='nota'?`<textarea id="ce-${k}" rows="3">${esc(e[k]||'')}</textarea>`:`<input id="ce-${k}" ${tp?`type="${tp}"`:''} value="${esc(e[k]||'')}">`}`).join('')}
   <div class="row" style="margin-top:12px">${id?`<button class="btn dng" id="ce-del">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn pri" id="ce-ok">${ic('check',15)} Guardar</button></div></div>`);
  $('#ce-ok').onclick=()=>{F.forEach(([k])=>e[k]=$('#ce-'+k).value.trim());if(!e.nome)return toast('Escreva o nome da entidade','erro');if(!id)y.ent.push(e);save();audit('Coord. PROFIJ',id?'Entidade alterada':'Entidade criada',e.nome);closeDrawer();vCProfij()};
  const d=$('#ce-del');if(d)d.onclick=()=>{if(!confirm('Apagar a entidade «'+e.nome+'»? Os formandos colocados ficam sem entidade.'))return;y.ent=y.ent.filter(x=>x!==e);Object.values(y.fpct).forEach(f=>{if(f.ent===e.id)f.ent=''});save();closeDrawer();vCProfij()}}
function cpProvaDlg(id){const {y,a}=CP();const C=cpClasses(a);const p=id?y.provas.find(x=>x.id===id):{id:uid(),tipo:'PAF',turma:(C[0]||{}).nome||'',alunos:[],notas:{}};if(!p)return;
  const desenha=()=>{const cl=C.find(x=>x.nome===p.turma);openDrawer(id?'Prova':'Nova Prova',`<div class="ed"><div class="jn-g3"><div><label>Tipo</label><select id="cq-tipo"><option value="PAF" ${p.tipo==='PAF'?'selected':''}>PAF — Prova de Avaliação Final</option><option value="PEA" ${p.tipo==='PEA'?'selected':''}>PEA — Prova Especial de Avaliação</option></select></div><div><label>Turma</label><select id="cq-turma">${C.map(x=>`<option ${x.nome===p.turma?'selected':''}>${esc(x.nome)}</option>`).join('')}</select></div><div><label>UFCD / disciplina (PEA)</label><input id="cq-ufcd" value="${esc(p.ufcd||'')}" placeholder="opcional"></div></div>
    <div class="jn-g3"><div><label>Data</label><input type="date" id="cq-data" value="${esc(p.data||'')}"></div><div><label>Hora</label><input type="time" id="cq-hora" value="${esc(p.hora||'')}"></div><div><label>Sala</label><input id="cq-sala" value="${esc(p.sala||'')}"></div></div>
    <label>Júri</label><input id="cq-juri" value="${esc(p.juri||'')}" placeholder="Nomes, separados por vírgulas">
    <label>Formandos e classificações (0–20)</label><div class="cpal">${cl?cl.formandos.map(al=>`<div class="cpali"><label class="chk"><input type="checkbox" data-cqa="${esc(al.k)}" ${(p.alunos||[]).includes(al.k)?'checked':''}> ${esc(al.num?al.num+'. ':'')}${esc(al.nome)}</label><input type="number" min="0" max="20" step="1" data-cqn="${esc(al.k)}" value="${esc(p.notas&&p.notas[al.k]!=null?p.notas[al.k]:'')}" placeholder="—"></div>`).join(''):'<p class="mut">Escolha a turma.</p>'}</div>
    <div class="row" style="gap:8px;margin:6px 0 0"><button class="btn sm" id="cq-todos">Todos</button><button class="btn sm" id="cq-nenhum">Nenhum</button></div>
    <label>Notas</label><textarea id="cq-nota" rows="2">${esc(p.nota||'')}</textarea>
    <div class="row" style="margin-top:12px">${id?`<button class="btn dng" id="cq-del">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn pri" id="cq-ok">${ic('check',15)} Guardar</button></div></div>`);
    const ler=()=>{p.tipo=$('#cq-tipo').value;p.ufcd=$('#cq-ufcd').value.trim();p.data=$('#cq-data').value;p.hora=$('#cq-hora').value;p.sala=$('#cq-sala').value.trim();p.juri=$('#cq-juri').value.trim();p.nota=$('#cq-nota').value.trim();
      p.alunos=[...document.querySelectorAll('[data-cqa]')].filter(x=>x.checked).map(x=>x.dataset.cqa);p.notas=p.notas||{};document.querySelectorAll('[data-cqn]').forEach(x=>{const v=x.value===''?null:Math.max(0,Math.min(20,+x.value));if(v==null)delete p.notas[x.dataset.cqn];else p.notas[x.dataset.cqn]=v})};
    $('#cq-turma').onchange=()=>{ler();p.turma=$('#cq-turma').value;p.alunos=[];desenha()};
    $('#cq-todos').onclick=()=>document.querySelectorAll('[data-cqa]').forEach(x=>x.checked=true);$('#cq-nenhum').onclick=()=>document.querySelectorAll('[data-cqa]').forEach(x=>x.checked=false);
    $('#cq-ok').onclick=()=>{ler();if(!p.turma)return toast('Escolha a turma','erro');if(!id&&!y.provas.includes(p))y.provas.push(p);save();audit('Coord. PROFIJ',id?'Prova alterada':'Prova marcada',p.tipo+' · '+p.turma+(p.data?' · '+p.data:''));closeDrawer();vCProfij()};
    const d=$('#cq-del');if(d)d.onclick=()=>{if(!confirm('Apagar esta prova?'))return;y.provas=y.provas.filter(x=>x!==p);save();closeDrawer();vCProfij()}};
  if(!id&&!p.alunos.length){const cl=C.find(x=>x.nome===p.turma);if(cl&&p.tipo==='PAF')p.alunos=cl.formandos.map(x=>x.k)}desenha()}
function cpLegDlg(id){const {c}=CP();const l=id?c.leg.find(x=>x.id===id):{id:uid(),t:'',u:'',n:''};if(!l)return;
  openDrawer(id?'Documento de Referência':'Novo Documento de Referência',`<div class="ed"><label>Título</label><input id="cl-t" value="${esc(l.t)}"><label>Ligação (opcional)</label><input id="cl-u" type="url" value="${esc(l.u||'')}" placeholder="https://…"><label>Nota</label><textarea id="cl-n" rows="3">${esc(l.n||'')}</textarea>
   <div class="row" style="margin-top:12px">${id?`<button class="btn dng" id="cl-del">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn pri" id="cl-ok">${ic('check',15)} Guardar</button></div></div>`);
  $('#cl-ok').onclick=()=>{l.t=$('#cl-t').value.trim();l.u=$('#cl-u').value.trim();l.n=$('#cl-n').value.trim();if(!l.t)return toast('Escreva o título','erro');if(l.u&&!/^https?:\/\//i.test(l.u))l.u='https://'+l.u;if(!id)c.leg.push(l);save();closeDrawer();vCProfij()};
  const d=$('#cl-del');if(d)d.onclick=()=>{c.leg=c.leg.filter(x=>x!==l);save();closeDrawer();vCProfij()}}
function cpCSV(){const {y,a}=CP();const R=[['Turma','Curso','N.º','Formando',...CP_COMP.map(([,l])=>l),'FPCT entidade','FPCT início','FPCT fim','FPCT horas','FPCT classificação','PAF','Situação']];
  cpClasses(a).forEach(cl=>cl.formandos.forEach(al=>{const r=cpLinha(cl,al,a);const f=y.fpct[cl.nome+'|'+al.k]||{};const e=y.ent.find(x=>x.id===f.ent);R.push([cl.nome,cl.curso,al.num,al.nome,...CP_COMP.map(([k])=>r.comp[k]?cpFmt(r.comp[k].v):''),e?e.nome:'',f.ini||'',f.fim||'',f.hr!=null?f.hr:'',f.nota!=null?f.nota:'',r.paf!=null?r.paf:'',{risco:'Em risco',ok:'Tudo ≥ 10',curso:'Em curso'}[r.sit]])}));
  download('Coordenação PROFIJ.csv',csv(R),'text/csv')}
function cpICS(){const {y}=CP();const P=y.provas.filter(p=>p.data);if(!P.length)return toast('Não há provas com data','aviso');
  const ev=P.map(p=>{const [h,m]=(p.hora||'09:00').split(':').map(Number);const d=dataDeIso(p.data);d.setHours(h,m||0,0,0);const f=new Date(d.getTime()+90*6e4);
    return ['BEGIN:VEVENT','UID:cp-'+p.id+'@eduspruce.app','DTSTAMP:'+icsData(new Date()),'DTSTART:'+icsData(d),'DTEND:'+icsData(f),'SUMMARY:'+icsEsc(p.tipo+' · '+p.turma+(p.ufcd?' · '+p.ufcd:'')),p.sala?'LOCATION:'+icsEsc(p.sala):'','DESCRIPTION:'+icsEsc('Júri: '+(p.juri||'por definir')),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(p.tipo+' · '+p.turma),'TRIGGER:-P1D','END:VALARM','END:VEVENT'].filter(Boolean).join('\r\n')});
  download('Provas PROFIJ.ics',['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EduSpruce//PROFIJ//PT','METHOD:PUBLISH',...ev,'END:VCALENDAR'].join('\r\n'),'text/calendar')}
function cpOpcoes(){openDrawer('Coord. PROFIJ',`<div class="ed"><p class="hint" style="margin-top:0">O módulo aparece sozinho quando o cargo «Coordenador(a) do PROFIJ» está assinalado em Definições › Professor › Cargos e Funções. Os dados (entidades, FPCT, provas, médias escritas à mão) ficam guardados por ano letivo e sincronizados com a sua conta.</p><div class="row" style="margin-top:12px"><button class="btn" id="co-off">Desativar o módulo</button><span class="sp1"></span><button class="btn pri" id="co-x">Fechar</button></div></div>`);
  $('#co-x').onclick=closeDrawer;$('#co-off').onclick=()=>{if(confirm('Desativar o módulo Coord. PROFIJ? Os dados ficam guardados.')){cpAtivar(false);closeDrawer();go('inicio')}}}
function cpAtivar(on){S.cfg.modulos=S.cfg.modulos||{};S.cfg.modulos.cprofij=!!on;save();audit('Coord. PROFIJ',on?'Módulo ativado':'Módulo desativado','');cpNav()}
if(go._f)go._f.cprofij=vCProfij;
{const _gC=go;go=function(v){if(v==='cprofij'&&go._f&&!go._f.cprofij)go._f.cprofij=vCProfij;const r=_gC.apply(this,arguments);try{cpNav();$$('#side [data-v="cprofij"]').forEach(b=>b.classList.toggle('on',v==='cprofij'))}catch(_){}return r}}
setTimeout(cpNav,400);setInterval(cpNav,15000);
/* Definições › Módulos Opcionais */
{const _ca2=cartaoAvisosDef,_ba2=bindAvisosDef;cartaoAvisosDef=function(){let h=_ca2.apply(this,arguments);return h.replace(/(<div class="card ed" id="def-mods">[\s\S]*?)(<\/div>)$/,`$1<label class="chk" style="margin-top:8px"><input type="checkbox" id="mod-cp" ${cpOn()?'checked':''}> ${ic('award',15)} <span><b>Coord. PROFIJ</b><br><span class="mut">Coordenação do Programa PROFIJ: turmas e formandos, FPCT, PAF e PEA, Conselho dos Cursos e legislação</span></span></label>$2`)};
  bindAvisosDef=function(){const r=_ba2.apply(this,arguments);const c=$('#mod-cp');if(c)c.onchange=()=>{cpAtivar(c.checked);toast(c.checked?'Módulo Coord. PROFIJ ativado':'Módulo Coord. PROFIJ desativado','ok')};return r}}
/* avisos urgentes: provas sem júri nos próximos 7 dias e formandos em risco */
{const _au=avisosUrgentes;avisosUrgentes=function(){const L=_au.apply(this,arguments);try{if(cpOn()){const {y}=CP();const hj=isoHoje();const V=avVistos(),agora=Date.now();y.provas.forEach(p=>{if(p.data&&p.data>=hj&&diasEntre(hj,p.data)<=7&&!(p.juri||'').trim()){const k='cp:j:'+p.id;if(!(V[k]&&V[k]>agora))L.push({k,ic:'users',cor:'#b8860b',t:p.tipo+' sem júri · '+p.turma,s:'Prova '+fmtIsoL(p.data),ir:()=>{UI.cpTab='provas';go('cprofij')}})}})}}catch(_){}return L}}
try{AJUDA.push({id:'cprofij',ic:'award',t:'Coord. PROFIJ — Coordenação do Programa PROFIJ',gif:null,txt:`<p>Módulo opcional para o(a) <b>coordenador(a) do PROFIJ</b>. Aparece sozinho quando assinala o cargo «Coordenador(a) do PROFIJ» em Definições › Professor (ou em Definições › Geral › Módulos Opcionais).</p><ul><li><b>Painel</b>: turmas PROFIJ, formandos em risco, FPCT por colocar, provas dos próximos 30 dias e o que precisa de atenção.</li><li><b>Turmas e Formandos</b>: médias por componente (sociocultural, científica, tecnológica), FPCT e PAF de cada formando, com a regra da Portaria n.º 86/2018 (≥ 10 em cada uma). As médias vêm das suas disciplinas; as dos colegas escrevem-se à mão a partir da pauta. Indique o diretor de turma de cada turma.</li><li><b>FPCT</b>: entidades de acolhimento (tutor, contactos, protocolo) e, por formando, entidade, datas, horas previstas e feitas, classificação e estado.</li><li><b>PAF e PEA</b>: marcar provas com data, hora, sala, júri, formandos e classificações; exportar para o Calendário (.ics) com alarme na véspera.</li><li><b>Conselho dos Cursos</b>: membros (coordenador e diretores de turma) e as reuniões com «Conselho dos Cursos PROFIJ» no título, com o estado da ata.</li><li><b>Legislação</b>: Portaria n.º 52/2016, Portaria n.º 86/2018 e os documentos da escola, com ligações.</li><li><b>Exportar CSV</b> com a situação de todos os formandos.</li></ul>`})}catch(_){}

