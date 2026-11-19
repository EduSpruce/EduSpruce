/* ===================== cronograma-profij ===================== */

/* ---------- Coord. PROFIJ › Pontos de Situação: cronograma das disciplinas e UFCD e sugestões de cedências ----------
   Usa a simulação do ano da Coord. PROFIJ (cpdSim: horário da turma, calendário, FCT, cedências, tempos que passam para o mesmo
   professor e o último ponto de situação). Mostra quando começa e acaba cada disciplina/UFCD e, para as que não acabam no ano,
   de onde podem vir os tempos (tempos livres de quem já acabou → «Ceder», que abre a cedência já preenchida) ou quantos tempos
   por semana faltam no horário. */
const CPCR_EST={feito:['concluída','#16a34a'],curso:['em curso','#2563eb'],espera:['por começar','#94a3b8'],nao:['não acaba no ano','#dc2626']};
function cpcrDados(a,nome){const S_=cpdSim(a,nome),{M,L,D}=S_;const pri={},ult={};
  for(const e of S_.log){if(!e.id)continue;if(!pri[e.id]||e.iso<pri[e.id])pri[e.id]=e.iso;if(!ult[e.id]||e.iso>ult[e.id])ult[e.id]=e.iso}
  const R=D.map(d=>{const need=S_.need[d.id]||0,done=S_.done[d.id]||0,dh=Math.min(need,Math.max(0,S_.dh[d.id]||0)),f=S_.fim[d.id];
    return {d,need,done,dh,ini:pri[d.id]||'',fim:f&&f!=='feito'?f:(ult[d.id]||''),est:dh>=need?'feito':done<need?'nao':dh>0?'curso':'espera',falta:Math.max(0,need-done)}});
  return {S_,M,L,R}}
function cpcrGantt(K){const {S_,M,L,R}=K;const N=Math.round((dataDeIso(L.fim)-dataDeIso(L.ini))/864e5)+1;if(!(N>0)||N>500)return '';
  const ix=s=>!s||s<L.ini?0:s>L.fim?N-1:Math.round((dataDeIso(s)-dataDeIso(L.ini))/864e5),X=i=>(i/N*100).toFixed(3);
  let fx='',run=null,i=0;const fecha=j=>{if(run){fx+=`<i class="cpcr-f ${run.t}" style="left:${X(run.i)}%;width:${((j-run.i)/N*100).toFixed(3)}%"></i>`;run=null}};
  for(let x=L.ini;x<=L.fim&&i<N;x=cpdMais(x,1),i++){const t=cpmTipo(x,M,L,S_.c),k=t==='int'?'int':t==='fct'?'fct':(t==='fds'||t==='fer')&&run?run.t:'';if(run&&run.t!==k)fecha(i);if(k&&!run)run={t:k,i}}fecha(N);
  const hj=isoHoje(),linha=hj>=L.ini&&hj<=L.fim?`<i class="cpcr-hj" style="left:${X(ix(hj))}%" title="Hoje"></i>`:'';
  let ms='';for(let d=dataDeIso(L.ini.slice(0,8)+'01');isoData(d)<=L.fim;d.setMonth(d.getMonth()+1)){const s=isoData(d)<L.ini?L.ini:isoData(d);ms+=`<span style="left:${X(ix(s))}%">${esc(String(MESES[d.getMonth()+1]||'').slice(0,3))}</span>`}
  const oc=k=>{const j=CPM_COMP.findIndex(c=>c[0]===k);return j<0?99:j};
  let h=`<div class="cpcr-g"><div class="cpcr-r cpcr-m"><span class="cpcr-n"></span><div class="cpcr-t">${ms}</div></div>`,comp=null;
  for(const r of R.slice().sort((p,q)=>oc(p.d.comp)-oc(q.d.comp))){if(r.d.comp!==comp){comp=r.d.comp;const c=CPM_COMP.find(x=>x[0]===comp);h+=`<div class="cpcr-c">${esc(c?c[1]:'Outras')}</div>`}
    const e=CPCR_EST[r.est];let bar='';if(r.ini){const i0=ix(r.ini),i1=r.est==='nao'?N-1:ix(r.fim||L.fim);
      bar=`<i class="cpcr-b ${r.est}" style="left:${X(i0)}%;width:${Math.max(.4,(i1-i0+1)/N*100).toFixed(3)}%;--c:${e[1]}" title="${esc(r.d.nome+' · '+fmtIsoL(r.ini)+(r.est==='nao'?' — não acaba no ano (faltam '+r.falta+' tempos)':' a '+fmtIsoL(r.fim))+' · '+e[0])}"></i>`}
    h+=`<div class="cpcr-r"><span class="cpcr-n" title="${esc(r.d.nome)}">${esc(r.d.nome)}<small>${r.dh} de ${r.need} tempos</small></span><div class="cpcr-t">${fx}${bar}${linha}</div></div>`}
  return h+`</div><div class="cpcr-leg">${Object.values(CPCR_EST).map(([t,c])=>`<span><b style="background:${c}"></b>${t}</span>`).join('')}<span><b class="fct"></b>FCT</span><span><b class="int"></b>Interrupção</span><span><b class="hj"></b>Hoje</span></div>`}
