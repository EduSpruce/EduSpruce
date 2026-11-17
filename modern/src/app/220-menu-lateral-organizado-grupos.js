/* ===================== v1.020 · Menu lateral organizado por grupos, com ícones próprios e personalizável (Definições › Menu Lateral) + O Meu Calendário ===================== */
try{Object.assign(ICONS,{
  mgEscola:'<path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M10 21v-5h4v5"/><path d="M12 5V2l3 1-3 1"/>',
  mgAgenda:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v3M16 3v3M4 9h16"/><path d="m9 15 2 2 4-4"/>',
  mgSpark:'<path d="M11 2l1.8 5.4L18 9l-5.2 1.6L11 16l-1.8-5.4L4 9l5.2-1.6z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/>',
  mgConsulta:'<path d="M4 4h3v16H4zM9 4h3v16H9z"/><path d="m14.5 5 2.9-.8 3.6 15-2.9.8z"/><path d="M3 21h18"/>',
  mgConfig:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  mgPasta:'<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  mgEstrela:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  mgCoracao:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  mgRaio:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  mgFoguete:'<path d="M5 15c-1 1-1.5 4-1.5 4.5 .5 0 3.5-.5 4.5-1.5"/><path d="M9 15 6 12c1-4 4-8 12-9-1 8-5 11-9 12z"/><circle cx="14.5" cy="9.5" r="1.5"/>',
  mgPaleta:'<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5h2A4.5 4.5 0 0 0 21 11c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
  mgGlobo:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>',
  mvInicio:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  mvAnoTurmas:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><circle cx="9" cy="15" r="1.6"/><circle cx="15" cy="15" r="1.6"/>',
  mvCalEsc:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="m12 12.3 1.1 2.1 2.3.4-1.7 1.6.4 2.3-2.1-1.1-2.1 1.1.4-2.3-1.7-1.6 2.3-.4z"/>',
  mvMeuCal:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><rect x="7" y="13" width="4" height="4" rx="1"/>',
  mvTurmas:'<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6M18 20a6 6 0 0 0-3-5.2"/>',
  mvDT:'<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
  mvTarefas:'<path d="m4 6 1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17"/><path d="M11 6h9M11 12h9M11 18h9"/>',
  mvReun:'<circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="7" r="2.5"/><path d="M3 21v-3a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v3"/><path d="M12 10v4"/>',
  mvArena:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 21h8M10 17h4"/>',
  mvPulso:'<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  mvForms:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  mvJornal:'<path d="M4 5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v10a2 2 0 0 1-2 2"/><path d="M7 9h7M7 13h7M7 17h4"/>',
  mvProfij:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/><path d="M22 9v6"/>',
  mvBib:'<path d="M2 5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
  mvDocs:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  mvCont:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16a3 3 0 0 1 6 0M14 10h4M14 14h4"/>',
  mvEscola:'<path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 10h1M14 10h1M9 14h1M14 14h1"/>',
  mvProf:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-2a5 5 0 0 1 5-5h2"/><rect x="13" y="11" width="8" height="6" rx="1"/><path d="M17 17v4M15 21h4"/>',
  mvDef:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  mvAjuda:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/>',
  mvBloq:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/>',
  mvDesbloq:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/><path d="M12 14v3"/>',
  mvMover:'<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>'
})}catch(_){}
const MN_NOME={inicio:'Início',turmas:'Ano Letivo e Turmas',calendario:'Calendário Escolar',meuhorario:'O Meu Horário','@turmas':'Turmas',direcao:'Direção de Turma',tarefas:'Minhas Tarefas',meucal:'O Meu Calendário',reunioes:'Reuniões',arena:'Spruce It',pulso:'Pulso',forms:'Formulários',jornal:'Jornal Escolar',snjornal:'JornalNote',cprofij:'Coord. PROFIJ',sprucenote:'SpruceNote',recursos:'Biblioteca',documentos:'Documentos',contactos:'Contactos',escola:'Escola','@prof':'Professor',definicoes:'Definições',ajuda:'Ajuda','@bloq':'Bloquear Dados','@sep':'Separador','@ofsel':'Filtro Todas / Regular / PROFIJ'};
const MN_IC={'@prof':'mvProf',meucal:'mvMeuCal'};
const MN_ESC_IC=['mgEscola','mgAgenda','mgSpark','mgConsulta','mgConfig','mgPasta','mgEstrela','mgCoracao','mgRaio','mgFoguete','mgPaleta','mgGlobo','mvInicio','mvAnoTurmas','mvCalEsc','mvMeuCal','nvhoras','mvTurmas','mvDT','mvTarefas','mvReun','mvArena','mvPulso','mvForms','mvJornal','nvjn','mvProfij','nvsn','mvBib','mvDocs','mvCont','mvEscola','mvProf','mvDef','mvAjuda','mvBloq','book','chart','target','shield','mail','grid','clipboard','layers','sparkle','users','school','calendar','file','pen','award','flag'];
/* menu original (como era até à 1.019): é o ponto de partida do editor */
const MENU_ORIG=()=>[{id:'s-geral',t:'sec',nome:'Geral',f:['inicio','turmas','meuhorario','calendario','tarefas','reunioes','direcao','recursos','documentos','contactos','arena','pulso','forms','jornal','snjornal','cprofij','sprucenote','@ofsel'].map(v=>({v}))},
  {v:'@turmas'},{id:'s-config',t:'sec',nome:'Configuração',f:[{v:'escola'},{v:'definicoes'},{v:'ajuda'}]},{v:'@bloq'}];
