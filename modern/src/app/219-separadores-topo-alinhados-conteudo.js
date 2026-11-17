/* ===================== v0.990 · separadores do topo alinhados com o conteúdo que vem por baixo (ecrãs largos) ===================== */
function alinharTabsTopo(){const v=document.getElementById('view');if(!v)return;const t=v.querySelector(':scope>.tabs,:scope>.deftabs');if(!t)return;t.style.removeProperty('margin-left');
  let n=t.nextElementSibling;while(n&&(n.matches('input,script,style,template')||!n.getBoundingClientRect().width))n=n.nextElementSibling;if(!n||!n.matches('.vlay,.card,.kpis,.mtlay,.inlay,.anv,.cmw,.nvpw2,div,section'))return;const vr=v.getBoundingClientRect(),nr=n.getBoundingClientRect();if(!nr.width)return;
  const d=nr.left-vr.left-(parseFloat(getComputedStyle(v).paddingLeft)||0);t.style.setProperty('margin-left',Math.max(0,Math.round(d))+'px','important')}
{let _at=0;const q=()=>{cancelAnimationFrame(_at);_at=requestAnimationFrame(()=>{try{alinharTabsTopo()}catch(_){}})};const v=document.getElementById('view');if(v)new MutationObserver(q).observe(v,{childList:true});addEventListener('resize',q)}
/* v0.990 · desempenho: o alinhamento do cabeçalho junta as chamadas repetidas num só cálculo e não se repete se nada mudou */
{const assin=()=>{const b=document.getElementById('bar');if(!b)return '';return b.clientWidth+'|'+b.textContent.length+'|'+b.querySelectorAll('button:not([hidden])').length+'|'+document.body.classList.contains('dev-pc')};
  const _alb=alinharBar;let ka='',fila=0;const kAl=()=>{const v=document.getElementById('view');const f=v&&v.firstElementChild;return VIEW+'|'+(v?v.clientWidth:0)+'|'+(v?v.children.length:0)+'|'+(f?f.className:'')+'|'+assin()};
  alinharBar=function(){if(fila)return;fila=requestAnimationFrame(()=>{fila=0;const k=kAl();if(k===ka)return;try{_alb()}catch(e){console.warn(e)}ka=kAl()})}}
