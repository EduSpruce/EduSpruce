/* ===================== v0.62 · Módulo Jornal Escolar — PAA, pauta, edições, calendário e avisos ===================== */
ICONS.news='<path d="M4 5h12v13a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M16 9h4v9a2 2 0 0 1-2 2"/><path d="M7 9h6M7 12.5h6M7 16h4"/>';
TITLES.jornal='Jornal Escolar';
const JN_MESES=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const JN_MN=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const JN_MC=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const JN_EST=[['ideia','Ideia','#6e6e73'],['atribuida','Atribuída','#7a4fd0'],['escrita','Em escrita','#d98b00'],['revisao','Em revisão','#2f7fd0'],['pronta','Pronta','#1a7f37'],['publicada','Publicada','#0f8b8d']];
const JN_TIPOS=['Notícia','Reportagem','Entrevista','Fotorreportagem','Crónica','Opinião','Agenda','Passatempo','Outro'];
const JN_FUNC=['Repórter','Fotógrafo/a','Revisor/a','Paginador/a','Editor/a','Colaborador/a'];
const JN_CHECK=['Peças recolhidas','Revisão de texto','Fotografias escolhidas (autorizações de imagem verificadas)','Paginação','Aprovação da direção','Impressão / PDF final','Divulgação (site, redes sociais, encarregados de educação)'];
const JN_PREC={dia:'Data exata',mes:'Só o mês',periodo:'Só o período',anual:'Ao longo do ano',indef:'A definir'};
/* o módulo aparece sozinho quando o professor tem um cargo ligado ao jornal (Definições › Professor › Cargos e Funções); o interruptor em Definições sobrepõe-se */
const jnCargo=()=>{try{const pf=perfil();return Object.values(pf.porEscola||{}).concat([pf]).some(o=>((o&&o.cargos)||[]).some(c=>/jornal/i.test(c)))}catch(_){return false}};
const jnOn=()=>{const m=S.cfg.modulos&&S.cfg.modulos.jornal;if(m===false)return false;if(m===true)return true;return jnCargo()||!!(A()&&A().demo)};
const jnAnoNome=()=>{const a=A();return (a&&a.nome)||anoAuto()};
const jnAnoIni=()=>{const m=String(jnAnoNome()).match(/(\d{4})/);return m?+m[1]:new Date().getFullYear()};
function JN(){const j=S.jornal=S.jornal||{};j.cfg=Object.assign({nome:'Jornal da Escola',dias:7,diasMat:2,diasEntrega:3},j.cfg||{});j.equipa=j.equipa||[];j.anos=j.anos||{};
  const y0=jnAnoIni(),k=y0+'/'+(y0+1);const y=j.anos[k]=j.anos[k]||{};y.ativ=y.ativ||[];y.pecas=y.pecas||[];y.edicoes=y.edicoes||[];return {j,y,cfg:j.cfg}}
const jnPad=n=>String(n).padStart(2,'0');
const jnIso=(y,m,d)=>y+'-'+jnPad(m)+'-'+jnPad(d);
const jnUlt=(y,m)=>new Date(y,m,0).getDate();
const jnAnoDe=(m,y0)=>m>=8?y0:y0+1;
const jnAdd=(iso,n)=>{const d=dataDeIso(iso);d.setDate(d.getDate()+n);return isoData(d)};
const jnDif=(a,b)=>Math.round((dataDeIso(b)-dataDeIso(a))/864e5);
const jnHoje=()=>isoData(new Date());
function jnPeriodos(y0){const a=A();const P=a&&a.calendario&&a.calendario.periodos;
  if(P&&P.length&&P.every(p=>p.ini&&p.fim))return P.map(p=>({n:+p.n,ini:p.ini,fim:p.fim}));
  return [{n:1,ini:jnIso(y0,9,8),fim:jnIso(y0,12,18)},{n:2,ini:jnIso(y0+1,1,4),fim:jnIso(y0+1,3,26)},{n:3,ini:jnIso(y0+1,4,6),fim:jnIso(y0+1,6,18)}]}

