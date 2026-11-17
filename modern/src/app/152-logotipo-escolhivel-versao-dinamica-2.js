function logoAtual(){return EF_LOGOS[S.cfg&&S.cfg.logoApp]||EF_LOGOS.monograma}
function logoAplicar(){const L=logoAtual();$$('#side .brand .logo,.lgh .lgi').forEach(el=>{if(el.dataset.lg!==L.n){el.innerHTML=L.svg;el.dataset.lg=L.n;el.classList.add('eflg')}});
  const f=document.querySelector('link[rel="icon"]');if(f&&f.href!==L.fav)f.href=L.fav;const a=document.querySelector('link[rel="apple-touch-icon"]');if(a&&a.href!==L.ios)a.href=L.ios}
EF_LOGO=logoAtual().svg;
{const _gLg=go;go=function(v){const r=_gLg.apply(this,arguments);try{logoAplicar();verAplicar()}catch(_){}return r}}
new MutationObserver(()=>{try{logoAplicar()}catch(_){}}).observe(document.body,{childList:true});
{const _vdL=vDefinicoes;vDefinicoes=function(){const r=_vdL.apply(this,arguments);try{const est=$('#ap-est');if(est&&!$('#ap-logo')){const pref=est.closest('.pref')||est.parentElement;const cur=EF_LOGOS[S.cfg.logoApp]?S.cfg.logoApp:'monograma';
  pref.insertAdjacentHTML('beforebegin',`<div class="pref" id="ap-logow"><b>Logótipo da app</b><div class="lgopts" id="ap-logo">${Object.entries(EF_LOGOS).map(([k,L])=>`<button type="button" data-lg="${k}" class="lgopt ${cur===k?'on':''}" aria-pressed="${cur===k}"><span class="lgprev">${L.svg}</span><span>${L.n}</span></button>`).join('')}</div></div>`);
  $$('#ap-logo [data-lg]').forEach(b=>b.onclick=()=>{S.cfg.logoApp=b.dataset.lg;save();$$('#ap-logo [data-lg]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});logoAplicar();toast('Logótipo: '+logoAtual().n,'ok')})}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
/* versão na barra lateral: sempre a atual, e abre as novidades */
function verAplicar(){const v=$('#side .ver');if(!v)return;let _onde='dados encriptados na sua conta';const t='EduSpruce v'+VERSAO+' ('+VERSAO_DATA+') · '+_onde;if(v.textContent!==t){v.textContent=t;v.title='Ver as novidades desta versão';v.setAttribute('role','button');v.tabIndex=0;v.style.cursor='pointer';v.onclick=()=>novidades();v.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();novidades()}}}}
try{verAplicar();logoAplicar()}catch(_){}
/* primeiros passos num modal quando ainda não há nada */
function passosLista(){const c=S.cfg,a=A();return [
  {ok:!!(c.escola&&c.professor),t:'Preencher a escola e o professor',d:'Nome da escola, logótipo e o seu nome — aparecem nos documentos e relatórios.',v:'definicoes',ic:'building'},
  {ok:S.anos.length>0,t:'Criar o ano letivo',d:'Ex.: 2026/2027. Depois pode importar o calendário escolar em PDF.',v:'turmas',ic:'calendar'},
  {ok:!!a&&minhasDisc().length>0,t:'Escolher as disciplinas que leciona',d:'Define o regime de classificação (0–20 ou %/níveis 1–5) e os critérios de partida.',v:'turmas',ic:'book'},
  {ok:!!(a&&a.turmas.length),t:'Criar as turmas',d:'Importe o Excel da turma (com as fotografias) ou crie à mão.',v:'turmas',ic:'school'},
  {ok:!!(a&&a.turmas.some(t=>t.alunos.length)),t:'Assinalar os alunos da sua disciplina',d:'Indique quem frequenta a disciplina — só esses entram na avaliação.',v:'alunos',ic:'users'}]}
function passosModal(forcar){const P=passosLista();const feitos=P.filter(x=>x.ok).length;if(!forcar&&(S.anos.length||feitos===P.length))return;if($('dialog.ppm'))return;const prox=P.findIndex(x=>!x.ok);
  const d=document.createElement('dialog');d.className='ppm';d.setAttribute('aria-labelledby','ppm-t');
  d.innerHTML=`<div class="ppmh"><span class="ppml">${logoAtual().svg}</span><div><h2 id="ppm-t">Bem-vindo ao EduSpruce</h2><p class="mut">Cinco passos para começar. Pode sair e voltar quando quiser: o progresso fica guardado.</p></div></div>
    <div class="ppmbar" role="progressbar" aria-valuemin="0" aria-valuemax="${P.length}" aria-valuenow="${feitos}"><i style="width:${Math.round(feitos/P.length*100)}%"></i></div><small class="mut">${feitos} de ${P.length} concluídos</small>
    <ol class="ppms">${P.map((x,k)=>`<li class="${x.ok?'ok':''} ${k===prox?'cur':''}"><span class="ppmn">${x.ok?ic('check',15):k+1}</span><span class="ppmt"><b>${esc(x.t)}</b><small>${esc(x.d)}</small></span>${x.ok?'<span class="tag ok">feito</span>':`<button type="button" class="btn sm ${k===prox?'pri':''}" data-ppg="${x.v}">${k===prox?'Começar':'Abrir'}</button>`}</li>`).join('')}</ol>
    <div class="ppmf"><button type="button" class="btn" id="ppm-demo">${ic('sparkle',15)} Experimentar com Dados de Demonstração</button><button type="button" class="btn" id="ppm-tour">${ic('help',15)} Visita Guiada</button><span class="sp1"></span><button type="button" class="btn" id="ppm-x">Mais Tarde</button></div>`;
  document.body.appendChild(d);const fim=()=>{try{d.close()}catch(_){}d.remove();try{sessionStorage.setItem('ef.ppm','1')}catch(_){}};
  d.addEventListener('cancel',e=>{e.preventDefault();fim()});d.querySelectorAll('[data-ppg]').forEach(b=>b.onclick=()=>{fim();go(b.dataset.ppg)});
  d.querySelector('#ppm-x').onclick=fim;d.querySelector('#ppm-tour').onclick=()=>{fim();try{visitaGuiada()}catch(_){}};
  d.querySelector('#ppm-demo').onclick=()=>{fim();try{criarDemo()}catch(_){}};
  try{d.showModal()}catch(_){d.setAttribute('open','')}const f=d.querySelector('.btn.pri')||d.querySelector('#ppm-x');if(f)f.focus()}
{const _pa=posArranque;posArranque=function(){if(!S.anos.length){let vis=false;try{vis=!!sessionStorage.getItem('ef.ppm')}catch(_){}if(!vis){setTimeout(()=>passosModal(),500);return}}return _pa.apply(this,arguments)}}
{const _vIp=vInicio;vInicio=function(){const r=_vIp.apply(this,arguments);try{const c=[...$$('#view .card')].find(x=>/Primeiros passos/i.test((x.querySelector('h2')||{}).textContent||''));if(c&&!c.querySelector('#pp-ver')){const h=c.querySelector('h2');h.classList.add('pph');h.insertAdjacentHTML('beforeend',`<button type="button" class="btn sm" id="pp-ver">${ic('list',13)} Ver Guia</button>`);$('#pp-ver').onclick=()=>passosModal(true)}
  if(!S.anos.length){let vis=false;try{vis=!!sessionStorage.getItem('ef.ppm')}catch(_){}if(!vis&&!$('dialog.ppm')&&!document.body.classList.contains('login-on'))setTimeout(()=>passosModal(),400)}}catch(e){console.warn(e)}return r};if(go._f)go._f.inicio=vInicio}

/* tema escuro: manter .escurox sincronizado com o tema (botões da barra lateral, sistema operativo) */
function escuroxAtualizar(){try{const t=(S.cfg&&S.cfg.tema)||'auto';const r=document.documentElement.dataset.theme;const esc_=r==='dark'||(!r&&t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.body.classList.toggle('escurox',esc_)}catch(_){}}
new MutationObserver(escuroxAtualizar).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',escuroxAtualizar)}catch(_){}
{const _aT=aplicarTema;aplicarTema=function(){const r=_aT.apply(this,arguments);escuroxAtualizar();return r}}
escuroxAtualizar();

