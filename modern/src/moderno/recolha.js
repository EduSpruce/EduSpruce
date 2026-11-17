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
  /* jnOn, contOn, cpOn e snOn são const do programa (não estão em window): chamar pelo nome */
  const FN={cpOn:()=>cpOn(),jnOn:()=>jnOn(),contOn:()=>contOn(),snOn:()=>snOn()};const on=f=>()=>{try{return !!FN[f]()}catch(_){return true}};
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
html body .hub-ilu{display:flex;align-items:center;justify-content:flex-end;padding-right:clamp(12px,4%,48px)!important;min-height:100%;border:1px dashed var(--line);border-radius:12px;background:color-mix(in srgb,var(--acc) 4%,transparent);padding:8px;box-sizing:border-box;overflow:hidden;color:var(--ink,#1f2937)}
html body .hub-ilu svg{display:block;flex:0 1 340px;width:340px;height:auto;max-height:120px;max-width:100%}
html body.est-sge .hub-ilu,html body.est-sge .hub-ilu rect{border-radius:0;rx:0}
`;document.head.appendChild(s)}

/* 1.093 — Definições › Módulos Opcionais: todos, agrupados, com o ícone de cor de cada módulo */
const MOD_GR=[['Gestão e sala de aula','school',[['mod-cp','cprofij'],['mod-roda','roda','target'],['aa-on','autoav','users'],['dg-on','digit','camera']]],
  ['SpruceApps','sparkle',[['ar-on','arena'],['pu-on','pulso'],['fm-on','forms'],['pv-on','provas']]],
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
/* 1.096 — Reuniões, Direção de Turma, Biblioteca e Documentos passam a módulos opcionais (ligados por omissão),
   cada um com o seu ícone e cor nas Apps, no título e em Definições › Módulos Opcionais */
const MOD4=[{k:'reunioes',inp:'mod-reun',n:'Reuniões',g:'meet',d:'Convocatórias, atas e reuniões',gr:'escola',c:'ciano',sge:'sgePetroleo'},
  {k:'direcao',inp:'mod-dt',n:'Direção de Turma',g:'crown',d:'Direção de turma: alunos, EE e documentos',gr:'gestao',c:'ambar',sge:'sgeOuro'},
  {k:'recursos',inp:'mod-bib',n:'Biblioteca',g:'bookopen',d:'Biblioteca de recursos',gr:'org',c:'laranja',sge:'sgeCastanho'},
  {k:'documentos',inp:'mod-doc',n:'Documentos',g:'file',d:'Gerador de documentos',gr:'gestao',c:'vermelho',sge:'sgeGrena'}];
const mod4On=k=>{try{const m=S.cfg&&S.cfg.modulos;return !(m&&m[k]===false)}catch(_){return true}};
{try{Object.assign(HUB_CORES,{sgePetroleo:['#0e7490','#155e75'],sgeOuro:['#ca8a04','#a16207'],sgeCastanho:['#92400e','#78350f'],sgeGrena:['#9f1239','#881337']});
  MOD4.forEach(m=>{HUB_SGE_DEF[m.k]=m.sge;if(HUB_APPS.some(x=>x.id===m.k))return;
    const a={id:m.k,gr:m.gr,n:m.n,v:m.k,g:[m.g],c:m.c,d:m.d,on:m.k==='direcao'?()=>mod4On('direcao')&&(()=>{try{return !!(A()&&minhasDT(A()).length)}catch(_){return false}})():()=>mod4On(m.k)};
    const i=HUB_APPS.map(x=>x.gr).lastIndexOf(a.gr);HUB_APPS.splice(i<0?HUB_APPS.length:i+1,0,a)});
  const gr=n=>MOD_GR.find(x=>x[0]===n);
  gr('Gestão e sala de aula')[2].push(['mod-dt','direcao'],['mod-doc','documentos']);gr('Escola e Comunicação')[2].unshift(['mod-reun','reunioes']);gr('Organização')[2].push(['mod-bib','recursos']);
}catch(e){console.warn(e)}}
function mod4Aplica(){try{MOD4.forEach(m=>document.body.classList.toggle('modoff-'+m.k,!mod4On(m.k)));hubMenuMods();if(typeof menuAgendar==='function')menuAgendar()}catch(e){console.warn(e)}}
if(typeof cartaoAvisosDef==='function'){const _ca4=cartaoAvisosDef,_ba4=bindAvisosDef;
  cartaoAvisosDef=function(){const h=_ca4.apply(this,arguments);return h.replace(/(<div class="card ed" id="def-mods">[\s\S]*?)(<\/div>)$/,'$1'+MOD4.map(m=>`<label class="chk" style="margin-top:8px"><input type="checkbox" id="${m.inp}" ${mod4On(m.k)?'checked':''}> ${ic(m.g,15)} <span><b>${m.n}</b><br><span class="mut">${m.d}${m.k==='direcao'?' (só aparece a quem é DT)':''}</span></span></label>`).join('')+'$2')};
  bindAvisosDef=function(){const r=_ba4.apply(this,arguments);MOD4.forEach(m=>{const c=$('#'+m.inp);if(c)c.onchange=()=>{S.cfg.modulos=S.cfg.modulos||{};if(c.checked)delete S.cfg.modulos[m.k];else S.cfg.modulos[m.k]=false;save();mod4Aplica();toast('Módulo '+m.n+(c.checked?' ativado':' desativado'),'ok')}});return r}}
{const _g4=go;go=function(v){if(MOD4.some(m=>m.k===v)&&!mod4On(v))v='inicio';const r=_g4.apply(this,[v].concat([].slice.call(arguments,1)));try{mod4Aplica()}catch(_){}return r};if(_g4._f)go._f=_g4._f}
setTimeout(mod4Aplica,300);
{const s=document.createElement('style');s.textContent='html body.modoff-reunioes #reunBan,html body.modoff-reunioes #reunBadge{display:none!important}';document.head.appendChild(s)}
/* 1.098 — Apps: em Personalizar muda-se a ordem — arrastar os mosaicos (também para outro grupo) ou usar as setas;
   os grupos sobem e descem. Guardado em S.cfg.hub.ord = {g:[grupos], a:[apps], gp:{app:grupo}} */
let HUB_ORD0=null;
const hubIdx=(L,id)=>{const i=L.indexOf(id);return i<0?9999:i};
function hubOrdAplica(){try{if(!HUB_ORD0){HUB_ORD0={g:HUB_GRUPOS.map(x=>x.id),a:HUB_APPS.map(x=>x.id)};HUB_APPS.forEach(a=>{a.gr0=a.gr})}
  const o=hubCfg().ord||{};HUB_APPS.forEach(a=>{const g=o.gp&&o.gp[a.id];a.gr=(g&&HUB_GRUPOS.some(x=>x.id===g))?g:a.gr0});
  const G=Array.isArray(o.g)?o.g:HUB_ORD0.g,L=Array.isArray(o.a)?o.a:HUB_ORD0.a;
  HUB_GRUPOS.sort((x,y)=>hubIdx(G,x.id)-hubIdx(G,y.id));HUB_APPS.sort((x,y)=>hubIdx(L,x.id)-hubIdx(L,y.id))}catch(e){console.warn(e)}}
function hubOrdGuarda(){try{const h=hubCfg();const S0=[...$$('#view .hub-gr[data-gr]')];const gs=S0.map(s=>s.dataset.gr);const ts=[];const gp={};
  S0.forEach(s=>s.querySelectorAll('.hbt[data-hub]').forEach(t=>{ts.push(t.dataset.hub);gp[t.dataset.hub]=s.dataset.gr}));
  h.ord={g:gs.concat(HUB_GRUPOS.map(x=>x.id).filter(x=>!gs.includes(x))),a:ts.concat(HUB_APPS.map(x=>x.id).filter(x=>!ts.includes(x))),gp:Object.assign({},(h.ord||{}).gp||{},gp)};
  Object.keys(h.ord.gp).forEach(k=>{const a=HUB_APPS.find(x=>x.id===k);if(a&&a.gr0===h.ord.gp[k])delete h.ord.gp[k]});
  save();vHub()}catch(e){console.warn(e)}}
if(typeof vHub==='function'){const _vHO=vHub;vHub=function(){hubOrdAplica();const r=_vHO.apply(this,arguments);try{hubOrdUI()}catch(e){console.warn(e)}return r}}
function hubOrdUI(){const vis=HUB_GRUPOS.filter(g=>HUB_APPS.some(a=>a.gr===g.id&&(!a.on||a.on())));const S0=[...$$('#view .hub-gr')];
  S0.forEach((s,k)=>{if(vis[k])s.dataset.gr=vis[k].id});if(!UI.hubEd)return;
  const top=$('#view .hub-bar');if(top&&hubCfg().ord&&!$('#hb-ordx')){top.insertAdjacentHTML('afterbegin',`<button class="btn" id="hb-ordx" title="Voltar à ordem original">${ic('undo',15)} Repor ordem</button>`);$('#hb-ordx').onclick=()=>{delete hubCfg().ord;save();vHub();toast('Ordem original reposta','ok')}}
  S0.forEach((s,k)=>{const sec=s.querySelector('.hub-sec');if(sec)sec.insertAdjacentHTML('beforeend',`<span class="hbo-g"><button type="button" class="btn sm" data-hbg="-1" ${k?'':'disabled'} title="Subir o grupo">↑</button><button type="button" class="btn sm" data-hbg="1" ${k<S0.length-1?'':'disabled'} title="Descer o grupo">↓</button></span>`);
    s.querySelectorAll('[data-hbg]').forEach(b=>b.onclick=e=>{e.stopPropagation();const d=+b.dataset.hbg;const o=S0[k+d];if(!o)return;d<0?o.before(s):o.after(s);hubOrdGuarda()})});
  let arr=null;
  $$('#view .hbt[data-hub]').forEach(t=>{t.draggable=true;t.insertAdjacentHTML('beforeend',`<span class="hbo-a"><span role="button" tabindex="0" data-hbm="-1" title="Mover para trás">‹</span><span role="button" tabindex="0" data-hbm="1" title="Mover para a frente">›</span></span>`);
    t.querySelectorAll('[data-hbm]').forEach(b=>{const f=e=>{e.stopPropagation();e.preventDefault();const d=+b.dataset.hbm;
      const L=[...$$('#view .hbt[data-hub]')];const i=L.indexOf(t),o=L[i+d];if(!o)return;if(o.parentNode!==t.parentNode){d<0?o.after(t):o.before(t)}else{d<0?o.before(t):o.after(t)}hubOrdGuarda()};
      b.onclick=f;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')f(e)}});
    t.addEventListener('dragstart',e=>{arr=t;t.classList.add('hbo-arr');try{e.dataTransfer.setData('text/plain',t.dataset.hub);e.dataTransfer.effectAllowed='move'}catch(_){}});
    t.addEventListener('dragend',()=>{t.classList.remove('hbo-arr');arr=null})});
  $$('#view .hub-grid').forEach(g=>{g.addEventListener('dragover',e=>{if(!arr)return;e.preventDefault();
      const o=e.target.closest&&e.target.closest('.hbt[data-hub]');if(o&&o!==arr){const r=o.getBoundingClientRect();(e.clientX<r.left+r.width/2)?o.before(arr):o.after(arr)}
      else if(!o&&arr.parentNode!==g){const il=g.querySelector('.hub-ilu');il?il.before(arr):g.appendChild(arr)}});
    g.addEventListener('drop',e=>{if(!arr)return;e.preventDefault();hubOrdGuarda()})})}
{const s=document.createElement('style');s.textContent=`
html body .hub.edit .hbt[data-hub]{cursor:grab;position:relative}
html body .hub.edit .hbt.hbo-arr{opacity:.45;outline:2px dashed var(--acc)}
html body .hub.edit .hub-ilu{display:none}
html body .hbo-g{margin-left:auto;display:inline-flex;gap:4px}
html body .hbo-g>.btn{min-width:30px;font-size:16px;font-weight:700;line-height:1;justify-content:center}
html body .hub.edit .hbt[data-hub] .hbtx{padding-right:64px}
html body .hub-sec .hub-tur~.hbo-g{margin-left:8px}
html body .hbo-a{position:absolute;right:6px;bottom:6px;display:inline-flex;gap:4px}
html body .hbo-a>span{display:inline-flex;align-items:center;justify-content:center;width:26px;height:24px;border:1px solid var(--line);background:var(--panel);border-radius:6px;font-size:18px;line-height:1;color:var(--mut);cursor:pointer}
html body .hbo-a>span:hover{color:var(--acc);border-color:var(--acc)}
html body.est-sge .hbo-a>span{border-radius:0}
`;document.head.appendChild(s)}
/* 1.101 — os quatro módulos entram no #def-mods pelo DOM (o cartão já não termina no </div> esperado) */
{const _mgM4=modsAgrupar;modsAgrupar=function(){try{const M=$('#view #def-mods');if(M&&!M.dataset.grp&&!M.querySelector('#mod-reun')){
  M.insertAdjacentHTML('beforeend',MOD4.map(m=>`<label class="chk" style="margin-top:8px"><input type="checkbox" id="${m.inp}" ${mod4On(m.k)?'checked':''}> ${ic(m.g,15)} <span><b>${m.n}</b><br><span class="mut">${m.d}${m.k==='direcao'?' (só aparece a quem é DT)':''}</span></span></label>`).join(''));
  MOD4.forEach(m=>{const c=M.querySelector('#'+m.inp);if(c)c.onchange=()=>{S.cfg.modulos=S.cfg.modulos||{};if(c.checked)delete S.cfg.modulos[m.k];else S.cfg.modulos[m.k]=false;save();mod4Aplica();toast('Módulo '+m.n+(c.checked?' ativado':' desativado'),'ok')}})}}catch(e){console.warn(e)}
  return _mgM4.apply(this,arguments)}}
/* 1.102 — Ajuda: cada secção abre e fecha (fechadas por omissão; o índice e a pesquisa abrem a secção) */
if(typeof vAjuda==='function'){const _vAjC=vAjuda;vAjuda=function(){const r=_vAjC.apply(this,arguments);try{
  const C=[...$$('#view .ajs')];if(!C.length)return r;const q=(UI.ajQ||'').trim();UI.ajAb=UI.ajAb||{};
  C.forEach(c=>{const h=c.querySelector(':scope>h2');if(!h||h.dataset.col)return;h.dataset.col=1;h.classList.add('ajcol-h');h.tabIndex=0;h.setAttribute('role','button');
    h.insertAdjacentHTML('beforeend','<span class="ajcol-s" aria-hidden="true">›</span>');
    const ab=q?true:!!UI.ajAb[c.id];c.classList.toggle('ajfech',!ab);h.setAttribute('aria-expanded',ab);
    const alt=()=>{const f=c.classList.toggle('ajfech');h.setAttribute('aria-expanded',!f);UI.ajAb[c.id]=!f};
    h.onclick=alt;h.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();alt()}}});
  const hd=$('#view .ajhd');if(hd&&!$('#ajcol-b'))hd.insertAdjacentHTML('beforeend',`<div id="ajcol-b" style="display:flex;gap:8px;margin-top:10px"><button class="btn sm" data-ajc="1">Abrir tudo</button><button class="btn sm" data-ajc="0">Fechar tudo</button></div>`);
  $$('#view [data-ajc]').forEach(b=>b.onclick=()=>{const ab=b.dataset.ajc==='1';C.forEach(c=>{c.classList.toggle('ajfech',!ab);UI.ajAb[c.id]=ab;const h=c.querySelector('.ajcol-h');if(h)h.setAttribute('aria-expanded',ab)})});
  $$('#view [data-aj]').forEach(a=>a.addEventListener('click',()=>{const c=$('#aj-'+a.dataset.aj);if(c){c.classList.remove('ajfech');UI.ajAb[c.id]=true}},true));
}catch(e){console.warn(e)}return r}}
{const s=document.createElement('style');s.textContent=`
html body .ajs>h2.ajcol-h{cursor:pointer;user-select:none;display:flex;align-items:center;gap:8px}
html body .ajcol-s{margin-left:auto;font-size:22px;line-height:1;color:var(--mut);transition:transform .2s;transform:rotate(90deg)}
html body .ajs.ajfech .ajcol-s{transform:none}
html body .ajs.ajfech>:not(h2){display:none!important}
html body .ajs.ajfech>h2{margin-bottom:0!important}
html body .ajs>h2.ajcol-h:focus-visible{outline:2px solid var(--acc);outline-offset:4px}
/* Início: o ícone das Apps com a altura do cartão ao lado */
html body .hub-mini.hub-so{padding:0!important;align-self:stretch!important;display:flex;align-items:stretch;flex:none}
html body .hub-mini.hub-so .hbm-todas{width:auto!important;height:auto!important;aspect-ratio:1;min-width:38px;padding:0 8px!important;align-self:stretch}
html body .hub-mini.hub-so .hbm-todas>svg{width:22px!important;height:22px!important}
html body .dtop .hub-mini.hub-so:not(.hub-grp .hub-mini){height:auto}
/* título: logótipo centrado com o texto e com folga */
html body #ttl:has(.vlogo){display:flex;align-items:center}
html body #ttl .vlogo{margin:0 12px 0 0!important}
html body #ttl .vlogo .hbic{width:28px!important;height:28px!important}
html body #ttl .vlogo .hbic>svg{width:15px;height:15px}
/* menu lateral: só o item atual e o que está debaixo do rato ficam realçados */
html body #side#side .nav:not(.on):not(.hov):not(:focus-visible){background:transparent!important}
`;document.head.appendChild(s)}
/* 1.103 — «EduApps» passa a chamar-se «SpruceApps» em toda a app (também nos menus já guardados) */
function spruceAppsNome(){try{if(!S.cfg)return;let mud=0;const vis=G=>(G||[]).forEach(x=>{if(!x||typeof x!=='object')return;if(typeof x.nome==='string'&&/^\s*edu\s*apps\s*$/i.test(x.nome)){x.nome='SpruceApps';mud=1}if(Array.isArray(x.f))vis(x.f)});
  if(Array.isArray(S.cfg.menuL))vis(S.cfg.menuL);(Array.isArray(S.cfg.menus)?S.cfg.menus:[]).forEach(m=>{if(m&&Array.isArray(m.M))vis(m.M)});
  if(mud){save();try{menuRender()}catch(_){}}}catch(e){console.warn(e)}}
setTimeout(spruceAppsNome,900);setTimeout(spruceAppsNome,4000);
/* menu lateral: um só item realçado — o da vista atual (ou o último tocado) */
{let ult='';document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#side [data-v]');if(b)ult=b.dataset.v},true);
  const um=()=>{try{const L=[...document.querySelectorAll('#side .nav.on,#side [data-v].on')];if(L.length<2)return;const k=L.find(b=>b.dataset.v===VIEW)||L.find(b=>b.dataset.v===ult)||L[L.length-1];L.forEach(b=>{if(b!==k)b.classList.remove('on')})}catch(_){}};
  const lig=()=>{const s=document.getElementById('side');if(!s||s.dataset.um)return;s.dataset.um=1;new MutationObserver(um).observe(s,{subtree:true,attributes:true,attributeFilter:['class']});
    s.addEventListener('pointerleave',()=>s.querySelectorAll('.hov').forEach(x=>x.classList.remove('hov')))};
  try{lig();addEventListener('load',lig);setTimeout(lig,1500)}catch(_){}}
/* mais ilustrações (no estilo das Apps): novos desenhos para os ecrãs vazios, nos Módulos Opcionais e no topo da Ajuda */
const iluMais=()=>{let C;try{C=ILU_C;ILU_SVG}catch(_){setTimeout(iluMais,200);return}try{Object.assign(ILU_SVG,{
sumario:`<rect x="34" y="14" width="112" height="92" rx="6" fill="var(--panel)" stroke="var(--line)"/><rect x="34" y="14" width="10" height="92" fill="${C.az}" opacity=".85"/><g fill="var(--mut)" opacity=".35"><rect x="54" y="28" width="70" height="5"/><rect x="54" y="42" width="80" height="4"/><rect x="54" y="52" width="74" height="4"/><rect x="54" y="62" width="60" height="4"/><rect x="54" y="76" width="78" height="4"/><rect x="54" y="86" width="50" height="4"/></g><g transform="rotate(35 186 60)"><rect x="178" y="18" width="14" height="74" fill="${C.lj}"/><path d="M178 92h14l-7 14z" fill="#f5d0a9"/><rect x="178" y="18" width="14" height="8" fill="${C.vm}"/></g>`,
horario:`<rect x="30" y="12" width="180" height="96" rx="6" fill="var(--panel)" stroke="var(--line)"/><rect x="30" y="12" width="180" height="16" fill="${C.es}"/><g fill="var(--line)">${[0,1,2,3].map(r=>[0,1,2,3,4].map(c=>`<rect x="${42+c*33}" y="${38+r*17}" width="26" height="11"/>`).join('')).join('')}</g><rect x="75" y="38" width="26" height="11" fill="${C.az}"/><rect x="141" y="55" width="26" height="11" fill="${C.vd}"/><rect x="42" y="72" width="26" height="11" fill="${C.lj}"/><rect x="108" y="89" width="26" height="11" fill="${C.rx}" opacity=".8"/>`,
criterios:`<rect x="20" y="16" width="110" height="88" rx="6" fill="var(--panel)" stroke="var(--line)"/><circle cx="75" cy="60" r="30" fill="${C.az}"/><path d="M75 60V30a30 30 0 0 1 28 40z" fill="${C.lj}"/><path d="M75 60l28 10a30 30 0 0 1-38 18z" fill="${C.vd}"/><rect x="146" y="20" width="76" height="80" rx="6" fill="var(--panel)" stroke="var(--line)"/><g><rect x="158" y="36" width="52" height="4" fill="var(--line)"/><circle cx="180" cy="38" r="6" fill="${C.az}"/><rect x="158" y="58" width="52" height="4" fill="var(--line)"/><circle cx="198" cy="60" r="6" fill="${C.lj}"/><rect x="158" y="80" width="52" height="4" fill="var(--line)"/><circle cx="168" cy="82" r="6" fill="${C.vd}"/></g>`,
definicoes:`<rect x="24" y="18" width="120" height="84" rx="6" fill="var(--panel)" stroke="var(--line)"/><g>${[0,1,2].map(i=>`<rect x="36" y="${32+i*22}" width="56" height="5" fill="var(--mut)" opacity=".35"/><rect x="104" y="${28+i*22}" width="28" height="14" rx="7" class="r" fill="${i===1?'var(--line)':C.az}"/><circle cx="${i===1?111:125}" cy="${35+i*22}" r="5" fill="#fff"/>`).join('')}</g><g transform="translate(186 60)" fill="${C.lj}"><circle r="20"/>${[0,45,90,135,180,225,270,315].map(a=>`<rect x="-5" y="-27" width="10" height="10" transform="rotate(${a})"/>`).join('')}<circle r="8" fill="var(--panel)"/></g>`,
ajuda:`<rect x="30" y="20" width="120" height="84" rx="4" fill="var(--panel)" stroke="var(--line)"/><path d="M90 20v84" stroke="var(--line)"/><g fill="var(--mut)" opacity=".35"><rect x="42" y="34" width="38" height="4"/><rect x="42" y="44" width="34" height="4"/><rect x="42" y="54" width="38" height="4"/><rect x="100" y="34" width="38" height="4"/><rect x="100" y="44" width="30" height="4"/></g><rect x="100" y="56" width="38" height="28" fill="${C.az}" opacity=".25"/><g transform="translate(186 52)"><circle r="22" fill="${C.am}"/><rect x="-9" y="20" width="18" height="12" fill="var(--mut)" opacity=".6"/><path d="M-6 4l6-10 6 10" stroke="#fff" stroke-width="3" fill="none"/></g>`,
ferias:`<circle cx="70" cy="44" r="22" fill="${C.am}"/><g stroke="${C.am}" stroke-width="3">${[0,45,90,135,180,225,270,315].map(a=>`<path d="M70 44m0-30v-8" transform="rotate(${a} 70 44)"/>`).join('')}</g><path d="M0 104q60-22 120 0t120 0v16H0z" fill="${C.az}" opacity=".35"/><path d="M150 100q10-50 0-70" stroke="#92400e" stroke-width="4" fill="none"/><path d="M150 32q-26-6-40 10M150 32q24-10 40 4M150 32q-6 20-24 28" stroke="${C.vd}" stroke-width="7" fill="none" stroke-linecap="round"/>`});
  Object.assign(ILU_VISTA,{sumarios:'sumario',aula:'sumario',meuhorario:'horario',horario:'horario',criterios:'criterios',dominios:'criterios',definicoes:'definicoes',ajuda:'ajuda',escola:'definicoes'})}catch(e){console.warn(e)}};setTimeout(iluMais,0);
/* Ajuda: ilustração no cabeçalho */
if(typeof vAjuda==='function'){const _vAjI=vAjuda;vAjuda=function(){const r=_vAjI.apply(this,arguments);try{const h=$('#view .ajh .ajhd');if(h&&!h.querySelector('.ilu-cab'))h.insertAdjacentHTML('afterbegin',`<span class="ilu-cab" aria-hidden="true">${iluSvg('ajuda',200)}</span>`)}catch(_){}return r}}
/* Módulos Opcionais: o espaço livre no fim de cada grupo recebe a ilustração do grupo (como nas Apps) */
const MOD_ILU={'Gestão e sala de aula':'gestao',SpruceApps:'recreio','Escola e Comunicação':'escola','Organização':'org'};
function modsIlus(){try{if(VIEW!=='definicoes')return;$$('#view #def-mods .mdg').forEach(sc=>{const l=sc.querySelector('.mdg-l');if(!l)return;const o=l.querySelector('.hub-ilu');if(o)o.remove();
  const n=(sc.querySelector('.mdg-h')||{}).textContent||'';const svg=HUB_ILU[MOD_ILU[n.trim()]];if(!svg)return;
  const cols=getComputedStyle(l).gridTemplateColumns.split(' ').filter(Boolean).length;const k=l.children.length;const rem=cols-(k%cols||cols);if(cols<2||rem<1)return;
  l.insertAdjacentHTML('beforeend',`<div class="hub-ilu" aria-hidden="true" style="grid-column:span ${rem}">${svg}</div>`)})}catch(e){console.warn(e)}}
if(typeof vDefinicoes==='function'){const _vDI=vDefinicoes;vDefinicoes=function(){const r=_vDI.apply(this,arguments);requestAnimationFrame(modsIlus);setTimeout(modsIlus,80);return r}}
addEventListener('resize',()=>{clearTimeout(modsIlus._t);modsIlus._t=setTimeout(modsIlus,150)});
{const s=document.createElement('style');s.textContent=`
html body .ajh{position:relative}
html body .ajh .ilu-cab{display:block;line-height:0;margin:0 0 10px;pointer-events:none}
html body .ajh .ilu-cab .ilu{width:180px;max-width:100%;height:auto}
html body #def-mods .mdg-l>.hub-ilu{min-height:90px}
`;document.head.appendChild(s)}
/* Início: «Ano letivo terminado» com uma ilustração de férias */
{let t=0;const f=()=>{try{$$('#view .cdown').forEach(c=>{if(c.dataset.fer||!/Boas férias/.test(c.textContent))return;c.dataset.fer=1;const p=[...c.querySelectorAll('p')].find(x=>/Boas férias/.test(x.textContent));if(p)p.remove();
  const sol=[0,45,90,135,180,225,270,315].map(a=>`<path d="M0-30v-8" transform="rotate(${a})"/>`).join('');
  c.insertAdjacentHTML('beforeend',`<div class="fer-w"><svg class="fer-svg" viewBox="0 0 240 120" aria-hidden="true">
   <g class="fer-sol" transform="translate(70 46)"><g class="fer-raios" stroke="#f59e0b" stroke-width="3" stroke-linecap="round">${sol}</g><circle r="21" fill="#f59e0b"/></g>
   <g class="fer-nuv" fill="var(--panel)" stroke="var(--line)"><path d="M200 22a8 8 0 0 1 15-3 7 7 0 0 1 12 6h-27z"/></g>
   <g class="fer-palm"><path d="M164 104q10-46 0-70" stroke="#92400e" stroke-width="4" fill="none"/><path d="M164 36q-26-6-40 10M164 36q24-10 40 4M164 36q-6 20-24 28M164 36q14 6 20 26" stroke="#16a34a" stroke-width="7" fill="none" stroke-linecap="round"/></g>
   <g class="fer-mar"><path d="M-240 104q30-12 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0v20h-480z" fill="#1b93c6" opacity=".3"/><path class="fer-mar2" d="M-240 110q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0v14h-480z" fill="#1b93c6" opacity=".45"/></g>
  </svg><div class="fer-t">Boas férias!</div><div class="fer-s">O ano letivo terminou. Descanse — está tudo guardado para o próximo ano.</div></div>`)})}catch(_){}};
  try{new MutationObserver(()=>{clearTimeout(t);t=setTimeout(f,80)}).observe(document.body,{childList:true,subtree:true})}catch(_){}}
/* 1.105 — Ajuda: índice por baixo da pesquisa numa lista limpa (deixa de partir em colunas cortadas), secções abre/fecha mais claras */
{const s=document.createElement('style');s.textContent=`
html body .ajh{overflow:hidden}
html body .ajh .ajidx{display:flex!important;flex-direction:column!important;flex-wrap:nowrap!important;gap:0!important;margin-top:10px;border:1px solid var(--line);border-radius:10px;background:var(--panel);overflow-x:hidden}
html body:not(:has(.vside)) .ajh .ajidx{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));border:0;background:transparent;gap:6px!important}
html body .ajh .ajidx .chip{display:flex!important;align-items:center;gap:10px;width:auto;min-width:0;margin:0!important;padding:9px 12px!important;border:0!important;border-bottom:1px solid var(--line)!important;border-radius:0!important;background:transparent!important;font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:none!important}
html body:not(:has(.vside)) .ajh .ajidx .chip{border:1px solid var(--line)!important;border-radius:8px!important;background:var(--panel)!important}
html body .ajh .ajidx .chip:last-child{border-bottom:0!important}
html body .ajh .ajidx .chip>svg{flex:none;color:var(--acc)}
html body .ajh .ajidx .chip:hover{background:color-mix(in srgb,var(--acc) 8%,transparent)!important;color:var(--acc)}
html body .ajh .ajidx .chip.aj-at{background:color-mix(in srgb,var(--acc) 12%,transparent)!important;color:var(--acc);box-shadow:inset 3px 0 0 var(--acc)!important}
html body .ajh .ajman2 .ajtx small{white-space:normal}
html body .ajh #aj-q{width:100%;box-sizing:border-box;margin-top:12px}
html body .ajh #ajcol-b .btn{flex:1;justify-content:center}
html body.est-sge .ajh .ajidx,html body.est-sge .ajh .ajidx .chip{border-radius:0!important}
html body .ajs>h2.ajcol-h{margin:-6px -8px 0;padding:6px 8px;border-radius:8px;font-weight:700}
html body .ajs>h2.ajcol-h:hover{background:color-mix(in srgb,var(--acc) 6%,transparent)}
html body .ajs:not(.ajfech)>h2.ajcol-h{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--line);border-radius:8px 8px 0 0}
html body .ajcol-s{flex:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:1px solid var(--line);border-radius:8px;background:var(--panel);font-size:20px!important;color:var(--acc)!important;transform:rotate(-90deg)!important}
html body .ajs.ajfech .ajcol-s{transform:rotate(90deg)!important}
html body.est-sge .ajcol-s,html body.est-sge .ajs>h2.ajcol-h{border-radius:0}
`;document.head.appendChild(s)}
/* ao abrir uma secção pelo índice: fica marcada no índice */
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('#view .ajidx [data-aj]');if(!a)return;$$('#view .ajidx .aj-at').forEach(x=>x.classList.remove('aj-at'));a.classList.add('aj-at')});
/* Modo de Apresentação passa a módulo opcional (ligado por omissão) */
const apresModOn=()=>{try{return !(S.cfg&&S.cfg.modulos&&S.cfg.modulos.apres===false)}catch(_){return true}};
function apresModAplica(){try{const b=document.getElementById('apresBtn');if(b){const sp=b.closest('.barico');(sp&&sp.children.length===1?sp:b).style.display=apresModOn()?'':'none'}
  if(!apresModOn()&&document.body.classList.contains('apres')&&typeof apresClasses==='function'){apresClasses(false);go(VIEW)}}catch(e){console.warn(e)}}
try{const g=MOD_GR.find(x=>x[0]==='Gestão e sala de aula');if(g)g[2].push(['mod-apres','apres','eye']);Object.assign(HUB_SGE_DEF,{apres:'sgeCinza'})}catch(_){}
{const _mgAp=modsAgrupar;modsAgrupar=function(){try{const M=$('#view #def-mods');if(M&&!M.dataset.grp&&!M.querySelector('#mod-apres')){
  M.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px"><input type="checkbox" id="mod-apres" ${apresModOn()?'checked':''}> ${ic('eye',15)} <span><b>Modo de Apresentação</b><br><span class="mut">Botão do olho no topo: esconde nomes, fotografias e dados sensíveis ao projetar o ecrã</span></span></label>`);
  const c=M.querySelector('#mod-apres');c.onchange=()=>{S.cfg.modulos=S.cfg.modulos||{};if(c.checked)delete S.cfg.modulos.apres;else S.cfg.modulos.apres=false;save();apresModAplica();toast('Modo de Apresentação '+(c.checked?'ativado':'desativado'),'ok')}}}catch(e){console.warn(e)}
  return _mgAp.apply(this,arguments)}}
