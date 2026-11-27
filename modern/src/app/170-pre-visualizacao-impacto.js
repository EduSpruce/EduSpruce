/* ===================== v0.50 · Pré-visualização do impacto ===================== */
function notasTurma(t){const p=perAtual(t);const o={};alunosAval(t).forEach(x=>{o[x.id]=ponderada(t,pctsFinal(t,x.id,p))});return o}
function impactoCalc(t,mudar,repor){const antes=notasTurma(t);mudar();let depois;try{depois=notasTurma(t)}finally{repor()}
  const L=alunosAval(t).map(x=>({x,a:antes[x.id],d:depois[x.id]})).filter(o=>{const fa=o.a==null?'':fmtNota(t,o.a),fd=o.d==null?'':fmtNota(t,o.d);return fa!==fd});
  return {L,neg:L.filter(o=>o.d!=null&&negativa(t,o.d)&&!(o.a!=null&&negativa(t,o.a))),pos:L.filter(o=>o.a!=null&&negativa(t,o.a)&&!(o.d!=null&&negativa(t,o.d))),nivel:L.filter(o=>o.a!=null&&o.d!=null&&nivel(t,o.a)!==nivel(t,o.d))}}
function impactoDlg(t,tit,desc,R,extra,ok){const d=document.createElement('dialog');d.className='impdlg';
  d.innerHTML=`<form method="dialog"><h2>${ic('alert',18)} ${esc(tit)}</h2><p>${desc}</p>
    <div class="dskp"><div class="${R.L.length?'w':''}"><b>${R.L.length}</b><span>classificaç${R.L.length===1?'ão muda':'ões mudam'}</span></div><div class="${R.nivel.length?'w':''}"><b>${R.nivel.length}</b><span>${isSec(t)?'classificações finais':'níveis'} mudam</span></div><div class="${R.neg.length?'bad':''}"><b>${R.neg.length}</b><span>passam a negativa</span></div><div><b>${R.pos.length}</b><span>passam a positiva</span></div></div>
    ${R.L.length?`<div class="impl">${R.L.map(o=>`<div class="dsln"><span>${esc(numAl(o.x))}. ${esc(o.x.nome)}</span><span class="mut">${o.a==null?'—':fmtNota(t,o.a)} → <b class="${o.d!=null&&negativa(t,o.d)?'stlo':''}">${o.d==null?'—':fmtNota(t,o.d)}</b>${o.a!=null&&o.d!=null&&nivel(t,o.a)!==nivel(t,o.d)?` <span class="tag w">${isSec(t)?'':'nível '}${nivel(t,o.a)} → ${nivel(t,o.d)}</span>`:''}</span></div>`).join('')}</div>`:'<p class="mut">Nenhuma classificação visível muda.</p>'}
    ${extra||''}<div class="row" style="gap:8px;margin-top:14px"><span class="sp1"></span><button value="no" class="btn">Cancelar</button><button value="ok" class="btn pri">${ic('check',14)} Confirmar</button></div></form>`;
  document.body.appendChild(d);d.addEventListener('close',()=>{const v=d.returnValue;d.remove();ok(v==='ok')});d.showModal()}
/* apagar instrumento */
{const _vIP=vInstrumentos;vInstrumentos=function(){const r=_vIP.apply(this,arguments);try{const t=T();if(!t||UI.inst)return r;
  $$('#view [data-x]').forEach(b=>{b.onclick=()=>{const i=t.instrumentos.find(x=>x.id===b.dataset.x);if(!i)return;const k=t.instrumentos.indexOf(i);
    const R=impactoCalc(t,()=>{t.instrumentos.splice(k,1)},()=>{t.instrumentos.splice(k,0,i)});const nc=alunosAval(t).filter(x=>instAvaliado(i,x.id)).length;
    impactoDlg(t,'Apagar «'+i.nome+'»?',`O instrumento tem ${nc} aluno${nc===1?'':'s'} classificado${nc===1?'':'s'}. Fica 30 dias no caixote do lixo. Impacto nas classificações do ${perAtual(t)}.º ${perW().toLowerCase()}:`,R,'',ok=>{if(!ok)return;paraLixo('instrumento',i,{ano:S.anoAtivo,turma:t.id});t.instrumentos=t.instrumentos.filter(x=>x!==i);save();vInstrumentos();toast('Instrumento apagado'+(R.L.length?' · '+R.L.length+' classificações alteradas':''),'ok')})}})}catch(e){console.warn(e)}return r};if(go._f)go._f.instrumentos=vInstrumentos}
/* mudar ponderações dos critérios */
{const _vCP=vCriterios;vCriterios=function(){const r=_vCP.apply(this,arguments);try{const t=T();if(!t)return r;
  $$('#view [data-d="peso"]').forEach(el=>{el.addEventListener('change',e=>{const d=t.dominios[+el.closest('tr').dataset.k];if(!d)return;const novo=num(el.value)||0,velho=d.peso;if(+novo===+velho)return;
    const temNotas=alunosAval(t).some(x=>ponderada(t,pctsFinal(t,x.id,perAtual(t)))!=null);if(!temNotas)return;e.stopImmediatePropagation();if($('dialog.impdlg[open]'))return;
    const R=impactoCalc(t,()=>{d.peso=novo},()=>{d.peso=velho});const tot=Math.round(t.dominios.reduce((s_,z)=>s_+(z===d?+novo:(+z.peso||0)),0)*1e6)/1e6;
    impactoDlg(t,'Alterar a ponderação de '+d.ab+'?',`${esc(d.nome)}: ${velho}% → <b>${novo}%</b>${tot!==100?` · <span class="stlo">total ${tot}%</span>`:''}.`,R,'',ok=>{if(ok){d.peso=novo;save();audit('Critérios','Ponderação alterada',t.nome+' · '+d.ab+' '+velho+'% → '+novo+'%')}else el.value=velho;vCriterios()})},true)})}catch(e){console.warn(e)}return r};if(go._f)go._f.criterios=vCriterios}

