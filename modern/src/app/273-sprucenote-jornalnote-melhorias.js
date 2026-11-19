/* ===================== 1.141 · SpruceNote e JornalNote: melhorias (ideias do site do Milanote) =====================
   · pesquisa em todos os quadros (botão ou Ctrl+F no quadro)
   · modelos de quadro (plano de aula, projeto, visita de estudo, reunião, brainstorm, pesquisa, semana, edição do jornal)
   · setas: etiqueta, tracejado, pontas (fim, ambas, nenhuma), cor, curva e inverter sentido
   · arrastar elementos para cima de um cartão de quadro move-os para dentro desse quadro
   · copiar, cortar e colar elementos (Ctrl+C / Ctrl+X / Ctrl+V), também entre quadros
   · «Enviar para trás» e «Exportar como texto» (copia o quadro em Markdown)
   Vale para os dois módulos (UI.mqCtx decide qual). */

const MQM_SVG='http://www.w3.org/2000/svg';
/* antes de abrir um painel lateral: tira a seleção (senão o menu do elemento fica por cima do painel) */
function mqmLimpaSel(){try{const u=mqUI();u.sel=[];u.selSeta=null;const b=$('#mq-ctx');if(b)b.hidden=true;$$('#mq-its .mq-it.sel').forEach(x=>x.classList.remove('sel'));mqSetas()}catch(_){}}
function mqmTexto(it){if(!it)return '';const tx=h=>{const d=document.createElement('div');d.innerHTML=mqLimpa(h||'');d.querySelectorAll('br,div,p,li,h3').forEach(e=>e.append(' '));return d.textContent.replace(/\s+/g,' ').trim()};
  switch(it.t){case 'nota':case 'titulo':case 'documento':return tx(it.txt);case 'tarefa':return [it.tit,...(it.l||[]).map(x=>x.t)].filter(Boolean).join(' · ');case 'link':return [it.tit,it.url,it.desc].filter(Boolean).join(' · ');
    case 'quadro':{const s=MQ().find(q=>q.id===it.ref);return s?s.nome||'':''}case 'coluna':return it.tit||'';case 'imagem':return it.leg||'';case 'cor':return it.hex||'';case 'ficheiro':return it.nome||'';
    case 'comentario':return [tx(it.txt),...(it.resp||[]).map(r=>tx(r.txt||r.t||''))].filter(Boolean).join(' · ');case 'tabela':return (it.rows||it.l||[]).flat?(it.rows||it.l||[]).flat().filter(x=>typeof x==='string').join(' '):'';
    default:return [it.tit,it.txt?tx(it.txt):'',it.nome,it.leg,it.desc].filter(Boolean).join(' · ')}}
function mqmCaminho(qid){const L=[];let q=MQ().find(x=>x.id===qid),n=0;while(q&&n++<30){L.unshift(q.nome||'Sem nome');q=q.pai?MQ().find(x=>x.id===q.pai):null}return L.join(' › ')}
function mqmCentrar(q,id){const it=mqItem(q,id);if(!it)return;const base=it.pai?mqItem(q,it.pai)||it:it;const cv=$('#mq-cv');if(!cv)return;const r=cv.getBoundingClientRect(),v=mqVis(q.id);v.z=Math.max(v.z||1,.8);
  v.x=Math.round(r.width/2-(base.x+(base.w||220)/2)*v.z);v.y=Math.round(r.height/2-(base.y+60)*v.z);mqZoomAp();requestAnimationFrame(mqSetas);
  setTimeout(()=>{const el=$(`[data-mq="${it.id}"]`);if(el){el.classList.add('mqm-hit');setTimeout(()=>el.classList.remove('mqm-hit'),1600)}},60)}

