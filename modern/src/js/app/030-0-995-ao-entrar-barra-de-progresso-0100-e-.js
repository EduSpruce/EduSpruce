/* 0.995 · ao entrar: barra de progresso 0–100 % e a app só abre depois de sincronizar */
let _gateOn=false;
function nvGateUI(){let o=document.getElementById('nvgate');if(o)return o;o=document.createElement('div');o.id='nvgate';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','nvg-t');
  const tpl=document.querySelector('#splash-tpl');const logo=tpl?tpl.innerHTML.split('<div class="spn">')[0]:'';
  o.innerHTML=`<div class="nvgw">${logo}<div class="spn">Edu<em>Spruce</em></div><h2 id="nvg-t">A sincronizar os seus dados</h2><div class="nvgb" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-labelledby="nvg-t"><i></i></div><div class="nvgp"><b id="nvg-p">0%</b><span id="nvg-m">A preparar…</span></div><div class="nvga" id="nvg-a" hidden></div></div>`;
  document.body.appendChild(o);return o}
async function nvSyncGate(){if(_gateOn)return;let L;try{L=nvL()}catch(_){return}if(!L.prov||!(L.k||_nvK)||!SESSAO){const g=document.getElementById('nvgate');if(g)g.remove();return}_gateOn=true;
  const o=nvGateUI();o.classList.remove('fora');const bar=o.querySelector('.nvgb'),fill=bar.querySelector('i'),pct=o.querySelector('#nvg-p'),msg=o.querySelector('#nvg-m'),acts=o.querySelector('#nvg-a');
  let alvo=0,atual=0,raf=0;const anima=()=>{atual+=(alvo-atual)*0.35;if(alvo-atual<0.3)atual=alvo;fill.style.width=atual+'%';pct.textContent=Math.round(atual)+'%';bar.setAttribute('aria-valuenow',Math.round(atual));if(atual<alvo)raf=requestAnimationFrame(anima);else raf=0};
  let fim=false;const set=(v,t)=>{if(fim&&v<100)return;alvo=Math.max(alvo,Math.min(100,v));if(t)msg.textContent=t;if(v>=100)fim=true;if(!raf)raf=requestAnimationFrame(anima)};
  /* enquanto espera pela rede, avança devagar para mostrar que está vivo */
  const lento=setInterval(()=>{if(alvo<88)set(alvo+0.6)},400);
  const fechar=()=>{clearInterval(lento);window.__nvProg=null;o.classList.add('fora');setTimeout(()=>{o.remove();_gateOn=false;document.body.classList.remove('nv-gating');try{window.__nvGateFila&&window.__nvGateFila()}catch(_){}setTimeout(()=>{try{mostrarAvisos(false)}catch(_){}},400)},200)};
  const botoes=B=>{acts.hidden=!B.length;acts.innerHTML=B.map((b,i)=>`<button type="button" class="btn ${b.c||''}" data-g="${i}">${b.t}</button>`).join('');acts.querySelectorAll('[data-g]').forEach(x=>x.onclick=()=>B[+x.dataset.g].f())};
  const correr=async()=>{botoes([]);o.classList.remove('erro');set(6,'A ligar à sua conta Google…');
    if(!navigator.onLine){set(100,'Sem internet — os dados deste aparelho estão prontos; sincroniza quando a ligação voltar.');o.classList.add('erro');botoes([{t:'Continuar',c:'pri',f:fechar}]);return}
    window.__nvProg=f=>set(18+f*72,'A receber e a enviar as alterações…');
    set(12,'A verificar a nuvem…');let r=null;if(await nvNadaNovo()){alvo=atual=100;fill.style.width='100%';pct.textContent='100%';msg.textContent='Pronto';setTimeout(fechar,60);setTimeout(()=>{window.__nvFotos=1;nvSincronizar(false).catch(()=>{}).finally(()=>{window.__nvFotos=0})},700);return}window.__nvSemFotos=true;try{r=await nvSincronizar(false)}catch(_){}finally{window.__nvSemFotos=false}if(r&&!r.rapida)nvFotosFundo();
    if(r){alvo=atual=100;fill.style.width='100%';pct.textContent='100%';msg.textContent='Pronto';setTimeout(fechar,90);return}
    const L2=nvL();
    if(L2.renovar){o.classList.add('erro');msg.textContent='A ligação à Google expirou. Toque para renovar e sincronizar.';botoes([{t:ic('refresh',15)+' Renovar e Sincronizar',c:'pri',f:async()=>{try{await nvRenovar(false)}catch(e){msg.textContent=e.message;return}correr()}},{t:'Continuar sem Sincronizar',f:fechar}]);return}
    if(!L2.k){fechar();return} /* o assistente trata do código */
    o.classList.add('erro');msg.textContent='Não foi possível sincronizar: '+(L2.erro||'sem resposta da nuvem')+'.';botoes([{t:ic('refresh',15)+' Tentar de Novo',c:'pri',f:correr},{t:'Continuar com os Dados Deste Aparelho',f:fechar}])};
  await correr()}
/* progresso real dentro da sincronização (partes e ficheiros) */
/* ao abrir com sessão iniciada e depois de entrar com Google */
{let _gn=0;const _gt=setInterval(()=>{_gn++;try{const s=sessaoAtual();if(!s||s.tipo!=='google'){if(_gn>4)clearInterval(_gt);return}if(SESSAO&&!document.body.classList.contains('login-on')){clearInterval(_gt);nvKeepRepor();nvSyncGate()}}catch(e){console.warn(e)}if(_gn>200)clearInterval(_gt)},50)}
/* cobre a app logo à partida, antes de a sessão estar pronta, para não se ver nada por sincronizar */
try{const s0=sessaoAtual();const L0=JSON.parse(localStorage.getItem(NV_KEY)||'{}');if(s0&&s0.tipo==='google'&&L0.prov&&(L0.k||localStorage.getItem('eskeep'))){const g=nvGateUI();g.querySelector('#nvg-m').textContent='A ligar à sua conta Google…'}}catch(_){}
{const _as2=nvAssist;nvAssist=function(forcar){if(nvKeepRepor()){setTimeout(nvSyncGate,100);return}return _as2.apply(this,arguments)}}

/* 0.905 · «Esqueci-me do código»: confirma a identidade e escolhe um código novo */
{const _pp=pedirPin;pedirPin=function(){const pr=_pp.apply(this,arguments);setTimeout(()=>{const o=document.querySelector('#login.pinmode .pinc');if(!o||o.querySelector('.plesq'))return;
  const n=o.querySelector('.lgnota');const b=document.createElement('button');b.type='button';b.className='plesq';b.textContent='Esqueci-me do código';(n||o).insertAdjacentElement(n?'beforebegin':'beforeend',b);b.onclick=pinRecuperar},0);return pr}}
let _pinTent=0;
async function pinRecuperar(alvo){if(!(alvo instanceof Element))alvo=null;const L=(()=>{try{return nvL()}catch(_){return {}}})();const s=SESSAO||{};const conta=((S.cfg.auth||{}).contas||[]).find(c=>c.u===s.u);
  const modo=L.k&&L.salt?'nuvem':conta?'conta':null;
  if(!modo){alert('Não há outra forma de confirmar a sua identidade neste aparelho.\n\nToque em «Sair», entre de novo com a sua conta e defina um código novo em Definições › Dados e Segurança.');return}
  const d=document.createElement('dialog');d.className='nvmc';d.innerHTML=`<form class="nvmcf" onsubmit="return false" autocomplete="on"><input type="text" name="username" autocomplete="username" value="${esc(gsCfg&&gsCfg().email||s.u||'')}" hidden readonly><h2>${ic('cadeadoAb',18)} Esqueci-me do Código</h2>
    <p class="hint">${modo==='nuvem'?'Para confirmar que é você, escreva o <b>código de encriptação da sincronização</b> (o que usa para os dados na nuvem, com pelo menos 8 algarismos).':'Para confirmar que é você, escreva a <b>palavra-passe da sua conta</b> ('+esc(s.u)+').'}</p>
    <label for="rp-0">${modo==='nuvem'?'Código de encriptação':'Palavra-passe'}</label><input type="password" id="${modo==='nuvem'?'rp-0':'rp-0p'}" autocomplete="current-password" ${modo==='nuvem'?'inputmode="numeric"':''}>
    <label for="rp-1">Novo código de acesso (4 algarismos)</label><input type="password" id="rp-1" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off">
    <input type="password" id="rp-2" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="Repetir o novo código" aria-label="Repetir o novo código">
    <div class="nverr" id="rp-e" role="alert"></div>
    <div class="row" style="gap:8px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn" id="rp-x">Cancelar</button><button type="button" class="btn pri" id="rp-ok">${ic('check',15)} Mudar o Código</button></div></form>`;
  document.body.appendChild(d);d.addEventListener('keydown',e=>e.stopPropagation());d.showModal();const g=id=>d.querySelector('#'+id),er=g('rp-e');setTimeout(()=>{const f=g('rp-0')||g('rp-0p');if(f)f.focus()},50);['rp-1','rp-2'].forEach(id=>g(id).addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,4)}));
  g('rp-x').onclick=()=>{d.close();d.remove()};
  g('rp-ok').onclick=async()=>{er.textContent='';if(_pinTent>=5){er.textContent='Demasiadas tentativas. Toque em «Sair» e entre de novo.';return}
    const prova=(g('rp-0')||g('rp-0p')).value,a=g('rp-1').value,b=g('rp-2').value;if(!prova)return er.textContent='Escreva '+(modo==='nuvem'?'o código de encriptação.':'a palavra-passe.');
    if(!/^\d{4}$/.test(a))return er.textContent='O novo código tem 4 algarismos.';if(a!==b)return er.textContent='Os códigos novos não coincidem.';
    let ok=false;try{if(modo==='nuvem'){const k0=await nvChaveDe(prova,L.salt);ok=b64(await crypto.subtle.exportKey('raw',k0))===L.k}else ok=await verificarPasse(conta,conta.u,prova)}catch(_){ok=false}
    if(!ok){_pinTent++;try{audit('Segurança','Recuperação do código de acesso falhada',s.u||'')}catch(_){}er.textContent=(modo==='nuvem'?'Código de encriptação errado.':'Palavra-passe errada.')+(5-_pinTent<=3?' Restam '+(5-_pinTent)+' tentativa(s).':'');return}
    S.cfg.pinHash=await sha('eg:'+a);try{saveNow()}catch(_){}try{audit('Segurança','Código de acesso mudado (recuperação)',s.u||'')}catch(_){}
    d.close();d.remove();toast('Código de acesso mudado','ok');
    /* entra logo com o código novo */
    const pad=alvo&&alvo.isConnected?alvo:document.querySelector('#login.pinmode');if(pad){for(const x of a){const k=pad.querySelector(`[data-pk="${x}"]`);if(k)k.click();await new Promise(r=>setTimeout(r,60))}}}}

