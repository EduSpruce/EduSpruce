/* ===================== EduSpruce · a app é um site ligado a uma base de dados =====================
   Entra-se com a conta Google e os dados aparecem — em qualquer telemóvel, tablet ou computador.
   · sem códigos nem passos de sincronização: a chave que cifra os dados fica guardada na conta e chega sozinha a cada aparelho
   · nada fica guardado no aparelho: ao abrir, os dados vêm da base de dados; ao mudar algo, é lá que fica guardado
   · uma alteração num aparelho aparece nos outros aparelhos abertos em ~1 s
   · as boas-vindas aparecem uma única vez, a quem ainda não tem nada na conta */
NV_LOGO.supabase='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M13.2 2.6c.5-.6 1.5-.2 1.5.6v7.3h6.1c.9 0 1.4 1 .8 1.7l-9.1 10.5c-.5.6-1.5.2-1.5-.6v-7.3H4.9c-.9 0-1.4-1-.8-1.7z" fill="#3ecf8e"/></svg>';
const sbObter=async()=>{for(let i=0;i<150;i++){const m=window.EduSpruceModerno;if(m&&m.supabase)return m.supabase;if(m&&m.pronto&&!m.supabase){const e=new Error(m.erro||'A base de dados não está configurada.');e.rede=true;e.semModulo=true;throw e}if(!navigator.onLine&&i>25)break;await new Promise(r=>setTimeout(r,100))}const e=new Error('A base de dados não respondeu. Verifique a ligação à internet.');e.rede=true;e.semModulo=true;throw e};
/* a ligação à base de dados não chegou a carregar (sem rede ao abrir): só recarregando a página */
const sbModuloFalhou=()=>{const m=window.EduSpruceModerno;return !m||!m.pronto||!m.supabase};
const sbRecarregar=()=>{let n=0;try{n=+sessionStorage.getItem('es.rl')||0;sessionStorage.setItem('es.rl',String(n+1))}catch(_){}if(n<4){window.__esSair=true;location.reload();return true}return false};
/* ao abrir, os dados da conta vêm todos num só pedido (sbMemo); a seguir cada leitura e gravação vai à base de dados */
const sbMemo={m:new Map(),lidos:new Set(),tudo:false,q:0,limpar(){this.m.clear();this.lidos.clear();this.tudo=false},
  por(o){this.limpar();Object.keys(o||{}).forEach(k=>this.m.set(k,o[k]));this.tudo=true;this.q=Date.now()},
  ler(n){if(Date.now()-this.q>20000){this.limpar();return undefined}if(this.m.has(n)){const t=this.m.get(n);this.m.delete(n);this.lidos.add(n);return t}
    if(this.tudo&&!this.lidos.has(n)&&!/^ef-f-/.test(n)){this.lidos.add(n);return null}return undefined}};
/* v0.940 · cópias automáticas (na própria base de dados, cifradas como os dados): antes de apagar uma parte (ano, turma, definições) e,
   no máximo de 3 em 3 horas por parte, antes de a substituir. Ficam 30 dias com o nome ef-f-bk-<data>-<parte> (não entram na abertura da app) */
const SB_BK_RX=/^ef-(geral|ano-[^/]+|turma-[^/]+)\.bin$/,SB_BK_INT=3*3600e3,SB_BK_DIAS=30;
const sbBkT=()=>{try{return JSON.parse(localStorage.getItem('es.bkt')||'{}')}catch(_){return {}}};
async function sbCopiaAntes(p,n,sempre){if(!SB_BK_RX.test(n))return;const T=sbBkT();if(!sempre&&T[n]&&Date.now()-T[n]<SB_BK_INT)return;
  try{const ant=await p.ler(n);if(ant==null)return;const q=new Date().toISOString().replace(/[-:]/g,'').replace(/\..*$/,'');await p.escrever('ef-f-bk-'+q+'-'+n.slice(3),ant);T[n]=Date.now();try{localStorage.setItem('es.bkt',JSON.stringify(T))}catch(_){}}
  catch(e){console.warn('[EduSpruce] cópia automática',n,e&&e.message)}}
async function sbIndiceOk(p){if(window.__esManOk)return true;
  if(sbMemo.tudo&&Date.now()-sbMemo.q<20000){if(sbMemo.m.has('ef-manifest.json')){window.__esManOk=true;return true}return ![...sbMemo.m.keys()].some(k=>SB_BK_RX.test(k))}
  const L=await p.lista();if(L['ef-manifest.json']!=null){window.__esManOk=true;return true}return !Object.keys(L).some(k=>SB_BK_RX.test(k))}
async function sbArrumarCopias(){try{const p=await sbObter();const L=await p.lista();const lim=new Date(Date.now()-SB_BK_DIAS*864e5).toISOString().replace(/[-:]/g,'').slice(0,8);
  const V=Object.keys(L).filter(k=>k.startsWith('ef-f-bk-')&&k.slice(8,16)<lim);for(const k of V.slice(0,40)){try{await p.apagar(k)}catch(_){}}}catch(_){}}
PROV.supabase={n:'Base de dados EduSpruce',async lista(){return (await sbObter()).lista()},async ler(n){const t=sbMemo.ler(n);if(t!==undefined)return t;return (await sbObter()).ler(n)},async escrever(n,t){sbMemo.lidos.add(n);sbMemo.m.delete(n);const p=await sbObter();
    if(n==='ef-manifest.json'&&!window.__esManOk&&!(await sbIndiceOk(p)))throw new Error('Por segurança, o índice dos dados não foi gravado (há dados na conta sem índice).');
    await sbCopiaAntes(p,n,false);const r=await p.escrever(n,t);if(n==='ef-manifest.json')window.__esManOk=true;return r},
  async apagar(n){sbMemo.lidos.add(n);sbMemo.m.delete(n);const p=await sbObter();await sbCopiaAntes(p,n,true);return p.apagar(n)}};
window.__esPronto=false; /* os dados da conta já chegaram da base de dados? */

/* ---------- 1. a conta ---------- */
const SB_SES='eduspruce.sb',SB_CH='conta-chave';
const sbPerfilDe=u=>{const m=(u&&u.user_metadata)||{};return {id:u.id,email:String(u.email||'').toLowerCase(),nome:m.full_name||m.name||'',foto:m.avatar_url||m.picture||''}};
/* sessão guardada neste aparelho (lê-se sem esperar pela rede: a app abre logo) */
const sbGuardada=()=>{try{const j=JSON.parse(localStorage.getItem(SB_SES)||'null');if(j&&j.user&&j.user.email&&j.refresh_token)return sbPerfilDe(j.user)}catch(_){}return null};
const sbEmailApp=()=>{try{return SESSAO&&SESSAO.tipo==='google'?String(SESSAO.u||'').trim().toLowerCase():''}catch(_){return ''}};
/* tira deste aparelho tudo o que é da conta (a conta e os dados continuam na base de dados) */
function sbEsquecer(){try{Object.keys(localStorage).forEach(k=>{if(k===SB_SES||k.startsWith(SB_SES+'-'))localStorage.removeItem(k)})}catch(_){}
  try{const L=nvL();const o={sb:0,conta:'',base:null,mod:{},erro:'',rekey:null};if(L.kConta){o.k=null;o.salt=null;o.kDe='';o.kConta=0;try{_nvK=null}catch(_){}}nvSet(o)}catch(_){}
  try{localStorage.removeItem('eskeep')}catch(_){}}
async function sbTerminar(msgEntrada){try{esCortina(false)}catch(_){}if(sbTerminar._on)return;sbTerminar._on=true;
  try{if(window.__esPronto&&navigator.onLine&&Object.keys(nvL().mod||{}).length)await Promise.race([nvSincronizar(false),new Promise(r=>setTimeout(r,6000))])}catch(_){}
  try{const p=await Promise.race([sbObter(),new Promise((_,ko)=>setTimeout(()=>ko(new Error('t')),3000))]);await Promise.race([p.sair(),new Promise(r=>setTimeout(r,3000))])}catch(_){}
  sbEsquecer();try{sessionStorage.removeItem(SESS_KEY);localStorage.removeItem(SESS_KEY);sessionStorage.removeItem('es.loc')}catch(_){}
  try{if(msgEntrada)sessionStorage.setItem('es.lgmsg',msgEntrada)}catch(_){}
  window.__esSair=true;location.replace(location.origin+location.pathname)}
terminarSessao=function(){try{if(window.__esPronto&&Object.keys(nvL().mod||{}).length&&!navigator.onLine&&!confirm('Há alterações que ainda não ficaram guardadas (sem internet). Se terminar a sessão agora, perdem-se.\n\nTerminar mesmo assim?'))return}catch(_){}sbTerminar()};
/* quem deixa de estar autorizado sai também da base de dados (senão voltava a entrar sozinho) */
{const _av=acVerificar;acVerificar=async function(){try{return await _av.apply(this,arguments)}catch(e){if(e&&e.semAcesso){sbEsquecer();try{sessionStorage.setItem('es.lgmsg',e.message)}catch(_){}}throw e}}}

/* ecrã de entrada: um só botão */
function sbEcraEntrar(){document.body.classList.add('login-on');let o=$('#login');if(o)o.remove();o=document.createElement('div');o.id='login';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Iniciar sessão');
  o.innerHTML=`<form class="lgb lgbd" onsubmit="return false"><div class="lgh"><span class="lgi">${ic('flow',30)}</span><div><b>Edu<em>Spruce</em></b><span>Menos papelada. Mais tempo para ensinar.</span></div></div>
    <h1>Iniciar Sessão</h1>
    <button type="button" class="btn mslg lggd" id="lg-gg"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg> <span class="lggt">Entrar com Google</span></button>
    <div class="lgerr" id="lg-err" role="alert"></div>
    <div class="lgalt" id="lg-alt" hidden><label for="lg-em">E-mail da conta</label><input type="email" id="lg-em" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="nome@exemplo.pt">
      <label for="lg-pw">Palavra-passe</label><input type="password" id="lg-pw" autocomplete="current-password"><button type="submit" class="btn pri" id="lg-pwok">Entrar</button></div>
    <button type="button" class="lgoutra" id="lg-outra" aria-expanded="false">Outra forma de entrar</button>
    <p class="lgbdn">${ic('shield',14)}<span>Entra-se com a <b>conta Google autorizada</b> pelo administrador. Os seus dados aparecem logo, em qualquer aparelho — sem códigos e sem nada para configurar.</span></p></form>`;
  document.body.appendChild(o);try{loginHero()}catch(_){}try{loginLegal()}catch(_){}return o}
