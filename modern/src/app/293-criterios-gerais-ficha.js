/* ===================== Critérios gerais com ficha de indicadores =====================
   Um critério «Geral» (ex.: Empenho e Responsabilidade) pode ter indicadores (Assiduidade, Pontualidade…).
   Não usa elementos de avaliação: classifica-se na Avaliação Final, numa ficha por aluno (como a grelha
   «Atitudes e Valores»): cada indicador de 0 a 20; o critério vale a média dos seus indicadores.
   Indicadores em d.ind (sem d.ind: os predefinidos do Saber Ser, se o nome coincidir).
   Valores em t.critGI[chave][aid][domId][índice] = 0..20 · síntese em t.critGI[chave][aid]._obs · chave = critGChave */
function cgIndDef(d){const n=normT(d&&d.nome),ab=normT(d&&d.ab);
  const g=PROF_ATIT.find(g=>normT(g.nome)===n)||PROF_ATIT.find(g=>n&&n.indexOf(normT(g.nome))===0)||PROF_ATIT.find(g=>normT(g.ab)===ab)||(ab==='a'&&/autonom/.test(n||'autonomia')?PROF_ATIT.find(g=>g.k==='aut'):null);
  return g?g.ind.slice():[]}
function cgInd(d){return !d?[]:Array.isArray(d.ind)?d.ind:cgIndDef(d)}
function cgReg(t,per,aid){const k=critGChave(t,per);t.critGI=t.critGI||{};const K=t.critGI[k]=t.critGI[k]||{};return K[aid]=K[aid]||{}}
function cgFichaVal(t,aid,d,per){const I=cgInd(d);if(!I.length)return null;const R=(((((t.critGI||{})[critGChave(t,per)])||{})[aid])||{})[d.id]||{};
  const v=I.map((_,i)=>R[i]).filter(x=>x!=null&&x!=='').map(Number).filter(x=>isFinite(x));return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
/* o valor do critério geral vem da ficha quando há indicadores classificados; senão, da classificação direta */
{const _cgV=critGVal;critGVal=function(t,aid,dom,per){const d=(t.dominios||[]).find(x=>x.id===dom);if(d&&d.ger&&cgInd(d).length){const v=cgFichaVal(t,aid,d,per);if(v!=null)return v/20}return _cgV.apply(this,arguments)}}
const cgF1=v=>v==null?'—':String(Math.round(v*10)/10).replace('.',',');

/* ---- ficha do aluno ---- */
function cgFicha(t,per,aid){const G=domGer(t);if(!G.length)return toast('Não há critérios gerais nesta turma (Critérios › tipo «Geral»).','aviso');
  const unid=tUnid(t);per=+per||perAtual(t);const al=alunosAval(t);if(!al.length)return toast('Não há alunos.','aviso');let i=Math.max(0,al.findIndex(a=>a.id===aid));
  const sec=isSec(t)||unid;
  const total=a=>{let s=0,w=0;G.forEach(d=>{const v=critGVal(t,a.id,d.id,per);if(v!=null&&+d.peso>0){s+=v*20*d.peso;w+=+d.peso}});return w?s/w:null};
  const draw=()=>{const a=al[i];const R=cgReg(t,per,a.id);if(R._obsAuto&&/ revelou (nesta|neste) [^.]* atitudes e valores suficientes\./.test(R._obs||''))cgSintAuto(t,per,a,R,false);
    const sub=unid?(unidNomeComp(t)||'Unidade'):perNome(per);
    openDrawer('Critérios Gerais — Ficha do Aluno',`<div class="ed cgf">
      <div class="cgfh"><button type="button" class="btn sm ico" id="cgf-ant" aria-label="Aluno anterior" ${i?'':'disabled'}>‹</button>
        <div class="cgfn"><b>${esc(a.nome)}</b><small class="mut">N.º ${esc(numAl(a))} · ${esc(t.nome)} · ${esc(sub)}</small></div>
        <button type="button" class="btn sm ico" id="cgf-seg" aria-label="Aluno seguinte" ${i<al.length-1?'':'disabled'}>›</button></div>
      <p class="hint">Classifique cada indicador de <b>0 a 20</b>. Cada critério vale a média dos seus indicadores; vazio = ainda sem classificação.</p>
      ${G.map(d=>{const I=cgInd(d);const V=R[d.id]||{};
        return `<section class="cgfs"><div class="cgfsh"><b>${esc(d.nome)}</b><span class="mut">${String(d.peso).replace('.',',')}%</span><span class="sp1"></span><span class="cgft">Total <b data-cgt="${d.id}">${cgF1(critGVal(t,a.id,d.id,per)==null?null:critGVal(t,a.id,d.id,per)*20)}</b></span></div>
          ${I.length?I.map((n,k)=>`<label class="cgfr"><span>${esc(n)}</span><input class="cgfi" data-cgd="${d.id}" data-cgk="${k}" value="${V[k]==null?'':String(V[k]).replace('.',',')}" inputmode="decimal" placeholder="0–20" aria-label="${esc(n)}"></label>`).join('')
            :`<label class="cgfr"><span class="mut">Sem indicadores — classificação direta</span><input class="cgfi" data-cgd="${d.id}" data-cgdir="1" value="${(v=>v==null?'':String(Math.round(v*200)/10).replace('.',','))((((t.critG||{})[critGChave(t,per)]||{})[a.id]||{})[d.id])}" inputmode="decimal" placeholder="0–20" aria-label="${esc(d.nome)}"></label>`}</section>`}).join('')}
      <div class="cgfg"><span>Total global dos critérios gerais</span><b id="cgf-tg">${cgF1(total(a))}</b><small class="mut">média ponderada (0–20)</small></div>
      <div class="row cgfsr"><label style="margin:10px 0 0">Síntese descritiva</label><span class="sp1"></span><small class="mut" id="cgf-oa">${R._obsAuto?'escrita automaticamente':R._obs?'alterada à mão':''}</small><button type="button" class="btn sm" id="cgf-gen" title="Escrever a síntese a partir das notas (frases diferentes das dos colegas)">${ic('refresh',13)} ${R._obs?'Escrever de novo':'Escrever automaticamente'}</button></div><textarea id="cgf-obs" rows="4">${esc(R._obs||'')}</textarea>
      <p class="hint">${sec?'A nota de cada critério entra na Avaliação Final com o seu peso.':'Na Avaliação Final a média de 0–20 é convertida para percentagem.'}</p></div>`);
    const upd=()=>{G.forEach(d=>{const e=$('#dw-b [data-cgt="'+d.id+'"]');if(e){const v=critGVal(t,a.id,d.id,per);e.textContent=cgF1(v==null?null:v*20)}});const g=$('#cgf-tg');if(g)g.textContent=cgF1(total(a))};
    $$('#dw-b .cgfi').forEach(inp=>inp.onchange=()=>{const s=inp.value.trim().replace(',','.');const d=inp.dataset.cgd;
      if(s!==''){const n=+s;if(!isFinite(n)||n<0||n>20){toast('Valor entre 0 e 20.','erro');inp.focus();return}}
      if(inp.dataset.cgdir){const k=critGChave(t,per);t.critG=t.critG||{};const K=t.critG[k]=t.critG[k]||{};const r=K[a.id]=K[a.id]||{};if(s==='')delete r[d];else r[d]=+s/20}
      else{const r=R[d]=R[d]||{};if(s==='')delete r[inp.dataset.cgk];else r[inp.dataset.cgk]=+s}
      if(!R._obs||R._obsAuto)cgSintAuto(t,per,a,R,false);save();upd();inp.classList.add('ok');setTimeout(()=>inp.classList.remove('ok'),600)});
    $$('#dw-b .cgfi').forEach((inp,k,L)=>inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const n=L[k+1];if(n)n.focus();else{const b=$('#cgf-seg');if(b&&!b.disabled)b.click()}}}));
    $('#cgf-obs').oninput=e=>{R._obs=e.target.value;R._obsAuto=false;const o=$('#cgf-oa');if(o)o.textContent='alterada à mão';save()};$('#cgf-gen').onclick=()=>{if(R._obs&&!R._obsAuto&&!confirm('Substituir a síntese escrita à mão?'))return;cgSintAuto(t,per,a,R,true);save()};
    $('#cgf-ant').onclick=()=>{if(i>0){i--;draw()}};$('#cgf-seg').onclick=()=>{if(i<al.length-1){i++;draw();setTimeout(()=>{const f=$('#dw-b .cgfi');if(f)f.focus()},30)}};
    const f=$('#dw-b .cgfi');if(f)setTimeout(()=>f.focus(),30)};
  draw();
  const re=()=>{try{if(VIEW==='avaliacao')vAvaliacao();else if(VIEW==='modulos')vModulos()}catch(_){}};
  const x=$('#dw-x');if(x)x.addEventListener('click',re,{once:true})}