function cpcrSug(K,nome){const {S_,M,L,R}=K,hoje=S_.hoje;const base=x=>{const k=normSig(x&&x.ab);return S_.D.filter(d=>(d.sig||[]).some(s=>normSig(s)===k))};
  const liv={};for(const l of S_.livres||[]){if(l.iso<=hoje)continue;const B=base(l.x),dono=B[B.length-1],k=dono?dono.id:'*';const o=liv[k]=liv[k]||{id:k,d:dono||null,n:0,desde:l.iso,usado:0};o.n++;if(l.iso<o.desde)o.desde=l.iso}
  const dons=Object.values(liv).sort((p,q)=>p.desde.localeCompare(q.desde));
  const sems=new Set();for(let x=cpdMais(hoje,1);x<=L.fim;x=cpdMais(x,1))if(cpmTipo(x,M,L,S_.c)==='let')sems.add(cpdSeg(x));const nS=sems.size;
  let prox=cpdMais(hoje,1);for(let j=0;j<7&&dataDeIso(prox).getDay()!==1;j++)prox=cpdMais(prox,1);
  const pl=(n,s,p)=>n+' '+(n===1?s:p),falta=R.filter(r=>r.est==='nao').sort((p,q)=>q.falta-p.falta),li=[];
  for(const r of falta){let precisa=r.falta;const de=[];for(const o of dons){if(precisa<=0)break;const t=Math.min(o.n-o.usado,precisa);if(t>0){de.push({o,t});o.usado+=t;precisa-=t}}
    const k=nS?Math.ceil(precisa/nS):precisa;
    li.push(`<li><span class="tag bad">não acaba</span> <b>${esc(r.d.nome)}</b>: faltam <strong>${pl(r.falta,'tempo','tempos')}</strong> no fim do ano.${de.length?'<ul class="cpcr-de">':''}${de.map(({o,t})=>`<li class="cpcr-ced">${pl(t,'tempo livre','tempos livres')}${o.d?' de <b>'+esc(o.d.nome)+'</b>':''} a partir de ${fmtIsoL(o.desde)} <button type="button" class="btn sm noprint" data-cpcro="${esc(o.id)}" data-cpcrd="${esc(r.d.id)}" data-cpcri="${o.desde}">${ic('repeat',13)} Ceder</button></li>`).join('')}${de.length?'</ul>':''}${precisa>0?` ${de.length?'Para '+(precisa===1?'o outro':'os outros '+precisa)+': ':''}<strong>+${pl(k,'tempo','tempos')} por semana</strong> no horário da turma a partir de ${fmtIsoL(prox)} (${pl(nS,'semana','semanas')} de aulas até ao fim).`:''}</li>`)}
  for(const o of dons){const s=o.n-o.usado;if(s>0)li.push(`<li><span class="tag ok">tempos livres</span> ${o.d?'<b>'+esc(o.d.nome)+'</b> acaba e deixa':'Ficam'} <strong>${pl(s,'tempo livre','tempos livres')}</strong> a partir de ${fmtIsoL(o.desde)}${falta.length?'':' — podem servir para recuperações ou apoios'}.</li>`)}
  const fT=S_.turmaFim;
  return `<section class="card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('repeat',18)} Para Cumprir o Plano</h2><span class="sp1"></span><span class="mut">${esc(nome)}</span></div>
    ${li.length?`<ul class="cpcr-sug">${li.join('')}</ul>`:`<p class="mut" style="margin:8px 0 0">${ic('check',14)} Todas as disciplinas e UFCD acabam${fT&&fT!=='feito'?' até '+fmtIsoL(fT):''}.</p>`}
    <p class="hint">«Ceder» abre a cedência de tempos já preenchida: a app volta a simular o ano e atualiza o cronograma.</p></section>`}
