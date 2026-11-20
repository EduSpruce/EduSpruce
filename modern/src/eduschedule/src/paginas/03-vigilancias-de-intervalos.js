/* ---------- vigilâncias de intervalos ---------- */
PAGES.vigilancias=function(m){
  const mdl=M(),P=mdl.P,D=mdl.D,brks=[];S.periods.forEach((p,i)=>{if(p.breakAfter&&i<P-1)brks.push(i);});
  const max=S.vigMax||2,cnt=new Map();for(const k in S.vig)cnt.set(S.vig[k],(cnt.get(S.vig[k])||0)+1);
  const candOf=(d,b)=>{const out=[];S.teachers.forEach((t,ti)=>{const r=mdl.T0+ti;if(mdl.busy(r,d*P+b)||mdl.busy(r,d*P+b+1))out.push(t);});return out;};
  const auto=()=>{let miss=0;mutate(()=>{const c2=new Map(cnt);for(const b of brks)for(let d=0;d<D;d++){const cand=candOf(d,b),used=new Set(S.locais.map(l=>S.vig[d+'-'+b+'-'+l.id]).filter(Boolean));
    for(const l of S.locais){const k=d+'-'+b+'-'+l.id;if(S.vig[k])continue;let best=null,bc=1e9;for(const t of cand){const n=c2.get(t.id)||0;if(used.has(t.id)||n>=max)continue;if(n<bc){bc=n;best=t;}}
      if(best){S.vig[k]=best.id;used.add(best.id);c2.set(best.id,bc+1);}else miss++;}}});
    toast(miss?miss+' vigilâncias ficaram por atribuir: aumente o máximo por professor ou atribua à mão.':'Vigilâncias distribuídas.','Anular',desfazer);};
  m.append(pageHead('Vigilâncias','Professores de vigilância em cada intervalo, por local.',
    field('Máx. por professor',h('input',{type:'number',id:'vg-max',class:'input input-sm w-20',min:1,max:20,value:max,disabled:busy,onchange:e=>mutate(()=>{S.vigMax=Math.max(1,+e.target.value||2);})})),
    btn('Novo local',()=>mutate(()=>S.locais.push({id:uid(),nome:'Local '+(S.locais.length+1)})),'btn-sm self-end noprint',{disabled:busy}),
    btn('Distribuir automaticamente',auto,'btn-sm btn-primary self-end noprint',{disabled:busy||!S.locais.length||!brks.length}),
    btn('Limpar',()=>mutate(()=>{S.vig={};}),'btn-sm self-end noprint',{disabled:busy||!Object.keys(S.vig).length}),btn('Imprimir',imprimir,'btn-sm self-end noprint')));
  if(!brks.length){m.append(note('info','A grelha semanal não tem intervalos marcados. Marque-os em Dados da escola, Grelha semanal.'));return;}
  m.append(panel('Locais a vigiar',h('div',{class:'flex flex-wrap gap-2'},S.locais.map(l=>h('div',{class:'join'},h('input',{type:'text',id:'vg-l-'+l.id,class:'input input-sm join-item w-40','aria-label':'Nome do local',value:l.nome,disabled:busy,onchange:e=>mutate(()=>{l.nome=e.target.value.trim()||l.nome;})}),
    btn('Apagar',()=>mutate(()=>{S.locais=S.locais.filter(x=>x!==l);for(const k in S.vig)if(k.endsWith('-'+l.id))delete S.vig[k];}),'btn-sm join-item text-error noprint',{disabled:busy}))),
    S.locais.length?null:h('span',{class:'text-sm opacity-70'},'Crie os locais a vigiar, por exemplo Recreio, Bar ou Corredor A.'))));
  if(!S.locais.length)return;
  for(const b of brks){
    const p=S.periods[b],nx=S.periods[b+1];
    m.append(panel('Intervalo depois do '+p.label+'.º tempo'+(p.end&&nx.start?' ('+p.end+'–'+nx.start+')':''),tableWrap(h('table',{class:'table table-sm'},
      h('thead',{},h('tr',{},h('th',{},'Local'),S.days.map(d=>h('th',{},d)))),
      h('tbody',{},S.locais.map(l=>h('tr',{},h('td',{class:'font-medium'},l.nome),S.days.map((_,d)=>{
        const k=d+'-'+b+'-'+l.id,cur=S.vig[k]||'',cand=candOf(d,b).map(t=>({t,n:cnt.get(t.id)||0})).sort((x,y)=>x.n-y.n).slice(0,40);
        if(cur&&!cand.some(x=>x.t.id===cur)){const t=IX().t.get(cur);if(t)cand.unshift({t,n:cnt.get(cur)||0});}
        return h('td',{},selEl('vg-'+k,cur,[['','—']].concat(cand.map(x=>[x.t.id,x.t.name+' ('+x.n+')'])),v=>mutate(()=>{if(v)S.vig[k]=v;else delete S.vig[k];}),l.nome+', '+S.days[d],'max-w-44'));})))))),
      h('p',{class:'text-xs opacity-60 noprint'},'São propostos os professores com aula imediatamente antes ou depois do intervalo; entre parênteses, as vigilâncias que já têm.')));
  }
};

