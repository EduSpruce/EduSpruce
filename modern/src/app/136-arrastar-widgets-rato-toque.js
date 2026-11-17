/* ===================== Arrastar widgets (rato, toque e teclado) — Início simples e Geral ===================== */
if(!ICONS.grip)ICONS.grip='<circle cx="9" cy="6" r="1.4" fill="currentColor"/><circle cx="15" cy="6" r="1.4" fill="currentColor"/><circle cx="9" cy="12" r="1.4" fill="currentColor"/><circle cx="15" cy="12" r="1.4" fill="currentColor"/><circle cx="9" cy="18" r="1.4" fill="currentColor"/><circle cx="15" cy="18" r="1.4" fill="currentColor"/>';
function wgModo(){return $('#view .dgrps,#view .dgrid')?'geral':$('#view .in-main')?'simples':null}
function wgCartoes(){const m=wgModo();if(m==='geral')return [...$$('#view .dw')];if(m==='simples')return [...$$('#view .in-main>.card,#view .in-side>.card,#view .in-fav>.card,#view .in-main>[id^="w-"],#view .in-side>[id^="w-"],#view .in-fav>[id^="w-"]')];return []}
function wgContentores(){const m=wgModo();if(m==='geral')return [...$$('#view .dgsec>.dgrid'),...(!$('#view .dgsec')?$$('#view .dgrid'):[])];if(m==='simples')return [...$$('#view .in-main,#view .in-side,#view .in-fav')];return []}
function wgGuardar(){const m=wgModo();if(m==='simples'){iniGuardar();return}
  const d=dashM();const ord=[];$$('#view .dgsec').forEach(sec=>{sec.querySelectorAll(':scope>.dgrid>.dw').forEach(c=>{ord.push(c.dataset.dw);d.w[c.dataset.dw]={...dashCfgW(c.dataset.dw),g:sec.dataset.dg}})});
  if(!ord.length)$$('#view .dgrid>.dw').forEach(c=>ord.push(c.dataset.dw));const rest=dashOrdem().filter(x=>!ord.includes(x));d.ordem=[...ord,...rest];save();try{dashAjustar($('#view .dgrps')||$('#view .dgrid'))}catch(_){}}
/* ===================== Mover cartões (v0.939): um só motor para rato, toque e teclado =====================
   Qualquer cartão do Início pode ir para qualquer área designada. Ao pegar num cartão, todos encolhem para se verem
   as áreas inteiras; o marcador tracejado mostra onde o cartão vai ficar. Esc cancela. */
let _wg=null;
const WG_INTER='button,a,input,select,textarea,label,summary,[contenteditable],[role=radio],[role=tab],[role=slider]';
function wgAreas(){const m=wgModo();
  if(m==='simples')return [['.in-main','Principal'],['.in-side','Lateral'],['.in-fav','Complementar']].map(([s,n])=>({el:$('#view '+s),n})).filter(a=>a.el);
  if(m==='geral'){const S2=[...$$('#view .dgsec')];if(S2.length)return S2.map(s=>({el:s.querySelector(':scope>.dgrid'),n:((s.querySelector('.dgh')||{}).textContent||'').trim()})).filter(a=>a.el);return [...$$('#view .dgrid')].map(el=>({el,n:''}))}
  return []}
function wgCab(c){return c.querySelector(':scope>.dwh')||c.querySelector(':scope>h2')||c.querySelector(':scope>.row')||c.querySelector('h2')}
function wgPreparar(){const L=wgCartoes();if(!L.length)return;
  L.forEach(c=>{if(!c.__wgT){c.__wgT=1;c.addEventListener('touchmove',wgToqueMove,{passive:false})}const h=wgCab(c);if(h){h.draggable=false;h.querySelectorAll('[draggable]').forEach(x=>x.draggable=false);h.classList.add('wghd')}
    if(c.querySelector('.wggrip'))return;
    const g=document.createElement('button');g.type='button';g.className='wggrip'+(h?'':' wgabs');g.setAttribute('aria-label','Mover cartão: arrastar, ou usar as setas do teclado');g.title='Arrastar para outra área';g.innerHTML=ic('grip',16);
    if(h){if(h.matches('h2'))h.classList.add('wgh');h.prepend(g)}else c.prepend(g);
    g.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()});
    g.addEventListener('keydown',e=>{const all=wgCartoes();const col=c.parentElement;const irm=[...col.children].filter(x=>all.includes(x));const k=irm.indexOf(c);let dito='Cartão movido';
      if(e.key==='ArrowUp'&&k>0){e.preventDefault();col.insertBefore(c,irm[k-1])}else if(e.key==='ArrowDown'&&k<irm.length-1){e.preventDefault();irm[k+1].after(c)}
      else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){const C=wgAreas();const i=C.findIndex(a=>a.el===col);const n=C[i+(e.key==='ArrowLeft'?-1:1)];if(!n)return;e.preventDefault();n.el.appendChild(c);dito='Cartão movido para a área '+n.n}else return;
      wgGuardar();try{iniColVazias()}catch(_){}const g2=c.querySelector('.wggrip');if(g2)g2.focus();try{anunciar(dito)}catch(_){}})})}
