/* =====================================================================
   CALENDÁRIO ESCOLAR — importação do PDF (Excel da escola exportado para PDF)
   A informação está nas CORES das células: a página é desenhada, as cores
   da legenda são lidas e cada dia é classificado pela cor da sua célula.
   A data de cada célula é calculada pela coluna (dia da semana), não pelo
   número escrito (que pode ter gralhas).
   ===================================================================== */
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
let pdfLib=null;
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error('Não foi possível carregar o leitor de PDF (é preciso internet da primeira vez).'));document.head.appendChild(s)})}
async function gunzipB64(id){const el=document.getElementById(id);if(!el||typeof DecompressionStream==='undefined')return null;const bin=Uint8Array.from(atob(el.textContent.trim()),c=>c.charCodeAt(0));return await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
/* pdf.js 3.11.174 incluído no ficheiro (funciona sem internet); a internet só é usada se o browser não suportar a descompressão */
async function getPdfLib(){
  if(pdfLib)return pdfLib;
  if(!window.pdfjsLib){let code=null;try{code=await gunzipB64('pdfgz-lib')}catch(_){}
    if(code)await loadScript(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));else await loadScript(PDFJS+'pdf.min.js')}
  const lib=window.pdfjsLib;let wk=null;try{wk=await gunzipB64('pdfgz-wk')}catch(_){}
  if(wk)lib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([wk],{type:'text/javascript'}));
  else{try{const w=await fetch(PDFJS+'pdf.worker.min.js').then(r=>r.text());lib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([w],{type:'text/javascript'}))}catch(e){lib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js'}}
  return pdfLib=lib;
}
const TIPOS_DIA={
  letivo:{n:'Dia Letivo',cor:'#a8dcf0',ink:'#0b3a52'},
  inicio:{n:'Início do Ano Letivo',cor:'#8b4a12',ink:'#fff'},
  inicio2:{n:'Início 3.º Ciclo e Secundário',cor:'#22a447',ink:'#fff'},
  termo:{n:'Termo das Aulas',cor:'#ffe14d',ink:'#4a3b00'},
  interrupcao:{n:'Interrupção Letiva',cor:'#2a3fd6',ink:'#fff'},
  feriadoN:{n:'Feriado Nacional',cor:'#f59bcd',ink:'#5a0e36'},
  feriadoR:{n:'Feriado Regional',cor:'#e5251f',ink:'#fff'},
  feriadoM:{n:'Feriado Municipal',cor:'#7c2d12',ink:'#fff'},
  nao:{n:'Sem Atividades Letivas',cor:'',ink:''}
};
const LETIVOS=['letivo','inicio','inicio2','termo'];
const MESES_AB={jan:1,fev:2,mar:3,abr:4,mai:5,jun:6,jul:7,ago:8,set:9,out:10,nov:11,dez:12};
const MESES=['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const isoD=(y,m,d)=>y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
const dataDeIso=s=>{const p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])};
const fmtIso=s=>{if(!s)return '';const p=s.split('-');return p[2]+'/'+p[1]};
const fmtIsoL=s=>{if(!s)return '';const d=dataDeIso(s);return DIAS_C[d.getDay()]+', '+d.getDate()+' '+MESES[d.getMonth()+1].slice(0,3).toLowerCase()};
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const sat=c=>Math.max(...c)-Math.min(...c);
/* distância de cor perceptual (CIE Lab, ΔE76) */
function lab(c){const f=v=>{v/=255;return v>0.04045?Math.pow((v+0.055)/1.055,2.4):v/12.92};const r=f(c[0]),g=f(c[1]),b=f(c[2]);
  let x=(r*0.4124+g*0.3576+b*0.1805)/0.95047,y=r*0.2126+g*0.7152+b*0.0722,z=(r*0.0193+g*0.1192+b*0.9505)/1.08883;
  const h=t=>t>0.008856?Math.cbrt(t):7.787*t+16/116;x=h(x);y=h(y);z=h(z);return [116*y-16,500*(x-y),200*(y-z)]}
