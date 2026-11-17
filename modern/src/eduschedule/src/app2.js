/* ===== interface (parte 2: painel, dados da escola, aulas, serviço, requisitos, prioridades) ===== */
PAGES.inicio=function(m){
  const rep=REP(),is=ISS(),ix=IX(),pct=rep.total?Math.floor(rep.placed/rep.total*100):0;
  m.append(pageHead('Painel',S.name+' · '+S.ano));
  if(S.example)m.append(note('info','Escola de exemplo com dados inventados. Substitua-os em Dados da escola, ou comece do zero em Ficheiro.'));
  if(S.teste)m.append(note('info','Escola de teste gerada automaticamente para medir o motor de otimização. Abra Otimização e carregue em Otimizar.'));
  const stat=(title,value,desc,cls)=>h('div',{class:'stat bg-base-100 border border-base-300 rounded-box p-4'},h('div',{class:'stat-title'},title),h('div',{class:'stat-value text-2xl fd '+(cls||'')},value),desc?h('div',{class:'stat-desc whitespace-normal'},desc):null);
  m.append(h('div',{class:'grid grid-cols-2 lg:grid-cols-4 gap-3'},
    stat('Turmas',String(S.classes.length),S.rooms.length+' salas'),
    stat('Professores',String(S.teachers.length),ix.free.length?ix.free.length+' linhas de aula sem professor':'serviço distribuído'),
    stat('Aulas',String(S.lessons.length),rep.total+' tempos letivos por semana'),
    h('div',{class:'stat bg-base-100 border border-base-300 rounded-box p-4'},h('div',{class:'stat-title'},'Tempos colocados'),h('div',{class:'stat-value text-2xl fd'},pct+'%'),
      h('progress',{class:'progress progress-primary w-full mt-1',value:rep.placed,max:Math.max(1,rep.total),'aria-label':'Tempos colocados'}),h('div',{class:'stat-desc'},rep.placed+' de '+rep.total)),
    stat('Conflitos',String(rep.clash+rep.blocked),'sobreposições e tempos impedidos',rep.clash+rep.blocked?'text-error':'text-success'),
    stat('Furos nas turmas',String(rep.gapsC),'tempos livres entre aulas',rep.gapsC?'text-warning':'text-success'),
    stat('Furos nos professores',String(rep.gapsT),S.teachers.length?(rep.gapsT/S.teachers.length).toFixed(1)+' por professor':''),
    stat('Avisos',String(is.warn),is.bad+' erros por resolver',is.bad?'text-error':'')));
  const reqN=Object.keys(S.off).length,wCustom=Object.keys(W0).some(k=>S.w[k]!==W0[k]);
  const steps=[
    ['dados','Grelha semanal e dados da escola',S.days.length+' dias × '+S.periods.length+' tempos · '+S.classes.length+' turmas, '+S.teachers.length+' professores, '+S.rooms.length+' salas, '+S.subjects.length+' disciplinas',S.classes.length&&S.subjects.length?'ok':'todo'],
    ['aulas','Aulas: o currículo de cada turma',S.lessons.length+' aulas, '+rep.total+' TL por semana',S.lessons.length?'ok':'todo'],
    ['servico','Distribuição de serviço docente',ix.free.length?ix.free.length+' linhas de aula ainda sem professor':'todas as aulas têm professor',S.lessons.length?(ix.free.length?'warn':'ok'):'todo'],
    ['requisitos','Disponibilidades',reqN?reqN+' elementos com disponibilidades definidas':'ainda sem requisitos (opcional)',reqN?'ok':'opt'],
    ['ponderacoes','Prioridades',wCustom?'valores personalizados':'valores iniciais',wCustom?'ok':'opt'],
    ['otimizacao','Otimização',rep.placed+' de '+rep.total+' TL colocados',rep.total&&rep.placed===rep.total?'ok':rep.placed?'warn':'todo'],
    ['diagnostico','Diagnóstico',is.bad+' erros, '+is.warn+' avisos',is.bad?'bad':is.warn?'warn':'ok'],
    ['impressao','Imprimir e exportar','horários de turmas, professores e salas; ficheiros para outros programas','opt']];
  const dot={ok:'status-success',warn:'status-warning',bad:'status-error',todo:'status-neutral',opt:'status-info'};
  m.append(panel('Passos do trabalho',h('ul',{class:'list'},steps.map((s,i)=>h('li',{class:'list-row items-center'},
    h('span',{class:'fd font-bold opacity-50 num w-5'},String(i+1)),
    h('div',{class:'list-col-grow'},h('div',{class:'font-medium flex items-center gap-2'},h('span',{class:'status '+dot[s[3]],'aria-hidden':'true'}),s[1]),h('div',{class:'text-xs opacity-70'},s[2])),
    h('a',{href:'#'+s[0],class:'btn btn-sm btn-ghost'},'Abrir'))))));
};

