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
let S=(()=>{if(window.__ES_OFF){try{return migrate(JSON.parse(JSON.stringify(window.__ES_OFF.estado)))}catch(e){console.error(e)}}try{const v=localStorage.getItem(KEY);if(v)return migrate(JSON.parse(v))}catch(e){console.error("EduSpruce: erro ao ler os dados",e);ERRO_CARGA=true}return vazio()})();
let saveT;function save(){if(window.__ES_OFF)return;clearTimeout(saveT);estadoGuardar('pend');saveT=setTimeout(saveNow,150)}
/* guardar: localStorage + IndexedDB (cópia principal para turmas grandes), histórico para Anular e cópia de recuperação diária */
const HIST=[];let _ultimoJ=null,_semHist=false;
function saveNow(){clearTimeout(saveT);if(window.__ES_OFF){try{estadoGuardar('ok')}catch(_){}return}let j;try{arrumarFotos();S._ts=Date.now();j=JSON.stringify(S)}catch(e){return}
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
const FOTOS={};let IDB=null;if(window.__ES_OFF)Object.assign(FOTOS,window.__ES_OFF.fotos||{});
function idbAbrir(){if(window.__ES_OFF)return Promise.resolve(null);return new Promise(ok=>{setTimeout(()=>ok(null),2500);try{const r=indexedDB.open('edugest',2);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('fotos'))db.createObjectStore('fotos');if(!db.objectStoreNames.contains('estado'))db.createObjectStore('estado')};r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null);r.onblocked=()=>ok(null)}catch(e){ok(null)}})}
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
const anoBadge=(t,cls)=>t?`<span class="anob c-${ofertaDe(t)==='profij'?'profij':t.ciclo||'sec'} ${cls||''} ${badgeCod(t)?'cod'+(badgeCod(t).length>3?' l'+Math.min(badgeCod(t).length,6):''):''}" style="--bc:${t.id?corTurma(t.id):''}" title="${esc(badgeCod(t)?'Código '+badgeCod(t)+' · '+(t.anoEsc||''):t.anoEsc||'')}">${esc(badgeCod(t))||anoNum(t)}</span>`:'';
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

