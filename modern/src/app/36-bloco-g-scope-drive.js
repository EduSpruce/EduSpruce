/* =====================================================================
   v0.82 · Sincronização sem esforço com a conta Google
   — «Entrar com Google» já autoriza o Drive (pasta privada da app)
   — 1.ª vez: assistente em 3 passos; noutro aparelho: só a palavra-passe (o gestor de palavras-passe preenche)
   — sincroniza a cada minuto, 6 s depois de cada alteração, ao voltar à app; renova a ligação Google num toque qualquer
   ===================================================================== */
const G_SCOPE_DRIVE='https://www.googleapis.com/auth/drive.appdata';
let _gLoginTok=null;
/* o início de sessão Google passa a pedir também o Drive e guarda a ligação para a sincronização */
{const _gl=gLogin;gLogin=async function(A_){const id=gLoginId(A_);if(!id||!/^https:/.test(location.protocol))return _gl.apply(this,arguments);
  const scope='openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile '+G_SCOPE_DRIVE;
  if(nvUsarRedirect()){const state='nvglR'+Math.random().toString(36).slice(2);try{localStorage.setItem(NV_AUTH,JSON.stringify({p:'gl',state,q:Date.now(),manter:!!($('#lg-m')&&$('#lg-m').checked)}))}catch(_){}
    location.href='https://accounts.google.com/o/oauth2/v2/auth?'+new URLSearchParams({client_id:id,redirect_uri:nvRedirect(),response_type:'token',scope,state,prompt:'select_account',include_granted_scopes:'true'});return new Promise(()=>{})}
  await gsCarregar();const r=await new Promise((ok,ko)=>{const cli=google.accounts.oauth2.initTokenClient({client_id:id,scope,include_granted_scopes:true,callback:x=>x&&x.access_token?ok(x):ko(new Error((x&&x.error)||'Sem autorização')),error_callback:e=>ko(new Error(e&&e.type==='popup_closed'?'Janela da Google fechada':'Não foi possível obter autorização da Google'))});cli.requestAccessToken({prompt:'select_account'})});
  const sess=await gSessaoDe(r.access_token,A_);_gLoginTok={t:r.access_token,exp:r.expires_in,sc:r.scope||'',email:sess.u};gLigarDrive();return sess}}
function gLigarDrive(){const g=_gLoginTok;if(!g)return;try{gsCfg().email=g.email;save()}catch(_){}
  if(/drive\.appdata/.test(g.sc)){nvGGuardar(g.t,g.exp,g.sc);const L=nvL();if(!L.prov||L.prov==='google'){if(L.prov!=='google')nvSet({prov:'google',base:null,mod:{}});nvSet({gEsc:0,renovar:false})}}}
