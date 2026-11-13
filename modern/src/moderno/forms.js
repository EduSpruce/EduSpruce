/* ===================== EduSpruce Forms — formulários e testes online (ao estilo do Microsoft Forms) =====================
   O professor cria formulários ou testes (quiz) com escolha, texto, classificação, data, ordenação, Likert, NPS e secções com saltos;
   os alunos respondem no telemóvel por QR code ou link + código; as respostas chegam cifradas (como na autoavaliação: a base de dados
   nunca vê o conteúdo) e os testes corrigem-se sozinhos; as classificações entram na avaliação como instrumento. */
if(!ICONS.eye)ICONS.eye='<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
if(!ICONS.send)ICONS.send='<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>';
const FM_TIPOS=[['escolha','list','Escolha'],['texto','pen','Texto'],['classif','star','Classificação'],['data','calendar','Data'],['ordem','layers','Ordenação'],['likert','grid','Likert'],['nps','chart','Net Promoter Score®'],['secao','flag','Secção'],['info','info','Texto ou imagem']];
const FM_CORES=['#0f6cbd','#038387','#107c10','#8764b8','#c239b3','#d13438','#ca5010','#986f0b','#5c2e91','#004e8c'];
const fmOn=()=>S.cfg.formsOn!==false;
const FMS=()=>S.forms=Array.isArray(S.forms)?S.forms:[];
const fmQ=(tipo)=>{const q={id:uid(),tipo,titulo:'',sub:'',obrig:false,pts:0};
  if(tipo==='escolha')Object.assign(q,{ops:[{id:uid(),t:'Opção 1'},{id:uid()+'b',t:'Opção 2'}],multi:false,outra:false,baralhar:false,lista:false});
  if(tipo==='texto')Object.assign(q,{longo:false,num:null,resp:[]});
  if(tipo==='classif')Object.assign(q,{n:5,simb:'estrela',lbl:['','']});
  if(tipo==='ordem')Object.assign(q,{ops:[{id:uid(),t:'Opção 1'},{id:uid()+'b',t:'Opção 2'},{id:uid()+'c',t:'Opção 3'}]});
  if(tipo==='likert')Object.assign(q,{ops:['Discordo totalmente','Discordo','Neutro','Concordo','Concordo totalmente'],linhas:[{id:uid(),t:'Afirmação 1'},{id:uid()+'b',t:'Afirmação 2'}]});
  if(tipo==='secao')Object.assign(q,{salto:''});
  return q};
function fmNovo(quiz){const f={id:uid(),titulo:quiz?'Teste sem título':'Formulário sem título',desc:'',quiz:!!quiz,cor:FM_CORES[quiz?3:0],itens:[fmQ('escolha')],
  defs:{baralhar:false,umaResp:true,mostrar:quiz?'publicar':'nunca',iniciar:'',terminar:'',tempo:0,agradecimento:'',pes:true,numerar:true},criado:Date.now(),alterado:Date.now(),resp:[],sess:[],ligacao:{}};
  if(quiz)f.itens[0].pts=1;FMS().unshift(f);save();return f}
const fmPts=f=>f.quiz?f.itens.reduce((s,q)=>s+(+q.pts||0),0):0;
const fmPerg=f=>f.itens.filter(q=>!['secao','info'].includes(q.tipo));
/* ---------- correção ---------- */
const fmNorm=s=>String(s==null?'':s).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ');
function fmCorrigir(f,q,v){if(!f.quiz||!(+q.pts))return null;const P=+q.pts;
  if(q.tipo==='escolha'){const certas=q.ops.filter(o=>o.certa).map(o=>o.id);if(!certas.length)return null;const esc=(Array.isArray(v)?v:[v]).filter(Boolean);
    if(!q.multi)return esc.length===1&&certas.includes(esc[0])?P:0;return esc.length===certas.length&&esc.every(x=>certas.includes(x))?P:0}
  if(q.tipo==='texto'){if(q.longo)return null;const R=(q.resp||[]).filter(x=>String(x).trim()!=='');if(!R.length)return null;
    if(q.num){const n=parseFloat(String(v).replace(',','.'));return R.some(r=>Math.abs(parseFloat(String(r).replace(',','.'))-n)<1e-9)?P:0}
    return R.some(r=>fmNorm(r)===fmNorm(v))?P:0}
  if(q.tipo==='ordem'){if(!Array.isArray(v))return 0;return v.join('|')===q.ops.map(o=>o.id).join('|')?P:0}
  return null}
function fmPontuar(f,r){let tot=0,pend=0;const pq={};fmPerg(f).forEach(q=>{const man=r.rev&&r.rev[q.id]&&r.rev[q.id].pts!=null&&r.rev[q.id].pts!=='';const a=man?+r.rev[q.id].pts:fmCorrigir(f,q,r.resp[q.id]);
    if(a==null){if(f.quiz&&+q.pts&&r.resp[q.id]!=null&&r.resp[q.id]!=='')pend++;pq[q.id]=null}else{pq[q.id]=a;tot+=a}});return {tot,pend,pq,max:fmPts(f)}}
/* ---------- sessão (como na autoavaliação, mas com outro prefixo de chave) ---------- */
async function fmChaves(code){const te=new TextEncoder();const id=aaHex(await crypto.subtle.digest('SHA-256',te.encode('es-fm-id:'+code))).slice(0,40);
  const base=await crypto.subtle.importKey('raw',te.encode(code),'PBKDF2',false,['deriveKey']);
  const k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:te.encode('es-fm-k:'+id),iterations:150000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);return {id,k}}
const _fmK=new Map();const fmCh=code=>{if(!_fmK.has(code))_fmK.set(code,fmChaves(code));return _fmK.get(code)};
const fmUrl=c=>location.origin+location.pathname.replace(/[^/]*$/,'')+'forms.html#'+c;
/* o que vai para o aluno: sem as respostas certas (a não ser que os resultados se mostrem logo ou já tenham sido publicados) */
const fmBaralhar=a=>{if(a.length<2)return a.slice();let b;do{b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}}while(b.every((x,i)=>x===a[i]));return b};
function fmPublico(f,comChave){return {titulo:f.titulo,desc:f.desc,cor:f.cor,quiz:f.quiz,defs:f.defs,itens:f.itens.map(q=>{const o=JSON.parse(JSON.stringify(q));
  if(!comChave){if(o.ops&&o.tipo==='escolha')o.ops.forEach(x=>{delete x.certa;delete x.fb});delete o.resp;delete o.fbg}
  if(o.tipo==='ordem'&&!comChave){o.ops=fmBaralhar(o.ops)}return o})}}
