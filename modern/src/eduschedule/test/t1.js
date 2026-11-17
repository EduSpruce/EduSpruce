const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../src/engine.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../src/samples.js'),'utf8');
const mod={exports:{}};new Function('module','exports',src)(mod,mod.exports);const E=mod.exports;
module.exports=E;
if(require.main===module){
  // 1) exemplo pequeno
  let st=E.normalize(E.sample());let m=E.createModel(st);m.load();
  let sv=m.solver({keep:false,ms:2000,seed:1});let pr;do{pr=sv.step(200);}while(!pr.done);
  console.log('exemplo',JSON.stringify(pr),JSON.stringify(sv.selfCheck()));
  const res=sv.result();const by=new Map(st.cards.map(c=>[c.id,c]));res.forEach(r=>{const c=by.get(r.id);c.day=r.day;c.period=r.period;if(r.r)c.r=r.r;else delete c.r;});
  console.log('verificador',E.verify(st).length,'erros');
  const m2=E.createModel(st);m2.load();console.log(JSON.stringify(m2.report()));
  // 2) consistência incremental com movimentos aleatórios
  st=E.normalize(E.sample());st.almoco={de:5,ate:6};st.subjects[2].seq='A';st.subjects[0].seq='A';st.subjects[3].seq='1';st.subjects[4].seq='1';st.rooms[2].ed='B';st.rooms[5].ed='A';
  st.teachers.forEach((t,i)=>{t.maxSeg=3;t.maxSpan=6;t.umTurno=i%3===0;t.diasLivres=i%4===0?1:0;});st.classes.forEach((c,i)=>{c.tardesLivres=2;c.minDay=4;c.dtDias=3;c.alunos=20+i;c.maxDisc=5;});st.teachers.forEach(t=>{t.furosMin=1;t.furosMax=2;t.minDay=2;});st.rooms.forEach((r,i)=>{r.cap=i%2?22:30;});st.almocoMax=3;st.subjects[1].opc=true;
  st.lessons[0].grp='G1';st.lessons[1].grp='G1';st.lessons[2].seqP='2';st.lessons[14].seqP='2';st.lessons[5].per='A';st.lessons[6].per='B';
  E.normalize(st);m=E.createModel(st);m.load();sv=m.solver({keep:false,ms:1500,seed:3});
  let bad=0;for(let k=0;k<40;k++){sv.step(40);const c=sv.selfCheck();if(!c.ok){bad++;console.log('INCOERENTE',JSON.stringify(c));}}
  do{pr=sv.step(200);}while(!pr.done);
  console.log('consistência: falhas',bad,JSON.stringify(sv.selfCheck()),JSON.stringify(pr));
}
