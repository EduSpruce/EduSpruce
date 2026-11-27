/* UFCD / módulos: cada unidade é uma disciplina estanque, com avaliação própria — nada por período, sem avaliação intercalar */
const tUnid=t=>{try{return !!t&&typeof ehUnid==='function'&&ehUnid(t)}catch(_){return false}};
function unidMarcar(){try{document.body.classList.toggle('t-unid',tUnid(T()))}catch(_){}}
/* os valores de cada critério contam com todos os instrumentos da unidade, seja qual for o período (tudo fica no 1.º; os outros ficam vazios) */
{const _dP=domPer;domPer=function(t,aid,dom,per){if(!tUnid(t))return _dP.apply(this,arguments);if(+per>1)return null;const v=(t.instrumentos||[]).map(i=>instDom(i,aid,dom)).filter(Boolean).map(x=>x.pct);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}}
/* sem avaliação intercalar nas unidades */
{const _iM=intMomentos;intMomentos=function(t){return tUnid(t)?[]:_iM.apply(this,arguments)}}
{const _dA=datasAvalDe;datasAvalDe=function(a,t){const r=_dA.apply(this,arguments);return tUnid(t)?r.filter(d=>d.tipo!=='intercalar'):r}}
/* Painel: a unidade toda, sem separadores de período */
{const _vP=vPainel;vPainel=function(){unidMarcar();const t=T();if(!tUnid(t))return _vP.apply(this,arguments);const C=PNL();const o=C.per;C.per='ano';try{return _vP.apply(this,arguments)}finally{C.per=o}}}
/* separador «Avaliação Final» da unidade (abre a avaliação da UFCD/módulo) */
{const _nU=navUnid;navUnid=function(){const r=_nU.apply(this,arguments);unidMarcar();try{const t=T();document.querySelectorAll('#side [data-v="avaliacao"],#tnavHold [data-v="avaliacao"]').forEach(e=>{if(tUnid(t)){e.style.display='';e.hidden=false;delete e.dataset.unidOc;const l=e.querySelector('.lbl');if(l&&!e.dataset.lbl0){e.dataset.lbl0=l.textContent;l.textContent='Avaliação Final'}}else if(e.dataset.lbl0){const l=e.querySelector('.lbl');if(l)l.textContent=e.dataset.lbl0;delete e.dataset.lbl0}})}catch(e){console.warn(e)}return r}}
/* ===== Critérios gerais e específicos =====
   Específico: avaliado pelos elementos de avaliação (itens dos instrumentos).
   Geral: sem elementos de avaliação; o professor classifica-o só na avaliação final do período (disciplina) ou no fim da unidade (UFCD/módulo).
   Valores em t.critG[chave][aid][domId] = 0..1 · chave = n.º do período ou 'u:'+id da unidade */
