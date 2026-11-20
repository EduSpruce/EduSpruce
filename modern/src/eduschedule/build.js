// EduSchedule (antigo EduTime) · constrói a página da app: node build.js [PASTA_DE_SAÍDA]  (por omissão dist/)
// Chamado pelo ./es (testa/pub), que escreve /eduschedule.html na raiz. O CSS (Tailwind + daisyUI) gera-se a partir das classes usadas.
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const R=__dirname,out=path.resolve(process.argv[2]||path.join(R,'dist'));fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(R,'dist'),{recursive:true});
if(!fs.existsSync(path.join(R,'node_modules','@tailwindcss','cli')))execSync('npm ci --silent --no-audit --no-fund',{cwd:R,stdio:'ignore'});
execSync('npx @tailwindcss/cli -i src/input.css -o dist/out.css --minify',{cwd:R,stdio:'ignore'});
const ler=f=>fs.readFileSync(path.join(R,'src',f),'utf8');
const css=fs.readFileSync(path.join(R,'dist/out.css'),'utf8');
const eng=ler('engine.js')+'\n'+ler('samples.js');
/* o horário nunca fica no aparelho: no código da app, localStorage passa a ESTORE (ver src/ponte.js) */
const app=JSON.parse(ler('ordem.json')).map(f=>f==='ponte.js'?ler(f):ler(f).replace(/\blocalStorage\b/g,'ESTORE')).join('\n');
for(const [n,s] of [['engine',eng],['app',app]])if(/<\/script/i.test(s))throw new Error('</script em '+n);
let html=ler('template.html');
html=html.replace(/<link rel="preconnect"[^>]*>\n?/g,'').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/,'<link rel="stylesheet" href="fontes/fontes.css">');
html=html.replace('/*CSS*/',()=>css).replace('/*ENGINE*/',()=>eng).replace('/*APP*/',()=>app);
fs.writeFileSync(path.join(out,'eduschedule.html'),html);
/* consulta pública dos horários publicados (sem conta): /horarios.html#<código>, com o endereço e a chave publicável do Supabase */
const cfg=JSON.parse(fs.readFileSync(path.join(R,'..','..','supabase-config.json'),'utf8'));
fs.writeFileSync(path.join(out,'horarios.html'),fs.readFileSync(path.join(R,'publico.html'),'utf8').replace('"__ES_SB__"',()=>JSON.stringify({url:cfg.url,anonKey:cfg.anonKey}).replace(/</g,'\\u003c')));
console.log('eduschedule.html',(html.length/1024|0)+' KB');
