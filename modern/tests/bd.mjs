// Teste da versão com base de dados, com a política de conteúdo (CSP) ativa e uma base de dados falsa em memória:
// a app abre, cria os dados de demonstração, percorre todas as vistas, grava, recarrega e confirma que os dados voltam;
// depois abre as páginas dos alunos. Falha se houver erros de JavaScript ou violações da política.
//   uso: node modern/tests/bd.mjs PASTA_CONSTRUÍDA      (o ./es testa faz tudo)
import {servir,navegador,pagina,SESSAO_INIT} from './servidor.mjs';
const dir=process.argv[2];if(!dir){console.error('uso: node bd.mjs PASTA');process.exit(1)}
const s=await servir(dir);const b=await navegador();const falhas=[];let passo='arranque';
const T=(pg,f,...a)=>pg.evaluate(([f,a])=>{const t=window.EduGest&&window.EduGest.t;if(!t)throw new Error('EduGest.t em falta');return t[f](...a)},[f,a]);
const fecharJanelas=pg=>pg.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(_){}d.remove()});const w=document.getElementById('drawer');if(w&&w.classList.contains('on')){const x=document.getElementById('dw-x');if(x)x.click()}});
const todasViolacoes=async P=>{const v=await P.violacoes();for(const f of P.pg.frames()){if(f===P.pg.mainFrame())continue;try{v.push(...await f.evaluate(()=>(window.__csp||[]).map(x=>'[moldura] '+x)))}catch(_){}}return [...new Set(v)]};
try{
  /* 1) a app (professor) */
  const P=await pagina(b,{init:SESSAO_INIT});const pg=P.pg;P.pg.on('pageerror',e=>falhas.push(passo+': '+String(e.message||e).slice(0,200)));
  await pg.goto(s.url);await pg.waitForFunction(()=>window.__esPronto===true,null,{timeout:30000});await pg.waitForTimeout(800);await fecharJanelas(pg);
  passo='fórmulas das classificações';{const r=await T(pg,'auto');if(!r||(r.err||[]).length)falhas.push('fórmulas: '+JSON.stringify(r&&r.err).slice(0,300))}
  passo='dados de demonstração';await T(pg,'demo');await pg.waitForTimeout(1200);await fecharJanelas(pg);
  const vs=await T(pg,'vistas');
  for(const v of vs){passo='vista '+v;try{await T(pg,'go',v)}catch(e){falhas.push(passo+': '+String(e.message).slice(0,200))}await pg.waitForTimeout(v==='eduschedule'?2500:150);await fecharJanelas(pg)}
  passo='gravar e recarregar';await T(pg,'go','inicio');await T(pg,'saveNow');await pg.waitForTimeout(3500);
  const antes=await pg.evaluate(()=>{const S=window.EduGest.t.S();return {anos:S.anos.length,turmas:S.anos.reduce((n,a)=>n+a.turmas.length,0),alunos:S.anos.reduce((n,a)=>n+a.turmas.reduce((m,t)=>m+t.alunos.length,0),0)}});
  if(!antes.turmas||!antes.alunos)falhas.push('demonstração sem turmas/alunos: '+JSON.stringify(antes));
  if(![...s.bd.keys()].some(k=>/^ef-(ano|turma)-/.test(k)))falhas.push('os dados não chegaram à base de dados: '+[...s.bd.keys()].join(', ').slice(0,200));
  await pg.reload();await pg.waitForFunction(()=>window.__esPronto===true,null,{timeout:30000});await pg.waitForTimeout(1500);
  const depois=await pg.evaluate(()=>{const S=window.EduGest.t.S();return {anos:S.anos.length,turmas:S.anos.reduce((n,a)=>n+a.turmas.length,0),alunos:S.anos.reduce((n,a)=>n+a.turmas.reduce((m,t)=>m+t.alunos.length,0),0)}});
  if(JSON.stringify(antes)!==JSON.stringify(depois))falhas.push('depois de recarregar os dados mudaram: '+JSON.stringify(antes)+' → '+JSON.stringify(depois));
  passo='app';for(const e of P.erros)falhas.push('app: '+e);for(const v of await todasViolacoes(P))falhas.push('política (app): '+v);
  await P.ctx.close();
  /* 2) páginas dos alunos e páginas públicas: abrem sem erros nem violações */
  for(const f of ['aluno.html','forms.html','provas.html','review.html#ABCDEFGHJK','spruceit.html','pulso.html','privacidade.html','termos.html','arena.html#ABCDEF']){passo=f;
    const Q=await pagina(b,{vp:{width:390,height:844}});await Q.pg.goto(s.url+f);await Q.pg.waitForTimeout(900);
    for(const e of Q.erros)falhas.push(f+': '+e);for(const v of await todasViolacoes(Q))falhas.push('política ('+f+'): '+v);
    const vazio=await Q.pg.evaluate(()=>(document.body.innerText||'').trim().length<5);if(vazio)falhas.push(f+': página vazia');await Q.ctx.close()}
  console.log(`versão com base de dados: ${vs.length} vistas · ${antes.turmas} turmas e ${antes.alunos} alunos gravados e relidos · páginas dos alunos abertas`);
}catch(e){falhas.push(passo+': '+String(e&&e.message||e).slice(0,300))}
await b.close();await s.fechar();const u=[...new Set(falhas)];
console.log('erros: '+u.length+(u.length?'\n'+u.slice(0,25).join('\n'):''));process.exit(u.length?1:0)
