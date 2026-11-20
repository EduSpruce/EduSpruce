/* ---------- distribuição automática dos alunos pelos cursos e bandas ---------- */
const lOpc=l=>l.linhas.some(ln=>(IX().s.get(ln.s)||{}).opc);
function alDistribuir(){
  const ix=IX(),cursos=S.lessons.filter(l=>!l.ign&&lOpc(l)),bySub=new Map(),K=cicloK(S),res={n:0,ok:0,sup:0,falhou:[]};
  for(const l of cursos)for(const sid of uniq(l.linhas.map(ln=>ln.s)))if((ix.s.get(sid)||{}).opc){let a=bySub.get(sid);if(!a)bySub.set(sid,a=[]);a.push(l);}
  const slots=new Map(),slotsOf=l=>{let o=slots.get(l.id);if(!o){o=[];for(const c of ix.cl.get(l.id)||[])if(c.day!=null)for(let i=0;i<c.len;i++)o.push(c.day*100+c.period+i);slots.set(l.id,o);}return o;};
  const com=S.alunos.filter(a=>(a.esc||[]).length);if(!com.length){toast('Nenhum aluno tem escolhas registadas. Indique-as em cada aluno ou na lista importada.');return;}
  const nomeS=id=>sh('s',id),nomeC=id=>nm('c',id);
  mutate(()=>{
    const cid=new Set(cursos.map(l=>l.id)),cnt=new Map(cursos.map(l=>[l.id,0]));
    for(const a of S.alunos){if((a.esc||[]).length){a.extra=(a.extra||[]).filter(id=>!cid.has(id));a.fora=(a.fora||[]).filter(id=>!cid.has(id)).concat(cursos.filter(l=>l.classIds.includes(a.classId)).map(l=>l.id));}
      else for(const l of alAulas(a))if(cid.has(l.id))cnt.set(l.id,cnt.get(l.id)+1);}
    const nc=a=>a.esc.reduce((n,s)=>n+(bySub.get(s)||[]).length,0);com.sort((a,b)=>nc(a)-nc(b));
    for(const a of com){res.n++;const occ=new Map();for(const l of alAulas(a)){const mk=perMask(l.per,K);for(const s of slotsOf(l))occ.set(s,(occ.get(s)||0)|mk);}
      const want=a.nOpc>0?a.nOpc:a.esc.length,miss=[],esp=[];let got=0;
      for(const [sid,isSup] of a.esc.map(s=>[s,false]).concat((a.sup||[]).map(s=>[s,true]))){if(got>=want)break;
        const cs=(bySub.get(sid)||[]).filter(l=>!(l.maxAl>0&&cnt.get(l.id)>=l.maxAl)).filter(l=>{const mk=perMask(l.per,K);return !slotsOf(l).some(s=>(occ.get(s)||0)&mk);}).sort((x,y)=>(x.classIds.includes(a.classId)?0:1)-(y.classIds.includes(a.classId)?0:1)||cnt.get(x.id)-cnt.get(y.id));
        if(!cs.length){if(!isSup){miss.push(nomeS(sid));esp.push(sid);}continue;}
        const l=cs[0],mk=perMask(l.per,K);cnt.set(l.id,cnt.get(l.id)+1);if(l.classIds.includes(a.classId))a.fora=a.fora.filter(id=>id!==l.id);else a.extra.push(l.id);for(const s of slotsOf(l))occ.set(s,(occ.get(s)||0)|mk);got++;if(isSup)res.sup++;}
      a.espera=esp;
      if(got>=want)res.ok++;else res.falhou.push({nome:a.nome,turma:nomeC(a.classId),falta:want-got,disc:miss.join(', ')});}
  });
  ui.dist=res;render();toast('Distribuição feita: '+res.ok+' de '+res.n+' alunos com todas as opções.','Anular',desfazer,res.ok===res.n?'ok':null);
}
function bandas(){
  const cursos=S.lessons.filter(l=>!l.ign&&lOpc(l)),st=new Map(cursos.map(l=>[l.id,new Set()]));
  for(const a of S.alunos)for(const l of alAulas(a))if(st.has(l.id))st.get(l.id).add(a.id);
  const act=cursos.filter(l=>st.get(l.id).size).sort((a,b)=>st.get(b.id).size-st.get(a.id).size),bs=[];
  const conf=(x,y)=>{const A=st.get(x.id),B=st.get(y.id);for(const v of A)if(B.has(v))return true;return x.linhas.some(a=>a.t&&y.linhas.some(b=>b.t===a.t));};
  for(const l of act){let b=bs.find(b=>b[0].tl===l.tl&&(b[0].per||'')===(l.per||'')&&!b.some(x=>conf(x,l)));if(b)b.push(l);else bs.push([l]);}
  return {bs,st};
}
function bandaJuntar(b){
  mutate(()=>{const ids=new Set(b.map(l=>l.id)),cls=uniq(b.flatMap(l=>l.classIds)),nl={id:uid(),n:Math.max(0,...S.lessons.map(l=>l.n||0))+1,classIds:cls,linhas:b.flatMap(l=>l.linhas.map(ln=>Object.assign({},ln,{cls:(ln.cls&&ln.cls.length?ln.cls:l.classIds).slice()}))),tl:b[0].tl,duplos:b[0].duplos||0,blocos:b[0].blocos||'',per:b[0].per||'',seqT:'',seqP:'',grp:'',banda:true};
    nl.insc={};{let li=0;for(const l of b){const quem=S.alunos.filter(a=>alAulas(a).includes(l)).map(a=>a.id);for(let k=0;k<l.linhas.length;k++)nl.insc[li++]=quem;}}
    for(const a of S.alunos){const at=alAulas(a).some(l=>ids.has(l.id));a.extra=(a.extra||[]).filter(id=>!ids.has(id));a.fora=(a.fora||[]).filter(id=>!ids.has(id));if(cls.includes(a.classId)){if(!at)a.fora.push(nl.id);}else if(at)a.extra.push(nl.id);}
    S.lessons=S.lessons.filter(l=>!ids.has(l.id));S.lessons.push(nl);});
  toast('Banda junta numa aula simultânea com '+b.length+' cursos.','Anular',desfazer,'ok');
}
function distPanel(m){
  const {bs,st}=bandas(),d=ui.dist,com=S.alunos.filter(a=>(a.esc||[]).length).length;
  m.append(panel('Distribuição automática',h('div',{class:'flex flex-wrap items-center gap-3'},h('span',{class:'text-sm opacity-70 grow'},'Reparte os alunos com escolhas pelos cursos das disciplinas opcionais: respeita a ordem das escolhas, usa os suplentes quando um curso está cheio ou choca no horário, e equilibra o tamanho dos cursos paralelos. '+com+' alunos têm escolhas.'),
      h('button',{type:'button',id:'dist-go',class:'btn btn-primary btn-sm',disabled:busy||!com,onclick:alDistribuir},'Distribuir automaticamente')),
    d?h('div',{class:'flex flex-wrap gap-2'},badge(d.ok+' de '+d.n+' com todas as opções',d.ok===d.n?'ok':'warn'),badge(d.sup+' opções dadas por suplente','mute'),badge(d.falhou.length+' alunos com opções em falta',d.falhou.length?'bad':'ok')):null,
    d&&d.falhou.length?tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},['Aluno','Turma','Opções em falta','Escolhas sem lugar'].map(t=>h('th',{},t)))),h('tbody',{},d.falhou.slice(0,200).map(f=>h('tr',{},h('td',{class:'font-medium'},f.nome),h('td',{},f.turma),h('td',{class:'num'},String(f.falta)),h('td',{},f.disc||'—')))))):null));
  m.append(panel('Bandas de opções',h('span',{class:'text-sm opacity-70'},'Cursos sem alunos nem professores em comum podem decorrer ao mesmo tempo. Cada banda é um conjunto desses cursos, calculado a partir das inscrições. Juntar uma banda cria uma aula simultânea única, que o otimizador coloca no mesmo tempo.'),
    bs.length?tableWrap(h('table',{class:'table table-sm',id:'bandas-tab'},h('thead',{},h('tr',{},['Banda','Cursos','Alunos',''].map(t=>h('th',{},t)))),h('tbody',{},bs.map((b,i)=>{const ok=b.length>1&&b.every(l=>(l.duplos||0)===(b[0].duplos||0)&&(l.blocos||'')===(b[0].blocos||'')&&!l.fixa);
      return h('tr',{},h('td',{class:'font-medium'},'Banda '+(i+1)),h('td',{},b.map(l=>lessonLabel(l)+' ('+st.get(l.id).size+')').join(' · ')),h('td',{class:'num'},String(b.reduce((n,l)=>n+st.get(l.id).size,0))),h('td',{class:'noprint'},b.length>1?btn('Juntar numa aula simultânea',()=>bandaJuntar(b),'btn-sm',{disabled:busy||!ok,title:ok?'':'Os cursos têm blocos diferentes ou aulas fixas'}):badge('um só curso','mute')));})))):h('p',{class:'text-sm opacity-60'},'Ainda não há cursos de disciplinas opcionais com alunos inscritos.')));
}

