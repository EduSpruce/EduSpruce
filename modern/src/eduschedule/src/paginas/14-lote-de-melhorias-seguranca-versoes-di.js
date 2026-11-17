/* ---------- lote de melhorias: segurança, versões, diagnóstico explicado, âmbito, perfis, teclado, ajuda ---------- */
const ERRS=[];window.addEventListener('error',e=>{ERRS.push({t:new Date().toISOString(),m:String(e.message||e).slice(0,300),f:(e.filename||'').slice(-40),l:e.lineno});if(ERRS.length>50)ERRS.shift();});
function bkList(){const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('ph-bk-'))out.push(k);}}catch(e){}return out.sort();}
let _bkDay='';
function bkAuto(json){try{const day=new Date().toISOString().slice(0,10),k='ph-bk-'+day;if(_bkDay===day)return;_bkDay=day;if(bkList().includes(k))return;let ks=bkList();while(ks.length>=10)localStorage.removeItem(ks.shift());
  for(let i=0;i<4;i++){try{localStorage.setItem(k,json);return;}catch(e){ks=bkList();if(!ks.length)return;localStorage.removeItem(ks.shift());}}}catch(e){}}
function integridade(){
  const C=new Set(S.classes.map(x=>x.id)),T=new Set(S.teachers.map(x=>x.id)),R=new Set(S.rooms.map(x=>x.id)),SU=new Set(S.subjects.map(x=>x.id)),rep=[];let n;const say=(k,t)=>{if(k)rep.push(k+' '+t);};
  n=0;for(const l of S.lessons){const a=l.classIds.length;l.classIds=l.classIds.filter(x=>C.has(x));n+=a-l.classIds.length;}say(n,'turmas inexistentes retiradas de aulas');
  n=0;for(const l of S.lessons){const a=l.linhas.length;l.linhas=l.linhas.filter(ln=>SU.has(ln.s));n+=a-l.linhas.length;for(const ln of l.linhas){if(ln.t&&!T.has(ln.t)){ln.t='';n++;}if(ln.r&&!R.has(ln.r)){ln.r='';n++;}if(ln.cls)ln.cls=ln.cls.filter(x=>C.has(x));}}say(n,'referências partidas em linhas de aulas');
  n=S.lessons.length;S.lessons=S.lessons.filter(l=>l.linhas.length);say(n-S.lessons.length,'aulas sem disciplina apagadas');
  const L=new Set(S.lessons.map(l=>l.id));n=S.cards.length;S.cards=S.cards.filter(c=>L.has(c.lessonId));say(n-S.cards.length,'colocações sem aula apagadas');
  n=0;for(const c of S.cards)if(c.r)c.r=c.r.map(x=>{if(x&&x!=='-'&&!R.has(x)){n++;return '';}return x;});say(n,'salas inexistentes retiradas de colocações');
  n=0;for(const c of S.classes){if(c.roomId&&!R.has(c.roomId)){c.roomId='';n++;}if(c.dt&&!T.has(c.dt)){c.dt='';n++;}if(c.grelha&&!S.grelhas.some(g=>g.id===c.grelha)){c.grelha='';n++;}}for(const r of S.rooms)if(r.alt&&!R.has(r.alt)){r.alt='';n++;}say(n,'referências partidas em turmas e salas');
  n=S.alunos.length;S.alunos=S.alunos.filter(a=>C.has(a.classId));say(n-S.alunos.length,'alunos sem turma apagados');for(const a of S.alunos){a.fora=(a.fora||[]).filter(x=>L.has(x));a.extra=(a.extra||[]).filter(x=>L.has(x));a.esc=(a.esc||[]).filter(x=>SU.has(x));a.sup=(a.sup||[]).filter(x=>SU.has(x));}
  const K=new Set(S.cards.map(c=>c.id));n=S.pontuais.length;S.pontuais=S.pontuais.filter(x=>K.has(x.cardId));say(n-S.pontuais.length,'alterações pontuais de aulas apagadas retiradas');
  for(const e of S.exames){e.classIds=e.classIds.filter(x=>C.has(x));e.vig=(e.vig||[]).filter(x=>T.has(x));}for(const e of S.eventos){e.classIds=e.classIds.filter(x=>C.has(x));e.teachers=(e.teachers||[]).filter(x=>T.has(x));}
  n=0;for(const k in S.cover)if(!T.has(k.split('|')[1])){delete S.cover[k];n++;}say(n,'ausências de professores inexistentes apagadas');
  n=0;for(const k in S.off){const id=k.slice(2),set={c:C,t:T,r:R,s:SU}[k[0]];if(!set||!set.has(id)){delete S.off[k];n++;}}say(n,'disponibilidades de elementos inexistentes apagadas');
  return rep;
}
function hvSnap(){return S.cards.filter(c=>c.day!=null).map(c=>[c.id,c.day,c.period,c.r||null,c.locked?1:0]);}
function hvDiff(v){const cur=new Map(S.cards.map(c=>[c.id,c])),ix=IX(),out=[],seen=new Set();for(const x of v.cards){seen.add(x[0]);const c=cur.get(x[0]);if(!c)continue;if(c.day!==x[1]||c.period!==x[2])out.push(c);}for(const c of S.cards)if(c.day!=null&&!seen.has(c.id))out.push(c);return out.map(c=>lessonLabel(ix.l.get(c.lessonId)));}
function baseImport(){
  openDlg('Importar dados da escola de uma lista',h('div',{class:'flex flex-col gap-2'},field('O que importar',selEl('bi-k','teachers',[['teachers','Professores'],['classes','Turmas'],['rooms','Salas'],['subjects','Disciplinas']],()=>{},'Tipo')),h('span',{class:'text-sm opacity-70'},'Uma linha por elemento: código; nome. Pode colar do Excel. Os códigos que já existem são ignorados.'),
    h('textarea',{id:'bi-t',class:'textarea w-full h-56 font-mono text-xs','aria-label':'Lista',placeholder:'MAT;Matemática\nPORT;Português'})),
    [btn('Cancelar',closeDlg),btn('Importar',()=>{const k=$('#bi-k').value,txt=$('#bi-t').value,has=new Set(S[k].map(x=>(x.short||x.name||'').toLowerCase()));let ok=0,ko=0;const add=[];
      for(const ln of txt.split(/\r?\n/)){if(!ln.trim())continue;const p=ln.split(ln.includes('\t')?'\t':ln.includes(';')?';':',').map(x=>x.trim().replace(/^"|"$/g,'')),code=p[0],nome=p[1]||p[0];if(!code||has.has(code.toLowerCase())){ko++;continue;}has.add(code.toLowerCase());
        add.push(k==='teachers'?{id:uid(),short:code,name:nome}:k==='subjects'?{id:uid(),short:code,name:nome}:k==='classes'?{id:uid(),name:code,full:p[1]||''}:{id:uid(),name:code});ok++;}
      closeDlg();if(ok)mutate(()=>{S[k].push(...add);normalize(S);});toast(ok+' importados'+(ko?'; '+ko+' linhas ignoradas (vazias ou repetidas)':'')+'.');},'btn-primary')],true);
}
function pascoa(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),hh=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-hh-k)%7,m=Math.floor((a+11*hh+22*l)/451),mo=Math.floor((hh+l-7*m+114)/31),da=((hh+l-7*m+114)%31)+1;return new Date(y,mo-1,da,12);}
function feriadosPT(){
  if(!S.inicio||!S.fim){toast('Indique primeiro o início e o fim do ano letivo.');return;}
  const y0=+S.inicio.slice(0,4),y1=+S.fim.slice(0,4),out=[],iso=d=>d.toISOString().slice(0,10),add=(d,n)=>{if(d>=S.inicio&&d<=S.fim&&!S.ferias.some(f=>f.de===d&&(f.ate||f.de)===d))out.push({id:uid(),nome:n,de:d,ate:d});};
  for(let y=y0;y<=y1;y++){for(const [md,n] of [['01-01','Ano Novo'],['04-25','Dia da Liberdade'],['05-01','Dia do Trabalhador'],['06-10','Dia de Portugal'],['08-15','Assunção de Nossa Senhora'],['10-05','Implantação da República'],['11-01','Todos os Santos'],['12-01','Restauração da Independência'],['12-08','Imaculada Conceição'],['12-25','Natal']])add(y+'-'+md,n);
    const p=pascoa(y),off=(n)=>{const d=new Date(p);d.setDate(d.getDate()+n);return iso(d);};add(off(-47),'Carnaval');add(off(-2),'Sexta-feira Santa');add(off(0),'Páscoa');add(off(50),'Dia da Região Autónoma dos Açores');add(off(60),'Corpo de Deus');}
  if(!out.length){toast('Os feriados deste ano letivo já estão no calendário.');return;}
  mutate(()=>{S.ferias.push(...out);});toast(out.length+' feriados acrescentados (nacionais e dos Açores). Falta o feriado municipal e as interrupções letivas.','Anular',desfazer,'ok');
}
function tabelaCsv(){const t=$('#main table');if(!t){toast('Não há nenhuma tabela nesta página.');return;}const rows=[];t.querySelectorAll('tr').forEach(tr=>{const r=[];tr.querySelectorAll('th,td').forEach(td=>{const inp=td.querySelector('input:not([type=checkbox]),select');let v=inp?(inp.tagName==='SELECT'?(inp.selectedOptions[0]||{}).textContent||'':inp.value):td.textContent;v=String(v).replace(/\s+/g,' ').trim();r.push(/[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v);});rows.push(r.join(';'));});
  deliver((ui.tab||'tabela')+'.csv','﻿'+rows.join('\r\n'));}
function porque(c){
  const mdl=M(),ix=IX(),a=mdl.cardIdx(c.id),pr=mdl.probeAll(a),NS=mdl.NS,l=ix.l.get(c.lessonId);let off=0,occ=0,free=0;for(let s=0;s<NS;s++){if(pr[s]<0)off++;else if(pr[s]>0)occ++;else free++;}
  const rk=l.classIds.map(x=>['c',x]).concat(uniq(l.linhas.map(ln=>ln.t)).map(x=>['t',x])).map(([k,id])=>{const r=mdl.resIdx(k,id);let b=0,im=0;for(let s=0;s<NS;s++){if(mdl.level(r,s)===-3)im++;else if(mdl.busy(r,s))b++;}return {k,id,b,im,livre:NS-b-im};}).sort((x,y)=>x.livre-y.livre),w=rk[0];
  let sug;if(free)sug='Há '+free+' tempos sem conflito: arraste-a nos Horários ou otimize com «Manter as colocadas e completar o resto».';
  else if(!w)sug='A aula não tem turma nem professor.';else if(w.im>=w.b)sug='Retire tempos impedidos a '+KINDS[w.k][1].toLowerCase()+' '+nm(w.k,w.id)+': tem '+w.im+' tempos impedidos e só '+w.livre+' livres.';
  else sug=KINDS[w.k][1]+' '+nm(w.k,w.id)+' já tem '+w.b+' dos '+NS+' tempos ocupados. Use «Propor trocas» nos Horários, ou reduza a carga.';
  return {l,off,occ,free,w,sug};
}
function optState(){const st=JSON.parse(JSON.stringify(S)),sc=opt.scope;if(sc&&sc.k&&sc.id!==''){const L=new Map(st.lessons.map(l=>[l.id,l]));for(const c of st.cards){if(c.day==null)continue;const l=L.get(c.lessonId),inn=sc.k==='c'?l.classIds.includes(sc.id):sc.k==='t'?l.linhas.some(ln=>ln.t===sc.id):c.day===+sc.id;if(!inn)c.locked=true;}}if(opt.pre)opt.pre(st);return st;}
function ausVarios(){
  openDlg('Ausência de vários dias',h('div',{class:'flex flex-wrap gap-3 items-end'},field('Professor',selEl('av-t',ui.cteacher||(S.teachers[0]||{}).id||'',optsOf(S.teachers),()=>{},'Professor','max-w-60')),field('De',h('input',{type:'date',id:'av-de',class:'input input-sm',value:ui.cdate})),field('Até',h('input',{type:'date',id:'av-ate',class:'input input-sm',value:ui.cdate})),field('Motivo',selEl('av-m','',[['','Sem motivo indicado']].concat(MOTIVOS.map(x=>[x,x])),()=>{},'Motivo'))),
    [btn('Cancelar',closeDlg),btn('Registar',()=>{const t=$('#av-t').value,de=$('#av-de').value,ate=$('#av-ate').value||de,mo=$('#av-m').value;closeDlg();if(!t||!de||ate<de){toast('Datas inválidas.');return;}let n=0;
      mutate(()=>{S.coverM=S.coverM||{};const d=new Date(de+'T12:00:00'),f=new Date(ate+'T12:00:00');for(let i=0;i<120&&d<=f;i++,d.setDate(d.getDate()+1)){const iso=d.toISOString().slice(0,10);if(wdOf(iso)>=S.days.length||feriasEm(iso))continue;const k=iso+'|'+t;if(!S.cover[k])S.cover[k]={};if(mo)S.coverM[k]=mo;n++;}});
      toast(n+' dias de ausência registados. Escolha os substitutos em Substituições.','Anular',desfazer);},'btn-primary')]);
}
function planoAcertar(l,r,wks){
  let dif=r.tot-l.anual;const w=r.w.slice();
  for(let pass=0;pass<60&&dif!==0;pass++){let ch=false;for(let i=wks.length-1;i>=0&&dif!==0;i--){if(!wks[i].n)continue;if(dif>0&&w[i]>0){w[i]--;dif--;ch=true;}else if(dif<0){w[i]++;dif++;ch=true;}}if(!ch)break;}
  mutate(()=>{S.plano=S.plano||{};const o=S.plano[l.id]=S.plano[l.id]||{};w.forEach((n,i)=>{if(n!==r.w[i])o[wks[i].seg]=n;});});
}
(function(){
  const wrap=(n,fn)=>{const o=PAGES[n];PAGES[n]=m=>{o(m);fn(m);};};
  for(const n of ['listagens','alunos','anual','diario','exames','servico'])wrap(n,m=>m.append(h('div',{class:'noprint'},btn('Exportar a tabela desta página para Excel (CSV)',tabelaCsv,'btn-sm btn-ghost'))));
  wrap('ficheiro',m=>{
    const size=JSON.stringify(S).length,mb=(size/1048576).toFixed(2),bks=bkList(),vs=S.versoesH||[];
    const tg=(k,label,hint)=>h('label',{class:'flex items-center gap-2 text-sm',title:hint},h('input',{type:'checkbox',id:'seg-'+k,class:'toggle toggle-sm',checked:!!S[k],disabled:busy,onchange:e=>{const v=e.target.checked;mutate(()=>{S[k]=v;},true);}}),label);
    m.append(panel('Segurança',h('div',{class:'flex flex-wrap items-center gap-4'},tg('ro','Modo só de leitura','Impede qualquer alteração aos dados'),tg('bloq','Bloquear o horário aprovado','Os dados podem mudar, mas nenhuma aula muda de tempo ou de sala'),
        badge('Dados: '+mb+' MB',size>3500000?'bad':'mute'),size>3500000?h('span',{class:'text-sm text-error'},'Horário muito grande: descarregue uma cópia de segurança e apague períodos ou versões antigas.'):null,h('span',{class:'grow'}),
        btn('Verificar integridade',()=>{let rep=[];mutate(()=>{rep=integridade();},true);openDlg('Verificação de integridade',rep.length?h('ul',{class:'list-disc pl-5 text-sm',id:'integ'},rep.map(x=>h('li',{},x))):h('p',{class:'text-sm',id:'integ'},'Não foram encontrados problemas nos dados.'),[rep.length?btn('Anular as correções',()=>{closeDlg();desfazer();}):null,btn('Fechar',closeDlg,'btn-primary')]);},'btn-sm',{disabled:busy}),
        btn('Importar dados da escola de uma lista',baseImport,'btn-sm',{disabled:busy}),btn('Relatório de erros',()=>deliver('relatorio-erros.json',JSON.stringify({quando:new Date().toISOString(),navegador:navigator.userAgent,dados:{turmas:S.classes.length,professores:S.teachers.length,salas:S.rooms.length,aulas:S.lessons.length,alunos:S.alunos.length,MB:mb},erros:ERRS},null,1)),'btn-sm')),
      h('div',{class:'flex flex-col gap-1'},h('span',{class:'font-medium text-sm'},'Cópias automáticas diárias na conta ('+bks.length+' de 10)'),h('div',{class:'flex flex-wrap gap-2',id:'bk-list'},bks.length?bks.slice().reverse().map(k=>btn('Repor '+k.slice(6),()=>{try{replaceAll(JSON.parse(localStorage.getItem(k)),'Cópia de '+k.slice(6)+' reposta.');}catch(e){toast('Não foi possível ler essa cópia.',null,null,'bad');}},'btn-xs',{disabled:busy})):h('span',{class:'text-sm opacity-60'},'A primeira é criada na próxima alteração de hoje.')))));
    m.append(panel('Versões do horário',h('div',{class:'flex flex-wrap items-center gap-2'},h('span',{class:'text-sm opacity-70 grow'},'Guarde o horário atual com um nome antes de experimentar mudanças; pode comparar e repor quando quiser.'),
        btn('Guardar versão',()=>openDlg('Guardar versão do horário',field('Nome',h('input',{type:'text',id:'hv-nome',class:'input input-sm w-64',value:'Versão de '+new Date().toISOString().slice(0,10)})),[btn('Cancelar',closeDlg),btn('Guardar',()=>{const n=$('#hv-nome').value.trim()||'Versão';closeDlg();mutate(()=>{(S.versoesH=S.versoesH||[]).push({id:uid(),nome:n,data:new Date().toISOString().slice(0,16).replace('T',' '),cards:hvSnap()});},true);},'btn-primary')]),'btn-sm btn-primary',{disabled:busy})),
      vs.length?tableWrap(h('table',{class:'table table-sm',id:'hv-tab'},h('thead',{},h('tr',{},['Versão','Guardada em','TL colocados','Diferenças para o atual',''].map(t=>h('th',{},t)))),h('tbody',{},vs.map(v=>{const d=hvDiff(v);
        return h('tr',{},h('td',{class:'font-medium'},v.nome),h('td',{},v.data),h('td',{class:'num'},String(v.cards.length)),h('td',{},d.length?badge(d.length+' aulas diferentes','warn'):badge('igual','ok')),
          h('td',{},h('div',{class:'join'},btn('Comparar',()=>openDlg('Diferenças para «'+v.nome+'»',d.length?h('ul',{class:'text-sm list-disc pl-5 max-h-80 overflow-auto'},d.slice(0,200).map(x=>h('li',{},x))):h('p',{class:'text-sm'},'O horário atual é igual a esta versão.'),[btn('Fechar',closeDlg)]),'btn-sm join-item'),
            btn('Repor',()=>{mutate(()=>{const by=new Map(v.cards.map(x=>[x[0],x]));for(const c of S.cards){const x=by.get(c.id);if(x){c.day=x[1];c.period=x[2];if(x[3])c.r=x[3];else delete c.r;c.locked=!!x[4];}else{c.day=null;c.period=null;delete c.r;c.locked=false;}}});toast('Versão «'+v.nome+'» reposta.','Anular',desfazer,'ok');},'btn-sm join-item',{disabled:busy}),
            btn('Apagar',()=>mutate(()=>{S.versoesH=S.versoesH.filter(x=>x!==v);},true),'btn-sm join-item text-error',{disabled:busy}))));})))):null));
    const lg=(S.log||[]).slice(-12).reverse();
    m.append(panel('Últimas alterações',lg.length?h('div',{class:'flex flex-wrap gap-2 text-xs',id:'log-list'},lg.map(x=>badge(new Date(x[0]).toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+' · '+((NAV.flatMap(g=>g.items).find(i=>i[0]===x[1])||[])[1]||x[1]),'mute'))):h('p',{class:'text-sm opacity-60'},'Ainda não há alterações registadas.')));
  });
  wrap('diagnostico',m=>{
    const un=S.cards.filter(c=>c.day==null&&!IX().l.get(c.lessonId).ign).slice(0,25);if(!un.length)return;
    m.append(panel('Porque é que estas aulas não cabem',tableWrap(h('table',{class:'table table-sm',id:'porque-tab'},h('thead',{},h('tr',{},['Aula','Tempos impedidos','Tempos com conflito','Tempos livres','Quem mais limita','O que fazer'].map(t=>h('th',{},t)))),h('tbody',{},un.map(c=>{const p=porque(c);
      return h('tr',{},h('td',{class:'font-medium'},lessonLabel(p.l)+(c.len>1?' ('+c.len+' TL)':'')),h('td',{class:'num'},String(p.off)),h('td',{class:'num'},String(p.occ)),h('td',{class:'num'},String(p.free)),h('td',{},p.w?KINDS[p.w.k][1]+' '+nm(p.w.k,p.w.id)+' ('+p.w.livre+' livres)':'—'),h('td',{class:'text-sm'},p.sug));})))),
      S.cards.filter(c=>c.day==null).length>25?h('p',{class:'text-xs opacity-60'},'Mostram-se as primeiras 25.'):null));
  });
  wrap('otimizacao',m=>{
    const sc=opt.scope||(opt.scope={k:'',id:''}),tl=S.cards.reduce((n,c)=>n+c.len,0),est=Math.max(10,Math.round(tl/40));
    m.append(panel('Âmbito e tempo',h('div',{class:'flex flex-wrap items-end gap-3'},field('Otimizar só',selEl('sc-k',sc.k,[['','Toda a escola'],['c','Uma turma'],['t','Um professor'],['d','Um dia']],v=>{sc.k=v;sc.id=v==='d'?'0':v?(list(v)[0]||{}).id||'':'';render();},'Âmbito')),
      sc.k?field(sc.k==='d'?'Dia':KINDS[sc.k][1],selEl('sc-id',sc.id,sc.k==='d'?S.days.map((d,i)=>[String(i),d]):optsOf(list(sc.k)),v=>{sc.id=v;},'Elemento','max-w-60')):null,
      h('span',{class:'text-sm opacity-70 grow'},sc.k?'As aulas fora do âmbito ficam onde estão; só as do âmbito são refeitas.':'Para '+tl+' TL, um tempo razoável é cerca de '+(est>=120?Math.round(est/60)+' minutos':est+' segundos')+'; a opção Exaustiva usa mais.')),
      S.bloq?note('warn','O horário está bloqueado em Ficheiro: a otimização não o altera.'):null));
  });
  wrap('ponderacoes',m=>{
    const ps=S.perfis||[];
    m.append(panel('Perfis de prioridades',h('div',{class:'flex flex-wrap items-end gap-2'},h('span',{class:'text-sm opacity-70 grow'},'Guarde conjuntos de prioridades com nome (por exemplo 1.º ciclo e secundário) e troque entre eles.'),
      ps.length?selEl('pf-sel','',[['','Aplicar um perfil…']].concat(ps.map(p=>[p.id,p.nome])),v=>{const p=ps.find(x=>x.id===v);if(p)mutate(()=>{S.w=Object.assign({},p.w);});},'Perfil'):null,
      btn('Guardar como perfil',()=>openDlg('Guardar perfil',field('Nome',h('input',{type:'text',id:'pf-nome',class:'input input-sm w-64',value:'Perfil '+(ps.length+1)})),[btn('Cancelar',closeDlg),btn('Guardar',()=>{const n=$('#pf-nome').value.trim()||'Perfil';closeDlg();mutate(()=>{S.perfis=(S.perfis||[]).filter(x=>x.nome!==n);S.perfis.push({id:uid(),nome:n,w:Object.assign({},W0,S.w||{})});});},'btn-primary')]),'btn-sm',{disabled:busy}),
      ps.length?btn('Apagar perfis',()=>mutate(()=>{S.perfis=[];}),'btn-sm btn-ghost text-error',{disabled:busy}):null)));
  });
  wrap('horarios',m=>{
    if(!ui.id||ui.visao!=='ind')return;const mine=cardsFor(ui.kind,ui.id).filter(c=>c.day!=null);
    m.append(h('div',{class:'flex flex-wrap items-center gap-2 noprint text-sm'},btn('Fixar todas as aulas deste horário',()=>mutate(()=>mine.forEach(c=>{c.locked=true;})),'btn-sm',{disabled:busy||!mine.length}),btn('Desafixar todas',()=>mutate(()=>mine.forEach(c=>{c.locked=false;})),'btn-sm btn-ghost',{disabled:busy||!mine.length}),
      h('span',{class:'opacity-60'},'Teclado, com uma aula selecionada: setas movem, F fixa, Delete retira, Esc termina.')));
  });
  wrap('impressao',m=>{
    const deps=uniq(S.classes.map(c=>c.dep).concat(S.teachers.map(t=>t.dep)));
    if(deps.length)m.append(panel('Filtro',h('div',{class:'flex flex-wrap items-end gap-3'},
      deps.length?field('Imprimir só o departamento',selEl('pr-dep',ui.prnDep||'',[['','Todos']].concat(deps.map(d=>[d,d])),v=>{ui.prnDep=v;render();},'Departamento')):null)));
  });
  wrap('alunos',m=>{
    if(ui.alTab!=='dist')return;const opcS=S.subjects.filter(s=>s.opc);if(!opcS.length)return;const ix=IX();
    m.append(panel('Procura por disciplina',tableWrap(h('table',{class:'table table-sm',id:'procura-tab'},h('thead',{},h('tr',{},['Disciplina','1.ª escolha','Outras escolhas','Suplente','Lista de espera','Cursos','Lugares'].map(t=>h('th',{},t)))),h('tbody',{},opcS.map(s=>{const cs=S.lessons.filter(l=>!l.ign&&l.linhas.some(ln=>ln.s===s.id)),lug=cs.every(l=>l.maxAl>0)?cs.reduce((n,l)=>n+l.maxAl,0):null,p1=S.alunos.filter(a=>(a.esc||[])[0]===s.id).length,po=S.alunos.filter(a=>(a.esc||[]).indexOf(s.id)>0).length;
      return h('tr',{},h('td',{class:'font-medium'},s.name),h('td',{class:'num'},String(p1)),h('td',{class:'num'},String(po)),h('td',{class:'num'},String(S.alunos.filter(a=>(a.sup||[]).includes(s.id)).length)),h('td',{},(()=>{const e=S.alunos.filter(a=>(a.espera||[]).includes(s.id));return e.length?h('span',{title:e.slice(0,30).map(a=>a.nome).join(', ')},badge(e.length+' em espera','warn')):'—';})()),h('td',{class:'num'},String(cs.length)),h('td',{},lug==null?'sem máximo':lug<p1?badge(lug+' (faltam '+(p1-lug)+')','bad'):String(lug)));}))))));
  });
  wrap('anual',m=>{
    if(ui.anTab==='per'||!S.inicio||!S.fim){m.append(h('div',{class:'noprint'},btn('Acrescentar feriados nacionais e dos Açores',feriadosPT,'btn-sm',{disabled:busy})));return;}
    const {wks,res}=anualCalc(),low=S.lessons.filter(l=>!l.ign&&l.anual>0&&((res.get(l.id)||{}).tot||0)!==l.anual);
    m.append(panel('Aulas fora do alvo anual',low.length?tableWrap(h('table',{class:'table table-sm',id:'alvo-tab'},h('thead',{},h('tr',{},['Aula','Previstas','Alvo','Diferença',''].map(t=>h('th',{},t)))),h('tbody',{},low.slice(0,60).map(l=>{const r=res.get(l.id)||{tot:0,w:new Array(wks.length).fill(0)},d=r.tot-l.anual;
      return h('tr',{},h('td',{class:'font-medium'},lessonLabel(l)),h('td',{class:'num'},String(r.tot)),h('td',{class:'num'},String(l.anual)),h('td',{},badge((d>0?'+':'')+d,d<0?'bad':'warn')),h('td',{},btn('Acertar nas últimas semanas',()=>planoAcertar(l,r,wks),'btn-sm',{disabled:busy})));})))):h('p',{class:'text-sm opacity-60'},'Todas as aulas com alvo anual definido estão certas. Defina o alvo na coluna «Alvo anual».'),
      h('div',{class:'noprint'},btn('Acrescentar feriados nacionais e dos Açores',feriadosPT,'btn-sm',{disabled:busy}))));
  });
  wrap('diario',m=>{if(ui.dTab==='folha')m.append(h('div',{class:'noprint'},btn('Registar ausência de vários dias',ausVarios,'btn-sm',{disabled:busy||!S.teachers.length})));});
  PAGES.ajuda=function(m){
    const passo=(n,t,d,href)=>h('li',{class:'flex gap-3 items-start'},h('span',{class:'badge badge-primary badge-lg fd'},String(n)),h('div',{},h('a',{href:'#'+href,class:'font-semibold link link-hover'},t),h('div',{class:'text-sm opacity-80'},d)));
    m.append(pageHead('Ajuda','Primeiros passos e onde está cada coisa.'));
    m.append(panel('Fazer um horário do princípio ao fim',h('ol',{class:'flex flex-col gap-3'},
      passo(1,'Dados da escola','Crie turmas, professores, salas e disciplinas, a grelha semanal e o calendário escolar. Ou importe os ficheiros GPU do Untis em Ficheiro.','dados'),
      passo(2,'Aulas','Diga que disciplinas tem cada turma, quantos tempos por semana, com que professor e em que sala. Marque os duplos e os blocos.','aulas'),
      passo(3,'Disponibilidades','Marque de Impedido a Ideal os tempos de cada turma, professor, sala e disciplina.','requisitos'),
      passo(4,'Prioridades','Escolha o que pesa mais: furos, repetições no dia, tardes livres, almoço, salas.','ponderacoes'),
      passo(5,'Otimização','Carregue em Otimizar. Use a série para comparar várias corridas e o âmbito para refazer só uma turma, um professor ou um dia.','otimizacao'),
      passo(6,'Diagnóstico','Veja o que ficou por colocar e porquê, os conflitos e as falhas de cada critério.','diagnostico'),
      passo(7,'Horários','Ajuste à mão: arraste aulas, fixe as que não devem mudar e peça trocas em cadeia.','horarios'),
      passo(8,'Impressão e ficheiro','Imprima com o seu formato, publique o site e os calendários, e exporte para o pleon.','impressao'))));
    m.append(panel('Durante o ano',h('ul',{class:'list-disc pl-5 text-sm flex flex-col gap-1'},h('li',{},'Gestão diária: ausências, substituições, eventos, alterações pontuais e a folha do dia.'),h('li',{},'Exames: marcação com vigilantes propostos.'),h('li',{},'Planificação anual: períodos com horários diferentes e contagem semana a semana.'),h('li',{},'Alunos e cursos: escolhas, distribuição automática e bandas de opções.'),
      h('li',{},'Ficheiro: cópia de segurança, versões do horário, modo só de leitura e bloqueio do horário aprovado.'))));
    m.append(panel('Segurança dos dados',h('p',{class:'text-sm'},'Os dados ficam guardados na sua conta EduSpruce (base de dados), não neste computador. Há uma cópia automática por dia, até dez, e pode descarregar uma cópia de segurança em Ficheiro antes de mudanças grandes.')));
  };
  document.addEventListener('keydown',e=>{
    if(ui.tab!=='horarios'||!ui.sel||busy)return;const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='SELECT'||tg==='TEXTAREA'||($('#dlg')&&$('#dlg').open))return;
    const c=S.cards.find(x=>x.id===ui.sel);if(!c)return;const id=c.id,again=()=>{ui.sel=id;render();};
    if(e.key==='Escape'){ui.sel=null;render();}
    else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();moveCard(id,null,null);}
    else if(e.key==='f'||e.key==='F'){if(c.day!=null){mutate(()=>{c.locked=!c.locked;});again();}}
    else if(c.day!=null&&String(e.key||'').startsWith('Arrow')){e.preventDefault();const d=c.day+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0),p=c.period+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0);if(d<0||d>=S.days.length||p<0||p+c.len>S.periods.length)return;moveCard(id,d,p);again();}
  });
})();

