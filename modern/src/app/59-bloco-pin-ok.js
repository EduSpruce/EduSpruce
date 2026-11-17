/* ===================== 0.933 ===================== */
/* verificação dos códigos (aceita o formato forte e o antigo) */
async function pinOk(x){const h=String(S.cfg.pinHash||'');if(!h)return false;try{if(await sha('eg:'+x)===h)return true}catch(_){}try{return !!(await verificarSenha(h,x))}catch(_){return false}}
/* uma cor por turma (sempre a mesma), nos cartões e na barra lateral */
const TCORES=['#1f77b4','#d9480f','#2b8a3e','#7048e8','#c2255c','#0b7285','#e67700','#5c7cfa','#8f3b1b','#087f5b'];
function corTurma(id){const a=A();if(a){const k=a.turmas.findIndex(t=>t.id===id);if(k>=0)return TCORES[k%TCORES.length]}let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))>>>0;return TCORES[h%TCORES.length]}
function pintarTurmas(){try{$$('.tcard[data-t]').forEach(c=>c.style.setProperty('--tc',corTurma(c.dataset.t)));$$('#side .tnode[data-tt]').forEach(c=>c.style.setProperty('--tc',corTurma(c.dataset.tt)))}catch(_){}}
/* fora da turma: o menu da turma fecha e não fica assinalado */
{const _gN=go;go=function(v){const r=_gN.apply(this,arguments);try{const TV=new Set([...document.querySelectorAll('#side .tnav[data-v]')].map(k=>k.dataset.v));const dentro=TV.has(VIEW);
  document.body.classList.toggle('vgeral',!dentro);if(!dentro){if(S.turmaAtiva&&UI.navTFech!==S.turmaAtiva){UI.navTFech=S.turmaAtiva;UI._navAuto=1;try{navTurmas()}catch(_){}}}else if(UI._navAuto){UI.navTFech=null;UI._navAuto=0;try{navTurmas()}catch(_){}}
  requestAnimationFrame(pintarTurmas)}catch(_){}return r}}
{const _nT=navTurmas;navTurmas=function(){const r=_nT.apply(this,arguments);try{pintarTurmas()}catch(_){}return r}}
/* Avaliação Final: estatística da turma por baixo da pauta */
function avEstatistica(){try{const t=T();if(!t||VIEW!=='avaliacao')return;const v=$('#view');if(!v||v.querySelector('.avst'))return;const p=UI.per||perAtual(t);const sc=isSec(t);
  const al=alunosAval(t);const N=al.map(a=>({a,n:ponderada(t,pctsFinal(t,a.id,p))}));const A_=N.filter(x=>x.n!=null);if(!al.length)return;
  const F=x=>x==null?'—':sc?(x*20).toFixed(1).replace('.',','):Math.round(x*100)+'%';const val=A_.map(x=>x.n).sort((a,b)=>a-b);
  const med=val.length?val.reduce((s,x)=>s+x,0)/val.length:null;const mdn=val.length?(val.length%2?val[(val.length-1)/2]:(val[val.length/2-1]+val[val.length/2])/2):null;
  const neg=A_.filter(x=>negativa(t,x.n)).length,pos=A_.length-neg;const dp=val.length>1?Math.sqrt(val.reduce((s,x)=>s+(x-med)**2,0)/(val.length-1)):null;
  const B=sc?[['0–4',0,4.5],['5–9',4.5,9.5],['10–13',9.5,13.5],['14–17',13.5,17.5],['18–20',17.5,21]].map(([l,a,b])=>[l,val.filter(x=>x*20>=a&&x*20<b).length,a<9.5]):[['Nível 1',0,.2],['Nível 2',.2,.5],['Nível 3',.5,.7],['Nível 4',.7,.9],['Nível 5',.9,1.01]].map(([l,a,b])=>[l,val.filter(x=>x>=a&&x<b).length,a<.5]);
  const mx=Math.max(1,...B.map(x=>x[1]));const D=t.dominios.map(d=>{const L=al.map(a=>domPer(t,a.id,d.id,p)).filter(x=>x!=null);return {d,m:L.length?L.reduce((s,x)=>s+x,0)/L.length:null,n:L.length}});
  const top=A_.slice().sort((x,y)=>y.n-x.n).slice(0,3),bx=A_.slice().sort((x,y)=>x.n-y.n).filter(x=>negativa(t,x.n)).slice(0,5);
  const card=document.createElement('section');card.className='card avst';
  card.innerHTML=`<h2 style="margin:0">${ic('chart',18)} Estatística da Turma · ${esc(perNome(p))}</h2>
   <div class="avstg"><div class="avstk"><small>Alunos avaliados</small><b>${A_.length}</b><small>de ${al.length}</small></div><div class="avstk"><small>Média</small><b>${F(med)}</b></div><div class="avstk"><small>Mediana</small><b>${F(mdn)}</b></div>
   <div class="avstk ok"><small>Positivas</small><b>${pos}</b><small>${A_.length?Math.round(pos/A_.length*100):0}%</small></div><div class="avstk bad"><small>Negativas</small><b>${neg}</b><small>${A_.length?Math.round(neg/A_.length*100):0}%</small></div>
   <div class="avstk"><small>Mais alta · mais baixa</small><b>${F(val[val.length-1])} · ${F(val[0])}</b></div>${dp!=null?`<div class="avstk"><small>Desvio-padrão</small><b>${sc?(dp*20).toFixed(1).replace('.',','):Math.round(dp*100)+' pp'}</b></div>`:''}</div>
   <div class="avstd"><div><h3>Distribuição</h3><div class="avsb">${B.map(([l,n,m])=>`<span>${l}</span><i class="${m?'bad':'ok'}" style="width:${n/mx*100}%"></i><span>${n}</span>`).join('')}</div></div>
   <div><h3>Média por domínio</h3><div class="avsb">${D.map(x=>`<span>${esc(x.d.ab||x.d.nome)}</span><i style="width:${x.m!=null?x.m*100:0}%;background:${x.d.cor||'var(--acc)'}"></i><span>${x.m!=null?(sc?(x.m*20).toFixed(1).replace('.',','):Math.round(x.m*100)+'%'):'—'}</span>`).join('')}</div></div>
   <div><h3>Melhores resultados</h3>${top.length?`<div class="avsb">${top.map(x=>`<span>${esc(numAl(x.a))}</span><span>${esc(nomeAbr?nomeAbr(x.a.nome,26):x.a.nome)}</span><span>${F(x.n)}</span>`).join('')}</div>`:'<p class="mut" style="margin:0">Sem classificações.</p>'}
    <h3 style="margin-top:12px">A acompanhar (negativa)</h3>${bx.length?`<div class="avsb">${bx.map(x=>`<span>${esc(numAl(x.a))}</span><span>${esc(nomeAbr?nomeAbr(x.a.nome,26):x.a.nome)}</span><span style="color:#c0392b">${F(x.n)}</span>`).join('')}</div>`:'<p class="mut" style="margin:0">Nenhum aluno com negativa.</p>'}</div></div>`;
  v.appendChild(card)}catch(e){console.warn('[EduSpruce] estatística:',e)}}
{const _vA=vAvaliacao;vAvaliacao=function(){const r=_vA.apply(this,arguments);try{avEstatistica()}catch(_){}return r};if(go._f)go._f.avaliacao=vAvaliacao}

addEventListener('pageshow',e=>{if(e.persisted)go('inicio')});
/* ===================== v0.944 · Importar reuniões e atividades do Outlook (sem acesso de administrador) =====================
   Três caminhos, todos a correr só no navegador (nada passa por servidores da EduSpruce):
   1) calendário publicado (.ics: link ou ficheiro) · 2) colar/arrastar o e-mail · 3) ligação direta à conta Microsoft (calendário + e-mails recentes) */
function olIcsEventos(txt){const L=String(txt).replace(/\r\n[ \t]/g,'').replace(/\n[ \t]/g,'');const out=[];const B=L.split(/BEGIN:VEVENT/i).slice(1);
  B.forEach(b=>{const bloco='BEGIN:VEVENT'+b.split(/END:VEVENT/i)[0]+'\nEND:VEVENT';const e=cvIcs(bloco)[0];if(!e||!e.ini)return;const u=(bloco.match(/^UID[^:\n]*:(.+)$/mi)||[])[1];const st=(bloco.match(/^STATUS[^:\n]*:(.+)$/mi)||[])[1]||'';if(/CANCEL/i.test(st))return;
    out.push({uid:u?u.trim():'',titulo:(e.titulo||'').trim(),data:e.ini.iso,ini:e.ini.min,fim:e.fim&&e.fim.iso===e.ini.iso?e.fim.min:null,local:e.local||'',desc:e.desc||'',org:e.org||'',link:e.link||''})});return out}
