/* ===================== v0.59 · análise automática do enunciado (itens e cotações) ===================== */
/* análise automática de enunciados: itens e cotações */
function enunLinhas(pages){const out=[];pages.forEach((P,pn)=>{const it=P.items.map(i=>({s:String(i.s).replace(/\s+/g,' '),x:i.x,y:i.y,w:i.w||String(i.s).length*4,h:i.h||10})).filter(i=>i.s.trim());
    it.sort((a,b)=>b.y-a.y||a.x-b.x);const L=[];it.forEach(i=>{const tol=Math.max(2.5,i.h*0.35);let l=L.find(z=>Math.abs(z.y-i.y)<=tol);if(!l){l={y:i.y,its:[],pn};L.push(l)}l.its.push(i)});
    L.forEach(l=>{l.its.sort((a,b)=>a.x-b.x);const seg=[];l.its.forEach(i=>{const p=seg[seg.length-1];const gap=p?i.x-(p.x+p.w):99;const esp=Math.max(1.6,(i.h||10)*0.18);
        if(p&&gap<esp){p.s+=i.s;p.w=i.x+i.w-p.x}else if(p&&gap<(i.h||10)*0.9&&!/^\s/.test(i.s)&&!/\s$/.test(p.s)&&!(enunNum(p.s)&&enunNum(i.s))&&!(enunCod(p.s)&&enunCod(i.s))){p.s+=' '+i.s;p.w=i.x+i.w-p.x}else seg.push({...i})});
      seg.forEach(s=>{s.s=s.s.replace(/\s+/g,' ').trim().replace(/^([A-E])\s([A-E])\s?(\d)/,'$1$2$3').replace(/^([A-E])\s(\d)/,'$1$2');s.cx=s.x+s.w/2});l.seg=seg.filter(s=>s.s);l.t=l.seg.map(s=>s.s).join(' ').replace(/(\d)\s+,(\d)/g,'$1,$2')});
    L.sort((a,b)=>b.y-a.y);out.push(...L)});return out}
const enunNum=s=>/^\d+(?:[.,]\d+)?(?:\s*(?:pontos?|points?|pts?|p\.?))?$/i.test(String(s).trim());
const enunCod=s=>/^(?:[A-E]{1,2}\s?\d+(?:\.\d+)*\.?|\d+(?:\.\d+)*\.)$/.test(String(s).trim());
const enunV=s=>parseFloat(String(s).replace(',','.'));
function enunDom(txt){const n=String(txt).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  if(/producao.{0,3}interacao oral|interacao oral|producao oral|speaking|oralidade|expressao oral/.test(n))return 'PO';
  if(/producao.{0,3}interacao escrita|producao escrita|interacao escrita|writing|written/.test(n))return 'PE';
  if(/compreensao oral|listening/.test(n))return 'CO';
  if(/compreensao escrita|reading|use of (english|language)|leitura|gramatica|grammar|vocabulary|vocabulario/.test(n))return 'CE';return null}