/* v0.992 · Produção Oral: organização individual / pares / grupos, formação pelo sorteio (aleatória ou equilibrada pela nota da PO) e guiões A/B */
function oralOrg(o){o.orgI=o.orgI||{};const k=oralKey(o)||'_proprio';const g=o.orgI[k]=o.orgI[k]||{};if(!g.modo)g.modo='ind';if(!(g.n>=3))g.n=3;if(!g.form)g.form='aleat';if(!g.gui)g.gui='aleat';return g}
/* nota de referência para equilibrar: média do domínio da oralidade nos períodos já avaliados; se não houver, média dos outros momentos orais */
function oralNotaRef(t,aid){const d=domOral(t);let v=[];if(d)for(let p=1;p<=4;p++){const x=domPer(t,aid,d.id,p);if(x!=null)v.push(x)}
  if(!v.length){const o=oralM(t);const k0=oralKey(o);oralMomentos(t).forEach(m=>{if(m.k===k0)return;const tt=oralTotK(t,m.k,aid);const c=oralCfgDe(o,m.k);if(tt&&tt.completo&&c.total)v.push(100*tt.pts/c.total)})}
  return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
const _bar=A=>{const B=A.slice();for(let i=B.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[B[i],B[j]]=[B[j],B[i]]}return B};
/* formação equilibrada: ordena pela nota e divide em faixas (boas → fracas); cada par/grupo leva um aluno de cada faixa */
function oralEquilibrar(t,AL,n){const com=AL.map(a=>({a,v:oralNotaRef(t,a.id)}));const sem=_bar(com.filter(x=>x.v==null)).map(x=>x.a);
  const ord=_bar(com.filter(x=>x.v!=null)).sort((x,y)=>y.v-x.v).map(x=>x.a);const mid=Math.floor(ord.length/2);const L=[...ord.slice(0,mid),...sem,...ord.slice(mid)];
  const k=Math.max(1,Math.floor(L.length/n));const G=Array.from({length:k},()=>[]);
  for(let b=0;b<n;b++){const faixa=_bar(L.slice(b*k,b*k+k));faixa.forEach((a,i)=>G[i].push(a))}
  const resto=L.slice(n*k);resto.forEach((a,i)=>G[(Math.floor(k/2)+i)%k].push(a));return G}
/* guiões: em cada par/grupo, um A e um B (alternados, ao acaso); individual: metade A, metade B */
function oralGuioes(G){const m={};G.forEach(g=>{const ab=_bar(['A','B']);_bar(g).forEach((a,i)=>m[a.id]=ab[i%2])});/* no resultado, sempre do A para o B */G.forEach(g=>g.sort((x,y)=>(m[x.id]||'').localeCompare(m[y.id]||'')));return m}
function oralAplicar(t,o,org,G,gui){G.forEach((g,i)=>g.forEach(a=>{const r=o.regs[a.id]=o.regs[a.id]||{n:{}};r.p=i+1;/* o colega de par (indicador por baixo do nome) */if(g.length===2)r.par=g.find(x=>x!==a).id;else delete r.par}));if(gui)Object.entries(gui).forEach(([aid,g])=>{const r=o.regs[aid]=o.regs[aid]||{n:{}};r.g=g});save()}
function oralOrgCard(t,o,org,al){const seg=(nm,k,ops)=>`<div class="seg" role="group" aria-label="${nm}">${ops.map(([v,l])=>`<button type="button" data-oo="${k}|${v}" class="${org[k]===v?'on':''}">${l}</button>`).join('')}</div>`;
  const ind=org.modo==='ind';const nomeG=org.modo==='par'?'pares':'grupos';const temNotas=al.some(a=>oralNotaRef(t,a.id)!=null);const ng=new Set(al.map(a=>(o.regs[a.id]||{}).p).filter(Boolean)).size;
  return `<div class="card ororg"><div class="row" style="flex-wrap:wrap;gap:10px;align-items:center"><h2 style="margin:0">${ic('users',18)} Organização</h2><span class="tag">A classificação é sempre individual</span><span class="sp1"></span>${seg('Modalidade','modo',[['ind','Individual'],['par','Pares'],['grp','Grupos']])}${org.modo==='grp'?`<label class="mut" style="margin:0">de <input type="number" id="oo-n" min="3" max="8" value="${org.n}" style="width:60px" inputmode="numeric" aria-label="Alunos por grupo"> alunos</label>`:''}</div>
    <div class="ororgl">${ind?'':`<div><span class="oolab">Formação dos ${nomeG}</span>${seg('Formação','form',[['aleat','Aleatória'],['equil','Equilibrada pela nota da PO'],['manual','Manual']])}</div>`}
      <div><span class="oolab">Guiões A/B</span>${seg('Guiões','gui',[['aleat','Ao acaso'],['manual','Manual']])}</div></div>
    ${!ind&&org.form==='equil'?`<p class="hint">${temNotas?'Cada '+(org.modo==='par'?'par junta':'grupo junta')+' alunos com notas mais altas e mais baixas na Produção Oral (média dos períodos já avaliados).':'Ainda não há notas de Produção Oral: a formação fica aleatória até haver avaliações.'}</p>`:''}
    ${!ind&&org.form==='manual'?`<p class="hint">Escreva o número do ${org.modo==='par'?'par':'grupo'} de cada aluno na coluna «${org.modo==='par'?'Par':'Grupo'}» da ficha.</p>`:''}
    ${org.gui==='manual'?`<p class="hint">Escreva A ou B na coluna «Guião» da ficha.</p>`:`<p class="hint">Guiões ao acaso: ${ind?'metade da turma com o A e metade com o B':'em cada '+(org.modo==='par'?'par':'grupo')+' há um A e um B'}, sorteados com ${ind?'o botão abaixo':'os '+(org.modo==='par'?'pares':'grupos')}.</p>`}
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px">${!ind&&org.form!=='manual'?`<button type="button" class="btn pri" id="oo-sort">${ic('refresh',15)} Sortear ${nomeG} na roda</button><button type="button" class="btn" id="oo-rap">Formar sem animação</button>`:''}
      ${org.gui==='aleat'?`<button type="button" class="btn" id="oo-gui">${ic('refresh',15)} Sortear guiões${ind?'':' (nos '+nomeG+' atuais)'}</button>`:''}
      ${!ind&&ng?`<button type="button" class="btn" id="oo-lim">${ic('x',14)} Limpar ${nomeG}</button><span class="mut" style="align-self:center">${ng} ${ng===1?(org.modo==='par'?'par':'grupo'):nomeG} formado${ng===1?'':'s'}</span>`:''}</div></div>`}
function oralGruposAtuais(o,al){const M={};al.forEach(a=>{const p=(o.regs[a.id]||{}).p;if(p)(M[p]=M[p]||[]).push(a)});return Object.keys(M).sort((a,b)=>a-b).map(k=>M[k])}
function oralOrgLigar(t,o,org,al,re){
  $$('[data-oo]').forEach(b=>b.onclick=()=>{const [k,v]=b.dataset.oo.split('|');/* de Manual para Aleatória/Equilibrada: os pares feitos à mão são limpos */if(k==='form'&&org.form==='manual'&&v!=='manual'){let n=0;al.forEach(a=>{const x=o.regs[a.id];if(x&&(x.p||x.par)){delete x.p;delete x.par;n++}});if(n)toast((org.modo==='par'?'Pares':'Grupos')+' manuais limpos','ok')}org[k]=v;save();re()});
  const nn=$('#oo-n');if(nn)nn.onchange=()=>{org.n=Math.max(3,Math.min(8,+nn.value||3));save();re()};
  const n=org.modo==='par'?2:org.n;const formar=AL=>org.form==='equil'?oralEquilibrar(t,AL,n):rodaPartir(AL,n);
  const AV=()=>alunosAval(t).filter(a=>al.some(x=>x.id===a.id));
  const s=$('#oo-sort');if(s)s.onclick=()=>{let gui=null;rodaAbrir(t,AV().map(a=>a.id),{modo:org.modo==='par'?'pares':'grupos',n,formar,
      depois:G=>{gui=org.gui==='aleat'?oralGuioes(G):null},etiqueta:a=>gui&&gui[a.id]?`<em class="rdgu">Guião ${gui[a.id]}</em>`:'',
      destino:{t:'Usar na Produção Oral',fn:G=>{oralAplicar(t,o,org,G,gui);toast((org.modo==='par'?'Pares':'Grupos')+' guardados na ficha','ok');re()}}})};
  const r=$('#oo-rap');if(r)r.onclick=()=>{const G=formar(AV());oralAplicar(t,o,org,G,org.gui==='aleat'?oralGuioes(G):null);toast((org.modo==='par'?'Pares formados':'Grupos formados')+(org.gui==='aleat'?' e guiões sorteados':''),'ok');re()};
  const g=$('#oo-gui');if(g)g.onclick=()=>{const G=org.modo==='ind'?al.map(a=>[a]):oralGruposAtuais(o,al);if(!G.length)return toast('Forme primeiro os '+(org.modo==='par'?'pares':'grupos'),'aviso');
    let m;if(org.modo==='ind'){const ab=_bar(al).map((a,i)=>[a.id,i%2?'B':'A']);m=Object.fromEntries(ab)}else m=oralGuioes(G);oralAplicar(t,o,org,[],m);toast('Guiões sorteados','ok');re()};
  const l=$('#oo-lim');if(l)l.onclick=()=>{if(!confirm('Limpar os '+(org.modo==='par'?'pares':'grupos')+' deste momento? As classificações ficam.'))return;al.forEach(a=>{const x=o.regs[a.id];if(x){delete x.p;delete x.par}});save();re()};
  $$('[data-orp]').forEach(i=>i.onchange=()=>{const x=o.regs[i.dataset.orp]=o.regs[i.dataset.orp]||{n:{}};const v=parseInt(i.value,10);if(v>0)x.p=v;else delete x.p;save()});
  $$('[data-org]').forEach(i=>i.addEventListener('input',()=>{i.value=i.value.toUpperCase()}))}

/* v0.995 · Contactos: a barra das listas pode encolher (fica só com os ícones) */
function cmSbAplicar(){const w=document.getElementById('cm-w');if(!w)return;const sb=w.querySelector('.cmsb');if(!sb)return;
  const col=!!(S.cfg&&S.cfg.cmSbCol);w.classList.toggle('sbcol',col);
  sb.querySelectorAll('.cmli').forEach(b=>{if(!b.title){const sp=b.querySelector('span');if(sp)b.title=sp.textContent.trim()}});
  let t=sb.querySelector('.cmsbt');if(!t){t=document.createElement('button');t.type='button';t.className='cmsbt';sb.prepend(t);
    t.onclick=()=>{S.cfg=S.cfg||{};S.cfg.cmSbCol=!S.cfg.cmSbCol;try{save()}catch(_){}cmSbAplicar()}}
  t.innerHTML=ic('back',14)+(col?'':'<span>Encolher</span>');t.title=col?'Mostrar as listas':'Encolher a barra das listas';t.setAttribute('aria-label',t.title);t.setAttribute('aria-expanded',String(!col))}
{let _cmQ=0;new MutationObserver(()=>{if(_cmQ)return;_cmQ=requestAnimationFrame(()=>{_cmQ=0;const w=document.getElementById('cm-w');if(w&&(!w.querySelector('.cmsbt')||w.classList.contains('sbcol')!==!!(S.cfg&&S.cfg.cmSbCol)))cmSbAplicar()})}).observe(document.getElementById('view')||document.body,{childList:true,subtree:true})}
/* v1.004 · Tab (e Shift+Tab) anda de célula em célula nas tabelas de toda a app, saltando botões e caixas de seleção;
   se a tabela se redesenhar ao gravar, o cursor volta à célula certa */
{const CAMPO='input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=file]):not([type=hidden]):not([type=range]),select,textarea,[contenteditable=""],[contenteditable=true]';
  const campos=t=>[...t.querySelectorAll(CAMPO)].filter(x=>!x.disabled&&!x.readOnly&&x.offsetParent!==null&&x.closest('table,[role=grid]')===t);
  const assin=x=>{const d=[...x.attributes].filter(a=>/^data-|^name$|^id$/.test(a.name)).map(a=>a.name+'='+a.value).join('&');const tr=x.closest('tr');return d+'|'+(tr?[...tr.attributes].filter(a=>/^data-/.test(a.name)).map(a=>a.name+'='+a.value).join('&'):'')+'|'+(x.closest('td,th')?x.closest('td,th').cellIndex:'')};
  const marca=el=>{try{el.focus({preventScroll:false});if(el.select&&/^(text|number|search|tel|url|email|)$/.test(el.type||''))el.select();else if(el.isContentEditable){const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)}el.scrollIntoView({block:'nearest',inline:'nearest'})}catch(_){}};
  document.addEventListener('keydown',e=>{if(e.key!=='Tab'||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey)return;const cur=e.target;if(!cur||!cur.matches||!cur.matches(CAMPO))return;
    const t=cur.closest('table,[role=grid]');if(!t)return;const L=campos(t);const i=L.indexOf(cur);if(i<0)return;const j=i+(e.shiftKey?-1:1);const nx=L[j];if(!nx)return;
    e.preventDefault();const tabs=[...document.querySelectorAll('table,[role=grid]')];const ti=tabs.indexOf(t);const sg=assin(nx);marca(nx);
    /* muitas tabelas redesenham-se no «change» da célula anterior: voltar a encontrar a célula seguinte */
    const repor=()=>{if(nx.isConnected&&document.activeElement===nx)return;const a=document.activeElement;if(a&&a!==document.body&&a.isConnected&&a.matches&&a.matches(CAMPO)&&a!==cur)return;
      const T=[...document.querySelectorAll('table,[role=grid]')];const t2=T[ti]||T.find(x=>x.isConnected);if(!t2)return;const L2=campos(t2);const alvo=L2.find(x=>assin(x)===sg)||L2[j];if(alvo)marca(alvo)};
    setTimeout(repor,0);setTimeout(repor,60);setTimeout(repor,200);requestAnimationFrame(()=>requestAnimationFrame(repor))},false)}

