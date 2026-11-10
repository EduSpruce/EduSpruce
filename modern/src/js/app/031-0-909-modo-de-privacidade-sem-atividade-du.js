/* 0.909 · modo de privacidade: sem atividade durante algum tempo, o ecrã fica bloqueado e sem nada visível */
const PRIV_OPC=[0,2,5,10,15,30,60];
const privMin=()=>{const v=S.cfg&&S.cfg.privMin;return v==null?10:+v};
let _privUlt=Date.now(),_privOn=false;
function privCfgHTML(){const v=privMin();return `<div class="row" style="margin-top:14px;gap:10px;flex-wrap:wrap;align-items:center"><b style="font-weight:600">${ic('shield',15)} Modo de privacidade</b><select id="priv-min" aria-label="Modo de privacidade por inatividade">${PRIV_OPC.map(m=>`<option value="${m}" ${m===v?'selected':''}>${m?'depois de '+m+' min sem atividade':'desligado'}</option>`).join('')}</select></div>
  <p class="hint">O ecrã fica bloqueado e sem nada visível (nomes, notas, fotografias, janelas abertas). ${S.cfg.pinHash?'Para voltar, pede o código de acesso.':'Defina um código de acesso para que seja preciso o código para voltar.'} Não bloqueia em ecrã inteiro (projeção).</p>`}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='priv-min'){S.cfg.privMin=+e.target.value;save();toast(S.cfg.privMin?'Modo de privacidade depois de '+S.cfg.privMin+' min':'Modo de privacidade desligado','ok')}});
function privPodeBloquear(f){if(_privOn||(!f&&!privMin())||typeof SESSAO==='undefined'||!SESSAO)return false;const b=document.body;if(b.classList.contains('login-on')||document.getElementById('nvgate')||document.getElementById('pinlock')||document.getElementById('splash'))return false;if(!f&&(document.fullscreenElement||document.webkitFullscreenElement))return false;return true}
function privBloquear(f){if(!privPodeBloquear(f))return;try{if(f&&document.fullscreenElement)document.exitFullscreen()}catch(_){}_privOn=true;document.body.classList.add('priv-on');
  const o=document.createElement('div');o.id='privlock';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','prv-t');
  o.innerHTML=`<div class="prvb"><span class="prvl">${ic('shield',30)}</span><b id="prv-t">Modo de Privacidade</b><span class="prvs">${f?'Ecrã escondido — nada fica visível.':'Bloqueado por inatividade — nada fica visível.'}</span><button type="button" class="btn pri" id="prv-ok">${S.cfg.pinHash?'Desbloquear com o Código':'Continuar'}</button></div>`;
  document.body.appendChild(o);const b=o.querySelector('#prv-ok');b.onclick=privDesbloquear;setTimeout(()=>{try{b.focus()}catch(_){}},50);audit('Privacidade',f?'Modo de privacidade ativado':'Ecrã bloqueado por inatividade','')}
let _privA=false;
async function privDesbloquear(){if(_privA)return;_privA=true;try{if(S.cfg.pinHash){const o=document.getElementById('privlock');if(o)o.classList.add('pin');await pedirPin()}}finally{_privA=false}
  const o=document.getElementById('privlock');if(o){o.classList.add('fora');setTimeout(()=>o.remove(),180)}document.body.classList.remove('priv-on');_privOn=false;_privUlt=Date.now()}
{const mexeu=()=>{if(!_privOn)_privUlt=Date.now()};let _mm=0;
  ['pointerdown','keydown','wheel','touchstart','input','scroll'].forEach(ev=>addEventListener(ev,mexeu,{capture:true,passive:true}));
  addEventListener('mousemove',()=>{const t=Date.now();if(t-_mm>2000){_mm=t;mexeu()}},{passive:true});
  const ver=()=>{const m=privMin();if(m&&Date.now()-_privUlt>=m*60000)privBloquear()};
  setInterval(ver,10000);
  /* ao voltar à app (separador, iPad acordado) verifica logo, antes de se ver o conteúdo */
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){window.__privH=Date.now()}else ver()});
  addEventListener('pageshow',ver);addEventListener('focus',ver)}

/* botão no canto superior direito: entrar já no modo de privacidade (atalho: Ctrl+Shift+L) */
{const pb=()=>{const a=document.getElementById('ajBtn');if(!a||document.getElementById('privBtn'))return;a.insertAdjacentHTML('beforebegin',`<button class="btn ico" id="privBtn" title="Modo de privacidade — esconder tudo (Ctrl+Shift+L)" aria-label="Entrar no modo de privacidade">${ic('shield',20)}</button>`);document.getElementById('privBtn').onclick=()=>privBloquear(true);try{barLayout()}catch(_){}};pb();setTimeout(pb,800);
  /* o cabeçalho volta a arrumar-se quando os ícones da direita mudam de largura (evita botões por cima do título) */
  {let _rt=0,_w=0;const ro=new ResizeObserver(()=>{const ic_=document.querySelector('#bar>.barico');const w=ic_?Math.round(ic_.getBoundingClientRect().width):0;if(w===_w)return;_w=w;cancelAnimationFrame(_rt);_rt=requestAnimationFrame(()=>{try{barLayout()}catch(_){}})});setTimeout(()=>{const ic_=document.querySelector('#bar>.barico');if(ic_)ro.observe(ic_)},300)}
  addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&(e.key==='L'||e.key==='l')){e.preventDefault();privBloquear(true)}},true)}

/* 0.910 · ordem de reposição: o administrador manda apagar definitivamente os dados de um utilizador
   (nuvem + aparelhos) — por exemplo, para repor os dados de demonstração. Cumpre-se uma vez por ordem. */
const REP_KEY='esrep';
{const _an=acNorm;acNorm=function(j){const r=_an.apply(this,arguments);r.repor=(Array.isArray(j&&j.reposicoes)?j.reposicoes:[]).filter(x=>x&&x.h&&x.q).map(x=>({h:String(x.h).toLowerCase(),q:+x.q}));return r}}
try{if(AC_CENTRAL&&!AC_CENTRAL.repor)AC_CENTRAL.repor=[]}catch(_){}
const repFeitas=()=>{try{return JSON.parse(localStorage.getItem(REP_KEY)||'{}')||{}}catch(_){return {}}};
let _repA=false;
/* devolve true se a app vai recarregar (reposição feita) */
async function repVerificar(){if(_repA)return false;try{const s=sessaoAtual();if(!s||s.tipo!=='google')return false;const C=await acCentral();if(!C||!C.repor||!C.repor.length)return false;
  const h=await acHash(s.u);const o=C.repor.filter(x=>x.h===h).sort((a,b)=>b.q-a.q)[0];if(!o)return false;const F=repFeitas();if((F[h]||0)>=o.q)return false;
  _repA=true;const g=document.getElementById('nvgate');if(g)g.remove();document.body.classList.remove('nv-gating');
  const r=await avisoModal('Reposição dos seus dados',['O administrador da EduSpruce pediu a reposição dos dados desta conta ('+s.u+') em '+new Date(o.q).toLocaleDateString('pt-PT')+'.','Todos os dados desta conta — na nuvem (Google Drive) e neste aparelho — vão ser apagados definitivamente. A app volta a começar do zero.','Se precisar de alguma coisa, exporte primeiro uma cópia em Definições › Dados e Segurança.'],[{t:'Exportar Cópia Primeiro',v:'copia'},{t:'Repor Agora',c:'dng',v:'sim'}]);
  if(r==='copia'){_repA=false;try{UI.defTab='dados';go('definicoes')}catch(_){}toast('Depois de exportar, termine a sessão e volte a entrar para concluir a reposição.','aviso');return true}
  if(r!=='sim'){_repA=false;return false}
  ocupado('A apagar os dados…');
  /* 1) nuvem: só uma vez por ordem — outros aparelhos encontram a marca e limpam apenas o que têm */
  try{if(nvL().prov==='google'){const G=PROV.google;const m=await G._mapa(true);const marca=NV_PREF+'reposto-'+o.q+'.json';
      if(!m[marca]){const L=Object.keys(m).filter(n=>n!==marca);await nvPool(L,8,async n=>{try{await G.apagar(n)}catch(e){console.warn(e)}});await G.escrever(marca,JSON.stringify({q:o.q,em:Date.now()}))}}}
  catch(e){livre();_repA=false;await avisoModal('Não foi possível apagar a nuvem',['A ligação ao Google Drive falhou ('+(e.message||e)+').','A reposição fica pendente e volta a ser pedida na próxima entrada.'],[{t:'Continuar',c:'pri',v:1}]);return false}
  /* 2) aparelho */
  audit('Contas','Dados repostos por ordem do administrador',s.u);window.__efApagar=true;try{save=function(){};saveNow=function(){}}catch(_){}
  const _set=Storage.prototype.setItem,_rm=Storage.prototype.removeItem;
  try{Object.keys(localStorage).filter(k=>(/^(edugest|eduflow|es\.|ef\.|nv)/i.test(k)||k==='eskeep')&&k!==ES_PC_KEY&&k!==REP_KEY).forEach(k=>_rm.call(localStorage,k))}catch(_){}
  try{sessionStorage.clear()}catch(_){}
  try{const D=indexedDB.databases?await indexedDB.databases():[];await Promise.all([...D.map(d=>d.name),'edugest','eduflow-ev'].filter((x,k,a)=>x&&a.indexOf(x)===k).map(n=>new Promise(ok=>{const q=indexedDB.deleteDatabase(n);q.onsuccess=q.onerror=q.onblocked=()=>ok()})))}catch(_){}
  F[h]=o.q;try{_set.call(localStorage,REP_KEY,JSON.stringify(F))}catch(_){}
  try{Storage.prototype.setItem=function(){}}catch(_){}
  location.reload();return true}catch(e){console.warn(e);_repA=false;return false}}
{const _sg=nvSyncGate;nvSyncGate=async function(){if(await repVerificar())return;return _sg.apply(this,arguments)}}
setTimeout(()=>{try{const s=sessaoAtual();if(s&&s.tipo==='google'&&!(nvL().prov))repVerificar()}catch(_){}},1500);
/* Definições › Conta e Acesso: botão «Repor dados» por conta e exportação das ordens */
{const _ac=acCartao;acCartao=async function(){let h=await _ac.apply(this,arguments);try{const loc=acLocal();const C=AC_CENTRAL;const hs={};for(const x of loc.gContas)hs[x.email]=await acHash(x.email);
  loc.gContas.forEach((x,i)=>{const pub=C&&C.repor&&x.repor&&C.repor.some(r=>r.h===hs[x.email]&&r.q===x.repor);const tag=x.repor?` <span class="tag ${pub?'w':'bad'}" title="Ordem de reposição">${ic('refresh',11)} reposição ${pub?'publicada':'por publicar'} · ${new Date(x.repor).toLocaleDateString('pt-PT')}</span>`:'';
    h=h.replace(`<button class="btn sm ico dng" data-acx="${i}"`,`<button class="btn sm ico" data-acrep="${i}" title="${x.repor?'Cancelar a ordem de reposição':'Repor (apagar todos os dados desta conta)'}" aria-label="Repor os dados de ${esc(x.email)}">${ic(x.repor?'x':'refresh',14)}</button><button class="btn sm ico dng" data-acx="${i}"`);
    if(tag)h=h.replace(`<b>${esc(x.email)}</b><small>`,`<b>${esc(x.email)}</b><small>${tag} `)})}catch(e){console.warn(e)}return h}}
{const _ab=acBind;acBind=function(){const r=_ab.apply(this,arguments);const loc=acLocal();
  $$('[data-acrep]').forEach(b=>b.onclick=async()=>{const x=loc.gContas[+b.dataset.acrep];if(!x)return;
    if(x.repor){delete x.repor;save();audit('Contas','Ordem de reposição cancelada',x.email);toast('Ordem cancelada — descarregue e publique a configuração.');}
    else{const v=await avisoModal('Repor os dados de '+x.email+'?',['Na próxima vez que esta conta entrar na EduSpruce, todos os seus dados — no Google Drive e nos aparelhos — são apagados definitivamente e a app começa do zero (útil para repor os dados de demonstração).','A ordem só vale depois de descarregar e publicar a configuração no site. Cumpre-se uma vez; para repetir, dê nova ordem.'],[{t:'Cancelar',v:null},{t:'Dar Ordem de Reposição',c:'dng',v:'sim'}]);if(v!=='sim')return;
      x.repor=Date.now();save();audit('Contas','Ordem de reposição dada',x.email);toast('Ordem registada — agora descarregue e publique a configuração.','aviso')}
    const c=$('#ac-card');if(c)acCartao().then(h=>{c.outerHTML=h;acBind()})});return r}}
