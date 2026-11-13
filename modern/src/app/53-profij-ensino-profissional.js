/* ===================== v0.997 · PROFIJ ≠ Ensino Profissional =====================
   No ensino profissional: Mecanismo de Recuperação (MRA) por módulo.
   No PROFIJ: Plano de Recuperação da Assiduidade e Plano de Recuperação das Aprendizagens (por formando). */
const PREC_T={assid:'Plano de Recuperação da Assiduidade',aprend:'Plano de Recuperação das Aprendizagens'};
const PREC_E={curso:['Em curso',''],ok:['Cumprido','ok'],nao:['Não cumprido','bad']};
const precComp=t=>/ufcd|tecnol/i.test(normT(t.disciplina||''))?'tecnologica':cpmCompDe(t.disciplina||'')==='cientifica'?'cientifica':'sociocultural';
const PREC_CN={sociocultural:'Sociocultural',cientifica:'Científica',tecnologica:'Tecnológica'};
const precCfg=()=>S.cfg.precLim=S.cfg.precLim||{};
/* limites de assiduidade aprovados pelo conselho pedagógico: escritos à mão (sem valores por defeito); a turma pode ter um limite próprio */
const precLim=t=>{if(t.precLim!=null&&t.precLim!=='')return +t.precLim;const v=precCfg()[precComp(t)];return v!=null&&v!==''?+v:null};
function vPrecup(){const t=T();const v=$('#view');if(!t)return go('turmas');
  if(ofertaDe(t)!=='profij'){v.innerHTML=`<div class="card empty">${ic('refresh',30)}<br><b>Só para turmas PROFIJ</b><br><span class="mut">${ehProfT(t)?'Nas turmas do ensino profissional usa-se o Mecanismo de Recuperação (MRA), por módulo.':'Os planos de recuperação do PROFIJ aparecem nas turmas PROFIJ.'}</span>${ehProfT(t)?`<br><br><button class="btn pri" id="pr-mra">Abrir o MRA</button>`:''}</div>`;const b=$('#pr-mra');if(b)b.onclick=()=>go('mra');return}
  t.planosRec=t.planosRec||[];const a=A();const tab=UI.precTab||'assid';const lim=precLim(t);
  let D=null;try{D=pnlDados(t,a,null)}catch(e){console.warn(e)}const L=D&&D.linhas?D.linhas:alunosAval(t).map(x=>({a:x,ass:null,f:{tot:0},nota:null,neg:false}));
  const pl=(aid,tp)=>t.planosRec.filter(p=>p.aid===aid&&p.tipo===tp);
  const cand=x=>tab==='assid'?(lim!=null&&x.ass!=null&&x.ass<lim):x.neg;
  const lin=L.map(x=>{const P=pl(x.a.id,tab);const c=cand(x);return `<tr class="${c&&!P.length?'pnrb':''}"><td class="n">${esc(numAl(x.a))}</td><td style="text-align:left"><b>${esc(x.a.nome)}</b></td>
      <td>${tab==='assid'?(x.ass==null?'<span class="mut">sem dados</span>':`<span class="${lim!=null&&x.ass<lim?'neg':''}">${x.ass}%</span> <small class="mut">${x.f.tot} falta(s)</small>`):(x.nota==null?'<span class="mut">sem nota</span>':`<span class="${x.neg?'neg':''}">${esc(String(fmtNota(t,x.nota)))}</span>`)}</td>
      <td>${P.length?P.map(p=>`<button type="button" class="tag ${PREC_E[p.estado||'curso'][1]}" data-prv="${p.id}" title="Abrir o plano">${PREC_E[p.estado||'curso'][0]}${p.prazo?' · até '+cpdDM(p.prazo):''}</button>`).join(' '):c?'<span class="tag bad">sugerido</span>':'<span class="mut">—</span>'}</td>
      <td class="act"><button class="btn sm" data-prn="${x.a.id}">${ic('plus',13)} Plano</button></td></tr>`}).join('');
  const nP=t.planosRec.filter(p=>p.tipo===tab).length,nC=L.filter(cand).length;
  v.innerHTML=`<div class="prec"><section class="card"><div class="row" style="gap:10px;flex-wrap:wrap"><div><h2 style="margin:0">${ic('refresh',18)} Planos de Recuperação · PROFIJ</h2><div class="mut">${esc(t.nome)} · ${esc(t.disciplina)}</div></div><span class="sp1"></span>
      <div class="cpd-seg" role="group"><button type="button" data-prt="assid" class="${tab==='assid'?'on':''}">Assiduidade</button><button type="button" data-prt="aprend" class="${tab==='aprend'?'on':''}">Aprendizagens</button></div></div>
    <p class="hint" style="margin:10px 0 0">${tab==='assid'?`<b>${PREC_T.assid}</b>: para formandos abaixo do limite de assiduidade (faltas justificadas).</p>${precLimHTML(t)}<p class="hint" style="margin:6px 0 0">`:`<b>${PREC_T.aprend}</b>: para formandos com aprendizagens por recuperar (classificação negativa ou UFCD por concluir), definido pelo conselho de turma com o coordenador.`} O Mecanismo de Recuperação (MRA) é só do ensino profissional.</p>
    <div class="cpm-kp"><div class="${nC?'w':''}"><small>${tab==='assid'?'Abaixo do limite':'Com negativa'}</small><b>${tab==='assid'&&lim==null?'—':nC}</b>${tab==='assid'&&lim==null?'<small>defina o limite</small>':''}</div><div><small>Planos</small><b>${nP}</b></div><div class="${t.planosRec.some(p=>p.tipo===tab&&p.estado==='nao')?'bad':''}"><small>Não cumpridos</small><b>${t.planosRec.filter(p=>p.tipo===tab&&p.estado==='nao').length}</b></div></div></section>
    <section class="card"><div class="tblw"><table class="lst"><thead><tr><th>N.º</th><th>Formando</th><th>${tab==='assid'?'Assiduidade':'Classificação'}</th><th>Plano</th><th></th></tr></thead><tbody>${lin||'<tr><td colspan="5" class="mut">Sem formandos.</td></tr>'}</tbody></table></div></section></div>`;
  v.querySelectorAll('[data-prt]').forEach(b=>b.onclick=()=>{UI.precTab=b.dataset.prt;vPrecup()});
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

/* ===================== v0.997 · Criar o curso PROFIJ completo (Portaria n.º 52/2016 + Catálogo Nacional de Qualificações) ===================== */
const PFJ_TIPOS={
  'II-2':{n:'Nível II · Tipo 2 (2 anos)',d:[['sociocultural','Língua Portuguesa',160,[90,70]],['sociocultural','Língua Estrangeira I - Inglês',120,[70,50]],['sociocultural','Tecnologias de Informação e Comunicação',80,[50,30]],['sociocultural','Cidadania e Mundo Atual',160,[70,90]],['sociocultural','Higiene, Saúde e Segurança no Trabalho',30,[0,30]],['sociocultural','Educação Física',120,[75,45]],['cientifica','Matemática Aplicada',180,[100,80]],['cientifica','*',120,[50,70]]],ufcd:'775 a 1250 h',fct:[100,110]},
  'II-3':{n:'Nível II · Tipo 3 (1 ano)',d:[['sociocultural','Língua Portuguesa',50,[50]],['sociocultural','Língua Estrangeira I - Inglês',40,[40]],['sociocultural','Tecnologias de Informação e Comunicação',20,[20]],['sociocultural','Cidadania e Mundo Atual',20,[20]],['sociocultural','Higiene, Saúde e Segurança no Trabalho',30,[30]],['sociocultural','Educação Física',40,[40]],['cientifica','Matemática Aplicada',50,[50]],['cientifica','*',25,[25]]],ufcd:'775 a 850 h',fct:[210]},
  'IV-4':{n:'Nível IV · Tipo 4 (3 anos)',d:[['sociocultural','Língua Portuguesa',275,[100,100,75]],['sociocultural','Língua Estrangeira I - Inglês',200,[70,70,60]],['sociocultural','Tecnologias de Informação e Comunicação',100,[50,50,0]],['sociocultural','Mundo Atual',100,[40,40,20]],['sociocultural','Desenvolvimento Pessoal e Social',100,[40,40,20]],['sociocultural','Educação Física',180,[70,70,40]],['cientifica','Matemática e Realidade',200,[80,80,40]],['cientifica','*',200,[80,80,40]]],ufcd:'1050 a 1400 h',fct:[0,0,600]}};
/* aceita linhas copiadas do Catálogo (código, nome, horas) separadas por ; tabulação ou espaços */
function pfjLerUfcd(txt){return String(txt||'').split(/\n/).map(l=>l.trim()).filter(Boolean).map(l=>{let m=l.split(/\s*[;\t|]\s*/);
    if(m.length>=3&&/^\d{3,6}$/.test(m[0])&&/^\d+([.,]\d+)?$/.test(m[2]))return {cod:m[0],nome:m[1],horas:+m[2].replace(',','.'),prof:m[3]||''};
    const r=l.match(/^(\d{3,6})\s*[-–.]?\s*(.+?)\s+(\d{2,3})(?:\s*h(?:oras)?)?(?:\s+\d+[.,]\d+)?\s*$/i);if(r)return {cod:r[1],nome:r[2].replace(/\s*[-–]\s*$/,''),horas:+r[3],prof:''};return null}).filter(Boolean)}
function pfjCursoDlg(nome){const M=cpmM(nome);const a=A();const h=horarioDe(a,nome);let tp=M.tipoPfj||'II-2';
  const corpo=()=>{const T_=PFJ_TIPOS[tp];const anos=T_.d[0][3].length;const ai=Math.max(0,Math.min(anos-1,(parseInt(M.anoCurso)||1)-1));
    return `<label>Tipo de curso</label><select id="pf-t">${Object.entries(PFJ_TIPOS).map(([k,v])=>`<option value="${k}" ${k===tp?'selected':''}>${v.n}</option>`).join('')}</select>
    <div class="row" style="gap:10px"><div style="flex:2"><label>Curso (como no Catálogo)</label><input id="pf-c" value="${esc(M.curso||'')}" placeholder="ex.: Operador/a de Logística"></div><div style="flex:1"><label>Código</label><input id="pf-cod" value="${esc(M.ref||'')}" placeholder="ex.: 341026"></div><div style="flex:1"><label>Ano do curso</label><select id="pf-a">${Array.from({length:anos},(_,i)=>`<option value="${i}" ${i===ai?'selected':''}>${i+1}.º ano</option>`).join('')}</select></div></div>
    <label>Área de Educação e Formação</label><input id="pf-ar" value="${esc(M.area||'')}" placeholder="ex.: 341 · Comércio">
    <h3 style="margin:14px 0 4px">Componentes sociocultural e científica <small class="mut">(Portaria n.º 52/2016 — horas do ciclo; acerte as deste ano)</small></h3>
    <table class="lst pf-tb"><thead><tr><th>Disciplina</th><th class="n">Ciclo</th><th class="n">Este ano</th></tr></thead><tbody>${T_.d.map((d,i)=>`<tr><td>${d[1]==='*'?`<input id="pf-e2" value="${esc(M.esp2||'Atividades Económicas')}" placeholder="2.ª disciplina científica" style="max-width:260px">`:esc(d[1])}</td><td class="n">${d[2]}</td><td class="n"><input type="number" min="0" data-pfh="${i}" value="${d[3][ai]}" style="width:72px"></td></tr>`).join('')}</tbody></table>
    <h3 style="margin:14px 0 4px">UFCD da componente tecnológica <small class="mut">(${T_.ufcd} no ciclo)</small></h3>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:6px"><select id="pf-ref"><option value="">Referencial conhecido…</option>${Object.entries(pfjRefs()).map(([k,v])=>`<option value="${k}" ${M.ref===k?'selected':''}>${esc(k)} · ${esc(v.curso)} (${Object.keys(v.anos).map(n=>n+'.º ano').join(', ')})</option>`).join('')}</select><button type="button" class="btn sm" id="pf-refu">Usar as UFCD deste ano</button><button type="button" class="btn sm" id="pf-pdf">${ic('upload',13)} Importar Matriz em PDF</button></div>
    <p class="hint" style="margin:0 0 6px">Abra o referencial do curso no <a href="https://catalogo.anqep.gov.pt/qualificacoesPesquisa" target="_blank" rel="noopener">Catálogo Nacional de Qualificações</a> e cole aqui as UFCD deste ano, uma por linha: <b>código ; nome ; horas ; professor(a)</b> (o professor é opcional; também aceita o texto copiado da tabela do Catálogo).</p>
    <textarea id="pf-u" rows="8" style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px" placeholder="ex.:\n1234 ; Nome da UFCD ; 25 ; Prof. A\n5678 ; Outra UFCD ; 50">${esc(M.disc.filter(d=>d.comp==='tecnologica').map(d=>[d.det||'',d.nome,d.horas||'',d.prof||''].join(' ; ')).join('\n'))}</textarea><div id="pf-uo" class="hint"></div>
    <label>FPCT deste ano (horas)</label><input type="number" id="pf-f" min="0" value="${esc(M.fct.horas||T_.fct[ai]||'')}" style="width:100px">
    ${M.disc.length?`<p class="alert w" style="margin-top:10px">${ic('alert',14)} A matriz atual (${M.disc.length} disciplinas/UFCD) é substituída. As horas já dadas, os professores e as siglas do horário mantêm-se nas disciplinas com o mesmo nome.</p>`:''}
    <div class="row" style="margin-top:12px"><span class="sp1"></span><button class="btn" id="pf-x">Cancelar</button><button class="btn pri" id="pf-ok">${ic('check',14)} Criar a Matriz</button></div>`};
  openDrawer('Criar o Curso Completo · '+nome,`<div class="ed" id="pf-ed">${corpo()}</div>`);
  const ligar=()=>{$('#pf-t').onchange=()=>{tp=$('#pf-t').value;$('#pf-ed').innerHTML=corpo();ligar()};
    const u=$('#pf-u'),uo=$('#pf-uo');const cont=()=>{const L=pfjLerUfcd(u.value);uo.textContent=L.length?L.length+' UFCD · '+L.reduce((s,x)=>s+x.horas,0)+' h':''};u.oninput=cont;cont();
    const ru=$('#pf-refu');if(ru)ru.onclick=()=>{const k=$('#pf-ref').value;const R=pfjRefs()[k];if(!R)return toast('Escolha um referencial.','aviso');const an=String(+$('#pf-a').value+1);const U=R.anos[an];
      if($('#pf-cod')&&!$('#pf-cod').value)$('#pf-cod').value=k;if(!$('#pf-c').value)$('#pf-c').value=R.curso;if(!$('#pf-ar').value)$('#pf-ar').value=R.area||'';
      if(!U)return toast('Este referencial ainda não tem as UFCD do '+an+'.º ano. Importe a matriz em PDF desse ano.','aviso');u.value=U.map(x=>x.join(' ; ')).join('\n');cont()};
    const pp=$('#pf-pdf');if(pp)pp.onclick=()=>{closeDrawer();cpmImportarMatrizPdf(nome)};
    $('#pf-x').onclick=closeDrawer;$('#pf-ok').onclick=()=>{const T_=PFJ_TIPOS[tp];const e2=($('#pf-e2').value||'').trim()||'Disciplina científica 2';
      const velho=M.disc.slice();const igual=n=>velho.find(d=>normT(d.nome).replace(/\bi\b/g,'').replace(/\s+/g,' ')===normT(n).replace(/\bi\b/g,'').replace(/\s+/g,' '));
      const nova=[];T_.d.forEach((d,i)=>{const nm=d[1]==='*'?e2:d[1];const hh=+document.querySelector(`[data-pfh="${i}"]`).value||0;if(!hh)return;const o=igual(nm);nova.push(Object.assign(o?{...o}:{id:uid(),prof:'',sig:[],aj:0,dadas:null,det:''},{nome:nm,comp:d[0],horas:hh}))});
      pfjLerUfcd($('#pf-u').value).forEach(x=>{const o=velho.find(d=>d.comp==='tecnologica'&&(d.det===x.cod||normT(d.nome)===normT(x.nome)));nova.push(Object.assign(o?{...o}:{id:uid(),sig:[],aj:0,dadas:null},{nome:x.nome,comp:'tecnologica',horas:x.horas,det:x.cod,prof:x.prof||(o&&o.prof)||''}))});
      /* siglas do horário da turma: pelo nome da legenda; as UFCD ficam todas nos tempos «UFCD» (dadas em sequência) */
      if(h){const leg=h.legenda||[];const sigs=[...new Set(h.aulas.map(x=>x.ab))];
        sigs.forEach(sg=>{const l=leg.find(x=>normSig(x.ab)===normSig(sg))||{};const nm=l.nome&&normSig(l.nome)!==normSig(sg)?l.nome:cpmNomeSig(sg);
          if(/^ufcd|unidades de forma|tecnolog/i.test(normT(nm))||/^ufcd/i.test(sg)){nova.filter(d=>d.comp==='tecnologica'&&!(d.sig||[]).length).forEach(d=>{d.sig=[sg];if(!d.prof&&l.profs&&l.profs.length===1)d.prof=l.profs[0]});return}
          const d=nova.find(z=>z.comp!=='tecnologica'&&normT(z.nome).replace(/\bi\b/g,'').replace(/\s+/g,' ')===normT(nm).replace(/\bi\b/g,'').replace(/\s+/g,' '));if(d){if(!(d.sig||[]).some(x=>normSig(x)===normSig(sg)))d.sig=[...(d.sig||[]),sg];if(!d.prof&&l.profs)d.prof=l.profs.join(', ')}})}
      M.disc=nova;M.tipoPfj=tp;M.curso=$('#pf-c').value.trim();M.ref=$('#pf-cod').value.trim();M.area=$('#pf-ar').value.trim();M.anoCurso=(+$('#pf-a').value+1)+'.º';M.esp2=e2;M.nivel=tp.startsWith('IV')?'IV':'II';M.fct.horas=$('#pf-f').value;
      save();closeDrawer();vCProfij();toast('Matriz criada: '+nova.length+' disciplinas e UFCD. Marque na coluna «Eu» as que leciona.')}};ligar()}

function precLimHTML(t){const c=precCfg(),k=precComp(t);const inp=(id,v,lab,on)=>`<label class="prl ${on?'on':''}"><span>${lab}</span><input type="number" min="0" max="100" step="0.5" data-prl="${id}" value="${v!=null?esc(String(v)):''}" placeholder="—"> %</label>`;
  return `<div class="prlims"><b>Limites de assiduidade aprovados pelo conselho pedagógico</b><div class="row" style="gap:8px;flex-wrap:wrap;margin-top:6px">${Object.keys(PREC_CN).map(x=>inp(x,c[x],'Componente '+PREC_CN[x],x===k&&(t.precLim==null||t.precLim===''))).join('')}${inp('turma',t.precLim,'Só nesta turma',t.precLim!=null&&t.precLim!=='')}</div>
    <small class="mut">Os limites por componente valem para todas as turmas PROFIJ; «Só nesta turma» sobrepõe-se. Esta turma: componente ${PREC_CN[k].toLowerCase()} → ${precLim(t)!=null?'<b>'+precLim(t)+'%</b>':'<b class="neg">sem limite definido</b>'}.</small></div>`}

/* ===================== v0.999 · Importar a matriz / ponto de situação em PDF (horas, professores e UFCD automáticos) =====================
   Lê o PDF «Curso PROFIJ … Matriz Curricular / Componente de Formação Tecnológica Detalhada»: dados do curso, disciplinas
   (horas, aulas, dadas, professor), UFCD (código, nome, horas, dadas, professor), FPCT e cria um ponto de situação.
   O referencial (UFCD sem professores) fica guardado para criar outras turmas do mesmo curso. */
const PFJ_REF0={'341026':{curso:'Operador/a de Logística',area:'341 - Comércio',tipo:'II-2',anos:{1:[['0349','Ambiente, segurança, higiene e saúde no trabalho – conceitos básicos',25],['0403','Relacionamento interpessoal',25],['0404','Organização pessoal e gestão do tempo',25],['0778','Folha de cálculo',50],['1122','Noções e normas de qualidade',25],['8142','Cadeia de Abastecimento – Introdução',25],['8143','Proteção ambiental – introdução',25],['8144','Receção no armazém',50],['8145','Armazenagem de mercadorias',50],['8146','Preparação de encomendas - fundamentos',50],['8147','Processos de preparação de encomendas',50],['8517','Armazém- processos e atividades',25],['8518','Layout do armazém',50]]}}};
const pfjRefs=()=>{const {c}=CP();c.refs=c.refs||{};const R={};Object.entries(PFJ_REF0).forEach(([k,v])=>R[k]=JSON.parse(JSON.stringify(v)));Object.entries(c.refs).forEach(([k,v])=>{R[k]=R[k]||{curso:v.curso,area:v.area,tipo:v.tipo,anos:{}};Object.assign(R[k].anos,v.anos||{})});return R};
async function cpmLinhasPdf(file){const lib=await getPdfLib();const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;const L=[];
  for(let p=1;p<=doc.numPages;p++){const pg=await doc.getPage(p);const tc=await pg.getTextContent();const it=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>({x:i.transform[4],y:i.transform[5],s:i.str})).sort((a,b)=>b.y-a.y);const rows=[];
    it.forEach(i=>{const r=rows.find(r=>Math.abs(r.y-i.y)<=2.2);if(r)r.it.push(i);else rows.push({y:i.y,it:[i]})});
    rows.sort((a,b)=>b.y-a.y).forEach(r=>L.push(r.it.sort((a,b)=>a.x-b.x).map(i=>i.s).join(' ').replace(/\s+/g,' ').trim()))}return L}
