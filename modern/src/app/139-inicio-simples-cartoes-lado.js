/* ===================== Início simples: cartões lado a lado, redimensionáveis (puxar o canto) ===================== */
const INI_SP=[4,6,8,12];
function iniTamAplicar(){const m=$('#view .in-main');if(!m)return;m.classList.add('ingrid');const T0=S.cfg.iniTam||{};
  [...m.children].filter(c=>c.classList.contains('card')||/^w-/.test(c.id)).forEach(c=>{const k=c.dataset.ik||iniKey(c);const sp=iniLer(T0,k)||12;c.style.gridColumn='span '+sp;c.dataset.sp=sp;
    if(c.querySelector(':scope>.wgrs'))return;const h=document.createElement('button');h.type='button';h.className='wgrs';h.title='Puxar para mudar a largura (duplo clique alterna)';h.setAttribute('aria-label','Largura do cartão: '+sp+' de 12 colunas. Setas esquerda/direita mudam.');
    h.innerHTML='<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M11 4 4 11M11 8 8 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';c.appendChild(h);
    const set=sp=>{c.style.gridColumn='span '+sp;c.dataset.sp=sp;h.setAttribute('aria-label','Largura do cartão: '+sp+' de 12 colunas');S.cfg.iniTam=S.cfg.iniTam||{};for(const o in S.cfg.iniTam)if(o!==k&&iniLer({[o]:1},k))delete S.cfg.iniTam[o];if(sp===12)delete S.cfg.iniTam[k];else S.cfg.iniTam[k]=sp};
    h.addEventListener('pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();try{h.setPointerCapture(e.pointerId)}catch(_){}
      const r=c.getBoundingClientRect();const col=(m.clientWidth+16)/12;const x0=e.clientX;document.body.classList.add('wgrsz');c.classList.add('wgrsing');
      const mv=ev=>{const w=r.width+(ev.clientX-x0);const want=Math.round((w+16)/col);const sp=INI_SP.reduce((a,b)=>Math.abs(b-want)<Math.abs(a-want)?b:a);if(+c.dataset.sp!==sp)set(sp)};
      const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);document.body.classList.remove('wgrsz');c.classList.remove('wgrsing');save()};
      h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up)});
    h.addEventListener('dblclick',e=>{e.preventDefault();const i=INI_SP.indexOf(+c.dataset.sp);set(INI_SP[(i+1)%INI_SP.length]);save()});
    h.addEventListener('keydown',e=>{const i=INI_SP.indexOf(+c.dataset.sp);let n=i;if(e.key==='ArrowLeft')n=Math.max(0,i-1);else if(e.key==='ArrowRight')n=Math.min(INI_SP.length-1,i+1);else return;e.preventDefault();set(INI_SP[n]);save()})})}
{const _wp=wgPreparar;wgPreparar=function(){const r=_wp.apply(this,arguments);try{if(wgModo()==='simples')iniTamAplicar()}catch(e){console.warn(e)}return r}}
{const _wgG=wgGuardar;wgGuardar=function(){const r=_wgG.apply(this,arguments);try{if(wgModo()==='simples'){$$('#view .in-side>.card,#view .in-fav>.card').forEach(c=>{c.style.gridColumn='';const x=c.querySelector(':scope>.wgrs');if(x)x.remove()});iniTamAplicar()}}catch(_){}return r}}

/* 1.123 — cartões lado a lado sem espaço vazio: cada cartão fica com a sua altura e os seguintes encaixam por baixo (grelha em tijolo) */
function iniTijolo(){const m=$('#view .in-main.ingrid');if(!m)return;m.classList.add('intij');const U=4;
  [...m.children].forEach(c=>{const cs=getComputedStyle(c);if(cs.display==='none'){c.style.gridRowEnd='';return}const h=c.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0);const sp='span '+Math.max(1,Math.ceil(h/U));if(c.style.gridRowEnd!==sp)c.style.gridRowEnd=sp});
  if(!m._ro&&typeof ResizeObserver!=='undefined'){let t=0;m._ro=new ResizeObserver(()=>{cancelAnimationFrame(t);t=requestAnimationFrame(()=>{try{iniTijolo()}catch(_){}})});[...m.children].forEach(c=>m._ro.observe(c));
    new MutationObserver(L=>{L.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)m._ro.observe(n)}));try{iniTijolo()}catch(_){}}).observe(m,{childList:true})}}
{const _it=iniTamAplicar;iniTamAplicar=function(){const r=_it.apply(this,arguments);try{iniTijolo()}catch(e){console.warn(e)}return r}}
