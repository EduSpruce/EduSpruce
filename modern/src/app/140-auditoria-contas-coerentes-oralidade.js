/* ===================== Auditoria v0.38: contas coerentes, oralidade pendente, rede de segurança ===================== */
/* arredondamento único: a nota que se vê é a que decide positiva/negativa, nível e menção */
function _rdx(x,d){const m=Math.pow(10,d);return Math.round(+(x*m).toFixed(6))/m}
function notaDec(){return S.cfg.arred==null?1:+S.cfg.arred}
function pctCanon(t,f){if(f==null||!isFinite(f))return null;return isSec(t)?Math.round(+_rdx(f*20,notaDec()).toFixed(6))*5:_rdx(f*100,0)}
fmtNota=function(t,f){if(f==null||!isFinite(f))return '';const d=notaDec();return isSec(t)?_rdx(f*20,d).toFixed(d).replace('.',','):_rdx(f*100,0)+'%'};
nivel=function(t,f){const p=pctCanon(t,f);if(p==null)return '';if(isSec(t))return p/5;return p<20?1:p<50?2:p<70?3:p<90?4:5};
mencao=function(t,f){const p=pctCanon(t,f);if(p==null)return null;const M=t.mencoes||[];if(!M.length)return null;for(let i=0;i<M.length;i++)if(p<=+M[i].max)return {i,nome:M[i].nome};const l=M.length-1;return {i:l,nome:M[l].nome}};
/* itens de oralidade ainda sem grelha preenchida = pendentes (não contam como zero) */
const itPend=(n,it,i)=>(!!it.oralLig||!!(i&&i.branco!=='zero'))&&(!n||n[it.id]==null||n[it.id]==='');
function instPendentes(i,aid){const n=i.notas[aid];return i.itens.filter(it=>itPend(n,it,i))}
{const _iD=instDom;instDom=function(i,aid,dom){const r=_iD.apply(this,arguments);if(!r)return r;const n=i.notas[aid];const its=i.itens.filter(x=>x.dom===dom);const pend=its.filter(it=>itPend(n,it,i));if(!pend.length)return r;
  const ok=its.filter(it=>!itPend(n,it,i));const max=ok.reduce((s,x)=>s+(+x.cot||0),0);if(!max)return null;const pts=ok.reduce((s,x)=>s+(num(n[x.id])||0),0);return {pts,max,pct:pts/max,pend:pend.length}}}
{const _iT=instTotal;instTotal=function(i,aid){const r=_iT.apply(this,arguments);if(r==null)return r;const n=i.notas[aid];const pend=i.itens.filter(it=>itPend(n,it,i));if(!pend.length)return r;
  const M=instMax(i);const mOk=M-pend.reduce((s,x)=>s+(+x.cot||0),0);if(mOk<=0)return null;return r*M/mOk}}
/* análise: avisar quando há oralidade por classificar */
{const _iS=instStats;instStats=function(t,i){const r=_iS.apply(this,arguments);try{const al=alunosAval(t);const np=al.filter(a=>instAvaliado(i,a.id)&&instPendentes(i,a.id).length).length;
  if(np){const box=$('#i-body .stins');if(box)box.insertAdjacentHTML('afterbegin',`<div class="sti w">${ic('fala',15)}<span><b>${np} aluno${np>1?'s':''}</b> com a oralidade por classificar: a nota deste instrumento é calculada só com os itens já classificados. <button type="button" class="btn sm" id="st-oral">Abrir Grelha Oral</button></span></div>`);const b=$('#st-oral');if(b)b.onclick=()=>{UI.instTab='oral';vInstrumento(i.id)}}}catch(_){}return r}}
/* rede de segurança: uma vista com erro não bloqueia a app */
{const _gS=go;go=function(v){if(!TITLES[v]&&!(go._f&&go._f[v])&&!['oral','mra'].includes(v))v='inicio';try{return _gS.apply(this,[v,...[].slice.call(arguments,1)])}catch(e){console.error('[EduSpruce] erro na vista',v,e);
  try{const vw=$('#view');if(vw)vw.innerHTML=`<div class="card empty" role="alert">${ic('alert',30)}<br><b>Não foi possível abrir esta página</b><br><span class="mut">Os seus dados estão guardados. Tente de novo ou volte ao Início.</span><div class="mut" style="font-size:12px;margin-top:8px">${esc(String(e&&e.message||e).slice(0,160))}</div><div class="row" style="justify-content:center;gap:8px;margin-top:12px"><button class="btn pri" id="err-ini">${ic('home',15)} Início</button><button class="btn" id="err-rep">Tentar de Novo</button></div></div>`;
    const a=$('#err-ini');if(a)a.onclick=()=>go('inicio');const b=$('#err-rep');if(b)b.onclick=()=>go(v)}catch(_){}}}}
/* validação das classificações: só números entre 0 e a cotação do item */
document.addEventListener('focusin',e=>{const x=e.target;if(x&&x.matches&&x.matches('#grid input[data-i]'))x.dataset.prev=x.value},true);
document.addEventListener('change',e=>{const x=e.target;if(!x||!x.matches||!x.matches('#grid input[data-i]'))return;const t=T();const i=t&&t.instrumentos.find(z=>z.id===UI.inst);if(!i)return;const it=i.itens.find(z=>z.id===x.dataset.i);if(!it)return;
  const s=x.value.trim();if(s==='')return;const v=num(s);const c=+it.cot||0;let msg='';
  if(v==null||!/^-?\d+([.,]\d+)?$/.test(s))msg='“'+s+'” não é uma classificação válida';else if(v<0)msg='A classificação não pode ser negativa';else if(v>c+1e-9)msg='Máximo neste item: '+nf(c)+' pts';
  if(msg){x.value=x.dataset.prev||'';x.dispatchEvent(new Event('input',{bubbles:true}));x.classList.add('bad');setTimeout(()=>x.classList.remove('bad'),1600);toast(msg+' — valor anterior reposto','aviso')}},true);

/* lista de instrumentos em cartões no telemóvel */
{const _vIs=vInstrumentos;vInstrumentos=function(){const r=_vIs.apply(this,arguments);try{if(!UI.inst)$$('#view table.lst').forEach(tb=>{if(!tb.querySelector('[data-irow]'))return;tb.classList.add('instl');const H=[...tb.querySelectorAll('thead th')].map(h=>h.textContent.trim());tb.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,k)=>{if(k>0&&H[k])td.dataset.l=H[k]}))})}catch(_){}return r};if(go._f)go._f.instrumentos=vInstrumentos}