/* ---------- pesquisa em todos os quadros ---------- */
function mqmPesquisa(){mqmLimpaSel();const nome=UI.mqCtx==='jornal'?'JornalNote':'SpruceNote';
  openDrawer('Pesquisar no '+nome,`<input type="search" id="mqm-q" class="mqm-q" placeholder="Notas, tarefas, ligações, colunas, quadros…" autocomplete="off" aria-label="Pesquisar"><div id="mqm-r" class="mqm-r" role="list"></div>`);
  const inp=$('#mqm-q'),out=$('#mqm-r');let R=[];
  const corre=()=>{const v=inp.value.trim().toLowerCase();if(!v){out.innerHTML=`<p class="mut">Procura em todos os quadros do ${nome}.</p>`;return}R=[];
    MQ().forEach(q=>{if(q.id!=='raiz'&&(q.nome||'').toLowerCase().includes(v))R.push({qid:q.pai||'raiz',abre:q.id,tipo:'Quadro',tx:q.nome});
      q.itens.forEach(it=>{const t=mqmTexto(it);if(t&&t.toLowerCase().includes(v))R.push({qid:q.id,id:it.id,tipo:(MQ_T&&MQ_T[it.t]?MQ_T[it.t][1]:it.t),tx:t})})});
    const real=s=>{const i=s.toLowerCase().indexOf(v),a=Math.max(0,i-36);return (a?'…':'')+esc(s.slice(a,i))+'<mark>'+esc(s.slice(i,i+v.length))+'</mark>'+esc(s.slice(i+v.length,i+v.length+70))};
    out.innerHTML=R.length?R.slice(0,80).map((r,k)=>`<button type="button" class="mqm-res" data-k="${k}" role="listitem"><span>${real(r.tx)}</span><small>${esc(r.tipo)} · ${esc(mqmCaminho(r.qid))}</small></button>`).join(''):'<p class="mut">Sem resultados.</p>'};
  out.onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;const r=R[+b.dataset.k];closeDrawer();if(r.abre)return mqAbrir(r.abre);mqAbrir(r.qid);const q=mqQ(r.qid);mqUI().sel=[r.id];mqRender();mqmCentrar(q,r.id)};
  inp.oninput=corre;corre();setTimeout(()=>inp.focus(),40)}

/* ---------- exportar o quadro como texto (Markdown) ---------- */
function mqmMd(q,nivel){nivel=nivel||0;if(nivel>4)return '';const top=q.itens.filter(i=>!i.pai).sort((a,b)=>(a.y-b.y)||(a.x-b.x));
  const um=it=>{switch(it.t){case 'titulo':return '## '+mqmTexto(it);case 'tarefa':return (it.tit?'**'+it.tit+'**\n':'')+(it.l||[]).map(x=>`- [${x.f?'x':' '}] ${x.t}`).join('\n');case 'link':return `[${it.tit||it.url}](${it.url})${it.desc?'\n'+it.desc:''}`;
    case 'coluna':return '### '+(it.tit||'Coluna')+'\n\n'+q.itens.filter(x=>x.pai===it.id).sort((a,b)=>(a.o||0)-(b.o||0)).map(um).filter(Boolean).join('\n\n');
    case 'quadro':{const s=MQ().find(x=>x.id===it.ref);return s?`### ▸ ${s.nome||'Quadro'}\n\n`+mqmMd(s,nivel+1):''}case 'imagem':return `[Imagem${it.leg?': '+it.leg:''}]`;case 'cor':return 'Cor '+(it.hex||'').toUpperCase();
    case 'comentario':return '> '+mqmTexto(it);default:{const t=mqmTexto(it);return t}}};
  return top.map(um).filter(Boolean).join('\n\n')}
function mqmExportar(){const q=mqQ(mqUI().q);const md='# '+(q.nome||'Quadro')+'\n\n'+mqmMd(q);
  const mostra=()=>{mqmLimpaSel();openDrawer('Quadro em texto',`<p class="mut">Selecione tudo e copie.</p><textarea class="mqm-md" id="mqm-md" readonly>${esc(md)}</textarea>`);setTimeout(()=>{const t=$('#mqm-md');t&&(t.focus(),t.select())},40)};
  try{navigator.clipboard.writeText(md).then(()=>toast('Quadro copiado como texto (Markdown)','ok'),mostra)}catch(_){mostra()}}

