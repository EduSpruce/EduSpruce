/* ===================== SpruceNote Web Clipper (extensão do Chrome, igual à do Milanote) =====================
   A extensão guarda cada recorte (imagem, texto, ligação ou vídeo) cifrado com a chave da conta numa linha nova
   «ef-f-snin-<id>.bin» da base de dados — nunca mexe nos dados da app. Aqui a app:
   · arruma esses recortes no quadro escolhido, numa coluna «Por Arrumar» (como o «Unsorted» do Milanote), e apaga a linha.
     Antes de arrumar, reclama a linha (muda-lhe o nome para ef-f-snic-…): dois aparelhos abertos nunca arrumam o mesmo recorte.
     A linha só é apagada depois de os dados da app estarem gravados na base de dados.
   · escreve em «ef-f-snidx.bin» (cifrada) a lista dos quadros do SpruceNote/JornalNote e dos abertos mais recentemente,
     que a extensão mostra em «Guardar em ▾»
   · abre um quadro pela ligação #sn=sn:<id> ou #sn=snj:<id> («Abrir» na extensão) */
const SNW_IN='ef-f-snin-',SNW_OC='ef-f-snic-',SNW_IDX='ef-f-snidx.bin',SNW_COL='Por Arrumar';
let _snwRec=null,_snwPend=[],_snwSig='',_snwIdxT=0,_snwOn=false,_snwProx=false,_snwUlt=0;
const snwPronto=()=>{try{const L=nvL();return !!(window.__esPronto&&L.prov==='supabase'&&(L.k||_nvK))}catch(_){return false}};
const snwGravado=()=>{try{return !Object.keys(nvL().mod||{}).length&&!_nvBusy}catch(_){return false}};
/* os quadros de cada contexto (sn = SpruceNote, snj = JornalNote), sem depender do que está aberto no ecrã */
function snwQuadros(c){const k=UI.mqCtx;UI.mqCtx=c==='snj'?'jornal':'prof';try{return MQ()}finally{UI.mqCtx=k}}
/* só os quadros ligados à raiz (os que estão na lixeira ficam de fora) */
function snwAlc(Q){const por=new Map(Q.filter(q=>q&&q.id).map(q=>[q.id,q]));const raiz=por.get('raiz')||Q[0];if(!raiz)return new Set();const vis=new Set([raiz.id]),fila=[raiz];
  while(fila.length){const q=fila.shift();(q.itens||[]).forEach(it=>{if(it&&it.t==='quadro'&&it.ref&&por.has(it.ref)&&!vis.has(it.ref)){vis.add(it.ref);fila.push(por.get(it.ref))}})}return vis}
const snwLista=Q=>{const v=snwAlc(Q);return Q.filter(q=>q&&v.has(q.id)).map(q=>({id:q.id,nome:String(q.nome||'Quadro'),pai:q.pai||null,cor:q.cor||''}))};

/* ---------- lista dos quadros para a extensão ---------- */
function snwIndice(){const o={v:1,rec:(_snwRec||[]).slice(0,12),sn:{quadros:snwLista(snwQuadros('sn'))}};
  if(S.snj&&Array.isArray(S.snj.quadros)&&S.snj.quadros.length)o.snj={quadros:snwLista(snwQuadros('snj'))};return o}
async function snwIdxLer(){try{const p=await sbObter();const t=await p.ler(SNW_IDX);if(!t)_snwRec=[];else{const o=JSON.parse(await nvDecifrar(t,await nvChave()));
    _snwRec=Array.isArray(o.rec)?o.rec.filter(x=>x&&x.id&&(x.c==='sn'||x.c==='snj')):[];const c={...o};delete c.q;_snwSig=JSON.stringify(c)}}catch(_){if(_snwRec===null)_snwRec=[]}
  /* quadros abertos antes de a lista chegar da base de dados */
  if(_snwPend.length){const P=_snwPend;_snwPend=[];_snwRec=[...P,..._snwRec.filter(x=>!P.some(y=>y.c===x.c&&y.id===x.id))].slice(0,12)}}
async function snwIdxGravar(){if(!snwPronto()||_snwRec===null)return;const o=snwIndice(),sig=JSON.stringify(o);if(sig===_snwSig)return;const k=await nvChave();if(!k)return;
  o.q=Date.now();await PROV.supabase.escrever(SNW_IDX,await nvCifrar(JSON.stringify(o),k));_snwSig=sig}