function olJaTem(a,e){const n=normT(e.titulo||'');return reunioes(a).some(r=>(e.uid&&r.extUid===e.uid)||(r.data===e.data&&normT(r.titulo||'')===n))}
function olListaHtml(a,E,fonte){const hj=isoHoje();E=E.filter(e=>e.data&&e.data>=hj&&e.titulo).sort((x,y)=>(x.data+String(x.ini==null?0:x.ini).padStart(5,'0')).localeCompare(y.data+String(y.ini==null?0:y.ini).padStart(5,'0'))).slice(0,150);
  if(!E.length)return {E,html:'<p class="mut">Não há reuniões nem atividades futuras nesta origem.</p>'};const hh=m=>m==null?'':String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
  E.forEach(e=>{const I=cvInterpretar({assunto:e.titulo,texto:e.desc||e.titulo});e._conv=I.tipo==='conv';e._rt=I.reTipo;e._tu=I.turmas||[];e._ja=olJaTem(a,e)});
  return {E,html:`<p class="hint" style="margin:0 0 8px">${E.length} encontrada(s) em «${esc(fonte)}». As que já existem na app ficam desmarcadas.</p><div class="ollst">${E.map((e,k)=>`<label class="olit ${e._ja?'ja':''}"><input type="checkbox" data-olk="${k}" ${e._ja?'':'checked'}><span class="old"><b>${esc(fmtD(e.data))}</b>${e.ini!=null?'<small>'+hh(e.ini)+(e.fim!=null?'–'+hh(e.fim):'')+'</small>':''}</span><span class="olt"><b>${esc(e.titulo)}</b><small class="mut">${esc([e.local,e.org].filter(Boolean).join(' · '))}${e._ja?' · já existe':''}</small></span><select data-olt="${k}" aria-label="Tipo"><option value="ativ" ${e._conv?'':'selected'}>Atividade</option>${Object.entries(REUN_T).filter(([id])=>id!=='ativ').map(([id,o])=>`<option value="${id}" ${e._conv&&e._rt===id?'selected':''}>${esc(o.n)}</option>`).join('')}</select></label>`).join('')}</div>
    <div class="row" style="gap:8px;margin-top:10px"><button type="button" class="btn sm" id="ol-todas">Marcar Todas</button><button type="button" class="btn sm" id="ol-nenh">Desmarcar</button><span class="sp1"></span><button type="button" class="btn pri" id="ol-imp">${ic('calendar',15)} Marcar as Escolhidas</button></div>`}}
function olLigarLista(cx,a,E,fonte){const {E:L,html}=olListaHtml(a,E,fonte);cx.innerHTML=html;if(!L.length)return;
  cx.querySelector('#ol-todas').onclick=()=>cx.querySelectorAll('[data-olk]').forEach(c=>c.checked=true);cx.querySelector('#ol-nenh').onclick=()=>cx.querySelectorAll('[data-olk]').forEach(c=>c.checked=false);
  cx.querySelector('#ol-imp').onclick=()=>{let n=0;cx.querySelectorAll('[data-olk]:checked').forEach(c=>{const e=L[+c.dataset.olk];const tp=cx.querySelector('[data-olt="'+c.dataset.olk+'"]').value;const conv=tp!=='ativ';const ini=e.ini!=null?e.ini:(conv?17*60:9*60);
      reunioes(a).push({id:uid(),tipo:tp,titulo:e.titulo,data:e.data,ini,fim:e.fim!=null&&e.fim>ini?e.fim:ini+(conv?90:120),semHora:e.ini==null,local:e.local||'',link:e.link||'',turma:e._tu[0]||null,turmas:e._tu,convocante:e.org||'',participantes:'',lembretes:[1440,60],ordem:[],prep:[],notas:(e.desc||'').trim().slice(0,4000),decisoes:[],estado:'agendada',origem:'outlook',extUid:e.uid||''});n++});
    if(!n)return toast('Escolha pelo menos uma','erro');save();try{audit('Reuniões','Importadas do Outlook',n+' · '+fonte)}catch(_){}toast(n+' marcada(s) no calendário','ok');closeDrawer();go('reunioes')}}