/* ---- tabela de todos os alunos (critGDlg): critérios com indicadores mostram a média da ficha e abrem a ficha ---- */
{const _cgD=critGDlg;critGDlg=function(t,per){const r=_cgD.apply(this,arguments);const unid=tUnid(t);let p=+per||perAtual(t);
  const fix=()=>{$$('#dw-b .cgin').forEach(i=>{const d=(t.dominios||[]).find(x=>x.id===i.dataset.cgd);if(!d||!cgInd(d).length)return;const v=critGVal(t,i.dataset.cga,d.id,p);
      i.readOnly=true;i.value=v==null?'':(isSec(t)||unid?String(Math.round(v*200)/10).replace('.',','):String(Math.round(v*100)));i.title='Média dos indicadores — toque para abrir a ficha';i.classList.add('cgro');i.onclick=()=>cgFicha(t,p,i.dataset.cga)})};
  fix();$$('#dw-b [data-cgp]').forEach(b=>b.addEventListener('click',()=>{p=+b.dataset.cgp;setTimeout(fix,0)}));return r}}

/* ---- barra dos critérios gerais: botão «Ficha por aluno» ---- */
{const _cgB=critGBarra;critGBarra=function(){const r=_cgB.apply(this,arguments);try{const t=T();const bar=$('#view .cgbar');if(!t||!bar||bar.querySelector('#cg-ficha'))return r;
    const b=document.createElement('button');b.type='button';b.className='btn sm';b.id='cg-ficha';b.innerHTML=ic('user',14)+' Ficha por aluno';b.onclick=()=>cgFicha(t,typeof UI!=='undefined'&&UI.per?UI.per:null);
    const c=bar.querySelector('#cg-abrir');if(c){c.before(b);c.innerHTML=ic('pencil',14)+' Todos os alunos';c.classList.remove('pri');b.classList.add('pri')}else bar.appendChild(b)}catch(e){console.warn(e)}return r}}

/* ---- Avaliação Final: as células dos critérios gerais abrem a ficha do aluno ---- */
{const _vAG=vAvaliacao;vAvaliacao=function(){const r=_vAG.apply(this,arguments);try{const t=T();if(!t||!domGer(t).length)return r;const p=UI.per;
    const D=t.dominios||[];const idx=D.map((d,k)=>d.ger?k:-1).filter(k=>k>=0);
    $$('#view tr[data-a]').forEach(tr=>{idx.forEach(k=>{const td=tr.cells[2+k];if(!td)return;td.classList.add('cgcel');td.title='Critério geral — toque para abrir a ficha de '+((t.alunos.find(a=>a.id===tr.dataset.a)||{}).nome||'');td.onclick=()=>cgFicha(t,p,tr.dataset.a)})})}catch(e){console.warn(e)}return r};if(go._f)go._f.avaliacao=vAvaliacao}

/* ---- Critérios: indicadores do critério geral, indentados por baixo ---- */
function cgIndDlg(t,k){const d=(t.dominios||[])[k];if(!d)return;
  openDrawer('Indicadores — '+d.nome,`<div class="ed"><p class="hint" style="margin-top:0">Um indicador por linha. Na Avaliação Final cada um é classificado de 0 a 20 na ficha do aluno e <b>${esc(d.nome)}</b> vale a média deles. Sem indicadores, o critério classifica-se diretamente.</p>
    <textarea id="cgi-t" rows="10">${esc(cgInd(d).join('\n'))}</textarea>
    <div class="row" style="margin-top:10px;gap:8px">${cgIndDef(d).length?'<button type="button" class="btn sm" id="cgi-def">Repor os predefinidos</button>':''}<span class="sp1"></span><button type="button" class="btn pri" id="cgi-ok">Guardar</button></div></div>`);
  const d0=$('#cgi-def');if(d0)d0.onclick=()=>{$('#cgi-t').value=cgIndDef(d).join('\n')};
  $('#cgi-ok').onclick=()=>{const L=$('#cgi-t').value.split('\n').map(x=>x.trim()).filter(Boolean);
    const ant=cgInd(d);if(ant.length&&L.join('\n')!==ant.join('\n')&&JSON.stringify(t.critGI||{}).indexOf('"'+d.id+'"')>=0&&!confirm('Já há classificações nesta ficha. As classificações ficam ligadas à posição de cada indicador (1.º, 2.º…). Continuar?'))return;
    d.ind=L;save();closeDrawer();vCriterios()}}
{const _vCG=vCriterios;vCriterios=function(){const r=_vCG.apply(this,arguments);try{const t=T();if(!t)return r;const D=t.dominios||[];
    /* UFCD/módulo: sem períodos — não mostra «Classificação final por período» */
    if(tUnid(t))$$('#view .card').forEach(c=>{const h=c.querySelector(':scope>h2');if(h&&/^Classificação final por /i.test(h.textContent.trim()))c.style.display='none'});
    $$('#view tr[data-k]').forEach(tr=>{const k=+tr.dataset.k;const d=D[k];if(!d||!d.ger)return;const I=cgInd(d);const n=tr.cells.length;
      const h=I.map(x=>`<tr class="cgir"><td></td><td colspan="${Math.max(1,n-1)}"><span class="cgii">${esc(x)}</span></td></tr>`).join('')+
        `<tr class="cgir cgirb"><td></td><td colspan="${Math.max(1,n-1)}"><span class="mut">${I.length?I.length+' indicadores · classificados de 0 a 20 na ficha do aluno (Avaliação Final)':'Sem indicadores — classificado diretamente na Avaliação Final'}</span> <button type="button" class="btn sm" data-cgind="${k}">${ic('pencil',13)} ${I.length?'Editar indicadores':'Adicionar indicadores'}</button></td></tr>`;
      tr.insertAdjacentHTML('afterend',h)});
    $$('#view [data-cgind]').forEach(b=>b.onclick=()=>cgIndDlg(t,+b.dataset.cgind))}catch(e){console.warn(e)}return r};if(go._f)go._f.criterios=vCriterios}

/* ---- síntese descritiva automática da ficha: frases escolhidas pelas notas; em cada parte usa a variante menos usada
   pelos colegas da turma (nesta UFCD/período), por isso duas sínteses nunca saem iguais. Escolhas em R._sv ---- */
const CG_NIV=v=>v==null?null:v>=17.5?'E':v>=13.5?'B':v>=9.5?'S':'I';
const CG_ABRE={E:['{N} revelou {q} atitudes e valores exemplares.','{Q}, {N} manteve uma conduta muito positiva e responsável.','{N} destacou-se {q} pela forma exemplar como esteve nas aulas.','{Q}, {N} teve uma postura irrepreensível.'],
  B:['{N} revelou {q} boas atitudes e valores.','{Q}, {N} manteve uma postura positiva.','{N} teve {q} uma atitude globalmente boa.','{Q}, {N} mostrou uma conduta correta e empenhada.'],
  S:['{Q}, a atitude de {N} foi satisfatória, com aspetos a melhorar.','{N} cumpriu {q} o essencial no que respeita a atitudes e valores.','{Q}, {N} teve uma postura aceitável, mas irregular.'],
  I:['{N} revelou {q} atitudes e valores abaixo do esperado.','{Q}, a postura de {N} precisa de melhorar.','{N} não alcançou {q} o que se pede em atitudes e valores.','{Q}, {N} teve uma atitude que fica aquém do que se espera.']};
