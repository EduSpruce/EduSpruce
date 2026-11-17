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
  addEventListener('keydown',e=>{if(e.key==='Tab'||String(e.key||'').startsWith('Arrow'))A11Y.kb=true},true);addEventListener('pointerdown',()=>{A11Y.kb=false},true);
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
ajustarBarra=function(){const b=document.getElementById('bar');if(!b)return;b.classList.remove('bar2');const t=$('#ttl');/* no telemóvel só conta o 2.º ajuste (o 1.º era logo desfeito e custava um recálculo da página) */if(innerWidth<=1000){ajustarTitulo();return}ajustarTitulo(17);
  if(b.scrollWidth>b.clientWidth+1||(t&&t.classList.contains('ttl2'))){b.classList.add('bar2');ajustarTitulo()}};
/* um só ajuste por imagem: a navegação e a mudança do título pediam cada uma o seu */let _abPend=false;function ajustarBarraAg(){if(_abPend)return;_abPend=true;requestAnimationFrame(()=>{_abPend=false;ajustarBarra()})}
{const _g2=go;go=function(){const r=_g2.apply(this,arguments);ajustarBarraAg();return r}}
{const t=$('#ttl');if(t&&window.ResizeObserver){let w=0;new ResizeObserver(en=>{const nw=Math.round(en[0].contentRect.width);if(nw!==w){w=nw;requestAnimationFrame(()=>{if($('#bar.bar2')||innerWidth<=1000)ajustarTitulo();else ajustarBarra()})}}).observe(t.parentElement)}
  if(t)new MutationObserver(()=>ajustarBarraAg()).observe(t,{childList:true,characterData:true,subtree:true})}

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