/* 0.907 · «Esqueci-me do código» também nas janelas que pedem o código (desbloquear dados, mudar ou desativar o código…) */
{const _pd=pinDialog;pinDialog=function(o){const pr=_pd.apply(this,arguments);try{if(S.cfg.pinHash&&o&&o.verifica&&!/repita/i.test(o.t||'')){const ds=document.querySelectorAll('dialog.pindlg');const d=ds[ds.length-1];if(d&&!d.querySelector('.plesq')){const b=document.createElement('button');b.type='button';b.className='plesq';b.textContent='Esqueci-me do código';d.appendChild(b);b.onclick=()=>pinRecuperar(d)}}}catch(e){console.warn(e)}return pr}}

/* 0.908 · sincronização rápida: sem alterações locais e com o manifesto igual na nuvem, só um pedido pequeno */
{const _nsF=nvSincronizar;nvSincronizar=async function(interativo){try{const L=nvL();const prov=nvProv();
    if(!interativo&&!window.__nvFotos&&prov===PROV.google&&L.base&&L.manVer&&!Object.keys(L.mod||{}).length&&!L.rekey&&!_nvBusy&&_nvK){const m=prov._ids&&prov._ids[NV_PREF+'manifest.json'];
      if(m){const r=await gsFetch('https://www.googleapis.com/drive/v3/files/'+m.id+'?fields=version');const j=await r.json().catch(()=>({}));if(j.version&&String(j.version)===String(L.manVer)){nvSet({ultimo:Date.now(),erro:''});try{nvBadge()}catch(_){}return {rapida:true,env:0,rec:0}}}}}catch(_){}
  const r=await _nsF.apply(this,arguments);
  try{if(r&&nvProv()===PROV.google){const m=PROV.google._ids&&PROV.google._ids[NV_PREF+'manifest.json'];if(m){const _v=gsFetch('https://www.googleapis.com/drive/v3/files/'+m.id+'?fields=version').then(x=>x.json()).then(j=>{if(j&&j.version)nvSet({manVer:String(j.version)})}).catch(()=>{});if(window.__nvSemFotos)await _v}}}catch(_){}
  return r}}
/* avisos, parabéns, guia e janelas só depois de a sincronização chegar aos 100 % */
{const _sm=HTMLDialogElement.prototype.showModal;const fila=[];HTMLDialogElement.prototype.showModal=function(){if(document.getElementById('nvgate')&&!this.matches('.nvas,.nvmc,.pindlg')){fila.push(this);this.dataset.espera=1;return}return _sm.apply(this,arguments)};
  window.__nvGateFila=()=>{while(fila.length){const d=fila.shift();if(d.isConnected&&!d.open){delete d.dataset.espera;try{_sm.call(d)}catch(_){}}}}}
setInterval(()=>{const g=document.getElementById('nvgate');document.body.classList.toggle('nv-gating',!!g);if(!g&&window.__nvGateFila&&document.querySelector('dialog[data-espera]'))window.__nvGateFila()},150);
{const _ma2=mostrarAvisos;mostrarAvisos=function(){if(document.getElementById('nvgate')){clearTimeout(mostrarAvisos._t);mostrarAvisos._t=setTimeout(()=>mostrarAvisos.apply(this,arguments),800);return}return _ma2.apply(this,arguments)}}

/* 0.909 · sincronização inicial ~10× mais rápida
   - guarda os ids dos ficheiros da nuvem (por conta Google): ao abrir, basta 1 pedido pequeno para saber se algo mudou
   - fotografias e anexos passam para segundo plano: a app abre logo que os dados (texto) chegam
   - até 12 partes ao mesmo tempo; a versão do manifesto é lida sem atrasar a entrada */
const NV_GIDS='es.gids';
const nvGEmail=()=>{try{const s=sessaoAtual();return String(gsCfg().email||(s&&(s.email||s.u))||'').toLowerCase()}catch(_){return ''}};
function nvGidsCache(){try{const c=JSON.parse(localStorage.getItem(NV_GIDS)||'null');if(c&&c.m&&c.u&&c.u===nvGEmail())return c.m}catch(_){}return null}
{const G=PROV.google;const _m=G._mapa,_l=G.ler,_e=G.escrever;
  G._mapa=async function(f){if(!this._ids&&!f){const c=nvGidsCache();if(c)this._ids=c}if(this._ids&&!f)return this._ids;const m=await _m.call(this,true);try{localStorage.setItem(NV_GIDS,JSON.stringify({u:nvGEmail(),m}))}catch(_){}return m};
  const _guarda=()=>{try{if(G._ids)localStorage.setItem(NV_GIDS,JSON.stringify({u:nvGEmail(),m:G._ids}))}catch(_){}};
  G.ler=async function(n){try{return await _l.call(this,n)}catch(e){if(/erro 404/.test(e.message||'')){await this._mapa(true);return await _l.call(this,n)}throw e}};
  G.escrever=async function(n,t){try{const r=await _e.call(this,n,t);_guarda();return r}catch(e){if(/erro 404/.test(e.message||'')){await this._mapa(true);const r=await _e.call(this,n,t);_guarda();return r}throw e}}}
{const _ns=nvSincronizar;nvSincronizar=async function(){try{if(nvL().prov==='google'&&!PROV.google._ids){const c=nvGidsCache();if(c)PROV.google._ids=c}}catch(_){}return _ns.apply(this,arguments)}}
/* entrada: 1 pedido pequeno diz se outro dispositivo mudou alguma coisa; se não mudou, a app abre logo */
async function nvNadaNovo(){const P=window.__nvPre;window.__nvPre=null;if(P&&Date.now()-P.t<20000)return await P.p;return await nvNadaNovo0()}
async function nvNadaNovo0(){try{const L=nvL();if(L.prov!=='google'||!L.base||!L.manVer||L.rekey||!(L.k||_nvK))return false;
  const G=PROV.google;if(!G._ids){const c=nvGidsCache();if(c)G._ids=c}const m=G._ids&&G._ids[NV_PREF+'manifest.json'];if(!m)return false;
  const r=await gsFetch('https://www.googleapis.com/drive/v3/files/'+m.id+'?fields=version');const j=await r.json().catch(()=>({}));return !!j.version&&String(j.version)===String(L.manVer)}catch(_){return false}}

/* depois da barra: fotografias e anexos em segundo plano, sem bloquear */
function nvFotosFundo(){setTimeout(async()=>{if(_nvBusy){nvFotosFundo();return}window.__nvFotos=1;try{await nvSincronizar(false)}catch(_){}finally{window.__nvFotos=0}},400)}
/* o pedido pequeno parte logo enquanto a app ainda está a abrir */
try{const s0=sessaoAtual();if(s0&&s0.tipo==='google'&&nvL().prov==='google')window.__nvPre={t:Date.now(),p:nvNadaNovo0()}}catch(_){}

/* 0.909 · Coord. PROFIJ › Matriz Curricular / Ponto de Situação e Planeamento Anual
   (o equivalente ao Excel do coordenador: horas → aulas de 45 min, dadas, diferença, previsão de conclusão,
    calendário dia a dia por disciplina e por professor, FPCT e horário da turma importado do PDF) */
const CPM_SIG={'mat':'Matemática Aplicada','ma':'Matemática Aplicada','port':'Língua Portuguesa','lp':'Língua Portuguesa','ing':'Língua Estrangeira - Inglês','le ing':'Língua Estrangeira - Inglês','fran':'Língua Estrangeira - Francês','fr':'Língua Estrangeira - Francês','ef':'Educação Física','cid m at':'Cidadania e Mundo Atual','cma':'Cidadania e Mundo Atual','cid':'Cidadania e Mundo Atual','tic':'Tecnologias de Informação e Comunicação','ae':'Atividades Económicas','hsst':'Higiene, Saúde e Segurança no Trabalho','psi':'Psicologia','psisoc':'Psicossociologia'};
const CPM_H0={'Cidadania e Mundo Atual':70,'Tecnologias de Informação e Comunicação':50,'Educação Física':75,'Língua Portuguesa':90,'Língua Estrangeira - Inglês':70,'Matemática Aplicada':100,'Atividades Económicas':50};
const cpmH0=n=>{const k=normT(n).replace(/\b(da|de|do)\b/g,'').replace(/\s+/g,' ');const e=Object.entries(CPM_H0).find(([x])=>normT(x).replace(/\b(da|de|do)\b/g,'').replace(/\s+/g,' ')===k);return e?e[1]:''};
const CPM_COMP=[['sociocultural','Componente de Formação Sociocultural'],['cientifica','Componente de Formação Científica'],['tecnologica','Componente de Formação Tecnológica'],['pratica','Componente de Formação Prática em Contexto de Trabalho']];
const cpmCompDe=n=>{const s=normT(n);return /^ufcd|unidades de formacao|tecnolog(?!ias d[ae] inf)|\b\d{4}\b/.test(s)?'tecnologica':/matemat|atividades econ|fisica e quim|biolog|psicolog|economia/.test(s)?'cientifica':/fct|formacao pratica|contexto de trabalho/.test(s)?'pratica':'sociocultural'};
const cpmAulas=h=>{h=+h||0;return h>0?Math.ceil(h/0.75-1e-9):0};
const cpmNomeSig=s=>CPM_SIG[normT(s).replace(/\./g,'').trim()]||String(s||'').replace(/\.$/,'').trim();
function cpmM(nome){const {y}=CP();y.mat=y.mat||{};const M=y.mat[nome]=y.mat[nome]||{curso:'',area:'',nivel:'II',cod:'',ref:'',anoCurso:'1.º',ini:'',fim:'',nasInt:false,disc:[],fct:{horas:'',ini:'',fim:'',hDia:7}};M.disc=M.disc||[];M.fct=M.fct||{horas:'',ini:'',fim:'',hDia:7};return M}
function cpmNomes(a,C){const {y}=CP();const L=C.map(c=>c.nome);Object.keys(y.mat||{}).forEach(n=>{if(!L.includes(n))L.push(n)});return L}
function cpmLimites(a,M){const c=CAL();const al=String((a&&a.nome)||anoLetivoDeHoje()).match(/(\d{4})/);const y1=al?+al[1]:new Date().getFullYear();
  const ini=M.ini||(c&&c.inicio)||y1+'-09-15';const fim=M.fim||(c&&termoTurma(null,c))||(y1+1)+'-06-30';return {ini,fim}}
