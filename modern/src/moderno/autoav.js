/* ===================== Autoavaliação dos alunos pelo telemóvel (QR code ou link + código) =====================
   O professor abre uma sessão temporária (turma + período); o aluno aponta o telemóvel ao QR code (ou abre o link e escreve o código),
   escolhe o seu número e faz a autoavaliação. As respostas chegam sozinhas ao Perfil de Aprendizagem de cada aluno.
   Tudo vai cifrado com uma chave que sai do código: a base de dados nunca vê nomes nem respostas. Pode desligar-se nas Definições. */
const AA_ALF='23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const aaLigado=()=>S.cfg.autoavTlm!==false;
const aaHex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function aaChaves(code){const te=new TextEncoder();const id=aaHex(await crypto.subtle.digest('SHA-256',te.encode('es-aa-id:'+code))).slice(0,40);
  const base=await crypto.subtle.importKey('raw',te.encode(code),'PBKDF2',false,['deriveKey']);
  const k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:te.encode('es-aa-k:'+id),iterations:150000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);return {id,k}}
const _aaK=new Map();async function aaCh(code){if(!_aaK.has(code))_aaK.set(code,aaChaves(code));return _aaK.get(code)}
async function aaCifrar(o,k){const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(JSON.stringify(o)));return 'A1.'+b64(iv)+'.'+b64(ct)}
async function aaDecifrar(s,k){const p=String(s).split('.');const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(p[1])},k,unb64(p[2]));return JSON.parse(new TextDecoder().decode(pt))}
function aaCodigo(n){n=n||8;const o=[];while(o.length<n){const b=crypto.getRandomValues(new Uint8Array(16));for(const x of b){if(x<248&&o.length<n)o.push(AA_ALF[x%31])}}return o.join('')}
/* v0.942 · papel para o ano todo: cada turma tem um código fixo e cada aluno o seu código pessoal (vão no QR code do papel de cada aluno) */
const aaAtivos=t=>t.alunos.filter(a=>a.frequenta!==false).sort((a,b)=>(+a.num||0)-(+b.num||0));
function aaTurmaCod(t){if(!t.autoavCod){t.autoavCod=aaCodigo(8);t.autoavCodQ=Date.now();t.autoavCh={};t.autoavImp=[];save()}return t.autoavCod}
function aaChave(t,aid){t.autoavCh=t.autoavCh||{};if(!t.autoavCh[aid]){t.autoavCh[aid]=aaCodigo(5);save()}return t.autoavCh[aid]}
const aaUrlAluno=(t,a)=>aaUrl(aaTurmaCod(t))+'.'+a.id+'.'+aaChave(t,a.id);
const _aaVers=new Map();
const aaFmt=c=>c.slice(0,4)+'-'+c.slice(4);
const aaUrl=c=>location.origin+location.pathname.replace(/[^/]*$/,'')+'aluno.html#'+c;
const aaCurto=n=>{const p=String(n||'').trim().split(/\s+/);return p.length>1?p[0]+' '+p[p.length-1][0]+'.':p[0]||''};
const aaErro=e=>{const m=(e&&e.message)||String(e);if(/does not exist|schema cache|PGRST20[25]|42P01/i.test(m+(e&&e.code||'')))return 'A base de dados ainda não está preparada para a autoavaliação pelo telemóvel. O administrador tem de correr uma vez o script «0004_autoavaliacao_alunos.sql» no Supabase.';return m};
const aaSb=async()=>(await sbObter()).cliente;
const aaSess=t=>{t.autoavTlm=Array.isArray(t.autoavTlm)?t.autoavTlm:[];return t.autoavTlm};
async function aaQrLib(){if(window.qrcode)return;await new Promise((ok,ko)=>{const s=document.createElement('script');s.src='esm/qrcode-1.4.4.min.js';s.onload=ok;s.onerror=()=>ko(new Error('Não foi possível carregar o gerador de QR code.'));document.head.appendChild(s)})}
function aaQR(txt){const q=window.qrcode(0,'M');q.addData(txt);q.make();const n=q.getModuleCount(),m=2;let d='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(q.isDark(y,x))d+=`M${x+m} ${y+m}h1v1h-1z`;
  return `<svg viewBox="0 0 ${n+2*m} ${n+2*m}" role="img" aria-label="QR code da autoavaliação" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`}
