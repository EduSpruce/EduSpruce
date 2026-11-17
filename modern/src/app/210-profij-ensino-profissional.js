/* ===================== v0.997 · PROFIJ ≠ Ensino Profissional =====================
   No ensino profissional: Mecanismo de Recuperação (MRA) por módulo.
   No PROFIJ: Plano de Recuperação da Assiduidade e Plano de Recuperação das Aprendizagens (por formando). */
const PREC_T={assid:'Plano de Recuperação da Assiduidade',aprend:'Plano de Recuperação das Aprendizagens'};
const PREC_E={curso:['Em curso',''],ok:['Cumprido','ok'],nao:['Não cumprido','bad']};
const precComp=t=>/ufcd|tecnol/i.test(normT(t.disciplina||''))?'tecnologica':cpmCompDe(t.disciplina||'')==='cientifica'?'cientifica':'sociocultural';
const PREC_CN={sociocultural:'Sociocultural',cientifica:'Científica',tecnologica:'Tecnológica'};
const precCfg=()=>S.cfg.precLim=S.cfg.precLim||{};
/* limites de assiduidade aprovados pelo conselho pedagógico: escritos à mão (sem valores por defeito); a turma pode ter um limite próprio */
/* Portaria n.º 52/2016 (PROFIJ, Açores), art. 37.º: componente tecnológica — assiduidade mínima por UFCD de 80 % (nível II) ou 90 % (nível IV);
   abaixo disso por faltas justificadas aplicam-se os mecanismos de recuperação. Sociocultural e científica — faltas injustificadas até ao dobro das horas semanais
   do domínio (acima: exclusão do domínio e PEA); os mecanismos para faltas justificadas são os do regulamento interno (limite do conselho pedagógico, opcional). */