let _navIc0=null;const navIc0=()=>_navIc0||(_navIc0=Object.assign({},typeof NAV_IC==='object'?NAV_IC:{}));
const mnFolhas=M=>M.flatMap(n=>[n.v,...(n.f||[]).map(x=>x.v)]).filter(Boolean);
function mnEl(v){if(v==='@turmas')return $('#mnTurmas');if(v==='@prof')return $('#mnProf');if(v==='@bloq')return $('#bloqNav');if(v==='@ofsel')return $('#ofsel');return document.querySelector(`#side .nav[data-v="${v}"]:not(.tnav)`)}
const mnAlvo=v=>v==='@turmas'?$('#navTurmas'):mnEl(v);
function mnCatalogo(){const L=[...document.querySelectorAll('#side .nav[data-v]:not(.tnav)')].map(b=>b.dataset.v);['@turmas','@prof','@bloq','@ofsel'].forEach(v=>L.push(v));return [...new Set(L)]}
function mnGuardados(){return S.cfg.menus=Array.isArray(S.cfg.menus)?S.cfg.menus:[]}
function mnDaEscola(){let e;try{e=escAtiva()}catch(_){e='principal'}return mnGuardados().find(m=>(m.escolas||[]).includes(e))||null}
function menuCfg(){const c=S.cfg||{};const G=mnDaEscola();const src=G?G.M:c.menuL;let M;try{M=src?JSON.parse(JSON.stringify(src)):MENU_ORIG()}catch(_){M=MENU_ORIG()}
  const vis=new Set(src?(c.menuVistos||[]):[...mnFolhas(MENU_ORIG()),'@prof','meucal']);const usa=new Set(mnFolhas(M));
  mnCatalogo().forEach(v=>{if(vis.has(v)||usa.has(v))return;if(!src&&M[0].f){const i=M[0].f.findIndex(x=>x.v==='@ofsel');M[0].f.splice(i<0?M[0].f.length:i,0,{v})}else{const i=M.findIndex(n=>n.v==='@sep');M.splice(i<0?M.length:i,0,{v})}});
  return M}
