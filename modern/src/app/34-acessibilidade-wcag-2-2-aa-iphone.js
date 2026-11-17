/* ================= Acessibilidade (WCAG 2.2 AA · iPhone, iPad, Mac) ================= */
const a11yCfg=()=>S.cfg.a11y=S.cfg.a11y||{texto:100,movimento:'auto',contraste:false,ligacoes:false,gifs:'auto'};
function aplicarA11yCfg(){const c=a11yCfg();const r=document.documentElement;r.style.setProperty('--a11y-zoom',String((+c.texto||100)/100));
  r.classList.toggle('a11y-zoom',(+c.texto||100)!==100);r.classList.toggle('a11y-rm',c.movimento==='sim'||(c.movimento==='auto'&&matchMedia('(prefers-reduced-motion: reduce)').matches));
  r.classList.toggle('a11y-hc',!!c.contraste||matchMedia('(prefers-contrast: more)').matches);r.classList.toggle('a11y-lk',!!c.ligacoes)}
const A11Y={kb:false,live:null};
(function(){
  /* ligação para saltar a navegação + regiões */
  const sk=document.createElement('a');sk.href='#view';sk.className='a11y-skip';sk.textContent='Saltar para o conteúdo';
  sk.addEventListener('click',e=>{e.preventDefault();const v=$('#view');if(v)v.focus()});document.body.prepend(sk);
  const side=$('#side');if(side){side.setAttribute('aria-label','Navegação principal')}
  const v=$('#view');if(v){v.setAttribute('role','main');v.tabIndex=-1;v.setAttribute('aria-labelledby','ttl')}
  const bar=$('#bar');if(bar){bar.setAttribute('role','region');bar.setAttribute('aria-label','Barra da página')}
  const st=$('#selTurma');if(st)st.setAttribute('aria-label','Turma');const sa=$('#selAno');if(sa)sa.setAttribute('aria-label','Ano letivo');
  const mb=$('#menuBtn');if(mb){mb.setAttribute('aria-controls','side');mb.setAttribute('aria-expanded','false')}
  const dw=$('#drawer');if(dw){dw.setAttribute('role','dialog');dw.setAttribute('aria-labelledby','dw-t');if(!dw.classList.contains('on'))dw.inert=true}
  ['#scrim','#dwscrim'].forEach(s=>{const e=$(s);if(e)e.setAttribute('aria-hidden','true')});
  const lv=document.createElement('div');lv.id='a11y-live';lv.className='a11y-sr';lv.setAttribute('aria-live','polite');lv.setAttribute('aria-atomic','true');document.body.append(lv);A11Y.live=lv;
  /* modo de interação (teclado vs toque/rato) */
  addEventListener('keydown',e=>{if(e.key==='Tab'||e.key.startsWith('Arrow'))A11Y.kb=true},true);addEventListener('pointerdown',()=>{A11Y.kb=false},true);
  try{aplicarA11yCfg()}catch(_){}
  ['(prefers-reduced-motion: reduce)','(prefers-contrast: more)'].forEach(q=>{try{matchMedia(q).addEventListener('change',aplicarA11yCfg)}catch(_){}})
})();
function anunciar(t){const l=A11Y.live;if(!l)return;l.textContent='';setTimeout(()=>{l.textContent=t},80)}
/* barra lateral fora do ecrã (iPhone / iPad ao alto): não pode receber foco */
function a11ySide(){const s=$('#side');if(!s)return;const fora=getComputedStyle(s).position==='fixed'&&!document.body.classList.contains('menu')&&!document.body.classList.contains('rail-aberta');s.inert=fora;if(fora)s.setAttribute('aria-hidden','true');else s.removeAttribute('aria-hidden');
  const mb=$('#menuBtn');if(mb)mb.setAttribute('aria-expanded',document.body.classList.contains('menu')?'true':'false')}
