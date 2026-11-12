/* =====================================================================
   CRITÉRIOS (domínios, ponderações, menções, regra)
   ===================================================================== */
function vCriterios(){
  const t=T();const ws=t.dominios.reduce((s,d)=>s+(+d.peso||0),0);const disc=minhasDisc();
  $('#view').innerHTML=`
  <div class="card ed"><h2>Turma</h2>
    <div style="margin-bottom:10px"><label>Oferta formativa</label>${segOferta('cr-of',ofertaDe(t))}</div>
    <div class="g2"><div><label>Turma</label><input data-t="nome" value="${esc(t.nome)}"></div>
    <div><label>Ano de escolaridade</label><select data-t="anoEsc">${Object.entries(ANOS_ESC).map(([c,l])=>`<optgroup label="${CICLOS[c]}">${l.map(x=>`<option ${x===t.anoEsc?'selected':''}>${x}</option>`).join('')}</optgroup>`).join('')}</select></div>
    <div><label>Disciplina</label><select data-t="disciplina">${[...new Set([t.disciplina,...disc])].map(d=>`<option ${d===t.disciplina?'selected':''}>${esc(d)}</option>`).join('')}</select></div></div>
    <p class="hint">Escala: ${isSec(t)?'0 a 20 valores (Ensino Secundário)':'percentagem e níveis 1 a 5 (Ensino Básico)'} — definida pelo ano de escolaridade.</p></div>
  <div class="card ed"><div class="row"><h2 style="margin:0">Domínios e ponderações</h2><span class="sp1"></span><label style="margin:0">Aplicar modelo</label>
    <select id="tpl" style="width:auto;max-width:280px"><option value="">—</option>${(m=>m?`<option value="${m.id}">Sugerido: ${esc(m.nome)}</option>`:'')(modeloPara(t.disciplina,ofertaDe(t)==='profij'?'profij':t.ciclo,ofertaDe(t)))}<optgroup label="Todos os modelos">${modelosTodos().map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</optgroup></select><button class="btn sm" data-dt2go="modelos" title="Gerir modelos">${ic('gear',14)}</button></div>
    <table class="lst" style="margin-top:8px"><thead><tr><th style="width:190px">Abreviatura</th><th>Designação</th><th style="width:130px">Ponderação %</th><th style="width:60px"></th></tr></thead><tbody>
    ${t.dominios.map((d,k)=>`<tr data-k="${k}"><td><div class="domab"><span class="domic" style="--dc:${domCor(t,d)}">${icDom(d,18)}</span><input type="color" class="domcor" data-dcor="${k}" value="${corHex(domCor(t,d))}" title="Cor do critério" aria-label="Cor de ${esc(d.nome)}"><input data-d="ab" value="${esc(d.ab)}"></div></td><td><input data-d="nome" value="${esc(d.nome)}"></td><td><input data-d="peso" value="${esc(d.peso)}" inputmode="decimal"></td><td class="act"><button class="btn sm dng" data-dd="${k}">×</button></td></tr>`).join('')}
    </tbody><tfoot><tr><td></td><td style="text-align:right"><b>Total</b></td><td><b class="${ws===100?'':'neg'}">${ws}%</b>${ws!==100?` <button class="btn sm" id="cr-norm">Corrigir para 100%</button>`:''}</td><td></td></tr></tfoot></table>
    <div class="row" style="margin-top:10px;flex-wrap:wrap;gap:8px"><button class="btn sm" id="d-add">${ic('plus',14)} Domínio</button><button class="btn sm" id="cr-exp">${ic('download',14)} Exportar Critérios</button><button class="btn sm" id="cr-imp">${ic('upload',14)} Importar Critérios (do departamento)…</button><span class="sp1"></span>${S.anos.flatMap(a=>a.turmas).filter(x=>x!==t&&x.disciplina===t.disciplina).length?'<button class="btn" id="d-copy">Copiar critérios de outra turma…</button>':''}</div></div>
  <div class="card ed"><h2>Classificação final por ${perW().toLowerCase()}</h2>
    ${periodos().slice(1).map(p=>`<div class="g2"><div><label>${perNome(p)}</label><select data-rg="${p}"><option value="media" ${t.regra[p]!=='periodo'?'selected':''}>Média dos ${perW().toLowerCase()}s 1.º a ${p}.º (por domínio)</option><option value="periodo" ${t.regra[p]==='periodo'?'selected':''}>Apenas o ${p}.º ${perW().toLowerCase()} (100%)</option></select></div></div>`).join('')}</div>
  <div class="card ed"><h2>Menções qualitativas</h2>
    <table class="lst"><thead><tr><th>Menção</th><th style="width:200px">Até (% inclusive)</th></tr></thead><tbody>
    ${t.mencoes.map((m,k)=>`<tr data-k="${k}"><td><input data-m="nome" value="${esc(m.nome)}"></td><td><input data-m="max" value="${esc(m.max)}" inputmode="decimal"></td></tr>`).join('')}</tbody></table></div>`;
  bindSegOferta('cr-of',v=>{t.oferta=v;save();go('criterios')});
  const crn=$('#cr-norm');if(crn)crn.onclick=()=>{normalizarPesos(t);go('criterios')};$('#cr-exp').onclick=()=>exportarCriterios(t);$('#cr-imp').onclick=()=>importarCriterios(t);
  $$('[data-t]').forEach(el=>el.addEventListener('change',()=>{t[el.dataset.t]=el.value;if(el.dataset.t==='anoEsc')t.ciclo=cicloDoAno(el.value);save();go('criterios')}));
  $('#tpl').onchange=e=>{if(!e.target.value)return;aplicarModeloTurma(t,e.target.value);vCriterios()};$$('[data-dt2go]').forEach(b=>b.onclick=()=>{UI.defTab=b.dataset.dt2go;go('definicoes')});
  $$('[data-d]').forEach(el=>el.addEventListener('change',()=>{const d=t.dominios[+el.closest('tr').dataset.k];const f=el.dataset.d;d[f]=f==='peso'?(num(el.value)||0):el.value;save();vCriterios()}));
  $$('[data-dd]').forEach(b=>b.onclick=()=>{const d=t.dominios[+b.dataset.dd];if(t.instrumentos.some(i=>i.itens.some(x=>x.dom===d.id))&&!confirm('Há itens neste domínio. Remover mesmo assim?'))return;t.dominios.splice(+b.dataset.dd,1);save();vCriterios()});
  $('#d-add').onclick=()=>{t.dominios.push({id:uid(),ab:'D'+(t.dominios.length+1),nome:'Novo domínio',peso:0});save();vCriterios()};
  const dc=$('#d-copy');if(dc)dc.onclick=()=>{const L=S.anos.flatMap(a=>a.turmas.map(x=>({a,x}))).filter(o=>o.x!==t&&o.x.disciplina===t.disciplina);
    openDrawer('Copiar critérios',L.map((o,k)=>`<button class="btn" style="display:block;margin:0 0 8px;width:100%;text-align:left" data-cp="${k}">${esc(o.x.nome)} · ${esc(o.a.nome)} — ${o.x.dominios.map(d=>esc(d.ab)+' '+d.peso+'%').join(', ')}</button>`).join(''));
    $$('[data-cp]').forEach(b=>b.onclick=()=>{const s=L[+b.dataset.cp].x;t.dominios=JSON.parse(JSON.stringify(s.dominios));t.mencoes=JSON.parse(JSON.stringify(s.mencoes));t.regra={...s.regra};save();closeDrawer();vCriterios();toast('Critérios copiados')})};
  $$('[data-rg]').forEach(el=>el.onchange=()=>{t.regra[el.dataset.rg]=el.value;save()});
  $$('[data-m]').forEach(el=>el.addEventListener('change',()=>{const m=t.mencoes[+el.closest('tr').dataset.k];const f=el.dataset.m;m[f]=f==='max'?(num(el.value)||0):el.value;save()}));
}

/* =====================================================================
   INSTRUMENTOS
   ===================================================================== */