/* --- assistente --- */
function nvAssistFechar(d){try{d.close()}catch(_){}d.remove()}
async function nvAssist(forcar){const L=nvL();const s=SESSAO||{};if(!forcar){if(s.tipo!=='google'||L.prov!=='google'||L.k)return;try{if(sessionStorage.getItem('es.assist'))return}catch(_){}}
  if($('dialog.nvas'))return;const email=gsCfg().email||s.u||'';
  const d=document.createElement('dialog');d.className='nvas';d.setAttribute('aria-labelledby','nvas-t');document.body.appendChild(d);
  const passo=(n,est,t,txt)=>`<li class="nvasp ${est}"><span class="nvasn">${est==='ok'?ic('check',15):n}</span><div><b>${t}</b>${txt?`<div class="nvast">${txt}</div>`:''}</div></li>`;
  const desenhar=(fase,info)=>{info=info||{};const temDrive=!!nvGTok();
    const p1=passo(1,temDrive?'ok':'on','Conta Google ligada',temDrive?esc(email):`Falta autorizar o Google Drive (a pasta privada da app).<div style="margin-top:8px"><button type="button" class="btn pri" id="nvas-aut">${ic('cloud',15)} Autorizar Google Drive</button></div>`);
    let p2='';if(fase==='pw'){p2=passo(2,'on',info.existe?'Escreva a sua palavra-passe de encriptação':'Crie um código de encriptação',
      `<form id="nvas-f" autocomplete="on" action="#"><input type="text" name="username" autocomplete="username" value="${esc(email)}" hidden readonly>
      ${info.existe?`<p class="nvasi">Já tem dados da EduSpruce na sua conta. Escreva a mesma palavra-passe que definiu no outro aparelho — o gestor de palavras-passe do iPhone/iPad/Chrome pode preenchê-la sozinho.</p><input type="password" id="nvas-p1" name="password" autocomplete="current-password" placeholder="Palavra-passe de encriptação" required>`
      :`<p class="nvasi">Protege os dados dos alunos: tudo é encriptado <b>neste aparelho</b> antes de ir para o Drive. Guarde-a quando o navegador perguntar — assim, nos outros aparelhos, é preenchida sozinha.</p><input type="password" id="nvas-p1" name="new-password" autocomplete="new-password" placeholder="Novo código (mín. 8 algarismos)" required><input type="password" id="nvas-p2" autocomplete="new-password" placeholder="Repetir">`}
      <div class="nverr" id="nvas-e" role="alert"></div><button type="submit" class="btn pri" id="nvas-ok">${ic('shield',15)} ${info.existe?'Abrir os Meus Dados':'Guardar e Sincronizar'}</button></form>`)}
    else p2=passo(2,fase==='fim'||fase==='sync'?'ok':'',info.existe?'Palavra-passe de encriptação':'Palavra-passe de encriptação','');
    const p3=passo(3,fase==='fim'?'ok':fase==='sync'?'on':'',fase==='fim'?'Tudo sincronizado':'Sincronizar',fase==='sync'?`<span class="nvassp">${ic('refresh',14)}</span> A sincronizar com o Google Drive…`:fase==='fim'?(info.txt||'Pronto.')+'<br>A partir de agora sincroniza sozinha: a cada minuto, logo a seguir a cada alteração e ao voltar à app. Noutro computador, iPad ou iPhone basta «Entrar com Google» e escrever a mesma palavra-passe.':'');
    d.innerHTML=`<div class="nvasw"><header><span class="nvasl">${EF_LOGO}</span><div><h2 id="nvas-t">${fase==='fim'?'Está tudo pronto':'Sincronizar os seus dados'}</h2><p>Os mesmos dados no computador, no iPad e no iPhone — encriptados.</p></div></header><ol class="nvasl2">${p1}${p2}${p3}</ol>
      <footer>${fase==='fim'?`<button type="button" class="btn pri" id="nvas-fim" data-dec="1">Começar</button>`:`<button type="button" class="btn" id="nvas-no" data-dec="1">Agora Não</button>`}</footer></div>`;
    const no=d.querySelector('#nvas-no');if(no)no.onclick=e=>{e.preventDefault();try{sessionStorage.setItem('es.assist','1')}catch(_){}nvAssistFechar(d);toast('Pode ativar mais tarde no ícone da nuvem ou em Definições › Segurança','info')};
    const fi=d.querySelector('#nvas-fim');if(fi)fi.onclick=e=>{e.preventDefault();nvAssistFechar(d);go(VIEW||'inicio')};
    const au=d.querySelector('#nvas-aut');if(au)au.onclick=async()=>{try{await gsToken(true);arrancar()}catch(e){toast(e.message,'erro')}};
    const f=d.querySelector('#nvas-f');if(f){const p1=f.querySelector('#nvas-p1');setTimeout(()=>p1&&p1.focus(),80);
      f.onsubmit=e=>{e.preventDefault();return false};f.querySelector('#nvas-ok').onclick=async ev=>{ev.preventDefault();const a=p1.value,b=(f.querySelector('#nvas-p2')||{}).value;const er=f.querySelector('#nvas-e');er.textContent='';
        {const _e=nvPinErro(a,'nvas-p1',!info.existe);if(_e)return er.textContent=_e}if(!info.existe&&a!==b)return er.textContent='As palavras-passe não coincidem.';
        const bt=f.querySelector('#nvas-ok');bt.disabled=true;try{await nvDefinirPalavra(a);
          /* deixa o gestor de palavras-passe guardar */try{if(window.PasswordCredential&&navigator.credentials&&navigator.credentials.store)await navigator.credentials.store(new PasswordCredential({id:email||'eduspruce',password:a,name:'EduSpruce — encriptação'}))}catch(_){}
          desenhar('sync',info);const r=await nvSincronizar(true);if(!r){desenhar('pw',info);const e2=d.querySelector('#nvas-e');const m=nvL().erro||'Não foi possível sincronizar.';if(e2){if(/Não foi possível contactar|Failed to fetch|Load failed/i.test(m))e2.innerHTML=nvAjudaBloq();else e2.textContent=m}return}
          const n=S.anos.reduce((k,a)=>k+a.turmas.length,0);desenhar('fim',{...info,txt:info.existe?`Recebidos os seus dados (${n} turma${n===1?'':'s'}).`:`Os seus dados foram encriptados e guardados no Google Drive.`});try{aplicarPrefs()}catch(_){}}
        catch(e){bt.disabled=false;if(/Não foi possível contactar|Failed to fetch|Load failed/i.test(e.message))er.innerHTML=nvAjudaBloq();else er.textContent=e.message}}}};
  const arrancar=async()=>{if(!nvGTok()){desenhar('aut');return}desenhar('pw',{existe:false});try{const m=await PROV.google.ler(NV_PREF+'manifest.json');desenhar('pw',{existe:!!m})}catch(e){desenhar('pw',{existe:false});const er=d.querySelector('#nvas-e');if(er)er.textContent=e.message}};
  try{d.showModal()}catch(_){d.setAttribute('open','')}arrancar()}
{const _plA=pedirLogin;pedirLogin=function(){const p=_plA.apply(this,arguments);Promise.resolve(p).then(s=>{setTimeout(()=>{try{const L=nvL();if((SESSAO||{}).tipo==='google'&&L.prov==='google'&&!L.k){/* o assistente tem prioridade sobre os «Primeiros passos» */try{sessionStorage.setItem('ef.ppm','1')}catch(_){}$$('dialog.ppm').forEach(d=>{try{d.close()}catch(_){}d.remove()});if(!$('dialog[open]:not(.nvas)'))nvAssist()}}catch(e){console.warn(e)}},1200)});return p}}
/* o ícone da nuvem, sem palavra-passe definida, abre o assistente */
{const _nb=nvBadge;nvBadge=function(){_nb.apply(this,arguments);const b=$('#nv-badge');if(b&&!b.dataset.as){b.dataset.as=1;b.addEventListener('click',e=>{const L=nvL();if(L.prov==='google'&&!L.k){e.stopImmediatePropagation();e.preventDefault();nvAssist(true)}},true)}}}
/* --- ritmo da sincronização: 6 s depois de alterar, a cada 60 s com a app aberta, ao voltar à app --- */
{const _svR=saveNow;saveNow=function(){const r=_svR.apply(this,arguments);try{const L=nvL();if(L.prov&&_nvK&&L.auto!==false){clearTimeout(_nvT);_nvT=setTimeout(()=>nvSincronizar(false),250)}}catch(_){}return r}}
setInterval(()=>{try{const L=nvL();if(L.prov&&_nvK&&L.auto!==false&&!document.hidden&&navigator.onLine&&!L.renovar)nvSincronizar(false)}catch(_){}},10*1000);
addEventListener('focus',()=>{try{const L=nvL();if(L.prov&&_nvK&&L.auto!==false&&!L.renovar&&(!L.ultimo||Date.now()-L.ultimo>20000))nvSincronizar(false)}catch(_){}});
/* --- Google: renovar a ligação (1 h) aproveitando um toque qualquer no computador, sem perguntar nada --- */
let _gRenT=0;
document.addEventListener('pointerdown',()=>{try{const L=nvL();if(L.prov!=='google'||!_nvK||nvUsarRedirect())return;const g=L.g;const falta=!g||!g.exp||g.exp-Date.now()<5*60*1000;if(!falta||Date.now()-_gRenT<60000)return;_gRenT=Date.now();
  const id=nvGId();if(!id||!(window.google&&google.accounts&&google.accounts.oauth2))return;const cli=google.accounts.oauth2.initTokenClient({client_id:id,scope:'https://www.googleapis.com/auth/userinfo.email '+G_SCOPE_DRIVE,include_granted_scopes:true,hint:gsCfg().email||undefined,
    callback:r=>{if(r&&r.access_token&&/drive\.appdata/.test(r.scope||'')){nvGGuardar(r.access_token,r.expires_in,r.scope);nvSet({renovar:false});nvBadge();setTimeout(()=>nvSincronizar(false),300)}},error_callback:()=>{}});cli.requestAccessToken({prompt:''})}catch(_){}},true);
/* carregar a biblioteca da Google cedo (para a renovação ser imediata) */
setTimeout(()=>{try{if(nvL().prov==='google'&&!nvUsarRedirect()&&nvGId())gsCarregar().catch(()=>{})}catch(_){}},3000);

