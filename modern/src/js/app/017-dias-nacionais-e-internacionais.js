/* ===================== dias nacionais e internacionais ===================== */
const DIAS_MAIS={'01-04':['Dia Mundial do Braille'],'01-26':['Dia Internacional da Educação Ambiental'],'02-02':['Dia Mundial das Zonas Húmidas'],'02-10':['Dia Mundial das Leguminosas'],'02-13':['Dia Mundial da Rádio'],
 '03-03':['Dia Mundial da Vida Selvagem'],'03-19':['Dia do Pai'],'03-20':['Dia Internacional da Felicidade','Dia Internacional da Francofonia'],'03-21':['Dia Mundial da Poesia','Dia Internacional das Florestas','Dia Mundial da Síndrome de Down','Dia Internacional para a Eliminação da Discriminação Racial'],'03-22':['Dia Mundial da Água'],'03-23':['Dia Meteorológico Mundial'],'03-27':['Dia Mundial do Teatro'],
 '04-02':['Dia Internacional do Livro Infantil','Dia Mundial da Consciencialização do Autismo'],'04-07':['Dia Mundial da Saúde'],'04-18':['Dia Internacional dos Monumentos e Sítios'],'04-22':['Dia da Terra'],'04-23':['Dia Mundial do Livro e dos Direitos de Autor'],'04-25':['Dia da Liberdade'],'04-29':['Dia Internacional da Dança'],
 '05-01':['Dia do Trabalhador'],'05-03':['Dia Mundial da Liberdade de Imprensa'],'05-05':['Dia Mundial da Língua Portuguesa'],'05-09':['Dia da Europa'],'05-15':['Dia Internacional da Família'],'05-18':['Dia Internacional dos Museus'],'05-22':['Dia Internacional da Biodiversidade'],'05-31':['Dia Mundial sem Tabaco'],
 '06-01':['Dia Mundial da Criança'],'06-05':['Dia Mundial do Ambiente'],'06-08':['Dia Mundial dos Oceanos'],'06-10':['Dia de Portugal, de Camões e das Comunidades Portuguesas'],'06-12':['Dia Mundial contra o Trabalho Infantil'],'06-20':['Dia Mundial do Refugiado'],'06-26':['Dia Internacional contra o Abuso e o Tráfico de Drogas'],
 '07-11':['Dia Mundial da População'],'07-18':['Dia Internacional Nelson Mandela'],'07-20':['Dia Internacional do Xadrez'],'07-26':['Dia dos Avós'],'07-30':['Dia Internacional da Amizade'],
 '08-09':['Dia Internacional dos Povos Indígenas'],'08-12':['Dia Internacional da Juventude'],'08-15':['Assunção de Nossa Senhora'],'08-19':['Dia Mundial da Fotografia','Dia Mundial Humanitário'],
 '09-08':['Dia Internacional da Alfabetização'],'09-15':['Dia Internacional da Democracia'],'09-16':['Dia Internacional para a Preservação da Camada de Ozono'],'09-21':['Dia Internacional da Paz'],'09-26':['Dia Europeu das Línguas'],'09-27':['Dia Mundial do Turismo'],
 '10-01':['Dia Mundial da Música','Dia Internacional das Pessoas Idosas'],'10-04':['Dia Mundial do Animal'],'10-05':['Implantação da República','Dia Mundial do Professor'],'10-10':['Dia Mundial da Saúde Mental'],'10-16':['Dia Mundial da Alimentação'],'10-17':['Dia Internacional para a Erradicação da Pobreza'],'10-24':['Dia das Nações Unidas'],'10-31':['Dia Mundial da Poupança','Halloween'],
 '11-01':['Dia de Todos os Santos','Dia Mundial do Veganismo'],'11-11':['Dia de São Martinho'],'11-13':['Dia Mundial da Bondade'],'11-14':['Dia Mundial da Diabetes'],'11-16':['Dia Internacional da Tolerância'],'11-20':['Dia Universal dos Direitos da Criança'],'11-25':['Dia Internacional para a Eliminação da Violência contra as Mulheres'],
 '12-01':['Restauração da Independência','Dia Mundial de Luta contra a SIDA'],'12-03':['Dia Internacional das Pessoas com Deficiência'],'12-05':['Dia Internacional do Voluntariado'],'12-08':['Dia da Imaculada Conceição'],'12-10':['Dia dos Direitos Humanos'],'12-18':['Dia Internacional dos Migrantes'],'12-25':['Natal']};
const _normD=x=>x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
Object.entries(DIAS_MAIS).forEach(([md,L])=>{const cur=DIAS_COMEM[md]=DIAS_COMEM[md]||[];L.forEach(n=>{if(!cur.some(c=>_normD(c)===_normD(n)))cur.push(n)})});
const NAC=/^(Dia de Portugal|Dia da Liberdade|Implantação da República|Restauração da Independência|Dia do Trabalhador|Ano Novo|Natal|Dia de Todos os Santos|Assunção|Dia da Imaculada|Dia do Pai|Dia da Mãe|Dia dos Avós|Dia de São Martinho|Dia de Reis|Dia dos Açores|Dia Escolar|Carnaval|Sexta-feira Santa|Páscoa|Corpo de Deus)/;
const tipoEfem=n=>/Mundial|Internacional|Universal|Europeu|Europa|Nações Unidas|Dia da Terra|Meteorológico|Direitos Humanos|Pi \(π\)/.test(n)?'int':NAC.test(n)?'nac':'out';
function diasMoveis(y){const p=pascoa(y);const ad=n=>{const d=new Date(p);d.setDate(d.getDate()+n);return isoData(d)};const o={};o[ad(-47)]=['Carnaval'];o[ad(-2)]=['Sexta-feira Santa'];o[ad(0)]=['Páscoa'];o[ad(50)]=['Dia dos Açores (Segunda-feira do Espírito Santo)'];o[ad(60)]=['Corpo de Deus'];
  const m=new Date(y,4,1);while(m.getDay()!==0)m.setDate(m.getDate()+1);m.setDate(m.getDate()+7);o[isoData(m)]=['Dia da Mãe'];return o}
/* fim de semana: uma piada junto da data */
const PIADAS={6:['Hoje é sábado. Tem mesmo a certeza de que devia estar a trabalhar?','Sábado! Os testes não se corrigem sozinhos… mas aguentam-se até segunda.','Sábado é dia de café sem toque de entrada. Aproveite!','Fim de semana: até o SGE está a descansar.','Sábado a planificar? Os seus alunos não estão a pensar em si, garantimos.'],
  0:['Hoje é domingo. Devia mesmo estar a trabalhar?','Domingo: até os sumários tiram folga.','É domingo — a planificação aguenta-se até amanhã, prometido.','Domingo à tarde a preparar aulas? Clássico de professor. Faça pelo menos uma pausa.','Domingo é para descansar. A grelha de avaliação não foge.']};
const piadaHoje=d=>{d=d||new Date();const L=PIADAS[d.getDay()];if(!L)return '';const n=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);return L[n%L.length]};
{const _wh=widgetHojeInfo;widgetHojeInfo=function(){const d=new Date();const iso=isoHoje();const md=iso.slice(5);const mov=diasMoveis(d.getFullYear())[iso]||[];
  const orig=DIAS_COMEM[md];const todos=[...(orig||[])];mov.forEach(n=>{if(!todos.some(c=>_normD(c)===_normD(n)))todos.push(n)});
  /* o original desenha a lista simples; reorganizamos por nacionais/internacionais */
  DIAS_COMEM[md]=[];let h;try{h=_wh.apply(this,arguments)}finally{if(orig)DIAS_COMEM[md]=orig;else delete DIAS_COMEM[md]}
  const a=A();const cal=a&&a.calendario;const tp=cal&&cal.dias&&cal.dias[iso];const feriado=tp&&/^feriado/.test(tp);
  const nac=todos.filter(n=>tipoEfem(n)!=='int'),int=todos.filter(n=>tipoEfem(n)==='int');
  const li=(n,k)=>`<li class="${/Professor/.test(n)?'prof':k}">${ic(/Professor/.test(n)?'grad':k==='int'?'globo':'flag',14)}<span>${esc(n)}</span></li>`;
  let extra='';if(nac.length)extra+=`<li class="whg" aria-hidden="true">Dias nacionais</li>`+nac.map(n=>li(n,'nac')).join('');
  if(int.length)extra+=`<li class="whg" aria-hidden="true">Dias internacionais</li>`+int.map(n=>li(n,'int')).join('');
  const pz=piadaHoje(d);
  if(pz)h=h.replace('</div>\n    ','</div><p class="whpz" role="note">'+ic('sparkle',14)+'<span>'+esc(pz)+'</span></p>\n    ');
  if(extra){if(h.includes('<ul class="whl">'))h=h.replace(/<\/ul><\/div>$/,extra+'</ul></div>');else h=h.replace(/<p class="mut"[^>]*>Sem efemérides para hoje\.<\/p>/,'<ul class="whl">'+extra+'</ul>')}
  return h}}
/* horário de hoje vazio ao fim de semana */
{const _vmh=typeof vMeuHorario==='function'?vMeuHorario:null;if(_vmh){vMeuHorario=function(){const r=_vmh.apply(this,arguments);try{const pz=piadaHoje();if(pz){const p=[...document.querySelectorAll('#view p.mut')].find(x=>/Hoje não há atividades letivas/.test(x.textContent));if(p&&!p.querySelector('.whpz'))p.insertAdjacentHTML('beforeend',`<span class="whpz in">${ic('sparkle',13)} ${esc(pz)}</span>`)}}catch(_){}return r}}}

/* ensino profissional: o distintivo da turma mostra o código interno (no regular continua o ano) */
function badgeCod(t){try{if(!t||!t.codigo)return '';const prof=ofertaDe(t)==='profissional'||tipoEscola(escolaDe(t))==='profissional';return prof?String(t.codigo).trim().slice(0,6):''}catch(_){return ''}}