function wgCartaoDe(el){if(!el||!el.closest)return null;return wgCartoes().find(c=>c===el||c.contains(el))||null}
function wgIniciar(e,c,imediato){const r=c.getBoundingClientRect();
  _wg={c,x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,fx:(e.clientX-r.left)/Math.max(1,r.width),ativo:false,pid:e.pointerId,pai:c.parentElement,seg:c.nextElementSibling};
  if(imediato)wgAtivar()}
function wgAtivar(){const w=_wg;if(!w||w.ativo)return;const c=w.c;const r=c.getBoundingClientRect();const v=$('#view');const lay=$('#view .inlay');if(lay)lay.classList.remove('sem-fav','sem-side');
  const gw=Math.min(r.width,380);w.gw=gw;w.dx=Math.max(24,Math.min(gw-24,w.fx*gw));w.dy=26;
  const gh=c.cloneNode(true);gh.removeAttribute('id');gh.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));gh.classList.add('wgghost');gh.style.width=gw+'px';gh.style.gridColumn='';document.body.appendChild(gh);w.gh=gh;
  const ph=document.createElement('div');ph.className='wgph '+[...c.classList].filter(x=>/^t-/.test(x)).join(' ');const sc=c.style.gridColumn;if(sc)ph.style.gridColumn=sc;ph.innerHTML='<span>Largar aqui</span>';c.after(ph);w.ph=ph;
  c.classList.add('wgorig');document.body.classList.add('wgarr');wgAreas().forEach(a=>{a.el.classList.add('wgarea');a.el.dataset.wgn=a.n});w.ativo=true;
  /* os cartões encolheram: manter o marcador debaixo do dedo */
  try{const pr=ph.getBoundingClientRect();v.scrollTop+=pr.top+pr.height/2-w.y}catch(_){}
  try{navigator.vibrate&&navigator.vibrate(10)}catch(_){}
  wgPosicionar();const rola=()=>{if(!_wg||_wg!==w||!w.ativo)return;const vr=v.getBoundingClientRect();const m=90;let d=0;if(w.y<vr.top+m)d=-Math.ceil((vr.top+m-w.y)/6);else if(w.y>vr.bottom-m)d=Math.ceil((w.y-(vr.bottom-m))/6);
    if(d){const a=v.scrollTop;v.scrollTop+=Math.max(-22,Math.min(22,d));if(v.scrollTop!==a)wgPosicionar()}w.raf=requestAnimationFrame(rola)};w.raf=requestAnimationFrame(rola)}