/* o início de sessão com Microsoft 365 também usa o ID central, se existir */
{const _msL=msLogin;msLogin=async function(A_){if(A_&&A_.ms&&!A_.ms.clientId&&NV_CENTRAL.ms)A_={...A_,ms:{...A_.ms,clientId:NV_CENTRAL.ms}};return _msL.call(this,A_)}}
nvCentralCarregar().then(()=>{setTimeout(()=>{nvBadge();nvRenovarAuto()},2500)});
/* depois de falhar a renovação ao abrir, tenta de novo quando a app volta a ficar visível */
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){_nvMexeu=false;setTimeout(nvRenovarAuto,1200)}});
AJUDA.push({id:'nuvem2',ic:'cloud',t:'Usar em vários dispositivos (computador, iPad, iPhone)',gif:null,txt:`<ol><li>No primeiro dispositivo: Definições › <b>Sincronização</b> → escolha OneDrive ou Google Drive → <b>Ligar</b> → defina a <b>palavra-passe de encriptação</b>.</li><li>Toque em <b>Ligar Outro Dispositivo</b> e envie o link (AirDrop, Mail, Mensagens) para o iPad, iPhone ou outro computador.</li><li>No outro dispositivo abra o link, entre na mesma conta e escreva a mesma palavra-passe. No iPhone/iPad, adicione a app ao ecrã principal.</li></ol><p>O <b>ícone da nuvem</b> na barra superior mostra o estado: verde sincronizado, ponto azul alterações por enviar, amarelo ligação a renovar (toque para renovar), vermelho erro. A sincronização é automática: ao alterar, ao abrir, ao sair e a cada 5 minutos. Sem internet, tudo fica guardado no dispositivo e é enviado quando a ligação voltar.</p>`});
AJUDA.push({id:'nuvem',ic:'refresh',t:'Sincronização na Nuvem (OneDrive e Google Drive)',gif:null,txt:`<p>Em Definições › <b>Sincronização</b> escolha OneDrive ou Google Drive, ligue a conta e defina uma palavra-passe de encriptação. Nos outros dispositivos (iPad, Mac, outro browser) faça o mesmo com a <b>mesma palavra-passe</b>: os dados aparecem e passam a manter-se iguais.</p><ul><li>Tudo é encriptado no dispositivo antes de sair (AES-256); a Microsoft ou a Google só guardam ficheiros ilegíveis.</li><li>Os dados são divididos por partes (definições, cada ano letivo, cada turma, auditoria, fotografias): alterações em turmas diferentes, em dispositivos diferentes, juntam-se sem conflito.</li><li>Se a mesma turma for alterada em dois dispositivos antes de sincronizar, fica a versão mais recente e a outra é guardada para poder repô-la.</li><li>Sincroniza sozinha 6 s depois de cada alteração, ao abrir, ao voltar à app, ao sair e a cada minuto.</li><li>Precisa da app num endereço https (servidor web) e de um ID de aplicação da Microsoft ou da Google (instruções no próprio cartão).</li></ul>`});


/* ===================== v0.37 — bloqueio dos dados de base ===================== */
ICONS.cadeado='<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>';
ICONS.cadeadoAb='<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>';
ICONS.globo='<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>';
const BLOQ_CAT=[
  ['turmas','Ano letivo e turmas','Criar, apagar ou mudar o nome, disciplina, código, curso ou oferta das turmas e dos anos letivos'],
  ['alunos','Alunos (identificação)','Acrescentar ou retirar alunos; mudar nome, número, processo, género, data de nascimento'],
  ['criterios','Critérios de avaliação','Domínios, pesos, menções e regra de arredondamento'],
  ['horario','Horários','O meu horário, horários das turmas e tempos não letivos'],
  ['calendario','Calendário escolar','Períodos/semestres, interrupções e feriados']];
const bloqM=()=>{const b=S.cfg.bloq=S.cfg.bloq||{};b.cat=b.cat||{turmas:true,alunos:true,criterios:true,horario:true,calendario:true};return b};
const bloqOn=()=>!!(S.cfg.bloq&&S.cfg.bloq.on);
const _pk=(o,ks)=>{const r={};ks.forEach(k=>{if(o[k]!==undefined)r[k]=o[k]});return r};
function bloqSig(st,c){const A_=st.anos||[];const pe=a=>a.porEscola||{};
  if(c==='turmas')return JSON.stringify(A_.map(a=>[a.id,a.nome,(a.turmas||[]).map(t=>_pk(t,['id','nome','anoEsc','ciclo','oferta','disciplina','codigo','curso','cnq','escola']))]));
  if(c==='alunos')return JSON.stringify(A_.map(a=>(a.turmas||[]).map(t=>[t.id,(t.alunos||[]).map(x=>_pk(x,['id','num','nome','processo','genero','nasc','numInterno']))])));
  if(c==='criterios')return JSON.stringify(A_.map(a=>(a.turmas||[]).map(t=>[t.id,t.dominios,t.mencoes,t.regra])));
  if(c==='horario')return JSON.stringify(A_.map(a=>[a.horarios,a.horProf,a.naoLetivos,Object.entries(pe(a)).map(([e,v])=>[e,v&&v.horarios,v&&v.horProf,v&&v.naoLetivos])]));
  if(c==='calendario')return JSON.stringify(A_.map(a=>[a.calendario,Object.entries(pe(a)).map(([e,v])=>[e,v&&v.calendario])]));return ''}
const bloqSigs=st=>{const o={};BLOQ_CAT.forEach(([c])=>o[c]=bloqSig(st,c));return o};
let _bloqRef=null,_bloqLivre=0,_bloqAviso=false;
const bloqRefAtual=()=>{try{_bloqRef=bloqSigs(_ultimoJ?JSON.parse(_ultimoJ):S)}catch(_){_bloqRef=bloqSigs(S)}};
function bloqViolacoes(){if(!bloqOn()||_bloqLivre)return [];if(!_bloqRef)bloqRefAtual();const cat=bloqM().cat;return BLOQ_CAT.filter(([c])=>cat[c]&&bloqSig(S,c)!==_bloqRef[c])}
{const _svB=saveNow;saveNow=function(){const v=bloqViolacoes();
  if(v.length&&_ultimoJ){/* repõe o último estado guardado e explica */const ctx={};['anoAtivo','turmaAtiva','escolaAtiva','filtroOferta'].forEach(k=>ctx[k]=S[k]);
    try{S=JSON.parse(_ultimoJ);Object.assign(S,ctx)}catch(e){return _svB.apply(this,arguments)}
    clearTimeout(saveT);try{if($('#drawer.on'))closeDrawer()}catch(_){}try{manterPosicao(()=>go(VIEW))}catch(_){go(VIEW)}
    if(!_bloqAviso){_bloqAviso=true;avisoModal('Dados Bloqueados',[...v.map(([,n])=>n+' está bloqueado.'),'A alteração foi desfeita para proteger a informação de base.','Para alterar, desbloqueie em Definições › Segurança (com o seu código, se tiver um) e volte a bloquear no fim.'],[{t:'Ok',v:0},{t:ic('gear',15)+' Abrir Definições',v:1,c:'pri'}]).then(r=>{_bloqAviso=false;if(r===1)bloqIrDef()})}
    return}
  const r=_svB.apply(this,arguments);if(bloqOn())_bloqRef=bloqSigs(S);return r}}
