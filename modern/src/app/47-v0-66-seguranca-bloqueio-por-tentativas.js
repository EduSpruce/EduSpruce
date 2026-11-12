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

/* ===================== v0.67 · Convocatórias e atividades por e-mail: arrastar para qualquer sítio da app ===================== */
REUN_T.ativ={n:'Atividade / Evento',ab:'AT',cor:'#0f8b8d'};
const CV_MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
/* ---- leitura de .eml (MIME) ---- */
function cvQP(s){return s.replace(/=\r?\n/g,'').replace(/(=[0-9A-F]{2})+/gi,m=>{const b=new Uint8Array(m.split('=').filter(Boolean).map(h=>parseInt(h,16)));try{return new TextDecoder('utf-8',{fatal:true}).decode(b)}catch(_){return new TextDecoder('latin1').decode(b)}})}
function cvDec(bytes,cs){try{return new TextDecoder((cs||'utf-8').toLowerCase().replace(/^iso-?8859-?1$/,'latin1').replace(/^windows-1252$/,'windows-1252')).decode(bytes)}catch(_){return new TextDecoder('utf-8').decode(bytes)}}
function cvB64(s){const b=atob(s.replace(/\s+/g,''));const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function cvHdrDec(v){return String(v||'').replace(/=\?([^?]+)\?([BQ])\?([^?]*)\?=/gi,(m,cs,enc,t)=>{try{if(enc.toUpperCase()==='B')return cvDec(cvB64(t),cs);const b=t.replace(/_/g,' ').replace(/=([0-9A-F]{2})/gi,(x,h)=>String.fromCharCode(parseInt(h,16)));return cvDec(Uint8Array.from(b,c=>c.charCodeAt(0)),cs)}catch(_){return t}}).replace(/\?=\s+=\?/g,'')}
function cvHeaders(txt){const o={};const raw=txt.replace(/\r\n/g,'\n');const fim=raw.indexOf('\n\n');const h=(fim<0?raw:raw.slice(0,fim)).replace(/\n[ \t]+/g,' ');h.split('\n').forEach(l=>{const m=l.match(/^([\w-]+):\s*(.*)$/);if(m)o[m[1].toLowerCase()]=m[2]});return {h:o,body:fim<0?'':raw.slice(fim+2)}}
function cvMime(txt,out){out=out||{texto:'',html:'',ics:[]};const {h,body}=cvHeaders(txt);const ct=h['content-type']||'text/plain';const bm=ct.match(/boundary="?([^";]+)"?/i);
  if(/^multipart\//i.test(ct)&&bm){body.split('--'+bm[1]).slice(1).forEach(p=>{if(/^--/.test(p))return;cvMime(p.replace(/^\r?\n/,''),out)});return out}
  const cs=(ct.match(/charset="?([^";]+)"?/i)||[])[1]||'utf-8';const te=(h['content-transfer-encoding']||'').toLowerCase();let t;
  if(te==='base64'){try{t=cvDec(cvB64(body),cs)}catch(_){t=''}}else if(te==='quoted-printable')t=cvQP(body);else t=body;
  if(/text\/calendar|\.ics/i.test(ct+(h['content-disposition']||'')))out.ics.push(t);else if(/text\/html/i.test(ct))out.html+=t;else if(/text\/plain/i.test(ct))out.texto+=t;return out}
const cvHtmlTxt=h=>{const d=new DOMParser().parseFromString(String(h||''),'text/html');d.querySelectorAll('script,style').forEach(x=>x.remove());d.querySelectorAll('br').forEach(b=>b.replaceWith('\n'));d.querySelectorAll('p,div,tr,li,h1,h2,h3,h4,table').forEach(b=>b.append('\n'));return (d.body?d.body.textContent:'').replace(/ /g,' ').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim()};
/* ---- leitura de .msg (Outlook, formato CFB) ---- */
function cvMsg(buf){const dv=new DataView(buf);if(dv.getUint32(0,true)!==0xE011CFD0)throw new Error('Não é um ficheiro .msg do Outlook');const ss=1<<dv.getUint16(30,true),mss=1<<dv.getUint16(32,true);const nFat=dv.getUint32(44,true),dir0=dv.getUint32(48,true),cut=dv.getUint32(56,true),mf0=dv.getUint32(60,true),dif0=dv.getUint32(68,true);
  const sec=n=>512+n*ss;const fatSecs=[];for(let i=0;i<109&&fatSecs.length<nFat;i++){const v=dv.getUint32(76+i*4,true);if(v<0xFFFFFFFA)fatSecs.push(v)}let d=dif0;while(d<0xFFFFFFFA&&fatSecs.length<nFat){for(let i=0;i<ss/4-1&&fatSecs.length<nFat;i++){const v=dv.getUint32(sec(d)+i*4,true);if(v<0xFFFFFFFA)fatSecs.push(v)}d=dv.getUint32(sec(d)+ss-4,true)}
  const FAT=[];fatSecs.forEach(fs=>{for(let i=0;i<ss/4;i++)FAT.push(dv.getUint32(sec(fs)+i*4,true))});const chain=s0=>{const L=[];let s=s0,g=0;while(s<0xFFFFFFFA&&g++<1e6){L.push(s);s=FAT[s]}return L};
  const lerCadeia=(s0,tam)=>{const out=new Uint8Array(tam);let o=0;for(const s of chain(s0)){const n=Math.min(ss,tam-o);if(n<=0)break;out.set(new Uint8Array(buf,sec(s),n),o);o+=n}return out};
  const dirB=chain(dir0).map(s=>new Uint8Array(buf,sec(s),ss));const ents=[];dirB.forEach(b=>{for(let o=0;o+128<=b.length;o+=128){const v=new DataView(b.buffer,b.byteOffset+o,128);const nl=v.getUint16(64,true);let nm='';for(let i=0;i<Math.max(0,nl/2-1);i++)nm+=String.fromCharCode(v.getUint16(i*2,true));ents.push({nm,tipo:v.getUint8(66),esq:v.getUint32(68,true),dir:v.getUint32(72,true),fil:v.getUint32(76,true),ini:v.getUint32(116,true),tam:v.getUint32(120,true)})}});
  const root=ents[0];const miniStream=root?lerCadeia(root.ini,root.tam):new Uint8Array(0);const MF=[];chain(mf0).forEach(s=>{for(let i=0;i<ss/4;i++)MF.push(dv.getUint32(sec(s)+i*4,true))});
  const lerMini=(s0,tam)=>{const out=new Uint8Array(tam);let s=s0,o=0,g=0;while(s<0xFFFFFFFA&&o<tam&&g++<1e6){const n=Math.min(mss,tam-o);out.set(miniStream.subarray(s*mss,s*mss+n),o);o+=n;s=MF[s]}return out};
  const filhos=id=>{const L=[];const walk=i=>{if(i>=ents.length||i===0xFFFFFFFF)return;const e=ents[i];walk(e.esq);L.push(e);walk(e.dir)};walk(id);return L};const top=filhos(root.fil);
  const ler=e=>e.tam<cut?lerMini(e.ini,e.tam):lerCadeia(e.ini,e.tam);const prop=(cod)=>{const u=top.find(e=>e.nm==='__substg1.0_'+cod+'001F');if(u)return new TextDecoder('utf-16le').decode(ler(u));const a=top.find(e=>e.nm==='__substg1.0_'+cod+'001E');return a?cvDec(ler(a),'windows-1252'):''};
  const html=(()=>{const e=top.find(e=>e.nm==='__substg1.0_10130102');return e?cvDec(ler(e),'utf-8'):''})();
  const ics=[];top.filter(e=>e.tipo===1&&/^__attach/.test(e.nm)).forEach(at=>{const L=filhos(at.fil);const nm=(L.find(e=>/_3707001F$|_3704001F$/.test(e.nm)));const nome=nm?new TextDecoder('utf-16le').decode(ler(nm)):'';const dat=L.find(e=>/_37010102$/.test(e.nm));if(dat&&/\.ics$/i.test(nome))ics.push(cvDec(ler(dat),'utf-8'))});
  return {assunto:prop('0037'),de:prop('0C1A')||prop('0042'),texto:prop('1000'),html,ics}}
/* ---- leitura de .ics ---- */
function cvIcs(t){const L=String(t).replace(/\r\n[ \t]/g,'').replace(/\n[ \t]/g,'').split(/\r?\n/);const ev=[];let cur=null;
  const un=v=>v.replace(/\\n/gi,'\n').replace(/\\([,;\\])/g,'$1');const dt=(k,v)=>{const m=v.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);if(!m)return null;let d=new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0));if(/Z$/.test(v))d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)));return {iso:isoData(d),min:m[4]!=null?d.getHours()*60+d.getMinutes():null}};
  L.forEach(l=>{if(/^BEGIN:VEVENT/i.test(l))cur={};else if(/^END:VEVENT/i.test(l)){if(cur)ev.push(cur);cur=null}else if(cur){const i=l.indexOf(':');if(i<0)return;const k=l.slice(0,i).split(';')[0].toUpperCase(),v=l.slice(i+1);
    if(k==='SUMMARY')cur.titulo=un(v);else if(k==='LOCATION')cur.local=un(v);else if(k==='DESCRIPTION')cur.desc=un(v);else if(k==='DTSTART')cur.ini=dt(k,v);else if(k==='DTEND')cur.fim=dt(k,v);else if(k==='ORGANIZER')cur.org=(l.match(/CN=([^;:]+)/i)||[])[1]||v.replace(/^mailto:/i,'');else if(k==='URL')cur.link=v}});return ev}
