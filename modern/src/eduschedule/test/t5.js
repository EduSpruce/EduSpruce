// ciclo de 3 semanas, grelhas alternativas em tempo real, trocas em cadeia
const E=require('./t1.js');
const run=(st,ms,seed)=>{E.normalize(st);const m=E.createModel(st);m.load();const sv=m.solver({keep:false,ms,seed});let pr,bad=0;for(let k=0;k<15;k++){sv.step(40);if(!sv.selfCheck().ok)bad++;}do{pr=sv.step(200);}while(!pr.done);
  const by=new Map(st.cards.map(c=>[c.id,c]));sv.result().forEach(r=>{const c=by.get(r.id);c.day=r.day;c.period=r.period;if(r.r)c.r=r.r;else delete c.r;});const m2=E.createModel(st);m2.load();return {m:m2,rep:m2.report(),bad};};
// 1) ciclo de 3 semanas: três aulas W1, W2, W3 da mesma turma podem partilhar o tempo
let st=E.normalize(E.sample());st.ciclo=3;const ls=st.lessons.filter(l=>l.classIds[0]===st.classes[0].id);ls[0].per='W1';ls[1].per='W2';ls[2].per='W3';ls[3].per='W12/S1';
let r=run(st,2500,2);console.log('ciclo 3: por colocar',r.rep.unplaced,'| conflitos',r.rep.clash,'| incoerências',r.bad,'| verificador',E.verify(st).length,'| máscaras',E.perMask('W1',3),E.perMask('W12/S1',3),E.perMask('A',2),E.perMask('S1',2));
// 2) grelha alternativa desfasada 25 minutos para metade das turmas
st=E.normalize(E.sample());const sh=(t,d)=>{const [h,m]=t.split(':').map(Number),x=h*60+m+d;return String((x/60)|0).padStart(2,'0')+':'+String(x%60).padStart(2,'0');};
st.grelhas=[{id:'g1',nome:'Desfasada',periods:st.periods.map(p=>({start:sh(p.start,25),end:sh(p.end,25)}))}];st.classes.forEach((c,i)=>{if(i%2)c.grelha='g1';});
r=run(st,5000,4);
// verificador independente em minutos
const hm=x=>{const [h,m]=x.split(':').map(Number);return h*60+m;},L=new Map(st.lessons.map(l=>[l.id,l])),C=new Map(st.classes.map(c=>[c.id,c])),iv=[];
for(const c of st.cards){if(c.day==null)continue;const l=L.get(c.lessonId),g=l.classIds.length&&C.get(l.classIds[0]).grelha?st.grelhas[0].periods:st.periods;const a=hm(g[c.period].start),b=hm(g[c.period+c.len-1].end);
  const res=new Set(l.classIds.map(x=>'c'+x));l.linhas.forEach((ln,i)=>{if(ln.t)res.add('t'+ln.t);const rm=(c.r&&c.r[i])||E.lineRoom(st,l,ln);if(rm&&rm!=='-')res.add('r'+rm);});iv.push({d:c.day,a,b,res,mk:E.perMask(l.per,2),id:c.id});}
let ov=0;for(let i=0;i<iv.length;i++)for(let j=i+1;j<iv.length;j++){const x=iv[i],y=iv[j];if(x.d===y.d&&x.a<y.b&&y.a<x.b&&(x.mk&y.mk))for(const k of x.res)if(y.res.has(k)){ov++;break;}}
console.log('grelhas: multi',r.m.multi,'| por colocar',r.rep.unplaced,'| conflitos',r.rep.clash,'| sobreposições em minutos (verificador)',ov,'| incoerências',r.bad);
// 3) trocas em cadeia
st=E.normalize(E.sample());r=run(st,2000,7);let n=0,okc=0;
for(let a=0;a<r.m.N&&n<6;a+=9){const ch=r.m.chains(a,5);if(!ch.length)continue;n++;const cp=JSON.parse(JSON.stringify(st)),by=new Map(cp.cards.map(c=>[c.id,c]));for(const mv of ch[0].moves){const c=by.get(mv.id);c.day=mv.day;c.period=mv.period;c.r=mv.r;}
  const m3=E.createModel(cp);m3.load();const rp=m3.report();if(!rp.clash&&!rp.unplaced&&!E.verify(cp).length)okc++;}
const m4=E.createModel(st);m4.load();const before=m4.report().cost;m4.chains(3,5);console.log('cadeias: propostas testadas',n,'| válidas',okc,'| modelo reposto',m4.report().cost===before);
