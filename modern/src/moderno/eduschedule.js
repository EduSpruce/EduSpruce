/* ===================== EduSchedule (antigo EduTime): horários da escola, gestão diária e exportação para o DBG pleon =====================
   A app vive em /eduschedule.html (fonte em modern/src/eduschedule/) e abre aqui dentro, sem o menu lateral (como o Spruce It).
   Os dados ficam na conta, em S.esched (com o resto dos dados, na base de dados): {estado:"<JSON do horário>", copias:{'ph-bk-AAAA-MM-DD':"…"}}.
   Horário partilhado com colegas e publicação pública: modern/supabase/migrations/0018_eduschedule.sql (+ função eduschedule-ics). */
const esOn=()=>S.cfg.eschedOn!==false;
const ESCH=()=>{let d=S.esched;if(!d||typeof d!=='object')d=S.esched={};if(!d.copias||typeof d.copias!=='object')d.copias={};return d};
TITLES.eduschedule='EduSchedule';
window.__esched={
  equipa:false,_email:'',
  ler:()=>ESCH().estado||null,
  gravar:txt=>{const d=ESCH();if(d.estado===txt)return;d.estado=txt;d.quando=Date.now();save()},
  copias:()=>ESCH().copias,
  copia:(k,v)=>{const c=ESCH().copias;if(v==null)delete c[k];else c[k]=v;const ks=Object.keys(c).sort();while(ks.length>10)delete c[ks.shift()];save()},
  rpc:async(fn,args)=>{const sb=(await sbObter()).cliente;const r=await sb.rpc(fn,args||{});if(r.error){const m=String(r.error.message||r.error);throw new Error(/Could not find the function|does not exist/.test(m)?'Falta correr o script 0018_eduschedule.sql no Supabase.':m)}return r.data},
  email:()=>window.__esched._email,
  sge:()=>document.body.classList.contains('est-sge'),
  publico:c=>location.origin+location.pathname.replace(/[^/]*$/,'')+'horarios.html#'+c
};
async function esEmail(){try{const sb=(await sbObter()).cliente;const r=await sb.auth.getSession();window.__esched._email=((r.data&&r.data.session&&r.data.session.user&&r.data.session.user.email)||'').toLowerCase()}catch(_){}}
function esVoltar(){document.body.classList.remove('esched');go(go._f&&go._f.hub?'hub':'inicio')}
function vEduSchedule(){
  if(!esOn())return go('inicio');
  document.body.classList.add('esched');esEmail();
  const v=$('#view');if(v.querySelector('#esch-fr'))return;
  v.innerHTML=`<div class="esch-top"><button type="button" class="btn spvolta" id="esch-volta">← Voltar à EduSpruce</button><span class="mut">EduSchedule · horários da escola, gestão diária e exportação para o DBG pleon</span></div><iframe id="esch-fr" title="EduSchedule" src="eduschedule.html?v=${encodeURIComponent(VERSAO)}"></iframe>`;
  $('#esch-volta').onclick=esVoltar;
}
/* menu, vista e Definições › Módulos Opcionais */
{const h=document.querySelector('#side [data-v="sprucenote"]')||document.querySelector('#side [data-v="provas"]')||document.querySelector('#side [data-v="recursos"]');if(h&&!document.querySelector('#side [data-v="eduschedule"]')){h.insertAdjacentHTML('afterend',`<button class="nav" data-v="eduschedule" title="EduSchedule · horários da escola"><span data-ico></span><span class="lbl">EduSchedule</span></button>`);const b=document.querySelector('#side [data-v="eduschedule"]');b.querySelector('[data-ico]').innerHTML=ic('calendar',18);b.onclick=()=>go('eduschedule');b.hidden=!esOn()}}
{const _gEs=go;go=function(v){if(v==='eduschedule'&&!esOn())v='inicio';if(go._f&&go._f.eduschedule!==vEduSchedule)go._f.eduschedule=vEduSchedule;if(v!=='eduschedule')document.body.classList.remove('esched');const r=_gEs.call(this,v);try{$$('#side [data-v="eduschedule"]').forEach(b=>{b.hidden=!esOn();b.classList.toggle('on',VIEW==='eduschedule')})}catch(_){}return r};Object.assign(go,_gEs);go._f=_gEs._f;if(go._f)go._f.eduschedule=vEduSchedule}
try{if(typeof MN_NOME==='object'&&MN_NOME)MN_NOME.eduschedule=MN_NOME.eduschedule||'EduSchedule';if(typeof MN_IC==='object'&&MN_IC)MN_IC.eduschedule=MN_IC.eduschedule||'calendar'}catch(_){}
{const _vDe=vDefinicoes;vDefinicoes=function(){const r=_vDe.apply(this,arguments);try{const mods=$('#view #def-mods');if(mods&&!$('#esch-on')){mods.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px"><input type="checkbox" id="esch-on" ${esOn()?'checked':''}> ${ic('calendar',15)} <span><b>EduSchedule</b><br><span class="mut">Horários da escola (como o Untis): motor de horários, substituições, reuniões, vigilâncias, exames, gestão diária, alunos e cursos, impressão, calendários e exportação para o DBG pleon.</span></span></label>`);
  $('#esch-on').onchange=e=>{S.cfg.eschedOn=e.target.checked;save();$$('#side [data-v="eduschedule"]').forEach(b=>b.hidden=!esOn());toast(e.target.checked?'EduSchedule ligado':'EduSchedule desligado','ok')}}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
{const st=document.createElement('style');st.textContent=`html body.esched #side,html body.esched #railTgl{display:none!important}
html body.esched #main{margin-left:0!important;width:100%!important;max-width:none!important}
html body.esched .esch-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 10px}
html body.esched .esch-top .spvolta{font-weight:700}
html body.esched #esch-fr{display:block;width:100%;height:calc(100vh - 150px);min-height:520px;border:1px solid var(--line,#ddd);border-radius:14px;background:#fff}
html body.esched.est-sge #esch-fr{border-radius:0}`;document.head.appendChild(st)}