let _sbEntrouAgora=false;
/* v0.942 · cortina: nada da app fica à vista enquanto a sessão se confirma ou antes de pedir o código de acesso */
function esCortina(on){let o=$('#escofre');if(!on){if(o)o.remove();return}if(o)return;o=document.createElement('div');o.id='escofre';o.setAttribute('aria-busy','true');o.innerHTML='<span class="sr" role="status">A abrir…</span><i aria-hidden="true"></i>';document.body.appendChild(o);
  /* nunca fica presa: sai se aparecer o ecrã de entrada, uma mensagem de erro ou ao fim de 12 s */
  const t0=Date.now();const t=setInterval(()=>{const c=$('#escofre');if(!c){clearInterval(t);return}if((document.body.classList.contains('login-on')&&!c.dataset.volta)||$('#pinlock')||$('#esabrir.falha')||$('#esabrir .esab-f')||Date.now()-t0>12000){clearInterval(t);c.remove()}},250)}
const sbGuardadaValida=()=>{try{const j=JSON.parse(localStorage.getItem(SB_SES)||'null');return !!(j&&j.expires_at&&j.expires_at*1000>Date.now()+30000)}catch(_){return false}};
pedirLogin=function(){return new Promise(async ok=>{try{authCfg().catch(()=>{})}catch(_){}
  const entrar=(pf,papel)=>{const ant=sessaoAtual();const m=ant&&ant.tipo==='google'&&String(ant.u||'').toLowerCase()===pf.email?ant:null;
    const s={u:pf.email,nome:pf.nome||(m&&m.nome)||pf.email,papel:papel||(m&&m.papel)||'professor',tipo:'google',foto:pf.foto||(m&&m.foto)||'',desde:(m&&m.desde)||Date.now()};
    SESSAO=s;guardarSessao(s,true);document.body.classList.remove('login-on');const o=$('#login');if(o){if($('#escofre'))o.remove();else{o.classList.add('sai');setTimeout(()=>o.remove(),280)}}
    try{const c0=$('#escofre');if(c0){delete c0.dataset.volta;c0.style.zIndex=''}if(localStorage.getItem('es.pin')==='1')esCortina(true);else esCortina(false)}catch(_){}
    try{sessBox()}catch(_){}setTimeout(esAbrir,0);ok(s)};
  const volta=/[?&]code=/.test(location.search);let g=sbGuardada();
  if(g&&!volta&&sbGuardadaValida())return entrar(g); /* sessão válida neste aparelho: entra logo, como uma app normal */
  if(g&&!volta){/* sessão guardada mas já caducada (ex.: atalho no ecrã principal aberto dias depois): confirma-se primeiro, sem mostrar a app */
    esCortina(true);let pf=null;try{const p=await sbObter();pf=await Promise.race([p.sessao(),new Promise(r=>setTimeout(()=>r(undefined),8000))])}catch(e){pf=(e&&e.rede)?undefined:null}
    if(pf)return entrar(pf);if(pf===undefined){esCortina(false);return entrar(g)} /* sem internet ou rede lenta: a abertura normal trata disso (aviso «sem ligação») */
    esCortina(false);sbEsquecer();g=null}
  /* sem sessão (ou a voltar do Google): a sessão antiga da app, sozinha, já não abre nada */
  try{sessionStorage.removeItem(SESS_KEY);localStorage.removeItem(SESS_KEY)}catch(_){}SESSAO=null;
  let msg='';try{msg=sessionStorage.getItem('es.lgmsg')||'';sessionStorage.removeItem('es.lgmsg')}catch(_){}
  const o=sbEcraEntrar();const bt=o.querySelector('#lg-gg'),er=o.querySelector('#lg-err');if(msg)er.textContent=msg;
  const ocup=t=>{bt.disabled=!!t;bt.classList.toggle('ocp',!!t);bt.querySelector('.lggt').textContent=t||'Entrar com Google'};
  /* a voltar do Google: não se volta a mostrar o formulário de entrada — só uma espera até a app abrir (ou até haver um erro para mostrar) */
  if(volta){esCortina(true);const c0=$('#escofre');if(c0){c0.dataset.volta='1';c0.style.zIndex='100000'}}
  const recusar=async(p,m)=>{esCortina(false);try{await p.sair()}catch(_){}sbEsquecer();ocup('');er.textContent=m};
  const concluir=async()=>{ocup('A entrar…');er.textContent='';
    try{const p=await sbObter();const pf=await p.sessao();if(!pf){esCortina(false);ocup('');if(volta)er.textContent='Não foi possível concluir a entrada. Toque em «Entrar com Google» outra vez.';return}
      if(!(await p.autorizado())){let d='';try{d=p.diagAut?await p.diagAut():''}catch(_){}return recusar(p,'A conta '+pf.email+' não está autorizada a usar a EduSpruce. Peça ao administrador para a acrescentar.'+(d?' ['+d+']':''))}
      let papel='';try{papel=(await acVerificar(pf.email)).papel||''}catch(e){if(e&&e.semAcesso)return recusar(p,e.message)}
      _sbEntrouAgora=true;esAbrir._aut={e:pf.email,q:Date.now()};entrar(pf,papel)}
    catch(e){esCortina(false);ocup('');er.textContent=(e&&e.message)||'Não foi possível entrar. Tente de novo.'}};
  bt.onclick=async()=>{er.textContent='';if(!navigator.onLine){er.textContent='Sem ligação à internet.';return}ocup('A abrir a Google…');try{const p=await sbObter();await p.entrarGoogle();setTimeout(()=>ocup(''),10000)}catch(e){ocup('');er.textContent=(e&&e.message)||'Não foi possível abrir a Google.'}};
  /* entrada alternativa: e-mail + palavra-passe da mesma conta */
  {const alt=o.querySelector('#lg-alt'),ob=o.querySelector('#lg-outra'),em=o.querySelector('#lg-em'),pw=o.querySelector('#lg-pw'),okb=o.querySelector('#lg-pwok');
    ob.onclick=()=>{alt.hidden=!alt.hidden;ob.setAttribute('aria-expanded',!alt.hidden);ob.textContent=alt.hidden?'Outra forma de entrar':'Esconder';if(!alt.hidden){try{em.value=em.value||localStorage.getItem('es.lge')||''}catch(_){}(em.value?pw:em).focus()}};
    const vai=async()=>{er.textContent='';const e=em.value.trim(),s=pw.value;if(!/^\S+@\S+\.\S+$/.test(e)){er.textContent='Escreva o e-mail da conta.';em.focus();return}if(!s){er.textContent='Escreva a palavra-passe.';pw.focus();return}if(!navigator.onLine){er.textContent='Sem ligação à internet.';return}
      okb.disabled=true;okb.textContent='A entrar…';try{const p=await sbObter();await p.entrarSenha(e,s);pw.value='';try{localStorage.setItem('es.lge',e)}catch(_){}await concluir()}catch(x){er.textContent=(x&&x.message)||'Não foi possível entrar.'}finally{okb.disabled=false;okb.textContent='Entrar'}};
    okb.onclick=vai;o.querySelector('form').onsubmit=ev=>{ev.preventDefault();if(!alt.hidden)vai();return false}}
  if(volta||g)concluir()})};
/* regresso do Google com erro: explica no ecrã de entrada e limpa o endereço */
try{const q=new URLSearchParams(location.search),h=new URLSearchParams(location.hash.slice(1));const er=q.get('error_description')||h.get('error_description');
  if(er&&(q.get('error')||h.get('error')||q.get('error_code')||h.get('error_code'))){history.replaceState(null,'',location.pathname);try{sessionStorage.setItem('es.lgmsg','A Google não concluiu a entrada ('+decodeURIComponent(er).replace(/\+/g,' ')+'). Tente de novo.')}catch(_){}}}catch(_){}

/* ---------- 2. a chave da conta chega sozinha (nunca se escreve) ---------- */
async function sbChaveAuto(p,pf,D){const L0=nvL();const lerC=async n=>D&&Object.prototype.hasOwnProperty.call(D,n)?D[n]:D?null:await p.ler(n);
  if(L0.k&&L0.kDe&&L0.kDe!==pf.email){try{_nvK=null}catch(_){}nvSet({k:null,salt:null,kDe:'',kConta:0,base:null,mod:{}})} /* chave de outra conta que usou este aparelho */
  const manTxt=await lerC(NV_PREF+'manifest.json');let man=null;try{man=manTxt?JSON.parse(manTxt):null}catch(_){}
  const abre=async k=>{if(!k)return false;if(!man||!man.chk)return true;try{const ck=await crypto.subtle.importKey('raw',unb64(k),'AES-GCM',false,['decrypt']);return await nvDecifrar(man.chk,ck)==='eduflow'}catch(_){return false}};
  const usar=(k,salt)=>{const L=nvL();const mudou=L.k!==k;try{_nvK=null}catch(_){}nvSet({k,salt:salt||L.salt||'',kDe:pf.email,kConta:1,...(mudou?{base:null,mod:{}}:{})})};
  const reg=(k,salt)=>JSON.stringify({v:1,k,salt:salt||'',q:Date.now()});
  let conta=null;{const t=await lerC(SB_CH);try{const j=t?JSON.parse(t):null;if(j&&j.k)conta=j}catch(_){}}
  if(conta&&await abre(conta.k))return usar(conta.k,conta.salt||(man&&man.salt));
  const L=nvL();
  if(L.k&&await abre(L.k)){/* este aparelho já abria os dados: a chave passa a ficar na conta e os outros aparelhos deixam de precisar de código */
    const salt=(man&&man.salt)||L.salt||'';if(conta)await p.escrever(SB_CH,reg(L.k,salt));else if(!(await p.criar(SB_CH,reg(L.k,salt))))return sbChaveAuto(p,pf);
    try{audit('Conta','Chave dos dados guardada na conta','')}catch(_){}return usar(L.k,salt)}
  if(man&&man.chk){const e=new Error('Os dados desta conta foram guardados com um código antigo.');e.semChave=true;throw e}
  /* conta nova: a chave cria-se sozinha */
  const k=b64(crypto.getRandomValues(new Uint8Array(32))),salt=b64(crypto.getRandomValues(new Uint8Array(16)));
  if(conta)await p.escrever(SB_CH,reg(k,salt));else if(!(await p.criar(SB_CH,reg(k,salt))))return sbChaveAuto(p,pf);
  return usar(k,salt)}
