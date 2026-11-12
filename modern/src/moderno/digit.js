/* ===================== Digitalização dos testes escritos (v0.943) =====================
   Em cada instrumento escrito (todos menos a Produção Oral) o professor pode guardar a folha de teste / enunciado realizado de cada aluno:
   no telemóvel digitaliza a página 1, a 2, a 3… (deteta a folha, endireita e limpa, como uma app de digitalização) e só no fim envia tudo.
   Depois de guardado, o documento fica SELADO: não se pode alterar nem substituir. Em caso de engano pode ser APAGADO (fica na auditoria).
   Vê-se em «livro». As páginas vão cifradas com a chave da conta e só são descarregadas quando se abre o livro. */
const DG_PREF='ef-f-dg-',DG_LADO=1700,DG_Q=.72,DG_MAXP=24;
const dgEscrito=i=>!!i&&!i.oral&&!/oral/i.test((i.tipo||'')+' '+(i.nome||''));
const dgMeta=(t,iid)=>{t.digit=t.digit&&typeof t.digit==='object'?t.digit:{};return t.digit[iid]=t.digit[iid]||{}};
const dgTem=(t,iid,aid)=>((t.digit||{})[iid]||{})[aid]||null;
const dgConta=(t,i)=>Object.keys((t.digit||{})[i.id]||{}).filter(aid=>t.alunos.some(a=>a.id===aid)).length;
const dgNome=(id,n)=>DG_PREF+id+'-'+n;
const dgSha=async s=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
/* fotografia → JPEG leve e legível (lado maior 1700 px) */
async function dgImagem(file){let bmp=null;try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(_){}
  if(!bmp){bmp=await new Promise((ok,ko)=>{const im=new Image();const u=URL.createObjectURL(file);im.onload=()=>{URL.revokeObjectURL(u);ok(im)};im.onerror=()=>{URL.revokeObjectURL(u);ko(new Error('Não foi possível ler a fotografia.'))};im.src=u})}
  const w0=bmp.width||bmp.naturalWidth,h0=bmp.height||bmp.naturalHeight;const f=Math.min(1,DG_LADO/Math.max(w0,h0));const w=Math.round(w0*f),h=Math.round(h0*f);
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(bmp,0,0,w,h);try{bmp.close&&bmp.close()}catch(_){}
  return {url:c.toDataURL('image/jpeg',DG_Q),w,h}}
/* enviar e selar */
async function dgGuardar(t,i,a,pags,prog){if(dgTem(t,i.id,a.id))throw new Error('Este aluno já tem a digitalização guardada neste instrumento.');
  const p=await sbObter();const k=await nvChave();if(!k)throw new Error('Os dados ainda não estão abertos.');const id=uid();const H=[];let bytes=0;
  for(let n=0;n<pags.length;n++){prog&&prog(n,pags.length);const url=pags[n].url;H.push(await dgSha(url));const txt=await nvCifrar(url,k);bytes+=txt.length;
    let ok=false,err=null;for(let ten=0;ten<3&&!ok;ten++){try{ok=await p.criar(dgNome(id,n+1),txt);if(!ok){ok=true}}catch(e){err=e;await new Promise(r=>setTimeout(r,800*(ten+1)))}}
    if(!ok)throw new Error('Não foi possível enviar a página '+(n+1)+': '+((err&&err.message)||'sem ligação')+'. Nada ficou guardado — tente de novo.')}
  prog&&prog(pags.length,pags.length);
  dgMeta(t,i.id)[a.id]={id,n:pags.length,q:Date.now(),h:H,b:bytes,por:(SESSAO&&SESSAO.u)||'',d:[pags[0].w,pags[0].h]};save();
  try{audit('Avaliação','Teste digitalizado (selado)',t.nome+' · '+i.nome+' · n.º '+(a.num||'')+' · '+pags.length+' pág.')}catch(_){}}
const _dgCache=new Map();
async function dgLerPag(m,n){const ch=m.id+'-'+n;if(_dgCache.has(ch))return _dgCache.get(ch);const pr=(async()=>{const p=await sbObter();const txt=await p.ler(dgNome(m.id,n));if(txt==null)throw new Error('Página '+n+' não encontrada na base de dados.');
    const url=await nvDecifrar(txt,await nvChave());const ok=!m.h||!m.h[n-1]||(await dgSha(url))===m.h[n-1];return {url,ok}})();_dgCache.set(ch,pr);pr.catch(()=>_dgCache.delete(ch));
  if(_dgCache.size>60){const k0=_dgCache.keys().next().value;_dgCache.delete(k0)}return pr}

/* ===================== Digitalizador de documentos (v0.969) =====================
   Sem bibliotecas externas: deteta a folha (limiar de Otsu + maior mancha clara), endireita em perspetiva e limpa o fundo
   («documento»: papel branco, texto nítido). O original fica em memória até se guardar, para se poder reajustar. */
const DG_FILTROS=[['doc','Documento'],['pb','Preto e Branco'],['cinza','Cinzento'],['cor','Fotografia']];
/* ficheiro/vídeo → canvas de origem (lado maior até 2400 px) */
async function dgFonte(f){let bmp=null;if(f instanceof HTMLCanvasElement||f instanceof HTMLVideoElement)bmp=f;else{try{bmp=await createImageBitmap(f,{imageOrientation:'from-image'})}catch(_){}
    if(!bmp){bmp=await new Promise((ok,ko)=>{const im=new Image();const u=URL.createObjectURL(f);im.onload=()=>{URL.revokeObjectURL(u);ok(im)};im.onerror=()=>{URL.revokeObjectURL(u);ko(new Error('Não foi possível ler a fotografia.'))};im.src=u})}}
  const w0=bmp.videoWidth||bmp.naturalWidth||bmp.width,h0=bmp.videoHeight||bmp.naturalHeight||bmp.height;if(!w0||!h0)throw new Error('Imagem vazia.');const k=Math.min(1,2400/Math.max(w0,h0));const c=document.createElement('canvas');c.width=Math.round(w0*k);c.height=Math.round(h0*k);
  const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(bmp,0,0,c.width,c.height);try{bmp.close&&bmp.close()}catch(_){}return c}