function analisarEnunciado(pages){const L=enunLinhas(pages);const res={itens:[],partes:{},total:null,avisos:[],separado:false};
  const txtAll=L.map(l=>l.t).join('\n');res.separado=/realizad[ao] em separado|separately/i.test(txtAll);
  /* partes: «Part A – Listening – COMPREENSÃO ORAL (25%)», «A - Listening:» */
  L.forEach(l=>{let m=l.t.match(/^\s*(?:P\s?ART[E]?|Parte)\s+([A-E])\b\s*[–—-]?\s*(.*)$/i);if(!m)m=l.t.match(/^\s*([A-E])\s*[–—-]\s*([A-Za-zÀ-ú][^:]{2,60}):/);if(m){const k=m[1].toUpperCase();const d=enunDom(m[2]);const pc=(m[2].match(/\((\d+(?:[.,]\d+)?)\s*%\)/)||[])[1];const p=res.partes[k]=res.partes[k]||{};if(d&&!p.dom)p.dom=d;if(!p.nome)p.nome=m[2].replace(/\(.*?\)/g,'').replace(/[–—-]\s*$/,'').trim();if(pc&&!p.pct)p.pct=enunV(pc)}});
  /* zona das cotações */
  let i0=-1;for(let k=L.length-1;k>=0;k--){if(/COTA[ÇC][ÕO]E?\s?S|MARK SCHEME|COTAÇÃO/i.test(l2(L[k].t))){i0=k;break}}
  function l2(s){return String(s).replace(/\s+/g,'')}
  const Z=i0>=0?L.slice(i0):L.slice(-60);
  const add=(cod,cot,part,extra)=>{cod=String(cod).trim();if(enunCod(cod))cod=cod.replace(/\s+/g,'').replace(/\.$/,'');if(!(cot>0))return;if(res.itens.some(x=>x.cod===cod))return;res.itens.push({cod,cot:Math.round(cot*100)/100,parte:part||cod[0],...(extra||{})})};
  let parteAtual=null;
  Z.forEach((l,k)=>{const t=l.t;const mp=t.match(/^\s*Part[e]?\s+([A-E])\b/i)||t.match(/^\s*([A-E])\s*[–—-]\s*[A-Za-zÀ-ú]/);if(mp)parteAtual=mp[1].toUpperCase();
    {const mm=t.match(/^\s*([A-E])\s*[–—-]\s*([^\d]{3,40}?)\s+[A-E]\d/);if(mm){const p=res.partes[mm[1]]=res.partes[mm[1]]||{};if(!p.dom)p.dom=enunDom(mm[2]);if(!p.nome)p.nome=mm[2].replace(/:$/,'').trim()}}
    /* 1) «A1. 10 x 3 points» e «C1. 15 points» na mesma linha */
    const rx=/([A-E]{1,2}\s?\d+(?:\.\d+)*)\.?\s*(?:[-:]\s*)?(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/g;let m,hit=false;
    while(m=rx.exec(t)){add(m[1],enunV(m[2])*enunV(m[3]),null,{n:+m[2],por:enunV(m[3])});hit=true}
    const rx2=/([A-E]{1,2}\s?\d+(?:\.\d+)*)\.\s*(\d+(?:[.,]\d+)?)\s*(?:pontos?|points?|pts?)\b/gi;while(m=rx2.exec(t)){if(!/[x×]\s*$/.test(t.slice(0,m.index)))add(m[1],enunV(m[2]));hit=true}
    if(hit)return;
    /* 2) linha só com valores: emparelhar por posição com a(s) linha(s) de cima */
    const num=l.seg.filter(s=>enunNum(s.s));if(!num.length)return;const x0=Math.min(...num.map(n=>n.x))-4;if(l.seg.some(s=>!enunNum(s.s)&&s.x+s.w>x0))return;if(/total/i.test((Z[k-1]||{}).t||'')&&num.length===1)return;
    const acima=[];for(let j=k-1;j>=0&&acima.length<3;j--){const u=Z[j];if(u.seg.every(s=>enunNum(s.s)))break;if(l.y-u.y>-2&&false)break;acima.push(u)}
    if(!acima.length)return;const x1=Math.max(...num.map(n=>n.x+n.w))+4;const perto=u=>u.seg.some(s=>s.x+s.w>=x0&&s.x<=x1&&!enunNum(s.s));const ci=acima.findIndex(perto);if(ci<0)return;const cab=acima[ci];acima.splice(0,ci);
    const letra=cab.seg.find(s=>/^[A-E]$/.test(s.s)&&s.x<Math.min(...num.map(n=>n.x))-15);const pref=letra?letra.s:'';if(letra)parteAtual=letra.s;
    num.forEach(n=>{const v=enunV(n.s);let best=null,bd=1e9;cab.seg.forEach(s=>{if(s===letra)return;if(enunNum(s.s)&&!enunCod(s.s))return;const d=Math.abs(s.cx-n.cx);if(d<bd){bd=d;best=s}});
      if(!best||bd>Math.max(45,n.w*1.6))return;let rot=best.s;if(!/[A-Za-zÀ-ú0-9]/.test(rot)||/^total$/i.test(rot))return;
      if(enunCod(rot)){let c=rot.replace(/\s+/g,'').replace(/\.$/,'');if(/^\d/.test(c))c=(pref||parteAtual||'')+c;add(c,v,(pref||parteAtual||c[0]))}
      else{/* rótulos por extenso (COMPETÊNCIA / PRAGMÁTICA, Parte 1…) */const pal=[rot];acima.slice(1).forEach(u=>{const q=u.seg.find(s=>Math.abs(s.cx-best.cx)<40&&!enunNum(s.s));if(q&&!/^(Parte|Part)\s+[A-E]\b/i.test(q.s))pal.unshift(q.s)});
        const nome=pal.join(' ').replace(/\*+/g,'').trim();const pa=parteAtual||'';add(pa?pa+' · '+nome:nome,v,pa,{rot:nome})}})});
  /* 3) «D  Produção e Interação Oral  50» (linha única) */
  Z.forEach(l=>{const m=l.t.match(/^\s*([A-E])\s+([A-Za-zÀ-ú][^\d]{3,60}?)\s+(\d+(?:[.,]\d+)?)\s*(?:pontos?|points?)?\s*$/);if(m&&!res.itens.some(x=>x.parte===m[1])){add(m[1]+' · '+m[2].trim(),enunV(m[3]),m[1],{rot:m[2].trim()});const p=res.partes[m[1]]=res.partes[m[1]]||{};if(!p.dom)p.dom=enunDom(m[2])}});
  const mt=[...txtAll.matchAll(/total[^\d\n]{0,40}(\d{2,4})\s*(?:pontos|points|pts)?/gi)].pop()||[...txtAll.matchAll(/^\s*(\d{2,4})\s*(?:pontos|points)\s*$/gim)].pop();if(mt)res.total=+mt[1];
  res.itens.forEach(x=>{const p=res.partes[x.parte]||{};x.dom=p.dom||enunDom(x.rot||'')||null;x.oral=x.dom==='PO'});
  const soma=res.itens.reduce((s,x)=>s+x.cot,0);res.soma=Math.round(soma*100)/100;
  const somaEsc=res.itens.filter(x=>!x.oral).reduce((s,x)=>s+x.cot,0);
  if(res.total&&Math.abs(soma-res.total)>.01&&Math.abs(somaEsc-res.total)>.01)res.avisos.push('A soma das cotações encontradas ('+res.soma+') é diferente do total indicado no enunciado ('+res.total+').');
  if(!res.itens.length)res.avisos.push('Não encontrei a tabela de cotações. Verifique se o enunciado tem as cotações por item (ex.: «A1. 25 pontos»).');
  return res}


async function enunPaginas(fonte){/* fonte: File ou dataURL */let buf;if(typeof fonte==='string'){buf=await (await fetch(fonte)).arrayBuffer()}else buf=await fonte.arrayBuffer();
  const lib=await getPdfLib();const doc=await lib.getDocument({data:new Uint8Array(buf)}).promise;const P=[];
  for(let pn=1;pn<=doc.numPages;pn++){const page=await doc.getPage(pn);const tc=await page.getTextContent();P.push({items:tc.items.filter(x=>x.str&&x.str.trim()).map(x=>{const t=x.transform;return {s:x.str,x:t[4],y:t[5],w:x.width||0,h:Math.hypot(t[2],t[3])||10}})})}return P}
function enunDomTurma(t,cod){if(!cod)return null;const D=t.dominios||[];const n=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  return (D.find(d=>String(d.ab||'').toUpperCase()===cod)||D.find(d=>enunDom(d.nome)===cod)||D.find(d=>n(d.nome).includes({CO:'compreensao oral',CE:'compreensao escrita',PE:'escrita',PO:'oral'}[cod]))||{}).id||null}
async function analisarEnunciadoInst(i,fonte,tipo,nome){const t=T();if(!t)return;ocupado&&ocupado('A analisar o enunciado…');let R;
  try{if(/pdf/i.test(tipo||'')||/\.pdf$/i.test(nome||'')){R=analisarEnunciado(await enunPaginas(fonte))}
    else if(typeof lerDocumentoTexto==='function'&&typeof fonte!=='string'){const tx=await lerDocumentoTexto(fonte);const linhas=String(tx&&tx.texto||tx||'').split(/\n/);R=analisarEnunciado([{items:linhas.map((s,k)=>({s,x:0,y:10000-k*12,w:s.length*5,h:10}))}])}
    else{try{livre&&livre()}catch(_){}return}}catch(e){try{livre&&livre()}catch(_){}console.warn(e);toast('Não foi possível analisar o enunciado: '+e.message,'aviso');return}
  try{livre&&livre()}catch(_){}
  if(!R||!R.itens.length){toast('Não encontrei as cotações no enunciado — pode definir os itens à mão em «Itens e Cotações»','aviso');return}
  enunDlg(t,i,R)}
function enunDlg(t,i,R){const D=t.dominios||[];const tem=Object.keys(i.notas||{}).some(a=>Object.keys(i.notas[a]||{}).length);
  const L=R.itens.map((x,k)=>({...x,on:!(x.oral&&R.separado),dom:enunDomTurma(t,x.dom)||(D[0]&&D[0].id)||''}));
  const soma=()=>L.filter(x=>x.on).reduce((s,x)=>s+(+x.cot||0),0);const nf2=v=>String(Math.round(v*100)/100).replace('.',',');
  const draw=()=>{const sm=soma();
    openDrawer('Análise do Enunciado',`<div class="ed enun">
      <p class="hint" style="margin-top:0">${ic('sparkle',14)} Encontrei <b>${L.length} itens</b> na tabela de cotações. Confirme, corrija o que for preciso e aplique. ${R.separado?'A parte oral está marcada como realizada em separado — vem desmarcada.':''}</p>
      ${R.avisos.map(a=>`<div class="alert w">${ic('alert',14)} ${esc(a)}</div>`).join('')}
      <div class="enunres"><span>Selecionados: <b>${L.filter(x=>x.on).length}</b></span><span>Soma: <b class="${R.total&&Math.abs(sm-R.total)>.01?'bad':'ok'}">${nf2(sm)} pontos</b></span>${R.total?`<span>Total no enunciado: <b>${R.total}</b></span>`:''}${Object.keys(R.partes).length?`<span class="mut">Partes: ${Object.entries(R.partes).map(([k,p])=>esc(k+(p.dom?' '+p.dom:'')+(p.pct?' '+String(p.pct).replace('.',',')+'%':''))).join(' · ')}</span>`:''}</div>
      <div class="tblw"><table class="lst enunt"><thead><tr><th style="width:36px"><input type="checkbox" id="en-all" ${L.every(x=>x.on)?'checked':''} aria-label="Todos"></th><th>Item</th><th>Domínio</th><th style="width:110px">Cotação</th><th></th></tr></thead><tbody>
      ${L.map((x,k)=>`<tr class="${x.on?'':'off'}"><td><input type="checkbox" data-eon="${k}" ${x.on?'checked':''} aria-label="Incluir ${esc(x.cod)}"></td><td><input data-ecod="${k}" value="${esc(x.cod)}" aria-label="Item"></td>
        <td><select data-edom="${k}" aria-label="Domínio">${D.map(d=>`<option value="${d.id}" ${d.id===x.dom?'selected':''}>${esc(d.nome)}</option>`).join('')}</select></td>
        <td><input type="number" step="0.5" min="0" data-ecot="${k}" value="${x.cot}" aria-label="Cotação"></td><td class="mut">${x.n?esc(x.n+' × '+nf2(x.por)):''}${x.oral?' <span class="tag">oral</span>':''}</td></tr>`).join('')}</tbody></table></div>
      ${tem?`<div class="alert w">${ic('alert',14)} Este instrumento já tem classificações. Substituir os itens apaga as classificações dos itens que deixarem de existir.</div>`:''}
      <div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap"><label class="chk" style="margin:0"><input type="radio" name="en-m" value="sub" ${!tem?'checked':''}> Substituir os itens atuais</label><label class="chk" style="margin:0"><input type="radio" name="en-m" value="add" ${tem?'checked':''}> Acrescentar aos atuais</label><span class="sp1"></span><button type="button" class="btn" id="en-can">Agora Não</button><button type="button" class="btn pri" id="en-ok">${ic('check',14)} Aplicar ${L.filter(x=>x.on).length} Itens</button></div></div>`);
    $$('#dw-b [data-eon]').forEach(c=>c.onchange=()=>{L[+c.dataset.eon].on=c.checked;draw()});
    const all=$('#en-all');if(all)all.onchange=()=>{L.forEach(x=>x.on=all.checked);draw()};
    $$('#dw-b [data-ecod]').forEach(c=>c.oninput=()=>{L[+c.dataset.ecod].cod=c.value});
    $$('#dw-b [data-edom]').forEach(c=>c.onchange=()=>{L[+c.dataset.edom].dom=c.value});
    $$('#dw-b [data-ecot]').forEach(c=>c.onchange=()=>{L[+c.dataset.ecot].cot=Math.max(0,parseFloat(String(c.value).replace(',','.'))||0);draw()});
    $('#en-can').onclick=()=>closeDrawer();
    $('#en-ok').onclick=()=>{const sel=L.filter(x=>x.on&&+x.cot>0);if(!sel.length)return toast('Escolha pelo menos um item','aviso');const modo=(document.querySelector('input[name="en-m"]:checked')||{}).value||'sub';
      if(modo==='sub'&&tem&&!confirm('Substituir os itens apaga as classificações já lançadas neste instrumento. Continuar?'))return;
      const novos=sel.map((x,k)=>({id:uid()+'e'+k,rot:String(x.cod).trim()||('Item '+(k+1)),dom:x.dom||(D[0]&&D[0].id),cot:+x.cot}));
      if(modo==='sub'){const ids=new Set(novos.map(n=>n.id));i.itens=novos;Object.values(i.notas||{}).forEach(n=>Object.keys(n).forEach(k=>{if(!ids.has(k))delete n[k]}))}else i.itens=(i.itens||[]).concat(novos);
      save();audit('Instrumentos','Itens a partir do enunciado',i.nome+' · '+novos.length+' itens');closeDrawer();toast(novos.length+' itens aplicados ('+nf2(novos.reduce((s,n)=>s+n.cot,0))+' pontos)','ok');UI.instTab='itens';try{vInstrumento(i.id)}catch(_){go(VIEW)}}};
  draw()}
{const _aI=anexoInst;anexoInst=function(i,k,f){return _aI.apply(this,arguments).then(r=>{if(k==='enunciado'&&f&&(/pdf/i.test(f.type)||/\.(pdf|docx?)$/i.test(f.name))&&S.cfg.enunAuto!==false)setTimeout(()=>analisarEnunciadoInst(i,f,f.type,f.name),250);return r})}}

/* v0.59 · disciplina/UFCD de cada aula quando a turma tem mais do que uma (o mesmo tempo do horário serve várias) */
const grpT=t=>t.nome+'|'+escId(escolaDe(t));
const irmasT=t=>{const a=A();if(!a||!t)return [];const g=grpT(t);return a.turmas.filter(x=>grpT(x)===g)};
const aulaDiscMap=a=>(a.aulaDisc=a.aulaDisc||{});
{const _lA=listaAulas;listaAulas=function(t,a){a=a||A();const L=_lA.call(this,t,a);try{const M=a&&a.aulaDisc;if(!M||!Object.keys(M).length)return L;const g=grpT(t);
    const fora=L.filter(x=>{const v=M[g+'|'+x.k];return v&&v!==t.id&&irmasT(t).some(z=>z.id===v)});let R=L.filter(x=>!fora.includes(x));
    irmasT(t).filter(z=>z!==t).forEach(z=>{let Lz=[];try{Lz=_lA.call(this,z,a)}catch(_){}Lz.forEach(x=>{if(M[g+'|'+x.k]===t.id&&!R.some(y=>y.k===x.k))R.push({...x,mov:z.id})})});
    if(R.length===L.length&&!fora.length)return L;
    R.sort((x,y)=>x.data.localeCompare(y.data)||x.ini-y.ini);const SM=sumariosT(a,t);let n=0;R.forEach(x=>{const sm=SM[x.k]||{};x.s=sm;delete x.licao;const dada=x.passada&&(!x.falta||x.falta.subst||sm.estado==='dada')&&sm.estado!=='nao';if(dada||x.repos&&x.passada){n++;x.licao=sm.licao||n}});return R}catch(e){console.warn(e);return L}}}
function aulaDiscOpcoes(t){const I=irmasT(t);const O=[];I.forEach(z=>{if(ehUnid(z)&&(z.modulos||[]).length)(z.modulos||[]).forEach(m=>O.push({t:z,m,l:(ehUnidC(z)?'':z.disciplina+' · ')+rotUnid(m,z)+(m.nome?' · '+m.nome:'')}));else O.push({t:z,m:null,l:z.disciplina})});return O}
{const _aD=aulaDlg;aulaDlg=function(t,k,tab){const r=_aD.apply(this,arguments);try{const d=[...document.querySelectorAll('dialog.auladlg')].pop();if(d)aulaDiscLigar(d,t,k)}catch(e){console.warn(e)}return r}}
function aulaDiscLigar(d,t,k){const O=aulaDiscOpcoes(t);if(O.length<2)return;const a=A();
  const pinta=()=>{if(!d.isConnected||d.querySelector('.audisc'))return;const h=d.querySelector('.auh>div');if(!h)return;const SM=sumariosT(a,t);const sm=SM[k]||{};
    const cur=O.findIndex(o=>o.t===t&&(!o.m||o.m.id===(sm.modulo||(ehUnid(t)?(modAtivo(t)||{}).id:null))));
    h.insertAdjacentHTML('beforeend',`<div class="audisc"><label for="au-disc">${ic('book',13)} Disciplina desta aula</label><select id="au-disc">${O.map((o,i)=>`<option value="${i}" ${i===cur?'selected':''}>${esc(o.l)}</option>`).join('')}</select></div>`);
    d.querySelector('#au-disc').onchange=e=>{const o=O[+e.target.value];if(!o)return;const g=grpT(t);const M=aulaDiscMap(a);const dono=irmasT(t)[0];
      if(o.t===dono&&!Object.values(M).length)delete M[g+'|'+k];M[g+'|'+k]=o.t.id;
      if(o.m){const S2=sumariosT(a,o.t);S2[k]=S2[k]||{};S2[k].modulo=o.m.id}
      /* leva o que já foi escrito nesta aula */const S1=sumariosT(a,t);if(o.t!==t&&S1[k]&&(S1[k].texto||S1[k].pres)){const S2=sumariosT(a,o.t);S2[k]={...S1[k],...(S2[k]||{}),modulo:(S2[k]||{}).modulo};delete S1[k]}
      save();try{d.close()}catch(_){}d.remove();toast('Aula atribuída a '+o.l,'ok');setTimeout(()=>{aulaDlg(o.t,k,'sum');try{go(VIEW)}catch(_){}},60)}};
  pinta();new MutationObserver(()=>pinta()).observe(d,{childList:true,subtree:true})}