async function bloqAlternar(ligar){const b=bloqM();
  if(ligar){b.on=true;b.desde=Date.now();_bloqLivre++;save();saveNow();_bloqLivre--;_bloqRef=bloqSigs(S);try{audit('Segurança','Dados de base bloqueados','')}catch(_){}bloqFlash();bloqUI();return true}
  if(S.cfg.pinHash){const v=await pinDialog({t:'Desbloquear Dados',s:'Escreva o seu código para poder alterar turmas, alunos, critérios, horários e calendário.',verifica:async x=>await pinOk(x),erro:'Código errado'});if(v==null)return false}
  else{const r=await avisoModal('Desbloquear Dados de Base?',['Volta a ser possível alterar ou apagar turmas, alunos, critérios, horários e calendário.','Lembre-se de voltar a bloquear quando terminar.','Dica: defina um código em Definições › Segurança para que só você possa desbloquear.'],[{t:'Cancelar',v:0},{t:ic('cadeadoAb',15)+' Desbloquear',v:1,c:'pri'}]);if(r!==1)return false}
  b.on=false;_bloqLivre++;save();saveNow();_bloqLivre--;try{audit('Segurança','Dados de base desbloqueados','')}catch(_){}toast('Desbloqueado — pode fazer alterações','aviso');bloqUI();return true}
/* v0.942 · o aviso «Bloqueado» aparece 1 segundo ao bloquear e depois não fica no ecrã; só volta (em janela) se se tentar alterar algo bloqueado */
function bloqFlash(){$$('.bloqflash').forEach(x=>x.remove());const d=document.createElement('div');d.className='bloqflash';d.setAttribute('role','status');d.innerHTML=ic('cadeado',20)+'<b>Dados bloqueados</b>';document.body.appendChild(d);setTimeout(()=>{d.classList.add('sai');setTimeout(()=>d.remove(),220)},1000)}
function bloqModal(oQue){if(_bloqAviso)return;_bloqAviso=true;avisoModal('Dados Bloqueados',[(oQue||'Esta informação')+' está bloqueado(a) e não pode ser alterado(a).','Para alterar, desbloqueie em Definições › Segurança (com o seu código, se tiver um) e volte a bloquear no fim.'],[{t:'Ok',v:0},{t:ic('cadeadoAb',15)+' Desbloquear Agora',v:1,c:'pri'}]).then(r=>{_bloqAviso=false;if(r===1)bloqAlternar(false)})}
document.addEventListener('click',e=>{const v=e.target.closest&&e.target.closest('#view.horbloq');if(!v)return;const a=e.target.closest('.aula,.hcel,[data-hslot],td[data-d]');if(!a||e.target.closest('a,button:not(.aula)'))return;e.preventDefault();e.stopPropagation();bloqModal('O horário')},true);
try{const st=document.createElement('style');st.textContent='html body .hbtag,html body #view .bloqban:not(.sug){display:none!important}.bloqflash{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:100000;display:flex;align-items:center;gap:10px;padding:14px 22px;border-radius:14px;background:rgba(17,24,39,.92);color:#fff;font-size:16px;box-shadow:0 20px 50px rgba(0,0,0,.35);pointer-events:none;transition:opacity .2s}.bloqflash.sai{opacity:0}';document.head.appendChild(st)}catch(_){}
/* botão na barra lateral + faixa nas vistas protegidas */
const BLOQ_VISTAS={turmas:'turmas',alunos:'alunos',criterios:'criterios',meuhorario:'horario',horario:'horario',calendario:'calendario'};
/* alunos bloqueados: os campos de identificação passam a texto simples (sem caixa, sem cursor), com a mesma posição do texto */
const BLOQ_AL_K=['num','processo','nome','genero','nasc'];
function bloqAlRO(){const on=document.body.classList.contains('bloq-alunos');document.querySelectorAll('table.alst :is(input,textarea,select)[data-k]').forEach(e=>{if(!BLOQ_AL_K.includes(e.dataset.k))return;
  if(on){if(!e.dataset.ro){e.dataset.ro='1';if(e.tagName==='SELECT')e.disabled=true;else e.readOnly=true;e.tabIndex=-1}}else if(e.dataset.ro){delete e.dataset.ro;if(e.tagName==='SELECT')e.disabled=false;else e.readOnly=false;e.removeAttribute('tabindex')}})}
