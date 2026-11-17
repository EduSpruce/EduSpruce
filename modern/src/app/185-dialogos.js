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

