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
function acessoRestrito(){if(!SESSAO||window.__ES_OFF)return false;let p;try{p=perfilAtual()}catch(_){return false}return !!p&&p.id!=='admin'&&!(p.perm&&p.perm.verTodas)}
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