try{new MutationObserver(()=>{if(document.body.classList.contains('bloq-alunos')||document.querySelector('table.alst [data-ro]'))bloqAlRO()}).observe(document.getElementById('view')||document.body,{childList:true,subtree:true})}catch(_){}
try{const st=document.createElement('style');st.textContent=`html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) :is(input,textarea,select)[data-ro]{border-color:transparent!important;background:transparent!important;box-shadow:none!important;outline:none!important;-webkit-appearance:none;appearance:none;cursor:default;color:var(--ink)!important;opacity:1!important;-webkit-text-fill-color:var(--ink)}
html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) input[type=date][data-ro]::-webkit-calendar-picker-indicator{display:none}
html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) input[type=date][data-ro]:not([value]),html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) input[type=date][data-ro][value=""]{color:transparent!important;-webkit-text-fill-color:transparent}
html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) select[data-ro]{background-image:none!important}
html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) [data-rm],body.bloq-alunos #b-add{display:none!important}`;document.head.appendChild(st)}catch(_){}
function bloqUI(){const sp=$('#side .sessao');if(sp){let n=$('#bloqNav');const tem=S.anos.some(a=>a.turmas.length);
    if(!tem){if(n)n.remove()}else{if(!n){sp.insertAdjacentHTML('beforebegin','<button class="nav" id="bloqNav" type="button"></button>');n=$('#bloqNav');n.onclick=()=>bloqAlternar(!bloqOn())}
      const on=bloqOn();n.className='nav bloqnav'+(on?' on':'');n.setAttribute('aria-pressed',on);n.title=on?'Dados de base bloqueados — toque para desbloquear':'Bloquear turmas, alunos, critérios, horários e calendário';
      n.innerHTML=`<span data-ico>${ic(on?'cadeado':'cadeadoAb',18)}</span><span class="lbl">${on?'Dados Bloqueados':'Bloquear Dados'}</span>`}}
  document.body.classList.toggle('bloq-on',bloqOn());document.body.classList.toggle('bloq-alunos',bloqOn()&&!_bloqLivre&&!!bloqM().cat.alunos);bloqAlRO();
  const v=$('#view');if(!v)return;const ex=v.querySelector('.bloqban');if(ex)ex.remove();const c=BLOQ_VISTAS[VIEW];
  if(c&&bloqOn()&&bloqM().cat[c]){const h=v.querySelector('h1')||v.firstElementChild;const html=`<div class="bloqban" role="status">${ic('cadeado',16)}<span><b>Dados de base bloqueados.</b> ${esc(BLOQ_CAT.find(x=>x[0]===c)[1])} não podem ser alterados nem apagados.</span><span class="sp1"></span><button class="btn sm" type="button" data-bloqoff>${ic('cadeadoAb',14)} Desbloquear</button></div>`;
    if(h&&h.tagName==='H1')h.insertAdjacentHTML('afterend',html);else v.insertAdjacentHTML('afterbegin',html);const bb=v.querySelector('[data-bloqoff]');if(bb)bb.onclick=()=>bloqAlternar(false)}
  else if(VIEW==='turmas'&&!bloqOn()&&S.anos.some(a=>a.turmas.length>1&&a.turmas.some(t=>t.alunos.length))&&!S.cfg.bloqSugVisto){const h=v.querySelector('h1');const html=`<div class="bloqban sug" role="note">${ic('cadeado',16)}<span><b>Já inseriu as turmas e os alunos?</b> Bloqueie os dados de base para não os apagar ou alterar sem querer.</span><span class="sp1"></span><button class="btn sm pri" type="button" data-bloqon>${ic('cadeado',14)} Bloquear</button><button class="btn sm ico" type="button" data-bloqx aria-label="Agora não">${ic('x',12)}</button></div>`;
    if(h)h.insertAdjacentHTML('afterend',html);else v.insertAdjacentHTML('afterbegin',html);v.querySelector('[data-bloqon]').onclick=()=>bloqAlternar(true);v.querySelector('[data-bloqx]').onclick=()=>{S.cfg.bloqSugVisto=1;save();bloqUI()}}}
{const _gB=go;go=function(){const r=_gB.apply(this,arguments);try{bloqUI()}catch(e){console.warn(e)}return r}}
/* cartão nas Definições › Segurança */
function cartaoBloq(){const b=bloqM();return `<div class="card" id="bloq-card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('cadeado',18)} Bloqueio dos Dados de Base</h2><span class="tag ${b.on?'ok':''}">${b.on?'Bloqueado'+(b.desde?' desde '+new Date(b.desde).toLocaleDateString('pt-PT'):''):'Desbloqueado'}</span><span class="sp1"></span>
  <button class="btn ${b.on?'':'pri'}" id="bloq-tg">${ic(b.on?'cadeadoAb':'cadeado',15)} ${b.on?'Desbloquear':'Bloquear Agora'}</button></div>
  <p class="hint" style="margin-top:6px">Depois de inserir as turmas, os alunos, os critérios, os horários e o calendário, bloqueie o que não muda durante o ano. Sumários, presenças, notas, observações e o resto continuam a funcionar normalmente. ${S.cfg.pinHash?'Para desbloquear é pedido o seu código.':'Defina um código (acima) para que só você possa desbloquear.'}</p>
  <div class="bloqcats">${BLOQ_CAT.map(([k,n,d])=>`<label class="chk bloqc"><input type="checkbox" data-bloqc="${k}" ${b.cat[k]?'checked':''} ${b.on?'disabled':''}><span><b>${n}</b><small>${d}</small></span></label>`).join('')}</div>
  ${b.on?'<p class="mut" style="font-size:12.5px;margin:8px 0 0">Para escolher o que fica bloqueado, desbloqueie primeiro.</p>':''}</div>`}
{const _ddB=defDados;defDados=function(){const h=_ddB.apply(this,arguments);const i=h.indexOf('<div class="card"><h2>'+ic('layers',18)+' Espaço Utilizado');return i>0?h.slice(0,i)+cartaoBloq()+h.slice(i):h+cartaoBloq()}}
{const _bdB=bindDados;bindDados=function(){const r=_bdB.apply(this,arguments);const re=()=>{const c=$('#bloq-card');if(!c)return;const d=document.createElement('div');d.innerHTML=cartaoBloq();c.replaceWith(d.firstElementChild);lig()};
  const lig=()=>{const t=$('#bloq-tg');if(t)t.onclick=async()=>{await bloqAlternar(!bloqOn());re()};$$('[data-bloqc]').forEach(x=>x.onchange=()=>{bloqM().cat[x.dataset.bloqc]=x.checked;save()})};lig();return r}}
/* a sincronização e o repor de conflitos trazem dados já validados noutro dispositivo */
{const _nsB=nvSincronizar;nvSincronizar=async function(){_bloqLivre++;try{return await _nsB.apply(this,arguments)}finally{_bloqLivre--;if(bloqOn())_bloqRef=bloqSigs(S);try{bloqUI()}catch(_){}}}}
setTimeout(()=>{try{bloqUI()}catch(_){}},50);

/* ===================== dias nacionais e internacionais ===================== */
const DIAS_MAIS={'01-04':['Dia Mundial do Braille'],'01-26':['Dia Internacional da Educação Ambiental'],'02-02':['Dia Mundial das Zonas Húmidas'],'02-10':['Dia Mundial das Leguminosas'],'02-13':['Dia Mundial da Rádio'],
 '03-03':['Dia Mundial da Vida Selvagem'],'03-19':['Dia do Pai'],'03-20':['Dia Internacional da Felicidade','Dia Internacional da Francofonia'],'03-21':['Dia Mundial da Poesia','Dia Internacional das Florestas','Dia Mundial da Síndrome de Down','Dia Internacional para a Eliminação da Discriminação Racial'],'03-22':['Dia Mundial da Água'],'03-23':['Dia Meteorológico Mundial'],'03-27':['Dia Mundial do Teatro'],
 '04-02':['Dia Internacional do Livro Infantil','Dia Mundial da Consciencialização do Autismo'],'04-07':['Dia Mundial da Saúde'],'04-18':['Dia Internacional dos Monumentos e Sítios'],'04-22':['Dia da Terra'],'04-23':['Dia Mundial do Livro e dos Direitos de Autor'],'04-25':['Dia da Liberdade'],'04-29':['Dia Internacional da Dança'],
 '05-01':['Dia do Trabalhador'],'05-03':['Dia Mundial da Liberdade de Imprensa'],'05-05':['Dia Mundial da Língua Portuguesa'],'05-09':['Dia da Europa'],'05-15':['Dia Internacional da Família'],'05-18':['Dia Internacional dos Museus'],'05-22':['Dia Internacional da Biodiversidade'],'05-31':['Dia Mundial sem Tabaco'],
 '06-01':['Dia Mundial da Criança'],'06-05':['Dia Mundial do Ambiente'],'06-08':['Dia Mundial dos Oceanos'],'06-10':['Dia de Portugal, de Camões e das Comunidades Portuguesas'],'06-12':['Dia Mundial contra o Trabalho Infantil'],'06-20':['Dia Mundial do Refugiado'],'06-26':['Dia Internacional contra o Abuso e o Tráfico de Drogas'],
 '07-11':['Dia Mundial da População'],'07-18':['Dia Internacional Nelson Mandela'],'07-20':['Dia Internacional do Xadrez'],'07-26':['Dia dos Avós'],'07-30':['Dia Internacional da Amizade'],
 '08-09':['Dia Internacional dos Povos Indígenas'],'08-12':['Dia Internacional da Juventude'],'08-15':['Assunção de Nossa Senhora'],'08-19':['Dia Mundial da Fotografia','Dia Mundial Humanitário'],
 '09-08':['Dia Internacional da Alfabetização'],'09-15':['Dia Internacional da Democracia'],'09-16':['Dia Internacional para a Preservação da Camada de Ozono'],'09-21':['Dia Internacional da Paz'],'09-26':['Dia Europeu das Línguas'],'09-27':['Dia Mundial do Turismo'],
 '10-01':['Dia Mundial da Música','Dia Internacional das Pessoas Idosas'],'10-04':['Dia Mundial do Animal'],'10-05':['Implantação da República','Dia Mundial do Professor'],'10-10':['Dia Mundial da Saúde Mental'],'10-16':['Dia Mundial da Alimentação'],'10-17':['Dia Internacional para a Erradicação da Pobreza'],'10-24':['Dia das Nações Unidas'],'10-31':['Dia Mundial da Poupança','Halloween'],
 '11-01':['Dia de Todos os Santos','Dia Mundial do Veganismo'],'11-11':['Dia de São Martinho'],'11-13':['Dia Mundial da Bondade'],'11-14':['Dia Mundial da Diabetes'],'11-16':['Dia Internacional da Tolerância'],'11-20':['Dia Universal dos Direitos da Criança'],'11-25':['Dia Internacional para a Eliminação da Violência contra as Mulheres'],
 '12-01':['Restauração da Independência','Dia Mundial de Luta contra a SIDA'],'12-03':['Dia Internacional das Pessoas com Deficiência'],'12-05':['Dia Internacional do Voluntariado'],'12-08':['Dia da Imaculada Conceição'],'12-10':['Dia dos Direitos Humanos'],'12-18':['Dia Internacional dos Migrantes'],'12-25':['Natal']};
