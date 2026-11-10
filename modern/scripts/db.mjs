// EduSpruce · transforma o index.html normal na versão com base de dados («vX.XXXDB»)
//   node modern/scripts/db.mjs <entrada.html> <saida.html>   → também copia esm/ e supabase-config.json para a pasta de saída
import {readFileSync,writeFileSync,cpSync,mkdirSync} from 'node:fs';import {dirname,join,resolve} from 'node:path';import {fileURLToPath} from 'node:url';
const raiz=join(dirname(fileURLToPath(import.meta.url)),'..');
export function aplicarDB(html){let s=html;
  for(const [a,b] of JSON.parse(readFileSync(join(raiz,'src/moderno/patches.json'),'utf8'))){const n=s.split(a).length-1;if(n!==1)throw new Error('Alteração não aplicável ('+n+'×): '+a.slice(0,70));s=s.replace(a,()=>b)}
  const v=/const VERSAO='([0-9.]+)';/;if(!v.test(s))throw new Error('VERSAO não encontrada');s=s.replace(v,(_,x)=>`const VERSAO='${x}DB';`);
  const ANC="\naddEventListener('pageshow',e=>{if(e.persisted)go('inicio')});";if(s.split(ANC).length!==2)throw new Error('Âncora do módulo em falta');
  s=s.replace(ANC,()=>readFileSync(join(raiz,'src/moderno/basedados.js'),'utf8')+ANC);
  const ib=s.lastIndexOf('</body>');return s.slice(0,ib)+'<script type="module" src="esm/arranque.mjs"></script>\n'+s.slice(ib)}
export function copiarRecursos(destDir){mkdirSync(join(destDir,'esm'),{recursive:true});cpSync(join(raiz,'src/esm'),join(destDir,'esm'),{recursive:true});cpSync(join(raiz,'supabase-config.json'),join(destDir,'supabase-config.json'))}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const [,,ent,sai]=process.argv;if(!ent||!sai){console.error('uso: node db.mjs entrada.html saida.html');process.exit(1)}
  if(readFileSync(ent,'utf8').includes('esm/arranque.mjs')){console.error('A entrada já é a versão com base de dados.');process.exit(1)}
  writeFileSync(sai,aplicarDB(readFileSync(ent,'utf8')));copiarRecursos(dirname(resolve(sai)));console.log('versão com base de dados →',sai)}
