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
/* ilustração do cartão: página da web → recortes → quadro do SpruceNote (coluna «Por Arrumar») */
const SNW_ILU=`<svg viewBox="0 0 520 300" width="100%" role="img">
<defs><marker id="snwSeta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#c25e12"/></marker></defs>
<g class="snw-jan"><rect x="8" y="22" width="250" height="250" rx="12" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
<path d="M8 34a12 12 0 0 1 12-12h226a12 12 0 0 1 12 12v16H8z" fill="color-mix(in srgb,var(--line) 55%,var(--panel))"/>
<circle cx="24" cy="36" r="4" fill="#e5675a"/><circle cx="37" cy="36" r="4" fill="#f2b84b"/><circle cx="50" cy="36" r="4" fill="#5bb974"/>
<rect x="64" y="29" width="180" height="14" rx="7" fill="var(--panel)"/><rect x="72" y="34" width="70" height="4" rx="2" fill="var(--mut)" opacity=".5"/>
<rect x="22" y="64" width="130" height="86" rx="6" fill="#d9ecf7"/><circle cx="125" cy="84" r="9" fill="#f2b84b"/><path d="M22 150l38-44 26 28 18-18 48 34z" fill="#5a9fcf"/><path d="M60 106l26 28-14 16H22z" fill="#3f7fae" opacity=".55"/>
<rect x="28" y="70" width="52" height="18" rx="9" fill="#c25e12"/><text x="54" y="83" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="inherit">Guardar</text>
<rect x="164" y="66" width="80" height="5" rx="2.5" fill="var(--mut)" opacity=".35"/><rect x="164" y="78" width="72" height="5" rx="2.5" fill="var(--mut)" opacity=".35"/><rect x="164" y="90" width="78" height="5" rx="2.5" fill="var(--mut)" opacity=".35"/><rect x="164" y="102" width="56" height="5" rx="2.5" fill="var(--mut)" opacity=".35"/>
<rect x="18" y="166" width="226" height="40" rx="3" fill="color-mix(in srgb,#c25e12 16%,transparent)"/><rect x="24" y="172" width="210" height="5" rx="2.5" fill="var(--mut)" opacity=".55"/><rect x="24" y="184" width="196" height="5" rx="2.5" fill="var(--mut)" opacity=".55"/><rect x="24" y="196" width="120" height="5" rx="2.5" fill="var(--mut)" opacity=".55"/>
<rect x="120" y="198" width="132" height="44" rx="6" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/><rect x="128" y="206" width="10" height="10" rx="2" fill="#c25e12"/><text x="144" y="215" font-size="9.5" font-weight="700" fill="currentColor" font-family="inherit">Guardar no SpruceNote</text><rect x="128" y="226" width="90" height="5" rx="2.5" fill="var(--mut)" opacity=".3"/>
<rect x="22" y="222" width="86" height="40" rx="5" fill="#2b2f36"/><path d="M58 234v16l13-8z" fill="#fff"/></g>
<path d="M266 120C300 96 316 96 338 110" fill="none" stroke="#c25e12" stroke-width="2.5" stroke-dasharray="6 5" marker-end="url(#snwSeta)"/>
<path d="M266 190C300 210 318 200 338 186" fill="none" stroke="#c25e12" stroke-width="2.5" stroke-dasharray="6 5" marker-end="url(#snwSeta)"/>
<g class="snw-qd"><rect x="346" y="22" width="166" height="250" rx="12" fill="color-mix(in srgb,#c25e12 7%,var(--panel))" stroke="var(--line)" stroke-width="1.5"/>
<rect x="358" y="34" width="22" height="22" rx="5" fill="#c25e12"/><path d="M364 40h5v5h-5zM371 44h5v5h-5zM365 47h5v5h-5z" fill="none" stroke="#fff" stroke-width="1.4"/>
<text x="388" y="44" font-size="11" font-weight="700" fill="currentColor" font-family="inherit">SpruceNote</text><text x="388" y="56" font-size="9" fill="var(--mut)" font-family="inherit">Quadro de ideias</text>
<rect x="358" y="68" width="142" height="194" rx="8" fill="var(--panel)" stroke="var(--line)"/><text x="368" y="85" font-size="9.5" font-weight="700" fill="#c25e12" font-family="inherit">POR ARRUMAR</text>
<rect x="366" y="94" width="126" height="54" rx="5" fill="#d9ecf7"/><circle cx="470" cy="106" r="6" fill="#f2b84b"/><path d="M366 148l26-30 18 19 12-12 70 23z" fill="#5a9fcf"/>
<rect x="366" y="156" width="126" height="42" rx="5" fill="var(--panel)" stroke="var(--line)"/><rect x="374" y="165" width="104" height="4" rx="2" fill="var(--mut)" opacity=".5"/><rect x="374" y="175" width="96" height="4" rx="2" fill="var(--mut)" opacity=".5"/><rect x="374" y="185" width="60" height="4" rx="2" fill="var(--mut)" opacity=".5"/>
<rect x="366" y="206" width="126" height="46" rx="5" fill="#2b2f36"/><path d="M424 219v20l16-10z" fill="#fff"/></g>
</svg>`;
function cartaoWebClipper(){const inst=document.documentElement.getAttribute('data-sn-clipper');const u=navigator.userAgent;const pc=/Chrome\//.test(u)&&!/Mobile|Android|CriOS|iPad|iPhone/.test(u);
  const a=(typeof HUB_APPS!=='undefined'&&HUB_APPS.find(x=>x.id==='sprucenote'))||null;const ico=a&&typeof hubIcone==='function'?hubIcone(a,40):ic('nvsn',20);
  const est=inst?`<div class="snw-est ok">${ic('check',14)} Extensão instalada neste navegador (versão ${esc(inst)})</div>`:pc?`<div class="snw-est">${ic('download',14)} Ainda não está instalada neste navegador</div>`:`<div class="snw-est">${ic('alert',14)} Só funciona no Chrome ou no Edge de computador</div>`;
  return `<div class="card snw-wc"><div class="snw-wc-tx"><div class="snw-wc-h">${ico}<div><h2 style="margin:0">SpruceNote Web Clipper</h2><p class="hint" style="margin:2px 0 0">Extensão do Chrome para o SpruceNote</p></div></div>
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
  <div class="snw-wc-b">${inst?'':`<a class="btn pri" href="${SNW_ZIP}" download>${ic('download',14)} Descarregar</a>`}<button type="button" class="btn" data-snw="info">${ic('list',14)} Como instalar</button><button type="button" class="btn ghost" data-snw="ajuda">${ic('help',14)} Ajuda</button></div></div><div class="snw-ilu" aria-hidden="true">${SNW_ILU}</div></div>`}