function snwIdxAgendar(ms){clearTimeout(_snwIdxT);_snwIdxT=setTimeout(()=>{snwIdxGravar().catch(e=>console.warn('[EduSpruce] lista de quadros para a extensão:',e&&e.message))},ms==null?2500:ms)}
function snwVisto(c,id){if(!id)return;const junta=L=>[{c,id},...L.filter(x=>!(x.c===c&&x.id===id))].slice(0,12);
  if(_snwRec===null){_snwPend=junta(_snwPend);return}_snwRec=junta(_snwRec);snwIdxAgendar()}
{const _a=mqAbrir;mqAbrir=function(id){const r=_a.apply(this,arguments);try{snwVisto(UI.mqCtx==='jornal'?'snj':'sn',id)}catch(_){}return r}}
{const _v=mqVista;mqVista=function(){const r=_v.apply(this,arguments);try{snwVisto(UI.mqCtx==='jornal'?'snj':'sn',mqUI().q);snwTalvez()}catch(_){}return r}}
{const _s=save;save=function(){const r=_s.apply(this,arguments);try{if(_snwRec!==null)snwIdxAgendar(4000)}catch(_){}return r}}

/* ---------- arrumar os recortes ---------- */
const snwOk=()=>{S.snWeb=S.snWeb&&typeof S.snWeb==='object'?S.snWeb:{};S.snWeb.ok=Array.isArray(S.snWeb.ok)?S.snWeb.ok:[];return S.snWeb.ok};
function snwItem(o){const s=o.it||{},t=s.t,tx=(v,n)=>String(v==null?'':v).slice(0,n),url=u=>/^https?:\/\/\S+$/i.test(String(u||''));
  const base={id:uid(),t,x:0,y:0,cor:'',pai:null};const fonte=o.fonte&&url(o.fonte.url)?{fonte:String(o.fonte.url).slice(0,2000)}:{};
  if(t==='nota'){const h=mqLimpa(tx(s.txt,60000));return h.replace(/<[^>]*>/g,'').trim()?{...base,w:220,txt:h,...fonte}:null}
  if(t==='link')return url(s.url)?{...base,w:240,url:s.url,tit:tx(s.tit,300),desc:tx(s.desc,600),...fonte}:null;
  if(t==='video')return url(s.url)?{...base,w:380,url:s.url,tit:tx(s.tit,300),...fonte}:null;
  if(t==='imagem'){const u=String(o.img||'');if(!/^data:image\/(png|jpe?g|gif|webp|avif|bmp|svg\+xml);base64,/i.test(u))return null;const fid='mq:'+uid();FOTOS[fid]=u;try{idbPor(fid,u)}catch(_){}
    return {...base,w:Math.min(320,Math.max(160,+s.w||220)),fid,leg:tx(s.leg,300),...fonte}}
  return null}
/* põe o recorte no topo da coluna «Por Arrumar» do quadro (cria-a à esquerda do que já lá está) */
function snwArrumar(o){const c=o.c==='snj'?'snj':'sn';const Q=snwQuadros(c),vis=snwAlc(Q);let q=Q.find(x=>x.id===o.quadro);if(!q||!vis.has(q.id))q=Q.find(x=>x.id==='raiz')||Q[0];if(!q)return false;
  const it=snwItem(o);if(!it)return false;let col=q.itens.find(x=>x&&x.t==='coluna'&&x.recolha&&!x.pai),nova=false;
  if(!col){const top=q.itens.filter(x=>x&&!x.pai);const x0=top.length?Math.min(...top.map(x=>+x.x||0))-310:40,y0=top.length?Math.min(...top.map(x=>+x.y||0)):40;
    col={id:uid(),t:'coluna',x:Math.round(x0),y:Math.round(y0),w:270,cor:'',pai:null,tit:SNW_COL,recolha:1};q.itens.push(col);nova=true}
  const F=q.itens.filter(x=>x&&x.pai===col.id);it.pai=col.id;it.o=(F.length?Math.min(...F.map(x=>+x.o||0)):0)-1;q.itens.push(it);return {c,q:q.id,nova}}
