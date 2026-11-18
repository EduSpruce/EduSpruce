/* =====================================================================
   ESTADO
   ===================================================================== */
const KEY='edugest.v2';
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function anoAuto(){const d=new Date(),y=d.getFullYear(),m=d.getMonth()+1;return m>=9?y+'/'+(y+1):(y-1)+'/'+y}
function vazio(){return {cfg:{escola:'',professor:'',email:'',grupo:'',disciplinas:[],extra:[],tipos:TIPOS_INST.slice(),sinteses:Object.assign({},SINTESE_DEF)},anos:[],anoAtivo:null,turmaAtiva:null}}
function migrate(s){
  const v=vazio();s.cfg=Object.assign(v.cfg,s.cfg||{});s.anos=s.anos||[];
  // disciplinas antigas (só o nome) → uma por ciclo (os ciclos das turmas existentes, ou todos)
  s.cfg.disciplinas=[...new Set((s.cfg.disciplinas||[]).flatMap(n=>{if(String(n).includes('|'))return [n];const d=DISCIPLINAS.find(x=>x.n===n);if(!d)return [n];
    const usados=[...new Set(s.anos.flatMap(a=>(a.turmas||[]).filter(t=>t.disciplina===n).map(t=>t.ofertaDe==='profij'||t.oferta==='profij'?'profij':t.ciclo)).filter(c=>d.c.includes(c)))];
    return (usados.length?usados:d.c).map(c=>n+'|'+c)}))];
  s.anos.forEach(a=>{prepAno(a);a.org=a.org||'periodo';a.horarios=a.horarios||{};a.turmas=a.turmas||[];a.turmas.forEach(t=>{t.alunos=t.alunos||[];t.instrumentos=t.instrumentos||[];t.dominios=t.dominios||[];t.mencoes=t.mencoes||MENCOES_DEF.map(m=>({...m}));t.regra=t.regra||{2:'media',3:'media'};t.oferta=t.oferta==='profij'||t.oferta==='profissional'?t.oferta:'regular';t.alunos.forEach(x=>{if(x.frequenta===undefined)x.frequenta=true;if(x._genManual){x.generoManual=true;delete x._genManual}})})});
  return s;
}
const CTX_ESC=['calendario','horarios','horProf','naoLetivos','reunioes','datasAval','intercalar','org'];
const CTX_HERDA=['calendario','org'];
let ERRO_CARGA=false;
let S=(()=>{if(window.__ES_OFF){try{return migrate(JSON.parse(JSON.stringify(window.__ES_OFF.estado)))}catch(e){console.error(e)}}try{const v=localStorage.getItem(KEY);if(v)return migrate(JSON.parse(v))}catch(e){console.error("EduSpruce: erro ao ler os dados",e);ERRO_CARGA=true}return vazio()})();
let saveT,_savePend=false;function save(){if(window.__ES_OFF)return;clearTimeout(saveT);_savePend=true;estadoGuardar('pend');saveT=setTimeout(saveNow,150)}
/* guardar: localStorage + IndexedDB (cópia principal para turmas grandes), histórico para Anular e cópia de recuperação diária */
const HIST=[];let _ultimoJ=null,_semHist=false;
function saveNow(){clearTimeout(saveT);_savePend=false;if(window.__ES_OFF){try{estadoGuardar('ok')}catch(_){}return}let j;try{arrumarFotos();S._ts=Date.now();j=JSON.stringify(S)}catch(e){return}
  if(_ultimoJ!=null&&!_semHist){const a=_ultimoJ.replace(/"_ts":\d+,?/,''),b=j.replace(/"_ts":\d+,?/,'');if(a!==b){const _n=Date.now();S._mod=_n;j=/"_mod":\d+/.test(j)?j.replace(/"_mod":\d+/,'"_mod":'+_n):j.replace(/"_ts":/,'"_mod":'+_n+',"_ts":');HIST.push(_ultimoJ);if(HIST.length>40)HIST.shift();/* dados muito grandes: menos cópias para Anular (no máximo ~80 MB em memória) */{let tot=0;for(let i=HIST.length-1;i>=0;i--){tot+=HIST[i].length;if(tot>8e7&&i<HIST.length-1){HIST.splice(0,i+1);break}}}atualizarAnular()}}
  _ultimoJ=j;_semHist=false;idbEstado(j);
  try{localStorage.setItem(KEY,j);const hj=isoData(new Date());if(localStorage.getItem(KEY+'.bakd')!==hj){localStorage.setItem(KEY+'.bak',j);localStorage.setItem(KEY+'.bakd',hj)}
    if(j.length>4.2e6&&!saveNow.av){saveNow.av=1;toast('Atenção: o espaço do browser está quase cheio — os dados continuam guardados no IndexedDB; exporte uma cópia de segurança','aviso')}}
  catch(e){try{localStorage.removeItem(KEY+'.bak')}catch(_){}if(!IDB){alert('Não foi possível guardar (espaço cheio?). Exporte uma cópia de segurança em Definições.\n\n'+e.message);estadoGuardar('erro');return}}
  estadoGuardar('ok')}
