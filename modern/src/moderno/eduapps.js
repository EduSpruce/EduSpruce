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
html body.eduapp #bar .ttlw{display:flex!important;align-items:center;gap:10px}
html body #bar #eacasa{flex:0 0 auto}
html body.eduapp.dev-pc #bar.hgrid{grid-template-areas:"t e x a u i"!important}
html body.eduapp #bar #barx{grid-area:x!important;justify-content:flex-end!important;flex-wrap:nowrap!important;margin:0!important}
html body #bar #eacasa[hidden]{display:none!important}
html body.est-sge #bar #eacasa{border-radius:0}`;document.head.appendChild(st)}