/* tipo de cada dia para a turma: letivo, fds, feriado, interrupção, FPCT, fora do ano */
function cpmTipo(iso,M,L,c){const d=dataDeIso(iso),w=d.getDay();if(iso<L.ini||iso>L.fim)return 'fora';
  const f=M.fct||{};if(f.ini&&f.fim&&iso>=f.ini&&iso<=f.fim)return w===0||w===6?'fds':'fct';
  if(w===0||w===6)return 'fds';if(!c)return 'let';const tp=c.dias[iso];
  if(/^feriado/.test(tp||''))return 'fer';if(tp==='interrupcao')return M.nasInt?'let':'int';
  if(!tp)return M.nasInt?'let':'nl';return LETIVOS.includes(tp)?'let':'nl'}
/* aulas (tempos de 45 min) de cada disciplina no horário da turma */
function cpmAulasHor(a,nome,d){const h=horarioDe(a,nome);if(!h||!d.sig||!d.sig.length)return [];const S_=d.sig.map(normSig);return h.aulas.filter(x=>S_.includes(normSig(x.ab)))}
/* opt: {ref:'AAAA-MM-DD' (dia a partir do qual tudo é futuro), dadas:{discId:n} (valores de um ponto de situação), semPontos:true}
   sem opt: usa o último ponto de situação até hoje e soma as aulas do horário desde esse dia (estimativa) */
function cpmCalc(a,nome,opt){opt=opt||{};const M=cpmM(nome),L=cpmLimites(a,M),c=CAL();const real=isoHoje();const hj=opt.ref||real,agora=new Date(),mins=agora.getHours()*60+agora.getMinutes();
  const P0=!opt.ref&&!opt.semPontos?(M.pontos||[]).filter(p=>p.data<=real).sort((x,y)=>x.data.localeCompare(y.data)).pop()||null:null;
  const dias=[];for(let d=dataDeIso(L.ini);isoData(d)<=L.fim;d.setDate(d.getDate()+1)){const iso=isoData(d);dias.push({iso,w:d.getDay(),t:cpmTipo(iso,M,L,c)})}
  const R=M.disc.map(d=>{const H=cpmAulasHor(a,nome,d);const sem=[0,0,0,0,0,0,0];H.forEach(x=>sem[x.dia]++);const aulas=cpmAulas(d.horas);
    let auto=0,autoP=0,fut=0,fimPrev='',acum=0,tot=0;const porDia={};
    dias.forEach(z=>{if(z.t!=='let')return;let n=sem[z.w];if(!n)return;tot+=n;
      if(z.iso<hj){auto+=n;if(P0&&z.iso<=P0.data)autoP+=n}else if(z.iso===hj&&!opt.ref){const k=H.filter(x=>x.dia===z.w&&x.fim<=mins).length;auto+=k;fut+=n-k}else fut+=n;porDia[z.iso]=n});
    const ov=opt.dadas&&opt.dadas[d.id]!=null&&opt.dadas[d.id]!==''?+opt.dadas[d.id]:null;const pv=P0&&P0.dadas&&P0.dadas[d.id]!=null&&P0.dadas[d.id]!==''?+P0.dadas[d.id]:null;
    let fonte='horario',dadas;
    if(ov!=null){dadas=ov;fonte='ponto'}else if(d.dadas!=null&&d.dadas!==''&&!opt.ref){dadas=+d.dadas;fonte='manual'}else if(pv!=null){dadas=Math.max(0,pv+(auto-autoP));fonte=auto>autoP?'estimativa':'ponto'}else dadas=Math.max(0,auto+(opt.ref?0:(+d.aj||0)));
    acum=dadas;Object.keys(porDia).sort().forEach(iso=>{if(iso<hj||fimPrev)return;acum+=porDia[iso];if(!fimPrev&&acum>=aulas&&aulas)fimPrev=iso});
    if(aulas&&dadas>=aulas)fimPrev='feito';
    const falta=Math.max(0,aulas-dadas),saldo=dadas+fut-aulas,semT=sem.reduce((s,v)=>s+v,0);
    const est=!aulas?'sem':dadas>=aulas?'ok':saldo<0?'bad':saldo<semT?'w':'curso';
    return {d,H,sem,semT,aulas,dadas,auto,autoP,prev:auto,tot,fut,falta,saldo,fimPrev,porDia,porDiaT:porDia,est,fonte,ov,pv}});cpmSeq(R,hj,P0);
  const f=M.fct||{};let fctH=0;if(f.ini&&f.fim){for(let d=dataDeIso(f.ini);isoData(d)<=f.fim;d.setDate(d.getDate()+1)){const iso=isoData(d),w=d.getDay();if(w===0||w===6)continue;if(c&&/^feriado/.test(c.dias[iso]||''))continue;fctH+=+f.hDia||7}}
  return {M,L,dias,R,fctH,c,P0,ref:hj}}
/* UFCD que partilham os mesmos tempos do horário (ex.: «UFCD») dão-se umas a seguir às outras, pela ordem da matriz */
function cpmSeq(R,hj,P0){const G={};R.forEach(r=>{if(r.d.comp!=='tecnologica'||!r.d.sig||!r.d.sig.length)return;const k=r.d.sig.map(normSig).sort().join('|');(G[k]=G[k]||[]).push(r)});
  Object.values(G).filter(g=>g.length>1).forEach(g=>{const desde=g[0].auto-g[0].autoP;
    const temOv=g.some(r=>r.ov!=null),temPv=g.some(r=>r.pv!=null);
    const A_=temOv?g.reduce((s,r)=>s+(r.ov||0),0):temPv?g.reduce((s,r)=>s+(r.pv||0),0)+desde:Math.max(0,g[0].auto+g.reduce((s,r)=>s+(+r.d.aj||0),0));
    const dias=Object.keys(g[0].porDiaT).filter(i=>i>=hj).sort();let antes=0;
    g.forEach(r=>{const man=r.ov==null&&!temPv&&r.d.dadas!=null&&r.d.dadas!=='';const dd=r.ov!=null?r.ov:man?+r.d.dadas:Math.max(0,Math.min(r.aulas,A_-antes));r.dadas=dd;r.falta=Math.max(0,r.aulas-dd);
      const a0=antes,a1=antes+r.aulas;let ac=A_,ini=A_>a0?'feito':'',fim=A_>=a1?'feito':'';const pd={};
      for(const iso of dias){if(fim&&fim!=='feito'&&iso>fim)break;const n=g[0].porDiaT[iso];const ant=ac;ac+=n;if(!ini&&ac>a0)ini=iso;if(!fim&&ac>=a1)fim=iso;if(ini&&ac>a0&&ant<a1&&!(fim==='feito'))pd[iso]=Math.min(ac,a1)-Math.max(ant,a0)}
      r.porDia=pd;r.fimPrev=r.aulas?fim:'';r.iniPrev=ini;r.saldo=(A_+g[0].fut)-a1;r.seq=g.length;r.est=!r.aulas?'sem':dd>=r.aulas?'ok':r.saldo<0?'bad':r.saldo<r.semT?'w':'curso';antes=a1})})}
/* ---------- Planeamento inicial e Pontos de Situação ---------- */
function cpmPlanoIni(a,nome){const M=cpmM(nome),L=cpmLimites(a,M);const K=cpmCalc(a,nome,{ref:L.ini,dadas:{}});return K.R.map(r=>({id:r.d.id,nome:r.d.nome,aulas:r.aulas,tot:r.tot,fim:r.fimPrev,saldo:r.saldo,seq:r.seq,ini:r.iniPrev}))}
function cpmPontosHTML(a,nome){const M=cpmM(nome);const P=(M.pontos||[]).slice().sort((x,y)=>y.data.localeCompare(x.data));const PI=M.plano&&M.plano.R?M.plano.R:cpmPlanoIni(a,nome);
  const fx=M.plano&&M.plano.em;const L=cpmLimites(a,M);
  const pi=`<section class="card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('flag',18)} Planeamento Inicial</h2><span class="mut">${fx?'fixado em '+fmtIsoL(fx):'calculado do horário e do calendário'} · ${fmtIsoL(L.ini)} a ${fmtIsoL(L.fim)}</span><span class="sp1"></span><button class="btn sm noprint" id="cpm-fix">${ic(fx?'refresh':'check',14)} ${fx?'Voltar a Calcular':'Fixar Planeamento'}</button></div>
    <div class="cpm-tw"><table class="lst cpm-t"><thead><tr><th>Disciplina / UFCD</th><th class="n">Aulas a dar</th><th class="n">Aulas no horário até ao fim</th><th class="n">Saldo</th><th>Última aula prevista</th></tr></thead><tbody>${PI.map(x=>`<tr class="${x.saldo<0?'bad':''}"><td><b>${esc(x.nome)}</b>${x.seq&&x.ini&&x.ini!=='feito'?`<div class="hint">começa ${fmtIsoL(x.ini)}</div>`:''}</td><td class="n">${x.aulas||'—'}</td><td class="n">${x.seq?'—':x.tot}</td><td class="n ${x.saldo<0?'neg':'pos'}">${x.aulas?(x.saldo>0?'+':'')+x.saldo:'—'}</td><td>${x.fim?cpmFD(x.fim):x.aulas?'<span class="neg">não chega ao fim</span>':'—'}</td></tr>`).join('')}</tbody></table></div>
    <p class="hint">${fx?'O planeamento ficou fixado: serve de comparação para os pontos de situação, mesmo que o horário mude.':'Fixe o planeamento no início do ano para comparar depois com o que foi realmente dado.'}</p></section>`;
  const lst=`<section class="card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('clipboard',18)} Pontos de Situação</h2><span class="sp1"></span><button class="btn pri sm noprint" id="cpm-pnovo">${ic('plus',14)} Novo Ponto de Situação</button></div>
    ${P.length?`<div class="cpm-pl">${P.map(p=>{const K=cpmCalc(a,nome,{ref:cpmDiaSeg(p.data),dadas:p.dadas||{}});const atr=K.R.filter(r=>r.aulas&&r.dadas-r.prev<0).length,bad=K.R.filter(r=>r.est==='bad').length;
      return `<button type="button" class="cpm-pi ${bad?'bad':''}" data-cpmp="${p.id}"><b>${fmtIsoL(p.data)}</b><small>${Object.keys(p.dadas||{}).length} disciplina(s)${atr?' · '+atr+' atrasada(s)':''}${bad?' · '+bad+' sem tempo':''}</small></button>`}).join('')}</div>`:`<p class="mut" style="margin:8px 0 0">Ainda não há pontos de situação. Toque em «Novo Ponto de Situação», escreva as aulas dadas de cada disciplina nesse dia e a app calcula o que falta até ao fim.</p>`}</section>`;
  return pi+lst}
