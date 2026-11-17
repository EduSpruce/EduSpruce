// Contraste do texto (WCAG 2.2 AA: 4,5:1; 3:1 em letra grande) em todas as vistas, nos temas claro e escuro, com os dados de
// demonstração. Não faz parte do ./es testa (demora uns 4 minutos): correr quando se mexe em cores, temas ou folhas de estilos.
//   uso: ./es testa   (para construir)   e depois   node modern/tests/contraste.mjs [PASTA=/tmp/es/build] [--rapido]
// Lê todas as formas de cor que o navegador devolve (rgb(…), rgba(…) e color(srgb …), que é o que sai de color-mix) e conta com a
// opacidade dos elementos. Mede ~2 s depois de abrir cada vista, porque a app tem um corretor de contraste que atua nos momentos
// livres (app/115-…, a11yContraste); com --rapido mede logo ao abrir, que é o que a folha de estilos dá sozinha.
// Sai com erro se o tema claro tiver falhas; as do tema escuro são só listadas.
import {servir,navegador,pagina,SESSAO_INIT} from './servidor.mjs';
const dir=process.argv.slice(2).find(a=>!a.startsWith('--'))||'/tmp/es/build';const rapido=process.argv.includes('--rapido');
const s=await servir(dir);const b=await navegador();
const MEDIR=()=>{const raiz=document.querySelector('#view')||document.body;
  const vis=e=>{const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return false;const c=getComputedStyle(e);return c.visibility!=='hidden'&&c.display!=='none'&&+c.opacity>0.05};
  const lum=c=>{const a=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*a[0]+.7152*a[1]+.0722*a[2]};
  const cor=t=>{let m=t.match(/^rgba?\(([^)]+)\)/);if(m){const p=m[1].split(/[,\s\/]+/).filter(Boolean).map(parseFloat);return {c:p.slice(0,3),a:p.length>3?p[3]:1}}
    m=t.match(/^color\(srgb\s+([^)]+)\)/);if(m){const p=m[1].split(/[\s\/]+/).filter(Boolean).map(parseFloat);return {c:[p[0]*255,p[1]*255,p[2]*255],a:p.length>3?p[3]:1}}return null};
  const fundo=e=>{let f=[255,255,255];const pilha=[];for(let p=e;p;p=p.parentElement){const cs=getComputedStyle(p);if(cs.backgroundImage&&cs.backgroundImage!=='none')return null;const g=cor(cs.backgroundColor);if(!g)return null;if(g.a>0){pilha.push(g);if(g.a>=1)break}}
    for(let i=pilha.length-1;i>=0;i--){const g=pilha[i];f=f.map((v,k)=>v*(1-g.a)+g.c[k]*g.a)}return f};
  const maus=[];let n=0,saltados=0;const tw=document.createTreeWalker(raiz,NodeFilter.SHOW_TEXT);let nd;
  while((nd=tw.nextNode())){const tx=nd.nodeValue.trim();if(tx.length<2)continue;const e=nd.parentElement;if(!e||!vis(e))continue;
    if(e.closest('svg,canvas,[disabled],.dis,[aria-disabled=true],[aria-hidden=true],.sr'))continue;const cs=getComputedStyle(e);const f=cor(cs.color);const bg=fundo(e);if(!f||!bg){saltados++;continue}n++;
    let op=1;for(let p=e;p&&p!==document.body;p=p.parentElement)op*=+getComputedStyle(p).opacity;const a=f.a*op;
    const fc=f.c.map((v,k)=>v*a+bg[k]*(1-a));const l1=lum(fc),l2=lum(bg);const cr=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);const sz=parseFloat(cs.fontSize),grande=sz>=24||(sz>=18.66&&+cs.fontWeight>=700);
    if(cr<(grande?3:4.5)-.02)maus.push({t:tx.slice(0,20),cr:+cr.toFixed(2),sz:Math.round(sz*10)/10,cor:f.c.map(Math.round).join(','),fundo:bg.map(Math.round).join(','),
      el:e.tagName.toLowerCase()+(String(e.className||'').trim()?'.'+String(e.className).trim().split(/\s+/).slice(0,3).join('.'):'')+' < '+(e.parentElement?String(e.parentElement.className||e.parentElement.tagName).trim().split(/\s+/).slice(0,2).join('.'):'')})}
  return {n,saltados,maus}};
const R={};
for(const tema of ['light','dark']){
  const P=await pagina(b,{vp:{width:1366,height:768},init:SESSAO_INIT+`;document.addEventListener('DOMContentLoaded',()=>{const st=document.createElement('style');st.textContent='#avpop,#parabens,#toast,#tour,#splash{display:none!important}*{animation:none!important;transition:none!important}';document.head.appendChild(st)})`});const pg=P.pg;
  await pg.goto(s.url);await pg.waitForFunction(()=>window.__esPronto===true,null,{timeout:30000});await pg.waitForTimeout(800);
  const fecha=()=>pg.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(_){}d.remove()});const w=document.getElementById('drawer');if(w)w.classList.remove('open')});
  await fecha();await pg.evaluate(()=>window.EduGest.t.demo());await pg.waitForTimeout(1500);await fecha();
  if(tema==='dark'){await pg.evaluate(()=>window.EduGest.t.go('definicoes'));await pg.waitForTimeout(400);
    await pg.evaluate(()=>{const bt=document.querySelector('[data-tema="dark"]');if(bt)bt.click();else{const S=window.EduGest.t.S();S.cfg.tema='dark';window.EduGest.t.save();document.documentElement.setAttribute('data-theme','dark')}});await pg.waitForTimeout(500)}
  const vistas=await pg.evaluate(()=>window.EduGest.t.vistas());R[tema]={};
  for(const v of vistas){try{await pg.evaluate(v=>window.EduGest.t.go(v),v)}catch(_){}await pg.waitForTimeout(rapido?250:(v==='eduschedule'?3200:1900));await fecha();await pg.waitForTimeout(rapido?60:250);
    try{R[tema][v]=await pg.evaluate(MEDIR)}catch(e){R[tema][v]={erro:String(e.message).slice(0,80),n:0,saltados:0,maus:[]}}}
  await P.ctx.close()}
await b.close();await s.fechar();
let falhasClaro=0;
for(const tema of Object.keys(R)){let tot=0,txt=0,salt=0;const grupos={};
  for(const v of Object.keys(R[tema])){const m=R[tema][v];if(m.erro)console.log(tema,v,'ERRO',m.erro);txt+=m.n;salt+=m.saltados;tot+=m.maus.length;
    for(const x of m.maus){const k=x.el+' | '+x.cor+' sobre '+x.fundo;const g=grupos[k]=grupos[k]||{n:0,min:99,v:new Set(),ex:x.t,sz:x.sz};g.n++;g.min=Math.min(g.min,x.cr);g.v.add(v)}}
  if(tema==='light')falhasClaro=tot;
  console.log('tema '+(tema==='light'?'claro':'escuro')+': '+txt+' textos medidos · '+tot+' abaixo do mínimo'+(salt?' · '+salt+' sobre imagens ou gradientes (não medidos)':''));
  Object.entries(grupos).sort((x,y)=>y[1].n-x[1].n).slice(0,30).forEach(([k,g])=>console.log('  '+String(g.n).padStart(3)+'× '+g.min.toFixed(2)+':1 '+g.sz+'px «'+g.ex+'» '+k+' ['+[...g.v].slice(0,4).join(',')+(g.v.size>4?'…':'')+']'))}
process.exit(falhasClaro?1:0);