/* ---------- leitura das datas escritas no PAA ("12 a 16 de outubro", "Março/Abril", "2.º período", "Ao longo do ano letivo"…) ---------- */
const JN_M='\\b(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\\b\\.?';
const jnMes=s=>{s=(s||'').replace('.','');const i=JN_MESES.indexOf(s);return i>=0?i+1:(JN_MC.indexOf(s.slice(0,3))+1)};
function jnParse(txt,y0){
  let s=' '+normT(txt).replace(/[–—]/g,'-')+' ';
  const R={prec:'indef',datas:[],hora:'',horaFim:'',aprox:/a definir|aguarda|a designar|previs|a confirmar|datas? especific/.test(s)};
  const ok=(y,m,d)=>m>=1&&m<=12&&d>=1&&d<=jnUlt(y,m);
  const add=(i,f)=>{if(i&&f&&f<i)[i,f]=[f,i];if(i&&!R.datas.some(x=>x.ini===i&&x.fim===(f||i)))R.datas.push({ini:i,fim:f||i})};
  const H=[...s.matchAll(/\b([01]?\d|2[0-3])(?:h(\d{2})?|:(\d{2}))(?![\d\/])/g)];
  if(H.length){const f=h=>jnPad(+h[1])+':'+(h[2]||h[3]||'00');R.hora=f(H[0]);if(H[1])R.horaFim=f(H[1]);s=s.replace(/\b([01]?\d|2[0-3])(?:h(\d{2})?|:(\d{2}))(?![\d\/])\s*(?:horas)?/g,' ')}
  s=s.replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g,(m0,d,m,y)=>{y=+y<100?2000+ +y:+y;if(ok(y,+m,+d))add(jnIso(y,+m,+d));return ' '});
  s=s.replace(new RegExp('\\b(\\d{1,2})(?:\\s*de)?(?:\\s*'+JN_M+')?\\s*(?:a|ate|-)\\s*(\\d{1,2})\\s*(?:de\\s*)?'+JN_M+'(?:\\s*(?:de\\s*)?(\\d{4}))?','g'),(m0,d1,m1,d2,m2,y)=>{
    const M2=jnMes(m2),M1=m1?jnMes(m1):M2;const Y2=y?+y:jnAnoDe(M2,y0),Y1=y&&M1<=M2?+y:jnAnoDe(M1,y0);
    if(ok(Y1,M1,+d1)&&ok(Y2,M2,+d2))add(jnIso(Y1,M1,+d1),jnIso(Y2,M2,+d2));return ' '});
  s=s.replace(new RegExp('\\b(\\d{1,2})((?:\\s*(?:,|e)\\s*\\d{1,2})+)\\s*(?:de\\s*)?'+JN_M+'(?:\\s*(?:de\\s*)?(\\d{4}))?','g'),(m0,d1,rest,m,y)=>{
    const M=jnMes(m),Y=y?+y:jnAnoDe(M,y0);[d1,...rest.match(/\d{1,2}/g)].forEach(d=>{if(ok(Y,M,+d))add(jnIso(Y,M,+d))});return ' '});
  s=s.replace(new RegExp('\\b(\\d{1,2})\\s*(?:de\\s*)?'+JN_M+'(?:\\s*(?:de\\s*)?(\\d{4}))?','g'),(m0,d,m,y)=>{const M=jnMes(m),Y=y?+y:jnAnoDe(M,y0);if(ok(Y,M,+d))add(jnIso(Y,M,+d));return ' '});
  if(R.datas.length){R.prec='dia';R.datas.sort((a,b)=>a.ini.localeCompare(b.ini));return R}
  R.hora='';R.horaFim='';
  const spanM=(m1,m2,y)=>{const Y1=y&&m1<=m2?+y:jnAnoDe(m1,y0),Y2=y?+y:jnAnoDe(m2,y0);add(jnIso(Y1,m1,1),jnIso(Y2,m2,jnUlt(Y2,m2)))};
  s=s.replace(new RegExp(JN_M+'(?:\\s*de\\s*\\d{4})?\\s*(?:a|ate|-|\\/|e)\\s*'+JN_M+'(?:\\s*(?:de\\s*)?(\\d{4}))?','g'),(m0,m1,m2,y)=>{spanM(jnMes(m1),jnMes(m2),y);return ' '});
  s=s.replace(new RegExp(JN_M+'(?:\\s*(?:de\\s*)?(\\d{4}))?','g'),(m0,m,y)=>{const M=jnMes(m);spanM(M,M,y);return ' '});
  if(R.datas.length){R.prec='mes';R.datas.sort((a,b)=>a.ini.localeCompare(b.ini));return R}
  const P=jnPeriodos(y0);const per=n=>P.find(p=>p.n===n);
  const PM=[...s.matchAll(/((?:\b[123]\s*\.?\s*[ºo]?\s*\.?\s*(?:e|ou|\/|,|a)?\s*)+)(?:periodos?|p)\b/g)];
  PM.forEach(m=>{const ns=(m[1].match(/[123]/g)||[]).map(Number).filter(n=>per(n));if(!ns.length)return;const a=per(Math.min(...ns)),b=per(Math.max(...ns));
    if(/ultima semana/.test(s)&&ns.length===1)add(jnAdd(a.fim,-6),a.fim);else if(/(final|fim) do/.test(s)&&ns.length===1)add(jnAdd(a.fim,-13),a.fim);else add(a.ini,b.fim)});
  if(R.datas.length){R.prec='periodo';if(PM.some(m=>/ou/.test(m[1])))R.aprox=true;return R}
  if(/(final|fim) do ano/.test(s)){const p=P[P.length-1];add(jnAdd(p.fim,-13),p.fim);R.prec='periodo';return R}
  if(/ano letivo|anual|ao longo|x mes|mensal|semanal|todo o ano/.test(s)){add(P[0].ini,P[P.length-1].fim);R.prec='anual';return R}
  return R}

