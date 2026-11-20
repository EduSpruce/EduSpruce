/* ===================== v1.026 · Dados de demonstração: tudo o que há na app, em 3 anos letivos =====================
   Além do ano atual (com todas as turmas, PROFIJ, escola profissional, jornal, reuniões…), cria os dois anos letivos anteriores com os
   mesmos alunos um ano mais novos (turmas do ano anterior), os três períodos completos com classificações e sumários, e ainda
   exemplos na Biblioteca, Contactos e Spruce Notes. Tudo inventado — nenhum dado real. */
function demoAnoAnterior(a0,k){const DIA=864e5,SH=364*k;
  const desl=iso=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-SH);return d.toISOString().slice(0,10)};
  let j=JSON.stringify(a0);
  /* ids novos (ano a ano não se misturam) */
  const ids=new Set();(function walk(o){if(Array.isArray(o))o.forEach(walk);else if(o&&typeof o==='object')Object.entries(o).forEach(([kk,v])=>{if((kk==='id'||kk==='cid')&&typeof v==='string'&&v.length>=8)ids.add(v);walk(v)})})(JSON.parse(j));
  [...ids].sort((x,y)=>y.length-x.length).forEach(id=>{if(id.startsWith('doc:'))return;j=j.split(id).join(uid()+Math.random().toString(36).slice(2,5))});
  j=j.replace(/\b(20\d\d)-(\d\d)-(\d\d)\b/g,m=>desl(m)).replace(/\b(20\d\d)\/(20\d\d)\b/g,(m,x,y)=>(+x-k)+'/'+(+y-k)).replace(/\b1[6-9]\d{11}\b/g,m=>String(+m-SH*DIA));
  /* turmas do ano anterior: os mesmos alunos, um ano mais novos */
  const REN=k===1?[['11.º B/C','10.º B/C'],['11.º B','10.º B'],['11.º C','10.º C'],['10.º A','9.º A'],['9.º B','8.º B'],['7.º A','6.º A'],['TT 2','TT 1']]:[['11.º B/C','9.º B/C'],['11.º B','9.º B'],['11.º C','9.º C'],['10.º A','8.º A'],['9.º B','7.º B'],['7.º A','5.º A']];
  REN.forEach(([x],q)=>{j=j.split(x).join('\u0001'+q+'\u0001')});REN.forEach(([,y],q)=>{j=j.split('\u0001'+q+'\u0001').join(y)});
  const b=JSON.parse(j);
  /* chaves com o nome normalizado da turma (horário: «7a|ing», n.º de projeto…) */
  const RN=REN.map(([o,n])=>[normTurma(o),normTurma(n)]);const rk=kk=>{const p=String(kk).split('|');const e=RN.find(([o])=>o===p[0]);return e?[e[1],...p.slice(1)].join('|'):kk};
  (function walk(o){if(Array.isArray(o))o.forEach(walk);else if(o&&typeof o==='object')Object.keys(o).forEach(kk=>{const v=o[kk];const n2=rk(kk);if(n2!==kk){o[n2]=v;delete o[kk]}walk(v)})})(b);
  b.id=uid();b.demo=true;b.passado=true;const y0=new Date().getMonth()>=8?new Date().getFullYear():new Date().getFullYear()-1;b.nome='Demonstração '+(y0-k)+'/'+(y0-k+1);
  const anoDe=n=>{const m=String(n).match(/^(\d+)\.º/);return m?+m[1]:null};
  b.turmas=(b.turmas||[]).filter(t=>!(k===2&&(t.oferta==='profij'||t.oferta==='profissional')));
  b.turmas.forEach(t=>{const n=anoDe(t.nome);if(n){t.anoEsc=n+'.º';t.ciclo=n<=4?'1c':n<=6?'2c':n<=9?'3c':'sec'}if(t.oferta==='profij'){t.anoEsc=(+String(t.anoEsc).replace(/\D/g,'')-k)+'.º'}if(t.nome==='TT 1'){t.anoForm='1.º';t.anoEsc='10.º'}
    (t.alunos||[]).forEach(x=>{delete x.movs;if(x.nasc)x.nasc=x.nasc})});
  b.dt=(b.dt||[]).map(()=>normTurma(k===1?'6.º A':'5.º A'));
  return b}
