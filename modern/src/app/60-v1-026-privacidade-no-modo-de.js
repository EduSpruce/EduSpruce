/* ===================== v1.026 · Privacidade no Modo de Apresentação (memória por turma, instantânea em todos os menus) =====================
   O modo de apresentação passa a ter memória por turma: cada turma guarda as suas definições (nomes, fotografias, dados sensíveis,
   informação do professor) e pode ligar-se sozinho ao abrir a turma. Os alunos que pediram para não mostrar a sua informação ficam
   ocultos em TODOS os menus, janelas, avisos, listas pendentes, dicas e até no que é desenhado (roda do sorteio), no instante em que
   aparecem no ecrã (observador do documento, antes de o ecrã ser pintado). Tocar no olho com o modo ligado abre as definições —
   não mostra nada — e «Mostrar tudo» é a única forma de sair. */
const apTM=()=>{const g=S.cfg.apresT;return S.cfg.apresT=(g&&typeof g==='object'&&!Array.isArray(g))?g:{}};
function apC(id){const g=apresCfg();const m=apTM()[id||S.turmaAtiva]||{};
  return {nomes:m.nomes||g.nomes||'primeiro',fotos:m.fotos||g.fotos||'mostrar',sens:m.sens!=null?m.sens:g.sens!==false,prof:m.prof!=null?m.prof:g.prof!==false,ocultos:g.ocultos||[],auto:!!m.auto}}
const apOn=()=>document.body.classList.contains('apres');
const apKey=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const apEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+');
let APRES_SEL='';
apresPrep=function(){const c=apC();const a=A();const M=new Map();const oc=new Set(c.ocultos||[]);const H=[];const ids=new Set(oc);
  if(a){const all=[];(a.turmas.__real||a.turmas).forEach(t=>(t.alunos||[]).forEach(x=>{if(x.nome&&x.nome.trim().length>2)all.push(x)}));
    const ocN=new Set(all.filter(x=>oc.has(x.id)||(x.origemId&&oc.has(x.origemId))).map(x=>apKey(x.nome)));
    all.forEach(x=>{if(ocN.has(apKey(x.nome)))ids.add(x.id)});
    const byF={};all.forEach(x=>{const f=apKey(x.nome.trim().split(/\s+/)[0]);(byF[f]=byF[f]||new Set()).add(apKey(x.nome))});
    const put=(k,d,h)=>{k=apKey(k);if(k.length<3)return;const o=M.get(k);if(o&&o.h&&!h)return;if(o&&!o.h&&!h&&o.d!==d)return;M.set(k,{d,h})};
    all.forEach(x=>{const nm=x.nome.trim().replace(/\s+/g,' ');const p=nm.split(' ');const h=ocN.has(apKey(nm));let d;
      if(h)d='Aluno(a) oculto(a)';else if(c.nomes==='iniciais')d=p.filter(w=>w.length>2||/^[A-ZÁÉÍÓÚ]/.test(w)).map(w=>w[0].toUpperCase()).join('.')+'.';
      else if(c.nomes==='ocultar')d='Aluno(a) n.º '+(x.num||'?');else if(c.nomes==='completo')d=nm;else d=byF[apKey(p[0])].size>1&&p.length>1?p[0]+' '+p[p.length-1][0]+'.':p[0];
      if(d!==nm)put(nm,d,h);
      if(p.length>2&&(h||c.nomes==='iniciais'||c.nomes==='ocultar'))put(p[0]+' '+p[p.length-1],d,h);
      if(h){if(p.length>1)put(p[0]+' '+p[p.length-1][0]+'.',d,h);const f=apKey(p[0]);if([...byF[f]].every(n=>ocN.has(n)))put(p[0],d,h);H.push(nm)}})}
  APRES_MAP=M;const ks=[...M.keys()].sort((x,y)=>y.length-x.length).map(apEsc);
  try{APRES_RX=ks.length?new RegExp('(?<![\\p{L}\\p{N}])(?:'+ks.join('|')+')(?![\\p{L}\\p{N}])','giu'):null}catch(_){APRES_RX=ks.length?new RegExp('(?:'+ks.join('|')+')','gi'):null}
  APRES_SEL=[...ids].map(id=>{const q=CSS.escape(id);return `[data-a="${q}"],[data-fi="${q}"],[data-al="${q}"],[data-aid="${q}"],[data-aluno="${q}"]`}).join(',');
  apresPrep.ids=ids;apresPrep.hid=H};
function apTroca(v){let h=false;APRES_RX.lastIndex=0;const r=v.replace(APRES_RX,m=>{const o=APRES_MAP.get(apKey(m));if(!o)return m;if(o.h)h=true;return o.d});return {r,h}}
apresMarcar=function(el){if(!el||!el.closest||el.closest('[data-apno]'))return;const box=el.closest('tr,.intr,.fgc,.pnai,.dfa,.sti,.mac,.aniv,.fcard,.mscard,.lin,.cdr,.sheet,.rmini,li,.dimp,.pq-i,.kv,.avit,.tcard,.cvcard,.rcard,.nlb,.chip,label,.mq-it,[data-mq]');
  if(box)box.classList.add('apres-oc');else{const d=el.closest('#dw-b,dialog,#avpop,.pop,.popover');if(d)d.classList.add('apres-oc')}};
