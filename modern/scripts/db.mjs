// EduSpruce · transforma o index.html normal na versão com base de dados («vX.XXXDB»)
//   node modern/scripts/db.mjs <entrada.html> <saida.html>   → também copia esm/ e supabase-config.json para a pasta de saída
import {readFileSync,writeFileSync,cpSync,mkdirSync} from 'node:fs';import {dirname,join,resolve} from 'node:path';import {fileURLToPath} from 'node:url';
const raiz=join(dirname(fileURLToPath(import.meta.url)),'..');
export function aplicarDB(html){let s=html;
  for(const [a,b] of JSON.parse(readFileSync(join(raiz,'src/moderno/patches.json'),'utf8'))){const n=s.split(a).length-1;if(n!==1)throw new Error('Alteração não aplicável ('+n+'×): '+a.slice(0,70));s=s.replace(a,()=>b)}
  const v=/const VERSAO='([0-9.]+)';/;if(!v.test(s))throw new Error('VERSAO não encontrada');s=s.replace(v,(_,x)=>`const VERSAO='${x}DB';`);
  const ANC="\naddEventListener('pageshow',e=>{if(e.persisted)go('inicio')});";if(s.split(ANC).length!==2)throw new Error('Âncora do módulo em falta');
  s=s.replace(ANC,()=>readFileSync(join(raiz,'src/moderno/basedados.js'),'utf8')+'\n'+readFileSync(join(raiz,'src/moderno/autoav.js'),'utf8')+'\n'+readFileSync(join(raiz,'src/moderno/digit.js'),'utf8')+'\n'+readFileSync(join(raiz,'src/moderno/arena-comum.js'),'utf8')+'\n'+readFileSync(join(raiz,'src/moderno/arena.js'),'utf8')+'\n'+readFileSync(join(raiz,'src/moderno/pulso.js'),'utf8')+'\n'+readFileSync(join(raiz,'src/moderno/forms.js'),'utf8')+'\n'+readFileSync(join(raiz,'src/moderno/banco.js'),'utf8')+ANC);
  /* a configuração (endereço e chave publicável) vai embutida na página: a app não espera por mais nenhum pedido para ligar à base de dados */
  const cfg=JSON.parse(readFileSync(join(raiz,'supabase-config.json'),'utf8'));const emb=JSON.stringify({ativo:!!cfg.ativo,url:cfg.url,anonKey:cfg.anonKey}).replace(/</g,'\\u003c');
  const ver=(s.match(/const VERSAO='([0-9.]+DB)';/)||[])[1]||'';
  const ib=s.lastIndexOf('</body>');return s.slice(0,ib)+'<script>window.__ES_SB='+emb+'</script>\n<script type="module" src="esm/arranque.mjs?v='+ver+'"></script>\n'+s.slice(ib)}
/* página do aluno da Arena (sem conta): o código comum vai embutido e a configuração pública também */
export function arenaHtml(f){const cfg=JSON.parse(readFileSync(join(raiz,'supabase-config.json'),'utf8'));const emb=JSON.stringify({ativo:!!cfg.ativo,url:cfg.url,anonKey:cfg.anonKey}).replace(/</g,'\\u003c');
  let h=readFileSync(join(raiz,f||'src/arena/arena.html'),'utf8');if(h.split('/*ARENA_COMUM*/').length!==2||h.split('"__ES_SB__"').length!==2)throw new Error('arena.html: marcadores em falta');
  return h.replace('/*ARENA_COMUM*/',()=>readFileSync(join(raiz,'src/moderno/arena-comum.js'),'utf8')).replace('"__ES_SB__"',()=>emb)}
export function copiarRecursos(destDir){mkdirSync(join(destDir,'esm'),{recursive:true});cpSync(join(raiz,'src/esm'),join(destDir,'esm'),{recursive:true});cpSync(join(raiz,'supabase-config.json'),join(destDir,'supabase-config.json'))}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const [,,ent,sai]=process.argv;if(!ent||!sai){console.error('uso: node db.mjs entrada.html saida.html');process.exit(1)}
  if(readFileSync(ent,'utf8').includes('esm/arranque.mjs')){console.error('A entrada já é a versão com base de dados.');process.exit(1)}
  const html=aplicarDB(readFileSync(ent,'utf8'));writeFileSync(sai,html);copiarRecursos(dirname(resolve(sai)));/* app sem base de dados, só usada dentro das cópias offline exportadas (arquivo.html) */writeFileSync(join(dirname(resolve(sai)),'arquivo.html'),readFileSync(ent,'utf8'));writeFileSync(join(dirname(resolve(sai)),'arena.html'),arenaHtml());writeFileSync(join(dirname(resolve(sai)),'pulso.html'),arenaHtml('src/pulso/pulso.html'));writeFileSync(join(dirname(resolve(sai)),'versao.json'),JSON.stringify({v:(html.match(/const VERSAO='([0-9.]+)DB';/)||[])[1]||''}));console.log('versão com base de dados →',sai)}
