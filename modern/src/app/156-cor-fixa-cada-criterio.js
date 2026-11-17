/* ===================== v0.46: uma cor fixa para cada critério/domínio ===================== */
function corHex(c){const x=document.createElement('canvas').getContext('2d');x.fillStyle=c;return x.fillStyle}
const DOM_PAL=['#2563eb','#16a34a','#d97706','#9333ea','#db2777','#0891b2','#dc2626','#65a30d','#7c3aed','#0d9488'];
function accHSL(){const c=(getComputedStyle(document.body).getPropertyValue('--acc')||'#2563eb').trim();const cv=document.createElement('canvas').getContext('2d');cv.fillStyle=c;const hx=cv.fillStyle;if(!/^#/.test(hx))return [220,.65,.45];
  const r=parseInt(hx.slice(1,3),16)/255,g=parseInt(hx.slice(3,5),16)/255,b=parseInt(hx.slice(5,7),16)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s_=0;const l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s_=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return [h,s_,l]}
const DOM_OFF=[0,150,40,250,320,90,190,290,20,120];
function domPal(){const key=(S.cfg.estilo||'')+'|'+(S.cfg.acento||'')+'|'+document.body.classList.contains('escurox')+'|'+document.documentElement.className;if(domPal._k===key&&domPal._p)return domPal._p;const [h,s_,l]=accHSL();const esc_=document.body.classList.contains('escurox');
  const sat=Math.round(Math.min(.62,Math.max(.42,s_*.85))*100),lig=esc_?62:Math.round(Math.min(46,Math.max(36,l*100)));
  domPal._p=DOM_OFF.map((o,k)=>`hsl(${Math.round((h+o)%360)} ${sat}% ${lig+(k%2?4:0)}%)`);domPal._k=key;return domPal._p}
function domCor(t,d){if(d&&d.cor)return d.cor;const L=(t&&t.dominios)||[];const k=Math.max(0,L.findIndex(x=>x===d||x.id===(d&&d.id)));const P=domPal();return P[k%P.length]}
function domPorAb(t){const M={};((t&&t.dominios)||[]).forEach(d=>{if(d.ab)M[String(d.ab).trim().toUpperCase()]=domCor(t,d);if(d.nome)M[String(d.nome).trim().toUpperCase()]=domCor(t,d)});return M}
function domCores(){const t=T();if(!t)return;const M=domPorAb(t);if(!Object.keys(M).length)return;
  $$('#view thead th,#view .itdc,#view .rg b').forEach(th=>{if(th.dataset.dcok)return;const tx=(th.childNodes[0]&&th.childNodes[0].textContent||th.textContent).trim().toUpperCase();const c=M[tx];if(c){th.dataset.dcok=1;th.style.setProperty('--dc',c);th.classList.add('dcth')}});
  $$('#view .itdc b,#view .tag').forEach(b=>{if(b.dataset.dcok)return;const c=M[b.textContent.trim().toUpperCase()];if(c){b.dataset.dcok=1;b.style.color=c}});
  $$('#perfilap svg text').forEach(tx=>{const c=M[tx.textContent.trim().toUpperCase()];if(c)tx.style.fill=c});
  $$('.itdom').forEach(sel=>{const o=sel.selectedOptions&&sel.selectedOptions[0];const d=o&&(t.dominios||[]).find(x=>x.id===o.value);if(d)sel.style.boxShadow='inset 4px 0 0 '+domCor(t,d)});
  $$('#perfilap .pdom,#perfilap [data-dom]').forEach(el=>{const d=(t.dominios||[]).find(x=>x.id===el.dataset.dom);if(d)el.style.setProperty('--dc',domCor(t,d))})}
{let _dc=0;new MutationObserver(()=>{cancelAnimationFrame(_dc);_dc=requestAnimationFrame(()=>{try{domCores()}catch(_){}})}).observe(document.body,{childList:true,subtree:true})}
document.addEventListener('input',e=>{const x=e.target;if(!x||!x.matches||!x.matches('input[data-dcor]'))return;const t=T();const d=t&&t.dominios[+x.dataset.dcor];if(!d)return;d.cor=x.value;const ic_=x.parentElement.querySelector('.domic');if(ic_)ic_.style.setProperty('--dc',x.value);save()});

{try{(S.anos||[]).forEach(a=>(a.turmas||[]).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(i.oral&&i.nome==='Avaliação Oral')i.nome='Produção Oral'})))}catch(_){}}