/* ---------- dados da escola ---------- */
function removeEntity(key,id){
  S[key]=S[key].filter(x=>x.id!==id);
  if(key==='classes')S.lessons.forEach(l=>{const had=l.classIds.length;l.classIds=l.classIds.filter(i=>i!==id);if(had&&!l.classIds.length)l.linhas=[];});
  if(key==='teachers'){S.lessons.forEach(l=>l.linhas.forEach(ln=>{if(ln.t===id)ln.t='';}));S.classes.forEach(c=>{if(c.dt===id)c.dt='';});S.reunioes.forEach(r=>r.teacherIds=r.teacherIds.filter(i=>i!==id));for(const k in S.vig)if(S.vig[k]===id)delete S.vig[k];}
  if(key==='rooms'){S.lessons.forEach(l=>l.linhas.forEach(ln=>{if(ln.r===id)ln.r='';}));S.classes.concat(S.subjects).forEach(x=>{if(x.roomId===id)x.roomId='';});S.rooms.forEach(r=>{if(r.alt===id)r.alt='';});S.cards.forEach(c=>delete c.r);}
  if(key==='subjects')S.lessons.forEach(l=>l.linhas=l.linhas.filter(ln=>ln.s!==id));
  S.lessons=S.lessons.filter(l=>l.linhas.length&&(l.classIds.length||l.linhas.some(ln=>ln.t)));
  delete S.off[key[0]+':'+id];
}
PAGES.dados=function(m){
  const R=()=>S.rooms,T=()=>S.teachers;
  const defs={
    classes:{t:'Turmas',one:'turma',cols:[['name','Código','text'],['full','Nome completo','text'],['roomId','Sala fixa','sel',R],['dt','Diretor de turma','sel',T],['minDay','TL/dia mín.','number'],['maxDay','TL/dia máx.','number'],['tardesLivres','Tardes livres','number'],['maxDisc','Máx. disciplinas/dia','number'],['alunos','N.º de alunos','number'],['dtDias','Dias com o DT','number'],['grelha','Grelha de tempos','sel',()=>S.grelhas.map(g=>({id:g.id,name:g.nome}))],['fse','N.º de projeto FSE','text'],['dep','Departamento ou escola','text']],
      mk:()=>({name:'Nova',full:'',roomId:'',dt:'',minDay:0,maxDay:7,tardesLivres:0,maxDisc:0,dep:''})},
    teachers:{t:'Professores',one:'professor',cols:[['short','Código','text'],['name','Nome','text'],['proc','N.º processo','text'],['prev','TL previstos','number'],['minDay','Mín. TL/dia','number'],['maxDay','Máx. TL/dia','number'],['bolsa','Bolsa de substituições (TL/sem.)','number'],['de','Entra em','date'],['ate','Sai em','date'],['furosMin','Furos mín.','number'],['furosMax','Furos máx.','number'],['maxSeg','Máx. seguidos','number'],['maxSpan','Máx. tempos na escola','number'],['umTurno','Um só turno','check'],['diasLivres','Dias livres','number'],['dep','Departamento','text']],
      mk:()=>({name:'Novo professor',short:'NOVO',proc:'',prev:22,maxDay:6,maxSeg:0,maxSpan:0,umTurno:false,diasLivres:0,dep:''})},
    rooms:{t:'Salas',one:'sala',cols:[['name','Nome','text'],['alt','Sala alternativa','sel',R],['ed','Edifício','text'],['cap','Capacidade','number']],mk:()=>({name:'Nova sala',alt:'',ed:''})},
    subjects:{t:'Disciplinas',one:'disciplina',cols:[['short','Código','text'],['name','Nome completo','text'],['color','Cor','color'],['roomId','Sala específica','sel',R],['fator','Fator (min/TL)','number'],['seq','Sequência','text'],['marg','Só nas pontas do dia','check'],['opc','Opcional','check'],['cnl','CNL','check']],
      mk:()=>({name:'Nova disciplina',short:'NOVA',color:'#2f6fd6',roomId:'',fator:S.tlMin,seq:'',marg:false,cnl:false})}};
  m.append(pageHead('Dados da escola','Turmas, professores, salas, disciplinas e a grelha semanal.'));
  m.append(tabsEl([['classes','Turmas'],['teachers','Professores'],['rooms','Salas'],['subjects','Disciplinas'],['grid','Grelha semanal'],['cal','Calendário escolar']],ui.dataTab,k=>{ui.dataTab=k;render();},'Tipo de dados'));
  if(ui.dataTab==='cal'){
    const din=(o,k,id)=>h('input',{type:'date',id,class:'input input-sm',value:o[k]||'','aria-label':k,disabled:busy,onchange:e=>mutate(()=>{o[k]=e.target.value;})});
    m.append(panel('Calendário escolar',
      h('div',{class:'flex flex-wrap gap-4'},field('Início do ano letivo',din(S,'inicio','cal-ini')),field('Fim do ano letivo',din(S,'fim','cal-fim'))),
      tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},['Férias, feriado ou interrupção','De','Até',''].map(t=>h('th',{},t)))),
        h('tbody',{},S.ferias.map(f=>h('tr',{},h('td',{},h('input',{type:'text',id:'fe-n-'+f.id,class:'input input-sm w-full min-w-40',value:f.nome||'','aria-label':'Nome',disabled:busy,onchange:e=>mutate(()=>{f.nome=e.target.value;})})),
          h('td',{},din(f,'de','fe-de-'+f.id)),h('td',{},din(f,'ate','fe-ate-'+f.id)),h('td',{},btn('Apagar',()=>mutate(()=>{S.ferias=S.ferias.filter(x=>x!==f);}),'btn-sm btn-ghost text-error'))))))),
      h('div',{class:'flex flex-wrap items-center gap-3'},btn('Acrescentar',()=>mutate(()=>S.ferias.push({id:uid(),nome:'Feriado',de:'',ate:''})),'btn-primary btn-sm'),h('span',{class:'text-sm opacity-70'},'Usado nas Substituições e nas datas das exportações.'))));
    return;
  }
  if(ui.dataTab==='grid'){
    const pin=(p,i,k,type)=>h('input',{type,id:'pg-'+k+'-'+i,class:'input input-sm '+(type==='text'?'w-20':'w-28'),value:p[k]||'','aria-label':k,disabled:busy,onchange:e=>mutate(()=>{p[k]=e.target.value;})});
    const perOpts=[['0','—']].concat(S.periods.map((p,i)=>[String(i+1),p.label]));
    const alm=k=>selEl('pg-al-'+k,String(S.almoco[k]||0),perOpts,v=>mutate(()=>{S.almoco[k]=+v;if(S.almoco.ate<S.almoco.de)S.almoco.ate=S.almoco.de;if(!S.almoco.de)S.almoco.ate=0;}),'Almoço');
    m.append(panel('Grelha semanal',
      h('div',{class:'flex flex-wrap gap-4 items-end'},
        field('Dias letivos por semana',selEl('pg-days',String(S.days.length),[['5','Segunda a sexta'],['6','Segunda a sábado']],v=>mutate(()=>{S.days=DIAS.slice(0,+v);}),'Dias letivos')),
        field('Duração do TL (min)',h('input',{type:'number',id:'pg-tlmin',class:'input input-sm w-24',min:20,max:120,value:S.tlMin,disabled:busy,onchange:e=>mutate(()=>{S.tlMin=+e.target.value||50;})})),
        field('Primeiro tempo da tarde',selEl('pg-tarde',String(S.tarde||0),[['0','Automático ('+(tardeIdx(S)<S.periods.length?S.periods[tardeIdx(S)].label+'.º':'sem tarde')+')']].concat(S.periods.map((p,i)=>[String(i+1),p.label+'.º tempo'])),v=>mutate(()=>{S.tarde=+v;}),'Primeiro tempo da tarde')),
        field('Ciclo de semanas',selEl('pg-ciclo',String(cicloK(S)),[['2','2 semanas (A e B)'],['3','3 semanas'],['4','4 semanas']],v=>mutate(()=>{S.ciclo=+v;}),'Ciclo de semanas'),'Para aulas que não são todas as semanas'),
        field('Almoço entre o TL',alm('de')),field('e o TL',alm('ate')),
        field('Máx. de turmas a almoçar ao mesmo tempo',h('input',{type:'number',id:'pg-almax',class:'input input-sm w-24',min:0,max:500,value:S.almocoMax||0,disabled:busy,onchange:e=>mutate(()=>{S.almocoMax=+e.target.value||0;})}),'0 = sem limite')),
      tableWrap(h('table',{class:'table table-sm w-auto'},h('thead',{},h('tr',{},['TL','Início','Fim','Intervalo a seguir'].map(t=>h('th',{},t)))),
        h('tbody',{},S.periods.map((p,i)=>h('tr',{},h('td',{},pin(p,i,'label','text')),h('td',{},pin(p,i,'start','time')),h('td',{},pin(p,i,'end','time')),
          h('td',{},h('input',{type:'checkbox',id:'pg-brk-'+i,class:'checkbox checkbox-sm','aria-label':'Intervalo depois do TL '+p.label,checked:p.breakAfter,disabled:busy,onchange:e=>mutate(()=>{p.breakAfter=e.target.checked;})}))))))),
      h('div',{class:'flex flex-wrap items-center gap-3'},btn('Acrescentar TL',()=>mutate(()=>{S.periods.push({label:String(S.periods.length+1),start:'',end:'',breakAfter:false});S.grelhas.forEach(g=>g.periods.push({start:'',end:''}));}),'btn-sm',{disabled:busy||S.periods.length>=16}),
        btn('Remover o último TL',()=>mutate(()=>{S.periods.pop();S.grelhas.forEach(g=>g.periods.pop());}),'btn-sm btn-ghost text-error',{disabled:busy||S.periods.length<2}),
        h('span',{class:'text-sm opacity-70'},'Os blocos e os TL duplos nunca atravessam um intervalo; marque também a hora de almoço como intervalo. Se o almoço ocupa tempos da grelha, indique-os acima: a otimização deixa pelo menos um livre.'))));
    const gin=(g,i,k)=>h('input',{type:'time',id:'gg-'+g.id+'-'+k+'-'+i,class:'input input-xs w-24','aria-label':(k==='start'?'Início':'Fim')+' do TL '+S.periods[i].label,value:g.periods[i][k]||'',disabled:busy,onchange:e=>mutate(()=>{g.periods[i][k]=e.target.value;})});
    m.append(panel('Grelhas alternativas',h('span',{class:'text-sm opacity-70'},'Para turmas, ciclos ou edifícios com horas diferentes, ao minuto. Atribua a grelha em Turmas. A otimização compara as horas reais: um professor ou uma sala nunca ficam em duas aulas que se sobreponham em minutos, mesmo em grelhas diferentes.'),
      S.grelhas.map(g=>h('div',{class:'border border-base-300 rounded-box p-3 flex flex-col gap-2'},h('div',{class:'flex flex-wrap items-center gap-2'},h('input',{type:'text',id:'gg-n-'+g.id,class:'input input-sm w-56','aria-label':'Nome da grelha',value:g.nome,disabled:busy,onchange:e=>mutate(()=>{g.nome=e.target.value.trim()||'Grelha';})}),
          badge(S.classes.filter(c=>c.grelha===g.id).length+' turmas','mute'),g.periods.some(p=>!p.start||!p.end)?badge('faltam horas: a grelha ainda não é usada','warn'):null,h('span',{class:'grow'}),btn('Apagar',()=>mutate(()=>{S.grelhas=S.grelhas.filter(x=>x!==g);S.classes.forEach(c=>{if(c.grelha===g.id)c.grelha='';});}),'btn-sm btn-ghost text-error',{disabled:busy})),
        tableWrap(h('table',{class:'table table-xs w-auto'},h('thead',{},h('tr',{},h('th',{},'TL'),S.periods.map(p=>h('th',{},p.label)))),h('tbody',{},h('tr',{},h('th',{},'Início'),g.periods.map((p,i)=>h('td',{},gin(g,i,'start')))),h('tr',{},h('th',{},'Fim'),g.periods.map((p,i)=>h('td',{},gin(g,i,'end'))))))))),
      h('div',{},btn('Nova grelha (cópia da principal)',()=>mutate(()=>{S.grelhas.push({id:uid(),nome:'Grelha '+(S.grelhas.length+2),periods:S.periods.map(p=>({start:p.start||'',end:p.end||''}))});}),'btn-sm',{disabled:busy}))));
    return;
  }
  const key=ui.dataTab,def=defs[key],kind=key[0],mdl=M();
  const rows=S[key].filter(x=>matchQ(key,[x.name,x.short,x.full,x.dep]));
  const pg=pager(key,rows.length,25),se=ui.serie[key]||(ui.serie[key]={col:'',val:''});
  const subjTL=new Map();if(key==='subjects')for(const l of S.lessons)for(const s of uniq(l.linhas.map(ln=>ln.s)))subjTL.set(s,(subjTL.get(s)||0)+l.tl);
  const loadOf=x=>{if(key==='subjects')return subjTL.get(x.id)||0;const r=mdl.resIdx(kind,x.id);let n=0;for(const a of mdl.cardsOf(r)){if(kind==='r'&&mdl.posOf(a)<0)continue;n+=S.cards[a].len;}return n;};
  const ctl=(c,value,id,set,lbl)=>{
    if(c[2]==='sel')return selEl(id,value||'',optsOf(c[3](),'—'),set,lbl,'max-w-44');
    if(c[2]==='check')return h('input',{type:'checkbox',id,class:'checkbox checkbox-sm','aria-label':lbl,checked:value,disabled:busy,onchange:e=>set(e.target.checked)});
    if(c[2]==='color')return h('input',{type:'color',id,class:'w-9 h-8 rounded border border-base-300 bg-base-100 p-0','aria-label':lbl,value:col(value),disabled:busy,onchange:e=>set(e.target.value)});
    return h('input',{type:c[2],id,class:'input input-sm '+(c[2]==='number'?'w-20':'w-full min-w-28'),value:value==null?'':value,'aria-label':lbl,min:c[2]==='number'?0:null,max:c[2]==='number'?999:null,disabled:busy,onchange:e=>set(c[2]==='number'?(+e.target.value||0):e.target.value)});
  };
  const sc=def.cols.find(c=>c[0]===se.col);
  m.append(panel(null,
    h('div',{class:'flex flex-wrap items-center gap-2'},searchEl(key,'Procurar '+def.t.toLowerCase()),h('span',{class:'text-sm opacity-70'},rows.length+' de '+S[key].length),h('span',{class:'grow'}),pg.el,
      btn('Acrescentar '+def.one,()=>{ui.q[key]='';ui.pg[key]=1e9;mutate(()=>S[key].push(Object.assign({id:uid()},def.mk())));},'btn-primary btn-sm',{disabled:busy})),
    tableWrap(h('table',{class:'table table-sm'},
      h('thead',{},h('tr',{},def.cols.map(c=>h('th',{},c[1])),h('th',{class:'num'},key==='rooms'?'TL ocupados':'TL/semana'),h('th',{}))),
      h('tbody',{},rows.slice(pg.from,pg.to).map(x=>h('tr',{},def.cols.map(c=>h('td',{},ctl(c,x[c[0]],'d-'+key+'-'+x.id+'-'+c[0],v=>mutate(()=>{x[c[0]]=v;}),c[1]))),
        h('td',{class:'num'},String(loadOf(x))),
        h('td',{},btn('Apagar',()=>{mutate(()=>removeEntity(key,x.id));toast('Apagado, com as aulas que dependiam dele.','Anular',desfazer);},'btn-sm btn-ghost text-error',{disabled:busy})))),
        rows.length?null:h('tr',{},h('td',{colspan:def.cols.length+2,class:'opacity-60'},'Nada para mostrar.'))))),
    h('div',{class:'flex flex-wrap items-center gap-2 border-t border-base-300 pt-3'},h('span',{class:'text-sm font-medium'},'Modificação em série'),
      selEl('se-col-'+key,se.col,[['','Escolher o campo…']].concat(def.cols.filter(c=>!['name','short','full','proc'].includes(c[0])).map(c=>[c[0],c[1]])),v=>{se.col=v;se.val=v&&def.cols.find(c=>c[0]===v)[2]==='check'?false:'';render();},'Campo a alterar'),
      sc?ctl(sc,se.val,'se-val-'+key,v=>{se.val=v;},'Novo valor'):null,
      sc?btn('Aplicar a '+rows.length+' '+def.t.toLowerCase(),()=>{const v=sc[2]==='check'?!!$('#se-val-'+key).checked:sc[2]==='number'?(+$('#se-val-'+key).value||0):$('#se-val-'+key).value;mutate(()=>rows.forEach(x=>{if(!(sc[0]==='alt'&&x.id===v))x[sc[0]]=v;}));toast('Campo alterado em '+rows.length+' linhas.','Anular',desfazer);},'btn-sm',{disabled:busy||!rows.length}):null,
      h('span',{class:'text-xs opacity-60'},'Aplica o mesmo valor a todas as linhas filtradas pela procura.'),
      key==='subjects'?h('span',{class:'text-xs opacity-60'},'Sequência: letras A a F afastam disciplinas; números 1 a 9 juntam-nas.'):null,
      key==='rooms'?h('span',{class:'text-xs opacity-60'},'Se a sala estiver ocupada, a otimização usa a alternativa (e a alternativa desta, em ciclo).'):null)));
};

