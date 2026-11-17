// EduSpruce · transforma o index.html normal na versão com base de dados («vX.XXXDB»)
//   node modern/scripts/db.mjs <entrada.html> <saida.html>   → também copia esm/ e supabase-config.json para a pasta de saída
import {readFileSync,writeFileSync,cpSync,mkdirSync} from 'node:fs';import {semHas} from './semhas.mjs';import {dirname,join,resolve} from 'node:path';import {fileURLToPath} from 'node:url';
const raiz=join(dirname(fileURLToPath(import.meta.url)),'..');
export function aplicarDB(html){let s=html;
  for(const [a,b] of JSON.parse(readFileSync(join(raiz,'src/moderno/patches.json'),'utf8'))){const n=s.split(a).length-1;if(n!==1)throw new Error('Alteração não aplicável ('+n+'×): '+a.slice(0,70));s=s.replace(a,()=>b)}
  const v=/const VERSAO='([0-9.]+)';/;if(!v.test(s))throw new Error('VERSAO não encontrada');s=s.replace(v,(_,x)=>`const VERSAO='${x}DB';`);
  const ANC="\naddEventListener('pageshow',e=>{if(e.persisted)go('inicio')});";if(s.split(ANC).length!==2)throw new Error('Âncora do módulo em falta');
  /* módulos da versão com base de dados, pela ordem de src/moderno/ordem.txt (um módulo novo = uma linha nova) */
  const mods=readFileSync(join(raiz,'src/moderno/ordem.txt'),'utf8').split('\n').map(x=>x.trim()).filter(Boolean);
  s=s.replace(ANC,()=>mods.map(f=>readFileSync(join(raiz,'src/moderno',f),'utf8')).join('\n')+ANC);
  /* a configuração (endereço e chave publicável) vai embutida na página: a app não espera por mais nenhum pedido para ligar à base de dados */
  const cfg=JSON.parse(readFileSync(join(raiz,'supabase-config.json'),'utf8'));const emb=JSON.stringify({ativo:!!cfg.ativo,url:cfg.url,anonKey:cfg.anonKey}).replace(/</g,'\\u003c');
  const ver=(s.match(/const VERSAO='([0-9.]+DB)';/)||[])[1]||'';
  {const ih=s.indexOf('<head>');if(ih<0)throw new Error('<head> em falta');s=s.slice(0,ih+6)+'\n<script>'+readFileSync(join(raiz,'src/moderno/rede.js'),'utf8')+'</script>'+s.slice(ih+6)}
  const ib=s.lastIndexOf('</body>');return s.slice(0,ib)+'<script>window.__ES_SB='+emb+'</script>\n<script type="module" src="esm/arranque.mjs?v='+ver+'"></script>\n'+s.slice(ib)}

/* 1.041 · a página publicada passa a ser leve: estilos, código e dados grandes vão para ficheiros em app/ com uma impressão digital no nome
   (cada nome nunca muda de conteúdo → o service worker guarda-os e a app abre sem os descarregar outra vez; uma página antiga nunca usa ficheiros novos) */
