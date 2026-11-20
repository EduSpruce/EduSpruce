/* ---------- exames ---------- */
function exBusy(mdl,e){
  const wd=(new Date(e.data+'T12:00:00').getDay()+6)%7,P=mdl.P,out={wd,vigBusy:0,aulas:0};if(wd>=S.days.length||e.period==null)return out;
  for(let i=0;i<e.len&&e.period+i<P;i++){const s=wd*P+e.period+i;
    for(const t of e.vig){const r=mdl.resIdx('t',t);if(r!==undefined&&mdl.busy(r,s)){const cs=mdl.cardsAt(r,s),free=cs.every(a=>IX().l.get(S.cards[a].lessonId).classIds.some(c=>e.classIds.includes(c)));if(!free)out.vigBusy++;}}
    for(const c of e.classIds){const r=mdl.resIdx('c',c);if(r!==undefined&&mdl.busy(r,s))out.aulas++;}}
  return out;
}
function exPropor(mdl,e,n){
  const wd=(new Date(e.data+'T12:00:00').getDay()+6)%7,P=mdl.P,cand=[];if(wd>=S.days.length)return [];
  S.teachers.forEach((t,ti)=>{const r=mdl.T0+ti;let ok=true,libertado=false;
    for(let i=0;i<e.len&&e.period+i<P;i++){const s=wd*P+e.period+i;if(mdl.level(r,s)===-3)ok=false;
      if(mdl.busy(r,s)){const cs=mdl.cardsAt(r,s);if(cs.every(a=>IX().l.get(S.cards[a].lessonId).classIds.some(c=>e.classIds.includes(c))))libertado=true;else ok=false;}}
    if(ok&&!S.exames.some(x=>x!==e&&x.data===e.data&&x.vig.includes(t.id)&&e.period<x.period+x.len&&x.period<e.period+e.len))cand.push({id:t.id,score:(libertado?0:2)+S.exames.filter(x=>x.vig.includes(t.id)).length*.5});});
  return cand.sort((a,b)=>a.score-b.score).slice(0,n).map(x=>x.id);
}
function exDialog(e){
  const isNew=!e;e=e||{nome:'Exame',data:ui.cdate,period:0,len:2,classIds:[],roomId:'',vig:[],nvig:2};
  openDlg(isNew?'Novo exame':'Editar exame',h('div',{class:'flex flex-col gap-3'},
    h('div',{class:'flex flex-wrap gap-3 items-end'},field('Nome',h('input',{type:'text',id:'xe-nome',class:'input input-sm w-56',value:e.nome})),field('Data',h('input',{type:'date',id:'xe-data',class:'input input-sm',value:e.data})),
      field('Começa no',selEl('xe-per',String(e.period),S.periods.map((p,i)=>[String(i),p.label+'.º tempo'+(p.start?' ('+p.start+')':'')]),()=>{},'Tempo de início')),field('Duração (TL)',h('input',{type:'number',id:'xe-len',class:'input input-sm w-20',min:1,max:8,value:e.len})),
      field('Sala',selEl('xe-sala',e.roomId||'',optsOf(S.rooms,'—'),()=>{},'Sala')),field('N.º de vigilantes',h('input',{type:'number',id:'xe-nv',class:'input input-sm w-20',min:0,max:20,value:e.nvig||e.vig.length||2}))),
    h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Turmas'),h('div',{class:'grid grid-cols-3 sm:grid-cols-5 gap-x-3 gap-y-1 max-h-36 overflow-auto border border-base-300 rounded-box p-2'},S.classes.map(x=>h('label',{class:'flex items-center gap-1.5 text-sm'},h('input',{type:'checkbox',id:'xe-c-'+x.id,name:'xec',class:'checkbox checkbox-xs',value:x.id,checked:e.classIds.includes(x.id)}),x.name)))),
    h('p',{class:'text-xs opacity-60'},'Ao guardar, são propostos como vigilantes os professores livres nesse horário; primeiro os que ficam sem aula por causa do exame.')),
    [btn('Cancelar',closeDlg),btn(isNew?'Criar':'Guardar',()=>{const v={nome:$('#xe-nome').value.trim()||'Exame',data:$('#xe-data').value||ui.cdate,period:+$('#xe-per').value,len:Math.max(1,+$('#xe-len').value||1),roomId:$('#xe-sala').value,nvig:Math.max(0,+$('#xe-nv').value||0),classIds:Array.from($('#dlg').querySelectorAll('input[name=xec]:checked')).map(x=>x.value)};closeDlg();
      const mdl=M();mutate(()=>{let x=e;if(isNew){x=Object.assign({id:uid(),vig:[]},v);S.exames.push(x);}else Object.assign(e,v);x.vig=exPropor(mdl,x,x.nvig);});},'btn-primary')]);
}
PAGES.exames=function(m){
  const mdl=M(),rows=S.exames.slice().sort((a,b)=>(a.data+a.period).localeCompare(b.data+b.period));
  m.append(pageHead('Exames','Marque provas e exames; as aulas das turmas nesse horário ficam suspensas e são propostos vigilantes livres.',btn('Novo exame',()=>exDialog(),'btn-primary btn-sm noprint',{disabled:busy||!S.classes.length}),btn('Imprimir',imprimir,'btn-sm noprint')));
  m.append(panel(null,tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},['Exame','Data','Horário','Turmas','Sala','Vigilantes','Aulas suspensas','Estado',''].map(t=>h('th',{},t)))),
    h('tbody',{},rows.map(e=>{const b=exBusy(mdl,e),fe=feriasEm(e.data),p=S.periods[e.period]||{},pe=S.periods[Math.min(S.periods.length-1,e.period+e.len-1)]||{};
      return h('tr',{},h('td',{},h('b',{},e.nome)),h('td',{class:'whitespace-nowrap'},e.data+(b.wd<S.days.length?' ('+S.days[b.wd]+')':'')),h('td',{class:'whitespace-nowrap'},(p.label||'')+'.º a '+(pe.label||'')+'.º'+(p.start?' · '+p.start+'–'+(pe.end||''):'')),
        h('td',{},e.classIds.map(c=>nm('c',c)).join(', ')||'—'),h('td',{},e.roomId?nm('r',e.roomId):'—'),h('td',{class:'text-sm'},e.vig.map(t=>nm('t',t)).join(', ')||'—'),h('td',{class:'num'},String(b.aulas)),
        h('td',{},b.wd>=S.days.length?badge('dia sem aulas','warn'):fe?badge('em interrupção letiva','warn'):e.vig.length<(e.nvig||0)?badge('faltam '+((e.nvig||0)-e.vig.length)+' vigilantes','bad'):b.vigBusy?badge(b.vigBusy+' vigilantes com aulas','bad'):badge('pronto','ok')),
        h('td',{class:'noprint'},h('div',{class:'join'},btn('Editar',()=>exDialog(e),'btn-sm join-item',{disabled:busy}),btn('Propor vigilantes',()=>mutate(()=>{e.vig=exPropor(mdl,e,e.nvig||2);}),'btn-sm join-item',{disabled:busy}),btn('Apagar',()=>mutate(()=>{S.exames=S.exames.filter(x=>x!==e);}),'btn-sm join-item text-error',{disabled:busy}))));}),
      rows.length?null:h('tr',{},h('td',{colspan:9,class:'opacity-60'},'Ainda não há exames marcados.')))))));
};