/* 3) Microsoft direta */
let _olTok=null;const OL_SCOPE='Calendars.Read Mail.Read User.Read';
async function olMsToken(appId){if(_olTok&&_olTok.exp>Date.now()+60000&&_olTok.id===appId)return _olTok.at;if(!nvHttps())throw new Error('A ligação à Microsoft precisa de um endereço https.');
  const {v,c}=await pkce();const state='nvms'+Math.random().toString(36).slice(2);const url=`${MS_AUTH}/authorize?client_id=${encodeURIComponent(appId)}&response_type=code&redirect_uri=${encodeURIComponent(nvRedirect())}&response_mode=query&scope=${encodeURIComponent(OL_SCOPE)}&state=${state}&code_challenge=${c}&code_challenge_method=S256&prompt=select_account`;
  const w=window.open(url,'nvms','width=520,height=700');if(!w)throw new Error('Permita janelas pop-up para ligar à conta Microsoft.');
  const code=await new Promise((ok,ko)=>{const t=setInterval(()=>{if(w.closed){clearInterval(t);removeEventListener('message',m);ko(new Error('Janela da Microsoft fechada.'))}},700);const m=e=>{if(e.origin!==location.origin||!e.data||!e.data.nvms)return;const r=e.data.nvms;if(r.state!==state)return;clearInterval(t);removeEventListener('message',m);if(r.error||!r.code)ko(new Error(r.error||'Sem autorização'));else ok(r.code)};addEventListener('message',m)});
  const r=await fetch(MS_AUTH+'/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:appId,grant_type:'authorization_code',code,redirect_uri:nvRedirect(),code_verifier:v,scope:OL_SCOPE})});const j=await r.json();
  if(!j.access_token){const m=j.error_description||'';throw new Error(/admin|AADSTS65001|AADSTS90094|consent/i.test(m)?'A sua escola exige aprovação do administrador para esta ligação. Use o calendário publicado (.ics) ou cole o e-mail.':(m.split('\n')[0]||'Não foi possível ligar à conta Microsoft.'))}
  _olTok={at:j.access_token,exp:Date.now()+(+j.expires_in||3600)*1000,id:appId};return j.access_token}
async function olMsG(tk,url,pref){const r=await fetch('https://graph.microsoft.com/v1.0'+url,{headers:{Authorization:'Bearer '+tk,...(pref?{Prefer:pref}:{})}});if(r.status===403)throw new Error('A conta não autorizou esta leitura (pode exigir o administrador da escola).');if(!r.ok)throw new Error('Microsoft: '+r.status);return r.json()}
async function olMsCalendario(tk){const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';const d0=new Date(),d1=new Date(Date.now()+200*864e5);
  const j=await olMsG(tk,`/me/calendarView?startDateTime=${d0.toISOString()}&endDateTime=${d1.toISOString()}&$top=200&$orderby=start/dateTime&$select=subject,start,end,location,bodyPreview,organizer,iCalUId,isAllDay,isCancelled,onlineMeeting`,`outlook.timezone="${tz}"`);
  return (j.value||[]).filter(e=>!e.isCancelled).map(e=>{const s=String((e.start||{}).dateTime||''),f=String((e.end||{}).dateTime||'');const mn=x=>e.isAllDay||!x?null:(+x.slice(11,13))*60+(+x.slice(14,16));return {uid:e.iCalUId||'',titulo:(e.subject||'').trim(),data:s.slice(0,10),ini:mn(s),fim:f.slice(0,10)===s.slice(0,10)?mn(f):null,local:(e.location||{}).displayName||'',desc:e.bodyPreview||'',org:((e.organizer||{}).emailAddress||{}).name||'',link:(e.onlineMeeting||{}).joinUrl||''}})}
const OL_RX=/convocat|reuni[aã]o|conselho de turma|conselho pedag|departamento|ordem de trabalhos|atividade|visita de estudo|palestra|forma[cç][aã]o|avalia[cç][aã]o intercalar/i;
async function olMsEmails(tk){const j=await olMsG(tk,'/me/messages?$top=60&$select=id,subject,from,receivedDateTime,bodyPreview&$orderby=receivedDateTime desc');return (j.value||[]).filter(m=>OL_RX.test((m.subject||'')+' '+(m.bodyPreview||'')))}
function olHub(){const a=A()||novoAno(anoAuto());const cfg=S.cfg;
  openDrawer('Importar do Outlook',`<div class="ed olhub"><p class="hint" style="margin-top:0">Três formas de trazer reuniões e atividades do Outlook da escola, <b>sem acesso de administrador</b>. Tudo é lido só neste aparelho: o e-mail nunca passa pela EduSpruce.</p>
    <section class="olbox"><h3>${ic('paste',16)} 1 · Colar ou arrastar o e-mail</h3><p class="mut">Copie o texto da convocatória (ou arraste o e-mail / o convite .ics para a app). A app lê a data, a hora, o local e o assunto e pede-lhe para confirmar.</p><button type="button" class="btn" id="ol-colar">${ic('paste',15)} Colar E-mail…</button></section>
    <section class="olbox"><h3>${ic('calendar',16)} 2 · Calendário do Outlook (.ics)</h3><p class="mut">No Outlook na web: <b>Definições › Calendário › Calendários partilhados › Publicar um calendário</b> → «Pode ver todos os detalhes» → copie a ligação <b>ICS</b>. Cole-a aqui (fica guardada para a próxima vez).</p>
      <div class="row" style="gap:6px"><input type="url" id="ol-url" placeholder="https://outlook.office365.com/owa/calendar/…/calendar.ics" value="${esc(cfg.olIcs||'')}" style="flex:1;min-width:0" autocapitalize="none" spellcheck="false"><button type="button" class="btn pri" id="ol-ler">Ler</button></div>
      <p class="mut" style="margin:8px 0 4px">Ou escolha um ficheiro de calendário (.ics) exportado ou descarregado:</p><label class="btn" tabindex="0">${ic('upload',15)} Escolher Ficheiro .ics<input type="file" id="ol-f" accept=".ics,text/calendar" hidden></label>
      <p class="nverr" role="alert" id="ol-e2"></p><div id="ol-l2"></div></section>
    <section class="olbox"><h3>${ic('cloud',16)} 3 · Ligação direta à conta Microsoft</h3><p class="mut">Lê o calendário e procura convocatórias nos e-mails mais recentes. Precisa de um <b>ID de aplicação</b> da Microsoft (gratuito): em <b>entra.microsoft.com › Registos de aplicações › Novo registo</b>, com qualquer conta Microsoft, escolha «Contas em qualquer diretório organizacional e contas pessoais», plataforma <b>Aplicação de página única</b> e URI <code>${esc(nvRedirect())}</code>. Algumas escolas bloqueiam esta autorização — nesse caso use as opções 1 e 2.</p>
      <div class="row" style="gap:6px"><input type="text" id="ol-id" placeholder="00000000-0000-0000-0000-000000000000" value="${esc(cfg.olMsId||(nvL().msId||''))}" style="flex:1;min-width:0" autocapitalize="none" spellcheck="false"><button type="button" class="btn pri" id="ol-ms">Ligar e Ler</button></div>
      <p class="nverr" role="alert" id="ol-e3"></p><div id="ol-l3"></div><div id="ol-m3"></div></section></div>`);
  const B=$('#dw-b');B.querySelector('#ol-colar').onclick=()=>cvColarDlg();
  const mostra2=(txt,fonte)=>{const E=olIcsEventos(txt);if(!E.length){B.querySelector('#ol-e2').textContent='Não encontrei eventos nesse calendário.';return}B.querySelector('#ol-e2').textContent='';olLigarLista(B.querySelector('#ol-l2'),a,E,fonte)};
  B.querySelector('#ol-ler').onclick=async()=>{const e=B.querySelector('#ol-e2');let u=B.querySelector('#ol-url').value.trim().replace(/^webcal:/i,'https:');if(!/^https:\/\/.+/i.test(u)){e.textContent='Cole a ligação ICS (começa por https://).';return}
    cfg.olIcs=u;save();e.textContent='A ler o calendário…';try{const r=await fetch(u,{cache:'no-store',credentials:'omit'});if(!r.ok)throw new Error('http');const t=await r.text();if(!/BEGIN:VCALENDAR/i.test(t))throw new Error('fmt');mostra2(t,'Calendário do Outlook')}
    catch(_){e.innerHTML='O Outlook não deixa o navegador ler esta ligação diretamente. <a href="'+esc(u)+'" target="_blank" rel="noopener">Abra a ligação</a> (o ficheiro .ics é descarregado) e escolha-o em «Escolher Ficheiro .ics».'}};
  B.querySelector('#ol-f').onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{mostra2(await f.text(),f.name)}catch(_){B.querySelector('#ol-e2').textContent='Não foi possível ler o ficheiro.'}};
  B.querySelectorAll('label.btn').forEach(l=>l.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();l.querySelector('input').click()}}));
  B.querySelector('#ol-ms').onclick=async()=>{const e=B.querySelector('#ol-e3');const id=B.querySelector('#ol-id').value.trim();if(!/^[0-9a-f-]{30,40}$/i.test(id)){e.textContent='Indique o ID da aplicação (cliente) da Microsoft.';return}cfg.olMsId=id;save();e.textContent='A ligar à Microsoft…';
    try{const tk=await olMsToken(id);e.textContent='A ler o calendário e os e-mails…';const [E,M]=await Promise.all([olMsCalendario(tk).catch(x=>{e.textContent=x.message;return []}),olMsEmails(tk).catch(()=>[])]);if(E.length)e.textContent='';
      olLigarLista(B.querySelector('#ol-l3'),a,E,'Calendário Microsoft');const cx=B.querySelector('#ol-m3');
      cx.innerHTML=M.length?`<h4 style="margin:14px 0 6px">E-mails recentes que parecem convocatórias ou atividades</h4><div class="ollst">${M.map((m,k)=>`<button type="button" class="olit olmail" data-olm="${k}"><span class="old"><b>${esc(new Date(m.receivedDateTime).toLocaleDateString('pt-PT',{day:'numeric',month:'short'}))}</b></span><span class="olt"><b>${esc(m.subject||'(sem assunto)')}</b><small class="mut">${esc(((m.from||{}).emailAddress||{}).name||'')}</small></span><span class="mut">Ler ›</span></button>`).join('')}</div>`:'<p class="mut" style="margin-top:10px">Nenhum e-mail recente parece uma convocatória.</p>';
      cx.querySelectorAll('[data-olm]').forEach(b=>b.onclick=async()=>{const m=M[+b.dataset.olm];try{const d=await olMsG(tk,'/me/messages/'+encodeURIComponent(m.id)+'?$select=subject,body,from','outlook.body-content-type="text"');const R=cvInterpretar({assunto:d.subject||'',de:((d.from||{}).emailAddress||{}).name||'',texto:(d.body||{}).content||m.bodyPreview||''});R._pouco=!R.data;cvDlg(R,'Outlook')}catch(x){toast(x.message||'Não foi possível abrir o e-mail','erro')}})}
    catch(x){e.textContent=(x&&x.message)||'Não foi possível ligar.'}}}
{const _vRo=vReunioes;vReunioes=function(){const r=_vRo.apply(this,arguments);try{const bx=$('#barx');if(bx&&!$('#b-olh')){const b=document.createElement('button');b.type='button';b.className='btn';b.id='b-olh';b.title='Trazer reuniões e atividades do Outlook da escola';b.innerHTML=ic('download',15)+' Importar do Outlook';b.onclick=olHub;const c=$('#b-cvc');if(c){c.before(b);c.remove()}else bx.appendChild(b);try{cabecalho()}catch(_){}}}catch(e){console.warn(e)}return r};if(go._f)Object.keys(go._f).forEach(k=>{if(go._f[k]===_vRo||(go._f[k]&&go._f[k].__orig===_vRo))go._f[k]=vReunioes})}
try{const st=document.createElement('style');st.textContent='.olbox{border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:0 0 12px}.olbox h3{margin:0 0 6px;font-size:15px;display:flex;gap:6px;align-items:center;text-transform:none;color:var(--ink)}.olbox p{margin:0 0 8px;font-size:13.5px}.olbox code{font-size:12px;word-break:break-all}.ollst{display:flex;flex-direction:column;gap:6px;max-height:46vh;overflow:auto}.olit{display:grid;grid-template-columns:auto 86px 1fr auto;gap:10px;align-items:center;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--panel);font:inherit;color:var(--ink);text-align:left;margin:0}.olit.olmail{grid-template-columns:70px 1fr auto;cursor:pointer;width:100%}.olit.ja{opacity:.6}.olit .old{display:flex;flex-direction:column;font-size:13px}.olit .olt{display:flex;flex-direction:column;min-width:0}.olit .olt b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.olit small{font-size:12px}.olit select{max-width:150px;min-height:34px}@media(max-width:640px){.olit{grid-template-columns:auto 1fr}.olit .olt,.olit select{grid-column:1/-1;max-width:none}}';document.head.appendChild(st)}catch(_){}
/* v0.942 · Minhas Tarefas: botão para aumentar (ocupa o ecrã todo) e voltar ao normal */
{const _vTD=vTarefasTD;vTarefasTD=function(){const r=_vTD.apply(this,arguments);try{const w=$('#view .xtw'),h=$('#view .xtmain .xth');if(w&&h&&!h.querySelector('#td-max')){const on=!!UI.tdMax;w.classList.toggle('xtmax',on);document.body.classList.toggle('xtmax-on',on);
    const b=document.createElement('button');b.type='button';b.id='td-max';b.className='btn ico';b.title=on?'Voltar ao tamanho normal (Esc)':'Aumentar: ocupar o ecrã todo';b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',on);
    b.innerHTML=on?'<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>':'<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
    b.onclick=()=>{UI.tdMax=!UI.tdMax;vTarefasTD()};h.appendChild(b)}}catch(e){console.warn(e)}return r};if(go._f){Object.keys(go._f).forEach(k=>{if(go._f[k]===_vTD)go._f[k]=vTarefasTD})}}
{const _gTD=go;go=function(v){if(v!==VIEW||!$('#view .xtw')){document.body.classList.remove('xtmax-on')}return _gTD.apply(this,arguments)}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.tdMax&&$('#view .xtw.xtmax')&&!$('dialog[open]')&&!$('#drawer.on')){UI.tdMax=false;document.body.classList.remove('xtmax-on');vTarefasTD()}});
try{const st=document.createElement('style');st.textContent='#view .xtw.xtmax{position:fixed;inset:0;z-index:900;margin:0!important;border-radius:0!important;min-height:0;height:100dvh;max-width:none;padding-top:env(safe-area-inset-top)!important}#view .xtw.xtmax .xtmain,#view .xtw.xtmax .xtside{overflow:auto;max-height:100dvh}#view .xtw.xtmax .xtdet{max-height:100dvh}body.xtmax-on #edFab,body.xtmax-on .fab{display:none!important}#td-max{flex:none;margin-left:8px}';document.head.appendChild(st)}catch(_){}
/* v0.942 · iPad/iPhone (app no ecrã principal): a zona do relógio fica da cor da barra de cima, sem faixa/gradiente branco */
function esCorTopo(){try{if(S.cfg&&S.cfg.estilo==='ios27')return;const b=$('#bar');if(!b||!b.offsetHeight)return;let c=getComputedStyle(b).backgroundColor;if(!c||/rgba\(0, 0, 0, 0\)|transparent/.test(c))return;
  if(document.body.classList.contains('lock')||$('#login:not([hidden])'))return;
  document.querySelectorAll('meta[name=theme-color]').forEach((m,i)=>{if(i){m.remove();return}m.removeAttribute('media');if(m.getAttribute('content')!==c)m.setAttribute('content',c)});
  const sa=matchMedia('(display-mode:standalone)').matches||navigator.standalone;if(sa&&document.documentElement.style.backgroundColor!==c)document.documentElement.style.backgroundColor=c}catch(_){}}
