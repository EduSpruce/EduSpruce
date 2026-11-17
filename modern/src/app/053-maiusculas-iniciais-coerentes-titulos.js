/* ---------- Maiúsculas iniciais coerentes (títulos, menus, botões, separadores, rótulos) ---------- */
const MINUS=new Set('a o e as os de da do das dos em no na nos nas por para com ao à aos às um uma que ou sem até pelo pela'.split(' '));
function tcap(str){let first=true;return str.replace(/[^\s]+/g,w=>{const lw=w.toLowerCase();
  if(!first&&MINUS.has(lw)){return w}first=false;
  return w.replace(/(^|[\/(\-“"'])(\p{Ll})(?=\p{L})/gu,(m,a,b)=>a+b.toUpperCase())})}
const TC_SEL='table.grid thead th:not(.v),.cleg span,.cp b,.pvn span:not(.mut),.kpi .v.tc,#side .lbl,#ttl,#bar .ctx,.oa,.selall,.card h2,.card h3,#drawer h3,#dw-t,.btn,.tabs button,.seg button,table.lst th,table.mx th:not(.v),.ed label:not(.chk),.kpi .l,.sheet .sec,.sheet h1,.sheet th,table.msai tr.sec td,.dica-t b,.sign div';
const TC_SKIP='.mut,.tag,.nt,.cargo,.pill,.art,.mb,.cam,input,select,textarea,option,.hint';
function titulos(root){
  (root||document).querySelectorAll(TC_SEL).forEach(el=>{
    if(el.matches(TC_SKIP))return;
    const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const sk=n.parentElement.closest(TC_SKIP);return sk&&el.contains(sk)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
    let n;while((n=w.nextNode())){const v=n.nodeValue;if(!/\p{L}/u.test(v))continue;const nv=tcap(v);if(nv!==v)n.nodeValue=nv}
  });
}
function acessib(){document.querySelectorAll('table.grid tbody tr[data-a]').forEach(tr=>{const sk=tr.querySelector('.stk');let nm='';if(sk){const cl=sk.cloneNode(true);cl.querySelectorAll('*').forEach(x=>{if(x.isConnected&&x!==cl&&x.textContent.trim().length<=3)x.remove()});cl.querySelectorAll('.tag,.bdg,[aria-hidden=true],sup,small').forEach(x=>x.remove());nm=cl.textContent.replace(/\s+/g,' ')}tr.querySelectorAll('input:not([aria-label])').forEach(inp=>{const c=inp.dataset.c;const th=c!=null?tr.closest('table').querySelectorAll('thead tr:nth-child(2) th')[+c]:null;inp.setAttribute('aria-label',nm.trim()+(th?' — '+th.textContent.trim():''))})});
  document.querySelectorAll('img:not([alt]),img[alt=""]').forEach(im=>{const tr=im.closest('[data-a],[data-fi],.fcard,.mscard,tr');const n=tr&&(tr.querySelector('b,.stk,.nm')||{}).textContent;im.setAttribute('alt',n?'Fotografia de '+n.trim():'Imagem')})}
/* tabelas largas: deslocamento horizontal dentro do cartão (nunca a página inteira) */
function envolverTabelas(){document.querySelectorAll('#view table').forEach(t=>{if(t.closest('.tblw,.gwrap,.mxw,.sheet')||t.parentElement.dataset.ov)return;const p=t.parentElement;
  if(getComputedStyle(p).overflowX!=='visible'){p.dataset.ov=1;return}const w=document.createElement('div');w.className='tblw';p.insertBefore(w,t);w.appendChild(t)})}
document.addEventListener('click',e=>{if(e.target.id==='dwscrim'){closeDrawer();return}{const ro=e.target.closest('[data-ro]');if(ro&&VIEW!=='reunioes'){reuniaoVer(ro.dataset.ro);return}}if(e.target.closest('#barEsc')){go('escola');return}const bb=e.target.closest('#pqBtn,#undoBtn,#apresBtn,#ajBtn,#favBtn');if(bb){({pqBtn:paleta,undoBtn:desfazer,apresBtn:alternarApresentacao,ajBtn:ajudaContexto,favBtn:alternarFavorito})[bb.id]();return}if(e.target.closest('#menuBtn')){document.body.classList.toggle('menu');return}if(e.target.id==='scrim'){document.body.classList.remove('menu')}});
/* ---------- tema: automático / claro / escuro ---------- */
function aplicarTema(){const t=(S.cfg&&S.cfg.tema)||'auto';const r=document.documentElement;if(t==='auto')r.removeAttribute('data-theme');else r.dataset.theme=t;
  const el=document.getElementById('temaSel');if(!el)return;
  el.innerHTML=[['auto','auto','Auto'],['light','sun','Claro'],['dark','moon','Escuro']].map(([k,i,l])=>`<button type="button" data-tema="${k}" class="${t===k?'on':''}" title="Tema ${l.toLowerCase()}" aria-label="Tema ${l.toLowerCase()}">${ic(i,14)}<span>${l}</span></button>`).join('');
  el.querySelectorAll('[data-tema]').forEach(b=>b.onclick=()=>{S.cfg.tema=b.dataset.tema;save();aplicarTema();if(VIEW==='definicoes')go('definicoes')})}
/* ---------- animações subtis: números a contar ao entrar numa secção ---------- */
const REDUZ=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function ajustarBarra(){const b=document.getElementById('bar');if(!b)return;b.classList.remove('bar2');if(innerWidth<=1000)return;const x=document.getElementById('barx');
  const t=document.querySelector('.ttlw #ttl');if(b.scrollWidth>b.clientWidth+1||(x&&x.children.length&&t&&t.scrollWidth>t.clientWidth+1))b.classList.add('bar2')}
addEventListener('resize',()=>{clearTimeout(ajustarBarra._t);ajustarBarra._t=setTimeout(ajustarBarra,80)});

