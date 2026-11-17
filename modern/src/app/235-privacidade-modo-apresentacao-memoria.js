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