setTimeout(apresModAplica,400);{const _gAp=go;go=function(){const r=_gAp.apply(this,arguments);try{apresModAplica()}catch(_){}return r};if(_gAp._f)go._f=_gAp._f}
/* Ficha do aluno: separadores numa grelha arrumada (colunas iguais, alinhados), em vez de três filas desencontradas */
{const s=document.createElement('style');s.textContent=`
html body #dw-b .tabs.fichatabs{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:4px!important;padding:4px!important;overflow:visible!important}
html body #dw-b .tabs.fichatabs>button{margin:0!important;justify-content:flex-start!important;text-align:left;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:8px 10px!important}
html body.est-sge.est-sge.est-sge #dw-b .tabs.fichatabs>button{margin:0!important}
`;document.head.appendChild(s)}
{const s=document.createElement('style');s.textContent=`
html body .card.ajs.ajfech{padding-top:12px!important;padding-bottom:12px!important}
html body .ajh .ajidx{box-sizing:border-box;max-width:100%}
html body .ajh .ajidx .chip{box-sizing:border-box;max-width:100%;flex:none}
html body .ajh .ajidx .chip>svg+*,html body .ajh .ajidx .chip{text-overflow:ellipsis}
`;document.head.appendChild(s)}
{const s=document.createElement('style');s.textContent=`
html body .cdown[data-fer]{display:flex;flex-direction:column}
html body .fer-w{display:flex;flex-direction:column;align-items:center;text-align:center;padding:6px 8px 4px;gap:4px}
html body .fer-svg{width:min(240px,100%);height:auto;overflow:hidden;border-radius:10px;background:color-mix(in srgb,#1b93c6 7%,transparent);margin-bottom:8px}
html body.est-sge .fer-svg{border-radius:0}
html body .fer-t{font-size:22px;font-weight:800;color:var(--acc);letter-spacing:-.01em;animation:ferEnt .7s ease-out both}
html body .fer-s{font-size:13px;color:var(--mut);max-width:30ch;line-height:1.4;animation:ferEnt .7s .15s ease-out both}
html body .fer-raios{animation:ferRoda 14s linear infinite;transform-box:fill-box;transform-origin:center}
html body .fer-sol{animation:ferPulsa 3.5s ease-in-out infinite}
html body .fer-palm{transform-box:fill-box;transform-origin:50% 100%;animation:ferBal 4s ease-in-out infinite}
html body .fer-mar{animation:ferMar 6s linear infinite}
html body .fer-mar2{animation:ferMar 9s linear infinite reverse}
html body .fer-nuv{animation:ferNuv 12s ease-in-out infinite alternate}
@keyframes ferRoda{to{transform:rotate(360deg)}}
@keyframes ferPulsa{0%,100%{opacity:1}50%{opacity:.85}}
@keyframes ferBal{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(3deg)}}
@keyframes ferMar{to{transform:translateX(120px)}}
@keyframes ferNuv{to{transform:translateX(-18px)}}
@keyframes ferEnt{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){html body .fer-w *{animation:none!important}}
`;document.head.appendChild(s)}
/* 1.107 — Notas Flutuantes passam a módulo opcional (em Definições › Módulos Opcionais; sai da Aparência) */
try{const g=MOD_GR.find(x=>x[0]==='Organização');if(g)g[2].push(['mod-nf','notasf','pencil']);Object.assign(HUB_SGE_DEF,{notasf:'sgeAmbar'})}catch(_){}
{const _mgNf=modsAgrupar;modsAgrupar=function(){try{const M=$('#view #def-mods');if(M&&!M.dataset.grp&&!M.querySelector('#mod-nf')&&typeof nfOn==='function'){
  M.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px"><input type="checkbox" id="mod-nf" ${nfOn()?'checked':''}> ${ic('pencil',15)} <span><b>Notas Flutuantes</b><br><span class="mut">Post-its por cima de qualquer página (botão no canto e atalho Alt+N); cada nota em todas as páginas ou só numa</span></span></label>`);
  const c=M.querySelector('#mod-nf');c.onchange=()=>{S.cfg.notasOn=c.checked;save();try{nfRender(true)}catch(_){}toast('Notas Flutuantes '+(c.checked?'ativadas':'desativadas'),'ok')}}}catch(e){console.warn(e)}
  return _mgNf.apply(this,arguments)}}