/* ---------- importação do PAA (.docx) ---------- */
async function jnLerDocx(file){
  const z=await unzip(await file.arrayBuffer());const xml=await z.text('word/document.xml');if(!xml)throw new Error('O ficheiro não é um documento Word (.docx) válido.');
  const doc=xmlDoc(xml);const body=tagsNS(doc,'body')[0];if(!body)throw new Error('Documento vazio.');
  const kids=(el,n)=>Array.from(el.childNodes).filter(c=>c.nodeType===1&&c.localName===n);
  const pTxt=p=>{let o='';const w=n=>{for(const c of n.childNodes){if(c.nodeType!==1)continue;const l=c.localName;if(l==='del'||l==='instrText'||l==='delText')continue;if(l==='t')o+=c.textContent;else if(l==='tab')o+=' ';else if(l==='br'||l==='cr')o+='\n';else w(c)}};w(p);return o};
  const cTxt=tc=>kids(tc,'p').map(pTxt).join('\n').replace(/ /g,' ').trim();
  const at=(el,path,attr)=>{let x=el;for(const n of path){x=x&&kids(x,n)[0];if(!x)return null}return x.getAttribute('w:'+attr)??x.getAttributeNS('*',attr)??x.getAttribute(attr)};
  const out=[];let sec='',map=null;
  for(const el of body.childNodes){if(el.nodeType!==1)continue;
    if(el.localName==='p'){const t=pTxt(el).replace(/[​ ]/g,' ').replace(/\s+/g,' ').trim();if(t&&t.length<120&&!/^(indice|anexo)$/i.test(normT(t))){if(t===t.toUpperCase()||/^(departamento|clube|equipa|servi[cç]o|projeto|programa)/i.test(t))sec=t.replace(/\s*\(a integrar posteriormente\)\s*/i,'').trim()}continue}
    if(el.localName!=='tbl')continue;
    let acima=[];
    for(const tr of kids(el,'tr')){const g=[];let col=+(at(tr,['trPr','gridBefore'],'val')||0);
      for(const tc of kids(tr,'tc')){const sp=+(at(tc,['tcPr','gridSpan'],'val')||1);const vmEl=(()=>{const pr=kids(tc,'tcPr')[0];return pr&&kids(pr,'vMerge')[0]})();
        const cont=vmEl&&(vmEl.getAttribute('w:val')||'continue')!=='restart';const t=cont?(acima[col]||''):cTxt(tc);for(let i=0;i<sp;i++)g[col+i]=t;col+=sp}
      acima=g;const N=g.map(x=>normT(x||''));
      const iA=N.findIndex(x=>x==='atividade'||x==='atividades'||x==='acao/atividade');
      if(iA>=0){const f=(re,from)=>{for(let i=from;i<N.length;i++)if(re.test(N[i]))return i;return -1};
        map={a:iA,r:f(/^responsave/,iA+1),c:f(/^calendariza/,iA+1),rec:f(/^recurso/,iA+1),ind:f(/^indicador/,iA+1),obj:f(/^objetivo/,0),pri:f(/^(prioridade|eixo)/,0),meta:f(/^meta/,0)};continue}
      if(!map||N.some(x=>/^acoes\/ ?atividades$/.test(x)))continue;
      const v=k=>map[k]>=0?(g[map[k]]||'').trim():'';const raw=v('a');
      if(!raw||/^nota\b/i.test(normT(raw))||normT(raw)==='atividade')continue;
      const T=jnTitulo(raw);if(!T.t)continue;
      out.push({sec:sec||'Geral',titulo:T.t,det:T.d,resp:v('r').replace(/\n+/g,' · ').replace(/\s+/g,' ').replace(/ · $/,''),cal:v('c').replace(/\n+/g,' / ').replace(/\s+/g,' ').replace(/( \/ )+/g,' / ').replace(/^ \/ | \/ $/g,''),rec:v('rec').replace(/\s*\n+\s*/g,' · '),ind:v('ind').replace(/\s*\n+\s*/g,' · '),obj:v('obj').replace(/\s+/g,' ')})}}
  return out}
