import {chromium,INIT} from '/home/claude/eduspruce/modern/tests/comum.mjs';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
for(const [n,f,vp] of [['login','index.html',{width:1440,height:900}],['login-tel','index.html',{width:390,height:844}],['al-aluno','aluno.html',{width:390,height:844}],['al-arena','spruceit.html',{width:390,height:844}],['al-pulso','pulso.html',{width:390,height:844}],['al-forms','forms.html',{width:390,height:844}],['al-provas','provas.html',{width:390,height:844}]]){
const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2});const pg=await ctx.newPage();await pg.route(/^https?:/,r=>r.abort());
await pg.clock.setFixedTime(new Date('2026-11-10T10:20:00'));if(n.startsWith('login'))await pg.addInitScript(`localStorage.setItem('edugest.v2',JSON.stringify({cfg:{tourVisto:true,versaoVista:'9.99'},anos:[]}))`);
await pg.goto('file:///home/claude/man/app/'+f);await pg.waitForTimeout(3500);await pg.screenshot({path:'cap4/'+n+'.jpg',type:'jpeg',quality:78});await ctx.close()}
await b.close();
