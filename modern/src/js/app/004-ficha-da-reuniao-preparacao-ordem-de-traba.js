/* ---------- ficha da reunião (preparação, ordem de trabalhos, notas, tarefas) ---------- */
function reuniaoVer(id){const a=A();if(!a)return;if(String(id).startsWith('av:')){UI.reTab='prox';toast('Reunião de avaliação: edite-a na Marcação de Testes (painel de avaliação).');return}
  const r=reunioes(a).find(x=>x.id===id);if(!r)return;const T_=reunTipo(r);const t=reunTurma(r,a);const c=reunAtiva(r)?conflitosReuniao(a,r):[];
  const lista=(k,f)=>(r[k]||[]).map((o,i)=>`<label class="chk rck"><input type="checkbox" data-${k}="${i}" ${o[f]?'checked':''}> <span>${esc(o.t)}</span></label>`).join('');
  const html=`<div class="rver" style="--rc:${T_.cor}">
    <div class="rvh"><span class="rbadge">${T_.ab}</span><div><b>${esc(reunTitulo(r,a))}</b><div class="mut">${esc(T_.n)}${reunTurmas(r,a).length?' · '+reunTurmas(r,a).map(x=>esc(x.nome)+' ('+esc(x.disciplina)+')').join(', '):''}</div></div><span class="rest" style="--ec:${REUN_EST[r.estado].cor}">${REUN_EST[r.estado].n}</span></div>
    <div class="rvq"><div>${ic('calendar',15)} <b>${esc(DIAS[dataDeIso(r.data).getDay()])}, ${esc(fmtIsoL(r.data).split(', ')[1])}</b> · ${fmtHM(r.ini)}${r.fim!=null?'–'+fmtHM(r.fim)+' <span class="mut">('+durTxt(r.fim-r.ini)+')</span>':''}</div>
      <div>${ic('clock',15)} ${reunAtiva(r)?esc(quandoTxt(r)):esc(contagem(r.data))}</div>${r.local?`<div>${ic('flag',15)} ${esc(r.local)}</div>`:''}${r.convocante?`<div>${ic('user',15)} Convocada por ${esc(r.convocante)}</div>`:''}${r.participantes?`<div>${ic('users',15)} ${esc(r.participantes)}</div>`:''}
      ${(r.lembretes||[]).length?`<div>${ic('bell',15)} ${r.lembretes.slice().sort((x,y)=>y-x).map(m=>(REUN_LEMB.find(x=>x[0]===m)||[0,m+' min'])[1]).join(', ')} antes</div>`:''}</div>
    ${r.link?`<a class="btn pri" href="${esc(r.link)}" target="_blank" rel="noopener" style="margin-top:10px">${ic('mic',15)} Entrar na Reunião Online</a>`:''}
    ${c.length?`<div class="alert w" style="margin-top:12px">${ic('alert',15)} Sobrepõe-se a ${c.map(x=>'<b>'+esc(x.lbl)+'</b>').join(', ')}.</div>`:''}
    <div class="row" style="gap:6px;margin-top:14px;flex-wrap:wrap"><button class="btn sm" id="rv-ed">${ic('pencil',14)} Editar</button>${reunAtiva(r)?`<button class="btn sm" id="rv-real">${ic('check',14)} Realizada</button><button class="btn sm" id="rv-adi">${ic('clock',14)} Adiar</button><button class="btn sm" id="rv-can">${ic('calx',14)} Cancelar</button>`:`<button class="btn sm" id="rv-reab">${ic('refresh',14)} Reabrir</button>`}<button class="btn sm" id="rv-ics">${ic('download',14)} Calendário (.ics)</button></div>
    ${(r.prep||[]).length?`<h3>${ic('checks',15)} Preparação <span class="mut">${r.prep.filter(p=>p.ok).length}/${r.prep.length}</span></h3><div class="pbar"><span style="width:${Math.round(100*r.prep.filter(p=>p.ok).length/r.prep.length)}%"></span></div>${lista('prep','ok')}`:''}
    ${(r.ordem||[]).length?`<h3>${ic('list',15)} Ordem de Trabalhos</h3>${lista('ordem','feito')}`:''}
    <h3>${ic('pen',15)} Notas / Ata</h3><textarea id="rv-not" class="autoalto" rows="6" placeholder="Apontamentos durante a reunião — servem de base à ata.">${esc(r.notas||'')}</textarea>
    <div class="row" style="gap:6px;margin-top:8px"><button class="btn sm" id="rv-ata">${ic('file',14)} Descarregar Ata (.doc)</button><button class="btn sm" id="rv-cop">${ic('copy',14)} Copiar Ata</button></div>
    <h3>${ic('target',15)} Decisões e Tarefas</h3><div id="rv-dec">${(r.decisoes||[]).map((d,i)=>`<div class="rdec ${d.ok?'ok':''} ${!d.ok&&d.prazo&&d.prazo<isoData(new Date())?'atr':''}"><input type="checkbox" data-dk="${i}" ${d.ok?'checked':''} aria-label="Concluída"><span><b>${esc(d.t)}</b><span class="mut">${d.resp?esc(d.resp):''}${d.prazo?(d.resp?' · ':'')+'até '+esc(fmtIsoL(d.prazo)):''}</span></span><button class="btn sm ico" data-dx="${i}" aria-label="Apagar tarefa">${ic('x',13)}</button></div>`).join('')||'<p class="mut" style="margin:0">Sem tarefas registadas.</p>'}</div>
    <div class="rdnew"><input id="rd-t" placeholder="Nova tarefa ou decisão…"><input id="rd-r" placeholder="Responsável" value="${esc(S.cfg.professor?'Eu':'')}"><input type="date" id="rd-p"><button class="btn sm pri" id="rd-ok">${ic('plus',14)}</button></div></div>`;
  openDrawer('Reunião',html);
  const salvar=()=>{saveNow();if(VIEW==='reunioes')vReunioes();else if(VIEW==='inicio')go('inicio')};
  $$('[data-prep]').forEach(x=>x.onchange=()=>{r.prep[+x.dataset.prep].ok=x.checked;salvar();reuniaoVer(id)});
  $$('[data-ordem]').forEach(x=>x.onchange=()=>{r.ordem[+x.dataset.ordem].feito=x.checked;save()});
  $('#rv-not').addEventListener('input',e=>{r.notas=e.target.value;save()});autoAlto($('#rv-not'));$('#rv-not').addEventListener('change',()=>{if(VIEW==='reunioes')vReunioes()});
  $$('[data-dk]').forEach(x=>x.onchange=()=>{r.decisoes[+x.dataset.dk].ok=x.checked;salvar();reuniaoVer(id)});
  $$('[data-dx]').forEach(x=>x.onclick=()=>{r.decisoes.splice(+x.dataset.dx,1);salvar();reuniaoVer(id)});
  const nova=()=>{const tx=$('#rd-t').value.trim();if(!tx)return $('#rd-t').focus();(r.decisoes=r.decisoes||[]).push({id:uid(),t:tx,resp:$('#rd-r').value.trim(),prazo:$('#rd-p').value||'',ok:false});salvar();reuniaoVer(id);setTimeout(()=>$('#rd-t')&&$('#rd-t').focus(),50)};
  $('#rd-ok').onclick=nova;$('#rd-t').onkeydown=e=>{if(e.key==='Enter')nova()};
  $('#rv-ed').onclick=()=>{closeDrawer();setTimeout(()=>reuniaoDlg(id),60)};
  const est=v=>{r.estado=v;salvar();toast('Reunião '+REUN_EST[v].n.toLowerCase(),'ok');reuniaoVer(id)};
  if($('#rv-real'))$('#rv-real').onclick=()=>est('realizada');if($('#rv-can'))$('#rv-can').onclick=()=>{if(confirm('Marcar a reunião como cancelada?'))est('cancelada')};if($('#rv-reab'))$('#rv-reab').onclick=()=>est('agendada');
  if($('#rv-adi'))$('#rv-adi').onclick=()=>{const v=prompt('Nova data (dd/mm/aaaa) — deixe em branco para “adiada, sem data”:',r.data.split('-').reverse().join('/'));if(v===null)return;
    const m=v.match(/(\d{1,2})\D(\d{1,2})\D(\d{4})/);if(m){r.data=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');r.estado='agendada';r.avisados={};toast('Reunião adiada para '+fmtIsoL(r.data),'ok')}else{r.estado='adiada';toast('Reunião adiada (sem nova data)')}salvar();reuniaoVer(id)};
  $('#rv-ics').onclick=()=>exportarICS([r],reunTitulo(r,a));
  $('#rv-ata').onclick=()=>download('Ata '+reunTitulo(r,a).replace(/[\\/:*?"<>|]/g,'-')+' '+r.data+'.doc',ataHTML(r),'application/msword');
  $('#rv-cop').onclick=async()=>{try{await navigator.clipboard.writeText(ataTexto(r));toast('Ata copiada','ok')}catch(_){prompt('Copie o texto:',ataTexto(r))}}}
/* ---------- vista principal ---------- */
function vReunioes(){const a=A();if(!a){$('#view').innerHTML='<div class="card empty">Crie primeiro o ano letivo.</div>';return}
  const tab=UI.reTab||'prox';const R=todasReunioes(a);const hj=isoData(new Date());const agora=Date.now();
  barBtns([{id:'b-rn',t:ic('plus',15)+' Nova Reunião',c:'pri',f:()=>reuniaoDlg()},{id:'b-rics',t:ic('download',15)+' Exportar (.ics)',f:()=>{const L=reunioes(a).filter(r=>reunAtiva(r)&&r.data>=hj);if(!L.length)return toast('Não há reuniões agendadas para exportar');exportarICS(L,'Reuniões '+a.nome.replace('/','-'))}},{id:'b-rpr',t:ic('printer',15)+' Imprimir',f:()=>window.print()}]);
  const prox=R.filter(r=>reunAtiva(r)&&reunFim(r).getTime()>=agora);const p0=prox.find(r=>!r.semHora)||prox[0];
  const fimSem=isoData(new Date(dataDeIso(inicioSemana(hj)).getTime()+6*864e5));const semana=prox.filter(r=>r.data<=fimSem).length;
  const tar=reunioes(a).flatMap(r=>(r.decisoes||[]).map(d=>({d,r}))).filter(x=>!x.d.ok);const atr=tar.filter(x=>x.d.prazo&&x.d.prazo<hj).length;
  const atas=reunioes(a).filter(pendAta).length;const AV=avisosReunioes(a);
  const notif='Notification' in window?Notification.permission:'na';
  const kpis=`<div class="kpis">
    <div class="kpi"><div class="l">${ic('clock',14)} Próxima Reunião</div><div class="v">${p0?esc(quandoTxt(p0)):'—'}</div><div class="mut">${p0?esc(reunTitulo(p0,a))+(p0.semHora?'':' · '+fmtHM(p0.ini)):'Sem reuniões agendadas'}</div></div>
    <div class="kpi"><div class="l">${ic('calendar',14)} Esta Semana</div><div class="v">${semana}</div><div class="mut">${prox.length} agendadas no total</div></div>
    <div class="kpi"><div class="l">${ic('checks',14)} Tarefas Pendentes</div><div class="v">${tar.length}</div><div class="mut">${atr?'<b style="color:var(--bad,#c0392b)">'+atr+' em atraso</b>':'nenhuma em atraso'}</div></div>
    <div class="kpi"><div class="l">${ic('file',14)} Atas por Fazer</div><div class="v">${atas}</div><div class="mut">reuniões realizadas sem notas</div></div></div>`;
  const avisos=AV.length?`<div class="card ravisos"><div class="row"><h2 style="margin:0">${ic('bell',18)} Avisos</h2><span class="sp1"></span><span class="mut">${AV.length}</span></div>${AV.slice(0,8).map((v,i)=>`<div class="rav ${v.g}"><span class="rdot"></span><span>${v.t}</span>${v.acao?`<button class="btn sm" data-rav="${i}">Marcar Realizada</button>`:''}<button class="btn sm" data-rvo="${v.r.id}">Abrir</button></div>`).join('')}</div>`:'';
  const notifCard=notif==='granted'?'':`<div class="rnotif mut">${ic('bell',14)} Lembretes ${notif==='granted'?'com notificações do sistema ativas':'na app (enquanto estiver aberta)'}${notif==='default'?' · <button class="lnk" id="r-notif">ativar notificações</button>':''} · para avisos com a app fechada, <button class="lnk" id="r-ics2">exporte para o Calendário</button>.</div>`;
  const tabs=`<div class="tabs noprint">${[['prox','list','Próximas'],['cal','calendar','Mapa Mensal'],['tar','checks','Tarefas'],['hist','file','Histórico e Atas']].map(([k,i,l])=>`<button data-rtab="${k}" class="${tab===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>`;
  const linha=r=>{const T_=reunTipo(r);const t=reunTurma(r,a);const c=reunAtiva(r)&&!r.ext?conflitosReuniao(a,r).length:0;const pp=(r.prep||[]).length?r.prep.filter(p=>p.ok).length+'/'+r.prep.length:'';const d=dataDeIso(r.data);
    return `<button class="rlin ${r.estado}" data-ro="${r.id}" style="--rc:${T_.cor}"><span class="rdt"><b>${d.getDate()}</b><span>${MESES[d.getMonth()+1].slice(0,3)}</span></span>
      <span class="rinf"><b>${esc(reunTitulo(r,a))}</b><span class="mut">${esc(DIAS_C[d.getDay()])} · ${r.semHora?'hora por definir':fmtHM(r.ini)+(r.fim!=null?'–'+fmtHM(r.fim):'')}${r.local?' · '+esc(r.local):''}${t&&r.titulo?' · '+esc(reunTurmasTxt(r,a)):''}</span></span>
      <span class="rtags">${r.ext?'<span class="tag">Marcação de Testes</span>':''}${c?`<span class="tag bad">${ic('alert',12)} sobreposição</span>`:''}${pp?`<span class="tag">${ic('checks',12)} ${pp}</span>`:''}${(r.lembretes||[]).length&&reunAtiva(r)?`<span class="tag">${ic('bell',12)}</span>`:''}${r.link?`<span class="tag">online</span>`:''}${r.estado!=='agendada'?`<span class="tag" style="--ec:${REUN_EST[r.estado].cor}">${REUN_EST[r.estado].n}</span>`:''}</span>
      <span class="rqd">${reunAtiva(r)?esc(quandoTxt(r)):''}</span></button>`};
  let corpo='';
  if(tab==='prox'){const grupos=[['Hoje',r=>r.data===hj],['Amanhã',r=>r.data===isoData(new Date(Date.now()+864e5))],['Esta Semana',r=>r.data<=fimSem],['Próximas Semanas',r=>r.data<=isoData(new Date(Date.now()+35*864e5))],['Mais Tarde',()=>true]];
    const usados=new Set();const G=grupos.map(([n,f])=>[n,prox.filter(r=>!usados.has(r.id)&&f(r)).map(r=>(usados.add(r.id),r))]).filter(g=>g[1].length);
    const adi=reunioes(a).filter(r=>r.estado==='adiada'&&reunFim(r).getTime()<agora);
    corpo=G.length?G.map(([n,L])=>`<div class="card"><h2>${n} <span class="mut" style="font-weight:500">${L.length}</span></h2><div class="rlista">${L.map(linha).join('')}</div></div>`).join(''):`<div class="card empty">${ic('users',30)}<br><b>Sem reuniões agendadas</b><br><span class="mut">Registe conselhos de turma, reuniões de departamento e de grupo, atendimentos… com lembretes, ordem de trabalhos, preparação e ata.</span><br><br><button class="btn pri" id="r-nova">${ic('plus',15)} Nova Reunião</button></div>`;
    if(adi.length)corpo+=`<div class="card"><h2>Adiadas sem nova data</h2><div class="rlista">${adi.map(linha).join('')}</div></div>`}
  else if(tab==='cal'){const base=UI.reMes||hj.slice(0,7);const [y,m]=base.split('-').map(Number);const d1=new Date(y,m-1,1);const off=(d1.getDay()+6)%7;const nd=new Date(y,m,0).getDate();const cal=a.calendario;
    let cel='';for(let k=0;k<off;k++)cel+='<div class="rmc vz"></div>';
    for(let dd=1;dd<=nd;dd++){const iso=y+'-'+String(m).padStart(2,'0')+'-'+String(dd).padStart(2,'0');const L=R.filter(r=>r.data===iso);const tp=cal&&cal.dias?cal.dias[iso]:'';const fds=[0,6].includes(new Date(y,m-1,dd).getDay());
      cel+=`<div class="rmc ${iso===hj?'hj':''} ${fds?'fds':''} ${tp&&!['letivo','inicio','inicio2'].includes(tp)?'nl':''}" data-rd="${iso}"><span class="rmn">${dd}</span>${L.map(r=>`<span class="rme ${r.estado}" data-ro="${r.id}" style="--rc:${reunTipo(r).cor}">${r.semHora?'':fmtHM(r.ini)+' '}${esc(reunTipo(r).ab)}<i>${esc(reunTitulo(r,a))}</i></span>`).join('')}</div>`}
    const nav=(dlt)=>{const d=new Date(y,m-1+dlt,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
    corpo=`<div class="card"><div class="row"><h2 style="margin:0">${MESES[m]} ${y}</h2><span class="sp1"></span><button class="btn sm ico" data-rm="${nav(-1)}" aria-label="Mês anterior">${ic('back',15)}</button><button class="btn sm" data-rm="${hj.slice(0,7)}">Hoje</button><button class="btn sm ico rot" data-rm="${nav(1)}" aria-label="Mês seguinte">${ic('back',15)}</button></div>
      <div class="rmgrid">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(x=>`<div class="rmh">${x}</div>`).join('')}${cel}</div>
      <div class="rleg">${Object.entries(REUN_T).map(([k,v])=>`<span><i style="background:${v.cor}"></i>${v.n}</span>`).join('')}</div><p class="hint">Toque num dia para agendar uma reunião nesse dia.</p></div>`}
  else if(tab==='tar'){const todas=reunioes(a).flatMap(r=>(r.decisoes||[]).map((d,i)=>({d,r,i}))).sort((x,y)=>(x.d.ok-y.d.ok)||((x.d.prazo||'9')).localeCompare(y.d.prazo||'9'));
    corpo=`<div class="card"><h2>Decisões e Tarefas das Reuniões</h2>${todas.length?`<div class="rlista">${todas.map(({d,r,i})=>`<div class="rdec ${d.ok?'ok':''} ${!d.ok&&d.prazo&&d.prazo<hj?'atr':''}"><input type="checkbox" data-tk="${r.id}|${i}" ${d.ok?'checked':''} aria-label="Concluída"><span><b>${esc(d.t)}</b><span class="mut">${d.resp?esc(d.resp)+' · ':''}${d.prazo?'até '+esc(fmtIsoL(d.prazo))+' ('+esc(contagem(d.prazo))+') · ':''}${esc(reunTitulo(r,a))}</span></span><button class="btn sm" data-ro="${r.id}">Reunião</button></div>`).join('')}</div>`:'<p class="mut">Ainda não há tarefas. Abra uma reunião e registe as decisões e tarefas em “Decisões e Tarefas”.</p>'}</div>`}
  else{const H=R.filter(r=>!reunAtiva(r)||reunFim(r).getTime()<agora).reverse();
    corpo=`<div class="card"><div class="row"><h2 style="margin:0">Histórico</h2><span class="sp1"></span><span class="mut">${H.length} reuniões · ${H.filter(pendAta).length} sem ata</span></div><div class="rlista" style="margin-top:12px">${H.map(r=>linha(r).replace('<span class="rqd">',`<span class="rqd">${r.ext?'':pendAta(r)?'<span class="tag bad">sem ata</span>':r.estado==='realizada'?'<span class="tag ok">'+ic('check',12)+' ata</span>':''}`)).join('')||'<p class="mut">Ainda não há reuniões passadas.</p>'}</div></div>`}
  $('#view').innerHTML=kpis+avisos+tabs+notifCard+corpo;
  $$('[data-rtab]').forEach(b=>b.onclick=()=>{UI.reTab=b.dataset.rtab;vReunioes()});
  $$('[data-ro]').forEach(b=>b.onclick=e=>{e.stopPropagation();reuniaoVer(b.dataset.ro)});$$('[data-rvo]').forEach(b=>b.onclick=()=>reuniaoVer(b.dataset.rvo));
  $$('[data-rav]').forEach(b=>b.onclick=()=>{const v=AV[+b.dataset.rav];v.r.estado='realizada';saveNow();toast('Marcada como realizada — registe as notas da ata','ok');vReunioes();reuniaoVer(v.r.id)});
  $$('[data-rm]').forEach(b=>b.onclick=()=>{UI.reMes=b.dataset.rm;vReunioes()});
  $$('[data-rd]').forEach(c=>c.onclick=()=>reuniaoDlg(null,{data:c.dataset.rd}));
  $$('[data-tk]').forEach(x=>x.onchange=()=>{const [rid,i]=x.dataset.tk.split('|');const r=reunioes(a).find(z=>z.id===rid);r.decisoes[+i].ok=x.checked;saveNow();vReunioes()});
  const nv=$('#r-nova');if(nv)nv.onclick=()=>reuniaoDlg();const ntf=$('#r-notif');if(ntf)ntf.onclick=pedirNotificacoes;
  const i2=$('#r-ics2');if(i2)i2.onclick=()=>$('#b-rics').click()}
/* ---------- Início: cartão das próximas reuniões ---------- */
function cartaoReunioesInicio(a){if(!a)return '';const agora=Date.now();const L=todasReunioes(a).filter(r=>reunAtiva(r)&&reunFim(r).getTime()>=agora).slice(0,4);const AV=avisosReunioes(a).filter(v=>v.g==='erro').length;
  if(!L.length&&!reunioes(a).length)return '';
  return `<div class="card rcard"><div class="row"><h2 style="margin:0">${ic('meet',18)} Reuniões</h2><span class="sp1"></span><button class="btn sm" data-go="reunioes">Ver Mapa</button></div>
    ${L.length?L.map((r,k)=>{const T_=reunTipo(r);const d=dataDeIso(r.data);return `<button class="rmini ${k===0?'prim':''}" data-ro="${r.id}" style="--rc:${T_.cor}"><span class="rdt"><b>${d.getDate()}</b><span>${MESES[d.getMonth()+1].slice(0,3)}</span></span><span class="rinf"><b>${esc(reunTitulo(r,a))}</b><span class="mut">${r.semHora?'':fmtHM(r.ini)+' · '}${esc(quandoTxt(r))}${r.local?' · '+esc(r.local):''}</span></span></button>`}).join(''):'<p class="mut" style="margin:8px 0 0">Sem reuniões agendadas.</p>'}
    ${AV?`<div class="alert w" style="margin:10px 0 0">${ic('alert',14)} ${AV} ${AV===1?'aviso':'avisos'} (sobreposições ou tarefas em atraso).</div>`:''}</div>`}

function ladoInicio(a){const h=ladoInicio0(a);const rc=cartaoReunioesInicio(a)+cartaoAniversarios(a);return rc?h.replace(/<\/aside>\s*$/,rc+'</aside>'):h}
function ladoInicio0(a){
  if(!a)return '';const c=a.calendario;const W=c&&c.periodos.length===2?'Semestre':'Período';
  if(!c)return `<aside class="in-side"><div class="card cdown vz"><h2 style="margin:0 0 6px">${ic('clock',18)} Fim do Período</h2><p class="mut" style="margin:0 0 12px">Importe o calendário escolar para ver a contagem decrescente.</p><button class="btn pri" data-go="calendario">Calendário Escolar</button></div></aside>`;
  const f=fimPeriodoAlvo(a);if(!f)return `<aside class="in-side"><div class="card cdown"><h2 style="margin:0">${ic('clock',18)} Ano letivo terminado</h2><p class="mut">Boas férias!</p></div></aside>`;
  const r=resumoPeriodoAtual(c);const hj=isoData(new Date());const p=f.p;
  const tot=p.dias,rest=f.antes?tot:r.rest,feitos=tot-rest;const pct=Math.round(100*feitos/Math.max(1,tot));
  const R_=52,C=2*Math.PI*R_;
  const intr=eventosCalendario(c).find(e=>e.t==='interrupcao'&&e.ini>hj);
  const TF=turmasFiltradas(a).map(t=>({t,r:aulasPrevistas(t,a)})).filter(x=>x.r);
  return `<aside class="in-side"><div class="card cdown">
    <div class="cdh"><span class="mut">${f.antes?'Início do '+p.n+'.º '+W.toLowerCase()+' a '+esc(fmtIsoL(p.ini)):'Contagem decrescente'}</span><b>Fim do ${p.n}.º ${W}</b><span class="mut">${esc(fmtIsoL(p.fim))}</span></div>
    <div class="ring"><svg viewBox="0 0 120 120" width="168" height="168"><circle cx="60" cy="60" r="${R_}" class="rt"/><circle cx="60" cy="60" r="${R_}" class="rv" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-pct/100)).toFixed(1)}" style="--c:${C.toFixed(1)}" transform="rotate(-90 60 60)"/></svg>
      <div class="ringc"><b>${rest}</b><span>dias letivos<br>por dar</span></div></div>
    <div class="cdt" id="cdt" data-alvo="${f.alvo.getTime()}">${['dias','horas','min','seg'].map(k=>`<div><b data-k="${k}">–</b><span>${k}</span></div>`).join('')}</div>
    <div class="cdx"><span>${pct}% do ${W.toLowerCase()} concluído</span><span>${Math.ceil((dataDeIso(p.fim)-dataDeIso(hj))/864e5/7)} semanas</span></div>
    ${intr?`<div class="cdi" style="--dc:${TIPOS_DIA.interrupcao.cor}">${ic('flag',14)} <span>Próxima interrupção${intr.nota?' ('+esc(intr.nota)+')':''}: <b>${esc(fmtIsoL(intr.ini))}</b> · ${contagem(intr.ini)}</span></div>`:''}
    ${TF.length?`<div class="cdtl"><div class="mut" style="font-size:12.5px;margin-bottom:6px">Tempos por dar até ao fim do ${p.n}.º ${W.toLowerCase()}</div>${TF.map(({t,r})=>{const q=r.P.find(x=>x.n===p.n);if(!q)return '';const falta=porDar(q);
      return `<div class="cdr">${anoBadge(t,'sm')}<span><b>${esc(t.nome)}</b> <span class="mut">${esc(t.disciplina)}${q.fim!==p.fim?' · termina a '+esc(fmtIso(q.fim)):''}</span></span><span class="sp1"></span><b>${falta}</b><span class="mut">/${q.tempos}</span></div>`}).join('')}</div>`:''}
  </div></aside>`;
}
let _cdTimer=null;
function iniciarContagem(){clearInterval(_cdTimer);const el=$('#cdt');if(!el)return;const alvo=+el.dataset.alvo;
  const tick=()=>{const e=$('#cdt');if(!e){clearInterval(_cdTimer);return}let ms=Math.max(0,alvo-Date.now());const v={dias:Math.floor(ms/864e5)};ms-=v.dias*864e5;v.horas=Math.floor(ms/36e5);ms-=v.horas*36e5;v.min=Math.floor(ms/6e4);ms-=v.min*6e4;v.seg=Math.floor(ms/1e3);
    Object.entries(v).forEach(([k,n])=>{const b=e.querySelector('[data-k="'+k+'"]');if(b)b.textContent=k==='dias'?n:String(n).padStart(2,'0')})};
  tick();_cdTimer=setInterval(tick,1000)}
function lembreteCopia(){const c=S.cfg;if(!S.anos.length)return '';try{if(nvL().prov||nuvemObrig())return ''}catch(_){}const d=c.ultimaCopia?Math.floor((Date.now()-c.ultimaCopia)/864e5):null;if(d!=null&&d<14)return '';
  return `<div class="card copiab priv"><span class="cbi">${ic('shield',18)}</span><div><b>${d==null?'Ainda não exportou nenhuma cópia de segurança':'A última cópia de segurança foi há '+d+' dias'}</b><div class="mut">Os dados só existem neste dispositivo. Exporte uma cópia (pode ser encriptada) e guarde-a no iCloud ou numa pen.</div></div><span class="sp1"></span><button class="btn pri" id="cp-agora">${ic('download',15)} Exportar Agora</button></div>`}
function inkDe(c){const m=String(c||'').match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);if(!m)return '#fff';let x=m[1];if(x.length===3)x=x.split('').map(q=>q+q).join('');const [r,g,b]=[0,2,4].map(i=>parseInt(x.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));const L=.2126*r+.7152*g+.0722*b;return L>.42?'#1f2328':'#fff'}
function cartoesInicioAval(a){
  if(!a)return '';const hj=isoData(new Date());
  const D=datasImportantes(a,60).slice(0,8);const PT=proximosTestes(a,45);
  const dias=iso=>Math.round((dataDeIso(iso)-dataDeIso(hj))/864e5);
  const tile=x=>{const d=dataDeIso(x.ini),n=dias(x.ini);const agora=x.ini<=hj&&x.fim>=hj;
    return `<div class="dimp ${n<=7?'perto':''} ${agora?'agora':''} ${x.tipo==='reun'?'priv':''}" style="--dc:${x.cor};--di:${inkDe(x.cor)}"><div class="dimd"><span class="dd">${d.getDate()}</span><span class="dm">${MESES[d.getMonth()+1].slice(0,3)}</span></div>
      <div class="dimt"><b>${esc(x.t)}</b><span class="mut">${x.fim!==x.ini?esc(fmtIsoL(x.ini))+' a '+esc(fmtIsoL(x.fim)):esc(DIAS[d.getDay()])}${x.s?' · '+esc(x.s):''}</span><span class="dimc">${agora?'a decorrer':n===0?'hoje':n===1?'amanhã':'daqui a '+n+' dias'}</span></div></div>`};
  return `${D.length?`<div class="card dimps"><div class="row" style="margin-bottom:12px"><h2 style="margin:0">${ic('flag',18)} Datas Importantes</h2><span class="sp1"></span><button class="btn sm" data-go="calendario">Calendário</button></div><div class="dimg">${D.map(tile).join('')}</div></div>`:''}
  <div class="card"><div class="row" style="margin-bottom:8px"><h2 style="margin:0">${ic('target',18)} Próximos Testes</h2><span class="sp1"></span><span class="mut">próximas 6 semanas</span></div>
    ${PT.length?PT.map(({t,i})=>{const n=dias(i.data);const oc=ocorrenciasTurma(t,a);const ant=Object.keys(oc).filter(d=>d>=hj&&d<i.data).length;
      return `<button class="lin ptl ${n<=3?'perto':''}" data-tst="${t.id}"><span class="ptd"><b>${dataDeIso(i.data).getDate()}</b><span>${MESES[dataDeIso(i.data).getMonth()+1].slice(0,3)}</span></span>${anoBadge(t,'sm')}<span class="ptn"><b>${esc(i.nome)}</b> <span class="mut">${esc(t.nome)} · ${esc(t.disciplina)}</span><span class="mut ptx">${esc(DIAS[dataDeIso(i.data).getDay()])}${oc[i.data]?' · '+oc[i.data].blocos.map(b=>fmtHM(b.ini)).join(', '):''}${ant?' · '+ant+' aula'+(ant>1?'s':'')+' antes':''}</span></span><span class="sp1"></span><span class="mtp" style="--pc:${TIPO_COR(i.tipo)}">${esc(TIPO_AB(i.tipo))}</span><span class="ptc">${n===0?'hoje':n===1?'amanhã':n+' dias'}</span></button>`}).join('')
      :`<p class="mut" style="margin:0">Sem testes marcados nas próximas semanas. Marque-os em <b>Turma › Marcação de Testes</b>.</p>`}</div>`;
}

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
    <div class="kpi"><div class="l">${ic('crown',14)} ${tituloDT(h.diretor)}${h.turma?' do '+esc(h.turma):''}</div><div class="v vt">${esc(h.diretor?profNome(h.diretor):'—')}</div><div class="mut">${souDT(A(),h.turma)?'<b style="color:var(--acc)">É você — é '+tituloDT(S.cfg.professor,false)+' desta turma</b>':''}</div></div>
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