/* ===================== Entrar com Microsoft 365 → OneDrive pronto a sincronizar ===================== */
/* ID da aplicação (Microsoft Entra) embutido: preencha aqui quando alojar a app para não ter de o escrever em cada dispositivo.
   Também pode ser passado uma vez no endereço: https://…/index.html?ms=<ID> */
const EF_MS_ID='';
try{const q=new URLSearchParams(location.search).get('ms');if(q&&/^[0-9a-f-]{36}$/i.test(q)){nvSet({msId:q});history.replaceState(null,'',location.pathname+location.hash)}}catch(_){}
const msIdAtual=()=>{const L=nvL();const a=(S.cfg.auth&&S.cfg.auth.ms)||{};return L.msId||a.clientId||EF_MS_ID||''};
/* a ligação usa o ID atual e o inquilino da escola (se indicado) */
{const _ml=msLigar;msLigar=async function(){const id=msIdAtual();if(id&&!nvL().msId)nvSet({msId:id});return _ml.apply(this,arguments)}}
/* pedido do ID quando ainda não existe neste dispositivo */
function msPedirId(){return new Promise(res=>{const d=document.createElement('dialog');d.className='amodal msid';d.setAttribute('aria-labelledby','mi-t');
  d.innerHTML=`<div class="amh"><svg width="22" height="22" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg><h2 id="mi-t">Ligar o EduSpruce à Microsoft</h2></div>
  <p class="hint" style="margin:0 0 10px">Só é preciso uma vez. O EduSpruce precisa do <b>ID da aplicação</b> registada na Microsoft Entra (grátis).</p>
  <label for="mi-id">ID da aplicação (cliente)</label><input id="mi-id" placeholder="00000000-0000-0000-0000-000000000000" autocapitalize="none" spellcheck="false" inputmode="text">
  <details class="nvaj"><summary>Como obter</summary><ol><li><b>portal.azure.com</b> › Microsoft Entra ID › Registos de aplicações › <b>Novo registo</b>.</li><li>Tipos de conta: <b>qualquer organização e contas pessoais</b>.</li><li>URI de redirecionamento: <b>Aplicação de página única (SPA)</b> → <code>${esc(nvRedirect())}</code></li><li>Permissões de API › Microsoft Graph › Delegadas: <b>User.Read</b> e <b>Files.ReadWrite.AppFolder</b>.</li><li>Copie o “ID da aplicação (cliente)”. Numa conta da escola o administrador pode ter de aprovar.</li></ol></details>
  <p class="lgerr" id="mi-err" role="alert"></p><div class="row amb"><button type="button" class="btn" data-mi="0">Cancelar</button><button type="button" class="btn pri" data-mi="1">Continuar</button></div>`;
  document.body.appendChild(d);const fim=v=>{try{d.close()}catch(_){}d.remove();res(v)};d.addEventListener('cancel',e=>{e.preventDefault();fim(null)});
  d.querySelector('[data-mi="0"]').onclick=()=>fim(null);const ok=()=>{const v=d.querySelector('#mi-id').value.trim();if(!/^[0-9a-f-]{36}$/i.test(v)){d.querySelector('#mi-err').textContent='O ID tem o formato 00000000-0000-0000-0000-000000000000.';return}nvSet({msId:v});fim(v)};
  d.querySelector('[data-mi="1"]').onclick=ok;d.querySelector('#mi-id').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok()}});try{d.showModal()}catch(_){d.setAttribute('open','')}setTimeout(()=>d.querySelector('#mi-id').focus(),50)})}
/* palavra-passe de encriptação depois de entrar */
function nvPedirPalavra(existe,conta){return new Promise(res=>{const d=document.createElement('dialog');d.className='amodal nvpwd';d.setAttribute('aria-labelledby','np-t');
  d.innerHTML=`<div class="amh">${ic('shield',22)}<h2 id="np-t">${existe?'Abrir os Seus Dados na Nuvem':'Proteger os Dados na Nuvem'}</h2></div>
  <p class="hint" style="margin:0 0 10px">${existe?`Encontrámos dados do EduSpruce no OneDrive de <b>${esc(conta||'')}</b>. Escreva a palavra-passe de encriptação que definiu no outro dispositivo.`:`Os dados vão ser guardados no OneDrive de <b>${esc(conta||'')}</b>, encriptados neste dispositivo. Escolha uma palavra-passe só sua (mín. 8) e guarde-a: vai precisar dela no iPad, no Mac ou noutro browser.`}</p>
  <input type="password" id="np-1" placeholder="Palavra-passe de encriptação" autocomplete="${existe?'current-password':'new-password'}">${existe?'':'<input type="password" id="np-2" placeholder="Repetir" autocomplete="new-password" style="margin-top:8px">'}
  <p class="lgerr" id="np-err" role="alert"></p><div class="row amb"><button type="button" class="btn" data-np="0">Mais Tarde</button><button type="button" class="btn pri" data-np="1">${ic('refresh',15)} ${existe?'Abrir e Sincronizar':'Guardar e Sincronizar'}</button></div>`;
  document.body.appendChild(d);const fim=v=>{try{d.close()}catch(_){}d.remove();res(v)};d.addEventListener('cancel',e=>{e.preventDefault();fim(false)});d.querySelector('[data-np="0"]').onclick=()=>fim(false);
  const ok=async()=>{const a=d.querySelector('#np-1').value,b=existe?a:d.querySelector('#np-2').value;const er=d.querySelector('#np-err');{const _e=nvPinErro(a,'np-1',!existe);if(_e){er.textContent=_e;return}}if(a!==b){er.textContent='As palavras-passe não coincidem.';return}
    const bt=d.querySelector('[data-np="1"]');bt.disabled=true;er.textContent='';try{await nvDefinirPalavra(a);fim(true)}catch(e){er.textContent=e.message;bt.disabled=false;d.classList.add('abana');setTimeout(()=>d.classList.remove('abana'),400)}};
  d.querySelector('[data-np="1"]').onclick=ok;d.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok()}}));try{d.showModal()}catch(_){d.setAttribute('open','')}setTimeout(()=>d.querySelector('#np-1').focus(),50)})}
async function nvAposLogin(){if(nvAposLogin._a)return;nvAposLogin._a=1;try{const L=nvL();if(L.prov!=='onedrive'||!L.ms)return;if(await nvChave()){nvSincronizar(false);return}
  let existe=false;try{existe=!!(await PROV.onedrive.ler(NV_PREF+'manifest.json'))}catch(e){toast(e.message,'erro');return}
  const ok=await nvPedirPalavra(existe,L.conta);if(!ok){toast('Pode ativar a sincronização mais tarde em Definições › Dados e Segurança','aviso');return}
  const r=await nvSincronizar(true);if(r&&!existe)toast('Tudo pronto: os seus dados estão no OneDrive (encriptados)','ok')}catch(e){console.warn(e)}finally{nvAposLogin._a=0}}
/* Entrar com Microsoft 365: uma só autorização dá a sessão e o acesso à pasta da app no OneDrive */
msLogin=async function(A_){if(!nvHttps())throw new Error('Entrar com Microsoft 365 precisa que a app esteja num endereço https (alojada num servidor), não aberta como ficheiro.');
  let id=msIdAtual();if(!id){id=await msPedirId();if(!id)return null}if(!nvL().msId)nvSet({msId:id});
  await msLigar();const L=nvL();let me={};try{me=await (await msF('https://graph.microsoft.com/v1.0/me')).json()}catch(_){}
  const email=String(me.mail||me.userPrincipalName||L.conta||'').toLowerCase();const m=(A_&&A_.ms)||{};
  if(m.dominio&&!email.endsWith('@'+m.dominio.toLowerCase().replace(/^@/,''))){nvSet({ms:null});throw new Error('A conta '+email+' não pertence ao domínio autorizado ('+m.dominio+').')}
  const nome=me.displayName||email;nvSet({prov:L.prov||'onedrive',conta:email,auto:L.auto!==false});
  if(L.prov&&L.prov!=='onedrive')nvSet({prov:'onedrive',base:null,mod:{}});
  try{if(!S.cfg.professor)S.cfg.professor=nome;if((!S.cfg.email||typeof S.cfg.email!=='string')&&/@/.test(email))S.cfg.email=email;S.cfg.auth=S.cfg.auth||{};S.cfg.auth.ms=S.cfg.auth.ms||{};if(!S.cfg.auth.ms.clientId)S.cfg.auth.ms.clientId=id;save()}catch(_){}
  setTimeout(nvAposLogin,900);
  return {u:email,nome,papel:'professor',tipo:'ms',desde:Date.now()}};
/* o botão fica sempre disponível (o ID pode ser pedido no momento) */
{const _pl=pedirLogin;pedirLogin=function(){const p=_pl.apply(this,arguments);setTimeout(()=>{const b=$('#lg-ms');if(b){b.removeAttribute('aria-disabled');const m=b.querySelector('.mut');if(m)m.remove();
    if(!$('#lg-msn'))($('#lg-gg')||b).insertAdjacentHTML('afterend',`<p class="lgmsn" id="lg-msn">${ic('refresh',13)} Entre com Google: os dados ficam iguais no computador, no iPad e no iPhone (Google Drive, encriptado).</p>`)}},0);return p}}
/* sessão Microsoft já iniciada: confirma a sincronização ao abrir */
setTimeout(()=>{try{const s=sessaoAtual();if(s&&s.tipo==='ms')nvAposLogin()}catch(_){}},2500);
/* Definições › Conta e Acesso: o ID da Microsoft passa também para este dispositivo */
document.addEventListener('change',e=>{if(e.target&&e.target.id==='ms-cid'){const v=e.target.value.trim();if(v)nvSet({msId:v})}},true);