/* 1.015 · cabeçalho: quando as ações da barra mudam (ex.: dentro do mesmo ecrã), volta a medir; «Mais» só quando não cabem */
{const x=document.getElementById('barx');if(x){let t=0;new MutationObserver(M=>{if(M.every(m=>[...m.addedNodes,...m.removedNodes].every(n=>n.id==='barmais')))return;clearTimeout(t);t=setTimeout(()=>{try{alinharBar()}catch(_){}},60)}).observe(x,{childList:true})}
 try{document.fonts&&document.fonts.ready.then(()=>{try{alinharBar()}catch(_){}})}catch(_){}
 document.addEventListener('load',e=>{if(e.target&&e.target.tagName==='IMG'&&e.target.closest&&e.target.closest('#bar')){clearTimeout(alinharBar._t);alinharBar._t=setTimeout(alinharBar,80)}},true)}
/* 1.015 · separadores numa só linha (Direção de Turma, fichas): encolhem o espaço, depois o texto, tiram os ícones e usam nomes curtos; só no fim deslizam */
const ABA_CURTO={'Encarregados de Educação':'Enc. Educação','Registo de Contactos':'Contactos','Convocatórias e Comunicações':'Convocatórias','Intervenções e Ocorrências':'Ocorrências','Conselhos de Turma':'Conselhos','Avaliação Intercalar':'Intercalar','Planos de Acompanhamento':'Planos','Histórico de Diligências':'Diligências','Informações Gerais':'Informações'};
function abasUmaLinha(){document.querySelectorAll('#view .dttabs,#view .fichatabs').forEach(el=>{const B=[...el.querySelectorAll(':scope>button')];if(!B.length)return;
  B.forEach(b=>{if(!b.dataset.lbl){const tn=[...b.childNodes].filter(n=>n.nodeType===3&&n.nodeValue.trim());const t=tn.map(n=>n.nodeValue).join('').trim();b.dataset.lbl=t;if(!b.title)b.title=t;tn.forEach((n,k)=>{if(k)n.remove()});if(tn[0]){const sp=document.createElement('span');sp.className='abl';sp.textContent=t;tn[0].replaceWith(sp)}}});
  const cabe=()=>el.scrollWidth<=el.clientWidth+1;el.classList.add('ab1l');[['flex-wrap','nowrap'],['overflow-x','auto'],['overflow-y','hidden'],['display','flex']].forEach(([k,v])=>el.style.setProperty(k,v,'important'));el.classList.remove('ab-a','ab-b','ab-c','ab-d');B.forEach(b=>{const s=b.querySelector('.abl');if(s)s.textContent=b.dataset.lbl});
  for(const c of ['ab-a','ab-b','ab-c']){if(cabe())return;el.classList.add(c)}
  if(cabe())return;B.forEach(b=>{const s=b.querySelector('.abl');if(s&&ABA_CURTO[b.dataset.lbl])s.textContent=ABA_CURTO[b.dataset.lbl]});if(!cabe())el.classList.add('ab-d')})}
{let t=0;const ag=()=>{clearTimeout(t);t=setTimeout(abasUmaLinha,30)};new MutationObserver(ag).observe(document.getElementById('view')||document.body,{childList:true});addEventListener('resize',ag);
 const _gAb=go;go=function(){const r=_gAb.apply(this,arguments);ag();return r}}
