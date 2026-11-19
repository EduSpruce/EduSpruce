/* ---------- importar horários impressos pelo Untis (PDF): um horário por página (formador, turma ou sala) ---------- */
/* Lê a grelha pela geometria da página: os nomes dos dias dão as colunas, os números dos tempos dão as linhas e os
   retângulos das células dão a duração de cada aula (um bloco de 2 tempos é uma só célula). Sem retângulos, a duração
   deduz-se da posição do texto (centrado no bloco). Os números soltos (-3 a 3) são as disponibilidades do Untis. */
const UPDF_DIAS=[[/^seg|^mon|^2\.?ª/i,0],[/^ter|^tue|^3\.?ª/i,1],[/^qua|^wed|^4\.?ª/i,2],[/^qui|^thu|^5\.?ª/i,3],[/^sex|^fri|^6\.?ª/i,4],[/^s[áa]b|^sat/i,5],[/^dom|^sun/i,6]];
const updfDia=t=>{t=String(t).trim();if(t.length<3&&!/ª/.test(t))return -1;for(const [re,i] of UPDF_DIAS)if(re.test(t))return i;return -1};
async function updfPagina(lib,page){
  const vp=page.getViewport({scale:1}),H=vp.height,W=vp.width;
  /* texto: cada pedaço com a sua caixa (coordenadas com y de cima para baixo) */
  const tc=await page.getTextContent(),T=[];
  for(const it of tc.items){const s=it.str;if(!s||!s.trim())continue;const tr=it.transform,fs=Math.hypot(tr[2],tr[3])||Math.abs(tr[3])||8,x=tr[4],yb=H-tr[5],w=it.width||s.length*fs*.5,cw=w/s.length;
    /* um pedaço com vários espaços seguidos são várias palavras afastadas (ex.: «A06      S01») */
    const re=/\S+(?: \S+)*/g;let m;while((m=re.exec(s))){T.push({t:m[0],x:x+m.index*cw,x2:x+(m.index+m[0].length)*cw,y:yb-fs*.35,top:yb-fs*.8,bot:yb+fs*.15,fs})}}
  /* retângulos (células) do desenho, com a matriz de transformação */
  const R=[];try{const ol=await page.getOperatorList(),O=lib.OPS;let ctm=[1,0,0,1,0,0];const pilha=[];
    const mul=(m,n)=>[m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]];
    const pt=(x,y)=>[ctm[0]*x+ctm[2]*y+ctm[4],H-(ctm[1]*x+ctm[3]*y+ctm[5])];
    for(let i=0;i<ol.fnArray.length;i++){const f=ol.fnArray[i],a=ol.argsArray[i];
      if(f===O.save)pilha.push(ctm);else if(f===O.restore)ctm=pilha.pop()||[1,0,0,1,0,0];else if(f===O.transform)ctm=mul(ctm,a);
      else if(f===O.paintFormXObjectBegin){pilha.push(ctm);if(a&&a[0])ctm=mul(ctm,a[0]);}else if(f===O.paintFormXObjectEnd)ctm=pilha.pop()||ctm;
      else if(f===O.constructPath){const ops=a[0],ar=a[1];let k=0,sub=[];
        /* um caminho fechado com dois x e dois y é um retângulo (o Untis desenha as células com linhas) */
        const fecha=()=>{if(sub.length>=4){const xs=[],ys=[],q=(L,v)=>{if(!L.some(u=>Math.abs(u-v)<.6))L.push(v)};for(const p of sub){q(xs,p[0]);q(ys,p[1]);}
            if(xs.length===2&&ys.length===2)R.push({x1:Math.min(...xs),x2:Math.max(...xs),y1:Math.min(...ys),y2:Math.max(...ys)});}sub=[]};
        for(const op of ops){if(op===O.rectangle){const x=ar[k],y=ar[k+1],w=ar[k+2],h=ar[k+3];k+=4;const p1=pt(x,y),p2=pt(x+w,y+h);
          R.push({x1:Math.min(p1[0],p2[0]),x2:Math.max(p1[0],p2[0]),y1:Math.min(p1[1],p2[1]),y2:Math.max(p1[1],p2[1])});}
        else if(op===O.moveTo){fecha();sub.push(pt(ar[k],ar[k+1]));k+=2}else if(op===O.lineTo){sub.push(pt(ar[k],ar[k+1]));k+=2}
        else if(op===O.curveTo){k+=6;sub=[]}else if(op===O.curveTo2||op===O.curveTo3){k+=4;sub=[]}else if(op===O.closePath){}}
        fecha()}}}catch(e){}
  /* cabeçalho dos dias */
  const D=[];for(const t of T){const d=updfDia(t.t);if(d>=0&&!D.some(x=>x.d===d))D.push({d,nome:t.t,cx:(t.x+t.x2)/2,y:t.y});}
  if(D.length<2)return null;
  const yDias=D.map(x=>x.y).sort((a,b)=>a-b)[Math.floor(D.length/2)];const Dd=D.filter(x=>Math.abs(x.y-yDias)<6).sort((a,b)=>a.cx-b.cx);if(Dd.length<2)return null;
  const passo=(Dd[Dd.length-1].cx-Dd[0].cx)/(Dd.length-1);
  Dd.forEach((c,i)=>{c.x1=i?(Dd[i-1].cx+c.cx)/2:c.cx-passo/2;c.x2=i<Dd.length-1?(c.cx+Dd[i+1].cx)/2:c.cx+passo/2});
  const xG=Dd[0].x1;
  /* tempos: números inteiros à esquerda da primeira coluna, abaixo dos dias */
  const P=[];for(const t of T){if(t.x2>xG+2||t.y<=yDias+4)continue;if(/^\d{1,2}$/.test(t.t)&&+t.t>=0&&+t.t<=20&&!P.some(p=>p.n===+t.t))P.push({n:+t.t,y:t.y,x:t.x});}
  P.sort((a,b)=>a.y-b.y);
  /* só a coluna mais à esquerda (as horas também podem ter números) */
  if(P.length){const xmin=Math.min(...P.map(p=>p.x));for(let i=P.length-1;i>=0;i--)if(P[i].x>xmin+12)P.splice(i,1);}
  if(!P.length)return null;
  const horas=T.filter(t=>t.x2<=xG+2&&t.y>yDias+4&&/^\d{1,2}[:h.]\d{2}$/.test(t.t));
  const hpasso=P.length>1?(P[P.length-1].y-P[0].y)/(P.length-1):30;
  P.forEach((p,i)=>{p.y1=i?(P[i-1].y+p.y)/2:p.y-hpasso/2;p.y2=i<P.length-1?(p.y+P[i+1].y)/2:p.y+hpasso/2;
    const hs=horas.filter(t=>t.y>=p.y1&&t.y<p.y2).sort((a,b)=>a.y-b.y).map(t=>t.t.replace(/[h.]/,':').padStart(5,'0'));p.ini=hs[0]||'';p.fim=hs[1]||''});
  /* fim da grelha: o último tempo; dados abaixo disso (tabela das disciplinas) não contam */
  const yFim=P[P.length-1].y2+2,yIni=P[0].y1-2;
  const linha=y=>{let b=-1;for(let i=0;i<P.length;i++)if(y>=P[i].y1&&y<P[i].y2)b=i;return b};
  /* células: retângulos dentro de uma coluna de dia, com a largura da coluna */
  const cel=[],vis=new Set();
  for(const r of R){const w=r.x2-r.x1,h=r.y2-r.y1,cx=(r.x1+r.x2)/2;if(h<hpasso*.5||r.y1<yIni-2||r.y2>yFim+2)continue;
    const c=Dd.find(c=>cx>=c.x1&&cx<c.x2);if(!c||w<passo*.55||w>passo*1.15)continue;
    const ps=P.map((p,i)=>i).filter(i=>P[i].y>r.y1&&P[i].y<r.y2);if(!ps.length)continue;
    const k=c.d+'|'+ps[0]+'|'+ps.length;if(vis.has(k))continue;vis.add(k);cel.push({d:c.d,i0:ps[0],len:ps.length,x1:r.x1,x2:r.x2,y1:r.y1,y2:r.y2});}
  /* palavras dentro da grelha */
  const G=T.filter(t=>t.x>=xG-1&&t.y>yIni&&t.y<yFim&&t.y>yDias+4);
  const out=[],vals=[],usado=new Set();
  const juntar=(ws,d,i0,len)=>{const ls=[];for(const w of ws.sort((a,b)=>a.y-b.y||a.x-b.x)){const l=ls.find(l=>Math.abs(l.y-w.y)<Math.max(2.5,w.fs*.45));if(l)l.ws.push(w);else ls.push({y:w.y,ws:[w]});}
    ls.forEach(l=>l.ws.sort((a,b)=>a.x-b.x));
    const num=ls.length&&ls.every(l=>l.ws.every(w=>/^[-+]?[0-3]$/.test(w.t)));
    if(num){for(let k=0;k<len;k++)vals.push({d,p:P[i0+k].n,v:+ls[0].ws[0].t});return}
    const lin=ls.map(l=>l.ws.filter(w=>!/^[-+]?[0-3]$/.test(w.t))).filter(l=>l.length);if(lin.length)out.push({d,p:P[i0].n,len,lin:lin.map(l=>l.map(w=>({t:w.t,x:w.x,x2:w.x2}))),x1:cx1(d),x2:cx2(d)})};
  const cx1=d=>Dd.find(c=>c.d===d).x1,cx2=d=>Dd.find(c=>c.d===d).x2;
  if(cel.length){
    for(const c of cel){const ws=G.filter(w=>{const cx=(w.x+w.x2)/2;return cx>=c.x1&&cx<=c.x2&&w.y>=c.y1&&w.y<=c.y2});ws.forEach(w=>usado.add(w));if(ws.length)juntar(ws,c.d,c.i0,c.len);}
  }else{
    /* sem desenho: agrupar por coluna; o centro do texto diz onde está o bloco (na fronteira entre dois tempos = 2 tempos) */
    for(const c of Dd){const ws=G.filter(w=>{const cx=(w.x+w.x2)/2;return cx>=c.x1&&cx<c.x2}).sort((a,b)=>a.y-b.y);const grupos=[];
      for(const w of ws){const g=grupos[grupos.length-1];if(g&&w.y-g.ult<hpasso*.42){g.ws.push(w);g.ult=w.y}else grupos.push({ws:[w],ult:w.y});}
      for(const g of grupos){const y0=g.ws[0].y,y1=g.ws[g.ws.length-1].y,cy=(y0+y1)/2;let i=linha(cy);if(i<0)continue;const p=P[i];let i0=i,len=1;
        if(g.ws.length>1&&i<P.length-1&&Math.abs(cy-p.y2)<hpasso*.18){len=2}else if(g.ws.length>1&&i>0&&Math.abs(cy-p.y1)<hpasso*.18){i0=i-1;len=2}
        juntar(g.ws,c.d,i0,len)}}
  }
  /* cabeçalho do elemento: o texto entre o topo e a linha dos dias, mais abaixo (o que está por cima é a escola) */
  const cab=T.filter(t=>t.y<yDias-6).sort((a,b)=>a.y-b.y||a.x-b.x);const lc=[];for(const w of cab){const l=lc.find(l=>Math.abs(l.y-w.y)<3);if(l)l.ws.push(w);else lc.push({y:w.y,ws:[w]});}
  lc.forEach(l=>l.ws.sort((a,b)=>a.x-b.x));
  const elL=lc.length?lc[lc.length-1]:null,el=elL?elL.ws.map(w=>w.t):[];
  let cod='',nome='';if(el.length>1){cod=el[0];nome=el.slice(1).join(' ')}else if(el.length){nome=el[0];const m=/^(\S+)\s+(.+)$/.exec(nome);if(m&&/\d/.test(m[1])){cod=m[1];nome=m[2]}}
  const topo=lc.slice(0,-1).map(l=>l.ws.map(w=>w.t).join(' '));
  return {cod,nome,topo,dias:Dd.map(c=>({d:c.d,nome:c.nome})),tempos:P.map(p=>({n:p.n,ini:p.ini,fim:p.fim})),aulas:out,vals,comCelulas:!!cel.length}
}
async function updfLer(lib,data){
  const doc=await lib.getDocument({data,isEvalSupported:false}).promise,pags=[];
  for(let i=1;i<=doc.numPages;i++){const pg=await doc.getPage(i);const r=await updfPagina(lib,pg);if(r){r.pag=i;pags.push(r)}}
  return pags}

