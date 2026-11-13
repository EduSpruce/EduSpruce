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
    const M=cpmM(nome);if(M.disc.length&&!confirm(`Importar a matriz de «${r.curso||f.name}»?\n\n${r.disc.length} disciplinas e ${r.ufcd.length} UFCD${r.data?' · ponto de situação de '+fmtIsoL(r.data):''}.\nAs disciplinas com o mesmo nome são atualizadas (mantêm as siglas do horário).`))return;
    const igual=n=>M.disc.find(d=>normT(d.nome).replace(/\bi\b/g,'').replace(/\s+/g,' ')===normT(n).replace(/\bi\b/g,'').replace(/\s+/g,' '));const dadas={};
    r.disc.forEach(x=>{let d=igual(x.nome);if(!d){d={id:uid(),sig:[],aj:0,dadas:null,det:''};M.disc.push(d)}Object.assign(d,{nome:x.nome,comp:x.comp,horas:x.horas});if(x.prof)d.prof=x.prof;dadas[d.id]=x.dadas});
    r.ufcd.forEach(x=>{let d=M.disc.find(z=>z.comp==='tecnologica'&&(z.det===x.cod||normT(z.nome)===normT(x.nome)));if(!d){d={id:uid(),sig:[],aj:0,dadas:null};M.disc.push(d)}Object.assign(d,{nome:x.nome,comp:'tecnologica',horas:x.horas,det:x.cod});if(x.prof)d.prof=x.prof;dadas[d.id]=x.dadas});
    /* a linha genérica «UFCD» do horário passa a ser as UFCD detalhadas */
    if(r.ufcd.length){const gen=M.disc.filter(d=>d.comp==='tecnologica'&&!d.det&&/^ufcd/i.test(d.nome));const sg=[...new Set(gen.flatMap(d=>d.sig||[]))];M.disc=M.disc.filter(d=>!gen.includes(d));M.disc.filter(d=>d.comp==='tecnologica'&&!(d.sig||[]).length).forEach(d=>d.sig=sg.slice())}
    pfjLigarSiglas(A(),nome,M.disc);
    Object.assign(M,{curso:r.curso||M.curso,area:r.area||M.area,nivel:r.nivel||M.nivel,cod:r.cod||M.cod,ref:r.ref||M.ref,anoCurso:r.ano?r.ano+'.º':M.anoCurso,tipoPfj:r.nivel==='IV'?'IV-4':r.tipo==='3'?'II-3':'II-2'});if(r.fct)M.fct.horas=r.fct;
    if(r.data&&Object.keys(dadas).length){M.pontos=M.pontos||[];M.pontos=M.pontos.filter(p=>p.data!==r.data);M.pontos.push({id:uid(),data:r.data,dadas,obs:'Importado de '+f.name})}
    if(r.ref&&r.ufcd.length){const {c}=CP();c.refs=c.refs||{};const R=c.refs[r.ref]=c.refs[r.ref]||{curso:r.curso,area:r.area,tipo:M.tipoPfj,anos:{}};R.anos[r.ano||'1']=r.ufcd.map(u=>[u.cod,u.nome,u.horas])}
    const ord={sociocultural:0,cientifica:1,tecnologica:2};M.disc.sort((x,y)=>(ord[x.comp]-ord[y.comp])||(x.comp==='tecnologica'?0:0));
    save();vCProfij();toast(`Matriz importada: ${r.disc.length} disciplinas, ${r.ufcd.length} UFCD${r.data?', ponto de situação de '+fmtIsoL(r.data):''}.`)}
  catch(e){console.warn(e);toast('Não foi possível ler o PDF: '+e.message,'erro')}};inp.click()}
/* siglas do horário da turma pelas legendas (usado na criação do curso e na importação da matriz) */
function pfjLigarSiglas(a,nome,lista){const h=horarioDe(a,nome);if(!h)return;const leg=h.legenda||[];const sigs=[...new Set(h.aulas.map(x=>x.ab))];const nn=n=>normT(n).replace(/\bi\b/g,'').replace(/\s+/g,' ');
  sigs.forEach(sg=>{const l=leg.find(x=>normSig(x.ab)===normSig(sg))||{};const nm=l.nome&&normSig(l.nome)!==normSig(sg)?l.nome:cpmNomeSig(sg);
    if(/^ufcd|unidades de forma|tecnolog/i.test(normT(nm))||/^ufcd/i.test(sg)){lista.filter(d=>d.comp==='tecnologica'&&!(d.sig||[]).length).forEach(d=>d.sig=[sg]);return}
    const d=lista.find(z=>z.comp!=='tecnologica'&&nn(z.nome)===nn(nm));if(d&&!(d.sig||[]).some(x=>normSig(x)===normSig(sg)))d.sig=[...(d.sig||[]),sg]})}

/* ===================== v0.999 · Coord. PROFIJ › Classificações e Pautas =====================
   Histórico de classificações do SGE (Excel, uma folha por formando) → médias por componente e por ano,
   CFA = (FSC + FC + 2·FT + FP) / 5 (às décimas), CFC = (CFA1 + … + CPAF) / n (às unidades),
   grelha de avaliação da FPCT (relatório + entidade acolhedora) e pautas (FPCT e CFC, detalhada e final) em Word ou PDF. */
