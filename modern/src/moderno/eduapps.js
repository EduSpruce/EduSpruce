/* ===================== EduApps em ecrã inteiro (Spruce It, Pulso, Formulários, Provas; o EduSchedule tem o seu próprio topo) =====================
   Sem menu lateral nem barra da EduSpruce: uma barra própria com o ícone da casa (volta às Apps), o nome da app e as ações da vista (#barx, que se muda para cá e volta ao sair). */
const EDUAPPS={arena:['Spruce It','sparkle'],pulso:['Pulso','target'],forms:['Formulários','clipboard'],provas:['Provas','award']};
function eaVoltar(){go(go._f&&go._f.hub?'hub':'inicio')}
function eaAplicar(){
  const app=EDUAPPS[VIEW],b=document.body;let bar=document.getElementById('eabar');const bx=document.getElementById('barx');
  b.classList.toggle('eduapp',!!app);
  if(app){
    if(!bar){const v=document.getElementById('view');if(!v)return;bar=document.createElement('div');bar.id='eabar';v.parentNode.insertBefore(bar,v);
      bar.innerHTML=`<button type="button" class="btn ico eacasa" title="Voltar à EduSpruce" aria-label="Voltar à EduSpruce">${ic('home',18)}</button><span class="eanome"></span><span class="easp"></span>`;bar.querySelector('.eacasa').onclick=eaVoltar}
    bar.querySelector('.eanome').innerHTML=ic(app[1],17)+' '+esc(app[0]);
    if(bx&&bx.parentNode!==bar){if(!eaAplicar._casa)eaAplicar._casa={p:bx.parentNode,n:bx.nextSibling};bar.appendChild(bx)}
  }else{
    if(bx&&bar&&bx.parentNode===bar&&eaAplicar._casa){const c=eaAplicar._casa;c.p.insertBefore(bx,c.n&&c.n.parentNode===c.p?c.n:null);eaAplicar._casa=null}
    if(bar)bar.remove();
  }
}
{const _gEa=go;go=function(v){const r=_gEa.apply(this,arguments);try{eaAplicar()}catch(e){console.warn(e)}return r};Object.assign(go,_gEa);go._f=_gEa._f}
{const st=document.createElement('style');st.textContent=`html body.eduapp #side,html body.eduapp #railTgl,html body.eduapp #bar,html body.eduapp #tabbar,html body.eduapp .spvolta{display:none!important}
html body.eduapp #main{margin-left:0!important;width:100%!important;max-width:none!important;padding-top:0!important}
html body #eabar{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 12px;padding:8px 12px;background:var(--panel,#fff);border-bottom:1px solid var(--line,#ddd)}
html body #eabar .eanome{display:flex;align-items:center;gap:6px;font-weight:700;font-size:16px}
html body #eabar .easp{flex:1}
html body #eabar #barx{display:flex;flex-wrap:wrap;gap:6px;margin:0}
html body.est-sge #eabar{background:#11729a;color:#fff;border:0}
html body #eabar #barx .btn,html body #eabar .eacasa{min-height:38px;padding:0 14px;display:inline-flex;align-items:center;gap:7px;font-weight:600;border-radius:10px;box-shadow:none}
html body #eabar .eacasa{padding:0;width:38px;justify-content:center}
html body.est-sge #eabar #barx .btn,html body.est-sge #eabar .eacasa{background:transparent!important;color:#fff!important;border:1px solid rgba(255,255,255,.55)!important;border-radius:0!important}
html body.est-sge #eabar #barx .btn:hover,html body.est-sge #eabar .eacasa:hover{background:rgba(255,255,255,.14)!important;border-color:#fff!important}
html body.est-sge #eabar #barx .btn.pri,html body.est-sge #eabar #barx .btn.primary{background:#fff!important;color:#11729a!important;border-color:#fff!important}
html body.est-sge #eabar #barx .btn.pri:hover,html body.est-sge #eabar #barx .btn.primary:hover{background:#e6f3f8!important}
html body.est-sge #eabar #barx .btn svg,html body.est-sge #eabar .eacasa svg{stroke:currentColor}`;document.head.appendChild(st)}