/* sempre que a chave mudar neste aparelho (código antigo confirmado, por exemplo), a conta fica com ela */
async function sbGuardarChaveNaConta(){const L=nvL();if(L.prov!=='supabase'||!L.k)return;const p=await sbObter();await p.escrever(SB_CH,JSON.stringify({v:1,k:L.k,salt:L.salt||'',q:Date.now()}));nvSet({kConta:1,kDe:sbEmailApp()||L.kDe||''})}
{const _gk=nvGuardarChave;nvGuardarChave=async function(){const r=await _gk.apply(this,arguments);setTimeout(()=>{sbGuardarChaveNaConta().catch(e=>console.warn('[EduSpruce] chave na conta:',e.message))},60);return r}}
/* contas antigas, em que nenhum aparelho com os dados abertos passou ainda por aqui: pede-se o código antigo uma última vez */
function sbPedirCodigoAntigo(p,pf){return new Promise(res=>{const d=document.createElement('dialog');d.className='nvmc sbcod';d.setAttribute('aria-labelledby','sbc-t');
  d.innerHTML=`<form class="nvmcf" autocomplete="off"><h2 id="sbc-t">${ic('cadeadoAb',18)} Só mais esta vez</h2>
    <p class="hint">Os seus dados foram guardados com o <b>código de encriptação antigo</b>. Escreva-o aqui uma última vez: a partir de agora basta entrar com a conta Google, em qualquer aparelho.</p>
    <label for="sbc-1">Código de encriptação antigo</label><input type="password" id="sbc-1" autocomplete="off" autocapitalize="none" spellcheck="false">
    <div class="nverr" id="sbc-e" role="alert"></div>
    <div class="row" style="gap:8px;justify-content:flex-end;margin-top:8px;flex-wrap:wrap"><button type="button" class="btn" id="sbc-s">Terminar Sessão</button><button type="submit" class="btn pri" id="sbc-ok">${ic('check',15)} Abrir os Meus Dados</button></div>
    <p class="hint sbcalt">${ic('info',14)}<span><b>Não se lembra do código?</b> Abra a EduSpruce no aparelho onde os seus dados aparecem (por exemplo, o computador). Fica resolvido sozinho e este pedido desaparece aqui.</span></p></form>`;
  document.body.appendChild(d);d.addEventListener('cancel',e=>e.preventDefault());d.addEventListener('keydown',e=>e.stopPropagation());try{d.showModal()}catch(_){d.setAttribute('open','')}
  const er=d.querySelector('#sbc-e'),inp=d.querySelector('#sbc-1'),okb=d.querySelector('#sbc-ok');setTimeout(()=>inp.focus(),60);let fechado=false;
  const fim=v=>{if(fechado)return;fechado=true;clearInterval(t);try{d.close()}catch(_){}d.remove();res(v)};
  /* se, entretanto, a chave aparecer na conta (abriu a app no outro aparelho), continua sozinho */
  const t=setInterval(async()=>{try{const x=await p.ler(SB_CH);if(x&&JSON.parse(x).k){await sbChaveAuto(p,pf);fim(true)}}catch(_){}},4000);
  d.querySelector('#sbc-s').onclick=()=>{fim(false);sbTerminar()};
  d.querySelector('form').onsubmit=async e=>{e.preventDefault();er.textContent='';const c=inp.value;if(!c){er.textContent='Escreva o código.';return}okb.disabled=true;
    try{await nvDefinirPalavra(c);await sbGuardarChaveNaConta();try{audit('Conta','Código antigo confirmado pela última vez','')}catch(_){}fim(true)}
    catch(e2){okb.disabled=false;er.textContent=/errad|não corresponde/i.test(e2.message||'')?'Código errado. Tente de novo.':(e2.message||'Não foi possível confirmar.');inp.select()}}})}

/* ---------- 3. abrir: os dados vêm da base de dados; até chegarem, a app mostra o esqueleto das páginas ---------- */
function esEsqueleto(modo,tit,txt){let o=$('#esabrir');if(!modo){document.body.classList.remove('es-abrir');if(o)o.remove();return}
  document.body.classList.add('es-abrir');if(!o){o=document.createElement('div');o.id='esabrir';const v=$('#view');if(v&&v.parentNode)v.parentNode.insertBefore(o,v);else document.body.appendChild(o)}
  if(o.dataset.m===modo&&modo==='abrir')return;o.dataset.m=modo;
  if(modo==='abrir'){o.setAttribute('aria-busy','true');o.innerHTML=`<span class="sr" role="status">A abrir os seus dados…</span><div class="eskg" aria-hidden="true"><div class="esk eskh"></div><div class="eskr"><div class="esk"></div><div class="esk"></div><div class="esk"></div><div class="esk"></div></div><div class="eskc"><div class="esk eskb"></div><div class="esk eskb"></div></div><div class="esk eskl"></div><div class="esk eskl"></div><div class="esk eskl c"></div></div>`;return}
  o.removeAttribute('aria-busy');o.innerHTML=`<div class="esmsg" role="alert"><span class="esmi">${ic(modo==='offline'?'cloud':'alert',30)}</span><h2>${esc(tit)}</h2><p>${esc(txt)}</p><div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn pri" id="esab-r">${ic('refresh',15)} Tentar de Novo</button><button type="button" class="btn" id="esab-s">Terminar Sessão</button></div></div>`;
  o.querySelector('#esab-r').onclick=()=>{if(sbModuloFalhou()){window.__esSair=true;return location.reload()}esAbrir()};o.querySelector('#esab-s').onclick=()=>sbTerminar()}
function esFalha(e){esCortina(false);const rede=!navigator.onLine||(e&&e.rede);console.warn('[EduSpruce] abrir dados:',e&&e.message);
  if(rede)esEsqueleto('offline','Sem ligação à internet','Os seus dados estão guardados na base de dados. Assim que houver ligação, abrem sozinhos.');
  else esEsqueleto('erro','Não foi possível abrir os seus dados',(e&&e.message)||'Tente de novo dentro de momentos.');
  clearTimeout(esFalha._t);esFalha._t=setTimeout(()=>{if(window.__esPronto||!navigator.onLine||document.visibilityState!=='visible')return;if(e&&e.semModulo&&sbModuloFalhou()){if(sbRecarregar())return}esAbrir()},rede?4000:20000)}
let _esAbrirP=null,_esDentro=false,_sbCanal=null;
function esAbrir(){if(window.__esPronto||window.__esSair||!SESSAO||document.body.classList.contains('login-on'))return Promise.resolve();if(_esAbrirP)return _esAbrirP;
  _esAbrirP=esAbrir0().catch(e=>esFalha(e)).finally(()=>{_esAbrirP=null;const b=$('#esbar');if(b)b.className=''});return _esAbrirP}
async function esAbrir0(){clearTimeout(esFalha._t);esEsqueleto('abrir');let b=$('#esbar');if(!b){b=document.createElement('div');b.id='esbar';b.innerHTML='<i></i>';document.body.appendChild(b)}b.className='on';
  const p=await sbObter();const pf=await p.sessao();
  if(!pf)return sbTerminar('A sessão terminou. Entre de novo com a sua conta Google.');
  if(pf.email!==sbEmailApp()){SESSAO.u=pf.email;if(pf.nome)SESSAO.nome=pf.nome;guardarSessao(SESSAO,true);try{sessBox()}catch(_){}}
  /* um só vaivém: confirma que a conta está autorizada e traz os dados todos (menos fotografias e anexos, que chegam depois) */
  const jaAut=esAbrir._aut&&esAbrir._aut.e===pf.email&&Date.now()-esAbrir._aut.q<15000;
  let aut,D;try{[aut,D]=await Promise.all([jaAut?true:p.autorizado(),p.lerDados?p.lerDados().catch(e=>{if(e&&e.semAcesso)return null;throw e}):null])}catch(e){if(e&&e.semSessao)return sbTerminar(e.message);throw e}
  if(!aut){let d='';try{d=p.diagAut?await p.diagAut():''}catch(_){}return sbTerminar('A conta '+pf.email+' não está autorizada a usar a EduSpruce. Peça ao administrador para a acrescentar.'+(d?' ['+d+']':''))}
  /* o perfil (administrador, professor…) confirma-se sem atrasar a abertura */
  acVerificar(pf.email).then(r=>{if(r&&r.papel&&SESSAO&&r.papel!==SESSAO.papel){SESSAO.papel=r.papel;guardarSessao(SESSAO,true);try{sessBox()}catch(_){}if(window.__esPronto){try{go(VIEW)}catch(_){}}}}).catch(e=>{if(e&&e.semAcesso)sbTerminar(e.message)});
  {const L=nvL();const o={sb:1,conta:pf.email,semSync:false,renovar:false};if(L.prov!=='supabase')Object.assign(o,{prov:'supabase',base:null,mod:{},erro:'',sbDe:L.prov||''});if(L.auto===false)o.auto=true;nvSet(o)}
  try{await sbChaveAuto(p,pf,D||undefined)}catch(e){if(!(e&&e.semChave))throw e;b.className='';if(!(await sbPedirCodigoAntigo(p,pf)))return;b.className='on';D=null}
  if(D)sbMemo.por(D);
  /* ao abrir sem nada no aparelho, o registo de auditoria só tem o ruído do arranque: não se mistura com o da conta */
  try{if(!window.__esLerLocal&&Array.isArray(S.audit))S.audit=S.audit.filter(e=>!(e&&e.area==='Dados'&&/^Formato atualizado/.test(e.acao||'')))}catch(_){}
  /* v0.940 · SEGURANÇA: ao abrir, o aparelho não tem dados próprios — o que está na base de dados manda sempre.
     (antes, um aparelho com restos de uma versão antiga podia achar que «não ter» uma parte era tê-la apagado, e apagava-a na base de dados) */
  try{nvSet({base:null,mod:{}})}catch(_){}
  if(!(await sbIndiceOk(p))){const e=new Error('O índice dos seus dados não foi encontrado, mas há dados na conta. Por segurança nada foi alterado. Contacte o suporte.');throw e}
  let r=null;window.__nvSemFotos=true;_esDentro=true;window.__esAbrirBD=true;try{r=await nvSincronizar(false)}finally{window.__nvSemFotos=false;_esDentro=false;window.__esAbrirBD=false;sbMemo.limpar()}
  if(!r&&/recusou a operação/i.test(nvL().erro||'')&&S.anos&&S.anos.length){/* leu os dados mas a base de dados recusa gravar: abre na mesma e avisa */r={soLeitura:true};setTimeout(()=>esSemGravar(nvL().erro),600)}
  if(!r){const m=nvL().erro||'';const e=new Error(m||'Não foi possível abrir os dados.');if(/Sem ligação|internet|rede/i.test(m))e.rede=true;throw e}
  window.__esPronto=true;clearTimeout(esFalha._t);try{sessionStorage.removeItem('es.rl')}catch(_){}
  if(!_sbCanal)_sbCanal=p.tempoReal(pf.id,sbPuxar)||1;
  await esPosCarga(pf);try{nvFotosFundo()}catch(_){}setTimeout(sbArrumarCopias,30000)}

