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

/* ---------- datas efetivas e etiquetas ---------- */
const jnDatasEf=a=>a.conf?[{ini:a.conf,fim:a.confFim&&a.confFim>=a.conf?a.confFim:a.conf}]:(a.datas||[]);
const jnPrecEf=a=>a.conf?'dia':(a.prec||'indef');
const jnIni=a=>{const d=jnDatasEf(a)[0];return d?d.ini:''};
const jnHora=a=>a.conf?(a.confHora||''):(a.hora||'');
function jnLblD(D,prec){if(!D||!D.length)return 'A definir';const d=D[0],a=dataDeIso(d.ini),b=dataDeIso(d.fim);
  if(prec==='anual')return 'Todo o ano';
  if(prec==='periodo'){const P=jnPeriodos(jnAnoIni());const i=P.find(p=>p.ini===d.ini),f=P.find(p=>p.fim===d.fim);if(i&&f)return (i.n===f.n?i.n+'.º período':i.n+'.º–'+f.n+'.º per.')+(D.length>1?' +'+(D.length-1):'');const q=P.find(p=>d.fim===p.fim);return q?'Fim do '+q.n+'.º P':'Período'}
  if(prec==='mes')return a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear()?JN_MN[a.getMonth()]:JN_MC[a.getMonth()]+'–'+JN_MC[b.getMonth()];
  let s=d.ini===d.fim?a.getDate()+' '+JN_MC[a.getMonth()]:a.getMonth()===b.getMonth()?a.getDate()+'–'+b.getDate()+' '+JN_MC[a.getMonth()]:a.getDate()+' '+JN_MC[a.getMonth()]+'–'+b.getDate()+' '+JN_MC[b.getMonth()];
  if(D.length>1)s+=' +'+(D.length-1);return s}
const jnLbl=a=>jnLblD(jnDatasEf(a),jnPrecEf(a));
const jnPecaDe=a=>JN().y.pecas.find(p=>p.ativ===a.id);
const jnEst=k=>JN_EST.find(e=>e[0]===k)||JN_EST[0];
const jnMembro=id=>JN().j.equipa.find(m=>m.id===id);
const jnNomeM=id=>{const m=jnMembro(id);return m?m.nome:(id||'')};
const jnFeita=p=>p.estado==='pronta'||p.estado==='publicada';
function jnCobrir(a,dec){const {y,cfg}=JN();a.dec=a.dec===dec?null:dec;
  if(a.dec==='cobrir'&&!jnPecaDe(a)){const D=jnDatasEf(a);const fim=D.length?D[D.length-1].fim:'';
    y.pecas.push({id:uid(),titulo:a.titulo,tipo:'Notícia',estado:'ideia',ativ:a.id,prazo:fim&&jnPrecEf(a)==='dia'?jnAdd(fim,cfg.diasEntrega):'',autor:'',foto:'',edicao:jnEdicaoPara(fim),notas:'',criada:Date.now()})}
  save();audit('Jornal',a.dec==='cobrir'?'Atividade a cobrir':a.dec==='ignorar'?'Atividade ignorada':'Decisão anulada',a.titulo)}
function jnEdicaoPara(iso){const {y}=JN();return ((iso?y.edicoes.filter(e=>e.estado!=='publicada'&&e.fecho&&e.fecho>=iso):y.edicoes.filter(e=>e.estado!=='publicada')).sort((a,b)=>(a.fecho||'9').localeCompare(b.fecho||'9'))[0]||{}).id||''}

/* ---------- avisos ---------- */
function jnAvisos(){if(!jnOn())return [];const {y,cfg}=JN();const hj=jnHoje(),lim=jnAdd(hj,cfg.dias);const L=[];const q=d=>contagem(d);
  y.ativ.forEach(a=>{if(a.foraPAA&&a.dec!=='cobrir')return;const D=jnDatasEf(a),pr=jnPrecEf(a),p=jnPecaDe(a);
    if(pr==='dia')D.forEach(d=>{
      if(a.dec==null&&d.ini>=hj&&d.ini<=lim)L.push({g:'decidir',u:jnDif(hj,d.ini)<=2,k:'jd:'+a.id+':'+d.ini,ic:'flag',cor:'#e07a00',t:'Decidir se o jornal cobre: '+a.titulo,s:fmtIsoL(d.ini)+' · '+q(d.ini)+(a.resp?' · '+a.resp:''),a,d:d.ini});
      if(a.dec!=='cobrir')return;
      if(d.ini<=hj&&d.fim>=hj)L.push({g:'hoje',u:true,k:'jh:'+a.id+':'+hj,ic:'image',cor:'#0f8b8d',t:'Hoje: '+a.titulo,s:'Fotografias, nomes e declarações'+(jnHora(a)?' · '+jnHora(a):'')+(p&&p.autor?' · '+jnNomeM(p.autor):' · sem repórter atribuído'),a,d:hj});
      else if(d.ini>hj&&jnDif(hj,d.ini)<=3&&p&&!p.autor&&!jnFeita(p))L.push({g:'atribuir',u:true,k:'ja:'+a.id+':'+d.ini,ic:'users',cor:'#7a4fd0',t:'Atribuir repórter: '+a.titulo,s:fmtIsoL(d.ini)+' · '+q(d.ini),a,d:d.ini});
      if(d.fim<hj&&p&&(p.estado==='ideia'||p.estado==='atribuida')&&jnAdd(d.fim,cfg.diasMat)<=hj&&d.fim>=jnAdd(hj,-45)&&d===D[D.length-1])L.push({g:'material',u:true,k:'jm:'+a.id+':'+hj,ic:'file',cor:'#c0392b',t:'Recolher texto e fotos: '+a.titulo,s:'Decorreu '+q(d.fim)+(a.resp?' · pedir a '+a.resp:''),a,d:d.fim})});
    else if((pr==='mes'||pr==='periodo')&&a.dec!=='ignorar'&&D[0]){const d=D[0];if(d.ini<=lim&&d.fim>=hj&&jnDif(d.ini,d.fim)<=100)L.push({g:'confirmar',u:false,k:'jc:'+a.id+':'+hj.slice(0,7),ic:'calendar',cor:'#2f7fd0',t:'Confirmar a data: '+a.titulo,s:'No PAA: «'+(a.cal||jnLbl(a))+'»'+(a.resp?' · perguntar a '+a.resp:''),a,d:d.ini})}
    if(a.alterada&&!a.altVista)L.push({g:'alterada',u:false,k:'jx:'+a.id+':'+a.alterada,ic:'refresh',cor:'#d98b00',t:'Data alterada no PAA: '+a.titulo,s:'Antes «'+(a.calAnt||'—')+'» · agora «'+(a.cal||'—')+'»',a,d:jnIni(a)})});
  y.pecas.forEach(p=>{if(p.prazo&&p.prazo<hj&&!jnFeita(p))L.push({g:'atraso',u:true,k:'jp:'+p.id+':'+hj,ic:'alert',cor:'#c0392b',t:'Peça em atraso: '+p.titulo,s:'Prazo '+fmtIsoL(p.prazo)+' ('+q(p.prazo)+')'+(p.autor?' · '+jnNomeM(p.autor):''),p,d:p.prazo});
    else if(p.prazo&&p.prazo>=hj&&jnDif(hj,p.prazo)<=2&&!jnFeita(p))L.push({g:'prazo',u:p.prazo===hj,k:'jq:'+p.id+':'+p.prazo,ic:'clock',cor:'#e07a00',t:'Entrega '+q(p.prazo)+': '+p.titulo,s:(p.autor?jnNomeM(p.autor)+' · ':'')+jnEst(p.estado)[1],p,d:p.prazo})});
  y.edicoes.forEach(e=>{if(e.estado==='publicada')return;const pend=y.pecas.filter(p=>p.edicao===e.id&&!jnFeita(p)).length;
    if(e.fecho&&e.fecho>=hj&&e.fecho<=lim)L.push({g:'fecho',u:jnDif(hj,e.fecho)<=2,k:'je:'+e.id+':'+hj,ic:'news',cor:'#0a5aa8',t:'Fecho da edição n.º '+(e.num||'?')+' '+q(e.fecho),s:fmtIsoL(e.fecho)+' · '+(pend?pend+' peça(s) por terminar':y.pecas.some(p=>p.edicao===e.id)?'todas as peças prontas':'ainda sem peças associadas'),e,d:e.fecho});
    if(e.pub&&e.pub<hj)L.push({g:'pub',u:true,k:'jb:'+e.id+':'+hj,ic:'check',cor:'#1a7f37',t:'Edição n.º '+(e.num||'?')+': a data de publicação já passou',s:'Marque-a como publicada (ou altere a data)',e,d:e.pub})});
  return L.sort((a,b)=>(b.u-a.u)||(a.d||'9').localeCompare(b.d||'9'))}
function jnBadge(){const b=$('#jnBadge');if(!b)return;const n=jnOn()?jnAvisos().filter(x=>x.u).length:0;b.hidden=!n;b.textContent=n}
function jnNav(){const b=$('#side [data-v="jornal"]');if(!b)return;const sp=b.querySelector('.jnico');if(sp&&!sp.firstChild)sp.innerHTML=ic('news',18);const off=!jnOn()||(S.cfg.navOculto||[]).includes('jornal');b.style.display=off?'none':''}
function jnAbrirAviso(x){if(x.a)jnAtivDlg(x.a);else if(x.p)jnPecaDlg(x.p);else if(x.e)jnEdDlg(x.e)}