const cpmDiaSeg=iso=>{const d=dataDeIso(iso);d.setDate(d.getDate()+1);return isoData(d)};
function cpmPontoDlg(nome,p){const a=A(),M=cpmM(nome);M.pontos=M.pontos||[];const novo=!p;p=p||{id:uid(),data:isoHoje(),dadas:{},obs:''};
  const linhas=dt=>{const K=cpmCalc(a,nome,{ref:cpmDiaSeg(dt||p.data),dadas:{}});return K.R.map(r=>`<tr><td><b>${esc(r.d.nome)}</b></td><td class="n mut">${r.aulas||'—'}</td><td class="n mut" title="Aulas que o horário previa até este dia">${r.prev}</td><td class="n"><input type="number" min="0" step="1" inputmode="numeric" data-ppd="${r.d.id}" value="${p.dadas[r.d.id]!=null?esc(p.dadas[r.d.id]):''}" placeholder="${r.prev}" style="width:76px;text-align:right"></td></tr>`).join('')};
  openDrawer(novo?'Novo Ponto de Situação':'Ponto de Situação',`<div class="ed"><p class="hint" style="margin-top:0">Escreva as aulas (tempos de 45 min) <b>realmente dadas</b> até ao dia escolhido. Em branco fica o que o horário previa.</p>
    <label>Data</label><input type="date" id="pp-d" value="${esc(p.data)}">
    <div class="cpm-tw"><table class="lst cpm-t"><thead><tr><th>Disciplina / UFCD</th><th class="n">Aulas</th><th class="n">Previstas</th><th class="n">Dadas</th></tr></thead><tbody id="pp-l">${linhas(p.data)}</tbody></table></div>
    <label>Observações</label><textarea id="pp-o" rows="2">${esc(p.obs||'')}</textarea>
    <div class="row" style="margin-top:14px">${novo?'':`<button class="btn bad" id="pp-x">${ic('trash',14)} Apagar</button>`}<span class="sp1"></span><button class="btn" id="pp-0">Cancelar</button><button class="btn pri" id="pp-ok">${ic('check',14)} Guardar e Calcular</button></div></div>`);
  const ler=()=>{$$('[data-ppd]').forEach(i=>{if(i.value==='')delete p.dadas[i.dataset.ppd];else p.dadas[i.dataset.ppd]=+i.value})};
  $('#pp-d').onchange=()=>{ler();$('#pp-l').innerHTML=linhas($('#pp-d').value)};$('#pp-0').onclick=closeDrawer;
  const x=$('#pp-x');if(x)x.onclick=()=>{if(!confirm('Apagar o ponto de situação de '+fmtIsoL(p.data)+'?'))return;M.pontos=M.pontos.filter(z=>z.id!==p.id);save();closeDrawer();vCProfij()};
  $('#pp-ok').onclick=()=>{ler();const K=cpmCalc(a,nome,{ref:cpmDiaSeg($('#pp-d').value||p.data),dadas:{}});K.R.forEach(r=>{if(p.dadas[r.d.id]==null)p.dadas[r.d.id]=r.prev});
    p.data=$('#pp-d').value||isoHoje();p.obs=$('#pp-o').value.trim();if(novo)M.pontos.push(p);save();audit('Coord. PROFIJ','Ponto de situação · '+nome,fmtIsoL(p.data));closeDrawer();UI.cpmP=p.id;vCProfij()}}
/* relatório de um ponto de situação (como a folha LOG: horas, aulas, dadas, diferença, professor — e a previsão até ao fim) */
function cpmPontoVer(nome,p){const a=A(),M=cpmM(nome);const K=cpmCalc(a,nome,{ref:cpmDiaSeg(p.data),dadas:p.dadas||{}});const PI=M.plano&&M.plano.R?M.plano.R:null;
  const el=document.createElement('div');el.className='cpm-pv';
  const comp=CPM_COMP.filter(([k])=>k!=='pratica').map(([k,l])=>{const L=K.R.filter(r=>r.d.comp===k);if(!L.length)return '';const f=L.reduce((s,r)=>s+r.falta,0);
    return `<tr class="cpm-comp"><th colspan="9">${l}</th></tr>${L.map(r=>{const dv=r.dadas-r.prev;const pi=PI&&PI.find(x=>x.id===r.d.id);return `<tr class="${r.est==='bad'?'bad':r.est==='w'?'w':''}"><td><b>${esc(r.d.nome)}</b></td><td class="n">${r.d.horas||'—'}</td><td class="n">${r.aulas||'—'}</td><td class="n mut">${r.prev}</td><td class="n"><b>${r.dadas}</b></td><td class="n ${dv<0?'neg':dv>0?'pos':'mut'}">${dv>0?'+':''}${dv}</td><td class="n">${r.falta}</td><td>${r.fimPrev?cpmFD(r.fimPrev):r.aulas?`<span class="neg">faltam ${-r.saldo} no fim</span>`:'—'}${pi&&pi.fim&&r.fimPrev&&r.fimPrev!=='feito'&&pi.fim!=='feito'&&pi.fim!==r.fimPrev?`<div class="hint">planeado: ${fmtIsoL(pi.fim)}</div>`:''}</td><td>${esc(r.d.prof||'—')}</td></tr>`}).join('')}<tr class="cpm-tot"><td>Total da componente em falta</td><td colspan="5"></td><td class="n"><b>${f}</b></td><td colspan="2"></td></tr>`}).join('');
  el.innerHTML=`<section class="card cpm-cab"><div class="cpm-tit">${esc(M.curso||'Curso PROFIJ — '+nome)}</div><div class="mut cpm-meta">${[M.area&&'Área: '+esc(M.area),M.nivel&&'Nível '+esc(M.nivel),M.anoCurso&&'Ano: '+esc(M.anoCurso)].filter(Boolean).join(' · ')}</div>
    <div class="cpm-ps"><b>Ponto de Situação — ${p.data.split('-').reverse().join('.')}</b> <span class="mut">· ${esc(nome)}</span></div>${p.obs?`<p style="margin:6px 0 0">${esc(p.obs)}</p>`:''}</section>
    <section class="card"><div class="cpm-tw"><table class="lst cpm-t"><thead><tr><th>Disciplina / UFCD</th><th class="n">Horas</th><th class="n">Aulas</th><th class="n">Previstas até à data</th><th class="n">Dadas</th><th class="n">Desvio</th><th class="n">Faltam</th><th>Previsão até ao fim</th><th>Professor(a)</th></tr></thead><tbody>${comp}</tbody></table></div>
    <p class="hint">«Previstas até à data» = aulas que o horário e o calendário previam até ${fmtIsoL(p.data)}. A previsão até ao fim junta às aulas dadas as que o horário ainda tem até ${fmtIsoL(K.L.fim)}.</p></section>
    <div class="cpm-ass"><span>${esc(S.cfg.escola||'')}</span><div><div class="cpm-lin"></div>O Coordenador do PROFIJ<br><small>${esc(S.cfg.professor||'')}</small></div></div>`;
  const ed=document.createElement('button');ed.className='btn sm';ed.type='button';ed.innerHTML=ic('pencil',14)+' Editar';ed.onclick=()=>{ecraAmplo.fechar&&ecraAmplo.fechar();cpmPontoDlg(nome,p)};
  const pr=document.createElement('button');pr.className='btn sm';pr.type='button';pr.innerHTML=ic('printer',14)+' Imprimir';pr.onclick=()=>{document.body.classList.add('amp-print');setTimeout(()=>{try{window.print()}catch(_){}document.body.classList.remove('amp-print')},50)};
  ecraAmplo({titulo:'Ponto de Situação',sub:nome+' · '+fmtIsoL(p.data),el,acoes:[ed,pr],aoFechar:()=>{UI.cpmP=null}})}
function cpmBindPontos(v,a){const nome=UI.cpmT;const M=cpmM(nome);
  const fx=v.querySelector('#cpm-fix');if(fx)fx.onclick=()=>{if(M.plano&&M.plano.em){if(!confirm('Voltar a calcular o planeamento inicial a partir do horário e do calendário atuais?'))return;delete M.plano}else M.plano={em:isoHoje(),R:cpmPlanoIni(a,nome)};save();vCProfij()};
  const nv=v.querySelector('#cpm-pnovo');if(nv)nv.onclick=()=>cpmPontoDlg(nome);
  v.querySelectorAll('[data-cpmp]').forEach(b=>b.onclick=()=>{const p=(M.pontos||[]).find(z=>z.id===b.dataset.cpmp);if(p)cpmPontoVer(nome,p)});
  if(UI.cpmP){const p=(M.pontos||[]).find(z=>z.id===UI.cpmP);UI.cpmP=null;if(p)setTimeout(()=>cpmPontoVer(nome,p),0)}}