setInterval(esCorTopo,2000);setTimeout(esCorTopo,300);
/* v0.939 · ao mexer numa opção (caixa, botão, separador…) o ecrã volta a desenhar-se SEM saltar para cima: em todas as vistas */
/* repõe o scroll logo a seguir a desenhar; depois só volta a corrigir se mais ninguém mexeu entretanto (não estraga «ir para o topo» ou «mostrar item» de propósito) */
function mpFixo(fn){const ae=document.activeElement;const ch=ae&&ae.dataset?Object.entries(ae.dataset).find(([k])=>!/^(cg|a11y|dec|ik|wg)/.test(k)):null;
  const sel=ch?`[data-${ch[0].replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}="${CSS.escape(ch[1])}"]`:(ae&&ae.id&&ae!==document.body?'#'+CSS.escape(ae.id):null);
  const y0=sel&&ae.getBoundingClientRect?ae.getBoundingClientRect().top:null;const sc=[$('#view'),document.scrollingElement].filter(Boolean).map(e=>({e,v:e.scrollTop}));
  fn();sc.forEach(o=>{if(o.e.isConnected&&o.e.scrollTop!==o.v)o.e.scrollTop=o.v;o.pos=o.e.scrollTop});
  if(sel&&y0!=null&&ae&&ae.closest&&ae.closest('#view')){const n=$('#view').querySelector(sel);if(n){const d=n.getBoundingClientRect().top-y0;if(Math.abs(d)>1&&Math.abs(d)<innerHeight){const v=$('#view');v.scrollTop+=d;sc[0].pos=v.scrollTop}try{n.focus({preventScroll:true})}catch(_){}}}
  const tarde=()=>sc.forEach(o=>{if(o.e.isConnected&&o.e.scrollTop===o.pos&&o.pos<o.v){o.e.scrollTop=o.v;o.pos=o.e.scrollTop}});requestAnimationFrame(()=>{tarde();setTimeout(tarde,120)})}
{let _esUltV=null;const MP_NOMES=["vAjuda", "vAlunos", "vAvaliacao", "vCalendario", "vCriterios", "vDefinicoes", "vDirecao", "vDocumentos", "vDominios", "vEscola", "vHorario", "vInicio", "vInstrumentos", "vJornal", "vMeuHorario", "vModulos", "vPlanta", "vRecursos", "vRelatorios", "vReunioes", "vSumarios", "vTarefas", "vTestes", "vTurmas", "vAula", "vCProfij", "vIntercalar", "vMra", "vOral", "vPainel", "vSnJornal", "vSpruceNote", "vTarefasTD", "vPainelMovel"];
 const mpEmbrulhar=f=>{if(typeof f!=='function'||f.__mp)return f;const w=function(){const v=$('#view');const mesma=VIEW===_esUltV;let r;
   if(window.__esRend||!mesma||!v||!v.childElementCount){r=f.apply(this,arguments)}else{window.__esRend=1;try{mpFixo(()=>{r=f.apply(this,arguments)})}finally{window.__esRend=0}}
   _esUltV=VIEW;return r};w.__mp=1;w.__orig=f;return w};
 const mpAplicar=()=>{MP_NOMES.forEach(n=>{try{const f=eval(n);if(typeof f==='function'&&!f.__mp){const w=mpEmbrulhar(f);eval(n+'=w');const F=go._f||{};Object.keys(F).forEach(k=>{if(F[k]===f)F[k]=w})}}catch(_){}})};
 mpAplicar();setTimeout(mpAplicar,0);setTimeout(mpAplicar,3000);
 {const _gMP=go;go=function(v){if(v!==VIEW)_esUltV=null;const r=_gMP.apply(this,arguments);try{const ct=$('#ctxTurma');if(ct){const fora=VIEW==='inicio';if(ct.classList.contains('semt')!==fora){ct.classList.toggle('semt',fora);try{cabecalho()}catch(_){}}}}catch(_){}try{const F=go._f||{};Object.keys(F).forEach(k=>{if(typeof F[k]==='function'&&!F[k].__mp){const o=F[k];const w=mpEmbrulhar(o);F[k]=w;MP_NOMES.forEach(n=>{try{if(eval(n)===o)eval(n+'=w')}catch(_){}})}})}catch(_){}return r}}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-org2]');if(b)mudarOrg(A(),b.dataset.org2);const mz=e.target.closest&&e.target.closest('[data-mzok]');if(mz){const [tid,iid]=mz.dataset.mzok.split('|');const t=A().turmas.find(x=>x.id===tid);const i=t&&t.instrumentos.find(x=>x.id===iid);if(i){i.matrizEnviada=Date.now();saveNow();toast('Matriz de '+i.nome+' marcada como enviada','ok');go(VIEW)}}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#cal-prop,#cal-prop-imp');if(!b)return;const a=A();if(b.id==='cal-prop'){const q=a.porEscola&&a.porEscola[escAtiva()];if(q)delete q.calCopia;saveNow();toast('Calendário de '+nomeEscola(EC())+' confirmado','ok');go('calendario')}else pickCalendario()});
