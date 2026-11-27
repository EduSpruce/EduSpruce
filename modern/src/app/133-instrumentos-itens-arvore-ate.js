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
      <td class="itd"><select data-f="dom">${domById(t,it.dom)?'':'<option value="">— sem domínio —</option>'}${domEsp(t).map(d=>`<option value="${d.id}" ${d.id===it.dom?'selected':''}>${esc(d.ab)} — ${esc(d.nome)}</option>`).join('')}</select>${dO&&it.dom===dO.id?`<label class="chk itorl" title="As pontuações vêm da grelha da Produção Oral"><input type="checkbox" data-oral="${k}" ${it.oralLig?'checked':''}> ${ic('fala',12)} Grelha oral</label>`:''}</td>
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
