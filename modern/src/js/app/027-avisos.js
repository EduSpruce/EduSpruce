/* ---------- avisos ---------- */
function jnAvisos(){if(!jnOn())return [];const {y,cfg}=JN();const hj=jnHoje(),lim=jnAdd(hj,cfg.dias);const L=[];const q=d=>contagem(d);
  y.ativ.forEach(a=>{if(a.foraPAA&&a.dec!=='cobrir')return;const D=jnDatasEf(a),pr=jnPrecEf(a),p=jnPecaDe(a);
    if(pr==='dia')D.forEach(d=>{
      if(a.dec==null&&d.ini>=hj&&d.ini<=lim)L.push({g:'decidir',u:jnDif(hj,d.ini)<=2,k:'jd:'+a.id+':'+d.ini,ic:'flag',cor:'#e07a00',t:'Decidir se o jornal cobre: '+a.titulo,s:fmtIsoL(d.ini)+' · '+q(d.ini)+(a.resp?' · '+a.resp:''),a,d:d.ini});
      if(a.dec!=='cobrir')return;
      if(d.ini<=hj&&d.fim>=hj)L.push({g:'hoje',u:true,k:'jh:'+a.id+':'+hj,ic:'image',cor:'#0f8b8d',t:'Hoje: '+a.titulo,s:'Fotografias, nomes e declarações'+(jnHora(a)?' · '+jnHora(a):'')+(p&&p.autor?' · '+jnNomeM(p.autor):' · sem repórter atribuído'),a,d:hj});
      else if(d.ini>hj&&jnDif(hj,d.ini)<=3&&p&&!p.autor&&!jnFeita(p))L.push({g:'atribuir',u:true,k:'ja:'+a.id+':'+d.ini,ic:'users',cor:'#7a4fd0',t:'Atribuir repórter: '+a.titulo,s:fmtIsoL(d.ini)+' · '+q(d.ini),a,d:d.ini});
      if(d.fim<hj&&p&&(p.estado==='ideia'||p.estado==='atribuida')&&jnAdd(d.fim,cfg.diasMat)<=hj&&d.fim>=jnAdd(hj,-45)&&d===D[D.length-1])L.push({g:'material',u:true,k:'jm:'+a.id+':'+hj,ic:'file',cor:'#c0392b',t:'Recolher texto e fotos: '+a.titulo,s:'Decorreu '+q(d.fim)+(a.resp?' · pedir a '+a.resp:''),a,d:d.fim})});
    else if((pr==='mes'||pr==='periodo')&&a.dec!=='ignorar'&&D[0]){const d=D[0];if(d.ini<=lim&&d.fim>=hj&&jnDif(d.ini,d.fim)<=100)L.push({g:'confirmar',u:false,k:'jc:'+a.id+':'+hj.slice(0,7),ic:'calendar',cor:'#2f7fd0',t:'Confirmar a data: '+a.titulo,s:'No PAA: «'+(a.cal||jnLbl(a))+'»'+(a.resp?' · perguntar a '+a.resp:''),a,d:d.ini})}
    if(a.alterada&&!a.altVista)L.push({g:'alterada',u:false,k:'jx:'+a.id+':'+a.alterada,ic:'refresh',cor:'#d98b00',t:'Data alterada no PAA: '+a.titulo,s:'Antes «'+(a.calAnt||'—')+'» · agora «'+(a.cal||'—')+'»',a,d:jnIni(a)})});
  y.pecas.forEach(p=>{if(p.prazo&&p.prazo<hj&&!jnFeita(p))L.push({g:'atraso',u:true,k:'jp:'+p.id+':'+hj,ic:'alert',cor:'#c0392b',t:'Peça em atraso: '+p.titulo,s:'Prazo '+fmtIsoL(p.prazo)+' ('+q(p.prazo)+')'+(p.autor?' · '+jnNomeM(p.autor):''),p,d:p.prazo});
    else if(p.prazo&&p.prazo>=hj&&jnDif(hj,p.prazo)<=2&&!jnFeita(p))L.push({g:'prazo',u:p.prazo===hj,k:'jq:'+p.id+':'+p.prazo,ic:'clock',cor:'#e07a00',t:'Entrega '+q(p.prazo)+': '+p.titulo,s:(p.autor?jnNomeM(p.autor)+' · ':'')+jnEst(p.estado)[1],p,d:p.prazo})});
  y.edicoes.forEach(e=>{if(e.estado==='publicada')return;const pend=y.pecas.filter(p=>p.edicao===e.id&&!jnFeita(p)).length;
    if(e.fecho&&e.fecho>=hj&&e.fecho<=lim)L.push({g:'fecho',u:jnDif(hj,e.fecho)<=2,k:'je:'+e.id+':'+hj,ic:'news',cor:'#0a5aa8',t:'Fecho da edição n.º '+(e.num||'?')+' '+q(e.fecho),s:fmtIsoL(e.fecho)+' · '+(pend?pend+' peça(s) por terminar':y.pecas.some(p=>p.edicao===e.id)?'todas as peças prontas':'ainda sem peças associadas'),e,d:e.fecho});
    if(e.pub&&e.pub<hj)L.push({g:'pub',u:true,k:'jb:'+e.id+':'+hj,ic:'check',cor:'#1a7f37',t:'Edição n.º '+(e.num||'?')+': a data de publicação já passou',s:'Marque-a como publicada (ou altere a data)',e,d:e.pub})});
  return L.sort((a,b)=>(b.u-a.u)||(a.d||'9').localeCompare(b.d||'9'))}
function jnBadge(){const b=$('#jnBadge');if(!b)return;const n=jnOn()?jnAvisos().filter(x=>x.u).length:0;b.hidden=!n;b.textContent=n}
function jnNav(){const b=$('#side [data-v="jornal"]');if(!b)return;const sp=b.querySelector('.jnico');if(sp&&!sp.firstChild)sp.innerHTML=ic('news',18);const off=!jnOn()||(S.cfg.navOculto||[]).includes('jornal');b.style.display=off?'none':''}
function jnAbrirAviso(x){if(x.a)jnAtivDlg(x.a);else if(x.p)jnPecaDlg(x.p);else if(x.e)jnEdDlg(x.e)}

/* ---------- vista principal ---------- */
function vJornal(){if(!jnOn()){$('#view').innerHTML=`<div class="card empty">${ic('news',30)}<br><b>O módulo Jornal Escolar está desativado</b><br><span class="mut">Pode ativá-lo em Definições › Geral › Módulos Opcionais. Os dados guardados mantêm-se.</span><br><br><button class="btn pri" id="jn-on">Ativar o Módulo</button></div>`;$('#jn-on').onclick=()=>{jnAtivar(true);go('jornal')};return}
  const {y,cfg}=JN();const tab=UI.jnTab||'painel';const hj=jnHoje();
  $('#ttl').textContent=cfg.nome||'Jornal Escolar';
  barBtns([{id:'b-jnimp',t:ic('upload',15)+' Importar PAA…',f:jnPickPAA},{id:'b-jnics',t:ic('calendar',15)+' Exportar .ics',f:jnICS},{id:'b-jncfg',t:ic('gear',15)+' Opções',f:jnCfgDlg}]);
  const AV=jnAvisos();const prox=y.ativ.filter(a=>!a.foraPAA&&a.dec!=='ignorar'&&jnPrecEf(a)==='dia'&&jnDatasEf(a).some(d=>d.fim>=hj&&d.ini<=jnAdd(hj,14))).length;
  const curso=y.pecas.filter(p=>!jnFeita(p)).length;const ne=y.edicoes.filter(e=>e.estado!=='publicada'&&e.fecho&&e.fecho>=hj).sort((a,b)=>a.fecho.localeCompare(b.fecho))[0];
  const tabs=[['painel','bell','Painel'],['paa','list','Atividades do PAA'],['cal','calendar','Calendário'],['pecas','pen','Peças'],['edicoes','news','Edições'],['equipa','users','Redação']];
  $('#view').innerHTML=`<div class="kpis"><div class="kpi"><div class="l">${ic('bell',14)} Avisos</div><div class="v">${AV.length}</div><div class="mut">${AV.filter(x=>x.u).length} urgente(s)</div></div><div class="kpi"><div class="l">${ic('calendar',14)} Próximos 14 Dias</div><div class="v">${prox}</div><div class="mut">atividades com data</div></div><div class="kpi"><div class="l">${ic('pen',14)} Peças em Curso</div><div class="v">${curso}</div><div class="mut">${y.pecas.filter(p=>p.estado==='publicada').length} publicadas</div></div><div class="kpi"><div class="l">${ic('news',14)} Próximo Fecho</div><div class="v jn-kv">${ne?esc(contagem(ne.fecho)):'—'}</div><div class="mut">${ne?'n.º '+esc(ne.num||'?')+' · '+esc(fmtIsoL(ne.fecho)):'sem edição planeada'}</div></div></div>
   <div class="tabs noprint jn-tabs">${tabs.map(([k,i,l])=>`<button data-jt="${k}" class="${tab===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div><div id="jn-c"></div>`;
  $$('[data-jt]').forEach(b=>b.onclick=()=>{UI.jnTab=b.dataset.jt;vJornal()});
  ({painel:jnPainel,paa:jnPAA,cal:jnCal,pecas:jnPecas,edicoes:jnEdicoes,equipa:jnEquipa})[tab==='quadros'?'painel':tab](AV);jnBadge()}
function jnSemPAA(){return `<div class="card empty">${ic('upload',30)}<br><b>Importe o Plano Anual de Atividades ${esc(jnAnoNome())}</b><br><span class="mut">Escolha o ficheiro Word (.docx) do PAA da escola. A app lê as tabelas de cada departamento, clube e equipa, reconhece as datas («12 a 16 de outubro», «Março/Abril», «2.º período»…) e passa a avisá-lo do que aí vem.</span><br><br><div class="row" style="justify-content:center"><button class="btn pri" data-jnimp>${ic('upload',15)} Importar PAA (.docx)</button><button class="btn" data-jnnova>${ic('plus',15)} Juntar Atividade à Mão</button></div></div>`}
function jnBindComuns(){$$('[data-jnimp]').forEach(b=>b.onclick=jnPickPAA);$$('[data-jnnova]').forEach(b=>b.onclick=()=>jnAtivDlg(null));
  $$('[data-ja]').forEach(b=>b.onclick=e=>{if(e.target.closest('[data-jd]'))return;const a=JN().y.ativ.find(x=>x.id===b.dataset.ja);if(a)jnAtivDlg(a)});
  $$('[data-jd]').forEach(b=>b.onclick=e=>{e.stopPropagation();const [id,d]=b.dataset.jd.split('|');const a=JN().y.ativ.find(x=>x.id===id);if(a){jnCobrir(a,d);vJornal();if(a.dec==='cobrir')toast('A cobrir: '+a.titulo+' — peça criada na pauta','ok')}});
  $$('[data-jp]').forEach(b=>b.onclick=()=>{const p=JN().y.pecas.find(x=>x.id===b.dataset.jp);if(p)jnPecaDlg(p)});
  $$('[data-je]').forEach(b=>b.onclick=()=>{const e=JN().y.edicoes.find(x=>x.id===b.dataset.je);if(e)jnEdDlg(e)})}
