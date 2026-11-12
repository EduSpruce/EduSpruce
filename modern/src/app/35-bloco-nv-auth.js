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
setInterval(nvBadge,2500);addEventListener('online',nvBadge);addEventListener('offline',nvBadge);
{const _gNv=go;go=function(v){const r=_gNv.apply(this,arguments);try{nvBadge()}catch(_){}return r}}
/* ao sair/esconder (iPhone/iPad ao mudar de app) envia o que estiver pendente */
addEventListener('pagehide',()=>{try{const L=nvL();if(L.prov&&_nvK&&L.auto!==false&&Object.keys(L.mod||{}).length)nvSincronizar(false)}catch(_){}});
/* armazenamento persistente (o Safari não apaga os dados da app) */
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persisted().then(p=>{if(!p)navigator.storage.persist()})}catch(_){}
/* --- ligar outro dispositivo por link --- */
const nvB64u=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const nvUnB64u=s=>decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));
function nvLinkLigar(){const L=nvL();const o={p:L.prov};if(L.prov==='onedrive'&&L.msId&&L.msId!==NV_CENTRAL.ms)o.ms=L.msId;if(L.prov==='google'&&gsCfg().clientId&&gsCfg().clientId!==NV_CENTRAL.google)o.g=gsCfg().clientId;if(L.conta)o.c=L.conta;if(L.prov==='google'&&gsCfg().email)o.c=gsCfg().email;return nvRedirect()+'#ligar='+nvB64u(JSON.stringify(o))}
function nvLigarDlg(){const u=nvLinkLigar();const L=nvL();openDrawer('Ligar Outro Dispositivo',`<div class="ed">
  <p class="hint" style="margin-top:0">Abra este link no outro computador, iPad ou iPhone. A app fica logo preparada para ${esc((PROV[L.prov]||{}).n||'a nuvem')}; depois basta entrar na mesma conta e escrever a <b>mesma palavra-passe de encriptação</b>.</p>
  <div class="nvlk"><input id="nvlk-u" readonly value="${esc(u)}" onclick="this.select()"></div>
  <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn pri" id="nvlk-sh">${ic('send',15)} Partilhar (AirDrop, Mail…)</button><button class="btn" id="nvlk-cp">${ic('copy',15)} Copiar Link</button></div>
  <h3 style="margin:16px 0 6px">No outro dispositivo</h3><ol class="nvst"><li>Abra o link (no iPhone/iPad, no Safari) e entre na app.</li><li>No iPhone/iPad: <b>Partilhar › Adicionar ao ecrã principal</b> — a app fica com ícone próprio e os dados ficam protegidos.</li><li>Em Definições › Dados e Segurança › Sincronização, toque em <b>${L.prov==='google'?'Ligar ao Google Drive':'Ligar ao OneDrive'}</b> e entre na mesma conta.</li><li>Escreva a mesma palavra-passe de encriptação. Os dados aparecem em segundos.</li></ol>
  <p class="hint">${ic('shield',13)} O link não contém dados nem a palavra-passe — só diz à app onde estão os seus ficheiros encriptados.</p></div>`);
  $('#nvlk-cp').onclick=async()=>{try{await navigator.clipboard.writeText(u);toast('Link copiado','ok')}catch(_){$('#nvlk-u').select();document.execCommand('copy');toast('Link copiado','ok')}};
  $('#nvlk-sh').onclick=async()=>{if(navigator.share){try{await navigator.share({title:'Ligar a EduSpruce',text:'Abra este link para ligar a EduSpruce à sincronização:',url:u})}catch(_){}}else $('#nvlk-cp').click()}}