/* ---- interpretar o texto: convocatória ou atividade ---- */
function cvAnoRef(){const a=A();const m=a&&String(a.nome).match(/(\d{4})/);return m?+m[1]:(new Date().getMonth()>=7?new Date().getFullYear():new Date().getFullYear()-1)}
function cvData(t){const y0=cvAnoRef();const n=normT(t);let m;const comAno=(d,mm,y)=>{if(!y){y=mm>=8?y0:y0+1;if(!/\d{4}/.test(String(cvAnoRef())))y=new Date().getFullYear()}else if(y<100)y+=2000;const dt=new Date(y,mm-1,d);return isNaN(dt)||dt.getDate()!==d?null:isoData(dt)};
  const RE1=/\b(?:dia\s+)?(\d{1,2})\s*(?:\.|º|o)?\s+de\s+(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+de\s+(\d{4}))?/g;
  const RE2=/\b(\d{1,2})\s*[\/.-]\s*(\d{1,2})(?:\s*[\/.-]\s*(\d{2,4}))?\b/g;const C=[];
  while((m=RE1.exec(n)))C.push({i:m.index,iso:comAno(+m[1],CV_MES.map(normT).indexOf(m[2])+1,m[3]&&+m[3])});
  while((m=RE2.exec(n))){const d=+m[1],mm=+m[2];if(d>31||mm>12||!d||!mm)continue;if(/\d\s*$/.test(n.slice(Math.max(0,m.index-1),m.index)))continue;C.push({i:m.index,iso:comAno(d,mm,m[3]&&+m[3])})}
  const ok=C.filter(c=>c.iso);if(!ok.length)return '';const kw=n.search(/realizar|reuni|decorr|tera lugar|data|dia\b|convoc/);ok.sort((a,b)=>Math.abs(a.i-(kw<0?0:kw))-Math.abs(b.i-(kw<0?0:kw)));return ok[0].iso}
function cvHoras(t){const n=normT(t);const hm=s=>{const m=s.match(/(\d{1,2})\s*(?:h|:|horas?)\s*(\d{2})?/);return m&&+m[1]<24?(+m[1])*60+(+(m[2]||0)):null};
  let m=n.match(/(?:das|entre as|entre)\s+(\d{1,2}\s*(?:h|:|horas?)\s*\d{0,2})\s*(?:as|e as|-|–|a)\s*(\d{1,2}\s*(?:h|:|horas?)\s*\d{0,2})/);if(m)return [hm(m[1]),hm(m[2])];
  m=n.match(/(?:pelas|as|a partir das|hora:?|horas:?)\s*(\d{1,2}\s*(?:h|:|horas?)\s*\d{0,2})/);if(m)return [hm(m[1]),null];m=n.match(/\b(\d{1,2}[:h]\d{2})\b/);if(m)return [hm(m[1]),null];return [null,null]}
function cvLocal(t){let m=t.match(/(?:^|\n)\s*(?:local|sala|lugar)\s*[:\-–]\s*([^\n]{2,80})/i);if(m)return m[1].trim();
  m=t.match(/(?:\bn[oa]s?|\bao|\bà|\brealiza-se n[oa]|\bter[aá] lugar n[oa])\s+((?:sala|audit[oó]rio|biblioteca|gin[aá]sio|pavilh[aã]o|refeit[oó]rio|polivalente|bloco|laborat[oó]rio|cantina|anfiteatro|escola|museu|teatro)(?:[^\n,;.]|\.(?=\d))*)/i);return m?m[1].trim().slice(0,60):''}
