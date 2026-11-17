// Frase secreta (opcional): liga-se num aparelho, a chave deixa de estar legível na base de dados, um aparelho novo só abre os dados
// com a frase (ou com a chave de recuperação), e desligar repõe tudo.   uso: node modern/tests/frase.mjs PASTA   (no ./es testa)
import {servir,navegador,pagina,SESSAO_INIT} from './servidor.mjs';
const dir=process.argv[2];if(!dir){console.error('uso: node frase.mjs PASTA');process.exit(1)}
const s=await servir(dir);const b=await navegador();const erros=[];const certo=(c,m)=>{if(!c)erros.push(m)};const FRASE='abeto azul sobe a serra 27';
const bd=async(pg,op,nome,texto)=>pg.evaluate(async a=>{const r=await fetch('/__bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(a)});return r.json()},{op,nome,texto});
const abre=async()=>{const P=await pagina(b,{vp:{width:1366,height:768},init:SESSAO_INIT});await P.pg.goto(s.url);return P};
const pronto=pg=>pg.waitForFunction(()=>window.__esPronto===true,null,{timeout:30000});
const fecha=pg=>pg.evaluate(()=>{document.querySelectorAll('dialog[open]:not(.nvmc)').forEach(d=>{try{d.close()}catch(_){}d.remove()})});
const painel=async pg=>{await pg.evaluate(()=>{const u=window.EduGest.t.go;u('definicoes')});await pg.waitForTimeout(400);await pg.evaluate(()=>{const x=document.querySelector('#view button[data-dt2="sync"]');if(x)x.click()});await pg.waitForSelector('#nv-frase',{timeout:15000})};
try{
  // 1) aparelho A: demonstração, liga a frase secreta
  let A=await abre();let pg=A.pg;await pronto(pg);await pg.waitForTimeout(600);await fecha(pg);await pg.evaluate(()=>window.EduGest.t.demo());await pg.waitForTimeout(3500);await fecha(pg);
  const chave=await pg.evaluate(()=>JSON.parse(localStorage.getItem('edugest.nuvem')||'{}').k);certo(chave&&chave.length>30,'o aparelho A tem a chave');
  const antes=JSON.parse((await bd(pg,'ler','conta-chave')).v||'null');certo(antes&&antes.k===chave,'antes: a chave está legível na conta (comportamento por omissão)');
  await painel(pg);await pg.evaluate(()=>document.querySelector('#nv-frase').click());await pg.waitForSelector('#sfd-1');
  certo(await pg.$eval('#sfd-ok',e=>e.disabled),'não se liga sem descarregar a chave de recuperação e confirmar');
  await pg.fill('#sfd-1','curta');await pg.fill('#sfd-2','curta');const dl=pg.waitForEvent('download');await pg.click('#sfd-k');const fich=await dl;const txtRec=(await (await fich.createReadStream()).toArray()).map(x=>x.toString()).join('');
  const rec=(txtRec.match(/EDUSPRUCE-CHAVE\.\S+/)||[''])[0];certo(rec.includes(chave),'a chave de recuperação descarregada contém a chave');
  await pg.check('#sfd-c');await pg.click('#sfd-ok');await pg.waitForTimeout(300);certo(/12 caracteres/.test(await pg.$eval('#sfd-e',e=>e.textContent)),'frase curta recusada');
  await pg.fill('#sfd-1',FRASE);await pg.fill('#sfd-2',FRASE+'x');await pg.click('#sfd-ok');await pg.waitForTimeout(300);certo(/não são iguais/.test(await pg.$eval('#sfd-e',e=>e.textContent)),'frases diferentes recusadas');
  await pg.fill('#sfd-2',FRASE);await pg.click('#sfd-ok');await pg.waitForSelector('dialog.amodal',{timeout:30000});await pg.click('dialog.amodal [data-amb="0"]');
  const lin=JSON.parse((await bd(pg,'ler','conta-chave')).v||'null');certo(lin&&lin.w&&!lin.k,'depois: a linha da conta já não tem a chave');
  const tudo=JSON.stringify((await bd(pg,'dados')).v||{});certo(tudo.length>1000&&!tudo.includes(chave),'a chave não aparece em nenhum sítio da base de dados');
  // gravar continua a funcionar no aparelho A, e nada volta a escrever a chave em claro
  await pg.evaluate(()=>{const S=window.EduGest.t.S();S.cfg.professor='Docente de Teste';window.EduGest.t.save()});await pg.waitForTimeout(12000);
  const lin2=JSON.parse((await bd(pg,'ler','conta-chave')).v||'null');certo(lin2&&lin2.w&&!lin2.k,'10 s depois (vigilâncias automáticas): a linha continua sem a chave');
  certo(await pg.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('edugest.nuvem')||'{}').mod||{}).length)===0,'o aparelho A continua a gravar');await A.ctx.close();
  // 2) aparelho B (novo): pede a frase; errada não abre, certa abre os dados
  let B=await abre();pg=B.pg;await pg.waitForSelector('#sbf-1',{timeout:30000});certo(!(await pg.evaluate(()=>window.__esPronto===true)),'aparelho novo: a app não abre sem a frase');
  await pg.fill('#sbf-1','frase errada de certeza');await pg.click('#sbf-ok');await pg.waitForFunction(()=>/errada/.test((document.querySelector('#sbf-e')||{}).textContent||''),null,{timeout:30000});
  certo(!(await pg.evaluate(()=>JSON.parse(localStorage.getItem('edugest.nuvem')||'{}').k)),'com a frase errada o aparelho fica sem chave');
  await pg.fill('#sbf-1',FRASE);await pg.click('#sbf-ok');await pronto(pg);await pg.waitForTimeout(1500);await fecha(pg);
  const st=await pg.evaluate(()=>{const S=window.EduGest.t.S();return {prof:S.cfg.professor,turmas:S.anos.reduce((n,a)=>n+(a.turmas||[]).length,0),k:JSON.parse(localStorage.getItem('edugest.nuvem')||'{}').k}});
  certo(st.k===chave&&st.turmas>5&&st.prof==='Docente de Teste','com a frase certa abrem-se os mesmos dados ('+st.turmas+' turmas)');await B.ctx.close();
  // 3) aparelho C (novo): abre com a chave de recuperação
  let C=await abre();pg=C.pg;await pg.waitForSelector('#sbf-1',{timeout:30000});await pg.fill('#sbf-1',rec);await pg.click('#sbf-ok');await pronto(pg);await pg.waitForTimeout(1200);await fecha(pg);
  const lin3=JSON.parse((await bd(pg,'ler','conta-chave')).v||'null');certo(lin3&&lin3.w&&!lin3.k,'abrir com a chave de recuperação não repõe a chave na conta');
  // um aparelho com uma versão antiga da app repõe a chave em claro → o aparelho atualizado volta a embrulhá-la
  await bd(pg,'escrever','conta-chave',JSON.stringify({v:1,k:chave,salt:lin3.salt||'',q:Date.now()}));await pg.reload();await pronto(pg);await pg.waitForTimeout(11000);
  const lin4=JSON.parse((await bd(pg,'ler','conta-chave')).v||'null');certo(lin4&&lin4.w&&!lin4.k,'se uma versão antiga repuser a chave em claro, o embrulho volta sozinho');
  // 4) desligar: a chave volta à conta e um aparelho novo abre sem frase
  await fecha(pg);await painel(pg);certo(/Desligar/.test(await pg.$eval('#nv-frase',e=>e.textContent)),'o painel mostra a frase ligada');await pg.evaluate(()=>document.querySelector('#nv-frase').click());await pg.waitForSelector('dialog.amodal');await pg.click('dialog.amodal [data-amb="0"]');await pg.waitForTimeout(1500);
  const lin5=JSON.parse((await bd(pg,'ler','conta-chave')).v||'null');certo(lin5&&lin5.k===chave&&!lin5.w,'desligada: a chave volta à conta');await pg.waitForTimeout(2500);await C.ctx.close();
  let D=await abre();pg=D.pg;await pronto(pg);certo(!(await pg.$('#sbf-1')),'desligada: aparelho novo abre sem frase');await D.ctx.close();
}catch(e){erros.push('exceção: '+String(e.message||e).slice(0,300))}
await b.close();await s.fechar();
console.log('frase secreta: ligar, chave fora da base de dados, aparelho novo com frase e com chave de recuperação, reposição automática e desligar');
if(erros.length){console.log('erros: '+erros.length+'\n  '+erros.join('\n  '));process.exit(1)}console.log('erros: 0');
