/* ===================== Spruce Review — avaliação de sites feitos pelos alunos =====================
   Enunciados com critérios (por omissão: «Criação de Páginas Web», 200 pontos → 0–20 valores), análise automática pelo endereço
   (pontos de acesso públicos do site: páginas, blocos do editor, extensões, idioma), capturas de ecrã automáticas e exemplos
   corretos (review/ref/), anotações, comentário em áudio, banco de comentários, rubricas por níveis, importação da turma,
   pautas, relatórios, página do aluno com autoavaliação (review.html, sessões cifradas como as do Spruce Exam), estatísticas,
   mapa de calor, acessibilidade, desempenho, ligações, conteúdo de modelo, tema, histórico, versões, dupla correção e partilha.
   Os dados ficam na conta (S.rv); a análise guarda só o resumo (nunca o conteúdo das páginas). */
/* 1.186: ferramenta do Módulo 03 de TIC dos cursos profissionais — só aparece com turmas de TIC do ensino profissional
   (turma com oferta profissional ou escola profissional). Cada curso tem o seu enunciado, que só existe depois de incluído. */
const RV_CURSOS=[
  {k:'mec',n:'Mecatrónica',re:/mecatr/,temas:[{n:'Automação Industrial',kw:'automação autómato autómatos programável programáveis plc sensores atuadores linha produção industrial controlo pneumática'},{n:'Robótica e Sensores',kw:'robô robôs robótica braço sensor sensores arduino microcontrolador eletrónica programação motores'},{n:'Manutenção e Segurança de Equipamentos',kw:'manutenção preventiva corretiva avaria avarias segurança equipamento equipamentos máquina máquinas lubrificação ferramentas normas'}]},
  {k:'agro',n:'Agropecuária',re:/agro|pecu/,temas:[{n:'Agricultura Sustentável e Biológica',kw:'agricultura sustentável biológica biológico rotação culturas compostagem composto pesticidas certificação orgânico solo adubo horta ambiente'},{n:'Tecnologia na Agricultura',kw:'drone drones sensores humidade rega inteligente trator autónomo dados precisão tecnologia agrotech inovação satélite automação'},{n:'Produção Agrícola Local e Comercialização',kw:'produção local regional mercado mercados venda direta consumidor produtores colheita preços receitas sazonais marketing cadeias curtas gado pecuária animais leite'}]},
  {k:'tur',n:'Turismo Ambiental e Rural',re:/turis/,temas:[{n:'Turismo de Natureza e Percursos Pedestres',kw:'natureza trilho trilhos percurso percursos pedestre pedestres caminhada paisagem montanha miradouro fauna flora observação'},{n:'Turismo Rural e Alojamento Local',kw:'rural alojamento casa casas quinta aldeia aldeias tradições gastronomia hospedagem reservas turistas equestre cavalo cavalos passeios'},{n:'Património e Sustentabilidade Ambiental',kw:'património cultural história ambiente ambiental sustentável sustentabilidade conservação reciclagem ecoturismo museu tradição'}]},
  {k:'ae',n:'Ação Educativa',re:/educativ|a[cç][aã]o educ/,temas:[{n:'Desenvolvimento e Brincadeira na Infância',kw:'criança crianças infância brincar brincadeira jogo jogos desenvolvimento motricidade linguagem educadora'},{n:'Atividades de Tempos Livres',kw:'atividades tempos livres atl expressão plástica leitura conto histórias música animação lúdicas'},{n:'Inclusão e Apoio Educativo',kw:'inclusão necessidades educativas apoio diferenciação adaptação família famílias escola acompanhamento'}]}];
const rvCurso=k=>RV_CURSOS.find(c=>c.k===k)||null;
const rvTic=t=>{const d=normT((t&&t.disciplina)||'');return /\btic\b|tecnologias da informacao/.test(d)};
const rvProf=t=>{try{return ofertaDe(t)==='profissional'||tipoEscola(escolaDe(t))==='profissional'}catch(_){return t&&t.oferta==='profissional'}};
const rvCursoDe=t=>{const s=normT(((t&&t.curso)||'')+' '+((t&&t.cnq&&t.cnq.nome)||'')+' '+((t&&t.nome)||''));const c=RV_CURSOS.find(c=>c.re.test(s));return c?c.k:''};
const rvTurmas=()=>{try{const a=A();return a&&Array.isArray(a.turmas)?a.turmas.filter(t=>rvTic(t)&&rvProf(t)):[]}catch(_){return []}};
const rvElegivel=()=>rvTurmas().length>0;
const rvOn=()=>S.cfg.reviewOn!==false&&rvElegivel();
const RV_REF='review/ref/';
const RV_NIV=[[0,'Não fez',0],[1,'Insuficiente',.25],[2,'Suficiente',.5],[3,'Bom',.75],[4,'Muito bom',1]];
const RV_AUTO=[['','Sem análise automática'],['url','Endereço do site'],['online','Site acessível'],['idioma','Idioma em português'],['titulo','Título do site'],['descricao','Subtítulo / descrição'],
  ['paginas','Número de páginas'],['tema','Conteúdo dentro do tema'],['titulos','Hierarquia de títulos'],['responsivo','Adaptação a dispositivos'],['menu','Menu com submenus'],['temawp','Tema gráfico'],['plugins','Extensões (plugins)'],
  ['cover','Bloco Capa'],['paragrafo','Parágrafo introdutório'],['imagem','Imagem com legenda'],['citacao','Citação'],['colunas','Colunas'],['galeria','Galeria'],['lista','Títulos e lista'],['video','Vídeo incorporado'],
  ['grupo','Grupo / caixa destacada'],['tabela','Tabela'],['separador','Separador / espaçador'],['botao','Botão com ligação'],['fontes','Fontes e créditos']];
const RV_REFS=[['','Sem exemplo'],['01-capa','Capa'],['02-paragrafo','Parágrafo'],['03-imagem-legenda','Imagem com legenda'],['04-citacao','Citação'],['05-colunas','Colunas'],['06-galeria','Galeria'],['07-titulo-lista','Títulos e lista'],['08-video','Vídeo'],['09-grupo','Grupo'],['10-tabela','Tabela'],['11-separador','Separador'],['12-botao','Botão'],['13-rodape','Rodapé com fontes'],['14-menu','Menu com submenus'],['15-definicoes','Definições gerais'],['16-telemovel','Telemóvel']];
function rvEnunPadrao(){const c=(id,dom,n,pts,desc,auto,ref)=>({id,dom,n,pts,desc,auto:auto||'',ref:ref||''});
  return {id:'m003',curso:'agro',disc:'TIC',mod:'03',titulo:'Módulo 03 — Criação de Páginas Web · Agropecuária',desc:'Site criado e configurado, com pelo menos 15 páginas, menu com submenus, tema e extensões, e domínio do editor de blocos.',
    padrao:'testea\\d{2}[a-z0-9]+\\.wasmer\\.app',minPag:15,
    doms:['Criação e configuração do site','Estrutura geral e conteúdos','Navegação, tema e extensões','Domínio do editor de blocos'],
    temas:[{n:'Agricultura Sustentável e Biológica',kw:'agricultura sustentável biológica biológico rotação culturas compostagem composto pesticidas certificação orgânico solo adubo horta ambiente'},
      {n:'Tecnologia na Agricultura',kw:'drone drones sensores humidade rega inteligente trator autónomo dados precisão tecnologia agrotech inovação satélite automação'},
      {n:'Produção Agrícola Local e Comercialização',kw:'produção local regional mercado mercados venda direta consumidor produtores colheita preços receitas sazonais marketing cadeias curtas'}],
    crit:[c('a1',0,'Endereço do site no formato pedido',10,'testeaNNnomedoaluno.wasmer.app','url'),c('a2',0,'Acesso funcional ao site online',10,'O site abre sem erros.','online'),
      c('a3',0,'Idioma do painel em português',10,'Definições › Geral › Idioma do site.','idioma','15-definicoes'),c('a4',0,'Título do site',10,'Título adequado ao tema escolhido.','titulo','15-definicoes'),
      c('a5',0,'Subtítulo / descrição',10,'Descrição curta e pertinente.','descricao','15-definicoes'),
      c('b1',1,'Mínimo de quinze páginas',20,'Páginas com conteúdo (páginas vazias não contam).','paginas'),c('b2',1,'Conteúdos pertinentes ao tema',15,'Conteúdo dentro de um dos temas propostos.','tema'),
      c('b3',1,'Organização, hierarquia de títulos e legibilidade',15,'Títulos por ordem (H2, H3…), texto legível.','titulos'),c('b4',1,'Qualidade visual e adaptação a dispositivos',10,'Ver as capturas em computador, tablet e telemóvel.','responsivo','16-telemovel'),
      c('c1',2,'Menu de navegação com submenus',10,'Estrutura de navegação clara e funcional.','menu','14-menu'),c('c2',2,'Tema gratuito escolhido e personalizado',10,'Adequação visual e personalização básica.','temawp'),
      c('c3',2,'Pelo menos três extensões instaladas e configuradas',10,'Uso equilibrado, sem prejudicar o desempenho.','plugins'),
      c('d1',3,'Capa / introdução visual',5,'Bloco Capa com imagem de fundo e título.','cover','01-capa'),c('d2',3,'Parágrafo introdutório',5,'Texto inicial claro, coerente e formatado.','paragrafo','02-paragrafo'),
      c('d3',3,'Imagem com legenda',5,'Imagem com legenda e alinhamento adequado.','imagem','03-imagem-legenda'),c('d4',3,'Citação ou curiosidade',5,'Bloco de citação com formatação apropriada.','citacao','04-citacao'),
      c('d5',3,'Estrutura em colunas',5,'Conteúdo organizado em duas colunas.','colunas','05-colunas'),c('d6',3,'Galeria de imagens',5,'Várias imagens organizadas.','galeria','06-galeria'),
      c('d7',3,'Título e lista informativa',5,'Hierarquia de títulos e lista estruturada.','lista','07-titulo-lista'),c('d8',3,'Vídeo incorporado',5,'Vídeo externo incorporado (não só a ligação).','video','08-video'),
      c('d9',3,'Grupo ou caixa destacada',4,'Realce visual de informação relevante.','grupo','09-grupo'),c('d10',3,'Tabela informativa',4,'Dados organizados em tabela.','tabela','10-tabela'),
      c('d11',3,'Separador ou espaçamento visual',4,'Elemento de separação estrutural.','separador','11-separador'),c('d12',3,'Botão de ação',4,'Botão com ligação interna ou externa a funcionar.','botao','12-botao'),
      c('d13',3,'Rodapé informativo na página',4,'Texto final com fontes ou créditos.','fontes','13-rodape')]}}
const RV_COM0=[['d1','Capa bem conseguida: imagem de fundo e título legível.'],['d1','Falta a imagem de fundo na Capa (ou o título por cima).'],['d3','Falta a legenda na imagem.'],['d8','O vídeo está só como ligação: usar o bloco Incorporar.'],
  ['d12','O botão não tem ligação (ou aponta para #).'],['d13','Indicar as fontes e os créditos das imagens no fim da página.'],['b1','Há páginas vazias: não contam para as quinze.'],['b2','O conteúdo não corresponde a nenhum dos temas propostos.'],
  ['b3','Usar títulos por ordem (H2 → H3) em vez de texto a negrito.'],['c1','Organizar o menu com submenus (páginas filhas).'],['','Excelente trabalho, site muito completo!'],['','Rever a ortografia e traduzir o texto que está em inglês.']];
function rvEnunCurso(k){const C=rvCurso(k);const E=rvEnunPadrao();E.id='m03-'+k+'-'+uid().slice(0,4);E.curso=k;E.titulo='Módulo 03 — Criação de Páginas Web · '+C.n;E.temas=JSON.parse(JSON.stringify(C.temas));
  E.texto=`Teste prático — Módulo 03 de Tecnologias da Informação e Comunicação · Curso Profissional de ${C.n}.\nCria e configura um site com o endereço testeaNNnomedoaluno.wasmer.app, com o painel em português, título e subtítulo.\nO site deve ter pelo menos 15 páginas com conteúdos pertinentes na área de ${C.n}, sobre um destes temas: ${C.temas.map(t=>t.n).join('; ')}.\nCria um menu com submenus, escolhe e personaliza um tema gratuito e instala pelo menos três extensões.\nNo editor de blocos, usa: capa, parágrafo introdutório, imagem com legenda, citação, colunas, galeria, título e lista, vídeo incorporado, grupo destacado, tabela, separador, botão de ação e rodapé com fontes.`;return E}
const RV=()=>{let d=S.rv;if(!d||typeof d!=='object')d=S.rv={};['enun','av','com'].forEach(k=>{if(!Array.isArray(d[k]))d[k]=[]});
  if(!d.seed){if(!d.com.length)d.com=RV_COM0.map(([c,t])=>({id:uid(),crit:c,txt:t,n:0}));d.seed=1}
  d.enun.forEach(E=>{if(!E.curso){E.curso='agro';E.disc='TIC';E.mod='03';if(/Módulo 003/.test(E.titulo))E.titulo='Módulo 03 — Criação de Páginas Web · Agropecuária'}});return d};
const rvEn=id=>RV().enun.find(e=>e.id===id)||RV().enun[0]||rvEnunPadrao();
const rvRef=(E,ref)=>ref?RV_REF+((E&&E.curso)||'agro')+'/'+ref+'.webp':'';
const rvMax=E=>E.crit.reduce((s,c)=>s+(+c.pts||0),0);
const rvTot=(al,E,k)=>{const P=al[k||'pts']||{};let t=0,n=0;E.crit.forEach(c=>{const v=P[c.id];if(v!=null&&v!==''){t+=+v||0;n++}});return {t,n,c:n===E.crit.length}};
const rvVal=(t,E)=>{const m=rvMax(E)||1;return Math.round(t/m*200)/10};
const rvLog=(al,txt)=>{(al.hist=al.hist||[]).unshift({t:Date.now(),q:S.cfg.professor||'Professor',txt:String(txt).slice(0,300)});if(al.hist.length>300)al.hist.length=300};
const rvBase=u=>{u=String(u||'').trim();if(!u)return '';if(!/^https?:\/\//i.test(u))u='https://'+u;try{const x=new URL(u);return x.origin+x.pathname.replace(/\/+$/,'')}catch(_){return ''}};
const rvShot=(u,w,h)=>'https://s0.wp.com/mshots/v1/'+encodeURIComponent(u)+'?w='+(w>900?1280:w)+'&vpw='+w+'&vph='+(h||800);
const rvNivel=(v,max)=>{if(v==null||v===''||!max)return -1;const r=v/max;return r<=0?0:r<=.3?1:r<=.6?2:r<=.85?3:4};
let rvEstilo=null;
/* ---------- análise automática ---------- */
const RV_CORE=['wp/v2','oembed/1.0','wp-site-health/v1','wp-block-editor/v1','wp-abilities/v1','wasmer/v1','batch/v1','wp-abilities','akismet/v1'];
const RV_PLACE=[/\[your [^\]]{2,40}\]/i,/lorem ipsum/i,/hello world/i,/olá,? mundo/i,/sample page/i,/página de exemplo/i,/just another wordpress/i,/só mais um site/i,/\[(nome|insira|inserir)[^\]]{0,30}\]/i,/this is an example page/i];
const RV_EN=new Set('the and of to in is for with you your this that are on be as at by from or it can our we will have more about'.split(' '));
const RV_PT=new Set('o a os as de do da dos das e em no na nos nas um uma para com por que se ao é são mais como pelo pela muito também'.split(' '));
async function rvGet(u,ms){const c=new AbortController();const to=setTimeout(()=>c.abort(),ms||20000);try{const t0=performance.now();const r=await fetch(u,{signal:c.signal,credentials:'omit',cache:'no-store'});const dt=performance.now()-t0;
  let j=null;try{j=await r.json()}catch(_){}return {ok:r.ok,st:r.status,j,dt,tp:+(r.headers.get('X-WP-TotalPages')||1)}}finally{clearTimeout(to)}}