function wgPosicionar(){const w=_wg;if(!w||!w.ativo)return;const {gh,ph,c,x,y}=w;gh.style.transform=`translate(${Math.round(x-w.dx)}px,${Math.round(y-w.dy)}px) rotate(1deg)`;
  const A=wgAreas();if(!A.length)return;
  /* área: a que está debaixo do ponteiro; senão, a mais próxima — há sempre um destino */
  let alvo=null,best=1e9;A.forEach(a=>{const r=a.el.getBoundingClientRect();if(r.width<2)return;const dx=x<r.left?r.left-x:x>r.right?x-r.right:0,dy=y<r.top?r.top-y:y>r.bottom?y-r.bottom:0;const d=Math.hypot(dx,dy);if(d<best){best=d;alvo=a}});
  if(!alvo)return;const el=alvo.el;const ar=el.getBoundingClientRect();const todos=wgCartoes();
  const it=[...el.children].filter(k=>k!==c&&todos.includes(k)&&k.offsetParent!==null&&k.getBoundingClientRect().height>1);
  let antes=null;for(const k of it){const r=k.getBoundingClientRect();if(y<r.top){antes=k;break}if(y<=r.bottom){const larga=r.width>=ar.width*.9;if(larga?y<r.top+r.height/2:x<r.left+r.width/2){antes=k;break}}}
  /* só mexer no marcador quando o sítio muda (evita tremer) */
  const depois=it.filter(k=>ph.compareDocumentPosition(k)&Node.DOCUMENT_POSITION_FOLLOWING)[0]||null;
  if(ph.parentElement!==el||depois!==antes){if(antes)el.insertBefore(ph,antes);else el.appendChild(ph)}
  A.forEach(a=>a.el.classList.toggle('wgover',a.el===el))}
function wgLimpar(){const w=_wg;if(!w)return;cancelAnimationFrame(w.raf);if(w.gh)w.gh.remove();w.c.classList.remove('wgorig','wgpress');document.body.classList.remove('wgarr');
  $$('.wgarea').forEach(x=>{x.classList.remove('wgarea','wgover');delete x.dataset.wgn});_wg=null}
function wgFim(cancelar){const w=_wg;if(!w)return;const {c,ph,ativo}=w;if(!ativo){wgLimpar();return}
  const mudou=!cancelar&&!(ph.parentElement===w.pai&&(ph.previousElementSibling===c));
  if(cancelar){if(w.seg&&w.seg.parentElement===w.pai)w.pai.insertBefore(c,w.seg);else w.pai.appendChild(c);ph.remove()}else ph.replaceWith(c);
  wgLimpar();document.body.dataset.wgjust=1;setTimeout(()=>delete document.body.dataset.wgjust,350);
  if(mudou){wgGuardar();try{anunciar('Cartão movido')}catch(_){}}
  try{iniColVazias()}catch(_){}
  requestAnimationFrame(()=>{try{const v=$('#view'),vr=v.getBoundingClientRect(),r=c.getBoundingClientRect();if(r.top<vr.top+8)v.scrollTop+=r.top-vr.top-12;else if(r.top>vr.bottom-120)v.scrollTop+=r.top-vr.bottom+Math.min(r.height+12,vr.height*.6)}catch(_){}
    if(mudou){c.classList.add('wgpousou');setTimeout(()=>c.classList.remove('wgpousou'),500)}})}
document.addEventListener('pointerdown',e=>{if(_wg||e.button>0||!e.isPrimary)return;const t=e.target;if(!t.closest||!t.closest('#view'))return;const c=wgCartaoDe(t);if(!c)return;
  const g=t.closest('.wggrip');if(g&&c.contains(g)){e.preventDefault();wgIniciar(e,c,false);_wg.limiar=3;return}
  if(t.closest('.wgrs'))return;const it=t.closest(WG_INTER);const inter=it&&it!==c&&c.contains(it);
  if(e.pointerType==='mouse'||e.pointerType==='pen'){const h=wgCab(c);const hp=h&&h.parentElement;const zona=(h&&h.contains(t))||(hp&&hp!==c&&hp.matches('.row,.dwh,header')&&hp.contains(t))||(e.clientY-c.getBoundingClientRect().top<48);if(!zona||inter)return;wgIniciar(e,c,false);_wg.limiar=6;return}
  /* toque: toque longo em qualquer parte do cartão (menos campos de escrita) */
  if(t.closest('input,select,textarea,[contenteditable]'))return;wgIniciar(e,c,false);const w=_wg;w.limiar=1e9;c.classList.add('wgpress');
  w.tm=setTimeout(()=>{if(_wg===w&&!w.ativo){c.classList.remove('wgpress');wgAtivar()}},400)},true);
document.addEventListener('pointermove',e=>{const w=_wg;if(!w||e.pointerId!==w.pid)return;w.x=e.clientX;w.y=e.clientY;
  if(!w.ativo){const d=Math.hypot(w.x-w.x0,w.y-w.y0);if(w.tm){if(d>9){clearTimeout(w.tm);wgLimpar()}return}if(d<w.limiar)return;wgAtivar();return}
  e.preventDefault();wgPosicionar()},{capture:true,passive:false});
