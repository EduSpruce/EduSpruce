/* ===================== v0.920 · Perfil: «Onde Estou e Como Avançar» (sem espaços vazios; patamares e próximos passos por competência) ===================== */
const ONDE_B=[[0,'Em construção','#c0392b'],[.5,'A consolidar','#d98b00'],[.7,'Seguro','#1f7a4d'],[.9,'Excelente','#1b6e99']];
const ondeBanda=v=>{let b=0;ONDE_B.forEach((x,i)=>{if(v>=x[0])b=i});return b};
/* para cada competência e patamar: onde estou · dois passos concretos para avançar */
const ONDE={
  co:[['Percebe palavras soltas e ideias muito simples quando o discurso é lento e claro.',['Ouvir duas vezes: a 1.ª para o tema, a 2.ª para 3 palavras-chave','Usar vídeos curtos com legendas em inglês e repetir sem legendas']],
      ['Compreende a ideia geral de textos orais conhecidos, mas perde pormenores.',['Antes de ouvir, ler as perguntas e prever as respostas','Tomar notas com símbolos (números, nomes, datas) durante a audição']],
      ['Compreende a ideia geral e a maior parte dos pormenores em temas do programa.',['Ouvir podcasts autênticos de 3–5 minutos por semana','Identificar a opinião e a atitude do falante, não só a informação']],
      ['Compreende discurso autêntico, a ideia global e os pormenores, mesmo com sotaques diferentes.',['Explorar notícias e entrevistas com sotaques variados','Resumir oralmente o que ouviu em 60 segundos']]],
  ce:[['Reconhece palavras e frases simples, sobretudo com apoio de imagens.',['Ler textos curtos com imagens e sublinhar o que já conhece','Criar um glossário pessoal com 5 palavras novas por semana']],
      ['Compreende a ideia geral de textos simples, mas depende da tradução palavra a palavra.',['Ler primeiro o título e o 1.º parágrafo para prever o tema','Deduzir o sentido das palavras pelo contexto antes de consultar o dicionário']],
      ['Compreende textos do programa e localiza informação específica com segurança.',['Identificar a intenção do autor e as palavras que a revelam','Ler um texto autêntico por semana (artigo, conto, blogue)']],
      ['Lê com autonomia textos autênticos e infere sentidos implícitos.',['Comparar dois textos sobre o mesmo tema e as suas perspetivas','Ler uma obra curta em versão original (graded reader B2 ou superior)']]],
  pe:[['Escreve frases simples e isoladas, com erros que dificultam a compreensão.',['Escrever 3–4 frases ligadas com and, but, because','Copiar e adaptar um modelo de texto dado pelo professor']],
      ['Escreve textos curtos compreensíveis, mas pouco organizados e com erros frequentes.',['Planear antes de escrever: ideias principais em tópicos','Rever com uma lista de verificação (tempos verbais, ortografia, conectores)']],
      ['Escreve textos organizados e adequados ao objetivo, com alguns erros que não impedem a comunicação.',['Variar conectores e estruturas (although, however, relative clauses)','Reescrever um parágrafo a partir do feedback recebido']],
      ['Escreve textos coesos, ricos e adequados ao público, com bom controlo da língua.',['Experimentar géneros novos: artigo de opinião, crítica, carta formal','Fazer revisão entre pares e justificar as alterações']]],
  po:[['Fala com frases memorizadas, muitas pausas e ajuda frequente.',['Preparar um guião com 5 expressões-chave antes de falar','Ensaiar em voz alta e gravar 30 segundos']],
      ['Comunica o essencial em situações conhecidas, com hesitações e erros.',['Gravar 1 minuto sobre um tema e ouvir-se para se corrigir','Aprender 3 expressões para ganhar tempo (Well…, Let me think…)']],
      ['Exprime-se com relativa fluência e correção em temas do programa.',['Alargar o vocabulário com sinónimos e expressões idiomáticas','Fazer apresentações curtas sem ler, apenas com tópicos']],
      ['Fala com fluência, correção e à-vontade, adaptando o registo à situação.',['Participar em debates e defender um ponto de vista','Trabalhar a pronúncia e a entoação com materiais autênticos']]],
  io:[['Responde a perguntas simples com palavras isoladas.',['Usar frases de sobrevivência para pedir ajuda (Can you repeat, please?)','Praticar diálogos curtos em pares, com papéis definidos']],
      ['Participa em trocas simples, mas raramente toma a iniciativa.',['Preparar 3 perguntas antes de cada atividade oral','Reagir ao que o colega diz (Really? Why do you think so?)']],
      ['Interage com à-vontade, pergunta, responde e mantém a conversa.',['Moderar uma discussão em pequeno grupo','Pedir e dar opiniões fundamentadas']],
      ['Interage com naturalidade e gere a conversa com eficácia.',['Negociar e chegar a acordos em role-plays complexos','Apoiar colegas na interação (tutoria entre pares)']]],
  gr:[['Reconhece algumas estruturas, mas ainda não as aplica com correção.',['Exercícios curtos e diários (10 minutos)','Criar fichas de revisão com exemplos próprios']],
      ['Aplica as estruturas trabalhadas em exercícios, mas não as usa espontaneamente.',['Usar cada estrutura nova num pequeno texto','Corrigir os erros dos testes e refazer os exercícios']],
      ['Usa as estruturas e o vocabulário com correção na maior parte das situações.',['Alargar o vocabulário por famílias de palavras','Identificar os próprios erros recorrentes e trabalhá-los']],
      ['Domina as estruturas e usa vocabulário variado e preciso.',['Explorar collocations e registo formal/informal','Ajudar colegas a rever textos']]],
  at:[['Cumpre de forma irregular as tarefas e a participação.',['Usar uma agenda para registar tarefas e prazos','Definir com o professor uma meta semanal concreta']],
      ['É geralmente cumpridor, mas a participação e a autonomia ainda variam.',['Pedir ajuda logo que surja uma dúvida','Trazer sempre o material e rever a matéria da aula anterior']],
      ['Revela responsabilidade, empenho e autonomia.',['Assumir um papel de liderança no trabalho de grupo','Propor temas ou materiais para as aulas']],
      ['É um exemplo de responsabilidade e iniciativa.',['Apoiar colegas como tutor','Desenvolver um pequeno projeto pessoal ligado à disciplina']]]};
const ONDE_GEN=[['Ainda está a construir as bases deste domínio.',['Rever os conteúdos essenciais com fichas curtas','Pedir feedback ao professor depois de cada tarefa']],['Atingiu parte das aprendizagens, com lacunas a consolidar.',['Corrigir os erros e refazer as tarefas','Estudar um pouco todos os dias em vez de só antes dos testes']],['Domina as aprendizagens com segurança.',['Resolver tarefas mais exigentes','Explicar a matéria a um colega']],['Revela um domínio muito sólido e autónomo.',['Aprofundar com desafios e projetos','Ligar os conteúdos a outras disciplinas']]];
function ondeHTML(t,X,V){const ok=X.dom.filter(x=>x.v!=null);if(!ok.length)return `<p class="mut">Ainda sem classificações neste período. Assim que houver avaliações, aparece aqui onde está e como avançar em cada domínio.</p>`;
  const S_=ok.slice().sort((a,b)=>b.v-a.v);const forte=S_[0],foco=S_.length>1?S_[S_.length-1]:null;
  const linha=(x,papel)=>{const b=ondeBanda(x.v);const C=(ONDE[x.cat]||ONDE_GEN)[b]||ONDE_GEN[b];const prox=ONDE_B[b+1];const falta=prox?Math.max(0,prox[0]-x.v):0;
    const meta=prox?`Próxima meta: <b>${esc(prox[1])}</b> · faltam ${isSec(t)?(falta*20).toFixed(1).replace('.',',')+' valores':Math.ceil(falta*100)+' %'}`:'Patamar máximo: manter e aprofundar';
    const tr=x.va!=null?x.v-x.va:null;
    return `<div class="ond ${papel||''}" style="--bc:${ONDE_B[b][2]}"><div class="ondh">${icDom(x.d,15)}<b>${esc(x.d.nome)}</b>${papel==='forte'?`<span class="ondt ok">${x.v>=.7?'Ponto forte':'Melhor domínio'}</span>`:papel==='foco'?'<span class="ondt fo">Próximo passo</span>':''}<span class="sp1"></span><em>${V(x.v)}</em></div>
      <div class="ondb">${ONDE_B.map((q,i)=>`<i class="${i<=b?'on':''}" title="${esc(q[1])}"></i>`).join('')}<span>${esc(ONDE_B[b][1])}${tr!=null&&Math.abs(tr)>=.02?` · <span class="${tr>0?'up':'dn'}">${tr>0?'▲':'▼'} desde o período anterior</span>`:''}</span></div>
      <p class="ondw"><small>Onde estou</small>${esc(C[0])}</p><div class="onda"><small>Como avançar</small><ul>${C[1].map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div><p class="ondm">${meta}</p></div>`};
  return `<div class="ondg">${linha(forte,'forte')}${foco&&foco!==forte?linha(foco,'foco'):''}</div>${S_.length>2?`<details class="ondx"><summary>Ver todos os domínios (${S_.length})</summary><div class="ondg">${S_.filter(x=>x!==forte&&x!==foco).map(x=>linha(x)).join('')}</div></details>`:''}`}
{const _pA=perfilAluno;perfilAluno=function(aid,opt){const r=_pA.apply(this,arguments);try{ondeAplicar(aid)}catch(e){console.warn(e)}return r}}
function ondeAplicar(aid){const t=T();if(!t)return;const a=t.alunos.find(x=>x.id===aid);if(!a)return;const run=()=>{const o=document.querySelector('.pab');if(!o)return;
  const sec=[...o.querySelectorAll('section.pc')].find(s=>/Onde Estou e Como Avançar/.test((s.querySelector('h2')||{}).textContent||''));if(!sec||sec.dataset.onde)return;
  const pb=document.querySelector('[data-pap].on');const p=pb?+pb.dataset.pap:perAtual(t);const X=perfilDados(t,a,p);const sc=isSec(t);const V=f=>f==null?'—':sc?(f*20).toFixed(1).replace('.',','):Math.round(f*100)+'%';
  sec.dataset.onde=1;sec.classList.add('pwide','ondsec');sec.innerHTML=`<h2>${ic('sparkle',16)} Onde Estou e Como Avançar</h2>${ondeHTML(t,X,V)}`};
  run();if(window._ondeMO)window._ondeMO.disconnect();const mo=window._ondeMO=new MutationObserver(()=>{if(!document.querySelector('.pab')){mo.disconnect();return}run()});mo.observe(document.body,{childList:true,subtree:true});setTimeout(()=>mo.disconnect(),10*60*1000)}

/* ===================== v0.920 · horário do professor a partir do TeacherSchedule (Excel ou PDF) ===================== */
const TS_DN={segunda:1,terca:2,quarta:3,quinta:4,sexta:5,sabado:6};
function tsSigNL(n){const k=normT(n);if(/atendimento/.test(k))return 'DT-AP';if(/dire[cç]?ao de turma|direcao de turma/.test(k))return 'DT';if(/biblioteca/.test(k))return 'Biblioteca';if(/tutori/.test(k))return 'Tutoria';if(/clube/.test(k))return 'Clube';if(/coadjuv/.test(k))return 'Coadj.';if(/apoio/.test(k))return 'Apoio';
  if(n.length<=10)return n.replace(/^CNLE/i,'CNL-E');return n.split(/\s+/).filter(w=>w.length>2).map(w=>w[0].toUpperCase()).join('')}
/* uma célula «Disciplina» (+ «Sala») → aulas e/ou tempos não letivos */
function tsCelula(txt,sala){const L=String(txt||'').split(/\n/).map(x=>x.trim()).filter(Boolean);if(!L.length)return {aulas:[],nl:[]};const S_=String(sala||'').split(/\n/).map(x=>x.trim()).filter(Boolean);
  const reT=/^(\d{1,2})\s*[ºª°.]?\s*([A-Z]{1,3})$/i,reS=/^\((.+)\)$/;const A_=[];let i=0;
  while(i<L.length-1&&reT.test(L[i])&&reS.test(L[i+1])){A_.push({turma:L[i].replace(/\s+/g,''),sig:L[i+1].match(reS)[1].trim()});i+=2}
  if(A_.length&&i>=L.length)return {aulas:A_.map((x,k)=>({...x,sala:S_[k]||S_[0]||''})),nl:[]};
  const full=L.join(' ').replace(/\s+-\s*$/,'').replace(/\s+/g,' ').trim();const m=full.match(/^(.*?)\s*\(([^()]+)\)\s*$/);const nome=(m?m[1]:full).trim(),tag=m?m[2].trim():'';
  if(/letivo/i.test(tag)||!tag&&!/\d/.test(nome))return {aulas:[],nl:[{sig:tsSigNL(nome),nome:nome+(/n[aã]o letivo/i.test(tag)?'':tag?' (letivo)':''),sala:S_[0]||''}]};
  return {aulas:[{turma:nome,sig:tag||nome,sala:S_[0]||''}],nl:[]}}
