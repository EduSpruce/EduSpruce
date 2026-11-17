// modo «mexer o mínimo»: melhora o custo mexendo poucas aulas e mantém a coerência do custo incremental
const E=require('./t1.js');
const st=E.normalize(E.sample());let m=E.createModel(st);m.load();let sv=m.solver({keep:false,ms:200,seed:9,level:'quick'});let pr;for(let i=0;i<3;i++)pr=sv.step(30);sv.finish();
const by=new Map(st.cards.map(c=>[c.id,c]));const ap=s=>s.result().forEach(r=>{const c=by.get(r.id);c.day=r.day;c.period=r.period;if(r.r)c.r=r.r;else delete c.r;});ap(sv);
m=E.createModel(st);m.load();const c0=m.report().cost,before=new Map(st.cards.map(c=>[c.id,c.day+'-'+c.period]));
for(const stay of [8,4,2,.8]){const s2=JSON.parse(JSON.stringify(st)),m2=E.createModel(s2);m2.load();const v=m2.solver({min:true,stay,ms:1500,seed:3});let bad=0;for(let i=0;i<10;i++){v.step(40);if(!v.selfCheck().ok)bad++;}do{pr=v.step(200);}while(!pr.done);
  const b2=new Map(s2.cards.map(c=>[c.id,c]));v.result().forEach(r=>{const c=b2.get(r.id);c.day=r.day;c.period=r.period;if(r.r)c.r=r.r;else delete c.r;});const m3=E.createModel(s2);m3.load();const rp=m3.report();let mv=0;for(const c of s2.cards)if(before.get(c.id)!==c.day+'-'+c.period)mv++;
  console.log('mexer o mínimo (peso '+stay+'): custo',Math.round(c0),'->',Math.round(rp.cost),'| aulas mexidas',mv,'de',s2.cards.length,'| por colocar',rp.unplaced,'| conflitos',rp.clash,'| incoerências',bad,'| verificador',E.verify(s2).length);}
