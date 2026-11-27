/* ---------- ícones por disciplina ---------- */
function icDisc(n,sz){n=normT(n);const k=/ingles|frances|alemao|espanhol|lingua estrang|comunicar em/.test(n)?'chat':/portugues/.test(n)?'bookopen':/matemat/.test(n)?'calc':/fisic.*quim|biolog|ciencias|geolog|quimic/.test(n)?'flask':/educacao fisica/.test(n)?'run':/historia|filosof|geograf|cidadan/.test(n)?'brain':/art|desenho|music|expressao|geometria descr/.test(n)?'palette':/inform|tic|aplicac/.test(n)?'grid':'book';return ic(k,sz||14)}
/* ---------- mini-gráfico (média de cada instrumento por data) ---------- */
function sparkTurma(t){const al=alunosAval(t);const L=t.instrumentos.filter(i=>i.data).sort((a,b)=>a.data.localeCompare(b.data)).map(i=>{const v=al.map(a=>instTotal(i,a.id)).filter(x=>x!=null);return v.length&&instMax(i)?avg(v)/instMax(i):null}).filter(x=>x!=null);
  if(L.length<2)return '';const W=96,H=26,mx=Math.max(1,L.length-1);const pts=L.map((v,k)=>[(k/mx)*W,H-2-v*(H-4)]);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-label="Evolução das médias"><line x1="0" x2="${W}" y1="${H-2-.5*(H-4)}" y2="${H-2-.5*(H-4)}" class="sl"/><polyline points="${pts.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' ')}"/><circle cx="${pts[pts.length-1][0].toFixed(1)}" cy="${pts[pts.length-1][1].toFixed(1)}" r="2.6"/></svg>`}
/* ---------- próximo teste de uma turma ---------- */
function proxTeste(t,a){const hj=isoData(new Date());const i=t.instrumentos.filter(i=>i.data&&i.data>=hj).sort((x,y)=>x.data.localeCompare(y.data))[0];if(!i)return null;const oc=a&&a.calendario?ocorrenciasTurma(t,a):{};return {i,aulas:Object.keys(oc).filter(d=>d>=hj&&d<i.data).length}}
/* ---------- semana ISO (para tempos quinzenais e limite semanal) ---------- */
function semanaISO(iso){const d=dataDeIso(iso);d.setHours(0,0,0,0);d.setDate(d.getDate()+3-(d.getDay()+6)%7);const w1=new Date(d.getFullYear(),0,4);return 1+Math.round(((d-w1)/864e5-3+(w1.getDay()+6)%7)/7)}
const nlAtivoHoje=(x,iso)=>!x.freq||(semanaISO(iso)%2===0)===(x.freq==='par');
function inicioSemana(iso){const d=dataDeIso(iso);d.setDate(d.getDate()-((d.getDay()+6)%7));return isoData(d)}
function testesSemana(t,a,iso){const ini=inicioSemana(iso),fim=isoData(new Date(dataDeIso(ini).getTime()+6*864e5));
  return t.instrumentos.filter(i=>ehTeste(i)&&i.data>=ini&&i.data<=fim).length+(a.datasAval||[]).filter(d=>d.tipo==='outrotest'&&d.turma===t.id&&d.data>=ini&&d.data<=fim).length}
/* ---------- sobreposições no meu horário ---------- */
function sobreposicoes(a){const C=[];const NL=a.naoLetivos||[];const aulas=[];a.turmas.forEach(t=>aulasTurma(t,a).forEach(x=>aulas.push({...x,lbl:t.nome+' · '+t.disciplina})));
  ((a.horProf||{}).aulas||[]).filter(x=>!a.horProf.mapa[chaveAula(x)]).forEach(x=>aulas.push({...x,lbl:x.turma+' · '+x.sig}));
  NL.forEach((n,k)=>{aulas.filter(x=>x.dia===n.dia&&x.ini===n.ini).forEach(x=>C.push({n,o:x.lbl}));NL.slice(k+1).forEach(m=>{if(m.dia===n.dia&&m.ini===n.ini&&m.g!==n.g&&(!m.freq||!n.freq||m.freq===n.freq))C.push({n,o:m.sig})})});
  const seen=new Set();return C.filter(c=>{const k=c.n.dia+'|'+c.n.ini+'|'+c.o;if(seen.has(k))return false;seen.add(k);return true})}
/* ---------- alunos novos / saídos ao reimportar ---------- */
function diffAlunos(t,r){if(!t||!t.alunos.length||!r.alunos||!r.alunos.length)return '';const n=s=>normT(s);const F=new Set(r.alunos.map(x=>n(x.nome)));const T_=new Set(t.alunos.map(x=>n(x.nome)));
  const novos=r.alunos.filter(x=>!T_.has(n(x.nome))),sai=t.alunos.filter(x=>!F.has(n(x.nome)));
  return `<div class="alert ${novos.length||sai.length?'w':''}">${ic('users',15)} Comparação com a turma: <b>${r.alunos.length-novos.length}</b> já existem · <b>${novos.length}</b> novos${novos.length?' ('+novos.slice(0,6).map(x=>esc(x.nome.split(' ')[0])).join(', ')+(novos.length>6?'…':'')+')':''} · <b>${sai.length}</b> não estão no ficheiro${sai.length?' ('+sai.slice(0,6).map(x=>esc(x.nome.split(' ')[0])).join(', ')+(sai.length>6?'…':'')+')':''}.</div>`}
/* ---------- criar turmas em falta a partir do horário do professor ---------- */
function discDeSigla(sig){const s=normSig(sig);if(/^ufcd/.test(s))return null;const d=DISCIPLINAS.find(d=>normSig(d.n).startsWith(s));return d?d.n:null}
function criarTurmasEmFalta(r,mapa){const a=A();let n=0;const dist={};r.aulas.forEach(x=>{dist[chaveAula(x)]=x});
  Object.entries(dist).forEach(([k,x])=>{if(mapa[k])return;const prof=/profij/i.test(x.turma)||/^ufcd/i.test(x.sig);
    const nome=x.turma.replace(/^(\d{1,2})\s*º\s*/,'$1.º ').replace(/\s+/g,' ').trim();const ano=((nome.match(/^(\d{1,2})\./)||[])[1]||'10')+'.º';
    let disc=discDeSigla(x.sig)||(prof?(a.turmas.find(t=>ofertaDe(t)==='profij')||{}).disciplina||'Comunicar em Inglês':x.sig);
    let t=a.turmas.find(t=>normTurma(t.nome)===normTurma(nome)&&t.disciplina===disc&&escId(escolaDe(t))===escAtiva());
    if(!t){t={id:uid(),nome,anoEsc:ano,ciclo:prof?'profij':cicloDoAno(ano),oferta:prof?'profij':'regular',disciplina:disc,dominios:mkDominiosDisc(disc,prof?'profij':cicloDoAno(ano),prof?'profij':'regular'),mencoes:MENCOES_DEF.map(m=>({...m})),regra:{2:'media',3:'media'},alunos:[],instrumentos:[]};if(escAtiva()!=='principal')t.escola=escAtiva();a.turmas.push(t);n++}
    mapa[k]=t.id});saveNow();return n}
/* ---------- critérios: exportar / importar ---------- */
function exportarCriterios(t){download('Critérios '+t.disciplina+' '+t.anoEsc+'.json',JSON.stringify({app:'EduGest',criterios:{disciplina:t.disciplina,anoEsc:t.anoEsc,dominios:t.dominios.map(({ab,nome,peso})=>({ab,nome,peso})),mencoes:t.mencoes,regra:t.regra}},null,1),'application/json')}
function importarCriterios(t){const f=document.createElement('input');f.type='file';f.accept='.json,application/json';f.onchange=async()=>{try{const o=esPartilhaOk(JSON.parse(await f.files[0].text()))||{};const c=o.criterios||o;if(!Array.isArray(c.dominios))throw new Error('não tem domínios');
    if(t.instrumentos.length&&!confirm('A turma já tem instrumentos. Os domínios atuais serão substituídos e os itens perdem a ligação ao domínio. Continuar?'))return;
    t.dominios=c.dominios.map((d,k)=>({id:uid()+k,ab:d.ab,nome:d.nome,peso:+d.peso||0}));if(Array.isArray(c.mencoes))t.mencoes=c.mencoes;if(c.regra)t.regra=c.regra;saveNow();regista('Critérios',f.files[0].name,t.dominios.length+' domínios');toast('Critérios importados','ok');go('criterios')}
  catch(e){alert('Ficheiro de critérios inválido: '+e.message)}};f.click()}

