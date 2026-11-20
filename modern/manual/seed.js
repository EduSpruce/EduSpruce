(()=>{const out=[];
try{const d=arD();d.conj.unshift(arExemplo());out.push('arena ok')}catch(e){out.push('arena '+e)}
try{const d=puD();d.quiz.unshift(puExemplo());out.push('pulso ok')}catch(e){out.push('pulso '+e)}
try{const txt=`1. Choose the correct form: She ___ to school every day.
a) go
*b) goes
c) going
d) gone

2. True or false?
V: London is the capital of the United Kingdom.
F: "Children" is a singular noun.
V: The past simple of "buy" is "bought".

3. Complete: Yesterday I [went] to the cinema and [saw] a great film.

4. Write a short paragraph (60–80 words) about your favourite hobby.

5. Which words are adjectives?
*a) beautiful
b) quickly
*c) tall
d) run`;
 const ex=pvParseTexto(txt);const P=PV();ex.forEach(e=>{e.pts=e.tipo==='texto'?4:2;P.ex.push(pvClone(e))});
 const o=pvExNovo('ordem');o.html='Put the sentences in the right order.';['I woke up.','I had breakfast.','I went to school.','I came home.'].forEach((t,i)=>o.ops[i].t=t);P.ex.push(o);
 const l=pvExNovo('ligar');l.html='Match each word to its meaning.';[['huge','very big'],['tiny','very small'],['ancient','very old']].forEach((p,i)=>{l.pares[i].a=p[0];l.pares[i].b=p[1]});P.ex.push(l);
 const tb=pvExNovo('tabela');tb.html='Classify the words.';tb.cols=['Noun','Verb'];tb.lins=['table','write'];P.ex.push(tb);
 const a=pvAvNova('Teste de Inglês — Unidade 2');a.desc='Present simple, past simple e vocabulário.';P.ex.slice(0,8).forEach(e=>a.itens.push(pvParaItem(e)));
 const b=pvAvNova('Ficha formativa — Vocabulário');P.ex.slice(5,8).forEach(e=>b.itens.push(pvParaItem(e)));
 try{const r=pvRubNova();if(r&&!P.rub.includes(r)){P.rub.push(r)}}catch(e){}
 out.push('provas ok '+P.ex.length+' '+P.av.length)}catch(e){out.push('provas '+e)}
try{const f=fmNovo(false);f.titulo='Inquérito — Interesses dos alunos';f.desc='Questionário de início de ano.';f.itens=[Object.assign(fmQ('escolha'),{titulo:'Qual é a tua disciplina preferida?',ops:[{id:uid(),t:'Inglês'},{id:uid()+'b',t:'Matemática'},{id:uid()+'c',t:'Ciências'}]}),Object.assign(fmQ('classif'),{titulo:'Quanto gostas de ler?'}),Object.assign(fmQ('likert'),{titulo:'Concordas com as afirmações?'}),Object.assign(fmQ('texto'),{titulo:'O que gostarias de aprender este ano?',longo:true})];
 const q=fmNovo(true);q.titulo='Mini-teste — Past simple';q.itens=[Object.assign(fmQ('escolha'),{titulo:'The past simple of "go" is…',pts:2,ops:[{id:'o1',t:'goed'},{id:'o2',t:'went',certa:true},{id:'o3',t:'gone'}]}),Object.assign(fmQ('texto'),{titulo:'Write the past simple of "eat".',pts:2,resp:['ate']}),Object.assign(fmQ('ordem'),{titulo:'Order the days of the week.',pts:1})];out.push('forms ok '+FMS().length)}catch(e){out.push('forms '+e)}
try{const d=puD();if(!d.salas.length)d.salas.push({id:'sala7a',nome:'7.º A · Inglês',turma:'mwallw5c8pkji',codigo:'482913',lista:false,mao:true,criado:Date.now()});out.push('sala ok')}catch(e){out.push('sala '+e)}
save();return out.join(' | ')})()
