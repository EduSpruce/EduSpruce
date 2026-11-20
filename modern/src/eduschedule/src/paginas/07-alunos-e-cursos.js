/* ---------- alunos e cursos ---------- */
function alAulas(al){const fs=new Set(al.fora||[]),ex=new Set(al.extra||[]);return S.lessons.filter(l=>!l.ign&&((l.classIds.includes(al.classId)&&!fs.has(l.id))||(ex.has(l.id)&&!l.classIds.includes(al.classId))));}
function alChoques(){const m=M(),out=new Map();for(const k of m.clashes(20000)){if(k.r<m.G0)continue;for(const id of m.stuG[k.r-m.G0].alunos){let a=out.get(id);if(!a)out.set(id,a=[]);a.push(k);}}return out;}
function alHorario(al){
  const ix=IX(),grid=new Map();
  for(const l of alAulas(al))for(const c of ix.cl.get(l.id)||[])if(c.day!=null){const rs=roomsOfCard(c);for(let i=0;i<c.len;i++){const k=c.day+'-'+(c.period+i);let a=grid.get(k);if(!a)grid.set(k,a=[]);a.push({l,rs});}}
  openDlg('Horário de '+(al.nome||'aluno')+' ('+nm('c',al.classId)+')',tableWrap(h('table',{class:'table table-xs text-center'},h('thead',{},h('tr',{},h('th',{},''),S.days.map(d=>h('th',{},d)))),
    h('tbody',{},S.periods.map((p,pi)=>h('tr',{},h('th',{class:'whitespace-nowrap'},p.label+(p.start?' · '+p.start:'')),S.days.map((d,di)=>{const a=grid.get(di+'-'+pi)||[],bad=a.some((x,i)=>a.some((y,j)=>j>i&&(perMask(x.l.per,cicloK(S))&perMask(y.l.per,cicloK(S)))));
      return h('td',{class:bad?'bg-error/20':''},a.map(x=>h('div',{class:'leading-tight'},h('b',{},uniq(x.l.linhas.map(ln=>sh('s',ln.s))).join('/')),h('div',{class:'text-xs opacity-70'},uniq(x.l.linhas.map(ln=>ln.t&&sh('t',ln.t))).join('/')+' '+uniq(x.rs.map(r=>r&&nm('r',r))).join('/')+(x.l.per?' ('+perLabel(x.l.per,cicloK(S))+')':'')))));})))))),
    [btn('Imprimir (HTML)',()=>deliver('horario-'+slug(al.nome)+'.html',alFicheiros(al).html())),btn('Calendário (.ics)',()=>{const x=alFicheiros(al).ics();if(x)deliver('horario-'+slug(al.nome)+'.ics',x);else toast('São precisas as datas do ano letivo, as horas dos tempos e aulas colocadas.');}),btn('Fechar',closeDlg)],true);
}
function alDialog(al){
  const isNew=!al;al=al||{num:'',nome:'',classId:ui.alC||(S.classes[0]||{}).id||'',fora:[],extra:[]};
  let cls=al.classId;const fora=new Set(al.fora||[]),extra=new Set(al.extra||[]),ix=IX(),pri=new Map(),opcS=S.subjects.filter(s=>s.opc);(al.esc||[]).forEach((s,i)=>pri.set(s,String(i+1)));(al.sup||[]).forEach(s=>pri.set(s,'S'));
  const bx='flex flex-col gap-1 max-h-44 overflow-auto border border-base-300 rounded-box p-2',box=h('div',{class:bx,id:'al-mine'}),box2=h('div',{class:bx,id:'al-other'});
  const line=(l,on,fn,id)=>h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id,class:'checkbox checkbox-xs',checked:on,onchange:e=>fn(e.target.checked)}),lessonLabel(l)+' · '+l.tl+' TL'+(l.per?' ('+perLabel(l.per,cicloK(S))+')':''));
  const q=h('input',{type:'search',id:'al-q',class:'input input-sm w-full',placeholder:'Procurar aulas de outras turmas ou cursos','aria-label':'Procurar aulas de outras turmas',oninput:()=>fill()});
  function fill(){
    const mine=S.lessons.filter(l=>!l.ign&&l.classIds.includes(cls));
    box.replaceChildren(...(mine.length?mine.map(l=>line(l,!fora.has(l.id),v=>{if(v)fora.delete(l.id);else fora.add(l.id);},'al-m-'+l.id)):[h('span',{class:'text-sm opacity-60'},'A turma ainda não tem aulas.')]));
    const txt=q.value.trim().toLowerCase(),oth=S.lessons.filter(l=>!l.ign&&!l.classIds.includes(cls)&&(extra.has(l.id)||(txt?lessonLabel(l).toLowerCase().includes(txt):l.linhas.some(ln=>(ix.s.get(ln.s)||{}).opc)))).sort((a,b)=>(extra.has(b.id)?1:0)-(extra.has(a.id)?1:0)).slice(0,40);
    box2.replaceChildren(...(oth.length?oth.map(l=>line(l,extra.has(l.id),v=>{if(v)extra.add(l.id);else extra.delete(l.id);},'al-x-'+l.id)):[h('span',{class:'text-sm opacity-60'},'Escreva na pesquisa para encontrar aulas de outras turmas.')]));
  }
  fill();
  openDlg(isNew?'Novo aluno':'Editar aluno',h('div',{class:'flex flex-col gap-3'},
    h('div',{class:'flex flex-wrap gap-3 items-end'},field('N.º',h('input',{type:'text',id:'al-num',class:'input input-sm w-24',value:al.num||''})),field('Nome',h('input',{type:'text',id:'al-nome',class:'input input-sm w-64',value:al.nome||''})),field('Turma',selEl('al-cls',cls,optsOf(S.classes),v=>{cls=v;fill();},'Turma'))),
    h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Aulas da turma que frequenta'),box),
    h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Aulas de outras turmas e cursos'),q,box2),
    opcS.length?h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Escolhas de disciplinas opcionais, por ordem de preferência'),h('div',{class:'flex flex-wrap gap-3 items-end border border-base-300 rounded-box p-2'},opcS.map(s=>field(s.short||s.name,selEl('al-e-'+s.id,pri.get(s.id)||'',[['','—'],['1','1.ª escolha'],['2','2.ª escolha'],['3','3.ª escolha'],['4','4.ª escolha'],['S','Suplente']],v=>pri.set(s.id,v),'Escolha de '+s.name))),field('Opções a atribuir',h('input',{type:'number',id:'al-nopc',class:'input input-sm w-20',min:0,max:8,value:al.nOpc||''}),'vazio = todas'))):null,
    h('p',{class:'text-xs opacity-60'},'O otimizador nunca põe em simultâneo duas aulas do mesmo aluno. Desmarque a opção da turma que o aluno não frequenta e marque a aula da outra turma que frequenta em vez dela.')),
    [btn('Cancelar',closeDlg),btn(isNew?'Criar':'Guardar',()=>{const v={num:$('#al-num').value.trim(),nome:$('#al-nome').value.trim()||'Aluno',classId:cls,fora:[...fora].filter(id=>ix.l.has(id)&&ix.l.get(id).classIds.includes(cls)),extra:[...extra].filter(id=>ix.l.has(id)&&!ix.l.get(id).classIds.includes(cls)),esc:[...pri].filter(x=>x[1]&&x[1]!=='S').sort((a,b)=>a[1].localeCompare(b[1])).map(x=>x[0]),sup:[...pri].filter(x=>x[1]==='S').map(x=>x[0]),nOpc:$('#al-nopc')?+$('#al-nopc').value||0:0};closeDlg();
      mutate(()=>{if(isNew)S.alunos.push(Object.assign({id:uid()},v));else Object.assign(al,v);});if(!isNew){const k=alChoques().get(al.id);if(k)toast(al.nome+' ficou com '+k.length+' choques no horário atual. Veja o separador Choques.','Anular',desfazer,'bad');}},'btn-primary')],true);
}
function alImport(){
  openDlg('Importar lista de alunos',h('div',{class:'flex flex-col gap-2'},h('span',{class:'text-sm opacity-70'},'Uma linha por aluno: número; nome; turma. A seguir podem vir as disciplinas opcionais escolhidas, por ordem de preferência; ponha ? antes das suplentes (por exemplo 1;Ana Silva;7ºA;FR;?ESP). Pode colar do Excel.'),
    h('textarea',{id:'al-imp',class:'textarea w-full h-56 font-mono text-xs','aria-label':'Lista de alunos',placeholder:'1;Ana Silva;7ºA\n2;Rui Costa;7ºA'})),
    [btn('Cancelar',closeDlg),btn('Importar',()=>{const txt=$('#al-imp').value,byN=new Map(S.classes.map(c=>[c.name.toLowerCase().replace(/\s+/g,''),c.id]));let ok=0,ko=0;const add=[],bySub=new Map();S.subjects.forEach(s=>{bySub.set(s.name.toLowerCase(),s.id);if(s.short)bySub.set(s.short.toLowerCase(),s.id);});
      for(const ln of txt.split(/\r?\n/)){if(!ln.trim())continue;const p=ln.split(ln.includes('\t')?'\t':ln.includes(';')?';':',').map(x=>x.trim().replace(/^"|"$/g,''));const cid=byN.get((p[2]||'').toLowerCase().replace(/\s+/g,''));if(p.length<3||!cid){ko++;continue;}const esc2=[],sup2=[];for(const x of p.slice(3)){if(!x)continue;const q=x[0]==='?',sid=bySub.get((q?x.slice(1):x).trim().toLowerCase());if(sid)(q?sup2:esc2).push(sid);}add.push({id:uid(),num:p[0],nome:p[1]||'Aluno',classId:cid,fora:[],extra:[],esc:esc2,sup:sup2,nOpc:0});ok++;}
      closeDlg();if(ok)mutate(()=>{S.alunos.push(...add);});toast(ok+' alunos importados'+(ko?'; '+ko+' linhas ignoradas (turma desconhecida ou linha incompleta)':'')+'.');},'btn-primary btn-imp')],true);
}
function cursoInscrever(l){
  let cls=(S.classes.find(c=>!l.classIds.includes(c.id))||{}).id||'';const ch=new Map(),box=h('div',{class:'grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 max-h-64 overflow-auto border border-base-300 rounded-box p-2',id:'ci-box'});
  const fill=()=>{const al=S.alunos.filter(a=>a.classId===cls);box.replaceChildren(...(al.length?al.map(a=>h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'ci-'+a.id,class:'checkbox checkbox-xs',checked:ch.has(a.id)?ch.get(a.id):(a.extra||[]).includes(l.id),onchange:e=>ch.set(a.id,e.target.checked)}),(a.num?a.num+' · ':'')+a.nome)):[h('span',{class:'text-sm opacity-60'},'Esta turma não tem alunos registados.')]));};
  fill();
  openDlg('Inscrever alunos de outras turmas em '+lessonLabel(l),h('div',{class:'flex flex-col gap-3'},field('Turma',selEl('ci-cls',cls,optsOf(S.classes.filter(c=>!l.classIds.includes(c.id))),v=>{cls=v;fill();},'Turma')),box),
    [btn('Cancelar',closeDlg),btn('Guardar',()=>{closeDlg();if(ch.size)mutate(()=>{for(const a of S.alunos)if(ch.has(a.id)){const s=new Set(a.extra||[]);if(ch.get(a.id))s.add(l.id);else s.delete(l.id);a.extra=[...s];}});},'btn-primary')]);
}
PAGES.alunos=function(m){
  const ix=IX(),mdl=M();ui.alTab=ui.alTab||'lista';if(ui.alC&&!ix.c.has(ui.alC))ui.alC='';
  const chq=alChoques(),nCh=chq.size;
  m.append(pageHead('Alunos e cursos','Registe os alunos e as aulas que cada um frequenta; o otimizador evita choques entre as aulas do mesmo aluno.',
    btn('Novo aluno',()=>alDialog(),'btn-primary btn-sm noprint',{disabled:busy||!S.classes.length}),btn('Importar lista',alImport,'btn-sm btn-imp noprint',{disabled:busy||!S.classes.length}),btn('Imprimir',imprimir,'btn-sm noprint')));
  m.append(tabsEl([['lista','Alunos ('+S.alunos.length+')'],['cursos','Cursos e inscrições'],['dist','Distribuição e bandas'],['choques','Choques ('+nCh+')']],ui.alTab,v=>{ui.alTab=v;render();},'Alunos e cursos'));
  const tb=(heads,rows,empty)=>tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},heads.map(t=>h('th',{},t)))),h('tbody',{},rows,rows.length?null:h('tr',{},h('td',{colspan:heads.length,class:'opacity-60'},empty)))));
  if(ui.alTab==='lista'){
    const rows=S.alunos.filter(a=>(!ui.alC||a.classId===ui.alC)&&matchQ('al',[a.nome,String(a.num||'')])).sort((a,b)=>nm('c',a.classId).localeCompare(nm('c',b.classId))||String(a.num).localeCompare(String(b.num),undefined,{numeric:true})),pg=pager('al',rows.length,30);
    m.append(panel(null,h('div',{class:'flex flex-wrap items-end gap-3 noprint'},selEl('al-fc',ui.alC||'',optsOf(S.classes,'Todas as turmas'),v=>{ui.alC=v;ui.pg.al=0;render();},'Filtrar por turma'),searchEl('al','Procurar aluno'),h('span',{class:'grow'}),pg.el),
      tb(['N.º','Nome','Turma','Aulas','TL/semana','Noutras turmas','Não frequenta','Escolhas','Choques',''],rows.slice(pg.from,pg.to).map(a=>{const ls=alAulas(a),k=chq.get(a.id);
        return h('tr',{},h('td',{class:'num'},String(a.num||'')),h('td',{class:'font-medium'},a.nome),h('td',{},nm('c',a.classId)),h('td',{class:'num'},String(ls.length)),h('td',{class:'num'},String(Math.round(ls.reduce((n,l)=>n+l.tl*perFrac(l.per,cicloK(S)),0)*10)/10)),
          h('td',{class:'text-sm'},(a.extra||[]).filter(id=>ix.l.has(id)).map(id=>lessonLabel(ix.l.get(id))).join(', ')||'—'),h('td',{class:'text-sm'},(a.fora||[]).filter(id=>ix.l.has(id)).map(id=>uniq(ix.l.get(id).linhas.map(ln=>sh('s',ln.s))).join('/')).join(', ')||'—'),h('td',{class:'text-sm'},(a.esc||[]).filter(x=>ix.s.has(x)).map(x=>sh('s',x)).join(' > ')+((a.sup||[]).length?' (supl.: '+a.sup.filter(x=>ix.s.has(x)).map(x=>sh('s',x)).join(', ')+')':'')||'—'),
          h('td',{},k?badge(k.length+(k.length>1?' choques':' choque'),'bad'):badge('sem choques','ok')),
          h('td',{class:'noprint'},h('div',{class:'join'},btn('Horário',()=>alHorario(a),'btn-sm join-item'),btn('Editar',()=>alDialog(a),'btn-sm join-item',{disabled:busy}),btn('Apagar',()=>mutate(()=>{S.alunos=S.alunos.filter(x=>x!==a);}),'btn-sm join-item text-error',{disabled:busy}))));}),'Ainda não há alunos. Crie um aluno ou importe uma lista.')));return;}
  if(ui.alTab==='cursos'){
    const rows=[];S.lessons.forEach((l,li)=>{if(l.ign)return;const ext=S.alunos.filter(a=>(a.extra||[]).includes(l.id)&&!l.classIds.includes(a.classId)).length,out=S.alunos.filter(a=>(a.fora||[]).includes(l.id)&&l.classIds.includes(a.classId)).length;
      if((ext||out||l.maxAl||l.linhas.some(ln=>(ix.s.get(ln.s)||{}).opc))&&matchQ('cur',[lessonLabel(l)]))rows.push({l,li,ext,out});});
    const pg=pager('cur',rows.length,30);
    m.append(panel(null,h('div',{class:'flex flex-wrap items-end gap-3 noprint'},searchEl('cur','Procurar aula'),h('span',{class:'grow'}),pg.el),
      tb(['Aula','Professor','Inscritos','De outras turmas','Da turma que não frequentam','Máx. de alunos','Mín.','Sala (lugares)','Estado',''],rows.slice(pg.from,pg.to).map(({l,li,ext,out})=>{const n=mdl.need(li),rid=roomOfLine(l,l.linhas[0]),rm=rid&&ix.r.get(rid),cap=rm&&rm.cap|0;
        return h('tr',{},h('td',{class:'font-medium'},lessonLabel(l)),h('td',{},uniq(l.linhas.map(ln=>ln.t&&nm('t',ln.t))).join(', ')||'—'),h('td',{class:'num font-semibold'},String(n)),h('td',{class:'num'},String(ext)),h('td',{class:'num'},String(out)),
          h('td',{},h('input',{type:'number',id:'cur-max-'+l.id,class:'input input-xs w-20','aria-label':'Máximo de alunos',min:0,value:l.maxAl||'',disabled:busy,onchange:e=>mutate(()=>{l.maxAl=+e.target.value||0;})})),h('td',{},h('input',{type:'number',id:'cur-min-'+l.id,class:'input input-xs w-16','aria-label':'Mínimo de alunos',min:0,value:l.minAl||'',disabled:busy,onchange:e=>mutate(()=>{l.minAl=+e.target.value||0;})})),h('td',{},rm?rm.name+(cap?' ('+cap+')':''):'—'),
          h('td',{},l.minAl&&n<l.minAl?badge('abaixo do mínimo ('+l.minAl+')','warn'):l.maxAl&&n>l.maxAl?badge((n-l.maxAl)+' acima do máximo','bad'):cap&&n>cap?badge('sala pequena','warn'):badge('ok','ok')),
          h('td',{class:'noprint'},h('div',{class:'join'},btn('Inscrever',()=>cursoInscrever(l),'btn-sm join-item',{disabled:busy||!S.alunos.length}),btn('Simular fecho',()=>cursoSimular(l),'btn-sm join-item'))));}),'Aparecem aqui as aulas de disciplinas opcionais e as que têm alunos de outras turmas ou alunos da turma que não as frequentam.'),
      h('p',{class:'text-xs opacity-60'},'Os inscritos contam os alunos registados da turma, menos os que não frequentam, mais os de outras turmas. Sem alunos registados usa-se o número de alunos da turma.')));return;}
  if(ui.alTab==='dist'){distPanel(m);return;}
  const P=mdl.P,rows=[];for(const [id,ks] of chq){const a=S.alunos.find(x=>x.id===id);if(a)for(const k of ks)rows.push([a,k]);}
  m.append(panel(null,nCh?null:note('ok','Nenhum aluno tem duas aulas em simultâneo.'),nCh?tb(['Aluno','Turma','Quando','Aulas em simultâneo',''],rows.slice(0,300).map(([a,k])=>h('tr',{},h('td',{class:'font-medium'},a.nome),h('td',{},nm('c',a.classId)),h('td',{class:'whitespace-nowrap'},S.days[(k.s/P)|0]+', '+S.periods[k.s%P].label+'.º tempo'),h('td',{},k.cards.map(c=>lessonLabel(ix.l.get(S.cards[c].lessonId))).join('; ')),h('td',{class:'noprint'},btn('Horário',()=>alHorario(a),'btn-sm')))),''):null,
    nCh?h('p',{class:'text-xs opacity-60'},'Corra a Otimização para resolver os choques: as aulas de um aluno contam como um recurso que não pode estar em dois sítios ao mesmo tempo.'):null));
};

