/* ---------- gestão diária: eventos, alterações pontuais, contadores, folha diária ---------- */
const MOTIVOS=['Doença','Formação','Serviço oficial','Visita de estudo','Assistência à família','Greve','Outro'];
const wdOf=d=>(new Date(d+'T12:00:00').getDay()+6)%7;
const awayFn=date=>{const es=S.exames.concat(S.eventos).filter(e=>e.data===date);return (cid,p)=>es.some(e=>e.classIds.includes(cid)&&p>=e.period&&p<e.period+e.len);};
let _cnt=null,_cntV=-1;
function contadores(){
  if(_cntV===MV&&_cnt)return _cnt;
  const ix=IX(),T=new Map(),g=id=>{let r=T.get(id);if(!r)T.set(id,r={aus:0,falta:0,anul:0,subst:0,dadas:0,lib:0});return r;},mot=new Map(),byWd=new Map();
  for(const c of S.cards)if(c.day!=null){let a=byWd.get(c.day);if(!a)byWd.set(c.day,a=[]);a.push(c);}
  for(const k in S.cover){const pp=k.split('|'),o=S.cover[k],r=g(pp[1]);r.aus++;let tl=0;
    for(const c of byWd.get(wdOf(pp[0]))||[]){const l=ix.l.get(c.lessonId);if(l&&l.linhas.some(ln=>ln.t===pp[1]))tl+=c.len;}
    r.falta+=tl;const mo=(S.coverM||{})[k]||'Sem motivo indicado',mr=mot.get(mo)||{n:0,tl:0};mr.n++;mr.tl+=tl;mot.set(mo,mr);
    for(const sk in o){if(o[sk]==='x')r.anul++;else{r.subst++;g(o[sk]).dadas++;}}}
  for(const e of S.exames.concat(S.eventos))for(const c of byWd.get(wdOf(e.data))||[]){const l=ix.l.get(c.lessonId);if(!l||!l.classIds.length||!l.classIds.every(x=>e.classIds.includes(x)))continue;
    let n=0;for(let i=0;i<c.len;i++)if(c.period+i>=e.period&&c.period+i<e.period+e.len)n++;if(!n)continue;
    for(const tid of uniq(l.linhas.map(ln=>ln.t)))if(!(e.teachers||e.vig||[]).includes(tid))g(tid).lib+=n;}
  _cntV=MV;return _cnt={T,mot};
}
const bolsaUsada=(tid,date)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-wdOf(date));const a=d.toISOString().slice(0,10);d.setDate(d.getDate()+6);const b=d.toISOString().slice(0,10);let n=0;for(const k in S.cover){const dd=k.slice(0,10);if(dd<a||dd>b)continue;const o=S.cover[k];for(const sk in o)if(o[sk]===tid)n++;}return n;};
const saldoDe=tid=>{const r=contadores().T.get(tid);return r?r.dadas-r.lib:0;};
function diaLinhas(date){
  const ix=IX(),wd=wdOf(date),rows=[],lab=p=>S.periods[p]?S.periods[p].label+'.º':'';
  const add=(p,len,turma,disc,prof,sala,tipo,txt)=>rows.push({p,len,turma,disc,prof,sala,tipo,txt});
  const info=c=>{const l=ix.l.get(c.lessonId);return {l,turma:l.classIds.map(x=>nm('c',x)).join(', '),disc:uniq(l.linhas.map(ln=>sh('s',ln.s))).join('/'),sala:uniq(roomsOfCard(c).map(r=>r&&nm('r',r))).join('/'),profs:uniq(l.linhas.map(ln=>ln.t&&nm('t',ln.t))).join(', ')};};
  for(const k in S.cover){const pp=k.split('|');if(pp[0]!==date)continue;const o=S.cover[k];
    for(const c of S.cards){if(c.day!==wd)continue;const l=ix.l.get(c.lessonId);if(!l||!l.linhas.some(ln=>ln.t===pp[1]))continue;const inf=info(c);
      for(let i=0;i<c.len;i++){const v=o[c.id+'|'+(c.period+i)];if(!v&&(S.coverP||{})[k])continue;add(c.period+i,1,inf.turma,inf.disc,nm('t',pp[1]),inf.sala,v==='x'?'Anulada':v?'Substituição':'Por substituir',v==='x'?'Aula anulada':v?'Substituído por '+nm('t',v):'Professor ausente, sem substituto');}}}
  for(const e of S.exames)if(e.data===date)add(e.period,e.len,e.classIds.map(x=>nm('c',x)).join(', '),e.nome,e.vig.map(t=>nm('t',t)).join(', '),e.roomId?nm('r',e.roomId):'','Exame','As aulas destas turmas ficam suspensas');
  for(const e of S.eventos)if(e.data===date)add(e.period,e.len,e.classIds.map(x=>nm('c',x)).join(', '),e.nome,(e.teachers||[]).map(t=>nm('t',t)).join(', '),e.local||'','Evento','As aulas destas turmas ficam suspensas');
  for(const x of S.pontuais){const c=S.cards.find(k=>k.id===x.cardId);if(!c||c.day==null)continue;const inf=info(c),mov=!!x.nd&&(x.nd!==x.data||x.np!==c.period);
    if(x.data===date)add(c.period,c.len,inf.turma,inf.disc,inf.profs,inf.sala,mov?'Mudança':'Sala',mov?'Passa para '+x.nd+', '+lab(x.np)+' tempo'+(x.sala?', sala '+nm('r',x.sala):''):'Muda para a sala '+(x.sala?nm('r',x.sala):'—'));
    if(mov&&x.nd===date)add(x.np,c.len,inf.turma,inf.disc,inf.profs,x.sala?nm('r',x.sala):inf.sala,'Aula mudada','Vem de '+x.data+', '+lab(c.period)+' tempo');}
  rows.sort((a,b)=>(a.turma+a.disc+a.prof+a.txt).localeCompare(b.turma+b.disc+b.prof+b.txt)||a.p-b.p);
  const out=[];for(const r of rows){const q=out[out.length-1];if(q&&q.turma===r.turma&&q.disc===r.disc&&q.prof===r.prof&&q.txt===r.txt&&q.tipo===r.tipo&&q.p+q.len===r.p)q.len+=r.len;else out.push(r);}
  return out.sort((a,b)=>a.p-b.p||a.turma.localeCompare(b.turma));
}
const tlTxt=r=>{const a=S.periods[r.p]||{},b=S.periods[Math.min(S.periods.length-1,r.p+r.len-1)]||{};return [(a.label||'')+(r.len>1?'–'+(b.label||''):''),(a.start||'')+(a.start?'–':'')+(b.end||'')];};
const TIPO_B={Anulada:'bad','Por substituir':'bad','Substituição':'ok',Exame:'info',Evento:'info','Mudança':'warn',Sala:'warn','Aula mudada':'warn'};
function folhaTabela(date,big){
  const rows=diaLinhas(date);
  return h('table',{class:'table '+(big?'table-lg text-xl':'table-sm'),id:'folha-tab'},h('thead',{},h('tr',{},['TL','Hora','Turma','Disciplina','Professor','Sala','Tipo','Alteração'].map(t=>h('th',{},t)))),
    h('tbody',{},rows.map(r=>{const t=tlTxt(r);return h('tr',{},h('td',{class:'font-bold whitespace-nowrap'},t[0]),h('td',{class:'whitespace-nowrap'},t[1]),h('td',{class:'font-medium'},r.turma||'—'),h('td',{},r.disc),h('td',{},r.prof||'—'),h('td',{},r.sala||'—'),h('td',{},badge(r.tipo,TIPO_B[r.tipo])),h('td',{},r.txt));}),
      rows.length?null:h('tr',{},h('td',{colspan:8,class:'opacity-60'},'Sem alterações neste dia.'))));
}
function folhaHtml(date){
  const rows=diaLinhas(date),td=x=>'<td>'+esc(x||'—')+'</td>';
  return '<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alterações de '+esc(date)+'</title><style>body{font:22px system-ui,sans-serif;margin:0;padding:24px;background:#0f172a;color:#f1f5f9}h1{font-size:30px;margin:0 0 16px}table{border-collapse:collapse;width:100%}th,td{padding:10px 12px;border-bottom:1px solid #334155;text-align:left}th{font-size:16px;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8}.t{font-weight:700;color:#fbbf24}@media print{body{background:#fff;color:#000;font-size:12px}th{color:#000}.t{color:#000}}</style></head><body><h1>'+esc(S.name)+' · Alterações de '+esc(date)+' ('+esc(S.days[wdOf(date)]||'')+')</h1><table><thead><tr><th>TL</th><th>Hora</th><th>Turma</th><th>Disciplina</th><th>Professor</th><th>Sala</th><th>Alteração</th></tr></thead><tbody>'+
    (rows.length?rows.map(r=>{const t=tlTxt(r);return '<tr><td class="t">'+esc(t[0])+'</td>'+td(t[1])+td(r.turma)+td(r.disc)+td(r.prof)+td(r.sala)+'<td><b>'+esc(r.tipo)+'</b> · '+esc(r.txt)+'</td></tr>';}).join(''):'<tr><td colspan="7">Sem alterações neste dia.</td></tr>')+'</tbody></table></body></html>';
}
function folhaEcra(){
  const box=h('div',{id:'ecra',class:'fixed inset-0 z-50 bg-base-100 p-8 overflow-auto flex flex-col gap-4'});let tm=null;
  const fill=()=>{box.replaceChildren(h('div',{class:'flex items-center gap-4'},h('h2',{class:'fd text-4xl font-bold grow'},'Alterações de '+ui.cdate+' · '+(S.days[wdOf(ui.cdate)]||'')),h('span',{class:'text-2xl opacity-70'},new Date().toTimeString().slice(0,5)),btn('Fechar',close,'btn-sm')),folhaTabela(ui.cdate,true));};
  const close=()=>{clearInterval(tm);box.remove();if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});};
  fill();tm=setInterval(fill,60000);const rot=setInterval(()=>{if(!document.body.contains(box)){clearInterval(rot);return;}if(box.scrollTop+box.clientHeight>=box.scrollHeight-4)box.scrollTo({top:0,behavior:'smooth'});else box.scrollBy({top:box.clientHeight*.8,behavior:'smooth'});},8000);document.body.append(box);if(box.requestFullscreen)box.requestFullscreen().catch(()=>{});
}
function evDialog(e){
  const isNew=!e,P=S.periods.length;e=e||{nome:'Visita de estudo',data:ui.cdate,period:0,len:P,classIds:[],teachers:[],local:''};const ts=new Set(e.teachers||[]);
  const box=h('div',{class:'grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 max-h-40 overflow-auto border border-base-300 rounded-box p-2',id:'ev-tbox'}),q=h('input',{type:'search',id:'ev-q',class:'input input-sm w-full',placeholder:'Procurar professor','aria-label':'Procurar professor',oninput:()=>fill()});
  const fill=()=>{const txt=q.value.trim().toLowerCase(),cls=new Set(Array.from(document.querySelectorAll('#dlg input[name=evc]:checked')).map(x=>x.value)),ix=IX();
    const arr=S.teachers.filter(t=>ts.has(t.id)||(txt?(t.name+' '+(t.short||'')).toLowerCase().includes(txt):(ix.lt.get(t.id)||[]).some(x=>x[0].classIds.some(c=>cls.has(c)||e.classIds.includes(c))))).slice(0,60);
    box.replaceChildren(...(arr.length?arr.map(t=>h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'ev-t-'+t.id,class:'checkbox checkbox-xs',checked:ts.has(t.id),onchange:x=>{if(x.target.checked)ts.add(t.id);else ts.delete(t.id);}}),t.name)):[h('span',{class:'text-sm opacity-60'},'Escolha turmas ou procure um professor.')]));};
  fill();
  openDlg(isNew?'Novo evento':'Editar evento',h('div',{class:'flex flex-col gap-3'},
    h('div',{class:'flex flex-wrap gap-3 items-end'},field('Nome',h('input',{type:'text',id:'ev-nome',class:'input input-sm w-56',value:e.nome})),field('Data',h('input',{type:'date',id:'ev-data',class:'input input-sm',value:e.data})),isNew?field('Até (vários dias)',h('input',{type:'date',id:'ev-ate',class:'input input-sm',value:''})):null,
      field('Começa no',selEl('ev-per',String(e.period),S.periods.map((p,i)=>[String(i),p.label+'.º tempo']),()=>{},'Tempo de início')),field('Duração (TL)',h('input',{type:'number',id:'ev-len',class:'input input-sm w-20',min:1,max:P,value:e.len})),field('Local',h('input',{type:'text',id:'ev-local',class:'input input-sm w-40',value:e.local||''}))),
    h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Turmas que participam'),h('div',{class:'grid grid-cols-3 sm:grid-cols-5 gap-x-3 gap-y-1 max-h-32 overflow-auto border border-base-300 rounded-box p-2'},S.classes.map(x=>h('label',{class:'flex items-center gap-1.5 text-sm'},h('input',{type:'checkbox',id:'ev-c-'+x.id,name:'evc',class:'checkbox checkbox-xs',value:x.id,checked:e.classIds.includes(x.id),onchange:()=>fill()}),x.name)))),
    h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Professores acompanhantes'),q,box),
    h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'ev-aus',class:'checkbox checkbox-sm',checked:isNew}),'Registar a ausência dos acompanhantes nas aulas que têm com outras turmas')),
    [btn('Cancelar',closeDlg),btn(isNew?'Criar':'Guardar',()=>{const per=+$('#ev-per').value,v={nome:$('#ev-nome').value.trim()||'Evento',data:$('#ev-data').value||ui.cdate,period:per,len:Math.max(1,Math.min(P-per,+$('#ev-len').value||1)),local:$('#ev-local').value.trim(),classIds:Array.from($('#dlg').querySelectorAll('input[name=evc]:checked')).map(x=>x.value),teachers:[...ts]},aus=$('#ev-aus').checked,ix=IX();closeDlg();
      const ate=isNew&&$('#ev-ate')?$('#ev-ate').value:'',dias=[v.data];if(ate&&ate>v.data){const d=new Date(v.data+'T12:00:00'),f=new Date(ate+'T12:00:00');d.setDate(d.getDate()+1);for(let i=0;i<60&&d<=f;i++,d.setDate(d.getDate()+1)){const iso=d.toISOString().slice(0,10);if(wdOf(iso)<S.days.length&&!feriasEm(iso))dias.push(iso);}}
      closeDlg();
      mutate(()=>{for(const dia of dias){const v0=v;{const v=Object.assign({},v0,{data:dia});if(isNew)S.eventos.push(Object.assign({id:uid()},v));else Object.assign(e,v);
        if(aus){const wd=wdOf(v.data);S.coverM=S.coverM||{};for(const tid of v.teachers){const key=v.data+'|'+tid,rec=S.cover[key]||(S.cover[key]={});if(!S.coverM[key])S.coverM[key]='Visita de estudo';
          for(const [l] of ix.lt.get(tid)||[])for(const c of ix.cl.get(l.id)||[])if(c.day===wd)for(let i=0;i<c.len;i++){const p=c.period+i;if(p>=v.period&&p<v.period+v.len&&l.classIds.length&&l.classIds.every(x=>v.classIds.includes(x)))rec[c.id+'|'+p]='x';}}}}}});},'btn-primary')],true);
}
function ptDialog(){
  let cls=(S.classes[0]||{}).id||'',date=ui.cdate;const ix=IX(),cardBox=h('span',{id:'pt-cardbox'});
  const fill=()=>{const wd=wdOf(date),cs=cardsFor('c',cls).filter(c=>c.day===wd).sort((a,b)=>a.period-b.period);
    cardBox.replaceChildren(selEl('pt-card',cs[0]?cs[0].id:'',cs.length?cs.map(c=>[c.id,S.periods[c.period].label+'.º tempo · '+lessonLabel(ix.l.get(c.lessonId))+(c.len>1?' ('+c.len+' TL)':'')]):[['','Sem aulas nesse dia']],()=>{},'Aula'));};
  fill();
  openDlg('Nova alteração pontual',h('div',{class:'flex flex-col gap-3'},h('span',{class:'text-sm opacity-70'},'Muda uma aula de dia, de tempo ou de sala só numa data. O horário semanal fica igual.'),
    h('div',{class:'flex flex-wrap gap-3 items-end'},field('Data da aula',h('input',{type:'date',id:'pt-data',class:'input input-sm',value:date,onchange:e=>{if(e.target.value){date=e.target.value;fill();}}})),field('Turma',selEl('pt-cls',cls,optsOf(S.classes),v=>{cls=v;fill();},'Turma')),field('Aula',cardBox)),
    h('div',{class:'flex flex-wrap gap-3 items-end'},field('Nova data',h('input',{type:'date',id:'pt-nd',class:'input input-sm',value:date}),'Deixe igual para mudar só a sala ou o tempo'),field('Novo tempo',selEl('pt-np','',[['','O mesmo']].concat(S.periods.map((p,i)=>[String(i),p.label+'.º tempo'])),()=>{},'Novo tempo')),field('Nova sala',selEl('pt-sala','',optsOf(S.rooms,'A mesma'),()=>{},'Nova sala'))),h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'pt-comp',class:'checkbox checkbox-sm'}),'É a compensação de uma aula anulada (conta como aula dada)')),
    [btn('Cancelar',closeDlg),btn('Criar',()=>{const cid=$('#pt-card').value,c=S.cards.find(x=>x.id===cid);if(!c){toast('Escolha uma aula.');return;}const nd=$('#pt-nd').value||date,npv=$('#pt-np').value,np=npv===''?c.period:+npv,sala=$('#pt-sala').value;
      if(nd===date&&np===c.period&&!sala){toast('Não mudou nada: escolha outra data, outro tempo ou outra sala.');return;}
      if(np+c.len>S.periods.length){toast('A aula não cabe a partir desse tempo.');return;}
      closeDlg();const mdl=M(),l=ix.l.get(c.lessonId),wd=wdOf(nd),a=mdl.cardIdx(c.id);let conf=0;
      if(wd<S.days.length){const rs=l.classIds.map(x=>mdl.resIdx('c',x)).concat(l.linhas.filter(ln=>ln.t).map(ln=>mdl.resIdx('t',ln.t)));if(sala)rs.push(mdl.resIdx('r',sala));
        for(const r of rs)if(r!==undefined)for(let i=0;i<c.len;i++)if(mdl.cardsAt(r,wd*mdl.P+np+i).some(b=>b!==a))conf++;}
      for(const x of S.pontuais){if(x.nd!==nd)continue;const c2=S.cards.find(k=>k.id===x.cardId),l2=c2&&ix.l.get(c2.lessonId);if(!l2||x.np>=np+c.len||np>=x.np+c2.len)continue;if(l2.classIds.some(q=>l.classIds.includes(q))||l2.linhas.some(q=>q.t&&l.linhas.some(z=>z.t===q.t))||(sala&&x.sala===sala))conf++;}
      const comp=$('#pt-comp')?$('#pt-comp').checked:false;
      mutate(()=>{S.pontuais.push({id:uid(),data:date,cardId:c.id,nd,np,sala,comp});});
      if(wd>=S.days.length)toast('Atenção: a nova data não é um dia de aulas.',null,null,'bad');else if(conf)toast('Alteração criada, mas a turma, o professor ou a sala já têm aulas nesse tempo, no horário semanal ou noutra alteração pontual. Confirme na folha diária.','Anular',desfazer);},'btn-primary')],true);
}
PAGES.diario=function(m){
  ui.dTab=ui.dTab||'folha';const ix=IX();
  m.append(pageHead('Gestão diária','Tudo o que muda num dia: substituições, exames, eventos e alterações pontuais.',h('input',{type:'date',id:'gd-date',class:'input input-sm noprint','aria-label':'Data',value:ui.cdate,onchange:e=>{if(e.target.value){ui.cdate=e.target.value;render();}}})));
  m.append(tabsEl([['folha','Folha diária'],['eventos','Eventos ('+S.eventos.length+')'],['pontuais','Alterações pontuais ('+S.pontuais.length+')'],['contadores','Contadores']],ui.dTab,v=>{ui.dTab=v;render();},'Gestão diária'));
  const tb=(heads,rows,empty)=>tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},heads.map(t=>h('th',{},t)))),h('tbody',{},rows,rows.length?null:h('tr',{},h('td',{colspan:heads.length,class:'opacity-60'},empty)))));
  if(ui.dTab==='folha'){
    m.append(h('div',{class:'hidden print:block fd font-bold text-base'},S.name+' · Alterações de '+ui.cdate+' ('+(S.days[wdOf(ui.cdate)]||'')+')'));
    m.append(panel('Alterações de '+ui.cdate+' ('+(S.days[wdOf(ui.cdate)]||'sem aulas')+')',h('div',{class:'flex flex-wrap gap-2 noprint'},h('a',{href:'#substituicoes',class:'btn btn-sm'},'Registar ausência'),btn('Novo evento',()=>evDialog(),'btn-sm',{disabled:busy}),btn('Alteração pontual',ptDialog,'btn-sm',{disabled:busy||!S.classes.length}),h('span',{class:'grow'}),
      btn('Modo ecrã',folhaEcra,'btn-sm'),btn('Descarregar para ecrã (HTML)',()=>deliver('alteracoes-'+ui.cdate+'.html',folhaHtml(ui.cdate)),'btn-sm'),btn('Imprimir',imprimir,'btn-sm btn-primary')),tableWrap(folhaTabela(ui.cdate))));return;}
  if(ui.dTab==='eventos'){
    const rows=S.eventos.slice().sort((a,b)=>a.data.localeCompare(b.data)||a.period-b.period),mdl=M();
    m.append(panel(null,h('div',{class:'flex noprint'},h('span',{class:'text-sm opacity-70 grow'},'Visitas de estudo e atividades que tiram turmas e professores das aulas.'),btn('Novo evento',()=>evDialog(),'btn-primary btn-sm',{disabled:busy})),
      tb(['Evento','Data','Tempos','Turmas','Acompanhantes','Local','Aulas suspensas',''],rows.map(e=>{const wd=wdOf(e.data);let n=0;if(wd<S.days.length)for(const c of e.classIds){const r=mdl.resIdx('c',c);if(r!==undefined)for(let i=0;i<e.len;i++)if(mdl.busy(r,wd*mdl.P+e.period+i))n++;}
        return h('tr',{},h('td',{class:'font-medium'},e.nome),h('td',{class:'whitespace-nowrap'},e.data+' ('+(S.days[wd]||'—')+')'),h('td',{},tlTxt({p:e.period,len:e.len})[0]),h('td',{},e.classIds.map(c=>nm('c',c)).join(', ')||'—'),h('td',{class:'text-sm'},(e.teachers||[]).map(t=>nm('t',t)).join(', ')||'—'),h('td',{},e.local||'—'),h('td',{class:'num'},String(n)),
          h('td',{class:'noprint'},h('div',{class:'join'},btn('Ver o dia',()=>{ui.cdate=e.data;ui.dTab='folha';render();},'btn-sm join-item'),btn('Editar',()=>evDialog(e),'btn-sm join-item',{disabled:busy}),btn('Apagar',()=>mutate(()=>{S.eventos=S.eventos.filter(x=>x!==e);}),'btn-sm join-item text-error',{disabled:busy}))));}),'Ainda não há eventos.')));return;}
  if(ui.dTab==='pontuais'){
    const rows=S.pontuais.slice().sort((a,b)=>a.data.localeCompare(b.data));
    m.append(panel(null,h('div',{class:'flex noprint'},h('span',{class:'text-sm opacity-70 grow'},'Aulas mudadas de dia, de tempo ou de sala só numa data.'),btn('Nova alteração',ptDialog,'btn-primary btn-sm',{disabled:busy||!S.classes.length})),
      tb(['Data','Aula','Tempo','Passa para','Sala',''],rows.map(x=>{const c=S.cards.find(k=>k.id===x.cardId),l=c&&ix.l.get(c.lessonId);
        return h('tr',{},h('td',{class:'whitespace-nowrap'},x.data),h('td',{class:'font-medium'},l?lessonLabel(l):'aula apagada'),h('td',{},c&&c.day!=null?S.periods[c.period].label+'.º':'—'),h('td',{},x.nd+', '+(S.periods[x.np]?S.periods[x.np].label+'.º tempo':'')),h('td',{},x.sala?nm('r',x.sala):'a mesma'),
          h('td',{class:'noprint'},h('div',{class:'join'},btn('Ver o dia',()=>{ui.cdate=x.data;ui.dTab='folha';render();},'btn-sm join-item'),btn('Apagar',()=>mutate(()=>{S.pontuais=S.pontuais.filter(k=>k!==x);}),'btn-sm join-item text-error',{disabled:busy}))));}),'Ainda não há alterações pontuais.')));return;}
  const {T,mot}=contadores(),rows=S.teachers.filter(t=>T.has(t.id)&&matchQ('cnt',[t.name,t.short])).map(t=>[t,T.get(t.id)]).sort((a,b)=>(a[1].dadas-a[1].lib)-(b[1].dadas-b[1].lib)),pg=pager('cnt',rows.length,30);
  m.append(panel('Saldo de substituições por professor',h('div',{class:'flex flex-wrap items-end gap-3 noprint'},searchEl('cnt','Procurar professor'),h('span',{class:'grow'}),pg.el,btn('Imprimir',imprimir,'btn-sm')),
    tb(['Professor','Dias de ausência','TL em falta','Anulados','Substituídos por colegas','Substituições dadas','Aulas libertadas','Saldo'],rows.slice(pg.from,pg.to).map(([t,r])=>{const s=r.dadas-r.lib;
      return h('tr',{},h('td',{class:'font-medium'},t.name),h('td',{class:'num'},String(r.aus)),h('td',{class:'num'},String(r.falta)),h('td',{class:'num'},String(r.anul)),h('td',{class:'num'},String(r.subst)),h('td',{class:'num'},String(r.dadas)),h('td',{class:'num'},String(r.lib)),h('td',{},badge((s>0?'+':'')+s,s>0?'ok':s<0?'warn':'mute')));}),'Ainda não há ausências, exames nem eventos registados.'),
    h('p',{class:'text-xs opacity-60'},'Saldo = substituições dadas menos aulas libertadas (aulas que o professor não deu porque a turma estava em exame ou num evento). Nas Substituições, quem tem saldo mais baixo aparece primeiro entre candidatos iguais.')));
  m.append(panel('Ausências por motivo',tb(['Motivo','Ausências','TL em falta'],[...mot].sort((a,b)=>b[1].n-a[1].n).map(([k,v])=>h('tr',{},h('td',{class:'font-medium'},k),h('td',{class:'num'},String(v.n)),h('td',{class:'num'},String(v.tl)))),'Sem ausências registadas.')));
};