new MutationObserver(()=>{a11ySide();const m=document.body.classList.contains('menu');if(m&&!a11ySide._m){setTimeout(()=>{const f=$('#side button.nav.on')||$('#side button.nav');if(f)f.focus({preventScroll:true})},60)}a11ySide._m=m}).observe(document.body,{attributes:true,attributeFilter:['class']});
addEventListener('resize',()=>requestAnimationFrame(a11ySide));setTimeout(a11ySide,0);
addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('menu')&&!$('#drawer.on')){document.body.classList.remove('menu');const mb=$('#menuBtn');if(mb)mb.focus()}});
/* painel lateral (drawer) como diálogo modal: o resto da app fica inerte enquanto está aberto */
function a11yDrawer(){const d=$('#drawer');if(!d)return;const ab=d.classList.contains('on');d.inert=!ab;if(ab)d.removeAttribute('aria-hidden');else d.setAttribute('aria-hidden','true');
  const m=$('#main');if(m)m.inert=ab;if(ab){const s=$('#side');if(s)s.inert=true}else a11ySide();if(!ab&&a11yDrawer._ab)setTimeout(()=>{const e=document.activeElement;if(!e||e===document.body){const t=$('#ttl');if(t){t.tabIndex=-1;t.focus({preventScroll:true})}}},80);if(ab!==a11yDrawer._ab&&ab)anunciar('Painel aberto: '+(($('#dw-t')||{}).textContent||''));a11yDrawer._ab=ab}
{const d=$('#drawer');if(d){new MutationObserver(a11yDrawer).observe(d,{attributes:true,attributeFilter:['class']});a11yDrawer()}}
/* navegação entre vistas: título da página, item atual, anúncio e foco */
{const _g=go;go=function(v){const deSide=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#side,#tTree,.ttree');const r=_g.apply(this,arguments);
  try{$$('#side [data-v]').forEach(b=>{if(b.dataset.v===VIEW&&b.classList.contains('on'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    const t=($('#ttl')||{}).textContent||'';document.title=(t?t+' · ':'')+'EduSpruce';anunciar(t);
    if(deSide&&A11Y.kb){const h=$('#ttl');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}}}catch(_){}return r}}
/* nomes acessíveis, cabeçalhos de tabela, regiões com scroll, botões de alternar */
const A11Y_SIMB={'×':'Remover','✕':'Fechar','✖':'Remover','+':'Acrescentar','−':'Diminuir','-':'Diminuir','‹':'Anterior','›':'Seguinte','«':'Anterior','»':'Seguinte','↑':'Subir','↓':'Descer','⋯':'Mais opções','…':'Mais opções','✓':'Confirmar','✎':'Editar'};
let _a11yN=0;
function nomeAcessivel(el){if(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby'))return true;if(el.labels&&el.labels.length)return true;if(el.title&&el.title.trim())return true;return false}
function a11yPasso(root){if(!root)return;
  root.querySelectorAll('input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset]),select,textarea').forEach(el=>{if(el.labels&&el.labels.length===1&&!el.getAttribute('aria-label')){const l=el.labels[0];if(l.title&&l.textContent.trim().length<10)el.setAttribute('aria-label',l.title)}if(nomeAcessivel(el))return;let lb=null;
    const p=el.previousElementSibling;if(p&&p.tagName==='LABEL'&&!p.htmlFor&&!p.querySelector('input,select,textarea'))lb=p;
    if(!lb&&el.parentElement){const l=el.parentElement.querySelector(':scope>label');if(l&&!l.htmlFor&&!l.contains(el)&&!l.querySelector('input,select,textarea'))lb=l}
    if(lb){if(!el.id)el.id='a11y-f'+(++_a11yN);lb.htmlFor=el.id;return}
    if(el.placeholder){el.setAttribute('aria-label',el.placeholder);return}
    const td=el.closest('td,th');if(td){const tr=td.parentElement,tb=td.closest('table');const i=[...tr.children].indexOf(td);const th=tb&&tb.tHead&&tb.tHead.rows[0]?tb.tHead.rows[0].children[i]:null;
      const col=th?th.textContent.trim():'';const row=tr.children[0]&&tr.children[0]!==td?tr.children[0].textContent.trim().slice(0,40):'';
      if(el.type==='checkbox'&&td.tagName==='TH'){el.setAttribute('aria-label','Selecionar todos');return}
      const n=[col,row].filter(Boolean).join(' · ');if(n){el.setAttribute('aria-label',n);return}}
    if(el.tagName==='SELECT'&&el.options[0]&&el.options[0].textContent.trim()){el.setAttribute('aria-label',el.options[0].value===''?'Filtrar: '+el.options[0].textContent.trim():el.options[0].textContent.trim());return}
    const card=el.closest('.card,.dwb');const h=card&&card.querySelector('h2,h3');if(h)el.setAttribute('aria-label',h.textContent.trim().slice(0,60))});
  root.querySelectorAll('button,[role=button],a[href]').forEach(el=>{if(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby'))return;const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(t&&!A11Y_SIMB[t])return;if(el.title&&el.title.trim()){if(!t)return;el.setAttribute('aria-label',el.title.trim());return}
    if(A11Y_SIMB[t]){el.setAttribute('aria-label',A11Y_SIMB[t]);return}
    const img=el.querySelector('img[alt]');if(img&&img.alt)return;el.setAttribute('aria-label',el.dataset.v?((TITLES[el.dataset.v])||'Abrir'):'Botão')});
  root.querySelectorAll('svg:not([aria-hidden]):not([role])').forEach(s=>s.setAttribute('aria-hidden','true'));
  root.querySelectorAll('img:not([alt])').forEach(i=>i.setAttribute('alt',''));
  root.querySelectorAll('table').forEach(tb=>{if(tb.dataset.a11y)return;tb.dataset.a11y='1';tb.querySelectorAll('thead th').forEach(th=>{if(!th.scope)th.scope='col'});tb.querySelectorAll('tbody th').forEach(th=>{if(!th.scope)th.scope='row'})});
  root.querySelectorAll('.tblw,[data-ov],.sheetwrap,.cnqt,.ntmais,.hscroll,.calev,.suml,[style*="overflow:auto"],[style*="overflow-x:auto"]').forEach(w=>{const o=getComputedStyle(w);const sc=/auto|scroll/.test(o.overflowX+o.overflowY);
    if(sc&&!w.hasAttribute('tabindex')&&!w.querySelector('a[href],button,input,select,textarea,[tabindex]')){w.tabIndex=0;w.setAttribute('role','region');const h=(w.closest('.card,.dwb')||document).querySelector('h2,h3');w.setAttribute('aria-label',(h?h.textContent.trim():'Tabela')+' (deslocável)')}});
  root.querySelectorAll('button.on,[data-of].on').forEach(b=>{if(b.closest('#side'))return;const p=b.parentElement;if(!p)return;const bs=[...p.children].filter(x=>x.tagName==='BUTTON');if(bs.length<2)return;p.dataset.a11yg='1';if(!p.getAttribute('role'))p.setAttribute('role','group')});
  root.querySelectorAll('[data-a11yg] > button:not([role])').forEach(b=>b.setAttribute('aria-pressed',b.classList.contains('on')?'true':'false'));
  root.querySelectorAll('[data-cd]:not([aria-label])').forEach(c=>{if(c.title)c.setAttribute('aria-label',c.title)});
  root.querySelectorAll('details>summary').forEach(s=>{const d=s.parentElement;s.setAttribute('aria-expanded',d.open?'true':'false')});
  root.querySelectorAll('[onclick]:not(button):not(a):not(input):not([role]),div[data-cd],span[data-cd]').forEach(e=>{if(!e.getAttribute('role'))e.setAttribute('role','button');if(!e.hasAttribute('tabindex'))e.tabIndex=0});
  const ap=$('#avpop');if(ap&&!ap.getAttribute('role')){ap.setAttribute('role','alertdialog');ap.setAttribute('aria-modal','true');const t=ap.querySelector('h2,h3,b');if(t){if(!t.id)t.id='a11y-avt';ap.setAttribute('aria-labelledby',t.id)}}
}
/* elementos clicáveis sem ser botão: Enter / Espaço ativam */
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target;if(!t||!t.matches||!t.matches('[role=button]:not(button):not(a)'))return;e.preventDefault();t.click()});
/* contraste mínimo 4,5:1 (texto pequeno) — corrige cores de etiquetas e cores definidas pelo utilizador */
function _rgb(s){if(!s)return null;let m=s.match(/^rgba?\(([^)]+)\)/);if(m){const p=m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);return [p[0],p[1],p[2],p.length>3?p[3]:1]}
  m=s.match(/^color\(srgb ([^)]+)\)/);if(m){const p=m[1].split(/[\s\/]+/).filter(Boolean).map(parseFloat);return [p[0]*255,p[1]*255,p[2]*255,p.length>3?p[3]:1]}return null}
const _lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
const _ratio=(a,b)=>{const x=_lum(a),y=_lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
function _fundo(el){let acc=null;const pilha=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const cs=getComputedStyle(e);if(cs.backgroundImage&&cs.backgroundImage!=='none'&&!/gradient/.test(cs.backgroundImage))return null;const c=_rgb(cs.backgroundColor);if(c&&c[3]>0){pilha.push(c);if(c[3]>=.99)break}}
  if(!pilha.length)pilha.push(document.documentElement.dataset.theme==='dark'?[28,28,30,1]:[255,255,255,1]);let b=pilha.pop();b=[b[0],b[1],b[2]];while(pilha.length){const c=pilha.pop();b=[c[0]*c[3]+b[0]*(1-c[3]),c[1]*c[3]+b[1]*(1-c[3]),c[2]*c[3]+b[2]*(1-c[3])]}return b}
function a11yContraste(root,forca){if(!root)return;const sel='.btn.pri,.btn.dng,.dng,.lin > *,.ev *,.mta,.mtp,.mtc *,.nlb,.dimc,.tag,.mtd,.tm,.tm *,.anob,.dh,.mut,.hint,.kpi .l,.cd,.cd b,.cd span,.plq,.lnk,[style*="color"],.aula b,.aula span,.cp b,.pcor b,[style*="--"] > b,[style*="--"] > span,[style*="background"] b,[style*="background"] span,[style*="background"] small';
  const alvos=new Set(root.querySelectorAll(sel));if(/^(view|dw-b|avpop)$/.test(root.id)){const temImg=e=>{for(let x=e,k=0;x&&x!==root&&k<8;x=x.parentElement,k++){const bi=getComputedStyle(x).backgroundImage;if(bi&&bi!=='none')return true}return false};const W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});let n,k=0;while((n=W.nextNode())&&k<4000){const e=n.parentElement;if(e&&!alvos.has(e)&&(forca||e.dataset.cg!==e.className+'|'+(e.getAttribute('style')||'').length)&&!/^(SCRIPT|STYLE|OPTION|TEXTAREA)$/.test(e.tagName)&&!e.closest('svg,[contenteditable=true]')&&!temImg(e)){alvos.add(e);k++}}}
  const _arr=[...alvos];let _i=0;const _fn=el=>{if(document.body.classList.contains('est-sge')&&el.closest('#bar'))return;if(el.closest('.apres-oc,[disabled],[aria-disabled=true]'))return;if(!forca&&el.dataset.cg===el.className+'|'+(el.getAttribute('style')||'').length)return;
    if(!el.textContent.trim()||!el.getClientRects().length)return;el.dataset.cg=el.className+'|'+(el.getAttribute('style')||'').length;const cs=getComputedStyle(el);if(cs.visibility==='hidden')return;for(let e=el,k=0;e&&k<4;e=e.parentElement,k++){const o=parseFloat(getComputedStyle(e).opacity);if(o<1&&o>0&&!e.disabled&&!e.closest('[disabled]'))e.style.setProperty('opacity','1','important')}
    let fg=_rgb(cs.color);const bg=_fundo(el);if(!fg||!bg)return;const fs=parseFloat(cs.fontSize),bold=+cs.fontWeight>=700;const alvo=(fs>=24||(fs>=18.66&&bold))?3:4.5;
    if(fg[3]<1)fg=[fg[0]*fg[3]+bg[0]*(1-fg[3]),fg[1]*fg[3]+bg[1]*(1-fg[3]),fg[2]*fg[3]+bg[2]*(1-fg[3])];if(_ratio(fg,bg)>=alvo+.05)return;
    const claro=_lum(bg)>.4;let c=fg.slice(0,3);for(let i=0;i<24&&_ratio(c,bg)<alvo+.1;i++)c=c.map(v=>claro?v*.88:v+(255-v)*.16);
    if(_ratio(c,bg)>=alvo){if(!('cgc' in el.dataset))el.dataset.cgc=el.style.getPropertyValue('color')+'|'+el.style.getPropertyPriority('color');el.style.setProperty('color',`rgb(${c.map(Math.round).join(',')})`,'important');el.style.filter='none';return}
    /* texto já branco/preto: escurece/clareia o fundo do próprio elemento */
    let dono=el;for(let k=0;k<3&&dono;k++){const c2=_rgb(getComputedStyle(dono).backgroundColor);if(c2&&c2[3]>=.99)break;dono=dono.parentElement}
    if(dono&&dono!==document.body){let b=_fundo(dono);const fc=fg.slice(0,3);const escurece=_lum(fc)>.5;for(let i=0;i<24&&_ratio(fc,b)<alvo+.1;i++)b=b.map(v=>escurece?v*.9:v+(255-v)*.15);if(!('cgb' in dono.dataset))dono.dataset.cgb=dono.style.getPropertyValue('background-color')+'|'+dono.style.getPropertyPriority('background-color');dono.style.setProperty('background-color',`rgb(${b.map(Math.round).join(',')})`,'important')}};
  /* em pequenos lotes, nos momentos livres: a app responde logo ao toque */const _corre=dl=>{const t0=performance.now();while(_i<_arr.length){_fn(_arr[_i++]);if((_i&15)===0&&(dl&&dl.timeRemaining?dl.timeRemaining()<2:performance.now()-t0>8))break}if(_i<_arr.length){if(window.requestIdleCallback)requestIdleCallback(_corre,{timeout:500});else setTimeout(_corre,16)}};_corre()}
{let _q=0,_t=0;const raiz=()=>['#view','#dw-b','#bar','#side','#avpop','#toast'].map(s=>$(s)).filter(Boolean);let _forca=true;const run=()=>{cancelAnimationFrame(_q);_q=requestAnimationFrame(()=>{raiz().forEach(e=>{try{a11yPasso(e)}catch(x){console.warn(x)}try{a11yContraste(e)}catch(x){console.warn(x)}})});if(_forca&&!_t)_t=setTimeout(()=>{_t=0;_forca=false;raiz().forEach(e=>{try{a11yPasso(e)}catch(x){}try{a11yContraste(e,true)}catch(x){}})},600)};
  new MutationObserver(R=>{if(R.some(r=>r.type==='attributes'&&(r.target===document.body||r.attributeName==='data-theme')))_forca=true;run()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','open','data-theme']});new MutationObserver(()=>{/* repõe só o que o ajuste de contraste mudou (as cores próprias, como as dos dias do calendário, ficam) */const rep=(e,k,pr)=>{const v=e.dataset[k];if(v==null)return;const i=v.lastIndexOf('|');const val=v.slice(0,i),pri=v.slice(i+1);if(val)e.style.setProperty(pr,val,pri);else e.style.removeProperty(pr);delete e.dataset[k]};$$('[data-cgc]').forEach(e=>rep(e,'cgc','color'));$$('[data-cgb]').forEach(e=>rep(e,'cgb','background-color'));$$('[data-cg]').forEach(e=>{delete e.dataset.cg});_forca=true;run()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});run()}
/* animações da ajuda: botão Pausar / Reproduzir (pausadas se o sistema pedir menos movimento) */
function a11yGifs(root){(root||document).querySelectorAll('figure.ajf img:not([data-gp])').forEach(img=>{img.dataset.gp='1';const src=img.src;const fig=img.closest('figure');if(!fig)return;fig.style.position='relative';
  const b=document.createElement('button');b.type='button';b.className='btn sm a11y-gifb';const cv=document.createElement('canvas');cv.className='a11y-gifc';cv.hidden=true;cv.setAttribute('role','img');cv.setAttribute('aria-label',img.alt+' (em pausa)');img.after(cv);
  const pausa=p=>{if(p){try{cv.width=img.naturalWidth;cv.height=img.naturalHeight;cv.getContext('2d').drawImage(img,0,0);cv.style.width='100%';cv.hidden=false;img.hidden=true}catch(_){}}else{cv.hidden=true;img.hidden=false;img.src=src}b.innerHTML=p?ic('play',14)+' Reproduzir':ic('pause',14)+' Pausar';b.setAttribute('aria-pressed',p?'true':'false');b.setAttribute('aria-label',(p?'Reproduzir':'Pausar')+' animação: '+img.alt.replace(/^Animação:\s*/,''))};
  b.onclick=()=>pausa(!img.hidden);fig.appendChild(b);const rm=document.documentElement.classList.contains('a11y-rm');if(rm){if(img.complete)pausa(true);else img.addEventListener('load',()=>pausa(true),{once:true})}else pausa(false)})}
new MutationObserver(()=>requestAnimationFrame(()=>a11yGifs($('#view')))).observe(document.body,{childList:true,subtree:true});
if(!ICONS.userx)ICONS.userx='<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 4 1.5M16 15l5 5M21 15l-5 5"/>';if(!ICONS.play)ICONS.play='<path d="M7 4.5v15l12-7.5z"/>';if(!ICONS.pause)ICONS.pause='<path d="M8 5v14M16 5v14"/>';ICONS.a11y='<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v4.5M12 14.5l-3.5 6M12 14.5l3.5 6"/>';if(!ICONS.access)ICONS.access='<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>';
/* Definições › Geral: cartão Acessibilidade */
function cartaoA11y(){const c=a11yCfg();const seg=(k,ops)=>`<div class="seg a11yseg" role="radiogroup" aria-label="${esc(ops.l)}">${ops.o.map(([v,t])=>`<button type="button" role="radio" aria-checked="${String(c[k])===String(v)?'true':'false'}" class="${String(c[k])===String(v)?'on':''}" data-a11k="${k}" data-a11v="${v}">${t}</button>`).join('')}</div>`;
  return `<div class="card" id="a11y-card"><h2>${ic('a11y',18)} Acessibilidade</h2><p class="hint" style="margin-top:0">A app segue também as definições do iPhone, iPad e Mac (Reduzir Movimento, Aumentar Contraste, tamanho do texto do navegador, VoiceOver e Controlo por Teclado).</p>
    <div class="a11yg"><div><label>Tamanho do Texto</label>${seg('texto',{l:'Tamanho do texto',o:[[100,'Normal'],[115,'Grande'],[130,'Maior'],[150,'Máximo']]})}</div>
    <div><label>Movimento e Animações</label>${seg('movimento',{l:'Movimento',o:[['auto','Como o Sistema'],['sim','Reduzir'],['nao','Normal']]})}</div>
    <div><label>Contraste</label>${seg('contraste',{l:'Contraste',o:[[false,'Normal'],[true,'Reforçado']]})}</div>
    <div><label>Ligações</label>${seg('ligacoes',{l:'Ligações',o:[[false,'Como no Desenho'],[true,'Sempre Sublinhadas']]})}</div></div></div>`}
function bindA11y(){$$('[data-a11k]').forEach(b=>b.onclick=()=>{const c=a11yCfg();let v=b.dataset.a11v;if(v==='true')v=true;else if(v==='false')v=false;else if(/^\d+$/.test(v))v=+v;c[b.dataset.a11k]=v;save();aplicarA11yCfg();const y=$('#a11y-card');const n=document.createElement('div');n.innerHTML=cartaoA11y();y.replaceWith(n.firstElementChild);bindA11y();const f=$(`[data-a11k="${b.dataset.a11k}"][data-a11v="${b.dataset.a11v}"]`);if(f)f.focus({preventScroll:true});anunciar('Definição guardada')})}
{const _vd=vDefinicoes;vDefinicoes=function(){const r=_vd.apply(this,arguments);try{if((UI.defTab||'geral')==='geral'&&!$('#a11y-card')){const v=$('#view');const cards=v.querySelectorAll('.vmain>.card,:scope>.card');const ref=cards[0];const h=document.createElement('div');h.innerHTML=cartaoA11y();const el=h.firstElementChild;if(ref)ref.after(el);else v.appendChild(el);bindA11y()}}catch(e){console.warn(e)}return r}}
AJUDA.push({id:'a11y',ic:'a11y',t:'Acessibilidade',gif:null,txt:`<p>O EduSpruce foi revisto para as regras de acessibilidade WCAG 2.2 (nível AA) e as orientações da Apple para iPhone, iPad e Mac:</p><ul>
  <li><b>VoiceOver</b>: todos os botões, campos e tabelas têm nome; o painel lateral é anunciado como diálogo; as mudanças de página e as mensagens são anunciadas.</li>
  <li><b>Teclado (Mac / iPad com teclado)</b>: “Saltar para o conteúdo” é o primeiro elemento; Tab percorre tudo pela ordem visual, com contorno de foco visível; Esc fecha painéis e o menu; ⌘K abre a pesquisa.</li>
  <li><b>Toque</b>: no iPhone e iPad todos os botões e campos têm pelo menos 44 × 44 pontos; os campos não fazem zoom ao tocar.</li>
  <li><b>Contraste</b>: texto com contraste mínimo de 4,5:1, também nas cores escolhidas para reuniões, tempos e domínios; “Aumentar Contraste” do sistema reforça contornos.</li>
  <li><b>Movimento</b>: com “Reduzir Movimento” as animações param e as imagens animadas da ajuda ficam em pausa (botão Reproduzir/Pausar em cada uma).</li>
  <li><b>Texto</b>: Definições › Geral › Acessibilidade aumenta o texto até 150 % sem cortar conteúdo; o zoom do navegador também funciona.</li></ul>`});

/* re-desenhar sem saltar: mantém o elemento ativo no mesmo sítio do ecrã e o foco */
function manterPosicao(fn){const ae=document.activeElement;const chave=ae&&ae.dataset?Object.entries(ae.dataset).find(([k])=>!/^(cg|a11y|dec)/.test(k)):null;const sel=chave?`[data-${chave[0].replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}="${CSS.escape(chave[1])}"]`:(ae&&ae.id?'#'+CSS.escape(ae.id):null);
  const y0=ae&&ae!==document.body&&ae.getBoundingClientRect?ae.getBoundingClientRect().top:null;const sc=[document.scrollingElement,$('#view'),$('#dw-b'),$('#drawer .dwb')].filter(Boolean).map(e=>[e,e.scrollTop]);
  /* v0.942 · depois da 1.ª reposição, só volta a corrigir se a pessoa não tiver rolado entretanto (antes «puxava» o ecrã de volta e parecia preso) */
  let _n=0;fn();const ajusta=()=>{const prim=!_n++;sc.forEach(o=>{const e=o[0],v=o[1];if(!e.isConnected)return;if(!prim&&e.scrollTop!==o[2])return;if(e.scrollTop!==v)e.scrollTop=v;o[2]=e.scrollTop});if(!prim&&sc.some(o=>o[0].isConnected&&o[0].scrollTop!==o[2]))return;if(sel&&y0!=null){const n=document.querySelector(sel);if(n){const d=n.getBoundingClientRect().top-y0;if(Math.abs(d)>1){let alvo=n.parentElement;while(alvo&&alvo!==document.body){const o=getComputedStyle(alvo).overflowY;if(/auto|scroll/.test(o)&&alvo.scrollHeight>alvo.clientHeight+2)break;alvo=alvo.parentElement}(alvo&&alvo!==document.body?alvo:document.scrollingElement).scrollTop+=d}try{n.focus({preventScroll:true})}catch(_){}}}};
  ajusta();requestAnimationFrame(()=>{ajusta();setTimeout(ajusta,60)})}

/* atalhos genéricos para outra vista (ex.: estados vazios) */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-goview]');if(b){e.preventDefault();go(b.dataset.goview)}});

/* título da página com tamanho dinâmico: encolhe até caber (mín. 15 px) e só depois passa a 2 linhas */
function ajustarTitulo(minFs){minFs=minFs||15;const t=$('#ttl');if(!t)return;t.style.fontSize='';t.style.whiteSpace='';t.style.webkitLineClamp='';t.classList.remove('ttl2');
  const base=parseFloat(getComputedStyle(t).fontSize)||22;let fs=base;const cabe=()=>t.scrollWidth<=t.clientWidth+1;
  if(!t.clientWidth)return;while(!cabe()&&fs>minFs){fs-=1;t.style.fontSize=fs+'px'}if(!cabe())t.classList.add('ttl2')}
/* barra superior: tudo numa linha sempre que couber (título encolhe até 17 px); só passa a duas linhas se não couber */
ajustarBarra=function(){const b=document.getElementById('bar');if(!b)return;b.classList.remove('bar2');const t=$('#ttl');ajustarTitulo(17);if(innerWidth<=1000){ajustarTitulo();return}
  if(b.scrollWidth>b.clientWidth+1||(t&&t.classList.contains('ttl2'))){b.classList.add('bar2');ajustarTitulo()}};
{const _g2=go;go=function(){const r=_g2.apply(this,arguments);requestAnimationFrame(()=>ajustarBarra());return r}}
{const t=$('#ttl');if(t&&window.ResizeObserver){let w=0;new ResizeObserver(en=>{const nw=Math.round(en[0].contentRect.width);if(nw!==w){w=nw;requestAnimationFrame(()=>{if($('#bar.bar2')||innerWidth<=1000)ajustarTitulo();else ajustarBarra()})}}).observe(t.parentElement)}
  if(t)new MutationObserver(()=>requestAnimationFrame(()=>ajustarBarra())).observe(t,{childList:true,characterData:true,subtree:true})}

/* Imprimir = documento próprio (o mesmo do “Exportar PDF”), não a página da app */
let _imprimirPdf=false;
{const _dl=download;download=function(nome,dados,mime){if(_imprimirPdf&&/pdf/.test(mime||'')){_imprimirPdf=false;imprimirBytes(dados,nome);return}return _dl.apply(this,arguments)}}
function imprimirBytes(bytes,nome){const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const safari=/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)||/iPad|iPhone/.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(navigator.userAgent));
  if(safari){const w=window.open(url,'_blank');if(!w){toast('Permita janelas pop-up para imprimir','bad')}else toast('Documento aberto — use Partilhar › Imprimir','ok');setTimeout(()=>URL.revokeObjectURL(url),120000);return}
  let f=$('#a11y-printf');if(f)f.remove();f=document.createElement('iframe');f.id='a11y-printf';f.title='Documento para imprimir';f.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0';f.src=url;document.body.appendChild(f);
  f.onload=()=>setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){window.open(url,'_blank')}},250)}
