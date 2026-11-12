/* =====================================================================
   ESCOLA — dados e logotipo
   ===================================================================== */
const CAMPOS_ESCOLA=[['escola','Nome da Escola','Escola Básica e Secundária…'],['agrupamento','Agrupamento / Unidade Orgânica','(opcional)'],['codigo','Código da Escola','ex.: 1234567'],['morada','Morada',''],['localidade','Código Postal e Localidade','9500-000 Ponta Delgada'],['telefone','Telefone',''],['emailEscola','Endereço Eletrónico',''],['site','Sítio na Internet','https://']];
function logoDeFicheiro(file){return new Promise((ok,ko)=>{
  if(!/^image\//.test(file.type)&&!/\.(png|jpe?g|gif|webp|svg)$/i.test(file.name))return ko(new Error('Escolha uma imagem (PNG, JPG, SVG…).'));
  const fr=new FileReader();fr.onerror=()=>ko(new Error('Não foi possível ler a imagem.'));
  fr.onload=()=>{const url=fr.result;
    if(/svg/i.test(file.type)&&url.length<300000)return ok(url);
    const img=new Image();img.onload=()=>{const M=480,k=Math.min(1,M/Math.max(img.naturalWidth||M,img.naturalHeight||M));
      const c=document.createElement('canvas');c.width=Math.round((img.naturalWidth||M)*k);c.height=Math.round((img.naturalHeight||M)*k);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);ok(c.toDataURL('image/png'))};
    img.onerror=()=>ko(new Error('Imagem inválida.'));img.src=url};
  fr.readAsDataURL(file)})}
const logoHtml=(cls,e)=>{e=e||EC();return e.logo?`<span class="logo-esc ${cls||''} ${e.logoFundo===false?'sf':''}"><img src="${e.logo}" alt="Logotipo"></span>`:''};
function moradaEscola(e){const c=e||S.cfg;return [c.morada,c.localidade].filter(Boolean).join(' · ')}
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
  return (escAtiva()!=='principal'&&c&&!proprioEsc(a,'calendario')?`<div class="card"><div class="alert w" style="margin:0;display:flex;gap:10px;align-items:center;flex-wrap:wrap">${ic('info',16)} <span style="flex:1;min-width:220px"><b>${esc(nomeEscola(EC()))}</b> está a usar o calendário da escola principal (${esc(nomeEscola(S.cfg))}). As alterações aqui afetam as duas.</span><button class="btn sm" id="cal-prop">${ic('copy',14)} Criar Calendário Próprio</button><button class="btn sm" id="cal-prop-imp">${ic('upload',14)} Importar PDF desta Escola</button></div></div>`:'')+`<div class="card orgcard"><div class="row"><h2 style="margin:0">${ic('layers',18)} Organização do Ano Letivo</h2><span class="sp1"></span>
    <div class="seg">${[['periodo','calendar','3 Períodos'],['semestre','layers','2 Semestres']].map(([k,i,l])=>`<button data-org2="${k}" class="${(a.org||'periodo')===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div></div>
    <p class="hint" style="margin:10px 0 0">Escolha global para ${todasEscolas().length>1?esc(nomeEscola(EC()))+' em ':''}${esc(a.nome)}: calendário, contagens, aulas previstas, marcação de testes, avaliação intercalar, instrumentos, avaliação final, relatórios e reuniões.</p>
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
function modEstado(t,aid,m){const n=notaMod(t,aid,m.id);if(n!=null)return n>=10?'ok':'neg';if(m.fim&&m.fim<isoData(new Date()))return 'atraso';return 'curso'}
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
      ${M.map(m=>{const ap=al.filter(a=>(notaMod(t,a.id,m.id)??-1)>=10).length;const ni=t.instrumentos.filter(i=>i.modulo===m.id).length;return `<tr><td><b>${esc(m.cod||'')}</b></td><td>${esc(m.nome)}</td><td>${esc(m.horas||'')}</td><td>${fmtIso(m.ini)||'—'}</td><td class="${m.fim&&m.fim<hj&&ap<al.length?'neg':''}">${fmtIso(m.fim)||'—'}</td><td>${ni||'—'}</td><td><div class="pbar sm"><span style="width:${al.length?Math.round(100*ap/al.length):0}%"></span></div><span class="mut">${ap}/${al.length}</span></td>
        <td class="act"><div class="acts"><button class="btn sm" data-mcalc="${m.id}" title="Calcular a partir dos instrumentos associados">${ic('calc',14)}</button><button class="btn sm ico" data-med="${m.id}" aria-label="Editar">${ic('pencil',14)}</button></div></td></tr>`}).join('')}</tbody></table></div>`
      :`<div class="empty" style="padding:24px 0">${ic('layers',28)}<br><b>Ainda sem ${U.p.toLowerCase()}</b><br><span class="mut">Acrescente ${U.art==='a'?'as':'os'} ${U.p.toLowerCase()} ${U.art==='a'?'(código, designação e horas)':'(número, designação e horas)'} — um a um ou colando a lista.</span></div>`}</div>`;
  const grelha=M.length&&al.length?`<div class="card"><div class="row"><h2 style="margin:0">${ic('grid',18)} Classificações por ${U.s}</h2><span class="sp1"></span><span class="mut">0–20 · aprovação ≥ 10 · vazio = por avaliar</span></div>
    <div class="tblw"><table class="grid modgrid"><thead><tr><th class="stk0">N.º</th><th class="stk">Nome</th>${M.map(m=>`<th title="${esc(m.nome)}">${esc(m.cod||m.nome.slice(0,10))}<br><span class="mut">${esc(m.horas||'')}h</span></th>`).join('')}<th>Concl.</th><th>Horas</th><th>Média</th></tr></thead><tbody>
    ${RA.map(({a,r})=>`<tr data-a="${a.id}"><td class="n stk0">${esc(numAl(a))}</td><td class="stk">${esc(a.nome)}</td>${M.map(m=>{const n=notaMod(t,a.id,m.id);const e=modEstado(t,a.id,m);return `<td class="mc ${e}"><input data-mn="${a.id}|${m.id}" value="${n??''}" inputmode="decimal" aria-label="${esc(m.nome)}"></td>`}).join('')}
      <td><b>${r.ok}</b>/${r.tot}</td><td>${r.h}/${r.ht}</td><td><b>${r.media!=null?r.media.toFixed(1):'—'}</b></td></tr>`).join('')}</tbody></table></div>
    <div class="rleg"><span><i style="background:#1a7f37"></i>Aprovad${U.art}</span><span><i style="background:#d93025"></i>Não aprovad${U.art}</span><span><i style="background:#e8a400"></i>Em atraso (fim previsto ultrapassado)</span></div></div>`:'';
  $('#view').innerHTML=kpis+lista+grelha;
  $$('[data-med]').forEach(b=>b.onclick=()=>moduloDlg(t,M.find(m=>m.id===b.dataset.med)));
  $$('[data-mcalc]').forEach(b=>b.onclick=()=>{const mid=b.dataset.mcalc;let n=0;al.forEach(a=>{const v=notaModDeInstrumentos(t,a.id,mid);if(v!=null){(t.notasMod[a.id]=t.notasMod[a.id]||{})[mid]=v;n++}});
    if(!n)return toast('Não há instrumentos com classificações associados a '+(U.art==='a'?'esta ':'este ')+U.um+' (associe-os em Instrumentos).');saveNow();vModulos();toast(n+' classificações calculadas a partir dos instrumentos','ok')});
  $$('[data-mn]').forEach(i=>i.addEventListener('change',()=>{const [aid,mid]=i.dataset.mn.split('|');const v=i.value.trim().replace(',','.');
    if(v!==''&&(isNaN(+v)||+v<0||+v>20)){toast('Classificação de 0 a 20','erro');i.value='';return}(t.notasMod[aid]=t.notasMod[aid]||{})[mid]=v===''?null:+v;save();const td=i.parentElement;td.className='mc '+modEstado(t,aid,M.find(m=>m.id===mid))}))}
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

