/* ---------- edição: pincel ---------- */
function pintarDia(iso,tp){const c=CAL();if(!c)return;
  if(tp==='nota'){const v=prompt('Nota para '+fmtIsoL(iso)+' (vazio para apagar)',(c.notas||{})[iso]||'');if(v==null)return;c.notas=c.notas||{};if(v.trim())c.notas[iso]=v.trim();else delete c.notas[iso]}
  else{c.dias[iso]=tp;
    if(LETIVOS.includes(tp)&&!c.perDia[iso]&&Object.keys(c.perDia).length){const p=c.periodos.slice().reverse().find(p=>p.ini<=iso)||c.periodos[0];if(p)c.perDia[iso]=p.n}
    if(tp==='termo'&&!(c.termos||[]).some(t=>t.data===iso)){/* termo pintado à mão: vale para todos os anos que não tenham outro */}
    const imp=c.importado;montarCalendario(c);c.importado=imp;c.editado=new Date().toISOString()}
  save();
}
/* ---------- vista ---------- */
function mesesDoCal(c){const s=[...new Set(Object.keys(c.dias).map(i=>i.slice(0,7)))].sort();return s}
function miniMes(c,ym,opts){
  const [y,m]=ym.split('-').map(Number);const nd=new Date(y,m,0).getDate();const off=(new Date(y,m-1,1).getDay()+6)%7;const hj=isoData(new Date());
  let cells='';for(let k=0;k<off;k++)cells+='<span class="cd vz"></span>';
  for(let d=1;d<=nd;d++){const iso=isoD(y,m,d);const tp=c.dias[iso]||'nao';const T_=TIPOS_DIA[tp]||TIPOS_DIA.nao;const nota=(c.notas||{})[iso];const dow=(off+d-1)%7;
    const ttl=fmtIsoL(iso)+' — '+T_.n+(nota?' · '+nota:'')+(c.perDia&&c.perDia[iso]?' · '+c.perDia[iso]+'.º '+(c.periodos.length===2?'semestre':'período'):'');
    const ai=(opts.ai||[]).some(d=>iso>=d.data&&iso<=(d.fim||d.data));cells+=`<button type="button" class="cd t-${tp} ${dow>4?'fds':''} ${ai?'ai':''} ${iso===hj?'hj':''} ${opts.passado&&iso<hj?'pas':''}" data-cd="${iso}" title="${esc(ttl)}" style="${T_.cor?`background:${T_.cor};color:${T_.ink}`:''}">${d}${nota?`<i>${esc(nota[0])}</i>`:''}</button>`}
  return `<div class="cmes"><div class="cmh">${MESES[m]} <span class="mut">${y}</span></div><div class="cgr">${['S','T','Q','Q','S','S','D'].map(x=>`<span class="cw">${x}</span>`).join('')}${cells}</div></div>`;
}
function resumoPeriodoAtual(c,t){
  const hj=isoData(new Date());const P=c.periodos;if(!P.length)return null;
  const p=P.find(p=>hj>=p.ini&&hj<=p.fim);const W=P.length===2?'semestre':'período';
  if(p){const feitos=diasLetivosEntre(p.ini,hj,t)-(letivoPara(t,hj)?1:0);const rest=diasLetivosEntre(hj,p.fim,t);return {p,W,estado:'decorre',feitos,rest,pct:Math.round(100*feitos/Math.max(1,feitos+rest))}}
  const nx=P.find(p=>hj<p.ini);if(nx)return {p:nx,W,estado:'antes',falta:Math.round((dataDeIso(nx.ini)-dataDeIso(hj))/864e5)};
  return {p:P[P.length-1],W,estado:'fim'};
}
function vCalendario(){
  const a=A();if(!a){$('#view').innerHTML='<div class="card empty">Crie primeiro o ano letivo.</div>';return}
  const c=a.calendario;
  if(!c){
    barBtns([{id:'b-ci',t:'Importar PDF…',f:pickCalendario}]);
    $('#view').innerHTML=`<div class="card empty">${ic('calendar',30)}<br><b>Calendário Escolar ${esc(a.nome)}</b><br><span class="mut">Importe o PDF do calendário escolar (com a legenda de cores: dias letivos, interrupções, feriados, termo das aulas) ou crie-o indicando as datas dos ${a.org==='semestre'?'semestres':'períodos'}.</span><br><br>
      <div class="row" style="justify-content:center"><button class="btn pri" id="c-imp">${ic('upload',15)} Importar PDF do Calendário</button><button class="btn" id="c-man">${ic('plus',15)} Criar Manualmente</button></div></div>`;
    $('#c-imp').onclick=pickCalendario;$('#c-man').onclick=calendarioManualDlg;return}
  const tabs=`<div class="tabs noprint">${[['cal','calendar','Calendário'],['prev','calcheck','Aulas Previstas']].map(([k,i,l])=>`<button data-ct="${k}" class="${(UI.calTab||'cal')===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>`;
  const bindTabs=()=>$$('[data-ct]').forEach(b=>b.onclick=()=>{UI.calTab=b.dataset.ct;UI.calEd=false;vCalendario()});
  if(UI.calTab==='prev'){
    barBtns([{id:'b-csv',t:'Exportar CSV',f:exportPrevistas},{id:'b-pr',t:'Imprimir',f:()=>window.print()}]);
    $('#view').innerHTML=tabs+vAulasPrevistas(a,c);bindTabs();
    $$('#pv-u [data-u]').forEach(b=>b.onclick=()=>{UI.prevU=b.dataset.u;vCalendario()});
    $$('[data-pv]').forEach(r=>r.onclick=()=>prevDetalheDlg(a.turmas.find(t=>t.id===r.dataset.pv)));
    $$('[data-hor]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.hor;save();go('horario')});
    return}
  barBtns([{id:'b-ed',t:UI.calEd?'Concluir Edição':'Editar Dias',c:UI.calEd?'pri':'',f:()=>{UI.calEd=!UI.calEd;vCalendario()}},{id:'b-ci',t:'Importar PDF…',f:pickCalendario},{id:'b-pr',t:'Imprimir',f:()=>window.print()},
    {id:'b-cx',t:'Remover',c:'dng',f:()=>{if(confirm('Remover o calendário escolar de '+a.nome+'?')){delete a.calendario;UI.calEd=false;saveNow();go('calendario')}}}]);
  const hj=isoData(new Date());const ev=eventosCalendario(c);const W=c.periodos.length===2?'Semestre':'Período';
  const r=resumoPeriodoAtual(c);const futuros=ev.filter(e=>e.fim>=hj);
  const prox=futuros.find(e=>!['inicio','inicio2'].includes(e.t)||e.ini>=hj);
  const nomeEv=e=>e.t==='interrupcao'?'Interrupção Letiva'+(e.nota?' ('+e.nota+')':''):e.t==='termo'?'Termo das Aulas':e.t==='inicio'?'Início do Ano Letivo':e.t==='inicio2'?'Início 3.º Ciclo e Secundário':(e.nota||TIPOS_DIA[e.t].n);
  const durEv=e=>e.ini===e.fim?fmtIsoL(e.ini):fmtIsoL(e.ini)+' a '+fmtIsoL(e.fim);
  const difAno=c.anoLetivo&&c.anoLetivo!==a.nome;
  const pincel=UI.calPin||'letivo';
  $('#view').innerHTML=tabs+cartaoOrg(a)+`
  ${difAno?`<div class="card"><div class="alert w" style="margin:0">${ic('alert',15)} Este calendário é de ${esc(c.anoLetivo)} e está associado ao ano letivo ${esc(a.nome)}.</div></div>`:''}
  <div class="kpis">
    <div class="kpi"><div class="l">${ic('calendar',14)} ${r&&r.estado==='decorre'?W+' Atual':r&&r.estado==='antes'?'Próximo '+W:'Ano Letivo'}</div><div class="v">${r?(r.estado==='fim'?'Terminado':r.p.n+'.º '+W):'—'}</div><div class="mut">${r&&r.estado!=='fim'?esc(fmtIso(r.p.ini)+' a '+fmtIso(r.p.fim)):''}${r&&r.estado==='antes'?' · começa daqui a '+r.falta+' dia'+(r.falta>1?'s':''):''}</div></div>
    <div class="kpi"><div class="l">${ic('clock',14)} Dias Letivos Restantes</div><div class="v">${r&&r.estado==='decorre'?r.rest:r&&r.estado==='antes'?r.p.dias:0}</div><div class="mut">${r&&r.estado==='decorre'?'até '+esc(fmtIsoL(r.p.fim))+' · '+r.feitos+' já decorridos':r&&r.estado==='antes'?'no '+r.p.n+'.º '+W.toLowerCase():''}</div></div>
    <div class="kpi"><div class="l">${ic('flag',14)} Próximo Marco</div><div class="v" style="font-size:17px">${prox?esc(nomeEv(prox)):'—'}</div><div class="mut">${prox?esc(durEv(prox)):''}</div></div>
    <div class="kpi"><div class="l">${ic('grad',14)} Total de Dias Letivos</div><div class="v">${c.periodos.reduce((s,p)=>s+p.dias,0)}</div><div class="mut">${c.periodos.map(p=>p.n+'.º '+p.dias).join(' · ')}</div></div>
  </div>
  <div class="card wide"><h2>${W==='Semestre'?'Semestres':'Períodos Letivos'}</h2><div class="cper">
    ${c.periodos.map(p=>{const tot=p.dias,feitos=hj<p.ini?0:hj>p.fim?tot:diasLetivosEntre(p.ini,hj)-(letivoPara(null,hj)?1:0);const on=hj>=p.ini&&hj<=p.fim;
      return `<div class="cp pcor ${on?'on':''} ${hj>p.fim?'done':''}" style="--pc:var(--p${p.n})"><div class="row"><b>${p.n}.º ${W}</b><span class="sp1"></span>${on?'<span class="tag now">a decorrer</span>':hj>p.fim?'<span class="tag">concluído</span>':''}</div>
      <div class="cpd">${esc(fmtIsoL(p.ini))} → ${esc(fmtIsoL(p.fim))}</div>
      <div class="pbar"><span style="width:${Math.round(100*feitos/Math.max(1,tot))}%"></span></div>
      <div class="mut">${tot} dias letivos${on?' · faltam '+(tot-feitos):''}</div></div>`}).join('')}</div>
    ${c.inicio2||(c.termos||[]).length>1?`<div class="cal-res" style="margin-top:12px">
      <div><span class="sw" style="background:${TIPOS_DIA.inicio.cor}"></span>Início: <b>${esc(fmtIsoL(c.inicio))}</b>${c.inicio2?` · 3.º Ciclo e Secundário: <b>${esc(fmtIsoL(c.inicio2))}</b>`:''}</div>
      ${(c.termos||[]).slice().sort((x,y)=>x.data.localeCompare(y.data)).map(t=>`<div><span class="sw" style="background:${TIPOS_DIA.termo.cor}"></span>Termo das Aulas: <b>${esc(fmtIsoL(t.data))}</b> — ${esc(anosTxt(t.anos))}</div>`).join('')}</div>`:''}
  </div>
  ${cartaoIntercalar(a,c)}${semIntercalar()?'':cartaoFormProf(a,c)}
  <div class="calwrap"><div class="card wide calc"><div class="row calhd"><h2 style="margin:0">Calendário ${esc(c.anoLetivo||a.nome)}</h2><span class="sp1"></span><div class="seg zoomseg noprint" aria-label="Tamanho do calendário"><button type="button" data-zm="-" aria-label="Diminuir" title="Diminuir">−</button><button type="button" data-zm="+" aria-label="Aumentar" title="Aumentar">+</button></div></div>
    <span class="cleg">${['letivo','inicio','inicio2','termo','interrupcao','feriadoN','feriadoR','feriadoM'].filter(k=>k==='letivo'||Object.values(c.dias).includes(k)).map(k=>`<span><span class="sw" style="background:${TIPOS_DIA[k].cor}"></span>${TIPOS_DIA[k].n}</span>`).join('')}<span><span class="sw nao"></span>Sem Atividades Letivas</span></span>
    ${UI.calEd?`<p class="hint noprint" style="margin:0 0 8px">Escolha o tipo e toque num dia, ou arraste o dedo por vários dias seguidos. Toque em “Concluir Edição” no fim.</p><div class="cpin noprint">${[...Object.keys(TIPOS_DIA),'nota'].map(k=>`<button type="button" data-pin="${k}" class="${pincel===k?'on':''}">${k==='nota'?ic('pencil',14)+' Nota':`<span class="sw ${k==='nao'?'nao':''}" style="background:${TIPOS_DIA[k].cor}"></span>${TIPOS_DIA[k].n}`}</button>`).join('')}</div>`:''}
    <div class="cmeses ${UI.calEd?'ed':''}" style="--cz:${zoomCal()}">${mesesDoCal(c).map(ym=>miniMes(c,ym,{passado:true,ai:(a.datasAval||[]).filter(d=>d.tipo==='intercalar'&&!d.turma&&d.data&&intercalarPeriodos(a).includes(d.per))})).join('')}</div>
    <p class="hint">${c.ficheiro==='(manual)'?'Criado manualmente':'Importado de '+esc(c.ficheiro)}${c.editado?' · editado':''}. ${Object.keys(c.notas||{}).length?'Letras nos dias: '+[...new Set(Object.values(c.notas))].map(n=>esc(n[0]+' = '+n)).join(', ')+'.':''}</p>
  </div>
  <div class="card calev"><h2>Interrupções, Feriados e Marcos</h2>
    ${ev.map(e=>`<div class="lin cev ${e.fim<hj?'pas':''} ${e===prox?'now':''}"><span class="sw" style="background:${TIPOS_DIA[e.t].cor}"></span><span class="hh">${esc(durEv(e))}</span><b>${esc(nomeEv(e))}</b>${e.t==='termo'&&e.nota?`<span class="mut">${esc(e.nota)}</span>`:''}${e.t==='interrupcao'?`<span class="mut">${Object.keys(c.dias).filter(i=>i>=e.ini&&i<=e.fim&&c.dias[i]==='interrupcao').length} dias sem aulas</span>`:''}</div>`).join('')||'<p class="mut">Sem eventos.</p>'}
  </div></div>`;
  bindTabs();bindIntercalar(a,()=>{const y=$('#view').scrollTop;vCalendario();$('#view').scrollTop=y});
  $$('[data-pin]').forEach(b=>b.onclick=()=>{UI.calPin=b.dataset.pin;vCalendario()});
  bindZoom(vCalendario);
  const grid=$('.cmeses');
  if(!UI.calEd)$$('[data-cd]').forEach(b=>b.onclick=()=>diaDlg(b.dataset.cd));
  else if(pincel==='nota')$$('[data-cd]').forEach(b=>b.onclick=()=>{pintarDia(b.dataset.cd,'nota');vCalendario()});
  else{ // pintar tocando ou arrastando o dedo sobre vários dias
    let ativo=false;const feitos=new Set();
    const pinta=el=>{const cd=el&&el.closest&&el.closest('[data-cd]');if(!cd||feitos.has(cd.dataset.cd))return;feitos.add(cd.dataset.cd);
      const T_=TIPOS_DIA[pincel];cd.className=cd.className.replace(/t-\w+/,'t-'+pincel);cd.style.background=T_.cor;cd.style.color=T_.ink;cd.classList.add('pint')};
    grid.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-cd]'))return;try{e.target.releasePointerCapture(e.pointerId)}catch(_){}ativo=true;feitos.clear();pinta(e.target);e.preventDefault()});
    grid.addEventListener('pointermove',e=>{if(ativo)pinta(document.elementFromPoint(e.clientX,e.clientY))});
    const fim=()=>{if(!ativo)return;ativo=false;feitos.forEach(iso=>pintarDia(iso,pincel));if(feitos.size>1)toast(feitos.size+' dias marcados como '+TIPOS_DIA[pincel].n);vCalendario()};
    document.onpointerup=fim;document.onpointercancel=fim;
  }
}
const diasUteis=(a,b)=>{let n=0;for(let d=dataDeIso(a);isoData(d)<=b;d.setDate(d.getDate()+1))if(d.getDay()%6)n++;return n};
/* cartão do Início */
function cartaoCalendario(a){
  const c=a&&a.calendario;if(!c)return a?`<div class="card"><div class="row"><h2 style="margin:0">${ic('calendar',18)} Calendário Escolar</h2><span class="sp1"></span><button class="btn sm" data-go="calendario">Importar PDF</button></div><p class="hint" style="margin:6px 0 0">Importe o calendário escolar para ver o período atual, os dias letivos que faltam e saltar as interrupções nas próximas aulas.</p></div>`:'';
  const r=resumoPeriodoAtual(c);const hj=isoData(new Date());const ev=eventosCalendario(c).filter(e=>e.fim>=hj&&!['inicio','inicio2'].includes(e.t));const e=ev[0];
  const tp=c.dias[hj];const W=c.periodos.length===2?'semestre':'período';
  return `<button class="card ccal" data-go="calendario"><div class="row"><h2 style="margin:0">${ic('calendar',18)} ${r?r.estado==='decorre'?r.p.n+'.º '+W:r.estado==='antes'?r.p.n+'.º '+W+' começa a '+esc(fmtIsoL(r.p.ini)):'Ano letivo terminado':'Calendário'}</h2><span class="sp1"></span>
    ${tp&&!LETIVOS.includes(tp)&&tp!=='nao'?`<span class="tag" style="background:${TIPOS_DIA[tp].cor};color:${TIPOS_DIA[tp].ink}">Hoje: ${esc(TIPOS_DIA[tp].n)}</span>`:''}</div>
    ${r&&r.estado==='decorre'?`<div class="pbar"><span style="width:${r.pct}%"></span></div><div class="mut">${esc(fmtIsoL(r.p.ini))} → ${esc(fmtIsoL(r.p.fim))} · <b>${r.rest}</b> dias letivos por dar · ${r.feitos} decorridos</div>`:''}
    ${e?`<div class="mut" style="margin-top:4px">${ic('flag',13)} Próximo: <b>${esc(e.t==='interrupcao'?'Interrupção Letiva'+(e.nota?' ('+e.nota+')':''):e.t==='termo'?'Termo das Aulas ('+e.nota+')':e.nota||TIPOS_DIA[e.t].n)}</b> — ${esc(e.ini===e.fim?fmtIsoL(e.ini):fmtIsoL(e.ini)+' a '+fmtIsoL(e.fim))}</div>`:''}</button>`;
}