const PZ_COMP=[['FSC','Sociocultural'],['FC','Científica'],['FT','Tecnológica'],['FP','Prática (FPCT)']];
const PZ_SOC=/^(l[ií]ngua portuguesa|l[ií]ngua estrangeira|ingl[eê]s|tecnologias da informa|tic\b|mundo atual|cidadania|desenvolvimento pessoal|educa[cç][aã]o f[ií]sica|higiene)/i;
const pzR=(v,d)=>{if(v==null||isNaN(v))return null;const m=Math.pow(10,d);return Math.sign(v)*Math.round(Math.abs(v)*m+1e-9)/m};
const pzF=(v,d)=>v==null?'':(d==null?String(v):v.toFixed(d)).replace('.',',');
const pzCompDe=n=>/franc[eê]s|alem[aã]o|espanhol/i.test(n)?'FC':/^\d{3,5}\s*[-–]/.test(n)||/^ufcd/i.test(n)?'FT':/fpct|forma[cç][aã]o pr[aá]tica|est[aá]gio/i.test(n)?'FP':PZ_SOC.test(normT(n).replace(/\s+/g,' '))||PZ_SOC.test(n)?'FSC':'FC';
function PZS(){const {c}=CP();c.pautas=c.pautas||{};return c.pautas}
function pzNovo(nome){const P=PZS();const id=uid();P[id]={id,nome:nome||'Curso',curso:'',tipo:'IV-4',anos:3,anoAtual:3,anoLetivo:(A()&&A().nome)||'',local:S.cfg.localidade||'',data:isoHoje(),pesos:{FSC:1,FC:1,FT:2,FP:1},
  form:[],disc:[],notas:{},fpct:{crit:[['Caraterização da Entidade Enquadradora',60],['Descrição das Atividades Desenvolvidas',60],['Análise Crítica',60],['Capacidade de Autoavaliação',20]],pRel:0.2,pEnt:0.8,v:{}},cpaf:{}};return P[id]}
/* ---------- importar o «Histórico de classificações do aluno» (SGE) ---------- */
async function pzImportar(pid){const inp=document.createElement('input');inp.type='file';inp.accept='.xlsx';inp.multiple=true;inp.onchange=async()=>{const fs=[...inp.files];if(!fs.length)return;
  try{let n=0,nd=0;const P=PZS();let p=pid&&P[pid];
    for(const f of fs){const F=await ptXlsxFolhas(f);for(const sh of F){const r=pzLerFolha(sh);if(!r)continue;if(!p){const gs=f.name.replace(/\.xlsx$/i,'').replace(/^[0-9a-f]{8}-/i,'').replace(/_/g,' ').replace(/\s+/g,' ').trim();const nn=(prompt('Nome deste curso/turma na app:',gs)||gs).trim();p=pzNovo(nn);UI.pzId=p.id}
      let fo=p.form.find(x=>normT(x.nome)===normT(r.nome));if(!fo){const al=pzProcurarAluno(r.nome);fo={id:uid(),nome:r.nome,num:al&&(al.processo||al.num)||'',bi:''};p.form.push(fo);n++}
      if(r.anos.length){const mx=Math.max(...r.anos);if(mx!==p.anos&&!p._tipoMan){p.anos=mx;p.tipo=mx>=3?'IV-4':mx===2?'II-2':'II-3';p.pesos=Object.assign({},p.pesos)}p.anoAtual=mx}
      r.linhas.forEach(l=>{let d=p.disc.find(x=>normT(x.nome)===normT(l.nome));if(!d){d={id:uid(),nome:l.nome,comp:pzCompDe(l.nome)};p.disc.push(d);nd++}
        Object.entries(l.v).forEach(([ano,v])=>{const k=fo.id+'|'+ano+'|'+d.id;p.notas[k]=v})})}}
    if(!p)return toast('Não encontrei nenhum «Histórico de classificações do aluno» nesse ficheiro.','aviso');
    pzOrdenar(p);save();vCProfij();toast(`Importado: ${p.form.length} formando(s), ${p.disc.length} disciplinas/UFCD${n?' · '+n+' novo(s)':''}.`)}
  catch(e){console.warn(e);toast('Não foi possível ler o ficheiro: '+e.message,'erro')}};inp.click()}