/* cantos da folha em frações [tl,tr,br,bl]; null se não encontrar uma folha credível */
function dgCantos(src){try{const W=200,H=Math.max(40,Math.round(W*(src.videoHeight||src.height)/(src.videoWidth||src.width)));const c=dgCantos._c||(dgCantos._c=document.createElement('canvas'));c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(src,0,0,W,H);
    const D=x.getImageData(0,0,W,H).data;const N=W*H;let g=new Float32Array(N);for(let i=0;i<N;i++){const q=i*4;const mx=Math.max(D[q],D[q+1],D[q+2]),mn=Math.min(D[q],D[q+1],D[q+2]);g[i]=(.299*D[q]+.587*D[q+1]+.114*D[q+2])-(mx-mn)*.6}
    /* desfoque 5x5 separável */
    const bl=(a)=>{const t=new Float32Array(N),o=new Float32Array(N);for(let y=0;y<H;y++)for(let x_=0;x_<W;x_++){let s_=0,n=0;for(let k=-2;k<=2;k++){const xx=x_+k;if(xx>=0&&xx<W){s_+=a[y*W+xx];n++}}t[y*W+x_]=s_/n}for(let y=0;y<H;y++)for(let x_=0;x_<W;x_++){let s_=0,n=0;for(let k=-2;k<=2;k++){const yy=y+k;if(yy>=0&&yy<H){s_+=t[yy*W+x_];n++}}o[y*W+x_]=s_/n}return o};g=bl(g);
    let mn=1e9,mx=-1e9;for(let i=0;i<N;i++){if(g[i]<mn)mn=g[i];if(g[i]>mx)mx=g[i]}if(mx-mn<25)return null;const hist=new Uint32Array(256);const q8=new Uint8Array(N);for(let i=0;i<N;i++){const v=Math.round((g[i]-mn)/(mx-mn)*255);q8[i]=v;hist[v]++}
    let sum=0;for(let i=0;i<256;i++)sum+=i*hist[i];let sB=0,wB=0,best=0,th=128;for(let i=0;i<256;i++){wB+=hist[i];if(!wB)continue;const wF=N-wB;if(!wF)break;sB+=i*hist[i];const mB=sB/wB,mF=(sum-sB)/wF;const v=wB*wF*(mB-mF)*(mB-mF);if(v>best){best=v;th=i}}
    /* maior mancha clara */
    const lab=new Int32Array(N);let melhor=0,mk=0,k=0;const st=new Int32Array(N);for(let i=0;i<N;i++){if(q8[i]<=th||lab[i])continue;k++;let top=0,n=0;st[top++]=i;lab[i]=k;while(top){const p=st[--top];n++;const px=p%W,py=(p-px)/W;
        if(px>0&&q8[p-1]>th&&!lab[p-1]){lab[p-1]=k;st[top++]=p-1}if(px<W-1&&q8[p+1]>th&&!lab[p+1]){lab[p+1]=k;st[top++]=p+1}if(py>0&&q8[p-W]>th&&!lab[p-W]){lab[p-W]=k;st[top++]=p-W}if(py<H-1&&q8[p+W]>th&&!lab[p+W]){lab[p+W]=k;st[top++]=p+W}}if(n>melhor){melhor=n;mk=k}}
    if(melhor<N*.12)return null;let a=[1e9,0,0],b_=[-1e9,0,0],c_=[-1e9,0,0],d_=[1e9,0,0];for(let y=0;y<H;y++)for(let x_=0;x_<W;x_++){if(lab[y*W+x_]!==mk)continue;const s1=x_+y,s2=x_-y;if(s1<a[0])a=[s1,x_,y];if(s1>b_[0])b_=[s1,x_,y];if(s2>c_[0])c_=[s2,x_,y];if(s2<d_[0])d_=[s2,x_,y]}
    let Q=[[a[1],a[2]],[c_[1],c_[2]],[b_[1],b_[2]],[d_[1],d_[2]]].map(([px,py])=>[px/(W-1),py/(H-1)]);{const cx=Q.reduce((s_,p)=>s_+p[0],0)/4,cy=Q.reduce((s_,p)=>s_+p[1],0)/4;Q=Q.map(([px,py])=>[px+(cx-px)*.02,py+(cy-py)*.02])}
    const area=Math.abs(Q.reduce((s_,p,i)=>{const n=Q[(i+1)%4];return s_+p[0]*n[1]-n[0]*p[1]},0))/2;if(area<.15)return null;
    /* a mancha tem de preencher bem o quadrilátero (senão não é uma folha) e não ser a imagem inteira */
    if(melhor/N<area*.7)return null;if(area>.97)return null;
    /* lados com comprimento razoável */
    const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);if(Math.min(dist(Q[0],Q[1]),dist(Q[1],Q[2]),dist(Q[2],Q[3]),dist(Q[3],Q[0]))<.18)return null;return Q}catch(_){return null}}
const DG_TUDO=()=>[[0,0],[1,0],[1,1],[0,1]];
/* endireita o quadrilátero para um retângulo */
function dgEndireitar(src,Q,rot){const sw=src.width,sh=src.height;const P=Q.map(([x,y])=>[x*(sw-1),y*(sh-1)]);const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  let W=Math.max(dist(P[0],P[1]),dist(P[3],P[2])),H=Math.max(dist(P[0],P[3]),dist(P[1],P[2]));const k=Math.min(1,DG_LADO/Math.max(W,H));W=Math.max(8,Math.round(W*k));H=Math.max(8,Math.round(H*k));
  const out=document.createElement('canvas');out.width=W;out.height=H;const ox=out.getContext('2d',{willReadFrequently:true});
  const inteiro=Q.every((p,i)=>Math.abs(p[0]-DG_TUDO()[i][0])<.004&&Math.abs(p[1]-DG_TUDO()[i][1])<.004);
  if(inteiro){ox.drawImage(src,0,0,W,H)}else{const S=src.getContext('2d',{willReadFrequently:true}).getImageData(0,0,sw,sh).data;const O=ox.createImageData(W,H);const od=O.data;
    const [x0,y0]=P[0],[x1,y1]=P[1],[x2,y2]=P[2],[x3,y3]=P[3];const dx1=x1-x2,dx2=x3-x2,sx=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,sy=y0-y1+y2-y3;let a,b,c,d_,e,f,g=0,h=0;
    if(Math.abs(sx)<1e-6&&Math.abs(sy)<1e-6){a=x1-x0;b=x2-x1;c=x0;d_=y1-y0;e=y2-y1;f=y0}else{const den=dx1*dy2-dx2*dy1||1e-9;g=(sx*dy2-dx2*sy)/den;h=(dx1*sy-sx*dy1)/den;a=x1-x0+g*x1;b=x3-x0+h*x3;c=x0;d_=y1-y0+g*y1;e=y3-y0+h*y3;f=y0}
    for(let y=0;y<H;y++){const v=H>1?y/(H-1):0;for(let x=0;x<W;x++){const u=W>1?x/(W-1):0;const w=g*u+h*v+1;let fx=(a*u+b*v+c)/w,fy=(d_*u+e*v+f)/w;if(fx<0)fx=0;else if(fx>sw-1.001)fx=sw-1.001;if(fy<0)fy=0;else if(fy>sh-1.001)fy=sh-1.001;
        const ix=fx|0,iy=fy|0,tx=fx-ix,ty=fy-iy;const p=(iy*sw+ix)*4,q=p+4,r=p+sw*4,s_=r+4,o=(y*W+x)*4;const w00=(1-tx)*(1-ty),w10=tx*(1-ty),w01=(1-tx)*ty,w11=tx*ty;
        od[o]=S[p]*w00+S[q]*w10+S[r]*w01+S[s_]*w11;od[o+1]=S[p+1]*w00+S[q+1]*w10+S[r+1]*w01+S[s_+1]*w11;od[o+2]=S[p+2]*w00+S[q+2]*w10+S[r+2]*w01+S[s_+2]*w11;od[o+3]=255}}ox.putImageData(O,0,0)}
  rot=((rot||0)%4+4)%4;if(!rot)return out;const r=document.createElement('canvas');const q=rot%2;r.width=q?H:W;r.height=q?W:H;const rx=r.getContext('2d',{willReadFrequently:true});rx.translate(r.width/2,r.height/2);rx.rotate(rot*Math.PI/2);rx.drawImage(out,-W/2,-H/2);return r}
