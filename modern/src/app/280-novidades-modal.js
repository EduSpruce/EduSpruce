/* ===================== 1.150 · novidades num modal: na primeira entrada depois de uma atualização, mostra tudo o que mudou desde a última versão vista ===================== */
function novidadesDesde(v0){
  const nv=v=>parseFloat(String(v||'0').replace(/[^0-9.]/g,''))||0;
  /* as notas de cada versão vêm do mesmo sítio que Definições › Ferramentas › Novidades */
  let html='';const _od=openDrawer;try{openDrawer=(t,h)=>{html=h};novidades()}catch(e){console.warn(e)}finally{openDrawer=_od}
  const t=document.createElement('div');t.innerHTML=html;
  const vs=[...t.querySelectorAll('details.nvver')].filter(d=>{const b=d.querySelector('summary b');return b&&nv(b.textContent)>nv(v0)});
  if(!vs.length)return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const blocos=vs.map(d=>{const b=d.querySelector('summary b').textContent,dt=(d.querySelector('summary .mut')||{}).textContent||'',ul=d.querySelector('ul');
    return '<section><h3>'+esc(b)+'<small>'+esc(dt.replace(/^\s*·\s*/,''))+'</small></h3>'+(ul?ul.outerHTML:'')+'</section>'}).join('');
  const n=vs.length;
  const dlg=document.createElement('dialog');dlg.className='nvmodal';dlg.setAttribute('aria-labelledby','nvm-t');
  dlg.innerHTML='<div class="nvm-cab"><span class="nvm-ic">'+(typeof ic==='function'?ic('sparkle',22):'★')+'</span><div><h2 id="nvm-t">O que há de novo</h2><p>'+
    (n===1?'Mudou isto desde a última vez que entrou.':'Desde a última vez que entrou saíram '+n+' versões: '+esc(vs[n-1].querySelector('summary b').textContent.replace('Versão ',''))+' a '+esc(VERSAO)+'.')+
    '</p></div></div><div class="nvm-corpo">'+blocos+'</div><div class="nvm-pe"><button class="btn primary" id="nvm-ok">Continuar</button></div>';
  document.body.appendChild(dlg);
  const fecha=()=>{try{dlg.close()}catch(_){}dlg.remove()};
  dlg.querySelector('#nvm-ok').onclick=fecha;dlg.addEventListener('cancel',e=>{e.preventDefault();fecha()});
  dlg.addEventListener('click',e=>{if(e.target===dlg)fecha()});
  try{dlg.showModal()}catch(_){dlg.setAttribute('open','')}dlg.querySelector('#nvm-ok').focus()}
/* ---------- Definições › Changelog: todas as alterações desde a criação da app ---------- */
function defChangelog(){let html='';const _od=openDrawer;try{openDrawer=(t,h)=>{html=h};novidades()}catch(e){console.warn(e)}finally{openDrawer=_od}
  const n=(html.match(/class="nvver/g)||[]).length;
  return `<div class="card defcl"><h2>${ic('list',18)} Changelog</h2><p class="hint">Todas as alterações à EduSpruce desde a primeira versão (${n} versões). Versão atual: <b>${VERSAO}</b>.</p>
  <div class="row" style="margin:6px 0 12px"><input type="search" id="cl-q" placeholder="Procurar nas alterações…" style="flex:1;min-width:200px"><button class="btn" id="cl-abre">Abrir todas</button><button class="btn" id="cl-fecha">Fechar todas</button></div>
  <div id="cl-lista">${html}</div></div>`}
function bindChangelog(){const L=$('#cl-lista');if(!L)return;
  $('#cl-abre').onclick=()=>L.querySelectorAll('details').forEach(d=>d.open=true);
  $('#cl-fecha').onclick=()=>L.querySelectorAll('details').forEach(d=>d.open=false);
  $('#cl-q').oninput=e=>{const q=e.target.value.trim().toLowerCase();L.querySelectorAll('details.nvver').forEach(d=>{let algum=false;d.querySelectorAll('li').forEach(li=>{const ok=!q||li.textContent.toLowerCase().includes(q);li.style.display=ok?'':'none';if(ok)algum=true});const v=!q||algum||d.querySelector('summary').textContent.toLowerCase().includes(q);d.style.display=v?'':'none';if(q&&v)d.open=true})}}
{const _vd=vDefinicoes;vDefinicoes=function(){const t=UI.defTab;let r;
  if(t==='changelog'){UI.defTab='auditoria';r=_vd.apply(this,arguments);UI.defTab='changelog';const tabs=$('#view .deftabs');$('#view').innerHTML='';if(tabs)$('#view').appendChild(tabs);$('#view').insertAdjacentHTML('beforeend',defChangelog());bindChangelog()}
  else r=_vd.apply(this,arguments);
  try{const tb=$('#view .deftabs');if(tb&&!tb.querySelector('[data-dtcl]')){const b=document.createElement('button');b.dataset.dtcl='1';b.innerHTML=ic('list',15)+' Changelog';tb.appendChild(b);b.onclick=()=>{UI.defTab='changelog';vDefinicoes()}}
    if(t==='changelog'&&tb)tb.querySelectorAll('button').forEach(x=>x.classList.toggle('on',!!x.dataset.dtcl))}catch(_){}return r};if(go._f)go._f.definicoes=vDefinicoes}
