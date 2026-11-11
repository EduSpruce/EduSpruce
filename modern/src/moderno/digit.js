/* ===================== Digitalização dos testes escritos (v0.943) =====================
   Em cada instrumento escrito (todos menos a Produção Oral) o professor pode guardar a folha de teste / enunciado realizado de cada aluno:
   no telemóvel fotografa a página 1, a 2, a 3… e só no fim envia tudo. Depois de guardado, o documento fica SELADO:
   não se pode alterar, substituir nem apagar (a app não tem forma de o fazer e a base de dados recusa — script 0006).
   Vê-se em «livro». As páginas vão cifradas com a chave da conta e só são descarregadas quando se abre o livro. */
const DG_PREF='ef-f-dg-',DG_LADO=1700,DG_Q=.72,DG_MAXP=24;
const dgEscrito=i=>!!i&&!i.oral&&!/oral/i.test((i.tipo||'')+' '+(i.nome||''));
const dgMeta=(t,iid)=>{t.digit=t.digit&&typeof t.digit==='object'?t.digit:{};return t.digit[iid]=t.digit[iid]||{}};
const dgTem=(t,iid,aid)=>((t.digit||{})[iid]||{})[aid]||null;
const dgConta=(t,i)=>Object.keys((t.digit||{})[i.id]||{}).filter(aid=>t.alunos.some(a=>a.id===aid)).length;
const dgNome=(id,n)=>DG_PREF+id+'-'+n;
const dgSha=async s=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
/* fotografia → JPEG leve e legível (lado maior 1700 px) */
async function dgImagem(file){let bmp=null;try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(_){}
  if(!bmp){bmp=await new Promise((ok,ko)=>{const im=new Image();const u=URL.createObjectURL(file);im.onload=()=>{URL.revokeObjectURL(u);ok(im)};im.onerror=()=>{URL.revokeObjectURL(u);ko(new Error('Não foi possível ler a fotografia.'))};im.src=u})}
  const w0=bmp.width||bmp.naturalWidth,h0=bmp.height||bmp.naturalHeight;const f=Math.min(1,DG_LADO/Math.max(w0,h0));const w=Math.round(w0*f),h=Math.round(h0*f);
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(bmp,0,0,w,h);try{bmp.close&&bmp.close()}catch(_){}
  return {url:c.toDataURL('image/jpeg',DG_Q),w,h}}
/* enviar e selar */
async function dgGuardar(t,i,a,pags,prog){if(dgTem(t,i.id,a.id))throw new Error('Este aluno já tem a digitalização guardada neste instrumento.');
  const p=await sbObter();const k=await nvChave();if(!k)throw new Error('Os dados ainda não estão abertos.');const id=uid();const H=[];let bytes=0;
  for(let n=0;n<pags.length;n++){prog&&prog(n,pags.length);const url=pags[n].url;H.push(await dgSha(url));const txt=await nvCifrar(url,k);bytes+=txt.length;
    let ok=false,err=null;for(let ten=0;ten<3&&!ok;ten++){try{ok=await p.criar(dgNome(id,n+1),txt);if(!ok){ok=true}}catch(e){err=e;await new Promise(r=>setTimeout(r,800*(ten+1)))}}
    if(!ok)throw new Error('Não foi possível enviar a página '+(n+1)+': '+((err&&err.message)||'sem ligação')+'. Nada ficou guardado — tente de novo.')}
  prog&&prog(pags.length,pags.length);
  dgMeta(t,i.id)[a.id]={id,n:pags.length,q:Date.now(),h:H,b:bytes,por:(SESSAO&&SESSAO.u)||'',d:[pags[0].w,pags[0].h]};save();
  try{audit('Avaliação','Teste digitalizado (selado)',t.nome+' · '+i.nome+' · n.º '+(a.num||'')+' · '+pags.length+' pág.')}catch(_){}}
