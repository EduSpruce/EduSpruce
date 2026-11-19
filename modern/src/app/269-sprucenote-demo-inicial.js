/* ===================== 1.138 · SpruceNote e JornalNote: quadro de demonstração (ao estilo do Milanote) =====================
   Aparece uma vez, na primeira entrada em cada contexto (S.cfg.mqDemo.sn / .snj), e volta a abrir no botão «Ver exemplo»
   no canto inferior direito do quadro. Só dados fictícios. «Criar quadro de exemplo» acrescenta um subquadro — nunca apaga nada. */
const MQD={
  sn:{nome:'SpruceNote',tit:'Organize-se. Continue a criar.',sub:'O SpruceNote é a forma fácil de organizar aulas, projetos e ideias — tudo num quadro.',
    bc:['Início','Turmas','Projeto «A minha escola»'],quadro:'Projeto «A minha escola»',
    sobre:['Sobre','1 cartão, 1 ficheiro','<b>A minha escola</b> é um projeto do 7.º ano: cada grupo apresenta um espaço da escola com fotografias, entrevistas e um mapa. Objetivo: <mark>trabalho colaborativo</mark>, comunicação oral e espírito crítico.','Guiao-do-projeto.pdf','184 KB'],
    cor:['#0E7095','Azul Spruce'],insp:['Inspiração','1 cartão, 1 ficheiro'],tipo:['Abc','Tipografia dos cartazes'],video:['visita-de-estudo.mp4','48,2 MB'],
    com:['Prof.ª Marta','12 nov.','Era ótimo levarmos estes cartazes à reunião de grupo.'],
    lista:['Esta semana',[['Rever os critérios de avaliação',1],['Preparar o Teste 2',0],['Atualizar sumários',0]]],
    q1:['Brainstorm','12 cartões'],q2:['Visita de estudo','8 cartões, 2 ficheiros'],
    tab:['Visita de estudo','Custo',[['Autocarro','180,00 €'],['Entradas (24 alunos)','96,00 €'],['Lanche','60,00 €']],'336,00 €'],
    roda:['Criativo','Colaborativo','Organizado'],arte:'escola'},
  snj:{nome:'JornalNote',tit:'Cada edição, num só quadro.',sub:'O JornalNote junta artigos, fotografias, entrevistas e prazos do jornal escolar.',
    bc:['Início','Jornal Escolar','Edição de dezembro'],quadro:'Edição de dezembro',
    sobre:['Sobre','1 cartão, 1 ficheiro','<b>Edição de dezembro</b> do jornal da escola: tema <mark>«a escola que queremos»</mark>, com reportagens das turmas, uma entrevista e a página de desporto.','Pauta-de-dezembro.pdf','96 KB'],
    cor:['#F59E0B','Âmbar Jornal'],insp:['Capa','1 cartão, 1 ficheiro'],tipo:['Aa','Tipo de letra da manchete'],video:['entrevista.mp4','132,6 MB'],
    com:['Revisora','14 nov.','Falta a legenda da fotografia da página 3.'],
    lista:['Fecho da edição',[['Recolher os artigos das turmas',1],['Rever os textos',0],['Paginar e imprimir',0]]],
    q1:['Reportagens','6 cartões'],q2:['Fotografias','14 cartões, 9 ficheiros'],
    tab:['Páginas','N.º',[['Notícias','4'],['Desporto','2'],['Cultura e lazer','2']],'8'],
    roda:['Rigoroso','Curioso','Criativo'],arte:'jornal'}
};
const mqdCtx=()=>UI.mqCtx==='jornal'?'snj':'sn';
function mqdArte(t){/* ilustrações próprias (SVG), sem imagens de terceiros */
  if(t==='jornal')return`<svg viewBox="0 0 200 240" aria-hidden="true"><rect width="200" height="240" fill="#e9e5dc"/><rect x="34" y="40" width="132" height="168" fill="#fff" stroke="#c9c2b3"/><rect x="46" y="54" width="108" height="16" fill="#1f2937"/><rect x="46" y="78" width="64" height="52" fill="#f59e0b" opacity=".85"/><g fill="#9ca3af"><rect x="116" y="80" width="38" height="5"/><rect x="116" y="92" width="38" height="5"/><rect x="116" y="104" width="30" height="5"/><rect x="46" y="140" width="108" height="5"/><rect x="46" y="152" width="108" height="5"/><rect x="46" y="164" width="90" height="5"/><rect x="46" y="182" width="50" height="5"/><rect x="104" y="182" width="50" height="5"/></g><circle cx="78" cy="104" r="12" fill="#fff" opacity=".7"/></svg>`;
  return`<svg viewBox="0 0 200 240" aria-hidden="true"><defs><linearGradient id="mqd-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe7f1"/><stop offset="1" stop-color="#f4f8fa"/></linearGradient></defs><rect width="200" height="240" fill="url(#mqd-ceu)"/><circle cx="156" cy="46" r="18" fill="#fde68a"/><path d="M0 196 Q60 176 120 192 T200 186 V240 H0Z" fill="#86c5a4"/><rect x="40" y="110" width="120" height="86" fill="#fff" stroke="#94a3b8"/><path d="M32 112 L100 72 L168 112Z" fill="#0e7095"/><rect x="88" y="150" width="24" height="46" fill="#0e7095" opacity=".8"/><g fill="#bae6fd" stroke="#64748b" stroke-width="1"><rect x="52" y="124" width="22" height="18"/><rect x="126" y="124" width="22" height="18"/><rect x="52" y="158" width="22" height="18"/><rect x="126" y="158" width="22" height="18"/></g><rect x="98" y="52" width="3" height="22" fill="#475569"/><path d="M101 52 h18 l-5 6 5 6 h-18z" fill="#ef4444"/></svg>`}
