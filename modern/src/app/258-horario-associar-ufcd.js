/* =====================================================================
   1.123 — Horário da turma (PROFIJ): associar UFCD à pauta
   «Componente Tecnológica (UFCD)» diretamente no cartão «Disciplina Nesta
   Turma», a partir do referencial do curso (Catálogo) ou escrevendo-as.
   A sigla «UFCD» do horário é reconhecida automaticamente nessa pauta.
   ===================================================================== */
{const _sd=siglasDaDisciplina;siglasDaDisciplina=function(h,disc){const r=_sd.apply(this,arguments);if(r.length||!h||!ehComp(disc))return r;
  const uc=disc===UC_N;return h.legenda.filter(l=>uc?/^UC$|unidades? de compet/i.test(normT(l.ab)+'|'+normT(l.nome)):/^ufcd$|curta dura/i.test(normT(l.ab))||/curta dura/i.test(normT(l.nome))).map(l=>l.ab)}}
function htUfcdCard(t){const M=t.modulos=t.modulos||[];const cc=t.cnq||null;const UL=cc?((cnqM().uf[cc.id]||{}).L||null):null;
  if(cc&&!UL&&!htUfcdCard._a){htUfcdCard._a=1;cnqCarregarUfcd(cc).then(()=>{htUfcdCard._a=0;if(VIEW==='horario')manterPosicao(vHorario)}).catch(()=>{htUfcdCard._a=-1;if(VIEW==='horario')manterPosicao(vHorario)})}
  const tem=cod=>M.some(m=>String(m.cod)===String(cod));const lista=UL?UL.filter(u=>u.k==='UFCD'):[];const extra=M.filter(m=>!lista.some(u=>String(u.cod)===String(m.cod)));
  return `<div class="htu"><h3>${ic('layers',16)} UFCD desta pauta <span class="mut">${M.length}</span></h3>
    <p class="hint" style="margin-top:0">Assinale as UFCD que leciona nesta turma${cc?` — referencial de <b>${esc(cc.nome)}</b>`:''}. Cada UFCD fica com horas, datas, instrumentos e classificação próprios.</p>
    ${cc?(UL?(lista.length?`<div class="htul">${lista.map(u=>`<label class="chk ${tem(u.cod)?'on':''}"><input type="checkbox" data-htu="${esc(u.cod)}" ${tem(u.cod)?'checked':''}> <b>${esc(u.cod)}</b> ${esc(u.nome)}${u.horas?` <span class="mut">· ${u.horas} h</span>`:''}</label>`).join('')}</div>`:'<p class="mut">O referencial não tem UFCD.</p>'):htUfcdCard._a===-1?'<p class="mut">Não foi possível ler o Catálogo agora — pode juntar as UFCD abaixo.</p>':'<p class="mut">A carregar as UFCD do Catálogo…</p>'):'<p class="mut">Esta turma não tem curso do Catálogo associado — junte as UFCD abaixo (ou indique o curso ao editar a turma).</p>'}
    ${extra.length?`<div class="htul">${extra.map(m=>`<label class="chk on"><input type="checkbox" data-htx="${esc(m.id)}" checked> ${m.cod?`<b>${esc(m.cod)}</b> `:''}${esc(m.nome)}${m.horas?` <span class="mut">· ${m.horas} h</span>`:''}</label>`).join('')}</div>`:''}
    <div class="row htadd"><input id="htu-cod" placeholder="Código" style="max-width:110px"><input id="htu-nome" placeholder="Nome da UFCD" style="flex:1;min-width:160px"><input id="htu-h" type="number" min="0" placeholder="Horas" style="max-width:90px"><button class="btn sm" id="htu-ok">${ic('plus',14)} Juntar</button></div></div>`}
function htUfcdTemDados(t,m){try{return (t.instrumentos||[]).some(i=>i.mod===m.id||i.modulo===m.id||(i.mods||[]).includes(m.id))||JSON.stringify(m).length>160}catch(_){return true}}
function htUfcdBind(t){const M=()=>t.modulos=t.modulos||[];const novo=(cod,nome,horas)=>({id:uid()+Math.random().toString(36).slice(2,5),cod:String(cod||'').replace(/^UFCD\s*/i,''),nome,horas:horas||'',ini:'',fim:''});
  const tira=m=>{if(htUfcdTemDados(t,m)&&!confirm(`A UFCD ${m.cod||''} ${m.nome} já tem dados nesta pauta. Retirar mesmo assim?`))return false;t.modulos=M().filter(x=>x!==m);return true};
  const fim=txt=>{save();audit('Turmas','UFCD',t.nome+': '+txt);manterPosicao(vHorario)};
  $$('[data-htu]').forEach(c=>c.onchange=()=>{const cc=t.cnq;const u=((cnqM().uf[cc&&cc.id]||{}).L||[]).find(x=>String(x.cod)===c.dataset.htu);if(!u)return;const m=M().find(x=>String(x.cod)===String(u.cod));
    if(c.checked){if(!m)M().push(novo(u.cod,u.nome,u.horas));fim('+ '+u.cod)}else if(m){if(tira(m))fim('− '+u.cod);else c.checked=true}});
  $$('[data-htx]').forEach(c=>c.onchange=()=>{const m=M().find(x=>x.id===c.dataset.htx);if(m&&tira(m))fim('− '+(m.cod||m.nome));else c.checked=true});
  const ok=$('#htu-ok');if(ok)ok.onclick=()=>{const cod=$('#htu-cod').value.trim(),nome=$('#htu-nome').value.trim(),h=+$('#htu-h').value||'';if(!nome)return toast('Escreva o nome da UFCD','warn');
    if(cod&&M().some(x=>String(x.cod)===cod.replace(/^UFCD\s*/i,'')))return toast('Essa UFCD já está na pauta','warn');M().push(novo(cod,nome,h));fim('+ '+(cod||nome))};
  const n=$('#htu-nome');if(n)n.onkeydown=e=>{if(e.key==='Enter'&&ok)ok.click()}}
{const _vh=vHorario;vHorario=function(){const r=_vh.apply(this,arguments);try{const t=T();if(t&&t.disciplina===UFCD_N){const card=[...$$('#view .card')].find(c=>c.querySelector('[data-sig]'));
    if(!$('#view .htu')&&!$('#view .hsem')){if(card)card.insertAdjacentHTML('beforeend',htUfcdCard(t));else $('#view').insertAdjacentHTML('beforeend',`<div class="card">${htUfcdCard(t)}</div>`);htUfcdBind(t)}}}catch(e){console.warn(e)}return r}}
