
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
const TIPOS_INST=['Teste de Avaliação','Prova Escrita','Questão-aula','Ficha de Trabalho','Apresentação Oral','Prova Oral','Avaliação Diagnóstica','Caderno Diário','D.A.C.','Exercício de Avaliação','Exercício de Recuperação','Observação em Sala de Aula','Trabalho de Casa','Trabalho de Grupo','Trabalho em Pares','Trabalho Individual','Projeto','Prova Prática'];
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
const SINTESE_DEF={
  'Insuficiente':'Em {dom}, {oa} {aluno} revela dificuldades significativas, não tendo ainda atingido as aprendizagens essenciais. Precisa de reforçar o trabalho regular e de recorrer aos apoios disponíveis.',
  'Suficiente':'Em {dom}, {oa} {aluno} atinge as aprendizagens essenciais de forma satisfatória, embora com algumas lacunas que deve continuar a trabalhar.',
  'Bom':'Em {dom}, {oa} {aluno} revela um bom domínio das aprendizagens, demonstrando segurança e autonomia na maioria das tarefas.',
  'Muito Bom':'Em {dom}, {oa} {aluno} revela um desempenho muito bom, mobilizando as aprendizagens com rigor, autonomia e consistência.'
};
const MENCOES_DEF=[{nome:'Insuficiente',max:49.4},{nome:'Suficiente',max:69.4},{nome:'Bom',max:89.4},{nome:'Muito Bom',max:100}];

/* =====================================================================
   ESTADO
   ===================================================================== */
const KEY='edugest.v2';
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function anoAuto(){const d=new Date(),y=d.getFullYear(),m=d.getMonth()+1;return m>=9?y+'/'+(y+1):(y-1)+'/'+y}
function vazio(){return {cfg:{escola:'',professor:'',email:'',grupo:'',disciplinas:[],extra:[],tipos:TIPOS_INST.slice(),sinteses:Object.assign({},SINTESE_DEF)},anos:[],anoAtivo:null,turmaAtiva:null}}
function migrate(s){
  const v=vazio();s.cfg=Object.assign(v.cfg,s.cfg||{});s.anos=s.anos||[];
  // disciplinas antigas (só o nome) → uma por ciclo (os ciclos das turmas existentes, ou todos)
  s.cfg.disciplinas=[...new Set((s.cfg.disciplinas||[]).flatMap(n=>{if(String(n).includes('|'))return [n];const d=DISCIPLINAS.find(x=>x.n===n);if(!d)return [n];
    const usados=[...new Set(s.anos.flatMap(a=>(a.turmas||[]).filter(t=>t.disciplina===n).map(t=>t.ofertaDe==='profij'||t.oferta==='profij'?'profij':t.ciclo)).filter(c=>d.c.includes(c)))];
    return (usados.length?usados:d.c).map(c=>n+'|'+c)}))];
  s.anos.forEach(a=>{prepAno(a);a.org=a.org||'periodo';a.horarios=a.horarios||{};a.turmas=a.turmas||[];a.turmas.forEach(t=>{t.alunos=t.alunos||[];t.instrumentos=t.instrumentos||[];t.dominios=t.dominios||[];t.mencoes=t.mencoes||MENCOES_DEF.map(m=>({...m}));t.regra=t.regra||{2:'media',3:'media'};t.oferta=t.oferta==='profij'||t.oferta==='profissional'?t.oferta:'regular';t.alunos.forEach(x=>{if(x.frequenta===undefined)x.frequenta=true;if(x._genManual){x.generoManual=true;delete x._genManual}})})});
  return s;
}
const CTX_ESC=['calendario','horarios','horProf','naoLetivos','reunioes','datasAval','intercalar','org'];
const CTX_HERDA=['calendario','org'];
let ERRO_CARGA=false;
let S=(()=>{try{const v=localStorage.getItem(KEY);if(v)return migrate(JSON.parse(v))}catch(e){console.error("EduSpruce: erro ao ler os dados",e);ERRO_CARGA=true}return vazio()})();
let saveT;function save(){clearTimeout(saveT);estadoGuardar('pend');saveT=setTimeout(saveNow,150)}
/* guardar: localStorage + IndexedDB (cópia principal para turmas grandes), histórico para Anular e cópia de recuperação diária */
const HIST=[];let _ultimoJ=null,_semHist=false;
function saveNow(){clearTimeout(saveT);let j;try{arrumarFotos();S._ts=Date.now();j=JSON.stringify(S)}catch(e){return}
  if(_ultimoJ!=null&&!_semHist){const a=_ultimoJ.replace(/"_ts":\d+,?/,''),b=j.replace(/"_ts":\d+,?/,'');if(a!==b){const _n=Date.now();S._mod=_n;j=/"_mod":\d+/.test(j)?j.replace(/"_mod":\d+/,'"_mod":'+_n):j.replace(/"_ts":/,'"_mod":'+_n+',"_ts":');HIST.push(_ultimoJ);if(HIST.length>40)HIST.shift();atualizarAnular()}}
  _ultimoJ=j;_semHist=false;idbEstado(j);
  try{localStorage.setItem(KEY,j);const hj=isoData(new Date());if(localStorage.getItem(KEY+'.bakd')!==hj){localStorage.setItem(KEY+'.bak',j);localStorage.setItem(KEY+'.bakd',hj)}
    if(j.length>4.2e6&&!saveNow.av){saveNow.av=1;toast('Atenção: o espaço do browser está quase cheio — os dados continuam guardados no IndexedDB; exporte uma cópia de segurança','aviso')}}
  catch(e){try{localStorage.removeItem(KEY+'.bak')}catch(_){}if(!IDB){alert('Não foi possível guardar (espaço cheio?). Exporte uma cópia de segurança em Definições.\n\n'+e.message);estadoGuardar('erro');return}}
  estadoGuardar('ok')}
function estadoGuardar(k){const el=document.getElementById('saveSt');if(!el)return;el.className='savest '+k;el.innerHTML=k==='pend'?'<span class="sp"></span>A guardar…':k==='erro'?ic('alert',13)+' Erro ao guardar':ic('check',13)+' Guardado';el.title=k==='ok'?'Tudo guardado neste dispositivo':''}
function atualizarAnular(){const b=document.getElementById('undoBtn');if(b)b.disabled=!HIST.length}
function desfazer(){if(!HIST.length)return toast('Nada para anular');const j=HIST.pop();try{S=migrate(JSON.parse(j))}catch(e){return}_ultimoJ=j;_semHist=true;saveNow();_ultimoJ=JSON.stringify(S);atualizarAnular();go(VIEW);toast('Última alteração anulada','ok')}
function idbEstado(j){if(!IDB)return;try{IDB.transaction('estado','readwrite').objectStore('estado').put(j,'S')}catch(e){}}
function idbLerEstado(){return new Promise(ok=>{if(!IDB)return ok(null);try{const r=IDB.transaction('estado').objectStore('estado').get('S');r.onsuccess=()=>ok(r.result||null);r.onerror=()=>ok(null)}catch(e){ok(null)}})}
/* ---------- fotos: guardadas à parte (IndexedDB), partilhadas entre turmas ---------- */
const FOTOS={};let IDB=null;
function idbAbrir(){return new Promise(ok=>{setTimeout(()=>ok(null),2500);try{const r=indexedDB.open('edugest',2);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('fotos'))db.createObjectStore('fotos');if(!db.objectStoreNames.contains('estado'))db.createObjectStore('estado')};r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null);r.onblocked=()=>ok(null)}catch(e){ok(null)}})}
function idbTodas(db){return new Promise(ok=>{try{const out={};const c=db.transaction('fotos').objectStore('fotos').openCursor();c.onsuccess=()=>{const cur=c.result;if(cur){out[cur.key]=cur.value;cur.continue()}else ok(out)};c.onerror=()=>ok(out)}catch(e){ok({})}})}
function idbPor(id,v){if(!IDB)return;try{IDB.transaction('fotos','readwrite').objectStore('fotos').put(v,id)}catch(e){}}
function hashStr(s){let h1=0x811c9dc5,h2=0;for(let i=0;i<s.length;i+=7){h1^=s.charCodeAt(i);h1=Math.imul(h1,16777619);h2=(h2*31+s.charCodeAt(i))|0}return (h1>>>0).toString(36)+(h2>>>0).toString(36)+s.length.toString(36)}
/* troca fotos em data: URL por referências f:<id> guardadas no IndexedDB */
function arrumarFotos(){if(!IDB)return;S.anos.forEach(an=>an.turmas.forEach(t=>t.alunos.forEach(a=>{if(a.foto&&a.foto.startsWith('data:')){const id=hashStr(a.foto);if(!FOTOS[id]){FOTOS[id]=a.foto;idbPor(id,a.foto)}a.foto='f:'+id}})))}
const fotoSrc=a=>!a||!a.foto?'':a.foto.startsWith('f:')?(FOTOS[a.foto.slice(2)]||''):a.foto;