document.addEventListener('change',e=>{if(e.target.id==='org-f1'){const a=A();a.calendario.fimS1=e.target.value;a.calendario.periodos=semestresDe(a.calendario);saveNow();go(VIEW);toast('Semestres recalculados','ok')}});
document.addEventListener('input',e=>{const t=e.target;if(t.matches&&t.matches('.nmw textarea'))t.parentElement.dataset.v=t.value});
document.addEventListener('keydown',e=>{const t=e.target;if(e.key==='Enter'&&t.matches&&t.matches('.nmw textarea')){e.preventDefault();t.blur()}});
/* ===================== v1.026 · Privacidade no Modo de Apresentação (memória por turma, instantânea em todos os menus) =====================
   O modo de apresentação passa a ter memória por turma: cada turma guarda as suas definições (nomes, fotografias, dados sensíveis,
   informação do professor) e pode ligar-se sozinho ao abrir a turma. Os alunos que pediram para não mostrar a sua informação ficam
   ocultos em TODOS os menus, janelas, avisos, listas pendentes, dicas e até no que é desenhado (roda do sorteio), no instante em que
   aparecem no ecrã (observador do documento, antes de o ecrã ser pintado). Tocar no olho com o modo ligado abre as definições —
   não mostra nada — e «Mostrar tudo» é a única forma de sair. */
const apTM=()=>{const g=S.cfg.apresT;return S.cfg.apresT=(g&&typeof g==='object'&&!Array.isArray(g))?g:{}};
function apC(id){const g=apresCfg();const m=apTM()[id||S.turmaAtiva]||{};
  return {nomes:m.nomes||g.nomes||'primeiro',fotos:m.fotos||g.fotos||'mostrar',sens:m.sens!=null?m.sens:g.sens!==false,prof:m.prof!=null?m.prof:g.prof!==false,ocultos:g.ocultos||[],auto:!!m.auto}}
const apOn=()=>document.body.classList.contains('apres');
const apKey=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const apEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+');
let APRES_SEL='';
apresPrep=function(){const c=apC();const a=A();const M=new Map();const oc=new Set(c.ocultos||[]);const H=[];const ids=new Set(oc);
  if(a){const all=[];(a.turmas.__real||a.turmas).forEach(t=>(t.alunos||[]).forEach(x=>{if(x.nome&&x.nome.trim().length>2)all.push(x)}));
    const ocN=new Set(all.filter(x=>oc.has(x.id)||(x.origemId&&oc.has(x.origemId))).map(x=>apKey(x.nome)));
    all.forEach(x=>{if(ocN.has(apKey(x.nome)))ids.add(x.id)});
    const byF={};all.forEach(x=>{const f=apKey(x.nome.trim().split(/\s+/)[0]);(byF[f]=byF[f]||new Set()).add(apKey(x.nome))});
    const put=(k,d,h)=>{k=apKey(k);if(k.length<3)return;const o=M.get(k);if(o&&o.h&&!h)return;if(o&&!o.h&&!h&&o.d!==d)return;M.set(k,{d,h})};
    all.forEach(x=>{const nm=x.nome.trim().replace(/\s+/g,' ');const p=nm.split(' ');const h=ocN.has(apKey(nm));let d;
      if(h)d='Aluno(a) oculto(a)';else if(c.nomes==='iniciais')d=p.filter(w=>w.length>2||/^[A-ZÁÉÍÓÚ]/.test(w)).map(w=>w[0].toUpperCase()).join('.')+'.';
      else if(c.nomes==='ocultar')d='Aluno(a) n.º '+(x.num||'?');else if(c.nomes==='completo')d=nm;else d=byF[apKey(p[0])].size>1&&p.length>1?p[0]+' '+p[p.length-1][0]+'.':p[0];
      if(d!==nm)put(nm,d,h);
      if(p.length>2&&(h||c.nomes==='iniciais'||c.nomes==='ocultar'))put(p[0]+' '+p[p.length-1],d,h);
      if(h){if(p.length>1)put(p[0]+' '+p[p.length-1][0]+'.',d,h);const f=apKey(p[0]);if([...byF[f]].every(n=>ocN.has(n)))put(p[0],d,h);H.push(nm)}})}
  APRES_MAP=M;const ks=[...M.keys()].sort((x,y)=>y.length-x.length).map(apEsc);
  try{APRES_RX=ks.length?new RegExp('(?<![\\p{L}\\p{N}])(?:'+ks.join('|')+')(?![\\p{L}\\p{N}])','giu'):null}catch(_){APRES_RX=ks.length?new RegExp('(?:'+ks.join('|')+')','gi'):null}
  APRES_SEL=[...ids].map(id=>{const q=CSS.escape(id);return `[data-a="${q}"],[data-fi="${q}"],[data-al="${q}"],[data-aid="${q}"],[data-aluno="${q}"]`}).join(',');
  apresPrep.ids=ids;apresPrep.hid=H};
function apTroca(v){let h=false;APRES_RX.lastIndex=0;const r=v.replace(APRES_RX,m=>{const o=APRES_MAP.get(apKey(m));if(!o)return m;if(o.h)h=true;return o.d});return {r,h}}
apresMarcar=function(el){if(!el||!el.closest||el.closest('[data-apno]'))return;const box=el.closest('tr,.intr,.fgc,.pnai,.dfa,.sti,.mac,.aniv,.fcard,.mscard,.lin,.cdr,.sheet,.rmini,li,.dimp,.pq-i,.kv,.avit,.tcard,.cvcard,.rcard,.nlb,.chip,label,.mq-it,[data-mq]');
  if(box)box.classList.add('apres-oc');else{const d=el.closest('#dw-b,dialog,#avpop,.pop,.popover');if(d)d.classList.add('apres-oc')}};
function apTexto(n){const v=n.nodeValue;if(!v||v.length<3||!APRES_RX)return;const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.tagName))return;APRES_RX.lastIndex=0;if(!APRES_RX.test(v))return;
  if(p.tagName==='OPTION'&&!p.hasAttribute('value'))p.setAttribute('value',p.textContent);const o=apTroca(v);n.nodeValue=o.r;if(o.h)apresMarcar(p.tagName==='OPTION'?p.closest('select')||p:p)}
const AP_ATTR=['title','aria-label','alt','placeholder','data-v','data-tip','data-title'];
function apAtrib(e){if(!APRES_RX||!e.getAttribute)return;for(const at of AP_ATTR){const v=e.getAttribute(at);if(!v||v.length<3)continue;APRES_RX.lastIndex=0;if(!APRES_RX.test(v))continue;const o=apTroca(v);e.setAttribute(at,o.r);
    if(e.tagName==='IMG'){e.classList.add('apres-fimg');if(o.h)e.classList.add('apres-ocimg')}if(o.h)apresMarcar(e)}}
function apValor(e){if(!APRES_RX||e.dataset.apv||e.type==='password'||e.type==='file')return;const v=e.value;if(!v||v.length<3)return;APRES_RX.lastIndex=0;if(!APRES_RX.test(v))return;
  const o=apTroca(v);e.dataset.apv=1;e.readOnly=true;e.value=o.r;const wr=e.closest('.nmw');if(wr)wr.dataset.v=o.r;if(o.h)apresMarcar(e)}
apresAplicar=function(root){if(!apOn())return;root=root&&root.nodeType===1?root:document.body;if(root.closest&&root.closest('#emteste'))return;
  if(root.matches&&root.matches('[contenteditable="true"]')){root.setAttribute('contenteditable','false');root.dataset.apce=1}
  root.querySelectorAll('[contenteditable="true"]').forEach(e=>{e.setAttribute('contenteditable','false');e.dataset.apce=1});
  if(APRES_SEL){try{if(root.matches&&root.matches(APRES_SEL))root.classList.add('apres-oc');root.querySelectorAll(APRES_SEL).forEach(e=>e.classList.add('apres-oc'))}catch(_){}}
  if(!APRES_RX)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const L=[];let n;while(n=w.nextNode()){const v=n.nodeValue;if(v&&v.length>2){APRES_RX.lastIndex=0;if(APRES_RX.test(v))L.push(n)}}L.forEach(apTexto);
  apAtrib(root);root.querySelectorAll('[title],[aria-label],img[alt],[placeholder],[data-v],[data-tip],[data-title]').forEach(apAtrib);
  if(/^(INPUT|TEXTAREA)$/.test(root.tagName))apValor(root);root.querySelectorAll('input,textarea').forEach(apValor)};