/* grelha comum: linhas [{ini,fim,dias:{d:{t,s}}}] → estrutura do horário do professor */
function tsMontar(G,ficheiro,docente,ano,preview){const aulas=[],nl=[];const linhas=G.map(g=>({ini:g.ini,fim:g.fim}));const ult={};
  G.forEach(g=>Object.entries(g.dias).forEach(([d,c])=>{d=+d;const r=tsCelula(c.t,c.s);r.aulas.forEach(x=>{if(!aulas.some(y=>y.dia===d&&y.ini===g.ini&&y.turma===x.turma&&y.sig===x.sig))aulas.push({dia:d,ini:g.ini,fim:g.fim,turma:x.turma,sig:x.sig,sala:x.sala})});
    r.nl.forEach(x=>{const u=ult[d];const gid=u&&u.sig===x.sig&&u.fim>=g.ini-30?u.g:uid();ult[d]={sig:x.sig,fim:g.fim,g:gid};if(!nl.some(y=>y.dia===d&&y.ini===g.ini&&y.sig===x.sig))nl.push({dia:d,ini:g.ini,fim:g.fim,sig:x.sig,nome:normSig(x.nome)===normSig(x.sig)?nomeNL(x.sig):x.nome,sala:x.sala,g:gid})});
    if(!r.nl.length)ult[d]=null}));
  if(!aulas.length&&!nl.length)throw new Error('Não encontrei aulas no horário (TeacherSchedule).');
  aulas.sort((a,b)=>a.dia-b.dia||a.ini-b.ini);nl.sort((a,b)=>a.dia-b.dia||a.ini-b.ini);
  return {ficheiro,docente:docente||'',grupo:'',escola:'',ano:ano||'',preview:preview||'',linhas,aulas,naoLetivos:nl,obs:[],obsMap:{},paginas:1,origemTS:true}}
const tsAno=txt=>{const m=String(txt||'').match(/(\d{1,2})\s+de\s+([A-Za-zçÇ]+)\s+de\s+(\d{4})/);if(!m)return '';const M=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'].indexOf(normT(m[2]));if(M<0)return '';const y=+m[3];return M>=8?y+'/'+(y+1):(y-1)+'/'+y};
async function lerTeacherScheduleXlsx(file){const z=await unzip(await file.arrayBuffer());const wb=xmlDoc(await z.text('xl/workbook.xml')||'<x/>');const rels=await relsDe(z,'xl/workbook.xml');
  let sst=[];const ss=await z.text('xl/sharedStrings.xml');if(ss)sst=tagsNS(xmlDoc(ss),'si').map(si=>tagsNS(si,'t').map(t=>t.textContent).join(''));
  for(const sh of tagsNS(wb,'sheet')){const rid=sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh.getAttribute('r:id');const rel=rels[rid];if(!rel)continue;const sx=await z.text(rel.target);if(!sx)continue;
    const doc=xmlDoc(sx);const C=new Map();
    tagsNS(doc,'c').forEach(c=>{const ref=c.getAttribute('r');const m=ref&&ref.match(/^([A-Z]+)(\d+)$/);if(!m)return;const t=c.getAttribute('t');let v='';
      if(t==='inlineStr')v=tagsNS(c,'t').map(x=>x.textContent).join('');else{const ve=tagsNS(c,'v')[0];v=ve?ve.textContent:'';if(t==='s')v=sst[+v]||''}if(String(v).trim()!=='')C.set((+m[2]-1)+','+colNum(m[1]),String(v))});
    const g=(r,c)=>(C.get(r+','+c)||'').trim();const cel=[...C.keys()].map(k=>k.split(',').map(Number));
    const porL={};cel.forEach(([r,c])=>{const k=normT(g(r,c));if(TS_DN[k])(porL[r]=porL[r]||[]).push({c,d:TS_DN[k]})});const hr=Object.keys(porL).map(Number).find(r=>porL[r].length>=3);if(hr==null)continue;
    const dias=porL[hr].sort((a,b)=>a.c-b.c);const maxC=Math.max(...cel.map(x=>x[1]));dias.forEach((d,i)=>{d.c2=i<dias.length-1?dias[i+1].c-1:maxC;d.dc=d.c;d.sc=null;for(let c=d.c;c<=d.c2;c++){const v=normT(g(hr+1,c));if(v==='disciplina')d.dc=c;if(v==='sala')d.sc=c}});
    const reT=/(\d{1,2}[:hH]\d{2})\s*[\n\r\-–—a]+\s*(\d{1,2}[:hH]\d{2})/;const tc={};cel.forEach(([r,c])=>{if(r>hr&&reT.test(g(r,c)))tc[c]=(tc[c]||0)+1});const tcol=+Object.keys(tc).sort((a,b)=>tc[b]-tc[a])[0];if(isNaN(tcol))continue;
    const nCls=cel.filter(([r,c])=>r>hr&&/\d{1,2}\s*º\s*[A-Z]/.test(g(r,c))).length;const temProf=cel.some(([r,c])=>r>hr&&/professor/i.test(g(r,c)));if(temProf&&nCls<2)continue;
    const G=[];const vis=new Set();const maxR=Math.max(...cel.map(x=>x[0]));
    for(let r=hr+2;r<=maxR;r++){const m=g(r,tcol).match(reT);if(!m)continue;const ini=hm(m[1]),fim=hm(m[2]);if(vis.has(ini))continue;vis.add(ini);const L={ini,fim,dias:{}};
      dias.forEach(d=>{const t=g(r,d.dc),s=d.sc!=null?g(r,d.sc):'';if(t)L.dias[d.d]={t,s}});G.push(L)}
    if(!G.length)continue;let doc_='';for(let r=hr-1;r>=0&&!doc_;r--){const v=cel.filter(([rr])=>rr===r).map(([rr,c])=>g(rr,c)).find(x=>x&&!/\d/.test(x)&&x.length>4);if(v)doc_=v}
    return tsMontar(G.sort((a,b)=>a.ini-b.ini),file.name,doc_,'')}
  return null}
async function lerTeacherSchedulePdf(file){const lib=await getPdfLib();const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;const page=await doc.getPage(1);const tc=await page.getTextContent();
  const it=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>{const t=i.transform;const h=Math.hypot(t[2],t[3])||8;return {s:i.str.replace(/\s+/g,' ').trim(),x:t[4],y:t[5],w:i.width||0,h,cx:t[4]+(i.width||0)/2}});
  const dh=it.filter(i=>TS_DN[normT(i.s)]);if(dh.length<3)throw new Error('Não encontrei os dias da semana no PDF.');const hy=Math.min(...dh.map(i=>i.y))-1;
  const sub=it.filter(i=>i.y<hy&&/^(disciplina|sala)$/i.test(i.s)).sort((a,b)=>a.cx-b.cx);if(sub.length<4)throw new Error('Não encontrei as colunas Disciplina/Sala.');const sy=Math.min(...sub.map(i=>i.y));
  const dias=dh.sort((a,b)=>a.cx-b.cx).map(i=>TS_DN[normT(i.s)]);const cols=[];let k=0;dias.forEach(d=>{const a=sub[k],b=sub[k+1];if(a&&/disciplina/i.test(a.s)){cols.push({d,tipo:'t',cx:a.cx});if(b&&/sala/i.test(b.s)){cols.push({d,tipo:'s',cx:b.cx});k+=2}else k+=1}});
  const x0=Math.min(...cols.map(c=>c.cx))-40;const T_=it.filter(i=>i.y<sy&&/^\d{1,2}:\d{2}$/.test(i.s)&&i.cx<x0+30).sort((a,b)=>b.y-a.y);const sl=[];
  for(let i=0;i<T_.length-1;i++){const a=T_[i],b=T_[i+1];if(a.y-b.y<a.h*1.8&&hm(b.s)>hm(a.s)){sl.push({ini:hm(a.s),fim:hm(b.s),cy:(a.y+b.y)/2});i++}}
  if(sl.length<2)throw new Error('Não encontrei os tempos (horas) no PDF.');const dy=sl.length>1?sl[0].cy-sl[1].cy:30;
  const G=sl.map(s=>({ini:s.ini,fim:s.fim,dias:{},_t:{}}));const tset=new Set(T_);
  it.filter(i=>i.y<sy-1&&!tset.has(i)&&i.cx>x0&&i.y>sl[sl.length-1].cy-dy*.75).forEach(i=>{let si=0,bd=1e9;sl.forEach((s,j)=>{const d=Math.abs(s.cy-i.y);if(d<bd){bd=d;si=j}});let ci=0,bc=1e9;cols.forEach((c,j)=>{const d=Math.abs(c.cx-i.cx);if(d<bc){bc=d;ci=j}});
    const c=cols[ci];const L=G[si];(L._t[c.d+c.tipo]=L._t[c.d+c.tipo]||[]).push(i)});
  const junta=A_=>{A_.sort((a,b)=>b.y-a.y||a.x-b.x);const out=[];A_.forEach(i=>{const u=out[out.length-1];if(u&&Math.abs(u.y-i.y)<2)u.s+=' '+i.s;else out.push({y:i.y,s:i.s})});return out.map(o=>o.s).join('\n')};
  G.forEach(L=>{dias.forEach(d=>{const t=L._t[d+'t'],s=L._t[d+'s'];if(t&&t.length)L.dias[d]={t:junta(t),s:s?junta(s):''}});delete L._t});
  const top=it.filter(i=>i.y>Math.max(...dh.map(z=>z.y))+2).sort((a,b)=>b.y-a.y);const docente=(top.find(i=>!/\d/.test(i.s)&&i.s.length>4)||{}).s||'';
  let preview='';try{const vp=page.getViewport({scale:1.25});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await page.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;preview=cv.toDataURL('image/jpeg',.7)}catch(_){}
  return tsMontar(G,file.name,docente,tsAno(it.map(i=>i.s).join(' ')),preview)}
{const _lhp=lerHorarioProfPdf;lerHorarioProfPdf=async function(file){const nm=(file&&file.name||'').toLowerCase();
  if(/\.xlsx$/.test(nm)){const r=await lerTeacherScheduleXlsx(file);if(r)return r;throw new Error('Não encontrei a grelha do horário do professor neste Excel (TeacherSchedule).')}
  try{return await _lhp.apply(this,arguments)}catch(e){try{return await lerTeacherSchedulePdf(file)}catch(e2){throw e}}}}

