/* ---------- ficheiro: cópias, exportações, novo ano, teste de carga ---------- */
const EXP_BUILTIN=[
  {id:'csv',nome:'Folha de cálculo (CSV, uma linha por tempo letivo)',ficheiro:'horarios.csv',por:'tl',bom:true,cab:'Dia;TL;Início;Fim;Turma;Disciplina;Professor;Sala;Tipologia;Semana',linha:'{dia_nome};{tempo};{inicio};{fim};{turma};{disc_nome};{prof_nome};{sala};{tipologia};{semana}'},
  {id:'inovar',nome:'INOVAR (Professor, Ano, Turma, Disciplina, Sala, Dia, Tempo)',ficheiro:'horarios-inovar.csv',por:'tl',cab:'',linha:'{prof},{ano},{letra},{disc},{sala},{dia},{tempo}'},
  {id:'pleon',nome:'DBG pleon (GPU001.TXT com os códigos de turma, professor e disciplina)',ficheiro:'GPU001.TXT',por:'tl',ord:'aula',semVazios:true,soTurmas:true,cab:'',linha:'{n},"{turma}","{proc}","{disc}","{sala}",{dia},{tempo},,'},
  {id:'gpu001',nome:'GPU001.TXT (horários, formato DIF)',ficheiro:'GPU001.TXT',por:'tl',cab:'',linha:'{n},"{turma_ponto}","{proc}","{disc}","{sala}",{dia},{tempo},,'},
  {id:'aulas',nome:'Lista de aulas (uma linha por aula)',ficheiro:'aulas.csv',por:'aula',bom:true,cab:'N.º;Turma;Disciplina;Professor;Sala;TL;Tipologia;Semana',linha:'{n};{turma};{disc_nome};{prof_nome};{sala};{tl};{tipologia};{semana}'}];
const EXP_KEYS=[['n','n.º da aula'],['turma','turma'],['ano','ano da turma'],['letra','turma sem o ano'],['turma_ponto','turma como 5.A'],['prof','código do professor'],['prof_nome','nome do professor'],['proc','n.º de processo'],['disc','código da disciplina'],['disc_nome','nome da disciplina'],
  ['sala','sala'],['dia','dia (1 a 6)'],['dia_nome','dia por extenso'],['tempo','tempo letivo'],['inicio','hora de início'],['fim','hora de fim'],['tipologia','turno'],['semana','A, B, S1 ou S2'],['tl','TL semanais da aula']];