const _dgCache=new Map();
async function dgLerPag(m,n){const ch=m.id+'-'+n;if(_dgCache.has(ch))return _dgCache.get(ch);const pr=(async()=>{const p=await sbObter();const txt=await p.ler(dgNome(m.id,n));if(txt==null)throw new Error('Página '+n+' não encontrada na base de dados.');
    const url=await nvDecifrar(txt,await nvChave());const ok=!m.h||!m.h[n-1]||(await dgSha(url))===m.h[n-1];return {url,ok}})();_dgCache.set(ch,pr);pr.catch(()=>_dgCache.delete(ch));
  if(_dgCache.size>60){const k0=_dgCache.keys().next().value;_dgCache.delete(k0)}return pr}

/* ---------- janela principal: lista de alunos do instrumento ---------- */
function dgPainel(iid,alunoDireto){const t=T();const i=t&&t.instrumentos.find(x=>x.id===iid);if(!i)return;if(!dgEscrito(i))return toast('A Produção Oral não tem folha de teste para digitalizar.','aviso');
  if(!window.__esPronto)return toast('Os dados ainda estão a abrir.','erro');
  $$('dialog.dgdlg').forEach(d=>d.remove());const d=document.createElement('dialog');d.className='dgdlg';d.setAttribute('aria-labelledby','dg-t');document.body.appendChild(d);
  const fim=()=>{try{d.close()}catch(_){}d.remove();try{if(VIEW==='instrumentos')vInstrumentos()}catch(_){}};d.addEventListener('cancel',e=>{e.preventDefault();if(d.dataset.ocup)return;if(d.dataset.modo==='cap'){d._sairCap&&d._sairCap();return}fim()});
  const AL=(typeof alunosAval==='function'?alunosAval(t):t.alunos).slice().sort((a,b)=>(+a.num||0)-(+b.num||0));
  const lista=()=>{d.dataset.modo='lista';const feitos=AL.filter(a=>dgTem(t,i.id,a.id)).length;
    d.innerHTML=`<div class="dgw"><header class="dgh"><div><h2 id="dg-t">${ic('camera',18)} Testes Digitalizados</h2><p class="mut">${esc(t.nome)} · ${esc(i.nome)}${i.data?' · '+fmtD(i.data):''}</p></div><button type="button" class="btn ico" id="dg-x" aria-label="Fechar">${ic('x',16)}</button></header>
      <div class="dgprog"><div><i style="width:${AL.length?Math.round(100*feitos/AL.length):0}%"></i></div><span><b>${feitos}</b> de ${AL.length} alunos</span></div>
      <p class="hint" style="margin:0">Toque num aluno para fotografar as páginas do teste (1, 2, 3…) e enviar no fim. Depois de guardada, a digitalização fica <b>selada</b>: não pode ser alterada nem apagada.</p>
      <ul class="dgl">${AL.map(a=>{const m=dgTem(t,i.id,a.id);return `<li><button type="button" data-dga="${esc(a.id)}" class="${m?'ok':''}"><span class="dgn">${esc(a.num||'')}</span><span class="dgnm">${esc(a.nome)}</span>${m?`<span class="dgst ok">${ic('cadeado',13)} ${m.n} pág. · ${new Date(m.q).toLocaleDateString('pt-PT',{day:'numeric',month:'short'})}</span><span class="dgver">${ic('book',15)} Ver</span>`:`<span class="dgst">por digitalizar</span><span class="dgver pri">${ic('camera',15)} Fotografar</span>`}</button></li>`}).join('')}</ul></div>`;
    d.querySelector('#dg-x').onclick=fim;d.querySelectorAll('[data-dga]').forEach(b=>b.onclick=()=>{const a=AL.find(z=>z.id===b.dataset.dga);const m=dgTem(t,i.id,a.id);if(m)dgLivro(t,i,a);else captar(a)})};
  /* captar: página a página; só no fim se envia */
  const captar=a=>{d.dataset.modo='cap';const P=[];let ocup=false;
    const sair=()=>{if(ocup)return;if(P.length&&!confirm('Sair sem guardar as '+P.length+' página(s) fotografada(s)?'))return;lista()};d._sairCap=sair;
    const pinta=()=>{d.innerHTML=`<div class="dgw dgcap"><header class="dgh"><button type="button" class="btn ico" id="dg-v" aria-label="Voltar à lista">${ic('back',16)}</button><div><h2 id="dg-t">N.º ${esc(a.num||'')} · ${esc(a.nome)}</h2><p class="mut">${esc(i.nome)} · ${P.length?P.length+' página'+(P.length>1?'s':'')+' fotografada'+(P.length>1?'s':''):'nenhuma página ainda'}</p></div></header>
        <div class="dgthumbs" id="dg-th">${P.map((p,n)=>`<figure><img src="${p.url}" alt="Página ${n+1}"><figcaption>Pág. ${n+1}</figcaption><div class="dgta">${n>0?`<button type="button" data-dgm="${n}|-1" aria-label="Mover a página ${n+1} para antes">${ic('back',13)}</button>`:''}<button type="button" data-dgr="${n}" aria-label="Tirar a página ${n+1}">${ic('trash',13)}</button></div></figure>`).join('')}
          ${P.length<DG_MAXP?`<label class="dgadd" tabindex="0" role="button">${ic('camera',26)}<b>${P.length?'Fotografar a página '+(P.length+1):'Fotografar a página 1'}</b><input type="file" accept="image/*" capture="environment" id="dg-cam" hidden></label>`:''}</div>
        <p class="nverr" role="alert" id="dg-e"></p>
        <div class="row dga">${P.length<DG_MAXP?`<label class="btn" tabindex="0">${ic('upload',15)} Escolher da Galeria<input type="file" accept="image/*" multiple id="dg-gal" hidden></label>`:''}<span class="sp1"></span><button type="button" class="btn pri" id="dg-ok" ${P.length?'':'disabled'}>${ic('cadeado',15)} Guardar ${P.length||''} Página${P.length===1?'':'s'}</button></div>
        <p class="hint" style="margin:0">Fotografe todas as páginas pela ordem. Confirme que se lê bem. Só ao «Guardar» é que as páginas são enviadas — e a partir daí <b>não podem ser alteradas nem apagadas</b>.</p></div>`;
      d.querySelector('#dg-v').onclick=sair;
      const junta=async files=>{const e=d.querySelector('#dg-e');for(const f of [...files]){if(P.length>=DG_MAXP)break;try{P.push(await dgImagem(f))}catch(x){e.textContent=(x&&x.message)||'Não foi possível ler a fotografia.'}}pinta();const th=d.querySelector('#dg-th');if(th)th.scrollLeft=th.scrollWidth};
      const cam=d.querySelector('#dg-cam');if(cam)cam.onchange=()=>cam.files.length&&junta(cam.files);const gal=d.querySelector('#dg-gal');if(gal)gal.onchange=()=>gal.files.length&&junta(gal.files);
      d.querySelectorAll('label[role=button],label.btn').forEach(l=>l.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();l.querySelector('input').click()}}));
      d.querySelectorAll('[data-dgr]').forEach(b=>b.onclick=()=>{P.splice(+b.dataset.dgr,1);pinta()});
      d.querySelectorAll('[data-dgm]').forEach(b=>b.onclick=()=>{const [n,dx]=b.dataset.dgm.split('|').map(Number);const x=P.splice(n,1)[0];P.splice(n+dx,0,x);pinta()});
      d.querySelector('#dg-ok').onclick=async()=>{if(!P.length||ocup)return;
        if(!confirm('Guardar '+P.length+' página(s) do teste de '+a.nome+'?\n\nDepois de guardada, a digitalização fica selada: não pode ser alterada, substituída nem apagada.'))return;
        ocup=true;d.dataset.ocup=1;const b=d.querySelector('#dg-ok');d.querySelectorAll('button,label.btn,.dgadd').forEach(x=>{x.disabled=true;x.style.pointerEvents='none'});
        try{await dgGuardar(t,i,a,P,(n,tot)=>{b.innerHTML=ic('refresh',15)+(n<tot?' A enviar a página '+(n+1)+' de '+tot+'…':' A selar…')});
          delete d.dataset.ocup;ocup=false;toast('Teste de '+a.nome.split(' ')[0]+' guardado e selado ('+P.length+' pág.)','ok');
          const prox=AL.find(z=>!dgTem(t,i.id,z.id)&&(+z.num||0)>(+a.num||0))||AL.find(z=>!dgTem(t,i.id,z.id));if(prox&&d.dataset.seg!=='0')captar(prox);else lista()}
        catch(x){delete d.dataset.ocup;ocup=false;pinta();const e=d.querySelector('#dg-e');if(e)e.textContent=(x&&x.message)||'Não foi possível guardar.'}}};
    pinta()};
  try{d.showModal()}catch(_){d.setAttribute('open','')}
  const a0=alunoDireto&&AL.find(z=>z.id===alunoDireto);if(a0){if(dgTem(t,i.id,a0.id)){lista();dgLivro(t,i,a0)}else captar(a0)}else lista()}

