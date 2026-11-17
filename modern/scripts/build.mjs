// EduSpruce · construção local (testes): junta as peças de src/app em dist/index.html (versão sem base de dados)
// e faz dist/moderno/index.html (versão com base de dados, as mesmas alterações que o db.mjs aplica na publicação).
// A publicação a sério é o ./es pub (na raiz do repositório).
import {execFileSync} from 'node:child_process';import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {dirname,join} from 'node:path';import {fileURLToPath} from 'node:url';
const raiz=join(dirname(fileURLToPath(import.meta.url)),'..');mkdirSync(join(raiz,'dist/moderno'),{recursive:true});
execFileSync('python3',[join(raiz,'scripts/partir.py'),'juntar',join(raiz,'src/app'),join(raiz,'dist/index.html')]);
const {aplicarDB,copiarRecursos}=await import('./db.mjs');
writeFileSync(join(raiz,'dist/moderno/index.html'),aplicarDB(readFileSync(join(raiz,'dist/index.html'),'utf8')));copiarRecursos(join(raiz,'dist/moderno'));
console.log('dist/index.html e dist/moderno/index.html');
