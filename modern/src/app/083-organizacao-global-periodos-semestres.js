/* =====================================================================
   v0.28 — ORGANIZAÇÃO GLOBAL (PERÍODOS/SEMESTRES), ESCOLAS E TIPOLOGIAS,
           MÓDULOS/UFCD, INTEGRIDADE DOS DADOS, INÍCIO DE SESSÃO
   ===================================================================== */
/* ---------- 1. Organização do ano letivo: global ---------- */
const diasLetivosCal=(c,ini,fim)=>Object.keys(c.dias||{}).filter(d=>d>=ini&&d<=fim&&LETIVOS.includes(c.dias[d])).length;
const letivosOrd=c=>Object.keys(c.dias||{}).filter(d=>LETIVOS.includes(c.dias[d])).sort();
function fimS1Def(c,P3){const L=letivosOrd(c);const y2=P3[P3.length-1].fim.slice(0,4);const lim=y2+'-01-31';const ant=L.filter(d=>d<=lim&&d>=P3[0].ini);return ant.length?ant[ant.length-1]:P3[0].fim}
function semestresDe(c){const P=c.periodos3;if(!P||!P.length)return c.periodos;const L=letivosOrd(c);const f1=c.fimS1||fimS1Def(c,P);const ini2=L.find(d=>d>f1)||P[P.length-1].ini;const fim=P[P.length-1].fim;
  return [{n:1,ini:P[0].ini,fim:f1,dias:diasLetivosCal(c,P[0].ini,f1)},{n:2,ini:ini2,fim,dias:diasLetivosCal(c,ini2,fim)}]}
function periodos3De(c){const P=c.periodos;const ini=P[0].ini,fim=P[P.length-1].fim;const L=letivosOrd(c);
  // cortes nas interrupções letivas mais longas (Natal e Páscoa)
  const intr=[];let cur=null;Object.keys(c.dias).sort().forEach(d=>{if(c.dias[d]==='interrupcao'){if(cur&&(dataDeIso(d)-dataDeIso(cur.f))/864e5<=4)cur.f=d;else{cur={i:d,f:d};intr.push(cur)}}});
  const cortes=intr.filter(x=>x.i>ini&&x.f<fim).sort((x,y)=>(dataDeIso(y.f)-dataDeIso(y.i))-(dataDeIso(x.f)-dataDeIso(x.i))).slice(0,2).sort((x,y)=>x.i.localeCompare(y.i));
  if(cortes.length<2)return P;const b=[ini];cortes.forEach(x=>{b.push(L.filter(d=>d<x.i).pop());b.push(L.find(d=>d>x.f))});b.push(fim);
  return [0,1,2].map(k=>({n:k+1,ini:b[2*k],fim:b[2*k+1],dias:diasLetivosCal(c,b[2*k],b[2*k+1])}))}
function ajustarOrgCalendario(a){const c=a&&a.calendario;if(!c||!c.periodos||!c.periodos.length)return;const sem=a.org==='semestre';
  if(sem){if(c.periodos.length===3)c.periodos3=c.periodos;if(c.periodos.length!==2&&c.periodos3)c.periodos=semestresDe(c)}
  else if(c.periodos.length!==3){c.periodos2=c.periodos;c.periodos=c.periodos3&&c.periodos3.length===3?c.periodos3:periodos3De(c)}}
