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
const MN_NOME={inicio:'Início',turmas:'Ano Letivo e Turmas',calendario:'Calendário Escolar',meuhorario:'O Meu Horário','@turmas':'Turmas',direcao:'Direção de Turma',tarefas:'Minhas Tarefas',meucal:'O Meu Calendário',reunioes:'Reuniões',arena:'Arena',pulso:'Pulso',forms:'Forms',jornal:'Jornal Escolar',snjornal:'JornalNote',cprofij:'Coord. PROFIJ',sprucenote:'SpruceNote',recursos:'Biblioteca',documentos:'Documentos',contactos:'Contactos',escola:'Escola','@prof':'Professor',definicoes:'Definições',ajuda:'Ajuda','@bloq':'Bloquear Dados','@sep':'Separador','@ofsel':'Filtro Todas / Regular / PROFIJ'};
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

/* ---------- O Meu Calendário: reuniões, tarefas, testes e o calendário escolar num só mês ---------- */
function mcEventos(a){const E={};const add=(iso,o)=>{if(iso)(E[iso]=E[iso]||[]).push(o)};
  try{if(a)todasReunioes(a).forEach(r=>{if(r.estado==='cancelada')return;add(r.data,{k:'reun',t:(r.ini!=null?fmtHM(r.ini)+' ':'')+reunTitulo(r,a),f:()=>go('reunioes')})})}catch(_){}
  try{tarefas().forEach(x=>{if(x.prazo)add(x.prazo,{k:'tar',t:x.t,feito:!!x.feito,f:()=>go('tarefas')})})}catch(_){}
  try{if(a)turmasFiltradas(a).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(i.data&&ehTeste(i))add(i.data,{k:'tes',t:(i.nome||'Teste')+' · '+t.nome,f:()=>{S.turmaAtiva=t.id;save();go('testes')}})}))}catch(_){}
  return E}
