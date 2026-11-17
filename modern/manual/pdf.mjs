import {chromium} from '/home/claude/eduspruce/modern/tests/comum.mjs';import {execSync} from 'node:child_process';
const V=process.argv[2]||'1.034';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});const pg=await b.newPage();
await pg.goto('file:///home/claude/man/capa.html',{waitUntil:'load'});await pg.waitForTimeout(500);
await pg.pdf({path:'capa.pdf',width:'210mm',height:'297mm',printBackground:true,pageRanges:'1',margin:{top:0,right:0,bottom:0,left:0}});
await pg.goto('file:///home/claude/man/manual.html',{waitUntil:'load'});await pg.waitForTimeout(1500);
await pg.pdf({path:'corpo.pdf',format:'A4',printBackground:true,preferCSSPageSize:true,outline:true,tagged:true,displayHeaderFooter:true,
 headerTemplate:'<div></div>',
 footerTemplate:`<div style="width:100%;font-family:Inter,sans-serif;font-size:7.5pt;color:#6b7280;padding:0 15mm;display:flex;justify-content:space-between"><span>EduSpruce · Manual de Instruções · v${V}</span><span class="pageNumber"></span></div>`});
await b.close();
execSync('qpdf corpo.pdf --pages capa.pdf corpo.pdf -- manual.pdf');
