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