function apTexto(n){const v=n.nodeValue;if(!v||v.length<3||!APRES_RX)return;const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.tagName))return;APRES_RX.lastIndex=0;if(!APRES_RX.test(v))return;
  if(p.tagName==='OPTION'&&!p.hasAttribute('value'))p.setAttribute('value',p.textContent);const o=apTroca(v);n.nodeValue=o.r;if(o.h)apresMarcar(p.tagName==='OPTION'?p.closest('select')||p:p)}
const AP_ATTR=['title','aria-label','alt','placeholder','data-v','data-tip','data-title'];
function apAtrib(e){if(!APRES_RX||!e.getAttribute)return;for(const at of AP_ATTR){const v=e.getAttribute(at);if(!v||v.length<3)continue;APRES_RX.lastIndex=0;if(!APRES_RX.test(v))continue;const o=apTroca(v);e.setAttribute(at,o.r);
    if(e.tagName==='IMG'){e.classList.add('apres-fimg');if(o.h)e.classList.add('apres-ocimg')}if(o.h)apresMarcar(e)}}
function apValor(e){if(!APRES_RX||e.dataset.apv||e.type==='password'||e.type==='file')return;const v=e.value;if(!v||v.length<3)return;APRES_RX.lastIndex=0;if(!APRES_RX.test(v))return;
  const o=apTroca(v);e.dataset.apv=1;e.readOnly=true;e.value=o.r;const wr=e.closest('.nmw');if(wr)wr.dataset.v=o.r;if(o.h)apresMarcar(e)}
apresAplicar=function(root){if(!apOn())return;root=root&&root.nodeType===1?root:document.body;if(root.closest&&root.closest('#emteste'))return;
  if(root.matches&&root.matches('[contenteditable="true"]')){root.setAttribute('contenteditable','false');root.dataset.apce=1}
  root.querySelectorAll('[contenteditable="true"]').forEach(e=>{e.setAttribute('contenteditable','false');e.dataset.apce=1});
  if(APRES_SEL){try{if(root.matches&&root.matches(APRES_SEL))root.classList.add('apres-oc');root.querySelectorAll(APRES_SEL).forEach(e=>e.classList.add('apres-oc'))}catch(_){}}
  if(!APRES_RX)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const L=[];let n;while(n=w.nextNode()){const v=n.nodeValue;if(v&&v.length>2){APRES_RX.lastIndex=0;if(APRES_RX.test(v))L.push(n)}}L.forEach(apTexto);
  apAtrib(root);root.querySelectorAll('[title],[aria-label],img[alt],[placeholder],[data-v],[data-tip],[data-title]').forEach(apAtrib);
  if(/^(INPUT|TEXTAREA)$/.test(root.tagName))apValor(root);root.querySelectorAll('input,textarea').forEach(apValor)};
let AP_MO=null,AP_IV=null;
function apObservar(on){if(AP_MO){AP_MO.disconnect();AP_MO=null}clearInterval(AP_IV);AP_IV=null;if(!on)return;
  AP_MO=new MutationObserver(L=>{if(!apOn())return;for(const r of L){try{
      if(r.type==='childList')r.addedNodes.forEach(n=>{if(n.nodeType===3)apTexto(n);else if(n.nodeType===1)apresAplicar(n)});
      else if(r.type==='characterData')apTexto(r.target);else if(r.type==='attributes'){if(r.attributeName==='contenteditable'&&r.target.getAttribute('contenteditable')==='true'){r.target.setAttribute('contenteditable','false');r.target.dataset.apce=1}else apAtrib(r.target)}}catch(_){}}});
  AP_MO.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:AP_ATTR.concat(['contenteditable'])});
  /* valores escritos por código (sem mudança no documento) */
  AP_IV=setInterval(()=>{if(!apOn()||!APRES_RX)return;document.querySelectorAll('input:not([data-apv]),textarea:not([data-apv])').forEach(e=>{if(e!==document.activeElement)apValor(e)})},600)}
/* o que é desenhado (ex.: roda do sorteio) também passa pelo filtro */
{const P=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;if(P)['fillText','strokeText'].forEach(fn=>{const o=P[fn];if(!o||o.__ap)return;const w=function(t,...r){try{if(APRES_RX&&typeof t==='string'&&document.body.classList.contains('apres'))t=apTroca(t).r}catch(_){}return o.call(this,t,...r)};w.__ap=1;P[fn]=w})}
apresClasses=function(on){const c=apC();const b=document.body.classList;b.toggle('apres',on);b.toggle('apres-sens',on&&c.sens);b.toggle('apres-prof',on&&c.prof);b.toggle('apres-fotos',on&&c.fotos==='ocultar');
  const bt=$('#apresBtn');if(bt){bt.classList.toggle('on',on);bt.title=on?'Modo de apresentação ligado — toque para as definições':'Modo de apresentação';bt.setAttribute('aria-pressed',String(on))}
  if(!on){document.querySelectorAll('[data-apce]').forEach(e=>{e.setAttribute('contenteditable','true');delete e.dataset.apce});document.querySelectorAll('.apres-oc,.apres-ocimg,.apres-fimg').forEach(e=>e.classList.remove('apres-oc','apres-ocimg','apres-fimg'))}
  apObservar(on);if(on){apresPrep();apresAplicar(document.body)}};
