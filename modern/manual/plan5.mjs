import {shot,fim,E,pg} from './cap.mjs';
const G=v=>`(UI.arEd=null,UI.pvEd=null,go('${v}'),document.getElementById('view').scrollTo(0,0),1)`;
const tab=(sel,t)=>`(()=>{const b=[...document.querySelectorAll('${sel}')].find(x=>x.innerText.trim().replace(/\\s+/g,' ').startsWith(${JSON.stringify(t)}));if(!b)throw new Error('tab '+${JSON.stringify(t)});b.click();return 1})()`;
for(const t of ['Conta e Dados','Notificações','Menu Lateral']){const id='def-'+t.replace(/ /g,'_');await shot(id,[G('definicoes'),tab('#main .deftabs button',t),800]);await shot(id+'-2',['S:820'],{keep:true});await shot(id+'-3',['S:1640'],{keep:true});}
await shot('menu-nomes',[G('inicio'),'#click #railTgl',700]);
await shot('menu-icones',['#click #railTgl',G('inicio')]);
await shot('inicio-simples',[G('inicio')]);
await fim();