function jnTitulo(raw){let L=String(raw).split('\n').map(x=>x.replace(/\s+/g,' ').trim());
  while(L.length&&(!L[0]||/^\d+\s*[ªº.]?\s*$/.test(L[0])))L.shift();if(!L.length)return {t:'',d:''};
  L[0]=L[0].replace(/^\d+\s*[ªº]?\s*[:.)\-]\s*/,'').replace(/^[.\-•]\s*/,'');
  const T=[];let i=0;const dest=/^(\d+\s*[ºª.]|ct\b|alunos|comunidade|turma|pais|ee\b)/i;
  for(;i<L.length;i++){if(!L[i]||(i>0&&dest.test(L[i])))break;T.push(L[i])}
  let t='';T.forEach(p=>{t=/-$/.test(t)&&/^[a-zà-ú]/.test(p)?t.slice(0,-1)+p:(t?t+' ':'')+p});
  t=t.replace(/\s+/g,' ').trim();let d=L.slice(i).filter(Boolean).join(' · ');
  if(t.length>90){const m=t.match(/^(.{12,90}?[.!?:])\s+(.+)$/);if(m){t=m[1].replace(/[.:]$/,'');d=m[2]+(d?' · '+d:'')}}
  return {t,d}}
function jnImportar(lista,ficheiro){const {y}=JN();const y0=jnAnoIni();const idx=new Map(y.ativ.filter(a=>a.orig==='paa').map(a=>[a.key,a]));const vistos=new Set();let novas=0,alt=0;
  lista.forEach(r=>{const base=normT(r.sec)+'|'+normT(r.titulo);let k=base,n=2;while(vistos.has(k))k=base+'#'+(n++);vistos.add(k);const p=jnParse(r.cal,y0);let a=idx.get(k);
    if(!a){a={id:uid(),key:k,orig:'paa',dec:null,criada:Date.now()};y.ativ.push(a);novas++}
    else if(a.cal!==r.cal){a.calAnt=a.cal;a.alterada=Date.now();a.altVista=false;alt++}
    Object.assign(a,{sec:r.sec,tit0:r.titulo,det:r.det,resp:r.resp,cal:r.cal,rec:r.rec,ind:r.ind,obj:r.obj,prec:p.prec,datas:p.datas,hora:p.hora,horaFim:p.horaFim,aprox:p.aprox,foraPAA:false});if(!a.titEd)a.titulo=r.titulo});
  let rem=0;y.ativ.forEach(a=>{if(a.orig==='paa'&&!vistos.has(a.key)&&!a.foraPAA){a.foraPAA=true;rem++}});
  y.paa={ficheiro,em:Date.now(),n:lista.length};saveNow();audit('Jornal','PAA importado',ficheiro+' · '+lista.length+' atividades');return {novas,alt,rem}}