function mqdQuadro(d){const ico=n=>ic(n,13);
  const ferr=[['list','Anotação'],['link','Link'],['check','Pendências'],['arrowUp','Linha'],['grid','Quadro'],['layers','Coluna'],['chat','Comentário'],['grid','Tabela']];
  return`<div class="mqd-app"><div class="mqd-tb"><span class="mqd-bc">${d.bc.map((b,i)=>`<span class="mqd-b${i?' c'+i:''}">${b}</span>`).join('<i>/</i>')}</span><span class="mqd-tbi">${ico('undo')}${ico('search')}${ico('bell')}${ico('gear')}</span></div>
  <div class="mqd-ti"><b>${d.quadro}</b><span class="mqd-tia">${ico('users')} Partilhar <span>Exportar ▾</span> <span>Ver ▾</span></span></div>
  <div class="mqd-bd"><div class="mqd-bar">${ferr.map(f=>`<span><i>${ico(f[0])}</i>${f[1]}</span>`).join('')}</div>
   <div class="mqd-cv">
    <div class="mqd-c mqd-sobre" style="--d:.15s"><h5>${d.sobre[0]}</h5><small>${d.sobre[1]}</small><p>${d.sobre[2]}</p><div class="mqd-pdf"><span>pdf</span><b>${d.sobre[3]}</b><small>${d.sobre[4]}</small></div></div>
    <div class="mqd-c mqd-img" style="--d:.45s">${mqdArte(d.arte)}</div>
    <div class="mqd-c mqd-cor" style="--d:.75s;--k:${d.cor[0]}"><div>${d.cor[0]}</div><span>${d.cor[1]}</span></div>
    <div class="mqd-c mqd-logo" style="--d:1.05s"><b>${d.nome==='JornalNote'?'O ECO':'A MINHA ESCOLA'}</b></div>
    <svg class="mqd-seta" viewBox="0 0 120 60" aria-hidden="true"><path d="M112 14 C80 2 30 4 10 42"/><path d="M4 30 L10 44 L24 38"/></svg>
    <div class="mqd-c mqd-insp" style="--d:1.35s"><h5>${d.insp[0]}</h5><small>${d.insp[1]}</small><div class="mqd-abc"><b>${d.tipo[0]}</b></div><span class="mqd-leg">${d.tipo[1]}</span>
      <div class="mqd-vid"><i>▶</i></div><div class="mqd-fich"><span>▷</span><b>${d.video[0]}</b><small><u>Descarregar</u> · ${d.video[1]}</small></div></div>
    <div class="mqd-c mqd-textura" style="--d:1.65s"><div></div><span>${d.nome==='JornalNote'?'Papel reciclado':'Textura dos cartazes'}</span></div>
    <div class="mqd-c mqd-com" style="--d:2.4s"><div class="mqd-av">${d.com[0][0]}</div><div><b>${d.com[0]}</b> <small>${d.com[1]}</small><p>${d.com[2]}</p><a>Responder</a></div></div>
    <div class="mqd-c mqd-lista" style="--d:1.95s"><h5>${d.lista[0]}</h5>${d.lista[1].map((l,i)=>`<label class="${l[1]?'f':''}${i===1?' mqd-anim':''}"><span></span>${l[0]}</label>`).join('')}</div>
    <div class="mqd-c mqd-q mqd-q1" style="--d:2.1s"><div>${ico('grid')}</div><b>${d.q1[0]}</b><small>${d.q1[1]}</small></div>
    <svg class="mqd-lig" viewBox="0 0 70 30" aria-hidden="true"><path d="M2 6 L68 26"/></svg>
    <div class="mqd-c mqd-q mqd-q2" style="--d:2.25s"><div>${ico('layers')}</div><b>${d.q2[0]}</b><small>${d.q2[1]}</small></div>
    <div class="mqd-c mqd-tab" style="--d:2.55s"><table><tr><th>${d.tab[0]}</th><th>${d.tab[1]}</th></tr>${d.tab[2].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}<tr><td>Total</td><td><b>${d.tab[3]}</b></td></tr></table></div>
    <div class="mqd-roda" style="--d:2.8s"><svg viewBox="0 0 140 120" aria-hidden="true"><path d="M70 6 C120 4 136 40 130 70 C122 108 70 118 36 106 C4 94 2 50 22 26 C34 12 54 6 84 8"/></svg>${d.roda.map(r=>`<b>${r}</b>`).join('')}</div>
    <div class="mqd-cursor" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 2 L4 20 L9 15 L12 22 L15 21 L12 14 L19 14 Z"/></svg></div>
   </div></div></div>`}