/* ---------- modelos de quadro ---------- */
const MQM_MODELOS=[
  {k:'aula',ic:'book',n:'Plano de aula',d:'Identificação, objetivos, sumário, atividades, recursos e avaliação.'},
  {k:'projeto',ic:'layers',n:'Plano de projeto',d:'Colunas «A fazer», «Em curso» e «Feito» para projetos e PAP.'},
  {k:'visita',ic:'map',n:'Visita de estudo',d:'Saída, autorizações, grupos, guião e contactos.'},
  {k:'reuniao',ic:'users',n:'Reunião',d:'Ordem de trabalhos, notas, decisões e próximos passos.'},
  {k:'brain',ic:'sparkle',n:'Brainstorm',d:'Uma ideia central ligada a seis ideias à volta.'},
  {k:'pesquisa',ic:'search',n:'Pesquisa',d:'Pergunta, fontes, notas e conclusões.'},
  {k:'semana',ic:'calendar',n:'Semana',d:'Uma coluna por dia, com tarefas.'},
  {k:'jornal',ic:'file',n:'Edição do jornal',d:'Artigos, entrevistas, fotografias e fecho da edição.'}];
function mqmModelos(){mqmLimpaSel();openDrawer('Modelos de quadro',`<p class="mut">O modelo cria um quadro novo dentro de «${esc(mqQ(mqUI().q).nome||'')}».</p><div class="mqm-mods">${MQM_MODELOS.map(m=>`<button type="button" class="mqm-mod" data-mod="${m.k}">${ic(m.ic,20)}<b>${esc(m.n)}</b><small>${esc(m.d)}</small></button>`).join('')}</div>`);
  $$('#dw-b [data-mod]').forEach(b=>b.onclick=()=>{closeDrawer();mqmAplicar(b.dataset.mod)})}
