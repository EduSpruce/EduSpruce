const E=require('./t1.js');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const nC=+arg('classes',100),nT=+arg('teachers',1000),tight=arg('tight','0')==='1',ms=+arg('ms',30000),seed=+arg('seed',7),level=arg('level','normal');
let t=Date.now();const {st,ref}=E.bigSample({classes:nC,teachers:tight?0:nT,tight,seed,avg:+arg('avg',17),cap:+arg('cap',20),roomU:+arg('roomU',.7),squeeze:+arg('squeeze',0)});
console.log('gerado em',Date.now()-t,'ms:',st.classes.length,'turmas,',st.teachers.length,'professores,',st.rooms.length,'salas,',st.lessons.length,'aulas,',st.cards.length,'cartões,',st.cards.reduce((a,c)=>a+c.len,0),'TL');
// referência: solução escondida
const stRef=JSON.parse(JSON.stringify(st));E.applyRef(stRef,ref);
let mr=E.createModel(stRef);mr.load();const rr=mr.report();
console.log('referência (solução escondida): erros do verificador',E.verify(stRef).length,'| por colocar',rr.unplaced,'conflitos',rr.clash,'furos turmas',rr.gapsC,'furos profs',rr.gapsT,'repetições',rr.dup,'custo',Math.round(rr.cost));
// resolver
t=Date.now();const m=E.createModel(st);m.load();console.log('modelo compilado em',Date.now()-t,'ms');
const sv=m.solver({keep:false,ms,seed:1,level});let pr,last=0;
do{pr=sv.step(250);if(pr.elapsed-last>=(pr.elapsed<4000?500:Math.max(2000,ms/8))||pr.done){last=pr.elapsed;console.log((pr.elapsed/1000).toFixed(1)+'s fase',pr.phase,'colocados',pr.placed+'/'+pr.total,'custo',Math.round(pr.cost),'mov',pr.iters,'ejeções',pr.eject,'T',pr.T.toFixed(3));}}while(!pr.done);
console.log('auto-verificação',JSON.stringify(sv.selfCheck().ok),'| movimentos/s',Math.round(pr.iters/(pr.elapsed/1000)));
const by=new Map(st.cards.map(c=>[c.id,c]));sv.result().forEach(r=>{const c=by.get(r.id);c.day=r.day;c.period=r.period;if(r.r)c.r=r.r;else delete c.r;});
const errs=E.verify(st);console.log('verificador independente:',errs.length,'erros',errs.slice(0,3).join(' | '));
const m2=E.createModel(st);m2.load();const r=m2.report();
console.log('RESULTADO por colocar',r.unplaced,'| conflitos',r.clash,'| bloqueadas',r.blocked,'| furos turmas',r.gapsC,'| furos profs',r.gapsT,'| repetições',r.dup,'| marginais',r.marg,'| dias seguidos',r.consec,'| sala alternativa',r.altRoom,'| excesso/dia',r.over,'| custo',Math.round(r.cost));