function jnLinhaA(a,curta){const p=jnPecaDe(a);const pr=jnPrecEf(a);const hj=jnHoje();const D=jnDatasEf(a);const passou=D.length&&D[D.length-1].fim<hj&&pr==='dia';
  return `<div class="jn-li ${a.dec||'nd'} ${passou?'pass':''}" data-ja="${a.id}"><span class="jn-dc ${pr}">${esc(jnLbl(a))}${jnHora(a)?'<small>'+esc(jnHora(a))+'</small>':''}</span>
   <span class="jn-lt"><b>${esc(a.titulo)}</b>${a.foraPAA?' <span class="tag bad">já não consta do PAA</span>':''}${a.orig==='manual'?' <span class="tag">extra PAA</span>':''}${a.aprox&&!a.conf?' <span class="tag jn-w">a confirmar</span>':''}${a.conf?' <span class="tag jn-ok">'+ic('check',11)+' confirmada</span>':''}
   <span class="mut">${esc(a.sec||'')}${a.resp?' · '+esc(a.resp):''}</span>${!curta&&a.cal&&pr!=='dia'?`<span class="mut jn-calt">«${esc(a.cal)}»</span>`:''}</span>
   ${p?`<span class="tag" style="color:${jnEst(p.estado)[2]};border-color:${jnEst(p.estado)[2]}">${jnEst(p.estado)[1]}${p.autor?' · '+esc(jnNomeM(p.autor)):''}</span>`:''}
   <span class="seg jn-dec"><button data-jd="${a.id}|cobrir" class="${a.dec==='cobrir'?'on':''}" title="O jornal vai cobrir">${ic('check',13)} Cobrir</button><button data-jd="${a.id}|ignorar" class="${a.dec==='ignorar'?'on':''}" title="Não interessa ao jornal">${ic('x',12)}</button></span></div>`}
function jnPainel(AV){const {y,cfg}=JN();const c=$('#jn-c');const hj=jnHoje();
  if(!y.ativ.length&&!y.pecas.length){c.innerHTML=jnSemPAA();jnBindComuns();return}
  const G=[['hoje','Hoje'],['atraso','Em Atraso'],['material','Pedir Texto e Fotografias'],['atribuir','Atribuir Repórter'],['prazo','Entregas Próximas'],['fecho','Fecho de Edição'],['pub','Publicação'],['decidir','Decidir Cobertura'],['confirmar','Confirmar Datas'],['alterada','Alterações no PAA']];
  const sem=y.ativ.filter(a=>!a.foraPAA&&a.dec!=='ignorar'&&jnPrecEf(a)==='dia'&&jnDatasEf(a).some(d=>d.fim>=hj&&d.ini<=jnAdd(hj,14))).sort((a,b)=>jnIni(a).localeCompare(jnIni(b)));
  c.innerHTML=`<div class="jn-2"><div class="card"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">${ic('bell',18)} O Que Não Pode Esquecer</h2><span class="sp1"></span>${AV.length?`<span class="mut">${AV.length} aviso(s)</span>`:''}</div>
    ${AV.length?G.map(([g,l])=>{const X=AV.filter(x=>x.g===g);return X.length?`<h3 class="jn-gh">${l} <span class="mut">${X.length}</span></h3>${X.map(x=>`<button class="jn-av" data-jav="${esc(x.k)}" style="--ac:${x.cor}"><span class="jn-avi">${ic(x.ic,16)}</span><span><b>${esc(x.t)}</b><span class="mut">${esc(x.s)}</span></span>${x.u?'<span class="tag bad">urgente</span>':''}</button>`).join('')}`:''}).join(''):`<div class="empty" style="padding:22px 0">${ic('check',30)}<br><b>Tudo em dia</b><br><span class="mut">Os avisos aparecem aqui com ${cfg.dias} dias de antecedência (Opções).</span></div>`}</div>
   <div class="card"><h2>${ic('calendar',18)} Próximos 14 Dias no PAA</h2>${sem.length?`<div class="jn-l">${sem.map(a=>jnLinhaA(a,true)).join('')}</div>`:`<p class="mut">Sem atividades com data marcada nas próximas duas semanas.</p>`}
   <div class="row" style="margin-top:10px"><button class="btn sm" data-jgo="paa">Ver todas as atividades</button><button class="btn sm" data-jgo="cal">Calendário</button></div></div></div>`;
  $$('[data-jav]').forEach(b=>b.onclick=()=>{const x=AV.find(z=>z.k===b.dataset.jav);if(x)jnAbrirAviso(x)});$$('[data-jgo]').forEach(b=>b.onclick=()=>{UI.jnTab=b.dataset.jgo;vJornal()});jnBindComuns()}