if(typeof defFerramentas==='function'){const _dfW=defFerramentas;defFerramentas=function(){const h=_dfW.apply(this,arguments);try{if(typeof snOn==='function'&&!snOn())return h;const c=cartaoWebClipper();
  const p=typeof cartaoTestePopups==='function'?cartaoTestePopups():'';if(p&&h.startsWith(p))return p+c+h.slice(p.length);return c+h}catch(e){console.warn(e);return h}}}
{const s=document.createElement('style');s.textContent=`
html body .card.snw-wc{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,34%);gap:28px;align-items:center}
html body .snw-ilu{display:flex;align-items:center;justify-content:center;color:var(--ink,#1f2937);padding:6px}
html body .snw-ilu svg{max-width:520px;height:auto;display:block}
@container (max-width:780px){html body .card.snw-wc{grid-template-columns:1fr}html body .snw-ilu{order:-1;max-width:420px}}
@media (max-width:900px){html body .card.snw-wc{grid-template-columns:1fr}html body .snw-ilu{order:-1;max-width:420px;margin:0 auto}}
html body.est-sge .snw-ilu rect{rx:0}
html body .snw-wc-h{display:flex;align-items:center;gap:12px}
html body .snw-wc-h .hbic{flex:none;box-shadow:none}
html body .snw-lista{list-style:none;margin:0;padding:0;display:grid;gap:7px}
html body .snw-lista li{display:flex;gap:8px;align-items:flex-start;line-height:1.4;font-size:13.5px}
html body .snw-lista li>svg{flex:none;margin-top:2px;color:var(--acc)}
html body .snw-est{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:8px 10px;border-radius:8px;background:color-mix(in srgb,var(--acc) 8%,transparent);color:var(--mut)}
html body .snw-est.ok{background:color-mix(in srgb,#1a8f4e 12%,transparent);color:#1a7a43}
html body .snw-wc-b{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
`;document.head.appendChild(s)}
/* 1.093 — Definições › Ferramentas: «Diagnóstico dos Dados» colapsável (o estado fica guardado na conta) */
function diagColapsavel(){try{const d=$('#diag');const c=d&&d.closest('.card');if(!c||c.dataset.col)return;c.dataset.col='1';c.classList.add('diagcol');
  const h=c.querySelector('h2');if(!h)return;h.setAttribute('role','button');h.tabIndex=0;h.classList.add('diagcol-h');
  h.insertAdjacentHTML('beforeend',`<span class="diagcol-n" hidden></span><span class="diagcol-s">${ic('chev',16)}</span>`);
  const n=h.querySelector('.diagcol-n');
  const conta=()=>{const k=[...d.children].filter(x=>x.offsetParent!==null||x.querySelector('button')).filter(x=>x.querySelector('button,.btn')).length;n.hidden=!k;n.textContent=k?k+(k===1?' problema':' problemas'):''};
  const aplica=()=>{const f=!!(S.cfg&&S.cfg.diagFech);c.classList.toggle('fech',f);h.setAttribute('aria-expanded',String(!f))};
  const alt=()=>{S.cfg=S.cfg||{};S.cfg.diagFech=!S.cfg.diagFech;save();aplica()};
  h.onclick=e=>{if(e.target.closest('a,input,select'))return;alt()};h.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();alt()}};
  aplica();conta();try{new MutationObserver(conta).observe(d,{childList:true})}catch(_){}}catch(e){console.warn(e)}}