function vInstrumentos(){
  const t=T();
  if(UI.inst&&t.instrumentos.find(i=>i.id===UI.inst))return vInstrumento(UI.inst);
  UI.inst=null;const al=alunosAval(t);
  barBtns([{id:'b-new',t:'+ Novo instrumento',c:'pri',f:novoInstrumento},{id:'b-rap',t:ic('sparkle',15)+' Instrumento Rápido',f:instrumentoRapido}]);
  $('#view').innerHTML=(!al.length?`<div class="card alert w">Nenhum aluno assinalado como frequentando ${esc(t.disciplina)}. Vá a <b>Alunos</b>.</div>`:'')+periodos().map(p=>{const L=t.instrumentos.filter(i=>+i.periodo===p).sort((a,b)=>(a.data||'').localeCompare(b.data||''));return `<div class="card"><h2>${perNome(p)}</h2>
    ${L.length?`<table class="lst"><thead><tr><th>Instrumento</th><th>Tipo</th><th>Data</th><th>Itens</th><th>Domínios</th><th>Avaliados</th><th>Média</th><th></th></tr></thead><tbody>
    ${L.map(i=>{const v=al.map(a=>instTotal(i,a.id)).filter(x=>x!=null);const m=v.length&&instMax(i)?avg(v)/instMax(i):null;const ds=[...new Set(i.itens.map(x=>x.dom))].map(d=>(domById(t,d)||{}).ab||'?').join(', ');
      return `<tr data-irow="${i.id}"><td><b>${esc(i.nome)}</b><span class="ityp mut">${esc(i.tipo)}</span></td><td class="mut">${esc(i.tipo)}</td><td>${fmtD(i.data)}</td><td>${i.itens.length} <span class="mut">(${nf(instMax(i))} pts)</span></td><td>${esc(ds)}</td><td>${v.length}/${al.length}</td><td>${m==null?'—':fmtNota(t,m)} ${pillM(t,mencao(t,m))}</td>
      <td class="act"><button class="btn sm" data-o="${i.id}">Abrir</button> <button class="btn sm" data-d="${i.id}">Duplicar</button> <button class="btn sm dng" data-x="${i.id}">Apagar</button></td></tr>`}).join('')}</tbody></table>`:'<div class="empty">Sem instrumentos.</div>'}</div>`}).join('');
  $$('[data-o]').forEach(b=>b.onclick=()=>{UI.inst=b.dataset.o;UI.instTab='notas';vInstrumentos()});
  $$('[data-irow]').forEach(tr=>{const i=t.instrumentos.find(x=>x.id===tr.dataset.irow);deslizarApagar(tr,()=>tr.querySelector('[data-x]').click());
    longoToque(tr,(x,y)=>menuContexto(x,y,[{t:'Abrir',ic:'clipboard',f:()=>{UI.inst=i.id;UI.instTab='notas';vInstrumentos()}},{t:'Duplicar',ic:'copy',f:()=>tr.querySelector('[data-d]').click()},'-',...periodos().filter(p=>p!==+i.periodo).map(p=>({t:'Mover para o '+p+'.º '+perW().toLowerCase(),ic:'layers',f:()=>{i.periodo=p;save();vInstrumentos();toast(i.nome+' → '+p+'.º '+perW().toLowerCase(),'ok')}})),'-',{t:'Apagar',ic:'trash',dng:true,f:()=>tr.querySelector('[data-x]').click()}]))});
  $$('[data-d]').forEach(b=>b.onclick=()=>{const s=t.instrumentos.find(i=>i.id===b.dataset.d);const c=JSON.parse(JSON.stringify(s));c.id=uid();c.nome=s.nome+' (cópia)';c.notas={};c.itens.forEach((it,k)=>it.id=uid()+k);t.instrumentos.push(c);save();UI.inst=c.id;UI.instTab='itens';vInstrumentos();toast('Duplicado sem classificações')});
  $$('[data-x]').forEach(b=>b.onclick=()=>{const i=t.instrumentos.find(x=>x.id===b.dataset.x);if(confirm('Apagar “'+i.nome+'” e todas as suas classificações?\n(Fica 30 dias no caixote do lixo.)')){paraLixo('instrumento',i,{ano:S.anoAtivo,turma:t.id});t.instrumentos=t.instrumentos.filter(x=>x!==i);save();vInstrumentos()}});
}
/* instrumento rápido: uma classificação (0–100 %) por domínio, sem itens */
function instrumentoRapido(){const t=T();if(!t.dominios.length){alert('Defina primeiro os domínios em Critérios.');return go('criterios')}
  const i={id:uid(),nome:'Registo '+String(t.instrumentos.length+1).padStart(2,'0'),tipo:'Observação em Sala de Aula',periodo:perAtual(t),data:isoData(new Date()),itens:t.dominios.map((d,k)=>({id:uid()+k,rot:d.ab+' (%)',dom:d.id,cot:100})),notas:{}};
  t.instrumentos.push(i);save();UI.inst=i.id;UI.instTab='notas';vInstrumentos();toast('Instrumento rápido: escreva a % de cada domínio','ok')}
