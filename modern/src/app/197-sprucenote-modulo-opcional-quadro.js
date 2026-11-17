/* =====================================================================
   0.915 · SpruceNote — módulo opcional (quadro visual livre), na barra lateral acima das turmas
   ===================================================================== */
TITLES.sprucenote='SpruceNote';
const snOn=()=>!(S.cfg&&S.cfg.modSN===false);
function vSpruceNote(){if(!snOn()){$('#view').innerHTML=`<div class="card empty">${ic('grid',30)}<br><b>O SpruceNote está desativado</b><br><span class="mut">Ative-o em Definições › Módulos Opcionais. Os quadros guardados mantêm-se.</span><br><br><button class="btn pri" id="sn-on">Ativar o SpruceNote</button></div>`;$('#sn-on').onclick=()=>{S.cfg.modSN=true;save();snNav();go('sprucenote')};return}
  UI.mqCtx='prof';barBtns([]);$('#view').innerHTML='<div id="sn-c"></div>';mqVista()}
function vSnJornal(){UI.mqCtx='jornal';barBtns([{id:'b-jn',t:ic('news',15)+' Jornal Escolar',f:()=>go('jornal')}]);$('#view').innerHTML='<div id="sn-c"></div>';mqVista()}
TITLES.snjornal='JornalNote';
function snNav(){const side=$('#side');if(!side)return;let b=$('#side [data-v="sprucenote"]');
  if(!b){const ref=$('#side [data-v="cprofij"]')||$('#side [data-v="jornal"]');if(!ref)return;ref.insertAdjacentHTML('afterend',`<button class="nav" data-v="sprucenote" title="SpruceNote — quadros, notas e ideias"><span data-ico>${ic('grid',18)}</span><span class="lbl">SpruceNote</span></button>`);b=$('#side [data-v="sprucenote"]');b.onclick=()=>go('sprucenote')}
  else{const ref=$('#side [data-v="cprofij"]');if(ref&&ref.nextElementSibling!==b&&ref.parentElement===b.parentElement)ref.after(b)}
  b.style.display=snOn()?'':'none';b.hidden=!snOn(); /* hidden: o aplicarPrefs repõe o display de todas as entradas */
  /* subnível no Jornal Escolar: SpruceNote só do jornal */
  const jr=$('#side [data-v="jornal"]');let bj=$('#side [data-v="snjornal"]');if(jr){if(!bj){jr.insertAdjacentHTML('afterend',`<button class="nav navsub" data-v="snjornal" title="JornalNote — quadros só do jornal escolar, separados do SpruceNote"><span data-ico>${ic('grid',16)}</span><span class="lbl">JornalNote</span></button>`);bj=$('#side [data-v="snjornal"]');bj.onclick=()=>go('snjornal')}else if(jr.nextElementSibling!==bj&&jr.parentElement===bj.parentElement)jr.after(bj);bj.style.display=jr.style.display!=='none'&&jr.offsetParent!==null?'':'none'}}
{const _gS=go;go=function(v){if(v==='sprucenote'&&go._f&&!go._f.sprucenote)go._f.sprucenote=vSpruceNote;if(v==='snjornal'&&go._f&&!go._f.snjornal)go._f.snjornal=vSnJornal;if(v==='jornal'&&UI.jnTab==='quadros')UI.jnTab='painel';const r=_gS.apply(this,arguments);try{snNav();$$('#side [data-v="sprucenote"]').forEach(b=>b.classList.toggle('on',v==='sprucenote'));$$('#side [data-v="snjornal"]').forEach(b=>b.classList.toggle('on',v==='snjornal'))}catch(_){}return r}}
if(go._f){go._f.sprucenote=vSpruceNote;go._f.snjornal=vSnJornal}setTimeout(snNav,450);setTimeout(snNav,1600);
{const _ca3=cartaoAvisosDef,_ba3=bindAvisosDef;cartaoAvisosDef=function(){let h=_ca3.apply(this,arguments);return h.replace(/(<div class="card ed" id="def-mods">[\s\S]*?)(<\/div>)$/,`$1<label class="chk" style="margin-top:8px"><input type="checkbox" id="mod-sn" ${snOn()?'checked':''}> ${ic('grid',15)} <span><b>SpruceNote</b><br><span class="mut">Quadros visuais: notas, listas, ligações, imagens, colunas, setas e quadros dentro de quadros</span></span></label>$2`)+`<div class="card ed" id="def-zero"><h2>${ic('trash',18)} Recomeçar do Zero</h2><p class="hint" style="margin-top:0">Apaga definitivamente <b>todos</b> os seus dados da EduSpruce: os ficheiros encriptados na sua conta Google (pasta privada da app no Drive) e a cópia deste aparelho. Os outros aparelhos ficam vazios na próxima vez que abrirem. Não há forma de desfazer.</p><button type="button" class="btn dng" id="zero-go">${ic('trash',15)} Apagar Tudo da Minha Conta e Recomeçar…</button></div>`};
  bindAvisosDef=function(){const r=_ba3.apply(this,arguments);const c=$('#mod-sn');if(c)c.onchange=()=>{S.cfg.modSN=c.checked;save();snNav();toast(c.checked?'SpruceNote ativado':'SpruceNote desativado','ok')};const z=$('#zero-go');if(z)z.onclick=nvApagarTudo;return r}}