function vMeuCal(){const a=A();const hj=isoData(new Date());const m=UI.mcMes||hj.slice(0,7);const dia=UI.mcDia||hj;const [Y,Mo]=m.split('-').map(Number);
  const d1=new Date(Y,Mo-1,1),off=(d1.getDay()+6)%7,nd=new Date(Y,Mo,0).getDate();const E=mcEventos(a);
  const MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const cls=iso=>{const t=tipoDia(iso)||'';return /^feriado/.test(t)?'mc-dfer':t==='interrupcao'?'mc-dint':''};
  let cel='';for(let i=0;i<off;i++)cel+='<div class="mc-d mc-x"></div>';
  for(let d=1;d<=nd;d++){const iso=`${Y}-${String(Mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const ev=E[iso]||[];const fds=[0,6].includes(new Date(Y,Mo-1,d).getDay());
    cel+=`<button type="button" class="mc-d ${cls(iso)} ${fds?'mc-fds':''} ${iso===hj?'mc-hj':''} ${iso===dia?'mc-sel':''}" data-mcd="${iso}"><span class="mc-n">${d}</span>${ev.slice(0,3).map(e=>`<span class="mc-e mc-${e.k} ${e.feito?'mc-feito':''}">${esc(e.t)}</span>`).join('')}${ev.length>3?`<span class="mc-mais">+${ev.length-3}</span>`:''}</button>`}
  const ev=E[dia]||[];const tp=tipoDia(dia);const nota=(((a||{}).calendario||{}).notas||{})[dia]||'';
  const nomeK={reun:'Reunião',tar:'Tarefa',tes:'Teste'};
  $('#view').innerHTML=`<div class="mcw"><div class="card"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><button class="btn sm ico" id="mc-ant" aria-label="Mês anterior" title="Mês anterior">${ic('back',15)}</button><h2 style="margin:0;min-width:170px;text-align:center">${MES[Mo-1]} ${Y}</h2><button class="btn sm ico" id="mc-seg" aria-label="Mês seguinte" title="Mês seguinte" style="transform:scaleX(-1)">${ic('back',15)}</button><button class="btn sm" id="mc-hoje">Hoje</button><span class="sp1"></span><span class="mc-leg"><i class="mc-reun"></i>Reuniões <i class="mc-tar"></i>Tarefas <i class="mc-tes"></i>Testes <i class="mc-fer"></i>Feriados <i class="mc-int"></i>Interrupções</span></div>
    <div class="mc-g mc-h">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(x=>`<div>${x}</div>`).join('')}</div><div class="mc-g">${cel}</div></div>
    <div class="card"><h2 style="margin:0 0 8px">${ic('mvMeuCal',18)} ${esc(fmtIsoL(dia))}</h2>${tp&&!LETIVOS.includes(tp)?`<p class="mut" style="margin:0 0 8px">${/^feriado/.test(tp)?'Feriado':tp==='interrupcao'?'Interrupção letiva':'Sem aulas'}${nota?' · '+esc(nota):''}</p>`:''}
    ${ev.length?`<ul class="mc-lst">${ev.map((e,i)=>`<li><button type="button" class="mc-it" data-mci="${i}"><i class="mc-${e.k}"></i><span class="${e.feito?'mc-feito':''}">${esc(e.t)}</span><small class="mut">${nomeK[e.k]}</small></button></li>`).join('')}</ul>`:'<p class="mut">Nada marcado para este dia.</p>'}
    <div class="row" style="gap:8px;margin-top:10px"><input id="mc-nt" placeholder="Nova tarefa para este dia" style="flex:1"><button class="btn pri" id="mc-add">${ic('plus',15)} Tarefa</button></div></div></div>`;
  const mes=k=>{const d=new Date(Y,Mo-1+k,1);UI.mcMes=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;vMeuCal()};
  $('#mc-ant').onclick=()=>mes(-1);$('#mc-seg').onclick=()=>mes(1);$('#mc-hoje').onclick=()=>{UI.mcMes=hj.slice(0,7);UI.mcDia=hj;vMeuCal()};
  $$('[data-mcd]').forEach(b=>b.onclick=()=>{UI.mcDia=b.dataset.mcd;vMeuCal()});
  $$('[data-mci]').forEach(b=>b.onclick=()=>ev[+b.dataset.mci].f());
  const add=()=>{const t=$('#mc-nt').value.trim();if(!t)return;tarefas().push({id:uid(),t,prazo:dia,feito:false,criada:Date.now()});save();try{tarBadge()}catch(_){}toast('Tarefa criada');vMeuCal()};
  $('#mc-add').onclick=add;$('#mc-nt').onkeydown=e=>{if(e.key==='Enter')add()}}

/* ---------- Definições › Menu Lateral: reordenar, mudar nome e ícone, criar menus e secções ---------- */
const mnGet=(M,p)=>p.length===1?M[p[0]]:M[p[0]].f[p[1]];
const mnLista=(M,p)=>p.length===1?M:(M[p[0]].f=M[p[0]].f||[]);
const mnPodeTer=n=>!!n&&n.v!=='@sep'&&n.v!=='@turmas'&&n.v!=='@bloq'&&n.v!=='@ofsel';
const mnPodeIr=n=>!!n&&!!n.v&&n.v!=='@sep'&&n.v!=='@turmas'&&!(n.f&&n.f.length);
function mnTirar(M,p){return mnLista(M,p).splice(p[p.length-1],1)[0]}
function mnIcHTML(n){if(n.ic)return ic(n.ic,18);if(MN_IC[n.v])return ic(MN_IC[n.v],18);const e=n.v?mnAlvo(n.v):null;const sv=e&&e.querySelector('svg');if(sv){const c=sv.cloneNode(true);c.setAttribute('width','22');c.setAttribute('height','22');return c.outerHTML}return ic('mgPasta',18)}
function defMenu(){const M=menuCfg();const usa=new Set(mnFolhas(M));const disp=mnCatalogo().filter(v=>!usa.has(v));
  const linha=(n,p)=>{if(!mnExiste(n))return '';const sep=n.v==='@sep',grupo=!n.v,sec=grupo&&n.t==='sec',fixo=n.v==='@ofsel';const el=n.v?mnEl(n.v):null;const desl=n.v&&!sep&&n.v[0]!=='@'&&el&&!mnVisivel(el)&&!el.closest('#mnavOff');
    const tipo=sep?'Separador':sec?'Secção (título)':grupo?'Menu (abre e fecha)':n.v==='@turmas'?'Turmas e as suas secções':fixo?'Filtro':(n.f&&n.f.length?'Menu com página':(p.length>1&&M[p[0]].t!=='sec'?'Submenu':'Item'));
    const k=p.join('.'),sub=p.length>1;
    return `<li class="mnr ${grupo?'mnr-g':''} ${sec?'mnr-s':''} ${sep?'mnr-sep':''}" data-p="${k}"><div class="mnrow"><span class="mnh" data-mnh="${k}" title="Arrastar" aria-label="Arrastar">${ic('mvMover',16)}</span>
      ${sep?'<span class="mnsepv"></span>':fixo?`<span class="mnn mnfix">${esc(MN_NOME['@ofsel'])}</span>`:`${sec?'':`<button type="button" class="btn sm ico mnic" data-mnic="${k}" title="Mudar o ícone" aria-label="Mudar o ícone">${mnIcHTML(n)}</button>`}<input class="mnn" data-mnn="${k}" value="${esc(mnNome(n))}" aria-label="Nome" placeholder="${sec?'Título da secção':'Nome do menu'}">`}
      <span class="mnt">${tipo}${desl?' · <i>módulo desligado</i>':''}</span>
      <span class="mnb">${grupo?`<button type="button" class="btn sm" data-mntp="${k}" title="${sec?'Passar a menu que abre e fecha':'Passar a secção com título (sempre aberta)'}">${sec?'Tornar Menu':'Tornar Secção'}</button>`:''}<button type="button" class="btn sm ico" data-mnmv="${k}|-1" title="Subir" aria-label="Subir">${ic('chev',13).replace('<svg','<svg style="transform:rotate(-90deg)"')}</button><button type="button" class="btn sm ico" data-mnmv="${k}|1" title="Descer" aria-label="Descer">${ic('chev',13).replace('<svg','<svg style="transform:rotate(90deg)"')}</button>
      ${sub?`<button type="button" class="btn sm" data-mnout="${k}" title="Tirar e pôr no nível de cima">← Fora</button>`:(mnPodeIr(n)&&p[0]>0&&mnPodeTer(M[p[0]-1])?`<button type="button" class="btn sm" data-mnin="${k}" title="Pôr dentro do menu ou da secção de cima">Dentro →</button>`:'')}
      <button type="button" class="btn sm ico" data-mnx="${k}" title="${grupo?'Apagar (os itens ficam no menu lateral)':'Tirar do menu lateral'}" aria-label="Tirar">${ic(grupo||sep?'trash':'x',14)}</button></span></div>
      ${(grupo||(n.f&&n.f.length))?`<ul class="mnl mnsub">${(n.f||[]).map((x,j)=>linha(x,[p[0],j])).join('')}${grupo&&!(n.f||[]).length?'<li class="mnvz mut">Vazio: arraste itens para aqui ou use «Dentro →».</li>':''}</ul>`:''}</li>`};
  return `<div class="card mned"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('mgPasta',18)} Menu Lateral</h2><span class="sp1"></span><button class="btn sm" id="mn-ng">${ic('plus',14)} Novo Menu</button><button class="btn sm" id="mn-nsc">${ic('plus',14)} Nova Secção</button><button class="btn sm" id="mn-ns">${ic('plus',14)} Separador</button><button class="btn sm" id="mn-rp">${ic('refresh',14)} Repor o Original</button></div>
    <p class="hint">Arraste pela pega ${ic('mvMover',13)} para mudar a ordem, ou largue em cima de um menu ou secção para o pôr lá dentro. Toque no ícone para o mudar e no nome para o reescrever. <b>Secção</b>: título sempre aberto (como «Geral»); <b>Menu</b>: abre e fecha com um toque. As alterações aparecem logo e ficam guardadas na sua conta.</p>
    <ul class="mnl" id="mnl">${M.map((n,i)=>linha(n,[i])).join('')}</ul>
    ${disp.length?`<h3 style="margin:16px 0 6px">Fora do menu</h3><div class="mnoff">${disp.map(v=>`<button type="button" class="btn sm" data-mnadd="${v}">${esc(mnNome({v}))} ${ic('plus',12)}</button>`).join('')}</div>`:''}</div>${defMenusG()}`}
function defMenusG(){const G=mnGuardados(),at=mnDaEscola(),ES=todasEscolas();const eA=escAtiva();
  return `<div class="card mned mng"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('star',18)} Menus Guardados</h2><span class="sp1"></span><button class="btn sm pri" id="mng-novo">${ic('plus',14)} Guardar o Menu Atual</button></div>
    <p class="hint">Guarde várias versões do menu lateral e associe cada uma a escolas: ao mudar de escola no topo, o menu muda sozinho. Escolas sem menu associado usam o menu habitual. ${at?`Agora está a editar <b>«${esc(at.nome)}»</b> (associado a ${esc(nomeEscola(EC()))}).`:'Agora está a editar o <b>menu habitual</b>.'}</p>
    ${G.length?`<ul class="mngl">${G.map((m,i)=>`<li class="mngi ${m===at?'on':''}"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><input class="mnn" data-mgn="${i}" value="${esc(m.nome)}" aria-label="Nome do menu guardado">${m===at?'<span class="tag ok">em uso nesta escola</span>':''}<span class="sp1"></span>
      ${m===at?'':`<button type="button" class="btn sm" data-mgld="${i}" title="Copiar este menu para o menu que está a editar">Usar Agora</button><button type="button" class="btn sm" data-mgup="${i}" title="Substituir pelo menu que está a editar">Atualizar</button>`}<button type="button" class="btn sm ico" data-mgx="${i}" title="Apagar" aria-label="Apagar">${ic('trash',14)}</button></div>
      <div class="mnges"><span class="mut">Escolas:</span>${ES.map(e=>{const id=escId(e);const on=(m.escolas||[]).includes(id);return `<label class="chk"><input type="checkbox" data-mges="${i}|${id}" ${on?'checked':''}> ${esc(nomeEscola(e))}${id===eA?' <small class="mut">(atual)</small>':''}</label>`}).join('')}</div></li>`).join('')}</ul>`:'<p class="mut">Ainda não guardou nenhum menu.</p>'}</div>`}
function bindMenusG(){const G=mnGuardados();const re=()=>{save();menuRender();vDefinicoes()};
  const nv=$('#mng-novo');if(nv)nv.onclick=()=>{const nm=(prompt('Nome para este menu:','Menu '+(G.length+1))||'').trim();if(!nm)return;G.push({id:'m'+uid(),nome:nm,M:menuCfg(),escolas:[]});re();toast('Menu guardado')};
  $$('[data-mgn]').forEach(i=>i.onchange=()=>{const v=i.value.trim();if(v){G[+i.dataset.mgn].nome=v;save()}else i.value=G[+i.dataset.mgn].nome});
  $$('[data-mgld]').forEach(b=>b.onclick=()=>{const m=G[+b.dataset.mgld];if(!confirm('Substituir o menu que está a editar por «'+m.nome+'»?'))return;menuGuardar(JSON.parse(JSON.stringify(m.M)));vDefinicoes();toast('Menu aplicado')});
  $$('[data-mgup]').forEach(b=>b.onclick=()=>{const m=G[+b.dataset.mgup];if(!confirm('Substituir «'+m.nome+'» pelo menu que está a editar?'))return;m.M=menuCfg();save();toast('«'+m.nome+'» atualizado')});
  $$('[data-mgx]').forEach(b=>b.onclick=()=>{const m=G[+b.dataset.mgx];if(!confirm('Apagar o menu guardado «'+m.nome+'»?'+((m.escolas||[]).length?'\n\nAs escolas associadas voltam ao menu habitual.':'')))return;G.splice(+b.dataset.mgx,1);re()});
  $$('[data-mges]').forEach(c=>c.onchange=()=>{const [i,id]=c.dataset.mges.split('|');if(c.checked)G.forEach(m=>m.escolas=(m.escolas||[]).filter(x=>x!==id));const m=G[+i];m.escolas=(m.escolas||[]).filter(x=>x!==id);if(c.checked)m.escolas.push(id);re()})}
/* ao mudar de escola, o menu lateral muda para o que lhe está associado */
{let _mnK=null;setInterval(()=>{try{const G=mnDaEscola();const k=G?G.id:'';if(_mnK!==null&&k!==_mnK){menuRender();if(VIEW==='definicoes'&&UI.defTab==='menu')vDefinicoes()}_mnK=k}catch(_){}},700)}
function bindMenu(){const M=menuCfg();const P=k=>k.split('.').map(Number);const ok=()=>{menuGuardar(M);vDefinicoes()};
  const fimTopo=()=>{const i=M.findIndex(n=>n.v==='@sep'||(n.t==='sec'&&n.id==='s-config'));return i<0?(M.length&&M[M.length-1].v==='@bloq'?M.length-1:M.length):i};
  $$('[data-mnn]').forEach(i=>i.onchange=()=>{const n=mnGet(M,P(i.dataset.mnn));const v=i.value.trim();if(!n.v){if(!v&&n.t!=='sec'){i.value=mnNome(n);return}n.nome=v}else{const o=mnNome({v:n.v});if(v&&v!==o&&v!==(n.nome||''))n.nome=v;else if(!v||v===o)delete n.nome}menuGuardar(M)});
  $$('[data-mntp]').forEach(b=>b.onclick=()=>{const n=mnGet(M,P(b.dataset.mntp));if(n.t==='sec'){delete n.t;if(!n.nome)n.nome='Menu';n.ic=n.ic||'mgPasta'}else n.t='sec';ok()});
  $$('[data-mnmv]').forEach(b=>b.onclick=()=>{const [k,d]=b.dataset.mnmv.split('|');const p=P(k);const L=mnLista(M,p);const i=p[p.length-1];let j=i+ +d;while(j>=0&&j<L.length&&!mnExiste(L[j]))j+= +d;if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];ok()});
  $$('[data-mnin]').forEach(b=>b.onclick=()=>{const p=P(b.dataset.mnin);const n=mnTirar(M,p);const alvo=M[p[0]-1];(alvo.f=alvo.f||[]).push(n);ok()});
  $$('[data-mnout]').forEach(b=>b.onclick=()=>{const p=P(b.dataset.mnout);const n=mnTirar(M,p);M.splice(p[0]+1,0,n);ok()});
  $$('[data-mnx]').forEach(b=>b.onclick=()=>{const p=P(b.dataset.mnx);const n=mnGet(M,p);if(!n.v){if((n.f||[]).length&&!confirm('Apagar «'+(mnNome(n)||'secção')+'»? Os itens que tem passam para o nível de cima.'))return;mnTirar(M,p);M.splice(p[0],0,...(n.f||[]))}else mnTirar(M,p);ok()});
  $$('[data-mnadd]').forEach(b=>b.onclick=()=>{M.splice(fimTopo(),0,{v:b.dataset.mnadd});ok()});
  $('#mn-ng').onclick=()=>{const nm=(prompt('Nome do novo menu:','Novo Menu')||'').trim();if(!nm)return;M.splice(fimTopo(),0,{id:'g'+uid(),nome:nm,ic:'mgPasta',f:[]});ok()};
  $('#mn-nsc').onclick=()=>{const nm=(prompt('Título da nova secção:','Nova Secção')||'').trim();if(!nm)return;M.splice(fimTopo(),0,{id:'g'+uid(),t:'sec',nome:nm,f:[]});ok()};
  $('#mn-ns').onclick=()=>{M.splice(fimTopo(),0,{v:'@sep'});ok()};
  $('#mn-rp').onclick=()=>{if(!confirm('Repor o menu lateral original? Perde a ordem, os nomes, os ícones e os menus que criou.'))return;{const G=mnDaEscola();if(G)G.M=MENU_ORIG();else delete S.cfg.menuL}delete S.cfg.menuFech;save();menuRender();vDefinicoes();toast('Menu original reposto')};
  $$('[data-mnic]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.mnic;const old=$('.mnpick');if(old){const same=old.dataset.k===k;old.remove();if(same)return}
    b.closest('.mnrow').insertAdjacentHTML('afterend',`<div class="mnpick" data-k="${k}"><button type="button" class="btn sm" data-mnpk="">Original</button>${MN_ESC_IC.filter(x=>ICONS[x]).map(x=>`<button type="button" class="btn sm ico" data-mnpk="${x}" title="${x}">${ic(x,18)}</button>`).join('')}</div>`);
    $$('[data-mnpk]').forEach(q=>q.onclick=()=>{const n=mnGet(M,P(k));if(q.dataset.mnpk)n.ic=q.dataset.mnpk;else delete n.ic;ok()})});
  /* arrastar (rato e toque) */
  $$('[data-mnh]').forEach(h=>h.onpointerdown=e=>{e.preventDefault();const src=P(h.dataset.mnh);const li=h.closest('.mnr');const n0=mnGet(M,src);li.classList.add('mn-arr');let alvo=null,pos=null;try{h.setPointerCapture(e.pointerId)}catch(_){}
    const limpa=()=>$$('.mn-b4,.mn-af,.mn-in').forEach(x=>x.classList.remove('mn-b4','mn-af','mn-in'));
    let ult=null;const auto=setInterval(()=>{if(!ult)return;const y=ult.clientY,H=innerHeight;const d=y<90?-16:y>H-70?16:0;if(!d)return;[document.scrollingElement,$('#view'),$('#main')].forEach(x=>{try{if(x&&x.scrollHeight>x.clientHeight+2)x.scrollTop+=d}catch(_){}});mv(ult)},40);
    const mv=ev=>{ult={clientX:ev.clientX,clientY:ev.clientY};limpa();const el=document.elementFromPoint(ev.clientX,ev.clientY);const r=el&&el.closest('.mnr');alvo=null;pos=null;if(!r||r===li||li.contains(r))return;
      const rw=r.querySelector(':scope>.mnrow').getBoundingClientRect();const tp=P(r.dataset.p);const tn=mnGet(M,tp);const y=(ev.clientY-rw.top)/rw.height;
      const podeIn=tp.length===1&&mnPodeTer(tn)&&mnPodeIr(n0);if(tp.length===2&&!mnPodeIr(n0))return;
      pos=podeIn&&y>.28&&y<.72?'in':y<.5?'b4':'af';alvo=tp;r.classList.add('mn-'+pos)};
    const up=()=>{clearInterval(auto);h.onpointermove=null;h.onpointerup=h.onpointercancel=null;li.classList.remove('mn-arr');limpa();if(!alvo)return;
      const n=mnTirar(M,src);let tp=alvo.slice();if(src.length===tp.length&&(src.length===1||src[0]===tp[0])&&src[src.length-1]<tp[tp.length-1])tp[tp.length-1]--;
      if(src.length===1&&tp.length===2&&src[0]<tp[0])tp[0]--;
      if(pos==='in'){const t=mnGet(M,[tp[0]]);(t.f=t.f||[]).push(n)}else{const L=mnLista(M,tp);L.splice(tp[tp.length-1]+(pos==='af'?1:0),0,n)}
      ok()};
    h.onpointermove=mv;h.onpointerup=up;h.onpointercancel=()=>{alvo=null;up()}})}
{const _vdMn=vDefinicoes;vDefinicoes=function(){const quer=UI.defTab==='menu';if(quer)UI.defTab='aparencia';const r=_vdMn.apply(this,arguments);if(quer)UI.defTab='menu';
  try{const tb=$('#view .deftabs');if(tb&&!tb.querySelector('[data-dt2="menu"]')){const ap=tb.querySelector('[data-dt2="aparencia"]');const b=document.createElement('button');b.dataset.dt2='menu';b.innerHTML=ic('mgPasta',15)+' Menu Lateral';(ap?ap.after(b):tb.appendChild(b))}
    if(tb){tb.querySelectorAll('[data-dt2]').forEach(b=>{b.classList.toggle('on',b.dataset.dt2===UI.defTab);b.onclick=()=>{UI.defTab=b.dataset.dt2;vDefinicoes()}})}
    if(quer){const v=$('#view');const keep=tb?tb.outerHTML:'';v.innerHTML=keep+defMenu();v.querySelectorAll('[data-dt2]').forEach(b=>b.onclick=()=>{UI.defTab=b.dataset.dt2;vDefinicoes()});bindMenu();bindMenusG()}
    menuRender()}catch(e){console.warn(e)}return r}
  if(go._f)go._f.definicoes=vDefinicoes}
{const _gMn2=go;go=function(v){if(go._f&&go._f.definicoes!==vDefinicoes)go._f.definicoes=vDefinicoes;return _gMn2.apply(this,arguments)}}

/* ---------- O Meu Calendário (1.031): ao estilo do calendário do Outlook ----------
   Vistas Dia, 3 dias, Semana de trabalho, Semana, Mês, Agenda e Ano letivo; minicalendário; calendários com cores (mostrar/esconder);
   eventos com repetição e exceções, dia inteiro e vários dias, local, ligação online, lembretes, estado, privado, categorias;
   criar arrastando na grelha, mover e alterar a duração arrastando; criação rápida em linguagem natural; pesquisa; .ics; imprimir.
   Junta (só para ver) as aulas do horário, reuniões, testes e momentos de avaliação, tarefas, Provas agendadas e o calendário escolar.
   Os eventos pessoais guardam a escola (cada escola com o seu calendário; «Todas as escolas» nas definições). */
const OCAL=()=>{let c=S.cal;if(!c||typeof c!=='object')c=S.cal={};if(!Array.isArray(c.ev))c.ev=[];
  if(!Array.isArray(c.cals)||!c.cals.length)c.cals=[{id:'pessoal',nome:'Pessoal',cor:'#7c3aed',on:true},{id:'escola',nome:'Trabalho',cor:'#0e7490',on:true},{id:'familia',nome:'Família',cor:'#db2777',on:true}];
  if(!Array.isArray(c.cat))c.cat=[{id:'c1',nome:'Importante',cor:'#dc2626'},{id:'c2',nome:'Preparar',cor:'#ea580c'},{id:'c3',nome:'Pendente',cor:'#ca8a04'},{id:'c4',nome:'Concluído',cor:'#16a34a'},{id:'c5',nome:'Formação',cor:'#2563eb'},{id:'c6',nome:'Pessoal',cor:'#9333ea'}];
  c.src=Object.assign({aula:true,reun:true,tes:true,tar:true,prova:true,esc:true},c.src||{});
  c.cfg=Object.assign({vista:'mes',h0:8,h1:19,slot:30,semN:true,todas:false,lembR:15,resumo:true,carga:true},c.cfg||{});return c};
const OC_SRC=[['aula','Aulas (horário)','#0369a1'],['reun','Reuniões','#0f8b8d'],['tes','Testes e avaliações','#c0392b'],['tar','Tarefas','#2f7fd0'],['prova','Provas agendadas','#7c3aed'],['esc','Calendário escolar','#e0a030']];
const OC_EST=[['ocupado','Ocupado'],['provisorio','Provisório'],['fora','Fora do escritório'],['livre','Livre'],['outro','A trabalhar noutro local']];
const OC_MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const OC_DS=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const ocD=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d)};
const ocI=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const ocAdd=(iso,n)=>{const d=ocD(iso);d.setDate(d.getDate()+n);return ocI(d)};
const ocDif=(a,b)=>Math.round((ocD(b)-ocD(a))/86400000);
const ocHM=m=>m==null?'':String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const ocMin=s=>{const m=String(s||'').match(/^(\d{1,2}):(\d{2})/);return m?(+m[1])*60+(+m[2]):null};
const ocSegunda=iso=>{const d=ocD(iso);return ocAdd(iso,-((d.getDay()+6)%7))};
const ocSemN=iso=>{const d=ocD(iso);d.setDate(d.getDate()+3-(d.getDay()+6)%7);const w1=new Date(d.getFullYear(),0,4);return 1+Math.round(((d-w1)/86400000-3+(w1.getDay()+6)%7)/7)};
const ocCal=id=>OCAL().cals.find(c=>c.id===id)||OCAL().cals[0];
const ocCat=id=>OCAL().cat.find(c=>c.id===id);
/* repetição: a ocorrência cai neste dia? */
function ocBate(e,iso){const r=e.rep;if(!r||r.f==='nao'||!r.f)return iso===e.d0;if(iso<e.d0)return false;if(r.ate&&iso>r.ate)return false;const n=ocDif(e.d0,iso),I=Math.max(1,+r.int||1);const d=ocD(iso),s=ocD(e.d0);
  if(r.f==='dia')return n%I===0;if(r.f==='uteis')return d.getDay()>0&&d.getDay()<6;
  if(r.f==='sem'){const ds=(r.dias&&r.dias.length)?r.dias:[s.getDay()];return ds.includes(d.getDay())&&Math.floor(ocDif(ocSegunda(e.d0),ocSegunda(iso))/7)%I===0}
  const mm=(d.getFullYear()-s.getFullYear())*12+d.getMonth()-s.getMonth();
  if(r.f==='mes')return d.getDate()===s.getDate()&&mm%I===0;
  if(r.f==='mesd')return d.getDay()===s.getDay()&&Math.ceil(d.getDate()/7)===Math.ceil(s.getDate()/7)&&mm%I===0;
  if(r.f==='ano')return d.getDate()===s.getDate()&&d.getMonth()===s.getMonth()&&(d.getFullYear()-s.getFullYear())%I===0;return false}
/* ocorrências dos eventos pessoais entre A e B (inclusive) */
function ocOcorr(A,B){const C=OCAL(),esc=escAtiva(),out=[];
  C.ev.forEach(e=>{if(!C.cfg.todas&&e.esc&&e.esc!==esc)return;const cal=ocCal(e.cal);if(cal&&cal.on===false)return;const dur=ocDif(e.d0,e.d1||e.d0);
    const push=d=>{if((e.exc||[]).includes(d))return;const o=Object.assign({},e,(e.ov||{})[d]||{});out.push({k:'ev',e,occ:d,d,dE:ocAdd(d,dur),h0:o.dia?null:o.h0,h1:o.dia?null:o.h1,dia:!!o.dia,t:o.t||'(sem título)',loc:o.loc,cor:(ocCat(o.cat)||{}).cor||(cal||{}).cor||'#7c3aed',est:o.est,priv:o.priv,rep:!!(e.rep&&e.rep.f&&e.rep.f!=='nao')})};
    if(!e.rep||!e.rep.f||e.rep.f==='nao'){if(e.d0<=B&&(e.d1||e.d0)>=A)push(e.d0);return}
    let cnt=0;const fim=e.rep.ate&&e.rep.ate<B?e.rep.ate:B;for(let d=e.d0;d<=fim;d=ocAdd(d,1)){if(ocBate(e,d)){cnt++;if(+e.rep.n&&cnt>+e.rep.n)break;if(ocAdd(d,dur)>=A)push(d)}if(ocDif(e.d0,d)>2200)break}});return out}
/* tudo o que aparece no calendário entre A e B */
function ocColetar(A,B){const C=OCAL(),a=ocA(),L=ocOcorr(A,B);if(!a)return L;
  if(C.src.aula){try{turmasFiltradas(a).forEach(t=>{let X=[];try{X=listaAulas(t,a)}catch(_){}X.forEach(x=>{if(x.data<A||x.data>B)return;const falta=!!x.falta&&!x.falta.subst;const sum=!!((x.s&&x.s.texto)||'').trim();
    L.push({k:'aula',d:x.data,dE:x.data,h0:x.ini,h1:x.fim,t:t.nome+' · '+t.disciplina,loc:x.sala?'Sala '+x.sala:'',cor:corTurma(t.id)||'#0369a1',falta,semSum:x.passada&&!falta&&!sum,f:()=>{S.turmaAtiva=t.id;save();try{aulaDlg(t,x.k,'sum')}catch(_){go('painel')}}})})})}catch(e){console.warn(e)}}
  if(C.src.reun){try{todasReunioes(a).forEach(r=>{if(r.estado==='cancelada'||!r.data||r.data<A||r.data>B)return;L.push({k:'reun',d:r.data,dE:r.data,h0:r.semHora?null:(r.ini!=null?r.ini:null),h1:r.semHora?null:(r.fim||(r.ini!=null?r.ini+60:null)),dia:r.semHora||r.ini==null,t:reunTitulo(r,a),loc:r.local||r.sala||'',cor:'#0f8b8d',f:()=>go('reunioes')})})}catch(_){}}
  if(C.src.tes){try{turmasFiltradas(a).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(!i.data||i.data<A||i.data>B)return;const te=(()=>{try{return ehTeste(i)}catch(_){return true}})();L.push({k:'tes',d:i.data,dE:i.data,dia:true,t:(i.nome||'Avaliação')+' · '+t.nome,cor:te?'#c0392b':'#b45309',f:()=>{S.turmaAtiva=t.id;UI.inst=i.id;save();go('instrumentos')}})}))}catch(_){}}
  if(C.src.tar){try{tarefas().forEach(x=>{if(!x.prazo||x.prazo<A||x.prazo>B)return;L.push({k:'tar',d:x.prazo,dE:x.prazo,dia:true,t:x.t,feito:!!x.feito,x,cor:'#2f7fd0',f:()=>go('tarefas')})})}catch(_){}}
  if(C.src.prova&&S.pv&&Array.isArray(S.pv.av)){S.pv.av.forEach(p=>Object.values(p.ag||{}).forEach(g=>{const i=new Date(g.ini),f=new Date(g.fim);if(isNaN(i))return;const d=ocI(i);if(d<A||d>B)return;const df=ocI(f);
    L.push({k:'prova',d,dE:df<d?d:df,h0:i.getHours()*60+i.getMinutes(),h1:df===d?f.getHours()*60+f.getMinutes():24*60-1,t:'Prova: '+p.titulo,cor:'#7c3aed',f:()=>{UI.pvEd={k:'av',id:p.id};UI.pvAt='ativ';go('provas')}})}))}
  if(C.src.esc){for(let d=A;d<=B;d=ocAdd(d,1)){const tp=(()=>{try{return tipoDia(d)}catch(_){return ''}})();if(tp&&/^feriado|interrupcao/.test(tp)){const nota=(((a||{}).calendario||{}).notas||{})[d]||'';L.push({k:'esc',d,dE:d,dia:true,t:(/^feriado/.test(tp)?'Feriado':'Interrupção letiva')+(nota?' · '+nota:''),cor:/^feriado/.test(tp)?'#e04848':'#e0a030',fundo:/^feriado/.test(tp)?'fer':'int'})}}}
  return L}
const ocA=()=>{try{return A()}catch(_){return null}};
/* ---------- estrutura ---------- */
function ocIntervalo(){const C=OCAL(),v=C.cfg.vista,d=UI.ocDia||isoHoje();
  if(v==='dia')return [d,d];if(v==='3d')return [d,ocAdd(d,2)];if(v==='trab'){const s=ocSegunda(d);return [s,ocAdd(s,4)]}if(v==='sem'){const s=ocSegunda(d);return [s,ocAdd(s,6)]}
  if(v==='mes'){const p=d.slice(0,8)+'01';const s=ocSegunda(p);return [s,ocAdd(s,41)]}if(v==='agenda')return [d,ocAdd(d,59)];
  const dd=ocD(d);const y=dd.getMonth()>=8?dd.getFullYear():dd.getFullYear()-1;return [`${y}-09-01`,`${y+1}-08-31`]}
function ocTitulo(){const C=OCAL(),v=C.cfg.vista,d=UI.ocDia||isoHoje();const [A,B]=ocIntervalo();const dd=ocD(d);
  if(v==='mes')return OC_MES[dd.getMonth()]+' '+dd.getFullYear();if(v==='ano')return 'Ano letivo '+A.slice(0,4)+'/'+B.slice(0,4);if(v==='dia')return OC_DS[dd.getDay()]+', '+dd.getDate()+' de '+OC_MES[dd.getMonth()]+' '+dd.getFullYear();
  const a=ocD(A),b=ocD(B);return a.getMonth()===b.getMonth()?`${a.getDate()}–${b.getDate()} de ${OC_MES[a.getMonth()]} ${a.getFullYear()}`:`${a.getDate()} ${OC_MES[a.getMonth()].slice(0,3)} – ${b.getDate()} ${OC_MES[b.getMonth()].slice(0,3)} ${b.getFullYear()}`}
function ocNav(k){const C=OCAL(),v=C.cfg.vista,d=UI.ocDia||isoHoje();const st={dia:1,'3d':3,trab:7,sem:7,agenda:30}[v];if(st)UI.ocDia=ocAdd(d,k*st);else if(v==='mes'){const x=ocD(d);x.setDate(1);x.setMonth(x.getMonth()+k);UI.ocDia=ocI(x)}else{const x=ocD(d);x.setFullYear(x.getFullYear()+k);UI.ocDia=ocI(x)}vMeuCal()}
vMeuCal=function(){const C=OCAL(),v=C.cfg.vista;const hj=isoHoje();UI.ocDia=UI.ocDia||hj;barBtns([]);const q=UI.ocQ||'';
  const V=[['dia','Dia'],['3d','3 dias'],['trab','Semana de trabalho'],['sem','Semana'],['mes','Mês'],['agenda','Agenda'],['ano','Ano letivo']];
  $('#view').innerHTML=`<div class="oc"><aside class="ocside"><button class="btn pri ocnovo" id="oc-novo">${ic('plus',16)} Novo evento</button><div id="oc-mini"></div>
    <div class="ocsec"><b>Os meus calendários</b>${C.cals.map(c=>`<label class="occk"><input type="checkbox" data-occ="${c.id}" ${c.on!==false?'checked':''}><i style="background:${c.cor}"></i><span>${esc(c.nome)}</span><button type="button" class="ocmini" data-oce="${c.id}" aria-label="Editar calendário">${ic('pen',12)}</button></label>`).join('')}<button type="button" class="ocadd" id="oc-ncal">${ic('plus',13)} Adicionar calendário</button></div>
    <div class="ocsec"><b>Da EduSpruce</b>${OC_SRC.map(([k,l,c])=>`<label class="occk"><input type="checkbox" data-ocs="${k}" ${C.src[k]?'checked':''}><i style="background:${c}"></i><span>${l}</span></label>`).join('')}</div>
    <div class="ocsec"><b>Categorias</b><div class="occats">${C.cat.map(c=>`<span class="occat"><i style="background:${c.cor}"></i>${esc(c.nome)}</span>`).join('')}<button type="button" class="ocadd" id="oc-cats">${ic('pen',13)} Editar</button></div></div>
    <div class="ocsec" id="oc-prox"></div></aside>
    <section class="ocmain"><div class="octb"><button class="btn sm" id="oc-hoje">Hoje</button><button class="btn sm ico" id="oc-ant" aria-label="Anterior">‹</button><button class="btn sm ico" id="oc-seg" aria-label="Seguinte">›</button><h2 class="octit">${esc(ocTitulo())}</h2><span class="sp1"></span>
      <div class="ocvis" role="tablist">${V.map(([k,l])=>`<button type="button" data-ocv="${k}" class="${v===k?'on':''}">${l}</button>`).join('')}</div></div>
      <div class="octb2"><form id="oc-qf" class="ocq"><input id="oc-qa" placeholder="Adicionar rapidamente: ex. «Reunião de pais amanhã às 18h30» ou «Natação todas as quartas às 19h»" aria-label="Adicionar evento rapidamente"><button class="btn sm pri" aria-label="Adicionar">${ic('plus',14)}</button></form>
        <input type="search" id="oc-q" placeholder="Pesquisar no calendário…" value="${esc(q)}" aria-label="Pesquisar"><button class="btn sm" id="oc-ics" title="Importar ou exportar .ics">${ic('download',14)} .ics</button><button class="btn sm" id="oc-imp" title="Imprimir">${ic('printer',14)}</button><button class="btn sm" id="oc-def" title="Definições do calendário">${ic('gear',14)}</button></div>
      <div id="oc-c"></div></section></div>`;
  ocMini();ocProx();const c=$('#oc-c');if(q.trim())ocPesquisa(c,q);else if(v==='mes')ocMes(c);else if(v==='agenda')ocAgenda(c);else if(v==='ano')ocAno(c);else ocGrelha(c);
  $('#oc-novo').onclick=()=>ocEditar(null,{d0:UI.ocDia});$('#oc-hoje').onclick=()=>{UI.ocDia=hj;vMeuCal()};$('#oc-ant').onclick=()=>ocNav(-1);$('#oc-seg').onclick=()=>ocNav(1);
  $$('[data-ocv]').forEach(b=>b.onclick=()=>{C.cfg.vista=b.dataset.ocv;save();vMeuCal()});
  $$('[data-occ]').forEach(i=>i.onchange=()=>{ocCal(i.dataset.occ).on=i.checked;save();vMeuCal()});$$('[data-ocs]').forEach(i=>i.onchange=()=>{C.src[i.dataset.ocs]=i.checked;save();vMeuCal()});
  $$('[data-oce]').forEach(b=>b.onclick=e=>{e.preventDefault();ocCalDlg(ocCal(b.dataset.oce))});$('#oc-ncal').onclick=()=>ocCalDlg(null);$('#oc-cats').onclick=()=>ocCatsDlg();
  $('#oc-qf').onsubmit=e=>{e.preventDefault();const t=$('#oc-qa').value.trim();if(!t)return;const o=ocParse(t);ocEditar(null,o)};
  const qi=$('#oc-q');qi.oninput=()=>{UI.ocQ=qi.value;clearTimeout(vMeuCal._t);vMeuCal._t=setTimeout(()=>{vMeuCal();const z=$('#oc-q');if(z){z.focus();z.setSelectionRange(z.value.length,z.value.length)}},300)};
  $('#oc-ics').onclick=()=>ocIcsDlg();$('#oc-imp').onclick=()=>ocImprimir();$('#oc-def').onclick=()=>ocDefsDlg()};
if(go._f)go._f.meucal=vMeuCal;
function ocMini(){const el=$('#oc-mini');if(!el)return;const hj=isoHoje();const m=UI.ocMini||(UI.ocDia||hj).slice(0,7);const [Y,M]=m.split('-').map(Number);const p=`${m}-01`;const s=ocSegunda(p);const [A,B]=ocIntervalo();
  const E=new Set(ocColetar(s,ocAdd(s,41)).filter(x=>x.k!=='aula'&&x.k!=='esc').map(x=>x.d));
  let h=`<div class="ocmh"><button type="button" data-mm="-1" aria-label="Mês anterior">‹</button><b>${OC_MES[M-1]} ${Y}</b><button type="button" data-mm="1" aria-label="Mês seguinte">›</button></div><div class="ocmg">${['S','T','Q','Q','S','S','D'].map(x=>`<span>${x}</span>`).join('')}`;
  for(let i=0;i<42;i++){const d=ocAdd(s,i);h+=`<button type="button" data-md="${d}" class="${d.slice(0,7)!==m?'fo':''} ${d===hj?'hj':''} ${d>=A&&d<=B&&OCAL().cfg.vista!=='ano'?'in':''} ${E.has(d)?'ev':''}">${+d.slice(8)}</button>`}
  el.innerHTML=h+'</div>';el.querySelectorAll('[data-mm]').forEach(b=>b.onclick=()=>{const d=new Date(Y,M-1+(+b.dataset.mm),1);UI.ocMini=ocI(d).slice(0,7);ocMini()});
  el.querySelectorAll('[data-md]').forEach(b=>b.onclick=()=>{UI.ocDia=b.dataset.md;UI.ocMini=null;vMeuCal()})}
function ocProx(){const el=$('#oc-prox');if(!el)return;const hj=isoHoje();const L=ocColetar(hj,ocAdd(hj,7)).filter(x=>x.k!=='aula'&&x.k!=='esc'&&!x.feito).sort((a,b)=>(a.d+ocHM(a.h0||0)).localeCompare(b.d+ocHM(b.h0||0))).slice(0,6);
  el.innerHTML=`<b>A minha agenda</b>${L.length?L.map((x,i)=>`<button type="button" class="ocpx" data-px="${i}"><i style="background:${x.cor}"></i><span>${esc(x.t)}<small>${x.d===hj?'Hoje':x.d===ocAdd(hj,1)?'Amanhã':ocD(x.d).toLocaleDateString('pt-PT',{weekday:'short',day:'numeric',month:'short'})}${x.h0!=null?' · '+ocHM(x.h0):''}</small></span></button>`).join(''):'<p class="mut peq">Nada nos próximos 7 dias.</p>'}`;
  el.querySelectorAll('[data-px]').forEach(b=>b.onclick=()=>ocAbrir(L[+b.dataset.px]))}
function ocAbrir(x){if(x.k==='ev')return ocVer(x);if(x.f)x.f()}
/* ---------- vista Mês ---------- */
function ocMes(el){const C=OCAL(),hj=isoHoje(),d=UI.ocDia||hj;const [A,B]=ocIntervalo();const m=d.slice(0,7);const L=ocColetar(A,B);const por={};
  L.forEach(x=>{for(let k=x.d;k<=(x.dE||x.d);k=ocAdd(k,1)){if(k<A||k>B)continue;(por[k]=por[k]||[]).push(x)}if(ocDif(x.d,x.dE||x.d)>60)return});
  const ordem=(a,b)=>(a.dia||a.h0==null?-1:a.h0)-(b.dia||b.h0==null?-1:b.h0);
  let h=`<div class="ocmes ${C.cfg.semN?'sn':''}"><div class="ocmhd">${C.cfg.semN?'<span></span>':''}${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(x=>`<span>${x}</span>`).join('')}</div>`;
  for(let w=0;w<6;w++){h+=`<div class="ocmw">${C.cfg.semN?`<span class="ocsn" title="Semana ${ocSemN(ocAdd(A,w*7))}">${ocSemN(ocAdd(A,w*7))}</span>`:''}`;
    for(let i=0;i<7;i++){const k=ocAdd(A,w*7+i);const X=(por[k]||[]).sort(ordem);const fu=X.find(x=>x.fundo);const vis=X.filter(x=>!x.fundo||true);const n=X.filter(x=>x.k==='aula'||x.k==='reun'||x.k==='ev'&&x.h0!=null).length;const fds=[5,6].includes(i);
      h+=`<div class="ocdc ${k.slice(0,7)!==m?'fo':''} ${k===hj?'hj':''} ${fds?'fds':''} ${fu?'f-'+fu.fundo:''}" data-ocd="${k}"><button type="button" class="ocdn" data-ocdv="${k}">${+k.slice(8)===1?OC_MES[+k.slice(5,7)-1].slice(0,3)+' ':''}${+k.slice(8)}</button>
        ${vis.slice(0,4).map(x=>`<button type="button" class="ocev ${x.k} ${x.feito?'ok':''} ${x.falta?'falta':''} ${x.est==='provisorio'?'prov':''}" style="--c:${x.cor}" data-oci="${L.indexOf(x)}" ${x.k==='ev'&&!x.rep?'draggable="true"':''} title="${esc(x.t+(x.loc?' · '+x.loc:''))}">${x.h0!=null&&!x.dia?`<b>${ocHM(x.h0)}</b> `:''}${x.k==='tar'?(x.feito?'☑ ':'☐ '):''}${x.rep?'↻ ':''}${x.priv?'🔒 ':''}${esc(x.t)}</button>`).join('')}
        ${vis.length>4?`<button type="button" class="ocmais" data-ocdv="${k}">+${vis.length-4} mais</button>`:''}${C.cfg.carga&&n?`<i class="occg" style="width:${Math.min(100,n*14)}%" title="${n} compromisso(s)"></i>`:''}</div>`}h+='</div>'}
  el.innerHTML=h+'</div>';
  el.querySelectorAll('[data-oci]').forEach(b=>b.onclick=e=>{e.stopPropagation();ocAbrir(L[+b.dataset.oci])});
  el.querySelectorAll('[data-ocdv]').forEach(b=>b.onclick=e=>{e.stopPropagation();UI.ocDia=b.dataset.ocdv;C.cfg.vista='dia';save();vMeuCal()});
  el.querySelectorAll('[data-ocd]').forEach(c=>{c.ondblclick=()=>ocEditar(null,{d0:c.dataset.ocd,dia:false,h0:9*60,h1:10*60});c.onclick=e=>{if(e.target===c){UI.ocDia=c.dataset.ocd;ocMini()}};
    c.ondragover=e=>{e.preventDefault();c.classList.add('drop')};c.ondragleave=()=>c.classList.remove('drop');
    c.ondrop=e=>{e.preventDefault();c.classList.remove('drop');const x=L[+e.dataTransfer.getData('text/oc')];if(!x||x.k!=='ev')return;const n=ocDif(x.e.d0,c.dataset.ocd);x.e.d0=ocAdd(x.e.d0,n);x.e.d1=ocAdd(x.e.d1||x.e.d0,n);ocGuardar(x.e);vMeuCal()}});
  el.querySelectorAll('[draggable]').forEach(b=>b.ondragstart=e=>e.dataTransfer.setData('text/oc',b.dataset.oci))}
/* ---------- vistas Dia / 3 dias / Semana (grelha com horas) ---------- */
function ocGrelha(el){const C=OCAL(),hj=isoHoje();const [A,B]=ocIntervalo();const dias=[];for(let d=A;d<=B;d=ocAdd(d,1))dias.push(d);const L=ocColetar(A,B);
  const tm=L.filter(x=>!x.dia&&x.h0!=null&&x.d===x.dE),td=L.filter(x=>x.dia||x.h0==null||x.d!==x.dE);
  let h0=Math.min(C.cfg.h0,...tm.map(x=>Math.floor(x.h0/60)))*60,h1=Math.max(C.cfg.h1,...tm.map(x=>Math.ceil((x.h1||x.h0+30)/60)))*60;h1=Math.min(h1,24*60);
  const SL=+C.cfg.slot||30,PX=SL===15?20:SL===60?48:26,ppm=PX/SL;const H=(h1-h0)*ppm;
  const col=d=>{const X=tm.filter(x=>x.d===d).sort((a,b)=>a.h0-b.h0||(b.h1-b.h0)-(a.h1-a.h0));const cols=[];X.forEach(x=>{let c=0;while(cols[c]&&cols[c].some(y=>y.h0<(x.h1||x.h0+30)&&x.h0<(y.h1||y.h0+30)))c++;(cols[c]=cols[c]||[]).push(x);x._c=c});
    X.forEach(x=>{let mx=x._c;cols.forEach((cc,i)=>{if(cc.some(y=>y.h0<(x.h1||x.h0+30)&&x.h0<(y.h1||y.h0+30)))mx=Math.max(mx,i)});x._n=mx+1});return X};
  const agora=new Date(),mn=agora.getHours()*60+agora.getMinutes();
  el.innerHTML=`<div class="ocgr" style="--n:${dias.length}"><div class="ocgh"><span class="ocgt">${C.cfg.semN?'S'+ocSemN(A):''}</span>${dias.map(d=>{const x=ocD(d);const tp=(()=>{try{return tipoDia(d)}catch(_){return ''}})();return `<button type="button" class="ocgd ${d===hj?'hj':''}" data-ocdv="${d}"><small>${OC_DS[x.getDay()].slice(0,3)}</small><b>${x.getDate()}</b>${tp&&/^feriado/.test(tp)?'<em>feriado</em>':tp==='interrupcao'?'<em>interrupção</em>':''}</button>`}).join('')}</div>
    <div class="ocga"><span class="ocgt">dia inteiro</span>${dias.map(d=>`<div class="ocgac" data-ocad="${d}">${td.filter(x=>x.d<=d&&(x.dE||x.d)>=d).map(x=>`<button type="button" class="ocev ${x.k} ${x.feito?'ok':''}" style="--c:${x.cor}" data-oci="${L.indexOf(x)}" title="${esc(x.t)}">${x.k==='tar'?(x.feito?'☑ ':'☐ '):''}${esc(x.t)}</button>`).join('')}</div>`).join('')}</div>
    <div class="ocgb" id="oc-gb"><div class="ocgtc" style="height:${H}px">${Array.from({length:(h1-h0)/60},(_,i)=>`<span style="top:${i*60*ppm}px">${ocHM(h0+i*60)}</span>`).join('')}</div>
    ${dias.map(d=>`<div class="ocgc ${d===hj?'hj':''} ${[0,6].includes(ocD(d).getDay())?'fds':''}" data-ocg="${d}" style="height:${H}px;--sl:${PX}px">${col(d).map(x=>{const t=(x.h0-h0)*ppm,hh=Math.max(18,((x.h1||x.h0+30)-x.h0)*ppm-2);return `<div class="ocgev ${x.k} ${x.falta?'falta':''} ${x.est==='provisorio'?'prov':''} ${x.est==='livre'?'livre':''}" style="--c:${x.cor};top:${t}px;height:${hh}px;left:calc(${x._c/x._n*100}% + 2px);width:calc(${100/x._n}% - 4px)" data-oci="${L.indexOf(x)}" ${x.k==='ev'&&!x.rep?'data-ocmv="1"':''} tabindex="0" role="button"><b>${x.priv?'🔒 ':''}${x.rep?'↻ ':''}${esc(x.t)}</b><small>${ocHM(x.h0)}–${ocHM(x.h1)}${x.loc?' · '+esc(x.loc):''}${x.semSum?' · sem sumário':''}${x.falta?' · falta':''}</small>${x.k==='ev'&&!x.rep?'<i class="ocrs" data-ocrs="1"></i>':''}</div>`}).join('')}${d===hj&&mn>=h0&&mn<=h1?`<i class="ocnow" style="top:${(mn-h0)*ppm}px"></i>`:''}</div>`).join('')}</div></div>`;
  const gb=$('#oc-gb');const hs=Math.max(0,((dias.includes(hj)?mn-60:C.cfg.h0*60)-h0)*ppm);gb.scrollTop=hs;
  el.querySelectorAll('[data-oci]').forEach(b=>{b.onclick=e=>{if(b._arr)return;e.stopPropagation();ocAbrir(L[+b.dataset.oci])};b.onkeydown=e=>{if(e.key==='Enter')ocAbrir(L[+b.dataset.oci])}});
  el.querySelectorAll('[data-ocdv]').forEach(b=>b.onclick=()=>{UI.ocDia=b.dataset.ocdv;C.cfg.vista='dia';save();vMeuCal()});
  el.querySelectorAll('[data-ocad]').forEach(c=>c.ondblclick=e=>{if(e.target===c)ocEditar(null,{d0:c.dataset.ocad,dia:true})});
  const snap=m=>Math.round(m/SL)*SL;const mpos=(c,e)=>h0+(e.clientY-c.getBoundingClientRect().top)/ppm;
  /* criar arrastando numa coluna */
  el.querySelectorAll('[data-ocg]').forEach(c=>{c.onpointerdown=e=>{if(e.target!==c||e.button)return;e.preventDefault();const m0=snap(Math.floor(mpos(c,e)/SL)*SL);const g=document.createElement('div');g.className='ocsel';c.appendChild(g);let m1=m0+SL;
    const pinta=()=>{const a=Math.min(m0,m1),b=Math.max(m0,m1);g.style.top=(a-h0)*ppm+'px';g.style.height=(b-a)*ppm+'px';g.textContent=ocHM(a)+'–'+ocHM(b)};pinta();c.setPointerCapture(e.pointerId);
    c.onpointermove=ev=>{let m=snap(mpos(c,ev));if(m===m0)m=m0+SL;m1=Math.max(h0,Math.min(h1,m));pinta()};
    c.onpointerup=()=>{c.onpointermove=null;c.onpointerup=null;const a=Math.min(m0,m1),b=Math.max(m0,m1);g.remove();ocEditar(null,{d0:c.dataset.ocg,h0:a,h1:b,dia:false})}}});
  /* mover e alterar a duração arrastando */
  el.querySelectorAll('[data-ocmv]').forEach(b=>{b.onpointerdown=e=>{if(e.button)return;const x=L[+b.dataset.oci];const rs=!!e.target.closest('[data-ocrs]');const y0=e.clientY,x0=e.clientX;const c0=b.parentNode;const cw=c0.getBoundingClientRect().width;const t0=parseFloat(b.style.top),hh0=parseFloat(b.style.height);let dm=0,dd=0;b._arr=false;
    b.setPointerCapture(e.pointerId);b.onpointermove=ev=>{const dy=ev.clientY-y0,dx=ev.clientX-x0;if(Math.abs(dy)+Math.abs(dx)>4)b._arr=true;if(!b._arr)return;dm=Math.round(dy/ppm/SL)*SL;
      if(rs){b.style.height=Math.max(PX-2,hh0+dm*ppm)+'px'}else{dd=Math.round(dx/cw);b.style.top=(t0+dm*ppm)+'px';b.style.transform=`translateX(${dd*cw}px)`}};
    b.onpointerup=()=>{b.onpointermove=null;b.onpointerup=null;if(!b._arr)return;setTimeout(()=>b._arr=false,50);const e2=x.e;if(rs){e2.h1=Math.max(e2.h0+SL,(e2.h1||e2.h0+60)+dm)}else{const n=Math.max(-dias.indexOf(x.d),Math.min(dias.length-1-dias.indexOf(x.d),dd));e2.h0=Math.max(0,e2.h0+dm);e2.h1=Math.min(24*60,(e2.h1||e2.h0+60)+dm);e2.d0=ocAdd(e2.d0,n);e2.d1=ocAdd(e2.d1||e2.d0,n)}ocGuardar(e2);vMeuCal()}}})}
/* ---------- Agenda (lista) e Ano letivo ---------- */
function ocLista(el,L,vazio){const g={};L.forEach(x=>(g[x.d]=g[x.d]||[]).push(x));const K=Object.keys(g).sort();const hj=isoHoje();
  el.innerHTML=K.length?`<div class="ocag">${K.map(d=>`<div class="ocagd ${d===hj?'hj':''}"><div class="ocagh"><b>${ocD(d).getDate()}</b><span>${OC_DS[ocD(d).getDay()]}<small>${OC_MES[ocD(d).getMonth()]} ${ocD(d).getFullYear()}</small></span></div><div>${g[d].sort((a,b)=>(a.dia||a.h0==null?-1:a.h0)-(b.dia||b.h0==null?-1:b.h0)).map(x=>`<button type="button" class="ocagi" data-oci="${L.indexOf(x)}"><i style="background:${x.cor}"></i><span class="ocagt">${x.dia||x.h0==null?'Dia inteiro':ocHM(x.h0)+' – '+ocHM(x.h1)}</span><span><b class="${x.feito?'mc-feito':''}">${esc(x.t)}</b>${x.loc?`<small>${esc(x.loc)}</small>`:''}</span></button>`).join('')}</div></div>`).join('')}</div>`:`<div class="empty" style="padding:30px">${vazio}</div>`;
  el.querySelectorAll('[data-oci]').forEach(b=>b.onclick=()=>ocAbrir(L[+b.dataset.oci]))}
function ocAgenda(el){const [A,B]=ocIntervalo();ocLista(el,ocColetar(A,B).filter(x=>x.k!=='aula'||OCAL().cfg.agAulas),'Nada marcado nos próximos 60 dias.');el.insertAdjacentHTML('afterbegin',`<label class="chk" style="margin:0 0 8px"><input type="checkbox" id="oc-aga" ${OCAL().cfg.agAulas?'checked':''}> <span>Mostrar também as aulas</span></label>`);$('#oc-aga').onchange=e=>{OCAL().cfg.agAulas=e.target.checked;save();vMeuCal()}}
function ocPesquisa(el,q){const hj=isoHoje();const n=normT(q);const L=ocColetar(ocAdd(hj,-200),ocAdd(hj,400)).filter(x=>x.k!=='aula'&&normT(x.t+' '+(x.loc||'')+' '+(x.e&&x.e.desc||'')).includes(n));ocLista(el,L,'Sem resultados para «'+esc(q)+'».');el.insertAdjacentHTML('afterbegin',`<p class="mut" style="margin:0 0 8px">${L.length} resultado(s) para «${esc(q)}» <button class="btn sm ghost" id="oc-ql">Limpar</button></p>`);$('#oc-ql').onclick=()=>{UI.ocQ='';vMeuCal()}}
function ocAno(el){const [A,B]=ocIntervalo();const L=ocColetar(A,B).filter(x=>x.k!=='aula');const por={};L.forEach(x=>(por[x.d]=por[x.d]||[]).push(x));const hj=isoHoje();let h='<div class="ocano">';
  for(let i=0;i<12;i++){const d=ocD(A);d.setMonth(d.getMonth()+i);const m=ocI(d).slice(0,7);const s=ocSegunda(m+'-01');h+=`<div class="ocam"><b>${OC_MES[d.getMonth()]} ${d.getFullYear()}</b><div class="ocmg">${['S','T','Q','Q','S','S','D'].map(x=>`<span>${x}</span>`).join('')}`;
    for(let k=0;k<42;k++){const x=ocAdd(s,k);if(x.slice(0,7)!==m){h+='<i></i>';continue}const X=por[x]||[];const fu=X.find(z=>z.fundo);const te=X.some(z=>z.k==='tes'||z.k==='prova');const ou=X.some(z=>z.k!=='esc');h+=`<button type="button" data-ocdv="${x}" class="${x===hj?'hj':''} ${fu?'f-'+fu.fundo:''} ${te?'te':ou?'ev':''}" title="${esc(X.map(z=>z.t).join(' · '))}">${+x.slice(8)}</button>`}h+='</div></div>'}
  el.innerHTML=h+`</div><p class="mut peq" style="margin-top:10px"><span class="ocleg f-fer"></span> Feriado <span class="ocleg f-int"></span> Interrupção <span class="ocleg te"></span> Teste ou prova <span class="ocleg ev"></span> Outros compromissos</p>`;
  el.querySelectorAll('[data-ocdv]').forEach(b=>b.onclick=()=>{UI.ocDia=b.dataset.ocdv;OCAL().cfg.vista='dia';save();vMeuCal()})}
/* ---------- ver e editar eventos ---------- */
function ocVer(x){const e=x.e;const cal=ocCal(e.cal);const o=Object.assign({},e,(e.ov||{})[x.occ]||{});
  openDrawer(o.t||'Evento',`<div class="ed"><p style="margin-top:0"><i class="ocbol" style="background:${x.cor}"></i> <b>${esc(cal.nome)}</b>${o.cat&&ocCat(o.cat)?' · '+esc(ocCat(o.cat).nome):''}${o.priv?' · 🔒 Privado':''}</p>
    <p>${ic('calendar',15)} ${ocD(x.d).toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}${x.dE&&x.dE!==x.d?' – '+ocD(x.dE).toLocaleDateString('pt-PT',{day:'numeric',month:'long'}):''}${o.dia?' · dia inteiro':' · '+ocHM(o.h0)+' – '+ocHM(o.h1)}</p>
    ${e.rep&&e.rep.f!=='nao'?`<p>${ic('refresh',15)} ${esc(ocRepTxt(e))}</p>`:''}${o.loc?`<p>${ic('home',15)} ${esc(o.loc)}</p>`:''}${o.link?`<p><a class="btn sm pri" href="${esc(o.link)}" target="_blank" rel="noopener">${ic('send',13)} Entrar na reunião online</a></p>`:''}
    <p class="mut">${esc((OC_EST.find(z=>z[0]===o.est)||OC_EST[0])[1])}${(o.lemb||[]).length?' · lembrete '+o.lemb.map(m=>m>=1440?m/1440+' dia(s)':m>=60?m/60+' h':m+' min').join(', ')+' antes':''}</p>
    ${o.desc?`<div class="card" style="white-space:pre-wrap">${esc(o.desc)}</div>`:''}
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:12px"><button class="btn pri" id="ov-e">${ic('pen',14)} Editar</button><button class="btn" id="ov-d">${ic('copy',14)} Duplicar</button><button class="btn dng" id="ov-x">${ic('trash',14)} Apagar</button></div></div>`);
  const serie=x.rep;
  $('#ov-e').onclick=()=>{if(!serie)return ocEditar(e);ocPergunta('Editar evento repetido',['Só esta ocorrência','Toda a série'],k=>{if(k===1)return ocEditar(e);ocEditar(e,null,x.occ)})};
  $('#ov-d').onclick=()=>{const c=JSON.parse(JSON.stringify(e));c.id=uid();c.t=(c.t||'')+' (cópia)';c.criado=Date.now();OCAL().ev.push(c);save();closeDrawer();toast('Duplicado','ok');vMeuCal()};
  $('#ov-x').onclick=()=>{const apaga=()=>{OCAL().ev=OCAL().ev.filter(z=>z!==e);save();closeDrawer();toast('Apagado','ok');vMeuCal()};if(!serie){if(confirm('Apagar «'+(e.t||'evento')+'»?'))apaga();return}
    ocPergunta('Apagar evento repetido',['Só esta ocorrência','Esta e as seguintes','Toda a série'],k=>{if(k===0){(e.exc=e.exc||[]).push(x.occ);save();closeDrawer();vMeuCal()}else if(k===1){e.rep.ate=ocAdd(x.occ,-1);save();closeDrawer();vMeuCal()}else apaga()})}}
