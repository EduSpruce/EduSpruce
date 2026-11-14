/* ===================== v1.011 · Ajuda atualizada (todos os módulos novos) ===================== */
try{const AJ=(id,ic_,t,txt)=>{const i=AJUDA.findIndex(a=>a.id===id);const o={id,ic:ic_,t,gif:null,txt};if(i>=0)AJUDA[i]=Object.assign(AJUDA[i],{t,txt});else AJUDA.push(o)};
AJ('cprofij','award','Coord. PROFIJ — Coordenação do Programa PROFIJ',`<p>Módulo do(a) <b>coordenador(a) do PROFIJ</b> (aparece ao assinalar o cargo em Definições › Professor, ou em Definições › Geral › Módulos Opcionais). Está organizado pelas fases do trabalho:</p>
<ul><li><b>0 · Legislação</b> — Portaria n.º 52/2016, Portaria n.º 86/2018 e os documentos da escola, com ligações.</li>
<li><b>1 · Criação do Curso</b> (no início): <b>Turmas e Formandos</b>; <b>Matriz Curricular</b> (Criar Curso Completo, Importar Matriz em PDF, Dados do Curso, horário da turma, disciplinas e UFCD); <b>Equipa Pedagógica e Distribuição de Serviço</b> (quem leciona o quê, contagem global de tempos por professor, coluna «Eu»); <b>Planeamento Anual</b> (calendário dia a dia por disciplina).</li>
<li><b>2 · Dia a Dia</b>: <b>Painel</b> (o que precisa de atenção); <b>Pontos de Situação</b> (aulas previstas, dadas, em falta e previsão de conclusão); <b>Horários Semanais e Cedências</b>; <b>Recuperação das Aprendizagens e da Assiduidade</b> (todas as turmas); <b>Conselho dos Cursos</b>.</li>
<li><b>3 · Avaliação e Conclusão</b>: <b>FPCT</b> (avaliação e entidades), <b>PAF</b> e <b>Classificação Final de Curso</b> (só no ano terminal), <b>PEA</b>, <b>Classificação Anual (CFA)</b> nos outros anos e <b>Pautas Oficiais</b> (só os documentos, em Word e PDF).</li></ul>
<p>Cada turma tem o <b>tipo e o ano do curso</b> (PROFIJ II · Tipo 2 = 2 anos; Tipo 3 = 1 ano; PROFIJ IV · Tipo 4 = 3 anos). O cadeado <b>«Só este ano / Todos os anos»</b> mostra só o ano em curso ou também os anteriores. A sua <b>assinatura</b> (Definições) entra em todos os documentos da coordenação.</p>`);
AJ('pfjmatriz','grid','PROFIJ · Criar o Curso e Importar a Matriz',`<ul><li><b>Criar Curso Completo</b>: escolha o tipo (Nível II Tipo 2, Tipo 3 ou Nível IV Tipo 4) e a app cria as disciplinas da Portaria n.º 52/2016 com as horas do ciclo e as deste ano (editáveis). A língua é «Língua Estrangeira I - Inglês»; a 2.ª disciplina científica tem nome livre.</li>
<li><b>UFCD</b>: escolha um <b>referencial conhecido</b> (ex.: 341026 · Operador/a de Logística) e as UFCD do ano entram sozinhas, ou cole-as do Catálogo Nacional de Qualificações (código ; nome ; horas ; professor).</li>
<li><b>Importar Matriz (PDF)</b>: lê o PDF da matriz / ponto de situação — curso, área, nível, referencial, disciplinas com horas e professores, todas as UFCD, a FPCT e as aulas dadas (cria um ponto de situação). Antes de importar mostra tudo o que leu e permite retirar o que não está no PDF. O referencial fica guardado para outras turmas do mesmo curso.</li>
<li>As disciplinas ligam-se sozinhas aos tempos do horário da turma; as UFCD ficam nos tempos «UFCD», dadas umas a seguir às outras.</li>
<li>Coluna <b>«Eu»</b> (Equipa Pedagógica): as disciplinas que leciona passam para o modo professor com «Criar as Minhas no Modo Professor».</li></ul>`);
AJ('pfjdist','flow','PROFIJ · Distribuição, Horários Semanais e Cedências',`<p>A app simula o ano tempo a tempo (45 min) com o horário da turma e o calendário escolar, e diz quando acaba cada disciplina, cada professor e a turma (comparando com o planeamento inicial).</p>
<ul><li><b>Contagem global por professor</b>: soma os tempos de todas as disciplinas e UFCD do professor; quando uma acaba, os tempos dela continuam com as outras do mesmo professor.</li>
<li><b>Ceder Tempos</b>: ex.: quando TIC acabar, os tempos de TIC passam para Inglês — já ou a partir de uma data. <b>Dar Tempos Livres</b>: os tempos de quem já acabou vão para quem está atrasado (a app diz quantos tempos por semana faltam).</li>
<li><b>Substituir Professor(a)</b> a partir de uma data; <b>data de fim marcada</b> à mão ou automática.</li>
<li><b>Horário Semanal com datas</b>: cada tempo mostra o número dessa disciplina (ex.: 31/94); toque num tempo para o mudar só nessa semana; em baixo, o que falta a cada professor.</li>
<li><b>Exportar</b>: cronogramas por professor (e CSV), horários semanais e a matriz com a distribuição de serviço e o horário original.</li></ul>`);
AJ('pfjaval','building','PROFIJ · FPCT, Classificações e Pautas Oficiais',`<ul><li><b>FPCT</b>: grelha com os critérios do relatório (Caraterização, Descrição, Análise Crítica, Autoavaliação), a avaliação da entidade e a nota (20 % relatório + 80 % entidade, editáveis). <b>Importar Grelha de Avaliação (Excel)</b> lê o ficheiro da escola (folhas Relatório e Final), com BI/CC.</li>
<li><b>Classificação Anual (CFA)</b> = (FSC + FC + 2FT + FP) / 5, às décimas. No <b>ano terminal</b> aparece a <b>Classificação Final de Curso</b>: II-2 (CFA1+CFA2+CPAF)/3 · II-3 (2CFA+CPAF)/3 · IV-4 (CFA1+CFA2+CFA3+CPAF)/4, às unidades (art. 39.º). A FPCT de cada ano entra na CFA desse ano; a dos anos anteriores vem dos anos letivos anteriores. <b>Importar Excel</b> (histórico ou média detalhada) para os anos anteriores.</li>
<li><b>PAF</b> (só no ano terminal) e <b>PEA</b>, cada uma no seu separador, com data, hora, sala, júri, formandos e classificações.</li>
<li><b>Pautas Oficiais</b>: FPCT e Classificação Final de Curso, pauta final e detalhada, em Word e PDF, com o cabeçalho da Secretaria Regional, a Portaria, a localidade, a data e a sua assinatura.</li></ul>`);
AJ('precup','refresh','PROFIJ · Planos de Recuperação (assiduidade e aprendizagens)',`<p>Nas turmas PROFIJ, o separador <b>Recuperação (PROFIJ)</b> tem o <b>Plano de Recuperação da Assiduidade</b> e o <b>Plano de Recuperação das Aprendizagens</b> (o MRA é só do ensino profissional).</p>
<ul><li>Os <b>limites de assiduidade</b> escrevem-se à mão, como aprovados pelo conselho pedagógico: um por componente (sociocultural, científica, tecnológica) para todas as turmas PROFIJ e um «só nesta turma». Sem limite, a app não sugere planos.</li>
<li>Cada plano tem início, prazo, horas a recuperar, motivo, medidas, situação (em curso, cumprido, não cumprido), resultado e impressão com assinaturas.</li>
<li>Na Coord. PROFIJ › Dia a Dia › Recuperações vê o resumo de todas as turmas.</li></ul>`);
AJ('contactos','mail','Contactos',`<p>Lista de contactos da escola ao estilo dos Contactos do Mac: listas (Todos, Diretores de Turma, departamentos e as suas listas), procura, cartão de cada contacto, importação de Excel ou vCard, exportação vCard e deteção de duplicados. A barra das listas pode <b>encolher</b> (fica só com os ícones). Arraste contactos para as listas.</p>`);
AJ('sorteio','sparkle','Sorteio de Alunos, Pares e Grupos',`<p>Escolha ao acaso um aluno, pares ou grupos, com roda ou cartas animadas, em ecrã inteiro para projetar. «Não repetir» evita sair o mesmo aluno; «Como na Chamada» deixa de fora quem faltou. Os pares e grupos ficam visíveis durante a animação e o sorteio também é usado na Produção Oral.</p>`);
AJ('oral','mic','Produção Oral (Componente Oral de Inglês)',`<p>Momentos de produção oral com grelha de registo própria. Indique se cada momento é <b>individual, a pares ou em grupo</b> (a avaliação é sempre individual). Os pares/grupos fazem-se <b>à mão, ao acaso</b> (com o Sorteio) <b>ou equilibrados</b> pelas notas anteriores de produção oral (um aluno com boa nota com outro com nota mais baixa). O <b>Guião A ou B</b> distribui-se ao acaso ou à mão; no resultado aparecem sempre A antes de B. Ao mudar de manual para aleatório/equilibrado, os pares manuais limpam-se.</p>`);
AJ('perfis','chart','Perfis de Aprendizagem e Painel da Turma',`<p>No Painel da Turma, cada aluno tem o ícone do <b>dossiê</b> e o dos <b>Perfis de Aprendizagem</b>, que abre os perfis da turma já nesse aluno (‹ › para passar aos outros): perfil por domínio, «onde estou e como avançar», evolução por período e autoavaliação.</p>`);
AJ('autoav','users','Autoavaliação pelo Telemóvel (QR code)',`<p>Os alunos fazem a autoavaliação no telemóvel, sem contas. Dois modos: <b>com código pessoal</b> (papel com o QR code de cada aluno, para o ano todo) ou <b>só com o código da turma</b> (o aluno escolhe o seu número). Abre-se no Painel da Turma ou na Avaliação Final (botão «Autoavaliação»); as respostas aparecem nos Perfis de Aprendizagem. Disponível na versão com conta (eduspruce.pt).</p>`);
AJ('arena','sparkle','Arena (jogos de perguntas)',`<p>Jogos de perguntas na aula, com vários modos (corrida, colmeia, pesca, laser e outros) e personagens próprias. Os alunos entram pelo telemóvel com um código. A Arena <b>nunca conta para a nota</b>. Disponível na versão com conta (eduspruce.pt).</p>`);
AJ('pulso','target','Pulso (verificação rápida)',`<p>Perguntas rápidas para ver o que a turma percebeu. É sempre <b>formativo</b>: só conta para a avaliação se o professor escolher um domínio. Disponível na versão com conta (eduspruce.pt).</p>`);
AJ('tabnav','grid','Tabelas: Tab de Célula em Célula',`<p>Em todas as tabelas da app (avaliação, grelhas, FPCT, classificações, matrizes): <b>Tab</b> passa à célula seguinte da linha e, no fim, à linha de baixo; <b>Shift+Tab</b> volta atrás. Salta botões e caixas de seleção e seleciona o valor para escrever por cima. Se a tabela se atualizar ao gravar, o cursor continua na célula certa.</p>`);
AJ('assinatura','pen','Assinatura nos Documentos',`<p>A assinatura guardada em Definições › Professor aparece nos documentos: relatórios, fichas e, para o coordenador PROFIJ, nas pautas oficiais (Word e PDF), cronogramas, horários semanais, matriz e distribuição de serviço e pontos de situação. O fundo branco da imagem é retirado sozinho.</p>`);
AJ('moveis','phone','Telemóvel e Tablet',`<p>Toda a app adapta-se ao telemóvel e ao tablet (vertical e horizontal): menus e separadores deslizam para o lado, tabelas largas deslizam com o nome do aluno à vista, os botões ficam maiores ao toque e os calendários crescem ou encolhem com o ecrã. No iPhone e no iPad, adicione a app ao ecrã principal para a abrir em ecrã inteiro.</p>`);
}catch(e){console.warn('ajuda',e)}