(()=>{try{const m=(location.hash||'').match(/^#ligar=([A-Za-z0-9_-]+)/);if(!m)return;const o=JSON.parse(nvUnB64u(m[1]));history.replaceState(null,'',nvRedirect());if(!o||!PROV[o.p])return;
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
AJUDA.push({id:'nuvemcfg',ic:'shield',t:'Configurar a sincronização (Microsoft e Google) — para quem aloja a app',gif:null,txt:`<p>Abra <b>Definições › Dados e Segurança › Sincronização na Nuvem › Guia de configuração</b>: tem os passos pormenorizados do <b>Microsoft Entra</b> (OneDrive) e da <b>Google Auth Platform</b> (Google Drive e «Entrar com Google»), com os endereços desta app já preenchidos e botões para copiar.</p>`});

/* v0.72 · apresentação ao lado do ecrã de entrada */
function loginHero(){const o=$('#login');if(!o||o.classList.contains('pinmode')||o.querySelector('.lghero'))return;const L=[['clipboard','Avaliação sem papelada','Grelhas, critérios, pautas e relatórios no regular e no profissional (módulos e UFCD).'],['calendar','Sumários, horário e calendário','Aulas previstas, sumários e reuniões com convocatórias lidas do e-mail.'],['users','Direção de turma','Fichas dos alunos, contactos com o EE, atas e documentos prontos a assinar.'],['cloud','Igual em todos os aparelhos','Computador, iPad e iPhone sincronizados no seu OneDrive ou Google Drive — encriptado.']];
  o.insertAdjacentHTML('beforeend',`<aside class="lghero" aria-hidden="true"><div class="lgh-top"><div class="lgh-logo">${EF_LOGO}</div><h2>Edu<em>Spruce</em></h2></div><p class="lgh-t">Menos papelada. <b>Mais tempo para ensinar.</b></p><ul>${L.map(([i,t,d])=>`<li><span class="lgh-i">${ic(i,19)}</span><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ul><p class="lgh-f">${ic('shield',14)} Os dados dos alunos ficam encriptados no seu dispositivo · RGPD</p></aside>`)}
{const _plH=pedirLogin;pedirLogin=function(){const p=_plH.apply(this,arguments);setTimeout(loginHero,0);setTimeout(loginHero,300);return p}}
try{setTimeout(loginHero,50)}catch(_){}

/* v0.74 · Política de Privacidade e Termos de Serviço (páginas públicas) */
const LEGAL_P='privacidade.html',LEGAL_T='termos.html';
function legalLinks(cls){return `<span class="lglinks ${cls||''}"><a href="${LEGAL_P}" target="_blank" rel="noopener">${ic('shield',13)} Política de Privacidade</a><span aria-hidden="true">·</span><a href="${LEGAL_T}" target="_blank" rel="noopener">${ic('file',13)} Termos de Serviço</a></span>`}
function loginLegal(){const f=$('#login form.lgb');if(!f)return;const nb=f.querySelector('.lgh b');if(nb&&!nb.querySelector('.lgver'))nb.insertAdjacentHTML('beforeend',`<span class="lgver" title="Versão da app">v${VERSAO}</span>`);if(f.querySelector('.lglegal'))return;f.insertAdjacentHTML('beforeend',`<p class="lglegal">Ao entrar aceita os ${'<a href="'+LEGAL_T+'" target="_blank" rel="noopener">Termos de Serviço</a>'} e a ${'<a href="'+LEGAL_P+'" target="_blank" rel="noopener">Política de Privacidade</a>'}.</p>`)}
{const _plL=pedirLogin;pedirLogin=function(){const p=_plL.apply(this,arguments);setTimeout(loginLegal,0);setTimeout(loginLegal,300);return p}}
try{setTimeout(loginLegal,60)}catch(_){}
/* rodapé da barra lateral e Ajuda */
function legalSide(){const v=$('#side .ver');if(!v||$('#side .verlegal'))return;v.insertAdjacentHTML('afterend',`<div class="verlegal"><a href="${LEGAL_P}" target="_blank" rel="noopener">Privacidade</a> · <a href="${LEGAL_T}" target="_blank" rel="noopener">Termos</a></div>`)}
{const _gLe=go;go=function(v){const r=_gLe.apply(this,arguments);try{legalSide()}catch(_){}return r}}try{legalSide()}catch(_){}
AJUDA.push({id:'legal',ic:'shield',t:'Política de Privacidade e Termos de Serviço',gif:null,txt:`<p>Os documentos públicos da EduSpruce explicam que dados são tratados, onde ficam (no dispositivo e, se quiser, encriptados na sua nuvem), os papéis no RGPD (o professor e a escola são os responsáveis pelo tratamento) e as regras de utilização.</p><p>${legalLinks()}</p>`});

/* v0.83 · «Entrar com Microsoft 365» aparece como «em breve» enquanto não houver ID da Microsoft */
function msEmBreve(){const b=$('#lg-ms');if(!b)return;let A_=null;try{A_=S.cfg.auth}catch(_){}const tem=!!((A_&&A_.ms&&A_.ms.clientId)||NV_CENTRAL.ms);
  if(tem){if(b.dataset.eb){b.removeAttribute('aria-disabled');b.disabled=false;const m=b.querySelector('.lgeb');if(m)m.remove();delete b.dataset.eb}return}
  b.setAttribute('aria-disabled','true');b.disabled=true;b.dataset.eb=1;b.title='Disponível em breve';b.querySelectorAll('.mut').forEach(x=>x.remove());if(!b.querySelector('.lgeb'))b.insertAdjacentHTML('beforeend',' <span class="lgeb">em breve</span>')}
{const _plE=pedirLogin;pedirLogin=function(){const p=_plE.apply(this,arguments);[0,60,400,1200,2500].forEach(t=>setTimeout(msEmBreve,t));return p}}
[100,500,1500,3000].forEach(t=>setTimeout(()=>{try{msEmBreve()}catch(_){}},t));

/* =====================================================================
   v0.84 · Definições › Sincronização (separador próprio, painel redesenhado)
   ===================================================================== */
const nvLigado=()=>{const L=nvL();if(L.prov==='google')return !!(nvGId()&&(nvGTok()||gsCfg().email||(L.g&&L.g.t)));if(L.prov==='onedrive')return !!L.ms;return false};
const nvQuando=q=>{if(!q)return 'nunca';const s=Math.round((Date.now()-q)/1000);if(s<45)return 'agora mesmo';if(s<3600)return 'há '+Math.round(s/60)+' min';if(s<86400)return 'há '+Math.round(s/3600)+' h';return new Date(q).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'})};
const NV_LOGO={google:'<svg width="26" height="26" viewBox="0 0 87.3 78" aria-hidden="true"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5A9 9 0 0 0 0 53h27.5z" fill="#00ac47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" fill="#ea4335"/><path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/><path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/><path d="M73.4 26.5L60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/></svg>',
 onedrive:'<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.1 8.6a5.4 5.4 0 0 1 9.2 2.6A3.9 3.9 0 0 1 19 19H8.5z" fill="#0364b8"/><path d="M10.1 8.6 8.5 19H5a4 4 0 0 1-.6-7.95 5.5 5.5 0 0 1 5.7-2.45z" fill="#0078d4"/><path d="M19.3 11.2A3.9 3.9 0 0 1 19 19H8.5l5.9-6.6a5 5 0 0 1 4.9-1.2z" fill="#1490df"/><path d="M14.4 12.4 8.5 19H5a4 4 0 0 1-3.1-6.5z" fill="#28a8ea"/></svg>'};

function nvAjudaBloq(){const saf=nvSafari()||nvIOS();return `<div class="alert w nvbloq">${ic('shield',16)}<div><b>A ligação ao Google Drive está a ser bloqueada neste navegador.</b><ol>
 <li>Desligue o <b>bloqueador de publicidade/conteúdos</b> para <b>eduspruce.pt</b> (uBlock, AdBlock, AdGuard, Ghostery, Privacy Badger…).${saf?' No Safari: <b>Safari › Definições › Extensões</b> (Mac) ou <b>Definições › Apps › Safari › Extensões</b> (iPhone/iPad) e desative os bloqueadores de conteúdos, ou toque em «aA» › <i>Desativar bloqueadores de conteúdos</i>.':''}</li>
 <li>Se estiver na rede da escola, experimente outra rede (por ex. os dados do telemóvel) — alguns filtros bloqueiam o Google Drive.</li>
 <li>Recarregue a página e volte a tentar.</li></ol></div></div>`}
function nvPainel(){const L=nvL();const prov=PROV[L.prov];const lig=nvLigado();const ativa=lig&&!!L.k;const msOk=!!(L.msId||NV_CENTRAL.ms);const C=nvConflitos();const https=nvHttps();
  const conta=L.prov==='google'?(gsCfg().email||''):(L.conta||'');const pend=Object.keys(L.mod||{}).length;
  const est=!L.prov?['off','Desligada','Escolha onde guardar os dados para os ter em todos os aparelhos.']:L.renovar?['ren','Ligação a renovar','A '+(prov?prov.n:'nuvem')+' pede para renovar a ligação de vez em quando.']:!lig?['off','Por ligar','Entre na sua conta '+(L.prov==='google'?'Google':'Microsoft')+'.']:!L.k?['off','Falta a palavra-passe','Defina a palavra-passe de encriptação para começar.']:L.erro&&!/renovad/.test(L.erro)?['err','Com erro',L.erro]:!navigator.onLine?['off','Sem internet','As alterações ficam guardadas aqui e seguem quando a ligação voltar.']:pend?['pend','Alterações por enviar','Vão ser enviadas dentro de segundos.']:['ok','Sincronizada','Última sincronização '+nvQuando(L.ultimo)+'.'];
  const sec=(t,d,c)=>`<section class="nvs"><div class="nvsh"><h3>${t}</h3>${d?`<p>${d}</p>`:''}</div><div class="nvsb">${c}</div></section>`;
  const tile=(k,n,d,dis)=>`<button type="button" class="nvt ${L.prov===k?'on':''}" data-nvp2="${k}" ${dis?'disabled aria-disabled="true"':''} role="radio" aria-checked="${L.prov===k}"><span class="nvtl">${NV_LOGO[k]}</span><span class="nvtt"><b>${n}</b><span>${d}</span></span>${dis?'<span class="nvtb">em breve</span>':L.prov===k?`<span class="nvtk">${ic('check',14)}</span>`:''}</button>`;
  return `<div class="nvpw2" id="nv-card">
  <div class="card nvhero nvst-${est[0]}"><div class="nvhi">${ic('cloud',30)}</div><div class="nvht"><div class="nvhk">Sincronização na Nuvem</div><h2>${est[1]}</h2><p>${esc(est[2])}</p>
    ${ativa?`<div class="nvhm"><span>${NV_LOGO[L.prov]||''} ${esc(prov.n)}</span>${conta?`<span>${ic('user',13)} ${esc(conta)}</span>`:''}<span>${ic('shield',13)} Encriptado (AES-256)</span><span>${ic('clock',13)} ${esc(nvQuando(L.ultimo))}</span></div>`:''}</div>
    <div class="nvha">${ativa?`<button class="btn pri" id="nv2-agora">${ic('refresh',15)} Sincronizar Agora</button>`:L.prov==='google'&&!L.k?`<button class="btn pri" id="nv2-assist">${ic('sparkle',15)} Configurar em 3 Passos</button>`:''}${L.renovar?`<button class="btn pri" id="nv2-ren">${ic('refresh',15)} Renovar Ligação</button>`:''}</div></div>
  ${/Não foi possível contactar|Failed to fetch|Load failed/i.test(L.erro||'')?nvAjudaBloq():''}
  ${!https?`<div class="alert w">${ic('alert',15)} A sincronização só funciona com a app num endereço <b>https</b> (como eduspruce.pt). Aberta como ficheiro no computador não está disponível.</div>`:''}
  <div class="card nvbody">
  ${sec('Onde guardar','Os ficheiros ficam na pasta privada da app na sua conta — a app não vê os seus outros ficheiros.',`<div class="nvts" role="radiogroup" aria-label="Onde guardar">${tile('google','Google Drive','Conta Google (pessoal ou da escola)',false)}${tile('onedrive','OneDrive','Conta Microsoft 365 ou pessoal',!msOk&&L.prov!=='onedrive')}</div>`)}
  ${L.prov?sec('Conta',L.prov==='google'?'A ligação à Google renova-se sozinha.':'A ligação à Microsoft dura um dia e renova-se ao abrir a app.',`<div class="nvrow"><div class="nvrt">${lig?`${ic('check',15)} <b>${esc(conta||'Ligada')}</b>`:`<span class="mut">Ainda não ligada</span>`}</div><button class="btn ${lig?'':'pri'}" id="nv2-lig">${ic('link',15)} ${lig?'Voltar a Ligar':(L.prov==='google'?'Ligar ao Google Drive':'Ligar ao OneDrive')}</button></div>`):''}
  ${L.prov?sec('Palavra-passe de encriptação','Tudo é encriptado neste aparelho antes de sair. Sem esta palavra-passe ninguém — nem a EduSpruce — consegue abrir os dados.',L.k?`<div class="nvrow"><div class="nvrt">${ic('check',15)} <b>Definida neste aparelho</b> <span class="mut">· use a mesma nos outros</span></div><button class="btn" id="nv2-pwm">Esquecer Neste Aparelho</button></div>`:
    `<form class="nvpwf" id="nv2-pwf" autocomplete="on" action="#"><input type="text" name="username" autocomplete="username" value="${esc(conta)}" hidden readonly><input type="password" id="nv2-p1" autocomplete="new-password" placeholder="Código numérico (mín. 8 algarismos)"><input type="password" id="nv2-p2" autocomplete="new-password" placeholder="Repetir (se for nova)"><button type="submit" class="btn pri" id="nv2-pwok">${ic('shield',15)} Guardar e Sincronizar</button></form><p class="nvhint">Se já usa a EduSpruce noutro aparelho, escreva a mesma palavra-passe (basta uma vez).</p>`):''}
  ${L.prov&&L.k?sec('Automático','',`<label class="nvsw"><input type="checkbox" id="nv2-auto" ${L.auto!==false?'checked':''}><span class="nvswk" aria-hidden="true"></span><span><b>Sincronizar sozinha</b><small>6 s depois de cada alteração, a cada minuto com a app aberta, ao abrir, ao voltar e ao sair.</small></span></label>`):''}
  ${L.prov&&L.k?sec('Aparelhos','',`<div class="nvrow"><div class="nvrt">Este aparelho: <b>${esc(nvDisp())}</b></div><div class="nvbtns"><button class="btn" id="nv2-outro">${ic('link',15)} Ligar Outro Aparelho</button><button class="btn dng" id="nv2-off">${ic('x',14)} Desligar Este</button></div></div>`):''}
  ${C.length?sec('Versões guardadas de conflitos','Quando a mesma parte muda em dois aparelhos fica a mais recente; a outra fica aqui.',C.map((c,i)=>`<div class="nvrow nvcf"><div class="nvrt"><b>${esc(nvRotulo(c.parte))}</b> <span class="mut">· ${esc(c.de)} · ${new Date(c.q).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'})}</span></div><div class="nvbtns"><button class="btn sm" data-nvrep2="${i}">Repor</button><button class="btn sm ico" data-nvdel2="${i}" aria-label="Descartar">${ic('x',12)}</button></div></div>`).join('')):''}
  <div class="nvfoot"><button class="btn sm" id="nv2-guia">${ic('help',13)} Guia de configuração</button><span class="mut">Microsoft e Google guardam só ficheiros ilegíveis · <a href="privacidade.html" target="_blank" rel="noopener">Privacidade</a></span></div>
  </div></div>`}
function bindNvPainel(){const re=()=>{const c=$('#nv-card');if(!c)return;const d=document.createElement('div');d.innerHTML=nvPainel();c.replaceWith(d.firstElementChild);bindNvPainel()};
  $$('[data-nvp2]').forEach(b=>b.onclick=()=>{if(b.disabled)return;nvSet({prov:b.dataset.nvp2,base:null,mod:{},erro:''});PROV.google._ids=null;re()});
  const lg=$('#nv2-lig');if(lg)lg.onclick=async()=>{try{if(nvL().prov==='google'){await gsToken(true)}else{await msLigar()}toast('Conta ligada','ok');if(nvL().k)await nvSincronizar(true);re()}catch(e){toast(e.message,'erro')}};
  const f=$('#nv2-pwf');if(f){f.onsubmit=async e=>{e.preventDefault();const a=$('#nv2-p1').value,b=$('#nv2-p2').value;{const _e=nvPinErro(a,'nv2-p1',!!b);if(_e)return toast(_e,'erro')}if(b&&a!==b)return toast('As palavras-passe não coincidem.','erro');const bt=$('#nv2-pwok');bt.disabled=true;
    try{const exist=await nvDefinirPalavra(a);if(!exist&&a!==b){_nvK=null;nvSet({k:null});bt.disabled=false;return toast('É uma palavra-passe nova: escreva-a também em «Repetir».','erro')}toast(exist?'Palavra-passe confirmada — a receber os dados…':'A encriptar e enviar os dados…','ok');await nvSincronizar(true)}catch(e2){toast(e2.message,'erro')}bt.disabled=false;re()}}
  const pm=$('#nv2-pwm');if(pm)pm.onclick=()=>{if(!confirm('Esquecer a palavra-passe neste aparelho? Terá de a escrever outra vez para sincronizar.'))return;_nvK=null;nvSet({k:null});re()};
  const ag=$('#nv2-agora');if(ag)ag.onclick=async()=>{ag.disabled=true;ag.classList.add('gira');await nvSincronizar(true);re()};
  const as=$('#nv2-assist');if(as)as.onclick=()=>nvAssist(true);
  const rn=$('#nv2-ren');if(rn)rn.onclick=async()=>{try{await nvRenovar(false);await nvSincronizar(true);re()}catch(e){toast(e.message,'erro')}};
  const au=$('#nv2-auto');if(au)au.onchange=()=>{nvSet({auto:au.checked});toast(au.checked?'Sincronização automática ligada':'Sincronização automática desligada','ok')};
  const ou=$('#nv2-outro');if(ou)ou.onclick=nvLigarDlg;
  const of=$('#nv2-off');if(of)of.onclick=()=>{if(!confirm('Desligar a sincronização neste aparelho? Os dados ficam aqui e na nuvem.'))return;_nvK=null;localStorage.removeItem(NV_KEY);re()};
  const gu=$('#nv2-guia');if(gu)gu.onclick=()=>nvGuiaDlg(nvL().prov==='onedrive'?'ms':'g');
  $$('[data-nvrep2]').forEach(b=>b.onclick=()=>{const C=nvConflitos();const c=C[+b.dataset.nvrep2];if(!c||!confirm('Repor a versão de '+c.de+' de '+nvRotulo(c.parte)+'? A versão atual passa para esta lista.'))return;const P=nvPartes();if(P[c.parte]!==undefined)nvGuardaConflito(c.parte,P[c.parte],'antes de repor');P[c.parte]=c.dados;S=migrate(nvMontar(P));saveNow();localStorage.setItem(NV_CONF,JSON.stringify(nvConflitos().filter(x=>x.q!==c.q)));toast('Versão reposta','ok');re()});
  $$('[data-nvdel2]').forEach(b=>b.onclick=()=>{const C=nvConflitos();C.splice(+b.dataset.nvdel2,1);localStorage.setItem(NV_CONF,JSON.stringify(C));re()});
  clearInterval(bindNvPainel._t);bindNvPainel._t=setInterval(()=>{if(!$('#nv-card.nvpw2')){clearInterval(bindNvPainel._t);return}if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#nv-card'))return;re()},15000)}
function defSync(){return nvPainel()}
function bindSync(){bindNvPainel()}
/* em Dados e Segurança fica só um atalho */
{const _cSG=cartaoSyncGoogle;cartaoSyncGoogle=function(){const L=nvL();return `<div class="card nvatalho"><div class="row" style="gap:12px;align-items:center;flex-wrap:wrap"><span class="nvai">${ic('cloud',22)}</span><div style="flex:1;min-width:200px"><b>Sincronização na Nuvem</b><div class="mut" style="font-size:13.5px">${nvLigado()&&L.k?'Ativa · '+esc((PROV[L.prov]||{}).n||'')+' · '+esc(nvQuando(L.ultimo)):'Os mesmos dados no computador, no iPad e no iPhone.'}</div></div><button class="btn" data-dt2="sync">${ic('cloud',15)} Abrir Sincronização</button></div></div>`}}
{const _bDS=bindDados;bindDados=function(){let r;try{r=_bDS.apply(this,arguments)}catch(e){console.warn(e)}$$('.nvatalho [data-dt2]').forEach(b=>b.onclick=()=>{UI.defTab='sync';vDefinicoes()});return r}}

/* Google Drive: ficheiros grandes (> 4 MB, ex.: documentos importados) por envio retomável */
{const gd=PROV.google;const _escG=gd.escrever.bind(gd);
  gd.escrever=async function(n,txt){if(String(txt).length<4*1024*1024)return _escG(n,txt);const m=await this._mapa();const f=m[n];
    const ini=await gsFetch(f?'https://www.googleapis.com/upload/drive/v3/files/'+f.id+'?uploadType=resumable':'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id',{method:f?'PATCH':'POST',headers:{'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'text/plain'},body:JSON.stringify(f?{}:{name:n,parents:['appDataFolder']})});
    const loc=ini.headers.get('Location')||ini.headers.get('location');if(!loc)throw new Error('Google Drive: não foi possível iniciar o envio de um ficheiro grande.');
    const r=await nvFetchRetry(loc,{method:'PUT',headers:{'Content-Type':'text/plain'},body:txt},2);if(!r.ok)throw new Error('Google Drive: erro '+r.status+' ao enviar um ficheiro grande');
    if(!f){try{const j=await r.json();m[n]={id:j.id,s:txt.length}}catch(_){this._ids=null}}}}
/* erros de rede: tentativas rápidas e mensagem com o serviço e o erro exatos */
nvFetchRetry=async function(url,opt,n){n=n==null?3:n;let host='',cam='';try{const u=new URL(url);host=u.host;cam=u.pathname.split('/').slice(0,4).join('/')}catch(_){}let ult=null;
  for(let i=0;i<=n;i++){try{const r=await fetch(url,opt);if((r.status===429||r.status>=500&&r.status!==501)&&i<n){const ra=+r.headers.get('Retry-After');await nvEspera(ra?Math.min(ra,10)*1000:500*2**i);continue}return r}
    catch(e){ult=e;window.__nvRedeErro={host,cam,msg:String(e&&e.message||e),q:Date.now(),online:navigator.onLine};console.warn('[EduSpruce] rede',host+cam,e);if(i<n)await nvEspera(500*2**i)}}
  throw new Error(!navigator.onLine?'Sem ligação à internet — a sincronização volta a tentar sozinha.':'Não foi possível contactar '+host+' ('+String(ult&&ult.message||ult)+'). Quase sempre é um bloqueador de publicidade ou de conteúdos: desligue-o para eduspruce.pt (uBlock, AdBlock, AdGuard, Ghostery, Privacy Badger ou os «Bloqueadores de conteúdos» do Safari) e tente de novo. Também pode ser um filtro da rede da escola.')};

/* v0.88 · o perfil do professor é preenchido com os dados da conta Google (só o que estiver vazio) */
function gPerfilPreencher(j,email){if(!j)return;const p=perfil();let m=false;
  if(j.name&&!S.cfg.professor){S.cfg.professor=j.name;m=true}
  if(email&&!p.emailPessoal&&!/\.(edu|gov)\./i.test(email)){p.emailPessoal=email;m=true}
  if(j.picture&&!p.foto){const url=String(j.picture).replace(/=s\d+-c$/,'=s256-c');p.foto=url;m=true;
    fetch(url).then(r=>r.ok?r.blob():null).then(b=>{if(!b)return;const fr=new FileReader();fr.onload=()=>{if(perfil().foto===url){perfil().foto=fr.result;save();try{go(VIEW)}catch(_){}}};fr.readAsDataURL(b)}).catch(()=>{})}
  if(m){save();try{toast('Perfil preenchido com a sua conta Google — pode completá-lo em Definições › Professor','ok')}catch(_){}}}
/* na barra lateral, mostrar o nome em vez do e-mail */
{const _gNm=go;go=function(v){const r=_gNm.apply(this,arguments);try{if(SESSAO&&SESSAO.tipo==='google'&&S.cfg.professor&&SESSAO.nome!==S.cfg.professor&&(!SESSAO.nome||SESSAO.nome.includes('@'))){SESSAO.nome=S.cfg.professor;guardarSessao(SESSAO,!!localStorage.getItem(SESS_KEY))}}catch(_){}return r}}

/* v0.88 · barra lateral: o nome do professor (quando definido) em vez do e-mail; atualiza ao escrever */
const nomeCurto=n=>{const w=String(n||'').trim().split(/\s+/).filter(Boolean);return w.length>2?w[0]+' '+w[w.length-1]:w.join(' ')};
{const _sbN=sessBox;sessBox=function(){const r=_sbN.apply(this,arguments);try{const s=SESSAO;const b=$('#sessBox .snm b');if(s&&b&&(s.tipo==='google'||s.tipo==='ms'||s.papel==='professor')&&S.cfg.professor){const n=nomeCurto(S.cfg.professor);if(b.textContent!==n){b.textContent=n;b.title=S.cfg.professor}const av=$('#sessBox .sav:not(.fotosav)');if(av&&!perfil().foto)av.textContent=n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}}catch(_){}return r}}
document.addEventListener('input',e=>{try{if(e.target&&e.target.matches&&e.target.matches('[data-pf="professor"]')){S.cfg.professor=e.target.value;clearTimeout(sessBox._t);sessBox._t=setTimeout(()=>{try{sessBox()}catch(_){}},150)}}catch(_){}},true);

/* v0.90 · Ajuda atualizada + Manual em PDF */
const MANUAL_URL=(location.protocol==='file:'?'https://eduspruce.pt/':'')+'manual/EduSpruce-Manual.pdf';
function ajudaAtualizar(){
  if(AJUDA._v90)return;AJUDA._v90=1;
  const set=(id,o)=>{const x=AJUDA.find(s=>s.id===id);if(x)Object.assign(x,o)};
  const del=id=>{const i=AJUDA.findIndex(s=>s.id===id);if(i>=0)AJUDA.splice(i,1)};
  const mn=t=>`<span class="ajmn">${t}</span>`;
  set('comecar',{txt:`<p><b>1. Entrar.</b> No ecrã de entrada toque em <b>Entrar com Google</b> (conta da escola ou pessoal). Na primeira vez abre um assistente em 3 passos: conta ligada › palavra-passe de encriptação › sincronizar. A partir daí os dados ficam iguais em todos os seus aparelhos. Também pode usar uma <b>conta local</b> (utilizador e palavra-passe criados na app); «Entrar com Microsoft 365» está <i>em breve</i>.</p>
  <p><b>2. Configurar.</b> O EduSpruce organiza-se em <b>Escola → Ano letivo → Turmas</b>:</p>
  <ol><li><b>Escola</b>: nome, agrupamento, concelho e o <b>logotipo</b> (aparece no Início, relatórios e PDF).</li>
  <li><b>Definições › Professor</b>: o seu nome completo (é o que permite reconhecer as suas aulas nos horários), género, grupo e disciplinas por ciclo. Ao entrar com Google, o nome, o e-mail e a fotografia já vêm preenchidos.</li>
  <li><b>Ano Letivo e Turmas</b>: crie o ano letivo (3 períodos ou 2 semestres) e as turmas — à mão ou a partir do Excel do programa da escola.</li>
  <li><b>Calendário Escolar</b>: importe o PDF do calendário.</li>
  <li><b>O Meu Horário</b>: importe o PDF do seu horário.</li></ol>
  <p>O Início mostra «Primeiros passos» até tudo estar configurado. Para experimentar sem dados reais, escolha <b>Demonstração</b> no seletor do ano letivo. O <a href="${MANUAL_URL}" target="_blank" rel="noopener">manual completo em PDF</a> explica tudo com imagens.</p>`});
  set('sessao',{t:'Sessão, Contas e Integridade dos Dados',txt:`<p>Entre com <b>Google</b> ou com uma <b>conta local</b>. «Manter a sessão iniciada neste dispositivo» evita voltar a entrar (não marque num computador partilhado). Em ${mn('Definições › Conta e Acesso')} pode criar contas, mudar palavras-passe, limitar «Entrar com Google» a um domínio (ex.: o da escola), definir o código de acesso e terminar a sessão. A entrada com <b>Microsoft 365</b> aparece como «em breve» e fica ativa sozinha quando o site tiver o ID da Microsoft.</p>
  <p><b>Integridade dos Dados</b> (Definições › Geral) verifica ligações partidas, identificadores repetidos, períodos inexistentes, datas inválidas, ponderações e fotografias, e corrige o que for seguro. Também corre ao abrir a app.</p>`});
  set('dados',{txt:`<p>Os dados ficam <b>no dispositivo</b> e — com a sincronização ligada — também na <b>sua</b> conta Google Drive (ou OneDrive), encriptados antes de saírem. A EduSpruce não tem servidores com dados de alunos.</p>
  <ul><li>Em ${mn('Definições › Dados e Segurança')} exporte a <b>cópia completa</b> (JSON, com fotografias e documentos) ou uma <b>cópia encriptada</b> e guarde-a fora do aparelho; para mudar de dispositivo sem sincronização, importe essa cópia.</li>
  <li>As cópias têm dados pessoais de alunos: guarde-as num local seguro e nunca as publique.</li></ul>
  <p class="mut">No iPhone/iPad o Safari pode apagar dados de sites que não abre há 7 dias: use a app a partir do ecrã principal e ligue a sincronização.</p>`});
  del('gsync');
  set('nuvem',{txt:`<p>Em ${mn('Definições › Sincronização')} vê o estado (sincronizada, por enviar, a renovar, erro), escolhe <b>Google Drive</b> ou OneDrive (em breve), a conta, a palavra-passe de encriptação, o interruptor «Sincronizar sozinha» e «Ligar Outro Dispositivo».</p>
  <ul><li><b>Encriptação no dispositivo</b> (AES-256-GCM): a Google ou a Microsoft só guardam ficheiros ilegíveis. Sem a palavra-passe ninguém os abre — nem a EduSpruce.</li>
  <li>Os dados ficam numa <b>pasta privada e escondida</b> da app no Drive (não aparece na lista de ficheiros; vê-se em drive.google.com › Definições › Gerir apps).</li>
  <li>Dividida por partes (definições, cada ano, cada turma, auditoria, fotografias): alterações em turmas diferentes juntam-se sem conflito; se a mesma turma mudar em dois aparelhos, fica a mais recente e a outra é guardada.</li>
  <li>Sincroniza sozinha <b>6 s depois de cada alteração</b>, <b>a cada minuto</b> com a app aberta, ao abrir, ao voltar à app e ao sair. Sem internet, envia quando a ligação voltar.</li>
  <li>Ícone da nuvem na barra de cima: verde sincronizado, ponto azul por enviar, amarelo renovar (toque), vermelho erro, cinzento sem internet. Tocar sincroniza logo.</li></ul>`});
  set('nuvem2',{txt:`<ol><li><b>No primeiro aparelho</b>: «Entrar com Google» — o assistente liga o Drive e pede uma palavra-passe de encriptação. Guarde-a quando o navegador perguntar.</li>
  <li><b>Nos outros</b> (computador, iPad, iPhone): abra eduspruce.pt e «Entrar com Google» com a mesma conta. A app vê que já há dados e só pede a <b>mesma</b> palavra-passe (o gestor de palavras-passe pode preenchê-la). Os dados aparecem logo.</li>
  <li>No iPhone/iPad adicione a app ao ecrã principal (Partilhar › Adicionar ao ecrã principal).</li></ol>
  <p>Também pode usar ${mn('Definições › Sincronização › Ligar Outro Dispositivo')} para enviar o link por AirDrop, Mail ou Mensagens.</p>`});
  set('nuvemcfg',{txt:`<p>Em ${mn('Definições › Sincronização › Guia de configuração')} estão os passos pormenorizados da <b>Google Auth Platform</b> (Google Drive e «Entrar com Google») e do <b>Microsoft Entra</b> (OneDrive), com os endereços desta app já preenchidos e botões para copiar. Os IDs escrevem-se uma vez no ficheiro <code>eduspruce-config.json</code> do site; os professores só entram com a sua conta. O anexo do <a href="${MANUAL_URL}" target="_blank" rel="noopener">manual em PDF</a> resume também o alojamento no GitHub Pages e o domínio próprio.</p>`});
  set('aparencia',{t:'Aparência, Logótipo, iPad e Telemóvel',txt:`<ul><li><b>Por defeito</b>: tema Claro, estilo Institucional, destaque Azul, logótipo Monograma e animações completas.</li>
  <li>${mn('Definições › Aparência')}: <b>tema</b> (Auto, Claro, Escuro — também no fundo da barra lateral), <b>estilo da interface</b> (Institucional, SGE, iOS 27 com Liquid Glass, Azul), <b>cor de destaque</b>, <b>logótipo da app</b> (Abeto, Livro, Monograma, Floresta, Ramo — muda a barra lateral, o ecrã de entrada e o ícone), <b>animações</b> (Sem, Minimalista, Cheio) e densidade.</li>
  <li><b>iPad</b>: na vertical a barra lateral mostra só ícones. <b>iPhone</b>: barra de separadores em baixo (Início, Turma, Sumários, Avaliação, Mais).</li>
  <li>Tudo é tocável com o dedo (alvos de 44 px); pode arrastar tempos, testes, dias do calendário, ficheiros e e-mails.</li></ul>`});
  const novos=[
   {id:'manual',ic:'book',t:'Manual de Instruções (PDF)',gif:null,txt:`<p>O manual completo, com imagens, explica a app de ponta a ponta: entrar e assistente de sincronização, interface, escola e calendário, turmas e alunos, horários, aulas e testes, avaliação, ensino profissional e PROFIJ, direção de turma, reuniões e convocatórias por e-mail, tarefas, documentos, jornal escolar, sincronização, segurança, definições, resolução de problemas, glossário e um anexo para quem aloja a app.</p><p><a class="btn pri" href="${MANUAL_URL}" target="_blank" rel="noopener" download>${ic('download',16)} Descarregar o Manual (PDF)</a></p>`},
   {id:'gentrar',ic:'user',t:'Entrar com Google e Assistente de Sincronização',gif:null,txt:`<p><b>Entrar com Google</b> inicia a sessão <i>e</i> autoriza a app a guardar os seus dados numa pasta privada do seu Google Drive. No computador abre uma pequena janela da Google; no iPhone, iPad e Safari do Mac a Google abre na própria página e regressa à app.</p>
   <ol><li><b>Conta Google ligada</b> — mostra o e-mail.</li><li><b>Código de encriptação</b> (só algarismos, mín. 8, com teclado numérico no ecrã) — tudo é encriptado neste aparelho antes de ir para o Drive. <b>Não a perca</b>: nem a EduSpruce nem a Google a conhecem.</li><li><b>Sincronizar</b> — «Está tudo pronto».</li></ol>
   <p>O nome, o e-mail e a fotografia da conta preenchem o perfil (só campos vazios). A ligação à Google expira de hora a hora e renova-se sozinha no primeiro toque; se não conseguir, o ícone da nuvem fica amarelo.</p>`},
   {id:'convemail',ic:'send',t:'Convocatórias e Atividades por E-mail',gif:null,txt:`<p><b>Arraste</b> para qualquer sítio da app o e-mail do Outlook (.msg/.eml), o convite (.ics), um ficheiro de texto ou o texto selecionado — ou <b>cole</b> (Ctrl+V / ⌘V) fora de um campo, ou ${mn('Reuniões › Colar E-mail…')}. Tudo é lido no dispositivo.</p>
   <ul><li><b>Convocante / responsável</b>: quem assina (depois de «Com os melhores cumprimentos», «Atenciosamente»…).</li>
   <li><b>Ordem de trabalhos</b>: procura o ponto 1 («1.», «1)», «Ponto um», «Primeiro:») e os seguintes; reconhece «ponto único».</li>
   <li><b>Turma</b>: «12.º B», «12B», «turma B do 11.º ano», «11.º B/C», PROFIJ, CEF.</li>
   <li><b>Data e hora</b>: «6 de novembro», «25/11», «próxima quinta-feira», «17h30», «8.30h», «das 11h às 11:50».</li>
   <li><b>Local</b> e ligações Teams/Zoom.</li></ul>
   <p>Mostra tudo para confirmar e marca com lembretes; as atividades podem ir também para o Jornal Escolar. No <b>Outlook na web</b> pode arrastar da lista de mensagens: a app pede depois para colar o texto (Ctrl+A, Ctrl+C, Ctrl+V).</p>`},
   {id:'instalar',ic:'download',t:'Instalar no iPad, iPhone e Computador',gif:null,txt:`<ul><li><b>iPad / iPhone (Safari)</b>: Partilhar › <b>Adicionar ao ecrã principal</b> — abre em ecrã inteiro, com o logótipo.</li><li><b>Mac (Safari)</b>: Ficheiro › <b>Adicionar à Dock</b>.</li><li><b>Chrome / Edge</b>: ícone de instalar na barra de endereço ou menu › Instalar EduSpruce.</li></ul><p>Depois de aberta, a app funciona sem internet; a internet só faz falta para sincronizar, para o OCR e para atualizar o catálogo de cursos.</p>`},
   {id:'seguranca',ic:'cadeado',t:'Segurança: Palavras-passe, Bloqueio e Perfis',gif:null,txt:`<ul><li><b>Palavras-passe</b> guardadas com <b>Argon2id</b> (sal aleatório), nunca em texto.</li>
   <li><b>5 tentativas falhadas</b> seguidas (sessão ou código de acesso) bloqueiam a entrada <b>15 minutos</b>, mesmo recarregando a página; a partir do 3.º erro a app avisa quantas restam. Tudo fica na Auditoria.</li>
   <li><b>Perfis</b>: o <b>Professor</b> vê e edita só as suas turmas; a <b>Direção</b> vê todas (as dos outros em só leitura); o <b>Administrador</b> vê e edita tudo. Em ${mn('Conta e Acesso')}, «Turmas» escolhe as turmas de cada conta.</li>
   <li><b>Cadeado</b> na barra de cima: bloqueia o ecrã com o código de acesso. <b>Olho</b>: modo de apresentação para projetar sem dados pessoais.</li></ul>`},
   {id:'problemas',ic:'alert',t:'Problemas de Ligação e Sincronização',gif:null,txt:`<ul><li><b>«Sem ligação», «Failed to fetch» ou a sincronizar muito tempo</b>: quase sempre um <b>bloqueador de publicidade/conteúdos</b>. Desligue-o para eduspruce.pt (Safari no Mac: Safari › Definições › Extensões; iPhone/iPad: «aA» na barra de endereço ou Definições › Apps › Safari › Extensões). Na rede da escola experimente outra rede. Depois toque em Sincronizar Agora.</li>
   <li><b>«Janela da Google fechada»</b>: permita janelas pop-up para eduspruce.pt (no Safari a app já abre na própria página).</li>
   <li><b>«redirect_uri_mismatch»</b> (iPhone/iPad): quem aloja a app tem de registar <code>https://eduspruce.pt/</code> no cliente OAuth da Google.</li>
   <li><b>Erro 403 / «unregistered callers»</b>: Google Drive API por ativar no projeto, ou permissão do Drive desmarcada — volte a entrar e marque todas as permissões.</li>
   <li><b>«A Google não validou esta app» (Unverified)</b>: enquanto a marca não for validada, toque em Avançadas › Aceder a eduspruce.pt.</li>
   <li><b>Palavra-passe de encriptação</b>: tem de ser a mesma em todos os aparelhos.</li></ul>
   <p>Problemas ou sugestões: <a href="https://github.com/EduSpruce/EduSpruce/issues" target="_blank" rel="noopener">GitHub Issues</a> (nunca inclua dados de alunos).</p>`}
  ];
  const ordem=['manual','comecar','gentrar','instalar'];
  novos.forEach(n=>{if(!AJUDA.find(s=>s.id===n.id))AJUDA.push(n)});
  const ini=ordem.map(id=>AJUDA.find(s=>s.id===id)).filter(Boolean);
  const resto=AJUDA.filter(s=>!ordem.includes(s.id));AJUDA.length=0;AJUDA.push(...ini,...resto);AJUDA._v90=1;
}

/* v0.72 · Entrar com Google (conta da escola Google Workspace ou pessoal) */
function gLoginId(A_){return ((A_&&A_.google&&A_.google.clientId)||NV_CENTRAL.google||(S.cfg.gsync&&S.cfg.gsync.clientId)||'').trim()}
function gDominio(A_){return ((A_&&A_.google&&A_.google.dominio)||(A_&&A_.ms&&A_.ms.dominio)||'').toLowerCase().replace(/^@/,'')}
async function gSessaoDe(at,A_){let j={},st=0;
  for(const u of ['https://openidconnect.googleapis.com/v1/userinfo','https://www.googleapis.com/oauth2/v3/userinfo']){try{const r=await fetch(u,{headers:{Authorization:'Bearer '+at}});st=r.status;if(r.ok){j=await r.json().catch(()=>({}));if(j.email)break}}catch(_){}}
  if(!j.email){try{const r=await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token='+encodeURIComponent(at));const t=await r.json().catch(()=>({}));if(t.email)j.email=t.email}catch(_){}}
  const email=String(j.email||'').toLowerCase();
  if(!email){const e=new Error(st===401||st===403?'A Google recusou o pedido ('+st+'). Tente de novo.':'A Google não deu acesso ao e-mail da conta. Volte a tocar em «Entrar com Google» e, no ecrã da Google, deixe marcada a permissão «Ver o seu endereço de email».');e.semEmail=true;throw e}
  const dom=gDominio(A_);if(dom&&!email.endsWith('@'+dom))throw new Error('A conta '+email+' não pertence ao domínio autorizado ('+dom+').');const _ac=await acVerificar(email);try{gPerfilPreencher(j,email)}catch(e){console.warn(e)}try{audit('Sessão','Entrada Google autorizada ('+_ac.fonte+')',email)}catch(_){}return {u:email,nome:j.name||S.cfg.professor||email,papel:_ac.papel||'professor',tipo:'google',foto:j.picture||'',desde:Date.now()}}
async function gLogin(A_){const id=gLoginId(A_);if(!id){const e=new Error('O início de sessão com Google ainda não está configurado.');e.semId=true;throw e}if(!/^https:/.test(location.protocol))throw new Error(location.protocol==='http:'&&/eduspruce/.test(location.hostname)?'Está a abrir a app sem https. Abra https://'+location.host+' (com «s»). Se o navegador disser que a ligação não é segura, o certificado ainda está a ser emitido: tente daqui a uns minutos.':'A Google exige que a app esteja alojada num endereço https.');
  const scope='openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
  if(nvUsarRedirect()){const state='nvglR'+Math.random().toString(36).slice(2);try{localStorage.setItem(NV_AUTH,JSON.stringify({p:'gl',state,q:Date.now(),manter:!!($('#lg-m')&&$('#lg-m').checked)}))}catch(_){}
    location.href='https://accounts.google.com/o/oauth2/v2/auth?'+new URLSearchParams({client_id:id,redirect_uri:nvRedirect(),response_type:'token',scope,state,prompt:'consent select_account',include_granted_scopes:'true'});return new Promise(()=>{})}
  await gsCarregar();const at=await new Promise((ok,ko)=>{const cli=google.accounts.oauth2.initTokenClient({client_id:id,scope,callback:r=>{if(!(r&&r.access_token))return ko(new Error((r&&r.error)||'Sem autorização'));try{if(google.accounts.oauth2.hasGrantedAnyScope&&!google.accounts.oauth2.hasGrantedAnyScope(r,'https://www.googleapis.com/auth/userinfo.email','email')){const e=new Error('Ficou desmarcada a permissão do e-mail. Volte a tocar em «Entrar com Google» e deixe-a marcada.');return ko(e)}}catch(_){}ok(r.access_token)},error_callback:e=>ko(new Error(e&&e.type==='popup_closed'?'Janela da Google fechada':'Não foi possível obter autorização da Google'))});cli.requestAccessToken({prompt:'consent select_account'})});
  return await gSessaoDe(at,A_)}
/* regresso do início de sessão Google por redirecionamento (iPhone/iPad) */
(async()=>{try{const h=new URLSearchParams((location.hash||'').replace(/^#/,''));const st=h.get('state')||'';if(!st.startsWith('nvglR'))return;let A0=null;try{A0=JSON.parse(localStorage.getItem(NV_AUTH)||'null')}catch(_){}localStorage.removeItem(NV_AUTH);history.replaceState(null,'',nvRedirect());
  if(!A0||A0.state!==st)return;if(h.get('error')){setTimeout(()=>{const e=$('#lg-err');if(e)e.textContent='Google: '+h.get('error')},800);return}
  const A_=await authCfg();const sess=await gSessaoDe(h.get('access_token'),A_);try{_gLoginTok={t:h.get('access_token'),exp:h.get('expires_in'),sc:h.get('scope')||'',email:sess.u};gLigarDrive()}catch(e){console.warn(e)}guardarSessao(sess,A0.manter!==false);try{regista('Sessão','',sess.u+' entrou (Google)')}catch(_){}location.reload()}
  catch(e){console.warn(e);setTimeout(()=>{const x=$('#lg-err');if(x)x.textContent=e.message},800)}})();
/* quando o ficheiro de configuração chega depois do ecrã de entrada, ativa os botões */
nvCentralCarregar().then(()=>{try{[['#lg-ms',NV_CENTRAL.ms],['#lg-gg',NV_CENTRAL.google]].forEach(([q,v])=>{const b=$(q);if(b&&v&&/^https:/.test(location.protocol)){b.removeAttribute('aria-disabled');const m=b.querySelector('.mut');if(m)m.remove()}})}catch(_){}});
