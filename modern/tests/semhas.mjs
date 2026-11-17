// A versão publicada troca as regras «A:has(B)» das folhas de estilos por classes (modern/scripts/semhas.mjs), porque o :has() no
// topo da página obrigava a recalcular o estilo de tudo em cada navegação. Este teste confirma, em todas as vistas, que as classes
// postas pelo programa do cabeçalho coincidem com a condição verdadeira (consultada com :has() a sério).
//   uso: node modern/tests/semhas.mjs PASTA_DA_VERSÃO_COM_BASE_DE_DADOS      (o ./es testa corre-o)
import {servir,navegador,pagina,SESSAO_INIT} from './servidor.mjs';
const dir=process.argv[2];if(!dir){console.error('uso: node semhas.mjs PASTA');process.exit(1)}
const s=await servir(dir);const b=await navegador();let mal=[],n=0,cond=0,ativas=new Set();
for(const vp of [{width:1366,height:768},{width:390,height:844}]){const P=await pagina(b,{vp,init:SESSAO_INIT});const pg=P.pg;
  await pg.goto(s.url);await pg.waitForFunction(()=>window.__esPronto===true,null,{timeout:30000});await pg.waitForTimeout(600);
  const fecha=()=>pg.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(_){}d.remove()})});await fecha();await pg.evaluate(()=>window.EduGest.t.demo());await pg.waitForTimeout(1500);await fecha();
  const ver=async (onde,tent=0)=>{/* o programa junta as mudanças seguidas e revê uma vez por imagem: espera-se que acabe (sem o forçar) */await pg.waitForTimeout(130);const r=await pg.evaluate(()=>{const sc=[...document.scripts].find(x=>x.textContent.includes('window.__ehS'));if(!sc)return null;const E=JSON.parse(sc.textContent.match(/const E=(\[\[.*?\]\]),P=/)[1]);const mal=[],at=[];
      for(const [q,c] of E){const A=new Set(document.querySelectorAll(q)),B=new Set(document.querySelectorAll('.'+c));if(A.size)at.push(c);if(A.size!==B.size||[...A].some(e=>!B.has(e)))mal.push(q+' (condição em '+A.size+', classe em '+B.size+')')}return {mal,at,n:E.length}});
    if(!r){mal.push('o programa das classes não está na página');return}cond=r.n;n++;r.at.forEach(c=>ativas.add(c));/* uma diferença só conta se persistir: a vista pode ter mudado mesmo agora e a revisão estar marcada para a imagem seguinte */if(r.mal.length&&tent<3){n--;await pg.waitForTimeout(250);return ver(onde,tent+1)}r.mal.forEach(m=>mal.push(onde+': '+m))};
  for(const v of await pg.evaluate(()=>window.EduGest.t.vistas())){try{await pg.evaluate(v=>window.EduGest.t.go(v),v)}catch(_){}await pg.waitForTimeout(v==='eduschedule'?1500:220);await ver(v)}
  await P.ctx.close()}
await b.close();await s.fechar();
console.log('estilos sem :has(): '+cond+' condições mantidas por classes · '+n+' verificações em todas as vistas (computador e telemóvel) · '+ativas.size+' condições chegaram a estar ativas');
if(mal.length){console.log('erros: '+mal.length+'\n  '+[...new Set(mal)].slice(0,12).join('\n  '));process.exit(1)}console.log('erros: 0');