function demoCompletarAno(b){const rnd=(()=>{let x=20241109+b.turmas.length;return ()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648}})();
  const add=(iso,d)=>{const z=new Date(iso+'T12:00:00Z');z.setUTCDate(z.getUTCDate()+d);return z.toISOString().slice(0,10)};
  const per=(()=>{try{const pe=b.porEscola&&b.porEscola.principal;return (pe&&pe.calendario&&pe.calendario.periodos)||[]}catch(_){return []}})();
  b.turmas.forEach(t=>{if(Array.isArray(t.modulos)&&t.modulos.length&&t.oferta==='profissional')return;const AL=(t.alunos||[]).filter(x=>x.frequenta!==false);
    const base={};AL.forEach(x=>{let s=0,m=0;(t.instrumentos||[]).forEach(i=>{const n=i.notas&&i.notas[x.id];if(!n)return;i.itens.forEach(it=>{const v=parseFloat(n[it.id]);if(!isNaN(v)){s+=v;m+=+it.cot||0}})});base[x.id]=m?s/m:.45+rnd()*.45});
    const notas=(i,dif)=>{const N={};AL.forEach((x,q)=>{const o={};i.itens.forEach(it=>{const v=Math.max(0,Math.min(1,base[x.id]+(dif||0)+(rnd()-.5)*.22));o[it.id]=Math.round(v*(+it.cot||0)*2)/2});N[x.id]=o});return N};
    (t.instrumentos||[]).forEach(i=>{delete i.naoReal;if(!i.notas||!Object.keys(i.notas).length)i.notas=notas(i,0)});
    const P1=(t.instrumentos||[]).filter(i=>(i.periodo||1)===1&&!/diagn/i.test(i.tipo||''));
    [2,3].forEach(p=>{P1.forEach(i=>{const c=JSON.parse(JSON.stringify(i));c.id=uid()+p;const mp={};c.itens.forEach(it=>{const nid=uid()+Math.random().toString(36).slice(2,5);mp[it.id]=nid;it.id=nid});
      c.periodo=p;c.data=add(i.data||((per[0]||{}).ini)||'2025-10-15',91*(p-1));c.nome=String(i.nome).replace(/(\d+)\s*$/,(m,n)=>String(+n+2*(p-1)));if(c.nome===i.nome)c.nome=i.nome+' ('+p+'.º P)';delete c.anexos;delete c.modulo;
      c.notas=notas(c,(p===2?.02:.04));t.instrumentos.push(c)})});
    /* sumários e chamadas dos 2.º e 3.º períodos (as mesmas aulas da semana) */
    try{const SM=(b.sumarios||{})[t.id];if(SM){const fimP=p=>(per[p-1]||{}).fim||'9999';Object.entries({...SM}).forEach(([kk,s])=>{const m=kk.match(/^(\d{4}-\d{2}-\d{2})(.*)$/);if(!m)return;[2,3].forEach(p=>{const d=add(m[1],91*(p-1));if(d>fimP(p))return;if(!SM[d+m[2]])SM[d+m[2]]={...s,texto:s.texto||'Atividades de consolidação.'}})})}}catch(_){}});
  return b}