/* ---------- aulas ---------- */
function lessonDialog(l){
  const isNew=!l;l=l||{classIds:ui.fC&&ui.fC!=='-'?[ui.fC]:[],linhas:[{s:ui.fS||S.subjects[0].id,t:ui.fT&&ui.fT!=='-'?ui.fT:'',r:'',tip:''}],tl:2,duplos:0,blocos:'',fixa:false,ign:false,valor:'',per:'',seqT:'',seqP:'',grp:''};
  const rows=l.linhas.map(x=>Object.assign({},x)),box=h('tbody',{}),sOpts=optsOf(S.subjects),tOpts=optsOf(S.teachers,'? (por atribuir)'),rOpts=optsOf(S.rooms,'Sala da disciplina ou da turma');
  const draw=()=>box.replaceChildren.apply(box,rows.map((r,i)=>h('tr',{},
    h('td',{},selEl('ld-s-'+i,r.s,sOpts,v=>{r.s=v;},'Disciplina','max-w-40')),h('td',{},selEl('ld-t-'+i,r.t,tOpts,v=>{r.t=v;},'Professor','max-w-44')),h('td',{},selEl('ld-r-'+i,r.r,rOpts,v=>{r.r=v;},'Sala','max-w-44')),
    h('td',{},h('input',{type:'text',id:'ld-tip-'+i,class:'input input-sm w-16','aria-label':'Tipologia',placeholder:'T1',value:r.tip||'',onchange:e=>{r.tip=e.target.value.trim();}})),
    h('td',{},btn('Remover',()=>{rows.splice(i,1);draw();},'btn-sm btn-ghost text-error',{disabled:rows.length<2})))));
  draw();
  const numF=(id,label,v,min,max)=>field(label,h('input',{type:'number',id,class:'input input-sm w-24',min,max,value:v}));
  const txtF=(id,label,v,w,ph)=>field(label,h('input',{type:'text',id,class:'input input-sm '+(w||'w-24'),value:v||'',placeholder:ph||''}));
  const body=h('div',{class:'flex flex-col gap-4'},
    h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Turmas'),h('span',{class:'text-xs opacity-60'},'Marque várias para juntar turmas. Sem turma: cargo ou componente não letiva do professor.'),
      h('div',{class:'grid grid-cols-3 sm:grid-cols-5 gap-x-3 gap-y-1 max-h-36 overflow-auto border border-base-300 rounded-box p-2'},S.classes.map(x=>h('label',{class:'flex items-center gap-1.5 text-sm'},h('input',{type:'checkbox',id:'ld-cls-'+x.id,name:'cls',class:'checkbox checkbox-xs',value:x.id,checked:l.classIds.includes(x.id)}),x.name)))),
    h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Disciplinas, professores e salas'),h('span',{class:'text-xs opacity-60'},'Várias linhas ficam em simultâneo (turnos, par pedagógico).'),
      tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},['Disciplina','Professor','Sala','Tipologia',''].map(t=>h('th',{},t)))),box)),
      h('div',{},btn('Acrescentar linha em simultâneo',()=>{rows.push({s:S.subjects[0].id,t:'',r:'',tip:''});draw();},'btn-sm'))),
    h('div',{class:'flex flex-wrap gap-3 items-end'},numF('ld-tl','TL por semana',l.tl,1,40),numF('ld-duplos','TL duplos',l.duplos,0,20),txtF('ld-blocos','Blocos',l.blocos,'w-28','3 ou 4,3'),numF('ld-valor','Valor de linha (min)',l.valor||'',0,2000),
      field('Periodicidade',selEl('ld-per',l.per||'',perOptions(),()=>{},'Periodicidade'))),
    h('div',{class:'flex flex-wrap gap-3 items-end'},txtF('ld-seqT','Sequência na turma',l.seqT,'w-24','A–F, 1–9'),txtF('ld-seqP','Sequência no professor',l.seqP,'w-24','A–F, 1–9'),txtF('ld-grp','Sequência fixa (grupo)',l.grp,'w-28','G1'),
      h('span',{class:'text-xs opacity-60 max-w-md'},'Aulas com o mesmo grupo ficam seguidas no mesmo dia. Letras afastam aulas; números juntam-nas.')),
    h('div',{class:'flex flex-wrap gap-4'},h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'ld-fixa',class:'checkbox checkbox-sm',checked:l.fixa}),'Fixa: a otimização não a move'),
      h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'ld-ign',class:'checkbox checkbox-sm',checked:l.ign}),'Ignorar (I): não entra no horário')),
    h('div',{id:'ld-err',class:'text-error text-sm hidden'}));
  const ok=()=>{
    const d=$('#dlg'),cls=Array.from(d.querySelectorAll('input[name=cls]:checked')).map(x=>x.value);
    if(!cls.length&&!rows.some(r=>r.t)){const e=$('#ld-err');e.textContent='Escolha pelo menos uma turma, ou um professor para um cargo sem turma.';e.classList.remove('hidden');return;}
    const v={classIds:cls,linhas:rows,tl:+$('#ld-tl').value||1,duplos:+$('#ld-duplos').value||0,blocos:$('#ld-blocos').value.trim(),valor:+$('#ld-valor').value||'',per:$('#ld-per').value,
      seqT:$('#ld-seqT').value.trim().toUpperCase(),seqP:$('#ld-seqP').value.trim().toUpperCase(),grp:$('#ld-grp').value.trim(),fixa:$('#ld-fixa').checked,ign:$('#ld-ign').checked};
    closeDlg();mutate(()=>{if(isNew)S.lessons.push(Object.assign({id:uid()},v));else Object.assign(l,v);});
  };
  openDlg(isNew?'Nova aula':'Editar aula n.º '+l.n,body,[btn('Cancelar',closeDlg),btn(isNew?'Criar aula':'Guardar',ok,'btn-primary')]);
}
function copyDialog(){
  const src=ui.fC,others=S.classes.filter(c=>c.id!==src);
  openDlg('Copiar currículo de '+nm('c',src),h('div',{class:'flex flex-col gap-2'},h('span',{class:'text-sm opacity-70'},'Copia as aulas desta turma para as turmas marcadas, sem professor atribuído. As aulas com turmas juntas não são copiadas.'),
    h('div',{class:'grid grid-cols-3 sm:grid-cols-5 gap-x-3 gap-y-1 max-h-60 overflow-auto border border-base-300 rounded-box p-2'},others.map(x=>h('label',{class:'flex items-center gap-1.5 text-sm'},h('input',{type:'checkbox',id:'cp-'+x.id,name:'cp',class:'checkbox checkbox-xs',value:x.id}),x.name)))),
    [btn('Cancelar',closeDlg),btn('Copiar',()=>{const to=Array.from($('#dlg').querySelectorAll('input[name=cp]:checked')).map(x=>x.value);closeDlg();
      if(to.length)mutate(()=>{const base=S.lessons.filter(l=>l.classIds.length===1&&l.classIds[0]===src);
        to.forEach(c=>base.forEach(l=>S.lessons.push({id:uid(),classIds:[c],linhas:l.linhas.map(ln=>({s:ln.s,t:'',r:'',tip:ln.tip})),tl:l.tl,duplos:l.duplos,blocos:l.blocos,per:l.per,seqT:l.seqT||'',seqP:'',grp:'',fixa:false,ign:false,valor:''})));});},'btn-primary')]);
}
PAGES.aulas=function(m){
  const ix=IX();let rows=S.lessons;
  if(ui.fC)rows=rows.filter(l=>ui.fC==='-'?!l.classIds.length:l.classIds.includes(ui.fC));
  if(ui.fT)rows=rows.filter(l=>ui.fT==='-'?l.linhas.some(ln=>!ln.t):l.linhas.some(ln=>ln.t===ui.fT));
  if(ui.fS)rows=rows.filter(l=>l.linhas.some(ln=>ln.s===ui.fS));
  const pg=pager('aulas',rows.length,30),setF=(k,v)=>{ui[k]=v;ui.pg.aulas=0;render();};
  m.append(pageHead('Aulas','O currículo de cada turma: disciplina, professor, sala e tempos letivos semanais.',
    btn('Copiar currículo para…',copyDialog,'btn-sm',{disabled:busy||!ui.fC||ui.fC==='-'||S.classes.length<2}),btn('Nova aula',()=>lessonDialog(),'btn-primary btn-sm',{disabled:busy||!S.subjects.length})));
  if(!S.subjects.length)m.append(note('warn','Crie primeiro disciplinas e turmas em Dados da escola.'));
  const num=(l,k,min)=>h('input',{type:'number',id:'ls-'+k+'-'+l.id,class:'input input-sm w-16',min,max:40,value:l[k],'aria-label':k==='tl'?'TL por semana':'TL duplos',disabled:busy,onchange:e=>mutate(()=>{l[k]=+e.target.value||0;})});
  m.append(panel(null,
    h('div',{class:'flex flex-wrap items-center gap-2 noprint'},
      selEl('ls-class',ui.fC,[['','Todas as turmas']].concat(S.classes.map(c=>[c.id,c.name]),[['-','Sem turma (cargos, CNL)']]),v=>setF('fC',v),'Filtrar por turma'),
      selEl('ls-teacher',ui.fT,[['','Todos os professores'],['-','Sem professor atribuído']].concat(S.teachers.map(t=>[t.id,t.name])),v=>setF('fT',v),'Filtrar por professor','max-w-52'),
      selEl('ls-subject',ui.fS,[['','Todas as disciplinas']].concat(S.subjects.map(s=>[s.id,s.name])),v=>setF('fS',v),'Filtrar por disciplina','max-w-52'),
      h('span',{class:'text-sm opacity-70'},rows.length+' aulas · '+rows.reduce((a,l)=>a+l.tl,0)+' TL'),h('span',{class:'grow'}),pg.el),
    tableWrap(h('table',{class:'table table-sm'},
      h('thead',{},h('tr',{},['N.º','Turma/s','Disciplina','Professor','Sala','TL','Duplos','Blocos','Colocados','Sinais',''].map(t=>h('th',{},t)))),
      h('tbody',{},rows.slice(pg.from,pg.to).map(l=>{
        let done=0;for(const c of ix.cl.get(l.id)||[])if(c.day!=null)done+=c.len;
        return h('tr',{},h('td',{class:'num opacity-60'},String(l.n)),h('td',{},l.classIds.map(i=>nm('c',i)).join(', ')||h('span',{class:'opacity-50'},'—')),
          h('td',{},l.linhas.map(ln=>h('div',{class:'whitespace-nowrap'},h('span',{class:'sw',style:'--sc:'+col((ix.s.get(ln.s)||{}).color)}),nm('s',ln.s)+(ln.tip?' ('+ln.tip+')':'')))),
          h('td',{},l.linhas.map(ln=>h('div',{class:'whitespace-nowrap'},ln.t?nm('t',ln.t):badge('?','warn')))),
          h('td',{},l.linhas.map(ln=>{const r=roomOfLine(l,ln);return h('div',{class:'whitespace-nowrap '+(ln.r?'':'opacity-60')},r?nm('r',r):'—');})),
          h('td',{},num(l,'tl',1)),h('td',{},num(l,'duplos',0)),h('td',{},l.blocos||''),
          h('td',{},l.ign?h('span',{class:'opacity-60'},'ignorada'):badge(done+' / '+l.tl,done<l.tl?'bad':'ok')),
          h('td',{class:'text-xs'},[l.fixa?'fixa':'',l.ign?'ignorada':'',perLabel(l.per,cicloK(S)),l.valor?l.valor+' min':'',l.seqT?'seq. '+l.seqT:'',l.seqP?'seq. prof. '+l.seqP:'',l.grp?'grupo '+l.grp:''].filter(Boolean).join(' · ')),
          h('td',{},h('div',{class:'join'},btn('Editar',()=>lessonDialog(l),'btn-sm join-item',{disabled:busy}),
            btn('Apagar',()=>{mutate(()=>{S.lessons=S.lessons.filter(x=>x!==l);});toast('Aula apagada.','Anular',desfazer);},'btn-sm join-item text-error',{disabled:busy}))));}),
        rows.length?null:h('tr',{},h('td',{colspan:11,class:'opacity-60'},'Não há aulas com estes filtros.')))))));
};

