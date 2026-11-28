/* ===== 1.112 — módulos por conta e o que cada perfil vê =====
   · Professor: as Definições ficam sem o que é técnico (Conta e Acesso, Auditoria, Ferramentas; em Segurança só a cópia
     e o caixote do lixo; em Conta e Dados sem as cópias de reserva nem a palavra-passe de reserva; sem «Recomeçar do Zero»).
     O administrador vê tudo.
   · «Os Meus Módulos»: cada utilizador liga os que quer (S.cfg é da conta); o menu e as Apps mudam logo.
   · Apps: com menos de 7 apps à vista, o separador «Apps» desaparece do menu e do Início (volta ao ligar o 7.º módulo).
   · Licenças (base para vender módulos): eduspruce_autorizados.modulos (text[]; null = todos) — script 0020.
     MOD_PERM=null → todos incluídos; o administrador escolhe por conta em Os Meus Módulos › Módulos por Conta. */
let MOD_PERM=null;
const HUB_MIN=7;
const modAdmin=()=>!!(SESSAO&&SESSAO.papel==='admin');
function modInc(id){return modAdmin()||!MOD_PERM||MOD_PERM.includes(id)}
function modIdDe(inp){for(const g of MOD_GR)for(const [i,id] of g[2])if(i===inp)return id;
  return ({'mod-jnn':'jornalnote','mod-nf':'notasf','mod-snw':'snweb','mod-apres':'apres'})[inp]||inp.replace(/^mod-|-on$/g,'')}
/* licença: as apps não incluídas ficam desligadas no menu e nas Apps */
function modLicApps(){HUB_APPS.forEach(a=>{if(!a.on||a._mp)return;const o=a.on;a.on=()=>modInc(a.id)&&o();a._mp=1})}
modLicApps();setTimeout(modLicApps,0); /* também as apps acrescentadas por peças carregadas depois desta (ex.: Spruce Review): sem isto ficavam fora da licença */
const hubNApps=()=>{try{return HUB_APPS.filter(a=>!a.on||a.on()).length}catch(_){return HUB_MIN}};
const hubPoucas=()=>hubNApps()<HUB_MIN;
{const _hm=hubMenuMods;hubMenuMods=function(){const r=_hm.apply(this,arguments);try{const p=hubPoucas();document.body.classList.toggle('hub-poucas',p);
    document.querySelectorAll('#side [data-v="hub"],#tnavHold [data-v="hub"]').forEach(b=>{if(b.hidden!==p)b.hidden=p});
    if(p&&VIEW==='hub'&&window.__esPronto)setTimeout(()=>{if(VIEW==='hub'&&hubPoucas())go('inicio')},0)}catch(e){console.warn(e)}return r}}
{const _gMd=go;go=function(v){try{if(v==='hub'&&hubPoucas())v='inicio';const a=HUB_APPS.find(x=>x.v===v&&x.on);if(a&&!modInc(a.id)){toast(a.n+' não está incluído na sua conta. Fale com o administrador.','aviso');v='inicio'}}catch(_){}
  const r=_gMd.apply(this,[v].concat([].slice.call(arguments,1)));try{hubMenuMods()}catch(_){}return r};if(_gMd._f)go._f=_gMd._f}

/* ---------- Definições: o professor não vê o que é técnico ---------- */
const MOD_TEC_TABS=['conta','auditoria','ferr'];
const MOD_TEC_TIT=/^(Código de Acesso|Bloqueio dos Dados de Base|Espaço Utilizado|Registo de Importações|Privacidade \(RGPD\)|Cópia de Reserva no Google Drive|Nunca Ficar sem Nada|Palavra-Passe de Reserva|Recomeçar do Zero|Como Funciona)/;
function modDefsFiltrar(){const v=$('#view');if(!v||VIEW!=='definicoes')return;
  const b=v.querySelector('.deftabs [data-dt2="mods"]');if(b&&!b.dataset.mm){b.dataset.mm=1;b.innerHTML=ic('layers',15)+' Os Meus Módulos'}
  if(!modAdmin()){v.querySelectorAll('.deftabs [data-dt2]').forEach(x=>{if(MOD_TEC_TABS.includes(x.dataset.dt2))x.remove()});
    v.querySelectorAll('h2,h3').forEach(h=>{if(!MOD_TEC_TIT.test(h.textContent.trim()))return;const c=h.closest('section.nvs,.card');if(c&&c!==v&&v.contains(c))c.remove()})}
  if(UI.defTab==='mods')modsMeus()}
{const _vdM=vDefinicoes;vDefinicoes=function(){if(!modAdmin()&&MOD_TEC_TABS.includes(UI.defTab))UI.defTab='geral';const r=_vdM.apply(this,arguments);
  try{modDefsFiltrar()}catch(e){console.warn(e)}[60,400,1200].forEach(t=>setTimeout(()=>{try{modDefsFiltrar()}catch(_){}},t));return r};if(go._f)go._f.definicoes=vDefinicoes}

