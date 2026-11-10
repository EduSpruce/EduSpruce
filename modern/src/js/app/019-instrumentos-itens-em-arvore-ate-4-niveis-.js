/* ===================== Instrumentos: itens em árvore (até 4 níveis) e grelha dinâmica ===================== */
const NIV_N=['Grupo / Parte','Pergunta','Alínea','Subalínea'];
const itPath=it=>{const p=Array.isArray(it.niv)&&it.niv.some(x=>String(x||'').trim())?it.niv.slice(0,4):[it.rot||''];while(p.length&&!String(p[p.length-1]||'').trim())p.pop();return p.map(x=>String(x||''))};
const nNiv=i=>Math.max(i.nNiv||1,...i.itens.map(it=>itPath(it).length),1);
const itFolha=it=>{const p=itPath(it);return p[p.length-1]||it.rot||''};
function incRot(s){s=String(s||'');const m=s.match(/(\d+)(?!.*\d)/);if(m){const k=s.lastIndexOf(m[1]);return s.slice(0,k)+(+m[1]+1)+s.slice(k+m[1].length)}const l=s.match(/([A-Za-z])(?!.*[A-Za-z])/);if(l&&/\b[A-Za-z]\b|[A-Za-z][).]?$/.test(s)){const k=s.lastIndexOf(l[1]);return s.slice(0,k)+String.fromCharCode(l[1].charCodeAt(0)+1)+s.slice(k+1)}return s?s+' 2':'Item'}
function cabNiveis(i){const L=nNiv(i);const P=i.itens.map(itPath);let h='';
  for(let l=0;l<L;l++){let row='';let k=0;while(k<P.length){const key=P[k].slice(0,l+1).join('\u0001');const lab=P[k][l]||'';let n=1;while(k+n<P.length&&P[k+n].slice(0,l+1).join('\u0001')===key&&lab&&(P[k+n][l]||'')===lab&&!(l===P[k].length-1))n++;
      const folha=l===P[k].length-1;const it=i.itens[k];row+=`<th class="dh niv niv${l} ${lab?'':'vz'} ${folha?'folha':''}" colspan="${n}" title="${esc(P[k].slice(0,l+1).filter(Boolean).join(' › '))}">${esc(lab.length>16?lab.slice(0,15)+'…':lab)}${folha&&it.oralLig?` <span class="itoral" title="Avaliado na Produção Oral">${ic('fala',11)}</span>`:''}</th>`;k+=n}
    h+=`<tr>${row}</tr>`}return h}
/* editor de itens */
instItens=function(t,i){const L=Math.min(4,nNiv(i));const dO=domOral(t);
  i.itens.forEach(it=>{if(!Array.isArray(it.niv))it.niv=[it.rot||'']});
  const sumDom=t.dominios.map(d=>({d,s:i.itens.filter(x=>x.dom===d.id).reduce((a,x)=>a+(+x.cot||0),0)}));
  const P=i.itens.map(itPath);
  $('#i-body').innerHTML=`<div class="itbar"><p class="hint" style="margin:0;flex:1;min-width:260px">Organize os itens em até 4 níveis (ex.: <b>Grupo A</b> › <b>Pergunta 1</b> › <b>Alínea 1.1</b>). Só o último nível de cada linha é cotado; os grupos somam as cotações dos seus itens.</p>
      <div class="seg itniv" role="radiogroup" aria-label="Número de níveis">${[1,2,3,4].map(n=>`<button type="button" role="radio" aria-checked="${L===n}" class="${L===n?'on':''}" data-nniv="${n}">${n} nív${n>1?'eis':'el'}</button>`).join('')}</div></div>
    <div class="itwrap"><table class="lst ittab"><thead><tr><th class="itn">#</th>${NIV_N.slice(0,L).map((n,l)=>`<th class="itl">${n}</th>`).join('')}<th class="itd">Domínio</th><th class="itc">Cotação</th><th class="ita"></th></tr></thead><tbody>
    ${i.itens.map((it,k)=>{const p=P[k];const ant=k?P[k-1]:[];return `<tr data-k="${k}" class="${dO&&it.dom===dO.id?'itor':''}"><td class="mut itn">${k+1}</td>
      ${Array.from({length:L},(_,l)=>{const v=it.niv[l]||'';const rep=v&&l<p.length-1&&ant.slice(0,l+1).join('\u0001')===p.slice(0,l+1).join('\u0001');return `<td class="itl"><input data-niv="${l}" value="${esc(v)}" class="${rep?'rep':''} ${l===p.length-1?'folha':''}" placeholder="${l<p.length-1||!v&&l>=p.length?'':''}" aria-label="${NIV_N[l]} do item ${k+1}"></td>`}).join('')}
      <td class="itd"><select data-f="dom">${domById(t,it.dom)?'':'<option value="">— sem domínio —</option>'}${t.dominios.map(d=>`<option value="${d.id}" ${d.id===it.dom?'selected':''}>${esc(d.ab)} — ${esc(d.nome)}</option>`).join('')}</select>${dO&&it.dom===dO.id?`<label class="chk itorl" title="As pontuações vêm da grelha da Produção Oral"><input type="checkbox" data-oral="${k}" ${it.oralLig?'checked':''}> ${ic('fala',12)} Grelha oral</label>`:''}</td>
      <td class="itc"><input data-f="cot" value="${esc(String(it.cot).replace('.',','))}" inputmode="decimal"></td>
      <td class="act ita"><button class="btn sm ico" data-sub="${k}" title="Acrescentar sub-item" aria-label="Acrescentar sub-item" ${p.length>=4?'disabled':''}>↳</button><button class="btn sm ico" data-up="${k}" aria-label="Subir">↑</button><button class="btn sm ico" data-dn="${k}" aria-label="Descer">↓</button><button class="btn sm ico dng" data-del="${k}" aria-label="Apagar">${ic('trash',13)}</button></td></tr>`}).join('')}</tbody></table></div>
    <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><button class="btn" id="it-add">${ic('plus',14)} Item</button><button class="btn" id="it-addn">${ic('plus',14)} Vários Itens…</button><button class="btn" id="it-grp">${ic('layers',14)} Novo Grupo</button><span class="sp1"></span>
      <span class="itsum">${sumDom.filter(x=>x.s).map(x=>`<b>${esc(x.d.ab)}</b> ${nf(x.s)}`).join(' · ')} · <b>Total ${nf(instMax(i))} pontos</b></span></div>
    ${(()=>{const G={};i.itens.forEach(it=>{const p=itPath(it);if(p.length>1){const g=p[0];G[g]=(G[g]||0)+(+it.cot||0)}});const k=Object.keys(G);return k.length?`<div class="itgrp">${k.map(g=>`<span><b>${esc(g)}</b> ${nf(G[g])} pts</span>`).join('')}</div>`:''})()}
    ${Object.keys(i.notas).length?'<div class="alert w">Este instrumento já tem classificações; alterar itens afeta as notas registadas.</div>':''}`;
  const re=()=>{i.itens.forEach(it=>{it.rot=itFolha(it)});save();manterPosicao(()=>instItens(t,i))};
  $$('[data-nniv]').forEach(b=>b.onclick=()=>{const n=+b.dataset.nniv;if(n<nNiv(i)&&i.itens.some(it=>itPath(it).length>n)&&!confirm('Há itens com '+nNiv(i)+' níveis. Juntar os níveis a mais ao nível '+n+'?'))return;
    if(n<nNiv(i))i.itens.forEach(it=>{const p=itPath(it);if(p.length>n){const tail=p.slice(n-1).filter(Boolean).join(' ');it.niv=[...p.slice(0,n-1),tail]}});i.nNiv=n;re()});
  $$('#i-body tr[data-k] [data-niv]').forEach(el=>el.addEventListener('change',()=>{const it=i.itens[+el.closest('tr').dataset.k];const l=+el.dataset.niv;it.niv=it.niv||[];it.niv[l]=el.value.trim();re()}));
  $$('#i-body tr[data-k] [data-f]').forEach(el=>el.addEventListener('change',()=>{const it=i.itens[+el.closest('tr').dataset.k];const f=el.dataset.f;it[f]=f==='cot'?(num(el.value)||0):el.value;re()}));
  $$('[data-oral]').forEach(c=>c.onchange=()=>{i.itens[+c.dataset.oral].oralLig=c.checked;re()});
  $$('[data-del]').forEach(b=>b.onclick=()=>{const k=+b.dataset.del;const it=i.itens[k];i.itens.splice(k,1);Object.values(i.notas).forEach(n=>delete n[it.id]);re()});
  $$('[data-up]').forEach(b=>b.onclick=()=>{const k=+b.dataset.up;if(k>0){[i.itens[k-1],i.itens[k]]=[i.itens[k],i.itens[k-1]];re()}});
  $$('[data-dn]').forEach(b=>b.onclick=()=>{const k=+b.dataset.dn;if(k<i.itens.length-1){[i.itens[k+1],i.itens[k]]=[i.itens[k],i.itens[k+1]];re()}});
  const novo=(path,dom,cot)=>({id:uid()+Math.random().toString(36).slice(2,4),niv:path,rot:path[path.length-1],dom,cot});
  const last=()=>i.itens[i.itens.length-1];
  $('#it-add').onclick=()=>{const l=last();if(!l){i.itens.push(novo(['Item 1'],(t.dominios[0]||{}).id,10));return re()}const p=itPath(l).slice();p[p.length-1]=incRot(p[p.length-1]);i.itens.push(novo(p,l.dom,l.cot));re()};
  $$('[data-sub]').forEach(b=>b.onclick=()=>{const k=+b.dataset.sub;const it=i.itens[k];const p=itPath(it);if(p.length>=4)return;let j=k+1;while(j<i.itens.length&&itPath(i.itens[j]).slice(0,p.length).join('\u0001')===p.join('\u0001')&&itPath(i.itens[j]).length>p.length)j++;
    const irmao=j>k+1?itPath(i.itens[j-1]):null;const lab=irmao?incRot(irmao[p.length]):(/^\d+\.?$/.test(p[p.length-1])?p[p.length-1].replace(/\.$/,'')+'.1':/^[A-Z]\d*\.?$/.test(p[p.length-1])?p[p.length-1].replace(/\.$/,'')+'.1':'a)');
    if(j===k+1&&!irmao){it.niv=[...p,lab];it.rot=lab}else i.itens.splice(j,0,novo([...p,lab],it.dom,it.cot));if(p.length+1>(i.nNiv||1))i.nNiv=p.length+1;re()});
  $('#it-grp').onclick=()=>{const gs=[...new Set(i.itens.map(it=>itPath(it)).filter(p=>p.length>1).map(p=>p[0]))];const g=prompt('Nome do novo grupo:',gs.length?incRot(gs[gs.length-1]):'Grupo A');if(!g)return;const l=last();i.itens.push(novo([g.trim(),'1.'],l?l.dom:(t.dominios[0]||{}).id,l?l.cot:10));if((i.nNiv||1)<2)i.nNiv=2;re()};
  $('#it-addn').onclick=()=>{const n=parseInt(prompt('Quantos itens?'));if(!n||n<1||n>80)return;const c=num(prompt('Cotação de cada item?','10'))||0;let l=last();for(let k=0;k<n;k++){const p=l?itPath(l).slice():['Item 0'];p[p.length-1]=incRot(p[p.length-1]);const it=novo(p,l?l.dom:(t.dominios[0]||{}).id,c);i.itens.push(it);l=it}re()};
};
/* grelha de classificações: cabeçalho por níveis, colunas fixas, deslocação horizontal */
function gridAjustar(){const g=$('#grid');if(!g)return;let top=0;[...g.tHead.rows].forEach(r=>{[...r.cells].forEach(c=>{if(c.rowSpan===1||r.rowIndex===0)c.style.top=top+'px'});top+=r.offsetHeight});
  [...g.tHead.rows[0].cells].forEach(c=>{if(c.rowSpan>1)c.style.top='0px'});
  const w=$('.gwrap');if(w){const sc=()=>w.classList.toggle('scx',w.scrollLeft>2);w.onscroll=sc;sc();w.classList.toggle('temx',w.scrollWidth>w.clientWidth+2)}}
{const _in=instNotas;instNotas=function(t,i){const r=_in.apply(this,arguments);try{const g=$('#grid');if(!g)return r;const L=nNiv(i);const H=g.tHead;
    if(L>1||i.itens.some(it=>Array.isArray(it.niv))){H.rows[1].outerHTML=cabNiveis(i);[...H.rows[0].cells].forEach(c=>{if(c.rowSpan===3)c.rowSpan=2+L})}
    /* itens avaliados na grelha oral: só leitura */
    i.itens.forEach((it,c)=>{if(it.oralLig)g.querySelectorAll(`input[data-i="${it.id}"]`).forEach(x=>{x.readOnly=true;x.classList.add('orro');x.title='Vem da Produção Oral'})});
    if(i.itens.some(it=>it.oralLig)&&!$('#i-oralnote'))$('#i-body').insertAdjacentHTML('afterbegin',`<div class="alert" id="i-oralnote">${ic('fala',15)} Os itens de oralidade deste instrumento são avaliados na <b>Produção Oral</b>. <button class="btn sm" type="button" id="i-gooral">Abrir Produção Oral</button></div>`);
    const go_=$('#i-gooral');if(go_)go_.onclick=()=>{const o=oralM(t);if(o.inst!==i.id)oralTrocar(t,i.id);save();go('oral')};
    requestAnimationFrame(gridAjustar)}catch(e){console.warn(e)}return r}}