/* a configuração descarregada leva as ordens de reposição */
{const _dl=download;download=function(nome,txt,tipo){if(nome==='eduspruce-config.json'){try{const j=JSON.parse(txt);const loc=acLocal();Promise.all(loc.gContas.filter(x=>x.repor).map(async x=>({h:await acHash(x.email),q:x.repor}))).then(R=>{if(R.length)j.reposicoes=R;else delete j.reposicoes;_dl.call(this,nome,JSON.stringify(j,null,2)+'\n',tipo)});return}catch(e){console.warn(e)}}return _dl.apply(this,arguments)}}

/* 0.910 · Jornal Escolar › Quadros — quadro visual livre (notas, listas, links, imagens, colunas, títulos, cores, setas e quadros dentro de quadros) */
try{Object.assign(ICONS,{undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',arrow:'<path d="M5 19 19 5"/><path d="M9 5h10v10"/>',type:'<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>'})}catch(_){}
const MQ_CORES=['','#f87171','#fb923c','#facc15','#4ade80','#2dd4bf','#60a5fa','#a78bfa','#f472b6','#94a3b8'];
const MQ_T={nota:['pen','Nota'],tarefa:['check','Lista'],link:['link','Link'],imagem:['image','Imagem'],coluna:['layers','Coluna'],quadro:['grid','Quadro'],titulo:['type','Título'],cor:['sparkle','Cor'],seta:['arrow','Seta']};
function MQ(){const jn=UI.mqCtx==='jornal';const j=jn?(S.snj=S.snj||{}):(S.sn=S.sn||{});if(!jn&&!j.quadros&&S.jornal&&Array.isArray(S.jornal.quadros)){j.quadros=S.jornal.quadros;delete S.jornal.quadros}if(jn&&(!Array.isArray(j.quadros)||!j.quadros.length))j.quadros=[{id:'raiz',nome:'JornalNote',pai:null,itens:[],setas:[],cor:'#f59e0b'}];if(!Array.isArray(j.quadros)||!j.quadros.length)j.quadros=[{id:'raiz',nome:'SpruceNote',pai:null,itens:[],setas:[],cor:'#60a5fa'}];j.quadros.forEach(q=>{q.itens=q.itens||[];q.setas=q.setas||[]});return j.quadros}
const mqQ=id=>MQ().find(q=>q.id===id)||MQ()[0];
const mqUI=()=>{const K=UI.mqCtx==='jornal'?'mqj':'mq';UI[K]=UI[K]||{q:'raiz',sel:[],vis:{}};UI.mq=UI.mq||{q:'raiz',sel:[],vis:{}};if(K==='mqj')return UI.mqj;return UI.mq};
const mqVis=qid=>{const u=mqUI();return u.vis[qid]=u.vis[qid]||{x:40,y:30,z:1}};
function mqLimpa(html){const t=document.createElement('template');t.innerHTML=String(html||'');const OK={B:1,STRONG:1,I:1,EM:1,U:1,S:1,STRIKE:1,BR:1,DIV:1,P:1,UL:1,OL:1,LI:1,H3:1,A:1,SPAN:1,BLOCKQUOTE:1,CODE:1};
  const anda=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===1){if(!OK[c.tagName]){const f=document.createDocumentFragment();while(c.firstChild)f.appendChild(c.firstChild);c.replaceWith(f);anda(n);return}
    [...c.attributes].forEach(a=>{if(!(c.tagName==='A'&&a.name==='href'&&/^(https?:|mailto:)/i.test(a.value)))c.removeAttribute(a.name)});if(c.tagName==='A'){c.setAttribute('target','_blank');c.setAttribute('rel','noopener')}anda(c)}else if(c.nodeType!==3)c.remove()})};anda(t.content);return t.innerHTML}
let _mqHist=[],_mqRef=[];
function mqAntes(){const q=mqQ(mqUI().q);_mqHist.push({qid:q.id,j:JSON.stringify({itens:q.itens,setas:q.setas})});if(_mqHist.length>60)_mqHist.shift();_mqRef=[]}
function mqDesfazer(refazer){const A_=refazer?_mqRef:_mqHist,B_=refazer?_mqHist:_mqRef;const h=A_.pop();if(!h)return toast(refazer?'Nada para refazer':'Nada para desfazer');const q=mqQ(h.qid);B_.push({qid:q.id,j:JSON.stringify({itens:q.itens,setas:q.setas})});const o=JSON.parse(h.j);q.itens=o.itens;q.setas=o.setas;mqUI().q=q.id;save();mqRender()}
const mqItem=(q,id)=>q.itens.find(i=>i.id===id);
function mqNovo(t,x,y,extra){if(_mqEd&&window._mqFim)window._mqFim();const q=mqQ(mqUI().q);mqAntes();const it={id:uid(),t,x:Math.round(x),y:Math.round(y),w:{nota:220,tarefa:240,link:240,imagem:260,coluna:270,quadro:150,titulo:320,cor:120}[t]||220,cor:'',pai:null,...(extra||{})};
  if(t==='nota'&&it.txt==null)it.txt='';if(t==='tarefa'){it.tit=it.tit||'Lista';it.l=it.l||[{t:'',f:false}]}if(t==='titulo'&&it.txt==null)it.txt='Título';if(t==='cor')it.hex=it.hex||'#60a5fa';if(t==='coluna')it.tit=it.tit||'Coluna';
  if(t==='quadro'&&!it.ref){const nq={id:uid(),nome:it.nome||'Novo quadro',pai:q.id,itens:[],setas:[],cor:MQ_CORES[1+Math.floor(Math.random()*8)]};MQ().push(nq);it.ref=nq.id}
  q.itens.push(it);mqUI().sel=[it.id];save();mqRender();if(['nota','titulo'].includes(t))setTimeout(()=>mqEditar(it.id),30);if(t==='tarefa')setTimeout(()=>{const i=document.querySelector(`[data-mq="${it.id}"] .mq-tl input[type=text]`);if(i)i.focus()},30);if(t==='coluna'||t==='quadro')setTimeout(()=>{const i=document.querySelector(`[data-mq="${it.id}"] .mq-nm`);if(i){i.focus();i.select&&i.select()}},30);return it}
/* ---------- vista ---------- */
function mqVista(){const c=$('#sn-c')||$('#jn-c');if(!c)return;MQ();const u=mqUI();if(!MQ().some(q=>q.id===u.q))u.q='raiz';
  c.innerHTML=`<div class="mq" id="mq"><div class="mq-top"><nav class="mq-bc" id="mq-bc"></nav><span class="sp1"></span><span class="mq-dica mut">Arraste da barra para o quadro · duplo toque para abrir ou editar</span><button class="btn sm" id="mq-amp" title="Abrir o quadro em grande">${ic('image',14)} Aumentar</button><button class="btn sm ghost" id="mq-und" title="Desfazer (Ctrl+Z)">${ic('undo',15)}</button><button class="btn sm ghost" id="mq-red" title="Refazer (Ctrl+Shift+Z)" style="transform:scaleX(-1)">${ic('undo',15)}</button></div>
    <div class="mq-body"><aside class="mq-bar" role="toolbar" aria-label="Acrescentar ao quadro">${mqBarra()}</aside>
    <div class="mq-cv" id="mq-cv" tabindex="0" aria-label="Quadro"><div class="mq-w" id="mq-w"><svg class="mq-svg" id="mq-svg"><defs><marker id="mq-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#8e8e93"/></marker></defs></svg><div id="mq-its"></div></div>
      <div class="mq-zoom"><button type="button" id="mq-zm" aria-label="Afastar">−</button><button type="button" id="mq-zr" title="Repor 100 %">100%</button><button type="button" id="mq-zp" aria-label="Aproximar">+</button><button type="button" id="mq-zf" title="Ajustar ao ecrã">${ic('target',14)}</button></div>
      <div class="mq-ctx" id="mq-ctx" hidden></div><div class="mq-fmt" id="mq-fmt" hidden>${[['bold','B','Negrito'],['italic','I','Itálico'],['underline','U','Sublinhado'],['strikeThrough','S','Riscado'],['insertUnorderedList','•','Lista'],['h3','H','Título'],['link','🔗','Ligação']].map(([c_,l,t])=>`<button type="button" data-fmt="${c_}" title="${t}">${l}</button>`).join('')}</div></div></div></div>`;
  mqBind();mqRender()}