/* ---------- da leitura ao horário: identificar formadores, turmas, salas e disciplinas e colocar as aulas ---------- */
/* Nunca apaga nada: acrescenta o que falta, coloca aulas por colocar e cria as que não existem. O que já está no mesmo tempo fica igual. */
const updfNorm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const UPDF_PART=new Set(['da','de','do','das','dos','e']);
function updfNomeIgual(a,b){const f=x=>updfNorm(x).split(' ').filter(w=>w&&!UPDF_PART.has(w)),A=f(a),B=f(b);if(!A.length||!B.length)return false;if(A.join(' ')===B.join(' '))return true;
  if(A.length<2||B.length<2)return false;if(A[0]===B[0]&&A[A.length-1]===B[B.length-1])return true;const [p,q]=A.length<=B.length?[A,B]:[B,A];return p.every(w=>q.includes(w))}
function updfAchar(st,k,txt,nome){const n=updfNorm(txt),nn=updfNorm(nome);
  if(k==='t')return (n&&st.teachers.find(t=>updfNorm(t.short)===n||updfNorm(t.proc)===n))||(nn&&st.teachers.find(t=>updfNomeIgual(t.name,nome)))||(n&&n.includes(' ')&&st.teachers.find(t=>updfNomeIgual(t.name,txt)))||null;
  if(k==='c')return (n&&st.classes.find(c=>updfNorm(c.name)===n))||(nn&&st.classes.find(c=>updfNorm(c.name)===nn||updfNorm(c.full)===nn))||null;
  if(k==='r')return (n&&st.rooms.find(r=>updfNorm(r.name)===n||updfNorm(r.alt)===n))||(nn&&st.rooms.find(r=>updfNorm(r.name)===nn))||null;
  if(k==='s')return (n&&(st.subjects.find(s=>updfNorm(s.short)===n)||st.subjects.find(s=>updfNorm(s.name)===n)))||null;return null}