/* ecrã de código ao abrir: mesmo fundo do início de sessão, cartão moderno com teclado */
pedirPin=function(){return new Promise(ok=>{const p=(()=>{try{return perfil()}catch(_){return {}}})();const nome=profNome?(profNome(S.cfg.professor)||''):(S.cfg.professor||'');const pn=(S.cfg.professor||'').trim().split(/\s+/)[0]||'';
  let foto=p.foto||'';if(foto&&!/^data:/.test(foto))foto=FOTOS[foto]||FOTOS[String(foto).replace(/^f:/,'')]||'';const ini=(S.cfg.professor||'E').trim().split(/\s+/).filter(Boolean);const inic=((ini[0]||'E')[0]+(ini.length>1?ini[ini.length-1][0]:'')).toUpperCase();
  const h=new Date().getHours();const sd=h<6?'Boa noite':h<13?'Bom dia':h<20?'Boa tarde':'Boa noite';
  const o=document.createElement('div');o.id='login';o.className='pinmode';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','pl-t');
  const teclas=['1','2','3','4','5','6','7','8','9','x','0','b'];
  o.innerHTML=`<div class="lgb pinc"><div class="lgh"><span class="lgi">${ic('flow',30)}</span><div><b>Edu<em>Spruce</em></b><span>${esc(S.cfg.escola||'Menos papelada. Mais tempo para ensinar.')}</span></div></div>
    <div class="plav">${foto?`<img src="${foto}" alt="">`:`<span>${esc(inic)}</span>`}<i>${ic('cadeado',14)}</i></div>
    <h1 id="pl-t">${sd}${pn?', '+esc(pn):''}</h1><p class="mut plsub">Introduza o seu código para continuar</p>
    <div class="pdots" role="status" aria-live="polite" aria-label="0 de 4 algarismos"><i></i><i></i><i></i><i></i></div><p class="pderr" role="alert"></p>
    <div class="pdk">${teclas.map(k=>k==='x'?`<button type="button" class="pdc" data-pk="x">Sair</button>`:k==='b'?`<button type="button" class="pdb" data-pk="b" aria-label="Apagar">${ic('arrowL',22)}</button>`:`<button type="button" data-pk="${k}">${k}</button>`).join('')}</div>
    <p class="lgnota">${SESSAO&&SESSAO.nome?'Sessão de <b>'+esc(SESSAO.nome)+'</b>'+(SESSAO.tipo==='ms'?' · Microsoft 365':''):''}</p></div>`;
  document.body.appendChild(o);document.body.classList.add('login-on');let v='',ocup=false;const D=o.querySelector('.pdots'),E_=o.querySelector('.pderr');
  const dots=()=>{D.querySelectorAll('i').forEach((d,k)=>d.classList.toggle('on',k<v.length));D.setAttribute('aria-label',v.length+' de 4 algarismos')};
  const tecla=async x=>{if(ocup)return;if(x==='x'){if(confirm('Terminar a sessão?'))terminarSessao();return}if(x==='b')v=v.slice(0,-1);else if(v.length<4){v+=x;E_.textContent=''}dots();
    const bt=o.querySelector(`[data-pk="${x}"]`);if(bt){bt.classList.remove('prem');void bt.offsetWidth;bt.classList.add('prem')}
    if(v.length===4){ocup=true;if(await sha('eg:'+v)===S.cfg.pinHash){D.classList.add('ok');document.removeEventListener('keydown',kb);setTimeout(()=>{o.classList.add('sai');document.body.classList.remove('login-on');setTimeout(()=>o.remove(),300);ok()},220)}
      else{E_.textContent='Código errado';D.classList.add('abana');try{vibrar()}catch(_){}setTimeout(()=>{v='';dots();D.classList.remove('abana');ocup=false},420)}}};
  o.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>tecla(b.dataset.pk));const kb=e=>{if(e.target&&(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.closest&&e.target.closest('dialog')))return;if(/^\d$/.test(e.key)){e.preventDefault();tecla(e.key)}else if(e.key==='Backspace'){e.preventDefault();tecla('b')}};document.addEventListener('keydown',kb);
  const c=o.querySelector('.pinc');c.tabIndex=-1;setTimeout(()=>c.focus({preventScroll:true}),80)})};


/* ===================== Início: desempenho por critério de avaliação ===================== */
function estCriterios(t,per){const AL=alunosAval(t);const D=t.dominios||[];const lin=D.map(d=>({d,v:[],ant:[]}));const fin=[];
  AL.forEach(al=>{const P=pctsFinal(t,al.id,per);lin.forEach(l=>{const x=P[l.d.id];if(x!=null)l.v.push({x,al})});const f=ponderada(t,P);if(f!=null)fin.push({f,al});
    if(per>1){const Q=pctsPer(t,al.id,per-1);lin.forEach(l=>{const x=Q[l.d.id];if(x!=null)l.ant.push(x)})}});
  const med=a=>a.length?a.reduce((s,b)=>s+b,0)/a.length:null;
  lin.forEach(l=>{const xs=l.v.map(o=>o.x);l.m=med(xs);l.min=xs.length?Math.min(...xs):null;l.max=xs.length?Math.max(...xs):null;l.neg=xs.filter(x=>x<.495).length;l.top=xs.filter(x=>x>=.895).length;l.n=xs.length;l.ma=med(l.ant);
    l.dp=xs.length>1?Math.sqrt(xs.reduce((s,x)=>s+(x-l.m)**2,0)/xs.length):0;l.fracos=l.v.filter(o=>o.x<.495).sort((a,b)=>a.x-b.x).map(o=>o.al)});
  return {lin,fin,AL,mf:med(fin.map(o=>o.f)),pos:fin.filter(o=>o.f>=.495).length}}
function widgetCriterios(){const a=A();if(!a)return '';const TF=turmasFiltradas(a).filter(t=>(t.dominios||[]).length&&t.instrumentos.some(i=>alunosAval(t).some(al=>instAvaliado(i,al.id))));if(!TF.length)return '';
  UI.estC=UI.estC||{};let t=TF.find(x=>x.id===UI.estC.t)||TF.find(x=>x.id===S.turmaAtiva)||TF[0];const pmax=Math.max(1,...t.instrumentos.map(i=>+i.periodo||1));let per=Math.min(UI.estC.p||perAtual(t),pmax);
  const sec=isSec(t);const V=f=>f==null?'—':sec?(f*20).toFixed(1).replace('.',','):Math.round(f*100)+'%';const cor=f=>f==null?'var(--mut)':f<.495?'#dc2626':f<.695?'#d97706':f<.895?'#2563eb':'#16a34a';
  const E=estCriterios(t,per);const ok=E.lin.filter(l=>l.m!=null);if(!ok.length)return '';
  const forte=ok.slice().sort((x,y)=>y.m-x.m)[0],fraco=ok.slice().sort((x,y)=>x.m-y.m)[0];const W=CAL()&&periodos().length===2?'S':'P';
  const bins=sec?[[0,.245,'0–4'],[.245,.495,'5–9'],[.495,.695,'10–13'],[.695,.895,'14–17'],[.895,1.01,'18–20']]:[[0,.495,'<50'],[.495,.695,'50–69'],[.695,.895,'70–89'],[.895,1.01,'90+']];
  const H=bins.map(([lo,hi,n])=>({n,c:E.fin.filter(o=>o.f>=lo&&o.f<hi).length,lo}));const hm=Math.max(1,...H.map(h=>h.c));
  const pctP=E.fin.length?Math.round(E.pos/E.fin.length*100):0;
  return `<div class="card estc" id="estc"><div class="row" style="gap:8px;margin-bottom:10px"><h2 style="margin:0;font-size:15px">${ic('chart',17)} Desempenho por Critério</h2><span class="sp1"></span>
    <div class="estps" role="group" aria-label="Período">${Array.from({length:pmax},(_,i)=>`<button type="button" class="${i+1===per?'on':''}" data-estp="${i+1}" aria-pressed="${i+1===per}">${i+1}.º ${W}</button>`).join('')}</div></div>
    ${TF.length>1?(()=>{const dup=n=>TF.filter(y=>y.nome===n).length>1;const lb=x=>esc(x.nome)+(dup(x.nome)?' · '+esc(discAbrev(x.disciplina)):'');return TF.length>3?`<div class="estsel">${anoBadge(t,'sm')}<select aria-label="Turma" data-estsel>${TF.map(x=>`<option value="${x.id}" ${x.id===t.id?'selected':''}>${esc(x.nome)} · ${esc(x.disciplina)}</option>`).join('')}</select></div><div hidden>${TF.map(x=>`<button type="button" data-estt="${x.id}"></button>`).join('')}</div>`:`<div class="estts" role="group" aria-label="Turma">${TF.map(x=>`<button type="button" class="${x.id===t.id?'on':''}" data-estt="${x.id}" aria-pressed="${x.id===t.id}">${anoBadge(x,'sm')}<span>${lb(x)}</span></button>`).join('')}</div>`})():''}
    <div class="estk"><div class="estring" style="--p:${(E.mf||0)*100};--c:${cor(E.mf)}"><b>${V(E.mf)}</b><span>média</span></div>
      <div class="estkk"><div><b>${E.pos}<small>/${E.fin.length}</small></b><span>positivas · ${pctP}%</span></div><div><b style="color:${domCor(t,forte.d)}">${esc(forte.d.ab||forte.d.nome)}</b><span>ponto forte</span></div><div><b style="color:${domCor(t,fraco.d)}">${esc(fraco.d.ab||fraco.d.nome)}</b><span>a reforçar</span></div></div></div>
    <ul class="estl">${E.lin.map(l=>{const tr=l.ma!=null&&l.m!=null?l.m-l.ma:null;return `<li style="--dc:${domCor(t,l.d)}"><div class="estn"><span class="dcic">${icDom(l.d,14)}</span><span title="${esc(l.d.nome)}">${esc(l.d.nome)}</span><small>${+l.d.peso||0}%</small><span class="sp1"></span>${tr!=null&&Math.abs(tr)>=.01?`<em class="${tr>0?'up':'dn'}" title="Em relação ao ${per-1}.º ${W==='S'?'semestre':'período'}">${tr>0?'▲':'▼'} ${sec?Math.abs(tr*20).toFixed(1).replace('.',','):Math.round(Math.abs(tr)*100)}</em>`:''}<b class="estv" style="--vc:${cor(l.m)}">${V(l.m)}</b></div>
      <div class="estb" title="Mínimo ${V(l.min)} · Máximo ${V(l.max)}"><i class="rg" style="left:${(l.min||0)*100}%;width:${((l.max||0)-(l.min||0))*100}%"></i><i class="mv" style="width:${(l.m||0)*100}%;background:${domCor(t,l.d)}"></i><i class="lim"></i></div>
      <div class="estm"><span>${l.n} aval.</span>${l.neg?`<span class="neg" title="${esc(l.fracos.map(x=>x.nome).join(', '))}">${l.neg} negativa${l.neg>1?'s':''}</span>`:'<span class="okk">sem negativas</span>'}${l.top?`<span>${l.top} excelente${l.top>1?'s':''}</span>`:''}<span>dispersão ${sec?(l.dp*20).toFixed(1).replace('.',','):Math.round(l.dp*100)}</span></div></li>`}).join('')}</ul>
    <div class="esth" aria-label="Distribuição das classificações">${H.map(h=>`<div title="${h.c} aluno(s) com ${h.n}"><i style="height:${Math.max(4,h.c/hm*100)}%;background:${cor(h.lo+.01)}"></i><b>${h.c}</b><span>${h.n}</span></div>`).join('')}</div>
    ${fraco.neg?`<p class="estdica">${ic('sparkle',13)}<span><b>${esc(fraco.d.nome)}</b> é o critério mais fraco${fraco.neg?` — ${fraco.neg} aluno${fraco.neg>1?'s':''} abaixo de ${sec?'10':'50%'}`:''}. Vale a pena um instrumento ou uma atividade de recuperação focada aqui.</span></p>`:''}
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn sm" type="button" data-estgo="avaliacao">${ic('grad',14)} Avaliação</button><button class="btn sm" type="button" data-estgo="instrumentos">${ic('file',14)} Instrumentos</button></div></div>`}
function bindCriterios(){const c=$('#estc');if(!c)return;const re=()=>{const d=document.createElement('div');d.innerHTML=widgetCriterios();const n=d.firstElementChild;if(n){$('#estc').replaceWith(n);bindCriterios()}};
  c.querySelectorAll('[data-estp]').forEach(b=>b.onclick=()=>{UI.estC={...(UI.estC||{}),p:+b.dataset.estp};re()});
  c.querySelectorAll('[data-estt]').forEach(b=>b.onclick=()=>{UI.estC={t:b.dataset.estt};re()});
  c.querySelectorAll('[data-estgo]').forEach(b=>b.onclick=()=>{const tt=(UI.estC||{}).t;if(tt&&tt!==S.turmaAtiva){S.turmaAtiva=tt;save()}go(b.dataset.estgo)})}
{const _piE=posInicio;posInicio=function(){const r=_piE.apply(this,arguments);try{const cd=$('#view .cdown');const side=cd?cd.closest('.in-side')||cd.parentElement:$('.in-side');if(side&&!$('#estc')){const h=widgetCriterios();if(h){if(cd&&cd.parentElement===side)cd.insertAdjacentHTML('afterend',h);else side.insertAdjacentHTML('beforeend',h);bindCriterios()}}}catch(e){console.warn(e)}return r}}