function mqBC(){const u=mqUI();const L=[];let q=mqQ(u.q);while(q){L.unshift(q);q=q.pai?MQ().find(z=>z.id===q.pai):null}
  $('#mq-bc').innerHTML=L.map((q,i)=>i<L.length-1?`<button type="button" class="mq-bcb" data-mqq="${q.id}">${esc(q.nome)}</button><span class="mut">›</span>`:`<b>${esc(q.nome)}</b>`).join('');
  $$('#mq-bc [data-mqq]').forEach(b=>b.onclick=()=>mqAbrir(b.dataset.mqq))}
function mqAbrir(id){const u=mqUI();u.q=id;u.sel=[];_mqLig=null;mqRender();const w=$('#mq-w');if(w&&animPerfil&&animPerfil()==='cheio'){w.classList.remove('mq-in');void w.offsetWidth;w.classList.add('mq-in')}}
function mqHTML(it,q){const sel=mqUI().sel.includes(it.id)?' sel':'';const cor=it.cor?` style="--mqc:${it.cor}"`:'';const cl=`mq-it mq-${it.t}${sel}${it.cor?' tem-cor':''}`;
  const pos=it.pai?'':` style="left:${it.x}px;top:${it.y}px;width:${it.w}px${it.cor?';--mqc:'+it.cor:''}"`;const st=it.pai?(it.cor?` style="--mqc:${it.cor}"`:''):pos;
  const rz=it.pai||['quadro','cor'].includes(it.t)?'':'<span class="mq-rz" data-rz aria-hidden="true"></span>';
  if(it.t==='nota')return `<div class="${cl}" data-mq="${it.id}"${st}><div class="mq-txt" data-ed>${mqLimpa(it.txt)||'<span class="mq-ph">Escreva…</span>'}</div>${rz}</div>`;
  if(it.t==='titulo')return `<div class="${cl}" data-mq="${it.id}"${st}><div class="mq-txt" data-ed>${mqLimpa(it.txt)||'<span class="mq-ph">Título</span>'}</div>${rz}</div>`;
  if(it.t==='tarefa'){const n=it.l.filter(x=>x.f).length;return `<div class="${cl}" data-mq="${it.id}"${st}><div class="mq-th"><input class="mq-nm" data-tit value="${esc(it.tit||'')}" placeholder="Lista" aria-label="Nome da lista"><small>${n}/${it.l.length}</small></div><i class="mq-pb"><i style="width:${it.l.length?Math.round(n/it.l.length*100):0}%"></i></i><div class="mq-tl">${it.l.map((x,k)=>`<label class="${x.f?'f':''}"><input type="checkbox" data-tk="${k}" ${x.f?'checked':''}><input type="text" data-tt="${k}" value="${esc(x.t)}" placeholder="Tarefa…"></label>`).join('')}</div><button type="button" class="mq-add" data-tadd>${ic('plus',13)} Tarefa</button>${rz}</div>`}
  if(it.t==='link'){let d='';try{d=new URL(it.url).hostname.replace(/^www\./,'')}catch(_){}return `<div class="${cl}" data-mq="${it.id}"${st}><div class="mq-lk"><span class="mq-lki">${esc((d||'?').charAt(0).toUpperCase())}</span><div><b>${esc(it.tit||d||it.url||'Ligação')}</b><small>${esc(d)}</small></div></div>${it.desc?`<p class="mq-lkd">${esc(it.desc)}</p>`:''}<div class="mq-lka"><a href="${esc(/^https?:/i.test(it.url||'')?it.url:'#')}" target="_blank" rel="noopener" class="btn sm">${ic('link',13)} Abrir</a><button type="button" class="btn sm ghost" data-lked>${ic('pencil',13)}</button></div>${rz}</div>`}
  if(it.t==='imagem'){const src=FOTOS[it.fid];return `<div class="${cl}" data-mq="${it.id}"${st}>${src?`<img src="${src}" alt="${esc(it.leg||'Imagem')}" draggable="false">`:`<div class="mq-semimg">${ic('image',22)}<small>imagem ainda não disponível neste aparelho</small></div>`}<input class="mq-leg" data-leg value="${esc(it.leg||'')}" placeholder="Legenda…" aria-label="Legenda">${rz}</div>`}
  if(it.t==='cor')return `<div class="${cl}" data-mq="${it.id}"${st}><label class="mq-sw" style="background:${esc(it.hex)}"><input type="color" data-hex value="${esc(it.hex)}" aria-label="Cor"></label><small>${esc(it.hex.toUpperCase())}</small></div>`;
  if(it.t==='quadro'){const s=mqQ(it.ref);const n=s&&s.id===it.ref?s.itens.length:0;return `<div class="${cl}" data-mq="${it.id}"${st}><span class="mq-qi" style="background:${esc((s&&s.cor)||'#60a5fa')}">${ic('grid',26)}</span><input class="mq-nm" data-qnm value="${esc((s&&s.id===it.ref&&s.nome)||'Quadro')}" aria-label="Nome do quadro"><small>${n} ${n===1?'elemento':'elementos'}</small></div>`}
  if(it.t==='coluna'){const F=q.itens.filter(x=>x.pai===it.id).sort((a,b)=>(a.o||0)-(b.o||0));return `<div class="${cl}" data-mq="${it.id}"${st}><div class="mq-ch"><input class="mq-nm" data-tit value="${esc(it.tit||'')}" placeholder="Coluna" aria-label="Nome da coluna"><small>${F.length}</small></div><div class="mq-cb" data-colb="${it.id}">${F.map(x=>mqHTML(x,q)).join('')||'<div class="mq-cvaz">Arraste para aqui</div>'}</div>${rz}</div>`}
  return ''}
function mqRender(){const w=$('#mq-its');if(!w)return;const u=mqUI(),q=mqQ(u.q);u.sel=u.sel.filter(id=>mqItem(q,id));mqBC();
  w.innerHTML=q.itens.filter(i=>!i.pai).map(i=>mqHTML(i,q)).join('')+(q.itens.length?'':`<div class="mq-vaz">${ic('grid',34)}<b>Quadro vazio</b><span>Arraste uma nota, uma lista, uma imagem ou um quadro da barra à esquerda — ou cole texto, ligações e imagens aqui.</span></div>`);
  mqZoomAp();mqItensBind();requestAnimationFrame(mqSetas);mqCtx()}