const CG_LEAD=['No critério {C}','Em {C}','No que respeita a {C}','Quanto a {C}'];
const CG_COMP={E:['o desempenho foi excelente','revelou-se exemplar','atingiu um nível muito elevado','esteve sempre ao melhor nível'],
  B:['o desempenho foi bom','revelou-se consistente e positivo','mostrou um nível bom','teve uma atuação positiva e regular'],
  S:['o desempenho foi suficiente','atingiu o nível esperado, embora possa melhorar','revelou-se satisfatório','cumpriu o essencial, com margem para progredir'],
  I:['o desempenho ficou aquém do esperado','revelou dificuldades que tem de ultrapassar','não atingiu o nível desejado','ficou claramente abaixo do esperado']};
const CG_FORTE=[', destacando-se em {i}',', sobretudo em {i}',', com especial destaque para {i}'];
const CG_FRACO=[', devendo melhorar em {i}',', embora precise de investir mais em {i}',', mas tem de melhorar em {i}'];
const CG_FECHO={E:['Parabéns pelo excelente trabalho; deve manter esta postura.','É um exemplo para os colegas e deve continuar assim.','Deve manter este nível de empenho e responsabilidade.'],
  B:['Com mais empenho poderá alcançar um nível ainda melhor.','Deve continuar a trabalhar neste sentido.','Está no bom caminho e deve manter a regularidade.'],
  S:['Deve empenhar-se mais para melhorar os aspetos assinalados.','Com mais atenção e responsabilidade poderá progredir.','Espera-se uma evolução positiva daqui em diante.'],
  I:['É fundamental mudar de atitude para conseguir progredir.','Precisa de um esforço claro e imediato para melhorar.','Pode contar com o apoio do formador para ultrapassar estas dificuldades.']};
function cgSintAuto(t,per,a,R,novo){const G=domGer(t);const V=G.map(d=>{const v=critGVal(t,a.id,d.id,per);return {d,v:v==null?null:v*20}}).filter(x=>x.v!=null);if(!V.length)return;
  const K=((t.critGI||{})[critGChave(t,per)])||{};const uso={};Object.keys(K).forEach(id=>{if(id===a.id)return;const sv=(K[id]||{})._sv||{};Object.keys(sv).forEach(s=>{const k=s+':'+sv[s];uso[k]=(uso[k]||0)+1})});
  const ant=R._sv||{};const sv={};
  const gU={};const esc_=(slot,n,grp)=>{const gs=grp?(gU[grp]=gU[grp]||new Set()):null;let best=-1,bu=1e9;const h=sdtHash(a.id+'|'+slot+(novo?'|'+Date.now():''));for(let j=0;j<n;j++){const k=(j+h)%n;let u=uso[slot+':'+k]||0;if(novo&&ant[slot]===k)u+=.5;if(gs&&gs.has(k))u+=100;if(u<bu){bu=u;best=k}}sv[slot]=best;if(gs)gs.add(best);return best};
  const F=a.genero==='F';const nm=String(a.nome||'').split(' ')[0];const N=nm||(F?'A aluna':'O aluno');
  const unid=tUnid(t);const U=unid?unidMod(t):null;const q=unid?((U.art==='a'?'nesta ':'neste ')+U.um):'neste '+perW().toLowerCase();const Q=q.charAt(0).toUpperCase()+q.slice(1);
  let tg=0,w=0;V.forEach(x=>{const p=+x.d.peso||1;tg+=x.v*p;w+=p});const ng=CG_NIV(tg/w);
  const P=[];let ab=CG_ABRE[ng][esc_('a',CG_ABRE[ng].length)];P.push(ab.replace('{N}',N).replace('{q}',q).replace('{Q}',Q));
  const low=s=>String(s||'').toLowerCase();
  V.forEach(x=>{const nv=CG_NIV(x.v);const lead=CG_LEAD[esc_('l'+x.d.id,CG_LEAD.length,'l')].replace('{C}',x.d.nome);let fr=lead+', '+CG_COMP[nv][esc_('c'+x.d.id,CG_COMP[nv].length,'c'+nv)];
    const I=cgInd(x.d);const Rv=(R[x.d.id]||{});const vals=I.map((n,k)=>({n,v:Rv[k]==null||Rv[k]===''?null:+Rv[k]})).filter(z=>z.v!=null);
    if(vals.length>1){const mx=vals.reduce((p,z)=>z.v>p.v?z:p),mn=vals.reduce((p,z)=>z.v<p.v?z:p);
      if(mx.v-mn.v>=3){if(nv==='E'||nv==='B')fr+=CG_FORTE[esc_('f'+x.d.id,CG_FORTE.length,'f')].replace('{i}',low(mx.n));else fr+=CG_FRACO[esc_('w'+x.d.id,CG_FRACO.length,'w')].replace('{i}',low(mn.n))}
      else if((nv==='S'||nv==='I')&&mn.v<9.5)fr+=CG_FRACO[esc_('w'+x.d.id,CG_FRACO.length,'w')].replace('{i}',low(mn.n))}
    P.push(fr+'.')});
  P.push(CG_FECHO[ng][esc_('z',CG_FECHO[ng].length)]);
  R._obs=P.join(' ');R._obsAuto=true;R._sv=sv;const o=$('#cgf-obs');if(o)o.value=R._obs;const l=$('#cgf-oa');if(l)l.textContent='escrita automaticamente';const g=$('#cgf-gen');if(g)g.innerHTML=ic('refresh',13)+' Escrever de novo'}
/* ---- nomes completos nas dicas (tooltips): critérios abreviados no cabeçalho e nomes de alunos cortados ---- */
function cgDicas(t){try{const v=$('#view');if(!v||!t)return;const D=t.dominios||[];
  v.querySelectorAll('thead th').forEach(th=>{if(th.title)return;const tx=(th.childNodes[0]&&th.childNodes[0].nodeType===3?th.childNodes[0].nodeValue:th.textContent).trim();const d=D.find(x=>x.ab&&(tx===x.ab||tx.indexOf(x.ab+' ')===0||tx.indexOf(x.ab)===0&&/^\d/.test(tx.slice(x.ab.length))));if(d)th.title=d.nome+(d.peso!=null?' · '+String(d.peso).replace('.',',')+'%':'')+(d.ger?' · critério geral':'')});
  v.querySelectorAll('tr[data-a] td.stk, tr[data-a] td:nth-child(2)').forEach(td=>{if(td.title)return;const a=t.alunos.find(x=>x.id===td.closest('tr').dataset.a);if(a)td.title=a.nome})}catch(e){console.warn(e)}}
{const _vAD=vAvaliacao;vAvaliacao=function(){const r=_vAD.apply(this,arguments);cgDicas(T());return r};if(go._f)go._f.avaliacao=vAvaliacao}
{const _vID=vInstrumentos;vInstrumentos=function(){const r=_vID.apply(this,arguments);setTimeout(()=>cgDicas(T()),0);return r};if(go._f)go._f.instrumentos=vInstrumentos}
/* ---- Classificações por UFCD/módulo: vão buscar automaticamente a nota da Avaliação Final de cada unidade
   (critérios específicos pelos instrumentos + critérios gerais pela ficha ou classificação direta); a «Atribuída» da pauta da unidade prevalece ---- */
function cgValK(t,aid,d,k){const I=cgInd(d);if(I.length){const R=(((((t.critGI||{})[k])||{})[aid])||{})[d.id]||{};const v=I.map((_,i)=>R[i]).filter(x=>x!=null&&x!=='').map(Number).filter(x=>isFinite(x));if(v.length)return v.reduce((a,b)=>a+b,0)/v.length/20}
  const v=((((t.critG||{})[k])||{})[aid]||{})[d.id];return v==null||v===''?null:+v}
{const _nMA=notaModAuto;notaModAuto=function(t,aid,mid){if(!t||!t.porModulo||!tUnid(t))return _nMA.apply(this,arguments);const m=(t.modulos||[]).find(x=>x.id===mid);if(!m||!m.av)return null;const k='u:'+m.id;
  const at=(((t.atrib||{})[k])||{})[aid];if(at!=null&&at!==''&&isFinite(+String(at).replace(',','.')))return +String(at).replace(',','.');
  const D=m.av.dominios||[],I=m.av.instrumentos||[];if(!D.length)return null;const p={};
  D.forEach(d=>{if(d.ger){p[d.id]=cgValK(t,aid,d,k);return}const v=I.map(i=>instDom(i,aid,d.id)).filter(Boolean).map(x=>x.pct);p[d.id]=v.length?v.reduce((a,b)=>a+b,0)/v.length:null});
  if(!D.some(d=>p[d.id]!=null))return null;const f=ponderada({dominios:D},p);return f==null?null:Math.round(f*20)}}