/* ===================== v0.921 · As Minhas Tarefas ao estilo do Microsoft To Do ===================== */
try{Object.assign(ICONS,{sun:ICONS.sun||'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',repeat:'<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',home2:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',note:'<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4"/>',steps:'<circle cx="5" cy="6" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="5" cy="18" r="1.6"/><path d="M10 6h10M10 12h10M10 18h10"/>'})}catch(_){}
const TD_LISTAS_FIX=[['dia','O Meu Dia','sun','#2564cf'],['imp','Importante','star','#c2185b'],['plan','Planeado','calendar','#107c41'],['reun','Das Reuniões','meet','#8a5a00'],['todas','Tarefas','home2','#2564cf'],['avisos','Avisos Urgentes','bell','#c0392b']];
const TD_CORES=['#2564cf','#107c41','#c2185b','#8764b8','#ca5010','#038387','#5b6b7f','#b4009e'];
const TD_REP=[['','Não repetir'],['d','Diariamente'],['u','Dias úteis'],['s','Semanalmente'],['m','Mensalmente'],['a','Anualmente']];
const tdListas=()=>S.todoListas=S.todoListas||[];
const tdHoje=()=>isoData(new Date());
const tdImp=x=>x.prio==='alta';
const tdNoDia=x=>x.dia===tdHoje();
const tdAtr=x=>!x.feito&&x.prazo&&x.prazo<tdHoje();
function tdProx(iso,r){const d=dataDeIso(iso||tdHoje());if(r==='d')d.setDate(d.getDate()+1);else if(r==='u'){do{d.setDate(d.getDate()+1)}while(d.getDay()===0||d.getDay()===6)}else if(r==='s')d.setDate(d.getDate()+7);else if(r==='m')d.setMonth(d.getMonth()+1);else if(r==='a')d.setFullYear(d.getFullYear()+1);return isoData(d)}
function tdConcluir(x,on){x.feito=on;x.feitaEm=on?Date.now():null;if(on&&x.rep&&!x._repFeito){x._repFeito=1;const n=JSON.parse(JSON.stringify(x));Object.assign(n,{id:uid(),feito:false,feitaEm:null,criada:Date.now(),_repFeito:0,prazo:tdProx(x.prazo,x.rep),dia:'',lemb:x.lemb?tdProx(x.lemb.slice(0,10),x.rep)+x.lemb.slice(10):'',lembFeito:false,passos:(x.passos||[]).map(p=>({...p,f:false}))});tarefas().push(n);toast('Tarefa repetida: próxima a '+fmtIsoL(n.prazo),'ok')}
  if(on){try{audit('Tarefas','Tarefa concluída',x.t)}catch(_){}}}
function tdFiltro(k){const L=tarefas();if(k==='dia')return L.filter(tdNoDia);if(k==='imp')return L.filter(tdImp);if(k==='plan')return L.filter(x=>x.prazo);if(k==='todas')return L.filter(x=>!x.lista);const l=tdListas().find(z=>z.id===k);return l?L.filter(x=>x.lista===k):L}
function tdOrdena(L){const o=UI.tdOrd||'';const f=(x,y)=>o==='imp'?(tdImp(y)-tdImp(x))||(x.criada-y.criada):o==='data'?((x.prazo||'9').localeCompare(y.prazo||'9')):o==='alfa'?x.t.localeCompare(y.t,'pt'):o==='cri'?(y.criada-x.criada):((x.ord??x.criada)-(y.ord??y.criada));return L.slice().sort(f)}
function tdNomeLista(k){const f=TD_LISTAS_FIX.find(z=>z[0]===k);if(f)return f[1];const l=tdListas().find(z=>z.id===k);return l?l.nome:'Tarefas'}
function tdCorLista(k){const f=TD_LISTAS_FIX.find(z=>z[0]===k);if(f)return f[3];const l=tdListas().find(z=>z.id===k);return l&&l.cor||'#2564cf'}
function tdReun(){const a=A();if(!a)return [];return reunioes(a).flatMap(r=>(r.decisoes||[]).map((d,i)=>({d,r,i})))}
function tdContar(k){if(k==='reun')return tdReun().filter(o=>!o.d.ok).length;if(k==='avisos'){try{return avisosM().length}catch(_){return 0}}return tdFiltro(k).filter(x=>!x.feito).length}
function vTarefasTD(){const sel=UI.tdL||'dia';const hj=tdHoje();const sch=UI.tdQ||'';const det=UI.tdSel&&tarefas().find(x=>x.id===UI.tdSel);
  barBtns([{id:'b-tdnl',t:ic('plus',15)+' Nova Lista',f:()=>tdListaDlg()},{id:'b-tdlimp',t:ic('trash',15)+' Limpar Concluídas',f:()=>{const L=tdFiltro(sel).filter(x=>x.feito);if(!L.length)return toast('Não há tarefas concluídas nesta lista');if(!confirm('Apagar '+L.length+' tarefa(s) concluída(s) desta lista?'))return;const ids=new Set(L.map(x=>x.id));S.todo=tarefas().filter(x=>!ids.has(x.id));save();vTarefasTD()}}]);
  const nav=k=>{const f=TD_LISTAS_FIX.find(z=>z[0]===k);const l=f?{id:k,nome:f[1],ic:f[2],cor:f[3]}:{...tdListas().find(z=>z.id===k),ic:'list'};const n=tdContar(k);
    return `<button type="button" class="xtn ${sel===k?'on':''}" data-tdl="${esc(k)}" style="--lc:${esc(l.cor||'#2564cf')}">${ic(l.ic,18)}<span>${esc(l.nome)}</span>${n?`<i>${n}</i>`:''}</button>`};
  const titulo=tdNomeLista(sel),cor=tdCorLista(sel);
  let corpo='';
  if(sel==='reun'){const R=tdReun().sort((x,y)=>(x.d.ok-y.d.ok)||(x.d.prazo||'9').localeCompare(y.d.prazo||'9'));
    corpo=R.length?`<div class="xtlist">${R.map(({d,r,i})=>`<div class="xtr ${d.ok?'ok':''}"><button type="button" class="xtck ${d.ok?'on':''}" data-rdk="${r.id}|${i}" aria-label="${d.ok?'Reabrir':'Concluir'}">${ic('check',12)}</button><div class="xtrt"><b>${esc(d.t)}</b><small>${ic('meet',11)} ${esc(reunTitulo(r,A()))}${d.resp?' · '+esc(d.resp):''}${d.prazo?` · <span class="${!d.ok&&d.prazo<hj?'atr':''}">${esc(fmtIsoL(d.prazo))}</span>`:''}</small></div><button type="button" class="btn sm" data-ro="${r.id}">Reunião</button></div>`).join('')}</div>`:`<div class="xtvz">${ic('meet',40)}<b>Sem decisões das reuniões</b><span>As deliberações com responsável e prazo aparecem aqui.</span></div>`}
  else if(sel==='avisos'){corpo=cartaoAvisos()}
  else{let L=tdFiltro(sel);if(sch)L=tarefas().filter(x=>normT(x.t+' '+(x.nota||'')+' '+(x.passos||[]).map(p=>p.t).join(' ')).includes(normT(sch)));const P=tdOrdena(L.filter(x=>!x.feito)),F=L.filter(x=>x.feito).sort((a,b)=>(b.feitaEm||0)-(a.feitaEm||0));
    const TT=(A()||{turmas:[]}).turmas;
    const row=x=>{const np=(x.passos||[]).length,nf=(x.passos||[]).filter(p=>p.f).length;const sub=[];if(sel!=='todas'&&!tdListas().some(l=>l.id===sel)&&(x.lista||sel==='dia'||sel==='imp'||sel==='plan'))sub.push(esc(tdNomeLista(x.lista||'todas')));if(tdNoDia(x)&&sel!=='dia')sub.push(ic('sun',11)+' O Meu Dia');if(np)sub.push(`${nf} de ${np}`);
      if(x.prazo)sub.push(`<span class="${tdAtr(x)?'atr':x.prazo===hj?'hj':''}">${ic('calendar',11)} ${x.prazo===hj?'Hoje':esc(fmtIsoL(x.prazo))}</span>`);if(x.lemb)sub.push(ic('bell',11));if(x.rep)sub.push(ic('repeat',11));if(x.nota)sub.push(ic('note',11)+' Nota');
      if(x.turma){const t=TT.find(z=>z.id===x.turma);if(t)sub.push(esc(t.nome+' · '+t.disciplina))}
      return `<div class="xtr ${x.feito?'ok':''} ${det&&det.id===x.id?'sel':''}" data-tdx="${x.id}" draggable="${!x.feito&&!UI.tdOrd}"><button type="button" class="xtck ${x.feito?'on':''}" data-tdk="${x.id}" aria-label="${x.feito?'Marcar como não concluída':'Marcar como concluída'}">${ic('check',12)}</button><div class="xtrt"><b>${esc(x.t)}</b>${sub.length?`<small>${sub.join('<i class="dot">•</i>')}</small>`:''}</div><button type="button" class="xtst ${tdImp(x)?'on':''}" data-tds="${x.id}" aria-label="${tdImp(x)?'Remover de Importante':'Marcar como importante'}">${ic('star',17)}</button></div>`};
    const sug=sel==='dia'?tarefas().filter(x=>!x.feito&&!tdNoDia(x)&&x.prazo&&x.prazo<=hj):[];
    corpo=`${sch?'':`<div class="xtadd"><span class="xtaddi">${ic('plus',18)}</span><input id="td-new" placeholder="Adicionar uma tarefa" autocomplete="off"><span class="xtaddo"><input type="date" id="td-newd" title="Data de conclusão" aria-label="Data de conclusão"><button type="button" class="btn sm ico" id="td-newimp" aria-pressed="false" title="Importante">${ic('star',15)}</button><button type="button" class="btn sm pri" id="td-newok">Adicionar</button></span></div>`}
      ${sug.length?`<details class="xtsug"><summary>${ic('sparkle',14)} Sugestões para hoje (${sug.length})</summary>${sug.map(x=>`<div class="xtr"><div class="xtrt"><b>${esc(x.t)}</b><small class="${tdAtr(x)?'atr':''}">${esc(fmtIsoL(x.prazo))}</small></div><button type="button" class="btn sm" data-xtsug="${x.id}">${ic('plus',13)} O Meu Dia</button></div>`).join('')}</details>`:''}
      <div class="xtlist" id="td-l">${P.map(row).join('')}</div>
      ${!P.length&&!F.length?`<div class="xtvz">${ic(sel==='dia'?'sun':sel==='imp'?'star':sel==='plan'?'calendar':'checks',42)}<b>${sel==='dia'?'Concentre-se no seu dia':sel==='imp'?'Tarefas importantes aparecem aqui':sel==='plan'?'Tarefas com data aparecem aqui':'Nada por fazer'}</b><span>${sel==='dia'?'Junte tarefas ao O Meu Dia — recomeça vazio todos os dias.':'Escreva acima e carregue em Enter.'}</span></div>`:''}
      ${F.length?`<details class="xtfeitas" ${UI.tdF?'open':''}><summary>Concluídas <i>${F.length}</i></summary><div class="xtlist">${F.map(row).join('')}</div></details>`:''}`}
  const hdrDia=sel==='dia'?`<small>${esc(new Date().toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'}))}</small>`:'';
  $('#view').innerHTML=`<div class="card xtw ${det?'comdet':''}" style="--lc:${esc(cor)}">
    <aside class="xtside"><div class="xtq">${ic('search',15)}<input type="search" id="td-q" placeholder="Procurar" value="${esc(sch)}"></div>${TD_LISTAS_FIX.map(z=>nav(z[0])).join('')}<hr>${tdListas().map(l=>nav(l.id)).join('')}<button type="button" class="xtn nova" id="td-nl">${ic('plus',18)}<span>Nova lista</span></button></aside>
    <section class="xtmain"><header class="xth"><div><h2>${sch?'A procurar «'+esc(sch)+'»':esc(titulo)}</h2>${hdrDia}</div><span class="sp1"></span>
      ${sel!=='reun'&&sel!=='avisos'?`<select id="td-ord" aria-label="Ordenar"><option value="">Ordem manual</option>${[['imp','Importância'],['data','Data de conclusão'],['alfa','Alfabeticamente'],['cri','Data de criação']].map(([k,l])=>`<option value="${k}" ${UI.tdOrd===k?'selected':''}>${l}</option>`).join('')}</select>`:''}
      ${tdListas().some(l=>l.id===sel)?`<button type="button" class="btn sm" id="td-led">${ic('pencil',13)} Lista</button>`:''}</header>${corpo}</section>
    ${det?tdDetalhe(det):''}</div>`;
  tdBind(sel)}
function tdDetalhe(x){const TT=(A()||{turmas:[]}).turmas;const P=x.passos||[];
  return `<aside class="xtdet" aria-label="Detalhes da tarefa"><div class="xtdh"><button type="button" class="xtck ${x.feito?'on':''}" data-tdk="${x.id}" aria-label="Concluir">${ic('check',12)}</button><textarea id="tdd-t" rows="2" aria-label="Título">${esc(x.t)}</textarea><button type="button" class="xtst ${tdImp(x)?'on':''}" data-tds="${x.id}" aria-label="Importante">${ic('star',18)}</button></div>
    <div class="xtps">${P.map((p,k)=>`<div class="xtp ${p.f?'ok':''}"><button type="button" class="xtck sm ${p.f?'on':''}" data-tdpk="${k}" aria-label="Concluir passo">${ic('check',10)}</button><input value="${esc(p.t)}" data-tdpt="${k}" aria-label="Passo ${k+1}"><button type="button" class="xtpx" data-xtpx="${k}" aria-label="Apagar passo">×</button></div>`).join('')}
      <div class="xtp nv">${ic('plus',14)}<input id="tdd-np" placeholder="${P.length?'Passo seguinte':'Adicionar passo'}"></div></div>
    <button type="button" class="xtdb ${tdNoDia(x)?'on':''}" id="tdd-dia">${ic('sun',16)} ${tdNoDia(x)?'Adicionado ao O Meu Dia':'Adicionar ao O Meu Dia'}</button>
    <div class="xtdg"><label class="xtdb">${ic('bell',16)}<span>Lembrar-me</span><input type="datetime-local" id="tdd-lb" value="${esc(x.lemb||'')}"></label>
      <label class="xtdb">${ic('calendar',16)}<span>Data de conclusão</span><input type="date" id="tdd-pz" value="${esc(x.prazo||'')}"></label>
      <label class="xtdb">${ic('repeat',16)}<span>Repetir</span><select id="tdd-rp">${TD_REP.map(([k,l])=>`<option value="${k}" ${(x.rep||'')===k?'selected':''}>${l}</option>`).join('')}</select></label></div>
    <div class="xtdg"><label class="xtdb">${ic('list',16)}<span>Lista</span><select id="tdd-ls"><option value="">Tarefas</option>${tdListas().map(l=>`<option value="${l.id}" ${x.lista===l.id?'selected':''}>${esc(l.nome)}</option>`).join('')}</select></label>
      <label class="xtdb">${ic('school',16)}<span>Turma</span><select id="tdd-tu"><option value="">Sem turma</option>${TT.map(t=>`<option value="${t.id}" ${x.turma===t.id?'selected':''}>${esc(t.nome+' · '+t.disciplina)}</option>`).join('')}</select></label></div>
    <textarea id="tdd-n" class="xtdn" placeholder="Adicionar nota" rows="5">${esc(x.nota||'')}</textarea>
    <footer class="xtdf"><button type="button" class="btn sm ico" id="tdd-x" aria-label="Fechar detalhes" title="Fechar">${ic('chev',14)}</button><span>Criada ${esc(new Date(x.criada||Date.now()).toLocaleDateString('pt-PT',{weekday:'short',day:'numeric',month:'long'}))}${x.orig&&x.orig.tipo==='contactoEE'?' · contacto com o EE':''}</span><button type="button" class="btn sm ico dng" id="tdd-del" aria-label="Apagar tarefa" title="Apagar">${ic('trash',14)}</button></footer></aside>`}
function tdBind(sel){const re=()=>vTarefasTD();const T_=id=>tarefas().find(z=>z.id===id);
  $$('[data-tdl]').forEach(b=>b.onclick=()=>{UI.tdL=b.dataset.tdl;UI.tdQ='';UI.tdSel=null;re()});
  const q=$('#td-q');if(q)q.oninput=()=>{UI.tdQ=q.value;const p=q.selectionStart;re();const n=$('#td-q');n.focus();n.setSelectionRange(p,p)};
  const nl=$('#td-nl');if(nl)nl.onclick=()=>tdListaDlg();const le=$('#td-led');if(le)le.onclick=()=>tdListaDlg(tdListas().find(l=>l.id===sel));
  const od=$('#td-ord');if(od)od.onchange=()=>{UI.tdOrd=od.value;re()};
  const ni=$('#td-new');if(ni){let imp=false;const ib=$('#td-newimp');ib.onclick=()=>{imp=!imp;ib.classList.toggle('on',imp);ib.setAttribute('aria-pressed',imp)};
    const add=()=>{const t=ni.value.trim();if(!t)return ni.focus();const x={id:uid(),t,feito:false,criada:Date.now(),ord:Date.now(),prazo:$('#td-newd').value||(sel==='plan'?tdHoje():''),prio:imp||sel==='imp'?'alta':'normal',dia:sel==='dia'?tdHoje():'',lista:tdListas().some(l=>l.id===sel)?sel:'',passos:[]};
      tarefas().push(x);save();try{audit('Tarefas','Tarefa criada',t)}catch(_){}re();setTimeout(()=>{const n=$('#td-new');n&&n.focus()},30)};
    ni.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add()}};$('#td-newok').onclick=add}
  $$('[data-tdk]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=T_(b.dataset.tdk);if(!x)return;tdConcluir(x,!x.feito);save();if(x.feito){b.classList.add('on','pop');try{if(document.documentElement.classList.contains('anim-cheio')||1){const r=b.getBoundingClientRect();if(typeof animConfetes==='function'&&tdFiltro(sel).every(z=>z.feito))animConfetes(r.left,r.top)}}catch(_){}setTimeout(re,280)}else re();try{tarBadge()}catch(_){}});
  $$('[data-tds]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=T_(b.dataset.tds);if(!x)return;x.prio=tdImp(x)?'normal':'alta';save();re()});
  $$('[data-tdx]').forEach(r=>r.onclick=e=>{if(e.target.closest('button'))return;UI.tdSel=UI.tdSel===r.dataset.tdx?null:r.dataset.tdx;re()});
  $$('[data-xtsug]').forEach(b=>b.onclick=()=>{const x=T_(b.dataset.xtsug);if(x){x.dia=tdHoje();save();re()}});
  $$('[data-rdk]').forEach(c=>c.onclick=()=>{const [rid,i]=c.dataset.rdk.split('|');const r=reunioes(A()).find(z=>z.id===rid);if(r&&r.decisoes[+i]){r.decisoes[+i].ok=!r.decisoes[+i].ok;save();try{audit('Reuniões','Decisão '+(r.decisoes[+i].ok?'concluída':'reaberta'),r.decisoes[+i].t)}catch(_){}re()}});
  $$('[data-ro]').forEach(b=>b.onclick=()=>{try{UI.reun=b.dataset.ro;go('reunioes')}catch(_){}});
  if(sel==='avisos'){try{$('#av-novo').onclick=()=>avisoDlg();$('#av-ver').onclick=()=>mostrarAvisos(true);$$('[data-ave]').forEach(b=>b.onclick=()=>avisoDlg(avisosM().find(z=>z.id===b.dataset.ave)));$$('[data-avx]').forEach(b=>b.onclick=()=>{S.avisos=avisosM().filter(z=>z.id!==b.dataset.avx);save();re()})}catch(_){}}
  const fd=$('.xtfeitas');if(fd)fd.ontoggle=()=>{UI.tdF=fd.open};
  /* arrastar para reordenar (ordem manual) ou largar numa lista */
  let dr=null;$$('#td-l .xtr[draggable=true]').forEach(r=>{r.ondragstart=e=>{dr=r.dataset.tdx;window.__dragInt=true;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain','tarefa')}catch(_){}r.classList.add('arr')};r.ondragend=()=>{r.classList.remove('arr');dr=null};
    r.ondragover=e=>{if(!dr)return;e.preventDefault();r.classList.add('alvo')};r.ondragleave=()=>r.classList.remove('alvo');
    r.ondrop=e=>{e.preventDefault();r.classList.remove('alvo');if(!dr||dr===r.dataset.tdx)return;const L=tdOrdena(tdFiltro(sel).filter(x=>!x.feito));const a=L.findIndex(x=>x.id===dr),b=L.findIndex(x=>x.id===r.dataset.tdx);if(a<0||b<0)return;const [m]=L.splice(a,1);L.splice(b,0,m);L.forEach((x,k)=>x.ord=k);save();re()}});
  $$('.xtn[data-tdl]').forEach(n=>{n.ondragover=e=>{if(!dr)return;e.preventDefault();n.classList.add('alvo')};n.ondragleave=()=>n.classList.remove('alvo');n.ondrop=e=>{e.preventDefault();n.classList.remove('alvo');const x=T_(dr);if(!x)return;const k=n.dataset.tdl;
    if(k==='dia')x.dia=tdHoje();else if(k==='imp')x.prio='alta';else if(k==='plan'){if(!x.prazo)x.prazo=tdHoje()}else if(k==='todas')x.lista='';else if(tdListas().some(l=>l.id===k))x.lista=k;save();re();toast('Tarefa movida para '+tdNomeLista(k),'ok')}});
  /* detalhes */
  const x=UI.tdSel&&T_(UI.tdSel);if(!x)return;const sv=()=>{save()};
  const tt=$('#tdd-t');tt.onchange=()=>{x.t=tt.value.trim()||x.t;sv();re()};tt.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();tt.blur()}};
  $('#tdd-dia').onclick=()=>{x.dia=tdNoDia(x)?'':tdHoje();sv();re()};
  $('#tdd-lb').onchange=e=>{x.lemb=e.target.value;x.lembFeito=false;sv();re();if(x.lemb&&'Notification' in window&&Notification.permission==='default')try{Notification.requestPermission()}catch(_){}};
  $('#tdd-pz').onchange=e=>{x.prazo=e.target.value;sv();re()};$('#tdd-rp').onchange=e=>{x.rep=e.target.value;if(x.rep&&!x.prazo)x.prazo=tdHoje();sv();re()};
  $('#tdd-ls').onchange=e=>{x.lista=e.target.value;sv();re()};$('#tdd-tu').onchange=e=>{x.turma=e.target.value||null;sv()};
  const nn=$('#tdd-n');nn.oninput=()=>{x.nota=nn.value;clearTimeout(nn._t);nn._t=setTimeout(sv,400)};nn.onchange=()=>{sv();re()};
  const np=$('#tdd-np');np.onkeydown=e=>{if(e.key==='Enter'&&np.value.trim()){x.passos=x.passos||[];x.passos.push({t:np.value.trim(),f:false});sv();re();setTimeout(()=>{const n=$('#tdd-np');n&&n.focus()},30)}};
  $$('[data-tdpk]').forEach(b=>b.onclick=()=>{const p=x.passos[+b.dataset.tdpk];p.f=!p.f;sv();re()});
  $$('[data-tdpt]').forEach(i=>i.onchange=()=>{const k=+i.dataset.tdpt;if(i.value.trim())x.passos[k].t=i.value.trim();else x.passos.splice(k,1);sv();re()});
  $$('[data-xtpx]').forEach(b=>b.onclick=()=>{x.passos.splice(+b.dataset.xtpx,1);sv();re()});
  $('#tdd-x').onclick=()=>{UI.tdSel=null;re()};$('#tdd-del').onclick=()=>{if(!confirm('Apagar «'+x.t+'»?'))return;S.todo=tarefas().filter(z=>z.id!==x.id);UI.tdSel=null;save();re()}}
function tdListaDlg(l){const nova=!l;openDrawer(nova?'Nova Lista':'Editar Lista',`<div class="ed"><label for="tl-n">Nome</label><input id="tl-n" value="${esc(l&&l.nome||'')}" placeholder="ex.: Direção de Turma, Departamento, Casa…"><label style="margin-top:12px">Cor</label><div class="xtcor">${TD_CORES.map(c=>`<button type="button" data-tlc="${c}" class="${(l&&l.cor||TD_CORES[0])===c?'on':''}" style="background:${c}" aria-label="Cor"></button>`).join('')}</div>
  <div class="row" style="margin-top:16px"><button class="btn pri" id="tl-ok">${ic('check',14)} ${nova?'Criar Lista':'Guardar'}</button>${nova?'':`<span class="sp1"></span><button class="btn dng" id="tl-del">${ic('trash',14)} Apagar Lista</button>`}</div></div>`);
  let cor=l&&l.cor||TD_CORES[0];$$('[data-tlc]').forEach(b=>b.onclick=()=>{cor=b.dataset.tlc;$$('[data-tlc]').forEach(z=>z.classList.toggle('on',z===b))});setTimeout(()=>$('#tl-n').focus(),50);
  $('#tl-ok').onclick=()=>{const n=$('#tl-n').value.trim();if(!n)return toast('Escreva o nome da lista','erro');if(nova){const z={id:'l'+uid(),nome:n,cor};tdListas().push(z);UI.tdL=z.id}else{l.nome=n;l.cor=cor}save();closeDrawer();vTarefasTD()};
  const d=$('#tl-del');if(d)d.onclick=()=>{const n=tarefas().filter(x=>x.lista===l.id).length;if(!confirm('Apagar a lista «'+l.nome+'»'+(n?' e as suas '+n+' tarefa(s)':'')+'?'))return;S.todo=tarefas().filter(x=>x.lista!==l.id);S.todoListas=tdListas().filter(z=>z.id!==l.id);UI.tdL='dia';save();closeDrawer();vTarefasTD()}}
/* lembretes: avisa à hora marcada (toast + notificação do sistema) */
setInterval(()=>{try{if(!S||!S.todo)return;const now=new Date();const iso=isoData(now)+'T'+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');let m=false;
  tarefas().forEach(x=>{if(x.lemb&&!x.lembFeito&&!x.feito&&x.lemb<=iso){x.lembFeito=true;m=true;toast('Lembrete: '+x.t,'ok');try{if('Notification' in window&&Notification.permission==='granted'){if(navigator.serviceWorker&&navigator.serviceWorker.ready)navigator.serviceWorker.ready.then(r=>r.showNotification('EduSpruce · Lembrete',{body:x.t,tag:'td-'+x.id,data:{v:'tarefas'}})).catch(()=>new Notification('EduSpruce · Lembrete',{body:x.t}));else new Notification('EduSpruce · Lembrete',{body:x.t})}}catch(_){}}});if(m)save()}catch(_){}},30000);
vTarefas=vTarefasTD;if(go._f)go._f.tarefas=vTarefasTD;

/* ===================== v0.922 · Pautas oficiais PROFIJ (FPCT e Classificação Final de Curso) em Word e PDF, fiéis aos modelos ===================== */
const PT_SEC='Secretaria Regional da Educação, Cultura e Desporto',PT_PORT='(Portaria nº 52/2016 de 16 de junho, alterada pela Portaria nº 86/2018 de 12 de julho)';
const PT_CRIT=[['Caraterização da Entidade Enquadradora',60],['Descrição das Atividades Desenvolvidas',60],['Análise Crítica',60],['Capacidade de Autoavaliação',20]];
const ptN=(v,d)=>v==null||v===''||isNaN(v)?'':(d==null?String(v):(+v).toFixed(d)).replace('.',',');
const ptR=(v,d)=>v==null||isNaN(v)?null:Math.round(v*Math.pow(10,d)+1e-9)/Math.pow(10,d);
const ptNum=s=>{if(s==null||s==='')return null;const v=parseFloat(String(s).replace(',','.').replace(/[^\d.\-]/g,''));return isNaN(v)?null:v};
function ptCfg(cl){const {y}=CP();y.pautas=y.pautas||{};const M=(()=>{try{return cpmM(cl.nome)}catch(_){return {}}})();const a=A();
  const P=y.pautas[cl.nome]=y.pautas[cl.nome]||{};const ano=(a&&a.nome)||'';const ac=((M.anoCurso||'').match(/\d/)||[''])[0];
  const base=(cl.curso||M.curso||'').trim();const niv=M.nivel||'IV';
  P.sec=P.sec||PT_SEC;P.port=P.port||PT_PORT;P.ano=P.ano||ano;P.curso=P.curso||((base||cl.nome)+(ac?' – '+ac+'.º ano':'')+' – PROFIJ '+niv+' – Tipo 4');P.cursoCF=P.cursoCF||((base||cl.nome)+' – PROFIJ '+niv+' – Tipo 4');
  P.local=P.local||(S.cfg.localidade||'');P.data=P.data||isoData(new Date());P.assin=P.assin||((typeof profGenProfX==='function'&&profGenProfX()==='F')?'A Coordenadora do Programa PROFIJ':'O Coordenador do Programa PROFIJ');
  P.pRel=P.pRel==null?20:P.pRel;P.crit=P.crit||PT_CRIT.map(([n,m])=>({n,m}));P.anoC=P.anoC||(+ac||3);return P}
const ptHist=()=>{const c=S.cprofij=S.cprofij||{};return c.hist=c.hist||{}};
const ptFp=(cl,al)=>{const {y}=CP();const k=cl.nome+'|'+al.k;return y.fpct[k]=y.fpct[k]||{}};
/* linhas da pauta com todos os cálculos (como nas folhas de cálculo da escola) */
function ptLinhas(cl){const P=ptCfg(cl);const a=A();const H=ptHist();
  return cl.formandos.map(al=>{const f=ptFp(cl,al);const d=f.det=f.det||{};const proc=(al.ref&&(al.ref.processo||al.ref.proc))||al.num||'';
    const rel=(d.rel||[]).map(ptNum);const relT=rel.some(v=>v!=null)?rel.reduce((s,v)=>s+(v||0),0):null;const relC=d.relC!=null&&d.relC!==''?ptNum(d.relC):(relT!=null?relT/10:null);
    const ent=ptNum(d.ent);const nota=relC!=null&&ent!=null?ptR(relC*P.pRel/100+ent*(100-P.pRel)/100,2):null;const fin=nota!=null?Math.round(nota):(f.nota!=null&&f.nota!==''?+f.nota:null);
    const h=H[al.k]=H[al.k]||{};const r=(()=>{try{return cpLinha(cl,al,a)}catch(_){return {comp:{}}}})();
    const atual={fsc:r.comp.sociocultural?ptR(r.comp.sociocultural.v,1):null,fc:r.comp.cientifica?ptR(r.comp.cientifica.v,1):null,ft:r.comp.tecnologica?ptR(r.comp.tecnologica.v,1):null,fp:fin};
    const cfa={};[1,2,3].forEach(n=>{const o=Object.assign({},n===P.anoC?atual:{},h['a'+n]||{});['fsc','fc','ft','fp'].forEach(k=>{if(h['a'+n]&&h['a'+n][k]!=null&&h['a'+n][k]!=='')o[k]=ptNum(h['a'+n][k])});
      o.cfa=['fsc','fc','ft','fp'].every(k=>o[k]!=null)?ptR((o.fsc+o.fc+2*o.ft+o.fp)/5,1):(h['a'+n]&&h['a'+n].cfa!=null&&h['a'+n].cfa!==''?ptNum(h['a'+n].cfa):null);cfa[n]=o});
    const cpaf=h.cpaf!=null&&h.cpaf!==''?ptNum(h.cpaf):(r.paf!=null?r.paf:null);const cfc=[cfa[1].cfa,cfa[2].cfa,cfa[3].cfa,cpaf].every(v=>v!=null)?Math.round((cfa[1].cfa+cfa[2].cfa+cfa[3].cfa+cpaf)/4):null;
    return {al,proc,cc:d.cc||(al.ref&&al.ref.cc)||'',nome:al.nome,rel,relT,relC,ent,nota,fin,cfa,cpaf,cfc,f,d,h}})}
const ptMaiusc=s=>String(s||'').toLocaleUpperCase('pt-PT');
const ptDataExt=iso=>{if(!iso)return '';const d=dataDeIso(iso);return d.getDate()+' de '+['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][d.getMonth()]+' de '+d.getFullYear()};
const ptNivel=c=>{const m=String(c||'').match(/PROFIJ\s+([IVX]+)\s*[–-]\s*Tipo\s*(\d)/i);return m?'nível '+m[1]+' – tipo '+m[2]:'nível IV – tipo 4'};
function ptDoc(cl,tipo){const P=ptCfg(cl);const L=ptLinhas(cl);const fpct=/^fpct/.test(tipo),det=/D$/.test(tipo);
  const tit=[P.sec,(fpct?'FORMAÇÃO PRÁTICA EM CONTEXTO DE TRABALHO ':'CLASSIFICAÇÃO FINAL DE CURSO ')+P.ano,'PAUTA DE AVALIAÇÃO','Curso '+(fpct?P.curso:P.cursoCF),'Programa Formativo de Inserção de Jovens (PROFIJ)'];
  const linhas=L.map(x=>({num:String(x.proc||''),cc:x.cc?(String(x.cc).startsWith('…')?x.cc:'…'+String(x.cc).slice(-3)):'',nome:ptMaiusc(x.nome),
    nota:fpct?(x.fin!=null?String(x.fin):''):(x.cfc!=null?String(x.cfc):''),
    det:fpct?[ptN(x.relC),x.ent!=null?ptN(x.ent):'',x.nota!=null?ptN(x.nota,2):'',x.fin!=null?String(x.fin):'']:[ptN(x.cfa[1].cfa),ptN(x.cfa[2].cfa),ptN(x.cfa[3].cfa),x.cpaf!=null?ptN(x.cpaf):'',x.cfc!=null?String(x.cfc):'']}));
  const cab=fpct?['RELATÓRIO','AVAL. ENT.','NOTA','NOTA FINAL']:['CFA1','CFA2','CFA3','CPAF','NOTA FINAL'];const nv=ptNivel(P.cursoCF);
  const notas=!fpct&&det?[{i:true,t:'CFA1 – Classificação Final Anual 1.º ano – CFA2 – Classificação Final Anual 2.º Ano – CFA3 – Classificação Final Anual 3.º ano – CPAF – Classificação Final Prova de Avaliação Final'},
    {t:'A classificação de cada ano de formação de um curso de '+nv+', obtém-se pela aplicação da seguinte fórmula: ',b:'CFA = (FSC+FC+2FT+FP)/5',t2:', cujo resultado é arredondado às décimas.'},
    {t:'A classificação final respeitante à conclusão dos itinerários de '+nv.replace('nível','nível')+' obtém-se pela aplicação da seguinte fórmula: ',b:'CFC = (CFA1+CFA2+ CFA3+CPAF)/4',t2:', cujo resultado é arredondado às unidades.'}]:[];
  return {tit,port:P.port,det,cab,linhas,notas,local:P.local,data:ptDataExt(P.data),assin:P.assin,ano:P.ano,nome:(fpct?'FPCT':'CFC')+' - Pauta '+(det?'Detalhada':'Final')+' - '+cl.nome}}
/* ---- imagens do cabeçalho (logótipo da escola + os do modelo Word, se o carregar) ---- */
function ptImgInfo(src){return new Promise(ok=>{if(!src)return ok(null);const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);const u=c.toDataURL('image/png');const b=atob(u.split(',')[1]);const a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);ok({w:im.naturalWidth,h:im.naturalHeight,png:a,src})}catch(_){ok(null)}};im.onerror=()=>ok(null);im.src=src})}
async function ptLogos(){const e=EC()||{};const {c}=CP();const T=(c.ptLogos||[]).map(id=>FOTOS[id]).filter(Boolean);const esq=e.logo||T[0]||null;const dir=e.logo?T.slice(T.length>1?1:0):T.slice(1);
  return {esq:await ptImgInfo(esq),dir:(await Promise.all(dir.map(ptImgInfo))).filter(Boolean),escola:nomeEscola(e)||S.cfg.escola||''}}
