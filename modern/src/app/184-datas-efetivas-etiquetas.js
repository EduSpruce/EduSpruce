/* ---------- datas efetivas e etiquetas ---------- */
const jnDatasEf=a=>a.conf?[{ini:a.conf,fim:a.confFim&&a.confFim>=a.conf?a.confFim:a.conf}]:(a.datas||[]);
const jnPrecEf=a=>a.conf?'dia':(a.prec||'indef');
const jnIni=a=>{const d=jnDatasEf(a)[0];return d?d.ini:''};
const jnHora=a=>a.conf?(a.confHora||''):(a.hora||'');
function jnLblD(D,prec){if(!D||!D.length)return 'A definir';const d=D[0],a=dataDeIso(d.ini),b=dataDeIso(d.fim);
  if(prec==='anual')return 'Todo o ano';
  if(prec==='periodo'){const P=jnPeriodos(jnAnoIni());const i=P.find(p=>p.ini===d.ini),f=P.find(p=>p.fim===d.fim);if(i&&f)return (i.n===f.n?i.n+'.º período':i.n+'.º–'+f.n+'.º per.')+(D.length>1?' +'+(D.length-1):'');const q=P.find(p=>d.fim===p.fim);return q?'Fim do '+q.n+'.º P':'Período'}
  if(prec==='mes')return a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear()?JN_MN[a.getMonth()]:JN_MC[a.getMonth()]+'–'+JN_MC[b.getMonth()];
  let s=d.ini===d.fim?a.getDate()+' '+JN_MC[a.getMonth()]:a.getMonth()===b.getMonth()?a.getDate()+'–'+b.getDate()+' '+JN_MC[a.getMonth()]:a.getDate()+' '+JN_MC[a.getMonth()]+'–'+b.getDate()+' '+JN_MC[b.getMonth()];
  if(D.length>1)s+=' +'+(D.length-1);return s}
const jnLbl=a=>jnLblD(jnDatasEf(a),jnPrecEf(a));
const jnPecaDe=a=>JN().y.pecas.find(p=>p.ativ===a.id);
const jnEst=k=>JN_EST.find(e=>e[0]===k)||JN_EST[0];
const jnMembro=id=>JN().j.equipa.find(m=>m.id===id);
const jnNomeM=id=>{const m=jnMembro(id);return m?m.nome:(id||'')};
const jnFeita=p=>p.estado==='pronta'||p.estado==='publicada';
function jnCobrir(a,dec){const {y,cfg}=JN();a.dec=a.dec===dec?null:dec;
  if(a.dec==='cobrir'&&!jnPecaDe(a)){const D=jnDatasEf(a);const fim=D.length?D[D.length-1].fim:'';
    y.pecas.push({id:uid(),titulo:a.titulo,tipo:'Notícia',estado:'ideia',ativ:a.id,prazo:fim&&jnPrecEf(a)==='dia'?jnAdd(fim,cfg.diasEntrega):'',autor:'',foto:'',edicao:jnEdicaoPara(fim),notas:'',criada:Date.now()})}
  save();audit('Jornal',a.dec==='cobrir'?'Atividade a cobrir':a.dec==='ignorar'?'Atividade ignorada':'Decisão anulada',a.titulo)}
function jnEdicaoPara(iso){const {y}=JN();return ((iso?y.edicoes.filter(e=>e.estado!=='publicada'&&e.fecho&&e.fecho>=iso):y.edicoes.filter(e=>e.estado!=='publicada')).sort((a,b)=>(a.fecho||'9').localeCompare(b.fecho||'9'))[0]||{}).id||''}

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
function vJornal(){if(!jnOn()){$('#view').innerHTML=`<div class="card empty">${ic('news',30)}<br><b>O módulo Jornal Escolar está desativado</b><br><span class="mut">Pode ativá-lo em Definições › Módulos Opcionais. Os dados guardados mantêm-se.</span><br><br><button class="btn pri" id="jn-on">Ativar o Módulo</button></div>`;$('#jn-on').onclick=()=>{jnAtivar(true);go('jornal')};return}
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
    ${(()=>{const P=y.paa;return P?`<p class="hint" style="margin:8px 0 0">${ic('file',13)} ${esc(P.ficheiro)} · importado ${esc(new Date(P.em).toLocaleDateString('pt-PT'))} · ${P.n} atividades. Toque numa atividade para confirmar a data, ver os responsáveis e recursos. <button type="button" class="lnk" id="jn-paadel" style="color:var(--bad)">${ic('trash',13)} Apagar PAA</button></p>`:''})()}
    ${G.length?G.map(g=>{const X=L.filter(a=>grupo(a)===g).sort((a,b)=>jnIni(a).localeCompare(jnIni(b))||a.titulo.localeCompare(b.titulo));return `<h3 class="jn-gh">${gl(g)} <span class="mut">${X.length}</span></h3><div class="jn-l">${X.map(a=>jnLinhaA(a)).join('')}</div>`}).join(''):`<div class="empty">Nenhuma atividade com estes filtros.</div>`}</div>`;
  $$('[data-jf]').forEach(b=>b.onclick=()=>{UI.jnF=b.dataset.jf;jnPAA()});$('#jn-sec').onchange=e=>{UI.jnSec=e.target.value;jnPAA()};$('#jn-fut').onchange=e=>{UI.jnFut=e.target.checked;jnPAA()};
  $('#jn-q').oninput=e=>{UI.jnQ=e.target.value;clearTimeout(jnPAA._t);jnPAA._t=setTimeout(()=>{jnPAA();const i=$('#jn-q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)};const pd=$('#jn-paadel');if(pd)pd.onclick=()=>{const P=y.paa;const A=y.ativ.filter(a=>a.orig==='paa');if(!confirm(`Apagar o PAA «${P.ficheiro}» e as ${A.length} atividades importadas?\n\nAs atividades criadas à mão e as peças ficam (as peças deixam de estar ligadas ao PAA). Pode voltar a importar o PAA depois.`))return;const ids=new Set(A.map(a=>a.id));y.ativ=y.ativ.filter(a=>!ids.has(a.id));(y.pecas||[]).forEach(p=>{if(p.ativ&&ids.has(p.ativ))p.ativ=null});y.paa=null;saveNow();audit('Jornal','PAA apagado',P.ficheiro+' · '+A.length+' atividades');toast('PAA apagado.');jnPAA()};
  jnBindComuns()}
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

