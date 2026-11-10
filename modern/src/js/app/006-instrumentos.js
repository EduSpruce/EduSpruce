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
      return `<tr data-irow="${i.id}"><td><b>${esc(i.nome)}</b></td><td class="mut">${esc(i.tipo)}</td><td>${fmtD(i.data)}</td><td>${i.itens.length} <span class="mut">(${nf(instMax(i))} pts)</span></td><td>${esc(ds)}</td><td>${v.length}/${al.length}</td><td>${m==null?'—':fmtNota(t,m)} ${pillM(t,mencao(t,m))}</td>
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
    </tbody><tfoot><tr><td class="stk0"></td><td class="stk">Média da Turma</td>${insts.map(i=>`<td>${pctD(t,avg(al.map(a=>{const x=instDom(i,a.id,d.id);return x&&x.pct})))}</td>`).join('')}${P.map(p=>`<td>${pctD(t,avg(al.map(a=>domPer(t,a.id,d.id,p))))}</td>`).join('')}<td></td></tr></tfoot></table></div>`:'<div class="empty">Nenhum instrumento avalia este domínio.</div>'}</div>`;
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
    <span class="sp1"></span><span class="hint">A síntese descritiva pode ser editada diretamente na folha.</span></div></div>
    <div class="sheetwrap">${sel.length?sel.map(a=>relatorio(t,a,UI.relPer)).join(''):'<div class="card empty">Sem alunos.</div>'}</div>`;
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
  const W=640,H=170,pad=30,bw=Math.min(44,(W-pad*2)/(t.dominios.length*(P.length+1)));const cols=['#9fbbe0','#2f7fd0','#0a3d75'];let x=pad+6,g='';
  t.dominios.forEach(d=>{P.forEach((p,k)=>{const v=domPer(t,a.id,d.id,p);const h=v==null?0:v*(H-pad-10);g+=`<rect x="${x}" y="${H-pad-h}" width="${bw-3}" height="${h}" fill="${cols[k%3]}" rx="2"/>`+(v!=null?`<text x="${x+(bw-3)/2}" y="${H-pad-h-3}" font-size="9" text-anchor="middle">${Math.round(v*100)}</text>`:'');x+=bw});
    g+=`<text x="${x-bw*P.length/2-1}" y="${H-pad+13}" font-size="10" text-anchor="middle">${esc(d.ab)}</text>`;x+=bw});
  const leg=P.map((p,k)=>`<rect x="${W-pad-80}" y="${6+k*13}" width="10" height="10" fill="${cols[k%3]}"/><text x="${W-pad-66}" y="${15+k*13}" font-size="10">${p}.º ${perW().slice(0,3).toLowerCase()}.</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:170px"><line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="#888"/>${[50,100].map(v=>`<line x1="${pad}" x2="${W-pad}" y1="${H-pad-v/100*(H-pad-10)}" y2="${H-pad-v/100*(H-pad-10)}" stroke="#ddd" stroke-dasharray="3 3"/><text x="${pad-4}" y="${H-pad-v/100*(H-pad-10)+3}" font-size="9" text-anchor="end">${v}%</text>`).join('')}${g}${leg}</svg>`;
}
function relatorio(t,a,per){
  const P=periodos().filter(p=>p<=per),c={...S.cfg,...escolaDe(t)};
  const meds=Object.entries(MEDIDAS).filter(([k])=>k!=='rec').map(([k,g])=>(a.medidas&&a.medidas[k]||[]).map(i=>g.l[i])).flat();
  const sint=(a.sintese&&a.sintese[per])||sintese(t,a,per);const nfin=ponderada(t,pctsFinal(t,a.id,per));
  return `<section class="sheet">
    <div class="hdr"><span class="hl">${c.logo?`<img src="${c.logo}" alt="">`:''}<span><b>${esc(c.escola||'')}</b><br>Ano letivo ${esc((A()||{}).nome||'')}</span></span><span style="text-align:right">${esc(t.disciplina)} · Turma ${esc(a.origem||t.nome)}${a.origem?' <span style="color:#666">(aulas em '+esc(t.nome)+')</span>':''}<br>${esc(CICLOS[t.ciclo]||'')}</span></div>
    <h1>Relatório Individual ${a.genero==='F'?'da Aluna':'do Aluno'}</h1><div class="sub">${perNome(per)}</div>
    <div class="sec">Dados ${a.genero==='F'?'da aluna':'do aluno'}</div>
    <div style="display:flex;gap:14px;align-items:flex-start">${fotoSrc(a)?`<img class="foto-al" src="${fotoSrc(a)}" alt="" style="width:52mm;height:65mm;object-fit:cover;border:1px solid #999;border-radius:3px">`:''}<div class="kv" style="flex:1"><b>Nome</b><span>${esc(a.nome)}</span><b>N.º</b><span>${esc(numAl(a))}${a.processo?' · <span class="sens">proc. '+esc(a.processo)+'</span>':''}</span>
      <b>Data de nascimento</b><span class="sens">${fmtD(a.nasc)||'—'} ${a.nasc?'('+idade(a.nasc)+' anos)':''}</span><b>ASE</b><span class="sens">${esc(a.ase)||'Não se aplica'}</span>
      <b>Encarregado de educação</b><span class="sens">${esc(a.eeNome)||'—'}</span><b>Contacto</b><span class="sens">${esc(a.eeContacto)||'—'}</span>
      <b>DL 54/2018</b><span class="sens" style="grid-column:span 3">${meds.length?esc(meds.join('; ')):'Não se aplica'}</span></div></div>
    <div class="sec">Avaliação por domínios</div>
    <table><thead><tr><th>Domínio</th><th class="c">Ponderação</th>${P.map(p=>`<th class="c">${perNome(p)}</th>`).join('')}<th class="c">Menção</th></tr></thead><tbody>
    ${t.dominios.map(d=>`<tr><td>${esc(d.nome)}</td><td class="c">${d.peso}%</td>${P.map(p=>`<td class="c">${pctD(t,domPer(t,a.id,d.id,p))||'—'}</td>`).join('')}<td class="c">${esc((mencao(t,pctsFinal(t,a.id,per)[d.id])||{}).nome||'—')}</td></tr>`).join('')}
    <tr><th>Nota do ${perW().toLowerCase()}</th><th></th>${P.map(p=>`<th class="c">${fmtNota(t,ponderada(t,pctsPer(t,a.id,p)))||'—'}</th>`).join('')}<th></th></tr>
    <tr><th>Classificação Final</th><th></th><th class="c" colspan="${P.length}" style="font-size:14px">${fmtNota(t,nfin)||'—'} ${nfin!=null?(isSec(t)?'valores':'· Nível '+nivel(t,nfin)):''}</th><th class="c">${esc((mencao(t,nfin)||{}).nome||'')}</th></tr></tbody></table>
    ${grafico(t,a,P)}
    <div class="sec">Síntese descritiva</div><div class="txt" contenteditable="true" data-sint="${a.id}">${esc(sint)}</div>
    ${(a.obsPer||{})[per]?`<div class="sec">Observações</div><div class="txt sens">${esc(a.obsPer[per])}</div>`:''}
    <div class="sign"><div>${esc(profRotulo()+(c.professor?' — '+profNome(c.professor):''))}</div><div>O(A) Encarregado(a) de Educação</div></div></section>`;
}