function jnPAA(){const {y}=JN();const c=$('#jn-c');if(!y.ativ.length){c.innerHTML=jnSemPAA();jnBindComuns();return}
  const f=UI.jnF||'todas',sec=UI.jnSec||'',q=normT(UI.jnQ||''),fut=UI.jnFut!==false;const hj=jnHoje();
  const secs=[...new Set(y.ativ.map(a=>a.sec||'Geral'))];
  const L=y.ativ.filter(a=>(f==='todas'||(f==='pend'?a.dec==null:a.dec===f))&&(!sec||a.sec===sec)&&(!q||normT(a.titulo+' '+a.resp+' '+a.sec+' '+a.cal).includes(q))&&(!fut||!jnDatasEf(a).length||jnDatasEf(a).some(d=>d.fim>=hj)||jnPrecEf(a)==='indef'));
  const grupo=a=>{const pr=jnPrecEf(a);if(pr==='indef')return 'zz2';if(pr==='anual')return 'zz1';return jnIni(a).slice(0,7)};
  const G=[...new Set(L.map(grupo))].sort();const gl=g=>g==='zz1'?'Ao Longo do Ano':g==='zz2'?'Data por Definir':JN_MN[+g.slice(5)-1]+' '+g.slice(0,4);
  const n=k=>y.ativ.filter(a=>k==='pend'?a.dec==null:a.dec===k).length;
  c.innerHTML=`<div class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><div class="seg">${[['todas','Todas '+y.ativ.length],['pend','Por Decidir '+n('pend')],['cobrir','A Cobrir '+n('cobrir')],['ignorar','Ignoradas '+n('ignorar')]].map(([k,l])=>`<button data-jf="${k}" class="${f===k?'on':''}">${l}</button>`).join('')}</div>
    <select id="jn-sec" style="max-width:260px"><option value="">Todas as secções</option>${secs.map(s=>`<option ${s===sec?'selected':''}>${esc(s)}</option>`).join('')}</select>
    <label class="chk" style="margin:0"><input type="checkbox" id="jn-fut" ${fut?'checked':''}> Só por acontecer</label><span class="sp1"></span><input type="search" id="jn-q" placeholder="Procurar…" value="${esc(UI.jnQ||'')}" style="max-width:220px"><button class="btn" data-jnnova>${ic('plus',15)} Atividade</button></div>
    ${(()=>{const P=y.paa;return P?`<p class="hint" style="margin:8px 0 0">${ic('file',13)} ${esc(P.ficheiro)} · importado ${esc(new Date(P.em).toLocaleDateString('pt-PT'))} · ${P.n} atividades. Toque numa atividade para confirmar a data, ver os responsáveis e recursos.</p>`:''})()}
    ${G.length?G.map(g=>{const X=L.filter(a=>grupo(a)===g).sort((a,b)=>jnIni(a).localeCompare(jnIni(b))||a.titulo.localeCompare(b.titulo));return `<h3 class="jn-gh">${gl(g)} <span class="mut">${X.length}</span></h3><div class="jn-l">${X.map(a=>jnLinhaA(a)).join('')}</div>`}).join(''):`<div class="empty">Nenhuma atividade com estes filtros.</div>`}</div>`;
  $$('[data-jf]').forEach(b=>b.onclick=()=>{UI.jnF=b.dataset.jf;jnPAA()});$('#jn-sec').onchange=e=>{UI.jnSec=e.target.value;jnPAA()};$('#jn-fut').onchange=e=>{UI.jnFut=e.target.checked;jnPAA()};
  $('#jn-q').oninput=e=>{UI.jnQ=e.target.value;clearTimeout(jnPAA._t);jnPAA._t=setTimeout(()=>{jnPAA();const i=$('#jn-q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)};jnBindComuns()}
function jnEventos(ini,fim){const {y}=JN();const E=[];const dentro=d=>d>=ini&&d<=fim;
  y.ativ.forEach(a=>{if(a.dec==='ignorar'||(a.foraPAA&&a.dec!=='cobrir'))return;const pr=jnPrecEf(a);if(pr!=='dia')return;jnDatasEf(a).forEach(d=>{if(d.fim<ini||d.ini>fim)return;for(let x=d.ini>ini?d.ini:ini;x<=d.fim&&x<=fim;x=jnAdd(x,1))E.push({d:x,t:a.titulo,c:a.dec==='cobrir'?'cob':'nd',ja:a.id,h:x===d.ini?jnHora(a):''})})});
  y.pecas.forEach(p=>{if(p.prazo&&dentro(p.prazo)&&p.estado!=='publicada')E.push({d:p.prazo,t:'Entrega: '+p.titulo,c:'prz',jp:p.id})});
  y.edicoes.forEach(e=>{if(e.fecho&&dentro(e.fecho))E.push({d:e.fecho,t:'Fecho n.º '+(e.num||'?'),c:'fec',je:e.id});if(e.pub&&dentro(e.pub))E.push({d:e.pub,t:'Publicação n.º '+(e.num||'?'),c:'pub',je:e.id})});
  return E}
function jnCal(){const {y}=JN();const c=$('#jn-c');const hj=jnHoje();const m=UI.jnMes||hj.slice(0,7);const Y=+m.slice(0,4),M=+m.slice(5);
  const ini=jnIso(Y,M,1),fim=jnIso(Y,M,jnUlt(Y,M));const off=(dataDeIso(ini).getDay()+6)%7;const E=jnEventos(ini,fim);
  const vagos=y.ativ.filter(a=>a.dec!=='ignorar'&&!a.foraPAA&&(jnPrecEf(a)==='mes'||jnPrecEf(a)==='periodo')&&jnDatasEf(a).some(d=>d.ini<=fim&&d.fim>=ini));
  const per=jnPeriodos(jnAnoIni());const nL=s=>(per.find(p=>s>=p.ini&&s<=p.fim)||{}).n;
  let cells='';for(let i=0;i<off;i++)cells+='<div class="jn-cd vz"></div>';
  for(let d=1;d<=jnUlt(Y,M);d++){const iso=jnIso(Y,M,d);const X=E.filter(e=>e.d===iso);const fds=[0,6].includes(dataDeIso(iso).getDay());
    cells+=`<div class="jn-cd ${iso===hj?'hj':''} ${fds?'fds':''} ${nL(iso)?'':'nl'}" data-jcd="${iso}"><span class="jn-cn">${d}</span>${X.slice(0,3).map(e=>`<span class="jn-ev ${e.c}" title="${esc(e.t)}">${e.h?'<i>'+esc(e.h)+'</i> ':''}${esc(e.t)}</span>`).join('')}${X.length>3?`<span class="jn-more">+${X.length-3}</span>`:''}</div>`}
  c.innerHTML=`<div class="card"><div class="row" style="margin-bottom:10px"><button class="btn sm ico" id="jc-p" aria-label="Mês anterior">${ic('back',14)}</button><h2 style="margin:0;min-width:170px;text-align:center">${JN_MN[M-1]} ${Y}</h2><button class="btn sm ico jn-flip" id="jc-n" aria-label="Mês seguinte">${ic('back',14)}</button><button class="btn sm" id="jc-h">Hoje</button><span class="sp1"></span>
    <span class="jn-leg"><span class="jn-ev cob">A cobrir</span><span class="jn-ev nd">Por decidir</span><span class="jn-ev prz">Entrega</span><span class="jn-ev fec">Fecho</span><span class="jn-ev pub">Publicação</span></span></div>
    <div class="jn-cal">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=>`<div class="jn-cw">${d}</div>`).join('')}${cells}</div>
    ${vagos.length?`<h3 class="jn-gh">Neste mês, sem dia marcado <span class="mut">${vagos.length}</span></h3><div class="jn-l">${vagos.map(a=>jnLinhaA(a)).join('')}</div>`:''}</div>`;
  const mv=k=>{const d=new Date(Y,M-1+k,1);UI.jnMes=d.getFullYear()+'-'+jnPad(d.getMonth()+1);jnCal()};$('#jc-p').onclick=()=>mv(-1);$('#jc-n').onclick=()=>mv(1);$('#jc-h').onclick=()=>{UI.jnMes=null;jnCal()};
  $$('[data-jcd]').forEach(b=>b.onclick=()=>{const iso=b.dataset.jcd;const X=E.filter(e=>e.d===iso);
    openDrawer(fmtIsoL(iso)+' · '+contagem(iso),`<div class="ed">${X.length?`<div class="jn-l">${X.map(e=>e.ja?jnLinhaA(JN().y.ativ.find(a=>a.id===e.ja),true):`<button class="jn-av" ${e.jp?'data-jp="'+e.jp+'"':'data-je="'+e.je+'"'}><span class="jn-avi">${ic(e.jp?'pen':'news',16)}</span><span><b>${esc(e.t)}</b></span></button>`).join('')}</div>`:'<p class="mut">Nada marcado neste dia.</p>'}
     <div class="row" style="margin-top:12px"><button class="btn" id="jcd-a">${ic('plus',14)} Atividade neste dia</button><button class="btn" id="jcd-p">${ic('pen',14)} Peça com entrega neste dia</button></div></div>`);
    jnBindComuns();$('#jcd-a').onclick=()=>jnAtivDlg(null,iso);$('#jcd-p').onclick=()=>jnPecaDlg(null,{prazo:iso})});jnBindComuns()}
function jnPecas(){const {y}=JN();const c=$('#jn-c');const fe=UI.jnPE||'';const hj=jnHoje();
  const L=y.pecas.filter(p=>!fe||(fe==='sem'?!p.edicao:p.edicao===fe));const edN=id=>{const e=y.edicoes.find(x=>x.id===id);return e?'n.º '+(e.num||'?'):''};
  c.innerHTML=`<div class="card"><div class="row" style="gap:8px"><button class="btn pri" id="jpn">${ic('plus',15)} Nova Peça</button><select id="jp-ed" style="max-width:240px"><option value="">Todas as edições</option><option value="sem" ${fe==='sem'?'selected':''}>Sem edição</option>${y.edicoes.map(e=>`<option value="${e.id}" ${fe===e.id?'selected':''}>Edição n.º ${esc(e.num||'?')}${e.titulo?' · '+esc(e.titulo):''}</option>`).join('')}</select><span class="sp1"></span><span class="mut">${L.length} peça(s)</span></div></div>
   <div class="jn-kb">${JN_EST.map(([k,l,cor])=>{const X=L.filter(p=>p.estado===k).sort((a,b)=>(a.prazo||'9').localeCompare(b.prazo||'9'));return `<div class="jn-kc" data-kst="${k}"><h3 style="--ac:${cor}">${l} <span class="mut">${X.length}</span></h3>${X.map(p=>`<div class="jn-pc ${p.prazo&&p.prazo<hj&&!jnFeita(p)?'atr':''}" data-jp="${p.id}" draggable="true" data-drag="${p.id}"><b>${esc(p.titulo)}</b><span class="mut">${esc(p.tipo||'')}${p.autor?' · '+esc(jnNomeM(p.autor)):''}${p.foto?' · '+ic('image',11)+' '+esc(jnNomeM(p.foto)):''}</span><span class="jn-pm">${p.prazo?`<span class="tag ${p.prazo<hj&&!jnFeita(p)?'bad':''}">${ic('clock',11)} ${esc(fmtIsoL(p.prazo))}</span>`:''}${p.edicao?`<span class="tag">${esc(edN(p.edicao))}</span>`:''}${p.ativ?`<span class="tag">PAA</span>`:''}${k!=='publicada'?`<button class="btn sm jn-adv" data-jadv="${p.id}" title="Passar para «${jnEst(JN_EST[JN_EST.findIndex(e=>e[0]===k)+1][0])[1]}»">${ic('check',12)} ${jnEst(JN_EST[JN_EST.findIndex(e=>e[0]===k)+1][0])[1]}</button>`:''}</span></div>`).join('')||'<div class="mut jn-kv0">—</div>'}</div>`}).join('')}</div>`;
  $('#jpn').onclick=()=>jnPecaDlg(null);$('#jp-ed').onchange=e=>{UI.jnPE=e.target.value;jnPecas()};
  $$('[data-jadv]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=y.pecas.find(x=>x.id===b.dataset.jadv);if(!p)return;const i=JN_EST.findIndex(x=>x[0]===p.estado);p.estado=JN_EST[Math.min(i+1,JN_EST.length-1)][0];save();vJornal()});
  $$('[data-drag]').forEach(el=>el.ondragstart=e=>e.dataTransfer.setData('text/plain',el.dataset.drag));
  $$('[data-kst]').forEach(col=>{col.ondragover=e=>{e.preventDefault();col.classList.add('ov')};col.ondragleave=()=>col.classList.remove('ov');col.ondrop=e=>{e.preventDefault();const p=y.pecas.find(x=>x.id===e.dataTransfer.getData('text/plain'));if(p){p.estado=col.dataset.kst;save();vJornal()}}});jnBindComuns()}
function jnEdicoes(){const {y}=JN();const c=$('#jn-c');const hj=jnHoje();const L=y.edicoes.slice().sort((a,b)=>(b.fecho||'').localeCompare(a.fecho||''));
  c.innerHTML=`<div class="card"><div class="row"><h2 style="margin:0">${ic('news',18)} Edições</h2><span class="sp1"></span><button class="btn pri" id="jen">${ic('plus',15)} Nova Edição</button></div>
   ${L.length?`<div class="jn-eds">${L.map(e=>{const P=y.pecas.filter(p=>p.edicao===e.id);const ok=P.filter(jnFeita).length;const ck=(e.check||[]).length;return `<button class="jn-ed ${e.estado}" data-je="${e.id}"><span class="jn-edn">${esc(e.num||'?')}</span><span class="jn-lt"><b>${esc(e.titulo||'Edição n.º '+(e.num||'?'))}</b><span class="mut">${e.fecho?'Fecho '+esc(fmtIsoL(e.fecho))+(e.estado!=='publicada'&&e.fecho>=hj?' · '+esc(contagem(e.fecho)):''):'Sem data de fecho'}${e.pub?' · publicação '+esc(fmtIsoL(e.pub)):''}</span>
     <span class="jn-bar"><i style="width:${P.length?Math.round(100*ok/P.length):0}%"></i></span><span class="mut">${ok}/${P.length} peças prontas · lista de verificação ${ck}/${JN_CHECK.length}</span></span><span class="tag">${e.estado==='publicada'?'Publicada':e.estado==='fecho'?'Em fecho':'Planeada'}</span></button>`}).join('')}</div>`:`<div class="empty">${ic('news',30)}<br><b>Ainda sem edições</b><br><span class="mut">Crie a próxima edição com a data de fecho: as peças a cobrir ficam associadas e recebe avisos antes do fecho.</span></div>`}</div>`;
  $('#jen').onclick=()=>jnEdDlg(null);jnBindComuns()}
function jnEquipa(){const {j}=JN();const c=$('#jn-c');const {y}=JN();
  c.innerHTML=`<div class="card ed"><h2>${ic('users',18)} Redação</h2><p class="hint" style="margin-top:0">Alunos e professores que escrevem, fotografam, reveem e paginam. Aparecem para atribuir às peças.</p>
   <table class="lst"><thead><tr><th>Nome</th><th>Função</th><th>Turma</th><th>Contacto</th><th>Peças</th><th></th></tr></thead><tbody>${j.equipa.map(m=>`<tr><td><input data-jm="${m.id}|nome" value="${esc(m.nome)}"></td><td><select data-jm="${m.id}|funcao">${JN_FUNC.map(f=>`<option ${m.funcao===f?'selected':''}>${f}</option>`).join('')}</select></td><td><input data-jm="${m.id}|turma" value="${esc(m.turma||'')}" style="max-width:90px"></td><td><input data-jm="${m.id}|contacto" value="${esc(m.contacto||'')}" placeholder="e-mail ou telefone"></td><td>${y.pecas.filter(p=>(p.autor===m.id||p.foto===m.id)&&!jnFeita(p)).length} em curso</td><td><button class="btn sm ico" data-jmx="${m.id}" aria-label="Remover">${ic('x',12)}</button></td></tr>`).join('')}</tbody></table>
   <div class="row" style="margin-top:10px"><input id="jm-n" placeholder="Nome" style="max-width:240px"><select id="jm-f" style="max-width:160px">${JN_FUNC.map(f=>`<option>${f}</option>`).join('')}</select><input id="jm-t" placeholder="Turma" style="max-width:100px"><button class="btn pri" id="jm-ok">${ic('plus',15)} Juntar</button></div></div>`;
  $$('[data-jm]').forEach(i=>i.onchange=()=>{const [id,k]=i.dataset.jm.split('|');const m=jnMembro(id);if(m){m[k]=i.value.trim();save()}});
  $$('[data-jmx]').forEach(b=>b.onclick=()=>{const m=jnMembro(b.dataset.jmx);if(m&&confirm('Remover '+m.nome+' da redação?')){j.equipa=j.equipa.filter(x=>x!==m);save();jnEquipa()}});
  const add=()=>{const n=$('#jm-n').value.trim();if(!n)return $('#jm-n').focus();j.equipa.push({id:uid(),nome:n,funcao:$('#jm-f').value,turma:$('#jm-t').value.trim(),contacto:''});save();jnEquipa();setTimeout(()=>$('#jm-n')&&$('#jm-n').focus(),30)};
  $('#jm-ok').onclick=add;$('#jm-n').onkeydown=e=>{if(e.key==='Enter')add()}}

/* ---------- diálogos ---------- */
const jnOptM=(sel,vazio)=>`<option value="">${vazio||'—'}</option>`+JN().j.equipa.map(m=>`<option value="${m.id}" ${sel===m.id?'selected':''}>${esc(m.nome)} · ${esc(m.funcao||'')}</option>`).join('');
function jnPedido(a){const {cfg}=JN();const D=jnDatasEf(a);return `Olá${a.resp?' ('+a.resp+')':''},\n\nO ${cfg.nome} gostaria de noticiar a atividade «${a.titulo}»${D.length&&jnPrecEf(a)==='dia'?', prevista para '+fmtIsoL(D[0].ini):''}.\n\nPodem enviar-nos:\n• um pequeno texto (o quê, quem, quando, onde e porquê);\n• 3 a 5 fotografias (só de alunos com autorização de imagem);\n• uma ou duas declarações de participantes.\n\n${jnPrecEf(a)!=='dia'?'Podem também confirmar-nos a data exata?\n\n':''}Obrigado!\n${S.cfg.professor||''}`}
function jnAtivDlg(a,diaNovo){const {y}=JN();const novo=!a;if(novo)a={id:uid(),orig:'manual',titulo:'',sec:'Extra PAA',resp:'',cal:'',dec:null,prec:diaNovo?'dia':'indef',datas:diaNovo?[{ini:diaNovo,fim:diaNovo}]:[],criada:Date.now()};
  const p=jnPecaDe(a);const pr=a.prec||'indef';
  if(a.alterada&&!a.altVista){a.altVista=true;save()}
  openDrawer(novo?'Nova Atividade':'Atividade do '+(a.orig==='paa'?'PAA':'Jornal'),`<div class="ed jn-dlg">
   <label>Atividade</label><input id="ja-t" value="${esc(a.titulo)}" placeholder="Nome da atividade">
   <div class="jn-g2"><div><label>Secção / Departamento</label><input id="ja-s" value="${esc(a.sec||'')}"></div><div><label>Responsáveis</label><input id="ja-r" value="${esc(a.resp||'')}"></div></div>
   ${a.orig==='paa'?`<div class="jn-box"><b>No PAA:</b> «${esc(a.cal||'—')}» <span class="mut">→ ${esc(JN_PREC[pr])}: ${esc(jnLblD(a.datas,pr))}${a.hora?' · '+esc(a.hora):''}</span>${a.calAnt?`<br><span class="mut">Antes da última importação: «${esc(a.calAnt)}»</span>`:''}${a.det?`<br><span class="mut">Destinatários: ${esc(a.det)}</span>`:''}${a.rec?`<br><span class="mut">Recursos: ${esc(a.rec)}</span>`:''}${a.obj?`<br><span class="mut">Objetivo: ${esc(a.obj)}</span>`:''}</div>`:''}
   <div class="jn-g3"><div><label>${a.orig==='paa'?'Data confirmada':'Data'}</label><input type="date" id="ja-d" value="${esc(a.conf||(novo&&diaNovo)||(a.orig==='manual'&&a.datas[0]?a.datas[0].ini:''))}"></div><div><label>Até (opcional)</label><input type="date" id="ja-f" value="${esc(a.confFim||(a.orig==='manual'&&a.datas[0]&&a.datas[0].fim!==a.datas[0].ini?a.datas[0].fim:''))}"></div><div><label>Hora</label><input type="time" id="ja-h" value="${esc(a.confHora||a.hora||'')}"></div></div>
   ${a.orig==='paa'?`<p class="hint" style="margin-top:4px">Ao confirmar uma data, esta substitui a do PAA no calendário e nos avisos.${a.conf?' <button class="btn sm" id="ja-dx">Voltar à data do PAA</button>':''}</p>`:''}
   <label>Cobertura pelo jornal</label><div class="seg" id="ja-dec">${[['','Por decidir'],['cobrir','Cobrir'],['ignorar','Não cobrir']].map(([k,l])=>`<button type="button" data-v="${k}" class="${(a.dec||'')===k?'on':''}">${l}</button>`).join('')}</div>
   ${p?`<div class="jn-box" style="margin-top:10px">${ic('pen',14)} Peça: <b>${esc(p.titulo)}</b> · ${jnEst(p.estado)[1]}${p.autor?' · '+esc(jnNomeM(p.autor)):' · sem repórter'}${p.prazo?' · entrega '+esc(fmtIsoL(p.prazo)):''} <button class="btn sm" id="ja-p">Abrir Peça</button></div>`:''}
   <label style="margin-top:10px">Notas</label><textarea id="ja-n" style="min-height:70px" placeholder="Contactos, local, o que fotografar…">${esc(a.notas||'')}</textarea>
   <div class="row" style="margin-top:12px">${a.orig==='manual'&&!novo?`<button class="btn dng" id="ja-x">${ic('trash',14)} Apagar</button>`:''}<button class="btn" id="ja-cp">${ic('copy',14)} Copiar Pedido ao Responsável</button><span class="sp1"></span><button class="btn pri" id="ja-ok">${ic('check',15)} Guardar</button></div></div>`);
  let dec=a.dec||'';$$('#ja-dec [data-v]').forEach(b=>b.onclick=()=>{dec=b.dataset.v;$$('#ja-dec [data-v]').forEach(x=>x.classList.toggle('on',x===b))});
  const guardar=()=>{const t=$('#ja-t').value.trim();if(!t){alert('Indique o nome da atividade.');return false}
    if(t!==a.titulo&&a.orig==='paa')a.titEd=true;a.titulo=t;a.sec=$('#ja-s').value.trim()||a.sec;a.resp=$('#ja-r').value.trim();a.notas=$('#ja-n').value;
    const d=$('#ja-d').value,f=$('#ja-f').value,h=$('#ja-h').value;
    if(a.orig==='paa'){a.conf=d||undefined;a.confFim=d&&f?f:undefined;a.confHora=d?h:undefined;if(!d&&h)a.hora=h}
    else{a.datas=d?[{ini:d,fim:f&&f>=d?f:d}]:[];a.prec=d?'dia':'indef';a.hora=h;a.cal=d?'':a.cal}
    if(novo)y.ativ.push(a);const p0=jnPecaDe(a);
    if((dec||null)!==a.dec){a.dec=dec==='cobrir'?null:a.dec;if(dec==='cobrir')jnCobrir(a,'cobrir');else a.dec=dec||null}
    if(p0&&!p0.prazo&&jnPrecEf(a)==='dia'){const D=jnDatasEf(a);p0.prazo=jnAdd(D[D.length-1].fim,JN().cfg.diasEntrega)}
    save();return true};
  $('#ja-ok').onclick=()=>{if(guardar()){closeDrawer();vJornal()}};
  $('#ja-cp').onclick=()=>{const t=jnPedido({...a,titulo:$('#ja-t').value||a.titulo});try{navigator.clipboard.writeText(t).then(()=>toast('Pedido copiado — cole-o no e-mail ou no Teams','ok'),()=>prompt('Copie o texto:',t))}catch(_){prompt('Copie o texto:',t)}};
  if($('#ja-dx'))$('#ja-dx').onclick=()=>{a.conf=a.confFim=a.confHora=undefined;save();jnAtivDlg(a)};
  if($('#ja-p'))$('#ja-p').onclick=()=>{if(guardar())jnPecaDlg(jnPecaDe(a))};
  if($('#ja-x'))$('#ja-x').onclick=()=>{if(!confirm('Apagar a atividade «'+a.titulo+'»?'))return;y.ativ=y.ativ.filter(x=>x!==a);const pp=jnPecaDe(a);if(pp)pp.ativ='';save();closeDrawer();vJornal()}}
function jnPecaDlg(p,pre){const {y}=JN();const novo=!p;if(novo)p=Object.assign({id:uid(),titulo:'',tipo:'Notícia',estado:'ideia',autor:'',foto:'',prazo:'',edicao:jnEdicaoPara(''),notas:'',criada:Date.now()},pre||{});
  const a=p.ativ&&y.ativ.find(x=>x.id===p.ativ);
  openDrawer(novo?'Nova Peça':'Peça',`<div class="ed jn-dlg"><label>Título</label><input id="jp-t" value="${esc(p.titulo)}" placeholder="Título de trabalho">
   ${a?`<div class="jn-box">${ic('list',14)} Atividade: <b>${esc(a.titulo)}</b> · ${esc(jnLbl(a))} <button class="btn sm" id="jp-a">Abrir</button></div>`:''}
   <div class="jn-g2"><div><label>Tipo</label><select id="jp-ti">${JN_TIPOS.map(t=>`<option ${p.tipo===t?'selected':''}>${t}</option>`).join('')}</select></div><div><label>Estado</label><select id="jp-e">${JN_EST.map(([k,l])=>`<option value="${k}" ${p.estado===k?'selected':''}>${l}</option>`).join('')}</select></div></div>
   <div class="jn-g2"><div><label>Autor / repórter</label><select id="jp-au">${jnOptM(p.autor,'Sem repórter')}</select></div><div><label>Fotografia</label><select id="jp-fo">${jnOptM(p.foto,'Sem fotógrafo')}</select></div></div>
   ${JN().j.equipa.length?'':`<p class="hint">Junte os elementos da redação no separador «Redação» para os poder atribuir.</p>`}
   <div class="jn-g2"><div><label>Prazo de entrega</label><input type="date" id="jp-pz" value="${esc(p.prazo||'')}"></div><div><label>Edição</label><select id="jp-edc"><option value="">Sem edição</option>${y.edicoes.map(e=>`<option value="${e.id}" ${p.edicao===e.id?'selected':''}>N.º ${esc(e.num||'?')}${e.fecho?' · fecho '+esc(fmtIsoL(e.fecho)):''}</option>`).join('')}</select></div></div>
   <label class="chk"><input type="checkbox" id="jp-ok2" ${p.fotosOk?'checked':''}> Fotografias com alunos: autorizações de imagem verificadas</label>
   <label>Notas / texto</label><textarea id="jp-n" placeholder="Ideias, contactos, rascunho…">${esc(p.notas||'')}</textarea>
   <div class="row" style="margin-top:12px">${novo?'':`<button class="btn dng" id="jp-x">${ic('trash',14)} Apagar</button>`}<span class="sp1"></span><button class="btn pri" id="jp-ok">${ic('check',15)} Guardar</button></div></div>`);
  const guardar=()=>{const t=$('#jp-t').value.trim();if(!t){alert('Indique o título.');return false}Object.assign(p,{titulo:t,tipo:$('#jp-ti').value,estado:$('#jp-e').value,autor:$('#jp-au').value,foto:$('#jp-fo').value,prazo:$('#jp-pz').value,edicao:$('#jp-edc').value,fotosOk:$('#jp-ok2').checked,notas:$('#jp-n').value});
    if(p.autor&&p.estado==='ideia')p.estado='atribuida';if(novo)y.pecas.push(p);save();return true};
  $('#jp-ok').onclick=()=>{if(guardar()){closeDrawer();vJornal()}};if($('#jp-a'))$('#jp-a').onclick=()=>{if(guardar())jnAtivDlg(a)};
  if($('#jp-x'))$('#jp-x').onclick=()=>{if(!confirm('Apagar a peça «'+p.titulo+'»?'))return;y.pecas=y.pecas.filter(x=>x!==p);if(a&&a.dec==='cobrir')a.dec=null;save();closeDrawer();vJornal()}}
function jnEdDlg(e){const {y}=JN();const novo=!e;if(novo){const n=y.edicoes.reduce((m,x)=>Math.max(m,+x.num||0),0)+1;e={id:uid(),num:String(n),titulo:'',fecho:'',pub:'',estado:'planeada',check:[],notas:''}}
  const P=y.pecas.filter(p=>p.edicao===e.id);const soltas=y.pecas.filter(p=>!p.edicao&&p.estado!=='publicada');
  openDrawer(novo?'Nova Edição':'Edição n.º '+(e.num||'?'),`<div class="ed jn-dlg"><div class="jn-g3"><div><label>Número</label><input id="je-n" value="${esc(e.num||'')}"></div><div><label>Data de fecho</label><input type="date" id="je-f" value="${esc(e.fecho||'')}"></div><div><label>Publicação</label><input type="date" id="je-p" value="${esc(e.pub||'')}"></div></div>
   <label>Título / tema</label><input id="je-t" value="${esc(e.titulo||'')}" placeholder="Ex.: Edição de Natal">
   <label>Estado</label><div class="seg" id="je-e">${[['planeada','Planeada'],['fecho','Em fecho'],['publicada','Publicada']].map(([k,l])=>`<button type="button" data-v="${k}" class="${e.estado===k?'on':''}">${l}</button>`).join('')}</div>
   <label style="margin-top:10px">Lista de verificação</label>${JN_CHECK.map((c,i)=>`<label class="chk"><input type="checkbox" data-jck="${i}" ${(e.check||[]).includes(i)?'checked':''}> ${esc(c)}</label>`).join('')}
   ${novo?'':`<label style="margin-top:10px">Peças (${P.length})</label>${P.length?`<div class="jn-l">${P.map(p=>`<button class="jn-av" data-jp="${p.id}"><span class="jn-avi" style="color:${jnEst(p.estado)[2]}">${ic('pen',15)}</span><span><b>${esc(p.titulo)}</b><span class="mut">${jnEst(p.estado)[1]}${p.autor?' · '+esc(jnNomeM(p.autor)):''}</span></span></button>`).join('')}</div>`:'<p class="mut">Ainda sem peças.</p>'}${soltas.length?`<button class="btn sm" id="je-j">${ic('plus',13)} Juntar ${soltas.length} peça(s) sem edição</button>`:''}`}
   <label>Notas</label><textarea id="je-no" style="min-height:60px">${esc(e.notas||'')}</textarea>
   <div class="row" style="margin-top:12px">${novo?'':`<button class="btn dng" id="je-x">${ic('trash',14)} Apagar</button>`}<span class="sp1"></span><button class="btn pri" id="je-ok">${ic('check',15)} Guardar</button></div></div>`);
  let est=e.estado;$$('#je-e [data-v]').forEach(b=>b.onclick=()=>{est=b.dataset.v;$$('#je-e [data-v]').forEach(x=>x.classList.toggle('on',x===b))});
  const guardar=()=>{Object.assign(e,{num:$('#je-n').value.trim(),fecho:$('#je-f').value,pub:$('#je-p').value,titulo:$('#je-t').value.trim(),estado:est,notas:$('#je-no').value,check:$$('[data-jck]').filter(x=>x.checked).map(x=>+x.dataset.jck)});
    if(est==='publicada')y.pecas.filter(p=>p.edicao===e.id&&p.estado==='pronta').forEach(p=>p.estado='publicada');if(novo)y.edicoes.push(e);save();return true};
  $('#je-ok').onclick=()=>{guardar();closeDrawer();vJornal()};jnBindComuns();
  if($('#je-j'))$('#je-j').onclick=()=>{guardar();soltas.forEach(p=>p.edicao=e.id);save();jnEdDlg(e)};
  if($('#je-x'))$('#je-x').onclick=()=>{if(!confirm('Apagar a edição n.º '+e.num+'? As peças ficam sem edição.'))return;y.edicoes=y.edicoes.filter(x=>x!==e);y.pecas.forEach(p=>{if(p.edicao===e.id)p.edicao=''});save();closeDrawer();vJornal()}}
function jnCfgDlg(){const {cfg}=JN();openDrawer('Opções do Jornal',`<div class="ed"><label>Nome do jornal</label><input id="jo-n" value="${esc(cfg.nome)}">
  <div class="jn-g3"><div><label>Avisar com antecedência (dias)</label><input type="number" id="jo-d" min="1" max="60" value="${cfg.dias}"></div><div><label>Pedir material após (dias)</label><input type="number" id="jo-m" min="0" max="30" value="${cfg.diasMat}"></div><div><label>Prazo da peça após atividade</label><input type="number" id="jo-e" min="0" max="30" value="${cfg.diasEntrega}"></div></div>
  <p class="hint">Os avisos urgentes aparecem também na janela «Avisos Urgentes» e no número ao lado de «Jornal Escolar» na barra lateral. Para alarmes no iPad/Mac mesmo com a app fechada, use «Exportar .ics».</p>
  <div class="row" style="margin-top:12px"><button class="btn" id="jo-off">Desativar o módulo</button><span class="sp1"></span><button class="btn pri" id="jo-ok">${ic('check',15)} Guardar</button></div></div>`);
  $('#jo-ok').onclick=()=>{cfg.nome=$('#jo-n').value.trim()||'Jornal Escolar';cfg.dias=Math.max(1,Math.min(60,+$('#jo-d').value||7));cfg.diasMat=Math.max(0,+$('#jo-m').value||0);cfg.diasEntrega=Math.max(0,+$('#jo-e').value||0);save();closeDrawer();vJornal()};
  $('#jo-off').onclick=()=>{if(confirm('Desativar o módulo Jornal Escolar? Os dados ficam guardados e pode voltar a ativá-lo em Definições.')){jnAtivar(false);closeDrawer();go('inicio')}}}
function jnAtivar(on){S.cfg.modulos=S.cfg.modulos||{};S.cfg.modulos.jornal=!!on;save();audit('Jornal',on?'Módulo ativado':'Módulo desativado','');jnNav();jnBadge()}
function jnICS(){const {y,cfg}=JN();const e=s=>String(s||'').replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');const dd=iso=>iso.replace(/-/g,'');const st=icsData(new Date());
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EduSpruce//Jornal//PT','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+e(cfg.nome)];let n=0;
  const ev=(id,ini,fim,hora,tit,desc,alarme)=>{L.push('BEGIN:VEVENT','UID:'+id+'@eduflow-jornal','DTSTAMP:'+st);
    if(hora){const [h,m]=hora.split(':');L.push('DTSTART:'+dd(ini)+'T'+h+m+'00','DURATION:PT1H')}else L.push('DTSTART;VALUE=DATE:'+dd(ini),'DTEND;VALUE=DATE:'+dd(jnAdd(fim,1)));
    L.push('SUMMARY:'+e(tit));if(desc)L.push('DESCRIPTION:'+e(desc));if(alarme)L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+e(tit),'TRIGGER:'+alarme,'END:VALARM');L.push('END:VEVENT');n++};
  y.ativ.forEach(a=>{if(a.dec==='ignorar'||jnPrecEf(a)!=='dia'||(a.foraPAA&&a.dec!=='cobrir'))return;jnDatasEf(a).forEach((d,i)=>ev(a.id+'-'+i,d.ini,d.fim,d.ini===d.fim?jnHora(a):'',(a.dec==='cobrir'?'📰 ':'')+a.titulo,[a.sec,a.resp?'Responsáveis: '+a.resp:'',a.cal?'PAA: '+a.cal:'',a.notas].filter(Boolean).join('\n'),a.dec==='cobrir'?'-P1D':''))});
  y.pecas.forEach(p=>{if(p.prazo&&!jnFeita(p))ev('p'+p.id,p.prazo,p.prazo,'','Entrega: '+p.titulo,p.autor?jnNomeM(p.autor):'','-P1D')});
  y.edicoes.forEach(x=>{if(x.fecho)ev('f'+x.id,x.fecho,x.fecho,'','Fecho do '+cfg.nome+' n.º '+(x.num||'?'),x.titulo,'-P3D');if(x.pub)ev('b'+x.id,x.pub,x.pub,'','Publicação do '+cfg.nome+' n.º '+(x.num||'?'),x.titulo,'')});
  L.push('END:VCALENDAR');download(cfg.nome+' '+jnAnoNome().replace('/','-')+'.ics',L.join('\r\n'),'text/calendar');toast(n+' eventos exportados — abra o ficheiro para os juntar ao Calendário','ok')}

/* ---------- ligações ao resto da app ---------- */
{const nav=$('#side [data-v="jornal"]');if(nav)nav.onclick=()=>go('jornal')}
{const _g=go;go=function(v){if(v==='jornal'&&!jnOn())v='inicio';const r=_g.apply(this,arguments);try{jnNav();jnBadge()}catch(_){}return r}}
{const _ap=aplicarPrefs;aplicarPrefs=function(){const r=_ap.apply(this,arguments);try{jnNav()}catch(_){}return r}}
{const _au=avisosUrgentes;avisosUrgentes=function(){const L=_au.apply(this,arguments);try{const V=avVistos(),agora=Date.now();jnAvisos().filter(x=>x.u).forEach(x=>{const k=x.k+':'+jnHoje();if(V[k]&&V[k]>agora)return;L.push({k,g:'jornal',ic:x.ic,cor:x.cor,t:x.t,s:x.s,ir:()=>{UI.jnTab='painel';go('jornal');setTimeout(()=>jnAbrirAviso(x),60)}})})}catch(err){console.warn(err)}return L}}
WIDGETS.push(['jornal','Jornal Escolar','news']);
{const _pi=posInicio;posInicio=function(){try{const main=$('.in-main');if(main&&jnOn()&&!$('.jn-w0')){const {y,cfg}=JN();const AV=jnAvisos();const hj=jnHoje();const X=y.ativ.filter(a=>!a.foraPAA&&a.dec!=='ignorar'&&jnPrecEf(a)==='dia'&&jnDatasEf(a).some(d=>d.fim>=hj&&d.ini<=jnAdd(hj,cfg.dias))).sort((a,b)=>jnIni(a).localeCompare(jnIni(b))).slice(0,5);
    main.insertAdjacentHTML('beforeend',`<div class="card jn-w0" data-w="jornal"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">${ic('news',18)} ${esc(cfg.nome)}</h2><span class="sp1"></span><button class="btn sm" id="jw-go">Abrir</button></div>
     ${!y.ativ.length?`<p class="mut" style="margin:0">Importe o PAA para receber avisos das atividades a cobrir.</p>`:''}
     ${AV.filter(x=>x.u).slice(0,4).map(x=>`<div class="jn-wl" style="--ac:${x.cor}">${ic(x.ic,14)} <b>${esc(x.t)}</b> <span class="mut">${esc(x.s)}</span></div>`).join('')}
     ${X.length?`<div class="mut" style="margin:8px 0 4px;font-size:12px">Próximos ${cfg.dias} dias no PAA</div>${X.map(a=>`<div class="jn-wl"><span class="jn-dc dia">${esc(jnLbl(a))}</span> ${esc(a.titulo)} ${a.dec==='cobrir'?'<span class="tag">a cobrir</span>':a.dec==null?'<span class="tag jn-w">por decidir</span>':''}</div>`).join('')}`:''}</div>`);
    const b=$('#jw-go');if(b)b.onclick=()=>{UI.jnTab='painel';go('jornal')}}}catch(err){console.warn(err)}return _pi.apply(this,arguments)}}
{const _ca=cartaoAvisosDef,_ba=bindAvisosDef;cartaoAvisosDef=function(){return _ca.apply(this,arguments)+`<div class="card ed" id="def-mods"><h2>${ic('layers',18)} Módulos Opcionais</h2><p class="hint" style="margin-top:0">Ative só o que usa. Desativar um módulo esconde-o da barra lateral, do Início e dos avisos — os dados ficam guardados.</p>
    <label class="chk"><input type="checkbox" id="mod-jn" ${jnOn()?'checked':''}> ${ic('news',15)} <span><b>Jornal Escolar</b><br><span class="mut">Plano Anual de Atividades, pauta de peças, edições, redação, calendário e avisos</span></span></label></div>`};
  bindAvisosDef=function(){const r=_ba.apply(this,arguments);const c=$('#mod-jn');if(c)c.onchange=()=>{jnAtivar(c.checked);toast(c.checked?'Módulo Jornal Escolar ativado':'Módulo Jornal Escolar desativado','ok')};return r}}
try{AJUDA.push({id:'jornal',ic:'news',t:'Jornal Escolar e Plano Anual de Atividades',gif:null,txt:`<p>O módulo <b>Jornal Escolar</b> (barra lateral) ajuda o responsável pelo jornal a não perder nenhuma atividade da escola.</p><ul><li><b>Importar PAA…</b> lê o documento Word do Plano Anual de Atividades: todas as tabelas (departamentos, clubes, equipas), com atividade, responsáveis e calendarização. As datas escritas por extenso são reconhecidas («12 a 16 de outubro», «8 e 12 de fevereiro», «Março/Abril», «2.º período», «Ao longo do ano letivo»). Pode importar de novo uma versão revista: as decisões e peças mantêm-se e as alterações de data ficam assinaladas.</li><li>Em cada atividade escolha <b>Cobrir</b> ou não: ao cobrir, é criada uma peça na pauta com prazo de entrega. Confirme as datas que no PAA só têm o mês ou o período.</li><li><b>Peças</b>: quadro por estado (ideia, atribuída, em escrita, em revisão, pronta, publicada) — arraste os cartões. <b>Edições</b>: data de fecho e de publicação, lista de verificação. <b>Redação</b>: alunos e professores da equipa.</li><li><b>Avisos</b>: decidir cobertura, atribuir repórter, hoje há atividade, pedir texto e fotos depois da atividade, confirmar datas, peças em atraso e fecho de edição. Os urgentes aparecem na janela de Avisos Urgentes; «Exportar .ics» põe tudo no Calendário do iPad/Mac com alarmes.</li><li>O módulo pode ser desativado em Definições › Geral › Módulos Opcionais.</li></ul>`})}catch(_){}

/* v0.63 · Demonstração do Jornal Escolar (só se o jornal deste ano ainda estiver vazio) */
function criarDemoJornal(){try{if(!jnOn())return;const {j,y}=JN();if(y.ativ.length||y.pecas.length||y.edicoes.length)return;const MN=JN_MESES.map(m=>m==='marco'?'março':m);
  const dia=n=>{const d=new Date();d.setDate(d.getDate()+n);while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+(n<0?-1:1));return d};const txt=d=>d.getDate()+' de '+MN[d.getMonth()];
  const ate=(a,b)=>{const x=dia(a),z=dia(b);return x.getMonth()===z.getMonth()?x.getDate()+' a '+z.getDate()+' de '+MN[x.getMonth()]:txt(x)+' a '+txt(z)};
  const L=[['Departamento de Línguas','Semana das Línguas Europeias','Atividades nas aulas e exposição no átrio.','Departamento de Línguas',ate(-40,-36)],
    ['Biblioteca Escolar','Feira do Livro','Venda e troca de livros; sessão com autor açoriano.','Equipa da Biblioteca',ate(-12,-8)],
    ['Desporto Escolar','Corta-Mato Escolar','Fase escola; apuramento para a fase de ilha.','Grupo de Educação Física',txt(dia(3))],
    ['Ciências Experimentais','Dia da Ciência — laboratórios abertos','Experiências demonstrativas para o 1.º ciclo.','Departamento de Ciências',txt(dia(6))],
    ['Cidadania','Assembleia de Delegados de Turma','Eleição da mesa e plano de ação.','Direção',txt(dia(10))],
    ['Ensino Profissional','Visita de estudo — Técnico de Turismo','Roteiro turístico da ilha com os formandos da TT 2.','Curso Profissional de Técnico de Turismo',txt(dia(15))],
    ['Expressões','Concerto de Natal','Coro e orquestra da escola no auditório.','Grupo de Música','Dezembro'],
    ['Biblioteca Escolar','Concurso Nacional de Leitura — fase escola','Provas escritas e orais.','Equipa da Biblioteca','2.º período'],
    ['Cidadania','Semana da Saúde Mental','Palestras e workshops com a psicóloga escolar.','SPO','Fevereiro'],
    ['Departamento de Línguas','Spelling Bee','Concurso de soletração em inglês (2.º e 3.º ciclos).','Departamento de Línguas','Março/Abril'],
    ['Direção','Dia do Patrono','Cerimónia, exposições e sessão solene.','Direção','3.º período'],
    ['Clubes','Clube de Robótica','Sessões semanais e participação em concursos.','Clube de Robótica','Ao longo do ano letivo']].map(([sec,titulo,det,resp,cal])=>({sec,titulo,det,resp,cal,rec:'',ind:'',obj:''}));
  jnImportar(L,'PAA (demonstração).docx');
  [['Ana Sofia Medeiros','Repórter','10.º A'],['Tomás Rocha Sousa','Fotógrafo/a','11.º B'],['Leonor Furtado','Revisor/a','12.º A'],['Duarte Câmara','Paginador/a','11.º C'],[S.cfg.professor||'Professor(a) responsável','Editor/a','']].forEach(([nome,funcao,turma])=>j.equipa.push({id:uid(),nome,funcao,turma,contacto:'',demo:true}));
  const E=j.equipa;const hj=isoData(new Date());
  const e1={id:uid(),num:'1',titulo:'Edição de outono',fecho:isoData(dia(-25)),pub:isoData(dia(-20)),estado:'publicada',check:JN_CHECK.map((_,k)=>k),notas:'',demo:true};
  const e2={id:uid(),num:'2',titulo:'Edição de Natal',fecho:isoData(dia(12)),pub:isoData(dia(18)),estado:'planeada',check:[0],notas:'Capa: Concerto de Natal.',demo:true};y.edicoes.push(e1,e2);
  const porT=t=>y.ativ.find(a=>a.titulo===t);
  ['Semana das Línguas Europeias','Feira do Livro','Corta-Mato Escolar','Dia da Ciência — laboratórios abertos','Visita de estudo — Técnico de Turismo','Concerto de Natal','Clube de Robótica'].forEach(t=>{const a=porT(t);if(a)jnCobrir(a,'cobrir')});
  const ig=porT('Assembleia de Delegados de Turma');if(ig)jnCobrir(ig,'ignorar');
  const est={'Semana das Línguas Europeias':['publicada',e1,0,1],'Feira do Livro':['revisao',e2,0,1],'Corta-Mato Escolar':['atribuida',e2,1,1],'Dia da Ciência — laboratórios abertos':['ideia',e2,0,null],'Visita de estudo — Técnico de Turismo':['atribuida',e2,0,1],'Concerto de Natal':['ideia',e2,null,null],'Clube de Robótica':['escrita',e2,0,1]};
  y.pecas.forEach(p=>{const a=y.ativ.find(x=>x.id===p.ativ);const s=a&&est[a.titulo];if(!s)return;p.estado=s[0];p.edicao=s[1].id;if(s[2]!=null)p.autor=E[s[2]].id;if(s[3]!=null)p.foto=E[s[3]].id;p.demo=true;if(a.titulo==='Feira do Livro'){p.tipo='Reportagem';p.prazo=isoData(dia(2))}if(a.titulo==='Clube de Robótica'){p.tipo='Entrevista';p.prazo=isoData(dia(-1))}});
  y.pecas.push({id:uid(),titulo:'Passatempo: palavras cruzadas de Natal',tipo:'Passatempo',estado:'escrita',ativ:'',prazo:isoData(dia(8)),autor:E[2].id,foto:'',edicao:e2.id,notas:'',criada:Date.now(),demo:true},
    {id:uid(),titulo:'Opinião: telemóveis nos intervalos',tipo:'Opinião',estado:'pronta',ativ:'',prazo:isoData(dia(5)),autor:E[0].id,foto:'',edicao:e2.id,notas:'',criada:Date.now(),demo:true});
  save()}catch(err){console.warn('demo jornal',err)}}
{const _cDj=criarDemo;criarDemo=function(){const n0=S.anos.length;const r=_cDj.apply(this,arguments);try{if(S.anos.length>n0){criarDemoJornal();saveNow()}}catch(err){console.warn(err)}return r}}

/* v0.63 · Perfis de animação: sem · minimalista · cheio */
const ANIM_P=[['sem','Sem Animações','Nada se mexe: ideal para apresentar, para quem prefere calma ou para poupar bateria.'],['min','Minimalista','Só transições curtas e discretas (fade) ao mudar de secção e ao abrir painéis.'],['cheio','Cheio de Animações','Entradas em cascata, números a contar, barras e gráficos a crescer, efeitos ao tocar, confetes nas conquistas e muito mais.']];
const animPerfil=()=>{const v=S.cfg.animPerfil;return v==='sem'||v==='min'||v==='cheio'?v:'cheio'};
function animAplicar(){const r=document.documentElement,p=animPerfil();['sem','min','cheio'].forEach(k=>r.classList.toggle('anim-'+k,k===p));
  /* «Sem» liga o modo de movimento reduzido (o mesmo da Acessibilidade); os outros respeitam a Acessibilidade */
  if(p==='sem')r.classList.add('a11y-rm');else{r.classList.remove('a11y-rm');try{_aA11(true)}catch(_){}}}
/* re-aplicar a acessibilidade sem perder o perfil «Sem» */
let _aA11=()=>{};{const _a1=aplicarA11yCfg;_aA11=function(){return _a1.apply(this,arguments)};aplicarA11yCfg=function(){const r=_a1.apply(this,arguments);try{if(animPerfil()==='sem')document.documentElement.classList.add('a11y-rm');['sem','min','cheio'].forEach(k=>document.documentElement.classList.toggle('anim-'+k,k===animPerfil()))}catch(_){}return r}}
{const _cn=contarNumeros;contarNumeros=function(){if(animPerfil()!=='cheio')return;return _cn.apply(this,arguments)}}
/* cascata de linhas, barras a crescer e linhas de gráficos a desenhar (perfil cheio) */
function animCheio(root){if(animPerfil()!=='cheio'||!animOK())return;root=root||$('#view');if(!root)return;
  root.querySelectorAll('table.lst tbody, .jn-l, .mral, .jn-eds').forEach(tb=>{[...tb.children].slice(0,28).forEach((tr,k)=>{tr.style.setProperty('--ai',k);tr.classList.add('an-row')})});
  root.querySelectorAll('svg path,svg polyline').forEach(p=>{const cs=getComputedStyle(p);if(cs.fill!=='none'&&p.getAttribute('fill')!=='none')return;if(cs.strokeDasharray&&cs.strokeDasharray!=='none')return;if(!p.getTotalLength)return;let L=0;try{L=p.getTotalLength()}catch(_){}if(L<40)return;p.style.setProperty('--al',L);p.classList.add('an-draw')})}
{const _gAn=go;go=function(){const r=_gAn.apply(this,arguments);try{requestAnimationFrame(()=>animCheio())}catch(_){}return r}}
/* confetes discretos nos toasts de sucesso */
function animConfetes(x,y){if(animPerfil()!=='cheio'||!animOK())return;const cores=['#f59e0b','#10b981','#3b82f6','#ef4444','#a855f7','#ec4899'];const box=document.createElement('div');box.className='an-conf';box.style.left=x+'px';box.style.top=y+'px';
  for(let k=0;k<18;k++){const i=document.createElement('i');const a=Math.random()*Math.PI*2,d=40+Math.random()*70;i.style.cssText=`--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-40}px;--r:${Math.random()*540-270}deg;background:${cores[k%cores.length]};animation-delay:${Math.random()*.08}s`;box.appendChild(i)}
  document.body.appendChild(box);setTimeout(()=>box.remove(),1100)}
{const _tA=toast;toast=function(msg,tipo){const r=_tA.apply(this,arguments);try{if(tipo==='ok'&&animPerfil()==='cheio'){const t=$('#toast');const b=t&&t.getBoundingClientRect();animConfetes(b&&b.width?b.left+b.width/2:innerWidth/2,b&&b.height?b.top:innerHeight-80)}}catch(_){}return r}}
/* cartão nas Definições › Aparência */
function cartaoAnim(){const p=animPerfil();const rm=document.documentElement.classList.contains('a11y-rm')&&p!=='sem';
  return `<div class="card" id="an-cfg"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('sparkle',18)} Animações</h2><span class="sp1"></span><span class="mut" style="font-size:13px">Só neste dispositivo</span></div>
  <div class="angrid" role="radiogroup" aria-label="Perfil de animação">${ANIM_P.map(([k,n,d],i)=>`<button type="button" role="radio" aria-checked="${p===k}" class="anopt ${p===k?'on':''}" data-anp="${k}"><span class="anprev anp-${k}" aria-hidden="true"><i></i><i></i><i></i></span><b>${i+1} · ${n}</b><small>${d}</small></button>`).join('')}</div>
  ${rm?`<p class="hint">${ic('info',13)} A Acessibilidade (ou o sistema) está a pedir para <b>reduzir o movimento</b> — essa escolha prevalece.</p>`:''}</div>`}
{const _vdA=vDefinicoes;vDefinicoes=function(){const r=_vdA.apply(this,arguments);try{if((UI.defTab||'geral')==='aparencia'&&!$('#an-cfg')){const c=$('#view .card');if(c){c.insertAdjacentHTML('beforebegin',cartaoAnim());$$('#an-cfg [data-anp]').forEach(b=>b.onclick=()=>{S.cfg.animPerfil=b.dataset.anp;save();animAplicar();go('definicoes');if(S.cfg.animPerfil==='cheio')toast('Animações: cheio','ok');else toast('Animações: '+(S.cfg.animPerfil==='sem'?'sem':'minimalista'))})}}}catch(e){console.warn(e)}return r}}
animAplicar();


/* v0.64 · Avisos Urgentes: os do Jornal Escolar numa secção à parte */
{const _avU=avisosUrgentes;avisosUrgentes=function(){const L=_avU.apply(this,arguments);return L.filter(x=>x.g!=='jornal').concat(L.filter(x=>x.g==='jornal'))}}
{const _maJ=mostrarAvisos;mostrarAvisos=function(){const r=_maJ.apply(this,arguments);try{const o=$('#avpop');if(o&&!o.dataset.jg){o.dataset.jg=1;const L=avisosUrgentes();const its=[...o.querySelectorAll('.avl>.avit')];const nJ=L.filter(x=>x.g==='jornal').length;if(nJ&&its.length===L.length){const lst=o.querySelector('.avl');const nG=L.length-nJ;
    if(nG)lst.insertAdjacentHTML('afterbegin',`<div class="avgh">${ic('bell',13)} Gerais <span>${nG}</span></div>`);const first=its[L.findIndex(x=>x.g==='jornal')];first.insertAdjacentHTML('beforebegin',`<div class="avgh avgj">${ic('news',13)} ${esc((JN().cfg.nome)||'Jornal Escolar')} <span>${nJ}</span><button type="button" class="btn sm" data-avjn>${ic('folder',13)} Abrir o Jornal</button></div>`);
    its.forEach((el,i)=>{if(L[i].g==='jornal')el.classList.add('avj')});const sp=o.querySelector('.avh>div>span');if(sp)sp.textContent=L.length+' aviso'+(L.length>1?'s':'')+' a precisar de atenção'+(nG?' · '+nJ+' do Jornal Escolar':'');
    const b=o.querySelector('[data-avjn]');if(b)b.onclick=()=>{o.remove();UI.jnTab='painel';go('jornal')}}}}catch(e){console.warn(e)}return r}}

/* v0.64 · estilo iOS 27 (Liquid Glass) com o controlo «Transparente ↔ Com cor» */
ESTILOS_X.push(['ios27','iOS 27','sparkle','Inspirado no iOS 27: Liquid Glass, barra lateral até à margem, botões em cápsula e controlos segmentados']);
function iosVidro(){const v=S.cfg.iosVidro;const n=v==null?55:Math.max(0,Math.min(100,+v));document.documentElement.style.setProperty('--lg-a',String(Math.round((.28+n/100*.66)*100)/100));return n}
{const _apI=aplicarPrefs;aplicarPrefs=function(){const r=_apI.apply(this,arguments);try{iosVidro();const m=document.querySelector('meta[name=theme-color]');if(m&&S.cfg.estilo==='ios27')m.setAttribute('content',document.body.classList.contains('escurox')?'#000000':'#f2f2f7')}catch(_){}return r}}
{const _vdI=vDefinicoes;vDefinicoes=function(){const r=_vdI.apply(this,arguments);try{if((UI.defTab||'geral')==='aparencia'&&S.cfg.estilo==='ios27'&&!$('#ios-gl')){const sg=$('#ap-est');const pr=sg&&sg.closest('.pref');if(pr){const n=iosVidro();pr.insertAdjacentHTML('afterend',`<div class="pref" id="ios-gl"><b>Liquid Glass</b><div class="iosgl"><small>Transparente</small><input type="range" min="0" max="100" step="1" value="${n}" id="ios-r" aria-label="Transparência do vidro"><small>Com cor</small><span class="iosprev" aria-hidden="true"><i></i></span></div></div>`);const rg=$('#ios-r');rg.oninput=()=>{S.cfg.iosVidro=+rg.value;iosVidro()};rg.onchange=()=>save()}}}catch(e){console.warn(e)}return r}}
try{aplicarPrefs()}catch(_){}

/* ===================== v0.66 · Segurança: bloqueio por tentativas, Argon2id, perfis de acesso às turmas ===================== */
/* ---- 1. bloqueio após tentativas falhadas (persistente no dispositivo; também para o código de acesso) ---- */
const SEG_LIM=5,SEG_MIN=15,SEG_K='edugest.bloqueios';
const segLer=()=>{try{return JSON.parse(localStorage.getItem(SEG_K)||'{}')||{}}catch(_){return {}}};
const segGravar=o=>{try{localStorage.setItem(SEG_K,JSON.stringify(o))}catch(_){}};
function segBloq(k){const e=segLer()[k];return e&&e.ate>Date.now()?e.ate:0}
function segFalha(k){const o=segLer();const e=o[k]||{n:0,ate:0};if(e.ate&&Date.now()>=e.ate){e.ate=0;e.n=0}e.n=(e.n||0)+1;e.ult=Date.now();let bloq=false;if(e.n>=SEG_LIM){e.ate=Date.now()+SEG_MIN*60000;e.n=0;e.vezes=(e.vezes||0)+1;bloq=true}o[k]=e;segGravar(o);return {resta:bloq?0:SEG_LIM-e.n,bloq}}
function segOk(k){const o=segLer();if(o[k]){delete o[k];segGravar(o)}}
const segTempo=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
/* mostra a contagem e desativa o formulário enquanto durar o bloqueio */
function segMostrar(box,errSel,btnSel,k,depois){const ate=segBloq(k);if(!ate)return false;const err=box.querySelector(errSel),btn=btnSel?box.querySelector(btnSel):null;if(btn)btn.disabled=true;box.classList.add('seg-bloq');
  const tick=()=>{const r=ate-Date.now();if(r<=0||!document.body.contains(box)){clearInterval(iv);if(btn)btn.disabled=false;box.classList.remove('seg-bloq');if(err&&r<=0)err.textContent='Pode tentar de novo.';depois&&depois();return}if(err)err.innerHTML=ic('shield',14)+' Demasiadas tentativas falhadas. Por segurança, aguarde <b>'+segTempo(r)+'</b> para tentar de novo.'};
  const iv=setInterval(tick,1000);tick();return true}

/* ---- 2. palavras-passe com Argon2id (sal aleatório); PBKDF2-SHA-256 600 000 iterações se o WebAssembly faltar ---- */
const segHex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const segUnhex=h=>new Uint8Array((h.match(/../g)||[]).map(x=>parseInt(x,16)));
async function hashSenha(p){const salt=crypto.getRandomValues(new Uint8Array(16));
  try{if(window.hashwasm&&hashwasm.argon2id){const enc=await hashwasm.argon2id({password:p,salt,parallelism:1,iterations:2,memorySize:19456,hashLength:32,outputType:'encoded'});return 'a2:'+enc}}catch(e){console.warn('argon2',e)}
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(p),'PBKDF2',false,['deriveBits']);const b=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},k,256);return 'p3:'+segHex(salt)+':'+segHex(b)}
async function verificarSenha(h,p){h=String(h||'');try{
  if(h.startsWith('a2:'))return !!(window.hashwasm&&await hashwasm.argon2Verify({password:p,hash:h.slice(3)}));
  if(h.startsWith('p3:')){const [,sh,hh]=h.split(':');const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(p),'PBKDF2',false,['deriveBits']);const b=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:segUnhex(sh),iterations:600000},k,256);const x=segHex(b);let d=0;for(let i=0;i<Math.max(x.length,hh.length);i++)d|=(x.charCodeAt(i)||0)^(hh.charCodeAt(i)||0);return d===0}
  }catch(e){console.warn(e)}return false}