/* ---------- vista principal ---------- */
function vJornal(){if(!jnOn()){$('#view').innerHTML=`<div class="card empty">${ic('news',30)}<br><b>O módulo Jornal Escolar está desativado</b><br><span class="mut">Pode ativá-lo em Definições › Geral › Módulos Opcionais. Os dados guardados mantêm-se.</span><br><br><button class="btn pri" id="jn-on">Ativar o Módulo</button></div>`;$('#jn-on').onclick=()=>{jnAtivar(true);go('jornal')};return}
  const {y,cfg}=JN();const tab=UI.jnTab||'painel';const hj=jnHoje();
  $('#ttl').textContent=cfg.nome||'Jornal Escolar';
  barBtns([{id:'b-jnimp',t:ic('upload',15)+' Importar PAA…',f:jnPickPAA},{id:'b-jnics',t:ic('calendar',15)+' Exportar .ics',f:jnICS},{id:'b-jncfg',t:ic('gear',15)+' Opções',f:jnCfgDlg}]);
  const AV=jnAvisos();const prox=y.ativ.filter(a=>!a.foraPAA&&a.dec!=='ignorar'&&jnPrecEf(a)==='dia'&&jnDatasEf(a).some(d=>d.fim>=hj&&d.ini<=jnAdd(hj,14))).length;
  const curso=y.pecas.filter(p=>!jnFeita(p)).length;const ne=y.edicoes.filter(e=>e.estado!=='publicada'&&e.fecho&&e.fecho>=hj).sort((a,b)=>a.fecho.localeCompare(b.fecho))[0];
  const tabs=[['painel','bell','Painel'],['paa','list','Atividades do PAA'],['cal','calendar','Calendário'],['pecas','pen','Peças'],['edicoes','news','Edições'],['equipa','users','Redação']];
  $('#view').innerHTML=`<div class="kpis"><div class="kpi"><div class="l">${ic('bell',14)} Avisos</div><div class="v">${AV.length}</div><div class="mut">${AV.filter(x=>x.u).length} urgente(s)</div></div><div class="kpi"><div class="l">${ic('calendar',14)} Próximos 14 Dias</div><div class="v">${prox}</div><div class="mut">atividades com data</div></div><div class="kpi"><div class="l">${ic('pen',14)} Peças em Curso</div><div class="v">${curso}</div><div class="mut">${y.pecas.filter(p=>p.estado==='publicada').length} publicadas</div></div><div class="kpi"><div class="l">${ic('news',14)} Próximo Fecho</div><div class="v jn-kv">${ne?esc(contagem(ne.fecho)):'—'}</div><div class="mut">${ne?'n.º '+esc(ne.num||'?')+' · '+esc(fmtIsoL(ne.fecho)):'sem edição planeada'}</div></div></div>
   <div class="tabs noprint jn-tabs">${tabs.map(([k,i,l])=>`<button data-jt="${k}" class="${tab===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div><div id="jn-c"></div>`;
  $$('[data-jt]').forEach(b=>b.onclick=()=>{UI.jnTab=b.dataset.jt;vJornal()});
  ({painel:jnPainel,paa:jnPAA,cal:jnCal,pecas:jnPecas,edicoes:jnEdicoes,equipa:jnEquipa})[tab==='quadros'?'painel':tab](AV);jnBadge()}
function jnSemPAA(){return `<div class="card empty">${ic('upload',30)}<br><b>Importe o Plano Anual de Atividades ${esc(jnAnoNome())}</b><br><span class="mut">Escolha o ficheiro Word (.docx) do PAA da escola. A app lê as tabelas de cada departamento, clube e equipa, reconhece as datas («12 a 16 de outubro», «Março/Abril», «2.º período»…) e passa a avisá-lo do que aí vem.</span><br><br><div class="row" style="justify-content:center"><button class="btn pri" data-jnimp>${ic('upload',15)} Importar PAA (.docx)</button><button class="btn" data-jnnova>${ic('plus',15)} Juntar Atividade à Mão</button></div></div>`}
function jnBindComuns(){$$('[data-jnimp]').forEach(b=>b.onclick=jnPickPAA);$$('[data-jnnova]').forEach(b=>b.onclick=()=>jnAtivDlg(null));
  $$('[data-ja]').forEach(b=>b.onclick=e=>{if(e.target.closest('[data-jd]'))return;const a=JN().y.ativ.find(x=>x.id===b.dataset.ja);if(a)jnAtivDlg(a)});
  $$('[data-jd]').forEach(b=>b.onclick=e=>{e.stopPropagation();const [id,d]=b.dataset.jd.split('|');const a=JN().y.ativ.find(x=>x.id===id);if(a){jnCobrir(a,d);vJornal();if(a.dec==='cobrir')toast('A cobrir: '+a.titulo+' — peça criada na pauta','ok')}});
  $$('[data-jp]').forEach(b=>b.onclick=()=>{const p=JN().y.pecas.find(x=>x.id===b.dataset.jp);if(p)jnPecaDlg(p)});
  $$('[data-je]').forEach(b=>b.onclick=()=>{const e=JN().y.edicoes.find(x=>x.id===b.dataset.je);if(e)jnEdDlg(e)})}
function jnLinhaA(a,curta){const p=jnPecaDe(a);const pr=jnPrecEf(a);const hj=jnHoje();const D=jnDatasEf(a);const passou=D.length&&D[D.length-1].fim<hj&&pr==='dia';
  return `<div class="jn-li ${a.dec||'nd'} ${passou?'pass':''}" data-ja="${a.id}"><span class="jn-dc ${pr}">${esc(jnLbl(a))}${jnHora(a)?'<small>'+esc(jnHora(a))+'</small>':''}</span>
   <span class="jn-lt"><b>${esc(a.titulo)}</b>${a.foraPAA?' <span class="tag bad">já não consta do PAA</span>':''}${a.orig==='manual'?' <span class="tag">extra PAA</span>':''}${a.aprox&&!a.conf?' <span class="tag jn-w">a confirmar</span>':''}${a.conf?' <span class="tag jn-ok">'+ic('check',11)+' confirmada</span>':''}
   <span class="mut">${esc(a.sec||'')}${a.resp?' · '+esc(a.resp):''}</span>${!curta&&a.cal&&pr!=='dia'?`<span class="mut jn-calt">«${esc(a.cal)}»</span>`:''}</span>
   ${p?`<span class="tag" style="color:${jnEst(p.estado)[2]};border-color:${jnEst(p.estado)[2]}">${jnEst(p.estado)[1]}${p.autor?' · '+esc(jnNomeM(p.autor)):''}</span>`:''}
   <span class="seg jn-dec"><button data-jd="${a.id}|cobrir" class="${a.dec==='cobrir'?'on':''}" title="O jornal vai cobrir">${ic('check',13)} Cobrir</button><button data-jd="${a.id}|ignorar" class="${a.dec==='ignorar'?'on':''}" title="Não interessa ao jornal">${ic('x',12)}</button></span></div>`}
function jnPainel(AV){const {y,cfg}=JN();const c=$('#jn-c');const hj=jnHoje();
  if(!y.ativ.length&&!y.pecas.length){c.innerHTML=jnSemPAA();jnBindComuns();return}
  const G=[['hoje','Hoje'],['atraso','Em Atraso'],['material','Pedir Texto e Fotografias'],['atribuir','Atribuir Repórter'],['prazo','Entregas Próximas'],['fecho','Fecho de Edição'],['pub','Publicação'],['decidir','Decidir Cobertura'],['confirmar','Confirmar Datas'],['alterada','Alterações no PAA']];
  const sem=y.ativ.filter(a=>!a.foraPAA&&a.dec!=='ignorar'&&jnPrecEf(a)==='dia'&&jnDatasEf(a).some(d=>d.fim>=hj&&d.ini<=jnAdd(hj,14))).sort((a,b)=>jnIni(a).localeCompare(jnIni(b)));
  c.innerHTML=`<div class="jn-2"><div class="card"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">${ic('bell',18)} O Que Não Pode Esquecer</h2><span class="sp1"></span>${AV.length?`<span class="mut">${AV.length} aviso(s)</span>`:''}</div>
    ${AV.length?G.map(([g,l])=>{const X=AV.filter(x=>x.g===g);return X.length?`<h3 class="jn-gh">${l} <span class="mut">${X.length}</span></h3>${X.map(x=>`<button class="jn-av" data-jav="${esc(x.k)}" style="--ac:${x.cor}"><span class="jn-avi">${ic(x.ic,16)}</span><span><b>${esc(x.t)}</b><span class="mut">${esc(x.s)}</span></span>${x.u?'<span class="tag bad">urgente</span>':''}</button>`).join('')}`:''}).join(''):`<div class="empty" style="padding:22px 0">${ic('check',30)}<br><b>Tudo em dia</b><br><span class="mut">Os avisos aparecem aqui com ${cfg.dias} dias de antecedência (Opções).</span></div>`}</div>
   <div class="card"><h2>${ic('calendar',18)} Próximos 14 Dias no PAA</h2>${sem.length?`<div class="jn-l">${sem.map(a=>jnLinhaA(a,true)).join('')}</div>`:`<p class="mut">Sem atividades com data marcada nas próximas duas semanas.</p>`}
   <div class="row" style="margin-top:10px"><button class="btn sm" data-jgo="paa">Ver todas as atividades</button><button class="btn sm" data-jgo="cal">Calendário</button></div></div></div>`;
  $$('[data-jav]').forEach(b=>b.onclick=()=>{const x=AV.find(z=>z.k===b.dataset.jav);if(x)jnAbrirAviso(x)});$$('[data-jgo]').forEach(b=>b.onclick=()=>{UI.jnTab=b.dataset.jgo;vJornal()});jnBindComuns()}