/* ---------- serviço docente ---------- */
PAGES.servico=function(m){
  const ix=IX();if(!ix.t.has(ui.svc))ui.svc=S.teachers[0]?S.teachers[0].id:'';
  m.append(pageHead('Serviço docente','Atribua as aulas a cada professor e acompanhe os minutos da componente letiva.',
    field('Componente letiva (min)',h('input',{type:'number',id:'sv-alvo',class:'input input-sm w-24',min:0,max:3000,value:S.alvo,disabled:busy,onchange:e=>mutate(()=>{S.alvo=+e.target.value||1100;})})),
    btn('Criar habilitações a partir das aulas',()=>{mutate(()=>S.teachers.forEach(t=>{t.hab=uniq((t.hab||[]).concat((ix.lt.get(t.id)||[]).map(x=>x[1].s)));}));toast('Habilitações criadas: no próximo ano, as aulas dessas disciplinas são propostas primeiro.');},'btn-sm self-end',{disabled:busy,title:'Regista para cada professor as disciplinas que leciona, para propor aulas no ano seguinte'})));
  if(!ui.svc){m.append(note('warn','Crie professores em Dados da escola.'));return;}
  const t=ix.t.get(ui.svc),g=legenda(t.id),tot=g.tlLet+g.tlCnl,mine=ix.lt.get(t.id)||[],hab=new Set((t.hab||[]).concat(mine.map(x=>x[1].s)));
  const free=ix.free.filter(x=>matchQ('svc',[x[0].classIds.map(i=>nm('c',i)).join(' '),nm('s',x[1].s)])).sort((a,b)=>hab.has(b[1].s)-hab.has(a[1].s));
  const pg=pager('svc',free.length,25),idx=S.teachers.indexOf(t);
  const line=(x,b,fl)=>h('tr',{},h('td',{},x[0].classIds.map(i=>nm('c',i)).join(', ')||'—'),h('td',{},nm('s',x[1].s)+(x[1].tip?' ('+x[1].tip+')':''),fl&&hab.has(x[1].s)?h('span',{class:'ml-2'},badge('habilitação','ok')):null),h('td',{class:'num'},String(x[0].tl)),h('td',{class:'text-right'},b));
  m.append(h('div',{class:'flex flex-wrap items-center gap-2'},
    h('div',{class:'join'},btn('‹',()=>{ui.svc=S.teachers[(idx-1+S.teachers.length)%S.teachers.length].id;render();},'btn-sm join-item',{'aria-label':'Professor anterior'}),
      selEl('sv-teacher',ui.svc,optsOf(S.teachers),v=>{ui.svc=v;render();},'Professor','join-item max-w-60'),
      btn('›',()=>{ui.svc=S.teachers[(idx+1)%S.teachers.length].id;render();},'btn-sm join-item',{'aria-label':'Professor seguinte'})),
    badge(tot+' TL atribuídos'+(t.prev?' de '+t.prev+' previstos':''),t.prev&&tot>t.prev?'bad':'ok'),badge(g.minLet+' / '+S.alvo+' min letivos',g.minLet===S.alvo?'ok':'warn'),
    h('span',{class:'text-sm opacity-70'},ix.free.length+' linhas de aula por atribuir em toda a escola')));
  m.append(h('div',{class:'grid lg:grid-cols-2 gap-4 items-start'},
    panel('Aulas de '+t.name,tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},h('th',{},'Turma/s'),h('th',{},'Disciplina'),h('th',{class:'num'},'TL'),h('th',{}))),
      h('tbody',{},mine.map(x=>line(x,btn('Devolver',()=>mutate(()=>{x[1].t='';}),'btn-sm',{disabled:busy}))),mine.length?null:h('tr',{},h('td',{colspan:4,class:'opacity-60'},'Sem aulas atribuídas.')))))),
    panel('Aulas por atribuir',h('div',{class:'flex flex-wrap items-center gap-2'},searchEl('svc','Procurar turma ou disciplina'),h('span',{class:'grow'}),pg.el),
      tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},h('th',{},'Turma/s'),h('th',{},'Disciplina'),h('th',{class:'num'},'TL'),h('th',{}))),
        h('tbody',{},free.slice(pg.from,pg.to).map(x=>line(x,btn('Atribuir',()=>{mutate(()=>{x[1].t=t.id;});const g2=legenda(t.id);
          if(t.prev&&g2.tlLet+g2.tlCnl>t.prev)toast(t.name+' ultrapassa os '+t.prev+' TL previstos.','Anular',desfazer);},'btn-sm btn-primary',{disabled:busy}),true)),
          free.length?null:h('tr',{},h('td',{colspan:4,class:'opacity-60'},ix.free.length?'Nada com esta procura.':'Todas as aulas têm professor.'))))))));
  m.append(panel('Legenda em minutos',legendaEl(t.id),h('p',{class:'text-xs opacity-60'},'Minutos = TL × fator da disciplina (Dados da escola, Disciplinas), ou o valor de linha da aula quando preenchido. As aulas quinzenais e semestrais contam metade. As disciplinas marcadas CNL contam à parte.')));
};

