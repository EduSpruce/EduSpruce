// Percurso completo de uma prova e de um formulário, com a política de conteúdo ativa nas duas páginas:
//   o professor cria e abre a recolha → o aluno abre a página (telemóvel), responde e envia → o professor importa.
//   O que o professor recebe tem de ser exatamente o que o aluno enviou. Os pedidos do aluno à base de dados são
//   atendidos por este teste (a sessão cifrada criada pelo professor e as respostas cifradas enviadas pelo aluno).
//   uso: node modern/tests/percurso.mjs PASTA_CONSTRUÍDA      (o ./es testa corre-o)
import {servir,navegador,pagina,SESSAO_INIT} from './servidor.mjs';
const dir=process.argv[2];if(!dir){console.error('uso: node percurso.mjs PASTA');process.exit(1)}
const s=await servir(dir);const b=await navegador();const falhas=[];const feito=[];
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
try{const P=await pagina(b,{init:SESSAO_INIT});const pg=P.pg;
  await pg.goto(s.url);await pg.waitForFunction(()=>window.__esPronto===true,null,{timeout:30000});await pg.waitForTimeout(800);
  await pg.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.remove())});
  for(const mod of ['provas','forms']){
    /* professor: cria e abre a recolha */
    const ses=await pg.evaluate(async([mod,PNG])=>{const F=n=>window.EduGest.t.f(n);window.__tb.eduspruce_autoav=[];window.__tb.eduspruce_autoav_resp=[];let a,x;
      if(mod==='provas'){a=F('pvAvNova')('Teste de Geografia');const mk=(tipo,mut)=>{const e=F('pvExNovo')(tipo);e.html='<p>Pergunta <b>'+tipo+'</b> <img src="'+PNG+'"></p>';e.pts=2;mut(e);a.itens.push(F('pvParaItem')(e))};
        mk('escolha',e=>{e.ops[0].t='Lisboa';e.ops[0].certa=true;e.ops[1].t='Porto'});mk('vf',e=>{e.linhas[0].t='Os Açores têm 9 ilhas';e.linhas[0].v=true});mk('texto',e=>{e.longo=false});
        mk('lacunas',e=>{e.texto='A capital é [Lisboa].';e.modo='escrever'});mk('legendar',e=>{e.img=PNG;e.marcas=[{x:10,y:20,t:'núcleo'}]});mk('tabela',e=>{e.cols=['Sim','Não'];e.lins=['L1','L2'];e.marc={'0|0':true}});
        x=await F('pvAbrir')(a,null,60,false)}
      else{a=F('fmNovo')(true);F('FMS')().unshift(a);const q0=a.itens[0];q0.titulo='Capital de Portugal';q0.ops.forEach((o,i)=>{o.t=['Lisboa','Porto','Faro','Braga'][i]||'Outra'});q0.pts=1;q0.ops[0].certa=true;
        const qt=F('fmQ')('texto');qt.titulo='Porquê?';a.itens.push(qt);x=await F('fmAbrir')(a,null,60,false)}
      window.__av=a;window.__ses=x;const l=window.__tb.eduspruce_autoav[0];return {code:x.code,id:l&&l.id,dados:l&&l.dados,expira:l&&l.expira,n:a.itens.length}},[mod,PNG]);
    if(!ses.dados){falhas.push(mod+': a sessão não foi criada');continue}
    /* aluno: abre a página no telemóvel, responde e envia */
    const enviadas=[];const Q=await pagina(b,{vp:{width:390,height:844}});const al=Q.pg;al.on('dialog',d=>d.accept());
    await Q.ctx.route('**/rest/v1/rpc/**',async r=>{const u=r.request().url();let body={};try{body=JSON.parse(r.request().postData()||'{}')}catch(_){}const H={'access-control-allow-origin':'*'};
      if(/eduspruce_autoav_ler/.test(u))return r.fulfill({status:200,contentType:'application/json',headers:H,body:JSON.stringify(body.p_id===ses.id?[{dados:ses.dados,expira:ses.expira}]:[])});
      if(/eduspruce_autoav_enviar/.test(u)){enviadas.push(body);return r.fulfill({status:200,contentType:'application/json',headers:H,body:'true'})}
      return r.fulfill({status:404,contentType:'application/json',headers:H,body:'{}'})});
    await al.goto(s.url+mod+'.html#'+ses.code);await al.waitForTimeout(2200);
    if(await al.locator('#nm').count())await al.fill('#nm','Maria Teste');
    const com=al.locator('button:has-text("Começar")');if(await com.count()){await com.first().click();await al.waitForTimeout(1000)}
    const escritos=[];
    for(let passo=0;passo<8&&enviadas.filter(e=>e.p_conteudo&&e.p_conteudo.length>200).length===0;passo++){
      const nomes=await al.evaluate(()=>[...new Set([...document.querySelectorAll('#app input[type=radio]')].map(i=>i.name))]);for(const n of nomes)await al.locator('#app input[type=radio][name="'+n+'"]').first().check({force:true});
      const tx=al.locator('#app input:not([type]),#app input[type=text],#app textarea');const N=await tx.count();for(let k=0;k<N;k++){const v=k===0?'Porque 3 < 5 & "é assim"':'Lisboa';await tx.nth(k).fill(v);escritos.push(v)}
      const cx=al.locator('#app input[type=checkbox]');if(await cx.count())await cx.first().check({force:true});
      const bt=al.locator('#b');if(!(await bt.count()))break;await bt.click();await al.waitForTimeout(1300)}
    const fim=await al.evaluate(()=>document.body.innerText);if(!/Obrigad|enviad/i.test(fim))falhas.push(mod+': o aluno não chegou ao ecrã de envio — '+fim.replace(/\s+/g,' ').slice(0,160));
    for(const e of Q.erros)falhas.push(mod+' (aluno): '+e);for(const v of await Q.violacoes())falhas.push('política ('+mod+'.html): '+v);
    await Q.ctx.close();
    /* professor: importa e compara com o que o aluno enviou */
    const r=await pg.evaluate(async([mod,env])=>{const F=n=>window.EduGest.t.f(n);const a=window.__av,x=window.__ses;const {k}=await F(mod==='provas'?'pvCh':'fmCh')(x.code);const u=t=>Uint8Array.from(atob(t.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
      const crus=[];for(const e of env){try{const p=e.p_conteudo.split('.');crus.push(JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:u(p[1])},k,u(p[2])))))}catch(_){}}
      env.forEach((e,i)=>window.__tb.eduspruce_autoav_resp.push({id:500+i,sessao:e.p_id,conteudo:e.p_conteudo}));await F(mod==='provas'?'pvImportar':'fmImportar')(a,x);
      const cru=crus.find(c=>c&&c.resp);return {cru:cru?cru.resp:null,imp:a.resp.map(z=>({nome:z.nome,resp:z.resp})),perg:F(mod==='provas'?'pvPerg':'fmPerg')(a).length}},[mod,enviadas]);
    if(!r.cru)falhas.push(mod+': não chegou nenhuma resposta do aluno');
    else if(r.imp.length!==1)falhas.push(mod+': esperava 1 resposta importada, há '+r.imp.length);
    else{if(JSON.stringify(r.imp[0].resp)!==JSON.stringify(r.cru))falhas.push(mod+': o que o professor recebeu é diferente do que o aluno enviou — '+JSON.stringify(r.imp[0].resp).slice(0,160)+' ≠ '+JSON.stringify(r.cru).slice(0,160));
      if(r.imp[0].nome!=='Maria Teste')falhas.push(mod+': nome do aluno errado — '+r.imp[0].nome);
      if(Object.keys(r.cru).length<r.perg)falhas.push(mod+': o aluno só respondeu a '+Object.keys(r.cru).length+' de '+r.perg+' perguntas (o teste não conseguiu preencher todas)');
      feito.push(mod+' '+Object.keys(r.cru).length+'/'+r.perg)}}
  for(const e of P.erros)falhas.push('professor: '+e);for(const v of await P.violacoes())falhas.push('política (app): '+v);await P.ctx.close()}
catch(e){falhas.push(String(e&&e.message||e).slice(0,400))}
await b.close();await s.fechar();const u=[...new Set(falhas)];
console.log('percurso professor → aluno → professor: '+(feito.join(' · ')||'—')+' respostas recebidas iguais às enviadas');
console.log('erros: '+u.length+(u.length?'\n'+u.slice(0,20).join('\n'):''));process.exit(u.length?1:0)
