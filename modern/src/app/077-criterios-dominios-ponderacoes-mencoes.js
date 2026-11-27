/* =====================================================================
   CRITÉRIOS (domínios, ponderações, menções, regra)
   ===================================================================== */
function vCriterios(){
  const t=T();const ws=Math.round(t.dominios.reduce((s,d)=>s+(+d.peso||0),0)*1e6)/1e6;/* sem os restos das contas com décimas (11,1×8+11,2 dava 99,99999999999999) */const disc=minhasDisc();
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
    ${t.dominios.map((d,k)=>`<tr data-k="${k}"><td><div class="domab"><span class="domic" style="--dc:${domCor(t,d)}">${icDom(d,18)}</span><input type="color" class="domcor" data-dcor="${k}" value="${corHex(domCor(t,d))}" title="Cor do critério" aria-label="Cor de ${esc(d.nome)}"><input data-d="ab" value="${esc(d.ab)}"></div></td><td><input data-d="nome" value="${esc(d.nome)}">${d.grupo?`<div class="hint">${esc(d.grupo)}</div>`:''}</td><td><input data-d="peso" value="${esc(d.peso)}" inputmode="decimal"></td><td class="act"><button class="btn sm dng" data-dd="${k}">×</button></td></tr>`).join('')}
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

