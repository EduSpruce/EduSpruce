// Casos de teste das notas, feitos À MÃO (a conta está escrita em cada caso e não depende do código da app).
// Diferença para notas.mjs: esse compara com valores que a própria app calculou (apanha mudanças);
// este compara com contas feitas no papel (apanha contas erradas).
// uso: node modern/tests/casos-notas.mjs FICHEIRO.html     (o ./es testa corre-o)
// Acrescentar um caso: g = grupo · n = o que se verifica · conta = a conta à mão · js = expressão corrida dentro da app · esp = resultado certo.
//   decidir:true = a app e a conta à mão não coincidem e é o utilizador que decide qual vale: aparece no resumo, mas não faz falhar.
// Nunca mudar um «esp» para o teste passar: ou a conta à mão estava errada (corrigir a conta e dizer porquê) ou é a app que está errada.
import {INIT} from './comum.mjs';import {navegador} from './servidor.mjs';

// turmas fictícias mínimas (sem nomes de pessoas)
const SEC=`{id:'ts',ciclo:'sec',anoEsc:'10.º',disciplina:'X',dominios:[{id:'d',peso:100}],regra:{},alunos:[],instrumentos:[]}`;
const D8020=`{dominios:[{id:'e',peso:80},{id:'g',peso:20}]}`;
// Atitudes e Valores 20 % repartido por 4 subdomínios de 5 %
const SUB=`{dominios:[{id:'c',peso:80},{id:'s1',peso:5,grupo:'AV'},{id:'s2',peso:5,grupo:'AV'},{id:'s3',peso:5,grupo:'AV'},{id:'s4',peso:5,grupo:'AV'}]}`;
const TESTE=(a,b)=>`{id:'i',periodo:1,itens:[{id:'x',dom:'o',cot:12},{id:'y',dom:'o',cot:8}],notas:{al:{x:${a},y:${b}}}}`;
// UFCD: critério específico E (testes) + critério geral G (ficha com 4 indicadores de 0 a 20)
const UFCD=(pe,pg,teste,ind)=>`(()=>{const t={id:'tu',porModulo:true,oferta:'profissional',dominios:[],instrumentos:[],alunos:[],regra:{},
  modulos:[{id:'m',av:{dominios:[{id:'e',peso:${pe}},{id:'g',peso:${pg},ger:true,ind:['a','b','c','d']}],
  instrumentos:[{id:'i',itens:[{id:'x',dom:'e',cot:20}],notas:{al:{x:${teste}}}}]}}],critGI:{'u:m':{al:{g:${ind}}}}};return notaModAuto(t,'al','m')})()`;
const MOD=n=>`modEstado({notasMod:{al:{m:${n}}}},'al',{id:'m'})`;
// só com arredondamento e regra escolhidos (repõe no fim): regra = 'normal' | 'cima' | 'baixo'
const COMM=(arred,modo,js)=>`(()=>{const a=S.cfg.arred,m=S.cfg.arredModo;S.cfg.arred=${arred};S.cfg.arredModo='${modo}';try{return ${js}}finally{S.cfg.arred=a;S.cfg.arredModo=m}})()`;
const B3C=`{id:'tb',ciclo:'3c',anoEsc:'7.º',disciplina:'X',dominios:[{id:'d',peso:100}],regra:{},alunos:[],instrumentos:[]}`;
// módulo de disciplina sem UFCD (conta de 128): dois domínios, um teste com um item por domínio
const MODT=(pe,pg,a,c1,b,c2)=>`notaModAuto({id:'tm',porModulo:true,dominios:[],instrumentos:[],alunos:[],regra:{},modulos:[{id:'m',av:{dominios:[{id:'e',peso:${pe}},{id:'g',peso:${pg}}],
  instrumentos:[{id:'i',itens:[{id:'x',dom:'e',cot:${c1}},{id:'y',dom:'g',cot:${c2}}],notas:{al:{x:${a},y:${b}}}}]}}]},'al','m')`;
const COM=(arred,js)=>`(()=>{const a=S.cfg.arred,m=S.cfg.arredModo;S.cfg.arred=${arred};S.cfg.arredModo='normal';try{return ${js}}finally{S.cfg.arred=a;S.cfg.arredModo=m}})()`;