const cvLink=t=>((String(t).match(/https?:\/\/[^\s<>"]*(teams\.microsoft|zoom\.us|meet\.google|webex)[^\s<>"]*/i)||[])[0]||'');
function cvOrdem(t){const m=t.match(/ordem\s+de\s+trabalhos\s*:?\s*\n?([\s\S]{0,1500})/i);if(!m)return [];const L=[];m[1].split('\n').map(x=>x.trim()).every(l=>{if(!l)return L.length===0;const r=l.match(/^(?:\d+\s*[.)\-–º]|[a-z]\)|[•·\-–])\s*(.+)$/i);if(r){L.push(r[1].trim());return true}if(L.length&&!/^(com os|cumprimentos|atenciosamente|o\s+|a\s+)/i.test(l)&&l.length<160&&!/^[A-ZÁÉÍÓÚ][a-záéíóú]+,/.test(l)){L[L.length-1]+=' '+l;return true}return !L.length&&l.length<160});return L.slice(0,15)}
function cvTipoReun(t,ass){if(ass){const k=cvTipoReun(ass);if(k!=='outra')return k}const n=normT(t);return /conselho de turma|conselhos de turma/.test(n)?(/conselho de turma (de|para) avaliac|reuniao de avaliac/.test(n)?'avl':'ct'):/pedagogico/.test(n)?'ped':/departamento/.test(n)?'dep':/reuniao de avaliac|avaliacao intercalar/.test(n)?'avl':/grupo (disciplinar|de recrutamento)|subdepartamento/.test(n)?'grupo':/diretores de turma|coordenacao de dt/.test(n)?'dt':/encarregados de educacao|pais e ee/.test(n)?'ee':/geral de professores|reuniao geral|plenario/.test(n)?'geral':/formacao|acao de formacao/.test(n)?'form':/equipa|projeto|clube/.test(n)?'equipa':'outra'}
function cvClassificar(t){const n=normT(t);let c=0,a=0;
  [/convoca/,/reuniao/,/ordem de trabalhos/,/conselho (de turma|pedagogico|geral)/,/departamento|grupo disciplinar/,/realizar-se-a|realizara/,/presenca (e|é) obrigatoria|comparencia/,/sessao (ordinaria|extraordinaria)/,/\bata\b/].forEach(r=>{if(r.test(n))c++});
  [/atividade/,/visita de estudo/,/palestra|workshop|oficina/,/exposicao|feira|mostra/,/concurso|torneio|corta-mato|campeonato/,/comemorac|celebrac|\bdia (da|do|de|mundial|internacional)\b|semana d/,/espetaculo|concerto|teatro|sarau/,/\bpaa\b|plano anual/,/alunos (participam|vao)|inscric/,/convite|convidamos/].forEach(r=>{if(r.test(n))a++});
  return c>=a?(c?'conv':'ativ'):'ativ'}