const cpmFD=iso=>iso==='feito'?'concluída':iso?fmtIsoL(iso):'—';
const CPM_E={ok:['Concluída','ok'],curso:['Dentro do previsto',''],w:['Margem curta','w'],bad:['Não chega ao fim do ano','bad'],sem:['Sem horas','']};
function cpmMatrizHTML(a,C){const N=cpmNomes(a,C);if(!N.length)return `<section class="card empty">${ic('grid',28)}<br><b>Ainda não há turmas PROFIJ</b><br><span class="mut">Crie a matriz de uma turma (por exemplo, a partir do horário da turma em PDF).</span><br><br><button class="btn pri" id="cpm-nova">${ic('plus',14)} Nova Matriz</button> <button class="btn" id="cpm-pdf">${ic('upload',14)} Importar Horário da Turma (PDF ou Excel)</button></section>`;
  const nome=UI.cpmT&&N.includes(UI.cpmT)?UI.cpmT:N[0];UI.cpmT=nome;const K=cpmCalc(a,nome),M=K.M;const h=horarioDe(a,nome);
  const tot=K.R.reduce((s,r)=>({a:s.a+r.aulas,d:s.d+Math.min(r.dadas,r.aulas||r.dadas),f:s.f+r.falta,b:s.b+(r.est==='bad'?1:0)}),{a:0,d:0,f:0,b:0});const pc=tot.a?Math.round(tot.d/tot.a*100):0;
  const sel=`<div class="row cpm-sel noprint" style="gap:8px;flex-wrap:wrap">${N.map(n=>`<button type="button" class="chip ${n===nome?'on':''}" data-cpmt="${esc(n)}">${esc(n)}</button>`).join('')}<button type="button" class="chip" id="cpm-nova">${ic('plus',13)} Nova</button></div>`;
  const cab=`<section class="card cpm-cab"><div><div><div class="cpm-tit">${esc(M.curso||'Curso PROFIJ — '+nome)}</div>
    <div class="mut cpm-meta">${[M.area&&'Área de Educação e Formação: '+esc(M.area),M.nivel&&'Nível de Qualificação do QNQ: '+esc(M.nivel),M.cod&&'Cód. interno: '+esc(M.cod),M.anoCurso&&'Ano: '+esc(M.anoCurso),M.ref&&'Referencial: '+esc(M.ref)].filter(Boolean).join(' · ')||'Toque em «Dados do Curso» para preencher o cabeçalho.'}</div>
    <div class="cpm-ps"><b>Situação atual — ${isoHoje().split('-').reverse().join('.')}</b>${K.P0?` <span class="tag ok">desde o ponto de ${fmtIsoL(K.P0.data)}</span>`:''} <span class="mut">· ${esc(nome)} · ${fmtIsoL(K.L.ini)} a ${fmtIsoL(K.L.fim)}${M.nasInt?' · com sessões nas interrupções':''}</span></div></div>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap;margin-top:10px"><button class="btn sm" id="cpm-curso">${ic('pencil',14)} Dados do Curso</button><button class="btn sm" id="cpm-pdf">${ic('upload',14)} Horário da Turma (PDF ou Excel)</button>${h?`<button class="btn sm" id="cpm-ger">${ic('flow',14)} Gerar do Horário</button>`:''}<button class="btn sm" id="cpm-add">${ic('plus',14)} Disciplina / UFCD</button><button class="btn sm" id="cpm-csv">${ic('download',14)} CSV</button><button class="btn sm pri" id="cpm-imp">${ic('printer',14)} Imprimir</button></div></div>
    ${!K.c?`<div class="alert w noprint" style="margin-top:10px">${ic('alert',15)} Sem calendário escolar: só os fins de semana são descontados. Importe o calendário (Calendário › Importar) para descontar feriados e interrupções letivas.</div>`:''}
    ${!h?`<div class="alert noprint" style="margin-top:10px">${ic('calendar',15)} Importe o horário da turma (PDF «Horário da Turma») para a app contar sozinha as aulas dadas e prever quando termina cada disciplina.</div>`:''}
    <div class="cpm-kp"><div><small>Aulas previstas</small><b>${tot.a}</b></div><div><small>Dadas</small><b>${tot.d}</b><i class="cpm-bar"><i style="width:${pc}%"></i></i></div><div><small>Em falta</small><b>${tot.f}</b></div><div class="${tot.b?'bad':''}"><small>Não chegam ao fim</small><b>${tot.b}</b></div></div></section>`;
  const linha=r=>{const e=CPM_E[r.est];const p=r.aulas?Math.min(100,Math.round(r.dadas/r.aulas*100)):0;
    return `<tr class="cpm-r ${e[1]}"><td><b>${esc(r.d.nome)}</b>${r.d.det?`<div class="hint">${esc(r.d.det)}</div>`:''}${r.d.sig&&r.d.sig.length?`<div class="hint noprint">horário: ${esc(r.d.sig.join(', '))}</div>`:''}</td><td class="n">${r.d.horas||'—'}</td><td class="n">${r.aulas||'—'}</td>
      <td class="n"><b>${r.dadas}</b>${r.fonte==='manual'?' <span class="tag" title="escrito à mão">manual</span>':r.fonte==='ponto'?' <span class="tag ok" title="do ponto de situação">ponto</span>':r.fonte==='estimativa'?' <span class="tag" title="ponto de situação + aulas do horário desde então">estim.</span>':r.d.aj?` <span class="mut" title="ajuste">(${r.d.aj>0?'+':''}${r.d.aj})</span>`:''}<i class="cpm-bar"><i style="width:${p}%"></i></i></td>
      <td class="n ${r.falta?'':'mut'}">${r.falta}</td><td class="n">${r.semT||'—'}</td><td>${r.fimPrev?cpmFD(r.fimPrev):r.aulas?`<span class="neg">faltam ${-r.saldo} no fim</span>`:'—'}${r.seq&&r.iniPrev&&r.iniPrev!=='feito'?`<div class="hint">começa ${fmtIsoL(r.iniPrev)} (em sequência)</div>`:''}${r.fimPrev&&r.fimPrev!=='feito'&&r.saldo>0&&!r.seq?`<div class="hint">sobram ${r.saldo} tempo(s)</div>`:''}</td>
      <td>${esc(r.d.prof||'—')}</td><td><span class="tag ${e[1]}">${e[0]}</span></td><td class="act noprint">${r.d.comp==='tecnologica'?`<button class="btn sm ghost" data-cpmu="${r.d.id}" title="Dividir em UFCD (dadas em sequência)">${ic('list',14)}</button>`:''}<button class="btn sm ghost" data-cpmd="${r.d.id}" title="Editar">${ic('pencil',14)}</button></td></tr>`};
  const comp=CPM_COMP.filter(([k])=>k!=='pratica').map(([k,l])=>{const L=K.R.filter(r=>r.d.comp===k);if(!L.length)return '';const f=L.reduce((s,r)=>s+r.falta,0),au=L.reduce((s,r)=>s+r.aulas,0),dd=L.reduce((s,r)=>s+r.dadas,0),hh=L.reduce((s,r)=>s+(+r.d.horas||0),0);
    return `<tr class="cpm-comp"><th colspan="10">${l}</th></tr>${L.map(linha).join('')}<tr class="cpm-tot"><td>Total da componente${f?' em falta':''}</td><td class="n">${hh}</td><td class="n">${au}</td><td class="n">${dd}</td><td class="n"><b>${f}</b></td><td colspan="5"></td></tr>`}).join('');
  const tab=K.R.length?`<section class="card"><h2 style="margin:0 0 8px">${ic('grid',18)} Matriz Curricular</h2><div class="cpm-tw"><table class="lst cpm-t"><thead><tr><th>Disciplina / UFCD</th><th class="n">Horas</th><th class="n">Aulas</th><th class="n">Dadas</th><th class="n">Diferença</th><th class="n">Tempos / semana</th><th>Previsão de conclusão</th><th>Professor(a)</th><th>Situação</th><th class="noprint"></th></tr></thead><tbody>${comp}</tbody></table></div>
    <p class="hint">Aulas = horas ÷ 0,75 (tempos de 45 minutos), arredondado para cima. As dadas contam-se pelo horário da turma e pelo calendário escolar até agora; acerte com «Ajuste» (aulas repostas ou não dadas) ou escreva o total à mão.</p></section>`:`<section class="card empty">${ic('grid',26)}<br><b>Matriz vazia</b><br><span class="mut">${h?'Toque em «Gerar do Horário» para criar as disciplinas a partir do horário da turma.':'Importe o horário da turma em PDF ou acrescente as disciplinas e UFCD à mão.'}</span></section>`;
  /* por professor (as folhas por professor do Excel) */
  const P={};K.R.forEach(r=>{const k=(r.d.prof||'Sem professor').trim();(P[k]=P[k]||[]).push(r)});
  const prof=K.R.length?`<section class="card"><h2 style="margin:0 0 8px">${ic('users',18)} Por Professor(a)</h2><div class="cpm-pg">${Object.entries(P).sort((x,y)=>x[0].localeCompare(y[0],'pt')).map(([p,L])=>{const au=L.reduce((s,r)=>s+r.aulas,0),dd=L.reduce((s,r)=>s+Math.min(r.dadas,r.aulas||r.dadas),0),f=L.reduce((s,r)=>s+r.falta,0),b=L.some(r=>r.est==='bad');
    return `<div class="cpm-pc ${b?'bad':''}"><b>${esc(p)}</b><small>${L.map(r=>esc(r.d.nome)).join(' · ')}</small><div class="row" style="gap:10px"><span>${dd}/${au} dadas</span><span class="${f?'':'mut'}">faltam ${f}</span>${b?`<span class="tag bad">risco</span>`:''}</div><i class="cpm-bar"><i style="width:${au?Math.round(dd/au*100):0}%"></i></i></div>`}).join('')}</div></section>`:'';
  const f=M.fct||{};const fh=+f.horas||0;
  const fct=`<section class="card"><div class="row"><h2 style="margin:0">${ic('building',18)} Formação Prática em Contexto de Trabalho</h2><span class="sp1"></span><button class="btn sm noprint" id="cpm-fct">${ic('pencil',14)} Período</button></div>
    ${f.ini&&f.fim?`<p style="margin:8px 0 0">${fmtIsoL(f.ini)} a ${fmtIsoL(f.fim)} · ${+f.hDia||7} h/dia → <b>${K.fctH} h possíveis</b>${fh?` de ${fh} h exigidas · <span class="${K.fctH>=fh?'pos':'neg'}">${K.fctH>=fh?'chega (sobram '+(K.fctH-fh)+' h)':'faltam '+(fh-K.fctH)+' h — alargue o período'}</span>`:''}</p><p class="hint">Durante a FPCT não há aulas: os dias deste período não contam para as disciplinas. Os feriados são descontados das horas da FPCT.</p>`:`<p class="mut" style="margin:8px 0 0">Indique o período e as horas da FPCT (ex.: 100 h no 1.º ano) para a app descontar esses dias das aulas e verificar se as horas chegam.</p>`}</section>`;
  const ass=`<div class="cpm-ass"><span>${esc((S.cfg.escola||'')+'')}</span><div><div class="cpm-lin"></div>O Coordenador do PROFIJ<br><small>${esc(S.cfg.professor||'')}</small></div></div>`;
  return sel+cab+tab+cpmPontosHTML(a,nome)+prof+fct+ass}