async function ptModeloLogos(file){const z=await unzip(await file.arrayBuffer());const ids=[];const hs=['word/header1.xml','word/header2.xml','word/header3.xml'];
  for(const h of hs){const x=await z.text(h);if(!x)continue;const rels=await z.text(h.replace('word/','word/_rels/')+'.rels');if(!rels)continue;const R={};(rels.match(/<Relationship [^>]*>/g)||[]).forEach(r=>{const id=(r.match(/Id="([^"]+)"/)||[])[1],tg=(r.match(/Target="([^"]+)"/)||[])[1];if(id&&tg)R[id]=tg});
    const ord=[...x.matchAll(/r:embed="([^"]+)"/g)].map(m=>R[m[1]]).filter(Boolean);if(!ord.length)continue;
    for(const tg of ord){const p=resolvePath(h,tg);if(!/\.(png|jpe?g|gif)$/i.test(p))continue;const b=await z.bytes(p);if(!b)continue;let s='';for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));
      const mime=/png$/i.test(p)?'image/png':/gif$/i.test(p)?'image/gif':'image/jpeg';ids.push(guardarDoc('data:'+mime+';base64,'+btoa(s)))}if(ids.length)break}
  if(!ids.length)throw new Error('O modelo não tem imagens no cabeçalho (PNG ou JPEG).');return ids}