const senhaForte=h=>/^(a2|p3):/.test(String(h||''));
/* contas: aceita os formatos antigos e converte para Argon2id no primeiro início de sessão */
verificarPasse=async function(c,u,p){try{let ok=false;if(senhaForte(c.h))ok=await verificarSenha(c.h,p);else if(String(c.h||'').startsWith('p2:'))ok=(await hashLogin2(u,p))===c.h;else ok=(await hashLogin(u,p))===c.h;
  if(ok&&!senhaForte(c.h)){try{c.h=await hashSenha(p);c.hEm=Date.now();saveNow();audit('Segurança','Palavra-passe convertida para Argon2id',u)}catch(_){}}return ok}catch(_){return false}};


/* ---- 3. perfis de acesso: o professor só vê e edita as suas turmas; direção vê tudo; administrador vê e edita tudo ---- */
PERMS.push(['verTodas','Ver as turmas de todos os professores'],['editarTodas','Editar as turmas de outros professores']);
{const _pf=perfis;perfis=function(){const P=_pf.apply(this,arguments);try{
  if(!P.some(p=>p.id==='direcao')){const b=P.find(p=>p.id==='professor')||{perm:{}};P.push({id:'direcao',nome:'Direção',sist:true,perm:{...b.perm,verTodas:true,editarTodas:false,escola:true}})}
  P.forEach(p=>{p.perm=p.perm||{};if(p.id==='admin'){p.perm.verTodas=true;p.perm.editarTodas=true}else if(!p.acV){p.perm.verTodas=p.id==='direcao';p.perm.editarTodas=false;p.acV=1}})}catch(_){}return P}}
