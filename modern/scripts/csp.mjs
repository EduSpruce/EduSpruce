// EduSpruce · política de conteúdo (Content-Security-Policy) das páginas publicadas
//   node modern/scripts/csp.mjs <pasta_de_saida>      (chamado pelo ./es no fim de cada construção)
//
// Porquê: a app desenha muito HTML a partir de dados (nomes, respostas de alunos, conteúdo partilhado). Se algum texto escapar
// sem esc(), a política impede que corra como código: só correm os scripts da própria app (ficheiros do sítio e os blocos
// embutidos cuja impressão digital está na política). Não há 'unsafe-inline' nem 'unsafe-eval' para scripts.
//
// Regras para quem mexe no código:
//   · nada de onclick="…"/onsubmit="…" no HTML (usar addEventListener ou os atributos data-* de app/051-utilitarios.js);
//   · nada de eval/new Function; nada de <script> dentro de janelas escritas com document.write (imprimir a partir da app);
//   · um script externo novo (CDN) tem de entrar em EXTERNOS, com o endereço exato;
//   · as páginas dos alunos (/aluno.html, /forms.html, /provas.html, /review.html) recebem aqui a política: correr ./es testa ou ./es pub depois de as editar.
import {readFileSync,writeFileSync,existsSync,copyFileSync} from 'node:fs';import {join,dirname,resolve} from 'node:path';import {createHash} from 'node:crypto';import {gunzipSync} from 'node:zlib';import {fileURLToPath} from 'node:url';
const raizMod=join(dirname(fileURLToPath(import.meta.url)),'..');const RAIZ=join(raizMod,'..');
const h256=t=>"'sha256-"+createHash('sha256').update(t,'utf8').digest('base64')+"'";
const RE_SC=/<script([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const executavel=at=>!/\bsrc\s*=/i.test(at)&&!/\btype\s*=\s*["']?(application\/json|application\/octet-stream|application\/ld\+json|text\/plain)/i.test(at);
/* impressões digitais dos scripts embutidos (o texto exato entre <script> e </script>, como o navegador o vê) */
export function hashesDe(html){const H=[];let m;RE_SC.lastIndex=0;while((m=RE_SC.exec(html))){if(executavel(m[1])&&m[2].trim())H.push(h256(m[2].replace(/\r\n?/g,'\n')))}return [...new Set(H)]}
const RE_META=/(?:<meta charset="utf-8" data-csp>)?<meta http-equiv="Content-Security-Policy"[^>]*>\n?/gi;
/* a política fica logo no início do <head>, antes de qualquer script (só vale para o que vem depois dela) */
function porMeta(html,politica){let s=html.replace(RE_META,'');const meta='<meta http-equiv="Content-Security-Policy" content="'+politica.replace(/"/g,'&quot;')+'">\n';
  const mh=/<head[^>]*>\s*(<meta charset="[^"]*">\s*)?/i.exec(s);if(mh){const k=mh.index+mh[0].length;return s.slice(0,k)+(mh[1]?'':'<meta charset="utf-8" data-csp>')+meta+s.slice(k)}
  const md=/<!doctype html>\s*(<html[^>]*>)?\s*(<meta charset="[^"]*">)?/i.exec(s);if(md){const k=md.index+md[0].length;return s.slice(0,k)+meta+s.slice(k)}
  throw new Error('csp: página sem <head> nem <!doctype html>')}
const junta=o=>Object.entries(o).filter(([,v])=>v!=null).map(([k,v])=>(k+' '+(Array.isArray(v)?v.filter(Boolean).join(' '):v)).trim()).join('; ');

/* scripts de fora do sítio que a app pode carregar (endereços exatos ou pastas de uma versão fixa) */
const EXTERNOS=[
  'https://accounts.google.com/gsi/client',                                   // entrar com Google / Google Drive (cópia fria) / enviar e-mails pela conta do professor
  'https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js',           // conta Microsoft (quando estiver configurada)
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/',                  // leitor de PDF de reserva (navegadores sem descompressão)
];
export function politicas(cfg){const sb=new URL(cfg.url).origin,ws='wss://'+new URL(cfg.url).host;
  return {
    /* a app (professor) */
    app:(h)=>junta({'default-src':"'none'",
      'script-src':["'self'",...h,"'wasm-unsafe-eval'",'blob:',...EXTERNOS],
      'style-src':["'self'","'unsafe-inline'",'https://accounts.google.com/gsi/style'],
      'img-src':["'self'",'data:','blob:','https:'],'media-src':["'self'",'data:','blob:','https:'],'font-src':["'self'",'data:'],
      'connect-src':["'self'",'https:',ws,'data:','blob:'],
      'worker-src':["'self'",'blob:'],'child-src':["'self'",'blob:'],
      'frame-src':["'self'",'blob:','data:','https://accounts.google.com/gsi/','https://www.youtube-nocookie.com','https://player.vimeo.com','https://maps.google.com','https://www.google.com'],
      'manifest-src':"'self'",'object-src':["'self'",'blob:'],'base-uri':"'self'",'form-action':"'self'"}),
    /* páginas dos alunos (sem conta): só falam com a base de dados */
    aluno:(h)=>junta({'default-src':"'none'",'script-src':["'self'",...h],'style-src':["'self'","'unsafe-inline'"],
      'img-src':["'self'",'data:','blob:'],'media-src':["'self'",'data:','blob:'],'font-src':["'self'",'data:'],
      'connect-src':["'self'",sb,ws],'manifest-src':"'self'",'object-src':"'none'",'base-uri':"'none'",'form-action':"'none'"}),
    /* Spruce Review (página do aluno): como as dos alunos, mas mostra capturas de ecrã de outros endereços */
    alunoImg:(h)=>junta({'default-src':"'none'",'script-src':["'self'",...h],'style-src':["'self'","'unsafe-inline'"],
      'img-src':["'self'",'data:','blob:','https:'],'media-src':["'self'",'data:','blob:'],'font-src':["'self'",'data:'],
      'connect-src':["'self'",sb,ws],'manifest-src':"'self'",'object-src':"'none'",'base-uri':"'none'",'form-action':"'none'"}),
    /* EduSchedule (abre dentro da app; o motor de horários corre num trabalhador criado a partir do próprio código) */
    eduschedule:(h)=>junta({'default-src':"'none'",'script-src':["'self'",...h,'blob:'],'style-src':["'self'","'unsafe-inline'"],
      'img-src':["'self'",'data:','blob:'],'font-src':["'self'",'data:'],'connect-src':["'self'",sb,ws,'data:','blob:'],
      'worker-src':["'self'",'blob:'],'child-src':["'self'",'blob:'],'frame-src':["'self'",'blob:'],'object-src':"'none'",'base-uri':"'self'",'form-action':"'self'"}),
    /* consulta pública dos horários: a página publicada abre isolada (sandbox) e herda esta política */
    horarios:(h)=>junta({'default-src':"'none'",'script-src':[...h],'style-src':["'self'","'unsafe-inline'"],
      'img-src':["'self'",'data:','blob:','https:'],'font-src':["'self'",'data:'],'connect-src':[sb],'frame-src':["'self'"],
      'object-src':"'none'",'base-uri':"'none'",'form-action':"'none'"}),
    /* páginas só de texto (privacidade, termos) e reencaminhamentos */
    texto:(h)=>junta({'default-src':"'none'",'script-src':h.length?[...h]:"'none'",'style-src':["'self'","'unsafe-inline'"],'img-src':["'self'",'data:'],'font-src':["'self'",'data:'],
      'object-src':"'none'",'base-uri':"'none'",'form-action':"'none'"})}}

/* scripts da ficha MRA (documento embutido que abre num iframe srcdoc e herda a política da app) */
function hashesMRA(html,dir){const m=/<script type="application\/octet-stream" id="mragz"(?: data-src="([^"]+)")?>([\s\S]*?)<\/script>/.exec(html);if(!m)return [];
  let b64=m[2].trim();if(!b64&&m[1]){const f=join(dir,m[1]);if(!existsSync(f))throw new Error('csp: falta '+m[1]);b64=readFileSync(f,'utf8').trim()}
  if(!b64)return [];return hashesDe(gunzipSync(Buffer.from(b64,'base64')).toString('utf8'))}

const PAGINAS={'index.html':'app','spruceit.html':'aluno','pulso.html':'aluno','aluno.html':'aluno','forms.html':'aluno','provas.html':'aluno','review.html':'alunoImg',
  'eduschedule.html':'eduschedule','horarios.html':'horarios','arena.html':'texto','privacidade.html':'texto','termos.html':'texto'};
/* páginas editadas à mão na raiz do repositório: numa construção de teste copiam-se para a pasta de saída; na publicação recebem a política no próprio sítio */
const DA_RAIZ=['aluno.html','forms.html','provas.html','review.html','privacidade.html','termos.html'];

export function aplicar(dir){const cfg=JSON.parse(readFileSync(join(raizMod,'supabase-config.json'),'utf8'));const P=politicas(cfg);const feito=[];
  const naRaiz=resolve(dir)===resolve(RAIZ);
  if(!naRaiz)for(const f of DA_RAIZ)if(existsSync(join(RAIZ,f)))copyFileSync(join(RAIZ,f),join(dir,f));
  for(const [f,tipo] of Object.entries(PAGINAS)){const p=join(dir,f);if(!existsSync(p))continue;
    const html=readFileSync(p,'utf8');const limpo=html.replace(RE_META,'');
    const h=hashesDe(limpo);if(tipo==='app')h.push(...hashesMRA(limpo,dir));
    const novo=porMeta(limpo,P[tipo]([...new Set(h)]));if(novo!==html)writeFileSync(p,novo);feito.push(f)}
  /* quem editou uma página da raiz e construiu só para teste: a da raiz fica também em dia (a política tem de corresponder ao script) */
  if(!naRaiz)for(const f of DA_RAIZ){const a=join(dir,f),b=join(RAIZ,f);if(existsSync(a)&&existsSync(b)&&readFileSync(a,'utf8')!==readFileSync(b,'utf8'))copyFileSync(a,b)}
  return feito}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const dir=process.argv[2];if(!dir){console.error('uso: node csp.mjs <pasta>');process.exit(1)}
  const f=aplicar(dir);console.log('política de conteúdo: '+f.length+' páginas')}
