/* ===================== EduSpruce 1.035 · avisos com a app fechada (notificações push) =====================
   · cada aparelho ativa os avisos uma vez (Definições › Notificações › Com a App Fechada) → subscrição guardada na base de dados
   · a app calcula os avisos dos próximos 21 dias (aulas, resumo do dia, avaliações de amanhã, reuniões, avisos) com as regras e
     o silêncio das Definições e guarda essa lista na conta (só hora, título curto e secção; «avisos discretos» = sem títulos)
   · a função «eduspruce-avisos» do Supabase (agendada de minuto a minuto) envia-os à hora certa e apaga-os
   · no aparelho com os avisos ligados, a app deixa de repetir localmente os mesmos avisos (aulas, resumo, avaliações, reuniões)
   SQL: modern/supabase/migrations/0016_avisos_push.sql · função: modern/supabase/functions/eduspruce-avisos/index.ts */
const PS_FN=()=>{const c=window.__ES_SB||{};return c.url?String(c.url).replace(/\/$/,'')+'/functions/v1/eduspruce-avisos':''};
const psSuporta=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window&&/^https:/.test(location.protocol);
async function psRpc(fn,args){const p=await sbObter();const c=p.cliente;if(!c||!c.rpc)throw new Error('A base de dados não está disponível.');const {data,error}=await c.rpc(fn,args||{});
  if(error){if(/function .* does not exist|Could not find the function|schema cache/i.test(error.message||''))throw new Error('Falta correr o 0016_avisos_push.sql no Supabase.');throw new Error(error.message)}return data}
const psB64=s=>{s=String(s);const b=atob((s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0))};
const psLS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,String(v))}catch(_){}return null};
async function psChave(){const u=PS_FN();if(!u)throw new Error('A base de dados não está configurada.');let r;
  try{r=await fetch(u+'?chave=1',{cache:'no-store'})}catch(_){throw new Error('O serviço de avisos não respondeu: verifique a internet (ou a função «eduspruce-avisos» ainda não foi criada no Supabase).')}
  let j={};try{j=await r.json()}catch(_){}if(!r.ok||!j.pub)throw new Error(r.status===404?'A função «eduspruce-avisos» ainda não foi criada no Supabase.':r.status===401?'Na função «eduspruce-avisos» do Supabase, desligue «Verify JWT».':(j.erro||j.msg||j.message||('Serviço de avisos: erro '+r.status)));return j.pub}
async function psSubAtual(){if(!psSuporta())return null;try{const reg=await navigator.serviceWorker.getRegistration();return reg?await reg.pushManager.getSubscription():null}catch(_){return null}}
function psAparelho(){const u=navigator.userAgent;if(/iPhone/.test(u))return 'iPhone';if(/iPad/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1))return 'iPad';if(/Android/.test(u))return 'Android';if(/Mac/.test(u))return 'Mac';if(/Windows/.test(u))return 'Windows';return 'Computador'}
/* neste aparelho os avisos chegam pelo servidor (a app não os repete localmente) */
const psAtivoAqui=()=>psLS('es.push.on')==='1'&&ntSuporta()&&Notification.permission==='granted'&&(Date.now()-(+psLS('es.push.ok')||0))<36*3600e3;

