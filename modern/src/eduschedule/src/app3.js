/* ===== interface (parte 3: otimização, horários, diagnóstico) ===== */
const opt={running:false,pr:null,hist:[],worker:null,timer:null,level:'normal',secs:60,keep:false,done:null,stopReq:false,inline:false};
const WORKER_GLUE='\nlet sv=null,halt=false;\nonmessage=function(e){const d=e.data;if(d.cmd==="start"){const st=normalize(d.st),m=createModel(st);m.load();sv=m.solver(d.opts);halt=false;postMessage({ready:true});loop();}else if(d.cmd==="stop")halt=true;};\n'+
  'function loop(){if(!sv)return;const pr=sv.step(150);if(halt&&!pr.done)sv.finish();if(pr.done||halt){postMessage({done:true,progress:sv.progress(),cards:sv.result()});sv=null;return;}postMessage({progress:pr});setTimeout(loop,0);}\n';
function optProgress(pr){
  opt.pr=pr;opt.hist.push([pr.elapsed,pr.cost]);if(opt.hist.length>600)opt.hist=opt.hist.filter((_,i)=>i%2===0);
  const el=$('#opt-live');if(el)el.replaceWith(optLive());
}
function optFinish(cards,pr,err){
  if(opt.worker){opt.worker.terminate();opt.worker=null;}clearTimeout(opt.timer);
  busy=false;opt.running=false;
  if(opt.cb){const cb=opt.cb;opt.cb=null;cb(err?null:cards,pr);return;}
  if(err||!cards){opt.done=null;render();toast(err||'A otimização foi interrompida sem resultado.',null,null,'bad');return;}
  {const by0=new Map(S.cards.map(c=>[c.id,c]));let mv=0;for(const r of cards){const c=by0.get(r.id);if(c&&c.day!=null&&(c.day!==r.day||c.period!==r.period))mv++;}opt.done={pr,stopped:opt.stopReq,mexidas:mv,total:S.cards.filter(c=>c.day!=null).length};}
  mutate(()=>{const by=new Map(S.cards.map(c=>[c.id,c]));for(const r of cards){const c=by.get(r.id);if(!c)continue;c.day=r.day;c.period=r.period;delete c.rx;if(r.day==null){delete c.r;c.locked=false;}else c.r=r.r;}});
  toast(pr.unplaced?pr.unplaced+' de '+pr.total+' TL ficaram por colocar. Veja o Diagnóstico.':'Todos os '+pr.total+' TL foram colocados.','Anular',desfazer,pr.unplaced?null:'ok');
}
function optInline(o){
  opt.inline=true;let sv;
  try{const st=normalize(optState()),mm=createModel(st);mm.load();sv=mm.solver(o);}catch(e){optFinish(null,null,'Não foi possível iniciar a otimização: '+e.message);return;}
  const tick=()=>{let pr;try{pr=sv.step(60);if(opt.stopReq&&!pr.done)sv.finish();}catch(e){optFinish(null,null,'O motor parou com um erro: '+e.message);return;}
    if(pr.done||opt.stopReq)optFinish(sv.result(),sv.progress());else{optProgress(pr);opt.timer=setTimeout(tick,0);}};
  opt.timer=setTimeout(tick,0);
}
function optStart(ov){
  if(busy)return;
  if(S.ro||S.bloq){toast(S.ro?'Modo só de leitura: desligue-o em Ficheiro para otimizar.':'O horário está bloqueado: desbloqueie-o em Ficheiro para otimizar.');return;}
  if(opt.scope&&opt.scope.k&&!(ov&&ov.level))ov={level:opt.level,keep:false};
  const o=Object.assign({keep:opt.keep,min:!!opt.min,stay:opt.stay||3,ms:Math.max(2,opt.secs)*1000,level:opt.level,seed:(Math.random()*1e9)|0},ov&&ov.level?ov:{});
  opt.hist=[];opt.pr=null;opt.done=null;opt.stopReq=false;opt.inline=false;busy=true;opt.running=true;
  let started=false;
  try{
    const w=new Worker(URL.createObjectURL(new Blob([$('#engine').textContent+WORKER_GLUE],{type:'text/javascript'})));
    opt.worker=w;
    w.onmessage=e=>{started=true;const d=e.data;if(d.done)optFinish(d.cards,d.progress);else if(d.progress)optProgress(d.progress);};
    w.onerror=e=>{if(e&&e.preventDefault)e.preventDefault();if(!started){w.terminate();opt.worker=null;started=true;optInline(o);}else optFinish(null,null,'O motor parou com um erro'+(e&&e.message?': '+e.message:'.'));};
    w.postMessage({cmd:'start',st:optState(),opts:o});
    setTimeout(()=>{if(!started&&opt.running&&opt.worker===w){w.terminate();opt.worker=null;started=true;optInline(o);}},5000);
  }catch(e){opt.worker=null;optInline(o);}
  render();
}
function optStop(){if(!opt.running)return;opt.stopReq=true;if(opt.worker)opt.worker.postMessage({cmd:'stop'});const b=$('#opt-stop');if(b){b.disabled=true;b.textContent='A parar…';}}
const fmtN=n=>n>=1e6?(n/1e6).toFixed(1)+' M':n>=1e4?Math.round(n/1e3)+' mil':String(Math.round(n));
function spark(){
  const pts=opt.hist;if(pts.length<2)return null;
  const W=600,H=70,x0=pts[0][0],x1=pts[pts.length-1][0]||1;let lo=Infinity,hi=-Infinity;for(const p of pts){const v=Math.log10(Math.max(1,p[1]));if(v<lo)lo=v;if(v>hi)hi=v;}
  if(hi-lo<1e-6)hi=lo+1;
  const ns='http://www.w3.org/2000/svg',s=document.createElementNS(ns,'svg'),pl=document.createElementNS(ns,'polyline');
  s.setAttribute('viewBox','0 0 '+W+' '+H);s.setAttribute('preserveAspectRatio','none');s.setAttribute('class','w-full h-16 text-primary');s.setAttribute('role','img');s.setAttribute('aria-label','Evolução do custo ao longo do tempo');
  pl.setAttribute('points',pts.map(p=>((p[0]-x0)/Math.max(1,x1-x0)*W).toFixed(1)+','+(H-4-(Math.log10(Math.max(1,p[1]))-lo)/(hi-lo)*(H-8)).toFixed(1)).join(' '));
  pl.setAttribute('fill','none');pl.setAttribute('stroke','currentColor');pl.setAttribute('stroke-width','2');pl.setAttribute('vector-effect','non-scaling-stroke');s.append(pl);return s;
}
function optLive(){
  const pr=opt.pr,box=h('div',{id:'opt-live',class:'flex flex-col gap-3'});
  const tile=(t,v,cls)=>h('div',{class:'bg-base-200 rounded-box px-3 py-2'},h('div',{class:'text-xs opacity-70'},t),h('div',{class:'fd font-bold text-lg num text-left '+(cls||'')},v));
  if(opt.running){
    const fases=['A colocar as aulas','A calibrar','A melhorar o horário','A concluir'];
    box.append(h('div',{class:'flex items-center gap-3'},h('span',{class:'loading loading-spinner loading-sm text-primary'}),h('span',{class:'font-medium'},pr?fases[pr.phase]:'A preparar o motor…'),
      h('span',{class:'text-sm opacity-70'},pr?Math.round(pr.elapsed/1000)+' s de '+Math.round(pr.budget/1000)+' s':''),opt.inline?badge('modo de compatibilidade','mute'):null),
      h('progress',{class:'progress progress-primary w-full',value:pr?Math.min(pr.elapsed,pr.budget):0,max:pr?pr.budget:1,'aria-label':'Progresso da otimização'}));
  }
  if(pr)box.append(h('div',{class:'grid grid-cols-2 md:grid-cols-5 gap-2'},tile('TL colocados',pr.placed+' / '+pr.total),tile('Por colocar',String(pr.unplaced),pr.unplaced?'text-error':'text-success'),
    tile('Custo',fmtN(pr.cost)),tile('Movimentos testados',fmtN(pr.iters)),tile('Velocidade',pr.elapsed>300?fmtN(pr.iters/(pr.elapsed/1000))+' /s':'—')),spark());
  if(opt.done&&!opt.running){
    const rep=REP(),ok=!rep.unplaced&&!rep.clash&&!rep.blocked;
    box.append(h('div',{role:'status',class:'alert alert-soft '+(ok?'alert-success':'alert-warning')},ic(ok?'check':'warn','w-5 h-5'),
      h('div',{},h('div',{class:'font-medium'},(opt.done.stopped?'Otimização parada. ':'Otimização concluída. ')+(ok?'Todas as aulas estão colocadas, sem conflitos.':rep.unplaced+' TL por colocar, '+(rep.clash+rep.blocked)+' conflitos.')),
        h('div',{class:'text-sm'},(opt.done.mexidas!=null?opt.done.mexidas+' de '+opt.done.total+' aulas mudaram de tempo · ':'')+rep.gapsC+' furos nas turmas · '+rep.gapsT+' furos nos professores · '+rep.dup+' repetições no dia · '+rep.altRoom+' aulas em sala alternativa')),
      h('div',{class:'flex flex-wrap gap-2'},h('a',{href:'#horarios',class:'btn btn-sm'},'Ver horários'),h('a',{href:'#diagnostico',class:'btn btn-sm'},'Ver diagnóstico'),btn('Anular',desfazer,'btn-sm btn-ghost'))));
  }
  if(!box.children.length)box.append(h('p',{class:'text-sm opacity-70'},'Ainda não correu nenhuma otimização nesta sessão.'));
  return box;
}
PAGES.otimizacao=function(m){
  const rep=REP(),presets=[['quick','Rápida',10,'Para detetar erros nos dados.'],['normal','Normal',60,'Bom resultado na maioria das escolas.'],['deep','Exaustiva',300,'Para o horário final.']];
  m.append(pageHead('Otimização','Geração automática dos horários, com as prioridades e os requisitos definidos.'));
  m.append(panel('Como otimizar',
    h('div',{class:'grid md:grid-cols-3 gap-2'},presets.map(p=>h('button',{type:'button',disabled:opt.running,'aria-pressed':String(opt.level===p[0]),class:'btn h-auto py-3 flex-col items-start text-left normal-case '+(opt.level===p[0]?'btn-primary':'btn-outline border-base-300'),onclick:()=>{opt.level=p[0];opt.secs=p[2];render();}},
      h('span',{class:'fd font-bold'},p[1]+' · '+(p[2]>=60?(p[2]/60)+' min':p[2]+' s')),h('span',{class:'text-xs font-normal opacity-80'},p[3])))),
    h('div',{class:'flex flex-wrap gap-4 items-end'},
      field('Tempo máximo (segundos)',h('input',{type:'number',id:'opt-secs',class:'input input-sm w-28',min:2,max:7200,value:opt.secs,disabled:opt.running,onchange:e=>{opt.secs=Math.max(2,Math.min(7200,+e.target.value||60));}})),
      field('O que fazer às aulas já colocadas',selEl('opt-keep',opt.min?'2':opt.keep?'1':'0',[['0','Refazer tudo, exceto as aulas fixas'],['1','Manter as colocadas e completar o resto'],['2','Melhorar mexendo o mínimo']],v=>{opt.keep=v==='1';opt.min=v==='2';render();},'Âmbito')),
      opt.min?field('Quanto pode mexer',selEl('opt-stay',String(opt.stay||3),[['8','Quase nada'],['3','Pouco'],['1','O que for preciso']],v=>{opt.stay=+v;},'Quanto pode mexer'),'cada aula mudada tem de compensar'):null,
      h('span',{class:'grow'}),
      opt.running?h('button',{type:'button',id:'opt-stop',class:'btn btn-error',onclick:optStop},ic('stop'),'Parar e ficar com o melhor'):h('button',{type:'button',id:'opt-go',class:'btn btn-primary',disabled:!S.cards.length,onclick:()=>optStart()},ic('play'),'Otimizar'),
      btn('Apagar horários',()=>{mutate(()=>S.cards.forEach(c=>{if(!c.locked&&!IX().l.get(c.lessonId).fixa){c.day=null;c.period=null;delete c.r;}}));toast('Horários apagados (as aulas fixas ficaram).','Anular',desfazer);},'btn-ghost text-error',{disabled:busy||!rep.placed})),
    h('p',{class:'text-xs opacity-60'},'O motor trabalha em segundo plano: pode parar quando quiser e fica com o melhor horário encontrado até esse momento. As aulas fixas e as que fixou à mão nunca são movidas.')));
  m.append(panel('Progresso',optLive()));
  m.append(seriePanel());
  m.append(panel('Estado atual',h('div',{class:'flex flex-wrap gap-2'},badge(rep.placed+' de '+rep.total+' TL colocados',rep.unplaced?'bad':'ok'),badge((rep.clash+rep.blocked)+' conflitos',rep.clash+rep.blocked?'bad':'ok'),
    badge(rep.gapsC+' furos nas turmas',rep.gapsC?'warn':'ok'),badge(rep.gapsT+' furos nos professores','mute'),badge(rep.dup+' repetições no dia',rep.dup?'warn':'ok'),badge('custo '+fmtN(rep.cost),'mute'))));
};