/* ---------- ver em livro (só leitura) ---------- */
function dgLivro(t,i,a){const m=dgTem(t,i.id,a.id);if(!m)return;$$('dialog.dglv').forEach(x=>x.remove());const d=document.createElement('dialog');d.className='dglv';d.setAttribute('aria-label','Teste digitalizado de '+a.nome);document.body.appendChild(d);
  let pg=1,zoom=false;const duplo=()=>innerWidth>=900&&innerWidth>innerHeight&&m.n>1&&!zoom;
  /* em livro: a capa (pág. 1) fica sozinha à direita; depois 2-3, 4-5… */
  const par=()=>{if(!duplo())return [pg];if(pg===1)return [null,1];const e=pg%2===0?pg:pg-1;return [e,e+1<=m.n?e+1:null]};
  const ir=n=>{n=Math.max(1,Math.min(m.n,n));if(n===pg)return;const frente=n>pg;pg=n;pinta(frente?'f':'t')};
  const passo=s=>{if(!duplo())return ir(pg+s);const e=pg===1?0:(pg%2===0?pg:pg-1);const n=e+2*s;ir(n<=0?1:Math.min(m.n,n))};
  d.innerHTML=`<div class="dglw"><header class="dglh"><div><b>N.º ${esc(a.num||'')} · ${esc(a.nome)}</b><span>${esc(t.nome)} · ${esc(i.nome)}${i.data?' · '+fmtD(i.data):''}</span></div>
      <span class="dgselo" title="Digitalizado a ${esc(new Date(m.q).toLocaleString('pt-PT'))}${m.por?' por '+esc(m.por):''}. Não pode ser alterado nem apagado.">${ic('cadeado',13)} Selado · ${esc(new Date(m.q).toLocaleDateString('pt-PT',{day:'numeric',month:'short',year:'numeric'}))}</span>
      <button type="button" class="btn ico" id="lv-z" aria-label="Aumentar a página" aria-pressed="false">${ic('search',16)}</button><button type="button" class="btn ico" id="lv-x" aria-label="Fechar">${ic('x',16)}</button></header>
    <div class="dglb" id="lv-b"><button type="button" class="dgnav e" id="lv-a" aria-label="Página anterior">${ic('back',22)}</button><div class="dgbook" id="lv-k" aria-live="polite"></div><button type="button" class="dgnav d" id="lv-s" aria-label="Página seguinte">${ic('back',22)}</button></div>
    <footer class="dglf"><span id="lv-n"></span><input type="range" id="lv-r" min="1" max="${m.n}" value="1" aria-label="Ir para a página" ${m.n<2?'hidden':''}><span id="lv-i" class="dgint"></span></footer></div>`;
  const K=d.querySelector('#lv-k');
  const folha=(n,lado)=>{if(n==null)return `<div class="dgpg vazia ${lado}"></div>`;return `<div class="dgpg ${lado}" data-pn="${n}"><div class="dgesp"><span class="spin2"></span></div><span class="dgpn">${n}</span></div>`};
  const pinta=dir=>{const L=par();K.className='dgbook'+(L.length>1?' duplo':'')+(zoom?' zoom':'')+(dir?' vira-'+dir:'');K.innerHTML=L.length>1?folha(L[0],'esq')+folha(L[1],'dir'):folha(L[0],'so');
    const vis=L.filter(x=>x!=null);d.querySelector('#lv-n').textContent=(vis.length>1?'Páginas '+vis[0]+'–'+vis[1]:'Página '+vis[0])+' de '+m.n;d.querySelector('#lv-r').value=pg;
    d.querySelector('#lv-a').disabled=pg<=1;d.querySelector('#lv-s').disabled=Math.max(...vis)>=m.n;
    vis.forEach(n=>dgLerPag(m,n).then(r=>{const c=K.querySelector('[data-pn="'+n+'"]');if(!c)return;c.querySelector('.dgesp').outerHTML=`<img src="${r.url}" alt="Página ${n} do teste de ${esc(a.nome)}" draggable="false">`;
        const it=d.querySelector('#lv-i');if(!r.ok){it.className='dgint bad';it.innerHTML=ic('alert',13)+' A página '+n+' não coincide com o selo original'}else if(!it.classList.contains('bad')){it.className='dgint ok';it.innerHTML=ic('check',13)+' Íntegro'}})
      .catch(e=>{const c=K.querySelector('[data-pn="'+n+'"] .dgesp');if(c)c.innerHTML='<span class="mut">'+esc((e&&e.message)||'Não foi possível abrir a página.')+'</span>'}));
    /* adiantar as páginas seguintes */
    [Math.max(...vis)+1,Math.max(...vis)+2].filter(n=>n<=m.n).forEach(n=>dgLerPag(m,n).catch(()=>{}));setTimeout(()=>K.classList.remove('vira-f','vira-t'),380)};
  const sai=()=>{removeEventListener('resize',rs);try{d.close()}catch(_){}d.remove()};const rs=()=>pinta();addEventListener('resize',rs);
  d.addEventListener('cancel',e=>{e.preventDefault();sai()});d.querySelector('#lv-x').onclick=sai;d.querySelector('#lv-a').onclick=()=>passo(-1);d.querySelector('#lv-s').onclick=()=>passo(1);
  d.querySelector('#lv-r').oninput=e=>ir(+e.target.value);
  const zb=d.querySelector('#lv-z');zb.onclick=()=>{zoom=!zoom;zb.setAttribute('aria-pressed',zoom);zb.classList.toggle('pri',zoom);pinta()};
  d.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();passo(1)}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();passo(-1)}else if(e.key==='Home')ir(1);else if(e.key==='End')ir(m.n)});
  {let x0=null,y0=0;K.addEventListener('touchstart',e=>{if(zoom||e.touches.length>1){x0=null;return}x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
    K.addEventListener('touchend',e=>{if(x0==null)return;const t1=e.changedTouches[0];const dx=t1.clientX-x0,dy=t1.clientY-y0;x0=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4)passo(dx<0?1:-1)},{passive:true})}
  K.addEventListener('dblclick',()=>zb.click());d.addEventListener('contextmenu',e=>{if(e.target.tagName==='IMG')e.preventDefault()});
  try{d.showModal()}catch(_){d.setAttribute('open','')}pinta()}

