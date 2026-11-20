/* ---------- bloco A: importação com pré-visualização, XML de intercâmbio, autoteste, histórico, trocas, cores, notas, cursos ---------- */
function gpu016(st,text){
  const by={T:new Map(st.teachers.flatMap(t=>[[String(t.short||'').toLowerCase(),t.id],[String(t.proc||'').toLowerCase(),t.id]])),C:new Map(st.classes.map(c=>[c.name.toLowerCase(),c.id])),R:new Map(st.rooms.map(r=>[r.name.toLowerCase(),r.id])),S:new Map(st.subjects.map(s=>[String(s.short||s.name).toLowerCase(),s.id]))},pre={T:'t',C:'c',R:'r',S:'s'};let ok=0,ko=0;
  for(const r of parseDIF(text)){const name=String(r[0]||'').toLowerCase(),ty=String(r[1]||'').toUpperCase(),d=+r[2],p=+r[3],v=+r[4],id=by[ty]&&(by[ty].get(name)||by[ty].get(name.replace('.','º')));if(!id||!(v>=-3&&v<=3)){ko++;continue;}
    const key=pre[ty]+':'+id;if(d===0&&p===0){delete st.off[key];ok++;continue;}if(d<1||d>st.days.length||p<1||p>st.periods.length){ko++;continue;}const o=st.off[key]||(st.off[key]={});if(v)o[(d-1)+'-'+(p-1)]=v;else delete o[(d-1)+'-'+(p-1)];ok++;}
  return {ok,ko};
}
function xmlTrocaIn(text){
  const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror')||!doc.documentElement||doc.documentElement.localName!=='document')throw new Error('Este ficheiro não é um XML de intercâmbio válido.');
  const q=(el,tag)=>{if(el)for(const c of el.children)if(c.localName===tag)return c;return null;},tx=(el,tag)=>{const c=q(el,tag);return c?c.textContent.trim():'';},all=tag=>Array.from(doc.getElementsByTagNameNS('*',tag)),ref=(el,tag)=>{const c=q(el,tag);return c?(c.getAttribute('id')||''):'';};
  const gen=q(doc.documentElement,'general'),st=baseState(tx(gen,'schoolname')||S.name),iso=d=>/^\d{8}$/.test(d)?d.slice(0,4)+'-'+d.slice(4,6)+'-'+d.slice(6):'',hm=t=>/^\d{3,4}$/.test(t)?t.padStart(4,'0').slice(0,2)+':'+t.padStart(4,'0').slice(2):'';
  st.ano=tx(gen,'header2')||S.ano;st.inicio=iso(tx(gen,'schoolyearbegindate'))||st.inicio;st.fim=iso(tx(gen,'schoolyearenddate'))||st.fim;
  let maxD=5,maxP=0;const tp=new Map();for(const t of all('timeperiod')){const d=+tx(t,'day'),p=+tx(t,'period');if(d>maxD)maxD=d;if(p>maxP)maxP=p;if(!tp.has(p))tp.set(p,[hm(tx(t,'starttime')),hm(tx(t,'endtime'))]);}
  const R=new Map(),SU=new Map(),T=new Map(),C=new Map();
  for(const e of all('room')){const id=e.getAttribute('id')||'',o={id:uid(),name:tx(e,'longname')||id.replace(/^RM_/,''),cap:+tx(e,'capacity')||0,_alt:ref(e,'room_alternative')};R.set(id,o);st.rooms.push(o);}
  for(const o of st.rooms){if(o._alt&&R.has(o._alt))o.alt=R.get(o._alt).id;delete o._alt;}
  for(const e of all('subject')){const id=e.getAttribute('id')||'',o={id:uid(),short:id.replace(/^SU_/,''),name:tx(e,'longname')||id.replace(/^SU_/,'')};SU.set(id,o);st.subjects.push(o);}
  for(const e of all('teacher')){const id=e.getAttribute('id')||'',sn=[tx(e,'forename'),tx(e,'surname')].filter(Boolean).join(' '),o={id:uid(),short:id.replace(/^TR_/,''),name:sn||id.replace(/^TR_/,''),proc:tx(e,'payrollnumber')};T.set(id,o);st.teachers.push(o);}
  for(const e of all('class')){const id=e.getAttribute('id')||'',o={id:uid(),name:id.replace(/^CL_/,''),full:tx(e,'longname'),dt:(T.get(ref(e,'class_teacher'))||{}).id||'',roomId:(R.get(ref(e,'class_room'))||{}).id||''};C.set(id,o);st.classes.push(o);}
  const G=new Map();
  for(const e of all('lesson')){const id=e.getAttribute('id')||'',num=id.replace(/^LS_/,''),n=num.length>2?+num.slice(0,-2):+num;if(!SU.has(ref(e,'lesson_subject')))continue;let g=G.get(n);if(!g)G.set(n,g={n,tl:0,cls:new Set(),lines:[]});
    const cls=ref(e,'lesson_classes').split(/\s+/).filter(x=>C.has(x)).map(x=>C.get(x).id);cls.forEach(x=>g.cls.add(x));g.tl=Math.max(g.tl,+tx(e,'periods')||0);
    const times=[];const tt=q(e,'times');if(tt)for(const t of tt.children){const d=+tx(t,'assigned_day'),p=+tx(t,'assigned_period');if(d>=1&&p>=1){times.push({d:d-1,p:p-1,r:(R.get(ref(t,'assigned_room'))||{}).id||''});if(p>maxP)maxP=p;if(d>maxD)maxD=d;}}
    g.lines.push({s:SU.get(ref(e,'lesson_subject')).id,t:(T.get(ref(e,'lesson_teacher'))||{}).id||'',cls,times});}
  st.days=['Seg','Ter','Qua','Qui','Sex','Sáb'].slice(0,Math.max(5,Math.min(6,maxD)));for(let i=1;i<=Math.min(16,maxP);i++){const x=tp.get(i)||['',''];st.periods.push({label:String(i),start:x[0],end:x[1],breakAfter:false});}
  for(const g of [...G.values()].sort((a,b)=>a.n-b.n)){const id=uid(),all2=[...g.cls],slots=[...new Set(g.lines.flatMap(l=>l.times.map(t=>t.d*100+t.p)))].filter(x=>x%100<st.periods.length).sort((a,b)=>a-b),blocks=[];
    for(const s of slots){const b=blocks[blocks.length-1];if(b&&b.s+b.len===s)b.len++;else blocks.push({s,len:1});}
    st.lessons.push({id,n:g.n,classIds:all2,linhas:g.lines.map(l=>{const o={s:l.s,t:l.t,r:'',tip:''};if(l.cls.length&&l.cls.length<all2.length)o.cls=l.cls;return o;}),tl:Math.max(g.tl,slots.length),duplos:blocks.filter(b=>b.len===2).length,blocos:blocks.filter(b=>b.len>2).map(b=>b.len).join(','),per:''});
    for(const b of blocks)st.cards.push({id:uid(),lessonId:id,len:b.len,day:Math.floor(b.s/100),period:b.s%100,locked:false,r:g.lines.map(l=>{const t=l.times.find(x=>x.d*100+x.p===b.s);return t?(t.r||'-'):'';})});}
  return st;
}
function importPreview(st,fs){
  const names=Object.keys(fs||{}),f16=names.find(n=>/GPU016/i.test(n)),f1=names.find(n=>/GPU001/i.test(n)),desc=names.filter(n=>!/GPU0(0[1-6]|16)/i.test(n));let r16=null;if(f16)r16=gpu016(st,fs[f16]);
  const lin=f1?fs[f1].split(/\r?\n/).filter(x=>x.trim()).length:0,tl=st.cards.reduce((n,c)=>n+(c.day!=null?c.len:0),0),nOff=Object.keys(st.off).length;
  const row=(a,b)=>h('tr',{},h('td',{},a),h('td',{class:'num font-semibold'},String(b))),ck=(k,t)=>h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'ip-'+k,class:'checkbox checkbox-sm',checked:true}),t);
  openDlg('Pré-visualização da importação',h('div',{class:'flex flex-col gap-3',id:'ip-box'},
    h('table',{class:'table table-sm w-auto'},h('tbody',{},row('Turmas',st.classes.length),row('Professores',st.teachers.length),row('Salas',st.rooms.length),row('Disciplinas',st.subjects.length),row('Aulas',st.lessons.length),row('Tempos colocados',tl),row('Elementos com disponibilidades',nOff))),
    h('div',{class:'text-sm flex flex-col gap-1'},names.length?h('span',{},'Ficheiros lidos: '+names.filter(n=>!desc.includes(n)).join(', ')):null,lin?h('span',{},'GPU001: '+lin+' linhas lidas.'):null,r16?h('span',{},'GPU016: '+r16.ok+' disponibilidades lidas'+(r16.ko?', '+r16.ko+' linhas ignoradas (elemento desconhecido ou fora da grelha)':'')+'.'):null,
      desc.length?h('span',{class:'text-warning'},'Ignorados (formato não suportado): '+desc.join(', ')):null),
    field('Como importar',selEl('ip-modo','juntar',[['juntar','Juntar as aulas ao horário atual, sem apagar nada (recomendado)'],['tudo','Substituir todos os dados atuais'],['fundir','Fundir: acrescentar aos dados atuais só o que falta']],v=>{$('#ip-partes').classList.toggle('hidden',v!=='fundir');},'Modo')),
    h('div',{id:'ip-partes',class:'hidden flex flex-wrap gap-4'},ck('classes','Turmas'),ck('teachers','Professores'),ck('rooms','Salas'),ck('subjects','Disciplinas'),ck('off','Disponibilidades'),h('span',{class:'text-xs opacity-60 w-full'},'Na fusão compara-se pelo código. As aulas e o horário atuais não são alterados.'))),
    [btn('Cancelar',closeDlg),btn('Importar',()=>{const modo=$('#ip-modo').value,on=k=>$('#ip-'+k).checked,sel={classes:on('classes'),teachers:on('teachers'),rooms:on('rooms'),subjects:on('subjects'),off:on('off')};closeDlg();
      if(modo==='juntar'){const pg=updfDeEstado(st);if(!pg.length){toast('Os ficheiros não têm aulas colocadas para juntar.',null,null,'bad');return}updfPrever(pg);return}
      if(modo==='tudo'){replaceAll(st,'Importado: '+st.classes.length+' turmas, '+st.teachers.length+' professores, '+st.lessons.length+' aulas.');location.hash='horarios';return;}
      let n=0;const key=x=>String(x.short||x.name||'').toLowerCase(),map=new Map();
      mutate(()=>{for(const k of ['classes','teachers','rooms','subjects']){const has=new Map(S[k].map(x=>[key(x),x.id]));for(const x of st[k]){const kk=key(x);if(has.has(kk)){map.set(x.id,has.get(kk));continue;}map.set(x.id,x.id);if(!sel[k])continue;const o=JSON.parse(JSON.stringify(x));if(k==='classes'){o.roomId='';o.dt='';}if(k==='rooms')o.alt='';S[k].push(o);has.set(kk,o.id);n++;}}
        if(sel.off)for(const ok in st.off){const id=map.get(ok.slice(2));if(!id||!IXhas(ok[0],id))continue;const dst=ok[0]+':'+id;if(!S.off[dst]){S.off[dst]=st.off[ok];n++;}}normalize(S);});
      toast('Fusão concluída: '+n+' elementos acrescentados.','Anular',desfazer,'ok');},'btn-primary btn-imp')],true);
}
const IXhas=(k,id)=>S[KINDS[k][0]].some(x=>x.id===id);
function autoteste(){
  const out=[],t0=Date.now(),ok=(n,v,d)=>out.push([n,!!v,d||'']);
  try{const st=normalize(sample()),m=createModel(st);m.load();const sv=m.solver({keep:false,ms:1500,seed:11});let pr,bad=0;for(let i=0;i<10;i++){sv.step(40);if(!sv.selfCheck().ok)bad++;}do{pr=sv.step(200);}while(!pr.done);
    const by=new Map(st.cards.map(c=>[c.id,c]));sv.result().forEach(r=>{const c=by.get(r.id);c.day=r.day;c.period=r.period;if(r.r)c.r=r.r;else delete c.r;});const m2=createModel(st);m2.load();const rep=m2.report();
    ok('Motor: todas as aulas colocadas',rep.unplaced===0,rep.placed+' de '+rep.total+' TL');ok('Motor: sem conflitos',rep.clash===0&&rep.blocked===0);ok('Motor: custo incremental igual ao recalculado',bad===0);ok('Verificador independente sem erros',verify(st).length===0);
    const ch=m2.chains(0,3);ok('Trocas em cadeia repõem o modelo',m2.report().cost===rep.cost,ch.length+' propostas');
    st.ciclo=3;st.lessons[0].per='W13';ok('Periodicidades: máscaras do ciclo',perMask('W13',3)===45&&perMask('A',2)===10&&perMask('',2)===15);
    const big=bigSample({classes:12,teachers:60,seed:3}).st,mb=createModel(normalize(big));mb.load();const sb=mb.solver({keep:false,ms:2500,seed:5});do{pr=sb.step(200);}while(!pr.done);ok('Escola média (12 turmas): tudo colocado',pr.unplaced===0,pr.placed+' de '+pr.total+' TL');
  }catch(e){ok('Motor sem exceções',false,String(e.message||e));}
  try{const x=xmlTroca(),st2=xmlTrocaIn(x);ok('XML de intercâmbio: exportar e voltar a ler',st2.classes.length===S.classes.length&&st2.teachers.length===S.teachers.length&&st2.lessons.length>0,st2.lessons.length+' aulas, '+st2.cards.filter(c=>c.day!=null).length+' colocações');}catch(e){ok('XML de intercâmbio: exportar e voltar a ler',false,String(e.message||e));}
  try{const rows=expRows('tl'),tl=S.cards.reduce((n,c)=>n+(c.day!=null?c.len:0),0);ok('Exportação: linhas para todos os TL colocados',!tl||rows.length>=tl,rows.length+' linhas');}catch(e){ok('Exportação sem exceções',false,String(e.message||e));}
  try{const rep=JSON.parse(JSON.stringify(S));ok('Dados atuais: cópia e normalização estáveis',JSON.stringify(normalize(JSON.parse(JSON.stringify(normalize(rep))))).length===JSON.stringify(normalize(rep)).length);}catch(e){ok('Dados atuais normalizáveis',false,String(e.message||e));}
  ok('Sem erros de execução nesta sessão',ERRS.length===0,ERRS.length?ERRS.length+' erros (veja o relatório de erros)':'');
  const fail=out.filter(x=>!x[1]).length;
  openDlg('Autoteste',h('div',{class:'flex flex-col gap-2',id:'autoteste'},h('div',{},badge(fail?fail+' falhas':'tudo passou',fail?'bad':'ok'),' ',h('span',{class:'text-sm opacity-70'},out.length+' verificações em '+((Date.now()-t0)/1000).toFixed(1)+' s')),
    h('table',{class:'table table-sm'},h('tbody',{},out.map(x=>h('tr',{},h('td',{},badge(x[1]?'passou':'falhou',x[1]?'ok':'bad')),h('td',{},x[0]),h('td',{class:'text-sm opacity-70'},x[2])))))),[btn('Fechar',closeDlg,'btn-primary')],true);
}
const undoT=[];
function historico(){
  openDlg('Histórico de passos',h('div',{class:'flex flex-col gap-2',id:'hist'},h('span',{class:'text-sm opacity-70'},'Pode voltar a qualquer um dos últimos '+undo.length+' passos desta sessão. Voltar atrás não apaga os passos: Refazer continua disponível.'),
    undo.length?h('ul',{class:'flex flex-col gap-1 max-h-80 overflow-auto'},undo.map((_,i)=>i).reverse().map(i=>{const t=undoT[undoT.length-(undo.length-i)],n=undo.length-i;return h('li',{class:'flex items-center gap-2 text-sm'},btn('Voltar '+n+(n>1?' passos':' passo'),()=>{closeDlg();for(let k=0;k<n;k++)desfazer();toast('Recuou '+n+(n>1?' passos.':' passo.'));},'btn-xs'),h('span',{class:'opacity-70'},t?new Date(t[0]).toLocaleTimeString('pt-PT')+' · '+((NAV.flatMap(g=>g.items).find(x=>x[0]===t[1])||[])[1]||t[1]):'alteração'));})):h('p',{class:'text-sm opacity-60'},'Ainda não há passos para anular.')),[btn('Fechar',closeDlg)]);
}
const PALETA=['#ef4444','#f59e0b','#84cc16','#10b981','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#f97316','#14b8a6','#6366f1','#a855f7','#eab308','#22c55e','#0ea5e9','#d946ef'];
function corPor(l,use,fallback){const m=S.corPor;if(!m||m==='d')return fallback;const id=m==='t'?(use[0].ln.t||''):m==='c'?(l.classIds[0]||''):(use[0].room||'');if(!id)return fallback;const arr=S[KINDS[m][0]],i=arr.findIndex(x=>x.id===id);return i<0?fallback:PALETA[i%PALETA.length];}
function trocarCom(sel,oid){
  const o=S.cards.find(c=>c.id===oid);if(!o)return;const a=[sel.day,sel.period],b=[o.day,o.period];
  mutate(()=>{ui.sel=null;sel.day=b[0];sel.period=b[1];o.day=a[0];o.period=a[1];delete sel.r;delete o.r;delete sel.rx;delete o.rx;});
  const k=REP().clash;toast(k?'Trocadas, mas ficaram '+k+' conflitos: veja o Diagnóstico.':'Aulas trocadas sem conflitos.','Anular',desfazer,k?null:'ok');
}
function cursoSimular(l){
  const ix=IX(),sids=uniq(l.linhas.map(ln=>ln.s)).filter(x=>(ix.s.get(x)||{}).opc),als=S.alunos.filter(a=>alAulas(a).includes(l)),outros=S.lessons.filter(x=>x!==l&&!x.ign&&x.linhas.some(ln=>sids.includes(ln.s))),K=cicloK(S);
  const slots=x=>{const o=[];for(const c of ix.cl.get(x.id)||[])if(c.day!=null)for(let i=0;i<c.len;i++)o.push(c.day*100+c.period+i);return o;};let com=0,sem=0;const cnt=new Map(outros.map(x=>[x.id,S.alunos.filter(a=>alAulas(a).includes(x)).length]));
  for(const a of als){const occ=new Set();for(const x of alAulas(a))if(x!==l)for(const s of slots(x))occ.add(s);const alt=outros.find(x=>!(x.maxAl>0&&cnt.get(x.id)>=x.maxAl)&&!slots(x).some(s=>occ.has(s)));if(alt){com++;cnt.set(alt.id,cnt.get(alt.id)+1);}else sem++;}
  openDlg('Simular o fecho de '+lessonLabel(l),h('div',{class:'flex flex-col gap-2 text-sm',id:'sim-box'},h('p',{},'Este curso tem '+als.length+' alunos inscritos e há '+outros.length+' cursos alternativos da mesma disciplina.'),h('div',{class:'flex gap-2'},badge(com+' cabem noutro curso sem choque','ok'),badge(sem+' ficam sem lugar',sem?'bad':'ok')),
    h('p',{class:'opacity-70'},'É só uma simulação: nada foi alterado. Para fechar o curso, apague a aula e corra a distribuição automática.')),[btn('Fechar',closeDlg,'btn-primary')]);
}
(function(){
  const wrap=(n,fn)=>{const o=PAGES[n];PAGES[n]=m=>{o(m);fn(m);};};
  wrap('ficheiro',m=>{
    m.append(panel('Testes e histórico',h('div',{class:'flex flex-wrap items-center gap-2'},h('span',{class:'text-sm opacity-70 grow'},'O autoteste corre o motor, o verificador independente, as trocas em cadeia e as exportações neste computador, sem tocar nos seus dados.'),
      btn('Correr o autoteste',autoteste,'btn-sm btn-primary',{disabled:busy}),btn('Histórico de passos ('+undo.length+')',historico,'btn-sm'),
      h('label',{class:'btn btn-sm btn-imp',for:'im-xml'},'Importar XML de intercâmbio…'),h('input',{type:'file',id:'im-xml',accept:'.xml,text/xml,application/xml',class:'sr-only',disabled:busy,onchange:async ev=>{const f=ev.target.files[0];if(!f)return;try{importPreview(xmlTrocaIn(await f.text()),{});}catch(x){toast(x.message||'Não foi possível ler esse ficheiro.',null,null,'bad');}ev.target.value='';}}))));
  });
  wrap('horarios',m=>{
    if(!ui.id||ui.visao!=='ind')return;const ix=IX(),sel=ui.sel&&S.cards.find(c=>c.id===ui.sel),lado=ui.lado||(ui.lado={k:'',id:''});
    if(sel&&sel.day!=null){const l=ix.l.get(sel.lessonId),outras=cardsFor(ui.kind,ui.id).filter(c=>c.id!==sel.id&&c.day!=null&&c.len===sel.len&&!c.locked&&!ix.l.get(c.lessonId).fixa);
      m.append(h('div',{class:'flex flex-wrap items-end gap-3 noprint'},field('Trocar com outra aula deste horário',selEl('tr-com','',[['','Escolher…']].concat(outras.map(c=>[c.id,S.days[c.day]+' '+S.periods[c.period].label+'.º · '+lessonLabel(ix.l.get(c.lessonId))])),v=>{if(v)trocarCom(sel,v);},'Trocar com','max-w-72')),
        field('Nota desta aula',h('input',{type:'text',id:'nota-aula',class:'input input-sm w-72',value:l.nota||'',placeholder:'Por exemplo: precisa do projetor',disabled:busy,onchange:e=>{const id=sel.id;mutate(()=>{l.nota=e.target.value.trim();});ui.sel=id;render();}}))));}
    const notas=uniq(cardsFor(ui.kind,ui.id).map(c=>ix.l.get(c.lessonId))).filter(l=>l.nota);
    if(notas.length)m.append(panel('Notas das aulas',h('ul',{class:'text-sm list-disc pl-5',id:'notas-list'},notas.map(l=>h('li',{},h('b',{},lessonLabel(l)+': '),l.nota)))));
    m.append(h('div',{class:'flex flex-wrap items-end gap-3 noprint'},field('Cores por',selEl('cor-por',S.corPor||'d',[['d','Disciplina'],['t','Professor'],['c','Turma'],['r','Sala']],v=>mutate(()=>{S.corPor=v;},true),'Cores por')),
      field('Ver ao lado',selEl('lado-k',lado.k,[['','Nenhum'],['c','Uma turma'],['t','Um professor'],['r','Uma sala']],v=>{lado.k=v;lado.id=v?(list(v)[0]||{}).id||'':'';render();},'Ver ao lado')),
      lado.k?field(KINDS[lado.k][1],selEl('lado-id',lado.id,optsOf(list(lado.k)),v=>{lado.id=v;render();},'Elemento ao lado','max-w-60')):null));
    if(lado.k&&ix[lado.k].has(lado.id))m.append(panel(KINDS[lado.k][1]+' '+nm(lado.k,lado.id)+' (para comparar)',h('div',{class:'overflow-x-auto',id:'lado-box'},printCard(lado.k,ix[lado.k].get(lado.id),Object.assign(printOpts(),{leg:false,rod:''})))));
  });
  wrap('reunioes',m=>{
    const mdl=M(),ix=IX(),cid=ui.livC&&ix.c.has(ui.livC)?ui.livC:(S.classes[0]||{}).id;if(!cid)return;const ts=uniq(S.lessons.filter(l=>!l.ign&&l.classIds.includes(cid)).flatMap(l=>l.linhas.map(ln=>ln.t))),P=mdl.P;
    m.append(panel('Tempos livres comuns dos professores de uma turma',h('div',{class:'flex flex-wrap items-end gap-3 noprint'},field('Turma',selEl('liv-c',cid,optsOf(S.classes),v=>{ui.livC=v;render();},'Turma')),h('span',{class:'text-sm opacity-70'},ts.length+' professores. A verde: todos livres. O número indica quantos estão ocupados ou impedidos.')),
      tableWrap(h('table',{class:'table table-xs text-center w-auto',id:'liv-tab'},h('thead',{},h('tr',{},h('th',{},''),S.days.map(d=>h('th',{},d)))),h('tbody',{},S.periods.map((p,pi)=>h('tr',{},h('th',{},p.label+'.º'),S.days.map((d,di)=>{let n=0;for(const t of ts){const r=mdl.resIdx('t',t);if(mdl.busy(r,di*P+pi)||mdl.level(r,di*P+pi)===-3)n++;}return h('td',{class:n?'opacity-60':'bg-success/30 font-bold'},n?String(n):'livre');}))))))));
  });
  wrap('alunos',m=>{
    if(ui.alTab!=='dist')return;const bl=S.lessons.filter(l=>l.banda&&l.insc);if(!bl.length)return;const ix=IX();
    m.append(panel('Inscritos nas bandas juntas',tableWrap(h('table',{class:'table table-sm',id:'insc-tab'},h('thead',{},h('tr',{},['Aula simultânea','Curso','Professor','Inscritos'].map(t=>h('th',{},t)))),h('tbody',{},bl.flatMap(l=>l.linhas.map((ln,i)=>h('tr',{},h('td',{class:'font-medium'},'Aula n.º '+l.n),h('td',{},(ln.cls||[]).map(c=>nm('c',c)).join('+')+' '+sh('s',ln.s)),h('td',{},ln.t?nm('t',ln.t):'—'),h('td',{class:'num'},String((l.insc[i]||[]).filter(id=>S.alunos.some(a=>a.id===id)).length))))))))));
  });
})();

