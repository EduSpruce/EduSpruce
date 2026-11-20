import {shot,fim,E,pg} from './cap.mjs';
const G=v=>`(UI.arEd=null,UI.pvEd=null,go('${v}'),document.getElementById('view').scrollTo(0,0),1)`;
const tab=(sel,t)=>`(()=>{const b=[...document.querySelectorAll('${sel}')].find(x=>x.innerText.trim().replace(/\\s+/g,' ').startsWith(${JSON.stringify(t)}));if(!b)throw new Error('tab '+${JSON.stringify(t)});b.click();return 1})()`;
// Spruce It!
await shot('arena',[G('arena')]);
await shot('arena-editor',[`(UI.arEd=arD().conj[0].id,go('arena'),1)`,900]);
await shot('arena-editor-baixo',['S:700'],{keep:true});
await shot('arena-importar',[G('arena'),'@Importar CSV/Excel',700]);
await shot('arena-jogos',[G('arena'),tab('#main .artabs button','Jogos'),800]);
await shot('arena-jogar',[G('arena'),tab('#main .artabs button','Conjuntos'),'?@Jogar',1000]);
// Spruce Live
await shot('pulso',[G('pulso')]);
await shot('pulso-quizzes',[G('pulso'),tab('#main .putabs button','Quizzes'),800]);
await shot('pulso-quiz-abrir',[G('pulso'),tab('#main .putabs button','Quizzes'),'?@Editar','?@Abrir',900]);
await shot('pulso-relatorios',[G('pulso'),tab('#main .putabs button','Relatórios'),800]);
await shot('pulso-nova-sala',[G('pulso'),tab('#main .putabs button','Salas'),'@Nova Sala',800]);
await shot('pulso-banco',[G('arena'),'?@Banco',800]);
// Spruce Forms
await shot('forms',[G('forms')]);
await shot('forms-novo',[G('forms'),'?@Novo',800]);
await shot('forms-editor',[G('forms'),`(()=>{const c=[...document.querySelectorAll('#main .fmcard, #main [data-f], #main .card')].find(x=>/Inquérito/.test(x.innerText));if(!c)throw new Error('sem card');(c.querySelector('button,a')||c).click();return 1})()`,1000]);
await shot('forms-editor-2',['S:700'],{keep:true});
await shot('forms-quiz',[G('forms'),`(()=>{const c=[...document.querySelectorAll('#main .fmcard, #main [data-f], #main .card')].find(x=>/Mini-teste/.test(x.innerText));if(!c)throw new Error('sem card');(c.querySelector('button,a')||c).click();return 1})()`,1000]);
// Spruce Exam
await shot('provas-inicio',[G('provas')]);
for(const t of ['Explorar','Avaliações','Exercícios','Rubricas','Grupos','Ajuda'])await shot('provas-'+t,[G('provas'),tab('#main button, #main a',t),900]);
await shot('provas-av-editor',[`(UI.pvEd={k:'av',id:PV().av.find(a=>/Unidade 2/.test(a.titulo)).id},UI.pvAt='ex',go('provas'),1)`,1100]);
await shot('provas-av-editor-2',['S:700'],{keep:true});
for(const t of ['Definições','Agendar','Atividade','Estatísticas','Resultados','Pré-visualizar'])await shot('provas-av-'+t,[`(UI.pvEd={k:'av',id:PV().av.find(a=>/Unidade 2/.test(a.titulo)).id},go('provas'),1)`,800,'@'+t,900]);
await shot('provas-importar',[`(UI.pvEd=null,go('provas'),1)`,tab('#main button','Início'),'@Importar Avaliação',800]);
await shot('provas-tipo',[`(UI.pvEd=null,go('provas'),1)`,tab('#main button, #main a','Exercícios'),'?@Novo Exercício','?@Criar Exercício',900]);
await shot('provas-ex-editor',[`(UI.pvEd={k:'ex',id:PV().ex[0].id},go('provas'),1)`,1000]);
await fim();