/* ---------- otimização em série: várias corridas com estratégias diferentes, lado a lado ---------- */
const serie={runs:[],n:4,active:false,i:0,stop:false};
const SERIE_ESTR=[['normal','Normal'],['deep','Exaustiva'],['quick','Rápida']];
function serieNext(){
  if(serie.i>=serie.n||serie.stop){serie.active=false;render();if(serie.runs.length)toast('Série concluída: '+serie.runs.length+' corridas. Escolha a que quer aplicar.');return;}
  const e=SERIE_ESTR[serie.i%SERIE_ESTR.length];
  opt.cb=(cards,pr)=>{
    if(cards){const st=JSON.parse(JSON.stringify(S)),by=new Map(st.cards.map(c=>[c.id,c]));for(const r of cards){const c=by.get(r.id);if(!c)continue;c.day=r.day;c.period=r.period;if(r.day==null)delete c.r;else c.r=r.r;}
      const mm=createModel(normalize(st));mm.load();serie.runs.push({n:serie.i+1,nome:e[1],rep:mm.report(),cards,ms:pr?pr.elapsed:0});}
    if(opt.stopReq)serie.stop=true;serie.i++;serieNext();};
  optStart({keep:false,level:e[0],seed:(serie.i+1)*7919+((Math.random()*1e6)|0)});
}
function serieStart(){if(busy)return;serie.runs=[];serie.i=0;serie.stop=false;serie.active=true;serieNext();}
function serieApply(r){mutate(()=>{const by=new Map(S.cards.map(c=>[c.id,c]));for(const x of r.cards){const c=by.get(x.id);if(!c)continue;c.day=x.day;c.period=x.period;if(x.day==null){delete c.r;c.locked=false;}else c.r=x.r;}});toast('Corrida '+r.n+' aplicada.','Anular',desfazer,'ok');}
function seriePanel(){
  const best=serie.runs.length?Math.min.apply(null,serie.runs.map(r=>r.rep.cost)):null;
  return panel('Otimização em série',h('div',{class:'flex flex-wrap items-end gap-3'},h('span',{class:'text-sm opacity-70 grow'},'Corre várias otimizações de raiz, com estratégias e pontos de partida diferentes, e compara os resultados. Cada corrida usa o tempo máximo indicado acima. O horário só muda quando aplicar uma corrida.'),
      field('N.º de corridas',h('input',{type:'number',id:'serie-n',class:'input input-sm w-20',min:2,max:12,value:serie.n,disabled:busy,onchange:e=>{serie.n=Math.max(2,Math.min(12,+e.target.value||4));}})),
      h('button',{type:'button',id:'serie-go',class:'btn btn-sm',disabled:busy||!S.cards.length,onclick:serieStart},'Otimizar em série')),
    serie.active?h('div',{class:'text-sm'},'A correr a corrida '+(serie.i+1)+' de '+serie.n+' ('+SERIE_ESTR[serie.i%SERIE_ESTR.length][1]+')…'):null,
    serie.runs.length?tableWrap(h('table',{class:'table table-sm',id:'serie-tab'},h('thead',{},h('tr',{},['Corrida','Estratégia','Custo','Por colocar','Conflitos','Furos turmas','Furos profs','Repetições','Sala alternativa',''].map(t=>h('th',{},t)))),
      h('tbody',{},serie.runs.map(r=>h('tr',{class:r.rep.cost===best?'bg-success/10':''},h('td',{},String(r.n)),h('td',{},r.nome),h('td',{class:'num font-semibold'},fmtN(r.rep.cost)),h('td',{class:'num'},String(r.rep.unplaced)),h('td',{class:'num'},String(r.rep.clash+r.rep.blocked)),h('td',{class:'num'},String(r.rep.gapsC)),h('td',{class:'num'},String(r.rep.gapsT)),h('td',{class:'num'},String(r.rep.dup)),h('td',{class:'num'},String(r.rep.altRoom)),
        h('td',{},h('div',{class:'flex items-center gap-2'},r.rep.cost===best?badge('melhor','ok'):null,btn('Aplicar',()=>serieApply(r),'btn-sm',{disabled:busy})))))))):null);
}
/* ---------- trocas em cadeia ---------- */
function trocasDlg(sel){
  const mdl=M(),ix=IX(),P=mdl.P,a=mdl.cardIdx(sel.id),ch=mdl.chains(a,24,3).filter(c=>ui.trDia==null||ui.trDia===''||((c.s/P)|0)===+ui.trDia).slice(0,10),byId=new Map(S.cards.map(c=>[c.id,c]));
  const sl=(d,p)=>d==null?'por colocar':S.days[d]+' '+S.periods[p].label+'.º';
  openDlg('Trocas para '+lessonLabel(ix.l.get(sel.lessonId)),h('div',{class:'flex flex-col gap-2',id:'trocas'},
    h('div',{},field('Só propostas para',selEl('tr-dia',ui.trDia==null?'':String(ui.trDia),[['','Qualquer dia']].concat(S.days.map((d,i)=>[String(i),d])),v=>{ui.trDia=v;closeDlg();trocasDlg(sel);},'Dia'))),
    h('span',{class:'text-sm opacity-70'},'Cada proposta põe esta aula num tempo ocupado e recoloca, em cadeia, as aulas que lá estão, sem criar conflitos. A variação do custo mostra se o horário fica melhor (negativa) ou pior.'),
    ch.length?ch.map((c,i)=>h('div',{class:'border border-base-300 rounded-box p-2 flex flex-wrap items-center gap-2'},h('div',{class:'grow text-sm'},h('b',{},'Para '+sl((c.s/P)|0,c.s%P)+' · '+c.moves.length+' aulas mexem'),
      h('ul',{class:'text-xs opacity-80'},c.moves.map(mv=>{const cd=byId.get(mv.id);return h('li',{},lessonLabel(ix.l.get(cd.lessonId))+': '+sl(cd.day,cd.period)+' → '+sl(mv.day,mv.period));}))),
      badge((c.cost>0?'+':'')+Math.round(c.cost)+' no custo',c.cost<=0?'ok':'warn'),btn('Aplicar',()=>{closeDlg();mutate(()=>{ui.sel=null;for(const mv of c.moves){const cd=S.cards.find(x=>x.id===mv.id);cd.day=mv.day;cd.period=mv.period;cd.r=mv.r;}});toast('Troca aplicada: '+c.moves.length+' aulas mudaram de tempo.','Anular',desfazer,'ok');},'btn-sm btn-primary',{id:'troca-'+i}))):note('info','Não encontrei nenhuma troca em cadeia sem conflitos para esta aula. As aulas fixas não são movidas.')),
    [btn('Fechar',closeDlg)],true);
}
/* ---------- horários ---------- */
function cardInfo(c,kind,id,full){
  const ix=IX(),l=ix.l.get(c.lessonId),rs=roomsOfCard(c),all=l.linhas.map((ln,i)=>({ln,room:rs[i]}));
  const mine=kind==='t'?all.filter(x=>x.ln.t===id):kind==='r'?all.filter(x=>x.room===id):all,use=mine.length?mine:all;
  const sN=s=>full?nm('s',s):sh('s',s),tN=t=>full?nm('t',t):sh('t',t);
  const cls=l.classIds.map(i=>nm('c',i)).join(', '),tch=uniq(use.map(x=>x.ln.t?tN(x.ln.t):'?')).join('/'),rms=uniq(use.map(x=>x.room&&nm('r',x.room))).join('/');
  return {l,title:uniq(use.map(x=>sN(x.ln.s))).join(' / '),color:corPor(l,use,(ix.s.get(use[0].ln.s)||{}).color),tip:uniq(use.map(x=>x.ln.tip)).join('/'),cls,tch,rms,per:perLabel(l.per,cicloK(S)),
    sub:(kind==='c'?[tch,rms]:kind==='t'?[cls,rms]:[cls,tch]).filter(Boolean)};
}
function lcEl(c,kind,id){
  const inf=cardInfo(c,kind,id),fixa=c.locked||inf.l.fixa;
  const pick=e=>{e.stopPropagation();ui.sel=ui.sel===c.id?null:c.id;render();};
  return h('div',{class:'lc'+(fixa?' locked':'')+(ui.clash.has(c.id)?' bad':'')+(ui.sel===c.id?' sel':''),style:'--sc:'+col(inf.color),draggable:!busy,tabindex:0,role:'button',title:lessonLabel(inf.l),
    ondragstart:e=>{e.dataTransfer.setData('text/plain',c.id);e.dataTransfer.effectAllowed='move';setTimeout(()=>hint(c.id),0);},
    ondragend:()=>hint(ui.sel),onclick:pick,onkeydown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(e);}}},
    h('b',{},inf.title),h('span',{},inf.sub.join(' · ')),
    (c.len>1||fixa||inf.tip||inf.per)?h('i',{},[inf.tip,inf.per,c.len>1?c.len+' TL':'',fixa?'fixa':''].filter(Boolean).join(' · ')):null);
}
function hint(id){
  const cells=document.querySelectorAll('.tt .cell'),m=M(),a=id?m.cardIdx(id):undefined;
  if(a===undefined){cells.forEach(el=>{el.classList.remove('h-ok','h-clash','h-off');el.removeAttribute('data-dc');});return;}
  let dl=null,base=0;if(m.N<=2500){dl=m.deltas(a);if(m.posOf(a)<0){base=Infinity;for(let i=0;i<dl.length;i++)if(dl[i]<base)base=dl[i];if(!isFinite(base))base=0;}}
  const pr=m.probeAll(a),P=m.P;
  cells.forEach(el=>{el.classList.remove('h-ok','h-clash','h-off');const v=pr[(+el.dataset.d)*P+(+el.dataset.p)];el.classList.add(v<0?'h-off':v>0?'h-clash':'h-ok');const dv=dl?dl[(+el.dataset.d)*P+(+el.dataset.p)]:NaN;if(dv===dv){const r=Math.round(dv-base);el.setAttribute('data-dc',(r>0?'+':'')+r);el.title='Mover para aqui: custo '+(r>0?'+':'')+r+(r<0?' (melhora)':r>0?' (piora)':' (igual)');}else el.removeAttribute('data-dc');});
}
function moveCard(id,d,p){
  const c=S.cards.find(x=>x.id===id);if(!c)return;
  if(d==null){if(c.day==null){ui.sel=null;render();return;}mutate(()=>{ui.sel=null;c.day=null;c.period=null;c.locked=false;delete c.r;});return;}
  if(p+c.len>S.periods.length)return toast('Esta aula de '+c.len+' TL não cabe no fim do dia.');
  for(let i=0;i<c.len-1;i++)if(S.periods[p+i].breakAfter)return toast('Uma aula de vários TL não pode atravessar um intervalo.');
  if(c.day===d&&c.period===p){ui.sel=null;return render();}
  const m=M(),pr=m.roomsFor(m.cardIdx(id),d*m.P+p);
  if(mutate(()=>{ui.sel=null;c.day=d;c.period=p;c.r=pr.rooms;delete c.rx;})&&(!pr.ok||pr.conflicts>0))toast('Colocada com conflito. Fica assinalada a vermelho e listada no Diagnóstico.','Anular',desfazer);
}
function overview(m,arr){
  const mdl=M(),P=mdl.P,D=mdl.D,pg=pager('ov',arr.length,40),ix=IX();
  const tb=h('tbody',{},arr.slice(pg.from,pg.to).map(e=>{
    const r=mdl.resIdx(ui.kind,e.id),tr=h('tr',{},h('th',{class:'rowh',scope:'row',title:'Abrir o horário',onclick:()=>{ui.id=e.id;ui.visao='ind';render();}},e.name));
    for(let s=0;s<D*P;s++){
      const cs=mdl.cardsAt(r,s).filter(a=>!ui.fase||(perMask(ix.l.get(S.cards[a].lessonId).per,cicloK(S))&ui.fase)),sep=s%P===0?' dsep':'';
      if(!cs.length){tr.append(h('td',{class:(mdl.level(r,s)===-3?'opacity-40':'')+sep}));continue;}
      const c=S.cards[cs[0]],inf=cardInfo(c,ui.kind,e.id);
      tr.append(h('td',{class:'on'+sep+(cs.some(a=>ui.clash.has(S.cards[a].id))?' bad':''),style:'--sc:'+col(inf.color),title:inf.title+' · '+inf.sub.join(' · ')},ui.kind==='c'?inf.title:(inf.cls||inf.title)));
    }
    return tr;}));
  m.append(panel(null,h('div',{class:'flex flex-wrap items-center gap-2'},h('span',{class:'text-sm opacity-70'},'Todos os horários lado a lado. Clique num nome para abrir o horário e editar.'),h('span',{class:'grow'}),pg.el),
    h('div',{class:'overflow-auto max-h-[70vh]'},h('table',{class:'ov'},
      h('thead',{},h('tr',{},h('th',{class:'rowh'}),S.days.map(d=>h('th',{colspan:P,class:'dsep'},d))),h('tr',{},h('th',{class:'rowh'},KINDS[ui.kind][1]),S.days.map(()=>S.periods.map((p,i)=>h('th',{class:i===0?'dsep':''},p.label))))),tb))));
}
PAGES.horarios=function(m){
  const all=list(ui.kind),arr=all.filter(x=>matchQ('ent',[x.name,x.short]));if(!arr.some(x=>x.id===ui.id))ui.id=arr[0]?arr[0].id:null;
  const rep=REP(),mdl=M(),ix=IX(),idx=arr.findIndex(x=>x.id===ui.id),go=n=>{ui.id=arr[(idx+n+arr.length)%arr.length].id;ui.sel=null;render();};
  m.append(pageHead('Horários',null,h('a',{href:'#otimizacao',class:'btn btn-primary btn-sm noprint'},ic('bolt'),'Otimizar')));
  m.append(h('div',{class:'flex flex-wrap items-center gap-2 noprint'},
    tabsEl(['c','t','r'].map(k=>[k,KINDS[k][2]]),ui.kind,k=>{ui.kind=k;ui.id=null;ui.sel=null;ui.q.ent='';ui.pg.ov=0;render();},'Ver por'),
    tabsEl([['ind','Um horário'],['geral','Visão geral']],ui.visao,v=>{ui.visao=v;ui.sel=null;render();},'Modo'),
    all.length>12?searchEl('ent','Procurar '+KINDS[ui.kind][2].toLowerCase()):null,
    ui.visao==='ind'?h('div',{class:'join'},btn('‹',()=>go(-1),'btn-sm join-item',{disabled:arr.length<2,'aria-label':'Anterior'}),selEl('tt-entity',ui.id||'',optsOf(arr),v=>{ui.id=v;ui.sel=null;render();},KINDS[ui.kind][1],'join-item max-w-56'),btn('›',()=>go(1),'btn-sm join-item',{disabled:arr.length<2,'aria-label':'Seguinte'})):null,
    selEl('tt-fase',String(ui.fase),[['0','Todas as semanas']].concat([0,1].flatMap(sem=>Array.from({length:cicloK(S)},(_,w)=>[String(1<<perBit(w,sem,cicloK(S))),(sem+1)+'.º sem. · semana '+(cicloK(S)===2?'AB'[w]:w+1)]))),v=>{ui.fase=+v;render();},'Semana e semestre'),
    ui.visao==='ind'?btn('Calendário (.ics)',()=>{const e=IX()[ui.kind].get(ui.id),x=e&&icsFor(ui.kind,e);if(x)deliver(slug(e.name)+'.ics',x);else toast('Para criar o calendário são precisas as datas do ano letivo, as horas dos tempos e aulas colocadas.');},'btn-sm'):null,
    ui.visao==='ind'?btn('Imprimir',imprimir,'btn-sm'):null));
  m.append(h('div',{class:'flex flex-wrap items-center gap-2 noprint'},badge(rep.placed+' de '+rep.total+' TL colocados',rep.unplaced?'bad':'ok'),badge((rep.clash+rep.blocked)+' conflitos',rep.clash+rep.blocked?'bad':'ok'),badge(rep.gapsC+' furos nas turmas',rep.gapsC?'warn':'ok'),
    S.example?h('span',{class:'text-sm opacity-70'},'Escola de exemplo com dados inventados.'):null));
  if(!ui.id){m.append(note('info',all.length?'Nada com esta procura.':'Crie '+KINDS[ui.kind][2].toLowerCase()+' em Dados da escola para ver aqui o horário.'));return;}
  if(ui.visao==='geral'){overview(m,arr);return;}
  const ent=ix[ui.kind].get(ui.id),extra=ui.kind==='c'?[ent.full,ent.dt?'DT: '+nm('t',ent.dt):'',ent.roomId?'Sala: '+nm('r',ent.roomId):'',ent.fse?'Projeto FSE n.º '+ent.fse:'']:[];
  m.append(h('div',{class:'hidden print:block fd font-bold text-base'},S.name+' · '+S.ano+' · '+KINDS[ui.kind][1]+' '+ent.name+(extra.filter(Boolean).length?' · '+extra.filter(Boolean).join(' · '):'')));
  const sel=ui.sel&&S.cards.find(c=>c.id===ui.sel);
  if(sel){
    const l=ix.l.get(sel.lessonId),rs=roomsOfCard(sel);
    m.append(h('div',{class:'alert text-sm noprint flex flex-wrap'},h('b',{},lessonLabel(l)+(sel.len>1?' ('+sel.len+' TL)':'')),h('span',{class:'opacity-70'},'Clique num tempo para mover. A verde: livre para turma, professor e sala.'),
      sel.day!=null?l.linhas.map((ln,i)=>selEl('sel-room-'+i,rs[i]||'',optsOf(S.rooms,'Sem sala'),v=>mutate(()=>{sel.r=roomsOfCard(sel);sel.r[i]=v;}),'Sala de '+sh('s',ln.s),'max-w-40')):null,
      h('span',{class:'grow'}),
      btn('Propor trocas',()=>trocasDlg(sel),'btn-sm',{disabled:busy||l.fixa||sel.locked}),
      btn(sel.locked?'Desafixar':'Fixar',()=>mutate(()=>{sel.locked=!sel.locked;}),'btn-sm',{disabled:sel.day==null||l.fixa}),
      btn('Retirar do horário',()=>moveCard(sel.id,null,null),'btn-sm',{disabled:sel.day==null}),btn('Concluir',()=>{ui.sel=null;render();},'btn-sm btn-ghost')));
  }
  const mine=cardsFor(ui.kind,ui.id).filter(c=>!ui.fase||c.day==null||(perMask(ix.l.get(c.lessonId).per,cicloK(S))&ui.fase)),key=ui.kind+':'+ui.id;
  const drop=(d,p)=>({ondragover:e=>e.preventDefault(),ondrop:e=>{e.preventDefault();moveCard(e.dataTransfer.getData('text/plain'),d,p);},onclick:()=>{if(ui.sel)moveCard(ui.sel,d,p);}});
  const g=frame((d,p)=>Object.assign({class:lvlOf(key,d,p)===-3?'off':''},drop(d,p)),null,ui.kind==='c'?gradeDe(ui.id):null);
  if(sel)g.classList.add('pick');
  const starts=new Map();for(const c of mine){if(c.day==null)continue;const k=c.day+'-'+c.period;let a=starts.get(k);if(!a)starts.set(k,a=[]);a.push(c);}
  for(const [k,cs] of starts){const d=+k.split('-')[0],p=+k.split('-')[1],len=Math.max.apply(null,cs.map(c=>c.len));
    g.append(h('div',Object.assign({class:'stack',style:'grid-column:'+(d+2)+';grid-row:'+(p+2)+' / span '+len},drop(d,p)),cs.map(c=>lcEl(c,ui.kind,ui.id))));}
  const un=mine.filter(c=>c.day==null);
  const tray=h('section',{class:'card card-border border-base-300 bg-base-100 tray noprint',ondragover:e=>{e.preventDefault();tray.classList.add('over');},ondragleave:()=>tray.classList.remove('over'),
    ondrop:e=>{e.preventDefault();moveCard(e.dataTransfer.getData('text/plain'),null,null);}},h('div',{class:'card-body p-3 gap-2'},
    h('h3',{class:'card-title text-sm'},'Aulas por colocar'),h('div',{class:'text-xs opacity-70'},un.length+' aqui · '+S.cards.reduce((n,c)=>n+(c.day==null?1:0),0)+' em toda a escola'),
    h('div',{class:'flex flex-col gap-1 max-h-[60vh] overflow-auto'},un.map(c=>lcEl(c,ui.kind,ui.id))),
    h('div',{class:'text-xs opacity-60'},'Arraste uma aula para a semana, ou largue-a aqui para a retirar.')));
  m.append(h('div',{class:'grid gap-4 items-start lg:grid-cols-[minmax(0,1fr)_15rem] print:block'},h('div',{class:'overflow-x-auto'},g),tray));
  if(ui.kind==='t')m.append(panel('Legenda em minutos',legendaEl(ui.id)));
  if(sel)hint(sel.id);
};