import {createHash} from 'node:crypto';import {existsSync,readdirSync,unlinkSync} from 'node:fs';
export function separar(html,destDir){const dir=join(destDir,'app');mkdirSync(dir,{recursive:true});const usados=[];
  const guarda=(nome,ext,txt)=>{const h=createHash('sha256').update(txt).digest('hex').slice(0,12);const f=`${nome}.${h}.${ext}`;writeFileSync(join(dir,f),txt);usados.push(f);return 'app/'+f};
  let s=semHas(html);
  const troca=(a,b)=>{const n=s.split(a).length-1;if(n!==1)throw new Error('separar: alteração não aplicável ('+n+'×): '+a.slice(0,60));s=s.replace(a,()=>b)};
  /* o manifesto da app (instalar no ecrã principal) passa a ser o ficheiro publicado, em vez de 167 KB embutidos na página */
  if(existsSync(join(raiz,'..','manifest.webmanifest'))){const r=/<link rel="manifest" href="data:[^"]*">/;if(r.test(s))s=s.replace(r,'<link rel="manifest" href="manifest.webmanifest">')}
  /* dados embutidos: só chegam quando são precisos (Ajuda, PDF, ficha MRA) */
  troca("const gifsAjuda=()=>{if(!_gifs){try{_gifs=JSON.parse(document.getElementById('gifs-json').textContent)}catch(e){_gifs={}}}return _gifs};",
    "const gifsAjuda=()=>{if(!_gifs){const el=document.getElementById('gifs-json');if(el&&!el.textContent.trim()&&el.dataset.src){gifsAjuda._o=gifsAjuda._o||{};if(!gifsAjuda._p)gifsAjuda._p=fetch(el.dataset.src).then(r=>{if(!r.ok)throw 0;return r.text()}).then(t=>{el.textContent=t;try{Object.assign(gifsAjuda._o,JSON.parse(t))}catch(_){}_gifs=gifsAjuda._o;if(typeof VIEW!=='undefined'&&VIEW==='ajuda')try{go('ajuda')}catch(_){}}).catch(()=>{gifsAjuda._p=null});return gifsAjuda._o||(gifsAjuda._o={})}try{_gifs=JSON.parse(el.textContent)}catch(e){_gifs={}}}return _gifs};");
  troca("const el=document.getElementById(id);if(!el||typeof DecompressionStream==='undefined')return null;const bin=",
    "const el=document.getElementById(id);if(!el||typeof DecompressionStream==='undefined')return null;if(!el.textContent.trim()&&el.dataset.src){const r=await fetch(el.dataset.src);if(!r.ok)throw new Error('ficheiro em falta ('+r.status+')');el.textContent=await r.text()}const bin=");
  for(const [id,tipo] of [['gifs-json','application/json'],['pdfgz-lib','application/octet-stream'],['mragz','application/octet-stream'],['pdfgz-wk','application/octet-stream']]){
    const a=`<script type="${tipo}" id="${id}">`;const i=s.indexOf(a);if(i<0||s.indexOf(a,i+1)>=0)throw new Error('separar: bloco '+id);const j=s.indexOf('</script>',i);
    const txt=s.slice(i+a.length,j);s=s.slice(0,i)+`<script type="${tipo}" id="${id}" data-src="${guarda(id,'txt',txt)}"></script>`+s.slice(j+9)}
  /* ícones dos logótipos (separador e ecrã principal do iPhone): eram ~600 KB de imagens em texto dentro do programa, descarregados
     por toda a gente a cada versão; passam a ficheiros .png, e o navegador só vai buscar os do logótipo em uso */
  {let n=0;s=s.replace(/"(fav|ios)": "data:image\/png;base64,([A-Za-z0-9+\/=]+)"/g,(m,k,b64)=>{n++;return `"${k}": "${guarda('logo-'+k,'png',Buffer.from(b64,'base64'))}"`});if(n<10)throw new Error('separar: logótipos não encontrados ('+n+')')}
  /* estilos grandes (fora dos scripts) → ficheiros .css, pela mesma ordem */
  const fimHead=s.indexOf('</head>');let k=0;
  s=s.slice(0,fimHead).replace(/<style([^>]*)>([\s\S]*?)<\/style>/g,(m,at,css)=>css.length<20000?m:`<link rel="stylesheet" href="${guarda('estilos'+(++k),'css',css)}"${/id="([^"]+)"/.test(at)?' data-id="'+at.match(/id="([^"]+)"/)[1]+'"':''}>`)+s.slice(fimHead);
  /* o código principal (o maior script) → app.<impressão>.js */
  const re=/<script>([\s\S]*?)<\/script>/g;let mx=null,m;while((m=re.exec(s))){if(!mx||m[1].length>mx[1].length)mx={i:m.index,t:m[0],1:m[1]}}
  if(!mx||mx[1].length<1e6)throw new Error('separar: código principal não encontrado');
  s=s.slice(0,mx.i)+`<script src="${guarda('app','js',mx[1])}"></script>`+s.slice(mx.i+mx.t.length);
  /* arrumação: ficam os ficheiros desta versão e os da anterior (uma página já aberta pode ainda pedir os dela) */
  const lst=join(dir,'.versao-anterior');let ant=[];try{ant=JSON.parse(readFileSync(lst,'utf8'))}catch(_){}
  for(const f of readdirSync(dir))if(!f.startsWith('.')&&!usados.includes(f)&&!ant.includes(f))try{unlinkSync(join(dir,f))}catch(_){}
  writeFileSync(lst,JSON.stringify(usados));
  return s}
