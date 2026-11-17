/* ===================== v0.44: animações subtis ===================== */
const animOK=()=>!REDUZ()&&!document.documentElement.classList.contains('a11y-rm')&&S.cfg.animacoes!==false;
{const _gA=go;go=function(v){const mud=go._ult!==v;const r=_gA.apply(this,arguments);try{if(mud&&animOK()){const w=$('#view');w.classList.remove('vin');void w.offsetWidth;w.classList.add('vin');try{contarNumeros(w)}catch(_){};clearTimeout(go._vin);go._vin=setTimeout(()=>w.classList.remove('vin'),1100)}}catch(_){}return r}}
/* números a contar nos indicadores novos */
function contarNums(root){if(!animOK())return;(root||document).querySelectorAll('.pnk b,.pnstat b,.ormd b,.orembk b').forEach(el=>{if(el.dataset.cnt)return;el.dataset.cnt=1;const m=el.textContent.trim().match(/^(\d{1,4})(%?)$/);if(!m)return;const fim=+m[1],suf=m[2];if(fim<2)return;const t0=performance.now(),dur=650;const f=now=>{const k=Math.min(1,(now-t0)/dur);const e=1-Math.pow(1-k,3);el.textContent=Math.round(fim*e)+suf;if(k<1)requestAnimationFrame(f)};el.textContent='0'+suf;requestAnimationFrame(f)})}
{const _gN2=go;go=function(v){const r=_gN2.apply(this,arguments);try{requestAnimationFrame(()=>contarNums($('#view')))}catch(_){}return r}}

/* ===================== v0.44: efemérides mundiais («Neste dia na história») ===================== */