function ocPergunta(t,ops,cb){openDrawer(t,`<div class="ed"><div class="armais">${ops.map((o,i)=>`<button class="btn" data-opq="${i}">${esc(o)}</button>`).join('')}</div></div>`);$$('#dw-b [data-opq]').forEach(b=>b.onclick=()=>cb(+b.dataset.opq))}
function ocRepTxt(e){const r=e.rep||{};const I=+r.int||1;const DN=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];const s=ocD(e.d0);let t=
  r.f==='dia'?(I>1?'A cada '+I+' dias':'Todos os dias'):r.f==='uteis'?'Todos os dias úteis':r.f==='sem'?(I>1?'A cada '+I+' semanas':'Todas as semanas')+' à '+((r.dias&&r.dias.length?r.dias:[s.getDay()]).map(d=>DN[d]).join(', ')):r.f==='mes'?(I>1?'A cada '+I+' meses':'Todos os meses')+' no dia '+s.getDate():r.f==='mesd'?'Todos os meses na '+Math.ceil(s.getDate()/7)+'.ª '+DN[s.getDay()]:r.f==='ano'?'Todos os anos a '+s.getDate()+' de '+OC_MES[s.getMonth()]:'';
  return t+(r.ate?' até '+ocD(r.ate).toLocaleDateString('pt-PT'):r.n?' ('+r.n+' vezes)':'')}
