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
let okA=false,okB=false,okA2=false,okB2=false;
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
  /* um aparelho sem rede altera a parte «geral» enquanto o outro apaga as tarefas de exemplo e escreve o nome da escola:
     ao voltar a rede, o que foi apagado não pode voltar e o nome da escola não pode desaparecer (junção a três, 1.131) */
  passo='aparelho sem rede';
  const todoIds=pg=>pg.evaluate(()=>(window.EduGest.t.S().todo||[]).map(x=>x.t));
  const ex0=await todoIds(A.pg);if(ex0.length<2)falhas.push('a demonstração não criou tarefas de exemplo para o teste');
  await A.pg.waitForTimeout(1500);await A.ctx.setOffline(true);await A.pg.waitForTimeout(300);
  await A.pg.evaluate(()=>{const t=window.EduGest.t;const S=t.S();S.todo=S.todo||[];S.todo.push({id:'nova-a',t:'Tarefa nova do aparelho A',feito:false,criada:Date.now()});t.save()});await A.pg.waitForTimeout(800);
  await B.pg.evaluate(()=>{const t=window.EduGest.t;const S=t.S();S.todo=[];S.cfg.escola='Escola Básica do Teste';t.save()});
  await B.pg.waitForTimeout(5000);
  await A.ctx.setOffline(false);await A.pg.evaluate(()=>{dispatchEvent(new Event('online'))});
  const ate=async(pg,f,ms)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await pg.evaluate(f))return true;await pg.waitForTimeout(300)}return false};
  const certo=()=>{const S=window.EduGest.t.S();const T=(S.todo||[]).map(x=>x.t);return S.cfg.escola==='Escola Básica do Teste'&&T.length===1&&T[0]==='Tarefa nova do aparelho A'};
  okA=await ate(A.pg,certo,25000);okB=await ate(B.pg,certo,25000);
  for(const [nm,P_,okX] of [['A',A,okA],['B',B,okB]])if(!okX){const st=await P_.pg.evaluate(()=>{const S=window.EduGest.t.S();return {escola:S.cfg.escola,todo:(S.todo||[]).map(x=>x.t)}});falhas.push('depois de o aparelho A voltar à rede, o aparelho '+nm+' ficou com: escola «'+st.escola+'», tarefas '+JSON.stringify(st.todo)+' (esperado: o nome escrito no B e só a tarefa nova do A)')}
  /* o inverso: o aparelho sem rede grava DEPOIS (é o mais recente) — antes, os apagados voltavam e o nome da escola antigo apagava o novo */
  passo='aparelho sem rede, mais recente';
  await A.ctx.setOffline(true);await A.pg.waitForTimeout(300);
  await B.pg.evaluate(()=>{const t=window.EduGest.t;const S=t.S();S.todo=[];S.cfg.escola='Escola Secundária Nova';t.save()});await B.pg.waitForTimeout(5000);
  await A.pg.evaluate(()=>{const t=window.EduGest.t;const S=t.S();S.cfg.notaTeste='do aparelho A';t.save()});await A.pg.waitForTimeout(800);
  await A.ctx.setOffline(false);await A.pg.evaluate(()=>{dispatchEvent(new Event('online'))});
  const certo2=()=>{const S=window.EduGest.t.S();return S.cfg.escola==='Escola Secundária Nova'&&!(S.todo||[]).length&&S.cfg.notaTeste==='do aparelho A'};
  okA2=await ate(A.pg,certo2,25000);okB2=await ate(B.pg,certo2,25000);
  for(const [nm,P_,okX] of [['A',A,okA2],['B',B,okB2]])if(!okX){const st=await P_.pg.evaluate(()=>{const S=window.EduGest.t.S();return {escola:S.cfg.escola,todo:(S.todo||[]).map(x=>x.t),nota:S.cfg.notaTeste}});falhas.push('(A mais recente) o aparelho '+nm+' ficou com: escola «'+st.escola+'», tarefas '+JSON.stringify(st.todo)+', nota «'+st.nota+'» (esperado: o nome do B, sem tarefas, e a nota do A)')}
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
  console.log(`dois aparelhos: B→A em ${(t1/1000).toFixed(1)} s · A→B em ${(t2/1000).toFixed(1)} s · gravação a meio em ${(t3/1000).toFixed(1)} s · parada 24 s: ${sin} perguntas leves, ${man} leituras do índice, ${g1-g0} gravações · com canal: ${(t4/1000).toFixed(1)} s e ${sin2+man2} pedidos em 16 s · canal mudo: ${(t5/1000).toFixed(1)} s, depois ${(t6/1000).toFixed(1)} s · aparelho sem rede: apagados não voltaram nos dois sentidos ${okA&&okB&&okA2&&okB2?'(certo)':'(ERRADO)'}`);
}catch(e){falhas.push(passo+': '+String(e&&e.message||e).slice(0,300))}
await b.close();await s.fechar();const u=[...new Set(falhas)];
console.log('erros: '+u.length+(u.length?'\n'+u.slice(0,25).join('\n'):''));process.exit(u.length?1:0)