/* ---------- grelha genérica ---------- */
function frame(cellFn,headFn,alt){
  const g=h('div',{class:'tt',style:'grid-template-columns:5.6rem repeat('+S.days.length+',minmax(6.5rem,1fr))'});
  S.days.forEach((d,i)=>g.append(h('div',Object.assign({class:'dh',style:'grid-row:1;grid-column:'+(i+2)},headFn?headFn('d',i):{}),d)));
  S.periods.forEach((p,pi)=>{
    const b=p.breakAfter?' brk':'';
    g.append(h('div',Object.assign({class:'ph'+b,style:'grid-column:1;grid-row:'+(pi+2)},headFn?headFn('p',pi):{}),h('b',{},p.label),h('span',{},((alt&&alt[pi].start)||p.start||'')+'–'+((alt&&alt[pi].end)||p.end||''))));
    S.days.forEach((_,d)=>{const a=cellFn(d,pi),txt=a.text;delete a.text;a.class='cell'+b+(a.class?' '+a.class:'');a.style='grid-row:'+(pi+2)+';grid-column:'+(d+2);a['data-d']=d;a['data-p']=pi;g.append(h('div',a,txt));});
  });
  return g;
}
const lvlOf=(key,d,p)=>{const o=S.off[key];return o?(o[d+'-'+p]||0):0;};