/* filtro de documento: divide pela iluminação do papel (tira sombras), papel branco e texto escuro */
function dgFiltrar(cv,modo){if(modo==='cor')return cv;const W=cv.width,H=cv.height;const x=cv.getContext('2d',{willReadFrequently:true});const I=x.getImageData(0,0,W,H);const D=I.data;
  if(modo==='cinza'){for(let i=0;i<D.length;i+=4){const l=.299*D[i]+.587*D[i+1]+.114*D[i+2];D[i]=D[i+1]=D[i+2]=l}x.putImageData(I,0,0);return cv}
  const B=Math.max(8,Math.round(Math.max(W,H)/48));const bw=Math.ceil(W/B),bh=Math.ceil(H/B);let bg=new Float32Array(bw*bh);
  /* por bloco: percentil alto da luminância (o papel) */
  const hist=new Uint16Array(256);for(let by=0;by<bh;by++)for(let bx=0;bx<bw;bx++){hist.fill(0);let n=0;const yM=Math.min(H,(by+1)*B),xM=Math.min(W,(bx+1)*B);for(let y=by*B;y<yM;y+=2)for(let x_=bx*B;x_<xM;x_+=2){const q=(y*W+x_)*4;hist[(.299*D[q]+.587*D[q+1]+.114*D[q+2])|0]++;n++}let ac=0,v=255;const alvo=n*.12;for(let k=255;k>=0;k--){ac+=hist[k];if(ac>=alvo){v=k;break}}bg[by*bw+bx]=Math.max(40,v)}
  /* suavizar o mapa de fundo */
  for(let it=0;it<2;it++){const o=new Float32Array(bw*bh);for(let y=0;y<bh;y++)for(let x_=0;x_<bw;x_++){let s_=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const yy=y+dy,xx=x_+dx;if(yy>=0&&yy<bh&&xx>=0&&xx<bw){s_+=bg[yy*bw+xx];n++}}o[y*bw+x_]=s_/n}bg=o}
  const pb=modo==='pb';const lo=pb?.45:.2,hi=pb?.82:.9;for(let y=0;y<H;y++){const fy=Math.min(bh-1.001,Math.max(0,y/B-.5));const iy=fy|0,ty=fy-iy;for(let x_=0;x_<W;x_++){const fx=Math.min(bw-1.001,Math.max(0,x_/B-.5));const ix=fx|0,tx=fx-ix;
      const p=iy*bw+ix;const b0=bg[p]*(1-tx)+bg[Math.min(p+1,bw*bh-1)]*tx,b1=bg[Math.min(p+bw,bw*bh-1)]*(1-tx)+bg[Math.min(p+bw+1,bw*bh-1)]*tx;const f=1/(b0*(1-ty)+b1*ty);const q=(y*W+x_)*4;
      if(pb){let v=(.299*D[q]+.587*D[q+1]+.114*D[q+2])*f;v=(v-lo)/(hi-lo);v=v<0?0:v>1?1:v;D[q]=D[q+1]=D[q+2]=v*255}
      else for(let c=0;c<3;c++){let v=D[q+c]*f;v=(v-lo)/(hi-lo);v=v<0?0:v>1?1:v;D[q+c]=v*255}}}
  x.putImageData(I,0,0);return cv}
/* página = original + cantos + rotação + filtro → imagem final */
function dgProcessar(p){const cv=dgFiltrar(dgEndireitar(p.src,p.q,p.rot),p.filtro);p.url=cv.toDataURL('image/jpeg',DG_Q);p.w=cv.width;p.h=cv.height;return p}
async function dgPagina(src){const q=dgCantos(src);const p={src,q:q||DG_TUDO(),auto:!!q,rot:0,filtro:(typeof S!=='undefined'&&S.cfg.dgFiltro)||'doc'};await new Promise(r=>setTimeout(r,0));return dgProcessar(p)}
/* câmara contínua dentro da janela */
let _dgStream=null,_dgTick=0;
function dgCamParar(){clearInterval(_dgTick);_dgTick=0;if(_dgStream){try{_dgStream.getTracks().forEach(t=>t.stop())}catch(_){}_dgStream=null}}
async function dgCamara(d,P,a,voltar,alternativa){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return alternativa();let st;try{st=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:2560},height:{ideal:1920}}})}catch(e){toast('Sem acesso à câmara nesta janela — a abrir a câmara do aparelho','aviso');return alternativa()}
  dgCamParar();_dgStream=st;d.dataset.modo='cam';d._sairCap=()=>{dgCamParar();d.dataset.modo='cap';voltar()};
  d.innerHTML=`<div class="dgcam"><video id="dc-v" playsinline autoplay muted></video><canvas id="dc-o"></canvas><div class="dcflash" id="dc-f"></div>
    <header class="dctop"><button type="button" class="dcb" id="dc-x" aria-label="Terminar">${ic('x',20)}</button><span class="dcinfo" id="dc-i">A procurar a folha…</span><button type="button" class="dcb" id="dc-l" aria-label="Lanterna" hidden>${ic('sun',20)}</button></header>
    <footer class="dcbot"><div class="dcthumbs" id="dc-t"></div><div class="dcrow"><span class="dccount" id="dc-n">${P.length} pág.</span><button type="button" class="dcshot" id="dc-s" aria-label="Fotografar a página"><i></i></button><button type="button" class="dcdone" id="dc-ok">${ic('check',18)} Concluir</button></div></footer></div>`;
  const v=d.querySelector('#dc-v'),o=d.querySelector('#dc-o'),info=d.querySelector('#dc-i');v.srcObject=st;try{await v.play()}catch(_){}
  let Q=null,estavel=0;const thumbs=()=>{d.querySelector('#dc-t').innerHTML=P.slice(-6).map(p=>`<img src="${p.url}" alt="">`).join('');d.querySelector('#dc-n').textContent=P.length+' pág.'};thumbs();
  const desenha=()=>{const r=v.getBoundingClientRect();if(!r.width||!v.videoWidth)return;o.width=r.width;o.height=r.height;const x=o.getContext('2d');x.clearRect(0,0,o.width,o.height);if(!Q)return;
    /* o vídeo está em «cover»: converter frações do vídeo em píxeis do ecrã */
    const k=Math.max(r.width/v.videoWidth,r.height/v.videoHeight);const dw=v.videoWidth*k,dh=v.videoHeight*k,ox=(r.width-dw)/2,oy=(r.height-dh)/2;x.beginPath();Q.forEach(([px,py],i)=>{const X=ox+px*dw,Y=oy+py*dh;i?x.lineTo(X,Y):x.moveTo(X,Y)});x.closePath();x.fillStyle='rgba(34,197,94,.18)';x.fill();x.lineWidth=3;x.strokeStyle='#22c55e';x.stroke()};
  _dgTick=setInterval(()=>{if(!v.videoWidth||d.dataset.modo!=='cam')return;const q=dgCantos(v);if(q){estavel=Q&&q.every((p,i)=>Math.hypot(p[0]-Q[i][0],p[1]-Q[i][1])<.03)?estavel+1:0;Q=q;info.textContent=estavel>=2?'Folha detetada — pode fotografar':'Folha detetada — mantenha firme'}else{Q=null;estavel=0;info.textContent='Aponte para a folha (fundo mais escuro ajuda)'}desenha()},350);
  try{const tr=st.getVideoTracks()[0];const caps=tr.getCapabilities&&tr.getCapabilities();if(caps&&caps.torch){const l=d.querySelector('#dc-l');l.hidden=false;let on=false;l.onclick=()=>{on=!on;tr.applyConstraints({advanced:[{torch:on}]}).catch(()=>{});l.classList.toggle('on',on)}}}catch(_){}
  let ocupado=false;const tirar=async()=>{if(ocupado||!v.videoWidth)return;if(P.length>=DG_MAXP)return toast('Máximo de '+DG_MAXP+' páginas','aviso');ocupado=true;const fl=d.querySelector('#dc-f');fl.classList.add('on');setTimeout(()=>fl.classList.remove('on'),160);try{navigator.vibrate&&navigator.vibrate(20)}catch(_){}
    try{const src=await dgFonte(v);const p={src,q:Q||dgCantos(src)||DG_TUDO(),rot:0,filtro:S.cfg.dgFiltro||'doc'};p.auto=!p.q.every((z,i)=>z[0]===DG_TUDO()[i][0]&&z[1]===DG_TUDO()[i][1]);await new Promise(r=>setTimeout(r,30));P.push(dgProcessar(p));thumbs()}catch(e){toast((e&&e.message)||'Não foi possível fotografar','erro')}ocupado=false};
  d.querySelector('#dc-s').onclick=tirar;d.querySelector('#dc-ok').onclick=d.querySelector('#dc-x').onclick=()=>d._sairCap()}
