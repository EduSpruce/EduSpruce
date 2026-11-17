/* =====================================================================
   UTILITÁRIOS
   ===================================================================== */
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* 1.084 · segurança — o que chega de fora (respostas dos alunos, cifradas com o código da sessão que toda a turma conhece; conteúdo partilhado por colegas) é texto de fora:
   passam só objetos simples (chaves curtas e sem carateres de HTML), números finitos e textos de tamanho limitado.
   Nada do que venha daqui pode ser desenhado sem esc(); números e identificadores confirmam-se com esNumOk/esIdOk. */
const ES_CH_MAL=/[<>"'&\x60\\\u0000-\u001f]/;
function esLimpo(v,p){p=p||0;if(v==null)return null;const t=typeof v;
  if(t==='number')return isFinite(v)?v:0;if(t==='boolean')return v;if(t==='string')return v.length>200000?v.slice(0,200000):v;
  if(t!=='object'||p>8)return null;if(Array.isArray(v))return v.slice(0,2000).map(x=>esLimpo(x,p+1));
  const o={};let n=0;for(const k of Object.keys(v)){if(n++>=3000)break;if(!k||k.length>120||ES_CH_MAL.test(k)||k==='__proto__'||k==='constructor'||k==='prototype')continue;o[k]=esLimpo(v[k],p+1)}return o}
const esNumOk=x=>{x=typeof x==='number'||typeof x==='string'?+x:0;return isFinite(x)?x:0};
const esIdOk=x=>{x=typeof x==='string'||typeof x==='number'?String(x):'';return /^[\w\-:.|~]{1,80}$/.test(x)&&x!=='__proto__'&&x!=='constructor'&&x!=='prototype'?x:''};
const esTxtOk=(x,n)=>(typeof x==='string'||typeof x==='number'?String(x):'').slice(0,n||200);
/* resposta a uma pergunta, posta na forma que o tipo da pergunta espera (o que não encaixa fica vazio: nunca parte a página de resultados) */
function esRespTipo(q,v){if(v==null)return v;const S=(x,n)=>typeof x==='string'?x.slice(0,n||20000):typeof x==='number'&&isFinite(x)?String(x):'';const O=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  switch(q&&q.tipo){
    case 'escolha':return Array.isArray(v)?v.slice(0,200).map(x=>S(x,2000)).filter(Boolean):S(v,2000);
    case 'ordem':return Array.isArray(v)?v.slice(0,300).map(x=>S(x,80)):[];
    case 'vf':{const o={};if(O(v))(q.linhas||[]).forEach(l=>{if(v[l.id]===true||v[l.id]===false)o[l.id]=v[l.id]});return o}
    case 'likert':{const o={};if(O(v))(q.linhas||[]).forEach(l=>{const x=v[l.id];if((typeof x==='number'||typeof x==='string')&&x!==''&&isFinite(+x))o[l.id]=+x});return o}
    case 'lacunas':case 'legendar':return Array.isArray(v)?v.slice(0,300).map(x=>S(x,400)):[];
    case 'ligar':{const o={};if(O(v))Object.keys(v).slice(0,300).forEach(k=>{if(typeof v[k]==='string')o[k]=v[k].slice(0,80)});return o}
    case 'tabela':{const o={};if(O(v))Object.keys(v).slice(0,3000).forEach(k=>{if(/^\d{1,3}\|\d{1,3}$/.test(k)&&v[k])o[k]=true});return o}
    case 'segmentos':return Array.isArray(v)?v.slice(0,300).filter(O).map(p=>({x:Math.max(0,Math.min(100,esNumOk(p.x))),y:Math.max(0,Math.min(100,esNumOk(p.y)))})):[];
    case 'classif':case 'nps':case 'escala':return typeof v==='number'||typeof v==='string'?(isFinite(+v)&&v!==''?+v:S(v,40)):'';
    default:return typeof v==='object'?'':typeof v==='boolean'?v:S(v,200000)}} /* texto livre: até ao limite de uma resposta inteira (200 000 carateres) */
/* as respostas todas de um aluno: só as chaves das perguntas que existem (e a justificação «id~j»), cada uma na forma do seu tipo */
function esRespOk(itens,resp){const o={};if(!resp||typeof resp!=='object'||Array.isArray(resp))return o;
  (itens||[]).forEach(q=>{if(!q||!q.id)return;if(Object.prototype.hasOwnProperty.call(resp,q.id)){const v=esRespTipo(q,resp[q.id]);if(v!=null)o[q.id]=v}
    const j=resp[q.id+'~j'];if(typeof j==='string'&&j)o[q.id+'~j']=j.slice(0,20000)});return o}
/* conteúdo feito por outra pessoa (avaliação, exercício, quiz ou critérios partilhados por um colega, por código, biblioteca ou ficheiro):
   além do esLimpo, os identificadores têm de ser simples, os tipos são palavras, as cores são cores e as imagens são imagens */
function esPartilhaOk(v){v=esLimpo(v);const m=new Map();const novoId=x=>{if(!m.has(x))m.set(x,'i'+Date.now().toString(36)+m.size.toString(36)+Math.random().toString(36).slice(2,6));return m.get(x)};
  const IMG=/^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+\/=]+$/i,TOK=/^[\w\-:.|~]{1,80}$/;
  const anda=o=>{if(Array.isArray(o)){o.forEach(anda);return}if(!o||typeof o!=='object')return;
    for(const k of Object.keys(o)){const x=o[k];
      if(typeof x==='string'){
        if(/(^|[a-z])id$/i.test(k)||k==='salto'||k==='sid'||k==='code'||k==='codigo'){if(x&&!TOK.test(x))o[k]=novoId(x)}
        else if(k==='tipo'||k==='tp'||k==='modo'){if(!/^[\w\-]{0,40}$/.test(x))o[k]=''}
        else if(k==='cor'||k==='cor2'||k==='ink'){if(!/^(#[0-9a-f]{3,8}|[a-z]{3,20}|(rgb|hsl)a?\([\d\s.,%\/]+\))$/i.test(x))o[k]=''}
        else if(k==='img'||k==='imgd'||k==='foto'||k==='logo'||k==='thumb'){if(!IMG.test(x)&&!TOK.test(x))delete o[k]}
        else if(k==='x'||k==='y'||k==='w'||k==='h'){o[k]=esNumOk(x)}}
      else anda(x)}};
  anda(v);return v}
/* 1.084 · a app nunca corre dentro de uma página de outro sítio (proteção contra cliques enganados): se acontecer, fica invisível */
try{if(window.top!==window.self){let mesmo=false;try{mesmo=window.top.location.origin===location.origin}catch(_){}if(!mesmo)document.documentElement.style.display='none'}}catch(_){}
/* 1.084 · registo de erros técnicos — o que antes falhava em silêncio fica registado NESTE aparelho (nunca é enviado para lado nenhum):
   erros de JavaScript, promessas rejeitadas sem tratamento, avisos da consola e bloqueios da política de conteúdo.
   Vê-se e copia-se em Definições › Ferramentas › Erros Técnicos. Não guarda dados de alunos: só a mensagem técnica, o ficheiro e a vista. */
const ES_ERR_K='es.erros';let _esErros=null;
function esErros(){if(_esErros)return _esErros;try{_esErros=JSON.parse(localStorage.getItem(ES_ERR_K)||'[]')}catch(_){_esErros=[]}if(!Array.isArray(_esErros))_esErros=[];return _esErros}
function esErro(tipo,msg,onde){try{const L=esErros();const m=String(msg==null?'':msg).replace(/\s+/g,' ').slice(0,400),o=String(onde||'').slice(0,160);let v='',ver='';try{v=VIEW||''}catch(_){}try{ver=VERSAO||''}catch(_){}
    /* o mesmo erro repetido (nos últimos 12 registos e na última hora) conta-se, não se repete */
    const u=L.slice(-12).reverse().find(x=>x.t===tipo&&x.m===m&&x.o===o&&Date.now()-x.q<3600e3);if(u){u.n=(u.n||1)+1;u.q=Date.now()}else L.push({q:Date.now(),t:tipo,m,o,v,ver});
    while(L.length>60)L.shift();clearTimeout(esErro._t);esErro._t=setTimeout(()=>{try{localStorage.setItem(ES_ERR_K,JSON.stringify(L))}catch(_){}},400)}catch(_){}}
function esErrosLimpar(){_esErros=[];try{localStorage.removeItem(ES_ERR_K)}catch(_){}}
addEventListener('error',e=>{if(!e||typeof ErrorEvent==='undefined'||!(e instanceof ErrorEvent))return;if(e.filename&&esAlheio(e.filename,''))return;const f=e.filename?String(e.filename).split('/').pop().split('?')[0]+':'+(e.lineno||0)+':'+(e.colno||0):'';esErro('erro',e.message||(e.error&&e.error.message)||'erro',f)});
addEventListener('unhandledrejection',e=>{const r=e&&e.reason;const m=(r&&(r.message||String(r)))||'promessa rejeitada';if(/AbortError|The user aborted|ResizeObserver loop/i.test(m))return;if(/Content Security Policy/i.test(m)&&(!r||!r.stack||!String(r.stack).includes(location.origin)))return;esErro('promessa',m,r&&r.stack?String(r.stack).split('\n')[1]||'':'')});
/* 1.086 · código injetado por extensões do navegador (blob:, chrome-extension:, domínios alheios) não é da app: a política bloqueia-o e não se regista */
function esAlheio(f,u){f=String(f||'');u=String(u||'');return /^(blob:|chrome-extension:|moz-extension:|safari-web-extension:|webkit-masked-url:)/.test(f)||/^(chrome-extension|moz-extension|safari-web-extension):/.test(u)||(/^https?:/.test(u)&&!/(eduspruce\.(pt|app|github\.io)|supabase\.co|googleapis\.com|gstatic\.com|google\.com|microsoftonline\.com|microsoft\.com)/.test(u)&&!!f&&!f.startsWith(location.origin))}
document.addEventListener('securitypolicyviolation',e=>{if(esAlheio(e.sourceFile,e.blockedURI)||(e.blockedURI==='eval'&&!String(e.sourceFile||'').startsWith(location.origin)))return;esErro('política',(e.violatedDirective||'')+' bloqueou '+(String(e.blockedURI||'').slice(0,120)||'código embutido'),(String(e.sourceFile||'').split('/').pop()||'')+':'+(e.lineNumber||0))});
{const txt=a=>{try{return [].slice.call(a).map(x=>x&&x.message?x.message:typeof x==='string'?x:(()=>{try{return JSON.stringify(x)}catch(_){return String(x)}})()).join(' ')}catch(_){return ''}};
  ['error','warn'].forEach(k=>{const o=console[k];if(typeof o!=='function')return;console[k]=function(){try{esErro(k==='error'?'consola':'aviso',txt(arguments),'')}catch(_){}return o.apply(console,arguments)}})}
/* 1.084 · sem manipuladores embutidos no HTML (onclick="…", onsubmit="…"): a política de conteúdo da página não os deixa correr.
   Em vez deles usam-se atributos data-* tratados aqui: data-nosub (formulário que não se envia), data-rmerro (imagem que sai se falhar), data-selall (seleciona ao tocar) */
document.addEventListener('submit',e=>{const f=e.target;if(f&&f.matches&&f.matches('form[data-nosub]'))e.preventDefault()},true);
document.addEventListener('error',e=>{const t=e.target;if(t&&t.tagName==='IMG'&&t.hasAttribute&&t.hasAttribute('data-rmerro'))t.remove()},true);
/* ligações: nunca correm código (javascript:, vbscript:, data:text/html), venham de onde vierem */
const esLigacaoMa=h=>/^(javascript|vbscript|data:text\/html)/i.test(String(h||'').replace(/[\u0000- ]/g,''));
['click','auxclick'].forEach(ev=>document.addEventListener(ev,e=>{const t=e.target;if(!t||!t.closest)return;
  if(ev==='click'){const s=t.closest('[data-selall]');if(s&&s.select)try{s.select()}catch(_){}}
  const a=t.closest('a[href],area[href]');if(a&&esLigacaoMa(a.getAttribute('href'))){e.preventDefault();e.stopPropagation()}},true));
/* ficheiros guardados que se abrem numa janela: os tipos que podem correr código (HTML, SVG, XML) abrem como texto simples */
const mimeSeguro=m=>{m=String(m||'').toLowerCase().split(';')[0].trim();return /html|svg|xml|javascript|ecmascript/.test(m)?'text/plain':m};
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name.replace(/[\/\\:*?"<>|]/g,'-');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
const fmtD=iso=>{if(!iso)return'';const p=iso.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:iso};
const nf=(v,d=1)=>v==null||v===''?'':(Math.round(v*Math.pow(10,d))/Math.pow(10,d)).toString().replace('.',',');
const domById=(t,id)=>t.dominios.find(d=>d.id===id);
const oa=a=>a.genero==='F'?'a':'o';
const aluno_a=a=>a.genero==='F'?'aluna':'aluno';
function csv(rows){return '﻿'+rows.map(r=>r.map(c=>{c=c==null?'':String(c);return /[;"\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(';')).join('\n')}
/* género automático pelo primeiro nome (pode ser alterado à mão) */
const FEM=new Set('inês ines beatriz raquel isabel isabelle isabele carmen lurdes lourdes mercedes ruth rute ester esther abigail leonor matilde alice clarice clarisse íris iris irene simone yasmin yasmine jasmim jasmin noémi noemi luz liz rosário rosario conceição conceicao assunção assuncao graça graca dulce denise beatrice yolanda yolande sol miriam míriam ingrid zoé zoe chloe chloé charlotte nicole michelle michele jéssica jessica mel mercês merces glória gloria nazaré nazare aline eliane elaine gabrielle tainá taina raissa celeste arlete bernadete odete ivone liliane margarete elisabete elizabete lisete susete salomé salome taís tais thaís thais tatiane cristiane daniele danielle emily emilly kelly kimberly lauren lily lorraine madeleine nadine nathalie natalie noelle sharon valerie vivian vivianne yasmim hellen helen kathleen caroline carolyne jennifer jenifer grace joyce janice anne annie marie maryline evelyn evelin ellen allison alison camille juliet juliette rachel raquel ariane josiane rosane viviane iolanda mafalda inez esperança esperanca deise daise'.split(' '));
const MASC_A=new Set('luca lucca joshua nikita elia batista garcia andrea jonatha mattia noah juda judas josua sacha sasha akira kosta moussa aliyah'.split(' '));
const MASC=new Set('noa'.split(' '));
function guessGen(n){const f=((n||'').trim().split(/\s+/)[0]||'').toLowerCase().replace(/[^\p{L}]/gu,'');if(!f)return 'M';if(FEM.has(f))return 'F';if(MASC_A.has(f)||MASC.has(f))return 'M';return /a$/.test(f)?'F':'M'}
function setNome(a,nome){a.nome=nome;if(!a.generoManual)a.genero=guessGen(nome)}
function titleCase(s){const low=['de','da','do','das','dos','e'];return s.toLowerCase().split(/\s+/).map((w,i)=>i&&low.includes(w)?w:w.replace(/(^|[-'])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase())).join(' ')}
function idade(n){if(!n)return'';const d=new Date(n);if(isNaN(d))return'';return Math.floor((Date.now()-d)/31557600000)}
function openDrawer(title,html){const d=$('#drawer');if(!d.classList.contains('on'))openDrawer.ret=document.activeElement;$('#dw-t').textContent=title;$('#dw-b').innerHTML=html;d.classList.add('on');document.body.classList.add('dw-on');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','dw-t');setTimeout(()=>{if(!d.contains(document.activeElement)){const f=d.querySelector('.dwb input:not([type=hidden]),.dwb select,.dwb textarea,.dwb button');(f||$('#dw-x')).focus({preventScroll:true})}},60)}
function closeDrawer(){const d=$('#drawer');if(!d.classList.contains('on'))return;d.classList.remove('on');document.body.classList.remove('dw-on');const r=openDrawer.ret;openDrawer.ret=null;if(r&&document.contains(r)&&r.focus)try{r.focus({preventScroll:true})}catch(_){}}
$('#dw-x').onclick=closeDrawer;
function novoAluno(t,nome){const n=Math.max(0,...t.alunos.map(a=>+a.num||0))+1;return {id:uid(),num:n,processo:'',nome:nome||'',genero:guessGen(nome),nasc:'',frequenta:true,repetente:false,ase:'',eeNome:'',eeContacto:'',email:'',obs:'',medidas:{univ:[],selet:[],adic:[]},acomod:[],autoav:{},obsPer:{}}}
function mkDominios(tpl){return (MODELOS[tpl]||MODELOS.gen).map(([ab,nome,peso],k)=>({id:uid()+k,ab,nome,peso}))}
const discInfo=n=>DISCIPLINAS.find(d=>d.n===n);

/* ---------- ícone do ano de escolaridade (10, 11, 12…) ---------- */
function anoNum(t){const n=parseInt(t&&t.anoEsc);return isNaN(n)?(/pr[eé]/i.test((t&&t.anoEsc)||'')?'PE':'?'):String(n)}
/* v1.029 · ícone do curso no distintivo da turma (profissional/PROFIJ ou turma com curso): escolhido pelo nome do curso */
const CURSO_IC=[[/logist|armazem|transport|aprovision/,'cTruck'],[/informat|programa|redes|multimedia|computad|sistemas|digital|web|jogos/,'cMonitor'],[/turism|viagens|aviac|guia/,'cPlane'],[/cozinha|pastelar|restaura|culinar|padar/,'cChef'],[/mesa|bar\b|barist|bebidas/,'cCoffee'],[/eletric|eletron|eletrot|automac|energ|renovav|instalac/,'cZap'],[/mecan|mecatron|automove|manutenc|serralh|soldad|metalom|maquin/,'cWrench'],[/comerc|vendas|marketing|retalho|loja/,'cCart'],[/contabil|gestao|secretar|administrat|financ|banca|seguros|escritorio/,'cBrief'],[/agric|agro|jardin|florest|ambiente|pecuar|horti|vitivin|pescas|aquacult/,'cLeaf'],[/cabeleir|estetic|barbear|beleza/,'cScissors'],[/constru|civil|carpint|marcen|obras|madeira/,'cHammer'],[/fotograf|audiovis|video|cinema|comunicac/,'cCamera'],[/design|artes|grafic|moda|costura|ceramic/,'palette'],[/saude|enfermag|farmac|geriatr|auxiliar de/,'heart'],[/desport|exercic|fitness/,'run'],[/infancia|apoio|social|animac|psicossoc/,'users'],[/som|music|espetac/,'mic'],[/laborat|quimic|analis/,'flask']];
function cursoIc(t){try{if(!t)return '';if(t.icone!==undefined)return t.icone;const o=ofertaDe(t);const cur=(t.curso||'')+' '+((t.cnq&&t.cnq.nome)||'');if(!cur.trim()&&o!=='profissional'&&o!=='profij')return '';const s=normT(cur+' '+(o==='profissional'||o==='profij'?t.nome||'':''));for(const [r,i] of CURSO_IC)if(r.test(s))return i;return ''}catch(_){return ''}}
const anoBadge=(t,cls)=>{if(!t)return '';const bc=badgeCod(t),ci=bc?'':cursoIc(t);return `<span class="anob c-${ofertaDe(t)==='profij'?'profij':t.ciclo||'sec'} ${cls||''} ${bc?'cod'+(bc.length>3?' l'+Math.min(bc.length,6):''):''} ${ci?'cic':''}" style="--bc:${t.id?corTurma(t.id):''}" title="${esc(bc?'Código '+bc+' · '+(t.anoEsc||''):[t.anoEsc||'',ci?(t.curso||(t.cnq&&t.cnq.nome)||''):''].filter(Boolean).join(' · '))}">${bc?esc(bc):ci?ic(ci,16)+(ofertaDe(t)==='profij'?'':`<i class="anoy">${anoNum(t)}</i>`):anoNum(t)}</span>`};
/* ---------- oferta formativa: Ensino Regular / PROFIJ (separação transversal) ---------- */
const OFERTAS={regular:{nome:'Ensino Regular',cor:'#2f7fd0'},profij:{nome:'PROFIJ',cor:'#1a7f37'}};
const ofertaDe=t=>t&&t.oferta&&OFERTAS[t.oferta]?t.oferta:'regular';
const ofertaTag=t=>ofertaDe(t)==='profij'?' <span class="tag of-p">PROFIJ</span>':'';
const turmasFiltradas=a=>(a?a.turmas:[]).filter(t=>(!S.filtroOferta||ofertaDe(t)===S.filtroOferta)&&escId(escolaDe(t))===escAtiva());
function gruposOferta(L){return ['regular','profij'].map(k=>({k,nome:OFERTAS[k].nome,L:L.filter(t=>ofertaDe(t)===k)})).filter(g=>g.L.length)}
const segOferta=(id,cur,tipo)=>`<div class="seg" id="${id}">${Object.entries(OFERTAS).filter(([k])=>!tipo||TIPOS_ESCOLA[tipo].ofertas.includes(k)).map(([k,o])=>`<button type="button" data-of="${k}" class="${(cur||'regular')===k?'on':''}">${ic(k==='profij'?'award':k==='profissional'?'layers':'school',15)} ${o.nome}</button>`).join('')}</div>`;
function bindSegOferta(id,cb){$$('#'+id+' [data-of]').forEach(b=>b.onclick=()=>{$$('#'+id+' [data-of]').forEach(x=>x.classList.toggle('on',x===b));cb(b.dataset.of)})}
function renderFiltroOferta(){const el=$('#ofsel');if(!el)return;const TT=(A()||{turmas:[]}).turmas.filter(t=>escId(escolaDe(t))===escAtiva());const ofs=[...new Set(TT.map(ofertaDe))];const has=ofs.length>1;const ES=todasEscolas();const hasE=false;
  if(S.filtroEscola&&!ES.some(e=>escId(e)===S.filtroEscola))S.filtroEscola='';
  el.innerHTML=(hasE?`<select class="escsel" id="fo-esc" aria-label="Escola"><option value="">Todas as escolas</option>${ES.map(e=>`<option value="${escId(e)}" ${S.filtroEscola===escId(e)?'selected':''}>${esc(nomeEscola(e))}</option>`).join('')}</select>`:'')+(has||S.filtroOferta?`<div class="seg mini">${[['','Todas'],...['regular','profij','profissional'].filter(k=>ofs.includes(k)||S.filtroOferta===k).map(k=>[k,k==='regular'?'Regular':k==='profij'?'PROFIJ':'Profissional'])].map(([k,l])=>`<button data-fo="${k}" class="${(S.filtroOferta||'')===k?'on':''}">${l}</button>`).join('')}</div>`:'');
  el.style.display=has||S.filtroOferta||hasE?'':'none';const fe=$('#fo-esc');if(fe)fe.onchange=()=>{S.filtroEscola=fe.value;const t=T();if(t&&S.filtroEscola&&escId(escolaDe(t))!==S.filtroEscola)S.turmaAtiva=null;save();go(NEEDS_T.includes(VIEW)&&!T()?'turmas':VIEW)};
  $$('#ofsel [data-fo]').forEach(b=>b.onclick=()=>{S.filtroOferta=b.dataset.fo;const t=T();if(t&&S.filtroOferta&&ofertaDe(t)!==S.filtroOferta)S.turmaAtiva=null;save();go(NEEDS_T.includes(VIEW)&&!T()?'turmas':VIEW)})}

/* 1.086 · limpa do registo os bloqueios antigos de código de extensões (blob:, domínios alheios) */
try{const L=esErros(),n=L.length;for(let i=L.length-1;i>=0;i--){const x=L[i];if(/^blob/.test(x.o||'')||(/unsafe-eval/.test(x.m||'')&&!/eduspruce/.test(x.o||'')))L.splice(i,1)}if(L.length!==n)localStorage.setItem(ES_ERR_K,JSON.stringify(L))}catch(_){}
