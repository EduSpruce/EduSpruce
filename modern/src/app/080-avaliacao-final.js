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
  const ws=Math.round(t.dominios.reduce((s,d)=>s+(+d.peso||0),0)*1e6)/1e6;
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
      <td class="calc ${negativa(t,l.nf)?'neg':''}" style="font-size:14px">${fmtNota(t,l.nf)}${typeof notaDuvidaHtml==='function'?notaDuvidaHtml(t,l.nf):''}</td><td class="calc">${nivel(t,l.nf)}</td><td><input class="txtin atr ${(((t.atrib||{})[p]||{})[l.a.id]||'')!==''&&String(((t.atrib||{})[p]||{})[l.a.id])!==String(nivel(t,l.nf))?'dif':''}" data-atr value="${esc(((t.atrib||{})[p]||{})[l.a.id]||'')}" placeholder="${nivel(t,l.nf)}" inputmode="numeric" aria-label="Nível atribuído a ${esc(l.a.nome)}" ${t.bloq&&t.bloq[p]?'readonly':''}></td><td>${pillM(t,mencao(t,l.nf))}</td>
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