function domEsp(t){return ((t&&t.dominios)||[]).filter(d=>!d.ger)}
function domGer(t){return ((t&&t.dominios)||[]).filter(d=>d.ger)}
function critGChave(t,per){if(tUnid(t)){const m=modAtivo(t);return m?'u:'+m.id:'u'}return String(+per||1)}
function critGVal(t,aid,dom,per){const v=(((t.critG||{})[critGChave(t,per)]||{})[aid]||{})[dom];return v==null||v===''?null:+v}
{const _dP=domPer;domPer=function(t,aid,dom,per){const d=t&&(t.dominios||[]).find(x=>x.id===dom);if(!d||!d.ger)return _dP.apply(this,arguments);if(tUnid(t)&&+per>1)return null;return critGVal(t,aid,dom,per)}}
function critGDlg(t,per){const G=domGer(t);if(!G.length)return toast('Não há critérios gerais nesta turma (Critérios › tipo «Geral»).','aviso');
  const unid=tUnid(t);per=+per||perAtual(t);const sec=isSec(t)||unid;const P=periodos();
  const linhas=()=>{const k=critGChave(t,per);const R=((t.critG||{})[k])||{};return alunosAval(t).map(a=>`<tr><td>${esc(a.num||'')}</td><td style="text-align:left">${esc(a.nome)}</td>${G.map(d=>{const v=(R[a.id]||{})[d.id];const sh=v==null||v===''?'':sec?String(Math.round(v*200)/10).replace('.',','):String(Math.round(v*100));return `<td><input class="cgin" data-cga="${a.id}" data-cgd="${d.id}" value="${sh}" inputmode="decimal" aria-label="${esc(d.nome)} de ${esc(a.nome)}" placeholder="${sec?'0–20':'%'}"></td>`}).join('')}</tr>`).join('')};
  openDrawer('Critérios Gerais',`<div class="ed"><p class="hint" style="margin-top:0">Os critérios gerais não têm elementos de avaliação: classifica-os aqui, ${unid?'no fim da '+(typeof ehUnidC==='function'&&ehUnidC(t)?'UFCD':'unidade'):'na avaliação final do período'}. Contam com o seu peso na classificação.</p>
    ${unid?'':`<div class="seg" role="group" aria-label="Período" id="cg-per">${P.map(p=>`<button type="button" data-cgp="${p}" class="${p===per?'on':''}">${esc(perNome(p))}</button>`).join('')}</div>`}
    <div class="tblw" style="margin-top:10px"><table class="lst cgt"><thead><tr><th>N.º</th><th style="text-align:left">Aluno</th>${G.map(d=>`<th title="${esc(d.nome)}">${esc(d.ab||d.nome)}<br><small class="mut">${esc(d.nome)} · ${d.peso}%</small></th>`).join('')}</tr></thead><tbody id="cg-b">${linhas()}</tbody></table></div>
    <p class="hint">Escala ${sec?'0 a 20 valores':'0 a 100 %'}. Vazio = ainda sem classificação.</p></div>`);
  const liga=()=>{$$('.cgin').forEach(i=>i.onchange=()=>{const k=critGChave(t,per);t.critG=t.critG||{};const R=t.critG[k]=t.critG[k]||{};const r=R[i.dataset.cga]=R[i.dataset.cga]||{};const s=i.value.trim().replace(',','.');
      if(s===''){delete r[i.dataset.cgd]}else{const n=+s;const max=sec?20:100;if(!isFinite(n)||n<0||n>max){toast('Valor entre 0 e '+max+'.','erro');i.focus();return}r[i.dataset.cgd]=n/max}save();i.classList.add('ok');setTimeout(()=>i.classList.remove('ok'),600)})};liga();
  $$('[data-cgp]').forEach(b=>b.onclick=()=>{per=+b.dataset.cgp;$$('[data-cgp]').forEach(x=>x.classList.toggle('on',x===b));$('#cg-b').innerHTML=linhas();liga()})}
function critGBarra(){try{const t=T();if(!t||!domGer(t).length||$('#view .cgbar'))return;const v=$('#view');if(!v)return;const G=domGer(t);
    v.insertAdjacentHTML('afterbegin',`<div class="card cgbar"><span>${ic('flag',16)} <b>Critérios gerais</b> <span class="mut">(sem elementos de avaliação): ${esc(G.map(d=>d.nome+' '+d.peso+'%').join(' · '))}</span></span><span class="sp1"></span><button type="button" class="btn sm pri" id="cg-abrir">${ic('pencil',14)} Classificar</button></div>`);
    $('#cg-abrir').onclick=()=>critGDlg(t,typeof UI!=='undefined'&&UI.per?UI.per:null)}catch(e){console.warn(e)}}
{const _vA=vAvaliacao;vAvaliacao=function(){const r=_vA.apply(this,arguments);critGBarra();return r};if(go._f)go._f.avaliacao=vAvaliacao}
{const _vM=vModulos;vModulos=function(){const r=_vM.apply(this,arguments);if(tUnid(T()))critGBarra();return r};if(go._f)go._f.modulos=vModulos}
{const _vC=vCriterios;vCriterios=function(){const r=_vC.apply(this,arguments);try{const t=T();$$('[data-dger]').forEach(s=>s.onchange=()=>{const d=t.dominios[+s.dataset.dger];if(!d)return;const g=s.value==='1';
    if(g&&t.instrumentos.some(i=>(i.itens||[]).some(x=>x.dom===d.id))&&!confirm('Há itens de instrumentos ligados a «'+d.nome+'». Um critério geral não usa elementos de avaliação: esses itens ficam guardados mas deixam de contar para este critério. Continuar?')){s.value='';return}
    if(g)d.ger=true;else delete d.ger;save();vCriterios()});critGBarra();
    /* nível superior dos subdomínios (ex.: Saber Ser 20 %) */
    const D=t.dominios||[];$$('#view tr.domsubr[data-k]').forEach(tr=>{const d=D[+tr.dataset.k];if(!d||!d.grupo)return;const ant=D[+tr.dataset.k-1];if(ant&&ant.grupo===d.grupo)return;const w=Math.round(D.filter(x=>x.grupo===d.grupo).reduce((a,x)=>a+(+x.peso||0),0)*100)/100;
      tr.insertAdjacentHTML('beforebegin',`<tr class="domgr"><td colspan="${tr.cells.length}"><span class="domgrn">${esc(d.grupo)}</span><span class="domgrw">${String(w).replace('.',',')}%</span><span class="mut domgrs">${D.filter(x=>x.grupo===d.grupo).length} subdomínios</span></td></tr>`)})}catch(e){console.warn(e)}return r};if(go._f)go._f.criterios=vCriterios}

