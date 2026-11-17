import {shot,fim,E,pg} from './cap.mjs';
const G=v=>`(UI.arEd=null,UI.pvEd=null,go('${v}'),document.getElementById('view').scrollTo(0,0),1)`;
const P=process.env.P;
await shot(P+'-inicio',[G('inicio'),800]);
await shot(P+'-aula',[`(S.turmaAtiva='mwallw5c8pkji',go('aula'),1)`,800]);
await shot(P+'-alunos',[G('alunos'),800]);
await shot(P+'-meuhorario',[G('meuhorario'),800]);
await shot(P+'-menu',[G('inicio'),`(()=>{const b=document.querySelector('#mbMenu,#hamb,.hamb,[aria-label="Menu"],#railTgl');b&&b.click();return 1})()`,800]);
await fim();
