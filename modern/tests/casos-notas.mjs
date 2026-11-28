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
// nota de módulo gravada à mão na grelha (sem avaliação automática): lê-se sempre inteira
const NM=v=>`notaMod({notasMod:{al:{m:${v}}}},'al','m')`;
// «Calcular a partir dos instrumentos» do módulo: lista de [nota, cotação]
const NMI=L=>`notaModDeInstrumentos({instrumentos:[${L.map(([n,c],k)=>`{id:'i${k}',modulo:'m',itens:[{id:'x',dom:'o',cot:${c}}],notas:{al:{x:${n}}}}`).join(',')}]},'al','m')`;
// atitudes do ensino profissional: a área vale a média arredondada dos indicadores (0 a 20)
const ATT=o=>`instDom({id:'i',profAtt:true,itens:[{id:'a',dom:'at'},{id:'b',dom:'at'},{id:'c',dom:'at'}],notas:{al:${o}}},'al','at')`;
// UFCD com «Atribuída» escrita pelo professor na Avaliação Final da unidade
const UFCDA=at=>`notaModAuto({id:'tu',porModulo:true,oferta:'profissional',dominios:[],instrumentos:[],alunos:[],regra:{},modulos:[{id:'m',av:{dominios:[{id:'e',peso:100}],instrumentos:[]}}],atrib:{'u:m':{al:${at}}}},'al','m')`;

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
 // Decisão do utilizador (2026-11-28): «9,4 dá 9 e 9,5 dá 10, em toda a app. A nota no fim é sempre inteira.» A opção «sempre para cima / sempre para baixo»
 // saiu das Definições. Estes casos substituem os dos grupos «sempre para cima» e «sempre para baixo»: com a opção antiga ainda gravada em S.cfg.arredModo,
 // o resultado tem de ser o do arredondamento normal (os «esp» mudaram porque a regra mudou, não para o teste passar).
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 9,01 fica em 9 (antes subia para 10)',conta:'0,4505×20 = 9,01 → fração 0,01 < 0,5 → 9',js:COMM(1,'cima',`nivel(${SEC},.4505)`),esp:9},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 9,01 é negativa (antes era positiva)',conta:'9,01 → 9 < 10 → negativa',js:COMM(1,'cima',`negativa(${SEC},.4505)?1:0`),esp:1},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 9,4 fica em 9',conta:'0,47×20 = 9,4 → 9',js:COMM(1,'cima',`nivel(${SEC},.47)`),esp:9},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 9,45 fica em 9 (antes subia para 10)',conta:'0,4725×20 = 9,45 → 9',js:COMM(1,'cima',`nivel(${SEC},.4725)`),esp:9},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 9,5 dá 10',conta:'0,475×20 = 9,5 → 10',js:COMM(1,'cima',`nivel(${SEC},.475)`),esp:10},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 9,99 dá 10',conta:'0,4995×20 = 9,99 → 10',js:COMM(1,'cima',`nivel(${SEC},.4995)`),esp:10},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 9 exatos ficam em 9',conta:'0,45×20 = 9 → 9',js:COMM(1,'cima',`nivel(${SEC},.45)`),esp:9},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 19,5 dá 20 e 20 não passa de 20',conta:'19,5 → 20 · 20 → 20 · soma 40',js:COMM(1,'cima',`nivel(${SEC},.975)+nivel(${SEC},1)`),esp:40},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 9,01 fica em 9',conta:'9,01 → 9',js:COMM(1,'baixo',`nivel(${SEC},.4505)`),esp:9},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 9,4 e 9,45 ficam em 9',conta:'9,4 → 9 · 9,45 → 9 · soma 18',js:COMM(1,'baixo',`nivel(${SEC},.47)+nivel(${SEC},.4725)`),esp:18},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 9,5 dá 10 (antes ficava em 9)',conta:'0,475×20 = 9,5 → 10',js:COMM(1,'baixo',`nivel(${SEC},.475)`),esp:10},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 9,5 é positiva',conta:'9,5 → 10 ≥ 10 → positiva',js:COMM(1,'baixo',`negativa(${SEC},.475)?1:0`),esp:0},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 9,99 dá 10 e é positiva (antes ficava em 9, negativa)',conta:'0,4995×20 = 9,99 → 10 ≥ 10',js:COMM(1,'baixo',`nivel(${SEC},.4995)===10&&!negativa(${SEC},.4995)?1:0`),esp:1},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 10 exatos ficam em 10',conta:'0,5×20 = 10 → 10',js:COMM(1,'baixo',`nivel(${SEC},.5)`),esp:10},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 19,5 dá 20 (antes ficava em 19)',conta:'19,5 → 20',js:COMM(1,'baixo',`nivel(${SEC},.975)`),esp:20},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'simulador com «cima» gravado: 47,25 % dá 9, negativa',conta:'47,25 % → 9,45 → 9 < 10',js:COMM(1,'cima',`(r=>+r.passos[3][1]===9&&!r.pos?1:0)(arrSimular(${SEC},47.25))`),esp:1},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'simulador com «baixo» gravado: 47,5 % dá 10, positiva',conta:'47,5 % → 9,5 → 10 ≥ 10',js:COMM(1,'baixo',`(r=>+r.passos[3][1]===10&&r.pos?1:0)(arrSimular(${SEC},47.5))`),esp:1},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'módulo (UFCD) com «cima» gravado: 9,4 fica em 9',conta:'teste 9/20 = 0,45 · ficha 11 → 0,55 · 0,36 + 0,11 = 0,47 → 9,4 → 9',js:COMM(1,'cima',UFCD(80,20,9,'{0:12,1:10,2:14,3:8}')),esp:9},
 {g:'escala 0–20 · regra única (opção antiga gravada não conta)',n:'módulo (UFCD) com «baixo» gravado: 9,5 dá 10',conta:'teste 9,5/20 · ficha 9,5 · final 9,5 → 10',js:COMM(1,'baixo',UFCD(80,20,9.5,'{0:9,1:10,2:9,3:10}')),esp:10},
 {g:'escala 0–20',n:'simulador: 47,25 % dá classificação final 9',conta:'47,25 % → 9,45 → mostra 9,5 → classificação 9',js:COM(1,`+arrSimular(${SEC},47.25).passos[3][1]`),esp:9},
 {g:'escala 0–20',n:'simulador: 47,25 % é negativa',conta:'9 < 10',js:COM(1,`arrSimular(${SEC},47.25).pos?1:0`),esp:0},
 {g:'escala 0–20',n:'simulador: 47,5 % dá classificação final 10',conta:'47,5 % → 9,5 → 10',js:COM(1,`+arrSimular(${SEC},47.5).passos[3][1]`),esp:10},
 // ── 3.º ciclo (0–100 % e níveis 1 a 5): a mesma função, não pode ter mudado
 {g:'níveis 1–5',n:'49,5 % → nível 3',conta:'49,5 → 50 % → nível 3 (50 a 69)',js:COM(1,`nivel(${B3C},.495)`),esp:3},
 {g:'níveis 1–5',n:'49,4 % → nível 2',conta:'49,4 → 49 % → nível 2 (20 a 49)',js:COM(1,`nivel(${B3C},.494)`),esp:2},
 {g:'níveis 1–5',n:'49,4 % é negativa e 49,5 % positiva',conta:'nível 2 < 3 · nível 3',js:COM(1,`negativa(${B3C},.494)&&!negativa(${B3C},.495)?1:0`),esp:1},
 {g:'níveis 1–5 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 49,1 % → nível 2 (antes subia para 50 % → nível 3)',conta:'49,1 → 49 % → nível 2 (20 a 49)',js:COMM(1,'cima',`nivel(${B3C},.491)`),esp:2},
 {g:'níveis 1–5 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 49,4 % → nível 2',conta:'49,4 → 49 % → nível 2',js:COMM(1,'cima',`nivel(${B3C},.494)`),esp:2},
 {g:'níveis 1–5 · regra única (opção antiga gravada não conta)',n:'gravado «cima»: 49,5 % → nível 3',conta:'49,5 → 50 % → nível 3 (50 a 69)',js:COMM(1,'cima',`nivel(${B3C},.495)`),esp:3},
 {g:'níveis 1–5 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 49,4 % → nível 2',conta:'49,4 → 49 % → nível 2',js:COMM(1,'baixo',`nivel(${B3C},.494)`),esp:2},
 {g:'níveis 1–5 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 49,5 % → nível 3 (antes ficava em 49 % → nível 2)',conta:'49,5 → 50 % → nível 3',js:COMM(1,'baixo',`nivel(${B3C},.495)`),esp:3},
 {g:'níveis 1–5 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 49,9 % → nível 3 (antes ficava em 49 % → nível 2)',conta:'49,9 → 50 % → nível 3',js:COMM(1,'baixo',`nivel(${B3C},.499)`),esp:3},
 {g:'níveis 1–5 · regra única (opção antiga gravada não conta)',n:'gravado «baixo»: 49,5 % é positiva e 49,4 % negativa',conta:'nível 3 ≥ 3 · nível 2 < 3',js:COMM(1,'baixo',`!negativa(${B3C},.495)&&negativa(${B3C},.494)?1:0`),esp:1},
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
 // ── Nota do módulo gravada: sempre inteira (um valor antigo com décimas fica gravado como está e lê-se arredondado)
 {g:'nota do módulo gravada',n:'9,5 gravado lê-se 10',conta:'9,5 → 10',js:NM(9.5),esp:10},
 {g:'nota do módulo gravada',n:'9,46 gravado lê-se 9',conta:'9,46 → fração 0,46 < 0,5 → 9',js:NM(9.46),esp:9},
 {g:'nota do módulo gravada',n:'9,4 gravado lê-se 9',conta:'9,4 → 9',js:NM(9.4),esp:9},
 {g:'nota do módulo gravada',n:'9,49 gravado lê-se 9 (um centésimo abaixo do limiar)',conta:'9,49 → 9',js:NM(9.49),esp:9},
 {g:'nota do módulo gravada',n:'12,5 gravado lê-se 13',conta:'12,5 → 13',js:NM(12.5),esp:13},
 {g:'nota do módulo gravada',n:'13,4 gravado lê-se 13',conta:'13,4 → 13',js:NM(13.4),esp:13},
 {g:'nota do módulo gravada',n:'vazio (null) = vazio, nunca zero',conta:'sem nota → vazio',js:`${NM(null)}==null?1:0`,esp:1},
 {g:'nota do módulo gravada',n:'vazio (texto vazio) = vazio, nunca zero',conta:'sem nota → vazio',js:`${NM("''")}==null?1:0`,esp:1},
 {g:'nota do módulo gravada',n:'sem registo do aluno = vazio',conta:'sem nota → vazio',js:`notaMod({notasMod:{}},'al','m')==null?1:0`,esp:1},
 {g:'nota do módulo gravada',n:'0 gravado é 0 (zero verdadeiro, não vazio)',conta:'0 → 0',js:`(v=>v===0?0:-1)(${NM(0)})`,esp:0},
 {g:'nota do módulo gravada',n:'nota máxima: 20 → 20 e 19,5 → 20',conta:'20 → 20 · 19,5 → 20 · soma 40',js:`${NM(20)}+${NM(19.5)}`,esp:40},
 {g:'nota do módulo gravada',n:'gravado como texto «9.5» lê-se 10',conta:'9,5 → 10',js:NM("'9.5'"),esp:10},
 {g:'nota do módulo gravada',n:'ler não altera o valor gravado',conta:'gravado 9,46 continua 9,46 depois de lido (lido: 9)',js:`(()=>{const t={notasMod:{al:{m:9.46}}};const n=notaMod(t,'al','m');return n===9?t.notasMod.al.m:-1})()`,esp:9.46},
 {g:'nota do módulo gravada',n:'notaModGravada devolve o valor exato (para o aviso)',conta:'gravado 9,46 → 9,46',js:`notaModGravada({notasMod:{al:{m:9.46}}},'al','m')`,esp:9.46},
 {g:'módulo concluído',n:'9,46 gravado não conclui',conta:'9,46 → 9 · 9 < 9,5 (e 9,46 < 9,5: as duas leituras dão o mesmo)',js:`${MOD(9.46)}==='neg'?1:0`,esp:1},
 {g:'módulo concluído',n:'9,49 gravado não conclui',conta:'9,49 → 9 < 9,5',js:`${MOD(9.49)}==='ok'?1:0`,esp:0},
 {g:'módulo concluído',n:'9,5 gravado conclui e conta como 10',conta:'9,5 ≥ 9,5 → concluído · lê-se 10',js:`${MOD(9.5)}==='ok'&&${NM(9.5)}===10?1:0`,esp:1},
 {g:'módulo concluído',n:'resumo do aluno: 9,5 e 9,46 gravados → 1 concluído em 2, média 10',conta:'9,5 → 10 (concluído, 25 h) · 9,46 → 9 (não) · média só dos concluídos = 10',js:`(r=>r.ok===1&&r.atr===1&&r.h===25?r.media:-1)(resumoModAluno({modulos:[{id:'a',horas:25},{id:'b',horas:25}],notasMod:{al:{a:9.5,b:9.46}}},'al'))`,esp:10},
 {g:'módulo concluído',n:'resumo do aluno: média com notas gravadas com décimas usa os inteiros',conta:'13,4 → 13 (50 h) · 14,5 → 15 (25 h) · (13×50 + 15×25)/75 = 1025/75 = 13,6667',js:`resumoModAluno({modulos:[{id:'a',horas:50},{id:'b',horas:25}],notasMod:{al:{a:13.4,b:14.5}}},'al').media`,esp:1025/75},
 // ── «Calcular a partir dos instrumentos» do módulo: inteiro
 {g:'módulo pelos instrumentos',n:'9,5 exatos → 10',conta:'9,5/20 → 9,5 → 10',js:NMI([[9.5,20]]),esp:10},
 {g:'módulo pelos instrumentos',n:'dois testes, média 9,5 exata → 10',conta:'9/20 e 10/20 → (9 + 10)/2 = 9,5 → 10',js:NMI([[9,20],[10,20]]),esp:10},
 {g:'módulo pelos instrumentos',n:'9,5 exatos com cotações 45 e 12 → 10',conta:'1,5/45×20 = 0,6667 · 11/12×20 = 18,3333 · média 9,5 → 10 (no computador pode dar 9,4999999)',js:NMI([[1.5,45],[11,12]]),esp:10},
 {g:'módulo pelos instrumentos',n:'12,5 exatos → 13',conta:'25/40×20 = 12,5 → 13',js:NMI([[25,40]]),esp:13},
 {g:'módulo pelos instrumentos',n:'9,4 → 9',conta:'47/100×20 = 9,4 → 9',js:NMI([[47,100]]),esp:9},
 {g:'módulo pelos instrumentos',n:'9,45 → 9 (um só arredondamento, nunca 9,45 → 9,5 → 10)',conta:'9,4/20 e 9,5/20 → média 9,45 → 9',js:NMI([[9.4,20],[9.5,20]]),esp:9},
 {g:'módulo pelos instrumentos',n:'teste sem nota não entra na média',conta:'só 14/20 → 14',js:NMI([[14,20],[null,20]]),esp:14},
 {g:'módulo pelos instrumentos',n:'sem notas = vazio (nunca zero)',conta:'sem dados → sem nota',js:`${NMI([[null,20]])}==null?1:0`,esp:1},
 {g:'módulo pelos instrumentos',n:'zero verdadeiro e nota máxima',conta:'0/20 → 0 · 20/20 → 20 · soma 20',js:`(a=>a===0?a:-99)(${NMI([[0,20]])})+${NMI([[20,20]])}`,esp:20},
 // ── UFCD: «Atribuída» lê-se inteira
 {g:'UFCD',n:'atribuída 9,5 lê-se 10',conta:'9,5 → 10',js:UFCDA("'9,5'"),esp:10},
 {g:'UFCD',n:'atribuída 9,4 lê-se 9',conta:'9,4 → 9',js:UFCDA("'9,4'"),esp:9},
 {g:'UFCD',n:'atribuída 12.5 lê-se 13 e atribuída 14 fica 14',conta:'12,5 → 13 · 14 → 14 · soma 27',js:`${UFCDA("'12.5'")}+${UFCDA("'14'")}`,esp:27},
 {g:'UFCD',n:'atribuída vazia e sem dados = vazio',conta:'sem nota → vazio',js:`${UFCDA("''")}==null?1:0`,esp:1},
 // ── Atitudes do profissional (profAtt): a área é a média arredondada dos indicadores
 {g:'atitudes (profissional)',n:'média 9,5 exata → 10 pontos em 20',conta:'(9 + 10)/2 = 9,5 → 10 → 10/20 = 0,50',js:`(r=>r.pts===10&&r.max===20?r.pct:-1)(${ATT('{a:9,b:10}')})`,esp:.5},
 {g:'atitudes (profissional)',n:'média 9,5 com três indicadores → 10',conta:'(9,7 + 9,2 + 9,6)/3 = 28,5/3 = 9,5 → 10',js:`${ATT('{a:9.7,b:9.2,c:9.6}')}.pts`,esp:10},
 {g:'atitudes (profissional)',n:'média 13,5 com três indicadores → 14',conta:'(13,1 + 13,7 + 13,7)/3 = 40,5/3 = 13,5 → 14',js:`${ATT('{a:13.1,b:13.7,c:13.7}')}.pts`,esp:14},
 {g:'atitudes (profissional)',n:'média 9,33 → 9',conta:'(9 + 9 + 10)/3 = 9,33 → 9 → 0,45',js:`${ATT('{a:9,b:9,c:10}')}.pct`,esp:.45},
 {g:'atitudes (profissional)',n:'indicador em branco não conta como zero',conta:'(12 + 15)/2 = 13,5 → 14',js:`${ATT("{a:12,b:'',c:15}")}.pts`,esp:14},
 {g:'atitudes (profissional)',n:'indicador com 0 conta como zero',conta:'(0 + 14 + 15)/3 = 9,67 → 10',js:`${ATT('{a:0,b:14,c:15}')}.pts`,esp:10},
 {g:'atitudes (profissional)',n:'sem indicadores preenchidos = vazio (nunca zero)',conta:'sem dados → sem nota',js:`${ATT("{a:'',b:''}")}==null&&${ATT('undefined')}==null?1:0`,esp:1},
 {g:'atitudes (profissional)',n:'zero verdadeiro e nota máxima',conta:'(0+0+0)/3 = 0 · (20+20+20)/3 = 20 · soma 20',js:`(a=>a===0?a:-99)(${ATT('{a:0,b:0,c:0}')}.pts)+${ATT('{a:20,b:20,c:20}')}.pts`,esp:20},
 // ── Percentagem mostrada
 {g:'percentagem',n:'28,5 % mostra-se 29 % (no computador 0,285×100 = 28,4999999)',conta:'0,285×100 = 28,5 → 29 %',js:`pct(.285)==='29%'?1:0`,esp:1},
 {g:'percentagem',n:'57,5 % → 58 % · 49,4 % → 49 % · 49,5 % → 50 %',conta:'57,5 → 58 · 49,4 → 49 · 49,5 → 50',js:`pct(.575)==='58%'&&pct(.494)==='49%'&&pct(.495)==='50%'?1:0`,esp:1},
 {g:'percentagem',n:'sem dados = vazio e zero = 0 %',conta:'sem dados → vazio · 0 → 0 %',js:`pct(null)===''&&pct(0)==='0%'&&pct(1)==='100%'?1:0`,esp:1},
 // ── Nota em dúvida: aviso quando a nota mostrada arredondaria para um inteiro diferente do da nota exata
 {g:'nota em dúvida',n:'9,45 com 1 casa decimal → avisa',conta:'exata 9,45 → mostra 9,5 (que daria 10) · classificação 9 → diferentes → avisa',js:COM(1,`notaDuvida(${SEC},.4725)?1:0`),esp:1},
 {g:'nota em dúvida',n:'9,45 com 1 casa: o aviso diz «mostra 9,5, fica 9»',conta:'mostra 9,5 · fica 9',js:COM(1,`(o=>o&&o.mostra==='9,5'&&o.exata==='9,45'?o.fica:-1)(notaDuvidaInfo(${SEC},.4725))`),esp:9},
 {g:'nota em dúvida',n:'9,5 → não avisa',conta:'exata 9,5 → mostra 9,5 → 10 · classificação 10 → iguais',js:COM(1,`notaDuvida(${SEC},.475)?1:0`),esp:0},
 {g:'nota em dúvida',n:'9,44 → não avisa',conta:'exata 9,44 → mostra 9,4 → 9 · classificação 9 → iguais',js:COM(1,`notaDuvida(${SEC},.472)?1:0`),esp:0},
 {g:'nota em dúvida',n:'9,45 com 0 casas → não avisa',conta:'mostra-se 9, que é a classificação',js:COM(0,`notaDuvida(${SEC},.4725)?1:0`),esp:0},
 {g:'nota em dúvida',n:'9,45 com 2 casas → não avisa',conta:'mostra 9,45 → 9 · classificação 9 → iguais',js:COM(2,`notaDuvida(${SEC},.4725)?1:0`),esp:0},
 {g:'nota em dúvida',n:'9,495 com 2 casas → avisa',conta:'exata 9,495 → mostra 9,50 (que daria 10) · classificação 9 → avisa',js:COM(2,`notaDuvida(${SEC},.47475)?1:0`),esp:1},
 {g:'nota em dúvida',n:'9,495 com 1 casa → avisa',conta:'exata 9,495 → mostra 9,5 · classificação 9 → avisa',js:COM(1,`notaDuvida(${SEC},.47475)?1:0`),esp:1},
 {g:'nota em dúvida',n:'9,49 com 1 casa → avisa',conta:'exata 9,49 → mostra 9,5 · classificação 9 → avisa',js:COM(1,`notaDuvida(${SEC},.4745)?1:0`),esp:1},
 {g:'nota em dúvida',n:'10,45 com 1 casa → avisa (mostra 10,5, fica 10)',conta:'exata 10,45 → mostra 10,5 (que daria 11) · classificação 10',js:COM(1,`(o=>o?o.fica:-1)(notaDuvidaInfo(${SEC},.5225))`),esp:10},
 {g:'nota em dúvida',n:'9,55 e 19,95 com 1 casa → não avisam',conta:'9,55 → mostra 9,6 → 10 = 10 · 19,95 → mostra 20,0 → 20 = 20',js:COM(1,`notaDuvida(${SEC},.4775)||notaDuvida(${SEC},.9975)?1:0`),esp:0},
 {g:'nota em dúvida',n:'básico (níveis 1–5) → não avisa',conta:'no básico não há casas decimais da nota: sem dúvida',js:COM(1,`notaDuvida(${B3C},.4725)||notaDuvida(${B3C},.4945)?1:0`),esp:0},
 {g:'nota em dúvida',n:'sem dados → não avisa',conta:'sem nota → sem aviso',js:COM(1,`notaDuvida(${SEC},null)||notaDuvida(${SEC},undefined)||notaDuvidaHtml(${SEC},null)!==''?1:0`),esp:0},
 {g:'nota em dúvida',n:'zero e nota máxima → não avisam',conta:'0 → 0,0 → 0 · 20 → 20,0 → 20',js:COM(1,`notaDuvida(${SEC},0)||notaDuvida(${SEC},1)?1:0`),esp:0},
 {g:'nota em dúvida',n:'módulo gravado com décimas (9,46) → avisa; inteiro, zero ou vazio → não',conta:'9,46 tem décimas → aviso · 10, 0 e vazio → sem aviso',js:`notaDuvidaGravada(9.46)!==''&&notaDuvidaGravada(10)===''&&notaDuvidaGravada(0)===''&&notaDuvidaGravada(null)===''&&notaDuvidaGravada('')===''?1:0`,esp:1},
 // ── Painéis: positiva/negativa em turmas 0–20 pela classificação (antes 9,5 a 9,89 contavam como negativa)
 {g:'painéis 0–20',n:'9,5 · 9,7 · 9,89 são positivas',conta:'9,5 → 10 · 9,7 → 10 · 9,89 → 10 · todas ≥ 10 → 0 negativas',js:COM(1,`[.475,.485,.4945].filter(f=>negativa(${SEC},f)).length`),esp:0},
 {g:'painéis 0–20',n:'9,5 · 9,7 · 9,89 são positivas com 0 e com 2 casas decimais',conta:'a classificação não depende das casas decimais → 0 negativas',js:`${COM(0,`[.475,.485,.4945].filter(f=>negativa(${SEC},f)).length`)}+${COM(2,`[.475,.485,.4945].filter(f=>negativa(${SEC},f)).length`)}`,esp:0},
 {g:'painéis 0–20',n:'9,4 · 9,45 · 9,49 são negativas',conta:'todas → 9 < 10 → 3 negativas',js:COM(1,`[.47,.4725,.4745].filter(f=>negativa(${SEC},f)).length`),esp:3},
 {g:'painéis 0–20',n:'cor do painel: 9,5 · 9,7 · 9,89 não são vermelhas',conta:'positivas → nenhuma a vermelho',js:COM(1,`[.475,.485,.4945].filter(f=>dashCor(f,${SEC})==='#dc2626').length`),esp:0},
 {g:'painéis 0–20',n:'cor do painel: 9,4 e 9,49 são vermelhas; sem dados não',conta:'negativas → 2 a vermelho · sem dados → cinzento',js:COM(1,`[.47,.4745,null].filter(f=>dashCor(f,${SEC})==='#dc2626').length`),esp:2},
 {g:'painéis 0–20',n:'cor do painel no básico: 49,4 % vermelha, 49,5 % não',conta:'49,4 → nível 2 (negativa) · 49,5 → nível 3',js:COM(1,`(dashCor(.494,${B3C})==='#dc2626'?1:0)+(dashCor(.495,${B3C})==='#dc2626'?10:0)`),esp:1},
 {g:'painéis 0–20',n:'síntese: 9,5 · 9,7 · 9,89 são «satisfatório» (1) e 9,4 é «dificuldades» (0)',conta:'1 + 1 + 1 + 0 = 3',js:COM(1,`nivTxt(.475,${SEC})+nivTxt(.485,${SEC})+nivTxt(.4945,${SEC})+nivTxt(.47,${SEC})`),esp:3},
 {g:'painéis 0–20',n:'síntese no básico: 49,5 % é «satisfatório» (1) e 49,4 % «dificuldades» (0)',conta:'1 + 0 = 1',js:COM(1,`nivTxt(.495,${B3C})+nivTxt(.494,${B3C})`),esp:1},
 // ── Pauta oficial PROFIJ (232): a média da componente vem das notas dos módulos (cpNotaDisc → notaMod)
 {g:'pauta PROFIJ',n:'disciplina com UFCD de notas inteiras: média igual à de sempre',conta:'(13 + 14)/2 = 13,5',js:`(()=>{const x={id:'al',nome:'Formando Um',num:1,frequenta:true};const t={id:'tp',oferta:'profij',alunos:[x],instrumentos:[],dominios:[],modulos:[{id:'a'},{id:'b'}],notasMod:{al:{a:13,b:14}}};return cpNotaDisc(t,null,{k:cpAlKey(x)})})()`,esp:13.5},
 {g:'pauta PROFIJ',n:'disciplina com UFCD gravadas com décimas (13,4 e 14,4): a pauta fica como estava',conta:'a pauta PROFIJ usa as notas tal como estão gravadas (fórmula oficial às décimas): (13,4 + 14,4)/2 = 13,9',js:`(()=>{const x={id:'al',nome:'Formando Um',num:1,frequenta:true};const t={id:'tp',oferta:'profij',alunos:[x],instrumentos:[],dominios:[],modulos:[{id:'a'},{id:'b'}],notasMod:{al:{a:13.4,b:14.4}}};return cpNotaDisc(t,null,{k:cpAlKey(x)})})()`,esp:13.9},
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
