/* ---------- Planta da sala de aula ---------- */
/* ===================== v1.048 · Planta da Sala (robusta) =====================
   Desenhar a sala: cada casa da grelha é um tipo — lugar (l), corredor/vazio (v), secretária do professor (p), porta (porta), janela (jan).
   pl.tipo={"r-c":tipo} (por omissão: lugar; compatível com pl.vazios antigo). Modelos: filas, pares, grupos, U, U duplo, exame.
   Distribuir: por número, alfabética, aleatória, dificuldades à frente, turma mista (forte+dificuldades), necessidades à frente.
   Lugares fixos (pl.fix[aid]) não mudam ao distribuir. A «frente» é a secretária do professor (ou o quadro, se não houver). */
const PL_SVG={pin:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76V6h6v4.76l2 3.24H7z"/><path d="M8 3h8"/></svg>',
  porta:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16"/><path d="M6 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17"/><circle cx="14" cy="12" r=".9" fill="currentColor"/></svg>',
  jan:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M12 3v18M4 12h16"/></svg>',
  mesa:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="8" width="19" height="4" rx="1"/><path d="M5 12v7M19 12v7M8 8V5h8v3"/></svg>',
  lugar:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v8H7z"/><path d="M5 12h14M7 12v8M17 12v8"/></svg>',
  vazio:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="3 3"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>'};
const PL_TIPOS=[['l','Lugar','lugar'],['v','Corredor / Vazio','vazio'],['p','Secretária do Professor','mesa'],['porta','Porta','porta'],['jan','Janela','jan']];
const PL_MOD=[['filas','Filas'],['pares','Pares'],['grupos','Grupos de 4'],['u','Em U'],['u2','U Duplo'],['exame','Exame (separados)']];
const PL_ORD=[['num','Por número'],['nome','Alfabética'],['aleat','Aleatória'],['dif','Dificuldades à frente'],['mist','Turma mista (forte + com dificuldades)'],['nec','Necessidades à frente (MSAI, notas)']];
const plCnt=(n,a)=>`<b>${n}</b> lugares para ${a} alunos${n<a?` — <b style="color:#c0392b">faltam ${a-n}</b>`:n>a?` · ${n-a} livres`:''}`;
function plTipo(pl,k){const t=pl.tipo&&pl.tipo[k];if(t)return t;return (pl.vazios||[]).includes(k)?'v':'l'}
function plSync(pl){const T_={};const V=[];for(let r=0;r<pl.filas;r++)for(let c=0;c<pl.cols;c++){const k=r+'-'+c;const ty=plTipo(pl,k);if(ty!=='l'){T_[k]=ty;V.push(k)}}pl.tipo=T_;pl.vazios=V;
  Object.keys(pl.lug||{}).forEach(k=>{const [r,c]=k.split('-').map(Number);if(r>=pl.filas||c>=pl.cols||plTipo(pl,k)!=='l')delete pl.lug[k]})}
function plModelo(pl,m){const F=pl.filas,C=pl.cols;const T_={};const put=(r,c,v)=>{if(r>=0&&c>=0&&r<F&&c<C)T_[r+'-'+c]=v};
  const frente=()=>{for(let c=0;c<C;c++)put(0,c,'v');put(0,Math.floor((C-1)/2),'p')};
  if(m==='filas'){frente()}
  else if(m==='pares'){frente();for(let r=1;r<F;r++)for(let c=0;c<C;c++)if(c%3===2)put(r,c,'v')}
  else if(m==='grupos'){frente();for(let r=1;r<F;r++)for(let c=0;c<C;c++)if((r-1)%3===2||c%3===2)put(r,c,'v')}
  else if(m==='exame'){frente();for(let r=1;r<F;r++)for(let c=0;c<C;c++)if(c%2===1)put(r,c,'v')}
  else if(m==='u'||m==='u2'){for(let r=0;r<F;r++)for(let c=0;c<C;c++){const ext=r>=1&&(c===0||c===C-1||r===F-1);const int=m==='u2'&&r>=2&&r<=F-3&&(c===2||c===C-3)||m==='u2'&&r===F-3&&c>=2&&c<=C-3;if(!ext&&!int)put(r,c,'v')}put(0,Math.floor((C-1)/2),'p')}
  pl.tipo=T_;pl.vazios=Object.keys(T_);pl.modelo=m;plSync(pl)}
function plFrente(pl){let m=null;for(let r=0;r<pl.filas&&!m;r++)for(let c=0;c<pl.cols;c++)if(plTipo(pl,r+'-'+c)==='p'){m=[r,c];break}return m||[-1.2,(pl.cols-1)/2]}
function plLugares(pl,modo){const L=[];for(let r=0;r<pl.filas;r++)for(let c=0;c<pl.cols;c++){const k=r+'-'+c;if(plTipo(pl,k)==='l')L.push({k,r,c})}
  if(modo==='leitura')return L;const [r0,c0]=plFrente(pl);L.forEach(o=>o.d=Math.hypot((o.r-r0)*1.15,(o.c-c0)*.7));return L.sort((a,b)=>a.d-b.d||a.r-b.r||a.c-b.c)}
function plNota(t,a){try{const p=perAtual(t);let v=ponderada(t,pctsFinal(t,a.id,p));if(v==null&&p>1)v=ponderada(t,pctsFinal(t,a.id,p-1));return v}catch(_){return null}}
function plNecessidade(t,pl,a){let n=0;const ac=a.acomod||[];if(ac.some(i=>acIdx(i)===0))n+=3;const md=a.medidas||{};if((md.selet||[]).length||(md.adic||[]).length)n+=2;if((md.univ||[]).length)n+=1;if((pl.notas||{})[a.id])n+=1;return n}
function plDistribuir(t,pl,ord){plSync(pl);const al=alunosAval(t);const fix=pl.fix||{};const lugOld=pl.lug||{};const novo={};const ocup=new Set();
  Object.keys(lugOld).forEach(k=>{const id=lugOld[k];if(fix[id]&&plTipo(pl,k)==='l'&&al.some(a=>a.id===id)){novo[k]=id;ocup.add(k)}});
  const fixos=new Set(Object.values(novo));let L=al.filter(a=>!fixos.has(a.id));const byNum=(x,y)=>(+x.num||999)-(+y.num||999)||x.nome.localeCompare(y.nome,'pt');
  let seats;
  if(ord==='nome'){L.sort((x,y)=>x.nome.localeCompare(y.nome,'pt'));seats=plLugares(pl,'leitura')}
  else if(ord==='aleat'){for(let i=L.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[L[i],L[j]]=[L[j],L[i]]}seats=plLugares(pl,'leitura')}
  else if(ord==='dif'){const mid=.6;L.sort((x,y)=>{const a=plNota(t,x),b=plNota(t,y);return (a==null?mid:a)-(b==null?mid:b)||byNum(x,y)});seats=plLugares(pl,'frente')}
  else if(ord==='mist'){const s=L.slice().sort((x,y)=>{const a=plNota(t,x),b=plNota(t,y);return (a==null?.6:a)-(b==null?.6:b)});const R=[];let i=0,j=s.length-1;while(i<=j){R.push(s[i++]);if(i<=j)R.push(s[j--])}L=R;seats=plLugares(pl,'leitura')}
  else if(ord==='nec'){L.sort((x,y)=>plNecessidade(t,pl,y)-plNecessidade(t,pl,x)||byNum(x,y));seats=plLugares(pl,'frente')}
  else{L.sort(byNum);seats=plLugares(pl,'leitura')}
  seats=seats.filter(s=>!ocup.has(s.k));L.forEach((a,i)=>{if(seats[i])novo[seats[i].k]=a.id});pl.lug=novo;return L.length>seats.length?L.length-seats.length:0}
function vPlanta(){const t=T();if(!t)return go('turmas');const pl=t.planta=t.planta||{filas:5,cols:6,lug:{},prof:'frente'};pl.lug=pl.lug||{};pl.fix=pl.fix||{};const al=alunosAval(t);
  const modo=UI.plModo||'lugares';const pinc=UI.plPincel||'l';plSync(pl);const sentados=new Set(Object.values(pl.lug));
  barBtns([{id:'b-pla',t:ic('sparkle',15)+' Distribuir',f:()=>{const ord=UI.plOrd||'num';const sobra=plDistribuir(t,pl,ord);save();audit('Planta da sala','Distribuição: '+((PL_ORD.find(o=>o[0]===ord)||[])[1]||ord),t.nome);vPlanta();toast(sobra?`Faltam ${sobra} lugar(es): acrescente lugares na planta`:'Alunos distribuídos'+(Object.keys(pl.fix).length?' (lugares fixos mantidos)':''),sobra?'':'ok')}},
    {id:'b-plc',t:ic('trash',15)+' Limpar',f:()=>{if(confirm('Tirar todos os alunos dos lugares? (os lugares fixos também)')){pl.lug={};pl.fix={};save();vPlanta()}}},{id:'b-plp',t:ic('printer',15)+' Imprimir',f:()=>window.print()}]);
  const nLug=plLugares(pl,'leitura').length;
  const cel=(r,c)=>{const k=r+'-'+c;const ty=plTipo(pl,k);
    if(ty!=='l'){const lab={v:'',p:'Secretária',porta:'Porta',jan:'Janela'}[ty];const ico={v:'',p:PL_SVG.mesa,porta:PL_SVG.porta,jan:PL_SVG.jan}[ty];return `<div class="pls plt-${ty} ${ty==='v'?'corr':''}" data-pl="${k}" data-plt="${ty}" title="${esc(lab||'Corredor / espaço vazio')}">${ico}${lab?`<span class="plnm">${lab}</span>`:''}</div>`}
    const id=pl.lug[k];const x=id&&t.alunos.find(z=>z.id===id);const nt=x&&(pl.notas||{})[x.id];const fx=x&&pl.fix[x.id];
    if(modo==='desenhar')return `<div class="pls plt-l ${x?'oc':''}" data-pl="${k}" data-plt="l">${PL_SVG.lugar}<span class="plnm">${x?esc(numAl(x)+' '+x.nome.split(' ')[0]):'Lugar'}</span></div>`;
    return `<div class="pls ${x?'oc':''} ${nt?'tem-nota':''} ${fx?'fixo':''}" data-pl="${k}" ${x?`draggable="true" data-pla="${x.id}"`:''}>${x?`<button type="button" class="plnb" data-plnota="${x.id}" title="Nota sobre ${esc(x.nome.split(' ')[0])}" aria-label="Nota">${ic(nt?'pen':'plus',13)}</button><button type="button" class="plfx ${fx?'on':''}" data-plfix="${x.id}" title="${fx?'Lugar fixo — não muda ao distribuir (toque para soltar)':'Fixar este lugar (não muda ao distribuir)'}" aria-pressed="${!!fx}" aria-label="Lugar fixo">${PL_SVG.pin}</button>${avatar(x,pl.cols>=8?54:76)}<span class="pln"><b>${esc(numAl(x))}</b> ${esc(x.nome.split(' ')[0])} ${esc(x.nome.split(' ').slice(-1)[0])}</span>${nt?`<span class="plnt">${esc(nt)}</span>`:''}`:'<span class="mut">livre</span>'}</div>`};
  const fora=al.filter(x=>!sentados.has(x.id));
  $('#view').innerHTML=`<div class="card plcard"><div class="row plhd"><h2 style="margin:0">${ic('grid',18)} Planta da Sala — ${esc(t.nome)}</h2><span class="sp1"></span>
      <div class="tabs plmodos" style="margin:0"><button type="button" data-plm="lugares" class="${modo==='lugares'?'on':''}">${ic('users',15)} Lugares</button><button type="button" data-plm="desenhar" class="${modo==='desenhar'?'on':''}">${ic('pencil',15)} Desenhar a Sala</button></div></div>
    ${modo==='desenhar'?`<div class="pldes">
      <div class="plbl"><label>Tamanho</label><div class="row" style="gap:6px;align-items:center"><input type="number" id="pl-f" min="1" max="14" value="${pl.filas}" aria-label="Filas"><span class="mut">filas ×</span><input type="number" id="pl-c" min="1" max="14" value="${pl.cols}" aria-label="Colunas"><span class="mut">colunas</span></div></div>
      <div class="plbl"><label>Modelos</label><div class="plmod">${PL_MOD.map(([k,l])=>`<button type="button" class="btn sm ${pl.modelo===k?'pri':''}" data-plmod="${k}">${esc(l)}</button>`).join('')}</div></div>
      <div class="plbl"><label>Pincel <span class="mut" style="font-weight:500">— toque ou arraste sobre as casas</span></label><div class="plpinc" role="radiogroup">${PL_TIPOS.map(([k,l,i])=>`<button type="button" role="radio" aria-checked="${pinc===k}" class="${pinc===k?'on':''}" data-plp="${k}">${PL_SVG[i]}<span>${esc(l)}</span></button>`).join('')}</div></div>
      <p class="hint" style="margin:0"><span class="plcnt">${plCnt(nLug,al.length)}</span>. A secretária marca a frente da sala: «Dificuldades à frente» e «Necessidades à frente» sentam esses alunos mais perto dela.</p></div>`
    :`<div class="pldist"><label for="pl-o" style="margin:0">Distribuir</label><select id="pl-o">${PL_ORD.map(([k,l])=>`<option value="${k}" ${(UI.plOrd||'num')===k?'selected':''}>${esc(l)}</option>`).join('')}</select><button type="button" class="btn pri" id="pl-go">${ic('sparkle',15)} Distribuir Agora</button><span class="mut">${Object.keys(pl.fix).filter(id=>sentados.has(id)).length?Object.keys(pl.fix).filter(id=>sentados.has(id)).length+' lugar(es) fixo(s) mantido(s)':'Toque no alfinete de um aluno para fixar o lugar'}</span></div>
      <p class="hint">Arraste os alunos para os lugares (ou toque num aluno e depois num lugar). Toque duas vezes num lugar vazio para o tornar corredor. Para mudar a forma da sala (em U, grupos, secretária, porta…), use <b>Desenhar a Sala</b>.</p>`}
    <div class="plq">${ic('user',16)} Quadro</div>
    <div class="plg ${modo==='desenhar'?'des':''}" style="--c:${pl.cols}">${Array.from({length:pl.filas},(_,r)=>Array.from({length:pl.cols},(_,c)=>cel(r,c)).join('')).join('')}</div>
    ${modo==='lugares'?`<h3>Sem lugar (${fora.length})</h3><div class="plfora">${fora.map(x=>`<div class="pls oc solto" draggable="true" data-pla="${x.id}">${avatar(x,48)}<span class="pln"><b>${esc(numAl(x))}</b> ${esc(x.nome.split(' ')[0])}</span></div>`).join('')||'<span class="mut">Todos sentados.</span>'}</div>
    <h3>Notas da Planta</h3><textarea id="pl-obs" rows="3" placeholder="Notas gerais: alunos que devem ficar à frente, afastados, perto da janela, regras de troca de lugares…">${esc(pl.obs||'')}</textarea>`:''}</div>`;
  $$('[data-plm]').forEach(b=>b.onclick=()=>{UI.plModo=b.dataset.plm;vPlanta()});
  if(modo==='desenhar'){
    $$('[data-plp]').forEach(b=>b.onclick=()=>{UI.plPincel=b.dataset.plp;$$('[data-plp]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-checked',String(x===b))})});
    $$('[data-plmod]').forEach(b=>b.onclick=()=>{const m=b.dataset.plmod;if(m==='u2'&&(pl.filas<6||pl.cols<7)){pl.filas=Math.max(pl.filas,7);pl.cols=Math.max(pl.cols,8)}if(m==='u'&&pl.filas<4)pl.filas=5;if(m==='grupos'&&pl.cols<5)pl.cols=8;plModelo(pl,m);let n=0;while(plLugares(pl,'leitura').length<al.length&&n++<30&&(pl.filas<14||pl.cols<14)){if((n%2&&pl.cols<14)||pl.filas>=14)pl.cols++;else pl.filas++;plModelo(pl,m)}save();vPlanta();if(n)toast('Sala aumentada para '+pl.filas+' × '+pl.cols+' para caberem os '+al.length+' alunos','ok')});
    const fixa=()=>{plSync(pl);save()};
    const pinta=el=>{const k=el.dataset.pl;const p=UI.plPincel||'l';const cur=plTipo(pl,k);if(cur===p)return;pl.tipo=pl.tipo||{};
      if(p==='p')Object.keys(pl.tipo).forEach(q=>{if(pl.tipo[q]==='p'){delete pl.tipo[q];pl.tipo[q]='v';const e2=document.querySelector(`[data-pl="${q}"]`);if(e2)redes(e2,q)}});
      if(p==='l')delete pl.tipo[k];else pl.tipo[k]=p;pl.vazios=(pl.vazios||[]).filter(x=>x!==k);if(p!=='l')delete pl.lug[k];pl.modelo='';redes(el,k)};
    const redes=(el,k)=>{const [r,c]=k.split('-').map(Number);const tmp=document.createElement('div');tmp.innerHTML=cel(r,c);const n=tmp.firstChild;el.replaceWith(n)};
    const g=$('.plg');let down=false;
    g.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-pl]');if(!el)return;down=true;e.preventDefault();try{g.setPointerCapture(e.pointerId)}catch(_){}pinta(el)});
    g.addEventListener('pointermove',e=>{if(!down)return;const el=document.elementFromPoint(e.clientX,e.clientY);const c=el&&el.closest&&el.closest('.plg [data-pl]');if(c)pinta(c)});
    const fim=()=>{if(!down)return;down=false;fixa();const h=$('.pldes .plcnt');if(h)h.innerHTML=plCnt(plLugares(pl,'leitura').length,al.length)};g.addEventListener('pointerup',fim);g.addEventListener('pointercancel',fim);g.addEventListener('lostpointercapture',fim);
    $('#pl-f').onchange=e=>{pl.filas=Math.max(1,Math.min(14,+e.target.value||5));plSync(pl);save();setTimeout(vPlanta,0)};$('#pl-c').onchange=e=>{pl.cols=Math.max(1,Math.min(14,+e.target.value||6));plSync(pl);save();setTimeout(vPlanta,0)};
    return}
  $('#pl-o').onchange=e=>{UI.plOrd=e.target.value};$('#pl-go').onclick=()=>{UI.plOrd=$('#pl-o').value;const b=$('#b-pla');if(b)b.click();else{plDistribuir(t,pl,UI.plOrd);save();vPlanta()}};
  const mover=(aid,k)=>{const de=Object.keys(pl.lug).find(q=>pl.lug[q]===aid);Object.keys(pl.lug).forEach(q=>{if(pl.lug[q]===aid)delete pl.lug[q]});if(k){const ant=pl.lug[k];pl.lug[k]=aid;if(ant&&ant!==aid&&de)pl.lug[de]=ant;else if(ant&&ant!==aid)delete pl.fix[ant]}else delete pl.fix[aid];save();vPlanta()};
  $$('[data-pla]').forEach(el=>{el.ondragstart=e=>{e.dataTransfer.setData('text/plain',el.dataset.pla)};el.onclick=e=>{if(e.target.closest('.plnb,.plfx'))return;if(UI.plSel&&UI.plSel!==el.dataset.pla&&el.dataset.pl){const a=UI.plSel;UI.plSel=null;mover(a,el.dataset.pl);return}UI.plSel=el.dataset.pla;$$('[data-pla]').forEach(z=>z.classList.toggle('sel',z===el))}});
  $$('.plg [data-pl]').forEach(el=>{if(el.dataset.plt&&el.dataset.plt!=='l')return;el.ondragover=e=>{e.preventDefault();el.classList.add('over')};el.ondragleave=()=>el.classList.remove('over');el.ondrop=e=>{e.preventDefault();const aid=e.dataTransfer.getData('text/plain');if(aid)mover(aid,el.dataset.pl)};
    el.addEventListener('click',()=>{if(UI.plSel&&!el.dataset.pla){const a=UI.plSel;UI.plSel=null;mover(a,el.dataset.pl)}});
    el.ondblclick=()=>{if(el.dataset.pla)return;pl.tipo=pl.tipo||{};pl.tipo[el.dataset.pl]='v';plSync(pl);save();vPlanta()}});
  $$('.plg [data-plt="v"]').forEach(el=>el.ondblclick=()=>{delete pl.tipo[el.dataset.pl];pl.vazios=(pl.vazios||[]).filter(x=>x!==el.dataset.pl);plSync(pl);save();vPlanta()});
  $$('[data-plfix]').forEach(b=>{b.onmousedown=b.ontouchstart=e=>e.stopPropagation();b.onclick=e=>{e.stopPropagation();const id=b.dataset.plfix;if(pl.fix[id])delete pl.fix[id];else pl.fix[id]=1;save();vPlanta()}});
  $$('[data-plnota]').forEach(b=>{b.onmousedown=b.ontouchstart=e=>e.stopPropagation();b.onclick=e=>{e.stopPropagation();const x=t.alunos.find(z=>z.id===b.dataset.plnota);if(!x)return;
    openDrawer('Nota — '+x.nome,`<div class="ed"><p class="hint" style="margin-top:0">Aparece no lugar do aluno na planta e no PDF (ex.: vê mal ao longe, separar de…, precisa de apoio). Conta para «Necessidades à frente».</p><textarea id="pln-t" rows="4">${esc((pl.notas||{})[x.id]||'')}</textarea><div class="row" style="margin-top:12px;gap:8px"><button class="btn pri" id="pln-ok">${ic('check',15)} Guardar</button>${(pl.notas||{})[x.id]?`<button class="btn dng" id="pln-x">${ic('trash',15)} Apagar Nota</button>`:''}</div></div>`);
    setTimeout(()=>$('#pln-t')&&$('#pln-t').focus(),60);$('#pln-ok').onclick=()=>{pl.notas=pl.notas||{};const v=$('#pln-t').value.trim();if(v)pl.notas[x.id]=v;else delete pl.notas[x.id];save();closeDrawer();vPlanta()};const dx=$('#pln-x');if(dx)dx.onclick=()=>{delete pl.notas[x.id];save();closeDrawer();vPlanta()}}});
  {const ob=$('#pl-obs');if(ob)ob.addEventListener('change',()=>{pl.obs=ob.value;save()})}
  const fo=$('.plfora');if(fo){fo.ondragover=e=>e.preventDefault();fo.ondrop=e=>{const aid=e.dataTransfer.getData('text/plain');if(aid)mover(aid,null)}}}