/* ===================== v0.999 · Coord. PROFIJ › Classificações e Pautas =====================
   Histórico de classificações do SGE (Excel, uma folha por formando) → médias por componente e por ano,
   CFA = (FSC + FC + 2·FT + FP) / 5 (às décimas), CFC = (CFA1 + … + CPAF) / n (às unidades),
   grelha de avaliação da FPCT (relatório + entidade acolhedora) e pautas (FPCT e CFC, detalhada e final) em Word ou PDF. */
const PZ_COMP=[['FSC','Sociocultural'],['FC','Científica'],['FT','Tecnológica'],['FP','Prática (FPCT)']];
const PZ_SOC=/^(l[ií]ngua portuguesa|l[ií]ngua estrangeira|ingl[eê]s|tecnologias da informa|tic\b|mundo atual|cidadania|desenvolvimento pessoal|educa[cç][aã]o f[ií]sica|higiene)/i;
const pzR=(v,d)=>{if(v==null||isNaN(v))return null;const m=Math.pow(10,d);return Math.sign(v)*Math.round(Math.abs(v)*m+1e-9)/m};
const pzF=(v,d)=>v==null?'':(d==null?String(v):v.toFixed(d)).replace('.',',');
const pzCompDe=n=>/franc[eê]s|alem[aã]o|espanhol/i.test(n)?'FC':/^\d{3,5}\s*[-–]/.test(n)||/^ufcd/i.test(n)?'FT':/fpct|forma[cç][aã]o pr[aá]tica|est[aá]gio/i.test(n)?'FP':PZ_SOC.test(normT(n).replace(/\s+/g,' '))||PZ_SOC.test(n)?'FSC':'FC';
function PZS(){const {c}=CP();c.pautas=c.pautas||{};return c.pautas}
function pzNovo(nome){const P=PZS();const id=uid();P[id]={id,nome:nome||'Curso',curso:'',tipo:'IV-4',anos:3,anoAtual:3,anoLetivo:(A()&&A().nome)||'',local:S.cfg.localidade||'',data:isoHoje(),pesos:{FSC:1,FC:1,FT:2,FP:1},
  form:[],disc:[],notas:{},fpct:{crit:[['Caraterização da Entidade Enquadradora',60],['Descrição das Atividades Desenvolvidas',60],['Análise Crítica',60],['Capacidade de Autoavaliação',20]],pRel:0.2,pEnt:0.8,v:{}},cpaf:{}};return P[id]}