/* acertar uma página: cantos, rodar, filtro */
function dgEditar(d,p,num,voltar){if(!p)return;const ant={q:p.q.map(z=>z.slice()),rot:p.rot,filtro:p.filtro};d.dataset.modo='edit';let Q=p.q.map(z=>z.slice());const prev=d._sairCap;d._sairCap=()=>{Object.assign(p,ant);d._sairCap=prev;d.dataset.modo='cap';voltar()};
  d.innerHTML=`<div class="dgw dged"><header class="dgh"><button type="button" class="btn ico" id="de-v" aria-label="Cancelar">${ic('back',16)}</button><div><h2>Página ${num}</h2><p class="mut">Arraste os cantos para a folha. Depois escolha o filtro.</p></div><button type="button" class="btn pri" id="de-ok">${ic('check',15)} Aplicar</button></header>
    <div class="deimg" id="de-b"><div class="dewrap" id="de-w"><img id="de-i" alt="Original da página ${num}" draggable="false"><svg id="de-s" viewBox="0 0 1000 1000" preserveAspectRatio="none"><polygon id="de-p"></polygon></svg>${[0,1,2,3].map(k=>`<button type="button" class="deh" data-h="${k}" aria-label="Canto ${k+1}"></button>`).join('')}</div></div>
    <div class="row degr">${DG_FILTROS.map(([k,n])=>`<button type="button" class="btn sm ${p.filtro===k?'pri':''}" data-def="${k}">${n}</button>`).join('')}<span class="sp1"></span><button type="button" class="btn sm" id="de-r">${ic('refresh',14)} Rodar</button><button type="button" class="btn sm" id="de-a">Detetar Folha</button><button type="button" class="btn sm" id="de-t">Imagem Inteira</button></div></div>`;
  const im=d.querySelector('#de-i'),w=d.querySelector('#de-w');im.src=p.src.toDataURL('image/jpeg',.7);let rot=p.rot,filtro=p.filtro;
  const pos=()=>{d.querySelector('#de-p').setAttribute('points',Q.map(([x,y])=>(x*1000)+','+(y*1000)).join(' '));d.querySelectorAll('.deh').forEach(h=>{const [x,y]=Q[+h.dataset.h];h.style.left=(x*100)+'%';h.style.top=(y*100)+'%'})};pos();
  d.querySelectorAll('.deh').forEach(h=>{h.addEventListener('pointerdown',e=>{e.preventDefault();try{h.setPointerCapture(e.pointerId)}catch(_){}const mv=ev=>{const r=w.getBoundingClientRect();Q[+h.dataset.h]=[Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height))];pos()};const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up)};h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up)})});
  d.querySelectorAll('[data-def]').forEach(b=>b.onclick=()=>{filtro=b.dataset.def;d.querySelectorAll('[data-def]').forEach(z=>z.classList.toggle('pri',z===b))});
  d.querySelector('#de-r').onclick=()=>{rot=(rot+1)%4;toast('Rodada '+(rot*90)+'° — vê-se ao aplicar','ok')};d.querySelector('#de-a').onclick=()=>{const q=dgCantos(p.src);if(q){Q=q;pos()}else toast('Não encontrei a folha — arraste os cantos','aviso')};d.querySelector('#de-t').onclick=()=>{Q=DG_TUDO();pos()};
  d.querySelector('#de-v').onclick=()=>d._sairCap();d.querySelector('#de-ok').onclick=()=>{p.q=Q;p.rot=rot;p.filtro=filtro;try{S.cfg.dgFiltro=filtro;save()}catch(_){}const b=d.querySelector('#de-ok');b.disabled=true;b.textContent='A tratar…';setTimeout(()=>{try{dgProcessar(p)}catch(e){Object.assign(p,ant);dgProcessar(p);toast('Não foi possível aplicar','erro')}d._sairCap=prev;d.dataset.modo='cap';voltar()},30)}}
/* apagar uma digitalização guardada por engano */
async function dgApagar(t,i,a){const m=dgTem(t,i.id,a.id);if(!m)return false;if(!confirm('Apagar a digitalização do teste de '+a.nome+' ('+m.n+' pág.)?\n\nNão pode ser recuperada. Fica registado na auditoria.'))return false;
  delete dgMeta(t,i.id)[a.id];(t.digitApag=t.digitApag||[]).push({iid:i.id,aid:a.id,id:m.id,n:m.n,q:m.q,apagada:Date.now(),por:(SESSAO&&SESSAO.u)||''});if(t.digitApag.length>200)t.digitApag.splice(0,t.digitApag.length-200);save();saveNow();
  try{audit('Avaliação','Digitalização apagada',t.nome+' · '+i.nome+' · n.º '+(a.num||'')+' · '+m.n+' pág.')}catch(_){}
  /* as páginas cifradas: tenta apagá-las da base de dados (se a regra da base de dados não deixar, ficam inacessíveis) */
  (async()=>{try{const p=await sbObter();for(let n=1;n<=m.n;n++){_dgCache.delete(m.id+'-'+n);try{await p.apagar(dgNome(m.id,n))}catch(_){}}}catch(_){}})();
  toast('Digitalização de '+a.nome.split(' ')[0]+' apagada — pode repetir','ok');return true}