/* ===================== Ensino profissional: avaliação separada por módulo =====================
   Cada módulo tem os seus critérios, menções, regra, instrumentos e produção oral (m.av).
   Alunos, horário, planta, sumários e direção de turma continuam a ser os da turma.
   Na turma, t.dominios / t.instrumentos / … passam a apontar para o módulo ativo. */
const MOD_KS=['dominios','mencoes','regra','instrumentos','oral'];
const MODAT_KEY='edugest.modAtivo';let MODAT={};try{MODAT=JSON.parse(localStorage.getItem(MODAT_KEY)||'{}')}catch(_){}
const _clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
function modAvDe(t,m,b){if(!m.av){const src=b||t;m.av={dominios:_clone(src.dominios||[]),mencoes:_clone(src.mencoes||MENCOES_DEF),regra:_clone(src.regra||{2:'media',3:'media'}),instrumentos:[]}}
  MOD_KS.forEach(k=>{if(k!=='oral'&&m.av[k]==null)m.av[k]=k==='instrumentos'?[]:_clone((b||{})[k])});return m.av}
function modAtivo(t){const M=t.modulos||[];if(!M.length)return null;let m=M.find(x=>x.id===MODAT[t.id]);if(!m){const hj=isoData(new Date());m=M.find(x=>x.ini&&x.ini<=hj&&(!x.fim||x.fim>=hj))||M.find(x=>!(x.ini&&x.fim&&x.fim<hj))||M[0]}return m}
function modEscolher(t,id){MODAT[t.id]=id;try{localStorage.setItem(MODAT_KEY,JSON.stringify(MODAT))}catch(_){}}
function modAttach(t){if(!t||!t.porModulo||Object.prototype.hasOwnProperty.call(t,'__mod'))return;const b={};MOD_KS.forEach(k=>{b[k]=t[k]});
  Object.defineProperty(t,'__mod',{value:b,enumerable:false,writable:true,configurable:true});
  MOD_KS.forEach(k=>Object.defineProperty(t,k,{enumerable:k!=='oral'||b.oral!==undefined,configurable:true,
    get(){const m=modAtivo(t);if(!m)return b[k];return modAvDe(t,m,b)[k]},
    set(v){const m=modAtivo(t);if(!m){b[k]=v;return}modAvDe(t,m,b)[k]=v}}));
  Object.defineProperty(t,'toJSON',{enumerable:false,configurable:true,value:function(){const o={};Object.keys(this).forEach(k=>{if(!MOD_KS.includes(k))o[k]=this[k]});MOD_KS.forEach(k=>{if(b[k]!==undefined)o[k]=b[k]});return o}})}
function modDetach(t){if(!t||!Object.prototype.hasOwnProperty.call(t,'__mod'))return;const b=t.__mod;delete t.toJSON;MOD_KS.forEach(k=>{delete t[k];if(b[k]!==undefined)t[k]=b[k]});delete t.__mod}
function modAttachAll(st){try{(st||S).anos.forEach(a=>a.turmas.forEach(t=>{if(t.porModulo)modAttach(t)}))}catch(_){}}
const modRaw=(t,k)=>t&&t.__mod?t.__mod[k]:t[k];
/* ligar a separação: copia os critérios da turma para cada módulo e leva os instrumentos já marcados com o módulo */
function modAtivar(t){if(!t||t.porModulo)return;const M=t.modulos=t.modulos||[];
  M.forEach(m=>{if(m.av)return;const ins=(t.instrumentos||[]).filter(i=>i.modulo===m.id);m.av={dominios:_clone(t.dominios||[]),mencoes:_clone(t.mencoes||MENCOES_DEF),regra:_clone(t.regra||{2:'media',3:'media'}),instrumentos:ins}});
  const usados=new Set(M.map(m=>m.id));t.instrumentos=(t.instrumentos||[]).filter(i=>!usados.has(i.modulo));t.porModulo=true;modAttach(t)}
function modDesativar(t){if(!t||!t.porModulo)return;const b=t.__mod||t;modDetach(t);t.instrumentos=t.instrumentos||[];(t.modulos||[]).forEach(m=>{if(m.av){(m.av.instrumentos||[]).forEach(i=>{i.modulo=m.id;t.instrumentos.push(i)})}});t.porModulo=false}
/* classificação do módulo: critérios do módulo, todos os instrumentos do módulo (0–20) */
function notaModAuto(t,aid,mid){if(!t||!t.porModulo)return null;const m=(t.modulos||[]).find(x=>x.id===mid);if(!m||!m.av)return null;const D=m.av.dominios||[],I=m.av.instrumentos||[];if(!D.length||!I.length)return null;
  const p={};D.forEach(d=>{const v=I.map(i=>instDom(i,aid,d.id)).filter(Boolean).map(x=>x.pct);p[d.id]=v.length?v.reduce((a,b)=>a+b,0)/v.length:null});const f=ponderada({dominios:D},p);return f==null?null:Math.round(f*20)}
/* ligações: migrar, guardar e navegar voltam a ligar os módulos (o estado pode ter sido recarregado) */
{const _mg=migrate;migrate=function(st){const r=_mg.apply(this,arguments);modAttachAll(r);return r}}
{const _svM=saveNow;saveNow=function(){modAttachAll();return _svM.apply(this,arguments)}}
{const _gM=go;go=function(){modAttachAll();return _gM.apply(this,arguments)}}
modAttachAll();
/* o bloqueio compara os critérios guardados (não os do módulo que está aberto) */
{const _bs=bloqSig;bloqSig=function(st,c){if(c!=='criterios')return _bs.apply(this,arguments);return JSON.stringify((st.anos||[]).map(a=>(a.turmas||[]).map(t=>[t.id,modRaw(t,'dominios'),modRaw(t,'mencoes'),modRaw(t,'regra'),(t.modulos||[]).map(m=>m.av?[m.id,m.av.dominios,m.av.mencoes,m.av.regra]:m.id)])))}}
/* barra de módulos nas vistas de avaliação */
const MOD_VISTAS=new Set(['criterios','instrumentos','dominios','avaliacao','relatorios','oral','inicio_x']);
function barraModulos(t){const M=t.modulos||[];const m=modAtivo(t);const U=unidMod(t);
  if(!M.length)return `<div class="modbar vz" role="note">${ic('layers',16)}<span><b>Esta disciplina ainda não tem ${U.p.toLowerCase()}.</b> No ensino profissional cada ${U.um} tem os seus critérios e a sua avaliação.</span><span class="sp1"></span><button class="btn sm pri" type="button" data-modnovo>${ic('plus',14)} Criar ${U.p}</button></div>`;
  const hs=M.reduce((s,x)=>s+(+x.horas||0),0);
  return `<div class="modbar" role="group" aria-label="${U.s} em avaliação"><span class="modl">${ic('layers',15)} ${U.s}</span><div class="modch">${M.map((x,i)=>{const n=(x.av&&x.av.instrumentos||[]).length;return `<button type="button" class="modc ${x===m?'on':''}" data-modsel="${x.id}" aria-pressed="${x===m}" title="${esc((x.cod?x.cod+' · ':'')+x.nome)}"><b>${esc(x.cod||String(i+1))}</b><span>${esc(x.nome)}</span><small>${x.horas?x.horas+' h':''}${n?' · '+n+' instr.':''}</small></button>`}).join('')}</div>
    <span class="sp1"></span><span class="mut modtot">${M.length} ${M.length===1?U.um:U.p.toLowerCase()}${hs?' · '+hs+' h':''}</span><button class="btn sm" type="button" data-modger>${ic('pencil',13)} Gerir</button></div>
    ${m?`<p class="modinfo">${ic('info',13)||''} A ver <b>${esc((m.cod?m.cod+' — ':'')+m.nome)}</b>: critérios, instrumentos e classificação são só deste ${U.um}. Alunos, horário e planta da sala são os da turma.</p>`:''}`}