const acessoUser=()=>SESSAO&&SESSAO.u||null;
function acessoRestrito(){if(!SESSAO)return false;let p;try{p=perfilAtual()}catch(_){return false}return !!p&&p.id!=='admin'&&!(p.perm&&p.perm.verTodas)}
const turmaMinha=t=>{const u=acessoUser();return !!u&&!!t&&Array.isArray(t.donos)&&t.donos.includes(u)};
const turmaVisivel=t=>!acessoRestrito()||turmaMinha(t);
function turmaEditavel(t){if(!SESSAO||!t)return true;let p;try{p=perfilAtual()}catch(_){return true}return p.id==='admin'||!!(p.perm&&p.perm.editarTodas)||turmaMinha(t)}
const turmaDonos=t=>(t&&t.donos||[]).map(u=>{const c=((S.cfg.auth||{}).contas||[]).find(x=>x.u===u);return c?(c.nome||c.u):u});
/* cada ano letivo mostra só as turmas visíveis; o que se guarda (e sincroniza) continua completo */
function acessoLigar(a){if(!a||typeof a!=='object'||a.__ac)return a;let real=Array.isArray(a.turmas)?a.turmas:[];delete a.turmas;
  const vista=()=>{const F=real.filter(turmaVisivel);return new Proxy(F,{get(arr,k){
      if(k==='push'||k==='unshift')return (...xs)=>{xs.forEach(acessoCarimbar);real[k](...xs);return arr[k](...xs)};
      if(k==='splice')return (i,n,...xs)=>{const rem=arr.splice(i,n==null?arr.length:n,...xs);rem.forEach(t=>{const j=real.indexOf(t);if(j>=0)real.splice(j,1)});xs.forEach(acessoCarimbar);real.push(...xs);return rem};
      if(k==='__real')return real;return Reflect.get(arr,k)}})};
  Object.defineProperty(a,'__ac',{value:true,enumerable:false});
  Object.defineProperty(a,'turmas',{enumerable:true,configurable:true,get(){return acessoRestrito()?vista():real},set(v){const nv=(v&&v.__real)||v||[];if(acessoRestrito()){const oc=real.filter(t=>!turmaVisivel(t));real=oc.concat(Array.from(nv).filter(t=>!oc.includes(t)))}else real=Array.from(nv);real.forEach(acessoCarimbar)}});
  Object.defineProperty(a,'toJSON',{enumerable:false,configurable:true,value(){const o={};Object.keys(this).forEach(k=>{o[k]=k==='turmas'?real:this[k]});return o}});return a}