/* ---------- janela principal: lista de alunos do instrumento ---------- */
function dgPainel(iid,alunoDireto){const t=T();const i=t&&t.instrumentos.find(x=>x.id===iid);if(!i)return;if(!dgEscrito(i))return toast('A Produção Oral não tem folha de teste para digitalizar.','aviso');
  if(!window.__esPronto)return toast('Os dados ainda estão a abrir.','erro');
  $$('dialog.dgdlg').forEach(d=>d.remove());const d=document.createElement('dialog');d.className='dgdlg';d.setAttribute('aria-labelledby','dg-t');document.body.appendChild(d);
  const fim=()=>{dgCamParar();try{d.close()}catch(_){}d.remove();try{if(VIEW==='instrumentos')vInstrumentos()}catch(_){}};d.addEventListener('cancel',e=>{e.preventDefault();if(d.dataset.ocup)return;if(d.dataset.modo==='cap'){d._sairCap&&d._sairCap();return}fim()});
  const AL=(typeof alunosAval==='function'?alunosAval(t):t.alunos).slice().sort((a,b)=>(+a.num||0)-(+b.num||0));
  const lista=()=>{d.dataset.modo='lista';const feitos=AL.filter(a=>dgTem(t,i.id,a.id)).length;
    d.innerHTML=`<div class="dgw"><header class="dgh"><div><h2 id="dg-t">${ic('camera',18)} Testes Digitalizados</h2><p class="mut">${esc(t.nome)} · ${esc(i.nome)}${i.data?' · '+fmtD(i.data):''}</p></div><button type="button" class="btn ico" id="dg-x" aria-label="Fechar">${ic('x',16)}</button></header>
      <div class="dgprog"><div><i style="width:${AL.length?Math.round(100*feitos/AL.length):0}%"></i></div><span><b>${feitos}</b> de ${AL.length} alunos</span></div>
      <p class="hint" style="margin:0">Toque num aluno para digitalizar as páginas do teste (1, 2, 3…) e enviar no fim. Depois de guardada, a digitalização fica <b>selada</b>: não pode ser alterada. Se se enganar, pode apagá-la e repetir.</p>
      <ul class="dgl">${AL.map(a=>{const m=dgTem(t,i.id,a.id);return `<li class="dgli"><button type="button" data-dga="${esc(a.id)}" class="${m?'ok':''}"><span class="dgn">${esc(a.num||'')}</span><span class="dgnm">${esc(a.nome)}</span>${m?`<span class="dgst ok">${ic('cadeado',13)} ${m.n} pág. · ${new Date(m.q).toLocaleDateString('pt-PT',{day:'numeric',month:'short'})}</span><span class="dgver">${ic('book',15)} Ver</span>`:`<span class="dgst">por digitalizar</span><span class="dgver pri">${ic('camera',15)} Digitalizar</span>`}</button>${m?`<button type="button" class="dgdel" data-dgx="${esc(a.id)}" title="Apagar esta digitalização (em caso de engano)" aria-label="Apagar a digitalização de ${esc(a.nome)}">${ic('trash',15)}</button>`:''}</li>`}).join('')}</ul></div>`;
    d.querySelector('#dg-x').onclick=fim;d.querySelectorAll('[data-dgx]').forEach(b=>b.onclick=async()=>{const a=AL.find(z=>z.id===b.dataset.dgx);if(a&&await dgApagar(t,i,a))lista()});d.querySelectorAll('[data-dga]').forEach(b=>b.onclick=()=>{const a=AL.find(z=>z.id===b.dataset.dga);const m=dgTem(t,i.id,a.id);if(m)dgLivro(t,i,a);else captar(a)})};
  /* captar: digitalizador (câmara contínua, deteção da folha, endireitar, filtro de documento); só no fim se envia */
  const captar=a=>{d.dataset.modo='cap';const P=[];let ocup=false;
    const sair=()=>{if(ocup)return;if(P.length&&!confirm('Sair sem guardar as '+P.length+' página(s) digitalizada(s)?'))return;dgCamParar();lista()};d._sairCap=sair;
    const pinta=()=>{dgCamParar();d.innerHTML=`<div class="dgw dgcap"><header class="dgh"><button type="button" class="btn ico" id="dg-v" aria-label="Voltar à lista">${ic('back',16)}</button><div><h2 id="dg-t">N.º ${esc(a.num||'')} · ${esc(a.nome)}</h2><p class="mut">${esc(i.nome)} · ${P.length?P.length+' página'+(P.length>1?'s':'')+' digitalizada'+(P.length>1?'s':''):'nenhuma página ainda'}</p></div></header>
        <div class="dgthumbs" id="dg-th">${P.map((p,n)=>`<figure><img src="${p.url}" alt="Página ${n+1}" data-dge="${n}" title="Tocar para ajustar o recorte, rodar ou mudar o filtro"><figcaption>Pág. ${n+1}</figcaption><div class="dgta">${n>0?`<button type="button" data-dgm="${n}|-1" aria-label="Mover a página ${n+1} para antes">${ic('back',13)}</button>`:''}<button type="button" data-dge="${n}" aria-label="Ajustar a página ${n+1}">${ic('pencil',13)}</button><button type="button" data-dgr="${n}" aria-label="Tirar a página ${n+1}">${ic('trash',13)}</button></div></figure>`).join('')}
          ${P.length<DG_MAXP?`<button type="button" class="dgadd" id="dg-scan">${ic('camera',26)}<b>${P.length?'Digitalizar a página '+(P.length+1):'Digitalizar a página 1'}</b><small>várias páginas de seguida</small></button>`:''}</div>
        <p class="nverr" role="alert" id="dg-e"></p>
        <div class="row dga">${P.length<DG_MAXP?`<label class="btn" tabindex="0">${ic('upload',15)} Escolher da Galeria<input type="file" accept="image/*" multiple id="dg-gal" hidden></label><label class="btn" tabindex="0" title="Usa a app de câmara do aparelho, uma fotografia de cada vez">${ic('camera',15)} Câmara do Aparelho<input type="file" accept="image/*" capture="environment" id="dg-cam" hidden></label>`:''}<span class="sp1"></span><button type="button" class="btn pri" id="dg-ok" ${P.length?'':'disabled'}>${ic('cadeado',15)} Guardar ${P.length||''} Página${P.length===1?'':'s'}</button></div>
        <p class="hint" style="margin:0">A folha é detetada, endireitada e limpa automaticamente. Toque numa página para acertar os cantos, rodar ou mudar o filtro. Só ao «Guardar» é que as páginas são enviadas e seladas.</p></div>`;
      d.querySelector('#dg-v').onclick=sair;
      const junta=async files=>{const e=d.querySelector('#dg-e');const ad=d.querySelector('#dg-scan');if(ad)ad.querySelector('b').textContent='A tratar…';for(const f of [...files]){if(P.length>=DG_MAXP)break;try{P.push(await dgPagina(await dgFonte(f)))}catch(x){e.textContent=(x&&x.message)||'Não foi possível ler a fotografia.'}}pinta();const th=d.querySelector('#dg-th');if(th)th.scrollLeft=th.scrollWidth};
      const cam=d.querySelector('#dg-cam');if(cam)cam.onchange=()=>cam.files.length&&junta(cam.files);const gal=d.querySelector('#dg-gal');if(gal)gal.onchange=()=>gal.files.length&&junta(gal.files);
      const sc=d.querySelector('#dg-scan');if(sc)sc.onclick=()=>dgCamara(d,P,a,pinta,()=>{const c=d.querySelector('#dg-cam');if(c)c.click()});
      d.querySelectorAll('label.btn').forEach(l=>l.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();l.querySelector('input').click()}}));
      d.querySelectorAll('[data-dgr]').forEach(b=>b.onclick=()=>{P.splice(+b.dataset.dgr,1);pinta()});
      d.querySelectorAll('[data-dge]').forEach(b=>b.onclick=()=>dgEditar(d,P[+b.dataset.dge],+b.dataset.dge+1,pinta));
      d.querySelectorAll('[data-dgm]').forEach(b=>b.onclick=()=>{const [n,dx]=b.dataset.dgm.split('|').map(Number);const x=P.splice(n,1)[0];P.splice(n+dx,0,x);pinta()});
      d.querySelector('#dg-ok').onclick=async()=>{if(!P.length||ocup)return;
        if(!confirm('Guardar '+P.length+' página(s) do teste de '+a.nome+'?\n\nDepois de guardada, a digitalização fica selada: não pode ser alterada (só apagada e repetida, em caso de engano).'))return;
        ocup=true;d.dataset.ocup=1;const b=d.querySelector('#dg-ok');d.querySelectorAll('button,label.btn,.dgadd').forEach(x=>{x.disabled=true;x.style.pointerEvents='none'});
        try{await dgGuardar(t,i,a,P,(n,tot)=>{b.innerHTML=ic('refresh',15)+(n<tot?' A enviar a página '+(n+1)+' de '+tot+'…':' A selar…')});
          delete d.dataset.ocup;ocup=false;toast('Teste de '+a.nome.split(' ')[0]+' guardado e selado ('+P.length+' pág.)','ok');
          const prox=AL.find(z=>!dgTem(t,i.id,z.id)&&(+z.num||0)>(+a.num||0))||AL.find(z=>!dgTem(t,i.id,z.id));if(prox&&d.dataset.seg!=='0')captar(prox);else lista()}
        catch(x){delete d.dataset.ocup;ocup=false;pinta();const e=d.querySelector('#dg-e');if(e)e.textContent=(x&&x.message)||'Não foi possível guardar.'}}};
    pinta()};
  try{d.showModal()}catch(_){d.setAttribute('open','')}
  const a0=alunoDireto&&AL.find(z=>z.id===alunoDireto);if(a0){if(dgTem(t,i.id,a0.id)){lista();dgLivro(t,i,a0)}else captar(a0)}else lista()}