function modPorBarra(){const v=$('#view');if(!v)return;const t=T();const ex=v.querySelector(':scope>.modwrap');
  if(!t||!t.porModulo||!MOD_VISTAS.has(VIEW)){if(ex)ex.remove();return}
  const html=barraModulos(t);if(ex&&ex.dataset.h===html)return;if(ex)ex.remove();
  const w=document.createElement('div');w.className='modwrap';w.dataset.h=html;w.innerHTML=html;const h=v.querySelector(':scope>h1');if(h)h.after(w);else v.prepend(w);
  w.querySelectorAll('[data-modsel]').forEach(b=>b.onclick=()=>{modEscolher(t,b.dataset.modsel);go(VIEW)});
  const g=w.querySelector('[data-modger]');if(g)g.onclick=()=>go('modulos');const n=w.querySelector('[data-modnovo]');if(n)n.onclick=()=>{go('modulos');setTimeout(()=>{try{moduloDlg(t)}catch(_){}},100)}}
{let _mo=null;const liga=()=>{const v=$('#view');if(!v||_mo)return;_mo=new MutationObserver(()=>{if(!v.querySelector(':scope>.modwrap')||VIEW)requestAnimationFrame(()=>{try{modPorBarra()}catch(_){}})});_mo.observe(v,{childList:true})};
  setTimeout(liga,0);{const _gMb=go;go=function(){const r=_gMb.apply(this,arguments);liga();try{modPorBarra()}catch(_){}return r}}}
/* Módulos: interruptor da avaliação separada e classificação automática visível */
{const _vm=vModulos;vModulos=function(){const r=_vm.apply(this,arguments);try{const t=T();if(!t||!ehModular(t))return r;const U=unidMod(t);const v=$('#view');const h=v.querySelector(':scope>h1');
  const html=`<div class="card modsep"><div class="row" style="gap:10px;flex-wrap:wrap"><span class="modsi">${ic('layers',20)}</span><div style="flex:1;min-width:220px"><b>Avaliação separada por ${U.um}</b><div class="mut" style="font-size:13px">${t.porModulo?`Cada ${U.um} tem critérios, instrumentos e classificação próprios. A classificação do ${U.um} é calculada com os seus instrumentos (pode escrevê-la à mão na pauta).`:`Os critérios e os instrumentos são comuns a todos os ${U.p.toLowerCase()} da turma.`}</div></div>
    <label class="modsw"><input type="checkbox" role="switch" id="mod-sep" ${t.porModulo?'checked':''} aria-label="Avaliação separada por módulo"><span aria-hidden="true"></span></label></div></div>`;
  if(h)h.insertAdjacentHTML('afterend',html);else v.insertAdjacentHTML('afterbegin',html);
  $('#mod-sep').onchange=e=>{if(e.target.checked){if(!(t.modulos||[]).length){e.target.checked=false;return toast('Crie primeiro os '+U.p.toLowerCase(),'aviso')}modAtivar(t);toast('Avaliação separada por '+U.um+' ligada — os critérios da turma foram copiados para cada '+U.um,'ok')}else{if(!confirm('Voltar a critérios comuns? Os instrumentos de cada '+U.um+' passam para a turma (ficam marcados com o '+U.um+'); os critérios próprios de cada '+U.um+' deixam de ser usados.')){e.target.checked=true;return}modDesativar(t)}saveNow();vModulos()};
  /* novos módulos já ficam com avaliação própria */
  if(t.porModulo)(t.modulos||[]).forEach(m=>{if(!m.av)modAvDe(t,m,t.__mod)})}catch(e){console.warn(e)}return r}}
/* ---------- Nova Turma (ensino profissional): os módulos da disciplina são obrigatórios ---------- */
{const _ntM=novaTurmaDlg;novaTurmaDlg=function(){const r=_ntM.apply(this,arguments);try{const dw=$('#dw-b');const ok=$('#nt-ok');if(!dw||!ok)return r;
  const ofA=()=>{const b=$('#nt-ofw [data-of].on');return b?b.dataset.of:'regular'};const disc=()=>{const sd=$('#nt-disc');return sd&&sd.value!=='__outra'?discNome(sd.value):(($('#nt-outra')||{}).value||'').trim()};
  let rows=[{n:'',h:''},{n:'',h:''}];
  const wrap=document.createElement('div');wrap.id='nt-modsx';const ref=$('#nt-maisw')||($('#nt-outra')&&$('#nt-outra').closest('div'));if(ref)ref.before(wrap);else ok.before(wrap);
  const cnqSel=()=>dw.querySelectorAll('.cnqp input[type=checkbox]:checked,[data-cnqu]:checked,.cnqt input[type=checkbox]:checked').length;
  const desenha=()=>{if(ofA()!=='profissional'){wrap.innerHTML='';return}const d=disc();const ae=document.activeElement;const foco=ae&&ae.dataset&&ae.dataset.mr!=null?[ae.dataset.mr,ae.dataset.mk,ae.selectionStart]:null;
    wrap.innerHTML=`<div class="ntmod"><div class="row" style="gap:8px"><b>${ic('layers',15)} Módulos de ${esc(d||'a disciplina')} <span class="req" aria-hidden="true">*</span></b><span class="sp1"></span><span class="mut" style="font-size:12px">cada módulo tem critérios e avaliação próprios</span></div>
      <div class="ntmr hd" aria-hidden="true"><span>N.º</span><span>Designação</span><span>Horas</span><span></span></div>
      ${rows.map((x,i)=>`<div class="ntmr"><span class="ntmn">${i+1}</span><input data-mr="${i}" data-mk="n" value="${esc(x.n)}" placeholder="${i===0?'ex.: Folha de cálculo':'ex.: Bases de dados'}" aria-label="Designação do módulo ${i+1}"><input data-mr="${i}" data-mk="h" value="${esc(x.h)}" inputmode="numeric" placeholder="h" aria-label="Horas do módulo ${i+1}"><button type="button" class="btn sm ico" data-mrx="${i}" aria-label="Retirar módulo ${i+1}" ${rows.length<2?'disabled':''}>${ic('x',12)}</button></div>`).join('')}
      <div class="row" style="gap:8px;margin-top:6px"><button type="button" class="btn sm" id="nt-modadd">${ic('plus',13)} Acrescentar Módulo</button><span class="mut" style="font-size:12px">Se escolher UC/UFCD do catálogo acima, também ficam como módulos.</span></div>
      <p class="lgerr" id="nt-moderr" role="alert"></p></div>`;
    wrap.querySelectorAll('[data-mr]').forEach(inp=>inp.oninput=()=>{rows[+inp.dataset.mr][inp.dataset.mk]=inp.value});
    wrap.querySelectorAll('[data-mrx]').forEach(b=>b.onclick=()=>{rows.splice(+b.dataset.mrx,1);desenha()});
    $('#nt-modadd').onclick=()=>{rows.push({n:'',h:''});desenha();const L=wrap.querySelectorAll('[data-mk="n"]');L[L.length-1].focus()};
    if(foco){const e=wrap.querySelector(`[data-mr="${foco[0]}"][data-mk="${foco[1]}"]`);if(e){e.focus();try{e.setSelectionRange(foco[2],foco[2])}catch(_){}}}};
  desenha();dw.addEventListener('click',e=>{if(e.target.closest('#nt-ofw'))setTimeout(desenha,30)});dw.addEventListener('change',e=>{if(e.target.id==='nt-disc'||e.target.id==='nt-outra')desenha()});
  ok.addEventListener('click',e=>{if(ofA()!=='profissional')return;const val=rows.filter(x=>x.n.trim());
    if(!val.length&&!cnqSel()){e.stopImmediatePropagation();e.preventDefault();const er=$('#nt-moderr');if(er)er.textContent='Indique pelo menos um módulo (designação e horas).';const f=wrap.querySelector('[data-mk="n"]');if(f)f.focus();toast('No ensino profissional a disciplina tem de ter módulos','erro');return}
    const a=A();const antes=new Set(a?a.turmas.map(t=>t.id):[]);const d=disc();const nome=(($('#nt-nome')||{}).value||'').trim();
    setTimeout(()=>{const a2=A();if(!a2)return;const novas=a2.turmas.filter(t=>!antes.has(t.id));if(!novas.length)return;
      novas.forEach(t=>{t.modulos=t.modulos||[];if(t.disciplina===d&&t.nome===nome)val.forEach((x,i)=>t.modulos.push({id:uid()+i,cod:String(t.modulos.length+1),nome:x.n.trim(),horas:+String(x.h).replace(/\D/g,'')||'',ini:'',fim:''}));modAtivar(t)});
      saveNow();try{go(VIEW)}catch(_){}const tp=novas.find(t=>t.disciplina===d);if(tp)toast(tp.modulos.length+' módulo(s) criados em '+tp.nome+' · '+tp.disciplina+' — cada um com avaliação própria','ok')},0)},true)}catch(e){console.warn(e)}return r}}