const precNivel=t=>{if(t.precNivel)return +t.precNivel;const v=String((t.cnq&&t.cnq.nivel)||'');if(/IV|4/.test(v))return 4;if(/II|2/.test(v))return 2;const c=normT(t.curso||(t.cnq&&t.cnq.nome)||'');return /^tecnic/.test(c)?4:2};
const precLim=t=>{if(precComp(t)==='tecnologica')return precNivel(t)===4?90:80;if(t.precLim!=null&&t.precLim!=='')return +t.precLim;const v=precCfg()[precComp(t)];return v!=null&&v!==''?+v:null};
const precLimInj=t=>{if(precComp(t)==='tecnologica')return null;try{const L=pnlLimFaltas(t,A());return L.sem?L.sem*2:null}catch(_){return null}};
const precInj=x=>Math.max(0,((x.f&&x.f.tot)||0)-((x.f&&x.f.J)||0));
function vPrecup(){const t=T();const v=$('#view');if(!t)return go('turmas');
  if(ofertaDe(t)!=='profij'){v.innerHTML=`<div class="card empty">${ic('refresh',30)}<br><b>Só para turmas PROFIJ</b><br><span class="mut">${ehProfT(t)?'Nas turmas do ensino profissional usa-se o Mecanismo de Recuperação (MRA), por módulo.':'Os planos de recuperação do PROFIJ aparecem nas turmas PROFIJ.'}</span>${ehProfT(t)?`<br><br><button class="btn pri" id="pr-mra">Abrir o MRA</button>`:''}</div>`;const b=$('#pr-mra');if(b)b.onclick=()=>go('mra');return}
  t.planosRec=t.planosRec||[];const a=A();const tab=UI.precTab||'assid';const lim=precLim(t);
  let D=null;try{D=pnlDados(t,a,null)}catch(e){console.warn(e)}const L=D&&D.linhas?D.linhas:alunosAval(t).map(x=>({a:x,ass:null,f:{tot:0},nota:null,neg:false}));
  const pl=(aid,tp)=>t.planosRec.filter(p=>p.aid===aid&&p.tipo===tp);
  const limInj=precLimInj(t);const cand=x=>tab==='assid'?((lim!=null&&x.ass!=null&&x.ass<lim)||(limInj!=null&&precInj(x)>limInj)):x.neg;
  const lin=L.map(x=>{const P=pl(x.a.id,tab);const c=cand(x);return `<tr class="${c&&!P.length?'pnrb':''}"><td class="n">${esc(numAl(x.a))}</td><td style="text-align:left"><b>${esc(x.a.nome)}</b></td>
      <td>${tab==='assid'?(x.ass==null?'<span class="mut">sem dados</span>':`<span class="${lim!=null&&x.ass<lim?'neg':''}">${x.ass}%</span> <small class="mut">${x.f.tot} falta(s)${x.f.J?' · '+x.f.J+' justificada(s)':''}</small>${limInj!=null&&precInj(x)>limInj?' <span class="tag bad" title="Art. 37.º, n.º 1 e 11: excedeu o limite de faltas injustificadas — exclusão do domínio e Prova Extraordinária de Avaliação (PEA)">'+precInj(x)+' injustificadas &gt; '+limInj+' · PEA</span>':''}`):(x.nota==null?'<span class="mut">sem nota</span>':`<span class="${x.neg?'neg':''}">${esc(String(fmtNota(t,x.nota)))}</span>`)}</td>
      <td>${P.length?P.map(p=>`<button type="button" class="tag ${PREC_E[p.estado||'curso'][1]}" data-prv="${p.id}" title="Abrir o plano">${PREC_E[p.estado||'curso'][0]}${p.prazo?' · até '+cpdDM(p.prazo):''}</button>`).join(' '):c?'<span class="tag bad">sugerido</span>':'<span class="mut">—</span>'}</td>
      <td class="act"><button class="btn sm" data-prn="${x.a.id}">${ic('plus',13)} Plano</button></td></tr>`}).join('');
  const nP=t.planosRec.filter(p=>p.tipo===tab).length,nC=L.filter(cand).length;
  v.innerHTML=`<div class="prec"><section class="card"><div class="row" style="gap:10px;flex-wrap:wrap"><div><h2 style="margin:0">${ic('refresh',18)} Planos de Recuperação · PROFIJ</h2><div class="mut">${esc(t.nome)} · ${esc(t.disciplina)}</div></div><span class="sp1"></span>
      <div class="cpd-seg" role="group"><button type="button" data-prt="assid" class="${tab==='assid'?'on':''}">Assiduidade</button><button type="button" data-prt="aprend" class="${tab==='aprend'?'on':''}">Aprendizagens</button></div></div>
    <p class="hint" style="margin:10px 0 0">${tab==='assid'?`<b>${PREC_T.assid}</b>: para formandos que, por faltas justificadas, ficaram abaixo da assiduidade mínima (Portaria n.º 52/2016, art. 37.º).</p>${precLimHTML(t)}<p class="hint" style="margin:6px 0 0">`:`<b>${PREC_T.aprend}</b>: para formandos com aprendizagens por recuperar (classificação negativa ou UFCD por concluir), definido pelo conselho de turma com o coordenador.`} O Mecanismo de Recuperação (MRA) é só do ensino profissional.</p>
    <div class="cpm-kp"><div class="${nC?'w':''}"><small>${tab==='assid'?'Abaixo do limite':'Com negativa'}</small><b>${tab==='assid'&&lim==null&&limInj==null?'—':nC}</b>${tab==='assid'&&lim==null&&limInj==null?'<small>sem horário da turma</small>':''}</div><div><small>Planos</small><b>${nP}</b></div><div class="${t.planosRec.some(p=>p.tipo===tab&&p.estado==='nao')?'bad':''}"><small>Não cumpridos</small><b>${t.planosRec.filter(p=>p.tipo===tab&&p.estado==='nao').length}</b></div></div></section>
    <section class="card"><div class="tblw"><table class="lst"><thead><tr><th>N.º</th><th>Formando</th><th>${tab==='assid'?'Assiduidade':'Classificação'}</th><th>Plano</th><th></th></tr></thead><tbody>${lin||'<tr><td colspan="5" class="mut">Sem formandos.</td></tr>'}</tbody></table></div></section></div>`;
  v.querySelectorAll('[data-prt]').forEach(b=>b.onclick=()=>{UI.precTab=b.dataset.prt;vPrecup()});
  v.querySelectorAll('[data-prniv]').forEach(i=>i.onchange=()=>{t.precNivel=+i.value;save();manterPosicao(vPrecup)});
  v.querySelectorAll('[data-prl]').forEach(i=>i.onchange=()=>{const k=i.dataset.prl,x=i.value.trim()===''?'':Math.min(100,Math.max(0,+i.value.replace(',','.')||0));if(k==='turma'){if(x==='')delete t.precLim;else t.precLim=x}else{if(x==='')delete precCfg()[k];else precCfg()[k]=x}save();manterPosicao(vPrecup)});
  v.querySelectorAll('[data-prn]').forEach(b=>b.onclick=()=>precDlg(t,{aid:b.dataset.prn,tipo:tab}));
  v.querySelectorAll('[data-prv]').forEach(b=>b.onclick=()=>precDlg(t,t.planosRec.find(p=>p.id===b.dataset.prv)))}
