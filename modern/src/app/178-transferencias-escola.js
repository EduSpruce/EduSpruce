/* ===================== v0.58 · Transferências de escola ===================== */
if(!ICONS.send)ICONS.send='<path d="M21 3 10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>';
/* aluno.movs = [{id,tipo:'saida'|'regresso',data,escola,concelho,codigo,motivo,q}] — notas e percurso mantêm-se; depois da saída fica a cinzento */
CAMPOS_COMUNS.push('movs');
const CONCELHOS_SUG=['Angra do Heroísmo','Calheta (São Jorge)','Corvo','Horta','Lagoa (Açores)','Lajes das Flores','Lajes do Pico','Madalena','Nordeste','Ponta Delgada','Povoação','Ribeira Grande','Santa Cruz da Graciosa','Santa Cruz das Flores','São Roque do Pico','Velas','Vila da Praia da Vitória','Vila do Porto','Vila Franca do Campo','Calheta (Madeira)','Câmara de Lobos','Funchal','Machico','Ponta do Sol','Porto Moniz','Porto Santo','Ribeira Brava','Santa Cruz','Santana','São Vicente','Lisboa','Porto','Coimbra','Braga','Aveiro','Faro','Setúbal','Leiria','Viseu','Évora','Sintra','Cascais','Amadora','Oeiras','Loures','Almada','Seixal','Vila Nova de Gaia','Matosinhos','Gondomar','Guimarães','Funchal','Outro (estrangeiro)'];
const movsDe=a=>(a&&Array.isArray(a.movs)?a.movs:[]).slice().sort((x,y)=>(x.data||'').localeCompare(y.data||'')||(x.q||0)-(y.q||0));
/* fora da escola numa data: houve uma saída antes (ou nesse dia) sem regresso posterior */
function foraEm(a,data){const d=data||isoData(new Date());let fora=null;movsDe(a).forEach(m=>{if(!m.data||m.data>d)return;if(m.tipo==='saida')fora=m;else if(m.tipo==='regresso')fora=null});return fora}
/* depois da saída: um instrumento/aula com data posterior à saída e anterior a um eventual regresso */
function depoisSaida(a,data){if(!data)return null;let ult=null;for(const m of movsDe(a)){if(m.data&&m.data<data){if(m.tipo==='saida')ult=m;else if(m.tipo==='regresso')ult=null}}return ult}
let _alIdx=null,_alIdxT=0;
function alPorId(aid){const now=Date.now();if(!_alIdx||now-_alIdxT>800){_alIdx=new Map();_alIdxT=now;try{(A()&&A().turmas||[]).forEach(t=>t.alunos.forEach(x=>_alIdx.set(x.id,x)))}catch(_){}}return _alIdx.get(aid)}
{const _iA=instAvaliado;instAvaliado=function(i,aid){if(i&&i.data){const al=alPorId(aid);if(al&&al.movs&&al.movs.length&&depoisSaida(al,i.data))return false}return _iA.apply(this,arguments)}}
/* períodos que começam depois da saída: o aluno não tem classificação nesse período (não conta para médias, pautas e estatísticas) */
function perFora(al,per){const a=A();const p=a&&a.calendario&&(a.calendario.periodos||[]).find(x=>+x.n===+per);if(!p||!p.ini)return false;const fim=p.fim||p.ini;return !!(depoisSaida(al,p.ini)&&depoisSaida(al,fim>p.ini?fim:p.ini))}
{const _pF=pctsFinal;pctsFinal=function(t,aid,per){const al=alPorId(aid);if(al&&al.movs&&al.movs.length){if(perFora(al,per)){const o={};(t.dominios||[]).forEach(d=>o[d.id]=null);return o}}return _pF.apply(this,arguments)}}
{const _pP=pctsPer;pctsPer=function(t,aid,per){const al=alPorId(aid);if(al&&al.movs&&al.movs.length){if(perFora(al,per)){const o={};(t.dominios||[]).forEach(d=>o[d.id]=null);return o}}return _pP.apply(this,arguments)}}
/* todas as ocorrências deste aluno no ano (todas as disciplinas que leciono) */
function alunoNoAno(al){const a=A();const L=[];if(!a)return L;a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x===al||mesmoAluno(x,al))L.push({t,x})}));return L}
function movRegistar(al,m){m.id=m.id||uid();m.q=Date.now();alunoNoAno(al).forEach(({x})=>{x.movs=Array.isArray(x.movs)?x.movs:[];if(!x.movs.some(z=>z.id===m.id))x.movs.push({...m})});_alIdx=null;save();audit('Alunos',m.tipo==='saida'?'Transferência de escola':'Regresso à escola',al.nome+' · '+fmtD(m.data)+(m.escola?' · '+m.escola:''))}
function movApagar(al,id){alunoNoAno(al).forEach(({x})=>{x.movs=(x.movs||[]).filter(z=>z.id!==id)});_alIdx=null;save()}
function descSaida(m){return 'Transferido(a) em '+fmtD(m.data)+' para '+(m.escola||'outra escola')+(m.concelho?' ('+m.concelho+')':'')}
/* ---- diálogo ---- */
function transferirDlg(aid){const t=T();const al=t&&t.alunos.find(x=>x.id===aid);if(!al)return;const a=A();const f=foraEm(al);
  const per=(a.calendario&&a.calendario.periodos||[]).find(p=>p.n===perAtual(t));const sug=per&&per.fim&&per.fim>=isoData(new Date())?per.fim:isoData(new Date());
  const hist=movsDe(al);
  openDrawer(f?'Regresso à Escola — '+al.nome:'Transferência de Escola — '+al.nome,`<div class="ed trf">
    ${f?`<div class="alert w" style="margin-top:0">${ic('alert',15)} ${esc(descSaida(f))}. As classificações e o percurso até essa data mantêm-se; depois dela o aluno aparece a cinzento e não conta para médias nem assiduidade.</div>
      <div class="g2"><div><label for="tr-dr">Data de regresso</label><input type="date" id="tr-dr" value="${isoData(new Date())}" min="${esc(f.data)}"></div><div><label for="tr-or">Observação</label><input id="tr-or" placeholder="Ex.: regressou por mudança de residência"></div></div>
      <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="btn pri" id="tr-reg">${ic('check',15)} Registar Regresso</button><button class="btn" id="tr-rel">${ic('file',15)} Relatório de Transferência (PDF)</button></div>`
    :`<p class="hint" style="margin-top:0">O aluno sai a partir desta data. Nada é apagado: classificações, faltas, sumários e observações até à data ficam guardados e entram no relatório para o novo professor. Pode registar o regresso mais tarde.</p>
      <div class="g2"><div><label for="tr-d">Data da transferência (último dia nesta escola)</label><input type="date" id="tr-d" value="${sug}"></div><div><label for="tr-c">Concelho da nova escola</label><input id="tr-c" list="tr-cl" placeholder="Ex.: Ponta Delgada" autocomplete="off"><datalist id="tr-cl">${[...new Set(CONCELHOS_SUG)].map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div></div>
      <div class="g2"><div><label for="tr-e">Escola de destino</label><input id="tr-e" placeholder="Ex.: Escola Básica e Secundária Domingos Rebelo"></div><div><label for="tr-k">Código da escola <span class="mut">(opcional)</span></label><input id="tr-k" inputmode="numeric"></div></div>
      <label for="tr-m">Motivo / observações</label><textarea id="tr-m" rows="2" placeholder="Ex.: mudança de residência da família"></textarea>
      <label class="chk" style="margin-top:10px"><input type="checkbox" id="tr-pdf" checked> Gerar já o relatório de transferência (PDF) para o novo professor</label>
      <div class="row" style="margin-top:12px"><button class="btn pri" id="tr-ok">${ic('send',15)} Registar Transferência</button></div>`}
    ${hist.length?`<h3>Histórico</h3><table class="lst"><thead><tr><th>Data</th><th>Movimento</th><th>Escola / concelho</th><th></th></tr></thead><tbody>${hist.map(m=>`<tr><td>${fmtD(m.data)}</td><td>${m.tipo==='saida'?'Saída (transferência)':'Regresso'}</td><td>${esc([m.escola,m.concelho].filter(Boolean).join(' · ')||'—')}${m.motivo?`<br><span class="mut">${esc(m.motivo)}</span>`:''}</td><td><button class="btn sm dng" data-trx="${m.id}" aria-label="Anular este movimento">Anular</button></td></tr>`).join('')}</tbody></table>`:''}
  </div>`);
  const ok=$('#tr-ok');if(ok)ok.onclick=()=>{const d=$('#tr-d').value,c=$('#tr-c').value.trim(),e=$('#tr-e').value.trim();if(!d)return toast('Indique a data da transferência','aviso');if(!c)return toast('Indique o concelho da nova escola','aviso');
    const m={tipo:'saida',data:d,escola:e,concelho:c,codigo:$('#tr-k').value.trim(),motivo:$('#tr-m').value.trim()};movRegistar(al,m);const pdf=$('#tr-pdf').checked;closeDrawer();toast(al.nome+': transferência registada','ok');go(VIEW);if(pdf)setTimeout(()=>relatorioTransferencia(al.id),300)};
  const rg=$('#tr-reg');if(rg)rg.onclick=()=>{const d=$('#tr-dr').value;if(!d)return;if(d<f.data)return toast('O regresso tem de ser depois da saída','aviso');movRegistar(al,{tipo:'regresso',data:d,motivo:$('#tr-or').value.trim()});closeDrawer();toast(al.nome+': regresso registado','ok');go(VIEW)};
  const rl=$('#tr-rel');if(rl)rl.onclick=()=>relatorioTransferencia(al.id);
  $$('[data-trx]').forEach(b=>b.onclick=()=>{if(!confirm('Anular este movimento? As classificações não são afetadas.'))return;movApagar(al,b.dataset.trx);closeDrawer();go(VIEW);toast('Movimento anulado','ok')})}
/* ---- relatório para o novo professor ---- */
function relatorioTransferencia(aid){const t0=T();const al=t0&&t0.alunos.find(x=>x.id===aid);if(!al)return;const a=A();const sai=movsDe(al).filter(m=>m.tipo==='saida').pop();const ate=sai?sai.data:isoData(new Date());
  const e=escolaDe(t0);const B=[];const reg=alunoNoAno(al);const P=periodos();
  B.push({kv:[['Aluno',al.nome],['Data de nascimento',al.nasc?fmtD(al.nasc)+' ('+idade(al.nasc)+' anos)':'—'],['N.º de processo',al.processo||'—'],['Turma',(al.origem||t0.nome)+' · N.º '+(al.num||'—')],['Ano letivo',a.nome],['Escola de origem',nomeEscola(e)||'—'],['Escola de destino',sai?(sai.escola||'—')+(sai.codigo?' (código '+sai.codigo+')':''):'—'],['Concelho de destino',sai&&sai.concelho||'—'],['Data da transferência',sai?fmtD(sai.data):'—'],['Diretor(a) de turma',profNome(dtDe(a,al.origem||t0.nome))||'—'],['Professor(a) / contacto',(profNome(S.cfg.professor)||'—')+(emailDe(t0)?' · '+emailDe(t0):'')]],foto:al.foto||null});
  if(sai&&sai.motivo)B.push({p:'Motivo: '+sai.motivo});
  B.push({p:'Este relatório reúne as classificações, a assiduidade, os conteúdos lecionados e as observações registadas até '+fmtD(ate)+', para facilitar a continuidade pedagógica na nova escola. Contém dados pessoais de um menor (RGPD): envie apenas pelos canais oficiais da escola.',sz:8.5});
  reg.forEach(({t,x})=>{const fin=P.map(p=>{try{return ponderada(t,pctsFinal(t,x.id,p))}catch(_){return null}});
    B.push({pb:B.length>3?1:0},{h:t.disciplina+' — '+(x.origem||t.nome)});
    if(ehUnid(t)||(t.modulos||[]).length){const M=t.modulos||[];B.push({h:unidMod(t).p+' ('+M.length+')'},M.length?{tabela:{cab:['Código','Designação','Horas','Classificação','Estado'],larg:[.14,.46,.1,.14,.16],linhas:M.map(m=>{let v=null;try{v=notaMod(t,x.id,m.id)}catch(_){}if(v==null)try{v=notaModAuto(t,x.id,m.id)}catch(_){}return [m.cod||'',m.nome||'',m.horas?m.horas+' h':'',v==null?'—':String(v),v==null?'Em curso / não avaliada':v>=10?'Concluída':'Não concluída']})}}:{p:'—'})}
    if(!ehUnid(t)&&t.dominios&&t.dominios.length){B.push({tabela:{cab:['Domínio / critério','Peso',...P.map(p=>perNome(p))],larg:[.4,.12,...P.map(()=>.48/P.length)],linhas:[...t.dominios.map(d=>[d.nome,(d.peso||0)+'%',...P.map(p=>{const v=domPer(t,x.id,d.id,p);return v==null?'—':pctD(t,v)})]),['Classificação','',...fin.map(f=>f==null?'—':fmtNota(t,f)+(isSec(t)?'':' · nível '+nivel(t,f)))],['Menção','',...fin.map(f=>(mencao(t,f)||{}).nome||'—')]]}});
      const I=P.map(p=>{const r=((t.interc||{})['p'+p]||{})[x.id];return r&&(r.m||r.obs)?perNome(p)+' (intercalar): '+(r.m||'')+(r.obs?' — '+r.obs:''):''}).filter(Boolean);if(I.length)B.push({p:I.join('\n')})}
    const ins=(t.instrumentos||[]).filter(i=>!i.data||i.data<=ate).sort((p,q)=>(p.data||'').localeCompare(q.data||''));
    B.push({h:'Instrumentos de avaliação até '+fmtD(ate)},ins.length?{tabela:{cab:['Data','Instrumento','Tipo','Resultado'],larg:[.14,.38,.26,.22],linhas:ins.map(i=>{const v=instTotal(i,x.id),Mx=instMax(i);return [i.data?fmtD(i.data):'—',i.nome,i.tipo||'',v!=null&&Mx?(isSec(t)?nf(Math.round(v/Mx*200)/10)+' val.':Math.round(100*v/Mx)+'%')+' ('+nf(v)+'/'+nf(Mx)+')':'não realizou / sem registo']})}}:{p:'Sem instrumentos registados.'});
    let L=[];try{L=listaAulas(t,a).filter(z=>z.data<=ate)}catch(_){}const dadas=L.filter(z=>z.licao);const F=(x.faltasAl||[]).filter(f=>f.data<=ate);const tf=k=>F.filter(f=>(f.tipo||'')===k).reduce((s,f)=>s+(+f.tempos||1),0);
    B.push({h:'Assiduidade até '+fmtD(ate)},{kv:[['Aulas dadas (tempos)',String(dadas.length)],['Faltas injustificadas',String(tf('injust'))],['Faltas justificadas',String(tf('just'))],['Atrasos',String(tf('atraso'))],['Faltas de material',String(tf('material'))],['Faltas disciplinares',String(tf('disc'))],['Assiduidade',dadas.length?Math.max(0,Math.round(100*(1-(tf('injust')+tf('just')+tf('disc'))/dadas.length)))+'% das aulas':'—']]});
    const S_=dadas.filter(z=>z.s&&(z.s.texto||'').trim());if(S_.length)B.push({h:'Conteúdos lecionados (sumários)'},{tabela:{cab:['Lição','Data','Sumário'],larg:[.09,.13,.78],linhas:S_.slice(-60).map(z=>[String(z.licao),fmtD(z.data),String(z.s.texto).replace(/\s+/g,' ').slice(0,400)])}});
    try{const pAt=perAtual(t);const sx=typeof sintesePers==='function'?sintesePers(t,x,pAt):'';if(sx&&!ehUnid(t))B.push({h:'Síntese descritiva ('+perNome(pAt)+')'},{p:String(sx).replace(/<[^>]+>/g,''),just:1,ind:1})}catch(_){}
    const ob=[x.obs||'',...P.map(p=>(x.obsPer||{})[p]?perNome(p)+': '+x.obsPer[p]:'')].filter(Boolean);if(ob.length)B.push({h:'Observações do professor'},{p:ob.join('\n')})});
  const m=al.medidas||{};const LM=Object.entries(typeof MEDIDAS!=='undefined'?MEDIDAS:{}).flatMap(([k,g])=>(m[k]||[]).map(i=>[g.t,g.l[i]])).concat((al.acomod||[]).map(i=>['Acomodações curriculares',(typeof acT!=='undefined'?acT(i):i)]));
  B.push({h:'Medidas de suporte à aprendizagem (DL 54/2018)'},LM.length?{tabela:{cab:['Tipo','Medida'],linhas:LM,larg:[.35,.65]}}:{p:'Sem medidas registadas.'});
  const perc=ocorrenciasAluno(al).filter(o=>o.an!==a).map(o=>[o.an.nome,o.x.origem||o.t.nome,o.t.disciplina]).concat((al.percurso||[]).map(z=>[z.ano,z.turma,(z.esc?z.esc+' · ':'')+(z.res||'')]));
  B.push({h:'Percurso escolar'},perc.length?{tabela:{cab:['Ano letivo','Turma','Disciplina / observações'],linhas:perc,larg:[.2,.2,.6]}}:{p:'Sem registos de anos anteriores nesta aplicação.'});
  const H=movsDe(al);if(H.length)B.push({h:'Movimentos'},{tabela:{cab:['Data','Movimento','Escola / concelho'],linhas:H.map(z=>[fmtD(z.data),z.tipo==='saida'?'Saída':'Regresso',[z.escola,z.concelho].filter(Boolean).join(' · ')]),larg:[.18,.22,.6]}});
  pdfDocumento({titulo:'Relatório de Transferência',subtitulo:al.nome+' · '+(sai?'para '+(sai.escola||sai.concelho||''):''),escola:e,turma:t0,blocos:B,assinaturas:[profAssin(),tituloDT(S.cfg.professor)?(profGenProfX()==='F'?'A Diretora de Turma':profGenProfX()==='M'?'O Diretor de Turma':'O(A) Diretor(a) de Turma'):'']. filter(Boolean)},'Transferencia '+al.nome);audit('Alunos','Relatório de transferência (PDF)',al.nome)}
/* ---- cinzento depois da saída ---- */
function marcarTransferidos(){const t=T();if(!t)return;const hj=isoData(new Date());const inst=UI.inst&&(t.instrumentos||[]).find(i=>i.id===UI.inst);
  const ids=new Map();t.alunos.forEach(x=>{const f=foraEm(x,hj);if(f)ids.set(x.id,f)});
  document.querySelectorAll('#view .al-transf').forEach(e=>{const id=e.dataset.a||e.dataset.fi||e.dataset.al;if(!ids.has(id))e.classList.remove('al-transf')});
  if(!ids.size)return;
  ids.forEach((f,id)=>{document.querySelectorAll(`#view [data-a="${id}"],#view [data-fi="${id}"],#view [data-al="${id}"]`).forEach(e=>{if(e.closest('.al-transf')&&!e.classList.contains('al-transf'))return;e.classList.add('al-transf');e.title=descSaida(f);
      if(!e.querySelector('.trfb')){const alvo=e.matches('tr')?(e.querySelector('td b,td .stk,td:nth-child(2)')||e.cells&&e.cells[1]):e.querySelector('b,.fgt b');if(alvo)alvo.insertAdjacentHTML('beforeend',` <span class="trfb" title="${esc(descSaida(f))}">${ic('send',11)} transferido(a) ${esc(fmtD(f.data).slice(0,5))}${f.concelho?' · '+esc(f.concelho):''}</span>`)}
      if(inst&&inst.data&&inst.data>f.data)e.querySelectorAll('input,select,textarea').forEach(i=>{i.readOnly=true;i.disabled=true;i.title='Instrumento posterior à transferência'})})})}
{const _gT=go;go=function(){const r=_gT.apply(this,arguments);try{setTimeout(marcarTransferidos,30)}catch(_){}return r}}
new MutationObserver(()=>{clearTimeout(marcarTransferidos._t);marcarTransferidos._t=setTimeout(()=>{try{marcarTransferidos()}catch(_){}},60)}).observe(document.getElementById('view')||document.body,{childList:true,subtree:true});
/* ---- entrada pela ficha do aluno ---- */
{const _fT=fichaAluno;fichaAluno=function(id){const r=_fT.apply(this,arguments);try{fichaTransfBanner(id)}catch(e){console.warn(e)}return r}}
function fichaTransfBanner(id){const t=T();const al=t&&t.alunos.find(x=>x.id===id);const box=$('#dw-b');if(!al||!box||box.querySelector('.trfban'))return;const f=foraEm(al);const prox=movsDe(al).find(m=>m.tipo==='saida'&&m.data>isoData(new Date()));
  box.insertAdjacentHTML('afterbegin',`<div class="trfban ${f?'on':''}">${ic(f?'alert':'send',15)}<span>${f?esc(descSaida(f)):prox?'Transferência marcada para '+esc(fmtD(prox.data))+' → '+esc(prox.escola||prox.concelho||''):'Mudança de escola?'}</span><span class="sp1"></span>${f||prox?`<button type="button" class="btn sm" data-trrel>${ic('file',13)} Relatório</button>`:''}<button type="button" class="btn sm ${f?'pri':''}" data-trdlg>${f?'Registar Regresso…':prox?'Editar…':'Transferência de Escola…'}</button></div>`);
  box.querySelector('[data-trdlg]').onclick=()=>transferirDlg(al.id);const rr=box.querySelector('[data-trrel]');if(rr)rr.onclick=()=>relatorioTransferencia(al.id)}

/* v0.59 · «não realizou»: não imputável ao aluno (não conta — a média faz-se com os restantes elementos) ou imputável (conta 0) */
{const _iA2=instAvaliado;instAvaliado=function(i,aid){if(i&&i.nr&&i.nr[aid]&&i.nr[aid]!=='z')return false;return _iA2.apply(this,arguments)}}
function nrRot(v){return v==='z'?'não fez · conta 0':v?'não fez · não conta':'F'}
function nrMarcar(t,i,aid,v){i.nr=i.nr||{};
  /* os zeros postos pelo «conta 0» só se retiram se a linha ainda for toda de zeros: classificações que o aluno já tinha (ou escritas depois) nunca se apagam */
  const tiraZ=()=>{const n=i.notas[aid];if(!n||i.itens.every(it=>n[it.id]==null||n[it.id]===''||num(n[it.id])===0))delete i.notas[aid];delete i._nrZ[aid]};
  if(!v){delete i.nr[aid];if(i._nrZ&&i._nrZ[aid])tiraZ()}
  else if(v==='z'){i.nr[aid]='z';const n=i.notas[aid]=i.notas[aid]||{};const tinha=i.itens.some(it=>num(n[it.id])!=null);let pus=false;i.itens.forEach(it=>{if(num(n[it.id])==null){n[it.id]=0;pus=true}});if(pus&&!tinha){i._nrZ=i._nrZ||{};i._nrZ[aid]=1}}
  else{if(i.nr[aid]==='z'&&i._nrZ&&i._nrZ[aid])tiraZ();i.nr[aid]='j'}
  save();audit('Avaliação','Não realizou: '+(v==='z'?'conta 0':v?'não conta':'anulado'),i.nome)}
{const _vIn=vInstrumento;vInstrumento=function(id){const r=_vIn.apply(this,arguments);try{nrBotoes(id)}catch(e){console.warn(e)}return r}}
function nrBotoes(id){const t=T();const i=t&&t.instrumentos.find(x=>x.id===id);if(!i)return;i.nr=i.nr||{};
  $$('#grid [data-nr]').forEach(b=>{const aid=b.dataset.nr;const v=i.nr[aid];b.textContent=nrRot(v);b.classList.toggle('on',!!v);b.classList.toggle('nrz',v==='z');b.title=v?'Não realizou — toque para mudar':'O aluno não realizou este elemento?';
    const tr=b.closest('tr');if(tr){tr.classList.toggle('nrrow',!!v&&v!=='z')}
    b.onclick=e=>{e.stopPropagation();const r=b.getBoundingClientRect();const al=t.alunos.find(x=>x.id===aid);
      menuContexto(r.left,r.bottom+4,[{t:'Não realizou — motivo não imputável (não conta)',ic:'shield',f:()=>{nrMarcar(t,i,aid,'j');manterPosicao(()=>vInstrumento(i.id));toast((al?al.nome.split(' ')[0]+': ':'')+'não conta — a média usa só os outros elementos','ok')}},
        {t:'Não realizou — imputável ao aluno (conta 0)',ic:'x',f:()=>{nrMarcar(t,i,aid,'z');manterPosicao(()=>vInstrumento(i.id));toast((al?al.nome.split(' ')[0]+': ':'')+'conta como 0','aviso')}},
        ...(v?['-',{t:'Anular (realizou)',ic:'refresh',f:()=>{nrMarcar(t,i,aid,null);manterPosicao(()=>vInstrumento(i.id))}}]:[])])}});
  const h=document.querySelector('#view .nrhint');if(!h){const g=document.querySelector('#grid');if(g)g.insertAdjacentHTML('beforebegin',`<p class="hint nrhint">${ic('info',13)} Se um aluno <b>não fez</b> um elemento, toque em <b>F</b> na linha dele: <b>não imputável</b> (doença, falta justificada, atividade da escola…) → <b>não conta</b> e a média desse critério faz-se só com os elementos que fez; <b>imputável</b> → conta 0.</p>`)}}
{const _aT59=autoTestes;autoTestes=function(){const r=_aT59.apply(this,arguments);const chk=(n,v,e)=>{try{window.__regT&&window.__regT(n,v,e)}catch(_){}if(Math.abs((v==null?NaN:+v)-e)<1e-6)r.ok++;else{r.err.push(n+': obtido '+v+', esperado '+e);r.f++}};
  try{const t={id:'tn',dominios:[{id:'o',peso:100}],instrumentos:[{id:'a',periodo:1,itens:[{id:'x',dom:'o',cot:20}],notas:{al:{x:16}}},{id:'b',periodo:1,itens:[{id:'y',dom:'o',cot:20}],notas:{},nr:{al:'j'}}]};
    chk('não realizou (não imputável) não conta',domPer(t,'al','o',1),.8);t.instrumentos[1].nr={al:'z'};t.instrumentos[1].notas={al:{y:0}};chk('não realizou (imputável) conta 0',domPer(t,'al','o',1),.4)}catch(e){r.err.push('erro nr: '+e.message);r.f++}return r}}

