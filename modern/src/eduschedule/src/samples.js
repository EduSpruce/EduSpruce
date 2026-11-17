/* ===== escolas de exemplo, gerador de teste de carga e verificador independente ===== */
function baseState(name){
  return {v:3,name,ano:'2026/2027',tlMin:50,alvo:1100,tarde:0,days:['Seg','Ter','Qua','Qui','Sex'],periods:[],classes:[],teachers:[],rooms:[],subjects:[],lessons:[],off:{},cards:[],cover:{},vig:{},print:{},
    w:Object.assign({},W0),almoco:{de:0,ate:0},reunioes:[],locais:[],exports:[],inicio:'2026-09-14',fim:'2027-06-15',
    ferias:[{id:'f1',nome:'Interrupção do Natal',de:'2026-12-21',ate:'2027-01-01'},{id:'f2',nome:'Interrupção do Carnaval',de:'2027-02-08',ate:'2027-02-10'},{id:'f3',nome:'Interrupção da Páscoa',de:'2027-03-22',ate:'2027-04-02'}]};
}
const GRELHA=[['08:30','09:20'],['09:20','10:10',1],['10:30','11:20'],['11:20','12:10'],['12:10','13:00',1],['14:00','14:50'],['14:50','15:40',1],['15:50','16:40']];
function sample(){
  const st=baseState('Escola Básica de Exemplo');st.example=true;
  GRELHA.forEach((t,i)=>st.periods.push({label:String(i+1),start:t[0],end:t[1],breakAfter:!!t[2]}));
  [['lab1','Laboratório 1','lab2'],['lab2','Laboratório 2','lab1'],['pav','Pavilhão',''],['sev','Sala de EV',''],['stic','Sala TIC','']].forEach(r=>st.rooms.push({id:r[0],name:r[1],alt:r[2],ed:''}));
  [['PORT','Português','#c2410c',''],['MAT','Matemática','#2f6fd6',''],['ING','Inglês','#7c3aed',''],['HIST','História','#a16207',''],['GEO','Geografia','#15803d',''],
   ['CN','Ciências Naturais','#0e7490','lab1'],['FQ','Físico-Química','#be185d','lab2'],['EF','Educação Física','#b91c1c','pav'],['EV','Educação Visual','#9333ea','sev'],
   ['TIC','TIC','#475569','stic'],['EMRC','EMRC','#0f766e','',1],['DT','Direção de Turma','#64748b',''],['TE','Trabalho de Estabelecimento','#94a3b8','',0,1]]
    .forEach(s=>st.subjects.push({id:s[0],short:s[0],name:s[1],color:s[2],roomId:s[3],fator:50,seq:'',marg:!!s[4],cnl:!!s[5]}));
  for(let i=1;i<=13;i++){const c='P'+String(i).padStart(2,'0');st.teachers.push({id:c,short:c,name:'Docente '+String(i).padStart(2,'0'),proc:'',prev:22,maxDay:6,maxSeg:0,maxSpan:0,umTurno:false,diasLivres:0,dep:''});}
  const L=(cl,lines,tl,duplos)=>st.lessons.push({id:uid(),classIds:cl,linhas:lines.map(a=>({s:a[0],t:a[1],r:'',tip:a[2]||''})),tl,duplos,blocos:'',per:''});
  ['7ºA','7ºB','8ºA','8ºB','9ºA','9ºB'].forEach((n,i)=>{
    const id='c'+i,h=i<3,nono=i>3;st.rooms.push({id:'s'+i,name:'Sala '+(i+1),alt:'',ed:''});
    st.classes.push({id,name:n,full:n.replace('º','.º ano, turma '),roomId:'s'+i,dt:'P'+String(i+1).padStart(2,'0'),minDay:0,maxDay:7,tardesLivres:0,dep:''});
    L([id],[['PORT',h?'P01':'P02']],4,1);L([id],[['MAT',h?'P03':'P04']],4,1);L([id],[['ING','P05']],3,0);L([id],[['HIST','P06']],2,0);L([id],[['GEO','P07']],2,0);
    L([id],[['CN','P08']],nono?2:3,nono?0:1);L([id],[['FQ','P09']],nono?2:3,nono?0:1);
    if(nono)L([id],[['CN','P08','T1'],['FQ','P09','T2']],2,1);
    L([id],[['EF','P10']],3,1);L([id],[['EV','P11']],2,1);L([id],[['TIC','P12']],1,0);L([id],[['EMRC','P13']],1,0);
    L([],[['DT','P'+String(i+1).padStart(2,'0')]],2,0);
  });
  ['P06','P07','P11'].forEach(t=>L([],[['TE',t]],2,0));
  st.classes.forEach(c=>{st.off['c:'+c.id]={'2-5':-3,'2-6':-3,'2-7':-3};});
  const o12={};for(let d=3;d<5;d++)for(let p=0;p<8;p++)o12[d+'-'+p]=-3;st.off['t:P12']=o12;
  st.off['t:P11']={'4-5':-2,'4-6':-2,'4-7':-2};st.off['s:EF']={'0-5':-2,'1-5':-2,'2-5':-2,'3-5':-2,'4-5':-2};
  syncCards(st);return st;
}
/* Gera uma escola grande com solução garantida: primeiro constrói um horário válido às escondidas,
   depois entrega só os dados (aulas, professores, salas). Devolve {st, ref}; ref guarda a solução escondida. */
