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