/* ---------- onde aparece: lista de instrumentos, instrumento aberto e Perfil/ficha do aluno ---------- */
{const _vI=vInstrumentos;vInstrumentos=function(){const r=_vI.apply(this,arguments);try{const t=T();if(t&&window.__esPronto){const tot=(typeof alunosAval==='function'?alunosAval(t):t.alunos).length;
    $$('#view tr[data-irow]').forEach(tr=>{const i=t.instrumentos.find(x=>x.id===tr.dataset.irow);const td=tr.querySelector('td.act');if(!i||!td||!dgEscrito(i)||td.querySelector('[data-dg]'))return;const n=dgConta(t,i);
      const b=document.createElement('button');b.type='button';b.className='btn sm'+(n?' dgtem':'');b.dataset.dg=i.id;b.title='Guardar a folha de teste de cada aluno (fotografias pelo telemóvel) e vê-las em livro';b.innerHTML=ic('camera',13)+(n?' '+n+'/'+tot:' Digitalizar');b.onclick=e=>{e.stopPropagation();dgPainel(i.id)};td.prepend(b,document.createTextNode(' '))});
    if(UI.inst){const i=t.instrumentos.find(x=>x.id===UI.inst);const bx=$('#barx');if(i&&dgEscrito(i)&&bx&&!bx.querySelector('#b-dg')){const n=dgConta(t,i);const b=document.createElement('button');b.type='button';b.className='btn';b.id='b-dg';b.innerHTML=ic('camera',15)+' Testes Digitalizados'+(n?' ('+n+')':'');b.onclick=()=>dgPainel(i.id);bx.appendChild(b);try{cabecalho()}catch(_){}}}}}catch(e){console.warn(e)}return r};
  if(go._f)Object.keys(go._f).forEach(k=>{if(go._f[k]===_vI||(go._f[k]&&go._f[k].__orig===_vI))go._f[k]=vInstrumentos})}