async function snwEsperarGravado(){await new Promise(r=>setTimeout(r,900));const t0=Date.now();while(Date.now()-t0<45000){if(snwGravado())return true;await new Promise(r=>setTimeout(r,600))}return false}
async function snwRecolher(){if(_snwOn){_snwProx=true;return}if(!snwPronto())return;_snwOn=true;_snwUlt=Date.now();
  try{const p=await sbObter(),cli=p&&p.cliente;if(!cli)return;const T='eduspruce_partes';
    const {data,error}=await cli.from(T).select('nome,atualizado').like('nome','ef-f-sni%').order('nome').limit(200);if(error)throw error;
    const agora=Date.now(),L=(data||[]).filter(r=>r.nome.startsWith(SNW_IN)||(r.nome.startsWith(SNW_OC)&&agora-Date.parse(r.atualizado)>15*60e3));if(!L.length)return;
    const OK=new Set(snwOk()),gravado=snwGravado(),k=await nvChave();if(!k)return;const novos=[],apagar=[];
    for(const r of L){const id=r.nome.slice(SNW_IN.length).replace(/\.bin$/,'');let nome=r.nome;
      if(OK.has(id)){if(gravado)apagar.push(nome);continue}                     /* já arrumado (e gravado) noutra vez */
      if(nome.startsWith(SNW_IN)){const oc=SNW_OC+id+'.bin';const u=await cli.from(T).update({nome:oc,atualizado:new Date().toISOString()}).eq('nome',nome).select('nome');
        if(u.error)throw u.error;if(!u.data||!u.data.length)continue;nome=oc}         /* outro aparelho reclamou-o primeiro */
      else{const u=await cli.from(T).update({atualizado:new Date().toISOString()}).eq('nome',nome).eq('atualizado',r.atualizado).select('nome');if(u.error||!u.data||!u.data.length)continue}
      const d=await cli.from(T).select('conteudo').eq('nome',nome).maybeSingle();if(d.error||!d.data)continue;
      let o=null;try{o=JSON.parse(await nvDecifrar(d.data.conteudo,k))}catch(e){console.warn('[EduSpruce] recorte da extensão ilegível',nome);continue}
      novos.push({id,nome,o})}
    if(novos.length){let n=0;const onde=[];for(const x of novos){try{const r=snwArrumar(x.o);if(r){n++;onde.push(r)}}catch(e){console.warn('[EduSpruce] recorte',e)}}
      const ok=snwOk();novos.forEach(x=>ok.push(x.id));if(ok.length>300)ok.splice(0,ok.length-300);save();
      /* se o quadro está à vista: mostra os recortes; se a coluna é nova, ajusta o quadro ao ecrã para ela aparecer */
      try{if((VIEW==='sprucenote'||VIEW==='snjornal')&&!_mqEd&&$('#mq-its')){mqRender();const c=VIEW==='snjornal'?'snj':'sn',u=mqUI();if(onde.some(w=>w.nova&&w.c===c&&w.q===u.q)&&$('#mq-zf'))$('#mq-zf').click()}}catch(_){}
      if(n)toast((n===1?'Chegou 1 recorte da Web':'Chegaram '+n+' recortes da Web')+' ao '+(onde.every(w=>w.c==='snj')?'JornalNote':'SpruceNote')+' (coluna «'+SNW_COL+'»).','ok');
      if(await snwEsperarGravado())novos.forEach(x=>apagar.push(x.nome))}
    for(const n of apagar){try{await cli.from(T).delete().eq('nome',n)}catch(_){}}}
  catch(e){console.warn('[EduSpruce] recortes da extensão:',e&&e.message)}
  finally{_snwOn=false;if(_snwProx){_snwProx=false;setTimeout(snwRecolher,600)}}}
