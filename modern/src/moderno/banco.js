/* ===================== Banco por ano letivo — Forms, Arena e Pulso =====================
   Cada teste/formulário (Forms), conjunto de perguntas (Arena) e quiz (Pulso) pertence a um ano letivo.
   A lista de cada módulo mostra só os do ano letivo aberto; o «Banco» mostra os dos outros anos (por ano ou por título)
   e reutiliza-os no ano aberto (cópia limpa: sem respostas, sessões nem ligações à avaliação). */
const bcAnoNome=()=>(A()||{}).nome||anoAuto();
const bcAnoDeData=ts=>{const d=new Date(ts||Date.now());const y0=d.getMonth()>=8?d.getFullYear():d.getFullYear()-1;const a=(S.anos||[]).find(a=>String(a.nome||'').replace(/\D/g,'').startsWith(String(y0)));return a?a.nome:y0+'/'+(y0+1)};
/* itens sem ano: os acabados de criar ficam no ano aberto; os antigos, no ano letivo da data em que foram criados */
function bcMarcar(L){let m=0;(L||[]).forEach(x=>{if(x&&!x.ano){x.ano=(Date.now()-(+x.criado||0)<120000)?bcAnoNome():bcAnoDeData(x.criado);m++}});if(m)save();return L}
const bcDoAno=L=>bcMarcar(L).filter(x=>x.ano===bcAnoNome());
const BC_MOD={
  forms:{tit:'Banco de Testes e Formulários',um:'teste ou formulário',pl:'testes e formulários',lista:()=>FMS(),nome:x=>x.titulo,tipo:x=>x.quiz?'Teste':'Formulário',info:x=>fmPerg(x).length+' perguntas'+(x.quiz?' · '+nf(fmPts(x))+' pts':'')+' · '+x.resp.length+' respostas',
    copia:x=>{const c=JSON.parse(JSON.stringify(x));Object.assign(c,{id:uid(),resp:[],sess:[],assoc:[],ligacao:{},publicado:false,notasPub:null,criado:Date.now(),alterado:Date.now()});FMS().unshift(c);return c},
    abre:c=>{UI.fmId=c.id;UI.fmTab='perg';go('forms')}},
  arena:{tit:'Banco de Perguntas e Jogos',um:'conjunto de perguntas',pl:'conjuntos de perguntas',lista:()=>arD().conj,nome:x=>x.nome,tipo:x=>x.disc||'Conjunto',info:x=>(x.perg||[]).length+' perguntas'+(x.tema?' · '+x.tema:''),
    copia:x=>{const c=JSON.parse(JSON.stringify(x));Object.assign(c,{id:uid(),turma:'',criado:Date.now(),mod:Date.now()});arD().conj.unshift(c);return c},
    abre:c=>{UI.arTab='conj';UI.arEd=c.id;go('arena')}},
  pulso:{tit:'Banco de Quizzes',um:'quiz',pl:'quizzes',lista:()=>puD().quiz,nome:x=>x.nome,tipo:x=>x.disc||'Quiz',info:x=>(x.perg||[]).length+' perguntas'+(x.pasta?' · '+x.pasta:''),
    copia:x=>{const c=JSON.parse(JSON.stringify(x));Object.assign(c,{id:uid(),criado:Date.now(),mod:Date.now()});delete c.partilha;puD().quiz.unshift(c);return c},
    abre:c=>{UI.puTab='quiz';UI.puEd=c.id;go('pulso')}}};
function bcBanco(mod){const M=BC_MOD[mod];const atual=bcAnoNome();const todos=bcMarcar(M.lista());
  const anos=[...new Set(todos.map(x=>x.ano))].sort((a,b)=>b.localeCompare(a));const F=UI.bcF=UI.bcF&&UI.bcF.mod===mod?UI.bcF:{mod,ano:'',q:'',atual:false};
  const pinta=()=>{const q=normT(F.q||'');const L=todos.filter(x=>(F.atual||x.ano!==atual)&&(!F.ano||x.ano===F.ano)&&(!q||normT(M.nome(x)+' '+M.tipo(x)).includes(q)));
    const G={};L.forEach(x=>(G[x.ano]=G[x.ano]||[]).push(x));const ks=Object.keys(G).sort((a,b)=>b.localeCompare(a));
    $('#bc-l').innerHTML=ks.length?ks.map(a=>`<h3 class="bcano">${esc(a)}${a===atual?' <span class="mut">(este ano)</span>':''} <span class="mut">· ${G[a].length}</span></h3>${G[a].map(x=>`<div class="bci"><div class="bcin"><b>${esc(M.nome(x)||'(sem título)')}</b><span class="mut">${esc(M.tipo(x))} · ${esc(M.info(x))}${x.criado?' · '+new Date(x.criado).toLocaleDateString('pt-PT'):''}</span></div><button class="btn sm pri" data-bcr="${x.id}">${ic('copy',13)} Reutilizar em ${esc(atual)}</button></div>`).join('')}`).join('')
      :`<div class="empty" style="padding:18px">${todos.some(x=>x.ano!==atual)?'Nada encontrado com estes filtros.':'Ainda não há '+M.pl+' de outros anos letivos.'}</div>`;
    $$('[data-bcr]').forEach(b=>b.onclick=()=>{const x=todos.find(y=>y.id===b.dataset.bcr);const c=M.copia(x);c.ano=atual;if(mod!=='forms')c.nome=c.nome;save();closeDrawer();toast('«'+(M.nome(c)||'')+'» copiado para '+atual,'ok');try{audit('Banco','Reutilizado de '+x.ano,M.nome(x)+' → '+atual)}catch(_){}M.abre(c)})};
  openDrawer(M.tit,`<div class="ed"><p class="hint" style="margin-top:0">Os ${M.pl} de todos os anos letivos. Escolha um e toque em <b>Reutilizar</b>: fica uma cópia em ${esc(atual)} para editar e usar (sem respostas nem resultados do ano em que foi feito).</p>
    <div class="row" style="gap:8px;flex-wrap:wrap"><input id="bc-q" type="search" placeholder="Procurar por título" value="${esc(F.q)}" style="flex:1 1 220px"><select id="bc-a" style="flex:0 1 200px"><option value="">Todos os anos letivos</option>${anos.map(a=>`<option ${F.ano===a?'selected':''}>${esc(a)}</option>`).join('')}</select></div>
    <label class="chk" style="margin:8px 0 4px"><input type="checkbox" id="bc-at" ${F.atual?'checked':''}> <span>Mostrar também os de ${esc(atual)}</span></label>
    <div id="bc-l" class="bcl"></div></div>`);
  $('#bc-q').oninput=e=>{F.q=e.target.value;pinta()};$('#bc-a').onchange=e=>{F.ano=e.target.value;if(F.ano===atual)F.atual=true,$('#bc-at').checked=true;pinta()};$('#bc-at').onchange=e=>{F.atual=e.target.checked;pinta()};pinta();setTimeout(()=>{const i=$('#bc-q');if(i)i.focus()},60)}