/* Relatórios: unidade sem períodos; nível superior dos subdomínios */
function relPers(t,per){return tUnid(t)?[1]:periodos().filter(p=>p<=per)}
function unidNomeComp(t){try{const m=modAtivo(t);if(!m)return '';const r=typeof rotUnid==='function'?rotUnid(m,t):(m.cod||'');return r&&m.nome&&String(m.nome).indexOf(m.cod||'@')!==0?r+' - '+m.nome:(m.nome||r)}catch(_){return ''}}
function relPerNome(t,p){return tUnid(t)?(unidNomeComp(t)||'UFCD'):perNome(p)}
function relGrpPeso(t,g){return Math.round((t.dominios||[]).filter(x=>x.grupo===g).reduce((a,x)=>a+(+x.peso||0),0)*100)/100}
function relGrpTr(t,d,k,n){if(!d.grupo)return '';const ant=(t.dominios||[])[k-1];if(ant&&ant.grupo===d.grupo)return '';return `<tr class="relgr"><td><b>${esc(d.grupo)}</b></td><td class="c"><b>${String(relGrpPeso(t,d.grupo)).replace('.',',')}%</b></td><td colspan="${Math.max(1,n-2)}"></td></tr>`}
function relGrpLin(t,d,k,n){if(!d.grupo)return [d];const ant=(t.dominios||[])[k-1];if(ant&&ant.grupo===d.grupo)return [d];return [{__g:[d.grupo,String(relGrpPeso(t,d.grupo)).replace('.',',')+'%',...Array(n).fill('')]},d]}
/* «Avaliação Final» da UFCD/módulo: abre a pauta da própria unidade (antes ia para a lista de Módulos), sem períodos */
try{delete UNID_REDIR.avaliacao}catch(_){}
{const _vAU=vAvaliacao;vAvaliacao=function(){const t=T();if(!tUnid(t))return _vAU.apply(this,arguments);UI.per=1;const r=_vAU.apply(this,arguments);
  try{const v=$('#view');if(!v)return r;const nm=unidNomeComp(t)||'Unidade';
    v.querySelectorAll('.tabs').forEach(g=>{if(g.querySelector('button[data-p]')){const row=g.closest('.row');(row&&row.children.length===1?row:g).style.display='none'}});
    const b=$('#av-bloq');if(b){const row=b.closest('.row');(row||b).style.display='none'}
    v.querySelectorAll('th,span.mut,h2').forEach(e=>{if(e.children.length&&e.tagName!=='H2')return;for(const n of e.childNodes)if(n.nodeType===3){n.nodeValue=n.nodeValue.replace(/Nota = só o 1\.º (período|semestre)/i,'Nota da unidade').replace(/^1\.º (Período|Semestre)$/,nm).replace(/ · 1\.º (Período|Semestre)$/,' · '+nm)}})}catch(e){console.warn(e)}return r};if(go._f)go._f.avaliacao=vAvaliacao}
