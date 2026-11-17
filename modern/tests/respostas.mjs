// Teste de segurança das respostas dos alunos (Provas, Formulários e autoavaliação), com a política de conteúdo ativa:
//   · uma resposta normal chega inteira ao professor (todos os tipos de pergunta);
//   · uma resposta feita à mão para atacar (HTML e código nos campos, tipos trocados, chaves estranhas) não corre nada,
//     não acrescenta elementos à página, não estraga a vista de resultados e não mexe no resto dos dados.
//   uso: node modern/tests/respostas.mjs PASTA_CONSTRUÍDA      (o ./es testa corre-o)
import {servir,navegador,pagina,SESSAO_INIT} from './servidor.mjs';
const dir=process.argv[2];if(!dir){console.error('uso: node respostas.mjs PASTA');process.exit(1)}
const s=await servir(dir);const b=await navegador();const falhas=[];let res=null;
try{const P=await pagina(b,{init:SESSAO_INIT});const pg=P.pg;
  await pg.goto(s.url);await pg.waitForFunction(()=>window.__esPronto===true,null,{timeout:30000});await pg.waitForTimeout(800);
  await pg.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.remove())});
  await pg.evaluate(()=>window.EduGest.t.demo());await pg.waitForTimeout(1200);await pg.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.remove())});
  res=await pg.evaluate(async()=>{
    const T=window.EduGest.t,F=n=>T.f(n),out={falhas:[]};const falha=m=>out.falhas.push(m);const igual=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
    /* o ataque: fecha o atributo/elemento e tenta correr código de várias maneiras */
    const X='"><img src="x:" onerror="window.__xss=1"><svg onload="window.__xss=2"></svg><script>window.__xss=3<\/script><a href="javascript:window.__xss=4" id="xssa">x</a>';
    const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const limpo=el=>{const mau=el.querySelector('img[src="x:"],svg[onload],script,a[href^="javascript"],[onerror],[onload],[onclick]');return mau?mau.outerHTML.slice(0,120):''};
    const desenha=(nome,fn)=>{const el=document.createElement('div');document.body.appendChild(el);try{fn(el)}catch(e){falha(nome+': a vista deu erro — '+String(e.message).slice(0,160))}const m=limpo(el);if(m)falha(nome+': elemento injetado na página — '+m);const txt=el.textContent||'';el.remove();return txt};
    const enviar=async(tab,id,k,o)=>{window.__tb[tab]=window.__tb[tab]||[];window.__tb.eduspruce_autoav_resp=window.__tb.eduspruce_autoav_resp||[];window.__tb.eduspruce_autoav_resp.push({id:(window.__seqR=(window.__seqR||1000)+1),sessao:id,conteudo:await F('aaCifrar')(o,k)})};
    /* ---------- PROVAS: todos os tipos de pergunta ---------- */
    {const a=F('pvAvNova')('Teste de segurança');const Q={};
      const mk=(tipo,mut)=>{const e=F('pvExNovo')(tipo);e.html='<p>Pergunta '+tipo+'</p>';e.pts=2;mut(e);const q=F('pvParaItem')(e);a.itens.push(q);Q[tipo]=q;return q};
      mk('escolha',e=>{e.ops[0].t='Opção A';e.ops[0].certa=true;e.ops[1].t='Opção B';e.just=true});
      mk('vf',e=>{e.linhas[0].t='A Terra é redonda';e.linhas[0].v=true});
      mk('texto',e=>{e.longo=true});
      mk('lacunas',e=>{e.texto='O céu é [azul] e a relva é [verde].';e.modo='escrever'});
      mk('ordem',e=>{e.ops.forEach((o,i)=>o.t='Passo '+(i+1))});
      mk('ligar',e=>{e.pares.forEach((p,i)=>{p.a='A'+i;p.b='B'+i})});
      mk('tabela',e=>{e.cols=['Sim','Não'];e.lins=['Linha 1','Linha 2'];e.marc={'0|0':true,'1|1':true}});
      mk('legendar',e=>{e.img=PNG;e.marcas=[{x:10,y:20,t:'núcleo'}]});
      mk('segmentos',e=>{e.img=PNG;e.zonas=[{x:10,y:10,w:30,h:30}]});
      const ses=await F('pvAbrir')(a,null,60,false);const {id,k}=await F('pvCh')(ses.code);
      if(!(window.__tb.eduspruce_autoav||[]).some(r=>r.id===id))falha('provas: a sessão não chegou à base de dados');
      const bom={[Q.escolha.id]:Q.escolha.ops[0].id,[Q.escolha.id+'~j']:'Porque 3 < 5 & "é assim"',[Q.vf.id]:{[Q.vf.linhas[0].id]:true},[Q.texto.id]:'Resposta longa com <b>sinais</b>, aspas "duplas" e \'simples\'.\nSegunda linha.',
        [Q.lacunas.id]:['azul','verde'],[Q.ordem.id]:Q.ordem.ops.map(o=>o.id).reverse(),[Q.ligar.id]:Object.fromEntries(Q.ligar.pares.map(p=>[p.id,p.bid])),[Q.tabela.id]:{'0|0':true,'1|1':true},[Q.legendar.id]:['núcleo'],[Q.segmentos.id]:[{x:12.5,y:40}]};
      await enviar('eduspruce_autoav',id,k,{pv:1,aid:'',chave:'',nome:'Aluna Normal',t0:Date.now()-600000,t1:Date.now(),resp:bom,sai:1,ecra:0});
      /* ataque 1: o código de ataque em todos os sítios, nas formas certas */
      const m1={[Q.escolha.id]:['outra:'+X,X],[Q.escolha.id+'~j']:X,[Q.vf.id]:{[Q.vf.linhas[0].id]:X,[X]:true},[Q.texto.id]:X,[Q.lacunas.id]:[X,X,X],[Q.ordem.id]:[X,X],[Q.ligar.id]:{[Q.ligar.pares[0].id]:X,[X]:X},
        [Q.tabela.id]:{'0|0':X,[X]:true},[Q.legendar.id]:[X],[Q.segmentos.id]:[{x:X,y:X},{x:50,y:'0%"><img src="x:" onerror="window.__xss=5">'}],[X]:X};
      await enviar('eduspruce_autoav',id,k,{pv:1,aid:X,chave:X,nome:X,t0:X,t1:X,resp:m1,sai:X,ecra:X});
      /* ataque 2: tipos trocados (texto onde devia haver listas, objetos onde devia haver texto) e chaves perigosas */
      const m2=JSON.parse('{"__proto__":{"poluido":1},"constructor":{"prototype":{"poluido":2}}}');
      Object.assign(m2,{[Q.escolha.id]:{a:1},[Q.vf.id]:'sim',[Q.texto.id]:{html:X},[Q.lacunas.id]:'texto',[Q.ordem.id]:X,[Q.ligar.id]:[1,2],[Q.tabela.id]:'x',[Q.legendar.id]:{0:X},[Q.segmentos.id]:X});
      await enviar('eduspruce_autoav',id,k,{pv:1,aid:{x:1},nome:{toString:1},t0:{},t1:[],resp:m2,sai:{},ecra:null});
      await enviar('eduspruce_autoav',id,k,{pv:1,nome:'Só lixo',resp:X});await enviar('eduspruce_autoav',id,k,[X,X]);await enviar('eduspruce_autoav',id,k,X);
      /* aluno que começou (registo de início) com identificação de ataque */
      await enviar('eduspruce_autoav',id,k,{pv:1,ini:1,aid:X,nome:X,t0:X});
      const antes=JSON.stringify(a.resp.length);const n=await F('pvImportar')(a,ses);out.pvImportadas=a.resp.length;
      const r0=a.resp.find(r=>r.nome==='Aluna Normal');
      if(!r0)falha('provas: a resposta normal não foi importada');else{if(!igual(r0.resp,bom))falha('provas: a resposta normal mudou ao ser importada — '+JSON.stringify(r0.resp).slice(0,200));if(r0.sai!==1)falha('provas: contagem de saídas mudou')}
      a.resp.forEach((r,i)=>{if(typeof r.nome!=='string'||typeof r.t0!=='number'||typeof r.t1!=='number'||typeof r.sai!=='number'||typeof r.ecra!=='number')falha('provas: resposta '+i+' com campos de tipo errado');
        Object.keys(r.resp).forEach(k=>{if(!F('pvPerg')(a).some(q=>k===q.id||k===q.id+'~j'))falha('provas: ficou uma chave desconhecida nas respostas')})});
      const UI=F('UI');for(const vis of ['resumo','ind','notas']){UI.pvRv=vis;const txt=desenha('provas ('+vis+')',el=>F('pvRespostas')(a,el));if(vis==='ind'&&!/Aluna Normal|sinais/.test(txt))out.avisoInd=1}
      a.resp.forEach((r,i)=>desenha('provas (resposta '+i+')',el=>{const h=F('pvUma')(a,r,i);if(typeof h==='string')el.innerHTML=h}));
      out.pvCom=Object.keys(ses.com||{}).length}
    /* ---------- FORMULÁRIOS ---------- */
    {const f=F('fmNovo')(true);F('FMS')().unshift(f);const q0=f.itens[0];q0.titulo='Escolha';q0.ops.forEach((o,i)=>{o.t='Op '+i});q0.pts=1;if(q0.ops[0])q0.ops[0].certa=true;
      const qt=F('fmQ')('texto');qt.titulo='Texto';f.itens.push(qt);
      const ses=await F('fmAbrir')(f,null,60,false);const {id,k}=await F('fmCh')(ses.code);
      const bom={[q0.id]:q0.ops[0].id,[qt.id]:'Gostei da aula: 3 < 5 & "ok"'};
      await enviar('eduspruce_autoav',id,k,{fm:1,aid:'',chave:'',nome:'Aluno Normal',t0:Date.now()-60000,t1:Date.now(),resp:bom,sai:0,ecra:0});
      await enviar('eduspruce_autoav',id,k,{fm:1,aid:X,chave:X,nome:X,t0:X,t1:X,resp:{[q0.id]:[X,'outra:'+X],[qt.id]:X,[X]:X},sai:X,ecra:X});
      await enviar('eduspruce_autoav',id,k,{fm:1,nome:{a:1},resp:{[q0.id]:{a:X},[qt.id]:[X]}});
      await F('fmImportar')(f,ses);out.fmImportadas=f.resp.length;const r0=f.resp.find(r=>r.nome==='Aluno Normal');
      if(!r0)falha('formulários: a resposta normal não foi importada');else if(!igual(r0.resp,bom))falha('formulários: a resposta normal mudou ao ser importada — '+JSON.stringify(r0.resp).slice(0,200));
      const UI=F('UI');for(const vis of ['resumo','ind','notas']){UI.fmRv=vis;desenha('formulários ('+vis+')',el=>F('fmRespostas')(f,el))}
      f.resp.forEach((r,i)=>desenha('formulários (resposta '+i+')',el=>{const h=F('fmUma')(f,r,i);if(typeof h==='string')el.innerHTML=h}))}
    /* ---------- AUTOAVALIAÇÃO ---------- */
    {const S=T.S();let t=null;for(const a of S.anos)for(const x of a.turmas)if(!t&&x.alunos.length>3&&(x.dominios||[]).length){S.anoAtivo=a.id;S.turmaAtiva=x.id;t=x}
      if(!t)falha('autoavaliação: sem turma de demonstração');else{const al=t.alunos[0];const ses=await F('aaAbrir')(t,1,{},60,false);const {id,k}=await F('aaCh')(ses.code);const d0=(t.dominios[0]||{}).id;
        await enviar('eduspruce_autoav',id,k,{v:2,aid:al.id,n:al.num,k:'',p:1,dom:{[d0]:3},plano:{meta:'Estudar mais',estr:'',apoio:''},q:Date.now()-5000,nota:'14',forte:'Participo',melhorar:'Atenção',sug:'Mais jogos'});
        await enviar('eduspruce_autoav',id,k,{v:2,aid:al.id,n:X,k:X,p:X,dom:{[d0]:X,[X]:4},plano:{meta:X,estr:{a:X},apoio:[X]},q:X,nota:X,forte:X,melhorar:X,sug:X});
        await enviar('eduspruce_autoav',id,k,{v:2,aid:X,n:1,q:Date.now(),dom:X,plano:X});await enviar('eduspruce_autoav',id,k,{v:2,aid:'__proto__',q:1,dom:{}});
        try{out.aaNovos=await F('aaImportar')(t,ses)}catch(e){falha('autoavaliação: importar deu erro — '+String(e.message).slice(0,160))}
        try{await F('aaPainel')();await new Promise(r=>setTimeout(r,500))}catch(e){falha('autoavaliação: o painel deu erro — '+String(e.message).slice(0,160))}
        const d=document.querySelector('dialog[open]');if(d){const m=limpo(d);if(m)falha('autoavaliação: elemento injetado no painel — '+m);out.aaPainel=(d.textContent||'').length;d.remove()}}}
    await new Promise(r=>setTimeout(r,600));const la=document.getElementById('xssa');if(la)la.click();await new Promise(r=>setTimeout(r,200));
    out.xss=window.__xss||0;out.poluido=({}).poluido||0;return out});
  if(res.xss)falhas.push('CÓDIGO DE ATAQUE CORREU (window.__xss='+res.xss+')');if(res.poluido)falhas.push('Object.prototype foi alterado por uma resposta');
  for(const f of res.falhas)falhas.push(f);for(const e of P.erros)falhas.push('erro de página: '+e);
  await P.ctx.close()}
catch(e){falhas.push(String(e&&e.message||e).slice(0,400))}
await b.close();await s.fechar();const u=[...new Set(falhas)];
console.log(`respostas dos alunos: ${res?`${res.pvImportadas} nas Provas, ${res.fmImportadas} nos Formulários, autoavaliação ${res.aaNovos==null?'—':res.aaNovos+' nova(s)'}`:'—'} · ataques neutralizados: ${u.length?'NÃO':'sim'}`);
console.log('erros: '+u.length+(u.length?'\n'+u.slice(0,25).join('\n'):''));process.exit(u.length?1:0)