if(typeof bindFerramentas==='function'){const _bfD=bindFerramentas;bindFerramentas=function(){const r=_bfD.apply(this,arguments);diagColapsavel();setTimeout(diagColapsavel,300);return r}}
{const s=document.createElement('style');s.textContent=`
html body .diagcol-h{cursor:pointer;display:flex;align-items:center;gap:8px;user-select:none}
html body .diagcol-h:focus-visible{outline:2px solid var(--acc);outline-offset:4px}
html body .diagcol-s{margin-left:auto;display:inline-flex;color:var(--mut);transition:transform .2s;transform:rotate(90deg)}
html body .diagcol.fech .diagcol-s{transform:none}
html body .diagcol-n{font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px;background:color-mix(in srgb,#e08a00 16%,transparent);color:#a35f00}
html body.est-sge .diagcol-n{border-radius:0}
html body .diagcol.fech>:not(h2){display:none!important}
html body .diagcol.fech>h2{margin-bottom:0!important}
`;document.head.appendChild(s)}
/* 1.093 — todos os módulos nas Apps (Jornal Escolar, JornalNote, Contactos, Coord. PROFIJ), agrupados, cada um com a sua cor da paleta;
   o mesmo logótipo de cor aparece no título de cada módulo */
{try{Object.assign(HUB_CORES,{sgeRoxo:['#7c3aed','#6d28d9'],sgeRosa:['#db2777','#be185d'],sgeIndigo:['#4f46e5','#4338ca'],sgeLima:['#65a30d','#4d7c0f'],sgeMagenta:['#c026d3','#a21caf'],sgeArdosia:['#475569','#334155']});
  Object.assign(HUB_SGE_DEF,{jornal:'sgeRosa',jornalnote:'sgeRoxo',contactos:'sgeCinza',cprofij:'sgeIndigo',roda:'sgeLima',autoav:'sgeMagenta',digit:'sgeArdosia'});
  const on=f=>()=>{try{return typeof window[f]!=='function'||window[f]()}catch(_){return true}};
  if(!HUB_GRUPOS.some(g=>g.id==='escola'))HUB_GRUPOS.splice(2,0,{id:'escola',n:'Escola e Comunicação',g:'mail'});
  const novos=[
   {id:'cprofij',gr:'gestao',n:'Coord. PROFIJ',v:'cprofij',g:['award'],c:'indigo',d:'Coordenação do Programa PROFIJ',on:on('cpOn')},
   {id:'jornal',gr:'escola',n:'Jornal Escolar',v:'jornal',g:['file'],c:'vermelho',d:'Plano Anual de Atividades, peças e edições',on:on('jnOn')},
   {id:'contactos',gr:'escola',n:'Contactos',v:'contactos',g:['mail'],c:'ardosia',d:'E-mails dos colegas e dos diretores de turma',on:on('contOn')},
   {id:'jornalnote',gr:'org',n:'JornalNote',v:'snjornal',g:['pen'],c:'indigo',d:'Quadros de ideias do Jornal Escolar',on:()=>on('jnOn')()&&on('snOn')()}];
  novos.forEach(a=>{if(!HUB_APPS.some(x=>x.id===a.id)){const i=HUB_APPS.map(x=>x.gr).lastIndexOf(a.gr);HUB_APPS.splice(i<0?HUB_APPS.length:i+1,0,a)}})}catch(e){console.warn(e)}}