async function rvTodos(base,tipo){let out=[];for(let p=1;p<=5;p++){const r=await rvGet(`${base}/wp-json/wp/v2/${tipo}?per_page=100&page=${p}&_fields=id,title,link,parent,slug,content`);if(!r.ok||!Array.isArray(r.j))break;out=out.concat(r.j);if(p>=r.tp)break}return out}
function rvTexto(h){const d=new DOMParser().parseFromString('<div>'+h+'</div>','text/html');return d}
/* analisa o que já foi lido (do site ou colado) */
function rvAnalisarDados(E,base,root,pags,posts,extra){const an={t:Date.now(),base,ok:!!root,nome:'',desc:'',ns:[],plugins:[],pags:[],nPosts:posts.length,det:{},a11y:[],links:{ver:0,mal:[]},plac:[],dup:[],tema:null,perf:{},ling:{}};
  if(root){an.nome=String(root.name||'').slice(0,200);an.desc=String(root.description||'').slice(0,300);an.ns=(root.namespaces||[]).map(String).slice(0,60)}
  const host=(()=>{try{return new URL(base).host}catch(_){return ''}})();
  const docs=[];const add=(o,tipo)=>{const h=(o.content&&o.content.rendered)||'';const d=rvTexto(h);const txt=(d.body.textContent||'').replace(/\s+/g,' ').trim();
    const t=(o.title&&o.title.rendered)?rvTexto(o.title.rendered).body.textContent.trim():'(sem título)';docs.push({tipo,id:o.id,t,link:o.link||'',parent:+o.parent||0,d,txt,pal:txt?txt.split(' ').length:0})};
  pags.forEach(o=>add(o,'p'));posts.forEach(o=>add(o,'a'));
  an.pags=docs.filter(x=>x.tipo==='p').map(x=>({id:x.id,t:x.t.slice(0,120),link:x.link,pai:x.parent,pal:x.pal,vazia:x.pal<8&&!x.d.querySelector('img,iframe,table')}));
  /* blocos */
  const onde=(sel,f)=>docs.filter(x=>{const L=[...x.d.querySelectorAll(sel)];return f?L.some(f):L.length>0});
  const r=(e,nota,L)=>({e,nota,onde:(L||[]).slice(0,6).map(x=>({t:x.t.slice(0,80),u:x.link}))});
  const D=an.det;
  {const ok=onde('.wp-block-cover',c=>c.querySelector('img,video')||/background-image/.test(c.getAttribute('style')||'')||[...c.querySelectorAll('[style]')].some(z=>/background-image/.test(z.getAttribute('style'))));
   const qq=onde('.wp-block-cover');const tit=onde('.wp-block-cover',c=>c.textContent.trim().length>2);
   D.cover=ok.length&&tit.length?r('ok','Capa com imagem de fundo e texto.',ok):qq.length?r('parcial',ok.length?'Capa sem título/texto por cima.':'Capa sem imagem de fundo.',qq):r('falta','Não foi encontrado nenhum bloco Capa.')}
  {const L=docs.filter(x=>[...x.d.querySelectorAll('p')].some(p=>p.textContent.trim().length>=120));const fmt=L.filter(x=>x.d.querySelector('p strong,p em,p a,p mark'));
   D.paragrafo=fmt.length?r('ok','Parágrafos desenvolvidos e formatados.',fmt):L.length?r('parcial','Há parágrafos, mas sem formatação (negrito, itálico, ligações).',L):r('falta','Não há parágrafos com texto desenvolvido.')}
  {const cap=onde('figure.wp-block-image',f=>f.querySelector('figcaption')&&f.querySelector('figcaption').textContent.trim());const im=onde('figure.wp-block-image');
   const al=onde('figure.wp-block-image',f=>/align(center|left|right|wide|full)/.test(f.className));
   D.imagem=cap.length?r('ok','Imagem com legenda'+(al.length?' e alinhamento definido.':'.'),cap):im.length?r('parcial','Há imagens, mas nenhuma tem legenda.',im):r('falta','Não há blocos de imagem.')}
  {const L=onde('.wp-block-quote,.wp-block-pullquote');const c=onde('.wp-block-quote cite,.wp-block-pullquote cite');D.citacao=L.length?r('ok','Citação'+(c.length?' com autor/fonte.':' (sem autor/fonte indicado).'),L):r('falta','Não há blocos de citação.')}
  {const L=onde('.wp-block-columns',c=>c.querySelectorAll(':scope>.wp-block-column').length>=2&&[...c.querySelectorAll(':scope>.wp-block-column')].every(z=>z.textContent.trim()||z.querySelector('img,iframe')));const q=onde('.wp-block-columns');
   D.colunas=L.length?r('ok','Conteúdo em colunas.',L):q.length?r('parcial','Colunas com uma coluna vazia.',q):r('falta','Não há blocos de colunas.')}
  {const L=onde('.wp-block-gallery',g=>g.querySelectorAll('img').length>=3);const q=onde('.wp-block-gallery');D.galeria=L.length?r('ok','Galeria com várias imagens.',L):q.length?r('parcial','Galeria com menos de três imagens.',q):r('falta','Não há blocos de galeria.')}
  {const L=docs.filter(x=>x.d.querySelector('h2,h3,h4')&&x.d.querySelector('ul li,ol li'));D.lista=L.length?r('ok','Títulos e listas na mesma página.',L):docs.some(x=>x.d.querySelector('ul,ol'))?r('parcial','Há listas, mas sem título a introduzi-las.',onde('ul,ol')):r('falta','Não há listas.')}
  {const L=onde('.wp-block-embed.is-type-video,.wp-block-embed-youtube,.wp-block-embed-vimeo,.wp-block-video,iframe[src*="youtu"],iframe[src*="vimeo"],video');
   const lig=docs.filter(x=>/https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(x.txt)||x.d.querySelector('a[href*="youtu"],a[href*="vimeo"]'));
   D.video=L.length?r('ok','Vídeo incorporado.',L):lig.length?r('parcial','O vídeo está só como ligação/endereço (usar o bloco Incorporar).',lig):r('falta','Não há vídeos.')}
  {const L=onde('.wp-block-group',g=>/has-background|has-border|is-style-|has-.*-border-color/.test(g.className)||/background|border/.test(g.getAttribute('style')||''));const q=onde('.wp-block-group');
   D.grupo=L.length?r('ok','Grupo com realce visual (fundo ou contorno).',L):q.length?r('parcial','Há grupos, mas sem realce visual (fundo/contorno).',q):r('falta','Não há blocos de grupo.')}
  {const L=onde('.wp-block-table table,table',t=>t.querySelectorAll('tr').length>=2);D.tabela=L.length?r('ok','Tabela com dados.',L):r('falta','Não há tabelas.')}
  {const L=onde('.wp-block-separator,.wp-block-spacer,hr');D.separador=L.length?r('ok','Separador / espaçador presente.',L):r('falta','Não há separadores nem espaçadores.')}
  {const B=onde('.wp-block-button');const ok=onde('.wp-block-button a',a=>{const h=a.getAttribute('href')||'';return h&&h!=='#'&&!/^javascript:/i.test(h)});
   D.botao=ok.length?r('ok','Botão com ligação.',ok):B.length?r('parcial','Botão sem ligação (ou com #).',B):r('falta','Não há botões.')}
  {const RE=/fonte|fontes|créditos|creditos|referências|bibliografia|retirado de|adaptado de|imagens?:|source/i;
   const fim=docs.filter(x=>{const L=[...x.d.body.firstChild.children].slice(-3);return L.some(z=>RE.test(z.textContent))});const alg=docs.filter(x=>RE.test(x.txt));
   D.fontes=fim.length?r('ok','Fontes/créditos no fim da página.',fim):alg.length?r('parcial','Há referências a fontes, mas não num rodapé no fim da página.',alg):r('falta','Não há indicação de fontes ou créditos.')}
  /* site */
  {const re=new RegExp('^'+(E.padrao||'.*')+'$','i');D.url=re.test(host)?r('ok','Endereço no formato pedido: '+host):r('falta','Endereço fora do formato pedido: '+(host||'—'))}
  D.online=root?r('ok','O site abre sem erros.'):r('falta','O site não respondeu.');
  {const m=String((extra&&extra.msg)||'');D.idioma=!m?r('manual','Confirmar nas capturas do painel.'):/rota|pedido|encontrad|método/i.test(m)?r('ok','Mensagens do site em português.'):r('falta','Mensagens do site noutra língua: «'+m.slice(0,80)+'».')}
  {const def=/^(o meu (site|blog)|my (wordpress )?(website|blog|site)|wordpress|site)$/i;D.titulo=!an.nome?r('falta','Sem título.'):def.test(an.nome.trim())?r('parcial','Título por omissão: «'+an.nome+'».'):r('ok','Título: «'+an.nome+'».')}
  {const def=/just another|só mais um|apenas mais um/i;D.descricao=!an.desc?r('falta','Sem descrição.'):def.test(an.desc)?r('parcial','Descrição por omissão.'):r('ok','Descrição: «'+an.desc+'».')}
  {const P=an.pags;const ch=P.filter(p=>!p.vazia).length;const min=+E.minPag||15;
   D.paginas={e:ch>=min?'ok':P.length>=min?'parcial':'falta',nota:`${P.length} páginas, ${ch} com conteúdo (mínimo ${min}).`+(P.length-ch?' Vazias: '+P.filter(p=>p.vazia).map(p=>p.t).join(', ')+'.':''),onde:[],q:Math.min(1,ch/min)}}
  {const T=(E.temas||[]).map(t=>{const kw=normT(t.kw).split(' ').filter(w=>w.length>3);const tx=' '+normT(docs.map(x=>x.t+' '+x.txt).join(' '))+' ';let h=0;const vis=[];kw.forEach(w=>{const n=tx.split(' '+w).length-1;if(n){h+=n;vis.push(w)}});return {n:t.n,h,vis:vis.slice(0,10)}}).sort((a,b)=>b.h-a.h);
   const tot=docs.reduce((s,x)=>s+x.pal,0)||1;const b=T[0];an.tema={best:b?b.n:'',h:b?b.h:0,dens:b?Math.round(b.h/tot*1000)/10:0,todos:T};
   D.tema=!b?r('manual','Sem temas no enunciado.'):b.h>=25||an.tema.dens>=1?r('ok',`Mais próximo de «${b.n}» (${b.h} palavras-chave).`):b.h>=8?r('parcial',`Pouco ligado aos temas: «${b.n}» com só ${b.h} palavras-chave.`):r('falta',`Conteúdo fora dos temas propostos (melhor: «${b?b.n:'—'}», ${b?b.h:0} palavras-chave).`)}
  {let salto=0,h1m=0,falsos=0;const pp=docs.filter(x=>x.tipo==='p'&&x.pal>30);pp.forEach(x=>{const H=[...x.d.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>+h.tagName[1]);let ant=1;H.forEach(n=>{if(n>ant+1)salto++;ant=n});if(H.filter(n=>n===1).length>1)h1m++;
     falsos+=[...x.d.querySelectorAll('p')].filter(p=>{const s=p.querySelector('strong');return s&&s.textContent.trim()===p.textContent.trim()&&p.textContent.trim().length<70}).length});
   const com=pp.filter(x=>x.d.querySelector('h2,h3,h4')).length;const q=pp.length?com/pp.length:0;
   D.titulos={e:q>=.8&&!salto&&falsos<4?'ok':q>=.4?'parcial':'falta',nota:`${com} de ${pp.length} páginas com títulos`+(salto?`; ${salto} saltos de nível (ex.: H2 → H4)`:'')+(h1m?`; ${h1m} páginas com vários H1`:'')+(falsos?`; ${falsos} «títulos» feitos com negrito em vez do bloco Título`:'')+'.',onde:[]}}
  D.responsivo=r('manual','Ver as capturas em computador, tablet e telemóvel.');
  {const nav=extra&&extra.nav;const filhos=an.pags.filter(p=>p.pai).length;D.menu=nav===true?r('ok','Menu com submenus encontrado.'):filhos?r('parcial',filhos+' páginas filhas (confirmar o menu nas capturas).'):r('manual','Confirmar o menu com submenus nas capturas.')}
  D.temawp=extra&&extra.tema?r('ok','Tema: '+extra.tema):r('manual','Confirmar o tema e a personalização nas capturas.');
  {const pl=an.ns.filter(n=>!RV_CORE.includes(n)).map(n=>n.split('/')[0]);const blocos=new Set();docs.forEach(x=>x.d.querySelectorAll('[class*="wp-block-"]').forEach(e=>e.className.split(/\s+/).forEach(c=>{const m=/^wp-block-([a-z0-9]+)-/.exec(c);if(m&&!['cover','image','group','gallery','columns','column','button','buttons','media','post','query','site','navigation','embed','social','latest','page','table','list','quote','pullquote','file','audio','video','search','separator','spacer','heading','paragraph','code','preformatted','verse','details','text','term','comment','comments','avatar','read','template','tag','categories','archives','calendar','rss','loginout','home','footnotes','more','nextpage','html','shortcode','freeform','missing','legacy','block','pattern'].includes(m[1]))blocos.add(m[1])})));
   if(docs.some(x=>x.d.querySelector('.wpcf7,form.wpcf7-form')))blocos.add('contact-form-7');an.plugins=[...new Set([...pl,...blocos])].slice(0,30);
   const n=an.plugins.length;D.plugins=n>=3?r('ok',n+' extensões detetadas: '+an.plugins.join(', ')+'.'):n?r('parcial','Só '+n+' extensão(ões) detetada(s): '+an.plugins.join(', ')+' (outras podem não ser visíveis de fora).'):r('manual','Nenhuma extensão visível de fora: confirmar no painel.')}
  /* acessibilidade */
  {let semAlt=0,imgs=0,gen=0,cont=[];docs.forEach(x=>{x.d.querySelectorAll('img').forEach(i=>{imgs++;if(!(i.getAttribute('alt')||'').trim())semAlt++});x.d.querySelectorAll('a').forEach(a=>{if(/^(clique aqui|aqui|ver mais|saber mais|ler mais|link|click here|here|read more)$/i.test(a.textContent.trim()))gen++});
     x.d.querySelectorAll('[style*="color"]').forEach(e=>{const st=e.getAttribute('style')||'';const c=/(?:^|;)\s*color\s*:\s*(#[0-9a-f]{3,6})/i.exec(st),b=/background(?:-color)?\s*:\s*(#[0-9a-f]{3,6})/i.exec(st);if(c&&b){const k=rvContraste(c[1],b[1]);if(k<4.5)cont.push(x.t+': '+k.toFixed(1)+':1')}})});
   if(imgs)an.a11y.push({e:semAlt/imgs>.3?'falta':semAlt?'parcial':'ok',t:`Texto alternativo: ${imgs-semAlt} de ${imgs} imagens descritas.`});
   const tt=D.titulos.nota;an.a11y.push({e:D.titulos.e,t:'Títulos: '+tt});if(gen)an.a11y.push({e:'parcial',t:gen+' ligações com texto vago («clique aqui», «ler mais»).'});
   if(cont.length)an.a11y.push({e:'falta',t:'Contraste insuficiente (abaixo de 4,5:1): '+cont.slice(0,5).join('; ')});else an.a11y.push({e:'ok',t:'Sem combinações de cores com pouco contraste nos blocos com cor definida.'})}
  /* ligações (só a lista; a verificação é feita depois) */
  {const L=new Map();docs.forEach(x=>x.d.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href');if(!h||/^(#|mailto:|tel:|javascript:)/i.test(h))return;let u;try{u=new URL(h,base+'/').href}catch(_){return}
     if(!L.has(u))L.set(u,{u,txt:a.textContent.trim().slice(0,60),em:x.t.slice(0,60),bt:!!a.closest('.wp-block-button')})}));an._links=[...L.values()].slice(0,150)}
  /* conteúdo de modelo, inglês, repetido */
  {docs.forEach(x=>{RV_PLACE.forEach(re=>{const m=re.exec(x.txt+' '+x.t);if(m)an.plac.push({t:x.t.slice(0,60),u:x.link,m:m[0].slice(0,60)})});
     const w=normT(x.txt).split(' ');if(w.length>60){let en=0,pt=0;w.forEach(z=>{if(RV_EN.has(z))en++;if(RV_PT.has(z))pt++});if(en>pt*1.2)an.plac.push({t:x.t.slice(0,60),u:x.link,m:'Texto em inglês'})}});
   const vistos=new Map();docs.forEach(x=>x.d.querySelectorAll('p').forEach(p=>{const s=normT(p.textContent);if(s.length<90)return;const k=s.slice(0,160);const o=vistos.get(k);if(o&&o.t!==x.t){if(!o.rep.includes(x.t))o.rep.push(x.t)}else if(!o)vistos.set(k,{t:x.t,rep:[],s:p.textContent.trim().slice(0,90)})}));
   vistos.forEach(o=>{if(o.rep.length)an.dup.push({s:o.s,em:[o.t,...o.rep].slice(0,6)})});an.dup=an.dup.slice(0,20);an.plac=an.plac.slice(0,30)}
  /* desempenho (medição simples) */
  {const im=docs.reduce((s,x)=>s+x.d.querySelectorAll('img').length,0);const ifr=docs.reduce((s,x)=>s+x.d.querySelectorAll('iframe').length,0);an.perf={ms:Math.round((extra&&extra.ms)||0),imgs:im,ifr,pl:an.plugins.length,psi:null}}
  return an}
function rvContraste(a,b){const lum=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const v=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255).map(c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4));return .2126*v[0]+.7152*v[1]+.0722*v[2]};
  const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
async function rvAnalisar(av,al){const E=rvEn(av.enun);const base=rvBase(al.url);if(!base)throw new Error('Indique o endereço do site do aluno.');
  const r0=await rvGet(base+'/wp-json/');if(!r0.ok||!r0.j)throw new Error('O site não respondeu à leitura automática ('+(r0.st||'sem resposta')+'). Pode colar os dados à mão (botão «Colar dados»).');
  const [pags,posts,sonda,nav,tem]=await Promise.all([rvTodos(base,'pages'),rvTodos(base,'posts').catch(()=>[]),rvGet(base+'/wp-json/wp/v2/rv-sonda-'+Date.now().toString(36)).catch(()=>({})),
    rvGet(base+'/wp-json/wp/v2/navigation?per_page=20&_fields=id,content').catch(()=>({})),rvGet(base+'/wp-json/wp/v2/themes?status=active&_fields=name').catch(()=>({}))]);
  let navOk=null;if(nav&&Array.isArray(nav.j)&&nav.j.length)navOk=nav.j.some(n=>/submenu|has-child/.test((n.content&&n.content.rendered)||''));
  const tema=tem&&Array.isArray(tem.j)&&tem.j[0]&&tem.j[0].name?(tem.j[0].name.rendered||tem.j[0].name):'';
  const an=rvAnalisarDados(E,base,r0.j,pags,posts,{ms:r0.dt,msg:sonda&&sonda.j&&sonda.j.message,nav:navOk,tema});
  await rvVerLigacoes(an,base,pags.concat(posts));
  {const bt=(an._links||[]).filter(l=>l.bt);const mal=an.links.mal.filter(l=>l.bt);if(an.det.botao&&an.det.botao.e==='ok'&&bt.length&&mal.length===bt.length)an.det.botao={...an.det.botao,e:'parcial',nota:'Os botões apontam para páginas que não abrem.'}}
  delete an._links;rvGuardarAnalise(av,al,an);
  rvPsi(base).then(s=>{if(s!=null){an.perf.psi=s;save();if(VIEW==='review')vReview()}}).catch(()=>{});return an}
async function rvVerLigacoes(an,base,docs){const conhecidos=new Set(docs.map(d=>String(d.link||'').replace(/\/$/,'')));conhecidos.add(base);const L=an._links||[];let ver=0;
  const fila=L.slice();const corre=async()=>{while(fila.length){const l=fila.shift();ver++;const u=l.u.replace(/#.*$/,'').replace(/\/$/,'');
    if(u.startsWith(base)){if(conhecidos.has(u))continue;const slug=u.slice(base.length).split('/').filter(Boolean).pop()||'';if(/\.(jpe?g|png|webp|gif|pdf|svg)$/i.test(slug)||/\/(wp-content|category|tag|author|page|feed)\//.test(u))continue;
      const r=await rvGet(`${base}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=id`,9000).catch(()=>null);const r2=r&&Array.isArray(r.j)&&r.j.length?r:await rvGet(`${base}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=id`,9000).catch(()=>null);
      if(!(r2&&Array.isArray(r2.j)&&r2.j.length))an.links.mal.push({...l,m:'página inexistente'})}
    else{try{const c=new AbortController();const to=setTimeout(()=>c.abort(),8000);await fetch(l.u,{mode:'no-cors',signal:c.signal,credentials:'omit'});clearTimeout(to)}catch(_){an.links.mal.push({...l,m:'não abre'})}}}};
  await Promise.all([corre(),corre(),corre(),corre()]);an.links.ver=ver;an.links.bt=L.filter(l=>l.bt).length;an.links.mal=an.links.mal.slice(0,40)}
async function rvPsi(base){try{const r=await rvGet('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?category=performance&strategy=mobile&url='+encodeURIComponent(base+'/'),70000);
  const s=r.j&&r.j.lighthouseResult&&r.j.lighthouseResult.categories&&r.j.lighthouseResult.categories.performance;return s?Math.round(s.score*100):null}catch(_){return null}}
/* correção automática (1.183): sugestão + confiança por critério, estimativa nos critérios que não se veem de fora,
   pontos e comentários preenchidos sozinhos (só onde o professor ainda não mexeu), lista do que falta rever */
const rvCfg=()=>{const d=RV();if(!d.cfg||typeof d.cfg!=='object')d.cfg={};const c=d.cfg;['aplicar','estimar','comentar','analisar','capturas'].forEach(k=>{if(c[k]==null)c[k]=true});return c};
function rvEstimar(k,an){const plac=an.plac.length,mau=an.a11y.some(x=>x.e==='falta');
  if(k==='responsivo')return [!an.ok?0:Math.max(.5,1-(plac?.25:0)-(mau?.25:0)),'Estimativa: os temas atuais adaptam-se ao telemóvel'+(plac||mau?', mas há problemas de qualidade (conteúdo de modelo ou contraste)':'')+'. Confirmar nas capturas.'];
  if(k==='menu'){const f=an.pags.filter(p=>p.pai).length;return [f?.75:.5,f?'Estimativa: há páginas filhas, provavelmente em submenus. Confirmar nas capturas.':'Estimativa: confirmar nas capturas se o menu tem submenus.']}
  if(k==='temawp')return [an.ok?.75:0,'Estimativa: confirmar o tema e a personalização nas capturas.'];
  if(k==='plugins')return [.5,'Estimativa: nenhuma extensão visível de fora; confirmar no painel.'];
  if(k==='idioma')return [an.ok?.75:0,'Estimativa: confirmar o idioma do painel.'];
  return null}
const rvConfTxt={alta:'confiança alta',media:'confiança média',baixa:'estimativa'};
function rvComTxt(d){const n=String(d.nota||'').replace(/^Estimativa: /,'');return d.e==='ok'?'✓ '+n:d.e==='parcial'?'A melhorar: '+n:'Em falta: '+n}
/* apreciação geral (1.184): texto corrido escrito a partir do trabalho e da nota de cada aluno, com muitas variantes de frase;
   a semente (al.comGSeed) muda com «Escrever outra» e as frases já usadas por colegas da mesma avaliação são evitadas */
const RV_FORTE={url:'o endereço do site no formato pedido',online:'o site sempre acessível',idioma:'o painel configurado em português',titulo:'o título do site',descricao:'a descrição do site',paginas:'a quantidade de páginas com conteúdo',
  tema:'a ligação do conteúdo ao tema',titulos:'a organização dos títulos',responsivo:'o aspeto em vários ecrãs',menu:'o menu com submenus',temawp:'a escolha do tema',plugins:'as extensões instaladas',cover:'a capa com imagem de fundo',
  paragrafo:'o parágrafo de introdução',imagem:'as imagens com legenda',citacao:'a citação em destaque',colunas:'a organização em colunas',galeria:'a galeria de imagens',lista:'os títulos com listas',video:'o vídeo incorporado',
  grupo:'a caixa de destaque',tabela:'a tabela informativa',separador:'a separação entre secções',botao:'o botão de ação',fontes:'a indicação das fontes'};
const RV_MELHORAR={url:'usar o endereço no formato pedido',online:'garantir que o site abre sem erros',idioma:'pôr o painel em português',titulo:'dar ao site um título ligado ao tema',descricao:'escrever uma descrição curta e pertinente',
  paginas:'completar as páginas até chegar às quinze com conteúdo',tema:'centrar o conteúdo num dos temas propostos',titulos:'usar o bloco Título por ordem (H2, H3) em vez de texto a negrito',responsivo:'ver como o site fica no telemóvel',
  menu:'organizar o menu com submenus',temawp:'personalizar o tema (cores, logótipo, tipo de letra)',plugins:'instalar e configurar pelo menos três extensões',cover:'abrir a página com um bloco Capa com imagem e título',
  paragrafo:'escrever um parágrafo de introdução mais desenvolvido e formatado',imagem:'pôr legenda nas imagens',citacao:'usar o bloco Citação para uma curiosidade',colunas:'organizar conteúdo em duas colunas',galeria:'juntar uma galeria com pelo menos três imagens',
  lista:'introduzir as listas com um título',video:'incorporar o vídeo com o bloco Incorporar em vez de deixar só a ligação',grupo:'destacar informação importante num grupo com fundo ou contorno',tabela:'organizar dados numa tabela',
  separador:'separar as secções com um separador ou espaçador',botao:'pôr no botão uma ligação que funcione',fontes:'terminar as páginas com as fontes e os créditos'};
const RV_FR={
  abre:{ex:['{N}, o teu site está excelente!','Que trabalho tão completo, {N}!','Parabéns, {N}: o site cumpre praticamente tudo o que foi pedido.','{N}, este é um site de que te podes orgulhar.','Trabalho de grande qualidade, {N}.','Muito bem, {N}! Nota-se o cuidado em cada página.'],
    mb:['{N}, fizeste um trabalho muito bom.','Bom trabalho, {N}: o site está bem construído.','{N}, o resultado é muito positivo.','Gostei bastante do teu site, {N}.','{N}, mostras que dominas bem o editor de blocos.','O teu site está bem conseguido, {N}.'],
    b:['{N}, o site está no bom caminho.','Trabalho positivo, {N}, com alguns pontos a afinar.','{N}, já tens uma boa base.','O essencial está feito, {N}.','{N}, o teu site tem várias partes bem conseguidas.','Bom esforço, {N}: falta pouco para um site muito bom.'],
    s:['{N}, o site cumpre o mínimo, mas pode ir mais longe.','{N}, há trabalho feito, mas ainda faltam algumas partes importantes.','O site está aceitável, {N}, e tem margem para crescer.','{N}, conseguiste o essencial; agora é completar.','Já há uma base, {N}, mas é preciso mais cuidado.'],
    ins:['{N}, o site ainda está longe do que foi pedido.','{N}, este trabalho precisa de bastante mais desenvolvimento.','Ainda faltam muitas partes, {N}.','{N}, é preciso retomar o site com mais tempo e atenção.','O site está incompleto, {N}, mas dá para recuperar.']},
  forte:['Destaco {L}.','Ficaram muito bem {L}.','Gostei especialmente {de:L}.','Está muito bem feito o trabalho {em:L}.','Os pontos fortes são {L}.','Mostras domínio {em:L}.','Merecem destaque {L}.'],
  mel:['Para melhorar, falta {L}.','Da próxima vez, tenta {L}.','Ainda é preciso {L}.','Convém {L}.','O próximo passo é {L}.','Para subir a nota, tens de {L}.','Sugiro {L}.'],
  vazias:['{Há uma página|Há {n} páginas} sem conteúdo ({L}), que não {conta|contam}.','{A página|As páginas} {L} {está vazia|estão vazias}: {preenche-a|preenche-as}.','Não te esqueças de preencher {L}.'],
  modelo:['Revê o texto de modelo ou em inglês em {L}.','Em {L} ficou texto copiado de um modelo ou em inglês: escreve-o por palavras tuas.','Atenção a {L}: tem texto que não é teu ou está em inglês.'],
  alt:['Descreve as imagens no texto alternativo, para quem não as consegue ver.','Falta o texto alternativo nas imagens.','Acrescenta a descrição (texto alternativo) às imagens.'],
  links:['{Há uma ligação que não abre: confirma-a.|Há {n} ligações que não abrem: confirma-as.}','Verifica as ligações: {uma não funciona|{n} não funcionam}.','Corrige {a ligação partida|as {n} ligações partidas}.'],
  tema:['O conteúdo tem de corresponder a um dos temas propostos.','Lembra-te de que o site devia tratar um dos temas do enunciado.','O tema do site afasta-se do que foi pedido.'],
  fecha:{ex:['Continua assim!','Um exemplo para a turma.','Excelente trabalho!','Mantém este nível nos próximos módulos.','Muitos parabéns!'],
    mb:['Continua com este empenho!','Com pequenos acertos fica excelente.','Bom trabalho!','Estás no caminho certo.','Força nos acertos finais!'],
    b:['Com estes acertos, a nota sobe.','Confio que consegues melhorar.','Vale a pena rever estes pontos.','Continua a trabalhar!','Estás quase lá.'],
    s:['Com mais dedicação, consegues muito mais.','Usa os exemplos corretos como guia.','Revê os pontos indicados com calma.','Conto contigo para melhorar.','Ainda vais a tempo de melhorar.'],
    ins:['Fala comigo se precisares de ajuda.','Usa os exemplos corretos e retoma o trabalho.','Com empenho, ainda consegues recuperar.','Estou disponível para te ajudar.','Não desistas: vamos melhorar isto juntos.']}};
function rvRng(seed){let a=0;const s=String(seed);for(let i=0;i<s.length;i++)a=Math.imul(a^s.charCodeAt(i),2654435761)>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rvJunta=L=>L.length<2?L.join(''):L.slice(0,-1).join(', ')+' e '+L[L.length-1];
function rvComGeral(E,al,an,av){const rnd=rvRng(al.id+'|'+(al.comGSeed||0));const pick=(L,usados)=>{const liv=usados?L.filter(x=>!usados.has(x)):L;const X=liv.length?liv:L;const f=X[Math.floor(rnd()*X.length)];esc_.push(f);return f};
  const baral=L=>{const X=L.slice();for(let i=X.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[X[i],X[j]]=[X[j],X[i]]}return X};
  const usados=new Set();(av?av.al:[]).forEach(o=>{if(o!==al&&o.comGAuto&&Array.isArray(o.comGF))o.comGF.forEach(f=>usados.add(f))});const esc_=[];
  const T=rvTot(al,E);const r=T.t/(rvMax(E)||1);const b=r>=.9?'ex':r>=.75?'mb':r>=.6?'b':r>=.475?'s':'ins';
  const nome=String(al.nome||'').trim().split(/\s+/)[0]||'Olá';const sub=(f,o)=>{const n=o&&o.n;let t=f.replace(/\{([^{}|]*(?:\{n\}[^{}|]*)*)\|([^{}|]*(?:\{n\}[^{}|]*)*)\}/g,(m,a,b)=>n==1?a:b).replace('{N}',nome).replace(/\{(de|em):L\}/,(m,p)=>rvJunta(((o&&o.I)||[]).map(x=>p+' '+x))).replace('{L}',o&&o.L||'').replace(/\{n\}/g,n||'');
    return t.replace(/\b(de|em) (o|a|os|as)\b/g,(m,p,q)=>(p==='de'?'d':'n')+q).replace(/\b(De|Em) (o|a|os|as)\b/g,(m,p,q)=>(p==='De'?'D':'N')+q)};
  const det=c=>c.auto&&an.det[c.auto];
  const fortes=baral(E.crit.filter(c=>{const d=det(c);return d&&d.e==='ok'&&al.conf[c.id]==='alta'&&RV_FORTE[c.auto]&&!['url','online','idioma','descricao'].includes(c.auto)})).slice(0,2+Math.floor(rnd()*2)).map(c=>RV_FORTE[c.auto]);
  const perdas=E.crit.map(c=>({c,p:(+c.pts||0)-(+al.pts[c.id]||0)})).filter(x=>x.p>0&&x.c.auto&&RV_MELHORAR[x.c.auto]&&!['paginas','tema'].includes(x.c.auto)).sort((a,b)=>b.p-a.p||rnd()-.5);
  const mel=perdas.slice(0,b==='ex'?1:3).map(x=>RV_MELHORAR[x.c.auto]);
  const F=[sub(pick(RV_FR.abre[b],usados))];const meio=[];
  if(fortes.length)meio.push(sub(pick(RV_FR.forte,usados),{L:rvJunta(fortes),I:fortes}));
  const extra=[];const vz=an.pags.filter(p=>p.vazia);if(vz.length)extra.push(sub(pick(RV_FR.vazias,usados),{n:vz.length,L:rvJunta(vz.slice(0,3).map(p=>'«'+p.t+'»'))}));
  const pl=[...new Set(an.plac.map(x=>x.t))];if(pl.length)extra.push(sub(pick(RV_FR.modelo,usados),{L:rvJunta(pl.slice(0,3).map(t=>'«'+t+'»'))}));
  if(an.det.tema&&an.det.tema.e==='falta')extra.push(sub(pick(RV_FR.tema,usados)));
  if(mel.length)meio.push(sub(pick(RV_FR.mel,usados),{L:rvJunta(mel)}));
  if(an.a11y.some(x=>/Texto alternativo/.test(x.t)&&x.e==='falta'))extra.push(sub(pick(RV_FR.alt,usados)));
  if(an.links.mal.length)extra.push(sub(pick(RV_FR.links,usados),{n:an.links.mal.length}));
  if(rnd()<.5&&meio.length>1&&b!=='ex'&&b!=='mb')meio.reverse();
  F.push(...meio,...baral(extra).slice(0,b==='ins'||b==='s'?3:2),sub(pick(RV_FR.fecha[b],usados)));
  al.comGF=esc_;return F.join(' ').replace(/\s+/g,' ').trim()}
function rvAplicarAuto(av,al,forcar){const E=rvEn(av.enun);const cfg=rvCfg();const an=al.an;if(!an)return 0;al.pts=al.pts||{};al.com=al.com||{};al.auto=al.auto||{};al.comAuto=al.comAuto||{};let n=0;
  if(cfg.aplicar||forcar)E.crit.forEach(c=>{const s=al.sug[c.id];if(s==null)return;if(al.pts[c.id]==null||al.pts[c.id]===''||al.auto[c.id]){if(al.pts[c.id]!==s)n++;al.pts[c.id]=s;al.auto[c.id]=true}});
  if(cfg.comentar||forcar){E.crit.forEach(c=>{const d=c.auto&&an.det[c.auto];if(!d||al.conf[c.id]==='baixa'||d.e==='manual')return;if(!al.com[c.id]||al.comAuto[c.id]){al.com[c.id]=rvComTxt(d);al.comAuto[c.id]=true}});
    if(!al.comG||al.comGAuto){al.comG=rvComGeral(E,al,an,av);al.comGAuto=true}}
  if(n)rvLog(al,'Correção automática: '+n+' critério(s)');return n}
const rvPorRever=(al,E)=>E.crit.filter(c=>!(al.visto||{})[c.id]&&(al.pts[c.id]==null||al.pts[c.id]===''||((al.auto||{})[c.id]&&(al.conf||{})[c.id]!=='alta'))).length;
function rvGuardarAnalise(av,al,an){const E=rvEn(av.enun);const cfg=rvCfg();const ant=al.an;al.an=an;al.sug={};al.conf={};
  E.crit.forEach(c=>{const d=c.auto&&an.det[c.auto];if(!d)return;let f,conf;
    if(d.e==='manual'||(c.auto==='menu'&&d.e==='parcial')){if(!cfg.estimar)return;const e=rvEstimar(c.auto,an);if(!e)return;f=e[0];conf='baixa';an.det[c.auto]={...d,nota:e[1]}}
    else{f=d.e==='ok'?1:d.q!=null?d.q*.75:d.e==='parcial'?.5:0;conf=d.e==='parcial'?'media':'alta';if(c.auto==='titulos'&&an.plac.length)f=Math.min(f,.75)}
    al.sug[c.id]=Math.round((+c.pts||0)*f*2)/2;al.conf[c.id]=conf});
  if(ant){const mud=[];E.crit.forEach(c=>{const a=ant.det&&ant.det[c.auto],b=an.det[c.auto];if(a&&b&&a.e!==b.e)mud.push(c.n+': '+a.e+' → '+b.e)});al.difAn=mud}
  rvLog(al,'Análise automática'+(ant?' (nova)':''));rvAplicarAuto(av,al);save()}
async function rvCorrigirTodos(av,btn){const L=av.al.filter(x=>x.url);let ok=0,err=0,i=0;const fila=L.slice();
  const vez=async()=>{while(fila.length){const al=fila.shift();i++;if(btn)btn.textContent=`A corrigir ${i} de ${L.length}…`;try{await rvAnalisar(av,al);rvAplicarAuto(av,al,true);ok++}catch(_){err++}}};
  await Promise.all([vez(),vez(),vez()]);save();return {ok,err,sem:av.al.length-L.length}}
/* colar dados à mão (quando o site não deixa ler diretamente) */
function rvColarDlg(av,al){openDrawer('Colar os dados do site',`<div class="ed"><p class="hint" style="margin-top:0">Abra no browser os dois endereços abaixo, selecione tudo (Ctrl+A), copie e cole aqui.</p>
  <p><b>1.</b> <code>${esc(rvBase(al.url)||'https://…')}/wp-json/</code></p><textarea id="rvc-r" rows="4" placeholder="Cole aqui o primeiro"></textarea>
  <p><b>2.</b> <code>${esc(rvBase(al.url)||'https://…')}/wp-json/wp/v2/pages?per_page=100</code></p><textarea id="rvc-p" rows="6" placeholder="Cole aqui o segundo"></textarea>
  <button class="btn pri" id="rvc-ok" style="margin-top:10px">${ic('check',14)} Analisar</button></div>`);
  $('#rvc-ok').onclick=()=>{try{const root=esLimpo(JSON.parse($('#rvc-r').value||'{}'));const pg=esLimpo(JSON.parse($('#rvc-p').value||'[]'));if(!Array.isArray(pg))throw new Error('O segundo texto não é uma lista de páginas.');
    const an=rvAnalisarDados(rvEn(av.enun),rvBase(al.url),root,pg,[],{});delete an._links;rvGuardarAnalise(av,al,an);closeDrawer();toast('Análise feita','ok');vReview()}catch(e){toast('Não foi possível ler: '+e.message,'erro')}}}
/* ---------- imagens (carregar / colar), áudio ---------- */
function rvImgFicheiro(f){return new Promise((ok,ko)=>{if(!f||!/^image\//.test(f.type))return ko(new Error('Escolha uma imagem.'));const u=URL.createObjectURL(f);const im=new Image();
  im.onload=()=>{const s=Math.min(1,1400/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);
    let d=c.toDataURL('image/webp',.7);if(!/^data:image\/webp/.test(d))d=c.toDataURL('image/jpeg',.72);ok(d)};im.onerror=()=>ko(new Error('Imagem inválida'));im.src=u})}
let rvRec=null;
async function rvGravar(btn,fim){if(rvRec){rvRec.stop();return}try{const st=await navigator.mediaDevices.getUserMedia({audio:true});const op={audioBitsPerSecond:16000};
  const mr=new MediaRecorder(st,MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?{...op,mimeType:'audio/webm;codecs=opus'}:op);const ch=[];rvRec=mr;btn.classList.add('rvrec');btn.textContent='■ Parar (máx. 60 s)';
  mr.ondataavailable=e=>ch.push(e.data);const to=setTimeout(()=>mr.state!=='inactive'&&mr.stop(),60000);
  mr.onstop=()=>{clearTimeout(to);st.getTracks().forEach(t=>t.stop());rvRec=null;const b=new Blob(ch,{type:mr.mimeType||'audio/webm'});const fr=new FileReader();fr.onload=()=>fim(fr.result);fr.readAsDataURL(b)};mr.start()}
  catch(e){rvRec=null;toast('Sem acesso ao microfone: '+e.message,'erro')}}
/* ---------- anotações sobre capturas (formas guardadas em coordenadas 0–1, desenhadas por cima da imagem) ---------- */
function rvSvgAnot(L){return `<svg class="rvanot" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="rvah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="context-stroke"/></marker></defs>${(L||[]).map(a=>{const c=esc(a.c||'#e11d48');const X=v=>Math.round((+v||0)*1000);
  if(a.k==='seta')return `<line x1="${X(a.x)}" y1="${X(a.y)}" x2="${X(a.x2)}" y2="${X(a.y2)}" stroke="${c}" stroke-width="6" marker-end="url(#rvah)" vector-effect="non-scaling-stroke"/>`;
  if(a.k==='circ')return `<ellipse cx="${X((a.x+a.x2)/2)}" cy="${X((a.y+a.y2)/2)}" rx="${Math.abs(X(a.x2-a.x))/2}" ry="${Math.abs(X(a.y2-a.y))/2}" fill="none" stroke="${c}" stroke-width="4" vector-effect="non-scaling-stroke"/>`;
  if(a.k==='ret')return `<rect x="${X(Math.min(a.x,a.x2))}" y="${X(Math.min(a.y,a.y2))}" width="${Math.abs(X(a.x2-a.x))}" height="${Math.abs(X(a.y2-a.y))}" fill="none" stroke="${c}" stroke-width="4" vector-effect="non-scaling-stroke"/>`;
  return ''}).join('')}</svg>${(L||[]).filter(a=>a.k==='txt').map(a=>`<span class="rvatxt" style="left:${(+a.x||0)*100}%;top:${(+a.y||0)*100}%;background:${esc(a.c||'#e11d48')}">${esc(a.t)}</span>`).join('')}`}
function rvAnotarDlg(sh,fim){const L=sh.anot=Array.isArray(sh.anot)?sh.anot:[];let k='seta',cor='#e11d48';
  openDrawer('Anotar captura',`<div class="ed"><div class="seg rvtools">${[['seta','➜ Seta'],['circ','◯ Círculo'],['ret','▭ Retângulo'],['txt','T Texto']].map(([a,b])=>`<button type="button" data-rk="${a}" class="${a===k?'on':''}">${b}</button>`).join('')}</div>
   <div class="rvcores">${['#e11d48','#f59e0b','#16a34a','#2563eb','#111827'].map(c=>`<button type="button" data-rc="${c}" style="background:${c}" aria-label="Cor ${c}" class="${c===cor?'on':''}"></button>`).join('')}<button class="btn" id="rva-und">${ic('back',14)} Anular</button><button class="btn" id="rva-lim">${ic('trash',14)} Limpar</button></div>
   <div class="rvfig rvdraw" id="rva-f"><img src="${esc(sh.src)}" alt="" draggable="false"><div id="rva-o">${rvSvgAnot(L)}</div></div>
   <label>Legenda</label><input id="rva-cap" value="${esc(sh.cap||'')}" maxlength="200"><button class="btn pri" id="rva-ok" style="margin-top:10px">${ic('check',14)} Guardar</button></div>`);
  const f=$('#rva-f'),o=$('#rva-o');const pinta=()=>o.innerHTML=rvSvgAnot(L);let ini=null,tmp=null;
  $$('#dw-b [data-rk]').forEach(b=>b.onclick=()=>{k=b.dataset.rk;$$('#dw-b [data-rk]').forEach(z=>z.classList.toggle('on',z===b))});
  $$('#dw-b [data-rc]').forEach(b=>b.onclick=()=>{cor=b.dataset.rc;$$('#dw-b [data-rc]').forEach(z=>z.classList.toggle('on',z===b))});
  const pos=e=>{const r=f.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}};
  f.onpointerdown=e=>{e.preventDefault();const p=pos(e);if(k==='txt'){const t=prompt('Texto da anotação:');if(t&&t.trim()){L.push({k:'txt',x:p.x,y:p.y,t:t.trim().slice(0,140),c:cor});pinta()}return}ini=p;tmp={k,x:p.x,y:p.y,x2:p.x,y2:p.y,c:cor};L.push(tmp);f.setPointerCapture(e.pointerId)};
  f.onpointermove=e=>{if(!ini)return;const p=pos(e);tmp.x2=p.x;tmp.y2=p.y;pinta()};
  f.onpointerup=()=>{if(!ini)return;if(Math.abs(tmp.x2-tmp.x)+Math.abs(tmp.y2-tmp.y)<.01)L.pop();ini=null;tmp=null;pinta()};
  $('#rva-und').onclick=()=>{L.pop();pinta()};$('#rva-lim').onclick=()=>{L.length=0;pinta()};$('#rva-ok').onclick=()=>{sh.cap=$('#rva-cap').value.trim();save();closeDrawer();fim&&fim()}}
/* ---------- ver imagem ampliada / lado a lado ---------- */
function rvLupa(html){let d=$('#rvlupa');if(!d){d=document.createElement('div');d.id='rvlupa';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-rvlx]'))d.remove()})}
  d.innerHTML=`<div class="rvlupa-c"><button class="btn" data-rvlx aria-label="Fechar">${ic('x',16)} Fechar</button>${html}</div>`;
  const esc_=e=>{if(e.key==='Escape'){const z=$('#rvlupa');if(z)z.remove();removeEventListener('keydown',esc_)}};addEventListener('keydown',esc_)}
function rvLadoALado(c,al,E){const ref=rvRef(E,c.ref);const d=al&&al.an&&c.auto&&al.an.det[c.auto];const u=d&&d.onde&&d.onde[0]?d.onde[0].u:'';const sh=(al.shots||[]).filter(s=>s.crit===c.id);
  rvLupa(`<h3 style="margin:4px 0 10px">${esc(c.n)}</h3><div class="rvlado"><figure><figcaption>✓ Exemplo correto</figcaption>${ref?`<img src="${ref}" alt="Exemplo correto: ${esc(c.n)}">`:'<p class="mut">Sem exemplo.</p>'}</figure>
   <figure><figcaption>Trabalho do aluno${u?` · <a href="${esc(u)}" target="_blank" rel="noopener">abrir a página</a>`:''}</figcaption>${sh.length?sh.map(s=>`<div class="rvfig"><img src="${esc(s.src)}" alt="">${rvSvgAnot(s.anot)}</div>`).join(''):u?`<img src="${esc(rvShot(u,1280,900))}" alt="Captura da página do aluno" loading="lazy">`:'<p class="mut">Sem captura: carregue uma no separador Capturas.</p>'}</figure></div>`)}
/* ---------- estrutura da vista ---------- */
TITLES.review='Spruce Review';
function rvShell(tab,body){const I=[['av','file','Avaliações'],['enun','clipboard','Enunciados'],['com','chat','Comentários'],['ref','image','Exemplos corretos']];
  return `<div class="rv"><nav class="rvnav" aria-label="Spruce Review"><div class="rvbrand">${ic('globo',18)} <span>Spruce Review</span></div>${I.map(([k,i,l])=>`<button type="button" data-rvt="${k}" class="${tab===k?'on':''}">${ic(i,17)} <span>${l}</span></button>`).join('')}</nav><main class="rvmain">${body}</main></div>`}
function vReview(){if(!rvOn())return go('inicio');RV();barBtns([]);const e=UI.rvEd;
  if(e&&e.k==='al'){const av=RV().av.find(x=>x.id===e.av);const al=av&&av.al.find(x=>x.id===e.id);if(al)return rvAluno(av,al)}
  if(e&&e.k==='av'){const av=RV().av.find(x=>x.id===e.id);if(av)return rvAv(av)}
  if(e&&e.k==='enun'){const E=RV().enun.find(x=>x.id===e.id);if(E)return rvEnunEd(E)}
  UI.rvEd=null;const tab=UI.rvTab||'av';$('#view').innerHTML=rvShell(tab,'<div id="rv-m"></div>');rvBindNav();({av:rvListaAv,enun:rvListaEnun,com:rvBanco,ref:rvRefs}[tab]||rvListaAv)($('#rv-m'))}
function rvBindNav(){$$('#view [data-rvt]').forEach(b=>b.onclick=()=>{UI.rvTab=b.dataset.rvt;UI.rvEd=null;vReview()})}
const rvHd=(i,t,x)=>`<div class="rvhd"><h2>${ic(i,20)} ${t}</h2><span class="rvsp"></span>${x||''}</div>`;
const rvEst=e=>e==='ok'?'<span class="rvb ok">✓ Feito</span>':e==='parcial'?'<span class="rvb pa">◐ Parcial</span>':e==='falta'?'<span class="rvb no">✗ Em falta</span>':'<span class="rvb ma">? Ver à mão</span>';
function rvListaAv(m){const L=RV().av;
  m.innerHTML=rvHd('file','Avaliações de sites',`<button class="btn pri" id="rv-nova">${ic('plus',15)} Nova avaliação</button>`)+(L.length?`<div class="rvgr">${L.map(av=>{const E=rvEn(av.enun);const fe=av.al.filter(a=>rvTot(a,E).c).length;const md=rvMedia(av);
    return `<button type="button" class="rvcard" data-rvav="${av.id}"><b>${esc(av.titulo)}</b><span class="mut">${esc(E.titulo)}</span><span>${ic('users',13)} ${av.al.length} alunos · ${fe} corrigidos</span>${md!=null?`<span class="rvnota">${nf(md)} valores de média</span>`:''}</button>`}).join('')}</div>`
    :`<div class="rvvazio">${ic('globo',40)}<h3>Avalie os sites dos alunos</h3><p>Crie uma avaliação, junte os alunos (da turma ou de um ficheiro) com o endereço de cada site e a app analisa os sites, mostra capturas, sugere pontos e calcula a nota de 0 a 20.</p></div>`);
  $('#rv-nova').onclick=()=>rvNovaDlg();m.querySelectorAll('[data-rvav]').forEach(b=>b.onclick=()=>{UI.rvEd={k:'av',id:b.dataset.rvav};vReview()})}
function rvNovaDlg(){const a=A();const TT=rvTurmas();if(!TT.length)return toast('Precisa de uma turma de TIC de um curso profissional.','erro');
  openDrawer('Nova avaliação · Módulo 03 de TIC',`<div class="ed"><label>Turma (TIC, ensino profissional)</label><select id="rvn-tu">${TT.map(t=>{const c=rvCurso(rvCursoDe(t));return `<option value="${t.id}">${esc(t.nome)} · ${esc(c?c.n:(t.curso||'curso por identificar'))} (${(t.alunos||[]).length})</option>`}).join('')}</select>
    <label>Curso</label><select id="rvn-c">${RV_CURSOS.map(c=>`<option value="${c.k}">${esc(c.n)}</option>`).join('')}</select><label>Enunciado</label><div id="rvn-ew"></div>
    <label>Título</label><input id="rvn-t" value="Teste prático — Módulo 03" maxlength="120"><label>Data</label><input type="date" id="rvn-d" value="${isoHoje()}"><button class="btn pri" id="rvn-ok" style="margin-top:12px">${ic('plus',14)} Criar</button></div>`);
  const pinta=()=>{const k=$('#rvn-c').value;const L=RV().enun.filter(E=>E.curso===k);
    $('#rvn-ew').innerHTML=L.length?`<select id="rvn-e">${L.map(E=>`<option value="${E.id}">${esc(E.titulo)} (${rvMax(E)} pts)</option>`).join('')}</select>`:`<div class="alert">${ic('info',15)} O enunciado de ${esc(rvCurso(k).n)} ainda não foi incluído. <button class="btn" id="rvn-inc">${ic('plus',14)} Incluir enunciado e critérios</button></div>`;
    $('#rvn-ok').disabled=!L.length;const b=$('#rvn-inc');if(b)b.onclick=()=>{closeDrawer();UI.rvTab='enun';UI.rvEd=null;vReview();setTimeout(()=>rvIncluirDlg(k),50)}};
  const sel=()=>{const t=TT.find(x=>x.id===$('#rvn-tu').value);const k=rvCursoDe(t);if(k)$('#rvn-c').value=k;pinta()};$('#rvn-tu').onchange=sel;$('#rvn-c').onchange=pinta;sel();
  $('#rvn-ok').onclick=()=>{const e=$('#rvn-e');if(!e)return;const av={id:uid(),titulo:$('#rvn-t').value.trim()||'Teste prático — Módulo 03',enun:e.value,curso:$('#rvn-c').value,data:$('#rvn-d').value,tid:$('#rvn-tu').value||'',al:[],criado:Date.now()};
    const t=a&&a.turmas.find(x=>x.id===av.tid);if(t)rvJuntarTurma(av,t);RV().av.unshift(av);save();try{audit('Spruce Review','Avaliação criada',av.titulo)}catch(_){}closeDrawer();UI.rvEd={k:'av',id:av.id};vReview()}}
function rvJuntarTurma(av,t){let n=0;(t.alunos||[]).filter(a=>a.frequenta!==false).sort((a,b)=>(+a.num||0)-(+b.num||0)).forEach(a=>{if(av.al.some(x=>x.aid===a.id))return;av.al.push({id:uid(),aid:a.id,num:a.num||'',nome:a.nome||'',url:'',pts:{},com:{},shots:[],hist:[]});n++});return n}
function rvMedia(av){const E=rvEn(av.enun);const V=av.al.filter(a=>rvTot(a,E).n).map(a=>rvVal(rvTot(a,E).t,E));return V.length?Math.round(V.reduce((s,v)=>s+v,0)/V.length*10)/10:null}
/* ---------- uma avaliação: alunos, turma, exportar ---------- */
function rvAv(av){const E=rvEn(av.enun);const tab=UI.rvAvTab||'al';
  $('#view').innerHTML=rvShell('av',`<div class="rvhd"><button class="btn" id="rv-vt">${ic('back',15)} Avaliações</button><h2>${esc(av.titulo)}</h2><span class="rvsp"></span><span class="mut">TIC · Módulo 03 · ${esc((rvCurso(E.curso)||{}).n||'')} · ${rvMax(E)} pts = 20 valores</span></div>
   <div class="seg rvtabs">${[['al','users','Alunos'],['tu','chart','Turma'],['dup','checks','Dupla correção'],['ex','download','Exportar e partilhar']].map(([k,i,l])=>`<button type="button" data-rvat="${k}" class="${tab===k?'on':''}">${ic(i,14)} ${l}</button>`).join('')}</div><div id="rv-avm"></div>`);
  rvBindNav();$('#rv-vt').onclick=()=>{UI.rvEd=null;vReview()};$$('#view [data-rvat]').forEach(b=>b.onclick=()=>{UI.rvAvTab=b.dataset.rvat;rvAv(av)});
  ({al:rvAvAlunos,tu:rvAvTurma,dup:rvAvDupla,ex:rvAvExportar}[tab]||rvAvAlunos)($('#rv-avm'),av,E)}
function rvAvAlunos(m,av,E){const mx=rvMax(E);
  m.innerHTML=`<div class="rvbar"><button class="btn" id="rv-add">${ic('plus',14)} Aluno</button><button class="btn" id="rv-imp">${ic('upload',14)} Importar (turma / ficheiro)</button><button class="btn" id="rv-pad">${ic('globo',14)} Gerar endereços</button><button class="btn pri" id="rv-auto">${ic('sparkle',14)} Corrigir tudo automaticamente</button><button class="btn" id="rv-ana">${ic('search',14)} Analisar de novo</button><button class="btn" id="rv-sug">${ic('check',14)} Aplicar sugestões a todos</button><button class="btn" id="rv-cfg">${ic('gear',14)} Correção automática</button><button class="btn" id="rv-del">${ic('trash',14)} Apagar avaliação</button></div>
   ${av.al.length?`<div class="rvtw"><table class="rvt"><thead><tr><th>N.º</th><th>Aluno</th><th>Endereço</th><th>Análise</th><th>Estado</th><th>Pontos</th><th>Nota</th><th>Autoav.</th><th></th></tr></thead><tbody>${av.al.map(al=>{const T=rvTot(al,E);const sa=al.autoav?rvTot({pts:al.autoav.pts},E):null;
     return `<tr><td>${esc(al.num)}</td><td><b>${esc(al.nome||'—')}</b></td><td><input class="rvurl" data-rvu="${al.id}" value="${esc(al.url||'')}" placeholder="testea01nome.wasmer.app" aria-label="Endereço do site de ${esc(al.nome)}"></td>
     <td>${al.an?`${Object.values(al.an.det).filter(d=>d.e==='ok').length} ✓ · ${new Date(al.an.t).toLocaleDateString('pt-PT')}`:'<span class="mut">—</span>'}</td><td>${(()=>{if(!T.n)return '<span class="mut">por corrigir</span>';const r=rvPorRever(al,E);return r?`<span class="rvb pa">${r} por rever</span>`:'<span class="rvb ok">✓ revista</span>'})()}</td><td>${T.n?nf(T.t)+' / '+mx:'—'}${T.n&&!T.c?' <span class="mut">(incompleto)</span>':''}</td>
     <td>${T.n?`<b class="rvnota">${nf(rvVal(T.t,E))}</b>`:'—'}</td><td>${sa&&sa.n?nf(rvVal(sa.t,E)):'—'}</td><td><button class="btn pri" data-rvop="${al.id}">${ic('pencil',14)} Corrigir</button></td></tr>`}).join('')}</tbody></table></div>`:`<div class="rvvazio"><p>Ainda sem alunos. Importe a turma ou um ficheiro com «nome;endereço».</p></div>`}`;
  m.querySelectorAll('[data-rvu]').forEach(i=>i.onchange=()=>{const al=av.al.find(x=>x.id===i.dataset.rvu);al.url=i.value.trim();rvLog(al,'Endereço: '+al.url);save();
    if(al.url&&rvCfg().analisar){i.classList.add('rvbusy');rvAnalisar(av,al).then(()=>toast('Site de '+aaCurto(al.nome)+' corrigido automaticamente','ok')).catch(e=>toast(e.message,'erro')).finally(()=>{if(VIEW==='review'&&UI.rvEd&&UI.rvEd.k==='av')rvAv(av)})}});
  m.querySelectorAll('[data-rvop]').forEach(b=>b.onclick=()=>{UI.rvEd={k:'al',av:av.id,id:b.dataset.rvop};UI.rvAlTab='cor';vReview()});
  $('#rv-add').onclick=()=>{const n=prompt('Nome do aluno:');if(!n||!n.trim())return;av.al.push({id:uid(),num:String(av.al.length+1),nome:n.trim().slice(0,120),url:'',pts:{},com:{},shots:[],hist:[]});save();rvAv(av)};
  $('#rv-imp').onclick=()=>rvImportarDlg(av);$('#rv-pad').onclick=()=>rvPadraoDlg(av,E);
  $('#rv-auto').onclick=async e=>{const b=e.currentTarget;if(!av.al.some(x=>x.url))return toast('Indique primeiro os endereços dos sites (ou use «Gerar endereços»).','erro');b.disabled=true;
    const r=await rvCorrigirTodos(av,b);const rev=av.al.reduce((s,al)=>s+(al.an?rvPorRever(al,E):0),0);
    toast(`${r.ok} sites corrigidos`+(r.err?` · ${r.err} sem resposta (use «Colar dados»)`:'')+(r.sem?` · ${r.sem} sem endereço`:'')+(rev?` · ${rev} critérios para rever`:''),r.err?'aviso':'ok');rvAv(av)};
  $('#rv-cfg').onclick=()=>rvCfgDlg(()=>rvAv(av));
  $('#rv-ana').onclick=async e=>{const b=e.currentTarget;b.disabled=true;let ok=0,err=0;for(const al of av.al.filter(x=>x.url)){b.textContent='A analisar '+(ok+err+1)+'…';try{await rvAnalisar(av,al);ok++}catch(_){err++}}toast(`${ok} sites analisados`+(err?`, ${err} sem resposta`:''),err?'aviso':'ok');rvAv(av)};
  $('#rv-sug').onclick=()=>{let n=0;av.al.forEach(al=>{if(!al.sug)return;E.crit.forEach(c=>{if(al.sug[c.id]!=null&&(al.pts[c.id]==null||al.pts[c.id]==='')){al.pts[c.id]=al.sug[c.id];n++}});rvLog(al,'Sugestões aplicadas')});save();toast(n+' pontos preenchidos (só onde estava vazio)','ok');rvAv(av)};
  $('#rv-del').onclick=()=>{if(!confirm('Apagar a avaliação «'+av.titulo+'» e todas as correções?'))return;const L=RV().av;L.splice(L.indexOf(av),1);save();UI.rvEd=null;vReview()}}
function rvCfgDlg(fim){const c=rvCfg();const o=[['analisar','Corrigir logo que o endereço do site é escrito'],['aplicar','Dar os pontos sugeridos pela análise (só onde ainda não mexeu)'],['estimar','Estimar também os critérios que não se veem de fora (menu, tema, adaptação ao telemóvel), marcados para rever'],['comentar','Escrever os comentários para o aluno e a apreciação geral (só onde ainda não escreveu)'],['capturas','Mostrar ao aluno as capturas das páginas onde cada bloco foi encontrado']];
  openDrawer('Correção automática',`<div class="ed"><p class="hint" style="margin-top:0">O que muda à mão nunca é substituído. O que fica com confiança média ou em estimativa aparece em «por rever».</p>${o.map(([k,l])=>`<label class="chk"><input type="checkbox" data-rvcf="${k}" ${c[k]?'checked':''}> <span>${l}</span></label>`).join('')}<button class="btn pri" id="rvcf-ok" style="margin-top:12px">${ic('check',14)} Guardar</button></div>`);
  $('#rvcf-ok').onclick=()=>{$$('#dw-b [data-rvcf]').forEach(i=>c[i.dataset.rvcf]=i.checked);save();closeDrawer();toast('Guardado','ok');fim&&fim()}}
function rvImportarDlg(av){const a=A();const TT=a?turmasFiltradas(a):[];
  openDrawer('Importar alunos',`<div class="ed"><label>Da turma (lista que veio do programa da escola)</label><select id="rvi-t"><option value="">—</option>${TT.map(t=>`<option value="${t.id}">${esc(t.nome)} · ${esc(t.disciplina||'')}</option>`).join('')}</select><button class="btn" id="rvi-tok" style="margin:8px 0 16px">${ic('users',14)} Juntar a turma</button>
   <label>Ficheiro CSV ou texto colado</label><p class="hint" style="margin-top:0">Uma linha por aluno: <code>número;nome;endereço</code> ou <code>nome;endereço</code> (separador ; , ou tabulação).</p>
   <input type="file" id="rvi-f" accept=".csv,.txt,text/csv,text/plain"><textarea id="rvi-x" rows="8" placeholder="1;Aluno Exemplo;testea01exemplo.wasmer.app"></textarea><button class="btn pri" id="rvi-ok" style="margin-top:8px">${ic('upload',14)} Importar</button></div>`);
  $('#rvi-tok').onclick=()=>{const t=a&&a.turmas.find(x=>x.id===$('#rvi-t').value);if(!t)return toast('Escolha a turma','erro');const n=rvJuntarTurma(av,t);av.tid=av.tid||t.id;save();closeDrawer();toast(n+' alunos juntados','ok');rvAv(av)};
  $('#rvi-f').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>$('#rvi-x').value=String(r.result).replace(/^﻿/,'');r.readAsText(f)};
  $('#rvi-ok').onclick=()=>{let n=0;String($('#rvi-x').value).split(/\r?\n/).forEach(l=>{const c=l.split(/[;\t,]/).map(s=>s.trim().replace(/^"|"$/g,''));if(!c[0]||/^(n|num|número|nome)$/i.test(c[0]))return;
      let num='',nome='',url='';if(c.length>=3){[num,nome,url]=c}else if(c.length===2){if(/\.|\//.test(c[1]))[nome,url]=c;else[num,nome]=c}else nome=c[0];
      const ex=av.al.find(x=>normT(x.nome)===normT(nome));if(ex){if(url)ex.url=url;return}av.al.push({id:uid(),num:num.slice(0,6),nome:nome.slice(0,120),url:url.slice(0,300),pts:{},com:{},shots:[],hist:[]});n++});
    save();closeDrawer();toast(n+' alunos importados','ok');rvAv(av)}}
function rvPadraoDlg(av,E){openDrawer('Gerar endereços pelo padrão',`<div class="ed"><p class="hint" style="margin-top:0">Preenche os endereços vazios com o padrão. <code>{nn}</code> = número com 2 algarismos, <code>{nome}</code> = primeiro nome sem acentos.</p>
   <label>Padrão</label><input id="rvp-p" value="testea{nn}{nome}.wasmer.app"><button class="btn pri" id="rvp-ok" style="margin-top:10px">${ic('check',14)} Preencher</button></div>`);
  $('#rvp-ok').onclick=()=>{const p=$('#rvp-p').value.trim();let n=0;av.al.forEach(al=>{if(al.url)return;const nm=normT(String(al.nome).split(/\s+/)[0]||'').replace(/[^a-z0-9]/g,'');al.url=p.replace('{nn}',String(al.num||'').padStart(2,'0')).replace('{nome}',nm);n++});save();closeDrawer();toast(n+' endereços preenchidos — confirme-os','ok');rvAv(av)}}
/* turma: estatísticas e mapa de calor */
function rvAvTurma(m,av,E){const C=av.al.filter(a=>rvTot(a,E).n);if(!C.length){m.innerHTML='<div class="rvvazio"><p>Ainda não há correções.</p></div>';return}
  const V=C.map(a=>rvVal(rvTot(a,E).t,E));const med=V.reduce((s,v)=>s+v,0)/V.length;const so=[...V].sort((a,b)=>a-b);const mediana=so.length%2?so[(so.length-1)/2]:(so[so.length/2-1]+so[so.length/2])/2;
  const pos=V.filter(v=>v>=9.5).length;const bins=[0,0,0,0,0];V.forEach(v=>bins[v<5?0:v<9.5?1:v<14?2:v<17?3:4]++);const bl=['0–4','5–9','10–13','14–16','17–20'];const mb=Math.max(...bins,1);
  const pc=E.crit.map(c=>{const L=C.map(a=>a.pts[c.id]).filter(v=>v!=null&&v!=='');const r=L.length?L.reduce((s,v)=>s+(+v||0),0)/L.length/(+c.pts||1):null;return {c,r}});const piores=pc.filter(x=>x.r!=null).sort((a,b)=>a.r-b.r).slice(0,5);
  const cor=r=>r==null?'var(--line)':`hsl(${Math.round(r*120)} 70% ${r>.5?42:48}%)`;
  m.innerHTML=`<div class="rvkpis"><div><b>${nf(med)}</b><span>Média (valores)</span></div><div><b>${nf(mediana)}</b><span>Mediana</span></div><div><b>${nf(so[so.length-1])}</b><span>Melhor</span></div><div><b>${pos} / ${C.length}</b><span>Positivas</span></div></div>
   <div class="rvcols2"><section class="rvpanel"><h3>Distribuição das notas</h3><svg viewBox="0 0 320 160" class="rvhist" role="img" aria-label="Distribuição das notas">${bins.map((b,i)=>{const h=Math.round(b/mb*110);return `<rect x="${12+i*62}" y="${130-h}" width="46" height="${h}" fill="${i<2?'#dc2626':i<3?'#f59e0b':'#16a34a'}"/><text x="${35+i*62}" y="${124-h}" text-anchor="middle" font-size="12" fill="currentColor">${b}</text><text x="${35+i*62}" y="150" text-anchor="middle" font-size="11" fill="currentColor">${bl[i]}</text>`}).join('')}</svg></section>
   <section class="rvpanel"><h3>Critérios mais falhados</h3>${piores.map(x=>`<div class="rvpc"><span>${esc(x.c.n)}</span><span class="rvmeter"><i style="width:${Math.round(x.r*100)}%;background:${cor(x.r)}"></i></span><b>${Math.round(x.r*100)}%</b></div>`).join('')}</section></div>
   <section class="rvpanel"><h3>Mapa de calor (alunos × critérios)</h3><div class="rvtw"><table class="rvheat"><thead><tr><th>Aluno</th>${E.crit.map((c,i)=>`<th title="${esc(c.n)}">${i+1}</th>`).join('')}<th>Nota</th></tr></thead><tbody>${C.map(a=>`<tr><td>${esc(a.nome)}</td>${E.crit.map(c=>{const v=a.pts[c.id];const r=v==null||v===''?null:(+v||0)/(+c.pts||1);return `<td style="background:${cor(r)}" title="${esc(c.n)}: ${v==null?'—':nf(v)} / ${nf(c.pts)}">${v==null||v===''?'':nf(v)}</td>`}).join('')}<td><b>${nf(rvVal(rvTot(a,E).t,E))}</b></td></tr>`).join('')}</tbody></table></div>
   <p class="hint">${E.crit.map((c,i)=>`${i+1}. ${esc(c.n)}`).join(' · ')}</p></section>`}
/* dupla correção */
function rvAvDupla(m,av,E){av.lim2=av.lim2==null?25:av.lim2;
  m.innerHTML=`<div class="rvbar"><label class="rvinl">Segundo corretor <input id="rv2-n" value="${esc(av.cor2||'')}" placeholder="Nome do colega"></label><label class="rvinl">Divergência a partir de <input id="rv2-l" type="number" min="5" max="100" value="${av.lim2}" style="width:70px">% do critério</label></div>
   <p class="hint">Em cada aluno, o separador «Dupla correção» recebe os pontos do segundo corretor. Aqui ficam as divergências.</p>
   ${av.al.map(al=>{if(!al.pts2)return '';const D=E.crit.filter(c=>{const a=al.pts[c.id],b=al.pts2[c.id];return a!=null&&b!=null&&a!==''&&b!==''&&Math.abs(a-b)/(+c.pts||1)*100>=av.lim2});const t1=rvTot(al,E).t,t2=rvTot(al,E,'pts2').t;
     return `<section class="rvpanel"><h3>${esc(al.nome)} — ${nf(rvVal(t1,E))} / ${nf(rvVal(t2,E))} valores ${Math.abs(t1-t2)/rvMax(E)*20>=1?'<span class="rvb no">diferença ≥ 1 valor</span>':'<span class="rvb ok">notas próximas</span>'}</h3>${D.length?`<table class="rvt"><tr><th>Critério</th><th>Corretor 1</th><th>Corretor 2</th><th></th></tr>${D.map(c=>`<tr><td>${esc(c.n)}</td><td>${nf(al.pts[c.id])}</td><td>${nf(al.pts2[c.id])}</td><td><button class="btn" data-rvmed="${al.id}|${c.id}">Usar a média</button></td></tr>`).join('')}</table>`:'<p class="mut">Sem divergências.</p>'}</section>`}).join('')||'<div class="rvvazio"><p>Ainda nenhum aluno tem segunda correção.</p></div>'}`;
  $('#rv2-n').onchange=e=>{av.cor2=e.target.value.trim();save()};$('#rv2-l').onchange=e=>{av.lim2=Math.max(5,Math.min(100,+e.target.value||25));save();setTimeout(()=>rvAv(av))};
  m.querySelectorAll('[data-rvmed]').forEach(b=>b.onclick=()=>{const [aid,cid]=b.dataset.rvmed.split('|');const al=av.al.find(x=>x.id===aid);const v=Math.round(((+al.pts[cid]||0)+(+al.pts2[cid]||0))/2*2)/2;rvLog(al,'Média dos corretores em «'+(E.crit.find(c=>c.id===cid)||{}).n+'»: '+al.pts[cid]+' → '+v);al.pts[cid]=v;save();rvAv(av)})}
/* exportar e partilhar */
function rvLinhas(av,E){const cab=['N.º','Aluno','Endereço',...E.crit.map(c=>c.n+' ('+c.pts+')'),'Total ('+rvMax(E)+')','Nota (0-20)'];
  return [cab,...av.al.map(al=>{const T=rvTot(al,E);return [al.num,al.nome,al.url,...E.crit.map(c=>al.pts[c.id]==null?'':String(al.pts[c.id]).replace('.',',')),T.n?nf(T.t):'',T.n?nf(rvVal(T.t,E)):'']})]}
function rvBaixar(nome,txt,tipo){const b=new Blob(['﻿'+txt],{type:tipo});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=nome;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove()},500)}
function rvAvExportar(m,av,E){
  m.innerHTML=`<div class="rvgr"><button type="button" class="rvcard" id="rx-csv">${ic('download',22)}<b>Pauta em CSV</b><span class="mut">Para qualquer folha de cálculo</span></button>
   <button type="button" class="rvcard" id="rx-xls">${ic('download',22)}<b>Pauta para Excel</b><span class="mut">Ficheiro .xls com cores</span></button>
   <button type="button" class="rvcard" id="rx-pdf">${ic('printer',22)}<b>Relatórios individuais</b><span class="mut">Um por aluno, para imprimir ou guardar em PDF</span></button>
   <button type="button" class="rvcard" id="rx-por">${ic('send',22)}<b>Página de cada aluno</b><span class="mut">Ligações privadas com o feedback e a autoavaliação</span></button></div>`;
  const nm=normT(av.titulo).replace(/[^a-z0-9]+/g,'-');
  $('#rx-csv').onclick=()=>rvBaixar(nm+'.csv',rvLinhas(av,E).map(l=>l.map(c=>'"'+String(c==null?'':c).replace(/"/g,'""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8');
  $('#rx-xls').onclick=()=>{const L=rvLinhas(av,E);rvBaixar(nm+'.xls',`<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${L[0].map(c=>`<th style="background:#1f7a5a;color:#fff">${esc(c)}</th>`).join('')}</tr>${L.slice(1).map(l=>`<tr>${l.map((c,i)=>`<td${i===l.length-1&&c!==''?` style="font-weight:bold;background:${parseFloat(String(c).replace(',','.'))>=9.5?'#dcfce7':'#fee2e2'}"`:''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></body></html>`,'application/vnd.ms-excel')};
  $('#rx-pdf').onclick=()=>rvRelatorio(av,E,av.al);$('#rx-por').onclick=()=>rvPortalTodosDlg(av,E)}
function rvRelatorio(av,E,L){const w=open('','_blank');if(!w)return toast('O browser bloqueou a janela. Permita janelas desta página.','erro');const mx=rvMax(E);
  const pg=al=>{const T=rvTot(al,E);return `<section class="pg"><h1>${esc(av.titulo)}</h1><p class="sub">${esc(al.nome)}${al.num?' · n.º '+esc(al.num):''} · ${esc(al.url||'')}</p><p class="tot">${nf(T.t)} / ${mx} pontos · <b>${nf(rvVal(T.t,E))} valores</b></p>
    ${E.doms.map((d,di)=>{const C=E.crit.filter(c=>c.dom===di);if(!C.length)return '';const s=C.reduce((x,c)=>x+(+al.pts[c.id]||0),0),sm=C.reduce((x,c)=>x+(+c.pts||0),0);return `<h2>${esc(d)} <span>${nf(s)} / ${sm}</span></h2><table>${C.map(c=>{const v=al.pts[c.id];const nv=rvNivel(v,c.pts);return `<tr><td>${esc(c.n)}${al.com&&al.com[c.id]?`<div class="cm">${esc(al.com[c.id])}</div>`:''}</td><td class="n">${nv>=0?RV_NIV[nv][1]:''}</td><td class="p">${v==null||v===''?'—':nf(v)} / ${nf(c.pts)}</td></tr>`}).join('')}</table>`}).join('')}
    ${al.comG?`<h2>Apreciação geral</h2><p>${esc(al.comG)}</p>`:''}${(al.shots||[]).length?`<h2>Capturas comentadas</h2>${al.shots.map(s=>`<figure><div class="fig"><img src="${esc(s.src)}">${rvSvgAnot(s.anot)}</div><figcaption>${esc(s.cap||'')}</figcaption></figure>`).join('')}`:''}</section>`};
  w.document.write(`<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>Relatórios · ${esc(av.titulo)}</title><style>body{font:12px/1.45 system-ui,sans-serif;color:#111;margin:14mm}h1{font-size:18px;margin:0}h2{font-size:13px;margin:14px 0 4px;display:flex;justify-content:space-between;border-bottom:2px solid #1f7a5a;padding-bottom:2px}.sub{color:#444;margin:2px 0}.tot{font-size:15px;padding:8px 10px;background:#ecfdf5;margin:8px 0}table{width:100%;border-collapse:collapse}td{border-bottom:1px solid #e5e7eb;padding:5px 4px;vertical-align:top}td.p{width:80px;text-align:right;font-weight:700}td.n{width:90px;color:#555}.cm{color:#1f7a5a;font-size:11px;margin-top:2px}.pg{page-break-after:always}.pg:last-child{page-break-after:auto}figure{margin:8px 0;break-inside:avoid}.fig{position:relative;display:inline-block;max-width:100%}.fig img{max-width:100%;max-height:300px;display:block}.rvanot{position:absolute;inset:0;width:100%;height:100%}.rvatxt{position:absolute;color:#fff;font-size:10px;padding:1px 4px;border-radius:3px;transform:translate(-50%,-50%)}figcaption{font-size:11px;color:#555}</style></head><body>${L.map(pg).join('')}</body></html>`);w.document.close();setTimeout(()=>{try{w.print()}catch(_){}},600)}
/* ---------- página do aluno (sessões cifradas, como o Spruce Exam) ---------- */
async function rvChaves(code){const te=new TextEncoder();const id=aaHex(await crypto.subtle.digest('SHA-256',te.encode('es-rv-id:'+code))).slice(0,40);
  const base=await crypto.subtle.importKey('raw',te.encode(code),'PBKDF2',false,['deriveKey']);
  const k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:te.encode('es-rv-k:'+id),iterations:150000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);return {id,k}}
const rvUrl=c=>location.origin+location.pathname.replace(/[^/]*$/,'')+'review.html#'+c;
function rvDadosAluno(av,E,al,modo){const fb=modo!=='auto';const T=rvTot(al,E);let tam=0;const shots=fb?(al.shots||[]).filter(s=>{tam+=(s.src||'').length;return tam<2600000}).map(s=>({src:s.src,cap:s.cap||'',crit:s.crit||'',anot:s.anot||[]})):[];
  if(fb&&rvCfg().capturas&&al.an)E.crit.forEach(c=>{const d=c.auto&&al.an.det[c.auto];if(!d||!d.onde||!d.onde[0]||d.e==='falta'||shots.some(x=>x.crit===c.id))return;shots.push({src:rvShot(d.onde[0].u,1280,900),cap:'A tua página «'+d.onde[0].t+'»',crit:c.id,anot:[]})});
  const aud={};if(fb)Object.keys(al.audio||{}).forEach(k=>{if(tam+al.audio[k].length<3500000){aud[k]=al.audio[k];tam+=al.audio[k].length}});
  return {v:1,t:av.titulo,en:E.titulo,nm:aaCurto(al.nome),url:al.url||'',prof:S.cfg.professor||'',modo,mx:rvMax(E),doms:E.doms,
    crit:E.crit.map(c=>({id:c.id,dom:c.dom,n:c.n,pts:+c.pts||0,desc:c.desc||'',ref:c.ref?(E.curso||'agro')+'/'+c.ref:''})),cur:(rvCurso(E.curso)||{}).n||'',
    fb:fb?{pts:al.pts||{},com:al.com||{},g:al.comG||'',tot:T.t,val:rvVal(T.t,E),shots,aud}:null,aa:modo!=='fb'}}
async function rvPortalAbrir(av,E,al,modo,dias){if(al.portal){try{await rvPortalFechar(al)}catch(_){}}const code=aaCodigo(10);const {id,k}=await rvChaves(code);
  const expira=new Date(Date.now()+Math.min(60,dias||14)*864e5).toISOString();const sb=await aaSb();const r=await sb.from('eduspruce_autoav').insert({id,dados:await aaCifrar(rvDadosAluno(av,E,al,modo),k),expira});
  if(r.error)throw new Error(aaErro(r.error));al.portal={code,modo,expira:Date.parse(expira),criado:Date.now()};rvLog(al,'Página do aluno publicada ('+({fb:'feedback',auto:'autoavaliação',ambos:'feedback + autoavaliação'}[modo])+')');save();return al.portal}
async function rvPortalFechar(al){if(!al.portal)return;try{await rvPortalImportar(al)}catch(_){}const {id}=await rvChaves(al.portal.code);const sb=await aaSb();await sb.from('eduspruce_autoav').delete().eq('id',id);rvLog(al,'Página do aluno retirada');al.portal=null;save()}
async function rvPortalImportar(al){if(!al.portal)return 0;const {id,k}=await rvChaves(al.portal.code);const sb=await aaSb();const r=await sb.from('eduspruce_autoav_resp').select('id,conteudo').eq('sessao',id).order('id');if(r.error)throw new Error(aaErro(r.error));
  const L=r.data||[];if(!L.length)return 0;const x=L[L.length-1];if(al.autoav&&al.autoav.rid===x.id)return 0;const o=await aaDecifrar(x.conteudo,k);if(!o||typeof o!=='object')return 0;
  const pts={};Object.keys(o.pts||{}).forEach(c=>{if(esIdOk(c))pts[c]=esNumOk(o.pts[c])});al.autoav={rid:x.id,t:Date.now(),pts,refl:esTxtOk(o.refl,2000),com:esTxtOk(o.com,2000)};rvLog(al,'Autoavaliação recebida');save();return 1}
async function rvPortalVerTodos(){if(!window.__esPronto||!S.rv)return;for(const av of RV().av)for(const al of av.al){if(!al.portal)continue;try{if(await rvPortalImportar(al))toast('Autoavaliação recebida · '+aaCurto(al.nome),'ok');if(Date.now()>al.portal.expira)await rvPortalFechar(al)}catch(e){console.warn('[EduSpruce] review:',e.message)}}}
setTimeout(function rvCiclo(){rvPortalVerTodos().finally(()=>setTimeout(rvCiclo,120000))},25000);
function rvPortalTodosDlg(av,E){openDrawer('Página de cada aluno',`<div class="ed"><p class="hint" style="margin-top:0">Cada aluno recebe uma ligação privada (só vê o seu trabalho). Tudo vai cifrado: a base de dados não vê nomes nem notas.</p>
  <label>O que mostrar</label><select id="rvpt-m"><option value="auto">Só autoavaliação (antes da correção)</option><option value="ambos" selected>Feedback + autoavaliação</option><option value="fb">Só feedback</option></select>
  <label>Disponível durante</label><select id="rvpt-d"><option value="7">7 dias</option><option value="14" selected>14 dias</option><option value="30">30 dias</option><option value="60">60 dias</option></select>
  <button class="btn pri" id="rvpt-ok" style="margin-top:10px">${ic('send',14)} Publicar para todos</button><div id="rvpt-l" style="margin-top:12px"></div></div>`);
  $('#rvpt-ok').onclick=async e=>{const b=e.currentTarget;b.disabled=true;const out=[];for(const al of av.al){try{const p=await rvPortalAbrir(av,E,al,$('#rvpt-m').value,+$('#rvpt-d').value);out.push([al,p])}catch(er){toast(er.message,'erro');break}}
    $('#rvpt-l').innerHTML=out.map(([al,p])=>`<div class="rvlink"><b>${esc(al.nome)}</b> <code>${esc(rvUrl(p.code))}</code> <button class="btn" data-rvcp="${esc(rvUrl(p.code))}">${ic('copy',13)}</button></div>`).join('')+`<button class="btn" id="rvpt-pr" style="margin-top:8px">${ic('printer',14)} Imprimir folha com QR codes</button>`;
    $$('#dw-b [data-rvcp]').forEach(x=>x.onclick=()=>{navigator.clipboard.writeText(x.dataset.rvcp);toast('Ligação copiada','ok')});
    $('#rvpt-pr').onclick=async()=>{await aaQrLib();const w=open('','_blank');if(!w)return;w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Ligações · ${esc(av.titulo)}</title><style>body{font:13px system-ui;margin:12mm}.c{display:inline-block;width:46%;margin:1%;border:1px dashed #999;padding:10px;vertical-align:top;break-inside:avoid}.c svg{width:120px;height:120px;float:right}code{font-size:10px;word-break:break-all}</style></head><body>${out.map(([al,p])=>`<div class="c">${aaQR(rvUrl(p.code))}<b>${esc(al.nome)}</b><br>${esc(av.titulo)}<br><code>${esc(rvUrl(p.code))}</code></div>`).join('')}</body></html>`);w.document.close();setTimeout(()=>w.print(),500)};
    b.disabled=false;rvAv(av);rvPortalTodosDlg.ult=out}}
/* ---------- ficha do aluno: correção ---------- */
function rvAluno(av,al){const E=rvEn(av.enun);const tab=UI.rvAlTab||'cor';const T=rvTot(al,E);const i=av.al.indexOf(al);const ant=av.al[i-1],seg=av.al[i+1];
  $('#view').innerHTML=rvShell('av',`<div class="rvhd"><button class="btn" id="rv-va">${ic('back',15)} ${esc(av.titulo)}</button><h2>${esc(al.nome||'Aluno')}</h2>${al.url?`<a class="btn" href="${esc(rvBase(al.url))}" target="_blank" rel="noopener">${ic('globo',14)} Abrir o site</a>`:''}<span class="rvsp"></span>
   <button class="btn" id="rv-ant" ${ant?'':'disabled'}>‹</button><button class="btn" id="rv-seg" ${seg?'':'disabled'}>›</button><div class="rvtotal"><b>${nf(rvVal(T.t,E))}</b><span>valores · ${nf(T.t)}/${rvMax(E)} pts${T.c?'':' · faltam '+(E.crit.length-T.n)}</span></div></div>
   <div class="seg rvtabs">${[['cor','pencil','Correção'],['cap','camera','Capturas'],['ana','search','Análise'],['aa','users','Autoavaliação'],['dup','checks','Dupla correção'],['ver','layers','Versões'],['his','clock','Histórico'],['par','send','Partilhar']].map(([k,i,l])=>`<button type="button" data-rvalt="${k}" class="${tab===k?'on':''}">${ic(i,14)} ${l}</button>`).join('')}</div><div id="rv-alm"></div>`);
  rvBindNav();$('#rv-va').onclick=()=>{UI.rvEd={k:'av',id:av.id};vReview()};
  if(ant)$('#rv-ant').onclick=()=>{UI.rvEd={k:'al',av:av.id,id:ant.id};vReview()};if(seg)$('#rv-seg').onclick=()=>{UI.rvEd={k:'al',av:av.id,id:seg.id};vReview()};
  $$('#view [data-rvalt]').forEach(b=>b.onclick=()=>{UI.rvAlTab=b.dataset.rvalt;rvAluno(av,al)});
  ({cor:rvAlCorrecao,cap:rvAlCapturas,ana:rvAlAnalise,aa:rvAlAuto,dup:rvAlDupla,ver:rvAlVersoes,his:rvAlHist,par:rvAlPartilhar}[tab]||rvAlCorrecao)($('#rv-alm'),av,E,al)}
function rvAlCorrecao(m,av,E,al){const an=al.an;al.com=al.com||{};al.audio=al.audio||{};
  m.innerHTML=`${!an?`<div class="alert">${ic('info',15)} Ainda sem análise automática. ${al.url?`<button class="btn pri" id="rv-an1">${ic('search',14)} Analisar o site</button>`:'Indique o endereço do site na lista de alunos.'}</div>`:(()=>{const r=rvPorRever(al,E);al.visto=al.visto||{};return `<div class="rvbar rvauto">${r?`<span class="rvb pa">${r} critério(s) por rever</span>`:'<span class="rvb ok">✓ Tudo revisto</span>'}<label class="chk"><input type="checkbox" id="rv-so" ${UI.rvSoRever?'checked':''}> Mostrar só o que falta rever</label><span class="rvsp"></span>${r?`<button class="btn pri" id="rv-tv">${ic('checks',14)} Dar tudo como revisto</button>`:''}<button class="btn" id="rv-sug1">${ic('sparkle',14)} Refazer a correção automática</button></div>`})()}
   ${E.doms.map((d,di)=>{const C=E.crit.filter(c=>c.dom===di);if(!C.length)return '';const s=C.reduce((x,c)=>x+(+al.pts[c.id]||0),0),sm=C.reduce((x,c)=>x+(+c.pts||0),0);
     return `<section class="rvpanel"><h3>${esc(d)} <span class="rvsp"></span><span class="mut">${nf(s)} / ${sm}</span></h3>${C.map(c=>{const v=al.pts[c.id];const nv=rvNivel(v,c.pts);const det=an&&c.auto&&an.det[c.auto];const sg=al.sug&&al.sug[c.id];const cf=(al.conf||{})[c.id];const au=(al.auto||{})[c.id];
       const rever=!(al.visto||{})[c.id]&&(v==null||v===''||(au&&cf!=='alta'));if(UI.rvSoRever&&!rever)return '';
       return `<div class="rvcrit${rever?' rvrever':''}" id="rvc-${c.id}"><div class="rvci">${c.ref?`<button type="button" class="rvthumb" data-rvlado="${c.id}" title="Ver o exemplo correto lado a lado"><img src="${rvRef(E,c.ref)}" alt="Exemplo correto: ${esc(c.n)}" loading="lazy"></button>`:''}
         <div class="rvct"><b>${esc(c.n)}</b> <span class="mut">(${nf(c.pts)} pts)</span><div class="mut rvdesc">${esc(c.desc||'')}</div>${det?`<div class="rvdet">${rvEst(det.e)} ${esc(det.nota||'')}${det.onde&&det.onde.length?' · '+det.onde.map(o=>`<a href="${esc(o.u)}" target="_blank" rel="noopener">${esc(o.t)}</a>`).join(', '):''}${sg!=null?` · <span class="mut">sugestão: ${nf(sg)}</span>`:''}</div>`:''}${au?`<div class="rvdet"><span class="rvb ${cf==='alta'?'ok':cf==='media'?'pa':'ma'}">automático · ${rvConfTxt[cf]||''}</span>${rever?` <button type="button" class="btn rvvis" data-rvvis="${c.id}">${ic('check',13)} Revisto</button>`:''}</div>`:rever&&v!=null&&v!==''?`<div class="rvdet"><button type="button" class="btn rvvis" data-rvvis="${c.id}">${ic('check',13)} Revisto</button></div>`:''}</div></div>
         <div class="rvniv">${RV_NIV.map(([n,l,f])=>`<button type="button" data-rvn="${c.id}|${f}" class="${nv===n?'on':''}" title="${l} = ${nf((+c.pts||0)*f)} pts">${l}</button>`).join('')}<input type="number" class="rvpts" data-rvp="${c.id}" min="0" max="${c.pts}" step="0.5" value="${v==null?'':v}" aria-label="Pontos em ${esc(c.n)}"></div>
         <div class="rvcom"><textarea data-rvcm="${c.id}" rows="1" placeholder="Comentário para o aluno…">${esc(al.com[c.id]||'')}</textarea><button class="btn" data-rvbk="${c.id}" title="Banco de comentários">${ic('chat',14)}</button><button class="btn" data-rvsv="${c.id}" title="Guardar este comentário no banco">${ic('plus',14)}</button>
         <button class="btn${al.audio[c.id]?' on':''}" data-rvau="${c.id}" title="Comentário em áudio">${ic('mic',14)}</button></div>${al.audio[c.id]?`<div class="rvaud"><audio controls src="${esc(al.audio[c.id])}"></audio><button class="btn" data-rvaud="${c.id}">${ic('trash',13)}</button></div>`:''}</div>`}).join('')}</section>`}).join('')}
   <section class="rvpanel"><h3>Apreciação geral <span class="rvsp"></span>${al.comGAuto&&al.comG?'<span class="rvb ma">automática</span>':''}${an?`<button class="btn" id="rv-gn">${ic('refresh',14)} Escrever outra</button>`:''}</h3><textarea id="rv-g" rows="4" placeholder="Comentário geral para o aluno…">${esc(al.comG||'')}</textarea><div class="rvbar"><button class="btn${al.audio._g?' on':''}" data-rvau="_g">${ic('mic',14)} Áudio geral</button>${al.audio._g?`<audio controls src="${esc(al.audio._g)}"></audio><button class="btn" data-rvaud="_g">${ic('trash',13)}</button>`:''}</div></section>`;
  const set=(cid,v)=>{const c=E.crit.find(x=>x.id===cid);const old=al.pts[cid];v=v===''||v==null?null:Math.max(0,Math.min(+c.pts||0,Math.round((+v||0)*2)/2));if(v==null)delete al.pts[cid];else al.pts[cid]=v;if(al.auto)delete al.auto[cid];(al.visto=al.visto||{})[cid]=true;if(al.comGAuto&&al.an)al.comG=rvComGeral(E,al,al.an,av);if(old!==v)rvLog(al,c.n+': '+(old==null?'—':old)+' → '+(v==null?'—':v));save()};
  m.querySelectorAll('[data-rvn]').forEach(b=>b.onclick=()=>{const [cid,f]=b.dataset.rvn.split('|');const c=E.crit.find(x=>x.id===cid);set(cid,(+c.pts||0)*f);rvAluno(av,al);requestAnimationFrame(()=>{const el=$('#rvc-'+cid);if(el)el.scrollIntoView({block:'nearest'})})});
  m.querySelectorAll('[data-rvp]').forEach(i=>i.onchange=()=>{set(i.dataset.rvp,i.value);setTimeout(()=>rvAluno(av,al))});
  m.querySelectorAll('[data-rvvis]').forEach(b=>b.onclick=()=>{(al.visto=al.visto||{})[b.dataset.rvvis]=true;rvLog(al,'Revisto: '+(E.crit.find(c=>c.id===b.dataset.rvvis)||{}).n);save();rvAluno(av,al)});
  const so=$('#rv-so');if(so)so.onchange=()=>{UI.rvSoRever=so.checked;rvAluno(av,al)};
  const tv=$('#rv-tv');if(tv)tv.onclick=()=>{al.visto=al.visto||{};E.crit.forEach(c=>{if(al.pts[c.id]!=null&&al.pts[c.id]!=='')al.visto[c.id]=true});rvLog(al,'Correção dada como revista');save();rvAluno(av,al)};
  m.querySelectorAll('[data-rvcm]').forEach(t=>t.onchange=()=>{if(al.comAuto)delete al.comAuto[t.dataset.rvcm];al.com[t.dataset.rvcm]=t.value.trim().slice(0,2000);if(!al.com[t.dataset.rvcm])delete al.com[t.dataset.rvcm];save()});
  m.querySelectorAll('[data-rvlado]').forEach(b=>b.onclick=()=>rvLadoALado(E.crit.find(c=>c.id===b.dataset.rvlado),al,E));
  m.querySelectorAll('[data-rvbk]').forEach(b=>b.onclick=()=>rvBancoDlg(b.dataset.rvbk,txt=>{const t=m.querySelector(`[data-rvcm="${b.dataset.rvbk}"]`);t.value=(t.value?t.value+' ':'')+txt;t.onchange()}));
  m.querySelectorAll('[data-rvsv]').forEach(b=>b.onclick=()=>{const t=m.querySelector(`[data-rvcm="${b.dataset.rvsv}"]`).value.trim();if(!t)return toast('Escreva primeiro o comentário','erro');if(!RV().com.some(x=>x.txt===t))RV().com.push({id:uid(),crit:b.dataset.rvsv,txt:t,n:0});save();toast('Guardado no banco de comentários','ok')});
  m.querySelectorAll('[data-rvau]').forEach(b=>b.onclick=()=>rvGravar(b,d=>{al.audio[b.dataset.rvau]=d;rvLog(al,'Comentário em áudio gravado');save();rvAluno(av,al)}));
  m.querySelectorAll('[data-rvaud]').forEach(b=>b.onclick=()=>{delete al.audio[b.dataset.rvaud];save();rvAluno(av,al)});
  $('#rv-g').onchange=e=>{al.comG=e.target.value.trim().slice(0,4000);al.comGAuto=false;save()};
  const gn=$('#rv-gn');if(gn)gn.onclick=()=>{if(al.comG&&!al.comGAuto&&!confirm('Substituir a apreciação que escreveu por uma automática?'))return;al.comGSeed=(al.comGSeed||0)+1;al.comG=rvComGeral(E,al,al.an,av);al.comGAuto=true;rvLog(al,'Apreciação geral reescrita');save();rvAluno(av,al)};
  const a1=$('#rv-an1');if(a1)a1.onclick=async()=>{a1.disabled=true;a1.textContent='A analisar…';try{await rvAnalisar(av,al);toast('Análise feita','ok')}catch(e){toast(e.message,'erro')}rvAluno(av,al)};
  const s1=$('#rv-sug1');if(s1)s1.onclick=()=>{const n=rvAplicarAuto(av,al,true);save();toast(n?n+' critério(s) atualizados (o que mudou à mão fica igual)':'Nada a mudar','ok');rvAluno(av,al)}}
function rvBancoDlg(cid,usar){const L=RV().com;let q='';
  openDrawer('Banco de comentários',`<div class="ed"><input type="search" id="rvb-q" placeholder="Pesquisar comentários…"><label class="chk"><input type="checkbox" id="rvb-so" checked> Só deste critério e gerais</label><div id="rvb-l"></div></div>`);
  const pinta=()=>{const so=$('#rvb-so').checked;const X=L.filter(x=>(!so||!x.crit||x.crit===cid)&&(!q||normT(x.txt).includes(normT(q)))).sort((a,b)=>(b.n||0)-(a.n||0));
    $('#rvb-l').innerHTML=X.length?X.map(x=>`<button type="button" class="rvbk" data-rvbu="${x.id}">${esc(x.txt)}${x.n?` <span class="mut">· ${x.n}×</span>`:''}</button>`).join(''):'<p class="mut">Nada encontrado.</p>';
    $$('#dw-b [data-rvbu]').forEach(b=>b.onclick=()=>{const x=L.find(z=>z.id===b.dataset.rvbu);x.n=(x.n||0)+1;save();closeDrawer();usar(x.txt)})};
  $('#rvb-q').oninput=e=>{q=e.target.value;pinta()};$('#rvb-so').onchange=pinta;pinta()}
/* capturas: automáticas (3 tamanhos e página de cada bloco) + carregadas/coladas, com anotações */
function rvAlCapturas(m,av,E,al){al.shots=al.shots||[];const base=rvBase(al.url);const r=al.shotR||'';const onde=[];if(al.an)E.crit.forEach(c=>{const d=c.auto&&al.an.det[c.auto];if(d&&d.onde&&d.onde[0]&&!onde.some(o=>o.u===d.onde[0].u))onde.push({u:d.onde[0].u,t:d.onde[0].t,c:c.n})});
  m.innerHTML=`<section class="rvpanel"><h3>Capturas automáticas ${base?`<span class="rvsp"></span><button class="btn" id="rv-sr">${ic('refresh',14)} Atualizar</button>`:''}</h3>${base?`<p class="hint" style="margin-top:0">Geradas por um serviço externo de capturas; a primeira vez podem demorar uns segundos (carregue em Atualizar).</p>
     <div class="rvdisp">${[['Computador',1280,800],['Tablet',820,1100],['Telemóvel',390,820]].map(([n,w,h])=>`<figure class="rvdv rvdv${w}"><figcaption>${n} (${w} px)</figcaption><button type="button" class="rvzoom" data-rvz="${esc(rvShot(base+'/',w,h)+r)}"><img src="${esc(rvShot(base+'/',w,h)+r)}" alt="Captura em ${n}" loading="lazy"></button><button class="btn" data-rvsav="${esc(rvShot(base+'/',w,h))}|${n}">${ic('pen',13)} Anotar</button></figure>`).join('')}</div>
     ${onde.length?`<h3 style="margin-top:16px">Páginas onde a análise encontrou os blocos</h3><div class="rvgal">${onde.map(o=>`<figure><figcaption><b>${esc(o.c)}</b> · <a href="${esc(o.u)}" target="_blank" rel="noopener">${esc(o.t)}</a></figcaption><button type="button" class="rvzoom" data-rvz="${esc(rvShot(o.u,1280,900)+r)}"><img src="${esc(rvShot(o.u,1280,900)+r)}" alt="" loading="lazy"></button></figure>`).join('')}</div>`:''}`:'<p class="mut">Sem endereço.</p>'}</section>
   <section class="rvpanel"><h3>Capturas do professor (evidências) <span class="rvsp"></span><label class="btn">${ic('upload',14)} Carregar<input type="file" id="rv-up" accept="image/*" multiple hidden></label></h3><p class="hint" style="margin-top:0">Também pode colar uma imagem (Ctrl+V) nesta página — por exemplo, uma captura do painel do aluno. Associe cada captura a um critério para aparecer lado a lado com o exemplo correto.</p>
   <div class="rvgal">${al.shots.map(s=>`<figure><div class="rvfig"><img src="${esc(s.src)}" alt="">${rvSvgAnot(s.anot)}</div><figcaption>${esc(s.cap||'')}</figcaption><select data-rvsc="${s.id}"><option value="">— Critério —</option>${E.crit.map(c=>`<option value="${c.id}" ${s.crit===c.id?'selected':''}>${esc(c.n)}</option>`).join('')}</select>
     <div class="rvbar"><button class="btn" data-rvsa="${s.id}">${ic('pen',13)} Anotar</button><button class="btn" data-rvsx="${s.id}">${ic('trash',13)}</button></div></figure>`).join('')||'<p class="mut">Ainda sem capturas.</p>'}</div></section>`;
  const add=async f=>{try{const d=await rvImgFicheiro(f);al.shots.push({id:uid(),src:d,cap:'',crit:'',anot:[]});rvLog(al,'Captura acrescentada');save();rvAluno(av,al)}catch(e){toast(e.message,'erro')}};
  $('#rv-up').onchange=async e=>{for(const f of e.target.files)await add(f)};
  if(rvAlCapturas._p)document.removeEventListener('paste',rvAlCapturas._p);rvAlCapturas._p=e=>{if(VIEW!=='review'||UI.rvAlTab!=='cap'||!$('#rv-up'))return;const it=[...(e.clipboardData||{}).items||[]].find(x=>/^image\//.test(x.type));if(it){e.preventDefault();add(it.getAsFile())}};document.addEventListener('paste',rvAlCapturas._p);
  const sr=$('#rv-sr');if(sr)sr.onclick=()=>{al.shotR='&r='+Date.now().toString(36);save();rvAluno(av,al)};
  m.querySelectorAll('[data-rvz]').forEach(b=>b.onclick=()=>rvLupa(`<img src="${esc(b.dataset.rvz)}" alt="" style="max-width:100%">`));
  m.querySelectorAll('[data-rvsav]').forEach(b=>b.onclick=()=>{const [u,n]=b.dataset.rvsav.split('|');const s={id:uid(),src:u,cap:'Captura automática · '+n,crit:'',anot:[]};al.shots.push(s);save();rvAnotarDlg(s,()=>rvAluno(av,al))});
  m.querySelectorAll('[data-rvsc]').forEach(x=>x.onchange=()=>{al.shots.find(s=>s.id===x.dataset.rvsc).crit=x.value;save()});
  m.querySelectorAll('[data-rvsa]').forEach(b=>b.onclick=()=>rvAnotarDlg(al.shots.find(s=>s.id===b.dataset.rvsa),()=>rvAluno(av,al)));
  m.querySelectorAll('[data-rvsx]').forEach(b=>b.onclick=()=>{if(!confirm('Apagar esta captura?'))return;al.shots=al.shots.filter(s=>s.id!==b.dataset.rvsx);save();rvAluno(av,al)})}
/* análise detalhada */
function rvAlAnalise(m,av,E,al){const an=al.an;
  m.innerHTML=`<div class="rvbar">${al.url?`<button class="btn pri" id="rv-an2">${ic('search',14)} ${an?'Analisar de novo':'Analisar o site'}</button>`:''}<button class="btn" id="rv-col">${ic('paste',14)} Colar dados</button>${an?`<span class="mut">Última análise: ${new Date(an.t).toLocaleString('pt-PT')}</span>`:''}</div>
   ${!an?'<div class="rvvazio"><p>Sem análise.</p></div>':`
   ${al.difAn&&al.difAn.length?`<div class="alert">${ic('refresh',15)} Mudou desde a análise anterior: ${al.difAn.map(esc).join(' · ')}</div>`:''}
   <div class="rvkpis"><div><b>${an.pags.length}</b><span>Páginas (${an.pags.filter(p=>!p.vazia).length} com conteúdo)</span></div><div><b>${an.plugins.length}</b><span>Extensões visíveis</span></div><div><b>${an.perf.psi!=null?an.perf.psi:'…'}</b><span>Desempenho (0–100, telemóvel)</span></div><div><b>${an.links.mal.length}</b><span>Ligações com problemas</span></div></div>
   <div class="rvcols2"><section class="rvpanel"><h3>${ic('info',16)} Site</h3><p><b>Título:</b> ${esc(an.nome||'—')}<br><b>Descrição:</b> ${esc(an.desc||'—')}<br><b>Artigos:</b> ${an.nPosts}<br><b>Extensões:</b> ${esc(an.plugins.join(', ')||'—')}</p>
     <h3>${ic('target',16)} Tema do conteúdo</h3>${an.tema?an.tema.todos.map(t=>`<div class="rvpc"><span>${esc(t.n)}</span><span class="rvmeter"><i style="width:${Math.min(100,t.h*2)}%;background:${t.n===an.tema.best&&t.h>=8?'#16a34a':'#94a3b8'}"></i></span><b>${t.h}</b></div>${t.vis.length?`<p class="hint" style="margin:0 0 6px">${t.vis.map(esc).join(', ')}</p>`:''}`).join(''):''}</section>
   <section class="rvpanel"><h3>${ic('access',16)} Acessibilidade</h3>${an.a11y.map(x=>`<p>${rvEst(x.e)} ${esc(x.t)}</p>`).join('')}
     <h3>${ic('clock',16)} Desempenho</h3><p>Resposta do site: <b>${an.perf.ms} ms</b> · ${an.perf.imgs} imagens · ${an.perf.ifr} incorporações · ${an.perf.pl} extensões${an.perf.pl>12?' <span class="rvb pa">muitas extensões</span>':''}${an.perf.psi!=null?` · pontuação <b>${an.perf.psi}</b>/100`:''}</p></section></div>
   <section class="rvpanel"><h3>${ic('check',16)} Elementos e critérios</h3><table class="rvt">${E.crit.filter(c=>c.auto).map(c=>{const d=an.det[c.auto];return d?`<tr><td>${esc(c.n)}</td><td>${rvEst(d.e)}</td><td>${esc(d.nota||'')}</td></tr>`:''}).join('')}</table></section>
   <div class="rvcols2"><section class="rvpanel"><h3>${ic('file',16)} Páginas</h3><table class="rvt">${an.pags.map(p=>`<tr><td><a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.t)}</a>${p.pai?' <span class="mut">(filha)</span>':''}</td><td>${p.vazia?'<span class="rvb no">vazia</span>':p.pal+' palavras'}</td></tr>`).join('')}</table></section>
   <section class="rvpanel"><h3>${ic('alert',16)} Conteúdo de modelo, inglês e repetido</h3>${an.plac.length?an.plac.map(x=>`<p>${rvEst('falta')} <a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.t)}</a>: «${esc(x.m)}»</p>`).join(''):'<p>'+rvEst('ok')+' Nada encontrado.</p>'}
     ${an.dup.length?`<h3>Texto repetido em várias publicações</h3>${an.dup.map(d=>`<p class="hint">«${esc(d.s)}…» — ${d.em.map(esc).join(', ')}</p>`).join('')}`:''}
     <h3>${ic('flow',16)} Ligações (${an.links.ver} verificadas, ${an.links.bt||0} em botões)</h3>${an.links.mal.length?an.links.mal.map(l=>`<p>${rvEst('falta')} ${l.bt?'<b>[botão]</b> ':''}«${esc(l.txt||l.u)}» em ${esc(l.em)} — ${esc(l.m)}<br><code>${esc(l.u)}</code></p>`).join(''):'<p>'+rvEst('ok')+' Todas as ligações abriram.</p>'}</section></div>`}`;
  const b=$('#rv-an2');if(b)b.onclick=async()=>{b.disabled=true;b.textContent='A analisar…';try{await rvAnalisar(av,al);toast('Análise feita','ok')}catch(e){toast(e.message,'erro')}rvAluno(av,al)};$('#rv-col').onclick=()=>rvColarDlg(av,al)}
function rvAlAuto(m,av,E,al){const a=al.autoav;const P=a?a.pts:{};
  m.innerHTML=`<div class="rvbar">${al.portal?`<button class="btn" id="rv-aai">${ic('refresh',14)} Ver se já respondeu</button>`:`<span class="mut">Publique a página do aluno (separador Partilhar) em modo «autoavaliação» para o aluno se avaliar.</span>`}</div>
   ${a?`<section class="rvpanel"><h3>Professor vs. aluno <span class="rvsp"></span><span class="mut">recebida em ${new Date(a.t).toLocaleString('pt-PT')}</span></h3><table class="rvt"><tr><th>Critério</th><th>Aluno</th><th>Professor</th><th>Diferença</th></tr>${E.crit.map(c=>{const x=P[c.id],y=al.pts[c.id];const d=x!=null&&y!=null?x-y:null;
     return `<tr><td>${esc(c.n)}</td><td>${x==null?'—':nf(x)}</td><td>${y==null?'—':nf(y)}</td><td>${d==null?'':`<span class="rvb ${Math.abs(d)<(+c.pts||1)*.25?'ok':d>0?'pa':'no'}">${d>0?'+':''}${nf(d)}</span>`}</td></tr>`}).join('')}
     <tr><th>Nota</th><th>${nf(rvVal(rvTot({pts:P},E).t,E))}</th><th>${nf(rvVal(rvTot(al,E).t,E))}</th><th></th></tr></table>${a.refl?`<h3>Reflexão do aluno</h3><p>${esc(a.refl)}</p>`:''}${a.com?`<h3>O que o aluno quer melhorar</h3><p>${esc(a.com)}</p>`:''}</section>`:'<div class="rvvazio"><p>Ainda sem autoavaliação.</p></div>'}`;
  const b=$('#rv-aai');if(b)b.onclick=async()=>{try{const n=await rvPortalImportar(al);toast(n?'Autoavaliação recebida':'Ainda sem resposta',n?'ok':'aviso');rvAluno(av,al)}catch(e){toast(e.message,'erro')}}}
function rvAlDupla(m,av,E,al){al.pts2=al.pts2||{};
  m.innerHTML=`<p class="hint">Pontos do segundo corretor${av.cor2?' ('+esc(av.cor2)+')':''}. As diferenças a partir de ${av.lim2||25}% do critério ficam assinaladas.</p><table class="rvt"><tr><th>Critério</th><th>Corretor 1</th><th>Corretor 2</th><th></th></tr>${E.crit.map(c=>{const a=al.pts[c.id],b=al.pts2[c.id];const dv=a!=null&&b!=null&&Math.abs(a-b)/(+c.pts||1)*100>=(av.lim2||25);
    return `<tr class="${dv?'rvdiv':''}"><td>${esc(c.n)} <span class="mut">(${nf(c.pts)})</span></td><td>${a==null?'—':nf(a)}</td><td><input type="number" class="rvpts" data-rv2="${c.id}" min="0" max="${c.pts}" step="0.5" value="${b==null?'':b}"></td><td>${dv?'<span class="rvb no">divergência</span>':''}</td></tr>`}).join('')}
    <tr><th>Nota</th><th>${nf(rvVal(rvTot(al,E).t,E))}</th><th>${nf(rvVal(rvTot(al,E,'pts2').t,E))}</th><th></th></tr></table>`;
  m.querySelectorAll('[data-rv2]').forEach(i=>i.onchange=()=>{const c=E.crit.find(x=>x.id===i.dataset.rv2);if(i.value==='')delete al.pts2[c.id];else al.pts2[c.id]=Math.max(0,Math.min(+c.pts||0,+i.value||0));rvLog(al,'Segundo corretor · '+c.n+': '+(i.value||'—'));save();setTimeout(()=>rvAluno(av,al))})}
function rvAlVersoes(m,av,E,al){al.vers=al.vers||[];
  m.innerHTML=`<div class="rvbar"><button class="btn pri" id="rv-vs">${ic('layers',14)} Guardar versão atual</button><span class="mut">Use antes de o aluno corrigir o site (reavaliação/recurso). Depois analise de novo e compare.</span></div>
   ${al.vers.length?al.vers.map((v,k)=>{const dif=E.crit.filter(c=>(v.pts[c.id]??null)!==(al.pts[c.id]??null));return `<section class="rvpanel"><h3>${esc(v.n)} · ${new Date(v.t).toLocaleString('pt-PT')} <span class="rvsp"></span><b>${nf(rvVal(v.tot,E))} → ${nf(rvVal(rvTot(al,E).t,E))} valores</b></h3>
     ${dif.length?`<table class="rvt"><tr><th>Critério</th><th>Antes</th><th>Agora</th><th>Análise antes → agora</th></tr>${dif.map(c=>`<tr><td>${esc(c.n)}</td><td>${v.pts[c.id]==null?'—':nf(v.pts[c.id])}</td><td>${al.pts[c.id]==null?'—':nf(al.pts[c.id])}</td><td>${v.det&&v.det[c.id]?esc(v.det[c.id]):'—'} → ${al.an&&c.auto&&al.an.det[c.auto]?esc(al.an.det[c.auto].e):'—'}</td></tr>`).join('')}</table>`:'<p class="mut">Sem diferenças nos pontos.</p>'}
     <div class="rvbar"><button class="btn" data-rvvr="${k}">${ic('back',13)} Repor estes pontos</button><button class="btn" data-rvvx="${k}">${ic('trash',13)}</button></div></section>`}).join(''):'<div class="rvvazio"><p>Sem versões guardadas.</p></div>'}`;
  $('#rv-vs').onclick=()=>{const det={};if(al.an)E.crit.forEach(c=>{const d=c.auto&&al.an.det[c.auto];if(d)det[c.id]=d.e});al.vers.unshift({t:Date.now(),n:'Versão '+(al.vers.length+1),pts:{...al.pts},tot:rvTot(al,E).t,det});rvLog(al,'Versão guardada');save();rvAluno(av,al)};
  m.querySelectorAll('[data-rvvr]').forEach(b=>b.onclick=()=>{if(!confirm('Repor os pontos desta versão?'))return;al.pts={...al.vers[+b.dataset.rvvr].pts};rvLog(al,'Pontos repostos de '+al.vers[+b.dataset.rvvr].n);save();rvAluno(av,al)});
  m.querySelectorAll('[data-rvvx]').forEach(b=>b.onclick=()=>{al.vers.splice(+b.dataset.rvvx,1);save();rvAluno(av,al)})}
function rvAlHist(m,av,E,al){const H=al.hist||[];m.innerHTML=H.length?`<table class="rvt"><tr><th>Quando</th><th>Quem</th><th>O quê</th></tr>${H.map(h=>`<tr><td>${new Date(h.t).toLocaleString('pt-PT')}</td><td>${esc(h.q)}</td><td>${esc(h.txt)}</td></tr>`).join('')}</table>`:'<div class="rvvazio"><p>Sem registos.</p></div>'}
function rvAlPartilhar(m,av,E,al){const p=al.portal;const T=rvTot(al,E);
  m.innerHTML=`<section class="rvpanel"><h3>${ic('send',16)} Página privada do aluno</h3>${p?`<p>Publicada (${({fb:'só feedback',auto:'só autoavaliação',ambos:'feedback + autoavaliação'}[p.modo])}) até ${new Date(p.expira).toLocaleDateString('pt-PT')}.</p>
     <div class="rvlink"><code>${esc(rvUrl(p.code))}</code></div><div class="rvqr" id="rv-qr"></div>
     <div class="rvbar"><button class="btn" id="rv-cp">${ic('copy',14)} Copiar ligação</button><button class="btn" id="rv-mail">${ic('mail',14)} Enviar por e-mail</button>${navigator.share?`<button class="btn" id="rv-sh">${ic('send',14)} Partilhar…</button>`:''}<button class="btn" id="rv-up2">${ic('refresh',14)} Atualizar com a correção atual</button><button class="btn" id="rv-px">${ic('x',14)} Retirar</button></div>`
     :`<p class="hint" style="margin-top:0">O aluno abre a ligação (sem conta) e vê só o seu trabalho. Tudo vai cifrado.</p><label>O que mostrar</label><select id="rv-pm"><option value="auto">Só autoavaliação (antes da correção)</option><option value="ambos" selected>Feedback + autoavaliação</option><option value="fb">Só feedback</option></select>
     <label>Disponível durante</label><select id="rv-pd"><option value="7">7 dias</option><option value="14" selected>14 dias</option><option value="30">30 dias</option><option value="60">60 dias</option></select><button class="btn pri" id="rv-pub" style="margin-top:10px">${ic('send',14)} Publicar</button>`}</section>
   <section class="rvpanel"><h3>${ic('printer',16)} Relatório</h3><button class="btn" id="rv-rel">${ic('printer',14)} Relatório individual (imprimir / PDF)</button></section>`;
  const pub=$('#rv-pub');if(pub)pub.onclick=async()=>{pub.disabled=true;try{await rvPortalAbrir(av,E,al,$('#rv-pm').value,+$('#rv-pd').value);toast('Página publicada','ok')}catch(e){toast(e.message,'erro')}rvAluno(av,al)};
  if(p){const u=rvUrl(p.code);aaQrLib().then(()=>{const q=$('#rv-qr');if(q)q.innerHTML=aaQR(u)}).catch(()=>{});$('#rv-cp').onclick=()=>{navigator.clipboard.writeText(u);toast('Ligação copiada','ok')};
    $('#rv-mail').onclick=()=>{const s=encodeURIComponent(av.titulo+' — feedback do teu site');const b=encodeURIComponent(`Olá ${aaCurto(al.nome)},\n\nJá podes ver o feedback do teu site${p.modo!=='fb'?' e fazer a tua autoavaliação':''}:\n${u}\n\n${p.modo!=='auto'?'Nota: '+nf(rvVal(T.t,E))+' valores.\n\n':''}${S.cfg.professor||''}`);location.href='mailto:?subject='+s+'&body='+b};
    const sh=$('#rv-sh');if(sh)sh.onclick=()=>navigator.share({title:av.titulo,text:'Feedback do teu site',url:u}).catch(()=>{});
    $('#rv-up2').onclick=async()=>{try{await rvPortalAbrir(av,E,al,p.modo,Math.max(1,Math.round((p.expira-Date.now())/864e5)));toast('Atualizada (ligação nova)','ok')}catch(e){toast(e.message,'erro')}rvAluno(av,al)};
    $('#rv-px').onclick=async()=>{if(!confirm('Retirar a página do aluno? A ligação deixa de funcionar.'))return;try{await rvPortalFechar(al)}catch(e){toast(e.message,'erro')}rvAluno(av,al)}}
  $('#rv-rel').onclick=()=>rvRelatorio(av,E,[al])}
/* ---------- enunciados (editor) ---------- */
function rvListaEnun(m){const L=RV().enun;
  m.innerHTML=rvHd('clipboard','Enunciados · Módulo 03 de TIC','')+`<p class="hint" style="margin-top:0">Cada curso tem o seu enunciado. Um enunciado só fica disponível depois de incluir o texto e os critérios.</p><div class="rvgr">${RV_CURSOS.map(C=>{const X=L.filter(E=>E.curso===C.k);
    return `<div class="rvcard rvcur"><b>${ic('layers',15)} ${esc(C.n)}</b>${X.length?X.map(E=>`<div class="rvenu"><span>${esc(E.titulo)}</span><span class="mut">${E.crit.length} critérios · ${rvMax(E)} pontos · ${(E.temas||[]).length} temas</span><div class="rvbar"><button class="btn pri" data-rvee="${E.id}">${ic('pencil',14)} Editar</button><button class="btn" data-rved="${E.id}">${ic('copy',14)} Duplicar</button><button class="btn" data-rvex="${E.id}">${ic('trash',14)}</button></div></div>`).join(''):'<span class="rvb ma">Ainda não incluído</span>'}
      <button class="btn${X.length?'':' pri'}" data-rvinc="${C.k}">${ic('plus',14)} ${X.length?'Incluir outro enunciado':'Incluir enunciado e critérios'}</button></div>`}).join('')}</div>`;
  m.querySelectorAll('[data-rvinc]').forEach(b=>b.onclick=()=>rvIncluirDlg(b.dataset.rvinc));
  m.querySelectorAll('[data-rvee]').forEach(b=>b.onclick=()=>{UI.rvEd={k:'enun',id:b.dataset.rvee};vReview()});
  m.querySelectorAll('[data-rved]').forEach(b=>b.onclick=()=>{const o=JSON.parse(JSON.stringify(L.find(x=>x.id===b.dataset.rved)));o.id=uid();o.titulo+=' (cópia)';L.push(o);save();vReview()});
  m.querySelectorAll('[data-rvex]').forEach(b=>b.onclick=()=>{if(RV().av.some(a=>a.enun===b.dataset.rvex))return toast('Este enunciado está a ser usado numa avaliação.','erro');if(!confirm('Retirar este enunciado? O curso deixa de o ter disponível.'))return;L.splice(L.findIndex(x=>x.id===b.dataset.rvex),1);save();vReview()})}
function rvIncluirDlg(k){const C=rvCurso(k);const E=rvEnunCurso(k);
  openDrawer('Incluir enunciado · '+C.n,`<div class="ed"><p class="hint" style="margin-top:0">Confirme o texto do enunciado e os critérios. Só depois disto o enunciado de ${esc(C.n)} fica disponível nas avaliações.</p>
    <label>Título</label><input id="rvi2-t" value="${esc(E.titulo)}"><label>Texto do enunciado</label><textarea id="rvi2-x" rows="9">${esc(E.texto)}</textarea>
    <label>Temas</label>${E.temas.map((t,i)=>`<label class="chk"><input type="checkbox" data-rvit="${i}" checked> ${esc(t.n)}</label>`).join('')}
    <label>Critérios (${E.crit.length} · ${rvMax(E)} pontos)</label><div class="rvcritl">${E.doms.map((d,di)=>`<b>${esc(d)}</b> — ${E.crit.filter(c=>c.dom===di).map(c=>esc(c.n)+' ('+c.pts+')').join(' · ')}`).join('<br>')}</div>
    <label class="chk" style="margin-top:10px"><input type="checkbox" id="rvi2-ok"> Confirmo o enunciado e os critérios</label><button class="btn pri" id="rvi2-go" style="margin-top:10px" disabled>${ic('plus',14)} Incluir</button></div>`);
  $('#rvi2-ok').onchange=e=>$('#rvi2-go').disabled=!e.target.checked||!$('#rvi2-x').value.trim();$('#rvi2-x').oninput=()=>$('#rvi2-go').disabled=!$('#rvi2-ok').checked||!$('#rvi2-x').value.trim();
  $('#rvi2-go').onclick=()=>{E.titulo=$('#rvi2-t').value.trim()||E.titulo;E.texto=$('#rvi2-x').value.trim().slice(0,6000);E.temas=E.temas.filter((t,i)=>{const c=$(`#dw-b [data-rvit="${i}"]`);return !c||c.checked});
    if(!E.temas.length)return toast('Escolha pelo menos um tema','erro');E.incluido=Date.now();RV().enun.push(E);save();closeDrawer();toast('Enunciado de '+C.n+' incluído','ok');UI.rvTab='enun';UI.rvEd=null;vReview()}}
function rvEnunEd(E){const opt=(L,v)=>L.map(([k,l])=>`<option value="${k}" ${k===v?'selected':''}>${esc(l)}</option>`).join('');
  $('#view').innerHTML=rvShell('enun',`<div class="rvhd"><button class="btn" id="rve-v">${ic('back',15)} Enunciados</button><h2>Editar enunciado</h2><span class="rvsp"></span><b>${rvMax(E)} pontos = 20 valores</b></div>
   <section class="rvpanel"><p class="mut" style="margin-top:0">${esc((rvCurso(E.curso)||{}).n||'')} · Módulo 03 de TIC</p><label>Título</label><input id="rve-t" value="${esc(E.titulo)}"><label>Texto do enunciado</label><textarea id="rve-x" rows="6">${esc(E.texto||E.desc||'')}</textarea>
    <div class="rvcols2"><div><label>Padrão do endereço (expressão regular)</label><input id="rve-p" value="${esc(E.padrao||'')}"></div><div><label>Mínimo de páginas</label><input type="number" id="rve-mp" value="${+E.minPag||0}" min="0"></div></div></section>
   <section class="rvpanel"><h3>Domínios <span class="rvsp"></span><button class="btn" id="rve-da">${ic('plus',14)} Domínio</button></h3>${E.doms.map((d,i)=>`<div class="rvrow"><input data-rvdm="${i}" value="${esc(d)}"><span class="mut">${E.crit.filter(c=>c.dom===i).reduce((s,c)=>s+(+c.pts||0),0)} pts</span>${E.doms.length>1?`<button class="btn" data-rvdx="${i}">${ic('trash',13)}</button>`:''}</div>`).join('')}</section>
   <section class="rvpanel"><h3>Temas do trabalho <span class="rvsp"></span><button class="btn" id="rve-ta">${ic('plus',14)} Tema</button></h3><p class="hint" style="margin-top:0">As palavras-chave servem para verificar se o conteúdo do site corresponde ao tema.</p>${(E.temas||[]).map((t,i)=>`<div class="rvrow"><input data-rvtn="${i}" value="${esc(t.n)}" placeholder="Tema"><input data-rvtk="${i}" value="${esc(t.kw)}" placeholder="palavras-chave separadas por espaço" style="flex:2"><button class="btn" data-rvtx="${i}">${ic('trash',13)}</button></div>`).join('')}</section>
   <section class="rvpanel"><h3>Critérios <span class="rvsp"></span><button class="btn" id="rve-ca">${ic('plus',14)} Critério</button></h3><div class="rvtw"><table class="rvt rvedt"><tr><th></th><th>Domínio</th><th>Critério</th><th>Pontos</th><th>Descrição</th><th>Análise automática</th><th>Exemplo correto</th><th></th></tr>
    ${E.crit.map((c,i)=>`<tr><td><button class="btn" data-rvcu="${i}" ${i?'':'disabled'} aria-label="Subir">↑</button></td><td><select data-rvf="${i}|dom">${E.doms.map((d,k)=>`<option value="${k}" ${c.dom===k?'selected':''}>${esc(d)}</option>`).join('')}</select></td><td><input data-rvf="${i}|n" value="${esc(c.n)}"></td><td><input type="number" data-rvf="${i}|pts" value="${+c.pts||0}" min="0" step="0.5" style="width:70px"></td>
     <td><input data-rvf="${i}|desc" value="${esc(c.desc||'')}"></td><td><select data-rvf="${i}|auto">${opt(RV_AUTO,c.auto||'')}</select></td><td><select data-rvf="${i}|ref">${opt(RV_REFS,c.ref||'')}</select></td><td><button class="btn" data-rvcx="${i}">${ic('trash',13)}</button></td></tr>`).join('')}</table></div></section>`);
  rvBindNav();const re=()=>{save();setTimeout(()=>rvEnunEd(E))};$('#rve-v').onclick=()=>{UI.rvEd=null;UI.rvTab='enun';vReview()};
  $('#rve-t').onchange=e=>{E.titulo=e.target.value.trim()||'Enunciado';save()};$('#rve-x').onchange=e=>{E.texto=e.target.value.slice(0,6000);save()};
  $('#rve-p').onchange=e=>{try{new RegExp(e.target.value);E.padrao=e.target.value.trim();save()}catch(_){toast('Expressão inválida','erro')}};$('#rve-mp').onchange=e=>{E.minPag=Math.max(0,+e.target.value||0);save()};
  $('#rve-da').onclick=()=>{E.doms.push('Novo domínio');re()};$$('#view [data-rvdm]').forEach(i=>i.onchange=()=>{E.doms[+i.dataset.rvdm]=i.value.trim();save()});
  $$('#view [data-rvdx]').forEach(b=>b.onclick=()=>{const k=+b.dataset.rvdx;E.crit.forEach(c=>{if(c.dom===k)c.dom=0;else if(c.dom>k)c.dom--});E.doms.splice(k,1);re()});
  $('#rve-ta').onclick=()=>{(E.temas=E.temas||[]).push({n:'',kw:''});re()};$$('#view [data-rvtn]').forEach(i=>i.onchange=()=>{E.temas[+i.dataset.rvtn].n=i.value.trim();save()});
  $$('#view [data-rvtk]').forEach(i=>i.onchange=()=>{E.temas[+i.dataset.rvtk].kw=i.value.trim();save()});$$('#view [data-rvtx]').forEach(b=>b.onclick=()=>{E.temas.splice(+b.dataset.rvtx,1);re()});
  $('#rve-ca').onclick=()=>{E.crit.push({id:uid(),dom:E.doms.length-1,n:'Novo critério',pts:5,desc:'',auto:'',ref:''});re()};
  $$('#view [data-rvf]').forEach(i=>i.onchange=()=>{const [k,f]=i.dataset.rvf.split('|');const c=E.crit[+k];c[f]=f==='dom'?+i.value:f==='pts'?Math.max(0,+i.value||0):i.value;re()});
  $$('#view [data-rvcu]').forEach(b=>b.onclick=()=>{const k=+b.dataset.rvcu;[E.crit[k-1],E.crit[k]]=[E.crit[k],E.crit[k-1]];re()});
  $$('#view [data-rvcx]').forEach(b=>b.onclick=()=>{if(!confirm('Apagar o critério? Os pontos já dados neste critério deixam de contar.'))return;E.crit.splice(+b.dataset.rvcx,1);re()})}
/* banco de comentários e exemplos corretos */
function rvBanco(m){const L=RV().com;const E=rvEn();const nome=id=>{for(const e of RV().enun){const c=e.crit.find(x=>x.id===id);if(c)return c.n}return 'Geral'};
  m.innerHTML=rvHd('chat','Banco de comentários',`<button class="btn pri" id="rvk-n">${ic('plus',15)} Comentário</button>`)+`<input type="search" id="rvk-q" placeholder="Pesquisar…" style="margin-bottom:10px"><div id="rvk-l"></div>`;
  const pinta=q=>{$('#rvk-l').innerHTML=L.filter(x=>!q||normT(x.txt+' '+nome(x.crit)).includes(normT(q))).map(x=>`<div class="rvrow"><span class="rvb ma">${esc(nome(x.crit))}</span><input data-rvkt="${x.id}" value="${esc(x.txt)}" style="flex:3"><span class="mut">${x.n||0}×</span><button class="btn" data-rvkx="${x.id}">${ic('trash',13)}</button></div>`).join('')||'<p class="mut">Vazio.</p>';
    $$('#view [data-rvkt]').forEach(i=>i.onchange=()=>{L.find(x=>x.id===i.dataset.rvkt).txt=i.value.trim();save()});$$('#view [data-rvkx]').forEach(b=>b.onclick=()=>{L.splice(L.findIndex(x=>x.id===b.dataset.rvkx),1);save();pinta($('#rvk-q').value)})};
  pinta('');$('#rvk-q').oninput=e=>pinta(e.target.value);
  $('#rvk-n').onclick=()=>openDrawer('Novo comentário',`<div class="ed"><label>Critério</label><select id="rvk-c"><option value="">Geral</option>${E.crit.map(c=>`<option value="${c.id}">${esc(c.n)}</option>`).join('')}</select><label>Texto</label><textarea id="rvk-t" rows="3"></textarea><button class="btn pri" id="rvk-ok" style="margin-top:10px">Guardar</button></div>`)||($('#rvk-ok').onclick=()=>{const t=$('#rvk-t').value.trim();if(!t)return;L.push({id:uid(),crit:$('#rvk-c').value,txt:t,n:0});save();closeDrawer();vReview()})}
function rvRefs(m){const k=UI.rvRefC||(RV().enun[0]||{}).curso||'agro';
  m.innerHTML=rvHd('image','Exemplos corretos','')+`<div class="seg rvtabs">${RV_CURSOS.map(C=>`<button type="button" data-rvrc="${C.k}" class="${C.k===k?'on':''}">${esc(C.n)}</button>`).join('')}</div><p class="hint">Capturas de como deve ficar cada exercício, com conteúdos do curso. Aparecem ao lado de cada critério e na página do aluno.</p>
   <div class="rvgal rvgal3">${RV_REFS.filter(r=>r[0]).map(([r,n])=>`<figure><button type="button" class="rvzoom" data-rvz="${RV_REF}${k}/${r}.webp"><img src="${RV_REF}${k}/${r}.webp" alt="Exemplo correto: ${esc(n)}" loading="lazy"></button><figcaption>${esc(n)}</figcaption></figure>`).join('')}</div>`;
  m.querySelectorAll('[data-rvrc]').forEach(b=>b.onclick=()=>{UI.rvRefC=b.dataset.rvrc;rvRefs(m)});
  m.querySelectorAll('[data-rvz]').forEach(b=>b.onclick=()=>rvLupa(`<img src="${esc(b.dataset.rvz)}" alt="" style="max-width:100%">`))}
/* ---------- menu, vista, definições, Apps ---------- */
{const h=document.querySelector('#side [data-v="provas"]')||document.querySelector('#side [data-v="forms"]');if(h&&!document.querySelector('#side [data-v="review"]')){h.insertAdjacentHTML('afterend',`<button class="nav" data-v="review" title="Spruce Review · avaliação de sites"><span data-ico="globo"></span><span class="lbl">Spruce Review</span></button>`);const b=document.querySelector('#side [data-v="review"]');b.querySelector('[data-ico]').innerHTML=ic('globo',18);b.onclick=()=>go('review')}}
{const _gRv=go;go=function(v){if(v==='review'&&!rvOn())v='inicio';if(go._f&&go._f.review!==vReview)go._f.review=vReview;const r=_gRv.call(this,v);try{$$('#side [data-v="review"]').forEach(b=>{b.hidden=!rvOn();b.classList.toggle('on',VIEW==='review')})}catch(_){}return r};go._f=_gRv._f;if(go._f)go._f.review=vReview}
try{if(typeof MN_NOME==='object'&&MN_NOME)MN_NOME.review=MN_NOME.review||'Spruce Review';if(typeof MN_IC==='object'&&MN_IC)MN_IC.review=MN_IC.review||'globo'}catch(_){}
{const _vDr=vDefinicoes;vDefinicoes=function(){const r=_vDr.apply(this,arguments);try{const mods=$('#view #def-mods');if(mods&&!$('#rv-on')){mods.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px"><input type="checkbox" id="rv-on" ${S.cfg.reviewOn!==false?'checked':''} ${rvElegivel()?'':'disabled'}> ${ic('globo',15)} <span><b>Spruce Review</b> · Módulo 03 de TIC<br><span class="mut">Avaliação dos sites dos alunos dos cursos profissionais (Mecatrónica, Agropecuária, Turismo Ambiental e Rural, Ação Educativa).${rvElegivel()?'':' Só aparece com uma turma de TIC do ensino profissional.'}</span></span></label>`);
  $('#rv-on').onchange=e=>{S.cfg.reviewOn=e.target.checked;save();$$('#side [data-v="review"]').forEach(b=>b.hidden=!rvOn());toast(e.target.checked?'Spruce Review ligado':'Spruce Review desligado','ok')}}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
try{if(typeof HUB_APPS!=='undefined'&&!HUB_APPS.some(a=>a.id==='review'))HUB_APPS.push({id:'review',gr:'recreio',n:'Spruce Review',v:'review',g:['globo','search'],c:'laranja',d:'Sites · Módulo 03 de TIC',on:()=>rvOn(),
  info:()=>{const d=S.rv||{};const L=Array.isArray(d.av)?d.av:[];return hubN(L.length,'avaliação','avaliações')+' · '+hubN(L.reduce((s,a)=>s+(a.al||[]).length,0),'site','sites')},tag:'TIC · Módulo 03'});
  if(typeof HUB_SGE_DEF==='object')HUB_SGE_DEF.review='sgeTerra';if(typeof MOD_GR!=='undefined'&&MOD_GR[1]&&!MOD_GR[1][2].some(x=>x[1]==='review'))MOD_GR[1][2].push(['rv-on','review'])}catch(e){console.warn(e)}
(()=>{const st=document.createElement('style');st.id='review-css';st.textContent=`
html body .rv{display:flex;gap:16px;align-items:flex-start;width:100%}
html body .rvnav{flex:0 0 200px;position:sticky;top:8px;display:flex;flex-direction:column;gap:4px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px}
html body .rvbrand{display:flex;gap:8px;align-items:center;font-weight:800;padding:6px 8px 10px;color:#c2410c}
html body .rvnav button{display:flex;gap:8px;align-items:center;border:0;background:none;color:var(--ink);font:inherit;padding:9px 10px;border-radius:10px;cursor:pointer;text-align:left}
html body .rvnav button.on,html body .rvnav button:hover{background:color-mix(in srgb,#c2410c 12%,var(--panel));color:#c2410c}
html body .rvmain{flex:1;min-width:0;display:flex;flex-direction:column;gap:12px}
html body .rvhd{display:flex;gap:10px;align-items:center;flex-wrap:wrap}html body .rvhd h2{margin:0;display:flex;gap:8px;align-items:center;font-size:20px}html body .rvsp{flex:1}
html body .rvgr{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
html body .rvcard{display:flex;flex-direction:column;gap:6px;align-items:flex-start;text-align:left;background:var(--panel);border:1px solid var(--line);border-top:5px solid #c2410c;border-radius:14px;padding:14px;color:var(--ink);font:inherit;cursor:pointer}
html body .rvcard:hover{border-color:#c2410c}html body .rvnota{font-weight:800;color:#c2410c}
html body .rvvazio{text-align:center;padding:40px 20px;background:var(--panel);border:1px dashed var(--line);border-radius:14px;color:var(--mut)}html body .rvvazio h3{color:var(--ink)}
html body .rvbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:4px 0}
html body .rvtabs{flex-wrap:wrap}
html body .rvpanel{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 16px}html body .rvpanel h3{margin:0 0 10px;display:flex;gap:8px;align-items:center;font-size:15px}
html body .rvtw{overflow:auto}html body .rvt{width:100%;border-collapse:collapse}html body .rvt th,html body .rvt td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}
html body .rvurl{min-width:220px;width:100%}html body .rvt tr.rvdiv td{background:color-mix(in srgb,#dc2626 10%,transparent)}
html body .rvb{display:inline-block;font-size:12px;font-weight:700;padding:2px 8px;border-radius:999px;white-space:nowrap}
html body .rvb.ok{background:#dcfce7;color:#166534}html body .rvb.pa{background:#fef3c7;color:#92400e}html body .rvb.no{background:#fee2e2;color:#991b1b}html body .rvb.ma{background:#e0e7ff;color:#3730a3}
html body .rvtotal{display:flex;flex-direction:column;align-items:flex-end;background:#c2410c;color:#fff;border-radius:12px;padding:6px 14px}html body .rvtotal b{font-size:24px;line-height:1}html body .rvtotal span{font-size:12px;opacity:.9}
html body .rvcrit{display:grid;grid-template-columns:1fr auto;gap:8px 14px;padding:12px 0;border-top:1px solid var(--line)}html body .rvcrit:first-of-type{border-top:0}
html body .rvci{display:flex;gap:12px;align-items:flex-start}html body .rvthumb{flex:0 0 120px;padding:0;border:1px solid var(--line);border-radius:8px;overflow:hidden;cursor:zoom-in;background:#fff}html body .rvthumb img{display:block;width:120px;height:68px;object-fit:cover;object-position:top}
html body .rvdesc{font-size:13px}html body .rvdet{font-size:13px;margin-top:4px}
html body .rvniv{display:flex;gap:4px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
html body .rvniv button{border:1px solid var(--line);background:var(--panel);color:var(--ink);font:inherit;font-size:12px;padding:6px 8px;border-radius:8px;cursor:pointer}
html body .rvniv button.on{background:#c2410c;border-color:#c2410c;color:#fff}html body .rvpts{width:72px}
html body .rvcom{grid-column:1/-1;display:flex;gap:6px}html body .rvcom textarea{flex:1;min-height:36px;resize:vertical}
html body .rvaud{grid-column:1/-1;display:flex;gap:6px;align-items:center}html body .rvaud audio{height:34px}
html body .btn.on{border-color:#c2410c;color:#c2410c}html body .btn.rvrec{background:#dc2626;color:#fff;border-color:#dc2626}
html body .rvkpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}html body .rvkpis div{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column}html body .rvkpis b{font-size:26px;color:#c2410c}html body .rvkpis span{color:var(--mut);font-size:13px}
html body .rvcols2{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media (max-width:900px){html body .rvcols2{grid-template-columns:1fr}html body .rv{flex-direction:column}html body .rvnav{position:static;flex-direction:row;flex-wrap:wrap;flex:auto;width:100%}html body .rvcrit{grid-template-columns:1fr}html body .rvniv{justify-content:flex-start}}
html body .rvhist{width:100%;max-width:420px;color:var(--ink)}
html body .rvpc{display:grid;grid-template-columns:1fr 120px 44px;gap:8px;align-items:center;margin:6px 0;font-size:13px}html body .rvmeter{height:10px;background:var(--line);border-radius:6px;overflow:hidden}html body .rvmeter i{display:block;height:100%}
html body .rvheat{border-collapse:collapse;font-size:12px}html body .rvheat th,html body .rvheat td{padding:4px 6px;border:1px solid var(--panel);text-align:center;min-width:30px}html body .rvheat td:first-child{text-align:left;white-space:nowrap}html body .rvheat td{color:#fff;font-weight:700}html body .rvheat td:first-child,html body .rvheat td:last-child{color:var(--ink);font-weight:400}
html body .rvdisp{display:grid;grid-template-columns:3fr 1.6fr 1fr;gap:12px;align-items:start}html body .rvdisp figure,html body .rvgal figure{margin:0;display:flex;flex-direction:column;gap:6px}
html body .rvzoom{padding:0;border:1px solid var(--line);border-radius:8px;overflow:hidden;cursor:zoom-in;background:#fff}html body .rvzoom img{display:block;width:100%}
html body .rvgal{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}html body .rvgal3{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
html body .rvfig{position:relative;display:block;line-height:0}html body .rvfig img{width:100%;display:block;border-radius:6px}
html body .rvanot{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}html body .rvatxt{position:absolute;transform:translate(-50%,-50%);color:#fff;font:700 12px/1.3 system-ui;padding:2px 6px;border-radius:4px;white-space:nowrap;line-height:1.3}
html body .rvdraw{cursor:crosshair;touch-action:none;user-select:none;margin:10px 0}html body .rvdraw #rva-o{position:absolute;inset:0}
html body .rvcores{display:flex;gap:6px;align-items:center;margin-top:8px}html body .rvcores [data-rc]{width:26px;height:26px;border-radius:50%;border:2px solid var(--panel);box-shadow:0 0 0 1px var(--line);cursor:pointer}html body .rvcores [data-rc].on{box-shadow:0 0 0 3px var(--ink)}
html body #rvlupa{position:fixed;inset:0;background:#000b;z-index:9999;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px}
html body .rvlupa-c{background:var(--panel);color:var(--ink);border-radius:14px;padding:14px;max-width:1500px;width:100%}html body .rvlupa-c>[data-rvlx]{float:right}
html body .rvlado{display:grid;grid-template-columns:1fr 1fr;gap:14px;clear:both}html body .rvlado figure{margin:0}html body .rvlado figcaption{font-weight:700;margin-bottom:6px}html body .rvlado img{width:100%;border:1px solid var(--line);border-radius:8px}
html body .rvlado figure:first-child figcaption{color:#15803d}@media (max-width:800px){html body .rvlado{grid-template-columns:1fr}}
html body .rvlink{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}html body .rvlink code{word-break:break-all;font-size:12px}html body .rvqr svg{width:150px;height:150px}
html body .rvbk{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:inherit;padding:9px 10px;border-radius:8px;margin:6px 0;cursor:pointer}html body .rvbk:hover{border-color:#c2410c}
html body .rvrow{display:flex;gap:8px;align-items:center;margin:6px 0}html body .rvrow input{flex:1}html body .rvedt input,html body .rvedt select{width:100%;min-width:90px}
html body .rvinl{display:flex;gap:6px;align-items:center}
html body .rvcur{cursor:default}html body .rvenu{display:flex;flex-direction:column;gap:4px;width:100%;border-top:1px solid var(--line);padding-top:8px}html body .rvcritl{font-size:13px;line-height:1.6;background:color-mix(in srgb,var(--line) 35%,transparent);padding:8px 10px;border-radius:8px}html body.est-sge .rvcritl{border-radius:0}
html body .rvcrit.rvrever{background:color-mix(in srgb,#f59e0b 8%,transparent);border-left:4px solid #f59e0b;padding-left:10px}html body .rvvis{padding:3px 10px;font-size:12px;margin-left:6px}html body .rvauto{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:8px 12px}html body .rvauto .chk{margin:0}html body .rvurl.rvbusy{background:repeating-linear-gradient(90deg,transparent 0 10px,color-mix(in srgb,#c2410c 12%,transparent) 10px 20px)}
html body.est-sge .rvauto{border-radius:0}
html body.est-sge .rvnav,html body.est-sge .rvcard,html body.est-sge .rvpanel,html body.est-sge .rvkpis div,html body.est-sge .rvtotal,html body.est-sge .rvniv button,html body.est-sge .rvthumb,html body.est-sge .rvzoom,html body.est-sge .rvvazio,html body.est-sge .rvnav button,html body.est-sge .rvbk,html body.est-sge .rvlupa-c{border-radius:0}
`;document.head.appendChild(st)})();