/* ---------- Os Meus Módulos ---------- */
function modsMeus(){const M=$('#view #def-mods');if(!M)return;
  if(!M.querySelector('.mm-int'))M.insertAdjacentHTML('afterbegin',`<p class="hint mm-int" style="margin:0 0 12px">${ic('layers',14)} Escolha os módulos que quer usar. Ficam logo disponíveis no menu lateral e nas Apps, e desaparecem quando os desliga. A escolha é só da sua conta.</p>`);
  if(!M.dataset.mmb){M.dataset.mmb=1;M.addEventListener('change',e=>{if(!e.target.matches('input[type=checkbox]'))return;setTimeout(()=>{try{hubMenuMods();if(typeof menuAgendar==='function')menuAgendar()}catch(_){}},30)})}
  M.querySelectorAll('label.chk input[type=checkbox]').forEach(i=>{if(!i.id)return;const id=modIdDe(i.id);const lb=i.closest('label.chk');if(!lb)return;
    const inc=modInc(id);lb.classList.toggle('mm-bloq',!inc);if(!inc){if(i.checked){i.checked=false;i.dispatchEvent(new Event('change',{bubbles:true}))}i.disabled=true;
      if(!lb.querySelector('.mm-tag'))lb.insertAdjacentHTML('beforeend',`<span class="tag mm-tag">${ic('cadeado',12)} Não incluído</span>`)}
    else if(lb.querySelector('.mm-tag')){i.disabled=false;lb.querySelector('.mm-tag').remove()}});
  if(modAdmin())modContasCartao(M)}
function modCatalogo(){const L=[],vis=new Set();MOD_GR.forEach(g=>g[2].forEach(([inp,id])=>{if(vis.has(id))return;vis.add(id);const a=HUB_APPS.find(x=>x.id===id);
  const lb=document.getElementById(inp);const t=lb&&lb.closest('label.chk');const n=(a&&a.n)||(t&&(t.querySelector('b,strong')||{}).textContent)||id;L.push({id,n})}));
  document.querySelectorAll('#def-mods label.chk input[id]').forEach(i=>{if(i.id==='ar-moe')return;const id=modIdDe(i.id);if(vis.has(id))return;vis.add(id);
    const lb=i.closest('label.chk');L.push({id,n:((lb.querySelector('b,strong')||{}).textContent||id).trim()})});return L}