/* ---------- importar o «Histórico de classificações do aluno» (SGE) ---------- */
async function pzImportar(pid){const inp=document.createElement('input');inp.type='file';inp.accept='.xlsx';inp.multiple=true;inp.onchange=async()=>{const fs=[...inp.files];if(!fs.length)return;
  try{let n=0,nd=0;const P=PZS();let p=pid&&P[pid];
    for(const f of fs){const F=await ptXlsxFolhas(f);for(const sh of F){const r=pzLerFolha(sh);if(!r)continue;if(!p){const gs=f.name.replace(/\.xlsx$/i,'').replace(/^[0-9a-f]{8}-/i,'').replace(/_/g,' ').replace(/\s+/g,' ').trim();const nn=(prompt('Nome deste curso/turma na app:',gs)||gs).trim();p=pzNovo(nn);UI.pzId=p.id}
      let fo=p.form.find(x=>normT(x.nome)===normT(r.nome));if(!fo){const al=pzProcurarAluno(r.nome);fo={id:uid(),nome:r.nome,num:al&&(al.processo||al.num)||'',bi:''};p.form.push(fo);n++}
      if(r.anos.length){const mx=Math.max(...r.anos);if(mx!==p.anos&&!p._tipoMan){p.anos=mx;p.tipo=mx>=3?'IV-4':mx===2?'II-2':'II-3';p.pesos=Object.assign({},p.pesos)}p.anoAtual=mx}
      r.linhas.forEach(l=>{let d=p.disc.find(x=>normT(x.nome)===normT(l.nome));if(!d){d={id:uid(),nome:l.nome,comp:pzCompDe(l.nome)};p.disc.push(d);nd++}
        Object.entries(l.v).forEach(([ano,v])=>{const k=fo.id+'|'+ano+'|'+d.id;p.notas[k]=v})})}}
    if(!p)return toast('Não encontrei nenhum «Histórico de classificações do aluno» nesse ficheiro.','aviso');
    pzOrdenar(p);save();vCProfij();toast(`Importado: ${p.form.length} formando(s), ${p.disc.length} disciplinas/UFCD${n?' · '+n+' novo(s)':''}.`)}
  catch(e){console.warn(e);toast('Não foi possível ler o ficheiro: '+e.message,'erro')}};inp.click()}
function pzProcurarAluno(nome){const a=A();if(!a)return null;for(const t of a.turmas){const x=(t.alunos||[]).find(z=>normT(z.nome)===normT(nome));if(x)return x}return null}
function pzLerFolha(sh){const C=sh.C;const g=r=>C.get(r)||'';let nome='';for(const [k,v] of C){if(/hist[oó]rico de classifica/i.test(v)){const m=v.match(/aluno\s*\(?a?\)?\s+(.+)$/i);if(m)nome=m[1].trim()}}if(!nome)return null;
  const col=s=>s.split('').reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0),ltr=n=>{let s='';while(n){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
  let rDisc=0,cDisc=0;for(const [k,v] of C)if(/^disciplinas$/i.test(v.trim())){const m=k.match(/^([A-Z]+)(\d+)$/);rDisc=+m[2];cDisc=col(m[1])}if(!rDisc)return null;
  /* blocos de ano: «… 1.º Ano» na linha das disciplinas; períodos e «Aval» na linha seguinte */
  const anos=[];for(const [k,v] of C){const m=k.match(/^([A-Z]+)(\d+)$/);if(+m[2]!==rDisc)continue;const a=v.match(/(\d)\.?\s*º\s*Ano/i);if(a)anos.push({ano:+a[1],c:col(m[1]),al:(v.match(/(\d{4}\/\d{4})/)||[])[1]||''})}
  anos.sort((x,y)=>x.c-y.c);anos.forEach((b,i)=>{b.f=i<anos.length-1?anos[i+1].c-1:b.c+12;b.cols=[];for(let c=b.c;c<=b.f;c++){const h=g(ltr(c)+(rDisc+1)).trim();if(h)b.cols.push({c,h})}});
  const linhas=[];for(let r=rDisc+2;r<rDisc+200;r++){let n=g(ltr(cDisc)+r).trim();if(!n)continue;if(/^total$/i.test(n))break;n=n.replace(/^unidades? de forma[cç][aã]o de curta dura[cç][aã]o\s*[-–]\s*/i,'');
    const v={};anos.forEach(b=>{const av=b.cols.find(x=>/aval|cif|cfd/i.test(x.h));const per=b.cols.filter(x=>/p\./i.test(x.h)).map(x=>g(ltr(x.c)+r).trim());let val=av?g(ltr(av.c)+r).trim():'';
      /* «Aval» com fórmula sobre períodos vazios dá 0: só conta se houver classificação nalgum período (as UFCD só têm «Aval») */
      if(per.length&&!per.some(x=>x!==''))val=per.length&&/^0([.,]0+)?$/.test(val)?'':val;
      if(!/\d/.test(val)){const num=per.filter(x=>/^\d+([.,]\d+)?$/.test(x));const fl=per.filter(x=>/^[a-z]\)$/i.test(x));val=num.length?num[num.length-1]:fl.length?fl[fl.length-1]:''}
      if(val!=='')v[b.ano]=/^\d/.test(val)?+String(val).replace(',','.'):val});
    if(Object.keys(v).length)linhas.push({nome:n,v})}
  return {nome,anos:anos.map(b=>b.ano),linhas}}
function pzOrdenar(p){const o={FSC:0,FC:1,FT:2,FP:3};p.disc.sort((x,y)=>(o[x.comp]-o[y.comp])||(x.comp==='FT'?x.nome.localeCompare(y.nome,'pt',{numeric:true}):0))}
/* ---------- cálculo ---------- */
const pzNum=v=>typeof v==='number'&&!isNaN(v)?v:(typeof v==='string'&&/^\d+([.,]\d+)?$/.test(v)?+v.replace(',','.'):null);
function pzFpct(p,fo){const x=p.fpct.v[fo.id]||{};const tot=p.fpct.crit.reduce((s,c)=>s+(+c[1]||0),0)||200;const sc=p.fpct.crit.map((c,i)=>pzNum(x['c'+i]));const rel=sc.every(v=>v!=null)?sc.reduce((s,v)=>s+v,0)/(tot/20):(pzNum(x.rel));const ent=pzNum(x.ent);
  const nota=rel!=null&&ent!=null?rel*(+p.fpct.pRel)+ent*(+p.fpct.pEnt):null;return {sc,rel:rel!=null?pzR(rel,2):null,ent,nota:nota!=null?pzR(nota,2):null,fin:nota!=null?pzR(nota,0):null}}