function jnPickPAA(){let f=$('#jnIn');if(!f){f=document.createElement('input');f.type='file';f.id='jnIn';f.accept='.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';f.hidden=true;document.body.appendChild(f)}
  f.value='';f.onchange=async()=>{const file=f.files[0];if(!file)return;try{toast('A ler o PAA…');const L=await jnLerDocx(file);if(!L.length)return alert('Não foram encontradas atividades neste documento.\n\nO PAA deve ter tabelas com as colunas «Atividade», «Responsáveis» e «Calendarização».');jnPreImport(L,file.name)}catch(e){console.error(e);alert('Não foi possível ler o ficheiro: '+e.message)}};f.click()}
function jnPreImport(L,nome){const y0=jnAnoIni();const P=L.map(r=>({r,p:jnParse(r.cal,y0)}));const cnt=k=>P.filter(x=>x.p.prec===k).length;const secs=[...new Set(L.map(r=>r.sec))];const {y}=JN();const ja=y.ativ.some(a=>a.orig==='paa');
  openDrawer('Importar Plano Anual de Atividades',`<div class="ed"><p style="margin-top:0"><b>${esc(nome)}</b><br><span class="mut">Ano letivo ${esc(jnAnoNome())} · ${L.length} atividades em ${secs.length} secções</span></p>
   <div class="jn-pv">${Object.keys(JN_PREC).map(k=>`<div><b>${cnt(k)}</b><span>${JN_PREC[k]}</span></div>`).join('')}</div>
   ${ja?`<p class="hint">${ic('info',14)} Já existe um PAA importado. As decisões, peças e datas confirmadas mantêm-se; as atividades novas são juntadas e as que mudaram de data ficam assinaladas.</p>`:''}
   <div class="jn-pvl">${P.map(({r,p})=>`<div class="jn-pvi"><span class="jn-dc ${p.prec}">${esc(jnLblD(p.datas,p.prec))}</span><span><b>${esc(r.titulo)}</b><br><span class="mut">${esc(r.sec)} · «${esc(r.cal||'—')}»</span></span></div>`).join('')}</div>
   <div class="row" style="margin-top:12px"><span class="sp1"></span><button class="btn" id="jp-x">Cancelar</button><button class="btn pri" id="jp-ok">${ic('check',15)} Importar ${L.length} Atividades</button></div></div>`);
  $('#jp-x').onclick=closeDrawer;$('#jp-ok').onclick=()=>{const R=jnImportar(L,nome);closeDrawer();UI.jnTab='paa';go('jornal');toast(`PAA importado: ${R.novas} nova(s)`+(R.alt?`, ${R.alt} com data alterada`:'')+(R.rem?`, ${R.rem} já não constam`:''),'ok')}}