function bigSample(o){
  o=o||{};const nC=Math.max(2,o.classes||100),rnd=mulberry32(o.seed||7),tight=!!o.tight,D=5,P=8,NS=40;
  const DEM={PORT:4,MAT:4,ING:3,HIST:2,GEO:2,CN:3,FQ:3,EF:3,EV:2,TIC:1,CD:1,EMRC:1,AE:1,OC:1},TOT=31;
  const nT0=Math.max(20,o.teachers||(tight?Math.ceil(nC*TOT/(o.avg||17)):nC*10)),cap=tight?(o.cap||20):22,RU=o.roomU||.7;
  const st=baseState('Escola de teste ('+nC+' turmas)');st.teste=true;
  GRELHA.forEach((t,i)=>st.periods.push({label:String(i+1),start:t[0],end:t[1],breakAfter:!!t[2]}));
  const brk=GRELHA.map(t=>t[2]?1:0);
  [['PORT','Português','#c2410c'],['MAT','Matemática','#2f6fd6'],['ING','Inglês','#7c3aed'],['HIST','História','#a16207'],['GEO','Geografia','#15803d'],['CN','Ciências Naturais','#0e7490'],['FQ','Físico-Química','#be185d'],
   ['EF','Educação Física','#b91c1c'],['EV','Educação Visual','#9333ea'],['TIC','TIC','#475569'],['CD','Cidadania e Desenvolvimento','#0369a1'],['EMRC','EMRC','#0f766e',1],['AE','Apoio ao Estudo','#65a30d'],['OC','Oferta Complementar','#db2777'],
   ['DT','Direção de Turma','#64748b'],['TE','Trabalho de Estabelecimento','#94a3b8',0,1]]
    .forEach(s=>st.subjects.push({id:s[0],short:s[0],name:s[1],color:s[2],roomId:'',fator:50,seq:'',marg:!!s[3],cnl:!!s[4]}));
  /* salas específicas em ciclo de alternativas */
  const GR={EF:['PAV','Pavilhão',Math.ceil(3*nC/30/RU)],CN:['LAB','Lab. Ciências',Math.ceil(3*nC/30/RU)],FQ:['LFQ','Lab. Físico-Química',Math.ceil(3*nC/30/RU)],EV:['SEV','Sala EV',Math.ceil(2*nC/30/RU)],TIC:['STIC','Sala TIC',Math.ceil(nC/30/RU)]};
  const gRooms={},gBusy={};
  for(const s in GR){const [code,nm,k]=GR[s];gRooms[s]=[];gBusy[s]=new Uint8Array(k*NS);for(let i=0;i<k;i++){const id=code+(i+1);gRooms[s].push(id);st.rooms.push({id,name:nm+' '+(i+1),alt:k>1?code+((i+1)%k+1):'',ed:''});}}
  /* professores e bolsas por disciplina */
  const pools={},tBusy=[],tLoad=[];let nT=0;
  const addT=()=>{const i=nT++,c='D'+String(i+1).padStart(4,'0');st.teachers.push({id:c,short:c,name:'Docente '+String(i+1).padStart(4,'0'),proc:'',prev:22,maxDay:7,maxSeg:0,maxSpan:0,umTurno:false,diasLivres:0,dep:''});tBusy.push(new Uint8Array(NS));tLoad.push(0);return i;};
  {const keys=Object.keys(DEM);let left=nT0;keys.forEach((k,j)=>{const n=j===keys.length-1?Math.max(1,left):Math.max(1,Math.round(nT0*DEM[k]/TOT));pools[k]=[];for(let i=0;i<n&&(left>0||!pools[k].length);i++){pools[k].push(addT());left--;}});
    let j=0;while(left>0){pools[keys[j%2]].push(addT());left--;j++;}}
  const ref=new Map(),hidden=[];
  const perYear=Math.max(1,Math.ceil(nC/8)),cname=i=>(5+Math.floor(i/perYear))+'º'+(perYear<=26?String.fromCharCode(65+i%perYear):(i%perYear+1));
  for(let i=0;i<nC;i++){st.rooms.push({id:'S'+(i+1),name:'Sala '+(i+1),alt:'',ed:''});st.classes.push({id:'T'+(i+1),name:cname(i),full:'',roomId:'S'+(i+1),dt:'',minDay:0,maxDay:8,tardesLivres:0,dep:''});st.off['c:T'+(i+1)]={'2-5':-3,'2-6':-3,'2-7':-3};}
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=(rnd()*(i+1))|0,t=a[i];a[i]=a[j];a[j]=t;}return a;};
  let journal=[];
  const markT=(t,s)=>{tBusy[t][s]=1;tLoad[t]++;journal.push(()=>{tBusy[t][s]=0;tLoad[t]--;});};
  const markG=(g,k,s)=>{gBusy[g][k*NS+s]=1;journal.push(()=>{gBusy[g][k*NS+s]=0;});};
  const tFree=(t,d,p,len)=>{for(let i=0;i<len;i++)if(tBusy[t][d*P+p+i])return false;return true;};
  const pickT=(subj,need,allowNew)=>{const pl=pools[subj],c=pl.filter(t=>tLoad[t]+need<=cap);c.sort((a,b)=>tLoad[a]-tLoad[b]||a-b);const out=c.slice(0,10);
    if(allowNew){const t=addT();pl.push(t);out.push(t);}return out;};
  function genPair(pair,allowNew){
    journal=[];const out=[];
    const counts=[6,6,5,6,6];{const ds=[0,1,3,4];counts[ds[(rnd()*4)|0]]++;if(rnd()<.3){const d=ds[(rnd()*4)|0];if(counts[d]<8){counts[d]++;counts[2]--;}}}
    const free=pair.map(()=>counts.map(n=>{const a=new Uint8Array(P);for(let p=0;p<n;p++)a[p]=1;return a;}));
    const dayS=pair.map(()=>[0,1,2,3,4].map(()=>new Set()));
    const take=(k,d,p,len)=>{for(let i=0;i<len;i++)free[k][d][p+i]=0;};
    const emit=(cls,lines,cardsRef)=>{const id=uid();const tl=cardsRef.reduce((a,c)=>a+c.len,0);
      out.push({les:{id,classIds:cls,linhas:lines,tl,duplos:cardsRef.filter(c=>c.len===2).length,blocos:'',per:''},cards:cardsRef});return out[out.length-1].les;};
    /* EMRC: conjunta no par, numa ponta do dia */
    {let ok=false;const ds=shuffle([0,1,2,3,4]);
      for(const d of ds){for(const p of shuffle([0,counts[d]-1])){if(!pair.every((_,k)=>free[k][d][p]))continue;
          const ts=pickT('EMRC',1,allowNew).filter(t=>tFree(t,d,p,1));if(!ts.length)continue;const t=ts[0];
          markT(t,d*P+p);pair.forEach((_,k)=>{take(k,d,p,1);dayS[k][d].add('EMRC');});
          emit(pair.map(ci=>'T'+(ci+1)),[{s:'EMRC',t:st.teachers[t].id,r:'',tip:''}],[{len:1,day:d,period:p,rooms:['S'+(pair[0]+1)]}]);ok=true;break;}
        if(ok)break;}
      if(!ok)return null;}
    for(let k=0;k<pair.length;k++){
      const ci=pair[k],cid='T'+(ci+1),home='S'+(ci+1),turnos=ci%4===3;
      const spec=[['PORT',[2,1,1]],['MAT',[2,1,1]],['ING',[1,1,1]],['HIST',[1,1]],['GEO',[1,1]],['EF',[2,1]],['EV',[2]],['AE',[1]],['OC',[1]]];
      if(turnos)spec.push(['CN',[1,1]],['FQ',[1,1]],['CN+FQ',[2]]);else spec.push(['CN',[2,1]],['FQ',[2,1]]);
      spec.push(['TIC+CD',[1]]);
      /* tenta colocar um cartão desta aula com os professores ts; devolve {len,day,period,rooms} ou null */
      const placeCard=(name,subs,ts,len)=>{
        for(const strict of [true,false]){
          const opts=[];
          for(let d=0;d<D;d++){if(strict&&subs.some(s=>dayS[k][d].has(s)))continue;
            for(let p=0;p+len<=P;p++){let f=true;for(let i=0;i<len;i++)if(!free[k][d][p+i]||(i<len-1&&brk[p+i])){f=false;break;}
              if(f&&ts.every(t=>tFree(t,d,p,len)))opts.push([d,p]);}}
          shuffle(opts);
          for(const [d,p] of opts){
            const rooms=[];let rok=true;
            for(const s of subs){const g=gRooms[s];if(!g||(name==='TIC+CD'&&s==='CD')){rooms.push(home);continue;}
              let kk=-1;for(let z=0;z<g.length;z++){const q=(ci+z)%g.length;let fr=true;for(let i=0;i<len;i++)if(gBusy[s][q*NS+d*P+p+i]){fr=false;break;}if(fr){kk=q;break;}}
              if(kk<0){rok=false;break;}rooms.push([s,kk]);}
            if(!rok)continue;
            take(k,d,p,len);subs.forEach(s=>dayS[k][d].add(s));
            for(let i=0;i<len;i++){ts.forEach(t=>markT(t,d*P+p+i));rooms.forEach(r=>{if(Array.isArray(r))markG(r[0],r[1],d*P+p+i);});}
            return {len,day:d,period:p,rooms:rooms.map(r=>Array.isArray(r)?gRooms[r[0]][r[1]]:r)};
          }
        }
        return null;
      };
      const items=shuffle(spec).map(([name,lens])=>({name,subs:name.split('+'),lens,need:lens.reduce((a,b)=>a+b,0),ts:null,placed:[]}));
      const candOf=it=>{const cand=it.subs.map(s=>{const c=pickT(s,it.need,allowNew);if(allowNew)c.unshift(c.pop());return c;});
        return it.subs.length===1?cand[0].map(t=>[t]):cand[0].slice(0,6).flatMap(a=>cand[1].slice(0,6).filter(b=>b!==a).map(b=>[a,b]));};
      /* 1.ª passagem: todos os duplos; 2.ª passagem: os tempos simples */
      for(const it of items){
        if(it.lens[0]!==2)continue;let ok=false;
        for(const ts of candOf(it)){const c=placeCard(it.name,it.subs,ts,2);if(c){it.ts=ts;it.placed.push(c);ok=true;break;}}
        if(!ok)return null;
      }
      items.sort((a,b)=>b.lens.length-a.lens.length);
      for(const it of items){
        const singles=it.lens.filter(n=>n===1);if(!singles.length)continue;let ok=false;
        for(const ts of (it.ts?[it.ts]:candOf(it))){
          const jl=journal.length,freeBak=free[k].map(a=>a.slice()),dsBak=dayS[k].map(s=>new Set(s)),got=[];let good=true;
          for(const len of singles){const c=placeCard(it.name,it.subs,ts,len);if(!c){good=false;break;}got.push(c);}
          if(!good){while(journal.length>jl)journal.pop()();free[k]=freeBak;dayS[k]=dsBak;continue;}
          it.ts=ts;it.placed.push(...got);ok=true;break;
        }
        if(!ok)return null;
      }
      for(const it of items){
        const ts=it.ts,placed=it.placed;
        if(it.name==='TIC+CD'){
          emit([cid],[{s:'TIC',t:st.teachers[ts[0]].id,r:gRooms.TIC[ci%gRooms.TIC.length],tip:''}],[{len:1,day:placed[0].day,period:placed[0].period,rooms:[placed[0].rooms[0]]}]).per='A';
          emit([cid],[{s:'CD',t:st.teachers[ts[1]].id,r:'',tip:''}],[{len:1,day:placed[0].day,period:placed[0].period,rooms:[home]}]).per='B';
        }else emit([cid],it.subs.map((s,j)=>({s,t:st.teachers[ts[j]].id,r:gRooms[s]?gRooms[s][ci%gRooms[s].length]:'',tip:it.subs.length>1?'T'+(j+1):''})),placed);
      }
    }
    return out;
  }
  let i=0;
  while(i<nC){
    const pair=(i+1<nC&&Math.floor(i/perYear)===Math.floor((i+1)/perYear))?[i,i+1]:[i];let res=null;
    for(let at=0;at<60&&!res;at++){res=genPair(pair,false);if(!res)while(journal.length)journal.pop()();}
    for(let at=0;at<200&&!res;at++){res=genPair(pair,true);if(!res)while(journal.length)journal.pop()();}
    if(!res)throw new Error('gerador: não foi possível construir a turma '+(i+1));
    for(const r of res){st.lessons.push(r.les);ref.set(r.les.id,r.cards);}
    i+=pair.length;
  }
  /* cargos sem turma: direção de turma e trabalho de estabelecimento */
  const duty=(subj,t,n)=>{const slots=[];for(let s=0;s<NS&&slots.length<n;s++){const q=(s*7+t*3)%NS;if(!tBusy[t][q]&&!(Math.floor(q/P)===2&&q%P>=5)){slots.push(q);tBusy[t][q]=1;tLoad[t]++;}}
    if(slots.length<n)return;const id=uid();st.lessons.push({id,classIds:[],linhas:[{s:subj,t:st.teachers[t].id,r:'',tip:''}],tl:n,duplos:0,blocos:'',per:''});ref.set(id,slots.map(q=>({len:1,day:Math.floor(q/P),period:q%P,rooms:['']})));};
  const tIdx=new Map(st.teachers.map((t,j)=>[t.id,j]));
  st.classes.forEach(c=>{const l=st.lessons.find(x=>x.classIds.length===1&&x.classIds[0]===c.id&&x.linhas[0].s==='PORT');if(l){c.dt=l.linhas[0].t;duty('DT',tIdx.get(c.dt),2);}});
  if(!tight)for(let t=0;t<nT;t++)if(tLoad[t]<8)duty('TE',t,2);
  /* opção de aperto: impede (-3) uma fração dos tempos livres de cada professor na solução escondida */
  if(o.squeeze>0)for(let t=0;t<nT;t++){const off={};let n=0;for(let q=0;q<NS;q++)if(!tBusy[t][q]&&rnd()<o.squeeze){off[Math.floor(q/P)+'-'+(q%P)]=-3;n++;}if(n)st.off['t:'+st.teachers[t].id]=off;}
  st.name='Escola de teste ('+nC+' turmas, '+nT+' professores)';
  syncCards(st);return {st,ref};
}
/* aplica a solução escondida aos cartões (para ter um custo de referência) */
function applyRef(st,ref){
  const by=new Map();for(const c of st.cards){let a=by.get(c.lessonId);if(!a)by.set(c.lessonId,a=[]);a.push(c);}
  for(const [lid,cs] of ref){const mine=(by.get(lid)||[]).slice();for(const r of cs){const j=mine.findIndex(c=>c.len===r.len);if(j<0)continue;const c=mine.splice(j,1)[0];c.day=r.day;c.period=r.period;c.r=r.rooms.slice();}}
}
/* verificador independente do motor: devolve a lista de violações rígidas de um estado */
function verify(st){
  const errs=[],P=st.periods.length,D=st.days.length,L=new Map(st.lessons.map(l=>[l.id,l])),occ=new Map();
  const lv=(key,d,p)=>{const o=st.off[key];return o?(o[d+'-'+p]||0):0;};
  for(const c of st.cards){
    if(c.day==null)continue;const l=L.get(c.lessonId);
    if(!l){errs.push('cartão sem aula '+c.id);continue;}
    if(c.day<0||c.day>=D||c.period<0||c.period+c.len>P){errs.push('fora da grelha '+c.id);continue;}
    for(let i=0;i<c.len-1;i++)if(st.periods[c.period+i].breakAfter)errs.push('atravessa intervalo '+c.id);
    const mask=perMask(l.per,cicloK(st)),res=new Set(),subs=new Set();
    l.classIds.forEach(ci=>res.add('c:'+ci));
    l.linhas.forEach((ln,i)=>{if(ln.t)res.add('t:'+ln.t);subs.add('s:'+ln.s);const rm=(c.r&&c.r[i])||lineRoom(st,l,ln);if(rm&&rm!=='-')res.add('r:'+rm);});
    for(let i=0;i<c.len;i++){
      const p=c.period+i,slot=c.day*P+p;
      for(const k of subs)if(lv(k,c.day,p)===-3)errs.push('tempo impedido '+k+' '+c.id);
      for(const k of res){
        if(lv(k,c.day,p)===-3)errs.push('tempo impedido '+k+' '+c.id);
        for(let ph=0;ph<2*cicloK(st);ph++)if(mask>>ph&1){const key=k+'|'+slot+'|'+ph;if(occ.has(key))errs.push('sobreposição '+k+' tempo '+slot+' ('+occ.get(key)+', '+c.id+')');else occ.set(key,c.id);}
      }
    }
  }
  return errs;
}
/* Importa ficheiros de texto DIF (GPU001 obrigatório; GPU002 a GPU006 opcionais) e devolve um estado novo.
   files: {nome: texto}. As aulas chegam já colocadas, tal como estavam no programa de origem. */
