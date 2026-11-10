// Testes de regressão visual: as mesmas vistas, nos mesmos estados, nas duas versões; diferença pixel a pixel
import {chromium,abrir,baselinePath,modernoPath,SAIDA} from './comum.mjs';import {PNG} from 'pngjs';import pixelmatch from 'pixelmatch';import {writeFileSync} from 'node:fs';import {join} from 'node:path';
const VISTAS=['inicio','turmas','alunos','meuhorario','calendario','sumarios','testes','avaliacao','instrumentos','reunioes','tarefas','oral','jornal','sprucenote','definicoes','ajuda'];
const TEMAS=['sge','institucional','ios27'];const VP={desktop:{width:1440,height:900},tablet:{width:1024,height:1366},telemovel:{width:390,height:844}};
/* até 4 píxeis de diferença = ruído de antialiasing do navegador (documentado no relatório) */
const RUIDO=4;const CONTROLO=process.argv.includes('--controlo');const b=await chromium.launch();const res=[];
for(const [nv,vp] of Object.entries(VP)){const A=await abrir(b,baselinePath(),vp),B=await abrir(b,CONTROLO?baselinePath():modernoPath(),vp);
  for(const tema of (nv==='desktop'?TEMAS:['sge'])){for(const v of VISTAS){const cmd=`(S.cfg.estilo='${tema}',S.cfg.modSN=true,aplicarPrefs(),go('${v}'),1)`;await A.E(cmd);await B.E(cmd);await A.pg.waitForTimeout(900);await B.pg.waitForTimeout(900);const est='(window.scrollTo(0,0),typeof cabecalho==="function"&&cabecalho(),1)';for(const X of [A,B]){await X.pg.evaluate(()=>document.fonts.ready);await X.E(est);await X.pg.waitForTimeout(250);await X.E(est)}await A.pg.waitForTimeout(400);await B.pg.waitForTimeout(400);
    /* comparação com até 2 novas tentativas: o cabeçalho reorganiza-se de forma assíncrona (o mesmo acontece entre duas aberturas da própria baseline) */
    let dif=-1,tent=0;for(;tent<3;tent++){if(tent){for(const X of [A,B]){await X.E(est);await X.pg.waitForTimeout(700);await X.E(est)}await A.pg.waitForTimeout(500)}
      const pa=PNG.sync.read(await A.pg.screenshot()),pb=PNG.sync.read(await B.pg.screenshot());dif=-1;
      if(pa.width===pb.width&&pa.height===pb.height){const out=new PNG({width:pa.width,height:pa.height});dif=pixelmatch(pa.data,pb.data,out.data,pa.width,pa.height,{threshold:0.05});if(dif>RUIDO&&tent===2)writeFileSync(join(SAIDA,`dif-${nv}-${tema}-${v}.png`),PNG.sync.write(out))}
      if(dif>=0&&dif<=RUIDO)break}
    const igual=dif>=0&&dif<=RUIDO;res.push({ecra:nv,tema,vista:v,pixeis_diferentes:dif,tentativas:tent+1,igual});process.stdout.write(igual?'.':'x')}}
  res.push({ecra:nv,erros_baseline:A.erros.length,erros_moderna:B.erros.length});await A.ctx.close();await B.ctx.close()}
await b.close();writeFileSync(join(SAIDA,'visual.json'),JSON.stringify(res,null,1));const t=res.filter(r=>r.vista);const ok=t.filter(r=>r.igual).length;const exatas=t.filter(r=>r.pixeis_diferentes===0).length;
console.log(`\nVisual: ${ok}/${t.length} capturas iguais (${exatas} idênticas pixel a pixel; as restantes com ≤ ${RUIDO} píxeis de antialiasing).`);if(ok!==t.length)process.exit(1)