/* ===================== Mecanismo de Recuperação (MRA) por módulo — ensino profissional =====================
   A ficha original (folha A4 e PDF) é a mesma da app MRA: corre dentro de uma moldura, já preenchida com a turma,
   o formador, o formando, o módulo, as horas e as faltas. As fichas ficam guardadas na turma (t.mra[módulo][aluno]). */
const MRA_K={cur:'mra.atual.v1',reg:'mra.registos.v1',data:'mra.dados.v1',cfg:'mra.config.v1'};
let _mraHtml=null,_mraDef=null;
async function mraFonte(){if(_mraHtml)return _mraHtml;const h=await gunzipB64('mragz');if(!h)throw new Error('Este browser não consegue abrir a ficha MRA (sem descompressão).');_mraHtml=h;
  try{const i=h.indexOf('const DEFAULT_DATA=');const j=h.indexOf('\n',i);_mraDef=JSON.parse(h.slice(i+19,j).trim().replace(/;$/,''))}catch(_){_mraDef={cursos:[],formadores:[],disciplinas:[],modulos:[]}}return h}
const _nz=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const mraM=t=>t.mra=t.mra||{};
const mraCfgM=t=>t.mraCfg=t.mraCfg||{};
const mraAlLabel=a=>((a.processo||a.numInterno||a.num||'')+'').trim()?((a.processo||a.numInterno||a.num)+' - '+a.nome):a.nome;
const mraModLabel=m=>(m.cod?String(m.cod).padStart(/^\d+$/.test(m.cod)?3:0,'0')+' - ':'')+m.nome;
function mraCursoDef(t){const D=_mraDef||{cursos:[]};const cod=_nz(t.codigo||t.nome).split(' ')[0];return D.cursos.find(c=>_nz(c.nome).split(' ')[0]===cod)||D.cursos.find(c=>t.curso&&_nz(c.nome).includes(_nz(t.curso)))||null}
function mraCursoNome(t){const d=mraCursoDef(t);if(d)return d.nome;return [t.codigo||t.nome,t.curso||(t.cnq&&t.cnq.nome)||''].filter(Boolean).join(' - ')}
function mraFormador(){const D=_mraDef||{formadores:[]};const ps=[S.cfg.professor,profNome(S.cfg.professor)].map(_nz).filter(Boolean);if(!ps.length)return '';for(const p of ps){const L=D.formadores.find(f=>_nz(f).endsWith(p)||_nz(f).includes(p));if(L)return L}
  const w=ps[0].split(' ');const L=D.formadores.find(f=>{const z=_nz(f);return w.length>1&&z.includes(w[0])&&z.endsWith(w[w.length-1])});return L||S.cfg.professor}
function mraDisc(t){const D=_mraDef||{disciplinas:[]};const d=_nz(t.disciplina);return D.disciplinas.find(x=>_nz(x.replace(/^\s*\d+\s+-\s+/,''))===d)||D.disciplinas.find(x=>_nz(x).endsWith(d))||t.disciplina}
/* faltas do aluno nas datas do módulo (tempos registados na ficha do aluno e nas presenças das aulas) */
function mraFaltas(t,a,m){if(!m.ini&&!m.fim)return null;const ini=m.ini||'0000',fim=m.fim||'9999';
  return (a.faltasAl||[]).filter(f=>(f.tipo==='injust'||f.tipo==='just'||!f.tipo)&&f.data>=ini&&f.data<=fim).reduce((s,f)=>s+(+f.tempos||1),0)}
const mraCalc=(h,f)=>{h=parseFloat(h)||0;f=parseFloat(f)||0;const lim=Math.ceil(h/10-1e-9),ex=f-lim;return {lim,ex:ex>0?ex:0}};
function mraFichaNova(t,a,m){const k=mraCalc(m.horas,mraFaltas(t,a,m)||0);const disc=mraDisc(t),mod=mraModLabel(m);const n=Math.max(1,Math.min(k.ex||1,51));
  return {id:uid(),curso:mraCursoNome(t),formador:mraFormador(),formando:mraAlLabel(a),tipo:ofertaDe(t)==='profij'||/^UC/i.test(m.cod||'')?'UFCD/Unidade':'Módulo',horas:+m.horas||25,faltas:mraFaltas(t,a,m)||0,exame:'Não',data:isoHoje(),
    rows:Array.from({length:n},()=>({dt:'',disc,mod,ativ:'',parecer:''})),atualizado:null}}
function mraDados(t,m){const D=_clone(_mraDef||{cursos:[],formadores:[],disciplinas:[],modulos:[]});const c=mraCfgM(t);const d=mraCursoDef(t);const nome=mraCursoNome(t);
  const cur={nome,projeto:projetoDe(t),orientador:c.orientador!=null?c.orientador:(d?d.orientador:''),genero:c.genero||(d?d.genero:'F'),formandos:alunosAval(t).map(mraAlLabel)};
  D.cursos=D.cursos.filter(x=>x.nome!==nome);D.cursos.unshift(cur);const f=mraFormador();if(f&&!D.formadores.includes(f))D.formadores.unshift(f);
  const di=mraDisc(t);if(!D.disciplinas.includes(di))D.disciplinas.unshift(di);(t.modulos||[]).map(mraModLabel).reverse().forEach(x=>{if(!D.modulos.includes(x))D.modulos.unshift(x)});return D}
/* abrir a ficha original numa moldura, por cima da app */
async function mraAbrir(t,m,a){let html;try{html=await mraFonte()}catch(e){return toast(e.message,'erro')}
  const M=mraM(t);M[m.id]=M[m.id]||{};let F=M[m.id][a.id];if(!F){F=mraFichaNova(t,a,m)}else{F=_clone(F);F.formando=mraAlLabel(a);F.curso=mraCursoNome(t)}
  const ant={};Object.values(MRA_K).forEach(k=>{ant[k]=localStorage.getItem(k)});
  const reg=(M[m.id]._reg||[]);try{localStorage.setItem(MRA_K.cur,JSON.stringify(F));localStorage.setItem(MRA_K.data,JSON.stringify(mraDados(t,m)));localStorage.setItem(MRA_K.reg,JSON.stringify(Object.values(M[m.id]).filter(x=>x&&x.id&&x.guardada)));
    localStorage.setItem(MRA_K.cfg,JSON.stringify({anoModo:'manual',anoManual:(A()&&/^\d{4}\/\d{4}$/.test(A().nome)?A().nome:'')||''}))}catch(e){return toast('Sem espaço no browser para abrir a ficha','erro')}
  const css=`<style id="ef-mra">#side{display:none!important}#b-novo{display:none!important}#bar{padding-left:16px}</style>`;
  const doc=html.replace('</head>',css+'</head>');
  const o=document.createElement('div');o.id='mraov';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Ficha MRA');
  const k=mraCalc(F.horas,F.faltas);
  o.innerHTML=`<div class="mrah"><button class="btn" type="button" id="mra-x">${ic('arrowL',16)} Voltar</button><div class="mrat"><b>${esc(a.nome)}</b><span>${esc(mraModLabel(m))} · ${esc(t.nome)} · ${esc(t.disciplina)}</span></div><span class="sp1"></span><span class="tag ${k.ex?'':'ok'}" id="mra-ex">${k.ex?'Excesso: '+k.ex+' h':'Sem reposição'}</span><span class="mut mras" id="mra-st">guardado automaticamente</span></div>
    <iframe id="mra-if" title="Ficha do Mecanismo de Recuperação" srcdoc=""></iframe>`;
  document.body.appendChild(o);document.body.classList.add('mra-on');const fr=o.querySelector('#mra-if');fr.srcdoc=doc;
  const guardar=()=>{try{const v=JSON.parse(localStorage.getItem(MRA_K.cur)||'null');if(!v)return;const R=JSON.parse(localStorage.getItem(MRA_K.reg)||'[]');v.guardada=R.some(x=>x.id===v.id)||!!(M[m.id][a.id]&&M[m.id][a.id].guardada);
      const vaz=!v.rows||!v.rows.some(r=>r.dt||r.ativ||r.parecer);const mud=JSON.stringify(v)!==JSON.stringify(F);if(!mud&&!M[m.id][a.id])return;M[m.id][a.id]=v;F=_clone(v);save();
      const kk=mraCalc(v.horas,v.faltas);const ex=$('#mra-ex');if(ex){ex.textContent=kk.ex?'Excesso: '+kk.ex+' h':'Sem reposição';ex.classList.toggle('ok',!kk.ex)}const st=$('#mra-st');if(st)st.textContent=v.guardada?'ficha guardada':vaz?'rascunho':'guardado automaticamente'}catch(e){console.warn(e)}};
  const onSt=e=>{if(e.key===MRA_K.cur||e.key===MRA_K.reg)guardar()};addEventListener('storage',onSt);const iv=setInterval(guardar,1500);
  const fechar=()=>{guardar();clearInterval(iv);removeEventListener('storage',onSt);document.removeEventListener('keydown',kb,true);Object.entries(ant).forEach(([k,v])=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(_){}});
    o.remove();document.body.classList.remove('mra-on');try{manterPosicao(()=>go(VIEW))}catch(_){go(VIEW)}};
  const kb=e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();fechar()}};document.addEventListener('keydown',kb,true);
  o.querySelector('#mra-x').onclick=fechar;setTimeout(()=>o.querySelector('#mra-x').focus(),50)}
