/* ---------- impressão ---------- */
function printCard(kind,e,po){
  const mine=cardsFor(kind,e.id).filter(c=>c.day!=null),P=S.periods.length,D=S.days.length,ix=IX();
  const extra=kind==='c'?[e.full,e.dt?'DT: '+nm('t',e.dt):'',e.roomId?'Sala: '+nm('r',e.roomId):'',e.fse?'Projeto FSE n.º '+e.fse:'']:[];
  const ph=t=>t.replace(/\{(\w+)\}/g,(m0,k)=>({escola:S.name,ano:S.ano,tipo:KINDS[kind][1],nome:e.name,data:new Date().toISOString().slice(0,10)}[k]||''));
  const box=h('div',{class:'pcard'},h('h4',{style:'overflow:hidden'},logosDe().tr?h('img',{src:logosDe().tr,alt:'',style:'height:28px;float:right;margin-left:8px'}):null,logosDe().tl?h('img',{src:logosDe().tl,alt:'',style:'height:28px;vertical-align:middle;margin-right:8px'}):null,(po.cab||'').includes('{')?ph(po.cab):(po.cab||S.name)+' · '+S.ano+' · '+KINDS[kind][1]+' '+e.name+(extra.filter(Boolean).length?' · '+extra.filter(Boolean).join(' · '):'')));
  const at=new Map();for(const c of mine)for(let i=0;i<c.len;i++){const k=c.day*P+c.period+i;let a=at.get(k);if(!a)at.set(k,a=[]);a.push(c);}
  const skip=new Uint8Array(D*P),tb=h('tbody',{});
  const own={c:'turma',t:'prof',r:'sala'}[kind],alt=kind==='c'?gradeDe(e.id):null;
  const cellTxt=c=>{const a=cardInfo(c,kind,e.id,false),b=cardInfo(c,kind,e.id,true),v={disc:a.title,discNome:b.title,prof:a.tch,profNome:b.tch,turma:a.cls,sala:a.rms,tip:a.tip,sem:a.per};
    const ln=arr=>(arr||[]).filter(k=>k&&k.replace('Nome','')!==own).map(k=>v[k]).filter(Boolean).join(' · '),x1=ln(po.l1),x2=ln(po.l2),x3=ln(po.l3);
    return h('div',{style:po.cor==='barra'?'border-left:4px solid '+col(a.color)+';padding-left:3px':''},x1?h('b',{},x1):null,x2?h('div',{},x2):null,x3?h('div',{style:'font-size:80%'},x3):null);};
  S.periods.forEach((p,pi)=>{
    const tr=h('tr',{style:po.alt?'height:'+po.alt+'px':''},h('th',{style:'width:'+po.larg+'%'},p.label,po.horas?h('div',{style:'font-weight:400;font-size:80%'},((alt&&alt[pi].start)||p.start||'')+'–'+((alt&&alt[pi].end)||p.end||'')):null));
    for(let d=0;d<D;d++){
      if(skip[d*P+pi])continue;const cs=at.get(d*P+pi)||[];
      if(cs.length===1){const c=cs[0];let span=1;while(pi+span<P&&c.period+c.len>pi+span&&(at.get(d*P+pi+span)||[]).length===1){skip[d*P+pi+span]=1;span++;}
        tr.append(h('td',{class:'c',rowspan:span>1?span:null,style:po.cor==='fundo'?'background:'+col(cardInfo(c,kind,e.id).color)+'26':''},cellTxt(c)));}
      else tr.append(h('td',{},cs.map(cellTxt)));
    }
    tb.append(tr);
  });
  box.append(h('table',{class:'pt',style:'font-size:'+po.fs+'px'},h('thead',{},h('tr',{},h('th',{}),S.days.map(d=>h('th',{},d)))),tb));
  if(po.leg&&kind==='t'){const g=legenda(e.id);box.append(h('div',{style:'font-size:9px;margin-top:3px'},'Legenda: '+g.arr.map(r=>(r.s.short||r.s.name)+' '+r.tl+' TL = '+r.min+' min').join('; ')+'. Componente letiva: '+g.minLet+' min'+(g.minCnl?'; não letiva: '+g.minCnl+' min':'')+'.'));}
  if(po.leg&&kind==='c'){const seen=new Map();for(const l of S.lessons)if(l.classIds.includes(e.id))for(const ln of l.linhas){const k=ln.s;let s=seen.get(k);if(!s)seen.set(k,s=new Set());if(ln.t)s.add(nm('t',ln.t));}
    box.append(h('div',{style:'font-size:9px;margin-top:3px'},[...seen].map(x=>sh('s',x[0])+': '+nm('s',x[0])+([...x[1]].length?' ('+[...x[1]].join(', ')+')':'')).join('; ')));}
  if(po.rod)box.append(h('div',{style:'font-size:9px;margin-top:3px'},ph(po.rod)));
  if(logosDe().bc)box.append(h('div',{style:'text-align:center;margin-top:6px'},h('img',{src:logosDe().bc,alt:'',style:'max-height:40px;max-width:100%'})));
  return box;
}
const PR_CAMPOS=[['','—'],['disc','Disciplina (código)'],['discNome','Disciplina (nome)'],['prof','Professor (código)'],['profNome','Professor (nome)'],['turma','Turma'],['sala','Sala'],['tip','Turno'],['sem','Semana']];
function printOpts(){const o=Object.assign({nomes:false,prof:true,sala:true,tip:true,pb:false,leg:true,porPag:1,cab:'',rod:'',fs:10,orient:'portrait',horas:true,cor:'',alt:0,larg:11},S.print||{});
  if(!o.l1){o.l1=[o.nomes?'discNome':'disc'];o.l2=['turma',o.prof?(o.nomes?'profNome':'prof'):'',o.sala?'sala':''];o.l3=o.tip?['tip','sem']:[];}
  if(!o.cor)o.cor=o.pb?'pb':'fundo';return o;}