function pzProcurarAluno(nome){const a=A();if(!a)return null;for(const t of a.turmas){const x=(t.alunos||[]).find(z=>normT(z.nome)===normT(nome));if(x)return x}return null}
function pzLerFolha(sh){const C=sh.C;const g=r=>C.get(r)||'';let nome='';for(const [k,v] of C){if(/hist[oó]rico de classifica/i.test(v)){const m=v.match(/aluno\s*\(?a?\)?\s+(.+)$/i);if(m)nome=m[1].trim()}}if(!nome)return null;
  const col=s=>s.split('').reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0),ltr=n=>{let s='';while(n){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
  let rDisc=0,cDisc=0;for(const [k,v] of C)if(/^disciplinas$/i.test(v.trim())){const m=k.match(/^([A-Z]+)(\d+)$/);rDisc=+m[2];cDisc=col(m[1])}if(!rDisc)return null;
  /* blocos de ano: «… 1.º Ano» na linha das disciplinas; períodos e «Aval» na linha seguinte */
  const anos=[];for(const [k,v] of C){const m=k.match(/^([A-Z]+)(\d+)$/);if(+m[2]!==rDisc)continue;const a=v.match(/(\d)\.?\s*º\s*Ano/i);if(a)anos.push({ano:+a[1],c:col(m[1]),al:(v.match(/(\d{4}\/\d{4})/)||[])[1]||''})}
  anos.sort((x,y)=>x.c-y.c);anos.forEach((b,i)=>{b.f=i<anos.length-1?anos[i+1].c-1:b.c+12;b.cols=[];for(let c=b.c;c<=b.f;c++){const h=g(ltr(c)+(rDisc+1)).trim();if(h)b.cols.push({c,h})}});
  const linhas=[];for(let r=rDisc+2;r<rDisc+200;r++){let n=g(ltr(cDisc)+r).trim();if(!n)continue;if(/^total$/i.test(n))break;n=n.replace(/^unidades? de forma[cç][aã]o de curta dura[cç][aã]o\s*[-–]\s*/i,'');
    const v={};anos.forEach(b=>{const av=b.cols.find(x=>/aval|cif|cfd/i.test(x.h));const per=b.cols.filter(x=>/p\./i.test(x.h)).map(x=>g(ltr(x.c)+r).trim());let val=av?g(ltr(av.c)+r).trim():'';
      /* «Aval» com fórmula sobre períodos vazios dá 0: só conta se houver classificação nalgum período (as UFCD só têm «Aval») */
      if(per.length&&!per.some(x=>x!==''))val=per.length&&/^0([.,]0+)?$/.test(val)?'':val;
      if(!/\d/.test(val)){const num=per.filter(x=>/^\d+([.,]\d+)?$/.test(x));const fl=per.filter(x=>/^[a-z]\)$/i.test(x));val=num.length?num[num.length-1]:fl.length?fl[fl.length-1]:''}
      if(val!=='')v[b.ano]=/^\d/.test(val)?+String(val).replace(',','.'):val});
    if(Object.keys(v).length)linhas.push({nome:n,v})}
  return {nome,anos:anos.map(b=>b.ano),linhas}}
function pzOrdenar(p){const o={FSC:0,FC:1,FT:2,FP:3};p.disc.sort((x,y)=>(o[x.comp]-o[y.comp])||(x.comp==='FT'?x.nome.localeCompare(y.nome,'pt',{numeric:true}):0))}
/* ---------- cálculo ---------- */
const pzNum=v=>typeof v==='number'&&!isNaN(v)?v:(typeof v==='string'&&/^\d+([.,]\d+)?$/.test(v)?+v.replace(',','.'):null);
function pzFpct(p,fo){const x=p.fpct.v[fo.id]||{};const tot=p.fpct.crit.reduce((s,c)=>s+(+c[1]||0),0)||200;const sc=p.fpct.crit.map((c,i)=>pzNum(x['c'+i]));const rel=sc.every(v=>v!=null)?sc.reduce((s,v)=>s+v,0)/(tot/20):(pzNum(x.rel));const ent=pzNum(x.ent);
  const nota=rel!=null&&ent!=null?rel*(+p.fpct.pRel)+ent*(+p.fpct.pEnt):null;return {sc,rel:rel!=null?pzR(rel,2):null,ent,nota:nota!=null?pzR(nota,2):null,fin:nota!=null?pzR(nota,0):null}}
function pzAno(p,fo,ano){const r={};PZ_COMP.forEach(([k])=>{const L=p.disc.filter(d=>d.comp===k).map(d=>pzNum(p.notas[fo.id+'|'+ano+'|'+d.id])).filter(v=>v!=null);
    if(k==='FP'){const m=pzNum(p.notas[fo.id+'|'+ano+'|FP']);const f=+ano===+p.anoAtual?pzFpct(p,fo).fin:null;const v=m!=null?m:f!=null?f:L.length?L.reduce((s,v)=>s+v,0)/L.length:null;r[k]=v!=null?pzR(v,1):null;return}
    r[k]=L.length?pzR(L.reduce((s,v)=>s+v,0)/L.length,1):null});
  const W=p.pesos;const ks=PZ_COMP.map(c=>c[0]).filter(k=>+W[k]>0);const ok=ks.every(k=>r[k]!=null);const sw=ks.reduce((s,k)=>s+(+W[k]),0);
  r.CFA=ok&&sw?pzR(ks.reduce((s,k)=>s+r[k]*(+W[k]),0)/sw,1):null;return r}
