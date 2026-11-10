// EduSpruce · construção: junta src/ num único index.html (igual à versão original, byte a byte)
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {createHash} from 'node:crypto';import {dirname,join} from 'node:path';import {fileURLToPath} from 'node:url';
const raiz=join(dirname(fileURLToPath(import.meta.url)),'..');const shell=readFileSync(join(raiz,'src/index.shell.html'),'utf8');
const out=shell.replace(/<!--@include ([^>]+?)-->/g,(_,p)=>readFileSync(join(raiz,p),'utf8'));
mkdirSync(join(raiz,'dist'),{recursive:true});writeFileSync(join(raiz,'dist/index.html'),out);
const sha=createHash('sha256').update(out,'utf8').digest('hex');const man=JSON.parse(readFileSync(join(raiz,'src/manifesto.json'),'utf8'));
console.log('dist/index.html',(out.length/1048576).toFixed(2)+' MB','sha256',sha);
/* versão moderna: a mesma app + a camada ES Modules (desligada sem supabase-config.json) */
const _ib=out.lastIndexOf('</body>');const mod=out.slice(0,_ib)+'<script type="module" src="esm/arranque.mjs"></script>\n'+out.slice(_ib);mkdirSync(join(raiz,'dist/moderno'),{recursive:true});writeFileSync(join(raiz,'dist/moderno/index.html'),mod);
const {cpSync}=await import('node:fs');cpSync(join(raiz,'src/esm'),join(raiz,'dist/moderno/esm'),{recursive:true});console.log('dist/moderno/index.html + esm/ (camada moderna)');
if(process.argv.includes('--verificar')){if(sha!==man.baseline_sha256){console.error('DIFERENTE da baseline ('+man.baseline_sha256+')');process.exit(1)}console.log('IGUAL à baseline, byte a byte.')}