addEventListener('resize',()=>{try{gridAjustar()}catch(_){}});
/* ===================== Produção oral ligada a um instrumento ===================== */
function oralTrocar(t,instId){const o=oralM(t);o.regsI=o.regsI||{};const cur=oralKey(o);o.regsI[cur]=o.regs||{};const k=instId&&instId!==o.propId?instId:'_proprio';o.inst=k==='_proprio'?(o.propId||null):instId;o.regs=o.regsI[k]||{};oralM(t)}
function instsOrais(t){const d=domOral(t);if(!d)return [];return t.instrumentos.filter(i=>!i.oral&&i.itens.some(it=>it.dom===d.id))}
{const _os=oralSync;oralSync=function(t){const o=oralM(t);const dom=domOral(t);if(!dom)return null;const i=o.inst&&t.instrumentos.find(x=>x.id===o.inst);
  if(!i||i.oral)return _os.apply(this,arguments);
  let its=i.itens.filter(it=>it.dom===dom.id&&it.oralLig);if(!its.length){its=i.itens.filter(it=>it.dom===dom.id);its.forEach(it=>it.oralLig=true)}if(!its.length)return i;
  const c=o.cfg;alunosAval(t).forEach(a=>{const tt=oralTotal(t,a.id);const n=i.notas[a.id];if(!tt||!c.total){if(n)its.forEach(it=>delete n[it.id]);return}const fr=Math.max(0,Math.min(1,tt.pts/c.total));const m=i.notas[a.id]=i.notas[a.id]||{};its.forEach(it=>{m[it.id]=Math.round(fr*(+it.cot||0)*100)/100})});return i}}
{const _vo2=vOral;vOral=function(){const r=_vo2.apply(this,arguments);try{const t=T();if(!t||!domOral(t))return r;const o=oralM(t);const L=instsOrais(t);const s=$('#view .orsync');if(!s)return r;
    const cur=o.inst&&t.instrumentos.find(x=>x.id===o.inst);
    s.innerHTML=`<span>${ic('link',14)} Esta grelha conta para</span><select id="or-inst" aria-label="Instrumento"><option value="">Instrumento próprio “Produção Oral”</option>${L.map(i=>`<option value="${i.id}" ${o.inst===i.id?'selected':''}>${esc(i.nome)} · ${i.periodo}.º ${perW().slice(0,3).toLowerCase()}.${i.data?' · '+fmtIso(i.data):''}</option>`).join('')}</select>
      ${cur&&!cur.oral?`<span class="mut">— itens de oralidade: ${cur.itens.filter(it=>it.oralLig||it.dom===domOral(t).id).map(it=>esc(itFolha(it))+' ('+nf(it.cot)+' pts)').join(', ')}</span>`:`<select id="or-per" aria-label="Período">${periodos().map(p=>`<option value="${p}" ${(o.per||perAtual(t))==p?'selected':''}>${perNome(p)}</option>`).join('')}</select>`}
      ${cur?`<button type="button" class="btn sm" id="or-verinst">${ic('clipboard',13)} Ver Instrumento</button>`:''}`;
    $('#or-inst').onchange=e=>{oralTrocar(t,e.target.value||null);oralSync(t);save();vOral()};const ps=$('#or-per');if(ps)ps.onchange=()=>{o.per=+ps.value;oralSync(t);save()};
    const vi=$('#or-verinst');if(vi)vi.onclick=()=>{UI.inst=o.inst;UI.instTab='notas';go('instrumentos')};
    if(L.length&&!o.inst&&!o._avisoLig){s.insertAdjacentHTML('afterend',`<p class="hint" style="margin:6px 0 0">${ic('info',13)} Há ${L.length} instrumento(s) com itens de oralidade — escolha acima para lançar estas pontuações diretamente nesse instrumento.</p>`)}}catch(e){console.warn(e)}return r}}

/* barra lateral: Critérios antes de Marcação de Testes */
{const h=$('#tnavHold');if(h){const c=h.querySelector('[data-v="criterios"]'),te=h.querySelector('[data-v="testes"]');if(c&&te)te.before(c)}const s=$('#side');if(s){const c=s.querySelector('[data-v="criterios"]'),te=s.querySelector('[data-v="testes"]');if(c&&te&&c.parentNode===te.parentNode)te.before(c)}}


