import {shot,fim,E,pg} from './cap.mjs';
const R0=`UI.arEd=null;UI.pvEd=null;UI.puEd=null;UI.puVivo=null;UI.puRel=null;UI.fmId=null;UI.fmTab=null;`;
const R='mwallw5c8pkji',PF='mwallw5c14run',PR='mwallw5c3yznz';
const G=(v,t)=>`(()=>{${R0}${t?`S.turmaAtiva='${t}';`:''}go('${v}');document.getElementById('view').scrollTo(0,0);return 1})()`;
const ID=id=>`(document.getElementById('${id}').click(),1)`;
const MAIS=`(document.getElementById('barmais').click(),1)`;
const tab=(sel,t)=>`(()=>{const b=[...document.querySelectorAll('${sel}')].filter(x=>x.getClientRects().length).find(x=>x.innerText.trim().replace(/\\s+/g,' ').startsWith(${JSON.stringify(t)}));if(!b)throw new Error('tab '+${JSON.stringify(t)});b.click();return 1})()`;
// Apps
await shot('hub',[G('hub'),900]);
await shot('hub-baixo',[G('hub'),'S:760']);
await shot('hub-personalizar',[G('hub'),tab('#main button','Personalizar'),800]);
await shot('inicio-apps',[G('inicio'),tab('#main button','Todas as apps'),800]);
await shot('novidades',[G('inicio'),`(novidadesDesde('1.148'),1)`,1200]);
// boas-vindas
for(const k of ['spruceit','pulso','forms','provas'])await shot('bv-'+k,[G('inicio'),`(bvAbrir('${k}'),1)`,2600]);
await shot('bv-sprucenote',[G('sprucenote'),ID('mq-demo'),2600]);
// Spruce It
await shot('arena',[G('arena'),900]);
await shot('arena-baixo',[G('arena'),'S:700']);
await shot('arena-jogos',[G('arena'),tab('#main button','Jogos e relatórios'),900]);
await shot('arena-como',[G('arena'),tab('#main button','Como Funciona'),900]);
await shot('arena-lancar',[G('arena'),tab('#main button','Lançar'),1200]);
await shot('arena-lancar-baixo',['S:600',`(()=>{const d=document.querySelector('#drawer .dwb, #drawer .body, #drawer');if(d)d.scrollTop=700;return 1})()`],{keep:true});
await shot('arena-atribuir',[G('arena'),tab('#main button','Atribuir'),1000]);
await shot('arena-novo',[G('arena'),ID('ars-novo'),900]);
await shot('arena-mais',[G('arena'),MAIS,600]);
// Pulso: criar sala
await shot('pulso-vazio',[G('pulso')]);
await shot('pulso-nova-sala',[G('pulso'),ID('pu-ns'),900],{keep:true});
await E(`(()=>{const i=[...document.querySelectorAll('input')].filter(x=>x.getClientRects().length&&(!x.type||x.type=='text'))[0];if(i){i.value='7.º A · Inglês';i.dispatchEvent(new Event('input',{bubbles:true}))}const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^(Guardar|Criar)/.test(x.innerText.trim()));b&&b.click();return 1})()`).catch(e=>console.log('sala',e));
await pg.waitForTimeout(800);
await shot('pulso-salas',[G('pulso'),900]);
await shot('pulso-quizzes',[G('pulso'),tab('#main button','Quizzes'),800]);
await shot('pulso-lancar',[G('pulso'),tab('#main button','Quizzes'),tab('#main button','Lançar'),1100]);
await shot('pulso-relatorios',[G('pulso'),tab('#main button','Relatórios'),800]);
// Formulários
await shot('forms',[G('forms'),900]);
await shot('forms-modelo',[G('forms'),tab('#main button','Feedback'),1000]);
await shot('forms-importar',[G('forms'),ID('fmc-i'),900]);
await shot('forms-banco',[G('forms'),ID('fmc-bc'),900]);
// SpruceNote
await shot('sprucenote',[G('sprucenote'),900]);
await shot('sprucenote-modelos',[G('sprucenote'),ID('mqm-md'),900]);
await shot('sprucenote-mais',[G('sprucenote'),ID('mq-more'),700]);
// organização
await shot('turmas-fechar',[G('turmas'),ID('b-na'),900]);
await shot('calendario-editar',[G('calendario'),MAIS,'?@Editar Dias',800]);
await shot('calendario-mais',[G('calendario'),MAIS,600]);
await shot('horario-profij',[G('horario',PF),900]);
await shot('horario-profij-baixo',[G('horario',PF),'S:700']);
await shot('reunioes-nova',[G('reunioes'),MAIS,'?@Nova Reunião',900]);
await shot('reunioes-mais',[G('reunioes'),MAIS,600]);
await shot('contactos-mais',[G('contactos'),MAIS,600]);
await shot('alunos-ficha',[G('alunos',R),`(document.querySelector('#main [aria-label="Ficha do aluno"],#main [title="Ficha do aluno"]').click(),1)`,1000]);
await shot('sorteio-aluno',[G('sorteio',R),tab('#main button','🎯'),2600]);
await shot('direcao-mais',[G('direcao'),MAIS,600]);
await fim();