function mqmAplicar(k){const m=MQM_MODELOS.find(x=>x.k===k);if(!m)return;const q=mqQ(mqUI().q);const p=mqCentro();
  const card=mqNovo('quadro',p.x-75,p.y-60,{nome:m.n});const nq=MQ().find(x=>x.id===card.ref);if(!nq)return;nq.nome=m.n;
  const its=nq.itens,set=nq.setas;const add=(t,x,y,o)=>{const it=Object.assign({id:uid(),t,x,y,w:{nota:240,tarefa:250,link:250,coluna:270,titulo:420,comentario:240}[t]||240,cor:'',pai:null},o||{});its.push(it);return it};
  const N=(x,y,txt,o)=>add('nota',x,y,Object.assign({txt},o));const T=(x,y,tit,l,o)=>add('tarefa',x,y,Object.assign({tit,l:l.map(t=>({t,f:false}))},o));
  const C=(x,y,tit,filhos,o)=>{const c=add('coluna',x,y,Object.assign({tit},o));(filhos||[]).forEach((f,n)=>{const it=typeof f==='string'?add('nota',0,0,{txt:f}):add(f.t,0,0,f);it.pai=c.id;it.o=n});return c};
  const S_=(a,b)=>set.push({id:uid(),de:a.id,para:b.id});const H=(x,y,txt)=>add('titulo',x,y,{txt});
  const cm=(x,y,txt)=>add('comentario',x,y,{txt,aut:S.cfg.professor||'Professor',qd:Date.now(),resp:[]});
  if(k==='aula'){H(0,0,'Plano de aula');N(0,80,'<h3>Identificação</h3>Turma:<br>Disciplina/UFCD:<br>Data:<br>Duração: 50 min');N(270,80,'<h3>Objetivos</h3><ul><li>…</li><li>…</li></ul>',{cor:'#4ade80'});N(540,80,'<h3>Sumário</h3>…');
    T(0,290,'Atividades',['Aquecimento (5 min)','Exposição (15 min)','Trabalho em pares (20 min)','Síntese (10 min)']);C(270,290,'Recursos',['Fichas de trabalho','Projetor e colunas']);N(540,290,'<h3>Avaliação</h3>Observação direta e grelha de registo',{cor:'#fb923c'})}
  else if(k==='projeto'){H(0,0,'Plano de projeto');C(0,80,'A fazer',['Definir objetivos','Recolher materiais','Marcar reunião'],{cor:'#facc15'});C(300,80,'Em curso',['<b>Rascunho do relatório</b><br>Falta a introdução'],{cor:'#60a5fa'});C(600,80,'Feito',[{t:'tarefa',tit:'Preparação',l:[{t:'Escolher o tema',f:true},{t:'Validar com o orientador',f:true}]}],{cor:'#4ade80'});cm(900,90,'Arraste os cartões entre colunas à medida que o projeto avança.')}
  else if(k==='visita'){H(0,0,'Visita de estudo');N(0,80,'<h3>Saída</h3>Data:<br>Hora: 8h30, portão principal<br>Regresso:',{cor:'#60a5fa'});const a=T(0,260,'Antes de partir',['Autorizações dos encarregados de educação','Reservar transporte','Guião de observação','Lanche']);
    C(290,80,'Grupos',['Grupo 1 —','Grupo 2 —','Grupo 3 —']);const g=N(580,80,'<h3>Guião</h3>O que observar e registar em cada paragem');N(580,260,'<h3>Contactos</h3>Professor responsável:<br>Local a visitar:',{cor:'#fb923c'});S_(a,g)}
  else if(k==='reuniao'){H(0,0,'Reunião');N(0,80,'<h3>Ordem de trabalhos</h3><ol><li>…</li><li>…</li><li>Outros assuntos</li></ol>',{cor:'#60a5fa'});N(270,80,'<h3>Notas</h3>…');C(540,80,'Decisões',['…']);T(270,280,'Próximos passos',['Enviar a ata','…'])}
  else if(k==='brain'){const c=N(330,230,'<h3>Ideia central</h3>',{cor:'#4ade80'});[[0,40],[660,40],[0,420],[660,420],[330,0],[330,460]].forEach(([x,y],n)=>S_(c,N(x,y,'Ideia '+(n+1),{w:200})))}
  else if(k==='pesquisa'){H(0,0,'Pesquisa');N(0,80,'<h3>Pergunta de investigação</h3>…',{w:540,cor:'#a78bfa'});C(0,220,'Fontes',['Livro: autor, título, ano']);C(300,220,'Notas',['Ideia importante (com a fonte)']);const f=N(600,220,'<h3>Conclusões</h3>…',{cor:'#4ade80'});S_(its.find(i=>i.tit==='Notas'),f)}
  else if(k==='semana'){H(0,0,'Semana');['Segunda','Terça','Quarta','Quinta','Sexta'].forEach((d,n)=>C(n*290,80,d,[{t:'tarefa',tit:'',l:[{t:'',f:false}]}],{w:270}))}
  else if(k==='jornal'){H(0,0,'Edição do jornal');N(0,80,'<h3>Edição n.º</h3>Fecho da edição:',{cor:'#facc15'});C(290,80,'Artigos',['Notícia de capa','Reportagem']);C(580,80,'Entrevistas',['Pessoa a entrevistar —']);C(870,80,'Fotografias',['Fotografias da atividade']);T(0,260,'Fecho',['Rever textos','Escolher a capa','Paginar'])}
  save();mqAbrir(nq.id);setTimeout(()=>{const b=$('#mq-zf');b&&b.click()},80)}