/* ---------- lista dos próximos avisos ---------- */
function psLista(){const a=A();if(!a)return [];const c=ntCfg();const disc=!!c.pushDisc;const agora=Date.now();const lim=agora+21*864e5;const L=[];
  const hj=isoData(new Date()),limIso=isoData(new Date(lim));
  const dt=(iso,m)=>{const d=dataDeIso(iso);d.setHours(0,0,0,0);d.setMinutes(m);return d};
  const add=(k,d,ti,co,v,t,semSil)=>{const q=d.getTime();if(!(q>agora+45e3)||q>lim)return;if(!semSil&&ntSilencio(d))return;L.push({k:String(k).slice(0,120),q:new Date(q).toISOString(),ti:String(ti||'EduSpruce').slice(0,140),c:String(co||'').slice(0,300),v:v||'inicio',t:t||''})};
  const TF=(()=>{try{return turmasFiltradas(a)}catch(_){return []}})();
  const dia={};const D=iso=>dia[iso]=dia[iso]||{au:[],re:0,av:[],ta:0};
  TF.forEach(t=>{let LA=[];try{LA=listaAulas(t,a)}catch(_){}LA.forEach(x=>{if(!x.data||x.data<hj||x.data>limIso||(x.falta&&!x.falta.subst))return;D(x.data).au.push({t,x})});
    (t.instrumentos||[]).forEach(i=>{if(i.data&&i.data>=hj&&i.data<=limIso)D(i.data).av.push(i.nome+' · '+t.nome)})});
  let RE=[];try{RE=reunioes(a).filter(r=>reunAtiva(r)&&r.data&&r.data>=hj&&r.data<=limIso)}catch(_){}
  RE.forEach(r=>D(r.data).re++);
  try{tarefas().forEach(x=>{if(!x.feito&&x.prazo&&x.prazo>=hj&&x.prazo<=limIso)D(x.prazo).ta++})}catch(_){}
  const pl=(n,s,p)=>n+' '+(n>1?p:s);
  Object.keys(dia).forEach(iso=>{const o=dia[iso];o.au.sort((p,q)=>p.x.ini-q.x.ini);
    if(c.aulas){const ant=+c.ante||0;o.au.forEach(({t,x})=>{const h=x.ini;
      add('a:'+iso+':'+t.id+':'+h,dt(iso,h-ant),disc?(ant?'Aula daqui a '+ant+' min':'Aula a começar'):(ant?'Daqui a '+ant+' min: ':'A começar: ')+t.nome+' · '+t.disciplina,
        disc?fmtHM(h)+'–'+fmtHM(x.fim):[fmtHM(h)+'–'+fmtHM(x.fim),x.sala?'Sala '+x.sala:'',x.licao?'Lição '+x.licao:''].filter(Boolean).join(' · '),'sumarios',t.id)})}
    if(c.resumo){const nA=o.au.length,nR=o.re,nV=o.av.length,nT=o.ta;if(nA+nR+nV+nT){const pr=o.au[0];
      add('r:'+iso,dt(iso,ntMin(c.resumoH)),'Hoje: '+[nA?pl(nA,'aula','aulas'):'',nR?pl(nR,'reunião','reuniões'):'',nV?pl(nV,'avaliação','avaliações'):'',nT?pl(nT,'tarefa','tarefas'):''].filter(Boolean).join(' · '),
        pr?'Primeira aula às '+fmtHM(pr.x.ini)+(disc?'':': '+pr.t.nome+' · '+pr.t.disciplina):'Bom dia!','inicio')}}
    if(c.testes&&o.av.length){const v=dataDeIso(iso);v.setDate(v.getDate()-1);
      add('t:'+iso,dt(isoData(v),ntMin(c.testesH)),'Amanhã: '+pl(o.av.length,'avaliação','avaliações'),disc?'':o.av.slice(0,4).join('\n'),'testes')}});
  if(c.urgentes){RE.forEach(r=>{const ini=r.semHora?540:(r.ini||540);const tit=(()=>{try{return reunTitulo(r,a)}catch(_){return 'Reunião'}})();
      const lem=(Array.isArray(r.lembretes)&&r.lembretes.length?r.lembretes:[60]).slice(0,3);
      lem.forEach(m=>{m=+m||0;add('m:'+r.id+':'+m,dt(r.data,ini-m),disc?'Reunião às '+fmtHM(ini):'Reunião'+(m?' daqui a '+(m>=1440&&m%1440===0?(m/1440)+(m===1440?' dia':' dias'):m>=60&&m%60===0?(m/60)+' h':m+' min'):' a começar')+': '+tit,
        disc?'':[r.semHora?'':fmtHM(ini)+(r.fim?'–'+fmtHM(r.fim):''),r.local||''].filter(Boolean).join(' · '),'reunioes','',true)})});
    try{avisosM().forEach(x=>{if(x.feito||!x.quando)return;const d=new Date(x.quando);if(isNaN(d))return;add('av:'+x.id,d,disc?'Aviso':'Aviso: '+x.t,disc?'':(x.txt||''),'inicio','',true)})}catch(_){}}
  L.sort((p,q)=>p.q<q.q?-1:1);return L.slice(0,400)}