/* ---- itens de instrumentos ligados a um critério que já não existe na unidade (aparecia «?» em Domínios e o instrumento não contava):
   se a unidade tem um só critério específico, os itens passam para ele; se o nome/abreviatura antigo coincidir com um critério específico, vão para esse ---- */
function cgOrfaos(t){try{if(!t||!t.porModulo||!tUnid(t))return 0;let n=0;
  (t.modulos||[]).forEach(m=>{const av=m.av;if(!av)return;const D=av.dominios||[];const ids=new Set(D.map(d=>d.id));const E=D.filter(d=>!d.ger);if(!E.length)return;
    const gerIds=new Set(D.filter(d=>d.ger).map(d=>d.id));(av.instrumentos||[]).forEach(i=>(i.itens||[]).forEach(it=>{/* itens de um teste ligados a um critério geral: os gerais não usam instrumentos → passam para o único critério específico */if(it.dom&&gerIds.has(it.dom)&&!i.profAtt){if(E.length===1){it.dom=E[0].id;n++}return}if(!it.dom||ids.has(it.dom))return;const velho=((t.__mod&&t.__mod.dominios)||[]).find(d=>d.id===it.dom);
      const alvo=(velho&&E.find(d=>normT(d.ab)===normT(velho.ab)||normT(d.nome)===normT(velho.nome)))||(E.length===1?E[0]:null);if(alvo){it.dom=alvo.id;n++}}))});
  if(n)save();return n}catch(e){console.warn(e);return 0}}
{const _gO=go;go=function(){try{cgOrfaos(T())}catch(_){}return _gO.apply(this,arguments)}}
/* ---- Classificações por UFCD/módulo: só leitura — a nota de cada unidade vem da sua Avaliação Final (lá se muda, em «Atribuída») ---- */
{const _vMR=vModulos;vModulos=function(){const r=_vMR.apply(this,arguments);try{const t=T();if(!t||!tUnid(t))return r;
    $$('#view input[data-mn]').forEach(i=>{const [aid,mid]=i.dataset.mn.split('|');const v=notaMod(t,aid,mid);const s=document.createElement('b');s.className='mnro';s.textContent=v==null?'':String(v).replace('.',',');
      s.title='Vem da Avaliação Final desta unidade — para mudar, abra a Avaliação Final da unidade e use «Atribuída»';s.onclick=()=>{modEscolher(t,mid);go('avaliacao')};i.replaceWith(s)});
    $$('#view .card .row .mut').forEach(e=>{if(/automático: nota da Avaliação Final/.test(e.textContent))e.textContent=e.textContent.replace(/\s*\(escrever por cima substitui\)/,' — toque na nota para abrir a Avaliação Final')})}catch(e){console.warn(e)}return r};if(go._f)go._f.modulos=vModulos}

/* ---- Autoavaliação na Avaliação Final: preenchida sozinha com a classificação que o aluno propôs (telemóvel ou ficha do aluno);
   se o aluno só respondeu por critério (1 a 4), propõe-se a média ponderada (1 → 5, 2 → 10, 3 → 15, 4 → 20) ---- */
function cgAutoNota(t,a,p){try{const AV=autoD(a,p)||{};if(AV.nota!==''&&AV.nota!=null)return {v:String(AV.nota),src:AV.origem==='aluno'?'telemóvel':'ficha do aluno'};
    const dom=AV.dom||{};let s=0,w=0;(t.dominios||[]).forEach(d=>{const l=+dom[d.id];if(l>=1&&l<=4&&+d.peso>0){s+=l*5*d.peso;w+=+d.peso}});
    if(!w)return null;const n=s/w;return {v:isSec(t)||tUnid(t)?String(Math.round(n*10)/10).replace('.',','):String(Math.round(n*5)),src:'calculada das respostas por critério',calc:true}}catch(_){return null}}
{const _vAA=vAvaliacao;vAvaliacao=function(){const r=_vAA.apply(this,arguments);try{const t=T();if(!t)return r;const p=tUnid(t)?1:UI.per;
    $$('#view tr[data-a] [data-av]').forEach(inp=>{if(inp.value.trim())return;const a=t.alunos.find(x=>x.id===inp.closest('tr').dataset.a);if(!a)return;const o=cgAutoNota(t,a,p);if(!o)return;
      inp.value=o.v;inp.title='Autoavaliação ('+o.src+')';if(o.calc)inp.classList.add('aucalc')})}catch(e){console.warn(e)}return r};if(go._f)go._f.avaliacao=vAvaliacao}
/* ---- «Como foi calculado» nas UFCD/módulos: sem períodos; instrumentos só com os critérios específicos; critérios gerais pela ficha ---- */
{const _eN=explicarNota;explicarNota=function(t,aid,per,pAte){if(!tUnid(t))return _eN.apply(this,arguments);const x=t.alunos.find(z=>z.id===aid);if(!x)return;
  const U=v=>v==null?'—':pctD(t,v);const pc=pctsFinal(t,aid,1);const f=ponderada(t,pc);const E=domEsp(t),G=domGer(t);const nm=unidNomeComp(t)||'Unidade';
  const I=(t.instrumentos||[]).filter(i=>instMax(i)&&(i.itens||[]).some(it=>E.some(d=>d.id===it.dom)));
  const tab=E.length?`<div class="tblw"><table class="lst expt"><thead><tr><th>Instrumento</th>${E.map(d=>`<th style="--dc:${domCor(t,d)}"><b>${esc(d.nome)}</b><small>${+d.peso||0}%</small></th>`).join('')}</tr></thead><tbody>
    ${I.map(i=>{const k=instAlunoEstado(t,i,aid);return `<tr class="${['completo','incompleta'].includes(k)||(k==='faltou'&&(i.nr||{})[aid]==='z')?'':'expx'}"><td><b>${esc(i.nome)}</b><small class="mut">${esc(fmtIso(i.data||''))} · ${esc((EST_INST[k]||['Não realizou'])[0].toLowerCase())}</small></td>${E.map(d=>{const r=instDom(i,aid,d.id);return `<td>${r?`<b>${U(r.pct)}</b><small class="mut">${nf(r.pts,2)}/${nf(r.max,2)} pontos</small>`:'<span class="mut">·</span>'}</td>`}).join('')}</tr>`}).join('')||`<tr><td colspan="${E.length+1}" class="mut">Sem instrumentos classificados.</td></tr>`}
    <tr class="exps"><td><b>Média ${unidMod(t).art==='a'?'da':'do'} ${esc(unidMod(t).um)}</b><small class="mut">média simples dos instrumentos</small></td>${E.map(d=>`<td><b>${U(domPer(t,aid,d.id,1))}</b></td>`).join('')}</tr></tbody></table></div>`:'<p class="mut">Não há critérios específicos.</p>';
  const ger=G.length?`<div class="exger">${G.map(d=>{const v=critGVal(t,aid,d.id,1);const n=cgInd(d).length;return `<div class="exgr"><span style="color:${domCor(t,d)}"><b>${esc(d.nome)}</b> · ${String(d.peso).replace('.',',')}%</span><span class="mut">${n?'média de '+n+' indicadores':'classificação direta'}</span><b>${v==null?'—':cgF1(v*20)}</b></div>`}).join('')}<button type="button" class="btn sm" id="ex-ficha">${ic('user',13)} Abrir a ficha de ${esc(x.nome.split(' ')[0])}</button></div>`:'';
  const usados=t.dominios.filter(d=>pc[d.id]!=null&&+d.peso>0);const wT=Math.round(usados.reduce((s_,d)=>s_+ +d.peso,0)*1e6)/1e6;const wAll=Math.round(t.dominios.reduce((s_,d)=>s_+(+d.peso||0),0)*1e6)/1e6;
  const formula=usados.map(d=>`<span style="color:${domCor(t,d)}">${esc(d.nome)}</span> ${U(pc[d.id])} × ${String(d.peso).replace('.',',')}%`).join(' + ');const falta=t.dominios.filter(d=>pc[d.id]==null&&+d.peso>0);
  const ok=f!=null&&f*20>=9.5;
  openDrawer('Como foi calculado — '+x.nome.split(' ')[0],`<div class="ed expl"><p class="hint" style="margin-top:0">${esc(x.nome)} · ${esc(t.nome)} · ${esc(nm)}</p>
    <ol class="exsteps"><li><b>Critérios específicos — instrumentos</b> — em cada instrumento, pontos obtidos ÷ cotação total; o critério vale a média dos instrumentos.${tab}</li>
    ${G.length?`<li><b>Critérios gerais — ficha do aluno</b> — sem instrumentos: cada critério vale a média dos seus indicadores (0 a 20).${ger}</li>`:''}
    <li><b>Ponderação</b> — (${formula||'sem dados'}) ÷ ${String(wT).replace('.',',')}%${wT!==wAll?` <span class="tag w">pesos reajustados: ${falta.map(d=>esc(d.nome)).join(', ')} ainda sem classificação</span>`:''} = <b>${f==null?'—':nf(f*20,3)+' valores'}</b></li>
    <li><b>Arredondamento</b> (${['unidades','décimas','centésimas'][notaDec()]}) → <b>${f==null?'—':fmtNota(t,f)}</b>${f!=null?' → classificação '+nivel(t,f)+` <span class="tag ${ok?'ok':'bad'}">${ok?'aprovado(a) — a partir de 9,5':'não aprovado(a) — abaixo de 9,5'}</span>`:''}</li></ol></div>`);
  const b=$('#ex-ficha');if(b)b.onclick=()=>cgFicha(t,1,aid)}}
