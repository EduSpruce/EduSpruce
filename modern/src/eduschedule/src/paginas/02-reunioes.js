/* ---------- reuniões ---------- */
function reuBusy(mdl,r,d,p){
  let n=0;const P=mdl.P;
  for(const t of r.teacherIds){const tr=mdl.resIdx('t',t);let b=false;if(tr===undefined)continue;
    for(let i=0;i<r.len;i++)if(mdl.busy(tr,d*P+p+i)||mdl.level(tr,d*P+p+i)===-3)b=true;
    if(!b)b=S.reunioes.some(x=>x!==r&&x.day===d&&x.teacherIds.includes(t)&&p<x.period+x.len&&x.period<p+r.len);
    if(b)n++;}
  return n;
}
function reuSlots(r){const out=[];for(let d=0;d<S.days.length;d++)for(let p=0;p+r.len<=S.periods.length;p++){let ok=true;for(let i=0;i<r.len-1;i++)if(S.periods[p+i].breakAfter)ok=false;if(ok)out.push([d,p]);}return out;}
function reuDialog(r){
  const isNew=!r;r=r||{nome:'Reunião',teacherIds:[],len:1,roomId:''};
  const boxT=h('div',{class:'grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 max-h-60 overflow-auto border border-base-300 rounded-box p-2'},S.teachers.map(t=>h('label',{class:'flex items-center gap-1.5 text-sm','data-n':t.name.toLowerCase()},h('input',{type:'checkbox',id:'re-t-'+t.id,name:'ret',class:'checkbox checkbox-xs',value:t.id,checked:r.teacherIds.includes(t.id)}),t.name)));
  openDlg(isNew?'Nova reunião':'Editar reunião',h('div',{class:'flex flex-col gap-3'},
    h('div',{class:'flex flex-wrap gap-3'},field('Nome',h('input',{type:'text',id:'re-nome',class:'input input-sm w-64',value:r.nome})),field('Duração (TL)',h('input',{type:'number',id:'re-len',class:'input input-sm w-24',min:1,max:4,value:r.len}))),
    h('div',{class:'flex flex-col gap-1'},h('div',{class:'flex items-center gap-2'},h('span',{class:'font-medium text-sm'},'Participantes'),h('input',{type:'search',id:'re-q',class:'input input-xs w-48',placeholder:'Procurar professor','aria-label':'Procurar professor',oninput:e=>{const q=e.target.value.trim().toLowerCase();for(const el of boxT.children)el.classList.toggle('hidden',!!q&&!el.dataset.n.includes(q));}})),boxT)),
    [btn('Cancelar',closeDlg),btn(isNew?'Criar':'Guardar',()=>{const v={nome:$('#re-nome').value.trim()||'Reunião',len:Math.max(1,Math.min(4,+$('#re-len').value||1)),teacherIds:Array.from($('#dlg').querySelectorAll('input[name=ret]:checked')).map(x=>x.value)};closeDlg();
      mutate(()=>{if(isNew)S.reunioes.push(Object.assign({id:uid(),day:null,period:null,roomId:''},v));else{Object.assign(r,v);if(r.day!=null&&r.period+r.len>S.periods.length){r.day=null;r.period=null;}}});},'btn-primary')]);
}
PAGES.reunioes=function(m){
  const mdl=M(),ix=IX(),rows=S.reunioes.filter(r=>matchQ('reu',[r.nome])),pg=pager('reu',rows.length,25);
  const criarCT=()=>mutate(()=>S.classes.forEach(c=>{const nome='CT '+c.name;if(S.reunioes.some(r=>r.nome===nome))return;
    const ts=uniq(S.lessons.filter(l=>l.classIds.includes(c.id)).flatMap(l=>l.linhas.map(ln=>ln.t)));if(ts.length)S.reunioes.push({id:uid(),nome,teacherIds:ts,len:1,day:null,period:null,roomId:c.roomId||''});}));
  const auto=()=>{let bad=0;mutate(()=>{for(const r of S.reunioes){if(r.day!=null)continue;let best=null,bc=Infinity;
    for(const sl of reuSlots(r)){const k=reuBusy(mdl,r,sl[0],sl[1])*100-sl[1];if(k<bc){bc=k;best=sl;}}
    if(best){r.day=best[0];r.period=best[1];if(bc>=50)bad++;}}});
    toast(bad?bad+' reuniões ficaram com participantes ocupados. Escolha outro tempo ou reveja os participantes.':'Reuniões marcadas com todos os participantes livres.','Anular',desfazer);};
  m.append(pageHead('Reuniões','Marcadas nos tempos em que os participantes não têm aulas nem outra reunião.',
    btn('Criar conselhos de turma',criarCT,'btn-sm noprint',{disabled:busy||!S.classes.length}),btn('Nova reunião',()=>reuDialog(),'btn-sm noprint',{disabled:busy||!S.teachers.length}),
    btn('Marcar automaticamente',auto,'btn-sm btn-primary noprint',{disabled:busy||!S.reunioes.some(r=>r.day==null)}),
    btn('Desmarcar todas',()=>mutate(()=>S.reunioes.forEach(r=>{r.day=null;r.period=null;})),'btn-sm noprint',{disabled:busy||!S.reunioes.some(r=>r.day!=null)}),btn('Imprimir',imprimir,'btn-sm noprint')));
  m.append(panel(null,h('div',{class:'flex flex-wrap items-center gap-2 noprint'},searchEl('reu','Procurar reunião'),h('span',{class:'text-sm opacity-70'},S.reunioes.filter(r=>r.day!=null).length+' de '+S.reunioes.length+' marcadas'),h('span',{class:'grow'}),pg.el),
    tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},['Reunião','Participantes','TL','Dia e tempo','Sala','Estado',''].map(t=>h('th',{},t)))),
      h('tbody',{},rows.slice(pg.from,pg.to).map(r=>{
        const n=r.day!=null?reuBusy(mdl,r,r.day,r.period):0;
        return h('tr',{},h('td',{},h('b',{},r.nome)),h('td',{class:'text-xs max-w-xs'},r.teacherIds.map(t=>sh('t',t)).join(', ')||'—'),h('td',{class:'num'},String(r.len)),
          h('td',{},selEl('re-s-'+r.id,r.day!=null?r.day+'-'+r.period:'',[['','Por marcar']].concat(reuSlots(r).map(sl=>{const b=reuBusy(mdl,r,sl[0],sl[1]);return [sl[0]+'-'+sl[1],S.days[sl[0]]+', '+S.periods[sl[1]].label+'.º tempo'+(S.periods[sl[1]].start?' ('+S.periods[sl[1]].start+')':'')+(b?' · '+b+' ocupados':' · todos livres')];})),
            v=>mutate(()=>{if(!v){r.day=null;r.period=null;}else{r.day=+v.split('-')[0];r.period=+v.split('-')[1];}}),'Dia e tempo','max-w-64')),
          h('td',{},selEl('re-r-'+r.id,r.roomId||'',optsOf(S.rooms,'—'),v=>mutate(()=>{r.roomId=v;}),'Sala','max-w-40')),
          h('td',{},r.day==null?h('span',{class:'opacity-60'},'por marcar'):badge(n?n+' ocupados':'todos livres',n?'bad':'ok')),
          h('td',{class:'noprint'},h('div',{class:'join'},btn('Editar',()=>reuDialog(r),'btn-sm join-item',{disabled:busy}),btn('Apagar',()=>mutate(()=>{S.reunioes=S.reunioes.filter(x=>x!==r);}),'btn-sm join-item text-error',{disabled:busy}))));}),
        rows.length?null:h('tr',{},h('td',{colspan:7,class:'opacity-60'},'Ainda não há reuniões. Crie os conselhos de turma ou uma reunião nova.')))))));
};

