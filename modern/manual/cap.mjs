import {abrirApp} from './lib.mjs';import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const vp=JSON.parse(process.env.VP||'{"width":1440,"height":900}');
const {b,pg,E,erros}=await abrirApp(vp);
await E(readFileSync('seed.js','utf8'));
await E(`(window.__clk=(t,sc)=>{const r=(sc?document.querySelector(sc):document);const L=[...r.querySelectorAll('button,a,[role=tab],[role=button],.card,li,label,div[data-id]')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().width>0&&getComputedStyle(e).visibility!='hidden');const n=s=>(s||'').trim().replace(/\\s+/g,' ');let e=L.find(e=>n(e.innerText)===t)||L.find(e=>n(e.innerText).startsWith(t))||L.find(e=>n(e.getAttribute('aria-label'))===t||n(e.title)===t);if(!e)throw new Error('não encontrei: '+t);e.scrollIntoView({block:'center'});e.click();return n(e.innerText).slice(0,40)},1)`);
const OUT=process.env.OUT||'cap';mkdirSync(OUT,{recursive:true});
const log=[];const txt={};
export async function shot(id,steps,opt={}){try{for(const s of steps){if(typeof s==='number'){await pg.waitForTimeout(s);continue}
   if(s.startsWith('S:'))await E(`(document.getElementById('view').scrollTo(0,${s.slice(2)}),1)`);else if(s.startsWith('?@')){try{await E(`__clk(${JSON.stringify(s.slice(2))})`)}catch(_){}}else if(s.startsWith('@'))await E(`__clk(${JSON.stringify(s.slice(1))})`);else if(s.startsWith('#key '))await pg.keyboard.press(s.slice(5));else if(s.startsWith('#type '))await pg.keyboard.type(s.slice(6));else if(s.startsWith('#click '))await pg.click(s.slice(7));else await E(s);await pg.waitForTimeout(450)}
  await pg.waitForTimeout(opt.w||500);
  await pg.screenshot({path:`${OUT}/${id}.jpg`,type:'jpeg',quality:78,fullPage:!!opt.full});
  txt[id]=await E(`(()=>{const d=document.querySelector('#drawer.open, #drawer[open], .drawer.open');const m=(d&&d.offsetParent)?d:document.getElementById('main');return (m.innerText||'').slice(0,5000)})()`);
  log.push(id+' ok')}catch(e){log.push(id+' ERR '+String(e).slice(0,160))}
 if(!opt.keep){try{await E(`(typeof closeDrawer=='function'&&closeDrawer(),document.querySelectorAll('dialog[open]').forEach(d=>d.close()),1)`);await pg.keyboard.press('Escape')}catch(_){}}}
export {pg,E,b,erros};
export async function fim(){writeFileSync(OUT+'/log.txt',log.join('\n'));writeFileSync(OUT+'/txt.json',JSON.stringify(txt,null,1));console.log(log.filter(l=>l.includes('ERR')).join('\n')||'tudo ok',log.length);console.log(erros.slice(0,5).join('\n'));await b.close()}