/* ---------- disponibilidades ---------- */
PAGES.requisitos=function(m){
  const arr=list(ui.avKind);if(!arr.some(x=>x.id===ui.avId))ui.avId=arr[0]?arr[0].id:null;
  m.append(pageHead('Disponibilidades','De Impedido a Ideal, para turmas, professores, salas e disciplinas.'));
  m.append(h('div',{class:'flex flex-wrap items-center gap-2'},tabsEl(Object.keys(KINDS).map(k=>[k,KINDS[k][2]]),ui.avKind,k=>{ui.avKind=k;ui.avId=null;render();},'Tipo'),
    selEl('av-entity',ui.avId||'',optsOf(arr),v=>{ui.avId=v;render();},KINDS[ui.avKind][1],'max-w-60')));
  if(!ui.avId){m.append(note('info','Ainda não há nada para configurar.'));return;}
  const key=ui.avKind+':'+ui.avId,lab={'-3':'Impedido','-2':'Evitar muito','-1':'Evitar','0':'Indiferente','1':'Aceitável','2':'Preferido','3':'Ideal'},sim={'-3':'✕','-2':'– –','-1':'–','1':'+','2':'+ +','3':'★'};
  const paint=slots=>mutate(()=>{const o=S.off[key]||(S.off[key]={});slots.forEach(s=>{if(ui.brush)o[s]=ui.brush;else delete o[s];});if(!Object.keys(o).length)delete S.off[key];});
  const g=frame((d,p)=>{const v=lvlOf(key,d,p);return {class:v===-3?'off':v<0?'neg':v>0?'pos':'',text:v?sim[v]:'',role:'button',tabindex:0,title:lab[v],'aria-label':S.days[d]+', TL '+S.periods[p].label+': '+lab[v],
    onclick:()=>paint([d+'-'+p]),onkeydown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();paint([d+'-'+p]);}}};},
    (t,i)=>({onclick:()=>paint(t==='d'?S.periods.map((_,p)=>i+'-'+p):S.days.map((_,d)=>d+'-'+i)),title:'Aplicar a todos'}));
  g.classList.add('pick');
  m.append(panel(null,
    h('div',{class:'flex flex-wrap items-center gap-2'},h('span',{class:'text-sm font-medium'},'Valor a aplicar'),
      h('div',{class:'join flex-wrap',role:'group','aria-label':'Valor'},[-3,-2,-1,0,1,2,3].map(v=>btn(lab[v],()=>{ui.brush=v;render();},'btn-sm join-item'+(ui.brush===v?' btn-active btn-neutral':''),{'aria-pressed':String(ui.brush===v)}))),
      h('span',{class:'grow'}),
      btn('Limpar',()=>mutate(()=>{delete S.off[key];}),'btn-sm btn-ghost',{disabled:busy||!S.off[key]}),
      btn('Aplicar a todas (modificação em série)',()=>{const src=JSON.stringify(S.off[key]||{});mutate(()=>arr.forEach(x=>{const o=JSON.parse(src);if(Object.keys(o).length)S.off[ui.avKind+':'+x.id]=o;else delete S.off[ui.avKind+':'+x.id];}));toast('Aplicado a todas as '+KINDS[ui.avKind][2].toLowerCase()+'.','Anular',desfazer);},'btn-sm',{disabled:busy})),
    h('p',{class:'text-sm opacity-70'},'Clique num tempo para lhe dar o valor escolhido; clique num dia ou num TL para a coluna ou a linha inteira. Nos tempos impedidos (✕) nunca são colocadas aulas; os outros níveis pesam conforme a prioridade dada às disponibilidades.'),
    h('div',{class:'overflow-x-auto'},g)));
};