function cpmLerMatrizTxt(L){const T=L.join('\n');const g=re=>{const m=T.match(re);return m?m[1].trim():''};
  const r={curso:g(/Curso\s+PROFIJ\s+[IV]+\s*[-–]\s*(.+)/i),area:g(/[ÁA]rea de Educa[cç][aã]o e Forma[cç][aã]o:\s*(.+)/i),nivel:g(/QNQ:\s*([IV]+)/i),tipo:g(/QNQ:\s*[IV]+\s*-\s*Tipo\s*(\d)/i),cod:g(/C[oó]d\.?\s*Interno:\s*(.+?)\s+Ano:/i),ano:g(/Ano:\s*(\d)\.?\s*º/i),ref:g(/Referencial de Forma[cç][aã]o:\s*(\d+)/i),disc:[],ufcd:[],fct:'',data:''};
  const dm=T.match(/Ponto de Situa[cç][aã]o\s*[-–]\s*(\d{2})\.(\d{2})\.(\d{4})/i);const dc=T.match(/\b\d\.º\s+(\d{2})\/(\d{2})\/(\d{2})\b/);
  r.data=dc?'20'+dc[3]+'-'+dc[2]+'-'+dc[1]:dm?dm[3]+'-'+dm[2]+'-'+dm[1]:'';
  let comp='';L.forEach(l=>{if(/Componente de Forma[cç][aã]o Sociocultural/i.test(l))comp='sociocultural';else if(/Componente de Forma[cç][aã]o Cient[ií]fica/i.test(l))comp='cientifica';else if(/Componente de Forma[cç][aã]o Tecnol[oó]gica/i.test(l))comp='tecnologica';else if(/Pr[aá]tica em Contexto/i.test(l))comp='pratica';
    let m=l.match(/^(\d{4})\s*[-–]\s*(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(-?\d+)(?:\s+(.+))?$/);if(m){if(!r.ufcd.some(u=>u.cod===m[1]))r.ufcd.push({cod:m[1],nome:m[2].trim(),horas:+m[3],dadas:+m[5],prof:(m[7]||'').trim()});return}
    m=l.match(/^CPFCT\s+(\d+)/i);if(m){r.fct=m[1];return}
    if(comp==='sociocultural'||comp==='cientifica'){m=l.match(/^([A-Za-zÀ-ÿ].+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(-?\d+)(?:\s+(.+))?$/);if(m&&!/^total/i.test(m[1])){let n=m[1].trim();if(/^l[ií]ngua estrangeira\s*[-–]\s*ingl/i.test(n))n='Língua Estrangeira I - Inglês';r.disc.push({nome:n,comp,horas:+m[2],dadas:+m[4],prof:(m[6]||'').trim()})}}});
  return r}
function cpmImportarMatrizPdf(nome){const inp=document.createElement('input');inp.type='file';inp.accept='.pdf,application/pdf';inp.onchange=async()=>{const f=inp.files[0];if(!f)return;
  try{toast('A ler a matriz…');const r=cpmLerMatrizTxt(await cpmLinhasPdf(f));if(!r.disc.length&&!r.ufcd.length)return toast('Não encontrei a matriz curricular neste PDF.','aviso');
    cpmMatrizPrev(nome,r,f.name)}
  catch(e){console.warn(e);toast('Não foi possível ler o PDF: '+e.message,'erro')}};inp.click()}
function cpmMatrizPrev(nome,r,fn){const M=cpmM(nome);const nn=n=>normT(n).replace(/\bi\b/g,'').replace(/\s+/g,' ');
  const fora=M.disc.filter(d=>!r.disc.some(x=>nn(x.nome)===nn(d.nome))&&!r.ufcd.some(u=>u.cod===d.det||normT(u.nome)===normT(d.nome)));
  const L=[...r.disc.map(x=>({...x,k:x.comp==='sociocultural'?'Sociocultural':'Científica'})),...r.ufcd.map(u=>({...u,nome:u.cod+' - '+u.nome,k:'UFCD'}))];
  openDrawer('Importar Matriz · '+nome,`<div class="ed"><p style="margin-top:0"><b>${esc(r.curso||fn)}</b>${r.ref?' · referencial '+esc(r.ref):''}${r.ano?' · '+r.ano+'.º ano':''}${r.area?' · '+esc(r.area):''}${r.nivel?' · nível '+esc(r.nivel)+(r.tipo?' tipo '+r.tipo:''):''}</p>
    <div class="cpm-tw"><table class="lst"><thead><tr><th></th><th>Disciplina / UFCD</th><th class="n">Horas</th><th class="n">Tempos</th><th class="n">Dadas</th><th>Professor(a)</th></tr></thead><tbody>${L.map((x,i)=>`<tr><td><small class="mut">${x.k}</small></td><td>${esc(x.nome)}</td><td class="n">${x.horas}</td><td class="n">${cpmAulas(x.horas)}</td><td class="n">${x.dadas}</td><td>${esc(x.prof||'—')}</td></tr>`).join('')}
      <tr><td><small class="mut">FPCT</small></td><td>CPFCT</td><td class="n">${esc(r.fct||'—')}</td><td></td><td></td><td></td></tr></tbody></table></div>
    <p class="hint">${L.length} linhas · ${L.reduce((s,x)=>s+x.horas,0)} h${r.data?' · as «dadas» entram como ponto de situação de '+fmtIsoL(r.data):''}.</p>
    ${fora.length?`<label class="chk"><input type="checkbox" id="mi-sub" checked> <span>Retirar da matriz o que não está no PDF: ${fora.map(d=>esc(d.nome)).join(', ')}</span></label>`:''}
    <label class="chk"><input type="checkbox" id="mi-pt" ${r.data?'checked':''} ${r.data?'':'disabled'}> <span>Criar o ponto de situação com as aulas dadas</span></label>
    <div class="row" style="margin-top:12px"><span class="sp1"></span><button class="btn" id="mi-x">Cancelar</button><button class="btn pri" id="mi-ok">${ic('check',14)} Importar</button></div></div>`);
  $('#mi-x').onclick=closeDrawer;$('#mi-ok').onclick=()=>{const sub=$('#mi-sub')&&$('#mi-sub').checked,pt=$('#mi-pt').checked;closeDrawer();cpmMatrizAplicar(nome,r,fn,{sub,pt,fora})}}
function cpmMatrizAplicar(nome,r,fn,o){const M=cpmM(nome);const f={name:fn};{
    const igual=n=>M.disc.find(d=>normT(d.nome).replace(/\bi\b/g,'').replace(/\s+/g,' ')===normT(n).replace(/\bi\b/g,'').replace(/\s+/g,' '));const dadas={};
    r.disc.forEach(x=>{let d=igual(x.nome);if(!d){d={id:uid(),sig:[],aj:0,dadas:null,det:''};M.disc.push(d)}Object.assign(d,{nome:x.nome,comp:x.comp,horas:x.horas});if(x.prof)d.prof=x.prof;dadas[d.id]=x.dadas});
    r.ufcd.forEach(x=>{let d=M.disc.find(z=>z.comp==='tecnologica'&&(z.det===x.cod||normT(z.nome)===normT(x.nome)));if(!d){d={id:uid(),sig:[],aj:0,dadas:null};M.disc.push(d)}Object.assign(d,{nome:x.nome,comp:'tecnologica',horas:x.horas,det:x.cod});if(x.prof)d.prof=x.prof;dadas[d.id]=x.dadas});
    /* a linha genérica «UFCD» do horário passa a ser as UFCD detalhadas */
    if(r.ufcd.length){const gen=M.disc.filter(d=>d.comp==='tecnologica'&&!d.det&&/^ufcd/i.test(d.nome));const sg=[...new Set(gen.flatMap(d=>d.sig||[]))];M.disc=M.disc.filter(d=>!gen.includes(d));M.disc.filter(d=>d.comp==='tecnologica'&&!(d.sig||[]).length).forEach(d=>d.sig=sg.slice())}
    pfjLigarSiglas(A(),nome,M.disc);
    Object.assign(M,{curso:r.curso||M.curso,area:r.area||M.area,nivel:r.nivel||M.nivel,cod:r.cod||M.cod,ref:r.ref||M.ref,anoCurso:r.ano?r.ano+'.º':M.anoCurso,tipoPfj:r.nivel==='IV'?'IV-4':r.tipo==='3'?'II-3':'II-2'});if(r.fct)M.fct.horas=r.fct;
    if(o.sub&&o.fora&&o.fora.length){const keep=new Set(o.fora.map(d=>d.id));const gsig=[...new Set(o.fora.filter(d=>d.comp==='tecnologica').flatMap(d=>d.sig||[]))];M.disc=M.disc.filter(d=>!keep.has(d.id));if(gsig.length)M.disc.filter(d=>d.comp==='tecnologica'&&!(d.sig||[]).length).forEach(d=>d.sig=gsig.slice())}
    if(o.pt&&r.data&&Object.keys(dadas).length){M.pontos=M.pontos||[];M.pontos=M.pontos.filter(p=>p.data!==r.data);M.pontos.push({id:uid(),data:r.data,dadas,obs:'Importado de '+f.name})}
    if(r.ref&&r.ufcd.length){const {c}=CP();c.refs=c.refs||{};const R=c.refs[r.ref]=c.refs[r.ref]||{curso:r.curso,area:r.area,tipo:M.tipoPfj,anos:{}};R.anos[r.ano||'1']=r.ufcd.map(u=>[u.cod,u.nome,u.horas])}
    const ord={sociocultural:0,cientifica:1,tecnologica:2};M.disc.sort((x,y)=>(ord[x.comp]-ord[y.comp])||(x.comp==='tecnologica'?0:0));
    save();vCProfij();toast(`Matriz importada: ${r.disc.length} disciplinas, ${r.ufcd.length} UFCD${o.pt&&r.data?', ponto de situação de '+fmtIsoL(r.data):''}.`)}}
/* siglas do horário da turma pelas legendas (usado na criação do curso e na importação da matriz) */
function pfjLigarSiglas(a,nome,lista){const h=horarioDe(a,nome);if(!h)return;const leg=h.legenda||[];const sigs=[...new Set(h.aulas.map(x=>x.ab))];const nn=n=>normT(n).replace(/\bi\b/g,'').replace(/\s+/g,' ');
  sigs.forEach(sg=>{const l=leg.find(x=>normSig(x.ab)===normSig(sg))||{};const nm=l.nome&&normSig(l.nome)!==normSig(sg)?l.nome:cpmNomeSig(sg);
    if(/^ufcd|unidades de forma|tecnolog/i.test(normT(nm))||/^ufcd/i.test(sg)){lista.filter(d=>d.comp==='tecnologica'&&!(d.sig||[]).length).forEach(d=>d.sig=[sg]);return}
    const d=lista.find(z=>z.comp!=='tecnologica'&&nn(z.nome)===nn(nm));if(d&&!(d.sig||[]).some(x=>normSig(x)===normSig(sg)))d.sig=[...(d.sig||[]),sg]})}
/* separador aberto sempre visível na faixa deslizante (telemóvel) */
{let _cpq=0;new MutationObserver(()=>{if(_cpq)return;_cpq=requestAnimationFrame(()=>{_cpq=0;const b=document.querySelector('#view .cptabs>button.on');const t=b&&b.parentElement;if(t&&t.scrollWidth>t.clientWidth+4&&!t.dataset.cen){t.dataset.cen=1;t.scrollLeft=Math.max(0,b.offsetLeft-t.clientWidth/2+b.offsetWidth/2)}})}).observe(document.getElementById('view')||document.body,{childList:true})}

/* ===================== v1.002 · Coord. PROFIJ por fases: Criação do Curso · Dia a Dia · Avaliação e Conclusão ===================== */
function cpGrupos(){return [
  {k:'leg',n:'Legislação',d:'portarias e regulamentos',i:'book',t:[['leg','book','Legislação','Legislação']]},
  {k:'cria',n:'Criação do Curso',d:'no início: matriz, equipa, horário e planeamento',i:'layers',t:[['turmas','users','Turmas e Formandos','Turmas'],['matriz','grid','Matriz Curricular','Matriz'],['equipa','users','Equipa Pedagógica e Distribuição de Serviço','Equipa'],['plano','calendar','Planeamento Anual','Planeamento']]},
  {k:'dia',n:'Dia a Dia',d:'pontos de situação, horários semanais, recuperações',i:'calendar',t:[['painel','chart','Painel','Painel'],['pontos','flag','Pontos de Situação','Pontos'],['dist','flow','Horários Semanais e Cedências','Horários'],['recup','refresh','Recuperação das Aprendizagens e da Assiduidade','Recuperações'],['cc','meet','Conselho dos Cursos','Conselho']]},
  (()=>{const term=cpAlgumTerminal();return {k:'aval',n:term?'Avaliação e Conclusão':'Avaliação',d:term?'FPCT, PAF, PEA, classificação final e pautas':'FPCT, PEA e classificação anual',i:'award',t:[['fpct','building','Formação Prática em Contexto de Trabalho (FPCT)','FPCT'],...(term?[['paf','clipboard','Prova de Avaliação Final (PAF)','PAF']]:[]),['pea','clipboard','Prova Especial de Avaliação (PEA)','PEA'],['pautas','award',term?'Classificação Final de Curso (Médias Finais)':'Classificação Anual (CFA)',term?'Classificação Final':'Classificação Anual'],['oficiais','file','Pautas Oficiais (Word e PDF)','Pautas Oficiais']]}})(),
]}
function cpGruposHTML(G,g){return `<nav class="cpgs noprint" aria-label="Fases do trabalho">${G.map((x,i)=>`<button type="button" data-cpg="${x.k}" class="cpg ${x===g?'on':''} ${x.k==='leg'?'cpg-l':''}" aria-current="${x===g?'step':'false'}"><span class="cpg-n">${i}</span><span class="cpg-t">${ic(x.i,16)} <b>${x.n}</b><small>${x.d}</small></span></button>`).join('')}</nav>`}
/* resumo das recuperações (PROFIJ) de todas as turmas: abre a turma para trabalhar */
function cpRecupHTML(a){const T=(a?a.turmas:[]).filter(t=>ofertaDe(t)==='profij');
  if(!T.length)return `<section class="card empty">${ic('refresh',28)}<br><b>Sem turmas PROFIJ neste ano letivo</b></section>`;
  const lin=T.map(t=>{const P=t.planosRec||[];const lim=precLim(t);let ab=0,neg=0;try{const D=pnlDados(t,a,null);ab=lim==null?null:D.linhas.filter(x=>x.ass!=null&&x.ass<lim).length;neg=D.linhas.filter(x=>x.neg).length}catch(_){}
    const c=(tp,e)=>P.filter(p=>p.tipo===tp&&(!e||(p.estado||'curso')===e)).length;
    return `<tr><td><b>${esc(t.nome)}</b><div class="hint">${esc(t.disciplina)}</div></td><td class="n">${ab==null?'<span class="mut" title="limite por definir">—</span>':ab}</td><td class="n">${c('assid')}</td><td class="n">${neg}</td><td class="n">${c('aprend')}</td><td class="n ${P.some(p=>p.estado==='nao')?'neg':''}">${P.filter(p=>p.estado==='nao').length}</td><td class="act"><button class="btn sm" data-cprt="${t.id}">${ic('refresh',13)} Abrir</button></td></tr>`}).join('');
  return `<section class="card"><h2 style="margin:0 0 4px">${ic('refresh',18)} Recuperação das Aprendizagens e da Assiduidade</h2><p class="hint" style="margin:0 0 10px">Plano de Recuperação da Assiduidade e Plano de Recuperação das Aprendizagens de cada turma PROFIJ (o MRA é só do ensino profissional). Os limites de assiduidade são os aprovados pelo conselho pedagógico.</p>
    <div class="tblw"><table class="lst"><thead><tr><th>Turma · disciplina</th><th class="n">Abaixo do limite</th><th class="n">Planos de assiduidade</th><th class="n">Com negativa</th><th class="n">Planos de aprendizagens</th><th class="n">Não cumpridos</th><th></th></tr></thead><tbody>${lin}</tbody></table></div></section>`}
function cpRecupBind(v){v.querySelectorAll('[data-cprt]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.cprt;save();go('precup')})}

/* ===================== v1.003 · Pautas Oficiais = só os documentos (a avaliação faz-se na FPCT e na Classificação Final de Curso) ===================== */
function ptDocsPinta(el,cl,C,P,L,pinta){const fN=(v,d)=>v==null?'—':ptN(v,d);const nF=L.filter(x=>x.fin!=null).length,nC=L.filter(x=>x.cfc!=null).length,n=L.length;
  const doc=(t,tit,sub,ok)=>`<div class="ptdoc ${ok?'':'inc'}"><div><b>${tit}</b><small>${sub}</small></div><div class="row" style="gap:6px"><button type="button" class="btn sm pri" data-ptx="${t}|w">${ic('file',13)} Word</button><button type="button" class="btn sm" data-ptx="${t}|p">${ic('printer',13)} PDF</button></div></div>`;
  el.classList.remove('pt-in');
  el.innerHTML=`<div class="ptbar"><select id="pt-cl" aria-label="Turma">${C.map(c=>`<option ${c.nome===cl.nome?'selected':''}>${esc(c.nome)}</option>`).join('')}</select><b class="pt-tt">Pautas Oficiais · ${esc(cl.nome)}</b>${cpCursoChip(cl.nome)}<span class="sp1"></span></div>
    <p class="hint" style="margin:6px 0 10px">Os documentos finais, com a composição dos modelos da escola. As notas vêm da <button type="button" class="lnk" data-ptir="fpct">avaliação da FPCT</button> e da <button type="button" class="lnk" data-ptir="pautas">Classificação Final de Curso</button>.</p>
    <div class="ptdocs"><h3>${ic('building',15)} Formação Prática em Contexto de Trabalho <span class="tag ${nF===n&&n?'ok':'w'}">${nF}/${n} avaliados</span></h3>${doc('fpctF','Pauta Final','N.º, BI/CC, nome e nota',nF===n)}${doc('fpctD','Pauta Detalhada','Relatório, avaliação da entidade, nota e nota final',nF===n)}
      ${cpCurso(cl.nome).terminal||UI.cpTodos?`<h3>${ic('award',15)} Classificação Final de Curso <span class="tag ${nC===n&&n?'ok':'w'}">${nC}/${n} com CFC</span></h3>${doc('cfcF','Pauta Final','N.º, BI/CC, nome e nota',nC===n)}${doc('cfcD','Pauta Detalhada',cpAnosArr(cpCurso(cl.nome)).map(k=>'CFA'+k).join(', ')+', CPAF e nota final, com as fórmulas',nC===n)}`:`<p class="hint" style="margin-top:12px">${ic('cadeado',13)} A pauta da Classificação Final de Curso aparece no ${cpCurso(cl.nome).anos}.º ano (terminal). Esta turma está no ${cpCurso(cl.nome).ano}.º ano.</p>`}</div>
    <div class="tblw" style="margin-top:12px"><table class="lst"><thead><tr><th>N.º</th><th style="text-align:left">Nome</th><th>FPCT</th>${cpAnosArr(cpCurso(cl.nome)).map(k=>`<th>CFA${k}</th>`).join('')}${cpCurso(cl.nome).terminal||UI.cpTodos?'<th>CPAF</th><th>CFC</th>':''}</tr></thead><tbody>${L.map(x=>`<tr><td>${esc(x.proc)}</td><td style="text-align:left">${esc(x.nome)}</td><td>${x.fin==null?'—':x.fin}</td>${cpAnosArr(cpCurso(cl.nome)).map(k=>`<td>${fN(x.cfa[k].cfa)}</td>`).join('')}${cpCurso(cl.nome).terminal||UI.cpTodos?`<td>${fN(x.cpaf)}</td><td><b>${x.cfc==null?'—':x.cfc}</b></td>`:''}</tr>`).join('')}</tbody></table></div>
    <details class="ptcfg"><summary>${ic('sliders',14)} Cabeçalho e assinatura</summary><div class="ptg">
      <label>Entidade<input data-ptc="sec" value="${esc(P.sec)}"></label><label>Ano letivo<input data-ptc="ano" value="${esc(P.ano)}"></label>
      <label>Curso (FPCT)<input data-ptc="curso" value="${esc(P.curso)}"></label><label>Curso (Classificação Final)<input data-ptc="cursoCF" value="${esc(P.cursoCF)}"></label>
      <label class="w2">Legislação<input data-ptc="port" value="${esc(P.port)}"></label><label>Localidade<input data-ptc="local" value="${esc(P.local)}"></label><label>Data<input type="date" data-ptc="data" value="${esc(P.data)}"></label>
      <label>Assinatura<input data-ptc="assin" value="${esc(P.assin)}"></label>
      <div class="w2 ptlg"><span>Logótipos do cabeçalho: o da escola (Definições) à esquerda${(CP().c.ptLogos||[]).length?' e '+(CP().c.ptLogos.length)+' imagem(ns) do seu modelo à direita':''}.</span><label class="btn sm">${ic('upload',13)} Usar os logótipos do meu modelo Word<input type="file" id="pt-mod" accept=".docx" hidden></label>${(CP().c.ptLogos||[]).length?'<button type="button" class="btn sm" id="pt-modx">Retirar</button>':''}</div></div></details>`;
  el.querySelector('#pt-cl').onchange=e=>{UI.ptCl=e.target.value;pinta()};
  el.querySelectorAll('[data-ptc]').forEach(i=>i.onchange=()=>{P[i.dataset.ptc]=i.dataset.ptc==='anoC'?+i.value:i.value;save();pinta()});
  el.querySelectorAll('[data-ptx]').forEach(b=>b.onclick=()=>{const [t,f_]=b.dataset.ptx.split('|');(f_==='w'?ptDocx:ptPdf)(cl,t).catch(e=>alert(e.message))});
  el.querySelectorAll('[data-ptir]').forEach(b=>b.onclick=()=>{UI.cpTab=b.dataset.ptir;const x=document.querySelector('#ampv #amp-x');if(x)x.click();if(VIEW!=='cprofij')go('cprofij');else vCProfij()});
  const md=el.querySelector('#pt-mod');if(md)md.onchange=async()=>{try{CP().c.ptLogos=await ptModeloLogos(md.files[0]);save();toast('Logótipos do modelo guardados','ok');pinta()}catch(e){toast(e.message,'erro')}};
  const mx=el.querySelector('#pt-modx');if(mx)mx.onclick=()=>{CP().c.ptLogos=[];save();pinta()}}
/* grelha de avaliação da FPCT (Excel da escola: folhas «Relatório» e «Final») → avaliação da FPCT da turma */
async function ptImportarGrelha(cl,file){const F=await ptXlsxFolhas(file);const P=ptCfg(cl);
  const shR=F.find(x=>/relat/i.test(x.nome))||F[0],shF=F.find(x=>/final/i.test(x.nome));const g=(sh,r)=>sh?(sh.C.get(r)||'').trim():'';
  const col=s=>s.split('').reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0),ltr=n=>{let s='';while(n){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
  const acha=(sh,re)=>{if(!sh)return null;for(const [k,v] of sh.C)if(re.test(v)){const m=k.match(/^([A-Z]+)(\d+)$/);return {c:col(m[1]),r:+m[2]}}return null};
  const hN=acha(shR,/^nome$/i),hRel=acha(shR,/^relat[oó]rio$/i);if(!hN||!hRel)throw new Error('Não encontrei a grelha (colunas NOME e Relatório) neste ficheiro.');
  let rc=hRel.r+1;while(rc<hRel.r+6&&!g(shR,ltr(hRel.c)+rc))rc++;const crit=[];for(let c=hRel.c;c<hRel.c+12;c++){const t=g(shR,ltr(c)+rc);if(!t)continue;if(/nota|classif/i.test(t))break;crit.push({c,n:t,m:+String(g(shR,ltr(c)+(rc+1))).replace(',','.')||20})}
  if(crit.length)P.crit=crit.map(c=>({n:c.n,m:c.m}));
  const ent={},bi={};if(shF){const fN=acha(shF,/^nome$/i),fE=acha(shF,/entidade/i),fR=acha(shF,/^relat[oó]rio$/i),fB=acha(shF,/^bi\/?cc$/i);
    if(fR){const w=+String(g(shF,ltr(fR.c)+(fR.r+2))).replace(',','.');if(w>0&&w<1)P.pRel=Math.round(w*100)}
    if(fN)for(let r=fN.r+1;r<fN.r+80;r++){const n=g(shF,ltr(fN.c)+r);if(!n)continue;if(fE){const v=g(shF,ltr(fE.c)+r);if(/^\d/.test(v))ent[normT(n)]=+v.replace(',','.')}if(fB)bi[normT(n)]=g(shF,ltr(fB.c)+r)}}
  let n=0;for(let r=rc+2;r<rc+80;r++){const nome=g(shR,ltr(hN.c)+r);if(!nome||!/[a-zà-ÿ]{3}/i.test(nome))continue;
    const al=cl.formandos.find(x=>normT(x.nome)===normT(nome));if(!al)continue;const f=ptFp(cl,al);const d=f.det=f.det||{};
    d.rel=crit.map(c=>{const v=g(shR,ltr(c.c)+r);return /^\d/.test(v)?+v.replace(',','.'):null});if(ent[normT(nome)]!=null)d.ent=ent[normT(nome)];if(bi[normT(nome)]&&!d.cc)d.cc=bi[normT(nome)];ptGravarNota(cl,al);n++}
  save();return n}

/* ===================== v1.006 · Anos de curso conforme a Portaria n.º 52/2016 =====================
   PROFIJ II · Tipo 2 = 2 anos · PROFIJ II · Tipo 3 = 1 ano · PROFIJ IV · Tipo 4 = 3 anos.
   CFA = (FSC+FC+2FT+FP)/5 às décimas; CFC: II-2 (CFA1+CFA2+CPAF)/3 · II-3 (2CFA+CPAF)/3 · IV-4 (CFA1+CFA2+CFA3+CPAF)/4, às unidades (art. 39.º).
   A PAF e a classificação final só existem no ano terminal; nos outros anos vê-se só o ano em curso (a não ser com «todos os anos» desbloqueado). */
const CP_TIPOS={'II-2':{anos:2,rot:'PROFIJ II – Tipo 2',niv:'nível II – tipo 2',f:'CFC = (CFA1+CFA2+CPAF)/3'},'II-3':{anos:1,rot:'PROFIJ II – Tipo 3',niv:'nível II – tipo 3',f:'CFC = (2CFA+CPAF)/3'},'IV-4':{anos:3,rot:'PROFIJ IV – Tipo 4',niv:'nível IV – tipo 4',f:'CFC = (CFA1+CFA2+CFA3+CPAF)/4'}};
function cpCurso(nome){const {y}=CP();const M=(y.mat||{})[nome]||{};const P=(y.pautas||{})[nome]||{};
  let tipo=M.tipoPfj&&CP_TIPOS[M.tipoPfj]?M.tipoPfj:P.tipo&&CP_TIPOS[P.tipo]?P.tipo:'';
  if(!tipo){const t=String(P.cursoCF||P.curso||M.curso||'')+' '+String(M.nivel||'');tipo=/\bIV\b|tipo\s*4/i.test(t)?'IV-4':/tipo\s*3/i.test(t)?'II-3':'II-2'}
  const T=CP_TIPOS[tipo];let ano=parseInt(M.anoCurso)||+P.anoC||1;ano=Math.max(1,Math.min(T.anos,ano));
  return {tipo,anos:T.anos,ano,terminal:ano===T.anos,rot:T.rot,nivelTxt:T.niv,formula:T.f,txt:T.rot.replace(' – ',' · ')+' · '+(T.anos===1?'1 ano':ano+'.º ano de '+T.anos)}}
const cpAnosArr=CI=>Array.from({length:CI.anos},(_,i)=>i+1);
function cpCFC(CI,cfa,cpaf){if(cpaf==null)return null;const v=cpAnosArr(CI).map(n=>cfa[n]&&cfa[n].cfa);if(v.some(x=>x==null))return null;
  if(CI.tipo==='II-3')return Math.round((2*v[0]+cpaf)/3);return Math.round((v.reduce((s,x)=>s+x,0)+cpaf)/(v.length+1))}
function cpCursoSet(nome,tipo,ano){const {y}=CP();y.pautas=y.pautas||{};const P=y.pautas[nome]=y.pautas[nome]||{};const T=CP_TIPOS[tipo]||CP_TIPOS['II-2'];ano=Math.max(1,Math.min(T.anos,+ano||1));
  const velho=cpCurso(nome);P.tipo=tipo;P.anoC=ano;const M=cpmM(nome);M.tipoPfj=tipo;M.anoCurso=ano+'.º';M.nivel=tipo.startsWith('IV')?'IV':'II';
  const tr=s=>String(s||'').replace(velho.rot,T.rot).replace(/–\s*\d\.º ano/,'– '+ano+'.º ano');if(P.curso)P.curso=tr(P.curso);if(P.cursoCF)P.cursoCF=String(P.cursoCF).replace(velho.rot,T.rot);save()}
/* chip do curso com tipo e ano editáveis + cadeado «só este ano / todos os anos» */
function cpCursoChip(nome){const CI=cpCurso(nome);const tod=!!UI.cpTodos;
  return `<span class="cpcur" data-cpcur="${esc(nome)}"><span class="tag ${CI.terminal?'ok':''}" title="${CI.terminal?'Ano terminal: PAF e classificação final de curso':'Ano não terminal: só a avaliação deste ano'}">${esc(CI.txt)}${CI.terminal?' · terminal':''}</span>
    <select data-cpcs="tipo" aria-label="Tipo de curso">${Object.entries(CP_TIPOS).map(([k,v])=>`<option value="${k}" ${k===CI.tipo?'selected':''}>${v.rot.replace(' – ',' · ')} (${v.anos} ano${v.anos>1?'s':''})</option>`).join('')}</select>
    <select data-cpcs="ano" aria-label="Ano do curso">${cpAnosArr(CI).map(n=>`<option value="${n}" ${n===CI.ano?'selected':''}>${n}.º ano</option>`).join('')}</select>
    ${CI.anos>1?`<button type="button" class="btn sm ${tod?'':'pri'}" data-cptod title="${tod?'A ver todos os anos do curso — toque para ver só este ano':'A ver só este ano — toque para desbloquear os outros anos'}">${ic(tod?'cadeadoAb':'cadeado',13)} ${tod?'Todos os anos':'Só este ano'}</button>`:''}</span>`}
document.addEventListener('change',e=>{const s=e.target.closest&&e.target.closest('[data-cpcs]');if(!s)return;const w=s.closest('[data-cpcur]');if(!w)return;const nome=w.dataset.cpcur;const CI=cpCurso(nome);
  if(s.dataset.cpcs==='tipo')cpCursoSet(nome,s.value,CI.ano);else cpCursoSet(nome,CI.tipo,s.value);try{manterPosicao(vCProfij)}catch(_){vCProfij()}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cptod]');if(!b)return;UI.cpTodos=!UI.cpTodos;try{manterPosicao(vCProfij)}catch(_){vCProfij()}});
/* FPCT dos anos anteriores: procurada nos anos letivos anteriores pelo mesmo formando (n.º de processo ou n.º + nome) */
function ptFpAnteriores(al,CI){const out={};try{const {c,a}=CP();const anos=(S.anos||[]).slice().sort((x,y)=>String(x.nome).localeCompare(String(y.nome)));const ia=anos.findIndex(x=>x===a||x.id===(a&&a.id));if(ia<0)return out;
  for(let n=CI.ano-1,j=ia-1;n>=1&&j>=0;n--,j--){const y=(c.anos||{})[anos[j].id];if(!y||!y.fpct)continue;const e=Object.entries(y.fpct).find(([k,v])=>k.endsWith('|'+al.k)&&v&&v.nota!=null&&v.nota!=='');if(e)out[n]=+e[1].nota}}catch(_){}return out}
/* grelha da classificação: só os anos do curso; no ano não terminal só este ano e sem CPAF/CFC (a não ser desbloqueado) */
function ptCfcHTML(cl,P,L,fN){const CI=cpCurso(cl.nome);const tod=!!UI.cpTodos;const A_=tod?cpAnosArr(CI):[CI.ano];const fim=CI.terminal||tod;
  const tit=fim?`CFA = (FSC + FC + 2 × FT + FP) ÷ 5, às décimas · ${CI.formula.replace('CFC = ','CFC = ')}, às unidades (Portaria n.º 52/2016, art. 39.º).`:`Classificação anual do ${CI.ano}.º ano: CFA = (FSC + FC + 2 × FT + FP) ÷ 5, às décimas. A PAF e a classificação final de curso só aparecem no ${CI.anos}.º ano (terminal).`;
  return `<p class="hint">${tit} ${A_.length>1?`O ${CI.ano}.º ano vem da app (componentes e FPCT); a FPCT dos anos anteriores vem dos anos letivos anteriores; o resto importa-se do Excel da escola ou escreve-se.`:''}</p>
    <div class="row" style="gap:8px;margin-bottom:8px"><label class="btn sm">${ic('upload',13)} Importar Excel (histórico ou média detalhada)<input type="file" id="pt-imp" accept=".xlsx,.xlsm" hidden></label></div>
    <div class="tblw"><table class="lst pttb ptcf"><thead><tr><th rowspan="2">N.º</th><th rowspan="2" style="text-align:left">Nome</th>${A_.map(n=>`<th colspan="5" class="${n===CI.ano?'atual':''}">${n}.º ano${n===CI.ano?' · este ano':''}</th>`).join('')}${fim?'<th rowspan="2">CPAF</th><th rowspan="2">CFC</th>':''}</tr>
      <tr>${A_.map(()=>['FSC','FC','FT','FP','CFA'].map(h=>`<th>${h}</th>`).join('')).join('')}</tr></thead><tbody>
    ${L.map(x=>`<tr data-k="${esc(x.al.k)}"><td>${esc(x.proc)}</td><td style="text-align:left"><span class="cpfo">${avatar(x.al.ref||{nome:x.nome},28)}<b>${esc(x.nome)}</b></span></td>${A_.map(n=>['fsc','fc','ft','fp'].map(k=>{const ov=x.h['a'+n]&&x.h['a'+n][k]!=null&&x.h['a'+n][k]!=='';return `<td><input class="ptin ${ov?'man':''}" data-ph="${n}|${k}" value="${esc(ptN(x.cfa[n][k]))}" inputmode="decimal" placeholder="—" aria-label="${n}.º ano ${k.toUpperCase()}"></td>`}).join('')+`<td class="calc"><b>${fN(x.cfa[n].cfa)}</b></td>`).join('')}
      ${fim?`<td><input class="ptin" data-pcp value="${esc(x.cpaf!=null?ptN(x.cpaf):'')}" inputmode="decimal" aria-label="CPAF"></td><td class="calc"><b class="${x.cfc!=null&&x.cfc<10?'neg':''}">${x.cfc==null?'—':x.cfc}</b></td>`:''}</tr>`).join('')}</tbody></table></div>`}

function cpAlgumTerminal(){if(UI.cpTodos)return true;try{return cpClasses(A()).some(c=>cpCurso(c.nome).terminal)}catch(_){return true}}
/* v1.008 · assinatura do coordenador (Definições › Professor › Assinatura) nos documentos da coordenação */
function ptAssDocx(o){const cy=Math.round(15*36000),cx=Math.min(Math.round(cy*o.w/o.h),Math.round(60*36000));
  return `<w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="901" name="Assinatura"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="901" name="assinatura.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rIdAss"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`}
const cpAssImg=()=>S.cfg.assinaturaImg?`<img src="${assinaturaSemFundo()}" alt="Assinatura" style="display:block;height:14mm;max-width:58mm;object-fit:contain;margin:0 auto 1mm;mix-blend-mode:multiply">`:'';
/* v1.010 · Planeamento Anual: casas quase quadradas, a crescer com a largura (fora e dentro do ecrã grande) */
{const tamCal=t=>{if(!t||!t.isConnected)return;const th=t.querySelector('thead th:nth-child(2)');if(!th)return;const w=th.getBoundingClientRect().width;if(!w)return;
    const amp=!!t.closest('#ampv');const maxH=amp?Math.max(22,(innerHeight-250)/13):56;t.style.setProperty('--cs',Math.round(Math.max(20,Math.min(w*.82,maxH)))+'px')};
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(E=>E.forEach(e=>tamCal(e.target))):null;
  new MutationObserver(()=>{document.querySelectorAll('table.cpm-cal:not([data-rs])').forEach(t=>{t.dataset.rs=1;if(ro)ro.observe(t);requestAnimationFrame(()=>tamCal(t))})}).observe(document.body,{childList:true,subtree:true})}
/* assinatura sem fundo: o branco à volta passa a transparente (para não tapar a linha nem o texto) */
let _assT={src:'',out:''};
function assinaturaSemFundo(){const src=S.cfg.assinaturaImg||'';if(!src)return '';if(_assT.src===src)return _assT.out||src;_assT={src,out:''};
  const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height),p=d.data;
    for(let i=0;i<p.length;i+=4){const m=Math.min(p[i],p[i+1],p[i+2]);if(m>235)p[i+3]=0;else if(m>200)p[i+3]=Math.round(p[i+3]*(235-m)/35)}g.putImageData(d,0,0);
    /* recortar as margens vazias */
    let x0=c.width,y0=c.height,x1=0,y1=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(p[(y*c.width+x)*4+3]>20){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
    if(x1>x0&&y1>y0){const c2=document.createElement('canvas');c2.width=x1-x0+1;c2.height=y1-y0+1;c2.getContext('2d').drawImage(c,x0,y0,c2.width,c2.height,0,0,c2.width,c2.height);_assT.out=c2.toDataURL('image/png')}else _assT.out=c.toDataURL('image/png')}catch(e){_assT.out=src}};im.src=src;return src}
setTimeout(()=>{try{assinaturaSemFundo()}catch(_){}},1500);