alternarApresentacao=function(){apresDlg()};
apresDlg=function(){const on=apOn();const t=T();const c=apC();const g=apresCfg();const al=t?alunosTodos(t):[];const oc=new Set(g.ocultos||[]);
  const op=(k,v,l)=>`<button type="button" data-ap="${k}" data-v="${v}" class="${c[k]===v?'on':''}" aria-pressed="${c[k]===v}">${l}</button>`;
  const temOc=al.some(x=>oc.has(x.id));
  openDrawer(on?'Modo de Apresentação · Ligado':'Modo de Apresentação',`<div class="ed apdlg" data-apno>
    ${on?`<div class="apon">${ic('eye',18)}<div><b>Continua a projetar com a informação protegida.</b><br><span>Nada foi mostrado. Mude o que precisar e toque em <b>Aplicar</b>. Para voltar a ver tudo, use <b>Mostrar Tudo</b> (fim do modo de apresentação).</span></div></div>`
      :`<p class="hint" style="margin-top:0">Para projetar na aula sem expor dados pessoais. Nada é alterado nos seus dados — só o que se vê no ecrã.</p>`}
    ${t?`<p class="aptur">${anoBadge(t,'sm')} <span><b>Turma ${esc(t.nome)}</b> · ${esc(t.disciplina)}<br><span class="mut">Estas definições ficam guardadas só para esta turma (cada turma tem a sua memória).</span></span></p>`:''}
    <label>Nomes dos alunos</label><div class="seg">${op('nomes','primeiro','Primeiro Nome')}${op('nomes','iniciais','Iniciais')}${op('nomes','ocultar','Só o N.º')}${op('nomes','completo','Completos')}</div>
    <label style="margin-top:12px">Fotografias dos alunos</label><div class="seg">${op('fotos','mostrar','Mostrar')}${op('fotos','ocultar','Desfocar')}</div>
    <label class="chk" style="margin-top:14px"><input type="checkbox" id="ap-sens" ${c.sens?'checked':''}> <span><b>Ocultar dados sensíveis dos alunos</b><br><span class="mut">N.º de processo, data de nascimento e idade, repetência, ASE, medidas (MSAI / DL 54), encarregado de educação e contactos, observações.</span></span></label>
    <label class="chk" style="margin-top:8px"><input type="checkbox" id="ap-prof" ${c.prof?'checked':''}> <span><b>Proteger a informação do professor</b><br><span class="mut">Esconde reuniões e lembretes, o seu horário, definições e escola, avisos de cópias, a pesquisa e a troca para outras turmas.</span></span></label>
    ${t?`<label class="chk" style="margin-top:8px"><input type="checkbox" id="ap-auto" ${c.auto||temOc&&apTM()[t.id]==null?'checked':''}> <span><b>Ligar sempre ao abrir esta turma</b><br><span class="mut">Para turmas com alunos que nunca querem ver a sua informação projetada: o modo liga-se sozinho quando abre a turma ou entra na app com ela.</span></span></label>`:''}
    ${al.length?`<h3>${ic('user',15)} Alunos a ocultar <span class="mut" style="font-weight:500">— ${esc(t.nome)}</span></h3><p class="hint" style="margin-top:0">Ficam totalmente ocultos em todos os menus (nome, notas, fotografia, ficha, relatório, sorteio) — para quem não quer que a turma veja a sua informação.${on?' Com o modo ligado, os alunos ocultos aparecem aqui só pelo número.':''}</p>
      <div class="row" style="gap:6px;margin-bottom:6px"><button type="button" class="btn sm" id="ap-nen">Nenhum</button><button type="button" class="btn sm" id="ap-tod">Todos</button></div>
      <div class="apal">${al.map(x=>`<label class="chk"><input type="checkbox" data-apo="${x.id}" ${oc.has(x.id)?'checked':''}> <span><b>${esc(numAl(x))}</b> ${on&&oc.has(x.id)?'<i class="mut">oculto(a)</i>':esc(x.nome)}</span></label>`).join('')}</div>`:''}
    <div class="row apbt" style="margin-top:16px">${on?`<button class="btn pri" id="ap-ok">${ic('check',15)} Aplicar</button><span class="sp1"></span><button class="btn" id="ap-sair">${ic('eye',15)} Mostrar Tudo (sair do modo)</button>`:`<button class="btn pri" id="ap-ok">${ic('access',15)} Iniciar Apresentação</button>`}</div></div>`);
  const tmp={nomes:c.nomes,fotos:c.fotos};
  $$('[data-ap]').forEach(b=>b.onclick=()=>{tmp[b.dataset.ap]=b.dataset.v;$$(`[data-ap="${b.dataset.ap}"]`).forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',String(x===b))})});
  const au=$('#ap-auto');let auTocado=apTM()[t?t.id:'']!=null;if(au)au.addEventListener('change',()=>{auTocado=true});
  const auSug=()=>{if(au&&!auTocado)au.checked=$$('[data-apo]').some(x=>x.checked)};$$('[data-apo]').forEach(x=>x.addEventListener('change',auSug));
  const tod=v=>{$$('[data-apo]').forEach(x=>x.checked=v);auSug()};if($('#ap-nen')){$('#ap-nen').onclick=()=>tod(false);$('#ap-tod').onclick=()=>tod(true)}
  $('#ap-ok').onclick=()=>{const m={nomes:tmp.nomes,fotos:tmp.fotos,sens:$('#ap-sens').checked,prof:$('#ap-prof').checked,auto:!!($('#ap-auto')&&$('#ap-auto').checked)};
    Object.assign(g,{nomes:m.nomes,fotos:m.fotos,sens:m.sens,prof:m.prof});if(t)apTM()[t.id]=m;
    if(al.length){const ids=new Set(al.map(x=>x.id));g.ocultos=(g.ocultos||[]).filter(id=>!ids.has(id)).concat($$('[data-apo]').filter(x=>x.checked).map(x=>x.dataset.apo))}
    save();closeDrawer();apresClasses(true);if(m.prof&&APRES_BLOQ.includes(VIEW))go('inicio');else go(VIEW);
    const n=al.filter(x=>(g.ocultos||[]).includes(x.id)).length;try{audit('Apresentação',on?'Definições do modo de apresentação alteradas':'Modo de apresentação ligado',t?t.nome:'')}catch(_){}
    toast((on?'Definições aplicadas':'Modo de apresentação ligado')+(n?' · '+n+(n===1?' aluno oculto':' alunos ocultos'):'')+(on?'':' — toque no olho para as definições'),'ok')};
  const sx=$('#ap-sair');if(sx)sx.onclick=()=>{closeDrawer();apresClasses(false);go(VIEW);try{audit('Apresentação','Modo de apresentação desligado (mostrar tudo)',t?t.nome:'')}catch(_){}toast('Modo de apresentação desligado — tudo visível','ok')}};
/* cada janela lateral começa limpa (a desfocagem de uma ficha de aluno oculto não passa para a janela seguinte) */
{const _oDa=openDrawer;openDrawer=function(){try{const d=document.getElementById('dw-b');if(d)d.classList.remove('apres-oc')}catch(_){}return _oDa.apply(this,arguments)}}
/* memória por turma: ao entrar numa turma com «ligar sempre», o modo liga-se ANTES de a página ser desenhada; nunca se desliga sozinho */
{let _apT;const _gAp=go;go=function(v){try{const id=S.turmaAtiva||null;if(id!==_apT){_apT=id;const m=id&&apTM()[id];if(m&&m.auto&&!apOn()){apresPrep();apresClasses(true);setTimeout(()=>toast('Modo de apresentação ligado — esta turma tem alunos ocultos','ok'),60)}else if(apOn()){apresPrep();apresClasses(true)}}}catch(e){console.warn(e)}
  return _gAp.apply(this,arguments)};if(_gAp._f)go._f=_gAp._f}
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

/* ===================== v1.026 · Modo «Em teste»: abaixo da turma, só quando há teste — relógio, temporizador e nome do teste =====================
   Aparece no menu, por baixo da turma, no dia de um teste (instrumento do tipo teste, prova escrita ou questão-aula com a data de hoje)
   e só na janela das aulas dessa turma (se houver horário). Abre um ecrã para projetar: hora certa, tempo que falta, hora de fim,
   tempo adicional (sem nomes) e regras. Leve: atualiza uma vez por segundo, sem animações pesadas. */
const EMT=()=>S.emt=(S.emt&&typeof S.emt==='object')?S.emt:{};
const emtEhTeste=i=>{try{const ab=TIPO_AB(i.tipo||'');return ab==='T'||/^Q/.test(ab)}catch(_){return /teste|prova escrita|quest/i.test(i.tipo||'')}};
function emtBlocos(a,t,d){d=d||new Date();try{const H=a.horProf;if(!H||!Array.isArray(H.aulas))return [];const L=H.aulas.filter(x=>x.dia===d.getDay()&&(H.mapa||{})[chaveAula(x)]===t.id).map(x=>({ini:+x.ini,fim:+x.fim,sala:x.sala||''})).sort((p,q)=>p.ini-q.ini);
    const B=[];L.forEach(x=>{const u=B[B.length-1];if(u&&x.ini-u.fim<=15){u.fim=Math.max(u.fim,x.fim)}else B.push({...x})});return B}catch(_){return []}}
function emtHoje(){const a=A();if(!a)return [];const hj=isoData(new Date());const now=new Date();const mn=now.getHours()*60+now.getMinutes();const R=[];
  (a.turmas||[]).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(i.data!==hj||!emtEhTeste(i))return;const B=emtBlocos(a,t,now);const st=EMT()[i.id];
    if(B.length&&!(st&&st.ini&&!st.fechado)){const ok=B.some(b=>mn>=b.ini-60&&mn<=b.fim+30);if(!ok)return}R.push({t,i,B})}));return R}