function mqdAbrir(auto){const k=mqdCtx(),d=MQD[k];if(!d||$('#mqdemo'))return;
  const o=document.createElement('div');o.id='mqdemo';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label',d.nome+' — exemplo');
  o.innerHTML=`<div class="mqd-pn"><button type="button" class="mqd-x" aria-label="Fechar">✕</button>
    <div class="mqd-hero"><div class="mqd-marca">${ic(k==='snj'?'pen':'grid',18)} ${d.nome}</div><h2>${d.tit}</h2><p>${d.sub}</p>
      <div class="mqd-bts"><button type="button" class="mqd-go">Começar a criar</button><button type="button" class="mqd-ex">${ic('plus',15)} Criar quadro de exemplo</button></div></div>
    <div class="mqd-palco"><div class="mqd-mold"><div class="mqd-esc">${mqdQuadro(d)}</div></div></div>
    <div class="mqd-pe">Arraste da barra para o quadro · duplo toque para abrir ou editar · volte a ver este exemplo no botão <b>Ver exemplo</b>, no canto do quadro.</div></div>`;
  document.body.appendChild(o);
  const esc=o.querySelector('.mqd-esc'),pal=o.querySelector('.mqd-palco');
  const ajusta=()=>{const w=pal.clientWidth-24,h=pal.clientHeight-24;const s=Math.min(1,w/1100,h/640);esc.style.transform=`scale(${s})`;esc.parentElement.style.width=(1100*s)+'px';esc.parentElement.style.height=(640*s)+'px'};
  ajusta();const ro=window.ResizeObserver?new ResizeObserver(ajusta):null;ro&&ro.observe(pal);
  const fim=()=>{ro&&ro.disconnect();window.removeEventListener('keydown',tecla,true);o.classList.add('sai');setTimeout(()=>o.remove(),220);try{S.cfg=S.cfg||{};S.cfg.mqDemo=S.cfg.mqDemo||{};if(!S.cfg.mqDemo[k]){S.cfg.mqDemo[k]=true;save()}}catch(_){}const b=$('#mq-demo');b&&b.focus()};
  const tecla=e=>{if(e.key==='Escape'){e.stopImmediatePropagation();e.preventDefault();fim()}};window.addEventListener('keydown',tecla,true);
  o.querySelector('.mqd-x').onclick=fim;o.querySelector('.mqd-go').onclick=fim;o.onclick=e=>{if(e.target===o)fim()};
  o.querySelector('.mqd-ex').onclick=()=>{mqdCriarExemplo(k);fim()};
  setTimeout(()=>o.querySelector('.mqd-go').focus(),60)}