function periodoDaData(a,iso){const c=a.calendario;if(!c||!iso)return null;const p=c.periodos.find(p=>iso>=p.ini&&iso<=p.fim)||c.periodos.find(p=>iso<p.ini)||c.periodos[c.periodos.length-1];return p?p.n:null}
function mudarOrg(a,novo){if(!a||a.org===novo)return;const n=novo==='semestre'?2:3;
  const TE=turmasFiltradas.call?a.turmas.filter(t=>escId(escolaDe(t))===escAtiva()):a.turmas;const usa3=TE.some(t=>t.instrumentos.some(i=>+i.periodo===3)||Object.keys(t.bloq||{}).includes('3')||Object.keys(t.atrib||{}).includes('3')||t.alunos.some(x=>['autoav','obsPer','sintese'].some(k=>x[k]&&x[k][3])));
  if(!confirm(`Mudar a organização de ${esc(a.nome)} para ${novo==='semestre'?'2 SEMESTRES':'3 PERÍODOS'}?\n\nA mudança é global: calendário escolar, contagens, aulas previstas, marcação de testes, avaliação intercalar, instrumentos, avaliação final, relatórios e reuniões passam a usar ${novo==='semestre'?'semestres':'períodos'}.${usa3&&novo==='semestre'?'\n\nHá dados no 3.º período: os instrumentos com data passam para o semestre dessa data; os restantes e as sínteses/observações do 3.º passam para o 2.º semestre; bloqueios e níveis atribuídos do 3.º período são removidos.':''}`))return;
  if(a.calendario&&!proprioEsc(a,'calendario'))a.calendario=JSON.parse(JSON.stringify(a.calendario));
  a.org=novo;ajustarOrgCalendario(a);const per=d=>periodoDaData(a,d);
  TE.forEach(t=>{t.instrumentos.forEach(i=>{const p=i.data&&a.calendario?per(i.data):null;if(p)i.periodo=p;else if(+i.periodo>n)i.periodo=n});
    t.regra=t.regra||{};if(n===3&&!t.regra[3])t.regra[3]=t.regra[2]||'media';
    ['bloq','atrib'].forEach(k=>{if(t[k])Object.keys(t[k]).forEach(p=>{if(+p>n)delete t[k][p]})});
    t.alunos.forEach(x=>['autoav','obsPer','sintese'].forEach(k=>{const o=x[k];if(!o)return;Object.keys(o).forEach(p=>{if(+p>n){if(!o[n])o[n]=o[p];delete o[p]}})}))});
  (a.datasAval||[]).forEach(d=>{if(d.data&&a.calendario)d.per=per(d.data);else if(+d.per>n)d.per=n});
  if(a.intercalar&&a.intercalar.periodos)a.intercalar.periodos=a.intercalar.periodos.filter(p=>p<=n);
  saveNow();toast('Organização: '+(novo==='semestre'?'2 semestres':'3 períodos')+' — aplicada a toda a app','ok');go(VIEW)}
