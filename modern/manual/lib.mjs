import {chromium,INIT} from '/home/claude/eduspruce/modern/tests/comum.mjs';
export async function abrirApp(vp={width:1440,height:900},extra=''){
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2});const pg=await ctx.newPage();
await pg.route(/^https?:/,r=>r.abort());
await pg.clock.setFixedTime(new Date('2026-11-10T10:20:00'));await pg.addInitScript(INIT);if(extra)await pg.addInitScript(extra);
const erros=[];pg.on('pageerror',e=>erros.push(String(e).slice(0,200)));
await pg.goto('file:///home/claude/man/app/index.html');await pg.waitForTimeout(2500);
const E=s=>pg.evaluate(x=>EduGest.ev(x),s);
await E(`(()=>{criarDemo();const l=document.getElementById('login');l&&l.remove();document.body.classList.remove('login-on');document.documentElement.classList.remove('leve');go('inicio');return 1})()`);
await pg.waitForTimeout(1200);
await pg.addStyleTag({content:'#login,#splash,#tour,#avpop,#parabens{display:none!important}'});
return {b,pg,E,erros}}