function vLogo(){try{const t=$('#ttl');if(!t)return;const q=t.querySelector('.vlogo');
  const a=(typeof HUB_APPS!=='undefined'&&!document.body.classList.contains('eduapp'))?HUB_APPS.find(x=>x.v===VIEW&&(!x.on||x.on())):null;
  if(!a||typeof hubIcone!=='function'){if(q)q.remove();return}if(q&&q.dataset.v===VIEW)return;if(q)q.remove();
  t.insertAdjacentHTML('afterbegin',`<span class="vlogo" data-v="${VIEW}" aria-hidden="true">${hubIcone(a,30)}</span>`)}catch(e){console.warn(e)}}
if(typeof go==='function'){const _goVL=go;go=function(){const r=_goVL.apply(this,arguments);try{vLogo();requestAnimationFrame(vLogo)}catch(_){}return r}}
{const s=document.createElement('style');s.textContent=`
html body #ttl .vlogo{display:inline-flex;vertical-align:middle;margin:-4px 10px 0 0}
html body #ttl .vlogo .hbic{box-shadow:none;border:1.5px solid rgba(255,255,255,.55)}
html body.est-sge #ttl .vlogo .hbic{border-radius:0}
`;document.head.appendChild(s)}

/* 1.093 — Apps: imagem ilustrativa no espaço livre do fim de cada grupo (só quando cabe pelo menos um mosaico) */
const HUB_ILU={
escola:`<svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet"><rect x="16" y="12" width="132" height="96" rx="8" fill="var(--panel)" stroke="var(--line)"/><rect x="28" y="24" width="108" height="10" rx="2" fill="#db2777"/><rect x="28" y="42" width="50" height="40" rx="3" fill="#fbcfe8"/><g fill="var(--mut)" opacity=".4"><rect x="86" y="44" width="50" height="4" rx="2"/><rect x="86" y="54" width="44" height="4" rx="2"/><rect x="86" y="64" width="50" height="4" rx="2"/><rect x="86" y="74" width="36" height="4" rx="2"/><rect x="28" y="90" width="108" height="4" rx="2"/></g><rect x="166" y="22" width="118" height="76" rx="8" fill="var(--panel)" stroke="var(--line)"/><path d="M166 30l59 38 59-38" fill="none" stroke="#7a8a96" stroke-width="2"/><circle cx="270" cy="26" r="11" fill="#db2777"/><text x="270" y="30" text-anchor="middle" font-size="10" font-weight="800" fill="#fff" font-family="inherit">3</text></svg>`,
gestao:`<svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet"><rect x="14" y="14" width="128" height="92" rx="8" fill="var(--panel)" stroke="var(--line)"/><g fill="var(--mut)" opacity=".35"><rect x="50" y="30" width="70" height="5" rx="2.5"/><rect x="50" y="52" width="58" height="5" rx="2.5"/><rect x="50" y="74" width="76" height="5" rx="2.5"/></g><g><circle cx="34" cy="33" r="8" fill="#1b93c6" opacity=".8"/><circle cx="34" cy="55" r="8" fill="#16a34a" opacity=".8"/><circle cx="34" cy="77" r="8" fill="#5bb7de"/></g><rect x="50" y="88" width="40" height="10" rx="5" fill="color-mix(in srgb,#16a34a 18%,transparent)"/><rect x="158" y="14" width="128" height="92" rx="8" fill="var(--panel)" stroke="var(--line)"/><path d="M172 92h100" stroke="var(--line)"/><rect x="178" y="62" width="14" height="30" rx="2" fill="#1b93c6" opacity=".5"/><rect x="198" y="46" width="14" height="46" rx="2" fill="#1b93c6" opacity=".75"/><rect x="218" y="32" width="14" height="60" rx="2" fill="#1b93c6"/><rect x="238" y="52" width="14" height="40" rx="2" fill="#16a34a"/><rect x="258" y="70" width="14" height="22" rx="2" fill="#f39200"/><text x="172" y="28" font-size="9" font-weight="700" fill="currentColor" font-family="inherit">Médias</text></svg>`,
recreio:`<svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet"><rect x="16" y="16" width="150" height="88" rx="10" fill="var(--panel)" stroke="var(--line)"/><rect x="28" y="28" width="96" height="7" rx="3.5" fill="currentColor" opacity=".7"/><rect x="28" y="46" width="62" height="22" rx="5" fill="#dc2626"/><rect x="96" y="46" width="62" height="22" rx="5" fill="#1b93c6"/><rect x="28" y="74" width="62" height="22" rx="5" fill="#f39200"/><rect x="96" y="74" width="62" height="22" rx="5" fill="#16a34a"/><path d="M118 55l4 4 8-8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><g transform="translate(184 30)"><rect x="0" y="40" width="30" height="34" rx="3" fill="#5bb7de"/><rect x="34" y="20" width="30" height="54" rx="3" fill="#f39200"/><rect x="68" y="52" width="30" height="22" rx="3" fill="#c2410c" opacity=".8"/><text x="49" y="40" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="inherit">1</text><path d="M41 4l8-6 8 6-3 10H44z" fill="#f59e0b"/></g></svg>`,
org:`<svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet"><rect x="12" y="12" width="168" height="96" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-dasharray="3 4"/><rect x="24" y="24" width="56" height="40" rx="4" fill="#fde68a" transform="rotate(-3 52 44)"/><rect x="88" y="22" width="60" height="30" rx="4" fill="#bae6fd"/><rect x="40" y="70" width="70" height="28" rx="4" fill="#bbf7d0" transform="rotate(2 75 84)"/><rect x="120" y="60" width="48" height="38" rx="4" fill="#f59e0b" opacity=".85"/><path d="M80 44C96 44 100 58 116 66" stroke="var(--mut)" stroke-width="1.5" fill="none" marker-end=""/><g fill="var(--mut)" opacity=".5"><rect x="32" y="34" width="36" height="4" rx="2"/><rect x="32" y="44" width="28" height="4" rx="2"/><rect x="96" y="32" width="40" height="4" rx="2"/><rect x="50" y="80" width="46" height="4" rx="2"/></g><rect x="196" y="18" width="92" height="84" rx="8" fill="var(--panel)" stroke="var(--line)"/><rect x="196" y="18" width="92" height="18" rx="8" fill="#0e7095"/><g fill="var(--line)"><rect x="204" y="44" width="16" height="12" rx="2"/><rect x="224" y="44" width="16" height="12" rx="2"/><rect x="264" y="44" width="16" height="12" rx="2"/><rect x="204" y="62" width="16" height="12" rx="2"/><rect x="244" y="62" width="16" height="12" rx="2"/><rect x="264" y="62" width="16" height="12" rx="2"/><rect x="224" y="80" width="16" height="12" rx="2"/><rect x="244" y="80" width="16" height="12" rx="2"/></g><rect x="244" y="44" width="16" height="12" rx="2" fill="#0e7095"/><rect x="224" y="62" width="16" height="12" rx="2" fill="#5bb7de"/><rect x="204" y="80" width="16" height="12" rx="2" fill="#f59e0b"/></svg>`};
function hubIlus(){try{if(VIEW!=='hub')return;$$('#view .hub-gr').forEach(sec=>{const g=sec.querySelector('.hub-grid');if(!g)return;const old=g.querySelector('.hub-ilu');if(old)old.remove();
  if(UI.hubEd)return;const t=g.querySelector('.hbt[data-hub]');const a=t&&HUB_APPS.find(x=>x.id===t.dataset.hub);const svg=a&&HUB_ILU[a.gr];if(!svg)return;
  const cols=getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length;const n=g.querySelectorAll('.hbt').length;const rem=cols-(n%cols||cols);
  if(cols<2||rem<1)return;g.insertAdjacentHTML('beforeend',`<div class="hub-ilu" aria-hidden="true" style="grid-column:span ${rem}">${svg}</div>`)})}catch(e){console.warn(e)}}