function demoExtras(a){try{const R=recursos();if(!R.length){const pr=profNome(S.cfg.professor)||'';const doc=t=>guardarDoc('data:text/plain;base64,'+btoa(unescape(encodeURIComponent(t))));
      const fic=(titulo,tipo,txt,et)=>({id:uid(),titulo,tipo,disciplina:'Inglês',anoEsc:'7.º',etiquetas:et,colecao:'Pessoal',acesso:'privado',anoLetivo:a.nome,autor:pr,criado:Date.now(),atual:Date.now(),versoes:[{v:1,doc:doc(txt),nome:titulo+'.txt',mime:'text/plain',tam:txt.length,q:Date.now(),nota:'Demonstração'}]});
      R.push(fic('Ficha — vocabulário da escola','ficha','Ficha de trabalho (demonstração)\n\n1. Liga as palavras às imagens.\n2. Completa as frases.','vocabulário|7.º ano'.split('|')),
        fic('Teste 1 — matriz','teste','Matriz do Teste 1 (demonstração)\n\nGrupo I — Compreensão (40 %)\nGrupo II — Gramática (30 %)\nGrupo III — Escrita (30 %)',['matriz','teste']),
        {...fic('Modelo — grelha de observação da oralidade','modelo','Grelha de observação (demonstração)\n\nFluência · Correção · Vocabulário · Interação',['oralidade']),colecao:'Modelos'},
        {id:uid(),titulo:'Aprendizagens Essenciais',tipo:'link',link:'https://www.dge.mec.pt/',disciplina:'Inglês',anoEsc:'',etiquetas:['currículo'],colecao:'Pessoal',acesso:'privado',anoLetivo:a.nome,autor:pr,criado:Date.now(),atual:Date.now(),versoes:[]})}}catch(e){console.warn('demo biblioteca',e)}
  try{const L=contL();if(!L.length){[['Helena Costa','Diretora','Direção'],['Rui Medeiros','Coordenador de Departamento','Línguas'],['Sónia Furtado','Professora de Português','Línguas'],['Paulo Rocha','Professor de Matemática','Ciências Exatas'],['Inês Tavares','Psicóloga','SPO'],['Marco Pacheco','Coordenador PROFIJ','Coordenação']].forEach(([n,c,g],q)=>{const e=normT(n).replace(/\s+/g,'.')+'@escola-exemplo.pt';L.push({id:uid()+q,nome:n,cargo:c,org:'Escola (demonstração)',grupo:g,ano:a.nome,morada:'',aniv:'',notas:'Contacto de demonstração',foto:'',tel:'29'+String(1000000+q*12345).slice(0,7),telR:'Escola',tels:[],email:e,emailR:'Institucional',emails:[],listas:[]})});L.sort((x,y)=>x.nome.localeCompare(y.nome,'pt'))}}catch(e){console.warn('demo contactos',e)}
  try{const ctx0=UI.mqCtx;UI.mqCtx='sn';try{MQ()}catch(_){}UI.mqCtx=ctx0;const q=(S.sn&&S.sn.quadros||[]).find(x=>x.id==='raiz');if(q&&!q.itens.length){const N=(t,x,y,o)=>q.itens.push({id:uid()+Math.random().toString(36).slice(2,4),t,x,y,w:{nota:220,tarefa:240,titulo:320}[t]||220,cor:'',pai:null,...o});
      N('titulo',40,30,{txt:'Planeamento do período (demonstração)'});N('nota',40,110,{txt:'Rever os critérios de avaliação com as turmas do 7.º ano.'});N('nota',290,110,{txt:'Ideia: projeto «A minha escola» com apresentação oral em grupo.',cor:'#fde68a'});
      N('tarefa',540,110,{tit:'Para esta semana',l:[{t:'Corrigir as fichas do 7.º A',f:true},{t:'Preparar o Teste 2',f:false},{t:'Atualizar sumários',f:false}]})}}catch(e){console.warn('demo spruce',e)}}
{const _cD3=criarDemo;criarDemo=function(){const n0=S.anos.length;const r=_cD3.apply(this,arguments);try{if(S.anos.length>n0){const a0=S.anos.find(x=>x.id===S.anoAtivo)||S.anos[S.anos.length-1];
      const b1=demoCompletarAno(demoAnoAnterior(a0,1)),b2=demoCompletarAno(demoAnoAnterior(a0,2));const i=S.anos.indexOf(a0);S.anos.splice(i,0,b2,b1);demoExtras(a0);saveNow();
      setTimeout(()=>toast('Demonstração criada: 3 anos letivos ('+b2.nome.replace('Demonstração ','')+', '+b1.nome.replace('Demonstração ','')+' e o atual) com exemplos de tudo','ok'),400)}}catch(e){console.warn('demo 3 anos',e)}return r}}