function pzAno(p,fo,ano){const r={};PZ_COMP.forEach(([k])=>{const L=p.disc.filter(d=>d.comp===k).map(d=>pzNum(p.notas[fo.id+'|'+ano+'|'+d.id])).filter(v=>v!=null);
    if(k==='FP'){const m=pzNum(p.notas[fo.id+'|'+ano+'|FP']);const f=+ano===+p.anoAtual?pzFpct(p,fo).fin:null;const v=m!=null?m:f!=null?f:L.length?L.reduce((s,v)=>s+v,0)/L.length:null;r[k]=v!=null?pzR(v,1):null;return}
    r[k]=L.length?pzR(L.reduce((s,v)=>s+v,0)/L.length,1):null});
  const W=p.pesos;const ks=PZ_COMP.map(c=>c[0]).filter(k=>+W[k]>0);const ok=ks.every(k=>r[k]!=null);const sw=ks.reduce((s,k)=>s+(+W[k]),0);
  r.CFA=ok&&sw?pzR(ks.reduce((s,k)=>s+r[k]*(+W[k]),0)/sw,1):null;return r}
function pzCFC(p,fo){const L=[];for(let a=1;a<=p.anos;a++)L.push(pzAno(p,fo,a).CFA);const cp=pzNum(p.cpaf[fo.id]);const ok=L.every(v=>v!=null)&&cp!=null;return {cfa:L,cpaf:cp,cfc:ok?pzR((L.reduce((s,v)=>s+v,0)+cp)/(L.length+1),0):null,bruto:ok?(L.reduce((s,v)=>s+v,0)+cp)/(L.length+1):null}}
/* ---------- vista ---------- */
function pzHTML(a){const P=PZS();const L=Object.values(P).sort((x,y)=>x.nome.localeCompare(y.nome,'pt',{numeric:true}));const p=P[UI.pzId]||L[0];if(p)UI.pzId=p.id;
  const sel=`<div class="row cpm-sel noprint" style="gap:8px;flex-wrap:wrap">${L.map(x=>`<button type="button" class="chip ${p&&x.id===p.id?'on':''}" data-pzid="${x.id}">${esc(x.nome)}</button>`).join('')}<button type="button" class="chip" id="pz-novo">${ic('plus',13)} Novo</button><button type="button" class="chip" id="pz-imp">${ic('upload',13)} Importar Histórico do SGE (Excel)</button></div>`;
  if(!p)return sel+`<section class="card empty">${ic('award',28)}<br><b>Classificações e Pautas</b><br><span class="mut">Importe o «Histórico de classificações do aluno» exportado do SGE (Excel, uma folha por formando). A app calcula as médias por componente, a CFA de cada ano, a FPCT e a CFC, e faz as pautas.</span><br><br><button class="btn pri" id="pz-imp2">${ic('upload',14)} Importar Histórico (Excel)</button> <button class="btn" id="pz-ifp0">${ic('upload',14)} Importar Grelha da FPCT</button></section>`;
  const W=p.pesos;const ft=PZ_COMP.filter(([k])=>+W[k]>0).map(([k])=>(+W[k]===1?'':W[k])+k).join('+');
  const cab=`<section class="card"><div class="pz-cab">
      <div class="pz-w2"><label>Curso (como na pauta)</label><input data-pzc="curso" value="${esc(p.curso)}" placeholder="ex.: Animador/a Sociocultural"></div>
      <div><label>Nome na app</label><input data-pzc="nome" value="${esc(p.nome)}"></div>
      <div><label>Tipo</label><select data-pzc="tipo">${[['II-2','PROFIJ II – Tipo 2',2],['II-3','PROFIJ II – Tipo 3',1],['IV-4','PROFIJ IV – Tipo 4',3]].map(([k,l])=>`<option value="${k}" ${p.tipo===k?'selected':''}>${l}</option>`).join('')}</select></div>
      <div><label>Anos</label><input type="number" min="1" max="3" data-pzc="anos" value="${p.anos}" ></div>
      <div><label>Ano atual</label><input type="number" min="1" max="3" data-pzc="anoAtual" value="${p.anoAtual}" ></div>
      <div><label>Ano letivo</label><input data-pzc="anoLetivo" value="${esc(p.anoLetivo)}" ></div>
      <div><label>Localidade</label><input data-pzc="local" value="${esc(p.local)}" ></div>
      <div><label>Data das pautas</label><input type="date" data-pzc="data" value="${esc(p.data)}"></div></div>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center"><b>CFA = (${ft})/${PZ_COMP.reduce((s,[k])=>s+(+W[k]||0),0)}</b>${PZ_COMP.map(([k,l])=>`<label class="prl"><span title="${l}">${k}</span><input type="number" min="0" max="5" step="0.5" data-pzw="${k}" value="${W[k]}"></label>`).join('')}<span class="mut">às décimas · CFC = (CFA1${p.anos>1?'+…+CFA'+p.anos:''}+CPAF)/${p.anos+1}, às unidades</span>
      <span class="sp1"></span><button class="btn sm" id="pz-imp3">${ic('upload',14)} Importar Histórico</button><button class="btn sm dng" id="pz-del">${ic('trash',14)}</button></div></section>`;
  const fo=`<section class="card"><div class="row"><h2 style="margin:0">${ic('users',18)} Formandos</h2><span class="sp1"></span><button class="btn sm noprint" id="pz-fadd">${ic('plus',13)} Formando</button></div>
    <div class="tblw"><table class="lst pz-t"><thead><tr><th>N.º</th><th>BI/CC</th><th>Nome</th><th></th></tr></thead><tbody>${p.form.map(f=>`<tr><td><input data-pzf="${f.id}|num" value="${esc(f.num||'')}" style="width:80px"></td><td><input data-pzf="${f.id}|bi" value="${esc(f.bi||'')}" placeholder="…000" style="width:80px"></td><td><input data-pzf="${f.id}|nome" value="${esc(f.nome)}" style="min-width:260px"></td><td><button class="btn sm ghost" data-pzfx="${f.id}" title="Retirar">${ic('trash',13)}</button></td></tr>`).join('')}</tbody></table></div>
    <p class="hint">Na pauta, o BI/CC aparece só com os últimos dígitos (ex.: …123).</p></section>`;
  const ano=Math.min(p.anos,Math.max(1,+UI.pzAno||p.anoAtual));UI.pzAno=ano;
  const anoT=`<div class="cpd-seg noprint" role="group">${Array.from({length:p.anos},(_,i)=>`<button type="button" data-pzano="${i+1}" class="${ano===i+1?'on':''}">${i+1}.º ano</button>`).join('')}</div>`;
  const D=p.disc;const usados=D.filter(d=>p.form.some(f=>p.notas[f.id+'|'+ano+'|'+d.id]!=null));const R=p.form.map(f=>pzAno(p,f,ano));
  const cel=(f,d)=>{const v=p.notas[f.id+'|'+ano+'|'+d.id];return `<td class="n"><input class="pz-n" data-pzn="${f.id}|${ano}|${d.id}" value="${v==null?'':esc(String(v).replace('.',','))}" inputmode="decimal"></td>`};
  const notas=`<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('grid',18)} Classificações</h2>${anoT}<span class="sp1"></span><label class="chk" style="margin:0"><input type="checkbox" id="pz-tod" ${UI.pzTod?'checked':''}> <span>Mostrar todas as disciplinas e UFCD</span></label><button class="btn sm noprint" id="pz-dadd">${ic('plus',13)} Disciplina / UFCD</button></div>
    <div class="cpm-tw"><table class="lst pz-g"><thead><tr><th>Disciplina / UFCD</th><th>Comp.</th>${p.form.map(f=>`<th class="n" title="${esc(f.nome)}">${esc(f.nome.split(' ')[0])}</th>`).join('')}</tr></thead><tbody>
    ${(UI.pzTod?D:usados).map(d=>`<tr><td>${esc(d.nome)}</td><td><select data-pzdc="${d.id}">${PZ_COMP.map(([k])=>`<option ${d.comp===k?'selected':''}>${k}</option>`).join('')}</select></td>${p.form.map(f=>cel(f,d)).join('')}</tr>`).join('')||`<tr><td colspan="${p.form.length+2}" class="mut">Sem classificações neste ano. Importe o histórico ou ligue «Mostrar todas».</td></tr>`}
    <tr class="pz-fp"><td><b>FPCT</b> <small class="mut">${ano===+p.anoAtual?'(vazio = nota da grelha abaixo)':''}</small></td><td>FP</td>${p.form.map(f=>{const v=p.notas[f.id+'|'+ano+'|FP'];return `<td class="n"><input class="pz-n" data-pzn="${f.id}|${ano}|FP" value="${v==null?'':esc(String(v).replace('.',','))}" placeholder="${ano===+p.anoAtual&&pzFpct(p,f).fin!=null?pzFpct(p,f).fin:''}"></td>`}).join('')}</tr>
    ${PZ_COMP.map(([k,l])=>`<tr class="pz-m"><td>Média ${l}</td><td>${k}</td>${R.map(r=>`<td class="n ${r[k]!=null&&r[k]<9.5?'neg':''}">${pzF(r[k],1)||'—'}</td>`).join('')}</tr>`).join('')}
    <tr class="pz-cfa"><td><b>CFA${ano}</b></td><td></td>${R.map(r=>`<td class="n"><b class="${r.CFA!=null&&r.CFA<9.5?'neg':''}">${pzF(r.CFA,1)||'—'}</b></td>`).join('')}</tr></tbody></table></div>
    <p class="hint">Cada componente é a média das classificações das suas disciplinas e UFCD desse ano (às décimas). Escreva «u)» ou «i)» para excluído / sem avaliação.</p></section>`;
  /* FPCT */
  const FC=p.fpct;const fp=`<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('building',18)} Grelha de Avaliação da FPCT — ${p.anoAtual}.º ano</h2><span class="sp1"></span>
      <label class="prl"><span>Relatório</span><input type="number" step="0.05" min="0" max="1" data-pzp="pRel" value="${FC.pRel}"></label><label class="prl"><span>Entidade</span><input type="number" step="0.05" min="0" max="1" data-pzp="pEnt" value="${FC.pEnt}"></label><button class="btn sm noprint" id="pz-crit">${ic('pencil',13)} Critérios do Relatório</button><button class="btn sm pri noprint" id="pz-ifp">${ic('upload',13)} Importar Grelha da FPCT (Excel)</button></div>
    <div class="cpm-tw"><table class="lst pz-g"><thead><tr><th>Formando</th>${FC.crit.map(c=>`<th class="n" title="${esc(c[0])}">${esc(c[0].split(' ').slice(0,2).join(' '))}<br><small>${c[1]}</small></th>`).join('')}<th class="n">Relatório</th><th class="n">Aval. Entidade</th><th class="n">Nota</th><th class="n">Nota Final</th></tr></thead><tbody>
    ${p.form.map(f=>{const x=FC.v[f.id]||{};const r=pzFpct(p,f);return `<tr><td>${esc(f.nome)}</td>${FC.crit.map((c,i)=>`<td class="n"><input class="pz-n" data-pzq="${f.id}|c${i}" value="${x['c'+i]==null?'':esc(String(x['c'+i]))}"></td>`).join('')}<td class="n">${pzF(r.rel,2)||'—'}</td><td class="n"><input class="pz-n" data-pzq="${f.id}|ent" value="${x.ent==null?'':esc(String(x.ent).replace('.',','))}"></td><td class="n">${pzF(r.nota,2)||'—'}</td><td class="n"><b>${r.fin==null?'—':r.fin}</b></td></tr>`}).join('')}</tbody></table></div>
    <p class="hint">Relatório = soma dos critérios ÷ ${(FC.crit.reduce((s,c)=>s+(+c[1]||0),0)/20)||10} (0–20). Nota = Relatório × ${FC.pRel} + Entidade × ${FC.pEnt}; a nota final (arredondada) entra na FP do ${p.anoAtual}.º ano.</p>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-pzx="fdet">${ic('file',14)} Pauta FPCT Detalhada</button><button class="btn sm" data-pzx="ffin">${ic('file',14)} Pauta FPCT Final</button><button class="btn sm" data-pzx="grelha">${ic('printer',14)} Grelha da FPCT</button></div></section>`;
  /* CFC */
  const cf=`<section class="card"><h2 style="margin:0 0 8px">${ic('award',18)} Classificação Final de Curso</h2><div class="cpm-tw"><table class="lst pz-g"><thead><tr><th>N.º</th><th>Formando</th>${Array.from({length:p.anos},(_,i)=>`<th class="n">CFA${i+1}</th>`).join('')}<th class="n">CPAF</th><th class="n">CFC</th></tr></thead><tbody>
    ${p.form.map(f=>{const r=pzCFC(p,f);return `<tr><td>${esc(f.num||'')}</td><td>${esc(f.nome)}</td>${r.cfa.map(v=>`<td class="n ${v!=null&&v<9.5?'neg':''}">${pzF(v,1)||'—'}</td>`).join('')}<td class="n"><input class="pz-n" data-pzcp="${f.id}" value="${p.cpaf[f.id]==null?'':esc(String(p.cpaf[f.id]).replace('.',','))}"></td><td class="n"><b class="${r.cfc!=null&&r.cfc<10?'neg':''}">${r.cfc==null?'—':r.cfc}</b></td></tr>`}).join('')}</tbody></table></div>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap;margin-top:8px"><button class="btn sm" data-pzx="cdet">${ic('file',14)} Pauta CFC Detalhada</button><button class="btn sm" data-pzx="cfin">${ic('file',14)} Pauta CFC Final</button><button class="btn sm" data-pzx="med">${ic('download',14)} Médias Detalhadas (CSV)</button>
      <label class="chk" style="margin:0 0 0 8px"><input type="checkbox" id="pz-word" ${UI.pzWord!==false?'checked':''}> <span>Em Word (desligado: imprimir / PDF)</span></label></div></section>`;
  return sel+cab+fo+notas+fp+cf}