/* Início (versão simples): arrastar cartões entre colunas (principal, lateral, esquerda) */
const iniKey=c=>{const cl=[...c.classList].filter(x=>!['card','wide','drag','priv'].includes(x)).join('.');const h=c.querySelector('h2');let k=(c.id||'')+'|'+cl+'|'+(h?h.textContent:'');return normT(k).replace(/\b(segunda|terca|quarta|quinta|sexta|sabado|domingo|janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/g,'').replace(/[0-9#.ºª·,]+/g,'').replace(/\s+/g,' ').trim().slice(0,60)};
function iniColunas(){return {main:$('#view .in-main'),side:$('#view .in-side'),fav:$('#view .in-fav')}}
function iniAplicar(){const C=iniColunas();if(!C.main||!C.side)return;const P=S.cfg.iniPos||{};const todos=[];Object.entries(C).forEach(([col,el])=>{if(el)[...el.children].forEach((c,i)=>{if((c.classList.contains('card')||/^w-/.test(c.id)))todos.push({c,col,i,k:iniKey(c)})})});
  const pos=o=>P[o.k]||{col:o.col,i:o.i+(o.col==='main'?0:0)};
  ['main','side','fav'].forEach(col=>{const el=C[col];if(!el)return;todos.filter(o=>pos(o).col===col).sort((a,b)=>pos(a).i-pos(b).i).forEach(o=>el.appendChild(o.c))});
  todos.forEach(o=>{const c=o.c;const h=c.querySelector('h2')||c.firstElementChild;if(!h||c.dataset.inidnd)return;c.dataset.inidnd=1;c.dataset.ik=o.k;h.classList.add('inidh');h.draggable=true;
    h.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/x-ini',o.k);e.dataTransfer.effectAllowed='move';c.classList.add('drag');document.body.classList.add('iniarr')});
    h.addEventListener('dragend',()=>{c.classList.remove('drag');document.body.classList.remove('iniarr');$$('.inio').forEach(x=>x.classList.remove('inio'))})})}
function iniGuardar(){const C=iniColunas();const P={};Object.entries(C).forEach(([col,el])=>{if(el)[...el.children].filter(c=>(c.classList.contains('card')||/^w-/.test(c.id))).forEach((c,i)=>{P[c.dataset.ik||iniKey(c)]={col,i}})});S.cfg.iniPos=P;save()}
document.addEventListener('dragover',e=>{if(![...(e.dataTransfer||{types:[]}).types].includes('text/x-ini'))return;const col=e.target.closest&&e.target.closest('.in-main,.in-side,.in-fav');if(!col)return;e.preventDefault();$$('.inio').forEach(x=>x!==col&&x.classList.remove('inio'));col.classList.add('inio')});
document.addEventListener('drop',e=>{if(![...(e.dataTransfer||{types:[]}).types].includes('text/x-ini'))return;const col=e.target.closest&&e.target.closest('.in-main,.in-side,.in-fav');if(!col)return;e.preventDefault();col.classList.remove('inio');
  const k=e.dataTransfer.getData('text/x-ini');const c=$(`#view .card[data-ik="${CSS.escape(k)}"]`);if(!c)return;const cards=[...col.children].filter(x=>x.classList.contains('card')&&x!==c);const ref=cards.find(x=>{const r=x.getBoundingClientRect();return e.clientY<r.top+r.height/2});
  if(ref)col.insertBefore(c,ref);else col.appendChild(c);iniGuardar();toast('Cartão movido — pode repor em Personalizar','ok')});
{const _vInS=vInicio;vInicio=function(){const r=_vInS.apply(this,arguments);try{if(dashM().modo!=='geral')iniAplicar()}catch(e){console.warn(e)}return r};if(go._f)go._f.inicio=vInicio}


/* ===================== Ensino profissional: horário semanal (uma grelha por semana) ===================== */
const segIso=d=>{d=typeof d==='string'?dataDeIso(d):new Date(d);const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return isoData(x)};
const horSemM=t=>t.horSem=t.horSem||{};
const usaSemanal=t=>!!t&&(t.horSemOn===true||(t.horSemOn!==false&&(ofertaDe(t)==='profissional'||tipoEscola(escolaDe(t))==='profissional')));
const temSemanal=t=>!!t&&!!t.horSem&&Object.keys(t.horSem).length>0;
function semAulas(t,seg){const w=t&&t.horSem&&t.horSem[seg];return w?(w.vazia?[]:w.aulas||[]):null}
function blocosDia(t,a,B,d){const w=semAulas(t,segIso(d));if(w==null)return B.filter(b=>b.dia===d.getDay());return blocos(w).filter(b=>b.dia===d.getDay())}
function blocosDiaP(B,d,t){const seg=segIso(d);const TT=[...new Set([...(t?[t]:[]),...B.map(b=>b.t).filter(Boolean)])].filter(x=>semAulas(x,seg)!=null);if(!TT.length)return B;
  const out=B.filter(b=>!TT.includes(b.t||t));TT.forEach(tt=>blocos(semAulas(tt,seg).map(x=>({...x,t:tt}))).forEach(b=>out.push(b.t?b:{...b,t:tt})));return out}
{const _at=aulasTurma;aulasTurma=function(t,a){const r=_at.apply(this,arguments);if(r.length||!temSemanal(t))return r;const H=t.horSem;const hj=segIso(new Date());const ks=Object.keys(H).filter(k=>!H[k].vazia&&(H[k].aulas||[]).length).sort();const k=ks.find(x=>x>=hj)||ks[ks.length-1];return k?H[k].aulas.map(x=>({...x})):r}}
/* semanas de aulas a partir do calendário escolar */
function semanasAno(t,a){a=a||A();const c=a&&a.calendario;if(!c||!c.periodos.length)return [];const out=[];
  c.periodos.forEach(p=>{let d=dataDeIso(segIso(p.ini));while(isoData(d)<=p.fim){const seg=isoData(d);const dias=[];for(let k=0;k<5;k++){const x=new Date(d);x.setDate(x.getDate()+k);const iso=isoData(x);if(iso<p.ini||iso>p.fim)continue;dias.push({iso,let:letivoPara(t,iso),tipo:c.dias[iso]||''})}
    if(dias.some(x=>x.let)&&!out.some(w=>w.seg===seg))out.push({seg,per:p.n,dias,nLet:dias.filter(x=>x.let).length});d.setDate(d.getDate()+7)}});return out}
async function importarSemana(t,seg,file){ocupado('A ler '+file.name+'…');let hs=[];try{hs=await lerHorarioXlsx(file)}catch(e){livre();return toast('Não foi possível ler o ficheiro: '+e.message,'erro')}livre();
  const ok=hs.filter(h=>!h.erro&&h.aulas&&h.aulas.length);if(!ok.length)return toast('Não encontrei um horário de turma neste ficheiro','erro');
  const cls=turmasDaClasse(t).map(normTurma);const h=ok.find(x=>cls.includes(normTurma(x.turma||'')))||ok[0];
  let sig=t.horAbs&&t.horAbs.length?t.horAbs:siglasDaDisciplina(h,t.disciplina);if(!sig||!sig.length)sig=siglasDoProfessor?siglasDoProfessor(h):[];
  const aulas=h.aulas.filter(x=>!sig.length||sig.includes(x.ab)).map(x=>({...x,classe:h.turma}));
  horSemM(t)[seg]={aulas,fonte:file.name,q:Date.now(),turmaFich:h.turma||''};save();
  toast(`Semana de ${fmtIso(seg)}: ${aulas.length} tempo${aulas.length!==1?'s':''} de ${t.disciplina}${h.turma&&!cls.includes(normTurma(h.turma))?' (horário de '+h.turma+')':''}`,aulas.length?'ok':'aviso')}
function cartaoSemanal(t){const a=A();const W=semanasAno(t,a);const H=horSemM(t);const hj=segIso(new Date());const temAnual=(()=>{try{const x=t.horSem;t.horSem=null;const r=aulasTurma(t,a).length;t.horSem=x;return r}catch(_){return 0}})();
  if(!a.calendario)return `<div class="card hsem"><h2>${ic('calendar',18)} Horário Semanal</h2><p class="mut">Importe primeiro o <b>calendário escolar</b>: as semanas de aulas são calculadas a partir dele.</p><button class="btn pri" data-goview="calendario">${ic('calendar',15)} Calendário Escolar</button></div>`;
  const nC=W.filter(w=>H[w.seg]).length,nF=W.filter(w=>!H[w.seg]&&w.seg<=segIso(new Date(Date.now()+14*864e5))&&!temAnual).length;const P=[...new Set(W.map(w=>w.per))];const perSel=UI.hsemPer||(W.find(w=>w.seg>=hj)||{}).per||P[0];
  const semL=W.filter(w=>w.per===perSel);
  return `<div class="card hsem" id="hsem"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('calendar',18)} Horário Semanal</h2><span class="tag">${nC}/${W.length} semanas carregadas</span>${nF?`<span class="tag bad">${nF} em falta</span>`:''}<span class="sp1"></span>
      <div class="estps" role="group" aria-label="${perW()}">${P.map(p=>`<button type="button" class="${p===perSel?'on':''}" data-hsper="${p}">${p}.º ${perW().slice(0,3).toLowerCase()}.</button>`).join('')}</div></div>
    <p class="hint" style="margin:6px 0 12px">No ensino profissional o horário muda de semana para semana. Carregue o Excel de cada semana; as aulas previstas, os sumários e as aulas dadas passam a usar o horário dessa semana.${temAnual?' As semanas sem ficheiro usam o horário habitual da turma.':''}</p>
    <div class="hsl">${semL.map(w=>{const x=H[w.seg];const n=x?(x.vazia?0:blocos(x.aulas||[]).reduce((s,b)=>s+b.tempos,0)):null;const fim=w.dias[w.dias.length-1].iso;const cur=w.seg===hj;const passada=fim<isoHoje();
      const st=x?(x.vazia?'<span class="tag">sem aulas</span>':`<span class="tag ok">${ic('check',11)} ${n} tempo${n!==1?'s':''}</span>`):temAnual?'<span class="tag">horário habitual</span>':`<span class="tag ${passada||cur?'bad':''}">em falta</span>`;
      const dias=x&&!x.vazia?['Seg','Ter','Qua','Qui','Sex'].map((dn,k)=>{const B=blocos((x.aulas||[]).filter(z=>z.dia===k+1));return `<span class="hsd ${B.length?'':'vz'}"><b>${dn}</b>${B.map(b=>`${fmtHM(b.ini)}${b.tempos>1?' ('+b.tempos+'t)':''}`).join(' · ')||'—'}</span>`}).join(''):'';
      return `<div class="hsw ${cur?'cur':''} ${passada?'pas':''} ${x?'tem':''}" data-hseg="${w.seg}"><div class="hswh"><div class="hswd"><b>${fmtIso(w.seg).slice(0,5)} – ${fmtIso(fim).slice(0,5)}</b><small>${w.nLet} dia${w.nLet!==1?'s':''} letivo${w.nLet!==1?'s':''}${w.dias.some(z=>!z.let)?' · '+w.dias.filter(z=>!z.let).length+' sem aulas':''}${cur?' · <b>esta semana</b>':''}</small></div>${st}<span class="sp1"></span>
        <span class="hsa"><button class="btn sm ${x||temAnual?'':'pri'}" data-hsup="${w.seg}">${ic('upload',13)} ${x?'Substituir':'Carregar'}</button><button class="btn sm ico" data-hscp="${w.seg}" title="Copiar a semana anterior" aria-label="Copiar a semana anterior">${ic('copy',13)}</button><button class="btn sm ico" data-hsvz="${w.seg}" title="Marcar sem aulas" aria-label="Marcar sem aulas">${ic('x',12)}</button>${x?`<button class="btn sm ico dng" data-hsdel="${w.seg}" title="Limpar" aria-label="Limpar">${ic('trash',12)}</button>`:''}</span></div>
        ${dias?`<div class="hsds">${dias}</div>`:''}${x&&x.fonte?`<small class="hsf">${ic('file',11)} ${esc(x.fonte)}</small>`:''}</div>`}).join('')}</div>
    <input type="file" id="hsem-in" accept=".xlsx,.xls,.xlsm" hidden></div>`}
function bindSemanal(t){const c=$('#hsem');if(!c)return;const re=()=>manterPosicao(vHorario);let alvo=null;const inp=$('#hsem-in');
  c.querySelectorAll('[data-hsper]').forEach(b=>b.onclick=()=>{UI.hsemPer=+b.dataset.hsper;re()});
  c.querySelectorAll('[data-hsup]').forEach(b=>b.onclick=()=>{alvo=b.dataset.hsup;inp.value='';inp.click()});
  inp.onchange=async()=>{const f=inp.files[0];if(f&&alvo){await importarSemana(t,alvo,f);re()}};
  c.querySelectorAll('[data-hsw],[data-hseg]').forEach(w=>{w.ondragover=e=>{e.preventDefault();w.classList.add('over')};w.ondragleave=()=>w.classList.remove('over');w.ondrop=async e=>{e.preventDefault();w.classList.remove('over');const f=e.dataTransfer.files[0];if(f){await importarSemana(t,w.dataset.hseg,f);re()}}});
  c.querySelectorAll('[data-hscp]').forEach(b=>b.onclick=()=>{const seg=b.dataset.hscp;const H=horSemM(t);const ant=Object.keys(H).filter(k=>k<seg&&!H[k].vazia).sort().pop();if(!ant)return toast('Não há nenhuma semana anterior carregada','aviso');H[seg]={aulas:JSON.parse(JSON.stringify(H[ant].aulas||[])),fonte:'cópia de '+fmtIso(ant),q:Date.now()};save();re()});
  c.querySelectorAll('[data-hsvz]').forEach(b=>b.onclick=()=>{horSemM(t)[b.dataset.hsvz]={vazia:true,aulas:[],q:Date.now()};save();re()});
  c.querySelectorAll('[data-hsdel]').forEach(b=>b.onclick=()=>{delete horSemM(t)[b.dataset.hsdel];save();re()});
  c.querySelectorAll('[data-goview]').forEach(b=>b.onclick=()=>go(b.dataset.goview));
  const cur=c.querySelector('.hsw.cur');if(cur&&!UI._hsemScroll){UI._hsemScroll=1;cur.scrollIntoView({block:'nearest'})}}
{const _vh=vHorario;vHorario=function(){const r=_vh.apply(this,arguments);try{const t=T();if(t&&usaSemanal(t)){const v=$('#view');const vm=v.querySelector('.vmain')||v;const h1=vm.querySelector(':scope>h1');const e=vm.querySelector(':scope>.card.empty');
    const html=cartaoSemanal(t);if(e)e.outerHTML=html;else if(h1)h1.insertAdjacentHTML('afterend',html);else vm.insertAdjacentHTML('afterbegin',html);bindSemanal(t)}}catch(e){console.warn(e)}return r}}


/* ===================== Arrastar widgets (rato, toque e teclado) — Início simples e Geral ===================== */
if(!ICONS.grip)ICONS.grip='<circle cx="9" cy="6" r="1.4" fill="currentColor"/><circle cx="15" cy="6" r="1.4" fill="currentColor"/><circle cx="9" cy="12" r="1.4" fill="currentColor"/><circle cx="15" cy="12" r="1.4" fill="currentColor"/><circle cx="9" cy="18" r="1.4" fill="currentColor"/><circle cx="15" cy="18" r="1.4" fill="currentColor"/>';
function wgModo(){return $('#view .dgrps,#view .dgrid')?'geral':$('#view .in-main')?'simples':null}
function wgCartoes(){const m=wgModo();if(m==='geral')return [...$$('#view .dw')];if(m==='simples')return [...$$('#view .in-main>.card,#view .in-side>.card,#view .in-fav>.card,#view .in-main>[id^="w-"],#view .in-side>[id^="w-"],#view .in-fav>[id^="w-"]')];return []}
function wgContentores(){const m=wgModo();if(m==='geral')return [...$$('#view .dgsec>.dgrid'),...(!$('#view .dgsec')?$$('#view .dgrid'):[])];if(m==='simples')return [...$$('#view .in-main,#view .in-side,#view .in-fav')];return []}
function wgGuardar(){const m=wgModo();if(m==='simples'){iniGuardar();return}
  const d=dashM();const ord=[];$$('#view .dgsec').forEach(sec=>{sec.querySelectorAll(':scope>.dgrid>.dw').forEach(c=>{ord.push(c.dataset.dw);d.w[c.dataset.dw]={...dashCfgW(c.dataset.dw),g:sec.dataset.dg}})});
  if(!ord.length)$$('#view .dgrid>.dw').forEach(c=>ord.push(c.dataset.dw));const rest=dashOrdem().filter(x=>!ord.includes(x));d.ordem=[...ord,...rest];save();try{dashAjustar($('#view .dgrps')||$('#view .dgrid'))}catch(_){}}
function wgPreparar(){const L=wgCartoes();if(!L.length)return;
  L.forEach(c=>{if(c.querySelector(':scope .wggrip'))return;const h=c.querySelector(':scope>.dwh')||c.querySelector(':scope>h2')||c.querySelector(':scope>.row')||c.querySelector('h2');if(!h)return;
    h.draggable=false;h.querySelectorAll('[draggable]').forEach(x=>x.draggable=false);
    const g=document.createElement('button');g.type='button';g.className='wggrip';g.setAttribute('aria-label','Mover cartão (arrastar, ou setas do teclado)');g.title='Arrastar para mudar de sítio';g.innerHTML=ic('grip',16);
    if(h.matches('h2')){h.classList.add('wgh');h.prepend(g)}else h.prepend(g);
    g.addEventListener('pointerdown',e=>wgIniciar(e,c,g));
    g.addEventListener('keydown',e=>{const all=wgCartoes();const col=c.parentElement;const irm=[...col.children].filter(x=>all.includes(x));const k=irm.indexOf(c);
      if(e.key==='ArrowUp'&&k>0){e.preventDefault();col.insertBefore(c,irm[k-1])}else if(e.key==='ArrowDown'&&k<irm.length-1){e.preventDefault();irm[k+1].after(c)}
      else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){const C=wgContentores();const i=C.indexOf(col);const n=C[i+(e.key==='ArrowLeft'?-1:1)];if(!n)return;e.preventDefault();n.appendChild(c)}else return;
      wgGuardar();g.focus();anunciar&&anunciar('Cartão movido')})})}
let _wg=null;
function wgIniciar(e,c,g){if(e.button>0)return;e.preventDefault();const r=c.getBoundingClientRect();
  _wg={c,g,dx:e.clientX-r.left,dy:e.clientY-r.top,x0:e.clientX,y0:e.clientY,ativo:false,pid:e.pointerId};try{g.setPointerCapture(e.pointerId)}catch(_){}
  g.addEventListener('pointermove',wgMover);g.addEventListener('pointerup',wgFim);g.addEventListener('pointercancel',wgFim)}
function wgAtivar(){const {c}=_wg;const r=c.getBoundingClientRect();
  const gh=c.cloneNode(true);gh.classList.add('wgghost');gh.style.width=r.width+'px';gh.style.height=Math.min(r.height,420)+'px';document.body.appendChild(gh);_wg.gh=gh;
  const ph=document.createElement('div');ph.className='wgph '+[...c.classList].filter(x=>/^t-|^dw$/.test(x)).join(' ');ph.style.height=Math.min(r.height,320)+'px';const sc=c.style.gridColumn;if(sc)ph.style.gridColumn=sc;c.after(ph);_wg.ph=ph;
  c.classList.add('wgorig');document.body.classList.add('wgarr');_wg.ativo=true}
function wgMover(e){if(!_wg)return;if(!_wg.ativo){if(Math.hypot(e.clientX-_wg.x0,e.clientY-_wg.y0)<6)return;wgAtivar()}
  const {gh,ph,c}=_wg;gh.style.transform=`translate(${e.clientX-_wg.dx}px,${e.clientY-_wg.dy}px) rotate(1.2deg)`;
  const v=$('#view');const vr=v.getBoundingClientRect();if(e.clientY<vr.top+70)v.scrollTop-=14;else if(e.clientY>vr.bottom-70)v.scrollTop+=14;
  const el=document.elementFromPoint(e.clientX,e.clientY);if(!el)return;const all=wgCartoes();
  const alvo=el.closest&&el.closest('.dw,.card');const C=wgContentores();
  if(alvo&&alvo!==c&&all.includes(alvo)){const ar=alvo.getBoundingClientRect();const horiz=getComputedStyle(alvo.parentElement).display==='grid'&&ar.width<alvo.parentElement.clientWidth*.9;
    const depois=horiz?e.clientX>ar.left+ar.width/2:e.clientY>ar.top+ar.height/2;if(depois){if(alvo.nextElementSibling!==ph)alvo.after(ph)}else if(alvo.previousElementSibling!==ph)alvo.before(ph)}
  else{const col=el.closest&&C.find(x=>x===el||x.contains(el));if(col&&ph.parentElement!==col){col.appendChild(ph)}}
  C.forEach(x=>x.classList.toggle('wgover',x===ph.parentElement))}
function wgFim(e){if(!_wg)return;const {c,g,gh,ph,ativo}=_wg;g.removeEventListener('pointermove',wgMover);g.removeEventListener('pointerup',wgFim);g.removeEventListener('pointercancel',wgFim);
  if(ativo){ph.replaceWith(c);gh.remove();c.classList.remove('wgorig');document.body.classList.remove('wgarr');$$('.wgover').forEach(x=>x.classList.remove('wgover'));
    c.classList.add('wgpousou');setTimeout(()=>c.classList.remove('wgpousou'),500);wgGuardar();toast('Cartão movido','ok')}
  _wg=null}
{const _vInW=vInicio;vInicio=function(){const r=_vInW.apply(this,arguments);try{requestAnimationFrame(wgPreparar)}catch(_){}return r};if(go._f)go._f.inicio=vInicio}
{const _gW=go;go=function(v){const r=_gW.apply(this,arguments);if(go._f&&go._f.inicio!==vInicio)go._f.inicio=vInicio;return r}}


/* Produção Oral como sub-item dos Instrumentos */
{const h=$('#tnavHold');const o=h&&h.querySelector('[data-v="oral"]'),ins=h&&h.querySelector('[data-v="instrumentos"]');if(o&&ins){ins.after(o);o.classList.add('navsub');const l=o.querySelector('.lbl');if(l)l.textContent='Produção Oral'}}
function irOral(t,instId){if(instId&&oralM(t).inst!==instId){oralTrocar(t,instId);oralSync(t);save()}go('oral')}
{const _vis=vInstrumentos;vInstrumentos=function(){const r=_vis.apply(this,arguments);try{const t=T();if(!t||UI.inst)return r;const d=domOral(t);if(!d)return r;
  $$('#view tr[data-irow]').forEach(tr=>{const i=t.instrumentos.find(x=>x.id===tr.dataset.irow);if(!i||i.oral||!i.itens.some(it=>it.dom===d.id))return;const c=tr.querySelector('td');if(c&&!c.querySelector('.inoral'))c.insertAdjacentHTML('beforeend',`<button type="button" class="inoral" data-inoral="${i.id}" title="Avaliar a oralidade deste instrumento">${ic('fala',12)} Produção Oral${oralM(t).inst===i.id?' · ligada':''}</button>`)});
  $$('[data-inoral]').forEach(b=>b.onclick=e=>{e.stopPropagation();irOral(t,b.dataset.inoral)})}catch(e){console.warn(e)}return r}}
{const _vi1=vInstrumento;vInstrumento=function(id){const r=_vi1.apply(this,arguments);try{const t=T();const i=t.instrumentos.find(x=>x.id===id);const d=domOral(t);if(i&&d&&!i.oral&&i.itens.some(it=>it.dom===d.id)){const tb=$('#view .tabs.noprint');if(tb&&!tb.querySelector('[data-itoral]')){tb.insertAdjacentHTML('beforeend',`<button data-itoral>${ic('fala',13)} Produção Oral</button>`);tb.querySelector('[data-itoral]').onclick=()=>irOral(t,i.id)}}}catch(e){console.warn(e)}return r}}
/* ao criar/alterar itens de oralidade, a ligação à grelha oral fica feita automaticamente */
{const _sv=saveNow;saveNow=function(){try{const t=T();const d=t&&domOral(t);if(d)t.instrumentos.forEach(i=>{if(i.oral)return;const its=i.itens.filter(it=>it.dom===d.id);if(its.length&&!its.some(it=>it.oralLig!=null))its.forEach(it=>it.oralLig=true)})}catch(_){}return _sv.apply(this,arguments)}}

/* Itens e cotações: vista em árvore (grupos editáveis, itens indentados) */
const NIV_S=['Grupo','Pergunta','Alínea','Subalínea'];
instItens=function(t,i){i.itens.forEach(it=>{if(!Array.isArray(it.niv))it.niv=[it.rot||'']});const dO=domOral(t);const P=i.itens.map(itPath);
  const bloco=(k,l)=>{const pre=P[k].slice(0,l+1).join('\u0001');let a=k,b=k;while(a>0&&P[a-1].slice(0,l+1).join('\u0001')===pre&&P[a-1].length>l+1)a--;while(b<P.length-1&&P[b+1].slice(0,l+1).join('\u0001')===pre&&P[b+1].length>l+1)b++;return [a,b]};
  const linhas=[];P.forEach((p,k)=>{const ant=k?P[k-1]:[];for(let l=0;l<p.length-1;l++){if(ant.slice(0,l+1).join('\u0001')!==p.slice(0,l+1).join('\u0001')||ant.length<=l+1)linhas.push({g:true,k,l,lab:p[l]})}linhas.push({g:false,k,l:p.length-1,lab:p[p.length-1]})});
  const somaB=(a,b)=>i.itens.slice(a,b+1).reduce((s,it)=>s+(+it.cot||0),0);
  const sumDom=t.dominios.map(d=>({d,s:i.itens.filter(x=>x.dom===d.id).reduce((a,x)=>a+(+x.cot||0),0)})).filter(x=>x.s);const tot=instMax(i);
  const domSel=it=>`<select data-f="dom" class="itdom" aria-label="Domínio">${domById(t,it.dom)?'':'<option value="">— sem domínio —</option>'}${t.dominios.map(d=>`<option value="${d.id}" ${d.id===it.dom?'selected':''} title="${esc(d.nome)}">${esc(d.ab)} · ${esc(d.nome)}</option>`).join('')}</select>`;
  $('#i-body').innerHTML=`<div class="itbar2"><div class="itdoms">${sumDom.map(x=>`<span class="itdc" title="${esc(x.d.nome)}"><b>${esc(x.d.ab)}</b>${nf(x.s)}<small>${tot?Math.round(x.s/tot*100)+'%':''}</small></span>`).join('')}<span class="ittot"><b>${nf(tot)}</b> pontos · ${i.itens.length} ite${i.itens.length===1?'m':'ns'}</span></div>
      <p class="hint" style="margin:6px 0 0">Organize em grupos e sub-itens (até 4 níveis): <b>Grupo A</b> › <b>1.</b> › <b>1.1</b>. Só os itens finais têm cotação; os grupos mostram a soma.</p></div>
    <div class="itree" role="list">${linhas.map(r=>{const ind=`style="--d:${r.l}"`;
      if(r.g){const [a,b]=bloco(r.k,r.l);return `<div class="itr itg" role="listitem" ${ind} data-gk="${r.k}" data-gl="${r.l}"><span class="itlv">${NIV_S[r.l]}</span><input class="itlab" data-glab value="${esc(r.lab)}" aria-label="Nome do ${NIV_S[r.l].toLowerCase()}"><span class="sp1"></span><span class="itgs">${nf(somaB(a,b))} pts</span>
        <button class="btn sm" type="button" data-gadd="${r.k}|${r.l}">${ic('plus',13)} Item</button><button class="btn sm ico dng" type="button" data-gdel="${r.k}|${r.l}" aria-label="Apagar grupo">${ic('trash',13)}</button></div>`}
      const it=i.itens[r.k];const or=dO&&it.dom===dO.id;
      return `<div class="itr itf ${or?'itor':''}" role="listitem" ${ind} data-k="${r.k}"><span class="itlv">${r.l?NIV_S[r.l]:'Item'}</span><input class="itlab" data-niv="${r.l}" value="${esc(r.lab)}" aria-label="Designação do item ${r.k+1}">
        ${domSel(it)}${or?`<button type="button" class="itoralt ${it.oralLig?'on':''}" data-oral="${r.k}" aria-pressed="${!!it.oralLig}" title="Pontuação vem da grelha da Produção Oral">${ic('fala',13)} Oral</button>`:''}
        <span class="itcw"><input data-f="cot" value="${esc(String(it.cot).replace('.',','))}" inputmode="decimal" aria-label="Cotação"><small>pts</small></span>
        <span class="itac"><button class="btn sm ico" data-sub="${r.k}" title="Criar sub-itens" aria-label="Criar sub-itens" ${r.l>=3?'disabled':''}>↳</button>${r.l?`<button class="btn sm ico" data-out="${r.k}" title="Subir um nível" aria-label="Subir um nível">←</button>`:''}<button class="btn sm ico" data-up="${r.k}" aria-label="Subir">↑</button><button class="btn sm ico" data-dn="${r.k}" aria-label="Descer">↓</button><button class="btn sm ico dng" data-del="${r.k}" aria-label="Apagar">${ic('trash',13)}</button></span></div>`}).join('')||'<p class="mut" style="padding:14px">Ainda sem itens.</p>'}</div>
    <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="btn pri" id="it-add">${ic('plus',14)} Item</button><button class="btn" id="it-grp">${ic('layers',14)} Novo Grupo</button><button class="btn" id="it-addn">${ic('plus',14)} Vários Itens…</button></div>
    ${Object.keys(i.notas).length?'<div class="alert w" style="margin-top:10px">Este instrumento já tem classificações; alterar itens afeta as notas registadas.</div>':''}`;
  const re=()=>{i.itens.forEach(it=>{it.rot=itFolha(it)});i.nNiv=Math.max(1,...i.itens.map(it=>itPath(it).length));save();manterPosicao(()=>instItens(t,i))};
  const novo=(path,dom,cot)=>({id:uid()+Math.random().toString(36).slice(2,4),niv:path,rot:path[path.length-1],dom,cot});
  $$('#i-body [data-glab]').forEach(inp=>inp.onchange=()=>{const r=inp.closest('[data-gk]');const k=+r.dataset.gk,l=+r.dataset.gl;const [a,b]=bloco(k,l);for(let j=a;j<=b;j++){const p=itPath(i.itens[j]);p[l]=inp.value.trim()||p[l];i.itens[j].niv=p}re()});
  $$('#i-body [data-gadd]').forEach(bt=>bt.onclick=()=>{const [k,l]=bt.dataset.gadd.split('|').map(Number);const [a,b]=bloco(k,l);const last=i.itens[b];const p=itPath(last);const np=p.slice(0,l+1);const depth=Math.min(p.length,l+2);const base=p.slice(0,depth);base[depth-1]=incRot(p[depth-1]);i.itens.splice(b+1,0,novo(base,last.dom,last.cot));re()});
  $$('#i-body [data-gdel]').forEach(bt=>bt.onclick=()=>{const [k,l]=bt.dataset.gdel.split('|').map(Number);const [a,b]=bloco(k,l);if(!confirm(`Apagar o grupo “${P[k][l]}” e os seus ${b-a+1} itens?`))return;i.itens.splice(a,b-a+1).forEach(it=>Object.values(i.notas).forEach(n=>delete n[it.id]));re()});
  $$('#i-body .itf [data-niv]').forEach(inp=>inp.onchange=()=>{const it=i.itens[+inp.closest('[data-k]').dataset.k];const p=itPath(it);p[+inp.dataset.niv]=inp.value.trim();it.niv=p;re()});
  $$('#i-body .itf [data-f]').forEach(el=>el.onchange=()=>{const it=i.itens[+el.closest('[data-k]').dataset.k];it[el.dataset.f]=el.dataset.f==='cot'?Math.max(0,num(el.value)||0):el.value;re()});
  $$('#i-body [data-oral]').forEach(b=>b.onclick=()=>{const it=i.itens[+b.dataset.oral];it.oralLig=!it.oralLig;re()});
  $$('#i-body [data-del]').forEach(b=>b.onclick=()=>{const k=+b.dataset.del;const it=i.itens[k];i.itens.splice(k,1);Object.values(i.notas).forEach(n=>delete n[it.id]);re()});
  $$('#i-body [data-up]').forEach(b=>b.onclick=()=>{const k=+b.dataset.up;if(k>0){[i.itens[k-1],i.itens[k]]=[i.itens[k],i.itens[k-1]];re()}});
  $$('#i-body [data-dn]').forEach(b=>b.onclick=()=>{const k=+b.dataset.dn;if(k<i.itens.length-1){[i.itens[k+1],i.itens[k]]=[i.itens[k],i.itens[k+1]];re()}});
  $$('#i-body [data-out]').forEach(b=>b.onclick=()=>{const it=i.itens[+b.dataset.out];const p=itPath(it);if(p.length<2)return;p.splice(p.length-2,1);it.niv=p;re()});
  $$('#i-body [data-sub]').forEach(b=>b.onclick=()=>{const k=+b.dataset.sub;const it=i.itens[k];const p=itPath(it);if(p.length>=4)return;const l=p[p.length-1];const c1=/^\d+\.?$/.test(l)?l.replace(/\.$/,'')+'.1':/^[A-Z]\d*\.?$/i.test(l)?l.replace(/\.$/,'')+'.1':'a)';
    const n=parseInt(prompt('Quantos sub-itens em “'+l+'”?','2'))||0;if(n<1)return;const cot=Math.round((+it.cot||0)/n*100)/100;it.niv=[...p,c1];it.cot=cot;let lab=c1;const extra=[];for(let j=1;j<n;j++){lab=incRot(lab);extra.push(novo([...p,lab],it.dom,cot))}i.itens.splice(k+1,0,...extra);re()});
  $('#it-add').onclick=()=>{const l=i.itens[i.itens.length-1];if(!l){i.itens.push(novo(['1.'],(t.dominios[0]||{}).id,10));return re()}const p=itPath(l);i.itens.push(novo(p.length>1?[...p.slice(0,-1),incRot(p[p.length-1])]:[incRot(p[0])],l.dom,l.cot));re()};
  $('#it-grp').onclick=()=>{const gs=[...new Set(P.filter(p=>p.length>1).map(p=>p[0]))];const g=prompt('Nome do novo grupo:',gs.length?incRot(gs[gs.length-1]):'Grupo A');if(!g)return;const l=i.itens[i.itens.length-1];i.itens.push(novo([g.trim(),'1.'],l?l.dom:(t.dominios[0]||{}).id,l?l.cot:10));re()};
  $('#it-addn').onclick=()=>{const n=parseInt(prompt('Quantos itens?'));if(!n||n<1||n>80)return;const c=num(prompt('Cotação de cada item?','10'))||0;let l=i.itens[i.itens.length-1];for(let k=0;k<n;k++){const p=l?itPath(l).slice():['0.'];p[p.length-1]=incRot(p[p.length-1]);const it=novo(p,l?l.dom:(t.dominios[0]||{}).id,c);i.itens.push(it);l=it}re()};
};

/* Produção Oral: ícone próprio (balão de fala) e navegação */
ICONS.fala='<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z"/><path d="M8.5 8.2v2.6M11 7v5M13.5 8.2v2.6M16 9.2v.6"/>';
{const fix=()=>$$('[data-v="oral"]').forEach(b=>{b.onclick=e=>{e.preventDefault();go('oral')};const x=b.querySelector('[data-ico],svg');const sp=b.querySelector('[data-ico]');if(sp)sp.innerHTML=ic('fala',18);else if(x)x.outerHTML=ic('fala',18)});fix();const _nO=navOral;navOral=function(){const r=_nO.apply(this,arguments);fix();return r}}

/* ===================== Produção Oral: momentos de avaliação + cotações globais ou por momento ===================== */
const oralKey=o=>o.inst&&o.inst!==o.propId?o.inst:'_proprio';
function oralCfgDe(o,k){return (o.cfgI&&o.cfgI[k])||o.cfgGlob||o.cfg}
function oralRegsDe(o,k){return k===oralKey(o)?(o.regs||{}):((o.regsI||{})[k]||{})}
function oralTotK(t,k,aid){const o=oralM(t);const c=oralCfgDe(o,k);const r=oralRegsDe(o,k)[aid];if(!r||!r.n)return null;const ks=ORAL_P.filter(p=>r.n[p.k]);if(!ks.length)return null;return {pts:r2(ks.reduce((s,p)=>s+oralPts(c,p.k,r.n[p.k]),0)),completo:ks.length===ORAL_P.length}}
function oralMomentos(t){const o=oralM(t);const d=domOral(t);const L=instsOrais(t).map(i=>({k:i.id,i,nome:i.nome,per:i.periodo,data:i.data,its:i.itens.filter(it=>it.dom===d.id&&it.oralLig!==false)}));
  const pr=t.instrumentos.find(x=>x.oral);L.push({k:'_proprio',i:pr,nome:'Produção Oral',proprio:true,per:pr?pr.periodo:(o.per||perAtual(t)),data:pr?pr.data:o.data,its:[]});
  return L.sort((a,b)=>(a.per-b.per)||String(a.data||'9').localeCompare(String(b.data||'9')))}
function vOralLista(t){const o=oralM(t);const al=alunosAval(t);const M=oralMomentos(t);const P=[...new Set(M.map(m=>m.per))];barBtns([]);
  const card=m=>{const c=oralCfgDe(o,m.k);const tots=al.map(a=>oralTotK(t,m.k,a.id)).filter(Boolean);const comp=tots.filter(x=>x.completo);const med=comp.length?comp.reduce((s,x)=>s+x.pts,0)/comp.length:null;
    const pct=al.length?Math.round(comp.length/al.length*100):0;const pc=med!=null&&c.total?Math.round(med/c.total*100):null;const d=m.data?dataDeIso(m.data):null;const ativo=oralKey(o)===m.k;const prox=m.data&&m.data>=isoHoje();
    return `<button type="button" class="ormc ${ativo?'cur':''} ${m.proprio?'prop':''}" data-ormk="${m.k}">
      <span class="ormd">${d?`<b>${d.getDate()}</b><small>${['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][d.getMonth()]}</small>`:ic('fala',24)}</span>
      <span class="ormb"><span class="ormt"><b>${esc(m.nome)}</b>${m.proprio?'<span class="tag">autónoma</span>':''}${c!==o.cfgGlob&&o.cfgI&&o.cfgI[m.k]?'<span class="tag pri">cotações próprias</span>':''}</span>
        ${m.its.length?`<span class="orml">${ic('clipboard',13)} Itens de oralidade: ${m.its.map(it=>esc(itFolha(it))+' ('+nf(it.cot)+' pts)').join(', ')}</span>`:m.proprio?`<span class="orml">${ic('clipboard',13)} Instrumento próprio no domínio da oralidade</span>`:''}
        <span class="orml">${ic('users',13)} ${comp.length}/${al.length} avaliados${tots.length>comp.length?` · <b class="warn">${tots.length-comp.length} incompleto${tots.length-comp.length>1?'s':''}</b>`:''}</span>
        <span class="orml">${ic('chart',13)} ${med!=null?`média <b>${fmtP(r2(med))}</b> em ${fmtP(c.total)} pts${pc!=null?' · '+pc+'%':''}`:`cotação ${fmtP(c.total)} pts`}</span>
        ${m.data?`<span class="orml ${prox?'prox':''}">${ic('calendar',13)} ${prox?'Agendado · ':''}${fmtIso(m.data)}</span>`:''}
        <span class="ormp" aria-hidden="true"><i style="width:${pct}%"></i></span></span></button>`};
  $('#view').innerHTML=`<div class="card orms"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('fala',20)} Momentos de Produção Oral</h2><span class="tag">${M.length} momento${M.length!==1?'s':''}</span><span class="sp1"></span><button class="btn sm" id="orm-inst">${ic('clipboard',14)} Instrumentos</button></div>
    <p class="hint" style="margin:6px 0 4px">Cada instrumento com itens de oralidade é um momento de produção oral. Escolha um para abrir a grelha de registo; a pontuação conta para esse instrumento.</p>
    ${P.map(p=>{const L=M.filter(m=>m.per===p);return `<div class="ormg"><h3><span class="dot"></span>${perNome(p)} <span class="mut">· ${L.length} momento${L.length!==1?'s':''}</span></h3><div class="ormgrid">${L.map(card).join('')}</div></div>`}).join('')}</div>`;
  $$('[data-ormk]').forEach(b=>b.onclick=()=>{const k=b.dataset.ormk;if(oralKey(o)!==k){oralTrocar(t,k==='_proprio'?null:k);oralSync(t);save()}UI.oralAberta=true;vOral();$('#view').scrollTop=0});
  $('#orm-inst').onclick=()=>{UI.inst=null;go('instrumentos')}}
/* cotações: globais (todos os momentos) ou próprias do momento */
function oralEscopo(t){const o=oralM(t);const k=oralKey(o);const prop=!!(o.cfgI&&o.cfgI[k]);const s=$('#or-cot>summary');if(!s||s.querySelector('.orscope'))return;
  const tg=s.querySelector('.tag');tg.insertAdjacentHTML('beforebegin',`<span class="seg orscope" role="group" aria-label="Âmbito das cotações"><button type="button" data-orsc="g" class="${prop?'':'on'}" title="As mesmas cotações para todos os momentos">${ic('layers',13)} Global</button><button type="button" data-orsc="m" class="${prop?'on':''}" title="Cotações só para este momento de avaliação">${ic('target',13)} Só Este Momento</button></span>`);
  const det=$('#or-cot');const hint=det.querySelector('.hint');if(hint)hint.insertAdjacentHTML('beforebegin',`<div class="alert ${prop?'w':''}" style="margin:10px 0 0">${prop?`${ic('target',14)} Estas cotações aplicam-se <b>só a este momento</b>. Os outros momentos usam as cotações globais.`:`${ic('layers',14)} Cotações <b>globais</b>: valem para todos os momentos que não tenham cotações próprias.`}</div>`);
  s.querySelectorAll('[data-orsc]').forEach(b=>b.addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();const v=b.dataset.orsc;
    if(v==='m'&&!prop){o.cfgI[k]=JSON.parse(JSON.stringify(o.cfgGlob));UI.orCot=true;toast('Cotações próprias para este momento','ok')}
    else if(v==='g'&&prop){const r=await avisoModal('Voltar às cotações globais?',['As cotações próprias deste momento são descartadas.','As pontuações dos alunos passam a ser calculadas com as cotações globais.'],[{t:'Usar Globais',c:'pri',v:1},{t:'Cancelar',v:0}]);if(!r)return;delete o.cfgI[k]}
    else return;oralM(t);oralSync(t);save();manterPosicao(vOral)}))}
{const _vo3=vOral;vOral=function(){const t=T();if(t&&domOral(t)&&!UI.oralAberta)return vOralLista(t);const r=_vo3.apply(this,arguments);
  try{if(t&&domOral(t)){const o=oralM(t);const m=oralMomentos(t).find(x=>x.k===oralKey(o));const v=$('#view');
    v.insertAdjacentHTML('afterbegin',`<div class="orback"><button type="button" class="btn" id="or-voltar">${ic('setaE',15)} Momentos</button><span class="orbt">${ic('fala',16)} <b>${esc(m?m.nome:'Produção Oral')}</b>${m&&m.data?` · ${fmtIso(m.data)}`:''}${m?` · ${perNome(m.per)}`:''}</span></div>`);
    $('#or-voltar').onclick=()=>{UI.oralAberta=false;vOral();v.scrollTop=0};oralEscopo(t)}}catch(e){console.warn(e)}return r}}
irOral=function(t,instId){if(oralKey(oralM(t))!==(instId||'_proprio')){oralTrocar(t,instId||null);oralSync(t);save()}UI.oralAberta=true;go('oral')};
{const _gO=go;go=function(v){if(v!=='oral')UI.oralAberta=false;return _gO.apply(this,arguments)}}
{const fx=()=>$$('[data-v="oral"]').forEach(b=>b.onclick=e=>{e.preventDefault();UI.oralAberta=false;go('oral')});fx();const _nO2=navOral;navOral=function(){const r=_nO2.apply(this,arguments);fx();return r}}
ICONS.setaE='<path d="M19 12H5M12 19l-7-7 7-7"/>';

/* ===================== Instrumento: separador Produção Oral embutido + Análise exaustiva ===================== */
function oralEmbed(t,i){const o0=oralM(t);if(oralKey(o0)!==i.id){oralTrocar(t,i.id);oralSync(t);save()}const o=oralM(t);const c=o.cfg;const al=alunosFiltro(t);const d=domOral(t);
  const its=i.itens.filter(it=>it.dom===d.id&&it.oralLig!==false);const cotI=its.reduce((s,it)=>s+(+it.cot||0),0);const prop=!!(o.cfgI&&o.cfgI[i.id]);
  const conta=aid=>{const n=i.notas[aid];if(!n)return null;const v=its.map(it=>n[it.id]).filter(x=>x!=null&&x!=='');return v.length?r2(v.reduce((s,x)=>s+(+x||0),0)):null};
  const kp=()=>{const tt=al.map(a=>oralTotal(t,a.id)).filter(x=>x&&x.completo);return {n:tt.length,m:tt.length?tt.reduce((s,x)=>s+x.pts,0)/tt.length:null}};const K=kp();
  $('#i-body').innerHTML=`<div class="oremb">
    <div class="orembh"><div class="orembi">${ic('fala',18)}<div><b>Grelha de oralidade deste instrumento</b><small>${its.length?`Conta para ${its.map(it=>'<b>'+esc(itFolha(it))+'</b>').join(', ')} · ${nf(cotI)} pts no instrumento`:'Nenhum item de oralidade ligado — ative “Oral” nos Itens e Cotações.'}</small></div></div>
      <span class="sp1"></span><span class="tag ${prop?'pri':''}">${prop?'Cotações próprias':'Cotações globais'} · ${fmtP(c.total)} pts</span>
      <span class="orembk"><b>${K.n}/${al.length}</b><small>avaliados</small></span><span class="orembk"><b data-oremm>${K.m!=null?fmtP(r2(K.m)):'—'}</b><small>média /${fmtP(c.total)}</small></span>
      <button type="button" class="btn sm" id="ore-full">${ic('sliders',13)} Cotações e Ecrã Completo</button></div>
    ${al.length?`<div class="gwrap oregw"><table class="lst orreg oretb"><thead><tr><th scope="col" class="n">N.º</th><th scope="col" class="nm">Aluno</th>${ORAL_P.map(p=>`<th scope="col" title="${esc(p.n+(p.s?' ('+p.s+')':''))}">${esc(p.n.split(/[ /,]/)[0])}<div class="dh">${fmtP(oralMax(c,p.k))}</div></th>`).join('')}<th scope="col">Grelha</th><th scope="col">No Instrumento<div class="dh">${nf(cotI)} pts</div></th></tr></thead><tbody>
      ${al.map(a=>{const r=o.regs[a.id]||{n:{}};const tt=oralTotal(t,a.id);const ci=conta(a.id);return `<tr><td class="n">${esc(numAl(a))}</td><td class="nm" style="text-align:left"><span class="oral-al">${avatar(a,24)}<span>${esc(a.nome)}</span></span></td>
        ${ORAL_P.map(p=>`<td><div class="orlv" role="radiogroup" aria-label="${esc(p.n)} — ${esc(a.nome)}">${ORAL_N.map(([n])=>`<button type="button" role="radio" aria-checked="${r.n&&r.n[p.k]===n}" class="${r.n&&r.n[p.k]===n?'on':''}" data-oen="${a.id}|${p.k}|${n}" title="${esc(n==='0'?'Abaixo de N1 — 0 pontos':n+' — '+fmtP(oralPts(c,p.k,n))+' pts: '+p.d[n])}">${n}</button>`).join('')}</div></td>`).join('')}
        <td class="calc" data-oet="${a.id}"><b>${tt?fmtP(tt.pts):'—'}</b>${tt&&!tt.completo?'<div class="dh">incompleto</div>':''}</td><td class="calc orci" data-oec="${a.id}"><b>${ci!=null?fmtP(ci):'—'}</b></td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">Nenhum aluno frequenta a disciplina.</div>'}</div>`;
  $('#ore-full').onclick=()=>irOral(t,i.id);
  $$('#i-body [data-oen]').forEach(b=>b.onclick=()=>{const [aid,k,n]=b.dataset.oen.split('|');const r=o.regs[aid]=o.regs[aid]||{n:{}};r.n=r.n||{};r.n[k]=r.n[k]===n?'':n;oralSync(t);save();
    b.parentElement.querySelectorAll('button').forEach(x=>{const on=x.dataset.oen===b.dataset.oen&&r.n[k]===n;x.classList.toggle('on',on);x.setAttribute('aria-checked',on)});
    const tt=oralTotal(t,aid);$(`[data-oet="${aid}"]`).innerHTML=`<b>${tt?fmtP(tt.pts):'—'}</b>${tt&&!tt.completo?'<div class="dh">incompleto</div>':''}`;const ci=conta(aid);$(`[data-oec="${aid}"]`).innerHTML=`<b>${ci!=null?fmtP(ci):'—'}</b>`;
    const K2=kp();const m=$('[data-oremm]');if(m)m.textContent=K2.m!=null?fmtP(r2(K2.m)):'—';const kk=m&&m.closest('.orembh').querySelector('.orembk b');if(kk)kk.textContent=K2.n+'/'+al.length;anunciar&&anunciar(tt?'Total '+fmtP(tt.pts):'')});
  requestAnimationFrame(()=>{try{gridAjustar()}catch(_){}})}
{const _vi3=vInstrumento;vInstrumento=function(id){const oral=UI.instTab==='oral';if(oral)UI.instTab='stats';const r=_vi3.apply(this,arguments);if(oral)UI.instTab='oral';
  try{const t=T();const i=t.instrumentos.find(x=>x.id===id);const tb=$('#view .tabs.noprint');const b=tb&&tb.querySelector('[data-itoral]');
    if(b){b.onclick=()=>{UI.instTab='oral';vInstrumento(id)};if(oral){tb.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));oralEmbed(t,i)}}else if(oral){UI.instTab='notas';vInstrumento(id)}}catch(e){console.warn(e)}return r}}
/* ---------- Análise exaustiva do instrumento ---------- */
const stDP=v=>{if(v.length<2)return 0;const m=v.reduce((s,x)=>s+x,0)/v.length;return Math.sqrt(v.reduce((s,x)=>s+(x-m)**2,0)/v.length)};
const stMed=v=>{if(!v.length)return null;const s=[...v].sort((a,b)=>a-b);const k=s.length>>1;return s.length%2?s[k]:(s[k-1]+s[k])/2};
instStats=function(t,i){const al=alunosAval(t),max=instMax(i);const res=al.map(a=>({a,tot:instTotal(i,a.id)})).filter(x=>x.tot!=null).sort((x,y)=>y.tot-x.tot);
  if(!res.length||!max){$('#i-body').innerHTML=`<div class="card empty">${ic('chart',30)}<br><b>Ainda sem classificações</b><br><span class="mut">A análise aparece quando houver alunos classificados.</span></div>`;return}
  const F=res.map(x=>x.tot/max);const med=avg(F),mdn=stMed(F),dp=stDP(F);const pos=res.filter(x=>!negativa(t,x.tot/max));const neg=res.filter(x=>negativa(t,x.tot/max));const nAv=al.filter(a=>instTotal(i,a.id)==null);
  const DOM=t.dominios.filter(d=>i.itens.some(x=>x.dom===d.id)).map(d=>{const v=res.map(x=>{const y=instDom(i,x.a.id,d.id);return y&&y.pct}).filter(x=>x!=null);const cot=i.itens.filter(x=>x.dom===d.id).reduce((s,x)=>s+(+x.cot||0),0);
    return {d,cot,v:v.length?avg(v):null,mn:v.length?Math.min(...v):null,mx:v.length?Math.max(...v):null,pp:v.length?v.filter(x=>x>=.5).length/v.length:null}});
  /* índice de discriminação: 27% melhores vs 27% piores */
  const g=Math.max(1,Math.round(res.length*.27));const sup=res.slice(0,g),inf=res.slice(-g);
  const IT=i.itens.filter(it=>+it.cot).map((it,k)=>{const vs=res.map(x=>{const v=(i.notas[x.a.id]||{})[it.id];return v==null||v===''?null:+v});const resp=vs.filter(v=>v!=null);const p=resp.length?avg(resp.map(v=>v/it.cot)):0;
    const ps=avg(sup.map(x=>(+((i.notas[x.a.id]||{})[it.id])||0)/it.cot)),pi=avg(inf.map(x=>(+((i.notas[x.a.id]||{})[it.id])||0)/it.cot));
    return {it,k,p,full:resp.filter(v=>v>=it.cot-1e-9).length,zero:resp.filter(v=>v<=0).length,nr:vs.length-resp.length,di:res.length>=4?ps-pi:null,med:resp.length?avg(resp):null}});
  const dif=p=>p>=.7?['Fácil','ok']:p>=.4?['Médio','']:['Difícil','bad'];const disc=x=>x==null?'—':x>=.4?'Muito boa':x>=.3?'Boa':x>=.2?'Razoável':x<0?'Negativa':'Fraca';
  const bins=Array.from({length:10},(_,k)=>F.filter(f=>Math.min(9,Math.floor(f*10))===k).length);const bmax=Math.max(1,...bins);
  const dist=classesDe(t).map((nome,k)=>({m:{nome},k,n:res.filter(x=>mencao(t,x.tot/max).i===k).length}));
  const outros=t.instrumentos.filter(x=>x.id!==i.id&&x.periodo===i.periodo&&instMax(x)).map(x=>{const v=al.map(a=>instTotal(x,a.id)).filter(v=>v!=null);return v.length?{x,m:avg(v)/instMax(x)}:null}).filter(Boolean);
  const mO=outros.length?avg(outros.map(x=>x.m)):null;
  const ORI=t.origens?t.origens.map(o=>{const v=res.filter(x=>x.a.origem===o).map(x=>x.tot/max);return {o,n:v.length,m:v.length?avg(v):null}}).filter(x=>x.n):[];
  const sd=DOM.filter(x=>x.v!=null).sort((a,b)=>b.v-a.v);const dificeis=IT.filter(x=>x.p<.4).sort((a,b)=>a.p-b.p);const fracos=IT.filter(x=>x.di!=null&&x.di<.2);
  const ins=[];if(sd.length>1)ins.push(['ok',`Melhor desempenho em <b>${esc(sd[0].d.nome)}</b> (${pctD(t,sd[0].v)}); domínio a reforçar: <b>${esc(sd[sd.length-1].d.nome)}</b> (${pctD(t,sd[sd.length-1].v)}).`]);
  if(dificeis.length)ins.push(['bad',`${dificeis.length} ite${dificeis.length>1?'ns':'m'} com taxa de sucesso abaixo de 40%: ${dificeis.slice(0,5).map(x=>'<b>'+esc(itFolha(x.it))+'</b>').join(', ')} — rever estes conteúdos ou a formulação das perguntas.`]);
  if(neg.length)ins.push(['w',`${neg.length} aluno${neg.length>1?'s':''} com classificação negativa (${pct(neg.length/res.length)} dos avaliados).`]);
  if(dp>.2)ins.push(['w',`Resultados muito dispersos (desvio padrão ${pct(dp)}): a turma está heterogénea — considere diferenciar o trabalho.`]);else if(res.length>3)ins.push(['ok',`Resultados homogéneos (desvio padrão ${pct(dp)}).`]);
  if(mO!=null)ins.push([med>=mO?'ok':'w',`Média ${med>=mO?'acima':'abaixo'} da dos outros instrumentos do ${perNome(i.periodo)} (${pctD(t,med)} vs ${pctD(t,mO)}).`]);
  if(fracos.length&&res.length>=4)ins.push(['',`${fracos.length} ite${fracos.length>1?'ns':'m'} com fraca discriminação (não distinguem bem os alunos com melhor e pior desempenho): ${fracos.slice(0,5).map(x=>esc(itFolha(x.it))).join(', ')}.`]);
  if(nAv.length)ins.push(['',`${nAv.length} aluno${nAv.length>1?'s':''} sem classificação: ${nAv.slice(0,6).map(a=>esc(a.nome.split(' ')[0])).join(', ')}${nAv.length>6?'…':''}.`]);
  const bar=(v,cls)=>`<div class="tr"><div class="fi ${cls}" style="width:${Math.round(Math.max(0,Math.min(1,v||0))*100)}%"></div></div>`;
  UI.stOrd=UI.stOrd||'nota';
  $('#i-body').innerHTML=`<div class="stx">
    <div class="kpis stk"><div class="kpi"><div class="l">${ic('users',14)} Avaliados</div><div class="v">${res.length}/${al.length}</div><div class="mut">${pct(res.length/Math.max(1,al.length))}</div></div>
      <div class="kpi"><div class="l">${ic('chart',14)} Média</div><div class="v">${fmtNota(t,med)}</div><div class="mut">${pct(med)} · mediana ${fmtNota(t,mdn)}</div></div>
      <div class="kpi"><div class="l">${ic('check',14)} Positivas</div><div class="v">${pos.length}</div><div class="mut">${pct(pos.length/res.length)} · ${neg.length} negativa${neg.length!==1?'s':''}</div></div>
      <div class="kpi"><div class="l">Melhor</div><div class="v">${fmtNota(t,res[0].tot/max)}</div><div class="mut">${esc(res[0].a.nome)}</div></div>
      <div class="kpi"><div class="l">Mais baixa</div><div class="v">${fmtNota(t,res[res.length-1].tot/max)}</div><div class="mut">${esc(res[res.length-1].a.nome)}</div></div>
      <div class="kpi"><div class="l">Dispersão</div><div class="v">${pct(dp)}</div><div class="mut">desvio padrão · amplitude ${pct(F[0]-F[F.length-1])}</div></div></div>
    <div class="stins">${ins.map(([c,h])=>`<div class="sti ${c}">${ic(c==='bad'?'alert':c==='ok'?'check':c==='w'?'alert':'info',15)}<span>${h}</span></div>`).join('')}</div>
    <div class="stg">
      <section class="stc"><h3>Distribuição das classificações</h3><div class="sthist">${bins.map((n,k)=>`<div class="sthb" title="${k*10}–${k*10+10}%: ${n} aluno${n!==1?'s':''}"><i class="${negativa(t,(k+.5)/10)?'neg':''}" style="height:${Math.round(n/bmax*100)}%"></i><b>${n||''}</b><small>${k*10}</small></div>`).join('')}</div>
        <div class="bars" style="margin-top:12px">${dist.map(x=>`<div class="b"><span>${esc(x.m.nome)}</span>${bar(x.n/res.length,mcls(t,{i:x.k}))}<b>${x.n}</b></div>`).join('')}</div></section>
      <section class="stc"><h3>Por domínio</h3><table class="lst stt"><thead><tr><th scope="col" style="text-align:left">Domínio</th><th scope="col">Cotação</th><th scope="col" style="min-width:130px">Média</th><th scope="col">Mín.</th><th scope="col">Máx.</th><th scope="col">≥ 50%</th></tr></thead><tbody>
        ${DOM.map(x=>`<tr><th scope="row" style="text-align:left">${esc(x.d.nome)} <span class="mut">${esc(x.d.ab||'')}</span></th><td>${nf(x.cot)}</td><td><div class="stbi">${bar(x.v,mcls(t,mencao(t,x.v)))}<b>${pctD(t,x.v)}</b></div></td><td>${pctD(t,x.mn)}</td><td>${pctD(t,x.mx)}</td><td>${pct(x.pp)}</td></tr>`).join('')}</tbody></table>
        ${ORI.length>1?`<h3 style="margin-top:16px">Por turma de origem</h3><div class="bars">${ORI.map(x=>`<div class="b"><span>${esc(x.o)} <span class="mut">(${x.n})</span></span>${bar(x.m,mcls(t,mencao(t,x.m)))}<b>${fmtNota(t,x.m)}</b></div>`).join('')}</div>`:''}
        ${outros.length?`<h3 style="margin-top:16px">Comparação no ${perNome(i.periodo)}</h3><div class="bars"><div class="b cur"><span><b>${esc(i.nome)}</b></span>${bar(med,mcls(t,mencao(t,med)))}<b>${pctD(t,med)}</b></div>${outros.map(x=>`<div class="b"><span>${esc(x.x.nome)}</span>${bar(x.m,mcls(t,mencao(t,x.m)))}<b>${pctD(t,x.m)}</b></div>`).join('')}</div>`:''}</section></div>
    <section class="stc"><h3>Análise por item</h3><p class="hint" style="margin:0 0 8px">Taxa de sucesso = média obtida ÷ cotação. Discriminação = diferença de sucesso entre os 27% melhores e os 27% piores alunos (≥ 0,40 muito boa; &lt; 0,20 fraca).</p>
      <div class="tblw"><table class="lst stt stit"><thead><tr><th scope="col" style="text-align:left">Item</th><th scope="col">Domínio</th><th scope="col">Cot.</th><th scope="col">Média</th><th scope="col" style="min-width:150px">Sucesso</th><th scope="col">Dificuldade</th><th scope="col">Cotação total</th><th scope="col">Zero</th><th scope="col">Sem resposta</th><th scope="col">Discriminação</th></tr></thead><tbody>
      ${IT.map(x=>{const [dl,dc]=dif(x.p);return `<tr><th scope="row" style="text-align:left">${esc(itPath(x.it).join(' › '))}</th><td><span class="tag">${esc((domById(t,x.it.dom)||{}).ab||'—')}</span></td><td>${nf(x.it.cot)}</td><td>${x.med!=null?fmtP(r2(x.med)):'—'}</td><td><div class="stbi">${bar(x.p,mcls(t,mencao(t,x.p)))}<b>${pct(x.p)}</b></div></td><td><span class="tag ${dc}">${dl}</span></td><td>${x.full}</td><td>${x.zero}</td><td>${x.nr||''}</td><td>${x.di==null?'—':fmtP(r2(x.di))+' <small class="mut">'+disc(x.di)+'</small>'}</td></tr>`}).join('')}</tbody></table></div></section>
    <section class="stc"><div class="row" style="gap:10px;flex-wrap:wrap"><h3 style="margin:0">Resultados por aluno</h3><span class="sp1"></span><div class="seg" role="group" aria-label="Ordenar">${[['nota','Por Nota'],['num','Por Número']].map(([k,l])=>`<button type="button" data-stord="${k}" class="${UI.stOrd===k?'on':''}">${l}</button>`).join('')}</div></div>
      <div class="tblw" style="margin-top:8px"><table class="lst stt stal"><thead><tr><th scope="col">N.º</th><th scope="col" style="text-align:left">Aluno</th><th scope="col">Pontos</th><th scope="col" style="min-width:140px">Classificação</th><th scope="col">Menção</th>${DOM.map(x=>`<th scope="col" title="${esc(x.d.nome)}">${esc(x.d.ab||x.d.nome)}</th>`).join('')}<th scope="col">Desvio à média</th></tr></thead><tbody>
      ${(UI.stOrd==='num'?[...res].sort((a,b)=>(+a.a.num||0)-(+b.a.num||0)):res).map(x=>{const f=x.tot/max;const m=mencao(t,f);const dv=f-med;return `<tr class="${negativa(t,f)?'stneg':''}"><td class="n">${esc(numAl(x.a))}</td><td style="text-align:left"><span class="oral-al">${avatar(x.a,22)}<span>${esc(x.a.nome)}</span></span></td><td>${fmtP(r2(x.tot))}</td><td><div class="stbi">${bar(f,mcls(t,m))}<b>${fmtNota(t,f)}</b></div></td><td>${esc((m||{}).nome||'')}</td>
        ${DOM.map(d=>{const y=instDom(i,x.a.id,d.d.id);return `<td class="${y&&y.pct<.495?'stlo':''}">${y?pctD(t,y.pct):'—'}</td>`}).join('')}<td class="${dv<0?'stlo':'sthi'}">${Math.round(dv*100)>0?'+':''}${Math.round(dv*100)} pp</td></tr>`}).join('')}
      ${nAv.map(a=>`<tr class="stna"><td class="n">${esc(numAl(a))}</td><td style="text-align:left">${esc(a.nome)}</td><td colspan="${4+DOM.length}" class="mut">Não avaliado</td></tr>`).join('')}</tbody></table></div></section></div>`;
  $$('#i-body [data-stord]').forEach(b=>b.onclick=()=>{UI.stOrd=b.dataset.stord;manterPosicao(()=>instStats(t,i))})};