function cpmDiscDlg(nome,d){const M=cpmM(nome);const novo=!d;d=d||{id:uid(),nome:'',comp:'sociocultural',horas:'',prof:'',sig:[],aj:0,dadas:null,det:''};const a=A();const h=horarioDe(a,nome);
  const sigs=h?[...new Set(h.aulas.map(x=>x.ab))].sort():[];
  openDrawer(novo?'Nova Disciplina / UFCD':'Editar Disciplina',`<div class="ed"><label>Nome</label><input id="dm-n" value="${esc(d.nome)}" placeholder="ex.: Matemática Aplicada · UFCD A">
    <label>Componente</label><select id="dm-c">${CPM_COMP.filter(([k])=>k!=='pratica').map(([k,l])=>`<option value="${k}" ${d.comp===k?'selected':''}>${l.replace('Componente de Formação ','')}</option>`).join('')}</select>
    <div class="row" style="gap:10px"><div style="flex:1"><label>Horas (este ano)</label><input id="dm-h" type="number" min="0" step="1" inputmode="numeric" value="${esc(d.horas)}"></div><div style="flex:1"><label>Aulas de 45 min</label><input id="dm-a" disabled value="${cpmAulas(d.horas)||''}"></div></div>
    <label>UFCD incluídas (opcional)</label><input id="dm-u" value="${esc(d.det||'')}" placeholder="ex.: 0349 · 1122 · 0778">
    <label>Professor(a)</label><input id="dm-p" value="${esc(d.prof)}">
    <label>Siglas no horário da turma</label>${sigs.length?`<div class="row" style="gap:6px;flex-wrap:wrap">${sigs.map(s=>`<label class="chk"><input type="checkbox" data-dms="${esc(s)}" ${(d.sig||[]).map(normSig).includes(normSig(s))?'checked':''}> ${esc(s)}</label>`).join('')}</div>`:`<input id="dm-s" value="${esc((d.sig||[]).join(', '))}" placeholder="ex.: MAT"><div class="hint">Importe o horário da turma para escolher da lista.</div>`}
    <div class="row" style="gap:10px"><div style="flex:1"><label>Ajuste às dadas</label><input id="dm-j" type="number" step="1" inputmode="numeric" value="${+d.aj||0}"><div class="hint">+ repostas · − não dadas (greves, visitas…)</div></div><div style="flex:1"><label>Dadas (escrever à mão)</label><input id="dm-d" type="number" min="0" step="1" inputmode="numeric" value="${d.dadas!=null?esc(d.dadas):''}" placeholder="automático"></div></div>
    <div class="row" style="margin-top:14px">${novo?'':`<button class="btn bad" id="dm-x">${ic('trash',14)} Apagar</button>`}<span class="sp1"></span><button class="btn" id="dm-c0">Cancelar</button><button class="btn pri" id="dm-ok">${ic('check',14)} Guardar</button></div></div>`);
  const H=$('#dm-h');H.oninput=()=>{$('#dm-a').value=cpmAulas(H.value)||''};
  $('#dm-n').onchange=()=>{const v=$('#dm-n').value;if(novo){$('#dm-c').value=cpmCompDe(v);if(!H.value&&CPM_H0[v]){H.value=CPM_H0[v];H.oninput()}}};
  $('#dm-c0').onclick=closeDrawer;const x=$('#dm-x');if(x)x.onclick=()=>{if(!confirm('Apagar «'+d.nome+'» da matriz?'))return;M.disc=M.disc.filter(z=>z.id!==d.id);save();closeDrawer();vCProfij()};
  $('#dm-ok').onclick=()=>{const n=$('#dm-n').value.trim();if(!n){toast('Escreva o nome.');return}
    d.nome=n;d.comp=$('#dm-c').value;d.horas=H.value===''?'':+H.value;d.det=$('#dm-u').value.trim();d.prof=$('#dm-p').value.trim();d.aj=+$('#dm-j').value||0;const dv=$('#dm-d').value;d.dadas=dv===''?null:+dv;
    d.sig=sigs.length?$$('[data-dms]').filter(i=>i.checked).map(i=>i.dataset.dms):($('#dm-s').value||'').split(/[,;]/).map(s=>s.trim()).filter(Boolean);
    if(novo)M.disc.push(d);save();audit('Coord. PROFIJ',(novo?'Disciplina acrescentada à matriz':'Matriz alterada')+' · '+nome,d.nome);closeDrawer();vCProfij()}}
function cpmCursoDlg(nome){const M=cpmM(nome);const a=A(),L=cpmLimites(a,{...M,ini:'',fim:''});
  const f=(id,l,v,ph,t)=>`<label>${l}</label><input id="${id}" ${t?`type="${t}"`:''} value="${esc(v||'')}" placeholder="${esc(ph||'')}">`;
  openDrawer('Dados do Curso · '+nome,`<div class="ed">${f('mc-c','Curso',M.curso,'ex.: Curso PROFIJ II - Operador/a de …')}${f('mc-a','Área de Educação e Formação',M.area,'ex.: 341 - Comércio')}
    <div class="row" style="gap:10px"><div style="flex:1">${f('mc-n','Nível de Qualificação do QNQ',M.nivel,'II')}</div><div style="flex:1">${f('mc-y','Ano do curso',M.anoCurso,'1.º')}</div></div>
    ${f('mc-k','Cód. interno',M.cod,'')}${f('mc-r','Referencial de Formação',M.ref,'')}
    <div class="row" style="gap:10px"><div style="flex:1">${f('mc-i','Início das aulas',M.ini,'','date')}<div class="hint">vazio = ${fmtIsoL(L.ini)}</div></div><div style="flex:1">${f('mc-f','Fim das aulas',M.fim,'','date')}<div class="hint">vazio = ${fmtIsoL(L.fim)}</div></div></div>
    <label class="chk" style="margin-top:10px"><input type="checkbox" id="mc-int" ${M.nasInt?'checked':''}> Há sessões de formação nas interrupções letivas</label>
    <div class="row" style="margin-top:14px">${UI.cpmT===nome&&!cpClasses(a).some(c=>c.nome===nome)?`<button class="btn bad" id="mc-x">${ic('trash',14)} Apagar Matriz</button>`:''}<span class="sp1"></span><button class="btn" id="mc-0">Cancelar</button><button class="btn pri" id="mc-ok">${ic('check',14)} Guardar</button></div></div>`);
  $('#mc-0').onclick=closeDrawer;const x=$('#mc-x');if(x)x.onclick=()=>{if(!confirm('Apagar a matriz de '+nome+'?'))return;delete CP().y.mat[nome];UI.cpmT='';save();closeDrawer();vCProfij()};
  $('#mc-ok').onclick=()=>{Object.assign(M,{curso:$('#mc-c').value.trim(),area:$('#mc-a').value.trim(),nivel:$('#mc-n').value.trim(),anoCurso:$('#mc-y').value.trim(),cod:$('#mc-k').value.trim(),ref:$('#mc-r').value.trim(),ini:$('#mc-i').value,fim:$('#mc-f').value,nasInt:$('#mc-int').checked});save();closeDrawer();vCProfij()}}
function cpmFctDlg(nome){const M=cpmM(nome),f=M.fct;openDrawer('FPCT · '+nome,`<div class="ed"><div class="row" style="gap:10px"><div style="flex:1"><label>Início</label><input type="date" id="mf-i" value="${esc(f.ini||'')}"></div><div style="flex:1"><label>Fim</label><input type="date" id="mf-f" value="${esc(f.fim||'')}"></div></div>
    <div class="row" style="gap:10px"><div style="flex:1"><label>Horas exigidas</label><input type="number" min="0" inputmode="numeric" id="mf-h" value="${esc(f.horas||'')}" placeholder="ex.: 100"></div><div style="flex:1"><label>Horas por dia</label><input type="number" min="1" max="10" inputmode="numeric" id="mf-d" value="${esc(f.hDia||7)}"></div></div>
    <div class="row" style="margin-top:14px"><span class="sp1"></span><button class="btn" id="mf-0">Cancelar</button><button class="btn pri" id="mf-ok">${ic('check',14)} Guardar</button></div></div>`);
  $('#mf-0').onclick=closeDrawer;$('#mf-ok').onclick=()=>{const i=$('#mf-i').value,fi=$('#mf-f').value;if(i&&fi&&fi<i){toast('O fim é antes do início.');return}Object.assign(f,{ini:i,fim:fi,horas:$('#mf-h').value===''?'':+$('#mf-h').value,hDia:+$('#mf-d').value||7});save();closeDrawer();vCProfij()}}
/* cria as disciplinas a partir da legenda do horário da turma */
function cpmGerar(a,nome,silencioso){const h=horarioDe(a,nome);if(!h)return 0;const M=cpmM(nome);let n=0;
  const sigs=[...new Set(h.aulas.map(x=>x.ab))];const leg=h.legenda||[];
  sigs.forEach(s=>{if(M.disc.some(d=>(d.sig||[]).map(normSig).includes(normSig(s))))return;const l=leg.find(x=>normSig(x.ab)===normSig(s))||{};const nm=/^unidades de forma/i.test(normT(l.nome||''))?'UFCD (Formação Tecnológica)':l.nome&&normSig(l.nome)!==normSig(s)?l.nome:cpmNomeSig(s);
    const ex=M.disc.find(d=>normT(d.nome)===normT(nm));if(ex){ex.sig=[...(ex.sig||[]),s];return}
    M.disc.push({id:uid(),nome:nm,comp:cpmCompDe(nm),horas:cpmH0(nm),prof:(l.profs||[]).join(', '),sig:[s],aj:0,dadas:null,det:''});n++});
  const ord={sociocultural:0,cientifica:1,tecnologica:2};M.disc.sort((x,y)=>(ord[x.comp]-ord[y.comp])||x.nome.localeCompare(y.nome,'pt',{numeric:true}));
  save();if(!silencioso)toast(n?n+' disciplina(s) criada(s). Confirme as horas de cada uma.':'A matriz já tem todas as disciplinas do horário.');return n}