const _normD=x=>x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
Object.entries(DIAS_MAIS).forEach(([md,L])=>{const cur=DIAS_COMEM[md]=DIAS_COMEM[md]||[];L.forEach(n=>{if(!cur.some(c=>_normD(c)===_normD(n)))cur.push(n)})});
const NAC=/^(Dia de Portugal|Dia da Liberdade|Implantação da República|Restauração da Independência|Dia do Trabalhador|Ano Novo|Natal|Dia de Todos os Santos|Assunção|Dia da Imaculada|Dia do Pai|Dia da Mãe|Dia dos Avós|Dia de São Martinho|Dia de Reis|Dia dos Açores|Dia Escolar|Carnaval|Sexta-feira Santa|Páscoa|Corpo de Deus)/;
const tipoEfem=n=>/Mundial|Internacional|Universal|Europeu|Europa|Nações Unidas|Dia da Terra|Meteorológico|Direitos Humanos|Pi \(π\)/.test(n)?'int':NAC.test(n)?'nac':'out';
function diasMoveis(y){const p=pascoa(y);const ad=n=>{const d=new Date(p);d.setDate(d.getDate()+n);return isoData(d)};const o={};o[ad(-47)]=['Carnaval'];o[ad(-2)]=['Sexta-feira Santa'];o[ad(0)]=['Páscoa'];o[ad(50)]=['Dia dos Açores (Segunda-feira do Espírito Santo)'];o[ad(60)]=['Corpo de Deus'];
  const m=new Date(y,4,1);while(m.getDay()!==0)m.setDate(m.getDate()+1);m.setDate(m.getDate()+7);o[isoData(m)]=['Dia da Mãe'];return o}
/* fim de semana: uma piada junto da data */
const PIADAS={6:['Hoje é sábado. Tem mesmo a certeza de que devia estar a trabalhar?','Sábado! Os testes não se corrigem sozinhos… mas aguentam-se até segunda.','Sábado é dia de café sem toque de entrada. Aproveite!','Fim de semana: até o SGE está a descansar.','Sábado a planificar? Os seus alunos não estão a pensar em si, garantimos.'],
  0:['Hoje é domingo. Devia mesmo estar a trabalhar?','Domingo: até os sumários tiram folga.','É domingo — a planificação aguenta-se até amanhã, prometido.','Domingo à tarde a preparar aulas? Clássico de professor. Faça pelo menos uma pausa.','Domingo é para descansar. A grelha de avaliação não foge.']};
const piadaHoje=d=>{d=d||new Date();const L=PIADAS[d.getDay()];if(!L)return '';const n=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);return L[n%L.length]};
{const _wh=widgetHojeInfo;widgetHojeInfo=function(){const d=new Date();const iso=isoHoje();const md=iso.slice(5);const mov=diasMoveis(d.getFullYear())[iso]||[];
  const orig=DIAS_COMEM[md];const todos=[...(orig||[])];mov.forEach(n=>{if(!todos.some(c=>_normD(c)===_normD(n)))todos.push(n)});
  /* o original desenha a lista simples; reorganizamos por nacionais/internacionais */
  DIAS_COMEM[md]=[];let h;try{h=_wh.apply(this,arguments)}finally{if(orig)DIAS_COMEM[md]=orig;else delete DIAS_COMEM[md]}
  const a=A();const cal=a&&a.calendario;const tp=cal&&cal.dias&&cal.dias[iso];const feriado=tp&&/^feriado/.test(tp);
  const nac=todos.filter(n=>tipoEfem(n)!=='int'),int=todos.filter(n=>tipoEfem(n)==='int');
  const li=(n,k)=>`<li class="${/Professor/.test(n)?'prof':k}">${ic(/Professor/.test(n)?'grad':k==='int'?'globo':'flag',14)}<span>${esc(n)}</span></li>`;
  let extra='';if(nac.length)extra+=`<li class="whg" aria-hidden="true">Dias nacionais</li>`+nac.map(n=>li(n,'nac')).join('');
  if(int.length)extra+=`<li class="whg" aria-hidden="true">Dias internacionais</li>`+int.map(n=>li(n,'int')).join('');
  const pz=piadaHoje(d);
  if(pz)h=h.replace('</div>\n    ','</div><p class="whpz" role="note">'+ic('sparkle',14)+'<span>'+esc(pz)+'</span></p>\n    ');
  if(extra){if(h.includes('<ul class="whl">'))h=h.replace(/<\/ul><\/div>$/,extra+'</ul></div>');else h=h.replace(/<p class="mut"[^>]*>Sem efemérides para hoje\.<\/p>/,'<ul class="whl">'+extra+'</ul>')}
  return h}}
/* horário de hoje vazio ao fim de semana */
{const _vmh=typeof vMeuHorario==='function'?vMeuHorario:null;if(_vmh){vMeuHorario=function(){const r=_vmh.apply(this,arguments);try{const pz=piadaHoje();if(pz){const p=[...document.querySelectorAll('#view p.mut')].find(x=>/Hoje não há atividades letivas/.test(x.textContent));if(p&&!p.querySelector('.whpz'))p.insertAdjacentHTML('beforeend',`<span class="whpz in">${ic('sparkle',13)} ${esc(pz)}</span>`)}}catch(_){}return r}}}

/* ensino profissional: o distintivo da turma mostra o código interno (no regular continua o ano) */
function badgeCod(t){try{if(!t||!t.codigo)return '';const prof=ofertaDe(t)==='profissional'||tipoEscola(escolaDe(t))==='profissional';return prof?String(t.codigo).trim().slice(0,6):''}catch(_){return ''}}