/* ---------- listas só do ano letivo aberto + botão do Banco ---------- */
{/* Forms: a lista usa FMS(); filtra-se no momento de desenhar a lista */
 const _vF=vForms;vForms=function(){const sv=S.forms;let r;if(!(UI.fmId&&FMS().find(x=>x.id===UI.fmId))){bcMarcar(FMS());const todos=S.forms;S.forms=todos.filter(x=>x.ano===bcAnoNome());try{r=_vF.apply(this,arguments)}finally{S.forms=todos}
   return r}return _vF.apply(this,arguments)};if(go._f)go._f.forms=vForms}
{const _vA=vArena;vArena=function(){if(UI.arEd||(UI.arTab||'conj')!=='conj')return _vA.apply(this,arguments);const d=arD();bcMarcar(d.conj);const todos=d.conj;d.conj=todos.filter(x=>x.ano===bcAnoNome());if(!d.conj.length)S.cfg.arenaEx=1;let r;try{r=_vA.apply(this,arguments)}finally{const novos=d.conj.filter(x=>!todos.includes(x));d.conj=[...novos,...todos]}
  bcBotaoBar('ar-bc','Banco',()=>bcBanco('arena'));return r};if(go._f)go._f.arena=vArena}
{const _vP=vPulso;vPulso=function(){if(UI.puEd||UI.puVivo||UI.puRel||(UI.puTab||'salas')!=='quiz')return _vP.apply(this,arguments);const d=puD();bcMarcar(d.quiz);const todos=d.quiz;d.quiz=todos.filter(x=>x.ano===bcAnoNome());if(!d.quiz.length)S.cfg.pulsoEx=1;let r;try{r=_vP.apply(this,arguments)}finally{const novos=d.quiz.filter(x=>!todos.includes(x));d.quiz=[...novos,...todos]}
  bcBotaoBar('pu-bc','Banco',()=>bcBanco('pulso'));return r};if(go._f)go._f.pulso=vPulso}
function bcBotaoBar(id,t,f){const x=document.getElementById('barx');if(!x||document.getElementById(id))return;const b=document.createElement('button');b.className='btn';b.id=id;b.innerHTML=ic('layers',15)+' '+t;b.onclick=f;const m=document.getElementById('barmais');x.insertBefore(b,x.firstChild&&x.firstChild.id!=='barmais'?x.firstChild:m)}
(()=>{const st=document.createElement('style');st.textContent=`.fmnv.bc{background:color-mix(in srgb,#038387 10%,var(--panel))}.fmnv.bc svg{color:#038387}
.bcl{display:flex;flex-direction:column;gap:6px;margin-top:6px}.bcano{margin:12px 0 2px;font-size:15px}.bci{display:flex;gap:10px;align-items:center;justify-content:space-between;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--panel)}
.bcin{display:flex;flex-direction:column;gap:2px;min-width:0}.bcin b{overflow-wrap:anywhere}@media (max-width:600px){.bci{flex-direction:column;align-items:stretch}}`;document.head.appendChild(st)})();
try{AJUDA.push({id:'banco',ic:'layers',t:'Banco por ano letivo (Forms, Arena e Pulso)',gif:null,txt:`<p>Os testes e formulários do <b>Forms</b>, os conjuntos de perguntas da <b>Arena</b> e os quizzes do <b>Pulso</b> pertencem ao ano letivo em que foram feitos; cada lista mostra só os do ano letivo aberto.</p><ul><li>Toque em <b>Banco</b> (no Forms, no cartão ao lado de Novo Teste; na Arena e no Pulso, no cabeçalho) para ver os dos outros anos letivos.</li><li>Procure por <b>título</b> ou escolha o <b>ano letivo</b>; marque «Mostrar também os deste ano» para ver tudo.</li><li><b>Reutilizar</b> copia para o ano letivo aberto, pronto a editar: sem respostas, resultados, sessões nem ligações à avaliação do ano original.</li></ul>`})}catch(_){}