/* =====================================================================
   ESCOLA — dados e logotipo
   ===================================================================== */
const CAMPOS_ESCOLA=[['escola','Nome da Escola','Escola Básica e Secundária…'],['agrupamento','Agrupamento / Unidade Orgânica','(opcional)'],['codigo','Código da Escola','ex.: 1234567'],['morada','Morada',''],['localidade','Código Postal e Localidade','9500-000 Ponta Delgada'],['telefone','Telefone',''],['emailEscola','Endereço Eletrónico',''],['site','Sítio na Internet','https://']];
function logoDeFicheiro(file){return new Promise((ok,ko)=>{
  if(!/^image\//.test(file.type)&&!/\.(png|jpe?g|gif|webp|svg)$/i.test(file.name))return ko(new Error('Escolha uma imagem (PNG, JPG, SVG…).'));
  const fr=new FileReader();fr.onerror=()=>ko(new Error('Não foi possível ler a imagem.'));
  fr.onload=()=>{const url=fr.result;
    if(/svg/i.test(file.type)&&url.length<300000)return ok(url);
    const img=new Image();img.onload=()=>{const M=480,k=Math.min(1,M/Math.max(img.naturalWidth||M,img.naturalHeight||M));
      const c=document.createElement('canvas');c.width=Math.round((img.naturalWidth||M)*k);c.height=Math.round((img.naturalHeight||M)*k);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);ok(c.toDataURL('image/png'))};
    img.onerror=()=>ko(new Error('Imagem inválida.'));img.src=url};
  fr.readAsDataURL(file)})}
const logoHtml=(cls,e)=>{e=e||EC();return e.logo?`<span class="logo-esc ${cls||''} ${e.logoFundo===false?'sf':''}"><img src="${e.logo}" alt="Logotipo"></span>`:''};
function moradaEscola(e){const c=e||S.cfg;return [c.morada,c.localidade].filter(Boolean).join(' · ')}
/* =====================================================================
   v0.28 — ORGANIZAÇÃO GLOBAL (PERÍODOS/SEMESTRES), ESCOLAS E TIPOLOGIAS,
           MÓDULOS/UFCD, INTEGRIDADE DOS DADOS, INÍCIO DE SESSÃO
   ===================================================================== */
/* ---------- 1. Organização do ano letivo: global ---------- */
const diasLetivosCal=(c,ini,fim)=>Object.keys(c.dias||{}).filter(d=>d>=ini&&d<=fim&&LETIVOS.includes(c.dias[d])).length;
const letivosOrd=c=>Object.keys(c.dias||{}).filter(d=>LETIVOS.includes(c.dias[d])).sort();
function fimS1Def(c,P3){const L=letivosOrd(c);const y2=P3[P3.length-1].fim.slice(0,4);const lim=y2+'-01-31';const ant=L.filter(d=>d<=lim&&d>=P3[0].ini);return ant.length?ant[ant.length-1]:P3[0].fim}
function semestresDe(c){const P=c.periodos3;if(!P||!P.length)return c.periodos;const L=letivosOrd(c);const f1=c.fimS1||fimS1Def(c,P);const ini2=L.find(d=>d>f1)||P[P.length-1].ini;const fim=P[P.length-1].fim;
  return [{n:1,ini:P[0].ini,fim:f1,dias:diasLetivosCal(c,P[0].ini,f1)},{n:2,ini:ini2,fim,dias:diasLetivosCal(c,ini2,fim)}]}
function periodos3De(c){const P=c.periodos;const ini=P[0].ini,fim=P[P.length-1].fim;const L=letivosOrd(c);
  // cortes nas interrupções letivas mais longas (Natal e Páscoa)
  const intr=[];let cur=null;Object.keys(c.dias).sort().forEach(d=>{if(c.dias[d]==='interrupcao'){if(cur&&(dataDeIso(d)-dataDeIso(cur.f))/864e5<=4)cur.f=d;else{cur={i:d,f:d};intr.push(cur)}}});
  const cortes=intr.filter(x=>x.i>ini&&x.f<fim).sort((x,y)=>(dataDeIso(y.f)-dataDeIso(y.i))-(dataDeIso(x.f)-dataDeIso(x.i))).slice(0,2).sort((x,y)=>x.i.localeCompare(y.i));
  if(cortes.length<2)return P;const b=[ini];cortes.forEach(x=>{b.push(L.filter(d=>d<x.i).pop());b.push(L.find(d=>d>x.f))});b.push(fim);
  return [0,1,2].map(k=>({n:k+1,ini:b[2*k],fim:b[2*k+1],dias:diasLetivosCal(c,b[2*k],b[2*k+1])}))}
