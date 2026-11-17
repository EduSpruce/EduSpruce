/* ---------- visita guiada ---------- */
function visitaGuiada(){const P=[['#side [data-v="inicio"]','Início','Contagem para o fim do período, datas importantes, próximos testes e as suas turmas.'],['#side [data-v="turmas"]','Ano Letivo e Turmas','Crie o ano letivo e importe as turmas a partir do Excel com as fotografias.'],['#side [data-v="calendario"]','Calendário Escolar','Importe o PDF do calendário: períodos, interrupções, feriados e aulas previstas.'],['#side [data-v="meuhorario"]','O Meu Horário','Importe o PDF do seu horário: aulas e tempos não letivos (que pode arrastar).'],['#side [data-v="testes"]','Marcação de Testes','Calendário do ano de cada turma: toque num dia para marcar um teste ou registar uma falta.'],['#pqBtn','Pesquisar','⌘K ou este botão: encontre qualquer aluno, turma ou instrumento.'],['#temaSel','Tema','Claro, escuro ou automático. Mais opções em Definições › Aparência.']];
  let k=0;const o=document.createElement('div');o.id='tour';document.body.appendChild(o);
  const passo=()=>{let el=null;while(k<P.length&&!(el=$(P[k][0])))k++;if(k>=P.length||!el){o.remove();S.cfg.tourVisto=true;save();return}
    if(innerWidth<=700&&el.closest('#side'))document.body.classList.add('menu');el.scrollIntoView({block:'nearest'});const r=el.getBoundingClientRect();
    o.innerHTML=`<div class="tspot" style="left:${r.left-6}px;top:${r.top-6}px;width:${r.width+12}px;height:${r.height+12}px"></div><div class="tbox" style="left:${Math.min(innerWidth-330,Math.max(12,r.right+16>innerWidth-330?r.left:r.right+16))}px;top:${Math.min(innerHeight-190,Math.max(12,r.top))}px"><small>${k+1} de ${P.length}</small><b>${esc(P[k][1])}</b><p>${esc(P[k][2])}</p><div class="row"><button class="btn sm" id="tr-x">Saltar</button><span class="sp1"></span><button class="btn sm pri" id="tr-n">${k===P.length-1?'Concluir':'Seguinte →'}</button></div></div>`;
    $('#tr-n').onclick=()=>{k++;document.body.classList.remove('menu');passo()};$('#tr-x').onclick=()=>{k=P.length;document.body.classList.remove('menu');passo()}};passo()}