/* horário da turma em PDF (ex.: «Horário da Turma: …», com legenda Atividade / Nome do Professor) */
async function cpmLerHorTurma(file){const r=await lerHorarioProfPdf(file);
  const lib=await getPdfLib();const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;const it=[];
  for(let p=1;p<=doc.numPages;p++){const pg=await doc.getPage(p);const tc=await pg.getTextContent();tc.items.filter(i=>i.str&&i.str.trim()).forEach(i=>it.push({s:i.str.replace(/\s+/g,' ').trim(),x:i.transform[4],y:i.transform[5]-p*2000,w:i.width||0}))}
  const txt=it.map(i=>i.s).join(' ');const tm=txt.match(/Hor[aá]rio da Turma:?\s*(.+?)(?=\s+Ano letivo|\s+Tempos|$)/i);const turma=tm?tm[1].trim():'';
  const at=it.find(i=>normT(i.s)==='atividade'),np=it.find(i=>/nome do professor/i.test(i.s));const leg=[];let diretor='';
  if(at&&np){const rows={};it.filter(i=>i.y<at.y-1).forEach(i=>{const k=Math.round(i.y/3);(rows[k]=rows[k]||[]).push(i)});
    Object.keys(rows).map(Number).sort((x,y)=>y-x).forEach(k=>{const R=rows[k].sort((p,q)=>p.x-q.x);const sg=R.filter(i=>i.x<np.x-4).map(i=>i.s).join(' ').trim(),pf=R.filter(i=>i.x>=np.x-4).map(i=>i.s).join(' ').trim();if(!sg||!pf)return;
      if(/^dir\.?\s*(de\s*)?turma|diretor/i.test(sg)){diretor=pf;return}const e=leg.find(l=>normSig(l.ab)===normSig(sg));if(e){if(!e.profs.includes(pf))e.profs.push(pf)}else leg.push({ab:sg,nome:cpmNomeSig(sg),profs:[pf]})})}
  const LS=leg.map(l=>normSig(l.ab));const aulas=[];
  [...r.aulas.map(x=>({...x,sig:(x.turma?x.turma+' ':'')+x.sig})),...r.naoLetivos].forEach(x=>{const s=String(x.sig||'').trim();if(!s||/atividade|professor/i.test(s))return;
    if(LS.length&&!LS.includes(normSig(s))){const m=LS.find(k=>normSig(s).startsWith(k));if(!m)return}
    if(!aulas.some(o=>o.dia===x.dia&&o.ini===x.ini))aulas.push({dia:x.dia,ini:x.ini,fim:x.fim,ab:s,sala:x.sala||''})});
  aulas.sort((p,q)=>p.dia-q.dia||p.ini-q.ini);if(!aulas.length)throw new Error('Não encontrei aulas na grelha do horário.');
  return {turma,aulas,legenda:leg,diretor,ficheiro:file.name}}
function cpmImportarPdf(alvo){const inp=document.createElement('input');inp.type='file';inp.accept='.pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';inp.multiple=true;
  inp.onchange=async()=>{const a=A();const ok=[];for(const f of inp.files){ocupado('A ler '+f.name+'…');try{if(/\.xlsx?$/i.test(f.name)){const hs=await lerHorarioXlsx(f);if(!hs.length||!hs[0].aulas.length)throw new Error('não encontrei um horário de turma');hs.forEach(h=>{h.ficheiro=f.name;ok.push(h)})}else{const h=await cpmLerHorTurma(f);ok.push(h)}}catch(e){toast(f.name+': '+e.message)}}livre();if(!ok.length)return;
    a.horarios=a.horarios||{};ok.forEach(h=>{let nm=h.turma||alvo||'Turma PROFIJ';if(alvo&&ok.length===1&&normTurma(nm)!==normTurma(alvo)&&confirm('O PDF é da turma «'+nm+'». Associar à matriz «'+alvo+'»?'))nm=alvo;
      const k=Object.keys(a.horarios).find(k=>normTurma(k)===normTurma(nm))||nm;a.horarios[k]={turma:nm,aulas:h.aulas,legenda:h.legenda,diretor:h.diretor,ficheiro:h.ficheiro,importado:new Date().toISOString()};
      const {y}=CP();y.mat=y.mat||{};const ex=Object.keys(y.mat).find(n=>normTurma(n)===normTurma(k));const mn=ex||k;cpmM(mn);const n=cpmGerar(a,mn,true);UI.cpmT=mn;
      toast('Horário de '+nm+': '+h.aulas.length+' tempos'+(n?' · '+n+' disciplina(s) criada(s) — confirme as horas':''))});
    regista('Horário da turma (PDF)',ok.map(h=>h.ficheiro).join(', '),ok.map(h=>h.turma).join(', '));saveNow();UI.cpTab='matriz';vCProfij()};inp.click()}
