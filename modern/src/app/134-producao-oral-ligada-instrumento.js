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
const iniKey=c=>{const cl=[...c.classList].filter(x=>!['card','wide','drag','priv','on'].includes(x)&&!/^(an-|wg|ini)/.test(x)).join('.');const h=c.querySelector('h2');let k=(c.id||'')+'|'+cl+'|'+(h?h.textContent:'');return normT(k).replace(/\b(segunda|terca|quarta|quinta|sexta|sabado|domingo|janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/g,'').replace(/[0-9#.ºª·,]+/g,'').replace(/\s+/g,' ').trim().slice(0,60)};
/* posições/larguras guardadas: aceita também as chaves antigas (que incluíam classes de animação) */
const iniKeyN=k=>{const p=String(k).split('|');if(p.length>2)p[1]=p[1].replace(/an-(rev|card)|wgpousou|wgorig|wgpress|wgh/g,'');return p.join('|')};
function iniLer(P,k){if(!P)return null;if(P[k])return P[k];for(const o in P){const n=iniKeyN(o);if(n===k||(n.length>=14&&k.startsWith(n))||(k.length>=14&&n.startsWith(k)))return P[o]}return null}
function iniColunas(){return {main:$('#view .in-main'),side:$('#view .in-side'),fav:$('#view .in-fav')}}
function iniAplicar(){const C=iniColunas();if(!C.main||!C.side)return;const P=S.cfg.iniPos||{};const todos=[];Object.entries(C).forEach(([col,el])=>{if(el)[...el.children].forEach((c,i)=>{if((c.classList.contains('card')||/^w-/.test(c.id)))todos.push({c,col,i,k:iniKey(c)})})});
  const pos=o=>iniLer(P,o.k)||{col:o.col,i:o.i};
  ['main','side','fav'].forEach(col=>{const el=C[col];if(!el)return;todos.filter(o=>pos(o).col===col).sort((a,b)=>pos(a).i-pos(b).i).forEach(o=>el.appendChild(o.c))});
  todos.forEach(o=>{o.c.dataset.ik=o.k})}
function iniGuardar(){const C=iniColunas();const P={};Object.entries(C).forEach(([col,el])=>{if(el)[...el.children].filter(c=>(c.classList.contains('card')||/^w-/.test(c.id))).forEach((c,i)=>{P[c.dataset.ik||iniKey(c)]={col,i}})});S.cfg.iniPos=P;save()}
{const _vInS=vInicio;vInicio=function(){const r=_vInS.apply(this,arguments);try{if(dashM().modo!=='geral')iniAplicar()}catch(e){console.warn(e)}return r};if(go._f)go._f.inicio=vInicio}


