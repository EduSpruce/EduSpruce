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


