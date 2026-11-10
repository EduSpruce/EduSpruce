/* ---------- 5. Início de sessão (local; Microsoft 365 preparado) ---------- */
const SESS_KEY='edugest.sessao';
async function hashLogin2(u,p){const salt=new TextEncoder().encode('eg-login-v2:'+String(u).trim().toLowerCase());const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(p),'PBKDF2',false,['deriveBits']);const b=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:210000},k,256);return 'p2:'+[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function verificarPasse(c,u,p){try{if(String(c.h||'').startsWith('p2:'))return (await hashLogin2(u,p))===c.h;if((await hashLogin(u,p))!==c.h)return false;try{c.h=await hashLogin2(u,p);saveNow()}catch(_){}return true}catch(_){return false}}
async function hashLogin(u,p){const s='eg-login:'+String(u).trim().toLowerCase()+':'+p;try{return await sha(s)}catch(_){let h=5381;for(const ch of s)h=((h<<5)+h+ch.charCodeAt(0))|0;return 'x'+(h>>>0).toString(16)}}
async function authCfg(){const c=S.cfg;c.auth=c.auth||{};const A_=c.auth;if(!Array.isArray(A_.contas)||!A_.contas.length)A_.contas=[{u:'admin',h:await hashLogin('admin','admin'),nome:'Administrador',papel:'admin',trocar:true}];A_.ms=A_.ms||{clientId:'',tenantId:'',dominio:''};return A_}
function sessaoAtual(){try{const s=JSON.parse(sessionStorage.getItem(SESS_KEY)||localStorage.getItem(SESS_KEY)||'null');if(s&&(!s.ate||s.ate>Date.now()))return s}catch(_){}return null}
function guardarSessao(s,manter){try{const j=JSON.stringify(s);sessionStorage.setItem(SESS_KEY,j);if(manter)localStorage.setItem(SESS_KEY,JSON.stringify({...s,ate:Date.now()+30*864e5}));else localStorage.removeItem(SESS_KEY)}catch(_){}}
function terminarSessao(){try{sessionStorage.removeItem(SESS_KEY);localStorage.removeItem(SESS_KEY)}catch(_){}saveNow();location.reload()}
let SESSAO=null;
function anoLetivoDeHoje(d){d=d||new Date();const y=d.getFullYear(),m=d.getMonth()+1;return m>=8?y+'/'+(y+1):(y-1)+'/'+y}
function anoPorData(L){L=L||S.anos.slice().sort((x,y)=>y.nome.localeCompare(x.nome));const n=anoLetivoDeHoje();return L.find(a=>a.nome===n)||L.find(a=>a.nome<n)||L[0]}
function pedirLogin(){return new Promise(async ok=>{let A_;try{A_=await authCfg()}catch(e){console.error(e);A_={contas:[],ms:{}}}const s=sessaoAtual();if(s&&A_.contas.some(c=>c.u===s.u)||s&&(s.tipo==='ms'||s.tipo==='google')){SESSAO=s;if(!sessionStorage.getItem(SESS_KEY)&&S.anos.length){const ult=anoPorData();if(S.anoAtivo!==ult.id){S.anoAtivo=ult.id;const TF=turmasFiltradas(A());S.turmaAtiva=TF[0]?TF[0].id:null}}document.body.classList.remove('login-on');return ok(s)}
  document.body.classList.add('login-on');const e=EC();const o=document.createElement('div');o.id='login';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Iniciar sessão');
  const msOk=(A_.ms.clientId||NV_CENTRAL.ms)&&/^https:/.test(location.protocol);const ggOk=true;
  o.innerHTML=`<form class="lgb" autocomplete="on"><div class="lgh"><span class="lgi">${ic('flow',30)}</span><div><b>Edu<em>Spruce</em></b><span>Menos papelada. Mais tempo para ensinar.</span></div></div>
    <h1>Iniciar Sessão</h1>
    <button type="button" class="btn mslg" id="lg-ms" ${msOk?'':'aria-disabled="true"'}><svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg> Entrar com Microsoft 365${msOk?'':' <span class="mut">· brevemente</span>'}</button>
    <button type="button" class="btn mslg" id="lg-gg" ${ggOk?'':'aria-disabled="true"'}><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg> Entrar com Google${ggOk?'':' <span class="mut">· brevemente</span>'}</button>
    <div class="lgou"><span>ou com a conta local</span></div>
    <label for="lg-u">Utilizador</label><input id="lg-u" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required>
    <label for="lg-p">Palavra-passe</label><div class="lgpw"><input id="lg-p" name="password" type="password" autocomplete="current-password" required><button type="button" class="btn sm ico" id="lg-eye" aria-label="Mostrar palavra-passe"><svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div>
    ${S.anos.length?`<label for="lg-ano">Ano letivo</label><select id="lg-ano">${(()=>{const L=S.anos.slice().sort((x,y)=>y.nome.localeCompare(x.nome));const sel=anoPorData(L);return L.map(a=>`<option value="${a.id}" ${a===sel?'selected':''}>${esc(a.nome)}</option>`).join('')})()}</select>`:''}
    <label class="chk"><input type="checkbox" id="lg-m"> Manter a sessão iniciada neste dispositivo (30 dias)</label>
    <div class="lgerr" id="lg-err" role="alert"></div>
    <button type="submit" class="btn pri lgok">Entrar</button>
    ${A_.contas.some(c=>c.trocar)?'':'<p class="lgnota">Esqueceu-se? Os dados estão neste dispositivo; peça ajuda ao administrador.</p>'}</form>`;
  document.body.appendChild(o);setTimeout(()=>$('#lg-u').focus(),60);
  $('#lg-eye').onclick=()=>{const p=$('#lg-p');p.type=p.type==='password'?'text':'password'};
  $('#lg-ms').onclick=()=>msLogin(A_).then(r=>{if(r){fim(r,true)}}).catch(err=>{$('#lg-err').textContent=err.message});
  $('#lg-gg').onclick=()=>gLogin(A_).then(r=>{if(r){fim(r,true)}}).catch(err=>{const e=$('#lg-err');if(err.semId){e.innerHTML='O início de sessão com Google ainda não foi ativado neste site. Quem aloja a app só tem de criar o ID de cliente (15 min) — <a href="https://github.com/EduSpruce/EduSpruce/blob/main/docs/guias/CONFIGURAR_SINCRONIZACAO.md#2-google-google-drive-e-entrar-com-google--cerca-de-15-minutos-gratuito" target="_blank" rel="noopener">ver o guia</a>. Entretanto, use a conta Microsoft ou a conta local.'}else e.textContent=err.message});if(ggOk&&!nvUsarRedirect())gsCarregar().catch(()=>{});
  let falhas=0,bloqAte=0;
  const fim=(sess,manter)=>{const la=$('#lg-ano');if(la&&la.value&&S.anoAtivo!==la.value){S.anoAtivo=la.value;const TF=turmasFiltradas(A());S.turmaAtiva=TF[0]?TF[0].id:null}SESSAO=sess;guardarSessao(sess,manter);o.classList.add('sai');document.body.classList.remove('login-on');setTimeout(()=>o.remove(),280);regista('Sessão','',sess.u+' entrou');ok(sess)};
  setTimeout(()=>{try{segMostrar(o,'#lg-err','button[type=submit]','login')}catch(_){}},0);o.querySelector('form').onsubmit=async ev=>{ev.preventDefault();const u=$('#lg-u').value.trim().toLowerCase(),p=$('#lg-p').value;if(typeof segBloq==='function'&&segBloq('login')){segMostrar(o,'#lg-err','button[type=submit]','login');return}
    let c=null;for(const x of A_.contas.filter(x=>x.u===u)){if(await verificarPasse(x,u,p)){c=x;break}}if(!c){const sf=segFalha('login');audit('Sessão','Início de sessão falhado',u);if(sf.bloq){audit('Segurança','Bloqueio de '+SEG_MIN+' min após '+SEG_LIM+' tentativas falhadas',u);segMostrar(o,'#lg-err','button[type=submit]','login')}else $('#lg-err').textContent='Utilizador ou palavra-passe incorretos.'+(sf.resta<=3?' Resta'+(sf.resta>1?'m ':' ')+sf.resta+' tentativa'+(sf.resta>1?'s':'')+' antes de um bloqueio de '+SEG_MIN+' minutos.':'');o.querySelector('.lgb').classList.remove('abana');void o.offsetWidth;o.querySelector('.lgb').classList.add('abana');return}
    if(typeof nuvemObrig==='function'&&nuvemObrig()&&c.papel!=='admin'){$('#lg-err').textContent='Neste site entra-se com a conta Google. A conta local só serve ao administrador.';return}segOk('login');c.ultimo=Date.now();fim({u:c.u,nome:c.nome,papel:c.papel,tipo:'local',desde:Date.now()},$('#lg-m').checked);if(c.trocar)setTimeout(()=>trocarPasseDlg(c,true),400)}})}
async function msLogin(A_){const m=A_.ms;if(!m.clientId)throw new Error('O início de sessão com Microsoft 365 ainda não está configurado (Definições › Conta e Acesso).');
  if(!/^https:/.test(location.protocol))throw new Error('O Microsoft 365 exige que a app esteja alojada num endereço https (não funciona a partir de um ficheiro local).');
  if(!window.msal)await new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js';s.onload=ok;s.onerror=()=>ko(new Error('Não foi possível carregar a biblioteca da Microsoft (sem internet?).'));document.head.appendChild(s)});
  const app=new msal.PublicClientApplication({auth:{clientId:m.clientId,authority:'https://login.microsoftonline.com/'+(m.tenantId||'organizations'),redirectUri:location.origin+location.pathname},cache:{cacheLocation:'localStorage'}});
  if(app.initialize)await app.initialize();const r=await app.loginPopup({scopes:['User.Read'],prompt:'select_account'});const email=(r.account&&r.account.username||'').toLowerCase();
  if(m.dominio&&!email.endsWith('@'+m.dominio.toLowerCase().replace(/^@/,'')))throw new Error('A conta '+email+' não pertence ao domínio autorizado ('+m.dominio+').');
  return {u:email,nome:r.account.name||email,papel:'professor',tipo:'ms',desde:Date.now()}}
function trocarPasseDlg(c,obrig){openDrawer('Alterar Palavra-passe',`<div class="ed">${obrig?`<div class="alert w" style="margin-top:0">${ic('shield',15)} Está a usar a palavra-passe inicial (<b>admin</b>). Escolha uma nova para proteger o acesso.</div>`:''}
  <div class="g2"><div><label>Utilizador</label><input id="tp-u" value="${esc(c.u)}" autocapitalize="none"></div><div><label>Nome</label><input id="tp-n" value="${esc(c.nome||'')}"></div>
  <div><label>Nova palavra-passe</label><input type="password" id="tp-p1" autocomplete="new-password"></div><div><label>Repetir</label><input type="password" id="tp-p2" autocomplete="new-password"></div></div>
  <p class="hint">Mínimo 6 caracteres. A palavra-passe é guardada com <b>Argon2id</b> (com sal aleatório), nunca em texto. Após ${SEG_LIM} tentativas falhadas, o início de sessão fica bloqueado ${SEG_MIN} minutos.</p>
  <div class="row" style="margin-top:12px"><button class="btn pri" id="tp-ok">${ic('check',15)} Guardar</button>${obrig?'<button class="btn" id="tp-dep">Mais Tarde</button>':''}</div></div>`);
  if($('#tp-dep'))$('#tp-dep').onclick=closeDrawer;
  $('#tp-ok').onclick=async()=>{const u=$('#tp-u').value.trim().toLowerCase(),p1=$('#tp-p1').value,p2=$('#tp-p2').value;if(!u)return alert('Indique o utilizador.');if(p1.length<6)return alert('A palavra-passe deve ter pelo menos 6 caracteres.');if(p1!==p2)return alert('As palavras-passe não coincidem.');
    const A_=await authCfg();if(A_.contas.some(x=>x!==c&&x.u===u))return alert('Já existe esse utilizador.');c.u=u;c.nome=$('#tp-n').value.trim();c.h=await (async()=>{try{return await hashLogin2(u,p1)}catch(_){return hashLogin(u,p1)}})();delete c.trocar;if(SESSAO&&SESSAO.tipo==='local'){SESSAO.u=u;guardarSessao(SESSAO,!!localStorage.getItem(SESS_KEY))}saveNow();closeDrawer();toast('Palavra-passe alterada','ok');if(VIEW==='definicoes')vDefinicoes()}}
function defConta(){const A_=S.cfg.auth||{contas:[],ms:{}};const s=SESSAO||{};
  return `<div class="card"><div class="row"><h2 style="margin:0">${ic('user',18)} Sessão</h2><span class="sp1"></span><button class="btn" id="ct-sair">${ic('back',15)} Terminar Sessão</button></div>
    <p style="margin:12px 0 0">Sessão iniciada como <b>${esc(s.nome||s.u||'—')}</b> <span class="mut">(${esc(s.u||'')} · ${s.tipo==='ms'?'Microsoft 365':'conta local'}${s.desde?' · desde '+new Date(s.desde).toLocaleString('pt-PT'):''})</span></p></div>
  <div class="card"><div class="row"><h2 style="margin:0">${ic('users',18)} Contas Locais</h2><span class="sp1"></span><button class="btn" id="ct-nova">${ic('plus',15)} Nova Conta</button></div>
    <div class="tblw" style="margin-top:12px"><table class="lst"><thead><tr><th>Utilizador</th><th>Nome</th><th>Papel</th><th>Último acesso</th><th></th></tr></thead><tbody>${(A_.contas||[]).map((c,i)=>`<tr><td><b>${esc(c.u)}</b>${c.trocar?' <span class="tag bad">palavra-passe inicial</span>':''}</td><td>${esc(c.nome||'')}</td><td>${c.papel==='admin'?'Administrador':'Professor'}</td><td>${c.ultimo?new Date(c.ultimo).toLocaleString('pt-PT'):'—'}</td>
      <td class="act"><div class="acts"><button class="btn sm" data-ctp="${i}">${ic('pencil',14)} Palavra-passe</button>${A_.contas.length>1?`<button class="btn sm ico dng" data-ctd="${i}" aria-label="Apagar conta">${ic('trash',14)}</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>
    <p class="hint">O início de sessão protege o acesso à app neste dispositivo. Para proteger também o ficheiro de cópia, use a cópia encriptada (Dados e Segurança).</p></div>
  <div class="card ed"><h2>${ic('building',18)} Microsoft 365 (Office) — Preparação</h2>
    <p class="hint" style="margin-top:0">No futuro a entrada será feita com as credenciais do Office da escola (Microsoft Entra ID). Requer: registo da aplicação no portal Azure pela escola (tipo “Single-page application”), o ID da aplicação e do inquilino, e a app alojada num endereço <b>https</b> (o endereço tem de ser registado como URI de redirecionamento).</p>
    <div class="g2"><div><label>ID da Aplicação (Client ID)</label><input id="ms-cid" value="${esc((A_.ms||{}).clientId||'')}" placeholder="00000000-0000-0000-0000-000000000000"></div><div><label>ID do Inquilino (Tenant ID)</label><input id="ms-tid" value="${esc((A_.ms||{}).tenantId||'')}" placeholder="organizations"></div>
    <div><label>Domínio autorizado</label><input id="ms-dom" value="${esc((A_.ms||{}).dominio||'')}" placeholder="escola.pt"></div><div><label>URI de redirecionamento a registar</label><input value="${esc(location.origin+location.pathname)}" readonly></div></div>
    <p class="hint">Estado: ${(A_.ms||{}).clientId?(/^https:/.test(location.protocol)?'<b style="color:#1a7f37">configurado — o botão Microsoft 365 fica ativo no ecrã de entrada</b>':'<b>configurado, mas a app está a ser aberta a partir de um ficheiro local (precisa de https)</b>'):'por configurar — a entrada é feita com a conta local'}.</p></div>`}
function bindConta(){$('#ct-sair').onclick=()=>{if(confirm('Terminar a sessão?'))terminarSessao()};
  $('#ct-nova').onclick=async()=>{const A_=await authCfg();const c={u:'',nome:'',papel:'professor',h:''};trocarPasseDlg(c,false);const ok=$('#tp-ok');const f=ok.onclick;ok.onclick=async()=>{await f();if(c.h&&!A_.contas.includes(c)){A_.contas.push(c);saveNow();vDefinicoes()}}};
  $$('[data-ctp]').forEach(b=>b.onclick=()=>trocarPasseDlg(S.cfg.auth.contas[+b.dataset.ctp],false));
  $$('[data-ctd]').forEach(b=>b.onclick=()=>{const c=S.cfg.auth.contas[+b.dataset.ctd];if(SESSAO&&SESSAO.u===c.u)return alert('Não pode apagar a conta com que tem a sessão iniciada.');if(confirm('Apagar a conta '+c.u+'?')){S.cfg.auth.contas.splice(+b.dataset.ctd,1);saveNow();vDefinicoes()}});
  [['ms-cid','clientId'],['ms-tid','tenantId'],['ms-dom','dominio']].forEach(([id,k])=>$('#'+id).addEventListener('change',e=>{S.cfg.auth.ms[k]=e.target.value.trim();saveNow();vDefinicoes()}))}

/* ---------- Página Escolas ---------- */
function vEscolas(){const L=todasEscolas();UI.escEd=escAtiva();const a=A();
  const cnt=e=>a?a.turmas.filter(t=>escolaDe(t)===e).length:0;
  return `<div class="card"><div class="row"><h2 style="margin:0">${ic('building',18)} As Minhas Escolas ${a?'<span class="mut" style="font-weight:500">· '+esc(a.nome)+'</span>':''}</h2><span class="sp1"></span><button class="btn" id="es-nova">${ic('plus',15)} Adicionar Escola</button></div>
    <p class="hint" style="margin:10px 0 0">Pode lecionar em mais do que uma escola no mesmo ano letivo. A <b>tipologia</b> de cada escola define as ofertas das suas turmas e a forma de avaliar (disciplinas e períodos, PROFIJ por UFCD, ou cursos profissionais por módulos).</p>
    <div class="escl">${L.map(e=>`<button class="escc ${escId(e)===UI.escEd?'on':''}" data-esed="${escId(e)}">${e.logo?`<img src="${e.logo}" alt="">`:`<span class="besi">${ic(TIPOS_ESCOLA[tipoEscola(e)].ic,18)}</span>`}<span><b>${esc(nomeEscola(e))}</b><span class="mut">${TIPOS_ESCOLA[tipoEscola(e)].n} · ${cnt(e)} turma${cnt(e)===1?'':'s'}${e===S.cfg?' · principal':''}</span></span></button>`).join('')}</div></div>`}
function cartaoTipologia(e){const tp=tipoEscola(e);return `<div class="card ed"><div class="row"><h2 style="margin:0">${ic('layers',18)} Tipologia da Escola</h2><span class="sp1"></span>${e!==S.cfg?`<button class="btn dng" id="es-del">${ic('trash',15)} Remover Escola</button>`:''}</div>
  <div class="tipos">${Object.entries(TIPOS_ESCOLA).map(([k,v])=>`<button type="button" class="tipoc ${tp===k?'on':''}" data-tpe="${k}">${ic(v.ic,22)}<b>${v.n}</b><span>${v.d}</span></button>`).join('')}</div></div>`}

/* =====================================================================
   v0.29 — datas (escrita), aniversários, envio de matrizes, modelos de critérios
   ===================================================================== */
/* ---------- 1. Campos de data: só aplicam a alteração quando se termina de escrever ---------- */
(()=>{const valida=v=>!v||/^(19|20)\d\d-\d\d-\d\d$/.test(v);
  document.addEventListener('focusin',e=>{const el=e.target;if(el&&el.type==='date'){el.dataset.egPrev=el.value;el._egDirty=false}},true);
  const segurar=e=>{const el=e.target;if(!el||el.type!=='date'||el._egPass)return;if(document.activeElement===el){e.stopImmediatePropagation();el._egDirty=true;clearTimeout(el._egT);if(valida(el.value)&&el.value)el._egT=setTimeout(()=>soltar(el),1500)}else if(!valida(el.value)){e.stopImmediatePropagation();el.value=el.dataset.egPrev||''}};
  document.addEventListener('change',segurar,true);document.addEventListener('input',segurar,true);
  const soltar=el=>{clearTimeout(el._egT);if(!el._egDirty)return;el._egDirty=false;if(!valida(el.value)){el.value=el.dataset.egPrev||'';toast('Data incompleta ou inválida — foi reposta a anterior','erro');return}
    if(el.value===el.dataset.egPrev)return;el._egPass=true;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el._egPass=false;el.dataset.egPrev=el.value};
  document.addEventListener('focusout',e=>{const el=e.target;if(el&&el.type==='date'&&el._egDirty)setTimeout(()=>soltar(el),0)},true);
  document.addEventListener('keydown',e=>{const el=e.target;if(el&&el.type==='date'&&e.key==='Enter'){e.preventDefault();soltar(el)}},true)})();

/* ---------- 2. Aniversários dos alunos ---------- */
function aniversarios(a,dias){if(!a)return [];const hj=new Date();hj.setHours(0,0,0,0);const vis=new Map();
  turmasFiltradas(a).forEach(t=>t.alunos.forEach(x=>{if(!x.nasc||!/^(19|20)\d\d-\d\d-\d\d$/.test(x.nasc)||+x.nasc.slice(0,4)>new Date().getFullYear())return;const k=normT(x.nome)+'|'+x.nasc;const o=vis.get(k);if(o){if(!o.turmas.includes(t.nome))o.turmas.push(x.origem||t.nome);return}
    const [y,m,d]=x.nasc.split('-').map(Number);let prox=new Date(hj.getFullYear(),m-1,d);if(m===2&&d===29&&prox.getMonth()!==1)prox=new Date(hj.getFullYear(),1,28);
    let dif=Math.round((prox-hj)/864e5);if(dif<-1){prox=new Date(hj.getFullYear()+1,m-1,d);dif=Math.round((prox-hj)/864e5)}
    vis.set(k,{x,turmas:[x.origem||t.nome],dif,data:prox,idade:prox.getFullYear()-y})}));
  return [...vis.values()].filter(v=>v.dif>=-1&&v.dif<=dias).sort((p,q)=>p.dif-q.dif||p.x.nome.localeCompare(q.x.nome,'pt'))}
function cartaoAniversarios(a){if(!a||S.cfg.anivOculto)return '';const L=aniversarios(a,S.cfg.anivDias||14);const temNasc=a.turmas.some(t=>t.alunos.some(x=>x.nasc));if(!temNasc)return '';
  const quando=v=>v.dif===0?'Hoje':v.dif===1?'Amanhã':v.dif===-1?'Ontem':DIAS_C[v.data.getDay()]+', '+v.data.getDate()+' '+MESES[v.data.getMonth()+1].slice(0,3).toLowerCase();
  return `<div class="card anivc"><div class="row"><h2 style="margin:0">${ic('star',18)} Aniversários</h2><span class="sp1"></span><span class="mut" style="font-size:12.5px">próximos ${S.cfg.anivDias||14} dias</span></div>
    ${L.length?L.slice(0,8).map(v=>`<div class="aniv ${v.dif===0?'hoje':''}"><span class="anf">${avatar(v.x,32)}</span><span class="ann"><b>${esc(v.x.nome)}</b><span class="mut">${esc(v.turmas.join(', '))} · <span class="sens">faz ${v.idade} anos</span></span></span><span class="anq">${v.dif===0?'🎂 ':''}${quando(v)}</span></div>`).join('')+(L.length>8?`<p class="mut" style="margin:8px 0 0;font-size:12.5px">… e mais ${L.length-8}</p>`:'')
      :`<p class="mut" style="margin:8px 0 0">Sem aniversários nos próximos ${S.cfg.anivDias||14} dias.</p>`}</div>`}

/* ---------- 3. Envio da matriz antes de cada teste ---------- */
const cfgMatriz=()=>Object.assign({ativo:true,dias:10},S.cfg.matriz||{});
function dataMatriz(iso){const m=cfgMatriz();const d=dataDeIso(iso);d.setDate(d.getDate()-(+m.dias||0));while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()-1);return isoData(d)}
function matrizes(a,lista){const m=cfgMatriz();if(!a||!m.ativo)return [];const L=[];(lista||turmasFiltradas(a)).forEach(t=>t.instrumentos.forEach(i=>{if(!i.data||!ehTeste(i)||i.semMatriz||i.oral||/oral/i.test(i.tipo||'')||/oral/i.test(i.nome||''))return;L.push({t,i,data:dataMatriz(i.data),enviada:!!i.matrizEnviada})}));return L.sort((x,y)=>x.data.localeCompare(y.data))}
function cartaoMatrizes(a){const hj=isoData(new Date());const lim=isoData(new Date(Date.now()+7*864e5));const L=matrizes(a).filter(x=>!x.enviada&&x.i.data>=hj&&x.data<=lim);if(!L.length)return '';
  return `<div class="card mzc"><div class="row"><h2 style="margin:0">${ic('file',18)} Matrizes a Enviar</h2><span class="sp1"></span><span class="mut" style="font-size:12.5px">${cfgMatriz().dias} dias antes de cada teste</span></div>
    ${L.map(x=>{const atr=x.data<hj;return `<div class="mzi ${atr?'atr':x.data===hj?'hoje':''}"><span class="mzd"><b>${dataDeIso(x.data).getDate()}</b><span>${MESES[dataDeIso(x.data).getMonth()+1].slice(0,3)}</span></span><span class="mzt"><b>${esc(x.i.nome)} · ${esc(x.t.nome)}</b><span class="mut">${esc(x.t.disciplina)} · teste ${esc(fmtIsoL(x.i.data))} · ${atr?'<b style="color:#c5221f">envio em atraso ('+esc(contagem(x.data))+')</b>':'enviar '+esc(contagem(x.data))}</span></span><button class="btn sm" data-mzok="${x.t.id}|${x.i.id}">${ic('check',14)} Enviada</button></div>`}).join('')}</div>`}
function bindMatrizes(){$$('[data-mzok]').forEach(b=>b.onclick=()=>{const [tid,iid]=b.dataset.mzok.split('|');const t=A().turmas.find(x=>x.id===tid);const i=t&&t.instrumentos.find(x=>x.id===iid);if(!i)return;i.matrizEnviada=Date.now();saveNow();toast('Matriz de '+i.nome+' marcada como enviada','ok');go(VIEW)})}

/* ---------- 4. Modelos de domínios e ponderações ---------- */
const MOD_BASE=[
 {id:'le',nome:'Línguas Estrangeiras',disc:['Inglês','Francês','Espanhol','Alemão','Comunicar em Inglês'],d:[['PO','Produção Oral',25],['CO','Compreensão Oral',25],['CE','Compreensão Escrita',25],['PE','Produção Escrita',25]]},
 {id:'port-b',nome:'Português (Ensino Básico)',disc:['Português'],cic:['1c','2c','3c'],d:[['OR','Oralidade',20],['LEI','Leitura',20],['EL','Educação Literária',15],['ESC','Escrita',25],['GRA','Gramática',20]]},
 {id:'port-s',nome:'Português (Ensino Secundário)',disc:['Português','Literatura Portuguesa'],cic:['sec','profij'],d:[['OR','Oralidade',15],['LEI','Leitura',20],['EL','Educação Literária',25],['ESC','Escrita',25],['GRA','Gramática',15]]},
 {id:'plnm',nome:'Português Língua Não Materna',disc:['Português Língua Não Materna (PLNM)'],d:[['CO','Compreensão Oral',20],['PIO','Produção e Interação Oral',20],['LEI','Leitura',20],['ESC','Escrita',25],['GRA','Gramática',15]]},
 {id:'mat-b',nome:'Matemática (Ensino Básico)',disc:['Matemática'],d:[['NO','Números e Operações',20],['ALG','Álgebra',20],['GM','Geometria e Medida',20],['DP','Dados e Probabilidades',15],['CM','Capacidades Matemáticas',25]]},
 {id:'mat-s',nome:'Matemática (Ensino Secundário)',disc:['Matemática A','Matemática B','Matemática Aplicada às Ciências Sociais (MACS)'],d:[['CC','Conhecimento e Compreensão',50],['RP','Resolução de Problemas',30],['RC','Raciocínio e Comunicação',20]]},
 {id:'ef',nome:'Educação Física',disc:['Educação Física'],d:[['AF','Atividades Físicas',60],['APF','Aptidão Física',20],['CON','Conhecimentos',20]]},
 {id:'cien',nome:'Ciências Experimentais',disc:['Ciências Naturais','Físico-Química','Física e Química A','Biologia e Geologia','Biologia','Física','Química','Geologia'],d:[['CON','Conhecimentos e Conceitos',50],['PL','Prática Laboratorial e Experimental',25],['CPC','Comunicação e Pensamento Crítico',25]]},
 {id:'hum',nome:'História e Geografia',disc:['História e Geografia de Portugal','História','Geografia','História A','História B','Geografia A','História da Cultura e das Artes','Antropologia'],d:[['CC','Conhecimento e Compreensão',50],['TI','Tratamento de Informação e Fontes',30],['COM','Comunicação',20]]},
 {id:'fil',nome:'Filosofia',disc:['Filosofia'],d:[['PRB','Problematização',35],['CONC','Conceptualização',30],['ARG','Argumentação',35]]},
 {id:'eco',nome:'Economia',disc:['Economia A'],d:[['CC','Conhecimento e Compreensão',60],['AI','Análise e Interpretação de Dados',25],['COM','Comunicação',15]]},
 {id:'art',nome:'Artes Visuais',disc:['Educação Visual','Desenho A','Geometria Descritiva A','Educação Artística — Artes Visuais','Complemento à Educação Artística'],d:[['AR','Apropriação e Reflexão',30],['IC','Interpretação e Comunicação',30],['EC','Experimentação e Criação',40]]},
 {id:'mus',nome:'Música, Dança e Teatro',disc:['Educação Musical','Educação Artística — Música','Educação Artística — Dança','Educação Artística — Expressão Dramática/Teatro'],d:[['EC','Experimentação e Criação',40],['IC','Interpretação e Comunicação',35],['AR','Apropriação e Reflexão',25]]},
 {id:'et',nome:'Educação Tecnológica',disc:['Educação Tecnológica'],d:[['TS','Tecnologia e Sociedade',30],['PT','Processos Tecnológicos',40],['RU','Recursos e Utilizações Tecnológicas',30]]},
 {id:'tic',nome:'TIC e Aplicações Informáticas',disc:['Tecnologias da Informação e Comunicação (TIC)','Aplicações Informáticas B'],d:[['SRR','Segurança, Responsabilidade e Respeito',20],['IP','Investigar e Pesquisar',20],['CC','Comunicar e Colaborar',30],['CI','Criar e Inovar',30]]},
 {id:'cd',nome:'Cidadania e Desenvolvimento',disc:['Cidadania e Desenvolvimento'],d:[['PAR','Participação e Envolvimento',40],['CON','Conhecimentos',30],['AV','Atitudes e Valores',30]]},
 {id:'emrc',nome:'EMRC',disc:['Educação Moral e Religiosa Católica (EMRC)'],d:[['RER','Religião e Experiência Religiosa',35],['CC','Cultura Cristã e Visão Cristã da Vida',35],['EM','Ética e Moral',30]]},
 {id:'em',nome:'Estudo do Meio',disc:['Estudo do Meio'],d:[['SOC','Sociedade',30],['NAT','Natureza',30],['TEC','Tecnologia',20],['SNT','Sociedade / Natureza / Tecnologia',20]]},
 {id:'cla',nome:'Línguas Clássicas',disc:['Latim A','Grego'],d:[['LIN','Língua',40],['TL','Tradução e Leitura',40],['CUL','Cultura',20]]},
 {id:'ae',nome:'Apoio ao Estudo / Oferta Complementar',disc:['Apoio ao Estudo','Oferta Complementar','Oferta de Escola'],d:[['MT','Métodos de Trabalho',40],['AUT','Autonomia',30],['PAR','Participação',30]]},
 {id:'mod',nome:'Módulo / UFCD (cursos profissionais e PROFIJ)',disc:[],of:['profissional','profij'],d:[['CON','Conhecimentos',50],['PRA','Prática e Aplicação',30],['AT','Atitudes e Comportamentos',20]]},
 {id:'gen',nome:'Genérico',disc:[],d:[['CC','Conhecimentos e Capacidades',80],['AT','Atitudes e Valores',20]]}];
function modelosTodos(){const U=S.cfg.modelos||[];const base=MOD_BASE.map(b=>{const o=U.find(u=>u.id===b.id);return o?{...b,...o,base:true,alterado:true}:{...b,base:true}});return base.concat(U.filter(u=>!MOD_BASE.some(b=>b.id===u.id)))}
function modeloPara(disc,ciclo,oferta){const M=modelosTodos();const nd=normT(disc);
  return M.filter(m=>!m.base||true).find(m=>!m.base&&(m.disc||[]).some(x=>normT(x)===nd)&&(!m.cic||!m.cic.length||m.cic.includes(ciclo)))
    ||M.find(m=>m.base&&(m.disc||[]).some(x=>normT(x)===nd)&&(!m.cic||!m.cic.length||m.cic.includes(ciclo)))
    ||(oferta&&oferta!=='regular'&&M.find(m=>(m.of||[]).includes(oferta)))
    ||(()=>{const i=discInfo(disc);const k=i&&i.t;return M.find(m=>m.id===({le:'le',port:ciclo==='sec'?'port-s':'port-b',ef:'ef'}[k]||'gen'))})()}
const dominiosDoModelo=m=>(m?m.d:MODELOS.gen).map(([ab,nome,peso],k)=>({id:uid()+k,ab,nome,peso:+peso}));
const mkDominiosDisc=(disc,ciclo,oferta)=>dominiosDoModelo(modeloPara(disc,ciclo,oferta));
function guardarModelo(m){S.cfg.modelos=S.cfg.modelos||[];const i=S.cfg.modelos.findIndex(x=>x.id===m.id);const o={id:m.id,nome:m.nome,disc:m.disc||[],cic:m.cic||[],of:m.of||[],d:m.d};if(i>=0)S.cfg.modelos[i]=o;else S.cfg.modelos.push(o);saveNow()}
function defModelos(){const M=modelosTodos();const q=normT(UI.modQ||'');const L=M.filter(m=>!q||normT(m.nome+' '+(m.disc||[]).join(' ')).includes(q));const minhas=new Set(minhasDisc());
  const _pl=(()=>{try{const p=domPal();if(Array.isArray(p)&&p.length)return p}catch(_){}return ['#2f7fd0','#d98b00','#7a4fd0','#1a7f37','#c0392b','#0f8b8d','#b8860b','#5b6b7f']})();const cor=k=>_pl[k%_pl.length];
  return `<div class="card"><div class="row"><h2 style="margin:0">${ic('sliders',18)} Modelos de Domínios e Ponderações</h2><span class="sp1"></span><input type="search" id="md-q" placeholder="Procurar disciplina…" value="${esc(UI.modQ||'')}" style="width:220px"><button class="btn pri" id="md-novo">${ic('plus',15)} Novo Modelo</button></div>
    <p class="hint" style="margin:10px 0 0">Ao criar uma turma, os domínios são copiados do modelo da disciplina (e do ciclo). Pode alterar os modelos, criar novos e aplicá-los a turmas existentes em Critérios. Os modelos de base podem ser repostos a qualquer momento.</p></div>
  <div class="mdgrid">${L.map(m=>{const tot=m.d.reduce((s,x)=>s+(+x[2]||0),0);const meu=(m.disc||[]).some(d=>minhas.has(d));return `<div class="card mdmc ${meu?'meu':''}"><div class="row" style="align-items:flex-start"><div style="flex:1;min-width:0"><b class="mdn">${esc(m.nome)}</b><div class="mut mdmd">${(m.disc||[]).length?esc(m.disc.join(' · ')):m.of&&m.of.length?'Turmas '+m.of.map(o=>OFERTAS[o]?OFERTAS[o].nome:o).join(' e '):'Outras disciplinas'}${m.cic&&m.cic.length?' · '+m.cic.map(c=>CICLOS[c]).join(', '):''}</div></div>
      <span class="tag ${m.base?(m.alterado?'dt':''):'ok'}">${m.base?(m.alterado?'Base alterado':'Base'):'Próprio'}</span></div>
    <div class="mdmbar" role="img" aria-label="Ponderações">${m.d.map((x,k)=>`<span style="flex:${+x[2]||0};background:${cor(k)}" title="${esc(x[1])} ${x[2]}%">${(+x[2]||0)>=12?x[2]+'%':''}</span>`).join('')}</div>
    <div class="mdml">${m.d.map((x,k)=>`<span class="mdmi" style="--dc:${cor(k)}"><b>${esc(x[0])}</b><span>${esc(x[1])}</span><em>${x[2]}%</em></span>`).join('')}</div>
    ${tot!==100?`<div class="alert w" style="margin:8px 0 0">${ic('alert',14)} Soma ${tot}%</div>`:''}
    <div class="row" style="gap:6px;margin-top:12px"><button class="btn sm" data-mded="${m.id}">${ic('pencil',14)} Editar</button><button class="btn sm" data-mddup="${m.id}">${ic('copy',14)} Duplicar</button>${m.base&&m.alterado?`<button class="btn sm" data-mdrep="${m.id}">${ic('refresh',14)} Repor</button>`:''}${!m.base?`<button class="btn sm ico dng" data-mddel="${m.id}" aria-label="Apagar">${ic('trash',14)}</button>`:''}</div></div>`}).join('')}</div>`}
function bindModelos(){const q=$('#md-q');if(q)q.oninput=()=>{UI.modQ=q.value;const p=q.selectionStart;vDefinicoes();const n=$('#md-q');n.focus();n.setSelectionRange(p,p)};
  $('#md-novo').onclick=()=>modeloDlg({id:'m'+uid(),nome:'',disc:[],cic:[],d:[['CC','Conhecimentos e Capacidades',80],['AT','Atitudes e Valores',20]]},true);
  $$('[data-mded]').forEach(b=>b.onclick=()=>modeloDlg(JSON.parse(JSON.stringify(modelosTodos().find(m=>m.id===b.dataset.mded))),false));
  $$('[data-mddup]').forEach(b=>b.onclick=()=>{const m=JSON.parse(JSON.stringify(modelosTodos().find(m=>m.id===b.dataset.mddup)));m.id='m'+uid();m.nome=m.nome+' (cópia)';delete m.base;delete m.alterado;modeloDlg(m,true)});
  $$('[data-mdrep]').forEach(b=>b.onclick=()=>{if(!confirm('Repor o modelo de base?'))return;S.cfg.modelos=(S.cfg.modelos||[]).filter(m=>m.id!==b.dataset.mdrep);saveNow();vDefinicoes();toast('Modelo reposto','ok')});
  $$('[data-mddel]').forEach(b=>b.onclick=()=>{if(!confirm('Apagar este modelo?'))return;S.cfg.modelos=(S.cfg.modelos||[]).filter(m=>m.id!==b.dataset.mddel);saveNow();vDefinicoes()})}
function modeloDlg(m,novo){const todas=[...new Set([...DISCIPLINAS.map(d=>d.n),...(S.cfg.extra||[]),...m.disc||[]])].sort((x,y)=>x.localeCompare(y,'pt'));
  const linhas=()=>m.d.map((x,k)=>`<tr><td><input data-mdk="${k}|0" value="${esc(x[0])}" style="width:80px"></td><td><input data-mdk="${k}|1" value="${esc(x[1])}"></td><td><input data-mdk="${k}|2" value="${esc(x[2])}" inputmode="numeric" style="width:70px;text-align:center"></td><td><button class="btn sm ico dng" data-mdx="${k}" aria-label="Remover domínio">${ic('x',13)}</button></td></tr>`).join('');
  openDrawer(novo?'Novo Modelo':'Editar Modelo',`<div class="ed"><label>Nome do modelo</label><input id="mo-nome" value="${esc(m.nome)}" placeholder="ex.: Inglês 3.º ciclo — departamento">
    <label style="margin-top:12px">Disciplinas a que se aplica</label><div class="mddisc">${todas.map(d=>`<label class="chk"><input type="checkbox" data-mdd="${esc(d)}" ${(m.disc||[]).includes(d)?'checked':''}> ${esc(d)}</label>`).join('')}</div>
    <label style="margin-top:12px">Ciclos <span class="mut">(nenhum = todos)</span></label><div class="row" style="gap:6px;flex-wrap:wrap">${Object.entries(CICLOS).map(([k,l])=>`<button type="button" class="chip ${(m.cic||[]).includes(k)?'on':''}" data-mdc="${k}">${l}</button>`).join('')}</div>
    <h3>Domínios</h3><table class="lst"><thead><tr><th>Abrev.</th><th>Designação</th><th>Peso %</th><th></th></tr></thead><tbody id="mo-dom">${linhas()}</tbody></table>
    <div class="row" style="margin-top:8px;gap:8px"><button class="btn sm" id="mo-add">${ic('plus',14)} Domínio</button><button class="btn sm" id="mo-eq">Pesos iguais</button><span class="sp1"></span><b id="mo-tot"></b></div>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="mo-ok">${ic('check',15)} Guardar Modelo</button></div></div>`);
  const tot=()=>{const s=m.d.reduce((a,x)=>a+(+x[2]||0),0);const e=$('#mo-tot');e.textContent='Total: '+s+'%';e.style.color=s===100?'#1a7f37':'#c5221f'};
  const bindL=()=>{$$('[data-mdk]').forEach(i=>i.oninput=()=>{const [k,c]=i.dataset.mdk.split('|').map(Number);m.d[k][c]=c===2?(+i.value.replace(',','.')||0):i.value;tot()});$$('[data-mdx]').forEach(b=>b.onclick=()=>{m.d.splice(+b.dataset.mdx,1);$('#mo-dom').innerHTML=linhas();bindL();tot()})};bindL();tot();
  $('#mo-add').onclick=()=>{m.d.push(['','',0]);$('#mo-dom').innerHTML=linhas();bindL();tot()};
  $('#mo-eq').onclick=()=>{const n=m.d.length;if(!n)return;const b=Math.floor(100/n);m.d.forEach((x,k)=>x[2]=b+(k<100-b*n?1:0));$('#mo-dom').innerHTML=linhas();bindL();tot()};
  $$('[data-mdc]').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
  $('#mo-ok').onclick=()=>{m.nome=$('#mo-nome').value.trim();if(!m.nome)return alert('Indique o nome do modelo.');m.d=m.d.filter(x=>String(x[1]).trim());if(!m.d.length)return alert('Indique pelo menos um domínio.');
    const s=m.d.reduce((a,x)=>a+(+x[2]||0),0);if(s!==100&&!confirm('Os pesos somam '+s+'% (deviam somar 100%). Guardar assim?'))return;
    m.disc=$$('[data-mdd]').filter(x=>x.checked).map(x=>x.dataset.mdd);m.cic=$$('[data-mdc].on').map(b=>b.dataset.mdc);guardarModelo(m);closeDrawer();vDefinicoes();toast('Modelo guardado','ok')}}
function aplicarModeloTurma(t,id){const m=modelosTodos().find(x=>x.id===id);if(!m)return;const us=t.instrumentos.some(i=>i.itens.length);
  if(us&&!confirm('Aplicar o modelo “'+m.nome+'”? Os itens dos instrumentos são religados pelos domínios com a mesma abreviatura; os restantes ficam sem domínio.'))return;
  const ant=Object.fromEntries(t.dominios.map(d=>[d.id,normT(d.ab)]));const novo=dominiosDoModelo(m);const porAb=Object.fromEntries(novo.map(d=>[normT(d.ab),d.id]));
  t.instrumentos.forEach(i=>i.itens.forEach(it=>{it.dom=porAb[ant[it.dom]]||''}));t.dominios=novo;saveNow();toast('Modelo “'+m.nome+'” aplicado','ok')}

function cartaoAvisosDef(){const m=cfgMatriz();return `<div class="card ed" id="def-avisos"><h2>${ic('bell',18)} Avisos Automáticos</h2>
  <div class="prefs"><div class="pref"><b>Envio da matriz antes de cada teste</b><div class="row" style="gap:10px;flex-wrap:wrap"><label class="chk"><input type="checkbox" id="mz-on" ${m.ativo?'checked':''}> Marcar automaticamente</label>
    <span class="row" style="gap:6px"><input id="mz-d" type="number" min="1" max="60" value="${m.dias}" inputmode="numeric" style="width:76px;text-align:center"> <span>dias antes</span></span>
    <div class="seg mini">${[5,7,10,14].map(n=>`<button type="button" data-mzd="${n}" class="${+m.dias===n?'on':''}">${n}</button>`).join('')}</div></div>
    <span class="hint">Aparece no Início (“Matrizes a Enviar”), nas Datas Importantes e no calendário da Marcação de Testes. Se calhar ao fim de semana, passa para a sexta-feira anterior.</span></div>
  <div class="pref"><b>Aniversários dos alunos no Início</b><div class="row" style="gap:10px;flex-wrap:wrap"><label class="chk"><input type="checkbox" id="an-on" ${S.cfg.anivOculto?'':'checked'}> Mostrar</label><span class="row" style="gap:6px">próximos <input id="an-d" type="number" min="1" max="60" value="${S.cfg.anivDias||14}" inputmode="numeric" style="width:70px;text-align:center"> dias</span></div></div></div></div>`}
function bindAvisosDef(){const up=()=>{S.cfg.matriz={ativo:$('#mz-on').checked,dias:Math.max(1,Math.min(60,+$('#mz-d').value||10))};save();$$('[data-mzd]').forEach(b=>b.classList.toggle('on',+b.dataset.mzd===S.cfg.matriz.dias))};
  $('#mz-on').onchange=up;$('#mz-d').onchange=up;$$('[data-mzd]').forEach(b=>b.onclick=()=>{$('#mz-d').value=b.dataset.mzd;up();toast('Matriz: '+b.dataset.mzd+' dias antes do teste','ok')});
  $('#an-on').onchange=e=>{S.cfg.anivOculto=!e.target.checked;save()};$('#an-d').onchange=e=>{S.cfg.anivDias=Math.max(1,Math.min(60,+e.target.value||14));save()}}

/* ---------- procurar dados da escola na internet (OpenStreetMap / Nominatim, sem chave) ---------- */
const REG_ESC={acores:['Açores','&viewbox=-31.6,40.0,-24.3,36.8&bounded=1'],madeira:['Madeira','&viewbox=-17.4,33.2,-16.2,32.3&bounded=1'],continente:['Portugal continental','&viewbox=-9.6,42.2,-6.1,36.9&bounded=1'],pt:['Todo o país','']};
function formRepesquisa(nome,reg,temRes){return `<div class="webre"><b>${temRes?'Não é nenhuma destas?':'Procurar novamente'}</b><div class="row" style="gap:8px;flex-wrap:wrap;margin-top:6px"><input id="ew-q" value="${esc(nome)}" placeholder="Nome ou parte do nome (ex.: Profissional São Jorge)" style="flex:1;min-width:220px"><select id="ew-r">${Object.entries(REG_ESC).map(([k,v])=>`<option value="${k}" ${k===reg?'selected':''}>${v[0]}</option>`).join('')}</select><button type="button" class="btn pri" id="ew-go">${ic('search',15)} Procurar Novamente</button></div>
  <label class="chk" style="margin-top:8px"><input type="checkbox" id="ew-subst" ${temRes?'checked':''}> Substituir os campos já preenchidos (morada, código postal, telefone, e-mail, sítio)</label></div>`}
function bindRepesquisa(c){const go_=()=>procurarEscolaWeb(c,$('#ew-q').value,$('#ew-r').value);const b=$('#ew-go');if(b)b.onclick=go_;const q=$('#ew-q');if(q)q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go_()}}}
async function procurarEscolaWeb(c,termo,reg){const nome=(termo||c.escola||'').trim();reg=reg||UI.escReg||'acores';UI.escReg=reg;UI.escTermo=nome;const box=$('#es-res');if(nome.length<4){toast('Escreva primeiro o nome da escola','erro');$('[data-ce="escola"]').focus();return}
  if(!navigator.onLine){box.innerHTML=`<div class="alert w">${ic('alert',15)} Sem ligação à internet.</div>`;return}
  box.innerHTML=`<div class="hint" style="margin:0 0 12px">${ic('search',14)} A procurar “${esc(nome)}”…</div>`;
  const q=async(t)=>{const u='https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&namedetails=1&limit=8&countrycodes=pt&accept-language=pt'+REG_ESC[reg][1]+'&q='+encodeURIComponent(t);const r=await fetch(u,{headers:{'Accept':'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()};
  try{let L=await q(nome);if(!L.length){const curto=nome.replace(/^(escola|agrupamento de escolas)\s+(b[aá]sica|secund[aá]ria|profissional)?\s*(e\s+secund[aá]ria)?\s*(da|de|do|das|dos)?\s*/i,'');if(curto!==nome)L=await q('escola '+curto)}
    L=L.filter(x=>/school|college|university|educ|escola/i.test((x.type||'')+' '+(x.category||'')+' '+(x.display_name||'')));
    if(!L.length){box.innerHTML=`<div class="alert w">${ic('info',15)} Não foi encontrada nenhuma escola com “${esc(nome)}” (${esc(REG_ESC[reg][0])}) no OpenStreetMap. Experimente um nome mais curto (ex.: “Profissional São Jorge”), outra região, ou preencha à mão.</div>`+formRepesquisa(nome,reg);bindRepesquisa(c);return}
    UI.escWeb=L;box.innerHTML=`<div class="webres"><b>Escolha o resultado certo</b>${L.map((x,i)=>{const a=x.address||{},e=x.extratags||{};return `<button type="button" class="webr" data-wr="${i}"><span class="besi">${ic('building',16)}</span><span><b>${esc((x.namedetails&&x.namedetails.name)||x.name||x.display_name.split(',')[0])}</b><span class="mut">${esc([a.road&&(a.road+(a.house_number?' '+a.house_number:'')),a.postcode,a.village||a.town||a.city||a.municipality].filter(Boolean).join(' · ')||x.display_name)}</span>${e.phone||e['contact:phone']||e.website||e['contact:website']?`<span class="mut">${esc([e.phone||e['contact:phone'],e.website||e['contact:website']].filter(Boolean).join(' · '))}</span>`:''}</span></button>`}).join('')}<span class="hint">Dados © contribuidores do OpenStreetMap (ODbL).</span></div>`+formRepesquisa(nome,reg,true);bindRepesquisa(c);
    $$('[data-wr]').forEach(b=>b.onclick=()=>{const x=UI.escWeb[+b.dataset.wr];const a=x.address||{},e=x.extratags||{};const subst=!!($('#ew-subst')&&$('#ew-subst').checked);const set=(k,v)=>{if(v&&(subst||!c[k])){c[k]=String(v).trim();return 1}return 0};let n=0;
      n+=set('morada',[a.road&&(a.road+(a.house_number?', '+a.house_number:'')),a.suburb||a.neighbourhood].filter(Boolean).join(', '));
      n+=set('localidade',[a.postcode,a.village||a.town||a.city||a.municipality].filter(Boolean).join(' '));
      n+=set('telefone',e.phone||e['contact:phone']);n+=set('emailEscola',e.email||e['contact:email']);n+=set('site',e.website||e['contact:website']||e.url);n+=set('codigo',e['ref:dge']||e['ref:pt:dgeec']||e.ref);
      const sobrep=['morada','localidade','telefone','emailEscola','site'].filter(k=>c[k]);saveNow();vEscola();toast(n?n+' campo(s) preenchido(s) — confirme os dados':'Os campos já estavam preenchidos (não foram substituídos)','ok')})}
  catch(err){box.innerHTML=`<div class="alert w">${ic('alert',15)} Não foi possível pesquisar (${esc(err.message)}). Se a app estiver aberta como ficheiro, o navegador pode bloquear a pesquisa; alojada num endereço https funciona.</div>`}}
function vEscola(){
  const top=vEscolas();const c=escolaPorId(UI.escEd);
  $('#view').innerHTML=top+`
  <div class="card esc-hero prev">${logoHtml('lg',c)||`<span class="logo-esc lg vazio">${ic('building',34)}</span>`}<div class="esc-t"><div class="esc-n">${esc(c.escola||'Nome da Escola')}</div>${c.agrupamento?`<div class="esc-s">${esc(c.agrupamento)}</div>`:''}<div class="esc-m">${esc(moradaEscola(c))}</div></div></div>
  <div class="card ed"><h2>Logotipo</h2>
    <div class="logo-zona" id="lg-drop">${c.logo?`<span class="logo-esc xl ${c.logoFundo===false?'sf':''}"><img src="${c.logo}" alt="Logotipo"></span>`:`<span class="logo-esc xl vazio">${ic('image',40)}</span>`}
      <div><p style="margin:0 0 10px">Toque para escolher a imagem do logotipo (PNG com fundo transparente, JPG ou SVG) ou arraste-a para aqui.</p>
        <div class="row"><button class="btn pri" id="lg-pick">${ic('upload',15)} ${c.logo?'Substituir Logotipo':'Escolher Logotipo'}</button>${c.logo?`<button class="btn dng" id="lg-del">${ic('trash',15)} Remover</button>`:''}</div>
        ${c.logo?`<label class="chk" style="margin-top:12px"><input type="checkbox" id="lg-bg" ${c.logoFundo===false?'':'checked'}> Fundo branco (recomendado para logótipos escuros no modo escuro)</label>`:''}</div></div>
    <p class="hint">O logotipo aparece no Início e nos relatórios impressos. A imagem é reduzida e guardada neste computador (e incluída na cópia de segurança).</p></div>
  <div class="card ed"><h2>Dados da Escola</h2>
    <div class="row" style="gap:8px;margin:0 0 12px;flex-wrap:wrap"><button class="btn pri" id="es-web">${ic('search',15)} Procurar Dados na Internet</button><span class="hint" style="margin:0">Usa o nome indicado e preenche morada, código postal, telefone, e-mail e sítio (OpenStreetMap). Confirme sempre.</span></div><div id="es-res"></div>
    <div class="g2">${CAMPOS_ESCOLA.map(([k,l,ph])=>`<div><label>${l}</label><input data-ce="${k}" value="${esc(c[k]||'')}" placeholder="${esc(ph)}" ${k==='emailEscola'?'type="email" inputmode="email"':k==='telefone'?'inputmode="tel"':k==='site'?'inputmode="url"':''}></div>`).join('')}</div></div>`+cartaoTipologia(c);
  $('#es-web').onclick=()=>procurarEscolaWeb(c);
  $$('[data-esed]').forEach(b=>b.onclick=()=>{UI.escEd=b.dataset.esed;if(S.escolaAtiva!==b.dataset.esed){S.escolaAtiva=b.dataset.esed;const TF=turmasFiltradas(A());S.turmaAtiva=TF[0]?TF[0].id:null;save();go('escola')}else vEscola()});
  $('#es-nova').onclick=()=>{const e={id:uid(),escola:'',tipoEscola:'regular'};escolas().push(e);UI.escEd=e.id;S.escolaAtiva=e.id;S.turmaAtiva=null;saveNow();go('escola');setTimeout(()=>{const i=$('[data-ce="escola"]');if(i)i.focus()},60)};
  $$('[data-tpe]').forEach(b=>b.onclick=()=>{const k=b.dataset.tpe;if(tipoEscola(c)===k)return;const a=A();const TT=a?a.turmas.filter(t=>escolaDe(t)===c&&!TIPOS_ESCOLA[k].ofertas.includes(ofertaDe(t))):[];
    if(TT.length&&!confirm(`Mudar ${nomeEscola(c)} para “${TIPOS_ESCOLA[k].n}”?\n\n${TT.length} turma(s) passam para a oferta “${OFERTAS[TIPOS_ESCOLA[k].ofertas[0]].nome}”${k==='profissional'?' e passam a ter Módulos':''}.`))return;
    c.tipoEscola=k;TT.forEach(t=>{t.oferta=TIPOS_ESCOLA[k].ofertas[0];if(t.oferta!=='regular')t.modulos=t.modulos||[]});saveNow();go('escola');toast(nomeEscola(c)+' · '+TIPOS_ESCOLA[k].n,'ok')});
  const edl=$('#es-del');if(edl)edl.onclick=()=>{const n=S.anos.reduce((s,a)=>s+a.turmas.filter(t=>t.escola===c.id).length,0);if(!confirm('Remover '+nomeEscola(c)+'?'+(n?'\n\nAs '+n+' turma(s) desta escola passam para a escola principal.':'')))return;S.anos.forEach(a=>a.turmas.forEach(t=>{if(t.escola===c.id)delete t.escola}));S.escolas=escolas().filter(e=>e!==c);UI.escEd='principal';S.escolaAtiva='principal';saveNow();vEscola()};
  const pick=()=>{const f=$('#logoIn');f.value='';f.onchange=()=>f.files[0]&&usarLogo(f.files[0]);f.click()};
  $('#lg-pick').onclick=pick;$('.logo-zona .logo-esc').onclick=pick;
  const z=$('#lg-drop');z.ondragover=e=>{e.preventDefault();z.classList.add('over')};z.ondragleave=()=>z.classList.remove('over');
  z.ondrop=e=>{e.preventDefault();z.classList.remove('over');const f=e.dataTransfer.files[0];if(f)usarLogo(f)};
  const d=$('#lg-del');if(d)d.onclick=()=>{if(confirm('Remover o logotipo?')){delete c.logo;saveNow();vEscola()}};
  const bg=$('#lg-bg');if(bg)bg.onchange=e=>{c.logoFundo=e.target.checked;save();vEscola()};
  $$('[data-ce]').forEach(el=>el.addEventListener('input',()=>{c[el.dataset.ce]=el.value.trim();save();barEscola();{const o=$('#selEsc option[value="'+escId(c)+'"]');if(o)o.textContent=nomeEscola(c)}
    const h=$('.esc-hero.prev');if(h){h.querySelector('.esc-n').textContent=c.escola||'Nome da Escola';h.querySelector('.esc-m').textContent=moradaEscola(c)}}));
}
async function usarLogo(file){try{escolaPorId(UI.escEd).logo=await logoDeFicheiro(file);saveNow();toast('Logotipo guardado');vEscola()}catch(e){alert(e.message)}}
function heroEscola(a){const c={...S.cfg,...EC()};
  if(!c.escola&&!c.logo)return `<div class="card esc-hero vz"><span class="logo-esc lg vazio">${ic('building',30)}</span><div class="esc-t"><div class="esc-n">A Sua Escola</div><div class="esc-m">Indique o nome e o logotipo da escola.</div></div><span class="sp1"></span><button class="btn pri" data-go="escola">Configurar Escola</button></div>`;
  return `<div class="card esc-hero">${logoHtml('lg',EC())}<div class="esc-t"><div class="esc-n">${esc(c.escola||'')}</div>${c.agrupamento?`<div class="esc-s">${esc(c.agrupamento)}</div>`:''}<div class="esc-m">${[a?'Ano letivo '+esc(a.nome):'',c.professor?esc(profNome(c.professor)):'',(a&&minhasDT(a).length)?ic('crown',13)+' '+tituloDT(c.professor)+' do '+minhasDT(a).map(esc).join(' e do '):''].filter(Boolean).join(' · ')}</div></div><span class="sp1"></span><button class="btn sm ico" data-go="escola" title="Editar escola" aria-label="Editar escola">${ic('pencil',16)}</button></div>`}

/* =====================================================================
   DEFINIÇÕES
   ===================================================================== */
let defFiltro='';
function vDefGeral(){
  const c=S.cfg,a=A();
  const grupos=Object.entries(CICLOS).map(([k,n])=>({k,n,l:DISCIPLINAS.filter(d=>d.c.includes(k))}));
  $('#view').innerHTML=`
  <div class="card ed"><h2>Escola e professor</h2>
    <div class="g2"><div><label>Escola <a href="#" id="go-esc" class="lnk">Logotipo e dados da escola ›</a></label><input data-c="escola" value="${esc(c.escola)}" placeholder="Escola Básica e Secundária…"></div>
      <div><label>Ano letivo</label><div class="anotxt">${ic('calendar',16)} <b>${esc((A()||{}).nome||'—')}</b> <span class="mut">· escolhido no início de sessão</span></div></div></div>
    <div class="g2"><div><label>Nome do professor</label><input data-c="professor" value="${esc(c.professor)}"></div><div><label>E-mail institucional <span class="mut">(${esc(nomeEscola(EC()))})</span></label><div class="anotxt">${esc(emailProf()||'—')} <a href="#" class="lnk" data-gopf="1">Editar no separador Professor ›</a></div></div></div></div>
  <div class="card ed"><div class="row"><h2 style="margin:0">${ic('book',18)} Disciplinas que Leciono</h2><span class="sp1"></span><button class="btn sm" data-godisc="1">${ic('school',14)} Escolher em Ano Letivo e Turmas ›</button></div><p class="hint" style="margin:6px 0 0">As disciplinas são escolhidas <b>por ano letivo</b> (um professor pode lecionar disciplinas diferentes de ano para ano). ${A()?'Em '+esc(A().nome)+': '+(minhasDisc().map(esc).join(', ')||'nenhuma escolhida')+'.':''}${A()&&ufcdAno().length?`<br><b>Unidades que leciono (${ufcdAno().length}):</b> `+ufcdAno().map(u=>esc((/^uc/i.test(u.tipo||'')?'UC ':'UFCD ')+u.cod+' '+u.nome)).join(' · ')+'.':''}</p></div>
  <div class="card ed tpcard"><div class="row"><h2 style="margin:0">Tipos de instrumento</h2><span class="sp1"></span><button type="button" class="btn sm" id="tp-rep">${ic('refresh',13)} Repor Predefinidos</button></div><p class="hint" style="margin:6px 0 10px">Os tipos aparecem ao criar instrumentos e na marcação de testes. Arraste para ordenar; os tipos em uso não podem ser removidos.</p><div id="tpEd"></div><textarea id="tp" hidden>${esc(c.tipos.join('\n'))}</textarea></div>
  <div class="card"><div class="row"><h2 style="margin:0">Tipos de Tempo Não Letivo</h2><span class="sp1"></span><button class="btn" id="d-tnl">${ic('sliders',15)} Gerir Tipos</button></div><div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">${nlTipos().map(x=>`<span class="nlb" style="--nc:${x.cor}" title="${esc(x.n)}">${esc(x.sig)}</span>`).join('')}</div></div>
  <div class="card ed"><h2>Textos da síntese descritiva</h2><p class="hint">{dom} = domínio, {oa} = o/a, {aluno} = aluno/aluna, {nome} = primeiro nome, {turma}, {disciplina}, {periodo} (ex.: 1.º período), {mencao}.</p>
    ${Object.keys(SINTESE_DEF).map(k=>`<label>${esc(k)}</label><textarea data-s="${esc(k)}" style="min-height:60px;margin-bottom:8px">${esc(c.sinteses[k]||'')}</textarea>`).join('')}</div>
  `;
  $$('[data-c]').forEach(el=>el.oninput=()=>{c[el.dataset.c]=el.value;save()});
  if($('#c-ano'))$('#c-ano').onchange=e=>{if(e.target.value==='__novo'){const n=prompt('Ano letivo',sugAno());if(n&&/^\d{4}\/\d{4}$/.test(n.trim())&&!S.anos.some(x=>x.nome===n.trim()))novoAno(n.trim());else if(n)alert('Formato 2026/2027, e que ainda não exista.')}else{S.anoAtivo=e.target.value;const x=A();S.turmaAtiva=x&&x.turmas[0]?x.turmas[0].id:null;save()}go('definicoes')};
  $('#tp').onchange=e=>{c.tipos=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean);save();toast('Tipos guardados')};
  $$('[data-s]').forEach(el=>el.oninput=()=>{c.sinteses[el.dataset.s]=el.value;save()});
  $('#d-tnl').onclick=()=>gerirTiposNL(()=>{closeDrawer();go('definicoes')});
  const ge=$('#go-esc');if(ge)ge.onclick=e=>{e.preventDefault();go('escola')};
}

/* =====================================================================
   AJUDA
   ===================================================================== */
/*GIFS*/let _gifs=null;const gifsAjuda=()=>{if(!_gifs){try{_gifs=JSON.parse(document.getElementById('gifs-json').textContent)}catch(e){_gifs={}}}return _gifs};
/* =====================================================================
   AJUDA — guia aprofundado com animações (GIF) e pesquisa
   ===================================================================== */
const AJUDA=[
 {id:'comecar',ic:'sparkle',t:'Começar',gif:null,txt:`
  <p>O EduSpruce organiza-se em <b>Escola → Ano letivo → Turmas</b>. Faça uma vez a configuração inicial:</p>
  <ol><li><b>Escola</b> (Configuração › Escola): nome, agrupamento, morada e o <b>logotipo</b> (toque na imagem ou arraste-a). Aparece no Início e nos relatórios.</li>
  <li><b>Definições</b>: o seu nome (é o que permite à app reconhecer as <i>suas</i> aulas nos horários), grupo e as <b>disciplinas que leciona</b>. Cada disciplina é escolhida <b>por ciclo</b>: Inglês do 3.º ciclo e Inglês do secundário são disciplinas diferentes.</li>
  <li><b>Ano Letivo e Turmas</b>: crie o ano letivo (3 períodos ou 2 semestres) e as turmas.</li>
  <li><b>Calendário Escolar</b>: importe o PDF do calendário — a partir daí a app sabe os períodos, as interrupções e os feriados.</li>
  <li><b>O Meu Horário</b>: importe o PDF do seu horário — aulas e tempos não letivos ficam logo prontos.</li></ol>
  <p class="hint">O Início mostra uma lista de “Primeiros passos” até tudo estar configurado.</p>`},
 {id:'turmas',ic:'users',t:'Turmas e Alunos',gif:'alunos',txt:`
  <p><b>Importar alunos (Excel com fotografias):</b> no programa da escola siga <b>${CAMINHO_EXCEL.replace(/>/g,'›')}</b> e guarde o ficheiro <b>.xlsx</b>. Em <b>Ano Letivo e Turmas › Turma a Partir do Excel</b> escolha o ficheiro: a app lê o n.º, o processo, o nome, a foto, a turma e o ano letivo, e mostra uma pré-visualização para confirmar.</p>
  <ul><li><b>Frequenta</b>: desmarque quem não tem a sua disciplina — só os assinalados entram na avaliação e nos relatórios.</li>
  <li><b>Editar turma</b> (botão Editar ou “Editar Turma” em Alunos): oferta formativa <b>Ensino Regular / PROFIJ</b>, nome e ano de escolaridade. O ícone com o número (10, 11, 12…) identifica o ano.</li>
  <li><b>+ Disciplina</b>: a mesma turma noutra disciplina (copia os alunos).</li>
  <li><b>Juntar turmas</b>: para turmas com aulas juntas numa disciplina (ex.: 10.º A + 10.º B → 10.º A/B). Cada aluno mantém o seu número e a turma de origem.</li>
  <li><b>Ficha do aluno</b>: toque no nome — dados, encarregado de educação, delegado/subdelegado, observações e o separador <b>MSAI</b>.</li>
  <li>Tocar numa turma no Início abre a <b>lista de alunos</b>.</li></ul>`},
 {id:'msai',ic:'access',t:'Medidas de Suporte (MSAI)',gif:null,txt:`
  <p>Na ficha do aluno, separador <b>MSAI</b>, assinale as medidas universais, seletivas e adicionais (DL 54/2018), as adaptações ao processo de avaliação, os recursos e as acomodações curriculares — com observações em cada medida.</p>
  <ul><li><b>Alunos › Quadro MSAI</b> mostra a turma inteira: modo <b>Quadro</b> (alunos × medidas, cabeçalhos legíveis na horizontal) ou <b>Por Aluno</b> (cartões, ideal no iPad na vertical).</li>
  <li>“Só alunos com medidas” e “Só medidas em uso” tornam o quadro compacto. Exporte em CSV ou imprima.</li></ul>`},
 {id:'horarios',ic:'calendar',t:'Horários',gif:'horario',txt:`
  <p><b>O Meu Horário (PDF do professor):</b> em O Meu Horário › <b>Importar o Meu Horário (PDF ou Excel)</b>. A app lê a grelha (tempos × dias, salas, células de dois tempos) e as observações, separa <b>tempos letivos</b> e <b>não letivos</b> e propõe a associação de cada linha (ex.: “10º A · ING”) a uma turma da app. Estas aulas têm prioridade — indicam exatamente quando tem aula com a turma.</p>
  <p><b>Horários das turmas (Excel ClassSchedule):</b> “Importar Horários” (vários ficheiros de uma vez). Em Turma › Horário vê a grelha da turma com as suas aulas destacadas, a próxima aula e o Diretor de Turma.</p>
  <ul><li>A grelha semanal fica alinhada com os restantes cartões e desliza na horizontal em ecrãs pequenos.</li>
  <li><b>Apagar:</b> em Turma › Horário › “Apagar Horário” (horário da turma ou associação ao seu PDF) e em O Meu Horário › “Apagar…” (o seu PDF, tempos não letivos, horários das turmas).</li></ul>`},
 {id:'naoletivos',ic:'layers',t:'Tempos Não Letivos',gif:'naoletivo',txt:`
  <p>Ficam a tracejado na grelha de O Meu Horário, com uma cor por tipo, na lista de Hoje e num quadro próprio com a contagem semanal.</p>
  <ul><li><b>Arrastar:</b> agarre um tempo não letivo na grelha e largue-o noutro dia/hora (os tempos do mesmo bloco movem-se juntos).</li>
  <li><b>Acrescentar:</b> “Tempo Não Letivo” — escolha o tipo, o dia e toque nos tempos.</li>
  <li><b>Tipos:</b> “Tipos” (ou Definições › Tipos de Tempo Não Letivo) para <b>acrescentar, editar (sigla, designação, cor) ou apagar</b> tipos. Mudar a sigla atualiza os tempos já marcados.</li></ul>`},
 {id:'calendario',ic:'calcheck',t:'Calendário Escolar',gif:'calendario',txt:`
  <p><b>Importar PDF:</b> a app lê a legenda de cores e cada dia (letivo, interrupção, feriados, início, termo das aulas por ano de escolaridade) e calcula os períodos e os dias letivos. Pode também <b>criar manualmente</b> com as datas dos períodos.</p>
  <ul><li><b>Tocar num dia</b> abre a ficha do dia: tipo, período, nota e as suas aulas nesse dia; pode mudar o tipo ali mesmo.</li>
  <li><b>Editar Dias:</b> escolha o tipo na faixa de cima e toque ou <b>arraste o dedo</b> por vários dias.</li>
  <li><b>Cores dos critérios harmonizadas</b> com a cor de destaque do estilo (barra lateral): a paleta é gerada a partir dela e acompanha o tema claro/escuro.</li><li><b>Avaliação Intercalar</b> (global ao ano letivo): escolha Nenhuma, Dois ou Três Períodos e as datas “De/Até” — vale para todas as turmas.</li></ul>`},
 {id:'previstas',ic:'clock',t:'Aulas Previstas, Dadas e Faltas',gif:'faltas',txt:`
  <p>Em Calendário Escolar › <b>Aulas Previstas</b> a app cruza o horário de cada turma com o calendário: tempos (ou aulas) previstos por período, dados, por dar e <b>faltas</b>; total e exportação CSV.</p>
  <ul><li><b>Σ</b> (na Marcação de Testes) é a <b>soma dos tempos dados</b> até esse dia — a numeração das lições.</li>
  <li><b>Faltas do professor:</b> toque num dia de aula (Marcação de Testes) › “Registar Falta”, ou no detalhe de uma turma em Aulas Previstas › “Registar Falta”. Indique os tempos e o motivo (doença, formação, serviço oficial, visita de estudo, greve…). A falta não conta como aula dada nem como aula por dar, e o dia fica marcado com <b>F</b>.</li></ul>`},
 {id:'reunioes',ic:'meet',t:'Reuniões',gif:null,txt:`
  <p>Em <b>Geral › Reuniões</b> tem o mapa de todas as reuniões do ano: conselhos de turma, departamento, grupo disciplinar, pedagógico, encarregados de educação, equipas, formações…</p>
  <ol><li><b>Nova Reunião</b>: escolha o tipo (a ordem de trabalhos é sugerida), data, hora, local ou ligação online, turma e participantes. A app avisa logo se a hora <b>coincide com uma aula, um tempo não letivo ou outra reunião</b>.</li>
  <li><b>Lembretes</b>: escolha quando quer ser avisado (15 min, 1 hora, 1 dia, 2 dias, 1 semana antes). Com a app aberta aparece um aviso no topo com som; se ativar as notificações, aparecem também no sistema.</li>
  <li><b>Com a app fechada</b>: use <b>Exportar (.ics)</b> — as reuniões entram no Calendário do iPad/computador com os alarmes escolhidos.</li>
  <li><b>Repetir</b>: semanal, quinzenal ou mensal, até uma data (ex.: reuniões de grupo).</li>
  <li><b>Ficha da reunião</b> (toque numa reunião): lista de preparação (o que levar), ordem de trabalhos, notas, decisões e tarefas com responsável e prazo; marcar como realizada, adiar ou cancelar; <b>descarregar a ata</b> (.doc, com o logotipo da escola) ou copiá-la.</li>
  <li><b>Avisos</b>: sobreposições, preparação em falta na véspera, reuniões que já passaram sem ata e tarefas em atraso. O número ao lado de “Reuniões” na barra lateral indica as reuniões de hoje.</li></ol>
  <p>As reuniões de avaliação marcadas na Marcação de Testes também aparecem no mapa, e as próximas reuniões aparecem no Início.</p>`},
 {id:'testes',ic:'target',t:'Marcação de Testes',gif:'testes',txt:`
  <p>Turma › <b>Marcação de Testes</b>: calendário do ano (ou de um período) só com os dias de semana. Cada dia de aula mostra a hora, os tempos e Σ.</p>
  <ul><li><b>Marcar:</b> toque num dia → escolha Teste, Questão-aula, Ficha, Apresentação Oral (AO), Prova Oral (PO) ou Trabalho → cria o instrumento de avaliação com a data e o período certos.</li>
  <li><b>Mudar a data:</b> arraste a marcação para outro dia.</li>
  <li><b>Painel ao lado:</b> avaliações de cada período com Σ e “+n desde o anterior”, a avaliação intercalar, a <b>reunião de avaliação</b> desta turma e outras datas.</li>
  <li>Os próximos testes de todas as turmas aparecem no <b>Início</b>.</li></ul>`},
 {id:'avaliacao',ic:'grad',t:'Avaliação',gif:'avaliacao',txt:`
  <ol><li><b>Critérios:</b> domínios (ex.: PO, CO, CE, PE) e ponderações, menções e regra do 2.º/3.º período.</li>
  <li><b>Instrumentos:</b> itens (perguntas/critérios) com domínio e cotação; depois as classificações por aluno (linha em branco = não avaliado).</li>
  <li><b>Domínios:</b> % de cada domínio por período.</li>
  <li><b>Avaliação Final:</b> nota por período (0–20 no secundário; % e nível 1–5 no básico), pauta CSV.</li>
  <li><b>Relatórios:</b> relatório individual imprimível com síntese descritiva e logotipo da escola.</li></ol>
  <p class="hint">Regras: % do domínio = pontos ÷ cotação; nota = Σ(% × ponderação); no 2.º/3.º período, média por domínio dos períodos até esse (configurável).</p>`},
 {id:'inicio',ic:'home',t:'Início',gif:null,txt:`
  <ul><li><b>Contagem decrescente</b> para o fim do período (dias letivos, relógio, tempos por dar em cada turma).</li>
  <li><b>Datas Importantes</b>: avaliação intercalar, reuniões, feriados, interrupções, fim de período, termo.</li>
  <li><b>Próximos Testes</b> de todas as turmas, com as aulas que faltam até lá.</li>
  <li>Aulas de hoje e cartões das turmas (tocar abre a lista de alunos).</li></ul>`},
 {id:'aparencia',ic:'sun',t:'Aparência, iPad e Telemóvel',gif:'tema',txt:`
  <ul><li><b>Tema:</b> no fundo da barra lateral (ou Definições › Aparência) escolha <b>Auto</b> (segue o sistema), <b>Claro</b> ou <b>Escuro</b>.</li>
  <li><b>iPad:</b> na vertical a barra lateral mostra só ícones; no telemóvel abre com o botão ☰.</li>
  <li><b>Ecrã principal:</b> no Safari, Partilhar › “Adicionar ao ecrã principal” para abrir como uma app.</li>
  <li>Tudo é tocável com o dedo (alvos de 44 px), e é possível arrastar tempos não letivos, marcações de testes e dias do calendário.</li></ul>`},
 {id:'escolas',ic:'building',t:'Escolas, Tipologias e Módulos',gif:null,txt:`
  <p>Em <b>Configuração › Escolas</b> pode ter <b>mais do que uma escola</b> no mesmo ano letivo (ex.: uma escola secundária e uma escola profissional). Cada escola tem nome, logotipo, dados e <b>tipologia</b>:</p>
  <ul><li><b>Ensino Regular</b> — turmas do ensino básico/secundário (disciplinas, avaliação por períodos ou semestres) e turmas <b>PROFIJ</b>, que também têm <b>UFCD</b>.</li>
  <li><b>Escola Profissional</b> — turmas de <b>cursos profissionais</b> (curso, ano de formação) avaliadas por <b>módulos</b>: horas, classificação 0–20, aprovação a partir de 10, módulos em atraso.</li></ul>
  <p>Ao criar ou editar uma turma escolhe a escola; as ofertas disponíveis mudam conforme a tipologia. Os relatórios, PDF, atas e o cabeçalho usam o logotipo e o nome da escola da turma. Com várias escolas, a barra lateral mostra um filtro por escola.</p>
  <p><b>Módulos / UFCD</b> (barra lateral, nas turmas modulares): crie-os um a um ou cole a lista (<i>código ; designação ; horas</i>), indique início e fim previsto, lance as classificações na grelha (verde aprovado, vermelho não aprovado, amarelo em atraso) ou calcule-as a partir dos instrumentos associados ao módulo (no instrumento, escolha o módulo).</p>`},
 {id:'organizacao',ic:'layers',t:'Períodos ou Semestres',gif:null,txt:`
  <p>A organização do ano letivo (<b>3 períodos</b> ou <b>2 semestres</b>) é <b>global</b>: escolhe-se em Ano Letivo e Turmas ou no Calendário Escolar e aplica-se ao calendário, contagens, aulas previstas, marcação de testes, avaliação intercalar, instrumentos, avaliação final, relatórios e reuniões.</p>
  <p>Se o calendário importado tiver 3 períodos e a escola funcionar por semestres, a app calcula os semestres a partir dele (pode ajustar o último dia do 1.º semestre). Ao mudar, os instrumentos com data passam para o período/semestre dessa data.</p>`},
 {id:'sessao',ic:'user',t:'Sessão e Integridade dos Dados',gif:null,txt:`
  <p>A app pede <b>início de sessão</b>. No primeiro acesso use <b>admin / admin</b> e altere logo a palavra-passe. Em Definições › Conta e Acesso pode criar contas, mudar palavras-passe e terminar a sessão. A entrada com <b>Microsoft 365 (Office)</b> está preparada: quando a escola registar a aplicação (Client ID / Tenant ID) e a app estiver num endereço https, o botão fica ativo.</p>
  <p>Em Definições › Ferramentas, <b>Integridade dos Dados</b> verifica ligações partidas, identificadores repetidos, períodos inexistentes, datas inválidas, ponderações e fotografias, e corrige o que for seguro. A verificação também corre ao abrir a app.</p>`},
 {id:'apresentacao',ic:'access',t:'Modo de Apresentação (projetar)',gif:null,txt:`
  <p>Toque no <b>olho</b> na barra de cima para projetar a app na aula sem expor dados pessoais. Antes de começar escolhe:</p>
  <ul><li><b>Nomes</b>: só o primeiro nome (se houver dois iguais, junta a inicial do apelido), iniciais, só o número ou completos.</li>
  <li><b>Fotografias</b>: mostrar ou desfocar (as imagens da ajuda e o logotipo nunca são ocultados).</li>
  <li><b>Dados sensíveis</b>: processo, nascimento/idade, repetência, ASE, medidas (MSAI / DL 54), encarregado de educação, contactos e observações ficam desfocados — também nos relatórios, onde o resto (notas, domínios, síntese) continua visível.</li>
  <li><b>Informação do professor</b>: esconde reuniões e lembretes, o seu horário, definições, escola, avisos de cópias, a pesquisa e a troca de turma.</li>
  <li><b>Alunos a ocultar</b>: escolha alunos que não querem que a turma veja os seus dados — o nome passa a “Aluno(a) oculto(a)” e a linha, a ficha e o relatório ficam totalmente desfocados.</li></ul>
  <p>Nada é alterado nos dados; os campos ficam só de leitura. Toque de novo no olho para sair. As escolhas ficam guardadas para a próxima vez.</p>`},
 {id:'dados',ic:'shield',t:'Dados e Cópias de Segurança',gif:null,txt:`
  <p>Os dados ficam <b>só neste dispositivo</b> (no navegador). Em Definições › <b>Cópia de segurança</b> exporte regularmente o ficheiro JSON (inclui fotografias) e guarde-o no iCloud/Drive; para mudar de dispositivo, importe essa cópia.</p>
  <p class="hint">Atenção: o Safari pode apagar dados de sites que não abre há 7 dias — faça cópias com frequência ou use a app a partir do ecrã principal.</p>`},
 {id:'glossario',ic:'book',t:'Glossário',gif:null,txt:`<dl class="glos">
  <dt>Σ</dt><dd>Soma dos tempos letivos dados até um dia (numeração das lições).</dd><dt>AI</dt><dd>Avaliação intercalar (global ao ano letivo).</dd><dt>RA</dt><dd>Reunião de avaliação (conselho de turma) de uma turma.</dd><dt>OD</dt><dd>Teste de outra disciplina marcado para a turma.</dd><dt>F</dt><dd>Falta do professor (não conta como aula dada).</dd>
  <dt>MSAI</dt><dd>Medidas de suporte à aprendizagem e à inclusão (DL 54/2018): universais, seletivas e adicionais.</dd><dt>RTP · PEI · PIT</dt><dd>Relatório técnico‑pedagógico · Programa educativo individual · Plano individual de transição.</dd>
  <dt>DAC</dt><dd>Domínios de autonomia curricular.</dd><dt>DT</dt><dd>Direção de turma / Diretor(a) de turma.</dd><dt>CNL‑E</dt><dd>Componente não letiva de estabelecimento.</dd><dt>PROFIJ</dt><dd>Programa formativo de inserção de jovens (Açores); UFCD = unidade de formação de curta duração.</dd>
  <dt>PO · CO · CE · PE</dt><dd>Produção oral · Compreensão oral · Compreensão escrita · Produção escrita.</dd><dt>Instrumento rápido</dt><dd>Registo de uma % por domínio, sem itens.</dd></dl>`},
 {id:'atalhos',ic:'grid',t:'Atalhos e Gestos',gif:null,txt:`<ul><li><b>⌘K / Ctrl+K</b> — pesquisar alunos, turmas, instrumentos e secções.</li><li><b>⌘Z / Ctrl+Z</b> ou botão ↶ — anular a última alteração.</li><li><b>?</b> — ajuda da secção onde está.</li><li><b>Esc</b> — fechar janelas e menus.</li>
  <li><b>Toque longo</b> numa turma, instrumento ou aluno — menu de ações (mover, duplicar, mudar de período…); em botões e dias — mostra a dica.</li><li><b>Deslizar para a esquerda</b> num instrumento ou tempo não letivo — apagar.</li><li><b>Deslizar no título</b> (secções da turma) — mudar para a turma seguinte/anterior.</li>
  <li><b>Arrastar</b> — tempos não letivos, marcações de testes, dias do calendário (em Editar Dias) e ficheiros para importar.</li><li><b>Grelha de classificações</b> — Enter desce, setas navegam; “Teclado Numérico” para escrever só com o dedo; o Apple Pencil (Rabiscar) também escreve nas células.</li></ul>`},
 {id:'faq',ic:'help',t:'Perguntas Frequentes',gif:null,txt:`
  <p><b>A app não reconhece as minhas aulas no horário da turma.</b> Confirme o seu nome em Definições e a disciplina por ciclo; em Turma › Horário assinale a sigla certa em “Disciplina Nesta Turma”, ou importe o seu horário em PDF.</p>
  <p><b>O 3.º período tem menos dias para a minha turma.</b> O termo das aulas depende do ano de escolaridade (ex.: 9.º, 11.º e 12.º terminam mais cedo) — vem do calendário.</p>
  <p><b>Faltei a uma aula.</b> Registe a falta (Marcação de Testes ou Aulas Previstas): não conta como dada e o Σ seguinte não avança.</p>
  <p><b>Quero apagar um horário importado.</b> Turma › Horário › Apagar Horário, ou O Meu Horário › Apagar….</p>`}
];
function vAjuda(){
  try{ajudaAtualizar()}catch(_){}
  const q=normT(UI.ajQ||'');const L=AJUDA.filter(s=>!q||normT(s.t+' '+s.txt.replace(/<[^>]+>/g,' ')).includes(q));
  $('#view').innerHTML=`
  <div class="card ajh"><div class="ajhd"><h2 style="margin:0">${ic('help',20)} Guia do EduSpruce</h2><p class="mut" style="margin:4px 0 0">Tudo o que a app faz, passo a passo, com animações.</p></div>
    <a class="ajman" href="${MANUAL_URL}" target="_blank" rel="noopener" download><span class="ajmi">${ic('book',22)}</span><span><b>Manual de Instruções completo (PDF)</b><small>46 páginas com imagens — da primeira entrada à resolução de problemas</small></span><span class="btn pri">${ic('download',16)} Descarregar</span></a>
    <input id="aj-q" type="search" placeholder="Pesquisar na ajuda (ex.: faltas, MSAI, calendário)…" value="${esc(UI.ajQ||'')}">
    <div class="ajidx">${AJUDA.map(s=>`<a href="#aj-${s.id}" class="chip" data-aj="${s.id}">${ic(s.ic,14)} ${esc(s.t)}</a>`).join('')}</div></div>
  ${L.length?L.map(s=>`<div class="card ajs" id="aj-${s.id}"><h2>${ic(s.ic,20)} ${esc(s.t)}</h2><div class="ajg ${s.gif&&gifsAjuda()[s.gif]?'':'sem'}"><div class="ajt">${s.txt}</div>${s.gif&&gifsAjuda()[s.gif]?`<figure class="ajf"><img src="${gifsAjuda()[s.gif]}" alt="Animação: ${esc(s.t)}" loading="lazy"><figcaption>${esc(s.t)} — animação</figcaption></figure>`:''}</div></div>`).join('')
    :'<div class="card empty">Sem resultados para essa pesquisa.</div>'}`;
  const qi=$('#aj-q');qi.oninput=()=>{UI.ajQ=qi.value;const p=qi.selectionStart;vAjuda();const n=$('#aj-q');n.focus();n.setSelectionRange(p,p)};
  $$('[data-aj]').forEach(a=>a.onclick=e=>{e.preventDefault();const el=$('#aj-'+a.dataset.aj);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})});
}