/* ===== Língua Estrangeira I - Inglês (PROFIJ, modelo «PROFIJ II - Tipo 2»): a mesma relação das UFCD =====
   PO, CO, PE, CE = critérios específicos (testes orais e escritos); Atitudes e Valores (ER, A, AC, RI) = critérios gerais (ficha na Avaliação Final).
   Turmas que já tinham o modelo aplicado: os subdomínios de Atitudes e Valores passam a «Geral» (uma vez por turma). */
const CG_LE=t=>!!t&&typeof ofertaDe==='function'&&ofertaDe(t)==='profij'&&/l[ií]ngua estrangeira/i.test(t.disciplina||'');
function cgGeraisLE(t){try{if(!CG_LE(t)||t._gerLE)return;const N=PROF_ATIT.map(g=>normT(g.nome));let n=0;
  (t.dominios||[]).forEach(d=>{if(d.ger)return;if(/atitudes e valores|saber (ser|estar)/i.test(normT(d.grupo||''))||N.includes(normT(d.nome))){d.ger=true;n++}});t._gerLE=1;save()}catch(e){console.warn(e)}}
{const _gLE=go;go=function(){try{cgGeraisLE(T())}catch(_){}return _gLE.apply(this,arguments)}}
/* «Domínios por período»: com critérios gerais, mostra só os específicos (os gerais não têm instrumentos — classificam-se na ficha) */
{const _vDG=vDominios;vDominios=function(){const t=T();const G=t?domGer(t):[];if(!G.length)return _vDG.apply(this,arguments);const E=domEsp(t);if(!E.length)return _vDG.apply(this,arguments);
  if(!UI.dom||G.some(d=>d.id===UI.dom))UI.dom=E[0].id;const r=_vDG.apply(this,arguments);
  try{G.forEach(d=>$$('#view [data-dm="'+d.id+'"]').forEach(b=>b.remove()));const e=$('#ttl');if(e)e.textContent=e.textContent.replace(/^Domínios por período/i,'Critérios específicos por período');
    const tb=$('#view [data-dm]');const bar=tb&&tb.parentElement;if(bar&&!$('#view .cgdomn'))bar.insertAdjacentHTML('afterend',`<p class="hint cgdomn">${ic('flag',13)} Critérios gerais (${esc(G.map(d=>d.nome).join(', '))}): não usam instrumentos — classificam-se na <a href="#" id="cg-dom-f">ficha do aluno, na Avaliação Final</a>.</p>`);
    const a=$('#cg-dom-f');if(a)a.onclick=e=>{e.preventDefault();cgFicha(t,UI.per||perAtual(t))}}catch(e){console.warn(e)}return r};if(go._f)go._f.dominios=vDominios}
/* «Como foi calculado» também nas disciplinas com critérios gerais (por período) */
{const _eN2=explicarNota;explicarNota=function(t,aid,per,pAte){if(tUnid(t)||!domGer(t).length)return _eN2.apply(this,arguments);const x=t.alunos.find(z=>z.id===aid);if(!x)return;const p=per||pAte||perAtual(t);
  const U=v=>v==null?'—':pctD(t,v);const pc=per==null?pctsFinal(t,aid,p):pctsPer(t,aid,p);const f=ponderada(t,pc);const E=domEsp(t),G=domGer(t);const acum=per==null&&p>1&&t.regra[p]!=='periodo';
  const I=(t.instrumentos||[]).filter(i=>+i.periodo===p&&instMax(i)&&(i.itens||[]).some(it=>E.some(d=>d.id===it.dom)));
  const tab=`<div class="tblw"><table class="lst expt"><thead><tr><th>Instrumento</th>${E.map(d=>`<th style="--dc:${domCor(t,d)}"><b>${esc(d.nome)}</b><small>${+d.peso||0}%</small></th>`).join('')}</tr></thead><tbody>
    ${I.map(i=>{const k=instAlunoEstado(t,i,aid);return `<tr class="${['completo','incompleta'].includes(k)||(k==='faltou'&&(i.nr||{})[aid]==='z')?'':'expx'}"><td><b>${esc(i.nome)}</b><small class="mut">${esc(fmtIso(i.data||''))} · ${esc((EST_INST[k]||['Não realizou'])[0].toLowerCase())}</small></td>${E.map(d=>{const r=instDom(i,aid,d.id);return `<td>${r?`<b>${U(r.pct)}</b><small class="mut">${nf(r.pts,2)}/${nf(r.max,2)} pontos</small>`:'<span class="mut">·</span>'}</td>`}).join('')}</tr>`}).join('')||`<tr><td colspan="${E.length+1}" class="mut">Sem instrumentos neste ${perW().toLowerCase()}.</td></tr>`}
    <tr class="exps"><td><b>Média do ${p}.º ${perW().toLowerCase()}</b><small class="mut">média simples dos instrumentos</small></td>${E.map(d=>`<td><b>${U(domPer(t,aid,d.id,p))}</b></td>`).join('')}</tr></tbody></table></div>`;
  const ger=`<div class="exger">${G.map(d=>{const v=critGVal(t,aid,d.id,p);const n=cgInd(d).length;return `<div class="exgr"><span style="color:${domCor(t,d)}"><b>${esc(d.nome)}</b> · ${String(d.peso).replace('.',',')}%</span><span class="mut">${n?'média de '+n+' indicadores':'classificação direta'}</span><b>${v==null?'—':cgF1(v*20)}</b></div>`}).join('')}<button type="button" class="btn sm" id="ex-ficha">${ic('user',13)} Abrir a ficha de ${esc(x.nome.split(' ')[0])}</button></div>`;
  const usados=t.dominios.filter(d=>pc[d.id]!=null&&+d.peso>0);const wT=Math.round(usados.reduce((s_,d)=>s_+ +d.peso,0)*1e6)/1e6;const wAll=Math.round(t.dominios.reduce((s_,d)=>s_+(+d.peso||0),0)*1e6)/1e6;const falta=t.dominios.filter(d=>pc[d.id]==null&&+d.peso>0);
  const formula=usados.map(d=>`<span style="color:${domCor(t,d)}">${esc(d.nome)}</span> ${U(pc[d.id])} × ${String(d.peso).replace('.',',')}%`).join(' + ');
  openDrawer('Como foi calculado — '+x.nome.split(' ')[0],`<div class="ed expl"><p class="hint" style="margin-top:0">${esc(x.nome)} · ${esc(t.nome)} · ${esc(t.disciplina)} · ${acum?'nota final acumulada até ao '+p+'.º '+perW().toLowerCase():p+'.º '+perW().toLowerCase()}</p>
    <ol class="exsteps"><li><b>Critérios específicos — testes e trabalhos</b> — em cada instrumento, pontos obtidos ÷ cotação dos itens desse critério; o critério vale a média dos instrumentos.${tab}</li>
    <li><b>Critérios gerais — ficha do aluno</b> — sem instrumentos: cada critério vale a média dos seus indicadores (0 a 20).${ger}</li>
    ${acum?`<li><b>Acumulado</b> — cada critério é a média dos períodos 1.º a ${p}.º.</li>`:''}
    <li><b>Ponderação</b> — (${formula||'sem dados'}) ÷ ${String(wT).replace('.',',')}%${wT!==wAll?` <span class="tag w">pesos reajustados: ${falta.map(d=>esc(d.nome)).join(', ')} ainda sem classificação</span>`:''} = <b>${f==null?'—':(isSec(t)?nf(f*20,3)+' valores':nf(f*100,2)+'%')}</b></li>
    <li><b>Arredondamento</b> (${['unidades','décimas','centésimas'][notaDec()]}) → <b>${f==null?'—':fmtNota(t,f)}</b>${f!=null?(isSec(t)?' → classificação '+nivel(t,f):' → nível '+nivel(t,f))+` <span class="tag ${negativa(t,f)?'bad':'ok'}">${negativa(t,f)?'negativa':'positiva'}</span>`:''}</li></ol></div>`);
  const b=$('#ex-ficha');if(b)b.onclick=()=>cgFicha(t,p,aid)}}
