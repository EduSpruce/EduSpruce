/* =====================================================================
   v0.71 · Sincronização em todos os dispositivos (computadores, iPad, iPhone)
   — IDs de aplicação centrais (eduspruce-config.json no site)
   — início de sessão por redirecionamento (iPhone/iPad e app no ecrã principal, sem pop-ups)
   — renovação automática da ligação (Microsoft: 24 h nas apps web; Google: 1 h)
   — tentativas com espera (rede, 429, 5xx), bloqueio entre separadores, ETag no manifesto (OneDrive)
   — indicador de estado na barra e ligação de outro dispositivo por link
   ===================================================================== */
ICONS.cloud='<path d="M7 18.5h10.2a4.3 4.3 0 0 0 .6-8.56A6 6 0 0 0 6.3 9.1 4.7 4.7 0 0 0 7 18.5z"/>';ICONS.cloudsync='<path d="M6.5 17.5H6a4 4 0 0 1-.6-7.95A6 6 0 0 1 17 8.2a4 4 0 0 1 1.5 7.6"/><path d="M9.5 14.2a3 3 0 0 1 5-1.2l.8.8"/><path d="M15.4 11.6v2.3h-2.3"/><path d="M14.5 17.8a3 3 0 0 1-5 1.2l-.8-.8"/><path d="M8.6 20.4v-2.3h2.3"/>';
const NV_AUTH='edugest.nuvem.auth',NV_RENOVAR='A ligação à nuvem precisa de ser renovada — toque no ícone da nuvem.';
let NV_CENTRAL={ms:'',google:'',ok:false};
const nvMsId=()=>(nvL().msId||'').trim()||NV_CENTRAL.ms;
const nvGId=()=>(gsCfg().clientId||'').trim()||NV_CENTRAL.google;
const nvStandalone=()=>{try{return !!(navigator.standalone||matchMedia('(display-mode: standalone)').matches)}catch(_){return false}};
const nvIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Mac/.test(navigator.userAgent));
const nvSafari=()=>/^((?!chrome|chromium|crios|fxios|edg|opr|android).)*safari/i.test(navigator.userAgent);
const nvUsarRedirect=()=>!!window.__gsiBloq||nvStandalone()||nvIOS()||nvSafari();
const nvEspera=ms=>new Promise(ok=>setTimeout(ok,ms));
async function nvCentralCarregar(){if(!/^https?:/.test(location.protocol))return;try{const r=await fetch('eduspruce-config.json',{cache:'no-cache'});if(!r.ok)return;const j=await r.json();
  NV_CENTRAL={ms:String(j.microsoftClientId||'').trim(),google:String(j.googleClientId||'').trim(),ok:true};
  if(NV_CENTRAL.ms&&A0ms())A0ms().clientIdCentral=NV_CENTRAL.ms;nvBadge()}catch(_){}}
function A0ms(){try{return (typeof acessoCfg==='function'?acessoCfg():null)||null}catch(_){return null}}
/* pedidos com novas tentativas (sem rede, limite de pedidos 429, erros 5xx do servidor) */
async function nvFetchRetry(url,opt,n){n=n==null?4:n;let ult;for(let i=0;i<=n;i++){try{const r=await fetch(url,opt);if(r.status===429||r.status>=500&&r.status!==501){ult=r;if(i===n)return r;const ra=+r.headers.get('Retry-After');await nvEspera(ra?Math.min(ra,30)*1000:Math.min(800*2**i,8000));continue}return r}
  catch(e){ult=e;if(i===n)throw new Error('Sem ligação à internet — a sincronização volta a tentar sozinha.');await nvEspera(Math.min(800*2**i,8000))}}return ult}