function pzBind(v,a){const P=PZS();const p=P[UI.pzId];const re=()=>manterPosicao(vCProfij);
  v.querySelectorAll('[data-pzid]').forEach(b=>b.onclick=()=>{UI.pzId=b.dataset.pzid;vCProfij()});
  [v.querySelector('#pz-imp'),v.querySelector('#pz-imp2'),v.querySelector('#pz-imp3')].forEach(b=>b&&(b.onclick=()=>pzImportar(b.id==='pz-imp3'?UI.pzId:null)));
  const if0=v.querySelector('#pz-ifp0');if(if0)if0.onclick=()=>pzImportarFpct(null);
  const nv=v.querySelector('#pz-novo');if(nv)nv.onclick=()=>{const n=(prompt('Nome do curso/turma (ex.: ASC 3):')||'').trim();if(!n)return;const x=pzNovo(n);UI.pzId=x.id;save();vCProfij()};
  if(!p)return;
  v.querySelectorAll('[data-pzc]').forEach(i=>i.onchange=()=>{const k=i.dataset.pzc;let x=i.value;if(k==='anos'||k==='anoAtual')x=Math.min(3,Math.max(1,+x||1));p[k]=x;if(k==='tipo'){p._tipoMan=true;const A_={'II-2':2,'II-3':1,'IV-4':3}[x];p.anos=A_;p.anoAtual=Math.min(p.anoAtual,A_)}save();re()});
  v.querySelectorAll('[data-pzw]').forEach(i=>i.onchange=()=>{p.pesos[i.dataset.pzw]=Math.max(0,+i.value.replace(',','.')||0);save();re()});
  v.querySelectorAll('[data-pzp]').forEach(i=>i.onchange=()=>{p.fpct[i.dataset.pzp]=Math.max(0,+i.value.replace(',','.')||0);save();re()});
  const dl=v.querySelector('#pz-del');if(dl)dl.onclick=()=>{if(!confirm('Apagar «'+p.nome+'» e todas as classificações importadas?'))return;delete P[p.id];UI.pzId='';save();vCProfij()};
  v.querySelectorAll('[data-pzf]').forEach(i=>i.onchange=()=>{const [id,k]=i.dataset.pzf.split('|');const f=p.form.find(x=>x.id===id);if(f){f[k]=i.value.trim();save()}});
  v.querySelectorAll('[data-pzfx]').forEach(b=>b.onclick=()=>{if(!confirm('Retirar este formando?'))return;p.form=p.form.filter(x=>x.id!==b.dataset.pzfx);save();re()});
  const fa=v.querySelector('#pz-fadd');if(fa)fa.onclick=()=>{const n=(prompt('Nome do formando:')||'').trim();if(!n)return;const al=pzProcurarAluno(n);p.form.push({id:uid(),nome:n,num:al&&(al.processo||al.num)||'',bi:''});save();re()};
  const da=v.querySelector('#pz-dadd');if(da)da.onclick=()=>{const n=(prompt('Disciplina ou UFCD (ex.: 1234 - Nome da UFCD):')||'').trim();if(!n)return;p.disc.push({id:uid(),nome:n,comp:pzCompDe(n)});pzOrdenar(p);UI.pzTod=true;save();re()};
  const td=v.querySelector('#pz-tod');if(td)td.onchange=()=>{UI.pzTod=td.checked;re()};
  v.querySelectorAll('[data-pzano]').forEach(b=>b.onclick=()=>{UI.pzAno=+b.dataset.pzano;re()});
  v.querySelectorAll('[data-pzdc]').forEach(s=>s.onchange=()=>{const d=p.disc.find(x=>x.id===s.dataset.pzdc);if(d){d.comp=s.value;save();re()}});
  const val=x=>{x=String(x).trim();if(x==='')return null;if(/^\d+([.,]\d+)?$/.test(x))return +x.replace(',','.');return x};
  v.querySelectorAll('[data-pzn]').forEach(i=>i.onchange=()=>{const k=i.dataset.pzn;const x=val(i.value);if(x==null)delete p.notas[k];else p.notas[k]=x;save();re()});
  v.querySelectorAll('[data-pzq]').forEach(i=>i.onchange=()=>{const [id,k]=i.dataset.pzq.split('|');const o=p.fpct.v[id]=p.fpct.v[id]||{};const x=val(i.value);if(x==null)delete o[k];else o[k]=x;pzFpctParaCoord(p);save();re()});
  v.querySelectorAll('[data-pzcp]').forEach(i=>i.onchange=()=>{const x=val(i.value);if(x==null)delete p.cpaf[i.dataset.pzcp];else p.cpaf[i.dataset.pzcp]=x;save();re()});
  const cr=v.querySelector('#pz-crit');if(cr)cr.onclick=()=>{const t=prompt('Critérios do relatório, um por linha: nome ; máximo\n(ex.: Análise Crítica ; 60)',p.fpct.crit.map(c=>c[0]+' ; '+c[1]).join(' | '));if(t==null)return;const L=t.split(/\||\n/).map(x=>x.split(';').map(y=>y.trim())).filter(x=>x[0]).map(x=>[x[0],+x[1]||20]);if(L.length){p.fpct.crit=L;save();re()}};
  const ifp=v.querySelector('#pz-ifp');if(ifp)ifp.onclick=()=>pzImportarFpct(p.id);
  const wd=v.querySelector('#pz-word');if(wd)wd.onchange=()=>{UI.pzWord=wd.checked};
  v.querySelectorAll('[data-pzx]').forEach(b=>b.onclick=()=>pzExportar(p,b.dataset.pzx))}
