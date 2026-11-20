/* ---------- substituições ---------- */
PAGES.substituicoes=function(m){
  const ix=IX(),mdl=M(),P=mdl.P;if(!ix.t.has(ui.cteacher))ui.cteacher=S.teachers[0]?S.teachers[0].id:'';
  const date=ui.cdate,wd=(new Date(date+'T12:00:00').getDay()+6)%7,key=date+'|'+ui.cteacher,rec=S.cover[key];
  m.append(pageHead('Substituições','Registe a ausência de um professor e escolha quem o substitui em cada tempo.',
    h('input',{type:'date',id:'cv-date',class:'input input-sm','aria-label':'Data',value:date,onchange:e=>{if(e.target.value){ui.cdate=e.target.value;render();}}}),
    selEl('cv-teacher',ui.cteacher,optsOf(S.teachers),v=>{ui.cteacher=v;render();},'Professor ausente','max-w-60')));
  {const v=hDe(date,hVersoes());if(S.horarios.length&&(!v||!v.ativo))m.append(note('warn','Esta data '+(v?'pertence ao período «'+v.nome+'», que não é o que está a editar. Abra-o na Planificação anual para registar substituições nesse horário.':'não pertence a nenhum período do ano.')));}
  const away=awayFn(date);
  const keys=Object.keys(S.cover).sort();
  if(keys.length)m.append(h('div',{class:'flex flex-wrap items-center gap-2'},h('span',{class:'text-sm opacity-70'},'Ausências registadas:'),keys.slice(-30).map(k=>{const p=k.split('|');return btn(p[0]+' · '+nm('t',p[1]),()=>{ui.cdate=p[0];ui.cteacher=p[1];render();},'btn-xs');})));
  if(!ui.cteacher){m.append(note('warn','Crie professores em Dados da escola.'));return;}
  if(wd>=S.days.length){m.append(note('info','Não há aulas nesse dia da semana.'));return;}
  const fe=feriasEm(date);if(fe)m.append(note('warn','Esta data está em «'+(fe.nome||'interrupção')+'» no calendário escolar.'));
  if(!rec){m.append(note('info',nm('t',ui.cteacher)+' não tem ausência registada em '+date+' ('+S.days[wd]+').',btn('Registar ausência',()=>mutate(()=>{S.cover[key]={};}),'btn-primary btn-sm',{disabled:busy})));return;}
  const dayKeys=keys.filter(k=>k.startsWith(date+'|')),absent=new Set(dayKeys.map(k=>k.split('|')[1]));
  const covering=(tid,p)=>dayKeys.some(k=>{const o=S.cover[k];for(const s in o)if(o[s]===tid&&+s.split('|')[1]===p)return true;return false;});
  const rows=[];cardsFor('t',ui.cteacher).filter(c=>c.day===wd).forEach(c=>{for(let i=0;i<c.len;i++)rows.push([c,c.period+i]);});rows.sort((a,b)=>a[1]-b[1]);
  const tSub=new Map(),tCls=new Map();
  const info=t=>{if(!tSub.has(t.id)){const a=new Set(),b=new Set();for(const [l,ln] of ix.lt.get(t.id)||[]){a.add(ln.s);l.classIds.forEach(c=>b.add(c));}tSub.set(t.id,a);tCls.set(t.id,b);}return [tSub.get(t.id),tCls.get(t.id)];};
  m.append(panel('Aulas de '+nm('t',ui.cteacher)+' em '+date,tableWrap(h('table',{class:'table table-sm'},
    h('thead',{},h('tr',{},['TL','Turma','Disciplina','Sala','Substituído por'].map(t=>h('th',{},t)))),
    h('tbody',{},rows.map(r=>{
      const c=r[0],p=r[1],l=ix.l.get(c.lessonId),inf=cardInfo(c,'t',ui.cteacher),sk=c.id+'|'+p,cur=rec[sk]||'',subj=(l.linhas.find(ln=>ln.t===ui.cteacher)||l.linhas[0]).s,slot=wd*P+p;
      const cand=[];S.teachers.forEach((t,ti)=>{const tr=mdl.T0+ti;const bz=mdl.busy(tr,slot),lib=bz&&mdl.cardsAt(tr,slot).every(a=>{const l2=ix.l.get(S.cards[a].lessonId);return l2.classIds.length&&l2.classIds.every(ci=>away(ci,p));});if(t.id===ui.cteacher||(t.de&&date<t.de)||(t.ate&&date>t.ate)||absent.has(t.id)||(bz&&!lib)||mdl.level(tr,slot)===-3||(cur!==t.id&&covering(t.id,p)))return;
        const [a,b]=info(t),same=a.has(subj),knows=l.classIds.some(i=>b.has(i)),n=popc(mdl.dayMask(tr,wd));
        cand.push({t,score:(same?0:4)+(knows?0:2)+(n?0:1.5)+n*.2-(lib?3:0)+(saldoDe(t.id)>0?saldoDe(t.id)*.1:0)-(t.bolsa>0?(bolsaUsada(t.id,date)<t.bolsa?2:-1):0),label:t.name+' ('+[t.bolsa>0?'bolsa '+bolsaUsada(t.id,date)+' de '+t.bolsa:'',lib?'libertado: a turma está fora':'',same?'mesma disciplina':'',knows?'professor da turma':'',n+' TL nesse dia'].filter(Boolean).join(', ')+')'});});
      cand.sort((x,y)=>x.score-y.score);
      return h('tr',{},h('td',{},h('b',{},S.periods[p].label),' ',h('span',{class:'opacity-60'},S.periods[p].start||'')),h('td',{},inf.cls||'—'),h('td',{},inf.title),h('td',{},inf.rms),
        h('td',{},selEl('cv-'+c.id+'-'+p,cur,[['','Por substituir'],['x','Aula anulada']].concat(cand.slice(0,40).map(x=>[x.t.id,x.label])),v=>mutate(()=>{if(v)rec[sk]=v;else delete rec[sk];}),'Substituto','max-w-md')));}),
      rows.length?null:h('tr',{},h('td',{colspan:5,class:'opacity-60'},'Sem aulas para substituir neste dia.'))))),
    h('div',{class:'flex flex-wrap items-center gap-3 noprint'},field('Motivo da ausência',selEl('cv-motivo',(S.coverM||{})[key]||'',[['','Sem motivo indicado']].concat(MOTIVOS.map(x=>[x,x])),v=>mutate(()=>{S.coverM=S.coverM||{};if(v)S.coverM[key]=v;else delete S.coverM[key];}),'Motivo da ausência'))),
    h('div',{class:'flex flex-wrap items-center gap-3'},h('span',{class:'text-sm opacity-70'},'Só aparecem professores livres, sem impedimento e não ausentes; primeiro os mais adequados.'),h('span',{class:'grow'}),
      btn('Imprimir',imprimir,'btn-sm noprint'),btn('Apagar esta ausência',()=>mutate(()=>{delete S.cover[key];if(S.coverM)delete S.coverM[key];}),'btn-sm btn-ghost text-error noprint',{disabled:busy}))));
};