/* ---------- setas com etiqueta, tracejado, pontas, cor e curva ---------- */
mqSetas=function(){const svg=$('#mq-svg');if(!svg)return;const q=mqQ(mqUI().q),u=mqUI();svg.querySelectorAll('g').forEach(g=>g.remove());
  const borda=(R,px,py)=>{const cx=R.x+R.w/2,cy=R.y+R.h/2,dx=px-cx,dy=py-cy;if(!dx&&!dy)return {x:cx,y:cy};const s=Math.min(Math.abs((R.w/2+6)/(dx||1e-9)),Math.abs((R.h/2+6)/(dy||1e-9)));return {x:cx+dx*s,y:cy+dy*s}};
  const ponta=(f,t,cor)=>{const dx=t.x-f.x,dy=t.y-f.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,s=10;return `<path class="pt" d="M${t.x} ${t.y}L${t.x-ux*s-uy*s*.55} ${t.y-uy*s+ux*s*.55}L${t.x-ux*s+uy*s*.55} ${t.y-uy*s-ux*s*.55}Z" style="fill:${cor}"/>`};
  q.setas=q.setas.filter(s=>mqItem(q,s.de)&&mqItem(q,s.para));
  q.setas.forEach(s=>{const a=$(`[data-mq="${s.de}"]`),b=$(`[data-mq="${s.para}"]`);if(!a||!b)return;const A_=mqRectW(a),B_=mqRectW(b);const cA={x:A_.x+A_.w/2,y:A_.y+A_.h/2},cB={x:B_.x+B_.w/2,y:B_.y+B_.h/2};
    const k=s.cv==null?.12:s.cv;const mx0=(cA.x+cB.x)/2,my0=(cA.y+cB.y)/2,dx0=cB.x-cA.x,dy0=cB.y-cA.y;const ctl={x:mx0-dy0*k,y:my0+dx0*k};
    const p1=borda(A_,ctl.x,ctl.y),p2=borda(B_,ctl.x,ctl.y);const mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2,dx=p2.x-p1.x,dy=p2.y-p1.y,cx=mx-dy*k,cy=my+dx*k;const d=`M${p1.x} ${p1.y} Q${cx} ${cy} ${p2.x} ${p2.y}`;
    const on=u.selSeta===s.id;const cor=on?'var(--acc)':(s.cor||'currentColor');const pt=s.pt||'fim';
    const g=document.createElementNS(MQM_SVG,'g');g.setAttribute('class','mq-seta'+(on?' sel':''));g.dataset.seta=s.id;
    let h=`<path class="hit" d="${d}"/><path class="ln" d="${d}" style="stroke:${cor}${s.tr?';stroke-dasharray:7 6':''}"/>`;
    if(pt==='fim'||pt==='ambas')h+=ponta({x:cx,y:cy},p2,cor);if(pt==='ambas')h+=ponta({x:cx,y:cy},p1,cor);
    if(s.et){const hx=.25*p1.x+.5*cx+.25*p2.x,hy=.25*p1.y+.5*cy+.25*p2.y,w=Math.min(220,s.et.length*7+18);h+=`<g class="mqm-et"><rect x="${hx-w/2}" y="${hy-11}" width="${w}" height="22"/><text x="${hx}" y="${hy+4}" text-anchor="middle">${esc(s.et.length>30?s.et.slice(0,29)+'…':s.et)}</text></g>`}
    g.innerHTML=h;svg.appendChild(g);g.onpointerdown=e=>{e.stopPropagation();u.sel=[];u.selSeta=s.id;mqRender()};g.ondblclick=e=>{e.stopPropagation();mqmEtiqueta(s)}})};