function novoInstrumento(){
  const t=T();if(!t.dominios.length){alert('Defina primeiro os domínios em Critérios.');return go('criterios')}
  const i={id:uid(),nome:'Instrumento '+String(t.instrumentos.length+1).padStart(2,'0'),tipo:S.cfg.tipos[0]||'Teste de Avaliação',periodo:perAtual(t),data:new Date().toISOString().slice(0,10),itens:t.dominios.map((d,k)=>({id:uid()+k,rot:'Item '+(k+1),dom:d.id,cot:10})),notas:{}};
  t.instrumentos.push(i);save();UI.inst=i.id;UI.instTab='itens';vInstrumentos();
}
function vInstrumento(id){
  const t=T(),i=t.instrumentos.find(x=>x.id===id);
  barBtns([{id:'b-back',t:'← Instrumentos',f:()=>{UI.inst=null;vInstrumentos()}},{id:'b-csv',t:'Exportar CSV',f:()=>exportInst(i)},{id:'b-pr',t:'Imprimir grelha',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  $('#view').innerHTML=`<div class="card wide">
    <div class="ed g2" style="grid-template-columns:2fr 1.3fr 1fr 1fr">
      <div><label>Designação</label><input id="i-nome" value="${esc(i.nome)}"></div>
      <div><label>Tipo</label><select id="i-tipo">${[...new Set([i.tipo,...S.cfg.tipos])].map(x=>`<option ${x===i.tipo?'selected':''}>${esc(x)}</option>`).join('')}</select></div>
      <div><label>${perW()}</label><select id="i-per">${periodos().map(p=>`<option value="${p}" ${+i.periodo===p?'selected':''}>${p}.º</option>`).join('')}</select></div>
      <div><label>Data</label><input type="date" id="i-data" value="${esc(i.data)}"></div>
      ${ehModular(t)&&(t.modulos||[]).length?`<div style="grid-column:1/-1"><label>${unidMod(t).s} associad${unidMod(t).art}</label><select id="i-mod"><option value="">— nenhum${unidMod(t).art==='a'?'a':''} —</option>${t.modulos.map(m=>`<option value="${m.id}" ${i.modulo===m.id?'selected':''}>${esc((m.cod?m.cod+' · ':'')+m.nome)}</option>`).join('')}</select></div>`:''}</div>
    <div class="tabs noprint"><button data-it="notas" class="${UI.instTab==='notas'?'on':''}">Classificações</button><button data-it="itens" class="${UI.instTab==='itens'?'on':''}">Itens e cotações (${i.itens.length} · ${nf(instMax(i))} pts)</button><button data-it="stats" class="${UI.instTab==='stats'?'on':''}">Análise</button></div>
    ${(()=>{const L=proximasAulas(aulasTurma(t),5,null,t);return L.length?`<div class="row noprint" style="margin:-4px 0 12px;gap:6px"><span class="mut" style="font-size:13px">${ic('calendar',14)} Próximas aulas:</span>${L.map(p=>`<button class="chip ${isoData(p.data)===i.data?'on':''}" data-dt="${isoData(p.data)}">${esc((p.k===0?'Hoje':p.k===1?'Amanhã':DIAS_C[p.data.getDay()]+' '+p.data.getDate()+'/'+(p.data.getMonth()+1))+' '+fmtHM(p.ini))}</button>`).join('')}</div>`:''})()}
    <div id="i-body"></div></div>`;
  $$('[data-dt]').forEach(b=>b.onclick=()=>{i.data=b.dataset.dt;const p=CAL()?periodoDe(i.data):null;if(p&&p<=periodos().length)i.periodo=p;save();vInstrumento(id)});
  $('#i-nome').oninput=e=>{i.nome=e.target.value;save()};
  $('#i-tipo').onchange=e=>{i.tipo=e.target.value;save()};
  $('#i-per').onchange=e=>{i.periodo=+e.target.value;save()};
  if($('#i-mod'))$('#i-mod').onchange=e=>{i.modulo=e.target.value||undefined;save()};
  $('#i-data').onchange=e=>{i.data=e.target.value;const p=CAL()&&i.data?periodoDe(i.data):null;if(p&&p<=periodos().length&&p!==+i.periodo){i.periodo=p;save();toast('Data no '+p+'.º '+perW().toLowerCase());return vInstrumento(id)}save()};
  $$('[data-it]').forEach(b=>b.onclick=()=>{UI.instTab=b.dataset.it;vInstrumento(id)});
  ({notas:instNotas,itens:instItens,stats:instStats})[UI.instTab](t,i);
}
function instItens(t,i){
  const sumDom=t.dominios.map(d=>({d,s:i.itens.filter(x=>x.dom===d.id).reduce((a,x)=>a+(+x.cot||0),0)}));
  $('#i-body').innerHTML=`<p class="hint">Cada item (pergunta, critério, alínea) pertence a um domínio e tem uma cotação. A % de cada domínio no instrumento = pontos obtidos ÷ cotação desse domínio.</p>
    <table class="lst"><thead><tr><th style="width:40px">#</th><th>Item / critério</th><th style="width:240px">Domínio</th><th style="width:110px">Cotação</th><th style="width:90px"></th></tr></thead><tbody>
    ${i.itens.map((it,k)=>`<tr data-k="${k}"><td class="mut">${k+1}</td><td><input data-f="rot" value="${esc(it.rot)}"></td>
      <td><select data-f="dom">${domById(t,it.dom)?'':'<option value="">— sem domínio —</option>'}${t.dominios.map(d=>`<option value="${d.id}" ${d.id===it.dom?'selected':''}>${esc(d.ab)} — ${esc(d.nome)}</option>`).join('')}</select></td>
      <td><input data-f="cot" value="${esc(String(it.cot).replace('.',','))}" inputmode="decimal"></td>
      <td class="act"><button class="btn sm" data-up="${k}">↑</button> <button class="btn sm dng" data-del="${k}">×</button></td></tr>`).join('')}</tbody></table>
    <div class="row" style="margin-top:10px"><button class="btn" id="it-add">+ Item</button><button class="btn" id="it-addn">+ Vários itens…</button><span class="sp1"></span>
      <span>${sumDom.filter(x=>x.s).map(x=>`<b>${esc(x.d.ab)}</b> ${nf(x.s)}`).join(' · ')} · <b>Total ${nf(instMax(i))} pontos</b></span></div>
    ${Object.keys(i.notas).length?'<div class="alert w">Este instrumento já tem classificações; alterar itens afeta as notas registadas.</div>':''}`;
  const re=()=>{save();instItens(t,i)};
  $$('#i-body tr[data-k] [data-f]').forEach(el=>el.addEventListener('change',()=>{const it=i.itens[+el.closest('tr').dataset.k];const f=el.dataset.f;it[f]=f==='cot'?(num(el.value)||0):el.value;re()}));
  $$('[data-del]').forEach(b=>b.onclick=()=>{const k=+b.dataset.del;const it=i.itens[k];i.itens.splice(k,1);Object.values(i.notas).forEach(n=>delete n[it.id]);re()});
  $$('[data-up]').forEach(b=>b.onclick=()=>{const k=+b.dataset.up;if(k>0){[i.itens[k-1],i.itens[k]]=[i.itens[k],i.itens[k-1]];re()}});
  const last=()=>i.itens[i.itens.length-1]||{dom:(t.dominios[0]||{}).id,cot:10};
  $('#it-add').onclick=()=>{const l=last();i.itens.push({id:uid(),rot:'Item '+(i.itens.length+1),dom:l.dom,cot:l.cot});re()};
  $('#it-addn').onclick=()=>{const n=parseInt(prompt('Quantos itens?'));if(!n||n<1||n>60)return;const c=num(prompt('Cotação de cada item?','10'))||0;const l=last();for(let k=0;k<n;k++)i.itens.push({id:uid()+k,rot:'Item '+(i.itens.length+1),dom:l.dom,cot:c});re()};
}
function instNotas(t,i){
  const al=alunosAval(t);
  if(!i.itens.length){$('#i-body').innerHTML='<div class="empty">Defina primeiro os itens e cotações.</div>';return}
  if(!al.length){$('#i-body').innerHTML='<div class="empty">Nenhum aluno assinalado como frequentando a disciplina.</div>';return}
  const doms=t.dominios.filter(d=>i.itens.some(x=>x.dom===d.id));const max=instMax(i);
  const groups=[];i.itens.forEach(it=>{const g=groups[groups.length-1];if(g&&g.dom===it.dom)g.n++;else groups.push({dom:it.dom,n:1})});
  $('#i-body').innerHTML=`<p class="hint noprint">Escreva as cotações obtidas. <b>Enter</b> desce, setas navegam. Linha toda em branco = “Não avaliado”. Não é possível passar da cotação de cada item.</p>
  <div class="gwrap"><table class="grid" id="grid"><thead>
    <tr><th class="stk0" rowspan="3">N.º</th><th class="stk" rowspan="3">Nome</th>${groups.map(g=>`<th colspan="${g.n}" title="${esc((domById(t,g.dom)||{}).nome||'')}">${esc((domById(t,g.dom)||{}).ab||'?')}</th>`).join('')}<th rowspan="3">Total<div class="dh">/${nf(max)}</div></th><th rowspan="3">Nota</th><th rowspan="3">Menção</th>${doms.map(d=>`<th rowspan="3">${esc(d.ab)}<div class="dh">${isSec(t)?'0–20':'%'}</div></th>`).join('')}</tr>
    <tr>${i.itens.map(it=>`<th class="dh" title="${esc(it.rot)}"><span class="ith">${esc(it.rot)}</span></th>`).join('')}</tr>
    <tr>${i.itens.map(it=>`<th>${nf(it.cot,2)}</th>`).join('')}</tr></thead><tbody>
  ${al.map((a,r)=>`<tr data-a="${a.id}"><td class="n stk0">${esc(numAl(a))}</td><td class="stk" title="${esc(a.nome)}">${esc(a.nome)}${tagOrig(t,a)}</td>
    ${i.itens.map((it,c)=>{const v=(i.notas[a.id]||{})[it.id];return `<td><input data-r="${r}" data-c="${c}" data-i="${it.id}" value="${v==null?'':esc(String(v).replace('.',','))}" inputmode="decimal"></td>`}).join('')}
    <td class="calc" data-o="tot"></td><td class="calc" data-o="nota"></td><td data-o="men"></td>${doms.map(d=>`<td data-o="d-${d.id}"></td>`).join('')}</tr>`).join('')}
  </tbody><tfoot><tr><td class="stk0"></td><td class="stk">Média por item</td>${i.itens.map(it=>`<td data-f="${it.id}"></td>`).join('')}<td data-f="tot"></td><td data-f="nota"></td><td></td>${doms.map(d=>`<td data-f="d-${d.id}"></td>`).join('')}</tr></tfoot></table></div>
  <div id="i-msg" class="noprint"></div>`;
  if(t.bloq&&t.bloq[i.periodo]){$$('#grid input').forEach(x=>{x.readOnly=true;x.tabIndex=-1});$('#i-body').insertAdjacentHTML('afterbegin',`<div class="alert w">${ic('shield',15)} O ${i.periodo}.º ${perW().toLowerCase()} está bloqueado (Avaliação Final) — as classificações só podem ser consultadas.</div>`)}
  if(!$('#np-btn'))$('#i-msg').insertAdjacentHTML('beforebegin',`<div class="row noprint" style="margin-top:8px"><button class="btn sm" id="np-btn">${ic('grid',14)} Teclado Numérico</button><span class="hint" style="margin:0">Linhas a amarelo = alunos ainda sem classificação.</span></div>`);$('#np-btn').onclick=tecladoNum;
  const cot={};i.itens.forEach(it=>cot[it.id]=+it.cot||0);
  const rowUpd=tr=>{const aid=tr.dataset.a;const tot=instTotal(i,aid);tr.classList.toggle('semnota',!instAvaliado(i,aid));
    tr.querySelector('[data-o=tot]').innerHTML=tot==null?'<span class="na">n/a</span>':nf(tot,2);
    const f=tot==null||!max?null:tot/max;const nt=tr.querySelector('[data-o=nota]');nt.textContent=f==null?'':fmtNota(t,f);nt.classList.toggle('neg',negativa(t,f));
    tr.querySelector('[data-o=men]').innerHTML=pillM(t,mencao(t,f));
    doms.forEach(d=>{const x=instDom(i,aid,d.id);tr.querySelector(`[data-o="d-${d.id}"]`).innerHTML=x?`<span class="${tcls(t,mencao(t,x.pct))}">${pctD(t,x.pct)}</span>`:''})};
  const footUpd=()=>{
    const av=al.filter(a=>instAvaliado(i,a.id));
    i.itens.forEach(it=>{$(`#grid [data-f="${it.id}"]`).textContent=av.length?nf(avg(av.map(a=>num((i.notas[a.id]||{})[it.id])||0))):''});
    const m=avg(al.map(a=>instTotal(i,a.id)));$('#grid [data-f=tot]').textContent=m==null?'':nf(m);$('#grid [data-f=nota]').textContent=m==null||!max?'':fmtNota(t,m/max);
    doms.forEach(d=>{$(`#grid [data-f="d-${d.id}"]`).textContent=pctD(t,avg(al.map(a=>{const x=instDom(i,a.id,d.id);return x&&x.pct})))});
    const nao=al.length-av.length;$('#i-msg').innerHTML=nao?`<div class="alert w">Atenção: ${nao} aluno${nao>1?'s não foram avaliados':' não foi avaliado'}.</div>`:'<div class="alert">Todos os alunos foram avaliados.</div>'};
  $$('#grid tbody tr').forEach(rowUpd);footUpd();
  $$('#grid input').forEach(inp=>{
    const chk=()=>{const v=num(inp.value);inp.classList.toggle('over',v!=null&&(v>cot[inp.dataset.i]||v<0))};chk();
    inp.addEventListener('input',()=>{const tr=inp.closest('tr'),aid=tr.dataset.a;i.notas[aid]=i.notas[aid]||{};const v=inp.value.trim();
      if(v==='')delete i.notas[aid][inp.dataset.i];else i.notas[aid][inp.dataset.i]=num(v)==null?v:num(v);
      if(!Object.keys(i.notas[aid]).length)delete i.notas[aid];chk();rowUpd(tr);footUpd();save()});
    inp.addEventListener('keydown',e=>{const r=+inp.dataset.r,c=+inp.dataset.c;let to=null;
      if(e.key==='Enter'||e.key==='ArrowDown')to=[r+1,c];else if(e.key==='ArrowUp')to=[r-1,c];
      else if(e.key==='ArrowRight'&&inp.selectionStart===inp.value.length)to=[r,c+1];else if(e.key==='ArrowLeft'&&inp.selectionStart===0)to=[r,c-1];
      if(to){const n=$(`#grid input[data-r="${to[0]}"][data-c="${to[1]}"]`);if(n){e.preventDefault();n.focus();n.select()}}});
    inp.addEventListener('focus',()=>inp.select());
  });
}
function instStats(t,i){
  const al=alunosAval(t),max=instMax(i);
  const res=al.map(a=>({a,tot:instTotal(i,a.id)})).filter(x=>x.tot!=null).sort((x,y)=>y.tot-x.tot);
  if(!res.length||!max){$('#i-body').innerHTML='<div class="empty">Ainda sem classificações.</div>';return}
  const doms=t.dominios.filter(d=>i.itens.some(x=>x.dom===d.id)).map(d=>({d,v:avg(al.map(a=>{const x=instDom(i,a.id,d.id);return x&&x.pct}))}));
  const its=i.itens.filter(it=>+it.cot).map(it=>({it,p:avg(res.map(x=>num((i.notas[x.a.id]||{})[it.id])||0))/it.cot})).sort((a,b)=>a.p-b.p);
  const dist=t.mencoes.map((m,k)=>({m,k,n:res.filter(x=>mencao(t,x.tot/max).i===k).length}));
  const sd=doms.filter(x=>x.v!=null).sort((a,b)=>b.v-a.v);
  $('#i-body').innerHTML=`<div class="kpis" style="margin:0 0 14px"><div class="kpi"><div class="l">Avaliados</div><div class="v">${res.length}/${al.length}</div></div>
    <div class="kpi"><div class="l">Média</div><div class="v">${fmtNota(t,avg(res.map(x=>x.tot))/max)}</div></div>
    <div class="kpi"><div class="l">Positivas</div><div class="v">${res.filter(x=>!negativa(t,x.tot/max)).length}</div></div>
    <div class="kpi"><div class="l">Melhor classificação</div><div class="v">${fmtNota(t,res[0].tot/max)}</div><div class="mut">${esc(res[0].a.nome)}</div></div></div>
    ${sd.length>1?`<div class="alert">Os alunos estiveram melhor em <b>${esc(sd[0].d.nome)}</b> (${pctD(t,sd[0].v)}); é preciso trabalhar mais <b>${esc(sd[sd.length-1].d.nome)}</b> (${pctD(t,sd[sd.length-1].v)}).</div>`:''}
    <h3>Por domínio</h3><div class="bars">${doms.map(x=>`<div class="b"><span>${esc(x.d.nome)}</span><div class="tr"><div class="fi ${mcls(t,mencao(t,x.v))}" style="width:${Math.round((x.v||0)*100)}%"></div></div><b>${pctD(t,x.v)}</b></div>`).join('')}</div>
    <h3>Menções</h3><div class="bars">${dist.map(x=>`<div class="b"><span>${esc(x.m.nome)}</span><div class="tr"><div class="fi ${mcls(t,{i:x.k})}" style="width:${Math.round(x.n/res.length*100)}%"></div></div><b>${x.n}</b></div>`).join('')}</div>
    <h3>Itens com menor taxa de sucesso</h3><div class="bars">${its.slice(0,6).map(x=>`<div class="b"><span>${esc(x.it.rot)} <span class="mut">(${esc((domById(t,x.it.dom)||{}).ab||'')})</span></span><div class="tr"><div class="fi ${mcls(t,mencao(t,x.p))}" style="width:${Math.round(x.p*100)}%"></div></div><b>${pct(x.p)}</b></div>`).join('')}</div>`;
}
function exportInst(i){
  const t=T(),al=alunosAval(t),max=instMax(i);const doms=t.dominios.filter(d=>i.itens.some(x=>x.dom===d.id));
  const rows=[[t.nome,t.disciplina,(A()||{}).nome],['Instrumento',i.nome,'Tipo',i.tipo,perW(),i.periodo,'Data',fmtD(i.data)],[],[...(t.origens?['Turma']:[]),'N.º','Nome',...i.itens.map(it=>((domById(t,it.dom)||{}).ab||'')+' '+it.rot),'Total','Nota','Menção',...doms.map(d=>d.ab+' %')],[...(t.origens?['']:[]),'','Cotação',...i.itens.map(it=>nf(it.cot,2)),nf(max)]];
  al.forEach(a=>{const tot=instTotal(i,a.id),f=tot==null?null:tot/max;rows.push([...(t.origens?[a.origem||'']:[]),a.num,a.nome,...i.itens.map(it=>{const v=(i.notas[a.id]||{})[it.id];return v==null?'':String(v).replace('.',',')}),tot==null?'Não avaliado':nf(tot,2),fmtNota(t,f),(mencao(t,f)||{}).nome||'',...doms.map(d=>{const x=instDom(i,a.id,d.id);return x?pctD(t,x.pct):''})])});
  download(i.nome+' - '+t.nome+' - '+t.disciplina+'.csv',csv(rows),'text/csv');
}

/* =====================================================================
   DOMÍNIOS
   ===================================================================== */
/* ícone de cada domínio pelo nome (Produção Oral → microfone, Compreensão Oral → auscultadores…) */
function icDom(d,sz){const n=normT((d.nome||'')+' '+(d.ab||''));
  const k=/produc\w* oral|\bpo\b|express\w* oral|falar/.test(n)?'mic':/compreens\w* oral|\bco\b|ouvir|escuta/.test(n)?'headphones':/interac/.test(n)?'chat':
    /compreens\w* escrita|leitura|\bce\b|\bler\b/.test(n)?'bookopen':/produc\w* escrita|escrita|\bpe\b|redac/.test(n)?'pen':/gramatic|lexic|vocabul|funcionamento da lingua/.test(n)?'puzzle':
    /oralidade/.test(n)?'mic':/atitud|comport|valores|cidadan|socio|autonomia|responsab/.test(n)?'heart':/fisic|motor|desport|jogos|ginast/.test(n)?'run':
    /experim|laborat|pratic|investig/.test(n)?'flask':/calcul|numer|algebr|geometr|matem/.test(n)?'calc':/arte|express|criativ|musica|desenho/.test(n)?'palette':
    /conhec|conceit|teoric|saber|compreens/.test(n)?'brain':'target';
  return ic(k,sz||16)}
function vDominios(){
  const t=T();if(!t.dominios.length){$('#view').innerHTML='<div class="card empty">Defina os domínios em Critérios.</div>';return}
  if(!UI.dom||!domById(t,UI.dom))UI.dom=t.dominios[0].id;
  const d=domById(t,UI.dom),al=alunosAval(t),P=periodos();
  const insts=t.instrumentos.filter(i=>i.itens.some(x=>x.dom===d.id)).sort((a,b)=>(+a.periodo-+b.periodo)||(a.data||'').localeCompare(b.data||''));
  barBtns([{id:'b-csv',t:'Exportar CSV',f:()=>download('Domínio '+d.ab+' - '+t.nome+'.csv',csv([['N.º','Nome',...insts.map(i=>i.nome+' ('+i.periodo+'.º)'),...P.map(p=>p+'.º'),'Média anual'],...al.map(a=>[a.num,a.nome,...insts.map(i=>{const x=instDom(i,a.id,d.id);return x?pctD(t,x.pct):''}),...P.map(p=>pct(domPer(t,a.id,d.id,p))),pct(avg(P.map(p=>domPer(t,a.id,d.id,p))))])]),'text/csv')}]);
  $('#view').innerHTML=`<div class="card wide"><div class="tabs">${t.dominios.map(x=>`<button data-dm="${x.id}" class="${x.id===d.id?'on':''}">${icDom(x,16)} ${esc(x.ab)} · ${esc(x.nome)}</button>`).join('')}</div>
    <p class="hint">% obtida neste domínio em cada instrumento e média por ${perW().toLowerCase()}. Ponderação: <b>${d.peso}%</b>.</p>
    ${insts.length&&al.length?`<div class="gwrap"><table class="grid domt"><thead><tr><th class="stk0">N.º</th><th class="stk">Nome</th>${insts.map(i=>`<th title="${esc(i.nome)}">${esc(i.nome)}<div class="dh">${i.periodo}.º · ${nf(i.itens.filter(x=>x.dom===d.id).reduce((s,x)=>s+(+x.cot||0),0))} pts</div></th>`).join('')}${P.map(p=>`<th>${p}.º</th>`).join('')}<th>Média Anual</th></tr></thead><tbody>
    ${al.map(a=>{const pp=P.map(p=>domPer(t,a.id,d.id,p));return `<tr><td class="n stk0">${esc(numAl(a))}</td><td class="stk">${esc(a.nome)}${tagOrig(t,a)}</td>${insts.map(i=>{const x=instDom(i,a.id,d.id);return `<td>${x?`<span class="${tcls(t,mencao(t,x.pct))}">${pctD(t,x.pct)}</span> <span class="dh">${nf(x.pts)}</span>`:'<span class="na">—</span>'}</td>`}).join('')}${pp.map(v=>`<td class="calc ${tcls(t,mencao(t,v))}">${pctD(t,v)}</td>`).join('')}<td class="calc">${pctD(t,avg(pp))}</td></tr>`}).join('')}
    </tbody><tfoot><tr><td class="stk0"></td><td class="stk">Média da Turma</td>${insts.map(i=>`<td>${pctD(t,avg(al.map(a=>{const x=instDom(i,a.id,d.id);return x&&x.pct})))}</td>`).join('')}${P.map(p=>`<td>${pctD(t,avg(al.map(a=>domPer(t,a.id,d.id,p))))}</td>`).join('')}<td></td></tr></tfoot></table></div>`:'<div class="empty">Nenhum instrumento avaliado neste domínio.</div>'}</div>`;
  $$('[data-dm]').forEach(b=>b.onclick=()=>{UI.dom=b.dataset.dm;vDominios()});
}

/* =====================================================================
   AVALIAÇÃO FINAL
   ===================================================================== */
function vAvaliacao(){
  const t=T(),al=alunosFiltro(t),P=periodos();
  if(!UI.per||!P.includes(UI.per))UI.per=perAtual(t);
  const p=UI.per,acum=p>1&&t.regra[p]!=='periodo';
  const L=al.map(a=>{const pp=pctsPer(t,a.id,p),pf=pctsFinal(t,a.id,p);return {a,pp,pf,np:ponderada(t,pp),nf:ponderada(t,pf)}});
  barBtns([{id:'b-csv',t:'Exportar pauta (CSV)',f:()=>download('Pauta '+p+'.º - '+(UI.orig||t.nome)+' - '+t.disciplina+'.csv',csv([[UI.orig||t.nome,t.disciplina,perNome(p),(A()||{}).nome],[...(t.origens?['Turma']:[]),'N.º','Nome',...t.dominios.map(d=>d.ab+' ('+p+'.º)'),'Nota do '+perW().toLowerCase(),...(acum?t.dominios.map(d=>d.ab+' (acum.)'):[]),'Nota final','Nível','Menção','Autoavaliação','Observações'],...L.map(l=>[...(t.origens?[l.a.origem||'']:[]),l.a.num,l.a.nome,...t.dominios.map(d=>pctD(t,l.pp[d.id])),fmtNota(t,l.np),...(acum?t.dominios.map(d=>pctD(t,l.pf[d.id])):[]),fmtNota(t,l.nf),nivel(t,l.nf),(mencao(t,l.nf)||{}).nome||'',(l.a.autoav||{})[p]||'',(l.a.obsPer||{})[p]||''])]),'text/csv')},
    {id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  const ws=t.dominios.reduce((s,d)=>s+(+d.peso||0),0);
  $('#view').innerHTML=`<div class="card wide">
    <div class="row"><div class="tabs" style="margin:0">${P.map(x=>`<button data-p="${x}" class="${x===p?'on':''}">${perNome(x)}</button>`).join('')}</div>${selOrigem(t)}<span class="sp1"></span>
    <span class="mut">${p===1?'Nota = só o 1.º '+perW().toLowerCase():acum?'Nota final = média por domínio de 1.º a '+p+'.º':'Nota final = só o '+p+'.º'} · ${t.dominios.map(d=>esc(d.ab)+' '+d.peso+'%').join(', ')}</span></div>
    ${ws!==100?`<div class="alert w">As ponderações somam ${ws}% (deviam somar 100%). <button class="btn sm" id="av-norm">Corrigir para 100%</button></div>`:''}
    <div class="row noprint" style="margin-top:10px"><button class="btn sm ${t.bloq&&t.bloq[p]?'pri':''}" id="av-bloq">${ic('shield',14)} ${t.bloq&&t.bloq[p]?'Período bloqueado — desbloquear':'Bloquear o '+p+'.º '+perW().toLowerCase()}</button><span class="hint" style="margin:0">Bloqueie depois da reunião de avaliação: as classificações deste ${perW().toLowerCase()} deixam de poder ser alteradas. “Atribuída” regista o nível dado em conselho (a vermelho quando difere do proposto).</span></div>
    ${al.length?`<div class="gwrap" style="margin-top:10px"><table class="grid"><thead>
      <tr><th class="stk0" rowspan="2">N.º</th><th class="stk" rowspan="2">Nome</th><th colspan="${t.dominios.length+1}">${perNome(p)}</th>${acum?`<th colspan="${t.dominios.length}">Acumulado (1.º–${p}.º)</th>`:''}<th rowspan="2">Nota Final</th><th rowspan="2">${isSec(t)?'Nota<br>Proposta':'Nível'}</th><th rowspan="2">Atribuída</th><th rowspan="2">Menção</th><th rowspan="2">Autoavaliação</th><th rowspan="2" style="min-width:220px">Observações</th></tr>
      <tr>${t.dominios.map(d=>`<th>${esc(d.ab)}<div class="dh">${d.peso}%</div></th>`).join('')}<th>Nota</th>${acum?t.dominios.map(d=>`<th>${esc(d.ab)}</th>`).join(''):''}</tr></thead><tbody>
    ${L.map(l=>`<tr data-a="${l.a.id}"><td class="n stk0">${esc(numAl(l.a))}</td><td class="stk">${esc(l.a.nome)}${tagOrig(t,l.a)}</td>
      ${t.dominios.map(d=>`<td class="${tcls(t,mencao(t,l.pp[d.id]))}">${pctD(t,l.pp[d.id])}</td>`).join('')}<td class="calc ${negativa(t,l.np)?'neg':''}">${fmtNota(t,l.np)}</td>
      ${acum?t.dominios.map(d=>`<td>${pctD(t,l.pf[d.id])}</td>`).join(''):''}
      <td class="calc ${negativa(t,l.nf)?'neg':''}" style="font-size:14px">${fmtNota(t,l.nf)}</td><td class="calc">${nivel(t,l.nf)}</td><td><input class="txtin atr ${(((t.atrib||{})[p]||{})[l.a.id]||'')!==''&&String(((t.atrib||{})[p]||{})[l.a.id])!==String(nivel(t,l.nf))?'dif':''}" data-atr value="${esc(((t.atrib||{})[p]||{})[l.a.id]||'')}" placeholder="${nivel(t,l.nf)}" inputmode="numeric" aria-label="Nível atribuído a ${esc(l.a.nome)}" ${t.bloq&&t.bloq[p]?'readonly':''}></td><td>${pillM(t,mencao(t,l.nf))}</td>
      <td><input class="txtin" data-av value="${esc((l.a.autoav||{})[p]||'')}" style="width:70px;text-align:center"></td><td style="text-align:left"><input class="txtin" data-ob value="${esc((l.a.obsPer||{})[p]||'')}" style="width:100%"></td></tr>`).join('')}
    </tbody><tfoot><tr><td class="stk0"></td><td class="stk">Média da Turma</td>${t.dominios.map(d=>`<td>${pctD(t,avg(L.map(l=>l.pp[d.id])))}</td>`).join('')}<td>${fmtNota(t,avg(L.map(l=>l.np)))}</td>${acum?t.dominios.map(d=>`<td>${pctD(t,avg(L.map(l=>l.pf[d.id])))}</td>`).join(''):''}<td>${fmtNota(t,avg(L.map(l=>l.nf)))}</td><td colspan="5"></td></tr></tfoot></table></div>
    <p class="hint">Domínios sem instrumentos no ${perW().toLowerCase()} não entram no cálculo (ponderações reajustadas). ${isSec(t)?'Nível proposto = nota final arredondada às unidades.':'Níveis: 0–19% → 1, 20–49% → 2, 50–69% → 3, 70–89% → 4, 90–100% → 5.'}</p>`:'<div class="empty">Nenhum aluno frequenta a disciplina.</div>'}</div>`;
  $$('[data-p]').forEach(b=>b.onclick=()=>{UI.per=+b.dataset.p;vAvaliacao()});
  $('#av-bloq').onclick=()=>{t.bloq=t.bloq||{};t.bloq[p]=!t.bloq[p];save();vAvaliacao();toast(t.bloq[p]?p+'.º '+perW().toLowerCase()+' bloqueado':'Desbloqueado','ok')};
  const nb=$('#av-norm');if(nb)nb.onclick=()=>{normalizarPesos(t);vAvaliacao()};
  $$('[data-atr]').forEach(inp=>inp.onchange=()=>{const aid=inp.closest('tr').dataset.a;t.atrib=t.atrib||{};t.atrib[p]=t.atrib[p]||{};const v=inp.value.trim();if(v)t.atrib[p][aid]=v;else delete t.atrib[p][aid];save();inp.classList.toggle('dif',!!v&&v!==inp.placeholder)});
  bindOrigem(vAvaliacao);
  $$('#view tr[data-a]').forEach(tr=>{const a=t.alunos.find(x=>x.id===tr.dataset.a);
    tr.querySelector('[data-av]').oninput=e=>{a.autoav=a.autoav||{};a.autoav[p]=e.target.value;save()};
    tr.querySelector('[data-ob]').oninput=e=>{a.obsPer=a.obsPer||{};a.obsPer[p]=e.target.value;save()}});
}

/* =====================================================================
   RELATÓRIOS
   ===================================================================== */
function vRelatorios(){
  const t=T(),al=alunosFiltro(t),P=periodos();
  if(!UI.relPer||!P.includes(UI.relPer))UI.relPer=perAtual(t);
  if(UI.relAluno!=='all'&&!al.some(a=>a.id===UI.relAluno))UI.relAluno='all';
  barBtns([{id:'b-pr',t:'Imprimir',c:'pri',f:()=>window.print()}]);
  const sel=UI.relAluno==='all'?al:al.filter(a=>a.id===UI.relAluno);
  $('#view').innerHTML=`<div class="card noprint"><div class="row">
    ${selOrigem(t)}<label class="mut">Aluno</label><select class="fld" id="r-al" style="width:auto"><option value="all">Todos (${al.length})</option>${al.map(a=>`<option value="${a.id}" ${a.id===UI.relAluno?'selected':''}>${esc(numAl(a))}. ${esc(a.nome)}</option>`).join('')}</select>
    <label class="mut">Até ao</label><select class="fld" id="r-per" style="width:auto">${P.map(p=>`<option value="${p}" ${p===UI.relPer?'selected':''}>${perNome(p)}</option>`).join('')}</select>
    <label class="mut">Documento</label><select class="fld" id="r-tipo" style="width:auto"><option value="rel" ${UI.relTipo!=='auto'?'selected':''}>Relatório Individual</option><option value="auto" ${UI.relTipo==='auto'?'selected':''}>Registo de Autoavaliação (Departamento)</option></select>
    <span class="sp1"></span><span class="hint">${UI.relTipo==='auto'?'Preenchido com os resultados e com a autoavaliação feita na app.':'A síntese descritiva pode ser editada diretamente na folha.'}</span></div></div>
    <div class="sheetwrap">${sel.length?sel.map(a=>UI.relTipo==='auto'?regAutoav(t,a,UI.relPer):relatorio(t,a,UI.relPer)).join(''):'<div class="card empty">Sem alunos.</div>'}</div>`;
  $('#r-tipo').onchange=e=>{UI.relTipo=e.target.value;vRelatorios()};
  $('#r-al').onchange=e=>{UI.relAluno=e.target.value;vRelatorios()};
  bindOrigem(()=>{UI.relAluno='all';vRelatorios()});
  $('#r-per').onchange=e=>{UI.relPer=+e.target.value;vRelatorios()};
  $$('.sheet [data-sint]').forEach(el=>el.addEventListener('input',()=>{const a=t.alunos.find(x=>x.id===el.dataset.sint);a.sintese=a.sintese||{};a.sintese[UI.relPer]=el.innerText;save()}));
}
function sintese(t,a,per){
  const pf=pctsFinal(t,a.id,per);const w=perW().toLowerCase();
  const parts=t.dominios.map(d=>{const m=mencao(t,pf[d.id]);if(!m)return null;if(m.banda||!temMencoes(t)){const v=pf[d.id];return `Em ${esc(d.nome)}, ${oa(a)} ${aluno_a(a)} obteve ${fmtNota(t,v)} valores${v>=.895?', um desempenho muito bom':v>=.695?', um bom desempenho':v>=.495?', um desempenho suficiente':', abaixo do esperado'}.`}const tpl=S.cfg.sinteses[m.nome]||SINTESE_DEF[m.nome]||'Em {dom}, {oa} {aluno} obteve a menção de '+m.nome+'.';return tpl.replace(/\{dom\}/g,d.nome).replace(/\{oa\}/g,oa(a)).replace(/\{aluno\}/g,aluno_a(a)).replace(/\{nome\}/g,a.nome.split(' ')[0]).replace(/\{turma\}/g,a.origem||t.nome).replace(/\{disciplina\}/g,t.disciplina).replace(/\{periodo\}/g,per+'.º '+w).replace(/\{mencao\}/g,m.nome)}).filter(Boolean);
  if(per>1){const n1=ponderada(t,pctsPer(t,a.id,per-1)),n2=ponderada(t,pctsPer(t,a.id,per));
    if(n1!=null&&n2!=null){const d=(n2-n1)*(isSec(t)?20:100),u=isSec(t)?' valores':' pontos percentuais';
      parts.push(Math.abs(d)<(isSec(t)?.5:3)?`Relativamente ao ${per-1}.º ${w}, manteve um desempenho estável.`:d>0?`Relativamente ao ${per-1}.º ${w}, registou uma evolução positiva (+${nf(d)}${u}).`:`Relativamente ao ${per-1}.º ${w}, registou uma descida (−${nf(-d)}${u}), devendo reforçar o estudo.`)}}
  const ok=t.dominios.filter(d=>pf[d.id]!=null).sort((x,y)=>pf[y.id]-pf[x.id]);
  if(ok.length>1&&pf[ok[0].id]-pf[ok[ok.length-1].id]>.08)parts.push(`Pontos fortes: ${esc(ok[0].nome)}. A melhorar: ${esc(ok[ok.length-1].nome)}.`);
  return parts.join('\n\n');
}
function grafico(t,a,P){
  /* 0.924 · os domínios ocupam toda a largura (antes ficavam encostados à esquerda) e a legenda fica por cima da grelha */
  const D=t.dominios||[];const W=640,H=190,pl=34,pr=8,top=28,bot=26,ch=H-top-bot,gw=(W-pl-pr)/Math.max(1,D.length);const nb=Math.max(1,P.length);
  const bw=Math.min(54,gw*.72/nb),gap=Math.min(6,bw*.15);const cols=['#9fbbe0','#2f7fd0','#0a3d75'];const y=v=>top+ch-v*ch;let g='';
  D.forEach((d,i)=>{const cx=pl+gw*i+gw/2,tot=nb*bw+(nb-1)*gap;let x=cx-tot/2;
    P.forEach((p,k)=>{const v=domPer(t,a.id,d.id,p);if(v!=null){const vv=Math.max(0,Math.min(1,v));g+=`<rect x="${x.toFixed(1)}" y="${y(vv).toFixed(1)}" width="${bw.toFixed(1)}" height="${(vv*ch).toFixed(1)}" fill="${cols[k%3]}" rx="2"/><text x="${(x+bw/2).toFixed(1)}" y="${(y(vv)-4).toFixed(1)}" font-size="10" font-weight="700" text-anchor="middle" fill="#333">${Math.round(v*100)}</text>`}x+=bw+gap});
    g+=`<text x="${cx.toFixed(1)}" y="${H-bot+16}" font-size="11" font-weight="700" text-anchor="middle" fill="#333">${esc(d.ab)}</text>`});
  let lx=W-pr;const leg=P.slice().reverse().map((p,kk)=>{const k=P.length-1-kk;const tx=`${p}.º ${perW().slice(0,3).toLowerCase()}.`;lx-=tx.length*5.6+20;return `<rect x="${lx.toFixed(1)}" y="5" width="10" height="10" rx="2" fill="${cols[k%3]}"/><text x="${(lx+14).toFixed(1)}" y="14" font-size="10" fill="#333">${tx}</text>`}).join('');
  const grid=[0,50,100].map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${y(v/100)}" y2="${y(v/100)}" stroke="${v?'#e3e3e3':'#888'}" ${v?'stroke-dasharray="3 3"':''}/>${v?`<text x="${pl-5}" y="${y(v/100)+3}" font-size="9" text-anchor="end" fill="#555">${v}%</text>`:''}`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:190px">${grid}${g}${leg}</svg>`;
}
/* autoavaliação do aluno no relatório individual (o que o aluno respondeu, por domínio) */
/* assinatura no relatório: apara as margens brancas da imagem para ficar centrada e assente na linha */
const _assinCache=new Map();
document.addEventListener('load',e=>{const im=e.target;if(!im||!im.classList||!im.classList.contains('assinrel')||im.dataset.ap)return;im.dataset.ap='1';const k=im.src.length+':'+im.src.slice(-60);if(_assinCache.has(k)){im.src=_assinCache.get(k);return}
  try{const w=im.naturalWidth,h=im.naturalHeight;if(!w||!h)return;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=(y*w+x)*4;if(d[q+3]>40&&(d[q]+d[q+1]+d[q+2])<600){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
    if(x1<0||(x0<=2&&y0<=2&&x1>=w-3&&y1>=h-3)){_assinCache.set(k,im.src);return}const c2=document.createElement('canvas');c2.width=x1-x0+1;c2.height=y1-y0+1;c2.getContext('2d').drawImage(c,x0,y0,c2.width,c2.height,0,0,c2.width,c2.height);const u=c2.toDataURL('image/png');_assinCache.set(k,u);im.src=u}catch(_){}},true);
function relAuto(t,a,per){const AV=((a.autoavD||{})[per])||{};const dom=AV.dom||{};const nota=AV.nota||((a.autoav||{})[per])||'';
  const L=(t.dominios||[]).filter(d=>dom[d.id]);if(!L.length&&!nota&&!AV.forte&&!AV.melhorar)return '';
  const lab=k=>{const x=(typeof AUTO_N!=='undefined'?AUTO_N:[]).find(z=>String(z[0])===String(k));return x?x[1]:k};
  return `<div style="margin-top:10px;border:1px solid #c9d6e6;border-radius:4px;padding:6px 8px;font-size:12px;break-inside:avoid"><b style="color:#0a4f8f">Autoavaliação ${a.genero==='F'?'da aluna':'do aluno'}</b>
    ${L.length?`<div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;margin-top:4px">${L.map(d=>`<span>${esc(d.nome)}</span><b>${esc(lab(dom[d.id]))}</b>`).join('')}</div>`:''}
    ${nota?`<div style="margin-top:4px">Classificação que propõe: <b>${esc(nota)}</b></div>`:''}
    ${AV.forte?`<div style="margin-top:3px"><i>O que fiz bem:</i> ${esc(AV.forte)}</div>`:''}${AV.melhorar?`<div><i>O que posso melhorar:</i> ${esc(AV.melhorar)}</div>`:''}</div>`}
/* Registo de Autoavaliação no modelo do departamento (uma folha por aluno, todos os períodos), preenchido com os dados da app */
function regAutoav(t,a,perAte){const c={...S.cfg,...escolaDe(t)};const P=periodos();const D=t.dominios||[];const lab=k=>{const z=AUTO_N.find(q=>String(q[0])===String(k));return z?z:null};
  const crit=D.map(d=>esc(d.nome)+' – '+d.peso+'%').join(' + ');const nAv=p=>{const AV=((a.autoavD||{})[p])||{};return AV.nota||((a.autoav||{})[p])||''};
  const bloco=p=>{const feito=p<=perAte;const AV=((a.autoavD||{})[p])||{};const insts=t.instrumentos.filter(i=>+i.periodo===+p).sort((x,y)=>String(x.data||'').localeCompare(String(y.data||'')));
    const col=d=>{if(!feito)return [];return insts.map(i=>{const r=instDom(i,a.id,d.id);return r?{n:i.nome,v:pctD(t,r.pct)}:null}).filter(Boolean)};const C=D.map(col);const linhas=Math.max(3,...C.map(x=>x.length));
    const nota=feito?nAv(p):'';const np=feito?fmtNota(t,ponderada(t,pctsPer(t,a.id,p))):'';const q=+AV.alunoQ;const dt=feito&&q>1e11?new Date(q).toLocaleDateString('pt-PT'):'';
    const refl=feito?[AV.forte?'<b>O que fiz bem:</b> '+esc(AV.forte):'',AV.melhorar?'<b>O que posso melhorar:</b> '+esc(AV.melhorar):'',AV.compromisso?'<b>Compromisso:</b> '+esc(AV.compromisso):''].filter(Boolean).join(' &nbsp;·&nbsp; '):'';
    return `<div class="rgp"><div class="rgpt"><b>${perNome(p)}</b></div>
      <table class="rgt"><thead><tr>${D.map(d=>`<th>${esc(d.nome)} <span>(${d.peso}%)</span></th>`).join('')}</tr></thead><tbody>
      ${Array.from({length:linhas},(_,k)=>`<tr>${C.map(x=>`<td>${x[k]?`<span class="rgn">${esc(x[k].n)}</span><b>${x[k].v||'—'}</b>`:'&nbsp;'}</td>`).join('')}</tr>`).join('')}
      <tr class="rgav">${D.map(d=>{const z=feito&&lab((AV.dom||{})[d.id]);return `<td>${z?`<i style="background:${z[2]}"></i>${esc(z[1])}`:'<span class="rgvz">Autoavaliação: —</span>'}</td>`}).join('')}</tr></tbody></table>
      <div class="rgf"><div class="rgnota"><span>${perNome(p)} · Avaliação final</span><b>Nota: ${nota?esc(nota):'_______'}</b>${np?`<small>Classificação do professor: ${np}</small>`:''}</div>
        <div class="rgass"><span>Ass. Prof.</span><span class="rgl">${feito&&S.cfg.assinaturaImg?`<img src="${S.cfg.assinaturaImg}" class="assinrel" alt="">`:''}</span></div>
        <div class="rgass"><span>Ass. Aluno</span><span class="rgl">${dt?'<em>respondido na app</em>':''}</span></div>
        <div class="rgass rgd"><span>Data</span><span class="rgl">${dt}</span></div></div>
      <div class="rgc"><b>Comentário / Reflexão:</b> ${refl||''}</div></div>`};
  const ns=P.map(p=>p<=perAte?parseFloat(String(nAv(p)).replace(',','.')):NaN);const ok=ns.filter(x=>!isNaN(x));const fin=ok.length===P.length&&P.every(p=>p<=perAte)?Math.round(ok.reduce((s,x)=>s+x,0)/ok.length*10)/10:null;
  return `<section class="sheet rgsheet">
    <div class="hdr"><span class="hl">${c.logo?`<img src="${c.logo}" alt="">`:''}<span><b>${esc(c.escola||'')}</b><br>${esc(S.cfg.departamento||(S.cfg.grupo?'Grupo '+S.cfg.grupo:''))}</span></span><span style="text-align:right">Ano letivo ${esc((A()||{}).nome||'')}<br>${esc(CICLOS[t.ciclo]||'')}</span></div>
    <h1>Registo de Autoavaliação – ${esc(t.disciplina||'')}</h1><div class="sub">Critérios: ${crit}</div>
    <div class="rgal"><span><small>Aluno</small><b>${esc(a.nome)}</b></span><span><small>N.º</small><b>${esc(numAl(a))}</b></span><span><small>Turma</small><b>${esc(a.origem||t.nome)}</b></span></div>
    ${P.map(bloco).join('')}
    <div class="rgfin">${P.map((p,k)=>`${perNome(p).replace(/ .*/,'').replace('.º','.ºP')} <b>${!isNaN(ns[k])?String(ns[k]).replace('.',','):'___'}</b>`).join(' + ')} &nbsp;/ ${P.length} = <span>NOTA FINAL <b>${fin!=null?String(fin).replace('.',','):'_____'}</b></span></div></section>`}
function relatorio(t,a,per){
  const P=periodos().filter(p=>p<=per),c={...S.cfg,...escolaDe(t)};
  const meds=Object.entries(MEDIDAS).filter(([k])=>k!=='rec').map(([k,g])=>(a.medidas&&a.medidas[k]||[]).map(i=>g.l[i])).flat();
  const sint=(a.sintese&&a.sintese[per])||sintese(t,a,per);const nfin=ponderada(t,pctsFinal(t,a.id,per));
  return `<section class="sheet">
    <div class="hdr"><span class="hl">${c.logo?`<img src="${c.logo}" alt="">`:''}<span><b>${esc(c.escola||'')}</b><br>Ano letivo ${esc((A()||{}).nome||'')}</span></span><span style="text-align:right">${esc(t.disciplina)} · Turma ${esc(a.origem||t.nome)}${a.origem?' <span style="color:#666">(aulas em '+esc(t.nome)+')</span>':''}<br>${esc(CICLOS[t.ciclo]||'')}</span></div>
    <h1>Relatório Individual ${a.genero==='F'?'da Aluna':'do Aluno'}</h1><div class="sub">${perNome(per)}</div>
    <div class="sec">Dados ${a.genero==='F'?'da aluna':'do aluno'}</div>
    <div style="display:flex;gap:14px;align-items:flex-start">${fotoSrc(a)?`<img class="foto-al" src="${fotoSrc(a)}" alt="" style="width:39mm;height:48.75mm;object-fit:cover;border:1px solid #999;border-radius:3px">`:''}<div style="flex:1;min-width:0"><div class="kv"><b>Nome</b><span>${esc(a.nome)}</span><b>N.º</b><span>${esc(numAl(a))}${a.processo?' · <span class="sens">proc. '+esc(a.processo)+'</span>':''}</span>
      <b>Data de nascimento</b><span class="sens">${fmtD(a.nasc)||'—'} ${a.nasc?'('+idade(a.nasc)+' anos)':''}</span><b>ASE</b><span class="sens">${esc(a.ase)||'Não se aplica'}</span>
      <b>Encarregado de educação</b><span class="sens">${esc(a.eeNome)||'—'}</span><b>Contacto</b><span class="sens">${esc(a.eeContacto)||'—'}</span>
      <b>DL 54/2018</b><span class="sens" style="grid-column:span 3">${meds.length?esc(meds.join('; ')):'Não se aplica'}</span></div>${relAuto(t,a,per)}</div></div>
    <div class="sec">Avaliação por domínios</div>
    <table><thead><tr><th>Domínio</th><th class="c">Ponderação</th>${P.map(p=>`<th class="c">${perNome(p)}</th>`).join('')}<th class="c">Menção</th></tr></thead><tbody>
    ${t.dominios.map(d=>`<tr><td>${esc(d.nome)}</td><td class="c">${d.peso}%</td>${P.map(p=>`<td class="c">${pctD(t,domPer(t,a.id,d.id,p))||'—'}</td>`).join('')}<td class="c">${esc((mencao(t,pctsFinal(t,a.id,per)[d.id])||{}).nome||'—')}</td></tr>`).join('')}
    <tr><th>Nota do ${perW().toLowerCase()}</th><th></th>${P.map(p=>`<th class="c">${fmtNota(t,ponderada(t,pctsPer(t,a.id,p)))||'—'}</th>`).join('')}<th></th></tr>
    <tr><th>Classificação Final</th><th></th><th class="c" colspan="${P.length}" style="font-size:14px">${fmtNota(t,nfin)||'—'} ${nfin!=null?(isSec(t)?'valores':'· Nível '+nivel(t,nfin)):''}</th><th class="c">${esc((mencao(t,nfin)||{}).nome||'')}</th></tr></tbody></table>
    ${grafico(t,a,P)}
    <div class="sec">Síntese descritiva</div><div class="txt" contenteditable="true" data-sint="${a.id}">${esc(sint)}</div>
    ${(a.obsPer||{})[per]?`<div class="sec">Observações</div><div class="txt sens">${esc(a.obsPer[per])}</div>`:''}
    <div class="sign"><div style="position:relative">${S.cfg.assinaturaImg?`<img src="${S.cfg.assinaturaImg}" alt="Assinatura" class="assinrel" style="position:absolute;left:50%;bottom:100%;transform:translate(-50%,32%);height:13mm;max-width:78%;object-fit:contain;pointer-events:none">`:''}${esc(profRotulo()+(c.professor?' — '+profNome(c.professor):''))}</div><div>O(A) Encarregado(a) de Educação</div></div></section>`;
}