function cartaoOrg(a){const c=a.calendario;const sem=a.org==='semestre';
  return (escAtiva()!=='principal'&&c&&a.porEscola&&a.porEscola[escAtiva()]&&a.porEscola[escAtiva()].calCopia?`<div class="card"><div class="alert w" style="margin:0;display:flex;gap:10px;align-items:center;flex-wrap:wrap">${ic('info',16)} <span style="flex:1;min-width:220px"><b>${esc(nomeEscola(EC()))}</b> tem o seu próprio calendário e organização do ano, separados de ${esc(nomeEscola(S.cfg))}. Começou como cópia: importe o calendário desta escola ou ajuste-o (períodos ou semestres).</span><button class="btn sm" id="cal-prop">${ic('check',14)} Está Certo</button><button class="btn sm" id="cal-prop-imp">${ic('upload',14)} Importar PDF desta Escola</button></div></div>`:'')+`<div class="card orgcard"><div class="row"><h2 style="margin:0">${ic('layers',18)} Organização do Ano Letivo</h2><span class="sp1"></span>
    <div class="seg">${[['periodo','calendar','3 Períodos'],['semestre','layers','2 Semestres']].map(([k,i,l])=>`<button data-org2="${k}" class="${(a.org||'periodo')===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div></div>
    <p class="hint" style="margin:10px 0 0">Escolha global para ${todasEscolas().length>1?esc(nomeEscola(EC()))+' em ':''}${esc(a.nome)}: calendário, contagens, aulas previstas, marcação de testes, ${semIntercalar()?'':'avaliação intercalar, '}instrumentos, avaliação final, relatórios e reuniões.</p>
    ${sem&&c&&c.periodos3?`<div class="row" style="margin-top:12px;gap:10px;align-items:flex-end"><div><label>Último dia do 1.º semestre</label><input type="date" id="org-f1" value="${c.periodos[0].fim}" min="${c.periodos3[0].ini}" max="${c.periodos3[c.periodos3.length-1].fim}"></div><span class="hint">O calendário importado tem 3 períodos; os semestres são calculados a partir dele (${c.periodos.map(p=>p.n+'.º: '+fmtIso(p.ini)+'–'+fmtIso(p.fim)+' · '+p.dias+' dias').join(' · ')}).</span></div>`:''}</div>`}
function bindOrg(a){$$('[data-org2]').forEach(b=>b.onclick=()=>mudarOrg(a,b.dataset.org2));const f=$('#org-f1');if(f)f.onchange=()=>{a.calendario.fimS1=f.value;a.calendario.periodos=semestresDe(a.calendario);saveNow();go(VIEW);toast('Semestres recalculados','ok')}}

/* ---------- 2. Escolas e tipologias ---------- */
const TIPOS_ESCOLA={regular:{n:'Ensino Regular',d:'Básico e secundário: disciplinas, períodos ou semestres, níveis 1–5 / 0–20; ofertas Regular e PROFIJ (por UFCD).',ofertas:['regular','profij'],ic:'school'},
  profissional:{n:'Escola Profissional',d:'Cursos profissionais organizados por módulos (horas, classificação 0–20, aprovação ≥ 10), anos de formação e componentes de formação.',ofertas:['profissional'],ic:'award'}};
OFERTAS.profissional={nome:'Curso Profissional',cor:'#b8860b'};
const escolas=()=>S.escolas=S.escolas||[];
const escolaDe=t=>(t&&t.escola&&t.escola!=='principal'&&escolas().find(e=>e.id===t.escola))||S.cfg;
const EC=()=>escolaPorId(escAtiva());
const escId=e=>e===S.cfg?'principal':e.id;
const tipoEscola=e=>(e&&e.tipoEscola)||'regular';
const todasEscolas=()=>[S.cfg,...escolas()];
const nomeEscola=e=>(e&&e.escola)||(e===S.cfg?'Escola principal':'Escola sem nome');
const ofertasDaEscola=e=>TIPOS_ESCOLA[tipoEscola(e)].ofertas;
const ehModular=t=>!!t&&(ofertaDe(t)==='profij'||ofertaDe(t)==='profissional');
const unidMod=t=>ofertaDe(t)==='profij'?{s:'UFCD',p:'UFCD',art:'a',um:'UFCD'}:{s:'Módulo',p:'Módulos',art:'o',um:'módulo'};
function escolaSelect(id,cur){const L=todasEscolas();if(L.length<2)return '';return `<div style="margin-bottom:10px"><label>Escola</label><select id="${id}">${L.map(e=>`<option value="${escId(e)}" ${escId(e)===(cur||'principal')?'selected':''}>${esc(nomeEscola(e))} · ${TIPOS_ESCOLA[tipoEscola(e)].n}</option>`).join('')}</select></div>`}
const escolaPorId=id=>!id||id==='principal'?S.cfg:(escolas().find(e=>e.id===id)||S.cfg);

/* ---------- 3. Módulos / UFCD (cursos profissionais e PROFIJ) ---------- */
const notaMod=(t,aid,mid)=>{const v=((t.notasMod||{})[aid]||{})[mid];return v==null||v===''?notaModAuto(t,aid,mid):+v};
function modEstado(t,aid,m){const n=notaMod(t,aid,m.id);if(n!=null)return n>=9.5?'ok':'neg';if(m.fim&&m.fim<isoData(new Date()))return 'atraso';return 'curso'}
function resumoModAluno(t,aid){const M=t.modulos||[];let ok=0,h=0,atr=0,s=0,nn=0;M.forEach(m=>{const e=modEstado(t,aid,m);const n=notaMod(t,aid,m.id);if(e==='ok'){ok++;h+=+m.horas||0}if(e==='atraso'||e==='neg')atr++;if(n!=null&&n>=10){s+=n*(+m.horas||1);nn+=(+m.horas||1)}});
  return {ok,tot:M.length,h,ht:M.reduce((x,m)=>x+(+m.horas||0),0),atr,media:nn?s/nn:null}}
function notaModDeInstrumentos(t,aid,mid){const L=t.instrumentos.filter(i=>i.modulo===mid);if(!L.length)return null;const v=L.map(i=>{const x=instTotal(i,aid),M=instMax(i);return x!=null&&M?x/M*20:null}).filter(x=>x!=null);return v.length?Math.round(avg(v)*10)/10:null}
function vModulos(){const t=T();if(!t)return go('turmas');const U=unidMod(t);t.modulos=t.modulos||[];t.notasMod=t.notasMod||{};const al=alunosAval(t);const M=t.modulos;const hj=isoData(new Date());
  if(!ehModular(t)){$('#view').innerHTML=`<div class="card empty">${ic('layers',30)}<br><b>Esta turma não é modular</b><br><span class="mut">Os módulos/UFCD existem nas turmas de cursos profissionais (escola profissional) e PROFIJ.</span></div>`;return}
  barBtns([{id:'b-mn',t:ic('plus',15)+' '+U.s,c:'pri',f:()=>moduloDlg(t)},{id:'b-mcol',t:ic('paste',15)+' Colar Lista…',f:()=>colarModulosDlg(t)},{id:'b-mcsv',t:ic('download',15)+' Exportar CSV',f:()=>download(U.p+' '+t.nome+'.csv',csv([['N.º','Nome',...M.map(m=>(m.cod||'')+' '+m.nome),U.p+' concluíd'+(U.art==='a'?'as':'os'),'Horas','Média'],...al.map(a=>{const r=resumoModAluno(t,a.id);return [a.num,a.nome,...M.map(m=>notaMod(t,a.id,m.id)??''),r.ok+'/'+r.tot,r.h,r.media!=null?r.media.toFixed(1):'']})]),'text/csv')},{id:'b-mpr',t:ic('printer',15)+' Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  const RA=al.map(a=>({a,r:resumoModAluno(t,a.id)}));const conc=M.filter(m=>al.length&&al.every(a=>notaMod(t,a.id,m.id)!=null)).length;const atr=RA.reduce((s,x)=>s+x.r.atr,0);
  const kpis=`<div class="kpis"><div class="kpi"><div class="l">${ic('layers',14)} ${U.p}</div><div class="v">${M.length}</div><div class="mut">${M.reduce((s,m)=>s+(+m.horas||0),0)} horas no total</div></div>
    <div class="kpi"><div class="l">${ic('check',14)} Avaliad${U.art}s</div><div class="v">${conc}</div><div class="mut">com classificação de todos os alunos</div></div>
    <div class="kpi"><div class="l">${ic('alert',14)} Em Atraso / Não Aprovad${U.art}s</div><div class="v">${atr}</div><div class="mut">${U.p.toLowerCase()} por recuperar (soma dos alunos)</div></div>
    <div class="kpi"><div class="l">${ic('chart',14)} Média da Turma</div><div class="v">${(v=>v.length?avg(v).toFixed(1):'—')(RA.map(x=>x.r.media).filter(x=>x!=null))}</div><div class="mut">ponderada pelas horas (aprovad${U.art}s)</div></div></div>`;
  const lista=`<div class="card"><div class="row"><h2 style="margin:0">${ic('layers',18)} ${U.p} de ${esc(t.disciplina)}</h2><span class="sp1"></span><span class="mut">${esc(ofertaDe(t)==='profij'?'PROFIJ — Unidades de Formação de Curta Duração':(t.curso?'Curso Profissional de '+t.curso:'Curso Profissional'))}${t.anoForm?' · '+esc(t.anoForm)+' ano de formação':''}</span></div>
    ${M.length?`<div class="tblw"><table class="lst modlst"><thead><tr><th>${ofertaDe(t)==='profij'?'Código':'N.º'}</th><th>Designação</th><th>Horas</th><th>Início</th><th>Fim previsto</th><th>Instrumentos</th><th>Aprovados</th><th></th></tr></thead><tbody>
      ${M.map(m=>{const ap=al.filter(a=>(notaMod(t,a.id,m.id)??-1)>=9.5).length;const ni=t.instrumentos.filter(i=>i.modulo===m.id).length;return `<tr><td><b>${esc(m.cod||'')}</b></td><td>${esc(m.nome)}</td><td>${esc(m.horas||'')}</td><td>${fmtIso(m.ini)||'—'}</td><td class="${m.fim&&m.fim<hj&&ap<al.length?'neg':''}">${fmtIso(m.fim)||'—'}</td><td>${ni||'—'}</td><td><div class="pbar sm"><span style="width:${al.length?Math.round(100*ap/al.length):0}%"></span></div><span class="mut">${ap}/${al.length}</span></td>
        <td class="act"><div class="acts"><button class="btn sm" data-mcalc="${m.id}" title="Calcular a partir dos instrumentos associados">${ic('calc',14)}</button><button class="btn sm ico" data-med="${m.id}" aria-label="Editar">${ic('pencil',14)}</button></div></td></tr>`}).join('')}</tbody></table></div>`
      :`<div class="empty" style="padding:24px 0">${ic('layers',28)}<br><b>Ainda sem ${U.p.toLowerCase()}</b><br><span class="mut">Acrescente ${U.art==='a'?'as':'os'} ${U.p.toLowerCase()} ${U.art==='a'?'(código, designação e horas)':'(número, designação e horas)'} — um a um ou colando a lista.</span></div>`}</div>`;
  const grelha=M.length&&al.length?`<div class="card"><div class="row"><h2 style="margin:0">${ic('grid',18)} Classificações por ${U.s}</h2><span class="sp1"></span><span class="mut">0–20 · aprovação ≥ 9,5 · vazio = por avaliar · automático: nota da Avaliação Final de cada ${esc(U.um)} (escrever por cima substitui)</span></div>
    <div class="tblw"><table class="grid modgrid"><thead><tr><th class="stk0">N.º</th><th class="stk">Nome</th>${M.map(m=>`<th title="${esc(m.nome)}">${esc(m.cod||m.nome.slice(0,10))}<br><span class="mut">${esc(m.horas||'')}h</span></th>`).join('')}<th>Concl.</th><th>Horas</th><th>Média</th></tr></thead><tbody>
    ${RA.map(({a,r})=>`<tr data-a="${a.id}"><td class="n stk0">${esc(numAl(a))}</td><td class="stk">${esc(a.nome)}</td>${M.map(m=>{const n=notaMod(t,a.id,m.id);const e=modEstado(t,a.id,m);return `<td class="mc ${e}"><input data-mn="${a.id}|${m.id}" value="${n??''}" inputmode="decimal" aria-label="${esc(m.nome)}"></td>`}).join('')}
      <td><b>${r.ok}</b>/${r.tot}</td><td>${r.h}/${r.ht}</td><td><b>${r.media!=null?r.media.toFixed(1):'—'}</b></td></tr>`).join('')}</tbody></table></div>
    <div class="rleg"><span><i style="background:#1a7f37"></i>Aprovad${U.art}</span><span><i style="background:#d93025"></i>Não aprovad${U.art}</span><span><i style="background:#e8a400"></i>Em atraso (fim previsto ultrapassado)</span></div></div>`:'';
  $('#view').innerHTML=kpis+lista+grelha;
  $$('[data-med]').forEach(b=>b.onclick=()=>moduloDlg(t,M.find(m=>m.id===b.dataset.med)));
  $$('[data-mcalc]').forEach(b=>b.onclick=()=>{const mid=b.dataset.mcalc;let n=0;al.forEach(a=>{const v=notaModDeInstrumentos(t,a.id,mid);if(v!=null){(t.notasMod[a.id]=t.notasMod[a.id]||{})[mid]=v;n++}});
    if(!n)return toast('Não há instrumentos com classificações associados a '+(U.art==='a'?'esta ':'este ')+U.um+' (associe-os em Instrumentos).');saveNow();vModulos();toast(n+' classificações calculadas a partir dos instrumentos','ok')});
  $$('[data-mn]').forEach(i=>i.addEventListener('change',()=>{const [aid,mid]=i.dataset.mn.split('|');const v=i.value.trim().replace(',','.');
    if(v!==''&&(isNaN(+v)||+v<0||+v>20)){toast('Classificação de 0 a 20','erro');i.value=notaMod(t,aid,mid)??'';return}(t.notasMod[aid]=t.notasMod[aid]||{})[mid]=v===''?null:+v;save();const td=i.parentElement;td.className='mc '+modEstado(t,aid,M.find(m=>m.id===mid))}))}
function moduloDlg(t,m){const U=unidMod(t);const ed=!!m;m=m||{id:uid(),cod:ofertaDe(t)==='profij'?'':String((t.modulos||[]).length+1),nome:'',horas:ofertaDe(t)==='profij'?25:'',ini:'',fim:''};
  openDrawer(ed?'Editar '+U.s:'Nov'+(U.art)+' '+U.s,`<div class="ed"><div class="g2"><div><label>${ofertaDe(t)==='profij'?'Código da UFCD':'N.º do módulo'}</label><input id="mo-cod" value="${esc(m.cod)}"></div><div><label>Horas</label><input id="mo-h" value="${esc(m.horas)}" inputmode="numeric"></div>
    <div style="grid-column:1/-1"><label>Designação</label><input id="mo-n" value="${esc(m.nome)}" placeholder="${ofertaDe(t)==='profij'?'ex.: Comunicação em língua inglesa':'ex.: Módulo 1 — Comunicação'}"></div>
    <div><label>Início</label><input type="date" id="mo-i" value="${m.ini||''}"></div><div><label>Fim previsto</label><input type="date" id="mo-f" value="${m.fim||''}"></div></div>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="mo-ok">${ic('check',15)} Guardar</button>${ed?`<span class="sp1"></span><button class="btn dng" id="mo-del">${ic('trash',15)} Apagar</button>`:''}</div></div>`);
  $('#mo-ok').onclick=()=>{const n=$('#mo-n').value.trim();if(!n)return alert('Indique a designação.');Object.assign(m,{cod:$('#mo-cod').value.trim(),nome:n,horas:+$('#mo-h').value||'',ini:$('#mo-i').value,fim:$('#mo-f').value});if(!ed)(t.modulos=t.modulos||[]).push(m);saveNow();closeDrawer();vModulos()};
  if(ed)$('#mo-del').onclick=()=>{if(!confirm('Apagar '+(U.art==='a'?'a ':'o ')+U.um+' “'+m.nome+'” e as respetivas classificações?'))return;t.modulos=t.modulos.filter(x=>x!==m);Object.values(t.notasMod||{}).forEach(o=>delete o[m.id]);t.instrumentos.forEach(i=>{if(i.modulo===m.id)delete i.modulo});saveNow();closeDrawer();vModulos()}}
function colarModulosDlg(t){const U=unidMod(t);openDrawer('Colar Lista de '+U.p,`<div class="ed"><p class="hint" style="margin-top:0">Uma linha por ${U.um}: <b>código ; designação ; horas</b> (também aceita tabulações, copiadas do Excel, ou “código - designação - horas”).</p>
  <textarea id="mo-txt" rows="10" placeholder="${ofertaDe(t)==='profij'?'6652;Comunicação em língua inglesa;25\n6653;Inglês técnico;25':'1;Comunicar em inglês;30\n2;Interação em contexto profissional;30'}"></textarea><div class="row" style="margin-top:12px"><button class="btn pri" id="mo-ok">${ic('check',15)} Acrescentar</button></div></div>`);
  $('#mo-ok').onclick=()=>{const L=$('#mo-txt').value.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split(/\t|;|\s+-\s+|\s+–\s+/).map(x=>x.trim());const h=p.length>2&&/^\d+$/.test(p[p.length-1])?+p.pop():'';const cod=p.length>1?p.shift():'';return {id:uid()+Math.random().toString(36).slice(2,5),cod:cod.replace(/^UFCD\s*/i,''),nome:p.join(' - '),horas:h,ini:'',fim:''}}).filter(m=>m.nome);
    if(!L.length)return alert('Não foi encontrada nenhuma linha válida.');(t.modulos=t.modulos||[]).push(...L);saveNow();closeDrawer();vModulos();toast(L.length+' '+(L.length===1?U.um:U.p.toLowerCase())+' acrescentad'+U.art+(L.length===1?'':'s'),'ok')}}

