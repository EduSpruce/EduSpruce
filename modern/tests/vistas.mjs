// Teste rápido: a app (sem base de dados) abre, cria os dados de demonstração e abre todas as vistas sem erros.
// uso: node modern/tests/vistas.mjs FICHEIRO.html   (o ./es testa faz tudo)
import {INIT} from './comum.mjs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;try{pw=require('playwright')}catch(e){pw=require('/opt/npm-tools/node_modules/playwright')}
const f=process.argv[2];const opts={};for(const x of ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'])try{require('fs').accessSync(x);opts.executablePath=x}catch(e){}
const b=await pw.chromium.launch(opts);const ctx=await b.newContext({viewport:{width:1440,height:900}});const pg=await ctx.newPage();
const erros=[];let vista='arranque';pg.on('pageerror',e=>erros.push(vista+': '+String(e.message||e).slice(0,220)));
pg.on('console',m=>{if(m.type()==='error'){const t=m.text();if(!/Failed to load resource|net::ERR|favicon|ERR_FILE_NOT_FOUND/.test(t))erros.push(vista+' (consola): '+t.slice(0,220))}});
await pg.addInitScript(INIT);await pg.goto('file://'+f);await pg.waitForTimeout(1500);
const E=s=>pg.evaluate(x=>EduGest.ev(x),s);
try{await E('(criarDemo(),1)')}catch(e){erros.push('criarDemo: '+String(e.message).slice(0,200))}await pg.waitForTimeout(800);
await pg.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
let vs=[];try{vs=await E('Object.keys(TITLES)')}catch(e){erros.push('TITLES: '+e.message)}
for(const v of vs){vista=v;try{await E(`go(${JSON.stringify(v)})`)}catch(e){erros.push(v+': '+String(e.message).slice(0,200))}await pg.waitForTimeout(120);
  await pg.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const w=document.getElementById('drawer');if(w)w.classList.remove('open')})}
await b.close();const u=[...new Set(erros)];
console.log(`vistas abertas: ${vs.length} · erros: ${u.length}`+(u.length?'\n'+u.slice(0,12).join('\n'):''));process.exit(u.length?1:0)