export const CASOS=[
 // ── Ponderação dos domínios
 {g:'ponderação',n:'80/20',conta:'0,50×80 + 0,375×20 = 47,5 → 0,475',js:`ponderada(${D8020},{e:.5,g:.375})`,esp:.475},
 {g:'ponderação',n:'domínio sem dados não conta (o peso reparte-se)',conta:'só há 0,60 no domínio de 80 → 0,60',js:`ponderada(${D8020},{e:.6,g:null})`,esp:.6},
 {g:'ponderação',n:'todos os domínios sem dados = vazio (nunca zero)',conta:'sem dados → sem nota',js:`ponderada(${D8020},{e:null,g:null})==null?1:0`,esp:1},
 {g:'ponderação',n:'subdomínios 4×5 % dentro de 20 %',conta:'0,60×80 + (0,8+0,6+1+0,4)×5 = 48+14 = 62 → 0,62',js:`ponderada(${SUB},{c:.6,s1:.8,s2:.6,s3:1,s4:.4})`,esp:.62},
 {g:'ponderação',n:'subdomínio sem dados: os outros três mantêm o peso entre si',conta:'(48 + 4+3+5) / 95 = 60/95 = 0,631579',js:`ponderada(${SUB},{c:.6,s1:.8,s2:.6,s3:1,s4:null})`,esp:60/95},
 // ── Instrumentos (testes, trabalhos)
 {g:'instrumento',n:'total do teste',conta:'9 + 5 = 14 em 20',js:`instTotal(${TESTE(9,5)},'al')`,esp:14},
 {g:'instrumento',n:'percentagem do domínio no teste',conta:'14 / (12+8) = 0,70',js:`instDom(${TESTE(9,5)},'al','o').pct`,esp:.7},
 {g:'instrumento',n:'dois testes no período: média simples das percentagens',conta:'(14/20 + 10/20) / 2 = 0,60',js:`domPer({dominios:[{id:'o',peso:100}],instrumentos:[${TESTE(9,5)},${TESTE(6,4)}]},'al','o',1)`,esp:.6},
 {g:'instrumento',n:'teste de outro período não entra',conta:'só o do 1.º período: 14/20 = 0,70',js:`domPer({dominios:[{id:'o',peso:100}],instrumentos:[${TESTE(9,5)},{...${TESTE(0,0)},periodo:2}]},'al','o',1)`,esp:.7},
 // ── Escala 0–20 (secundário, PROFIJ, profissional)
 {g:'escala 0–20',n:'9,5 arredonda para 10',conta:'0,475×20 = 9,5 → 10',js:COM(1,`nivel(${SEC},.475)`),esp:10},
 {g:'escala 0–20',n:'9,4 fica em 9',conta:'0,47×20 = 9,4 → 9',js:COM(1,`nivel(${SEC},.47)`),esp:9},
 {g:'escala 0–20',n:'9,5 é positiva',conta:'9,5 → 10 ≥ 10',js:COM(1,`negativa(${SEC},.475)?1:0`),esp:0},
 {g:'escala 0–20',n:'9,4 é negativa',conta:'9,4 → 9 < 10',js:COM(1,`negativa(${SEC},.47)?1:0`),esp:1},
 {g:'escala 0–20',n:'19,5 arredonda para 20 e 20 não passa de 20',conta:'0,975×20 = 19,5 → 20',js:COM(1,`nivel(${SEC},.975)`),esp:20},
 {g:'escala 0–20',n:'9,45 com 0 casas decimais fica em 9',conta:'9,45 → 9 (um só arredondamento)',js:COM(0,`nivel(${SEC},.4725)`),esp:9},
 {g:'escala 0–20',n:'9,45 com 1 casa decimal fica em 9 (mostra 9,5, mas a classificação arredonda uma só vez)',conta:'9,45 → 9 (nunca 9,45 → 9,5 → 10)',js:COM(1,`nivel(${SEC},.4725)`),esp:9},
 {g:'escala 0–20',n:'9,45 com 2 casas decimais fica em 9',conta:'9,45 → 9',js:COM(2,`nivel(${SEC},.4725)`),esp:9},
 {g:'escala 0–20',n:'9,45 é negativa',conta:'9,45 → 9 < 10',js:COM(1,`negativa(${SEC},.4725)?1:0`),esp:1},
 {g:'escala 0–20',n:'9,49 com 1 casa decimal fica em 9 (mostra 9,5)',conta:'0,4745×20 = 9,49 → 9',js:COM(1,`nivel(${SEC},.4745)`),esp:9},
 {g:'escala 0–20',n:'9,49 é negativa',conta:'9,49 → 9 < 10',js:COM(1,`negativa(${SEC},.4745)?1:0`),esp:1},
 {g:'escala 0–20',n:'10,45 fica em 10 (não 10,45 → 10,5 → 11)',conta:'0,5225×20 = 10,45 → 10',js:COM(1,`nivel(${SEC},.5225)`),esp:10},
 {g:'escala 0–20',n:'19,49 fica em 19',conta:'0,9745×20 = 19,49 → 19',js:COM(1,`nivel(${SEC},.9745)`),esp:19},
 {g:'escala 0–20',n:'zero verdadeiro é 0',conta:'0×20 = 0 → 0',js:COM(1,`nivel(${SEC},0)`),esp:0},
 {g:'escala 0–20',n:'zero é negativa',conta:'0 < 10',js:COM(1,`negativa(${SEC},0)?1:0`),esp:1},
 {g:'escala 0–20',n:'sem dados = vazio (nunca zero) e não é negativa',conta:'sem nota → vazio',js:COM(1,`nivel(${SEC},null)===''&&!negativa(${SEC},null)?1:0`),esp:1},
 {g:'escala 0–20',n:'nota máxima',conta:'1×20 = 20',js:COM(1,`nivel(${SEC},1)`),esp:20},
 {g:'escala 0–20 · sempre para cima',n:'9,01 sobe para 10',conta:'0,4505×20 = 9,01 → qualquer fração sobe → 10',js:COMM(1,'cima',`nivel(${SEC},.4505)`),esp:10},
 {g:'escala 0–20 · sempre para cima',n:'9,01 é positiva',conta:'9,01 → 10 ≥ 10',js:COMM(1,'cima',`negativa(${SEC},.4505)?1:0`),esp:0},
 {g:'escala 0–20 · sempre para cima',n:'9,45 sobe para 10',conta:'9,45 → 10',js:COMM(1,'cima',`nivel(${SEC},.4725)`),esp:10},
 {g:'escala 0–20 · sempre para cima',n:'9 exatos ficam em 9 (sem fração nada sobe)',conta:'0,45×20 = 9 → 9',js:COMM(1,'cima',`nivel(${SEC},.45)`),esp:9},
 {g:'escala 0–20 · sempre para cima',n:'19,5 sobe para 20',conta:'19,5 → 20',js:COMM(1,'cima',`nivel(${SEC},.975)`),esp:20},
 {g:'escala 0–20 · sempre para cima',n:'20 não passa de 20',conta:'20 → 20',js:COMM(1,'cima',`nivel(${SEC},1)`),esp:20},
 {g:'escala 0–20 · sempre para baixo',n:'9,5 fica em 9',conta:'9,5 → a fração é cortada → 9',js:COMM(1,'baixo',`nivel(${SEC},.475)`),esp:9},
 {g:'escala 0–20 · sempre para baixo',n:'9,99 fica em 9 e é negativa',conta:'0,4995×20 = 9,99 → 9 < 10',js:COMM(1,'baixo',`nivel(${SEC},.4995)===9&&negativa(${SEC},.4995)?1:0`),esp:1},
 {g:'escala 0–20 · sempre para baixo',n:'9,45 e 9,4 ficam em 9',conta:'9,45 → 9 · 9,4 → 9 · soma 18',js:COMM(1,'baixo',`nivel(${SEC},.4725)+nivel(${SEC},.47)`),esp:18},
 {g:'escala 0–20 · sempre para baixo',n:'10 exatos ficam em 10',conta:'0,5×20 = 10 → 10',js:COMM(1,'baixo',`nivel(${SEC},.5)`),esp:10},
 {g:'escala 0–20 · sempre para baixo',n:'19,5 fica em 19',conta:'19,5 → 19',js:COMM(1,'baixo',`nivel(${SEC},.975)`),esp:19},
 {g:'escala 0–20',n:'simulador: 47,25 % dá classificação final 9',conta:'47,25 % → 9,45 → mostra 9,5 → classificação 9',js:COM(1,`+arrSimular(${SEC},47.25).passos[3][1]`),esp:9},
 {g:'escala 0–20',n:'simulador: 47,25 % é negativa',conta:'9 < 10',js:COM(1,`arrSimular(${SEC},47.25).pos?1:0`),esp:0},
 {g:'escala 0–20',n:'simulador: 47,5 % dá classificação final 10',conta:'47,5 % → 9,5 → 10',js:COM(1,`+arrSimular(${SEC},47.5).passos[3][1]`),esp:10},
 // ── 3.º ciclo (0–100 % e níveis 1 a 5): a mesma função, não pode ter mudado
 {g:'níveis 1–5',n:'49,5 % → nível 3',conta:'49,5 → 50 % → nível 3 (50 a 69)',js:COM(1,`nivel(${B3C},.495)`),esp:3},
 {g:'níveis 1–5',n:'49,4 % → nível 2',conta:'49,4 → 49 % → nível 2 (20 a 49)',js:COM(1,`nivel(${B3C},.494)`),esp:2},
 {g:'níveis 1–5',n:'49,4 % é negativa e 49,5 % positiva',conta:'nível 2 < 3 · nível 3',js:COM(1,`negativa(${B3C},.494)&&!negativa(${B3C},.495)?1:0`),esp:1},
 {g:'níveis 1–5',n:'sempre para cima: 49,1 % → nível 3',conta:'49,1 → 50 % → nível 3',js:COMM(1,'cima',`nivel(${B3C},.491)`),esp:3},
 {g:'níveis 1–5',n:'sempre para baixo: 49,9 % → nível 2',conta:'49,9 → 49 % → nível 2',js:COMM(1,'baixo',`nivel(${B3C},.499)`),esp:2},
 {g:'níveis 1–5',n:'0 % → nível 1 e 100 % → nível 5',conta:'0 % → 1 · 100 % → 5 · soma 6',js:COM(1,`nivel(${B3C},0)+nivel(${B3C},1)`),esp:6},
 // ── Ensino profissional: módulo concluído a partir de 9,5
 {g:'módulo concluído',n:'9,5 conclui',conta:'9,5 ≥ 9,5',js:`${MOD(9.5)}==='ok'?1:0`,esp:1},
 {g:'módulo concluído',n:'9,4 não conclui',conta:'9,4 < 9,5',js:`${MOD(9.4)}==='ok'?1:0`,esp:0},
 {g:'módulo concluído',n:'10 conclui',conta:'10 ≥ 9,5',js:`${MOD(10)}==='ok'?1:0`,esp:1},
 {g:'módulo concluído',n:'0 é nota (negativa), não «por avaliar»',conta:'0 < 9,5 → negativa',js:`${MOD(0)}==='neg'?1:0`,esp:1},
 // ── UFCD: critérios específicos (testes) + gerais (ficha de indicadores 0–20)
 {g:'UFCD',n:'80 % específico + 20 % geral → 9',conta:'teste 9/20 = 0,45 · ficha (12+10+14+8)/4 = 11 → 0,55 · 0,45×0,8 + 0,55×0,2 = 0,47 → 9,4 → 9',js:UFCD(80,20,9,'{0:12,1:10,2:14,3:8}'),esp:9},
 {g:'UFCD',n:'9,5 exatos → 10',conta:'teste 9,5/20 · ficha (9+10+9+10)/4 = 9,5 · final 9,5 → 10',js:UFCD(80,20,9.5,'{0:9,1:10,2:9,3:10}'),esp:10},
 {g:'UFCD',n:'9,5 exatos com pesos 70/30 → 10',conta:'teste 8/20 = 0,40 · ficha 13 → 0,65 · 0,28 + 0,195 = 0,475 → 9,5 → 10',js:UFCD(70,30,8,'{0:13,1:13,2:13,3:13}'),esp:10},
 {g:'UFCD',n:'ficha por preencher: conta só o específico',conta:'teste 9/20 → 9 (o geral ainda não tem dados)',js:UFCD(80,20,9,'{}'),esp:9},
 {g:'UFCD',n:'indicador em branco não conta como zero',conta:'ficha (12+14)/2 = 13 → 0,65 · 0,45×0,8 + 0,65×0,2 = 0,49 → 9,8 → 10',js:UFCD(80,20,9,'{0:12,2:14}'),esp:10},
 {g:'UFCD',n:'indicador com 0 conta como zero',conta:'ficha (0+12+12+12)/4 = 9 → 0,45 · final 0,45 → 9',js:UFCD(80,20,9,'{0:0,1:12,2:12,3:12}'),esp:9},
 {g:'UFCD',n:'9,5 exatos com pesos 10/90 e 3 indicadores → 10',conta:'teste 8/20 = 0,40 · ficha (10+10+9)/3 = 9,6667 → 0,48333 · 0,04 + 0,435 = 0,475 → 9,5 → 10 (no computador a conta dá 9,4999999: tem de arredondar como 9,5)',js:UFCD(10,90,8,'{0:10,1:10,2:9}'),esp:10},
 {g:'UFCD',n:'9,5 exatos com pesos que não somam 100 (60/20) → 10',conta:'teste 10/20 = 0,50 · ficha 8 → 0,40 · (0,50×60 + 0,40×20) / 80 = 38/80 = 0,475 → 9,5 → 10',js:UFCD(60,20,10,'{0:8,1:8,2:8,3:8}'),esp:10},
 {g:'UFCD',n:'pesos 60/20, um pouco abaixo → 9',conta:'teste 8/20 = 0,40 · ficha 13 → 0,65 · (24 + 13) / 80 = 0,4625 → 9,25 → 9',js:UFCD(60,20,8,'{0:13,1:13,2:13,3:13}'),esp:9},
 {g:'UFCD',n:'19,5 exatos → 20',conta:'teste 19,5/20 · ficha (19+20+19+20)/4 = 19,5 · final 19,5 → 20',js:UFCD(80,20,19.5,'{0:19,1:20,2:19,3:20}'),esp:20},
 {g:'UFCD',n:'sem teste e sem ficha = vazio (nunca zero)',conta:'sem dados → sem nota',js:`${UFCD(80,20,null,'{}')}==null?1:0`,esp:1},
 {g:'UFCD',n:'zero verdadeiro',conta:'teste 0/20 · ficha 0 → 0',js:UFCD(80,20,0,'{0:0,1:0,2:0,3:0}'),esp:0},
 // ── Módulo de disciplina (sem critérios gerais): nota automática pelos instrumentos do módulo
 {g:'módulo',n:'9,5 exatos com cotações invulgares (45 e 12) → 10',conta:'1,5/45 = 0,03333 · 11/12 = 0,91667 · (0,03333 + 0,91667)/2 = 0,475 → 9,5 → 10 (no computador dá 9,4999999)',js:MODT(50,50,1.5,45,11,12),esp:10},
 {g:'módulo',n:'10,5 exatos com cotações 45 e 12 → 11',conta:'6/45 = 0,13333 · 11/12 = 0,91667 · média 0,525 → 10,5 → 11',js:MODT(50,50,6,45,11,12),esp:11},
 {g:'módulo',n:'9,4 → 9',conta:'9/20 = 0,45 · 11/20 = 0,55 · 0,45×0,8 + 0,55×0,2 = 0,47 → 9,4 → 9',js:MODT(80,20,9,20,11,20),esp:9},
 {g:'módulo',n:'9,5 → 10',conta:'9,5/20 nos dois domínios → 9,5 → 10',js:MODT(80,20,9.5,20,9.5,20),esp:10},
 {g:'módulo',n:'sem notas = vazio (nunca zero)',conta:'sem dados → sem nota',js:`${MODT(80,20,null,20,null,20)}==null?1:0`,esp:1},
 {g:'módulo',n:'zero verdadeiro e nota máxima',conta:'0/20 e 0/20 → 0 · 20/20 e 20/20 → 20 · soma 20',js:`${MODT(80,20,0,20,0,20)}+${MODT(80,20,20,20,20,20)}`,esp:20},
 {g:'UFCD',n:'nota máxima',conta:'teste 20/20 · ficha 20 → 20',js:UFCD(80,20,20,'{0:20,1:20,2:20,3:20}'),esp:20},
];

const f=process.argv[2];
if(f){const b=await navegador();const erros=[],pend=[];let ok=0;
  try{const ctx=await b.newContext({viewport:{width:1280,height:800}});const pg=await ctx.newPage();await pg.clock.setFixedTime(new Date('2026-11-10T10:20:00'));await pg.addInitScript(INIT);
    await pg.goto('file://'+f);await pg.waitForTimeout(1200);
    for(const c of CASOS){let v;try{v=await pg.evaluate(x=>EduGest.ev(x),c.js)}catch(e){v='erro: '+String(e&&e.message||e).slice(0,120)}
      if(typeof v==='number'&&Math.abs(v-c.esp)<1e-6)ok++;
      else (c.decidir?pend:erros).push(`[${c.g}] ${c.n}: obtido ${v}, esperado ${c.esp}  (${c.conta})`)}}
  catch(e){erros.push(String(e&&e.message||e).slice(0,300))}
  await b.close();
  console.log(`contas à mão: ${ok}/${CASOS.length} certas`+(pend.length?`\n  por decidir (${pend.length}):\n  `+pend.join('\n  '):''));
  if(erros.length){console.log('contas à mão — ERROS: '+erros.length+'\n  '+erros.join('\n  '));process.exit(1)}}
