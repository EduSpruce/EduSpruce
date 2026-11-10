// Testes pedagógicos: os mesmos cálculos sobre os mesmos dados fictícios têm de dar exatamente o mesmo resultado
import {chromium,abrir,baselinePath,modernoPath,SAIDA} from './comum.mjs';import {writeFileSync} from 'node:fs';import {join} from 'node:path';
const EXTRAIR=`(()=>{const out={};const P=periodos();(S.anos||[]).forEach(a=>{(a.turmas||[]).forEach(t=>{const o=out[a.nome+'|'+t.nome+'|'+t.disciplina]={};
  (t.alunos||[]).forEach(x=>{const r=o[x.nome]={};P.forEach(p=>{try{r['p'+p]=ponderada(t,pctsPer(t,x.id,p))}catch(e){r['p'+p]='erro'}try{r['f'+p]=ponderada(t,pctsFinal(t,x.id,p))}catch(e){r['f'+p]='erro'}});
    (t.instrumentos||[]).forEach(i=>{try{r['i:'+i.nome]=instTotal(i,x.id)}catch(e){}});try{const oo=t.oral?oralTotal(t,x.id):null;if(oo)r.oral=oo.pts}catch(e){}})})});return JSON.stringify(out)})()`;
const b=await chromium.launch();const vp={width:1280,height:800};const A=await abrir(b,baselinePath(),vp),B=await abrir(b,modernoPath(),vp);
const [ra,rb]=[JSON.parse(await A.E(EXTRAIR)),JSON.parse(await B.E(EXTRAIR))];await b.close();
let n=0,d=0;const difs=[];for(const k of Object.keys(ra)){for(const al of Object.keys(ra[k])){for(const c of Object.keys(ra[k][al])){n++;const x=ra[k][al][c],y=rb[k]&&rb[k][al]&&rb[k][al][c];if(JSON.stringify(x)!==JSON.stringify(y)){d++;difs.push({turma:k,campo:c,baseline:x,moderna:y})}}}}
writeFileSync(join(SAIDA,'calculos.json'),JSON.stringify({valores:n,diferencas:d,difs},null,1));console.log(`Cálculos: ${n-d}/${n} valores iguais (classificações por período, finais, instrumentos e oralidade).`);if(d)process.exit(1)