/* ---------- ver em livro (só leitura) ---------- */
function dgLivro(t,i,a){const m=dgTem(t,i.id,a.id);if(!m)return;$$('dialog.dglv').forEach(x=>x.remove());const d=document.createElement('dialog');d.className='dglv';d.setAttribute('aria-label','Teste digitalizado de '+a.nome);document.body.appendChild(d);
  let pg=1,zoom=false;const duplo=()=>innerWidth>=900&&innerWidth>innerHeight&&m.n>1&&!zoom;
  /* em livro: a capa (pág. 1) fica sozinha à direita; depois 2-3, 4-5… */
  const par=()=>{if(!duplo())return [pg];if(pg===1)return [null,1];const e=pg%2===0?pg:pg-1;return [e,e+1<=m.n?e+1:null]};
  const ir=n=>{n=Math.max(1,Math.min(m.n,n));if(n===pg)return;const frente=n>pg;pg=n;pinta(frente?'f':'t')};
  const passo=s=>{if(!duplo())return ir(pg+s);const e=pg===1?0:(pg%2===0?pg:pg-1);const n=e+2*s;ir(n<=0?1:Math.min(m.n,n))};
  d.innerHTML=`<div class="dglw"><header class="dglh"><div><b>N.º ${esc(a.num||'')} · ${esc(a.nome)}</b><span>${esc(t.nome)} · ${esc(i.nome)}${i.data?' · '+fmtD(i.data):''}</span></div>
      <span class="dgselo" title="Digitalizado a ${esc(new Date(m.q).toLocaleString('pt-PT'))}${m.por?' por '+esc(m.por):''}. Não pode ser alterado.">${ic('cadeado',13)} Selado · ${esc(new Date(m.q).toLocaleDateString('pt-PT',{day:'numeric',month:'short',year:'numeric'}))}</span>
      <button type="button" class="btn ico" id="lv-z" aria-label="Aumentar a página" aria-pressed="false">${ic('search',16)}</button><button type="button" class="btn ico" id="lv-x" aria-label="Fechar">${ic('x',16)}</button></header>
    <div class="dglb" id="lv-b"><button type="button" class="dgnav e" id="lv-a" aria-label="Página anterior">${ic('back',22)}</button><div class="dgbook" id="lv-k" aria-live="polite"></div><button type="button" class="dgnav d" id="lv-s" aria-label="Página seguinte">${ic('back',22)}</button></div>
    <footer class="dglf"><span id="lv-n"></span><input type="range" id="lv-r" min="1" max="${m.n}" value="1" aria-label="Ir para a página" ${m.n<2?'hidden':''}><span id="lv-i" class="dgint"></span></footer></div>`;
  const K=d.querySelector('#lv-k');
  const folha=(n,lado)=>{if(n==null)return `<div class="dgpg vazia ${lado}"></div>`;return `<div class="dgpg ${lado}" data-pn="${n}"><div class="dgesp"><span class="spin2"></span></div><span class="dgpn">${n}</span></div>`};
  const pinta=dir=>{const L=par();K.className='dgbook'+(L.length>1?' duplo':'')+(zoom?' zoom':'')+(dir?' vira-'+dir:'');K.innerHTML=L.length>1?folha(L[0],'esq')+folha(L[1],'dir'):folha(L[0],'so');
    const vis=L.filter(x=>x!=null);d.querySelector('#lv-n').textContent=(vis.length>1?'Páginas '+vis[0]+'–'+vis[1]:'Página '+vis[0])+' de '+m.n;d.querySelector('#lv-r').value=pg;
    d.querySelector('#lv-a').disabled=pg<=1;d.querySelector('#lv-s').disabled=Math.max(...vis)>=m.n;
    vis.forEach(n=>dgLerPag(m,n).then(r=>{const c=K.querySelector('[data-pn="'+n+'"]');if(!c)return;c.querySelector('.dgesp').outerHTML=`<img src="${r.url}" alt="Página ${n} do teste de ${esc(a.nome)}" draggable="false">`;
        const it=d.querySelector('#lv-i');if(!r.ok){it.className='dgint bad';it.innerHTML=ic('alert',13)+' A página '+n+' não coincide com o selo original'}else if(!it.classList.contains('bad')){it.className='dgint ok';it.innerHTML=ic('check',13)+' Íntegro'}})
      .catch(e=>{const c=K.querySelector('[data-pn="'+n+'"] .dgesp');if(c)c.innerHTML='<span class="mut">'+esc((e&&e.message)||'Não foi possível abrir a página.')+'</span>'}));
    /* adiantar as páginas seguintes */
    [Math.max(...vis)+1,Math.max(...vis)+2].filter(n=>n<=m.n).forEach(n=>dgLerPag(m,n).catch(()=>{}));setTimeout(()=>K.classList.remove('vira-f','vira-t'),380)};
  const sai=()=>{removeEventListener('resize',rs);try{d.close()}catch(_){}d.remove()};const rs=()=>pinta();addEventListener('resize',rs);
  d.addEventListener('cancel',e=>{e.preventDefault();sai()});d.querySelector('#lv-x').onclick=sai;d.querySelector('#lv-a').onclick=()=>passo(-1);d.querySelector('#lv-s').onclick=()=>passo(1);
  d.querySelector('#lv-r').oninput=e=>ir(+e.target.value);
  const zb=d.querySelector('#lv-z');zb.onclick=()=>{zoom=!zoom;zb.setAttribute('aria-pressed',zoom);zb.classList.toggle('pri',zoom);pinta()};
  d.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();passo(1)}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();passo(-1)}else if(e.key==='Home')ir(1);else if(e.key==='End')ir(m.n)});
  {let x0=null,y0=0;K.addEventListener('touchstart',e=>{if(zoom||e.touches.length>1){x0=null;return}x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
    K.addEventListener('touchend',e=>{if(x0==null)return;const t1=e.changedTouches[0];const dx=t1.clientX-x0,dy=t1.clientY-y0;x0=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4)passo(dx<0?1:-1)},{passive:true})}
  K.addEventListener('dblclick',()=>zb.click());d.addEventListener('contextmenu',e=>{if(e.target.tagName==='IMG')e.preventDefault()});
  try{d.showModal()}catch(_){d.setAttribute('open','')}pinta()}

