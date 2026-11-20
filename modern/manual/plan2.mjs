import {shot,fim,E,pg} from './cap.mjs';
const G=v=>`(UI.arEd=null,UI.pvEd=null,go('${v}'),document.getElementById('view').scrollTo(0,0),1)`;
const TT=(id,v)=>`(S.turmaAtiva='${id}',UI.arEd=null,go('${v}'),document.getElementById('view').scrollTo(0,0),1)`;
const R='mwallw5c8pkji',PF='mwallw5c14run',PR='mwallw5c3yznz';
const tab=(sel,t)=>`(()=>{const b=[...document.querySelectorAll('${sel}')].find(x=>x.innerText.trim().replace(/\\s+/g,' ').startsWith(${JSON.stringify(t)}));if(!b)throw new Error('tab '+${JSON.stringify(t)});b.click();return 1})()`;
// turma
await shot('painel',[TT(R,'painel')]);
await shot('painel-baixo',[TT(R,'painel'),'S:800']);
await shot('painel-completa',[TT(R,'painel'),'@A Turma Completa',800]);
await shot('alunos',[TT(R,'alunos')]);
await shot('alunos-fotos',[TT(R,'alunos'),'@Fotografias',700]);
await shot('alunos-msai',[TT(R,'alunos'),'@Quadro MSAI',700]);
await shot('alunos-ficha',[TT(R,'alunos'),'@Lista','@Ficha',900]);
await shot('alunos-mais',[TT(R,'alunos'),'#click #barmais',500]);
await shot('planta',[TT(R,'planta')]);
await shot('horario',[TT(R,'horario')]);
await shot('aula',[TT(R,'aula')]);
await shot('aula-baixo',[TT(R,'aula'),'S:700']);
await shot('sumarios',[TT(R,'sumarios')]);
await shot('sumarios-faltei',[TT(R,'sumarios'),'@Faltei',700]);
await shot('sumarios-substituicao',[TT(R,'sumarios'),'@Substituição',700]);
await shot('sorteio',[TT(R,'sorteio')]);
await shot('sorteio-aluno',[TT(R,'sorteio'),'@1 Aluno',2500]);
await shot('criterios',[TT(R,'criterios')]);
await shot('criterios-baixo',[TT(R,'criterios'),'S:800']);
await shot('criterios-baixo2',[TT(R,'criterios'),'S:1600']);
await shot('testes',[TT(R,'testes')]);
await shot('testes-baixo',[TT(R,'testes'),'S:800']);
await shot('instrumentos',[TT(R,'instrumentos')]);
await shot('instrumentos-abrir',[TT(R,'instrumentos'),'@Abrir',1200]);
await shot('instrumentos-abrir-baixo',[TT(R,'instrumentos'),'@Abrir',1200,'S:700']);
await shot('oral',[TT(R,'oral')]);
await shot('oral-novo',[TT(R,'oral'),'@Novo Momento',800]);
await shot('dominios',[TT(R,'dominios')]);
await shot('dominios-baixo',[TT(R,'dominios'),'S:800']);
for(const t of ['Por Domínio','Por Instrumento','Por Turma','Por Aluno','Dificuldades'])await shot('analise-'+t.replace(/ /g,'_'),[TT(R,'analise'),tab('#main .antabs button',t),900]);
await shot('intercalar',[TT(R,'intercalar')]);
await shot('intercalar-editar',[TT(R,'intercalar'),'@Editar Todos',800]);
await shot('avaliacao',[TT(R,'avaliacao')]);
await shot('avaliacao-direita',[TT(R,'avaliacao'),`(()=>{const w=document.querySelector('#view .tblw, #view .tablewrap');if(w)w.scrollLeft=900;return 1})()`]);
await shot('avaliacao-autoav',[TT(R,'avaliacao'),'@Autoavaliação',900]);
await shot('relatorios',[TT(R,'relatorios'),1500]);
// profissional / profij
await shot('modulos',[TT(PR,'modulos')]);
await shot('modulos-baixo',[TT(PR,'modulos'),'S:800']);
await shot('mra',[TT(PR,'mra')]);
await shot('precup',[TT(PF,'precup')]);
await shot('painel-profij',[TT(PF,'painel')]);
await shot('avaliacao-profij',[TT(PF,'avaliacao')]);
await shot('avaliacao-prof',[TT(PR,'avaliacao')]);
await shot('instrumentos-prof',[TT(PR,'instrumentos')]);
await E(`(S.turmaAtiva='${R}',1)`);
// coordenação profij
for(const [k,p] of [['0','Legislação'],['1','Criação do Curso'],['2','Dia a Dia'],['3','Avaliação']]){
  await shot('cprofij-f'+k,[G('cprofij'),`(()=>{const b=[...document.querySelectorAll('#main button')].find(x=>x.innerText.includes(${JSON.stringify(p)})&&/^${k}/.test(x.innerText.trim()));b.click();return 1})()`,900]);
  const subs=JSON.parse(await E(`JSON.stringify([...document.querySelectorAll('#main .cptabs button')].map(b=>b.innerText.trim().replace(/\\s+/g,' ')))`).catch(()=>'[]'));
  for(const s of subs)await shot('cprofij-f'+k+'-'+s.replace(/[^A-Za-zÀ-ú0-9]+/g,'_').slice(0,30),[tab('#main .cptabs button',s),900],{keep:true});
}
await shot('cprofij-pautas',[G('cprofij'),'@Pautas Oficiais',900]);
// definições
for(const t of ['Geral','Os Meus Módulos','Professor','Domínios e Ponderações','Aparência','Menu Lateral','Segurança','Conta e Dados','Notificações','Changelog']){
  const id='def-'+t.replace(/ /g,'_');await shot(id,[G('definicoes'),tab('#main .deftabs button',t),800]);
  await shot(id+'-2',['S:820'],{keep:true});await shot(id+'-3',['S:1640'],{keep:true});}
await shot('ajuda',[G('ajuda')]);
await shot('ajuda-novidades',[G('ajuda'),'?@Novidades',800]);
await fim();
