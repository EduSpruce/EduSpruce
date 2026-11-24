// Spruce It! completo, de ponta a ponta, com o SQL verdadeiro num PostgreSQL local (sem tocar no Supabase):
// professor cria um conjunto com todos os tipos de pergunta → lança ao vivo → dois alunos entram nas páginas deles e
// respondem a cada tipo → o professor revela → reações, perguntas do público, ideias com votação → pódio e relatório.
// Também abre uma sala de Estudo. Guarda capturas de ecrã em modern/tests/saida/spruceit-*.png.
//   uso: node modern/tests/spruceit-e2e.mjs PASTA_CONSTRUÍDA     (precisa de PostgreSQL 16; o ./es testa constrói a pasta)
import {servir,navegador,pagina,SESSAO_INIT,CONTA} from './servidor.mjs';
import {spawnSync,execSync} from 'node:child_process';import {readdirSync,readFileSync,mkdirSync} from 'node:fs';import {join,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
const AQUI=dirname(fileURLToPath(import.meta.url));const dir=process.argv[2];if(!dir){console.error('uso: node spruceit-e2e.mjs PASTA');process.exit(1)}
const SAI=join(AQUI,'saida');mkdirSync(SAI,{recursive:true});
/* 1) base de dados local */
const B=readdirSync('/usr/lib/postgresql').map(v=>'/usr/lib/postgresql/'+v+'/bin').pop();const D='/tmp/es-pg',P='54331';
const como=c=>execSync(process.getuid()===0?`su postgres -c "${c.replace(/"/g,'\\"')}"`:c,{stdio:'pipe'});
try{como(`${B}/pg_ctl -D ${D} status`)}catch(_){como(`${B}/pg_ctl -D ${D} -o '-p ${P} -c listen_addresses=127.0.0.1' -l ${D}/registo.log -w start`)}
const U=process.getuid()===0?'postgres':execSync('id -un').toString().trim();
const psql=(db,sql)=>{const r=spawnSync('psql',['-h','127.0.0.1','-p',P,'-U',U,'-d',db,'-q','-At','-v','ON_ERROR_STOP=1'],{input:sql,encoding:'utf8'});if(r.status)throw new Error((r.stderr||'').split('\n').find(l=>/ERRO|ERROR/.test(l))||r.stderr);return r.stdout.trim()};
psql('postgres','drop database if exists es_e2e;');psql('postgres','create database es_e2e;');
try{psql('es_e2e',readFileSync(join(AQUI,'sql/stubs.sql'),'utf8'))}catch(_){}
const MIG=join(AQUI,'../supabase/migrations');for(const f of readdirSync(MIG).filter(x=>x.endsWith('.sql')).sort())psql('es_e2e',readFileSync(join(MIG,f),'utf8').split('\n').filter(l=>!/create extension if not exists pg_(cron|net)/i.test(l)).join('\n'));
psql('es_e2e',`insert into auth.users (id,email,email_confirmed_at) values ('${CONTA.id}','${CONTA.email}',now()); insert into auth.identities (user_id,provider) values ('${CONTA.id}','google');
  insert into public.eduspruce_autorizados (h,papel) values (encode(extensions.digest('eduspruce:${CONTA.email}','sha256'),'hex'),'admin');`);
/* 2) as chamadas /rest/v1/rpc/<fn> vão para o PostgreSQL, com o papel certo (professor autenticado ou aluno anónimo) */
const ASS={};const assinatura=fn=>ASS[fn]||(ASS[fn]=psql('es_e2e',`select pg_get_function_arguments(p.oid) from pg_proc p where p.proname='${fn.replace(/[^a-z0-9_]/g,'')}' and p.pronamespace='public'::regnamespace limit 1`).split(/,\s*(?=p_)/).filter(Boolean).map(x=>{const m=x.trim().match(/^(\w+)\s+(.+?)(\s+DEFAULT.*)?$/i);return {n:m[1],t:m[2]}}));
const lit=(v,t)=>v==null?'NULL':`'${(typeof v==='object'||t==='jsonb'?JSON.stringify(v):String(v)).replace(/'/g,"''")}'::${t}`;
const chamadas=[];
function rpc(fn,a,prof){chamadas.push(fn);const S=assinatura(fn);const args=S.filter(x=>a&&x.n in a).map(x=>`${x.n} => ${lit(a[x.n],x.t)}`).join(', ');
  const sql=`begin; select set_config('test.uid','${prof?CONTA.id:''}',true), set_config('request.jwt.claims','${prof?JSON.stringify({role:'authenticated',email:CONTA.email}):'{"role":"anon"}'}',true), set_config('request.headers','{"x-es-ver":"9.999","cf-connecting-ip":"10.0.0.${prof?1:2}"}',true);
    set local role ${prof?'authenticated':'anon'}; select coalesce(to_jsonb(public.${fn}(${args})),'null'::jsonb); commit;`;
  const out=psql('es_e2e',sql).split('\n').filter(Boolean);return JSON.parse(out[out.length-1]||'null')}
const rota=prof=>async route=>{const req=route.request();const fn=req.url().split('/').pop().split('?')[0];let a={};try{a=JSON.parse(req.postData()||'{}')}catch(_){}
  try{const d=rpc(fn,a,prof);await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(d)})}catch(e){await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:String(e.message).slice(0,300)})})}};