function ocGuardar(e){e.alterado=Date.now();const L=OCAL().ev;if(!L.includes(e))L.push(e);save()}
/* editor: e = evento existente (ou null), pre = valores iniciais, occ = editar só esta ocorrência */
function ocEditar(e,pre,occ){const C=OCAL();const novo=!e;const base=e?Object.assign({},e,occ?((e.ov||{})[occ]||{}):{}):Object.assign({t:'',cal:C.cals[0].id,d0:isoHoje(),h0:9*60,h1:10*60,dia:false,loc:'',link:'',desc:'',lemb:[15],est:'ocupado',priv:false,cat:'',rep:{f:'nao',int:1,dias:[],ate:'',n:0},esc:escAtiva()},pre||{});
  if(occ){base.d0=occ;base.d1=ocAdd(occ,ocDif(e.d0,e.d1||e.d0))}if(!base.d1)base.d1=base.d0;if(base.h0==null&&!base.dia){base.h0=9*60;base.h1=10*60}const r=Object.assign({f:'nao',int:1,dias:[],ate:'',n:0},base.rep||{});
  const LB=[[0,'Na hora'],[5,'5 min'],[15,'15 min'],[30,'30 min'],[60,'1 hora'],[120,'2 horas'],[1440,'1 dia'],[2880,'2 dias'],[10080,'1 semana']];const a=ocA();
  openDrawer(novo?'Novo evento':occ?'Editar esta ocorrência':'Editar evento',`<div class="ed ocedf"><input id="oe-t" class="octi" placeholder="Adicionar um título" value="${esc(base.t)}">
    <div class="row" style="gap:8px;flex-wrap:wrap"><div style="flex:1;min-width:150px"><label>Calendário</label><select id="oe-c">${C.cals.map(c=>`<option value="${c.id}" ${base.cal===c.id?'selected':''}>${esc(c.nome)}</option>`).join('')}</select></div><div style="flex:1;min-width:150px"><label>Categoria</label><select id="oe-cat"><option value="">—</option>${C.cat.map(c=>`<option value="${c.id}" ${base.cat===c.id?'selected':''}>${esc(c.nome)}</option>`).join('')}</select></div></div>
    <label class="chk"><input type="checkbox" id="oe-dia" ${base.dia?'checked':''}> <span>Dia inteiro</span></label>
    <div class="row" style="gap:8px;flex-wrap:wrap"><div style="flex:1.3;min-width:140px"><label>Início</label><input type="date" id="oe-d0" value="${base.d0}"></div><div class="oe-h" style="flex:1;min-width:100px"><label>&nbsp;</label><input type="time" id="oe-h0" step="300" value="${ocHM(base.h0)}"></div></div>
    <div class="row" style="gap:8px;flex-wrap:wrap"><div style="flex:1.3;min-width:140px"><label>Fim</label><input type="date" id="oe-d1" value="${base.d1}"></div><div class="oe-h" style="flex:1;min-width:100px"><label>&nbsp;</label><input type="time" id="oe-h1" step="300" value="${ocHM(base.h1)}"></div></div>
    ${occ?'':`<label>Repetir</label><select id="oe-r">${[['nao','Não se repete'],['dia','Diariamente'],['uteis','Todos os dias úteis (seg–sex)'],['sem','Semanalmente'],['mes','Mensalmente (no mesmo dia)'],['mesd','Mensalmente (ex.: 2.ª terça)'],['ano','Anualmente']].map(([k,l])=>`<option value="${k}" ${r.f===k?'selected':''}>${l}</option>`).join('')}</select>
    <div id="oe-rx" class="ocrx"><div class="row" style="gap:8px;align-items:center;flex-wrap:wrap"><span>A cada</span><input type="number" id="oe-ri" min="1" value="${+r.int||1}" style="width:70px"><span id="oe-ru"></span></div>
      <div id="oe-rd" class="ocrd">${['D','S','T','Q','Q','S','S'].map((l,i)=>`<label><input type="checkbox" value="${i}" ${(r.dias||[]).includes(i)?'checked':''}><span>${l}</span></label>`).join('')}</div>
      <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><span>Termina</span><select id="oe-rt" style="width:auto"><option value="">nunca</option><option value="d" ${r.ate?'selected':''}>em</option><option value="n" ${r.n&&!r.ate?'selected':''}>depois de</option></select><input type="date" id="oe-ra" value="${r.ate||''}" style="width:auto"><input type="number" id="oe-rn" min="1" value="${r.n||10}" style="width:80px"><span id="oe-rnl">vezes</span></div>
      <button type="button" class="btn sm ghost" id="oe-fim-ano">Até ao fim do ano letivo</button></div>`}
    <label>Local</label><input id="oe-l" value="${esc(base.loc||'')}" placeholder="ex.: Sala 12, Biblioteca">
    <label>Reunião online (ligação Teams, Meet ou Zoom)</label><input id="oe-k" value="${esc(base.link||'')}" placeholder="https://…">
    <label>Lembretes</label><div class="oclb">${LB.map(([m,l])=>`<label class="pvchip"><input type="checkbox" value="${m}" ${(base.lemb||[]).includes(m)?'checked':''}> ${l}</label>`).join('')}</div>
    <div class="row" style="gap:8px;flex-wrap:wrap"><div style="flex:1;min-width:160px"><label>Mostrar como</label><select id="oe-e">${OC_EST.map(([k,l])=>`<option value="${k}" ${base.est===k?'selected':''}>${l}</option>`).join('')}</select></div><div style="flex:1;min-width:160px"><label>Escola</label><select id="oe-s"><option value="">Todas (pessoal)</option>${(()=>{try{return [{id:'principal',nome:(a&&a.escola&&a.escola.nome)||'Escola principal'},...(S.escolas||[])].map(x=>`<option value="${x.id}" ${base.esc===x.id?'selected':''}>${esc(x.nome||'Escola')}</option>`).join('')}catch(_){return ''}})()}</select></div></div>
    <label class="chk"><input type="checkbox" id="oe-p" ${base.priv?'checked':''}> <span>Privado (no modo de apresentação aparece só «Ocupado»)</span></label>
    <label>Descrição</label><textarea id="oe-ds" rows="4" placeholder="Ordem de trabalhos, notas, material…">${esc(base.desc||'')}</textarea>
    <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn pri" id="oe-ok">${ic('check',14)} Guardar</button>${novo?'':`<button class="btn dng" id="oe-x">${ic('trash',14)} Apagar</button>`}<span class="sp1"></span><span class="mut peq" id="oe-cf"></span></div></div>`);
  const dia=$('#oe-dia');const hh=()=>$$('#dw-b .oe-h').forEach(x=>x.style.display=dia.checked?'none':'');dia.onchange=hh;hh();
  $('#oe-d0').onchange=()=>{const d0=$('#oe-d0').value;if(d0&&$('#oe-d1').value<d0)$('#oe-d1').value=d0;conf()};$('#oe-h0').onchange=()=>{const a0=ocMin($('#oe-h0').value),a1=ocMin($('#oe-h1').value);if(a0!=null&&(a1==null||a1<=a0)&&$('#oe-d1').value===$('#oe-d0').value)$('#oe-h1').value=ocHM(Math.min(a0+60,1439));conf()};
  const rs=$('#oe-r');if(rs){const pr=()=>{const f=rs.value;$('#oe-rx').style.display=f==='nao'?'none':'';$('#oe-ru').textContent={dia:'dia(s)',uteis:'',sem:'semana(s)',mes:'mês(es)',mesd:'mês(es)',ano:'ano(s)'}[f]||'';$('#oe-ri').parentNode.style.display=f==='uteis'?'none':'';$('#oe-rd').style.display=f==='sem'?'':'none';const t=$('#oe-rt').value;$('#oe-ra').style.display=t==='d'?'':'none';$('#oe-rn').style.display=$('#oe-rnl').style.display=t==='n'?'':'none'};rs.onchange=pr;$('#oe-rt').onchange=pr;pr();
    $('#oe-fim-ano').onclick=()=>{const d=ocD($('#oe-d0').value||isoHoje());const y=d.getMonth()>=8?d.getFullYear()+1:d.getFullYear();$('#oe-rt').value='d';$('#oe-ra').value=y+'-06-30';pr()}}
  /* aviso de sobreposição com aulas e reuniões */
  const conf=()=>{const el=$('#oe-cf');if(!el||dia.checked)return el&&(el.textContent='');const d0=$('#oe-d0').value,a0=ocMin($('#oe-h0').value),a1=ocMin($('#oe-h1').value);if(!d0||a0==null||a1==null)return;const X=ocColetar(d0,d0).filter(x=>(x.k==='aula'||x.k==='reun'||x.k==='ev'&&x.e!==e)&&x.h0!=null&&x.h0<a1&&a0<(x.h1||x.h0+30));el.textContent=X.length?'⚠ Sobrepõe-se a: '+X.map(x=>x.t).join(', ').slice(0,120):'Livre a esta hora';el.style.color=X.length?'var(--bad)':'var(--ok)'};$('#oe-h1').onchange=conf;conf();
  $('#oe-ok').onclick=()=>{const o={t:$('#oe-t').value.trim()||'(sem título)',cal:$('#oe-c').value,cat:$('#oe-cat').value,dia:dia.checked,d0:$('#oe-d0').value,d1:$('#oe-d1').value||$('#oe-d0').value,h0:dia.checked?null:ocMin($('#oe-h0').value),h1:dia.checked?null:ocMin($('#oe-h1').value),loc:$('#oe-l').value.trim(),link:$('#oe-k').value.trim(),lemb:$$('#dw-b .oclb input:checked').map(i=>+i.value),est:$('#oe-e').value,esc:$('#oe-s').value,priv:$('#oe-p').checked,desc:$('#oe-ds').value};
    if(!o.d0)return toast('Escolha a data.','erro');if(o.d1<o.d0)o.d1=o.d0;if(!o.dia&&o.d1===o.d0&&o.h1!=null&&o.h0!=null&&o.h1<=o.h0)return toast('O fim tem de ser depois do início.','erro');if(o.link&&!/^https?:\/\//i.test(o.link))o.link='https://'+o.link;
    if(occ){e.ov=e.ov||{};const dif={};['t','cat','dia','h0','h1','loc','link','lemb','est','priv','desc'].forEach(k=>dif[k]=o[k]);if(o.d0!==occ){(e.exc=e.exc||[]).push(occ);const n=JSON.parse(JSON.stringify(e));Object.assign(n,o,{id:uid(),rep:{f:'nao'},exc:[],ov:{}});C.ev.push(n)}else e.ov[occ]=dif;ocGuardar(e)}
    else{if(rs){const f=rs.value,t=$('#oe-rt').value;o.rep={f,int:Math.max(1,+$('#oe-ri').value||1),dias:$$('#oe-rd input:checked').map(i=>+i.value),ate:f!=='nao'&&t==='d'?$('#oe-ra').value:'',n:f!=='nao'&&t==='n'?Math.max(1,+$('#oe-rn').value||1):0}}
      if(novo){const n=Object.assign({id:uid(),criado:Date.now(),exc:[],ov:{}},o);ocGuardar(n)}else{Object.assign(e,o);ocGuardar(e)}}
    closeDrawer();toast(novo?'Evento criado':'Evento guardado','ok');if(VIEW==='meucal')vMeuCal()};
  const xb=$('#oe-x');if(xb)xb.onclick=()=>{if(!confirm('Apagar este evento'+(e.rep&&e.rep.f!=='nao'?' e todas as repetições':'')+'?'))return;C.ev=C.ev.filter(z=>z!==e);save();closeDrawer();vMeuCal()};setTimeout(()=>{const t=$('#oe-t');if(t&&!t.value)t.focus()},60)}
/* criação rápida: «reunião amanhã às 17h», «teste dia 25 às 10h30», «natação todas as quartas às 19h durante 1h» */
function ocParse(s){let t=' '+s+' ';const hj=isoHoje();let d0=null,h0=null,dur=60,rep=null;const nr=x=>normT(x);const DN=['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
  const tira=re=>{const m=t.match(re);if(m)t=t.replace(m[0],' ');return m};
  let m=tira(/\s(todas as|todos os|cada)\s+(segundas?|terças?|quartas?|quintas?|sextas?|sábados?|domingos?)(-feiras?)?/i);if(m){const k=DN.findIndex(x=>nr(m[2]).startsWith(x));rep={f:'sem',int:1,dias:[k],ate:'',n:0};let d=hj;while(ocD(d).getDay()!==k)d=ocAdd(d,1);d0=d}
  if(!rep&&(m=tira(/\s(todos os dias|diariamente)\b/i)))rep={f:'dia',int:1,dias:[],ate:'',n:0};
  if(!rep&&(m=tira(/\s(todas as semanas|semanalmente)\b/i)))rep={f:'sem',int:1,dias:[],ate:'',n:0};
  if(!rep&&(m=tira(/\s(todos os meses|mensalmente)\b/i)))rep={f:'mes',int:1,dias:[],ate:'',n:0};
  if((m=tira(/\s(depois de amanhã)\b/i)))d0=ocAdd(hj,2);else if((m=tira(/\s(amanhã|amanha)\b/i)))d0=ocAdd(hj,1);else if((m=tira(/\s(hoje)\b/i)))d0=hj;
  if(!d0&&(m=tira(/\s(?:dia\s)?(\d{1,2})\s+de\s+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+de\s+(\d{4}))?/i))){const M=OC_MES.findIndex(x=>nr(x)===nr(m[2]));const hjD=ocD(hj);let y=m[3]?+m[3]:hjD.getFullYear();let c=ocI(new Date(y,M,+m[1]));if(!m[3]&&c<hj)c=ocI(new Date(y+1,M,+m[1]));d0=c}
  if(!d0&&(m=tira(/\s(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/))){const hjD=ocD(hj);let y=m[3]?(+m[3]<100?2000+(+m[3]):+m[3]):hjD.getFullYear();let c=ocI(new Date(y,+m[2]-1,+m[1]));if(!m[3]&&c<hj)c=ocI(new Date(y+1,+m[2]-1,+m[1]));d0=c}
  if(!d0&&(m=tira(/\s(?:no\s|na\s)?(?:próxima\s|proxima\s)?(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)(-feira)?\b/i))){const k=DN.findIndex(x=>nr(m[1]).startsWith(x));let d=ocAdd(hj,1);while(ocD(d).getDay()!==k)d=ocAdd(d,1);d0=d}
  if(!d0&&(m=tira(/\sdia\s(\d{1,2})\b/i))){const hjD=ocD(hj);let c=ocI(new Date(hjD.getFullYear(),hjD.getMonth(),+m[1]));if(c<hj)c=ocI(new Date(hjD.getFullYear(),hjD.getMonth()+1,+m[1]));d0=c}
  if((m=tira(/\s(?:durante|por)\s+(\d+)\s*h(?:oras?)?(?:\s*(\d+)\s*(?:m|min))?/i)))dur=(+m[1])*60+(+(m[2]||0));else if((m=tira(/\s(?:durante|por)\s+(\d+)\s*(?:m|min|minutos)\b/i)))dur=+m[1];
  if((m=tira(/\s(?:às|as|pelas|a partir das)\s+(\d{1,2})(?:[:hH](\d{2})?)?(?:\s*(?:h|horas))?\b/i))||(m=tira(/\s(\d{1,2})[:hH](\d{2})?\b/)))h0=(+m[1])*60+(+(m[2]||0));
  if((m=tira(/\s(?:na|no|em)\s+(sala\s+\S+|biblioteca|audit[oó]rio|ginásio|gin[aá]sio)/i)));
  const loc=m?m[1]:'';t=t.replace(/\s+/g,' ').trim();t=t.charAt(0).toUpperCase()+t.slice(1);
  return {t,d0:d0||UI.ocDia||hj,dia:h0==null,h0,h1:h0==null?null:Math.min(1439,h0+dur),rep:rep||{f:'nao',int:1,dias:[],ate:'',n:0},loc}}
/* ---------- calendários, categorias, definições ---------- */
function ocCalDlg(c){const C=OCAL();const novo=!c;c=c||{id:'k'+uid(),nome:'',cor:'#0891b2',on:true};
  openDrawer(novo?'Novo calendário':'Calendário',`<div class="ed"><label>Nome</label><input id="ck-n" value="${esc(c.nome)}" placeholder="ex.: Desporto, Formação"><label>Cor</label><input type="color" id="ck-c" value="${esc(c.cor)}"><div class="row" style="gap:8px;margin-top:12px"><button class="btn pri" id="ck-ok">Guardar</button>${!novo&&C.cals.length>1?`<button class="btn dng" id="ck-x">${ic('trash',14)} Apagar</button>`:''}</div></div>`);
  $('#ck-ok').onclick=()=>{c.nome=$('#ck-n').value.trim()||'Calendário';c.cor=$('#ck-c').value;if(novo)C.cals.push(c);save();closeDrawer();vMeuCal()};
  const x=$('#ck-x');if(x)x.onclick=()=>{const n=C.ev.filter(e=>e.cal===c.id).length;if(!confirm('Apagar o calendário «'+c.nome+'»'+(n?' e os '+n+' eventos':'')+'?'))return;C.cals=C.cals.filter(z=>z!==c);C.ev=C.ev.filter(e=>e.cal!==c.id);save();closeDrawer();vMeuCal()}}
function ocCatsDlg(){const C=OCAL();const pinta=()=>{$('#dw-b').innerHTML=`<div class="ed">${C.cat.map((c,i)=>`<div class="row" style="gap:8px;margin-bottom:6px"><input type="color" data-kc="${i}" value="${esc(c.cor)}" style="width:50px"><input data-kn="${i}" value="${esc(c.nome)}" style="flex:1"><button class="btn sm ghost" data-kx="${i}" aria-label="Apagar">${ic('x',13)}</button></div>`).join('')}<button class="btn sm" id="kc-a">${ic('plus',13)} Nova categoria</button><button class="btn pri" id="kc-ok" style="margin-top:12px;display:block">Guardar</button></div>`;
    const ler=()=>{$$('#dw-b [data-kn]').forEach(i=>C.cat[+i.dataset.kn].nome=i.value);$$('#dw-b [data-kc]').forEach(i=>C.cat[+i.dataset.kc].cor=i.value)};
    $$('#dw-b [data-kx]').forEach(b=>b.onclick=()=>{ler();C.cat.splice(+b.dataset.kx,1);pinta()});$('#kc-a').onclick=()=>{ler();C.cat.push({id:'c'+uid(),nome:'Nova',cor:'#64748b'});pinta()};$('#kc-ok').onclick=()=>{ler();save();closeDrawer();vMeuCal()}};openDrawer('Categorias','');pinta()}
function ocDefsDlg(){const c=OCAL().cfg;openDrawer('Definições do calendário',`<div class="ed"><div class="row" style="gap:8px"><div style="flex:1"><label>Dia de trabalho começa</label><select id="cd-h0">${Array.from({length:24},(_,i)=>`<option ${c.h0===i?'selected':''} value="${i}">${i}:00</option>`).join('')}</select></div><div style="flex:1"><label>Acaba</label><select id="cd-h1">${Array.from({length:24},(_,i)=>`<option ${c.h1===i+1?'selected':''} value="${i+1}">${i+1}:00</option>`).join('')}</select></div></div>
  <label>Escala da grelha</label><select id="cd-sl"><option value="15" ${c.slot==15?'selected':''}>15 minutos</option><option value="30" ${c.slot==30?'selected':''}>30 minutos</option><option value="60" ${c.slot==60?'selected':''}>60 minutos</option></select>
  <label class="chk"><input type="checkbox" id="cd-sn" ${c.semN?'checked':''}> <span>Mostrar os números das semanas</span></label><label class="chk"><input type="checkbox" id="cd-cg" ${c.carga?'checked':''}> <span>Mostrar a carga de cada dia (barra no mês)</span></label>
  <label class="chk"><input type="checkbox" id="cd-to" ${c.todas?'checked':''}> <span>Mostrar os eventos de todas as escolas</span></label>
  <h3>Lembretes</h3><label>Lembrar reuniões e Provas</label><select id="cd-lr"><option value="0">Não</option>${[5,10,15,30,60].map(m=>`<option value="${m}" ${+c.lembR===m?'selected':''}>${m} minutos antes</option>`).join('')}</select>
  <label class="chk"><input type="checkbox" id="cd-rs" ${c.resumo?'checked':''}> <span>Resumo do dia quando abro a app (aulas, reuniões, testes e tarefas de hoje)</span></label>
  <button class="btn" id="cd-not" style="margin-top:6px">${ic('bell',14)} Ativar notificações do navegador</button>
  <p class="hint">Atalhos de teclado: <b>T</b> hoje · <b>D</b> dia · <b>S</b> semana · <b>W</b> semana de trabalho · <b>M</b> mês · <b>A</b> agenda · <b>N</b> novo evento · <b>←</b> <b>→</b> anterior/seguinte.</p>
  <button class="btn pri" id="cd-ok" style="margin-top:8px">Guardar</button></div>`);
  $('#cd-not').onclick=async()=>{try{const p=await Notification.requestPermission();toast(p==='granted'?'Notificações ativadas':'O navegador não autorizou as notificações',p==='granted'?'ok':'erro')}catch(_){toast('Este navegador não tem notificações','erro')}};
  $('#cd-ok').onclick=()=>{Object.assign(c,{h0:+$('#cd-h0').value,h1:Math.max(+$('#cd-h0').value+1,+$('#cd-h1').value),slot:+$('#cd-sl').value,semN:$('#cd-sn').checked,carga:$('#cd-cg').checked,todas:$('#cd-to').checked,lembR:+$('#cd-lr').value,resumo:$('#cd-rs').checked});save();closeDrawer();vMeuCal()}}
/* ---------- .ics: importar e exportar ---------- */
const ocIcsD=(d,h)=>d.replace(/-/g,'')+(h==null?'':'T'+String(Math.floor(h/60)).padStart(2,'0')+String(h%60).padStart(2,'0')+'00');
const ocIcsEsc=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
function ocIcsGerar(L){const DN=['SU','MO','TU','WE','TH','FR','SA'];const out=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EduSpruce//O Meu Calendario//PT','CALSCALE:GREGORIAN'];const st=ocIcsD(isoHoje(),0)+'Z';
  L.forEach(x=>{out.push('BEGIN:VEVENT','UID:'+(x.uid||uid())+'@eduspruce','DTSTAMP:'+st);if(x.dia||x.h0==null){out.push('DTSTART;VALUE=DATE:'+ocIcsD(x.d0),'DTEND;VALUE=DATE:'+ocIcsD(ocAdd(x.d1||x.d0,1)))}else out.push('DTSTART:'+ocIcsD(x.d0,x.h0),'DTEND:'+ocIcsD(x.d1||x.d0,x.h1!=null?x.h1:x.h0+60));
    out.push('SUMMARY:'+ocIcsEsc(x.t));if(x.loc)out.push('LOCATION:'+ocIcsEsc(x.loc));if(x.desc||x.link)out.push('DESCRIPTION:'+ocIcsEsc([x.desc,x.link].filter(Boolean).join('\n')));
    const r=x.rep;if(r&&r.f&&r.f!=='nao'){const s=ocD(x.d0);let rr={dia:'FREQ=DAILY',uteis:'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',sem:'FREQ=WEEKLY;BYDAY='+((r.dias&&r.dias.length?r.dias:[s.getDay()]).map(d=>DN[d]).join(',')),mes:'FREQ=MONTHLY',mesd:'FREQ=MONTHLY;BYDAY='+Math.ceil(s.getDate()/7)+DN[s.getDay()],ano:'FREQ=YEARLY'}[r.f];if(+r.int>1&&r.f!=='uteis')rr+=';INTERVAL='+r.int;if(r.ate)rr+=';UNTIL='+r.ate.replace(/-/g,'')+'T235959';else if(+r.n)rr+=';COUNT='+r.n;out.push('RRULE:'+rr);(x.exc||[]).forEach(d=>out.push('EXDATE'+(x.dia||x.h0==null?';VALUE=DATE:'+ocIcsD(d):':'+ocIcsD(d,x.h0))))}
    (x.lemb||[]).forEach(m=>out.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+ocIcsEsc(x.t),'TRIGGER:-PT'+m+'M','END:VALARM'));out.push('END:VEVENT')});out.push('END:VCALENDAR');return out.join('\r\n')}
function ocIcsLer(txt,cal){const L=String(txt).replace(/\r\n[ \t]/g,'').replace(/\n[ \t]/g,'').split(/\r?\n/);const N=[];let cur=null,alarm=false;const DN={SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6};const un=s=>String(s||'').replace(/\\n/gi,'\n').replace(/\\([,;\\])/g,'$1');
  const dt=v=>{const m=String(v).match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?(Z)?/);if(!m)return null;if(m[4]&&m[6]){const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5]));return {d:ocI(d),h:d.getHours()*60+d.getMinutes()}}return {d:`${m[1]}-${m[2]}-${m[3]}`,h:m[4]?(+m[4])*60+(+m[5]):null}};
  L.forEach(l=>{if(l==='BEGIN:VEVENT'){cur={id:uid(),cal,criado:Date.now(),exc:[],ov:{},lemb:[],est:'ocupado',esc:'',rep:{f:'nao',int:1,dias:[],ate:'',n:0}};return}if(l==='END:VEVENT'){if(cur&&cur.d0)N.push(cur);cur=null;return}if(!cur)return;if(l==='BEGIN:VALARM'){alarm=true;return}if(l==='END:VALARM'){alarm=false;return}
    const i=l.indexOf(':');if(i<0)return;const k=l.slice(0,i).split(';')[0].toUpperCase(),v=l.slice(i+1);
    if(alarm){if(k==='TRIGGER'){const m=v.match(/-P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/);if(m)cur.lemb.push((+(m[1]||0))*1440+(+(m[2]||0))*60+(+(m[3]||0)))}return}
    if(k==='SUMMARY')cur.t=un(v);else if(k==='LOCATION')cur.loc=un(v);else if(k==='DESCRIPTION')cur.desc=un(v);
    else if(k==='DTSTART'){const x=dt(v);if(x){cur.d0=x.d;cur.h0=x.h;cur.dia=x.h==null}}else if(k==='DTEND'){const x=dt(v);if(x){cur.d1=x.h==null?ocAdd(x.d,-1):x.d;cur.h1=x.h}}
    else if(k==='EXDATE'){v.split(',').forEach(z=>{const x=dt(z);if(x)cur.exc.push(x.d)})}
    else if(k==='RRULE'){const P=Object.fromEntries(v.split(';').map(z=>z.split('=')));const f={DAILY:'dia',WEEKLY:'sem',MONTHLY:'mes',YEARLY:'ano'}[P.FREQ]||'nao';cur.rep={f,int:+P.INTERVAL||1,dias:P.BYDAY&&f==='sem'?P.BYDAY.split(',').map(z=>DN[z.slice(-2)]).filter(z=>z!=null):[],ate:P.UNTIL?dt(P.UNTIL).d:'',n:+P.COUNT||0};if(f==='mes'&&P.BYDAY)cur.rep.f='mesd'}});
  N.forEach(e=>{if(!e.d1||e.d1<e.d0)e.d1=e.d0;if(!e.t)e.t='(sem título)'});return N}