function jnPAA(){const {y}=JN();const c=$('#jn-c');if(!y.ativ.length){c.innerHTML=jnSemPAA();jnBindComuns();return}
  const f=UI.jnF||'todas',sec=UI.jnSec||'',q=normT(UI.jnQ||''),fut=UI.jnFut!==false;const hj=jnHoje();
  const secs=[...new Set(y.ativ.map(a=>a.sec||'Geral'))];
  const L=y.ativ.filter(a=>(f==='todas'||(f==='pend'?a.dec==null:a.dec===f))&&(!sec||a.sec===sec)&&(!q||normT(a.titulo+' '+a.resp+' '+a.sec+' '+a.cal).includes(q))&&(!fut||!jnDatasEf(a).length||jnDatasEf(a).some(d=>d.fim>=hj)||jnPrecEf(a)==='indef'));
  const grupo=a=>{const pr=jnPrecEf(a);if(pr==='indef')return 'zz2';if(pr==='anual')return 'zz1';return jnIni(a).slice(0,7)};
  const G=[...new Set(L.map(grupo))].sort();const gl=g=>g==='zz1'?'Ao Longo do Ano':g==='zz2'?'Data por Definir':JN_MN[+g.slice(5)-1]+' '+g.slice(0,4);
  const n=k=>y.ativ.filter(a=>k==='pend'?a.dec==null:a.dec===k).length;
  c.innerHTML=`<div class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><div class="seg">${[['todas','Todas '+y.ativ.length],['pend','Por Decidir '+n('pend')],['cobrir','A Cobrir '+n('cobrir')],['ignorar','Ignoradas '+n('ignorar')]].map(([k,l])=>`<button data-jf="${k}" class="${f===k?'on':''}">${l}</button>`).join('')}</div>
    <select id="jn-sec" style="max-width:260px"><option value="">Todas as secções</option>${secs.map(s=>`<option ${s===sec?'selected':''}>${esc(s)}</option>`).join('')}</select>
    <label class="chk" style="margin:0"><input type="checkbox" id="jn-fut" ${fut?'checked':''}> Só por acontecer</label><span class="sp1"></span><input type="search" id="jn-q" placeholder="Procurar…" value="${esc(UI.jnQ||'')}" style="max-width:220px"><button class="btn" data-jnnova>${ic('plus',15)} Atividade</button></div>
    ${(()=>{const P=y.paa;return P?`<p class="hint" style="margin:8px 0 0">${ic('file',13)} ${esc(P.ficheiro)} · importado ${esc(new Date(P.em).toLocaleDateString('pt-PT'))} · ${P.n} atividades. Toque numa atividade para confirmar a data, ver os responsáveis e recursos.</p>`:''})()}
    ${G.length?G.map(g=>{const X=L.filter(a=>grupo(a)===g).sort((a,b)=>jnIni(a).localeCompare(jnIni(b))||a.titulo.localeCompare(b.titulo));return `<h3 class="jn-gh">${gl(g)} <span class="mut">${X.length}</span></h3><div class="jn-l">${X.map(a=>jnLinhaA(a)).join('')}</div>`}).join(''):`<div class="empty">Nenhuma atividade com estes filtros.</div>`}</div>`;
  $$('[data-jf]').forEach(b=>b.onclick=()=>{UI.jnF=b.dataset.jf;jnPAA()});$('#jn-sec').onchange=e=>{UI.jnSec=e.target.value;jnPAA()};$('#jn-fut').onchange=e=>{UI.jnFut=e.target.checked;jnPAA()};
  $('#jn-q').oninput=e=>{UI.jnQ=e.target.value;clearTimeout(jnPAA._t);jnPAA._t=setTimeout(()=>{jnPAA();const i=$('#jn-q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)};jnBindComuns()}
function jnEventos(ini,fim){const {y}=JN();const E=[];const dentro=d=>d>=ini&&d<=fim;
  y.ativ.forEach(a=>{if(a.dec==='ignorar'||(a.foraPAA&&a.dec!=='cobrir'))return;const pr=jnPrecEf(a);if(pr!=='dia')return;jnDatasEf(a).forEach(d=>{if(d.fim<ini||d.ini>fim)return;for(let x=d.ini>ini?d.ini:ini;x<=d.fim&&x<=fim;x=jnAdd(x,1))E.push({d:x,t:a.titulo,c:a.dec==='cobrir'?'cob':'nd',ja:a.id,h:x===d.ini?jnHora(a):''})})});
  y.pecas.forEach(p=>{if(p.prazo&&dentro(p.prazo)&&p.estado!=='publicada')E.push({d:p.prazo,t:'Entrega: '+p.titulo,c:'prz',jp:p.id})});
  y.edicoes.forEach(e=>{if(e.fecho&&dentro(e.fecho))E.push({d:e.fecho,t:'Fecho n.º '+(e.num||'?'),c:'fec',je:e.id});if(e.pub&&dentro(e.pub))E.push({d:e.pub,t:'Publicação n.º '+(e.num||'?'),c:'pub',je:e.id})});
  return E}
function jnCal(){const {y}=JN();const c=$('#jn-c');const hj=jnHoje();const m=UI.jnMes||hj.slice(0,7);const Y=+m.slice(0,4),M=+m.slice(5);
  const ini=jnIso(Y,M,1),fim=jnIso(Y,M,jnUlt(Y,M));const off=(dataDeIso(ini).getDay()+6)%7;const E=jnEventos(ini,fim);
  const vagos=y.ativ.filter(a=>a.dec!=='ignorar'&&!a.foraPAA&&(jnPrecEf(a)==='mes'||jnPrecEf(a)==='periodo')&&jnDatasEf(a).some(d=>d.ini<=fim&&d.fim>=ini));
  const per=jnPeriodos(jnAnoIni());const nL=s=>(per.find(p=>s>=p.ini&&s<=p.fim)||{}).n;
  let cells='';for(let i=0;i<off;i++)cells+='<div class="jn-cd vz"></div>';
  for(let d=1;d<=jnUlt(Y,M);d++){const iso=jnIso(Y,M,d);const X=E.filter(e=>e.d===iso);const fds=[0,6].includes(dataDeIso(iso).getDay());
    cells+=`<div class="jn-cd ${iso===hj?'hj':''} ${fds?'fds':''} ${nL(iso)?'':'nl'}" data-jcd="${iso}"><span class="jn-cn">${d}</span>${X.slice(0,3).map(e=>`<span class="jn-ev ${e.c}" title="${esc(e.t)}">${e.h?'<i>'+esc(e.h)+'</i> ':''}${esc(e.t)}</span>`).join('')}${X.length>3?`<span class="jn-more">+${X.length-3}</span>`:''}</div>`}
  c.innerHTML=`<div class="card"><div class="row" style="margin-bottom:10px"><button class="btn sm ico" id="jc-p" aria-label="Mês anterior">${ic('back',14)}</button><h2 style="margin:0;min-width:170px;text-align:center">${JN_MN[M-1]} ${Y}</h2><button class="btn sm ico jn-flip" id="jc-n" aria-label="Mês seguinte">${ic('back',14)}</button><button class="btn sm" id="jc-h">Hoje</button><span class="sp1"></span>
    <span class="jn-leg"><span class="jn-ev cob">A cobrir</span><span class="jn-ev nd">Por decidir</span><span class="jn-ev prz">Entrega</span><span class="jn-ev fec">Fecho</span><span class="jn-ev pub">Publicação</span></span></div>
    <div class="jn-cal">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=>`<div class="jn-cw">${d}</div>`).join('')}${cells}</div>
    ${vagos.length?`<h3 class="jn-gh">Neste mês, sem dia marcado <span class="mut">${vagos.length}</span></h3><div class="jn-l">${vagos.map(a=>jnLinhaA(a)).join('')}</div>`:''}</div>`;
  const mv=k=>{const d=new Date(Y,M-1+k,1);UI.jnMes=d.getFullYear()+'-'+jnPad(d.getMonth()+1);jnCal()};$('#jc-p').onclick=()=>mv(-1);$('#jc-n').onclick=()=>mv(1);$('#jc-h').onclick=()=>{UI.jnMes=null;jnCal()};
  $$('[data-jcd]').forEach(b=>b.onclick=()=>{const iso=b.dataset.jcd;const X=E.filter(e=>e.d===iso);
    openDrawer(fmtIsoL(iso)+' · '+contagem(iso),`<div class="ed">${X.length?`<div class="jn-l">${X.map(e=>e.ja?jnLinhaA(JN().y.ativ.find(a=>a.id===e.ja),true):`<button class="jn-av" ${e.jp?'data-jp="'+e.jp+'"':'data-je="'+e.je+'"'}><span class="jn-avi">${ic(e.jp?'pen':'news',16)}</span><span><b>${esc(e.t)}</b></span></button>`).join('')}</div>`:'<p class="mut">Nada marcado neste dia.</p>'}
     <div class="row" style="margin-top:12px"><button class="btn" id="jcd-a">${ic('plus',14)} Atividade neste dia</button><button class="btn" id="jcd-p">${ic('pen',14)} Peça com entrega neste dia</button></div></div>`);
    jnBindComuns();$('#jcd-a').onclick=()=>jnAtivDlg(null,iso);$('#jcd-p').onclick=()=>jnPecaDlg(null,{prazo:iso})});jnBindComuns()}
function jnPecas(){const {y}=JN();const c=$('#jn-c');const fe=UI.jnPE||'';const hj=jnHoje();
  const L=y.pecas.filter(p=>!fe||(fe==='sem'?!p.edicao:p.edicao===fe));const edN=id=>{const e=y.edicoes.find(x=>x.id===id);return e?'n.º '+(e.num||'?'):''};
  c.innerHTML=`<div class="card"><div class="row" style="gap:8px"><button class="btn pri" id="jpn">${ic('plus',15)} Nova Peça</button><select id="jp-ed" style="max-width:240px"><option value="">Todas as edições</option><option value="sem" ${fe==='sem'?'selected':''}>Sem edição</option>${y.edicoes.map(e=>`<option value="${e.id}" ${fe===e.id?'selected':''}>Edição n.º ${esc(e.num||'?')}${e.titulo?' · '+esc(e.titulo):''}</option>`).join('')}</select><span class="sp1"></span><span class="mut">${L.length} peça(s)</span></div></div>
   <div class="jn-kb">${JN_EST.map(([k,l,cor])=>{const X=L.filter(p=>p.estado===k).sort((a,b)=>(a.prazo||'9').localeCompare(b.prazo||'9'));return `<div class="jn-kc" data-kst="${k}"><h3 style="--ac:${cor}">${l} <span class="mut">${X.length}</span></h3>${X.map(p=>`<div class="jn-pc ${p.prazo&&p.prazo<hj&&!jnFeita(p)?'atr':''}" data-jp="${p.id}" draggable="true" data-drag="${p.id}"><b>${esc(p.titulo)}</b><span class="mut">${esc(p.tipo||'')}${p.autor?' · '+esc(jnNomeM(p.autor)):''}${p.foto?' · '+ic('image',11)+' '+esc(jnNomeM(p.foto)):''}</span><span class="jn-pm">${p.prazo?`<span class="tag ${p.prazo<hj&&!jnFeita(p)?'bad':''}">${ic('clock',11)} ${esc(fmtIsoL(p.prazo))}</span>`:''}${p.edicao?`<span class="tag">${esc(edN(p.edicao))}</span>`:''}${p.ativ?`<span class="tag">PAA</span>`:''}${k!=='publicada'?`<button class="btn sm jn-adv" data-jadv="${p.id}" title="Passar para «${jnEst(JN_EST[JN_EST.findIndex(e=>e[0]===k)+1][0])[1]}»">${ic('check',12)} ${jnEst(JN_EST[JN_EST.findIndex(e=>e[0]===k)+1][0])[1]}</button>`:''}</span></div>`).join('')||'<div class="mut jn-kv0">—</div>'}</div>`}).join('')}</div>`;
  $('#jpn').onclick=()=>jnPecaDlg(null);$('#jp-ed').onchange=e=>{UI.jnPE=e.target.value;jnPecas()};
  $$('[data-jadv]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=y.pecas.find(x=>x.id===b.dataset.jadv);if(!p)return;const i=JN_EST.findIndex(x=>x[0]===p.estado);p.estado=JN_EST[Math.min(i+1,JN_EST.length-1)][0];save();vJornal()});
  $$('[data-drag]').forEach(el=>el.ondragstart=e=>e.dataTransfer.setData('text/plain',el.dataset.drag));
  $$('[data-kst]').forEach(col=>{col.ondragover=e=>{e.preventDefault();col.classList.add('ov')};col.ondragleave=()=>col.classList.remove('ov');col.ondrop=e=>{e.preventDefault();const p=y.pecas.find(x=>x.id===e.dataTransfer.getData('text/plain'));if(p){p.estado=col.dataset.kst;save();vJornal()}}});jnBindComuns()}
function jnEdicoes(){const {y}=JN();const c=$('#jn-c');const hj=jnHoje();const L=y.edicoes.slice().sort((a,b)=>(b.fecho||'').localeCompare(a.fecho||''));
  c.innerHTML=`<div class="card"><div class="row"><h2 style="margin:0">${ic('news',18)} Edições</h2><span class="sp1"></span><button class="btn pri" id="jen">${ic('plus',15)} Nova Edição</button></div>
   ${L.length?`<div class="jn-eds">${L.map(e=>{const P=y.pecas.filter(p=>p.edicao===e.id);const ok=P.filter(jnFeita).length;const ck=(e.check||[]).length;return `<button class="jn-ed ${e.estado}" data-je="${e.id}"><span class="jn-edn">${esc(e.num||'?')}</span><span class="jn-lt"><b>${esc(e.titulo||'Edição n.º '+(e.num||'?'))}</b><span class="mut">${e.fecho?'Fecho '+esc(fmtIsoL(e.fecho))+(e.estado!=='publicada'&&e.fecho>=hj?' · '+esc(contagem(e.fecho)):''):'Sem data de fecho'}${e.pub?' · publicação '+esc(fmtIsoL(e.pub)):''}</span>
     <span class="jn-bar"><i style="width:${P.length?Math.round(100*ok/P.length):0}%"></i></span><span class="mut">${ok}/${P.length} peças prontas · lista de verificação ${ck}/${JN_CHECK.length}</span></span><span class="tag">${e.estado==='publicada'?'Publicada':e.estado==='fecho'?'Em fecho':'Planeada'}</span></button>`}).join('')}</div>`:`<div class="empty">${ic('news',30)}<br><b>Ainda sem edições</b><br><span class="mut">Crie a próxima edição com a data de fecho: as peças a cobrir ficam associadas e recebe avisos antes do fecho.</span></div>`}</div>`;
  $('#jen').onclick=()=>jnEdDlg(null);jnBindComuns()}
function jnEquipa(){const {j}=JN();const c=$('#jn-c');const {y}=JN();
  c.innerHTML=`<div class="card ed"><h2>${ic('users',18)} Redação</h2><p class="hint" style="margin-top:0">Alunos e professores que escrevem, fotografam, reveem e paginam. Aparecem para atribuir às peças.</p>
   <table class="lst"><thead><tr><th>Nome</th><th>Função</th><th>Turma</th><th>Contacto</th><th>Peças</th><th></th></tr></thead><tbody>${j.equipa.map(m=>`<tr><td><input data-jm="${m.id}|nome" value="${esc(m.nome)}"></td><td><select data-jm="${m.id}|funcao">${JN_FUNC.map(f=>`<option ${m.funcao===f?'selected':''}>${f}</option>`).join('')}</select></td><td><input data-jm="${m.id}|turma" value="${esc(m.turma||'')}" style="max-width:90px"></td><td><input data-jm="${m.id}|contacto" value="${esc(m.contacto||'')}" placeholder="e-mail ou telefone"></td><td>${y.pecas.filter(p=>(p.autor===m.id||p.foto===m.id)&&!jnFeita(p)).length} em curso</td><td><button class="btn sm ico" data-jmx="${m.id}" aria-label="Remover">${ic('x',12)}</button></td></tr>`).join('')}</tbody></table>
   <div class="row" style="margin-top:10px"><input id="jm-n" placeholder="Nome" style="max-width:240px"><select id="jm-f" style="max-width:160px">${JN_FUNC.map(f=>`<option>${f}</option>`).join('')}</select><input id="jm-t" placeholder="Turma" style="max-width:100px"><button class="btn pri" id="jm-ok">${ic('plus',15)} Juntar</button></div></div>`;
  $$('[data-jm]').forEach(i=>i.onchange=()=>{const [id,k]=i.dataset.jm.split('|');const m=jnMembro(id);if(m){m[k]=i.value.trim();save()}});
  $$('[data-jmx]').forEach(b=>b.onclick=()=>{const m=jnMembro(b.dataset.jmx);if(m&&confirm('Remover '+m.nome+' da redação?')){j.equipa=j.equipa.filter(x=>x!==m);save();jnEquipa()}});
  const add=()=>{const n=$('#jm-n').value.trim();if(!n)return $('#jm-n').focus();j.equipa.push({id:uid(),nome:n,funcao:$('#jm-f').value,turma:$('#jm-t').value.trim(),contacto:''});save();jnEquipa();setTimeout(()=>$('#jm-n')&&$('#jm-n').focus(),30)};
  $('#jm-ok').onclick=add;$('#jm-n').onkeydown=e=>{if(e.key==='Enter')add()}}

/* ---------- diálogos ---------- */
const jnOptM=(sel,vazio)=>`<option value="">${vazio||'—'}</option>`+JN().j.equipa.map(m=>`<option value="${m.id}" ${sel===m.id?'selected':''}>${esc(m.nome)} · ${esc(m.funcao||'')}</option>`).join('');
function jnPedido(a){const {cfg}=JN();const D=jnDatasEf(a);return `Olá${a.resp?' ('+a.resp+')':''},\n\nO ${cfg.nome} gostaria de noticiar a atividade «${a.titulo}»${D.length&&jnPrecEf(a)==='dia'?', prevista para '+fmtIsoL(D[0].ini):''}.\n\nPodem enviar-nos:\n• um pequeno texto (o quê, quem, quando, onde e porquê);\n• 3 a 5 fotografias (só de alunos com autorização de imagem);\n• uma ou duas declarações de participantes.\n\n${jnPrecEf(a)!=='dia'?'Podem também confirmar-nos a data exata?\n\n':''}Obrigado!\n${S.cfg.professor||''}`}
function jnAtivDlg(a,diaNovo){const {y}=JN();const novo=!a;if(novo)a={id:uid(),orig:'manual',titulo:'',sec:'Extra PAA',resp:'',cal:'',dec:null,prec:diaNovo?'dia':'indef',datas:diaNovo?[{ini:diaNovo,fim:diaNovo}]:[],criada:Date.now()};
  const p=jnPecaDe(a);const pr=a.prec||'indef';
  if(a.alterada&&!a.altVista){a.altVista=true;save()}
  openDrawer(novo?'Nova Atividade':'Atividade do '+(a.orig==='paa'?'PAA':'Jornal'),`<div class="ed jn-dlg">
   <label>Atividade</label><input id="ja-t" value="${esc(a.titulo)}" placeholder="Nome da atividade">
   <div class="jn-g2"><div><label>Secção / Departamento</label><input id="ja-s" value="${esc(a.sec||'')}"></div><div><label>Responsáveis</label><input id="ja-r" value="${esc(a.resp||'')}"></div></div>
   ${a.orig==='paa'?`<div class="jn-box"><b>No PAA:</b> «${esc(a.cal||'—')}» <span class="mut">→ ${esc(JN_PREC[pr])}: ${esc(jnLblD(a.datas,pr))}${a.hora?' · '+esc(a.hora):''}</span>${a.calAnt?`<br><span class="mut">Antes da última importação: «${esc(a.calAnt)}»</span>`:''}${a.det?`<br><span class="mut">Destinatários: ${esc(a.det)}</span>`:''}${a.rec?`<br><span class="mut">Recursos: ${esc(a.rec)}</span>`:''}${a.obj?`<br><span class="mut">Objetivo: ${esc(a.obj)}</span>`:''}</div>`:''}
   <div class="jn-g3"><div><label>${a.orig==='paa'?'Data confirmada':'Data'}</label><input type="date" id="ja-d" value="${esc(a.conf||(novo&&diaNovo)||(a.orig==='manual'&&a.datas[0]?a.datas[0].ini:''))}"></div><div><label>Até (opcional)</label><input type="date" id="ja-f" value="${esc(a.confFim||(a.orig==='manual'&&a.datas[0]&&a.datas[0].fim!==a.datas[0].ini?a.datas[0].fim:''))}"></div><div><label>Hora</label><input type="time" id="ja-h" value="${esc(a.confHora||a.hora||'')}"></div></div>
   ${a.orig==='paa'?`<p class="hint" style="margin-top:4px">Ao confirmar uma data, esta substitui a do PAA no calendário e nos avisos.${a.conf?' <button class="btn sm" id="ja-dx">Voltar à data do PAA</button>':''}</p>`:''}
   <label>Cobertura pelo jornal</label><div class="seg" id="ja-dec">${[['','Por decidir'],['cobrir','Cobrir'],['ignorar','Não cobrir']].map(([k,l])=>`<button type="button" data-v="${k}" class="${(a.dec||'')===k?'on':''}">${l}</button>`).join('')}</div>
   ${p?`<div class="jn-box" style="margin-top:10px">${ic('pen',14)} Peça: <b>${esc(p.titulo)}</b> · ${jnEst(p.estado)[1]}${p.autor?' · '+esc(jnNomeM(p.autor)):' · sem repórter'}${p.prazo?' · entrega '+esc(fmtIsoL(p.prazo)):''} <button class="btn sm" id="ja-p">Abrir Peça</button></div>`:''}
   <label style="margin-top:10px">Notas</label><textarea id="ja-n" style="min-height:70px" placeholder="Contactos, local, o que fotografar…">${esc(a.notas||'')}</textarea>
   <div class="row" style="margin-top:12px">${a.orig==='manual'&&!novo?`<button class="btn dng" id="ja-x">${ic('trash',14)} Apagar</button>`:''}<button class="btn" id="ja-cp">${ic('copy',14)} Copiar Pedido ao Responsável</button><span class="sp1"></span><button class="btn pri" id="ja-ok">${ic('check',15)} Guardar</button></div></div>`);
  let dec=a.dec||'';$$('#ja-dec [data-v]').forEach(b=>b.onclick=()=>{dec=b.dataset.v;$$('#ja-dec [data-v]').forEach(x=>x.classList.toggle('on',x===b))});
  const guardar=()=>{const t=$('#ja-t').value.trim();if(!t){alert('Indique o nome da atividade.');return false}
    if(t!==a.titulo&&a.orig==='paa')a.titEd=true;a.titulo=t;a.sec=$('#ja-s').value.trim()||a.sec;a.resp=$('#ja-r').value.trim();a.notas=$('#ja-n').value;
    const d=$('#ja-d').value,f=$('#ja-f').value,h=$('#ja-h').value;
    if(a.orig==='paa'){a.conf=d||undefined;a.confFim=d&&f?f:undefined;a.confHora=d?h:undefined;if(!d&&h)a.hora=h}
    else{a.datas=d?[{ini:d,fim:f&&f>=d?f:d}]:[];a.prec=d?'dia':'indef';a.hora=h;a.cal=d?'':a.cal}
    if(novo)y.ativ.push(a);const p0=jnPecaDe(a);
    if((dec||null)!==a.dec){a.dec=dec==='cobrir'?null:a.dec;if(dec==='cobrir')jnCobrir(a,'cobrir');else a.dec=dec||null}
    if(p0&&!p0.prazo&&jnPrecEf(a)==='dia'){const D=jnDatasEf(a);p0.prazo=jnAdd(D[D.length-1].fim,JN().cfg.diasEntrega)}
    save();return true};
  $('#ja-ok').onclick=()=>{if(guardar()){closeDrawer();vJornal()}};
  $('#ja-cp').onclick=()=>{const t=jnPedido({...a,titulo:$('#ja-t').value||a.titulo});try{navigator.clipboard.writeText(t).then(()=>toast('Pedido copiado — cole-o no e-mail ou no Teams','ok'),()=>prompt('Copie o texto:',t))}catch(_){prompt('Copie o texto:',t)}};
  if($('#ja-dx'))$('#ja-dx').onclick=()=>{a.conf=a.confFim=a.confHora=undefined;save();jnAtivDlg(a)};
  if($('#ja-p'))$('#ja-p').onclick=()=>{if(guardar())jnPecaDlg(jnPecaDe(a))};
  if($('#ja-x'))$('#ja-x').onclick=()=>{if(!confirm('Apagar a atividade «'+a.titulo+'»?'))return;y.ativ=y.ativ.filter(x=>x!==a);const pp=jnPecaDe(a);if(pp)pp.ativ='';save();closeDrawer();vJornal()}}
function jnPecaDlg(p,pre){const {y}=JN();const novo=!p;if(novo)p=Object.assign({id:uid(),titulo:'',tipo:'Notícia',estado:'ideia',autor:'',foto:'',prazo:'',edicao:jnEdicaoPara(''),notas:'',criada:Date.now()},pre||{});
  const a=p.ativ&&y.ativ.find(x=>x.id===p.ativ);
  openDrawer(novo?'Nova Peça':'Peça',`<div class="ed jn-dlg"><label>Título</label><input id="jp-t" value="${esc(p.titulo)}" placeholder="Título de trabalho">
   ${a?`<div class="jn-box">${ic('list',14)} Atividade: <b>${esc(a.titulo)}</b> · ${esc(jnLbl(a))} <button class="btn sm" id="jp-a">Abrir</button></div>`:''}
   <div class="jn-g2"><div><label>Tipo</label><select id="jp-ti">${JN_TIPOS.map(t=>`<option ${p.tipo===t?'selected':''}>${t}</option>`).join('')}</select></div><div><label>Estado</label><select id="jp-e">${JN_EST.map(([k,l])=>`<option value="${k}" ${p.estado===k?'selected':''}>${l}</option>`).join('')}</select></div></div>
   <div class="jn-g2"><div><label>Autor / repórter</label><select id="jp-au">${jnOptM(p.autor,'Sem repórter')}</select></div><div><label>Fotografia</label><select id="jp-fo">${jnOptM(p.foto,'Sem fotógrafo')}</select></div></div>
   ${JN().j.equipa.length?'':`<p class="hint">Junte os elementos da redação no separador «Redação» para os poder atribuir.</p>`}
   <div class="jn-g2"><div><label>Prazo de entrega</label><input type="date" id="jp-pz" value="${esc(p.prazo||'')}"></div><div><label>Edição</label><select id="jp-edc"><option value="">Sem edição</option>${y.edicoes.map(e=>`<option value="${e.id}" ${p.edicao===e.id?'selected':''}>N.º ${esc(e.num||'?')}${e.fecho?' · fecho '+esc(fmtIsoL(e.fecho)):''}</option>`).join('')}</select></div></div>
   <label class="chk"><input type="checkbox" id="jp-ok2" ${p.fotosOk?'checked':''}> Fotografias com alunos: autorizações de imagem verificadas</label>
   <label>Notas / texto</label><textarea id="jp-n" placeholder="Ideias, contactos, rascunho…">${esc(p.notas||'')}</textarea>
   <div class="row" style="margin-top:12px">${novo?'':`<button class="btn dng" id="jp-x">${ic('trash',14)} Apagar</button>`}<span class="sp1"></span><button class="btn pri" id="jp-ok">${ic('check',15)} Guardar</button></div></div>`);
  const guardar=()=>{const t=$('#jp-t').value.trim();if(!t){alert('Indique o título.');return false}Object.assign(p,{titulo:t,tipo:$('#jp-ti').value,estado:$('#jp-e').value,autor:$('#jp-au').value,foto:$('#jp-fo').value,prazo:$('#jp-pz').value,edicao:$('#jp-edc').value,fotosOk:$('#jp-ok2').checked,notas:$('#jp-n').value});
    if(p.autor&&p.estado==='ideia')p.estado='atribuida';if(novo)y.pecas.push(p);save();return true};
  $('#jp-ok').onclick=()=>{if(guardar()){closeDrawer();vJornal()}};if($('#jp-a'))$('#jp-a').onclick=()=>{if(guardar())jnAtivDlg(a)};
  if($('#jp-x'))$('#jp-x').onclick=()=>{if(!confirm('Apagar a peça «'+p.titulo+'»?'))return;y.pecas=y.pecas.filter(x=>x!==p);if(a&&a.dec==='cobrir')a.dec=null;save();closeDrawer();vJornal()}}
function jnEdDlg(e){const {y}=JN();const novo=!e;if(novo){const n=y.edicoes.reduce((m,x)=>Math.max(m,+x.num||0),0)+1;e={id:uid(),num:String(n),titulo:'',fecho:'',pub:'',estado:'planeada',check:[],notas:''}}
  const P=y.pecas.filter(p=>p.edicao===e.id);const soltas=y.pecas.filter(p=>!p.edicao&&p.estado!=='publicada');
  openDrawer(novo?'Nova Edição':'Edição n.º '+(e.num||'?'),`<div class="ed jn-dlg"><div class="jn-g3"><div><label>Número</label><input id="je-n" value="${esc(e.num||'')}"></div><div><label>Data de fecho</label><input type="date" id="je-f" value="${esc(e.fecho||'')}"></div><div><label>Publicação</label><input type="date" id="je-p" value="${esc(e.pub||'')}"></div></div>
   <label>Título / tema</label><input id="je-t" value="${esc(e.titulo||'')}" placeholder="Ex.: Edição de Natal">
   <label>Estado</label><div class="seg" id="je-e">${[['planeada','Planeada'],['fecho','Em fecho'],['publicada','Publicada']].map(([k,l])=>`<button type="button" data-v="${k}" class="${e.estado===k?'on':''}">${l}</button>`).join('')}</div>
   <label style="margin-top:10px">Lista de verificação</label>${JN_CHECK.map((c,i)=>`<label class="chk"><input type="checkbox" data-jck="${i}" ${(e.check||[]).includes(i)?'checked':''}> ${esc(c)}</label>`).join('')}
   ${novo?'':`<label style="margin-top:10px">Peças (${P.length})</label>${P.length?`<div class="jn-l">${P.map(p=>`<button class="jn-av" data-jp="${p.id}"><span class="jn-avi" style="color:${jnEst(p.estado)[2]}">${ic('pen',15)}</span><span><b>${esc(p.titulo)}</b><span class="mut">${jnEst(p.estado)[1]}${p.autor?' · '+esc(jnNomeM(p.autor)):''}</span></span></button>`).join('')}</div>`:'<p class="mut">Ainda sem peças.</p>'}${soltas.length?`<button class="btn sm" id="je-j">${ic('plus',13)} Juntar ${soltas.length} peça(s) sem edição</button>`:''}`}
   <label>Notas</label><textarea id="je-no" style="min-height:60px">${esc(e.notas||'')}</textarea>
   <div class="row" style="margin-top:12px">${novo?'':`<button class="btn dng" id="je-x">${ic('trash',14)} Apagar</button>`}<span class="sp1"></span><button class="btn pri" id="je-ok">${ic('check',15)} Guardar</button></div></div>`);
  let est=e.estado;$$('#je-e [data-v]').forEach(b=>b.onclick=()=>{est=b.dataset.v;$$('#je-e [data-v]').forEach(x=>x.classList.toggle('on',x===b))});
  const guardar=()=>{Object.assign(e,{num:$('#je-n').value.trim(),fecho:$('#je-f').value,pub:$('#je-p').value,titulo:$('#je-t').value.trim(),estado:est,notas:$('#je-no').value,check:$$('[data-jck]').filter(x=>x.checked).map(x=>+x.dataset.jck)});
    if(est==='publicada')y.pecas.filter(p=>p.edicao===e.id&&p.estado==='pronta').forEach(p=>p.estado='publicada');if(novo)y.edicoes.push(e);save();return true};
  $('#je-ok').onclick=()=>{guardar();closeDrawer();vJornal()};jnBindComuns();
  if($('#je-j'))$('#je-j').onclick=()=>{guardar();soltas.forEach(p=>p.edicao=e.id);save();jnEdDlg(e)};
  if($('#je-x'))$('#je-x').onclick=()=>{if(!confirm('Apagar a edição n.º '+e.num+'? As peças ficam sem edição.'))return;y.edicoes=y.edicoes.filter(x=>x!==e);y.pecas.forEach(p=>{if(p.edicao===e.id)p.edicao=''});save();closeDrawer();vJornal()}}
function jnCfgDlg(){const {cfg}=JN();openDrawer('Opções do Jornal',`<div class="ed"><label>Nome do jornal</label><input id="jo-n" value="${esc(cfg.nome)}">
  <div class="jn-g3"><div><label>Avisar com antecedência (dias)</label><input type="number" id="jo-d" min="1" max="60" value="${cfg.dias}"></div><div><label>Pedir material após (dias)</label><input type="number" id="jo-m" min="0" max="30" value="${cfg.diasMat}"></div><div><label>Prazo da peça após atividade</label><input type="number" id="jo-e" min="0" max="30" value="${cfg.diasEntrega}"></div></div>
  <p class="hint">Os avisos urgentes aparecem também na janela «Avisos Urgentes» e no número ao lado de «Jornal Escolar» na barra lateral. Para alarmes no iPad/Mac mesmo com a app fechada, use «Exportar .ics».</p>
  <div class="row" style="margin-top:12px"><button class="btn" id="jo-off">Desativar o módulo</button><span class="sp1"></span><button class="btn pri" id="jo-ok">${ic('check',15)} Guardar</button></div></div>`);
  $('#jo-ok').onclick=()=>{cfg.nome=$('#jo-n').value.trim()||'Jornal Escolar';cfg.dias=Math.max(1,Math.min(60,+$('#jo-d').value||7));cfg.diasMat=Math.max(0,+$('#jo-m').value||0);cfg.diasEntrega=Math.max(0,+$('#jo-e').value||0);save();closeDrawer();vJornal()};
  $('#jo-off').onclick=()=>{if(confirm('Desativar o módulo Jornal Escolar? Os dados ficam guardados e pode voltar a ativá-lo em Definições.')){jnAtivar(false);closeDrawer();go('inicio')}}}
function jnAtivar(on){S.cfg.modulos=S.cfg.modulos||{};S.cfg.modulos.jornal=!!on;save();audit('Jornal',on?'Módulo ativado':'Módulo desativado','');jnNav();jnBadge()}
function jnICS(){const {y,cfg}=JN();const e=s=>String(s||'').replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');const dd=iso=>iso.replace(/-/g,'');const st=icsData(new Date());
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EduSpruce//Jornal//PT','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+e(cfg.nome)];let n=0;
  const ev=(id,ini,fim,hora,tit,desc,alarme)=>{L.push('BEGIN:VEVENT','UID:'+id+'@eduflow-jornal','DTSTAMP:'+st);
    if(hora){const [h,m]=hora.split(':');L.push('DTSTART:'+dd(ini)+'T'+h+m+'00','DURATION:PT1H')}else L.push('DTSTART;VALUE=DATE:'+dd(ini),'DTEND;VALUE=DATE:'+dd(jnAdd(fim,1)));
    L.push('SUMMARY:'+e(tit));if(desc)L.push('DESCRIPTION:'+e(desc));if(alarme)L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+e(tit),'TRIGGER:'+alarme,'END:VALARM');L.push('END:VEVENT');n++};
  y.ativ.forEach(a=>{if(a.dec==='ignorar'||jnPrecEf(a)!=='dia'||(a.foraPAA&&a.dec!=='cobrir'))return;jnDatasEf(a).forEach((d,i)=>ev(a.id+'-'+i,d.ini,d.fim,d.ini===d.fim?jnHora(a):'',(a.dec==='cobrir'?'📰 ':'')+a.titulo,[a.sec,a.resp?'Responsáveis: '+a.resp:'',a.cal?'PAA: '+a.cal:'',a.notas].filter(Boolean).join('\n'),a.dec==='cobrir'?'-P1D':''))});
  y.pecas.forEach(p=>{if(p.prazo&&!jnFeita(p))ev('p'+p.id,p.prazo,p.prazo,'','Entrega: '+p.titulo,p.autor?jnNomeM(p.autor):'','-P1D')});
  y.edicoes.forEach(x=>{if(x.fecho)ev('f'+x.id,x.fecho,x.fecho,'','Fecho do '+cfg.nome+' n.º '+(x.num||'?'),x.titulo,'-P3D');if(x.pub)ev('b'+x.id,x.pub,x.pub,'','Publicação do '+cfg.nome+' n.º '+(x.num||'?'),x.titulo,'')});
  L.push('END:VCALENDAR');download(cfg.nome+' '+jnAnoNome().replace('/','-')+'.ics',L.join('\r\n'),'text/calendar');toast(n+' eventos exportados — abra o ficheiro para os juntar ao Calendário','ok')}

/* ---------- ligações ao resto da app ---------- */
{const nav=$('#side [data-v="jornal"]');if(nav)nav.onclick=()=>go('jornal')}
{const _g=go;go=function(v){if(v==='jornal'&&!jnOn())v='inicio';const r=_g.apply(this,arguments);try{jnNav();jnBadge()}catch(_){}return r}}
{const _ap=aplicarPrefs;aplicarPrefs=function(){const r=_ap.apply(this,arguments);try{jnNav()}catch(_){}return r}}
{const _au=avisosUrgentes;avisosUrgentes=function(){const L=_au.apply(this,arguments);try{const V=avVistos(),agora=Date.now();jnAvisos().filter(x=>x.u).forEach(x=>{const k=x.k+':'+jnHoje();if(V[k]&&V[k]>agora)return;L.push({k,g:'jornal',ic:x.ic,cor:x.cor,t:x.t,s:x.s,ir:()=>{UI.jnTab='painel';go('jornal');setTimeout(()=>jnAbrirAviso(x),60)}})})}catch(err){console.warn(err)}return L}}
WIDGETS.push(['jornal','Jornal Escolar','news']);
{const _pi=posInicio;posInicio=function(){try{const main=$('.in-main');if(main&&jnOn()&&!$('.jn-w0')){const {y,cfg}=JN();const AV=jnAvisos();const hj=jnHoje();const X=y.ativ.filter(a=>!a.foraPAA&&a.dec!=='ignorar'&&jnPrecEf(a)==='dia'&&jnDatasEf(a).some(d=>d.fim>=hj&&d.ini<=jnAdd(hj,cfg.dias))).sort((a,b)=>jnIni(a).localeCompare(jnIni(b))).slice(0,5);
    main.insertAdjacentHTML('beforeend',`<div class="card jn-w0" data-w="jornal"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">${ic('news',18)} ${esc(cfg.nome)}</h2><span class="sp1"></span><button class="btn sm" id="jw-go">Abrir</button></div>
     ${!y.ativ.length?`<p class="mut" style="margin:0">Importe o PAA para receber avisos das atividades a cobrir.</p>`:''}
     ${AV.filter(x=>x.u).slice(0,4).map(x=>`<div class="jn-wl" style="--ac:${x.cor}">${ic(x.ic,14)} <b>${esc(x.t)}</b> <span class="mut">${esc(x.s)}</span></div>`).join('')}
     ${X.length?`<div class="mut" style="margin:8px 0 4px;font-size:12px">Próximos ${cfg.dias} dias no PAA</div>${X.map(a=>`<div class="jn-wl"><span class="jn-dc dia">${esc(jnLbl(a))}</span> ${esc(a.titulo)} ${a.dec==='cobrir'?'<span class="tag">a cobrir</span>':a.dec==null?'<span class="tag jn-w">por decidir</span>':''}</div>`).join('')}`:''}</div>`);
    const b=$('#jw-go');if(b)b.onclick=()=>{UI.jnTab='painel';go('jornal')}}}catch(err){console.warn(err)}return _pi.apply(this,arguments)}}
{const _ca=cartaoAvisosDef,_ba=bindAvisosDef;cartaoAvisosDef=function(){return _ca.apply(this,arguments)+`<div class="card ed" id="def-mods"><h2>${ic('layers',18)} Módulos Opcionais</h2><p class="hint" style="margin-top:0">Ative só o que usa. Desativar um módulo esconde-o da barra lateral, do Início e dos avisos — os dados ficam guardados.</p>
    <label class="chk"><input type="checkbox" id="mod-jn" ${jnOn()?'checked':''}> ${ic('news',15)} <span><b>Jornal Escolar</b><br><span class="mut">Plano Anual de Atividades, pauta de peças, edições, redação, calendário e avisos</span></span></label></div>`};
  bindAvisosDef=function(){const r=_ba.apply(this,arguments);const c=$('#mod-jn');if(c)c.onchange=()=>{jnAtivar(c.checked);toast(c.checked?'Módulo Jornal Escolar ativado':'Módulo Jornal Escolar desativado','ok')};return r}}
try{AJUDA.push({id:'jornal',ic:'news',t:'Jornal Escolar e Plano Anual de Atividades',gif:null,txt:`<p>O módulo <b>Jornal Escolar</b> (barra lateral) ajuda o responsável pelo jornal a não perder nenhuma atividade da escola.</p><ul><li><b>Importar PAA…</b> lê o documento Word do Plano Anual de Atividades: todas as tabelas (departamentos, clubes, equipas), com atividade, responsáveis e calendarização. As datas escritas por extenso são reconhecidas («12 a 16 de outubro», «8 e 12 de fevereiro», «Março/Abril», «2.º período», «Ao longo do ano letivo»). Pode importar de novo uma versão revista: as decisões e peças mantêm-se e as alterações de data ficam assinaladas.</li><li>Em cada atividade escolha <b>Cobrir</b> ou não: ao cobrir, é criada uma peça na pauta com prazo de entrega. Confirme as datas que no PAA só têm o mês ou o período.</li><li><b>Peças</b>: quadro por estado (ideia, atribuída, em escrita, em revisão, pronta, publicada) — arraste os cartões. <b>Edições</b>: data de fecho e de publicação, lista de verificação. <b>Redação</b>: alunos e professores da equipa.</li><li><b>Avisos</b>: decidir cobertura, atribuir repórter, hoje há atividade, pedir texto e fotos depois da atividade, confirmar datas, peças em atraso e fecho de edição. Os urgentes aparecem na janela de Avisos Urgentes; «Exportar .ics» põe tudo no Calendário do iPad/Mac com alarmes.</li><li>O módulo pode ser desativado em Definições › Geral › Módulos Opcionais.</li></ul>`})}catch(_){}

/* v0.63 · Demonstração do Jornal Escolar (só se o jornal deste ano ainda estiver vazio) */
function criarDemoJornal(){try{if(!jnOn())return;const {j,y}=JN();if(y.ativ.length||y.pecas.length||y.edicoes.length)return;const MN=JN_MESES.map(m=>m==='marco'?'março':m);
  const dia=n=>{const d=new Date();d.setDate(d.getDate()+n);while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+(n<0?-1:1));return d};const txt=d=>d.getDate()+' de '+MN[d.getMonth()];
  const ate=(a,b)=>{const x=dia(a),z=dia(b);return x.getMonth()===z.getMonth()?x.getDate()+' a '+z.getDate()+' de '+MN[x.getMonth()]:txt(x)+' a '+txt(z)};
  const L=[['Departamento de Línguas','Semana das Línguas Europeias','Atividades nas aulas e exposição no átrio.','Departamento de Línguas',ate(-40,-36)],
    ['Biblioteca Escolar','Feira do Livro','Venda e troca de livros; sessão com autor açoriano.','Equipa da Biblioteca',ate(-12,-8)],
    ['Desporto Escolar','Corta-Mato Escolar','Fase escola; apuramento para a fase de ilha.','Grupo de Educação Física',txt(dia(3))],
    ['Ciências Experimentais','Dia da Ciência — laboratórios abertos','Experiências demonstrativas para o 1.º ciclo.','Departamento de Ciências',txt(dia(6))],
    ['Cidadania','Assembleia de Delegados de Turma','Eleição da mesa e plano de ação.','Direção',txt(dia(10))],
    ['Ensino Profissional','Visita de estudo — Técnico de Turismo','Roteiro turístico da ilha com os formandos da TT 2.','Curso Profissional de Técnico de Turismo',txt(dia(15))],
    ['Expressões','Concerto de Natal','Coro e orquestra da escola no auditório.','Grupo de Música','Dezembro'],
    ['Biblioteca Escolar','Concurso Nacional de Leitura — fase escola','Provas escritas e orais.','Equipa da Biblioteca','2.º período'],
    ['Cidadania','Semana da Saúde Mental','Palestras e workshops com a psicóloga escolar.','SPO','Fevereiro'],
    ['Departamento de Línguas','Spelling Bee','Concurso de soletração em inglês (2.º e 3.º ciclos).','Departamento de Línguas','Março/Abril'],
    ['Direção','Dia do Patrono','Cerimónia, exposições e sessão solene.','Direção','3.º período'],
    ['Clubes','Clube de Robótica','Sessões semanais e participação em concursos.','Clube de Robótica','Ao longo do ano letivo']].map(([sec,titulo,det,resp,cal])=>({sec,titulo,det,resp,cal,rec:'',ind:'',obj:''}));
  jnImportar(L,'PAA (demonstração).docx');
  [['Ana Sofia Medeiros','Repórter','10.º A'],['Tomás Rocha Sousa','Fotógrafo/a','11.º B'],['Leonor Furtado','Revisor/a','12.º A'],['Duarte Câmara','Paginador/a','11.º C'],[S.cfg.professor||'Professor(a) responsável','Editor/a','']].forEach(([nome,funcao,turma])=>j.equipa.push({id:uid(),nome,funcao,turma,contacto:'',demo:true}));
  const E=j.equipa;const hj=isoData(new Date());
  const e1={id:uid(),num:'1',titulo:'Edição de outono',fecho:isoData(dia(-25)),pub:isoData(dia(-20)),estado:'publicada',check:JN_CHECK.map((_,k)=>k),notas:'',demo:true};
  const e2={id:uid(),num:'2',titulo:'Edição de Natal',fecho:isoData(dia(12)),pub:isoData(dia(18)),estado:'planeada',check:[0],notas:'Capa: Concerto de Natal.',demo:true};y.edicoes.push(e1,e2);
  const porT=t=>y.ativ.find(a=>a.titulo===t);
  ['Semana das Línguas Europeias','Feira do Livro','Corta-Mato Escolar','Dia da Ciência — laboratórios abertos','Visita de estudo — Técnico de Turismo','Concerto de Natal','Clube de Robótica'].forEach(t=>{const a=porT(t);if(a)jnCobrir(a,'cobrir')});
  const ig=porT('Assembleia de Delegados de Turma');if(ig)jnCobrir(ig,'ignorar');
  const est={'Semana das Línguas Europeias':['publicada',e1,0,1],'Feira do Livro':['revisao',e2,0,1],'Corta-Mato Escolar':['atribuida',e2,1,1],'Dia da Ciência — laboratórios abertos':['ideia',e2,0,null],'Visita de estudo — Técnico de Turismo':['atribuida',e2,0,1],'Concerto de Natal':['ideia',e2,null,null],'Clube de Robótica':['escrita',e2,0,1]};
  y.pecas.forEach(p=>{const a=y.ativ.find(x=>x.id===p.ativ);const s=a&&est[a.titulo];if(!s)return;p.estado=s[0];p.edicao=s[1].id;if(s[2]!=null)p.autor=E[s[2]].id;if(s[3]!=null)p.foto=E[s[3]].id;p.demo=true;if(a.titulo==='Feira do Livro'){p.tipo='Reportagem';p.prazo=isoData(dia(2))}if(a.titulo==='Clube de Robótica'){p.tipo='Entrevista';p.prazo=isoData(dia(-1))}});
  y.pecas.push({id:uid(),titulo:'Passatempo: palavras cruzadas de Natal',tipo:'Passatempo',estado:'escrita',ativ:'',prazo:isoData(dia(8)),autor:E[2].id,foto:'',edicao:e2.id,notas:'',criada:Date.now(),demo:true},
    {id:uid(),titulo:'Opinião: telemóveis nos intervalos',tipo:'Opinião',estado:'pronta',ativ:'',prazo:isoData(dia(5)),autor:E[0].id,foto:'',edicao:e2.id,notas:'',criada:Date.now(),demo:true});
  save()}catch(err){console.warn('demo jornal',err)}}
{const _cDj=criarDemo;criarDemo=function(){const n0=S.anos.length;const r=_cDj.apply(this,arguments);try{if(S.anos.length>n0){criarDemoJornal();saveNow()}}catch(err){console.warn(err)}return r}}

/* v0.63 · Perfis de animação: sem · minimalista · cheio */
const ANIM_P=[['sem','Sem Animações','Nada se mexe: ideal para apresentar, para quem prefere calma ou para poupar bateria.'],['min','Minimalista','Só transições curtas e discretas (fade) ao mudar de secção e ao abrir painéis.'],['cheio','Cheio de Animações','Entradas em cascata, números a contar, barras e gráficos a crescer, efeitos ao tocar, confetes nas conquistas e muito mais.']];
const animPerfil=()=>{const v=S.cfg.animPerfil;return v==='sem'||v==='min'||v==='cheio'?v:'cheio'};
function animAplicar(){const r=document.documentElement,p=animPerfil();['sem','min','cheio'].forEach(k=>r.classList.toggle('anim-'+k,k===p));
  /* «Sem» liga o modo de movimento reduzido (o mesmo da Acessibilidade); os outros respeitam a Acessibilidade */
  if(p==='sem')r.classList.add('a11y-rm');else{r.classList.remove('a11y-rm');try{_aA11(true)}catch(_){}}}
/* re-aplicar a acessibilidade sem perder o perfil «Sem» */
let _aA11=()=>{};{const _a1=aplicarA11yCfg;_aA11=function(){return _a1.apply(this,arguments)};aplicarA11yCfg=function(){const r=_a1.apply(this,arguments);try{if(animPerfil()==='sem')document.documentElement.classList.add('a11y-rm');['sem','min','cheio'].forEach(k=>document.documentElement.classList.toggle('anim-'+k,k===animPerfil()))}catch(_){}return r}}
{const _cn=contarNumeros;contarNumeros=function(){if(animPerfil()!=='cheio')return;return _cn.apply(this,arguments)}}
/* cascata de linhas, barras a crescer e linhas de gráficos a desenhar (perfil cheio) */
function animCheio(root){if(animPerfil()!=='cheio'||!animOK())return;root=root||$('#view');if(!root)return;
  root.querySelectorAll('table.lst tbody, .jn-l, .mral, .jn-eds').forEach(tb=>{[...tb.children].slice(0,28).forEach((tr,k)=>{tr.style.setProperty('--ai',k);tr.classList.add('an-row')})});
  root.querySelectorAll('svg:not(.ic) path,svg:not(.ic) polyline').forEach(p=>{const sv=p.ownerSVGElement;if(sv&&(sv.closest('.ic,button,.btn,.nav')||(sv.width&&sv.width.baseVal&&sv.width.baseVal.value&&sv.width.baseVal.value<40)))return;const cs=getComputedStyle(p);if(cs.fill!=='none'&&p.getAttribute('fill')!=='none')return;if(cs.strokeDasharray&&cs.strokeDasharray!=='none')return;if(!p.getTotalLength)return;let L=0;try{L=p.getTotalLength()}catch(_){}if(L<40)return;p.style.setProperty('--al',L);p.classList.add('an-draw')})}
{const _gAn=go;go=function(){const r=_gAn.apply(this,arguments);try{requestAnimationFrame(()=>animCheio())}catch(_){}return r}}
/* confetes discretos nos toasts de sucesso */
function animConfetes(x,y){if(animPerfil()!=='cheio'||!animOK())return;const cores=['#f59e0b','#10b981','#3b82f6','#ef4444','#a855f7','#ec4899'];const box=document.createElement('div');box.className='an-conf';box.style.left=x+'px';box.style.top=y+'px';
  for(let k=0;k<18;k++){const i=document.createElement('i');const a=Math.random()*Math.PI*2,d=40+Math.random()*70;i.style.cssText=`--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-40}px;--r:${Math.random()*540-270}deg;background:${cores[k%cores.length]};animation-delay:${Math.random()*.08}s`;box.appendChild(i)}
  document.body.appendChild(box);setTimeout(()=>box.remove(),1100)}
{const _tA=toast;toast=function(msg,tipo){const r=_tA.apply(this,arguments);try{if(tipo==='ok'&&animPerfil()==='cheio'){const t=$('#toast');const b=t&&t.getBoundingClientRect();animConfetes(b&&b.width?b.left+b.width/2:innerWidth/2,b&&b.height?b.top:innerHeight-80)}}catch(_){}return r}}
/* cartão nas Definições › Aparência */
function cartaoAnim(){const p=animPerfil();const rm=document.documentElement.classList.contains('a11y-rm')&&p!=='sem';
  return `<div class="card" id="an-cfg"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('sparkle',18)} Animações</h2><span class="sp1"></span><span class="mut" style="font-size:13px">Só neste dispositivo</span></div>
  <div class="angrid" role="radiogroup" aria-label="Perfil de animação">${ANIM_P.map(([k,n,d],i)=>`<button type="button" role="radio" aria-checked="${p===k}" class="anopt ${p===k?'on':''}" data-anp="${k}"><span class="anprev anp-${k}" aria-hidden="true"><i></i><i></i><i></i></span><b>${i+1} · ${n}</b><small>${d}</small></button>`).join('')}</div>
  ${rm?`<p class="hint">${ic('info',13)} A Acessibilidade (ou o sistema) está a pedir para <b>reduzir o movimento</b> — essa escolha prevalece.</p>`:''}</div>`}
{const _vdA=vDefinicoes;vDefinicoes=function(){const r=_vdA.apply(this,arguments);try{if((UI.defTab||'geral')==='aparencia'&&!$('#an-cfg')){const c=$('#view .card');if(c){c.insertAdjacentHTML('beforebegin',cartaoAnim());$$('#an-cfg [data-anp]').forEach(b=>b.onclick=()=>{S.cfg.animPerfil=b.dataset.anp;save();animAplicar();go('definicoes');if(S.cfg.animPerfil==='cheio')toast('Animações: cheio','ok');else toast('Animações: '+(S.cfg.animPerfil==='sem'?'sem':'minimalista'))})}}}catch(e){console.warn(e)}return r}}
animAplicar();


/* v0.64 · Avisos Urgentes: os do Jornal Escolar numa secção à parte */
{const _avU=avisosUrgentes;avisosUrgentes=function(){const L=_avU.apply(this,arguments);return L.filter(x=>x.g!=='jornal').concat(L.filter(x=>x.g==='jornal'))}}
{const _maJ=mostrarAvisos;mostrarAvisos=function(){const r=_maJ.apply(this,arguments);try{const o=$('#avpop');if(o&&!o.dataset.jg){o.dataset.jg=1;const L=avisosUrgentes();const its=[...o.querySelectorAll('.avl>.avit')];const nJ=L.filter(x=>x.g==='jornal').length;if(nJ&&its.length===L.length){const lst=o.querySelector('.avl');const nG=L.length-nJ;
    if(nG)lst.insertAdjacentHTML('afterbegin',`<div class="avgh">${ic('bell',13)} Gerais <span>${nG}</span></div>`);const first=its[L.findIndex(x=>x.g==='jornal')];first.insertAdjacentHTML('beforebegin',`<div class="avgh avgj">${ic('news',13)} ${esc((JN().cfg.nome)||'Jornal Escolar')} <span>${nJ}</span><button type="button" class="btn sm" data-avjn>${ic('folder',13)} Abrir o Jornal</button></div>`);
    its.forEach((el,i)=>{if(L[i].g==='jornal')el.classList.add('avj')});const sp=o.querySelector('.avh>div>span');if(sp)sp.textContent=L.length+' aviso'+(L.length>1?'s':'')+' a precisar de atenção'+(nG?' · '+nJ+' do Jornal Escolar':'');
    const b=o.querySelector('[data-avjn]');if(b)b.onclick=()=>{o.remove();UI.jnTab='painel';go('jornal')}}}}catch(e){console.warn(e)}return r}}

/* v0.64 · estilo iOS 27 (Liquid Glass) com o controlo «Transparente ↔ Com cor» */
ESTILOS_X.push(['ios27','iOS 27','sparkle','Inspirado no iOS 27: Liquid Glass, barra lateral até à margem, botões em cápsula e controlos segmentados']);
function iosVidro(){const v=S.cfg.iosVidro;const n=v==null?55:Math.max(0,Math.min(100,+v));document.documentElement.style.setProperty('--lg-a',String(Math.round((.28+n/100*.66)*100)/100));return n}
{const _apI=aplicarPrefs;aplicarPrefs=function(){const r=_apI.apply(this,arguments);try{iosVidro();const m=document.querySelector('meta[name=theme-color]');if(m&&S.cfg.estilo==='ios27')m.setAttribute('content',document.body.classList.contains('escurox')?'#000000':'#f2f2f7')}catch(_){}return r}}
{const _vdI=vDefinicoes;vDefinicoes=function(){const r=_vdI.apply(this,arguments);try{if((UI.defTab||'geral')==='aparencia'&&S.cfg.estilo==='ios27'&&!$('#ios-gl')){const sg=$('#ap-est');const pr=sg&&sg.closest('.pref');if(pr){const n=iosVidro();pr.insertAdjacentHTML('afterend',`<div class="pref" id="ios-gl"><b>Liquid Glass</b><div class="iosgl"><small>Transparente</small><input type="range" min="0" max="100" step="1" value="${n}" id="ios-r" aria-label="Transparência do vidro"><small>Com cor</small><span class="iosprev" aria-hidden="true"><i></i></span></div></div>`);const rg=$('#ios-r');rg.oninput=()=>{S.cfg.iosVidro=+rg.value;iosVidro()};rg.onchange=()=>save()}}}catch(e){console.warn(e)}return r}}
try{aplicarPrefs()}catch(_){}