let AP_MO=null,AP_IV=null;
function apObservar(on){if(AP_MO){AP_MO.disconnect();AP_MO=null}clearInterval(AP_IV);AP_IV=null;if(!on)return;
  AP_MO=new MutationObserver(L=>{if(!apOn())return;for(const r of L){try{
      if(r.type==='childList')r.addedNodes.forEach(n=>{if(n.nodeType===3)apTexto(n);else if(n.nodeType===1)apresAplicar(n)});
      else if(r.type==='characterData')apTexto(r.target);else if(r.type==='attributes'){if(r.attributeName==='contenteditable'&&r.target.getAttribute('contenteditable')==='true'){r.target.setAttribute('contenteditable','false');r.target.dataset.apce=1}else apAtrib(r.target)}}catch(_){}}});
  AP_MO.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:AP_ATTR.concat(['contenteditable'])});
  /* valores escritos por código (sem mudança no documento) */
  AP_IV=setInterval(()=>{if(!apOn()||!APRES_RX)return;document.querySelectorAll('input:not([data-apv]),textarea:not([data-apv])').forEach(e=>{if(e!==document.activeElement)apValor(e)})},600)}
/* o que é desenhado (ex.: roda do sorteio) também passa pelo filtro */
{const P=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;if(P)['fillText','strokeText'].forEach(fn=>{const o=P[fn];if(!o||o.__ap)return;const w=function(t,...r){try{if(APRES_RX&&typeof t==='string'&&document.body.classList.contains('apres'))t=apTroca(t).r}catch(_){}return o.call(this,t,...r)};w.__ap=1;P[fn]=w})}
apresClasses=function(on){const c=apC();const b=document.body.classList;b.toggle('apres',on);b.toggle('apres-sens',on&&c.sens);b.toggle('apres-prof',on&&c.prof);b.toggle('apres-fotos',on&&c.fotos==='ocultar');
  const bt=$('#apresBtn');if(bt){bt.classList.toggle('on',on);bt.title=on?'Modo de apresentação ligado — toque para as definições':'Modo de apresentação';bt.setAttribute('aria-pressed',String(on))}
  if(!on){document.querySelectorAll('[data-apce]').forEach(e=>{e.setAttribute('contenteditable','true');delete e.dataset.apce});document.querySelectorAll('.apres-oc,.apres-ocimg,.apres-fimg').forEach(e=>e.classList.remove('apres-oc','apres-ocimg','apres-fimg'))}
  apObservar(on);if(on){apresPrep();apresAplicar(document.body)}};
alternarApresentacao=function(){apresDlg()};
apresDlg=function(){const on=apOn();const t=T();const c=apC();const g=apresCfg();const al=t?alunosTodos(t):[];const oc=new Set(g.ocultos||[]);
  const op=(k,v,l)=>`<button type="button" data-ap="${k}" data-v="${v}" class="${c[k]===v?'on':''}" aria-pressed="${c[k]===v}">${l}</button>`;
  const temOc=al.some(x=>oc.has(x.id));
  openDrawer(on?'Modo de Apresentação · Ligado':'Modo de Apresentação',`<div class="ed apdlg" data-apno>
    ${on?`<div class="apon">${ic('eye',18)}<div><b>Continua a projetar com a informação protegida.</b><br><span>Nada foi mostrado. Mude o que precisar e toque em <b>Aplicar</b>. Para voltar a ver tudo, use <b>Mostrar Tudo</b> (fim do modo de apresentação).</span></div></div>`
      :`<p class="hint" style="margin-top:0">Para projetar na aula sem expor dados pessoais. Nada é alterado nos seus dados — só o que se vê no ecrã.</p>`}
    ${t?`<p class="aptur">${anoBadge(t,'sm')} <span><b>Turma ${esc(t.nome)}</b> · ${esc(t.disciplina)}<br><span class="mut">Estas definições ficam guardadas só para esta turma (cada turma tem a sua memória).</span></span></p>`:''}
    <label>Nomes dos alunos</label><div class="seg">${op('nomes','primeiro','Primeiro Nome')}${op('nomes','iniciais','Iniciais')}${op('nomes','ocultar','Só o N.º')}${op('nomes','completo','Completos')}</div>
    <label style="margin-top:12px">Fotografias dos alunos</label><div class="seg">${op('fotos','mostrar','Mostrar')}${op('fotos','ocultar','Desfocar')}</div>
    <label class="chk" style="margin-top:14px"><input type="checkbox" id="ap-sens" ${c.sens?'checked':''}> <span><b>Ocultar dados sensíveis dos alunos</b><br><span class="mut">N.º de processo, data de nascimento e idade, repetência, ASE, medidas (MSAI / DL 54), encarregado de educação e contactos, observações.</span></span></label>
    <label class="chk" style="margin-top:8px"><input type="checkbox" id="ap-prof" ${c.prof?'checked':''}> <span><b>Proteger a informação do professor</b><br><span class="mut">Esconde reuniões e lembretes, o seu horário, definições e escola, avisos de cópias, a pesquisa e a troca para outras turmas.</span></span></label>
    ${t?`<label class="chk" style="margin-top:8px"><input type="checkbox" id="ap-auto" ${c.auto||temOc&&apTM()[t.id]==null?'checked':''}> <span><b>Ligar sempre ao abrir esta turma</b><br><span class="mut">Para turmas com alunos que nunca querem ver a sua informação projetada: o modo liga-se sozinho quando abre a turma ou entra na app com ela.</span></span></label>`:''}
    ${al.length?`<h3>${ic('user',15)} Alunos a ocultar <span class="mut" style="font-weight:500">— ${esc(t.nome)}</span></h3><p class="hint" style="margin-top:0">Ficam totalmente ocultos em todos os menus (nome, notas, fotografia, ficha, relatório, sorteio) — para quem não quer que a turma veja a sua informação.${on?' Com o modo ligado, os alunos ocultos aparecem aqui só pelo número.':''}</p>
      <div class="row" style="gap:6px;margin-bottom:6px"><button type="button" class="btn sm" id="ap-nen">Nenhum</button><button type="button" class="btn sm" id="ap-tod">Todos</button></div>
      <div class="apal">${al.map(x=>`<label class="chk"><input type="checkbox" data-apo="${x.id}" ${oc.has(x.id)?'checked':''}> <span><b>${esc(numAl(x))}</b> ${on&&oc.has(x.id)?'<i class="mut">oculto(a)</i>':esc(x.nome)}</span></label>`).join('')}</div>`:''}
    <div class="row apbt" style="margin-top:16px">${on?`<button class="btn pri" id="ap-ok">${ic('check',15)} Aplicar</button><span class="sp1"></span><button class="btn" id="ap-sair">${ic('eye',15)} Mostrar Tudo (sair do modo)</button>`:`<button class="btn pri" id="ap-ok">${ic('access',15)} Iniciar Apresentação</button>`}</div></div>`);
  const tmp={nomes:c.nomes,fotos:c.fotos};
  $$('[data-ap]').forEach(b=>b.onclick=()=>{tmp[b.dataset.ap]=b.dataset.v;$$(`[data-ap="${b.dataset.ap}"]`).forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',String(x===b))})});
  const au=$('#ap-auto');let auTocado=apTM()[t?t.id:'']!=null;if(au)au.addEventListener('change',()=>{auTocado=true});
  const auSug=()=>{if(au&&!auTocado)au.checked=$$('[data-apo]').some(x=>x.checked)};$$('[data-apo]').forEach(x=>x.addEventListener('change',auSug));
  const tod=v=>{$$('[data-apo]').forEach(x=>x.checked=v);auSug()};if($('#ap-nen')){$('#ap-nen').onclick=()=>tod(false);$('#ap-tod').onclick=()=>tod(true)}
  $('#ap-ok').onclick=()=>{const m={nomes:tmp.nomes,fotos:tmp.fotos,sens:$('#ap-sens').checked,prof:$('#ap-prof').checked,auto:!!($('#ap-auto')&&$('#ap-auto').checked)};
    Object.assign(g,{nomes:m.nomes,fotos:m.fotos,sens:m.sens,prof:m.prof});if(t)apTM()[t.id]=m;
    if(al.length){const ids=new Set(al.map(x=>x.id));g.ocultos=(g.ocultos||[]).filter(id=>!ids.has(id)).concat($$('[data-apo]').filter(x=>x.checked).map(x=>x.dataset.apo))}
    save();closeDrawer();apresClasses(true);if(m.prof&&APRES_BLOQ.includes(VIEW))go('inicio');else go(VIEW);
    const n=al.filter(x=>(g.ocultos||[]).includes(x.id)).length;try{audit('Apresentação',on?'Definições do modo de apresentação alteradas':'Modo de apresentação ligado',t?t.nome:'')}catch(_){}
    toast((on?'Definições aplicadas':'Modo de apresentação ligado')+(n?' · '+n+(n===1?' aluno oculto':' alunos ocultos'):'')+(on?'':' — toque no olho para as definições'),'ok')};
  const sx=$('#ap-sair');if(sx)sx.onclick=()=>{closeDrawer();apresClasses(false);go(VIEW);try{audit('Apresentação','Modo de apresentação desligado (mostrar tudo)',t?t.nome:'')}catch(_){}toast('Modo de apresentação desligado — tudo visível','ok')}};
/* cada janela lateral começa limpa (a desfocagem de uma ficha de aluno oculto não passa para a janela seguinte) */
{const _oDa=openDrawer;openDrawer=function(){try{const d=document.getElementById('dw-b');if(d)d.classList.remove('apres-oc')}catch(_){}return _oDa.apply(this,arguments)}}
/* memória por turma: ao entrar numa turma com «ligar sempre», o modo liga-se ANTES de a página ser desenhada; nunca se desliga sozinho */
{let _apT;const _gAp=go;go=function(v){try{const id=S.turmaAtiva||null;if(id!==_apT){_apT=id;const m=id&&apTM()[id];if(m&&m.auto&&!apOn()){apresPrep();apresClasses(true);setTimeout(()=>toast('Modo de apresentação ligado — esta turma tem alunos ocultos','ok'),60)}else if(apOn()){apresPrep();apresClasses(true)}}}catch(e){console.warn(e)}
  return _gAp.apply(this,arguments)};if(_gAp._f)go._f=_gAp._f}

/* ===================== v1.026 · Modo «Em teste»: abaixo da turma, só quando há teste — relógio, temporizador e nome do teste =====================
   Aparece no menu, por baixo da turma, no dia de um teste (instrumento do tipo teste, prova escrita ou questão-aula com a data de hoje)
   e só na janela das aulas dessa turma (se houver horário). Abre um ecrã para projetar: hora certa, tempo que falta, hora de fim,
   tempo adicional (sem nomes) e regras. Leve: atualiza uma vez por segundo, sem animações pesadas. */
const EMT=()=>S.emt=(S.emt&&typeof S.emt==='object')?S.emt:{};
const emtEhTeste=i=>{try{const ab=TIPO_AB(i.tipo||'');return ab==='T'||/^Q/.test(ab)}catch(_){return /teste|prova escrita|quest/i.test(i.tipo||'')}};
function emtBlocos(a,t,d){d=d||new Date();try{const H=a.horProf;if(!H||!Array.isArray(H.aulas))return [];const L=H.aulas.filter(x=>x.dia===d.getDay()&&(H.mapa||{})[chaveAula(x)]===t.id).map(x=>({ini:+x.ini,fim:+x.fim,sala:x.sala||''})).sort((p,q)=>p.ini-q.ini);
    const B=[];L.forEach(x=>{const u=B[B.length-1];if(u&&x.ini-u.fim<=15){u.fim=Math.max(u.fim,x.fim)}else B.push({...x})});return B}catch(_){return []}}
function emtHoje(){const a=A();if(!a)return [];const hj=isoData(new Date());const now=new Date();const mn=now.getHours()*60+now.getMinutes();const R=[];
  (a.turmas||[]).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(i.data!==hj||!emtEhTeste(i))return;const B=emtBlocos(a,t,now);const st=EMT()[i.id];
    if(B.length&&!(st&&st.ini&&!st.fechado)){const ok=B.some(b=>mn>=b.ini-60&&mn<=b.fim+30);if(!ok)return}R.push({t,i,B})}));return R}