/* apagar tudo da conta Google e recomeçar (pedido pelo próprio utilizador) */
async function nvApagarTudo(){const r=await avisoModal('Apagar tudo e recomeçar?',['Vão ser apagados definitivamente todos os dados da EduSpruce desta conta: na nuvem (Google Drive, pasta privada da app) e neste aparelho.','Sugestão: antes, exporte uma cópia em Definições › Segurança.'],[{t:'Cancelar',v:null},{t:'Continuar',c:'dng',v:'sim'}]);if(r!=='sim')return;
  const w=(prompt('Para confirmar, escreva APAGAR')||'').trim().toUpperCase();if(w!=='APAGAR'){toast('Nada foi apagado.');return}
  ocupado('A apagar a nuvem…');try{const L=nvL();if(L.prov==='google'){const G=PROV.google;const m=await G._mapa(true);await nvPool(Object.keys(m),8,async n=>{try{await G.apagar(n)}catch(e){console.warn(e)}})}
    else if(L.prov&&PROV[L.prov]&&PROV[L.prov].lista){const P_=PROV[L.prov];const L2=await P_.lista();await nvPool(L2,6,async n=>{try{await P_.apagar(n)}catch(_){}})}}
  catch(e){livre();await avisoModal('Não foi possível apagar a nuvem',['A ligação falhou ('+(e.message||e)+'). Nada foi apagado neste aparelho; tente de novo com internet.'],[{t:'Continuar',c:'pri',v:1}]);return}
  ocupado('A limpar este aparelho…');try{audit('Contas','Dados apagados pelo próprio utilizador','')}catch(_){}window.__efApagar=true;try{save=function(){};saveNow=function(){}}catch(_){}
  const _rm=Storage.prototype.removeItem;try{Object.keys(localStorage).filter(k=>(/^(edugest|eduflow|es\.|ef\.|nv)/i.test(k)||k==='eskeep')&&k!==ES_PC_KEY&&k!==REP_KEY).forEach(k=>_rm.call(localStorage,k))}catch(_){}
  try{sessionStorage.clear()}catch(_){}
  try{const D=indexedDB.databases?await indexedDB.databases():[];await Promise.all([...D.map(d=>d.name),'edugest','eduflow-ev'].filter((x,k,a)=>x&&a.indexOf(x)===k).map(n=>new Promise(ok=>{const q=indexedDB.deleteDatabase(n);q.onsuccess=q.onerror=q.onblocked=()=>ok()})))}catch(_){}
  try{Storage.prototype.setItem=function(){}}catch(_){}location.reload()}
/* bloqueadores de anúncios / privacidade: avisam com uma janela (podem impedir o Google e a sincronização) */
async function bloqDetetar(){if(sessionStorage.getItem('es.bloqv'))return;let bl=false;
  try{const mk=c=>{const d=document.createElement('div');d.className=c;d.style.cssText='position:absolute;left:-9999px;top:-9999px;width:300px;height:250px';d.innerHTML='&nbsp;';document.documentElement.appendChild(d);return d};const d=mk('adsbox ad-banner ads adsbygoogle pub_300x250 textads'),k=mk('es-ctl-box');await new Promise(r=>setTimeout(r,250));const vis=x=>{const cs=getComputedStyle(x);return x.offsetHeight>0&&cs.display!=='none'&&cs.visibility!=='hidden'};bl=vis(k)&&!vis(d);d.remove();k.remove()}catch(_){}
  if(!bl&&/^https:/.test(location.protocol)){try{await fetch('https://accounts.google.com/gsi/client',{mode:'no-cors',cache:'no-store'})}catch(_){bl=true}}
  if(!bl)return;try{sessionStorage.setItem('es.bloqv','1')}catch(_){}
  const esp=()=>{if(document.getElementById('nvgate')||document.body.classList.contains('login-on')&&!document.querySelector('#login .lgb')){setTimeout(esp,1500);return}
    avisoModal('Bloqueador de anúncios detetado',['A EduSpruce não tem anúncios nem rastreadores, mas alguns bloqueadores de anúncios ou de privacidade impedem o início de sessão com Google e a sincronização dos dados.','Para funcionar bem, desative o bloqueador para '+(location.hostname||'eduspruce.pt')+' (adicione o site às exceções) e recarregue a página.'],[{t:'Recarregar',v:'r'},{t:'Entendi',c:'pri',v:1}]).then(v=>{if(v==='r')location.reload()})};setTimeout(esp,1200)}