/* ===================== Entrar com Microsoft 365 → OneDrive pronto a sincronizar ===================== */
/* ID da aplicação (Microsoft Entra) embutido: preencha aqui quando alojar a app para não ter de o escrever em cada dispositivo.
   Também pode ser passado uma vez no endereço: https://…/index.html?ms=<ID> */
const EF_MS_ID='';
try{const q=new URLSearchParams(location.search).get('ms');if(q&&/^[0-9a-f-]{36}$/i.test(q)){nvSet({msId:q});history.replaceState(null,'',location.pathname+location.hash)}}catch(_){}
const msIdAtual=()=>{const L=nvL();const a=(S.cfg.auth&&S.cfg.auth.ms)||{};return L.msId||a.clientId||EF_MS_ID||''};
/* a ligação usa o ID atual e o inquilino da escola (se indicado) */
{const _ml=msLigar;msLigar=async function(){const id=msIdAtual();if(id&&!nvL().msId)nvSet({msId:id});return _ml.apply(this,arguments)}}
/* pedido do ID quando ainda não existe neste dispositivo */
function msPedirId(){return new Promise(res=>{const d=document.createElement('dialog');d.className='amodal msid';d.setAttribute('aria-labelledby','mi-t');
  d.innerHTML=`<div class="amh"><svg width="22" height="22" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg><h2 id="mi-t">Ligar o EduSpruce à Microsoft</h2></div>
  <p class="hint" style="margin:0 0 10px">Só é preciso uma vez. O EduSpruce precisa do <b>ID da aplicação</b> registada na Microsoft Entra (grátis).</p>
  <label for="mi-id">ID da aplicação (cliente)</label><input id="mi-id" placeholder="00000000-0000-0000-0000-000000000000" autocapitalize="none" spellcheck="false" inputmode="text">
  <details class="nvaj"><summary>Como obter</summary><ol><li><b>portal.azure.com</b> › Microsoft Entra ID › Registos de aplicações › <b>Novo registo</b>.</li><li>Tipos de conta: <b>qualquer organização e contas pessoais</b>.</li><li>URI de redirecionamento: <b>Aplicação de página única (SPA)</b> → <code>${esc(nvRedirect())}</code></li><li>Permissões de API › Microsoft Graph › Delegadas: <b>User.Read</b> e <b>Files.ReadWrite.AppFolder</b>.</li><li>Copie o “ID da aplicação (cliente)”. Numa conta da escola o administrador pode ter de aprovar.</li></ol></details>
  <p class="lgerr" id="mi-err" role="alert"></p><div class="row amb"><button type="button" class="btn" data-mi="0">Cancelar</button><button type="button" class="btn pri" data-mi="1">Continuar</button></div>`;
  document.body.appendChild(d);const fim=v=>{try{d.close()}catch(_){}d.remove();res(v)};d.addEventListener('cancel',e=>{e.preventDefault();fim(null)});
  d.querySelector('[data-mi="0"]').onclick=()=>fim(null);const ok=()=>{const v=d.querySelector('#mi-id').value.trim();if(!/^[0-9a-f-]{36}$/i.test(v)){d.querySelector('#mi-err').textContent='O ID tem o formato 00000000-0000-0000-0000-000000000000.';return}nvSet({msId:v});fim(v)};
  d.querySelector('[data-mi="1"]').onclick=ok;d.querySelector('#mi-id').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok()}});try{d.showModal()}catch(_){d.setAttribute('open','')}setTimeout(()=>d.querySelector('#mi-id').focus(),50)})}
/* palavra-passe de encriptação depois de entrar */
function nvPedirPalavra(existe,conta){return new Promise(res=>{const d=document.createElement('dialog');d.className='amodal nvpwd';d.setAttribute('aria-labelledby','np-t');
  d.innerHTML=`<div class="amh">${ic('shield',22)}<h2 id="np-t">${existe?'Abrir os Seus Dados na Nuvem':'Proteger os Dados na Nuvem'}</h2></div>
  <p class="hint" style="margin:0 0 10px">${existe?`Encontrámos dados do EduSpruce no OneDrive de <b>${esc(conta||'')}</b>. Escreva a palavra-passe de encriptação que definiu no outro dispositivo.`:`Os dados vão ser guardados no OneDrive de <b>${esc(conta||'')}</b>, encriptados neste dispositivo. Escolha uma palavra-passe só sua (mín. 8) e guarde-a: vai precisar dela no iPad, no Mac ou noutro browser.`}</p>
  <input type="password" id="np-1" placeholder="Palavra-passe de encriptação" autocomplete="${existe?'current-password':'new-password'}">${existe?'':'<input type="password" id="np-2" placeholder="Repetir" autocomplete="new-password" style="margin-top:8px">'}
  <p class="lgerr" id="np-err" role="alert"></p><div class="row amb"><button type="button" class="btn" data-np="0">Mais Tarde</button><button type="button" class="btn pri" data-np="1">${ic('refresh',15)} ${existe?'Abrir e Sincronizar':'Guardar e Sincronizar'}</button></div>`;
  document.body.appendChild(d);const fim=v=>{try{d.close()}catch(_){}d.remove();res(v)};d.addEventListener('cancel',e=>{e.preventDefault();fim(false)});d.querySelector('[data-np="0"]').onclick=()=>fim(false);
  const ok=async()=>{const a=d.querySelector('#np-1').value,b=existe?a:d.querySelector('#np-2').value;const er=d.querySelector('#np-err');{const _e=nvPinErro(a,'np-1',!existe);if(_e){er.textContent=_e;return}}if(a!==b){er.textContent='As palavras-passe não coincidem.';return}
    const bt=d.querySelector('[data-np="1"]');bt.disabled=true;er.textContent='';try{await nvDefinirPalavra(a);fim(true)}catch(e){er.textContent=e.message;bt.disabled=false;d.classList.add('abana');setTimeout(()=>d.classList.remove('abana'),400)}};
  d.querySelector('[data-np="1"]').onclick=ok;d.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok()}}));try{d.showModal()}catch(_){d.setAttribute('open','')}setTimeout(()=>d.querySelector('#np-1').focus(),50)})}
async function nvAposLogin(){if(nvAposLogin._a)return;nvAposLogin._a=1;try{const L=nvL();if(L.prov!=='onedrive'||!L.ms)return;if(await nvChave()){nvSincronizar(false);return}
  let existe=false;try{existe=!!(await PROV.onedrive.ler(NV_PREF+'manifest.json'))}catch(e){toast(e.message,'erro');return}
  const ok=await nvPedirPalavra(existe,L.conta);if(!ok){toast('Pode ativar a sincronização mais tarde em Definições › Segurança','aviso');return}
  const r=await nvSincronizar(true);if(r&&!existe)toast('Tudo pronto: os seus dados estão no OneDrive (encriptados)','ok')}catch(e){console.warn(e)}finally{nvAposLogin._a=0}}
