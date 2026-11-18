/* ---------- interação ---------- */
function mqBind(){const cv=$('#mq-cv'),u=mqUI();
  $('#mq-und').onclick=()=>mqDesfazer(false);
  const abreAmp=()=>{UI.mqFull=true;const m=$('#mq');ecraAmplo({titulo:UI.mqCtx==='jornal'?'JornalNote':'SpruceNote',sub:mqQ(u.q).nome,el:m,aoFechar:()=>{UI.mqFull=false;if(VIEW==='sprucenote')vSpruceNote();if(VIEW==='snjornal')vSnJornal()}});requestAnimationFrame(()=>{try{mqSetas()}catch(_){}})};
  $('#mq-amp').onclick=abreAmp;if(UI.mqFull&&!document.getElementById('ampv'))setTimeout(abreAmp,0);$('#mq-red').onclick=()=>mqDesfazer(true);
  const zoom=(f,cx,cy)=>{const v=mqVis(u.q),r=cv.getBoundingClientRect();cx=cx==null?r.width/2:cx-r.left;cy=cy==null?r.height/2:cy-r.top;const nz=Math.max(.25,Math.min(2.5,v.z*f));v.x=cx-(cx-v.x)*nz/v.z;v.y=cy-(cy-v.y)*nz/v.z;v.z=nz;mqZoomAp();mqFmtPos($('.mq-it.ed [data-ed]')||document.body)};
  $('#mq-zp').onclick=()=>zoom(1.2);$('#mq-zm').onclick=()=>zoom(1/1.2);$('#mq-zr').onclick=()=>{const v=mqVis(u.q);v.z=1;mqZoomAp()};
  $('#mq-zf').onclick=()=>{const q=mqQ(u.q);const L=q.itens.filter(i=>!i.pai);if(!L.length)return;const els=L.map(i=>$(`[data-mq="${i.id}"]`)).filter(Boolean).map(mqRectW);const x0=Math.min(...els.map(r=>r.x)),y0=Math.min(...els.map(r=>r.y)),x1=Math.max(...els.map(r=>r.x+r.w)),y1=Math.max(...els.map(r=>r.y+r.h));const r=cv.getBoundingClientRect();const z=Math.max(.25,Math.min(1.5,Math.min((r.width-60)/(x1-x0),(r.height-60)/(y1-y0))));const v=mqVis(u.q);v.z=z;v.x=(r.width-(x1-x0)*z)/2-x0*z;v.y=(r.height-(y1-y0)*z)/2-y0*z;mqZoomAp()};
  cv.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey)zoom(Math.exp(-e.deltaY*0.01),e.clientX,e.clientY);else{const v=mqVis(u.q);v.x-=e.deltaX;v.y-=e.deltaY;mqZoomAp()}},{passive:false});
  /* barra: tocar cria no centro; arrastar cria onde largar */
  $$('.mq-tool').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();const t=b.dataset.mqt;let g=null;const x0=e.clientX,y0=e.clientY;
    const mv=ev=>{if(!g&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>6){g=document.createElement('div');g.className='mq-ghost';g.innerHTML=ic(MQ_T[t][0],18)+' '+MQ_T[t][1];document.body.appendChild(g)}if(g){g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px'}};
    const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(g){g.remove();const r=cv.getBoundingClientRect();if(ev.clientX>r.left&&ev.clientX<r.right&&ev.clientY>r.top&&ev.clientY<r.bottom){const p=mqPt(ev.clientX,ev.clientY);mqCriar(t,{x:p.x-40,y:p.y-20})}}else mqCriar(t)};
    addEventListener('pointermove',mv);addEventListener('pointerup',up)}});
  $('#mq-f').onchange=e=>{const p=mqLinkPos||mqCentro();mqImagens([...e.target.files],p.x,p.y);e.target.value=''};
  /* fundo: arrastar desloca; seleção por retângulo com Shift; dois dedos aproximam */
  const P=new Map();let pan=null,pinch=null,box=null;
  cv.onpointerdown=e=>{if(e.target.closest('.mq-it,.mq-zoom,.mq-ctx,.mq-fmt,.mq-seta'))return;if(_mqEd){document.activeElement&&document.activeElement.blur();}
    P.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId);cv.focus({preventScroll:true})}catch(_){}
    if(P.size===2){const [a,b]=[...P.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};pan=null;return}
    if(_mqLig){_mqLig=null;$('#mq').classList.remove('ligar')}
    if(e.shiftKey){const p=mqPt(e.clientX,e.clientY);box={x0:p.x,y0:p.y,el:document.createElement('div')};box.el.className='mq-box';$('#mq-w').appendChild(box.el);return}
    const v=mqVis(u.q);pan={x:e.clientX,y:e.clientY,vx:v.x,vy:v.y,mov:false};cv.classList.add('pan')};
  cv.onpointermove=e=>{if(!P.has(e.pointerId))return;P.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&P.size===2){const [a,b]=[...P.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);zoom(d/pinch.d,pinch.cx,pinch.cy);pinch.d=d;return}
    if(box){const p=mqPt(e.clientX,e.clientY);const x=Math.min(p.x,box.x0),y=Math.min(p.y,box.y0),w=Math.abs(p.x-box.x0),h=Math.abs(p.y-box.y0);Object.assign(box.el.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});box.r={x,y,w,h};return}
    if(pan){const v=mqVis(u.q);v.x=pan.vx+e.clientX-pan.x;v.y=pan.vy+e.clientY-pan.y;if(Math.abs(e.clientX-pan.x)+Math.abs(e.clientY-pan.y)>4)pan.mov=true;mqZoomAp()}};
  cv.onpointerup=cv.onpointercancel=e=>{P.delete(e.pointerId);if(P.size<2)pinch=null;cv.classList.remove('pan');
    if(box){const R=box.r;box.el.remove();box=null;if(R){const q=mqQ(u.q);u.sel=q.itens.filter(i=>!i.pai).filter(i=>{const el=$(`[data-mq="${i.id}"]`);if(!el)return false;const r=mqRectW(el);return r.x<R.x+R.w&&r.x+r.w>R.x&&r.y<R.y+R.h&&r.y+r.h>R.y}).map(i=>i.id);mqRender()}return}
    if(pan&&!pan.mov&&u.sel.length){u.sel=[];mqRender()}pan=null};
  cv.ondblclick=e=>{if(e.target.closest('.mq-it,.mq-zoom,.mq-ctx'))return;const p=mqPt(e.clientX,e.clientY);mqNovo('nota',p.x-20,p.y-20)};
  /* largar ficheiros e colar */
  cv.ondragover=e=>{e.preventDefault();cv.classList.add('drop')};cv.ondragleave=()=>cv.classList.remove('drop');
  cv.ondrop=e=>{e.preventDefault();cv.classList.remove('drop');const p=mqPt(e.clientX,e.clientY);const F=[...(e.dataTransfer.files||[])];if(F.length)return mqImagens(F,p.x,p.y);const t=e.dataTransfer.getData('text/uri-list')||e.dataTransfer.getData('text/plain');if(t)mqColarTexto(t,p)};
  cv.onpaste=e=>{if(_mqEd||e.target.closest('input,textarea'))return;const F=[...(e.clipboardData.files||[])];const p=mqCentro();if(F.length){e.preventDefault();return mqImagens(F,p.x,p.y)}const t=e.clipboardData.getData('text/plain');if(t){e.preventDefault();mqColarTexto(t,p)}};
  cv.onkeydown=e=>{if(_mqEd||e.target.closest('input,textarea,[contenteditable=true]'))return;const k=String(e.key||'');const m=e.ctrlKey||e.metaKey;
    if((k==='Delete'||k==='Backspace')&&u.sel.length){e.preventDefault();mqApagar()}else if(m&&k.toLowerCase()==='z'){e.preventDefault();mqDesfazer(e.shiftKey)}else if(m&&k.toLowerCase()==='d'){e.preventDefault();mqDuplicar()}else if(m&&k.toLowerCase()==='a'){e.preventDefault();u.sel=mqQ(u.q).itens.filter(i=>!i.pai).map(i=>i.id);mqRender()}else if(k==='Escape'){u.sel=[];_mqLig=null;$('#mq').classList.remove('ligar');mqRender()}
    else if(k.startsWith('Arrow')&&u.sel.length){e.preventDefault();const d=e.shiftKey?20:4;const q=mqQ(u.q);u.sel.forEach(id=>{const i=mqItem(q,id);if(i&&!i.pai){if(k==='ArrowLeft')i.x-=d;if(k==='ArrowRight')i.x+=d;if(k==='ArrowUp')i.y-=d;if(k==='ArrowDown')i.y+=d}});save();mqRender()}};
  $$('#mq-fmt [data-fmt]').forEach(b=>{b.onpointerdown=e=>e.preventDefault();b.onclick=()=>{const c_=b.dataset.fmt;if(c_==='h3')document.execCommand('formatBlock',false,'h3');else if(c_==='link'){const l=prompt('Endereço da ligação:','https://');if(l&&/^https?:\/\//.test(l))document.execCommand('createLink',false,l)}else document.execCommand(c_)}})}
function mqColarTexto(t,p){t=t.trim();if(/^https?:\/\/\S+$/i.test(t)){let d='';try{d=new URL(t).hostname.replace(/^www\./,'')}catch(_){}mqNovo('link',p.x,p.y,{url:t,tit:d,desc:''})}else{const txt=esc(t).replace(/\n/g,'<br>');const it=mqNovo('nota',p.x,p.y,{txt});setTimeout(()=>{if(_mqEd===it.id){const el=$(`[data-mq="${it.id}"] [data-ed]`);el&&el.blur()}},40)}}
function mqItensBind(){const u=mqUI(),q=mqQ(u.q),cv=$('#mq-cv');
  $$('#mq-its .mq-it').forEach(el=>{const id=el.dataset.mq,it=mqItem(q,id);if(!it)return;
    el.onpointerdown=e=>{if(e.button>0||e.target.closest('input,textarea,a,button,select,audio,video,[contenteditable=true],label.mq-sw'))return;e.stopPropagation();try{cv.focus({preventScroll:true})}catch(_){}
      if(_mqLig){if(!_mqLig.de){_mqLig.de=id;el.classList.add('lig');return}if(_mqLig.de!==id){mqAntes();q.setas.push({id:uid(),de:_mqLig.de,para:id});save()}_mqLig=null;$('#mq').classList.remove('ligar');mqRender();return}
      if(e.shiftKey||e.metaKey||e.ctrlKey){u.sel=u.sel.includes(id)?u.sel.filter(x=>x!==id):[...u.sel,id];mqRender();return}
      if(!u.sel.includes(id)){u.sel=[id];$$('#mq-its .mq-it.sel').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');mqCtx()}
      const rz=e.target.closest('[data-rz]');const v=mqVis(u.q);const x0=e.clientX,y0=e.clientY;let mov=false,ghost=null,colAlvo=null;
      const grupo=rz?[it]:u.sel.map(x=>mqItem(q,x)).filter(i=>i&&!(i.pai&&i.id!==it.id));const ori=grupo.map(i=>({i,x:i.x,y:i.y,w:i.w}));
      try{el.setPointerCapture(e.pointerId)}catch(_){}
      const mv=ev=>{const dx=(ev.clientX-x0)/v.z,dy=(ev.clientY-y0)/v.z;if(!mov&&Math.hypot(dx,dy)<4/v.z)return;
        if(!mov){mov=true;mqAntes();if(!rz&&it.pai){/* tirar da coluna */const R=mqRectW(el);it.pai=null;it.x=R.x;it.y=R.y;ori[0].x=R.x;ori[0].y=R.y;mqRender();ghost=$(`[data-mq="${id}"]`)}else ghost=el;ghost.classList.add('arr')}
        if(rz){it.w=Math.max(120,Math.round(ori[0].w+dx));ghost.style.width=it.w+'px';requestAnimationFrame(mqSetas);return}
        ori.forEach(o=>{if(o.i.pai)return;o.i.x=Math.round(o.x+dx);o.i.y=Math.round(o.y+dy);const g=o.i.id===id?ghost:$(`[data-mq="${o.i.id}"]`);if(g){g.style.left=o.i.x+'px';g.style.top=o.i.y+'px'}});
        /* coluna por baixo? */
        if(grupo.length===1&&!['coluna'].includes(it.t)){ghost.style.pointerEvents='none';const t=document.elementFromPoint(ev.clientX,ev.clientY);ghost.style.pointerEvents='';const cb=t&&t.closest&&t.closest('[data-colb]');$$('.mq-cb.alvo').forEach(x=>x!==cb&&x.classList.remove('alvo'));colAlvo=cb&&cb.dataset.colb!==id?cb:null;if(colAlvo)colAlvo.classList.add('alvo')}
        requestAnimationFrame(mqSetas)};
      const up=ev=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);if(ghost&&ghost!==el){ghost.removeEventListener('pointermove',mv)}
        if(!mov)return;if(colAlvo){colAlvo.classList.remove('alvo');const cid=colAlvo.dataset.colb;const F=q.itens.filter(x=>x.pai===cid).sort((a,b)=>(a.o||0)-(b.o||0));let k=F.length;
          [...colAlvo.querySelectorAll(':scope > .mq-it')].forEach((c,n)=>{const r=c.getBoundingClientRect();if(k===F.length&&ev.clientY<r.top+r.height/2)k=n});F.splice(k,0,it);it.pai=cid;F.forEach((x,n)=>x.o=n)}
        save();mqRender()};
      el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)};
    el.ondblclick=e=>{e.stopPropagation();if(it.t==='quadro')return mqAbrir(it.ref);if(it.t==='nota'||it.t==='titulo')return mqEditar(id);if(it.t==='link')return mqLinkDlg(it)};
    const ed=el.querySelector(':scope > [data-ed]');if(ed)ed.onclick=e=>{if(u.sel.length===1&&u.sel[0]===id&&!e.target.closest('a'))mqEditar(id)};
    el.querySelectorAll(':scope [data-tit]').forEach(i=>{if(i.closest('.mq-it')!==el)return;i.onchange=()=>{mqAntes();it.tit=i.value.trim();save()}});
    const qn=el.querySelector('[data-qnm]');if(qn)qn.onchange=()=>{const s=MQ().find(z=>z.id===it.ref);if(s){s.nome=qn.value.trim()||'Quadro';save();mqBC()}};
    const lg=el.querySelector('[data-leg]');if(lg&&lg.closest('.mq-it')===el)lg.onchange=()=>{it.leg=lg.value;save()};
    const hx=el.querySelector('[data-hex]');if(hx)hx.oninput=()=>{it.hex=hx.value;el.querySelector('.mq-sw').style.background=hx.value;el.querySelector('small').textContent=hx.value.toUpperCase()},hx&&(hx.onchange=()=>save());
    const le=el.querySelector('[data-lked]');if(le&&le.closest('.mq-it')===el)le.onclick=()=>mqLinkDlg(it);
    if(it.t==='tarefa'){el.querySelectorAll('[data-tk]').forEach(c=>c.onchange=()=>{mqAntes();it.l[+c.dataset.tk].f=c.checked;save();if(c.checked&&it.l.every(x=>x.f)){try{const r=c.getBoundingClientRect();animConfetes(r.left,r.top)}catch(_){}}mqRender()});
      el.querySelectorAll('[data-tt]').forEach(t=>{const k=+t.dataset.tt;t.onchange=()=>{it.l[k].t=t.value;save()};t.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();it.l[k].t=t.value;mqAntes();it.l.splice(k+1,0,{t:'',f:false});save();mqRender();setTimeout(()=>{const n=$(`[data-mq="${id}"] [data-tt="${k+1}"]`);n&&n.focus()},20)}else if(e.key==='Backspace'&&!t.value&&it.l.length>1){e.preventDefault();mqAntes();it.l.splice(k,1);save();mqRender();setTimeout(()=>{const n=$(`[data-mq="${id}"] [data-tt="${Math.max(0,k-1)}"]`);n&&n.focus()},20)}}});
      const ad=el.querySelector('[data-tadd]');if(ad)ad.onclick=()=>{mqAntes();it.l.push({t:'',f:false});save();mqRender();setTimeout(()=>{const n=$(`[data-mq="${id}"] [data-tt="${it.l.length-1}"]`);n&&n.focus()},20)}}});
  $$('#mq-its input').forEach(i=>i.addEventListener('keydown',e=>e.stopPropagation()))}

/* 0.910 · «Cheio de animações»: mais efeitos (ondas ao tocar, cartões em cascata, revelação ao deslizar, visto a saltar, mini-confetes, contador da barra, inclinação suave) */
{const cheio=()=>{try{return animPerfil()==='cheio'&&animOK()&&!document.documentElement.classList.contains('a11y-rm')}catch(_){return false}};
  /* onda a partir do ponto tocado */
  addEventListener('pointerdown',e=>{if(!cheio())return;const b=e.target.closest&&e.target.closest('.btn,.nav,.chip,.tabs button,.pnk,.kpi,.mq-tool,.anopt');if(!b||b.disabled)return;const r=b.getBoundingClientRect();const d=Math.max(r.width,r.height)*2.2;
    const s=document.createElement('span');s.className='an-rip';s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;if(getComputedStyle(b).position==='static')b.style.position='relative';b.classList.add('an-ripp');b.appendChild(s);setTimeout(()=>s.remove(),650)},{passive:true,capture:true});
  /* visto a saltar e mini-confetes ao marcar caixas */
  addEventListener('change',e=>{if(!cheio())return;const c=e.target;if(!(c instanceof HTMLInputElement)||c.type!=='checkbox'||!c.checked)return;c.classList.remove('an-chk');void c.offsetWidth;c.classList.add('an-chk');
    if(c.closest('#view,.mq')){const r=c.getBoundingClientRect();const box=document.createElement('div');box.className='an-conf an-mini';box.style.left=(r.left+r.width/2)+'px';box.style.top=(r.top+r.height/2)+'px';const C=['#10b981','#3b82f6','#f59e0b','#ec4899'];
      for(let k=0;k<8;k++){const i=document.createElement('i');const a=k/8*Math.PI*2;i.style.cssText=`--dx:${Math.cos(a)*26}px;--dy:${Math.sin(a)*26}px;--r:${k*45}deg;background:${C[k%4]}`;box.appendChild(i)}document.body.appendChild(box);setTimeout(()=>box.remove(),800)}},true);
  /* cartões em cascata + revelação ao deslizar */
  let io=null;const rev=root=>{if(!cheio()||!('IntersectionObserver' in window))return;io=io||new IntersectionObserver(L=>L.forEach(x=>{if(x.isIntersecting){x.target.classList.add('an-vis');io.unobserve(x.target)}}),{rootMargin:'0px 0px -6% 0px'});
    const C=[...(root||document).querySelectorAll('#view .card, #view .cpm-pc, #view .pnk, #view .jn-pc')].slice(0,60);C.forEach((c,k)=>{const r=c.getBoundingClientRect();if(r.top<innerHeight){c.style.setProperty('--ci',Math.min(k,10));c.classList.add('an-card')}else{c.classList.add('an-rev');io.observe(c)}})};
  {const _g=go;go=function(){const r=_g.apply(this,arguments);try{requestAnimationFrame(()=>rev())}catch(_){}return r}}
  /* inclinação suave dos indicadores com o rato */
  addEventListener('pointermove',e=>{if(!cheio()||e.pointerType!=='mouse')return;const k=e.target.closest&&e.target.closest('#view .kpi,#view .pnk');if(!k)return;const r=k.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;k.style.transform=`perspective(600px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-2px)`;k.classList.add('an-tilt')},{passive:true});
  addEventListener('pointerout',e=>{const k=e.target.closest&&e.target.closest('.an-tilt');if(k&&!k.contains(e.relatedTarget)){k.style.transform='';k.classList.remove('an-tilt')}},{passive:true});
  /* o número de avisos da barra lateral salta quando muda */
  const mo=new MutationObserver(M=>{if(!cheio())return;M.forEach(m=>{const el=m.target.nodeType===1?m.target:m.target.parentElement;const b=el&&el.closest&&el.closest('.nbadge,#cpBadge,#jnBadge,.badge');if(b){b.classList.remove('an-bump');void b.offsetWidth;b.classList.add('an-bump')}})});
  setTimeout(()=>{const sd=document.getElementById('side');if(sd)mo.observe(sd,{subtree:true,childList:true,characterData:true})},1500);
  /* título da secção desliza ao mudar */
  {const _g2=go;go=function(){const r=_g2.apply(this,arguments);try{if(cheio()){const t=document.getElementById('ttl');if(t){t.classList.remove('an-ttl');void t.offsetWidth;t.classList.add('an-ttl')}}}catch(_){}return r}}}

/* 0.910 · sessões abertas noutros aparelhos atualizam-se sozinhas: com a app à vista, verifica a nuvem a cada 4 s
   (1 pedido pequeno; só descarrega quando outro aparelho mudou alguma coisa — ex.: testes orais gravados no telemóvel) */
{let _lv=0;const vivo=agora=>{try{const L=nvL();if(document.visibilityState!=='visible'||!navigator.onLine||!L.prov||L.auto===false||L.renovar||_nvBusy||!(L.k||_nvK)||!SESSAO||document.getElementById('nvgate')||document.body.classList.contains('priv-on'))return;
    if(Date.now()-_lv<3500)return;_lv=Date.now();Promise.resolve(nvSondar(agora===true)).catch(()=>{})}catch(_){}};
  setInterval(()=>{if(!window.__nvRapido)vivo()},4000);addEventListener('focus',()=>setTimeout(()=>vivo(true),300));addEventListener('online',()=>setTimeout(()=>vivo(true),800))}

/* 0.915 · arrastar dentro da app nunca abre «Largue aqui o e-mail» */
addEventListener('dragstart',()=>{window.__dragInt=true},true);addEventListener('dragend',()=>{setTimeout(()=>{window.__dragInt=false},50)},true);addEventListener('drop',()=>{setTimeout(()=>{window.__dragInt=false},50)},true);
/* Esc fecha os Avisos Urgentes */
addEventListener('keydown',e=>{if(e.key!=='Escape')return;const x=document.querySelector('#avpop #av-x');if(x&&!document.querySelector('dialog[open]')){e.preventDefault();e.stopPropagation();x.click()}},true);
/* intercalar: mudar a turma de origem */
document.addEventListener('change',e=>{if(e.target&&e.target.id==='sel-orig'&&VIEW==='intercalar'){UI.orig=e.target.value;vIntercalar()}});
/* barra lateral: Planta da Sala logo a seguir aos Alunos; «Sumários» como subnível do Modo Aula */
function navOrdem(){['#tnavHold','#tTree','#side'].forEach(sel=>{const h=document.querySelector(sel);if(!h)return;const al=h.querySelector('[data-v="alunos"]'),pl=h.querySelector('[data-v="planta"]'),au=h.querySelector('[data-v="aula"]'),su=h.querySelector('[data-v="sumarios"]');
  if(al&&pl&&al.parentElement===pl.parentElement&&al.nextElementSibling!==pl)al.after(pl);
  if(au&&su&&au.parentElement===su.parentElement){if(au.nextElementSibling!==su)au.after(su);su.classList.add('navsub');const l=su.querySelector('.lbl');if(l&&l.textContent!=='Sumários')l.textContent='Sumários';su.title='Sumários'}})}
{const _gN=go;go=function(){const r=_gN.apply(this,arguments);try{navOrdem()}catch(_){}return r}}setTimeout(navOrdem,300);setTimeout(navOrdem,1500);
/* apagar o ano letivo limpa tudo o que lhe pertence (jornal, coordenação PROFIJ, tarefas e avisos das turmas desse ano) */
function anoLimparTudo(a){try{const ids=new Set((a.turmas||[]).map(t=>t.id));
  if(S.jornal&&S.jornal.anos){delete S.jornal.anos[a.nome];Object.keys(S.jornal.anos).forEach(k=>{if(k===a.id)delete S.jornal.anos[k]})}
  if(S.cprofij&&S.cprofij.anos){delete S.cprofij.anos[a.id];delete S.cprofij.anos[a.nome]}
  if(Array.isArray(S.todo))S.todo=S.todo.filter(x=>!(x&&(ids.has(x.turma)||ids.has(x.tid)||x.ano===a.id)));
  if(Array.isArray(S.avisos))S.avisos=S.avisos.filter(x=>!(x&&(ids.has(x.turma)||ids.has(x.tid)||x.ano===a.id)));
  if(S.avisosVistos)Object.keys(S.avisosVistos).forEach(k=>{if([...ids].some(i=>k.includes(i)))delete S.avisosVistos[k]});
  if(UI){UI.cpmT='';UI.jnTab='painel';UI.inst=null}}catch(e){console.warn(e)}}

/* Início: marca as colunas sem cartões para o espaço ser usado pelas outras */
function iniColVazias(){const v=$('#view .inlay');if(!v)return;const n=el=>el?[...el.children].filter(c=>(c.classList.contains('card')||/^w-/.test(c.id))&&c.style.display!=='none'&&c.offsetParent!==null).length:0;
  v.classList.toggle('sem-fav',!n($('#view .in-fav')));v.classList.toggle('sem-side',!n($('#view .in-side')))}
{const _vIC=vInicio;vInicio=function(){const r=_vIC.apply(this,arguments);try{requestAnimationFrame(iniColVazias)}catch(_){}return r};if(go._f)go._f.inicio=vInicio}
document.addEventListener('drop',()=>setTimeout(iniColVazias,60));

