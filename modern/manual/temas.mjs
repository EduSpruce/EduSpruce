import {abrirApp} from './lib.mjs';import {readFileSync,mkdirSync} from 'node:fs';
const T={sge:'SGE',institucional:'Institucional',ios27:'Vidro',coral:'Coral',social:'Social',gradiente:'Gradiente',academico:'Académico'};
const R='mwallw5c8pkji',PF='mwallw5c14run',PR='mwallw5c3yznz';
const G=(v,t=R)=>`(()=>{UI.arEd=null;UI.pvEd=null;UI.puEd=null;UI.fmId=null;S.turmaAtiva='${t}';go('${v}');document.getElementById('view').scrollTo(0,0);return 1})()`;
const tab=(sel,t)=>`(()=>{const b=[...document.querySelectorAll('${sel}')].find(x=>x.innerText.trim().replace(/\\s+/g,' ').startsWith(${JSON.stringify(t)}));if(!b)throw new Error('tab '+${JSON.stringify(t)});b.click();return 1})()`;
const D=t=>[G('definicoes'),tab('#main .deftabs button',t)];
const V={inicio:[G('inicio')],alunos:[G('alunos'),tab('#main .tabs button','Lista')],msai:[G('alunos'),tab('#main .tabs button','Quadro MSAI')],aparencia:D('Aparência'),auditoria:D('Auditoria'),conta:D('Conta e Acesso'),prof:D('Professor'),sync:D('Conta e Dados'),menulateral:D('Menu Lateral'),definicoes:D('Geral'),
avaliacao:[G('avaliacao')],calendario:[G('calendario'),tab('#main .tabs button','Calendário')],cprofij:[G('cprofij')],direcao:[G('direcao'),tab('#main .dttabs button','Painel')],documentos:[G('documentos'),tab('#main .tabs button','Novo')],horario:[G('horario')],instrumentos:[G('instrumentos')],jornal:[G('jornal')],meuhorario:[G('meuhorario')],oral:[G('oral')],planta:[G('planta')],recursos:[G('recursos')],reunioes:[G('reunioes')],sprucenote:[G('sprucenote')],sumarios:[G('sumarios')],tarefas:[G('tarefas')],testes:[G('testes')],
meucal:[G('meucal'),tab('#main .ocvis button','Semana de trabalho')],provas:[G('provas')],provasav:[`(UI.pvEd={k:'av',id:PV().av.find(a=>/Unidade 2/.test(a.titulo)).id},UI.pvAt='ex',go('provas'),1)`],forms:[G('forms')],arena:[`(UI.arEd=arD().conj[0].id,go('arena'),1)`],pulso:[G('pulso'),tab('#main .putabs button','Quizzes')],analise:[G('analise')],aula:[G('aula')],painel:[G('painel')],dominios:[G('dominios')],criterios:[G('criterios')],relatorios:[G('relatorios')],intercalar:[G('intercalar')],escola:[G('escola')],modulos:[G('modulos',PR)],precup:[G('precup',PF)],sorteio:[G('sorteio')],contactos:[G('contactos')],turmas:[G('turmas')]};
const so=process.argv[2]?process.argv[2].split(','):Object.keys(T);
for(const t of so){const {b,pg,E}=await abrirApp({width:1100,height:692});await pg.setViewportSize({width:1100,height:692});
 await E(readFileSync('seed.js','utf8'));
 await E(G('definicoes'));await pg.waitForTimeout(300);await E(tab('#main .deftabs button','Aparência'));await pg.waitForTimeout(300);
 await E(`(()=>{const b=document.querySelector('#main button[data-v="${t}"]');if(!b)throw new Error('sem estilo ${t}');b.click();return 1})()`).catch(e=>console.log(String(e).slice(0,120)));
 await pg.waitForTimeout(800);
 await E(`(()=>{const m=document.getElementById('menuTgl');if(m&&!document.body.classList.contains('menu-fixo'))m.click();return 1})()`);await pg.waitForTimeout(500);
 mkdirSync('temas/'+t,{recursive:true});
 for(const [n,st] of Object.entries(V)){try{for(const s of st){await E(s);await pg.waitForTimeout(400)}await pg.waitForTimeout(500);await pg.screenshot({path:`temas/${t}/${n}.png`})}catch(e){console.log(t,n,String(e).slice(0,100))}}
 console.log(t,await E('document.body.className'));await b.close()}