/* ---------- diagnóstico ---------- */
PAGES.diagnostico=function(m){
  const rep=REP(),is=ISS();
  const tile=(n,label,cls)=>h('div',{class:'bg-base-100 border border-base-300 rounded-box px-4 py-3 border-l-4 '+(n?(cls==='bad'?'border-l-error':'border-l-warning'):'border-l-success')},h('div',{class:'fd font-bold text-2xl num text-left'},String(n)),h('div',{class:'text-xs opacity-70'},label));
  m.append(pageHead('Diagnóstico','O que falta colocar, o que está em conflito e o que pode melhorar.'));
  m.append(h('div',{class:'grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3'},tile(rep.unplaced,'TL por colocar','bad'),tile(rep.clash+rep.blocked,'conflitos','bad'),tile(rep.gapsC,'furos nas turmas'),tile(rep.dup,'disciplinas repetidas no dia'),
    tile(rep.marg,'marginais fora das pontas'),tile(rep.gapsT,'furos nos professores'),tile(rep.over,'TL fora dos limites diários'),tile(Math.ceil(rep.seq)+rep.grp,'sequências não cumpridas'),tile(rep.desloc,'trocas de edifício sem intervalo'),
    tile(rep.lunch,'dias sem tempo para almoço'),tile(rep.run+rep.shift+rep.span+rep.iso,'limites dos professores e TL isolados'),tile(rep.freeA+rep.freeD,'tardes ou dias livres em falta'),tile(rep.l2+rep.furosR,'furos seguidos ou fora do intervalo'),tile(rep.dt,'dias em falta do DT com a turma'),tile(rep.cap,'aulas em salas pequenas'),tile(rep.almMax,'turmas a mais no mesmo almoço')));
  const cats=uniq(is.list.map(x=>x.cat)),rows=is.list.filter(x=>(!ui.dSev||x.sev===ui.dSev)&&(!ui.dCat||x.cat===ui.dCat)&&matchQ('diag',[x.text]));
  const pg=pager('diag',rows.length,50);
  m.append(panel(is.list.length?'A rever':'Nada a rever',
    h('div',{class:'flex flex-wrap items-center gap-2'},tabsEl([['','Tudo ('+is.list.length+')'],['bad','Erros ('+is.bad+')'],['warn','Avisos ('+is.warn+')']],ui.dSev,v=>{ui.dSev=v;ui.pg.diag=0;render();},'Gravidade'),
      selEl('dg-cat',ui.dCat,[['','Todos os tipos']].concat(cats.map(c=>[c,c])),v=>{ui.dCat=v;ui.pg.diag=0;render();},'Tipo'),searchEl('diag','Procurar turma, professor…'),h('span',{class:'grow'}),pg.el),
    h('ul',{class:'flex flex-col gap-1.5'},rows.slice(pg.from,pg.to).map(x=>h('li',{class:'flex flex-wrap items-center gap-2 px-3 py-2 rounded-box border border-base-300 border-l-4 '+(x.sev==='bad'?'border-l-error':'border-l-warning')},
      badge(x.cat,x.sev==='bad'?'bad':'warn'),h('span',{class:'grow min-w-48 text-sm'},x.text),
      x.go&&x.go.id?btn('Abrir horário',()=>{ui.kind=x.go.kind;ui.id=x.go.id;ui.visao='ind';ui.q.ent='';location.hash='horarios';},'btn-sm btn-ghost'):null)),
      rows.length?null:h('li',{class:'text-sm opacity-60'},is.list.length?'Nada com estes filtros.':'Não há erros nem avisos.'))));
};