/* abrir uma sessão */
async function aaAbrir(t,p,q,min,pes){pes=pes===undefined?(t.autoavModo!=='geral'):!!pes;for(const s0 of [...aaSess(t)]){try{await aaFechar(t,s0)}catch(_){}}const code=aaTurmaCod(t);aaAtivos(t).forEach(a=>aaChave(t,a.id));const {id,k}=await aaCh(code);const sec=isSec(t);
  const D={v:2,pes:pes?1:0,t:t.nome,d:t.disciplina,p,pn:perNome(p),W:perW(),esc:sec?'20':'5',prof:S.cfg.professor||'',q,dom:(t.dominios||[]).map(d=>({id:d.id,n:d.nome})),
    al:t.alunos.filter(a=>a.frequenta!==false).sort((a,b)=>(+a.num||0)-(+b.num||0)).map(a=>({id:a.id,n:a.num||'',nm:aaCurto(a.nome)}))};
  const expira=new Date(Date.now()+min*60000).toISOString();const sb=await aaSb();
  const linha={id,dados:await aaCifrar(D,k),expira};let r=await sb.from('eduspruce_autoav').insert(linha);
  if(r.error&&(r.error.code==='23505'||/duplicate key/i.test(r.error.message||''))){await sb.from('eduspruce_autoav').delete().eq('id',id);r=await sb.from('eduspruce_autoav').insert(linha)}
  if(r.error)throw new Error(aaErro(r.error));
  const s={code,p,pes:pes?1:0,q,criado:Date.now(),expira:Date.parse(expira),n:0,vistos:[],esc:{}};aaSess(t).push(s);save();try{audit('Avaliação','Autoavaliação pelo telemóvel aberta',t.nome+' · '+perNome(p))}catch(_){}return s}
/* trazer as respostas para o Perfil de Aprendizagem */
async function aaImportar(t,s){const {id,k}=await aaCh(s.code);const sb=await aaSb();const r=await sb.from('eduspruce_autoav_resp').select('id,conteudo').eq('sessao',id).order('id');
  if(r.error)throw new Error(aaErro(r.error));const ult={},V={},rej=[];s.esc=s.esc||{};
  for(const x of r.data||[]){try{const o=await aaDecifrar(x.conteudo,k);if(!o||!o.aid)continue;
    if(s.pes&&(!o.k||o.k!==((t.autoavCh||{})[o.aid]))){rej.push({aid:o.aid,n:o.n,q:o.q});continue}
    (V[o.aid]=V[o.aid]||[]).push(o)}catch(_){}}
  Object.keys(V).forEach(aid=>{const L=V[aid].sort((a,b)=>a.q-b.q);const esc=s.esc[aid];ult[aid]=(esc&&L.find(o=>o.q===esc))||L[L.length-1]});
  _aaVers.set(s.code,V);s.rej=rej.map(x=>({n:x.n,q:x.q}));s.dup=Object.keys(V).filter(aid=>V[aid].length>1);
  /* sugestões para as aulas: guardadas sem o nome do aluno (só uma marca para substituir se o aluno corrigir) */
  {t.autoavSug=Array.isArray(t.autoavSug)?t.autoavSug:[];let mud=false;for(const aid in ult){const o=ult[aid];const txt=String(o.sug||'').trim().slice(0,800);const h=nvHash(aid+'|'+s.code+'|'+s.p+'|'+(s.criado||0));const i=t.autoavSug.findIndex(x=>x.h===h);
      if(!txt){if(i>=0){t.autoavSug.splice(i,1);mud=true}continue}if(i>=0){if(t.autoavSug[i].txt!==txt){t.autoavSug[i]={...t.autoavSug[i],txt,q:o.q};mud=true}}else{t.autoavSug.push({h,p:s.p,q:o.q,txt});mud=true}}if(mud)save()}
  let novos=0;const vis=new Set(s.vistos||[]);
  for(const aid in ult){const a=t.alunos.find(z=>z.id===aid);if(!a)continue;const o=ult[aid];const AV=autoD(a,s.p);if(AV.alunoQ===o.q){vis.add(aid);continue}
    const dom={};(t.dominios||[]).forEach(d=>{const v=+((o.dom||{})[d.id]);if(v>=1&&v<=4)dom[d.id]=v});
    Object.assign(AV.dom,dom);if(o.nota)AV.nota=String(o.nota).slice(0,5);if(o.forte)AV.forte=String(o.forte).slice(0,600);if(o.melhorar)AV.melhorar=String(o.melhorar).slice(0,600);
    const pl=o.plano||{};AV.plano=AV.plano||{};['meta','estr','apoio'].forEach(c=>{if(pl[c])AV.plano[c]=String(pl[c]).slice(0,600)});
    if(AV.nota){a.autoav=a.autoav||{};a.autoav[s.p]=AV.nota}AV.data=isoHoje();AV.origem='aluno';AV.alunoQ=o.q;vis.add(aid);novos++}
  s.vistos=[...vis];s.n=s.vistos.length;if(novos)save();return novos}
async function aaFechar(t,s){try{await aaImportar(t,s)}catch(_){}const {id}=await aaCh(s.code);const sb=await aaSb();await sb.from('eduspruce_autoav').delete().eq('id',id);
  const L=aaSess(t);const i=L.indexOf(s);if(i>=0)L.splice(i,1);save()}
async function aaMais(t,s,min){const {id}=await aaCh(s.code);const sb=await aaSb();const ex=new Date(Math.max(Date.now(),s.expira)+min*60000);const r=await sb.from('eduspruce_autoav').update({expira:ex.toISOString()}).eq('id',id);if(r.error)throw new Error(aaErro(r.error));s.expira=+ex;save()}
/* ao abrir a app: traz respostas que chegaram entretanto e arruma as sessões que já expiraram */
async function aaVerificarTodas(){if(!window.__esPronto)return;const a=A();if(!a)return;for(const t of a.turmas){for(const s of [...aaSess(t)]){try{const n=await aaImportar(t,s);if(n)toast(n+' autoavaliação(ões) recebida(s) · '+t.nome,'ok');if(Date.now()>s.expira)await aaFechar(t,s)}catch(e){console.warn('[EduSpruce] autoavaliação:',e.message)}}}}
setTimeout(function aaCiclo(){aaVerificarTodas().finally(()=>setTimeout(aaCiclo,120000))},8000);