/* Entrar com Microsoft 365: uma só autorização dá a sessão e o acesso à pasta da app no OneDrive */
msLogin=async function(A_){if(!nvHttps())throw new Error('Entrar com Microsoft 365 precisa que a app esteja num endereço https (alojada num servidor), não aberta como ficheiro.');
  let id=msIdAtual();if(!id){id=await msPedirId();if(!id)return null}if(!nvL().msId)nvSet({msId:id});
  await msLigar();const L=nvL();let me={};try{me=await (await msF('https://graph.microsoft.com/v1.0/me')).json()}catch(_){}
  const email=String(me.mail||me.userPrincipalName||L.conta||'').toLowerCase();const m=(A_&&A_.ms)||{};
  if(m.dominio&&!email.endsWith('@'+m.dominio.toLowerCase().replace(/^@/,''))){nvSet({ms:null});throw new Error('A conta '+email+' não pertence ao domínio autorizado ('+m.dominio+').')}
  const nome=me.displayName||email;nvSet({prov:L.prov||'onedrive',conta:email,auto:L.auto!==false});
  if(L.prov&&L.prov!=='onedrive')nvSet({prov:'onedrive',base:null,mod:{}});
  try{if(!S.cfg.professor)S.cfg.professor=nome;if((!S.cfg.email||typeof S.cfg.email!=='string')&&/@/.test(email))S.cfg.email=email;S.cfg.auth=S.cfg.auth||{};S.cfg.auth.ms=S.cfg.auth.ms||{};if(!S.cfg.auth.ms.clientId)S.cfg.auth.ms.clientId=id;save()}catch(_){}
  setTimeout(nvAposLogin,900);
  return {u:email,nome,papel:'professor',tipo:'ms',desde:Date.now()}};
/* o botão fica sempre disponível (o ID pode ser pedido no momento) */
{const _pl=pedirLogin;pedirLogin=function(){const p=_pl.apply(this,arguments);setTimeout(()=>{const b=$('#lg-ms');if(b){b.removeAttribute('aria-disabled');const m=b.querySelector('.mut');if(m)m.remove();
    if(!$('#lg-msn'))($('#lg-gg')||b).insertAdjacentHTML('afterend',`<p class="lgmsn" id="lg-msn">${ic('refresh',13)} Entre com Google: os dados ficam iguais no computador, no iPad e no iPhone (Google Drive, encriptado).</p>`)}},0);return p}}
/* sessão Microsoft já iniciada: confirma a sincronização ao abrir */
setTimeout(()=>{try{const s=sessaoAtual();if(s&&s.tipo==='ms')nvAposLogin()}catch(_){}},2500);
/* Definições › Conta e Acesso: o ID da Microsoft passa também para este dispositivo */
document.addEventListener('change',e=>{if(e.target&&e.target.id==='ms-cid'){const v=e.target.value.trim();if(v)nvSet({msId:v})}},true);


/* ecrã de código ao abrir: mesmo fundo do início de sessão, cartão moderno com teclado */
pedirPin=function(){return new Promise(ok=>{const p=(()=>{try{return perfil()}catch(_){return {}}})();const nome=profNome?(profNome(S.cfg.professor)||''):(S.cfg.professor||'');const pn=(S.cfg.professor||'').trim().split(/\s+/)[0]||'';
  let foto=p.foto||'';if(foto&&!/^data:/.test(foto))foto=FOTOS[foto]||FOTOS[String(foto).replace(/^f:/,'')]||'';const ini=(S.cfg.professor||'E').trim().split(/\s+/).filter(Boolean);const inic=((ini[0]||'E')[0]+(ini.length>1?ini[ini.length-1][0]:'')).toUpperCase();
  const h=new Date().getHours();const sd=h<6?'Boa noite':h<13?'Bom dia':h<20?'Boa tarde':'Boa noite';
  const o=document.createElement('div');o.id='login';o.className='pinmode';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','pl-t');
  const teclas=['1','2','3','4','5','6','7','8','9','x','0','b'];
  o.innerHTML=`<div class="lgb pinc"><div class="lgh"><span class="lgi">${ic('flow',30)}</span><div><b>Edu<em>Spruce</em></b><span>${esc(S.cfg.escola||'Menos papelada. Mais tempo para ensinar.')}</span></div></div>
    <div class="plav">${foto?`<img src="${foto}" alt="">`:`<span>${esc(inic)}</span>`}<i>${ic('cadeado',14)}</i></div>
    <h1 id="pl-t">${sd}${pn?', '+esc(pn):''}</h1><p class="mut plsub">Introduza o seu código para continuar</p>
    <div class="pdots" role="status" aria-live="polite" aria-label="0 de 4 algarismos"><i></i><i></i><i></i><i></i></div><p class="pderr" role="alert"></p>
    <div class="pdk">${teclas.map(k=>k==='x'?`<button type="button" class="pdc" data-pk="x">Sair</button>`:k==='b'?`<button type="button" class="pdb" data-pk="b" aria-label="Apagar">${ic('arrowL',22)}</button>`:`<button type="button" data-pk="${k}">${k}</button>`).join('')}</div>
    <p class="lgnota">${SESSAO&&SESSAO.nome?'Sessão de <b>'+esc(SESSAO.nome)+'</b>'+(SESSAO.tipo==='ms'?' · Microsoft 365':''):''}</p></div>`;
  document.body.appendChild(o);document.body.classList.add('login-on');let v='',ocup=false;const D=o.querySelector('.pdots'),E_=o.querySelector('.pderr');
  const dots=()=>{D.querySelectorAll('i').forEach((d,k)=>d.classList.toggle('on',k<v.length));D.setAttribute('aria-label',v.length+' de 4 algarismos')};
  const tecla=async x=>{if(ocup)return;if(x==='x'){if(confirm('Terminar a sessão?'))terminarSessao();return}if(x==='b')v=v.slice(0,-1);else if(v.length<4){v+=x;E_.textContent=''}dots();
    const bt=o.querySelector(`[data-pk="${x}"]`);if(bt){bt.classList.remove('prem');void bt.offsetWidth;bt.classList.add('prem')}
    if(v.length===4){ocup=true;if(await pinOk(v)){D.classList.add('ok');document.removeEventListener('keydown',kb);setTimeout(()=>{o.classList.add('sai');document.body.classList.remove('login-on');setTimeout(()=>o.remove(),300);ok()},220)}
      else{E_.textContent='Código errado';D.classList.add('abana');try{vibrar()}catch(_){}setTimeout(()=>{v='';dots();D.classList.remove('abana');ocup=false},420)}}};
  o.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>tecla(b.dataset.pk));const kb=e=>{if(e.target&&(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.closest&&e.target.closest('dialog')))return;if(/^\d$/.test(e.key)){e.preventDefault();tecla(e.key)}else if(e.key==='Backspace'){e.preventDefault();tecla('b')}};document.addEventListener('keydown',kb);
  const c=o.querySelector('.pinc');c.tabIndex=-1;setTimeout(()=>c.focus({preventScroll:true}),80)})};