function ajustarOrgCalendario(a){const c=a&&a.calendario;if(!c||!c.periodos||!c.periodos.length)return;const sem=a.org==='semestre';
  if(sem){if(c.periodos.length===3)c.periodos3=c.periodos;if(c.periodos.length!==2&&c.periodos3)c.periodos=semestresDe(c)}
  else if(c.periodos.length!==3){c.periodos2=c.periodos;c.periodos=c.periodos3&&c.periodos3.length===3?c.periodos3:periodos3De(c)}}
function periodoDaData(a,iso){const c=a.calendario;if(!c||!iso)return null;const p=c.periodos.find(p=>iso>=p.ini&&iso<=p.fim)||c.periodos.find(p=>iso<p.ini)||c.periodos[c.periodos.length-1];return p?p.n:null}
function mudarOrg(a,novo){if(!a||a.org===novo)return;const n=novo==='semestre'?2:3;
  const TE=turmasFiltradas.call?a.turmas.filter(t=>escId(escolaDe(t))===escAtiva()):a.turmas;const usa3=TE.some(t=>t.instrumentos.some(i=>+i.periodo===3)||Object.keys(t.bloq||{}).includes('3')||Object.keys(t.atrib||{}).includes('3')||t.alunos.some(x=>['autoav','obsPer','sintese'].some(k=>x[k]&&x[k][3])));
  if(!confirm(`Mudar a organização de ${esc(a.nome)} para ${novo==='semestre'?'2 SEMESTRES':'3 PERÍODOS'}?\n\nA mudança é global: calendário escolar, contagens, aulas previstas, marcação de testes, avaliação intercalar, instrumentos, avaliação final, relatórios e reuniões passam a usar ${novo==='semestre'?'semestres':'períodos'}.${usa3&&novo==='semestre'?'\n\nHá dados no 3.º período: os instrumentos com data passam para o semestre dessa data; os restantes e as sínteses/observações do 3.º passam para o 2.º semestre; bloqueios e níveis atribuídos do 3.º período são removidos.':''}`))return;
  if(a.calendario&&!proprioEsc(a,'calendario'))a.calendario=JSON.parse(JSON.stringify(a.calendario));
  a.org=novo;ajustarOrgCalendario(a);const per=d=>periodoDaData(a,d);
  TE.forEach(t=>{t.instrumentos.forEach(i=>{const p=i.data&&a.calendario?per(i.data):null;if(p)i.periodo=p;else if(+i.periodo>n)i.periodo=n});
    t.regra=t.regra||{};if(n===3&&!t.regra[3])t.regra[3]=t.regra[2]||'media';
    ['bloq','atrib'].forEach(k=>{if(t[k])Object.keys(t[k]).forEach(p=>{if(+p>n)delete t[k][p]})});
    t.alunos.forEach(x=>['autoav','obsPer','sintese'].forEach(k=>{const o=x[k];if(!o)return;Object.keys(o).forEach(p=>{if(+p>n){if(!o[n])o[n]=o[p];delete o[p]}})}))});
  (a.datasAval||[]).forEach(d=>{if(d.data&&a.calendario)d.per=per(d.data);else if(+d.per>n)d.per=n});
  if(a.intercalar&&a.intercalar.periodos)a.intercalar.periodos=a.intercalar.periodos.filter(p=>p<=n);
  saveNow();toast('Organização: '+(novo==='semestre'?'2 semestres':'3 períodos')+' — aplicada a toda a app','ok');go(VIEW)}