function emtNav(){document.querySelectorAll('#side .emtnav').forEach(e=>e.remove());const L=emtHoje();emtNav._k=L.map(o=>o.i.id).join();if(!L.length)return;
  const tree=$('#tTree');L.forEach(o=>{const st=EMT()[o.i.id];const corre=st&&st.ini&&!st.pz;
    const html=`<button type="button" class="nav emtnav ${corre?'corre':''}" data-emt="${o.i.id}" data-emtt="${o.t.id}" title="Em teste: ${esc(o.i.nome)} — ${esc(o.t.nome)} · ${esc(o.t.disciplina)}"><span class="emtdot" aria-hidden="true"></span><span class="lbl"><b>Em teste</b><span class="tdisc">${esc(o.i.nome)} · ${esc(o.t.nome)}</span></span></button>`;
    let ref=null;if(tree&&tree.children.length&&!tree.classList.contains('uma')){ref=tree.querySelector(`.tnode[data-tt="${CSS.escape(o.t.id)}"]`)||[...tree.querySelectorAll('.tnode.tgrp')].find(b=>(b.dataset.tgk||'').split('|')[0]===o.t.nome);
      if(ref){let n=ref;while(n.nextElementSibling&&n.nextElementSibling.matches('.tdsel,.tkids,.emtnav'))n=n.nextElementSibling;n.insertAdjacentHTML('afterend',html);return}}
    if(tree&&tree.classList.contains('uma'))tree.insertAdjacentHTML('afterbegin',html);else{const h=$('#navTurmas')||$('#grpT');if(h)h.insertAdjacentHTML('afterend',html)}});
  document.querySelectorAll('#side .emtnav').forEach(b=>b.onclick=e=>{e.stopPropagation();emtAbrir(b.dataset.emt,b.dataset.emtt)})}
{const _nTe=navTurmas;navTurmas=function(){const r=_nTe.apply(this,arguments);clearTimeout(navTurmas._emt);navTurmas._emt=setTimeout(()=>{try{emtNav();ufcdRotulos()}catch(e){console.warn(e)}},0);return r}}
setInterval(()=>{try{const k=emtHoje().map(o=>o.i.id).join();if(k!==emtNav._k)emtNav()}catch(_){}},60000);
/* a árvore das turmas é redesenhada por vários passos: volta a pôr «Em teste» no sítio certo sempre que muda */
{let _emtMo=null;const liga=()=>{const tr=document.getElementById('tTree');if(!tr||_emtMo)return;_emtMo=new MutationObserver(L=>{const so=L.every(r=>[...r.addedNodes,...r.removedNodes].every(n=>n.nodeType!==1||n.classList.contains('emtnav')));if(so)return;clearTimeout(liga._t);liga._t=setTimeout(()=>{try{emtNav();ufcdRotulos()}catch(_){}},0)});_emtMo.observe(tr,{childList:true})};liga();setTimeout(liga,1500)}
function emtSt(i,t,a){const E=EMT();let s=E[i.id];if(!s){const now=new Date(),mn=now.getHours()*60+now.getMinutes();const B=emtBlocos(a,t,now);const b=B.find(x=>mn>=x.ini&&mn<x.fim)||B.find(x=>x.ini>mn);
    let dur=b?(mn>=b.ini?b.fim-mn:b.fim-b.ini):(/^Q/.test((()=>{try{return TIPO_AB(i.tipo)}catch(_){return ''}})())?20:90);dur=Math.max(5,Math.min(240,Math.round(dur)));
    s=E[i.id]={dur,ini:null,acum:0,pz:null,extra:25,regras:'Telemóveis desligados e guardados na mochila.\nEscreve o nome e o número em todas as folhas.\nSem conversas: dúvidas, levanta o braço.\nNo fim, verifica as respostas antes de entregar.'};}
  return s}