function parseDIF(text){
  const rows=[];
  for(const line of String(text).replace(/^﻿/,'').split(/\r?\n/)){
    if(!line.trim())continue;const out=[];let cur='',q=false;
    for(let i=0;i<line.length;i++){const ch=line[i];if(q){if(ch==='"'){if(line[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}else if(ch==='"')q=true;else if(ch===','||ch===';'&&!line.includes(',')){out.push(cur);cur='';}else cur+=ch;}
    out.push(cur);rows.push(out.map(x=>x.trim()));
  }
  return rows;
}
function importDIF(files,base){
  const get=n=>{for(const k in files)if(new RegExp('GPU0*'+n+'(\\D|$)','i').test(k))return parseDIF(files[k]);return null;};
  const g1=get(1);if(!g1||!g1.length||g1[0].length<7)throw new Error('Falta o GPU001.TXT (horários).');
  const st=baseState((base&&base.name)||'Escola importada');st.ferias=[];st.inicio='';st.fim='';if(base&&base.ano)st.ano=base.ano;
  const names=n=>{const m=new Map(),g=get(n);if(g)for(const r of g)if(r[0])m.set(r[0],r[1]||'');return m;};
  const nC=names(3),nT=names(4),nR=names(5),nS=names(6);
  const PAL=['#2f6fd6','#c2410c','#7c3aed','#a16207','#15803d','#0e7490','#be185d','#b91c1c','#9333ea','#475569','#0369a1','#0f766e','#65a30d','#db2777','#b45309','#4f46e5'];
  const C=new Map(),T=new Map(),Rm=new Map(),Sb=new Map();
  const cls=c=>{if(!C.has(c)){const id='c'+C.size;C.set(c,id);st.classes.push({id,name:c,full:nC.get(c)||'',roomId:'',dt:'',minDay:0,maxDay:0,tardesLivres:0,maxDisc:0,dep:''});}return C.get(c);};
  const tch=t=>{if(!t)return '';if(!T.has(t)){const id='t'+T.size;T.set(t,id);st.teachers.push({id,short:t,name:nT.get(t)||t,proc:t,prev:0,minDay:0,maxDay:0,maxSeg:0,maxSpan:0,umTurno:false,diasLivres:0,dep:''});}return T.get(t);};
  const rom=r=>{if(!r)return '';if(!Rm.has(r)){const id='r'+Rm.size;Rm.set(r,id);st.rooms.push({id,name:r,alt:'',ed:''});}return Rm.get(r);};
  const sub=x=>{if(!Sb.has(x)){const id='s'+Sb.size;Sb.set(x,id);st.subjects.push({id,short:x,name:nS.get(x)||x,color:PAL[Sb.size%PAL.length],roomId:'',fator:st.tlMin,seq:'',marg:false,cnl:false});}return Sb.get(x);};
  const L=new Map();let maxD=1,maxP=1;
  for(const r of g1){
    const n=r[0],d=+r[5],p=+r[6];if(!n||!(d>=1)||!(p>=1)||!r[3])continue;if(d>maxD)maxD=d;if(p>maxP)maxP=p;
    let l=L.get(n);if(!l)L.set(n,l={n:+n||0,cls:new Set(),lines:new Map(),slots:new Set()});
    const ci=r[1]?cls(r[1]):'';if(ci)l.cls.add(ci);const t=tch(r[2]),s=sub(r[3]),rm=rom(r[4]),k=t+'|'+s;
    if(!l.lines.has(k))l.lines.set(k,{s,t,r:rm,tip:'',at:new Map(),cls:new Set()});
    const ln=l.lines.get(k);if(ci)ln.cls.add(ci);if(rm&&!ln.r)ln.r=rm;ln.at.set((d-1)+'-'+(p-1),rm);l.slots.add((d-1)*100+(p-1));
  }
  st.days=['Seg','Ter','Qua','Qui','Sex','Sáb'].slice(0,Math.max(5,Math.min(6,maxD)));
  const P=Math.min(16,maxP);st.periods=[];
  for(let i=0;i<P;i++){const o=base&&base.periods&&base.periods.length>=P?base.periods[i]:null;st.periods.push({label:String(i+1),start:o?o.start:'',end:o?o.end:'',breakAfter:false});}
  for(const l of L.values()){
    const id=uid(),lines=[...l.lines.values()],slots=[...l.slots].filter(x=>x%100<P).sort((a,b)=>a-b),blocks=[];
    for(const s of slots){const b=blocks[blocks.length-1];if(b&&b.s+b.len===s)b.len++;else blocks.push({s,len:1});}
    st.lessons.push({id,n:l.n,classIds:[...l.cls],linhas:lines.map(x=>{const o={s:x.s,t:x.t,r:x.r,tip:''};if(x.cls.size&&x.cls.size<l.cls.size)o.cls=[...x.cls];return o;}),tl:slots.length,duplos:blocks.filter(b=>b.len===2).length,blocos:blocks.filter(b=>b.len>2).map(b=>b.len).join(','),per:''});
    for(const b of blocks){const rr=i=>lines.map(x=>{const k=Math.floor(b.s/100)+'-'+(b.s%100+i);return x.at.has(k)?(x.at.get(k)||'-'):(x.r||'');}),cd={id:uid(),lessonId:id,len:b.len,day:Math.floor(b.s/100),period:b.s%100,locked:false,r:rr(0)};
      for(let i=1;i<b.len;i++){const x=rr(i);if(x.join('|')!==cd.r.join('|')){cd.rx=cd.rx||{};cd.rx[i]=x;}}st.cards.push(cd);}
  }
  const used=new Uint8Array(P);for(const c of st.cards)for(let i=0;i<c.len;i++)used[c.period+i]=1;
  /* um tempo que ninguém usa a meio do dia é a hora de almoço: fica impedido para as turmas e conta como intervalo */
  {let f=0,l=P-1;while(f<P&&!used[f])f++;while(l>=0&&!used[l])l--;
    for(let p=f+1;p<l;p++)if(!used[p]){st.periods[p-1].breakAfter=true;st.periods[p].breakAfter=true;for(const c of st.classes){const o=st.off['c:'+c.id]||(st.off['c:'+c.id]={});for(let d=0;d<st.days.length;d++)o[d+'-'+p]=-3;}}}
  /* aulas do GPU002 que ainda não têm horário */
  const g2=get(2);if(g2)for(const r of g2){const n=r[0];if(!n||L.has(n)||!r[6])continue;let l=L.get('u'+n);
    if(!l){l={id:uid(),n:+n||0,classIds:[],linhas:[],tl:Math.max(1,Math.round(+String(r[1]).replace(',','.'))||1),duplos:0,blocos:'',per:''};L.set('u'+n,l);st.lessons.push(l);}
    if(r[4]){const c=cls(r[4]);if(!l.classIds.includes(c))l.classIds.push(c);}
    const t=tch(r[5]),s=sub(r[6]);if(!l.linhas.some(x=>x.s===s&&x.t===t))l.linhas.push({s,t,r:rom(r[7]),tip:r[12]||''});}
  st.lessons=st.lessons.filter(l=>l.linhas&&l.linhas.length);
  return normalize(st);
}
if(typeof module!=='undefined'&&module.exports)module.exports={perMask,perFrac,perLabel,perBit,cicloK,uid,byId,W0,WF,MASK,UNPL,mulberry32,seqCode,lineRoom,wantLens,tardeIdx,normalize,syncCards,createModel,sample,bigSample,applyRef,verify,parseDIF,importDIF};