/* o que só faz sentido com os dados à frente: ano/turma, código de acesso, boas-vindas (uma única vez), avisos */
const esLocGuardar=()=>{try{sessionStorage.setItem('es.loc',JSON.stringify({a:S.anoAtivo||'',t:S.turmaAtiva||'',e:S.escolaAtiva||'',f:S.filtroOferta||''}))}catch(_){}};
const esVer=v=>parseFloat(String(v||'0').replace(/[^0-9.]/g,''))||0;
async function esPosCarga(pf){
  try{let l=null;try{l=JSON.parse(sessionStorage.getItem('es.loc')||'null')}catch(_){}
    if(l&&l.a&&S.anos.some(a=>a.id===l.a)){S.anoAtivo=l.a;if(l.e!==undefined&&l.e!=='')S.escolaAtiva=l.e;if(l.f!==undefined&&l.f!=='')S.filtroOferta=l.f;const an=S.anos.find(a=>a.id===l.a);if(l.t&&an.turmas.some(t=>t.id===l.t))S.turmaAtiva=l.t}
    else if(S.anos.length){const ult=anoPorData();if(ult&&S.anoAtivo!==ult.id){S.anoAtivo=ult.id;const TF=turmasFiltradas(A());S.turmaAtiva=TF[0]?TF[0].id:null}}}catch(e){console.warn(e)}
  if(S.cfg.pinHash&&!esPosCarga._pin){esPosCarga._pin=true;
    let rep=null;try{rep=JSON.parse(localStorage.getItem('es.pinrep')||'null');localStorage.removeItem('es.pinrep')}catch(_){}
    if(rep&&rep.e===pf.email&&Date.now()-rep.q<15*60*1000&&_sbEntrouAgora){delete S.cfg.pinHash;try{audit('Segurança','Código de acesso retirado (entrou de novo com a conta Google)',pf.email)}catch(_){}save();setTimeout(()=>toast('Código de acesso retirado. Pode definir um novo em Definições › Dados e Segurança.','ok'),900)}
    else{try{const pp=pedirPin();esCortina(false);await pp}catch(e){console.warn(e)}}}
  try{if(S.cfg.pinHash)localStorage.setItem('es.pin','1');else localStorage.removeItem('es.pin')}catch(_){}esCortina(false);
  esEsqueleto(null);try{aplicarPrefs()}catch(_){}try{go(VIEW||'inicio')}catch(e){console.warn(e)}
  try{if(_sbEntrouAgora){_sbEntrouAgora=false;regista('Sessão','',pf.email+' entrou')}}catch(_){}
  try{let m=false;const c=S.cfg;
    if(!S.anos.length){if(!c.bemVindo){c.bemVindo=Date.now();c.tourVisto=true;m=true;setTimeout(()=>{try{passosModal(true)}catch(e){console.warn(e)}},500)}} /* conta nova: boas-vindas, uma única vez */
    else{if(!c.bemVindo){c.bemVindo=1;m=true}if(!c.tourVisto){c.tourVisto=true;m=true}
      if(esVer(VERSAO)>esVer(c.versaoVista)){const tinha=!!c.versaoVista;c.versaoVista=VERSAO;m=true;if(tinha)setTimeout(()=>toast('Nova versão '+VERSAO+' — veja as novidades em Definições › Ferramentas','ok'),900)}}
    if(m)save()}catch(e){console.warn(e)}
  setTimeout(()=>{try{mostrarAvisos(false)}catch(_){}},700)}
posArranque=function(){/* as boas-vindas e a nota de versão só depois de os dados chegarem (esPosCarga) */};
/* avisos e lembretes só com os dados à frente */
{const _ma=mostrarAvisos;mostrarAvisos=function(){if(!window.__esPronto||$('#esabrir'))return;return _ma.apply(this,arguments)}}
/* as boas-vindas («primeiros passos») nunca se abrem sozinhas ao desenhar o Início: só na 1.ª vez da conta ou quando a pessoa as pede */
{const _pm=passosModal;passosModal=function(forcar){if(!forcar)return;return _pm.apply(this,arguments)}}
/* se o código de acesso já foi pedido ao abrir (aparelho antigo, com dados cá guardados), não se pede segunda vez */
{const _pp=pedirPin;pedirPin=function(){const p=_pp.apply(this,arguments);Promise.resolve(p).then(()=>{esPosCarga._pin=true}).catch(()=>{});return p}}
/* o ano e a turma escolhidos ficam lembrados enquanto a app está aberta neste aparelho (não são dados de alunos) */
{const _sv=save;save=function(){const r=_sv.apply(this,arguments);if(window.__esPronto)esLocGuardar();return r}}
{const _g=go;go=function(){const r=_g.apply(this,arguments);if(window.__esPronto)esLocGuardar();return r}}