/* PROFIJ: as disciplinas (ex.: Língua Estrangeira - Inglês) não são UFCD — o separador «UFCD» só aparece na pauta das UFCD/UC */
{const _nM=navModular;navModular=function(){const r=_nM.apply(this,arguments);try{const t=T();if(t&&ofertaDe(t)==='profij'&&!ehUnidC(t)){document.querySelectorAll('#side [data-v="modulos"],#tnavHold [data-v="modulos"]').forEach(b=>{b.hidden=true;b.style.display='none'});if(VIEW==='modulos')setTimeout(()=>go('painel'),0)}}catch(e){console.warn(e)}return r}}
/* ---- Editar Turma (PROFIJ): «Nível de ensino» — Ensino Básico ou Secundário; é o que aparece no cabeçalho dos relatórios ---- */
{const _eNv=editarTurmaDlg;editarTurmaDlg=function(t){const r=_eNv.apply(this,arguments);try{const sync=()=>{const w=$('#et-acurw');if(!w)return;let n=$('#et-nivw');
      if(!n){w.insertAdjacentHTML('afterend',`<div id="et-nivw"><label for="et-niv">Nível de ensino</label><select id="et-niv"><option value="bas" ${t.nivelEns!=='sec'?'selected':''}>Ensino Básico</option><option value="sec" ${t.nivelEns==='sec'?'selected':''}>Ensino Secundário</option></select></div>`);n=$('#et-nivw')}
      n.style.display=w.style.display};sync();const wr=$('#et-ofw');if(wr)wr.addEventListener('click',()=>setTimeout(sync,10));
    const ok=$('#et-ok');if(ok)ok.addEventListener('click',()=>{const s=$('#et-niv'),n=$('#et-nivw');if(!s||!n||n.style.display==='none')return;const a=A();const L=[t,...((($('#et-irm')||{}).checked)?a.turmas.filter(x=>x!==t&&normTurma(x.nome)===normTurma(t.nome)&&escId(escolaDe(x))===escId(escolaDe(t))):[])];L.forEach(x=>x.nivelEns=s.value)},true)}catch(e){console.warn(e)}return r}}
/* ---- Relatório individual: secção «Elementos de avaliação» — a nota de cada teste/trabalho e a ficha dos critérios gerais ---- */
function relElementos(t,a,per){try{const un=tUnid(t);const P=un?null:relPers(t,per);const E=domEsp(t);
  const I=(t.instrumentos||[]).filter(i=>instMax(i)&&(un||P.includes(+i.periodo))&&(i.itens||[]).some(it=>E.some(d=>d.id===it.dom)||!domGer(t).length)).sort((x,y)=>(+x.periodo-+y.periodo)||String(x.data||'').localeCompare(String(y.data||'')));
  const linha=i=>{const tot=instTotal(i,a.id);const mx=instMax(i);const f=tot==null||!mx?null:tot/mx;const k=instAlunoEstado(t,i,a.id);const nr=(i.nr||{})[a.id];
    const cr=E.filter(d=>(i.itens||[]).some(it=>it.dom===d.id)).map(d=>d.nome).join(', ');
    const nota=f!=null?fmtNota(t,f)+(isSec(t)||un?'':'')+' <span style="color:#666">('+nf(tot,2)+'/'+nf(mx,2)+')</span>':nr==='j'?'não realizou (não conta)':nr==='z'?'não realizou (conta 0)':'—';
    return `<tr><td>${esc(i.nome)}</td><td>${esc(i.tipo||'')}</td><td class="c">${esc(fmtIso(i.data||''))}${!un&&P.length>1?' · '+i.periodo+'.º':''}</td><td>${esc(cr)}</td><td class="c"><b>${nota}</b></td></tr>`};
  const G=domGer(t);const gk=un?1:per;
  const ger=G.length?`<table style="margin-top:8px"><thead><tr><th>Critério geral (ficha)</th><th class="c">Ponderação</th><th class="c">Classificação</th></tr></thead><tbody>${G.map(d=>{const v=critGVal(t,a.id,d.id,gk);return `<tr><td>${esc(d.nome)}</td><td class="c">${String(d.peso).replace('.',',')}%</td><td class="c">${v==null?'—':cgF1(v*20)}</td></tr>`}).join('')}</tbody></table>`:'';
  if(!I.length&&!ger)return '';
  return `<div class="sec">Elementos de avaliação</div>${I.length?`<table><thead><tr><th>Elemento</th><th>Tipo</th><th class="c">Data</th><th>Critérios</th><th class="c">Classificação</th></tr></thead><tbody>${I.map(linha).join('')}</tbody></table>`:'<p style="color:#666;margin:4px 0">Ainda sem testes ou trabalhos classificados.</p>'}${ger}`}catch(e){console.warn(e);return ''}}
{const _rel=relatorio;relatorio=function(t,a,per){const h=_rel.apply(this,arguments);try{const x=relElementos(t,a,per);if(!x||typeof h!=='string')return h;const k=h.indexOf('<div class="sec">Síntese descritiva</div>');return k>=0?h.slice(0,k)+x+h.slice(k):h}catch(_){return h}}}
/* PDF dos relatórios (motor de documentos): a mesma secção */
{const _rB2=relBlocos;relBlocos=function(t,x,per){const B=_rB2.apply(this,arguments);try{const un=tUnid(t);const P=un?null:relPers(t,per);const E=domEsp(t);
  const I=(t.instrumentos||[]).filter(i=>instMax(i)&&(un||P.includes(+i.periodo))&&(i.itens||[]).some(it=>E.some(d=>d.id===it.dom)||!domGer(t).length));
  const G=domGer(t);if(!I.length&&!G.length)return B;const k=B.findIndex(b=>b&&b.h==='Síntese Descritiva');
  const add=[{h:'Elementos de Avaliação'}];if(I.length)add.push({tabela:{cab:['Elemento','Tipo','Data','Classificação'],linhas:I.map(i=>{const tot=instTotal(i,x.id),mx=instMax(i);const f=tot==null||!mx?null:tot/mx;const nr=(i.nr||{})[x.id];return [i.nome,i.tipo||'',fmtIso(i.data||''),f!=null?fmtNota(t,f)+' ('+nf(tot,2)+'/'+nf(mx,2)+')':nr==='j'?'não realizou (não conta)':nr==='z'?'não realizou (conta 0)':'—']})}});
  if(G.length)add.push({tabela:{cab:['Critério geral (ficha)','Ponderação','Classificação'],linhas:G.map(d=>{const v=critGVal(t,x.id,d.id,un?1:per);return [d.nome,String(d.peso).replace('.',',')+'%',v==null?'—':cgF1(v*20)]})}});
  if(k>=0)B.splice(k,0,...add);else B.push(...add);return B}catch(e){console.warn(e);return B}}}
