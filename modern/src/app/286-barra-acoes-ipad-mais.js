/* 1.177 · iPad e telemóvel: a barra de ações do fundo deixa de deslizar e de aparecer cortada — os botões que não cabem vão para «Mais» (abre para cima) */
function barMaisToque(){const x=$('#barx'),bd=document.body;if(!x||bd.classList.contains('dev-pc'))return;if(!bd.classList.contains('dev-ipad')&&!bd.classList.contains('dev-tlm'))return;
  const pop=document.getElementById('barmpop');if(pop)pop.remove();
  x.querySelectorAll('[data-ovt]').forEach(e=>{e.style.removeProperty('display');delete e.dataset.ovt});
  let m=x.querySelector('#barmais');if(m)m.style.setProperty('display','none','important');
  const B=[...x.children].filter(e=>e.tagName==='BUTTON'&&e.id!=='barmais'&&e.offsetWidth);x.classList.remove('btq');
  const cabe=()=>x.scrollWidth<=x.clientWidth+1;if(B.length<2||cabe()){x.classList.add('btq');return}
  if(!m){x.insertAdjacentHTML('beforeend',`<button type="button" class="btn" id="barmais" aria-haspopup="true" aria-expanded="false">${ic('dots',16)} Mais</button>`);m=x.querySelector('#barmais')}else if(x.lastElementChild!==m)x.appendChild(m);
  m.style.removeProperty('display');
  /* os botões principais (ex.: «Nova Reunião») são os últimos a ir para «Mais» */
  const O=[...B.filter(z=>!z.classList.contains('pri')).reverse(),...B.filter(z=>z.classList.contains('pri')).reverse()];
  for(const z of O){if(cabe())break;z.dataset.ovt=1;z.style.setProperty('display','none','important')}x.classList.add('btq');
  m.onclick=e=>{e.stopPropagation();const ex=document.getElementById('barmpop');if(ex){ex.remove();m.setAttribute('aria-expanded','false');return}
    const H=B.filter(z=>z.dataset.ovt);const p=document.createElement('div');p.id='barmpop';p.className='barmpop';p.setAttribute('role','menu');
    p.innerHTML=H.map((z,k)=>`<button type="button" role="menuitem" data-k="${k}">${z.innerHTML}</button>`).join('');document.body.appendChild(p);
    const r=m.getBoundingClientRect();p.style.top=Math.max(8,r.top-p.offsetHeight-8)+'px';p.style.left=Math.max(8,Math.min(innerWidth-p.offsetWidth-8,r.right-p.offsetWidth))+'px';m.setAttribute('aria-expanded','true');
    p.querySelectorAll('[data-k]').forEach(z=>z.onclick=()=>{p.remove();m.setAttribute('aria-expanded','false');H[+z.dataset.k].click()});
    setTimeout(()=>document.addEventListener('pointerdown',function f(ev){if(!p.contains(ev.target)&&!m.contains(ev.target)){p.remove();m.setAttribute('aria-expanded','false')}document.removeEventListener('pointerdown',f,true)},true),0);
    p.addEventListener('keydown',ev=>{if(ev.key==='Escape'){p.remove();m.focus()}});const f0=p.querySelector('button');f0&&f0.focus()}}
function barMaisToqueJa(){clearTimeout(barMaisToque._t);barMaisToque._t=setTimeout(()=>{try{barMaisToque()}catch(_){}},40)}
{const _bLt=barLayout;barLayout=function(){const r=_bLt.apply(this,arguments);barMaisToqueJa();return r}}
addEventListener('resize',barMaisToqueJa);addEventListener('orientationchange',barMaisToqueJa);
try{const x0=document.getElementById('barx');if(x0)new MutationObserver(barMaisToqueJa).observe(x0,{childList:true})}catch(_){}
try{const st=document.createElement('style');st.textContent='html body:is(.dev-ipad,.dev-tlm):is(.dev-ipad,.dev-tlm):is(.dev-ipad,.dev-tlm):is(.dev-ipad,.dev-tlm) #bar #barx.btq{overflow:hidden!important;justify-content:center!important;scroll-snap-type:none!important}html body:is(.dev-ipad,.dev-tlm) .barmpop{max-height:60vh;overflow:auto}';document.head.appendChild(st)}catch(_){}