/* ---------- pautas (Word ou imprimir) ---------- */
const pzBI=b=>{b=String(b||'').trim();return !b?'':/^…/.test(b)?b:'…'+b.slice(-3)};
function pzDataExt(iso){if(!iso)return '';const d=dataDeIso(iso);return d.getDate()+' de '+MESES[d.getMonth()+1].toLowerCase()+' de '+d.getFullYear()}
function pzCab(p,tit,ano){const tp={'II-2':'PROFIJ II – Tipo 2','II-3':'PROFIJ II – Tipo 3','IV-4':'PROFIJ IV – Tipo 4'}[p.tipo]||'PROFIJ';
  return `<p class="c s">Secretaria Regional da Educação, Cultura e Desporto</p><p class="c t">${esc(tit)} ${esc(p.anoLetivo||'')}</p><p class="c t">PAUTA DE AVALIAÇÃO</p>
    <p class="c">Curso ${esc(p.curso||p.nome)}${ano?' – '+ano+'.º ano':''} – ${tp}</p><p class="c">Programa Formativo de Inserção de Jovens (PROFIJ)</p><p class="c s">(Portaria n.º 52/2016 de 16 de junho, alterada pela Portaria n.º 86/2018 de 12 de julho)</p>`}
const pzAss=p=>`<p class="d">${esc(p.local||'')}${p.local?', ':''}${pzDataExt(p.data)}</p><p class="a">O Coordenador do Programa PROFIJ</p>${cpAssImg()}<p class="a">_______________________________</p>`;
const PZ_CSS=`body{font:11pt/1.35 Calibri,Arial,sans-serif;color:#000}p{margin:0 0 4pt}.c{text-align:center}.t{font-weight:bold;font-size:12pt}.s{font-size:9.5pt}table{border-collapse:collapse;width:100%;margin:12pt 0}th,td{border:1px solid #000;padding:3pt 5pt;font-size:10pt}th{background:#e7e6e6}td.n,th.n{text-align:center}.d{margin-top:22pt}.a{text-align:center;margin-top:10pt}.lf{display:flex;gap:8pt}.lf span.p{flex:1;border-bottom:1px dotted #000;margin:0 4pt 4pt}.nt{font-size:9.5pt;margin-top:8pt}`;
function pzSaida(p,nome,corpo){const html=`<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><title>${esc(nome)}</title><style>${PZ_CSS}</style></head><body>${corpo}</body></html>`;
  if(UI.pzWord!==false){download(nome.replace(/[\\/:*?"<>|]+/g,'-')+'.doc','﻿'+html,'application/msword');toast('Pauta descarregada (abre no Word).')}else cpdDoc(nome,`<style>${PZ_CSS}</style>`+corpo)}
function pzExportar(p,k){const F=p.form.slice().sort((x,y)=>x.nome.localeCompare(y.nome,'pt'));const al=p.anoLetivo?p.anoLetivo.replace('/','.').replace(/^20(\d\d)\.20(\d\d)$/,'$1.$2'):'';
  const fin=(tit,vals,ano)=>pzCab(p,tit,ano)+`<table><thead><tr><th>N.º</th><th>BI/CC</th><th>NOME</th><th class="n">NOTA</th></tr></thead><tbody>${F.map(f=>`<tr><td>${esc(f.num||'')}</td><td>${esc(pzBI(f.bi))}</td><td>${esc(f.nome.toUpperCase())}</td><td class="n"><b>${vals(f)??''}</b></td></tr>`).join('')}</tbody></table>`+pzAss(p);
  if(k==='fdet'){pzSaida(p,al+' PAUTA DETALHADA FPCT '+p.nome,pzCab(p,'FORMAÇÃO PRÁTICA EM CONTEXTO DE TRABALHO',p.anoAtual)+`<table><thead><tr><th>N.º</th><th>BI/CC</th><th>NOME</th><th class="n">RELATÓRIO</th><th class="n">AVAL. ENT.</th><th class="n">NOTA</th><th class="n">NOTA FINAL</th></tr></thead><tbody>${F.map(f=>{const r=pzFpct(p,f);return `<tr><td>${esc(f.num||'')}</td><td>${esc(pzBI(f.bi))}</td><td>${esc(f.nome.toUpperCase())}</td><td class="n">${pzF(r.rel)}</td><td class="n">${pzF(r.ent)}</td><td class="n">${pzF(r.nota,2)}</td><td class="n"><b>${r.fin??''}</b></td></tr>`}).join('')}</tbody></table>`+pzAss(p));return}
  if(k==='ffin'){pzSaida(p,al+' PAUTA FINAL FPCT '+p.nome,fin('FORMAÇÃO PRÁTICA EM CONTEXTO DE TRABALHO',f=>pzFpct(p,f).fin,p.anoAtual));return}
  if(k==='cdet'){const W=p.pesos;const ft=PZ_COMP.filter(([x])=>+W[x]>0).map(([x])=>(+W[x]===1?'':W[x])+x).join('+');const sw=PZ_COMP.reduce((s,[x])=>s+(+W[x]||0),0);const nv=p.tipo==='IV-4'?'nível IV – tipo 4':p.tipo==='II-3'?'nível II – tipo 3':'nível II – tipo 2';
    pzSaida(p,al+' PAUTA DETALHADA CF '+p.nome,pzCab(p,'CLASSIFICAÇÃO FINAL DE CURSO')+`<table><thead><tr><th>N.º</th><th>BI/CC</th><th>NOME</th>${Array.from({length:p.anos},(_,i)=>`<th class="n">CFA${i+1}</th>`).join('')}<th class="n">CPAF</th><th class="n">NOTA FINAL</th></tr></thead><tbody>${F.map(f=>{const r=pzCFC(p,f);return `<tr><td>${esc(f.num||'')}</td><td>${esc(pzBI(f.bi))}</td><td>${esc(f.nome.toUpperCase())}</td>${r.cfa.map(v=>`<td class="n">${pzF(v,1)}</td>`).join('')}<td class="n">${pzF(r.cpaf)}</td><td class="n"><b>${r.cfc??''}</b></td></tr>`}).join('')}</tbody></table>
      <p class="nt">${Array.from({length:p.anos},(_,i)=>`CFA${i+1} – Classificação Final Anual ${i+1}.º ano`).join(' – ')} – CPAF – Classificação Final Prova de Avaliação Final</p>
      <p class="nt">A classificação de cada ano de formação de um curso de ${nv} obtém-se pela aplicação da seguinte fórmula: CFA = (${ft})/${sw}, cujo resultado é arredondado às décimas.</p>
      <p class="nt">A classificação final respeitante à conclusão dos itinerários de ${nv} obtém-se pela aplicação da seguinte fórmula: CFC = (${Array.from({length:p.anos},(_,i)=>'CFA'+(i+1)).join('+')}+CPAF)/${p.anos+1}, cujo resultado é arredondado às unidades.</p>`+pzAss(p));return}
  if(k==='cfin'){pzSaida(p,al+' PAUTA FINAL CF '+p.nome,fin('CLASSIFICAÇÃO FINAL DE CURSO',f=>pzCFC(p,f).cfc));return}
  if(k==='grelha'){const FC=p.fpct;const tot=FC.crit.reduce((s,c)=>s+(+c[1]||0),0);cpdDoc('Grelha FPCT '+p.nome,`<style>${PZ_CSS}</style>`+pzCab(p,'FORMAÇÃO PRÁTICA EM CONTEXTO DE TRABALHO',p.anoAtual).replace('PAUTA DE AVALIAÇÃO','GRELHA DE AVALIAÇÃO')+`<table><thead><tr><th>N.º</th><th>NOME</th>${FC.crit.map(c=>`<th class="n">${esc(c[0])}<br>${c[1]}</th>`).join('')}<th class="n">Total<br>${tot}</th><th class="n">Relatório</th><th class="n">Entidade</th><th class="n">Nota</th><th class="n">Final</th></tr></thead><tbody>${F.map(f=>{const r=pzFpct(p,f);const x=FC.v[f.id]||{};return `<tr><td>${esc(f.num||'')}</td><td>${esc(f.nome.toUpperCase())}</td>${FC.crit.map((c,i)=>`<td class="n">${x['c'+i]??''}</td>`).join('')}<td class="n">${r.sc.every(v=>v!=null)?r.sc.reduce((s,v)=>s+v,0):''}</td><td class="n">${pzF(r.rel)}</td><td class="n">${pzF(r.ent)}</td><td class="n">${pzF(r.nota,2)}</td><td class="n"><b>${r.fin??''}</b></td></tr>`}).join('')}</tbody></table><p class="nt">Nota = Relatório × ${FC.pRel} + Avaliação da Entidade Acolhedora × ${FC.pEnt}</p>`+pzAss(p));return}
  if(k==='med'){const q=x=>{x=x==null?'':String(x);return /[;"\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x};const R=[['N.º','Nome',...Array.from({length:p.anos},(_,i)=>['FSC','FC','FT','FP','CFA'].map(c=>c+(i+1))).flat(),'CPAF','CFC']];
    F.forEach(f=>{const row=[f.num||'',f.nome];for(let a=1;a<=p.anos;a++){const r=pzAno(p,f,a);['FSC','FC','FT','FP','CFA'].forEach(c=>row.push(pzF(r[c],1)))}const c=pzCFC(p,f);row.push(pzF(c.cpaf),c.cfc??'');R.push(row)});
    download('medias-detalhadas-'+normSig(p.nome)+'.csv','﻿'+R.map(l=>l.map(q).join(';')).join('\n'),'text/csv')}}
/* ---------- v1.000 · importar a «Grelha de Avaliação da FPCT» (Excel: folhas Relatório e Final) ---------- */
async function pzImportarFpct(pid){const inp=document.createElement('input');inp.type='file';inp.accept='.xlsx';inp.onchange=async()=>{const f=inp.files[0];if(!f)return;
  try{const F=await ptXlsxFolhas(f);const P=PZS();let p=pid&&P[pid];
    const shR=F.find(x=>/relat/i.test(x.nome))||F[0],shF=F.find(x=>/final/i.test(x.nome));const g=(sh,r)=>sh?(sh.C.get(r)||'').trim():'';
    const col=s=>s.split('').reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0),ltr=n=>{let s='';while(n){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
    const acha=(sh,re)=>{for(const [k,v] of sh.C)if(re.test(v)){const m=k.match(/^([A-Z]+)(\d+)$/);return {c:col(m[1]),r:+m[2]}}return null};
    const hN=acha(shR,/^nome$/i),hNum=acha(shR,/^n[uú]mero$|^n\.?º$/i),hRel=acha(shR,/^relat[oó]rio$/i);if(!hN||!hRel)return toast('Não encontrei a grelha (colunas NOME e Relatório) neste ficheiro.','aviso');
    /* critérios: textos por baixo de «Relatório» até à coluna da nota; máximos na linha seguinte */
    let rc=hRel.r+1;while(rc<hRel.r+6&&!g(shR,ltr(hRel.c)+rc))rc++;const crit=[];for(let c=hRel.c;c<hRel.c+12;c++){const t=g(shR,ltr(c)+rc);if(!t)continue;if(/nota|classif/i.test(t))break;const mx=+String(g(shR,ltr(c)+(rc+1))).replace(',','.')||0;crit.push({c,t,mx})}
    const tit=[...shR.C.values()].find(v=>/^curso\s/i.test(v))||'';
    if(!p){const gs=(tit.replace(/^curso\s*/i,'').split(/\s[-–]\s/)[0]||f.name).trim();p=Object.values(P).find(x=>normT(x.curso||x.nome)===normT(gs))||pzNovo((prompt('Nome deste curso/turma na app:',gs)||gs).trim());UI.pzId=p.id}
    if(!p.curso&&tit)p.curso=tit.replace(/^curso\s*/i,'').split(/\s[-–]\s/)[0].trim();
    if(crit.length)p.fpct.crit=crit.map(c=>[c.t,c.mx||20]);
    /* pesos e avaliação da entidade (folha Final) */
    let ent={},bi={};if(shF){const fN=acha(shF,/^nome$/i),fE=acha(shF,/entidade/i),fR=acha(shF,/^relat[oó]rio$/i),fB=acha(shF,/^bi\/?cc$/i);
      if(fR){const w=+String(g(shF,ltr(fR.c)+(fR.r+2))).replace(',','.');if(w>0&&w<1)p.fpct.pRel=w}if(fE){const w=+String(g(shF,ltr(fE.c)+(fE.r+2))).replace(',','.');if(w>0&&w<1)p.fpct.pEnt=w}
      if(fN)for(let r=fN.r+1;r<fN.r+80;r++){const n=g(shF,ltr(fN.c)+r);if(!n||/coordenador|^\w+,\s*\d/i.test(n))continue;if(fE){const v=g(shF,ltr(fE.c)+r);if(/^\d/.test(v))ent[normT(n)]=+v.replace(',','.')}if(fB)bi[normT(n)]=g(shF,ltr(fB.c)+r)}}
    let n=0,novos=0;for(let r=rc+2;r<rc+80;r++){const nome=g(shR,ltr(hN.c)+r);if(!nome||!/[a-zà-ÿ]{3}/i.test(nome))continue;if(/coordenador/i.test(nome))break;
      let fo=p.form.find(x=>normT(x.nome)===normT(nome));if(!fo){fo={id:uid(),nome,num:'',bi:''};p.form.push(fo);novos++}
      const num=hNum?g(shR,ltr(hNum.c)+r):'';if(num&&!fo.num)fo.num=num;if(bi[normT(nome)]&&!fo.bi)fo.bi=bi[normT(nome)];
      const o=p.fpct.v[fo.id]=p.fpct.v[fo.id]||{};crit.forEach((c,i)=>{const v=g(shR,ltr(c.c)+r);if(/^\d/.test(v))o['c'+i]=+v.replace(',','.')});if(ent[normT(nome)]!=null)o.ent=ent[normT(nome)];n++}
    pzFpctParaCoord(p);save();UI.cpTab='pautas';vCProfij();toast(`Grelha da FPCT importada: ${n} formando(s)${novos?' ('+novos+' novo(s))':''}, ${crit.length} critério(s).`)}
  catch(e){console.warn(e);toast('Não foi possível ler a grelha: '+e.message,'erro')}};inp.click()}
/* a nota final da FPCT passa também para o separador FPCT da coordenação (formandos com o mesmo nome) */
function pzFpctParaCoord(p){try{const {y,a}=CP();if(!a)return;cpClasses(a).forEach(cl=>cl.formandos.forEach(al=>{const fo=p.form.find(x=>normT(x.nome)===normT(al.nome));if(!fo)return;const r=pzFpct(p,fo);if(r.fin==null)return;const k=cl.nome+'|'+al.k;y.fpct[k]=Object.assign(y.fpct[k]||{},{nota:r.fin})}))}catch(e){console.warn(e)}}
/*V0996-FIM*/
/*V0990-INI*/
/* ===================== v0.990 · separadores do topo alinhados com o conteúdo que vem por baixo (ecrãs largos) ===================== */
function alinharTabsTopo(){const v=document.getElementById('view');if(!v)return;const t=v.querySelector(':scope>.tabs,:scope>.deftabs');if(!t)return;t.style.removeProperty('margin-left');
  const n=t.nextElementSibling;if(!n||!n.matches('.vlay,.card,.kpis,.mtlay,.inlay,.anv,.cmw'))return;const vr=v.getBoundingClientRect(),nr=n.getBoundingClientRect();if(!nr.width)return;
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
/* SpruceNote e JornalNote: ao entrar, o quadro ajusta-se sozinho ao ecrã */
{const _gMQ=go;go=function(v){const ant=VIEW;const r=_gMQ.apply(this,arguments);try{if((v==='sprucenote'||v==='snjornal')&&ant!==v){let n=0;const f=()=>{const b=document.getElementById('mq-zf');if(b&&document.querySelector('[data-mq]')){b.click()}else if(b&&n>6){}else if(n++<12)setTimeout(f,120)};setTimeout(f,150)}}catch(_){}return r};if(_gMQ._f)go._f=_gMQ._f}
/* JornalNote: o quadro principal antigo passa a chamar-se JornalNote */
setTimeout(()=>{try{const q=S.snj&&S.snj.quadros;const r=q&&q.find(x=>x.id==='raiz');if(r&&r.nome==='SpruceNote do Jornal'){r.nome='JornalNote';save()}}catch(_){}},1200);

