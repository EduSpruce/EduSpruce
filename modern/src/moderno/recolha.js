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
