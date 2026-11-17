/* ===================== EduApps em ecrã inteiro (Spruce It, Pulso, Formulários, Provas; o EduSchedule tem o seu próprio topo) =====================
   Sem menu lateral: uma só linha em cima — a barra da EduSpruce com o ícone da casa (volta às Apps) antes do nome da app, a escola, o ano letivo, os ícones e as ações da vista. */
const EDUAPPS={arena:1,pulso:1,forms:1,provas:1};
function eaVoltar(){go(go._f&&go._f.hub?'hub':'inicio')}
function eaAplicar(){
  const app=!!EDUAPPS[VIEW];document.body.classList.toggle('eduapp',app);
  const t=document.querySelector('#bar .ttlw');if(!t)return;let c=document.getElementById('eacasa');
  if(app&&!c){c=document.createElement('button');c.type='button';c.id='eacasa';c.className='btn ico';c.title='Voltar à EduSpruce';c.setAttribute('aria-label','Voltar à EduSpruce');c.innerHTML=ic('home',20);c.onclick=eaVoltar;t.insertBefore(c,t.firstChild)}
  if(c)c.hidden=!app;
  try{typeof barLayout==='function'&&barLayout()}catch(_){}
}
{const _gEa=go;go=function(v){const r=_gEa.apply(this,arguments);try{eaAplicar()}catch(e){console.warn(e)}return r};Object.assign(go,_gEa);go._f=_gEa._f}
{const st=document.createElement('style');st.textContent=`html body.eduapp #side,html body.eduapp #railTgl,html body.eduapp #tabbar,html body.eduapp .spvolta,html body.eduapp #menuBtn,html body.eduapp #bar #crumb,html body.eduapp #bar #ctxTurma{display:none!important}
html body.eduapp #main{margin-left:0!important;width:100%!important;max-width:none!important}
html body.eduapp #bar{padding-left:14px!important}
html body.eduapp #bar .ttlw,html body.eduapp.dev-pc #bar.hgrid>.ttlw,html body.eduapp.est-sge #bar .ttlw{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:10px!important}
html body.eduapp #bar .ttlw #ttl{margin:0!important;white-space:nowrap}
html body.eduapp #bar #eacasa{width:40px;height:40px;min-height:40px;padding:0;display:inline-flex;align-items:center;justify-content:center}
html body #bar #eacasa{flex:0 0 auto}
html body.eduapp.dev-pc #bar.hgrid{grid-template-areas:"t e x a u i"!important}
html body.eduapp #bar #barx{grid-area:x!important;justify-content:flex-end!important;flex-wrap:nowrap!important;margin:0!important}
html body #bar #eacasa[hidden]{display:none!important}
html body.est-sge #bar #eacasa{border-radius:0}`;document.head.appendChild(st)}

/* 1.077: a cor de cada app (a mesma das Apps) também no ícone do menu lateral e no topo de cada app */
function eaCores(){try{if(typeof HUB_APPS==='undefined')return;let st=document.getElementById('eacores');if(!st){st=document.createElement('style');st.id='eacores';document.head.appendChild(st)}
  st.textContent=HUB_APPS.map(a=>{const c=hubCor(a)[0];return `html body #side [data-v="${a.v}"]:not(.on) svg,html body #side [data-v="${a.v}"]:not(.on) [data-ico]{color:${c}!important}`}).join('\n')
   +`\nhtml body #bar #eaic{flex:0 0 auto;display:inline-flex}html body #bar #eaic[hidden]{display:none!important}html body #bar #eaic .hbic{box-shadow:none}html body.est-sge #bar #eaic .hbic{border-radius:0}`;
  const t=document.querySelector('#bar .ttlw');if(!t)return;const a=HUB_APPS.find(x=>x.v===VIEW);let s=document.getElementById('eaic');
  if(EDUAPPS[VIEW]&&a){try{hubCss()}catch(_){}if(!s){s=document.createElement('span');s.id='eaic';const c=document.getElementById('eacasa');t.insertBefore(s,c?c.nextSibling:t.firstChild)}s.innerHTML=hubIcone(a,32);s.hidden=false}else if(s)s.hidden=true}catch(e){console.warn(e)}}
{const _gEc=go;go=function(v){const r=_gEc.apply(this,arguments);eaCores();return r};Object.assign(go,_gEc);go._f=_gEc._f}
setTimeout(eaCores,0);