setTimeout(()=>{try{bloqDetetar()}catch(_){}},2500);

/* 0.916 · modalidade de interação: a caixa de foco só aparece quando se usa o teclado */
addEventListener('keydown',e=>{if(e.key==='Tab'||e.key.startsWith('Arrow'))document.documentElement.classList.add('kbd')},true);
addEventListener('pointerdown',()=>document.documentElement.classList.remove('kbd'),true);
/* fotografia: botão do caixote do lixo no canto superior direito */
function phLixo(){[['#pf-del','.pfz'],['#fa-rm','#fa-ph']].forEach(([del,box])=>{const d=document.querySelector(del),b=document.querySelector(box);if(!d||!b||b.querySelector('.phdel'))return;
  let ph=box==='#fa-ph'?b.firstElementChild:b.firstElementChild;if(!ph)return;const w=document.createElement('span');w.className='phwrap';ph.before(w);w.appendChild(ph);
  w.insertAdjacentHTML('beforeend',`<button type="button" class="phdel" title="Apagar a fotografia" aria-label="Apagar a fotografia">${ic('trash',16)}</button>`);w.querySelector('.phdel').onclick=e=>{e.preventDefault();e.stopPropagation();d.click()}})}
new MutationObserver(()=>{if(document.querySelector('#pf-del,#fa-rm'))phLixo()}).observe(document.body,{childList:true,subtree:true});
/* relatórios (e outras folhas A4): ver todas, página a página, ajustar à largura ou à página, aumentar/diminuir */
function zmAplicar(){const w=document.querySelector('#view .sheetwrap');if(!w)return;const L=[...w.children].filter(x=>x.classList.contains('sheet'));if(!L.length)return;
  let bar=w.previousElementSibling;if(!bar||!bar.classList.contains('zmbar')){bar=document.createElement('div');bar.className='zmbar noprint';w.before(bar)}
  const k=VIEW;UI.zm=UI.zm||{};const z=UI.zm[k]=UI.zm[k]||{modo:'normal',f:1,p:0};z.p=Math.min(z.p,L.length-1);
  const sh=L[0];w.style.zoom=1;w.classList.remove('zgrid','zpag');L.forEach(x=>x.classList.remove('zon'));
  const sw=sh.offsetWidth||794,shh=sh.offsetHeight||1123;const disp=w.parentElement.clientWidth-24,alt=innerHeight-(w.getBoundingClientRect().top>0?Math.min(w.getBoundingClientRect().top,200):160)-40;
  let f=z.f;if(z.modo==='largura')f=disp/sw;else if(z.modo==='pagina')f=Math.min(disp/sw,alt/shh);else if(z.modo==='todas'){w.classList.add('zgrid');f=Math.max(.2,Math.min(.6,(disp/Math.min(L.length,4)-24)/sw))}
  if(z.modo==='pagina'||z.modo==='umapag'){w.classList.add('zpag');L[z.p].classList.add('zon')}
  f=Math.max(.2,Math.min(3,f));w.style.zoom=f;
  const B=(m,l,i_)=>`<button type="button" data-zm="${m}" class="${z.modo===m?'on':''}" title="${l}">${ic(i_,14)} ${l}</button>`;
  bar.innerHTML=`<div class="seg">${B('todas','Todas','grid')}${B('umapag','Página a Página','file')}${B('pagina','Página Inteira','image')}${B('largura','Largura','arrowR')}${B('normal','100 %','search')}</div>
    <button type="button" class="btn sm ico" data-zf="-" aria-label="Diminuir">−</button><span class="zmv">${Math.round(f*100)} %</span><button type="button" class="btn sm ico" data-zf="+" aria-label="Aumentar">+</button>
    ${(z.modo==='pagina'||z.modo==='umapag')&&L.length>1?`<span class="zmpg"><button type="button" class="btn sm ico" data-zp="-1" aria-label="Página anterior" ${z.p?'':'disabled'}>‹</button>${z.p+1} / ${L.length}<button type="button" class="btn sm ico" data-zp="1" aria-label="Página seguinte" ${z.p<L.length-1?'':'disabled'}>›</button></span>`:`<span class="mut" style="font-size:12.5px">${L.length} página${L.length>1?'s':''}</span>`}`;
  bar.querySelectorAll('[data-zm]').forEach(b=>b.onclick=()=>{z.modo=b.dataset.zm;if(z.modo==='normal')z.f=1;zmAplicar()});
  bar.querySelectorAll('[data-zf]').forEach(b=>b.onclick=()=>{z.f=Math.max(.2,Math.min(3,f*(b.dataset.zf==='+'?1.15:1/1.15)));if(z.modo!=='umapag')z.modo='livre';zmAplicar()});
  bar.querySelectorAll('[data-zp]').forEach(b=>b.onclick=()=>{z.p=Math.max(0,Math.min(L.length-1,z.p+ +b.dataset.zp));zmAplicar()})}
{let _zt=0;new MutationObserver(()=>{clearTimeout(_zt);_zt=setTimeout(()=>{const w=document.querySelector('#view .sheetwrap');if(w&&!(w.previousElementSibling&&w.previousElementSibling.classList.contains('zmbar')))zmAplicar()},60)}).observe(document.getElementById('view'),{childList:true,subtree:false});addEventListener('resize',()=>{const z=UI.zm&&UI.zm[VIEW];if(z&&/largura|pagina|todas/.test(z.modo))zmAplicar()})}
/* logótipo animado: escolha em Definições › Aparência (também no carregamento e na barra de sincronização) */
const LGA=[['auto','Automático','segue o tema (SGE no tema SGE)'],['classico','Clássico','o «S» desenha-se e o ponto dourado acende'],['sge','SGE','quadrado branco, azul SGE, entrada seca'],['pulso','Pulsar','o logótipo pulsa com ondas'],['rodar','Rodar','o logótipo vira em 3D'],['simples','Simples','sem animação']];
function lgaResolvido(){const k=(S.cfg&&S.cfg.logoAnim)||'auto';return k==='auto'?(S.cfg&&S.cfg.estilo==='sge'?'sge':'classico'):k}
function lgaAplicar(){const k=lgaResolvido();const h=document.documentElement;LGA.forEach(([x])=>h.classList.toggle('lga-'+x,x===k));try{localStorage.setItem('es.lga',k)}catch(_){}}
{const _apL=aplicarPrefs;aplicarPrefs=function(){const r=_apL.apply(this,arguments);try{lgaAplicar()}catch(_){}return r}}
{const _dA=defAparencia;defAparencia=function(){const h=_dA.apply(this,arguments);const cur=(S.cfg.logoAnim)||'auto';const tpl=document.querySelector('#splash-tpl');const svg=tpl?tpl.innerHTML.split('<div class="spn">')[0]:'';
  return h+`<div class="card"><h2>${ic('sparkle',18)} Logótipo Animado</h2><p class="hint" style="margin-top:0">Aparece ao abrir a app e enquanto sincroniza.</p><div class="lgag">${LGA.map(([k,l,d])=>`<button type="button" class="lgao ${cur===k?'on':''}" data-lga="${k}" aria-pressed="${cur===k}"><span class="lgap lgv-${k==='auto'?(S.cfg.estilo==='sge'?'sge':'classico'):k}">${svg}</span><b>${l}</b><small>${d}</small></button>`).join('')}</div></div>`}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lga]');if(!b)return;S.cfg.logoAnim=b.dataset.lga;save();lgaAplicar();document.querySelectorAll('[data-lga]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});toast('Logótipo animado: '+b.querySelector('b').textContent,'ok')});