/*V0990-FIM*/
/* 1.021 · FCT e momentos da PAP: definidos em cada curso (Editar Turma); aparecem no calendário escolar só se algum curso os tiver */
const FP_M=[['fct','Formação em Contexto de Trabalho (FCT)','#2e7d32'],['ante','Anteprojeto da PAP','#7a4fd0'],['m1','1.º momento da PAP','#1e6fd9'],['m2','2.º momento da PAP','#0f8b8d'],['pap','Prova de Aptidão Profissional (PAP)','#c0392b']];
const fpCfg=(a,nome)=>{const k=normTurma(nome);const o=turmaDM(a)[k]=turmaDM(a)[k]||{};return o.pap=o.pap||{}};
function fpEventos(a){if(!a)return [];const ea=escAtiva();const vis=new Set();const E=[];
  a.turmas.filter(t=>ehModular(t)&&tipoEscola(escolaDe(t))==='profissional'&&escId(escolaDe(t))===ea).forEach(t=>{const k=normTurma(t.nome);if(vis.has(k))return;vis.add(k);const P=((turmaDM(a)[k]||{}).pap)||{};
    FP_M.forEach(([id,n,cor])=>{const m=P[id];if(m&&m.on)E.push({id,n,cor,turma:t.nome,curso:t.curso||(t.cnq&&t.cnq.nome)||'',ini:m.ini||'',fim:m.fim||m.ini||''})})});
  return E.sort((x,y)=>(x.ini||'9999').localeCompare(y.ini||'9999')||FP_M.findIndex(m=>m[0]===x.id)-FP_M.findIndex(m=>m[0]===y.id))}