function ocIcsDlg(){const C=OCAL();openDrawer('Importar e exportar (.ics)',`<div class="ed"><h3 style="margin-top:0">Exportar</h3><p class="hint">Abre no Outlook, Google Calendar ou Calendário do iPhone/Mac.</p><div class="armais"><button class="btn" id="ic-e1">${ic('download',15)} Os meus eventos</button><button class="btn" id="ic-e2">${ic('download',15)} Tudo do ano letivo (aulas, reuniões, testes, Provas e os meus eventos)</button><button class="btn" id="ic-e3">${ic('download',15)} Só testes e avaliações</button></div>
  <h3>Importar</h3><p class="hint">Ficheiro .ics exportado do Outlook, Google, escola, etc.</p><label>Para o calendário</label><select id="ic-c">${C.cals.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('')}</select><input type="file" id="ic-f" accept=".ics,text/calendar" style="margin-top:8px"></div>`);
  const ano=()=>{const d=ocD(isoHoje());const y=d.getMonth()>=8?d.getFullYear():d.getFullYear()-1;return [`${y}-09-01`,`${y+1}-08-31`]};const conv=x=>({uid:x.e?x.e.id:uid(),t:x.t,d0:x.d,d1:x.dE||x.d,h0:x.dia?null:x.h0,h1:x.dia?null:x.h1,dia:x.dia||x.h0==null,loc:x.loc||''});
  $('#ic-e1').onclick=()=>download('o-meu-calendario.ics',ocIcsGerar(C.ev.map(e=>Object.assign({uid:e.id},e))),'text/calendar');
  $('#ic-e2').onclick=()=>{const [a,b]=ano();download('ano-letivo.ics',ocIcsGerar([...ocColetar(a,b).filter(x=>x.k!=='ev').map(conv),...C.ev.map(e=>Object.assign({uid:e.id},e))]),'text/calendar')};
  $('#ic-e3').onclick=()=>{const [a,b]=ano();download('testes.ics',ocIcsGerar(ocColetar(a,b).filter(x=>x.k==='tes'||x.k==='prova').map(conv)),'text/calendar')};
  $('#ic-f').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const N=ocIcsLer(r.result,$('#ic-c').value);if(!N.length)return toast('Não encontrei eventos no ficheiro.','erro');N.forEach(x=>C.ev.push(x));save();closeDrawer();toast(N.length+' evento(s) importado(s)','ok');vMeuCal()};r.readAsText(f)}}