function cartaoOrg(a){const c=a.calendario;const sem=a.org==='semestre';
  return (escAtiva()!=='principal'&&c&&!proprioEsc(a,'calendario')?`<div class="card"><div class="alert w" style="margin:0;display:flex;gap:10px;align-items:center;flex-wrap:wrap">${ic('info',16)} <span style="flex:1;min-width:220px"><b>${esc(nomeEscola(EC()))}</b> está a usar o calendário da escola principal (${esc(nomeEscola(S.cfg))}). As alterações aqui afetam as duas.</span><button class="btn sm" id="cal-prop">${ic('copy',14)} Criar Calendário Próprio</button><button class="btn sm" id="cal-prop-imp">${ic('upload',14)} Importar PDF desta Escola</button></div></div>`:'')+`<div class="card orgcard"><div class="row"><h2 style="margin:0">${ic('layers',18)} Organização do Ano Letivo</h2><span class="sp1"></span>
    <div class="seg">${[['periodo','calendar','3 Períodos'],['semestre','layers','2 Semestres']].map(([k,i,l])=>`<button data-org2="${k}" class="${(a.org||'periodo')===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div></div>
    <p class="hint" style="margin:10px 0 0">Escolha global para ${todasEscolas().length>1?esc(nomeEscola(EC()))+' em ':''}${esc(a.nome)}: calendário, contagens, aulas previstas, marcação de testes, avaliação intercalar, instrumentos, avaliação final, relatórios e reuniões.</p>
    ${sem&&c&&c.periodos3?`<div class="row" style="margin-top:12px;gap:10px;align-items:flex-end"><div><label>Último dia do 1.º semestre</label><input type="date" id="org-f1" value="${c.periodos[0].fim}" min="${c.periodos3[0].ini}" max="${c.periodos3[c.periodos3.length-1].fim}"></div><span class="hint">O calendário importado tem 3 períodos; os semestres são calculados a partir dele (${c.periodos.map(p=>p.n+'.º: '+fmtIso(p.ini)+'–'+fmtIso(p.fim)+' · '+p.dias+' dias').join(' · ')}).</span></div>`:''}</div>`}
function bindOrg(a){$$('[data-org2]').forEach(b=>b.onclick=()=>mudarOrg(a,b.dataset.org2));const f=$('#org-f1');if(f)f.onchange=()=>{a.calendario.fimS1=f.value;a.calendario.periodos=semestresDe(a.calendario);saveNow();go(VIEW);toast('Semestres recalculados','ok')}}

/* ---------- 2. Escolas e tipologias ---------- */
const TIPOS_ESCOLA={regular:{n:'Ensino Regular',d:'Básico e secundário: disciplinas, períodos ou semestres, níveis 1–5 / 0–20; ofertas Regular e PROFIJ (por UFCD).',ofertas:['regular','profij'],ic:'school'},
  profissional:{n:'Escola Profissional',d:'Cursos profissionais organizados por módulos (horas, classificação 0–20, aprovação ≥ 10), anos de formação e componentes de formação.',ofertas:['profissional'],ic:'award'}};
OFERTAS.profissional={nome:'Curso Profissional',cor:'#b8860b'};
const escolas=()=>S.escolas=S.escolas||[];
const escolaDe=t=>(t&&t.escola&&t.escola!=='principal'&&escolas().find(e=>e.id===t.escola))||S.cfg;
const EC=()=>escolaPorId(escAtiva());
const escId=e=>e===S.cfg?'principal':e.id;
const tipoEscola=e=>(e&&e.tipoEscola)||'regular';
const todasEscolas=()=>[S.cfg,...escolas()];
const nomeEscola=e=>(e&&e.escola)||(e===S.cfg?'Escola principal':'Escola sem nome');
const ofertasDaEscola=e=>TIPOS_ESCOLA[tipoEscola(e)].ofertas;
const ehModular=t=>!!t&&(ofertaDe(t)==='profij'||ofertaDe(t)==='profissional');
const unidMod=t=>ofertaDe(t)==='profij'?{s:'UFCD',p:'UFCD',art:'a',um:'UFCD'}:{s:'Módulo',p:'Módulos',art:'o',um:'módulo'};
function escolaSelect(id,cur){const L=todasEscolas();if(L.length<2)return '';return `<div style="margin-bottom:10px"><label>Escola</label><select id="${id}">${L.map(e=>`<option value="${escId(e)}" ${escId(e)===(cur||'principal')?'selected':''}>${esc(nomeEscola(e))} · ${TIPOS_ESCOLA[tipoEscola(e)].n}</option>`).join('')}</select></div>`}
const escolaPorId=id=>!id||id==='principal'?S.cfg:(escolas().find(e=>e.id===id)||S.cfg);

/* ---------- 3. Módulos / UFCD (cursos profissionais e PROFIJ) ---------- */
const notaMod=(t,aid,mid)=>{const v=((t.notasMod||{})[aid]||{})[mid];return v==null||v===''?notaModAuto(t,aid,mid):+v};
function modEstado(t,aid,m){const n=notaMod(t,aid,m.id);if(n!=null)return n>=10?'ok':'neg';if(m.fim&&m.fim<isoData(new Date()))return 'atraso';return 'curso'}
function resumoModAluno(t,aid){const M=t.modulos||[];let ok=0,h=0,atr=0,s=0,nn=0;M.forEach(m=>{const e=modEstado(t,aid,m);const n=notaMod(t,aid,m.id);if(e==='ok'){ok++;h+=+m.horas||0}if(e==='atraso'||e==='neg')atr++;if(n!=null&&n>=10){s+=n*(+m.horas||1);nn+=(+m.horas||1)}});
  return {ok,tot:M.length,h,ht:M.reduce((x,m)=>x+(+m.horas||0),0),atr,media:nn?s/nn:null}}
function notaModDeInstrumentos(t,aid,mid){const L=t.instrumentos.filter(i=>i.modulo===mid);if(!L.length)return null;const v=L.map(i=>{const x=instTotal(i,aid),M=instMax(i);return x!=null&&M?x/M*20:null}).filter(x=>x!=null);return v.length?Math.round(avg(v)*10)/10:null}
function vModulos(){const t=T();if(!t)return go('turmas');const U=unidMod(t);t.modulos=t.modulos||[];t.notasMod=t.notasMod||{};const al=alunosAval(t);const M=t.modulos;const hj=isoData(new Date());
  if(!ehModular(t)){$('#view').innerHTML=`<div class="card empty">${ic('layers',30)}<br><b>Esta turma não é modular</b><br><span class="mut">Os módulos/UFCD existem nas turmas de cursos profissionais (escola profissional) e PROFIJ.</span></div>`;return}
  barBtns([{id:'b-mn',t:ic('plus',15)+' '+U.s,c:'pri',f:()=>moduloDlg(t)},{id:'b-mcol',t:ic('paste',15)+' Colar Lista…',f:()=>colarModulosDlg(t)},{id:'b-mcsv',t:ic('download',15)+' Exportar CSV',f:()=>download(U.p+' '+t.nome+'.csv',csv([['N.º','Nome',...M.map(m=>(m.cod||'')+' '+m.nome),U.p+' concluíd'+(U.art==='a'?'as':'os'),'Horas','Média'],...al.map(a=>{const r=resumoModAluno(t,a.id);return [a.num,a.nome,...M.map(m=>notaMod(t,a.id,m.id)??''),r.ok+'/'+r.tot,r.h,r.media!=null?r.media.toFixed(1):'']})]),'text/csv')},{id:'b-mpr',t:ic('printer',15)+' Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  const RA=al.map(a=>({a,r:resumoModAluno(t,a.id)}));const conc=M.filter(m=>al.length&&al.every(a=>notaMod(t,a.id,m.id)!=null)).length;const atr=RA.reduce((s,x)=>s+x.r.atr,0);
  const kpis=`<div class="kpis"><div class="kpi"><div class="l">${ic('layers',14)} ${U.p}</div><div class="v">${M.length}</div><div class="mut">${M.reduce((s,m)=>s+(+m.horas||0),0)} horas no total</div></div>
    <div class="kpi"><div class="l">${ic('check',14)} Avaliad${U.art}s</div><div class="v">${conc}</div><div class="mut">com classificação de todos os alunos</div></div>
    <div class="kpi"><div class="l">${ic('alert',14)} Em Atraso / Não Aprovad${U.art}s</div><div class="v">${atr}</div><div class="mut">${U.p.toLowerCase()} por recuperar (soma dos alunos)</div></div>
    <div class="kpi"><div class="l">${ic('chart',14)} Média da Turma</div><div class="v">${(v=>v.length?avg(v).toFixed(1):'—')(RA.map(x=>x.r.media).filter(x=>x!=null))}</div><div class="mut">ponderada pelas horas (aprovad${U.art}s)</div></div></div>`;
  const lista=`<div class="card"><div class="row"><h2 style="margin:0">${ic('layers',18)} ${U.p} de ${esc(t.disciplina)}</h2><span class="sp1"></span><span class="mut">${esc(ofertaDe(t)==='profij'?'PROFIJ — Unidades de Formação de Curta Duração':(t.curso?'Curso Profissional de '+t.curso:'Curso Profissional'))}${t.anoForm?' · '+esc(t.anoForm)+' ano de formação':''}</span></div>
    ${M.length?`<div class="tblw"><table class="lst modlst"><thead><tr><th>${ofertaDe(t)==='profij'?'Código':'N.º'}</th><th>Designação</th><th>Horas</th><th>Início</th><th>Fim previsto</th><th>Instrumentos</th><th>Aprovados</th><th></th></tr></thead><tbody>
      ${M.map(m=>{const ap=al.filter(a=>(notaMod(t,a.id,m.id)??-1)>=10).length;const ni=t.instrumentos.filter(i=>i.modulo===m.id).length;return `<tr><td><b>${esc(m.cod||'')}</b></td><td>${esc(m.nome)}</td><td>${esc(m.horas||'')}</td><td>${fmtIso(m.ini)||'—'}</td><td class="${m.fim&&m.fim<hj&&ap<al.length?'neg':''}">${fmtIso(m.fim)||'—'}</td><td>${ni||'—'}</td><td><div class="pbar sm"><span style="width:${al.length?Math.round(100*ap/al.length):0}%"></span></div><span class="mut">${ap}/${al.length}</span></td>
        <td class="act"><div class="acts"><button class="btn sm" data-mcalc="${m.id}" title="Calcular a partir dos instrumentos associados">${ic('calc',14)}</button><button class="btn sm ico" data-med="${m.id}" aria-label="Editar">${ic('pencil',14)}</button></div></td></tr>`}).join('')}</tbody></table></div>`
      :`<div class="empty" style="padding:24px 0">${ic('layers',28)}<br><b>Ainda sem ${U.p.toLowerCase()}</b><br><span class="mut">Acrescente ${U.art==='a'?'as':'os'} ${U.p.toLowerCase()} ${U.art==='a'?'(código, designação e horas)':'(número, designação e horas)'} — um a um ou colando a lista.</span></div>`}</div>`;
  const grelha=M.length&&al.length?`<div class="card"><div class="row"><h2 style="margin:0">${ic('grid',18)} Classificações por ${U.s}</h2><span class="sp1"></span><span class="mut">0–20 · aprovação ≥ 10 · vazio = por avaliar</span></div>
    <div class="tblw"><table class="grid modgrid"><thead><tr><th class="stk0">N.º</th><th class="stk">Nome</th>${M.map(m=>`<th title="${esc(m.nome)}">${esc(m.cod||m.nome.slice(0,10))}<br><span class="mut">${esc(m.horas||'')}h</span></th>`).join('')}<th>Concl.</th><th>Horas</th><th>Média</th></tr></thead><tbody>
    ${RA.map(({a,r})=>`<tr data-a="${a.id}"><td class="n stk0">${esc(numAl(a))}</td><td class="stk">${esc(a.nome)}</td>${M.map(m=>{const n=notaMod(t,a.id,m.id);const e=modEstado(t,a.id,m);return `<td class="mc ${e}"><input data-mn="${a.id}|${m.id}" value="${n??''}" inputmode="decimal" aria-label="${esc(m.nome)}"></td>`}).join('')}
      <td><b>${r.ok}</b>/${r.tot}</td><td>${r.h}/${r.ht}</td><td><b>${r.media!=null?r.media.toFixed(1):'—'}</b></td></tr>`).join('')}</tbody></table></div>
    <div class="rleg"><span><i style="background:#1a7f37"></i>Aprovad${U.art}</span><span><i style="background:#d93025"></i>Não aprovad${U.art}</span><span><i style="background:#e8a400"></i>Em atraso (fim previsto ultrapassado)</span></div></div>`:'';
  $('#view').innerHTML=kpis+lista+grelha;
  $$('[data-med]').forEach(b=>b.onclick=()=>moduloDlg(t,M.find(m=>m.id===b.dataset.med)));
  $$('[data-mcalc]').forEach(b=>b.onclick=()=>{const mid=b.dataset.mcalc;let n=0;al.forEach(a=>{const v=notaModDeInstrumentos(t,a.id,mid);if(v!=null){(t.notasMod[a.id]=t.notasMod[a.id]||{})[mid]=v;n++}});
    if(!n)return toast('Não há instrumentos com classificações associados a '+(U.art==='a'?'esta ':'este ')+U.um+' (associe-os em Instrumentos).');saveNow();vModulos();toast(n+' classificações calculadas a partir dos instrumentos','ok')});
  $$('[data-mn]').forEach(i=>i.addEventListener('change',()=>{const [aid,mid]=i.dataset.mn.split('|');const v=i.value.trim().replace(',','.');
    if(v!==''&&(isNaN(+v)||+v<0||+v>20)){toast('Classificação de 0 a 20','erro');i.value='';return}(t.notasMod[aid]=t.notasMod[aid]||{})[mid]=v===''?null:+v;save();const td=i.parentElement;td.className='mc '+modEstado(t,aid,M.find(m=>m.id===mid))}))}
function moduloDlg(t,m){const U=unidMod(t);const ed=!!m;m=m||{id:uid(),cod:ofertaDe(t)==='profij'?'':String((t.modulos||[]).length+1),nome:'',horas:ofertaDe(t)==='profij'?25:'',ini:'',fim:''};
  openDrawer(ed?'Editar '+U.s:'Nov'+(U.art)+' '+U.s,`<div class="ed"><div class="g2"><div><label>${ofertaDe(t)==='profij'?'Código da UFCD':'N.º do módulo'}</label><input id="mo-cod" value="${esc(m.cod)}"></div><div><label>Horas</label><input id="mo-h" value="${esc(m.horas)}" inputmode="numeric"></div>
    <div style="grid-column:1/-1"><label>Designação</label><input id="mo-n" value="${esc(m.nome)}" placeholder="${ofertaDe(t)==='profij'?'ex.: Comunicação em língua inglesa':'ex.: Módulo 1 — Comunicação'}"></div>
    <div><label>Início</label><input type="date" id="mo-i" value="${m.ini||''}"></div><div><label>Fim previsto</label><input type="date" id="mo-f" value="${m.fim||''}"></div></div>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="mo-ok">${ic('check',15)} Guardar</button>${ed?`<span class="sp1"></span><button class="btn dng" id="mo-del">${ic('trash',15)} Apagar</button>`:''}</div></div>`);
  $('#mo-ok').onclick=()=>{const n=$('#mo-n').value.trim();if(!n)return alert('Indique a designação.');Object.assign(m,{cod:$('#mo-cod').value.trim(),nome:n,horas:+$('#mo-h').value||'',ini:$('#mo-i').value,fim:$('#mo-f').value});if(!ed)(t.modulos=t.modulos||[]).push(m);saveNow();closeDrawer();vModulos()};
  if(ed)$('#mo-del').onclick=()=>{if(!confirm('Apagar '+(U.art==='a'?'a ':'o ')+U.um+' “'+m.nome+'” e as respetivas classificações?'))return;t.modulos=t.modulos.filter(x=>x!==m);Object.values(t.notasMod||{}).forEach(o=>delete o[m.id]);t.instrumentos.forEach(i=>{if(i.modulo===m.id)delete i.modulo});saveNow();closeDrawer();vModulos()}}
function colarModulosDlg(t){const U=unidMod(t);openDrawer('Colar Lista de '+U.p,`<div class="ed"><p class="hint" style="margin-top:0">Uma linha por ${U.um}: <b>código ; designação ; horas</b> (também aceita tabulações, copiadas do Excel, ou “código - designação - horas”).</p>
  <textarea id="mo-txt" rows="10" placeholder="${ofertaDe(t)==='profij'?'6652;Comunicação em língua inglesa;25\n6653;Inglês técnico;25':'1;Comunicar em inglês;30\n2;Interação em contexto profissional;30'}"></textarea><div class="row" style="margin-top:12px"><button class="btn pri" id="mo-ok">${ic('check',15)} Acrescentar</button></div></div>`);
  $('#mo-ok').onclick=()=>{const L=$('#mo-txt').value.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split(/\t|;|\s+-\s+|\s+–\s+/).map(x=>x.trim());const h=p.length>2&&/^\d+$/.test(p[p.length-1])?+p.pop():'';const cod=p.length>1?p.shift():'';return {id:uid()+Math.random().toString(36).slice(2,5),cod:cod.replace(/^UFCD\s*/i,''),nome:p.join(' - '),horas:h,ini:'',fim:''}}).filter(m=>m.nome);
    if(!L.length)return alert('Não foi encontrada nenhuma linha válida.');(t.modulos=t.modulos||[]).push(...L);saveNow();closeDrawer();vModulos();toast(L.length+' '+(L.length===1?U.um:U.p.toLowerCase())+' acrescentad'+U.art+(L.length===1?'':'s'),'ok')}}

/* ---------- 4. Verificação da integridade dos dados ---------- */
function verificarIntegridade(corrigir){const P=[];const add=(g,t,fix)=>P.push({g,t,fix});let fixes=0;const F=fn=>{if(corrigir){fn();fixes++}};
  const ids=new Map();const dup=(id,o)=>{if(!id)return false;if(ids.has(id))return true;ids.set(id,o);return false};
  if(!Array.isArray(S.anos))add('erro','Estrutura inválida: lista de anos letivos em falta.');
  if(S.anoAtivo&&!S.anos.some(a=>a.id===S.anoAtivo))add('aviso','O ano letivo ativo não existe.',()=>F(()=>S.anoAtivo=(S.anos[0]||{}).id||null));
  const escIds=new Set(['principal',...escolas().map(e=>e.id)]);
  S.anos.forEach(a=>{prepAno(a);const An=a.nome;if(dup(a.id,a))add('erro',`Ano ${An}: identificador repetido.`,()=>F(()=>a.id=uid()));
    if(!['periodo','semestre'].includes(a.org))add('aviso',`${An}: organização inválida.`,()=>F(()=>a.org='periodo'));
    const c=a.calendario;const n=a.org==='semestre'?2:3;
    if(c&&c.periodos&&c.periodos.length!==n)add('erro',`${An}: o calendário tem ${c.periodos.length} períodos/semestres, mas o ano está organizado em ${n===2?'semestres':'períodos'}.`,()=>F(()=>ajustarOrgCalendario(a)));
    if(c&&c.periodos)c.periodos.forEach(p=>{if(!p.ini||!p.fim||p.ini>p.fim)add('erro',`${An}: ${p.n}.º ${n===2?'semestre':'período'} com datas inválidas.`)});
    const TI=new Set(a.turmas.map(t=>t.id));
    if(S.turmaAtiva&&a.id===S.anoAtivo&&!TI.has(S.turmaAtiva))add('aviso','A turma ativa não existe neste ano.',()=>F(()=>S.turmaAtiva=null));
    a.turmas.forEach(t=>comEscola(escId(escolaDe(t)),()=>{const c=a.calendario;const n=a.org==='semestre'?2:3;const nm=`${An} · ${esc(t.nome)} · ${t.disciplina}`;if(dup(t.id,t))add('erro',nm+': identificador repetido.',()=>F(()=>t.id=uid()));
      if(t.escola&&!escIds.has(t.escola))add('erro',nm+': associada a uma escola que já não existe.',()=>F(()=>delete t.escola));
      if(t.escola&&!ofertasDaEscola(escolaDe(t)).includes(ofertaDe(t)))add('aviso',nm+`: a oferta “${OFERTAS[ofertaDe(t)].nome}” não corresponde à tipologia da escola (${TIPOS_ESCOLA[tipoEscola(escolaDe(t))].n}).`,()=>F(()=>t.oferta=ofertasDaEscola(escolaDe(t))[0]));
      ['alunos','instrumentos','dominios','mencoes'].forEach(k=>{if(!Array.isArray(t[k]))add('erro',nm+': lista “'+k+'” em falta.',()=>F(()=>t[k]=[]))});
      const AI=new Set((t.alunos||[]).map(x=>x.id)),DI=new Set((t.dominios||[]).map(d=>d.id));
      const ws=(t.dominios||[]).reduce((s,d)=>s+(+d.peso||0),0);if(t.dominios&&t.dominios.length&&Math.round(ws)!==100)add('aviso',nm+`: as ponderações dos domínios somam ${ws}%.`,()=>F(()=>normalizarPesos(t)));
      const nums={};(t.alunos||[]).forEach(x=>{if(dup(x.id,x))add('erro',nm+`: aluno ${esc(x.nome)} com identificador repetido.`,()=>F(()=>x.id=uid()+Math.random().toString(36).slice(2,5)));
        if(!x.nome||!String(x.nome).trim())add('aviso',nm+': há um aluno sem nome.');if(x.num&&!t.origens){const k=String(x.num);if(nums[k])add('aviso',nm+`: número ${k} repetido (${nums[k]} e ${esc(x.nome)}).`);nums[k]=x.nome}
        if(x.foto&&x.foto.startsWith('f:')&&!FOTOS[x.foto.slice(2)])add('aviso',nm+`: a fotografia de ${esc(x.nome)} está em falta.`,()=>F(()=>x.foto=''));
        if(x.nasc&&(!/^(19|20)\d{2}-\d{2}-\d{2}$/.test(x.nasc)||+x.nasc.slice(0,4)>new Date().getFullYear()))add('aviso',nm+`: data de nascimento inválida (${esc(x.nome)}).`,()=>F(()=>x.nasc=''))});
      (t.instrumentos||[]).forEach(i=>{const II=new Set((i.itens||[]).map(x=>x.id));const inm=nm+' · '+i.nome;if(dup(i.id,i))add('erro',inm+': identificador repetido.',()=>F(()=>i.id=uid()));
        if(i.periodo&&(+i.periodo<1||+i.periodo>n)){const pd=i.data&&c?periodoDaData(a,i.data):Math.min(n,Math.max(1,+i.periodo));add('erro',inm+`: está no ${i.periodo}.º período, que não existe na organização atual.`,()=>F(()=>i.periodo=pd))}
        if(i.data&&c&&i.periodo&&periodoDaData(a,i.data)!==+i.periodo){const pd=periodoDaData(a,i.data);add('aviso',inm+`: a data (${fmtIso(i.data)}) é do ${pd}.º ${n===2?'semestre':'período'}, mas o instrumento está no ${i.periodo}.º.`,()=>F(()=>i.periodo=pd))}
        (i.itens||[]).forEach(it=>{if(it.dom&&!DI.has(it.dom))add('aviso',inm+`: o item ${it.rot||''} está ligado a um domínio que já não existe.`,()=>F(()=>it.dom=(t.dominios[0]||{}).id||''))});
        if(i.modulo&&!(t.modulos||[]).some(m=>m.id===i.modulo))add('aviso',inm+': associado a um módulo/UFCD que já não existe.',()=>F(()=>delete i.modulo));
        Object.keys(i.notas||{}).forEach(aid=>{if(!AI.has(aid))add('info',inm+': classificações de um aluno que já não está na turma.',()=>F(()=>delete i.notas[aid]));else Object.keys(i.notas[aid]||{}).forEach(iid=>{if(!II.has(iid))add('info',inm+': classificação de um item apagado.',()=>F(()=>delete i.notas[aid][iid]))})})});
      Object.keys(t.notasMod||{}).forEach(aid=>{if(!AI.has(aid))add('info',nm+': classificações de módulos de um aluno que já não está na turma.',()=>F(()=>delete t.notasMod[aid]))});
      Object.keys(t.atrib||{}).forEach(p=>{if(+p>n)add('aviso',nm+`: níveis atribuídos no ${p}.º período, que não existe.`,()=>F(()=>delete t.atrib[p]))})}));
    Object.entries((a.horProf||{}).mapa||{}).forEach(([k,v])=>{if(v&&!TI.has(v))add('aviso',`${An}: o horário do professor associa “${k}” a uma turma apagada.`,()=>F(()=>a.horProf.mapa[k]=''))});
    (a.datasAval||[]).forEach(d=>{if(d.turma&&!TI.has(d.turma))add('aviso',`${An}: data de avaliação de uma turma apagada.`,()=>F(()=>a.datasAval=a.datasAval.filter(x=>x!==d)));if(d.per&&+d.per>n)add('aviso',`${An}: data de avaliação no ${d.per}.º período, que não existe.`,()=>F(()=>d.per=d.data&&c?periodoDaData(a,d.data):n))});
    (a.faltasProf||[]).forEach(f=>{if(!TI.has(f.turma))add('info',`${An}: falta do professor numa turma apagada.`,()=>F(()=>a.faltasProf=a.faltasProf.filter(x=>x!==f)))});
    (a.reunioes||[]).forEach(r=>{[...(r.turmas||[]),...(r.turma?[r.turma]:[])].forEach(id=>{if(!TI.has(id))add('info',`${An}: a reunião “${esc(r.titulo||REUN_T[r.tipo]&&REUN_T[r.tipo].n)}” refere uma turma apagada.`,()=>F(()=>{r.turmas=(r.turmas||[]).filter(x=>TI.has(x));if(r.turma&&!TI.has(r.turma))r.turma=null}))});
      if(!r.data||!/^\d{4}-\d{2}-\d{2}$/.test(r.data))add('erro',`${An}: reunião sem data válida.`);if(r.ini!=null&&r.fim!=null&&r.fim<=r.ini)add('aviso',`${An}: reunião “${esc(r.titulo||'')}” termina antes de começar.`,()=>F(()=>r.fim=r.ini+60))})});
  const fotosUsadasSet=new Set();S.anos.forEach(a=>a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.foto&&x.foto.startsWith('f:'))fotosUsadasSet.add(x.foto.slice(2))})));const orf=Object.keys(FOTOS).filter(k=>!k.startsWith('doc:')&&!fotosUsadasSet.has(k));
  if(orf.length)add('info',`${orf.length} fotografia(s) guardada(s) que já não pertencem a nenhum aluno (ocupam espaço).`,()=>F(()=>orf.forEach(k=>{delete FOTOS[k];try{IDB&&IDB.transaction('fotos','readwrite').objectStore('fotos').delete(k)}catch(_){}})));
  try{const kb=Math.round(JSON.stringify(S).length/1024);if(kb>4000)add('aviso',`Os dados ocupam ${kb} KB — perto do limite do armazenamento do navegador. Exporte uma cópia de segurança.`)}catch(_){add('erro','Os dados não podem ser convertidos para JSON (estrutura circular ou corrompida).')}
  if(corrigir){P.forEach(p=>p.fix&&p.fix());saveNow()}
  return P}
function cartaoIntegridade(){const P=UI.integ;const G={erro:['#d93025','Erros'],aviso:['#e8a400','Avisos'],info:['#2f7fd0','Informação']};
  return `<div class="card" id="integ"><div class="row"><h2 style="margin:0">${ic('shield',18)} Integridade dos Dados</h2><span class="sp1"></span><button class="btn" id="in-ver">${ic('search',15)} Verificar Agora</button>${P&&P.some(p=>p.fix)?`<button class="btn pri" id="in-fix">${ic('check',15)} Corrigir Automaticamente (${P.filter(p=>p.fix).length})</button>`:''}</div>
    <p class="hint" style="margin:10px 0 0">Procura identificadores repetidos, ligações partidas (alunos, itens, domínios, turmas, escolas, módulos), períodos inexistentes na organização atual, datas inválidas, ponderações erradas e fotografias perdidas ou órfãs. Antes de corrigir é feita uma cópia automática (pode anular com ⌘Z).</p>
    ${P?(P.length?`<div class="integ">${['erro','aviso','info'].map(g=>{const L=P.filter(p=>p.g===g);return L.length?`<div class="ig"><b style="color:${G[g][0]}">${G[g][1]} (${L.length})</b>${L.slice(0,40).map(p=>`<div class="rav ${g}"><span class="rdot"></span><span>${esc(p.t)}</span>${p.fix?'<span class="tag">corrigível</span>':''}</div>`).join('')}${L.length>40?`<div class="mut">… e mais ${L.length-40}</div>`:''}</div>`:''}).join('')}</div>`:`<div class="alert ok" style="margin-top:12px">${ic('check',15)} Nenhum problema encontrado — os dados estão íntegros (${S.anos.length} anos letivos, ${S.anos.reduce((s,a)=>s+a.turmas.length,0)} turmas, ${S.anos.reduce((s,a)=>s+a.turmas.reduce((x,t)=>x+t.alunos.length,0),0)} alunos).</div>`):''}</div>`}
function bindIntegridade(){const v=$('#in-ver');if(v)v.onclick=()=>{UI.integ=verificarIntegridade(false);vDefinicoes();setTimeout(()=>$('#integ')&&$('#integ').scrollIntoView({block:'start',behavior:'smooth'}),50)};
  const f=$('#in-fix');if(f)f.onclick=()=>{const n=UI.integ.filter(p=>p.fix).length;if(!confirm('Corrigir automaticamente '+n+' problema(s)?'))return;try{localStorage.setItem(KEY+'.bak',JSON.stringify(S));localStorage.setItem(KEY+'.bakd',new Date().toLocaleString('pt-PT'))}catch(_){}
    verificarIntegridade(true);UI.integ=verificarIntegridade(false);vDefinicoes();toast(n+' correções aplicadas','ok')}}