const wgSolta=e=>{const w=_wg;if(!w||(e.pointerId!=null&&e.pointerId!==w.pid))return;clearTimeout(w.tm);
  /* no toque, o browser pode cancelar o ponteiro ao começar a rolar: se já estamos a arrastar, quem manda são os eventos de toque */
  if(e.type==='pointercancel'&&w.ativo&&w.toque)return;wgFim(e.type==='pointercancel')};
document.addEventListener('pointerup',wgSolta,true);document.addEventListener('pointercancel',wgSolta,true);
document.addEventListener('touchstart',e=>{if(_wg)_wg.toque=true},{capture:true,passive:true});
/* o toque só é «vigiado» em cima dos cartões do Início (no resto da app o deslizar do dedo não espera por nada) */
const wgToqueMove=e=>{const w=_wg;if(!w||!w.ativo)return;e.preventDefault();const t=e.touches[0];if(t){w.x=t.clientX;w.y=t.clientY;wgPosicionar()}};
document.addEventListener('touchend',e=>{const w=_wg;if(w&&w.toque){clearTimeout(w.tm);if(w.ativo)e.preventDefault();wgFim(false)}},{capture:true,passive:false});
document.addEventListener('touchcancel',e=>{const w=_wg;if(w&&w.toque){clearTimeout(w.tm);wgFim(true)}},true);
window.addEventListener('keydown',e=>{if(_wg&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();wgFim(true)}},true);
addEventListener('blur',()=>{if(_wg)wgFim(true)});
document.addEventListener('click',e=>{if(document.body.dataset.wgjust){e.preventDefault();e.stopPropagation();delete document.body.dataset.wgjust}},true);
document.addEventListener('contextmenu',e=>{if(_wg||(matchMedia('(hover:none)').matches&&wgCartaoDe(e.target)&&!e.target.closest('input,textarea,[contenteditable]')))e.preventDefault()},true);
document.addEventListener('selectstart',e=>{if(_wg)e.preventDefault()},true);
{const _vInW=vInicio;vInicio=function(){const r=_vInW.apply(this,arguments);try{requestAnimationFrame(wgPreparar)}catch(_){}return r};if(go._f)go._f.inicio=vInicio}
{const _gW=go;go=function(v){const r=_gW.apply(this,arguments);if(go._f&&go._f.inicio!==vInicio)go._f.inicio=vInicio;return r}}


/* Produção Oral como sub-item dos Instrumentos */
{const h=$('#tnavHold');const o=h&&h.querySelector('[data-v="oral"]'),ins=h&&h.querySelector('[data-v="instrumentos"]');if(o&&ins){ins.after(o);o.classList.add('navsub');const l=o.querySelector('.lbl');if(l)l.textContent='Produção Oral'}}
function irOral(t,instId){if(instId&&oralM(t).inst!==instId){oralTrocar(t,instId);oralSync(t);save()}go('oral')}
{const _vis=vInstrumentos;vInstrumentos=function(){const r=_vis.apply(this,arguments);try{const t=T();if(!t||UI.inst)return r;const d=domOral(t);if(!d)return r;
  $$('#view tr[data-irow]').forEach(tr=>{const i=t.instrumentos.find(x=>x.id===tr.dataset.irow);if(!i||i.oral||!i.itens.some(it=>it.dom===d.id))return;const c=tr.querySelector('td');if(c&&!c.querySelector('.inoral'))c.insertAdjacentHTML('beforeend',`<button type="button" class="inoral" data-inoral="${i.id}" title="Avaliar a oralidade deste instrumento">${ic('fala',12)} Produção Oral${oralM(t).inst===i.id?' · ligada':''}</button>`)});
  $$('[data-inoral]').forEach(b=>b.onclick=e=>{e.stopPropagation();irOral(t,b.dataset.inoral)})}catch(e){console.warn(e)}return r}}
{const _vi1=vInstrumento;vInstrumento=function(id){const r=_vi1.apply(this,arguments);try{const t=T();const i=t.instrumentos.find(x=>x.id===id);const d=domOral(t);if(i&&d&&!i.oral&&i.itens.some(it=>it.dom===d.id)){const tb=$('#view .tabs.noprint');if(tb&&!tb.querySelector('[data-itoral]')){tb.insertAdjacentHTML('beforeend',`<button data-itoral>${ic('fala',13)} Produção Oral</button>`);tb.querySelector('[data-itoral]').onclick=()=>irOral(t,i.id)}}}catch(e){console.warn(e)}return r}}
/* ao criar/alterar itens de oralidade, a ligação à grelha oral fica feita automaticamente */
{const _sv=saveNow;saveNow=function(){try{const t=T();const d=t&&domOral(t);if(d)t.instrumentos.forEach(i=>{if(i.oral)return;const its=i.itens.filter(it=>it.dom===d.id);if(its.length&&!its.some(it=>it.oralLig!=null))its.forEach(it=>it.oralLig=true)})}catch(_){}return _sv.apply(this,arguments)}}