(()=>{const st=document.createElement('style');st.textContent=`
dialog.dgdlg{border:0;border-radius:22px;padding:0;width:min(720px,96vw);max-height:94vh;overflow:auto;background:var(--panel);color:var(--ink);box-shadow:0 30px 80px rgba(0,0,0,.35)}dialog.dgdlg::backdrop,dialog.dglv::backdrop{background:rgba(10,20,35,.6)}
.dgw{padding:18px 20px;display:flex;flex-direction:column;gap:12px}.dgh{display:flex;align-items:flex-start;gap:10px}.dgh>div{flex:1;min-width:0}.dgh h2{margin:0;font-size:19px;display:flex;gap:8px;align-items:center;text-transform:none;color:var(--ink)}.dgh p{margin:2px 0 0;font-size:13.5px}
.dgprog{display:flex;align-items:center;gap:12px;font-size:14px}.dgprog>div{flex:1;height:8px;border-radius:99px;background:var(--bg);overflow:hidden}.dgprog i{display:block;height:100%;background:#16a34a;border-radius:99px}
.dgl{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}.dgl button{width:100%;display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 12px;border:1px solid var(--line);border-radius:12px;background:var(--panel);color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.dgl button:hover{border-color:var(--acc)}.dgl button.ok{background:color-mix(in srgb,#16a34a 6%,var(--panel))}.dgn{min-width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:var(--bg);font-weight:700;font-size:13.5px;flex:none}.dgnm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
.dgst{font-size:12.5px;color:var(--mut);display:inline-flex;gap:4px;align-items:center;white-space:nowrap}.dgst.ok{color:#15803d}.dgver{display:inline-flex;gap:5px;align-items:center;font-size:13px;font-weight:700;color:var(--acc);white-space:nowrap}
.dgthumbs{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 10px;align-items:stretch;scroll-snap-type:x proximity}.dgthumbs figure{margin:0;flex:none;width:132px;position:relative;scroll-snap-align:start}.dgthumbs img{display:block;width:132px;height:186px;object-fit:cover;border-radius:10px;border:1px solid var(--line);background:#fff}
.dgthumbs figcaption{text-align:center;font-size:12.5px;font-weight:700;margin-top:4px}.dgta{position:absolute;top:6px;right:6px;display:flex;gap:4px}.dgta button{width:30px;height:30px;border-radius:8px;border:0;background:rgba(17,24,39,.72);color:#fff;display:grid;place-items:center;cursor:pointer}
.dgadd{flex:none;width:150px;min-height:186px;border:2px dashed var(--acc);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;padding:10px;color:var(--acc);cursor:pointer;background:color-mix(in srgb,var(--acc) 6%,transparent);font-size:14px}.dgcap .dgthumbs:has(.dgadd:only-child) .dgadd{width:100%;min-height:220px;font-size:17px}
.dga{gap:8px;flex-wrap:wrap}.dga .btn{min-height:46px}.btn.dgtem{color:#15803d;border-color:color-mix(in srgb,#16a34a 45%,var(--line))}
dialog.dglv{border:0;padding:0;margin:0;width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:100dvh;background:#1f2937;color:#fff}
.dglw{display:flex;flex-direction:column;height:100%}.dglh{display:flex;align-items:center;gap:10px;padding:max(10px,env(safe-area-inset-top)) 14px 10px;background:#111827}.dglh>div{flex:1;min-width:0;display:flex;flex-direction:column}.dglh b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dglh span{font-size:12.5px;color:#cbd5e1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dglh .btn{background:rgba(255,255,255,.1);border-color:transparent;color:#fff}.dgselo{flex:none;display:inline-flex!important;gap:5px;align-items:center;padding:5px 10px;border-radius:99px;background:rgba(250,204,21,.16);color:#fde68a!important;font-weight:700;font-size:12px!important}
.dglb{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 4px;perspective:2400px}.dgnav{flex:none;width:44px;height:64px;border-radius:12px;border:0;background:rgba(255,255,255,.1);color:#fff;display:grid;place-items:center;cursor:pointer}.dgnav.d svg{transform:scaleX(-1)}.dgnav:disabled{opacity:.25;cursor:default}
.dgbook{flex:1;min-width:0;height:100%;display:flex;align-items:center;justify-content:center;gap:0}.dgpg{position:relative;height:100%;max-width:100%;display:flex;align-items:center;justify-content:center;background:#fff;box-shadow:0 12px 40px rgba(0,0,0,.45);overflow:hidden;aspect-ratio:${'210/297'}}
.dgbook.duplo .dgpg{max-width:50%}.dgpg.esq{border-radius:6px 0 0 6px;box-shadow:inset -18px 0 24px -18px rgba(0,0,0,.35),0 12px 40px rgba(0,0,0,.45)}.dgpg.dir{border-radius:0 6px 6px 0;box-shadow:inset 18px 0 24px -18px rgba(0,0,0,.35),0 12px 40px rgba(0,0,0,.45)}.dgpg.so{border-radius:6px}.dgpg.vazia{background:transparent;box-shadow:none}
.dgpg img{width:100%;height:100%;object-fit:contain;display:block;user-select:none;-webkit-user-drag:none}.dgpn{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-size:11px;color:#475569;background:rgba(255,255,255,.85);border-radius:99px;padding:1px 8px}.dgesp{color:#475569;display:grid;place-items:center;padding:20px;text-align:center}
.dgbook.zoom{overflow:auto;align-items:flex-start;justify-content:flex-start}.dgbook.zoom .dgpg{height:auto;width:max(100%,1100px);max-width:none;aspect-ratio:auto;flex:none}.dgbook.zoom .dgpg img{height:auto}
.dgbook.vira-f .dgpg.dir,.dgbook.vira-f .dgpg.so{animation:dgvf .36s ease-out;transform-origin:left center}.dgbook.vira-t .dgpg.esq,.dgbook.vira-t .dgpg.so{animation:dgvt .36s ease-out;transform-origin:right center}
@keyframes dgvf{from{transform:rotateY(-70deg);opacity:.4}to{transform:none;opacity:1}}@keyframes dgvt{from{transform:rotateY(70deg);opacity:.4}to{transform:none;opacity:1}}@media (prefers-reduced-motion:reduce){.dgbook .dgpg{animation:none!important}}
.dglf{display:flex;align-items:center;gap:12px;padding:8px 14px max(10px,env(safe-area-inset-bottom));background:#111827;font-size:13.5px}.dglf input{flex:1;min-width:0}.dgint{display:inline-flex;gap:4px;align-items:center;font-size:12.5px}.dgint.ok{color:#86efac}.dgint.bad{color:#fca5a5;font-weight:700}
.spin2{width:26px;height:26px;border-radius:50%;border:3px solid #cbd5e1;border-top-color:#0e6a93;animation:escf .8s linear infinite;display:block}
@media (max-width:640px){dialog.dgdlg{width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0}.dgst:not(.ok){display:none}.dgnav{display:none}.dglb{padding:6px 0}.dga .btn{flex:1 1 100%;justify-content:center}.dgselo{font-size:11px!important;padding:4px 8px}}`;document.head.appendChild(st)})();