function posArranque(){if(!S.anos.length&&!S.cfg.tourVisto)setTimeout(visitaGuiada,500);else if(S.cfg.versaoVista!==VERSAO&&S.anos.length){S.cfg.versaoVista=VERSAO;save();setTimeout(()=>toast('Nova versão '+VERSAO+' — veja as novidades em Definições › Ferramentas','ok'),800)}}
/* ---------- dados de demonstração ---------- */
function criarDemo(){if(S.anos.some(a=>a.nome==='Demonstração')&&!confirm('Já existe o ano “Demonstração”. Criar outro?'))return;
  const hoje=new Date();const y=hoje.getMonth()>=8?hoje.getFullYear():hoje.getFullYear()-1;const an=y+'/'+(y+1);const hj=isoData(hoje);
  const dd=n=>{const d=new Date(hoje);d.setDate(d.getDate()+n);while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+(n<0?-1:1));return isoData(d)};
  const rnd=(()=>{let x=20261103;return ()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648}})();
  const a={id:uid(),nome:'Demonstração',org:'periodo',turmas:[],horarios:{},demo:true};
  a.calendario=calendarioManual(an,[{n:1,ini:isoD(y,9,14),fim:isoD(y,12,18)},{n:2,ini:isoD(y+1,1,4),fim:isoD(y+1,3,26)},{n:3,ini:isoD(y+1,4,13),fim:isoD(y+1,6,18)}]);
  S.anos.push(a);S.anoAtivo=a.id;
  const NF=['Ana Sofia','Beatriz','Carolina','Daniela','Eva','Francisca','Gabriela','Inês','Joana','Leonor','Mariana','Matilde','Rita','Sara','Teresa','Vitória','Lara','Margarida','Clara','Alice','Benedita','Íris','Luísa','Mafalda','Raquel','Sofia','Catarina','Diana','Marta','Helena'];
  const NM=['Bruno Miguel','Diogo','Francisco','Henrique','João Pedro','Martim','Tomás','Rodrigo','Afonso','Duarte','Gonçalo','Lourenço','Miguel','Pedro','Rafael','Santiago','Tiago','Vasco','Gustavo','Leonardo','Salvador','Guilherme','Simão','Rúben','Nuno','André','Filipe','Hugo','Ivo','Luís'];
  const AP=['Medeiros','Costa','Pacheco','Furtado','Rocha Sousa','Melo','Arruda','Raposo','Cabral','Tavares','Faria','Botelho','Câmara','Bettencourt','Silveira','Ávila','Leite','Vieira','Machado','Moniz','Resendes','Sousa','Amaral','Pimentel','Toste','Brum','Goulart','Dutra','Freitas','Ponte'];
  const PAR=['Mãe','Pai','Mãe','Avó','Mãe','Pai'];let ki=0;
  const mkAl=(t,n,g)=>{const nome=(g==='F'?NF:NM)[(ki*7)%30]+' '+AP[(ki*11)%30];ki++;const al=novoAluno(t,nome);al.genero=g;al.generoManual=true;al.num=n;al.processo=String(2400+ki*7);const ano=+(t.anoEsc||'10').replace(/\D/g,'')||10;al.nasc=isoD(y-ano-5-(ki%9===0?1:0),1+ki%12,1+ki*3%27);
    al.eeNome=(PAR[ki%6]==='Pai'||PAR[ki%6]==='Avô'?NM:NF)[(ki*5)%30].split(' ')[0]+' '+AP[(ki*11)%30];al.eeParent=PAR[ki%6];al.eeContacto='9'+(10000000+ki*7919%89999999).toString().slice(0,8);al.email=normT(al.eeNome).replace(/\s+/g,'.')+'@exemplo.pt';al.contactoAutorizado=true;
    if(ki%9===0)al.repetente=true;if(ki%5===0)al.ase=ki%10===0?'A':'B';al._cap=Math.max(.3,Math.min(.97,.44+rnd()*.52));al._off=[0,1,2,3,4,5].map(()=>(rnd()-.5)*.3);return al};
  const DEF=[{nome:'7.º A',anoEsc:'7.º',ciclo:'3c',oferta:'regular',disc:'Inglês',n:20},{nome:'7.º A',anoEsc:'7.º',ciclo:'3c',oferta:'regular',disc:'Português',n:20,irma:0},{nome:'9.º B',anoEsc:'9.º',ciclo:'3c',oferta:'regular',disc:'Inglês',n:18},
    {nome:'10.º A',anoEsc:'10.º',ciclo:'sec',oferta:'regular',disc:'Inglês',n:16},{nome:'11.º B/C',anoEsc:'11.º',ciclo:'sec',oferta:'regular',disc:'Inglês',n:14,orig:['11.º B','11.º C']},{nome:'PROFIJ II',anoEsc:'9.º',ciclo:'3c',oferta:'profij',disc:'Inglês',n:10}];
  DEF.forEach((o,ix)=>{const t={id:uid(),nome:o.nome,anoEsc:o.anoEsc,ciclo:o.ciclo,oferta:o.oferta,disciplina:o.disc,dominios:mkDominiosDisc(o.disc,o.ciclo,o.oferta),mencoes:MENCOES_DEF.map(m=>({...m})),regra:{2:'media',3:'media'},alunos:[],instrumentos:[],delegados:{}};
    if(o.orig)t.origens=o.orig.slice();
    if(o.irma!=null){const b=a.turmas[o.irma];t.alunos=b.alunos.map(x=>{const c=JSON.parse(JSON.stringify(x));c.id=uid()+Math.random().toString(36).slice(2,6);delete c.cid;c._cap=Math.max(.2,Math.min(.97,x._cap+(rnd()-.5)*.25));c._off=[0,1,2,3,4,5].map(()=>(rnd()-.5)*.3);return c})}
    else for(let k=0;k<o.n;k++){const al=mkAl(t,k+1,k%2?'M':'F');if(o.orig){al.origem=o.orig[k%2];al.numOrig=Math.floor(k/2)+1}t.alunos.push(al)}
    if(o.orig){t.alunos.sort((p,q)=>p.nome.localeCompare(q.nome,'pt'));t.alunos.forEach((x,k)=>x.num=k+1)}
    if(o.oferta==='profij'){t.modulos=[{id:uid()+'m1',cod:'UFCD 6658',nome:'Comunicar em inglês — contextos profissionais',horas:50,ini:'',fim:''},{id:uid()+'m2',cod:'UFCD 6659',nome:'Inglês técnico — logística',horas:50,ini:'',fim:''}]}
    t.alunos.forEach((x,k)=>{if(k===2||k===11)x.medidas={univ:[0,1],selet:k===2?[3]:[],adic:[]};if(k===2)x.acomod=[9,1]});
    const per1=d=>periodoDaData(a,d)||1;const doms=t.dominios;
    const mkI=(nome,tipo,data,cfg)=>{cfg=cfg||{};const its=[];doms.forEach((dm,q)=>{const n=cfg.its||(tipo==='Questão-aula'?1:2);for(let j=0;j<n;j++)its.push({id:uid()+q+'_'+j,rot:(q+1)+(n>1?'.'+(j+1):''),dom:dm.id,cot:cfg.cot||(tipo==='Questão-aula'?10:Math.round(100/doms.length/n*2)/2)})});
      const i={id:uid(),nome,tipo,periodo:per1(data),data,itens:its,notas:{}};if(t.modulos&&cfg.mod!=null)i.modulo=t.modulos[cfg.mod].id;
      if(cfg.notas!==false){t.alunos.forEach((x,q)=>{if(cfg.semAlguns&&q%7===3)return;if(cfg.faltou&&q===4){i.nr={[x.id]:1};return}const n={};its.forEach((it,w)=>{const di=doms.findIndex(z=>z.id===it.dom);const dl=((w*13+q*7)%11-5)/50+(cfg.dif||0)+((x._off||[])[di]||0)+[.04,-.06,.02,-.03,.05,-.02][di%6];const v=Math.max(0,Math.min(1,x._cap+dl+(rnd()-.5)*.18));n[it.id]=Math.round(v*it.cot*2)/2});if(cfg.branco&&q===5)n[its[its.length-1].id]='';i.notas[x.id]=n})}
      if(cfg.naoReal)i.naoReal=true;t.instrumentos.push(i);return i};
    mkI('Avaliação diagnóstica','Avaliação Diagnóstica',dd(-48),{its:1,cot:20,dif:-.05});
    const t1=mkI('Teste 1','Teste de Avaliação',dd(-26),{faltou:true,branco:true,mod:0});
    t1.anexos={enunciado:{id:guardarDoc('data:text/plain;base64,'+btoa(unescape(encodeURIComponent('Enunciado de exemplo — '+t.nome+' · '+t.disciplina+'\n\nGrupo I — Compreensão\n1. ...\n\nGrupo II — Produção\n2. ...')))),nome:'Enunciado Teste 1 ('+t.nome+').txt',tipo:'text/plain',tam:180,q:Date.now()}};
    mkI('Apresentação oral','Apresentação Oral',dd(-15),{its:1,cot:20});
    mkI('Questão-aula 1','Questão-aula',dd(-9),{semAlguns:true});
    mkI('Ficha de trabalho','Ficha de Trabalho',dd(-3),{notas:false});
    if(ix===0)mkI('Questão-aula 2','Questão-aula',dd(-6),{notas:false,naoReal:true});
    mkI('Teste 2','Teste de Avaliação',dd(13),{notas:false,mod:1});
    a.turmas.push(t)});
  const [tA,tAP,tB,t10,t11,tP]=a.turmas;
  /* horário do professor: 1 tempo = 45 min */
  const SL=[495,540,600,645,705,810,855,915];const tm=x=>({ini:x,fim:x+45});
  const HA=[[tA,'ING',[[1,0],[1,1],[3,2]],'2.08'],[tAP,'PORT',[[2,0],[2,1],[4,2],[4,3]],'2.08'],[tB,'ING',[[1,2],[1,3],[4,5]],'2.10'],[t10,'ING',[[2,2],[2,3],[5,0]],'2.17'],[t11,'ING',[[3,5],[3,6],[5,2]],'2.17'],[tP,'ING',[[4,6],[4,7],[5,3]],'2.14']];
  a.horProf={ficheiro:'(demonstração)',docente:S.cfg.professor||'',aulas:[],linhas:SL.map(tm),obs:[],obsMap:{},mapa:{}};
  HA.forEach(([t,sig,L,sala])=>L.forEach(([dia,s_])=>{const x={dia,...tm(SL[s_]),turma:t.nome,sig,sala};a.horProf.aulas.push(x);a.horProf.mapa[chaveAula(x)]=t.id}));
  a.naoLetivos=[{dia:1,s:4,sig:'DT',nome:'Direção de Turma'},{dia:3,s:4,sig:'DT-AP',nome:'Direção de Turma — Atendimento'},{dia:2,s:5,sig:'Biblioteca',nome:'Biblioteca'},{dia:2,s:6,sig:'Biblioteca',nome:'Biblioteca'},{dia:5,s:4,sig:'Apoio',nome:'Apoio a alunos'}].map(n=>({id:uid(),g:n.sig==='Biblioteca'?'bib':uid(),dia:n.dia,...tm(SL[n.s]),sig:n.sig,nome:n.nome,sala:n.sig==='Biblioteca'?'Biblioteca':'S-DT1',obs:'',origem:'manual'}));
  a.dt=[normTurma('7.º A')];
  /* falta do professor e reposição */
  a.faltasProf=[];a.reposicoes=[];
  /* sumários, chamada, faltas, atrasos, material, ocorrências */
  const SUMS=['Apresentação da disciplina e dos critérios de avaliação.','Avaliação diagnóstica.','Correção da avaliação diagnóstica. Revisões.','Leitura e interpretação de texto.','Vocabulário: a escola e a família.','Exercícios de compreensão oral.','Gramática: tempos verbais.','Produção escrita: texto descritivo.','Preparação do teste de avaliação.','Teste de avaliação.','Correção do teste de avaliação.','Apresentações orais em grupo.','Leitura orientada.','Questão-aula.','Atividades de consolidação.'];
  a.turmas.forEach((t,ix)=>{let L=[];try{L=listaAulas(t,a)}catch(_){}const P=L.filter(x=>x.passada&&x.licao);const SM=sumariosT(a,t);
    if(ix===0&&P.length>6){const x=P[P.length-6];const f={id:uid(),turma:t.id,data:x.data,motivo:'Ação de formação',tempos:1,obs:''};a.faltasProf.push(f);a.reposicoes.push({id:uid(),turma:t.id,data:dd(4),hora:'16:15',tempos:1,sala:'2.08',obs:'Reposição da aula de '+fmtIso(x.data),ref:x.data})}
    try{L=listaAulas(t,a)}catch(_){}const Q=L.filter(x=>x.passada&&x.licao&&!x.repos);
    Q.forEach((x,k)=>{const ult=k>=Q.length-2;const s={texto:ult&&k===Q.length-1?'':SUMS[k%SUMS.length],pres:{}};
      alunosAval(t).forEach((al,q)=>{const r=(k*31+q*17+ix*7)%97;const p={};if(r<4)p.f='F';if(r===4&&q%5===1)p.f='FD';if(p.f==='F'&&(k+q)%3===0)p.j=true;if(r>90)p.at=true;if(r>=86&&r<=88)p.fm=true;if(r===50)p.oc={n:'positiva',t:'Participação muito ativa'};if(r===51&&q%2)p.oc={n:'leve',t:'Conversa durante a aula'};if(Object.keys(p).length)s.pres[al.id]=p});
      if(!ult)s.cham=Date.now()-(Q.length-k)*864e5;if(k===Q.length-3)s.dif='Confusão entre o present simple e o present continuous';if(k===Q.length-3)s.prox='Corrigir o exercício 3 e rever o vocabulário';
      SM[x.k]=s;Object.entries(s.pres).forEach(([aid,p])=>{try{sincFaltasAula(t,x,aid,p)}catch(_){}})});
    const nx=L.find(x=>!x.passada);if(nx)SM[nx.k]={...(SM[nx.k]||{}),texto:'Plano: revisões para o Teste 2; trabalho de pares.',partida:'Corrigir o exercício 3 e rever o vocabulário'}});
  /* avaliação intercalar */
  a.intercalar={periodos:[1,2]};a.datasAval=a.datasAval||[];a.datasAval.push({id:uid(),tipo:'intercalar',per:1,data:dd(-14),fim:dd(-10),titulo:'Avaliação intercalar do 1.º período',turma:null});
  [tA,tAP,tB].forEach(t=>{const R=t.interc={p1:{}}.p1;t.interc={p1:R};alunosAval(t).forEach((x,k)=>{if(t===tB&&k>12)return;const f=ponderada(t,pctsPer(t,x.id,1));const q=f==null?null:Math.round(f*100);R[x.id]=k===7?{sem:true,m:'',obs:'',q:Date.now()}:{sem:false,m:q==null?'Apenas Descritiva':q<50?'Insuficiente':q<70?'Suficiente':q<90?'Bom':'Muito Bom',obs:q!=null&&q<50?'Precisa de estudar com mais regularidade e de realizar os trabalhos de casa.':k%6===0?'Participa de forma empenhada.':'',q:Date.now()}})});
  /* reuniões */
  const rCT={id:uid(),tipo:'ct',titulo:'',data:dd(-12),ini:17*60,fim:18*60+30,local:'Sala de reuniões',link:'',turmas:[tA.id],turma:null,convocante:'Diretor(a)',participantes:'Conselho de Turma do 7.º A',lembretes:[1440],ordem:[{t:'Avaliação intercalar',feito:true},{t:'Alunos com dificuldades',feito:true},{t:'Outros assuntos',feito:true}],prep:[],notas:'Analisada a avaliação intercalar. Identificados alunos a acompanhar. Combinada a comunicação aos encarregados de educação.',
    decisoes:[{id:uid(),t:'Contactar o EE do '+tA.alunos[1].nome.split(' ')[0]+' sobre as faltas',resp:'Diretor de turma',prazo:dd(-2),ok:false},{id:uid(),t:'Plano de estudo para '+tA.alunos[2].nome.split(' ')[0],resp:'Conselho de Turma',prazo:dd(5),ok:false},{id:uid(),t:'Enviar as menções intercalares aos EE',resp:'Diretor de turma',prazo:dd(-8),ok:true}],estado:'realizada'};
  const rCT2={...JSON.parse(JSON.stringify(rCT)),id:uid(),data:dd(-11),turmas:[tB.id],participantes:'Conselho de Turma do 9.º B',decisoes:[{id:uid(),t:'Reforçar o apoio a Inglês',resp:'Professor de Inglês',prazo:dd(10),ok:false}]};
  const fimP1=(a.calendario.periodos[0]||{}).fim||dd(40);
  a.reunioes=[rCT,rCT2,{id:uid(),tipo:'avl',titulo:'',data:fimP1>hj?fimP1:dd(30),ini:14*60,fim:16*60,local:'Sala de reuniões',link:'',turmas:[tA.id],turma:null,convocante:'',participantes:'',lembretes:[1440,60],ordem:[{t:'Avaliação do 1.º período',feito:false}],prep:[{t:'Lançar as classificações',ok:false},{t:'Rever as sínteses descritivas',ok:false}],notas:'',decisoes:[],estado:'agendada'},
    {id:uid(),tipo:'dep',titulo:'Departamento de Línguas',data:dd(6),ini:17*60+15,fim:18*60+45,local:'Biblioteca',link:'',turmas:[],turma:null,convocante:'Coordenador(a)',participantes:'',lembretes:[1440],ordem:[{t:'Planificações',feito:false},{t:'Critérios de avaliação',feito:false}],prep:[],notas:'',decisoes:[],estado:'agendada'},
    {id:uid(),tipo:'grupo',titulo:'Grupo de Inglês',data:dd(-20),ini:17*60,fim:18*60,local:'Sala 2.17',link:'',turmas:[],turma:null,convocante:'',participantes:'',lembretes:[],ordem:[],prep:[],notas:'Aferidas as matrizes do Teste 1.',decisoes:[{id:uid(),t:'Partilhar a matriz do Teste 2',resp:'Todos',prazo:dd(3),ok:false}],estado:'realizada'}];
  /* tarefas e contactos com o EE */
  S.todo=S.todo||[];S.todo.push({id:uid(),t:'Corrigir a ficha de trabalho do 7.º A',prazo:dd(2),feito:false,criada:Date.now()},{id:uid(),t:'Preparar a matriz do Teste 2 (10.º A)',prazo:dd(5),feito:false,criada:Date.now()},{id:uid(),t:'Entregar a planificação ao departamento',prazo:dd(-4),feito:true,criada:Date.now()});
  try{sincComuns(a)}catch(_){}
  const ce=(t,k,o)=>{const x=t.alunos[k];const L=contactosEE(a,x.cid);const c={id:uid(),data:o.data,meio:o.meio,assunto:o.assunto,sintese:o.sintese,compromisso:o.compromisso||'',acomp:o.acomp||'',disc:t.disciplina,turma:t.nome,autor:S.cfg.professor||'',criado:Date.now()};
    if(o.acomp){const tk={id:uid(),t:'Acompanhar contacto com o EE de '+x.nome.split(' ')[0]+' ('+t.nome+'): '+o.assunto,prazo:o.acomp,feito:false,criada:Date.now(),orig:{tipo:'contactoEE',cid:x.cid,cont:c.id}};S.todo.push(tk);c.tarefa=tk.id}L.unshift(c)};
  ce(tA,2,{data:dd(-7),meio:'Presencial',assunto:'Aproveitamento',sintese:'Reunião com a mãe sobre as dificuldades em Inglês e Português. Explicadas as medidas de apoio.',compromisso:'A mãe vai acompanhar o estudo diário; o aluno passa a frequentar o apoio.',acomp:dd(7)});
  ce(tA,5,{data:dd(-4),meio:'Telefone',assunto:'Assiduidade',sintese:'Informado o pai das faltas injustificadas.',compromisso:'Justificar as faltas até sexta-feira.',acomp:dd(-1)});
  ce(tB,1,{data:dd(-2),meio:'E-mail',assunto:'Informação intercalar',sintese:'Enviada a informação intercalar e marcado atendimento.'});
  /* fotografia do CT do 7.º A (estado da altura, para comparar) */
  try{const f=ctFotografar(tA,a,rCT);Object.values(f.al).forEach((o,k)=>{Object.keys(o.n).forEach(d=>{if(k%4===0)o.n[d]=Math.min(1,o.n[d]+.08);if(k%5===1)o.n[d]=Math.max(0,o.n[d]-.07);if(k===2)o.n[d]=Math.max(0,o.n[d]-.12)});Object.keys(o.f).forEach(d=>{o.f[d]=Math.max(0,o.f[d]-(k%3===0?1:0))});o.ce=Math.max(0,o.ce-1)})}catch(e){console.warn(e)}
  a.turmas.forEach(t=>t.alunos.forEach(x=>{delete x._cap;delete x._off}));
  S.esquema=ESQUEMA();S.turmaAtiva=tA.id;saveNow();toast('Demonstração criada: 6 turmas (3.º ciclo, secundário, turma conjunta e PROFIJ) com exemplos de tudo','ok');go('inicio')}