/* que horário é cada página: de um professor, de uma turma ou de uma sala */
function updfTipo(st,pg){
  if(updfAchar(st,'c',pg.cod,pg.nome))return 'c';if(updfAchar(st,'r',pg.cod,pg.nome))return 'r';if(updfAchar(st,'t',pg.cod,pg.nome))return 't';
  let nc=0,nt=0;for(const a of pg.aulas)for(const l of a.lin.slice(1))for(const w of l){if(updfAchar(st,'c',w.t))nc++;else if(updfAchar(st,'t',w.t))nt++;}
  if(nc>nt)return 't';if(nt>nc)return 'c';
  if(/t[ée]cnic|curso|turma|\bano\b/i.test(pg.nome)||/^[A-Z]{1,3}\d{1,3}[A-Z]?$/.test(pg.cod||pg.nome))return 'c';
  return 't'}
/* uma célula: 1.ª palavra = disciplina; a última de uma linha com várias, à direita = sala; o resto = turmas (horário de professor) ou professores (horário de turma) */
function updfCelula(st,a,K){const mid=(a.x1+a.x2)/2,r={s:'',c:[],t:[],r:[]};
  a.lin.forEach((l,li)=>l.forEach((w,wi)=>{const t=w.t;if(li===0&&wi===0){r.s=t;return}
    if(K!=='c'&&updfAchar(st,'c',t)){r.c.push(t);return}if(K!=='r'&&updfAchar(st,'r',t)){r.r.push(t);return}if(K!=='t'&&updfAchar(st,'t',t)){r.t.push(t);return}
    if(K!=='r'&&l.length>1&&wi===l.length-1&&w.x>=mid){r.r.push(t);return}
    if(K==='t')r.c.push(t);else if(K==='c')r.t.push(t);else if(/^\d+$/.test(t))r.t.push(t);else r.c.push(t)}));
  return r}