if(typeof vHub==='function'){const _vHI=vHub;vHub=function(){const r=_vHI.apply(this,arguments);try{requestAnimationFrame(hubIlus)}catch(_){}return r}}
addEventListener('resize',()=>{clearTimeout(hubIlus._t);hubIlus._t=setTimeout(hubIlus,150)});
{const s=document.createElement('style');s.textContent=`
html body .hub-ilu{display:flex;align-items:center;justify-content:center;min-height:100%;border:1px dashed var(--line);border-radius:12px;background:color-mix(in srgb,var(--acc) 4%,transparent);padding:8px;box-sizing:border-box;overflow:hidden;color:var(--ink,#1f2937)}
html body .hub-ilu svg{display:block;width:100%;height:100%;max-height:120px;max-width:340px}
html body.est-sge .hub-ilu,html body.est-sge .hub-ilu rect{border-radius:0;rx:0}
`;document.head.appendChild(s)}

/* 1.093 — Definições › Módulos Opcionais: todos, agrupados, com o ícone de cor de cada módulo */
const MOD_GR=[['Gestão e sala de aula','school',[['mod-cp','cprofij'],['mod-roda','roda','target'],['aa-on','autoav','users'],['dg-on','digit','camera']]],
  ['EduApps','sparkle',[['ar-on','arena'],['pu-on','pulso'],['fm-on','forms'],['pv-on','provas']]],
  ['Escola e Comunicação','mail',[['mod-jn','jornal'],['mod-cont','contactos']]],
  ['Organização','layers',[['mod-sn','sprucenote'],['esch-on','eduschedule']]]];