const snwTalvez=()=>{if(Date.now()-_snwUlt>15000)snwRecolher()};
/* quando chega um aviso de mudança (tempo real), ao voltar ao separador e de minuto e meio a minuto e meio */
{const _p=sbPuxar;sbPuxar=function(){const r=_p.apply(this,arguments);clearTimeout(snwRecolher._t);snwRecolher._t=setTimeout(snwRecolher,1200);return r}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')snwTalvez()});
setInterval(()=>{if(document.visibilityState==='visible')snwTalvez()},90000);
setTimeout(function snwArranque(){if(!snwPronto())return setTimeout(snwArranque,3000);snwIdxLer().then(()=>{snwIdxAgendar(2000);snwRecolher()})},4000);

/* ---------- abrir um quadro pela ligação (#sn=sn:<id>) ---------- */
let _snwLig=null;
function snwHash(){const m=String(location.hash||'').match(/^#sn=(sn|snj):(.+)$/);if(!m)return false;let id=m[2];try{id=decodeURIComponent(id)}catch(_){}_snwLig={c:m[1],id};
  try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}return true}
function snwLigacaoIr(){const l=_snwLig;if(!l)return;_snwLig=null;setTimeout(()=>{try{if(l.c==='snj'){UI.mqCtx='jornal';mqUI().q=l.id;go('snjornal')}else{UI.mqCtx='prof';mqUI().q=l.id;go('sprucenote')}}catch(e){console.warn('[EduSpruce] abrir quadro',e)}},300)}
snwHash();
{const _pc=esPosCarga;esPosCarga=async function(){const r=await _pc.apply(this,arguments);try{snwLigacaoIr()}catch(_){}return r}}
window.addEventListener('hashchange',()=>{if(snwHash()&&window.__esPronto)snwLigacaoIr()});
/* 1.086 — Início: atalho para instalar o SpruceNote Web Clipper, no espaço livre da barra de cima (à esquerda das apps).
   Só no Chrome/Edge de computador, com o SpruceNote ligado e a extensão ainda por instalar (a extensão marca a página com data-sn-clipper). */
const SNW_ZIP='extensao/sprucenote-web-clipper.zip';
const snwChipVer=()=>{try{if(typeof snOn==='function'&&!snOn())return false;if(document.documentElement.hasAttribute('data-sn-clipper'))return false;if(S.snWeb&&S.snWeb.dicaX)return false;
  const u=navigator.userAgent;return /Chrome\//.test(u)&&!/Mobile|Android|CriOS|iPad|iPhone/.test(u)&&!(navigator.maxTouchPoints>1&&/Macintosh/.test(u)&&!/Chrome/.test(u))}catch(_){return false}};
if(typeof dashTopo==='function'){const _dtSnw=dashTopo;dashTopo=function(){const h=_dtSnw.apply(this,arguments);try{if(!snwChipVer())return h;
  const a=(typeof HUB_APPS!=='undefined'&&HUB_APPS.find(x=>x.id==='sprucenote'))||null;const ico=a&&typeof hubIcone==='function'?hubIcone(a,30):ic('nvsn',18);
  const chip=`<div class="snw-chip" role="group" aria-label="SpruceNote Web Clipper"><button type="button" class="snw-chip-b" data-snw="info" title="Guarde imagens, texto, ligações e vídeos de qualquer site nos quadros do SpruceNote">${ico}<span class="snw-chip-t"><b>SpruceNote Web Clipper</b><small>Guardar da web nos seus quadros</small></span><span class="snw-chip-i">${ic('download',14)} Instalar</span></button><button type="button" class="snw-chip-x" data-snw="x" title="Não mostrar mais" aria-label="Não mostrar mais">${ic('x',14)}</button></div>`;
  const k=h.indexOf('<div class="hub-mini"');if(k>=0){const t=h.indexOf('hbm-todas',k),e=t<0?-1:h.indexOf('</div>',t);if(e>0)return h.slice(0,k)+'<div class="hub-grp">'+chip+h.slice(k,e+6)+'</div>'+h.slice(e+6);return h.slice(0,k)+chip+h.slice(k)}const j=h.lastIndexOf('</div>');return j<0?h+chip:h.slice(0,j)+chip+h.slice(j)}catch(e){console.warn(e);return h}}}
function snwInstalar(){openDrawer('SpruceNote Web Clipper',`
  <p style="margin-top:0">Extensão do Chrome (e do Edge) para guardar <b>imagens, texto, ligações e vídeos</b> de qualquer site nos seus quadros do SpruceNote, como no Milanote. Os recortes chegam à coluna <b>«Por Arrumar»</b> do quadro escolhido.</p>
  <a class="btn pri" href="${SNW_ZIP}" download>${ic('download',14)} Descarregar a extensão (.zip)</a>
  <h3 style="margin:20px 0 6px">Instalar (uma vez)</h3>
  <ol class="snw-passos"><li>Descompacte o ficheiro <b>sprucenote-web-clipper.zip</b>.</li><li>No Chrome, abra <b>chrome://extensions</b> e ligue o <b>Modo de programador</b> (canto superior direito).</li><li>Carregue em <b>Carregar expandida</b> e escolha a pasta <b>sprucenote-web-clipper</b>.</li><li>Fixe o ícone na barra do Chrome (peça de puzzle › alfinete).</li><li>Nas <b>Opções</b> da extensão, entre com a mesma conta Google da EduSpruce.</li></ol>
  <h3 style="margin:20px 0 6px">Usar</h3>
  <ul class="snw-passos"><li><b>Imagens:</b> passe o rato por cima e carregue em «Guardar».</li><li><b>Texto:</b> selecione, botão direito › <b>Guardar no SpruceNote</b>.</li><li><b>Páginas e vídeos</b> (YouTube, Vimeo): ícone na barra do Chrome ou <b>Alt+Shift+S</b>.</li><li>«Guardar em ▾» escolhe o quadro: o principal ou um dos 10 abertos mais recentemente.</li></ul>
  <p class="mut">Os recortes vão cifrados com a chave da sua conta, como os restantes dados. Não funciona no iPad nem no telemóvel.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><button type="button" class="btn" data-snw="ajuda">${ic('help',14)} Ver na Ajuda</button><button type="button" class="btn ghost" data-snw="x">Já instalei · não mostrar mais</button></div>`)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-snw]');if(!b)return;const k=b.dataset.snw;
  if(k==='info'){snwInstalar();return}
  if(k==='ajuda'){try{closeDrawer()}catch(_){}UI.ajQ='Web Clipper';go('ajuda');return}
  if(k==='x'){S.snWeb=S.snWeb&&typeof S.snWeb==='object'?S.snWeb:{};S.snWeb.dicaX=1;save();try{closeDrawer()}catch(_){}document.querySelectorAll('.snw-chip').forEach(c=>c.remove());try{hubMiniAjusta()}catch(_){}toast('Pode instalar mais tarde em Ajuda › SpruceNote Web Clipper','ok')}});
/* a extensão marca a página depois de a app arrancar: tira o atalho */
try{new MutationObserver(()=>{if(document.documentElement.hasAttribute('data-sn-clipper'))document.querySelectorAll('.snw-chip').forEach(c=>c.remove())}).observe(document.documentElement,{attributes:true,attributeFilter:['data-sn-clipper']})}catch(_){}
{const s=document.createElement('style');s.textContent=`
html body .snw-chip{margin-left:auto;display:flex!important;flex-wrap:nowrap!important;flex:0 1 auto;align-self:center;align-items:stretch;border:1px solid var(--line);background:var(--panel);border-radius:12px;min-width:0;flex:0 1 auto;overflow:hidden}
html body .snw-chip:not(.dtop .snw-chip){align-self:flex-end;height:38px;box-sizing:border-box}html body .snw-chip:not(.dtop .snw-chip) .snw-chip-b{padding:2px 8px 2px 4px}html body .snw-chip:not(.dtop .snw-chip) .hbic{width:28px!important;height:28px!important}
html body .snw-chip+.hub-mini{margin-left:10px!important}
html body .snw-chip>button{margin:0!important;height:auto!important;min-height:0!important;box-shadow:none!important}
html body .snw-chip-b{display:flex;align-items:center;gap:10px;border:0;background:transparent;padding:5px 10px 5px 6px;cursor:pointer;min-width:0;text-align:left;color:inherit;font:inherit}
html body .snw-chip-b:hover{background:color-mix(in srgb,var(--acc) 8%,transparent)}
html body .snw-chip-b .hbic{flex:none;box-shadow:none}
html body .snw-chip-t{display:flex;flex-direction:column;min-width:0;line-height:1.2}
html body .snw-chip-t b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html body .snw-chip-t small{font-size:11.5px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html body .snw-chip-i{flex:none;display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--acc);padding:4px 8px;border-radius:8px;background:color-mix(in srgb,var(--acc) 10%,transparent)}
html body .snw-chip-x{border:0;border-left:1px solid var(--line);background:transparent;color:var(--mut);padding:0 8px;cursor:pointer}
html body .snw-chip-x:hover{color:var(--ink,inherit);background:color-mix(in srgb,var(--acc) 8%,transparent)}
html body .hub-grp{display:flex;align-items:stretch;gap:10px;margin-left:auto;flex-wrap:nowrap;min-width:0}
html body .hub-grp>.snw-chip,html body .hub-grp>.hub-mini{margin-left:0!important;align-self:stretch!important;height:auto}
html body .hub-grp:not(.dtop .hub-grp){align-self:flex-end}
@media (max-width:700px){html body .hub-grp{margin-left:0;width:100%}html body .hub-grp>.hub-mini{flex:1 1 auto}}
html body .snw-passos{margin:0;padding-left:20px;line-height:1.6}
html body.est-sge .snw-chip,html body.est-sge .snw-wc,html body.est-sge .snw-wc *,html body.est-sge .snw-chip-i{border-radius:0}
@media (max-width:1100px){html body .snw-chip-t small{display:none}}
@media (max-width:860px){html body .snw-chip-t{display:none}}
@media (max-width:700px){html body .snw-chip{display:none!important}}

`;document.head.appendChild(s)}

/* 1.088 — Definições › Ferramentas: cartão que explica o SpruceNote Web Clipper (por baixo dos Avisos em Pop-up) */
function cartaoWebClipper(){const inst=document.documentElement.getAttribute('data-sn-clipper');const u=navigator.userAgent;const pc=/Chrome\//.test(u)&&!/Mobile|Android|CriOS|iPad|iPhone/.test(u);
  const a=(typeof HUB_APPS!=='undefined'&&HUB_APPS.find(x=>x.id==='sprucenote'))||null;const ico=a&&typeof hubIcone==='function'?hubIcone(a,40):ic('nvsn',20);
  const est=inst?`<div class="snw-est ok">${ic('check',14)} Extensão instalada neste navegador (versão ${esc(inst)})</div>`:pc?`<div class="snw-est">${ic('download',14)} Ainda não está instalada neste navegador</div>`:`<div class="snw-est">${ic('alert',14)} Só funciona no Chrome ou no Edge de computador</div>`;
  return `<div class="card snw-wc"><div class="snw-wc-h">${ico}<div><h2 style="margin:0">SpruceNote Web Clipper</h2><p class="hint" style="margin:2px 0 0">Extensão do Chrome para o SpruceNote</p></div></div>
  <p style="margin:12px 0 8px">Enquanto navega na internet, guarde o que encontrar diretamente nos seus <b>quadros do SpruceNote</b>, sem copiar e colar nem descarregar ficheiros — como o «Web Clipper» do Milanote.</p>
  <ul class="snw-lista">
   <li>${ic('image',14)}<span><b>Imagens</b> — passe o rato por cima e carregue em «Guardar».</span></li>
   <li>${ic('file',14)}<span><b>Texto</b> — selecione e use o botão direito › Guardar no SpruceNote.</span></li>
   <li>${ic('play',14)}<span><b>Páginas e vídeos</b> (YouTube, Vimeo) — ícone na barra do Chrome ou Alt+Shift+S.</span></li>
   <li>${ic('grid',14)}<span><b>Escolhe o quadro</b> — o principal ou um dos 10 abertos mais recentemente; tudo chega à coluna «Por Arrumar».</span></li>
   <li>${ic('shield',14)}<span><b>Privado</b> — os recortes vão cifrados com a chave da sua conta; nada fica no computador além da sessão.</span></li>
  </ul>
  <p class="hint" style="margin:8px 0 10px">Ideal para recolher imagens para uma ficha, citações para um teste ou vídeos para uma aula.</p>
  ${est}
  <div class="snw-wc-b">${inst?'':`<a class="btn pri" href="${SNW_ZIP}" download>${ic('download',14)} Descarregar</a>`}<button type="button" class="btn" data-snw="info">${ic('list',14)} Como instalar</button><button type="button" class="btn ghost" data-snw="ajuda">${ic('help',14)} Ajuda</button></div></div>`}
if(typeof defFerramentas==='function'){const _dfW=defFerramentas;defFerramentas=function(){const h=_dfW.apply(this,arguments);try{if(typeof snOn==='function'&&!snOn())return h;const c=cartaoWebClipper();
  const p=typeof cartaoTestePopups==='function'?cartaoTestePopups():'';if(p&&h.startsWith(p))return p+c+h.slice(p.length);return c+h}catch(e){console.warn(e);return h}}}
{const s=document.createElement('style');s.textContent=`
html body .snw-wc-h{display:flex;align-items:center;gap:12px}
html body .snw-wc-h .hbic{flex:none;box-shadow:none}
html body .snw-lista{list-style:none;margin:0;padding:0;display:grid;gap:7px}
html body .snw-lista li{display:flex;gap:8px;align-items:flex-start;line-height:1.4;font-size:13.5px}
html body .snw-lista li>svg{flex:none;margin-top:2px;color:var(--acc)}
html body .snw-est{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:8px 10px;border-radius:8px;background:color-mix(in srgb,var(--acc) 8%,transparent);color:var(--mut)}
html body .snw-est.ok{background:color-mix(in srgb,#1a8f4e 12%,transparent);color:#1a7a43}
html body .snw-wc-b{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
`;document.head.appendChild(s)}