async function fmChaveRes(code,chave,aid){const te=new TextEncoder();const base=await crypto.subtle.importKey('raw',te.encode(String(chave).toUpperCase()+':'+code),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:te.encode('es-fm-r:'+aid),iterations:20000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function fmDadosSessao(f,t,s){const chave=f.defs.mostrar==='logo'||(!!f.publicado&&f.defs.mostrar!=='nunca');
  const D={v:1,f:fmPublico(f,chave),chave,t:t?t.nome:'',d:t?t.disciplina:'',prof:S.cfg.professor||'',pes:s.pes?1:0,ini:f.defs.iniciar||'',fim:f.defs.terminar||'',
    al:t?aaAtivos(t).map(a=>({id:a.id,n:a.num||'',nm:aaCurto(a.nome)})):[]};
  /* classificações publicadas: cada aluno só consegue abrir a sua (cifrada com o seu código pessoal) */
  if(f.publicado&&f.defs.mostrar!=='nunca'&&t&&s.pes){D.res={};for(const r of f.resp.filter(x=>x.tid===t.id&&x.aid)){const P=fmPontuar(f,r);
    const o={tot:P.tot,max:P.max,pq:P.pq,c:Object.fromEntries(Object.entries(r.rev||{}).map(([k,v])=>[k,v.c||'']).filter(x=>x[1])),resp:r.resp};
    D.res[r.aid]=await aaCifrar(o,await fmChaveRes(s.code,aaChave(t,r.aid),r.aid))}}
  return D}
async function fmBlob(f,t,s,k){const b=await aaCifrar(await fmDadosSessao(f,t,s),k);if(b.length>199000)throw new Error('O formulário é grande demais para enviar ('+Math.round(b.length/1000)+' kB de 199). Retire ou reduza imagens.');return b}
async function fmAbrir(f,t,min,pes){const code=aaCodigo(8);const {id,k}=await fmCh(code);if(t&&pes)aaAtivos(t).forEach(a=>aaChave(t,a.id));
  const s={code,tid:t?t.id:'',pes:!!pes,criado:Date.now(),expira:Date.now()+min*60000};const sb=await aaSb();
  const r=await sb.from('eduspruce_autoav').insert({id,dados:await fmBlob(f,t,s,k),expira:new Date(s.expira).toISOString()});if(r.error)throw new Error(aaErro(r.error));
  f.sess.push(s);save();try{audit('Forms','Recolha de respostas aberta',f.titulo+(t?' · '+t.nome:''))}catch(_){}return s}
async function fmAtualizarSessao(f,s){const t=s.tid&&A()?A().turmas.find(x=>x.id===s.tid):null;const {id,k}=await fmCh(s.code);const sb=await aaSb();
  const r=await sb.from('eduspruce_autoav').update({dados:await fmBlob(f,t,s,k)}).eq('id',id);if(r.error)throw new Error(aaErro(r.error))}
async function fmFechar(f,s){try{await fmImportar(f,s)}catch(_){}const {id}=await fmCh(s.code);const sb=await aaSb();await sb.from('eduspruce_autoav').delete().eq('id',id);f.sess=f.sess.filter(x=>x!==s);save()}
async function fmImportar(f,s){const {id,k}=await fmCh(s.code);const sb=await aaSb();const r=await sb.from('eduspruce_autoav_resp').select('id,conteudo').eq('sessao',id).order('id');if(r.error)throw new Error(aaErro(r.error));
  s.vistos=s.vistos||[];let n=0;const t=s.tid&&A()?A().turmas.find(x=>x.id===s.tid):null;
  for(const L of r.data||[]){if(s.vistos.includes(L.id))continue;s.vistos.push(L.id);let o;try{o=await aaDecifrar(L.conteudo,k)}catch(_){continue}if(!o||o.fm!==1)continue;
    let al=null;if(t&&o.aid){al=t.alunos.find(a=>a.id===o.aid);if(al&&s.pes&&String(o.chave||'').toUpperCase()!==String(aaChave(t,al.id)).toUpperCase())al=null}
    if(t&&s.pes&&!al)continue;
    const nova={id:uid(),sid:s.code,aid:al?al.id:'',tid:t?t.id:'',nome:al?al.nome:(o.nome||'Anónimo'),num:al?al.num:'',t0:o.t0||0,t1:o.t1||Date.now(),resp:o.resp||{},rev:{}};
    if(f.defs.umaResp&&nova.aid){const i=f.resp.findIndex(x=>x.aid===nova.aid&&x.tid===nova.tid);if(i>=0){nova.rev=f.resp[i].rev||{};f.resp.splice(i,1)}}
    f.resp.push(nova);n++}
  if(n)save();return n}
async function fmVerificarTodas(){if(!window.__esPronto)return;for(const f of FMS())for(const s of [...(f.sess||[])]){try{const n=await fmImportar(f,s);if(n)toast(n+' resposta(s) nova(s) · '+f.titulo,'ok');if(Date.now()>s.expira+3600000)await fmFechar(f,s)}catch(e){console.warn('[EduSpruce] forms:',e.message)}}}
setTimeout(function fmCiclo(){fmVerificarTodas().finally(()=>setTimeout(fmCiclo,90000))},12000);
/* ---------- vista ---------- */
TITLES.forms='Forms';
{const h=document.querySelector('#side [data-v="pulso"]')||document.querySelector('#side [data-v="arena"]')||document.querySelector('#side [data-v="recursos"]');if(h&&!document.querySelector('#side [data-v="forms"]')){h.insertAdjacentHTML('afterend',`<button class="nav" data-v="forms" title="Forms · formulários e testes online"><span data-ico="clipboard"></span><span class="lbl">Forms</span></button>`);const b=document.querySelector('#side [data-v="forms"]');b.querySelector('[data-ico]').innerHTML=ic('clipboard',18);b.onclick=()=>go('forms')}}
{const _gFm=go;go=function(v){if(v==='forms'&&!fmOn())v='inicio';if(go._f&&go._f.forms!==vForms)go._f.forms=vForms;const r=_gFm.call(this,v);try{$$('#side [data-v="forms"]').forEach(b=>{b.hidden=!fmOn();b.classList.toggle('on',VIEW==='forms')})}catch(_){}return r};go._f=_gFm._f;if(go._f)go._f.forms=vForms}
function vForms(){const v=$('#view');const f=UI.fmId&&FMS().find(x=>x.id===UI.fmId);if(f)return fmEditor(f);UI.fmId=null;
  barBtns([{id:'b-fmn',t:ic('plus',15)+' Novo Formulário',c:'pri',f:()=>{const x=fmNovo(false);UI.fmId=x.id;UI.fmTab='perg';vForms()}},{id:'b-fmq',t:ic('award',15)+' Novo Teste',f:()=>{const x=fmNovo(true);UI.fmId=x.id;UI.fmTab='perg';vForms()}}]);
  const q=(UI.fmQ||'').trim().toLowerCase();const L=FMS().filter(x=>!q||x.titulo.toLowerCase().includes(q));
  v.innerHTML=`<div class="fm"><section class="fmhero"><div><h2>${ic('clipboard',22)} Forms</h2><p class="mut">Formulários e testes online. Os alunos respondem no telemóvel por QR code ou código; os testes corrigem-se sozinhos e as classificações entram na avaliação.</p></div>
      <div class="fmnovos"><button class="fmnv" id="fm-nf">${ic('plus',22)}<b>Novo Formulário</b><small>inquéritos, fichas, autoavaliações</small></button><button class="fmnv q" id="fm-nq">${ic('award',22)}<b>Novo Teste</b><small>com pontos e correção automática</small></button></div></section>
    <div class="row" style="gap:8px;margin:12px 0"><input id="fm-q" placeholder="Procurar formulários e testes" value="${esc(UI.fmQ||'')}" style="max-width:360px"><span class="sp1"></span><span class="mut">${FMS().length} no total</span></div>
    ${L.length?`<div class="fmgr">${L.map(x=>{const n=x.resp.length,ab=(x.sess||[]).some(s=>Date.now()<s.expira);return `<article class="fmc" style="--fc:${x.cor}"><button class="fmcb" data-fmo="${x.id}"><span class="fmct">${ic(x.quiz?'award':'clipboard',16)} ${x.quiz?'Teste':'Formulário'}${ab?' · <b class="fmab">a receber</b>':''}</span><b>${esc(x.titulo)}</b><small>${n} resposta${n===1?'':'s'} · ${fmPerg(x).length} pergunta${fmPerg(x).length===1?'':'s'}${x.quiz?' · '+nf(fmPts(x))+' pts':''}</small><small class="mut">alterado ${new Date(x.alterado).toLocaleDateString('pt-PT')}</small></button>
        <div class="fmca"><button class="btn sm ghost" data-fmd="${x.id}" title="Duplicar">${ic('copy',14)}</button><button class="btn sm ghost" data-fmx="${x.id}" title="Apagar">${ic('trash',14)}</button></div></article>`}).join('')}</div>`:`<div class="card empty">${ic('clipboard',28)}<br><b>${q?'Nada encontrado':'Ainda não há formulários'}</b><br><span class="mut">Crie um formulário ou um teste.</span></div>`}</div>`;
  $('#fm-nf').onclick=()=>{const x=fmNovo(false);UI.fmId=x.id;UI.fmTab='perg';vForms()};$('#fm-nq').onclick=()=>{const x=fmNovo(true);UI.fmId=x.id;UI.fmTab='perg';vForms()};
  $('#fm-q').oninput=e=>{UI.fmQ=e.target.value;clearTimeout(vForms._t);vForms._t=setTimeout(()=>{vForms();const i=$('#fm-q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)};
  v.querySelectorAll('[data-fmo]').forEach(b=>b.onclick=()=>{UI.fmId=b.dataset.fmo;UI.fmTab='perg';vForms()});
  v.querySelectorAll('[data-fmd]').forEach(b=>b.onclick=()=>{const o=FMS().find(x=>x.id===b.dataset.fmd);const c=JSON.parse(JSON.stringify(o));Object.assign(c,{id:uid(),titulo:o.titulo+' (cópia)',resp:[],sess:[],criado:Date.now(),alterado:Date.now(),publicado:false});FMS().unshift(c);save();vForms()});
  v.querySelectorAll('[data-fmx]').forEach(b=>b.onclick=()=>{const o=FMS().find(x=>x.id===b.dataset.fmx);if(!confirm('Apagar «'+o.titulo+'» e as '+o.resp.length+' respostas?'))return;(o.sess||[]).forEach(s=>fmFechar(o,s).catch(()=>{}));S.forms=FMS().filter(x=>x!==o);save();vForms()})}
/* ---------- editor ---------- */
function fmEditor(f){const v=$('#view');const tab=UI.fmTab||'perg';const ab=(f.sess||[]).filter(s=>Date.now()<s.expira);
  barBtns([{id:'b-fmb',t:'← Forms',f:()=>{UI.fmId=null;vForms()}},{id:'b-fmp',t:ic('eye',15)+' Pré-visualizar',f:()=>fmPrevisualizar(f)},{id:'b-fmt',t:ic('palette',15)+' Tema',f:()=>fmTemaDlg(f)},{id:'b-fms',t:ic('gear',15)+' Definições',f:()=>fmDefsDlg(f)},{id:'b-fmr',t:ic('send',15)+(ab.length?' A Receber Respostas':' Recolher Respostas'),c:'pri',f:()=>fmRecolherDlg(f)}]);
  v.innerHTML=`<div class="fm fmed" style="--fc:${f.cor}"><div class="fmtabs" role="tablist"><button role="tab" data-fmtab="perg" class="${tab==='perg'?'on':''}">Perguntas</button><button role="tab" data-fmtab="resp" class="${tab==='resp'?'on':''}">Respostas <span class="fmn">${f.resp.length}</span></button></div>
    ${ab.length?`<div class="fmrec">${ic('send',15)} A receber respostas: ${ab.map(s=>`<b>${aaFmt(s.code)}</b>${s.tid&&A()?' · '+esc((A().turmas.find(t=>t.id===s.tid)||{}).nome||''):''} até ${new Date(s.expira).toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}`).join(' · ')} <button class="btn sm" id="fm-qr">${ic('image',13)} QR code</button></div>`:''}
    <div id="fm-corpo"></div></div>`;
  v.querySelectorAll('[data-fmtab]').forEach(b=>b.onclick=()=>{UI.fmTab=b.dataset.fmtab;fmEditor(f)});const qr=$('#fm-qr');if(qr)qr.onclick=()=>fmRecolherDlg(f);
  if(tab==='resp')return fmRespostas(f,$('#fm-corpo'));fmPerguntas(f,$('#fm-corpo'))}
function fmMudou(f){f.alterado=Date.now();save();(f.sess||[]).filter(s=>Date.now()<s.expira).forEach(s=>fmAtualizarSessao(f,s).catch(e=>console.warn(e)))}
function fmPerguntas(f,el){const sel=UI.fmSel;let nq=0;
  const card=(q,i)=>{const num=['secao','info'].includes(q.tipo)?'':(++nq)+'.';const on=sel===q.id;const T_=FM_TIPOS.find(x=>x[0]===q.tipo);
    if(q.tipo==='secao')return `<div class="fmq fmsec ${on?'on':''}" data-fmq="${q.id}"><div class="fmsech">${ic('flag',14)} Secção</div>${on?`<input class="fmtit" data-fk="titulo" value="${esc(q.titulo)}" placeholder="Título da secção"><textarea data-fk="sub" rows="2" placeholder="Descrição (opcional)">${esc(q.sub)}</textarea>
      <label class="fmlin">No fim desta secção, ir para <select data-fk="salto"><option value="">a secção seguinte</option>${f.itens.filter(x=>x.tipo==='secao'&&x.id!==q.id).map(x=>`<option value="${x.id}" ${q.salto===x.id?'selected':''}>${esc(x.titulo||'Secção sem título')}</option>`).join('')}<option value="fim" ${q.salto==='fim'?'selected':''}>Enviar o formulário</option></select></label>${fmFerr(q,i)}`:`<b>${esc(q.titulo||'Secção sem título')}</b>${q.sub?`<p class="mut">${esc(q.sub)}</p>`:''}`}</div>`;
    return `<div class="fmq ${on?'on':''}" data-fmq="${q.id}"><div class="fmqh"><span class="fmnum">${num}</span>${on?`<input class="fmtit" data-fk="titulo" value="${esc(q.titulo)}" placeholder="${q.tipo==='info'?'Texto':'Pergunta'}">`:`<b class="fmtt">${esc(q.titulo||(q.tipo==='info'?'Texto':'Pergunta'))}${q.obrig?' <span class="fmob">*</span>':''}</b>`}${f.quiz&&!['info','secao'].includes(q.tipo)?`<span class="fmpts">${nf(+q.pts||0)} pt${+q.pts===1?'':'s'}</span>`:''}<span class="fmtp" title="${T_[2]}">${ic(T_[1],13)}</span></div>
      ${on?`<input data-fk="sub" value="${esc(q.sub||'')}" placeholder="Subtítulo (opcional)" class="fmsub">${q.img?`<div class="fmimg"><img src="${q.img}" alt=""><button class="btn sm ghost" data-fq="semimg">${ic('x',13)} Retirar imagem</button></div>`:''}${fmCorpoEd(f,q)}${fmFerr(q,i)}`:fmCorpoVer(f,q)}</div>`};
  el.innerHTML=`<div class="fmpg"><div class="fmcab"><input class="fmtitulo" id="fm-ti" value="${esc(f.titulo)}" aria-label="Título"><textarea id="fm-de" rows="2" placeholder="Descrição">${esc(f.desc)}</textarea>${f.quiz?`<div class="mut">${ic('award',14)} Teste · ${nf(fmPts(f))} ponto${fmPts(f)===1?'':'s'} no total</div>`:''}</div>
    ${f.itens.map(card).join('')}
    <div class="fmadd"><span class="mut">Adicionar</span>${FM_TIPOS.map(([k,i_,l])=>`<button class="btn sm" data-fmadd="${k}">${ic(i_,14)} ${l}</button>`).join('')}</div></div>`;
  $('#fm-ti').oninput=e=>{f.titulo=e.target.value;fmMudou(f)};$('#fm-de').oninput=e=>{f.desc=e.target.value;fmMudou(f)};
  el.querySelectorAll('[data-fmadd]').forEach(b=>b.onclick=()=>{const q=fmQ(b.dataset.fmadd);if(f.quiz&&!['secao','info','likert','nps','classif','data'].includes(q.tipo))q.pts=1;const i=f.itens.findIndex(x=>x.id===UI.fmSel);f.itens.splice(i>=0?i+1:f.itens.length,0,q);UI.fmSel=q.id;fmMudou(f);fmPerguntas(f,el);setTimeout(()=>{const t=el.querySelector('.fmq.on .fmtit');if(t){t.focus();t.scrollIntoView({block:'center',behavior:'smooth'})}},50)});
  el.querySelectorAll('[data-fmq]').forEach(c=>c.addEventListener('click',e=>{if(UI.fmSel===c.dataset.fmq)return;if(e.target.closest('button,input,select,textarea,label'))return;UI.fmSel=c.dataset.fmq;fmPerguntas(f,el)}));
  const q=f.itens.find(x=>x.id===sel);if(!q)return;const c=el.querySelector('.fmq.on');
  c.querySelectorAll('[data-fk]').forEach(i=>{const ev=i.tagName==='SELECT'||i.type==='checkbox'?'change':'input';i.addEventListener(ev,()=>{const k=i.dataset.fk;let val=i.type==='checkbox'?i.checked:i.value;
    if(['pts','n'].includes(k))val=Math.max(0,+String(val).replace(',','.')||0);if(k==='l0'||k==='l1'){q.lbl=q.lbl||['',''];q.lbl[+k[1]]=val}else if(k==='num'){q.num=val?{}:null}else q[k]=val;
    fmMudou(f);if(i.type==='checkbox'||i.tagName==='SELECT'||k==='n'||k==='pts')fmPerguntas(f,el)})});
  c.querySelectorAll('[data-fo]').forEach(i=>i.oninput=()=>{const [k,id]=i.dataset.fo.split('|');const o=(q.ops||q.linhas).find(x=>x.id===id)||{};if(k==='t')o.t=i.value;if(k==='fb')o.fb=i.value;if(k==='lk')q.ops[+id]=i.value;if(k==='ln'){const L=q.linhas.find(x=>x.id===id);if(L)L.t=i.value}fmMudou(f)});
  c.querySelectorAll('[data-fsalto]').forEach(s=>s.onchange=()=>{const o=q.ops.find(x=>x.id===s.dataset.fsalto);o.salto=s.value;fmMudou(f)});
  c.querySelectorAll('[data-fcerta]').forEach(b=>b.onclick=()=>{const o=q.ops.find(x=>x.id===b.dataset.fcerta);if(!q.multi)q.ops.forEach(x=>{if(x!==o)x.certa=false});o.certa=!o.certa;fmMudou(f);fmPerguntas(f,el)});
  c.querySelectorAll('[data-fq]').forEach(b=>b.onclick=()=>{const a=b.dataset.fq;const i=f.itens.indexOf(q);
    if(a==='del'){f.itens.splice(i,1);UI.fmSel=(f.itens[i]||f.itens[i-1]||{}).id}
    if(a==='dup'){const c2=JSON.parse(JSON.stringify(q));c2.id=uid();(c2.ops||[]).forEach((o,k)=>{if(o&&typeof o==='object')o.id=uid()+k});(c2.linhas||[]).forEach((o,k)=>o.id=uid()+'l'+k);f.itens.splice(i+1,0,c2);UI.fmSel=c2.id}
    if(a==='up'&&i>0){f.itens.splice(i,1);f.itens.splice(i-1,0,q)}if(a==='down'&&i<f.itens.length-1){f.itens.splice(i,1);f.itens.splice(i+1,0,q)}
    if(a==='addop'){(q.ops=q.ops||[]).push({id:uid(),t:'Opção '+(q.ops.length+1)})}if(a==='addln'){q.linhas.push({id:uid(),t:'Afirmação '+(q.linhas.length+1)})}if(a==='addlk'){q.ops.push('Opção '+(q.ops.length+1))}
    if(a.startsWith('delop:')){q.ops=q.ops.filter(o=>o.id!==a.slice(6))}if(a.startsWith('delln:')){q.linhas=q.linhas.filter(o=>o.id!==a.slice(6))}if(a.startsWith('dellk:')){q.ops.splice(+a.slice(6),1)}
    if(a==='addresp'){(q.resp=q.resp||[]).push('')}if(a.startsWith('delresp:')){q.resp.splice(+a.slice(8),1)}
    if(a==='semimg')delete q.img;
    if(a==='img'){const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=()=>{const fl=inp.files[0];if(!fl)return;const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,640/Math.max(im.width,im.height));const cv=document.createElement('canvas');cv.width=im.width*k;cv.height=im.height*k;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);q.img=cv.toDataURL('image/jpeg',.72);fmMudou(f);fmPerguntas(f,el)};im.src=rd.result};rd.readAsDataURL(fl)};inp.click();return}
    fmMudou(f);fmPerguntas(f,el)});
  c.querySelectorAll('[data-fr]').forEach(i=>i.oninput=()=>{q.resp[+i.dataset.fr]=i.value;fmMudou(f)});
  c.querySelectorAll('[data-fnum]').forEach(i=>i.oninput=()=>{q.num=q.num||{};q.num[i.dataset.fnum]=i.value;fmMudou(f)})}
function fmFerr(q,i){return `<div class="fmferr">${q.tipo!=='secao'?`<button class="btn sm ghost" data-fq="img" title="Inserir imagem">${ic('image',14)}</button>`:''}<button class="btn sm ghost" data-fq="up" title="Subir">${ic('arrowUp',14)}</button><button class="btn sm ghost" data-fq="down" title="Descer"><span style="display:inline-block;transform:rotate(180deg)">${ic('arrowUp',14)}</span></button><button class="btn sm ghost" data-fq="dup" title="Duplicar">${ic('copy',14)}</button><button class="btn sm ghost" data-fq="del" title="Apagar">${ic('trash',14)}</button>
  <span class="sp1"></span>${!['secao','info'].includes(q.tipo)?`<label class="chk" style="margin:0"><input type="checkbox" data-fk="obrig" ${q.obrig?'checked':''}> <span>Obrigatória</span></label>`:''}</div>`}
function fmCorpoEd(f,q){const fq=f.quiz;
  if(q.tipo==='escolha')return `<div class="fmops">${q.ops.map(o=>`<div class="fmop">${fq?`<button class="fmok ${o.certa?'on':''}" data-fcerta="${o.id}" title="${o.certa?'Resposta certa':'Marcar como certa'}">${ic('check',13)}</button>`:`<span class="fmrd ${q.multi?'q':''}"></span>`}<input data-fo="t|${o.id}" value="${esc(o.t)}" placeholder="Opção"><button class="btn sm ghost" data-fq="delop:${o.id}" title="Retirar">${ic('x',13)}</button>
      ${fq?`<input class="fmfb" data-fo="fb|${o.id}" value="${esc(o.fb||'')}" placeholder="Comentário (opcional)">`:''}${f.itens.some(x=>x.tipo==='secao')?`<select data-fsalto="${o.id}" title="Ir para"><option value="">seguinte</option>${f.itens.filter(x=>x.tipo==='secao').map(x=>`<option value="${x.id}" ${o.salto===x.id?'selected':''}>→ ${esc(x.titulo||'Secção')}</option>`).join('')}<option value="fim" ${o.salto==='fim'?'selected':''}>→ fim</option></select>`:''}</div>`).join('')}
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><button class="btn sm" data-fq="addop">${ic('plus',13)} Opção</button></div>
    <div class="fmopc"><label class="chk"><input type="checkbox" data-fk="multi" ${q.multi?'checked':''}> <span>Várias respostas</span></label><label class="chk"><input type="checkbox" data-fk="outra" ${q.outra?'checked':''}> <span>Opção «Outra»</span></label><label class="chk"><input type="checkbox" data-fk="baralhar" ${q.baralhar?'checked':''}> <span>Baralhar opções</span></label><label class="chk"><input type="checkbox" data-fk="lista" ${q.lista?'checked':''}> <span>Lista pendente</span></label>${fq?`<label class="fmlin">Pontos <input type="number" min="0" step="0.5" data-fk="pts" value="${+q.pts||0}" style="width:76px"></label>`:''}</div>`;
  if(q.tipo==='texto')return `<div class="fmprevtx">${q.longo?'Resposta longa':'Resposta curta'}${q.num?' · número':''}</div><div class="fmopc"><label class="chk"><input type="checkbox" data-fk="longo" ${q.longo?'checked':''}> <span>Resposta longa</span></label><label class="chk"><input type="checkbox" data-fk="num" ${q.num?'checked':''}> <span>Só números</span></label>${q.num?`<label class="fmlin">entre <input data-fnum="min" value="${esc((q.num||{}).min||'')}" style="width:70px"> e <input data-fnum="max" value="${esc((q.num||{}).max||'')}" style="width:70px"></label>`:''}${fq?`<label class="fmlin">Pontos <input type="number" min="0" step="0.5" data-fk="pts" value="${+q.pts||0}" style="width:76px"></label>`:''}</div>
    ${fq&&!q.longo?`<div class="fmresp"><span class="mut">Respostas aceites (correção automática; maiúsculas e acentos não contam):</span>${(q.resp||[]).map((r,k)=>`<div class="fmop"><input data-fr="${k}" value="${esc(r)}" placeholder="resposta certa"><button class="btn sm ghost" data-fq="delresp:${k}">${ic('x',13)}</button></div>`).join('')}<button class="btn sm" data-fq="addresp">${ic('plus',13)} Resposta</button></div>`:fq?`<p class="hint">As respostas longas corrigem-se à mão em Respostas.</p>`:''}`;
  if(q.tipo==='classif')return `${fmCorpoVer(f,q)}<div class="fmopc"><label class="fmlin">Níveis <select data-fk="n">${[2,3,4,5,6,7,8,9,10].map(n=>`<option ${+q.n===n?'selected':''}>${n}</option>`).join('')}</select></label><label class="fmlin">Símbolo <select data-fk="simb"><option value="estrela" ${q.simb==='estrela'?'selected':''}>Estrela</option><option value="numero" ${q.simb==='numero'?'selected':''}>Número</option></select></label><label class="fmlin">Etiquetas <input data-fk="l0" value="${esc((q.lbl||[])[0]||'')}" placeholder="mínimo" style="width:110px"><input data-fk="l1" value="${esc((q.lbl||[])[1]||'')}" placeholder="máximo" style="width:110px"></label></div>`;
  if(q.tipo==='ordem')return `<div class="fmops">${q.ops.map((o,k)=>`<div class="fmop"><span class="fmnum">${k+1}</span><input data-fo="t|${o.id}" value="${esc(o.t)}"><button class="btn sm ghost" data-fq="delop:${o.id}">${ic('x',13)}</button></div>`).join('')}<button class="btn sm" data-fq="addop">${ic('plus',13)} Opção</button></div>${f.quiz?`<p class="hint">Num teste, a ordem certa é a que está aqui (os alunos veem as opções baralhadas).</p><div class="fmopc"><label class="fmlin">Pontos <input type="number" min="0" step="0.5" data-fk="pts" value="${+q.pts||0}" style="width:76px"></label></div>`:''}`;
  if(q.tipo==='likert')return `<div class="fmlk"><div><b class="mut">Opções</b>${q.ops.map((o,k)=>`<div class="fmop"><input data-fo="lk|${k}" value="${esc(o)}"><button class="btn sm ghost" data-fq="dellk:${k}">${ic('x',13)}</button></div>`).join('')}<button class="btn sm" data-fq="addlk">${ic('plus',13)} Opção</button></div><div><b class="mut">Afirmações</b>${q.linhas.map(o=>`<div class="fmop"><input data-fo="ln|${o.id}" value="${esc(o.t)}"><button class="btn sm ghost" data-fq="delln:${o.id}">${ic('x',13)}</button></div>`).join('')}<button class="btn sm" data-fq="addln">${ic('plus',13)} Afirmação</button></div></div>`;
  return fmCorpoVer(f,q)}
function fmCorpoVer(f,q){if(q.tipo==='escolha')return `<div class="fmopsv">${q.ops.map(o=>`<span class="${f.quiz&&o.certa?'certa':''}"><i class="fmrd ${q.multi?'q':''}"></i>${esc(o.t)}${f.quiz&&o.certa?' '+ic('check',12):''}</span>`).join('')}${q.outra?'<span><i class="fmrd"></i><em>Outra</em></span>':''}</div>`;
  if(q.tipo==='texto')return `<div class="fmprevtx">${q.longo?'Resposta longa':'Resposta curta'}</div>`;
  if(q.tipo==='classif')return `<div class="fmcl">${Array.from({length:+q.n||5},(_,i)=>q.simb==='numero'?`<span class="fmcn">${i+1}</span>`:`<span class="fmcs">★</span>`).join('')}</div>`;
  if(q.tipo==='data')return `<div class="fmprevtx">dd/mm/aaaa</div>`;
  if(q.tipo==='ordem')return `<ol class="fmol">${q.ops.map(o=>`<li>${esc(o.t)}</li>`).join('')}</ol>`;
  if(q.tipo==='likert')return `<div class="fmlkv"><span></span>${q.ops.map(o=>`<small>${esc(o)}</small>`).join('')}${q.linhas.map(l=>`<span>${esc(l.t)}</span>${q.ops.map(()=>'<i class="fmrd"></i>').join('')}`).join('')}</div>`.replace('class="fmlkv"',`class="fmlkv" style="grid-template-columns:minmax(120px,1.4fr) repeat(${q.ops.length},1fr)"`);
  if(q.tipo==='nps')return `<div class="fmcl">${Array.from({length:11},(_,i)=>`<span class="fmcn">${i}</span>`).join('')}</div><div class="fmnpsl"><small>Nada provável</small><small>Extremamente provável</small></div>`;
  if(q.tipo==='info')return q.sub?`<p class="mut">${esc(q.sub)}</p>`:'';
  return ''}
/* ---------- tema, definições, pré-visualização ---------- */
function fmTemaDlg(f){openDrawer('Tema',`<div class="ed"><p class="hint" style="margin-top:0">A cor aparece no formulário que os alunos veem.</p><div class="fmcores">${FM_CORES.map(c=>`<button class="fmcor ${f.cor===c?'on':''}" data-fcor="${c}" style="background:${c}" aria-label="Cor ${c}"></button>`).join('')}</div><label>Outra cor</label><input type="color" id="fm-cor" value="${esc(f.cor)}"></div>`);
  $$('[data-fcor]').forEach(b=>b.onclick=()=>{f.cor=b.dataset.fcor;fmMudou(f);closeDrawer();fmEditor(f)});$('#fm-cor').onchange=e=>{f.cor=e.target.value;fmMudou(f);closeDrawer();fmEditor(f)}}
function fmDefsDlg(f){const d=f.defs;openDrawer('Definições',`<div class="ed">
  <h3 style="margin-top:0">Quem pode responder</h3><label class="chk"><input type="checkbox" id="fd-pes" ${d.pes?'checked':''}> <span>Só os alunos da turma, com o seu <b>código pessoal</b> (o mesmo do papel da autoavaliação)</span></label><p class="hint">Desligado: o aluno escolhe o seu número (confia-se que escolhe o certo).</p>
  <h3>Opções das respostas</h3><label class="chk"><input type="checkbox" id="fd-uma" ${d.umaResp?'checked':''}> <span>Uma resposta por aluno (conta a última)</span></label>
  <div class="row" style="gap:10px"><div style="flex:1"><label>Data de início</label><input type="datetime-local" id="fd-ini" value="${esc(d.iniciar||'')}"></div><div style="flex:1"><label>Data de fim</label><input type="datetime-local" id="fd-fim" value="${esc(d.terminar||'')}"></div></div>
  <label class="chk"><input type="checkbox" id="fd-bar" ${d.baralhar?'checked':''}> <span>Baralhar as perguntas</span></label><label class="chk"><input type="checkbox" id="fd-num" ${d.numerar!==false?'checked':''}> <span>Numerar as perguntas</span></label>
  <label>Tempo limite (minutos, 0 = sem limite)</label><input type="number" min="0" id="fd-tmp" value="${+d.tempo||0}" style="max-width:120px">
  ${f.quiz?`<h3>Resultados do teste</h3><select id="fd-mos"><option value="publicar" ${d.mostrar==='publicar'?'selected':''}>Mostrar quando eu publicar as classificações</option><option value="logo" ${d.mostrar==='logo'?'selected':''}>Mostrar logo depois de enviar (respostas certas e comentários)</option><option value="nunca" ${d.mostrar==='nunca'?'selected':''}>Não mostrar aos alunos</option></select><p class="hint">Com «logo», as respostas certas vão junto com o teste para o telemóvel do aluno.</p>`:''}
  <label>Mensagem de agradecimento</label><textarea id="fd-agr" rows="2" placeholder="Obrigado! A tua resposta foi enviada.">${esc(d.agradecimento||'')}</textarea>
  <div class="row" style="margin-top:12px"><span class="sp1"></span><button class="btn pri" id="fd-ok">Guardar</button></div></div>`);
  $('#fd-ok').onclick=()=>{Object.assign(d,{pes:$('#fd-pes').checked,umaResp:$('#fd-uma').checked,iniciar:$('#fd-ini').value,terminar:$('#fd-fim').value,baralhar:$('#fd-bar').checked,numerar:$('#fd-num').checked,tempo:Math.max(0,+$('#fd-tmp').value||0),agradecimento:$('#fd-agr').value.trim()});if($('#fd-mos'))d.mostrar=$('#fd-mos').value;fmMudou(f);closeDrawer();fmEditor(f)}}
function fmPrevisualizar(f){const el=document.createElement('div');el.className='fmprev';const D={v:1,f:fmPublico(f,true),chave:true,t:'',d:'',prof:S.cfg.professor||'',pes:0,al:[],prev:1};
  el.innerHTML=`<div class="fmprevb"><div class="seg" role="group"><button type="button" data-fpd="pc" class="on">${ic('grid',14)} Computador</button><button type="button" data-fpd="tlm">${ic('phone',14)} Telemóvel</button></div></div><div class="fmprevw"><iframe title="Pré-visualização" src="forms.html#previsualizar"></iframe></div>`;
  ecraAmplo({titulo:'Pré-visualização',sub:f.titulo,el});const fr=el.querySelector('iframe');const env=()=>{try{fr.contentWindow.postMessage({fmPrev:D},location.origin)}catch(_){}};fr.onload=()=>setTimeout(env,150);
  el.querySelectorAll('[data-fpd]').forEach(b=>b.onclick=()=>{el.querySelectorAll('[data-fpd]').forEach(x=>x.classList.toggle('on',x===b));el.classList.toggle('tlm',b.dataset.fpd==='tlm')})}
/* ---------- recolher respostas: turma, QR code e código ---------- */
async function fmRecolherDlg(f){try{await aaQrLib()}catch(e){return toast(e.message,'erro')}const a=A();const T_=a?a.turmas:[];const ab=(f.sess||[]).filter(s=>Date.now()<s.expira);
  const linha=s=>{const t=T_.find(x=>x.id===s.tid);const url=fmUrl(s.code);return `<div class="fmqr"><div class="fmqri">${aaQR(url)}</div><div><p class="aadica"><b>Os alunos apontam a câmara a este código</b> ou abrem <b>${esc(url.replace(/#.*$/,'').replace(/^https?:\/\//,''))}</b> e escrevem o código.</p><p class="aacod">${aaFmt(s.code)}</p><p class="mut">${t?esc(t.nome+' · '+t.disciplina):'Sem turma'} · ${s.pes?'com código pessoal':'o aluno escolhe o número'} · até ${new Date(s.expira).toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</p>
    <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-fsm="${s.code}|60">+1 hora</button><button class="btn sm" data-fsm="${s.code}|1440">+1 dia</button><button class="btn sm" data-fsc="${esc(url)}">${ic('copy',13)} Copiar ligação</button><button class="btn sm pri" data-fsp="${s.code}">${ic('image',13)} Projetar</button><button class="btn sm dng" data-fsx="${s.code}">${ic('x',13)} Parar</button></div></div></div>`};
  openDrawer('Recolher Respostas · '+f.titulo,`<div class="ed">${ab.map(linha).join('')}
    <h3>${ab.length?'Abrir para outra turma':'Abrir a recolha de respostas'}</h3><label>Turma</label><select id="fr-t"><option value="">— sem turma (respostas anónimas ou com nome) —</option>${T_.map(t=>`<option value="${t.id}" ${T()&&T().id===t.id?'selected':''}>${esc(t.nome+' · '+t.disciplina)}</option>`).join('')}</select>
    <label>Durante</label><select id="fr-m"><option value="45">45 minutos</option><option value="90" selected>90 minutos</option><option value="240">4 horas</option><option value="1440">1 dia</option><option value="4320">3 dias</option><option value="10080">7 dias</option></select>
    <label class="chk"><input type="checkbox" id="fr-p" ${f.defs.pes?'checked':''}> <span>Pedir o código pessoal de cada aluno</span></label>
    <button class="btn pri" id="fr-ok" style="margin-top:10px">${ic('send',14)} Abrir e Mostrar o QR Code</button></div>`);
  $('#fr-ok').onclick=async()=>{const t=T_.find(x=>x.id===$('#fr-t').value);const b=$('#fr-ok');b.disabled=true;try{await fmAbrir(f,t,+$('#fr-m').value,t?$('#fr-p').checked:false);closeDrawer();fmEditor(f);fmRecolherDlg(f)}catch(e){toast(e.message,'erro');b.disabled=false}};
  $$('[data-fsm]').forEach(b=>b.onclick=async()=>{const [c,m]=b.dataset.fsm.split('|');const s=f.sess.find(x=>x.code===c);try{const {id}=await fmCh(c);const sb=await aaSb();const ex=new Date(Math.max(Date.now(),s.expira)+(+m)*60000);const r=await sb.from('eduspruce_autoav').update({expira:ex.toISOString()}).eq('id',id);if(r.error)throw new Error(aaErro(r.error));s.expira=+ex;save();fmRecolherDlg(f)}catch(e){toast(e.message,'erro')}});
  $$('[data-fsc]').forEach(b=>b.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(b.dataset.fsc);toast('Ligação copiada','ok')});
  $$('[data-fsx]').forEach(b=>b.onclick=async()=>{if(!confirm('Parar de receber respostas? As que já chegaram ficam guardadas.'))return;const s=f.sess.find(x=>x.code===b.dataset.fsx);try{await fmFechar(f,s);closeDrawer();fmEditor(f)}catch(e){toast(e.message,'erro')}});
  $$('[data-fsp]').forEach(b=>b.onclick=()=>{const s=f.sess.find(x=>x.code===b.dataset.fsp);const el=document.createElement('div');el.className='fmproj';el.style.setProperty('--fc',f.cor);el.innerHTML=`<h1>${esc(f.titulo)}</h1><div class="fmpq">${aaQR(fmUrl(s.code))}</div><p class="fmpc">${aaFmt(s.code)}</p><p>${esc(fmUrl(s.code).replace(/#.*$/,'').replace(/^https?:\/\//,''))}</p>`;closeDrawer();ecraAmplo({titulo:'Responder no telemóvel',sub:f.titulo,el})})}
/* ---------- respostas: resumo, uma a uma, correção, exportação e avaliação ---------- */
function fmRespostas(f,el){const R=f.resp;const vis=UI.fmRv||'resumo';const ab=(f.sess||[]).length;
  const top=`<div class="fmrt"><div class="fmk"><b>${R.length}</b><small>respostas</small></div>${f.quiz?`<div class="fmk"><b>${R.length?nf(R.reduce((s,r)=>s+fmPontuar(f,r).tot,0)/R.length,1):'—'}</b><small>média / ${nf(fmPts(f))} pts</small></div><div class="fmk ${R.some(r=>fmPontuar(f,r).pend)?'w':''}"><b>${R.filter(r=>fmPontuar(f,r).pend).length}</b><small>por corrigir</small></div>`:''}<div class="fmk"><b>${R.length?fmDur(R.reduce((s,r)=>s+Math.max(0,(r.t1||0)-(r.t0||r.t1||0)),0)/R.length):'—'}</b><small>tempo médio</small></div>
    <span class="sp1"></span><div class="row" style="gap:6px;flex-wrap:wrap">${ab?`<button class="btn sm" id="fm-at">${ic('refresh',13)} Atualizar</button>`:''}<button class="btn sm" id="fm-csv">${ic('download',13)} Excel (CSV)</button>${f.quiz?`<button class="btn sm" id="fm-pub">${ic('send',13)} ${f.publicado?'Classificações publicadas':'Publicar Classificações'}</button><button class="btn sm pri" id="fm-av">${ic('award',13)} Enviar para a Avaliação</button>`:''}</div></div>
    <div class="seg" role="group" style="margin:10px 0"><button type="button" data-frv="resumo" class="${vis==='resumo'?'on':''}">Resumo</button><button type="button" data-frv="ind" class="${vis==='ind'?'on':''}">Respostas individuais</button>${f.quiz?`<button type="button" data-frv="notas" class="${vis==='notas'?'on':''}">Classificações</button>`:''}</div>`;
  let corpo='';if(!R.length)corpo=`<div class="card empty">${ic('send',26)}<br><b>Ainda sem respostas</b><br><span class="mut">Toque em «Recolher Respostas» para mostrar o QR code aos alunos.</span></div>`;
  else if(vis==='resumo')corpo=fmPerg(f).map((q,i)=>fmResumoQ(f,q,i)).join('');
  else if(vis==='notas')corpo=`<div class="tblw"><table class="lst"><thead><tr><th>N.º</th><th style="text-align:left">Aluno</th>${fmPerg(f).filter(q=>+q.pts).map((q,i)=>`<th title="${esc(q.titulo)}">P${i+1}<small>/${nf(q.pts)}</small></th>`).join('')}<th>Total</th><th>%</th><th></th></tr></thead><tbody>${R.slice().sort((a,b)=>(+a.num||0)-(+b.num||0)).map(r=>{const P=fmPontuar(f,r);return `<tr><td>${esc(r.num||'')}</td><td style="text-align:left">${esc(r.nome)}</td>${fmPerg(f).filter(q=>+q.pts).map(q=>`<td class="${P.pq[q.id]==null?'fmpend':''}">${P.pq[q.id]==null?'?':nf(P.pq[q.id])}</td>`).join('')}<td><b>${nf(P.tot)}</b></td><td>${P.max?Math.round(P.tot/P.max*100):'—'}%</td><td><button class="btn sm" data-frver="${r.id}">Ver</button></td></tr>`}).join('')}</tbody></table></div>`;
  else{const i=Math.max(0,Math.min(R.length-1,UI.fmRi||0));UI.fmRi=i;corpo=fmUma(f,R[i],i)}
  el.innerHTML=top+corpo;
  el.querySelectorAll('[data-frv]').forEach(b=>b.onclick=()=>{UI.fmRv=b.dataset.frv;fmRespostas(f,el)});
  el.querySelectorAll('[data-frver]').forEach(b=>b.onclick=()=>{UI.fmRv='ind';UI.fmRi=R.findIndex(r=>r.id===b.dataset.frver);fmRespostas(f,el)});
  const at=$('#fm-at');if(at)at.onclick=async()=>{at.disabled=true;let n=0;for(const s of f.sess)try{n+=await fmImportar(f,s)}catch(e){toast(e.message,'erro')}toast(n?n+' resposta(s) nova(s)':'Sem respostas novas',n?'ok':'');fmEditor(f)};
  $('#fm-csv').onclick=()=>fmCSV(f);const pb=$('#fm-pub');if(pb)pb.onclick=()=>fmPublicar(f);const av=$('#fm-av');if(av)av.onclick=()=>fmAvaliacaoDlg(f);
  el.querySelectorAll('[data-fri]').forEach(b=>b.onclick=()=>{UI.fmRi=(UI.fmRi||0)+(+b.dataset.fri);fmRespostas(f,el)});
  el.querySelectorAll('[data-frx]').forEach(b=>b.onclick=()=>{if(!confirm('Apagar esta resposta?'))return;f.resp=f.resp.filter(r=>r.id!==b.dataset.frx);save();fmRespostas(f,el)});
  el.querySelectorAll('[data-frp]').forEach(i=>i.onchange=()=>{const [rid,qid,k]=i.dataset.frp.split('|');const r=R.find(x=>x.id===rid);r.rev=r.rev||{};const o=r.rev[qid]=r.rev[qid]||{};
    if(k==='pts'){const q=f.itens.find(x=>x.id===qid);const val=i.value.trim()===''?null:Math.min(+q.pts||0,Math.max(0,+i.value.replace(',','.')||0));o.pts=val}else o.c=i.value;save();if(k==='pts')fmRespostas(f,el)})}
const fmDur=ms=>{const m=Math.round(ms/60000);return m<1?'<1 min':m<60?m+' min':Math.floor(m/60)+' h '+(m%60)+' min'};
function fmResumoQ(f,q,i){const R=f.resp.map(r=>r.resp[q.id]).filter(v=>v!=null&&v!==''&&!(Array.isArray(v)&&!v.length));const n=R.length;
  const bar=(l,c,tot,ok)=>`<div class="fmbar ${ok?'ok':''}"><span>${esc(l)}</span><i><u style="width:${tot?Math.round(c/tot*100):0}%"></u></i><b>${c}</b></div>`;let h='';
  if(q.tipo==='escolha'){const C={};R.forEach(v=>(Array.isArray(v)?v:[v]).forEach(x=>C[x]=(C[x]||0)+1));h=q.ops.map(o=>bar(o.t,C[o.id]||0,n,f.quiz&&o.certa)).join('')+(q.outra?bar('Outra',R.filter(v=>(Array.isArray(v)?v:[v]).some(x=>String(x).startsWith('outra:'))).length,n):'');
    if(f.quiz&&+q.pts){const ok=f.resp.filter(r=>fmCorrigir(f,q,r.resp[q.id])===+q.pts).length;h+=`<p class="mut">${ok} de ${f.resp.length} acertaram (${f.resp.length?Math.round(ok/f.resp.length*100):0}%)</p>`}}
  else if(q.tipo==='texto'){h=`<div class="fmtxl">${R.slice(-12).reverse().map(v=>`<div>${esc(v)}</div>`).join('')}</div>${n>12?`<p class="mut">… e mais ${n-12} (veja em Respostas individuais ou no Excel)</p>`:''}`}
  else if(q.tipo==='classif'||q.tipo==='nps'){const N=q.tipo==='nps'?11:(+q.n||5);const ini=q.tipo==='nps'?0:1;const C=Array(N).fill(0);R.forEach(v=>{const k=+v-ini;if(k>=0&&k<N)C[k]++});const med=n?R.reduce((s,v)=>s+(+v),0)/n:0;
    h=`<p><b class="fmbig">${n?nf(med,2):'—'}</b> <span class="mut">média</span>${q.tipo==='nps'&&n?` · NPS <b>${Math.round((R.filter(v=>+v>=9).length-R.filter(v=>+v<=6).length)/n*100)}</b>`:''}</p>`+C.map((c,k)=>bar(String(k+ini),c,n)).join('')}
  else if(q.tipo==='data')h=`<div class="fmtxl">${R.slice(-12).map(v=>`<div>${esc(String(v).split('-').reverse().join('/'))}</div>`).join('')}</div>`;
  else if(q.tipo==='ordem'){const M=q.ops.map(o=>({o,m:n?R.reduce((s,v)=>s+((Array.isArray(v)?v.indexOf(o.id):-1)+1),0)/n:0})).sort((a,b)=>a.m-b.m);h=`<ol class="fmol">${M.map(x=>`<li>${esc(x.o.t)} <span class="mut">(posição média ${nf(x.m,1)})</span></li>`).join('')}</ol>`}
  else if(q.tipo==='likert')h=q.linhas.map(L=>{const C=q.ops.map((_,k)=>R.filter(v=>v&&+v[L.id]===k).length);const tot=C.reduce((s,c)=>s+c,0)||1;return `<div class="fmlkr"><span>${esc(L.t)}</span><div class="fmstk">${C.map((c,k)=>`<i style="width:${c/tot*100}%;background:hsl(${k/(q.ops.length-1||1)*120} 60% 50%)" title="${esc(q.ops[k])}: ${c}"></i>`).join('')}</div></div>`}).join('')+`<div class="fmlkleg">${q.ops.map((o,k)=>`<span><i style="background:hsl(${k/(q.ops.length-1||1)*120} 60% 50%)"></i>${esc(o)}</span>`).join('')}</div>`;
  return `<section class="card fmres"><h3>${i+1}. ${esc(q.titulo||'Pergunta')}${f.quiz&&+q.pts?` <span class="fmpts">${nf(q.pts)} pts</span>`:''}</h3><p class="mut">${n} resposta${n===1?'':'s'}</p>${h}</section>`}
function fmUma(f,r,i){const P=fmPontuar(f,r);const R=f.resp;
  const val=(q,v)=>{if(v==null||v===''||(Array.isArray(v)&&!v.length))return '<span class="mut">sem resposta</span>';
    if(q.tipo==='escolha')return (Array.isArray(v)?v:[v]).map(x=>String(x).startsWith('outra:')?'Outra: '+esc(String(x).slice(6)):esc((q.ops.find(o=>o.id===x)||{}).t||'?')).join(', ');
    if(q.tipo==='ordem')return '<ol>'+(v||[]).map(x=>`<li>${esc((q.ops.find(o=>o.id===x)||{}).t||'?')}</li>`).join('')+'</ol>';
    if(q.tipo==='likert')return q.linhas.map(L=>`${esc(L.t)}: <b>${esc(q.ops[+v[L.id]]||'—')}</b>`).join('<br>');
    if(q.tipo==='data')return esc(String(v).split('-').reverse().join('/'));return esc(String(v)).replace(/\n/g,'<br>')};
  return `<div class="row fmnav"><button class="btn sm" data-fri="-1" ${i?'':'disabled'}>‹</button><b>${esc(r.nome)}${r.num?' · n.º '+esc(r.num):''}</b><span class="mut">${i+1} de ${R.length} · ${new Date(r.t1).toLocaleString('pt-PT')} · ${fmDur((r.t1||0)-(r.t0||r.t1||0))}</span><button class="btn sm" data-fri="1" ${i<R.length-1?'':'disabled'}>›</button><span class="sp1"></span>${f.quiz?`<span class="fmtot">${nf(P.tot)} / ${nf(P.max)}</span>`:''}<button class="btn sm ghost" data-frx="${r.id}" title="Apagar">${ic('trash',13)}</button></div>
    ${fmPerg(f).map((q,k)=>{const a=P.pq[q.id];const rv=(r.rev||{})[q.id]||{};return `<section class="card fmres ${f.quiz&&+q.pts?(a==null?'pend':a>=+q.pts?'ok':a>0?'meio':'mal'):''}"><h3>${k+1}. ${esc(q.titulo||'Pergunta')}</h3><div class="fmval">${val(q,r.resp[q.id])}</div>
      ${f.quiz&&+q.pts?`<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px"><label class="fmlin">Pontos <input data-frp="${r.id}|${q.id}|pts" value="${a==null?'':String(a).replace('.',',')}" placeholder="?" style="width:70px"> / ${nf(q.pts)}</label><input data-frp="${r.id}|${q.id}|c" value="${esc(rv.c||'')}" placeholder="Comentário para o aluno" style="flex:1;min-width:200px"></div>`:''}</section>`}).join('')}`}
function fmCSV(f){const q=v=>{v=v==null?'':String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};const Q=fmPerg(f);
  const txt=(qq,v)=>{if(v==null)return '';if(qq.tipo==='escolha')return (Array.isArray(v)?v:[v]).map(x=>String(x).startsWith('outra:')?String(x).slice(6):(qq.ops.find(o=>o.id===x)||{}).t||'').join('; ');if(qq.tipo==='ordem')return (v||[]).map(x=>(qq.ops.find(o=>o.id===x)||{}).t||'').join(' > ');if(qq.tipo==='likert')return qq.linhas.map(L=>L.t+': '+(qq.ops[+v[L.id]]||'')).join('; ');return String(v)};
  const L=[['ID','Início','Fim','N.º','Nome',...Q.map(x=>x.titulo),...(f.quiz?['Total','Máximo']:[])]];f.resp.forEach((r,i)=>{const P=fmPontuar(f,r);L.push([i+1,r.t0?new Date(r.t0).toLocaleString('pt-PT'):'',new Date(r.t1).toLocaleString('pt-PT'),r.num||'',r.nome,...Q.map(x=>txt(x,r.resp[x.id])),...(f.quiz?[String(P.tot).replace('.',','),P.max]:[])])});
  download((f.titulo||'forms').replace(/[\\/:*?"<>|]+/g,'-')+'.csv','﻿'+L.map(l=>l.map(q).join(';')).join('\n'),'text/csv')}
async function fmPublicar(f){if(f.publicado&&!confirm('As classificações já foram publicadas. Voltar a publicar (com as correções feitas)?'))return;if(!f.publicado&&!confirm('Publicar as classificações? Os alunos passam a ver as respostas certas e os comentários quando voltarem a abrir o teste com o mesmo código.'))return;
  f.publicado=true;f.notasPub={};f.resp.forEach(r=>{if(!r.aid)return;const P=fmPontuar(f,r);f.notasPub[r.aid]={tot:P.tot,max:P.max,pq:P.pq,c:Object.fromEntries(Object.entries(r.rev||{}).map(([k,v])=>[k,v.c||'']))}});save();
  try{for(const s of f.sess)await fmAtualizarSessao(f,s);toast('Classificações publicadas','ok')}catch(e){toast(e.message,'erro')}fmEditor(f)}
/* as classificações entram na avaliação como instrumento (um item por pergunta com pontos) */
function fmAvaliacaoDlg(f){const a=A();const tids=[...new Set(f.resp.map(r=>r.tid).filter(Boolean))];const T_=(a?a.turmas:[]).filter(t=>tids.includes(t.id));
  if(!T_.length)return toast('As respostas não estão ligadas a uma turma. Abra a recolha escolhendo a turma.','erro');const t0=T_.find(t=>t.id===(f.ligacao||{}).tid)||T_[0];
  const Q=fmPerg(f).filter(q=>+q.pts);
  const corpo=t=>`<label>Turma</label><select id="fa-t">${T_.map(t2=>`<option value="${t2.id}" ${t2===t?'selected':''}>${esc(t2.nome+' · '+t2.disciplina)}</option>`).join('')}</select>
    <div class="row" style="gap:10px"><div style="flex:2"><label>Nome do instrumento</label><input id="fa-n" value="${esc((f.ligacao||{}).nome||f.titulo)}"></div><div style="flex:1"><label>${perW()}</label><select id="fa-p">${periodos().map(p=>`<option value="${p}" ${+((f.ligacao||{}).per||perAtual(t))===p?'selected':''}>${p}.º</option>`).join('')}</select></div></div>
    <label>Tipo</label><select id="fa-ti">${(S.cfg.tipos||['Teste de Avaliação']).map(x=>`<option ${x===((f.ligacao||{}).tipo||S.cfg.tipos[0])?'selected':''}>${esc(x)}</option>`).join('')}</select>
    <h3>Domínio de cada pergunta</h3><div class="fmdoms">${Q.map((q,i)=>`<label class="fmlin"><span>P${i+1} · ${esc((q.titulo||'').slice(0,50))} <small class="mut">(${nf(q.pts)} pts)</small></span><select data-fadom="${q.id}">${(t.dominios||[]).map(d=>`<option value="${d.id}" ${((f.ligacao||{}).dom||{})[q.id]===d.id?'selected':''}>${esc(d.ab||d.nome)}</option>`).join('')}</select></label>`).join('')}</div>
    <p class="hint">Cria (ou atualiza) um instrumento nesta turma com um item por pergunta e as cotações do teste. As perguntas por corrigir ficam em branco até as corrigir e voltar a enviar.</p>`;
  openDrawer('Enviar para a Avaliação',`<div class="ed" id="fa-ed">${corpo(t0)}</div><div class="row" style="margin:12px 16px"><span class="sp1"></span><button class="btn pri" id="fa-ok">${ic('award',14)} Enviar</button></div>`);
  const liga=()=>{$('#fa-t').onchange=()=>{$('#fa-ed').innerHTML=corpo(T_.find(x=>x.id===$('#fa-t').value));liga()}};liga();
  $('#fa-ok').onclick=()=>{const t=T_.find(x=>x.id===$('#fa-t').value);if(!(t.dominios||[]).length)return toast('A turma ainda não tem domínios (Critérios).','erro');
    const dom={};$$('[data-fadom]').forEach(s=>dom[s.dataset.fadom]=s.value);f.ligacao=Object.assign(f.ligacao||{},{tid:t.id,nome:$('#fa-n').value.trim()||f.titulo,per:+$('#fa-p').value,tipo:$('#fa-ti').value,dom});
    let i=t.instrumentos.find(x=>x.id===f.ligacao.inst&&x.fmId===f.id);if(!i){i={id:uid(),fmId:f.id,nome:'',tipo:'',periodo:1,data:isoHoje(),itens:[],notas:{}};t.instrumentos.push(i);f.ligacao.inst=i.id}
    Object.assign(i,{nome:f.ligacao.nome,tipo:f.ligacao.tipo,periodo:f.ligacao.per});
    i.itens=Q.map((q,k)=>{const ex=i.itens.find(x=>x.fmq===q.id);return {id:ex?ex.id:uid()+k,fmq:q.id,rot:'P'+(k+1)+(q.titulo?' · '+q.titulo.slice(0,40):''),dom:dom[q.id]||t.dominios[0].id,cot:+q.pts}});
    let n=0;f.resp.filter(r=>r.tid===t.id&&r.aid).forEach(r=>{const P=fmPontuar(f,r);const o=i.notas[r.aid]=i.notas[r.aid]||{};i.itens.forEach(it=>{const v=P.pq[it.fmq];if(v!=null)o[it.id]=v;else delete o[it.id]});n++});
    save();closeDrawer();toast(n+' aluno(s) com classificação em «'+i.nome+'» · '+t.nome,'ok');try{audit('Forms','Classificações enviadas para a avaliação',f.titulo+' → '+t.nome)}catch(_){}}}
/* ---------- definições: ligar/desligar ---------- */
{const _vDf=vDefinicoes;vDefinicoes=function(){const r=_vDf.apply(this,arguments);try{const c=document.querySelector('#view #aa-def')||document.querySelector('#view #ar-def');if(c&&!document.querySelector('#fm-def')){c.insertAdjacentHTML('afterend',`<label class="chk" style="margin-top:8px" id="fm-def"><input type="checkbox" id="fm-on" ${fmOn()?'checked':''}> ${ic('clipboard',15)} <span><b>Forms</b><br><span class="mut">Formulários e testes online (ao estilo do Microsoft Forms); os alunos respondem por QR code ou código e os testes entram na avaliação.</span></span></label>`);
  $('#fm-on').onchange=e=>{S.cfg.formsOn=e.target.checked;save();try{$$('#side [data-v="forms"]').forEach(b=>b.hidden=!fmOn())}catch(_){}toast(e.target.checked?'Forms ligado':'Forms desligado','ok')}}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
try{AJUDA.push({id:'forms',ic:'clipboard',t:'Forms — Formulários e Testes Online',gif:null,txt:`<p>Crie <b>formulários</b> (inquéritos, fichas, autoavaliações) e <b>testes</b> com pontos e correção automática, ao estilo do Microsoft Forms.</p>
<ul><li><b>Tipos de pergunta</b>: escolha (uma ou várias, «Outra», baralhar, lista pendente), texto (curto, longo, só números), classificação (estrelas ou números), data, ordenação, Likert, Net Promoter Score, secções (com saltos conforme a resposta) e texto/imagem. Cada pergunta pode ter imagem e ser obrigatória.</li>
<li><b>Testes</b>: pontos por pergunta, respostas certas, comentário por opção; escolha, texto curto e ordenação corrigem-se sozinhos; as respostas longas corrigem-se à mão em Respostas.</li>
<li><b>Definições</b>: só alunos da turma com código pessoal (ou escolher o número), uma resposta por aluno, datas de início e fim, baralhar perguntas, tempo limite, mostrar resultados logo / quando publicar / nunca, mensagem de agradecimento. <b>Tema</b> com cor.</li>
<li><b>Recolher Respostas</b>: escolha a turma e quanto tempo; aparece o <b>QR code e o código</b> (pode projetar). Os alunos abrem <b>forms.html</b>, escrevem o código, escolhem o número (e o código pessoal) e respondem. Tudo vai cifrado.</li>
<li><b>Respostas</b>: resumo com gráficos por pergunta, respostas individuais (correção e comentários), classificações, exportação para Excel (CSV), <b>Publicar Classificações</b> (os alunos veem as respostas certas e comentários) e <b>Enviar para a Avaliação</b>: cria um instrumento na turma com um item por pergunta, no domínio escolhido.</li></ul>`})}catch(_){}
(()=>{const st=document.createElement('style');st.id='forms-css';st.textContent=`
.fm{--fc:#0f6cbd;max-width:1100px;margin:0 auto}
.fmhero{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px}
.fmhero h2{margin:0 0 4px;display:flex;gap:8px;align-items:center}.fmhero p{margin:0;max-width:520px}
.fmnovos{display:flex;gap:10px;flex-wrap:wrap}.fmnv{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:190px;padding:14px 16px;border-radius:14px;border:1.5px solid var(--line);background:color-mix(in srgb,#0f6cbd 8%,var(--panel));color:var(--ink);cursor:pointer;text-align:left;font:inherit}
.fmnv.q{background:color-mix(in srgb,#8764b8 10%,var(--panel))}.fmnv svg{color:#0f6cbd}.fmnv.q svg{color:#8764b8}.fmnv small{color:var(--mut)}.fmnv:hover{border-color:currentColor}
.fmgr{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.fmc{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden;border-top:6px solid var(--fc)}
.fmcb{display:flex;flex-direction:column;gap:4px;width:100%;padding:14px 14px 40px;background:none;border:0;text-align:left;font:inherit;color:var(--ink);cursor:pointer;min-height:130px}
.fmcb b{font-size:16px}.fmct{font-size:12px;color:var(--fc);font-weight:700;display:flex;gap:4px;align-items:center}.fmab{color:#16a34a}
.fmca{position:absolute;right:6px;bottom:6px;display:flex;gap:2px}
.fmtabs{display:flex;justify-content:center;gap:4px;margin:0 0 12px;border-bottom:1px solid var(--line)}
.fmtabs button{background:none;border:0;border-bottom:3px solid transparent;padding:10px 18px;font:inherit;font-weight:700;color:var(--mut);cursor:pointer;min-height:44px}
.fmtabs button.on{color:var(--fc);border-bottom-color:var(--fc)}.fmn{display:inline-block;min-width:20px;padding:0 6px;border-radius:999px;background:var(--fc);color:#fff;font-size:12px}
.fmrec{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 14px;border-radius:12px;background:color-mix(in srgb,#16a34a 12%,var(--panel));margin-bottom:12px;font-size:14px}
.fmpg{max-width:800px;margin:0 auto}
.fmcab{background:var(--panel);border:1px solid var(--line);border-top:10px solid var(--fc);border-radius:14px;padding:16px;margin-bottom:12px}
.fmtitulo{font-size:24px!important;font-weight:700;border:0!important;border-bottom:1.5px solid var(--line)!important;border-radius:0!important;background:transparent!important;width:100%;padding:6px 0!important}
.fmcab textarea{width:100%;margin-top:8px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;resize:vertical}
.fmq{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:10px;cursor:pointer;transition:box-shadow .15s}
.fmq.on{cursor:default;border-left:5px solid var(--fc);box-shadow:0 6px 24px rgba(0,0,0,.08)}
.fmqh{display:flex;gap:8px;align-items:center}.fmnum{font-weight:700;color:var(--mut);min-width:22px}.fmtt{flex:1}.fmob{color:#d13438}
.fmtit{flex:1;font-size:17px!important;font-weight:600}.fmsub{width:100%;margin-top:6px;font-size:14px}
.fmpts{font-size:12px;font-weight:700;background:color-mix(in srgb,var(--fc) 14%,var(--panel));color:var(--fc);border-radius:999px;padding:2px 9px;white-space:nowrap}
.fmtp{color:var(--mut)}
.fmsec{border-top:6px solid var(--fc)}.fmsech{font-size:12px;font-weight:700;color:var(--fc);display:flex;gap:4px;align-items:center;margin-bottom:6px}
.fmops{margin-top:10px;display:flex;flex-direction:column;gap:6px}.fmop{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.fmop>input{flex:1;min-width:140px}.fmop select{max-width:170px}
.fmfb{flex:1 1 calc(100% - 250px)!important;font-size:13px;margin-left:34px;min-width:160px}.fmop select{flex:0 0 auto}
.fmrd{display:inline-block;width:18px;height:18px;border:2px solid var(--mut);border-radius:50%;flex:none;vertical-align:-3px;margin-right:6px}.fmrd.q{border-radius:4px}
.fmok{width:28px;height:28px;border-radius:50%;border:2px solid var(--line);background:var(--panel);color:transparent;display:grid;place-items:center;cursor:pointer;flex:none}
.fmok.on{background:#107c10;border-color:#107c10;color:#fff}
.fmopc{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;margin-top:10px;padding-top:10px;border-top:1px dashed var(--line)}.fmopc .chk{margin:0}
.fmlin{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:0;font-weight:600;font-size:14px}
.fmferr{display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:12px;padding-top:8px;border-top:1px solid var(--line)}
.fmopsv{display:flex;flex-direction:column;gap:6px;margin-top:8px;color:var(--mut)}.fmopsv .certa{color:#107c10;font-weight:700}
.fmprevtx{margin-top:8px;padding:10px;border-bottom:1.5px solid var(--line);color:var(--mut);font-size:14px;max-width:420px}
.fmcl{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.fmcs{font-size:26px;color:#d0a400}.fmcn{min-width:34px;height:34px;display:grid;place-items:center;border:1.5px solid var(--line);border-radius:8px;font-weight:700}
.fmnpsl{display:flex;justify-content:space-between;max-width:470px;color:var(--mut)}
.fmol{margin:8px 0 0;padding-left:22px}.fmlk{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px}
.fmlkv{display:grid;gap:6px 4px;align-items:center;margin-top:8px;font-size:13px;overflow-x:auto}.fmlkv small{text-align:center;color:var(--mut)}.fmlkv .fmrd{justify-self:center;margin:0}
.fmimg{margin-top:8px}.fmimg img{max-width:100%;max-height:280px;border-radius:10px;display:block;margin-bottom:4px}
.fmresp{margin-top:10px;display:flex;flex-direction:column;gap:6px}
.fmadd{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;padding:14px;border:1.5px dashed var(--line);border-radius:14px;margin:12px 0 40px}
.fmcores{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.fmcor{width:44px;height:44px;border-radius:50%;border:3px solid transparent;cursor:pointer}.fmcor.on{border-color:var(--ink)}
.fmprev{display:flex;flex-direction:column;height:100%;gap:10px}.fmprevb{display:flex;justify-content:center}.fmprevw{flex:1;display:flex;justify-content:center;min-height:70vh}
.fmprevw iframe{width:100%;max-width:1000px;height:100%;min-height:70vh;border:1px solid var(--line);border-radius:12px;background:#fff;transition:max-width .25s}
.fmprev.tlm iframe{max-width:390px;border-radius:28px;border-width:10px;border-color:#222}
.fmqr{display:grid;grid-template-columns:minmax(160px,220px) 1fr;gap:14px;align-items:center;padding:12px;border:1px solid var(--line);border-radius:14px;margin-bottom:12px}
.fmqri svg,.fmqri img,.fmqri canvas{width:100%;height:auto;display:block;background:#fff;border-radius:8px}
.fmproj{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:80vh;gap:8px}.fmproj h1{color:var(--fc);font-size:clamp(24px,4vw,44px);margin:0}
.fmpq{width:min(58vh,80vw)}.fmpq svg,.fmpq img,.fmpq canvas{width:100%;height:auto;background:#fff;padding:12px;border-radius:14px}.fmpc{font:800 clamp(40px,8vw,90px)/1 ui-monospace,monospace;letter-spacing:.08em;color:var(--fc);margin:0}
.fmrt{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.fmk{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 14px;min-width:110px}.fmk b{display:block;font-size:24px}.fmk small{color:var(--mut)}.fmk.w b{color:#ca5010}
.fmres{margin-bottom:10px}.fmres h3{margin:0 0 2px;font-size:16px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.fmres.ok{border-left:5px solid #107c10}.fmres.mal{border-left:5px solid #d13438}.fmres.meio{border-left:5px solid #ca5010}.fmres.pend{border-left:5px solid #8a8886}
.fmbar{display:grid;grid-template-columns:minmax(90px,38%) 1fr 34px;gap:8px;align-items:center;margin:5px 0;font-size:14px}.fmbar i{height:14px;background:var(--bg);border-radius:7px;overflow:hidden}.fmbar u{display:block;height:100%;background:var(--fc,#0f6cbd);border-radius:7px}.fmbar.ok span{color:#107c10;font-weight:700}.fmbar.ok u{background:#107c10}.fmbar b{text-align:right}
.fmtxl{display:flex;flex-direction:column;gap:4px;max-height:260px;overflow:auto}.fmtxl div{background:var(--bg);border-radius:8px;padding:6px 10px;font-size:14px}
.fmbig{font-size:28px}.fmlkr{display:grid;grid-template-columns:minmax(100px,34%) 1fr;gap:8px;align-items:center;margin:5px 0;font-size:14px}.fmstk{display:flex;height:16px;border-radius:8px;overflow:hidden;background:var(--bg)}
.fmlkleg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--mut);margin-top:6px}.fmlkleg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px}
.fmnav{gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}.fmtot{font-size:20px;font-weight:800;color:var(--fc)}.fmval{font-size:15px}.fmval ol{margin:0;padding-left:20px}
td.fmpend{color:#ca5010;font-weight:700}.fmdoms{display:flex;flex-direction:column;gap:6px}.fmdoms .fmlin{justify-content:space-between}.fmdoms select{max-width:180px}
@media (max-width:700px){.fmhero{padding:14px}.fmnv{min-width:0;flex:1 1 140px}.fmqr{grid-template-columns:1fr}.fmqri{max-width:240px;margin:0 auto}.fmlk{grid-template-columns:1fr}.fmq{padding:12px}.fmfb{margin-left:0}.fmbar{grid-template-columns:minmax(70px,40%) 1fr 30px}.fmtabs button{flex:1}.fmop select{max-width:100%;flex:1 1 100%}}
`;document.head.appendChild(st)})();