function cpcrHTML(a,nome){const K=cpcrDados(a,nome);if(!K.R.length)return '';const n=K.R.filter(r=>r.est==='nao').length;
  return `<section class="card cpcr"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('calendar',18)} Cronograma</h2><span class="mut">${esc(nome)} · ${fmtIsoL(K.L.ini)} a ${fmtIsoL(K.L.fim)}</span><span class="sp1"></span>${n?`<span class="tag bad">${n} não ${n===1?'acaba':'acabam'} no ano</span>`:'<span class="tag ok">tudo acaba no ano</span>'}</div>
    <p class="hint">Quando começa e acaba cada disciplina e UFCD: horário da turma, calendário escolar (interrupções, feriados e FCT), cedências e último ponto de situação.</p>${cpcrGantt(K)}</section>`+cpcrSug(K,nome)}
function cpcrBind(v,a){v.querySelectorAll('[data-cpcro]').forEach(b=>b.onclick=()=>{const N=cpmNomes(a,cpClasses(a));const nome=UI.cpmT&&N.includes(UI.cpmT)?UI.cpmT:N[0];if(nome)cpdCedDlg(nome,{origem:b.dataset.cpcro,destino:b.dataset.cpcrd,desde:b.dataset.cpcri})})}
const _cpcrMH=cpmMatrizHTML;cpmMatrizHTML=function(a,C){const h=_cpcrMH.apply(this,arguments);if(UI.cpTab!=='pontos')return h;try{const N=cpmNomes(a,C);if(!N.length)return h;const nome=UI.cpmT&&N.includes(UI.cpmT)?UI.cpmT:N[0];return h+cpcrHTML(a,nome)}catch(e){console.warn(e);return h}};
const _cpcrMB=cpmBindMatriz;cpmBindMatriz=function(v,a){const r=_cpcrMB.apply(this,arguments);try{if(UI.cpTab==='pontos')cpcrBind(v,a)}catch(e){console.warn(e)}return r};

/* ---------- Calendário escolar detalhado (documento do Word ou PDF de texto) ----------
   Lê no navegador os períodos (início, fim e dias letivos), as interrupções e, por turma (cabeçalhos como «A01 - Curso (24-27)»),
   as datas marcadas (FCT, PAF/PAP, avaliações). Pode criar o calendário escolar do ano e põe as datas da FCT na matriz das
   turmas PROFIJ escolhidas. */
var CDET_MES={janeiro:1,fevereiro:2,marco:3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12,
  jan:1,fev:2,mar:3,abr:4,mai:5,jun:6,jul:7,ago:8,set:9,out:10,nov:11,dez:12};
function cdetNorm(s){return String(s==null?"":s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[   ]/g," ")}
// palavras e números com a posição no texto original (para se saber até onde foi lida cada data)
function cdetToks(s){const out=[],re=/\d{1,2}\s*\/\s*\d{1,2}(?:\s*\/\s*\d{2,4})?|\d+(?:\s*\.?\s*[ºª°])?|[A-Za-zÀ-ÖØ-öø-ÿ]+|[,;:|*()–—-]/g;let m;
  while((m=re.exec(s))){let v=cdetNorm(m[0]).replace(/\s+/g,"");v=v.replace(/^(\d+)\.?[ºª°]$/,"$1");if(v==="–"||v==="—")v="-";out.push({v,a:m.index,b:m.index+m[0].length})}
  return out}
