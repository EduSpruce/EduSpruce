/* ---------- planificação anual ---------- */
const isoBr=d=>d?d.slice(8,10)+'/'+d.slice(5,7):'';
function hVersoes(){
  if(!S.horarios.length)return [{id:'',nome:'Horário único',de:S.inicio||'',ate:S.fim||'',lessons:S.lessons,cards:S.cards,ativo:true}];
  return S.horarios.map(v=>v.id===S.hAtivo?Object.assign({},v,{lessons:S.lessons,cards:S.cards,ativo:true}):v);
}
const hDe=(iso,vs)=>vs.find(v=>(!v.de||iso>=v.de)&&(!v.ate||iso<=v.ate))||null;
function semanas(){
  const out=[];if(!S.inicio||!S.fim)return out;const d=new Date(S.inicio+'T12:00:00');d.setDate(d.getDate()-((d.getDay()+6)%7));const fim=new Date(S.fim+'T12:00:00');
  for(let w=0;w<60&&d<=fim;w++){const wk={seg:d.toISOString().slice(0,10),dias:[],n:0};for(let i=0;i<7;i++){const iso=d.toISOString().slice(0,10);if(i<S.days.length){const ok=iso>=S.inicio&&iso<=S.fim&&!feriasEm(iso);wk.dias.push(ok?iso:null);if(ok)wk.n++;}d.setDate(d.getDate()+1);}out.push(wk);}
  return out;
}
function anualCalc(ate){
  const vs=hVersoes(),wks=semanas(),res=new Map(),byV=new Map();
  const mid=S.inicio&&S.fim?new Date((new Date(S.inicio+'T12:00:00').getTime()+new Date(S.fim+'T12:00:00').getTime())/2).toISOString().slice(0,10):'';
  for(const v of vs){const cl=new Map(),lm=new Map((v.lessons||[]).map(l=>[l.id,l]));for(const c of v.cards||[])if(c.day!=null){const l=lm.get(c.lessonId);if(!l||l.ign)continue;let a=cl.get(c.day);if(!a)cl.set(c.day,a=[]);a.push([l,c.len]);}byV.set(v,cl);}
  const get=id=>{let r=res.get(id);if(!r)res.set(id,r={tot:0,w:new Array(wks.length).fill(0),ov:new Set()});return r;};
  let tw=0;const KC=cicloK(S);
  wks.forEach((wk,wi)=>{const par=wk.n?(tw++)%KC:0;
    wk.dias.forEach((iso,wd)=>{if(!iso||(ate&&iso>ate))return;const v=hDe(iso,vs);if(!v)return;
      for(const [l,len] of byV.get(v).get(wd)||[]){if((l.de&&iso<l.de)||(l.ate&&iso>l.ate))continue;if(l.gsem){const g=(S.gsem||[]).find(x=>x.id===l.gsem);if(g&&!g.semanas.includes(wk.seg))continue;}if(l.per&&!(perMask(l.per,KC)>>perBit(par,iso<mid?0:1,KC)&1))continue;get(l.id).w[wi]+=len;}});});
  const pl=S.plano||{};for(const id in pl)for(const seg in pl[id]){const wi=wks.findIndex(w=>w.seg===seg);if(wi<0||(ate&&seg>ate))continue;const r=get(id);r.w[wi]=pl[id][seg];r.ov.add(wi);}
  for(const r of res.values())r.tot=r.w.reduce((a,b)=>a+b,0);
  return {wks,res,vs};
}
function hAbrir(id){ui.sel=null;mutate(()=>{const cur=S.horarios.find(v=>v.id===S.hAtivo),nx=S.horarios.find(v=>v.id===id);if(!nx||nx===cur)return;if(cur){cur.lessons=S.lessons;cur.cards=S.cards;}S.lessons=nx.lessons||[];S.cards=nx.cards||[];delete nx.lessons;delete nx.cards;S.hAtivo=id;});}
function hNovo(){
  const prox=d=>{if(!d)return '';const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+1);return x.toISOString().slice(0,10);},ant=d=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()-1);return x.toISOString().slice(0,10);};
  openDlg('Novo período do ano',h('div',{class:'flex flex-col gap-3'},h('span',{class:'text-sm opacity-70'},'O novo período começa com uma cópia das aulas e do horário que está a editar. Depois pode alterar aulas e recolocar à vontade sem mexer nos outros períodos.'),
    h('div',{class:'flex flex-wrap gap-3 items-end'},field('Nome',h('input',{type:'text',id:'hn-nome',class:'input input-sm w-56',value:(S.horarios.length?S.horarios.length+1:2)+'.º período'})),field('De',h('input',{type:'date',id:'hn-de',class:'input input-sm',value:ui.cdate})),field('Até',h('input',{type:'date',id:'hn-ate',class:'input input-sm',value:S.fim||''}))),
    h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'hn-ab',class:'checkbox checkbox-sm',checked:true}),'Passar a editar o novo período')),
    [btn('Cancelar',closeDlg),btn('Criar',()=>{const v={id:uid(),nome:$('#hn-nome').value.trim()||'Período',de:$('#hn-de').value,ate:$('#hn-ate').value},ab=$('#hn-ab').checked;closeDlg();
      mutate(()=>{if(!S.horarios.length){const b={id:uid(),nome:'1.º período',de:S.inicio||'',ate:v.de?ant(v.de):''};S.horarios.push(b);S.hAtivo=b.id;}
        else{const cur=S.horarios.find(x=>x.id===S.hAtivo);if(cur&&v.de&&(!cur.ate||cur.ate>=v.de)&&(!cur.de||cur.de<v.de))cur.ate=ant(v.de);}
        v.lessons=JSON.parse(JSON.stringify(S.lessons));v.cards=JSON.parse(JSON.stringify(S.cards));S.horarios.push(v);});
      if(ab)hAbrir(v.id);},'btn-primary')]);
}
function planoCel(l,wk,cur,isOv){
  openDlg(lessonLabel(l)+' · semana de '+isoBr(wk.seg),h('div',{class:'flex flex-col gap-2'},field('TL nesta semana',h('input',{type:'number',id:'pc-n',class:'input input-sm w-24',min:0,max:60,value:cur})),h('span',{class:'text-xs opacity-60'},'Altera só a contagem do plano anual; o horário semanal fica igual.')),
    [btn('Cancelar',closeDlg),isOv?btn('Repor o do horário',()=>{closeDlg();mutate(()=>{if(S.plano&&S.plano[l.id]){delete S.plano[l.id][wk.seg];if(!Object.keys(S.plano[l.id]).length)delete S.plano[l.id];}});}):null,btn('Guardar',()=>{const n=Math.max(0,+$('#pc-n').value||0);closeDlg();mutate(()=>{S.plano=S.plano||{};(S.plano[l.id]=S.plano[l.id]||{})[wk.seg]=n;});},'btn-primary')]);
}
PAGES.anual=function(m){
  const ix=IX();ui.anTab=ui.anTab||'sem';const vs=hVersoes(),act=vs.find(v=>v.ativo);
  m.append(pageHead('Planificação anual','Horários diferentes ao longo do ano e contagem das aulas semana a semana.',S.horarios.length?badge('A editar: '+(act?act.nome:'—'),'info'):null,btn('Imprimir',imprimir,'btn-sm noprint')));
  m.append(tabsEl([['sem','Semana a semana'],['per','Períodos do ano ('+vs.length+')']],ui.anTab,v=>{ui.anTab=v;render();},'Planificação anual'));
  if(!S.inicio||!S.fim)m.append(note('warn','Indique o início e o fim do ano letivo em Dados da escola, Calendário escolar.'));
  if(ui.anTab==='per'){
    const wks=semanas();let semH=0;for(const w of wks)for(const iso of w.dias)if(iso&&!hDe(iso,vs))semH++;
    const real=id=>S.horarios.find(x=>x.id===id),dt=(v,k)=>h('input',{type:'date',id:'hv-'+k+'-'+v.id,class:'input input-xs','aria-label':k==='de'?'De':'Até',value:v[k]||'',disabled:busy||!v.id,onchange:e=>mutate(()=>{real(v.id)[k]=e.target.value;})});
    m.append(panel(null,h('div',{class:'flex flex-wrap items-center gap-3 noprint'},h('span',{class:'text-sm opacity-70 grow'},'Cada período tem as suas aulas e o seu horário. Turmas, professores, salas, disponibilidades e prioridades são comuns a todo o ano.'),btn('Novo período a partir do horário atual',hNovo,'btn-primary btn-sm',{disabled:busy})),
      semH?note('warn',semH+' dias letivos não pertencem a nenhum período. Acerte as datas.'):null,
      tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},['Período','De','Até','Aulas','TL colocados','Estado',''].map(t=>h('th',{},t)))),h('tbody',{},vs.map(v=>{const tl=(v.cards||[]).reduce((n,c)=>n+c.len,0),pl=(v.cards||[]).reduce((n,c)=>n+(c.day!=null?c.len:0),0);
        return h('tr',{},h('td',{},v.id?h('input',{type:'text',id:'hv-n-'+v.id,class:'input input-xs w-44','aria-label':'Nome do período',value:v.nome,disabled:busy,onchange:e=>mutate(()=>{real(v.id).nome=e.target.value.trim()||'Período';})}):h('b',{},v.nome)),h('td',{},dt(v,'de')),h('td',{},dt(v,'ate')),h('td',{class:'num'},String((v.lessons||[]).length)),h('td',{class:'num'},pl+' / '+tl),
          h('td',{},v.ativo?badge('em edição','info'):badge('guardado','mute')),h('td',{class:'noprint'},v.id&&!v.ativo?h('div',{class:'join'},btn('Abrir',()=>hAbrir(v.id),'btn-sm join-item',{disabled:busy}),btn('Apagar',()=>mutate(()=>{S.horarios=S.horarios.filter(x=>x.id!==v.id);}),'btn-sm join-item text-error',{disabled:busy})):null));})))),
      h('p',{class:'text-xs opacity-60'},'Abrir um período troca as aulas e o horário que vê nas páginas Aulas, Otimização e Horários. As substituições e a contagem de aulas usam o período que estiver em vigor em cada data.')));return;}
  const {wks,res}=anualCalc();if(ui.anC&&!ix.c.has(ui.anC))ui.anC='';if(ui.anC==null)ui.anC=(S.classes[0]||{}).id||'';
  const rows=S.lessons.filter(l=>!l.ign&&(!ui.anC||l.classIds.includes(ui.anC))&&matchQ('an',[lessonLabel(l)])),pg=pager('an',rows.length,15),sum=new Array(wks.length).fill(0);
  for(const l of rows){const r=res.get(l.id);if(r)r.w.forEach((n,i)=>{sum[i]+=n;});}
  const wkTitle=w=>'Semana de '+isoBr(w.seg)+': '+w.n+' dias letivos';
  m.append(panel(null,h('div',{class:'flex flex-wrap items-end gap-3 noprint'},selEl('an-fc',ui.anC||'',optsOf(S.classes,'Todas as turmas'),v=>{ui.anC=v;ui.pg.an=0;render();},'Filtrar por turma'),searchEl('an','Procurar aula'),h('span',{class:'grow'}),pg.el),
    tableWrap(h('table',{class:'table table-xs',id:'an-tab'},h('thead',{},h('tr',{},h('th',{class:'sticky left-0 bg-base-100 z-10'},'Aula'),h('th',{class:'num'},'TL/sem.'),wks.map(w=>h('th',{class:'num px-1'+(w.n?'':' opacity-60'),title:wkTitle(w)},isoBr(w.seg))),h('th',{class:'num'},'Total'),h('th',{},'Alvo anual'),h('th',{class:'num'},'Diferença'))),
      h('tbody',{},rows.slice(pg.from,pg.to).map(l=>{const r=res.get(l.id)||{tot:0,w:[],ov:new Set()},dif=l.anual?r.tot-l.anual:null;
        return h('tr',{},h('th',{class:'sticky left-0 bg-base-100 z-10 whitespace-nowrap font-medium'},h('button',{type:'button',class:'link link-hover text-left',title:'Datas próprias e grupo de semanas',disabled:busy,onclick:()=>anualOpc(l)},lessonLabel(l)+(l.de||l.ate||l.gsem?' *':''))),h('td',{class:'num'},String(l.tl)),
          wks.map((w,i)=>h('td',{class:'num px-0'},w.n?h('button',{type:'button',class:'btn btn-ghost btn-xs px-1 min-h-0 h-5 font-normal'+(r.ov.has(i)?' text-primary font-bold':''),title:wkTitle(w)+(r.ov.has(i)?' (alterado à mão)':''),disabled:busy,onclick:()=>planoCel(l,w,r.w[i]||0,r.ov.has(i))},String(r.w[i]||0)):h('span',{class:'opacity-30'},'·'))),
          h('td',{class:'num font-semibold'},String(r.tot)),h('td',{},h('input',{type:'number',id:'an-alvo-'+l.id,class:'input input-xs w-16','aria-label':'Alvo anual de TL',min:0,value:l.anual||'',disabled:busy,onchange:e=>mutate(()=>{l.anual=+e.target.value||0;})})),
          h('td',{class:'num'},dif==null?'—':dif===0?badge('certo','ok'):badge((dif>0?'+':'')+dif,dif<0?'bad':'warn')));}),
        rows.length?h('tr',{},h('th',{class:'sticky left-0 bg-base-100 z-10'},'Total das aulas filtradas'),h('td',{}),sum.map(n=>h('td',{class:'num px-1 font-semibold'},String(n))),h('td',{class:'num font-bold'},String(sum.reduce((a,b)=>a+b,0))),h('td',{}),h('td',{})):h('tr',{},h('td',{colspan:wks.length+5,class:'opacity-60'},'Sem aulas para mostrar.'))))),
    h('p',{class:'text-xs opacity-60'},'Cada coluna é uma semana do ano letivo. Os valores vêm do horário em vigor nessa semana, sem os dias de férias e feriados; as aulas quinzenais contam nas semanas A ou B e as semestrais só no seu semestre. Carregue num valor para o alterar nessa semana.')));
};