/* ---------- guardar a lista na base de dados (só se a conta tiver algum aparelho com os avisos ligados) ---------- */
let psEst=null,psUlt='',psCorre=false;
const psHash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36)};
async function psEstado(){try{psEst=await psRpc('eduspruce_push_estado')||null}catch(e){psEst={erro:e.message}}return psEst}
async function psSync(forcar){if(psCorre||!SESSAO||document.body.classList.contains('login-on'))return;psCorre=true;
  try{if(!psEst||psEst.erro||forcar)await psEstado();if(!psEst||psEst.erro||!psEst.aparelhos)return;
    const L=psLista();const h=psHash(JSON.stringify(L));if(!forcar&&h===psUlt)return;
    await psRpc('eduspruce_avisos_definir',{p_lista:L});psUlt=h;psEst.pendentes=L.length;psLS('es.push.ok',Date.now())}
  catch(e){console.warn('[EduSpruce] avisos:',e.message)}finally{psCorre=false}}
setTimeout(()=>psSync(true),20000);setInterval(()=>psSync(false),5*60e3);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')psSync(false)});

/* ---------- ativar / desligar neste aparelho ---------- */
async function psAtivar(){
  if(!psSuporta()){toast(nvIOS()&&!nvStandalone()?'Primeiro adicione a EduSpruce ao ecrã principal e abra-a pelo ícone':'Este navegador não recebe avisos com a app fechada','aviso');return}
  try{let p=Notification.permission;if(p==='default')p=await Notification.requestPermission();if(p!=='granted'){toast('As notificações não foram autorizadas','aviso');return}
    ntRegistarSW();const reg=await navigator.serviceWorker.ready;const pub=await psChave();
    let sub=await reg.pushManager.getSubscription();if(sub&&psLS('es.push.k')!==pub){try{await sub.unsubscribe()}catch(_){}sub=null}
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:psB64(pub)});
    const j=sub.toJSON();await psRpc('eduspruce_push_registar',{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_aparelho:psAparelho()});
    psLS('es.push.k',pub);psLS('es.push.on','1');psUlt='';await psSync(true);psLS('es.push.ok',Date.now());
    toast('Avisos com a app fechada ativados neste aparelho','ok')}
  catch(e){console.warn(e);toast(e.message||'Não foi possível ativar os avisos','erro')}
  psDesenhar()}
async function psDesligar(){try{const sub=await psSubAtual();if(sub){try{await psRpc('eduspruce_push_remover',{p_endpoint:sub.endpoint})}catch(_){}try{await sub.unsubscribe()}catch(_){}}
    psLS('es.push.on',null);psLS('es.push.k',null);psEst=null;await psEstado();toast('Avisos com a app fechada desligados neste aparelho','ok')}catch(e){toast(e.message,'erro')}psDesenhar()}
async function psTeste(){try{await psSync(true);await psRpc('eduspruce_avisos_teste');toast('Feche agora a app: o aviso de teste chega dentro de 1 minuto','ok')}catch(e){toast(e.message,'erro')}}

