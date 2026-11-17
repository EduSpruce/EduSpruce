/* ===================== v0.48: editor de tipos de instrumento (chips) ===================== */
const TP_PAL=['#c0392b','#d98b00','#7a4fd0','#2f7fd0','#1a7f37','#0891b2','#db2777','#65a30d','#b45309','#4f46e5','#0d9488','#9333ea','#e11d48','#15803d','#0369a1','#a16207','#7c3aed','#be185d','#047857','#475569'];
function tpCor(x,k){return TP_PAL[k%TP_PAL.length]}
function tpUso(){const u={};(S.anos||[]).forEach(a=>(a.turmas||[]).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(i.tipo)u[i.tipo]=(u[i.tipo]||0)+1})));return u}
function tpEditor(){const box=$('#tpEd'),ta=$('#tp');if(!box||!ta)return;const L=()=>ta.value.split('\n').map(x=>x.trim()).filter(Boolean);
  const set=arr=>{ta.value=arr.join('\n');ta.dispatchEvent(new Event('change'));draw()};
  const draw=()=>{const l=L(),u=tpUso();box.innerHTML=`<div class="tpl">${l.map((x,k)=>`<div class="tpc" draggable="true" data-k="${k}" style="--pc:${tpCor(x,k)}"><span class="tpg" aria-hidden="true">⋮⋮</span><i></i><span class="tpn" contenteditable="plaintext-only" spellcheck="false" data-ren="${k}" title="Clique para mudar o nome">${esc(x)}</span>${u[x]?`<small title="${u[x]} instrumento${u[x]>1?'s':''} com este tipo">${u[x]}</small>`:''}<button type="button" data-rm="${k}" ${u[x]?'disabled title="Em uso"':'title="Remover"'} aria-label="Remover ${esc(x)}">×</button></div>`).join('')}
    <form class="tpadd"><input id="tp-nv" placeholder="Novo tipo…" maxlength="40"><button class="btn sm pri">${ic('plus',13)} Adicionar</button></form></div>`;
    box.querySelector('form').onsubmit=e=>{e.preventDefault();const v=$('#tp-nv').value.trim();if(!v)return;if(L().some(x=>x.toLowerCase()===v.toLowerCase())){toast('Esse tipo já existe','aviso');return}set([...L(),v]);setTimeout(()=>{const n=$('#tp-nv');if(n)n.focus()},30)};
    box.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const l=L();l.splice(+b.dataset.rm,1);set(l)});
    box.querySelectorAll('[data-ren]').forEach(el=>{el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();el.blur()}if(e.key==='Escape'){el.textContent=L()[+el.dataset.ren];el.blur()}};
      el.onblur=()=>{const l=L(),k=+el.dataset.ren,v=el.textContent.trim(),o=l[k];if(!v||v===o){el.textContent=o;return}if(l.some((x,j)=>j!==k&&x.toLowerCase()===v.toLowerCase())){toast('Esse tipo já existe','aviso');el.textContent=o;return}
        l[k]=v;let n=0;(S.anos||[]).forEach(a=>(a.turmas||[]).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(i.tipo===o){i.tipo=v;n++}})));set(l);if(n)toast(`Tipo renomeado em ${n} instrumento${n>1?'s':''}`,'ok')}});
    let dk=null;box.querySelectorAll('.tpc').forEach(c=>{c.ondragstart=e=>{dk=+c.dataset.k;c.classList.add('drg');e.dataTransfer.effectAllowed='move'};c.ondragend=()=>c.classList.remove('drg');
      c.ondragover=e=>{e.preventDefault();c.classList.add('ovr')};c.ondragleave=()=>c.classList.remove('ovr');
      c.ondrop=e=>{e.preventDefault();c.classList.remove('ovr');const to=+c.dataset.k;if(dk==null||dk===to)return;const l=L();const [x]=l.splice(dk,1);l.splice(to,0,x);dk=null;set(l)}})};
  draw();const rp=$('#tp-rep');if(rp)rp.onclick=()=>{const u=tpUso();const l=[...TIPOS_INST,...L().filter(x=>!TIPOS_INST.includes(x)&&u[x])];set(l);toast('Tipos predefinidos repostos','ok')}}
new MutationObserver(()=>{const b=$('#tpEd');if(b&&!b.childElementCount)tpEditor()}).observe(document.getElementById('view')||document.body,{childList:true,subtree:true});