const emtDecorrido=s=>s.ini?Math.max(0,((s.pz||Date.now())-s.ini-(s.acum||0))):0;
const emtFmt=ms=>{const neg=ms<0;ms=Math.abs(ms);const h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),sg=Math.floor(ms%60000/1000);return (neg?'+':'')+(h?h+':'+String(m).padStart(2,'0'):String(m))+':'+String(sg).padStart(2,'0')};
const emtHora=d=>String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
let EMT_IV=null,EMT_WL=null;
function emtFechar(){clearInterval(EMT_IV);EMT_IV=null;const o=$('#emteste');if(o)o.remove();document.body.classList.remove('emt-on');try{EMT_WL&&EMT_WL.release()}catch(_){}EMT_WL=null;try{if(document.fullscreenElement)document.exitFullscreen()}catch(_){}try{emtNav()}catch(_){}}
function emtBip(n){try{const C=new (window.AudioContext||window.webkitAudioContext)();for(let k=0;k<(n||3);k++){const o=C.createOscillator(),g=C.createGain();o.frequency.value=880;o.connect(g);g.connect(C.destination);const t0=C.currentTime+k*.45;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.3,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+.32);o.start(t0);o.stop(t0+.35)}setTimeout(()=>C.close(),2500)}catch(_){}}
function emtAbrir(iid,tid){const a=A();const t=a&&(a.turmas||[]).find(x=>x.id===tid);const i=t&&(t.instrumentos||[]).find(x=>x.id===iid);if(!i)return toast('Teste não encontrado','erro');
  emtFechar();const s=emtSt(i,t,a);const B=emtBlocos(a,t);const sala=(B[0]&&B[0].sala)||'';
  const nExtra=alunosAval(t).filter(x=>(x.acomod||[]).some(z=>/tempo/i.test(z))).length;
  const o=document.createElement('div');o.id='emteste';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Modo em teste: '+i.nome);
  o.innerHTML=`<div class="emt-top"><span class="emt-tag"><i></i> Em teste</span><span class="emt-tur">${esc(t.nome)} · ${esc(t.disciplina)}${sala?' · Sala '+esc(sala):''}</span><span class="sp1"></span>
      <button type="button" class="emt-b" id="emt-fs" title="Ecrã inteiro">${ic('arrowUp',18)}<span>Ecrã inteiro</span></button><button type="button" class="emt-b" id="emt-x" title="Sair (Esc)">${ic('x',18)}<span>Sair</span></button></div>
    <h1 class="emt-nome">${esc(i.nome)}</h1><p class="emt-sub">${esc(i.tipo||'Teste')}${i.periodo?' · '+i.periodo+'.º período':''}</p>
    <div class="emt-grid"><div class="emt-cx emt-rel"><small>Hora</small><div class="emt-num"><b id="emt-h">--:--</b><span id="emt-s">:--</span></div><small id="emt-dt"></small></div>
      <div class="emt-cx emt-tmp"><small id="emt-lbl">Tempo do teste</small><div class="emt-num"><b id="emt-r">--:--</b></div><div class="emt-bar" aria-hidden="true"><i id="emt-bar"></i></div><small id="emt-fim"></small><small id="emt-ex"></small></div></div>
    <div class="emt-regras" id="emt-rg"></div>
    <div class="emt-ctl"><button type="button" class="emt-b pri" id="emt-go"></button><button type="button" class="emt-b" id="emt-m5" title="Menos 5 minutos">−5 min</button><button type="button" class="emt-b" id="emt-p5" title="Mais 5 minutos">+5 min</button>
      <label class="emt-dur">Duração <input type="number" id="emt-d" min="5" max="300" step="5" value="${s.dur}"> min</label>${nExtra?`<label class="emt-dur">Tempo adicional <select id="emt-xs">${[0,10,15,20,25,30,50].map(p=>`<option value="${p}" ${+s.extra===p?'selected':''}>${p?'+'+p+' %':'sem'}</option>`).join('')}</select></label>`:''}
      <button type="button" class="emt-b" id="emt-rs" title="Recomeçar">${ic('refresh',16)} Recomeçar</button><button type="button" class="emt-b" id="emt-re" title="Editar as regras">${ic('pencil',16)} Regras</button></div>`;
  document.body.appendChild(o);document.body.classList.add('emt-on');
  const rg=()=>{const L=String(s.regras||'').split('\n').map(x=>x.trim()).filter(Boolean);$('#emt-rg').innerHTML=L.length?`<ul>${L.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''};rg();
  let bipou=false,bip5=false;
  const tick=()=>{const now=new Date();$('#emt-h').textContent=emtHora(now);$('#emt-s').textContent=':'+String(now.getSeconds()).padStart(2,'0');
    $('#emt-dt').textContent=now.toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'});
    const tot=s.dur*60000,el=emtDecorrido(s),rest=tot-el;const corre=s.ini&&!s.pz;
    $('#emt-r').textContent=emtFmt(s.ini?rest:tot);$('#emt-lbl').textContent=!s.ini?'Tempo do teste':s.pz?'Em pausa':rest>0?'Tempo restante':'Tempo terminado';
    $('#emt-bar').style.width=(s.ini?Math.min(100,Math.max(0,el/tot*100)):0)+'%';
    const fim=s.ini?new Date(now.getTime()+Math.max(0,rest)):new Date(now.getTime()+tot);
    $('#emt-fim').textContent=(s.ini?'Termina às ':'Se começar agora, termina às ')+emtHora(fim)+(s.pz?' (em pausa)':'');
    const ex=$('#emt-ex');if(nExtra&&+s.extra){const fx=new Date(fim.getTime()+tot*(+s.extra)/100);ex.textContent='Tempo adicional (+'+s.extra+' %): '+nExtra+(nExtra===1?' aluno':' alunos')+' até às '+emtHora(fx)}else ex.textContent='';
    o.classList.toggle('emt-10',!!s.ini&&rest<=600000&&rest>300000);o.classList.toggle('emt-5',!!s.ini&&rest<=300000&&rest>0);o.classList.toggle('emt-0',!!s.ini&&rest<=0);o.classList.toggle('emt-pz',!!s.pz);
    if(corre&&rest<=300000&&rest>290000&&!bip5){bip5=true;emtBip(1)}if(corre&&rest<=0&&!bipou){bipou=true;emtBip(3)}
    $('#emt-go').innerHTML=!s.ini?ic('play',18)+' Começar':s.pz?ic('play',18)+' Continuar':ic('pause',18)+' Pausa'};
  const guarda=()=>{save();tick();try{emtNav()}catch(_){}};
  $('#emt-go').onclick=()=>{if(!s.ini){s.ini=Date.now();s.acum=0;s.pz=null;bipou=bip5=false;try{audit('Em teste','Início do teste',i.nome+' · '+t.nome)}catch(_){}}else if(s.pz){s.acum=(s.acum||0)+(Date.now()-s.pz);s.pz=null}else s.pz=Date.now();guarda()};
  $('#emt-m5').onclick=()=>{s.dur=Math.max(5,s.dur-5);$('#emt-d').value=s.dur;guarda()};$('#emt-p5').onclick=()=>{s.dur=Math.min(300,s.dur+5);$('#emt-d').value=s.dur;bipou=false;guarda()};
  $('#emt-d').onchange=e=>{s.dur=Math.max(5,Math.min(300,+e.target.value||s.dur));bipou=false;guarda()};
  const xs=$('#emt-xs');if(xs)xs.onchange=()=>{s.extra=+xs.value;guarda()};
  $('#emt-rs').onclick=()=>{if(s.ini&&!confirm('Recomeçar o temporizador deste teste?'))return;s.ini=null;s.acum=0;s.pz=null;bipou=bip5=false;guarda()};
  $('#emt-re').onclick=()=>{const v=prompt('Regras a mostrar durante o teste (uma por linha; use \\n para mudar de linha):',String(s.regras||'').replace(/\n/g,'\\n'));if(v==null)return;s.regras=v.replace(/\\n/g,'\n');rg();save()};
  $('#emt-x').onclick=emtFechar;$('#emt-fs').onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else o.requestFullscreen&&o.requestFullscreen()}catch(_){}};
  o.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.fullscreenElement){e.preventDefault();emtFechar()}if(e.key===' '&&e.target===o){e.preventDefault();$('#emt-go').click()}});o.tabIndex=-1;o.focus();
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>EMT_WL=w).catch(()=>{})}catch(_){}
  tick();EMT_IV=setInterval(()=>{if(!document.getElementById('emteste')){clearInterval(EMT_IV);return}tick()},1000)}

/* ===================== v1.026 · Desempenho em computadores mais antigos =====================
   1) As regras de estilo com :has() sobre o atributo style obrigavam a recalcular o estilo da página inteira a cada medição do
      cabeçalho (até 10 s a abrir «Aulas e sumários» num PC antigo) — foram retiradas.
   2) Modo leve (Definições › Aparência › Desempenho): sem desfoques de vidro, sombras e animações. Liga-se sozinho em computadores
      com poucos recursos ou quando o ecrã fica lento; pode forçar-se «Leve» ou «Normal» neste dispositivo. */
const LEVE_K='es.leve';const leveCfg=()=>{try{return localStorage.getItem(LEVE_K)||'auto'}catch(_){return 'auto'}};
let LEVE_AUTO=false;try{const c=navigator.hardwareConcurrency||8,m=navigator.deviceMemory||8;if(c<=2||m<=2)LEVE_AUTO=true}catch(_){}
try{if(localStorage.getItem('es.leveAuto')==='1')LEVE_AUTO=true}catch(_){}
const leveAtivo=()=>{const v=leveCfg();return v==='on'||(v==='auto'&&LEVE_AUTO)};
function leveAplicar(){const on=leveAtivo();const r=document.documentElement;r.classList.toggle('leve',on);if(on)r.classList.add('a11y-rm')}
{const _aaL=animAplicar;animAplicar=function(){const r=_aaL.apply(this,arguments);try{leveAplicar()}catch(_){}return r}}
leveAplicar();
/* medição automática: 120 imagens do ecrã depois de a app sossegar; se mais de metade forem lentas, liga o modo leve */
setTimeout(function leveMedir(){if(leveCfg()!=='auto'||LEVE_AUTO||document.hidden)return;let n=0,lentos=0,prev=0;const f=t=>{if(document.hidden)return;if(prev&&t-prev>40)lentos++;prev=t;if(++n<120)requestAnimationFrame(f);else if(lentos>60){LEVE_AUTO=true;try{localStorage.setItem('es.leveAuto','1')}catch(_){}leveAplicar();toast('Modo leve ligado: este computador estava lento. Pode mudar em Definições › Aparência.','ok')}};requestAnimationFrame(f)},9000);
function cartaoLeve(){const v=leveCfg();const o=(k,n,d)=>`<button type="button" role="radio" aria-checked="${v===k}" class="anopt ${v===k?'on':''}" data-lv="${k}"><b>${n}</b><small>${d}</small></button>`;
  return `<div class="card" id="lv-cfg"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('sliders',18)} Desempenho</h2><span class="sp1"></span><span class="mut" style="font-size:13px">Só neste dispositivo${v==='auto'?' · agora: '+(LEVE_AUTO?'leve':'normal'):''}</span></div>
  <div class="angrid" role="radiogroup" aria-label="Desempenho">${o('auto','Automático','Liga o modo leve sozinho em computadores mais antigos ou lentos.')}${o('on','Leve','Sem desfoques de vidro, sombras nem animações — mais rápido em PCs antigos e quadros interativos.')}${o('off','Normal','Aspeto completo, com todos os efeitos.')}</div></div>`}
{const _vdL=vDefinicoes;vDefinicoes=function(){const r=_vdL.apply(this,arguments);try{if((UI.defTab||'geral')==='aparencia'&&!$('#lv-cfg')){const c=$('#an-cfg')||$('#view .card');if(c){c.insertAdjacentHTML($('#an-cfg')?'afterend':'beforebegin',cartaoLeve());$$('#lv-cfg [data-lv]').forEach(b=>b.onclick=()=>{try{localStorage.setItem(LEVE_K,b.dataset.lv);if(b.dataset.lv!=='auto')localStorage.removeItem('es.leveAuto')}catch(_){}if(b.dataset.lv==='auto'){LEVE_AUTO=false;try{const c2=navigator.hardwareConcurrency||8,m2=navigator.deviceMemory||8;if(c2<=2||m2<=2)LEVE_AUTO=true}catch(_){}}try{animAplicar()}catch(_){leveAplicar()}go('definicoes');toast('Desempenho: '+({auto:'automático',on:'leve',off:'normal'})[b.dataset.lv],'ok')})}}}catch(e){console.warn(e)}return r}}

/* ===================== v1.026 · Disciplinas e UFCD (PROFIJ): explicação clara, várias por turma, sem pautas repetidas =====================
   Num curso PROFIJ o professor pode lecionar, na mesma turma e no mesmo ano, várias disciplinas (sociocultural/científica) e várias
   UFCD (componente tecnológica). Cada disciplina tem a sua pauta; as UFCD ficam todas numa única pauta «Componente Tecnológica (UFCD)»,
   uma unidade por UFCD (horas, datas e classificação próprias). Se acrescentar mais UFCD a uma turma que já tem essa pauta, juntam-se
   à pauta existente em vez de criar outra igual. No menu, a pauta das UFCD mostra os códigos das UFCD. */
const UFCD_EXPL=`<details class="ntexp" open><summary>${ic('info',14)} <b>Disciplinas e UFCD — como funciona</b></summary>
  <ul><li><b>Disciplina</b> (componentes sociocultural e científica, ex.: Comunicar em Inglês, Matemática Aplicada): cada uma tem a <b>sua pauta</b>, com critérios e instrumentos próprios.</li>
  <li><b>UFCD</b> (Unidade de Formação de Curta Duração, componente tecnológica): todas as UFCD que leciona nesta turma ficam numa <b>única pauta</b> «Componente Tecnológica (UFCD)», <b>uma unidade por UFCD</b> — cada uma com horas, datas, instrumentos e classificação (0–20) próprios.</li>
  <li>Pode lecionar <b>várias disciplinas e várias UFCD na mesma turma e no mesmo ano</b>: assinale todas abaixo (ou acrescente depois com «+ Disciplina»). Os alunos são copiados para cada pauta.</li>
  <li>Se a turma <b>já tiver</b> a pauta das UFCD, as novas UFCD juntam-se a ela — nunca fica com duas pautas iguais.</li>
  <li>As turmas que <b>só coordena</b> (Coord. PROFIJ) não se criam aqui: ficam na Coordenação, separadas da sua docência.</li></ul></details>`;
{const _ntU=novaTurmaDlg;novaTurmaDlg=function(r){const res=_ntU.apply(this,arguments);try{const w=$('#nt-maisw');if(w&&!$('#nt-expl')){w.insertAdjacentHTML('beforebegin',`<div id="nt-expl">${UFCD_EXPL}</div>`);
      const ver=()=>{const b=$('#nt-ofw [data-of].on');const of=b?b.dataset.of:'regular';const e=$('#nt-expl');if(e)e.hidden=of!=='profij'&&of!=='profissional'};ver();
      const ow=$('#nt-ofw');if(ow)ow.addEventListener('click',()=>setTimeout(ver,0))}}catch(e){console.warn(e)}return res}}
/* rótulo da pauta das UFCD no menu: os códigos das UFCD (em vez do nome comprido da componente) */
function ufcdRotulos(){const a=A();if(!a)return;const tree=$('#tTree');if(!tree)return;
  tree.querySelectorAll('[data-tt]').forEach(b=>{const t=(a.turmas||[]).find(x=>x.id===b.dataset.tt);if(!t||!ehComp(t.disciplina))return;const M=(t.modulos||[]).filter(m=>m&&(m.cod||m.nome));if(!M.length)return;
    const cods=M.map(m=>String(m.cod||'').replace(/^UFCD\s*/i,'').trim()||m.nome.slice(0,14));const txt=(t.disciplina===UC_N?'UC ':'UFCD ')+cods.slice(0,3).join(', ')+(cods.length>3?' +'+(cods.length-3):'');
    const el=b.querySelector('.tdisc')||(b.classList.contains('tdsb')?b.querySelector('.lbl'):null);if(el){el.textContent=txt;b.title=t.nome+' · '+t.disciplina+' — '+M.map(m=>(m.cod?m.cod+' ':'')+m.nome).join('; ')}})}
/* pautas das UFCD repetidas na mesma turma (criadas de novo com «+ Disciplina»): as UFCD juntam-se à pauta que já existia */
function ufcdFundir(){const a=A();if(!a)return 0;const L=a.turmas.__real||a.turmas;let n=0;const G={};
  L.forEach(t=>{if(!ehComp(t.disciplina))return;const k=normTurma(t.nome)+'|'+escId(escolaDe(t))+'|'+t.disciplina;(G[k]=G[k]||[]).push(t)});
  Object.values(G).forEach(g=>{if(g.length<2)return;const base=g[0];g.slice(1).forEach(t=>{const comNotas=(t.instrumentos||[]).some(i=>i.notas&&Object.keys(i.notas).length);if(comNotas)return;
      base.modulos=base.modulos||[];(t.modulos||[]).forEach(m=>{const ja=base.modulos.some(x=>(m.cod&&x.cod&&String(x.cod).replace(/\D/g,'')===String(m.cod).replace(/\D/g,''))||normT(x.nome)===normT(m.nome));if(!ja)base.modulos.push(m)});
      try{const H=a.horProf;if(H&&H.mapa)Object.keys(H.mapa).forEach(k=>{if(H.mapa[k]===t.id)H.mapa[k]=base.id})}catch(_){}
      const j=L.indexOf(t);if(j>=0)L.splice(j,1);if(S.turmaAtiva===t.id)S.turmaAtiva=base.id;n++})});
  if(n){save();setTimeout(()=>toast('As UFCD novas juntaram-se à pauta «Componente Tecnológica» que a turma já tinha','ok'),80)}return n}
{const _gU=go;go=function(v){try{if(v==='turmas'||v==='painel'||v==='modulos'||v==='inicio')ufcdFundir()}catch(e){console.warn(e)}return _gU.apply(this,arguments)};if(_gU._f)go._f=_gU._f}