/* ---------- imprimir ---------- */
function ocImprimir(){const [A,B]=ocIntervalo();const v=OCAL().cfg.vista;const L=ocColetar(A,B).filter(x=>v==='dia'||v==='3d'||x.k!=='aula'||OCAL().cfg.agAulas);const g={};L.forEach(x=>(g[x.d]=g[x.d]||[]).push(x));const w=window.open('','_blank');if(!w)return toast('O navegador bloqueou a janela.','erro');
  w.document.write(`<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>${esc(ocTitulo())}</title><style>body{font:12px/1.4 system-ui,sans-serif;margin:14mm;color:#111}h1{font-size:18px}table{width:100%;border-collapse:collapse}td{border-bottom:1px solid #ddd;padding:5px 6px;vertical-align:top}td.d{width:140px;font-weight:700}td.h{width:90px;color:#444}i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}</style></head><body><h1>${esc(ocTitulo())}</h1><table>${Object.keys(g).sort().map(d=>g[d].sort((a,b)=>(a.h0||-1)-(b.h0||-1)).map((x,i)=>`<tr><td class="d">${i?'':ocD(d).toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'})}</td><td class="h">${x.dia||x.h0==null?'dia inteiro':ocHM(x.h0)+'–'+ocHM(x.h1)}</td><td><i style="background:${x.cor}"></i>${esc(x.priv?'Ocupado':x.t)}${x.loc?' · '+esc(x.loc):''}</td></tr>`).join('')).join('')}</table><script>setTimeout(()=>print(),300)<\/script></body></html>`);w.document.close()}
/* ---------- atalhos de teclado ---------- */
document.addEventListener('keydown',e=>{if(VIEW!=='meucal'||e.ctrlKey||e.metaKey||e.altKey||document.querySelector('#drawer.on'))return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;const C=OCAL();const k=e.key.toLowerCase();
  const vs={d:'dia',s:'sem',w:'trab',m:'mes',a:'agenda'};if(vs[k]){C.cfg.vista=vs[k];save();vMeuCal()}else if(k==='t'){UI.ocDia=isoHoje();vMeuCal()}else if(k==='n'){e.preventDefault();ocEditar(null,{d0:UI.ocDia||isoHoje()})}else if(e.key==='ArrowLeft')ocNav(-1);else if(e.key==='ArrowRight')ocNav(1);else return;e.preventDefault()});
/* ---------- lembretes (notificação do navegador ou aviso na app) e resumo do dia ---------- */
const _ocAvisados=new Set();
function ocAvisar(t,c){try{if(window.Notification&&Notification.permission==='granted'){new Notification(t,{body:c,icon:'favicon.png',tag:t+c});return}}catch(_){}toast(t+(c?' · '+c:''),'ok')}
function ocLembretes(){try{if(!S||!S.cal&&!S.pv)return;const C=OCAL();const hj=isoHoje();const ag=new Date(),mn=ag.getHours()*60+ag.getMinutes();const L=ocColetar(hj,ocAdd(hj,7));
  L.forEach(x=>{if(x.h0==null||x.dia)return;const ini=+ocD(x.d)+x.h0*60000;const lem=x.k==='ev'?(x.e.ov&&x.e.ov[x.occ]&&x.e.ov[x.occ].lemb||x.e.lemb||[]):((x.k==='reun'||x.k==='prova')&&+C.cfg.lembR?[+C.cfg.lembR]:[]);
    lem.forEach(m=>{const quando=ini-m*60000;const k=(x.e?x.e.id:x.t)+'|'+x.d+'|'+m;if(Date.now()>=quando&&Date.now()-quando<180000&&!_ocAvisados.has(k)){_ocAvisados.add(k);ocAvisar((m?'Daqui a '+(m>=1440?m/1440+' dia(s)':m>=60?m/60+' h':m+' min'):'Agora')+': '+x.t,ocHM(x.h0)+(x.loc?' · '+x.loc:''))}})});
  if(C.cfg.resumo&&C.cfg.resumoDia!==hj&&window.__esPronto!==false&&ocA()){C.cfg.resumoDia=hj;save();const X=ocColetar(hj,hj);const n=k=>X.filter(x=>x.k===k&&!x.feito).length;const p=[n('aula')?n('aula')+' aula(s)':'',n('reun')?n('reun')+' reunião(ões)':'',n('tes')?n('tes')+' teste(s)/avaliação(ões)':'',n('tar')?n('tar')+' tarefa(s)':'',n('ev')?n('ev')+' evento(s)':'',n('prova')?n('prova')+' prova(s)':''].filter(Boolean);if(p.length)setTimeout(()=>toast('Hoje: '+p.join(' · '),'ok'),2500)}}catch(e){console.warn('[EduSpruce] lembretes:',e)}}
setInterval(ocLembretes,30000);setTimeout(ocLembretes,6000);
/* ---------- estilos ---------- */
(()=>{const st=document.createElement('style');st.id='oc-css';st.textContent=`
html body .oc{display:grid;grid-template-columns:250px minmax(0,1fr);gap:16px;align-items:start;width:100%}
.ocside{display:flex;flex-direction:column;gap:14px;position:sticky;top:8px}html body .ocnovo{width:100%;justify-content:center;min-height:44px;font-size:15px}
#oc-mini,.ocsec{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px}.ocsec>b{display:block;font-size:13px;margin-bottom:6px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em}
.ocmh{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}.ocmh b{text-transform:capitalize;font-size:14px;font-weight:600}html body .ocmh button{border:0;background:none;font-size:18px;min-width:30px;min-height:30px;cursor:pointer;color:var(--mut);border-radius:6px}
.ocmg{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center}.ocmg span{font-size:11px;color:var(--mut);padding:2px 0}
html body .ocmg button{border:0;background:none;min-height:28px;font:inherit;font-size:12.5px;border-radius:6px;cursor:pointer;color:var(--ink);position:relative;padding:0}html body .ocmg button.fo{opacity:.4}html body .ocmg button.in{background:color-mix(in srgb,var(--acc) 10%,transparent)}
html body .ocmg button.hj{background:var(--acc);color:#fff;font-weight:700}html body .ocmg button.ev:after{content:'';position:absolute;bottom:2px;left:50%;width:4px;height:4px;border-radius:50%;background:var(--acc);transform:translateX(-50%)}html body .ocmg button.hj.ev:after{background:#fff}
.occk{display:flex;align-items:center;gap:8px;margin:2px 0;font-weight:400;cursor:pointer;min-height:32px}.occk input{width:17px;height:17px;accent-color:var(--acc);margin:0}.occk i{width:12px;height:12px;border-radius:4px;flex:none}.occk span{flex:1;font-size:14px}
html body .ocmini{border:0;background:none;color:var(--mut);cursor:pointer;opacity:0;min-width:26px;min-height:26px;border-radius:6px}.occk:hover .ocmini,.ocmini:focus-visible{opacity:1}
html body .ocadd{border:0;background:none;color:var(--acc);font:inherit;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;gap:4px;align-items:center;padding:4px 0}
.occats{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:13px}.occat{display:inline-flex;gap:5px;align-items:center}.occat i,.ocbol{width:10px;height:10px;border-radius:50%;display:inline-block}
html body .ocpx{display:flex;gap:8px;align-items:flex-start;width:100%;border:0;background:none;text-align:left;padding:6px 4px;border-radius:8px;cursor:pointer;font:inherit;color:var(--ink)}html body .ocpx:hover{background:color-mix(in srgb,var(--acc) 8%,transparent)}.ocpx i{width:4px;align-self:stretch;border-radius:3px;flex:none}.ocpx span{display:flex;flex-direction:column;font-size:13.5px;min-width:0}.ocpx small{color:var(--mut);font-size:12px}
.ocmain{min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.octb{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.octit{margin:0 6px;font-size:19px;font-weight:600;text-transform:capitalize}
.ocvis{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;flex-wrap:wrap}html body .ocvis button{border:0;background:none;padding:7px 11px;font:inherit;font-size:13.5px;cursor:pointer;color:var(--ink);border-right:1px solid var(--line)}html body .ocvis button:last-child{border-right:0}html body .ocvis button.on{background:color-mix(in srgb,var(--acc) 14%,transparent);color:var(--acc);font-weight:600}
.octb2{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:10px 0}.ocq{display:flex;gap:4px;flex:2 1 320px}html body .ocq input{flex:1}html body #oc-q{flex:1 1 180px;max-width:260px}
.ocmes{border:1px solid var(--line);border-radius:10px;overflow:hidden}.ocmhd,.ocmw{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}.ocmes.sn .ocmhd,.ocmes.sn .ocmw{grid-template-columns:28px repeat(7,minmax(0,1fr))}
.ocmhd span{padding:6px;font-size:12.5px;color:var(--mut);text-align:center;border-bottom:1px solid var(--line)}.ocsn{font-size:11px;color:var(--mut);display:flex;justify-content:center;padding-top:6px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--mut) 5%,var(--panel))}
.ocdc{position:relative;min-height:112px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:3px;display:flex;flex-direction:column;gap:2px;min-width:0;overflow:hidden}.ocdc.fo{background:color-mix(in srgb,var(--mut) 5%,var(--panel))}.ocdc.fo .ocdn{opacity:.5}.ocdc.fds{background:color-mix(in srgb,var(--mut) 7%,var(--panel))}
.ocdc.f-fer{background:color-mix(in srgb,#e04848 12%,var(--panel))}.ocdc.f-int{background:color-mix(in srgb,#e0a030 14%,var(--panel))}.ocdc.drop{outline:2px dashed var(--acc);outline-offset:-3px}
html body .ocdn{align-self:flex-start;border:0;background:none;font:inherit;font-size:12.5px;font-weight:600;padding:2px 6px;border-radius:999px;cursor:pointer;color:var(--ink)}.ocdc.hj .ocdn{background:var(--acc);color:#fff}
html body .ocev{display:block;width:100%;text-align:left;border:0;border-left:3px solid var(--c);background:color-mix(in srgb,var(--c) 14%,var(--panel));color:var(--ink);font:inherit;font-size:11.5px;line-height:1.35;padding:1px 5px;border-radius:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
html body .ocev.esc{background:color-mix(in srgb,var(--c) 22%,var(--panel));border-left-color:transparent;font-weight:600}html body .ocev.ok{text-decoration:line-through;opacity:.6}html body .ocev.prov{background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--c) 14%,var(--panel)) 0 6px,var(--panel) 6px 10px)}html body .ocev.falta{opacity:.5;text-decoration:line-through}html body .ocev[draggable]{cursor:grab}
html body .ocmais{border:0;background:none;font:inherit;font-size:11.5px;color:var(--mut);text-align:left;cursor:pointer;padding:0 5px}.occg{position:absolute;left:0;bottom:0;height:3px;background:color-mix(in srgb,var(--acc) 55%,transparent);border-radius:0 3px 0 0}
.ocgr{--g:56px;border:1px solid var(--line);border-radius:10px;overflow:hidden}.ocgh,.ocga{display:grid;grid-template-columns:var(--g) repeat(var(--n),minmax(0,1fr));border-bottom:1px solid var(--line)}
.ocgt{font-size:11px;color:var(--mut);display:flex;align-items:center;justify-content:center;text-align:center;padding:2px}
html body .ocgd{border:0;border-left:1px solid var(--line);background:none;padding:6px;display:flex;flex-direction:column;align-items:center;cursor:pointer;font:inherit;color:var(--ink)}.ocgd small{font-size:12px;color:var(--mut);text-transform:capitalize}.ocgd b{font-size:20px;font-weight:500}.ocgd em{font-size:10.5px;color:#b91c1c;font-style:normal}html body .ocgd.hj b{background:var(--acc);color:#fff;border-radius:999px;min-width:34px}
.ocgac{border-left:1px solid var(--line);padding:2px;display:flex;flex-direction:column;gap:2px;min-height:26px;min-width:0}
.ocgb{display:grid;grid-template-columns:var(--g) repeat(var(--n),minmax(0,1fr));max-height:calc(100vh - 330px);min-height:360px;overflow-y:auto;position:relative}
.ocgtc{position:relative}.ocgtc span{position:absolute;right:6px;font-size:11px;color:var(--mut);transform:translateY(-6px)}
.ocgc{position:relative;border-left:1px solid var(--line);background-image:repeating-linear-gradient(to bottom,transparent 0,transparent calc(var(--sl) - 1px),color-mix(in srgb,var(--line) 70%,transparent) calc(var(--sl) - 1px),color-mix(in srgb,var(--line) 70%,transparent) var(--sl));cursor:cell;touch-action:pan-y}.ocgc.fds{background-color:color-mix(in srgb,var(--mut) 5%,var(--panel))}.ocgc.hj{background-color:color-mix(in srgb,var(--acc) 4%,var(--panel))}
.ocgev{position:absolute;border-left:4px solid var(--c);background:color-mix(in srgb,var(--c) 16%,var(--panel));border-radius:6px;padding:2px 6px;font-size:12px;line-height:1.25;overflow:hidden;cursor:pointer;color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.06);user-select:none}html body .ocgev{display:block!important}.ocgev small{display:block}.ocgev b{display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ocgev small{color:var(--mut);font-size:11px}
.ocgev.prov{background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--c) 16%,var(--panel)) 0 6px,var(--panel) 6px 10px)}.ocgev.livre{background:var(--panel);border:1px dashed var(--c);border-left-width:4px}.ocgev.falta{opacity:.5}.ocgev[data-ocmv]{cursor:grab;touch-action:none}.ocgev:focus-visible{outline:2px solid var(--acc)}
.ocrs{position:absolute;left:0;right:0;bottom:0;height:7px;cursor:ns-resize}.ocnow{position:absolute;left:0;right:0;height:2px;background:#dc2626;z-index:3;pointer-events:none}.ocnow:before{content:'';position:absolute;left:-5px;top:-4px;width:10px;height:10px;border-radius:50%;background:#dc2626}
.ocsel{position:absolute;left:2px;right:2px;background:color-mix(in srgb,var(--acc) 22%,transparent);border:1.5px solid var(--acc);border-radius:6px;font-size:11.5px;padding:2px 6px;color:var(--acc);font-weight:600;pointer-events:none;z-index:4}
.ocag{display:flex;flex-direction:column}.ocagd{display:grid;grid-template-columns:150px 1fr;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}.ocagd.hj .ocagh b{background:var(--acc);color:#fff}.ocagh{display:flex;gap:10px;align-items:center}.ocagh b{font-size:22px;font-weight:600;min-width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--mut) 10%,var(--panel))}.ocagh span{display:flex;flex-direction:column;text-transform:capitalize;font-size:14px}.ocagh small{color:var(--mut)}
html body .ocagi{display:flex;gap:10px;align-items:center;width:100%;border:0;background:none;text-align:left;padding:6px;border-radius:8px;cursor:pointer;font:inherit;color:var(--ink)}html body .ocagi:hover{background:color-mix(in srgb,var(--acc) 8%,transparent)}.ocagi i{width:4px;height:32px;border-radius:3px;flex:none}.ocagt{width:110px;color:var(--mut);font-size:13px;flex:none}.ocagi span:last-child{display:flex;flex-direction:column}.ocagi small{color:var(--mut)}
.ocano{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px}.ocam>b{display:block;text-transform:capitalize;margin-bottom:4px;font-weight:600}.ocam .ocmg i{display:block}
html body .ocam .ocmg button.f-fer,.ocleg.f-fer{background:color-mix(in srgb,#e04848 25%,transparent)}html body .ocam .ocmg button.f-int,.ocleg.f-int{background:color-mix(in srgb,#e0a030 30%,transparent)}html body .ocam .ocmg button.te,.ocleg.te{box-shadow:inset 0 0 0 2px #c0392b}html body .ocam .ocmg button.ev:after{background:var(--acc)}.ocleg{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:middle;margin:0 2px 0 8px}.ocleg.ev{background:var(--acc);border-radius:50%;width:6px;height:6px}
html body .octi{font-size:19px!important;font-weight:600;border:0!important;border-bottom:2px solid var(--line)!important;border-radius:0!important;padding:6px 2px!important;width:100%}html body .octi:focus{border-bottom-color:var(--acc)!important;outline:0}
.ocrx{border-left:3px solid color-mix(in srgb,var(--acc) 40%,var(--line));padding:6px 0 6px 10px;margin:6px 0;display:flex;flex-direction:column;gap:8px}.ocrd{display:flex;gap:4px}.ocrd label{margin:0}.ocrd input{position:absolute;opacity:0;width:1px;height:1px}.ocrd span{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:1.5px solid var(--line);cursor:pointer;font-weight:600;font-size:13px}.ocrd input:checked+span{background:var(--acc);border-color:var(--acc);color:#fff}.ocrd input:focus-visible+span{outline:2px solid var(--acc)}
.oclb{display:flex;flex-wrap:wrap;gap:4px}.oclb label{margin:0;font-weight:400;gap:4px}.oclb input{margin:0}
body.est-sge.est-sge.est-sge .oc *:not(.ocbol):not(.occat i):not(.ocrd span):not(.ocmg button):not(.ocnow):not(.ocpx i){border-radius:0!important}body.est-sge.est-sge.est-sge #dw-b :is(.octi,.ocrx,.oclb label){border-radius:0!important}
@media (max-width:980px){html body .oc{grid-template-columns:1fr}.ocside{position:static;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.ocdc{min-height:80px}.ocagd{grid-template-columns:1fr}.ocagt{width:80px}}
@media print{.ocside,.octb2,.ocvis{display:none!important}html body .oc{grid-template-columns:1fr}.ocgb{max-height:none}}
`;document.head.appendChild(st)})();

