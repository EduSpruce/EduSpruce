(function(){
'use strict';
/* =====================================================================
   CATÁLOGO DE DISCIPLINAS — ENSINO REGULAR
   c: ciclos em que existe (1c, 2c, 3c, sec)   t: modelo de domínios
   ===================================================================== */
const DISCIPLINAS=[
 // Comuns / transversais
 {n:'Português',c:['1c','2c','3c','sec'],t:'port'},
 {n:'Português Língua Não Materna (PLNM)',c:['1c','2c','3c','sec'],t:'port'},
 {n:'Matemática',c:['1c','2c','3c'],t:'gen'},
 {n:'Inglês',c:['1c','2c','3c','sec'],t:'le'},
 {n:'Educação Física',c:['1c','2c','3c','sec','profij'],t:'ef'},
 {n:'Cidadania e Desenvolvimento',c:['1c','2c','3c','sec'],t:'gen'},
 {n:'Educação Moral e Religiosa Católica (EMRC)',c:['1c','2c','3c','sec'],t:'gen'},
 {n:'Tecnologias da Informação e Comunicação (TIC)',c:['1c','2c','3c','profij'],t:'gen'},
 {n:'Apoio ao Estudo',c:['1c','2c'],t:'gen'},
 {n:'Oferta Complementar',c:['1c','2c','3c'],t:'gen'},
 // 1.º ciclo
 {n:'Estudo do Meio',c:['1c'],t:'gen'},
 {n:'Educação Artística — Artes Visuais',c:['1c'],t:'gen'},
 {n:'Educação Artística — Expressão Dramática/Teatro',c:['1c'],t:'gen'},
 {n:'Educação Artística — Dança',c:['1c'],t:'gen'},
 {n:'Educação Artística — Música',c:['1c'],t:'gen'},
 // 2.º ciclo
 {n:'História e Geografia de Portugal',c:['2c'],t:'gen'},
 {n:'Ciências Naturais',c:['2c','3c'],t:'gen'},
 {n:'Educação Visual',c:['2c','3c'],t:'gen'},
 {n:'Educação Tecnológica',c:['2c','3c'],t:'gen'},
 {n:'Educação Musical',c:['2c','3c'],t:'gen'},
 {n:'Complemento à Educação Artística',c:['2c','3c'],t:'gen'},
 // 3.º ciclo
 {n:'Francês',c:['3c','sec'],t:'le'},
 {n:'Espanhol',c:['3c','sec'],t:'le'},
 {n:'Alemão',c:['3c','sec'],t:'le'},
 {n:'História',c:['3c'],t:'gen'},
 {n:'Geografia',c:['3c'],t:'gen'},
 {n:'Físico-Química',c:['3c'],t:'gen'},
 {n:'Oferta de Escola',c:['3c'],t:'gen'},
 // Secundário — formação geral
 {n:'Filosofia',c:['sec'],t:'gen'},
 // Secundário — formação específica (10.º/11.º)
 {n:'Matemática A',c:['sec'],t:'gen'},
 {n:'Matemática B',c:['sec'],t:'gen'},
 {n:'Matemática Aplicada às Ciências Sociais (MACS)',c:['sec'],t:'gen'},
 {n:'Física e Química A',c:['sec'],t:'gen'},
 {n:'Biologia e Geologia',c:['sec'],t:'gen'},
 {n:'Geometria Descritiva A',c:['sec'],t:'gen'},
 {n:'Economia A',c:['sec'],t:'gen'},
 {n:'Geografia A',c:['sec'],t:'gen'},
 {n:'História A',c:['sec'],t:'gen'},
 {n:'História B',c:['sec'],t:'gen'},
 {n:'História da Cultura e das Artes',c:['sec'],t:'gen'},
 {n:'Desenho A',c:['sec'],t:'gen'},
 {n:'Literatura Portuguesa',c:['sec'],t:'port'},
 {n:'Latim A',c:['sec'],t:'gen'},
 {n:'Grego',c:['sec'],t:'gen'},
 // Secundário — 12.º ano (opções)
 {n:'Biologia',c:['sec'],t:'gen'},
 {n:'Física',c:['sec'],t:'gen'},
 {n:'Química',c:['sec'],t:'gen'},
 {n:'Geologia',c:['sec'],t:'gen'},
 {n:'Antropologia',c:['sec'],t:'gen'},
 {n:'Aplicações Informáticas B',c:['sec'],t:'gen'},
 {n:'Ciência Política',c:['sec'],t:'gen'},
 {n:'Clássicos da Literatura',c:['sec'],t:'gen'},
 {n:'Direito',c:['sec'],t:'gen'},
 {n:'Economia C',c:['sec'],t:'gen'},
 {n:'Filosofia A',c:['sec'],t:'gen'},
 {n:'Geografia C',c:['sec'],t:'gen'},
 {n:'Latim B',c:['sec'],t:'gen'},
 {n:'Psicologia B',c:['sec'],t:'gen'},
 {n:'Sociologia',c:['sec'],t:'gen'},
 {n:'Oficina de Artes',c:['sec'],t:'gen'},
 {n:'Oficina de Multimédia B',c:['sec'],t:'gen'},
 {n:'Materiais e Tecnologias',c:['sec'],t:'gen'},
 {n:'Inglês (Língua Estrangeira — 12.º)',c:['sec'],t:'le'},
 // PROFIJ — componentes de formação sociocultural, científica, tecnológica e prática
 {n:'Língua Portuguesa',c:['profij'],t:'port'},
 {n:'Linguagem e Comunicação',c:['profij'],t:'port'},
 {n:'Comunicar em Inglês',c:['profij'],t:'le'},
 {n:'Comunicar em Francês',c:['profij'],t:'le'},
 {n:'Cidadania e Mundo Atual',c:['profij'],t:'gen'},
 {n:'Cidadania e Empregabilidade',c:['profij'],t:'gen'},
 {n:'Cidadania e Profissionalidade',c:['profij'],t:'gen'},
 {n:'Matemática Aplicada',c:['profij'],t:'gen'},
 {n:'Matemática para a Vida',c:['profij'],t:'gen'},
 {n:'Desenvolvimento Pessoal, Profissional e Social',c:['profij'],t:'gen'},
 {n:'Componente Tecnológica (UFCD)',c:['profij'],t:'gen'},
 {n:'Formação Prática em Contexto de Trabalho',c:['profij'],t:'gen'}
];
const CICLOS={'1c':'1.º Ciclo','2c':'2.º Ciclo','3c':'3.º Ciclo','sec':'Ensino Secundário','profij':'PROFIJ'};
const ANOS_ESC={'1c':['1.º','2.º','3.º','4.º'],'2c':['5.º','6.º'],'3c':['7.º','8.º','9.º'],'sec':['10.º','11.º','12.º']};
const cicloDoAno=a=>{for(const[k,v]of Object.entries(ANOS_ESC))if(v.includes(a))return k;return 'sec'};
const MODELOS={
  le:[['PO','Produção Oral',25],['CO','Compreensão Oral',25],['CE','Compreensão Escrita',25],['PE','Produção Escrita',25]],
  port:[['OR','Oralidade',20],['LEI','Leitura',20],['EL','Educação Literária',20],['ESC','Escrita',25],['GRA','Gramática',15]],
  ef:[['AF','Atividades Físicas',60],['APF','Aptidão Física',20],['CON','Conhecimentos',20]],
  gen:[['CC','Conhecimentos e Capacidades',80],['AT','Atitudes e Valores',20]]
};
const TIPOS_INST=['Teste de Avaliação','Teste de Avaliação Completo','Prova Escrita','Questão-aula','Ficha de Trabalho','Apresentação Oral','Prova Oral','Avaliação Diagnóstica','Caderno Diário','D.A.C.','Exercício de Avaliação','Exercício de Recuperação','Observação em Sala de Aula','Trabalho de Casa','Trabalho de Grupo','Trabalho em Pares','Trabalho Individual','Projeto','Prova Prática'];
/* MSAI — Medidas de Suporte à Aprendizagem e à Inclusão (DL n.º 54/2018) */
const MEDIDAS={
  univ:{t:'Medidas universais',art:'art. 8.º, n.º 2',ab:'U',cor:'#2f7fd0',l:['Diferenciação pedagógica','Acomodações curriculares','Enriquecimento curricular','Promoção do comportamento pró-social','Intervenção com foco académico ou comportamental em pequenos grupos']},
  selet:{t:'Medidas seletivas',art:'art. 9.º, n.º 1',ab:'S',cor:'#d98b00',l:['Percursos curriculares diferenciados','Adaptações curriculares não significativas','Apoio psicopedagógico','Antecipação e reforço das aprendizagens','Apoio tutorial']},
  adic:{t:'Medidas adicionais',art:'art. 10.º, n.º 4',ab:'A',cor:'#c0392b',l:['Frequência do ano de escolaridade por disciplinas','Adaptações curriculares significativas','Plano individual de transição','Desenvolvimento de metodologias e estratégias de ensino estruturado','Desenvolvimento de competências de autonomia pessoal e social']},
  aval:{t:'Adaptações ao processo de avaliação',art:'art. 28.º',ab:'Av',cor:'#7a4fd0',l:['Diversificação dos instrumentos de recolha de informação','Enunciados em formatos acessíveis (braille, digital, ampliados…)','Interpretação em Língua Gestual Portuguesa','Utilização de produtos de apoio','Tempo suplementar para a realização da prova','Transcrição das respostas','Leitura de enunciados','Utilização de sala separada','Pausas vigiadas','Código de identificação de cores nos enunciados']},
  rec:{t:'Recursos específicos de apoio',art:'art. 11.º',ab:'R',cor:'#1a7f37',l:['Docente de educação especial','Técnico(s) especializado(s) (psicólogo, terapeuta…)','Assistente operacional','Centro de Apoio à Aprendizagem (CAA)','Equipa Multidisciplinar (EMAEI)']}
};
const DOCS=['Relatório Técnico-Pedagógico (RTP)','Programa Educativo Individual (PEI)','Plano Individual de Transição (PIT)'];
const ACOMOD=['Localização do aluno na sala de aula','Informação multimédia / gráficos / esquemas','Verificação da compreensão das instruções','Apresentação/simulação de exemplos','Registo de anotações','Segmentação de conteúdos/processos executivos','Abordagem através da manipulação','Facultar tempo para questões','Ensino de vocabulário específico','Tempo suplementar na realização de provas','Recorrer às tecnologias digitais','Recurso a apontamentos pessoais','Itens de resposta fechada / seleção'];
/* acomodações: índice do catálogo ACOMOD ou texto livre (dados antigos/importados) — nunca «texto»+1 */
function acIdx(i){if(typeof i==='number')return i;const k=normT(String(i||''));if(!k)return -1;let j=ACOMOD.findIndex(x=>normT(x)===k);if(j<0&&/tempo/.test(k)&&/(teste|prova|ficha)/.test(k))j=9;return j}
const acT=i=>{const j=acIdx(i);return j>=0?ACOMOD[j]:String(i||'')};const acN=i=>{const j=acIdx(i);return j>=0?String(j+1):String(i||'')};const acL=i=>{const j=acIdx(i);return j>=0?(j+1)+'. '+ACOMOD[j]:String(i||'')};
const SINTESE_DEF={
  'Insuficiente':'Em {dom}, {oa} {aluno} revela dificuldades significativas, não tendo ainda atingido as aprendizagens essenciais. Precisa de reforçar o trabalho regular e de recorrer aos apoios disponíveis.',
  'Suficiente':'Em {dom}, {oa} {aluno} atinge as aprendizagens essenciais de forma satisfatória, embora com algumas lacunas que deve continuar a trabalhar.',
  'Bom':'Em {dom}, {oa} {aluno} revela um bom domínio das aprendizagens, demonstrando segurança e autonomia na maioria das tarefas.',
  'Muito Bom':'Em {dom}, {oa} {aluno} revela um desempenho muito bom, mobilizando as aprendizagens com rigor, autonomia e consistência.'
};
const MENCOES_DEF=[{nome:'Insuficiente',max:49.4},{nome:'Suficiente',max:69.4},{nome:'Bom',max:89.4},{nome:'Muito Bom',max:100}];