function expRows(por){
  const out=[],ix=IX();
  const tp=ci=>{if(!ci)return ['0','Fic','0.Fic',''];const n=nm('c',ci),mt=/^(\d+)\s*[ºª.]?\s*(.*)$/.exec(n);return mt?[mt[1],mt[2],mt[1]+'.'+mt[2],n]:['0',n,'0.'+n,n];};
  const base=(l,ln,ci,room)=>{const a=tp(ci),t=ix.t.get(ln.t),s=ix.s.get(ln.s)||{};return {n:l.n,turma:a[3],ano:a[0],letra:a[1],turma_ponto:a[2],prof:t?(t.short||t.name):'',prof_nome:t?t.name:'',proc:t?(t.proc||t.short||''):'',disc:s.short||s.name||'',disc_nome:s.name||'',sala:room?nm('r',room):'',tipologia:ln.tip||'',semana:l.per||'',tl:l.tl,dia:'',dia_nome:'',tempo:'',inicio:'',fim:''};};
  if(por==='aula'){for(const l of S.lessons){if(l.ign)continue;l.linhas.forEach(ln=>(ln.cls&&ln.cls.length?ln.cls.filter(x=>l.classIds.includes(x)):l.classIds.length?l.classIds:['']).forEach(ci=>out.push(base(l,ln,ci,roomOfLine(l,ln)))));}return out;}
  const cs=S.cards.filter(c=>c.day!=null).sort((a,b)=>a.day-b.day||a.period-b.period);
  for(const c of cs){const l=ix.l.get(c.lessonId),rs0=roomsOfCard(c);for(let i=0;i<c.len;i++){const p=tempoDe(l,c.period+i),rs=c.rx&&c.rx[i]?c.rx[i].map(x=>x==='-'?'':x):rs0;
    l.linhas.forEach((ln,j)=>(ln.cls&&ln.cls.length?ln.cls.filter(x=>l.classIds.includes(x)):l.classIds.length?l.classIds:['']).forEach(ci=>out.push(Object.assign(base(l,ln,ci,rs[j]),{dia:c.day+1,dia_nome:S.days[c.day],tempo:c.period+i+1,inicio:p.start||'',fim:p.end||''}))));}}
  return out;
}
function expText(e,limit){let rows=expRows(e.por);if(e.soTurmas)rows=rows.filter(r=>r.turma);if(e.ord==='aula')rows.sort((x,y)=>x.n-y.n||x.dia-y.dia||x.tempo-y.tempo);if(limit)rows=rows.slice(0,limit);let ls=rows.map(r=>e.linha.replace(/\{(\w+)\}/g,(mm,k)=>k in r?String(r[k]):mm));if(e.semVazios)ls=ls.map(x=>x.replace(/""/g,''));return (e.bom&&!limit?'﻿':'')+(e.cab?[e.cab]:[]).concat(ls).join('\r\n');}
function gpu2(){
  const rows=[],q=s=>'"'+String(s||'').replace(/"/g,'')+'"',dt=d=>(d||'').replace(/-/g,''),ix=IX();
  for(const r of expRows('aula')){const a=new Array(37).fill('');a[0]=r.n;a[1]=r.tl;a[4]=q(r.turma_ponto);a[5]=q(r.proc);a[6]=q(r.disc);a[7]=q(r.sala);a[12]=q(r.tipologia);a[14]=dt(S.inicio);a[15]=dt(S.fim);rows.push(a.join(','));}
  return rows.join('\r\n');
}
function xmlOut(){
  const a=(o)=>Object.keys(o).filter(k=>o[k]!==''&&o[k]!=null&&o[k]!==false).map(k=>' '+k+'="'+esc(o[k])+'"').join(''),ix=IX(),L=['<?xml version="1.0" encoding="UTF-8"?>','<horario escola="'+esc(S.name)+'" ano="'+esc(S.ano)+'" inicio="'+esc(S.inicio||'')+'" fim="'+esc(S.fim||'')+'">'];
  L.push(' <grelha dias="'+S.days.length+'">');S.periods.forEach((p,i)=>L.push('  <tempo'+a({n:i+1,nome:p.label,inicio:p.start,fim:p.end,intervalo:p.breakAfter?1:''})+'/>'));L.push(' </grelha>');
  L.push(' <turmas>');S.classes.forEach(c=>L.push('  <turma'+a({id:c.name,nome:c.full,sala:c.roomId?nm('r',c.roomId):'',dt:c.dt?sh('t',c.dt):'',alunos:c.alunos||''})+'/>'));L.push(' </turmas>');
  L.push(' <professores>');S.teachers.forEach(t=>L.push('  <professor'+a({id:t.short||t.name,nome:t.name,processo:t.proc,tl:t.prev||''})+'/>'));L.push(' </professores>');
  L.push(' <salas>');S.rooms.forEach(r=>L.push('  <sala'+a({id:r.name,alternativa:r.alt?nm('r',r.alt):'',edificio:r.ed,capacidade:r.cap||''})+'/>'));L.push(' </salas>');
  L.push(' <disciplinas>');S.subjects.forEach(s=>L.push('  <disciplina'+a({id:s.short||s.name,nome:s.name,fator:s.fator,marginal:s.marg?1:'',cnl:s.cnl?1:''})+'/>'));L.push(' </disciplinas>');
  L.push(' <alunos>');S.alunos.forEach(al=>L.push('  <aluno'+a({n:al.num,nome:al.nome,turma:nm('c',al.classId),aulas:alAulas(al).map(l=>l.n).join(',')})+'/>'));L.push(' </alunos>');
  L.push(' <aulas>');
  for(const l of S.lessons){L.push('  <aula'+a({n:l.n,tl:l.tl,duplos:l.duplos||'',blocos:l.blocos,semana:l.per,fixa:l.fixa?1:'',turmas:l.classIds.map(c=>nm('c',c)).join(',')})+'>');
    l.linhas.forEach(ln=>L.push('   <linha'+a({disciplina:sh('s',ln.s),professor:ln.t?sh('t',ln.t):'',sala:roomOfLine(l,ln)?nm('r',roomOfLine(l,ln)):'',turno:ln.tip})+'/>'));
    for(const c of ix.cl.get(l.id)||[])if(c.day!=null)L.push('   <colocacao'+a({dia:c.day+1,tempo:c.period+1,duracao:c.len,salas:roomsOfCard(c).map(r=>r?nm('r',r):'').join(',')})+'/>');
    L.push('  </aula>');}
  L.push(' </aulas>','</horario>');return L.join('\r\n');
}
function novoAno(){
  const ck=(id,label,on)=>h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id,class:'checkbox checkbox-sm',checked:on}),label);
  openDlg('Novo ano letivo',h('div',{class:'flex flex-col gap-3'},h('span',{class:'text-sm opacity-70'},'Mantém turmas, professores, salas, disciplinas e currículos. Descarregue antes uma cópia de segurança do ano atual.'),
    field('Ano letivo',h('input',{type:'text',id:'na-ano',class:'input input-sm w-40',value:S.ano.replace(/\d{4}/g,y=>String(+y+1))})),
    ck('na-hab','Criar habilitações a partir das aulas deste ano',true),ck('na-hor','Apagar os horários',true),ck('na-serv','Apagar a distribuição de serviço (professores das aulas)',true),ck('na-req','Apagar as disponibilidades',false),
    ck('na-sub','Apagar substituições e vigilâncias',true),ck('na-fer','Apagar férias e feriados',true),ck('na-reu','Apagar as reuniões',true),ck('na-num','Renumerar as aulas',true)),
    [btn('Cancelar',closeDlg),btn('Criar novo ano',()=>{const g=id=>$('#'+id).checked,v={ano:$('#na-ano').value.trim(),hab:g('na-hab'),hor:g('na-hor'),serv:g('na-serv'),req:g('na-req'),sub:g('na-sub'),fer:g('na-fer'),reu:g('na-reu'),num:g('na-num')};closeDlg();
      const lt=IX().lt;
      if(mutate(()=>{S.ano=v.ano||S.ano;if(v.hab)S.teachers.forEach(t=>{t.hab=uniq((t.hab||[]).concat((lt.get(t.id)||[]).map(x=>x[1].s)));});
        if(v.hor)S.cards.forEach(c=>{c.day=null;c.period=null;c.locked=false;delete c.r;});if(v.serv)S.lessons.forEach(l=>l.linhas.forEach(ln=>{ln.t='';}));if(v.req)S.off={};if(v.sub){S.cover={};S.vig={};S.coverM={};S.eventos=[];S.pontuais=[];S.exames=[];}
        if(v.fer){S.ferias=[];S.inicio='';S.fim='';}if(v.reu)S.reunioes=[];S.horarios=[];S.hAtivo='';S.plano={};S.alunos.forEach(al=>{al.fora=[];al.extra=[];});S.lessons=S.lessons.filter(l=>l.classIds.length||l.linhas.some(ln=>ln.t));if(v.num)S.lessons.forEach((l,i)=>{l.n=i+1;});}))toast('Novo ano letivo preparado.','Anular',desfazer);},'btn-primary')]);
}
PAGES.ficheiro=function(m){
  if(!ui.exp)ui.exp=Object.assign({},EXP_BUILTIN[0]);
  const all=EXP_BUILTIN.concat(S.exports),e=ui.exp,user=S.exports.some(x=>x.id===e.id);
  m.append(pageHead('Ficheiro','Cópias de segurança, exportações e novo ano letivo.'));
  m.append(panel('Cópia de segurança',h('p',{class:'text-sm opacity-70'},'Todos os dados num único ficheiro. Os dados ficam guardados na sua conta EduSpruce; pode também descarregar uma cópia para guardar à parte.'),
    h('div',{class:'flex flex-wrap gap-2 items-center'},btn('Descarregar cópia',()=>deliver('horarios-'+S.ano.replace(/\W+/g,'-')+'.json',JSON.stringify(S)),'btn-primary btn-sm'),
      h('label',{class:'btn btn-sm',for:'im-file'},'Abrir cópia…'),
      h('input',{type:'file',id:'im-file',accept:'.json,application/json',class:'sr-only',disabled:busy,onchange:async ev=>{const f=ev.target.files[0];if(!f)return;
        try{const st=JSON.parse(await f.text());if(!st||!Array.isArray(st.lessons)||!Array.isArray(st.periods))throw 0;replaceAll(st,'Cópia aberta.');}
        catch(x){toast('Esse ficheiro não é uma cópia deste planeador. Escolha um .json descarregado aqui.',null,null,'bad');}}}),
      'showSaveFilePicker' in window?btn(fileHandle?'Ligado a '+fileName:'Guardar automaticamente num ficheiro…',async()=>{try{fileHandle=await window.showSaveFilePicker({suggestedName:'horarios-'+S.ano.replace(/\W+/g,'-')+'.json',types:[{description:'Planeador de horários',accept:{'application/json':['.json']}}]});fileName=fileHandle.name;save();render();toast('A partir de agora cada alteração é guardada em '+fileName+'.',null,null,'ok');}catch(x){}},'btn-sm'):null)));
  m.append(panel('Importar de outro programa de horários',h('div',{class:'flex flex-wrap gap-2 items-center'},btn('Importar horários em PDF…',updfEscolher,'btn-sm btn-imp',{disabled:busy}),h('span',{class:'text-sm opacity-70'},'Horários impressos pelo Untis, em massa: escolha todos os PDF de uma vez (de professores, turmas e salas; um horário por página). Mostra o que vai entrar antes de importar; nada é apagado.')),h('p',{class:'text-sm opacity-70'},'No programa de origem, exporte os ficheiros de texto de intercâmbio (formato DIF) e escolha-os aqui todos de uma vez. O GPU001.TXT (horários) é obrigatório; GPU002 (aulas), GPU003 (turmas), GPU004 (professores), GPU005 (salas) e GPU006 (disciplinas) acrescentam os nomes completos e as aulas ainda sem horário. As aulas chegam já colocadas, tal como estavam. Por omissão juntam-se ao horário atual sem apagar nada (também pode substituir tudo; pode sempre anular).'),
    h('div',{class:'flex flex-wrap gap-2 items-center'},h('label',{class:'btn btn-sm btn-imp',for:'im-dif'},'Importar ficheiros GPU…'),
      h('input',{type:'file',id:'im-dif',multiple:true,accept:'.txt,.TXT,text/plain',class:'sr-only',disabled:busy,onchange:async ev=>{const fs={};for(const f of ev.target.files){const buf=await f.arrayBuffer();let t;try{t=new TextDecoder('utf-8',{fatal:true}).decode(buf);}catch(x){t=new TextDecoder('windows-1252').decode(buf);}fs[f.name]=t;}
        try{importPreview(importDIF(fs,{name:S.name,ano:S.ano,periods:S.periods}),fs);ev.target.value='';}
        catch(x){toast(x.message||'Não foi possível ler esses ficheiros.',null,null,'bad');}}}),
      h('span',{class:'text-xs opacity-60'},'Só são lidos ficheiros de intercâmbio em texto ou XML; os ficheiros de trabalho de outros programas não.'))));
  m.append(panel('Exportar horários para outros programas',
    h('p',{class:'text-sm opacity-70'},'Escolha um modelo pronto ou monte o seu: cada linha do ficheiro é escrita a partir do modelo de linha, trocando os campos entre chavetas pelos dados de cada tempo letivo ou de cada aula. Serve para qualquer programa que importe ficheiros de texto.'),
    h('div',{class:'flex flex-wrap gap-3 items-end'},
      field('Modelo',selEl('ex-preset',all.some(x=>x.id===e.id)?e.id:'',all.map(x=>[x.id,x.nome]).concat(all.some(x=>x.id===e.id)?[]:[['','Modelo novo (por guardar)']]),v=>{const p=all.find(x=>x.id===v);if(p){ui.exp=Object.assign({},p);render();}},'Modelo','max-w-md')),
      field('Nome do ficheiro',h('input',{type:'text',id:'ex-file',class:'input input-sm w-52',value:e.ficheiro,onchange:ev=>{e.ficheiro=ev.target.value.trim()||'exportacao.txt';}})),
      field('Uma linha por',selEl('ex-por',e.por,[['tl','tempo letivo colocado'],['aula','aula']],v=>{e.por=v;render();},'Uma linha por'))),
    field('Cabeçalho (opcional)',h('input',{type:'text',id:'ex-cab',class:'input input-sm w-full font-mono',value:e.cab,onchange:ev=>{e.cab=ev.target.value;render();}})),
    field('Modelo de linha',h('input',{type:'text',id:'ex-linha',class:'input input-sm w-full font-mono',value:e.linha,onchange:ev=>{e.linha=ev.target.value;render();}})),
    h('div',{class:'flex flex-wrap gap-1'},EXP_KEYS.map(k=>h('button',{type:'button',class:'badge badge-outline badge-sm cursor-pointer',title:'Acrescentar '+k[1],onclick:()=>{e.linha+='{'+k[0]+'}';render();}},'{'+k[0]+'} '+k[1]))),
    h('pre',{class:'bg-base-200 rounded-box p-3 text-xs overflow-x-auto max-h-40','aria-label':'Primeiras linhas'},expText(e,6)||'(sem linhas: ainda não há aulas colocadas)'),
    h('div',{class:'flex flex-wrap gap-2'},btn('Descarregar',()=>deliver(e.ficheiro,expText(e)),'btn-primary btn-sm'),
      btn('Guardar como modelo meu',()=>{const nome=($('#ex-nome').value||'').trim();if(!nome)return toast('Dê um nome ao modelo.');const cp=Object.assign({},e,{id:uid(),nome});delete cp.bom;mutate(()=>{S.exports.push(cp);});ui.exp=Object.assign({},cp);render();},'btn-sm',{disabled:busy}),
      h('input',{type:'text',id:'ex-nome',class:'input input-sm w-52',placeholder:'Nome do modelo novo','aria-label':'Nome do modelo novo'}),
      user?btn('Apagar este modelo',()=>{mutate(()=>{S.exports=S.exports.filter(x=>x.id!==e.id);});ui.exp=null;render();},'btn-sm btn-ghost text-error',{disabled:busy}):null,
      h('span',{class:'grow'}),btn('Dados em XML',()=>deliver('horarios.xml',xmlOut()),'btn-sm'),btn('XML de intercâmbio',()=>deliver('intercambio.xml',xmlTroca()),'btn-sm'),btn('Site HTML e calendários (zip)',()=>{const z=siteZip();if(z)deliverBlob('horarios-site.zip',z);else toast('Não há horários colocados para publicar.');},'btn-sm'),btn('GPU002.TXT (aulas, 37 colunas)',()=>deliver('GPU002.TXT',gpu2()),'btn-sm'),h('a',{href:'#impressao',class:'btn btn-sm'},'Horários para imprimir'))));
  m.append(h('div',{class:'grid lg:grid-cols-2 gap-4 items-start'},
    panel('Novo ano letivo',h('p',{class:'text-sm opacity-70'},'Prepara o ficheiro para o ano seguinte sem perder os dados da escola.'),h('div',{},btn('Novo ano letivo…',novoAno,'btn-sm',{disabled:busy}))),
    panel('Teste de carga do motor',h('p',{class:'text-sm opacity-70'},'Gera uma escola inventada com o tamanho que indicar, com solução garantida, para medir o motor de otimização neste computador. Substitui os dados atuais (pode anular).'),
      h('div',{class:'flex flex-wrap gap-3 items-end'},field('Turmas',h('input',{type:'number',id:'ts-c',class:'input input-sm w-24',min:2,max:300,value:100})),field('Professores',h('input',{type:'number',id:'ts-t',class:'input input-sm w-24',min:20,max:3000,value:1000})),
        btn('Gerar escola de teste',()=>{const nc=Math.max(2,Math.min(300,+$('#ts-c').value||100)),nt=Math.max(20,Math.min(3000,+$('#ts-t').value||1000));try{replaceAll(bigSample({classes:nc,teachers:nt,seed:(Math.random()*1e6)|0}).st,'Escola de teste gerada. Abra Otimização para a resolver.');}catch(x){toast('Não foi possível gerar com esses números: use mais professores por turma.',null,null,'bad');}},'btn-sm',{disabled:busy}))),
    panel('Recomeçar',h('p',{class:'text-sm opacity-70'},'As duas operações podem ser anuladas enquanto não fechar a página.'),
      h('div',{class:'flex flex-wrap gap-2'},btn('Carregar a escola de exemplo',()=>{const s=sample();quickSolve(s,900);replaceAll(s,'Escola de exemplo carregada.');},'btn-sm',{disabled:busy}),
        btn('Apagar todos os dados',()=>replaceAll({name:S.name,ano:S.ano,days:S.days,periods:S.periods,tlMin:S.tlMin,alvo:S.alvo,w:S.w,almoco:S.almoco,tarde:S.tarde,ferias:S.ferias,inicio:S.inicio,fim:S.fim,print:S.print,exports:S.exports},'Dados apagados. A grelha semanal foi mantida.'),'btn-sm btn-ghost text-error',{disabled:busy})))));
};