function emtNav(){document.querySelectorAll('#side .emtnav').forEach(e=>e.remove());const L=emtHoje();emtNav._k=L.map(o=>o.i.id).join();if(!L.length)return;
  const tree=$('#tTree');L.forEach(o=>{const st=EMT()[o.i.id];const corre=st&&st.ini&&!st.pz;
    const html=`<button type="button" class="nav emtnav ${corre?'corre':''}" data-emt="${o.i.id}" data-emtt="${o.t.id}" title="Em teste: ${esc(o.i.nome)} — ${esc(o.t.nome)} · ${esc(o.t.disciplina)}"><span class="emtdot" aria-hidden="true"></span><span class="lbl"><b>Em teste</b><span class="tdisc">${esc(o.i.nome)} · ${esc(o.t.nome)}</span></span></button>`;
    let ref=null;if(tree&&tree.children.length&&!tree.classList.contains('uma')){ref=tree.querySelector(`.tnode[data-tt="${CSS.escape(o.t.id)}"]`)||[...tree.querySelectorAll('.tnode.tgrp')].find(b=>(b.dataset.tgk||'').split('|')[0]===o.t.nome);
      if(ref){let n=ref;while(n.nextElementSibling&&n.nextElementSibling.matches('.tdsel,.tkids,.emtnav'))n=n.nextElementSibling;n.insertAdjacentHTML('afterend',html);return}}
    if(tree&&tree.classList.contains('uma'))tree.insertAdjacentHTML('afterbegin',html);else{const h=$('#navTurmas')||$('#grpT');if(h)h.insertAdjacentHTML('afterend',html)}});
  document.querySelectorAll('#side .emtnav').forEach(b=>b.onclick=e=>{e.stopPropagation();emtAbrir(b.dataset.emt,b.dataset.emtt)})}
{const _nTe=navTurmas;navTurmas=function(){const r=_nTe.apply(this,arguments);clearTimeout(navTurmas._emt);navTurmas._emt=setTimeout(()=>{try{emtNav();ufcdRotulos()}catch(e){console.warn(e)}},0);return r}}
setInterval(()=>{try{const k=emtHoje().map(o=>o.i.id).join();if(k!==emtNav._k)emtNav()}catch(_){}},60000);
/* a árvore das turmas é redesenhada por vários passos: volta a pôr «Em teste» no sítio certo sempre que muda */
{let _emtMo=null;const liga=()=>{const tr=document.getElementById('tTree');if(!tr||_emtMo)return;_emtMo=new MutationObserver(L=>{const so=L.every(r=>[...r.addedNodes,...r.removedNodes].every(n=>n.nodeType!==1||n.classList.contains('emtnav')));if(so)return;clearTimeout(liga._t);liga._t=setTimeout(()=>{try{emtNav();ufcdRotulos()}catch(_){}},0)});_emtMo.observe(tr,{childList:true})};liga();setTimeout(liga,1500)}
function emtSt(i,t,a){const E=EMT();let s=E[i.id];if(!s){const now=new Date(),mn=now.getHours()*60+now.getMinutes();const B=emtBlocos(a,t,now);const b=B.find(x=>mn>=x.ini&&mn<x.fim)||B.find(x=>x.ini>mn);
    let dur=b?(mn>=b.ini?b.fim-mn:b.fim-b.ini):(/^Q/.test((()=>{try{return TIPO_AB(i.tipo)}catch(_){return ''}})())?20:90);dur=Math.max(5,Math.min(240,Math.round(dur)));
    s=E[i.id]={dur,ini:null,acum:0,pz:null,extra:25,regras:'Telemóveis desligados e guardados na mochila.\nEscreve o nome e o número em todas as folhas.\nSem conversas: dúvidas, levanta o braço.\nNo fim, verifica as respostas antes de entregar.'};}
  return s}