/* módulo opcional: Definições › Geral › Módulos Opcionais */
function dgLigado(){return S.cfg.dgOn!==false}
{const _vDg=vDefinicoes;vDefinicoes=function(){const r=_vDg.apply(this,arguments);try{const mods=$('#view #def-mods');if(mods&&!$('#dg-on')){mods.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px"><input type="checkbox" id="dg-on" ${dgLigado()?'checked':''}> ${ic('camera',15)} <span><b>Digitalização de Testes</b><br><span class="mut">Guardar a folha de teste de cada aluno com a câmara do telemóvel (deteta a folha, endireita e limpa) e vê-la em livro. Desligado, o botão «Digitalizar» deixa de aparecer nos instrumentos.</span></span></label>`);
  $('#dg-on').onchange=e=>{S.cfg.dgOn=e.target.checked;save();toast(e.target.checked?'Digitalização de testes ligada':'Digitalização de testes desligada','ok')}}}catch(e){console.warn(e)}return r};if(go._f)Object.keys(go._f).forEach(k=>{if(go._f[k]===_vDg)go._f[k]=vDefinicoes})}
/* ---------- onde aparece: lista de instrumentos, instrumento aberto e Perfil/ficha do aluno ---------- */
{const _vI=vInstrumentos;vInstrumentos=function(){const r=_vI.apply(this,arguments);try{const t=T();if(t&&window.__esPronto&&dgLigado()){const tot=(typeof alunosAval==='function'?alunosAval(t):t.alunos).length;
    $$('#view tr[data-irow]').forEach(tr=>{const i=t.instrumentos.find(x=>x.id===tr.dataset.irow);const td=tr.querySelector('td.act');if(!i||!td||!dgEscrito(i)||td.querySelector('[data-dg]'))return;const n=dgConta(t,i);
      const b=document.createElement('button');b.type='button';b.className='btn sm'+(n?' dgtem':'');b.dataset.dg=i.id;b.title='Guardar a folha de teste de cada aluno (fotografias pelo telemóvel) e vê-las em livro';b.innerHTML=ic('camera',13)+(n?' '+n+'/'+tot:' Digitalizar');b.onclick=e=>{e.stopPropagation();dgPainel(i.id)};td.prepend(b,document.createTextNode(' '))});
    if(UI.inst){const i=t.instrumentos.find(x=>x.id===UI.inst);const bx=$('#barx');if(i&&dgEscrito(i)&&bx&&!bx.querySelector('#b-dg')){const n=dgConta(t,i);const b=document.createElement('button');b.type='button';b.className='btn';b.id='b-dg';b.innerHTML=ic('camera',15)+' Testes Digitalizados'+(n?' ('+n+')':'');b.onclick=()=>dgPainel(i.id);bx.appendChild(b);try{cabecalho()}catch(_){}}}}}catch(e){console.warn(e)}return r};
  if(go._f)Object.keys(go._f).forEach(k=>{if(go._f[k]===_vI||(go._f[k]&&go._f[k].__orig===_vI))go._f[k]=vInstrumentos})}