function modsAgrupar(){try{const M=$('#view #def-mods');if(!M||M.dataset.grp)return;const L=[...M.querySelectorAll(':scope>label.chk')];if(!L.length)return;M.dataset.grp='1';
  const lab=id=>{const i=M.querySelector('#'+id);return i&&i.closest('label.chk')};const usados=new Set();
  const tile=(lb,id,g)=>{const a=(HUB_APPS.find(x=>x.id===id))||{id,c:'azul',g:[g||'grid']};const [c1,c2]=hubCor(a,{});const sv=[...lb.children].find(x=>x.tagName==='svg');
    const t=document.createElement('span');t.className='hbic hb-cheio mdg-ic';t.style.cssText=`--h1:${c1};--h2:${c2};width:34px;height:34px`;
    if(sv){t.appendChild(sv);sv.setAttribute('width','17');sv.setAttribute('height','17')}else t.innerHTML=ic(g||'grid',14);const inp=lb.querySelector('input');(inp?inp.nextSibling:lb.firstChild)?lb.insertBefore(t,inp?inp.nextSibling:lb.firstChild):lb.appendChild(t)};
  let html='';MOD_GR.forEach(([n,g])=>{html+=`<section class="mdg"><h3 class="mdg-h">${ic(g,15)} ${esc(n)}</h3><div class="mdg-l"></div></section>`});
  M.insertAdjacentHTML('beforeend',html+`<section class="mdg" data-outros><h3 class="mdg-h">${ic('grid',15)} Outros</h3><div class="mdg-l"></div></section>`);
  const G=[...M.querySelectorAll('.mdg-l')];
  MOD_GR.forEach(([,,itens],k)=>itens.forEach(([inp,id,gl])=>{const lb=lab(inp);if(!lb)return;usados.add(lb);lb.style.margin='';tile(lb,id,gl);G[k].appendChild(lb);
    if(inp==='ar-on'){const sub=M.querySelector('#ar-mdef');if(sub){usados.add(sub);const w=document.createElement('div');w.className='mdg-par';G[k].insertBefore(w,lb);w.appendChild(lb);w.appendChild(sub)}}}));
  L.filter(lb=>!usados.has(lb)).forEach(lb=>{lb.style.margin='';G[G.length-1].appendChild(lb)});
  M.querySelectorAll('.mdg').forEach(sc=>{if(!sc.querySelector('label'))sc.remove()})}catch(e){console.warn(e)}}