setTimeout(()=>{try{lgaAplicar()}catch(_){}},200);
/* ecrã do código: painel com hora e data ao lado do teclado (ecrãs largos) */
function pinLado(){const L=document.querySelector('#login.pinmode');if(!L||L.querySelector('.pinside'))return;const esc_=S&&S.escolas?null:null;
  const e=(()=>{try{return escolaPorId(escAtiva())}catch(_){return null}})();const nome=(()=>{try{return nomeEscola(e)}catch(_){return ''}})();
  L.insertAdjacentHTML('afterbegin',`<div class="pinside" aria-hidden="true"><div class="pshr" id="ps-h"></div><div class="psd" id="ps-d"></div>${nome?`<div class="pse">${e&&e.logo?`<img src="${esc(e.logo)}" alt="">`:''}<span>${esc(nome)}</span></div>`:''}</div>`);
  const tk=()=>{const h=document.getElementById('ps-h');if(!h){clearInterval(L._pt);return}const d=new Date();h.textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');document.getElementById('ps-d').textContent=d.toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'})};tk();L._pt=setInterval(tk,5000)}
new MutationObserver(()=>{if(document.querySelector('#login.pinmode'))pinLado()}).observe(document.body,{childList:true,subtree:false,attributes:true,attributeFilter:['class']});
setInterval(()=>{if(document.querySelector('#login.pinmode:not(:has(.pinside))'))pinLado()},700);