/* ---------- contexto de escola: dados do ano letivo que pertencem a cada escola ---------- */


function escAtiva(){let st;try{st=S}catch(_){return 'principal'}const id=(st&&st.escolaAtiva)||'principal';return id==='principal'||((st.escolas||[]).some(e=>e.id===id))?id:'principal'}
function prepAno(a){if(!a||a._prep)return a;const pe=a.porEscola=a.porEscola||{};pe.principal=pe.principal||{};
  CTX_ESC.forEach(k=>{const d=Object.getOwnPropertyDescriptor(a,k);if(d&&'value' in d){if(pe.principal[k]===undefined)pe.principal[k]=d.value;delete a[k]}
    Object.defineProperty(a,k,{enumerable:false,configurable:true,get(){const e=escAtiva();const o=pe[e]&&pe[e][k];if(o!==undefined)return o;return CTX_HERDA.includes(k)&&e!=='principal'?pe.principal[k]:undefined},
      set(v){const e=escAtiva();(pe[e]=pe[e]||{})[k]=v}})});
  Object.defineProperty(a,'_prep',{value:true,enumerable:false});return a}
const proprioEsc=(a,k)=>{const e=escAtiva();return !!(a.porEscola&&a.porEscola[e]&&a.porEscola[e][k]!==undefined)};
const A=()=>prepAno(S.anos.find(a=>a.id===S.anoAtivo)||null)||null;
const T=()=>{const a=A();return a?(a.turmas.find(t=>t.id===S.turmaAtiva)||null):null};
const discKey=(n,c)=>n+'|'+c;const discNome=k=>String(k).split('|')[0];const discCic=k=>String(k).split('|')[1]||'';
const discRotulo=k=>{const c=discCic(k);return discNome(k)+(c?' — '+(CICLOS[c]||c):'')};
/* chaves "Disciplina|ciclo" (cada ciclo é uma disciplina diferente) */
const minhasDiscK=()=>{const D=discAno(),X=discExtraAno();return [...D,...X.filter(x=>!D.some(k=>discNome(k)===x))]};
const minhasDisc=()=>[...new Set(minhasDiscK().map(discNome))];

/* =====================================================================
   CÁLCULOS
   ===================================================================== */
const num=v=>{if(v===''||v==null)return null;const n=parseFloat(String(v).replace(',','.'));return isNaN(n)?null:n};
const isSec=t=>!!t&&escalaDe(t)==='20';
const periodos=()=>(A()||{}).org==='semestre'?[1,2]:[1,2,3];
const perW=()=>(A()||{}).org==='semestre'?'Semestre':'Período';
const perNome=p=>p+'.º '+perW();
const ordA=t=>(a,b)=>{const o=t.origens||[];return ((o.indexOf(a.origem)+1||99)-(o.indexOf(b.origem)+1||99))||((+a.num||999)-(+b.num||999))};
const alunosAval=t=>t.alunos.filter(a=>a.frequenta).sort(ordA(t));
const alunosTodos=t=>t.alunos.slice().sort(ordA(t));
/* filtro por turma de origem (turmas conjuntas) */
const alunosFiltro=t=>alunosAval(t).filter(a=>!t.origens||!UI.orig||a.origem===UI.orig);
const numAl=x=>x?(x.numOrig!=null&&x.numOrig!==''?x.num+' ('+x.numOrig+')':x.num):'',tagOrig=(t,a)=>t.origens&&a.origem?` <span class="tag" title="Turma ${esc(a.origem)}">${esc(a.origem)}</span>`:'';
function selOrigem(t,cb){if(!t.origens)return '';if(UI.orig&&!t.origens.includes(UI.orig))UI.orig='';
  return `<label class="mut" style="margin:0">Turma de origem</label><select class="fld" id="sel-orig" style="width:auto"><option value="">Todas (${esc(t.origens.join(' + '))})</option>${t.origens.map(o=>`<option ${o===UI.orig?'selected':''}>${esc(o)}</option>`).join('')}</select>`}
