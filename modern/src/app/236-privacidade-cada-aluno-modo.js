/* ===================== v1.043 · Privacidade de cada aluno no Modo de Apresentação =====================
   Tudo fica à mostra, mas para cada aluno o professor pode esconder só as NOTAS (classificações, percentagens, níveis, gráficos
   da sua linha, cartão ou ficha), só a FOTOGRAFIA, ou TUDO (= alunos ocultos da 1.026). Guardado por aluno em S.cfg.apres.privAl
   ({id:{n:1,f:1}}), vale em todas as turmas onde o aluno aparece (mesmo nome). O nome continua visível nos modos «notas» e «foto». */
const apPV=()=>{const g=S.cfg.apres||(S.cfg.apres=apresCfg());const p=g.privAl;return g.privAl=(p&&typeof p==='object'&&!Array.isArray(p))?p:{}};
let APV={rx:null,map:new Map(),ids:{}};
const AP_GR=/^\s*(?:[<>≥≤]?\s*\d{1,3}(?:[.,]\d+)?\s*%?|\d{1,2}(?:[.,]\d+)?\s*(?:val(?:ores)?\.?|v)|n[ií]vel\s*\d|muito\s+bom|bom|suficiente|insuficiente|muito\s+insuficiente|excelente|fraco|satisfaz(?:\s+(?:bem|plenamente|pouco))?|n[aã]o\s+satisfaz|mb|mi|ns|sb|sp)\s*$/i;
const AP_GR2=/\d{1,3}(?:[.,]\d+)?\s*%|classifica|n[ií]vel\s*\d|\bnotas?\b|m[eé]dia|\bvalores\b|men[cç][aã]o/i;
function apPvPrep(){const P=apPV();const a=A();const M=new Map();APV={rx:null,map:M,ids:{},nums:new Set()};if(!a)return;
  const oc=new Set(apresCfg().ocultos||[]);const all=[];(a.turmas.__real||a.turmas).forEach(t=>(t.alunos||[]).forEach(x=>{if(x.nome&&x.nome.trim().length>2)all.push(x)}));
  const byK={};all.forEach(x=>{const p=P[x.id]||(x.origemId&&P[x.origemId]);if(!p||!(p.n||p.f)||oc.has(x.id))return;const k=apKey(x.nome);const o=byK[k]||(byK[k]={n:false,f:false,nums:new Set()});o.n=o.n||!!p.n;o.f=o.f||!!p.f});
  all.forEach(x=>{const o=byK[apKey(x.nome)];if(o){APV.ids[x.id]=o;if(x.num!=null&&x.num!==''){o.nums.add(String(x.num));APV.nums.add(String(x.num))}}});
  const byF={};all.forEach(x=>{const f=apKey(x.nome.trim().split(/\s+/)[0]);(byF[f]=byF[f]||new Set()).add(apKey(x.nome))});
  Object.keys(byK).forEach(k=>{const o=byK[k];const p=k.split(' ');M.set(k,o);if(p.length>2)M.set(p[0]+' '+p[p.length-1],o);if(p.length>1)M.set(p[0]+' '+p[p.length-1][0]+'.',o);if(p[0].length>2&&byF[p[0]]&&byF[p[0]].size===1)M.set(p[0],o)});
  const ks=[...M.keys()].sort((x,y)=>y.length-x.length).map(apEsc);
  try{APV.rx=ks.length?new RegExp('(?<![\\p{L}\\p{N}])(?:'+ks.join('|')+')(?![\\p{L}\\p{N}])','giu'):null}catch(_){APV.rx=ks.length?new RegExp('(?:'+ks.join('|')+')','gi'):null}}
function apPvFolhas(box,o){o=o||{nums:APV.nums||new Set()};box.querySelectorAll('*').forEach(e=>{if(e.children.length||/^(SCRIPT|STYLE|SVG|svg|path)$/.test(e.tagName))return;const tx=(e.textContent||'').trim();if(!tx||tx.length>90||o&&o.nums.has(tx))return;if(tx.length<=24&&AP_GR.test(tx)||AP_GR2.test(tx))e.classList.add('apgr')});
  box.querySelectorAll('input:not([type=checkbox]):not([type=radio]),select').forEach(e=>{const v=String(e.value||'').trim();if(v&&AP_GR.test(v)&&!(o&&o.nums.has(v))&&e.dataset.k!=='num')e.classList.add('apgr')})}
function apPvLinha(tr,o){[...tr.children].forEach(td=>{const tx=(td.textContent||'').trim();if(td.matches('.nm,.stk,.stk0,.stc0,.stc1,.tdnome,.n,.c-n,.c-ft,.pnnm')||td.querySelector('img,.ava,textarea[data-k="nome"],input[data-k="num"],.pnnm')||o.nums.has(tx))td.classList.add('apnm')})}
function apPvBox(el,o){if(el.closest('#dw-t')){const b=document.getElementById('dw-b');if(b){if(o.n){b.classList.add('apres-pnd');apPvFolhas(b,o)}if(o.f)b.classList.add('apres-pfd')}return}
  const box=el.closest('tr,.fgc,.fcard,.mscard,.pls,.pnai,.intr,.avit,.tcard,.cvcard,.lin,.sti,.mac,.aniv,li,.kv,.chip,.rmini,.dimp,.pq-i,[data-mq]');if(!box||box.closest('[data-apno]'))return;
  if(o.n)box.classList.add('apres-pn');if(o.f)box.classList.add('apres-pf');
  if(box.tagName==='TR'){const td=el.closest('td,th');if(td)td.classList.add('apnm');if(o.n)apPvLinha(box,o)}else if(o.n)apPvFolhas(box,o)}