/* página do aluno da Arena (sem conta): o código comum vai embutido e a configuração pública também */
export function arenaHtml(f){const cfg=JSON.parse(readFileSync(join(raiz,'supabase-config.json'),'utf8'));const emb=JSON.stringify({ativo:!!cfg.ativo,url:cfg.url,anonKey:cfg.anonKey}).replace(/</g,'\\u003c');
  let h=readFileSync(join(raiz,f||'src/arena/arena.html'),'utf8');if(h.split('/*ARENA_COMUM*/').length!==2||h.split('"__ES_SB__"').length!==2)throw new Error('arena.html: marcadores em falta');
  return h.replace('/*ARENA_COMUM*/',()=>readFileSync(join(raiz,'src/moderno/arena-comum.js'),'utf8')).replace('"__ES_SB__"',()=>emb)}
/* arquivo.html = a app sem base de dados, que só serve de recheio às cópias offline exportadas (um ficheiro aberto do disco, com window.__ES_OFF).
   Aberta diretamente no sítio seria uma segunda app, sem conta e sem política de conteúdo, na mesma origem: reencaminha para a app verdadeira. */
export function arquivoHtml(h){const i=h.indexOf('<head>');if(i<0)throw new Error('arquivo: <head> em falta');
  return h.slice(0,i+6)+'\n<script>if(/^https?:$/.test(location.protocol)&&!window.__ES_OFF)location.replace("./")</script>'+h.slice(i+6)}
export function copiarRecursos(destDir){mkdirSync(join(destDir,'esm'),{recursive:true});cpSync(join(raiz,'src/esm'),join(destDir,'esm'),{recursive:true});cpSync(join(raiz,'supabase-config.json'),join(destDir,'supabase-config.json'))}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const [,,ent,sai]=process.argv;if(!ent||!sai){console.error('uso: node db.mjs entrada.html saida.html');process.exit(1)}
  if(readFileSync(ent,'utf8').includes('esm/arranque.mjs')){console.error('A entrada já é a versão com base de dados.');process.exit(1)}
  const html=aplicarDB(readFileSync(ent,'utf8'));writeFileSync(sai,separar(html,dirname(resolve(sai))));copiarRecursos(dirname(resolve(sai)));/* app sem base de dados, só usada dentro das cópias offline exportadas (arquivo.html) */writeFileSync(join(dirname(resolve(sai)),'arquivo.html'),arquivoHtml(readFileSync(ent,'utf8')));writeFileSync(join(dirname(resolve(sai)),'spruceit.html'),arenaHtml());/* endereço antigo: reencaminha para o Spruce It (com o código) */writeFileSync(join(dirname(resolve(sai)),'arena.html'),'<!doctype html><meta charset="utf-8"><title>Spruce It</title><script>location.replace(\'spruceit.html\'+location.hash)</script><a href="spruceit.html">Spruce It</a>');writeFileSync(join(dirname(resolve(sai)),'pulso.html'),arenaHtml('src/pulso/pulso.html'));writeFileSync(join(dirname(resolve(sai)),'versao.json'),JSON.stringify({v:(html.match(/const VERSAO='([0-9.]+)DB';/)||[])[1]||''}));console.log('versão com base de dados →',sai)}