/* Itens e cotações: vista em árvore (grupos editáveis, itens indentados) */
const NIV_S=['Grupo','Pergunta','Alínea','Subalínea'];
instItens=function(t,i){i.itens.forEach(it=>{if(!Array.isArray(it.niv))it.niv=[it.rot||'']});const dO=domOral(t);const P=i.itens.map(itPath);
  const bloco=(k,l)=>{const pre=P[k].slice(0,l+1).join('\u0001');let a=k,b=k;while(a>0&&P[a-1].slice(0,l+1).join('\u0001')===pre&&P[a-1].length>l+1)a--;while(b<P.length-1&&P[b+1].slice(0,l+1).join('\u0001')===pre&&P[b+1].length>l+1)b++;return [a,b]};
  const linhas=[];P.forEach((p,k)=>{const ant=k?P[k-1]:[];for(let l=0;l<p.length-1;l++){if(ant.slice(0,l+1).join('\u0001')!==p.slice(0,l+1).join('\u0001')||ant.length<=l+1)linhas.push({g:true,k,l,lab:p[l]})}linhas.push({g:false,k,l:p.length-1,lab:p[p.length-1]})});
  const somaB=(a,b)=>i.itens.slice(a,b+1).reduce((s,it)=>s+(+it.cot||0),0);
  const sumDom=t.dominios.map(d=>({d,s:i.itens.filter(x=>x.dom===d.id).reduce((a,x)=>a+(+x.cot||0),0)})).filter(x=>x.s);const tot=instMax(i);
  const domSel=it=>`<select data-f="dom" class="itdom" aria-label="Domínio">${domById(t,it.dom)?'':'<option value="">— sem domínio —</option>'}${t.dominios.map(d=>`<option value="${d.id}" ${d.id===it.dom?'selected':''} title="${esc(d.nome)}">${esc(d.ab)} · ${esc(d.nome)}</option>`).join('')}</select>`;
  $('#i-body').innerHTML=`<div class="itbar2"><div class="itdoms">${sumDom.map(x=>`<span class="itdc" title="${esc(x.d.nome)}"><b>${esc(x.d.ab)}</b>${nf(x.s)}<small>${tot?Math.round(x.s/tot*100)+'%':''}</small></span>`).join('')}<span class="ittot"><b>${nf(tot)}</b> pontos · ${i.itens.length} ite${i.itens.length===1?'m':'ns'}</span></div>
      <p class="hint" style="margin:6px 0 0">Organize em grupos e sub-itens (até 4 níveis): <b>Grupo A</b> › <b>1.</b> › <b>1.1</b>. Só os itens finais têm cotação; os grupos mostram a soma.</p></div>
    <div class="itree" role="list">${linhas.map(r=>{const ind=`style="--d:${r.l}"`;
      if(r.g){const [a,b]=bloco(r.k,r.l);return `<div class="itr itg" role="listitem" ${ind} data-gk="${r.k}" data-gl="${r.l}"><span class="itlv">${NIV_S[r.l]}</span><input class="itlab" data-glab value="${esc(r.lab)}" aria-label="Nome do ${NIV_S[r.l].toLowerCase()}"><span class="sp1"></span><span class="itgs">${nf(somaB(a,b))} pts</span>
        <button class="btn sm" type="button" data-gadd="${r.k}|${r.l}">${ic('plus',13)} Item</button><button class="btn sm ico dng" type="button" data-gdel="${r.k}|${r.l}" aria-label="Apagar grupo">${ic('trash',13)}</button></div>`}
      const it=i.itens[r.k];const or=dO&&it.dom===dO.id;
      return `<div class="itr itf ${or?'itor':''}" role="listitem" ${ind} data-k="${r.k}"><span class="itlv">${r.l?NIV_S[r.l]:'Item'}</span><input class="itlab" data-niv="${r.l}" value="${esc(r.lab)}" aria-label="Designação do item ${r.k+1}">
        ${domSel(it)}${or?`<button type="button" class="itoralt ${it.oralLig?'on':''}" data-oral="${r.k}" aria-pressed="${!!it.oralLig}" title="Pontuação vem da grelha da Produção Oral">${ic('fala',13)} Oral</button>`:''}
        <span class="itcw"><input data-f="cot" value="${esc(String(it.cot).replace('.',','))}" inputmode="decimal" aria-label="Cotação"><small>pts</small></span>
        <span class="itac"><button class="btn sm ico" data-sub="${r.k}" title="Criar sub-itens" aria-label="Criar sub-itens" ${r.l>=3?'disabled':''}>↳</button>${r.l?`<button class="btn sm ico" data-out="${r.k}" title="Subir um nível" aria-label="Subir um nível">←</button>`:''}<button class="btn sm ico" data-up="${r.k}" aria-label="Subir">↑</button><button class="btn sm ico" data-dn="${r.k}" aria-label="Descer">↓</button><button class="btn sm ico dng" data-del="${r.k}" aria-label="Apagar">${ic('trash',13)}</button></span></div>`}).join('')||'<p class="mut" style="padding:14px">Ainda sem itens.</p>'}</div>
    <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="btn pri" id="it-add">${ic('plus',14)} Item</button><button class="btn" id="it-grp">${ic('layers',14)} Novo Grupo</button><button class="btn" id="it-addn">${ic('plus',14)} Vários Itens…</button></div>
    ${Object.keys(i.notas).length?'<div class="alert w" style="margin-top:10px">Este instrumento já tem classificações; alterar itens afeta as notas registadas.</div>':''}`;
  const re=()=>{i.itens.forEach(it=>{it.rot=itFolha(it)});i.nNiv=Math.max(1,...i.itens.map(it=>itPath(it).length));save();manterPosicao(()=>instItens(t,i))};
  const novo=(path,dom,cot)=>({id:uid()+Math.random().toString(36).slice(2,4),niv:path,rot:path[path.length-1],dom,cot});
  $$('#i-body [data-glab]').forEach(inp=>inp.onchange=()=>{const r=inp.closest('[data-gk]');const k=+r.dataset.gk,l=+r.dataset.gl;const [a,b]=bloco(k,l);for(let j=a;j<=b;j++){const p=itPath(i.itens[j]);p[l]=inp.value.trim()||p[l];i.itens[j].niv=p}re()});
  $$('#i-body [data-gadd]').forEach(bt=>bt.onclick=()=>{const [k,l]=bt.dataset.gadd.split('|').map(Number);const [a,b]=bloco(k,l);const last=i.itens[b];const p=itPath(last);const np=p.slice(0,l+1);const depth=Math.min(p.length,l+2);const base=p.slice(0,depth);base[depth-1]=incRot(p[depth-1]);i.itens.splice(b+1,0,novo(base,last.dom,last.cot));re()});
  $$('#i-body [data-gdel]').forEach(bt=>bt.onclick=()=>{const [k,l]=bt.dataset.gdel.split('|').map(Number);const [a,b]=bloco(k,l);if(!confirm(`Apagar o grupo “${P[k][l]}” e os seus ${b-a+1} itens?`))return;i.itens.splice(a,b-a+1).forEach(it=>Object.values(i.notas).forEach(n=>delete n[it.id]));re()});
  $$('#i-body .itf [data-niv]').forEach(inp=>inp.onchange=()=>{const it=i.itens[+inp.closest('[data-k]').dataset.k];const p=itPath(it);p[+inp.dataset.niv]=inp.value.trim();it.niv=p;re()});
  $$('#i-body .itf [data-f]').forEach(el=>el.onchange=()=>{const it=i.itens[+el.closest('[data-k]').dataset.k];it[el.dataset.f]=el.dataset.f==='cot'?Math.max(0,num(el.value)||0):el.value;re()});
  $$('#i-body [data-oral]').forEach(b=>b.onclick=()=>{const it=i.itens[+b.dataset.oral];it.oralLig=!it.oralLig;re()});
  $$('#i-body [data-del]').forEach(b=>b.onclick=()=>{const k=+b.dataset.del;const it=i.itens[k];i.itens.splice(k,1);Object.values(i.notas).forEach(n=>delete n[it.id]);re()});
  $$('#i-body [data-up]').forEach(b=>b.onclick=()=>{const k=+b.dataset.up;if(k>0){[i.itens[k-1],i.itens[k]]=[i.itens[k],i.itens[k-1]];re()}});
  $$('#i-body [data-dn]').forEach(b=>b.onclick=()=>{const k=+b.dataset.dn;if(k<i.itens.length-1){[i.itens[k+1],i.itens[k]]=[i.itens[k],i.itens[k+1]];re()}});
  $$('#i-body [data-out]').forEach(b=>b.onclick=()=>{const it=i.itens[+b.dataset.out];const p=itPath(it);if(p.length<2)return;p.splice(p.length-2,1);it.niv=p;re()});
  $$('#i-body [data-sub]').forEach(b=>b.onclick=()=>{const k=+b.dataset.sub;const it=i.itens[k];const p=itPath(it);if(p.length>=4)return;const l=p[p.length-1];const c1=/^\d+\.?$/.test(l)?l.replace(/\.$/,'')+'.1':/^[A-Z]\d*\.?$/i.test(l)?l.replace(/\.$/,'')+'.1':'a)';
    const n=parseInt(prompt('Quantos sub-itens em “'+l+'”?','2'))||0;if(n<1)return;const cot=Math.round((+it.cot||0)/n*100)/100;it.niv=[...p,c1];it.cot=cot;let lab=c1;const extra=[];for(let j=1;j<n;j++){lab=incRot(lab);extra.push(novo([...p,lab],it.dom,cot))}i.itens.splice(k+1,0,...extra);re()});
  $('#it-add').onclick=()=>{const l=i.itens[i.itens.length-1];if(!l){i.itens.push(novo(['1.'],(t.dominios[0]||{}).id,10));return re()}const p=itPath(l);i.itens.push(novo(p.length>1?[...p.slice(0,-1),incRot(p[p.length-1])]:[incRot(p[0])],l.dom,l.cot));re()};
  $('#it-grp').onclick=()=>{const gs=[...new Set(P.filter(p=>p.length>1).map(p=>p[0]))];const g=prompt('Nome do novo grupo:',gs.length?incRot(gs[gs.length-1]):'Grupo A');if(!g)return;const l=i.itens[i.itens.length-1];i.itens.push(novo([g.trim(),'1.'],l?l.dom:(t.dominios[0]||{}).id,l?l.cot:10));re()};
  $('#it-addn').onclick=()=>{const n=parseInt(prompt('Quantos itens?'));if(!n||n<1||n>80)return;const c=num(prompt('Cotação de cada item?','10'))||0;let l=i.itens[i.itens.length-1];for(let k=0;k<n;k++){const p=l?itPath(l).slice():['0.'];p[p.length-1]=incRot(p[p.length-1]);const it=novo(p,l?l.dom:(t.dominios[0]||{}).id,c);i.itens.push(it);l=it}re()};
};

/* Produção Oral: ícone próprio (balão de fala) e navegação */
ICONS.fala='<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z"/><path d="M8.5 8.2v2.6M11 7v5M13.5 8.2v2.6M16 9.2v.6"/>';
{const fix=()=>$$('[data-v="oral"]').forEach(b=>{b.onclick=e=>{e.preventDefault();go('oral')};const x=b.querySelector('[data-ico],svg');const sp=b.querySelector('[data-ico]');if(sp)sp.innerHTML=ic('fala',18);else if(x)x.outerHTML=ic('fala',18)});fix();const _nO=navOral;navOral=function(){const r=_nO.apply(this,arguments);fix();return r}}