function mqmEtiqueta(s){const v=prompt('Etiqueta da seta (vazio para tirar):',s.et||'');if(v==null)return;mqAntes();s.et=v.trim();save();mqRender()}
const _mqmCtx=mqCtx;
mqCtx=function(){const r=_mqmCtx.apply(this,arguments);try{const box=$('#mq-ctx');const u=mqUI(),q=mqQ(u.q);if(!box||_mqEd)return r;
  if(u.sel.length)u.selSeta=null;const seta=u.selSeta&&q.setas.find(s=>s.id===u.selSeta);const its=u.sel.map(id=>mqItem(q,id)).filter(Boolean);
  if(seta&&!its.length){const pt=seta.pt||'fim',cv=seta.cv==null?.12:seta.cv;
    box.innerHTML=`<span class="mq-cs">${MQ_CORES.map(c=>`<button type="button" data-sc="${c}" class="${(seta.cor||'')===c?'on':''}" style="${c?'background:'+c:''}" title="${c?'Cor':'Cor normal'}">${c?'':'×'}</button>`).join('')}</span>
      <button type="button" class="btn sm ghost" data-sa="et" title="Etiqueta (duplo clique na seta)">${ic('tag',14)} Etiqueta</button>
      <button type="button" class="btn sm ghost${seta.tr?' on':''}" data-sa="tr" title="Linha tracejada">┄</button>
      <button type="button" class="btn sm ghost" data-sa="pt" title="Pontas: ${pt==='fim'?'só no fim':pt==='ambas'?'nas duas pontas':'sem pontas'}">${pt==='fim'?'→':pt==='ambas'?'↔':'—'}</button>
      <button type="button" class="btn sm ghost" data-sa="cv" title="Curva">${cv>0?'⌒':cv<0?'⌣':'／'}</button>
      <button type="button" class="btn sm ghost" data-sa="inv" title="Inverter o sentido">⇄</button>
      <button type="button" class="btn sm ghost dng" data-sa="del" title="Apagar a seta">${ic('trash',14)}</button>`;
    box.hidden=false;
    box.querySelectorAll('[data-sc]').forEach(b=>b.onclick=()=>{mqAntes();seta.cor=b.dataset.sc;save();mqRender()});
    box.querySelectorAll('[data-sa]').forEach(b=>b.onclick=()=>{const a=b.dataset.sa;if(a==='et')return mqmEtiqueta(seta);if(a==='del')return mqApagar();mqAntes();
      if(a==='tr')seta.tr=!seta.tr;if(a==='pt')seta.pt=pt==='fim'?'ambas':pt==='ambas'?'nenhuma':'fim';if(a==='cv')seta.cv=cv>0?0:cv===0?-.12:.12;if(a==='inv'){const d_=seta.de;seta.de=seta.para;seta.para=d_}save();mqRender()});
    return r}
  if(its.length===1&&!its[0].pai&&!box.querySelector('[data-ca3]')){const fr=box.querySelector('[data-ca="frente"]');const h=`<button type="button" class="btn sm ghost" data-ca3 title="Enviar para trás">${ic('layers',14)}<span class="mqm-tras">↓</span></button>`;
    fr?fr.insertAdjacentHTML('afterend',h):box.insertAdjacentHTML('beforeend',h);box.querySelector('[data-ca3]').onclick=()=>{mqAntes();q.itens=[its[0]].concat(q.itens.filter(i=>i!==its[0]));save();mqRender()}}
  }catch(_){}return r};
/* setas apagadas com o botão do menu: mqApagar já trata setas selecionadas; se não tratar, apaga aqui */
const _mqmApagar=mqApagar;
mqApagar=function(){const u=mqUI(),q=mqQ(u.q);if(u.selSeta&&!u.sel.length){mqAntes();q.setas=q.setas.filter(s=>s.id!==u.selSeta);u.selSeta=null;save();mqRender();return}return _mqmApagar.apply(this,arguments)};
/* a seleção de uma seta desaparece ao tocar fora dela; Delete apaga-a */
document.addEventListener('pointerdown',e=>{const cv=$('#mq-cv');if(!cv)return;const u=mqUI();if(!u.selSeta||e.target.closest('.mq-seta,#mq-ctx'))return;u.selSeta=null;requestAnimationFrame(()=>{mqSetas();mqCtx()})},true);
document.addEventListener('keydown',e=>{const cv=$('#mq-cv');if(!cv||_mqEd)return;const u=mqUI();if(!u.selSeta||u.sel.length)return;const a=document.activeElement;if(a&&a.closest&&a.closest('input,textarea,[contenteditable=true]'))return;if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();mqApagar()}else if(e.key==='Escape'){u.selSeta=null;mqSetas();mqCtx()}},true);