/* ---- Em toda a app: abreviaturas com dica (tooltip) a dizer o que são — critérios da turma (ER, CC, PO…), períodos (1.º P) e siglas da escola ---- */
const ABR_FIXAS={ASE:'Ação Social Escolar',UFCD:'Unidade de Formação de Curta Duração',UC:'Unidade de Competência',PROFIJ:'Programa Formativo de Inserção de Jovens',DT:'Diretor(a) de Turma',EE:'Encarregado(a) de Educação',FCT:'Formação em Contexto de Trabalho',FPCT:'Formação Prática em Contexto de Trabalho',PAP:'Prova de Aptidão Profissional',PAF:'Prova de Avaliação Final',PEA:'Prova Especial de Avaliação',CNQ:'Catálogo Nacional de Qualificações',TIC:'Tecnologias de Informação e Comunicação','DL 54/2018':'Decreto-Lei n.º 54/2018 — educação inclusiva','n/a':'não aplicável',Concl:'Concluídas',Concl_:'Concluídas'};
function abrMapa(){const M=Object.assign({},ABR_FIXAS);try{const a=A();const ts=[T(),...((a&&a.turmas)||[])].filter(Boolean);const vistos=new Set();
    ts.forEach(t=>{const D=[...(t.dominios||[]),...((t.modulos||[]).flatMap(m=>(m.av&&m.av.dominios)||[]))];D.forEach(d=>{const ab=String(d.ab||'').trim();if(!ab||vistos.has(ab))return;vistos.add(ab);M[ab]=d.nome+(d.peso!=null?' · '+String(d.peso).replace('.',',')+'%':'')+(d.ger?' · critério geral':'')})});
    const W=perW();[1,2,3].forEach(n=>{M[n+'.º P']=n+'.º '+W;M[n+'.º Per.']=n+'.º '+W;M[n+'.º per.']=n+'.º '+W})}catch(_){}return M}
