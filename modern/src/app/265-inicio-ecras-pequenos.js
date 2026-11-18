/* ===================== inicio-ecras-pequenos ===================== */
/* Início em ecrãs mais pequenos (portáteis e tablets): as três áreas arrumam-se conforme a largura e a altura do que têm.
   · 1180–1499 px (duas colunas): a área Complementar fica onde equilibra a página — por baixo da Principal, com os cartões
     a pares, ou por baixo da Lateral (como antes) — para não sobrar uma coluna meio vazia ao lado de outra muito comprida.
   · 760–1179 px (uma coluna): os cartões da Lateral e da Complementar ficam a pares, em tijolo. */
let _iniAd={w:0,t:0,raf:0};
function iniAltura(el){if(!el)return 0;const t=el.getBoundingClientRect().top;let b=0;[...el.children].forEach(c=>{if(c.offsetParent===null)return;const r=c.getBoundingClientRect();const m=parseFloat(getComputedStyle(c).marginBottom)||0;b=Math.max(b,r.bottom+m-t)});return b}
function iniSoma(el){if(!el)return {s:0,mx:0,n:0};let s=0,mx=0,n=0;[...el.children].forEach(c=>{if(c.offsetParent===null)return;const cs=getComputedStyle(c);const h=c.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0);s+=h;mx=Math.max(mx,h);n++});return {s,mx,n}}
function iniTij2(el,on){if(!el)return;const vis=[...el.children].filter(c=>c.offsetParent!==null||c.classList.contains('wgph'));if(vis.length<2)on=false;
  if(!on){if(el.classList.contains('tij2')){el.classList.remove('tij2');[...el.children].forEach(c=>{c.style.gridRowEnd=''})}return}
  el.classList.add('tij2');const U=4;[...el.children].forEach(c=>{const cs=getComputedStyle(c);if(cs.display==='none'){c.style.gridRowEnd='';return}
    const h=c.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0);const sp='span '+Math.max(1,Math.ceil(h/U));if(c.style.gridRowEnd!==sp)c.style.gridRowEnd=sp})}
function iniAdapta(){const lay=$('#view .inlay');if(!lay)return;const v=$('#view');const w=v.clientWidth;const main=$('#view .in-main'),side=$('#view .in-side'),fav=$('#view .in-fav'),hero=$('#view .in-hero');
  const duas=w>=1180&&w<1500,uma=w>=760&&w<1180;const arr=document.body.classList.contains('wgarr');
  if(!arr){let esq=false;
    if(duas&&main&&side&&fav&&!lay.classList.contains('sem-fav')&&!lay.classList.contains('sem-side')){
      const era=lay.classList.contains('fav-esq');const F=iniSoma(fav);const M=(hero?hero.offsetHeight:0)+iniAltura(main),Sd=iniAltura(side);
      /* altura da Complementar em cada sítio: numa coluna é a soma; a pares é cerca de metade (nunca menos do que o cartão maior) */
      const f1=era?F.s:iniAltura(fav),f2=era?iniAltura(fav):Math.max(F.mx,F.s*.56);
      const dir=Math.max(M,Sd+f1),es=Math.max(M+f2,Sd);const agora=Date.now();
      esq=era?!(dir+140<es):(es+140<dir);
      /* não andar a trocar: depois de uma troca, só volta a decidir se a largura mudar ou passado um bocado */
      if(esq!==era){if(_iniAd.w===w&&agora-_iniAd.t<1500)esq=era;else{_iniAd.w=w;_iniAd.t=agora}}}
    lay.classList.toggle('fav-esq',esq)}
  const esqA=lay.classList.contains('fav-esq');iniTij2(fav,uma||(duas&&esqA));iniTij2(side,uma)}
function iniAdaptaJa(){cancelAnimationFrame(_iniAd.raf);_iniAd.raf=requestAnimationFrame(()=>{try{iniAdapta()}catch(e){console.warn(e)}})}
function iniAdaptaLigar(){const v=$('#view');if(!v||typeof ResizeObserver==='undefined')return;
  if(!v._iniRO){v._iniRO=new ResizeObserver(iniAdaptaJa);v._iniRO.observe(v);v._iniMO=new MutationObserver(iniAdaptaJa)}
  const ro=v._iniRO,mo=v._iniMO;mo.disconnect();['.in-main','.in-side','.in-fav'].forEach(s=>{const el=$('#view '+s);if(!el)return;mo.observe(el,{childList:true});[...el.children].forEach(c=>{if(!c._iniO){c._iniO=1;ro.observe(c)}})})}
{const _vIe=vInicio;vInicio=function(){const r=_vIe.apply(this,arguments);try{_iniAd.t=0;iniAdaptaLigar();iniAdaptaJa();setTimeout(()=>{try{iniAdaptaLigar();iniAdapta()}catch(_){}},700)}catch(e){console.warn(e)}return r}}
{const _wgGe=wgGuardar;wgGuardar=function(){const r=_wgGe.apply(this,arguments);try{_iniAd.t=0;iniAdaptaLigar();iniAdaptaJa()}catch(_){}return r}}
{const _icv=iniColVazias;iniColVazias=function(){const r=_icv.apply(this,arguments);try{iniAdaptaJa()}catch(_){}return r}}