/* --- Microsoft (OneDrive) --- */
async function msTroca(code,v){const r=await nvFetchRetry(MS_AUTH+'/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:nvMsId(),grant_type:'authorization_code',code,redirect_uri:nvRedirect(),code_verifier:v,scope:MS_SCOPE})});
  const j=await r.json().catch(()=>({}));if(!j.access_token)throw new Error(j.error_description||'Não foi possível ligar ao OneDrive');
  nvSet({ms:{at:j.access_token,rt:j.refresh_token,exp:Date.now()+(+j.expires_in||3600)*1000,rtq:Date.now()},renovar:false});
  try{const me=await (await fetch('https://graph.microsoft.com/v1.0/me',{headers:{Authorization:'Bearer '+j.access_token}})).json();nvSet({conta:me.mail||me.userPrincipalName||nvL().conta||''})}catch(_){}nvBadge()}
msLigar=async function(o){o=o||{};const id=nvMsId();if(!id)throw new Error('Falta o ID da aplicação da Microsoft (ver o guia de configuração da sincronização).');if(!nvHttps())throw new Error('A ligação ao OneDrive precisa que a app esteja num endereço https (servidor web).');
  const red=!!o.redirect||nvUsarRedirect();let w=null;
  if(!red){w=window.open('about:blank','nvms','width=520,height=700');if(!w)return msLigar({...o,redirect:true})}
  const {v,c}=await pkce();const state=(red?'nvmsR':'nvms')+Math.random().toString(36).slice(2);const hint=o.hint||nvL().conta||'';
  const url=`${MS_AUTH}/authorize?client_id=${encodeURIComponent(id)}&response_type=code&redirect_uri=${encodeURIComponent(nvRedirect())}&response_mode=query&scope=${encodeURIComponent(MS_SCOPE)}&state=${state}&code_challenge=${c}&code_challenge_method=S256&prompt=${o.silent?'none':'select_account'}${hint?'&login_hint='+encodeURIComponent(hint):''}`;
  if(red){try{localStorage.setItem(NV_AUTH,JSON.stringify({p:'ms',v,state,q:Date.now(),silent:!!o.silent,view:typeof VIEW!=='undefined'?VIEW:'inicio',tab:UI.defTab||''}))}catch(_){}if(o.silent)nvSet({renTent:Date.now()});location.href=url;return new Promise(()=>{})}
  w.location.href=url;
  const code=await new Promise((ok,ko)=>{const t=setInterval(()=>{if(w.closed){clearInterval(t);removeEventListener('message',m);ko(new Error('Janela da Microsoft fechada.'))}},700);const m=e=>{if(e.origin!==location.origin||!e.data||!e.data.nvms)return;const r=e.data.nvms;if(r.state!==state)return;clearInterval(t);removeEventListener('message',m);if(r.error||!r.code)ko(new Error(r.error||'Sem autorização'));else ok(r.code)};addEventListener('message',m)});
  await msTroca(code,v)};
msTok=async function(){const L=nvL();const m=L.ms;if(!m)throw new Error('OneDrive não ligado');if(m.at&&m.exp>Date.now()+60000)return m.at;
  if(!m.rt){nvRenovarPedir();throw new Error(NV_RENOVAR)}
  const r=await nvFetchRetry(MS_AUTH+'/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:nvMsId(),grant_type:'refresh_token',refresh_token:m.rt,scope:MS_SCOPE})});const j=await r.json().catch(()=>({}));
  if(!j.access_token){if(r.status>=500||r.status===429)throw new Error('Microsoft indisponível — volta a tentar sozinha.');nvSet({ms:{...m,at:null,rt:null,exp:0}});nvRenovarPedir();throw new Error(NV_RENOVAR)}
  nvSet({ms:{...m,at:j.access_token,rt:j.refresh_token||m.rt,exp:Date.now()+(+j.expires_in||3600)*1000},renovar:false});return j.access_token};
msF=async function(path,opt){let t=await msTok();let r=await nvFetchRetry(path,{...(opt||{}),headers:{...((opt||{}).headers||{}),Authorization:'Bearer '+t}});
  if(r.status===401){const L=nvL();nvSet({ms:{...L.ms,exp:0}});t=await msTok();r=await nvFetchRetry(path,{...(opt||{}),headers:{...((opt||{}).headers||{}),Authorization:'Bearer '+t}})}return r};
/* manifesto com ETag: se outro dispositivo escrever entre a leitura e a escrita, repete a sincronização */
{const od=PROV.onedrive;let etag=null;const _ler=od.ler.bind(od),_esc=od.escrever.bind(od);
  od.ler=async function(n){if(n!==NV_PREF+'manifest.json')return _ler(n);const r=await msF(MS_G+':/EduFlow/'+encodeURIComponent(n));if(r.status===404){etag=null;return null}if(!r.ok)throw new Error('OneDrive: erro '+r.status+' ao ler '+n);const j=await r.json();etag=j.eTag||null;
    const u=j['@microsoft.graph.downloadUrl'];if(u){const d=await nvFetchRetry(u,{});if(d.ok)return await d.text()}return _ler(n)};
  od.escrever=async function(n,txt){if(n!==NV_PREF+'manifest.json'||!etag)return _esc(n,txt);const r=await msF(MS_G+':/EduFlow/'+encodeURIComponent(n)+':/content',{method:'PUT',headers:{'Content-Type':'text/plain','If-Match':etag},body:txt});
    if(r.status===412){window.__nvCorrida=true;throw new Error('Outro dispositivo sincronizou ao mesmo tempo — a repetir…')}if(!r.ok)throw new Error('OneDrive: erro '+r.status+' ao guardar '+n);try{const j=await r.json();etag=j.eTag||null}catch(_){etag=null}}}
/* --- Google (Drive) --- */
const nvGTok=()=>{const g=nvL().g;return g&&g.t&&g.exp>Date.now()+60000&&/drive\.appdata/.test(g.sc||'')?g.t:null};
gsToken=async function(interativo){const t=nvGTok();if(t){_gsTok={t,exp:nvL().g.exp};return t}const id=nvGId();if(!id)throw new Error('Falta o ID de cliente da Google (ver o guia de configuração da sincronização).');
  if(!nvHttps())throw new Error('A sincronização com a Google só funciona com a app alojada num endereço https.');
  const c=gsCfg();if(!interativo){nvRenovarPedir();throw new Error(NV_RENOVAR)}
  if(nvUsarRedirect()||interativo==='redirect'||interativo==='silencioso'){const state='nvgsR'+Math.random().toString(36).slice(2);try{localStorage.setItem(NV_AUTH,JSON.stringify({p:'g',state,q:Date.now(),silent:interativo==='silencioso',view:typeof VIEW!=='undefined'?VIEW:'inicio',tab:UI.defTab||''}))}catch(_){}
    if(interativo==='silencioso')nvSet({renTent:Date.now()});
    location.href='https://accounts.google.com/o/oauth2/v2/auth?'+new URLSearchParams({client_id:id,redirect_uri:nvRedirect(),response_type:'token',scope:'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email',state,include_granted_scopes:'true',...(interativo==='silencioso'?{prompt:'none'}:(c.email&&!nvL().gEsc)?{}:{prompt:'consent'}),...(c.email?{login_hint:c.email}:{})});return new Promise(()=>{})}
  await gsCarregar();return await new Promise((ok,ko)=>{_gsCli=google.accounts.oauth2.initTokenClient({client_id:id,scope:'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email',
    callback:r=>{if(!(r&&r.access_token))return ko(new Error((r&&r.error)||'Sem autorização'));try{if(google.accounts.oauth2.hasGrantedAllScopes&&!google.accounts.oauth2.hasGrantedAllScopes(r,'https://www.googleapis.com/auth/drive.appdata')){nvSet({gEsc:1});return ko(new Error('Ficou desmarcada a permissão do Google Drive. Toque de novo em «Ligar ao Google Drive» e deixe-a marcada.'))}}catch(_){}nvSet({gEsc:0});nvGGuardar(r.access_token,r.expires_in,r.scope);ok(r.access_token)},error_callback:e=>ko(new Error(e&&e.type==='popup_closed'?'Janela da Google fechada':'Não foi possível obter autorização da Google'))});
    _gsCli.requestAccessToken({prompt:(c.email&&!nvL().gEsc)?'':'consent',hint:c.email||undefined})})};
function nvGGuardar(t,exp,sc){if(!t)return;const e=Date.now()+(+exp||3600)*1000;_gsTok={t,exp:e};nvSet({g:{t,exp:e,sc:sc||'https://www.googleapis.com/auth/drive.appdata'},renovar:false});
  if(!gsCfg().email)fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+t}}).then(r=>r.json()).then(j=>{if(j.email){gsCfg().email=j.email;save()}}).catch(()=>{});nvBadge()}