/* ---------- 4. guardar e receber: tudo sozinho e em silêncio ---------- */
function sbPuxar(){const L=nvL();if(!window.__esPronto||L.prov!=='supabase'||!(L.k||_nvK))return;clearTimeout(sbPuxar._t);sbPuxar._t=setTimeout(()=>{nvSincronizar(false).then(()=>{try{nvBadge()}catch(_){}}).catch(()=>{})},150)}
function sbRedesenhar(){try{nvBadge()}catch(_){}try{const c=$('#nv-card');if(c&&typeof nvPainel==='function'){const d=document.createElement('div');d.innerHTML=nvPainel();c.replaceWith(d.firstElementChild);bindNvPainel()}}catch(_){}}
async function sbLigar(){return esAbrir()}
function sbLembrete(){}
nvAssist=function(){};
nvSyncGate=async function(){const g=document.getElementById('nvgate');if(g)g.remove();document.body.classList.remove('nv-gating');try{window.__nvGateFila&&window.__nvGateFila()}catch(_){}return esAbrir()};
{const g=document.getElementById('nvgate');if(g)g.remove()}
/* mensagens: nada de «sincronizar» — os dados simplesmente estão guardados */
{const _t=toast;toast=function(m,tipo){try{let s=String(m==null?'':m);
    if(/^Recebidas alterações de outro dispositivo|código de encriptação foi mudado noutro aparelho|^Defina a palavra-passe de encriptação|^Acabou de mudar o código/.test(s))return;
    if(/^Sincronizado/.test(s))s='Tudo guardado';s=s.replace('Definições › Sincronização','Definições › Conta e Dados');arguments[0]=s}catch(_){}return _t.apply(this,arguments)}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'||!SESSAO)return;if(window.__esPronto)setTimeout(sbPuxar,300);else if(!document.body.classList.contains('login-on'))setTimeout(esAbrir,200)});
addEventListener('online',()=>{if(!SESSAO)return;if(window.__esPronto)setTimeout(sbPuxar,500);else setTimeout(()=>{if(sbModuloFalhou()&&$('#esabrir')&&$('#esabrir').dataset.m==='offline'&&sbRecarregar())return;esAbrir()},300)});
addEventListener('es-bd',()=>{if(SESSAO&&!window.__esPronto&&$('#esabrir')&&$('#esabrir').dataset.m!=='abrir')esAbrir()});
/* sair da página com alterações por guardar: avisa (não há cópia no aparelho) */
addEventListener('beforeunload',e=>{try{if(!window.__esSair&&window.__esPronto&&nvL().prov==='supabase'&&Object.keys(nvL().mod||{}).length){e.preventDefault();e.returnValue=''}}catch(_){}});
/* sem ícone na barra: guardar e receber acontece em segundo plano; só um aviso discreto se a internet cair (e quando volta) */
nvBadge=function(){try{const b=$('#nv-badge');if(b)b.remove()}catch(_){}};
addEventListener('offline',()=>{if(window.__esPronto)toast('Sem internet — o que fizer é guardado assim que a ligação voltar.','aviso')});
addEventListener('online',()=>{if(window.__esPronto&&Object.keys(nvL().mod||{}).length)setTimeout(()=>nvSincronizar(false).then(r=>{if(r)toast('Ligação de volta — tudo guardado.','ok')}),600)});
/* ---------- 5. Definições › Conta e Dados ---------- */
nvPainel=function(){const L=nvL();const C=nvConflitos();const pend=Object.keys(L.mod||{}).length;const em=sbEmailApp()||L.conta||'';
  const est=!window.__esPronto?['off','A abrir os dados…','']:!navigator.onLine?['off','Sem internet','As alterações são guardadas assim que a ligação voltar.']:L.erro&&pend?['err','Não foi possível guardar',L.erro]:pend?['pend','A guardar…','']:['ok','Tudo guardado','Última gravação '+nvQuando(L.ultimo)+'.'];
  const sec=(t,d,c)=>`<section class="nvs"><div class="nvsh"><h3>${t}</h3>${d?`<p>${d}</p>`:''}</div><div class="nvsb">${c}</div></section>`;
  return `<div class="nvpw2" id="nv-card">
  <div class="card nvhero nvst-${est[0]}"><div class="nvhi">${ic('cloud',30)}</div><div class="nvht"><div class="nvhk">Conta e Dados</div><h2>${est[1]}</h2><p>${esc(est[2])}</p>
    <div class="nvhm"><span>${NV_LOGO.supabase} Base de dados EduSpruce · União Europeia</span>${em?`<span>${ic('user',13)} ${esc(em)}</span>`:''}</div></div>
    <div class="nvha">${pend||L.erro?`<button class="btn pri" id="nv2-agora">${ic('refresh',15)} Guardar Agora</button>`:''}</div></div>
  <div class="card nvbody">
  ${sec('Como funciona','',`<p class="nvhint" style="margin:0">Os seus dados estão guardados na base de dados EduSpruce. Em qualquer telemóvel, tablet ou computador, abra <b>${esc(location.host||'eduspruce.pt')}</b>, entre com a mesma conta Google e está tudo lá — não há códigos nem nada para configurar. O que mudar num aparelho aparece nos outros em segundos.</p>`)}
  ${sec('Conta','Neste aparelho não fica nada guardado: ao terminar a sessão, os dados continuam na sua conta.',`<div class="nvrow"><div class="nvrt">${ic('check',15)} <b>${esc(em||'Sessão iniciada')}</b> <span class="mut">· ${esc(nvDisp())}</span></div><button class="btn" id="nv2-sair">${ic('back',14)} Terminar Sessão</button></div>`)}
  ${C.length?sec('Versões guardadas','Quando a mesma parte muda em dois aparelhos ao mesmo tempo, fica a mais recente; a outra fica aqui, para a poder repor.',C.map((c,i)=>`<div class="nvrow nvcf"><div class="nvrt"><b>${esc(nvRotulo(c.parte))}</b> <span class="mut">· ${esc(c.de)} · ${new Date(c.q).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'})}</span></div><div class="nvbtns"><button class="btn sm" data-nvrep2="${i}">Repor</button><button class="btn sm ico" data-nvdel2="${i}" aria-label="Descartar">${ic('x',12)}</button></div></div>`).join('')):''}
  <div class="nvfoot"><span class="mut">${ic('shield',13)} Dados cifrados (AES-256) e acessíveis só com a sua conta Google · <a href="privacidade.html" target="_blank" rel="noopener">Privacidade</a></span></div>
  </div></div>`};
{const _bP=bindNvPainel;bindNvPainel=function(){const r=_bP.apply(this,arguments);try{const s=$('#nv2-sair');if(s)s.onclick=()=>{if(confirm('Terminar a sessão neste aparelho?\n\nOs seus dados continuam guardados na sua conta.'))terminarSessao()};const ag=$('#nv2-agora');if(ag)ag.onclick=async()=>{ag.disabled=true;await nvSincronizar(true);sbRedesenhar()}}catch(e){console.warn(e)}return r}}
/* «Esqueci-me do código de acesso»: confirma-se com a conta Google (já não existe código de encriptação) */
pinRecuperar=async function(){const em=sbEmailApp();if(!em)return;if(!confirm('Esqueceu-se do código de acesso?\n\nPara confirmar que é você, vai entrar outra vez com a conta Google ('+em+'). Depois disso o código antigo é retirado e pode escolher um novo em Definições › Dados e Segurança.\n\nContinuar?'))return;
  try{localStorage.setItem('es.pinrep',JSON.stringify({e:em,q:Date.now()}))}catch(_){}sbTerminar('Entre com a conta '+em+' para retirar o código de acesso.')};

/* Definições › Conta e Acesso: no modo base de dados só se entra com a conta Google — as contas locais e a preparação do Microsoft 365 não se mostram */
{const _vD=vDefinicoes;vDefinicoes=function(){const r=_vD.apply(this,arguments);try{if((UI.defTab||'geral')==='conta')$$('#view .card').forEach(c=>{const h=((c.querySelector('h2')||{}).textContent||'').trim();if(/^Contas Locais/.test(h)||/^Microsoft 365 \(Office\)/.test(h))c.remove()})}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
/* Ajuda: os temas da sincronização antiga dão lugar a um só — entrar com a conta Google */
try{['gsync','nuvem','nuvemcfg'].forEach(id=>{const i=AJUDA.findIndex(a=>a.id===id);if(i>=0)AJUDA.splice(i,1)});
  const aj=(id,t,txt)=>{const a=AJUDA.find(x=>x.id===id);if(a){if(t)a.t=t;a.txt=txt;a.gif=null}else AJUDA.push({id,ic:'cloud',t,gif:null,txt})};
  aj('nuvem2','Usar em vários aparelhos (computador, iPad, telemóvel)',`<p>Abra <b>${esc(location.host||'eduspruce.pt')}</b> em qualquer computador, iPad ou telemóvel e toque em <b>Entrar com Google</b>: os seus dados aparecem logo. Não há códigos, palavras-passe de encriptação nem nada para configurar.</p><ul><li>O que mudar num aparelho aparece nos outros em segundos.</li><li>No iPhone/iPad pode adicionar a app ao ecrã principal (Partilhar › Adicionar ao ecrã principal).</li><li>Nos aparelhos não fica nada guardado: ao <b>terminar a sessão</b>, os dados continuam na sua conta.</li><li>Sem internet, a app avisa; as alterações são guardadas assim que a ligação voltar (mantenha a app aberta).</li></ul>`);
  aj('dados','Dados e Cópias de Segurança',`<p>Os seus dados ficam guardados na sua conta, na <b>base de dados EduSpruce</b> (União Europeia): não dependem do aparelho nem do navegador. Em <b>Definições › Dados e Segurança</b> pode exportar uma cópia (ficheiro JSON, com fotografias) para ter uma reserva sua; e, em <b>Definições › Conta e Dados</b>, ligar uma cópia diária no seu Google Drive.</p>`);
  {const a=AJUDA.find(x=>x.id==='legal');if(a)a.txt=a.txt.replace('(no dispositivo e, se quiser, encriptados na sua nuvem)','(na base de dados EduSpruce, na União Europeia)')}
  {const a=AJUDA.find(x=>x.id==='importados');if(a)a.txt=a.txt.replace('e na sincronização com a conta Google','e fica guardado na sua conta')}}catch(e){console.warn(e)}

/* janela de progresso: título, barra, percentagem, «x de y» e tempo que falta */
function esProgresso(tit,feito,total,sub,t0){let o=$('#ocup');if(!o){o=document.createElement('div');o.id='ocup';o.setAttribute('role','status');document.body.appendChild(o)}
  const pc=total?Math.round(feito/total*100):0;let falta='';if(t0&&feito>2&&feito<total){const s=Math.round((Date.now()-t0)/feito*(total-feito)/1000);falta=s<60?`falta${s===1?'':'m'} ~${Math.max(1,s)} s`:`faltam ~${Math.round(s/60)} min`}
  if(!o.querySelector('.esprg')){o.innerHTML=`<div class="ocb esprg"><div class="esph">${ic('cloud',18)}<b class="espt"></b></div><div class="espb" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i></i></div><div class="espn"><b class="espp"></b><span class="espx"></span><span class="sp1"></span><span class="espf"></span></div><p class="esps"></p></div>`}
  o.classList.add('on');o.querySelector('.espt').textContent=tit;o.querySelector('.espb i').style.width=pc+'%';o.querySelector('.espb').setAttribute('aria-valuenow',pc);
  o.querySelector('.espp').textContent=pc+'%';o.querySelector('.espx').textContent=`${feito} de ${total} partes`;o.querySelector('.espf').textContent=falta;o.querySelector('.esps').textContent=sub||''}
/* ===== Google Drive como cópia de reserva (opcional): a base de dados é o sítio dos dados; o Drive guarda, se quiser, uma cópia cifrada ===== */
/* o estado da cópia (ligada, última cópia, n.º de partes) vai com os dados — vê-se igual em todos os aparelhos; os resumos (hashes) ficam em cada aparelho */
const gdFrio=()=>{let c={};try{c=(S.cfg&&S.cfg.gdFrio)||{}}catch(_){}const l=nvL().gdFrio||{};return {auto:c.auto!=null?c.auto:!!l.auto,ultima:Math.max(c.ultima||0,l.ultima||0),n:c.n||l.n||0,h:nvL().gdFrioH||l.h||{}}};
const gdFrioSet=o=>{const x={...gdFrio(),...o};try{S.cfg.gdFrio={auto:!!x.auto,ultima:x.ultima||0,n:x.n||0};save()}catch(_){}nvSet({gdFrioH:x.h||{},gdFrio:null})};
async function gdTokenOk(interativo){try{await gsToken(interativo?true:'silencioso');return true}catch(_){return false}}
async function gdCopiar(interativo){const L=nvL();if(!window.__esPronto||L.prov!=='supabase'||!(L.k||_nvK))return interativo&&toast('Os dados ainda estão a abrir. Tente dentro de momentos.','erro');
  if(gdCopiar._ocup)return;gdCopiar._ocup=true;try{
  if(interativo)ocupado('A preparar a cópia…');try{await nvSincronizar(false)}catch(_){}
  if(!(await gdTokenOk(interativo))){if(interativo){livre();toast('Não foi possível ligar ao Google Drive.','erro')}return}
  const bd=await PROV.supabase.lista();const N=Object.keys(bd);if(!bd[NV_PREF+'manifest.json'])throw new Error('a base de dados ainda não tem dados');
  const G=PROV.google;const m=await G._mapa(true);let n=0,feito=0;const H={...(gdFrio().h||{})};const t0=Date.now();
  if(interativo)esProgresso('Cópia no Google Drive',0,N.length,'A comparar com a cópia anterior…');
  await nvPool(N,4,async k=>{try{const t=await PROV.supabase.ler(k);if(t==null)return;const hh=nvHash(t);if(m[k]&&H[k]===hh)return;await G.escrever(k,t);H[k]=hh;n++}finally{feito++;if(interativo)esProgresso('Cópia no Google Drive',feito,N.length,n?`${n} parte${n>1?'s':''} atualizada${n>1?'s':''} · ${feito-n} já estava${feito-n===1?'':'m'} em dia`:'A comparar com a cópia anterior…',t0)}});
  Object.keys(H).forEach(k=>{if(!bd[k])delete H[k]});
  /* espelho exato: tira do Drive o que já não existe na base de dados */
  const sobra=Object.keys(m).filter(k=>(k.startsWith(NV_PREF)||k===SB_CH)&&!bd[k]);await nvPool(sobra,4,async k=>{try{await G.apagar(k)}catch(_){}});
  gdFrioSet({ultima:Date.now(),n:N.length,h:H});G._ids=null;try{audit('Conta','Cópia de reserva no Google Drive',N.length+' partes')}catch(_){}
  if(interativo)toast(n?`Cópia guardada no Google Drive: ${n} parte${n>1?'s':''} atualizada${n>1?'s':''} de ${N.length}.`:`A cópia no Google Drive já estava em dia (${N.length} partes).`,'ok');sbRedesenhar()}
  catch(e){if(interativo)toast('Cópia no Google Drive: '+e.message,'erro');else console.warn('[EduSpruce] cópia de reserva:',e.message)}
  finally{gdCopiar._ocup=false;if(interativo)livre()}}
async function gdApagar(){const L=nvL();if(!window.__esPronto||L.prov!=='supabase'||!(L.k||_nvK))return toast('Os dados ainda estão a abrir. Tente dentro de momentos.','erro');
  let bd;try{await nvSincronizar(true);bd=await PROV.supabase.lista()}catch(e){return toast('Não foi possível confirmar a base de dados: '+e.message,'erro')}
  const nb=Object.keys(bd).length;if(!bd[NV_PREF+'manifest.json']||nb<2)return toast('A base de dados ainda não tem os seus dados. Nada foi apagado.','erro');
  if(nvL().erro||Object.keys(nvL().mod||{}).length)return toast('Há alterações por guardar na base de dados. Tente daqui a uns segundos.','erro');
  ocupado('A ligar ao Google Drive…');let m;try{await gsToken(true);m=await PROV.google._mapa(true)}catch(e){livre();return toast('Google Drive: '+e.message,'erro')}livre();
  const N=Object.keys(m||{}).filter(k=>k.startsWith(NV_PREF)||k===SB_CH);if(!N.length){gdFrioSet({auto:false,ultima:0,n:0});sbRedesenhar();return toast('O Google Drive já não tem dados da EduSpruce.','ok')}
  const w=(prompt(`Vai apagar ${N.length} ficheiro${N.length>1?'s':''} da EduSpruce do seu Google Drive (pasta privada da app).\n\nOs dados ficam só na Base de Dados EduSpruce (${nb} partes, confirmadas agora). A cópia diária fica desligada. Não é possível desfazer.\n\nPara confirmar, escreva APAGAR`)||'').trim().toUpperCase();
  if(w!=='APAGAR')return toast('Nada foi apagado.');
  ocupado('A apagar do Google Drive…');let ok=0,f=0;try{await nvPool(N,6,async n=>{try{await PROV.google.apagar(n);ok++}catch(_){f++}})}finally{livre()}
  PROV.google._ids=null;gdFrioSet({auto:false,ultima:0,n:0,h:{}});try{localStorage.removeItem(NV_KEEP)}catch(_){}try{audit('Conta','Dados apagados do Google Drive',ok+' ficheiros')}catch(_){}
  toast(f?`Apagados ${ok}; ${f} não foi possível apagar — tente outra vez.`:`Google Drive limpo: ${ok} ficheiro${ok>1?'s':''} apagado${ok>1?'s':''}. Os dados estão na base de dados.`,f?'erro':'ok');sbRedesenhar()}
/* cópia diária automática (só se estiver ligada): no máximo uma vez por dia, em silêncio */
setInterval(()=>{try{const L=nvL(),F=gdFrio();if(window.__esGdSuspensa!==false)return;if(SESSAO&&window.__esPronto&&L.prov==='supabase'&&F.auto&&(L.k||_nvK)&&navigator.onLine&&document.visibilityState==='visible'&&Date.now()-(F.ultima||0)>864e5)gdCopiar(false)}catch(_){}},60000);
{const _bP=bindNvPainel;bindNvPainel=function(){const r=_bP.apply(this,arguments);try{const c=$('#nv-card');const L=nvL();
  if(c&&L.prov==='supabase'&&!c.querySelector('#nv-gdf')){const F=gdFrio();const s=document.createElement('section');s.className='nvs';s.id='nv-gdf';
    const q=F.ultima?new Date(F.ultima).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'}):'';
    s.innerHTML=`<div class="nvsh"><h3>Cópia de reserva no Google Drive (opcional)</h3><p>Não é preciso para a app funcionar. Se quiser, o seu Google Drive guarda uma segunda cópia dos dados (cifrada, na pasta privada da app).</p></div>
      <div class="nvsb"><label class="chk"><input type="checkbox" id="nv-gdauto" ${F.auto?'checked':''}> Guardar uma cópia por dia, automaticamente</label>
      <p class="hint" style="margin:6px 0 10px">${q?`Última cópia: <b>${esc(q)}</b> · ${F.n||0} partes`:'Ainda não foi feita nenhuma cópia.'}</p>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn" id="nv-gdcp">${ic('upload',15)} Guardar Cópia Agora</button><button type="button" class="btn dng" id="nv-gdx">${ic('trash',15)} Apagar os Dados do Google Drive</button></div>
      <p class="hint" style="margin:8px 0 0">Antes de apagar, a app confirma que a base de dados tem tudo e pede para escrever APAGAR.</p></div>`;
    const foot=c.querySelector('.nvfoot');const card=c.querySelector('.card:not(.nvhero)')||c;if(foot)card.insertBefore(s,foot);else card.appendChild(s);
    s.querySelector('#nv-gdcp').onclick=()=>gdCopiar(true);s.querySelector('#nv-gdx').onclick=gdApagar;
    s.querySelector('#nv-gdauto').onchange=e=>{gdFrioSet({auto:e.target.checked});toast(e.target.checked?'Cópia diária no Google Drive ligada.':'Cópia diária desligada. A cópia que já existe fica no Drive até a apagar.','ok');if(e.target.checked&&!gdFrio().ultima)gdCopiar(true)}}}catch(e){console.warn(e)}return r}}

/* ===== v0.940 · Recuperar uma cópia anterior (Google Drive) — mostra o que tem e só repõe se a pessoa confirmar; o estado atual fica guardado antes ===== */
function recResumo(st){const anos=(st&&st.anos)||[];return anos.map(a=>({nome:a.nome||'(sem nome)',turmas:(a.turmas||[]).map(t=>({nome:(t.nome||'')+(t.disciplina?' · '+t.disciplina:''),al:(t.alunos||[]).length,kb:Math.round(JSON.stringify(t).length/1024)}))}))}
function recHtml(R){if(!R.length)return '<p class="mut">Sem anos letivos.</p>';return R.map(a=>`<div class="recano"><b>${esc(a.nome)}</b> <span class="mut">· ${a.turmas.length} turma${a.turmas.length===1?'':'s'} · ${a.turmas.reduce((x,t)=>x+t.al,0)} alunos</span><ul>${a.turmas.map(t=>`<li>${esc(t.nome)} <span class="mut">— ${t.al} alunos · ${t.kb} kB</span></li>`).join('')}</ul></div>`).join('')}
async function recDrive(){if(!window.__esPronto)return toast('Os dados ainda estão a abrir.','erro');ocupado('A ligar ao Google Drive…');
  try{await gsToken(true)}catch(e){livre();return toast('Google Drive: '+((e&&e.message)||'não foi possível ligar'),'erro')}
  let st,man;try{const G=PROV.google;await G._mapa(true);const mt=await G.ler('ef-manifest.json');if(!mt){livre();return toast('O Google Drive não tem nenhuma cópia da EduSpruce.','aviso')}
    man=JSON.parse(mt);const k=await nvChave();if(man.chk){let ok=false;try{ok=await nvDecifrar(man.chk,k)==='eduflow'}catch(_){}if(!ok)throw new Error('a cópia do Drive foi cifrada com outra chave')}
    const P={};const N=Object.keys(man.partes||{});let i=0;await nvPool(N,4,async n=>{ocupado('A ler a cópia do Google Drive… '+(++i)+'/'+N.length);const t=await G.ler('ef-'+n+'.bin');if(t!=null)P[n]=JSON.parse(await nvDecifrar(t,k))});
    st=nvMontar(P)}catch(e){livre();return toast('Cópia do Google Drive: '+((e&&e.message)||e),'erro')}livre();
  const q=man.q?new Date(man.q).toLocaleString('pt-PT',{dateStyle:'full',timeStyle:'short'}):'(data desconhecida)';
  const d=document.createElement('dialog');d.className='nvmc recdlg';d.innerHTML=`<form method="dialog" class="nvmcf"><h2>${ic('refresh',18)} Cópia encontrada no Google Drive</h2>
    <p class="hint">Gravada a <b>${esc(q)}</b>${man.dev?' · pelo aparelho '+esc(man.dev):''}. Compare com o que está agora na base de dados.</p>
    <div class="recg"><div><h3>Agora na base de dados</h3>${recHtml(recResumo(S))}</div><div><h3>Na cópia do Google Drive</h3>${recHtml(recResumo(st))}</div></div>
    <p class="hint">Ao repor, os dados atuais ficam guardados na base de dados (cópia automática) — é possível voltar atrás.</p>
    <div class="row" style="gap:8px;justify-content:flex-end;flex-wrap:wrap"><button value="" class="btn">Cancelar</button><button value="sim" class="btn pri" id="rec-ok">${ic('check',15)} Repor Esta Cópia</button></div></form>`;
  document.body.appendChild(d);d.showModal();d.addEventListener('close',async()=>{const v=d.returnValue;d.remove();if(v!=='sim')return;
    const prob=validarCopia(st);if(prob.length)return toast('A cópia tem um problema: '+prob[0],'erro');
    ocupado('A guardar o estado atual e a repor a cópia…');try{const p=await sbObter();const L=await p.lista();
      for(const n of Object.keys(L).filter(x=>SB_BK_RX.test(x)))await sbCopiaAntes(p,n,true);
      S=migrate(st);saveNow();const r=await nvSincronizar(true);if(!r)throw new Error(nvL().erro||'não foi possível gravar');
      try{audit('Conta','Cópia do Google Drive reposta',q)}catch(_){}livre();go('inicio');toast('Cópia reposta. O estado anterior ficou guardado.','ok')}
    catch(e){livre();toast('Não foi possível repor: '+((e&&e.message)||e),'erro')}})}
/* palavra-passe de reserva: segunda forma de entrar na mesma conta, sem depender do Google */
function sbSenhaDlg(){$$('dialog.nvmc.sbpw').forEach(x=>x.remove());const d=document.createElement('dialog');d.className='nvmc sbpw';
  d.innerHTML=`<form class="nvmcf" onsubmit="return false"><h2>${ic('cadeado',18)} Palavra-passe de reserva</h2><p class="hint">Serve para entrar na <b>mesma conta</b> (${esc((SESSAO&&SESSAO.u)||'')}) com e-mail e palavra-passe, em «Outra forma de entrar», quando não puder usar o Google. Mínimo de 10 caracteres. Não fica guardada na app.</p>
    <label for="sbpw-1">Nova palavra-passe</label><input type="password" id="sbpw-1" autocomplete="new-password" minlength="10"><label for="sbpw-2">Repetir</label><input type="password" id="sbpw-2" autocomplete="new-password" minlength="10">
    <p class="nverr" role="alert" id="sbpw-e"></p><div class="row" style="gap:8px;justify-content:flex-end"><button type="button" class="btn" id="sbpw-c">Cancelar</button><button type="submit" class="btn pri" id="sbpw-ok">Guardar</button></div></form>`;
  document.body.appendChild(d);d.showModal();const fim=()=>{try{d.close()}catch(_){}d.remove()};d.addEventListener('cancel',e=>{e.preventDefault();fim()});d.querySelector('#sbpw-c').onclick=fim;
  d.querySelector('form').onsubmit=async ev=>{ev.preventDefault();const a=d.querySelector('#sbpw-1').value,b=d.querySelector('#sbpw-2').value,e=d.querySelector('#sbpw-e'),ok=d.querySelector('#sbpw-ok');
    if(a.length<10){e.textContent='Use pelo menos 10 caracteres.';return}if(a!==b){e.textContent='As duas palavras-passe não são iguais.';return}
    ok.disabled=true;ok.textContent='A guardar…';try{await (await sbObter()).definirSenha(a);try{localStorage.setItem('es.lge',(SESSAO&&SESSAO.u)||'')}catch(_){}try{audit('Segurança','Palavra-passe de reserva definida','')}catch(_){}fim();toast('Palavra-passe de reserva guardada. Pode entrar por «Outra forma de entrar».','ok')}
    catch(x){e.textContent=(x&&x.message)||'Não foi possível guardar.';ok.disabled=false;ok.textContent='Guardar'}}}
{const _bS=bindNvPainel;bindNvPainel=function(){const r=_bS.apply(this,arguments);try{const c=$('#nv-card');if(c&&nvL().prov==='supabase'&&!c.querySelector('#nv-pw')){const s=document.createElement('section');s.className='nvs';s.id='nv-pw';
    s.innerHTML=`<div class="nvsh"><h3>Palavra-passe de reserva</h3><p>Uma segunda forma de entrar na sua conta, sem depender do Google: e-mail e palavra-passe, em «Outra forma de entrar» no ecrã de entrada.</p></div><div class="nvsb"><button type="button" class="btn" id="nv-pwb">${ic('cadeado',15)} Definir ou Mudar a Palavra-passe</button></div>`;
    const foot=c.querySelector('.nvfoot');const card=c.querySelector('.card:not(.nvhero)')||c;if(foot)card.insertBefore(s,foot);else card.appendChild(s);s.querySelector('#nv-pwb').onclick=sbSenhaDlg}}catch(e){console.warn(e)}return r}}
(()=>{const st=document.createElement('style');st.textContent='#login .lgoutra{display:block;margin:10px auto 0;background:none;border:0;color:var(--acc,#0e6a93);font:inherit;font-size:14px;text-decoration:underline;cursor:pointer;min-height:36px}#login .lgalt{display:flex;flex-direction:column;gap:6px;margin-top:14px;text-align:left}#login .lgalt[hidden]{display:none}#login .lgalt label{font-size:13px;font-weight:700}#login .lgalt input{min-height:46px;font-size:16px}#login .lgalt .btn{margin-top:8px;min-height:46px;justify-content:center}dialog.sbpw input{width:100%;min-height:44px;margin:4px 0 8px}';document.head.appendChild(st)})();
{const _bR=bindNvPainel;bindNvPainel=function(){const r=_bR.apply(this,arguments);try{const c=$('#nv-card');if(c&&nvL().prov==='supabase'&&!c.querySelector('#nv-rec')){const s=document.createElement('section');s.className='nvs';s.id='nv-rec';
    s.innerHTML=`<div class="nvsh"><h3>Recuperar uma cópia anterior</h3><p>Se alguma coisa desapareceu, procure uma cópia mais antiga e compare antes de repor. Nada é substituído sem confirmar.</p></div><div class="nvsb"><button type="button" class="btn" id="nv-recgd">${ic('search',15)} Procurar Cópia no Google Drive</button></div>`;
    const foot=c.querySelector('.nvfoot');const card=c.querySelector('.card:not(.nvhero)')||c;if(foot)card.insertBefore(s,foot);else card.appendChild(s);s.querySelector('#nv-recgd').onclick=recDrive}}catch(e){console.warn(e)}return r}}
(()=>{const st=document.createElement('style');st.textContent='.recdlg{max-width:min(860px,96vw);width:860px}.recg{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-height:52vh;overflow:auto;margin:10px 0}.recg h3{margin:0 0 6px;font-size:14px}.recano{margin:0 0 10px}.recano ul{margin:4px 0 0;padding-left:18px;font-size:13px}@media(max-width:700px){.recg{grid-template-columns:1fr}}';document.head.appendChild(st)})();

/* aviso claro quando a base de dados recusa gravar (em vez de terminar a sessão sem explicação) */
function esSemGravar(det){let o=$('#essemgrav');if(!o){o=document.createElement('div');o.id='essemgrav';o.setAttribute('role','alert');document.body.appendChild(o)}
  o.innerHTML=`<b>${ic('alert',16)} As alterações não estão a ser guardadas</b><span>${esc(String(det||''))}</span><button type="button" class="btn sm" id="essg-x">Fechar</button>`;o.querySelector('#essg-x').onclick=()=>o.remove()}
(()=>{const st=document.createElement('style');st.textContent='#essemgrav{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:100001;max-width:min(680px,94vw);display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;padding:12px 16px;border-radius:14px;background:#7f1d1d;color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.4);font-size:14px}#essemgrav b{display:flex;gap:6px;align-items:center}#essemgrav span{flex:1 1 260px;opacity:.9;font-size:12.5px;word-break:break-word}#essemgrav .btn{background:rgba(255,255,255,.14);color:#fff;border-color:transparent}';document.head.appendChild(st)})();

/* ===== a lista «Quem Pode Entrar com Google» (Definições › Conta e Acesso) manda também na base de dados =====
   só o administrador a envia; vai a impressão digital de cada e-mail (como no eduspruce-config.json), nunca o e-mail */
async function sbContasLista(){const M=new Map();let C=null;try{C=await acCentral()}catch(_){}if(!C||!C.ok||!Array.isArray(C.contas))return null; /* sem a lista do site não se mexe em nada */
  C.contas.forEach(x=>M.set(x.h,x.papel||'professor'));
  for(const x of (acLocal().gContas||[])){if(x&&x.email){try{M.set(await acHash(x.email),x.papel||'professor')}catch(_){}}}return M}
async function sbContasSincronizar(forcar){try{if(!SESSAO||!window.__esPronto||SESSAO.papel!=='admin'||nvL().prov!=='supabase'||!nvL().sb)return;const p=await sbObter();
  const M=await sbContasLista();if(!M||!M.size)return;const assin=[...M].sort().join('|');if(!forcar&&assin===sbContasSincronizar._a)return;
  if(sbContasSincronizar._parado)return;const sb=p.cliente;const {data:bd,error}=await sb.from('eduspruce_autorizados').select('h,papel');if(error){/* sem o script das contas no Supabase: pára até recarregar, para não encher os registos de erros */if(/42501|PGRST|permission|does not exist/i.test((error.code||'')+' '+error.message))sbContasSincronizar._parado=true;return console.warn('[EduSpruce] contas na base de dados:',error.message)}
  const tem=new Map((bd||[]).map(r=>[r.h,r.papel]));const juntar=[...M].filter(([h,pp])=>tem.get(h)!==pp).map(([h,papel])=>({h,papel}));
  if(juntar.length){const r=await sb.from('eduspruce_autorizados').upsert(juntar,{onConflict:'h'});if(r.error)return console.warn(r.error.message)}
  const tirar=[...tem.keys()].filter(h=>!M.has(h));if(tirar.length){const r=await sb.from('eduspruce_autorizados').delete().in('h',tirar);if(r.error)console.warn(r.error.message)}
  sbContasSincronizar._a=assin;if(juntar.length||tirar.length){try{audit('Conta','Contas autorizadas na base de dados',`+${juntar.length} −${tirar.length}`)}catch(_){}if(forcar)toast('Base de dados atualizada: '+M.size+' conta'+(M.size>1?'s':'')+' autorizada'+(M.size>1?'s':'')+'.','ok')}}
  catch(e){console.warn('[EduSpruce] contas na base de dados:',e.message)}}
setInterval(()=>sbContasSincronizar(false),15000);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#ac-add,#ac-col,[data-acdel],[data-acpp],#view select');if(b&&VIEW==='definicoes')setTimeout(()=>sbContasSincronizar(true),900)},true);
document.addEventListener('change',e=>{if(VIEW==='definicoes'&&e.target.closest&&e.target.closest('.card'))setTimeout(()=>sbContasSincronizar(false),900)},true);

/* ===== dados só na base de dados (sem cópia neste aparelho) ===== */
if(nvL().semSync)nvSet({semSync:false,prov:nvL().prov||'supabase'});
/* ficha MRA (antes só neste aparelho): vai com os dados, numa parte própria */
window.__esMraMud=()=>{clearTimeout(window.__esMraMud._t);window.__esMraMud._t=setTimeout(()=>{try{save()}catch(_){}},400)};
{const _p=nvPartes;nvPartes=function(){const P=_p.apply(this,arguments);try{const o={};Object.keys(ES_MEM).filter(k=>k.startsWith('mra.')).sort().forEach(k=>o[k]=ES_MEM[k]);if(Object.keys(o).length)P['loc-mra']=o}catch(_){}return P}}
{const _m=nvMontar;nvMontar=function(P){try{const o=P&&P['loc-mra'];if(o&&typeof o==='object')Object.keys(o).forEach(k=>{if(k.startsWith('mra.'))ES_MEM[k]=String(o[k])})}catch(_){}return _m.apply(this,arguments)}}
/* evidências (fotografia, áudio, ficheiro por aluno): deixam o IndexedDB e vão cifradas com os anexos */
const evMetaDe=(t,instId,aid,criar)=>{if(!t)return [];if(criar){t.evMeta=t.evMeta||{};t.evMeta[instId]=t.evMeta[instId]||{};t.evMeta[instId][aid]=t.evMeta[instId][aid]||[]}return ((t.evMeta||{})[instId]||{})[aid]||[]};
const evParaURL=b=>new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>ko(r.error);r.readAsDataURL(b)});
evLista=async function(t,instId,aid){const M=evMetaDe(t,instId,aid);const out=[];for(const m of M){const d=FOTOS['ev-'+m.id];let blob=null;if(d){try{blob=await (await fetch(d)).blob()}catch(_){}}out.push({...m,k:evKey(t,instId,aid),t:t.id,inst:instId,aluno:aid,blob:blob||new Blob([],{type:m.mime||''}),falta:!d})}return out.sort((a,b)=>a.q-b.q)};
evGuardar=async function(t,instId,aid,blob,nome,tipo){const id=uid()+Math.random().toString(36).slice(2,5);FOTOS['ev-'+id]=await evParaURL(blob);evMetaDe(t,instId,aid,true).push({id,tipo,nome:nome||'',mime:blob.type,tam:blob.size,q:Date.now()});evSetConta(t,instId,aid,evMetaDe(t,instId,aid).length);return id};
evApagar=async function(t,instId,aid,id){const M=evMetaDe(t,instId,aid,true);const i=M.findIndex(x=>x.id===id);if(i>=0)M.splice(i,1);delete FOTOS['ev-'+id];evSetConta(t,instId,aid,M.length)};
async function esMigrarEvidencias(){try{if(!indexedDB.databases)return 0;const L=await indexedDB.databases();if(!L.some(d=>d.name===EV_DB))return 0;
  const recs=await evTx('readonly',st=>new Promise(ok=>{const q=st.getAll();q.onsuccess=()=>ok(q.result||[]);q.onerror=()=>ok([])}));let n=0;
  for(const r of recs){let t=null;for(const a of S.anos)for(const x of a.turmas)if(x.id===r.t)t=x;if(!t||!r.blob)continue;const M=evMetaDe(t,r.inst,r.aluno,true);if(M.some(m=>m.id===r.id))continue;
    FOTOS['ev-'+r.id]=await evParaURL(r.blob);M.push({id:r.id,tipo:r.tipo,nome:r.nome||'',mime:r.mime||r.blob.type,tam:r.tam||r.blob.size,q:r.q||Date.now()});evSetConta(t,r.inst,r.aluno,M.length);n++}
  if(n){save();try{audit('Conta','Evidências passadas para a base de dados',n+'')}catch(_){}}return recs.length}catch(e){console.warn('[EduSpruce] evidências:',e);return -1}}
/* depois da 1.ª gravação completa na base de dados, apaga a cópia antiga que ficou no aparelho (estado, cópias, fotografias, evidências) */
let _esLimpo=false,_esEvMig=false;
async function esLimparAparelho(){if(_esLimpo)return;const L=nvL();if(L.prov!=='supabase'||Object.keys(L.mod||{}).length||L.erro)return;
  if(!_esEvMig){_esEvMig=true;const n=await esMigrarEvidencias();if(n>0){setTimeout(()=>{try{nvSincronizar(false)}catch(_){}},300);return}}
  _esLimpo=true;nvSet({sbOk:true});
  try{Object.keys(localStorage).forEach(k=>{if(ES_DADOS(k))window.__esLS.ri.call(localStorage,k)})}catch(_){}
  try{if(IDB){const tx=IDB.transaction(['estado','fotos'],'readwrite');tx.objectStore('estado').clear();tx.objectStore('fotos').clear()}}catch(_){}
  try{indexedDB.deleteDatabase(EV_DB)}catch(_){}
  try{localStorage.removeItem('eskeep')}catch(_){}}
/* a app só fala com a base de dados depois de os dados da conta terem chegado; sessão terminada ou conta retirada → ecrã de entrada */
{const _ns=nvSincronizar;nvSincronizar=async function(){if(nvL().prov==='supabase'&&!window.__esPronto&&!_esDentro)return null;
  const r=await _ns.apply(this,arguments);
  try{if(r&&nvL().prov==='supabase')setTimeout(esLimparAparelho,200);
    if(!r&&window.__esPronto){const e=nvL().erro||'';if(/sessão terminou/i.test(e))sbTerminar(e);
      else if(/não está autorizada|recusou a operação/i.test(e)){/* v0.948 · uma gravação recusada não é o mesmo que a conta não estar autorizada: só sai se a conta deixou mesmo de estar autorizada */
        let aut=true;try{aut=await (await sbObter()).autorizado()}catch(_){}
        if(!aut)sbTerminar('A conta '+((SESSAO&&SESSAO.u)||'')+' não está autorizada a usar a EduSpruce. Peça ao administrador para a acrescentar.');
        else if(!esSemGravar._q||Date.now()-esSemGravar._q>60000){esSemGravar._q=Date.now();esSemGravar(e)}}}}catch(_){}
  return r}}
(()=>{const st=document.createElement('style');st.textContent=`#esbar{position:fixed;top:0;left:0;right:0;height:3px;z-index:99999;pointer-events:none;opacity:0;transition:opacity .25s}#esbar.on{opacity:1}#esbar i{display:block;height:100%;width:40%;background:var(--acc,#1b93c6);animation:esbarra 1.1s ease-in-out infinite}@keyframes esbarra{0%{transform:translateX(-100%)}100%{transform:translateX(260%)}}
body.es-abrir #view,body.es-abrir #barx,body.es-abrir #nffab,body.es-abrir #tabbar .tbdg{display:none!important}
#escofre{position:fixed;inset:0;z-index:190;background:var(--bg,#f3f6f8);display:grid;place-items:center}#escofre i{width:34px;height:34px;border-radius:50%;border:3px solid color-mix(in srgb,var(--acc,#0e6a93) 25%,transparent);border-top-color:var(--acc,#0e6a93);animation:escf .8s linear infinite}@keyframes escf{to{transform:rotate(360deg)}}
#esabrir{flex:1;min-height:0;overflow:hidden;padding:20px;box-sizing:border-box}body.dev-tlm #esabrir{padding:12px}
.eskg{display:grid;gap:14px;max-width:1100px}.esk{border-radius:14px;background:linear-gradient(100deg,color-mix(in srgb,var(--mut,#777) 13%,transparent) 30%,color-mix(in srgb,var(--mut,#777) 6%,transparent) 50%,color-mix(in srgb,var(--mut,#777) 13%,transparent) 70%);background-size:300% 100%;animation:eskb 1.4s ease-in-out infinite;height:64px}
.eskh{height:34px;width:min(320px,60%)}.eskr{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.eskr .esk{height:86px}.eskc{display:grid;grid-template-columns:2fr 1fr;gap:14px}.eskb{height:190px}.eskl{height:54px}.eskl.c{width:70%}
@media (max-width:700px){.eskr{grid-template-columns:repeat(2,1fr)}.eskc{grid-template-columns:1fr}.eskb{height:130px}}
@keyframes eskb{0%{background-position:100% 0}100%{background-position:-100% 0}}@media (prefers-reduced-motion:reduce){.esk{animation:none}#esbar i{animation:none;width:100%}}
body.est-sge .esk{border-radius:0}
.esmsg{max-width:460px;margin:8vh auto 0;text-align:center;display:grid;gap:10px;justify-items:center;padding:28px 22px;background:var(--panel,#fff);border:1px solid var(--line,#ddd);border-radius:18px}.esmsg .esmi{color:var(--acc,#1b93c6);display:flex}.esmsg h2{margin:0;font-size:20px;color:var(--ink,#222);text-transform:none}.esmsg p{margin:0 0 6px;color:var(--mut,#666);line-height:1.45}body.est-sge .esmsg{border-radius:0}
#nv-card .nvobr{display:none!important}#nv-badge{display:none!important}
#login .lgbd .lggd{width:100%;min-height:52px;font-size:16px}#login .lgbd .lggd.ocp{opacity:.75;cursor:progress}#login .lgbd .lgerr{margin-top:10px}#login .lgbd .lgerr:empty{display:none}
.lgbdn{font-size:12.5px;line-height:1.45;color:var(--mut);margin:12px 0 4px;display:flex;gap:6px;align-items:flex-start}.lgbdn .ic{flex:none;margin-top:2px;color:var(--acc)}.lgbdn>span{flex:1;min-width:0}
.sbcod .sbcalt{display:flex;gap:6px;align-items:flex-start;margin:12px 0 0;padding-top:12px;border-top:1px solid var(--line,#ddd)}.sbcod .sbcalt .ic{flex:none;margin-top:2px;color:var(--acc)}.sbcod .sbcalt>span{flex:1;min-width:0}
.nvbd.gira .ic{animation:nvgira 1s linear infinite}`;document.head.appendChild(st)})();
/* arranque: se já há sessão neste aparelho, a página abre logo com o esqueleto e os dados chegam a seguir */
try{if(sbGuardada()&&!/[?&]code=/.test(location.search)){document.body.classList.remove('login-on');esEsqueleto('abrir')}}catch(_){}
/* v0.945 · a app confirma sozinha se está na versão mais recente (ao abrir, ao voltar à app e de 10 em 10 minutos); se não estiver, limpa a cópia guardada e recarrega — uma vez por versão */
async function esVerNova(){try{if(!navigator.onLine||esVerNova._on)return;esVerNova._on=1;const r=await fetch('versao.json?_='+Date.now().toString(36),{cache:'no-store'});if(!r.ok)return;const j=await r.json();const nova=String(j.v||'');const minha=String(VERSAO).replace(/DB$/,'');
    if(!nova||esVer(nova)<=esVer(minha))return;let ja='';try{ja=sessionStorage.getItem('es.vnova')||''}catch(_){}if(ja===nova)return;try{sessionStorage.setItem('es.vnova',nova)}catch(_){}
    /* não interromper quem está a escrever ou com uma janela aberta: espera por um momento calmo */
    const calmo=()=>!document.querySelector('dialog[open],#drawer.on,#pinlock')&&!/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||'')&&!(document.activeElement||{}).isContentEditable;
    const vai=async()=>{try{saveNow()}catch(_){}try{if(typeof nvSincronizar==='function'&&window.__esPronto)await Promise.race([nvSincronizar(false),new Promise(r=>setTimeout(r,4000))])}catch(_){}
      try{const K=await caches.keys();await Promise.all(K.map(k=>caches.delete(k)))}catch(_){}try{const R=await navigator.serviceWorker.getRegistrations();await Promise.all(R.map(x=>x.update().catch(()=>{})))}catch(_){}
      try{esLocGuardar()}catch(_){}window.__esSair=true;location.replace(location.pathname+'?_v='+encodeURIComponent(nova))};
    const tenta=()=>{if(calmo())vai();else setTimeout(tenta,5000)};tenta()}catch(_){}finally{esVerNova._on=0}}
setTimeout(esVerNova,2500);setInterval(esVerNova,600000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(esVerNova,800)});
try{if(/[?&]_v=/.test(location.search)&&!/[?&]code=/.test(location.search))history.replaceState(null,'',location.pathname+location.hash)}catch(_){}