const emtDecorrido=s=>s.ini?Math.max(0,((s.pz||Date.now())-s.ini-(s.acum||0))):0;
const emtFmt=ms=>{const neg=ms<0;ms=Math.abs(ms);const h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),sg=Math.floor(ms%60000/1000);return (neg?'+':'')+(h?h+':'+String(m).padStart(2,'0'):String(m))+':'+String(sg).padStart(2,'0')};
const emtHora=d=>String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
let EMT_IV=null,EMT_WL=null;
function emtFechar(){clearInterval(EMT_IV);EMT_IV=null;const o=$('#emteste');if(o)o.remove();document.body.classList.remove('emt-on');try{EMT_WL&&EMT_WL.release()}catch(_){}EMT_WL=null;try{if(document.fullscreenElement)document.exitFullscreen()}catch(_){}try{emtNav()}catch(_){}}
function emtBip(n){try{const C=new (window.AudioContext||window.webkitAudioContext)();for(let k=0;k<(n||3);k++){const o=C.createOscillator(),g=C.createGain();o.frequency.value=880;o.connect(g);g.connect(C.destination);const t0=C.currentTime+k*.45;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.3,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+.32);o.start(t0);o.stop(t0+.35)}setTimeout(()=>C.close(),2500)}catch(_){}}
function emtAbrir(iid,tid){const a=A();const t=a&&(a.turmas||[]).find(x=>x.id===tid);const i=t&&(t.instrumentos||[]).find(x=>x.id===iid);if(!i)return toast('Teste não encontrado','erro');
  emtFechar();const s=emtSt(i,t,a);const B=emtBlocos(a,t);const sala=(B[0]&&B[0].sala)||'';
  const nExtra=alunosAval(t).filter(x=>(x.acomod||[]).some(z=>/tempo/i.test(z))).length;
  const o=document.createElement('div');o.id='emteste';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Modo em teste: '+i.nome);
  o.innerHTML=`<div class="emt-top"><span class="emt-tag"><i></i> Em teste</span><span class="emt-tur">${esc(t.nome)} · ${esc(t.disciplina)}${sala?' · Sala '+esc(sala):''}</span><span class="sp1"></span>
      <button type="button" class="emt-b" id="emt-fs" title="Ecrã inteiro">${ic('arrowUp',18)}<span>Ecrã inteiro</span></button><button type="button" class="emt-b" id="emt-x" title="Sair (Esc)">${ic('x',18)}<span>Sair</span></button></div>
    <h1 class="emt-nome">${esc(i.nome)}</h1><p class="emt-sub">${esc(i.tipo||'Teste')}${i.periodo?' · '+i.periodo+'.º período':''}</p>
    <div class="emt-grid"><div class="emt-cx emt-rel"><small>Hora</small><div class="emt-num"><b id="emt-h">--:--</b><span id="emt-s">:--</span></div><small id="emt-dt"></small></div>
      <div class="emt-cx emt-tmp"><small id="emt-lbl">Tempo do teste</small><div class="emt-num"><b id="emt-r">--:--</b></div><div class="emt-bar" aria-hidden="true"><i id="emt-bar"></i></div><small id="emt-fim"></small><small id="emt-ex"></small></div></div>
    <div class="emt-regras" id="emt-rg"></div>
    <div class="emt-ctl"><button type="button" class="emt-b pri" id="emt-go"></button><button type="button" class="emt-b" id="emt-m5" title="Menos 5 minutos">−5 min</button><button type="button" class="emt-b" id="emt-p5" title="Mais 5 minutos">+5 min</button>
      <label class="emt-dur">Duração <input type="number" id="emt-d" min="5" max="300" step="5" value="${s.dur}"> min</label>${nExtra?`<label class="emt-dur">Tempo adicional <select id="emt-xs">${[0,10,15,20,25,30,50].map(p=>`<option value="${p}" ${+s.extra===p?'selected':''}>${p?'+'+p+' %':'sem'}</option>`).join('')}</select></label>`:''}
      <button type="button" class="emt-b" id="emt-rs" title="Recomeçar">${ic('refresh',16)} Recomeçar</button><button type="button" class="emt-b" id="emt-re" title="Editar as regras">${ic('pencil',16)} Regras</button></div>`;
  document.body.appendChild(o);document.body.classList.add('emt-on');
  const rg=()=>{const L=String(s.regras||'').split('\n').map(x=>x.trim()).filter(Boolean);$('#emt-rg').innerHTML=L.length?`<ul>${L.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''};rg();
  let bipou=false,bip5=false;
  const tick=()=>{const now=new Date();$('#emt-h').textContent=emtHora(now);$('#emt-s').textContent=':'+String(now.getSeconds()).padStart(2,'0');
    $('#emt-dt').textContent=now.toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'});
    const tot=s.dur*60000,el=emtDecorrido(s),rest=tot-el;const corre=s.ini&&!s.pz;
    $('#emt-r').textContent=emtFmt(s.ini?rest:tot);$('#emt-lbl').textContent=!s.ini?'Tempo do teste':s.pz?'Em pausa':rest>0?'Tempo restante':'Tempo terminado';
    $('#emt-bar').style.width=(s.ini?Math.min(100,Math.max(0,el/tot*100)):0)+'%';
    const fim=s.ini?new Date(now.getTime()+Math.max(0,rest)):new Date(now.getTime()+tot);
    $('#emt-fim').textContent=(s.ini?'Termina às ':'Se começar agora, termina às ')+emtHora(fim)+(s.pz?' (em pausa)':'');
    const ex=$('#emt-ex');if(nExtra&&+s.extra){const fx=new Date(fim.getTime()+tot*(+s.extra)/100);ex.textContent='Tempo adicional (+'+s.extra+' %): '+nExtra+(nExtra===1?' aluno':' alunos')+' até às '+emtHora(fx)}else ex.textContent='';
    o.classList.toggle('emt-10',!!s.ini&&rest<=600000&&rest>300000);o.classList.toggle('emt-5',!!s.ini&&rest<=300000&&rest>0);o.classList.toggle('emt-0',!!s.ini&&rest<=0);o.classList.toggle('emt-pz',!!s.pz);
    if(corre&&rest<=300000&&rest>290000&&!bip5){bip5=true;emtBip(1)}if(corre&&rest<=0&&!bipou){bipou=true;emtBip(3)}
    $('#emt-go').innerHTML=!s.ini?ic('play',18)+' Começar':s.pz?ic('play',18)+' Continuar':ic('pause',18)+' Pausa'};
  const guarda=()=>{save();tick();try{emtNav()}catch(_){}};
  $('#emt-go').onclick=()=>{if(!s.ini){s.ini=Date.now();s.acum=0;s.pz=null;bipou=bip5=false;try{audit('Em teste','Início do teste',i.nome+' · '+t.nome)}catch(_){}}else if(s.pz){s.acum=(s.acum||0)+(Date.now()-s.pz);s.pz=null}else s.pz=Date.now();guarda()};
  $('#emt-m5').onclick=()=>{s.dur=Math.max(5,s.dur-5);$('#emt-d').value=s.dur;guarda()};$('#emt-p5').onclick=()=>{s.dur=Math.min(300,s.dur+5);$('#emt-d').value=s.dur;bipou=false;guarda()};
  $('#emt-d').onchange=e=>{s.dur=Math.max(5,Math.min(300,+e.target.value||s.dur));bipou=false;guarda()};
  const xs=$('#emt-xs');if(xs)xs.onchange=()=>{s.extra=+xs.value;guarda()};
  $('#emt-rs').onclick=()=>{if(s.ini&&!confirm('Recomeçar o temporizador deste teste?'))return;s.ini=null;s.acum=0;s.pz=null;bipou=bip5=false;guarda()};
  $('#emt-re').onclick=()=>{const v=prompt('Regras a mostrar durante o teste (uma por linha; use \\n para mudar de linha):',String(s.regras||'').replace(/\n/g,'\\n'));if(v==null)return;s.regras=v.replace(/\\n/g,'\n');rg();save()};
  $('#emt-x').onclick=emtFechar;$('#emt-fs').onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else o.requestFullscreen&&o.requestFullscreen()}catch(_){}};
  o.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.fullscreenElement){e.preventDefault();emtFechar()}if(e.key===' '&&e.target===o){e.preventDefault();$('#emt-go').click()}});o.tabIndex=-1;o.focus();
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>EMT_WL=w).catch(()=>{})}catch(_){}
  tick();EMT_IV=setInterval(()=>{if(!document.getElementById('emteste')){clearInterval(EMT_IV);return}tick()},1000)}