function cartaoFormProf(a,c){const E=fpEventos(a);if(!E.length)return '';const hj=isoHoje();
  return `<div class="card wide fpcard"><div class="row" style="gap:10px;margin-bottom:6px"><h2 style="margin:0">${ic('award',18)} FCT e Prova de Aptidão Profissional</h2></div>
    <p class="hint" style="margin:0 0 10px">Momentos indicados nas definições de cada curso (Turma › Editar Turma). Os dias aparecem marcados no calendário.</p>
    <div class="fpl">${E.map(e=>`<div class="fpi ${e.fim&&e.fim<hj?'pas':''}"><span class="sw" style="background:${e.cor}"></span><b>${esc(e.n)}</b><span class="mut">${esc(e.turma)}${e.curso&&e.curso!==e.turma?' · '+esc(e.curso):''}</span><span class="hh">${e.ini?esc(fmtIsoL(e.ini))+(e.fim&&e.fim!==e.ini?' a '+esc(fmtIsoL(e.fim)):''):'<span class="mut">datas por definir</span>'}</span></div>`).join('')}</div></div>`}
function fpMarcar(){if(VIEW!=='calendario')return;const E=fpEventos(A()).filter(e=>e.ini);if(!E.length)return;
  $$('#view [data-cd]').forEach(b=>{const iso=b.dataset.cd;const M=E.filter(e=>iso>=e.ini&&iso<=(e.fim||e.ini));if(!M.length||b.classList.contains('fpm'))return;b.classList.add('fpm');b.style.setProperty('--fpc',M[0].cor);b.title+=' · '+M.map(e=>e.n+' ('+e.turma+')').join(' · ')})}
