// Testes das classificações (o cálculo mais crítico da app):
//   1) os casos de teste das fórmulas que a própria app traz (Definições › Ferramentas › Verificar os Cálculos) têm de passar todos;
//   2) as classificações dos dados de demonstração (sempre os mesmos: relógio fixo e números «aleatórios» fixos) têm de dar
//      exatamente o que está em notas-referencia.txt. Qualquer alteração ao código que mude uma nota faz falhar este teste.
// uso: node modern/tests/notas.mjs FICHEIRO.html [--atualizar]     (o ./es testa corre-o; --atualizar regista os valores atuais
//      como referência — só depois de confirmar que a mudança nas notas é mesmo a pretendida)
import {INIT} from './comum.mjs';import {navegador} from './servidor.mjs';import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {dirname,join} from 'node:path';import {fileURLToPath} from 'node:url';
const f=process.argv[2];const atualizar=process.argv.includes('--atualizar');if(!f){console.error('uso: node notas.mjs FICHEIRO.html [--atualizar]');process.exit(1)}
const REF=join(dirname(fileURLToPath(import.meta.url)),'notas-referencia.txt');
/* por turma: uma linha por aluno (pela ordem da turma, sem nomes) com as classificações por período (do período e acumulada),
   os totais de cada instrumento, a oralidade e, no ensino profissional, a média de cada módulo */
const EXTRAIR=`(()=>{const out={};const P=periodos();const n=v=>typeof v==='number'?(isFinite(v)?Math.round(v*1e6)/1e6:null):(v==null?null:v);
  (S.anos||[]).forEach(a=>{(a.turmas||[]).forEach(t=>{const L=out[a.nome+' | '+t.nome+' | '+(t.disciplina||'')]=[];
    (t.alunos||[]).forEach(x=>{const r=[];P.forEach(p=>{let u,v;try{u=n(ponderada(t,pctsPer(t,x.id,p)))}catch(e){u='erro'}try{v=n(ponderada(t,pctsFinal(t,x.id,p)))}catch(e){v='erro'}r.push(u,v)});
      (t.instrumentos||[]).forEach(i=>{let v;try{v=n(instTotal(i,x.id))}catch(e){v='erro'}r.push(v)});
      try{const o=t.oral?oralTotal(t,x.id):null;r.push(o?n(o.pts):null)}catch(e){r.push(null)}
      try{if(typeof profMed==='function')(t.modulos||[]).forEach(m=>{let v;try{v=n(profMed(t,x.id,m.id))}catch(e){v='erro'}r.push(v)})}catch(e){}
      L.push(r)})})});return JSON.stringify(out)})()`;
const b=await navegador();const erros=[];let res=null,auto=null;
try{const ctx=await b.newContext({viewport:{width:1280,height:800}});const pg=await ctx.newPage();await pg.clock.setFixedTime(new Date('2026-11-10T10:20:00'));await pg.addInitScript(INIT);
  await pg.goto('file://'+f);await pg.waitForTimeout(1200);const E=s=>pg.evaluate(x=>EduGest.ev(x),s);
  auto=await pg.evaluate(()=>{const r=EduGest.ev('autoTestes()');return {ok:r.ok,err:r.err||[]}});
  if(auto.err.length)erros.push('fórmulas: '+auto.err.join(' · ').slice(0,600));
  await E('(criarDemo(),1)');await pg.waitForTimeout(1500);res=JSON.parse(await E(EXTRAIR))}
catch(e){erros.push(String(e&&e.message||e).slice(0,300))}
await b.close();
if(res){const turmas=Object.keys(res);const total=turmas.reduce((s,k)=>s+res[k].reduce((m,r)=>m+r.length,0),0);const comErro=JSON.stringify(res).split('"erro"').length-1;
  if(comErro)erros.push(comErro+' cálculo(s) deram erro');
  if(atualizar||!existsSync(REF)){if(!erros.length){writeFileSync(REF,JSON.stringify(res,null,0).replace(/\],\[/g,'],\n[').replace(/":\[\[/g,'":[\n[')+'\n');console.log(`classificações: referência ${existsSync(REF)&&!atualizar?'criada':'atualizada'} (${turmas.length} turmas, ${total} valores)`)}}
  else{const ref=JSON.parse(readFileSync(REF,'utf8'));let dif=0;const ex=[];
    for(const k of new Set([...Object.keys(ref),...turmas])){const A=ref[k],B=res[k];if(!A||!B){dif++;ex.push(k+': turma '+(A?'desapareceu':'nova'));continue}
      for(let i=0;i<Math.max(A.length,B.length);i++){const a=JSON.stringify(A[i]),c=JSON.stringify(B[i]);if(a!==c){dif++;if(ex.length<6)ex.push(k+' · aluno '+(i+1)+': esperado '+String(a).slice(0,110)+' → obtido '+String(c).slice(0,110))}}}
    if(dif)erros.push(dif+' aluno(s)/turma(s) com classificações diferentes da referência:\n  '+ex.join('\n  ')+'\n  (se a mudança é a pretendida: node modern/tests/notas.mjs FICHEIRO --atualizar)');
    else console.log(`classificações: ${auto?auto.ok:0} casos das fórmulas certos · ${total} valores de ${turmas.length} turmas iguais à referência`)}}
if(erros.length){console.log('classificações — ERROS: '+erros.length+'\n'+erros.join('\n'));process.exit(1)}