const nvGProj=()=>{const m=String(nvGId()||'').match(/^(\d{6,})-/);return m?m[1]:''};
gsFetch=async function(url,opt){const t=await gsToken(false);const comQ=u=>u+(u.includes('?')?'&':'?')+'access_token='+encodeURIComponent(t);
  if(nvL().gQ)nvSet({gQ:0});
  const semCab=()=>{const h={...((opt||{}).headers||{})};delete h.Authorization;return {...(opt||{}),headers:h}};
  let r;
  if(window.__gModoQ){r=await nvFetchRetry(comQ(url),semCab(),1)}
  else{try{r=await nvFetchRetry(url,{...(opt||{}),headers:{...((opt||{}).headers||{}),Authorization:'Bearer '+t}},1)}
    catch(e){/* o navegador/filtro bloqueou o pedido com cabeçalho: tenta o formato simples (autorização no endereço, sem cabeçalho) */
      try{r=await nvFetchRetry(comQ(url),semCab(),1);if(r.ok||r.status<500){window.__gModoQ=1;console.info('[EduSpruce] Google Drive: modo simples')}}catch(e2){throw e}}}
  /* se a autorização se perder pelo caminho (rede/filtro), repete com o testemunho no endereço */
  if(r.status===403&&!window.__gModoQ){let tx='';try{tx=await r.clone().text()}catch(_){}if(/unregistered callers|CREDENTIALS_MISSING/i.test(tx)){try{const r2=await nvFetchRetry(comQ(url),semCab(),1);if(r2.ok){window.__gModoQ=1;r=r2}else r=r2}catch(_){}}}
  if(r.status===401){_gsTok=null;nvSet({g:null});nvRenovarPedir();throw new Error(NV_RENOVAR)}
  if(!r.ok){let j={};try{j=await r.clone().json()}catch(_){}const er=(j&&j.error)||{};const rs=((er.errors||[])[0]||{}).reason||((er.details||[]).find(d=>d.reason)||{}).reason||er.status||'';const msg=String(er.message||'');
    console.warn('[EduSpruce] Google Drive',r.status,rs,msg);
    if(/accessNotConfigured|SERVICE_DISABLED|has not been used|is disabled/i.test(rs+' '+msg))throw new Error('Google Drive: a «Google Drive API» não está ativada no projeto da Google. Quem configurou a app tem de a ativar em console.cloud.google.com › APIs e serviços › Biblioteca › Google Drive API › Ativar (e esperar 2–3 minutos).');
    if(/unregistered callers|CREDENTIALS_MISSING/i.test(rs+' '+msg)){let sc='';try{const ti=await (await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token='+encodeURIComponent(t))).json();sc=String(ti.scope||'')}catch(_){}
      if(/drive\.appdata/.test(sc)){const pj=nvGProj();throw new Error('Google Drive: a ligação está correta (com a permissão do Drive), mas a Google recusa o pedido ao Drive. Quase sempre é a «Google Drive API» desligada no projeto'+(pj?' '+pj:'')+': abra console.cloud.google.com/apis/library/drive.googleapis.com'+(pj?'?project='+pj:'')+' › Ativar, espere 3–5 minutos e volte a tentar.')}}
    if(/insufficientPermissions|ACCESS_TOKEN_SCOPE_INSUFFICIENT|insufficient authentication scopes|unregistered callers|CREDENTIALS_MISSING/i.test(rs+' '+msg)){let dg='';try{const ti=await (await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token='+encodeURIComponent(t))).json();const cid=String(ti.aud||ti.azp||'');dg=' [diagnóstico: cliente …'+cid.slice(-14)+' · permissões: '+String(ti.scope||'nenhuma').replace(/https:\/\/www\.googleapis\.com\/auth\//g,'')+(ti.error_description?' · '+ti.error_description:'')+(nvGId()&&cid&&cid!==nvGId()?' · ATENÇÃO: o ID de cliente da ligação não é o configurado':'')+']';window.__gDiag={ti,cfg:nvGId(),status:r.status,msg}}catch(_){dg=' [diagnóstico indisponível]'}
      _gsTok=null;nvSet({g:null,gEsc:1});throw new Error('Google Drive: falta a permissão do Drive. Toque em «Ligar ao Google Drive» e, no ecrã da Google, deixe marcada a opção «Ver, criar e eliminar os seus próprios dados de configuração no Google Drive».'+dg)}
    if(/userRateLimitExceeded|rateLimitExceeded/i.test(rs))throw new Error('Google Drive: demasiados pedidos — volta a tentar sozinha dentro de momentos.');
    throw new Error('Google Drive: erro '+r.status+(msg?' — '+msg.slice(0,160):''))}
  return r};
/* --- regresso do início de sessão por redirecionamento --- */
(async()=>{try{const q=new URLSearchParams(location.search);const h=new URLSearchParams((location.hash||'').replace(/^#/,''));const stQ=q.get('state')||'',stH=h.get('state')||'';
  const st=stQ.startsWith('nvmsR')?stQ:stH.startsWith('nvgsR')?stH:'';if(!st)return;let A0=null;try{A0=JSON.parse(localStorage.getItem(NV_AUTH)||'null')}catch(_){}localStorage.removeItem(NV_AUTH);
  history.replaceState(null,'',nvRedirect());if(!A0||A0.state!==st)return;
  const depois=()=>{setTimeout(()=>{try{if(A0.view==='definicoes'){UI.defTab=A0.tab||'sync'}if(typeof go==='function'&&sessaoAtual&&sessaoAtual())go(A0.view||'inicio')}catch(_){}nvSincronizar(false).then(nvBadge)},900)};
  if(A0.p==='ms'){const err=q.get('error');if(err){nvSet({renovar:true});nvBadge();if(!A0.silent)setTimeout(()=>toast('Microsoft: '+(q.get('error_description')||err).split('\n')[0],'erro'),600);return}
    await msTroca(q.get('code'),A0.v);if(!A0.silent)setTimeout(()=>toast('OneDrive ligado','ok'),600);depois()}
  else{const err=h.get('error');if(err){nvSet({renovar:true});nvBadge();if(!A0.silent)setTimeout(()=>toast('Google: '+err,'erro'),600);return}const sc=h.get('scope')||'';if(sc&&!/drive\.appdata/.test(sc)){nvSet({gEsc:1,renovar:true});setTimeout(()=>toast('Ficou desmarcada a permissão do Google Drive. Toque de novo em «Ligar ao Google Drive» e deixe-a marcada.','erro'),600);return}nvSet({gEsc:0});nvGGuardar(h.get('access_token'),h.get('expires_in'),h.get('scope'));if(!A0.silent)setTimeout(()=>toast('Google Drive ligado','ok'),600);depois()}}
  catch(e){console.warn(e);setTimeout(()=>toast(e.message,'erro'),600)}})();
/* --- renovação: automática ao abrir a app (sem o utilizador ter começado a mexer), senão com 1 toque no ícone --- */
let _nvMexeu=false;['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{_nvMexeu=true},{once:true,capture:true}));
function nvRenovarPedir(){if(!nvL().renovar)nvSet({renovar:true});nvBadge()}
async function nvRenovar(silencioso){const L=nvL();if(L.prov==='onedrive')return msLigar({silent:!!silencioso,redirect:silencioso?true:undefined,hint:L.conta});if(L.prov==='google')return gsToken(silencioso?'silencioso':true)}
function nvRenovarAuto(){const L=nvL();if(!L.renovar||!L.prov||!navigator.onLine||_nvMexeu||document.hidden)return;if(L.renTent&&Date.now()-L.renTent<30*60*1000)return;if(!nvHttps())return;
  try{if(typeof sessaoAtual==='function'&&!sessaoAtual())return}catch(_){}nvRenovar(true).catch(()=>{})}
/* --- bloqueio entre separadores e repetição quando há corrida com outro dispositivo --- */
{const _sync=nvSincronizar;let _dentro=false;const _syncG=_sync;nvSincronizar=async function(interativo,_n){if(_dentro)return _sync(interativo);_n=_n||0;const corre=async()=>{window.__nvCorrida=false;_dentro=true;try{if(nvL().prov==='google')PROV.google._ids=null}catch(_){}let r;try{r=await _sync(interativo)}finally{_dentro=false}nvBadge();
    if(!r&&window.__nvCorrida&&_n<3){window.__nvCorrida=false;nvSet({erro:''});await nvEspera(700+Math.random()*900);return nvSincronizar(interativo,_n+1)}
    if(!r&&/renovad/.test(nvL().erro||'')){nvRenovarAuto()}return r};
  try{if(navigator.locks&&navigator.locks.request)return await navigator.locks.request('eduspruce-sync',{ifAvailable:true},async lk=>lk?corre():null)}catch(_){}return corre()}}
/* --- indicador de estado na barra superior --- */
function nvBadge(){try{const bar=$('#bar');if(!bar)return;let b=$('#nv-badge');const L=nvL();if(!L.prov){if(b)b.remove();return}
  if(!b){b=document.createElement('button');b.type='button';b.id='nv-badge';b.className='btn ico nvbd';const bi=bar.querySelector('.barico');if(bi)bi.insertBefore(b,bi.firstChild);else bar.appendChild(b);
    b.onclick=async()=>{const L=nvL();if(L.renovar){try{await nvRenovar(false);await nvSincronizar(true)}catch(e){toast(e.message,'erro')}return}if(!L.k){UI.defTab='sync';go('definicoes');setTimeout(()=>{const c=$('#nv-card');if(c)c.scrollIntoView({block:'start'})},300);return}b.classList.add('gira');await nvSincronizar(true);b.classList.remove('gira')}}
  const pend=Object.keys(L.mod||{}).length>0;const est=_nvBusy?'sync':L.renovar?'renovar':!L.k?'falta':L.erro?'erro':!navigator.onLine?'offline':pend?'pend':'ok';
  const tt={sync:'A sincronizar…',renovar:'Ligação à nuvem expirada — toque para renovar',falta:'Sincronização por terminar — falta a palavra-passe',erro:'Erro na sincronização: '+(L.erro||''),offline:'Sem internet — as alterações ficam guardadas aqui e são enviadas depois',pend:'Alterações por enviar — toque para sincronizar agora',ok:'Sincronizado'+(L.ultimo?' às '+new Date(L.ultimo).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}):'')}[est];
  if(b.dataset.e!==est||b.title!==tt){b.dataset.e=est;b.title=tt;b.setAttribute('aria-label',tt);b.innerHTML=ic('cloud',19)+'<span class="nvdot"></span>'}}catch(_){}}
/* sempre a versão atual do nvBadge (por referência ficava presa à primeira: na versão com base de dados voltava a criar o botão da nuvem de 2,5 em 2,5 s) */
setInterval(()=>nvBadge(),2500);addEventListener('online',()=>nvBadge());addEventListener('offline',()=>nvBadge());
{const _gNv=go;go=function(v){const r=_gNv.apply(this,arguments);try{nvBadge()}catch(_){}return r}}
/* ao sair/esconder (iPhone/iPad ao mudar de app) envia o que estiver pendente */
addEventListener('pagehide',()=>{try{nvMarcar();const L=nvL();if(L.prov&&_nvK&&L.auto!==false&&Object.keys(L.mod||{}).length)nvSincronizar(false)}catch(_){}});
/* armazenamento persistente (o Safari não apaga os dados da app) */
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persisted().then(p=>{if(!p)navigator.storage.persist()})}catch(_){}
/* --- ligar outro dispositivo por link --- */
const nvB64u=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const nvUnB64u=s=>decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));
function nvLinkLigar(){const L=nvL();const o={p:L.prov};if(L.prov==='onedrive'&&L.msId&&L.msId!==NV_CENTRAL.ms)o.ms=L.msId;if(L.prov==='google'&&gsCfg().clientId&&gsCfg().clientId!==NV_CENTRAL.google)o.g=gsCfg().clientId;if(L.conta)o.c=L.conta;if(L.prov==='google'&&gsCfg().email)o.c=gsCfg().email;return nvRedirect()+'#ligar='+nvB64u(JSON.stringify(o))}
function nvLigarDlg(){const u=nvLinkLigar();const L=nvL();openDrawer('Ligar Outro Dispositivo',`<div class="ed">
  <p class="hint" style="margin-top:0">Abra este link no outro computador, iPad ou iPhone. A app fica logo preparada para ${esc((PROV[L.prov]||{}).n||'a nuvem')}; depois basta entrar na mesma conta e escrever a <b>mesma palavra-passe de encriptação</b>.</p>
  <div class="nvlk"><input id="nvlk-u" readonly value="${esc(u)}" data-selall></div>
  <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn pri" id="nvlk-sh">${ic('send',15)} Partilhar (AirDrop, Mail…)</button><button class="btn" id="nvlk-cp">${ic('copy',15)} Copiar Link</button></div>
  <h3 style="margin:16px 0 6px">No outro dispositivo</h3><ol class="nvst"><li>Abra o link (no iPhone/iPad, no Safari) e entre na app.</li><li>No iPhone/iPad: <b>Partilhar › Adicionar ao ecrã principal</b> — a app fica com ícone próprio e os dados ficam protegidos.</li><li>Em Definições › Segurança › Sincronização, toque em <b>${L.prov==='google'?'Ligar ao Google Drive':'Ligar ao OneDrive'}</b> e entre na mesma conta.</li><li>Escreva a mesma palavra-passe de encriptação. Os dados aparecem em segundos.</li></ol>
  <p class="hint">${ic('shield',13)} O link não contém dados nem a palavra-passe — só diz à app onde estão os seus ficheiros encriptados.</p></div>`);
  $('#nvlk-cp').onclick=async()=>{try{await navigator.clipboard.writeText(u);toast('Link copiado','ok')}catch(_){$('#nvlk-u').select();document.execCommand('copy');toast('Link copiado','ok')}};
  $('#nvlk-sh').onclick=async()=>{if(navigator.share){try{await navigator.share({title:'Ligar a EduSpruce',text:'Abra este link para ligar a EduSpruce à sincronização:',url:u})}catch(_){}}else $('#nvlk-cp').click()}}
(()=>{try{const m=(location.hash||'').match(/^#ligar=([A-Za-z0-9_-]+)/);if(!m)return;const o=JSON.parse(nvUnB64u(m[1]));history.replaceState(null,'',nvRedirect());if(!o||!PROV[o.p])return;if(((o.ms&&o.ms!==NV_CENTRAL.ms)||(o.g&&o.g!==NV_CENTRAL.google))&&!confirm('Este link quer mudar a configuração de ligação ('+PROV[o.p].n+') desta app para outro registo. Só aceite se foi o administrador da EduSpruce que lho enviou. Aceitar?'))return;
  nvSet({prov:o.p,base:null,mod:{},...(o.ms?{msId:o.ms}:{}),...(o.c&&o.p==='onedrive'?{conta:o.c}:{}),ligarPend:1});if(o.g){gsCfg().clientId=o.g}if(o.c&&o.p==='google'){gsCfg().email=o.c}try{save()}catch(_){}
  setTimeout(()=>{try{toast('Dispositivo preparado para '+PROV[o.p].n+' — ligue a conta e escreva a mesma palavra-passe','ok');if(sessaoAtual&&sessaoAtual()){UI.defTab='sync';go('definicoes')}}catch(_){}},1200)}catch(e){console.warn(e)}})();
/* --- cartão: ID central, renovar, ligar outro dispositivo --- */
{const _cN=cartaoNuvem;cartaoNuvem=function(){let h=_cN.apply(this,arguments);const L=nvL();
  if(L.renovar)h=h.replace('<p class="hint" style="margin-top:6px">',`<div class="alert w" style="margin:8px 0 0">${ic('alert',15)} A ligação a ${esc((PROV[L.prov]||{}).n||'nuvem')} expirou (a Microsoft e a Google pedem para renovar periodicamente). <button class="btn sm pri" id="nv-ren" style="margin-left:8px">Renovar Agora</button></div><p class="hint" style="margin-top:6px">`);
  if(L.prov&&L.k)h=h.replace(`<span class="sp1"></span><button class="btn sm dng" id="nv-off">`,`<span class="sp1"></span><button class="btn sm" id="nv-lig">${ic('link',13)} Ligar Outro Dispositivo</button><button class="btn sm dng" id="nv-off">`);
  return h}}
{const _bN=bindNuvem;bindNuvem=function(){const r=_bN.apply(this,arguments);try{const L=nvL();
  const cen=(L.prov==='onedrive'&&NV_CENTRAL.ms&&!L.msId)||(L.prov==='google'&&NV_CENTRAL.google&&!gsCfg().clientId);
  if(cen){const inp=$(L.prov==='onedrive'?'#nv-msid':'#nv-gid');if(inp){const box=inp.parentElement;box.innerHTML=`<label>Ligação</label><p class="mut" style="margin:4px 0 0">${ic('check',14)} Pronta a usar — basta entrar com a sua conta ${L.prov==='onedrive'?'Microsoft (da escola ou pessoal)':'Google'}.</p>`;const det=box.closest('#nv-card').querySelector('details.nvaj');if(det)det.remove()}}
  const rn=$('#nv-ren');if(rn)rn.onclick=async()=>{try{await nvRenovar(false);await nvSincronizar(true)}catch(e){toast(e.message,'erro')}};
  const lg=$('#nv-lig');if(lg)lg.onclick=nvLigarDlg;
  const gl=$('#nv-gl');if(gl)gl.onclick=async()=>{const gi=$('#nv-gid');if(gi&&gi.value.trim()){gsCfg().clientId=gi.value.trim();save()}try{await gsToken(true);toast('Google Drive ligado','ok');const c=$('#nv-card');if(c){const d=document.createElement('div');d.innerHTML=cartaoNuvem();c.replaceWith(d.firstElementChild);bindNuvem()}}catch(e){toast(e.message,'erro')}};
  }catch(e){console.warn(e)}nvBadge();return r}}

/* v0.72 · guias de configuração pormenorizados (Microsoft Entra e Google Auth Platform, nov. 2026) */
function nvGuiaMs(){const red=esc(nvRedirect()),dom=esc(location.origin);return `
<div class="nvg"><p class="nvgi">${ic('info',14)} Faz-se <b>uma vez</b>, por quem aloja a app (ou pelo informático da escola). Demora cerca de 10 minutos e é gratuito. Depois, todos os professores só têm de «Entrar com a conta».</p>
<ol class="nvgl">
<li><b>Abrir o portal.</b> Vá a <a href="https://entra.microsoft.com" target="_blank" rel="noopener">entra.microsoft.com</a> e entre com uma conta Microsoft (pode ser pessoal, ex.: @outlook.com). Se for a primeira vez, o portal cria um diretório gratuito.</li>
<li><b>Registos de aplicações.</b> No menu da esquerda: <b>Entra ID › Registos de aplicações</b> (em inglês: <i>Entra ID › App registrations</i>; em contas antigas aparece como <i>Identity › Applications › App registrations</i>). Clique em <b>+ Novo registo</b>.</li>
<li><b>Preencher o registo.</b><ul>
 <li><b>Nome:</b> <code>EduSpruce</code> (é o nome que os professores veem ao autorizar).</li>
 <li><b>Tipos de conta suportados:</b> escolha <b>«Contas em qualquer diretório organizacional (qualquer inquilino do Microsoft Entra ID — multi-inquilino) e contas Microsoft pessoais»</b>. Assim funciona com as contas da escola <i>e</i> com contas pessoais.</li>
 <li><b>URI de redirecionamento:</b> na lista escolha <b>Aplicação de página única (SPA)</b> — <u>não</u> «Web» — e escreva exatamente:<div class="nvcp"><code>${red}</code><button type="button" class="btn sm" data-nvcp="${red}">${ic('copy',12)} Copiar</button></div></li></ul>
 Clique em <b>Registar</b>.</li>
<li><b>Outros endereços da app.</b> Se a app abrir em mais do que um endereço (ex.: <code>https://eduspruce.pt/</code> <i>e</i> <code>https://eduspruce.app/</code>), vá a <b>Autenticação › Aplicação de página única › Adicionar URI</b> e acrescente cada um, <b>com a barra final</b>. Não ative «Concessão implícita».</li>
<li><b>Permissões.</b> Menu <b>Permissões de API › + Adicionar uma permissão › Microsoft Graph › Permissões delegadas</b>. Procure e marque:<ul><li><code>Files.ReadWrite.AppFolder</code> — só a pasta privada da app (<i>OneDrive › Aplicações</i>), não os outros ficheiros;</li><li><code>User.Read</code> — nome e e-mail;</li><li><code>offline_access</code> — manter a ligação sem pedir a palavra-passe a toda a hora.</li></ul>Clique em <b>Adicionar permissões</b>.</li>
<li><b>Copiar o ID.</b> Em <b>Descrição geral</b> copie o <b>ID da aplicação (cliente)</b> — um código como <code>1a2b3c4d-…</code>. <u>Não</u> é preciso «segredo do cliente».</li>
<li><b>Pôr o ID no site.</b> No GitHub, abra o ficheiro <code>eduspruce-config.json</code> › ícone do lápis › cole em <code>"microsoftClientId": "…"</code> › <b>Commit changes</b>. Em 1–2 minutos fica ativo para todos. (Para experimentar só neste dispositivo, pode colar o ID no campo acima.)</li>
</ol>
<div class="alert w" style="margin-top:10px">${ic('shield',15)} <b>Contas da escola (Microsoft 365 / edu.azores.gov.pt):</b> muitas escolas só deixam aprovar apps de <i>editores verificados</i>. Se aparecer <b>«Precisa da aprovação do administrador»</b>, peça ao administrador do Microsoft 365 do agrupamento para abrir <b>Entra ID › Aplicações empresariais › EduSpruce › Permissões › Conceder consentimento de administrador</b> (uma vez, para todos), ou para aprovar o pedido em <b>Pedidos de consentimento de administrador</b>. A app só pede acesso à sua própria pasta.</div>
<details class="nvgx"><summary>Se algo correr mal</summary><ul>
<li><b>AADSTS50011 / redirect_uri mismatch:</b> o endereço registado não é igual ao da app — confira https, a barra final e o caminho (<code>${red}</code>).</li>
<li><b>AADSTS9002326 / «Cross-origin token redemption»:</b> o endereço foi registado como «Web» em vez de «Aplicação de página única (SPA)».</li>
<li><b>AADSTS700016 / aplicação não encontrada:</b> o ID está errado ou o registo não é multi-inquilino.</li>
<li><b>«Precisa de aprovação do administrador»:</b> ver o aviso acima.</li>
<li><b>Pede para entrar todos os dias:</b> é normal — a Microsoft limita a 24 h a ligação de apps web; a EduSpruce renova sozinha ao abrir.</li></ul></details></div>`}
function nvGuiaG(){const red=esc(nvRedirect()),ori=esc(location.origin);return `
<div class="nvg"><p class="nvgi">${ic('info',14)} Faz-se <b>uma vez</b>, por quem aloja a app. Cerca de 15 minutos, gratuito, sem cartão de crédito. Serve para a sincronização com o Google Drive <i>e</i> para o botão «Entrar com Google».</p>
<ol class="nvgl">
<li><b>Projeto.</b> Em <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener">console.cloud.google.com</a> crie um projeto (ex.: <code>EduSpruce</code>) e confirme que está selecionado no topo da página.</li>
<li><b>Ativar a API do Drive.</b> <b>APIs e serviços › Biblioteca</b> › procure <b>Google Drive API</b> › <b>Ativar</b>.</li>
<li><b>Google Auth Platform.</b> Menu <b>APIs e serviços › Ecrã de consentimento OAuth</b> (agora chama-se <b>Google Auth Platform</b>) › <b>Começar</b>:<ul>
 <li><b>Informações da app:</b> nome <code>EduSpruce</code> e o seu e-mail de apoio;</li>
 <li><b>Público-alvo:</b> <b>Externo</b> (para contas de qualquer escola ou pessoais). Escolha <b>Interno</b> só se todos os professores forem do mesmo Google Workspace da escola — e nesse caso não há limite de utilizadores nem verificação;</li>
 <li><b>Contacto:</b> o seu e-mail › aceite a política › <b>Criar</b>.</li></ul></li>
<li><b>Acesso a dados (âmbitos).</b> Separador <b>Acesso a dados › Adicionar ou remover âmbitos</b> e marque: <code>openid</code>, <code>…/auth/userinfo.email</code>, <code>…/auth/userinfo.profile</code> e <code>…/auth/drive.appdata</code> (pasta privada da app no Drive — a app não vê os outros ficheiros). › <b>Atualizar</b> › <b>Guardar</b>.</li>
<li><b>Cliente OAuth.</b> Separador <b>Clientes › + Criar cliente</b>:<ul>
 <li><b>Tipo de aplicação:</b> <b>Aplicação Web</b>; nome <code>EduSpruce web</code>;</li>
 <li><b>Origens JavaScript autorizadas:</b> <div class="nvcp"><code>${ori}</code><button type="button" class="btn sm" data-nvcp="${ori}">${ic('copy',12)} Copiar</button></div></li>
 <li><b>URIs de redirecionamento autorizados:</b> <div class="nvcp"><code>${red}</code><button type="button" class="btn sm" data-nvcp="${red}">${ic('copy',12)} Copiar</button></div> (necessário no iPhone/iPad). Acrescente também os outros endereços da app, se existirem.</li></ul>
 › <b>Criar</b>. Copie o <b>ID de cliente</b> (termina em <code>.apps.googleusercontent.com</code>). O «segredo do cliente» <u>não</u> é usado — não o partilhe.</li>
<li><b>Publicar.</b> Separador <b>Público-alvo</b>: a app começa em <b>Teste</b> (só os «utilizadores de teste» que adicionar, até 100). Quando estiver tudo a funcionar, clique em <b>Publicar app</b> › estado <b>Em produção</b>. Como só usa âmbitos não sensíveis, normalmente não é precisa a verificação da Google (pode ser pedida a confirmação da marca: nome, logótipo e domínio).</li>
<li><b>Pôr o ID no site.</b> No GitHub, ficheiro <code>eduspruce-config.json</code> › lápis › cole em <code>"googleClientId": "…"</code> › <b>Commit changes</b>.</li>
</ol>
<details class="nvgx"><summary>Se algo correr mal</summary><ul>
<li><b>Erro 400: redirect_uri_mismatch:</b> o URI de redirecionamento não é igual ao da app (https, barra final, caminho): <code>${red}</code>.</li>
<li><b>Erro 400: origin_mismatch</b> ou <b>idpiframe_initialization_failed</b>: falta a origem <code>${ori}</code> em «Origens JavaScript autorizadas».</li>
<li><b>Erro 403: access_denied</b> («a app não concluiu o processo de verificação»): a app está em Teste e a conta não é utilizador de teste — adicione-a ou publique a app.</li>
<li><b>Contas do Google Workspace da escola:</b> o administrador pode ter bloqueado apps de terceiros; peça para permitir a EduSpruce em <b>admin.google.com › Segurança › Acesso e controlo de dados › Controlos de API</b>.</li>
<li><b>Pede para renovar a ligação:</b> a Google limita a 1 hora as ligações de apps web; a EduSpruce renova sozinha e, no iPhone/iPad, pode pedir um toque no ícone da nuvem. Para uso diário recomenda-se o OneDrive.</li></ul></details></div>`}
function nvGuiaDlg(qual){openDrawer('Configurar a Sincronização',`<div class="ed"><div class="seg" id="nvg-t" role="tablist"><button type="button" data-g="ms" class="${qual!=='g'?'on':''}">OneDrive (Microsoft)</button><button type="button" data-g="g" class="${qual==='g'?'on':''}">Google Drive</button></div><div id="nvg-c" style="margin-top:12px">${qual==='g'?nvGuiaG():nvGuiaMs()}</div>
  <p class="hint" style="margin-top:14px">Atualizado em novembro de 2026. Os portais da Microsoft e da Google mudam por vezes os nomes dos menus; os valores a preencher são sempre os mesmos.</p></div>`);
  const bindC=()=>$$('#drawer [data-nvcp]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.nvcp);toast('Copiado','ok')}catch(_){prompt('Copie:',b.dataset.nvcp)}});bindC();
  $$('#nvg-t [data-g]').forEach(b=>b.onclick=()=>{$$('#nvg-t [data-g]').forEach(x=>x.classList.toggle('on',x===b));$('#nvg-c').innerHTML=b.dataset.g==='g'?nvGuiaG():nvGuiaMs();bindC()})}
/* no cartão da nuvem: troca as instruções curtas pelas novas e acrescenta «Guia completo» */
{const _cG=cartaoNuvem;cartaoNuvem=function(){let h=_cG.apply(this,arguments);
  h=h.replace(/<details class="nvaj"><summary>Como obter o ID da aplicação[\s\S]*?<\/details>/,`<details class="nvaj"><summary>Como obter o ID da aplicação da Microsoft — passo a passo</summary>${nvGuiaMs()}</details>`);
  h=h.replace(/<details class="nvaj"><summary>Como obter o ID de cliente[\s\S]*?<\/details>/,`<details class="nvaj"><summary>Como obter o ID de cliente da Google — passo a passo</summary>${nvGuiaG()}</details>`);
  h=h.replace('<div class="nvprov"',`<p style="margin:8px 0 0"><button type="button" class="btn sm" id="nv-guia">${ic('help',13)} Guia de configuração (Microsoft e Google)</button></p><div class="nvprov"`);return h}}
{const _bG=bindNuvem;bindNuvem=function(){const r=_bG.apply(this,arguments);try{const g=$('#nv-guia');if(g)g.onclick=()=>nvGuiaDlg(nvL().prov==='google'?'g':'ms');$$('#nv-card [data-nvcp]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.nvcp);toast('Copiado','ok')}catch(_){prompt('Copie:',b.dataset.nvcp)}})}catch(e){console.warn(e)}return r}}
AJUDA.push({id:'nuvemcfg',ic:'shield',t:'Configurar a sincronização (Microsoft e Google) — para quem aloja a app',gif:null,txt:`<p>Abra <b>Definições › Segurança › Sincronização na Nuvem › Guia de configuração</b>: tem os passos pormenorizados do <b>Microsoft Entra</b> (OneDrive) e da <b>Google Auth Platform</b> (Google Drive e «Entrar com Google»), com os endereços desta app já preenchidos e botões para copiar.</p>`});

/* v0.72 · apresentação ao lado do ecrã de entrada */
function loginHero(){const o=$('#login');if(!o||o.classList.contains('pinmode')||o.querySelector('.lghero'))return;const L=[['clipboard','Avaliação sem papelada','Grelhas, critérios, pautas e relatórios no regular e no profissional (módulos e UFCD).'],['calendar','Sumários, horário e calendário','Aulas previstas, sumários e reuniões com convocatórias lidas do e-mail.'],['users','Direção de turma','Fichas dos alunos, contactos com o EE, atas e documentos prontos a assinar.'],['cloud','Igual em todos os aparelhos','Computador, iPad e iPhone sincronizados no seu OneDrive ou Google Drive — encriptado.']];
  o.insertAdjacentHTML('beforeend',`<aside class="lghero" aria-hidden="true"><div class="lgh-top"><div class="lgh-logo">${EF_LOGO}</div><h2>Edu<em>Spruce</em></h2></div><p class="lgh-t">Menos papelada. <b>Mais tempo para ensinar.</b></p><ul>${L.map(([i,t,d])=>`<li><span class="lgh-i">${ic(i,19)}</span><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ul><p class="lgh-f">${ic('shield',14)} Os dados dos alunos ficam encriptados no seu dispositivo · RGPD</p></aside>`)}
{const _plH=pedirLogin;pedirLogin=function(){const p=_plH.apply(this,arguments);setTimeout(loginHero,0);setTimeout(loginHero,300);return p}}
try{setTimeout(loginHero,50)}catch(_){}

/* v0.74 · Política de Privacidade e Termos de Serviço (páginas públicas) */
const LEGAL_P='privacidade.html',LEGAL_T='termos.html';
function legalLinks(cls){return `<span class="lglinks ${cls||''}"><a href="${LEGAL_P}" target="_blank" rel="noopener">${ic('shield',13)} Política de Privacidade</a><span aria-hidden="true">·</span><a href="${LEGAL_T}" target="_blank" rel="noopener">${ic('file',13)} Termos de Serviço</a></span>`}
function loginLegal(){const f=$('#login form.lgb');if(!f)return;if(f.querySelector('.lglegal'))return;f.insertAdjacentHTML('beforeend',`<details class="lgajuda" style="margin-top:10px;font-size:.86em;text-align:left"><summary style="cursor:pointer;font-weight:600">Não tem acesso?</summary><p>Só entram contas autorizadas. Peça ao administrador da EduSpruce da sua escola (quem lhe indicou a app) que autorize o e-mail com que quer entrar, em Definições › Conta e Acesso. Depois, volte a carregar em «Entrar com Google». Outras dúvidas: <a href="${LEGAL_P}#contacto" target="_blank" rel="noopener">Contacto</a>.</p></details>`);f.insertAdjacentHTML('beforeend',`<p class="lglegal">Ao entrar aceita os ${'<a href="'+LEGAL_T+'" target="_blank" rel="noopener">Termos de Serviço</a>'} e a ${'<a href="'+LEGAL_P+'" target="_blank" rel="noopener">Política de Privacidade</a>'}.</p><p class="lgacores" style="margin:6px 0 0;font-size:.8em;font-weight:600;opacity:.8;text-align:center">Orgulhosamente feito nos Açores</p>`)}
{const _plL=pedirLogin;pedirLogin=function(){const p=_plL.apply(this,arguments);setTimeout(loginLegal,0);setTimeout(loginLegal,300);return p}}
try{setTimeout(loginLegal,60)}catch(_){}
/* rodapé da barra lateral e Ajuda */
function legalSide(){const v=$('#side .ver');if(!v||$('#side .verlegal'))return;v.insertAdjacentHTML('afterend',`<div class="verlegal"><a href="${LEGAL_P}" target="_blank" rel="noopener">Privacidade</a> · <a href="${LEGAL_T}" target="_blank" rel="noopener">Termos</a><br><span class="veracores">Orgulhosamente feito nos Açores</span></div>`)}
{const _gLe=go;go=function(v){const r=_gLe.apply(this,arguments);try{legalSide()}catch(_){}return r}}try{legalSide()}catch(_){}
AJUDA.push({id:'legal',ic:'shield',t:'Política de Privacidade e Termos de Serviço',gif:null,txt:`<p>Os documentos públicos da EduSpruce explicam que dados são tratados, onde ficam (no dispositivo e, se quiser, encriptados na sua nuvem), os papéis no RGPD (o professor e a escola são os responsáveis pelo tratamento) e as regras de utilização.</p><p>${legalLinks()}</p>`});

/* v0.83 · «Entrar com Microsoft 365» aparece como «em breve» enquanto não houver ID da Microsoft */
function msEmBreve(){const b=$('#lg-ms');if(!b)return;let A_=null;try{A_=S.cfg.auth}catch(_){}const tem=!!((A_&&A_.ms&&A_.ms.clientId)||NV_CENTRAL.ms);
  if(tem){if(b.dataset.eb){b.removeAttribute('aria-disabled');b.disabled=false;const m=b.querySelector('.lgeb');if(m)m.remove();delete b.dataset.eb}return}
  b.setAttribute('aria-disabled','true');b.disabled=true;b.dataset.eb=1;b.title='Disponível em breve';b.querySelectorAll('.mut').forEach(x=>x.remove());if(!b.querySelector('.lgeb'))b.insertAdjacentHTML('beforeend',' <span class="lgeb">em breve</span>')}
{const _plE=pedirLogin;pedirLogin=function(){const p=_plE.apply(this,arguments);[0,60,400,1200,2500].forEach(t=>setTimeout(msEmBreve,t));return p}}
[100,500,1500,3000].forEach(t=>setTimeout(()=>{try{msEmBreve()}catch(_){}},t));