/* ---------- mover elementos para dentro de um quadro (largar em cima do cartão) ---------- */
function mqmMover(ids,destId){const u=mqUI(),q=mqQ(u.q);const dst=MQ().find(x=>x.id===destId);if(!dst||dst.id===q.id)return false;
  const mov=ids.map(id=>mqItem(q,id)).filter(i=>i&&!i.pai);
  /* não deixa meter um quadro dentro dele próprio ou de um descendente */
  const refs=new Set(mov.filter(i=>i.t==='quadro').map(i=>i.ref));let a=dst,n=0;while(a&&n++<40){if(refs.has(a.id)){toast('Não pode pôr um quadro dentro dele próprio','erro');return false}a=a.pai?MQ().find(x=>x.id===a.pai):null}
  if(!mov.length)return false;mqAntes();
  const todos=new Set(mov.map(i=>i.id));q.itens.forEach(i=>{if(i.pai&&todos.has(i.pai))todos.add(i.id)});
  const minx=Math.min(...mov.map(i=>i.x)),miny=Math.min(...mov.map(i=>i.y));const fundo=dst.itens.filter(i=>!i.pai).reduce((m,i)=>Math.max(m,i.y+160),0);
  const passa=q.itens.filter(i=>todos.has(i.id));passa.forEach(i=>{if(!i.pai){i.x=Math.round(i.x-minx+40);i.y=Math.round(i.y-miny+(dst.itens.length?fundo+40:40))}if(i.t==='quadro'){const s=MQ().find(x=>x.id===i.ref);if(s)s.pai=dst.id}});
  q.itens=q.itens.filter(i=>!todos.has(i.id));dst.itens.push(...passa);
  const ficam=[];q.setas.forEach(s=>{const a1=todos.has(s.de),b1=todos.has(s.para);if(a1&&b1)dst.setas.push(s);else if(!a1&&!b1)ficam.push(s)});q.setas=ficam;
  u.sel=[];save();mqRender();toast(`${passa.length===1?'1 elemento movido':passa.length+' elementos movidos'} para «${dst.nome||'quadro'}»`,'ok');return true}
let _mqmArr=null;
const _mqmItensBind=mqItensBind;
mqItensBind=function(){const r=_mqmItensBind.apply(this,arguments);try{
  $$('#mq-its .mq-it').forEach(el=>el.addEventListener('pointerdown',e=>{if(e.button>0||_mqLig||e.target.closest('input,textarea,a,button,select,audio,video,[contenteditable=true],label.mq-sw,[data-rz]'))return;
    const u=mqUI(),id=el.dataset.mq;const ids=u.sel.includes(id)?u.sel.slice():[id];_mqmArr={x0:e.clientX,y0:e.clientY,ids,alvo:null,mov:false}}))}catch(_){}return r};
addEventListener('pointermove',e=>{const d=_mqmArr;if(!d)return;if(!d.mov&&Math.hypot(e.clientX-d.x0,e.clientY-d.y0)<6)return;d.mov=true;
  let alvo=null;for(const n of document.elementsFromPoint(e.clientX,e.clientY)){const c=n.closest&&n.closest('.mq-it.mq-quadro');if(c&&!d.ids.includes(c.dataset.mq)){alvo=c;break}}
  if(d.alvo!==alvo){d.alvo&&d.alvo.classList.remove('mqm-alvo');alvo&&alvo.classList.add('mqm-alvo');d.alvo=alvo}},true);
addEventListener('pointerup',e=>{const d=_mqmArr;_mqmArr=null;if(!d||!d.mov||!d.alvo)return;const qid=d.alvo.dataset.mq;d.alvo.classList.remove('mqm-alvo');
  /* corre depois do pointerup do cartão (que guarda a posição) */
  setTimeout(()=>{try{const q=mqQ(mqUI().q),it=mqItem(q,qid);if(it&&it.t==='quadro')mqmMover(d.ids,it.ref)}catch(_){}},0)});
addEventListener('pointercancel',()=>{if(_mqmArr&&_mqmArr.alvo)_mqmArr.alvo.classList.remove('mqm-alvo');_mqmArr=null});

/* ---------- copiar, cortar e colar elementos ---------- */
let _mqmClip=null;
const mqmNoQuadro=e=>{const cv=$('#mq-cv');if(!cv||_mqEd)return false;const a=document.activeElement;if(a&&a.closest&&a.closest('input,textarea,[contenteditable=true]'))return false;return !!(a&&cv.contains(a))||a===document.body};
function mqmCopia(){const u=mqUI(),q=mqQ(u.q);const top=u.sel.map(id=>mqItem(q,id)).filter(i=>i&&!i.pai&&i.t!=='quadro');if(!top.length)return null;
  const ids=new Set(top.map(i=>i.id));q.itens.forEach(i=>{if(i.pai&&ids.has(i.pai))ids.add(i.id)});
  const its=JSON.parse(JSON.stringify(q.itens.filter(i=>ids.has(i.id))));const setas=JSON.parse(JSON.stringify(q.setas.filter(s=>ids.has(s.de)&&ids.has(s.para))));
  const tx=top.map(i=>mqmTexto(i)).filter(Boolean).join('\n\n')||'SpruceNote';_mqmClip={ctx:UI.mqCtx,its,setas,tx:tx.trim()};return _mqmClip}