function mqdCriarExemplo(k){const d=MQD[k];try{const q=mqQ(mqUI().q);if(!q)return;mqAntes&&mqAntes();
  const nq={id:uid(),nome:'Exemplo — '+d.quadro,pai:q.id,itens:[],setas:[],cor:MQ_CORES[6]};
  const it=(t,x,y,o)=>({id:uid(),t,x,y,w:{nota:240,tarefa:260,titulo:420,cor:120,quadro:150}[t]||220,cor:'',pai:null,...o});
  nq.itens.push(it('titulo',40,20,{txt:d.quadro}),
    it('nota',40,110,{txt:d.sobre[2].replace(/<[^>]+>/g,'')}),
    it('cor',320,110,{hex:d.cor[0]}),
    it('nota',320,250,{txt:d.com[0]+': '+d.com[2],cor:'#facc15'}),
    it('tarefa',600,110,{tit:d.lista[0],l:d.lista[1].map(l=>({t:l[0],f:!!l[1]}))}),
    it('nota',600,330,{txt:d.tab[0]+'\n'+d.tab[2].map(r=>r[0]+' — '+r[1]).join('\n')+'\nTotal — '+d.tab[3]}));
  MQ().push(nq);
  const xs=q.itens.map(i=>(i.x||0)+(i.w||200));const x=q.itens.length?Math.max(...xs)+40:40;
  q.itens.push({id:uid(),t:'quadro',x,y:40,w:150,cor:'',pai:null,ref:nq.id,nome:nq.nome});
  mqUI().sel=[];save();mqRender();toast&&toast('Quadro de exemplo criado: «'+nq.nome+'». Abra-o com duplo toque.','ok')}catch(e){console.warn('mqdemo',e)}}
(function(){const _v=mqVista;mqVista=function(){const r=_v.apply(this,arguments);try{const cv=$('#mq-cv');if(cv&&!$('#mq-demo')){const b=document.createElement('button');b.type='button';b.id='mq-demo';b.className='mq-demob';b.title='Ver o quadro de exemplo';b.innerHTML=ic('sparkle',15)+'<span>Ver exemplo</span>';
    ['pointerdown','dblclick','mousedown'].forEach(ev=>b.addEventListener(ev,e=>e.stopPropagation()));b.onclick=()=>mqdAbrir(false);cv.appendChild(b)}
    const k=mqdCtx();setTimeout(()=>{try{if(!(S.cfg&&S.cfg.mqDemo&&S.cfg.mqDemo[k])&&$('#mq-cv')&&mqdCtx()===k)mqdAbrir(true)}catch(_){}},700)}catch(_){}return r}})();