/* janela do professor */
function aaSugHtml(t,p){const L=(Array.isArray(t.autoavSug)?t.autoavSug:[]).filter(x=>!p||x.p===p).sort((a,b)=>b.q-a.q);
  if(!L.length)return `<p class="mut aasugv">Ainda não há sugestões${p?' neste '+esc(perW().toLowerCase()):''}.</p>`;
  return `<ul class="aasugl">${L.map(x=>`<li><span>${esc(x.txt)}</span><small class="mut">${esc(perNome(x.p))} · ${new Date(x.q).toLocaleDateString('pt-PT',{day:'numeric',month:'short'})}</small></li>`).join('')}</ul>`}
/* folha com um papel por aluno (QR code pessoal + código), para recortar; serve o ano todo */
async function aaFolha(t,soNovos){await aaQrLib();const cod=aaTurmaCod(t);let L=aaAtivos(t);const imp=new Set(t.autoavImp||[]);if(soNovos)L=L.filter(a=>!imp.has(a.id));
  if(!L.length)return toast('Não há alunos novos para imprimir.','aviso');
  const host=location.host||'eduspruce.pt';$$('#aafolha').forEach(x=>x.remove());const f=document.createElement('div');f.id='aafolha';
  f.innerHTML=`<div class="aaf-bar"><b>${ic('printer',16)} Papéis da autoavaliação · ${esc(t.nome)} · ${esc(t.disciplina)}</b><span class="mut">${L.length} aluno${L.length>1?'s':''} · recorte pelas linhas · cada aluno guarda o seu para o ano todo</span><span class="sp1"></span><button type="button" class="btn pri" id="aaf-imp">${ic('printer',15)} Imprimir</button><button type="button" class="btn" id="aaf-x">Fechar</button></div>
    <div class="aaf-g">${L.map(a=>`<div class="aaf-p"><div class="aaf-q">${aaQR(aaUrlAluno(t,a))}</div><div class="aaf-t"><div class="aaf-k">Autoavaliação · ${esc(t.disciplina)}</div><div class="aaf-n">N.º ${esc(a.num||'')} · ${esc(aaCurto(a.nome))}</div><div class="aaf-c">${esc(t.nome)}</div>
      <div class="aaf-i">Aponta a câmara ao código. Sem câmara: <b>${esc(host)}/aluno.html</b> · turma <b>${esc(aaFmt(cod))}</b> · o teu código <b class="aaf-pc">${esc(aaChave(t,a.id))}</b></div><div class="aaf-g2">Guarda este papel: serve para todas as autoavaliações deste ano. Não o mostres aos colegas.</div></div></div>`).join('')}</div>`;
  const dl=[...document.querySelectorAll('dialog.aadlg[open]')];dl.forEach(x=>{try{x.close()}catch(_){}});
  document.body.appendChild(f);document.body.classList.add('aa-folha');
  const sai=()=>{f.remove();document.body.classList.remove('aa-folha');dl.forEach(x=>{if(x.isConnected)try{x.showModal()}catch(_){}})};f.querySelector('#aaf-x').onclick=sai;
  f.querySelector('#aaf-imp').onclick=()=>{t.autoavImp=[...new Set([...(t.autoavImp||[]),...L.map(a=>a.id)])];save();setTimeout(()=>window.print(),60)};
  try{audit('Avaliação','Papéis da autoavaliação gerados',t.nome+' · '+L.length+' aluno(s)')}catch(_){}}
