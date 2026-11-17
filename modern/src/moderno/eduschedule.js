/* ===================== EduSchedule (antigo EduTime): horários da escola, gestão diária e exportação para o DBG pleon =====================
   A app vive em /eduschedule.html (fonte em modern/src/eduschedule/) e abre aqui dentro, sem o menu lateral (como o Spruce It).
   Os dados ficam na conta, em S.esched (com o resto dos dados, na base de dados): {estado:"<JSON do horário>", copias:{'ph-bk-AAAA-MM-DD':"…"}}.
   Horário partilhado com colegas e publicação pública: modern/supabase/migrations/0018_eduschedule.sql (+ função eduschedule-ics). */
const esOn=()=>S.cfg.eschedOn!==false;
const ESCH=()=>{let d=S.esched;if(!d||typeof d!=='object')d=S.esched={};if(!d.copias||typeof d.copias!=='object')d.copias={};if(!d.porChave||typeof d.porChave!=='object')d.porChave={};return d};
/* um horário por escola e por ano letivo, como no resto da EduSpruce (nunca misturar escolas) */
const esChave=()=>{const a=A();return escId(EC())+'|'+(a?a.id:'')};
TITLES.eduschedule='EduSchedule';
window.__esched={
  equipa:false,_email:'',
  ler:()=>{const d=ESCH(),k=esChave(),x=d.porChave[k];if(x)return x.estado||null;if(d.estado&&!d.migrado){d.migrado=k;return d.estado}return null},
  gravar:txt=>{const d=ESCH(),k=esChave(),x=d.porChave[k]||(d.porChave[k]={});if(x.estado===txt)return;x.estado=txt;x.quando=Date.now();if(d.migrado===k){delete d.estado}save()},
  copias:()=>ESCH().copias,
  copia:(k,v)=>{const c=ESCH().copias;if(v==null)delete c[k];else c[k]=v;const ks=Object.keys(c).sort();while(ks.length>10)delete c[ks.shift()];save()},
  rpc:async(fn,args)=>{const sb=(await sbObter()).cliente;const r=await sb.rpc(fn,args||{});if(r.error){const m=String(r.error.message||r.error);throw new Error(/Could not find the function|does not exist/.test(m)?'Falta correr o script 0018_eduschedule.sql no Supabase.':m)}return r.data},
  email:()=>window.__esched._email,
  sge:()=>document.body.classList.contains('est-sge'),
  voltar:()=>esVoltar(),
  escola:()=>{try{return esDadosEscola()}catch(e){return null}},
  publico:c=>location.origin+location.pathname.replace(/[^/]*$/,'')+'horarios.html#'+c
};
/* o EduSchedule vai buscar automaticamente à EduSpruce a escola, o ano letivo e o calendário escolar; turmas, professores, salas e disciplinas são acrescentados à mão no EduSchedule */
function esDadosEscola(){const a=A();if(!a)return null;const E=EC();
  let cal=null;try{const c=CAL();if(c&&c.periodos&&c.periodos.length){const N={interrupcao:'Interrupção letiva',feriadoN:'Feriado nacional',feriadoR:'Feriado regional',feriadoM:'Feriado municipal'};
    cal={inicio:c.periodos[0].ini,fim:c.periodos[c.periodos.length-1].fim,ferias:eventosCalendario(c).filter(e=>N[e.t]).map(e=>({nome:e.nota||N[e.t],de:e.ini,ate:e.fim}))}}}catch(_){}
  return {chave:esChave(),escola:nomeEscola(E),ano:a.nome||'',calendario:cal}}
async function esEmail(){try{const sb=(await sbObter()).cliente;const r=await sb.auth.getSession();window.__esched._email=((r.data&&r.data.session&&r.data.session.user&&r.data.session.user.email)||'').toLowerCase()}catch(_){}}
function esVoltar(){document.body.classList.remove('esched');go(go._f&&go._f.hub?'hub':'inicio')}
function vEduSchedule(){
  if(!esOn())return go('inicio');
  document.body.classList.add('esched');esEmail();
  const v=$('#view'),f=v.querySelector('#esch-fr');if(f&&f.dataset.k===esChave())return;
  v.innerHTML=`<iframe id="esch-fr" data-k="${esc(esChave())}" title="EduSchedule" src="eduschedule.html?v=${encodeURIComponent(VERSAO)}"></iframe>`;
}
/* menu, vista e Definições › Módulos Opcionais */
{const h=document.querySelector('#side [data-v="sprucenote"]')||document.querySelector('#side [data-v="provas"]')||document.querySelector('#side [data-v="recursos"]');if(h&&!document.querySelector('#side [data-v="eduschedule"]')){h.insertAdjacentHTML('afterend',`<button class="nav" data-v="eduschedule" title="EduSchedule · horários da escola"><span data-ico></span><span class="lbl">EduSchedule</span></button>`);const b=document.querySelector('#side [data-v="eduschedule"]');b.querySelector('[data-ico]').innerHTML=ic('calendar',18);b.onclick=()=>go('eduschedule');b.hidden=!esOn()}}
{const _gEs=go;go=function(v){if(v==='eduschedule'&&!esOn())v='inicio';if(go._f&&go._f.eduschedule!==vEduSchedule)go._f.eduschedule=vEduSchedule;if(v!=='eduschedule')document.body.classList.remove('esched');const r=_gEs.call(this,v);try{$$('#side [data-v="eduschedule"]').forEach(b=>{b.hidden=!esOn();b.classList.toggle('on',VIEW==='eduschedule')})}catch(_){}return r};Object.assign(go,_gEs);go._f=_gEs._f;if(go._f)go._f.eduschedule=vEduSchedule}
try{if(typeof MN_NOME==='object'&&MN_NOME)MN_NOME.eduschedule=MN_NOME.eduschedule||'EduSchedule';if(typeof MN_IC==='object'&&MN_IC)MN_IC.eduschedule=MN_IC.eduschedule||'calendar'}catch(_){}
{const _vDe=vDefinicoes;vDefinicoes=function(){const r=_vDe.apply(this,arguments);try{const mods=$('#view #def-mods');if(mods&&!$('#esch-on')){mods.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px"><input type="checkbox" id="esch-on" ${esOn()?'checked':''}> ${ic('calendar',15)} <span><b>EduSchedule</b><br><span class="mut">Horários da escola (como o Untis): motor de horários, substituições, reuniões, vigilâncias, exames, gestão diária, alunos e cursos, impressão, calendários e exportação para o DBG pleon.</span></span></label>`);
  $('#esch-on').onchange=e=>{S.cfg.eschedOn=e.target.checked;save();$$('#side [data-v="eduschedule"]').forEach(b=>b.hidden=!esOn());toast(e.target.checked?'EduSchedule ligado':'EduSchedule desligado','ok')}}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
/* ecrã inteiro, sem nada da EduSpruce à volta: volta-se pelo ícone da casa no topo do EduSchedule */
{const st=document.createElement('style');st.textContent=`html body.esched #side,html body.esched #railTgl,html body.esched #bar,html body.esched #tabbar,html body.esched .fab,html body.esched #fab{display:none!important}
html body.esched{overflow:hidden!important}
html body.esched #esch-fr{position:fixed;inset:0;z-index:9000;display:block;width:100vw;height:100vh;height:100dvh;border:0;background:#fff}`;document.head.appendChild(st)}