function pzCFC(p,fo){const L=[];for(let a=1;a<=p.anos;a++)L.push(pzAno(p,fo,a).CFA);const cp=pzNum(p.cpaf[fo.id]);const ok=L.every(v=>v!=null)&&cp!=null;return {cfa:L,cpaf:cp,cfc:ok?pzR((L.reduce((s,v)=>s+v,0)+cp)/(L.length+1),0):null,bruto:ok?(L.reduce((s,v)=>s+v,0)+cp)/(L.length+1):null}}
/* ---------- vista ---------- */
function pzHTML(a){const P=PZS();const L=Object.values(P).sort((x,y)=>x.nome.localeCompare(y.nome,'pt',{numeric:true}));const p=P[UI.pzId]||L[0];if(p)UI.pzId=p.id;
  const sel=`<div class="row cpm-sel noprint" style="gap:8px;flex-wrap:wrap">${L.map(x=>`<button type="button" class="chip ${p&&x.id===p.id?'on':''}" data-pzid="${x.id}">${esc(x.nome)}</button>`).join('')}<button type="button" class="chip" id="pz-novo">${ic('plus',13)} Novo</button><button type="button" class="chip" id="pz-imp">${ic('upload',13)} Importar Histórico do SGE (Excel)</button></div>`;
  if(!p)return sel+`<section class="card empty">${ic('award',28)}<br><b>Classificações e Pautas</b><br><span class="mut">Importe o «Histórico de classificações do aluno» exportado do SGE (Excel, uma folha por formando). A app calcula as médias por componente, a CFA de cada ano, a FPCT e a CFC, e faz as pautas.</span><br><br><button class="btn pri" id="pz-imp2">${ic('upload',14)} Importar Histórico (Excel)</button></section>`;
  const W=p.pesos;const ft=PZ_COMP.filter(([k])=>+W[k]>0).map(([k])=>(+W[k]===1?'':W[k])+k).join('+');
  const cab=`<section class="card"><div class="pz-cab">
      <div class="pz-w2"><label>Curso (como na pauta)</label><input data-pzc="curso" value="${esc(p.curso)}" placeholder="ex.: Animador/a Sociocultural"></div>
      <div><label>Nome na app</label><input data-pzc="nome" value="${esc(p.nome)}"></div>
      <div><label>Tipo</label><select data-pzc="tipo">${[['II-2','PROFIJ II – Tipo 2',2],['II-3','PROFIJ II – Tipo 3',1],['IV-4','PROFIJ IV – Tipo 4',3]].map(([k,l])=>`<option value="${k}" ${p.tipo===k?'selected':''}>${l}</option>`).join('')}</select></div>
      <div><label>Anos</label><input type="number" min="1" max="3" data-pzc="anos" value="${p.anos}" ></div>
      <div><label>Ano atual</label><input type="number" min="1" max="3" data-pzc="anoAtual" value="${p.anoAtual}" ></div>
      <div><label>Ano letivo</label><input data-pzc="anoLetivo" value="${esc(p.anoLetivo)}" ></div>
      <div><label>Localidade</label><input data-pzc="local" value="${esc(p.local)}" ></div>
      <div><label>Data das pautas</label><input type="date" data-pzc="data" value="${esc(p.data)}"></div></div>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center"><b>CFA = (${ft})/${PZ_COMP.reduce((s,[k])=>s+(+W[k]||0),0)}</b>${PZ_COMP.map(([k,l])=>`<label class="prl"><span title="${l}">${k}</span><input type="number" min="0" max="5" step="0.5" data-pzw="${k}" value="${W[k]}"></label>`).join('')}<span class="mut">às décimas · CFC = (CFA1${p.anos>1?'+…+CFA'+p.anos:''}+CPAF)/${p.anos+1}, às unidades</span>
      <span class="sp1"></span><button class="btn sm" id="pz-imp3">${ic('upload',14)} Importar Histórico</button><button class="btn sm dng" id="pz-del">${ic('trash',14)}</button></div></section>`;
  const fo=`<section class="card"><div class="row"><h2 style="margin:0">${ic('users',18)} Formandos</h2><span class="sp1"></span><button class="btn sm noprint" id="pz-fadd">${ic('plus',13)} Formando</button></div>
    <div class="tblw"><table class="lst pz-t"><thead><tr><th>N.º</th><th>BI/CC</th><th>Nome</th><th></th></tr></thead><tbody>${p.form.map(f=>`<tr><td><input data-pzf="${f.id}|num" value="${esc(f.num||'')}" style="width:80px"></td><td><input data-pzf="${f.id}|bi" value="${esc(f.bi||'')}" placeholder="…000" style="width:80px"></td><td><input data-pzf="${f.id}|nome" value="${esc(f.nome)}" style="min-width:260px"></td><td><button class="btn sm ghost" data-pzfx="${f.id}" title="Retirar">${ic('trash',13)}</button></td></tr>`).join('')}</tbody></table></div>
    <p class="hint">Na pauta, o BI/CC aparece só com os últimos dígitos (ex.: …123).</p></section>`;
  const ano=Math.min(p.anos,Math.max(1,+UI.pzAno||p.anoAtual));UI.pzAno=ano;
  const anoT=`<div class="cpd-seg noprint" role="group">${Array.from({length:p.anos},(_,i)=>`<button type="button" data-pzano="${i+1}" class="${ano===i+1?'on':''}">${i+1}.º ano</button>`).join('')}</div>`;
  const D=p.disc;const usados=D.filter(d=>p.form.some(f=>p.notas[f.id+'|'+ano+'|'+d.id]!=null));const R=p.form.map(f=>pzAno(p,f,ano));
  const cel=(f,d)=>{const v=p.notas[f.id+'|'+ano+'|'+d.id];return `<td class="n"><input class="pz-n" data-pzn="${f.id}|${ano}|${d.id}" value="${v==null?'':esc(String(v).replace('.',','))}" inputmode="decimal"></td>`};
  const notas=`<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('grid',18)} Classificações</h2>${anoT}<span class="sp1"></span><label class="chk" style="margin:0"><input type="checkbox" id="pz-tod" ${UI.pzTod?'checked':''}> <span>Mostrar todas as disciplinas e UFCD</span></label><button class="btn sm noprint" id="pz-dadd">${ic('plus',13)} Disciplina / UFCD</button></div>
    <div class="cpm-tw"><table class="lst pz-g"><thead><tr><th>Disciplina / UFCD</th><th>Comp.</th>${p.form.map(f=>`<th class="n" title="${esc(f.nome)}">${esc(f.nome.split(' ')[0])}</th>`).join('')}</tr></thead><tbody>
    ${(UI.pzTod?D:usados).map(d=>`<tr><td>${esc(d.nome)}</td><td><select data-pzdc="${d.id}">${PZ_COMP.map(([k])=>`<option ${d.comp===k?'selected':''}>${k}</option>`).join('')}</select></td>${p.form.map(f=>cel(f,d)).join('')}</tr>`).join('')||`<tr><td colspan="${p.form.length+2}" class="mut">Sem classificações neste ano. Importe o histórico ou ligue «Mostrar todas».</td></tr>`}
    <tr class="pz-fp"><td><b>FPCT</b> <small class="mut">${ano===+p.anoAtual?'(vazio = nota da grelha abaixo)':''}</small></td><td>FP</td>${p.form.map(f=>{const v=p.notas[f.id+'|'+ano+'|FP'];return `<td class="n"><input class="pz-n" data-pzn="${f.id}|${ano}|FP" value="${v==null?'':esc(String(v).replace('.',','))}" placeholder="${ano===+p.anoAtual&&pzFpct(p,f).fin!=null?pzFpct(p,f).fin:''}"></td>`}).join('')}</tr>
    ${PZ_COMP.map(([k,l])=>`<tr class="pz-m"><td>Média ${l}</td><td>${k}</td>${R.map(r=>`<td class="n ${r[k]!=null&&r[k]<9.5?'neg':''}">${pzF(r[k],1)||'—'}</td>`).join('')}</tr>`).join('')}
    <tr class="pz-cfa"><td><b>CFA${ano}</b></td><td></td>${R.map(r=>`<td class="n"><b class="${r.CFA!=null&&r.CFA<9.5?'neg':''}">${pzF(r.CFA,1)||'—'}</b></td>`).join('')}</tr></tbody></table></div>
    <p class="hint">Cada componente é a média das classificações das suas disciplinas e UFCD desse ano (às décimas). Escreva «u)» ou «i)» para excluído / sem avaliação.</p></section>`;
  /* FPCT */
  const FC=p.fpct;const fp=`<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('building',18)} Grelha de Avaliação da FPCT — ${p.anoAtual}.º ano</h2><span class="sp1"></span>
      <label class="prl"><span>Relatório</span><input type="number" step="0.05" min="0" max="1" data-pzp="pRel" value="${FC.pRel}"></label><label class="prl"><span>Entidade</span><input type="number" step="0.05" min="0" max="1" data-pzp="pEnt" value="${FC.pEnt}"></label><button class="btn sm noprint" id="pz-crit">${ic('pencil',13)} Critérios do Relatório</button></div>
    <div class="cpm-tw"><table class="lst pz-g"><thead><tr><th>Formando</th>${FC.crit.map(c=>`<th class="n" title="${esc(c[0])}">${esc(c[0].split(' ').slice(0,2).join(' '))}<br><small>${c[1]}</small></th>`).join('')}<th class="n">Relatório</th><th class="n">Aval. Entidade</th><th class="n">Nota</th><th class="n">Nota Final</th></tr></thead><tbody>
    ${p.form.map(f=>{const x=FC.v[f.id]||{};const r=pzFpct(p,f);return `<tr><td>${esc(f.nome)}</td>${FC.crit.map((c,i)=>`<td class="n"><input class="pz-n" data-pzq="${f.id}|c${i}" value="${x['c'+i]==null?'':esc(String(x['c'+i]))}"></td>`).join('')}<td class="n">${pzF(r.rel,2)||'—'}</td><td class="n"><input class="pz-n" data-pzq="${f.id}|ent" value="${x.ent==null?'':esc(String(x.ent).replace('.',','))}"></td><td class="n">${pzF(r.nota,2)||'—'}</td><td class="n"><b>${r.fin==null?'—':r.fin}</b></td></tr>`}).join('')}</tbody></table></div>
    <p class="hint">Relatório = soma dos critérios ÷ ${(FC.crit.reduce((s,c)=>s+(+c[1]||0),0)/20)||10} (0–20). Nota = Relatório × ${FC.pRel} + Entidade × ${FC.pEnt}; a nota final (arredondada) entra na FP do ${p.anoAtual}.º ano.</p>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-pzx="fdet">${ic('file',14)} Pauta FPCT Detalhada</button><button class="btn sm" data-pzx="ffin">${ic('file',14)} Pauta FPCT Final</button><button class="btn sm" data-pzx="grelha">${ic('printer',14)} Grelha da FPCT</button></div></section>`;
  /* CFC */
  const cf=`<section class="card"><h2 style="margin:0 0 8px">${ic('award',18)} Classificação Final de Curso</h2><div class="cpm-tw"><table class="lst pz-g"><thead><tr><th>N.º</th><th>Formando</th>${Array.from({length:p.anos},(_,i)=>`<th class="n">CFA${i+1}</th>`).join('')}<th class="n">CPAF</th><th class="n">CFC</th></tr></thead><tbody>
    ${p.form.map(f=>{const r=pzCFC(p,f);return `<tr><td>${esc(f.num||'')}</td><td>${esc(f.nome)}</td>${r.cfa.map(v=>`<td class="n ${v!=null&&v<9.5?'neg':''}">${pzF(v,1)||'—'}</td>`).join('')}<td class="n"><input class="pz-n" data-pzcp="${f.id}" value="${p.cpaf[f.id]==null?'':esc(String(p.cpaf[f.id]).replace('.',','))}"></td><td class="n"><b class="${r.cfc!=null&&r.cfc<10?'neg':''}">${r.cfc==null?'—':r.cfc}</b></td></tr>`}).join('')}</tbody></table></div>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap;margin-top:8px"><button class="btn sm" data-pzx="cdet">${ic('file',14)} Pauta CFC Detalhada</button><button class="btn sm" data-pzx="cfin">${ic('file',14)} Pauta CFC Final</button><button class="btn sm" data-pzx="med">${ic('download',14)} Médias Detalhadas (CSV)</button>
      <label class="chk" style="margin:0 0 0 8px"><input type="checkbox" id="pz-word" ${UI.pzWord!==false?'checked':''}> <span>Em Word (desligado: imprimir / PDF)</span></label></div></section>`;
  return sel+cab+fo+notas+fp+cf}