/* ---------- 4. Verificação da integridade dos dados ---------- */
function verificarIntegridade(corrigir){const P=[];const add=(g,t,fix)=>P.push({g,t,fix});let fixes=0;const F=fn=>{if(corrigir){fn();fixes++}};
  const ids=new Map();const dup=(id,o)=>{if(!id)return false;if(ids.has(id))return true;ids.set(id,o);return false};
  if(!Array.isArray(S.anos))add('erro','Estrutura inválida: lista de anos letivos em falta.');
  if(S.anoAtivo&&!S.anos.some(a=>a.id===S.anoAtivo))add('aviso','O ano letivo ativo não existe.',()=>F(()=>S.anoAtivo=(S.anos[0]||{}).id||null));
  const escIds=new Set(['principal',...escolas().map(e=>e.id)]);
  S.anos.forEach(a=>{prepAno(a);const An=a.nome;if(dup(a.id,a))add('erro',`Ano ${An}: identificador repetido.`,()=>F(()=>a.id=uid()));
    if(!['periodo','semestre'].includes(a.org))add('aviso',`${An}: organização inválida.`,()=>F(()=>a.org='periodo'));
    const c=a.calendario;const n=a.org==='semestre'?2:3;
    if(c&&c.periodos&&c.periodos.length!==n)add('erro',`${An}: o calendário tem ${c.periodos.length} períodos/semestres, mas o ano está organizado em ${n===2?'semestres':'períodos'}.`,()=>F(()=>ajustarOrgCalendario(a)));
    if(c&&c.periodos)c.periodos.forEach(p=>{if(!p.ini||!p.fim||p.ini>p.fim)add('erro',`${An}: ${p.n}.º ${n===2?'semestre':'período'} com datas inválidas.`)});
    const TI=new Set(a.turmas.map(t=>t.id));
    if(S.turmaAtiva&&a.id===S.anoAtivo&&!TI.has(S.turmaAtiva))add('aviso','A turma ativa não existe neste ano.',()=>F(()=>S.turmaAtiva=null));
    a.turmas.forEach(t=>comEscola(escId(escolaDe(t)),()=>{const c=a.calendario;const n=a.org==='semestre'?2:3;const nm=`${An} · ${esc(t.nome)} · ${t.disciplina}`;if(dup(t.id,t))add('erro',nm+': identificador repetido.',()=>F(()=>t.id=uid()));
      if(t.escola&&!escIds.has(t.escola))add('erro',nm+': associada a uma escola que já não existe.',()=>F(()=>delete t.escola));
      if(t.escola&&!ofertasDaEscola(escolaDe(t)).includes(ofertaDe(t)))add('aviso',nm+`: a oferta “${OFERTAS[ofertaDe(t)].nome}” não corresponde à tipologia da escola (${TIPOS_ESCOLA[tipoEscola(escolaDe(t))].n}).`,()=>F(()=>t.oferta=ofertasDaEscola(escolaDe(t))[0]));
      ['alunos','instrumentos','dominios','mencoes'].forEach(k=>{if(!Array.isArray(t[k]))add('erro',nm+': lista “'+k+'” em falta.',()=>F(()=>t[k]=[]))});
      const AI=new Set((t.alunos||[]).map(x=>x.id)),DI=new Set((t.dominios||[]).map(d=>d.id));
      const ws=(t.dominios||[]).reduce((s,d)=>s+(+d.peso||0),0);if(t.dominios&&t.dominios.length&&Math.round(ws)!==100)add('aviso',nm+`: as ponderações dos domínios somam ${ws}%.`,()=>F(()=>normalizarPesos(t)));
      const nums={};(t.alunos||[]).forEach(x=>{if(dup(x.id,x))add('erro',nm+`: aluno ${esc(x.nome)} com identificador repetido.`,()=>F(()=>x.id=uid()+Math.random().toString(36).slice(2,5)));
        if(!x.nome||!String(x.nome).trim())add('aviso',nm+': há um aluno sem nome.');if(x.num&&!t.origens){const k=String(x.num);if(nums[k])add('aviso',nm+`: número ${k} repetido (${nums[k]} e ${esc(x.nome)}).`);nums[k]=x.nome}
        if(x.foto&&x.foto.startsWith('f:')&&!FOTOS[x.foto.slice(2)])add('aviso',nm+`: a fotografia de ${esc(x.nome)} está em falta.`,()=>F(()=>x.foto=''));
        if(x.nasc&&(!/^(19|20)\d{2}-\d{2}-\d{2}$/.test(x.nasc)||+x.nasc.slice(0,4)>new Date().getFullYear()))add('aviso',nm+`: data de nascimento inválida (${esc(x.nome)}).`,()=>F(()=>x.nasc=''))});
      (t.instrumentos||[]).forEach(i=>{const II=new Set((i.itens||[]).map(x=>x.id));const inm=nm+' · '+i.nome;if(dup(i.id,i))add('erro',inm+': identificador repetido.',()=>F(()=>i.id=uid()));
        if(i.periodo&&(+i.periodo<1||+i.periodo>n)){const pd=i.data&&c?periodoDaData(a,i.data):Math.min(n,Math.max(1,+i.periodo));add('erro',inm+`: está no ${i.periodo}.º período, que não existe na organização atual.`,()=>F(()=>i.periodo=pd))}
        if(i.data&&c&&i.periodo&&periodoDaData(a,i.data)!==+i.periodo){const pd=periodoDaData(a,i.data);add('aviso',inm+`: a data (${fmtIso(i.data)}) é do ${pd}.º ${n===2?'semestre':'período'}, mas o instrumento está no ${i.periodo}.º.`,()=>F(()=>i.periodo=pd))}
        (i.itens||[]).forEach(it=>{if(it.dom&&!DI.has(it.dom))add('aviso',inm+`: o item ${it.rot||''} está ligado a um domínio que já não existe.`,()=>F(()=>it.dom=(t.dominios[0]||{}).id||''))});
        if(i.modulo&&!(t.modulos||[]).some(m=>m.id===i.modulo))add('aviso',inm+': associado a um módulo/UFCD que já não existe.',()=>F(()=>delete i.modulo));
        Object.keys(i.notas||{}).forEach(aid=>{if(!AI.has(aid))add('info',inm+': classificações de um aluno que já não está na turma.',()=>F(()=>delete i.notas[aid]));else Object.keys(i.notas[aid]||{}).forEach(iid=>{if(!II.has(iid))add('info',inm+': classificação de um item apagado.',()=>F(()=>delete i.notas[aid][iid]))})})});
      Object.keys(t.notasMod||{}).forEach(aid=>{if(!AI.has(aid))add('info',nm+': classificações de módulos de um aluno que já não está na turma.',()=>F(()=>delete t.notasMod[aid]))});
      Object.keys(t.atrib||{}).forEach(p=>{if(+p>n)add('aviso',nm+`: níveis atribuídos no ${p}.º período, que não existe.`,()=>F(()=>delete t.atrib[p]))})}));
    Object.entries((a.horProf||{}).mapa||{}).forEach(([k,v])=>{if(v&&!TI.has(v))add('aviso',`${An}: o horário do professor associa “${k}” a uma turma apagada.`,()=>F(()=>a.horProf.mapa[k]=''))});
    (a.datasAval||[]).forEach(d=>{if(d.turma&&!TI.has(d.turma))add('aviso',`${An}: data de avaliação de uma turma apagada.`,()=>F(()=>a.datasAval=a.datasAval.filter(x=>x!==d)));if(d.per&&+d.per>n)add('aviso',`${An}: data de avaliação no ${d.per}.º período, que não existe.`,()=>F(()=>d.per=d.data&&c?periodoDaData(a,d.data):n))});
    (a.faltasProf||[]).forEach(f=>{if(!TI.has(f.turma))add('info',`${An}: falta do professor numa turma apagada.`,()=>F(()=>a.faltasProf=a.faltasProf.filter(x=>x!==f)))});
    (a.reunioes||[]).forEach(r=>{[...(r.turmas||[]),...(r.turma?[r.turma]:[])].forEach(id=>{if(!TI.has(id))add('info',`${An}: a reunião “${esc(r.titulo||REUN_T[r.tipo]&&REUN_T[r.tipo].n)}” refere uma turma apagada.`,()=>F(()=>{r.turmas=(r.turmas||[]).filter(x=>TI.has(x));if(r.turma&&!TI.has(r.turma))r.turma=null}))});
      if(!r.data||!/^\d{4}-\d{2}-\d{2}$/.test(r.data))add('erro',`${An}: reunião sem data válida.`);if(r.ini!=null&&r.fim!=null&&r.fim<=r.ini)add('aviso',`${An}: reunião “${esc(r.titulo||'')}” termina antes de começar.`,()=>F(()=>r.fim=r.ini+60))})});
  const fotosUsadasSet=new Set();S.anos.forEach(a=>a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.foto&&x.foto.startsWith('f:'))fotosUsadasSet.add(x.foto.slice(2))})));const orf=Object.keys(FOTOS).filter(k=>!k.startsWith('doc:')&&!fotosUsadasSet.has(k));
  if(orf.length)add('info',`${orf.length} fotografia(s) guardada(s) que já não pertencem a nenhum aluno (ocupam espaço).`,()=>F(()=>orf.forEach(k=>{delete FOTOS[k];try{IDB&&IDB.transaction('fotos','readwrite').objectStore('fotos').delete(k)}catch(_){}})));
  try{const kb=Math.round(JSON.stringify(S).length/1024);if(kb>4000)add('aviso',`Os dados ocupam ${kb} KB — perto do limite do armazenamento do navegador. Exporte uma cópia de segurança.`)}catch(_){add('erro','Os dados não podem ser convertidos para JSON (estrutura circular ou corrompida).')}
  if(corrigir){P.forEach(p=>p.fix&&p.fix());saveNow()}
  return P}
function cartaoIntegridade(){const P=UI.integ;const G={erro:['#d93025','Erros'],aviso:['#e8a400','Avisos'],info:['#2f7fd0','Informação']};
  return `<div class="card" id="integ"><div class="row"><h2 style="margin:0">${ic('shield',18)} Integridade dos Dados</h2><span class="sp1"></span><button class="btn" id="in-ver">${ic('search',15)} Verificar Agora</button>${P&&P.some(p=>p.fix)?`<button class="btn pri" id="in-fix">${ic('check',15)} Corrigir Automaticamente (${P.filter(p=>p.fix).length})</button>`:''}</div>
    <p class="hint" style="margin:10px 0 0">Procura identificadores repetidos, ligações partidas (alunos, itens, domínios, turmas, escolas, módulos), períodos inexistentes na organização atual, datas inválidas, ponderações erradas e fotografias perdidas ou órfãs. Antes de corrigir é feita uma cópia automática (pode anular com ⌘Z).</p>
    ${P?(P.length?`<div class="integ">${['erro','aviso','info'].map(g=>{const L=P.filter(p=>p.g===g);return L.length?`<div class="ig"><b style="color:${G[g][0]}">${G[g][1]} (${L.length})</b>${L.slice(0,40).map(p=>`<div class="rav ${g}"><span class="rdot"></span><span>${esc(p.t)}</span>${p.fix?'<span class="tag">corrigível</span>':''}</div>`).join('')}${L.length>40?`<div class="mut">… e mais ${L.length-40}</div>`:''}</div>`:''}).join('')}</div>`:`<div class="alert ok" style="margin-top:12px">${ic('check',15)} Nenhum problema encontrado — os dados estão íntegros (${S.anos.length} anos letivos, ${S.anos.reduce((s,a)=>s+a.turmas.length,0)} turmas, ${S.anos.reduce((s,a)=>s+a.turmas.reduce((x,t)=>x+t.alunos.length,0),0)} alunos).</div>`):''}</div>`}
function bindIntegridade(){const v=$('#in-ver');if(v)v.onclick=()=>{UI.integ=verificarIntegridade(false);vDefinicoes();setTimeout(()=>$('#integ')&&$('#integ').scrollIntoView({block:'start',behavior:'smooth'}),50)};
  const f=$('#in-fix');if(f)f.onclick=()=>{const n=UI.integ.filter(p=>p.fix).length;if(!confirm('Corrigir automaticamente '+n+' problema(s)?'))return;try{localStorage.setItem(KEY+'.bak',JSON.stringify(S));localStorage.setItem(KEY+'.bakd',new Date().toLocaleString('pt-PT'))}catch(_){}
    verificarIntegridade(true);UI.integ=verificarIntegridade(false);vDefinicoes();toast(n+' correções aplicadas','ok')}}