async function aaPainel(){const t=T();if(!t)return toast('Escolha primeiro uma turma.','erro');if(!aaLigado())return toast('A autoavaliação pelo telemóvel está desligada (Definições › Geral › Módulos Opcionais).','erro');
  if(!window.__esPronto)return toast('Os dados ainda estão a abrir. Tente dentro de momentos.','erro');
  $$('dialog.aadlg').forEach(d=>d.remove());const d=document.createElement('dialog');d.className='aadlg';d.setAttribute('aria-labelledby','aa-t');document.body.appendChild(d);
  let tm=null;const fim=()=>{clearInterval(tm);try{d.close()}catch(_){}d.remove();if(VIEW)try{go(VIEW)}catch(_){}};
  d.addEventListener('cancel',e=>{e.preventDefault();fim()});
  const ativos=aaAtivos(t);
  const formulario=(msg)=>{clearInterval(tm);const np=periodos().length||3,pa=perAtual(t);const imp=new Set(t.autoavImp||[]);const novos=t.autoavCod?ativos.filter(a=>!imp.has(a.id)).length:ativos.length;
    d.innerHTML=`<form class="aaw" onsubmit="return false"><header class="aah"><h2 id="aa-t">${ic('users',18)} Autoavaliação pelo Telemóvel</h2><button type="button" class="btn ico" id="aa-x" aria-label="Fechar">${ic('x',16)}</button></header>
      <p class="mut">${esc(t.nome)} · ${esc(t.disciplina)} · ${ativos.length} alunos. Cada aluno tem um <b>papel com o seu QR code</b>, para o ano todo. Quando abrir a autoavaliação, os alunos apontam a câmara ao seu papel e respondem; só cada aluno consegue responder por si. As respostas aparecem no <b>Perfil de Aprendizagem</b>.</p>
      <section class="aabox"><h3>${ic('printer',15)} 1. Papéis dos alunos (imprimir uma vez)</h3>
        <p class="mut" style="margin:0 0 8px">${t.autoavCod?`Código da turma <b>${esc(aaFmt(t.autoavCod))}</b> · criado a ${esc(new Date(t.autoavCodQ||Date.now()).toLocaleDateString('pt-PT'))}${novos?` · <b>${novos}</b> aluno${novos>1?'s':''} ainda sem papel impresso`:' · todos os alunos têm papel'}`:'Ainda não foram criados os papéis desta turma.'}</p>
        <div class="row aaa"><button type="button" class="btn" id="aa-fol">${ic('printer',15)} ${t.autoavCod?'Imprimir os Papéis':'Criar e Imprimir os Papéis'}</button>${t.autoavCod&&novos&&novos<ativos.length?`<button type="button" class="btn" id="aa-foln">Imprimir Só os Novos (${novos})</button>`:''}${t.autoavCod?`<button type="button" class="btn" id="aa-reg" title="Os papéis antigos deixam de funcionar">${ic('refresh',15)} Códigos Novos</button>`:''}</div></section>
      <section class="aabox"><h3>${ic('sparkle',15)} 2. Abrir a autoavaliação</h3>
      <div class="aag"><div><label for="aa-p">${esc(perW())}</label><select id="aa-p">${Array.from({length:np},(_,i)=>`<option value="${i+1}" ${i+1===pa?'selected':''}>${esc(perNome(i+1))}</option>`).join('')}</select></div>
      <div><label for="aa-m">Fica aberta durante</label><select id="aa-m"><option value="20">20 minutos</option><option value="45" selected>45 minutos</option><option value="90">90 minutos</option><option value="1440">24 horas</option><option value="4320">3 dias</option><option value="10080">7 dias</option></select></div></div>
      <fieldset class="aaq"><legend>O que os alunos respondem</legend>
        <label class="chk"><input type="checkbox" id="aa-qd" checked> Nível em cada domínio (1 a 4)</label>
        <label class="chk"><input type="checkbox" id="aa-qn" checked> Classificação que propõem</label>
        <label class="chk"><input type="checkbox" id="aa-qr" checked> O que fizeram bem e o que podem melhorar</label>
        <label class="chk"><input type="checkbox" id="aa-qp" checked> Compromisso para o próximo ${esc(perW().toLowerCase())}</label>
        <label class="chk"><input type="checkbox" id="aa-qs" checked> Sugestões para as aulas <span class="mut">(aparecem aqui sem o nome do aluno)</span></label></fieldset>
      <fieldset class="aaq"><legend>Como os alunos se identificam</legend>
        <label class="chk"><input type="radio" name="aa-modo" value="pes" ${t.autoavModo!=='geral'?'checked':''}> <span><b>Com o código pessoal</b> do papel <span class="mut">— só o próprio aluno pode responder por si</span></span></label>
        <label class="chk"><input type="radio" name="aa-modo" value="geral" ${t.autoavModo==='geral'?'checked':''}> <span><b>Só com o código da turma</b> <span class="mut">— cada aluno escolhe o seu número, sem código pessoal (confia que escolhe o certo)</span></span></label></fieldset>
      <p class="nverr" role="alert">${esc(msg||'')}</p>
      <div class="row aaa"><button type="button" class="btn" id="aa-c">Cancelar</button><button type="button" class="btn pri" id="aa-ok">${ic('sparkle',15)} Abrir a Autoavaliação</button></div></section>
      <details class="aabox"><summary><b>${ic('chat',15)} Sugestões dos alunos para as aulas</b> <span class="mut">(${(t.autoavSug||[]).length})</span></summary>${aaSugHtml(t,0)}</details>
      <p class="hint">Só a lista «n.º · primeiro nome e inicial» vai para o telemóvel dos alunos, cifrada. A app confirma o código pessoal de cada resposta; ninguém vê as respostas dos colegas.</p></form>`;
    d.querySelector('#aa-x').onclick=fim;d.querySelector('#aa-c').onclick=fim;
    d.querySelector('#aa-fol').onclick=async()=>{try{const novo=!t.autoavCod;aaTurmaCod(t);await aaFolha(t,false);if(novo)formulario()}catch(e){toast(aaErro(e),'erro')}};
    const fn=d.querySelector('#aa-foln');if(fn)fn.onclick=()=>aaFolha(t,true).catch(e=>toast(aaErro(e),'erro'));
    const rg=d.querySelector('#aa-reg');if(rg)rg.onclick=async()=>{if(!confirm('Gerar códigos novos para esta turma?\n\nOs papéis que os alunos já têm deixam de funcionar e é preciso imprimir papéis novos.'))return;
      for(const s0 of [...aaSess(t)]){try{await aaFechar(t,s0)}catch(_){}}delete t.autoavCod;t.autoavCh={};t.autoavImp=[];aaTurmaCod(t);save();try{audit('Avaliação','Códigos da autoavaliação renovados',t.nome)}catch(_){}toast('Códigos novos criados. Imprima os papéis novos.','ok');formulario()};
    d.querySelector('#aa-ok').onclick=async()=>{const b=d.querySelector('#aa-ok');b.disabled=true;b.innerHTML=ic('refresh',15)+' A abrir…';
      const q={dom:d.querySelector('#aa-qd').checked,nota:d.querySelector('#aa-qn').checked,forte:d.querySelector('#aa-qr').checked,melhorar:d.querySelector('#aa-qr').checked,plano:d.querySelector('#aa-qp').checked,sug:d.querySelector('#aa-qs').checked};
      const md=(d.querySelector('input[name=aa-modo]:checked')||{}).value||'pes';t.autoavModo=md==='geral'?'geral':'pes';save();
      try{await aaQrLib();const s=await aaAbrir(t,+d.querySelector('#aa-p').value,q,+d.querySelector('#aa-m').value,md!=='geral');aberta(s)}catch(e){formulario(aaErro(e))}}};
  const aberta=s=>{const url=aaUrl(s.code);
    d.innerHTML=`<div class="aaw aaon"><header class="aah"><h2 id="aa-t">${ic('users',18)} ${esc(t.nome)} · ${esc(perNome(s.p))} · <span class="aaab">aberta</span></h2><button type="button" class="btn ico" id="aa-x" aria-label="Fechar a janela (a autoavaliação continua aberta)">${ic('x',16)}</button></header>
      <div class="aaqr"><div class="aaqi">${aaQR(url)}</div><div class="aaqt">${s.pes?`<p class="aadica"><b>Os alunos apontam a câmara ao seu papel.</b></p><p class="mut">Quem não tiver o papel aponta a este código (ou abre <b>${esc(url.replace(/#.*$/,'').replace(/^https?:\/\//,''))}</b> e escreve o código da turma), escolhe o número e escreve o seu código pessoal.</p>`:`<p class="aadica"><b>Os alunos apontam a câmara a este código.</b></p><p class="mut">Ou abrem <b>${esc(url.replace(/#.*$/,'').replace(/^https?:\/\//,''))}</b> e escrevem o código da turma. Depois escolhem o seu número — <b>sem código pessoal</b>. Quem tiver o papel também pode usá-lo.</p>`}<p class="aamodo"><span class="tag ${s.pes?'':'ok'}">${s.pes?'Com código pessoal':'Só com o código da turma'}</span> <button type="button" class="btn sm" id="aa-modo">${s.pes?'Deixar responder sem código pessoal':'Voltar a exigir o código pessoal'}</button></p><p class="aacod" aria-label="Código da turma ${esc(s.code.split('').join(' '))}">${esc(aaFmt(s.code))}</p>
        <p class="aaest"><b id="aa-n">0</b> de ${ativos.length} responderam · <span id="aa-exp"></span></p></div></div>
      <div class="aavis" id="aa-vis"></div><div id="aa-av"></div>
      ${s.q&&s.q.sug===false?'':`<details class="aabox" id="aa-sugd"><summary><b>${ic('chat',15)} Sugestões para as aulas</b> <span class="mut" id="aa-sugn"></span></summary><div id="aa-sug"></div></details>`}
      <div class="row aaa"><button type="button" class="btn" id="aa-fs">${ic('grid',15)} Ecrã Inteiro</button><button type="button" class="btn" id="aa-cp">${ic('copy',15)} Copiar Link</button><button type="button" class="btn" id="aa-mais">+30 min</button><span class="sp1"></span><button type="button" class="btn dng" id="aa-fim">${ic('check',15)} Fechar e Guardar</button></div></div>`;
    const atual=()=>{const n=s.vistos||[];d.querySelector('#aa-n').textContent=n.length;const r=Math.max(0,s.expira-Date.now());
      d.querySelector('#aa-exp').textContent=r<=0?'fechada':r<3600e3?'fecha dentro de '+Math.ceil(r/60000)+' min':'fecha '+new Date(s.expira).toLocaleString('pt-PT',{weekday:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
      d.querySelector('#aa-vis').innerHTML=ativos.map(a=>`<span class="${n.includes(a.id)?'ok':''}" title="${esc(a.nome)}">${esc(a.num||'')}</span>`).join('');
      /* avisos: códigos errados e alunos que responderam mais de uma vez (o professor escolhe a versão) */
      const V=_aaVers.get(s.code)||{};const nm=aid=>{const a=t.alunos.find(z=>z.id===aid);return a?'N.º '+(a.num||'')+' · '+aaCurto(a.nome):'?'};let h='';
      if((s.rej||[]).length){const g={};s.rej.forEach(x=>{g[x.n]=(g[x.n]||0)+1});h+=`<div class="alert aarej">${ic('alert',15)} <span><b>${s.rej.length} resposta${s.rej.length>1?'s':''} recusada${s.rej.length>1?'s':''}</b> — código pessoal errado (alguém tentou responder por outro aluno?): ${Object.entries(g).map(([n,c])=>'n.º '+esc(n)+(c>1?' ('+c+'×)':'')).join(', ')}. Não foram guardadas.</span></div>`}
      (s.dup||[]).forEach(aid=>{const L=(V[aid]||[]).slice().sort((a,b)=>a.q-b.q);if(L.length<2)return;const usa=(s.esc||{})[aid]||L[L.length-1].q;
        h+=`<div class="aadup"><b>${esc(nm(aid))}</b> respondeu ${L.length} vezes — escolha a que fica: ${L.map(o=>`<button type="button" class="btn sm ${o.q===usa?'pri':''}" data-aadup="${esc(aid)}" data-q="${o.q}">${new Date(o.q).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}${o.nota?' · nota '+esc(o.nota):''}${o.q===usa?' ✓':''}</button>`).join(' ')}</div>`});
      const av=d.querySelector('#aa-av');av.innerHTML=h;av.querySelectorAll('[data-aadup]').forEach(b=>b.onclick=async()=>{s.esc=s.esc||{};s.esc[b.dataset.aadup]=+b.dataset.q;save();try{await aaImportar(t,s)}catch(_){}atual();toast('Ficou a resposta das '+b.textContent.replace(' ✓','').split(' · ')[0],'ok')});
      const sg=d.querySelector('#aa-sug');if(sg){sg.innerHTML=aaSugHtml(t,s.p);const n2=(t.autoavSug||[]).filter(x=>x.p===s.p).length;d.querySelector('#aa-sugn').textContent='('+n2+')'}};
    const puxar=async()=>{try{const k=await aaImportar(t,s);atual();if(k)toast(k===1?'Chegou 1 autoavaliação':'Chegaram '+k+' autoavaliações','ok')}catch(e){console.warn(e)}if(Date.now()>s.expira){clearInterval(tm);atual()}};
    atual();clearInterval(tm);tm=setInterval(puxar,4000);puxar();
    d.querySelector('#aa-x').onclick=fim;
    d.querySelector('#aa-fs').onclick=()=>{d.classList.toggle('aafs');const w=d.querySelector('.aaw');try{if(!document.fullscreenElement&&w.requestFullscreen)w.requestFullscreen();else if(document.fullscreenElement)document.exitFullscreen()}catch(_){}};
    d.querySelector('#aa-cp').onclick=async()=>{try{await navigator.clipboard.writeText(url+'\nCódigo da turma: '+aaFmt(s.code));toast(s.pes?'Link copiado (cada aluno precisa também do seu código pessoal)':'Link copiado (os alunos só precisam de escolher o número)','ok')}catch(_){prompt('Copie:',url)}};
    {const bm=d.querySelector('#aa-modo');if(bm)bm.onclick=async()=>{const novo=!s.pes;if(!novo&&!confirm('Deixar os alunos responderem só com o código da turma?\n\nCada aluno escolhe o seu número sem código pessoal: confia que escolhe o certo.'))return;
      bm.disabled=true;bm.textContent='A mudar…';try{if(tm){clearInterval(tm);tm=0}const min=Math.max(5,Math.ceil((s.expira-Date.now())/60000));t.autoavModo=novo?'pes':'geral';const s2=await aaAbrir(t,s.p,s.q,min,novo);toast(novo?'Volta a ser preciso o código pessoal':'Agora basta o código da turma','ok');aberta(s2)}catch(e){bm.disabled=false;toast(aaErro(e),'erro')}}}
    d.querySelector('#aa-mais').onclick=async()=>{try{await aaMais(t,s,30);atual();if(!tm)tm=setInterval(puxar,4000);toast('Mais 30 minutos','ok')}catch(e){toast(aaErro(e),'erro')}};
    d.querySelector('#aa-fim').onclick=async()=>{const b=d.querySelector('#aa-fim');b.disabled=true;try{await aaFechar(t,s);toast('Autoavaliação fechada: '+(s.n||0)+' resposta(s) guardada(s) no Perfil de Aprendizagem. Os papéis continuam a servir na próxima.','ok');fim()}catch(e){b.disabled=false;toast(aaErro(e),'erro')}}};
  const ab=aaSess(t).find(s=>Date.now()<s.expira);try{d.showModal()}catch(_){d.setAttribute('open','')}
  if(ab){try{await aaQrLib();aberta(ab)}catch(e){formulario(aaErro(e))}}else formulario()}

/* botões: barra da turma e Perfil de Aprendizagem */
{const _g=go;go=function(v){const r=_g.apply(this,arguments);try{if(aaLigado()&&window.__esPronto&&['alunos'].includes(VIEW)&&T()){const bx=$('#barx');if(bx&&!bx.querySelector('#b-aatlm')){const b=document.createElement('button');b.className='btn';b.id='b-aatlm';const ab=aaSess(T()).some(s=>Date.now()<s.expira);b.innerHTML=ic('users',15)+(ab?' Autoavaliação (aberta)':' Autoavaliação pelo Telemóvel');if(ab)b.classList.add('pri');b.onclick=aaPainel;bx.appendChild(b)}}}catch(e){console.warn(e)}return r}}
{const _pA=perfilAluno;perfilAluno=function(){const r=_pA.apply(this,arguments);try{const liga=()=>{const h=document.querySelector('#perfilap .pauto h2');if(h&&aaLigado()&&!h.querySelector('.aapb')){h.insertAdjacentHTML('beforeend',` <button type="button" class="btn sm aapb">${ic('users',13)} Pedir pelo Telemóvel</button>`);h.querySelector('.aapb').onclick=()=>{const o=$('#perfilap');if(o)o.remove();document.body.classList.remove('perfil-on');aaPainel()}}
    const o=$('#perfilap');if(o&&!o.dataset.aamo){o.dataset.aamo=1;new MutationObserver(liga).observe(o,{childList:true,subtree:true})}};liga()}catch(e){console.warn(e)}return r}}
/* Definições › Dados e Segurança: ligar/desligar */
{const _vD=vDefinicoes;vDefinicoes=function(){const r=_vD.apply(this,arguments);try{const mods=$('#view #def-mods');if(mods&&!$('#aa-on')){const c=mods;
    c.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px" id="aa-def"><input type="checkbox" id="aa-on" ${aaLigado()?'checked':''}> ${ic('users',15)} <span><b>Autoavaliação dos Alunos pelo Telemóvel</b><br><span class="mut">Os alunos fazem a autoavaliação no telemóvel por QR code (ou link e código); as respostas chegam ao Perfil de Aprendizagem. Sem contas para os alunos.</span></span></label>`);
    c.querySelector('#aa-on').onchange=async e=>{S.cfg.autoavTlm=e.target.checked;save();if(!e.target.checked){let n=0;for(const an of S.anos)for(const t of an.turmas)for(const s of [...aaSess(t)]){try{await aaFechar(t,s);n++}catch(_){}}toast('Autoavaliação pelo telemóvel desligada'+(n?' · '+n+' sessão(ões) fechada(s) e respostas guardadas':''),'ok')}else toast('Autoavaliação pelo telemóvel ligada','ok')}}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
(()=>{const st=document.createElement('style');st.textContent=`
dialog.aadlg{border:0;border-radius:22px;padding:0;width:min(760px,96vw);max-height:94vh;overflow:auto;background:var(--panel);color:var(--ink);box-shadow:0 30px 80px rgba(0,0,0,.35)}dialog.aadlg::backdrop{background:rgba(10,20,35,.55)}
.aaw{padding:20px 22px;display:flex;flex-direction:column;gap:10px}.aah{display:flex;align-items:center;gap:10px}.aah h2{margin:0;flex:1;font-size:19px;display:flex;gap:8px;align-items:center;text-transform:none;color:var(--ink)}
.aag{display:grid;grid-template-columns:1fr 1fr;gap:10px}.aag label{display:block;font-size:13px;color:var(--mut);margin-bottom:4px}.aag select{width:100%}
.aaq{border:1px solid var(--line);border-radius:14px;padding:10px 14px;display:grid;gap:6px}.aaq legend{font-size:13px;color:var(--mut);padding:0 4px}
.aaa{gap:8px;flex-wrap:wrap}.aamodo{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:4px 0 0}.aaa .btn{min-height:44px}
.aaqr{display:grid;grid-template-columns:minmax(220px,340px) 1fr;gap:22px;align-items:center}.aaqi{background:#fff;border-radius:16px;padding:8px;border:1px solid var(--line)}.aaqi svg{display:block;width:100%;height:auto}
.aaqt p{margin:0 0 6px}.aaurl{font-weight:700;font-size:18px;word-break:break-all}.aacod{font:800 clamp(30px,6vw,52px)/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;color:var(--acc);margin:4px 0 10px!important}
.aaest{font-size:15px}.aaest b{font-size:20px}
.aavis{display:flex;flex-wrap:wrap;gap:6px}.aavis span{min-width:34px;height:34px;padding:0 6px;border-radius:9px;display:grid;place-items:center;font-weight:700;font-size:14px;background:var(--bg);color:var(--mut);border:1px solid var(--line)}.aavis span.ok{background:#16a34a;color:#fff;border-color:#16a34a}
.aabox{border:1px solid var(--line);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:8px}.aabox h3{margin:0;font-size:15px;display:flex;gap:6px;align-items:center;text-transform:none;color:var(--ink)}details.aabox summary{cursor:pointer;display:flex;gap:6px;align-items:center}
.aasugl{margin:6px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;max-height:260px;overflow:auto}.aasugl li{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:10px;background:var(--bg)}.aasugl small{font-size:12px}
.aaab{font-size:12px;font-weight:800;background:#16a34a;color:#fff;border-radius:999px;padding:3px 9px;text-transform:uppercase;letter-spacing:.04em}.aadica{font-size:17px}
.aarej{display:flex;gap:8px;align-items:flex-start}.aadup{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#d97706 10%,var(--panel));border:1px solid color-mix(in srgb,#d97706 35%,var(--line))}
#aafolha{position:fixed;inset:0;z-index:100001;background:#eef2f5;overflow:auto;color:#111}.aaf-bar{position:sticky;top:0;display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 16px;background:#fff;border-bottom:1px solid #d6e0e6;z-index:2}.aaf-bar .mut{color:#5b6b77;font-size:13px}
.aaf-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:0;max-width:820px;margin:16px auto;background:#fff}
.aaf-p{display:grid;grid-template-columns:30mm 1fr;gap:3mm;align-items:center;padding:4mm;border:1px dashed #9aa7b1;break-inside:avoid;page-break-inside:avoid;min-height:44mm;box-sizing:border-box;font:11px/1.3 system-ui,-apple-system,sans-serif;color:#111}
.aaf-q svg{width:30mm;height:30mm;display:block}.aaf-k{font-size:9.5px;text-transform:uppercase;letter-spacing:.05em;color:#555}.aaf-n{font-size:14px;font-weight:800;margin:1px 0}.aaf-c{font-size:11px;color:#333;margin-bottom:3px}.aaf-i{font-size:9.5px;color:#222}.aaf-pc{font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.06em}.aaf-g2{font-size:8.5px;color:#666;margin-top:3px}
@media print{body.aa-folha>*:not(#aafolha){display:none!important}body.aa-folha #aafolha{position:static;background:#fff;overflow:visible}.aaf-bar{display:none!important}.aaf-g{grid-template-columns:repeat(3,1fr);max-width:none;margin:0}@page{size:A4;margin:8mm}}
dialog.aadlg.aafs{width:100vw;max-width:100vw;height:100vh;max-height:100vh;border-radius:0}.aafs .aaqr{grid-template-columns:minmax(300px,48vh) 1fr}.aaw:fullscreen{background:var(--panel);justify-content:center;padding:4vh 5vw}.aaw:fullscreen .aaqr{grid-template-columns:minmax(300px,62vh) 1fr}.aaw:fullscreen .aacod{font-size:clamp(48px,8vw,96px)}.aaw:fullscreen .aaurl{font-size:clamp(20px,2.4vw,32px)}
@media (max-width:640px){.aag{grid-template-columns:1fr}.aaqr{grid-template-columns:1fr}.aaqi{max-width:300px;margin:0 auto}.aaqt{text-align:center}dialog.aadlg{width:100vw;max-width:100vw;max-height:100dvh;height:100dvh;border-radius:0}.aaa .btn{flex:1 1 calc(50% - 8px);justify-content:center}.aaa .sp1{display:none}}
.pauto h2 .aapb{margin-left:auto;font-size:12.5px}body.est-sge dialog.aadlg,body.est-sge .aaqi{border-radius:0}`;document.head.appendChild(st)})();
/* Painel da Turma: botão «Autoavaliação» por cima dos períodos */
{const _vP=vPainel;vPainel=function(){const r=_vP.apply(this,arguments);try{const sg=$('#view .seg[aria-label="Período"]:not(.pmper)');if(sg&&aaLigado()&&T()&&!$('#pn-aa')){const cx=document.createElement('div');cx.className='pnaa';sg.before(cx);
  const b=document.createElement('button');b.type='button';b.id='pn-aa';const ab=aaSess(T()).some(s=>Date.now()<s.expira);b.className='btn'+(ab?' pri':'');b.title='Os alunos fazem a autoavaliação no telemóvel (QR code ou link + código)';b.innerHTML=ic('users',15)+(ab?' Autoavaliação (aberta)':' Autoavaliação');b.onclick=aaPainel;cx.append(b,sg)}}catch(e){console.warn(e)}return r};if(go._f)go._f.painel=vPainel}
{const st=document.createElement('style');st.textContent='.pnaa{display:flex;flex-direction:column;align-items:flex-end;gap:8px}@media (max-width:700px){.pnaa{align-items:stretch;width:100%}}';document.head.appendChild(st)}
/* Avaliação: botão «Autoavaliação» ao lado de «Bloquear o período» */
function aaBotaoAv(){try{const bq=$('#view #av-bloq');if(!bq||$('#av-aa')||!aaLigado()||!T())return;const ab=aaSess(T()).some(s=>Date.now()<s.expira);
  const b=document.createElement('button');b.type='button';b.id='av-aa';b.className='btn sm'+(ab?' pri':'');b.style.marginLeft='0';b.title='Os alunos fazem a autoavaliação no telemóvel (QR code ou link + código)';b.innerHTML=ic('users',14)+(ab?' Autoavaliação (aberta)':' Autoavaliação');b.onclick=aaPainel;bq.after(b)}catch(e){console.warn(e)}}
{const _vAv=vAvaliacao;vAvaliacao=function(){const r=_vAv.apply(this,arguments);aaBotaoAv();return r};if(go._f)go._f.avaliacao=vAvaliacao}
{let _aat=0;new MutationObserver(()=>{if(VIEW!=='avaliacao')return;cancelAnimationFrame(_aat);_aat=requestAnimationFrame(aaBotaoAv)}).observe(document.documentElement,{childList:true,subtree:true})}