function fpFieldset(t){const a=A();const P=((turmaDM(a)[normTurma(t.nome)]||{}).pap)||{};
  return `<fieldset class="etmra fpset"><legend>${ic('award',14)} Curso · FCT e PAP</legend><p class="hint" style="margin:0 0 8px">Indique o que este curso tem neste ano letivo. Só o que estiver marcado aparece no calendário escolar.</p>
    ${FP_M.map(([id,n])=>{const m=P[id]||{};return `<div class="fprow"><label class="chk" style="margin:0"><input type="checkbox" data-fpk="${id}|on" ${m.on?'checked':''}> <span>${esc(n)}</span></label><span class="fpd" ${m.on?'':'hidden'}><label>De <input type="date" data-fpk="${id}|ini" value="${esc(m.ini||'')}"></label><label>Até <input type="date" data-fpk="${id}|fim" value="${esc(m.fim||'')}"></label></span></div>`}).join('')}</fieldset>`}
{const _etd=editarTurmaDlg;editarTurmaDlg=function(t){const r=_etd.apply(this,arguments);try{if(ehModular(t)&&tipoEscola(escolaDe(t))==='profissional'){const ref=$('#drawer .etmra')||$('#et-prof');if(ref&&!$('#drawer .fpset'))ref.insertAdjacentHTML('afterend',fpFieldset(t))}}catch(e){console.warn(e)}return r}}
document.addEventListener('change',e=>{const el=e.target;if(!el||!el.dataset||!el.dataset.fpk)return;const a=A();const t=T();const nome=($('#et-nome')||{}).value||(t&&t.nome);if(!a||!nome)return;
  const [id,k]=el.dataset.fpk.split('|');const P=fpCfg(a,nome);const m=P[id]=P[id]||{};
  if(k==='on'){m.on=el.checked;const d=el.closest('.fprow').querySelector('.fpd');if(d)d.hidden=!el.checked}else m[k]=el.value;
  if(m.ini&&m.fim&&m.fim<m.ini){m.fim=m.ini;const f=el.closest('.fprow').querySelector('[data-fpk$="|fim"]');if(f)f.value=m.ini}
  save();toast('Guardado no curso '+nome,'ok')},true);
{const _vcFP=vCalendario;vCalendario=function(){const r=_vcFP.apply(this,arguments);try{fpMarcar()}catch(e){console.warn(e)}return r}}
{const _gFP=go;go=function(v){const r=_gFP.apply(this,arguments);try{$$('[data-v="intercalar"]').forEach(b=>{b.style.display=semIntercalar()?'none':''});fpMarcar()}catch(e){console.warn(e)}return r}}
/* SpruceNote e JornalNote: ao entrar, o quadro ajusta-se sozinho ao ecrã */
{const _gMQ=go;go=function(v){const ant=VIEW;const r=_gMQ.apply(this,arguments);try{if((v==='sprucenote'||v==='snjornal')&&ant!==v){let n=0;const f=()=>{const b=document.getElementById('mq-zf');if(b&&document.querySelector('[data-mq]')){b.click()}else if(b&&n>6){}else if(n++<12)setTimeout(f,120)};setTimeout(f,150)}}catch(_){}return r};if(_gMQ._f)go._f=_gMQ._f}
/* JornalNote: o quadro principal antigo passa a chamar-se JornalNote */
setTimeout(()=>{try{const q=S.snj&&S.snj.quadros;const r=q&&q.find(x=>x.id==='raiz');if(r&&r.nome==='SpruceNote do Jornal'){r.nome='JornalNote';save()}}catch(_){}},1200);