function apPvTexto(n){if(!APV.rx)return;const v=n.nodeValue;if(!v||v.length<3)return;const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.tagName)||p.closest('[data-apno],#emteste'))return;
  APV.rx.lastIndex=0;const m=v.match(APV.rx);if(!m)return;for(const s of m){const o=APV.map.get(apKey(s));if(o){apPvBox(p,o);return}}}
function apPvAplicar(root){if(!APV.rx||!root||root.nodeType!==1)return;if(root.closest&&root.closest('[data-apno],#emteste'))return;
  Object.keys(APV.ids).forEach(id=>{const o=APV.ids[id];const q=CSS.escape(id);const s=`tr[data-a="${q}"],tr[data-pna="${q}"],tr[data-fi="${q}"],.fgc[data-fi="${q}"],.fcard[data-fi="${q}"],.mscard[data-fi="${q}"],[data-pla="${q}"]`;
    const L=[...(root.matches(s)?[root]:[]),...root.querySelectorAll(s)];L.forEach(e=>{if(o.n)e.classList.add('apres-pn');if(o.f)e.classList.add('apres-pf');if(e.tagName==='TR'){if(o.n)apPvLinha(e,o)}else if(o.n)apPvFolhas(e,o)})});
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const L=[];let n;while(n=w.nextNode()){const v=n.nodeValue;if(v&&v.length>2){APV.rx.lastIndex=0;if(APV.rx.test(v))L.push(n)}}L.forEach(apPvTexto);
  const dw=root.closest&&root.closest('#dw-b.apres-pnd');if(dw)apPvFolhas(root,null);else if(root.id==='dw-b'&&root.classList.contains('apres-pnd'))apPvFolhas(root,null)}
{const _pp=apresPrep;apresPrep=function(){const r=_pp.apply(this,arguments);try{apPvPrep()}catch(e){console.warn(e)}return r}}
{const _pa=apresAplicar;apresAplicar=function(root){if(apOn()){try{apPvAplicar(root&&root.nodeType===1?root:document.body)}catch(e){console.warn(e)}}return _pa.apply(this,arguments)}}
{const _pt=apTexto;apTexto=function(n){if(apOn()){try{apPvTexto(n)}catch(_){}}return _pt.apply(this,arguments)}}
{const _pc=apresClasses;apresClasses=function(on){if(!on){document.querySelectorAll('.apres-pn,.apres-pf,.apnm,.apgr,.apres-pnd,.apres-pfd').forEach(e=>e.classList.remove('apres-pn','apres-pf','apnm','apgr','apres-pnd','apres-pfd'));APV={rx:null,map:new Map(),ids:{}}}return _pc.apply(this,arguments)}}
{const _pd=openDrawer;openDrawer=function(){try{const d=document.getElementById('dw-b');if(d)d.classList.remove('apres-pnd','apres-pfd')}catch(_){}return _pd.apply(this,arguments)}}
/* janela do modo de apresentação: cada aluno com Notas · Fotografia · Tudo */
function apPvUI(){const box=document.querySelector('#dw-b .apdlg');if(!box)return;const L=[...box.querySelectorAll('input[data-apo]')];if(!L.length)return;const P=apPV();const t=T();
  const lista=L[0].closest('.apal');
  [...box.querySelectorAll('h3')].forEach(h=>h.childNodes.forEach(c=>{if(c.nodeType===3&&/Alunos a ocultar/.test(c.nodeValue))c.nodeValue=' Privacidade de Cada Aluno '}));
  const hp=lista.previousElementSibling&&lista.previousElementSibling.previousElementSibling;if(hp&&hp.matches('p.hint'))hp.innerHTML='Por omissão, <b>tudo fica à mostra</b>. Para o aluno que não quer que a turma veja a sua informação, escolha o que esconder: <b>Notas</b> (classificações, percentagens, níveis e gráficos da linha, do cartão e da ficha desse aluno — o nome continua visível), <b>Foto</b> (só a fotografia) ou <b>Tudo</b> (o aluno fica totalmente oculto em todos os menus). Vale em todas as turmas onde o aluno aparece.';
  const rowB=box.querySelector('#ap-nen')&&box.querySelector('#ap-nen').parentElement;
  if(rowB&&!rowB.querySelector('#ap-pvn')){rowB.insertAdjacentHTML('beforeend',`<button type="button" class="btn sm" id="ap-pvn">${ic('eye',13)} Notas de Todos</button>`)}
  lista.classList.add('appv');
  L.forEach(inp=>{const lb=inp.closest('label');if(!lb||lb.dataset.pv)return;lb.dataset.pv=1;const id=inp.dataset.apo;const p=P[id]||{};
    const nm=lb.querySelector('span');const div=document.createElement('div');div.className='appv-r';div.dataset.pvid=id;
    div.innerHTML=`<span class="appv-n">${nm?nm.innerHTML:''}</span><span class="appv-b" role="group" aria-label="O que esconder"><button type="button" data-pvk="n" aria-pressed="${!!p.n}">Notas</button><button type="button" data-pvk="f" aria-pressed="${!!p.f}">Foto</button><button type="button" data-pvk="t" aria-pressed="${inp.checked}">Tudo</button></span>`;
    lb.replaceWith(div);inp.hidden=true;inp.style.display='none';div.appendChild(inp);div.classList.toggle('tudo',inp.checked);div.classList.toggle('algum',inp.checked||!!p.n||!!p.f)});
  const marca=div=>{const inp=div.querySelector('input[data-apo]');div.querySelector('[data-pvk="t"]').setAttribute('aria-pressed',String(inp.checked));div.classList.toggle('tudo',inp.checked);
    div.classList.toggle('algum',inp.checked||[...div.querySelectorAll('[data-pvk="n"],[data-pvk="f"]')].some(b=>b.getAttribute('aria-pressed')==='true'))};
  const sugAuto=()=>{const au=document.getElementById('ap-auto');if(au&&t&&apTM()[t.id]==null&&[...lista.querySelectorAll('.appv-r.algum')].length)au.checked=true};
  lista.addEventListener('click',e=>{const b=e.target.closest('[data-pvk]');if(!b)return;const div=b.closest('.appv-r');const inp=div.querySelector('input[data-apo]');
    if(b.dataset.pvk==='t'){inp.checked=!inp.checked;inp.dispatchEvent(new Event('change',{bubbles:true}))}else b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));marca(div);sugAuto()});
  lista.addEventListener('change',e=>{const div=e.target.closest('.appv-r');if(div)marca(div)});
  const nen=document.getElementById('ap-nen');if(nen)nen.addEventListener('click',()=>{lista.querySelectorAll('[data-pvk="n"],[data-pvk="f"]').forEach(b=>b.setAttribute('aria-pressed','false'));lista.querySelectorAll('.appv-r').forEach(marca)});
  const tod=document.getElementById('ap-tod');if(tod)tod.addEventListener('click',()=>lista.querySelectorAll('.appv-r').forEach(marca));
  const pvn=document.getElementById('ap-pvn');if(pvn)pvn.onclick=()=>{const bs=[...lista.querySelectorAll('[data-pvk="n"]')];const v=!bs.every(b=>b.getAttribute('aria-pressed')==='true');bs.forEach(b=>b.setAttribute('aria-pressed',String(v)));lista.querySelectorAll('.appv-r').forEach(marca);sugAuto()};
  const ok=document.getElementById('ap-ok');if(ok)ok.addEventListener('click',()=>{lista.querySelectorAll('.appv-r').forEach(div=>{const id=div.dataset.pvid;const n=div.querySelector('[data-pvk="n"]').getAttribute('aria-pressed')==='true',f=div.querySelector('[data-pvk="f"]').getAttribute('aria-pressed')==='true';if(n||f)P[id]={n:n?1:0,f:f?1:0};else delete P[id]})},true)}
{const _pdl=apresDlg;apresDlg=function(){const r=_pdl.apply(this,arguments);try{apPvUI()}catch(e){console.warn(e)}return r}}
try{const h=AJUDA.find(x=>x.id==='apresentacao');if(h)h.txt+=`<p><b>Privacidade de cada aluno:</b> na janela do modo de apresentação, cada aluno tem três botões — <b>Notas</b> esconde só as classificações, percentagens, níveis e gráficos desse aluno (o nome continua visível, para projetar as notas da turma sem expor quem não quer); <b>Foto</b> esconde só a fotografia; <b>Tudo</b> oculta o aluno por completo. Pode combinar Notas e Foto, e usar <b>Notas de Todos</b> para esconder as notas da turma inteira. A escolha fica guardada para esse aluno.</p>`}catch(_){}
try{const h=AJUDA.find(x=>x.id==='planta');const add=`<p><b>Desenhar a sala (1.048):</b> em <b>Desenhar a Sala</b> escolha um modelo (Filas, Pares, Grupos de 4, Em U, U Duplo, Exame) ou desenhe à mão com o pincel — Lugar, Corredor/Vazio, <b>Secretária do Professor</b>, Porta e Janela — tocando ou arrastando sobre as casas. Depois, em <b>Lugares</b>, distribua por número, alfabética, aleatória, <b>dificuldades à frente</b> (mais perto da secretária), <b>turma mista</b> (alterna alunos com mais e menos dificuldades) ou <b>necessidades à frente</b> (MSAI, acomodação «localização na sala», notas). O alfinete fixa o lugar de um aluno: não muda ao distribuir.</p>`;if(h)h.txt+=add}catch(_){}