/* o indicador só é reescrito quando muda (é pedido várias vezes por minuto: reescrevê-lo igual acordava a página inteira) */
function estadoPor(el,cls,html,tit){const ch=cls+'\u0001'+html;if(el._est!==ch||el.className!==cls){el._est=ch;el.className=cls;el.innerHTML=html}if(el.title!==tit)el.title=tit}
function estadoGuardar(k,tit){const el=document.getElementById('saveSt');if(!el)return;estadoPor(el,'savest '+k,k==='pend'?'<span class="sp"></span>A guardar…':k==='erro'?ic('alert',13)+' Erro ao guardar':ic('check',13)+' Guardado',tit!=null?tit:k==='ok'?'Tudo guardado neste dispositivo':'')}
function atualizarAnular(){const b=document.getElementById('undoBtn');if(b)b.disabled=!HIST.length}
function desfazer(){if(!HIST.length)return toast('Nada para anular');const j=HIST.pop();try{S=migrate(JSON.parse(j))}catch(e){return}_ultimoJ=j;_semHist=true;saveNow();_ultimoJ=JSON.stringify(S);atualizarAnular();go(VIEW);toast('Última alteração anulada','ok')}
function idbEstado(j){if(!IDB)return;try{IDB.transaction('estado','readwrite').objectStore('estado').put(j,'S')}catch(e){}}
function idbLerEstado(){return new Promise(ok=>{if(!IDB)return ok(null);try{const r=IDB.transaction('estado').objectStore('estado').get('S');r.onsuccess=()=>ok(r.result||null);r.onerror=()=>ok(null)}catch(e){ok(null)}})}
/* ---------- fotos: guardadas à parte (IndexedDB), partilhadas entre turmas ---------- */
const FOTOS={};let IDB=null;if(window.__ES_OFF)Object.assign(FOTOS,window.__ES_OFF.fotos||{});
function idbAbrir(){if(window.__ES_OFF)return Promise.resolve(null);return new Promise(ok=>{setTimeout(()=>ok(null),2500);try{const r=indexedDB.open('edugest',2);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('fotos'))db.createObjectStore('fotos');if(!db.objectStoreNames.contains('estado'))db.createObjectStore('estado')};r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null);r.onblocked=()=>ok(null)}catch(e){ok(null)}})}
function idbTodas(db){return new Promise(ok=>{try{const out={};const c=db.transaction('fotos').objectStore('fotos').openCursor();c.onsuccess=()=>{const cur=c.result;if(cur){out[cur.key]=cur.value;cur.continue()}else ok(out)};c.onerror=()=>ok(out)}catch(e){ok({})}})}
function idbPor(id,v){if(!IDB)return;try{IDB.transaction('fotos','readwrite').objectStore('fotos').put(v,id)}catch(e){}}
function hashStr(s){let h1=0x811c9dc5,h2=0;for(let i=0;i<s.length;i+=7){h1^=s.charCodeAt(i);h1=Math.imul(h1,16777619);h2=(h2*31+s.charCodeAt(i))|0}return (h1>>>0).toString(36)+(h2>>>0).toString(36)+s.length.toString(36)}
/* troca fotos em data: URL por referências f:<id> guardadas no IndexedDB */
function arrumarFotos(){if(!IDB)return;S.anos.forEach(an=>an.turmas.forEach(t=>t.alunos.forEach(a=>{if(a.foto&&a.foto.startsWith('data:')){const id=hashStr(a.foto);if(!FOTOS[id]){FOTOS[id]=a.foto;idbPor(id,a.foto)}a.foto='f:'+id}})))}
const fotoSrc=a=>!a||!a.foto?'':a.foto.startsWith('f:')?(FOTOS[a.foto.slice(2)]||''):a.foto;

/* ---------- contexto de escola: dados do ano letivo que pertencem a cada escola ---------- */


function escAtiva(){let st;try{st=S}catch(_){return 'principal'}const id=(st&&st.escolaAtiva)||'principal';return id==='principal'||((st.escolas||[]).some(e=>e.id===id))?id:'principal'}
function prepAno(a){if(!a||a._prep)return a;const pe=a.porEscola=a.porEscola||{};pe.principal=pe.principal||{};
  CTX_ESC.forEach(k=>{const d=Object.getOwnPropertyDescriptor(a,k);if(d&&'value' in d){if(pe.principal[k]===undefined)pe.principal[k]=d.value;delete a[k]}
    Object.defineProperty(a,k,{enumerable:false,configurable:true,get(){const e=escAtiva();const o=pe[e]&&pe[e][k];if(o!==undefined)return o;if(CTX_HERDA.includes(k)&&e!=='principal'&&pe.principal[k]!==undefined){/* cada escola tem o seu calendário e organização: parte de uma cópia da principal, independente */const q=pe[e]=pe[e]||{};q[k]=JSON.parse(JSON.stringify(pe.principal[k]));if(k==='calendario')q.calCopia=1;return q[k]}return undefined},
      set(v){const e=escAtiva();const q=pe[e]=pe[e]||{};q[k]=v;if(k==='calendario')delete q.calCopia}})});
  Object.defineProperty(a,'_prep',{value:true,enumerable:false});return a}
const proprioEsc=(a,k)=>{const e=escAtiva();return !!(a.porEscola&&a.porEscola[e]&&a.porEscola[e][k]!==undefined)};
const A=()=>prepAno(S.anos.find(a=>a.id===S.anoAtivo)||null)||null;
const T=()=>{const a=A();return a?(a.turmas.find(t=>t.id===S.turmaAtiva)||null):null};
const discKey=(n,c)=>n+'|'+c;const discNome=k=>String(k).split('|')[0];const discCic=k=>String(k).split('|')[1]||'';
const discRotulo=k=>{const c=discCic(k);return discNome(k)+(c?' — '+(CICLOS[c]||c):'')};
/* chaves "Disciplina|ciclo" (cada ciclo é uma disciplina diferente) */
const minhasDiscK=()=>{const D=discAno(),X=discExtraAno();return [...D,...X.filter(x=>!D.some(k=>discNome(k)===x))]};
const minhasDisc=()=>[...new Set(minhasDiscK().map(discNome))];