function pzBind(v,a){const P=PZS();const p=P[UI.pzId];const re=()=>manterPosicao(vCProfij);
  v.querySelectorAll('[data-pzid]').forEach(b=>b.onclick=()=>{UI.pzId=b.dataset.pzid;vCProfij()});
  [v.querySelector('#pz-imp'),v.querySelector('#pz-imp2'),v.querySelector('#pz-imp3')].forEach(b=>b&&(b.onclick=()=>pzImportar(b.id==='pz-imp3'?UI.pzId:null)));
  const nv=v.querySelector('#pz-novo');if(nv)nv.onclick=()=>{const n=(prompt('Nome do curso/turma (ex.: ASC 3):')||'').trim();if(!n)return;const x=pzNovo(n);UI.pzId=x.id;save();vCProfij()};
  if(!p)return;
  v.querySelectorAll('[data-pzc]').forEach(i=>i.onchange=()=>{const k=i.dataset.pzc;let x=i.value;if(k==='anos'||k==='anoAtual')x=Math.min(3,Math.max(1,+x||1));p[k]=x;if(k==='tipo'){p._tipoMan=true;const A_={'II-2':2,'II-3':1,'IV-4':3}[x];p.anos=A_;p.anoAtual=Math.min(p.anoAtual,A_)}save();re()});
  v.querySelectorAll('[data-pzw]').forEach(i=>i.onchange=()=>{p.pesos[i.dataset.pzw]=Math.max(0,+i.value.replace(',','.')||0);save();re()});
  v.querySelectorAll('[data-pzp]').forEach(i=>i.onchange=()=>{p.fpct[i.dataset.pzp]=Math.max(0,+i.value.replace(',','.')||0);save();re()});
  const dl=v.querySelector('#pz-del');if(dl)dl.onclick=()=>{if(!confirm('Apagar «'+p.nome+'» e todas as classificações importadas?'))return;delete P[p.id];UI.pzId='';save();vCProfij()};
  v.querySelectorAll('[data-pzf]').forEach(i=>i.onchange=()=>{const [id,k]=i.dataset.pzf.split('|');const f=p.form.find(x=>x.id===id);if(f){f[k]=i.value.trim();save()}});
  v.querySelectorAll('[data-pzfx]').forEach(b=>b.onclick=()=>{if(!confirm('Retirar este formando?'))return;p.form=p.form.filter(x=>x.id!==b.dataset.pzfx);save();re()});
  const fa=v.querySelector('#pz-fadd');if(fa)fa.onclick=()=>{const n=(prompt('Nome do formando:')||'').trim();if(!n)return;const al=pzProcurarAluno(n);p.form.push({id:uid(),nome:n,num:al&&(al.processo||al.num)||'',bi:''});save();re()};
  const da=v.querySelector('#pz-dadd');if(da)da.onclick=()=>{const n=(prompt('Disciplina ou UFCD (ex.: 1234 - Nome da UFCD):')||'').trim();if(!n)return;p.disc.push({id:uid(),nome:n,comp:pzCompDe(n)});pzOrdenar(p);UI.pzTod=true;save();re()};
  const td=v.querySelector('#pz-tod');if(td)td.onchange=()=>{UI.pzTod=td.checked;re()};
  v.querySelectorAll('[data-pzano]').forEach(b=>b.onclick=()=>{UI.pzAno=+b.dataset.pzano;re()});
  v.querySelectorAll('[data-pzdc]').forEach(s=>s.onchange=()=>{const d=p.disc.find(x=>x.id===s.dataset.pzdc);if(d){d.comp=s.value;save();re()}});
  const val=x=>{x=String(x).trim();if(x==='')return null;if(/^\d+([.,]\d+)?$/.test(x))return +x.replace(',','.');return x};
  v.querySelectorAll('[data-pzn]').forEach(i=>i.onchange=()=>{const k=i.dataset.pzn;const x=val(i.value);if(x==null)delete p.notas[k];else p.notas[k]=x;save();re()});
  v.querySelectorAll('[data-pzq]').forEach(i=>i.onchange=()=>{const [id,k]=i.dataset.pzq.split('|');const o=p.fpct.v[id]=p.fpct.v[id]||{};const x=val(i.value);if(x==null)delete o[k];else o[k]=x;save();re()});
  v.querySelectorAll('[data-pzcp]').forEach(i=>i.onchange=()=>{const x=val(i.value);if(x==null)delete p.cpaf[i.dataset.pzcp];else p.cpaf[i.dataset.pzcp]=x;save();re()});
  const cr=v.querySelector('#pz-crit');if(cr)cr.onclick=()=>{const t=prompt('Critérios do relatório, um por linha: nome ; máximo\n(ex.: Análise Crítica ; 60)',p.fpct.crit.map(c=>c[0]+' ; '+c[1]).join(' | '));if(t==null)return;const L=t.split(/\||\n/).map(x=>x.split(';').map(y=>y.trim())).filter(x=>x[0]).map(x=>[x[0],+x[1]||20]);if(L.length){p.fpct.crit=L;save();re()}};
  const wd=v.querySelector('#pz-word');if(wd)wd.onchange=()=>{UI.pzWord=wd.checked};
  v.querySelectorAll('[data-pzx]').forEach(b=>b.onclick=()=>pzExportar(p,b.dataset.pzx))}