const UPDF_COR=['#2f6fd6','#c2410c','#7c3aed','#a16207','#0e7490','#be185d','#b91c1c','#9333ea','#475569','#0369a1','#0f766e','#db2777','#b45309','#4f46e5'];
const UPDF_DN=['Seg','Ter','Qua','Qui','Sex','Sáb'];
/* aplica a leitura a um estado (st). Com uma cópia serve para pré-visualizar; com S, dentro de mutate, importa. */
function updfAplicar(st,pags,o){
  const R={novos:{t:[],c:[],r:[],s:[]},aulasNovas:0,novosTempos:0,colocados:0,ja:0,atrib:0,disp:0,sobre:0,fora:0,ign:0,dias:0,tempos:0,horas:0,lin:[]};
  const novo=(k,txt,nome)=>{let x;const id=uid();
    if(k==='t'){const sig=String(txt||'').trim()||String(nome||'').split(/\s+/).filter(w=>w&&!UPDF_PART.has(w.toLowerCase())).map(w=>w[0]).join('').toUpperCase().slice(0,4)||'P';
      x={id,short:sig,name:nome||txt||sig,proc:txt||'',prev:0,minDay:0,maxDay:0,maxSeg:0,maxSpan:0,umTurno:false,diasLivres:0,dep:''};st.teachers.push(x)}
    else if(k==='c'){x={id,name:txt||nome,full:txt&&nome&&nome!==txt?nome:'',roomId:'',dt:'',minDay:0,maxDay:0,tardesLivres:0,maxDisc:0,dep:''};st.classes.push(x)}
    else if(k==='r'){x={id,name:txt||nome,alt:'',ed:''};st.rooms.push(x)}
    else{x={id,short:txt,name:nome||txt,color:UPDF_COR[st.subjects.length%UPDF_COR.length],roomId:'',fator:st.tlMin||50,seq:'',marg:false,cnl:false};st.subjects.push(x)}
    R.novos[k].push(k==='t'?(x.name+(x.proc&&x.proc!==x.name?' ('+x.proc+')':'')):(x.short||x.name));return x};
  const obter=(k,txt,nome)=>updfAchar(st,k,txt,nome)||novo(k,txt,nome);
  /* dias e tempos que faltem à grelha (nunca se tiram) */
  let mxD=-1,mxP=0;for(const pg of pags){for(const a of pg.aulas){mxD=Math.max(mxD,a.d);mxP=Math.max(mxP,a.p+a.len-1)}for(const v of pg.vals){mxD=Math.max(mxD,v.d);mxP=Math.max(mxP,v.p)}}
  while(st.days.length<=Math.min(5,mxD)){st.days.push(UPDF_DN[st.days.length]);R.dias++}
  const tp=new Map();for(const pg of pags)for(const t of pg.tempos)if(t.n>0&&!tp.has(t.n)&&(t.ini||t.fim))tp.set(t.n,t);
  while(st.periods.length<Math.min(16,mxP)){const n=st.periods.length+1,t=tp.get(n);st.periods.push({label:String(n),start:t?t.ini:'',end:t?t.fim:'',breakAfter:false});R.tempos++}
  if(o.horas)for(const [n,t] of tp){const p=st.periods[n-1];if(p&&(t.ini&&p.start!==t.ini||t.fim&&p.end!==t.fim)){if(t.ini)p.start=t.ini;if(t.fim)p.end=t.fim;R.horas++}}
  const Lby=()=>new Map(st.lessons.map(l=>[l.id,l]));
  pags.forEach((pg,ip)=>{const op=o.pg[ip]||{};const K=op.tipo||'t';if(K==='x')return;
    const lista=st[KINDS[K][0]];let el=op.el&&op.el!=='novo'?lista.find(x=>x.id===op.el):null;
    if(!el)el=op.el==='novo'?novo(K,pg.cod||pg.nome,pg.nome):obter(K,pg.cod||pg.nome,pg.nome);
    pg._el=el.id;
    for(const a of pg.aulas){const x=updfCelula(st,a,K),lin={pag:ip,d:a.d,p:a.p,len:a.len,s:x.s,c:K==='c'?[el.name]:x.c,t:K==='t'?[el.short||el.name]:x.t,r:K==='r'?[el.name]:x.r,e:''};R.lin.push(lin);
      if(!x.s){lin.e='ign';R.ign++;continue}
      const day=a.d,per=a.p-1,len=a.len;if(day<0||day>=st.days.length||per<0||per+len>st.periods.length){lin.e='fora';R.fora++;continue}
      const s=obter('s',x.s),cls=K==='c'?[el]:x.c.map(t=>obter('c',t)),tch=K==='t'?[el]:x.t.map(t=>obter('t',t)),rms=K==='r'?[el]:x.r.map(t=>obter('r',t));
      if(!cls.length&&!tch.length){lin.e='ign';R.ign++;continue}
      const cset=[...new Set(cls.map(c=>c.id))],tset=[...new Set(tch.map(t=>t.id))];
      const cand=st.lessons.filter(l=>l.linhas.some(ln=>ln.s===s.id)&&(cset.length?l.classIds.length===cset.length&&cset.every(id=>l.classIds.includes(id)):!l.classIds.length));
      let L=cand.find(l=>tset.every(t=>l.linhas.some(ln=>ln.s===s.id&&ln.t===t)));
      if(!L&&tset.length){L=cand.find(l=>l.linhas.filter(ln=>ln.s===s.id).every(ln=>!ln.t));
        if(L){const sem=L.linhas.filter(ln=>ln.s===s.id);tset.forEach((t,i)=>{if(sem[i])sem[i].t=t;else L.linhas.push({s:s.id,t,r:'',tip:''})});R.atrib++;
          for(const c of st.cards)if(c.lessonId===L.id&&c.r&&c.r.length!==L.linhas.length)delete c.r}}
      if(!L){L={id:uid(),n:0,classIds:cset,linhas:(tset.length?tset:['']).map((t,i)=>({s:s.id,t,r:(rms[i]||rms[0]||{}).id||'',tip:''})),tl:0,duplos:0,blocos:'',per:''};st.lessons.push(L);R.aulasNovas++;lin.nova=1}
      /* um bloco que atravessa um intervalo da grelha divide-se em partes (aqui um bloco não pode passar um intervalo) */
      const partes=[];{let p0=per;for(let q=per;q<per+len;q++)if(q===per+len-1||(st.periods[q]&&st.periods[q].breakAfter)){partes.push([p0,q-p0+1]);p0=q+1}}
      if(partes.length>1)lin.div=1;
      const r=L.linhas.map((ln,i)=>{const rm=rms[i]||(rms.length?rms[rms.length-1]:null);return rm?rm.id:''});
      const Lm=Lby(),tsL=new Set(L.linhas.map(ln=>ln.t).filter(Boolean)),csL=new Set(L.classIds);const est=new Set();
      for(const [pp,ll] of partes){const meus=st.cards.filter(c=>c.lessonId===L.id);
        if(meus.some(c=>c.day===day&&c.period===pp&&c.len===ll)){est.add('ja');R.ja+=ll;continue}
        /* sobreposição: o mesmo professor ou turma já tem outra aula a essa hora (importa-se na mesma; aparece nos conflitos) */
        if(st.cards.some(c=>{if(c.day!==day||c.lessonId===L.id||c.period==null||c.period+c.len<=pp||c.period>=pp+ll)return false;const l2=Lm.get(c.lessonId);return l2&&(l2.classIds.some(i=>csL.has(i))||l2.linhas.some(ln=>ln.t&&tsL.has(ln.t)))})){lin.sob=1;R.sobre+=ll}
        const livre=meus.find(c=>c.day==null&&c.len===ll);
        if(livre){livre.day=day;livre.period=pp;livre.locked=false;if(r.some(Boolean))livre.r=r;est.add('col');R.colocados+=ll}
        else{const c={id:uid(),lessonId:L.id,len:ll,day,period:pp,locked:false};if(r.some(Boolean))c.r=r;st.cards.push(c);L.tl=(L.tl|0)+ll;if(ll===2)L.duplos=(L.duplos|0)+1;else if(ll>2)L.blocos=(L.blocos?L.blocos+',':'')+ll;est.add('novo');R.novosTempos+=ll}}
      lin.e=est.has('novo')?'novo':est.has('col')?'col':'ja';
    }
    /* disponibilidades do Untis (-3 a 3) só onde ainda não há nenhuma */
    if(o.disp&&pg.vals.length){const key=K+':'+el.id,oo=st.off[key]||{};let n=0;
      for(const v of pg.vals){if(!(v.v<0||v.v>=2))continue;if(v.d>=st.days.length||v.p<1||v.p>st.periods.length)continue;const k=v.d+'-'+(v.p-1);if(oo[k]==null){oo[k]=v.v;n++}}
      if(n){st.off[key]=oo;R.disp+=n}}
  });
  return R}
