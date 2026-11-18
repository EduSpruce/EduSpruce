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
  else if(tab==='cal'){corpo=reMapaMes(R,a,hj)}
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
    /* só o algarismo que muda é escrito, e no próprio texto (sem trocar o nó): o resto da página não é acordado a cada segundo */
    Object.entries(v).forEach(([k,n])=>{const b=e.querySelector('[data-k="'+k+'"]');if(!b)return;const tx=k==='dias'?String(n):String(n).padStart(2,'0');const c=b.firstChild;if(c&&c===b.lastChild&&c.nodeType===3){if(c.data!==tx)c.data=tx}else b.textContent=tx})};
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

/* Mapa Mensal das Reuniões com a mesma grelha d'O Meu Calendário (vista Mês): barra «Hoje ‹ › mês», 6 semanas de segunda a domingo
   com os dias dos meses vizinhos, números das semanas como n'O Meu Calendário, e os dias do calendário escolar do ano letivo
   (feriados e interrupções com fundo e etiqueta; outros dias sem atividades letivas sombreados como o fim de semana). */
function reMapaMes(R,a,hj){const base=UI.reMes||hj.slice(0,7);const [y,m]=base.split('-').map(Number);const p1=y+'-'+String(m).padStart(2,'0')+'-01';
  const A=ocSegunda(p1);let semN=false;try{semN=!!OCAL().cfg.semN}catch(_){}
  const cal=a.calendario||{};const dias=cal.dias||{},notas=cal.notas||{};
  const nav=dlt=>{const d=new Date(y,m-1+dlt,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
  const ordem=(x,z)=>(x.semHora?-1:(x.ini||'')).toString().localeCompare((z.semHora?-1:(z.ini||'')).toString());
  let h=`<section class="ocmain rmoc"><div class="octb"><button class="btn sm" data-rm="${hj.slice(0,7)}">Hoje</button><button class="btn sm ico" data-rm="${nav(-1)}" aria-label="Mês anterior">‹</button><button class="btn sm ico" data-rm="${nav(1)}" aria-label="Mês seguinte">›</button><h2 class="octit">${MESES[m]} ${y}</h2></div>
    <div class="ocmes ${semN?'sn':''}" style="margin-top:10px"><div class="ocmhd">${semN?'<span></span>':''}${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(x=>`<span>${x}</span>`).join('')}</div>`;
  for(let w=0;w<6;w++){h+=`<div class="ocmw">${semN?`<span class="ocsn" title="Semana ${ocSemN(ocAdd(A,w*7))}">${ocSemN(ocAdd(A,w*7))}</span>`:''}`;
    for(let i=0;i<7;i++){const k=ocAdd(A,w*7+i);const tp=dias[k]||'';const fer=/^feriado/.test(tp),itr=/^interrupcao/.test(tp);const nl=tp&&!fer&&!itr&&!['letivo','inicio','inicio2'].includes(tp);
      const L=R.filter(r=>r.data===k).sort(ordem);const nota=notas[k]||'';
      h+=`<div class="ocdc ${k.slice(0,7)!==base?'fo':''} ${k===hj?'hj':''} ${i>=5||nl?'fds':''} ${fer?'f-fer':itr?'f-int':''}" data-rd="${k}" title="Toque para agendar uma reunião neste dia"><span class="ocdn">${+k.slice(8)===1?OC_MES[+k.slice(5,7)-1].slice(0,3)+' ':''}${+k.slice(8)}</span>
        ${fer||itr?`<span class="ocev esc" style="--c:${fer?'#e04848':'#e0a030'}" title="${esc((fer?'Feriado':'Interrupção letiva')+(nota?' · '+nota:''))}">${fer?'Feriado':'Interrupção letiva'}${nota?' · '+esc(nota):''}</span>`:''}
        ${L.map(r=>{const T=reunTipo(r);return `<button type="button" class="ocev reun ${r.estado==='cancelada'?'falta':''}" style="--c:${T.cor}" data-ro="${r.id}" title="${esc(T.n+' · '+reunTitulo(r,a)+(r.semHora?'':' · '+fmtHM(r.ini))+(r.local?' · '+r.local:''))}">${r.semHora?'':`<b>${fmtHM(r.ini)}</b> `}${esc(T.ab)} · ${esc(reunTitulo(r,a))}</button>`}).join('')}</div>`}h+='</div>'}
  h+=`</div><div class="rleg" style="margin-top:10px">${Object.entries(REUN_T).map(([k,v])=>`<span><i style="background:${v.cor}"></i>${v.n}</span>`).join('')}<span><i class="ocleg f-fer" style="margin:0"></i>Feriado</span><span><i class="ocleg f-int" style="margin:0"></i>Interrupção letiva</span></div><p class="hint">Toque num dia para agendar uma reunião nesse dia.</p></section>`;
  return h}