function mqZoomAp(){const v=mqVis(mqUI().q),w=$('#mq-w');if(!w)return;w.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.z})`;const r=$('#mq-zr');if(r)r.textContent=Math.round(v.z*100)+'%';const cv=$('#mq-cv');if(cv){cv.style.backgroundSize=`${22*v.z}px ${22*v.z}px`;cv.style.backgroundPosition=`${v.x}px ${v.y}px`}}
function mqPt(cx,cy){const r=$('#mq-cv').getBoundingClientRect(),v=mqVis(mqUI().q);return {x:(cx-r.left-v.x)/v.z,y:(cy-r.top-v.y)/v.z}}
function mqCentro(){const r=$('#mq-cv').getBoundingClientRect();const p=mqPt(r.left+r.width/2,r.top+r.height/2);return {x:p.x-100+Math.random()*40,y:p.y-60+Math.random()*40}}
function mqRectW(el){const r=el.getBoundingClientRect(),cv=$('#mq-cv').getBoundingClientRect(),v=mqVis(mqUI().q);return {x:(r.left-cv.left-v.x)/v.z,y:(r.top-cv.top-v.y)/v.z,w:r.width/v.z,h:r.height/v.z}}
function mqSetas(){const svg=$('#mq-svg');if(!svg)return;const q=mqQ(mqUI().q);const u=mqUI();svg.querySelectorAll('g').forEach(g=>g.remove());
  const borda=(R,px,py)=>{const cx=R.x+R.w/2,cy=R.y+R.h/2,dx=px-cx,dy=py-cy;if(!dx&&!dy)return {x:cx,y:cy};const s=Math.min(Math.abs((R.w/2+6)/(dx||1e-9)),Math.abs((R.h/2+6)/(dy||1e-9)));return {x:cx+dx*s,y:cy+dy*s}};
  q.setas=q.setas.filter(s=>mqItem(q,s.de)&&mqItem(q,s.para));
  q.setas.forEach(s=>{const a=$(`[data-mq="${s.de}"]`),b=$(`[data-mq="${s.para}"]`);if(!a||!b)return;const A_=mqRectW(a),B_=mqRectW(b);const p1=borda(A_,B_.x+B_.w/2,B_.y+B_.h/2),p2=borda(B_,A_.x+A_.w/2,A_.y+A_.h/2);
    const mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2,dx=p2.x-p1.x,dy=p2.y-p1.y,cx=mx-dy*0.12,cy=my+dx*0.12;const d=`M${p1.x} ${p1.y} Q${cx} ${cy} ${p2.x} ${p2.y}`;
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','mq-seta'+(u.sel.includes(s.id)?' sel':''));g.dataset.seta=s.id;
    g.innerHTML=`<path class="hit" d="${d}"/><path class="ln" d="${d}" marker-end="url(#mq-ah)"/>`;svg.appendChild(g);g.onpointerdown=e=>{e.stopPropagation();u.sel=[s.id];mqRender()}})}
function mqCtx(){const box=$('#mq-ctx');if(!box)return;const u=mqUI(),q=mqQ(u.q);if(!u.sel.length||_mqEd){box.hidden=true;return}
  const seta=q.setas.find(s=>u.sel.includes(s.id));const its=u.sel.map(id=>mqItem(q,id)).filter(Boolean);
  box.innerHTML=(its.length&&!its.some(i=>i.t==='cor')?`<span class="mq-cs">${MQ_CORES.map(c=>`<button type="button" data-cc="${c}" class="${its.every(i=>(i.cor||'')===c)?'on':''}" style="${c?'background:'+c:''}" title="${c?'Cor':'Sem cor'}">${c?'':'×'}</button>`).join('')}</span>`:'')+
    (its.length===1&&its[0].t==='quadro'?`<button type="button" class="btn sm" data-ca="abrir">${ic('grid',13)} Abrir</button>`:'')+(its.length===1&&!its[0].pai?`<button type="button" class="btn sm ghost" data-ca="frente" title="Trazer para a frente">${ic('layers',14)}</button>`:'')+
    (its.length?`<button type="button" class="btn sm ghost" data-ca="dup" title="Duplicar (Ctrl+D)">${ic('copy',14)}</button>`:'')+`<button type="button" class="btn sm ghost dng" data-ca="del" title="Apagar">${ic('trash',14)}</button>`;
  box.hidden=false;box.querySelectorAll('[data-cc]').forEach(b=>b.onclick=()=>{mqAntes();its.forEach(i=>i.cor=b.dataset.cc);save();mqRender()});
  box.querySelectorAll('[data-ca]').forEach(b=>b.onclick=()=>{const a=b.dataset.ca;if(a==='abrir')return mqAbrir(its[0].ref);if(a==='del')return mqApagar();if(a==='dup')return mqDuplicar();if(a==='frente'){mqAntes();q.itens=q.itens.filter(i=>i!==its[0]).concat(its[0]);save();mqRender()}});
  if(seta&&!its.length){}}
function mqApagar(){const u=mqUI(),q=mqQ(u.q);if(!u.sel.length)return;const its=u.sel.map(id=>mqItem(q,id)).filter(Boolean);
  const sub=its.filter(i=>i.t==='quadro');if(sub.length){const n=sub.reduce((s,i)=>{const z=MQ().find(x=>x.id===i.ref);return s+(z?z.itens.length:0)},0);if(n&&!confirm('Apagar '+(sub.length>1?'estes quadros':'este quadro')+' e '+n+' elemento(s) lá dentro?'))return}
  mqAntes();const ids=new Set(u.sel);its.filter(i=>i.t==='coluna').forEach(c=>q.itens.filter(x=>x.pai===c.id).forEach(x=>ids.add(x.id)));
  const apagaQ=id=>{const z=MQ().find(x=>x.id===id);if(!z)return;z.itens.filter(i=>i.t==='quadro').forEach(i=>apagaQ(i.ref));(UI.mqCtx==='jornal'?S.snj:S.sn).quadros=MQ().filter(x=>x.id!==id)};sub.forEach(i=>apagaQ(i.ref));
  q.itens=q.itens.filter(i=>!ids.has(i.id));q.setas=q.setas.filter(s=>!ids.has(s.id)&&!ids.has(s.de)&&!ids.has(s.para));u.sel=[];save();mqRender()}
function mqDuplicar(){const u=mqUI(),q=mqQ(u.q);const its=u.sel.map(id=>mqItem(q,id)).filter(i=>i&&i.t!=='quadro'&&i.t!=='coluna');if(!its.length)return;mqAntes();
  const nv=its.map(i=>{const c=JSON.parse(JSON.stringify(i));c.id=uid();if(c.pai){const el=$(`[data-mq="${i.id}"]`);const R=el?mqRectW(el):{x:i.x,y:i.y};c.pai=null;c.x=R.x;c.y=R.y}c.x+=24;c.y+=24;return c});q.itens.push(...nv);u.sel=nv.map(i=>i.id);save();mqRender()}
/* ---------- edição de texto ---------- */
let _mqEd=null;window._mqFim=null;
function mqEditar(id){const el=$(`[data-mq="${id}"] [data-ed]`);if(!el)return;const q=mqQ(mqUI().q),it=mqItem(q,id);if(!it)return;_mqEd=id;const ph=el.querySelector('.mq-ph');if(ph)el.innerHTML='';
  el.contentEditable='true';el.closest('.mq-it').classList.add('ed');el.focus();try{const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}catch(_){}
  const f=$('#mq-fmt');if(f&&it.t==='nota'){f.hidden=false;mqFmtPos(el)}$('#mq-ctx').hidden=true;
  const fim=window._mqFim=()=>{if(_mqEd!==id)return;window._mqFim=null;el.removeEventListener('blur',blur);el.contentEditable='false';el.closest('.mq-it')&&el.closest('.mq-it').classList.remove('ed');const v=mqLimpa(el.innerHTML).replace(/^(<br>|\s)+$/,'');if(v!==(it.txt||'')){mqAntes();it.txt=v;save()}_mqEd=null;if(f)f.hidden=true;mqRender()};
  const blur=e=>{setTimeout(()=>{if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#mq-fmt'))return;if(_mqEd===id)fim()},120)};el.addEventListener('blur',blur);
  el.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();el.blur()}e.stopPropagation()};el.oninput=()=>{mqFmtPos(el);requestAnimationFrame(mqSetas)}}
function mqFmtPos(el){const f=$('#mq-fmt'),cv=$('#mq-cv');if(!f||f.hidden)return;const r=el.closest('.mq-it').getBoundingClientRect(),c=cv.getBoundingClientRect();f.style.left=Math.max(6,Math.min(c.width-260,r.left-c.left))+'px';f.style.top=Math.max(6,r.top-c.top-44)+'px'}
/* ---------- imagens ---------- */
function mqReduz(file){return new Promise((ok,ko)=>{const r=new FileReader();r.onerror=()=>ko(r.error);r.onload=()=>{const im=new Image();im.onload=()=>{const M=1600,s=Math.min(1,M/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  ok({u:/png|gif|webp/.test(file.type)&&s===1&&file.size<400000?r.result:c.toDataURL('image/jpeg',.82),w:c.width,h:c.height})};im.onerror=()=>ko(new Error('Imagem inválida'));im.src=r.result};r.readAsDataURL(file)})}
async function mqImagens(files,x,y){let k=0;for(const f of files){if(!/^image\//.test(f.type))continue;try{const r=await mqReduz(f);const id='mq:'+uid();FOTOS[id]=r.u;idbPor(id,r.u);mqNovo('imagem',x+k*30,y+k*30,{fid:id,leg:'',w:Math.min(320,Math.max(160,r.w/3))});k++}catch(e){toast(e.message,'erro')}}}
function mqLinkDlg(it){const nov=!it;openDrawer(nov?'Nova Ligação':'Editar Ligação',`<div class="ed"><label>Endereço</label><input id="ml-u" type="url" inputmode="url" value="${esc(it&&it.url||'')}" placeholder="https://…" autocapitalize="none"><label>Título</label><input id="ml-t" value="${esc(it&&it.tit||'')}" placeholder="(o nome do site, se ficar vazio)"><label>Descrição</label><textarea id="ml-d" rows="3">${esc(it&&it.desc||'')}</textarea><div class="row" style="margin-top:14px"><span class="sp1"></span><button class="btn" id="ml-0">Cancelar</button><button class="btn pri" id="ml-ok">${ic('check',14)} Guardar</button></div></div>`);
  setTimeout(()=>$('#ml-u').focus(),60);$('#ml-0').onclick=closeDrawer;$('#ml-ok').onclick=()=>{let u=$('#ml-u').value.trim();if(u&&!/^[a-z]+:/i.test(u))u='https://'+u;if(!/^https?:\/\/[^\s.]+\.[^\s]+/i.test(u))return toast('Escreva um endereço válido','erro');
    const d={url:u,tit:$('#ml-t').value.trim(),desc:$('#ml-d').value.trim()};closeDrawer();if(nov){const p=mqLinkPos||mqCentro();mqNovo('link',p.x,p.y,d)}else{mqAntes();Object.assign(it,d);save();mqRender()}}}
let mqLinkPos=null;
function mqCriar(t,p){p=p||mqCentro();if(t==='imagem'){mqLinkPos=p;$('#mq-f').click();return}if(t==='link'){mqLinkPos=p;mqLinkDlg(null);return}if(t==='seta'){_mqLig={de:null};toast('Toque no primeiro elemento e depois no segundo');$('#mq').classList.add('ligar');return}mqNovo(t,p.x,p.y)}
let _mqLig=null;
/* ---------- interação ---------- */
function mqBind(){const cv=$('#mq-cv'),u=mqUI();
  $('#mq-und').onclick=()=>mqDesfazer(false);
  const abreAmp=()=>{UI.mqFull=true;const m=$('#mq');ecraAmplo({titulo:UI.mqCtx==='jornal'?'JornalNote':'SpruceNote',sub:mqQ(u.q).nome,el:m,aoFechar:()=>{UI.mqFull=false;if(VIEW==='sprucenote')vSpruceNote();if(VIEW==='snjornal')vSnJornal()}});requestAnimationFrame(()=>{try{mqSetas()}catch(_){}})};
  $('#mq-amp').onclick=abreAmp;if(UI.mqFull&&!document.getElementById('ampv'))setTimeout(abreAmp,0);$('#mq-red').onclick=()=>mqDesfazer(true);
  const zoom=(f,cx,cy)=>{const v=mqVis(u.q),r=cv.getBoundingClientRect();cx=cx==null?r.width/2:cx-r.left;cy=cy==null?r.height/2:cy-r.top;const nz=Math.max(.25,Math.min(2.5,v.z*f));v.x=cx-(cx-v.x)*nz/v.z;v.y=cy-(cy-v.y)*nz/v.z;v.z=nz;mqZoomAp();mqFmtPos($('.mq-it.ed [data-ed]')||document.body)};
  $('#mq-zp').onclick=()=>zoom(1.2);$('#mq-zm').onclick=()=>zoom(1/1.2);$('#mq-zr').onclick=()=>{const v=mqVis(u.q);v.z=1;mqZoomAp()};
  $('#mq-zf').onclick=()=>{const q=mqQ(u.q);const L=q.itens.filter(i=>!i.pai);if(!L.length)return;const els=L.map(i=>$(`[data-mq="${i.id}"]`)).filter(Boolean).map(mqRectW);const x0=Math.min(...els.map(r=>r.x)),y0=Math.min(...els.map(r=>r.y)),x1=Math.max(...els.map(r=>r.x+r.w)),y1=Math.max(...els.map(r=>r.y+r.h));const r=cv.getBoundingClientRect();const z=Math.max(.25,Math.min(1.5,Math.min((r.width-60)/(x1-x0),(r.height-60)/(y1-y0))));const v=mqVis(u.q);v.z=z;v.x=(r.width-(x1-x0)*z)/2-x0*z;v.y=(r.height-(y1-y0)*z)/2-y0*z;mqZoomAp()};
  cv.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey)zoom(Math.exp(-e.deltaY*0.01),e.clientX,e.clientY);else{const v=mqVis(u.q);v.x-=e.deltaX;v.y-=e.deltaY;mqZoomAp()}},{passive:false});
  /* barra: tocar cria no centro; arrastar cria onde largar */
  $$('.mq-tool').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();const t=b.dataset.mqt;let g=null;const x0=e.clientX,y0=e.clientY;
    const mv=ev=>{if(!g&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>6){g=document.createElement('div');g.className='mq-ghost';g.innerHTML=ic(MQ_T[t][0],18)+' '+MQ_T[t][1];document.body.appendChild(g)}if(g){g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px'}};
    const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(g){g.remove();const r=cv.getBoundingClientRect();if(ev.clientX>r.left&&ev.clientX<r.right&&ev.clientY>r.top&&ev.clientY<r.bottom){const p=mqPt(ev.clientX,ev.clientY);mqCriar(t,{x:p.x-40,y:p.y-20})}}else mqCriar(t)};
    addEventListener('pointermove',mv);addEventListener('pointerup',up)}});
  $('#mq-f').onchange=e=>{const p=mqLinkPos||mqCentro();mqImagens([...e.target.files],p.x,p.y);e.target.value=''};
  /* fundo: arrastar desloca; seleção por retângulo com Shift; dois dedos aproximam */
  const P=new Map();let pan=null,pinch=null,box=null;
  cv.onpointerdown=e=>{if(e.target.closest('.mq-it,.mq-zoom,.mq-ctx,.mq-fmt,.mq-seta'))return;if(_mqEd){document.activeElement&&document.activeElement.blur();}
    P.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId);cv.focus({preventScroll:true})}catch(_){}
    if(P.size===2){const [a,b]=[...P.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};pan=null;return}
    if(_mqLig){_mqLig=null;$('#mq').classList.remove('ligar')}
    if(e.shiftKey){const p=mqPt(e.clientX,e.clientY);box={x0:p.x,y0:p.y,el:document.createElement('div')};box.el.className='mq-box';$('#mq-w').appendChild(box.el);return}
    const v=mqVis(u.q);pan={x:e.clientX,y:e.clientY,vx:v.x,vy:v.y,mov:false};cv.classList.add('pan')};
  cv.onpointermove=e=>{if(!P.has(e.pointerId))return;P.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&P.size===2){const [a,b]=[...P.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);zoom(d/pinch.d,pinch.cx,pinch.cy);pinch.d=d;return}
    if(box){const p=mqPt(e.clientX,e.clientY);const x=Math.min(p.x,box.x0),y=Math.min(p.y,box.y0),w=Math.abs(p.x-box.x0),h=Math.abs(p.y-box.y0);Object.assign(box.el.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});box.r={x,y,w,h};return}
    if(pan){const v=mqVis(u.q);v.x=pan.vx+e.clientX-pan.x;v.y=pan.vy+e.clientY-pan.y;if(Math.abs(e.clientX-pan.x)+Math.abs(e.clientY-pan.y)>4)pan.mov=true;mqZoomAp()}};
  cv.onpointerup=cv.onpointercancel=e=>{P.delete(e.pointerId);if(P.size<2)pinch=null;cv.classList.remove('pan');
    if(box){const R=box.r;box.el.remove();box=null;if(R){const q=mqQ(u.q);u.sel=q.itens.filter(i=>!i.pai).filter(i=>{const el=$(`[data-mq="${i.id}"]`);if(!el)return false;const r=mqRectW(el);return r.x<R.x+R.w&&r.x+r.w>R.x&&r.y<R.y+R.h&&r.y+r.h>R.y}).map(i=>i.id);mqRender()}return}
    if(pan&&!pan.mov&&u.sel.length){u.sel=[];mqRender()}pan=null};
  cv.ondblclick=e=>{if(e.target.closest('.mq-it,.mq-zoom,.mq-ctx'))return;const p=mqPt(e.clientX,e.clientY);mqNovo('nota',p.x-20,p.y-20)};
  /* largar ficheiros e colar */
  cv.ondragover=e=>{e.preventDefault();cv.classList.add('drop')};cv.ondragleave=()=>cv.classList.remove('drop');
  cv.ondrop=e=>{e.preventDefault();cv.classList.remove('drop');const p=mqPt(e.clientX,e.clientY);const F=[...(e.dataTransfer.files||[])];if(F.length)return mqImagens(F,p.x,p.y);const t=e.dataTransfer.getData('text/uri-list')||e.dataTransfer.getData('text/plain');if(t)mqColarTexto(t,p)};
  cv.onpaste=e=>{if(_mqEd||e.target.closest('input,textarea'))return;const F=[...(e.clipboardData.files||[])];const p=mqCentro();if(F.length){e.preventDefault();return mqImagens(F,p.x,p.y)}const t=e.clipboardData.getData('text/plain');if(t){e.preventDefault();mqColarTexto(t,p)}};
  cv.onkeydown=e=>{if(_mqEd||e.target.closest('input,textarea,[contenteditable=true]'))return;const k=e.key;const m=e.ctrlKey||e.metaKey;
    if((k==='Delete'||k==='Backspace')&&u.sel.length){e.preventDefault();mqApagar()}else if(m&&k.toLowerCase()==='z'){e.preventDefault();mqDesfazer(e.shiftKey)}else if(m&&k.toLowerCase()==='d'){e.preventDefault();mqDuplicar()}else if(m&&k.toLowerCase()==='a'){e.preventDefault();u.sel=mqQ(u.q).itens.filter(i=>!i.pai).map(i=>i.id);mqRender()}else if(k==='Escape'){u.sel=[];_mqLig=null;$('#mq').classList.remove('ligar');mqRender()}
    else if(k.startsWith('Arrow')&&u.sel.length){e.preventDefault();const d=e.shiftKey?20:4;const q=mqQ(u.q);u.sel.forEach(id=>{const i=mqItem(q,id);if(i&&!i.pai){if(k==='ArrowLeft')i.x-=d;if(k==='ArrowRight')i.x+=d;if(k==='ArrowUp')i.y-=d;if(k==='ArrowDown')i.y+=d}});save();mqRender()}};
  $$('#mq-fmt [data-fmt]').forEach(b=>{b.onpointerdown=e=>e.preventDefault();b.onclick=()=>{const c_=b.dataset.fmt;if(c_==='h3')document.execCommand('formatBlock',false,'h3');else if(c_==='link'){const l=prompt('Endereço da ligação:','https://');if(l&&/^https?:\/\//.test(l))document.execCommand('createLink',false,l)}else document.execCommand(c_)}})}
function mqColarTexto(t,p){t=t.trim();if(/^https?:\/\/\S+$/i.test(t)){let d='';try{d=new URL(t).hostname.replace(/^www\./,'')}catch(_){}mqNovo('link',p.x,p.y,{url:t,tit:d,desc:''})}else{const txt=esc(t).replace(/\n/g,'<br>');const it=mqNovo('nota',p.x,p.y,{txt});setTimeout(()=>{if(_mqEd===it.id){const el=$(`[data-mq="${it.id}"] [data-ed]`);el&&el.blur()}},40)}}
function mqItensBind(){const u=mqUI(),q=mqQ(u.q),cv=$('#mq-cv');
  $$('#mq-its .mq-it').forEach(el=>{const id=el.dataset.mq,it=mqItem(q,id);if(!it)return;
    el.onpointerdown=e=>{if(e.button>0||e.target.closest('input,textarea,a,button,select,audio,video,[contenteditable=true],label.mq-sw'))return;e.stopPropagation();try{cv.focus({preventScroll:true})}catch(_){}
      if(_mqLig){if(!_mqLig.de){_mqLig.de=id;el.classList.add('lig');return}if(_mqLig.de!==id){mqAntes();q.setas.push({id:uid(),de:_mqLig.de,para:id});save()}_mqLig=null;$('#mq').classList.remove('ligar');mqRender();return}
      if(e.shiftKey||e.metaKey||e.ctrlKey){u.sel=u.sel.includes(id)?u.sel.filter(x=>x!==id):[...u.sel,id];mqRender();return}
      if(!u.sel.includes(id)){u.sel=[id];$$('#mq-its .mq-it.sel').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');mqCtx()}
      const rz=e.target.closest('[data-rz]');const v=mqVis(u.q);const x0=e.clientX,y0=e.clientY;let mov=false,ghost=null,colAlvo=null;
      const grupo=rz?[it]:u.sel.map(x=>mqItem(q,x)).filter(i=>i&&!(i.pai&&i.id!==it.id));const ori=grupo.map(i=>({i,x:i.x,y:i.y,w:i.w}));
      try{el.setPointerCapture(e.pointerId)}catch(_){}
      const mv=ev=>{const dx=(ev.clientX-x0)/v.z,dy=(ev.clientY-y0)/v.z;if(!mov&&Math.hypot(dx,dy)<4/v.z)return;
        if(!mov){mov=true;mqAntes();if(!rz&&it.pai){/* tirar da coluna */const R=mqRectW(el);it.pai=null;it.x=R.x;it.y=R.y;ori[0].x=R.x;ori[0].y=R.y;mqRender();ghost=$(`[data-mq="${id}"]`)}else ghost=el;ghost.classList.add('arr')}
        if(rz){it.w=Math.max(120,Math.round(ori[0].w+dx));ghost.style.width=it.w+'px';requestAnimationFrame(mqSetas);return}
        ori.forEach(o=>{if(o.i.pai)return;o.i.x=Math.round(o.x+dx);o.i.y=Math.round(o.y+dy);const g=o.i.id===id?ghost:$(`[data-mq="${o.i.id}"]`);if(g){g.style.left=o.i.x+'px';g.style.top=o.i.y+'px'}});
        /* coluna por baixo? */
        if(grupo.length===1&&!['coluna'].includes(it.t)){ghost.style.pointerEvents='none';const t=document.elementFromPoint(ev.clientX,ev.clientY);ghost.style.pointerEvents='';const cb=t&&t.closest&&t.closest('[data-colb]');$$('.mq-cb.alvo').forEach(x=>x!==cb&&x.classList.remove('alvo'));colAlvo=cb&&cb.dataset.colb!==id?cb:null;if(colAlvo)colAlvo.classList.add('alvo')}
        requestAnimationFrame(mqSetas)};
      const up=ev=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);if(ghost&&ghost!==el){ghost.removeEventListener('pointermove',mv)}
        if(!mov)return;if(colAlvo){colAlvo.classList.remove('alvo');const cid=colAlvo.dataset.colb;const F=q.itens.filter(x=>x.pai===cid).sort((a,b)=>(a.o||0)-(b.o||0));let k=F.length;
          [...colAlvo.querySelectorAll(':scope > .mq-it')].forEach((c,n)=>{const r=c.getBoundingClientRect();if(k===F.length&&ev.clientY<r.top+r.height/2)k=n});F.splice(k,0,it);it.pai=cid;F.forEach((x,n)=>x.o=n)}
        save();mqRender()};
      el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)};
    el.ondblclick=e=>{e.stopPropagation();if(it.t==='quadro')return mqAbrir(it.ref);if(it.t==='nota'||it.t==='titulo')return mqEditar(id);if(it.t==='link')return mqLinkDlg(it)};
    const ed=el.querySelector(':scope > [data-ed]');if(ed)ed.onclick=e=>{if(u.sel.length===1&&u.sel[0]===id&&!e.target.closest('a'))mqEditar(id)};
    el.querySelectorAll(':scope [data-tit]').forEach(i=>{if(i.closest('.mq-it')!==el)return;i.onchange=()=>{mqAntes();it.tit=i.value.trim();save()}});
    const qn=el.querySelector('[data-qnm]');if(qn)qn.onchange=()=>{const s=MQ().find(z=>z.id===it.ref);if(s){s.nome=qn.value.trim()||'Quadro';save();mqBC()}};
    const lg=el.querySelector('[data-leg]');if(lg&&lg.closest('.mq-it')===el)lg.onchange=()=>{it.leg=lg.value;save()};
    const hx=el.querySelector('[data-hex]');if(hx)hx.oninput=()=>{it.hex=hx.value;el.querySelector('.mq-sw').style.background=hx.value;el.querySelector('small').textContent=hx.value.toUpperCase()},hx&&(hx.onchange=()=>save());
    const le=el.querySelector('[data-lked]');if(le&&le.closest('.mq-it')===el)le.onclick=()=>mqLinkDlg(it);
    if(it.t==='tarefa'){el.querySelectorAll('[data-tk]').forEach(c=>c.onchange=()=>{mqAntes();it.l[+c.dataset.tk].f=c.checked;save();if(c.checked&&it.l.every(x=>x.f)){try{const r=c.getBoundingClientRect();animConfetes(r.left,r.top)}catch(_){}}mqRender()});
      el.querySelectorAll('[data-tt]').forEach(t=>{const k=+t.dataset.tt;t.onchange=()=>{it.l[k].t=t.value;save()};t.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();it.l[k].t=t.value;mqAntes();it.l.splice(k+1,0,{t:'',f:false});save();mqRender();setTimeout(()=>{const n=$(`[data-mq="${id}"] [data-tt="${k+1}"]`);n&&n.focus()},20)}else if(e.key==='Backspace'&&!t.value&&it.l.length>1){e.preventDefault();mqAntes();it.l.splice(k,1);save();mqRender();setTimeout(()=>{const n=$(`[data-mq="${id}"] [data-tt="${Math.max(0,k-1)}"]`);n&&n.focus()},20)}}});
      const ad=el.querySelector('[data-tadd]');if(ad)ad.onclick=()=>{mqAntes();it.l.push({t:'',f:false});save();mqRender();setTimeout(()=>{const n=$(`[data-mq="${id}"] [data-tt="${it.l.length-1}"]`);n&&n.focus()},20)}}});
  $$('#mq-its input').forEach(i=>i.addEventListener('keydown',e=>e.stopPropagation()))}

/* 0.910 · «Cheio de animações»: mais efeitos (ondas ao tocar, cartões em cascata, revelação ao deslizar, visto a saltar, mini-confetes, contador da barra, inclinação suave) */
{const cheio=()=>{try{return animPerfil()==='cheio'&&animOK()&&!document.documentElement.classList.contains('a11y-rm')}catch(_){return false}};
  /* onda a partir do ponto tocado */
  addEventListener('pointerdown',e=>{if(!cheio())return;const b=e.target.closest&&e.target.closest('.btn,.nav,.chip,.tabs button,.pnk,.kpi,.mq-tool,.anopt');if(!b||b.disabled)return;const r=b.getBoundingClientRect();const d=Math.max(r.width,r.height)*2.2;
    const s=document.createElement('span');s.className='an-rip';s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;if(getComputedStyle(b).position==='static')b.style.position='relative';b.classList.add('an-ripp');b.appendChild(s);setTimeout(()=>s.remove(),650)},{passive:true,capture:true});
  /* visto a saltar e mini-confetes ao marcar caixas */
  addEventListener('change',e=>{if(!cheio())return;const c=e.target;if(!(c instanceof HTMLInputElement)||c.type!=='checkbox'||!c.checked)return;c.classList.remove('an-chk');void c.offsetWidth;c.classList.add('an-chk');
    if(c.closest('#view,.mq')){const r=c.getBoundingClientRect();const box=document.createElement('div');box.className='an-conf an-mini';box.style.left=(r.left+r.width/2)+'px';box.style.top=(r.top+r.height/2)+'px';const C=['#10b981','#3b82f6','#f59e0b','#ec4899'];
      for(let k=0;k<8;k++){const i=document.createElement('i');const a=k/8*Math.PI*2;i.style.cssText=`--dx:${Math.cos(a)*26}px;--dy:${Math.sin(a)*26}px;--r:${k*45}deg;background:${C[k%4]}`;box.appendChild(i)}document.body.appendChild(box);setTimeout(()=>box.remove(),800)}},true);
  /* cartões em cascata + revelação ao deslizar */
  let io=null;const rev=root=>{if(!cheio()||!('IntersectionObserver' in window))return;io=io||new IntersectionObserver(L=>L.forEach(x=>{if(x.isIntersecting){x.target.classList.add('an-vis');io.unobserve(x.target)}}),{rootMargin:'0px 0px -6% 0px'});
    const C=[...(root||document).querySelectorAll('#view .card, #view .cpm-pc, #view .pnk, #view .jn-pc')].slice(0,60);C.forEach((c,k)=>{const r=c.getBoundingClientRect();if(r.top<innerHeight){c.style.setProperty('--ci',Math.min(k,10));c.classList.add('an-card')}else{c.classList.add('an-rev');io.observe(c)}})};
  {const _g=go;go=function(){const r=_g.apply(this,arguments);try{requestAnimationFrame(()=>rev())}catch(_){}return r}}
  /* inclinação suave dos indicadores com o rato */
  addEventListener('pointermove',e=>{if(!cheio()||e.pointerType!=='mouse')return;const k=e.target.closest&&e.target.closest('#view .kpi,#view .pnk');if(!k)return;const r=k.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;k.style.transform=`perspective(600px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-2px)`;k.classList.add('an-tilt')},{passive:true});
  addEventListener('pointerout',e=>{const k=e.target.closest&&e.target.closest('.an-tilt');if(k&&!k.contains(e.relatedTarget)){k.style.transform='';k.classList.remove('an-tilt')}},{passive:true});
  /* o número de avisos da barra lateral salta quando muda */
  const mo=new MutationObserver(M=>{if(!cheio())return;M.forEach(m=>{const el=m.target.nodeType===1?m.target:m.target.parentElement;const b=el&&el.closest&&el.closest('.nbadge,#cpBadge,#jnBadge,.badge');if(b){b.classList.remove('an-bump');void b.offsetWidth;b.classList.add('an-bump')}})});
  setTimeout(()=>{const sd=document.getElementById('side');if(sd)mo.observe(sd,{subtree:true,childList:true,characterData:true})},1500);
  /* título da secção desliza ao mudar */
  {const _g2=go;go=function(){const r=_g2.apply(this,arguments);try{if(cheio()){const t=document.getElementById('ttl');if(t){t.classList.remove('an-ttl');void t.offsetWidth;t.classList.add('an-ttl')}}}catch(_){}return r}}}

/* 0.910 · sessões abertas noutros aparelhos atualizam-se sozinhas: com a app à vista, verifica a nuvem a cada 4 s
   (1 pedido pequeno; só descarrega quando outro aparelho mudou alguma coisa — ex.: testes orais gravados no telemóvel) */
{let _lv=0;const vivo=()=>{try{const L=nvL();if(document.visibilityState!=='visible'||!navigator.onLine||!L.prov||L.auto===false||L.renovar||_nvBusy||!(L.k||_nvK)||!SESSAO||document.getElementById('nvgate')||document.body.classList.contains('priv-on'))return;
    if(Date.now()-_lv<3500)return;_lv=Date.now();nvSincronizar(false).catch(()=>{})}catch(_){}};
  setInterval(()=>{if(!window.__nvRapido)vivo()},4000);addEventListener('focus',()=>setTimeout(vivo,300));addEventListener('online',()=>setTimeout(vivo,800))}

/* 0.915 · arrastar dentro da app nunca abre «Largue aqui o e-mail» */
addEventListener('dragstart',()=>{window.__dragInt=true},true);addEventListener('dragend',()=>{setTimeout(()=>{window.__dragInt=false},50)},true);addEventListener('drop',()=>{setTimeout(()=>{window.__dragInt=false},50)},true);
/* Esc fecha os Avisos Urgentes */
addEventListener('keydown',e=>{if(e.key!=='Escape')return;const x=document.querySelector('#avpop #av-x');if(x&&!document.querySelector('dialog[open]')){e.preventDefault();e.stopPropagation();x.click()}},true);
/* intercalar: mudar a turma de origem */
document.addEventListener('change',e=>{if(e.target&&e.target.id==='sel-orig'&&VIEW==='intercalar'){UI.orig=e.target.value;vIntercalar()}});
/* barra lateral: Planta da Sala logo a seguir aos Alunos; «Sumários» como subnível do Modo Aula */
function navOrdem(){['#tnavHold','#tTree','#side'].forEach(sel=>{const h=document.querySelector(sel);if(!h)return;const al=h.querySelector('[data-v="alunos"]'),pl=h.querySelector('[data-v="planta"]'),au=h.querySelector('[data-v="aula"]'),su=h.querySelector('[data-v="sumarios"]');
  if(al&&pl&&al.parentElement===pl.parentElement&&al.nextElementSibling!==pl)al.after(pl);
  if(au&&su&&au.parentElement===su.parentElement){if(au.nextElementSibling!==su)au.after(su);su.classList.add('navsub');const l=su.querySelector('.lbl');if(l&&l.textContent!=='Sumários')l.textContent='Sumários';su.title='Sumários'}})}
{const _gN=go;go=function(){const r=_gN.apply(this,arguments);try{navOrdem()}catch(_){}return r}}setTimeout(navOrdem,300);setTimeout(navOrdem,1500);
/* apagar o ano letivo limpa tudo o que lhe pertence (jornal, coordenação PROFIJ, tarefas e avisos das turmas desse ano) */
function anoLimparTudo(a){try{const ids=new Set((a.turmas||[]).map(t=>t.id));
  if(S.jornal&&S.jornal.anos){delete S.jornal.anos[a.nome];Object.keys(S.jornal.anos).forEach(k=>{if(k===a.id)delete S.jornal.anos[k]})}
  if(S.cprofij&&S.cprofij.anos){delete S.cprofij.anos[a.id];delete S.cprofij.anos[a.nome]}
  if(Array.isArray(S.todo))S.todo=S.todo.filter(x=>!(x&&(ids.has(x.turma)||ids.has(x.tid)||x.ano===a.id)));
  if(Array.isArray(S.avisos))S.avisos=S.avisos.filter(x=>!(x&&(ids.has(x.turma)||ids.has(x.tid)||x.ano===a.id)));
  if(S.avisosVistos)Object.keys(S.avisosVistos).forEach(k=>{if([...ids].some(i=>k.includes(i)))delete S.avisosVistos[k]});
  if(UI){UI.cpmT='';UI.jnTab='painel';UI.inst=null}}catch(e){console.warn(e)}}

/* Início: marca as colunas sem cartões para o espaço ser usado pelas outras */
function iniColVazias(){const v=$('#view .inlay');if(!v)return;const n=el=>el?[...el.children].filter(c=>(c.classList.contains('card')||/^w-/.test(c.id))&&c.style.display!=='none'&&c.offsetParent!==null).length:0;
  v.classList.toggle('sem-fav',!n($('#view .in-fav')));v.classList.toggle('sem-side',!n($('#view .in-side')))}
{const _vIC=vInicio;vInicio=function(){const r=_vIC.apply(this,arguments);try{requestAnimationFrame(iniColVazias)}catch(_){}return r};if(go._f)go._f.inicio=vInicio}
document.addEventListener('drop',()=>setTimeout(iniColVazias,60));

/* =====================================================================
   0.915 · SpruceNote — módulo opcional (quadro visual livre), na barra lateral acima das turmas
   ===================================================================== */
TITLES.sprucenote='SpruceNote';
const snOn=()=>!(S.cfg&&S.cfg.modSN===false);
function vSpruceNote(){if(!snOn()){$('#view').innerHTML=`<div class="card empty">${ic('grid',30)}<br><b>O SpruceNote está desativado</b><br><span class="mut">Ative-o em Definições › Geral › Módulos Opcionais. Os quadros guardados mantêm-se.</span><br><br><button class="btn pri" id="sn-on">Ativar o SpruceNote</button></div>`;$('#sn-on').onclick=()=>{S.cfg.modSN=true;save();snNav();go('sprucenote')};return}
  UI.mqCtx='prof';barBtns([]);$('#view').innerHTML='<div id="sn-c"></div>';mqVista()}
function vSnJornal(){UI.mqCtx='jornal';barBtns([{id:'b-jn',t:ic('news',15)+' Jornal Escolar',f:()=>go('jornal')}]);$('#view').innerHTML='<div id="sn-c"></div>';mqVista()}
TITLES.snjornal='JornalNote';
function snNav(){const side=$('#side');if(!side)return;let b=$('#side [data-v="sprucenote"]');
  if(!b){const ref=$('#side [data-v="cprofij"]')||$('#side [data-v="jornal"]');if(!ref)return;ref.insertAdjacentHTML('afterend',`<button class="nav" data-v="sprucenote" title="SpruceNote — quadros, notas e ideias"><span data-ico>${ic('grid',18)}</span><span class="lbl">SpruceNote</span></button>`);b=$('#side [data-v="sprucenote"]');b.onclick=()=>go('sprucenote')}
  else{const ref=$('#side [data-v="cprofij"]');if(ref&&ref.nextElementSibling!==b&&ref.parentElement===b.parentElement)ref.after(b)}
  b.style.display=snOn()?'':'none';
  /* subnível no Jornal Escolar: SpruceNote só do jornal */
  const jr=$('#side [data-v="jornal"]');let bj=$('#side [data-v="snjornal"]');if(jr){if(!bj){jr.insertAdjacentHTML('afterend',`<button class="nav navsub" data-v="snjornal" title="JornalNote — quadros só do jornal escolar, separados do SpruceNote"><span data-ico>${ic('grid',16)}</span><span class="lbl">JornalNote</span></button>`);bj=$('#side [data-v="snjornal"]');bj.onclick=()=>go('snjornal')}else if(jr.nextElementSibling!==bj&&jr.parentElement===bj.parentElement)jr.after(bj);bj.style.display=jr.style.display!=='none'&&jr.offsetParent!==null?'':'none'}}
{const _gS=go;go=function(v){if(v==='sprucenote'&&go._f&&!go._f.sprucenote)go._f.sprucenote=vSpruceNote;if(v==='snjornal'&&go._f&&!go._f.snjornal)go._f.snjornal=vSnJornal;if(v==='jornal'&&UI.jnTab==='quadros')UI.jnTab='painel';const r=_gS.apply(this,arguments);try{snNav();$$('#side [data-v="sprucenote"]').forEach(b=>b.classList.toggle('on',v==='sprucenote'));$$('#side [data-v="snjornal"]').forEach(b=>b.classList.toggle('on',v==='snjornal'))}catch(_){}return r}}
if(go._f){go._f.sprucenote=vSpruceNote;go._f.snjornal=vSnJornal}setTimeout(snNav,450);setTimeout(snNav,1600);
{const _ca3=cartaoAvisosDef,_ba3=bindAvisosDef;cartaoAvisosDef=function(){let h=_ca3.apply(this,arguments);return h.replace(/(<div class="card ed" id="def-mods">[\s\S]*?)(<\/div>)$/,`$1<label class="chk" style="margin-top:8px"><input type="checkbox" id="mod-sn" ${snOn()?'checked':''}> ${ic('grid',15)} <span><b>SpruceNote</b><br><span class="mut">Quadros visuais: notas, listas, ligações, imagens, colunas, setas e quadros dentro de quadros</span></span></label>$2`)+`<div class="card ed" id="def-zero"><h2>${ic('trash',18)} Recomeçar do Zero</h2><p class="hint" style="margin-top:0">Apaga definitivamente <b>todos</b> os seus dados da EduSpruce: os ficheiros encriptados na sua conta Google (pasta privada da app no Drive) e a cópia deste aparelho. Os outros aparelhos ficam vazios na próxima vez que abrirem. Não há forma de desfazer.</p><button type="button" class="btn dng" id="zero-go">${ic('trash',15)} Apagar Tudo da Minha Conta e Recomeçar…</button></div>`};
  bindAvisosDef=function(){const r=_ba3.apply(this,arguments);const c=$('#mod-sn');if(c)c.onchange=()=>{S.cfg.modSN=c.checked;save();snNav();toast(c.checked?'SpruceNote ativado':'SpruceNote desativado','ok')};const z=$('#zero-go');if(z)z.onclick=nvApagarTudo;return r}}
/* apagar tudo da conta Google e recomeçar (pedido pelo próprio utilizador) */
async function nvApagarTudo(){const r=await avisoModal('Apagar tudo e recomeçar?',['Vão ser apagados definitivamente todos os dados da EduSpruce desta conta: na nuvem (Google Drive, pasta privada da app) e neste aparelho.','Sugestão: antes, exporte uma cópia em Definições › Dados e Segurança.'],[{t:'Cancelar',v:null},{t:'Continuar',c:'dng',v:'sim'}]);if(r!=='sim')return;
  const w=(prompt('Para confirmar, escreva APAGAR')||'').trim().toUpperCase();if(w!=='APAGAR'){toast('Nada foi apagado.');return}
  ocupado('A apagar a nuvem…');try{const L=nvL();if(L.prov==='google'){const G=PROV.google;const m=await G._mapa(true);await nvPool(Object.keys(m),8,async n=>{try{await G.apagar(n)}catch(e){console.warn(e)}})}
    else if(L.prov&&PROV[L.prov]&&PROV[L.prov].lista){const P_=PROV[L.prov];const L2=await P_.lista();await nvPool(L2,6,async n=>{try{await P_.apagar(n)}catch(_){}})}}
  catch(e){livre();await avisoModal('Não foi possível apagar a nuvem',['A ligação falhou ('+(e.message||e)+'). Nada foi apagado neste aparelho; tente de novo com internet.'],[{t:'Continuar',c:'pri',v:1}]);return}
  ocupado('A limpar este aparelho…');try{audit('Contas','Dados apagados pelo próprio utilizador','')}catch(_){}window.__efApagar=true;try{save=function(){};saveNow=function(){}}catch(_){}
  const _rm=Storage.prototype.removeItem;try{Object.keys(localStorage).filter(k=>(/^(edugest|eduflow|es\.|ef\.|nv)/i.test(k)||k==='eskeep')&&k!==ES_PC_KEY&&k!==REP_KEY).forEach(k=>_rm.call(localStorage,k))}catch(_){}
  try{sessionStorage.clear()}catch(_){}
  try{const D=indexedDB.databases?await indexedDB.databases():[];await Promise.all([...D.map(d=>d.name),'edugest','eduflow-ev'].filter((x,k,a)=>x&&a.indexOf(x)===k).map(n=>new Promise(ok=>{const q=indexedDB.deleteDatabase(n);q.onsuccess=q.onerror=q.onblocked=()=>ok()})))}catch(_){}
  try{Storage.prototype.setItem=function(){}}catch(_){}location.reload()}
/* bloqueadores de anúncios / privacidade: avisam com uma janela (podem impedir o Google e a sincronização) */
async function bloqDetetar(){if(sessionStorage.getItem('es.bloqv'))return;let bl=false;
  try{const mk=c=>{const d=document.createElement('div');d.className=c;d.style.cssText='position:absolute;left:-9999px;top:-9999px;width:300px;height:250px';d.innerHTML='&nbsp;';document.documentElement.appendChild(d);return d};const d=mk('adsbox ad-banner ads adsbygoogle pub_300x250 textads'),k=mk('es-ctl-box');await new Promise(r=>setTimeout(r,250));const vis=x=>{const cs=getComputedStyle(x);return x.offsetHeight>0&&cs.display!=='none'&&cs.visibility!=='hidden'};bl=vis(k)&&!vis(d);d.remove();k.remove()}catch(_){}
  if(!bl&&/^https:/.test(location.protocol)){try{await fetch('https://accounts.google.com/gsi/client',{mode:'no-cors',cache:'no-store'})}catch(_){bl=true}}
  if(!bl)return;try{sessionStorage.setItem('es.bloqv','1')}catch(_){}
  const esp=()=>{if(document.getElementById('nvgate')||document.body.classList.contains('login-on')&&!document.querySelector('#login .lgb')){setTimeout(esp,1500);return}
    avisoModal('Bloqueador de anúncios detetado',['A EduSpruce não tem anúncios nem rastreadores, mas alguns bloqueadores de anúncios ou de privacidade impedem o início de sessão com Google e a sincronização dos dados.','Para funcionar bem, desative o bloqueador para '+(location.hostname||'eduspruce.pt')+' (adicione o site às exceções) e recarregue a página.'],[{t:'Recarregar',v:'r'},{t:'Entendi',c:'pri',v:1}]).then(v=>{if(v==='r')location.reload()})};setTimeout(esp,1200)}
setTimeout(()=>{try{bloqDetetar()}catch(_){}},2500);

/* 0.916 · modalidade de interação: a caixa de foco só aparece quando se usa o teclado */
addEventListener('keydown',e=>{if(e.key==='Tab'||e.key.startsWith('Arrow'))document.documentElement.classList.add('kbd')},true);
addEventListener('pointerdown',()=>document.documentElement.classList.remove('kbd'),true);
/* fotografia: botão do caixote do lixo no canto superior direito */
function phLixo(){[['#pf-del','.pfz'],['#fa-rm','#fa-ph']].forEach(([del,box])=>{const d=document.querySelector(del),b=document.querySelector(box);if(!d||!b||b.querySelector('.phdel'))return;
  let ph=box==='#fa-ph'?b.firstElementChild:b.firstElementChild;if(!ph)return;const w=document.createElement('span');w.className='phwrap';ph.before(w);w.appendChild(ph);
  w.insertAdjacentHTML('beforeend',`<button type="button" class="phdel" title="Apagar a fotografia" aria-label="Apagar a fotografia">${ic('trash',16)}</button>`);w.querySelector('.phdel').onclick=e=>{e.preventDefault();e.stopPropagation();d.click()}})}
new MutationObserver(()=>{if(document.querySelector('#pf-del,#fa-rm'))phLixo()}).observe(document.body,{childList:true,subtree:true});
/* relatórios (e outras folhas A4): ver todas, página a página, ajustar à largura ou à página, aumentar/diminuir */
function zmAplicar(){const w=document.querySelector('#view .sheetwrap');if(!w)return;const L=[...w.children].filter(x=>x.classList.contains('sheet'));if(!L.length)return;
  let bar=w.previousElementSibling;if(!bar||!bar.classList.contains('zmbar')){bar=document.createElement('div');bar.className='zmbar noprint';w.before(bar)}
  const k=VIEW;UI.zm=UI.zm||{};const z=UI.zm[k]=UI.zm[k]||{modo:'normal',f:1,p:0};z.p=Math.min(z.p,L.length-1);
  const sh=L[0];w.style.zoom=1;w.classList.remove('zgrid','zpag');L.forEach(x=>x.classList.remove('zon'));
  const sw=sh.offsetWidth||794,shh=sh.offsetHeight||1123;const disp=w.parentElement.clientWidth-24,alt=innerHeight-(w.getBoundingClientRect().top>0?Math.min(w.getBoundingClientRect().top,200):160)-40;
  let f=z.f;if(z.modo==='largura')f=disp/sw;else if(z.modo==='pagina')f=Math.min(disp/sw,alt/shh);else if(z.modo==='todas'){w.classList.add('zgrid');f=Math.max(.2,Math.min(.6,(disp/Math.min(L.length,4)-24)/sw))}
  if(z.modo==='pagina'||z.modo==='umapag'){w.classList.add('zpag');L[z.p].classList.add('zon')}
  f=Math.max(.2,Math.min(3,f));w.style.zoom=f;
  const B=(m,l,i_)=>`<button type="button" data-zm="${m}" class="${z.modo===m?'on':''}" title="${l}">${ic(i_,14)} ${l}</button>`;
  bar.innerHTML=`<div class="seg">${B('todas','Todas','grid')}${B('umapag','Página a Página','file')}${B('pagina','Página Inteira','image')}${B('largura','Largura','arrowR')}${B('normal','100 %','search')}</div>
    <button type="button" class="btn sm ico" data-zf="-" aria-label="Diminuir">−</button><span class="zmv">${Math.round(f*100)} %</span><button type="button" class="btn sm ico" data-zf="+" aria-label="Aumentar">+</button>
    ${(z.modo==='pagina'||z.modo==='umapag')&&L.length>1?`<span class="zmpg"><button type="button" class="btn sm ico" data-zp="-1" aria-label="Página anterior" ${z.p?'':'disabled'}>‹</button>${z.p+1} / ${L.length}<button type="button" class="btn sm ico" data-zp="1" aria-label="Página seguinte" ${z.p<L.length-1?'':'disabled'}>›</button></span>`:`<span class="mut" style="font-size:12.5px">${L.length} página${L.length>1?'s':''}</span>`}`;
  bar.querySelectorAll('[data-zm]').forEach(b=>b.onclick=()=>{z.modo=b.dataset.zm;if(z.modo==='normal')z.f=1;zmAplicar()});
  bar.querySelectorAll('[data-zf]').forEach(b=>b.onclick=()=>{z.f=Math.max(.2,Math.min(3,f*(b.dataset.zf==='+'?1.15:1/1.15)));if(z.modo!=='umapag')z.modo='livre';zmAplicar()});
  bar.querySelectorAll('[data-zp]').forEach(b=>b.onclick=()=>{z.p=Math.max(0,Math.min(L.length-1,z.p+ +b.dataset.zp));zmAplicar()})}
{let _zt=0;new MutationObserver(()=>{clearTimeout(_zt);_zt=setTimeout(()=>{const w=document.querySelector('#view .sheetwrap');if(w&&!(w.previousElementSibling&&w.previousElementSibling.classList.contains('zmbar')))zmAplicar()},60)}).observe(document.getElementById('view'),{childList:true,subtree:false});addEventListener('resize',()=>{const z=UI.zm&&UI.zm[VIEW];if(z&&/largura|pagina|todas/.test(z.modo))zmAplicar()})}
/* logótipo animado: escolha em Definições › Aparência (também no carregamento e na barra de sincronização) */
const LGA=[['auto','Automático','segue o tema (SGE no tema SGE)'],['classico','Clássico','o «S» desenha-se e o ponto dourado acende'],['sge','SGE','quadrado branco, azul SGE, entrada seca'],['pulso','Pulsar','o logótipo pulsa com ondas'],['rodar','Rodar','o logótipo vira em 3D'],['simples','Simples','sem animação']];
function lgaResolvido(){const k=(S.cfg&&S.cfg.logoAnim)||'auto';return k==='auto'?(S.cfg&&S.cfg.estilo==='sge'?'sge':'classico'):k}
function lgaAplicar(){const k=lgaResolvido();const h=document.documentElement;LGA.forEach(([x])=>h.classList.toggle('lga-'+x,x===k));try{localStorage.setItem('es.lga',k)}catch(_){}}
{const _apL=aplicarPrefs;aplicarPrefs=function(){const r=_apL.apply(this,arguments);try{lgaAplicar()}catch(_){}return r}}
{const _dA=defAparencia;defAparencia=function(){const h=_dA.apply(this,arguments);const cur=(S.cfg.logoAnim)||'auto';const tpl=document.querySelector('#splash-tpl');const svg=tpl?tpl.innerHTML.split('<div class="spn">')[0]:'';
  return h+`<div class="card"><h2>${ic('sparkle',18)} Logótipo Animado</h2><p class="hint" style="margin-top:0">Aparece ao abrir a app e enquanto sincroniza.</p><div class="lgag">${LGA.map(([k,l,d])=>`<button type="button" class="lgao ${cur===k?'on':''}" data-lga="${k}" aria-pressed="${cur===k}"><span class="lgap lgv-${k==='auto'?(S.cfg.estilo==='sge'?'sge':'classico'):k}">${svg}</span><b>${l}</b><small>${d}</small></button>`).join('')}</div></div>`}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lga]');if(!b)return;S.cfg.logoAnim=b.dataset.lga;save();lgaAplicar();document.querySelectorAll('[data-lga]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});toast('Logótipo animado: '+b.querySelector('b').textContent,'ok')});
setTimeout(()=>{try{lgaAplicar()}catch(_){}},200);
/* ecrã do código: painel com hora e data ao lado do teclado (ecrãs largos) */
function pinLado(){const L=document.querySelector('#login.pinmode');if(!L||L.querySelector('.pinside'))return;const esc_=S&&S.escolas?null:null;
  const e=(()=>{try{return escolaPorId(escAtiva())}catch(_){return null}})();const nome=(()=>{try{return nomeEscola(e)}catch(_){return ''}})();
  L.insertAdjacentHTML('afterbegin',`<div class="pinside" aria-hidden="true"><div class="pshr" id="ps-h"></div><div class="psd" id="ps-d"></div>${nome?`<div class="pse">${e&&e.logo?`<img src="${e.logo}" alt="">`:''}<span>${esc(nome)}</span></div>`:''}</div>`);
  const tk=()=>{const h=document.getElementById('ps-h');if(!h){clearInterval(L._pt);return}const d=new Date();h.textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');document.getElementById('ps-d').textContent=d.toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'})};tk();L._pt=setInterval(tk,5000)}
new MutationObserver(()=>{if(document.querySelector('#login.pinmode'))pinLado()}).observe(document.body,{childList:true,subtree:false,attributes:true,attributeFilter:['class']});
setInterval(()=>{if(document.querySelector('#login.pinmode:not(:has(.pinside))'))pinLado()},700);

