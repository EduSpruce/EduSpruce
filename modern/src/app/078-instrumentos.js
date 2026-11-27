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
      <td><select data-f="dom">${domById(t,it.dom)?'':'<option value="">— sem domínio —</option>'}${domEsp(t).map(d=>`<option value="${d.id}" ${d.id===it.dom?'selected':''}>${esc(d.ab)} — ${esc(d.nome)}</option>`).join('')}</select></td>
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
  /* UFCD/módulo com um só critério específico no instrumento: a correção é só do teste — itens, cotações e nota, sem linhas nem colunas de critérios */
  const so1=typeof tUnid==='function'&&tUnid(t)&&t.dominios.filter(d=>!d.ger&&i.itens.some(x=>x.dom===d.id)).length<=1;const rs=so1?2:3;
  const doms=so1?[]:t.dominios.filter(d=>i.itens.some(x=>x.dom===d.id));const max=instMax(i);
  const groups=[];i.itens.forEach(it=>{const g=groups[groups.length-1];if(g&&g.dom===it.dom)g.n++;else groups.push({dom:it.dom,n:1})});
  $('#i-body').innerHTML=`<p class="hint noprint">Escreva as cotações obtidas. <b>Enter</b> desce, setas navegam. Linha toda em branco = “Não avaliado”. Não é possível passar da cotação de cada item.</p>
  <div class="gwrap"><table class="grid" id="grid"><thead>
    <tr><th class="stk0" rowspan="${rs}">N.º</th><th class="stk" rowspan="${rs}">Nome</th>${so1?i.itens.map(it=>`<th class="dh" title="${esc(it.rot)}"><span class="ith">${esc(it.rot)}</span></th>`).join(''):groups.map(g=>{const d=domById(t,g.dom)||{};return `<th colspan="${g.n}" class="cgnome" title="${esc(d.ab||'')}">${esc(d.nome||d.ab||'?')}${d.ger?' <small class="mut">(geral — classifica-se na Avaliação Final)</small>':''}</th>`}).join('')}<th rowspan="${rs}">Total<div class="dh">/${nf(max)}</div></th><th rowspan="${rs}">Nota${so1?`<div class="dh">${isSec(t)?'0–20':'%'}</div>`:''}</th><th rowspan="${rs}">Menção</th>${doms.map(d=>`<th rowspan="3" class="cgnome" title="${esc(d.ab)}">${esc(d.nome||d.ab)}<div class="dh">${isSec(t)?'0–20':'%'}</div></th>`).join('')}</tr>
    ${so1?'':`<tr>${i.itens.map(it=>`<th class="dh" title="${esc(it.rot)}"><span class="ith">${esc(it.rot)}</span></th>`).join('')}</tr>`}
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