/* pdf.js 3.11 servido pelo próprio sítio (esm/), como as outras bibliotecas: a política de conteúdo só deixa scripts do sítio ou blob:.
   Aberto dentro de outra página da mesma origem (ex.: a EPISJ 360 noutro endereço), o ficheiro vem pela página de fora e entra como blob:. */
let UPDF_LIB=null;
async function updfLib(){if(UPDF_LIB)return UPDF_LIB;
  const base=new URL('esm/',document.baseURI).href,LIB=base+'pdf-3.11.174.min.js',WK=base+'pdf.worker-3.11.174.min.js';
  const js=src=>new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error('Não foi possível carregar o leitor de PDF.'));document.head.append(s)});
  const texto=async u=>{const tenta=async f=>{const r=await f(u);if(!r.ok)throw new Error('HTTP '+r.status);return r.text()};try{return await tenta(x=>fetch(x))}catch(e){if(window.parent!==window)return tenta(x=>window.parent.fetch(x));throw e}};
  const blob=t=>URL.createObjectURL(new Blob([t],{type:'text/javascript'}));
  if(!window.pdfjsLib){try{await js(LIB)}catch(e){}}
  if(!window.pdfjsLib){await js(blob(await texto(LIB)))}
  if(!window.pdfjsLib)throw new Error('Não foi possível carregar o leitor de PDF.');
  const lib=window.pdfjsLib;try{lib.GlobalWorkerOptions.workerSrc=blob(await texto(WK))}catch(e){lib.GlobalWorkerOptions.workerSrc=WK}
  return UPDF_LIB=lib}
