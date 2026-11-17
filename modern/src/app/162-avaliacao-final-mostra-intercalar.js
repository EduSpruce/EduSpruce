/* ===================== v0.48: Avaliação Final mostra a intercalar do período ===================== */
{const _vAvI=vAvaliacao;vAvaliacao=function(){const r=_vAvI.apply(this,arguments);try{const t=T(),a=A();if(!t||!a)return r;const p=UI.per;const M=intMomentos(t,a).find(m=>m.p===+p);if(!M)return r;
  const tb=[...$$('#view table')].find(x=>/Atribu/.test(x.tHead&&x.tHead.textContent||''));if(!tb)return r;const R=(t.interc||{})[M.id]||{};
  const th=tb.tHead.rows[0].querySelector('th.stk');if(!th)return r;th.insertAdjacentHTML('afterend',`<th rowspan="2" class="afint"><button type="button" class="lnk" data-goint title="Abrir a Avaliação Intercalar">Intercalar</button><div class="dh">${M.data?fmtIso(M.data).slice(0,5):''}</div></th>`);
  [...tb.tBodies[0].rows].forEach(tr=>{const aid=tr.dataset.a;const c=tr.querySelector('td.stk');if(!aid||!c)return;const x=R[aid]||{};const k=INT_M.indexOf(x.m);
    c.insertAdjacentHTML('afterend',`<td class="afint">${x.sem?'<span class="mut" title="Sem avaliação intercalar">s/ aval.</span>':x.m?`<span class="itm m${k}" ${x.obs?`title="${esc(x.obs)}"`:''}>${esc(x.m==='Apenas Descritiva'?'Descritiva':x.m)}${x.obs?' ✎':''}</span>`:'<span class="mut">—</span>'}</td>`)});
  const tf=tb.tFoot&&tb.tFoot.rows[0];if(tf){const c=tf.cells[1];if(c){const n=Object.values(R).filter(x=>x.m&&!x.sem);const neg=n.filter(x=>x.m==='Insuficiente').length;c.insertAdjacentHTML('afterend',`<td class="afint"><small class="mut">${n.length?neg+' Ins.':''}</small></td>`)}}
  [...tb.tBodies[0].rows].forEach(tr=>{if(!tr.dataset.a&&tr.cells.length>2){const c=tr.cells[1];if(c)c.insertAdjacentHTML('afterend','<td class="afint"></td>')}});
  const b=$('#view [data-goint]');if(b)b.onclick=()=>{UI.intM=M.id;go('intercalar')}}catch(e){console.warn(e)}return r};if(go._f)go._f.avaliacao=vAvaliacao}

/* ===================== v0.49 · Esquema dos dados e migrações controladas ===================== */
/* Cada migração tem número, descrição e função. Antes de migrar guarda-se uma cópia (localStorage KEY+'.premig').
   S.esquema regista a versão; S.cfg.migracoes o histórico. Novas alterações de formato: acrescentar aqui. */
const MIGRACOES=[
  {v:2,n:'Chamada confirmada nas aulas que já tinham presenças registadas',f:st=>{(st.anos||[]).forEach(a=>Object.values(a.sumarios||{}).forEach(SM=>Object.values(SM||{}).forEach(x=>{if(x&&x.pres&&Object.keys(x.pres).length&&!x.cham)x.cham=1})))}}
];
const ESQUEMA=()=>Math.max(1,...MIGRACOES.map(m=>m.v));
function migrarDados(semGuardar){const v0=+S.esquema||1;const P=MIGRACOES.filter(m=>m.v>v0).sort((a,b)=>a.v-b.v);if(!P.length){if(!S.esquema)S.esquema=v0;return []}
  if(!semGuardar&&S.anos&&S.anos.length){try{localStorage.setItem(KEY+'.premig',JSON.stringify(S));localStorage.setItem(KEY+'.premigd',new Date().toLocaleString('pt-PT')+' · esquema '+v0)}catch(_){}}
  const feitas=[];P.forEach(m=>{try{m.f(S);S.esquema=m.v;feitas.push(m);(S.cfg=S.cfg||{},S.cfg.migracoes=S.cfg.migracoes||[]).push({v:m.v,n:m.n,em:Date.now()})}catch(e){console.error('Migração '+m.v+' falhou',e)}});
  if(feitas.length&&!semGuardar){try{saveNow();audit('Dados','Formato atualizado para o esquema '+S.esquema,feitas.map(m=>m.n).join(' · '))}catch(_){}}return feitas}
try{migrarDados()}catch(e){console.error(e)}
/* cópias importadas ou recebidas da nuvem também passam pelas migrações */
{const _ap0=aplicarPrefs;aplicarPrefs=function(){try{if((+S.esquema||1)<ESQUEMA())migrarDados()}catch(_){}return _ap0.apply(this,arguments)}}