const _printNativo=window.print.bind(window);
function imprimirVista(){if(_imprimirPdf)return;_imprimirPdf=true;toast('A preparar o documento para imprimir…');try{const r=exportarVistaPdf();Promise.resolve(r).finally(()=>setTimeout(()=>{if(_imprimirPdf){_imprimirPdf=false}},4000))}catch(e){_imprimirPdf=false;console.warn(e);_printNativo()}}
window.print=imprimirVista;
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&!e.shiftKey&&!e.altKey&&(e.key==='p'||e.key==='P')){e.preventDefault();imprimirVista()}},true);

/* Início: aulas dadas e previstas por turma (período/semestre atual ou ano letivo) */
function widgetAulasTurmas(){const a=A();if(!a)return '';const TT=a.turmas.filter(t=>escolaDe(t)===EC());if(!TT.length)return '';
  const P=periodos();const W=P.length===2?'Semestre':'Período';let per=periodoDe(isoData(new Date()));if(!per){const c=a.calendario;const hj=isoData(new Date());const nx=c&&c.periodos?c.periodos.find(p=>p.ini>hj):null;per=nx?nx.n:P[P.length-1]}
  const modo=UI.awEsc||'per';const linhas=TT.map(t=>{let L=[];try{L=listaAulas(t,a)}catch(_){}const X=modo==='ano'?L:L.filter(x=>x.per===per);const prev=X.filter(x=>!x.repos).length;const dadas=X.filter(x=>x.licao).length;return {t,prev,dadas,falt:X.filter(x=>x.falta&&!x.falta.subst&&x.passada).length}});
  const comHor=linhas.filter(l=>l.prev);
  return `<div class="card waul"><div class="row" style="gap:8px;margin-bottom:10px"><h2 style="margin:0;font-size:15px">${ic('checks',16)} Aulas Dadas</h2></div>
    <div class="seg a11yseg" role="radiogroup" aria-label="Período das contas" style="margin:0 0 10px">${[['per',per+'.º '+W],['ano','Ano Letivo']].map(([k,l])=>`<button type="button" role="radio" aria-checked="${modo===k}" class="${modo===k?'on':''}" data-awesc="${k}">${l}</button>`).join('')}</div>
    ${comHor.length?`<ul class="waull">${linhas.map(l=>{const pc=l.prev?Math.round(100*l.dadas/l.prev):0;return `<li><button type="button" class="waulb" data-awt="${l.t.id}" aria-label="${esc(l.t.nome+' · '+l.t.disciplina+': '+l.dadas+' aulas dadas de '+l.prev+' previstas')}"><span class="waulh"><b>${esc(l.t.nome)}</b><span class="mut">${esc(siglaDe?siglaDe(l.t):l.t.disciplina)}</span><span class="sp1"></span><b class="waulv">${l.dadas}</b><span class="mut">/${l.prev}</span></span>
      <span class="waulbar" aria-hidden="true"><i style="width:${pc}%"></i></span>${l.prev?`<span class="mut waulf">${l.prev-l.dadas} por dar${l.falt?` · <span style="color:var(--bad)">${l.falt} falta${l.falt>1?'s':''}</span>`:''}</span>`:'<span class="mut waulf">sem horário</span>'}</button></li>`}).join('')}</ul>
      <p class="hint" style="margin:8px 0 0">Tempos de 45 min. Toque numa turma para abrir Aulas e Sumários.</p>`:`<p class="mut" style="margin:0">Importe o calendário escolar e os horários para ver as aulas.</p><div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm" data-goview="calendario">${ic('calcheck',13)} Calendário</button><button class="btn sm" data-goview="turmas">${ic('calendar',13)} Horários</button></div>`}</div>`}
function bindAulasTurmas(){$$('[data-awesc]').forEach(b=>b.onclick=()=>{UI.awEsc=b.dataset.awesc;const w=$('#w-aulas');if(w){w.innerHTML=widgetAulasTurmas();bindAulasTurmas();const n=$(`[data-awesc="${UI.awEsc}"]`);if(n)n.focus({preventScroll:true})}});
  $$('[data-awt]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.awt;save();go('sumarios')})}

/* ================= Avaliação da componente oral (Inglês 358 — Parte D) ================= */
const ORAL_P=[
  {k:'amb',n:'Âmbito',s:'gramatical e vocabular',d:{N4:'Repertório alargado de recursos linguísticos; formulações variadas; poucas repetições.',N3:'Repertório suficiente; algumas dificuldades de formulação, que consegue resolver; algumas repetições.',N2:'Repertório elementar; dificuldades de formulação que nem sempre resolve; repetições frequentes.',N1:'Repertório limitado, recorrendo a frases memorizadas; dificuldades que não resolve; repetições sistemáticas.'}},
  {k:'cor',n:'Correção/Controlo',s:'gramatical/vocabular e fonológico',d:{N4:'Bom domínio de estruturas simples (complexas com imprecisões); bom controlo vocabular; pronúncia clara.',N3:'Razoável domínio de estruturas simples; controlo vocabular razoável; pronúncia geralmente clara.',N2:'Domínio elementar, com alguns erros; controlo vocabular elementar; pronúncia por vezes pouco clara.',N1:'Domínio limitado, erros frequentes; vocabulário limitado; pronúncia que exige esforço de compreensão.'}},
  {k:'flu',n:'Fluência',s:'',d:{N4:'Comunica com espontaneidade/facilidade; pausas pontuais para planificar.',N3:'Alguma facilidade; algumas pausas para planificar.',N2:'Pouca facilidade; pausas e hesitações evidentes.',N1:'Muito pouca facilidade (por vezes impede a compreensão); pausas e hesitações frequentes.'}},
  {k:'des',n:'Desenvolvimento Temático, Coerência e Coesão',s:'',d:{N4:'Informação relevante; discurso claro e coerente; mecanismos de coesão eficazes.',N3:'Informação geralmente relevante; discurso geralmente claro; coesão geralmente eficaz.',N2:'Informação nem sempre relevante; discurso pouco claro; coesão pouco eficaz.',N1:'Informação pouco relevante; ideias isoladas; coesão muito pouco eficaz.'}},
  {k:'int',n:'Interação',s:'',d:{N4:'Inicia, mantém e conclui de forma eficaz; intervém sem ajuda.',N3:'De forma geralmente eficaz; intervém de forma geralmente apropriada, sem ajuda.',N2:'De forma pouco eficaz; intervém com ajuda do(s) interlocutor(es).',N1:'De forma muito pouco eficaz; dificuldade em manter um diálogo autónomo.'}}];
const ORAL_N=[['N4',12],['N3',8],['N2',6],['N1',2],['0',0]];
const oralM=t=>{t.oral=t.oral||{};const o=t.oral;o.cfg=o.cfg||{total:50,pesos:{amb:20,cor:20,flu:20,des:20,int:20},man:oralMan50(),_m50:1};o.regs=o.regs||{};o.cfg.man=o.cfg.man||{};o.cfgGlob=o.cfgGlob||o.cfg;oralMig(o);o.cfgI=o.cfgI||{};o.regsI=o.regsI||{};
  {const I=t.instrumentos||[];if(o.inst){const x=I.find(i=>i.id===o.inst);if(x&&x.oral)o.propId=x.id;else if(!x){const ant=o.inst;o.regsI['apagado:'+ant]=o.regs;if(ant===o.propId)o.propId=null;o.inst=null;o.regs=o.propId?(o.regsI._proprio||{}):{}}}
   if(o.propId&&!I.some(i=>i.id===o.propId))o.propId=null;if(!o.inst&&o.propId)o.inst=o.propId;if(o.propId&&o.regsI[o.propId]&&!o.regsI._proprio){o.regsI._proprio=o.regsI[o.propId];delete o.regsI[o.propId]}}
  {const k=o.inst&&o.inst!==o.propId?o.inst:'_proprio';o.cfg=o.cfgI[k]||o.cfgGlob;o.cfg.man=o.cfg.man||{}}return o};
const r2=x=>Math.round(x*100)/100;
const oralMax=(c,k)=>r2((+c.total||0)*(+c.pesos[k]||0)/100);
const oralAuto=(c,k,nv)=>r2(oralMax(c,k)*((ORAL_N.find(x=>x[0]===nv)||[0,0])[1])/12);
const oralPts=(c,k,nv)=>{const m=c.man[k];return m&&m[nv]!=null&&m[nv]!==''?+m[nv]:oralAuto(c,k,nv)};
const fmtP=x=>x==null||x===''?'—':String(r2(+x)).replace('.',',');
function oralProblemas(c){const P=[];const soma=ORAL_P.reduce((s,p)=>s+(+c.pesos[p.k]||0),0);if(Math.abs(soma-100)>0.05)P.push(`Os pesos somam ${fmtP(soma)} % (deviam somar 100 %).`);
  let tot=0;ORAL_P.forEach(p=>{const top=oralPts(c,p.k,'N4');tot+=top;const mx=oralMax(c,p.k);if(Math.abs(top-mx)>0.05)P.push(`${p.n}: o nível N4 vale ${fmtP(top)}, mas pelo peso de ${fmtP(c.pesos[p.k])} % devia valer ${fmtP(mx)}.`);
    const v=ORAL_N.map(([n])=>oralPts(c,p.k,n));for(let i=1;i<v.length;i++)if(v[i]>v[i-1]){P.push(`${p.n}: o nível ${ORAL_N[i][0]} (${fmtP(v[i])}) vale mais do que ${ORAL_N[i-1][0]} (${fmtP(v[i-1])}).`);break}
    if(v.some(x=>x<0))P.push(`${p.n}: há pontuações negativas.`)});
  if(Math.abs(tot-(+c.total||0))>0.05)P.push(`A soma das pontuações máximas (${fmtP(tot)}) não corresponde à cotação total (${fmtP(c.total)}).`);return P}
function oralAjustar(c){const soma=ORAL_P.reduce((s,p)=>s+(+c.pesos[p.k]||0),0);if(soma>0&&Math.abs(soma-100)>0.01)ORAL_P.forEach(p=>c.pesos[p.k]=r2((+c.pesos[p.k]||0)*100/soma));
  ORAL_P.forEach(p=>{const m=c.man[p.k];if(!m)return;const top=oralPts(c,p.k,'N4');const mx=oralMax(c,p.k);const f=top>0?mx/top:0;const nm={};let ant=Infinity;ORAL_N.forEach(([n])=>{let v=m[n]!=null&&m[n]!==''?r2(+m[n]*f):oralAuto(c,p.k,n);if(n==='N4')v=mx;v=Math.max(0,Math.min(v,ant));nm[n]=v;ant=v});c.man[p.k]=nm})}
/* aviso modal acessível (diálogo nativo, foco preso, Esc fecha) */
function avisoModal(titulo,itens,botoes){return new Promise(res=>{const d=document.createElement('dialog');d.className='amodal';d.setAttribute('aria-labelledby','am-t');d.setAttribute('aria-describedby','am-d');
  d.innerHTML=`<div class="amh">${ic('alert',22)}<h2 id="am-t">${esc(titulo)}</h2></div><div id="am-d"><ul>${itens.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="row amb">${botoes.map((b,i)=>`<button type="button" class="btn ${b.c||''}" data-amb="${i}">${b.t}</button>`).join('')}</div>`;
  document.body.appendChild(d);const fim=v=>{try{d.close()}catch(_){}d.remove();res(v)};d.addEventListener('cancel',e=>{e.preventDefault();fim(null)});d.querySelectorAll('[data-amb]').forEach(b=>b.onclick=()=>fim(botoes[+b.dataset.amb].v));
  try{d.showModal()}catch(_){d.setAttribute('open','')}const p=d.querySelector('.btn.pri')||d.querySelector('[data-amb]');if(p)p.focus()})}
async function oralValidar(t,depois){const c=oralM(t).cfg;const P=oralProblemas(c);if(!P.length){save();depois&&depois();return}if(document.querySelector('dialog.amodal'))return;
  const v=await avisoModal('As cotações não estão de acordo com os pesos',P,[{t:ic('check',15)+' Ajustar aos Pesos',c:'pri',v:'aj'},{t:'Manter Assim',v:'ok'}]);
  if(v==='aj'){oralAjustar(c);toast('Cotações ajustadas aos pesos','ok')}save();depois&&depois()}
function oralTotal(t,aid){const o=oralM(t);const r=o.regs[aid];if(!r||!r.n)return null;const ks=ORAL_P.filter(p=>r.n[p.k]!=null&&r.n[p.k]!=='');if(!ks.length)return null;return {pts:r2(ks.reduce((s,p)=>s+oralPts(o.cfg,p.k,r.n[p.k]),0)),completo:ks.length===ORAL_P.length}}
function vOral(){const t=T();if(!t)return go('turmas');const o=oralM(t);const c=o.cfg;const al=alunosFiltro(t);const P=oralProblemas(c);const org=oralOrg(o);const alO=org.modo==='ind'?al:al.slice().sort((x,y)=>((+(o.regs[x.id]||{}).p||999)-(+(o.regs[y.id]||{}).p||999))||String((o.regs[x.id]||{}).g||'~').localeCompare(String((o.regs[y.id]||{}).g||'~')));
  barBtns([{id:'b-orpdf',t:ic('file',15)+' Ficha de Registo (PDF)',f:()=>oralPdf(t)},{id:'b-orcsv',t:ic('download',15)+' Exportar CSV',f:()=>download('Oral '+t.nome+'.csv',csv([['N.º','Nome',...(oralOrg(o).modo!=='ind'?[oralOrg(o).modo==='par'?'Par':'Grupo']:[]),'Guião',...ORAL_P.map(p=>p.n),'Total','Cotação','%'],...al.map(a=>{const r=o.regs[a.id]||{n:{}};const tt=oralTotal(t,a.id);return [a.num,a.nome,...(oralOrg(o).modo!=='ind'?[r.p||'']:[]),r.g||'',...ORAL_P.map(p=>r.n&&r.n[p.k]?r.n[p.k]+' ('+fmtP(oralPts(c,p.k,r.n[p.k]))+')':''),tt?fmtP(tt.pts):'',fmtP(c.total),tt&&c.total?fmtP(100*tt.pts/c.total):'']})]),'text/csv')}]);
  const tots=al.map(a=>oralTotal(t,a.id)).filter(x=>x&&x.completo).map(x=>x.pts);const med=tots.length?tots.reduce((s,x)=>s+x,0)/tots.length:null;
  const cel=(p,n)=>{const m=c.man[p.k]&&c.man[p.k][n]!=null&&c.man[p.k][n]!=='';return `<td><input class="txtin orc ${m?'man':''}" data-orc="${p.k}|${n}" value="${fmtP(oralPts(c,p.k,n))}" inputmode="decimal" aria-label="${esc(p.n)}, nível ${n}: pontos" title="${m?'Valor editado à mão':'Valor proporcional ao peso'}"></td>`};
  $('#view').innerHTML=`<div class="kpis"><div class="kpi"><div class="l">${ic('users',14)} Avaliados</div><div class="v">${tots.length}</div><div class="mut">de ${al.length} alunos</div></div><div class="kpi"><div class="l">${ic('chart',14)} Média</div><div class="v vt">${med!=null?fmtP(med):'—'}</div><div class="mut">em ${fmtP(c.total)} pontos</div></div></div>
  <details class="card orcot" id="or-cot" ${UI.orCot||P.length?'open':''}><summary class="row" style="cursor:pointer;list-style:none"><h2 style="margin:0">${ic('sliders',18)} Cotações e Pesos</h2><span class="tag ${P.length?'bad':'ok'}">${P.length?P.length+' aviso'+(P.length>1?'s':''):'De acordo com os pesos'}</span><span class="sp1"></span><span class="btn sm dsalt">${ic('pencil',13)} Alterar</span><span class="btn sm dsfec">${ic('x',12)} Fechar</span></summary>
    <p class="hint">Critérios oficiais (Inglês 358, Parte D): 5 parâmetros × N4 12 · N3 8 · N2 6 · N1 2 · 0 pontos = 60. Mude a cotação total e os pesos — as pontuações de cada nível são recalculadas em proporção. Pode editar qualquer valor à mão (fica a azul); se deixar de bater certo com os pesos, aparece um aviso.</p>
    <div class="row" style="gap:10px;flex-wrap:wrap;align-items:end;margin-bottom:10px"><div><label for="or-tot">Cotação Total</label><input id="or-tot" type="number" min="1" step="any" value="${c.total}" style="width:110px" inputmode="decimal"></div>
      <div class="seg" role="group" aria-label="Cotações frequentes">${[60,100,200,20].map(v=>`<button type="button" data-ortot="${v}" class="${+c.total===v?'on':''}">${v===20?'20 valores':v+' pontos'}</button>`).join('')}</div><span class="sp1"></span>
      <button type="button" class="btn sm" id="or-eq">${ic('refresh',13)} Pesos Iguais</button><button type="button" class="btn sm" id="or-rep">${ic('refresh',13)} Repor Proporcional</button></div>
    <div class="tblw"><table class="lst orct"><thead><tr><th scope="col">Parâmetro</th><th scope="col">Peso</th>${ORAL_N.map(([n,b])=>`<th scope="col">${n==='0'?'Abaixo de N1':n}<div class="dh">oficial ${b}</div></th>`).join('')}</tr></thead><tbody>
    ${ORAL_P.map(p=>`<tr><th scope="row" style="text-align:left"><b>${esc(p.n)}</b>${p.s?`<div class="dh">${esc(p.s)}</div>`:''}</th><td class="nw"><input class="txtin orw" data-orw="${p.k}" value="${fmtP(c.pesos[p.k])}" inputmode="decimal" aria-label="Peso de ${esc(p.n)} em percentagem" style="width:64px"> %</td>${ORAL_N.map(([n])=>cel(p,n)).join('')}</tr>`).join('')}
    </tbody><tfoot><tr><th scope="row" style="text-align:left">Total</th><td>${fmtP(ORAL_P.reduce((s,p)=>s+(+c.pesos[p.k]||0),0))} %</td><td><b>${fmtP(ORAL_P.reduce((s,p)=>s+oralPts(c,p.k,'N4'),0))}</b></td><td colspan="4"></td></tr></tfoot></table></div>
    ${P.length?`<div class="alert w" role="status" style="margin-top:10px">${P.map(esc).join('<br>')} <button class="btn sm" id="or-aj">Ajustar aos Pesos</button></div>`:''}</details>
  ${oralOrgCard(t,o,org,al)}
  <div class="card"><div class="row" style="flex-wrap:wrap;gap:10px"><h2 style="margin:0">${ic('fala',18)} Ficha de Registo — Componente Oral</h2>${selOrigem(t)}<span class="sp1"></span><label for="or-data" class="mut" style="margin:0">Data</label><input type="date" id="or-data" value="${esc(o.data||'')}" style="width:auto"></div>
    <p class="hint">Assinale, para cada parâmetro, o nível observado (toque longo ou passe o rato para ver o descritor). Um desempenho abaixo de N1 vale 0. Em caso de dúvida entre dois níveis, opte pelo mais elevado.</p>
    ${al.length?`<div class="tblw"><table class="lst orreg"><thead><tr><th scope="col">N.º</th><th scope="col">Aluno</th>${org.modo!=='ind'?`<th scope="col">${org.modo==='par'?'Par':'Grupo'}</th>`:''}<th scope="col">Guião</th>${ORAL_P.map(p=>`<th scope="col" title="${esc(p.n+(p.s?' ('+p.s+')':''))}">${esc(p.n.split(/[ /,]/)[0])}<div class="dh">${fmtP(oralMax(c,p.k))}</div></th>`).join('')}<th scope="col">Total</th></tr></thead><tbody>
      ${alO.map(a=>{const r=o.regs[a.id]||{n:{}};const tt=oralTotal(t,a.id);return `<tr data-ora="${a.id}" ${org.modo!=='ind'&&r.p?`style="box-shadow:inset 4px 0 ${RODA_CORES[(r.p-1)%RODA_CORES.length]}"`:''}><td class="n">${esc(numAl(a))}</td><td style="text-align:left"><span class="oral-al">${avatar(a,26)}<span>${esc(a.nome)}${tagOrig(t,a)}</span></span></td>${org.modo!=='ind'?`<td><input class="txtin" data-orp="${a.id}" value="${r.p||''}" style="width:48px;text-align:center" inputmode="numeric" aria-label="${org.modo==='par'?'Par':'Grupo'} de ${esc(a.nome)}" ${org.form!=='manual'?'title="Também pode mudar à mão"':''}></td>`:''}<td><input class="txtin" data-org="${a.id}" value="${esc(r.g||'')}" style="width:52px;text-align:center" autocapitalize="characters" maxlength="3" aria-label="Guião de ${esc(a.nome)}"></td>
        ${ORAL_P.map(p=>`<td><div class="orlv" role="radiogroup" aria-label="${esc(p.n)} — ${esc(a.nome)}">${ORAL_N.map(([n])=>`<button type="button" role="radio" aria-checked="${r.n&&r.n[p.k]===n?'true':'false'}" class="${r.n&&r.n[p.k]===n?'on':''}" data-orn="${a.id}|${p.k}|${n}" title="${esc(n==='0'?'Abaixo de N1 — 0 pontos':n+' — '+fmtP(oralPts(c,p.k,n))+' pts: '+p.d[n])}">${n==='0'?'0':n}</button>`).join('')}</div></td>`).join('')}
        <td class="calc orsum" data-ortc="${a.id}"><b>${tt?fmtP(tt.pts):'—'}</b>${tt&&!tt.completo?'<div class="dh">incompleto</div>':''}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">Nenhum aluno frequenta a disciplina.</div>'}</div>`;
  const re=()=>manterPosicao(vOral);
  const det=$('#or-cot');det.addEventListener('toggle',()=>{UI.orCot=det.open});
  $('#or-tot').onchange=e=>{const v=parseFloat(String(e.target.value).replace(',','.'));if(!(v>0))return;const f=v/(+c.total||v);c.total=v;Object.values(c.man).forEach(m=>Object.keys(m).forEach(n=>{if(m[n]!=null&&m[n]!=='')m[n]=r2(+m[n]*f)}));oralValidar(t,re)};
  $$('[data-ortot]').forEach(b=>{if(b.tagName!=='BUTTON')return;b.onclick=()=>{const v=+b.dataset.ortot;const f=v/(+c.total||v);c.total=v;Object.values(c.man).forEach(m=>Object.keys(m).forEach(n=>{if(m[n]!=null&&m[n]!=='')m[n]=r2(+m[n]*f)}));oralValidar(t,re)}});
  $('#or-eq').onclick=()=>{ORAL_P.forEach(p=>c.pesos[p.k]=20);c.man={};save();re()};$('#or-rep').onclick=()=>{c.man={};save();toast('Pontuações proporcionais aos pesos','ok');re()};
  const aj=$('#or-aj');if(aj)aj.onclick=()=>{oralAjustar(c);save();re()};
  $$('[data-orw]').forEach(i=>i.onchange=()=>{const v=parseFloat(String(i.value).replace(',','.'));c.pesos[i.dataset.orw]=isNaN(v)?0:v;delete c.man[i.dataset.orw];oralValidar(t,re)});
  $$('[data-orc]').forEach(i=>i.onchange=()=>{const [k,n]=i.dataset.orc.split('|');const v=parseFloat(String(i.value).replace(',','.'));c.man[k]=c.man[k]||{};if(isNaN(v)||i.value.trim()===''){delete c.man[k][n]}else c.man[k][n]=v;if(!Object.keys(c.man[k]).length)delete c.man[k];oralValidar(t,re)});
  const dt=$('#or-data');if(dt)dt.onchange=()=>{o.data=dt.value;save()};
  $$('[data-org]').forEach(i=>i.onchange=()=>{const r=o.regs[i.dataset.org]=o.regs[i.dataset.org]||{n:{}};r.g=i.value.trim().toUpperCase();save()});
  oralOrgLigar(t,o,org,al,re);
  $$('[data-orn]').forEach(b=>b.onclick=()=>{const [aid,k,n]=b.dataset.orn.split('|');const r=o.regs[aid]=o.regs[aid]||{n:{}};r.n=r.n||{};r.n[k]=r.n[k]===n?'':n;save();
    const g=b.parentElement;g.querySelectorAll('button').forEach(x=>{const on=x.dataset.orn===b.dataset.orn&&r.n[k]===n;x.classList.toggle('on',on);x.setAttribute('aria-checked',on?'true':'false')});
    const tt=oralTotal(t,aid);const cell=$(`[data-ortc="${aid}"]`);if(cell)cell.innerHTML=`<b>${tt?fmtP(tt.pts):'—'}</b>${tt&&!tt.completo?'<div class="dh">incompleto</div>':''}`;anunciar(tt?'Total '+fmtP(tt.pts):'')});
}
function oralPdf(t){const o=oralM(t);const c=o.cfg;const al=alunosFiltro(t);const e=escolaDe(t);
  return pdfDocumento({titulo:'Ficha de Registo — Componente Oral',subtitulo:t.nome+' · '+t.disciplina+(o.data?' · '+fmtD(o.data):''),escola:e,turma:t,paisagem:true,
    blocos:[{p:'Pontuações por nível: '+ORAL_P.map(p=>p.n+' '+ORAL_N.map(([n])=>n+' '+fmtP(oralPts(c,p.k,n))).join('/')).join(' · ')+'. Cotação total: '+fmtP(c.total)+'.'},
      {tabela:{cab:['N.º','Nome','Guião',...ORAL_P.map(p=>p.n.split(/[ /,]/)[0]),'Total'],linhas:al.map(a=>{const r=o.regs[a.id]||{n:{}};const tt=oralTotal(t,a.id);return [a.num,a.nome,r.g||'',...ORAL_P.map(p=>r.n&&r.n[p.k]?r.n[p.k]+' · '+fmtP(oralPts(c,p.k,r.n[p.k])):''),tt?fmtP(tt.pts):'']}),larg:[.05,.29,.06,.11,.11,.11,.11,.11,.05]}}],
    assinaturas:[profAssin(profGenProfX()==='F'?'A Professora Classificadora':profGenProfX()==='M'?'O Professor Classificador':'O(A) Professor(a) Classificador(a)')]},'Oral '+t.nome)}
if(!ICONS.mic)ICONS.mic='<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>';
TITLES.oral='Produção oral';NEEDS_T.push('oral');
{const _go=go;go=function(v){const r=_go.apply(this,arguments);if(go._f&&!go._f.oral)go._f.oral=vOral;return r}}
{const h=$('#tnavHold');const ref=h&&h.querySelector('[data-v="instrumentos"]');if(ref&&!h.querySelector('[data-v="oral"]')){ref.insertAdjacentHTML('afterend',`<button class="nav tnav" data-v="oral" title="Produção oral"><span data-ico="mic"></span><span class="lbl">Produção Oral</span></button>`);const b=h.querySelector('[data-v="oral"] [data-ico]');if(b)b.innerHTML=ic('fala',18)}}
AJUDA.push({id:'oral',ic:'mic',t:'Produção Oral (Componente Oral de Inglês)',gif:null,txt:`<p>Turma › <b>Produção Oral</b> segue os critérios da Parte D (Componente Oral) de Inglês 358: cinco parâmetros — Âmbito, Correção/Controlo, Fluência, Desenvolvimento Temático/Coerência/Coesão e Interação — com os níveis N4 (12), N3 (8), N2 (6), N1 (2) e 0.</p><ul><li><b>Cotações e Pesos</b>: mude a cotação total (60, 100, 200 pontos ou 20 valores) e o peso de cada parâmetro; as pontuações de cada nível mudam em proporção.</li><li>Pode editar qualquer pontuação à mão; se deixar de bater certo com os pesos (ou os pesos não somarem 100 %), aparece um aviso com a opção <b>Ajustar aos Pesos</b>.</li><li><b>Ficha de Registo</b>: para cada aluno indique o guião e toque no nível de cada parâmetro (o descritor aparece na dica); o total é somado automaticamente. Exporta em PDF (como a ficha oficial) e CSV.</li></ul>`});

/* Avaliação Final › Vista para o Conselho de Turma: turmas juntas separadas lado a lado, com miniaturas e a nota do período */
function ctDados(t,p){const al=alunosAval(t);const grupos=t.origens&&t.origens.length?t.origens.map(o=>({nome:o,al:al.filter(a=>a.origem===o)})):[{nome:t.nome,al}];
  grupos.forEach(g=>{g.L=g.al.map(a=>{const nf=ponderada(t,pctsFinal(t,a.id,p));const atr=((t.atrib||{})[p]||{})[a.id];return {a,nf,niv:nivel(t,nf),atr:atr!==''&&atr!=null?atr:null}}).sort((x,y)=>(+(x.a.numOrig!=null&&x.a.numOrig!==''?x.a.numOrig:x.a.num)||0)-(+(y.a.numOrig!=null&&y.a.numOrig!==''?y.a.numOrig:y.a.num)||0));
    const ns=g.L.map(l=>l.nf).filter(x=>x!=null);g.media=ns.length?ns.reduce((s,x)=>s+x,0)/ns.length:null;g.neg=g.L.filter(l=>l.nf!=null&&negativa(t,l.nf)).length;g.av=ns.length});return grupos}
function vAvaliacaoCT(){const t=T();const P=periodos();if(!UI.per||!P.includes(UI.per))UI.per=perAtual(t);const p=UI.per;const G=ctDados(t,p);
  barBtns([{id:'b-ctv',t:ic('grid',15)+' Ver Pauta',f:()=>{UI.avCT=false;vAvaliacao()}},{id:'b-ctpdf',t:ic('file',15)+' Exportar PDF',f:()=>ctPdf(t,p)}]);
  $('#view').innerHTML=`<div class="card wide"><div class="row" style="flex-wrap:wrap;gap:10px"><h2 style="margin:0">${ic('users',18)} Conselho de Turma — ${esc(perNome(p))}</h2><div class="tabs" style="margin:0">${P.map(x=>`<button data-ctp="${x}" class="${x===p?'on':''}">${perNome(x)}</button>`).join('')}</div><span class="sp1"></span><span class="mut">${esc(t.disciplina)} · ${isSec(t)?'nota final (0–20) e nível proposto':'nível final'}${t.bloq&&t.bloq[p]?' · '+ic('shield',13)+' bloqueado':''}</span></div>
    <p class="hint">Uma coluna por turma${G.length>1?' (turmas juntas na disciplina, conselhos de turma separados)':''}, para confirmar as classificações em cada conselho. A vermelho as negativas; “atribuída” mostra o nível dado em conselho quando difere do proposto.</p>
    <div class="ctcols" style="--n:${G.length}">${G.map(g=>`<section class="ctcol" aria-labelledby="ct-${esc(g.nome).replace(/\W/g,'')}"><header class="cth"><h3 id="ct-${esc(g.nome).replace(/\W/g,'')}">${esc(g.nome)}</h3><span class="mut">${g.al.length} alunos · média ${g.media!=null?fmtNota(t,g.media):'—'} · ${g.neg} negativa${g.neg===1?'':'s'}</span></header>
      <ul class="ctl">${g.L.map(l=>`<li class="cti ${l.nf!=null&&negativa(t,l.nf)?'neg':''}"><span class="ctf">${avatar(l.a,40)}</span><span class="ctn"><b>${esc(numAl(l.a))}.</b> ${esc(l.a.nome)}</span><span class="ctv"><b class="ctnota">${l.nf!=null?(isSec(t)?fmtNota(t,l.nf):l.niv):'—'}</b>${isSec(t)&&l.nf!=null?`<span class="mut">nível ${esc(l.niv)}</span>`:''}${l.atr!=null&&String(l.atr)!==String(l.niv)?`<span class="tag bad">atribuída ${esc(l.atr)}</span>`:''}</span></li>`).join('')||'<li class="mut">Sem alunos.</li>'}</ul></section>`).join('')}</div></div>`;
  $$('[data-ctp]').forEach(b=>b.onclick=()=>{UI.per=+b.dataset.ctp;vAvaliacaoCT()})}
function ctPdf(t,p){const G=ctDados(t,p);const spec={titulo:'Classificações para o Conselho de Turma',subtitulo:t.disciplina+' · '+perNome(p)+' · '+profNome(S.cfg.professor),escola:escolaDe(t),turma:t,blocos:[],assinaturas:[profAssin()]};
  G.forEach((g,i)=>{if(i)spec.blocos.push({pb:true});spec.blocos.push({h:'Turma '+g.nome+' — média '+(g.media!=null?fmtNota(t,g.media):'—')+' · '+g.neg+' negativa(s)'},{fotos:g.L.map(l=>({src:fotoSrc(l.a),leg:l.a.num+'. '+l.a.nome.split(' ')[0]+' '+l.a.nome.split(' ').slice(-1)[0],sub:l.nf!=null?(isSec(t)?fmtNota(t,l.nf)+' · nível '+l.niv:'Nível '+l.niv)+(l.atr!=null&&String(l.atr)!==String(l.niv)?' (atrib. '+l.atr+')':''):'—',ini:l.a.nome.split(' ').map(w=>w[0]).slice(0,2).join('')}))})});
  return pdfDocumento(spec,'Conselho de Turma '+t.nome+' '+p+'.º')}
{const _va=vAvaliacao;vAvaliacao=function(){if(UI.avCT)return vAvaliacaoCT();const r=_va.apply(this,arguments);try{const bx=$('#barx');if(bx&&!$('#b-ctv')){const b=document.createElement('button');b.className='btn pri';b.id='b-ctv';b.innerHTML=ic('users',15)+' Vista Conselho de Turma';b.onclick=()=>{UI.avCT=true;vAvaliacao()};bx.prepend(b)}}catch(_){}return r}}
{const _ev=exportarVistaPdf;exportarVistaPdf=function(){if(VIEW==='avaliacao'&&UI.avCT&&T())return ctPdf(T(),UI.per||perAtual(T()));return _ev.apply(this,arguments)}}

/* ---------- Biblioteca: pastas (próprias + uma por turma, automáticas) ---------- */
const recPastasM=()=>S.cfg.recPastas=S.cfg.recPastas||[];
const pastaTurma=t=>'Turmas/'+t.nome+(t.disciplina?' · '+t.disciplina:'');
function pastasAuto(){const a=A();return a?a.turmas.filter(t=>escolaDe(t)===EC()).map(t=>({id:pastaTurma(t),nome:t.nome,sub:t.disciplina,t})):[]}
function barraPastas(R){const f=UI.recF=UI.recF||{};const cur=f.pasta||'';const n=id=>R.filter(r=>id==='__sem'?!r.pasta:r.pasta===id||(r.pasta||'').startsWith(id+'/')).length;
  const chip=(id,nome,icn,sub,t)=>`<button type="button" class="recpf ${cur===id?'on':''} ${t?'rect':''}" data-rpf="${esc(id)}" aria-pressed="${cur===id}">${t?anoBadge(t,'sm'):ic(icn,15)}<span class="recpn">${esc(nome)}${sub?`<small>${esc(sub)}</small>`:''}</span><span class="recpc">${id===''?R.length:n(id)}</span></button>`;
  return `<div class="card recpastas"><div class="row" style="gap:8px;margin-bottom:8px"><h2 style="margin:0;font-size:15px">${ic('folder',16)} Pastas</h2><span class="sp1"></span><button type="button" class="btn sm" id="rp-nova">${ic('plus',13)} Nova Pasta</button>${cur&&recPastasM().includes(cur)?`<button type="button" class="btn sm" id="rp-ren">${ic('pencil',13)} Mudar o Nome</button><button type="button" class="btn sm dng" id="rp-del">${ic('trash',13)} Apagar Pasta</button>`:''}</div>
    <div class="recpl" role="group" aria-label="Pastas">${chip('','Todos os Recursos','folder')}${chip('__sem','Sem Pasta','file')}${recPastasM().map(p=>chip(p,p,'folder')).join('')}</div>
    ${pastasAuto().length?`<div class="recpg">Turmas <span class="mut">· criadas automaticamente</span></div><div class="recpl" role="group" aria-label="Pastas das turmas">${pastasAuto().map(p=>chip(p.id,p.nome,'school',p.sub,p.t)).join('')}</div>`:''}
    <p class="hint" style="margin:8px 0 0">Arraste um recurso para uma pasta (ou use o botão ${ic('folder',12)} do recurso). Os ficheiros carregados com uma pasta aberta ficam nessa pasta.</p></div>`}
function moverRecursoDlg(id){const r=recursos().find(x=>x.id===id);if(!r)return;const ops=[['','Sem pasta'],...recPastasM().map(p=>[p,p]),...pastasAuto().map(p=>[p.id,'Turma '+p.nome+(p.sub?' · '+p.sub:'')])];
  openDrawer('Mover para Pasta',`<div class="ed"><p class="hint" style="margin-top:0"><b>${esc(r.titulo)}</b></p><div class="recmv" role="radiogroup" aria-label="Pasta">${ops.map(([v,l])=>`<button type="button" role="radio" aria-checked="${(r.pasta||'')===v}" class="btn ${(r.pasta||'')===v?'pri':''}" data-rmv="${esc(v)}">${ic(v.startsWith('Turmas/')?'school':'folder',15)} ${esc(l)}</button>`).join('')}</div></div>`);
  $$('[data-rmv]').forEach(b=>b.onclick=()=>{r.pasta=b.dataset.rmv;r.atual=Date.now();save();closeDrawer();toast('Movido para '+(r.pasta?r.pasta.replace(/^Turmas\//,'turma '):'sem pasta'),'ok');vRecursos()})}
{const _vr=vRecursos;vRecursos=function(){const R=recursos();const f=UI.recF=UI.recF||{};
  if(UI._recAntes){const cur=f.pasta&&f.pasta!=='__sem'?f.pasta:'';if(cur)R.forEach(r=>{if(!UI._recAntes.has(r.id)&&!r.pasta)r.pasta=cur});UI._recAntes=null;save()}
  /* filtro por pasta: esconde temporariamente os recursos de outras pastas */
  const cur=f.pasta||'';let ret;if(cur){const keep=R.slice();const L=R.filter(r=>cur==='__sem'?!r.pasta:r.pasta===cur||(r.pasta||'').startsWith(cur+'/'));R.length=0;R.push(...L);try{ret=_vr.apply(this,arguments)}finally{R.length=0;R.push(...keep)}}else ret=_vr.apply(this,arguments);
  try{const dz=$('#rec-drop');if(dz){dz.insertAdjacentHTML('beforebegin',barraPastas(R));}
    $$('.recc[data-rec]').forEach(c=>{const r=R.find(x=>x.id===c.dataset.rec);c.draggable=true;c.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/x-rec',c.dataset.rec);e.dataTransfer.effectAllowed='move'});
      const ac=c.querySelector('.reca');if(ac&&!ac.querySelector('[data-rmov]'))ac.insertAdjacentHTML('beforeend',`<button class="btn sm ico" data-rmov="${c.dataset.rec}" aria-label="Mover para pasta" title="Mover para pasta">${ic('folder',13)}</button>`);
      if(r&&r.pasta&&!cur){const b=c.querySelector('.recm');if(b)b.insertAdjacentHTML('afterbegin',`<span class="tag">${ic('folder',11)} ${esc(r.pasta.replace(/^Turmas\//,''))}</span>`)}});
    $$('[data-rmov]').forEach(b=>b.onclick=e=>{e.stopPropagation();moverRecursoDlg(b.dataset.rmov)});
    $$('[data-rpf]').forEach(b=>{b.onclick=()=>{f.pasta=b.dataset.rpf;manterPosicao(vRecursos)};
      b.ondragover=e=>{if([...e.dataTransfer.types].includes('text/x-rec')){e.preventDefault();b.classList.add('over')}};b.ondragleave=()=>b.classList.remove('over');
      b.ondrop=e=>{e.preventDefault();b.classList.remove('over');const id=e.dataTransfer.getData('text/x-rec');const r=R.find(x=>x.id===id);if(!r)return;const v=b.dataset.rpf;r.pasta=v==='__sem'?'':v;r.atual=Date.now();save();toast('Movido para '+(r.pasta?r.pasta.replace(/^Turmas\//,'turma '):'sem pasta'),'ok');manterPosicao(vRecursos)}});
    const nv=$('#rp-nova');if(nv)nv.onclick=()=>{const n=(prompt('Nome da nova pasta:')||'').trim().replace(/\//g,'-');if(!n)return;if(recPastasM().includes(n))return toast('Já existe uma pasta com esse nome');recPastasM().push(n);recPastasM().sort((x,y)=>x.localeCompare(y,'pt'));f.pasta=n;save();vRecursos()};
    const rn=$('#rp-ren');if(rn)rn.onclick=()=>{const n=(prompt('Novo nome da pasta:',cur)||'').trim().replace(/\//g,'-');if(!n||n===cur)return;const P=recPastasM();P[P.indexOf(cur)]=n;R.forEach(r=>{if(r.pasta===cur)r.pasta=n});f.pasta=n;save();vRecursos()};
    const dl=$('#rp-del');if(dl)dl.onclick=()=>{const k=R.filter(r=>r.pasta===cur).length;if(!confirm(`Apagar a pasta “${cur}”?${k?' Os '+k+' recursos ficam sem pasta (não são apagados).':''}`))return;const P=recPastasM();P.splice(P.indexOf(cur),1);R.forEach(r=>{if(r.pasta===cur)r.pasta=''});f.pasta='';save();vRecursos()};
    const inp=$('#rec-in');if(inp)inp.addEventListener('change',()=>{UI._recAntes=new Set(R.map(r=>r.id))},true);if(dz)dz.addEventListener('drop',()=>{UI._recAntes=new Set(R.map(r=>r.id))},true);
  }catch(e){console.warn(e)}return ret}}

/* ---------- Aulas e Sumários: janela da aula (sumário + presenças + ocorrências) ---------- */
const PRES=[{k:'P',n:'Presente',ic:'check',c:'#16a34a'},{k:'F',n:'Falta de presença',ic:'x',c:'#dc2626'},{k:'FD',n:'Falta disciplinar',ic:'shield',c:'#9a3412'}];
const PRES_X=[{k:'fm',n:'Falta de material',ic:'book',c:'#b45309',tipo:'material'},{k:'at',n:'Atraso',ic:'clock',c:'#2563eb',tipo:'atraso'}];
const OCOR=[['','Sem ocorrências'],['grave','Grave'],['media','Média'],['leve','Leve'],['positiva','Positiva']];
function sincFaltasAula(t,x,aid,p){const al=t.alunos.find(z=>z.id===aid);if(!al)return;al.faltasAl=al.faltasAl||[];const base='s:'+x.k+':';
  al.faltasAl=al.faltasAl.filter(f=>!String(f.id).startsWith(base));const obs='Aula de '+t.disciplina+' · '+fmtHM(x.ini)+'–'+fmtHM(x.fim);
  if(p.f==='F')al.faltasAl.push({id:base+'F',data:x.data,tempos:1,tipo:'injust',obs});if(p.f==='FD')al.faltasAl.push({id:base+'FD',data:x.data,tempos:1,tipo:'disc',obs});
  if(p.fm)al.faltasAl.push({id:base+'FM',data:x.data,tempos:1,tipo:'material',obs});if(p.at)al.faltasAl.push({id:base+'AT',data:x.data,tempos:1,tipo:'atraso',obs})}
function resumoPres(s){const P=Object.values(s.pres||{});const c=k=>P.filter(p=>p.f===k).length;const fm=P.filter(p=>p.fm).length,at=P.filter(p=>p.at).length,oc=P.filter(p=>p.oc&&p.oc.n).length;
  return [c('F')?c('F')+' F':'',c('FD')?c('FD')+' FD':'',fm?fm+' FM':'',at?at+' At':'',oc?oc+' ocorr.':''].filter(Boolean).join(' · ')}
function aulaDlg(t,k,tabIni){const a=A();const L=listaAulas(t,a);const x=L.find(z=>z.k===k);if(!x)return;const SM=sumariosT(a,t);const s=JSON.parse(JSON.stringify(SM[k]||{}));s.pres=s.pres||{};
  const al=alunosAval(t);let tab=tabIni||'sum';let viuP=tab==='pres';const aberto=new Set();
  const d=document.createElement('dialog');d.className='auladlg';d.setAttribute('aria-labelledby','au-t');document.body.appendChild(d);
  const dataL=x.data.split('-').reverse().join('-');
  const linha=a2=>{const p=s.pres[a2.id]||{};const f=p.f||'P';const ab=aberto.has(a2.id);return `<li class="aupr ${f!=='P'?'aus':''}"><div class="auprh">
      <button type="button" class="btn sm ico auexp" data-auexp="${a2.id}" aria-expanded="${ab}" aria-label="Ocorrências de ${esc(a2.nome)}">${ic('chev',14)}</button>${avatar(a2,34)}<b class="aun">${esc(numAl(a2))}</b><span class="aunm">${esc(a2.nome)}${p.oc&&p.oc.n?` <span class="tag ${p.oc.n==='positiva'?'ok':'bad'}">${esc((OCOR.find(o=>o[0]===p.oc.n)||[])[1]||'')}</span>`:''}</span>
      <span class="aubt" role="radiogroup" aria-label="Presença de ${esc(a2.nome)}">${PRES.map(o=>`<button type="button" role="radio" aria-checked="${f===o.k}" class="aui ${f===o.k?'on':''}" style="--c:${o.c}" data-aup="${a2.id}|${o.k}" title="${o.n}" aria-label="${o.n}">${ic(o.ic,16)}</button>`).join('')}</span>
      <span class="aubt">${PRES_X.map(o=>`<button type="button" aria-pressed="${!!p[o.k]}" class="aui ${p[o.k]?'on':''}" style="--c:${o.c}" data-aux="${a2.id}|${o.k}" title="${o.n}" aria-label="${o.n}">${ic(o.ic,16)}</button>`).join('')}</span></div>
      ${ab?`<div class="auoc"><label for="au-on-${a2.id}">Ocorrências</label><select id="au-on-${a2.id}" data-auon="${a2.id}">${OCOR.map(([v,l])=>`<option value="${v}" ${(p.oc&&p.oc.n||'')===v?'selected':''}>${l}</option>`).join('')}</select><textarea data-auot="${a2.id}" rows="3" aria-label="Descrição da ocorrência de ${esc(a2.nome)}" placeholder="Descreva a ocorrência…">${esc(p.oc&&p.oc.t||'')}</textarea></div>`:''}</li>`};
  const desenha=()=>{const nF=Object.values(s.pres).filter(p=>p.f&&p.f!=='P').length;
    d.innerHTML=`<form method="dialog" class="auf"><header class="auh"><div><h2 id="au-t">${x.licao?'Lição '+x.licao:'Aula'} · ${esc(t.nome)} · ${esc(t.disciplina)}</h2><p class="mut" style="margin:2px 0 0"><b>Dia</b> ${dataL} <b>das</b> ${fmtHM(x.ini)} <b>às</b> ${fmtHM(x.fim)} · <b>Docente</b> ${esc(profNome(S.cfg.professor)||'')}</p></div><button type="button" class="btn ico" data-aux0 aria-label="Fechar">${ic('x',16)}</button></header>
      <div class="tabs" role="tablist" style="margin:12px 0 0"><button type="button" role="tab" aria-selected="${tab==='sum'}" class="${tab==='sum'?'on':''}" data-aut="sum">${ic('pen',14)} Sumário${x.licao?' (n.º '+x.licao+')':''}</button><button type="button" role="tab" aria-selected="${tab==='pres'}" class="${tab==='pres'?'on':''}" data-aut="pres">${ic('users',14)} Presenças${nF?` <span class="tag bad">${nF}</span>`:''}${!s.cham&&!viuP?' <span class="tag w" title="Chamada por confirmar: abra as presenças e guarde">por confirmar</span>':''}</button></div>
      <div class="aub">${tab==='sum'?`<div class="ausum"><div><label for="au-txt">Sumário${x.licao?' n.º '+x.licao:''} <span class="mut">(turma ${esc(t.nome)})</span></label><textarea id="au-txt" rows="10" placeholder="Escreva o sumário da aula…">${esc(s.texto||'')}</textarea></div>
          <div class="ausd"><div><label for="au-obs">Observações <span class="mut">(sala de aula)</span></label><textarea id="au-obs" rows="5">${esc(s.obs||'')}</textarea></div><div><label for="au-oco">Ocorrências <span class="mut">(sala de aula)</span></label><textarea id="au-oco" rows="5">${esc(s.ocor||'')}</textarea></div></div></div>`
        :`<div class="auleg" aria-hidden="true"><span></span>${PRES.map(o=>`<span style="--c:${o.c}">${o.k}</span>`).join('')}<span class="sep"></span>${PRES_X.map(o=>`<span style="--c:${o.c}">${o.k==='fm'?'FM':'At'}</span>`).join('')}</div>
          <div class="row" style="gap:6px;margin:0 0 8px;flex-wrap:wrap"><button type="button" class="btn sm" data-auall>${ic('check',13)} Todos Presentes</button><span class="hint" style="margin:0">P · F · FD = presença, falta, falta disciplinar · FM = falta de material · At = atraso. As faltas passam para a ficha de cada aluno.</span></div>
          <ul class="auprl">${al.map(linha).join('')||'<li class="mut">Sem alunos.</li>'}</ul>`}</div>
      <footer class="auft"><span class="mut" id="au-res">${esc(resumoPres(s))}</span><span class="sp1"></span><button type="button" class="btn" data-aux0>Cancelar</button><button type="button" class="btn pri" data-auok>${ic('check',15)} Submeter</button></footer></form>`;
    const lerTxt=()=>{const tx=d.querySelector('#au-txt');if(tx){s.texto=tx.value;s.obs=d.querySelector('#au-obs').value;s.ocor=d.querySelector('#au-oco').value}d.querySelectorAll('[data-auot]').forEach(ta=>{const p=s.pres[ta.dataset.auot]=s.pres[ta.dataset.auot]||{};p.oc=p.oc||{};p.oc.t=ta.value})};
    d.querySelectorAll('[data-aut]').forEach(b=>b.onclick=()=>{lerTxt();tab=b.dataset.aut;if(tab==='pres')viuP=true;desenha();const f=d.querySelector(`[data-aut="${tab}"]`);if(f)f.focus()});
    d.querySelectorAll('[data-aux0]').forEach(b=>b.onclick=()=>fecha(false));d.querySelector('[data-auok]').onclick=()=>{lerTxt();fecha(true)};
    const foca=sel=>{const n=d.querySelector(sel);if(n)n.focus({preventScroll:true})};
    d.querySelectorAll('[data-aup]').forEach(b=>b.onclick=()=>{lerTxt();const [id,k2]=b.dataset.aup.split('|');const p=s.pres[id]=s.pres[id]||{};p.f=k2==='P'?'':k2;const sc=d.querySelector('.aub').scrollTop;desenha();d.querySelector('.aub').scrollTop=sc;foca(`[data-aup="${b.dataset.aup}"]`)});
    d.querySelectorAll('[data-aux]').forEach(b=>b.onclick=()=>{lerTxt();const [id,k2]=b.dataset.aux.split('|');const p=s.pres[id]=s.pres[id]||{};p[k2]=!p[k2];const sc=d.querySelector('.aub').scrollTop;desenha();d.querySelector('.aub').scrollTop=sc;foca(`[data-aux="${b.dataset.aux}"]`)});
    d.querySelectorAll('[data-auexp]').forEach(b=>b.onclick=()=>{lerTxt();const id=b.dataset.auexp;aberto.has(id)?aberto.delete(id):aberto.add(id);const sc=d.querySelector('.aub').scrollTop;desenha();d.querySelector('.aub').scrollTop=sc;foca(aberto.has(id)?`[data-auon="${id}"]`:`[data-auexp="${id}"]`)});
    d.querySelectorAll('[data-auon]').forEach(sl=>sl.onchange=()=>{lerTxt();const p=s.pres[sl.dataset.auon]=s.pres[sl.dataset.auon]||{};p.oc=p.oc||{};p.oc.n=sl.value;const r=d.querySelector('#au-res');if(r)r.textContent=resumoPres(s)});
    const all=d.querySelector('[data-auall]');if(all)all.onclick=()=>{lerTxt();al.forEach(a2=>{const p=s.pres[a2.id]=s.pres[a2.id]||{};p.f=''});desenha()}};
  const fecha=ok=>{if(ok){const prev=SM[k]||{};SM[k]={...prev,...s};if(viuP||Object.values(s.pres||{}).some(p=>p&&p.f))SM[k].cham=SM[k].cham||Date.now();al.forEach(a2=>sincFaltasAula(t,x,a2.id,s.pres[a2.id]||{}));saveNow();audit('Sumários','Aula registada',t.nome+' · '+x.data+' · '+fmtHM(x.ini));toast('Aula registada'+(resumoPres(s)?' · '+resumoPres(s):''),'ok')}
    try{d.close()}catch(_){}d.remove();if(ok&&VIEW==='sumarios')manterPosicao(vSumarios)};
  d.addEventListener('cancel',e=>{e.preventDefault();fecha(false)});desenha();try{d.showModal()}catch(_){d.setAttribute('open','')}
  setTimeout(()=>{const f=d.querySelector(tab==='sum'?'#au-txt':'[data-aup]');if(f)f.focus()},50)}
{const _vs=vSumarios;vSumarios=function(){const r=_vs.apply(this,arguments);try{const t=T(),a=A();if(!t||!a)return r;const SM=sumariosT(a,t);
  $$('.sumi').forEach(el=>{const ta=el.querySelector('[data-sum]');if(!ta)return;const k=ta.dataset.sum;const h=el.querySelector('.sumh');if(!h||h.querySelector('[data-aula-ab]'))return;const s=SM[k]||{};const res=resumoPres(s);
    const sp=h.querySelector('.sp1');const html=`${res?`<span class="tag ${/F|ocorr/.test(res)?'bad':''}" title="Presenças">${esc(res)}</span>`:''}`;if(sp)sp.insertAdjacentHTML('beforebegin',html);
    h.insertAdjacentHTML('beforeend',`<button class="btn sm" data-aula-ab="${esc(k)}|pres" aria-label="Presenças desta aula">${ic('users',13)} Presenças</button><button class="btn sm pri" data-aula-ab="${esc(k)}|sum">${ic('pen',13)} ${s.texto?'Abrir Aula':'Escrever Sumário'}</button>`)});
  $$('[data-aula-ab]').forEach(b=>b.onclick=()=>{const i=b.dataset.aulaAb.lastIndexOf('|');aulaDlg(t,b.dataset.aulaAb.slice(0,i),b.dataset.aulaAb.slice(i+1))});
  $$('.sumn').forEach(n=>{const el=n.closest('.sumi');const ta=el&&el.querySelector('[data-sum]');if(!ta)return;n.setAttribute('role','button');n.tabIndex=0;n.style.cursor='pointer';n.title='Abrir a aula';n.onclick=()=>aulaDlg(t,ta.dataset.sum,'sum')});
  }catch(e){console.warn(e)}return r}}
if(!ICONS.clock)ICONS.clock='<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';