if(typeof vDefinicoes==='function'){const _vdNf=vDefinicoes;vDefinicoes=function(){const r=_vdNf.apply(this,arguments);try{const c=$('#view #nf-cfg');if(c)c.remove()}catch(_){}return r}}
/* 1.108 — SpruceNote Web Clipper passa a módulo opcional (desligado: o atalho do Início desaparece) */
const snwModOn=()=>{try{return !(S.cfg&&S.cfg.modulos&&S.cfg.modulos.snweb===false)}catch(_){return true}};
const snwModAplica=()=>{try{document.body.classList.toggle('modoff-snweb',!snwModOn())}catch(_){}};
try{const g=MOD_GR.find(x=>x[0]==='Organização');if(g)g[2].push(['mod-snw','snweb','download']);Object.assign(HUB_SGE_DEF,{snweb:'sgeTerra'})}catch(_){}
{const _mgSw=modsAgrupar;modsAgrupar=function(){try{const M=$('#view #def-mods');if(M&&!M.dataset.grp&&!M.querySelector('#mod-snw')){
  M.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px"><input type="checkbox" id="mod-snw" ${snwModOn()?'checked':''}> ${ic('download',15)} <span><b>SpruceNote Web Clipper</b><br><span class="mut">Extensão do Chrome para guardar imagens, texto, ligações e vídeos da web nos quadros do SpruceNote (atalho no Início)</span></span></label>`);
  const c=M.querySelector('#mod-snw');c.onchange=()=>{S.cfg.modulos=S.cfg.modulos||{};if(c.checked)delete S.cfg.modulos.snweb;else S.cfg.modulos.snweb=false;save();snwModAplica();toast('SpruceNote Web Clipper '+(c.checked?'ativado':'desativado'),'ok')}}}catch(e){console.warn(e)}
  return _mgSw.apply(this,arguments)}}
