/* ---------- listagens ---------- */
PAGES.listagens=function(m){
  const mdl=M(),ix=IX();
  m.append(pageHead('Listagens',null,btn('Imprimir',imprimir,'btn-sm noprint')));
  m.append(tabsEl([['dt','Diretores de turma'],['ct','Conselhos de turma'],['prof','Serviço dos professores'],['salas','Ocupação das salas'],['cargos','Cargos e CNL'],['pd','Previstas e dadas']],ui.lst,v=>{ui.lst=v;render();},'Listagem'));
  m.append(h('div',{class:'hidden print:block fd font-bold'},S.name+' · '+S.ano));
  const tbl=(heads,rows,empty)=>tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},heads.map(t=>typeof t==='string'?h('th',{},t):t))),h('tbody',{},rows,rows.length?null:h('tr',{},h('td',{colspan:heads.length,class:'opacity-60'},empty||'Nada para mostrar.')))));
  if(ui.lst==='dt'){m.append(panel('Diretores de turma',tbl(['Turma','Nome completo','Diretor de turma','Sala'],S.classes.map(c=>h('tr',{},h('td',{class:'font-medium'},c.name),h('td',{},c.full||''),h('td',{},c.dt?nm('t',c.dt):'—'),h('td',{},c.roomId?nm('r',c.roomId):'—'))))));return;}
  if(ui.lst==='ct'){
    const rows=S.classes.filter(c=>matchQ('lct',[c.name])),pg=pager('lct',rows.length,30),byC=new Map();
    for(const l of S.lessons)for(const ci of l.classIds){let mp=byC.get(ci);if(!mp)byC.set(ci,mp=new Map());for(const ln of l.linhas)if(ln.t){let s=mp.get(ln.t);if(!s)mp.set(ln.t,s=new Set());s.add(sh('s',ln.s));}}
    m.append(panel('Conselhos de turma',h('div',{class:'flex flex-wrap items-center gap-2 noprint'},searchEl('lct','Procurar turma'),h('span',{class:'grow'}),pg.el),
      tbl(['Turma','Professores e disciplinas'],rows.slice(pg.from,pg.to).map(c=>h('tr',{},h('td',{class:'font-medium align-top'},c.name),h('td',{class:'text-sm'},[...(byC.get(c.id)||[])].map(e=>nm('t',e[0])+(c.dt===e[0]?' (DT)':'')+' – '+[...e[1]].join(', ')).join('; ')||'—'))))));return;}
  if(ui.lst==='prof'){
    const rows=S.teachers.filter(t=>matchQ('lpr',[t.name,t.short,t.dep])),pg=pager('lpr',rows.length,30);
    m.append(panel('Serviço e carga diária dos professores',h('div',{class:'flex flex-wrap items-center gap-2 noprint'},searchEl('lpr','Procurar professor'),h('span',{class:'grow'}),pg.el),
      tbl([h('th',{},'Professor')].concat(S.days.map(d=>h('th',{class:'num'},d)),['TL','Furos','Min. letivos','Min. CNL'].map(t=>h('th',{class:'num'},t))),rows.slice(pg.from,pg.to).map(t=>{
        const r=mdl.resIdx('t',t.id),g=legenda(t.id);let gaps=0;
        return h('tr',{},h('td',{},t.name),S.days.map((_,d)=>{const inf=mdl.dayInfo(r,d);gaps+=inf.gaps;return h('td',{class:'num'},String(inf.n));}),h('td',{class:'num'},String(g.tlLet+g.tlCnl)),h('td',{class:'num'},String(gaps)),
          h('td',{class:'num'},g.minLet===S.alvo?String(g.minLet):badge(String(g.minLet),'warn')),h('td',{class:'num'},String(g.minCnl)));}))));return;}
  if(ui.lst==='salas'){
    const rows=S.rooms.filter(r=>matchQ('lsa',[r.name,r.ed])),pg=pager('lsa',rows.length,30),tot=mdl.NS;
    m.append(panel('Ocupação das salas',h('div',{class:'flex flex-wrap items-center gap-2 noprint'},searchEl('lsa','Procurar sala'),h('span',{class:'grow'}),pg.el),
      tbl([h('th',{},'Sala'),h('th',{},'Edifício'),h('th',{class:'num'},'TL ocupados'),h('th',{class:'num'},'Ocupação'),h('th',{},'')],rows.slice(pg.from,pg.to).map(rm=>{
        const r=mdl.resIdx('r',rm.id);let n=0;for(let d=0;d<mdl.D;d++)n+=popc(mdl.dayMask(r,d));const pc=tot?Math.round(n/tot*100):0;
        return h('tr',{},h('td',{},rm.name),h('td',{},rm.ed||''),h('td',{class:'num'},String(n)),h('td',{class:'num'},pc+'%'),h('td',{class:'w-40'},h('progress',{class:'progress '+(pc>85?'progress-warning':'progress-primary')+' w-36',value:n,max:Math.max(1,tot),'aria-label':'Ocupação de '+rm.name})));}))));return;}
  if(ui.lst==='pd'){
    if(!ui.pdate)ui.pdate=new Date().toISOString().slice(0,10);
    const ano=anualCalc().res,ate=anualCalc(ui.pdate).res,anul=new Map(),subs=new Map(),byCard=new Map(S.cards.map(c=>[c.id,c.lessonId]));
    for(const k in S.cover){if(k.split('|')[0]>ui.pdate)continue;const o=S.cover[k];for(const sk in o){const lid=byCard.get(sk.split('|')[0]);if(!lid)continue;const mp=o[sk]==='x'?anul:subs;mp.set(lid,(mp.get(lid)||0)+1);}}
    for(const e of S.exames.concat(S.eventos)){if(e.data>ui.pdate)continue;const wd=(new Date(e.data+'T12:00:00').getDay()+6)%7;for(const c of S.cards)if(c.day===wd){const l=ix.l.get(c.lessonId);if(!l.classIds.some(x=>e.classIds.includes(x)))continue;let n=0;for(let i=0;i<c.len;i++)if(c.period+i>=e.period&&c.period+i<e.period+e.len)n++;if(n)anul.set(l.id,(anul.get(l.id)||0)+n);}}
    for(const x of S.pontuais){if(!x.comp||x.nd>ui.pdate)continue;const c=S.cards.find(k=>k.id===x.cardId);if(c){const lid=c.lessonId;anul.set(lid,Math.max(0,(anul.get(lid)||0)-c.len));}}
    const rows=S.lessons.filter(l=>!l.ign&&matchQ('lpd',[lessonLabel(l)])),pg=pager('lpd',rows.length,30),fr=l=>l.per?.5:1;
    const tot=(l,cnt)=>{let n=0;for(const c of ix.cl.get(l.id)||[])if(c.day!=null)n+=c.len*cnt[c.day];return Math.round(n*fr(l));};
    m.append(panel('Aulas previstas e dadas',h('div',{class:'flex flex-wrap items-end gap-3 noprint'},field('Contar até',h('input',{type:'date',id:'pd-date',class:'input input-sm',value:ui.pdate,onchange:e=>{if(e.target.value){ui.pdate=e.target.value;render();}}})),searchEl('lpd','Procurar aula'),h('span',{class:'grow'}),pg.el),
      !S.inicio||!S.fim?note('warn','Indique o início e o fim do ano letivo em Dados da escola, Calendário escolar.'):null,
      tbl([h('th',{},'Aula'),h('th',{},'Professor'),h('th',{class:'num'},'TL/semana'),h('th',{class:'num'},'Previstas no ano'),h('th',{class:'num'},'Previstas até à data'),h('th',{class:'num'},'Anuladas'),h('th',{class:'num'},'Substituídas'),h('th',{class:'num'},'Dadas'),h('th',{class:'num'},'Por dar')],rows.slice(pg.from,pg.to).map(l=>{
        const pa=(ano.get(l.id)||{}).tot||0,pt=(ate.get(l.id)||{}).tot||0,an=anul.get(l.id)||0,dadas=Math.max(0,pt-an);
        return h('tr',{},h('td',{},lessonLabel(l)),h('td',{},uniq(l.linhas.map(ln=>ln.t&&nm('t',ln.t))).join(', ')||'—'),h('td',{class:'num'},String(l.tl)),h('td',{class:'num'},String(pa)),h('td',{class:'num'},String(pt)),h('td',{class:'num'},String(an)),h('td',{class:'num'},String(subs.get(l.id)||0)),h('td',{class:'num font-semibold'},String(dadas)),h('td',{class:'num'},String(Math.max(0,pa-dadas))));})),
      h('p',{class:'text-xs opacity-60'},'Conta os dias letivos do calendário escolar, sem férias nem feriados, pelo horário colocado. As aulas anuladas nas Substituições e as suspensas por exames e eventos são descontadas; as quinzenais contam nas semanas A ou B e as semestrais no seu semestre. Com vários períodos do ano, cada data usa o horário em vigor.')));return;}
  const rows=[];for(const l of S.lessons)if(!l.classIds.length)for(const ln of l.linhas)rows.push([l,ln]);
  const pg=pager('lcg',rows.length,40);
  m.append(panel('Cargos e componente não letiva (aulas sem turma)',h('div',{class:'flex noprint'},h('span',{class:'grow'}),pg.el),tbl([h('th',{},'Professor'),h('th',{},'Cargo ou atividade'),h('th',{class:'num'},'TL'),h('th',{class:'num'},'Minutos')],
    rows.slice(pg.from,pg.to).map(x=>{const s=ix.s.get(x[1].s)||{};return h('tr',{},h('td',{},x[1].t?nm('t',x[1].t):'—'),h('td',{},(s.name||'?')+(s.cnl?' (CNL)':'')),h('td',{class:'num'},String(x[0].tl)),h('td',{class:'num'},String(x[0].valor?x[0].valor:x[0].tl*(+s.fator||S.tlMin))));}))));
};