async function modContasCartao(M){if(M.querySelector('#mdc'))return;
  M.insertAdjacentHTML('beforeend',`<section class="mdg" id="mdc"><h3 class="mdg-h">${ic('shield',15)} Módulos por Conta <span class="tag">Só o administrador vê</span></h3>
    <p class="hint" style="margin:0 0 10px">Escolha os módulos a que cada conta tem acesso. Por omissão, todas têm todos. Os não incluídos aparecem bloqueados ao professor. (Base para, mais tarde, vender o acesso a módulos.)</p><div id="mdc-l" class="mut">A carregar…</div></section>`);
  const L=M.querySelector('#mdc-l');let rows;
  try{if(nvL().prov!=='supabase')throw new Error('sem bd');const p=await sbObter();const {data,error}=await p.cliente.from('eduspruce_autorizados').select('h,papel,modulos');if(error)throw error;rows=data||[]}
  catch(e){L.className='';L.innerHTML=`<div class="alert">Para escolher os módulos por conta, corra o ficheiro <b>0020_modulos_por_conta.sql</b> no Supabase (SQL Editor). Até lá, todas as contas têm todos os módulos.</div>`;return}
  const em=new Map();for(const x of ((typeof acLocal==='function'&&acLocal().gContas)||[]))if(x&&x.email){try{em.set(await acHash(x.email),x.email)}catch(_){}}
  const cat=modCatalogo();const nome=r=>em.get(r.h)||('Conta '+r.h.slice(0,8)+'…');
  L.className='';L.innerHTML=`<div style="overflow:auto"><table class="lst"><thead><tr><th>Conta</th><th>Perfil</th><th>Módulos</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(nome(r))}</td><td>${r.papel==='admin'?'Administrador':'Professor'}</td><td>${r.papel==='admin'||!r.modulos?'Todos':(r.modulos.length+' de '+cat.length)}</td><td>${r.papel==='admin'?'':`<button type="button" class="btn sm" data-mdc="${esc(r.h)}">${ic('edit',14)} Escolher</button>`}</td></tr>`).join('')||'<tr><td colspan="4" class="mut">Sem contas.</td></tr>'}</tbody></table></div>`;
  L.querySelectorAll('[data-mdc]').forEach(b=>b.onclick=()=>{const r=rows.find(x=>x.h===b.dataset.mdc);if(r)modContaEditar(r,nome(r),cat,()=>{const s=M.querySelector('#mdc');if(s)s.remove();modContasCartao(M)})})}
function modContaEditar(r,nome,cat,depois){const tem=r.modulos?new Set(r.modulos):null;
  openDrawer('Módulos de '+nome,`<div class="ed"><label class="chk"><input type="checkbox" id="mce-todos" ${tem?'':'checked'}> <b>Todos os módulos (sem limite)</b></label>
    <div id="mce-l" style="display:grid;gap:6px;margin:10px 0 14px">${cat.map(m=>`<label class="chk"><input type="checkbox" data-mce="${esc(m.id)}" ${!tem||tem.has(m.id)?'checked':''}> ${esc(m.n)}</label>`).join('')}</div>
    <div class="row" style="gap:8px"><button type="button" class="btn pri" id="mce-ok">${ic('check',15)} Guardar</button><button type="button" class="btn" id="mce-x">Cancelar</button></div></div>`);
  const T=$('#mce-todos'),Ls=$$('[data-mce]');const sinc=()=>Ls.forEach(x=>{x.disabled=T.checked;if(T.checked)x.checked=true});T.onchange=sinc;sinc();
  $('#mce-x').onclick=closeDrawer;
  $('#mce-ok').onclick=async()=>{const v=T.checked?null:Ls.filter(x=>x.checked).map(x=>x.dataset.mce);
    try{const p=await sbObter();const {error}=await p.cliente.from('eduspruce_autorizados').update({modulos:v}).eq('h',r.h);if(error)throw error;
      try{audit('Conta','Módulos por conta',nome+': '+(v?v.length+' módulos':'todos'))}catch(_){}toast('Módulos de '+nome+' guardados. A conta vê a mudança ao voltar a abrir a app.','ok');closeDrawer();depois()}
    catch(e){toast('Não foi possível guardar: '+(e.message||e),'erro')}}}

/* a licença da conta lê-se depois de abrir (sem atrasar a abertura); sem o script 0020 ficam todos incluídos */
setTimeout(function modLer(){if(!window.__esPronto)return setTimeout(modLer,1500);(async()=>{try{if(modAdmin()||nvL().prov!=='supabase')return;
  const v=await sbRpc('eduspruce_meus_modulos');MOD_PERM=Array.isArray(v)?v:null;modLicApps();hubMenuMods();if(typeof menuAgendar==='function')menuAgendar();
  const a=HUB_APPS.find(x=>x.v===VIEW&&x.on);if(a&&!modInc(a.id))go('inicio');if(VIEW==='definicoes'&&UI.defTab==='mods')modsMeus()}catch(_){MOD_PERM=null}})()},1500);
setTimeout(()=>{try{hubMenuMods()}catch(_){}},400);

{const s=document.createElement('style');s.textContent=`
html body.hub-poucas #side [data-v="hub"],html body.hub-poucas #tnavHold [data-v="hub"],html body.hub-poucas .hub-mini{display:none!important}
html body #def-mods label.mm-bloq{opacity:.6}
html body #def-mods label.mm-bloq .mm-tag{margin-left:auto;display:inline-flex;align-items:center;gap:4px}
html body #def-mods #mdc{grid-column:1/-1}
`;document.head.appendChild(s)}