function cvTurmas(t){const a=A();if(!a)return [];const L=[];const re=new RegExp(RE_TURMA.source,'gi');let m;while((m=re.exec(t))){const k=normTurma(m[0]);a.turmas.forEach(x=>{if(turmasDaClasse(x).some(c=>normTurma(c)===k)&&!L.includes(x.id))L.push(x.id)})}return L}
function cvInterpretar(o){/* o={assunto,de,texto,html,ics:[]} */const corpo=(o.texto&&o.texto.trim())||cvHtmlTxt(o.html||'');const tudo=[o.assunto||'',corpo].join('\n');const ev=(o.ics||[]).flatMap(cvIcs)[0]||null;
  const tudoEv=tudo+(ev?'\n'+(ev.titulo||'')+'\n'+(ev.desc||''):'');const tipo=cvClassificar(tudoEv);let [ini,fim]=cvHoras(tudo);let data=cvData(tudo);
  if(ev&&ev.ini){data=ev.ini.iso;if(ev.ini.min!=null)ini=ev.ini.min;if(ev.fim&&ev.fim.min!=null)fim=ev.fim.min}
  const tit=(o.assunto||(ev&&ev.titulo)||cvTituloDe(corpo,tipo)||corpo.split('\n').find(l=>l.trim().length>6)||'').replace(/^(re|fw|fwd|enc|res)\s*:\s*/ig,'').trim().slice(0,140);
  const conv=(o.de||(ev&&ev.org)||'').replace(/<[^>]+>/g,'').replace(/"/g,'').trim();const sig=(corpo.match(/\n\s*((?:O|A)\s+(?:Presidente|Diretor[a]?|Coordenador[a]?|Subdiretor[a]?|Adjunt[oa])[^\n]{0,60})\s*\n\s*([^\n]{3,60})/i)||[]);
  return {tipo,reTipo:cvTipoReun(tudoEv,o.assunto||(ev&&ev.titulo)||''),titulo:tit,data,ini,fim,local:(ev&&ev.local)||cvLocal(tudo),link:(ev&&ev.link)||cvLink(tudo+(ev&&ev.desc||'')),turmas:cvTurmas(cvTipoReun(tudoEv,o.assunto||(ev&&ev.titulo)||'')==='ct'||cvTipoReun(tudoEv,o.assunto||(ev&&ev.titulo)||'')==='avl'||tipo==='ativ'?tudoEv:((o.assunto||'')+'\n'+(ev&&ev.titulo||''))),ordem:cvOrdem(corpo+(ev&&ev.desc?'\n'+ev.desc:'')),convocante:sig[2]?(sig[2].trim()+' ('+sig[1].trim()+')'):conv,texto:corpo,assunto:o.assunto||'',deIcs:!!ev}}
const cvPareceEmail=t=>{const n=normT(t);return t.length>40&&(/convoca|reuniao|ordem de trabalhos|atividade|visita de estudo|palestra|realizar-se-a|tera lugar|decorrera/.test(n))&&!!cvData(t)};
/* ---- diálogo de confirmação ---- */
function cvDlg(R,fonte){const a=A()||novoAno(anoAuto());const hh=m=>m==null?'':String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
  const draw=()=>{const conv=R.tipo==='conv';const dup=R.data&&reunioes(a).some(x=>x.data===R.data&&(x.ini===R.ini||normT(x.titulo||'')===normT(R.titulo)));
   openDrawer(conv?'Convocatória Recebida':'Atividade Recebida',`<div class="ed cvd">
    <div class="cvhd">${ic(conv?'meet':'flag',22)}<div><b>${conv?'Parece uma convocatória para uma reunião':'Parece uma atividade / evento'}</b><small>${esc(fonte||'')}${R.deIcs?' · com convite de calendário':''}</small></div></div>
    <div class="seg" id="cv-tp" role="radiogroup" aria-label="Tipo"><button type="button" data-cvt="conv" class="${conv?'on':''}" aria-checked="${conv}">${ic('meet',14)} Convocatória</button><button type="button" data-cvt="ativ" class="${!conv?'on':''}" aria-checked="${!conv}">${ic('flag',14)} Atividade</button></div>
    ${R._pouco?`<div class="alert w cvpouco">${ic('info',14)} <div><b>Só chegou parte do e-mail${R.titulo?' (o assunto)':''}.</b> O Outlook na web não deixa arrastar o e-mail inteiro. Abra a convocatória, selecione o texto (<b>Ctrl+A</b>, <b>Ctrl+C</b>) e cole aqui — a app preenche o resto:<textarea class="autoalto" id="cv-cola" rows="3" placeholder="Cole aqui o texto da convocatória…"></textarea></div></div>`:''}
    ${dup?`<div class="alert w">${ic('alert',14)} Já existe na app um evento nesse dia com a mesma hora ou o mesmo título.</div>`:''}
    <label>Título</label><input id="cv-ti" value="${esc(R.titulo)}">
    ${conv?`<label>Tipo de reunião</label><select id="cv-rt">${Object.entries(REUN_T).filter(([k])=>k!=='ativ').map(([k,v])=>`<option value="${k}" ${R.reTipo===k?'selected':''}>${esc(v.n)}</option>`).join('')}</select>`:''}
    <div class="g3"><div><label>Data</label><input type="date" id="cv-d" value="${esc(R.data||'')}" class="${R.data?'':'falta'}"></div><div><label>Início</label><input type="time" id="cv-i" value="${hh(R.ini)}"></div><div><label>Fim</label><input type="time" id="cv-f" value="${hh(R.fim)}"></div></div>
    <div class="g2"><div><label>Local</label><input id="cv-l" value="${esc(R.local||'')}" placeholder="ex.: Sala 2.08"></div><div><label>Ligação (Teams/Zoom)</label><input id="cv-k" value="${esc(R.link||'')}" placeholder="https://…"></div></div>
    <label>${conv?'Convocante':'Responsável'}</label><input id="cv-c" value="${esc(R.convocante||'')}">
    ${(R.turmaTxt||[]).length?`<p class="hint" style="margin:8px 0 0">${ic('users',13)} Turma${R.turmaTxt.length>1?'s':''} referida${R.turmaTxt.length>1?'s':''}: <b>${esc(R.turmaTxt.join(', '))}</b>${R.turmas.length?'':' — não existe nesta app (fica no título)'}</p>`:''}
    ${a.turmas.length?`<label>Turmas</label><div class="cvtur">${a.turmas.map(t=>`<label class="chk"><input type="checkbox" data-cvtu="${t.id}" ${R.turmas.includes(t.id)?'checked':''}> ${esc(t.nome)} <span class="mut">${esc(t.disciplina)}</span></label>`).join('')}</div>`:''}
    ${conv?`<label>Ordem de trabalhos <span class="mut">(um ponto por linha)</span></label><textarea class="autoalto" id="cv-o" rows="${Math.max(3,Math.min(8,R.ordem.length+1))}">${esc(R.ordem.join('\n'))}</textarea>`:`<label>Descrição</label><textarea class="autoalto" id="cv-o" rows="3">${esc(R.ordem.join('\n')||R.texto.slice(0,400))}</textarea>`}
    ${!conv&&typeof jnOn==='function'&&jnOn()?`<label class="chk" style="margin-top:8px"><input type="checkbox" id="cv-jn" checked> ${ic('news',14)} Juntar também ao Jornal Escolar (para decidir se se cobre)</label>`:''}
    <details class="cvtx"><summary>Ver o texto recebido</summary><pre>${esc(R.texto.slice(0,4000))}</pre></details>
    <div class="row" style="margin-top:14px;gap:8px"><span class="sp1"></span><button class="btn" id="cv-x">Cancelar</button><button class="btn pri" id="cv-ok">${ic('calendar',14)} Marcar no Calendário</button></div></div>`);
   $$('#dw-b [data-cvt]').forEach(b=>b.onclick=()=>{ler();R.tipo=b.dataset.cvt;draw()});
   const cc=$('#cv-cola');if(cc){const usa=()=>{const t=cc.value.trim();if(t.length<20)return;const N=cvInterpretar({assunto:R.titulo&&!R.data?R.titulo:'',texto:t});ler();['tipo','reTipo','data','ini','fim','local','link','ordem','convocante'].forEach(k=>{const v=N[k];if(v!=null&&v!==''&&!(Array.isArray(v)&&!v.length))R[k]=v});if(N.turmas.length)R.turmas=N.turmas;if(!R.titulo)R.titulo=N.titulo;R.texto=t;R._pouco=false;setTimeout(()=>{draw();toast('Convocatória lida','ok')},0)};cc.addEventListener('paste',()=>setTimeout(usa,30));cc.addEventListener('change',usa)}$('#cv-x').onclick=closeDrawer;$('#cv-ok').onclick=gravar};
  const ler=()=>{const v=id=>($('#'+id)||{}).value;R.titulo=v('cv-ti')||R.titulo;if($('#cv-rt'))R.reTipo=v('cv-rt');R.data=v('cv-d')||'';R.ini=v('cv-i')?horaMin(v('cv-i')):null;R.fim=v('cv-f')?horaMin(v('cv-f')):null;R.local=v('cv-l')||'';R.link=v('cv-k')||'';R.convocante=v('cv-c')||'';R.turmas=$$('#dw-b [data-cvtu]').filter(x=>x.checked).map(x=>x.dataset.cvtu);R.ordem=String(v('cv-o')||'').split('\n').map(x=>x.trim()).filter(Boolean)};
  const gravar=()=>{ler();if(!R.data){toast('Indique a data','erro');$('#cv-d').focus();return}const conv=R.tipo==='conv';const ini=R.ini!=null?R.ini:(conv?17*60:9*60);
    const r={id:uid(),tipo:conv?R.reTipo:'ativ',titulo:R.titulo,data:R.data,ini,fim:R.fim!=null&&R.fim>ini?R.fim:ini+(conv?90:120),semHora:R.ini==null,local:R.local,link:R.link,turma:R.turmas[0]||null,turmas:R.turmas,convocante:R.convocante,participantes:'',lembretes:[1440,60],ordem:conv?R.ordem.map(t=>({id:uid(),t,feito:false})):[],prep:[],notas:conv?'':(R.ordem.length?R.ordem.join('\n')+'\n\n':'')+(R.texto||'').trim(),decisoes:[],estado:'agendada',origem:'email'};
    reunioes(a).push(r);
    if(!conv&&$('#cv-jn')&&$('#cv-jn').checked){try{const {y}=JN();y.ativ.push({id:uid(),orig:'manual',titulo:R.titulo,sec:'Recebida por e-mail',resp:R.convocante,cal:fmtIsoL(R.data),dec:null,prec:'dia',datas:[{ini:R.data,fim:R.data}],hora:R.ini,criada:Date.now(),det:R.ordem.join(' · ').slice(0,300)})}catch(e){console.warn(e)}}
    saveNow();audit(conv?'Reuniões':'Calendário',conv?'Convocatória importada do e-mail':'Atividade importada do e-mail',R.titulo+' · '+R.data);closeDrawer();toast((conv?'Reunião marcada: ':'Atividade marcada: ')+fmtIsoL(R.data),'ok');go('reunioes')};
  draw()}
/* ---- entrada: ficheiros, texto arrastado e colado ---- */
async function cvDeFicheiro(f){const nm=f.name.toLowerCase();let o;
  if(nm.endsWith('.msg'))o=cvMsg(await f.arrayBuffer());
  else if(nm.endsWith('.ics')){o={assunto:'',texto:'',ics:[await f.text()]}}
  else{const t=await f.text();if(nm.endsWith('.eml')||/^(received|from|subject|mime-version|return-path|date|message-id):/im.test(t.slice(0,2000))){const {h}=cvHeaders(t);const m=cvMime(t);o={assunto:cvHdrDec(h.subject),de:cvHdrDec(h.from||''),texto:m.texto,html:m.html,ics:m.ics}}else if(/\.html?$/.test(nm))o={html:t};else o={texto:t}}
  const R=cvInterpretar(o);cvDlg(R,f.name)}
{const _iqC=importarQualquer;importarQualquer=async function(f){const nm=(f&&f.name||'').toLowerCase();if(/\.(eml|msg|ics|txt|html?)$/.test(nm)){try{return await cvDeFicheiro(f)}catch(e){console.warn(e);return toast('Não foi possível ler '+f.name+': '+e.message,'erro')}}return _iqC.apply(this,arguments)}}
const cvEditavel=el=>!!(el&&el.closest&&el.closest('input,textarea,select,[contenteditable=true],#drawer,dialog,.dsrch'));
const CV_INTERNOS=['text/x-dw','text/x-ini','text/x-eg','text/x-mod','text/x-pl','text/x-al'];const cvInterno=ty=>ty.some(x=>CV_INTERNOS.includes(x)||/^text\/x-(dw|ini|eg)/.test(x));
let cvOv=null;const cvOvMostrar=on=>{if(on&&!cvOv){cvOv=document.createElement('div');cvOv.id='cvov';cvOv.innerHTML=`<div>${ic('meet',30)}<b>Largue aqui o e-mail</b><span>Convocatória ou atividade — a app lê e marca no calendário</span></div>`;document.body.appendChild(cvOv)}if(cvOv)cvOv.classList.toggle('on',!!on)};
document.addEventListener('dragover',e=>{const ty=[...((e.dataTransfer||{}).types||[])];if(ty.includes('Files')||cvInterno(ty)||window.__dragInt||cvEditavel(e.target)||!ty.length)return;e.preventDefault();try{e.dataTransfer.dropEffect='copy'}catch(_){}cvOvMostrar(true);clearTimeout(cvOvMostrar._t);cvOvMostrar._t=setTimeout(()=>cvOvMostrar(false),400)});
document.addEventListener('drop',e=>{cvOvMostrar(false);const dt=e.dataTransfer;if(!dt||(dt.files&&dt.files.length))return;const ty=[...dt.types];if(!ty.length||cvInterno(ty)||window.__dragInt||cvEditavel(e.target))return;e.preventDefault();
  /* recolhe tudo o que o programa de origem enviou (o Outlook na web pode enviar só o assunto, ou dados próprios) */
  const D={};ty.forEach(k=>{try{D[k]=dt.getData(k)}catch(_){}});const html=D['text/html']||'';let txt=D['text/plain']||cvHtmlTxt(html)||'';let assunto='';
  Object.entries(D).forEach(([k,v])=>{if(!v||k==='text/plain'||k==='text/html')return;try{const j=JSON.parse(v);const pega=o=>{if(!o||typeof o!=='object')return;for(const [kk,vv] of Object.entries(o)){if(typeof vv==='string'){if(/subject|assunto|title/i.test(kk)&&!assunto)assunto=vv;else if(/preview|body|snippet|text/i.test(kk)&&vv.length>txt.length)txt=vv}else if(typeof vv==='object')pega(vv)}};pega(j)}catch(_){if(typeof v==='string'&&!/^https?:\/\//.test(v.trim())&&v.length>txt.length)txt=v}});
  try{console.info('[EduSpruce] largado:',ty.join(', '))}catch(_){}
  const R=cvInterpretar({assunto,texto:txt,html});R._pouco=(txt+assunto).trim().length<160||!R.data;cvDlg(R,/outlook|office|microsoft/i.test(JSON.stringify(D).slice(0,4000))?'Outlook':'Arrastado para a app')});
document.addEventListener('paste',e=>{if(cvEditavel(e.target)||document.body.classList.contains('login-on'))return;const cd=e.clipboardData;if(!cd)return;const txt=cd.getData('text/plain')||cvHtmlTxt(cd.getData('text/html'));if(!txt||!cvPareceEmail(txt))return;e.preventDefault();cvDlg(cvInterpretar({texto:txt,html:cd.getData('text/html')}),'Texto colado')});


/* rótulo do professor nas assinaturas e relatórios, com o género certo (perfil › género, senão pelo nome) */
function profGenProfX(){try{const p=perfil();if(p&&(p.genero==='F'||p.genero==='M'))return p.genero}catch(_){}const n=String(S.cfg.professor||'').replace(/^prof\S*\s+/i,'').trim();if(!n)return '';try{return guessGen(n)}catch(_){return ''}}
function profRotulo(){const g=profGenProfX();return g==='F'?'A Professora':g==='M'?'O Professor':'O(A) Professor(a)'}
function profAssin(rot){const n=profNome(S.cfg.professor);return (rot||profRotulo())+(n?'\n'+n:'')}


function cvTituloDe(t,tipo){const s=String(t).replace(/\s+/g,' ');const RE=tipo==='conv'?/((?:reuni[aã]o|conselho|assembleia|sess[aã]o)\b[^,.;:()]{0,70})/i:/((?:visita de estudo|palestra|workshop|oficina|exposi[cç][aã]o|feira|concurso|torneio|corta-mato|comemora[cç][aã]o|semana d|dia d[aeo]|dia mundial|dia internacional|concerto|espet[aá]culo|sarau|sess[aã]o|atividade|campanha|a[cç][aã]o de)[^,.;:()]{0,70})/i;
  const m=s.match(RE);if(!m)return '';let x=m[1].replace(/\s+(no|na|nos|nas)\s+dia\b.*$/i,'').replace(/\s+(que|a realizar|a decorrer|ter[aá]|realiza|decorre|pelas|[aà]s)\b.*$/i,'').replace(/\s+(do|da|de|no|na|em|com)$/i,'').trim();return x.charAt(0).toUpperCase()+x.slice(1)}


function cvColarDlg(){openDrawer('Colar E-mail',`<div class="ed"><p class="hint" style="margin-top:0">Cole o texto de uma convocatória ou de uma atividade (do Outlook, Gmail, Teams…). Também pode <b>arrastar o e-mail</b> (.msg, .eml) ou o convite (.ics) para qualquer sítio da app.</p><textarea id="cvc-t" rows="10" placeholder="Cole aqui o texto do e-mail…"></textarea><div class="row" style="margin-top:10px"><span class="sp1"></span><button class="btn pri" id="cvc-ok">${ic('sparkle',14)} Ler</button></div></div>`);
  const go_=()=>{const t=$('#cvc-t').value.trim();if(t.length<20)return toast('Cole o texto do e-mail','erro');cvDlg(cvInterpretar({texto:t}),'Texto colado')};$('#cvc-ok').onclick=go_;$('#cvc-t').addEventListener('paste',()=>setTimeout(()=>{if($('#cvc-t')&&$('#cvc-t').value.trim().length>40)go_()},60));setTimeout(()=>$('#cvc-t')&&$('#cvc-t').focus(),60)}
{const _vRc=typeof vReunioes==='function'?vReunioes:null;if(_vRc){vReunioes=function(){const r=_vRc.apply(this,arguments);try{const bx=$('#barx');if(bx&&!$('#b-cvc')){bx.insertAdjacentHTML('beforeend',`<button type="button" class="btn" id="b-cvc" title="Colar ou arrastar uma convocatória do e-mail">${ic('paste',15)} Colar E-mail…</button>`);$('#b-cvc').onclick=cvColarDlg}}catch(_){}return r};if(go._f)go._f.reunioes=vReunioes}}

/* v0.69 · leitura mais fina das convocatórias: quem assina, ordem de trabalhos (ponto 1, 2…), turma, data e hora */
const CV_NUM={um:1,uma:1,primeiro:1,dois:2,duas:2,segundo:2,tres:3,terceiro:3,quatro:4,quarto:4,cinco:5,quinto:5,seis:6,sexto:6,sete:7,setimo:7,oito:8,oitavo:8,nove:9,nono:9,dez:10,decimo:10};
const CV_DIAS=['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
const CV_FECHO=/^(com os (melhores )?cumprimentos|cumprimentos|atenciosamente|atentamente|saudacoes|melhores cumprimentos|obrigad[oa]|um abraco|abraco|beijinhos|bjs?|grat[oa])\b/;
/* ---- data: «12 de novembro», «12/11», «quinta-feira, 12», «amanhã», «próxima quinta-feira» ---- */
cvData=function(t){const y0=cvAnoRef();const n=normT(t).replace(/\s+/g,' ');const hoje=new Date();hoje.setHours(0,0,0,0);
  const comAno=(d,mm,y)=>{if(!y)y=mm>=8?y0:y0+1;else if(y<100)y+=2000;const dt=new Date(y,mm-1,d);if(isNaN(dt)||dt.getDate()!==d)return null;return isoData(dt)};const C=[];let m;
  const RE1=/\b(?:dia\s+)?(\d{1,2})\s*(?:\.|º|o)?\s*(?:de\s+)?(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+(?:de\s+)?(\d{4}))?/g;
  while((m=RE1.exec(n)))C.push({i:m.index,iso:comAno(+m[1],CV_MES.map(normT).indexOf(m[2])+1,m[3]&&+m[3])});
  const RE2=/(?:^|[^\d:])(\d{1,2})\s*[\/.-]\s*(\d{1,2})(?:\s*[\/.-]\s*(\d{2,4}))?(?![\d:h])/g;
  while((m=RE2.exec(n))){const d=+m[1],mm=+m[2];if(!d||!mm||d>31||mm>12)continue;const ctx=n.slice(Math.max(0,m.index-6),m.index+1);if(/\.\s*º|ano|º/.test(n.slice(m.index,m.index+8)))continue;C.push({i:m.index+1,iso:comAno(d,mm,m[3]&&+m[3])})}
  const rel=[[/\bhoje\b/,0],[/\bamanha\b/,1],[/\bdepois de amanha\b/,2]];rel.forEach(([re,k])=>{const x=n.search(re);if(x>=0){const d=new Date(hoje);d.setDate(d.getDate()+k);C.push({i:x,iso:isoData(d),fraco:1})}});
  const RD=/\b(?:na |no )?(?:proxim[ao] )?(segunda|terca|quarta|quinta|sexta|sabado|domingo)(?:-feira)?\b(?!\s*,?\s*\d)/g;while((m=RD.exec(n))){const w=CV_DIAS.indexOf(m[1]);const d=new Date(hoje);let k=(w-d.getDay()+7)%7;if(k===0)k=7;d.setDate(d.getDate()+k);C.push({i:m.index,iso:isoData(d),fraco:1})}
  const ok=C.filter(c=>c.iso);if(!ok.length)return '';const fortes=ok.filter(c=>!c.fraco);const L=fortes.length?fortes:ok;
  const kw=[...n.matchAll(/realizar|reuni|decorr|tera lugar|ter lugar|convoc|marcad|agendad|\bdia\b|\bdata\b/g)].map(x=>x.index);
  const dist=c=>kw.length?Math.min(...kw.map(k=>Math.abs(c.i-k)+(c.i<k?15:0))):c.i;L.sort((a,b)=>dist(a)-dist(b));
  /* uma data já passada (ex.: data do envio) só ganha se não houver outra */
  const fut=L.filter(c=>c.iso>=isoData(hoje));return (fut[0]||L[0]).iso};
/* ---- hora: «17h30», «17:30», «17.30h», «às 17 horas», «das 14h às 16h», «14h-16h» ---- */
cvHoras=function(t){const n=normT(t).replace(/\s+/g,' ');const H='(\\d{1,2})\\s*(?:h|:|\\.(?=\\d{2}\\s*h)|horas?)\\s*(\\d{2})?\\s*(?:h|min(?:utos)?)?';const hm=(a,b)=>{const h=+a,mi=+(b||0);return h<24&&mi<60?h*60+mi:null};let m;
  m=n.match(new RegExp('(?:das|entre as|entre|de)\\s+'+H+'\\s*(?:as|e as|-|–|a|ate as)\\s*'+H));if(m)return [hm(m[1],m[2]),hm(m[3],m[4])];
  m=n.match(new RegExp('\\b'+H+'\\s*(?:-|–)\\s*'+H));if(m&&/h|:/.test(m[0]))return [hm(m[1],m[2]),hm(m[3],m[4])];
  const L=[];const re=new RegExp('(pelas|as|a partir das|com inicio as|inicio:?|hora:?|horas:?|hora de inicio:?)?\\s*\\b'+H,'g');while((m=re.exec(n))){if(!/[h:]|horas?/.test(m[0]))continue;const v=hm(m[2],m[3]);if(v==null)continue;L.push({v,peso:m[1]?2:1,i:m.index})}
  if(!L.length){m=n.match(/\b(?:pelas|as)\s+(\d{1,2})\s+(?:da (manha|tarde|noite))/);if(m){let h=+m[1];if(m[2]!=='manha'&&h<12)h+=12;return [h*60,null]}return [null,null]}
  L.sort((a,b)=>b.peso-a.peso||a.i-b.i);return [L[0].v,null]};
/* ---- turma: «12.º B», «12º B», «12B», «turma B do 12.º ano», «11.º B/C», «PROFIJ II» ---- */
function cvTurmaTxt(t){const s=String(t);let m=s.match(/\b(\d{1,2})\s*\.?\s*[ºo°]?\s*(?:ano\s*)?(?:turma\s*)?([A-Z](?:\s*\/\s*[A-Z])?)\b(?!\w)/);
  const L=[];const re=/(?<![\d.:,])\b(\d{1,2})\s*\.?\s*[ºo°]\s*([A-Z](?:\s*\/\s*[A-Z])?)\b|(?<![\d.:,])\b(\d{1,2})([A-Z])\b|\b[Tt]urma\s+([A-Z])\s+do\s+(\d{1,2})\s*\.?\s*[ºo°]?\s*ano\b|\bPROFIJ\s*[IVX\d]+(?:\s*[A-Z])?\b|\b(?:CEF|PIEF)\b(?:\s*[A-Z0-9]+)?/g;
  while((m=re.exec(s))){let x;if(m[1])x=m[1]+'.º '+m[2].replace(/\s+/g,'').toUpperCase();else if(m[3])x=m[3]+'.º '+m[4].toUpperCase();else if(m[5])x=m[6]+'.º '+m[5].toUpperCase();else x=m[0].replace(/\s+/g,' ').trim();if(!L.includes(x))L.push(x)}return L}
cvTurmas=function(t){const a=A();if(!a)return [];const out=[];cvTurmaTxt(t).forEach(x=>{const k=normTurma(x);a.turmas.forEach(tt=>{if(turmasDaClasse(tt).some(c=>{const kc=normTurma(c);return kc===k||kc.includes(k)&&/\//.test(c)})&&!out.includes(tt.id))out.push(tt.id)})});return out};
/* ---- ordem de trabalhos: procura o ponto 1 (ou «um», «primeiro», «ponto único») e depois os seguintes ---- */
cvOrdem=function(t){const txt=String(t).replace(/\r/g,'');const ini=txt.search(/ordem\s+(de\s+)?trabalhos/i);if(ini<0&&!/\bponto\s+(1|um|primeiro)\b/i.test(txt))return [];let base=ini>=0?txt.slice(ini).replace(/^ordem\s+(de\s+)?trabalhos\s*:?\s*/i,''):txt;
  const fim=base.split('\n').findIndex((l,k)=>k>0&&CV_FECHO.test(normT(l.trim())));if(fim>0)base=base.split('\n').slice(0,fim).join('\n');
  if(/ponto\s+(u|ú)nico/i.test(base)){const m=base.match(/ponto\s+[uú]nico\s*[:.\-–]?\s*([^\n]+)/i);return m?[m[1].replace(/[;.,]\s*$/,'').trim()]:[]}
  const acc=w=>w.replace(/e/g,'[eéê]').replace(/a/g,'[aáâ]').replace(/i/g,'[ií]').replace(/o/g,'[oóô]');const mk=k=>{const w=Object.keys(CV_NUM).filter(x=>CV_NUM[x]===k).map(acc).join('|');return new RegExp('(?:^|\\n|\\s)(?:ponto\\s+(?:'+k+'|'+w+')\\s*(?:\\.|º|:|-|–|\\))?|(?:'+w+')\\s*(?:ponto)?\\s*[:\\-–)]|'+k+'\\s*(?:\\.(?!\\d)|\\)|º|-|–|:))\\s*','i')};
  const L=[];let resto=base;let m=mk(1).exec(resto);if(!m)return [];resto=resto.slice(m.index+m[0].length);
  for(let k=2;k<=20;k++){const r=mk(k);const nx=r.exec(resto);const seg=nx?resto.slice(0,nx.index):resto;let it=seg.split(/\n\s*\n/)[0].replace(/\s*\n\s*/g,' ').replace(/[;.,]\s*$/,'').trim();if(!nx){const lin=seg.split('\n').map(x=>x.trim());let acc=[];for(const l of lin){if(!l){if(acc.length)break;continue}if(CV_FECHO.test(normT(l))||/^(o|a)\s+(presidente|diretor|coordenador|subdiretor|adjunt)/i.test(l))break;acc.push(l);if(acc.join(' ').length>220)break}it=acc.join(' ').replace(/[;.,]\s*$/,'').trim()}
    it=it.split(/\s(?=(?:com os (?:melhores )?cumprimentos|cumprimentos|atenciosamente|atentamente|saudações)\b)/i)[0].replace(/[;.,]\s*$/,'').trim();if(it)L.push(it.slice(0,240));if(!nx)break;resto=resto.slice(nx.index+nx[0].length)}return L.slice(0,20)};
/* ---- quem assina: bloco final depois da despedida, ou «O Presidente / Nome», ou o remetente ---- */
function cvAssina(t,de){const L=String(t||'').replace(/\r/g,'').replace(/\b(com os (?:melhores )?cumprimentos|cumprimentos|atenciosamente|atentamente|saudações|grat[oa])\s*[,.]\s*/gi,'$1\n').replace(/^(.*\n)?((?:o|a)\s+(?:presidente|diretor[a]?|subdiretor[a]?|coordenador[a]?|adjunt[oa])[^\n,]*),\s*([^\n,]{3,60})\s*$/im,(x,a,b,c)=>(a||'')+b+'\n'+c).split('\n').map(x=>x.replace(/\s+/g,' ').trim());const cargoRe=/^(?:(?:o|a)\s+)?(presidente|vice-presidente|diretor[a]?|subdiretor[a]?|adjunt[oa]|coordenador[a]?|secret[aá]ri[oa]|professor[a]?|docente|respons[aá]vel|equipa|dire[cç][aã]o|conselho)\b.*$/i;
  const ehNome=l=>/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\p{L}'’.-]+(?:\s+(?:d[aeo]s?|e)?\s*[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\p{L}'’.-]*){0,5}$/u.test(l)&&l.split(' ').length<=7&&l.length<=60&&!/^(caros?|car[ao]s|exm|bom dia|boa tarde|ola|olá)/i.test(l);
  let i=L.findIndex(l=>CV_FECHO.test(normT(l)));let bloco=[];if(i>=0)bloco=L.slice(i+1).filter(Boolean).slice(0,4);else{const ult=L.filter(Boolean).slice(-4);bloco=ult}
  bloco=bloco.filter(l=>!/^(enviado|sent|tel|telefone|tlm|e-?mail|www|http|---|_+$|@)/i.test(l)&&!/@/.test(l));
  let nome='',cargo='';bloco.forEach(l=>{if(!cargo&&cargoRe.test(l))cargo=l.replace(/^[(\-–]|[)]$/g,'').trim();else if(!nome&&ehNome(l))nome=l});
  if(!nome&&!cargo){const m=String(t).match(/\n\s*((?:O|A)\s+(?:Presidente|Diretor[a]?|Coordenador[a]?|Subdiretor[a]?|Adjunt[oa])[^\n]{0,60})\s*\n\s*([^\n]{3,60})/i);if(m){cargo=m[1].trim();nome=m[2].trim()}}
  const rem=String(de||'').replace(/<[^>]+>/g,'').replace(/"/g,'').trim();if(!nome&&rem)nome=rem;
  return nome&&cargo?nome+' ('+cargo+')':nome||cargo}
{const _cvI=cvInterpretar;cvInterpretar=function(o){const R=_cvI.apply(this,arguments);try{const corpo=(o.texto&&o.texto.trim())||cvHtmlTxt(o.html||'');const a=cvAssina(corpo,o.de);if(a)R.convocante=a;const tt=cvTurmaTxt([o.assunto||'',corpo].join('\n'));R.turmaTxt=tt;if(!o.assunto){const q=corpo.match(/(?:intitulad[ao]|designad[ao]|subordinad[ao] ao tema|tema)\s*:?\s*[«"“]([^»"”]{4,140})[»"”]/i)||corpo.match(/[«“]([^»”]{6,140})[»”]/);if(q)R.titulo=q[1].trim()}if(!R.local){const m=corpo.match(/\b(sala\s+[A-Z]?\.?\d+[\w.]*|sala de [a-zà-ú]+|audit[oó]rio|biblioteca|pavilh[aã]o|gin[aá]sio|refeit[oó]rio|polivalente|bar dos professores)\b/i);if(m)R.local=m[1]}if(R.local)R.local=R.local.split(/\s+(?:com (?:a|o|os|as) |no dia |na (?:segunda|terça|quarta|quinta|sexta)|pelas |às \d|a partir|das \d|para (?:a|o|os|as) )/i)[0].replace(/[,;.]\s*$/,'').trim();const ord=cvOrdem(corpo);if(ord.length)R.ordem=ord}catch(e){console.warn(e)}return R}}

/* v0.69 · caixas de texto que crescem com o conteúdo (mostra o texto todo) */
function autoAlto(el){if(!el)return;const f=()=>{el.style.height='auto';el.style.height=Math.max(el.scrollHeight+2,60)+'px'};f();requestAnimationFrame(f);setTimeout(f,350)}
document.addEventListener('input',e=>{if(e.target&&e.target.matches&&e.target.matches('textarea.autoalto'))autoAlto(e.target)},true);
{const _oD=openDrawer;openDrawer=function(){const r=_oD.apply(this,arguments);document.querySelectorAll('textarea.autoalto').forEach(autoAlto);return r}}

const comPrazo=(p,ms,v)=>Promise.race([p,new Promise(ok=>setTimeout(()=>ok(v),ms))]);
try{if(!sessaoAtual())document.body.classList.add('login-on');if(!S.cfg.pinHash){aplicarPrefs();go('inicio')}}catch(_){}
(async()=>{IDB=await idbAbrir();if(IDB){const fx=await comPrazo(idbTodas(IDB),4000,{});Object.assign(FOTOS,fx||{});
    const ej=await comPrazo(idbLerEstado(),3000,null);if(ej){try{const e=JSON.parse(ej);if((e._ts||0)>(S._ts||0)||ERRO_CARGA||!S.anos.length&&e.anos&&e.anos.length){S=migrate(e);ERRO_CARGA=false}}catch(_){}}
    arrumarFotos()}
  _ultimoJ=JSON.stringify(S);if(IDB)idbEstado(_ultimoJ);aplicarPrefs();
  if(ERRO_CARGA&&localStorage.getItem(KEY+'.bak')&&confirm('Os dados não puderam ser lidos. Recuperar a cópia automática de '+(localStorage.getItem(KEY+'.bakd')||'ontem')+'?')){try{S=migrate(JSON.parse(localStorage.getItem(KEY+'.bak')));saveNow()}catch(_){}}
  S.anos.forEach(an=>{try{ajustarOrgCalendario(an)}catch(_){}});
  await pedirLogin();
  if(S.cfg.pinHash)await pedirPin();
  go('inicio');setTimeout(()=>{try{const P=verificarIntegridade(false);const e=P.filter(p=>p.g==='erro').length;if(e)toast('Verificação dos dados: '+e+' erro(s) encontrado(s) — veja Definições › Ferramentas','erro')}catch(_){}},1500);posArranque();iniciarLembretes()})();
