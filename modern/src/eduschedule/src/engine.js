/* ===== Planeador de Horários: motor de dados e de otimização (sem DOM) ===== */
'use strict';
const uid=()=>Math.random().toString(36).slice(2,9);
const byId=(arr,id)=>{for(let i=0;i<arr.length;i++)if(arr[i].id===id)return arr[i];return undefined;};
/* ponderações: 0 (sem importância) a 5 (muitíssimo importante) */
const W0={furosT:5,furosP:2,repDia:4,maxDia:3,tardes:3,almoco:3,maxSeg:3,turno:3,span:2,diasLivres:2,desloc:3,marg:3,seq:3,seguidos:2,equil:1,req:3,cedo:2,sala:2,isol:2,bloco:2,furosR:3,livres2:2,dt:2,cap:2,almMax:2};
const WF=[0,1,2,4,8,20];
const MASK={'':15,A:10,B:5,S1:12,S2:3};
/* periodicidade: ciclo de K semanas (2 a 4) vezes dois semestres. Códigos: A, B, W13 (semanas 1 e 3 do ciclo), S1, S2 e combinações W2/S1 */
const PER_RE=/^((A|B|W[1-4]+)(\/S[12])?|S[12])?$/;
function perParts(per,K){per=per||'';const out={w:null,s:null};for(const x of per.split('/')){if(x==='A')out.w=[0];else if(x==='B')out.w=[1];else if(x[0]==='W')out.w=[...new Set(x.slice(1).split('').map(d=>+d-1).filter(d=>d>=0&&d<K))];else if(x==='S1')out.s=0;else if(x==='S2')out.s=1;}if(out.w&&(!out.w.length||out.w.length>=K))out.w=null;return out;}
function perMask(per,K){K=K||2;const full=(1<<(2*K))-1;if(!per)return full;const pp=perParts(per,K);let m=0;for(let sem=0;sem<2;sem++){if(pp.s!=null&&pp.s!==sem)continue;for(let w=0;w<K;w++){if(pp.w&&!pp.w.includes(w))continue;m|=1<<((sem===0?K:0)+(K-1-w));}}return m||full;}
function perBit(w,sem,K){return (sem===0?K:0)+(K-1-w);}
function perFrac(per,K){K=K||2;if(!per)return 1;let m=perMask(per,K),n=0;while(m){n+=m&1;m>>=1;}return n/(2*K);}
function perLabel(per,K){if(!per)return '';const pp=perParts(per,K||2),a=[];if(pp.w)a.push((K||2)===2?(pp.w[0]===0?'Sem. A':'Sem. B'):'Sem. '+pp.w.map(x=>x+1).join('+')+' de '+K);if(pp.s!=null)a.push((pp.s+1)+'.º sem.');return a.join(' · ');}
const cicloK=st=>Math.max(2,Math.min(4,(st&&st.ciclo)|0||2));
const UNPL=1000,HARDW=5000;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function seqCode(v){v=String(v==null?'':v).trim().toUpperCase();if(/^[1-9]$/.test(v))return +v;if(/^[A-F]$/.test(v))return 10+v.charCodeAt(0)-64;return 0;}
function lineRoom(st,l,ln){
  if(ln.r)return ln.r;const s=byId(st.subjects,ln.s);if(s&&s.roomId)return s.roomId;
  if(l.classIds.length){const c=byId(st.classes,l.classIds[0]);if(c&&c.roomId)return c.roomId;}return '';
}
function wantLens(l,P){
  const out=[];let left=l.tl;
  String(l.blocos||'').split(/[,; ]+/).map(Number).filter(n=>n>=2&&n<=P).forEach(n=>{if(n<=left){out.push(n);left-=n;}});
  for(let i=0;i<(l.duplos|0)&&left>=2&&P>=2;i++){out.push(2);left-=2;}
  while(left-->0)out.push(1);return out;
}
const mins=t=>{const m=/^(\d{1,2}):(\d{2})$/.exec(t||'');return m?(+m[1])*60+(+m[2]):-1;};
/* índice do primeiro tempo da tarde (P = não há tarde) */
function tardeIdx(st){
  const P=st.periods.length;if(st.tarde>0)return Math.min(P,st.tarde-1);
  let any=false;for(let i=0;i<P;i++){const m=mins(st.periods[i].start);if(m>=0){any=true;if(m>=13*60)return i;}}
  if(any)return P;
  let best=-1,bd=1e9;for(let i=0;i<P-1;i++)if(st.periods[i].breakAfter){const d=Math.abs(i+1-P/2);if(d<bd){bd=d;best=i+1;}}
  return best>0?best:Math.ceil(P/2);
}
function normalize(st){
  st=st&&typeof st==='object'?st:{};
  st.v=3;st.name=st.name||'A minha escola';st.ano=st.ano||'2026/2027';st.tlMin=+st.tlMin||50;st.alvo=+st.alvo||1100;
  st.days=Array.isArray(st.days)&&st.days.length?st.days.slice(0,6):['Seg','Ter','Qua','Qui','Sex'];
  st.periods=Array.isArray(st.periods)&&st.periods.length?st.periods.slice(0,16):[{label:'1',start:'08:30',end:'09:20',breakAfter:false}];
  for(const k of ['classes','teachers','rooms','subjects','lessons','cards','ferias','reunioes','locais','exports','exames','alunos','horarios','grelhas','eventos','pontuais','formatos'])if(!Array.isArray(st[k]))st[k]=[];
  for(const k of ['off','cover','vig','print'])if(!st[k]||typeof st[k]!=='object'||Array.isArray(st[k]))st[k]={};
  st.w=Object.assign({},W0,st.w||{});st.tarde=st.tarde|0;
  st.almoco=st.almoco&&typeof st.almoco==='object'?st.almoco:{de:0,ate:0};
  for(const k in st.off)for(const s in st.off[k])if(st.off[k][s]===1)st.off[k][s]=-3;
  const ids=a=>{const s=new Set();for(const x of a)s.add(x.id);return s;};
  const cs=ids(st.classes),ts=ids(st.teachers),rs=ids(st.rooms),ss=ids(st.subjects);
  st.reunioes.forEach(r=>{r.teacherIds=(r.teacherIds||[]).filter(i=>ts.has(i));r.len=Math.max(1,r.len|0);});
  for(const l of st.lessons){
    if(!l.linhas){const tt=(l.teacherIds&&l.teacherIds.length)?l.teacherIds:[''];l.linhas=tt.map(t=>({s:l.subjectId,t,r:l.roomId||'',tip:''}));l.tl=l.count;l.duplos=l.doubles;}
    if(!PER_RE.test(l.per||''))l.per='';
    l.classIds=(l.classIds||[]).filter(i=>cs.has(i));
    l.linhas=l.linhas.filter(ln=>ss.has(ln.s));
    for(const ln of l.linhas){if(!ts.has(ln.t))ln.t='';if(!rs.has(ln.r))ln.r='';ln.tip=ln.tip||'';}
  }
  st.lessons=st.lessons.filter(l=>l.linhas.length&&(l.classIds.length||l.linhas.some(ln=>ln.t)));
  syncCards(st);return st;
}
/* mantém st.cards coerente com as aulas: um cartão por bloco, duplo ou tempo simples */
function syncCards(st){
  const P=st.periods.length,Dn=st.days.length,L=new Map();let mx=0;
  for(const l of st.lessons){L.set(l.id,l);if((l.n|0)>mx)mx=l.n|0;}
  for(const l of st.lessons)if(!l.n)l.n=++mx;
  const by=new Map();
  for(const c of st.cards){const l=L.get(c.lessonId);if(!l||l.ign)continue;let a=by.get(c.lessonId);if(!a)by.set(c.lessonId,a=[]);a.push(c);}
  const out=[],rank=c=>c.day==null?0:c.locked?2:1;
  for(const l of st.lessons){
    l.tl=Math.max(1,Math.min(40,l.tl|0));l.duplos=Math.max(0,Math.min(Math.floor(l.tl/2),l.duplos|0));
    if(l.ign)continue;
    const mine=by.get(l.id)||[],pool=new Map(),nl=l.linhas.length;
    for(const c of mine){let a=pool.get(c.len);if(!a)pool.set(c.len,a=[]);a.push(c);}
    for(const a of pool.values())a.sort((x,y)=>rank(y)-rank(x));
    for(const len of wantLens(l,P)){
      const a=pool.get(len),c=a&&a.length?a.shift():{id:uid(),lessonId:l.id,len,day:null,period:null,locked:false};
      if(c.day!=null&&(c.day<0||c.day>=Dn||c.period<0||c.period+c.len>P)){c.day=null;c.period=null;c.locked=false;}
      if(c.day==null){c.period=null;delete c.r;delete c.rx;}else if(c.r&&c.r.length!==nl)delete c.r;
      out.push(c);
    }
  }
  st.cards=out;
}
const LUTS=new Map();
function luts(P){
  let L=LUTS.get(P);if(L)return L;const n=1<<P,pop=new Uint8Array(n),lo=new Uint8Array(n),hi=new Uint8Array(n),gap=new Uint8Array(n),run=new Uint8Array(n);
  for(let m=1;m<n;m++){let c=0,f=-1,l=-1,r=0,b=0;for(let p=0;p<P;p++){if(m>>p&1){c++;if(f<0)f=p;l=p;r++;if(r>b)b=r;}else r=0;}pop[m]=c;lo[m]=f;hi[m]=l;gap[m]=l-f+1-c;run[m]=b;}
  L={pop,lo,hi,gap,run};LUTS.set(P,L);return L;
}