function precDlg(t,p){const novo=!p.id;p=Object.assign({id:uid(),inicio:isoHoje(),prazo:'',motivo:'',medidas:'',estado:'curso',res:'',horas:''},p);const al=t.alunos.find(x=>x.id===p.aid)||{nome:''};
  openDrawer((novo?'Novo ':'')+PREC_T[p.tipo],`<div class="ed"><p style="margin-top:0"><b>${esc(al.nome)}</b> · ${esc(t.nome)} · ${esc(t.disciplina)}</p>
    <div class="row" style="gap:10px"><div style="flex:1"><label>Início</label><input type="date" id="pr-i" value="${esc(p.inicio)}"></div><div style="flex:1"><label>Prazo</label><input type="date" id="pr-p" value="${esc(p.prazo)}"></div>${p.tipo==='assid'?`<div style="flex:1"><label>Horas a recuperar</label><input type="number" id="pr-h" min="0" value="${esc(p.horas)}"></div>`:''}</div>
    <label>${p.tipo==='assid'?'Motivo (faltas justificadas, período)':'Aprendizagens a recuperar (UFCD / conteúdos)'}</label><textarea id="pr-m" rows="3">${esc(p.motivo)}</textarea>
    <label>Medidas e atividades</label><textarea id="pr-d" rows="4" placeholder="${p.tipo==='assid'?'ex.: trabalho autónomo orientado, aulas de apoio, entrega até…':'ex.: fichas de trabalho, prova de recuperação, apoio pedagógico acrescido…'}">${esc(p.medidas)}</textarea>
    <label>Situação</label><select id="pr-e">${Object.entries(PREC_E).map(([k,v])=>`<option value="${k}" ${p.estado===k?'selected':''}>${v[0]}</option>`).join('')}</select>
    <label>Resultado / observações</label><textarea id="pr-r" rows="2">${esc(p.res)}</textarea>
    <div class="row" style="margin-top:12px;gap:6px">${novo?'':`<button class="btn dng" id="pr-x2">${ic('trash',14)} Apagar</button>`}<button class="btn" id="pr-imp">${ic('printer',14)} Imprimir</button><span class="sp1"></span><button class="btn" id="pr-x">Cancelar</button><button class="btn pri" id="pr-ok">Guardar</button></div></div>`);
  const ler=()=>Object.assign(p,{inicio:$('#pr-i').value,prazo:$('#pr-p').value,motivo:$('#pr-m').value.trim(),medidas:$('#pr-d').value.trim(),estado:$('#pr-e').value,res:$('#pr-r').value.trim(),horas:($('#pr-h')||{}).value||''});
  $('#pr-x').onclick=closeDrawer;
  $('#pr-ok').onclick=()=>{ler();t.planosRec=t.planosRec||[];if(!t.planosRec.includes(p)&&!t.planosRec.some(x=>x.id===p.id))t.planosRec.push(p);save();closeDrawer();manterPosicao(vPrecup)};
  const x2=$('#pr-x2');if(x2)x2.onclick=()=>{if(!confirm('Apagar este plano?'))return;t.planosRec=t.planosRec.filter(x=>x.id!==p.id);save();closeDrawer();manterPosicao(vPrecup)};
  $('#pr-imp').onclick=()=>{ler();cpdDoc(PREC_T[p.tipo]+' — '+al.nome,`<h1>${esc(PREC_T[p.tipo])}</h1><p class="m">${esc(S.cfg.escola||'')} · PROFIJ · ${esc(t.nome)} · ${esc(t.disciplina)}</p>
    <table><tr><th style="width:28%">Formando</th><td>${esc(al.nome)}${al.num?' (n.º '+esc(al.num)+')':''}</td></tr><tr><th>Início / prazo</th><td>${p.inicio?fmtIsoL(p.inicio):'—'} · ${p.prazo?fmtIsoL(p.prazo):'—'}</td></tr>${p.tipo==='assid'?`<tr><th>Horas a recuperar</th><td>${esc(p.horas||'—')}</td></tr>`:''}
    <tr><th>${p.tipo==='assid'?'Motivo':'Aprendizagens a recuperar'}</th><td>${esc(p.motivo).replace(/\n/g,'<br>')}</td></tr><tr><th>Medidas e atividades</th><td>${esc(p.medidas).replace(/\n/g,'<br>')}</td></tr><tr><th>Situação</th><td>${PREC_E[p.estado][0]}</td></tr><tr><th>Resultado</th><td>${esc(p.res).replace(/\n/g,'<br>')}</td></tr></table>
    <div class="ass" style="justify-content:space-between"><div><i></i>O(A) Professor(a)<br>${esc(S.cfg.professor||'')}</div><div><i></i>O(A) Formando(a)</div><div><i></i>O(A) Encarregado(a) de Educação</div></div>`)}}
TITLES.precup='Planos de Recuperação';NEEDS_T.push('precup');MOD_VISTAS.add('precup');
{const _gPr=go;go=function(v){const r=_gPr.apply(this,arguments);if(go._f&&go._f.precup!==vPrecup)go._f.precup=vPrecup;try{navPrec()}catch(_){}return r};go._f=_gPr._f;if(go._f)go._f.precup=vPrecup}
function navPrec(){const t=T();const on=!!t&&ofertaDe(t)==='profij';$$('#side [data-v="precup"],#tnavHold [data-v="precup"]').forEach(b=>{b.hidden=!on;b.style.display=on?'':'none'})}
{const h=$('#tnavHold');const ref=h&&(h.querySelector('[data-v="mra"]')||h.querySelector('[data-v="modulos"]'));if(ref&&!h.querySelector('[data-v="precup"]')){ref.insertAdjacentHTML('afterend',`<button class="nav tnav" data-v="precup" title="Plano de Recuperação da Assiduidade e das Aprendizagens (PROFIJ)" hidden><span data-ico="refresh"></span><span class="lbl">Recuperação (PROFIJ)</span></button>`);const b=h.querySelector('[data-v="precup"]');b.querySelector('[data-ico]').innerHTML=ic('refresh',18);b.onclick=()=>go('precup')}}

