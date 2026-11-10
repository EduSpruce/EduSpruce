// Utilitários comuns dos testes de equivalência (baseline × versão modernizada)
import {createRequire} from 'node:module';import {execSync} from 'node:child_process';import {mkdirSync,writeFileSync,existsSync} from 'node:fs';import {dirname,join} from 'node:path';import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);export const {chromium}=require('playwright');
export const RAIZ=join(dirname(fileURLToPath(import.meta.url)),'..');export const SAIDA=join(RAIZ,'tests/saida');mkdirSync(SAIDA,{recursive:true});
/* a baseline vem do ramo/etiqueta imutável EDUSPRUCE_ORIGINAL_BASELINE — nunca do ficheiro de trabalho */
export function baselinePath(){const p=join(SAIDA,'baseline.html');if(!existsSync(p)){let html;for(const ref of ['EDUSPRUCE_ORIGINAL_BASELINE','origin/EDUSPRUCE_ORIGINAL_BASELINE']){try{html=execSync(`git show ${ref}:index.html`,{cwd:RAIZ,maxBuffer:64*1024*1024});break}catch(_){}}if(!html)throw new Error('Não encontrei a baseline (EDUSPRUCE_ORIGINAL_BASELINE).');writeFileSync(p,html)}return p}
export const modernoPath=()=>join(RAIZ,'dist/moderno/index.html');
/* estado inicial idêntico nas duas versões: sessão de teste, relógio fixo e números aleatórios determinísticos */
export const INIT=`(()=>{let s=20261110;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
  sessionStorage.setItem('edugest.sessao',JSON.stringify({u:'admin',nome:'Ana Silva',papel:'admin',tipo:'local'}));sessionStorage.setItem('ef.ppm','1');sessionStorage.setItem('es.assist','1');localStorage.setItem('edugest.debug','1');
  localStorage.getItem('edugest.v2')||localStorage.setItem('edugest.v2',JSON.stringify({cfg:{tourVisto:true,versaoVista:'9.99',animPerfil:'sem'},anos:[]}));
  document.addEventListener('DOMContentLoaded',()=>{const st=document.createElement('style');st.textContent='#avpop,#parabens,#toast,.toast,#tour,#splash{display:none!important}*{animation:none!important;transition:none!important;caret-color:transparent!important}';document.head.appendChild(st)})})()`;
export async function abrir(browser,ficheiro,vp){const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:1});const pg=await ctx.newPage();await pg.clock.setFixedTime(new Date('2026-11-10T10:20:00'));await pg.addInitScript(INIT);const erros=[];pg.on('pageerror',e=>erros.push(String(e).slice(0,200)));
  await pg.goto('file://'+ficheiro);await pg.waitForTimeout(1200);const E=s=>pg.evaluate(x=>EduGest.ev(x),s);await E('(criarDemo(),1)');await pg.waitForTimeout(1500);await pg.evaluate(()=>document.querySelectorAll('dialog').forEach(d=>d.remove()));return {pg,ctx,E,erros}}
