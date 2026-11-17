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
    ${!M.some(m=>!m.proprio||m.i)?'<div class="empty">Sem instrumentos marcados.</div>':''}${!M.some(m=>!m.proprio||m.i)?'':P.map(p=>{const L=M.filter(m=>m.per===p);return `<div class="ormg"><h3><span class="dot"></span>${perNome(p)} <span class="mut">· ${L.length} momento${L.length!==1?'s':''}</span></h3><div class="ormgrid">${L.map(card).join('')}</div></div>`}).join('')}</div>`;
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

