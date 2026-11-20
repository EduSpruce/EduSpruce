/* ---------- bloco C: períodos, mapa de salas, apoios, substituições em cadeia ---------- */
(function(){
  const wrap=(n,fn)=>{const o=PAGES[n];PAGES[n]=m=>{o(m);fn(m);};};
  wrap('anual',m=>{
    if(ui.anTab!=='per'||!S.horarios.length)return;const outros=S.horarios.filter(v=>v.id!==S.hAtivo),avisos=[];
    for(const v of hVersoes()){const ts=new Set((v.lessons||[]).flatMap(l=>l.linhas.map(ln=>ln.t)).filter(Boolean));for(const t of S.teachers){if(!ts.has(t.id)||(!t.de&&!t.ate))continue;if((t.de&&v.de&&t.de>v.de)||(t.ate&&v.ate&&t.ate<v.ate))avisos.push(t.name+' tem aulas no período «'+v.nome+'» ('+(v.de||'…')+' a '+(v.ate||'…')+'), mas só está na escola de '+(t.de||'…')+' a '+(t.ate||'…')+'.');}}
    m.append(panel('Copiar para outro período',h('div',{class:'flex flex-wrap items-end gap-3'},h('span',{class:'text-sm opacity-70 grow'},'Leva as aulas e o horário que está a editar para outro período, substituindo o que lá está. Útil quando uma mudança vale para o resto do ano.'),
      outros.length?field('Período de destino',selEl('cp-per',outros[0].id,outros.map(v=>[v.id,v.nome]),()=>{},'Período de destino')):null,
      btn('Copiar o horário atual',()=>{const id=$('#cp-per').value,v=S.horarios.find(x=>x.id===id);if(!v)return;mutate(()=>{v.lessons=JSON.parse(JSON.stringify(S.lessons));v.cards=JSON.parse(JSON.stringify(S.cards));});toast('Horário copiado para «'+v.nome+'».','Anular',desfazer,'ok');},'btn-sm',{disabled:busy||!outros.length})),
      avisos.length?h('ul',{class:'text-sm list-disc pl-5 text-warning',id:'per-avisos'},avisos.slice(0,40).map(x=>h('li',{},x))):h('p',{class:'text-xs opacity-60'},'Para professores que entram ou saem a meio do ano, preencha «Entra em» e «Sai em» nos Professores: aparecem aqui os períodos em que têm aulas fora dessas datas.')));
  });
  wrap('listagens',m=>{
    if(ui.lst!=='salas')return;const mdl=M(),ix=IX(),P=mdl.P,d=Math.min(S.days.length-1,ui.mapaD|0);
    m.append(panel('Mapa de ocupação das salas',h('div',{class:'flex flex-wrap items-end gap-3 noprint'},field('Dia',selEl('mapa-d',String(d),S.days.map((x,i)=>[String(i),x]),v=>{ui.mapaD=+v;render();},'Dia')),h('span',{class:'text-sm opacity-70'},'Para afixar: todas as salas num dia, tempo a tempo.')),
      h('div',{class:'hidden print:block fd font-bold'},'Ocupação das salas · '+S.days[d]),
      tableWrap(h('table',{class:'table table-xs',id:'mapa-tab'},h('thead',{},h('tr',{},h('th',{},'Sala'),S.periods.map(p=>h('th',{class:'text-center'},p.label+'.º',h('div',{class:'font-normal opacity-60'},p.start||''))))),h('tbody',{},S.rooms.map((r,ri)=>h('tr',{},h('th',{class:'whitespace-nowrap'},r.name),S.periods.map((p,pi)=>{const cs=mdl.cardsAt(mdl.R0+ri,d*P+pi);if(!cs.length)return h('td',{class:'text-center opacity-30'},'·');const l=ix.l.get(S.cards[cs[0]].lessonId);
        return h('td',{class:'text-center leading-tight'+(cs.length>1?' bg-error/20':'')},h('b',{},l.classIds.map(c=>nm('c',c)).join('+')||'—'),h('div',{class:'text-xs opacity-70'},uniq(l.linhas.map(ln=>sh('s',ln.s))).join('/')));}))))))));
  });
  wrap('alunos',m=>{
    if(ui.alTab!=='lista'||!S.alunos.length)return;const ix=IX(),lista=S.alunos.filter(a=>(a.apoio||[]).length);
    m.append(panel('Apoios fora da sala de aula',h('div',{class:'flex flex-wrap items-end gap-3 noprint'},field('Aluno',selEl('ap-al',(S.alunos[0]||{}).id,S.alunos.map(a=>[a.id,a.nome+' ('+nm('c',a.classId)+')']),()=>{},'Aluno','max-w-64')),field('Dia',selEl('ap-d','0',S.days.map((x,i)=>[String(i),x]),()=>{},'Dia')),field('Tempo',selEl('ap-p','0',S.periods.map((p,i)=>[String(i),p.label+'.º']),()=>{},'Tempo')),field('Apoio',h('input',{type:'text',id:'ap-t',class:'input input-sm w-56',placeholder:'Por exemplo: terapia da fala'})),
        btn('Acrescentar',()=>{const a=S.alunos.find(x=>x.id===$('#ap-al').value),v={d:+$('#ap-d').value,p:+$('#ap-p').value,t:$('#ap-t').value.trim()||'Apoio'};if(a)mutate(()=>{(a.apoio=a.apoio||[]).push(v);});},'btn-sm btn-primary',{disabled:busy})),
      lista.length?tableWrap(h('table',{class:'table table-sm',id:'apoio-tab'},h('thead',{},h('tr',{},['Aluno','Turma','Quando','Apoio','Aula de que sai',''].map(t=>h('th',{},t)))),h('tbody',{},lista.flatMap(a=>a.apoio.map(v=>{const fora=alAulas(a).filter(l=>(ix.cl.get(l.id)||[]).some(c=>c.day===v.d&&v.p>=c.period&&v.p<c.period+c.len));
        return h('tr',{},h('td',{class:'font-medium'},a.nome),h('td',{},nm('c',a.classId)),h('td',{},(S.days[v.d]||'')+', '+((S.periods[v.p]||{}).label||'')+'.º'),h('td',{},v.t),h('td',{},fora.map(l=>lessonLabel(l)).join('; ')||'tempo livre'),h('td',{class:'noprint'},btn('Apagar',()=>mutate(()=>{a.apoio=a.apoio.filter(x=>x!==v);}),'btn-xs btn-ghost text-error',{disabled:busy})));}))))):h('p',{class:'text-sm opacity-60'},'Registe aqui os alunos que saem da sala para apoios em tempos certos; a lista mostra de que aula saem.')));
  });
  wrap('substituicoes',m=>{
    const ix=IX(),mdl=M(),P=mdl.P,date=ui.cdate,wd=wdOf(date),key=date+'|'+ui.cteacher,rec=S.cover[key];if(!rec||wd>=S.days.length)return;
    const dk=Object.keys(S.cover).filter(k=>k.startsWith(date+'|')),abs=new Set(dk.map(k=>k.split('|')[1])),cov=(tid,p)=>dk.some(k=>{const o=S.cover[k];for(const sk in o)if(o[sk]===tid&&+sk.split('|')[1]===p)return true;return false;});
    const livre=(t,ti,slot,p)=>!abs.has(t.id)&&!mdl.busy(mdl.T0+ti,slot)&&mdl.level(mdl.T0+ti,slot)!==-3&&!cov(t.id,p),da=(t,s)=>(ix.lt.get(t.id)||[]).some(x=>x[1].s===s),props=[];
    for(const c of cardsFor('t',ui.cteacher).filter(c=>c.day===wd))for(let i=0;i<c.len;i++){const p=c.period+i,slot=wd*P+p;if(rec[c.id+'|'+p])continue;const l=ix.l.get(c.lessonId),subj=(l.linhas.find(ln=>ln.t===ui.cteacher)||l.linhas[0]).s;
      if(S.teachers.some((t,ti)=>t.id!==ui.cteacher&&livre(t,ti,slot,p)&&da(t,subj)))continue;
      for(let ti=0;ti<S.teachers.length;ti++){const B=S.teachers[ti];if(B.id===ui.cteacher||abs.has(B.id)||!da(B,subj)||cov(B.id,p))continue;const cb=mdl.cardsAt(mdl.T0+ti,slot);if(cb.length!==1)continue;const cB=S.cards[cb[0]],lB=ix.l.get(cB.lessonId);if(lB.linhas.filter(ln=>ln.t).length!==1)continue;const sB=lB.linhas[0].s;
        const ok=(t,tj)=>t.id!==B.id&&t.id!==ui.cteacher&&livre(t,tj,slot,p),C=S.teachers.find((t,tj)=>ok(t,tj)&&da(t,sB))||S.teachers.find(ok);if(C){props.push({c,p,l,B,cB,lB,C});break;}}}
    if(!props.length)return;
    m.append(panel('Substituições em cadeia',h('span',{class:'text-sm opacity-70'},'Nestes tempos não há nenhum professor livre da mesma disciplina. Um colega da disciplina dá a aula em falta e a aula dele passa para um professor livre.'),
      tableWrap(h('table',{class:'table table-sm',id:'cadeia-tab'},h('thead',{},h('tr',{},['TL','Aula em falta','Quem a dá','Aula que ele deixa','Quem fica com ela',''].map(t=>h('th',{},t)))),h('tbody',{},props.map(x=>h('tr',{},h('td',{class:'font-bold'},S.periods[x.p].label+'.º'),h('td',{},lessonLabel(x.l)),h('td',{},x.B.name),h('td',{},lessonLabel(x.lB)),h('td',{},x.C.name),
        h('td',{class:'noprint'},btn('Aplicar',()=>mutate(()=>{rec[x.c.id+'|'+x.p]=x.B.id;const k2=date+'|'+x.B.id;(S.cover[k2]=S.cover[k2]||{})[x.cB.id+'|'+x.p]=x.C.id;(S.coverP=S.coverP||{})[k2]=true;}),'btn-sm btn-primary',{disabled:busy})))))))));
  });
})();

