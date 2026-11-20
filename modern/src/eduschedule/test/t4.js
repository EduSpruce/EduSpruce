// alunos com escolhas entre turmas: o motor não pode sobrepor aulas do mesmo aluno
const E=require('./t1.js');
const st=E.normalize(E.sample());
const lc=i=>st.lessons.filter(l=>l.classIds.length===1&&l.classIds[0]===st.classes[i].id);
st.alunos=[];let n=0;
for(let ci=0;ci<st.classes.length;ci++){const mine=lc(ci),other=lc((ci+1)%st.classes.length);
  for(let k=0;k<20;k++){const al={id:'a'+(n++),num:n,nome:'Aluno '+n,classId:st.classes[ci].id,fora:[],extra:[]};
    if(k<6){al.fora=[mine[k%3].id];al.extra=[other[(k%3)+3].id];}st.alunos.push(al);}}
E.normalize(st);let m=E.createModel(st);m.load();
const sv=m.solver({keep:false,ms:4000,seed:5});let pr,bad=0;for(let k=0;k<20;k++){sv.step(40);if(!sv.selfCheck().ok)bad++;}do{pr=sv.step(200);}while(!pr.done);
const by=new Map(st.cards.map(c=>[c.id,c]));sv.result().forEach(r=>{const c=by.get(r.id);c.day=r.day;c.period=r.period;if(r.r)c.r=r.r;else delete c.r;});
// verificador independente por aluno
let clash=0;const L=new Map(st.lessons.map(l=>[l.id,l]));
for(const al of st.alunos){const occ=new Map();
  for(const c of st.cards){if(c.day==null)continue;const l=L.get(c.lessonId);const att=(l.classIds.includes(al.classId)&&!al.fora.includes(l.id))||al.extra.includes(l.id);if(!att)continue;
    for(let i=0;i<c.len;i++){const k=c.day+'-'+(c.period+i),mk=E.MASK[l.per||'']||15;if((occ.get(k)||0)&mk)clash++;occ.set(k,(occ.get(k)||0)|mk);}}}
m=E.createModel(st);m.load();const rep=m.report();
console.log('grupos de alunos',m.stuG.length,'| por colocar',rep.unplaced,'| conflitos',rep.clash,'| choques de alunos (verificador)',clash,'| incoerências',bad,'| erros',E.verify(st).length);
