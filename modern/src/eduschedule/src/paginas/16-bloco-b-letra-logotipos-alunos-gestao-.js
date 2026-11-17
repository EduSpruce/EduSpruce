/* ---------- bloco B: letra, logótipos, alunos, gestão diária alargada, opções anuais ---------- */
function zoomUI(d){let z=100;try{z=+localStorage.getItem('ph-zoom')||100;}catch(e){}z=d===0?100:Math.max(70,Math.min(160,z+d*10));document.documentElement.style.fontSize=z+'%';try{localStorage.setItem('ph-zoom',String(z));}catch(e){}toast('Tamanho da letra: '+z+'%');}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#fs-menos,#fs-mais');if(b)zoomUI(b.id==='fs-mais'?1:-1);});
const logosDe=()=>Object.assign({},S.logo?{tl:S.logo}:{},S.logos||{});
function alFicheiros(al){
  const ix=IX(),ls=alAulas(al),cards=ls.flatMap(l=>ix.cl.get(l.id)||[]).filter(c=>c.day!=null);
  return {ics:()=>icsFor('c',{id:al.classId,name:al.nome},cards),html:()=>{const grid=new Map();for(const c of cards){const l=ix.l.get(c.lessonId),rs=roomsOfCard(c);for(let i=0;i<c.len;i++){const k=c.day+'-'+(c.period+i);(grid.get(k)||grid.set(k,[]).get(k)).push(uniq(l.linhas.map(ln=>sh('s',ln.s))).join('/')+'<br><small>'+esc(uniq(l.linhas.map(ln=>ln.t&&sh('t',ln.t))).join('/')+' '+uniq(rs.map(r=>r&&nm('r',r))).join('/'))+'</small>');}}
    return '<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><title>'+esc(al.nome)+'</title><style>'+PRINT_CSS+'</style></head><body><div class="pcard"><h4>'+esc(S.name+' · '+S.ano+' · '+al.nome+' ('+nm('c',al.classId)+')')+'</h4><table class="pt"><thead><tr><th></th>'+S.days.map(d=>'<th>'+esc(d)+'</th>').join('')+'</tr></thead><tbody>'+S.periods.map((p,pi)=>'<tr><th>'+esc(p.label)+'<div style="font-weight:400;font-size:8px">'+esc((p.start||'')+'–'+(p.end||''))+'</div></th>'+S.days.map((d,di)=>'<td>'+(grid.get(di+'-'+pi)||[]).join('<hr>')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></body></html>';}};
}
function formEscolhas(){
  const opc=S.subjects.filter(s=>s.opc);if(!opc.length){toast('Marque primeiro as disciplinas opcionais em Dados da escola, Disciplinas.');return;}
  const o=x=>'<option value="'+esc(x[0])+'">'+esc(x[1])+'</option>',subs=[['','—']].concat(opc.map(s=>[s.short||s.name,s.name])),sel=(id,lab)=>'<label>'+lab+'<select id="'+id+'">'+subs.map(o).join('')+'</select></label>';
  deliver('escolha-de-opcoes.html','<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Escolha de opções · '+esc(S.name)+'</title><style>body{font:16px system-ui,sans-serif;max-width:520px;margin:24px auto;padding:0 16px}label{display:block;margin:12px 0;font-weight:600}input,select{display:block;width:100%;font:inherit;padding:8px;margin-top:4px;box-sizing:border-box}button{font:inherit;padding:10px 16px;margin-top:12px}textarea{width:100%;height:70px;font:14px monospace;box-sizing:border-box}</style></head><body><h1>'+esc(S.name)+'</h1><p>Escolha as disciplinas opcionais por ordem de preferência e indique uma suplente. No fim, envie à escola a linha que aparece em baixo.</p>'+
    '<label>N.º<input id="n"></label><label>Nome<input id="nome"></label><label>Turma<select id="t">'+S.classes.map(c=>o([c.name,c.name])).join('')+'</select></label>'+sel('e1','1.ª escolha')+sel('e2','2.ª escolha')+sel('e3','3.ª escolha')+sel('s1','Suplente')+
    '<button id="go">Gerar a linha para enviar</button><p><textarea id="out" readonly></textarea></p><scr'+'ipt>document.getElementById("go").onclick=function(){var g=function(i){return document.getElementById(i).value.trim();},a=[g("n"),g("nome"),g("t")];["e1","e2","e3"].forEach(function(i){if(g(i)&&a.indexOf(g(i))<3)a.push(g(i));});if(g("s1"))a.push("?"+g("s1"));document.getElementById("out").value=a.join(";");document.getElementById("out").select();};</scr'+'ipt></body></html>');
}
function permutaDlg(){
  let cls=(S.classes[0]||{}).id||'',date=ui.cdate;const ix=IX(),box=h('div',{class:'flex flex-wrap gap-3',id:'pm-box'});
  const fill=()=>{const cs=cardsFor('c',cls).filter(c=>c.day===wdOf(date)).sort((a,b)=>a.period-b.period),op=cs.length?cs.map(c=>[c.id,S.periods[c.period].label+'.º · '+lessonLabel(ix.l.get(c.lessonId))+(c.len>1?' ('+c.len+' TL)':'')]):[['','Sem aulas nesse dia']];box.replaceChildren(field('Aula A',selEl('pm-a',op[0][0],op,()=>{},'Aula A')),field('Aula B',selEl('pm-b',(op[1]||op[0])[0],op,()=>{},'Aula B')));};fill();
  openDlg('Permuta de aulas',h('div',{class:'flex flex-col gap-3'},h('span',{class:'text-sm opacity-70'},'Duas aulas da mesma turma trocam de tempo só nesta data. Têm de ter a mesma duração.'),h('div',{class:'flex flex-wrap gap-3 items-end'},field('Data',h('input',{type:'date',id:'pm-d',class:'input input-sm',value:date,onchange:e=>{if(e.target.value){date=e.target.value;fill();}}})),field('Turma',selEl('pm-c',cls,optsOf(S.classes),v=>{cls=v;fill();},'Turma'))),box),
    [btn('Cancelar',closeDlg),btn('Permutar',()=>{const a=S.cards.find(c=>c.id===$('#pm-a').value),b=S.cards.find(c=>c.id===$('#pm-b').value);if(!a||!b||a===b){toast('Escolha duas aulas diferentes.');return;}if(a.len!==b.len){toast('As duas aulas têm de ter a mesma duração.');return;}closeDlg();
      mutate(()=>{S.pontuais.push({id:uid(),data:date,cardId:a.id,nd:date,np:b.period,sala:'',perm:true},{id:uid(),data:date,cardId:b.id,nd:date,np:a.period,sala:'',perm:true});});toast('Permuta registada para '+date+'.','Anular',desfazer,'ok');},'btn-primary')]);
}
function reservaDlg(){
  openDlg('Reservar uma sala',h('div',{class:'flex flex-wrap gap-3 items-end'},field('Data',h('input',{type:'date',id:'rs-d',class:'input input-sm',value:ui.cdate})),field('Sala',selEl('rs-s',(S.rooms[0]||{}).id||'',optsOf(S.rooms),()=>{},'Sala')),field('Começa no',selEl('rs-p','0',S.periods.map((p,i)=>[String(i),p.label+'.º tempo']),()=>{},'Tempo')),field('Duração (TL)',h('input',{type:'number',id:'rs-l',class:'input input-sm w-20',min:1,max:S.periods.length,value:1})),field('Quem e para quê',h('input',{type:'text',id:'rs-q',class:'input input-sm w-64',placeholder:'Por exemplo: Clube de Ciência'}))),
    [btn('Cancelar',closeDlg),btn('Reservar',()=>{const v={id:uid(),data:$('#rs-d').value||ui.cdate,sala:$('#rs-s').value,period:+$('#rs-p').value,len:Math.max(1,+$('#rs-l').value||1),quem:$('#rs-q').value.trim()};const mdl=M(),wd=wdOf(v.data),r=mdl.resIdx('r',v.sala);let conf=0;
      if(wd<S.days.length&&r!==undefined)for(let i=0;i<v.len&&v.period+i<mdl.P;i++)if(mdl.busy(r,wd*mdl.P+v.period+i))conf++;
      if((S.reservas||[]).some(x=>x.data===v.data&&x.sala===v.sala&&x.period<v.period+v.len&&v.period<x.period+x.len))conf++;
      if(conf){toast('A sala já está ocupada nesse horário (aulas do horário semanal ou outra reserva).',null,null,'bad');return;}closeDlg();mutate(()=>{(S.reservas=S.reservas||[]).push(v);});},'btn-primary')]);
}
function exSalas(e){
  const ix=IX(),als=S.alunos.filter(a=>e.classIds.includes(a.classId)).sort((a,b)=>a.nome.localeCompare(b.nome)),tot=als.length||e.classIds.reduce((n,c)=>n+((ix.c.get(c)||{}).alunos|0),0),cur=new Set(e.salas||(e.roomId?[e.roomId]:[]));
  openDlg('Salas do exame '+e.nome,h('div',{class:'flex flex-col gap-2'},h('span',{class:'text-sm opacity-70'},tot+' alunos para distribuir'+(als.length?', por ordem alfabética.':' (número de alunos das turmas; registe os alunos para ter a lista por sala).')),
    h('div',{class:'grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 max-h-56 overflow-auto border border-base-300 rounded-box p-2'},S.rooms.map(r=>h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',name:'exs',id:'exs-'+r.id,class:'checkbox checkbox-xs',value:r.id,checked:cur.has(r.id)}),r.name+(r.cap?' ('+r.cap+')':''))))),
    [btn('Cancelar',closeDlg),btn('Distribuir',()=>{const ids=Array.from($('#dlg').querySelectorAll('input[name=exs]:checked')).map(x=>x.value);closeDlg();if(!ids.length)return;
      mutate(()=>{e.salas=ids;e.roomId=ids[0];const caps=ids.map(id=>(ix.r.get(id)||{}).cap|0),sum=caps.reduce((a,b)=>a+b,0),quota=ids.map((id,i)=>sum&&caps.every(c=>c>0)?Math.ceil(tot*caps[i]/sum):Math.ceil(tot/ids.length));e.dist=[];let k=0;ids.forEach((id,i)=>{const n=Math.min(quota[i],tot-k);e.dist.push({sala:id,n:Math.max(0,n),alunos:als.slice(k,k+Math.max(0,n)).map(a=>a.id)});k+=Math.max(0,n);});});},'btn-primary')],true);
}
function diaReal(kind,id,date){
  const ix=IX(),wd=wdOf(date),away=awayFn(date),out=[];if(wd>=S.days.length)return out;
  for(const c of cardsFor(kind,id).filter(c=>c.day===wd).sort((a,b)=>a.period-b.period)){const l=ix.l.get(c.lessonId),pt=S.pontuais.find(x=>x.cardId===c.id&&x.data===date);
    for(let i=0;i<c.len;i++){const p=c.period+i;let est='normal',txt='';
      if(l.classIds.length&&l.classIds.every(x=>away(x,p))){est='suspensa';txt='Turma em exame ou evento';}
      for(const ln of l.linhas){const rec=ln.t&&S.cover[date+'|'+ln.t];if(!rec)continue;const v=rec[c.id+'|'+p];if(!v&&(S.coverP||{})[date+'|'+ln.t])continue;est=v==='x'?'anulada':v?'substituída':'por substituir';txt=v==='x'?'Aula anulada':v?'Dada por '+nm('t',v):nm('t',ln.t)+' ausente';}
      if(pt){const mov=pt.nd!==date||pt.np!==c.period;est=mov?'mudada':'outra sala';txt=mov?'Passa para '+pt.nd+', '+S.periods[pt.np].label+'.º':'Sala '+(pt.sala?nm('r',pt.sala):'');}
      out.push({p,l,c,est,txt});}}
  for(const x of S.pontuais){if(x.nd!==date)continue;const c=S.cards.find(k=>k.id===x.cardId);if(!c||(x.data===date&&x.np===c.period))continue;const l=ix.l.get(c.lessonId);if(!cardsFor(kind,id).includes(c))continue;for(let i=0;i<c.len;i++)out.push({p:x.np+i,l,c,est:'vinda de '+x.data,txt:x.sala?'Sala '+nm('r',x.sala):''});}
  return out.sort((a,b)=>a.p-b.p);
}
function anualOpc(l){
  const gs=S.gsem||[];
  openDlg('Opções anuais de '+lessonLabel(l),h('div',{class:'flex flex-wrap gap-3 items-end'},field('Começa em',h('input',{type:'date',id:'ao-de',class:'input input-sm',value:l.de||''}),'vazio = início do ano'),field('Acaba em',h('input',{type:'date',id:'ao-ate',class:'input input-sm',value:l.ate||''}),'vazio = fim do ano'),field('Só nas semanas do grupo',selEl('ao-g',l.gsem||'',[['','Todas as semanas']].concat(gs.map(g=>[g.id,g.nome])),()=>{},'Grupo de semanas'))),
    [btn('Cancelar',closeDlg),btn('Guardar',()=>{const v={de:$('#ao-de').value,ate:$('#ao-ate').value,gsem:$('#ao-g').value};closeDlg();mutate(()=>{Object.assign(l,v);});},'btn-primary')]);
}
function gsemDlg(g){
  const isNew=!g,wks=semanas();g=g||{nome:'Grupo de semanas',semanas:[]};const on=new Set(g.semanas);
  openDlg(isNew?'Novo grupo de semanas':'Editar grupo de semanas',h('div',{class:'flex flex-col gap-3'},field('Nome',h('input',{type:'text',id:'gs-n',class:'input input-sm w-64',value:g.nome})),h('div',{class:'grid grid-cols-4 sm:grid-cols-8 gap-1 max-h-64 overflow-auto',id:'gs-box'},wks.map(w=>h('label',{class:'flex items-center gap-1 text-xs'+(w.n?'':' opacity-40')},h('input',{type:'checkbox',name:'gsw',class:'checkbox checkbox-xs',value:w.seg,checked:on.has(w.seg)}),isoBr(w.seg))))),
    [btn('Cancelar',closeDlg),btn('Guardar',()=>{const v={nome:$('#gs-n').value.trim()||'Grupo',semanas:Array.from($('#dlg').querySelectorAll('input[name=gsw]:checked')).map(x=>x.value)};closeDlg();mutate(()=>{S.gsem=S.gsem||[];if(isNew)S.gsem.push(Object.assign({id:uid()},v));else Object.assign(g,v);});},'btn-primary')],true);
}
(function(){
  const wrap=(n,fn)=>{const o=PAGES[n];PAGES[n]=m=>{o(m);fn(m);};};
  wrap('impressao',m=>{
    const lg=logosDe(),slot=(k,t)=>h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},t),h('input',{type:'file',id:'lg-'+k,'aria-label':'Logótipo: '+t,accept:'image/png,image/jpeg,image/svg+xml',class:'file-input file-input-xs w-56',disabled:busy,onchange:e=>{const f=e.target.files[0];if(!f)return;if(f.size>300000){toast('Use uma imagem com menos de 300 KB.');return;}const rd=new FileReader();rd.onload=()=>mutate(()=>{S.logos=logosDe();S.logos[k]=rd.result;delete S.logo;});rd.readAsDataURL(f);}}),
      lg[k]?h('div',{class:'flex items-center gap-2'},h('img',{src:lg[k],alt:t,style:'height:32px'}),btn('Retirar',()=>mutate(()=>{S.logos=logosDe();delete S.logos[k];delete S.logo;}),'btn-xs btn-ghost',{disabled:busy})):null);
    m.append(panel('Logótipos no horário impresso',h('div',{class:'flex flex-wrap gap-6'},slot('tl','Canto superior esquerdo'),slot('tr','Canto superior direito'),slot('bc','Centrado em baixo')),h('span',{class:'text-xs opacity-60'},'Cada posição é opcional. Use o de baixo, por exemplo, para a barra de logótipos dos projetos financiados.')));
  });
  wrap('alunos',m=>{if(ui.alTab==='dist')m.append(h('div',{class:'noprint'},btn('Descarregar formulário de escolhas para os alunos',formEscolhas,'btn-sm')));});
  wrap('exames',m=>{
    const ix=IX(),rows=S.exames.filter(e=>e.classIds.length);if(!rows.length)return;
    m.append(panel('Salas e distribuição dos alunos',tableWrap(h('table',{class:'table table-sm',id:'exs-tab'},h('thead',{},h('tr',{},['Exame','Salas e alunos por sala',''].map(t=>h('th',{},t)))),h('tbody',{},rows.map(e=>h('tr',{},h('td',{class:'font-medium'},e.nome+' · '+e.data),h('td',{class:'text-sm'},(e.dist||[]).length?e.dist.map(d=>nm('r',d.sala)+': '+d.n+(d.alunos.length?' ('+nmAl(d.alunos[0])+' a '+nmAl(d.alunos[d.alunos.length-1])+')':'')).join(' · '):'por distribuir'),h('td',{class:'noprint'},btn('Escolher salas e distribuir',()=>exSalas(e),'btn-sm',{disabled:busy}))))))),
      h('p',{class:'text-xs opacity-60'},'Os alunos são repartidos pelas salas na proporção da capacidade, por ordem alfabética. Os vigilantes são propostos dando prioridade a quem tem menos vigilâncias marcadas na época.')));
  });
  wrap('diario',m=>{
    const ix=IX();
    if(ui.dTab==='folha'){
      const rs=(S.reservas||[]).filter(x=>x.data===ui.cdate).sort((a,b)=>a.period-b.period);
      m.append(h('div',{class:'flex flex-wrap items-end gap-2 noprint'},btn('Permuta de aulas',permutaDlg,'btn-sm',{disabled:busy||!S.classes.length}),btn('Reservar sala',reservaDlg,'btn-sm',{disabled:busy||!S.rooms.length}),
        field('Folha só de um professor',selEl('fd-prof',ui.dProf||'',optsOf(S.teachers,'Todos'),v=>{ui.dProf=v;render();},'Professor','max-w-60'))));
      if(ui.dProf){const n=nm('t',ui.dProf),t=m.querySelector('#folha-tab')||$('#folha-tab');if(t)t.querySelectorAll('tbody tr').forEach(tr=>{if(!tr.textContent.includes(n))tr.remove();});}
      if(rs.length)m.append(panel('Salas reservadas neste dia',h('ul',{class:'text-sm flex flex-col gap-1',id:'res-list'},rs.map(x=>h('li',{class:'flex items-center gap-2'},h('b',{},tlTxt(x)[0]+'.º'),nm('r',x.sala)+' · '+(x.quem||'reserva'),btn('Apagar',()=>mutate(()=>{S.reservas=S.reservas.filter(k=>k!==x);}),'btn-xs btn-ghost text-error noprint',{disabled:busy}))))));
      const dr=ui.dReal||(ui.dReal={k:'c',id:''});if(!ix[dr.k].has(dr.id))dr.id=(list(dr.k)[0]||{}).id||'';
      const rows=dr.id?diaReal(dr.k,dr.id,ui.cdate):[],cor={normal:'mute','suspensa':'info','anulada':'bad','por substituir':'bad','substituída':'ok','mudada':'warn','outra sala':'warn'};
      m.append(panel('Horário real deste dia',h('div',{class:'flex flex-wrap items-end gap-3 noprint'},field('Ver',selEl('dr-k',dr.k,[['c','Turma'],['t','Professor'],['r','Sala']],v=>{dr.k=v;dr.id='';render();},'Tipo')),field(KINDS[dr.k][1],selEl('dr-id',dr.id,optsOf(list(dr.k)),v=>{dr.id=v;render();},'Elemento','max-w-60'))),
        tableWrap(h('table',{class:'table table-sm',id:'real-tab'},h('thead',{},h('tr',{},['TL','Aula','Professor','Sala','Estado','Nota'].map(t=>h('th',{},t)))),h('tbody',{},rows.map(r=>h('tr',{class:r.est==='normal'?'':'bg-base-200'},h('td',{class:'font-bold'},S.periods[r.p]?S.periods[r.p].label+'.º':''),h('td',{},lessonLabel(r.l)),h('td',{},uniq(r.l.linhas.map(ln=>ln.t&&nm('t',ln.t))).join(', ')||'—'),h('td',{},uniq(roomsOfCard(r.c).map(x=>x&&nm('r',x))).join('/')||'—'),h('td',{},badge(r.est,cor[r.est]||'warn')),h('td',{class:'text-sm'},r.txt))),rows.length?null:h('tr',{},h('td',{colspan:6,class:'opacity-60'},'Sem aulas neste dia.')))))));
    }
    if(ui.dTab==='contadores'){
      const mes=new Map();for(const k in S.cover){const mth=k.slice(0,7);mes.set(mth,(mes.get(mth)||0)+1);}const arr=[...mes].sort(),mx=Math.max(1,...arr.map(x=>x[1]));
      m.append(panel('Ausências por mês',arr.length?h('div',{class:'flex items-end gap-2 h-40',id:'mes-graf',role:'img','aria-label':'Ausências por mês'},arr.map(([k,v])=>h('div',{class:'flex flex-col items-center gap-1 grow'},h('span',{class:'text-xs font-semibold'},String(v)),h('div',{class:'w-full bg-primary rounded-t',style:'height:'+Math.round(v/mx*110)+'px'}),h('span',{class:'text-xs opacity-70'},k.slice(5)+'/'+k.slice(2,4))))):h('p',{class:'text-sm opacity-60'},'Sem ausências registadas.')));
    }
  });
  wrap('anual',m=>{
    if(ui.anTab==='per')return;const gs=S.gsem||[];
    m.append(panel('Grupos de semanas',h('div',{class:'flex flex-wrap items-center gap-2'},h('span',{class:'text-sm opacity-70 grow'},'Conjuntos de semanas com nome (estágios, semanas de testes). Para limitar uma aula a um grupo ou a datas próprias, carregue no nome da aula na tabela.'),btn('Novo grupo',()=>gsemDlg(),'btn-sm',{disabled:busy||!S.inicio||!S.fim})),
      gs.length?h('div',{class:'flex flex-wrap gap-2',id:'gsem-list'},gs.map(g=>h('div',{class:'join'},btn(g.nome+' ('+g.semanas.length+' semanas)',()=>gsemDlg(g),'btn-sm join-item',{disabled:busy}),btn('Apagar',()=>mutate(()=>{S.gsem=S.gsem.filter(x=>x!==g);S.lessons.forEach(l=>{if(l.gsem===g.id)l.gsem='';});}),'btn-sm join-item text-error',{disabled:busy})))):null));
  });
})();
const nmAl=id=>{const a=S.alunos.find(x=>x.id===id);return a?a.nome:'?';};