function mqmColar(){const c=_mqmClip;if(!c)return;const q=mqQ(mqUI().q);mqAntes();const map={};c.its.forEach(i=>map[i.id]=uid());
  const top=c.its.filter(i=>!i.pai);const minx=Math.min(...top.map(i=>i.x)),miny=Math.min(...top.map(i=>i.y));const p=mqCentro();const mesmo=c.its.every(i=>mqItem(q,i.id));
  const nv=c.its.map(i=>{const n=JSON.parse(JSON.stringify(i));n.id=map[i.id];if(n.pai)n.pai=map[n.pai]||null;else if(mesmo){n.x+=30;n.y+=30}else{n.x=Math.round(n.x-minx+p.x-100);n.y=Math.round(n.y-miny+p.y-60)}return n});
  q.itens.push(...nv);c.setas.forEach(s=>q.setas.push(Object.assign({},s,{id:uid(),de:map[s.de],para:map[s.para]})));
  c.its.forEach(i=>{if(mesmo&&!i.pai){i.x+=30;i.y+=30}});mqUI().sel=nv.filter(i=>!i.pai).map(i=>i.id);save();mqRender()}
document.addEventListener('copy',e=>{if(!mqmNoQuadro(e)||String(getSelection()||''))return;const c=mqmCopia();if(!c)return;e.preventDefault();try{e.clipboardData.setData('text/plain',c.tx)}catch(_){}toast('Copiado','ok')},true);
document.addEventListener('cut',e=>{if(!mqmNoQuadro(e)||String(getSelection()||''))return;const c=mqmCopia();if(!c)return;e.preventDefault();try{e.clipboardData.setData('text/plain',c.tx)}catch(_){}mqApagar()},true);
document.addEventListener('paste',e=>{if(!_mqmClip||!mqmNoQuadro(e))return;const F=e.clipboardData&&e.clipboardData.files;if(F&&F.length)return;const t=((e.clipboardData&&e.clipboardData.getData('text/plain'))||'').trim();
  if(t&&t!==_mqmClip.tx)return;/* o que está na área de transferência é outra coisa: a app trata como sempre */e.preventDefault();e.stopImmediatePropagation();mqmColar()},true);
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=='f')return;const cv=$('#mq-cv');if(!cv||!cv.offsetParent)return;const a=document.activeElement;if(a&&a.closest&&a.closest('input,textarea,[contenteditable=true]')&&!cv.contains(a))return;e.preventDefault();mqmPesquisa()},true);

/* ---------- botões no topo do quadro ---------- */
const _mqmVista=mqVista;
mqVista=function(){const r=_mqmVista.apply(this,arguments);try{const top=$('#mq .mq-top'),amp=$('#mq-amp');if(top&&!$('#mqm-pq')){const h=`<button class="btn sm ghost" id="mqm-pq" title="Pesquisar em todos os quadros (Ctrl+F)">${ic('search',14)}<span class="mqm-l"> Pesquisar</span></button><button class="btn sm ghost" id="mqm-md" title="Modelos de quadro">${ic('layers',14)}<span class="mqm-l"> Modelos</span></button><button class="btn sm ghost" id="mqm-tx" title="Copiar o quadro como texto (Markdown)">${ic('copy',14)}<span class="mqm-l"> Texto</span></button>`;
    amp?amp.insertAdjacentHTML('beforebegin',h):top.insertAdjacentHTML('beforeend',h);$('#mqm-pq').onclick=mqmPesquisa;$('#mqm-md').onclick=mqmModelos;$('#mqm-tx').onclick=mqmExportar}}catch(_){}return r};