function acessoCarimbar(t){if(t&&typeof t==='object'&&t.donos===undefined){const u=acessoUser();t.donos=u?[u]:[]}}
function acessoTodos(){(S.anos||[]).forEach(acessoLigar)}
/* migração: as turmas que já existiam continuam visíveis para as contas que já as viam */
function acessoMigrar(){if(S.cfg.acessoMig)return;const C=((S.cfg.auth||{}).contas||[]).filter(c=>c.papel!=='admin').map(c=>c.u);(S.anos||[]).forEach(a=>{const L=(a.turmas&&a.turmas.__real)||a.turmas||[];L.forEach(t=>{if(t.donos===undefined)t.donos=C.slice()})});S.cfg.acessoMig=1}
{const _pA=prepAno;prepAno=function(a){return acessoLigar(_pA.apply(this,arguments))}}
{const _gAc=go;go=function(){try{acessoTodos();acessoMigrar();const t=S.turmaAtiva&&A()&&(A().turmas.__real||A().turmas).find(x=>x.id===S.turmaAtiva);if(t&&!turmaVisivel(t)){const v=(A().turmas||[])[0];S.turmaAtiva=v?v.id:null}}catch(e){console.warn(e)}const r=_gAc.apply(this,arguments);try{acessoSoLeitura()}catch(_){}return r}}
{const _svAc=saveNow;saveNow=function(){try{acessoTodos();(S.anos||[]).forEach(a=>{const L=(a.turmas&&a.turmas.__real)||a.turmas||[];L.forEach(acessoCarimbar)})}catch(_){}return _svAc.apply(this,arguments)}}
/* turma de outro professor sem permissão de edição: só leitura */
function acessoSoLeitura(){const t=T();const v=$('#view');if(!v)return;const ro=!!t&&NEEDS_T.includes(VIEW)&&!turmaEditavel(t);document.body.classList.toggle('so-leitura',ro);if(!ro)return;
  if(!v.querySelector('.ro-ban'))v.insertAdjacentHTML('afterbegin',`<div class="alert ro-ban">${ic('shield',15)} <b>Só leitura</b> — turma de ${esc(turmaDonos(t).join(', ')||'outro professor')}. O seu perfil (${esc(perfilAtual().nome)}) pode ver, mas não alterar.</div>`);
  v.querySelectorAll('input,select,textarea,[contenteditable=true]').forEach(e=>{if(e.closest('.tabs,.seg,.modbar,.dseg,[role=search]'))return;if(e.isContentEditable)e.contentEditable='false';else e.disabled=true});
  $$('#barx .btn,#view .btn').forEach(b=>{if(/apagar|novo|nova|importar|lançar|juntar|guardar|editar|remover|limpar|distribuir|confirmar|marcar/i.test(b.textContent)&&!/exportar|imprimir|pdf|csv/i.test(b.textContent)){b.disabled=true;b.title='Só leitura'}})}