/* ---------- pautas (Word ou imprimir) ---------- */
const pzBI=b=>{b=String(b||'').trim();return !b?'':/^…/.test(b)?b:'…'+b.slice(-3)};
function pzDataExt(iso){if(!iso)return '';const d=dataDeIso(iso);return d.getDate()+' de '+MESES[d.getMonth()+1].toLowerCase()+' de '+d.getFullYear()}
function pzCab(p,tit,ano){const tp={'II-2':'PROFIJ II – Tipo 2','II-3':'PROFIJ II – Tipo 3','IV-4':'PROFIJ IV – Tipo 4'}[p.tipo]||'PROFIJ';
  return `<p class="c s">Secretaria Regional da Educação, Cultura e Desporto</p><p class="c t">${esc(tit)} ${esc(p.anoLetivo||'')}</p><p class="c t">PAUTA DE AVALIAÇÃO</p>
    <p class="c">Curso ${esc(p.curso||p.nome)}${ano?' – '+ano+'.º ano':''} – ${tp}</p><p class="c">Programa Formativo de Inserção de Jovens (PROFIJ)</p><p class="c s">(Portaria n.º 52/2016 de 16 de junho, alterada pela Portaria n.º 86/2018 de 12 de julho)</p>`}
const pzAss=p=>`<p class="d">${esc(p.local||'')}${p.local?', ':''}${pzDataExt(p.data)}</p><p class="a">O Coordenador do Programa PROFIJ</p><p class="a">_______________________________</p>`;
const PZ_CSS=`body{font:11pt/1.35 Calibri,Arial,sans-serif;color:#000}p{margin:0 0 4pt}.c{text-align:center}.t{font-weight:bold;font-size:12pt}.s{font-size:9.5pt}table{border-collapse:collapse;width:100%;margin:12pt 0}th,td{border:1px solid #000;padding:3pt 5pt;font-size:10pt}th{background:#e7e6e6}td.n,th.n{text-align:center}.d{margin-top:22pt}.a{text-align:center;margin-top:10pt}.lf{display:flex;gap:8pt}.lf span.p{flex:1;border-bottom:1px dotted #000;margin:0 4pt 4pt}.nt{font-size:9.5pt;margin-top:8pt}`;
function pzSaida(p,nome,corpo){const html=`<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><title>${esc(nome)}</title><style>${PZ_CSS}</style></head><body>${corpo}</body></html>`;
  if(UI.pzWord!==false){download(nome.replace(/[\\/:*?"<>|]+/g,'-')+'.doc','﻿'+html,'application/msword');toast('Pauta descarregada (abre no Word).')}else cpdDoc(nome,`<style>${PZ_CSS}</style>`+corpo)}
function pzExportar(p,k){const F=p.form.slice().sort((x,y)=>x.nome.localeCompare(y.nome,'pt'));const al=p.anoLetivo?p.anoLetivo.replace('/','.').replace(/^20(\d\d)\.20(\d\d)$/,'$1.$2'):'';
  const fin=(tit,vals,ano)=>pzCab(p,tit,ano)+`<table><thead><tr><th>N.º</th><th>BI/CC</th><th>NOME</th><th class="n">NOTA</th></tr></thead><tbody>${F.map(f=>`<tr><td>${esc(f.num||'')}</td><td>${esc(pzBI(f.bi))}</td><td>${esc(f.nome.toUpperCase())}</td><td class="n"><b>${vals(f)??''}</b></td></tr>`).join('')}</tbody></table>`+pzAss(p);
  if(k==='fdet'){pzSaida(p,al+' PAUTA DETALHADA FPCT '+p.nome,pzCab(p,'FORMAÇÃO PRÁTICA EM CONTEXTO DE TRABALHO',p.anoAtual)+`<table><thead><tr><th>N.º</th><th>BI/CC</th><th>NOME</th><th class="n">RELATÓRIO</th><th class="n">AVAL. ENT.</th><th class="n">NOTA</th><th class="n">NOTA FINAL</th></tr></thead><tbody>${F.map(f=>{const r=pzFpct(p,f);return `<tr><td>${esc(f.num||'')}</td><td>${esc(pzBI(f.bi))}</td><td>${esc(f.nome.toUpperCase())}</td><td class="n">${pzF(r.rel)}</td><td class="n">${pzF(r.ent)}</td><td class="n">${pzF(r.nota,2)}</td><td class="n"><b>${r.fin??''}</b></td></tr>`}).join('')}</tbody></table>`+pzAss(p));return}
  if(k==='ffin'){pzSaida(p,al+' PAUTA FINAL FPCT '+p.nome,fin('FORMAÇÃO PRÁTICA EM CONTEXTO DE TRABALHO',f=>pzFpct(p,f).fin,p.anoAtual));return}
  if(k==='cdet'){const W=p.pesos;const ft=PZ_COMP.filter(([x])=>+W[x]>0).map(([x])=>(+W[x]===1?'':W[x])+x).join('+');const sw=PZ_COMP.reduce((s,[x])=>s+(+W[x]||0),0);const nv=p.tipo==='IV-4'?'nível IV – tipo 4':p.tipo==='II-3'?'nível II – tipo 3':'nível II – tipo 2';
    pzSaida(p,al+' PAUTA DETALHADA CF '+p.nome,pzCab(p,'CLASSIFICAÇÃO FINAL DE CURSO')+`<table><thead><tr><th>N.º</th><th>BI/CC</th><th>NOME</th>${Array.from({length:p.anos},(_,i)=>`<th class="n">CFA${i+1}</th>`).join('')}<th class="n">CPAF</th><th class="n">NOTA FINAL</th></tr></thead><tbody>${F.map(f=>{const r=pzCFC(p,f);return `<tr><td>${esc(f.num||'')}</td><td>${esc(pzBI(f.bi))}</td><td>${esc(f.nome.toUpperCase())}</td>${r.cfa.map(v=>`<td class="n">${pzF(v,1)}</td>`).join('')}<td class="n">${pzF(r.cpaf)}</td><td class="n"><b>${r.cfc??''}</b></td></tr>`}).join('')}</tbody></table>
      <p class="nt">${Array.from({length:p.anos},(_,i)=>`CFA${i+1} – Classificação Final Anual ${i+1}.º ano`).join(' – ')} – CPAF – Classificação Final Prova de Avaliação Final</p>
      <p class="nt">A classificação de cada ano de formação de um curso de ${nv} obtém-se pela aplicação da seguinte fórmula: CFA = (${ft})/${sw}, cujo resultado é arredondado às décimas.</p>
      <p class="nt">A classificação final respeitante à conclusão dos itinerários de ${nv} obtém-se pela aplicação da seguinte fórmula: CFC = (${Array.from({length:p.anos},(_,i)=>'CFA'+(i+1)).join('+')}+CPAF)/${p.anos+1}, cujo resultado é arredondado às unidades.</p>`+pzAss(p));return}
  if(k==='cfin'){pzSaida(p,al+' PAUTA FINAL CF '+p.nome,fin('CLASSIFICAÇÃO FINAL DE CURSO',f=>pzCFC(p,f).cfc));return}
  if(k==='grelha'){const FC=p.fpct;const tot=FC.crit.reduce((s,c)=>s+(+c[1]||0),0);cpdDoc('Grelha FPCT '+p.nome,`<style>${PZ_CSS}</style>`+pzCab(p,'FORMAÇÃO PRÁTICA EM CONTEXTO DE TRABALHO',p.anoAtual).replace('PAUTA DE AVALIAÇÃO','GRELHA DE AVALIAÇÃO')+`<table><thead><tr><th>N.º</th><th>NOME</th>${FC.crit.map(c=>`<th class="n">${esc(c[0])}<br>${c[1]}</th>`).join('')}<th class="n">Total<br>${tot}</th><th class="n">Relatório</th><th class="n">Entidade</th><th class="n">Nota</th><th class="n">Final</th></tr></thead><tbody>${F.map(f=>{const r=pzFpct(p,f);const x=FC.v[f.id]||{};return `<tr><td>${esc(f.num||'')}</td><td>${esc(f.nome.toUpperCase())}</td>${FC.crit.map((c,i)=>`<td class="n">${x['c'+i]??''}</td>`).join('')}<td class="n">${r.sc.every(v=>v!=null)?r.sc.reduce((s,v)=>s+v,0):''}</td><td class="n">${pzF(r.rel)}</td><td class="n">${pzF(r.ent)}</td><td class="n">${pzF(r.nota,2)}</td><td class="n"><b>${r.fin??''}</b></td></tr>`}).join('')}</tbody></table><p class="nt">Nota = Relatório × ${FC.pRel} + Avaliação da Entidade Acolhedora × ${FC.pEnt}</p>`+pzAss(p));return}
  if(k==='med'){const q=x=>{x=x==null?'':String(x);return /[;"\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x};const R=[['N.º','Nome',...Array.from({length:p.anos},(_,i)=>['FSC','FC','FT','FP','CFA'].map(c=>c+(i+1))).flat(),'CPAF','CFC']];
    F.forEach(f=>{const row=[f.num||'',f.nome];for(let a=1;a<=p.anos;a++){const r=pzAno(p,f,a);['FSC','FC','FT','FP','CFA'].forEach(c=>row.push(pzF(r[c],1)))}const c=pzCFC(p,f);row.push(pzF(c.cpaf),c.cfc??'');R.push(row)});
    download('medias-detalhadas-'+normSig(p.nome)+'.csv','﻿'+R.map(l=>l.map(q).join(';')).join('\n'),'text/csv')}}
/*V0996-FIM*/
/* SpruceNote e JornalNote: ao entrar, o quadro ajusta-se sozinho ao ecrã */
{const _gMQ=go;go=function(v){const ant=VIEW;const r=_gMQ.apply(this,arguments);try{if((v==='sprucenote'||v==='snjornal')&&ant!==v){let n=0;const f=()=>{const b=document.getElementById('mq-zf');if(b&&document.querySelector('[data-mq]')){b.click()}else if(b&&n>6){}else if(n++<12)setTimeout(f,120)};setTimeout(f,150)}}catch(_){}return r};if(_gMQ._f)go._f=_gMQ._f}
/* JornalNote: o quadro principal antigo passa a chamar-se JornalNote */
setTimeout(()=>{try{const q=S.snj&&S.snj.quadros;const r=q&&q.find(x=>x.id==='raiz');if(r&&r.nome==='SpruceNote do Jornal'){r.nome='JornalNote';save()}}catch(_){}},1200);

