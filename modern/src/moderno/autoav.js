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
function aaCodigo(){const o=[];while(o.length<8){const b=crypto.getRandomValues(new Uint8Array(16));for(const x of b){if(x<248&&o.length<8)o.push(AA_ALF[x%31])}}return o.join('')}
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
async function aaAbrir(t,p,q,min){const code=aaCodigo();const {id,k}=await aaCh(code);const sec=isSec(t);
  const D={v:1,t:t.nome,d:t.disciplina,p,pn:perNome(p),W:perW(),esc:sec?'20':'5',prof:S.cfg.professor||'',q,dom:(t.dominios||[]).map(d=>({id:d.id,n:d.nome})),
    al:t.alunos.filter(a=>a.frequenta!==false).sort((a,b)=>(+a.num||0)-(+b.num||0)).map(a=>({id:a.id,n:a.num||'',nm:aaCurto(a.nome)}))};
  const expira=new Date(Date.now()+min*60000).toISOString();const sb=await aaSb();
  const r=await sb.from('eduspruce_autoav').insert({id,dados:await aaCifrar(D,k),expira});if(r.error)throw new Error(aaErro(r.error));
  const s={code,p,criado:Date.now(),expira:Date.parse(expira),n:0,vistos:[]};aaSess(t).push(s);save();try{audit('Avaliação','Autoavaliação pelo telemóvel aberta',t.nome+' · '+perNome(p))}catch(_){}return s}