function menuGuardar(M){const G=mnDaEscola();if(G)G.M=M;else S.cfg.menuL=M;S.cfg.menuVistos=[...new Set([...(S.cfg.menuVistos||[]),...mnCatalogo()])];save();menuRender()}
function mnMarca(el){if(!el||el._mn0)return;const l=el.querySelector(':scope>.lbl');const sv=el.querySelector('svg');el._mn0={l:l?l.textContent:'',t:el.title,sv:sv?sv.outerHTML:'',sub:el.classList.contains('navsub')}}
const mnNome=n=>{if(n.nome&&n.nome.trim())return n.nome.trim();if(!n.v)return n.nome||'';const e=mnAlvo(n.v);const l=e&&e.querySelector(':scope>.lbl');const t=l&&!e.dataset.mnL?(l.innerText||l.textContent||'').trim():'';return t||(e&&e._mn0&&e._mn0.l)||MN_NOME[n.v]||n.v};
const mnExiste=n=>!n.v||n.v==='@sep'||!!mnEl(n.v);
const mnVisivel=el=>!!el&&!el.hidden&&el.style.display!=='none'&&getComputedStyle(el).display!=='none';
function mnPrep(){const sd=$('#side');if(!sd)return null;
  let box=$('#mnav');if(!box){box=document.createElement('div');box.id='mnav';sd.insertBefore(box,sd.querySelector(':scope>.sp'))}
  let off=$('#mnavOff');if(!off){off=document.createElement('div');off.id='mnavOff';off.hidden=true;sd.appendChild(off)}
  sd.querySelectorAll(':scope>.grp:not(#grpT)').forEach(g=>g.classList.add('mn-old'));
  if(!$('#mnTurmas')){const w=document.createElement('div');w.id='mnTurmas';w.className='mnturmas';const ref=$('#grpT')||$('#navTurmas');if(ref)ref.before(w);['#grpT','#navTurmas','#tTree','#tnavHold'].forEach(s=>{const e=$(s);if(e)w.appendChild(e)})}
  const mk=(id,html,f)=>{if($('#'+id))return;const t=document.createElement('template');t.innerHTML=html;const b=t.content.firstElementChild;b.onclick=f;off.appendChild(b)};
  if(!document.querySelector('#side .nav[data-v="meucal"]'))mk('mnMeuCal','<button class="nav" id="mnMeuCal" data-v="meucal" title="O Meu Calendário"><svg class="ic" width="18" height="18"></svg><span class="lbl">O Meu Calendário</span></button>',()=>go('meucal'));
  mk('mnProf','<button class="nav" id="mnProf" type="button" title="Professor"><svg class="ic" width="18" height="18"></svg><span class="lbl">Professor</span></button>',()=>{UI.defTab='prof';go('definicoes')});
  const df=document.querySelector('#side .nav[data-v="definicoes"]');if(df&&!df._mn){df._mn=1;df.addEventListener('click',()=>{if(UI.defTab==='prof'){UI.defTab='geral';if(VIEW==='definicoes')vDefinicoes()}},true)}
  return {sd,box,off}}