function abrDicas(){try{const M=abrMapa();const ks=Object.keys(M);if(!ks.length)return;
  /* SVG (gráficos, radar): a dica é um <title> dentro do texto */
  document.querySelectorAll('#view svg text, #dw-b svg text, #ampv svg text, #perfilap svg text, .sheet svg text').forEach(e=>{if(e.querySelector('title'))return;const tx=e.textContent.trim();if(M[tx]&&!/^\d+$/.test(tx)){const ti=document.createElementNS('http://www.w3.org/2000/svg','title');ti.textContent=M[tx];e.appendChild(ti)}});
  document.querySelectorAll('#view *, #dw-b *, #ampv *, #perfilap *, #side .tdsb, #barx *').forEach(e=>{if(e.title||e.children.length>1||e.closest('svg'))return;if(e.children.length===1&&!/^(SMALL|BR|DIV)$/.test(e.children[0].tagName))return;
    const n=e.firstChild;const tx=(n&&n.nodeType===3?n.nodeValue:e.textContent||'').trim();if(!tx||tx.length>12)return;
    const k=M[tx]?tx:(M[tx.replace(/[.:]$/,'')]?tx.replace(/[.:]$/,''):null);if(k&&!/^\d+$/.test(k))e.title=M[k]})}catch(e){console.warn(e)}}
{let _abT=null;const corre=()=>{clearTimeout(_abT);_abT=setTimeout(abrDicas,350)};const liga=()=>{try{new MutationObserver(corre).observe(document.body,{childList:true,subtree:true})}catch(_){}corre()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',liga);else liga()}
/* ---- Perfis de Aprendizagem nas UFCD/módulos: sem períodos — classificação de cada UFCD (em vez de 1.º/2.º/3.º Per.),
   gráfico «Classificação por UFCD» (em vez de «Evolução por Período») e compromisso para a próxima UFCD ---- */
function paUnid(){try{const o=document.getElementById('perfilap');const t=T();if(!o||!t||!tUnid(t)||o.dataset.paU==='1')return;const U=unidMod(t);const M=t.modulos||[];if(!M.length)return;
  const NM=new Set(t.alunos.map(x=>x.nome));const nm=([...o.querySelectorAll('h1,h2,h3,b,strong,.pan,div,span')].find(e=>e.children.length===0&&NM.has(e.textContent.trim()))||{textContent:''}).textContent.trim();const a=nm&&t.alunos.find(x=>x.nome===nm);if(!a)return;
  o.dataset.paU='1';const ma=modAtivo(t);const F=v=>v==null||v===''?'—':String(v).replace('.',',');const da=(U.art==='a'?'da ':'do ');
  /* caixas dos períodos → uma caixa por UFCD */
  const bx=o.querySelector('.estps');if(bx){const P=[...bx.querySelectorAll('button')].filter(b=>/º Per\./.test(b.textContent));if(P.length){const html=M.map(m=>{const n=notaMod(t,a.id,m.id);const c=String(m.cod||'').replace(/^(UFCD|UC|M[óo]d(ulo)?\.?)\s*/i,'')||m.nome.slice(0,8);
      return `<button type="button" class="${m===ma?'on':''}" data-pamod="${m.id}" title="${esc((m.cod||'')+' — '+(m.nome||''))}"><small>${esc(c)}</small><b class="${n!=null&&+n<9.5?'neg':''}">${F(n)}</b></button>`}).join('');
      P[0].insertAdjacentHTML('beforebegin',html);P.forEach(b=>b.remove());bx.querySelectorAll('[data-pamod]').forEach(b=>b.onclick=()=>{modEscolher(t,b.dataset.pamod);perfilAluno(a.id)})}}
  const pn=o.querySelector('.pnotas');if(pn){const P=[...pn.querySelectorAll('.pn')].filter(d=>/º Per\./.test(d.textContent));if(P.length){P[0].insertAdjacentHTML('beforebegin',M.map(m=>{const n=notaMod(t,a.id,m.id);const c=String(m.cod||'').replace(/^(UFCD|UC|M[óo]d(ulo)?\.?)\s*/i,'')||m.nome.slice(0,8);
      return `<div class="pn ${m===ma?'on':''}" data-pamod="${m.id}" title="${esc((m.cod||'')+' — '+(m.nome||''))}" style="cursor:pointer"><span>${esc(c)}</span><b style="color:${n==null||n===''?'var(--mut)':+n<9.5?'#c0392b':'#1f7a4d'}">${F(n)}</b><small>${m===ma?'a ver':''}</small></div>`}).join(''));P.forEach(d=>d.remove());pn.querySelectorAll('[data-pamod]').forEach(b=>b.onclick=()=>{modEscolher(t,b.dataset.pamod);perfilAluno(a.id)})}}
  o.querySelectorAll('svg text.pper').forEach(x=>{if(/º Per/.test(x.textContent))x.textContent=String((ma&&ma.cod)||U.um)});
  /* subtítulo: a UFCD em vez do período */
  o.querySelectorAll('p.mut, .pah .mut').forEach(p=>{for(const n of p.childNodes)if(n.nodeType===3&&/\d\.º (período|semestre)/.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(/\d\.º (período|semestre)/,unidNomeComp(t)||U.um)});
  o.querySelectorAll('section h2').forEach(h=>{const tx=h.textContent.trim();
    if(/^Evolução por (período|semestre)/i.test(tx)){const s=h.closest('section');
      const al=alunosAval(t);const V=M.map(m=>({m,n:notaMod(t,a.id,m.id),tu:(L=>L.length?L.reduce((x,y)=>x+y,0)/L.length:null)(al.map(x=>notaMod(t,x.id,m.id)).filter(v=>v!=null&&v!==''))}));
      const W=420,H=280,L=40,R=12,Tp=24,B=46;const gw=(W-L-R)/Math.max(1,V.length);const sy=v=>Tp+(1-Math.max(0,Math.min(20,+v))/20)*(H-Tp-B);
      const grid=[0,5,10,15,20].map(g=>`<line x1="${L}" x2="${W-R}" y1="${sy(g)}" y2="${sy(g)}" class="${g===10?'pe50':'peg'}"/><text x="${L-6}" y="${sy(g)}" text-anchor="end" dominant-baseline="middle" class="pey">${g}</text>`).join('');
      const bars=V.map((x,i)=>{const cx=L+gw*i+gw/2,bw=Math.min(46,gw*.55);const c=String(x.m.cod||'').replace(/^(UFCD|UC|M[óo]d(ulo)?\.?)\s*/i,'')||x.m.nome.slice(0,8);
        return (x.n!=null&&x.n!==''?`<rect x="${(cx-bw/2).toFixed(1)}" y="${sy(x.n).toFixed(1)}" width="${bw.toFixed(1)}" height="${(sy(0)-sy(x.n)).toFixed(1)}" rx="3" style="fill:${+x.n<9.5?'#c0392b':'#1f7a4d'}"><title>${esc(x.m.nome)}: ${F(x.n)}</title></rect><text x="${cx}" y="${sy(x.n)-6}" text-anchor="middle" class="pev">${F(x.n)}</text>`:`<text x="${cx}" y="${sy(0)-8}" text-anchor="middle" class="pey">por avaliar</text>`)
          +(x.tu!=null?`<line x1="${cx-bw/2-4}" x2="${cx+bw/2+4}" y1="${sy(x.tu)}" y2="${sy(x.tu)}" style="stroke:#555;stroke-width:2;stroke-dasharray:4 3"><title>Média da turma: ${F(Math.round(x.tu*10)/10)}</title></line>`:'')
          +`<text x="${cx}" y="${H-B+18}" text-anchor="middle" class="pex">${esc(c)}</text><text x="${cx}" y="${H-B+32}" text-anchor="middle" class="pey" style="font-size:9px">${esc((x.m.nome||'').slice(0,22))}</text>`}).join('');
      h.innerHTML=ic('chart',16)+' Classificação por '+esc(U.um);
      [...s.children].forEach(c=>{if(c!==h)c.remove()});s.insertAdjacentHTML('beforeend',`<svg viewBox="0 0 ${W} ${H}" class="pevo" role="img" aria-label="Classificação por ${esc(U.um)}">${grid}${bars}</svg><div class="pleg"><span><i style="background:#1f7a4d"></i>Aprovada (≥ 9,5)</span><span><i style="background:#c0392b"></i>Não aprovada</span><span><i class="rt"></i>Média da turma</span></div>`)}
    if(/^Compromisso para o próximo/i.test(tx)){h.innerHTML=ic('flag',16)+' Compromisso para '+(U.art==='a'?'a próxima ':'o próximo ')+esc(U.um)}})}catch(e){console.warn(e)}}
{const _pAU=perfilAluno;perfilAluno=function(){const r=_pAU.apply(this,arguments);setTimeout(paUnid,0);return r}}
{let _paT=null;try{new MutationObserver(()=>{clearTimeout(_paT);_paT=setTimeout(()=>{const o=document.getElementById('perfilap');if(o&&o.dataset.paU!=='1')paUnid()},80)}).observe(document.body,{childList:true,subtree:true})}catch(_){}}
/* ---- Perfis de Aprendizagem: «Evolução nos Instrumentos» compacta — uma barra por instrumento (nome, data, classificação),
   em vez do gráfico enorme quando há poucos instrumentos; nas UFCD sem períodos ---- */
function paInstr(){try{const o=document.getElementById('perfilap');const t=T();if(!o||!t||o.dataset.paI==='1')return;const h=[...o.querySelectorAll('section h2')].find(x=>/^Evolução nos instrumentos/i.test(x.textContent.trim()));if(!h)return;
  const NM=new Set(t.alunos.map(x=>x.nome));const nm=([...o.querySelectorAll('h1,h2,h3,b,strong,div,span')].find(e=>e.children.length===0&&NM.has(e.textContent.trim()))||{textContent:''}).textContent.trim();const a=t.alunos.find(x=>x.nome===nm);if(!a)return;
  o.dataset.paI='1';const un=tUnid(t);const sec=isSec(t)||un;
  const I=(t.instrumentos||[]).filter(i=>instMax(i)&&instTotal(i,a.id)!=null).sort((x,y)=>(+x.periodo-+y.periodo)||String(x.data||'').localeCompare(String(y.data||'')));
  const s=h.closest('section');[...s.children].forEach(c=>{if(c!==h)c.remove()});
  if(!I.length){s.insertAdjacentHTML('beforeend','<p class="mut">Ainda sem instrumentos classificados.</p>');return}
  const rows=I.map(i=>{const f=instTotal(i,a.id)/instMax(i);const neg=negativa(t,f);const al=alunosAval(t);const tu=(L=>L.length?L.reduce((x,y)=>x+y,0)/L.length:null)(al.map(x=>{const v=instTotal(i,x.id);return v==null?null:v/instMax(i)}).filter(v=>v!=null));
    return `<div class="pir"><div class="pirn"><b>${esc(i.nome)}</b><small class="mut">${esc(i.tipo||'')}${i.data?' · '+esc(fmtIso(i.data)):''}${!un&&i.periodo?' · '+i.periodo+'.º '+esc(perW().toLowerCase()):''}</small></div>
      <div class="pirb"><i style="width:${Math.round(f*100)}%;background:${neg?'#c0392b':'#1f7a4d'}"></i>${tu!=null?`<u style="left:${Math.round(tu*100)}%" title="Média da turma: ${fmtNota(t,tu)}"></u>`:''}</div><b class="pirv ${neg?'neg':''}">${fmtNota(t,f)}</b></div>`}).join('');
  const fs=I.map(i=>instTotal(i,a.id)/instMax(i));const tend=fs.length>=2?fs[fs.length-1]-fs[0]:null;
  s.insertAdjacentHTML('beforeend',`<div class="pil">${rows}</div><p class="mut" style="margin:8px 0 0;font-size:12.5px">${tend==null?'Só um instrumento classificado até agora.':tend>0.025?'A subir: do primeiro para o último instrumento melhorou '+(sec?String(Math.round(tend*200)/10).replace('.',',')+' valores':Math.round(tend*100)+' pontos percentuais')+'.':tend<-0.025?'A descer: do primeiro para o último instrumento baixou '+(sec?String(Math.round(-tend*200)/10).replace('.',',')+' valores':Math.round(-tend*100)+' pontos percentuais')+'.':'Estável entre o primeiro e o último instrumento.'} A risca é a média da turma.</p>`)}catch(e){console.warn(e)}}
{const _pAI=perfilAluno;perfilAluno=function(){const r=_pAI.apply(this,arguments);setTimeout(paInstr,0);return r}}
{let _piT=null;try{new MutationObserver(()=>{clearTimeout(_piT);_piT=setTimeout(()=>{const o=document.getElementById('perfilap');if(o&&o.dataset.paI!=='1')paInstr()},90)}).observe(document.body,{childList:true,subtree:true})}catch(_){}}
/* Relatórios das UFCD/módulos: sem o seletor «Até ao … período» (a UFCD não tem períodos) */
{const _vRl=vRelatorios;vRelatorios=function(){const r=_vRl.apply(this,arguments);try{const t=T();if(t&&tUnid(t)){const s=$('#r-per');if(s){s.style.display='none';const l=s.previousElementSibling;if(l&&/Até ao/.test(l.textContent))l.style.display='none'}}}catch(e){console.warn(e)}return r};if(go._f)go._f.relatorios=vRelatorios}