const printCss=po=>PRINT_CSS+'@page{size:A4 '+po.orient+';margin:10mm}';
function printBuild(){
  const po=printOpts(),items=[];
  for(const k of ['c','t','r'])if(ui.prn[k])for(const e of list(k)){if(ui.prnDep&&k!=='r'&&(e.dep||'')!==ui.prnDep)continue;const r=M().resIdx(k,e.id);if(k==='r'?M().cardsOf(r).some(a=>M().posOf(a)>=0):M().cardsOf(r).some(a=>M().posOf(a)>=0))items.push(printCard(k,e,po));}
  const out=[],n=po.porPag;for(let i=0;i<items.length;i+=n)out.push(h('div',{class:'ppage',style:'grid-template-columns:repeat('+(n>=4?2:1)+',minmax(0,1fr))'+(n>1?';font-size:85%':'')},items.slice(i,i+n)));
  return out;
}
const PRINT_CSS='body{font:11px system-ui,sans-serif;margin:14px}.pt{border-collapse:collapse;width:100%;table-layout:fixed;font-size:10px}.pt th,.pt td{border:1px solid #777;padding:3px;vertical-align:top;text-align:left}.pt td.c{-webkit-print-color-adjust:exact;print-color-adjust:exact}.pcard{break-inside:avoid;margin-bottom:10px}.pcard h4{font-size:13px;margin:0 0 4px}.ppage{break-after:page;display:grid;gap:10px}';
PAGES.impressao=function(m){
  const po=printOpts(),setP=(k,v)=>mutate(()=>{S.print=Object.assign(printOpts(),{[k]:v});});
  const chk=(k,label)=>h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'pr-'+k,class:'checkbox checkbox-sm',checked:po[k],disabled:busy,onchange:e=>setP(k,e.target.checked)}),label);
  const kchk=(k)=>h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'pr-k-'+k,class:'checkbox checkbox-sm',checked:ui.prn[k],onchange:e=>{ui.prn[k]=e.target.checked;render();}}),KINDS[k][2]+' ('+list(k).length+')');
  const doPrint=()=>{const pa=$('#printarea');pa.replaceChildren.apply(pa,printBuild());if(pa.children.length)pa.append(h('style',{},'@page{size:A4 '+po.orient+';margin:10mm}'));if(!pa.children.length)return toast('Não há horários colocados para imprimir.');
    document.body.classList.add('printing');const done=()=>{document.body.classList.remove('printing');pa.replaceChildren();window.removeEventListener('afterprint',done);};window.addEventListener('afterprint',done);
    try{window.print();}catch(e){done();toast('A impressão não está disponível aqui. Descarregue o HTML e abra-o no navegador.');}};
  const doFile=()=>{const d=h('div',{},printBuild());if(!d.children.length)return toast('Não há horários colocados para imprimir.');
    deliver('horarios-para-imprimir.html','<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><title>Horários '+esc(S.name)+'</title><style>'+printCss(po)+'</style></head><body>'+d.innerHTML+'</body></html>');};
  m.append(pageHead('Impressão','Horários de turmas, professores e salas, com o formato que escolher.',btn('Descarregar em HTML',doFile,'btn-sm'),h('button',{type:'button',class:'btn btn-primary btn-sm',onclick:doPrint},ic('print'),'Imprimir')));
  m.append(h('div',{class:'grid lg:grid-cols-[20rem_minmax(0,1fr)] gap-4 items-start'},
    panel('O que imprimir',h('div',{class:'flex flex-col gap-2'},kchk('c'),kchk('t'),kchk('r')),
      field('Horários por página',selEl('pr-pp',String(po.porPag),[['1','1 por página'],['2','2 por página'],['4','4 por página']],v=>setP('porPag',+v),'Horários por página')),
      h('div',{class:'divider my-0'}),
      h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Formato guardado'),h('div',{class:'join'},selEl('pr-fmt','',[['','Escolher…']].concat(S.formatos.map(f=>[f.id,f.nome])),v=>{const f=S.formatos.find(x=>x.id===v);if(f)mutate(()=>{S.print=JSON.parse(JSON.stringify(f.o));});},'Formato guardado','join-item grow'),
        btn('Guardar',()=>openDlg('Guardar formato',field('Nome do formato',h('input',{type:'text',id:'pr-fn',class:'input input-sm w-64',value:'Formato '+(S.formatos.length+1)})),[btn('Cancelar',closeDlg),btn('Guardar',()=>{const n=$('#pr-fn').value.trim()||'Formato';closeDlg();mutate(()=>{S.formatos=S.formatos.filter(f=>f.nome!==n);S.formatos.push({id:uid(),nome:n,o:JSON.parse(JSON.stringify(printOpts()))});});},'btn-primary')]),'btn-sm join-item',{disabled:busy}),
        btn('Apagar',()=>openDlg('Apagar formato',field('Formato',selEl('pr-fd',(S.formatos[0]||{}).id||'',S.formatos.map(f=>[f.id,f.nome]),()=>{},'Formato')),[btn('Cancelar',closeDlg),btn('Apagar',()=>{const v=$('#pr-fd').value;closeDlg();mutate(()=>{S.formatos=S.formatos.filter(f=>f.id!==v);});},'btn-error')]),'btn-sm join-item',{disabled:busy||!S.formatos.length}))),
      h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Conteúdo de cada aula'),['l1','l2','l3'].map((L,li)=>h('div',{class:'flex items-center gap-1'},h('span',{class:'text-xs opacity-60 w-12'},(li+1)+'.ª linha'),[0,1,2].map(i=>selEl('pr-'+L+'-'+i,(po[L]||[])[i]||'',PR_CAMPOS,v=>{const a=(printOpts()[L]||[]).slice();while(a.length<3)a.push('');a[i]=v;setP(L,a);},'Campo '+(i+1)+' da linha '+(li+1),'select-xs w-0 grow')))),h('span',{class:'text-xs opacity-60'},'O campo do próprio horário (por exemplo a turma, no horário da turma) é omitido.')),
      h('div',{class:'grid grid-cols-2 gap-2'},field('Cores',selEl('pr-cor',po.cor,[['fundo','Fundo colorido'],['barra','Barra lateral'],['pb','Preto e branco']],v=>mutate(()=>{S.print=Object.assign(printOpts(),{cor:v,pb:false});}),'Cores')),field('Orientação',selEl('pr-orient',po.orient,[['portrait','Ao alto'],['landscape','Ao baixo']],v=>setP('orient',v),'Orientação')),
        field('Letra (px)',h('input',{type:'number',id:'pr-fs',class:'input input-sm',min:6,max:18,value:po.fs,disabled:busy,onchange:e=>setP('fs',Math.max(6,Math.min(18,+e.target.value||10)))})),field('Altura mín. da linha (px)',h('input',{type:'number',id:'pr-alt',class:'input input-sm',min:0,max:120,value:po.alt,disabled:busy,onchange:e=>setP('alt',Math.max(0,Math.min(120,+e.target.value||0)))})),
        field('Largura da coluna dos tempos (%)',h('input',{type:'number',id:'pr-larg',class:'input input-sm',min:5,max:25,value:po.larg,disabled:busy,onchange:e=>setP('larg',Math.max(5,Math.min(25,+e.target.value||11)))}))),
      chk('horas','Mostrar as horas de cada tempo'),chk('leg','Legenda por baixo do horário'),
      field('Cabeçalho',h('input',{type:'text',id:'pr-cab',class:'input input-sm w-full',value:po.cab,placeholder:'{escola} · {ano} · {tipo} {nome}',disabled:busy,onchange:e=>setP('cab',e.target.value.trim())}),'Pode usar {escola}, {ano}, {tipo}, {nome} e {data}'),
      field('Rodapé',h('input',{type:'text',id:'pr-rod',class:'input input-sm w-full',value:po.rod,placeholder:'Por exemplo: a Direção',disabled:busy,onchange:e=>setP('rod',e.target.value.trim())}))),
    panel('Pré-visualização',(()=>{const k=['c','t','r'].find(x=>ui.prn[x]&&list(x).length);if(!k)return h('p',{class:'text-sm opacity-70'},'Escolha pelo menos um tipo de horário.');
      const e=list(k).find(x=>cardsFor(k,x.id).some(c=>c.day!=null))||list(k)[0];return h('div',{class:'overflow-x-auto'},h('div',{class:'min-w-[36rem]'},printCard(k,e,po)));})())));
};

