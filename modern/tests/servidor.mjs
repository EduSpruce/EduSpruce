// Servidor de testes da versão com base de dados: serve a pasta construída por HTTP (com a política de conteúdo ativa)
// e troca a ligação ao Supabase por uma base de dados falsa em memória (a conta de teste está sempre autorizada).
//   import {servir} from './servidor.mjs';const s=await servir('/tmp/es/build');  →  s.url, s.bd (Map nome→texto), s.fechar()
import http from 'node:http';import {readFileSync,existsSync,statSync} from 'node:fs';import {join,extname,normalize} from 'node:path';import {createHash} from 'node:crypto';
export const CONTA={id:'00000000-0000-4000-8000-000000000001',email:'professora.teste@example.org',nome:'Ana Silva'};
const TIPOS={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.woff2':'font/woff2','.pdf':'application/pdf','.wasm':'application/wasm','.gz':'application/gzip'};
/* ligação falsa: a mesma interface do esm/supabase-prov.mjs, com os dados guardados neste servidor (sobrevivem a recarregar a página) */
const ARRANQUE=`const C=${JSON.stringify(CONTA)};const bd=async(op,nome,texto)=>{const r=await fetch('/__bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({op,nome,texto})});if(!r.ok)throw new Error('bd '+r.status);return r.json()};
const perfil={id:C.id,email:C.email,nome:C.nome,foto:''};
/* tabelas em memória (window.__tb) com o essencial do construtor de pedidos do Supabase: insert/select/update/delete, eq/neq/gt, order, maybeSingle */
const TB=window.__tb={};const linhas=t=>TB[t]||(TB[t]=[]);let seq=1;
const q=tab=>{const st={op:'select',f:[],ord:null,vals:null,um:false};
  const filtra=()=>linhas(tab).filter(r=>st.f.every(([k,c,v])=>c==='eq'?r[k]===v:c==='gt'?r[k]>v:c==='neq'?r[k]!==v:true));
  const corre=()=>{if(st.op==='insert'){const L=Array.isArray(st.vals)?st.vals:[st.vals];for(const r of L){if(r.id!=null&&linhas(tab).some(x=>x.id===r.id))return {data:null,error:{code:'23505',message:'duplicate key value'}};linhas(tab).push(Object.assign({id:seq++},r))}return {data:null,error:null}}
    if(st.op==='delete'){const M=filtra();TB[tab]=linhas(tab).filter(r=>!M.includes(r));return {data:null,error:null}}
    if(st.op==='update'){filtra().forEach(r=>Object.assign(r,st.vals));return {data:null,error:null}}
    let M=filtra();if(st.ord)M=M.slice().sort((a,b)=>a[st.ord]>b[st.ord]?1:a[st.ord]<b[st.ord]?-1:0);return {data:st.um?(M[0]||null):M,error:null}};
  const b={select(){return b},eq(k,v){st.f.push([k,'eq',v]);return b},neq(k,v){st.f.push([k,'neq',v]);return b},gt(k,v){st.f.push([k,'gt',v]);return b},order(k){st.ord=k;return b},
    insert(v){st.op='insert';st.vals=v;return b},update(v){st.op='update';st.vals=v;return b},upsert(v){st.op='insert';st.vals=v;return b},delete(){st.op='delete';return b},
    maybeSingle(){st.um=true;return Promise.resolve(corre())},single(){st.um=true;return Promise.resolve(corre())},then(ok,ko){return Promise.resolve(corre()).then(ok,ko)}};
  for(const m of ['gte','lt','lte','not','in','is','like','range','limit','match','filter','or'])b[m]=()=>b;return b};
const canal=()=>{const c={on(){return c},subscribe(f){try{f&&f('SUBSCRIBED')}catch(_){}return c},send(){return Promise.resolve('ok')},unsubscribe(){return Promise.resolve('ok')},track(){return Promise.resolve('ok')}};return c};
const cliente={from:t=>q(t),rpc:async(fn,a)=>{(window.__rpc=window.__rpc||[]).push(fn);return {data:null,error:null}},channel:()=>canal(),removeChannel(){},functions:{invoke:async()=>({data:null,error:null})},
  storage:{from:()=>({upload:async()=>({data:{},error:null}),download:async()=>({data:null,error:null}),remove:async()=>({data:[],error:null}),list:async()=>({data:[],error:null})})},
  auth:{getSession:async()=>({data:{session:{user:{id:C.id,email:C.email,user_metadata:{full_name:C.nome}},access_token:'t.t.t'}},error:null}),refreshSession:async()=>({data:{},error:null}),onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}}},signOut:async()=>({error:null}),updateUser:async()=>({data:{},error:null}),getUser:async()=>({data:{user:{id:C.id,email:C.email}},error:null})}};
window.EduSpruceModerno={ativo:true,pronto:true,supabase:{n:'Base de dados EduSpruce (teste)',cliente,
  async sessao(){return perfil},aoMudar(){},async entrarGoogle(){},async entrarSenha(){},async definirSenha(){},async autorizado(){return true},async diagAut(){return 'teste'},tempoReal(){return null},async sair(){},
  async lista(){return (await bd('lista')).v},async lerDados(){return (await bd('dados')).v},async ler(n){return (await bd('ler',n)).v},async escrever(n,t){await bd('escrever',n,t)},async criar(n,t){return (await bd('criar',n,t)).v},async apagar(n){await bd('apagar',n)}}};
try{window.dispatchEvent(new Event('es-bd'))}catch(_){}`;
export async function servir(dir,{porta=0}={}){const bd=new Map();const pedidos=[];const ctl={falhar:false,gravacoes:0}; /* ctl.falhar=true → a base de dados recusa gravar (para testar o aviso de falha) */
  const cfg=JSON.stringify({googleClientId:'',microsoftClientId:'',acessoGoogle:'lista',modoNuvem:'obrigatorio',contasGoogle:[{h:createHash('sha256').update('eduspruce:'+CONTA.email).digest('hex'),papel:'admin'}]});
  const srv=http.createServer((req,res)=>{const u=new URL(req.url,'http://x');let p=decodeURIComponent(u.pathname);pedidos.push(p);
    if(p==='/__bd'&&req.method==='POST'){let b='';req.on('data',c=>b+=c);req.on('end',()=>{let o={};try{o=JSON.parse(b)}catch(_){}let v=null;
        if(['escrever','criar','apagar'].includes(o.op)){if(ctl.falhar){res.writeHead(500,{'Content-Type':'text/plain'});res.end('falha simulada');return}ctl.gravacoes++}
        if(o.op==='lista'){v={};for(const [k,t] of bd)v[k]=t.length}else if(o.op==='dados'){v={};for(const [k,t] of bd)if(!k.startsWith('ef-f-'))v[k]=t}
        else if(o.op==='ler')v=bd.has(o.nome)?bd.get(o.nome):null;else if(o.op==='escrever'){bd.set(o.nome,String(o.texto))}
        else if(o.op==='criar'){if(bd.has(o.nome))v=false;else{bd.set(o.nome,String(o.texto));v=true}}else if(o.op==='apagar')bd.delete(o.nome);
        res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({v}))});return}
    if(p==='/esm/arranque.mjs'){res.writeHead(200,{'Content-Type':TIPOS['.mjs'],'Cache-Control':'no-store'});res.end(ARRANQUE);return}
    if(p==='/eduspruce-config.json'){res.writeHead(200,{'Content-Type':TIPOS['.json'],'Cache-Control':'no-store'});res.end(cfg);return}
    if(p==='/sw.js'){res.writeHead(404);res.end();return} /* sem service worker nos testes: cada pedido vem deste servidor */
    if(p.endsWith('/'))p+='index.html';const f=normalize(join(dir,p));
    if(!f.startsWith(normalize(dir))||!existsSync(f)||!statSync(f).isFile()){res.writeHead(404,{'Content-Type':'text/plain'});res.end('404');return}
    res.writeHead(200,{'Content-Type':TIPOS[extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(readFileSync(f))});
  await new Promise(ok=>srv.listen(porta,'127.0.0.1',ok));
  return {url:'http://127.0.0.1:'+srv.address().port+'/',bd,pedidos,ctl,fechar:()=>new Promise(ok=>srv.close(ok))}}
/* Chromium (o do Playwright instalado ou o do ambiente) */
export async function navegador(){const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);let pw;try{pw=require('playwright')}catch(e){pw=require('/opt/npm-tools/node_modules/playwright')}
  const opts={};for(const x of ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'])try{require('fs').accessSync(x);opts.executablePath=x}catch(e){}
  return pw.chromium.launch(opts)}
/* sessão guardada no aparelho (como depois de entrar com Google): a app abre logo, sem ecrã de entrada */
export const SESSAO_INIT=`try{localStorage.setItem('eduspruce.sb',JSON.stringify({user:{id:${JSON.stringify(CONTA.id)},email:${JSON.stringify(CONTA.email)},user_metadata:{full_name:${JSON.stringify(CONTA.nome)}}},refresh_token:'r',access_token:'t.t.t',expires_at:Math.floor(Date.now()/1000)+86400}))}catch(_){}`;
/* página com registo de erros e de violações da política de conteúdo (sem a contornar) */
export async function pagina(b,{vp={width:1440,height:900},init=''}={}){const ctx=await b.newContext({viewport:vp,serviceWorkers:'block'});const pg=await ctx.newPage();const erros=[],csp=[];
  await pg.addInitScript(`(()=>{try{localStorage.setItem('edugest.debug','1')}catch(_){}window.__csp=[];document.addEventListener('securitypolicyviolation',e=>{window.__csp.push((e.violatedDirective||'')+' ← '+(e.blockedURI||'')+' @'+(e.sourceFile||'').split('/').pop()+':'+(e.lineNumber||0)+' '+String(e.sample||'').slice(0,60))});${init}})()`);
  pg.on('pageerror',e=>erros.push(String(e.message||e).slice(0,240)));
  pg.on('console',m=>{if(m.type()!=='error')return;const t=m.text();if(/Content Security Policy|Refused to/i.test(t)){csp.push(t.slice(0,300));return}if(!/Failed to load resource|net::ERR|favicon/.test(t))erros.push('consola: '+t.slice(0,240))});
  const violacoes=async()=>{let v=[];try{v=await pg.evaluate(()=>window.__csp||[])}catch(_){}return [...new Set([...v,...csp])]};
  return {ctx,pg,erros,violacoes}}
