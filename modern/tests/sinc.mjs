// Dois aparelhos na mesma conta (base de dados falsa): o que um grava chega ao outro sozinho, nos dois sentidos,
// e com a app parada quase não há pedidos (só a pergunta leve do «sinal») nem gravações.
//   uso: node modern/tests/sinc.mjs PASTA_CONSTRUÍDA      (o ./es testa faz tudo)
import {servir,navegador,pagina,SESSAO_INIT} from './servidor.mjs';
const dir=process.argv[2];if(!dir){console.error('uso: node sinc.mjs PASTA');process.exit(1)}
const s=await servir(dir);const b=await navegador();const falhas=[];let passo='arranque';
const T=(pg,f,...a)=>pg.evaluate(([f,a])=>window.EduGest.t[f](...a),[f,a]);
const fechar=pg=>pg.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(_){}d.remove()})});
const abrir=async rt=>{const P=await pagina(b,{init:SESSAO_INIT+(rt?';window.__rtModo='+JSON.stringify(rt):'')});await P.pg.goto(s.url);await P.pg.waitForFunction(()=>window.__esPronto===true,null,{timeout:30000});await P.pg.waitForTimeout(800);await fechar(P.pg);return P};
const nome=pg=>pg.evaluate(()=>{const S=window.EduGest.t.S();const a=S.anos.find(x=>x.turmas.length);return a.turmas[0].nome});
const mudar=(pg,n)=>pg.evaluate(n=>{const t=window.EduGest.t;const S=t.S();const a=S.anos.find(x=>x.turmas.length);a.turmas[0].nome=n;t.save()},n);
const espera=async(pg,n,ms)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await nome(pg)===n)return Date.now()-t0;await pg.waitForTimeout(250)}return -1};
try{
  const A=await abrir();passo='dados de demonstração';await T(A.pg,'demo');await A.pg.waitForTimeout(1200);await fechar(A.pg);await T(A.pg,'saveNow');await A.pg.waitForTimeout(4000);
  passo='segundo aparelho';const B=await abrir();await B.pg.waitForTimeout(6000);
  const n0=await nome(A.pg);if(await nome(B.pg)!==n0)falhas.push('o segundo aparelho não abriu os mesmos dados');
  passo='B grava → A recebe';await mudar(B.pg,'Turma do aparelho B');const t1=await espera(A.pg,'Turma do aparelho B',20000);if(t1<0)falhas.push('o que o aparelho B gravou não chegou ao A em 20 s');
  passo='A grava → B recebe';await A.pg.waitForTimeout(1500);await mudar(A.pg,'Turma do aparelho A');const t2=await espera(B.pg,'Turma do aparelho A',20000);if(t2<0)falhas.push('o que o aparelho A gravou não chegou ao B em 20 s');
  passo='gravar a meio';/* duas gravações seguidas no mesmo aparelho: a segunda apanha a sincronização da primeira a decorrer e não se pode perder */
  await B.pg.waitForTimeout(1500);await mudar(B.pg,'Primeira');await B.pg.waitForTimeout(260);await mudar(B.pg,'Segunda');const t3=await espera(A.pg,'Segunda',25000);if(t3<0)falhas.push('uma gravação feita a meio de uma sincronização não chegou ao outro aparelho em 25 s (ficou «'+await nome(A.pg)+'»)');
  passo='app parada';await A.pg.waitForTimeout(9000);const i0=s.ctl.ops.length,g0=s.ctl.gravacoes;await A.pg.waitForTimeout(24000);const g1=s.ctl.gravacoes;const O=s.ctl.ops.slice(i0);
  const man=O.filter(x=>x==='ler ef-manifest.json').length,sin=O.filter(x=>x.startsWith('sinal')).length,out=O.filter(x=>!x.startsWith('sinal')&&x!=='ler ef-manifest.json');
  if(g1!==g0)falhas.push('com a app parada houve '+(g1-g0)+' gravações na base de dados: '+out.filter(x=>/^(escrever|criar|apagar)/.test(x)).slice(0,5).join(', '));
  if(man>4)falhas.push('com a app parada o índice foi lido '+man+' vezes em 24 s (dois aparelhos; esperado: 4 no máximo)');
  if(!sin)falhas.push('a pergunta leve («sinal») não foi usada');
  for(const P of [A,B]){for(const e of P.erros)falhas.push('erro: '+e);await P.ctx.close()}
  /* com o canal de tempo real a funcionar: chega logo, e a app parada quase não pergunta nada */
  passo='canal de tempo real';const C=await abrir('ok'),D=await abrir('ok');await D.pg.waitForTimeout(5000);
  await mudar(D.pg,'Pelo canal');const t4=await espera(C.pg,'Pelo canal',12000);if(t4<0)falhas.push('com o canal de tempo real, o que o aparelho D gravou não chegou ao C em 12 s');
  await C.pg.waitForTimeout(8000);const j0=s.ctl.ops.length;await C.pg.waitForTimeout(16000);const O2=s.ctl.ops.slice(j0);const sin2=O2.filter(x=>x.startsWith('sinal')).length,man2=O2.filter(x=>x==='ler ef-manifest.json').length;
  if(sin2+man2>4)falhas.push('com o canal ligado e a app parada houve '+(sin2+man2)+' pedidos em 16 s (dois aparelhos; esperado: 4 no máximo)');
  for(const P of [C,D]){for(const e of P.erros)falhas.push('erro: '+e);await P.ctx.close()}
  /* canal ligado mas que nunca avisa (publicação em falta na base de dados): chega na mesma, e a app deixa de contar com ele */
  passo='canal mudo';const E=await abrir('mudo'),F=await abrir('mudo');await F.pg.waitForTimeout(5000);
  await mudar(F.pg,'Canal mudo 1');const t5=await espera(E.pg,'Canal mudo 1',30000);if(t5<0)falhas.push('com o canal mudo, o que o aparelho F gravou não chegou ao E em 30 s');
  await E.pg.waitForTimeout(2000);await mudar(F.pg,'Canal mudo 2');const t6=await espera(E.pg,'Canal mudo 2',12000);if(t6<0)falhas.push('depois de o canal falhar uma vez, a gravação seguinte não chegou em 12 s (devia ter voltado ao ritmo de 4 s)');
  for(const P of [E,F]){for(const e of P.erros)falhas.push('erro: '+e);await P.ctx.close()}
  console.log(`dois aparelhos: B→A em ${(t1/1000).toFixed(1)} s · A→B em ${(t2/1000).toFixed(1)} s · gravação a meio em ${(t3/1000).toFixed(1)} s · parada 24 s: ${sin} perguntas leves, ${man} leituras do índice, ${g1-g0} gravações · com canal: ${(t4/1000).toFixed(1)} s e ${sin2+man2} pedidos em 16 s · canal mudo: ${(t5/1000).toFixed(1)} s, depois ${(t6/1000).toFixed(1)} s`);
}catch(e){falhas.push(passo+': '+String(e&&e.message||e).slice(0,300))}
await b.close();await s.fechar();const u=[...new Set(falhas)];
console.log('erros: '+u.length+(u.length?'\n'+u.slice(0,25).join('\n'):''));process.exit(u.length?1:0)