const cdetIsoD=(y,m,d)=>{const dt=new Date(y,m-1,d);if(dt.getFullYear()!==y||dt.getMonth()!==m-1||dt.getDate()!==d)return null;return y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0")};
// uma expressão de datas a partir do símbolo i: devolve {de, ate, datas (só nas listas), tipo, fim (símbolo seguinte)} ou null
function cdetExpr(T,i,y0){let k=i,tipo="um";const parts=[];
  const dia=t=>t&&/^\d{1,2}$/.test(t.v)&&+t.v>=1&&+t.v<=31,mes=t=>t&&CDET_MES[t.v]!=null,ano=t=>t&&/^\d{4}$/.test(t.v)&&+t.v>1990&&+t.v<2100,num=t=>t&&/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(t.v);
  if(T[k]&&(T[k].v==="de"||T[k].v==="entre"||T[k].v==="dia"||T[k].v==="dias"))k++;
  const parte=()=>{if(num(T[k])){const q=T[k].v.split("/");k++;const p={d:+q[0],m:+q[1]};if(q[2])p.y=+q[2]<100?2000+(+q[2]):+q[2];return p}
    if(!dia(T[k]))return null;const p={d:+T[k].v};k++;
    if(T[k]&&T[k].v==="de"&&mes(T[k+1])){p.m=CDET_MES[T[k+1].v];k+=2}else if(mes(T[k])){p.m=CDET_MES[T[k].v];k++}
    if(p.m){if(T[k]&&T[k].v==="de"&&ano(T[k+1])){p.y=+T[k+1].v;k+=2}else if(ano(T[k])){p.y=+T[k].v;k++}}
    return p};
  const p0=parte();if(!p0)return null;parts.push(p0);
  for(;;){const s=T[k];if(!s)break;const sepI=s.v==="a"||s.v==="ate"||s.v==="-",sepL=s.v===","||s.v==="e";
    if(!sepI&&!sepL)break;if(sepI&&(tipo==="lista"||parts.length>=2))break;if(sepL&&tipo==="intervalo")break;
    const k0=k;k++;if(sepI&&T[k]&&T[k].v==="de"&&dia(T[k+1]))k++;const p=parte();if(!p){k=k0;break}
    parts.push(p);tipo=sepI?"intervalo":"lista"}
  for(let j=parts.length-2;j>=0;j--){const a=parts[j],b=parts[j+1];if(!a.m)a.m=b.m;if(!a.y&&b.y)a.y=a.m>b.m?b.y-1:b.y}
  if(!parts[parts.length-1].m)return null;
  for(const p of parts)if(!p.y)p.y=y0?(p.m>=8?y0:y0+1):new Date().getFullYear();
  const L=parts.map(p=>cdetIsoD(p.y,p.m,p.d));if(L.some(x=>!x))return null;
  const ord=L.slice().sort();if(tipo==="intervalo"&&ord[0]!==L[0])return null; // "31 a 2 de dezembro": não faz sentido
  return{de:ord[0],ate:ord[ord.length-1],datas:tipo==="lista"?ord:null,tipo,fim:k}}
// tipo de marco pelo nome
function cdetTipo(nome){const n=cdetNorm(nome);
  if(/contexto de trabalho|\bfct\b|estagio|formacao pratica/.test(n))return"fct";
  if(/\bpap\b|aptidao profissional|anteprojeto|projeto final/.test(n))return"pap";
  if(/momento|avaliac|conselho de turma|reuniao|intercalar/.test(n))return"aval";
  if(/exame|prova|teste/.test(n))return"prova";
  if(/visita|atividade|viagem|semana |festa|dia aberto|desfile|feira/.test(n))return"ativ";
  return"outro"}
// marcos de um bloco de texto "Rótulo: datas Rótulo: datas …" (as linhas partidas do PDF não fazem mal)
function cdetMarcosDe(s,y0){const out=[];let pos=0;
  while(pos<s.length){const c=s.indexOf(":",pos);if(c<0)break;
    let nome=s.slice(pos,c);const corte=Math.max(nome.lastIndexOf(". "),nome.lastIndexOf("; "));if(corte>=0)nome=nome.slice(corte+2);
    nome=nome.replace(/^[\s;,.\-–—•*]+/,"").replace(/\s+/g," ").trim();
    const resto=s.slice(c+1),T=cdetToks(resto),e=cdetExpr(T,0,y0);
    if(e&&nome&&nome.length<=140&&/[a-zà-ÿ]/i.test(nome)){out.push({nome,tipo:cdetTipo(nome),de:e.de,ate:e.ate,datas:e.datas});pos=c+1+T[e.fim-1].b;while(pos<s.length&&/[\s;,.*]/.test(s[pos]))pos++}
    else pos=c+1}
  return out}
const cdetY4=v=>v?(+v<100?2000+(+v):+v):null;
const CDET_INT={natal:"Interrupção do Natal",carnaval:"Interrupção do Carnaval",entrudo:"Interrupção do Carnaval",pascoa:"Interrupção da Páscoa"};
// análise do texto do documento (linhas: parágrafos e linhas de tabela do DOCX, ou linhas do PDF)
function cdetAnalisar(linhas,anoRef){
  const R={y0:null,inicio:null,fim:null,periodos:[],interrupcoes:[],turmas:[],notas:[],base:"",avisos:[]};
  const L=linhas.map(x=>String(x==null?"":x).replace(/[\t ]+/g," ").replace(/\s+/g," ").trim()).filter(Boolean);
  const txt=L.join("\n"),tn=cdetNorm(txt);
  let m=tn.match(/ano letivo\s*(?:de\s*)?(\d{4})\s*[\/-]\s*(\d{2,4})/)||tn.match(/calendario escolar\s*(?:de\s*)?(\d{4})\s*[\/-]\s*(\d{2,4})/)||tn.match(/\b(20\d{2})\s*\/\s*(20\d{2})\b/);
  R.y0=m?+m[1]:(anoRef||null);
  // o "Detalhe" por turma começa no primeiro cabeçalho de turma
  const RE_T=/^\s*([A-Z]\d{2,3})\s*[-–—]+\s*(.+?)\s*\(\s*(\d{2,4})\s*[-\/]\s*(\d{2,4})\s*\)\s*\**\s*$/;
  let iDet=L.findIndex(x=>RE_T.test(x));if(iDet<0)iDet=L.length;
  const geral=L.slice(0,iDet).join("\n"),T=cdetToks(geral);
  // início e termo do ano letivo
  for(let i=0;i<T.length&&!(R.inicio&&R.fim);i++){const v=T[i].v;
    const pal=!R.inicio&&/^(inicio|inicia|comeca|arranque)$/.test(v)?"i":(!R.fim&&R.inicio&&/^(termo|termina|fim|final|encerramento)$/.test(v)?"f":"");if(!pal)continue;
    let k=i+1;while(T[k]&&/^(a|em|no|na|dia|as|letivo|ano)$/.test(T[k].v))k++;const e=cdetExpr(T,k,R.y0);if(!e)continue;
    if(pal==="i")R.inicio=e.de;else R.fim=e.ate}
  // períodos letivos: "1.º | 14 de setembro de 2026 | 18 de dezembro de 2026 | 67" (ou numa frase)
  for(let i=0;i<T.length;i++){const t=T[i];if(!/^[123]$/.test(t.v))continue;let k=i+1;
    while(T[k]&&/^(periodo|letivo|\||:|-)$/.test(T[k].v))k++;const e1=cdetExpr(T,k,R.y0);if(!e1)continue;
    let ini=e1.de,fim=e1.tipo==="intervalo"?e1.ate:null;k=e1.fim;
    if(!fim){let k2=k;while(T[k2]&&/^(\||a|ate|-|e|termo|fim|\*)$/.test(T[k2].v))k2++;const e2=cdetExpr(T,k2,R.y0);if(!e2)continue;fim=e2.ate;k=e2.fim}
    let k3=k,dias=null;while(T[k3]&&/^(\||\*|dias|letivos)$/.test(T[k3].v))k3++;if(T[k3]&&/^\d{1,3}$/.test(T[k3].v)&&+T[k3].v>=5&&+T[k3].v<=200&&!(T[k3+1]&&(CDET_MES[T[k3+1].v]||T[k3+1].v==="de")))dias=+T[k3].v;
    const n=+t.v;if(fim>ini&&!R.periodos.some(p=>p.n===n))R.periodos.push({n,ini,fim,diasDoc:dias});i=k-1}
  R.periodos.sort((a,b)=>a.n-b.n);
  // interrupções letivas
  for(let i=0;i<T.length;i++){const nm=CDET_INT[T[i].v];if(!nm)continue;let k=i+1;
    while(T[k]&&(/^(-|:|\||\*)$/.test(T[k].v)||(T[k].v==="de"&&!/^\d/.test((T[k+1]||{}).v||""))))k++;
    const e=cdetExpr(T,k,R.y0);if(!e)continue;if(!R.interrupcoes.some(x=>x.nome===nm))R.interrupcoes.push({nome:nm,de:e.de,ate:e.ate});i=e.fim-1}
  // outras interrupções escritas por extenso ("Interrupção letiva: 3 a 5 de novembro")
  for(let i=0;i<T.length;i++){if(!/^interrupc/.test(T[i].v))continue;let k=i+1,nome=[];
    while(T[k]&&k<i+8&&!/^\d/.test(T[k].v)){if(/^[a-z]+$/.test(T[k].v)&&!/^(de|da|do|das|dos|a|e|letiva|letivas|atividades)$/.test(T[k].v))nome.push(T[k].v);k++}
    const e=cdetExpr(T,k,R.y0);if(!e)continue;if(R.interrupcoes.some(x=>!(e.ate<x.de||e.de>x.ate)))continue;
    if(nome.some(w=>CDET_INT[w]))continue;R.interrupcoes.push({nome:"Interrupção letiva",de:e.de,ate:e.ate})}
  // notas (linhas com *) e base legal
  for(const x of L){if(/^\*(?!\*)/.test(x))R.notas.push(x.replace(/^\*+\s*/,""));
    const b=x.match(/(portaria|despacho normativo|despacho|decreto[- ]lei|decreto legislativo regional|resolu[cç][aã]o)\s+n\.?\s*[ºo°]?\s*[\d][\d\-\/A-Za-z.]*(?:\s+de\s+\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{4})?/i);if(b&&!R.base)R.base=b[0].trim()}
  // detalhe de cada turma
  let cur=null;
  for(const x of L.slice(iDet)){const t=x.match(RE_T);if(t){cur={cod:t[1].toUpperCase(),curso:t[2].replace(/\s+/g," ").trim(),ai:cdetY4(t[3]),af:cdetY4(t[4]),titulo:x.replace(/\s*\**\s*$/,""),txt:[]};R.turmas.push(cur);continue}
    if(cur)cur.txt.push(x)}
  for(const t of R.turmas){t.marcos=cdetMarcosDe(t.txt.join(" "),R.y0);delete t.txt}
  if(!R.inicio&&R.periodos.length)R.inicio=R.periodos[0].ini;
  if(!R.fim&&R.periodos.length)R.fim=R.periodos[R.periodos.length-1].fim;
  return R}

const CDET_W="http://schemas.openxmlformats.org/wordprocessingml/2006/main";
function cdetXmlLinhas(xml){const d=new DOMParser().parseFromString(xml,"application/xml"),out=[];
  const txtP=p=>{let s="";const it=p.getElementsByTagNameNS(CDET_W,"*");for(let i=0;i<it.length;i++){const n=it[i];if(n.localName==="t")s+=n.textContent;else if(n.localName==="tab")s+=" ";else if(n.localName==="br"||n.localName==="cr")s+=" "}return s};
  const walk=el=>{for(const c of Array.from(el.childNodes)){if(c.nodeType!==1)continue;const ln=c.localName;
    if(ln==="p")out.push(txtP(c));
    else if(ln==="tbl"){for(const tr of Array.from(c.childNodes).filter(x=>x.localName==="tr")){out.push(Array.from(tr.childNodes).filter(x=>x.localName==="tc").map(tc=>Array.from(tc.getElementsByTagNameNS(CDET_W,"p")).map(txtP).join(" ").trim()).join(" | "))}}
    else if(ln==="sdt"||ln==="sdtContent"||ln==="body"||ln==="customXml"||ln==="smartTag")walk(c)}};
  const body=d.getElementsByTagNameNS(CDET_W,"body")[0]||d.documentElement;walk(body);return out}
async function cdetLinhasPdf(pdfjs,buf){const doc=await pdfjs.getDocument({data:new Uint8Array(buf),isEvalSupported:false,disableFontFace:true}).promise,out=[];
  for(let n=1;n<=doc.numPages;n++){const pg=await doc.getPage(n),tc=await pg.getTextContent();let cur="",y=null;
    for(const it of tc.items){if(!it||typeof it.str!=="string")continue;const yy=it.transform?it.transform[5]:0;
      if(y!==null&&Math.abs(yy-y)>2&&cur.trim()){out.push(cur);cur=""}
      if(it.str)cur+=(cur&&!/\s$/.test(cur)&&!/^\s/.test(it.str)?" ":"")+it.str;y=yy;if(it.hasEOL){if(cur.trim())out.push(cur);cur="";y=null}}
    if(cur.trim())out.push(cur)}
  try{doc.destroy()}catch(e){}return out}
function cdetAnoRef(a){const m=String(a&&a.nome||'').match(/(\d{4})/);return m?+m[1]:new Date().getFullYear()}
function cdetPROFIJ(a){try{return cpOn()?cpmNomes(a,cpClasses(a)):[]}catch(e){return []}}
function cdetCasar(R,a){const N=cdetPROFIJ(a),mat=(CP().y||{}).mat||{},nn=s=>cdetNorm(s).replace(/[^a-z0-9]/g,'');
  return R.turmas.map(t=>{const cod=cdetNorm(t.cod);let alvo=N.find(n=>(' '+cdetNorm(n).replace(/[^a-z0-9]+/g,' ')+' ').includes(' '+cod+' '))||'';
    if(!alvo){const c=nn(t.curso);alvo=N.find(n=>{const mc=nn((mat[n]||{}).curso);return mc&&c&&(mc.includes(c)||c.includes(mc))})||''}
    return {t,alvo,fct:t.marcos.filter(m=>m.tipo==='fct'&&m.de).sort((p,q)=>p.de.localeCompare(q.de))}})}
function cdetEscolher(){const f=document.createElement('input');f.type='file';f.accept='.docx,.pdf';f.hidden=true;document.body.appendChild(f);
  f.onchange=async()=>{const file=f.files[0];f.remove();if(!file)return;ocupado('A ler '+file.name+'…');
    try{const buf=await file.arrayBuffer();let linhas;
      if(/\.pdf$/i.test(file.name)||file.type==='application/pdf')linhas=await cdetLinhasPdf(await getPdfLib(),buf);
      else{const z=await unzip(buf),xml=await z.text('word/document.xml');if(!xml)throw new Error('o ficheiro não é um documento do Word (.docx)');linhas=cdetXmlLinhas(xml)}
      const R=cdetAnalisar(linhas,cdetAnoRef(A()));livre();
      if(!R.periodos.length&&!R.turmas.length)throw new Error('não encontrei períodos letivos nem turmas no documento');cdetPrever(R,file.name)}
    catch(e){livre();alert('Não foi possível ler o calendário.\n\n'+(e&&e.message||e))}};f.click()}
function cdetPrever(R,fich){const a=A(),c=a.calendario,y0=cdetAnoRef(a),anoOk=!R.y0||R.y0===y0,T=cdetCasar(R,a),N=cdetPROFIJ(a),dt=(p,q)=>fmtIsoL(p)+(q&&q!==p?' a '+fmtIsoL(q):'');
  const per=R.periodos.map((p,i)=>`<tr><td><b>${i+1}.º</b></td><td>${fmtIsoL(p.ini)}</td><td>${fmtIsoL(p.fim)}</td><td class="n">${p.diasDoc||'—'}</td></tr>`).join('');
  const tur=T.map((x,i)=>`<tr><td><b>${esc(x.t.cod)}</b> <span class="mut">${esc(x.t.curso)}</span></td><td>${x.fct.length?x.fct.map(m=>dt(m.de,m.ate)).join('; '):'<span class="mut">—</span>'}</td><td>${N.length&&x.fct.length?`<select data-cdet="${i}"><option value="">— não aplicar —</option>${N.map(n=>`<option value="${esc(n)}" ${n===x.alvo?'selected':''}>${esc(n)}</option>`).join('')}</select>`:'<span class="mut">—</span>'}</td></tr>`).join('');
  openDrawer('Calendário Escolar Detalhado',`<div class="ed cdet"><p class="hint" style="margin-top:0">${esc(fich)} · ano letivo ${R.y0?R.y0+'/'+(R.y0+1):'?'}${anoOk?'':` <span class="tag bad">não é o ano letivo ${esc(a.nome)}</span>`}</p>
    ${per?`<h3>${a.org==='semestre'?'Semestres':'Períodos'}</h3><table class="lst"><thead><tr><th></th><th>Início</th><th>Fim</th><th class="n">Dias letivos</th></tr></thead><tbody>${per}</tbody></table>`:''}
    ${R.interrupcoes.length?`<h3>Interrupções</h3><ul class="cdet-l">${R.interrupcoes.map(x=>`<li>${esc(x.nome)}: ${dt(x.de,x.ate)}</li>`).join('')}</ul>`:''}
    ${per?`<label class="chk" style="margin:12px 0 0"><input type="checkbox" id="cdet-cal" ${c?'':'checked'}> <span>${c?'Substituir o calendário escolar de '+esc(a.nome)+' (as alterações feitas dia a dia perdem-se)':'Criar o calendário escolar de '+esc(a.nome)}</span></label>`:''}
    ${T.length?`<h3>Turmas</h3><table class="lst"><thead><tr><th>Turma</th><th>FCT</th><th>Turma PROFIJ</th></tr></thead><tbody>${tur}</tbody></table><p class="hint">${N.length?'As datas da FCT entram na matriz da turma PROFIJ escolhida (Coord. PROFIJ › Matriz).':'Com o módulo Coord. PROFIJ ligado, as datas da FCT podem entrar na matriz de cada turma.'}</p>`:''}
    <div class="row" style="margin-top:14px"><span class="sp1"></span><button class="btn" id="cdet-x">Cancelar</button><button class="btn pri" id="cdet-ok" ${anoOk?'':'disabled'}>${ic('check',15)} Importar</button></div></div>`);
  $('#cdet-x').onclick=closeDrawer;$('#cdet-ok').onclick=()=>{const fazCal=!!($('#cdet-cal')&&$('#cdet-cal').checked);let nF=0;
    if(fazCal)cdetCriarCal(a,R,fich);
    $$('[data-cdet]').forEach(s=>{const x=T[+s.dataset.cdet];if(!s.value||!x||!x.fct.length)return;const M=cpmM(s.value);M.fct=M.fct||{horas:'',ini:'',fim:'',hDia:7};M.fct.ini=x.fct[0].de;M.fct.fim=x.fct[0].ate||x.fct[0].de;nF++});
    if(!fazCal&&!nF){toast('Nada para importar: escolha o calendário ou uma turma PROFIJ.','aviso');return}
    if(nF)save();closeDrawer();go('calendario');toast((fazCal?'Calendário escolar criado':'Datas importadas')+(nF?' · FCT de '+nF+' turma(s) PROFIJ':''))}}
function cdetCriarCal(a,R,fich){const ps=R.periodos.map((p,i)=>({n:i+1,ini:p.ini,fim:p.fim})),y1=+ps[0].ini.slice(0,4),y2=y1+1;const c=calendarioManual(y1+'/'+y2,ps);
  for(const x of R.interrupcoes)for(let d=x.de,k=0;d&&d<=(x.ate||x.de)&&k<120;d=cpdMais(d,1),k++){if(!(d in c.dias))continue;const w=dataDeIso(d).getDay();if(w===0||w===6||c.dias[d]==='inicio')continue;c.dias[d]='interrupcao';c.notas[d]=x.nome}
  Object.entries(feriadosNacionais(y1,y2)).forEach(([i,nota])=>{if(c.dias[i]&&dataDeIso(i).getDay()%6){c.dias[i]='feriadoN';if(nota)c.notas[i]=nota}});
  c.ficheiro=fich;montarCalendario(c);guardarCalendario(c)}
const _cdetVC=vCalendario;vCalendario=function(){const r=_cdetVC.apply(this,arguments);try{const m=$('#c-man');if(m&&!$('#c-det')){m.insertAdjacentHTML('afterend',`<button class="btn" id="c-det">${ic('upload',15)} Calendário Detalhado (Word ou PDF)</button>`);$('#c-det').onclick=cdetEscolher}
  const bx=$('#barx'),a=A();if(bx&&a&&a.calendario&&(UI.calTab||'cal')==='cal'&&!$('#b-cdet')){bx.insertAdjacentHTML('beforeend',`<button class="btn" id="b-cdet">${ic('upload',15)} Calendário Detalhado…</button>`);$('#b-cdet').onclick=cdetEscolher}}catch(e){console.warn(e)}return r};