/* vista: Turma › Recuperação (MRA) */
function vMra(){const t=T();if(!t)return go('turmas');const U=unidMod(t);const v=$('#view');
  if(!ehModular(t)){v.innerHTML=`<div class="card empty">${ic('layers',30)}<br><b>Só para turmas do ensino profissional e PROFIJ</b><br><span class="mut">O Mecanismo de Recuperação é feito por ${U.um}.</span></div>`;return}
  const M=t.modulos||[];if(!M.length){v.innerHTML=`<div class="card empty">${ic('layers',30)}<br><b>Esta turma ainda não tem ${U.p.toLowerCase()}</b><br><button class="btn pri" style="margin-top:10px" data-goview="modulos">${ic('plus',15)} Criar ${U.p}</button></div>`;v.querySelector('[data-goview]').onclick=()=>go('modulos');return}
  if(!_mraDef)mraFonte().then(()=>{if(VIEW==='mra')manterPosicao(vMra)}).catch(()=>{});
  const m=modAtivo(t);const al=alunosAval(t);const MM=(mraM(t)[m.id])||{};const c=mraCfgM(t);const d=_mraDef?mraCursoDef(t):null;const lim=mraCalc(m.horas,0).lim;const hj=isoHoje();
  const L=al.map(a=>{const F=MM[a.id];const auto=mraFaltas(t,a,m);const f=F?+F.faltas||0:(auto||0);const k=mraCalc(F?F.horas:m.horas,f);return {a,F,f,auto,k}});
  const nEx=L.filter(x=>x.k.ex).length,nG=L.filter(x=>x.F&&x.F.guardada).length,nR=L.filter(x=>x.F&&!x.F.guardada).length,hRec=L.reduce((s,x)=>s+x.k.ex,0);
  const fl=UI.mraF||'todos';const LL=fl==='ex'?L.filter(x=>x.k.ex):fl==='ficha'?L.filter(x=>x.F):L;
  barBtns([{id:'b-mrm',t:ic('pencil',15)+' Editar '+U.s,f:()=>{try{moduloDlg(t,m)}catch(_){go('modulos')}}},{id:'b-mrc',t:ic('download',15)+' Exportar CSV',f:()=>download('MRA '+t.nome+' '+(m.cod||'')+' '+m.nome+'.csv',csv([['N.º','Formando(a)','Horas','Faltas','Limite','Excesso','Ficha'],...L.map(x=>[x.a.num||'',x.a.nome,m.horas||'',x.f,lim,x.k.ex,x.F?(x.F.guardada?'Guardada':'Rascunho'):''])]),'text/csv')},{id:'b-mrp',t:ic('printer',15)+' Imprimir Lista',f:()=>window.print()}]);
  const dur=m.ini&&m.fim?Math.max(1,diasEntre(m.ini,m.fim)):null;const dec=dur&&hj>=m.ini?Math.min(100,Math.round(diasEntre(m.ini,hj<m.fim?hj:m.fim)/dur*100)):0;
  const ini=n=>{const w=n.split(' ').filter(Boolean);return ((w[0]||'?')[0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase()};
  v.innerHTML=`${!t.porModulo?`<div class="modbar mramods" role="group" aria-label="${U.s}"><span class="modl">${ic('layers',15)} ${U.s}</span><div class="modch">${M.map((x,i)=>{const n=Object.values((mraM(t)[x.id])||{}).filter(F=>F&&mraCalc(F.horas,F.faltas).ex).length;return `<button type="button" class="modc ${x===m?'on':''}" data-mrasel="${x.id}" aria-pressed="${x===m}"><b>${esc(x.cod||String(i+1))}</b><span>${esc(x.nome)}</span><small>${x.horas?x.horas+' h':'sem horas'}${n?' · '+n+' MRA':''}</small></button>`}).join('')}</div></div>`:''}
    <div class="mralay"><div class="mramain">
    <section class="card mrahero"><div class="mrahl"><span class="mracod">${esc(m.cod||'—')}</span><div><h2>${esc(m.nome)}</h2><p class="mut">${esc(t.nome)} · ${esc(t.disciplina)}${t.curso?' · '+esc(t.curso):''}</p></div></div>
      <div class="mraf3"><label><span>Horas</span><input id="mr-h" inputmode="numeric" value="${esc(m.horas||'')}" placeholder="ex.: 25" class="${m.horas?'':'falta'}"></label><label><span>Início</span><input type="date" id="mr-i" value="${esc(m.ini||'')}"></label><label><span>Fim</span><input type="date" id="mr-f" value="${esc(m.fim||'')}"></label>
        <div class="mralim"><span>Limite de faltas</span><b>${m.horas?lim+' h':'—'}</b><small>10% das horas, arredondado para cima</small></div></div>
      ${dur?`<div class="mraprog"><span class="dprog lg"><i style="width:${dec}%"></i></span><small>${hj<m.ini?'começa a '+fmtIso(m.ini):hj>m.fim?'terminou a '+fmtIso(m.fim):dec+'% do tempo do '+U.um+' decorrido'}</small></div>`:`<p class="mranote">${ic('info',14)} Indique o início e o fim para as faltas registadas nesse intervalo serem contadas automaticamente.</p>`}
      ${!m.horas?`<p class="mranote warn">${ic('alert',14)} Sem horas definidas, não é possível calcular o limite nem o excesso.</p>`:''}</section>
    <div class="dkps mrakp"><div class="dkp"><span class="dkl">${ic('alert',15)} Com excesso</span><b class="dkv ${nEx?'bad':''}">${nEx}<small>/${al.length}</small></b><span class="dks">alunos acima do limite</span></div>
      <div class="dkp"><span class="dkl">${ic('clock',15)} A recuperar</span><b class="dkv">${hRec}<small> h</small></b><span class="dks">soma dos excessos</span></div>
      <div class="dkp"><span class="dkl">${ic('check',15)} Fichas</span><b class="dkv">${nG}<small> guardadas</small></b><span class="dks">${nR} em rascunho</span></div>
      <div class="dkp"><span class="dkl">${ic('file',15)} Por fazer</span><b class="dkv ${L.filter(x=>x.k.ex&&!x.F).length?'bad':''}">${L.filter(x=>x.k.ex&&!x.F).length}</b><span class="dks">alunos com excesso sem ficha</span></div></div>
    <section class="card"><div class="row" style="gap:10px;flex-wrap:wrap;margin-bottom:10px"><h2 style="margin:0">${ic('users',18)} Formandos</h2><span class="sp1"></span><div class="dseg" role="radiogroup" aria-label="Filtrar">${[['todos','Todos',L.length],['ex','Com excesso',nEx],['ficha','Com ficha',nG+nR]].map(([k,n,c])=>`<button type="button" role="radio" aria-checked="${fl===k}" class="${fl===k?'on':''}" data-mrafl="${k}">${n} <span class="mrac">${c}</span></button>`).join('')}</div></div>
      ${!al.length?`<div class="empty" style="padding:22px">${ic('users',26)}<br><b>Ainda sem alunos nesta turma</b><br><button class="btn pri" style="margin-top:10px" data-goview="alunos">${ic('plus',14)} Acrescentar Alunos</button></div>`:!LL.length?`<p class="mut" style="padding:10px 4px">Nenhum aluno neste filtro.</p>`:
      `<ul class="mral">${LL.map(({a,F,f,auto,k})=>{const pc=lim?Math.min(100,f/(lim*2)*100):0;const fo=fotoSrc(a);return `<li class="${k.ex?'ex':''}"><span class="mrav">${fo?`<img src="${fo}" alt="">`:esc(ini(a.nome))}</span><div class="mran"><b>${esc(a.nome)}</b><small>${a.num?'n.º '+esc(numAl(a)):''}${auto!=null&&!F?' · faltas contadas automaticamente':''}</small></div>
        <div class="mrafw"><button type="button" class="btn sm ico" data-mrad="${a.id}" data-dlt="-1" aria-label="Menos uma falta">−</button><input class="mraf" data-mraf="${a.id}" value="${esc(f)}" inputmode="numeric" aria-label="Faltas de ${esc(a.nome)}"><button type="button" class="btn sm ico" data-mrad="${a.id}" data-dlt="1" aria-label="Mais uma falta">+</button></div>
        <div class="mram" title="${f} h de faltas · limite ${lim} h"><span class="mrab"><i style="width:${pc}%"></i><b style="left:50%"></b></span><small>${f} / ${lim} h</small></div>
        <span class="mrae">${k.ex?`<span class="tag bad">+${k.ex} h</span>`:'<span class="tag ok">ok</span>'}</span>
        <span class="mras">${F?(F.guardada?`<span class="tag ok">${ic('check',11)} Guardada</span>`:'<span class="tag">Rascunho</span>'):'<span class="mut">—</span>'}</span>
        <span class="mraa"><button class="btn sm ${k.ex&&!F?'pri':''}" data-mraab="${a.id}">${ic('file',13)} ${F?'Abrir':'Ficha'}</button>${F?`<button class="btn sm ico" data-mradel="${a.id}" aria-label="Apagar ficha de ${esc(a.nome)}">${ic('trash',13)}</button>`:''}</span></li>`}).join('')}</ul>`}
    </section></div>
    <aside class="mraside"><section class="card"><div class="row" style="gap:8px;margin-bottom:10px"><h2 style="margin:0">${ic('gear',16)} Dados da Ficha</h2><span class="sp1"></span><button class="btn sm" type="button" id="mra-edt">${ic('pencil',13)} Editar Turma</button></div>
      <dl class="mradl"><dt>Projeto N.º</dt><dd>${projetoDe(t)?esc(projetoDe(t)):'<span class="bad">por definir</span>'} <span class="mut">(${esc(A().nome)})</span></dd>
      <dt>Curso</dt><dd>${esc(_mraDef?mraCursoNome(t):(turmaDado(t,'cursoFicha')||'…'))}</dd>
      <dt>${turmaDado(t,'genero')==='M'?'Orientador':'Orientadora'}</dt><dd>${turmaDado(t,'orientador')?esc(turmaDado(t,'orientador')):'<span class="bad">por definir</span>'}</dd>
      <dt>Formador(a)</dt><dd>${esc(_mraDef?mraFormador():profNome(S.cfg.professor)||'')}</dd><dt>Disciplina</dt><dd>${esc(_mraDef?mraDisc(t):t.disciplina)}</dd></dl>
      <p class="mut" style="font-size:12px;margin:10px 0 0">Estes dados vêm das definições da turma (comuns a todas as disciplinas da turma neste ano letivo).</p></section>
      <section class="card mrahow"><h2 style="margin:0 0 8px">${ic('info',16)} Como Funciona</h2><ol><li>As faltas acima de <b>10% das horas</b> do ${U.um} têm de ser recuperadas.</li><li>O excesso define o número de linhas (sessões) da ficha.</li><li><b>Ficha</b> abre a folha oficial já preenchida; imprima ou exporte em PDF para assinar.</li><li>As fichas ficam guardadas na turma, por ${U.um} e por aluno.</li></ol></section></aside></div>`;
  const re=()=>manterPosicao(vMra);
  v.querySelectorAll('[data-mrasel]').forEach(b=>b.onclick=()=>{modEscolher(t,b.dataset.mrasel);vMra()});
  v.querySelectorAll('[data-mrafl]').forEach(b=>b.onclick=()=>{UI.mraF=b.dataset.mrafl;re()});
  v.querySelectorAll('[data-goview]').forEach(b=>b.onclick=()=>go(b.dataset.goview));
  [['mr-h','horas',x=>+String(x).replace(/\D/g,'')||''],['mr-i','ini',x=>x],['mr-f','fim',x=>x]].forEach(([id,k,f])=>{const e=$('#'+id);if(e)e.onchange=()=>{m[k]=f(e.value);save();re()}});
  const setF=(a,val)=>{const MMm=mraM(t)[m.id]=mraM(t)[m.id]||{};val=Math.max(0,val);if(MMm[a.id]){MMm[a.id].faltas=val;const k=mraCalc(MMm[a.id].horas,val);const R=MMm[a.id].rows||[];const r0=R[0]||{};while(R.length<Math.min(k.ex||1,51))R.push({dt:'',disc:r0.disc||'',mod:r0.mod||'',ativ:'',parecer:''})}else{MMm[a.id]=Object.assign(mraFichaNova(t,a,m),{faltas:val});const k=mraCalc(MMm[a.id].horas,val);const r0=MMm[a.id].rows[0];MMm[a.id].rows=Array.from({length:Math.max(1,Math.min(k.ex||1,51))},()=>({...r0}))}save();re()};
  v.querySelectorAll('[data-mraf]').forEach(i=>i.onchange=()=>setF(al.find(x=>x.id===i.dataset.mraf),+String(i.value).replace(',','.')||0));
  v.querySelectorAll('[data-mrad]').forEach(b=>b.onclick=()=>{const a=al.find(x=>x.id===b.dataset.mrad);const cur=L.find(x=>x.a===a).f;setF(a,cur+(+b.dataset.dlt))});
  v.querySelectorAll('[data-mraab]').forEach(b=>b.onclick=()=>{const a=al.find(x=>x.id===b.dataset.mraab);const MMm=mraM(t)[m.id]=mraM(t)[m.id]||{};if(!MMm[a.id]){const f=L.find(x=>x.a===a).f;const F=mraFichaNova(t,a,m);F.faltas=f;const k=mraCalc(F.horas,f);F.rows=Array.from({length:Math.max(1,Math.min(k.ex||1,51))},()=>({...F.rows[0]}));MMm[a.id]=F;save()}mraAbrir(t,m,a)});
  v.querySelectorAll('[data-mradel]').forEach(b=>b.onclick=()=>{const a=al.find(x=>x.id===b.dataset.mradel);if(!confirm('Apagar a ficha MRA de '+a.nome+' neste '+U.um+'?'))return;delete mraM(t)[m.id][a.id];save();re()});
  {const e=$('#mra-edt');if(e)e.onclick=()=>{editarTurmaDlg(t);const obs=new MutationObserver(()=>{if(!$('#drawer.on')){obs.disconnect();if(VIEW==='mra')manterPosicao(vMra)}});obs.observe($('#drawer'),{attributes:true,attributeFilter:['class']})}}}
TITLES.mra='Recuperação (MRA)';NEEDS_T.push('mra');MOD_VISTAS.add('mra');
{const _gR=go;go=function(v){const r=_gR.apply(this,arguments);if(go._f&&!go._f.mra)go._f.mra=vMra;try{navMra()}catch(_){}return r}}
function navMra(){const t=T();const on=!!t&&ehModular(t);$$('#side [data-v="mra"],#tnavHold [data-v="mra"]').forEach(b=>{b.hidden=!on;b.style.display=on?'':'none'})}
{const h=$('#tnavHold');const ref=h&&h.querySelector('[data-v="modulos"]');if(ref&&!h.querySelector('[data-v="mra"]')){ref.insertAdjacentHTML('afterend',`<button class="nav tnav" data-v="mra" title="Mecanismo de Recuperação (faltas por módulo)" hidden><span data-ico="refresh"></span><span class="lbl">Recuperação (MRA)</span></button>`);const b=h.querySelector('[data-v="mra"] [data-ico]');if(b)b.innerHTML=ic('refresh',18);h.querySelector('[data-v="mra"]').onclick=()=>go('mra')}}
/* atalho na lista de módulos */
{const _vmR=vModulos;vModulos=function(){const r=_vmR.apply(this,arguments);try{const t=T();if(t&&ehModular(t)&&(t.modulos||[]).length){$$('#view table.modlst tbody tr').forEach((tr,i)=>{const m=t.modulos[i];const cel=tr.lastElementChild;if(m&&cel&&!cel.querySelector('[data-modmra]'))cel.insertAdjacentHTML('afterbegin',`<button class="btn sm ico" data-modmra="${m.id}" title="Mecanismo de Recuperação (MRA)" aria-label="Recuperação de ${esc(m.nome)}">${ic('refresh',14)}</button>`)});
  $$('[data-modmra]').forEach(b=>b.onclick=()=>{modEscolher(t,b.dataset.modmra);go('mra')})}}catch(e){console.warn(e)}return r}}
AJUDA.push({id:'mra',ic:'refresh',t:'Mecanismo de Recuperação (MRA) por módulo',gif:null,txt:`<p>Nas turmas do ensino profissional, Turma › <b>Recuperação (MRA)</b> mostra, para cada módulo, as faltas de cada aluno, o limite (10% das horas, arredondado para cima) e o excesso. <b>Preencher Ficha</b> abre a ficha oficial do Mecanismo de Recuperação (a mesma folha da app MRA, com Imprimir e Exportar PDF), já com o curso, o formador, o formando, a disciplina, o módulo, as horas e as faltas. A ficha guarda-se sozinha na turma.</p>`});


/* botão de bloqueio também na barra de cima */
function bloqBarBtn(){const aj=$('#ajBtn');if(!aj)return;let b=$('#bloqBar');const tem=S.anos.some(a=>a.turmas.length);
  if(!tem){if(b)b.remove();return}if(!b){aj.insertAdjacentHTML('beforebegin','<button class="btn ico" id="bloqBar" type="button"></button>');b=$('#bloqBar');b.onclick=()=>bloqAlternar(!bloqOn())}
  const on=bloqOn();b.classList.toggle('bloqon',on);b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'Dados de base bloqueados — desbloquear':'Bloquear dados de base');b.title=on?'Dados de base bloqueados — toque para desbloquear':'Bloquear turmas, alunos, critérios, horários e calendário';b.innerHTML=ic(on?'cadeado':'cadeadoAb',18)}
{const _bu=bloqUI;bloqUI=function(){const r=_bu.apply(this,arguments);try{bloqBarBtn()}catch(_){}return r}}
setTimeout(()=>{try{bloqBarBtn()}catch(_){}},60);


/* avisos: também o que há de especial hoje (aniversários, feriados, dias nacionais e internacionais, fim de semana) */
function avisosHoje(){const d=new Date(),iso=isoHoje(),md=iso.slice(5);const V=avVistos(),agora=Date.now();const ok=k=>!(V[k]&&V[k]>agora);const out=[];const add=(k,o)=>{k='h:'+iso+':'+k;if(ok(k))out.push({k,...o})};
  try{const p=perfil();if(p.nascimento&&p.nascimento.slice(5)===md)add('anos',{ic:'sparkle',cor:'#d4a20b',t:'Hoje é o seu aniversário! Parabéns 🎂',s:'Um dia para celebrar — o trabalho pode esperar.'})}catch(_){}
  const a=A();if(a){const N=[];a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.nasc&&x.nasc.slice(5)===md&&x.frequenta!==false&&!N.some(n=>n.id===x.id))N.push({id:x.id,n:x.nome.split(' ')[0]+' '+(x.nome.split(' ').slice(-1)[0]||''),t:t.nome})}));
    if(N.length)add('alanos',{ic:'users',cor:'#7a4fd0',t:N.length===1?'Aniversário de '+N[0].n:N.length+' aniversários de alunos',s:N.slice(0,5).map(x=>x.n+' ('+x.t+')').join(' · ')+(N.length>5?' …':''),ir:()=>go('alunos')});
    const cal=a.calendario;const tp=cal&&cal.dias&&cal.dias[iso];const nota=cal&&cal.notas&&cal.notas[iso];if(tp&&tp!=='letivo'&&TIPOS_DIA[tp])add('cal',{ic:'flag',cor:'#c0392b',t:nomeTipo(tp),s:nota||'Calendário escolar',ir:()=>go('calendario')})}
  const todos=[...(DIAS_COMEM[md]||[])];(diasMoveis(d.getFullYear())[iso]||[]).forEach(n=>{if(!todos.some(c=>_normD(c)===_normD(n)))todos.push(n)});
  const nac=todos.filter(n=>tipoEfem(n)!=='int'),int=todos.filter(n=>tipoEfem(n)==='int');
  if(nac.length)add('nac',{ic:'flag',cor:'#0a5aa8',t:nac.length===1?nac[0]:'Dias nacionais',s:nac.length===1?'Dia nacional':nac.join(' · ')});
  if(int.length)add('int',{ic:'globo',cor:'#0f766e',t:int.length===1?int[0]:'Dias internacionais',s:int.length===1?'Dia internacional':int.join(' · ')});
  const pz=piadaHoje(d);if(pz)add('pz',{ic:'sparkle',cor:'#f59e0b',t:pz,s:d.getDay()===0?'É domingo':'É sábado'});
  return out}
{const _auH=avisosUrgentes;avisosUrgentes=function(){const L=_auH.apply(this,arguments)||[];try{L.push(...avisosHoje())}catch(e){console.warn(e)}return L}}