function cpmCSV(a,nome){const K=cpmCalc(a,nome);const q=v=>{v=v==null?'':String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const R=[['Componente','Disciplina/UFCD','UFCD incluídas','Horas','Aulas (45 min)','Dadas','Diferença','Tempos/semana','Previsão de conclusão','Professor(a)','Situação']];
  K.R.forEach(r=>R.push([(CPM_COMP.find(c=>c[0]===r.d.comp)||[,''])[1],r.d.nome,r.d.det||'',r.d.horas,r.aulas,r.dadas,r.falta,r.semT,r.fimPrev==='feito'?'concluída':r.fimPrev||('faltam '+(-r.saldo)),r.d.prof,CPM_E[r.est][0]]));
  download('ponto-situacao-'+normSig(nome)+'-'+isoHoje()+'.csv','﻿'+R.map(l=>l.map(q).join(';')).join('\n'),'text/csv')}
function cpmBindMatriz(v,a){const nome=UI.cpmT;const g=id=>v.querySelector('#'+id);
  v.querySelectorAll('[data-cpmt]').forEach(b=>b.onclick=()=>{UI.cpmT=b.dataset.cpmt;vCProfij()});
  const nv=g('cpm-nova');if(nv)nv.onclick=()=>{const n=(prompt('Nome da turma (como no horário, ex.: Profij 2):')||'').trim();if(!n)return;cpmM(n);UI.cpmT=n;save();vCProfij()};
  const pdf=g('cpm-pdf');if(pdf)pdf.onclick=()=>cpmImportarPdf(nome);
  const ge=g('cpm-ger');if(ge)ge.onclick=()=>{cpmGerar(a,nome);vCProfij()};
  const ad=g('cpm-add');if(ad)ad.onclick=()=>cpmDiscDlg(nome);
  const cu=g('cpm-curso');if(cu)cu.onclick=()=>cpmCursoDlg(nome);
  const fc=g('cpm-fct');if(fc)fc.onclick=()=>cpmFctDlg(nome);
  const cs=g('cpm-csv');if(cs)cs.onclick=()=>cpmCSV(a,nome);
  const im=g('cpm-imp');if(im)im.onclick=()=>imprimirVista();
  v.querySelectorAll('[data-cpmd]').forEach(b=>b.onclick=()=>cpmDiscDlg(nome,cpmM(nome).disc.find(d=>d.id===b.dataset.cpmd)));
  v.querySelectorAll('[data-cpmu]').forEach(b=>b.onclick=()=>cpmUfcdDlg(nome,cpmM(nome).disc.find(d=>d.id===b.dataset.cpmu)));cpmBindPontos(v,a)}
function cpmUfcdDlg(nome,d){const M=cpmM(nome);const irm=M.disc.filter(x=>x.comp==='tecnologica'&&(x.sig||[]).map(normSig).sort().join('|')===(d.sig||[]).map(normSig).sort().join('|'));
  const txt=irm.map(x=>[x.det||'',x.nome,x.horas||'',x.prof||''].join(' ; ')).join('\n');
  openDrawer('UFCD em Sequência',`<div class="ed"><p class="hint" style="margin-top:0">Uma linha por UFCD, pela ordem em que são dadas: <b>código ; nome ; horas ; professor(a)</b>. Todas usam os tempos «${esc((d.sig||[]).join(', ')||'—')}» do horário: a app dá-as umas a seguir às outras e prevê quando começa e acaba cada uma.</p>
    <textarea id="mu-t" rows="14" style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px" placeholder="0349 ; Ambiente, segurança, higiene e saúde no trabalho ; 25 ; …">${esc(txt)}</textarea>
    <div class="row" style="margin-top:14px"><span class="mut" id="mu-n"></span><span class="sp1"></span><button class="btn" id="mu-0">Cancelar</button><button class="btn pri" id="mu-ok">${ic('check',14)} Guardar</button></div></div>`);
  const T=$('#mu-t'),cont=()=>{const L=T.value.split('\n').map(l=>l.split(/\s*[;\t]\s*/)).filter(p=>p.join('').trim());const h=L.reduce((s,p)=>s+(+String(p[2]||'').replace(',','.')||0),0);$('#mu-n').textContent=L.length+' UFCD · '+h+' h · '+cpmAulas(h)+' aulas'};T.oninput=cont;cont();
  $('#mu-0').onclick=closeDrawer;$('#mu-ok').onclick=()=>{const L=T.value.split('\n').map(l=>l.split(/\s*[;\t]\s*/).map(x=>x.trim())).filter(p=>p.join(''));if(!L.length)return toast('Escreva pelo menos uma UFCD.','erro');
    const pos=M.disc.indexOf(irm[0]);const nov=L.map((p,k)=>{const ex=irm[k];return {id:ex?ex.id:uid(),nome:p[1]?(p[0]?p[0]+' - ':'')+p[1]:(p[0]||'UFCD '+(k+1)),det:p[0]||'',comp:'tecnologica',horas:+String(p[2]||'').replace(',','.')||'',prof:p[3]||d.prof||'',sig:(d.sig||[]).slice(),aj:ex?ex.aj||0:0,dadas:ex?ex.dadas:null}});
    M.disc=M.disc.filter(x=>!irm.includes(x));M.disc.splice(Math.max(0,pos),0,...nov);save();audit('Coord. PROFIJ','UFCD em sequência · '+nome,nov.length+' UFCD');closeDrawer();vCProfij()}}
/* Planeamento anual: grelha mês × dia, como a folha «Geral» e as folhas por professor */
function cpmPlanoHTML(a,C){const N=cpmNomes(a,C);if(!N.length)return cpmMatrizHTML(a,C);const nome=UI.cpmT&&N.includes(UI.cpmT)?UI.cpmT:N[0];UI.cpmT=nome;const K=cpmCalc(a,nome);
  const profs=[...new Set(K.R.map(r=>(r.d.prof||'').trim()).filter(Boolean))].sort((x,y)=>x.localeCompare(y,'pt'));const fil=UI.cpmF||'geral';
  const Rs=fil==='geral'?K.R:fil.startsWith('p:')?K.R.filter(r=>(r.d.prof||'').trim()===fil.slice(2)):K.R.filter(r=>r.d.id===fil);
  const um=Rs.length===1?Rs[0]:null;const hj=isoHoje();
  const porDia={};if(um)Object.entries(um.seq?{...Object.fromEntries(Object.entries(um.porDiaT).filter(([i])=>i<hj)),...um.porDia}:um.porDia).forEach(([iso,n])=>porDia[iso]=n);else{const vis=new Set();Rs.forEach(r=>{const k=(r.d.sig||[]).map(normSig).sort().join('|')||r.d.id;if(vis.has(k))return;vis.add(k);Object.entries(r.porDiaT).forEach(([iso,n])=>porDia[iso]=(porDia[iso]||0)+n)})}
  /* no modo de uma disciplina, depois de atingir as aulas os dias deixam de contar (como o «j» do Excel) */
  let acum=um?um.dadas:0;const meses=[];K.dias.forEach(z=>{const m=z.iso.slice(0,7);let M_=meses.find(x=>x.m===m);if(!M_){M_={m,d:{},tot:0};meses.push(M_)}M_.d[+z.iso.slice(8)]=z});
  const sel=`<div class="row cpm-sel noprint" style="gap:8px;flex-wrap:wrap">${N.map(n=>`<button type="button" class="chip ${n===nome?'on':''}" data-cpmt="${esc(n)}">${esc(n)}</button>`).join('')}</div>`;
  const opt=`<select id="cpm-f" class="noprint"><option value="geral" ${fil==='geral'?'selected':''}>Geral (todas as disciplinas)</option><optgroup label="Disciplina / UFCD">${K.R.map(r=>`<option value="${r.d.id}" ${fil===r.d.id?'selected':''}>${esc(r.d.nome)}</option>`).join('')}</optgroup>${profs.length?`<optgroup label="Professor(a)">${profs.map(p=>`<option value="p:${esc(p)}" ${fil==='p:'+p?'selected':''}>${esc(p)}</option>`).join('')}</optgroup>`:''}</select>`;
  let tGeral=0;const rows=meses.map(M_=>{const [yy,mm]=M_.m.split('-').map(Number);const nd=new Date(yy,mm,0).getDate();let tot=0;
    const cel=Array.from({length:31},(_,i)=>{const d=i+1;if(d>nd)return '<td class="x"></td>';const z=M_.d[d];if(!z)return '<td class="fora"></td>';
      let n=porDia[z.iso]||0,cls=z.t;let txt='';if(z.t==='let'){if(n){if(um&&z.iso>=hj){if(acum>=um.aulas){cls='j';n=0}else{acum+=n;if(acum>=um.aulas)cls='let fimd'}}tot+=n;txt=n||''}}
      else if(z.t==='fct')txt='F';else if(z.t==='fer')txt='•';
      return `<td class="${cls}${z.iso===hj?' hj':''}" title="${fmtIsoL(z.iso)}">${txt}</td>`}).join('');tGeral+=tot;M_.tot=tot;
    return `<tr><th>${MESES[mm].slice(0,3)} ’${String(yy).slice(2)}</th>${cel}<td class="n"><b>${tot||''}</b></td><td class="n mut">${tGeral||''}</td></tr>`}).join('');
  const cal=K.c?`<p class="cpm-calk">${ic('calendar',14)} Ligado ao <button type="button" class="lnk" id="cpm-cal">Calendário Escolar</button> importado — feriados, interrupções e fim das aulas vêm de lá${K.c.periodos&&K.c.periodos.length?' · '+K.c.periodos.length+' períodos':''} · ${K.dias.filter(z=>z.t==='let').length} dias de aulas</p>`:`<div class="alert w" style="margin-top:8px">${ic('alert',15)} Sem calendário escolar importado: só se descontam os fins de semana. <button type="button" class="btn sm" id="cpm-cal">Importar o Calendário</button></div>`;const resumo=um?`<p style="margin:8px 0 0"><b>${esc(um.d.nome)}</b> · ${um.aulas} aulas · ${um.dadas} dadas · ${um.semT} tempos por semana · ${um.fimPrev?'conclusão prevista: <b>'+cpmFD(um.fimPrev)+'</b>':'<span class="neg">faltam '+(-um.saldo)+' tempos no fim do ano</span>'}</p>`:`<p class="mut" style="margin:8px 0 0">${Rs.length} disciplina(s) · tempos por dia segundo o horário da turma. Escolha uma disciplina para ver o dia em que termina.</p>`;
  return sel+`<section class="card cpm-plano"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('calendar',18)} Planeamento Anual · ${esc(nome)}</h2><span class="sp1"></span>${opt}<button class="btn sm noprint" id="cpm-amp" title="Abrir o calendário em grande">${ic('image',14)} Aumentar</button><button class="btn sm noprint" id="cpm-imp">${ic('printer',14)} Imprimir</button></div>${cal}${resumo}
    <div class="cpm-cw"><table class="cpm-cal"><thead><tr><th></th>${Array.from({length:31},(_,i)=>`<th>${i+1}</th>`).join('')}<th>Mês</th><th>Acum.</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="cpm-leg"><span><i class="let"></i>dia de aulas (n.º de tempos)</span>${um?'<span><i class="let fimd"></i>última aula</span><span><i class="j"></i>já concluída</span>':''}<span><i class="fds"></i>fim de semana</span><span><i class="fer"></i>feriado</span><span><i class="int"></i>interrupção letiva</span><span><i class="fct"></i>FPCT</span><span><i class="hjl"></i>hoje</span></div></section>`}
function cpmBindPlano(v,a){v.querySelectorAll('[data-cpmt]').forEach(b=>b.onclick=()=>{UI.cpmT=b.dataset.cpmt;UI.cpmF='geral';vCProfij()});const f=v.querySelector('#cpm-f');if(f)f.onchange=()=>{UI.cpmF=f.value;vCProfij()};const im=v.querySelector('#cpm-imp');if(im)im.onclick=()=>imprimirVista();const cl=v.querySelector('#cpm-cal');if(cl)cl.onclick=()=>go('calendario');cpmAmpliar(v);cpmBindMatriz(v,a)}
/* ecrã ampliado (como o Perfil de Aprendizagem): barra com «Fechar», título e ações; o conteúdo passa para dentro */
function ecraAmplo(o){const x=document.getElementById('ampv');if(x)x.remove();const d=document.createElement('div');d.id='ampv';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label',o.titulo);
  d.innerHTML=`<div class="pah"><button class="btn" type="button" id="amp-x">${ic('arrowL',16)} Fechar</button><div class="pat"><b>${esc(o.titulo)}</b><span>${esc(o.sub||'')}</span></div><span class="sp1"></span><span class="ampa"></span></div><div class="pab ampb"></div>`;
  document.body.appendChild(d);document.body.classList.add('amp-on');if(o.acoes)o.acoes.forEach(e=>d.querySelector('.ampa').appendChild(e));d.querySelector('.ampb').appendChild(o.el);
  const fechar=()=>{if(!d.isConnected)return;document.removeEventListener('keydown',kb,true);d.remove();document.body.classList.remove('amp-on');try{o.aoFechar&&o.aoFechar()}catch(e){console.warn(e)}};
  const kb=e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')&&!document.querySelector('#drawer.on')&&!(e.target.closest&&e.target.closest('[contenteditable=true],input,textarea'))){e.preventDefault();fechar()}};document.addEventListener('keydown',kb,true);
  d.querySelector('#amp-x').onclick=fechar;ecraAmplo.fechar=fechar;return d}
function cpmAmpliar(v){const sec=v.querySelector('.cpm-plano'),b=v.querySelector('#cpm-amp');if(!sec||!b)return;
  b.onclick=()=>{UI.cpmFull=true;vCProfij()};if(!UI.cpmFull)return;
  const {y}=CP();const fil=v.querySelector('#cpm-f');const sub=(UI.cpmT||'')+(fil&&fil.selectedOptions[0]?' · '+fil.selectedOptions[0].textContent:'');
  const pr=document.createElement('button');pr.className='btn sm';pr.type='button';pr.innerHTML=ic('printer',14)+' Imprimir';pr.onclick=()=>imprimirVista();
  ecraAmplo({titulo:'Planeamento Anual',sub,el:sec,acoes:[pr],aoFechar:()=>{UI.cpmFull=false;removeEventListener('resize',tam);if(VIEW==='cprofij')vCProfij()}});
  const tam=()=>{const W=sec.clientWidth-40,H=innerHeight-260;const c=Math.max(22,Math.min(64,Math.floor(Math.min((W-110)/34.5,H/13.5))));sec.style.setProperty('--cs',c+'px')};requestAnimationFrame(tam);addEventListener('resize',tam)}
{const _gF=go;go=function(v){const d=document.getElementById('ampv');if(d){if(v!==VIEW){UI.cpmFull=false;UI.mqFull=false}d.remove();document.body.classList.remove('amp-on')}return _gF.apply(this,arguments)}}
/* atenção do painel: disciplinas que não chegam ao fim do ano */
{const _at=cpAtencao;cpAtencao=function(){const L=_at.apply(this,arguments);try{const a=A(),{y}=CP();Object.keys(y.mat||{}).forEach(n=>{cpmCalc(a,n).R.filter(r=>r.est==='bad').forEach(r=>L.push({c:'bad',ic:'clock',t:r.d.nome+' · '+n,s:'Faltam '+(-r.saldo)+' tempo(s) no fim do ano — planear reposições',tab:'matriz'}))})}catch(e){console.warn(e)}return L}}