/* 3) o percurso */
const s=await servir(dir);const b=await navegador();const falhas=[];let passo='arranque';const espera=ms=>new Promise(r=>setTimeout(r,ms));
const foto=async(pg,n)=>{try{await pg.screenshot({path:join(SAI,'spruceit-'+n+'.png')})}catch(_){}};
try{
  const Pp=await pagina(b,{init:SESSAO_INIT});const pp=Pp.pg;pp.on('pageerror',e=>falhas.push('professor ('+passo+'): '+String(e.message||e).slice(0,200)));
  await pp.route('https://rpc.local/**',rota(true));
  const ev=(f,a)=>pp.evaluate(([s,a])=>window.EduGest.ev('('+s+')')(a),[f.toString(),a]);
  await pp.goto(s.url);await pp.waitForFunction(()=>window.__esPronto===true,null,{timeout:30000});await espera(600);
  await ev(()=>{const c=window.EduSpruceModerno.supabase.cliente;c.rpc=async(fn,a)=>{const r=await fetch('https://rpc.local/rest/v1/rpc/'+fn,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(a||{})});const j=await r.json();return r.ok?{data:j,error:null}:{data:null,error:{message:j.message}}};
    document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(_){}d.remove()});setInterval(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(_){}d.remove()});const h=[...document.querySelectorAll('b,h1,h2,h3,strong,span,div')].find(e=>e.childElementCount===0&&e.textContent.trim()==='Avisos Urgentes');if(h){let e=h;while(e.parentElement&&getComputedStyle(e).position!=='fixed')e=e.parentElement;if(e.parentElement)e.remove()}},300)});
  passo='conjunto com todos os tipos';
  const cid=await ev(()=>{const cv=document.createElement('canvas');cv.width=320;cv.height=200;const x=cv.getContext('2d');x.fillStyle='#bde0fe';x.fillRect(0,0,320,200);x.fillStyle='#e63946';x.beginPath();x.arc(160,100,30,0,7);x.fill();const img=sp3PorFoto(cv.toDataURL('image/png'));
    const P=[{tp:'mc',t:'Qual é a capital de Portugal?',o:['Porto','Lisboa','Faro','Braga'],c:1,s:20,pm:2,notas:'Lembrar a matéria da aula passada.'},{tp:'multi',t:'Quais são números pares?',o:['2','3','4','5'],cs:[0,2],c:0,s:20},
      {tp:'rc',t:'Símbolo químico do ferro?',a:['Fe'],s:20},{tp:'slider',t:'Quanto é 7 × 6?',min:0,max:100,step:1,v:42,tol:0,un:'',s:20},{tp:'ordem',t:'Ordena do menor para o maior',it:['um','dois','três'],s:20},
      {tp:'pino',t:'Toca no círculo vermelho',img,zona:{x:.5,y:.5,r:.15},s:20},{tp:'sond',t:'Gostaste da aula?',o:['Sim','Não'],s:20},{tp:'escala',t:'A matéria foi clara.',esc:'likert',s:20},
      {tp:'nuvem',t:'Uma palavra sobre a aula',s:20},{tp:'aberta',t:'O que aprendeste hoje?',s:30},{tp:'ideias',t:'Ideias para a visita de estudo',s:30},{tp:'slide',t:'Obrigado!',tx:'Até à próxima aula.',lay:'classico',s:0}].map(p=>Object.assign({id:uid(),o:['','','',''],c:0},p));
    const c={id:uid(),nome:'Teste completo',disc:'Ciências',turma:'',tema:'',pasta:'',criado:Date.now(),mod:Date.now(),perg:P};arD().conj.unshift(c);save();return c.id});
  await ev(id=>{UI.arTab='conj';UI.arEd=id;go('arena')},cid);await espera(900);await foto(pp,'1-editor');
  const inc=await ev(()=>[...document.querySelectorAll('#view [data-q].arq-inc')].map(x=>x.dataset.q));if(inc.length)falhas.push('editor: perguntas marcadas como incompletas: '+inc.join(','));
  const tipos=await ev(()=>document.querySelectorAll('#view [data-qtp] option').length);if(tipos<13*12)falhas.push('editor: faltam tipos no seletor ('+tipos+')');
  passo='lançar';
  await ev(id=>{UI.arL={modo:'classico',tipo:'vivo',ordem:'seq'};arLancarDlg(arD().conj.find(c=>c.id===id))},cid);await espera(400);await pp.click('#arl-seg');await espera(300);await foto(pp,'2-lancar');await pp.click('#arl-ok');
  await pp.waitForSelector('#arhost .arhlob',{timeout:15000});await espera(500);
  const code=await ev(()=>arH.j.codigo);
  await ev(()=>sp3Cfg({reacoes:true,qa:'moderada',confianca:true}));await espera(800);await pp.click('#sp3-opt');await espera(300);await foto(pp,'3-atrio-opcoes');await pp.click('#sp3-opts [data-ox]');
  passo='alunos entram';
  const alunos=[];for(const nome of ['Lince','Raposa']){const A=await pagina(b,{vp:{width:420,height:860}});A.pg.on('pageerror',e=>falhas.push(nome+' ('+passo+'): '+String(e.message||e).slice(0,200)));await A.pg.route('**/rest/v1/rpc/**',rota(false));
    await A.pg.goto(new URL('spruceit.html',s.url).href+'#'+code);await A.pg.waitForSelector('#alc',{timeout:15000});await A.pg.fill('#alc',nome);await A.pg.click('#b-ent');alunos.push({nome,pg:A.pg,A})}
  await espera(2500);await foto(pp,'4-atrio');
  await pp.click('#arh-go');await espera(2500);
  const [a1,a2]=alunos;
  const clica=async(pg,sel)=>{await pg.waitForSelector(sel,{timeout:8000});await pg.click(sel)};
  const revela=async(nome)=>{await espera(400);await ev(()=>{arH.revPedida=true;return arCtl('revelar')});await espera(2600);await foto(pp,nome+'-ecra');await foto(a1.pg,nome+'-aluno')};
  const seguinte=async()=>{await pp.click('#sp3-seg');await espera(2600)};
  passo='0 escolha múltipla (a dobrar, confiança)';await a1.pg.waitForSelector('.conf3',{timeout:8000});await a1.pg.click('.conf3 [data-cf="2"]');await clica(a1.pg,'.op3[data-o="1"]');await clica(a2.pg,'.op3[data-o="0"]');await foto(pp,'5-q0');await revela('5-q0');
  const pts0=await ev(()=>arH.d.jogadores.find(x=>x.alcunha==='Lince').pontos);if(!(pts0>=1500))falhas.push('escolha múltipla a dobrar com confiança: pontos '+pts0);
  await seguinte();passo='1 várias certas';await clica(a1.pg,'.op3[data-o="0"]');await clica(a1.pg,'.op3[data-o="2"]');await clica(a1.pg,'[data-env]');await clica(a2.pg,'.op3[data-o="0"]');await clica(a2.pg,'[data-env]');await revela('6-q1');
  await seguinte();passo='2 resposta escrita';await a1.pg.waitForSelector('[data-tx]');await a1.pg.fill('[data-tx]',' fe ');await clica(a1.pg,'[data-env]');await a2.pg.waitForSelector('[data-tx]');await a2.pg.fill('[data-tx]','Ferro');await clica(a2.pg,'[data-env]');await revela('7-q2');
  await seguinte();passo='3 deslizante';await a1.pg.waitForSelector('[data-rg]');await a1.pg.$eval('[data-rg]',e=>{e.value=42;e.dispatchEvent(new Event('input'))});await clica(a1.pg,'[data-env]');await a2.pg.waitForSelector('[data-rg]');await clica(a2.pg,'[data-env]');await revela('8-q3');
  await seguinte();passo='4 ordenar';await a1.pg.waitForSelector('[data-or]');await foto(a1.pg,'9-q4-aluno-antes');
  await a1.pg.evaluate(()=>{const ol=document.querySelector('[data-or]');const want=['um','dois','três'];want.forEach(t=>{const li=[...ol.children].find(l=>l.querySelector('span').textContent===t);ol.appendChild(li)})});await clica(a1.pg,'[data-env]');await clica(a2.pg,'[data-env]');await revela('9-q4');
  await seguinte();passo='5 pino';await a1.pg.waitForSelector('[data-pi] img');const bx=await a1.pg.$eval('[data-pi] img',e=>{const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});await a1.pg.mouse.click(bx.x,bx.y);await clica(a1.pg,'[data-env]');
  const bx2=await a2.pg.$eval('[data-pi] img',e=>{const r=e.getBoundingClientRect();return {x:r.left+5,y:r.top+5}});await a2.pg.mouse.click(bx2.x,bx2.y);await clica(a2.pg,'[data-env]');await revela('10-q5');
  await seguinte();passo='6 sondagem';await clica(a1.pg,'.op3[data-o="0"]');await clica(a2.pg,'.op3[data-o="0"]');await revela('11-q6');
  await seguinte();passo='7 escala';await clica(a1.pg,'.es3 [data-o="3"]');await clica(a2.pg,'.es3 [data-o="4"]');await revela('12-q7');
  await seguinte();passo='8 nuvem';for(const [A,t] of [[a1,'Divertida'],[a2,'divertida ']]){await A.pg.waitForSelector('[data-tx]');await A.pg.fill('[data-tx]',t);await clica(A.pg,'[data-env]')}await revela('13-q8');
  await seguinte();passo='9 aberta';for(const [A,t] of [[a1,'Aprendi os símbolos químicos.'],[a2,'Que o ferro é Fe.']]){await A.pg.waitForSelector('[data-tx]');await A.pg.fill('[data-tx]',t);await clica(A.pg,'[data-env]')}
  passo='reações e perguntas do público';await clica(a1.pg,'#bar3 [data-rx="1"]');await espera(1100);await clica(a2.pg,'#bar3 [data-rx="4"]');await clica(a2.pg,'#bar3 [data-qa]');await a2.pg.waitForSelector('#qa3 [data-t]');await a2.pg.fill('#qa3 [data-t]','Podemos ter mais aulas assim?');await clica(a2.pg,'#qa3 [data-e]');await espera(1200);await foto(a2.pg,'14-pergunta-aluno');await a2.pg.click('#qa3 [data-x]');
  await espera(2600);const nqa=await ev(()=>(arH.sp3.qa||[]).length);if(nqa!==1)falhas.push('perguntas do público no professor: '+nqa);
  await pp.click('#sp3-qa');await espera(300);await pp.click('#sp3-qap [data-qm$=":destaque"]');await espera(800);await foto(pp,'14-pergunta-ecra');await pp.click('#sp3-qap [data-qx]');await revela('15-q9');
  await seguinte();passo='10 ideias';for(const [A,t] of [[a1,['Museu','Jardim']],[a2,['Praia']]]){await A.pg.waitForSelector('[data-id="0"]');for(let k=0;k<t.length;k++)await A.pg.fill(`[data-id="${k}"]`,t[k]);await clica(A.pg,'[data-env]')}await revela('16-q10');
  await pp.click('#sp3-vot');await espera(3000);await a2.pg.waitForSelector('.vt3 button:not([disabled])',{timeout:8000});await foto(a2.pg,'17-votar-aluno');await a2.pg.click('.vt3 button:not([disabled])');await espera(1500);
  await pp.click('#sp3-vot');await espera(2600);await foto(pp,'17-votos-ecra');const votos=await ev(()=>(arH.sp3.x3||[]).reduce((s,x)=>s+Object.values(x.v||{}).reduce((a,b)=>a+b,0),0));if(votos!==1)falhas.push('votos nas ideias: '+votos);
  await seguinte();passo='11 diapositivo';await espera(500);await foto(pp,'18-diapositivo');await foto(a1.pg,'18-diapositivo-aluno');
  passo='vista do orador';const [ow]=await Promise.all([pp.context().waitForEvent('page',{timeout:5000}).catch(()=>null),pp.click('#sp3-or')]);await espera(2500);if(ow){await ow.setViewportSize({width:1000,height:640});await foto(ow,'19-orador')}else falhas.push('vista do orador não abriu');
  await pp.click('#sp3-seg');await espera(3000);passo='pódio';await foto(pp,'20-podio');await foto(a1.pg,'20-fim-aluno');
  const R=rpc('arena_resultados3',{p_id:await ev(()=>arH.j.id)},true);const n3=(R.resp3||[]).length;if(n3<16)falhas.push('respostas guardadas com conteúdo: '+n3);
  const certas=Object.fromEntries((R.jogadores||[]).map(j=>[j.alcunha,j.certas]));if(certas.Lince!==6)falhas.push('certas do Lince (esperadas 6: mc, várias, escrita, deslizante, ordenar, pino): '+certas.Lince);
  passo='relatório';await ev(async()=>{const j=arH.j;await arGuardarRes(j);arFecharHost();arRelatorio(j)});await espera(1200);await foto(pp,'21-relatorio');
  const temR3=await ev(()=>!!document.querySelector('.sp3rel'));if(!temR3)falhas.push('relatório sem a parte nova');
  passo='estudo';await ev(id=>{UI.arL={modo:'estudo',tipo:'tpc',ordem:'seq'};arLancarDlg(arD().conj.find(c=>c.id===id))},cid);await espera(400);await pp.click('#arl-seg');await espera(300);await pp.click('#arl-ok');await espera(2500);
  const code2=await ev(()=>arH.j.codigo);const E1=await pagina(b,{vp:{width:420,height:860}});E1.pg.on('pageerror',e=>falhas.push('estudo: '+String(e.message||e).slice(0,200)));await E1.pg.route('**/rest/v1/rpc/**',rota(false));a1.pg=E1.pg;await a1.pg.goto(new URL('spruceit.html',s.url).href+'#'+code2);await a1.pg.waitForSelector('#alc');await a1.pg.fill('#alc','Lince');await a1.pg.click('#b-ent');
  await a1.pg.waitForSelector('.est3c',{timeout:12000});await foto(a1.pg,'22-estudo');await a1.pg.click('[data-m="teste"]');
  for(let k=0;k<6;k++){await espera(400);const tem=await a1.pg.$('.w3');if(!tem)break;const env=await a1.pg.$('.w3 [data-env]');if(await a1.pg.$('.w3 .op3')){await a1.pg.click('.w3 .op3');if(env)await a1.pg.click('.w3 [data-env]')}else if(await a1.pg.$('.w3 [data-tx]')){await a1.pg.fill('.w3 [data-tx]','x');await a1.pg.click('.w3 [data-env]')}else if(await a1.pg.$('.w3 [data-pi]')){const r=await a1.pg.$eval('.w3 [data-pi] img',e=>{const b=e.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}});await a1.pg.mouse.click(r.x,r.y);await a1.pg.click('.w3 [data-env]')}else if(env)await a1.pg.click('.w3 [data-env]');await espera(300);await a1.pg.click('[data-seg]').catch(()=>{})}
  await espera(1200);await foto(a1.pg,'23-estudo-fim');
  for(const P of [Pp,...alunos.map(a=>a.A)]){for(const v of await P.violacoes())falhas.push('política de conteúdo: '+v)}
}catch(e){falhas.push(passo+': '+String(e.message||e).slice(0,300));try{for(const x of b.contexts())for(const [k,pg] of x.pages().entries())await pg.screenshot({path:join(SAI,'spruceit-erro-'+k+'-'+Math.random().toString(36).slice(2,6)+'.png')})}catch(_){}}
await b.close();s.fechar&&s.fechar();
console.log('Spruce It! de ponta a ponta: '+[...new Set(chamadas)].length+' funções da base de dados usadas · capturas em tests/saida/');
console.log('erros: '+falhas.length);falhas.slice(0,30).forEach(f=>console.log(' · '+f));process.exit(falhas.length?1:0);