(()=>{const st=document.createElement('style');st.textContent=`
dialog.dgdlg{border:0;border-radius:22px;padding:0;width:min(720px,96vw);max-height:94vh;overflow:auto;background:var(--panel);color:var(--ink);box-shadow:0 30px 80px rgba(0,0,0,.35)}dialog.dgdlg::backdrop,dialog.dglv::backdrop{background:rgba(10,20,35,.6)}
.dgw{padding:18px 20px;display:flex;flex-direction:column;gap:12px}.dgh{display:flex;align-items:flex-start;gap:10px}.dgh>div{flex:1;min-width:0}.dgh h2{margin:0;font-size:19px;display:flex;gap:8px;align-items:center;text-transform:none;color:var(--ink)}.dgh p{margin:2px 0 0;font-size:13.5px}
.dgprog{display:flex;align-items:center;gap:12px;font-size:14px}.dgprog>div{flex:1;height:8px;border-radius:99px;background:var(--bg);overflow:hidden}.dgprog i{display:block;height:100%;background:#16a34a;border-radius:99px}
.dgl{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}.dgl button{width:100%;display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 12px;border:1px solid var(--line);border-radius:12px;background:var(--panel);color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.dgl button:hover{border-color:var(--acc)}.dgl button.ok{background:color-mix(in srgb,#16a34a 6%,var(--panel))}.dgn{min-width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:var(--bg);font-weight:700;font-size:13.5px;flex:none}.dgnm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
.dgst{font-size:12.5px;color:var(--mut);display:inline-flex;gap:4px;align-items:center;white-space:nowrap}.dgst.ok{color:#15803d}.dgver{display:inline-flex;gap:5px;align-items:center;font-size:13px;font-weight:700;color:var(--acc);white-space:nowrap}
.dgthumbs{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 10px;align-items:stretch;scroll-snap-type:x proximity}.dgthumbs figure{margin:0;flex:none;width:132px;position:relative;scroll-snap-align:start}.dgthumbs img{display:block;width:132px;height:186px;object-fit:cover;border-radius:10px;border:1px solid var(--line);background:#fff}
.dgthumbs figcaption{text-align:center;font-size:12.5px;font-weight:700;margin-top:4px}.dgta{position:absolute;top:6px;right:6px;display:flex;gap:4px}.dgta button{width:30px;height:30px;border-radius:8px;border:0;background:rgba(17,24,39,.72);color:#fff;display:grid;place-items:center;cursor:pointer}
.dgadd{flex:none;width:150px;min-height:186px;border:2px dashed var(--acc);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;padding:10px;color:var(--acc);cursor:pointer;background:color-mix(in srgb,var(--acc) 6%,transparent);font-size:14px}.dgcap .dgthumbs:has(.dgadd:only-child) .dgadd{width:100%;min-height:220px;font-size:17px}
.dga{gap:8px;flex-wrap:wrap}.dga .btn{min-height:46px}.btn.dgtem{color:#15803d;border-color:color-mix(in srgb,#16a34a 45%,var(--line))}
dialog.dglv{border:0;padding:0;margin:0;width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:100dvh;background:#1f2937;color:#fff}
.dglw{display:flex;flex-direction:column;height:100%}.dglh{display:flex;align-items:center;gap:10px;padding:max(10px,env(safe-area-inset-top)) 14px 10px;background:#111827}.dglh>div{flex:1;min-width:0;display:flex;flex-direction:column}.dglh b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dglh span{font-size:12.5px;color:#cbd5e1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dglh .btn{background:rgba(255,255,255,.1);border-color:transparent;color:#fff}.dgselo{flex:none;display:inline-flex!important;gap:5px;align-items:center;padding:5px 10px;border-radius:99px;background:rgba(250,204,21,.16);color:#fde68a!important;font-weight:700;font-size:12px!important}
.dglb{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 4px;perspective:2400px}.dgnav{flex:none;width:44px;height:64px;border-radius:12px;border:0;background:rgba(255,255,255,.1);color:#fff;display:grid;place-items:center;cursor:pointer}.dgnav.d svg{transform:scaleX(-1)}.dgnav:disabled{opacity:.25;cursor:default}
.dgbook{flex:1;min-width:0;height:100%;display:flex;align-items:center;justify-content:center;gap:0}.dgpg{position:relative;height:100%;max-width:100%;display:flex;align-items:center;justify-content:center;background:#fff;box-shadow:0 12px 40px rgba(0,0,0,.45);overflow:hidden;aspect-ratio:${'210/297'}}
.dgbook.duplo .dgpg{max-width:50%}.dgpg.esq{border-radius:6px 0 0 6px;box-shadow:inset -18px 0 24px -18px rgba(0,0,0,.35),0 12px 40px rgba(0,0,0,.45)}.dgpg.dir{border-radius:0 6px 6px 0;box-shadow:inset 18px 0 24px -18px rgba(0,0,0,.35),0 12px 40px rgba(0,0,0,.45)}.dgpg.so{border-radius:6px}.dgpg.vazia{background:transparent;box-shadow:none}
.dgpg img{width:100%;height:100%;object-fit:contain;display:block;user-select:none;-webkit-user-drag:none}.dgpn{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-size:11px;color:#475569;background:rgba(255,255,255,.85);border-radius:99px;padding:1px 8px}.dgesp{color:#475569;display:grid;place-items:center;padding:20px;text-align:center}
.dgbook.zoom{overflow:auto;align-items:flex-start;justify-content:flex-start}.dgbook.zoom .dgpg{height:auto;width:max(100%,1100px);max-width:none;aspect-ratio:auto;flex:none}.dgbook.zoom .dgpg img{height:auto}
.dgbook.vira-f .dgpg.dir,.dgbook.vira-f .dgpg.so{animation:dgvf .36s ease-out;transform-origin:left center}.dgbook.vira-t .dgpg.esq,.dgbook.vira-t .dgpg.so{animation:dgvt .36s ease-out;transform-origin:right center}
@keyframes dgvf{from{transform:rotateY(-70deg);opacity:.4}to{transform:none;opacity:1}}@keyframes dgvt{from{transform:rotateY(70deg);opacity:.4}to{transform:none;opacity:1}}@media (prefers-reduced-motion:reduce){.dgbook .dgpg{animation:none!important}}
.dglf{display:flex;align-items:center;gap:12px;padding:8px 14px max(10px,env(safe-area-inset-bottom));background:#111827;font-size:13.5px}.dglf input{flex:1;min-width:0}.dgint{display:inline-flex;gap:4px;align-items:center;font-size:12.5px}.dgint.ok{color:#86efac}.dgint.bad{color:#fca5a5;font-weight:700}
.spin2{width:26px;height:26px;border-radius:50%;border:3px solid #cbd5e1;border-top-color:#0e6a93;animation:escf .8s linear infinite;display:block}
.dgli{display:flex;gap:6px;align-items:stretch}.dgli>button:first-child{flex:1;min-width:0}.dgl .dgdel{width:48px!important;flex:none;justify-content:center;color:var(--bad);padding:0!important}
.dgadd{font:inherit;font-size:14px}.dgadd small{font-size:12px;opacity:.8}.dgthumbs img[data-dge]{cursor:pointer;object-fit:contain!important;background:#e5e7eb}
dialog.dgdlg[data-modo=cam]{width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0;margin:0;background:#000;overflow:hidden}
.dgcam{position:relative;width:100%;height:100dvh;background:#000;overflow:hidden}.dgcam video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.dgcam canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.dcflash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .15s}.dcflash.on{opacity:.85;transition:none}
.dctop{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:10px;padding:max(12px,env(safe-area-inset-top)) 14px 22px;background:linear-gradient(#000a,#0000)}.dcinfo{flex:1;text-align:center;color:#fff;font-weight:600;font-size:14px;text-shadow:0 1px 3px #000}
.dcb{width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.18);color:#fff;display:grid;place-items:center;cursor:pointer}.dcb.on{background:#facc15;color:#111}
.dcbot{position:absolute;left:0;right:0;bottom:0;padding:26px 16px max(16px,env(safe-area-inset-bottom));background:linear-gradient(#0000,#000c);display:flex;flex-direction:column;gap:10px}
.dcthumbs{display:flex;gap:6px;justify-content:center;min-height:54px}.dcthumbs img{height:54px;width:40px;object-fit:cover;border-radius:5px;border:2px solid #fff;background:#fff}
.dcrow{display:grid;grid-template-columns:1fr auto 1fr;align-items:center}.dccount{color:#fff;font-weight:700;font-size:15px}.dcshot{width:76px;height:76px;border-radius:50%;border:4px solid #fff;background:transparent;display:grid;place-items:center;cursor:pointer;padding:0}.dcshot i{width:60px;height:60px;border-radius:50%;background:#fff;display:block;transition:transform .1s}.dcshot:active i{transform:scale(.88)}
.dcdone{justify-self:end;display:inline-flex;gap:6px;align-items:center;border:0;border-radius:999px;padding:12px 18px;background:#16a34a;color:#fff;font:700 15px inherit;cursor:pointer}
.dged .deimg{display:grid;place-items:center;background:#111827;border-radius:12px;padding:14px;min-height:0}.dewrap{position:relative;display:inline-block;max-width:100%;touch-action:none;line-height:0}.dewrap img{display:block;max-width:100%;max-height:min(62vh,640px);user-select:none;-webkit-user-drag:none}
.dewrap svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.dewrap polygon{fill:rgba(34,197,94,.16);stroke:#22c55e;stroke-width:3;vector-effect:non-scaling-stroke}
.deh{position:absolute;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;border:3px solid #fff;background:rgba(34,197,94,.85);box-shadow:0 2px 8px rgba(0,0,0,.5);cursor:grab;touch-action:none;padding:0}
.degr{gap:6px;flex-wrap:wrap}
@media (max-width:640px){.dewrap img{max-height:52dvh}}
@media (max-width:640px){dialog.dgdlg{width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0}.dgst:not(.ok){display:none}.dgnav{display:none}.dglb{padding:6px 0}.dga .btn{flex:1 1 100%;justify-content:center}.dgselo{font-size:11px!important;padding:4px 8px}}`;document.head.appendChild(st)})();