/* ============================================================
   Modelo compilado: ocupação por recurso e tempo, custo incremental
   ============================================================ */
function createModel(st){
  const D=st.days.length,P=st.periods.length,NS=D*P;
  const NC=st.classes.length,NT=st.teachers.length,NR=st.rooms.length,T0=NC,R0=NC+NT,G0=NC+NT+NR,NSU=st.subjects.length;
  /* grupos de alunos: alunos da mesma turma com as mesmas escolhas partilham um recurso */
  const stuG=[],stuIx=new Map(),lesStu=new Map(),nReg=new Map(),dFora=new Map(),dExtra=new Map();
  {const lset=new Map();(st.lessons||[]).forEach(l=>lset.set(l.id,l));
   for(const al of st.alunos||[]){
     nReg.set(al.classId,(nReg.get(al.classId)||0)+1);
     const fora=(al.fora||[]).filter(id=>lset.has(id)&&lset.get(id).classIds.includes(al.classId)).sort(),extra=(al.extra||[]).filter(id=>lset.has(id)&&!lset.get(id).classIds.includes(al.classId)).sort();
     for(const id of fora)dFora.set(id,(dFora.get(id)||0)+1);for(const id of extra)dExtra.set(id,(dExtra.get(id)||0)+1);
     if(!extra.length)continue;
     const key=al.classId+'|'+fora.join(',')+'|'+extra.join(',');let g=stuIx.get(key);
     if(g===undefined){g=stuG.length;stuIx.set(key,g);stuG.push({classId:al.classId,fora,extra,alunos:[]});}
     stuG[g].alunos.push(al.id);}
   stuG.forEach((g,gi)=>{const fs=new Set(g.fora);for(const l of st.lessons){if(l.ign)continue;if((l.classIds.includes(g.classId)&&!fs.has(l.id))||g.extra.includes(l.id)){let a=lesStu.get(l.id);if(!a)lesStu.set(l.id,a=[]);a.push(G0+gi);}}});}
  const NGS=stuG.length,NRES=G0+NGS;
  const cIx=new Map(),tIx=new Map(),rIx=new Map(),sIx=new Map();
  st.classes.forEach((x,i)=>cIx.set(x.id,i));st.teachers.forEach((x,i)=>tIx.set(x.id,T0+i));st.rooms.forEach((x,i)=>rIx.set(x.id,R0+i));st.subjects.forEach((x,i)=>sIx.set(x.id,i));
  const {pop,lo,hi,gap,run}=luts(P);
  const KC=cicloK(st),NB=2*KC;
  /* grelhas de tempos alternativas: a ocupação passa a ser medida em átomos de tempo real */
  const hm=x=>{const m=/^(\d{1,2}):(\d{2})$/.exec(x||'');return m?+m[1]*60+ +m[2]:-1;};
  const gPer=[st.periods],gIdx=new Map();(st.grelhas||[]).forEach(g=>{if(g&&g.periods&&g.periods.length===P){gIdx.set(g.id,gPer.length);gPer.push(g.periods);}});
  const cGrid=new Int32Array(NC+1);let multi=false;st.classes.forEach((c,i)=>{if(c.grelha&&gIdx.has(c.grelha)){cGrid[i]=gIdx.get(c.grelha);multi=true;}});
  let NA=P,aLo=null,aHi=null;
  if(multi){const tm=gPer.map(ps=>ps.map(p=>[hm(p.start),hm(p.end)]));
    if(tm.some(ps=>ps.some(x=>x[0]<0||x[1]<=x[0])))multi=false;
    else{const bs=[...new Set(tm.flat().flat())].sort((a,b)=>a-b),at=[];for(let i=0;i+1<bs.length;i++)if(tm.some(ps=>ps.some(x=>x[0]<=bs[i]&&x[1]>=bs[i+1])))at.push(bs[i]);
      NA=at.length;aLo=new Int32Array(gPer.length*P);aHi=new Int32Array(gPer.length*P);
      tm.forEach((ps,g)=>ps.forEach((x,p2)=>{let a0=-1,a1=-1;for(let i=0;i<NA;i++)if(at[i]>=x[0]&&at[i]<x[1]){if(a0<0)a0=i;a1=i;}aLo[g*P+p2]=a0;aHi[g*P+p2]=a1;}));}}
  const w=Object.assign({},W0,st.w||{}),K=k=>WF[Math.max(0,Math.min(5,w[k]|0))];
  const kGapC=K('furosT')*3,kGapT=K('furosP'),kDup=K('repDia')*8,kDay=K('maxDia')*6,kMarg=K('marg')*5,kConsec=K('seguidos')*3,kEq=K('equil'),kReq=K('req')*2,kLate=K('cedo')*.3,
    kSeq=K('seq')*6,kDes=K('desloc')*8,kLunch=K('almoco')*10,kRun=K('maxSeg')*5,kShift=K('turno')*8,kSpan=K('span')*4,kFreeD=K('diasLivres')*15,kFreeA=K('tardes')*15,kRoom=K('sala')*2,kGrp=Math.max(K('seq'),4)*25,kIso=K('isol')*4,kBloco=K('bloco')*6,kFR=K('furosR')*4,kL2=K('livres2')*3,kDT=K('dt')*10,kCap=K('cap')*6,kAM=K('almMax')*8;
  /* tempo */
  const brk=new Uint8Array(P),longBrk=new Uint8Array(P);
  st.periods.forEach((p,i)=>{brk[i]=p.breakAfter?1:0;if(i+1<P){const e=mins(p.end),s=mins(st.periods[i+1].start);if(e>=0&&s>=0&&s-e>=25)longBrk[i]=1;}});
  const tarde=tardeIdx(st),FULL=(1<<P)-1,mornM=tarde>=P?FULL:((1<<tarde)-1),aftM=FULL&~mornM;
  const al=st.almoco||{};let lunchM=0;if(al.de>0)for(let q=al.de-1;q<Math.min(P,Math.max(al.ate|0,al.de));q++)lunchM|=1<<q;
  /* requisitos de tempo */
  const lev=new Int8Array(Math.max(1,NRES)*NS),levS=new Int8Array(Math.max(1,NSU)*NS);
  for(const key in st.off){
    const kind=key[0],id=key.slice(2);let base=-1,arr=lev;
    if(kind==='c'&&cIx.has(id))base=cIx.get(id)*NS;else if(kind==='t'&&tIx.has(id))base=tIx.get(id)*NS;else if(kind==='r'&&rIx.has(id))base=rIx.get(id)*NS;else if(kind==='s'&&sIx.has(id)){base=sIx.get(id)*NS;arr=levS;}
    if(base<0)continue;const o=st.off[key];
    for(const sl in o){const i=sl.indexOf('-'),d=+sl.slice(0,i),p=+sl.slice(i+1);if(d>=0&&d<D&&p>=0&&p<P)arr[base+d*P+p]=o[sl];}
  }
  /* tempos impedidos (-3) por recurso e dia: não contam como furos */
  const blk=new Int32Array(Math.max(1,NRES)*D);for(let r=0;r<NRES;r++)for(let d=0;d<D;d++){let b=0;for(let p=0;p<P;p++)if(lev[r*NS+d*P+p]===-3)b|=1<<p;blk[r*D+d]=b;}
  /* parâmetros por recurso */
  const maxDay=new Int16Array(NRES+1),minDay=new Int16Array(NRES+1),maxSeg=new Int16Array(NRES+1),maxSpan=new Int16Array(NRES+1),oneShift=new Uint8Array(NRES+1),wantFree=new Int16Array(NRES+1),maxDisc=new Int16Array(NRES+1),fMin=new Int16Array(NRES+1),fMax=new Int16Array(NRES+1),wkOn=new Uint8Array(NRES+1),dtN=new Int16Array(NRES+1),dtRes=new Int32Array(NRES+1).fill(-1),alunos=new Int32Array(NRES+1),rCap=new Int32Array(NR+1);
  st.classes.forEach((c,i)=>{maxDay[i]=c.maxDay|0;minDay[i]=c.minDay|0;wantFree[i]=c.tardesLivres|0;maxDisc[i]=c.maxDisc|0;alunos[i]=c.alunos|0;if((c.dtDias|0)>0&&c.dt&&tIx.has(c.dt)){dtN[i]=c.dtDias|0;dtRes[i]=tIx.get(c.dt);}wkOn[i]=(wantFree[i]||dtN[i])?1:0;});
  st.teachers.forEach((t,i)=>{const r=T0+i;maxDay[r]=t.maxDay|0;minDay[r]=t.minDay|0;maxSeg[r]=t.maxSeg|0;maxSpan[r]=t.maxSpan|0;oneShift[r]=t.umTurno?1:0;wantFree[r]=t.diasLivres|0;fMin[r]=t.furosMin|0;fMax[r]=t.furosMax|0;wkOn[r]=(wantFree[r]||fMin[r]||fMax[r])?1:0;});
  st.rooms.forEach((r,i)=>{rCap[i]=r.cap|0;});
  const amMax=(st.almocoMax|0)>0&&lunchM?(st.almocoMax|0):0;
  const bld=new Int16Array(NR+1);let hasBld=false;{const bm=new Map();st.rooms.forEach((r,i)=>{const e=String(r.ed||'').trim();if(e){if(!bm.has(e))bm.set(e,bm.size+1);bld[i]=bm.get(e);hasBld=true;}});}
  const chains=new Array(NR),EMPTY=new Int32Array(0);
  const chainOf=k=>{let c=chains[k];if(c)return c;const out=[R0+k];let x=st.rooms[k];while(x&&x.alt&&rIx.has(x.alt)&&out.length<32){const r=rIx.get(x.alt);if(out.includes(r))break;out.push(r);x=st.rooms[r-R0];}return chains[k]=Int32Array.from(out);};
  /* aulas */
  const NL=st.lessons.length,lIx=new Map();st.lessons.forEach((l,i)=>lIx.set(l.id,i));
  const lSubj=new Int32Array(NL+1),lMarg=new Uint8Array(NL+1),lSeqC=new Uint8Array(NL+1),lSeqP=new Uint8Array(NL+1),lConsec=new Uint8Array(NL+1),lHasC=new Uint8Array(NL+1),lGrp=new Int32Array(NL+1).fill(-1),lNC=new Uint8Array(NL+1);
  const lNeed=new Int32Array(NL+1),lStu=new Array(NL),EMPTYI=new Int32Array(0);const lCards=new Array(NL),lRes=new Array(NL),lLines=new Array(NL),lShare=new Array(NL),lLineT=new Array(NL),lSubjs=new Array(NL);
  const seqCntC=new Map(),seqCntT=new Map(),gIx=new Map(),gLes=[];let anySeqP=false,maxLin=1;
  st.lessons.forEach((l,i)=>{
    lCards[i]=[];const cs=[],ts=[],lines=[],share=[],lt=[],sj=[];
    for(const ci of l.classIds){const r=cIx.get(ci);if(r!==undefined&&!cs.includes(r))cs.push(r);}
    const c0=cs.length?st.classes[cs[0]]:null;
    l.linhas.forEach((ln,li)=>{
      const t=ln.t&&tIx.has(ln.t)?tIx.get(ln.t):-1;lt.push(t);if(t>=0&&!ts.includes(t))ts.push(t);
      const si=sIx.get(ln.s),sb=si===undefined?null:st.subjects[si];if(si!==undefined&&!sj.includes(si))sj.push(si);
      const rid=ln.r||(sb&&sb.roomId)||(c0&&c0.roomId)||'';
      const ch=rid&&rIx.has(rid)?chainOf(rIx.get(rid)-R0):EMPTY;lines.push(ch);
      let sh=-1;if(ch.length)for(let z=0;z<li;z++)if(lines[z].length&&lines[z][0]===ch[0]){sh=z;break;}share.push(sh);
    });
    if(lines.length>maxLin)maxLin=lines.length;
    lRes[i]=Int32Array.from(cs.concat(ts));lNC[i]=cs.length;lLines[i]=lines;lShare[i]=Int8Array.from(share);lLineT[i]=Int32Array.from(lt);lSubjs[i]=sj;
    const s0=sj.length?sj[0]:0;lSubj[i]=s0;lHasC[i]=cs.length?1:0;{let nd=0;for(const r of cs)nd+=nReg.get(st.classes[r].id)||alunos[r];lNeed[i]=Math.max(0,nd-(dFora.get(l.id)||0)+(dExtra.get(l.id)||0));}lStu[i]=lesStu.has(l.id)?Int32Array.from(lesStu.get(l.id)):EMPTYI;
    lMarg[i]=sj.some(x=>st.subjects[x].marg||st.subjects[x].opc)?1:0;
    const sc=seqCode(l.seqT)||seqCode((st.subjects[s0]||{}).seq);lSeqC[i]=sc;lSeqP[i]=seqCode(l.seqP);
    if(sc>0&&sc<10)for(const r of cs){const k=r*32+sc;seqCntC.set(k,(seqCntC.get(k)||0)+1);}
    if(lSeqP[i]){anySeqP=true;if(lSeqP[i]<10)for(const r of ts){const k=r*32+lSeqP[i];seqCntT.set(k,(seqCntT.get(k)||0)+1);}}
    const g=String(l.grp||'').trim();if(g){if(!gIx.has(g)){gIx.set(g,gLes.length);gLes.push([]);}lGrp[i]=gIx.get(g);gLes[lGrp[i]].push(i);}
  });
  const NG=gLes.length;
  /* cartões */
  const cards=st.cards,N=cards.length,aIx=new Map();
  const cLes=new Int32Array(N+1),cLen=new Uint8Array(N+1),cMsk=new Uint8Array(N+1),cFix=new Uint8Array(N+1),cNC=new Uint8Array(N+1),nLin=new Uint8Array(N+1),rOff=new Int32Array(N+2);
  const cGr=new Int32Array(N+1),cStu=new Array(N),cRes=new Array(N),cLines=new Array(N),cShare=new Array(N),cLineT=new Array(N);
  let ro=0,totalTL=0;
  for(let a=0;a<N;a++){
    const c=cards[a],li=lIx.get(c.lessonId),l=st.lessons[li];aIx.set(c.id,a);
    cLes[a]=li;cStu[a]=lStu[li];cLen[a]=c.len;cMsk[a]=perMask(l.per,KC);cGr[a]=lNC[li]?cGrid[lRes[li][0]]:0;cRes[a]=lRes[li];cNC[a]=lNC[li];cLines[a]=lLines[li];cShare[a]=lShare[li];cLineT[a]=lLineT[li];
    nLin[a]=lLines[li].length;rOff[a]=ro;ro+=nLin[a];lCards[li].push(a);totalTL+=c.len;
  }
  rOff[N]=ro;
  const room=new Int32Array(ro+1).fill(-1),pos=new Int16Array(N+1).fill(-1);
  for(let i=0;i<NL;i++){const cs=lCards[i];lConsec[i]=(cs.length>=2&&cs.length<=3&&cs.every(a=>cLen[a]===1))?1:0;}
  const resCards=new Array(NC+NT);for(let r=0;r<NC+NT;r++)resCards[r]=[];
  for(let a=0;a<N;a++){const R=cRes[a];for(let j=0;j<R.length;j++)resCards[R[j]].push(a);}
  /* posições estaticamente possíveis e custo estático dos requisitos, por (aula, duração) */
  const feasF=new Uint8Array(Math.max(1,N)*NS),reqC=new Float32Array(Math.max(1,N)*NS),feas=new Array(N);
  {const cache=new Map();
    for(let a=0;a<N;a++){
      const li=cLes[a],len=cLen[a],key=li*32+len;let e=cache.get(key);
      if(!e){
        const fl=new Uint8Array(NS),rq=new Float32Array(NS),list=[],R=lRes[li],sj=lSubjs[li],lines=lLines[li];
        for(let d=0;d<D;d++)for(let p=0;p+len<=P;p++){
          let ok=true;for(let i=0;i<len-1;i++)if(brk[p+i]){ok=false;break;}
          if(!ok)continue;const s=d*P+p;let rc=0;
          for(let j=0;j<R.length&&ok;j++)for(let i=0;i<len;i++){const v=lev[R[j]*NS+s+i];if(v===-3){ok=false;break;}rc+=v<0?-v:-v*.5;}
          for(let j=0;j<sj.length&&ok;j++)for(let i=0;i<len;i++){const v=levS[sj[j]*NS+s+i];if(v===-3){ok=false;break;}rc+=v<0?-v:-v*.5;}
          for(let j=0;j<lines.length&&ok;j++){const ch=lines[j];if(!ch.length)continue;let anyOk=false;
            for(let q=0;q<ch.length&&!anyOk;q++){let b=false;for(let i=0;i<len;i++)if(lev[ch[q]*NS+s+i]===-3){b=true;break;}if(!b)anyOk=true;}
            if(!anyOk)ok=false;}
          if(!ok)continue;fl[s]=1;rq[s]=rc*kReq+(lHasC[li]?kLate*p:0)+((len>=3&&!(p===0||p===tarde||p+len===tarde||p+len===P))?kBloco:0);list.push(s);
        }
        e={fl,rq,list:Int16Array.from(list)};cache.set(key,e);
      }
      feasF.set(e.fl,a*NS);reqC.set(e.rq,a*NS);feas[a]=e.list;
    }
  }
  /* ocupação */
  const NSA=D*NA,cnt=new Uint8Array(Math.max(1,NRES)*(multi?NSA:NS)*NB),any=new Uint8Array(Math.max(1,NRES)*NS),who=new Array(Math.max(1,NRES)*NS),dm=new Int32Array(Math.max(1,NRES)*D);
  const whoA=multi?new Array(Math.max(1,NRES)*NSA):who;
  let hard=0,unpl=totalTL,soft=0;
  function occAdd(a,r,s){
    const len=cLen[a],mk=cMsk[a],d=(s/P)|0,p=s-d*P;let base=r*NS+s;
    for(let i=0;i<len;i++,base++){
      if(!multi){if(NB===4){const b4=base<<2;if(mk&1&&cnt[b4]++)hard++;if(mk&2&&cnt[b4+1]++)hard++;if(mk&4&&cnt[b4+2]++)hard++;if(mk&8&&cnt[b4+3]++)hard++;}else{const b0=base*NB;for(let b=0;b<NB;b++)if(mk>>b&1&&cnt[b0+b]++)hard++;}}
      if(any[base]++===0)dm[r*D+d]|=1<<(p+i);
      const wl=who[base];if(wl)wl.push(a);else who[base]=[a];
    }
    if(multi){const g=cGr[a]*P,x1=aHi[g+p+len-1],bs=(r*D+d)*NA;for(let x=aLo[g+p];x<=x1;x++){const b0=(bs+x)*NB;for(let b=0;b<NB;b++)if(mk>>b&1&&cnt[b0+b]++)hard++;const wl=whoA[bs+x];if(wl)wl.push(a);else whoA[bs+x]=[a];}}
  }
  function occDel(a,r,s){
    const len=cLen[a],mk=cMsk[a],d=(s/P)|0,p=s-d*P;let base=r*NS+s;
    for(let i=0;i<len;i++,base++){
      if(!multi){if(NB===4){const b4=base<<2;if(mk&1&&--cnt[b4])hard--;if(mk&2&&--cnt[b4+1])hard--;if(mk&4&&--cnt[b4+2])hard--;if(mk&8&&--cnt[b4+3])hard--;}else{const b0=base*NB;for(let b=0;b<NB;b++)if(mk>>b&1&&--cnt[b0+b])hard--;}}
      if(--any[base]===0)dm[r*D+d]&=~(1<<(p+i));
      const wl=who[base],j=wl.indexOf(a);wl[j]=wl[wl.length-1];wl.pop();
    }
    if(multi){const g=cGr[a]*P,x1=aHi[g+p+len-1],bs=(r*D+d)*NA;for(let x=aLo[g+p];x<=x1;x++){const b0=(bs+x)*NB;for(let b=0;b<NB;b++)if(mk>>b&1&&--cnt[b0+b])hard--;const wl=whoA[bs+x],j=wl.indexOf(a);wl[j]=wl[wl.length-1];wl.pop();}}
  }
  const selR=new Int32Array(maxLin+1),selA=new Int32Array(maxLin+1);
  function doPlace(a,s){
    pos[a]=s;const R=cRes[a];for(let j=0;j<R.length;j++)occAdd(a,R[j],s);{const G=cStu[a];for(let j=0;j<G.length;j++)occAdd(a,G[j],s);}
    const off=rOff[a],n=nLin[a],sh=cShare[a];
    for(let i=0;i<n;i++){const rm=sh[i]>=0?selR[sh[i]]:selR[i];room[off+i]=rm;if(rm>=0&&sh[i]<0)occAdd(a,rm,s);}
    unpl-=cLen[a];
  }
  function doUnplace(a){
    const s=pos[a],R=cRes[a];for(let j=0;j<R.length;j++)occDel(a,R[j],s);{const G=cStu[a];for(let j=0;j<G.length;j++)occDel(a,G[j],s);}
    const off=rOff[a],n=nLin[a],sh=cShare[a];
    for(let i=0;i<n;i++){const rm=room[off+i];if(rm>=0&&sh[i]<0)occDel(a,rm,s);}
    pos[a]=-1;unpl+=cLen[a];
  }
  /* caches de custo e marcação de componentes afetados */
  const cdC=new Float64Array(NC*D+1),tdC=new Float64Array(NT*D+1),cwC=new Float64Array(NC+1),twC=new Float64Array(NT+1),leC=new Float64Array(NL+1),caC=new Float64Array(N+1),grC=new Float64Array(NG+1),ldC=new Float64Array(D+1);
  let stamp=1;
  const sCD=new Int32Array(NC*D+1),sTD=new Int32Array(NT*D+1),sCW=new Int32Array(NC+1),sTW=new Int32Array(NT+1),sLE=new Int32Array(NL+1),sCA=new Int32Array(N+1),sGR=new Int32Array(NG+1),sLD=new Int32Array(D+1),qLD=new Int32Array(64);let nLD=0;
  const CAP=8192,qCD=new Int32Array(CAP),qTD=new Int32Array(CAP),qCW=new Int32Array(CAP),qTW=new Int32Array(CAP),qLE=new Int32Array(CAP),qCA=new Int32Array(CAP),qGR=new Int32Array(CAP);
  let nCD=0,nTD=0,nCW=0,nTW=0,nLE=0,nCA=0,nGR=0;
  const uT=new Uint8Array(CAP*8),uI=new Int32Array(CAP*8),uV=new Float64Array(CAP*8);let nU=0;
  const oA=new Int32Array(CAP),oS=new Int16Array(CAP),oK=new Uint8Array(CAP),oR=new Int32Array(CAP),rb=new Int32Array(CAP*4);let nO=0,nRB=0;
  let unpl0=0,hard0=0,dSoft=0;
  function touch(a,s){
    const R=cRes[a],nc=cNC[a],d=(s/P)|0;
    for(let j=0;j<R.length;j++){
      const r=R[j];
      if(j<nc){const k=r*D+d;if(sCD[k]!==stamp){sCD[k]=stamp;qCD[nCD++]=k;}if(wkOn[r]&&sCW[r]!==stamp){sCW[r]=stamp;qCW[nCW++]=r;}if(amMax&&sLD[d]!==stamp){sLD[d]=stamp;qLD[nLD++]=d;}}
      else{const t=r-T0,k=t*D+d;if(sTD[k]!==stamp){sTD[k]=stamp;qTD[nTD++]=k;}if(wkOn[r]&&sTW[t]!==stamp){sTW[t]=stamp;qTW[nTW++]=t;}}
    }
    const l=cLes[a];if(lCards[l].length>1&&sLE[l]!==stamp){sLE[l]=stamp;qLE[nLE++]=l;}
    if(sCA[a]!==stamp){sCA[a]=stamp;qCA[nCA++]=a;}
    const g=lGrp[l];if(g>=0&&sGR[g]!==stamp){sGR[g]=stamp;qGR[nGR++]=g;}
  }
  function begin(){stamp++;nLD=0;nCD=nTD=nCW=nTW=nLE=nCA=nGR=0;nU=0;nO=0;nRB=0;unpl0=unpl;hard0=hard;dSoft=0;}
  function place(a,s){doPlace(a,s);touch(a,s);oA[nO]=a;oS[nO]=s;oK[nO]=1;nO++;}
  function unplace(a){const s=pos[a],off=rOff[a],n=nLin[a];oA[nO]=a;oS[nO]=s;oK[nO]=0;oR[nO]=nRB;for(let i=0;i<n;i++)rb[nRB++]=room[off+i];nO++;touch(a,s);doUnplace(a);}
  function evalDirty(){
    let d=0,nv,k;
    for(let i=0;i<nCD;i++){k=qCD[i];nv=costCD((k/D)|0,k%D);if(nv!==cdC[k]){uT[nU]=0;uI[nU]=k;uV[nU++]=cdC[k];d+=nv-cdC[k];cdC[k]=nv;}}
    for(let i=0;i<nTD;i++){k=qTD[i];nv=costTD((k/D)|0,k%D);if(nv!==tdC[k]){uT[nU]=1;uI[nU]=k;uV[nU++]=tdC[k];d+=nv-tdC[k];tdC[k]=nv;}}
    for(let i=0;i<nCW;i++){k=qCW[i];nv=costCW(k);if(nv!==cwC[k]){uT[nU]=2;uI[nU]=k;uV[nU++]=cwC[k];d+=nv-cwC[k];cwC[k]=nv;}}
    for(let i=0;i<nTW;i++){k=qTW[i];nv=costTW(k);if(nv!==twC[k]){uT[nU]=3;uI[nU]=k;uV[nU++]=twC[k];d+=nv-twC[k];twC[k]=nv;}}
    for(let i=0;i<nLE;i++){k=qLE[i];nv=costLE(k);if(nv!==leC[k]){uT[nU]=4;uI[nU]=k;uV[nU++]=leC[k];d+=nv-leC[k];leC[k]=nv;}}
    for(let i=0;i<nCA;i++){k=qCA[i];nv=costCA(k);if(nv!==caC[k]){uT[nU]=5;uI[nU]=k;uV[nU++]=caC[k];d+=nv-caC[k];caC[k]=nv;}}
    for(let i=0;i<nGR;i++){k=qGR[i];nv=costGR(k);if(nv!==grC[k]){uT[nU]=6;uI[nU]=k;uV[nU++]=grC[k];d+=nv-grC[k];grC[k]=nv;}}
    for(let i=0;i<nLD;i++){k=qLD[i];nv=costLD(k);if(nv!==ldC[k]){uT[nU]=7;uI[nU]=k;uV[nU++]=ldC[k];d+=nv-ldC[k];ldC[k]=nv;}}
    nLD=0;nCD=nTD=nCW=nTW=nLE=nCA=nGR=0;stamp++;
    soft+=d;dSoft+=d;return d;
  }
  function rollback(){
    for(let i=nU-1;i>=0;i--){const k=uI[i],v=uV[i];switch(uT[i]){case 0:cdC[k]=v;break;case 1:tdC[k]=v;break;case 2:cwC[k]=v;break;case 3:twC[k]=v;break;case 4:leC[k]=v;break;case 5:caC[k]=v;break;case 6:grC[k]=v;break;default:ldC[k]=v;}}
    soft-=dSoft;
    for(let i=nO-1;i>=0;i--){const a=oA[i];if(oK[i]===1)doUnplace(a);else{const n=nLin[a];for(let z=0;z<n;z++)selR[z]=rb[oR[i]+z];doPlace(a,oS[i]);}}
    nU=0;nO=0;nRB=0;dSoft=0;nLD=0;nCD=nTD=nCW=nTW=nLE=nCA=nGR=0;stamp++;
  }
  /* --- componentes do custo --- */
  let REP=null,tok=1;const sjStamp=new Int32Array(Math.max(1,NSU)),sjMask=new Uint8Array(Math.max(1,NSU));
  function costCD(c,d){
    const RD=c*D+d,mk=dm[RD];
    if(mk===0){const u=minDay[c];if(REP&&u)REP.over+=u;return u?kDay*u:0;}
    const n=pop[mk],first=lo[mk],last=hi[mk];let g=pop[((1<<last)-1)&~((2<<first)-1)&~mk&~blk[RD]],cost=0;
    if(lunchM){const fl=lunchM&~mk;if(fl===0){cost+=kLunch;if(REP)REP.lunch++;}else if(g>0&&(fl&((1<<last)-1)&~((2<<first)-1)))g--;}
    cost+=kGapC*g;
    let ov=0;const mx=maxDay[c],mn=minDay[c];if(mx>0&&n>mx)ov=n-mx;if(mn>0&&n<mn)ov+=mn-n;cost+=kDay*ov;
    let dup=0,marg=0,sq=0,nd=0;tok++;const base=c*NS+d*P,s0=d*P;
    for(let p=first;p<=last;p++){
      if(!(mk>>p&1))continue;const wl=who[base+p];
      for(let j=0;j<wl.length;j++){
        const a=wl[j];if(pos[a]!==s0+p)continue;const l=cLes[a],sj=lSubj[l],e=p+cLen[a]-1;
        if(sjStamp[sj]===tok){if(sjMask[sj]&cMsk[a])dup++;sjMask[sj]|=cMsk[a];}else{sjStamp[sj]=tok;sjMask[sj]=cMsk[a];nd++;}
        if(lMarg[l]&&!(p===first||e===last||e===tarde-1||p===tarde))marg++;
        const sc=lSeqC[l];
        if(sc){
          let near=false;
          if(p>0&&(mk>>(p-1)&1)){const w2=who[base+p-1];for(let q=0;q<w2.length;q++)if(w2[q]!==a&&lSeqC[cLes[w2[q]]]===sc){near=true;break;}}
          if(!near&&e+1<P&&(mk>>(e+1)&1)){const w2=who[base+e+1];for(let q=0;q<w2.length;q++)if(w2[q]!==a&&lSeqC[cLes[w2[q]]]===sc){near=true;break;}}
          if(sc<10){if(!near&&(seqCntC.get(c*32+sc)|0)>1)sq+=1;}else if(near)sq+=.5;
        }
      }
    }
    const md=maxDisc[c];if(md>0&&nd>md){ov+=nd-md;cost+=kDay*(nd-md);}
    cost+=kDup*dup+kMarg*marg+kSeq*sq;
    if(REP){REP.gapsC+=g;REP.over+=ov;REP.dup+=dup;REP.marg+=marg;REP.seq+=sq;}
    return cost;
  }
  function bldOf(a,r){const off=rOff[a],n=nLin[a],lt=cLineT[a];for(let i=0;i<n;i++)if(lt[i]===r){const rm=room[off+i];if(rm>=0){const b=bld[rm-R0];if(b)return b;}}return 0;}
  function costTD(t,d){
    const r=T0+t,RD=r*D+d,mk=dm[RD];if(mk===0)return 0;
    const n=pop[mk],first=lo[mk],last=hi[mk];let g=pop[((1<<last)-1)&~((2<<first)-1)&~mk&~blk[RD]],cost=0;
    if(lunchM){const fl=lunchM&~mk;if(fl===0){cost+=kLunch;if(REP)REP.lunch++;}else if(g>0&&(fl&((1<<last)-1)&~((2<<first)-1)))g--;}
    cost+=kGapT*g;
    let ov=0;const mx=maxDay[r],mn=minDay[r];if(mx>0&&n>mx)ov=n-mx;if(mn>0&&n<mn)ov+=mn-n;cost+=kDay*ov;
    const gm=((1<<last)-1)&~((2<<first)-1)&~mk&~blk[RD],l2=pop[gm&(gm>>1)];cost+=kL2*l2;if(REP)REP.l2+=l2;
    let iso=0;if(pop[mk&mornM]===1)iso++;if(aftM&&pop[mk&aftM]===1)iso++;cost+=kIso*iso;
    let rn=0;const ms=maxSeg[r];if(ms>0&&run[mk]>ms)rn=run[mk]-ms;cost+=kRun*rn;
    let sh=0;if(oneShift[r]&&(mk&mornM)&&(mk&aftM))sh=1;cost+=kShift*sh;
    let sp=0;const mp=maxSpan[r];if(mp>0&&last-first+1>mp)sp=last-first+1-mp;cost+=kSpan*sp;
    let des=0,sq=0;
    if(hasBld||anySeqP){
      const base=r*NS+d*P,s0=d*P;let prevB=0,prevA=-1;
      for(let p=first;p<=last;p++){
        if(!(mk>>p&1)){prevB=0;prevA=-1;continue;}
        const wl=who[base+p],a0=wl[0];
        if(hasBld){if(a0!==prevA){const b=bldOf(a0,r);if(b&&prevB&&b!==prevB)des++;prevB=b;}if(longBrk[p])prevB=0;}
        prevA=a0;
        if(anySeqP)for(let j=0;j<wl.length;j++){
          const a=wl[j];if(pos[a]!==s0+p)continue;const sc=lSeqP[cLes[a]];if(!sc)continue;const e=p+cLen[a]-1;let near=false;
          if(p>0&&(mk>>(p-1)&1)){const w2=who[base+p-1];for(let q=0;q<w2.length;q++)if(w2[q]!==a&&lSeqP[cLes[w2[q]]]===sc){near=true;break;}}
          if(!near&&e+1<P&&(mk>>(e+1)&1)){const w2=who[base+e+1];for(let q=0;q<w2.length;q++)if(w2[q]!==a&&lSeqP[cLes[w2[q]]]===sc){near=true;break;}}
          if(sc<10){if(!near&&(seqCntT.get(r*32+sc)|0)>1)sq+=1;}else if(near)sq+=.5;
        }
      }
    }
    cost+=kDes*des+kSeq*sq;
    if(REP){REP.gapsT+=g;REP.over+=ov;REP.iso+=iso;REP.run+=rn;REP.shift+=sh;REP.span+=sp;REP.desloc+=des;REP.seq+=sq;}
    return cost;
  }
  function gAdj(r,d){const mk=dm[r*D+d];if(!mk)return 0;const first=lo[mk],last=hi[mk];let g=pop[((1<<last)-1)&~((2<<first)-1)&~mk&~blk[r*D+d]];if(lunchM&&g>0){const fl=lunchM&~mk;if(fl&&(fl&((1<<last)-1)&~((2<<first)-1)))g--;}return g;}
  function costCW(c){
    let cost=0;const want=wantFree[c];
    if(want&&aftM){let f=0;for(let d=0;d<D;d++)if(!(dm[c*D+d]&aftM))f++;const miss=want>f?want-f:0;if(REP)REP.freeA+=miss;cost+=kFreeA*miss;}
    const dn=dtN[c];
    if(dn){const tr=dtRes[c];let days=0;
      for(let d=0;d<D;d++){const mk=dm[c*D+d];if(!mk)continue;let found=false;const base=c*NS+d*P;
        for(let p=lo[mk];p<=hi[mk]&&!found;p++){if(!(mk>>p&1))continue;const wl=who[base+p];for(let j=0;j<wl.length&&!found;j++){const R=cRes[wl[j]];for(let z=cNC[wl[j]];z<R.length;z++)if(R[z]===tr){found=true;break;}}}
        if(found)days++;}
      const miss=dn>days?dn-days:0;if(REP)REP.dt+=miss;cost+=kDT*miss;}
    return cost;
  }
  function costTW(t){
    const r=T0+t,want=wantFree[r];let cost=0;
    if(want){let f=0;for(let d=0;d<D;d++)if(!dm[r*D+d])f++;const miss=want>f?want-f:0;if(REP)REP.freeD+=miss;cost+=kFreeD*miss;}
    if(fMin[r]||fMax[r]){let g=0;for(let d=0;d<D;d++)g+=gAdj(r,d);let out=0;if(g<fMin[r])out=fMin[r]-g;else if(fMax[r]&&g>fMax[r])out=g-fMax[r];if(REP)REP.furosR+=out;cost+=kFR*out;}
    return cost;
  }
  function costLD(d){
    if(!amMax)return 0;let over=0;
    for(let p=0;p<P;p++){if(!(lunchM>>p&1))continue;let n=0;const below=(1<<p)-1;
      for(let c=0;c<NC;c++){const mk=dm[c*D+d];if(mk&&!(mk>>p&1)&&(mk&below)&&(mk>>(p+1)))n++;}
      if(n>amMax)over+=n-amMax;}
    if(REP)REP.almMax+=over;return kAM*over;
  }
  const tmpA=new Int32Array(64),tmpB=new Int32Array(64);
  function costLE(l){
    const cs=lCards[l],n=cs.length;if(n<2)return 0;let cost=0;
    if(lConsec[l]&&kConsec){let c2=0;for(let i=0;i<n;i++){const si=pos[cs[i]];if(si<0)continue;const di=(si/P)|0;for(let j=i+1;j<n;j++){const sj=pos[cs[j]];if(sj<0)continue;const df=di-((sj/P)|0);if(df===1||df===-1)c2++;}}cost+=kConsec*c2;if(REP)REP.consec+=c2;}
    if(kEq){let e=0;for(let i=0;i<n;i++){const si=pos[cs[i]];if(si<0)continue;for(let j=i+1;j<n;j++){const sj=pos[cs[j]];if(sj>=0&&si%P===sj%P&&((si/P)|0)!==((sj/P)|0))e++;}}cost+=kEq*e;if(REP)REP.equil+=e;}
    return cost;
  }
  /* modo «mexer o mínimo»: cada aula fora do tempo original paga stayW */
  let stayW=0;const orig=new Int16Array(N+1).fill(-1);
  function costCA(a){
    const s=pos[a];if(s<0)return 0;let c=reqC[a*NS+s];if(stayW&&orig[a]>=0&&orig[a]!==s)c+=stayW*cLen[a];
    const off=rOff[a],n=nLin[a],ch=cLines[a],need=lNeed[cLes[a]];
    for(let i=0;i<n;i++){const rm=room[off+i];if(ch[i].length&&rm!==ch[i][0]){c+=kRoom;if(REP)REP.altRoom++;}if(need&&rm>=0&&cShare[a][i]<0){const cp=rCap[rm-R0];if(cp&&need>cp){c+=kCap;if(REP)REP.cap++;}}}
    return c;
  }
  function costGR(g){
    const ls=gLes[g];if(ls.length<2)return 0;let k=1e9;for(let i=0;i<ls.length;i++)k=Math.min(k,lCards[ls[i]].length);let bad=0;
    for(let j=0;j<k;j++){
      let ok=true,day=-1,n=0;
      for(let i=0;i<ls.length&&n<64;i++){const a=lCards[ls[i]][j],s=pos[a];if(s<0){ok=false;break;}const d=(s/P)|0;if(day<0)day=d;else if(d!==day){ok=false;break;}tmpA[n]=s;tmpB[n]=s+cLen[a];n++;}
      if(ok){for(let x=1;x<n;x++){const sa=tmpA[x],sb=tmpB[x];let y=x-1;while(y>=0&&tmpA[y]>sa){tmpA[y+1]=tmpA[y];tmpB[y+1]=tmpB[y];y--;}tmpA[y+1]=sa;tmpB[y+1]=sb;}
        for(let x=1;x<n;x++)if(tmpA[x]!==tmpB[x-1]){ok=false;break;}}
      if(!ok)bad++;
    }
    if(REP)REP.grp+=bad;return kGrp*bad;
  }
  function fullEval(){
    soft=0;
    for(let c=0;c<NC;c++){for(let d=0;d<D;d++)soft+=(cdC[c*D+d]=costCD(c,d));soft+=(cwC[c]=costCW(c));}
    for(let t=0;t<NT;t++){for(let d=0;d<D;d++)soft+=(tdC[t*D+d]=costTD(t,d));soft+=(twC[t]=costTW(t));}
    for(let l=0;l<NL;l++)soft+=(leC[l]=costLE(l));
    for(let a=0;a<N;a++)soft+=(caC[a]=costCA(a));
    for(let g=0;g<NG;g++)soft+=(grC[g]=costGR(g));
    for(let d=0;d<D;d++)soft+=(ldC[d]=costLD(d));
    return soft;
  }
  const total=()=>unpl*UNPL+hard*HARDW+soft;
  /* carrega as colocações guardadas no estado (mesmo que estejam em conflito) */
  function load(){
    for(let a=0;a<N;a++){
      const c=cards[a];if(c.day==null||c.day<0||c.day>=D||c.period<0||c.period+c.len>P)continue;
      const ch=cLines[a];for(let i=0;i<nLin[a];i++){const rid=c.r&&c.r[i];selR[i]=rid==='-'?-1:rid&&rIx.has(rid)?rIx.get(rid):(ch[i].length?ch[i][0]:-1);}
      doPlace(a,c.day*P+c.period);
    }
    fullEval();
  }
  /* --- conflitos de uma posição: preenche conf[] e selR[]; -1 se impossível --- */
  const mark=new Uint8Array(N+1),conf=new Int32Array(512);let nConf=0;
  /* intervalo de índices de ocupação (tempos, ou átomos com várias grelhas) do cartão a no tempo s para o recurso r */
  let oB=0,oE=0;
  function span(a,r,s){if(!multi){oB=r*NS+s;oE=oB+cLen[a];}else{const d=(s/P)|0,p=s-d*P,g=cGr[a]*P,bs=(r*D+d)*NA;oB=bs+aLo[g+p];oE=bs+aHi[g+p+cLen[a]-1]+1;}}
  function conflictsAt(a,s){
    nConf=0;const R=cRes[a],G=cStu[a],len=cLen[a],mk=cMsk[a];
    for(let j=0;j<R.length+G.length;j++){
      span(a,j<R.length?R[j]:G[j-R.length],s);
      for(let idx=oB;idx<oE;idx++){const wl=whoA[idx];if(wl&&wl.length)for(let q=0;q<wl.length;q++){const b=wl[q];if(b!==a&&(cMsk[b]&mk)&&!mark[b]&&nConf<500){mark[b]=1;conf[nConf++]=b;}}}
    }
    const lines=cLines[a],sh=cShare[a];let bad=false;
    for(let li=0;li<lines.length&&!bad;li++){
      const ch=lines[li];if(!ch.length){selR[li]=-1;continue;}
      if(sh[li]>=0){selR[li]=selR[sh[li]];continue;}
      let pick=-1,bestC=1e9,bestRoom=-1;
      for(let q=0;q<ch.length;q++){
        const rm=ch[q];let used=false;for(let z=0;z<li;z++)if(selR[z]===rm){used=true;break;}
        if(used)continue;
        let blocked=false,occ=0;const base=rm*NS+s;
        for(let i=0;i<len;i++)if(lev[base+i]===-3){blocked=true;break;}
        if(blocked)continue;
        span(a,rm,s);for(let idx=oB;idx<oE;idx++){const wl=whoA[idx];if(wl&&wl.length)for(let z=0;z<wl.length;z++){const b=wl[z];if(b!==a&&(cMsk[b]&mk))occ++;}}
        if(occ===0){pick=rm;break;}
        if(occ<bestC){bestC=occ;bestRoom=rm;}
      }
      if(pick<0){
        if(bestRoom<0){bad=true;break;}
        pick=bestRoom;span(a,pick,s);
        for(let idx=oB;idx<oE;idx++){const wl=whoA[idx];if(wl&&wl.length)for(let z=0;z<wl.length;z++){const b=wl[z];if(b!==a&&(cMsk[b]&mk)&&!mark[b]&&nConf<500){mark[b]=1;conf[nConf++]=b;}}}
      }
      selR[li]=pick;
    }
    for(let q=0;q<nConf;q++)mark[conf[q]]=0;
    return bad?-1:nConf;
  }
  /* --- variação do custo se o cartão a for para cada tempo sem conflitos (NaN nos outros) --- */
  function deltas(a){
    const out=new Float64Array(NS).fill(NaN);fullEval();const c0=total(),s0=pos[a],saved=s0>=0?Array.from(room.subarray(rOff[a],rOff[a]+nLin[a])):null;if(s0>=0)doUnplace(a);
    const L=feas[a];for(let i=0;i<L.length;i++){const s=L[i];if(conflictsAt(a,s)!==0)continue;doPlace(a,s);fullEval();out[s]=total()-c0;doUnplace(a);}
    if(s0>=0){for(let i=0;i<saved.length;i++)selR[i]=saved[i];doPlace(a,s0);}fullEval();return out;
  }
  /* --- trocas em cadeia: pôr o cartão a em cada tempo ocupado, recolocando as aulas que lá estão (até 3 níveis) --- */
  function swapChains(a,maxOut,depth){
    const out=[],fixed=b=>!!(cards[b].locked||st.lessons[cLes[b]].fixa),log=[],moved=new Set();
    const mv=(b,t)=>{log.push({b,from:pos[b],rooms:pos[b]>=0?Array.from(room.subarray(rOff[b],rOff[b]+nLin[b])):null});if(pos[b]>=0)doUnplace(b);if(t>=0)doPlace(b,t);moved.add(b);};
    const back=mark2=>{while(log.length>mark2){const e=log.pop();if(pos[e.b]>=0)doUnplace(e.b);if(e.from>=0){for(let i=0;i<e.rooms.length;i++)selR[i]=e.rooms[i];doPlace(e.b,e.from);}}};
    const put=(b,depth,orig)=>{
      let best=-1,bq=1e18;const L=feas[b];
      for(let i=0;i<L.length;i++){const t=L[i];if(t===orig)continue;if(conflictsAt(b,t)===0){const q=quick(b,t);if(q<bq){bq=q;best=t;}}}
      if(best>=0){conflictsAt(b,best);doPlace(b,best);return true;}
      if(depth<=0)return false;
      for(let i=0;i<L.length;i++){const t=L[i];if(t===orig)continue;if(conflictsAt(b,t)!==1)continue;const c=conf[0];if(fixed(c)||moved.has(c))continue;
        const m2=log.length,oc=pos[c];mv(c,-1);if(conflictsAt(b,t)===0){doPlace(b,t);if(put(c,depth-1,oc))return true;doUnplace(b);}
        back(m2);moved.delete(c);}
      return false;
    };
    fullEval();const c0=total(),s0=pos[a],L=feas[a];
    for(let i=0;i<L.length;i++){
      const s=L[i];if(s===s0)continue;const n=conflictsAt(a,s);if(n<=0||n>3)continue;const cf=Array.from(conf.subarray(0,n));if(cf.some(b=>fixed(b)))continue;
      log.length=0;moved.clear();const orig=cf.map(b=>pos[b]);mv(a,-1);cf.forEach(b=>mv(b,-1));
      let ok=conflictsAt(a,s)===0;if(ok){doPlace(a,s);for(let j=0;j<cf.length&&ok;j++)ok=put(cf[j],depth||2,orig[j]);}
      if(ok){fullEval();const ids=[...moved];out.push({s,cost:total()-c0,moves:ids.map(b=>({id:cards[b].id,day:(pos[b]/P)|0,period:pos[b]%P,r:roomsOf(b)}))});}
      back(0);
    }
    fullEval();out.sort((x,y)=>x.cost-y.cost);return out.slice(0,maxOut||8);
  }
  function quick(a,s){
    let q=reqC[a*NS+s];const R=cRes[a],d=(s/P)|0,bits=((1<<cLen[a])-1)<<(s-d*P),nc=cNC[a];
    for(let j=0;j<R.length;j++){const m0=dm[R[j]*D+d];q+=(j<nc?kGapC:kGapT)*(gap[m0|bits]-gap[m0]);}
    return q;
  }
  /* --- consultas para a interface --- */
  const ridOf=r=>r<0?'':st.rooms[r-R0].id;
  function roomsOf(a){const out=[],off=rOff[a],ch=cLines[a];for(let i=0;i<nLin[a];i++){const rm=pos[a]>=0?room[off+i]:(ch[i].length?ch[i][0]:-1);out.push(ridOf(rm));}return out;}
  function withOut(a,fn){
    const s0=pos[a];let saved=null;
    if(s0>=0){saved=Array.from(room.subarray(rOff[a],rOff[a]+nLin[a]));doUnplace(a);}
    const res=fn();
    if(s0>=0){for(let i=0;i<saved.length;i++)selR[i]=saved[i];doPlace(a,s0);}
    return res;
  }
  /* para cada tempo: -1 impossível, 0 livre, k número de aulas em conflito */
  function probeAll(a){return withOut(a,()=>{const out=new Int16Array(NS).fill(-1),F=feas[a];for(let z=0;z<F.length;z++){const nc=conflictsAt(a,F[z]);out[F[z]]=nc;}return out;});}
  function roomsFor(a,s){return withOut(a,()=>{const ok=!!feasF[a*NS+s];let nc=ok?conflictsAt(a,s):-1;const rooms=[];
    if(nc<0){const ch=cLines[a];for(let i=0;i<nLin[a];i++)rooms.push(ridOf(ch[i].length?ch[i][0]:-1));}else for(let i=0;i<nLin[a];i++)rooms.push(ridOf(selR[i]));
    return {ok:ok&&nc>=0,conflicts:nc<0?0:nc,rooms};});}
  function dayInfo(r,d){
    const mk=dm[r*D+d];if(!mk)return {mask:0,n:0,first:-1,last:-1,gaps:0,lunch:false};
    const first=lo[mk],last=hi[mk];let g=pop[((1<<last)-1)&~((2<<first)-1)&~mk&~blk[r*D+d]],lunch=false;
    if(lunchM){const fl=lunchM&~mk;if(fl===0)lunch=true;else if(g>0&&(fl&((1<<last)-1)&~((2<<first)-1)))g--;}
    return {mask:mk,n:pop[mk],first,last,gaps:g,lunch};
  }
  function report(){
    REP={l2:0,dt:0,furosR:0,cap:0,almMax:0,iso:0,gapsC:0,gapsT:0,over:0,dup:0,marg:0,seq:0,lunch:0,run:0,shift:0,span:0,desloc:0,consec:0,equil:0,grp:0,altRoom:0,freeD:0,freeA:0};
    for(let c=0;c<NC;c++){for(let d=0;d<D;d++)costCD(c,d);costCW(c);}
    for(let t=0;t<NT;t++){for(let d=0;d<D;d++)costTD(t,d);costTW(t);}
    for(let l=0;l<NL;l++)costLE(l);for(let a=0;a<N;a++)costCA(a);for(let g=0;g<NG;g++)costGR(g);for(let d=0;d<D;d++)costLD(d);
    const r=REP;REP=null;let blocked=0,placed=0;
    for(let a=0;a<N;a++){const s=pos[a];if(s<0)continue;placed+=cLen[a];let b=!feasF[a*NS+s];
      if(!b){const off=rOff[a];for(let i=0;i<nLin[a]&&!b;i++){const rm=room[off+i];if(rm>=0)for(let z=0;z<cLen[a];z++)if(lev[rm*NS+s+z]===-3){b=true;break;}}}
      if(b)blocked++;}
    r.total=totalTL;r.placed=placed;r.unplaced=totalTL-placed;r.clash=hard;r.blocked=blocked;r.soft=soft;r.cost=total()+blocked*HARDW;return r;
  }
  /* lista de sobreposições: {r, s, cards[]} */
  function clashes(limit){
    const out=[],per=multi?NSA:NS;
    for(let r=0;r<NRES&&out.length<(limit||500);r++)for(let s=0;s<per;s++){
      const idx=r*per+s,wl=whoA[idx];if(!wl||wl.length<2)continue;let two=false;for(let b=0;b<NB;b++)if(cnt[idx*NB+b]>1){two=true;break;}if(!two)continue;
      const cs=wl.filter(x=>wl.some(y=>y!==x&&(cMsk[x]&cMsk[y])));
      if(s%(multi?NA:P)>0){const pw=whoA[idx-1];if(pw&&cs.every(x=>pw.includes(x)))continue;}
      out.push({r,s:multi?pos[cs[0]]:s,cards:cs});
    }
    return out;
  }
  function isBlocked(a){const s=pos[a];if(s<0)return false;if(!feasF[a*NS+s])return true;const off=rOff[a];for(let i=0;i<nLin[a];i++){const rm=room[off+i];if(rm>=0)for(let z=0;z<cLen[a];z++)if(lev[rm*NS+s+z]===-3)return true;}return false;}

  /* ============================================================
     Otimizador: construção com ejeção + recozimento simulado
     ============================================================ */
  function solver(o){
    o=o||{};
    const rnd=mulberry32((o.seed|0)||((Math.random()*1e9)|0)),keep=o.keep!==false,budget=Math.max(200,o.ms||5000);
    const f0=o.level==='quick'?.12:o.level==='deep'?.45:.28;
    const now=(typeof performance!=='undefined'&&performance.now)?()=>performance.now():()=>Date.now();
    const fx=new Set();for(const l of st.lessons)if(l.fixa)fx.add(l.id);
    const minMode=!!o.min;stayW=minMode?Math.max(.2,o.stay||2.5):0;for(let a=0;a<N;a++)orig[a]=minMode?pos[a]:-1;
    for(let a=0;a<N;a++)cFix[a]=(pos[a]>=0&&(cards[a].locked||fx.has(cards[a].lessonId)||(keep&&!minMode)))?1:0;
    if(minMode)fullEval();else if(!keep){for(let a=0;a<N;a++)if(pos[a]>=0&&!cFix[a])doUnplace(a);fullEval();}
    const mov=[];for(let a=0;a<N;a++)if(!cFix[a]&&feas[a].length)mov.push(a);
    const kicks=new Uint16Array(N+1),lastAt=new Int32Array(Math.max(1,N)*NS).fill(-1e9),ej=new Int32Array(512);
    const load_=new Int32Array(NRES+1);for(let a=0;a<N;a++){const R=cRes[a];for(let j=0;j<R.length;j++)load_[R[j]]+=cLen[a];}
    const hardness=a=>{const R=cRes[a];let mx=0;for(let j=cNC[a];j<R.length;j++)if(load_[R[j]]>mx)mx=load_[R[j]];let rooms=0;const ch=cLines[a];for(let i=0;i<ch.length;i++)if(ch[i].length&&ch[i].length<3)rooms++;
      return feas[a].length/cLen[a]-mx*.6-R.length*1.5-rooms*2-(cLen[a]-1)*8+rnd()*3;};
    let queue=[],itC=0,phase=0,iters=0,acc=0,T=0,Tini=0,Tfim=.05,tA0=0,unList=[];
    const t0=now(),tEnd=t0+budget;
    const snapPos=new Int16Array(N+1),snapRoom=new Int32Array(room.length);let snapCost=Infinity;
    function snapshot(){snapPos.set(pos);snapRoom.set(room);snapCost=total();}
    function restore(sp,sr){
      cnt.fill(0);any.fill(0);who.fill(undefined);dm.fill(0);hard=0;unpl=totalTL;pos.fill(-1);
      for(let a=0;a<N;a++){const s=sp[a];if(s<0)continue;const off=rOff[a];for(let i=0;i<nLin[a];i++)selR[i]=sr[off+i];doPlace(a,s);}
      fullEval();
    }
    function fillQueue(){const q=mov.filter(a=>pos[a]<0),h=new Map();for(const a of q)h.set(a,hardness(a));q.sort((x,y)=>h.get(y)-h.get(x));queue=q;}
    /* coloca os cartões em fila; quando não há tempo livre, expulsa quem lá está e volta a pô-los na fila */
    function ejectStep(deadline,maxIt){
      const TABU=40;
      while(queue.length){
        if(itC>=maxIt)return true;
        if((itC&7)===0&&now()>deadline)return false;
        const a=queue.pop();if(pos[a]>=0)continue;itC++;
        const F=feas[a],nF=F.length,o0=(rnd()*nF)|0;let bestS=-1,bestV=Infinity,free=false;
        for(let z=0;z<nF;z++){
          const s=F[(z+o0)%nF],nc=conflictsAt(a,s);if(nc<0)continue;
          if(nc===0){begin();place(a,s);const v=evalDirty()+rnd()*.5;rollback();if(!free||v<bestV){free=true;bestV=v;bestS=s;}}
          else if(!free){let ok=true,v=0;for(let q=0;q<nConf;q++){const b=conf[q];if(cFix[b]){ok=false;break;}const kk=1+kicks[b];v+=kk*kk*cLen[b];}
            if(!ok)continue;if(itC-lastAt[a*NS+s]<TABU)v+=1e6;v+=rnd();if(v<bestV){bestV=v;bestS=s;}}
        }
        if(bestS<0)continue;
        const nc=conflictsAt(a,bestS);for(let q=0;q<nc;q++)ej[q]=conf[q];for(let i=0;i<nLin[a];i++)selA[i]=selR[i];
        begin();
        for(let q=0;q<nc;q++){const b=ej[q];unplace(b);if(kicks[b]<65000)kicks[b]++;queue.push(b);}
        for(let i=0;i<nLin[a];i++)selR[i]=selA[i];
        place(a,bestS);evalDirty();lastAt[a*NS+bestS]=itC;
      }
      return true;
    }
    function findFree(b){
      const F=feas[b],n=F.length;if(!n)return -1;const o0=(rnd()*n)|0;let best=-1,bv=Infinity,found=0;
      for(let z=0;z<n;z++){const s=F[(z+o0)%n];if(conflictsAt(b,s)===0){const v=quick(b,s)+rnd();if(v<bv){bv=v;best=s;}if(++found>=6)break;}}
      return best;
    }
    /* move a para s; expulsa até 3 cartões, que têm de encontrar novo lugar. Devolve a variação do custo, ou NaN */
    function tryMove(a,s){
      const old=pos[a];begin();
      if(old>=0)unplace(a);
      const nc=conflictsAt(a,s);
      if(nc<0||nc>3){rollback();return NaN;}
      if(nc===0)place(a,s);
      else{
        for(let q=0;q<nc;q++){if(cFix[conf[q]]){rollback();return NaN;}ej[q]=conf[q];}
        for(let i=0;i<nLin[a];i++)selA[i]=selR[i];
        for(let q=0;q<nc;q++)unplace(ej[q]);
        for(let i=0;i<nLin[a];i++)selR[i]=selA[i];
        place(a,s);
        for(let q=0;q<nc;q++){
          const b=ej[q];
          if(old>=0&&feasF[b*NS+old]&&conflictsAt(b,old)===0){place(b,old);continue;}
          const sb=findFree(b);if(sb<0){rollback();return NaN;}
          conflictsAt(b,sb);place(b,sb);
        }
      }
      const d=evalDirty();
      return d+UNPL*(unpl-unpl0)+HARDW*(hard-hard0);
    }
    /* modo «mexer o mínimo»: só aceita movimentos que melhoram mesmo depois de pagar a mudança */
    function descentStep(until){
      if(!mov.length)return;let k=0;
      while(true){if((++k&63)===0&&now()>=until)break;const a=mov[(rnd()*mov.length)|0],F=feas[a],s=F[(rnd()*F.length)|0];if(s===pos[a])continue;iters++;const d=tryMove(a,s);if(d!==d)continue;if(d<-1e-9)acc++;else rollback();}
      if(total()<snapCost-1e-9)snapshot();
    }
    function calibrate(){
      let sum=0,n=0;
      for(let i=0;i<600&&mov.length;i++){const a=mov[(rnd()*mov.length)|0],F=feas[a],s=F[(rnd()*F.length)|0];if(s===pos[a])continue;const d=tryMove(a,s);if(d!==d)continue;if(d>0&&d<UNPL*.5){sum+=d;n++;}rollback();}
      const mean=n?sum/n:20;Tini=mean*f0;Tfim=Math.max(.02,mean*.004);T=Tini;tA0=now();snapshot();unList=mov.filter(a=>pos[a]<0);
    }
    function repair(deadline){
      unList=mov.filter(a=>pos[a]<0);if(!unList.length)return;
      const sp=pos.slice(),sr=room.slice(),u0=unpl;fillQueue();const lim=itC+60*unList.length+400;
      ejectStep(deadline,lim);
      if(unpl>=u0)restore(sp,sr);
      queue=[];unList=mov.filter(a=>pos[a]<0);
    }
    let nextRepair=0;
    function annealStep(deadline){
      let it=0;const nM=mov.length;if(!nM)return;
      for(;;){
        if((it++&255)===0){
          const t=now();if(t>=deadline)return;
          const fr=Math.min(1,(t-tA0)/Math.max(1,tEnd-tA0));T=fr>.97?1e-9:Tini*Math.pow(Tfim/Tini,fr);
          const c=total();if(c<snapCost-1e-9)snapshot();
          if(unpl>0){if(iters>=nextRepair){nextRepair=iters+Math.max(20000,nM*12);repair(deadline);}else if((it&4095)===1)unList=mov.filter(a=>pos[a]<0);}else if(unList.length)unList=[];
        }
        let a;if(unList.length&&rnd()<.25){a=unList[(rnd()*unList.length)|0];if(pos[a]>=0)a=mov[(rnd()*nM)|0];}else a=mov[(rnd()*nM)|0];
        const F=feas[a],s=F[(rnd()*F.length)|0];if(s===pos[a])continue;
        const d=tryMove(a,s);iters++;
        if(d!==d)continue;
        if(d<=0||rnd()<Math.exp(-d/T))acc++;else rollback();
      }
    }
    function finish(){
      if(phase===3)return;
      if(snapCost<total()-1e-9)restore(snapPos,snapRoom);
      /* volta à sala pedida sempre que estiver livre */
      for(let a=0;a<N;a++){if(pos[a]<0||cFix[a])continue;const off=rOff[a],ch=cLines[a];let alt=false;for(let i=0;i<nLin[a];i++)if(ch[i].length&&room[off+i]!==ch[i][0])alt=true;
        if(!alt)continue;const s=pos[a];begin();unplace(a);if(conflictsAt(a,s)===0){place(a,s);evalDirty();}else rollback();}
      phase=3;
    }
    function progress(){return {phase,done:phase===3,total:totalTL,placed:totalTL-unpl,unplaced:unpl,clash:hard,soft,cost:total(),iters,eject:itC,acc,T,elapsed:now()-t0,budget};}
    function step(ms){
      const dl=now()+ms;
      if(phase===0){if(!queue.length&&itC===0)fillQueue();const done=ejectStep(Math.min(dl,Math.max(tEnd,t0+budget*.5)),60*N+2000);if(done||now()>=tEnd){queue=[];phase=mov.length?1:3;if(phase===3)finish();}}
      else if(phase===1){calibrate();phase=2;}
      else if(phase===2){if(now()>=tEnd)finish();else if(minMode)descentStep(Math.min(dl,tEnd));else annealStep(Math.min(dl,tEnd));}
      return progress();
    }
    function result(){const out=new Array(N);for(let a=0;a<N;a++){const s=pos[a];out[a]=s<0?{id:cards[a].id,day:null,period:null}:{id:cards[a].id,day:(s/P)|0,period:s%P,r:roomsOf(a)};}return out;}
    /* verificação interna: compara os custos incrementais com um recálculo completo */
    function selfCheck(){const s1=soft,h1=hard,u1=unpl,sp=pos.slice(),sr=room.slice();restore(sp,sr);return {soft:[s1,soft],hard:[h1,hard],unpl:[u1,unpl],ok:Math.abs(s1-soft)<1e-6&&h1===hard&&u1===unpl};}
    return {step,finish,progress,result,selfCheck,tryMove,rollback:()=>rollback(),mov};
  }
  return {N,D,P,NS,NC,NT,NR,T0,R0,load,report,clashes,probeAll,roomsFor,dayInfo,roomsOf,solver,isBlocked,total,
    G0,stuG,need:li=>lNeed[li],deltas,chains:swapChains,KC,multi,cardIdx:id=>aIx.get(id),resIdx:(kind,id)=>kind==='c'?cIx.get(id):kind==='t'?tIx.get(id):rIx.get(id),
    posOf:a=>pos[a],feasible:(a,s)=>!!feasF[a*NS+s],feasCount:a=>feas[a].length,
    cardsAt:(r,s)=>who[r*NS+s]||[],busy:(r,s)=>any[r*NS+s]>0,dayMask:(r,d)=>dm[r*D+d],level:(r,s)=>lev[r*NS+s],
    cardsOf:r=>r<R0?resCards[r]:(()=>{const out=[];for(let a=0;a<N;a++){const off=rOff[a],ch=cLines[a];for(let i=0;i<nLin[a];i++){const rm=pos[a]>=0?room[off+i]:(ch[i].length?ch[i][0]:-1);if(rm===r){out.push(a);break;}}}return out;})(),
    lessonOf:a=>cLes[a],tarde,aftM,mornM};
}
