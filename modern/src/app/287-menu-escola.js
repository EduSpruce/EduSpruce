/* ===================== menu-escola ===================== */
/* Menu próprio para trocar de escola no cabeçalho (substitui a lista nativa, sem espaço). */
(function(){
  let menu=null;
  function fecha(){if(menu){menu.remove();menu=null;const se=document.getElementById('selEsc');if(se)se.setAttribute('aria-expanded','false')}}
  function abre(se){
    if(menu){fecha();return}
    const sw=se.closest('.escsw');if(!sw||se.disabled)return;
    const L=todasEscolas();
    menu=document.createElement('div');menu.className='escmenu';menu.setAttribute('role','listbox');menu.setAttribute('aria-label','Escola');
    menu.innerHTML=[...se.options].map(o=>{const e=L.find(x=>escId(x)===o.value)||{};
      const lg=e.logo?`<img src="${esc(e.logo)}" alt="">`:ic((TIPOS_ESCOLA[tipoEscola(e)]||{}).ic||'home',16);
      return `<button type="button" role="option" class="escop${o.value===se.value?' on':''}" aria-selected="${o.value===se.value}" data-v="${esc(o.value)}"><span class="escop-lg">${lg}</span><span class="escop-n">${esc(o.textContent)}</span></button>`}).join('');
    document.body.appendChild(menu);
    const r=sw.getBoundingClientRect(),w=Math.max(r.width,280);
    menu.style.minWidth=w+'px';
    menu.style.left=Math.max(8,Math.min(r.left,innerWidth-menu.offsetWidth-8))+'px';
    menu.style.top=(r.bottom+6)+'px';
    se.setAttribute('aria-expanded','true');
    menu.addEventListener('click',ev=>{const b=ev.target.closest('.escop');if(!b)return;const v=b.dataset.v;fecha();if(v!==se.value){se.value=v;se.dispatchEvent(new Event('change',{bubbles:true}))}se.focus()});
    const bs=[...menu.querySelectorAll('.escop')];(bs.find(b=>b.classList.contains('on'))||bs[0])?.focus();
    menu.addEventListener('keydown',ev=>{const i=bs.indexOf(document.activeElement);
      if(ev.key==='ArrowDown'){ev.preventDefault();bs[(i+1)%bs.length].focus()}
      else if(ev.key==='ArrowUp'){ev.preventDefault();bs[(i-1+bs.length)%bs.length].focus()}
      else if(ev.key==='Escape'||ev.key==='Tab'){ev.preventDefault();fecha();se.focus()}});
  }
  document.addEventListener('mousedown',ev=>{
    const se=ev.target.closest&&ev.target.closest('#selEsc');
    if(se){ev.preventDefault();abre(se);return}
    if(menu&&!menu.contains(ev.target))fecha();
  },true);
  document.addEventListener('keydown',ev=>{
    const se=ev.target&&ev.target.id==='selEsc'?ev.target:null;
    if(se&&[' ','Enter','ArrowDown','ArrowUp'].includes(ev.key)){ev.preventDefault();abre(se)}
  },true);
  addEventListener('resize',fecha);addEventListener('scroll',ev=>{if(menu&&!menu.contains(ev.target))fecha()},true);
})();