/* ---------- 5. Início de sessão (local; Microsoft 365 preparado) ---------- */
const SESS_KEY='edugest.sessao';
async function hashLogin2(u,p){const salt=new TextEncoder().encode('eg-login-v2:'+String(u).trim().toLowerCase());const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(p),'PBKDF2',false,['deriveBits']);const b=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:210000},k,256);return 'p2:'+[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function verificarPasse(c,u,p){try{if(String(c.h||'').startsWith('p2:'))return (await hashLogin2(u,p))===c.h;if((await hashLogin(u,p))!==c.h)return false;try{c.h=await hashLogin2(u,p);saveNow()}catch(_){}return true}catch(_){return false}}
async function hashLogin(u,p){const s='eg-login:'+String(u).trim().toLowerCase()+':'+p;try{return await sha(s)}catch(_){let h=5381;for(const ch of s)h=((h<<5)+h+ch.charCodeAt(0))|0;return 'x'+(h>>>0).toString(16)}}
async function authCfg(){const c=S.cfg;c.auth=c.auth||{};const A_=c.auth;if(!Array.isArray(A_.contas)||!A_.contas.length)A_.contas=[{u:'admin',h:await hashLogin('admin','admin'),nome:'Administrador',papel:'admin',trocar:true}];A_.ms=A_.ms||{clientId:'',tenantId:'',dominio:''};return A_}
function sessaoAtual(){try{const s=JSON.parse(sessionStorage.getItem(SESS_KEY)||localStorage.getItem(SESS_KEY)||'null');if(s&&(!s.ate||s.ate>Date.now()))return s}catch(_){}return null}
function guardarSessao(s,manter){try{const j=JSON.stringify(s);sessionStorage.setItem(SESS_KEY,j);if(manter)localStorage.setItem(SESS_KEY,JSON.stringify({...s,ate:Date.now()+30*864e5}));else localStorage.removeItem(SESS_KEY)}catch(_){}}
function terminarSessao(){try{sessionStorage.removeItem(SESS_KEY);localStorage.removeItem(SESS_KEY)}catch(_){}saveNow();location.reload()}
let SESSAO=null;
function anoLetivoDeHoje(d){d=d||new Date();const y=d.getFullYear(),m=d.getMonth()+1;return m>=8?y+'/'+(y+1):(y-1)+'/'+y}
function anoPorData(L){L=L||S.anos.slice().sort((x,y)=>y.nome.localeCompare(x.nome));const n=anoLetivoDeHoje();return L.find(a=>a.nome===n)||L.find(a=>a.nome<n)||L[0]}
function pedirLogin(){return new Promise(async ok=>{if(window.__ES_OFF){SESSAO={u:'arquivo',tipo:'arquivo',nome:S.cfg.professor||''};const fim=()=>setTimeout(()=>{document.body.classList.remove('login-on');ok(SESSAO)},0);if(document.readyState==='loading')addEventListener('DOMContentLoaded',fim);else fim();return}let A_;try{A_=await authCfg()}catch(e){console.error(e);A_={contas:[],ms:{}}}const s=sessaoAtual();if(s&&A_.contas.some(c=>c.u===s.u)||s&&(s.tipo==='ms'||s.tipo==='google')){SESSAO=s;if(!sessionStorage.getItem(SESS_KEY)&&S.anos.length){const ult=anoPorData();if(S.anoAtivo!==ult.id){S.anoAtivo=ult.id;const TF=turmasFiltradas(A());S.turmaAtiva=TF[0]?TF[0].id:null}}document.body.classList.remove('login-on');return ok(s)}
  document.body.classList.add('login-on');const e=EC();const o=document.createElement('div');o.id='login';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Iniciar sessão');
  const msOk=(A_.ms.clientId||NV_CENTRAL.ms)&&/^https:/.test(location.protocol);const ggOk=true;
  o.innerHTML=`<form class="lgb" autocomplete="on"><div class="lgh"><span class="lgi">${ic('flow',30)}</span><div><b>Edu<em>Spruce</em></b><span>Menos papelada. Mais tempo para ensinar.</span></div></div>
    <h1>Iniciar Sessão</h1>
    <button type="button" class="btn mslg" id="lg-ms" ${msOk?'':'aria-disabled="true"'}><svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg> Entrar com Microsoft 365${msOk?'':' <span class="mut">· brevemente</span>'}</button>
    <button type="button" class="btn mslg" id="lg-gg" ${ggOk?'':'aria-disabled="true"'}><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg> Entrar com Google${ggOk?'':' <span class="mut">· brevemente</span>'}</button>
    <div class="lgou"><span>ou com a conta local</span></div>
    <label for="lg-u">Utilizador</label><input id="lg-u" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required>
    <label for="lg-p">Palavra-passe</label><div class="lgpw"><input id="lg-p" name="password" type="password" autocomplete="current-password" required><button type="button" class="btn sm ico" id="lg-eye" aria-label="Mostrar palavra-passe"><svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div>
    ${S.anos.length?`<label for="lg-ano">Ano letivo</label><select id="lg-ano">${(()=>{const L=S.anos.slice().sort((x,y)=>y.nome.localeCompare(x.nome));const sel=anoPorData(L);return L.map(a=>`<option value="${a.id}" ${a===sel?'selected':''}>${esc(a.nome)}</option>`).join('')})()}</select>`:''}
    <label class="chk"><input type="checkbox" id="lg-m"> Manter a sessão iniciada neste dispositivo (30 dias)</label>
    <div class="lgerr" id="lg-err" role="alert"></div>
    <button type="submit" class="btn pri lgok">Entrar</button>
    ${A_.contas.some(c=>c.trocar)?'':'<p class="lgnota">Esqueceu-se? Os dados estão neste dispositivo; peça ajuda ao administrador.</p>'}</form>`;
  document.body.appendChild(o);setTimeout(()=>$('#lg-u').focus(),60);
  $('#lg-eye').onclick=()=>{const p=$('#lg-p');p.type=p.type==='password'?'text':'password'};
  $('#lg-ms').onclick=()=>msLogin(A_).then(r=>{if(r){fim(r,true)}}).catch(err=>{$('#lg-err').textContent=err.message});
  $('#lg-gg').onclick=()=>gLogin(A_).then(r=>{if(r){fim(r,true)}}).catch(err=>{const e=$('#lg-err');if(err.semId){e.innerHTML='O início de sessão com Google ainda não foi ativado neste site. Quem aloja a app só tem de criar o ID de cliente (15 min) — <a href="https://github.com/EduSpruce/EduSpruce/blob/main/docs/guias/CONFIGURAR_SINCRONIZACAO.md#2-google-google-drive-e-entrar-com-google--cerca-de-15-minutos-gratuito" target="_blank" rel="noopener">ver o guia</a>. Entretanto, use a conta Microsoft ou a conta local.'}else e.textContent=err.message});if(ggOk&&!nvUsarRedirect())gsCarregar().catch(()=>{});
  let falhas=0,bloqAte=0;
  const fim=(sess,manter)=>{const la=$('#lg-ano');if(la&&la.value&&S.anoAtivo!==la.value){S.anoAtivo=la.value;const TF=turmasFiltradas(A());S.turmaAtiva=TF[0]?TF[0].id:null}SESSAO=sess;guardarSessao(sess,manter);o.classList.add('sai');document.body.classList.remove('login-on');setTimeout(()=>o.remove(),280);regista('Sessão','',sess.u+' entrou');ok(sess)};
  setTimeout(()=>{try{segMostrar(o,'#lg-err','button[type=submit]','login')}catch(_){}},0);o.querySelector('form').onsubmit=async ev=>{ev.preventDefault();const u=$('#lg-u').value.trim().toLowerCase(),p=$('#lg-p').value;if(typeof segBloq==='function'&&segBloq('login')){segMostrar(o,'#lg-err','button[type=submit]','login');return}
    let c=null;for(const x of A_.contas.filter(x=>x.u===u)){if(await verificarPasse(x,u,p)){c=x;break}}if(!c){const sf=segFalha('login');audit('Sessão','Início de sessão falhado',u);if(sf.bloq){audit('Segurança','Bloqueio de '+SEG_MIN+' min após '+SEG_LIM+' tentativas falhadas',u);segMostrar(o,'#lg-err','button[type=submit]','login')}else $('#lg-err').textContent='Utilizador ou palavra-passe incorretos.'+(sf.resta<=3?' Resta'+(sf.resta>1?'m ':' ')+sf.resta+' tentativa'+(sf.resta>1?'s':'')+' antes de um bloqueio de '+SEG_MIN+' minutos.':'');o.querySelector('.lgb').classList.remove('abana');void o.offsetWidth;o.querySelector('.lgb').classList.add('abana');return}
    if(typeof nuvemObrig==='function'&&nuvemObrig()&&c.papel!=='admin'){$('#lg-err').textContent='Neste site entra-se com a conta Google. A conta local só serve ao administrador.';return}segOk('login');c.ultimo=Date.now();fim({u:c.u,nome:c.nome,papel:c.papel,tipo:'local',desde:Date.now()},$('#lg-m').checked);if(c.trocar)setTimeout(()=>trocarPasseDlg(c,true),400)}})}
async function msLogin(A_){const m=A_.ms;if(!m.clientId)throw new Error('O início de sessão com Microsoft 365 ainda não está configurado (Definições › Conta e Acesso).');
  if(!/^https:/.test(location.protocol))throw new Error('O Microsoft 365 exige que a app esteja alojada num endereço https (não funciona a partir de um ficheiro local).');
  if(!window.msal)await new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js';s.onload=ok;s.onerror=()=>ko(new Error('Não foi possível carregar a biblioteca da Microsoft (sem internet?).'));document.head.appendChild(s)});
  const app=new msal.PublicClientApplication({auth:{clientId:m.clientId,authority:'https://login.microsoftonline.com/'+(m.tenantId||'organizations'),redirectUri:location.origin+location.pathname},cache:{cacheLocation:'localStorage'}});
  if(app.initialize)await app.initialize();const r=await app.loginPopup({scopes:['User.Read'],prompt:'select_account'});const email=(r.account&&r.account.username||'').toLowerCase();
  if(m.dominio&&!email.endsWith('@'+m.dominio.toLowerCase().replace(/^@/,'')))throw new Error('A conta '+email+' não pertence ao domínio autorizado ('+m.dominio+').');
  return {u:email,nome:r.account.name||email,papel:'professor',tipo:'ms',desde:Date.now()}}
function trocarPasseDlg(c,obrig){openDrawer('Alterar Palavra-passe',`<div class="ed">${obrig?`<div class="alert w" style="margin-top:0">${ic('shield',15)} Está a usar a palavra-passe inicial (<b>admin</b>). Escolha uma nova para proteger o acesso.</div>`:''}
  <div class="g2"><div><label>Utilizador</label><input id="tp-u" value="${esc(c.u)}" autocapitalize="none"></div><div><label>Nome</label><input id="tp-n" value="${esc(c.nome||'')}"></div>
  <div><label>Nova palavra-passe</label><input type="password" id="tp-p1" autocomplete="new-password"></div><div><label>Repetir</label><input type="password" id="tp-p2" autocomplete="new-password"></div></div>
  <p class="hint">Mínimo 6 caracteres. A palavra-passe é guardada com <b>Argon2id</b> (com sal aleatório), nunca em texto. Após ${SEG_LIM} tentativas falhadas, o início de sessão fica bloqueado ${SEG_MIN} minutos.</p>
  <div class="row" style="margin-top:12px"><button class="btn pri" id="tp-ok">${ic('check',15)} Guardar</button>${obrig?'<button class="btn" id="tp-dep">Mais Tarde</button>':''}</div></div>`);
  if($('#tp-dep'))$('#tp-dep').onclick=closeDrawer;
  $('#tp-ok').onclick=async()=>{const u=$('#tp-u').value.trim().toLowerCase(),p1=$('#tp-p1').value,p2=$('#tp-p2').value;if(!u)return alert('Indique o utilizador.');if(p1.length<6)return alert('A palavra-passe deve ter pelo menos 6 caracteres.');if(p1!==p2)return alert('As palavras-passe não coincidem.');
    const A_=await authCfg();if(A_.contas.some(x=>x!==c&&x.u===u))return alert('Já existe esse utilizador.');c.u=u;c.nome=$('#tp-n').value.trim();c.h=await (async()=>{try{return await hashLogin2(u,p1)}catch(_){return hashLogin(u,p1)}})();delete c.trocar;if(SESSAO&&SESSAO.tipo==='local'){SESSAO.u=u;guardarSessao(SESSAO,!!localStorage.getItem(SESS_KEY))}saveNow();closeDrawer();toast('Palavra-passe alterada','ok');if(VIEW==='definicoes')vDefinicoes()}}
function defConta(){const A_=S.cfg.auth||{contas:[],ms:{}};const s=SESSAO||{};
  return `<div class="card"><div class="row"><h2 style="margin:0">${ic('user',18)} Sessão</h2><span class="sp1"></span><button class="btn" id="ct-sair">${ic('back',15)} Terminar Sessão</button></div>
    <p style="margin:12px 0 0">Sessão iniciada como <b>${esc(s.nome||s.u||'—')}</b> <span class="mut">(${esc(s.u||'')} · ${s.tipo==='ms'?'Microsoft 365':s.tipo==='google'?'conta Google':'conta local'}${s.desde?' · desde '+new Date(s.desde).toLocaleString('pt-PT'):''})</span></p></div>
  <div class="card"><div class="row"><h2 style="margin:0">${ic('users',18)} Contas Locais</h2><span class="sp1"></span><button class="btn" id="ct-nova">${ic('plus',15)} Nova Conta</button></div>
    <div class="tblw" style="margin-top:12px"><table class="lst"><thead><tr><th>Utilizador</th><th>Nome</th><th>Papel</th><th>Último acesso</th><th></th></tr></thead><tbody>${(A_.contas||[]).map((c,i)=>`<tr><td><b>${esc(c.u)}</b>${c.trocar?' <span class="tag bad">palavra-passe inicial</span>':''}</td><td>${esc(c.nome||'')}</td><td>${c.papel==='admin'?'Administrador':'Professor'}</td><td>${c.ultimo?new Date(c.ultimo).toLocaleString('pt-PT'):'—'}</td>
      <td class="act"><div class="acts"><button class="btn sm" data-ctp="${i}">${ic('pencil',14)} Palavra-passe</button>${A_.contas.length>1?`<button class="btn sm ico dng" data-ctd="${i}" aria-label="Apagar conta">${ic('trash',14)}</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>
    <p class="hint">O início de sessão protege o acesso à app neste dispositivo. Para proteger também o ficheiro de cópia, use a cópia encriptada (Dados e Segurança).</p></div>
  <div class="card ed"><h2>${ic('building',18)} Microsoft 365 (Office) — Preparação</h2>
    <p class="hint" style="margin-top:0">No futuro a entrada será feita com as credenciais do Office da escola (Microsoft Entra ID). Requer: registo da aplicação no portal Azure pela escola (tipo “Single-page application”), o ID da aplicação e do inquilino, e a app alojada num endereço <b>https</b> (o endereço tem de ser registado como URI de redirecionamento).</p>
    <div class="g2"><div><label>ID da Aplicação (Client ID)</label><input id="ms-cid" value="${esc((A_.ms||{}).clientId||'')}" placeholder="00000000-0000-0000-0000-000000000000"></div><div><label>ID do Inquilino (Tenant ID)</label><input id="ms-tid" value="${esc((A_.ms||{}).tenantId||'')}" placeholder="organizations"></div>
    <div><label>Domínio autorizado</label><input id="ms-dom" value="${esc((A_.ms||{}).dominio||'')}" placeholder="escola.pt"></div><div><label>URI de redirecionamento a registar</label><input value="${esc(location.origin+location.pathname)}" readonly></div></div>
    <p class="hint">Estado: ${(A_.ms||{}).clientId?(/^https:/.test(location.protocol)?'<b style="color:#1a7f37">configurado — o botão Microsoft 365 fica ativo no ecrã de entrada</b>':'<b>configurado, mas a app está a ser aberta a partir de um ficheiro local (precisa de https)</b>'):'por configurar — a entrada é feita com a conta local'}.</p></div>`}
function bindConta(){$('#ct-sair').onclick=()=>{if(confirm('Terminar a sessão?'))terminarSessao()};
  $('#ct-nova').onclick=async()=>{const A_=await authCfg();const c={u:'',nome:'',papel:'professor',h:''};trocarPasseDlg(c,false);const ok=$('#tp-ok');const f=ok.onclick;ok.onclick=async()=>{await f();if(c.h&&!A_.contas.includes(c)){A_.contas.push(c);saveNow();vDefinicoes()}}};
  $$('[data-ctp]').forEach(b=>b.onclick=()=>trocarPasseDlg(S.cfg.auth.contas[+b.dataset.ctp],false));
  $$('[data-ctd]').forEach(b=>b.onclick=()=>{const c=S.cfg.auth.contas[+b.dataset.ctd];if(SESSAO&&SESSAO.u===c.u)return alert('Não pode apagar a conta com que tem a sessão iniciada.');if(confirm('Apagar a conta '+c.u+'?')){S.cfg.auth.contas.splice(+b.dataset.ctd,1);saveNow();vDefinicoes()}});
  [['ms-cid','clientId'],['ms-tid','tenantId'],['ms-dom','dominio']].forEach(([id,k])=>$('#'+id).addEventListener('change',e=>{S.cfg.auth.ms[k]=e.target.value.trim();saveNow();vDefinicoes()}))}

/* ---------- Página Escolas ---------- */
function vEscolas(){const L=todasEscolas();UI.escEd=escAtiva();const a=A();
  const cnt=e=>a?a.turmas.filter(t=>escolaDe(t)===e).length:0;
  return `<div class="card"><div class="row"><h2 style="margin:0">${ic('building',18)} As Minhas Escolas ${a?'<span class="mut" style="font-weight:500">· '+esc(a.nome)+'</span>':''}</h2><span class="sp1"></span><button class="btn" id="es-nova">${ic('plus',15)} Adicionar Escola</button></div>
    <p class="hint" style="margin:10px 0 0">Pode lecionar em mais do que uma escola no mesmo ano letivo. A <b>tipologia</b> de cada escola define as ofertas das suas turmas e a forma de avaliar (disciplinas e períodos, PROFIJ por UFCD, ou cursos profissionais por módulos).</p>
    <div class="escl">${L.map(e=>`<button class="escc ${escId(e)===UI.escEd?'on':''}" data-esed="${escId(e)}">${e.logo?`<img src="${e.logo}" alt="">`:`<span class="besi">${ic(TIPOS_ESCOLA[tipoEscola(e)].ic,18)}</span>`}<span><b>${esc(nomeEscola(e))}</b><span class="mut">${TIPOS_ESCOLA[tipoEscola(e)].n} · ${cnt(e)} turma${cnt(e)===1?'':'s'}${e===S.cfg?' · principal':''}</span></span></button>`).join('')}</div></div>`}
function cartaoTipologia(e){const tp=tipoEscola(e);return `<div class="card ed"><div class="row"><h2 style="margin:0">${ic('layers',18)} Tipologia da Escola</h2><span class="sp1"></span>${e!==S.cfg?`<button class="btn dng" id="es-del">${ic('trash',15)} Remover Escola</button>`:''}</div>
  <div class="tipos">${Object.entries(TIPOS_ESCOLA).map(([k,v])=>`<button type="button" class="tipoc ${tp===k?'on':''}" data-tpe="${k}">${ic(v.ic,22)}<b>${v.n}</b><span>${v.d}</span></button>`).join('')}</div></div>`}

/* =====================================================================
   v0.29 — datas (escrita), aniversários, envio de matrizes, modelos de critérios
   ===================================================================== */
/* ---------- 1. Campos de data: só aplicam a alteração quando se termina de escrever ---------- */
(()=>{const valida=v=>!v||/^(19|20)\d\d-\d\d-\d\d$/.test(v);
  document.addEventListener('focusin',e=>{const el=e.target;if(el&&el.type==='date'){el.dataset.egPrev=el.value;el._egDirty=false}},true);
  const segurar=e=>{const el=e.target;if(!el||el.type!=='date'||el._egPass)return;if(document.activeElement===el){e.stopImmediatePropagation();el._egDirty=true;clearTimeout(el._egT);if(valida(el.value)&&el.value)el._egT=setTimeout(()=>soltar(el),1500)}else if(!valida(el.value)){e.stopImmediatePropagation();el.value=el.dataset.egPrev||''}};
  document.addEventListener('change',segurar,true);document.addEventListener('input',segurar,true);
  const soltar=el=>{clearTimeout(el._egT);if(!el._egDirty)return;el._egDirty=false;if(!valida(el.value)){el.value=el.dataset.egPrev||'';toast('Data incompleta ou inválida — foi reposta a anterior','erro');return}
    if(el.value===el.dataset.egPrev)return;el._egPass=true;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el._egPass=false;el.dataset.egPrev=el.value};
  document.addEventListener('focusout',e=>{const el=e.target;if(el&&el.type==='date'&&el._egDirty)setTimeout(()=>soltar(el),0)},true);
  document.addEventListener('keydown',e=>{const el=e.target;if(el&&el.type==='date'&&e.key==='Enter'){e.preventDefault();soltar(el)}},true)})();

/* ---------- 2. Aniversários dos alunos ---------- */
function aniversarios(a,dias){if(!a)return [];const hj=new Date();hj.setHours(0,0,0,0);const vis=new Map();
  turmasFiltradas(a).forEach(t=>t.alunos.forEach(x=>{if(!x.nasc||!/^(19|20)\d\d-\d\d-\d\d$/.test(x.nasc)||+x.nasc.slice(0,4)>new Date().getFullYear())return;const k=normT(x.nome)+'|'+x.nasc;const o=vis.get(k);if(o){if(!o.turmas.includes(t.nome))o.turmas.push(x.origem||t.nome);return}
    const [y,m,d]=x.nasc.split('-').map(Number);let prox=new Date(hj.getFullYear(),m-1,d);if(m===2&&d===29&&prox.getMonth()!==1)prox=new Date(hj.getFullYear(),1,28);
    let dif=Math.round((prox-hj)/864e5);if(dif<-1){prox=new Date(hj.getFullYear()+1,m-1,d);dif=Math.round((prox-hj)/864e5)}
    vis.set(k,{x,turmas:[x.origem||t.nome],dif,data:prox,idade:prox.getFullYear()-y})}));
  return [...vis.values()].filter(v=>v.dif>=-1&&v.dif<=dias).sort((p,q)=>p.dif-q.dif||p.x.nome.localeCompare(q.x.nome,'pt'))}
function cartaoAniversarios(a){if(!a||S.cfg.anivOculto)return '';const L=aniversarios(a,S.cfg.anivDias||14);const temNasc=a.turmas.some(t=>t.alunos.some(x=>x.nasc));if(!temNasc)return '';
  const quando=v=>v.dif===0?'Hoje':v.dif===1?'Amanhã':v.dif===-1?'Ontem':DIAS_C[v.data.getDay()]+', '+v.data.getDate()+' '+MESES[v.data.getMonth()+1].slice(0,3).toLowerCase();
  return `<div class="card anivc"><div class="row"><h2 style="margin:0">${ic('star',18)} Aniversários</h2><span class="sp1"></span><span class="mut" style="font-size:12.5px">próximos ${S.cfg.anivDias||14} dias</span></div>
    ${L.length?L.slice(0,8).map(v=>`<div class="aniv ${v.dif===0?'hoje':''}"><span class="anf">${avatar(v.x,32)}</span><span class="ann"><b>${esc(v.x.nome)}</b><span class="mut">${esc(v.turmas.join(', '))} · <span class="sens">faz ${v.idade} anos</span></span></span><span class="anq">${v.dif===0?'🎂 ':''}${quando(v)}</span></div>`).join('')+(L.length>8?`<p class="mut" style="margin:8px 0 0;font-size:12.5px">… e mais ${L.length-8}</p>`:'')
      :`<p class="mut" style="margin:8px 0 0">Sem aniversários nos próximos ${S.cfg.anivDias||14} dias.</p>`}</div>`}

/* ---------- 3. Envio da matriz antes de cada teste ---------- */
const cfgMatriz=()=>Object.assign({ativo:true,dias:10},S.cfg.matriz||{});
function dataMatriz(iso){const m=cfgMatriz();const d=dataDeIso(iso);d.setDate(d.getDate()-(+m.dias||0));while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()-1);return isoData(d)}
function matrizes(a,lista){const m=cfgMatriz();if(!a||!m.ativo)return [];const L=[];(lista||turmasFiltradas(a)).forEach(t=>t.instrumentos.forEach(i=>{if(!i.data||!ehTeste(i)||i.semMatriz||i.oral||/oral/i.test(i.tipo||'')||/oral/i.test(i.nome||''))return;L.push({t,i,data:dataMatriz(i.data),enviada:!!i.matrizEnviada})}));return L.sort((x,y)=>x.data.localeCompare(y.data))}
function cartaoMatrizes(a){const hj=isoData(new Date());const lim=isoData(new Date(Date.now()+7*864e5));const L=matrizes(a).filter(x=>!x.enviada&&x.i.data>=hj&&x.data<=lim);if(!L.length)return '';
  return `<div class="card mzc"><div class="row"><h2 style="margin:0">${ic('file',18)} Matrizes a Enviar</h2><span class="sp1"></span><span class="mut" style="font-size:12.5px">${cfgMatriz().dias} dias antes de cada teste</span></div>
    ${L.map(x=>{const atr=x.data<hj;return `<div class="mzi ${atr?'atr':x.data===hj?'hoje':''}"><span class="mzd"><b>${dataDeIso(x.data).getDate()}</b><span>${MESES[dataDeIso(x.data).getMonth()+1].slice(0,3)}</span></span><span class="mzt"><b>${esc(x.i.nome)} · ${esc(x.t.nome)}</b><span class="mut">${esc(x.t.disciplina)} · teste ${esc(fmtIsoL(x.i.data))} · ${atr?'<b style="color:#c5221f">envio em atraso ('+esc(contagem(x.data))+')</b>':'enviar '+esc(contagem(x.data))}</span></span><button class="btn sm" data-mzok="${x.t.id}|${x.i.id}">${ic('check',14)} Enviada</button></div>`}).join('')}</div>`}
function bindMatrizes(){$$('[data-mzok]').forEach(b=>b.onclick=()=>{const [tid,iid]=b.dataset.mzok.split('|');const t=A().turmas.find(x=>x.id===tid);const i=t&&t.instrumentos.find(x=>x.id===iid);if(!i)return;i.matrizEnviada=Date.now();saveNow();toast('Matriz de '+i.nome+' marcada como enviada','ok');go(VIEW)})}

/* ---------- 4. Modelos de domínios e ponderações ---------- */
const MOD_BASE=[
 {id:'le',nome:'Línguas Estrangeiras',disc:['Inglês','Francês','Espanhol','Alemão','Comunicar em Inglês'],d:[['PO','Produção Oral',25],['CO','Compreensão Oral',25],['CE','Compreensão Escrita',25],['PE','Produção Escrita',25]]},
 {id:'port-b',nome:'Português (Ensino Básico)',disc:['Português'],cic:['1c','2c','3c'],d:[['OR','Oralidade',20],['LEI','Leitura',20],['EL','Educação Literária',15],['ESC','Escrita',25],['GRA','Gramática',20]]},
 {id:'port-s',nome:'Português (Ensino Secundário)',disc:['Português','Literatura Portuguesa'],cic:['sec','profij'],d:[['OR','Oralidade',15],['LEI','Leitura',20],['EL','Educação Literária',25],['ESC','Escrita',25],['GRA','Gramática',15]]},
 {id:'plnm',nome:'Português Língua Não Materna',disc:['Português Língua Não Materna (PLNM)'],d:[['CO','Compreensão Oral',20],['PIO','Produção e Interação Oral',20],['LEI','Leitura',20],['ESC','Escrita',25],['GRA','Gramática',15]]},
 {id:'mat-b',nome:'Matemática (Ensino Básico)',disc:['Matemática'],d:[['NO','Números e Operações',20],['ALG','Álgebra',20],['GM','Geometria e Medida',20],['DP','Dados e Probabilidades',15],['CM','Capacidades Matemáticas',25]]},
 {id:'mat-s',nome:'Matemática (Ensino Secundário)',disc:['Matemática A','Matemática B','Matemática Aplicada às Ciências Sociais (MACS)'],d:[['CC','Conhecimento e Compreensão',50],['RP','Resolução de Problemas',30],['RC','Raciocínio e Comunicação',20]]},
 {id:'ef',nome:'Educação Física',disc:['Educação Física'],d:[['AF','Atividades Físicas',60],['APF','Aptidão Física',20],['CON','Conhecimentos',20]]},
 {id:'cien',nome:'Ciências Experimentais',disc:['Ciências Naturais','Físico-Química','Física e Química A','Biologia e Geologia','Biologia','Física','Química','Geologia'],d:[['CON','Conhecimentos e Conceitos',50],['PL','Prática Laboratorial e Experimental',25],['CPC','Comunicação e Pensamento Crítico',25]]},
 {id:'hum',nome:'História e Geografia',disc:['História e Geografia de Portugal','História','Geografia','História A','História B','Geografia A','História da Cultura e das Artes','Antropologia'],d:[['CC','Conhecimento e Compreensão',50],['TI','Tratamento de Informação e Fontes',30],['COM','Comunicação',20]]},
 {id:'fil',nome:'Filosofia',disc:['Filosofia'],d:[['PRB','Problematização',35],['CONC','Conceptualização',30],['ARG','Argumentação',35]]},
 {id:'eco',nome:'Economia',disc:['Economia A'],d:[['CC','Conhecimento e Compreensão',60],['AI','Análise e Interpretação de Dados',25],['COM','Comunicação',15]]},
 {id:'art',nome:'Artes Visuais',disc:['Educação Visual','Desenho A','Geometria Descritiva A','Educação Artística — Artes Visuais','Complemento à Educação Artística'],d:[['AR','Apropriação e Reflexão',30],['IC','Interpretação e Comunicação',30],['EC','Experimentação e Criação',40]]},
 {id:'mus',nome:'Música, Dança e Teatro',disc:['Educação Musical','Educação Artística — Música','Educação Artística — Dança','Educação Artística — Expressão Dramática/Teatro'],d:[['EC','Experimentação e Criação',40],['IC','Interpretação e Comunicação',35],['AR','Apropriação e Reflexão',25]]},
 {id:'et',nome:'Educação Tecnológica',disc:['Educação Tecnológica'],d:[['TS','Tecnologia e Sociedade',30],['PT','Processos Tecnológicos',40],['RU','Recursos e Utilizações Tecnológicas',30]]},
 {id:'tic',nome:'TIC e Aplicações Informáticas',disc:['Tecnologias da Informação e Comunicação (TIC)','Aplicações Informáticas B'],d:[['SRR','Segurança, Responsabilidade e Respeito',20],['IP','Investigar e Pesquisar',20],['CC','Comunicar e Colaborar',30],['CI','Criar e Inovar',30]]},
 {id:'cd',nome:'Cidadania e Desenvolvimento',disc:['Cidadania e Desenvolvimento'],d:[['PAR','Participação e Envolvimento',40],['CON','Conhecimentos',30],['AV','Atitudes e Valores',30]]},
 {id:'emrc',nome:'EMRC',disc:['Educação Moral e Religiosa Católica (EMRC)'],d:[['RER','Religião e Experiência Religiosa',35],['CC','Cultura Cristã e Visão Cristã da Vida',35],['EM','Ética e Moral',30]]},
 {id:'em',nome:'Estudo do Meio',disc:['Estudo do Meio'],d:[['SOC','Sociedade',30],['NAT','Natureza',30],['TEC','Tecnologia',20],['SNT','Sociedade / Natureza / Tecnologia',20]]},
 {id:'cla',nome:'Línguas Clássicas',disc:['Latim A','Grego'],d:[['LIN','Língua',40],['TL','Tradução e Leitura',40],['CUL','Cultura',20]]},
 {id:'ae',nome:'Apoio ao Estudo / Oferta Complementar',disc:['Apoio ao Estudo','Oferta Complementar','Oferta de Escola'],d:[['MT','Métodos de Trabalho',40],['AUT','Autonomia',30],['PAR','Participação',30]]},
 {id:'mod',nome:'Módulo / UFCD (cursos profissionais e PROFIJ)',disc:[],of:['profissional','profij'],d:[['CON','Conhecimentos',50],['PRA','Prática e Aplicação',30],['AT','Atitudes e Comportamentos',20]]},
 {id:'gen',nome:'Genérico',disc:[],d:[['CC','Conhecimentos e Capacidades',80],['AT','Atitudes e Valores',20]]}];
function modelosTodos(){const U=S.cfg.modelos||[];const base=MOD_BASE.map(b=>{const o=U.find(u=>u.id===b.id);return o?{...b,...o,base:true,alterado:true}:{...b,base:true}});return base.concat(U.filter(u=>!MOD_BASE.some(b=>b.id===u.id)))}
function modeloPara(disc,ciclo,oferta){const M=modelosTodos();const nd=normT(disc);
  return M.filter(m=>!m.base||true).find(m=>!m.base&&(m.disc||[]).some(x=>normT(x)===nd)&&(!m.cic||!m.cic.length||m.cic.includes(ciclo)))
    ||M.find(m=>m.base&&(m.disc||[]).some(x=>normT(x)===nd)&&(!m.cic||!m.cic.length||m.cic.includes(ciclo)))
    ||(oferta&&oferta!=='regular'&&M.find(m=>(m.of||[]).includes(oferta)))
    ||(()=>{const i=discInfo(disc);const k=i&&i.t;return M.find(m=>m.id===({le:'le',port:ciclo==='sec'?'port-s':'port-b',ef:'ef'}[k]||'gen'))})()}
const dominiosDoModelo=m=>(m?m.d:MODELOS.gen).map(([ab,nome,peso],k)=>({id:uid()+k,ab,nome,peso:+peso}));
const mkDominiosDisc=(disc,ciclo,oferta)=>dominiosDoModelo(modeloPara(disc,ciclo,oferta));
function guardarModelo(m){S.cfg.modelos=S.cfg.modelos||[];const i=S.cfg.modelos.findIndex(x=>x.id===m.id);const o={id:m.id,nome:m.nome,disc:m.disc||[],cic:m.cic||[],of:m.of||[],d:m.d};if(i>=0)S.cfg.modelos[i]=o;else S.cfg.modelos.push(o);saveNow()}
function defModelos(){const M=modelosTodos();const q=normT(UI.modQ||'');const L=M.filter(m=>!q||normT(m.nome+' '+(m.disc||[]).join(' ')).includes(q));const minhas=new Set(minhasDisc());
  const _pl=(()=>{try{const p=domPal();if(Array.isArray(p)&&p.length)return p}catch(_){}return ['#2f7fd0','#d98b00','#7a4fd0','#1a7f37','#c0392b','#0f8b8d','#b8860b','#5b6b7f']})();const cor=k=>_pl[k%_pl.length];
  return `<div class="card"><div class="row"><h2 style="margin:0">${ic('sliders',18)} Modelos de Domínios e Ponderações</h2><span class="sp1"></span><input type="search" id="md-q" placeholder="Procurar disciplina…" value="${esc(UI.modQ||'')}" style="width:220px"><button class="btn pri" id="md-novo">${ic('plus',15)} Novo Modelo</button></div>
    <p class="hint" style="margin:10px 0 0">Ao criar uma turma, os domínios são copiados do modelo da disciplina (e do ciclo). Pode alterar os modelos, criar novos e aplicá-los a turmas existentes em Critérios. Os modelos de base podem ser repostos a qualquer momento.</p></div>
  <div class="mdgrid">${L.map(m=>{const tot=m.d.reduce((s,x)=>s+(+x[2]||0),0);const meu=(m.disc||[]).some(d=>minhas.has(d));return `<div class="card mdmc ${meu?'meu':''}"><div class="row" style="align-items:flex-start"><div style="flex:1;min-width:0"><b class="mdn">${esc(m.nome)}</b><div class="mut mdmd">${(m.disc||[]).length?esc(m.disc.join(' · ')):m.of&&m.of.length?'Turmas '+m.of.map(o=>OFERTAS[o]?OFERTAS[o].nome:o).join(' e '):'Outras disciplinas'}${m.cic&&m.cic.length?' · '+m.cic.map(c=>CICLOS[c]).join(', '):''}</div></div>
      <span class="tag ${m.base?(m.alterado?'dt':''):'ok'}">${m.base?(m.alterado?'Base alterado':'Base'):'Próprio'}</span></div>
    <div class="mdmbar" role="img" aria-label="Ponderações">${m.d.map((x,k)=>`<span style="flex:${+x[2]||0};background:${cor(k)}" title="${esc(x[1])} ${x[2]}%">${(+x[2]||0)>=12?x[2]+'%':''}</span>`).join('')}</div>
    <div class="mdml">${m.d.map((x,k)=>`<span class="mdmi" style="--dc:${cor(k)}"><b>${esc(x[0])}</b><span>${esc(x[1])}</span><em>${x[2]}%</em></span>`).join('')}</div>
    ${tot!==100?`<div class="alert w" style="margin:8px 0 0">${ic('alert',14)} Soma ${tot}%</div>`:''}
    <div class="row" style="gap:6px;margin-top:12px"><button class="btn sm" data-mded="${m.id}">${ic('pencil',14)} Editar</button><button class="btn sm" data-mddup="${m.id}">${ic('copy',14)} Duplicar</button>${m.base&&m.alterado?`<button class="btn sm" data-mdrep="${m.id}">${ic('refresh',14)} Repor</button>`:''}${!m.base?`<button class="btn sm ico dng" data-mddel="${m.id}" aria-label="Apagar">${ic('trash',14)}</button>`:''}</div></div>`}).join('')}</div>`}
function bindModelos(){const q=$('#md-q');if(q)q.oninput=()=>{UI.modQ=q.value;const p=q.selectionStart;vDefinicoes();const n=$('#md-q');n.focus();n.setSelectionRange(p,p)};
  $('#md-novo').onclick=()=>modeloDlg({id:'m'+uid(),nome:'',disc:[],cic:[],d:[['CC','Conhecimentos e Capacidades',80],['AT','Atitudes e Valores',20]]},true);
  $$('[data-mded]').forEach(b=>b.onclick=()=>modeloDlg(JSON.parse(JSON.stringify(modelosTodos().find(m=>m.id===b.dataset.mded))),false));
  $$('[data-mddup]').forEach(b=>b.onclick=()=>{const m=JSON.parse(JSON.stringify(modelosTodos().find(m=>m.id===b.dataset.mddup)));m.id='m'+uid();m.nome=m.nome+' (cópia)';delete m.base;delete m.alterado;modeloDlg(m,true)});
  $$('[data-mdrep]').forEach(b=>b.onclick=()=>{if(!confirm('Repor o modelo de base?'))return;S.cfg.modelos=(S.cfg.modelos||[]).filter(m=>m.id!==b.dataset.mdrep);saveNow();vDefinicoes();toast('Modelo reposto','ok')});
  $$('[data-mddel]').forEach(b=>b.onclick=()=>{if(!confirm('Apagar este modelo?'))return;S.cfg.modelos=(S.cfg.modelos||[]).filter(m=>m.id!==b.dataset.mddel);saveNow();vDefinicoes()})}
function modeloDlg(m,novo){const todas=[...new Set([...DISCIPLINAS.map(d=>d.n),...(S.cfg.extra||[]),...m.disc||[]])].sort((x,y)=>x.localeCompare(y,'pt'));
  const linhas=()=>m.d.map((x,k)=>`<tr><td><input data-mdk="${k}|0" value="${esc(x[0])}" style="width:80px"></td><td><input data-mdk="${k}|1" value="${esc(x[1])}"></td><td><input data-mdk="${k}|2" value="${esc(x[2])}" inputmode="numeric" style="width:70px;text-align:center"></td><td><button class="btn sm ico dng" data-mdx="${k}" aria-label="Remover domínio">${ic('x',13)}</button></td></tr>`).join('');
  openDrawer(novo?'Novo Modelo':'Editar Modelo',`<div class="ed"><label>Nome do modelo</label><input id="mo-nome" value="${esc(m.nome)}" placeholder="ex.: Inglês 3.º ciclo — departamento">
    <label style="margin-top:12px">Disciplinas a que se aplica</label><div class="mddisc">${todas.map(d=>`<label class="chk"><input type="checkbox" data-mdd="${esc(d)}" ${(m.disc||[]).includes(d)?'checked':''}> ${esc(d)}</label>`).join('')}</div>
    <label style="margin-top:12px">Ciclos <span class="mut">(nenhum = todos)</span></label><div class="row" style="gap:6px;flex-wrap:wrap">${Object.entries(CICLOS).map(([k,l])=>`<button type="button" class="chip ${(m.cic||[]).includes(k)?'on':''}" data-mdc="${k}">${l}</button>`).join('')}</div>
    <h3>Domínios</h3><table class="lst"><thead><tr><th>Abrev.</th><th>Designação</th><th>Peso %</th><th></th></tr></thead><tbody id="mo-dom">${linhas()}</tbody></table>
    <div class="row" style="margin-top:8px;gap:8px"><button class="btn sm" id="mo-add">${ic('plus',14)} Domínio</button><button class="btn sm" id="mo-eq">Pesos iguais</button><span class="sp1"></span><b id="mo-tot"></b></div>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="mo-ok">${ic('check',15)} Guardar Modelo</button></div></div>`);
  const tot=()=>{const s=m.d.reduce((a,x)=>a+(+x[2]||0),0);const e=$('#mo-tot');e.textContent='Total: '+s+'%';e.style.color=s===100?'#1a7f37':'#c5221f'};
  const bindL=()=>{$$('[data-mdk]').forEach(i=>i.oninput=()=>{const [k,c]=i.dataset.mdk.split('|').map(Number);m.d[k][c]=c===2?(+i.value.replace(',','.')||0):i.value;tot()});$$('[data-mdx]').forEach(b=>b.onclick=()=>{m.d.splice(+b.dataset.mdx,1);$('#mo-dom').innerHTML=linhas();bindL();tot()})};bindL();tot();
  $('#mo-add').onclick=()=>{m.d.push(['','',0]);$('#mo-dom').innerHTML=linhas();bindL();tot()};
  $('#mo-eq').onclick=()=>{const n=m.d.length;if(!n)return;const b=Math.floor(100/n);m.d.forEach((x,k)=>x[2]=b+(k<100-b*n?1:0));$('#mo-dom').innerHTML=linhas();bindL();tot()};
  $$('[data-mdc]').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
  $('#mo-ok').onclick=()=>{m.nome=$('#mo-nome').value.trim();if(!m.nome)return alert('Indique o nome do modelo.');m.d=m.d.filter(x=>String(x[1]).trim());if(!m.d.length)return alert('Indique pelo menos um domínio.');
    const s=m.d.reduce((a,x)=>a+(+x[2]||0),0);if(s!==100&&!confirm('Os pesos somam '+s+'% (deviam somar 100%). Guardar assim?'))return;
    m.disc=$$('[data-mdd]').filter(x=>x.checked).map(x=>x.dataset.mdd);m.cic=$$('[data-mdc].on').map(b=>b.dataset.mdc);guardarModelo(m);closeDrawer();vDefinicoes();toast('Modelo guardado','ok')}}
function aplicarModeloTurma(t,id){const m=modelosTodos().find(x=>x.id===id);if(!m)return;const us=t.instrumentos.some(i=>i.itens.length);
  if(us&&!confirm('Aplicar o modelo “'+m.nome+'”? Os itens dos instrumentos são religados pelos domínios com a mesma abreviatura; os restantes ficam sem domínio.'))return;
  const ant=Object.fromEntries(t.dominios.map(d=>[d.id,normT(d.ab)]));const novo=dominiosDoModelo(m);const porAb=Object.fromEntries(novo.map(d=>[normT(d.ab),d.id]));
  t.instrumentos.forEach(i=>i.itens.forEach(it=>{it.dom=porAb[ant[it.dom]]||''}));t.dominios=novo;saveNow();toast('Modelo “'+m.nome+'” aplicado','ok')}

function cartaoAvisosDef(){const m=cfgMatriz();return `<div class="card ed" id="def-avisos"><h2>${ic('bell',18)} Avisos Automáticos</h2>
  <div class="prefs"><div class="pref"><b>Envio da matriz antes de cada teste</b><div class="row" style="gap:10px;flex-wrap:wrap"><label class="chk"><input type="checkbox" id="mz-on" ${m.ativo?'checked':''}> Marcar automaticamente</label>
    <span class="row" style="gap:6px"><input id="mz-d" type="number" min="1" max="60" value="${m.dias}" inputmode="numeric" style="width:76px;text-align:center"> <span>dias antes</span></span>
    <div class="seg mini">${[5,7,10,14].map(n=>`<button type="button" data-mzd="${n}" class="${+m.dias===n?'on':''}">${n}</button>`).join('')}</div></div>
    <span class="hint">Aparece no Início (“Matrizes a Enviar”), nas Datas Importantes e no calendário da Marcação de Testes. Se calhar ao fim de semana, passa para a sexta-feira anterior.</span></div>
  <div class="pref"><b>Aniversários dos alunos no Início</b><div class="row" style="gap:10px;flex-wrap:wrap"><label class="chk"><input type="checkbox" id="an-on" ${S.cfg.anivOculto?'':'checked'}> Mostrar</label><span class="row" style="gap:6px">próximos <input id="an-d" type="number" min="1" max="60" value="${S.cfg.anivDias||14}" inputmode="numeric" style="width:70px;text-align:center"> dias</span></div></div></div></div>`}
function bindAvisosDef(){const up=()=>{S.cfg.matriz={ativo:$('#mz-on').checked,dias:Math.max(1,Math.min(60,+$('#mz-d').value||10))};save();$$('[data-mzd]').forEach(b=>b.classList.toggle('on',+b.dataset.mzd===S.cfg.matriz.dias))};
  $('#mz-on').onchange=up;$('#mz-d').onchange=up;$$('[data-mzd]').forEach(b=>b.onclick=()=>{$('#mz-d').value=b.dataset.mzd;up();toast('Matriz: '+b.dataset.mzd+' dias antes do teste','ok')});
  $('#an-on').onchange=e=>{S.cfg.anivOculto=!e.target.checked;save()};$('#an-d').onchange=e=>{S.cfg.anivDias=Math.max(1,Math.min(60,+e.target.value||14));save()}}

/* ---------- procurar dados da escola na internet (OpenStreetMap / Nominatim, sem chave) ---------- */
const REG_ESC={acores:['Açores','&viewbox=-31.6,40.0,-24.3,36.8&bounded=1'],madeira:['Madeira','&viewbox=-17.4,33.2,-16.2,32.3&bounded=1'],continente:['Portugal continental','&viewbox=-9.6,42.2,-6.1,36.9&bounded=1'],pt:['Todo o país','']};
function formRepesquisa(nome,reg,temRes){return `<div class="webre"><b>${temRes?'Não é nenhuma destas?':'Procurar novamente'}</b><div class="row" style="gap:8px;flex-wrap:wrap;margin-top:6px"><input id="ew-q" value="${esc(nome)}" placeholder="Nome ou parte do nome (ex.: Profissional São Jorge)" style="flex:1;min-width:220px"><select id="ew-r">${Object.entries(REG_ESC).map(([k,v])=>`<option value="${k}" ${k===reg?'selected':''}>${v[0]}</option>`).join('')}</select><button type="button" class="btn pri" id="ew-go">${ic('search',15)} Procurar Novamente</button></div>
  <label class="chk" style="margin-top:8px"><input type="checkbox" id="ew-subst" ${temRes?'checked':''}> Substituir os campos já preenchidos (morada, código postal, telefone, e-mail, sítio)</label></div>`}
function bindRepesquisa(c){const go_=()=>procurarEscolaWeb(c,$('#ew-q').value,$('#ew-r').value);const b=$('#ew-go');if(b)b.onclick=go_;const q=$('#ew-q');if(q)q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go_()}}}
async function procurarEscolaWeb(c,termo,reg){const nome=(termo||c.escola||'').trim();reg=reg||UI.escReg||'acores';UI.escReg=reg;UI.escTermo=nome;const box=$('#es-res');if(nome.length<4){toast('Escreva primeiro o nome da escola','erro');$('[data-ce="escola"]').focus();return}
  if(!navigator.onLine){box.innerHTML=`<div class="alert w">${ic('alert',15)} Sem ligação à internet.</div>`;return}
  box.innerHTML=`<div class="hint" style="margin:0 0 12px">${ic('search',14)} A procurar “${esc(nome)}”…</div>`;
  const q=async(t)=>{const u='https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&namedetails=1&limit=8&countrycodes=pt&accept-language=pt'+REG_ESC[reg][1]+'&q='+encodeURIComponent(t);const r=await fetch(u,{headers:{'Accept':'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()};
  try{let L=await q(nome);if(!L.length){const curto=nome.replace(/^(escola|agrupamento de escolas)\s+(b[aá]sica|secund[aá]ria|profissional)?\s*(e\s+secund[aá]ria)?\s*(da|de|do|das|dos)?\s*/i,'');if(curto!==nome)L=await q('escola '+curto)}
    L=L.filter(x=>/school|college|university|educ|escola/i.test((x.type||'')+' '+(x.category||'')+' '+(x.display_name||'')));
    if(!L.length){box.innerHTML=`<div class="alert w">${ic('info',15)} Não foi encontrada nenhuma escola com “${esc(nome)}” (${esc(REG_ESC[reg][0])}) no OpenStreetMap. Experimente um nome mais curto (ex.: “Profissional São Jorge”), outra região, ou preencha à mão.</div>`+formRepesquisa(nome,reg);bindRepesquisa(c);return}
    UI.escWeb=L;box.innerHTML=`<div class="webres"><b>Escolha o resultado certo</b>${L.map((x,i)=>{const a=x.address||{},e=x.extratags||{};return `<button type="button" class="webr" data-wr="${i}"><span class="besi">${ic('building',16)}</span><span><b>${esc((x.namedetails&&x.namedetails.name)||x.name||x.display_name.split(',')[0])}</b><span class="mut">${esc([a.road&&(a.road+(a.house_number?' '+a.house_number:'')),a.postcode,a.village||a.town||a.city||a.municipality].filter(Boolean).join(' · ')||x.display_name)}</span>${e.phone||e['contact:phone']||e.website||e['contact:website']?`<span class="mut">${esc([e.phone||e['contact:phone'],e.website||e['contact:website']].filter(Boolean).join(' · '))}</span>`:''}</span></button>`}).join('')}<span class="hint">Dados © contribuidores do OpenStreetMap (ODbL).</span></div>`+formRepesquisa(nome,reg,true);bindRepesquisa(c);
    $$('[data-wr]').forEach(b=>b.onclick=()=>{const x=UI.escWeb[+b.dataset.wr];const a=x.address||{},e=x.extratags||{};const subst=!!($('#ew-subst')&&$('#ew-subst').checked);const set=(k,v)=>{if(v&&(subst||!c[k])){c[k]=String(v).trim();return 1}return 0};let n=0;
      n+=set('morada',[a.road&&(a.road+(a.house_number?', '+a.house_number:'')),a.suburb||a.neighbourhood].filter(Boolean).join(', '));
      n+=set('localidade',[a.postcode,a.village||a.town||a.city||a.municipality].filter(Boolean).join(' '));
      n+=set('telefone',e.phone||e['contact:phone']);n+=set('emailEscola',e.email||e['contact:email']);n+=set('site',e.website||e['contact:website']||e.url);n+=set('codigo',e['ref:dge']||e['ref:pt:dgeec']||e.ref);
      const sobrep=['morada','localidade','telefone','emailEscola','site'].filter(k=>c[k]);saveNow();vEscola();toast(n?n+' campo(s) preenchido(s) — confirme os dados':'Os campos já estavam preenchidos (não foram substituídos)','ok')})}
  catch(err){box.innerHTML=`<div class="alert w">${ic('alert',15)} Não foi possível pesquisar (${esc(err.message)}). Se a app estiver aberta como ficheiro, o navegador pode bloquear a pesquisa; alojada num endereço https funciona.</div>`}}
function vEscola(){
  const top=vEscolas();const c=escolaPorId(UI.escEd);
  $('#view').innerHTML=top+`
  <div class="card esc-hero prev">${logoHtml('lg',c)||`<span class="logo-esc lg vazio">${ic('building',34)}</span>`}<div class="esc-t"><div class="esc-n">${esc(c.escola||'Nome da Escola')}</div>${c.agrupamento?`<div class="esc-s">${esc(c.agrupamento)}</div>`:''}<div class="esc-m">${esc(moradaEscola(c))}</div></div></div>
  <div class="card ed"><h2>Logotipo</h2>
    <div class="logo-zona" id="lg-drop">${c.logo?`<span class="logo-esc xl ${c.logoFundo===false?'sf':''}"><img src="${c.logo}" alt="Logotipo"></span>`:`<span class="logo-esc xl vazio">${ic('image',40)}</span>`}
      <div><p style="margin:0 0 10px">Toque para escolher a imagem do logotipo (PNG com fundo transparente, JPG ou SVG) ou arraste-a para aqui.</p>
        <div class="row"><button class="btn pri" id="lg-pick">${ic('upload',15)} ${c.logo?'Substituir Logotipo':'Escolher Logotipo'}</button>${c.logo?`<button class="btn dng" id="lg-del">${ic('trash',15)} Remover</button>`:''}</div>
        ${c.logo?`<label class="chk" style="margin-top:12px"><input type="checkbox" id="lg-bg" ${c.logoFundo===false?'':'checked'}> Fundo branco (recomendado para logótipos escuros no modo escuro)</label>`:''}</div></div>
    <p class="hint">O logotipo aparece no Início e nos relatórios impressos. A imagem é reduzida e guardada neste computador (e incluída na cópia de segurança).</p></div>
  <div class="card ed"><h2>Dados da Escola</h2>
    <div class="row" style="gap:8px;margin:0 0 12px;flex-wrap:wrap"><button class="btn pri" id="es-web">${ic('search',15)} Procurar Dados na Internet</button><span class="hint" style="margin:0">Usa o nome indicado e preenche morada, código postal, telefone, e-mail e sítio (OpenStreetMap). Confirme sempre.</span></div><div id="es-res"></div>
    <div class="g2">${CAMPOS_ESCOLA.map(([k,l,ph])=>`<div><label>${l}</label><input data-ce="${k}" value="${esc(c[k]||'')}" placeholder="${esc(ph)}" ${k==='emailEscola'?'type="email" inputmode="email"':k==='telefone'?'inputmode="tel"':k==='site'?'inputmode="url"':''}></div>`).join('')}</div></div>`+cartaoTipologia(c);
  $('#es-web').onclick=()=>procurarEscolaWeb(c);
  $$('[data-esed]').forEach(b=>b.onclick=()=>{UI.escEd=b.dataset.esed;if(S.escolaAtiva!==b.dataset.esed){S.escolaAtiva=b.dataset.esed;const TF=turmasFiltradas(A());S.turmaAtiva=TF[0]?TF[0].id:null;save();go('escola')}else vEscola()});
  $('#es-nova').onclick=()=>{const e={id:uid(),escola:'',tipoEscola:'regular'};escolas().push(e);UI.escEd=e.id;S.escolaAtiva=e.id;S.turmaAtiva=null;saveNow();go('escola');setTimeout(()=>{const i=$('[data-ce="escola"]');if(i)i.focus()},60)};
  $$('[data-tpe]').forEach(b=>b.onclick=()=>{const k=b.dataset.tpe;if(tipoEscola(c)===k)return;const a=A();const TT=a?a.turmas.filter(t=>escolaDe(t)===c&&!TIPOS_ESCOLA[k].ofertas.includes(ofertaDe(t))):[];
    if(TT.length&&!confirm(`Mudar ${nomeEscola(c)} para “${TIPOS_ESCOLA[k].n}”?\n\n${TT.length} turma(s) passam para a oferta “${OFERTAS[TIPOS_ESCOLA[k].ofertas[0]].nome}”${k==='profissional'?' e passam a ter Módulos':''}.`))return;
    c.tipoEscola=k;TT.forEach(t=>{t.oferta=TIPOS_ESCOLA[k].ofertas[0];if(t.oferta!=='regular')t.modulos=t.modulos||[]});saveNow();go('escola');toast(nomeEscola(c)+' · '+TIPOS_ESCOLA[k].n,'ok')});
  const edl=$('#es-del');if(edl)edl.onclick=()=>{const n=S.anos.reduce((s,a)=>s+a.turmas.filter(t=>t.escola===c.id).length,0);if(!confirm('Remover '+nomeEscola(c)+'?'+(n?'\n\nAs '+n+' turma(s) desta escola passam para a escola principal.':'')))return;S.anos.forEach(a=>a.turmas.forEach(t=>{if(t.escola===c.id)delete t.escola}));S.escolas=escolas().filter(e=>e!==c);UI.escEd='principal';S.escolaAtiva='principal';saveNow();vEscola()};
  const pick=()=>{const f=$('#logoIn');f.value='';f.onchange=()=>f.files[0]&&usarLogo(f.files[0]);f.click()};
  $('#lg-pick').onclick=pick;$('.logo-zona .logo-esc').onclick=pick;
  const z=$('#lg-drop');z.ondragover=e=>{e.preventDefault();z.classList.add('over')};z.ondragleave=()=>z.classList.remove('over');
  z.ondrop=e=>{e.preventDefault();z.classList.remove('over');const f=e.dataTransfer.files[0];if(f)usarLogo(f)};
  const d=$('#lg-del');if(d)d.onclick=()=>{if(confirm('Remover o logotipo?')){delete c.logo;saveNow();vEscola()}};
  const bg=$('#lg-bg');if(bg)bg.onchange=e=>{c.logoFundo=e.target.checked;save();vEscola()};
  $$('[data-ce]').forEach(el=>el.addEventListener('input',()=>{c[el.dataset.ce]=el.value.trim();save();barEscola();{const o=$('#selEsc option[value="'+escId(c)+'"]');if(o)o.textContent=nomeEscola(c)}
    const h=$('.esc-hero.prev');if(h){h.querySelector('.esc-n').textContent=c.escola||'Nome da Escola';h.querySelector('.esc-m').textContent=moradaEscola(c)}}));
}
async function usarLogo(file){try{escolaPorId(UI.escEd).logo=await logoDeFicheiro(file);saveNow();toast('Logotipo guardado');vEscola()}catch(e){alert(e.message)}}
function heroEscola(a){const c={...S.cfg,...EC()};
  if(!c.escola&&!c.logo)return `<div class="card esc-hero vz"><span class="logo-esc lg vazio">${ic('building',30)}</span><div class="esc-t"><div class="esc-n">A Sua Escola</div><div class="esc-m">Indique o nome e o logotipo da escola.</div></div><span class="sp1"></span><button class="btn pri" data-go="escola">Configurar Escola</button></div>`;
  return `<div class="card esc-hero">${logoHtml('lg',EC())}<div class="esc-t"><div class="esc-n">${esc(c.escola||'')}</div>${c.agrupamento?`<div class="esc-s">${esc(c.agrupamento)}</div>`:''}<div class="esc-m">${[a?'Ano letivo '+esc(a.nome):'',c.professor?esc(profNome(c.professor)):'',(a&&minhasDT(a).length)?ic('crown',13)+' '+tituloDT(c.professor)+' do '+minhasDT(a).map(esc).join(' e do '):''].filter(Boolean).join(' · ')}</div></div><span class="sp1"></span><button class="btn sm ico" data-go="escola" title="Editar escola" aria-label="Editar escola">${ic('pencil',16)}</button></div>`}