/* ---------- prioridades ---------- */
PAGES.ponderacoes=function(m){
  const groups=[['Turmas',[['furosT','Evitar furos nas turmas','Tempos livres entre aulas no mesmo dia.'],['repDia','Não repetir a disciplina no mesmo dia','Aulas separadas da mesma disciplina, na mesma turma e no mesmo dia.'],
      ['maxDia','Respeitar os TL por dia','Mínimos e máximos diários de turmas e professores, e o máximo de disciplinas diferentes por dia (Dados da escola).'],['tardes','Tardes livres das turmas','Número de tardes livres pedido em cada turma; o programa escolhe quais.'],['almoco','Intervalo de almoço','Deixar um tempo livre para almoço a turmas e professores.'],['almMax','Turmas com a mesma hora de almoço','Não ultrapassar o máximo definido na grelha semanal.'],['dt','Diretor de turma com a turma','Aulas do DT com a turma em pelo menos os dias pedidos (Dados da escola, Turmas).']]],
    ['Professores',[['furosP','Evitar furos nos professores','Tempos livres no horário de cada docente.'],['isol','Evitar TL isolados num turno','Um único tempo de aulas de manhã ou de tarde.'],['furosR','Furos entre o mínimo e o máximo','Número de furos semanais de cada professor dentro do intervalo pedido.'],['livres2','Evitar dois TL livres seguidos','Dois furos consecutivos no dia de um professor.'],['maxSeg','Máximo de tempos seguidos','Limite de TL consecutivos de cada professor.'],['turno','Horário num só turno','Professores marcados com um só turno: manhã ou tarde em cada dia.'],
      ['span','Tempos na escola por dia','Do primeiro ao último tempo do dia, para quem tem limite definido.'],['diasLivres','Dias livres dos professores','Número de dias sem aulas pedido em cada professor.'],['desloc','Salas deslocadas','Evitar aulas seguidas em edifícios diferentes sem intervalo para a deslocação.']]],
    ['Disciplinas e aulas',[['marg','Disciplinas de ponta e opcionais nas pontas do dia','No primeiro ou no último tempo, ou entre a manhã e a tarde.'],['seq','Sequências','Letras afastam e números juntam disciplinas; grupos de sequência fixa ficam seguidos.'],
      ['seguidos','Aulas de 2 ou 3 TL em dias não seguidos','Distribuir pela semana as disciplinas com poucas aulas.'],['equil','Distribuição equilibrada','Evitar a mesma aula sempre ao mesmo tempo letivo em dias diferentes.'],['bloco','Blocos de 3 ou mais TL nas pontas dos turnos','No início ou no fim da manhã ou da tarde.']]],
    ['Geral',[['req','Disponibilidades -2, -1 e positivos','Peso das disponibilidades que não são impedimentos.'],['cedo','Concentrar as aulas no início do dia','Preencher primeiro os primeiros tempos.'],['sala','Usar a sala pedida','Preferir a sala da aula à sala alternativa.'],['cap','Capacidade das salas','Não pôr turmas em salas com menos lugares do que alunos.']]]];
  const nomes=['sem importância','pouco importante','a ter em conta','importante','muito importante','muitíssimo importante'];
  const cnt=[0,0,0,0,0,0];Object.keys(W0).forEach(k=>cnt[S.w[k]]++);
  m.append(pageHead('Prioridades','De 0 a 5: quanto pesa cada critério na otimização.',btn('Repor valores iniciais',()=>mutate(()=>{S.w=Object.assign({},W0);}),'btn-sm',{disabled:busy})));
  m.append(h('div',{class:'grid xl:grid-cols-2 gap-4 items-start'},groups.map(g=>panel(g[0],g[1].map(d=>h('div',{class:'grid grid-cols-[minmax(0,1fr)_9rem_1.5rem] gap-3 items-center py-1.5 border-b border-base-200 last:border-0'},
    h('label',{for:'w-'+d[0],class:'text-sm'},h('span',{class:'font-medium'},d[1]),h('span',{class:'block text-xs opacity-60'},d[2]+' Agora: '+nomes[S.w[d[0]]]+'.')),
    h('input',{type:'range',id:'w-'+d[0],class:'range range-xs range-primary',min:0,max:5,step:1,value:S.w[d[0]],disabled:busy,onchange:e=>mutate(()=>{S.w[d[0]]=+e.target.value;})}),
    h('span',{class:'fd font-bold num'},String(S.w[d[0]]))))))));
  m.append(panel('Análise',h('div',{class:'flex flex-wrap gap-2'},cnt.map((n,i)=>h('span',{class:'badge badge-outline gap-1'},h('b',{},String(i)),n+' critérios'))),
    h('p',{class:'text-sm opacity-70'},cnt[4]+cnt[5]>8?'Há muitos critérios em 4 e 5: isso dificulta a otimização. Guarde os valores mais altos para o que é mesmo indispensável.':'O ideal é haver poucos critérios em 5 e mais nos valores baixos. Depois de alterar, volte a otimizar.')));
};