function mnIcone(el,k){if(!el)return;const sv=el.querySelector('svg');if(!sv||sv.dataset.mn===k)return;const sz=Math.round((+sv.getAttribute('width')||19)/1.2);const t=document.createElement('template');t.innerHTML=ic(k,sz).trim();const n=t.content.firstElementChild;if(n){n.dataset.mn=k;sv.replaceWith(n);el.dataset.icu=k}}
function mnIconeOrig(el,v){if(!el)return;const sv=el.querySelector('svg');if(!sv||!sv.dataset.mn)return;if(v&&v[0]!=='@'){const o=navIc0();if(o[v])NAV_IC[v]=o[v];else delete NAV_IC[v]}delete el.dataset.icu;if(el._mn0&&el._mn0.sv){const t=document.createElement('template');t.innerHTML=el._mn0.sv;sv.replaceWith(t.content.firstElementChild)}}
let _mnObs=null,_mnPend=false;
function menuRender(){try{navIc0()}catch(_){return}const P=mnPrep();if(!P)return;const {sd,box,off}=P;const M=menuCfg();const fech=S.cfg.menuFech||{};const usados=new Set();const L=[];
  const reuse=(sel,html)=>{let e=box.querySelector(':scope>'+sel)||off.querySelector(':scope>'+sel);if(!e){const t=document.createElement('template');t.innerHTML=html;e=t.content.firstElementChild}return e};
  const folha=(n,sub)=>{const el=mnEl(n.v);if(!el)return null;usados.add(el);if(n.v==='@ofsel')return el;const a=mnAlvo(n.v);mnMarca(a);
    const l=a.querySelector(':scope>.lbl');const cust=n.nome&&n.nome.trim()&&!(n.v==='@bloq'&&bloqOn());
    if(cust){if(l&&l.textContent!==n.nome.trim())l.textContent=n.nome.trim();a.dataset.mnL='1'}else if(a.dataset.mnL){if(l&&n.v!=='@bloq')l.textContent=a._mn0.l;if(n.v!=='@bloq')a.title=a._mn0.t;delete a.dataset.mnL}
    const k=n.ic||MN_IC[n.v];if(k){if(n.v[0]!=='@')NAV_IC[n.v]=k;mnIcone(a,k)}else mnIconeOrig(a,n.v);
    if(n.v!=='@turmas'){const s=sub?true:!!(el._mn0&&el._mn0.sub);el.classList.toggle('navsub',s);el.classList.toggle('mn-sub',!!sub)}
    return el};
  const bloqFundo=M.length&&M[M.length-1].v==='@bloq';let si=0;
  M.forEach((n,ix)=>{
    if(n.v==='@sep'){L.push(reuse(`.mnsep[data-k="${si}"]`,`<div class="mnsep" role="separator" data-k="${si}"></div>`));si++;return}
    if(n.v==='@bloq'&&bloqFundo&&ix===M.length-1){const b=folha(n,false);const ss=sd.querySelector(':scope>.sessao');if(b&&ss&&b.nextElementSibling!==ss)ss.before(b);return}
    if(!n.v){const id=n.id||(n.id='g'+uid());
      if(n.t==='sec'){const h=reuse(`.mnsec[data-g="${id}"]`,`<div class="grp mnsec" data-g="${id}"></div>`);const nm=(n.nome||'').trim();if(h.textContent!==nm)h.textContent=nm;const F=(n.f||[]).map(x=>folha(x,false)).filter(Boolean);h.style.display=nm&&F.some(mnVisivel)?'':'none';L.push(h,...F);return}
      const h=reuse(`.mgh[data-g="${id}"]`,`<button type="button" class="nav mgh" data-g="${id}"><svg class="ic" width="18" height="18"></svg><span class="lbl"></span><span class="chev"></span></button>`);
      const c=reuse(`.msub[data-g="${id}"]`,`<div class="msub" data-g="${id}"></div>`);h.onclick=()=>{S.cfg.menuFech=S.cfg.menuFech||{};S.cfg.menuFech[id]=!S.cfg.menuFech[id];save();menuRender()};
      const lb=h.querySelector('.lbl');if(lb.textContent!==mnNome(n))lb.textContent=mnNome(n);h.title=mnNome(n);mnIcone(h,n.ic||'mgPasta');const ch=h.querySelector('.chev');if(ch&&!ch.firstChild)ch.innerHTML=ic('chev',13);
      const F=(n.f||[]).map(x=>folha(x,true)).filter(Boolean);mnOrdem(c,F);const ab=!fech[id];h.setAttribute('aria-expanded',String(ab));h.classList.toggle('aberto',ab);c.classList.toggle('fech',!ab);
      h.style.display=F.some(mnVisivel)?'':'none';h.classList.toggle('tem-on',!ab&&F.some(e=>e.classList.contains('on')));L.push(h,c);return}
    const el=folha(n,false);if(el)L.push(el);
    if(n.f&&n.f.length){const c=reuse(`.msub[data-p="${n.v}"]`,`<div class="msub msubv" data-p="${n.v}"></div>`);mnOrdem(c,n.f.map(x=>folha(x,true)).filter(Boolean));L.push(c)}});
  mnOrdem(box,L);
  [...box.querySelectorAll('.nav[data-v],#mnProf,#bloqNav,#ofsel')].forEach(e=>{if(!usados.has(e)&&!e.classList.contains('tnav')&&!e.closest('#mnTurmas'))off.appendChild(e)});
  sd.querySelectorAll(':scope>.nav[data-v]:not(.tnav),:scope>#ofsel,:scope>#mnProf').forEach(e=>{if(!usados.has(e))off.appendChild(e)});
  const bq=$('#bloqNav');if(bq&&!usados.has(bq))off.appendChild(bq);
  const pf=$('#mnProf'),df=document.querySelector('#side .nav[data-v="definicoes"]');if(pf){const on=VIEW==='definicoes'&&UI.defTab==='prof';pf.classList.toggle('on',on);if(df&&on)df.classList.remove('on')}
  if(_mnObs)_mnObs.takeRecords()}
function mnOrdem(par,L){L.forEach((e,i)=>{if(par.children[i]!==e)par.insertBefore(e,par.children[i]||null)});[...par.children].slice(L.length).forEach(e=>$('#mnavOff').appendChild(e))}
function menuAgendar(){if(_mnPend)return;_mnPend=true;requestAnimationFrame(()=>{_mnPend=false;try{menuRender()}catch(e){console.warn(e)}})}
{const _gMn=go;go=function(v){if(go._f&&!go._f.meucal)go._f.meucal=vMeuCal;else if(v==='meucal'&&!go._f){_gMn.call(this,'inicio');go._f.meucal=vMeuCal}const r=_gMn.apply(this,arguments);try{if(go._f&&!go._f.meucal)go._f.meucal=vMeuCal;menuRender()}catch(e){console.warn(e)}return r}}
{const _buMn=bloqUI;bloqUI=function(){const r=_buMn.apply(this,arguments);try{menuAgendar()}catch(_){}return r}}
TITLES.meucal='O meu calendário';
try{_mnObs=new MutationObserver(menuAgendar);_mnObs.observe(document.getElementById('side'),{childList:true,subtree:true,attributes:true,attributeFilter:['style','hidden']})}catch(_){}
setTimeout(menuAgendar,50);setTimeout(menuAgendar,900);setTimeout(menuAgendar,2500);