function bindOrigem(cb){const s=$('#sel-orig');if(s)s.onchange=()=>{UI.orig=s.value;cb()}}
const instMax=i=>i.itens.reduce((s,x)=>s+(+x.cot||0),0);
function instAvaliado(i,aid){const n=i.notas[aid];return !!n&&i.itens.some(it=>num(n[it.id])!=null)}
function instTotal(i,aid){if(!instAvaliado(i,aid))return null;const n=i.notas[aid];return i.itens.reduce((s,it)=>s+(num(n[it.id])||0),0)}
function instDom(i,aid,dom){
  const its=i.itens.filter(x=>x.dom===dom);if(!its.length)return null;
  const max=its.reduce((s,x)=>s+(+x.cot||0),0);if(!max||!instAvaliado(i,aid))return null;
  const n=i.notas[aid];const pts=its.reduce((s,x)=>s+(num(n[x.id])||0),0);return {pts,max,pct:pts/max};
}
function domPer(t,aid,dom,per){const v=t.instrumentos.filter(i=>+i.periodo===+per).map(i=>instDom(i,aid,dom)).filter(Boolean).map(x=>x.pct);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
function pctsPer(t,aid,per){const o={};t.dominios.forEach(d=>o[d.id]=domPer(t,aid,d.id,per));return o}
function pctsFinal(t,aid,per){
  if(+per===1||t.regra[per]==='periodo')return pctsPer(t,aid,per);
  const o={};if(t.dominios.every(d=>domPer(t,aid,d.id,per)==null)){t.dominios.forEach(d=>o[d.id]=null);return o}
  t.dominios.forEach(d=>{const v=[];for(let p=1;p<=per;p++){const x=domPer(t,aid,d.id,p);if(x!=null)v.push(x)}o[d.id]=v.length?v.reduce((a,b)=>a+b,0)/v.length:null});return o;
}
function ponderada(t,pcts){let w=0,s=0;t.dominios.forEach(d=>{const p=pcts[d.id];if(p!=null&&+d.peso>0){s+=p*d.peso;w+=+d.peso}});return w?s/w:null}
function fmtNota(t,f){if(f==null)return '';const d=S.cfg.arred==null?1:S.cfg.arred,m=Math.pow(10,d);return isSec(t)?(Math.round(f*20*m)/m).toFixed(d).replace('.',','):Math.round(f*100)+'%'}
function nivel(t,f){if(f==null)return '';if(isSec(t))return Math.round(f*20+1e-9);const p=f*100;return p<20?1:p<50?2:p<70?3:p<90?4:5}
function mencao(t,f){if(f==null)return null;const p=Math.round(f*1000)/10;for(let i=0;i<t.mencoes.length;i++)if(p<=t.mencoes[i].max)return {i,nome:t.mencoes[i].nome};const l=t.mencoes.length-1;return {i:l,nome:t.mencoes[l].nome}}
const mcls=(t,m)=>m?'mc'+Math.min(4,Math.max(1,Math.round((m.i/Math.max(1,t.mencoes.length-1))*3)+1)):'';
const tcls=(t,m)=>m?'t'+mcls(t,m).slice(1):'';
const pillM=(t,m)=>m&&!m.banda&&m.nome?`<span class="pill ${mcls(t,m)}">${esc(m.nome)}</span>`:'';
const pct=f=>f==null?'':Math.round(f*100)+'%';
const pctD=(t,f)=>f==null||!isFinite(f)?'':(t&&isSec(t)?fmtNota(t,f):pct(f));
const negativa=(t,f)=>{const p=pctCanon(t,f);return p!=null&&(isSec(t)?p<50:nivel(t,f)<3)};
function avg(a){const v=a.filter(x=>x!=null&&x!==false);return v.length?v.reduce((x,y)=>x+y,0)/v.length:null}

/* =====================================================================
   UTILITÁRIOS
   ===================================================================== */
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name.replace(/[\/\\:*?"<>|]/g,'-');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
const fmtD=iso=>{if(!iso)return'';const p=iso.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:iso};
const nf=(v,d=1)=>v==null||v===''?'':(Math.round(v*Math.pow(10,d))/Math.pow(10,d)).toString().replace('.',',');
const domById=(t,id)=>t.dominios.find(d=>d.id===id);
const oa=a=>a.genero==='F'?'a':'o';
const aluno_a=a=>a.genero==='F'?'aluna':'aluno';
function csv(rows){return '﻿'+rows.map(r=>r.map(c=>{c=c==null?'':String(c);return /[;"\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(';')).join('\n')}
/* género automático pelo primeiro nome (pode ser alterado à mão) */
const FEM=new Set('inês ines beatriz raquel isabel isabelle isabele carmen lurdes lourdes mercedes ruth rute ester esther abigail leonor matilde alice clarice clarisse íris iris irene simone yasmin yasmine jasmim jasmin noémi noemi luz liz rosário rosario conceição conceicao assunção assuncao graça graca dulce denise beatrice yolanda yolande sol miriam míriam ingrid zoé zoe chloe chloé charlotte nicole michelle michele jéssica jessica mel mercês merces glória gloria nazaré nazare aline eliane elaine gabrielle tainá taina raissa celeste arlete bernadete odete ivone liliane margarete elisabete elizabete lisete susete salomé salome taís tais thaís thais tatiane cristiane daniele danielle emily emilly kelly kimberly lauren lily lorraine madeleine nadine nathalie natalie noelle sharon valerie vivian vivianne yasmim hellen helen kathleen caroline carolyne jennifer jenifer grace joyce janice anne annie marie maryline evelyn evelin ellen allison alison camille juliet juliette rachel raquel ariane josiane rosane viviane iolanda mafalda inez esperança esperanca deise daise'.split(' '));
const MASC_A=new Set('luca lucca joshua nikita elia batista garcia andrea jonatha mattia noah juda judas josua sacha sasha akira kosta moussa aliyah'.split(' '));
const MASC=new Set('noa'.split(' '));
function guessGen(n){const f=((n||'').trim().split(/\s+/)[0]||'').toLowerCase().replace(/[^\p{L}]/gu,'');if(!f)return 'M';if(FEM.has(f))return 'F';if(MASC_A.has(f)||MASC.has(f))return 'M';return /a$/.test(f)?'F':'M'}
function setNome(a,nome){a.nome=nome;if(!a.generoManual)a.genero=guessGen(nome)}
function titleCase(s){const low=['de','da','do','das','dos','e'];return s.toLowerCase().split(/\s+/).map((w,i)=>i&&low.includes(w)?w:w.replace(/(^|[-'])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase())).join(' ')}
function idade(n){if(!n)return'';const d=new Date(n);if(isNaN(d))return'';return Math.floor((Date.now()-d)/31557600000)}
function openDrawer(title,html){const d=$('#drawer');if(!d.classList.contains('on'))openDrawer.ret=document.activeElement;$('#dw-t').textContent=title;$('#dw-b').innerHTML=html;d.classList.add('on');document.body.classList.add('dw-on');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','dw-t');setTimeout(()=>{if(!d.contains(document.activeElement)){const f=d.querySelector('.dwb input:not([type=hidden]),.dwb select,.dwb textarea,.dwb button');(f||$('#dw-x')).focus({preventScroll:true})}},60)}
function closeDrawer(){const d=$('#drawer');if(!d.classList.contains('on'))return;d.classList.remove('on');document.body.classList.remove('dw-on');const r=openDrawer.ret;openDrawer.ret=null;if(r&&document.contains(r)&&r.focus)try{r.focus({preventScroll:true})}catch(_){}}
$('#dw-x').onclick=closeDrawer;
function novoAluno(t,nome){const n=Math.max(0,...t.alunos.map(a=>+a.num||0))+1;return {id:uid(),num:n,processo:'',nome:nome||'',genero:guessGen(nome),nasc:'',frequenta:true,repetente:false,ase:'',eeNome:'',eeContacto:'',email:'',obs:'',medidas:{univ:[],selet:[],adic:[]},acomod:[],autoav:{},obsPer:{}}}
function mkDominios(tpl){return (MODELOS[tpl]||MODELOS.gen).map(([ab,nome,peso],k)=>({id:uid()+k,ab,nome,peso}))}
const discInfo=n=>DISCIPLINAS.find(d=>d.n===n);

/* ---------- ícone do ano de escolaridade (10, 11, 12…) ---------- */
function anoNum(t){const n=parseInt(t&&t.anoEsc);return isNaN(n)?(/pr[eé]/i.test((t&&t.anoEsc)||'')?'PE':'?'):String(n)}
const anoBadge=(t,cls)=>t?`<span class="anob c-${ofertaDe(t)==='profij'?'profij':t.ciclo||'sec'} ${cls||''} ${badgeCod(t)?'cod'+(badgeCod(t).length>3?' l'+Math.min(badgeCod(t).length,6):''):''}" title="${esc(badgeCod(t)?'Código '+badgeCod(t)+' · '+(t.anoEsc||''):t.anoEsc||'')}">${esc(badgeCod(t))||anoNum(t)}</span>`:'';
/* ---------- oferta formativa: Ensino Regular / PROFIJ (separação transversal) ---------- */
const OFERTAS={regular:{nome:'Ensino Regular',cor:'#2f7fd0'},profij:{nome:'PROFIJ',cor:'#1a7f37'}};
const ofertaDe=t=>t&&t.oferta&&OFERTAS[t.oferta]?t.oferta:'regular';
const ofertaTag=t=>ofertaDe(t)==='profij'?' <span class="tag of-p">PROFIJ</span>':'';
const turmasFiltradas=a=>(a?a.turmas:[]).filter(t=>(!S.filtroOferta||ofertaDe(t)===S.filtroOferta)&&escId(escolaDe(t))===escAtiva());
function gruposOferta(L){return ['regular','profij'].map(k=>({k,nome:OFERTAS[k].nome,L:L.filter(t=>ofertaDe(t)===k)})).filter(g=>g.L.length)}
const segOferta=(id,cur,tipo)=>`<div class="seg" id="${id}">${Object.entries(OFERTAS).filter(([k])=>!tipo||TIPOS_ESCOLA[tipo].ofertas.includes(k)).map(([k,o])=>`<button type="button" data-of="${k}" class="${(cur||'regular')===k?'on':''}">${ic(k==='profij'?'award':k==='profissional'?'layers':'school',15)} ${o.nome}</button>`).join('')}</div>`;
function bindSegOferta(id,cb){$$('#'+id+' [data-of]').forEach(b=>b.onclick=()=>{$$('#'+id+' [data-of]').forEach(x=>x.classList.toggle('on',x===b));cb(b.dataset.of)})}
function renderFiltroOferta(){const el=$('#ofsel');if(!el)return;const TT=(A()||{turmas:[]}).turmas.filter(t=>escId(escolaDe(t))===escAtiva());const ofs=[...new Set(TT.map(ofertaDe))];const has=ofs.length>1;const ES=todasEscolas();const hasE=false;
  if(S.filtroEscola&&!ES.some(e=>escId(e)===S.filtroEscola))S.filtroEscola='';
  el.innerHTML=(hasE?`<select class="escsel" id="fo-esc" aria-label="Escola"><option value="">Todas as escolas</option>${ES.map(e=>`<option value="${escId(e)}" ${S.filtroEscola===escId(e)?'selected':''}>${esc(nomeEscola(e))}</option>`).join('')}</select>`:'')+(has||S.filtroOferta?`<div class="seg mini">${[['','Todas'],...['regular','profij','profissional'].filter(k=>ofs.includes(k)||S.filtroOferta===k).map(k=>[k,k==='regular'?'Regular':k==='profij'?'PROFIJ':'Profissional'])].map(([k,l])=>`<button data-fo="${k}" class="${(S.filtroOferta||'')===k?'on':''}">${l}</button>`).join('')}</div>`:'');
  el.style.display=has||S.filtroOferta||hasE?'':'none';const fe=$('#fo-esc');if(fe)fe.onchange=()=>{S.filtroEscola=fe.value;const t=T();if(t&&S.filtroEscola&&escId(escolaDe(t))!==S.filtroEscola)S.turmaAtiva=null;save();go(NEEDS_T.includes(VIEW)&&!T()?'turmas':VIEW)};
  $$('#ofsel [data-fo]').forEach(b=>b.onclick=()=>{S.filtroOferta=b.dataset.fo;const t=T();if(t&&S.filtroOferta&&ofertaDe(t)!==S.filtroOferta)S.turmaAtiva=null;save();go(NEEDS_T.includes(VIEW)&&!T()?'turmas':VIEW)})}

/* =====================================================================
   NAVEGAÇÃO
   ===================================================================== */
const TITLES={inicio:'Início',turmas:'Ano letivo e turmas',meuhorario:'O meu horário',calendario:'Calendário escolar',reunioes:'Reuniões',horario:'Horário',testes:'Marcação de testes',alunos:'Alunos',criterios:'Critérios de avaliação',instrumentos:'Instrumentos de avaliação',dominios:'Domínios por período',avaliacao:'Avaliação final',relatorios:'Relatórios individuais',tarefas:'As minhas tarefas',planta:'Planta da sala de aula',sumarios:'Aulas e sumários',recursos:'Biblioteca',direcao:'Direção de turma',documentos:'Documentos',escola:'Escolas',definicoes:'Definições',modulos:'Módulos',ajuda:'Ajuda'};
const NEEDS_T=['planta','sumarios','modulos','alunos','horario','testes','criterios','instrumentos','dominios','avaliacao','relatorios'];
let VIEW='inicio',UI={inst:null,instTab:'notas',per:null,dom:null,relAluno:'all',relPer:null};
function go(v){
  if(document.body.classList.contains('apres-prof')&&APRES_BLOQ.includes(v)){toast('Indisponível no modo de apresentação');return}
  if(NEEDS_T.includes(v)&&!T())v='turmas';
  if(v!==VIEW){const vw=$('#view');if(vw)vw.scrollTop=0;window.scrollTo(0,0)}
  VIEW=v;closeDrawer();document.body.classList.remove('menu');
  $$('#side .nav').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  $$('#side .tnav').forEach(b=>b.disabled=!T());
  const t=T();$('#grpT').innerHTML=t?anoBadge(t,'sm')+' Turma '+esc(t.nome):'Turma';
  $('#ttl').textContent=TITLES[v]+(t&&NEEDS_T.includes(v)?' — '+t.nome+' · '+t.disciplina:'');
  $('#barx').innerHTML='';document.body.classList.remove('print-landscape');
{const tt=T();if(tt&&escId(escolaDe(tt))!==escAtiva())S.escolaAtiva=escId(escolaDe(tt))}if(document.body.classList.contains('apres'))apresPrep();
  const mudouVista=go._ult!==v;go._ult=v;
  fillCtx();
  renderFiltroOferta();migalhas(v);cabecalhoImpressao(v);fecharMenu();{const np=document.getElementById('numpad');if(np)np.remove()}
  (go._f=go._f||{inicio:vInicio,turmas:vTurmas,meuhorario:vMeuHorario,calendario:vCalendario,reunioes:vReunioes,horario:vHorario,testes:vTestes,alunos:vAlunos,criterios:vCriterios,instrumentos:vInstrumentos,dominios:vDominios,avaliacao:vAvaliacao,relatorios:vRelatorios,tarefas:vTarefas,planta:vPlanta,sumarios:vSumarios,recursos:vRecursos,direcao:vDirecao,documentos:vDocumentos,escola:vEscola,modulos:vModulos,jornal:vJornal,definicoes:vDefinicoes,ajuda:vAjuda})[v]();
  ajustarBarra();reunBadge();navModular();sessBox();try{favBtn();navDT();navTurmas();tarBadge();corrigirNotasFer()}catch(e){console.error(e)}
  if(mudouVista)animarNumeros();
}
$$('#side .nav').forEach(b=>b.onclick=()=>go(b.dataset.v));
function barEscola(){const b=document.getElementById('barEsc');if(!b)return;const c=EC()||{};const n=(c.escola||'').trim();
  if(!n&&!c.logo){b.hidden=true;return}b.hidden=false;
  b.innerHTML=(c.logo?`<img src="${c.logo}" alt="">`:`<span class="besi">${ic('school',16)}</span>`)+`<span class="besn">${esc(n||'Escola')}</span>`;b.title=n||'Escola'}
function fillCtx(){{const be=$('#brandEsc');if(be){const e=EC();be.textContent=e&&e.escola?e.escola:'Plataforma Integrada de Gestão Educativa';be.title=be.textContent}}
  {const ES=todasEscolas();const se=$('#selEsc'),ce=$('#ctxEsc');const multi=ES.length>1;const temE=!!((EC()||{}).escola||(EC()||{}).logo);if(ce){ce.style.display=multi||temE?'':'none';ce.classList.toggle('unica',!multi)}if(se)se.disabled=!multi;document.body.classList.toggle('multiesc',multi);document.body.classList.toggle('escunica',!multi&&temE);
   {const en=$('#escNome');if(en)en.textContent=nomeEscola(EC());const lg=$('#escLogo');if(lg){const e=EC();lg.innerHTML=e.logo?`<img src="${e.logo}" alt="">`:ic(TIPOS_ESCOLA[tipoEscola(e)].ic,16)}}
   if(se&&multi){se.innerHTML=ES.map(e=>`<option value="${escId(e)}" ${escId(e)===escAtiva()?'selected':''}>${esc(nomeEscola(e))}</option>`).join('');
     se.onchange=()=>{S.escolaAtiva=se.value;const TF=turmasFiltradas(A());S.turmaAtiva=TF[0]?TF[0].id:null;UI.inst=null;save();toast(nomeEscola(EC())+' · '+TIPOS_ESCOLA[tipoEscola(EC())].n,'ok');go(NEEDS_T.includes(VIEW)&&!T()?'inicio':VIEW)}}}
  barEscola();
  {const ai=$('#anoInd');if(ai){const a0=A();ai.innerHTML='<span class="anol">Ano Letivo:</span> '+ic('calendar',15)+' <b>'+(a0?esc(a0.nome):'—')+'</b>'}}
  const sa=$('#selAno');sa.innerHTML=S.anos.length?S.anos.map(a=>`<option value="${a.id}" ${a.id===S.anoAtivo?'selected':''}>${esc(a.nome)}</option>`).join(''):'<option>—</option>';
  sa.onchange=()=>{S.anoAtivo=sa.value;const a=A();const TF=turmasFiltradas(a);S.turmaAtiva=TF[0]?TF[0].id:null;UI.inst=null;save();go(NEEDS_T.includes(VIEW)&&!T()?'turmas':VIEW)};
  const a=A(),st=$('#selTurma');
  const TF=turmasFiltradas(a);const opt=t=>`<option value="${t.id}" ${t.id===S.turmaAtiva?'selected':''}>${esc(t.nome)} · ${esc(t.disciplina)}</option>`;const G=gruposOferta(TF);
  st.classList.toggle('vazio',!TF.length);st.innerHTML=TF.length?'<option value="">— escolher —</option>'+(G.length>1?G.map(g=>`<optgroup label="${esc(g.nome)}">${g.L.map(opt).join('')}</optgroup>`).join(''):TF.map(opt).join('')):'<option value="">Sem turmas</option>';
  st.onchange=()=>{S.turmaAtiva=st.value||null;UI.inst=null;UI.orig='';save();go(T()?(NEEDS_T.includes(VIEW)?VIEW:'alunos'):'turmas')};
}
/* ---------- ícones (SVG, traço) ---------- */
const ICONS={
 flow:'<rect x="4" y="4" width="7" height="7" rx="2.2"/><rect x="13" y="13" width="7" height="7" rx="2.2"/><path d="M7.5 11v1.5a3 3 0 0 0 3 3H13"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
 meet:'<circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="7" r="2.5"/><path d="M3 21v-4a4 4 0 0 1 8 0"/><path d="M13 17a4 4 0 0 1 8 0v4"/><path d="M2 21h20"/><path d="M12 13v8"/>',
 home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
 school:'<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M10 21v-5h4v5"/><path d="M12 9.5h.01"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.7c2 .7 3.2 2.6 3.5 5.3"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"/>',
 sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
 clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9z"/><path d="M9 11h6M9 15h4"/>',
 chart:'<path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
 grad:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/><path d="M22 9v6"/>',
 file:'<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17.5h.01"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 upload:'<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
 download:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
 printer:'<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
 trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
 merge:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7v10"/><path d="M6 7c0 4 5 5 10 5"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14.6-4.4L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.6 4.4L20 16"/><path d="M20 21v-5h-5"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
 idcard:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c.6-1.8 1.9-2.8 3.5-2.8s2.9 1 3.5 2.8M15 10h4M15 14h3"/>',
 star:'<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h8"/>',
 layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 flag:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
 calcheck:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 auto:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
 calx:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M10 13.5l4 4M14 13.5l-4 4"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
 headphones:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/>',
 bookopen:'<path d="M2 5c3-1.5 7-1.5 10 1v14c-3-2.5-7-2.5-10-1z"/><path d="M22 5c-3-1.5-7-1.5-10 1v14c3-2.5 7-2.5 10-1z"/>',
 pen:'<path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16z"/><path d="M14 6l3 3"/><path d="M13 20h7"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 puzzle:'<path d="M10 3h4v3a2 2 0 1 0 0 0h4v4h-2a2 2 0 1 0 0 4h2v4h-4v-2a2 2 0 1 0-4 0v2H6v-4H4a2 2 0 1 1 0-4h2V6h4z"/>',
 heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
 run:'<circle cx="14" cy="4.5" r="2"/><path d="M9 21l2.5-6L14 17v4M7 12l3-4 4 1 2 3 3 1M10 8l-1 6"/>',
 flask:'<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
 brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h1V4z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h-1V4z"/>',
 calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
 palette:'<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16" cy="10" r="1"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 list:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
 grid:'<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',
 back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
 check:'<path d="M5 12l5 5L20 7"/>',
 checks:'<path d="M3 12l4 4 8-8"/><path d="M11 16l1 1 9-9"/>',
 paste:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9z"/><path d="M12 10v7M9 14l3 3 3-3"/>',
 crown:'<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
 access:'<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5"/><path d="M12 10v5l-3 6M12 15l3 6"/>',
 building:'<path d="M4 21V5l8-2v18"/><path d="M12 7l8 2v12"/><path d="M8 9h.01M8 13h.01M8 17h.01M16 13h.01M16 17h.01"/>',
 award:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 21l5-3 5 3-1.5-7"/>',
 text:'<path d="M4 6h16M4 12h16M4 18h10"/>',
 pencil:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 arrowUp:'<path d="M12 19V5M6 11l6-6 6 6"/>',
 folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'
};
function ic(n,sz){sz=Math.round((sz||16)*1.2);const p=ICONS[n];return p?`<svg class="ic" width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`:''}
/* ícone automático pelo texto de botões e títulos */
const IC_BTN=[[/^(\+|Adicionar)/,'plus'],[/^Importar|Turma a partir/i,'upload'],[/^Exportar/i,'download'],[/^Imprimir/i,'printer'],[/^Apagar|^Remover|^×$/i,'trash'],[/^Duplicar|^\+ Outra disciplina|Copiar/i,'copy'],[/Juntar/i,'merge'],[/^↻|Atualizar/i,'refresh'],[/^Colar/i,'paste'],[/^←/,'back'],[/^Fechar$/,'x'],[/^Abrir$/,'folder'],[/^Ficha$/,'idcard'],[/^Assinalar todos/i,'checks'],[/^Desmarcar todos/i,'x'],[/^Guardar|^Criar|^Continuar|^Importar$/i,'check'],[/^Ajustar/i,'search'],[/Alterar fotografia|Adicionar fotografia/i,'image'],[/Repor|Começar/i,'refresh']];
const IC_H=[[/Primeiros passos/i,'sparkle'],[/^Ano letivo/i,'calendar'],[/^Turmas/i,'school'],[/^Turma$/i,'school'],[/Outros anos/i,'calendar'],[/Escola e professor/i,'building'],[/Disciplinas/i,'book'],[/Tipos de instrumento/i,'clipboard'],[/síntese/i,'text'],[/Cópia de segurança/i,'shield'],[/Domínios|ponderações/i,'layers'],[/Classificação final/i,'grad'],[/Menções/i,'award'],[/Desempenho/i,'chart'],[/Distribuição/i,'chart'],[/Instrumentos recentes/i,'clipboard'],[/Período|Semestre/i,'calendar'],[/Organização|Como funciona/i,'help'],[/fotografias/i,'image'],[/alunos na turma/i,'users']];
/* ---------- Maiúsculas iniciais coerentes (títulos, menus, botões, separadores, rótulos) ---------- */
const MINUS=new Set('a o e as os de da do das dos em no na nos nas por para com ao à aos às um uma que ou sem até pelo pela'.split(' '));
function tcap(str){let first=true;return str.replace(/[^\s]+/g,w=>{const lw=w.toLowerCase();
  if(!first&&MINUS.has(lw)){return w}first=false;
  return w.replace(/(^|[\/(\-“"'])(\p{Ll})(?=\p{L})/gu,(m,a,b)=>a+b.toUpperCase())})}
const TC_SEL='table.grid thead th:not(.v),.cleg span,.cp b,.pvn span:not(.mut),.kpi .v.tc,#side .lbl,#ttl,#bar .ctx,.oa,.selall,.card h2,.card h3,#drawer h3,#dw-t,.btn,.tabs button,.seg button,table.lst th,table.mx th:not(.v),.ed label:not(.chk),.kpi .l,.sheet .sec,.sheet h1,.sheet th,table.msai tr.sec td,.dica-t b,.sign div';
const TC_SKIP='.mut,.tag,.nt,.cargo,.pill,.art,.mb,.cam,input,select,textarea,option,.hint';
function titulos(root){
  (root||document).querySelectorAll(TC_SEL).forEach(el=>{
    if(el.matches(TC_SKIP))return;
    const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const sk=n.parentElement.closest(TC_SKIP);return sk&&el.contains(sk)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
    let n;while((n=w.nextNode())){const v=n.nodeValue;if(!/\p{L}/u.test(v))continue;const nv=tcap(v);if(nv!==v)n.nodeValue=nv}
  });
}
function acessib(){document.querySelectorAll('table.grid tbody tr[data-a]').forEach(tr=>{const sk=tr.querySelector('.stk');let nm='';if(sk){const cl=sk.cloneNode(true);cl.querySelectorAll('*').forEach(x=>{if(x.isConnected&&x!==cl&&x.textContent.trim().length<=3)x.remove()});cl.querySelectorAll('.tag,.bdg,[aria-hidden=true],sup,small').forEach(x=>x.remove());nm=cl.textContent.replace(/\s+/g,' ')}tr.querySelectorAll('input:not([aria-label])').forEach(inp=>{const c=inp.dataset.c;const th=c!=null?tr.closest('table').querySelectorAll('thead tr:nth-child(2) th')[+c]:null;inp.setAttribute('aria-label',nm.trim()+(th?' — '+th.textContent.trim():''))})});
  document.querySelectorAll('img:not([alt]),img[alt=""]').forEach(im=>{const tr=im.closest('[data-a],[data-fi],.fcard,.mscard,tr');const n=tr&&(tr.querySelector('b,.stk,.nm')||{}).textContent;im.setAttribute('alt',n?'Fotografia de '+n.trim():'Imagem')})}
/* tabelas largas: deslocamento horizontal dentro do cartão (nunca a página inteira) */
function envolverTabelas(){document.querySelectorAll('#view table').forEach(t=>{if(t.closest('.tblw,.gwrap,.mxw,.sheet')||t.parentElement.dataset.ov)return;const p=t.parentElement;
  if(getComputedStyle(p).overflowX!=='visible'){p.dataset.ov=1;return}const w=document.createElement('div');w.className='tblw';p.insertBefore(w,t);w.appendChild(t)})}
document.addEventListener('click',e=>{if(e.target.id==='dwscrim'){closeDrawer();return}{const ro=e.target.closest('[data-ro]');if(ro&&VIEW!=='reunioes'){reuniaoVer(ro.dataset.ro);return}}if(e.target.closest('#barEsc')){go('escola');return}const bb=e.target.closest('#pqBtn,#undoBtn,#apresBtn,#ajBtn,#favBtn');if(bb){({pqBtn:paleta,undoBtn:desfazer,apresBtn:alternarApresentacao,ajBtn:ajudaContexto,favBtn:alternarFavorito})[bb.id]();return}if(e.target.closest('#menuBtn')){document.body.classList.toggle('menu');return}if(e.target.id==='scrim'){document.body.classList.remove('menu')}});
/* ---------- tema: automático / claro / escuro ---------- */
function aplicarTema(){const t=(S.cfg&&S.cfg.tema)||'auto';const r=document.documentElement;if(t==='auto')r.removeAttribute('data-theme');else r.dataset.theme=t;
  const el=document.getElementById('temaSel');if(!el)return;
  el.innerHTML=[['auto','auto','Auto'],['light','sun','Claro'],['dark','moon','Escuro']].map(([k,i,l])=>`<button type="button" data-tema="${k}" class="${t===k?'on':''}" title="Tema ${l.toLowerCase()}" aria-label="Tema ${l.toLowerCase()}">${ic(i,14)}<span>${l}</span></button>`).join('');
  el.querySelectorAll('[data-tema]').forEach(b=>b.onclick=()=>{S.cfg.tema=b.dataset.tema;save();aplicarTema();if(VIEW==='definicoes')go('definicoes')})}
/* ---------- animações subtis: números a contar ao entrar numa secção ---------- */
const REDUZ=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function ajustarBarra(){const b=document.getElementById('bar');if(!b)return;b.classList.remove('bar2');if(innerWidth<=1000)return;const x=document.getElementById('barx');
  const t=document.querySelector('.ttlw #ttl');if(b.scrollWidth>b.clientWidth+1||(x&&x.children.length&&t&&t.scrollWidth>t.clientWidth+1))b.classList.add('bar2')}
addEventListener('resize',()=>{clearTimeout(ajustarBarra._t);ajustarBarra._t=setTimeout(ajustarBarra,80)});

/* ===================== MODO DE APRESENTAÇÃO (v0.26) ===================== */
const APRES_DEF={nomes:'primeiro',fotos:'mostrar',sens:true,prof:true,ocultos:[]};
const apresCfg=()=>(S.cfg.apres=Object.assign({},APRES_DEF,S.cfg.apres||{}));
const APRES_BLOQ=['reunioes','definicoes','escola','meuhorario'];
let APRES_RX=null,APRES_MAP=null;
function apresPrep(){const c=apresCfg();const a=A();const M=new Map();const oc=new Set(c.ocultos||[]);
  if(a){const all=[];a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.nome&&x.nome.trim().length>2)all.push(x)}));
    const ocN=new Set(all.filter(x=>oc.has(x.id)||(x.origemId&&oc.has(x.origemId))).map(x=>normT(x.nome)));
    const byF={};all.forEach(x=>{const f=x.nome.trim().split(/\s+/)[0];(byF[f]=byF[f]||new Set()).add(normT(x.nome))});
    all.forEach(x=>{const nm=x.nome.trim().replace(/\s+/g,' ');const p=nm.split(' ');const h=ocN.has(normT(nm));let d;
      if(h)d='Aluno(a) oculto(a)';else if(c.nomes==='iniciais')d=p.filter(w=>w.length>2||/^[A-ZÁÉÍÓÚ]/.test(w)).map(w=>w[0].toUpperCase()).join('.')+'.';
      else if(c.nomes==='ocultar')d='Aluno(a) n.º '+(x.num||'?');else if(c.nomes==='completo')d=nm;else d=byF[p[0]].size>1&&p.length>1?p[0]+' '+p[p.length-1][0]+'.':p[0];
      const o=M.get(nm);M.set(nm,{d:o&&o.h?o.d:d,h:h||(o&&o.h)})})}
  APRES_MAP=M;const ks=[...M.keys()].filter(k=>M.get(k).d!==k).sort((x,y)=>y.length-x.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));APRES_RX=ks.length?new RegExp(ks.join('|'),'g'):null;
  // alunos ocultos que não são encontrados pelo nome (ex.: só o número) — marcados por id
  apresPrep.ids=oc}
function apresMarcar(el){const box=el.closest('tr,.intr,.fgc,.pnai,.dfa,.sti,.mac,.aniv,.fcard,.mscard,.lin,.cdr,.sheet,.rmini,li,.dimp,.pq-i,.kv');if(box)box.classList.add('apres-oc');else{const d=el.closest('#dw-b');if(d)d.classList.add('apres-oc')}}
function apresAplicar(){if(!document.body.classList.contains('apres'))return;
  document.querySelectorAll('#view [contenteditable="true"],#drawer [contenteditable="true"]').forEach(e=>{e.setAttribute('contenteditable','false');e.dataset.apce=1});
  (apresPrep.ids||new Set()).forEach(id=>document.querySelectorAll(`[data-a="${id}"],tr[data-fi="${id}"],.fcard[data-fi="${id}"],.fgc[data-fi="${id}"],.mscard[data-fi="${id}"]`).forEach(e=>e.classList.add('apres-oc')));
  if(!APRES_RX)return;const RX=APRES_RX,M=APRES_MAP;
  ['#view','#drawer','#toast','#cmenu','#tipbox'].forEach(sel=>{const root=document.querySelector(sel);if(!root)return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&/^(TEXTAREA|SCRIPT|STYLE|OPTION)$/.test(n.parentElement.tagName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const L=[];let n;while(n=w.nextNode()){RX.lastIndex=0;if(RX.test(n.nodeValue))L.push(n)}
    L.forEach(n=>{let h=false;n.nodeValue=n.nodeValue.replace(RX,m=>{const v=M.get(m);if(v.h)h=true;return v.d});if(h&&n.parentElement)apresMarcar(n.parentElement)});
    root.querySelectorAll('[title],[aria-label]').forEach(e=>['title','aria-label'].forEach(at=>{const v=e.getAttribute(at);if(v){RX.lastIndex=0;if(RX.test(v))e.setAttribute(at,v.replace(RX,m=>M.get(m).d))}}));
    root.querySelectorAll('input,textarea').forEach(e=>{const v=(e.value||'').trim().replace(/\s+/g,' ');const m=M.get(v);if(m&&m.d!==v&&!e.dataset.apv){e.dataset.apv=1;e.readOnly=true;e.value=m.d;const wr=e.closest('.nmw');if(wr)wr.dataset.v=m.d;if(m.h)apresMarcar(e)}})})}
function apresClasses(on){const c=apresCfg();const b=document.body.classList;b.toggle('apres',on);b.toggle('apres-sens',on&&c.sens);b.toggle('apres-prof',on&&c.prof);b.toggle('apres-fotos',on&&c.fotos==='ocultar');
  const bt=$('#apresBtn');if(bt)bt.classList.toggle('on',on)}
function alternarApresentacao(){if(document.body.classList.contains('apres')){apresClasses(false);closeDrawer();toast('Modo de apresentação desligado','ok');go(VIEW);return}apresDlg()}
function apresDlg(){const c=apresCfg();const t=T();const al=t?alunosTodos(t):[];const oc=new Set(c.ocultos||[]);
  const op=(k,v,l,d)=>`<button type="button" data-ap="${k}" data-v="${v}" class="${c[k]===v?'on':''}" title="${esc(d||'')}">${l}</button>`;
  openDrawer('Modo de Apresentação',`<div class="ed apdlg">
    <p class="hint" style="margin-top:0">Para projetar na aula sem expor dados pessoais. Nada é alterado nos seus dados — só o que se vê no ecrã.</p>
    <label>Nomes dos alunos</label><div class="seg">${op('nomes','primeiro','Primeiro Nome')}${op('nomes','iniciais','Iniciais')}${op('nomes','ocultar','Só o N.º')}${op('nomes','completo','Completos')}</div>
    <label style="margin-top:12px">Fotografias dos alunos</label><div class="seg">${op('fotos','mostrar','Mostrar')}${op('fotos','ocultar','Desfocar')}</div>
    <label class="chk" style="margin-top:14px"><input type="checkbox" id="ap-sens" ${c.sens?'checked':''}> <span><b>Ocultar dados sensíveis dos alunos</b><br><span class="mut">N.º de processo, data de nascimento e idade, repetência, ASE, medidas (MSAI / DL 54), encarregado de educação e contactos, observações.</span></span></label>
    <label class="chk" style="margin-top:8px"><input type="checkbox" id="ap-prof" ${c.prof?'checked':''}> <span><b>Proteger a informação do professor</b><br><span class="mut">Esconde reuniões e respetivos lembretes, o seu horário, definições e escola, avisos de cópias de segurança, a pesquisa e a troca para outras turmas.</span></span></label>
    ${al.length?`<h3>${ic('user',15)} Alunos a ocultar <span class="mut" style="font-weight:500">— ${esc(t.nome)}</span></h3><p class="hint" style="margin-top:0">Os dados destes alunos ficam totalmente ocultos (nome, notas, fotografia, relatório) — para quem não quer que a turma veja a sua informação.</p>
      <div class="row" style="gap:6px;margin-bottom:6px"><button type="button" class="btn sm" id="ap-nen">Nenhum</button><button type="button" class="btn sm" id="ap-tod">Todos</button></div>
      <div class="apal">${al.map(x=>`<label class="chk"><input type="checkbox" data-apo="${x.id}" ${oc.has(x.id)?'checked':''}> <span><b>${esc(numAl(x))}</b> ${esc(x.nome)}</span></label>`).join('')}</div>`:''}
    <div class="row" style="margin-top:16px"><button class="btn pri" id="ap-ok">${ic('access',15)} Iniciar Apresentação</button></div></div>`);
  $$('[data-ap]').forEach(b=>b.onclick=()=>{c[b.dataset.ap]=b.dataset.v;$$(`[data-ap="${b.dataset.ap}"]`).forEach(x=>x.classList.toggle('on',x===b))});
  const tod=v=>$$('[data-apo]').forEach(x=>x.checked=v);if($('#ap-nen')){$('#ap-nen').onclick=()=>tod(false);$('#ap-tod').onclick=()=>tod(true)}
  $('#ap-ok').onclick=()=>{c.sens=$('#ap-sens').checked;c.prof=$('#ap-prof').checked;
    if(al.length){const ids=new Set(al.map(x=>x.id));c.ocultos=(c.ocultos||[]).filter(id=>!ids.has(id)).concat($$('[data-apo]').filter(x=>x.checked).map(x=>x.dataset.apo))}
    save();closeDrawer();apresPrep();apresClasses(true);if(c.prof&&APRES_BLOQ.includes(VIEW))go('inicio');else go(VIEW);
    const n=al.filter(x=>(c.ocultos||[]).includes(x.id)).length;toast('Modo de apresentação ligado'+(n?' · '+n+(n===1?' aluno oculto':' alunos ocultos'):'')+' — toque no olho para sair','ok')}}
/* ---------- Diretor(a) de turma ---------- */
function dtDe(a,nome){const h=horarioDe(a,nome);return h&&h.diretor||''}
const tituloDT=(nome,cap)=>{const g=nome?guessGen(nome):'';const w=g==='F'?'Diretora de Turma':g==='M'?'Diretor de Turma':'Diretor(a) de Turma';return cap===false?w.toLowerCase():w};
function souDT(a,nome){if(!a)return false;const n=normTurma(nome);if((a.dt||[]).includes(n))return true;const d=dtDe(a,nome);return !!(d&&S.cfg.professor&&mesmoNome(d,S.cfg.professor))}
function minhasDT(a){if(!a)return [];const L=new Set();a.turmas.forEach(t=>turmasDaClasse(t).forEach(n=>{if(souDT(a,n))L.add(n)}));Object.keys(a.horarios||{}).forEach(n=>{if(souDT(a,n))L.add(n)});(a.dt||[]).forEach(()=>{});return [...L].sort((x,y)=>x.localeCompare(y,'pt'))}
function navModular(){const b=document.querySelector('#side [data-v="modulos"]');if(!b)return;const t=T();const on=ehModular(t);b.hidden=!on;b.style.display=on?'':'none';if(on){const U=unidMod(t);b.querySelector('.lbl').textContent=U.p;b.title=U.p;if(VIEW==='modulos')$('#ttl').textContent=U.p+' — '+t.nome+' · '+t.disciplina}}
function sessBox(){const el=document.getElementById('sessBox');if(!el)return;const s=SESSAO;if(!s){el.innerHTML='';return}el.innerHTML=`<span class="sav">${esc((s.nome||s.u||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase())}</span><span class="snm"><b>${esc(s.nome||s.u)}</b><span>${s.tipo==='ms'?'Microsoft 365':esc(s.u)}</span></span><button class="btn sm ico" id="sessOut" title="Terminar sessão" aria-label="Terminar sessão">${ic('back',14)}</button>`;$('#sessOut').onclick=()=>{if(confirm('Terminar a sessão?'))terminarSessao()}}
function reunBadge(){const b=document.getElementById('reunBadge');if(!b)return;const a=A();if(!a){b.hidden=true;return}const hj=isoData(new Date());
  const n=reunioes(a).filter(r=>reunAtiva(r)&&r.data===hj&&reunFim(r)>Date.now()).length;const e=avisosReunioes(a).filter(v=>v.g==='erro').length;
  b.hidden=!(n||e);b.textContent=n||'!';b.className='nbadge'+(n?'':' bad');b.title=n?n+' reunião(ões) hoje':e+' aviso(s)'}
function animarNumeros(){if(REDUZ()||document.documentElement.classList.contains('a11y-rm'))return;const els=[...document.querySelectorAll('#view .kpi .v, #view .ringc b, #view .pvn b, #view .dimd .dd')].filter(e=>/^\d{1,4}$/.test(e.textContent.trim())&&!e.children.length).slice(0,24);
  els.forEach(e=>{const fim=+e.textContent.trim();if(fim<2)return;const t0=performance.now(),dur=Math.min(900,380+fim*6);e.textContent='0';
    e.setAttribute('aria-label',String(fim));const passo=t=>{if(e.dataset.vivo){e.removeAttribute('aria-label');return}const k=Math.min(1,(t-t0)/dur),ease=1-Math.pow(1-k,3);e.textContent=String(Math.round(fim*ease));if(k<1)requestAnimationFrame(passo);else e.removeAttribute('aria-label')};requestAnimationFrame(passo)})}
function decorar(root){
  titulos(root);envolverTabelas();acessib();try{apresAplicar()}catch(_){}
  (root||document).querySelectorAll('.btn:not([data-dec]),.card h2:not([data-dec]),#drawer .dwh b:not([data-dec])').forEach(el=>{
    el.dataset.dec=1;if(el.querySelector('svg'))return;
    const txt=el.textContent.trim();const L=el.tagName==='H2'||el.tagName==='B'?IC_H:IC_BTN;
    const m=L.find(([r])=>r.test(txt));if(!m)return;
    if(el.tagName==='BUTTON'&&/^[+←↻×⇄]\s*/.test(txt)&&el.firstChild&&el.firstChild.nodeType===3)el.firstChild.textContent=el.firstChild.textContent.replace(/^[+←↻⇄]\s*/,'');
    if(el.tagName==='BUTTON'&&txt==='×'){el.innerHTML=ic(m[1],14);return}
    el.insertAdjacentHTML('afterbegin',ic(m[1],el.tagName==='H2'?17:15)+' ');
  });
}
function barBtns(arr){$('#barx').innerHTML=arr.map(b=>`<button class="btn ${b.c||''}" id="${b.id}">${b.t}</button>`).join('');arr.forEach(b=>$('#'+b.id).onclick=b.f)}

/* =====================================================================
   INÍCIO
   ===================================================================== */
function vInicio0(){
  const c=S.cfg,a=A();const TF=turmasFiltradas(a);
  const hojeAulas=a?proximasAulas(TF.flatMap(t=>aulasTurma(t,a).map(x=>({...x,t}))),40).filter(p=>p.k===0):[];
  const passos=[
    {ok:!!(c.escola&&c.professor),t:'Preencher escola e professor',v:'definicoes'},
    {ok:S.anos.length>0,t:'Criar o ano letivo',v:'turmas'},
    {ok:!!a&&minhasDisc().length>0,t:'Escolher as disciplinas que leciona neste ano letivo',v:'turmas'},
    {ok:!!(a&&a.turmas.length),t:'Criar as turmas (importando o Excel com as fotos)',v:'turmas'},
    {ok:!!(a&&a.turmas.some(t=>t.alunos.length)),t:'Assinalar os alunos que frequentam a sua disciplina',v:'alunos'}
  ];
  const tudo=passos.every(p=>p.ok);
  $('#view').innerHTML=`<div class="inlay"><div class="in-hero">${heroEscola(a)}</div>${ladoInicio(a)}<div class="in-main">
  ${lembreteCopia()}${cartaoMatrizes(a)}${cartoesInicioAval(a)}
  ${!tudo?`<div class="card"><h2>Primeiros passos</h2><ol class="steps">${passos.map((p,i)=>`<li class="${p.ok?'done':''}"><span class="sp1">${esc(p.t)}</span>${p.ok?'':`<button class="btn sm ${passos.findIndex(x=>!x.ok)===i?'pri':''}" data-go="${p.v}">Abrir</button>`}</li>`).join('')}</ol></div>`:''}
  ${a?cartaoCalendario(a):''}
  ${a&&hojeAulas.length?`<div class="card"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">Hoje · ${esc(DIAS[new Date().getDay()])}</h2><span class="sp1"></span><button class="btn sm" data-go="meuhorario">O meu horário</button></div>
    ${hojeAulas.map(p=>`<button class="lin hjl ${p.agora?'now':''}" data-t="${p.t.id}"><span class="hh">${fmtHM(p.ini)}–${fmtHM(p.fim)}</span>${anoBadge(p.t,'sm')}<b>${esc(p.t.nome)}</b> ${esc(p.t.disciplina)}${p.sala?`<span class="mut">Sala ${esc(p.sala)}</span>`:''}${ofertaTag(p.t)}${p.agora?'<span class="tag now">agora</span>':''}</button>`).join('')}</div>`:''}
  ${a?`<div class="card"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Ano letivo ${esc(a.nome)}</h2><span class="sp1"></span></div>
    ${TF.length?gruposOferta(TF).map(g=>`<h3 class="gof"><span class="dot" style="background:${OFERTAS[g.k].cor}"></span>${esc(g.nome)} <span class="mut">· ${g.L.length} turma${g.L.length>1?'s':''}</span></h3><div class="tcards">${g.L.map(t=>{const al=alunosAval(t);const ns=al.map(x=>ponderada(t,pctsFinal(t,x.id,perAtual(t))));const v=ns.filter(x=>x!=null);const neg=ns.filter(x=>negativa(t,x)).length;const px=proximasAulas(aulasTurma(t,a),1,null,t)[0];
      return `<button class="tcard ${t.id===S.turmaAtiva?'on':''} ${ofertaDe(t)}" data-t="${t.id}"><div class="tch">${anoBadge(t,'lg')}<div class="tchn"><b><span class="tnm">${esc(t.nome)}</span>${t.origens?' <span class="tag">conjunta</span>':''}${ofertaTag(t)}</b><div class="d">${icDisc(t.disciplina,14)} ${esc(t.disciplina)}</div></div><span class="sp1"></span>${sparkTurma(t)}</div>
      <div class="s">${(()=>{const pt=proxTeste(t,a);return pt?`<span class="tcpt">${ic('target',13)} ${esc(pt.i.nome)} · ${esc(fmtIso(pt.i.data))}${pt.aulas?' · '+pt.aulas+' aula'+(pt.aulas>1?'s':'')+' antes':''}</span><br>`:''})()}${ic('users',13)} ${(()=>{const n=al.filter(y=>typeof foraEm==='function'&&foraEm(y)).length;return (al.length-n)+' alunos na disciplina'+(n?' (+'+n+' transferido'+(n>1?'s':'')+')':'')})()}${t.alunos.length!==al.length?' (de '+t.alunos.length+' na turma)':''}<br>${ic('clipboard',13)} ${t.instrumentos.length} instrumento${t.instrumentos.length===1?'':'s'} · ${v.length?'média '+fmtNota(t,avg(v)):'sem avaliações'}${neg?` · <span class="neg">${neg} negativa${neg>1?'s':''}</span>`:''}${px?`<br><span class="${px.agora?'neg':''}" style="${px.agora?'color:var(--ok)':''}">${ic('calendar',13)} ${esc(quando(px))}</span>`:''}</div></button>`}).join('')}</div>`).join(''):`<div class="empty">${S.filtroOferta?'Sem turmas de '+OFERTAS[S.filtroOferta].nome+' neste ano letivo.':'Ainda sem turmas neste ano letivo.'}</div>`}
  </div>`:''}</div></div>`;
  iniciarContagem();{const cp=$('#cp-agora');if(cp)cp.onclick=()=>exportarCopia({})}
  $$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
  $$('[data-tst]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.tst;save();go('testes')});
  $$('[data-t]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.t;UI.alView='lista';save();go('alunos')});
  $$('.tcard[data-t]').forEach(b=>longoToque(b,(x,y)=>{const id=b.dataset.t;const ir=v=>()=>{S.turmaAtiva=id;save();go(v)};menuContexto(x,y,[{t:'Alunos',ic:'users',f:ir('alunos')},{t:'Horário',ic:'calendar',f:ir('horario')},{t:'Marcação de Testes',ic:'target',f:ir('testes')},{t:'Instrumentos',ic:'clipboard',f:ir('instrumentos')},{t:'Avaliação Final',ic:'grad',f:ir('avaliacao')},'-',{t:'Editar Turma',ic:'pencil',f:()=>editarTurmaDlg(A().turmas.find(q=>q.id===id))}])}));
}
const perAtual=t=>{const p=periodoDe();if(p&&CAL())return Math.min(p,periodos().length);return Math.max(1,...t.instrumentos.map(i=>+i.periodo||1))};