/* trazer as respostas para o Perfil de Aprendizagem */
async function aaImportar(t,s){const {id,k}=await aaCh(s.code);const sb=await aaSb();const r=await sb.from('eduspruce_autoav_resp').select('id,conteudo').eq('sessao',id).order('id');
  if(r.error)throw new Error(aaErro(r.error));const ult={};
  for(const x of r.data||[]){try{const o=await aaDecifrar(x.conteudo,k);if(o&&o.aid&&(!ult[o.aid]||o.q>=ult[o.aid].q))ult[o.aid]=o}catch(_){}}
  let novos=0;const vis=new Set(s.vistos||[]);
  for(const aid in ult){const a=t.alunos.find(z=>z.id===aid);if(!a)continue;const o=ult[aid];const AV=autoD(a,s.p);if(AV.alunoQ&&AV.alunoQ>=o.q){vis.add(aid);continue}
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
async function aaPainel(){const t=T();if(!t)return toast('Escolha primeiro uma turma.','erro');if(!aaLigado())return toast('A autoavaliação pelo telemóvel está desligada (Definições › Dados e Segurança).','erro');
  if(!window.__esPronto)return toast('Os dados ainda estão a abrir. Tente dentro de momentos.','erro');
  $$('dialog.aadlg').forEach(d=>d.remove());const d=document.createElement('dialog');d.className='aadlg';d.setAttribute('aria-labelledby','aa-t');document.body.appendChild(d);
  let tm=null;const fim=()=>{clearInterval(tm);try{d.close()}catch(_){}d.remove();if(VIEW)try{go(VIEW)}catch(_){}};
  d.addEventListener('cancel',e=>{e.preventDefault();fim()});
  const ativos=t.alunos.filter(a=>a.frequenta!==false);
  const formulario=(msg)=>{clearInterval(tm);const np=periodos().length||3,pa=perAtual(t);
    d.innerHTML=`<form class="aaw" onsubmit="return false"><header class="aah"><h2 id="aa-t">${ic('users',18)} Autoavaliação pelo Telemóvel</h2><button type="button" class="btn ico" id="aa-x" aria-label="Fechar">${ic('x',16)}</button></header>
      <p class="mut">${esc(t.nome)} · ${esc(t.disciplina)} · ${ativos.length} alunos. Os alunos apontam o telemóvel ao QR code (ou abrem o link e escrevem o código), escolhem o seu número e respondem. As respostas aparecem no <b>Perfil de Aprendizagem</b> de cada aluno.</p>
      <div class="aag"><div><label for="aa-p">${esc(perW())}</label><select id="aa-p">${Array.from({length:np},(_,i)=>`<option value="${i+1}" ${i+1===pa?'selected':''}>${esc(perNome(i+1))}</option>`).join('')}</select></div>
      <div><label for="aa-m">Fica aberta durante</label><select id="aa-m"><option value="20">20 minutos</option><option value="45" selected>45 minutos</option><option value="90">90 minutos</option><option value="1440">24 horas</option><option value="10080">7 dias</option></select></div></div>
      <fieldset class="aaq"><legend>O que os alunos respondem</legend>
        <label class="chk"><input type="checkbox" id="aa-qd" checked> Nível em cada domínio (1 a 4)</label>
        <label class="chk"><input type="checkbox" id="aa-qn" checked> Classificação que propõem</label>
        <label class="chk"><input type="checkbox" id="aa-qr" checked> O que fizeram bem e o que podem melhorar</label>
        <label class="chk"><input type="checkbox" id="aa-qp" checked> Compromisso para o próximo ${esc(perW().toLowerCase())}</label></fieldset>
      <p class="nverr" role="alert">${esc(msg||'')}</p>
      <div class="row aaa"><button type="button" class="btn" id="aa-c">Cancelar</button><button type="button" class="btn pri" id="aa-ok">${ic('sparkle',15)} Mostrar o QR Code</button></div>
      <p class="hint">Só a lista «n.º · primeiro nome e inicial» vai para o telemóvel dos alunos, cifrada. Cada aluno só envia a sua resposta; ninguém vê as dos colegas.</p></form>`;
    d.querySelector('#aa-x').onclick=fim;d.querySelector('#aa-c').onclick=fim;
    d.querySelector('#aa-ok').onclick=async()=>{const b=d.querySelector('#aa-ok');b.disabled=true;b.innerHTML=ic('refresh',15)+' A preparar…';
      const q={dom:d.querySelector('#aa-qd').checked,nota:d.querySelector('#aa-qn').checked,forte:d.querySelector('#aa-qr').checked,melhorar:d.querySelector('#aa-qr').checked,plano:d.querySelector('#aa-qp').checked};
      try{await aaQrLib();const s=await aaAbrir(t,+d.querySelector('#aa-p').value,q,+d.querySelector('#aa-m').value);aberta(s)}catch(e){formulario(aaErro(e))}}};
  const aberta=s=>{const url=aaUrl(s.code);
    d.innerHTML=`<div class="aaw aaon"><header class="aah"><h2 id="aa-t">${ic('users',18)} ${esc(t.nome)} · ${esc(perNome(s.p))}</h2><button type="button" class="btn ico" id="aa-x" aria-label="Fechar a janela (a autoavaliação continua aberta)">${ic('x',16)}</button></header>
      <div class="aaqr"><div class="aaqi">${aaQR(url)}</div><div class="aaqt"><p class="mut">Apontem a câmara do telemóvel ao código, ou abram</p><p class="aaurl">${esc(url.replace(/#.*$/,'').replace(/^https?:\/\//,''))}</p><p class="mut">e escrevam o código</p><p class="aacod" aria-label="Código ${esc(s.code.split('').join(' '))}">${esc(aaFmt(s.code))}</p>
        <p class="aaest"><b id="aa-n">0</b> de ${ativos.length} responderam · <span id="aa-exp"></span></p></div></div>
      <div class="aavis" id="aa-vis"></div>
      <div class="row aaa"><button type="button" class="btn" id="aa-fs">${ic('grid',15)} Ecrã Inteiro</button><button type="button" class="btn" id="aa-cp">${ic('copy',15)} Copiar Link</button>${navigator.share?`<button type="button" class="btn" id="aa-sh">${ic('upload',15)} Partilhar</button>`:''}<button type="button" class="btn" id="aa-mais">+30 min</button><span class="sp1"></span><button type="button" class="btn dng" id="aa-fim">${ic('check',15)} Terminar e Guardar</button></div></div>`;
    const atual=()=>{const n=s.vistos||[];d.querySelector('#aa-n').textContent=n.length;const r=Math.max(0,s.expira-Date.now());
      d.querySelector('#aa-exp').textContent=r<=0?'fechada':r<3600e3?'fecha dentro de '+Math.ceil(r/60000)+' min':'fecha '+new Date(s.expira).toLocaleString('pt-PT',{weekday:'short',hour:'2-digit',minute:'2-digit'});
      d.querySelector('#aa-vis').innerHTML=ativos.sort((a,b)=>(+a.num||0)-(+b.num||0)).map(a=>`<span class="${n.includes(a.id)?'ok':''}" title="${esc(a.nome)}">${esc(a.num||'')}</span>`).join('')};
    const puxar=async()=>{try{const k=await aaImportar(t,s);atual();if(k)toast(k===1?'Chegou 1 autoavaliação':'Chegaram '+k+' autoavaliações','ok')}catch(e){console.warn(e)}if(Date.now()>s.expira){clearInterval(tm);atual()}};
    atual();clearInterval(tm);tm=setInterval(puxar,4000);
    d.querySelector('#aa-x').onclick=fim;
    d.querySelector('#aa-fs').onclick=()=>{d.classList.toggle('aafs');const w=d.querySelector('.aaw');try{if(!document.fullscreenElement&&w.requestFullscreen)w.requestFullscreen();else if(document.fullscreenElement)document.exitFullscreen()}catch(_){}};
    d.querySelector('#aa-cp').onclick=async()=>{try{await navigator.clipboard.writeText(url+'\nCódigo: '+aaFmt(s.code));toast('Link e código copiados','ok')}catch(_){prompt('Copie:',url)}};
    const sh=d.querySelector('#aa-sh');if(sh)sh.onclick=()=>navigator.share({title:'Autoavaliação · '+t.disciplina,text:'Código: '+aaFmt(s.code),url}).catch(()=>{});
    d.querySelector('#aa-mais').onclick=async()=>{try{await aaMais(t,s,30);atual();if(!tm)tm=setInterval(puxar,4000);toast('Mais 30 minutos','ok')}catch(e){toast(aaErro(e),'erro')}};
    d.querySelector('#aa-fim').onclick=async()=>{const b=d.querySelector('#aa-fim');b.disabled=true;try{await aaFechar(t,s);toast('Autoavaliação terminada: '+(s.n||0)+' resposta(s) guardada(s) no Perfil de Aprendizagem.','ok');fim()}catch(e){b.disabled=false;toast(aaErro(e),'erro')}}};
  const ab=aaSess(t).find(s=>Date.now()<s.expira);try{d.showModal()}catch(_){d.setAttribute('open','')}
  if(ab){try{await aaQrLib();aberta(ab)}catch(e){formulario(aaErro(e))}}else formulario()}

/* botões: barra da turma e Perfil de Aprendizagem */
{const _g=go;go=function(v){const r=_g.apply(this,arguments);try{if(aaLigado()&&window.__esPronto&&['avaliacao','painel','alunos'].includes(VIEW)&&T()){const bx=$('#barx');if(bx&&!bx.querySelector('#b-aatlm')){const b=document.createElement('button');b.className='btn';b.id='b-aatlm';const ab=aaSess(T()).some(s=>Date.now()<s.expira);b.innerHTML=ic('users',15)+(ab?' Autoavaliação (aberta)':' Autoavaliação pelo Telemóvel');if(ab)b.classList.add('pri');b.onclick=aaPainel;bx.appendChild(b)}}}catch(e){console.warn(e)}return r}}
{const _pA=perfilAluno;perfilAluno=function(){const r=_pA.apply(this,arguments);try{const liga=()=>{const h=document.querySelector('#perfilap .pauto h2');if(h&&aaLigado()&&!h.querySelector('.aapb')){h.insertAdjacentHTML('beforeend',` <button type="button" class="btn sm aapb">${ic('users',13)} Pedir pelo Telemóvel</button>`);h.querySelector('.aapb').onclick=()=>{const o=$('#perfilap');if(o)o.remove();document.body.classList.remove('perfil-on');aaPainel()}}
    const o=$('#perfilap');if(o&&!o.dataset.aamo){o.dataset.aamo=1;new MutationObserver(liga).observe(o,{childList:true,subtree:true})}};liga()}catch(e){console.warn(e)}return r}}
/* Definições › Dados e Segurança: ligar/desligar */
{const _vD=vDefinicoes;vDefinicoes=function(){const r=_vD.apply(this,arguments);try{if((UI.defTab||'geral')==='dados'&&!$('#aa-def')){const v=$('#view');const c=document.createElement('div');c.className='card';c.id='aa-def';
    c.innerHTML=`<h2>${ic('users',18)} Autoavaliação dos Alunos pelo Telemóvel</h2><p class="hint" style="margin-top:0">Os alunos fazem a autoavaliação de cada ${esc(perW().toLowerCase())} no telemóvel: mostra um QR code (ou dá um link e um código temporário) e as respostas chegam ao Perfil de Aprendizagem. Sem contas para os alunos; tudo cifrado.</p>
      <label class="chk"><input type="checkbox" id="aa-on" ${aaLigado()?'checked':''}> Permitir a autoavaliação pelo telemóvel</label>`;
    const ref=[...v.querySelectorAll('.card')].find(x=>/Código de Acesso/.test((x.querySelector('h2')||{}).textContent||''));if(ref)ref.after(c);else v.appendChild(c);
    c.querySelector('#aa-on').onchange=async e=>{S.cfg.autoavTlm=e.target.checked;save();if(!e.target.checked){let n=0;for(const an of S.anos)for(const t of an.turmas)for(const s of [...aaSess(t)]){try{await aaFechar(t,s);n++}catch(_){}}toast('Autoavaliação pelo telemóvel desligada'+(n?' · '+n+' sessão(ões) fechada(s) e respostas guardadas':''),'ok')}else toast('Autoavaliação pelo telemóvel ligada','ok')}}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
(()=>{const st=document.createElement('style');st.textContent=`
dialog.aadlg{border:0;border-radius:22px;padding:0;width:min(760px,96vw);max-height:94vh;overflow:auto;background:var(--panel);color:var(--ink);box-shadow:0 30px 80px rgba(0,0,0,.35)}dialog.aadlg::backdrop{background:rgba(10,20,35,.55)}
.aaw{padding:20px 22px;display:flex;flex-direction:column;gap:10px}.aah{display:flex;align-items:center;gap:10px}.aah h2{margin:0;flex:1;font-size:19px;display:flex;gap:8px;align-items:center;text-transform:none;color:var(--ink)}
.aag{display:grid;grid-template-columns:1fr 1fr;gap:10px}.aag label{display:block;font-size:13px;color:var(--mut);margin-bottom:4px}.aag select{width:100%}
.aaq{border:1px solid var(--line);border-radius:14px;padding:10px 14px;display:grid;gap:6px}.aaq legend{font-size:13px;color:var(--mut);padding:0 4px}
.aaa{gap:8px;flex-wrap:wrap}.aaa .btn{min-height:44px}
.aaqr{display:grid;grid-template-columns:minmax(220px,340px) 1fr;gap:22px;align-items:center}.aaqi{background:#fff;border-radius:16px;padding:8px;border:1px solid var(--line)}.aaqi svg{display:block;width:100%;height:auto}
.aaqt p{margin:0 0 6px}.aaurl{font-weight:700;font-size:18px;word-break:break-all}.aacod{font:800 clamp(30px,6vw,52px)/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;color:var(--acc);margin:4px 0 10px!important}
.aaest{font-size:15px}.aaest b{font-size:20px}
.aavis{display:flex;flex-wrap:wrap;gap:6px}.aavis span{min-width:34px;height:34px;padding:0 6px;border-radius:9px;display:grid;place-items:center;font-weight:700;font-size:14px;background:var(--bg);color:var(--mut);border:1px solid var(--line)}.aavis span.ok{background:#16a34a;color:#fff;border-color:#16a34a}
dialog.aadlg.aafs{width:100vw;max-width:100vw;height:100vh;max-height:100vh;border-radius:0}.aafs .aaqr{grid-template-columns:minmax(300px,48vh) 1fr}.aaw:fullscreen{background:var(--panel);justify-content:center;padding:4vh 5vw}.aaw:fullscreen .aaqr{grid-template-columns:minmax(300px,62vh) 1fr}.aaw:fullscreen .aacod{font-size:clamp(48px,8vw,96px)}.aaw:fullscreen .aaurl{font-size:clamp(20px,2.4vw,32px)}
@media (max-width:640px){.aag{grid-template-columns:1fr}.aaqr{grid-template-columns:1fr}.aaqi{max-width:300px;margin:0 auto}.aaqt{text-align:center}dialog.aadlg{width:100vw;max-width:100vw;max-height:100dvh;height:100dvh;border-radius:0}.aaa .btn{flex:1 1 calc(50% - 8px);justify-content:center}.aaa .sp1{display:none}}
.pauto h2 .aapb{margin-left:auto;font-size:12.5px}body.est-sge dialog.aadlg,body.est-sge .aaqi{border-radius:0}`;document.head.appendChild(st)})();
