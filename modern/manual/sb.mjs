import {abrirApp} from './lib.mjs';
const {b,pg,E}=await abrirApp({width:1440,height:1500});
await E(`(S.turmaAtiva='mwallw5c8pkji',go('alunos'),1)`);await pg.waitForTimeout(1200);
const w=await E(`Math.round(document.querySelector('#side,#nav,aside,nav').getBoundingClientRect().width)`).catch(()=>240);
await pg.screenshot({path:'capN/menu-nomes.jpg',type:'jpeg',quality:80,clip:{x:0,y:0,width:w,height:1500}});console.log(w);await b.close();