if(typeof vDefinicoes==='function'){const _vDM=vDefinicoes;vDefinicoes=function(){const r=_vDM.apply(this,arguments);try{modsAgrupar();setTimeout(modsAgrupar,0)}catch(_){}return r}}
{const s=document.createElement('style');s.textContent=`
html body #def-mods .mdg{margin-top:18px}
html body #def-mods .mdg-h{display:flex;align-items:center;gap:8px;margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);padding-bottom:6px;border-bottom:1px solid var(--line)}
html body #def-mods .mdg-l{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:8px 18px}
html body #def-mods .mdg-l>label.chk{display:flex;align-items:center;gap:12px;margin:0!important;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel)}
html body #def-mods .mdg-l>label.chk>span{min-width:0}
html body #def-mods .mdg-par{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:10px;background:var(--panel)}
html body #def-mods .mdg-par>label.chk{display:flex;align-items:center;gap:12px;margin:0!important;padding:10px 12px}
html body #def-mods .mdg-par>#ar-mdef{padding:8px 12px 10px 58px;border-top:1px dashed var(--line);font-size:13px}
html body.est-sge #def-mods .mdg-par{border-radius:0}
html body #def-mods .mdg-ic{flex:none;box-shadow:none!important}
html body.est-sge #def-mods .mdg-l>label.chk,html body.est-sge #def-mods .mdg-ic{border-radius:0}
@media (max-width:700px){html body #def-mods .mdg-l{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
/* o título pode ser reescrito depois (ex.: nome da turma): o logótipo volta */
{const liga=()=>{const t=$('#ttl');if(!t||t.dataset.vlo)return;t.dataset.vlo='1';new MutationObserver(()=>{if(!t.querySelector('.vlogo'))vLogo()}).observe(t,{childList:true})};try{liga();addEventListener('load',liga)}catch(_){}}
/* logótipo de cor também no cabeçalho do quadro (SpruceNote / JornalNote) */
function mqLogo(){try{const bc=$('#mq-bc');if(!bc||bc.previousElementSibling&&bc.previousElementSibling.classList.contains('mq-logo'))return;const a=HUB_APPS.find(x=>x.v===VIEW);if(!a)return;
  bc.insertAdjacentHTML('beforebegin',`<span class="mq-logo" aria-hidden="true">${hubIcone(a,26)}</span>`)}catch(_){}}
if(typeof mqVista==='function'){const _mqVL=mqVista;mqVista=function(){const r=_mqVL.apply(this,arguments);mqLogo();return r}}
{const s=document.createElement('style');s.textContent='html body .mq-logo{display:inline-flex;margin-right:10px;flex:none}html body .mq-logo .hbic{box-shadow:none}html body.est-sge .mq-logo .hbic{border-radius:0}';document.head.appendChild(s)}