const dE=(a,b)=>{const p=lab(a),q=lab(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])};
async function lerCalendarioPdf(file){
  const lib=await getPdfLib();
  const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;
  const page=await doc.getPage(1);
  const tc=await page.getTextContent();
  const vp=page.getViewport({scale:3});
  const cv=document.createElement('canvas');cv.width=Math.ceil(vp.width);cv.height=Math.ceil(vp.height);
  const g=cv.getContext('2d',{willReadFrequently:true});
  await page.render({canvasContext:g,viewport:vp}).promise;
  const img=g.getImageData(0,0,cv.width,cv.height).data;
  const pxl=(X,Y)=>{X=Math.round(X);Y=Math.round(Y);if(X<0||Y<0||X>=cv.width||Y>=cv.height)return [255,255,255];const k=(Y*cv.width+X)*4;return [img[k],img[k+1],img[k+2]]};
  const P=(x,y)=>vp.convertToViewportPoint(x,y);
  const items=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>{const t=i.transform;const h=Math.hypot(t[2],t[3])||6;const rot=Math.abs(t[0])<0.01;return {s:i.str.trim(),x:t[4],y:t[5],w:i.width||0,h,rot}});
  const txt=items.map(i=>i.s).join(' ');
  const am=txt.match(/(\d{4})\s*\/\s*(\d{4})/);if(!am)throw new Error('Não encontrei o ano letivo (ex.: 2026/2027) no PDF.');
  const y1=+am[1],y2=+am[2];
  // cor dominante perto de um ponto (ignora branco, preto/cinzento do texto e das linhas)
  const corEm=(X,Y,r)=>{const cont={};let best=null,bn=0;
    for(let dx=-r;dx<=r;dx+=2)for(let dy=-r;dy<=r;dy+=2){const c=pxl(X+dx,Y+dy);if(sat(c)<25)continue;
      const k=c.map(v=>v>>4).join(',');cont[k]=(cont[k]||0)+1;if(cont[k]>bn){bn=cont[k];best=c}}
    return best};
  // ---- cores da legenda ----
  const LEG=[['inicio2',/in[ií]cio do ano letivo para/i],['inicio',/^in[ií]cio do ano letivo$/i],['feriadoR',/feriado regional/i],['feriadoN',/feriado nacional/i],['letivo',/^dia letivo$/i],['interrupcao',/interrup[cç][aã]o letiva/i]];
  const cores={};
  LEG.forEach(([k,re])=>{const it=items.find(i=>re.test(i.s));if(!it)return;
    const [X,Y]=P(it.x,it.y+it.h*0.35);
    for(let d=6;d<150;d+=3){const c=corEm(X-d,Y,4);if(c&&sat(c)>=25){cores[k]=c;break}}});
  // termos: linhas "junho de 2027 para os alunos dos 9º, 11º…" com o número (dia) na caixa amarela à esquerda
  const termos=[];
  items.filter(i=>/(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho)\s+de\s+20/i.test(i.s)&&/\d\s*º|pr[eé]-escolar/i.test(i.s)).forEach(it=>{
    const num=items.filter(o=>/^\d{1,2}$/.test(o.s)&&Math.abs(o.y-it.y)<it.h*0.8&&o.x<it.x&&it.x-o.x<70).sort((a,b)=>b.x-a.x)[0];if(!num)return;
    const mes=MESES_AB[normT(it.s.match(/(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho)/i)[1]).slice(0,3)];
    const [X,Y]=P(num.x+num.w/2,num.y+num.h*0.35);const c=corEm(X+num.w*1.4,Y,5);if(c&&!cores.termo)cores.termo=c;
    const resto=it.s.replace(/.*?de\s+20\s*\d*\s*/i,' ');
    const anos=[...new Set((resto.match(/\b(\d{1,2})\s*º?/g)||[]).map(x=>parseInt(x)).filter(n=>n>=1&&n<=12))];
    if(/pr[eé]-escolar/i.test(it.s))anos.push(0);
    termos.push({data:isoD(mes>=9?y1:y2,mes,+num.s),anos:anos.sort((a,b)=>a-b),texto:it.s.replace(/\s+/g,' ').trim()});
  });
  if(!cores.letivo)throw new Error('Não encontrei a legenda de cores (Dia letivo, Interrupção letiva…).');
  // ---- grelha: colunas a partir do cabeçalho dos dias da semana ----
  const DS={dom:0,seg:1,ter:2,qua:3,qui:4,sex:5,sab:6};
  const hdr=items.filter(i=>DS[normT(i.s).slice(0,3)]!=null&&normT(i.s).length<=4);
  const ys={};hdr.forEach(i=>{const k=Math.round(i.y/4);(ys[k]=ys[k]||[]).push(i)});
  const linhaHdr=Object.values(ys).sort((a,b)=>b.length-a.length)[0]||[];
  const cols=linhaHdr.map(i=>({x:i.rot?i.x-i.h/2:i.x+i.w/2,dow:DS[normT(i.s).slice(0,3)]})).sort((a,b)=>a.x-b.x);
  if(cols.length<20)throw new Error('Não encontrei a grelha dos dias da semana.');
  const esp=(cols[cols.length-1].x-cols[0].x)/(cols.length-1);
  // ---- linhas dos meses ----
  const meses=items.filter(i=>MESES_AB[normT(i.s)]!=null).sort((a,b)=>b.y-a.y);
  const perLab=items.filter(i=>/^[1-3]\s*º\s*p$/i.test(i.s)).map(i=>({n:+i.s[0],y:i.y}));
  const dias={},notas={},perDia={},amostras=[];
  meses.forEach(mi=>{
    const m=MESES_AB[normT(mi.s)],ano=m>=9?y1:y2,nd=new Date(ano,m,0).getDate();
    const dow1=new Date(ano,m-1,1).getDay();
    const naLinha=items.filter(o=>Math.abs(o.y-mi.y)<mi.h*0.5&&o.x>mi.x+mi.w&&o.x<cols[cols.length-1].x+esp*0.6);
    const prim=naLinha.slice().sort((a,b)=>a.x-b.x)[0];if(!prim)return;
    const cIdx=x=>{let b=0,bd=1e9;cols.forEach((c,i)=>{const d=Math.abs(c.x-x);if(d<bd){bd=d;b=i}});return b};
    let c1=cIdx(prim.x+prim.w/2);
    if(cols[c1].dow!==dow1){const alt=[1,-1,2,-2,3,-3].map(k=>c1+k).find(k=>cols[k]&&cols[k].dow===dow1);if(alt!=null)c1=alt}
    const per=(perLab.filter(p=>p.y>mi.y).sort((a,b)=>a.y-b.y)[0]||{}).n||null;
    for(let d=1;d<=nd;d++){
      const c=c1+d-1;if(!cols[c])break;const X0=cols[c].x,Y0=mi.y+mi.h*0.35;
      const [X,Y]=P(X0,Y0);const sx=esp*vp.scale*0.38;
      const cs=[corEm(X-sx,Y,3),corEm(X+sx,Y,3)].filter(Boolean);
      const cor=cs.length?cs.sort((a,b)=>sat(b)-sat(a))[0]:null;
      const iso=isoD(ano,m,d);amostras.push({iso,cor,dow:new Date(ano,m-1,d).getDay()});
      const lt=naLinha.find(o=>Math.abs(o.x+o.w/2-X0)<esp*0.45&&/^[A-Z]$/.test(o.s));
      if(lt)notas[iso]={C:'Carnaval',P:'Páscoa'}[lt.s]||lt.s;
      if(per)perDia[iso]=per;
    }
  });
  // cor dos fins de semana (dominante) = sem atividades letivas
  const fds=amostras.filter(a=>(a.dow===0||a.dow===6)&&a.cor);const grupos=[];
  fds.forEach(a=>{const gr=grupos.find(g=>dE(g.c,a.cor)<12);if(gr)gr.n++;else grupos.push({c:a.cor,n:1})});
  const corNao=grupos.filter(g=>g.n>=fds.length*0.15).map(g=>g.c);
  amostras.forEach(a=>{let tipo='nao';
    if(a.cor&&!corNao.some(c=>dE(c,a.cor)<14)){let bd=45;Object.entries(cores).forEach(([k,ref])=>{const dd=dE(a.cor,ref);if(dd<bd){bd=dd;tipo=k}})}
    dias[a.iso]=tipo});
  const pv=document.createElement('canvas');pv.width=760;pv.height=Math.round(cv.height*760/cv.width);pv.getContext('2d').drawImage(cv,0,0,pv.width,pv.height);
  return montarCalendario({preview:pv.toDataURL('image/jpeg',.72),dias,notas,perDia,termos,anoLetivo:y1+'/'+y2,ficheiro:file.name,cores:Object.fromEntries(Object.entries(cores).map(([k,c])=>[k,'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')]))});
}
/* calcula períodos e marcos a partir dos dias classificados */
function montarCalendario(c){
  const isos=Object.keys(c.dias).sort();
  const let_=isos.filter(i=>LETIVOS.includes(c.dias[i]));
  c.inicio=isos.find(i=>c.dias[i]==='inicio')||let_[0]||'';
  c.inicio2=isos.find(i=>c.dias[i]==='inicio2')||'';
  const ns=[...new Set(Object.values(c.perDia||{}))].sort();
  c.periodos=(ns.length?ns:[1]).map(n=>{const L=let_.filter(i=>!c.perDia||!Object.keys(c.perDia).length||c.perDia[i]===n);return {n,ini:L[0]||'',fim:L[L.length-1]||'',dias:L.length}}).filter(p=>p.ini);
  if(c.termos&&c.termos.length){const ult=c.termos.map(t=>t.data).sort().pop();const p=c.periodos[c.periodos.length-1];if(p&&ult>p.fim)p.fim=ult}
  c.importado=new Date().toISOString();
  return c;
}