/* contas: escolher as turmas de cada professor */
function acessoTurmasDlg(c){const L=[];(S.anos||[]).forEach(a=>{acessoLigar(a);((a.turmas&&a.turmas.__real)||a.turmas).forEach(t=>L.push({a,t}))});
  openDrawer('Turmas de '+(c.nome||c.u),`<div class="ed"><p class="hint" style="margin-top:0">Marque as turmas que <b>${esc(c.nome||c.u)}</b> pode ver e editar. Quem tem o perfil Administrador (ou um perfil com «Ver as turmas de todos os professores») vê todas.</p>
   ${L.length?S.anos.map(a=>{const T_=L.filter(x=>x.a===a);if(!T_.length)return '';return `<h3 style="margin:12px 0 6px">${esc(a.nome)}</h3>${T_.map(({t})=>`<label class="chk acl"><input type="checkbox" data-act="${t.id}" ${(t.donos||[]).includes(c.u)?'checked':''}> <b>${esc(t.nome)}</b> · ${esc(t.disciplina)} <span class="mut">${esc(turmaDonos(t).filter(n=>n!==(c.nome||c.u)).join(', '))}</span></label>`).join('')}`}).join(''):'<p class="mut">Ainda não há turmas.</p>'}
   <div class="row" style="margin-top:14px;gap:8px"><button class="btn sm" id="ac-all">Todas</button><button class="btn sm" id="ac-none">Nenhuma</button><span class="sp1"></span><button class="btn pri" id="ac-ok">${ic('check',14)} Guardar</button></div></div>`);
  $('#ac-all').onclick=()=>$$('#dw-b [data-act]').forEach(x=>x.checked=true);$('#ac-none').onclick=()=>$$('#dw-b [data-act]').forEach(x=>x.checked=false);
  $('#ac-ok').onclick=()=>{let n=0;$$('#dw-b [data-act]').forEach(x=>{const o=L.find(z=>z.t.id===x.dataset.act);if(!o)return;const d=o.t.donos=Array.isArray(o.t.donos)?o.t.donos:[];const tem=d.includes(c.u);if(x.checked&&!tem){d.push(c.u);n++}else if(!x.checked&&tem){d.splice(d.indexOf(c.u),1);n++}});saveNow();audit('Segurança','Turmas atribuídas',c.u+' · '+n+' alteração(ões)');closeDrawer();toast('Turmas de '+(c.nome||c.u)+' guardadas','ok');vDefinicoes()}}
{const _vdAc=vDefinicoes;vDefinicoes=function(){const r=_vdAc.apply(this,arguments);try{if(UI.defTab==='conta'&&pode('contas')){const C=(S.cfg.auth||{}).contas||[];$$('#view [data-ctp]').forEach(b=>{const c=C[+b.dataset.ctp];if(!c||b.parentElement.querySelector('[data-cttur]'))return;let n=0;(S.anos||[]).forEach(a=>{acessoLigar(a);((a.turmas&&a.turmas.__real)||a.turmas).forEach(t=>{if((t.donos||[]).includes(c.u))n++})});const P=perfis().find(p=>p.id===(c.papel||'professor'));const todas=P&&(P.id==='admin'||P.perm.verTodas);
      b.insertAdjacentHTML('afterend',`<button class="btn sm" data-cttur="${b.dataset.ctp}" title="Turmas que pode ver e editar">${ic('users',14)} ${todas?'Todas as turmas':'Turmas ('+n+')'}</button>`)});
    $$('#view [data-cttur]').forEach(b=>b.onclick=()=>acessoTurmasDlg(C[+b.dataset.cttur]))}
   const h=$('#view .card .hint');$$('#view .hint').forEach(p=>{if(/cifrada \(SHA-256\)/.test(p.textContent))p.textContent=p.textContent.replace('cifrada (SHA-256)','com Argon2id')})}catch(e){console.warn(e)}return r}}


/* cópia feita por um professor com acesso restrito: só as suas turmas, sem as contas dos outros */
function acessoCopiaFiltrada(st){const o=JSON.parse(JSON.stringify(st));const u=acessoUser();(o.anos||[]).forEach(a=>{a.turmas=(a.turmas||[]).filter(t=>(t.donos||[]).includes(u))});if(o.cfg&&o.cfg.auth){o.cfg=Object.assign({},o.cfg);o.cfg.auth={...o.cfg.auth,contas:(o.cfg.auth.contas||[]).filter(c=>c.u===u)}}return o}