/* ---- Word (.docx) ---- */
const xE=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
async function ptDocx(cl,tipo){const D=ptDoc(cl,tipo);const LG=await ptLogos();const imgs=[];let did=1;
  const img=(o,hMm)=>{if(!o)return '';const id='rIdImg'+(imgs.length+1);imgs.push({id,o});const cy=Math.round(hMm*36000),cx=Math.round(cy*o.w/o.h);const n=did++;
    return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${n}" name="Imagem ${n}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${n}" name="img${n}.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`};
  const run=(t,o)=>{o=o||{};return `<w:r><w:rPr>${o.b?'<w:b/>':''}${o.i?'<w:i/>':''}${o.sz?`<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`:''}</w:rPr>${String(t).split('\t').map((p,k)=>(k?'<w:tab/>':'')+`<w:t xml:space="preserve">${xE(p)}</w:t>`).join('')}</w:r>`};
  const par=(runs,o)=>{o=o||{};return `<w:p><w:pPr>${o.st?`<w:pStyle w:val="${o.st}"/>`:''}${o.tabs?`<w:tabs>${o.tabs}</w:tabs>`:''}${o.bdr?`<w:pBdr>${o.bdr}</w:pBdr>`:''}<w:spacing w:before="${o.bf||0}" w:after="${o.af==null?0:o.af}" w:line="${o.ln||259}" w:lineRule="auto"/>${o.jc?`<w:jc w:val="${o.jc}"/>`:''}</w:pPr>${runs}</w:p>`};
  const hdr=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
    <w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="2400"/><w:gridCol w:w="4838"/><w:gridCol w:w="2400"/></w:tblGrid>
    <w:tr><w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${par(img(LG.esq,14),{af:60})}</w:tc>
    <w:tc><w:tcPr><w:tcW w:w="4838" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${par(run(LG.escola,{sz:20}),{jc:'center'})}${par(run('Ano Letivo '+D.ano,{sz:20}),{jc:'center'})}</w:tc>
    <w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${par(LG.dir.map(o=>img(o,10)).join(run('  ')),{jc:'right',af:60})}</w:tc></w:tr></w:tbl>${par('')}</w:hdr>`;
  const ftr=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${par('',{bdr:'<w:top w:val="single" w:sz="6" w:space="1" w:color="000000"/>'})}</w:ftr>`;
  const box=`<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="9638"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="9638" w:type="dxa"/></w:tcPr>${D.tit.map(t=>par(run(t,{b:true,sz:24}),{jc:'center',af:80,bf:40})).join('')}</w:tc></w:tr></w:tbl>`;
  let body=box+par(run(D.port,{sz:16}),{jc:'center',bf:200,af:40})+par('',{bdr:'<w:bottom w:val="dotted" w:sz="8" w:space="1" w:color="000000"/>',af:360});
  if(!D.det){const tabs='<w:tab w:val="left" w:pos="850"/><w:tab w:val="left" w:pos="1701"/><w:tab w:val="right" w:leader="dot" w:pos="9600"/>';
    body+=par(run('N.º\tBI/CC\tNOME',{b:false})+run('\t',{})+run('NOTA'),{tabs:'<w:tab w:val="left" w:pos="850"/><w:tab w:val="left" w:pos="1701"/><w:tab w:val="right" w:pos="9600"/>',bdr:'<w:top w:val="single" w:sz="6" w:space="2" w:color="000000"/><w:left w:val="single" w:sz="6" w:space="4" w:color="000000"/><w:bottom w:val="single" w:sz="6" w:space="2" w:color="000000"/><w:right w:val="single" w:sz="6" w:space="4" w:color="000000"/>',af:200});
    D.linhas.forEach((l,k)=>{body+=par(run(l.num+'\t'+l.cc+'\t'+l.nome+'\t'+l.nota),{tabs,af:160,bdr:k===D.linhas.length-1?'<w:bottom w:val="single" w:sz="6" w:space="2" w:color="000000"/>':''})})}
  else{const W=D.cab.length===4?[800,800,3138,1300,1300,1100,1200]:[800,800,2838,1000,1000,1000,1000,1200];const H=['N.º','BI/CC','NOME',...D.cab];const tot=W.reduce((s,v)=>s+v,0);
    const cell=(t,w,o)=>`<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${par(run(t,{b:o&&o.b,sz:o&&o.sz||20}),{jc:o&&o.jc||'center'})}</w:tc>`;
    body+=`<w:tbl><w:tblPr><w:tblW w:w="${tot}" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>${W.map(w=>`<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>
      <w:tr><w:trPr><w:tblHeader/></w:trPr>${H.map((h,i)=>cell(h,W[i],{b:true})).join('')}</w:tr>${D.linhas.map(l=>`<w:tr>${[l.num,l.cc,l.nome,...l.det].map((v,i)=>cell(v,W[i],{jc:i===2?'left':'center',sz:i<3?20:18})).join('')}</w:tr>`).join('')}</w:tbl>`;
    D.notas.forEach((n,k)=>{body+=par(run(n.t,{i:n.i,sz:18})+(n.b?run(n.b,{b:true,sz:18})+run(n.t2||'',{sz:18}):''),{jc:'both',bf:k?60:300,af:60})})}
  body+=par('',{af:0})+par(run((D.local?D.local+', ':'')+D.data),{jc:'center',bf:600,af:400})+par(run(D.assin),{jc:'center',af:600})+par(run('_______________________________'),{jc:'center'});
  const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}<w:sectPr><w:headerReference w:type="default" r:id="rIdH"/><w:footerReference w:type="default" r:id="rIdF"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1701" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const sty=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="pt-PT"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="259" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>`;
  const enc=new TextEncoder();
  const F=[{nome:'[Content_Types].xml',dados:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`)},
    {nome:'_rels/.rels',dados:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`)},
    {nome:'docProps/core.xml',dados:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xE(D.nome)}</dc:title><dc:creator>EduSpruce</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0,19)}Z</dcterms:created></cp:coreProperties>`)},
    {nome:'word/document.xml',dados:enc.encode(doc)},{nome:'word/styles.xml',dados:enc.encode(sty)},{nome:'word/header1.xml',dados:enc.encode(hdr)},{nome:'word/footer1.xml',dados:enc.encode(ftr)},
    {nome:'word/_rels/document.xml.rels',dados:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdS" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdH" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rIdF" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>`)},
    {nome:'word/_rels/header1.xml.rels',dados:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${imgs.map((m,i)=>`<Relationship Id="${m.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${i+1}.png"/>`).join('')}</Relationships>`)},
    ...imgs.map((m,i)=>({nome:'word/media/image'+(i+1)+'.png',dados:m.o.png}))];
  download(D.nome+'.docx',zipCriar(F),'application/vnd.openxmlformats-officedocument.wordprocessingml.document');try{audit('Coord. PROFIJ','Pauta exportada (Word)',D.nome)}catch(_){}toast('Word exportado: '+D.nome,'ok')}
/* ---- PDF com a mesma composição ---- */
async function ptPdf(cl,tipo){const D=ptDoc(cl,tipo);const LG=await ptLogos();ocupado&&ocupado('A criar o PDF…');
  try{const pdf=new DocPDF(false);const M=57,LW=pdf.W-2*M;const jp=async o=>o?pdf.addImg(await jpegDe(o.src,500)):null;const lE=await jp(LG.esq);const lD=[];for(const o of LG.dir)lD.push({nm:await jp(o),o});
    const cen=(y,s,sz,o)=>pdf.txt(pdf.W/2-pdfW(s,sz,o&&o.b)/2,y,s,sz,o);
    const cab=()=>{let y=30;if(lE){const h=40,w=Math.min(110,h*LG.esq.w/LG.esq.h);pdf.img(lE,M,y,w,h)}let xr=pdf.W-M;lD.slice().reverse().forEach(d=>{if(!d.nm)return;const h=30,w=Math.min(80,h*d.o.w/d.o.h);xr-=w;pdf.img(d.nm,xr,y+5,w,h);xr-=8});
      cen(y+18,LG.escola,9.5);cen(y+30,'Ano Letivo '+D.ano,9.5);pdf.linha(M,y+46,pdf.W-M,y+46,'#000000',.6);
      pdf.linha(M,pdf.H-46,pdf.W-M,pdf.H-46,'#000000',.6)};
    cab();let y=96;const bh=D.tit.length*19+14;pdf.rect(M,y,LW,bh,null,'#000000',.9);D.tit.forEach((t,i)=>cen(y+22+i*19,t,10.5,{b:true}));y+=bh+22;
    cen(y,D.port,7.5);y+=12;for(let x=M;x<pdf.W-M;x+=3.2)pdf.linha(x,y,x+1.2,y,'#000000',.6);y+=34;
    if(!D.det){const c1=M+4,c2=M+46,c3=M+92,cR=pdf.W-M-4;pdf.rect(M,y-12,LW,18,null,'#000000',.6);pdf.txt(c1,y,'N.º',9.5);pdf.txt(c2,y,'BI/CC',9.5);pdf.txt(c3,y,'NOME',9.5);pdf.txt(cR-pdfW('NOTA',9.5),y,'NOTA',9.5);y+=24;
      D.linhas.forEach((l,k)=>{pdf.txt(c1,y,l.num,9.5);pdf.txt(c2,y,l.cc,9.5);pdf.txt(c3,y,l.nome,9.5);const xa=c3+pdfW(l.nome,9.5)+4,xb=cR-pdfW(l.nota||'',9.5)-4;for(let x=xa;x<xb-1;x+=3)pdf.txt(x,y,'.',9.5);if(l.nota)pdf.txt(cR-pdfW(l.nota,9.5),y,l.nota,9.5);y+=21});
      pdf.linha(M,y-12,pdf.W-M,y-12,'#000000',.6);y+=20}
    else{const W0=D.cab.length===4?[.08,.08,.32,.13,.13,.11,.15]:[.08,.08,.29,.1,.1,.1,.1,.15];const W=W0.map(w=>w*LW);const H=['N.º','BI/CC','NOME',...D.cab];
      const fila=(cells,b,sz)=>{const lines=cells.map((c,i)=>i===2?pdfWrap(String(c),W[i]-6,sz,b):[String(c)]);const n=Math.max(...lines.map(x=>x.length));const h=n*(sz+2.5)+8;let x=M;
        cells.forEach((c,i)=>{lines[i].forEach((l,k)=>{const tx=i===2&&!b?x+3:x+W[i]/2-pdfW(l,sz,b)/2;pdf.txt(tx,y+sz+3+k*(sz+2.5),l,sz,{b})});x+=W[i]});y+=h;pdf.linha(M,y,M+LW,y,'#000000',.5)};
      pdf.linha(M,y,M+LW,y,'#000000',.7);fila(H,true,8.5);D.linhas.forEach(l=>fila([l.num,l.cc,l.nome,...l.det],false,8.5));y+=24;
      D.notas.forEach(n=>{const full=n.t+(n.b||'')+(n.t2||'');pdfWrap(full,LW,8.2).forEach(line=>{let x=M;const k=n.b?line.indexOf(n.b):-1;const parts=k>=0?[[line.slice(0,k),0],[n.b,1],[line.slice(k+n.b.length),0]]:[[line,0]];parts.forEach(([t,b])=>{if(!t)return;pdf.txt(x,y,t,8.2,{b:!!b,i:n.i});x+=pdfW(t,8.2,!!b)});y+=11});y+=6})}
    y=Math.max(y+30,y);cen(y,(D.local?D.local+', ':'')+D.data,9.5);y+=40;cen(y,D.assin,9.5);y+=44;cen(y,'_______________________________',9.5);
    const bytes=pdf.bytes();download(D.nome+'.pdf',bytes,'application/pdf');try{audit('Coord. PROFIJ','Pauta exportada (PDF)',D.nome)}catch(_){}toast('PDF exportado: '+D.nome,'ok')}
  catch(e){console.error(e);alert('Não foi possível criar o PDF: '+e.message)}finally{livre&&livre()}}
/* ---- importar o histórico (Excel da escola) ---- */
async function ptXlsxFolhas(file){const z=await unzip(await file.arrayBuffer());const wb=xmlDoc(await z.text('xl/workbook.xml')||'<x/>');const rels=await relsDe(z,'xl/workbook.xml');let sst=[];const ss=await z.text('xl/sharedStrings.xml');if(ss)sst=tagsNS(xmlDoc(ss),'si').map(si=>tagsNS(si,'t').map(t=>t.textContent).join(''));
  const out=[];for(const sh of tagsNS(wb,'sheet')){const rid=sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh.getAttribute('r:id');const rel=rels[rid];if(!rel)continue;const sx=await z.text(rel.target);if(!sx)continue;const C=new Map(),Fm=new Map();
    tagsNS(xmlDoc(sx),'c').forEach(c=>{const ref=c.getAttribute('r');const m=ref&&ref.match(/^([A-Z]+)(\d+)$/);if(!m)return;const t=c.getAttribute('t');let v='';const fe=tagsNS(c,'f')[0];if(fe)Fm.set(ref,fe.textContent);if(t==='inlineStr')v=tagsNS(c,'t').map(x=>x.textContent).join('');else{const ve=tagsNS(c,'v')[0];v=ve?ve.textContent:'';if(t==='s')v=sst[+v]||''}C.set(ref,String(v))});
    out.push({nome:sh.getAttribute('name'),C,Fm})}return out}
const ptColN=s=>{let n=0;for(const ch of s)n=n*26+ch.charCodeAt(0)-64;return n};const ptColL=n=>{let s='';while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
const PT_FC=/matem|psicolog|sociolog|f[ií]sica|qu[ií]mica|ci[eê]ncias|biolog|geograf|econom|franc[eê]s|^ingl[eê]s$/i;
async function ptImportar(cl,file){const S_=await ptXlsxFolhas(file);const H=ptHist();const ach=n=>cl.formandos.find(al=>normT(al.nome)===normT(n))||cl.formandos.find(al=>normT(n).split(' ')[0]===normT(al.nome).split(' ')[0]&&normT(n).split(' ').pop()===normT(al.nome).split(' ').pop());let n=0;const P=ptCfg(cl);
  const cfc=S_.find(s=>/^cfc$/i.test(s.nome));
  if(cfc&&S_.some(s=>/ano/i.test(s.nome))){/* «Média detalhada»: folhas 1.º/2.º/3.º ANO com FSC·FC·FT·FP por aluno */
    S_.filter(s=>/^\d\s*[º.]?\s*ano/i.test(s.nome)).forEach(sh=>{const ano=+sh.nome.match(/\d/)[0];const G=[];sh.C.forEach((v,ref)=>{const m=ref.match(/^([A-Z]+)(\d+)$/);if(m&&normT(v)==='fsc')G.push({c:ptColN(m[1]),r:+m[2]})});
      G.forEach(g=>{let nm=sh.C.get(ptColL(g.c)+(g.r-1))||'';const f=sh.Fm.get(ptColL(g.c)+(g.r-1));if(f){const m=f.match(/CFC!([A-Z]+)(\d+)/i);if(m)nm=cfc.C.get(m[1]+m[2])||''}if(!nm)return;const al=ach(nm);if(!al)return;
        let rMed=null;sh.C.forEach((v,ref)=>{const m=ref.match(/^([A-Z]+)(\d+)$/);if(m&&normT(v)==='media'&&+m[2]>g.r)rMed=rMed==null?+m[2]:Math.min(rMed,+m[2])});if(rMed==null)return;
        const med=k=>{const V=[];for(let r=g.r+1;r<rMed;r++){const v=ptNum(sh.C.get(ptColL(g.c+k)+r));if(v!=null)V.push(v)}return V.length?ptR(V.reduce((s,x)=>s+x,0)/V.length,1):null};
        const o=H[al.k]=H[al.k]||{};o['a'+ano]={fsc:med(0),fc:med(1),ft:med(2),fp:med(3)};n++})})}
  else{/* «Histórico de classificações»: uma folha por aluno, colunas «Aval» por ano */
    S_.forEach(sh=>{let nm='';sh.C.forEach(v=>{const m=String(v).match(/hist[oó]rico de classifica[cç][oõ]es do aluno\s+(.+)/i);if(m)nm=m[1].trim()});if(!nm)return;const al=ach(nm);if(!al)return;
      const anos=[];sh.C.forEach((v,ref)=>{const m=ref.match(/^([A-Z]+)(\d+)$/);const a=String(v).match(/(\d)\.?\s*º\s*ano/i);if(m&&a)anos.push({c:ptColN(m[1]),r:+m[2],n:+a[1]})});anos.sort((x,y)=>x.c-y.c);if(!anos.length)return;
      const rH=anos[0].r;const aval={};sh.C.forEach((v,ref)=>{const m=ref.match(/^([A-Z]+)(\d+)$/);if(m&&+m[2]===rH+1&&/^aval/i.test(v))aval[ptColN(m[1])]=1});
      const colAno=anos.map((a,i)=>{const fim=i<anos.length-1?anos[i+1].c-1:a.c+12;const av=Object.keys(aval).map(Number).filter(c=>c>=a.c&&c<=fim);return {n:a.n,c0:a.c,c1:fim,av:av[0]}});
      const R={};sh.C.forEach((v,ref)=>{const m=ref.match(/^([A-Z]+)(\d+)$/);if(m&&m[1]==='B'&&+m[2]>rH+1)R[+m[2]]=v});const comp={};
      Object.entries(R).forEach(([r,disc])=>{if(/^total|^cif|acronimo/i.test(disc))return;const ufcd=/^\d{3,5}\s*-|unidades de forma/i.test(disc);const k=ufcd?'ft':PT_FC.test(disc.replace(/^l[ií]ngua estrangeira\s*-\s*/i,'LE '))?'fc':'fsc';
        colAno.forEach(ca=>{let v=null;if(ca.av)v=ptNum(sh.C.get(ptColL(ca.av)+r));if(v==null){for(let c=ca.c1;c>=ca.c0&&v==null;c--){const x=sh.Fm.get(ptColL(c)+r)?null:ptNum(sh.C.get(ptColL(c)+r));if(x!=null)v=x}}if(v==null)return;((comp[ca.n]=comp[ca.n]||{})[k]=comp[ca.n][k]||[]).push(v)})});
      const o=H[al.k]=H[al.k]||{};Object.entries(comp).forEach(([ano,c])=>{const m=k=>c[k]&&c[k].length?ptR(c[k].reduce((s,x)=>s+x,0)/c[k].length,1):null;o['a'+ano]=Object.assign(o['a'+ano]||{},{fsc:m('fsc'),fc:m('fc'),ft:m('ft')})});n++})}
  save();return n}
/* ---- ecrã ---- */
function ptAbrir(clNome,opt){opt=opt||{};const modo=opt.modo||'';const a=A();const C=cpClasses(a);if(!C.length){if(opt.alvo){opt.alvo.innerHTML=`<p class="mut">Não há turmas PROFIJ neste ano letivo.</p>`;return}return toast('Não há turmas PROFIJ neste ano letivo.','erro')}let cl=C.find(c=>c.nome===(clNome||UI.ptCl))||C[0];UI.ptCl=cl.nome;UI.ptTab=UI.ptTab||'fpct';
  const el=document.createElement('div');el.className='ptw';
  const pinta=()=>{cl=cpClasses(A()).find(c=>c.nome===UI.ptCl)||C[0];const P=ptCfg(cl);const L=ptLinhas(cl);const f=modo?modo==='fpct':UI.ptTab==='fpct';const fN=(v,d)=>v==null?'—':ptN(v,d);
    if(modo==='docs')return ptDocsPinta(el,cl,C,P,L,pinta);el.classList.toggle('pt-in',!!modo);
    el.innerHTML=`<div class="ptbar"><select id="pt-cl" aria-label="Turma">${C.map(c=>`<option ${c.nome===cl.nome?'selected':''}>${esc(c.nome)}</option>`).join('')}</select>
      ${modo?`<b class="pt-tt">${f?'Avaliação da FPCT':'Classificação Final de Curso'}</b>${f?`<label class="btn sm pri">${ic('upload',13)} Importar Grelha de Avaliação (Excel)<input type="file" id="pt-grl" accept=".xlsx,.xlsm" hidden></label>`:''}`:`<div class="seg"><button type="button" data-ptt="fpct" class="${f?'on':''}">FPCT</button><button type="button" data-ptt="cfc" class="${f?'':'on'}">Classificação Final de Curso</button></div>`}<span class="sp1"></span>
      <div class="ptexp" ${modo?'hidden':''}><b>${f?'FPCT':'CFC'}</b><button type="button" class="btn sm" data-ptx="${f?'fpctF':'cfcF'}|w">${ic('file',13)} Pauta Final · Word</button><button type="button" class="btn sm" data-ptx="${f?'fpctF':'cfcF'}|p">PDF</button><button type="button" class="btn sm pri" data-ptx="${f?'fpctD':'cfcD'}|w">${ic('file',13)} Pauta Detalhada · Word</button><button type="button" class="btn sm" data-ptx="${f?'fpctD':'cfcD'}|p">PDF</button></div></div>
    <details class="ptcfg" ${modo?'hidden':''}><summary>${ic('sliders',14)} Cabeçalho e assinatura</summary><div class="ptg">
      <label>Entidade<input data-ptc="sec" value="${esc(P.sec)}"></label><label>Ano letivo<input data-ptc="ano" value="${esc(P.ano)}"></label>
      <label>Curso (FPCT)<input data-ptc="curso" value="${esc(P.curso)}"></label><label>Curso (Classificação Final)<input data-ptc="cursoCF" value="${esc(P.cursoCF)}"></label>
      <label class="w2">Legislação<input data-ptc="port" value="${esc(P.port)}"></label><label>Localidade<input data-ptc="local" value="${esc(P.local)}" placeholder="ex.: Calheta"></label><label>Data<input type="date" data-ptc="data" value="${esc(P.data)}"></label>
      <label>Assinatura<input data-ptc="assin" value="${esc(P.assin)}"></label><label>Ano do curso desta turma<select data-ptc="anoC">${[1,2,3].map(n=>`<option value="${n}" ${+P.anoC===n?'selected':''}>${n}.º ano</option>`).join('')}</select></label>
      <div class="w2 ptlg"><span>Logótipos do cabeçalho: o da escola (Definições) à esquerda${(CP().c.ptLogos||[]).length?' e '+(CP().c.ptLogos.length)+' imagem(ns) do seu modelo à direita':''}.</span><label class="btn sm">${ic('upload',13)} Usar os logótipos do meu modelo Word<input type="file" id="pt-mod" accept=".docx" hidden></label>${(CP().c.ptLogos||[]).length?'<button type="button" class="btn sm" id="pt-modx">Retirar</button>':''}</div></div></details>
    ${f?`<p class="hint">Relatório = soma dos critérios ÷ 10 · Nota = Relatório × ${P.pRel} % + Avaliação da Entidade × ${100-P.pRel} % · Nota final arredondada às unidades (como na grelha FPCT). A nota final passa para o Coord. PROFIJ.</p>
      <div class="tblw"><table class="lst pttb"><thead><tr><th>N.º</th><th>BI/CC</th><th style="text-align:left">Nome</th>${P.crit.map((c,i)=>`<th title="${esc(c.n)}">C${i+1}<small>${esc(c.n.split(' ')[0])}<br>/${c.m}</small></th>`).join('')}<th>Relatório<small>/20</small></th><th>Aval. Ent.<small>/20</small></th><th>Nota</th><th>Final</th></tr></thead><tbody>
      ${L.map(x=>`<tr data-k="${esc(x.al.k)}"><td>${esc(x.proc)}</td><td><input class="ptin sm" data-pf="cc" value="${esc(x.cc)}" placeholder="…000" aria-label="BI/CC"></td><td style="text-align:left"><b>${esc(x.nome)}</b></td>${P.crit.map((c,i)=>`<td><input class="ptin" data-pr="${i}" value="${esc(x.d.rel&&x.d.rel[i]!=null?String(x.d.rel[i]).replace('.',','):'')}" inputmode="decimal" aria-label="${esc(c.n)}"></td>`).join('')}
        <td class="calc">${fN(x.relC)}</td><td><input class="ptin" data-pf="ent" value="${esc(x.d.ent!=null?String(x.d.ent).replace('.',','):'')}" inputmode="decimal" aria-label="Avaliação da entidade"></td><td class="calc">${fN(x.nota,2)}</td><td class="calc"><b class="${x.fin!=null&&x.fin<10?'neg':''}">${x.fin==null?'—':x.fin}</b></td></tr>`).join('')}</tbody></table></div>`
    :`<p class="hint">CFA = (FSC + FC + 2 × FT + FP) ÷ 5, às décimas · CFC = (CFA1 + CFA2 + CFA3 + CPAF) ÷ 4, às unidades (como na média detalhada). O ${P.anoC}.º ano vem da app (componentes e FPCT); os outros anos importam-se do Excel da escola ou escrevem-se.</p>
      <div class="row" style="gap:8px;margin-bottom:8px"><label class="btn sm">${ic('upload',13)} Importar Excel (histórico ou média detalhada)<input type="file" id="pt-imp" accept=".xlsx,.xlsm" hidden></label></div>
      <div class="tblw"><table class="lst pttb ptcf"><thead><tr><th rowspan="2">N.º</th><th rowspan="2" style="text-align:left">Nome</th>${[1,2,3].map(n=>`<th colspan="5" class="${n===P.anoC?'atual':''}">${n}.º ano${n===P.anoC?' · app':''}</th>`).join('')}<th rowspan="2">CPAF</th><th rowspan="2">CFC</th></tr>
        <tr>${[1,2,3].map(()=>['FSC','FC','FT','FP','CFA'].map(h=>`<th>${h}</th>`).join('')).join('')}</tr></thead><tbody>
      ${L.map(x=>`<tr data-k="${esc(x.al.k)}"><td>${esc(x.proc)}</td><td style="text-align:left"><b>${esc(x.nome)}</b></td>${[1,2,3].map(n=>['fsc','fc','ft','fp'].map(k=>{const ov=x.h['a'+n]&&x.h['a'+n][k]!=null&&x.h['a'+n][k]!=='';return `<td><input class="ptin ${ov?'man':''}" data-ph="${n}|${k}" value="${esc(ptN(x.cfa[n][k]))}" inputmode="decimal" placeholder="—" aria-label="${n}.º ano ${k.toUpperCase()}"></td>`}).join('')+`<td class="calc"><b>${fN(x.cfa[n].cfa)}</b></td>`).join('')}
        <td><input class="ptin" data-pcp value="${esc(x.cpaf!=null?ptN(x.cpaf):'')}" inputmode="decimal" aria-label="CPAF"></td><td class="calc"><b class="${x.cfc!=null&&x.cfc<10?'neg':''}">${x.cfc==null?'—':x.cfc}</b></td></tr>`).join('')}</tbody></table></div>`}`;
    el.querySelector('#pt-cl').onchange=e=>{UI.ptCl=e.target.value;pinta()};el.querySelectorAll('[data-ptt]').forEach(b=>b.onclick=()=>{UI.ptTab=b.dataset.ptt;pinta()});
    el.querySelectorAll('[data-ptc]').forEach(i=>i.onchange=()=>{P[i.dataset.ptc]=i.dataset.ptc==='anoC'?+i.value:i.value;save();if(i.dataset.ptc==='anoC')pinta()});
    el.querySelectorAll('[data-ptx]').forEach(b=>b.onclick=()=>{const [t,f_]=b.dataset.ptx.split('|');(f_==='w'?ptDocx:ptPdf)(cl,t).catch(e=>alert(e.message))});
    const md=el.querySelector('#pt-mod');if(md)md.onchange=async()=>{try{CP().c.ptLogos=await ptModeloLogos(md.files[0]);save();toast('Logótipos do modelo guardados','ok');pinta()}catch(e){toast(e.message,'erro')}};
    const mx=el.querySelector('#pt-modx');if(mx)mx.onclick=()=>{CP().c.ptLogos=[];save();pinta()};
    const gr=el.querySelector('#pt-grl');if(gr)gr.onchange=async()=>{try{const n=await ptImportarGrelha(cl,gr.files[0]);toast(n?'Grelha da FPCT importada: '+n+' formando(s)':'Não encontrei estes formandos na grelha.',n?'ok':'erro');pinta()}catch(e){toast(e.message,'erro')}};
    const im=el.querySelector('#pt-imp');if(im)im.onchange=async()=>{try{const n=await ptImportar(cl,im.files[0]);toast(n?n+' formando(s) atualizados a partir do Excel':'Não encontrei estes formandos no Excel.',n?'ok':'erro');pinta()}catch(e){toast(e.message,'erro')}};
    const row=i=>{const k=i.closest('tr').dataset.k;return cl.formandos.find(al=>al.k===k)};
    el.querySelectorAll('[data-pr]').forEach(i=>i.onchange=()=>{const al=row(i);const f_=ptFp(cl,al);f_.det=f_.det||{};f_.det.rel=f_.det.rel||[];const v=ptNum(i.value);const mx=P.crit[+i.dataset.pr].m;f_.det.rel[+i.dataset.pr]=v==null?null:Math.min(mx,Math.max(0,v));ptGravarNota(cl,al);save();pinta()});
    el.querySelectorAll('[data-pf]').forEach(i=>i.onchange=()=>{const al=row(i);const f_=ptFp(cl,al);f_.det=f_.det||{};const k=i.dataset.pf;f_.det[k]=k==='cc'?i.value.trim():(ptNum(i.value)==null?null:Math.min(20,Math.max(0,ptNum(i.value))));ptGravarNota(cl,al);save();pinta()});
    el.querySelectorAll('[data-ph]').forEach(i=>i.onchange=()=>{const al=row(i);const [n,k]=i.dataset.ph.split('|');const H=ptHist();const o=H[al.k]=H[al.k]||{};const y_=o['a'+n]=o['a'+n]||{};const v=ptNum(i.value);if(v==null)delete y_[k];else y_[k]=Math.min(20,Math.max(0,v));save();pinta()});
    el.querySelectorAll('[data-pcp]').forEach(i=>i.onchange=()=>{const al=row(i);const H=ptHist();const o=H[al.k]=H[al.k]||{};const v=ptNum(i.value);o.cpaf=v==null?'':Math.min(20,Math.max(0,v));save();pinta()})};
  if(opt.alvo){opt.alvo.innerHTML='';opt.alvo.appendChild(el);pinta();return}
  pinta();ecraAmplo({titulo:'Pautas Oficiais PROFIJ',sub:'Documentos finais · Word e PDF',el,aoFechar:()=>{try{if(VIEW==='cprofij')vCProfij()}catch(_){}}})}
function ptGravarNota(cl,al){const x=ptLinhas(cl).find(z=>z.al.k===al.k);if(!x)return;const f=ptFp(cl,al);if(x.nota!=null)f.nota=x.fin;}
{const _vCP=vCProfij;vCProfij=function(){const r=_vCP.apply(this,arguments);try{const bx=$('#barx');if(bx&&!$('#b-ptof')&&cpOn()){bx.insertAdjacentHTML('afterbegin',`<button class="btn pri" id="b-ptof">${ic('file',15)} Pautas Oficiais</button>`);$('#b-ptof').onclick=()=>ptAbrir(null,{modo:'docs'})}}catch(e){console.warn(e)}return r};if(go._f)go._f.cprofij=vCProfij}
/* v0.923 · Ajuda com capturas do tema em uso (mudam quando muda o tema) */
const AJ_VISTA={comecar:'inicio',turmas:'alunos',msai:'msai',horarios:'horario',naoletivos:'meuhorario',calendario:'calendario',previstas:'sumarios',reunioes:'reunioes',reunimp:'reunioes',testes:'testes',avaliacao:'avaliacao',inicio:'inicio',inicio2:'inicio',aparencia:'aparencia',
  sessao:'conta',seguranca:'conta',contasg:'conta',direcao:'direcao',documentos:'documentos',recursos:'recursos',planta:'planta',sumarios:'sumarios',auditoria:'auditoria',tarefas:'tarefas',avisos:'tarefas',horedit:'meuhorario',arrastar:'meuhorario',oral:'oral',jornal:'jornal',cprofij:'cprofij',mra:'instrumentos',
  professor:'prof',gsync:'sync',nuvem:'sync',nuvem2:'sync',gentrar:'sync',problemas:'sync',multidisc:'alunos',arvore:'inicio',importados:'documentos'};
const AJ_TEMAS={sge:'SGE',institucional:'Institucional',ios27:'iOS',coral:'Coral',social:'Social',gradiente:'Gradiente',academico:'Académico'};
{const _vAj=vAjuda;vAjuda=function(){const r=_vAj.apply(this,arguments);try{const t=AJ_TEMAS[S.cfg.estilo]?S.cfg.estilo:'sge';
  $$('#view .ajs').forEach(c=>{const id=c.id.replace(/^aj-/,'');const v=AJ_VISTA[id];if(!v||c.querySelector('.ajcap'))return;const g=c.querySelector('.ajg');if(!g)return;const old=g.querySelector('.ajf');if(old)old.remove();g.classList.remove('sem');
    g.insertAdjacentHTML('beforeend',`<figure class="ajf ajcap"><img src="ajuda/${t}/${v}.webp" alt="Ecrã: ${esc(c.querySelector('h2').textContent.trim())} (tema ${AJ_TEMAS[t]})" loading="lazy"><figcaption>Ecrã no tema <b>${AJ_TEMAS[t]}</b> — muda quando muda o tema</figcaption></figure>`);
    const im=g.querySelector('.ajcap img');im.onerror=()=>{const f=im.closest('figure');if(f)f.remove();g.classList.add('sem')};im.onclick=()=>{const w=document.createElement('div');w.className='ajzoom';w.innerHTML=`<img src="${im.src}" alt="${esc(im.alt)}">`;w.onclick=()=>w.remove();document.body.appendChild(w)}});
  const h=$('#view .ajhd p');if(h&&!h.dataset.t){h.dataset.t=1;h.innerHTML='Tudo o que a app faz, passo a passo, com animações e capturas do ecrã no tema que está a usar (<b>'+AJ_TEMAS[t]+'</b>).'}}catch(e){console.warn(e)}return r};if(go._f)go._f.ajuda=vAjuda}

/* 0.925 · realce da barra lateral controlado pelo rato real; a vista atual fica marcada em #view para estilos próprios */
{const lim=()=>document.querySelectorAll('#side .hov').forEach(x=>x.classList.remove('hov'));
  document.addEventListener('pointerover',e=>{const n=e.target&&e.target.closest?e.target.closest('#side .nav,#side [data-v]'):null;document.querySelectorAll('#side .hov').forEach(x=>{if(x!==n)x.classList.remove('hov')});if(n&&e.pointerType==='mouse')n.classList.add('hov')},true);
  document.addEventListener('pointerout',e=>{const n=e.target&&e.target.closest?e.target.closest('#side .hov'):null;if(n&&!(e.relatedTarget&&n.contains(e.relatedTarget)))n.classList.remove('hov')},true);
  document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')lim()},true);addEventListener('blur',lim);
  const _g=go;go=function(){const r=_g.apply(this,arguments);try{lim();const v=document.getElementById('view');if(v)v.dataset.vista=VIEW}catch(_){}return r}}

/* 0.927 · SpruceNote: quando há espaço, a barra mostra todos os elementos; o «•••» só aparece com o que não cabe */
function mqAjustarBarra(){const bar=document.querySelector('.mq-bar');if(!bar)return;const X=[...bar.querySelectorAll('.mq-x')];const mais=bar.querySelector('#mq-more');
  X.forEach(x=>x.hidden=false);if(mais)mais.hidden=true;const cabe=()=>bar.scrollHeight<=bar.clientHeight+1;
  if(cabe())return;if(mais)mais.hidden=false;for(let i=X.length-1;i>=0&&!cabe();i--)X[i].hidden=true}
{const _mb=mqBind;mqBind=function(){const r=_mb.apply(this,arguments);try{requestAnimationFrame(mqAjustarBarra)}catch(_){}return r}}
addEventListener('resize',()=>{clearTimeout(mqAjustarBarra._t);mqAjustarBarra._t=setTimeout(mqAjustarBarra,120)});

/* 0.928 · Verificar os Cálculos: mostra cada teste — o que se espera, o que a app calculou e se está certo */
function calcMostrar(){const L=[];window.__regT=(n,v,e)=>L.push({n:String(n),v,e,ok:v===e||(typeof v==='number'&&typeof e==='number'&&Math.abs(v-e)<1e-6)||(Math.abs((v==null?NaN:+v)-e)<1e-6)});
  let r;try{r=autoTestes()}finally{window.__regT=null}
  const fv=x=>x==null?'—':x===true?'sim':x===false?'não':typeof x==='number'?(Number.isInteger(x)?String(x):String(+x.toFixed(4)).replace('.',',')):String(x);
  const nf=L.filter(x=>!x.ok).length;const box=$('#calcres');if(!box)return;
  box.innerHTML=`<div class="clres ${nf?'mal':'bem'}"><b>${ic(nf?'alert':'check',16)} ${L.length-nf} de ${L.length} testes certos</b><span class="mut">${new Date().toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span><span class="sp1"></span><label class="chk"><input type="checkbox" id="cl-so"> Só os errados</label></div>
   <div class="tblw"><table class="lst cltb"><thead><tr><th style="width:36px"></th><th>Teste</th><th class="num">Esperado</th><th class="num">Obtido</th></tr></thead><tbody>${L.map((x,i)=>`<tr class="${x.ok?'':'mal'}"><td>${x.ok?`<span class="clok">${ic('check',14)}</span>`:`<span class="clko">${ic('x',14)}</span>`}</td><td>${esc(x.n)}</td><td class="num">${esc(fv(x.e))}</td><td class="num">${esc(fv(x.v))}</td></tr>`).join('')}</tbody></table></div>`;
  const so=$('#cl-so');if(so)so.onchange=()=>box.querySelectorAll('.cltb tbody tr:not(.mal)').forEach(t=>t.style.display=so.checked?'none':'')}

/* 0.932 · marca os campos de data/hora vazios (para ficarem todos em cinzento, sem misturar cores) */
{const mv=el=>{if(el.value)el.removeAttribute('data-vazio');else el.setAttribute('data-vazio','')};const sel='input[type=date],input[type=time]';
  const todos=r=>{try{(r||document).querySelectorAll(sel).forEach(mv)}catch(_){}};
  ['input','change'].forEach(t=>document.addEventListener(t,e=>{if(e.target&&e.target.matches&&e.target.matches(sel))mv(e.target)},true));
  let _t=0;new MutationObserver(()=>{cancelAnimationFrame(_t);_t=requestAnimationFrame(()=>todos())}).observe(document.body,{childList:true,subtree:true});setTimeout(todos,300)}

/* 0.932 · contador a 0 não aparece */
{const z=()=>document.querySelectorAll('#side .nbadge').forEach(b=>{const t=(b.textContent||'').trim();b.classList.toggle('zero',!t||t==='0')});let _z=0;new MutationObserver(()=>{cancelAnimationFrame(_z);_z=requestAnimationFrame(z)}).observe(document.body,{childList:true,subtree:true,characterData:true});setTimeout(z,500)}