/* escolher os PDF, ler e mostrar o que vai entrar */
function updfEscolher(){
  if(busy){toast('A otimização está a decorrer. Pare-a antes de importar.');return}
  const inp=h('input',{type:'file',accept:'.pdf,application/pdf',multiple:true,class:'sr-only'});document.body.append(inp);
  inp.addEventListener('change',async()=>{const fs=[...inp.files];inp.remove();if(!fs.length)return;
    toast('A ler '+(fs.length>1?fs.length+' ficheiros':fs[0].name)+'…');
    try{const lib=await updfLib(),pags=[];
      for(const f of fs){let r;try{r=await updfLer(lib,new Uint8Array(await f.arrayBuffer()))}catch(e){toast(f.name+': não foi possível abrir o PDF.',null,null,'bad');continue}
        r.forEach(p=>{p.fich=f.name});pags.push(...r);if(!r.length)toast(f.name+': não encontrei nenhum horário (grelha com os dias da semana e os tempos).',null,null,'bad')}
      if(pags.length)updfPrever(pags)}
    catch(e){toast(e.message||'Não foi possível ler os PDF.',null,null,'bad')}});
  inp.click()}
function updfPrever(pags){
  const op=pags.map(pg=>{const tipo=updfTipo(S,pg),el=updfAchar(S,tipo,pg.cod||pg.nome,pg.nome);return {tipo,el:el?el.id:''}});
  const o={pg:op,disp:true,horas:false};
  const difHoras=(()=>{for(const pg of pags)for(const t of pg.tempos){const p=S.periods[t.n-1];if(p&&(t.ini&&p.start!==t.ini||t.fim&&p.end!==t.fim))return true}return false})();
  const box=h('div',{class:'flex flex-col gap-3',id:'updf-box'});
  const TIPOS=[['t',KINDS.t[1]],['c',KINDS.c[1]],['r',KINDS.r[1]],['x','Não importar']];
  const desenhar=()=>{const cp=JSON.parse(JSON.stringify(S));const R=updfAplicar(cp,pags,o);
    const nN=R.novos.t.length+R.novos.c.length+R.novos.r.length+R.novos.s.length,ver=R.novosTempos+R.colocados;
    const hv=S.horarios&&S.horarios.length?(S.horarios.find(v=>v.id===S.hAtivo)||{}).nome:'';
    const elems=h('div',{class:'flex flex-col gap-2'},pags.map((pg,i)=>{const lista=S[KINDS[op[i].tipo]?KINDS[op[i].tipo][0]:'teachers']||[];
      return h('div',{class:'flex flex-wrap items-end gap-2 text-sm'},h('div',{class:'min-w-48 grow'},h('div',{class:'font-semibold'},(pg.cod?pg.cod+' · ':'')+(pg.nome||'(sem nome)')),h('div',{class:'text-xs opacity-60'},(pg.fich||'')+(pags.length>1||pg.pag>1?' · página '+pg.pag:'')+' · '+pg.aulas.length+' aula'+(pg.aulas.length===1?'':'s'))),
        field('Horário de',selEl('updf-t'+i,op[i].tipo,TIPOS,v=>{op[i].tipo=v;const e=v!=='x'&&updfAchar(S,v,pg.cod||pg.nome,pg.nome);op[i].el=e?e.id:'';desenhar()},'Horário de')),
        op[i].tipo==='x'?null:field('Corresponde a',selEl('updf-e'+i,op[i].el,[['','Automático'+(updfAchar(S,op[i].tipo,pg.cod||pg.nome,pg.nome)?' ('+(updfAchar(S,op[i].tipo,pg.cod||pg.nome,pg.nome).name)+')':' (criar novo)')],['novo','Criar novo: '+(pg.nome||pg.cod)]].concat(lista.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt')).map(x=>[x.id,x.name+(x.short&&x.short!==x.name?' ('+x.short+')':'')])),v=>{op[i].el=v;desenhar()},'Corresponde a','max-w-72')))}));
    const est={novo:['novo','info'],col:['por colocar → colocada','info'],ja:['já estava','mute'],fora:['fora da grelha','warn'],ign:['ignorada','warn']};
    const linhas=R.lin.slice(0,250).map(l=>h('tr',{},h('td',{},S.days[l.d]||UPDF_DN[l.d]||('dia '+(l.d+1))),h('td',{class:'num'},l.p+(l.len>1?'–'+(l.p+l.len-1):'')),h('td',{class:'font-semibold'},l.s),h('td',{},l.c.join(', ')),h('td',{},l.t.join(', ')),h('td',{},l.r.join(', ')),
      h('td',{},(est[l.e]?badge(est[l.e][0],est[l.e][1]):null),l.nova?badge('aula nova','mute'):null,l.div?badge('dividida no intervalo','mute'):null,l.sob?badge('sobreposição','warn'):null)));
    box.replaceChildren(...[
      h('p',{class:'text-sm opacity-70'},'Lido de '+[...new Set(pags.map(p=>p.fich))].join(', ')+'. Confirme de quem é cada horário. Nada é apagado: as aulas entram no horário'+(hv?' «'+hv+'»':'')+', e o que já está no mesmo tempo fica igual.'),
      elems,
      h('div',{class:'stats stats-vertical sm:stats-horizontal border border-base-300 w-full'},
        h('div',{class:'stat py-2'},h('div',{class:'stat-title'},'Tempos a colocar'),h('div',{class:'stat-value text-2xl num'},String(ver)),h('div',{class:'stat-desc'},R.colocados?R.colocados+' de aulas que estavam por colocar':'')),
        h('div',{class:'stat py-2'},h('div',{class:'stat-title'},'Tempos que já estavam'),h('div',{class:'stat-value text-2xl num'},String(R.ja))),
        h('div',{class:'stat py-2'},h('div',{class:'stat-title'},'Aulas novas'),h('div',{class:'stat-value text-2xl num'},String(R.aulasNovas))),
        h('div',{class:'stat py-2'},h('div',{class:'stat-title'},'Elementos novos'),h('div',{class:'stat-value text-2xl num'},String(nN)))),
      nN?h('div',{class:'text-sm flex flex-col gap-1'},['t','c','r','s'].filter(k=>R.novos[k].length).map(k=>h('span',{},h('b',{},KINDS[k][2]+' a criar: '),R.novos[k].join(', ')))):null,
      R.sobre?note('warn',R.sobre+' tempo'+(R.sobre>1?'s ficam':' fica')+' em cima de outra aula do mesmo '+KINDS.t[1].toLowerCase()+' ou da mesma turma. Importa-se na mesma; resolva depois em Conflitos.'):null,
      R.fora?note('warn',R.fora+' aula'+(R.fora>1?'s estão':' está')+' fora da grelha (dia ou tempo que não existe) e não entra'+(R.fora>1?'m':'')+'.'):null,
      R.atrib?h('span',{class:'text-sm opacity-70'},R.atrib+' aula'+(R.atrib>1?'s':'')+' sem '+KINDS.t[1].toLowerCase()+' passa'+(R.atrib>1?'m':'')+' a ter o do PDF.'):null,
      (R.dias||R.tempos)?h('span',{class:'text-sm opacity-70'},'A grelha ganha '+[R.dias?R.dias+' dia(s)':'',R.tempos?R.tempos+' tempo(s)':''].filter(Boolean).join(' e ')+'.'):null,
      h('div',{class:'flex flex-wrap gap-4'},
        h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',class:'checkbox checkbox-sm',checked:o.disp,onchange:e=>{o.disp=e.target.checked;desenhar()}}),'Disponibilidades (−3 a 3) de cada horário'+(o.disp&&R.disp?' — '+R.disp+' tempos':''),h('span',{class:'text-xs opacity-60'},'(só onde ainda não há)')),
        difHoras?h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',class:'checkbox checkbox-sm',checked:o.horas,onchange:e=>{o.horas=e.target.checked;desenhar()}}),'Usar as horas dos tempos do PDF',h('span',{class:'text-xs opacity-60'},'('+pags[0].tempos.filter(t=>t.ini).map(t=>t.n+'.º '+t.ini).slice(0,3).join(', ')+'…)')):null),
      tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},['Dia','Tempo','Disciplina','Turma','Professor','Sala',''].map((t,i)=>h('th',{},i===3?KINDS.c[1]:i===4?KINDS.t[1]:t)))),h('tbody',{},linhas))),
      R.lin.length>250?h('span',{class:'text-xs opacity-60'},'Mostradas 250 de '+R.lin.length+' aulas.'):null].filter(Boolean));
    const bi=$('#updf-ok');if(bi)bi.disabled=!ver&&!R.disp&&!nN&&!R.horas};
  openDlg('Importar horários em PDF',box,[btn('Cancelar',closeDlg),btn('Importar',()=>{closeDlg();let R=null;
    const ok=mutate(()=>{R=updfAplicar(S,pags,o);normalize(S)});if(!ok||!R)return;
    const p=pags.find((pg,i)=>op[i].tipo!=='x'&&pg._el);if(p){const i=pags.indexOf(p);ui.kind=op[i].tipo;ui.id=p._el;ui.visao='ind';ui.sel=null}
    toast('Importado: '+(R.novosTempos+R.colocados)+' tempos colocados'+(R.ja?', '+R.ja+' já estavam':'')+(R.aulasNovas?', '+R.aulasNovas+' aulas novas':'')+'.','Anular',desfazer,'ok');if(location.hash!=='#horarios')location.hash='horarios';else render()},'btn-primary btn-imp',{id:'updf-ok'})],true);
  desenhar()}