setTimeout(snwModAplica,400);{const _gSw=go;go=function(){const r=_gSw.apply(this,arguments);snwModAplica();return r};if(_gSw._f)go._f=_gSw._f}
{const s=document.createElement('style');s.textContent='html body.modoff-snweb .snw-chip{display:none!important}';document.head.appendChild(s)}
/* 1.109 — Notas Flutuantes desligadas: o botão do canto desaparece mesmo (o tema SGE forçava-o a aparecer) */
const nfModAplica=()=>{try{document.body.classList.toggle('modoff-nf',typeof nfOn==='function'&&!nfOn())}catch(_){}};
setTimeout(nfModAplica,400);setTimeout(nfModAplica,2500);{const _gNf=go;go=function(){const r=_gNf.apply(this,arguments);nfModAplica();return r};if(_gNf._f)go._f=_gNf._f}
document.addEventListener('change',e=>{if(e.target&&(e.target.id==='mod-nf'||e.target.id==='nf-on'))setTimeout(nfModAplica,0)});
{const s=document.createElement('style');s.textContent='html body.modoff-nf #nffab:not(#_a):not(#_b),html body.modoff-nf #nflayer,html body #nffab[hidden]:not(#_a):not(#_b),html body #nflayer[hidden]{display:none!important}';document.head.appendChild(s)}
/* 1.110 — JornalNote passa a módulo opcional próprio: desligado, não aparece mesmo com o cargo do Jornal (o Jornal Escolar já tinha o seu) */
const jnnModOn=()=>{try{return !(S.cfg&&S.cfg.modulos&&S.cfg.modulos.jornalnote===false)}catch(_){return true}};
try{const a=HUB_APPS.find(x=>x.id==='jornalnote');if(a){const o=a.on;a.on=()=>jnnModOn()&&(!o||o())}
  const g=MOD_GR.find(x=>x[0]==='Escola e Comunicação');if(g){const i=g[2].findIndex(x=>x[1]==='jornal');g[2].splice(i<0?g[2].length:i+1,0,['mod-jnn','jornalnote'])}}catch(e){console.warn(e)}
{const _mgJn=modsAgrupar;modsAgrupar=function(){try{const M=$('#view #def-mods');if(M&&!M.dataset.grp&&!M.querySelector('#mod-jnn')){
  M.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px"><input type="checkbox" id="mod-jnn" ${jnnModOn()?'checked':''}> ${ic('pen',15)} <span><b>JornalNote</b><br><span class="mut">Quadros de ideias do Jornal Escolar (precisa do Jornal Escolar e do SpruceNote ligados)</span></span></label>`);
  const c=M.querySelector('#mod-jnn');c.onchange=()=>{S.cfg.modulos=S.cfg.modulos||{};if(c.checked)delete S.cfg.modulos.jornalnote;else S.cfg.modulos.jornalnote=false;save();try{hubMenuMods();menuAgendar()}catch(_){}toast('JornalNote '+(c.checked?'ativado':'desativado'),'ok')}}}catch(e){console.warn(e)}
  return _mgJn.apply(this,arguments)}}
{const _gJn=go;go=function(v){if(v==='snjornal'&&!jnnModOn())v='inicio';const r=_gJn.apply(this,[v].concat([].slice.call(arguments,1)));try{hubMenuMods()}catch(_){}return r};if(_gJn._f)go._f=_gJn._f}
setTimeout(()=>{try{hubMenuMods()}catch(_){}},1800);
/* Ajuda: a animação deixa de esticar até à altura do texto (ficava um espaço vazio por baixo) */
{const s=document.createElement('style');s.textContent='html body .ajg{align-items:start!important}html body .ajg>figure.ajf{align-self:start!important;height:auto!important}html body figure.ajf>img,html body figure.ajf>canvas{display:block}';document.head.appendChild(s)}