/* ---------- cartão «Com a App Fechada» nas Definições › Notificações ---------- */
async function psDesenhar(){const el=$('#ps-est');if(!el)return;
  if(!psSuporta()){el.innerHTML=nvIOS()&&!nvStandalone()?`<div class="alert w">${ic('alert',14)} Primeiro adicione a EduSpruce ao <b>ecrã principal</b> e abra-a pelo ícone (passos acima). Só assim o iPhone e o iPad recebem avisos.</div>`
      :`<div class="alert w">${ic('alert',14)} Este navegador não recebe avisos com a app fechada. Use o Calendário (abaixo).</div>`;return}
  el.innerHTML=`<p class="hint">A verificar…</p>`;
  const [sub]=await Promise.all([psSubAtual(),psEstado()]);const e=psEst||{};
  const aqui=!!sub&&psLS('es.push.on')==='1';
  const info=e.erro?`<div class="alert w" style="margin-top:8px">${ic('alert',14)} ${esc(e.erro)}</div>`:`<p class="hint" style="margin:8px 0 0">${e.aparelhos?e.aparelhos+' aparelho'+(e.aparelhos>1?'s':'')+' com avisos ligados · '+(e.pendentes||0)+' aviso'+((e.pendentes||0)===1?'':'s')+' marcado'+((e.pendentes||0)===1?'':'s')+' nos próximos 21 dias':'Nenhum aparelho com os avisos ligados.'}</p>`;
  el.innerHTML=aqui?`<div class="ntok">${ic('check',16)} <b>Ativos neste aparelho.</b> <span class="mut">Os avisos chegam mesmo com a app fechada ou o aparelho bloqueado.</span></div>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn sm" id="ps-teste">${ic('bell',13)} Testar com a App Fechada</button><button class="btn sm" id="ps-off">Desligar Neste Aparelho</button></div>${info}`
    :`<button class="btn pri" id="ps-on">${ic('bell',15)} Ativar Avisos com a App Fechada</button>${info}`;
  const b=(id,f)=>{const x=$('#'+id);if(x)x.onclick=async()=>{x.disabled=true;try{await f()}finally{x.disabled=false}}};b('ps-on',psAtivar);b('ps-off',psDesligar);b('ps-teste',psTeste)}
{const _dn=defNotif;defNotif=function(){const h=_dn.apply(this,arguments);const c=ntCfg();const i=h.indexOf(' Com a App Fechada</h2>');if(i<0)return h;const ini=h.lastIndexOf('<div class="card">',i);
  return h.slice(0,ini)+`<div class="card" id="ps-card"><h2>${ic('bell',18)} Com a App Fechada</h2>
    <p class="hint" style="margin:0 0 10px">A EduSpruce envia os avisos a partir da base de dados, mesmo com a app fechada ou o aparelho bloqueado: aulas, resumo do dia, avaliações de amanhã, reuniões (com os alarmes de cada uma) e avisos — com as escolhas e o silêncio de cima. Ative em cada aparelho onde os quer receber.</p>
    <div id="ps-est"></div>
    <div class="ntlist" style="margin-top:12px"><div class="ntrow"><label class="nvsw"><input type="checkbox" id="ps-disc" ${c.pushDisc?'checked':''}><span class="nvswk" aria-hidden="true"></span><span><b>Avisos discretos</b><small>Só «Aula a começar» ou «Reunião às 15:00», sem turmas nem títulos</small></span></label></div></div>
    <p class="hint" style="margin:10px 0 0">Para isso, a lista dos avisos dos próximos 21 dias (hora e título curto — nunca notas, sumários ou nomes de alunos) fica na base de dados, só na sua conta, e cada aviso é apagado logo que é enviado.</p>
    <details style="margin-top:12px"><summary class="mut" style="cursor:pointer">Prefere o Calendário do aparelho?</summary><p class="hint" style="margin:8px 0">Junte os lembretes dos próximos 45 dias ao Calendário (reuniões, avaliações na véspera, tarefas e avisos). Volte a exportar quando marcar coisas novas.</p><button class="btn" id="nt-ics">${ic('calendar',15)} Juntar ao Calendário (.ics)</button></details></div>`}}
{const _bn=bindNotif;bindNotif=function(){const r=_bn.apply(this,arguments);const d=$('#ps-disc');if(d)d.onchange=()=>{ntCfg().pushDisc=d.checked;save();psUlt='';psSync(false)};
  /* qualquer mudança nas escolhas de cima refaz a lista de avisos */
  $$('[data-ntk],#nt-ante,#nt-rh,#nt-th,#nt-sd,#nt-sa').forEach(x=>x.addEventListener('change',()=>setTimeout(()=>psSync(false),300)));psDesenhar();return r}}
/* sem repetições: no aparelho com os avisos ligados, os que vêm do servidor não são mostrados também pela app */
{const _na=ntAgora;ntAgora=function(){const L=_na.apply(this,arguments);return psAtivoAqui()?L.filter(x=>!/^[art]:/.test(x.k)):L}}
{const _nn=window.__ntNotif;if(_nn)window.__ntNotif=function(t,o){if(psAtivoAqui()&&/Reuni/.test(t))return;return _nn.apply(this,arguments)}}
/* o aparelho volta a confirmar a subscrição de vez em quando (a Apple/Google podem renová-la) */
setTimeout(async()=>{try{if(psLS('es.push.on')!=='1'||!SESSAO)return;const sub=await psSubAtual();if(!sub){psLS('es.push.on',null);return}const j=sub.toJSON();
  await psRpc('eduspruce_push_registar',{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_aparelho:psAparelho()})}catch(_){}},30000);
