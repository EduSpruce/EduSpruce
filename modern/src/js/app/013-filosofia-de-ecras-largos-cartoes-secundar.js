/* ---------- “filosofia” de ecrãs largos: cartões secundários numa coluna ao lado ---------- */
const LADO={calendario:[/^AI\s*Avaliação Intercalar|^Avaliação Intercalar/],meuhorario:['kpis',/^Tempos Não Letivos/,/^Turmas sem Horário/,/Sobreposições/],tarefas:['kpis',/^Avisos Urgentes/,/^Decisões e Tarefas das Reuniões/],
  turmas:[/^Horários Importados/],horario:['kpis',/^Disciplina Nesta Turma/,/^Aulas Previstas/,/^Próximas Aulas/],criterios:[/^Turma$/],definicoes:[/^Avisos em Pop-up/],ajuda:[/^Guia do EduSpruce/]};
const LADO_MIN=1150;
function layoutLado(){const v=document.getElementById('view');if(!v)return;const R=LADO[VIEW];if(!R||v.clientWidth<LADO_MIN)return;
  const kids=[...v.children];if(kids.some(c=>c.classList.contains('vlay'))&&kids.every(c=>c.classList.contains('vlay')||c.matches('.tabs,.deftabs,input[type=file]')))return;
  const tit=c=>(((c.querySelector(':scope>h2,:scope>.row>h2,:scope>summary>h2,:scope .ajhd>h2,:scope>div>h2')||{}).textContent)||'').trim();
  const lado=kids.filter(c=>(c.matches('.kpis')&&R.includes('kpis'))||(c.matches('.card')&&R.some(re=>re instanceof RegExp&&re.test(tit(c)))));if(!lado.length)return;
  const lay=document.createElement('div');lay.className='vlay';const m=document.createElement('div');m.className='vmain';const s=document.createElement('div');s.className='vside';
  const topo=[];for(const c of kids){if(c.matches('.tabs,.deftabs')&&!m.children.length)topo.push(c);else break}
  const ae=document.activeElement;let ss=null,se=null;try{ss=ae&&ae.selectionStart;se=ae&&ae.selectionEnd}catch(_){}const y=v.scrollTop;
  kids.forEach(c=>{if(topo.includes(c)||c.matches('input[type=file]'))return;(lado.includes(c)?s:m).appendChild(c)});lay.appendChild(m);lay.appendChild(s);v.appendChild(lay);v.scrollTop=y;
  if(ae&&ae!==document.body&&v.contains(ae)&&document.activeElement!==ae){try{ae.focus({preventScroll:true});if(ss!=null)ae.setSelectionRange(ss,se)}catch(_){}}}
{let _lt=0;new MutationObserver(()=>{cancelAnimationFrame(_lt);_lt=requestAnimationFrame(()=>{try{layoutLado()}catch(e){console.error(e)}})}).observe(document.getElementById('view'),{childList:true});
 let _lw=null;addEventListener('resize',()=>{const v=document.getElementById('view');if(!v||!LADO[VIEW])return;const larg=v.clientWidth>=LADO_MIN;if(_lw!==null&&larg!==_lw){clearTimeout(layoutLado._r);layoutLado._r=setTimeout(()=>go(VIEW),120)}_lw=larg})}

/* análise: no Gerador de Documentos a pré-visualização fica ao lado do texto */
{const _vdoc=vDocumentos;vDocumentos=function(){_vdoc.apply(this,arguments);const v=$('#view');const pv=$('#dc-pv');if(!v||!pv||v.clientWidth<LADO_MIN)return;const card=pv.closest('.card');if(!card)return;
  const h3=[...card.querySelectorAll('h3')].find(x=>/Pré-visualização/i.test(x.textContent));const tabs=v.querySelector(':scope>.tabs');
  const lay=document.createElement('div');lay.className='vlay';const m=document.createElement('div');m.className='vmain';const s=document.createElement('div');s.className='vside';
  const sc=document.createElement('div');sc.className='card';sc.innerHTML=`<h2 style="margin:0 0 10px">${ic('access',18)} Pré-Visualização</h2>`;if(h3)h3.remove();sc.appendChild(pv);s.appendChild(sc);
  [...v.children].forEach(c=>{if(c!==tabs)m.appendChild(c)});lay.appendChild(m);lay.appendChild(s);v.appendChild(lay)}}
/* glossário: dica (tooltip) em todas as siglas que aparecem na app */
const GLOSS=(()=>{const G={};try{const s=AJUDA.find(x=>x.id==='glossario');const d=document.createElement('div');d.innerHTML=s.txt;const dts=[...d.querySelectorAll('dt')];
  dts.forEach(dt=>{const dd=dt.nextElementSibling;if(!dd)return;const ks=dt.textContent.split('·').map(x=>x.trim().replace(/‑/g,'-')).filter(Boolean);const vs=dd.textContent.trim().replace(/\.$/,'').split('·').map(x=>x.trim());ks.forEach((k,i)=>{G[k]=ks.length>1&&vs.length===ks.length?vs[i]:dd.textContent.trim()})})}catch(_){}
  Object.assign(G,{UFCD:'Unidade de formação de curta duração (PROFIJ / cursos profissionais)',UC:'Unidade de competência (referencial de competências do Catálogo Nacional de Qualificações)',EE:'Encarregado(a) de educação',CT:'Conselho de turma',CP:'Conselho pedagógico',DP:'Departamento',GD:'Grupo disciplinar',ASE:'Ação Social Escolar','DT-AP':'Direção de turma — atendimento aos encarregados de educação','CNL-E/s':'Componente não letiva de estabelecimento — atividades colaborativas / projetos',PLNM:'Português língua não materna',EMRC:'Educação Moral e Religiosa Católica',TIC:'Tecnologias da Informação e Comunicação','F':'Falta do professor (não conta como aula dada)'});return G})();
function aplicarGlossario(root){if(!root)return;root.querySelectorAll('span,b,th,td,small,button,.tag,.mta,.mtp,.nlb,label,dt').forEach(el=>{if(el.hasAttribute('title')||el.hasAttribute('data-tip')||el.children.length>2)return;const t=(el.textContent||'').trim().replace(/‑/g,'-');if(!t||t.length>14)return;
  let k=GLOSS[t]?t:(/^Σ/.test(t)?'Σ':null);if(!k){const u=t.replace(/[:·.]$/,'').toUpperCase();if(GLOSS[u]&&u.length>=2&&t===t.toUpperCase())k=u}if(!k||(k==='F'&&!el.closest('.cd,.mtc,.cal,.mtmeses')))return;el.setAttribute('title',(k==='Σ'?'Σ — ':k+' — ')+GLOSS[k]);el.classList.add('gl-tip')})}
{let _g=0;const run=()=>{cancelAnimationFrame(_g);_g=requestAnimationFrame(()=>{try{aplicarGlossario($('#view'));aplicarGlossario($('#dw-b'))}catch(_){}})};new MutationObserver(run).observe(document.body,{childList:true,subtree:true});run()}

/* ---------- Catálogo Nacional de Qualificações (catalogo.snq.gov.pt): cursos e UFCD ---------- */
const CNQ_API='https://bocatalogo.snq.gov.pt/webapi/api',CNQ_REP='https://bocatalogo.snq.gov.pt/reports',CNQ_SITE='https://catalogo.snq.gov.pt';
const cnqM=()=>S.cfg.cnq=S.cfg.cnq||{cursos:[],ts:null,uf:{}};
async function cnqCarregarCursos(){const r=await comPrazo(fetch(CNQ_API+'/qualificacoes/searchSite',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPage:1,itemsPerPage:1000,codigo:'',designacao:'',areasFormacaoId:[],conselhosSetoriaisId:[],nivelQEQ:[],rvcc:false,adaptada:false,baseadoEmRA:false,regulamentada:false,outrosReferencias:false,excluida:false,excluidasId:0})}),20000,null);
  if(!r||!r.ok)throw new Error('Sem resposta do Catálogo');const j=await r.json();const L=[];(j.items||[]).forEach(it=>(it.details||[]).forEach(d=>{if(d.qualificacoesVersoesId)L.push({id:d.qualificacoesVersoesId,cod:it.codigo,nome:d.designacao,area:it.areaFormacao,nivel:it.nivel,conc:d.conceito||'PP',ad:!!d.adaptada})}));
  if(!L.length)throw new Error('O Catálogo não devolveu cursos');L.sort((a,b)=>a.nome.localeCompare(b.nome,'pt'));const M=cnqM();M.cursos=L;M.ts=new Date().toISOString();save();return L}
async function cnqCarregarUfcd(c){const r=await comPrazo(fetch(CNQ_REP+'/TecnologicaHtml?preview=true&id='+c.id+'&faq=false&tipo='+encodeURIComponent(c.conc||'PP')+'&tipoReport=FORMACAO'),20000,null);if(!r||!r.ok)throw new Error('Sem resposta do Catálogo');
  const d=new DOMParser().parseFromString(await r.text(),'text/html');let tipo='O';const L=[],vistos=new Set();const num=s=>{const v=parseFloat(String(s||'').replace(',','.'));return isNaN(v)?'':v};
  d.querySelectorAll('tr').forEach(tr=>{const cs=[...tr.cells].map(x=>x.textContent.replace(/\s+/g,' ').trim());const txt=cs.join(' ');if(/OPCIONA/i.test(txt))tipo='P';else if(/OBRIGAT/i.test(txt))tipo='O';
    if(cs.length<4)return;const cod=cs[0].replace(/\s+/g,'');let u=null;
    if(/^UC\d{3,6}$/i.test(cod)){const cred=num(cs[cs.length-1]);u={k:'UC',cod:cod.toUpperCase(),nome:cs[2]||cs[1],cred,horas:cred!==''?Math.round(cred/0.09):''}}
    else if(/^\d{3,5}$/.test(cod)){u={k:'UFCD',cod,nome:cs.length>=5?cs[2]:cs[1],horas:num(cs.length>=5?cs[3]:cs[cs.length-2]),cred:cs.length>=5?num(cs[4]):''}}
    if(!u)return;const key=u.cod+'|'+tipo;if(vistos.has(key))return;vistos.add(key);u.tipo=tipo;L.push(u)});
  const M=cnqM();M.uf[c.id]={ts:new Date().toISOString(),L};save();return L}
{const M0=cnqM();if(M0.v!==2){M0.uf={};M0.v=2}}
const cnqTipoCurso=c=>c&&c.conc==='RA'?'UC':'UFCD';
const cnqNorm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const cnqQuando=ts=>ts?new Date(ts).toLocaleDateString('pt-PT')+' '+new Date(ts).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}):'';
/* duas pesquisas lado a lado: cursos com UFCD (referencial de formação) e cursos com UC (referencial de competências) */
function cnqEscolhaCurso(box,val,busca,vazio,tipos){tipos=tipos&&tipos.length?tipos:['UFCD','UC'];const M=cnqM();const uid0='cq'+Math.random().toString(36).slice(2,7);
  const col=(k,t,sub)=>{const q=cnqNorm(busca[k]);const F=M.cursos.filter(x=>cnqTipoCurso(x)===k&&(!q||cnqNorm(x.cod+' '+x.nome+' '+x.area).includes(q)));const sel=F.some(x=>String(x.id)===String(val))||M.cursos.some(x=>String(x.id)===String(val)&&cnqTipoCurso(x)===k);
    return `<div class="cnqcol ${sel?'on':''}"><div class="cnqct"><span class="tag ${k==='UC'?'of-p':''}">${k}</span> <b>${t}</b><span class="mut"> · ${sub}</span></div>
      <input data-cnqq="${k}" id="${uid0}-q${k}" placeholder="Procurar curso (nome, código, área)…" aria-label="Procurar ${t.toLowerCase()}" value="${esc(busca[k]||'')}">
      <select data-cnqc="${k}" aria-label="${t}"><option value="">${M.cursos.length?vazio+' ('+F.length+')':'A carregar…'}</option>${F.map(x=>`<option value="${x.id}" ${String(x.id)===String(val)?'selected':''}>${esc(x.nome)} · ${esc(x.cod)} · Nível ${esc(x.nivel||'')}${x.ad?' (adaptada)':''}</option>`).join('')}</select></div>`};
  return `<div class="cnqduo">${tipos.includes('UFCD')?col('UFCD','Cursos com UFCD','referencial de formação'):''}${tipos.includes('UC')?col('UC','Cursos com UC','unidades de competência'):''}</div>`}
function cnqLigaEscolha(box,busca,redesenha,muda){box.querySelectorAll('[data-cnqq]').forEach(qi=>qi.oninput=()=>{const k=qi.dataset.cnqq;busca[k]=qi.value;const p=qi.selectionStart;redesenha();const n=box.querySelector(`[data-cnqq="${k}"]`);if(n){n.focus();n.setSelectionRange(p,p)}});
  box.querySelectorAll('[data-cnqc]').forEach(s=>s.onchange=()=>muda(s.value))}
function cnqPainel(box,api){
  if(!UI.cnqCurso&&A()&&A().cnqCurso)UI.cnqCurso=A().cnqCurso;const M=cnqM();const busca=UI.cnqBusca2=UI.cnqBusca2||{UFCD:'',UC:''};let msg='';let ocupado=false;
  const codsSel=api.sel;const escreve=(cod,on,u)=>api.set(u,on);const curso=()=>M.cursos.find(c=>String(c.id)===String(UI.cnqCurso));
  const desenha=()=>{const _t=box.querySelector('.cnqt');const _st=_t?_t.scrollTop:0;const ae=document.activeElement;const _f=ae&&box.contains(ae)&&ae.dataset&&ae.dataset.cnqu;const _sc=[...document.querySelectorAll('#view,#dw-b,.dwb,html')].map(e=>[e,e.scrollTop]);desenho();const _t2=box.querySelector('.cnqt');if(_t2)_t2.scrollTop=_st;_sc.forEach(([e,v])=>{if(e.scrollTop!==v)e.scrollTop=v});if(_f){const e=box.querySelector('[data-cnqu="'+_f+'"]');if(e)e.focus({preventScroll:true})}};
  const desenho=()=>{const T=(typeof api.tipos==='function'?api.tipos():api.tipos)||['UFCD','UC'];let c=curso();if(c&&!T.includes(cnqTipoCurso(c)))c=null;const K=cnqTipoCurso(c);const U=c&&M.uf[c.id]?M.uf[c.id].L:null;const S0=codsSel();
    const tot=U?U.filter(u=>S0.has(u.cod)).reduce((s,u)=>s+(+u.horas||0),0):0;
    box.innerHTML=`<div class="cnqh"><b>${ic('book',15)} Catálogo Nacional de Qualificações</b><span class="sp1"></span><span class="mut cnqts">${M.ts?'Atualizado em '+cnqQuando(M.ts):'Ainda não descarregado'}</span>
      <button type="button" class="btn sm" data-cnqref ${ocupado?'disabled':''} title="Voltar a descarregar a lista de cursos e as unidades do curso escolhido">${ic('refresh',13)} ${ocupado?'A Atualizar…':'Atualizar'}</button></div>
      ${cnqEscolhaCurso(box,UI.cnqCurso,busca,'Escolha o curso…',typeof api.tipos==='function'?api.tipos():api.tipos)}
      ${msg?`<p class="hint" style="color:var(--bad)">${esc(msg)} — pode abrir o <a href="${CNQ_SITE}/qualificacoesPesquisa" target="_blank" rel="noopener">catálogo</a> e escrever as unidades à mão.</p>`:''}
      ${c?(U?`<div class="cnqbar"><span class="mut">${esc(c.nome)} · ${esc(c.area||'')} · ${U.length} ${K==='UC'?'UC (unidades de competência)':'UFCD'}</span><span class="sp1"></span><button type="button" class="btn sm" data-cnqobr>${ic('check',13)} Todas as Obrigatórias</button><button type="button" class="btn sm" data-cnqnen>Nenhuma</button><a class="btn sm" href="${CNQ_SITE}/qualificacoesDetalhe/${c.id}" target="_blank" rel="noopener">${ic('link',13)} Ver no Catálogo</a></div>
        <div class="tblw cnqt"><table class="lst"><caption class="a11y-sr">${K==='UC'?'Unidades de competência':'UFCD'} de ${esc(c.nome)}</caption><thead><tr><th scope="col"><span class="a11y-sr">Selecionar</span></th><th scope="col">Código</th><th scope="col">${K==='UC'?'Unidade de Competência (UC)':'UFCD'}</th><th scope="col">${K==='UC'?'Créditos':'Horas'}</th><th scope="col">Tipo</th></tr></thead><tbody>${U.map((u,i)=>`<tr><td><input type="checkbox" data-cnqu="${i}" ${S0.has(u.cod)?'checked':''} aria-label="${esc(u.cod+' '+u.nome)}"></td><td class="nw"><b>${esc(u.cod)}</b></td><td>${esc(u.nome)}</td><td class="nw">${u.k==='UC'?(u.cred!==''?String(u.cred).replace('.',',')+' pts'+(u.horas?` <span class="mut">≈ ${u.horas} h</span>`:''):''):(u.horas!==''?u.horas+' h':'')}</td><td><span class="tag ${u.tipo==='O'?'':'mut'}">${u.tipo==='O'?'Obrigatória':'Opcional'}</span></td></tr>`).join('')||`<tr><td colspan="5" class="mut">Este curso não tem ${K==='UC'?'UC':'UFCD'} publicadas na componente tecnológica.</td></tr>`}</tbody></table></div>
        <p class="hint" style="margin:6px 0 0">Selecionadas: <b>${U.filter(u=>S0.has(u.cod)).length}</b>${tot?` · <b>${K==='UC'?'≈ ':''}${tot} h</b>`:''} · ${K} atualizadas em ${cnqQuando(M.uf[c.id].ts)}${K==='UC'?' · horas estimadas a partir dos pontos de crédito (2,25 pts = 25 h)':''}</p>`:`<p class="mut" role="status">${ocupado?'A descarregar as unidades…':''}</p>`):''}
      ${typeof api.rodape==='function'?api.rodape():(api.rodape||'')}`;
    box.querySelector('[data-cnqref]').onclick=()=>atualiza(true);
    cnqLigaEscolha(box,busca,desenha,v=>{UI.cnqCurso=v;if(A()){A().cnqCurso=v;save()}msg='';const c2=curso();if(c2&&!M.uf[c2.id])atualizaUfcd(c2);else desenha()});
    box.querySelectorAll('[data-cnqu]').forEach(ch=>ch.onchange=()=>{const u=U[+ch.dataset.cnqu];escreve(u.cod,ch.checked,u);desenha()});
    const ob=box.querySelector('[data-cnqobr]');if(ob)ob.onclick=()=>{U.filter(u=>u.tipo==='O').forEach(u=>escreve(u.cod,true,u));desenha()};const nn=box.querySelector('[data-cnqnen]');if(nn)nn.onclick=()=>{U.forEach(u=>escreve(u.cod,false,u));desenha()}};
  const atualizaUfcd=async c=>{ocupado=true;desenha();try{await cnqCarregarUfcd(c)}catch(e){msg='Não foi possível ler as unidades ('+e.message+')'}ocupado=false;desenha()};
  const atualiza=async tudo=>{ocupado=true;msg='';desenha();try{await cnqCarregarCursos();const c=curso();if(c&&tudo)await cnqCarregarUfcd(c);if(tudo)toast('Catálogo atualizado · '+M.cursos.length+' cursos','ok')}catch(e){msg='Não foi possível contactar o Catálogo Nacional de Qualificações ('+e.message+')'}ocupado=false;desenha()};
  desenha();if(!M.cursos.length||!M.ts||Date.now()-new Date(M.ts)>30*864e5)atualiza(false);else{const c=curso();if(c&&!M.uf[c.id])atualizaUfcd(c)}}

const ufcdAno=()=>{const a=A();return a?(a.ufcds=a.ufcds||[]):[]};
function montarCNQ(ta){if(!ta||ta.dataset.cnq)return;ta.dataset.cnq='1';const box=document.createElement('div');box.className='cnq';ta.parentNode.insertBefore(box,ta);ta.rows=3;
  if(!ta.value.trim()&&ufcdAno().length){ta.value=ufcdAno().map(u=>u.cod+';'+u.nome+';'+(u.horas||'')).join('\n');ta.dispatchEvent(new Event('input'))}
  const cod=l=>l.split(/;|\t/)[0].trim().replace(/^UFCD\s*/i,'');const linhas=()=>ta.value.split('\n').map(l=>l.trim()).filter(Boolean);
  const tiposNT=()=>{if(ta.id==='nt-mods')return ['UFCD','UC'];const ds=[...document.querySelectorAll('#dw-b [data-ntm]:checked')].map(c=>c.dataset.ntm);const sd=$('#nt-disc');if(sd&&sd.value)ds.push(discNome(sd.value));const t=[ds.includes(UFCD_N)?'UFCD':null,ds.includes(UC_N)?'UC':null].filter(Boolean);return t.length?t:['UFCD','UC']};
  cnqPainel(box,{tipos:tiposNT,sel:()=>new Set(linhas().map(cod)),set:(u,on)=>{const L=linhas().filter(l=>cod(l)!==u.cod);if(on)L.push(u.cod+';'+u.nome+';'+(u.horas||''));ta.value=L.join('\n');ta.dispatchEvent(new Event('input'))},
    rodape:`<label style="margin-top:8px">Unidades desta turma (UFCD / UC) <span class="mut">(${ufcdAno().length?'vêm marcadas as escolhidas em Disciplinas que Leciono; ':''}também pode escrever à mão: código ; designação ; horas)</span></label>`})}
/* no cartão Disciplinas que Leciono: escolher o curso e as UFCD do ano letivo */
{const _bd=bindDisciplinas;bindDisciplinas=function(re){_bd.apply(this,arguments);const ks=[discKey(UFCD_N,'profij'),discKey(UC_N,'profij')].filter(k=>discAno().includes(k));if(!ks.length)return;const ch=[...$$('[data-disc]')].find(e=>ks.includes(e.dataset.disc));if(!ch)return;const g=ch.closest('.disc-grid');if(!g)return;
  const box=document.createElement('div');box.className='cnq cnqdisc';g.after(box);
  cnqPainel(box,{tipos:()=>[discAno().includes(discKey(UFCD_N,'profij'))?'UFCD':null,discAno().includes(discKey(UC_N,'profij'))?'UC':null].filter(Boolean),sel:()=>new Set(ufcdAno().map(u=>u.cod)),set:(u,on)=>{const L=ufcdAno();const i=L.findIndex(x=>x.cod===u.cod);if(i>=0)L.splice(i,1);if(on)L.push({cod:u.cod,nome:u.nome,horas:u.horas,tipo:u.tipo,curso:UI.cnqCurso||''});save();try{ufcdSinc(u,on)}catch(e){console.warn(e)}},
    rodape:()=>`<p class="hint" style="margin:8px 0 0">${ufcdAno().length?ufcdAno().length+' unidades escolhidas para '+esc(A().nome)+' — ':''}As unidades marcadas (UFCD ou UC) ficam a contar como lecionadas por si: entram logo nas turmas que já têm a Componente Tecnológica e aparecem selecionadas ao criar uma nova.${ufcdAno().length&&A()&&!A().turmas.some(t=>t.disciplina===UFCD_N||t.disciplina===UC_N)?`<br><b>Ainda não tem nenhuma turma com a Componente Tecnológica.</b> Em Ano Letivo e Turmas, abra a turma do curso e escolha «Mesma Turma, Outra Disciplina» › ${esc(UFCD_N)} — as unidades escolhidas entram automaticamente.`:''}</p>`})}}

AJUDA.push({id:'cnq',ic:'book',t:'Cursos, UFCD e UC do Catálogo Nacional de Qualificações',gif:null,txt:`<p>Há duas pesquisas lado a lado: <b>Cursos com UFCD</b> (referencial de formação, com horas) e <b>Cursos com UC</b> (referencial de competências — unidades de competência, com pontos de crédito). Na Nova Turma PROFIJ ou profissional escolhe o curso da turma; para as turmas profissionais pode marcar logo os módulos / UFCD / UC. Há também a disciplina <b>Componente Tecnológica (UC)</b>.</p><p>Ao criar uma turma PROFIJ com a <b>Componente Tecnológica (UFCD)</b>, escolha o curso na lista do <a href="https://catalogo.snq.gov.pt/" target="_blank" rel="noopener">Catálogo Nacional de Qualificações</a> (pode filtrar por nome, código ou área). Aparece o quadro com todas as UFCD do curso — código, designação, horas e se é obrigatória ou opcional; marque as que vai lecionar (ou “Todas as Obrigatórias”). O botão <b>Atualizar</b> volta a descarregar os cursos e as UFCD para manter a lista em dia; a lista fica guardada para usar sem internet e renova-se sozinha a cada 30 dias.</p>`});

/* Curso da turma (PROFIJ / profissional) a partir do Catálogo Nacional de Qualificações */
function cnqCursoSel(box,api){const M=cnqM();const busca={UFCD:'',UC:''};let ocupado=false,msg='';
  const desenha=()=>{box.innerHTML=`<div class="cnqh"><b>${ic('book',15)} Curso <span class="mut" style="font-weight:500">(Catálogo Nacional de Qualificações)</span></b><span class="sp1"></span><button type="button" class="btn sm" data-cnqref ${ocupado?'disabled':''}>${ic('refresh',13)} ${ocupado?'A Atualizar…':'Atualizar'}</button></div>
      ${cnqEscolhaCurso(box,api.val(),busca,'Sem curso indicado')}${msg?`<p class="hint" style="color:var(--bad);margin:6px 0 0">${esc(msg)}</p>`:''}`;
    box.querySelector('[data-cnqref]').onclick=()=>carrega(true);
    cnqLigaEscolha(box,busca,desenha,v=>{api.set(M.cursos.find(x=>String(x.id)===v)||null);desenha()})};
  const carrega=async f=>{ocupado=true;msg='';desenha();try{await cnqCarregarCursos();if(f)toast('Catálogo atualizado · '+M.cursos.length+' cursos','ok')}catch(e){msg='Não foi possível contactar o Catálogo ('+e.message+')'}ocupado=false;desenha()};
  desenha();if(!M.cursos.length||!M.ts||Date.now()-new Date(M.ts)>30*864e5)carrega(false)}
{const _ntc=novaTurmaDlg;novaTurmaDlg=function(r){_ntc.apply(this,arguments);const ow=$('#nt-ofw');if(!ow)return;const w=document.createElement('div');w.id='nt-cursow';w.className='cnq';w.style.margin='0 0 10px';ow.parentNode.after(w);
  const mw=document.createElement('div');mw.id='nt-modw';mw.style.margin='0 0 10px';w.after(mw);
  let cur=null;const of=()=>{const b=$('#nt-ofw [data-of].on');return b?b.dataset.of:'regular'};
  const mostra=()=>{const o=of();w.hidden=!['profij','profissional'].includes(o);mw.hidden=o!=='profissional';
    if(o==='profissional'&&!mw.dataset.ok){mw.dataset.ok='1';mw.innerHTML=`<label for="nt-mods">Módulos / UFCD / UC desta turma <span class="mut">(opcional — marque no quadro do curso ou escreva: código ; designação ; horas)</span></label><textarea id="nt-mods" rows="3"></textarea>`;montarCNQ($('#nt-mods'))}};
  cnqCursoSel(w,{val:()=>cur?cur.id:'',set:c=>{cur=c;if(c){UI.cnqCurso=String(c.id);const ci=$('#nt-curso');if(ci&&!ci.value.trim())ci.value=c.nome;const pw=$('#dw-b .cnq:not(#nt-cursow)');if(pw&&pw.parentNode){const ta=pw.nextElementSibling;if(ta&&ta.tagName==='TEXTAREA'){pw.remove();delete ta.dataset.cnq;montarCNQ(ta)}}}}});mostra();
  ow.addEventListener('click',()=>setTimeout(mostra,0));
  const ok=$('#nt-ok');if(!ok)return;const orig=ok.onclick;ok.onclick=function(){const a0=A();const ids=new Set(a0?a0.turmas.map(t=>t.id):[]);const mods=parseUfcds(($('#nt-mods')||{}).value||'');const prof=of()==='profissional';const res=orig.apply(this,arguments);const a=A();if(!a)return res;const novas=a.turmas.filter(t=>!ids.has(t.id));if(!novas.length)return res;
    if(cur&&!w.hidden){const c={id:cur.id,cod:cur.cod,nome:cur.nome,nivel:cur.nivel,area:cur.area,tipo:cnqTipoCurso(cur)};novas.forEach(t=>{t.cnq=c;if(!t.curso)t.curso=c.nome});a.cnqCurso=String(cur.id)}
    if(prof&&mods.length){const alvo=novas.filter(t=>ehComp(t.disciplina));(alvo.length?alvo:novas.slice(0,1)).forEach(t=>{t.modulos=mods.map(m=>({...m,id:uid()+Math.random().toString(36).slice(2,5)}))});novas.forEach(t=>{if(!alvo.includes(t)&&t!==novas[0]||alvo.length&&!alvo.includes(t))t.modulos=[]})}saveNow();return res}}}

/* ================= Acessibilidade (WCAG 2.2 AA · iPhone, iPad, Mac) ================= */
const a11yCfg=()=>S.cfg.a11y=S.cfg.a11y||{texto:100,movimento:'auto',contraste:false,ligacoes:false,gifs:'auto'};
function aplicarA11yCfg(){const c=a11yCfg();const r=document.documentElement;r.style.setProperty('--a11y-zoom',String((+c.texto||100)/100));
  r.classList.toggle('a11y-zoom',(+c.texto||100)!==100);r.classList.toggle('a11y-rm',c.movimento==='sim'||(c.movimento==='auto'&&matchMedia('(prefers-reduced-motion: reduce)').matches));
  r.classList.toggle('a11y-hc',!!c.contraste||matchMedia('(prefers-contrast: more)').matches);r.classList.toggle('a11y-lk',!!c.ligacoes)}
const A11Y={kb:false,live:null};
(function(){
  /* ligação para saltar a navegação + regiões */
  const sk=document.createElement('a');sk.href='#view';sk.className='a11y-skip';sk.textContent='Saltar para o conteúdo';
  sk.addEventListener('click',e=>{e.preventDefault();const v=$('#view');if(v)v.focus()});document.body.prepend(sk);
  const side=$('#side');if(side){side.setAttribute('aria-label','Navegação principal')}
  const v=$('#view');if(v){v.setAttribute('role','main');v.tabIndex=-1;v.setAttribute('aria-labelledby','ttl')}
  const bar=$('#bar');if(bar){bar.setAttribute('role','region');bar.setAttribute('aria-label','Barra da página')}
  const st=$('#selTurma');if(st)st.setAttribute('aria-label','Turma');const sa=$('#selAno');if(sa)sa.setAttribute('aria-label','Ano letivo');
  const mb=$('#menuBtn');if(mb){mb.setAttribute('aria-controls','side');mb.setAttribute('aria-expanded','false')}
  const dw=$('#drawer');if(dw){dw.setAttribute('role','dialog');dw.setAttribute('aria-labelledby','dw-t');if(!dw.classList.contains('on'))dw.inert=true}
  ['#scrim','#dwscrim'].forEach(s=>{const e=$(s);if(e)e.setAttribute('aria-hidden','true')});
  const lv=document.createElement('div');lv.id='a11y-live';lv.className='a11y-sr';lv.setAttribute('aria-live','polite');lv.setAttribute('aria-atomic','true');document.body.append(lv);A11Y.live=lv;
  /* modo de interação (teclado vs toque/rato) */
  addEventListener('keydown',e=>{if(e.key==='Tab'||e.key.startsWith('Arrow'))A11Y.kb=true},true);addEventListener('pointerdown',()=>{A11Y.kb=false},true);
  try{aplicarA11yCfg()}catch(_){}
  ['(prefers-reduced-motion: reduce)','(prefers-contrast: more)'].forEach(q=>{try{matchMedia(q).addEventListener('change',aplicarA11yCfg)}catch(_){}})
})();
function anunciar(t){const l=A11Y.live;if(!l)return;l.textContent='';setTimeout(()=>{l.textContent=t},80)}
/* barra lateral fora do ecrã (iPhone / iPad ao alto): não pode receber foco */
function a11ySide(){const s=$('#side');if(!s)return;const fora=getComputedStyle(s).position==='fixed'&&!document.body.classList.contains('menu');s.inert=fora;if(fora)s.setAttribute('aria-hidden','true');else s.removeAttribute('aria-hidden');
  const mb=$('#menuBtn');if(mb)mb.setAttribute('aria-expanded',document.body.classList.contains('menu')?'true':'false')}
new MutationObserver(()=>{a11ySide();const m=document.body.classList.contains('menu');if(m&&!a11ySide._m){setTimeout(()=>{const f=$('#side button.nav.on')||$('#side button.nav');if(f)f.focus({preventScroll:true})},60)}a11ySide._m=m}).observe(document.body,{attributes:true,attributeFilter:['class']});
addEventListener('resize',()=>requestAnimationFrame(a11ySide));setTimeout(a11ySide,0);
addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('menu')&&!$('#drawer.on')){document.body.classList.remove('menu');const mb=$('#menuBtn');if(mb)mb.focus()}});
/* painel lateral (drawer) como diálogo modal: o resto da app fica inerte enquanto está aberto */
function a11yDrawer(){const d=$('#drawer');if(!d)return;const ab=d.classList.contains('on');d.inert=!ab;if(ab)d.removeAttribute('aria-hidden');else d.setAttribute('aria-hidden','true');
  const m=$('#main');if(m)m.inert=ab;if(ab){const s=$('#side');if(s)s.inert=true}else a11ySide();if(!ab&&a11yDrawer._ab)setTimeout(()=>{const e=document.activeElement;if(!e||e===document.body){const t=$('#ttl');if(t){t.tabIndex=-1;t.focus({preventScroll:true})}}},80);if(ab!==a11yDrawer._ab&&ab)anunciar('Painel aberto: '+(($('#dw-t')||{}).textContent||''));a11yDrawer._ab=ab}
{const d=$('#drawer');if(d){new MutationObserver(a11yDrawer).observe(d,{attributes:true,attributeFilter:['class']});a11yDrawer()}}
/* navegação entre vistas: título da página, item atual, anúncio e foco */
{const _g=go;go=function(v){const deSide=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#side,#tTree,.ttree');const r=_g.apply(this,arguments);
  try{$$('#side [data-v]').forEach(b=>{if(b.dataset.v===VIEW&&b.classList.contains('on'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    const t=($('#ttl')||{}).textContent||'';document.title=(t?t+' · ':'')+'EduSpruce';anunciar(t);
    if(deSide&&A11Y.kb){const h=$('#ttl');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}}}catch(_){}return r}}
/* nomes acessíveis, cabeçalhos de tabela, regiões com scroll, botões de alternar */
const A11Y_SIMB={'×':'Remover','✕':'Fechar','✖':'Remover','+':'Acrescentar','−':'Diminuir','-':'Diminuir','‹':'Anterior','›':'Seguinte','«':'Anterior','»':'Seguinte','↑':'Subir','↓':'Descer','⋯':'Mais opções','…':'Mais opções','✓':'Confirmar','✎':'Editar'};
let _a11yN=0;
function nomeAcessivel(el){if(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby'))return true;if(el.labels&&el.labels.length)return true;if(el.title&&el.title.trim())return true;return false}
function a11yPasso(root){if(!root)return;
  root.querySelectorAll('input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset]),select,textarea').forEach(el=>{if(el.labels&&el.labels.length===1&&!el.getAttribute('aria-label')){const l=el.labels[0];if(l.title&&l.textContent.trim().length<10)el.setAttribute('aria-label',l.title)}if(nomeAcessivel(el))return;let lb=null;
    const p=el.previousElementSibling;if(p&&p.tagName==='LABEL'&&!p.htmlFor&&!p.querySelector('input,select,textarea'))lb=p;
    if(!lb&&el.parentElement){const l=el.parentElement.querySelector(':scope>label');if(l&&!l.htmlFor&&!l.contains(el)&&!l.querySelector('input,select,textarea'))lb=l}
    if(lb){if(!el.id)el.id='a11y-f'+(++_a11yN);lb.htmlFor=el.id;return}
    if(el.placeholder){el.setAttribute('aria-label',el.placeholder);return}
    const td=el.closest('td,th');if(td){const tr=td.parentElement,tb=td.closest('table');const i=[...tr.children].indexOf(td);const th=tb&&tb.tHead&&tb.tHead.rows[0]?tb.tHead.rows[0].children[i]:null;
      const col=th?th.textContent.trim():'';const row=tr.children[0]&&tr.children[0]!==td?tr.children[0].textContent.trim().slice(0,40):'';
      if(el.type==='checkbox'&&td.tagName==='TH'){el.setAttribute('aria-label','Selecionar todos');return}
      const n=[col,row].filter(Boolean).join(' · ');if(n){el.setAttribute('aria-label',n);return}}
    if(el.tagName==='SELECT'&&el.options[0]&&el.options[0].textContent.trim()){el.setAttribute('aria-label',el.options[0].value===''?'Filtrar: '+el.options[0].textContent.trim():el.options[0].textContent.trim());return}
    const card=el.closest('.card,.dwb');const h=card&&card.querySelector('h2,h3');if(h)el.setAttribute('aria-label',h.textContent.trim().slice(0,60))});
  root.querySelectorAll('button,[role=button],a[href]').forEach(el=>{if(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby'))return;const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(t&&!A11Y_SIMB[t])return;if(el.title&&el.title.trim()){if(!t)return;el.setAttribute('aria-label',el.title.trim());return}
    if(A11Y_SIMB[t]){el.setAttribute('aria-label',A11Y_SIMB[t]);return}
    const img=el.querySelector('img[alt]');if(img&&img.alt)return;el.setAttribute('aria-label',el.dataset.v?((TITLES[el.dataset.v])||'Abrir'):'Botão')});
  root.querySelectorAll('svg:not([aria-hidden]):not([role])').forEach(s=>s.setAttribute('aria-hidden','true'));
  root.querySelectorAll('img:not([alt])').forEach(i=>i.setAttribute('alt',''));
  root.querySelectorAll('table').forEach(tb=>{if(tb.dataset.a11y)return;tb.dataset.a11y='1';tb.querySelectorAll('thead th').forEach(th=>{if(!th.scope)th.scope='col'});tb.querySelectorAll('tbody th').forEach(th=>{if(!th.scope)th.scope='row'})});
  root.querySelectorAll('.tblw,[data-ov],.sheetwrap,.cnqt,.ntmais,.hscroll,.calev,.suml,[style*="overflow:auto"],[style*="overflow-x:auto"]').forEach(w=>{const o=getComputedStyle(w);const sc=/auto|scroll/.test(o.overflowX+o.overflowY);
    if(sc&&!w.hasAttribute('tabindex')&&!w.querySelector('a[href],button,input,select,textarea,[tabindex]')){w.tabIndex=0;w.setAttribute('role','region');const h=(w.closest('.card,.dwb')||document).querySelector('h2,h3');w.setAttribute('aria-label',(h?h.textContent.trim():'Tabela')+' (deslocável)')}});
  root.querySelectorAll('button.on,[data-of].on').forEach(b=>{if(b.closest('#side'))return;const p=b.parentElement;if(!p)return;const bs=[...p.children].filter(x=>x.tagName==='BUTTON');if(bs.length<2)return;p.dataset.a11yg='1';if(!p.getAttribute('role'))p.setAttribute('role','group')});
  root.querySelectorAll('[data-a11yg] > button:not([role])').forEach(b=>b.setAttribute('aria-pressed',b.classList.contains('on')?'true':'false'));
  root.querySelectorAll('[data-cd]:not([aria-label])').forEach(c=>{if(c.title)c.setAttribute('aria-label',c.title)});
  root.querySelectorAll('details>summary').forEach(s=>{const d=s.parentElement;s.setAttribute('aria-expanded',d.open?'true':'false')});
  root.querySelectorAll('[onclick]:not(button):not(a):not(input):not([role]),div[data-cd],span[data-cd]').forEach(e=>{if(!e.getAttribute('role'))e.setAttribute('role','button');if(!e.hasAttribute('tabindex'))e.tabIndex=0});
  const ap=$('#avpop');if(ap&&!ap.getAttribute('role')){ap.setAttribute('role','alertdialog');ap.setAttribute('aria-modal','true');const t=ap.querySelector('h2,h3,b');if(t){if(!t.id)t.id='a11y-avt';ap.setAttribute('aria-labelledby',t.id)}}
}
/* elementos clicáveis sem ser botão: Enter / Espaço ativam */
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target;if(!t||!t.matches||!t.matches('[role=button]:not(button):not(a)'))return;e.preventDefault();t.click()});
/* contraste mínimo 4,5:1 (texto pequeno) — corrige cores de etiquetas e cores definidas pelo utilizador */
function _rgb(s){if(!s)return null;let m=s.match(/^rgba?\(([^)]+)\)/);if(m){const p=m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);return [p[0],p[1],p[2],p.length>3?p[3]:1]}
  m=s.match(/^color\(srgb ([^)]+)\)/);if(m){const p=m[1].split(/[\s\/]+/).filter(Boolean).map(parseFloat);return [p[0]*255,p[1]*255,p[2]*255,p.length>3?p[3]:1]}return null}
const _lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
const _ratio=(a,b)=>{const x=_lum(a),y=_lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
function _fundo(el){let acc=null;const pilha=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const cs=getComputedStyle(e);if(cs.backgroundImage&&cs.backgroundImage!=='none'&&!/gradient/.test(cs.backgroundImage))return null;const c=_rgb(cs.backgroundColor);if(c&&c[3]>0){pilha.push(c);if(c[3]>=.99)break}}
  if(!pilha.length)pilha.push(document.documentElement.dataset.theme==='dark'?[28,28,30,1]:[255,255,255,1]);let b=pilha.pop();b=[b[0],b[1],b[2]];while(pilha.length){const c=pilha.pop();b=[c[0]*c[3]+b[0]*(1-c[3]),c[1]*c[3]+b[1]*(1-c[3]),c[2]*c[3]+b[2]*(1-c[3])]}return b}
function a11yContraste(root,forca){if(!root)return;const sel='.btn.pri,.btn.dng,.dng,.lin > *,.ev *,.mta,.mtp,.mtc *,.nlb,.dimc,.tag,.mtd,.tm,.tm *,.anob,.dh,.mut,.hint,.kpi .l,.cd,.cd b,.cd span,.plq,.lnk,[style*="color"],.aula b,.aula span,.cp b,.pcor b,[style*="--"] > b,[style*="--"] > span,[style*="background"] b,[style*="background"] span,[style*="background"] small';
  const alvos=new Set(root.querySelectorAll(sel));if(/^(view|dw-b|avpop)$/.test(root.id)){const temImg=e=>{for(let x=e,k=0;x&&x!==root&&k<8;x=x.parentElement,k++){const bi=getComputedStyle(x).backgroundImage;if(bi&&bi!=='none')return true}return false};const W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});let n,k=0;while((n=W.nextNode())&&k<4000){const e=n.parentElement;if(e&&!alvos.has(e)&&!/^(SCRIPT|STYLE|OPTION|TEXTAREA)$/.test(e.tagName)&&!e.closest('svg,[contenteditable=true]')&&!temImg(e)){alvos.add(e);k++}}}
  alvos.forEach(el=>{if(document.body.classList.contains('est-sge')&&el.closest('#bar'))return;if(el.closest('.apres-oc,[disabled],[aria-disabled=true]'))return;if(!forca&&el.dataset.cg===el.className+'|'+(el.getAttribute('style')||'').length)return;
    if(!el.textContent.trim()||!el.getClientRects().length)return;el.dataset.cg=el.className+'|'+(el.getAttribute('style')||'').length;const cs=getComputedStyle(el);if(cs.visibility==='hidden')return;for(let e=el,k=0;e&&k<4;e=e.parentElement,k++){const o=parseFloat(getComputedStyle(e).opacity);if(o<1&&o>0&&!e.disabled&&!e.closest('[disabled]'))e.style.setProperty('opacity','1','important')}
    let fg=_rgb(cs.color);const bg=_fundo(el);if(!fg||!bg)return;const fs=parseFloat(cs.fontSize),bold=+cs.fontWeight>=700;const alvo=(fs>=24||(fs>=18.66&&bold))?3:4.5;
    if(fg[3]<1)fg=[fg[0]*fg[3]+bg[0]*(1-fg[3]),fg[1]*fg[3]+bg[1]*(1-fg[3]),fg[2]*fg[3]+bg[2]*(1-fg[3])];if(_ratio(fg,bg)>=alvo+.05)return;
    const claro=_lum(bg)>.4;let c=fg.slice(0,3);for(let i=0;i<24&&_ratio(c,bg)<alvo+.1;i++)c=c.map(v=>claro?v*.88:v+(255-v)*.16);
    if(_ratio(c,bg)>=alvo){el.style.setProperty('color',`rgb(${c.map(Math.round).join(',')})`,'important');el.style.filter='none';return}
    /* texto já branco/preto: escurece/clareia o fundo do próprio elemento */
    let dono=el;for(let k=0;k<3&&dono;k++){const c2=_rgb(getComputedStyle(dono).backgroundColor);if(c2&&c2[3]>=.99)break;dono=dono.parentElement}
    if(dono&&dono!==document.body){let b=_fundo(dono);const fc=fg.slice(0,3);const escurece=_lum(fc)>.5;for(let i=0;i<24&&_ratio(fc,b)<alvo+.1;i++)b=b.map(v=>escurece?v*.9:v+(255-v)*.15);dono.style.setProperty('background-color',`rgb(${b.map(Math.round).join(',')})`,'important')}})}
{let _q=0,_t=0;const raiz=()=>['#view','#dw-b','#bar','#side','#avpop','#toast'].map(s=>$(s)).filter(Boolean);const run=()=>{cancelAnimationFrame(_q);_q=requestAnimationFrame(()=>{raiz().forEach(e=>{try{a11yPasso(e)}catch(x){console.warn(x)}try{a11yContraste(e)}catch(x){console.warn(x)}})});if(!_t)_t=setTimeout(()=>{_t=0;raiz().forEach(e=>{try{a11yPasso(e)}catch(x){}try{a11yContraste(e,true)}catch(x){}})},600)};
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','open','data-theme']});new MutationObserver(()=>{$$('[data-cg]').forEach(e=>{delete e.dataset.cg;e.style.removeProperty('color');e.style.removeProperty('background-color')});run()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});run()}
/* animações da ajuda: botão Pausar / Reproduzir (pausadas se o sistema pedir menos movimento) */
function a11yGifs(root){(root||document).querySelectorAll('figure.ajf img:not([data-gp])').forEach(img=>{img.dataset.gp='1';const src=img.src;const fig=img.closest('figure');if(!fig)return;fig.style.position='relative';
  const b=document.createElement('button');b.type='button';b.className='btn sm a11y-gifb';const cv=document.createElement('canvas');cv.className='a11y-gifc';cv.hidden=true;cv.setAttribute('role','img');cv.setAttribute('aria-label',img.alt+' (em pausa)');img.after(cv);
  const pausa=p=>{if(p){try{cv.width=img.naturalWidth;cv.height=img.naturalHeight;cv.getContext('2d').drawImage(img,0,0);cv.style.width='100%';cv.hidden=false;img.hidden=true}catch(_){}}else{cv.hidden=true;img.hidden=false;img.src=src}b.innerHTML=p?ic('play',14)+' Reproduzir':ic('pause',14)+' Pausar';b.setAttribute('aria-pressed',p?'true':'false');b.setAttribute('aria-label',(p?'Reproduzir':'Pausar')+' animação: '+img.alt.replace(/^Animação:\s*/,''))};
  b.onclick=()=>pausa(!img.hidden);fig.appendChild(b);const rm=document.documentElement.classList.contains('a11y-rm');if(rm){if(img.complete)pausa(true);else img.addEventListener('load',()=>pausa(true),{once:true})}else pausa(false)})}
new MutationObserver(()=>requestAnimationFrame(()=>a11yGifs($('#view')))).observe(document.body,{childList:true,subtree:true});
if(!ICONS.userx)ICONS.userx='<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 4 1.5M16 15l5 5M21 15l-5 5"/>';if(!ICONS.play)ICONS.play='<path d="M7 4.5v15l12-7.5z"/>';if(!ICONS.pause)ICONS.pause='<path d="M8 5v14M16 5v14"/>';ICONS.a11y='<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v4.5M12 14.5l-3.5 6M12 14.5l3.5 6"/>';if(!ICONS.access)ICONS.access='<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>';
/* Definições › Geral: cartão Acessibilidade */
function cartaoA11y(){const c=a11yCfg();const seg=(k,ops)=>`<div class="seg a11yseg" role="radiogroup" aria-label="${esc(ops.l)}">${ops.o.map(([v,t])=>`<button type="button" role="radio" aria-checked="${String(c[k])===String(v)?'true':'false'}" class="${String(c[k])===String(v)?'on':''}" data-a11k="${k}" data-a11v="${v}">${t}</button>`).join('')}</div>`;
  return `<div class="card" id="a11y-card"><h2>${ic('a11y',18)} Acessibilidade</h2><p class="hint" style="margin-top:0">A app segue também as definições do iPhone, iPad e Mac (Reduzir Movimento, Aumentar Contraste, tamanho do texto do navegador, VoiceOver e Controlo por Teclado).</p>
    <div class="a11yg"><div><label>Tamanho do Texto</label>${seg('texto',{l:'Tamanho do texto',o:[[100,'Normal'],[115,'Grande'],[130,'Maior'],[150,'Máximo']]})}</div>
    <div><label>Movimento e Animações</label>${seg('movimento',{l:'Movimento',o:[['auto','Como o Sistema'],['sim','Reduzir'],['nao','Normal']]})}</div>
    <div><label>Contraste</label>${seg('contraste',{l:'Contraste',o:[[false,'Normal'],[true,'Reforçado']]})}</div>
    <div><label>Ligações</label>${seg('ligacoes',{l:'Ligações',o:[[false,'Como no Desenho'],[true,'Sempre Sublinhadas']]})}</div></div></div>`}
function bindA11y(){$$('[data-a11k]').forEach(b=>b.onclick=()=>{const c=a11yCfg();let v=b.dataset.a11v;if(v==='true')v=true;else if(v==='false')v=false;else if(/^\d+$/.test(v))v=+v;c[b.dataset.a11k]=v;save();aplicarA11yCfg();const y=$('#a11y-card');const n=document.createElement('div');n.innerHTML=cartaoA11y();y.replaceWith(n.firstElementChild);bindA11y();const f=$(`[data-a11k="${b.dataset.a11k}"][data-a11v="${b.dataset.a11v}"]`);if(f)f.focus({preventScroll:true});anunciar('Definição guardada')})}
{const _vd=vDefinicoes;vDefinicoes=function(){const r=_vd.apply(this,arguments);try{if((UI.defTab||'geral')==='geral'&&!$('#a11y-card')){const v=$('#view');const cards=v.querySelectorAll('.vmain>.card,:scope>.card');const ref=cards[0];const h=document.createElement('div');h.innerHTML=cartaoA11y();const el=h.firstElementChild;if(ref)ref.after(el);else v.appendChild(el);bindA11y()}}catch(e){console.warn(e)}return r}}
AJUDA.push({id:'a11y',ic:'a11y',t:'Acessibilidade',gif:null,txt:`<p>O EduSpruce foi revisto para as regras de acessibilidade WCAG 2.2 (nível AA) e as orientações da Apple para iPhone, iPad e Mac:</p><ul>
  <li><b>VoiceOver</b>: todos os botões, campos e tabelas têm nome; o painel lateral é anunciado como diálogo; as mudanças de página e as mensagens são anunciadas.</li>
  <li><b>Teclado (Mac / iPad com teclado)</b>: “Saltar para o conteúdo” é o primeiro elemento; Tab percorre tudo pela ordem visual, com contorno de foco visível; Esc fecha painéis e o menu; ⌘K abre a pesquisa.</li>
  <li><b>Toque</b>: no iPhone e iPad todos os botões e campos têm pelo menos 44 × 44 pontos; os campos não fazem zoom ao tocar.</li>
  <li><b>Contraste</b>: texto com contraste mínimo de 4,5:1, também nas cores escolhidas para reuniões, tempos e domínios; “Aumentar Contraste” do sistema reforça contornos.</li>
  <li><b>Movimento</b>: com “Reduzir Movimento” as animações param e as imagens animadas da ajuda ficam em pausa (botão Reproduzir/Pausar em cada uma).</li>
  <li><b>Texto</b>: Definições › Geral › Acessibilidade aumenta o texto até 150 % sem cortar conteúdo; o zoom do navegador também funciona.</li></ul>`});

/* re-desenhar sem saltar: mantém o elemento ativo no mesmo sítio do ecrã e o foco */
function manterPosicao(fn){const ae=document.activeElement;const chave=ae&&ae.dataset?Object.entries(ae.dataset).find(([k])=>!/^(cg|a11y|dec)/.test(k)):null;const sel=chave?`[data-${chave[0].replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}="${CSS.escape(chave[1])}"]`:(ae&&ae.id?'#'+CSS.escape(ae.id):null);
  const y0=ae&&ae!==document.body&&ae.getBoundingClientRect?ae.getBoundingClientRect().top:null;const sc=[document.scrollingElement,$('#view'),$('#dw-b'),$('#drawer .dwb')].filter(Boolean).map(e=>[e,e.scrollTop]);
  fn();const ajusta=()=>{sc.forEach(([e,v])=>{if(e.isConnected&&e.scrollTop!==v)e.scrollTop=v});if(sel&&y0!=null){const n=document.querySelector(sel);if(n){const d=n.getBoundingClientRect().top-y0;if(Math.abs(d)>1){let alvo=n.parentElement;while(alvo&&alvo!==document.body){const o=getComputedStyle(alvo).overflowY;if(/auto|scroll/.test(o)&&alvo.scrollHeight>alvo.clientHeight+2)break;alvo=alvo.parentElement}(alvo&&alvo!==document.body?alvo:document.scrollingElement).scrollTop+=d}try{n.focus({preventScroll:true})}catch(_){}}}};
  ajusta();requestAnimationFrame(()=>{ajusta();setTimeout(ajusta,60)})}

/* atalhos genéricos para outra vista (ex.: estados vazios) */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-goview]');if(b){e.preventDefault();go(b.dataset.goview)}});

/* título da página com tamanho dinâmico: encolhe até caber (mín. 15 px) e só depois passa a 2 linhas */
function ajustarTitulo(minFs){minFs=minFs||15;const t=$('#ttl');if(!t)return;t.style.fontSize='';t.style.whiteSpace='';t.style.webkitLineClamp='';t.classList.remove('ttl2');
  const base=parseFloat(getComputedStyle(t).fontSize)||22;let fs=base;const cabe=()=>t.scrollWidth<=t.clientWidth+1;
  if(!t.clientWidth)return;while(!cabe()&&fs>minFs){fs-=1;t.style.fontSize=fs+'px'}if(!cabe())t.classList.add('ttl2')}
/* barra superior: tudo numa linha sempre que couber (título encolhe até 17 px); só passa a duas linhas se não couber */
ajustarBarra=function(){const b=document.getElementById('bar');if(!b)return;b.classList.remove('bar2');const t=$('#ttl');ajustarTitulo(17);if(innerWidth<=1000){ajustarTitulo();return}
  if(b.scrollWidth>b.clientWidth+1||(t&&t.classList.contains('ttl2'))){b.classList.add('bar2');ajustarTitulo()}};
{const _g2=go;go=function(){const r=_g2.apply(this,arguments);requestAnimationFrame(()=>ajustarBarra());return r}}
{const t=$('#ttl');if(t&&window.ResizeObserver){let w=0;new ResizeObserver(en=>{const nw=Math.round(en[0].contentRect.width);if(nw!==w){w=nw;requestAnimationFrame(()=>{if($('#bar.bar2')||innerWidth<=1000)ajustarTitulo();else ajustarBarra()})}}).observe(t.parentElement)}
  if(t)new MutationObserver(()=>requestAnimationFrame(()=>ajustarBarra())).observe(t,{childList:true,characterData:true,subtree:true})}

/* Imprimir = documento próprio (o mesmo do “Exportar PDF”), não a página da app */
let _imprimirPdf=false;
{const _dl=download;download=function(nome,dados,mime){if(_imprimirPdf&&/pdf/.test(mime||'')){_imprimirPdf=false;imprimirBytes(dados,nome);return}return _dl.apply(this,arguments)}}
function imprimirBytes(bytes,nome){const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const safari=/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)||/iPad|iPhone/.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(navigator.userAgent));
  if(safari){const w=window.open(url,'_blank');if(!w){toast('Permita janelas pop-up para imprimir','bad')}else toast('Documento aberto — use Partilhar › Imprimir','ok');setTimeout(()=>URL.revokeObjectURL(url),120000);return}
  let f=$('#a11y-printf');if(f)f.remove();f=document.createElement('iframe');f.id='a11y-printf';f.title='Documento para imprimir';f.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0';f.src=url;document.body.appendChild(f);
  f.onload=()=>setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){window.open(url,'_blank')}},250)}
const _printNativo=window.print.bind(window);
function imprimirVista(){if(_imprimirPdf)return;_imprimirPdf=true;toast('A preparar o documento para imprimir…');try{const r=exportarVistaPdf();Promise.resolve(r).finally(()=>setTimeout(()=>{if(_imprimirPdf){_imprimirPdf=false}},4000))}catch(e){_imprimirPdf=false;console.warn(e);_printNativo()}}
window.print=imprimirVista;
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&!e.shiftKey&&!e.altKey&&(e.key==='p'||e.key==='P')){e.preventDefault();imprimirVista()}},true);

/* Início: aulas dadas e previstas por turma (período/semestre atual ou ano letivo) */
function widgetAulasTurmas(){const a=A();if(!a)return '';const TT=a.turmas.filter(t=>escolaDe(t)===EC());if(!TT.length)return '';
  const P=periodos();const W=P.length===2?'Semestre':'Período';let per=periodoDe(isoData(new Date()));if(!per){const c=a.calendario;const hj=isoData(new Date());const nx=c&&c.periodos?c.periodos.find(p=>p.ini>hj):null;per=nx?nx.n:P[P.length-1]}
  const modo=UI.awEsc||'per';const linhas=TT.map(t=>{let L=[];try{L=listaAulas(t,a)}catch(_){}const X=modo==='ano'?L:L.filter(x=>x.per===per);const prev=X.filter(x=>!x.repos).length;const dadas=X.filter(x=>x.licao).length;return {t,prev,dadas,falt:X.filter(x=>x.falta&&!x.falta.subst&&x.passada).length}});
  const comHor=linhas.filter(l=>l.prev);
  return `<div class="card waul"><div class="row" style="gap:8px;margin-bottom:10px"><h2 style="margin:0;font-size:15px">${ic('checks',16)} Aulas Dadas</h2></div>
    <div class="seg a11yseg" role="radiogroup" aria-label="Período das contas" style="margin:0 0 10px">${[['per',per+'.º '+W],['ano','Ano Letivo']].map(([k,l])=>`<button type="button" role="radio" aria-checked="${modo===k}" class="${modo===k?'on':''}" data-awesc="${k}">${l}</button>`).join('')}</div>
    ${comHor.length?`<ul class="waull">${linhas.map(l=>{const pc=l.prev?Math.round(100*l.dadas/l.prev):0;return `<li><button type="button" class="waulb" data-awt="${l.t.id}" aria-label="${esc(l.t.nome+' · '+l.t.disciplina+': '+l.dadas+' aulas dadas de '+l.prev+' previstas')}"><span class="waulh"><b>${esc(l.t.nome)}</b><span class="mut">${esc(siglaDe?siglaDe(l.t):l.t.disciplina)}</span><span class="sp1"></span><b class="waulv">${l.dadas}</b><span class="mut">/${l.prev}</span></span>
      <span class="waulbar" aria-hidden="true"><i style="width:${pc}%"></i></span>${l.prev?`<span class="mut waulf">${l.prev-l.dadas} por dar${l.falt?` · <span style="color:var(--bad)">${l.falt} falta${l.falt>1?'s':''}</span>`:''}</span>`:'<span class="mut waulf">sem horário</span>'}</button></li>`}).join('')}</ul>
      <p class="hint" style="margin:8px 0 0">Tempos de 45 min. Toque numa turma para abrir Aulas e Sumários.</p>`:`<p class="mut" style="margin:0">Importe o calendário escolar e os horários para ver as aulas.</p><div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm" data-goview="calendario">${ic('calcheck',13)} Calendário</button><button class="btn sm" data-goview="turmas">${ic('calendar',13)} Horários</button></div>`}</div>`}
function bindAulasTurmas(){$$('[data-awesc]').forEach(b=>b.onclick=()=>{UI.awEsc=b.dataset.awesc;const w=$('#w-aulas');if(w){w.innerHTML=widgetAulasTurmas();bindAulasTurmas();const n=$(`[data-awesc="${UI.awEsc}"]`);if(n)n.focus({preventScroll:true})}});
  $$('[data-awt]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.awt;save();go('sumarios')})}

/* ================= Avaliação da componente oral (Inglês 358 — Parte D) ================= */
const ORAL_P=[
  {k:'amb',n:'Âmbito',s:'gramatical e vocabular',d:{N4:'Repertório alargado de recursos linguísticos; formulações variadas; poucas repetições.',N3:'Repertório suficiente; algumas dificuldades de formulação, que consegue resolver; algumas repetições.',N2:'Repertório elementar; dificuldades de formulação que nem sempre resolve; repetições frequentes.',N1:'Repertório limitado, recorrendo a frases memorizadas; dificuldades que não resolve; repetições sistemáticas.'}},
  {k:'cor',n:'Correção/Controlo',s:'gramatical/vocabular e fonológico',d:{N4:'Bom domínio de estruturas simples (complexas com imprecisões); bom controlo vocabular; pronúncia clara.',N3:'Razoável domínio de estruturas simples; controlo vocabular razoável; pronúncia geralmente clara.',N2:'Domínio elementar, com alguns erros; controlo vocabular elementar; pronúncia por vezes pouco clara.',N1:'Domínio limitado, erros frequentes; vocabulário limitado; pronúncia que exige esforço de compreensão.'}},
  {k:'flu',n:'Fluência',s:'',d:{N4:'Comunica com espontaneidade/facilidade; pausas pontuais para planificar.',N3:'Alguma facilidade; algumas pausas para planificar.',N2:'Pouca facilidade; pausas e hesitações evidentes.',N1:'Muito pouca facilidade (por vezes impede a compreensão); pausas e hesitações frequentes.'}},
  {k:'des',n:'Desenvolvimento Temático, Coerência e Coesão',s:'',d:{N4:'Informação relevante; discurso claro e coerente; mecanismos de coesão eficazes.',N3:'Informação geralmente relevante; discurso geralmente claro; coesão geralmente eficaz.',N2:'Informação nem sempre relevante; discurso pouco claro; coesão pouco eficaz.',N1:'Informação pouco relevante; ideias isoladas; coesão muito pouco eficaz.'}},
  {k:'int',n:'Interação',s:'',d:{N4:'Inicia, mantém e conclui de forma eficaz; intervém sem ajuda.',N3:'De forma geralmente eficaz; intervém de forma geralmente apropriada, sem ajuda.',N2:'De forma pouco eficaz; intervém com ajuda do(s) interlocutor(es).',N1:'De forma muito pouco eficaz; dificuldade em manter um diálogo autónomo.'}}];
const ORAL_N=[['N4',12],['N3',8],['N2',6],['N1',2],['0',0]];
const oralM=t=>{t.oral=t.oral||{};const o=t.oral;o.cfg=o.cfg||{total:50,pesos:{amb:20,cor:20,flu:20,des:20,int:20},man:oralMan50(),_m50:1};o.regs=o.regs||{};o.cfg.man=o.cfg.man||{};o.cfgGlob=o.cfgGlob||o.cfg;oralMig(o);o.cfgI=o.cfgI||{};o.regsI=o.regsI||{};
  {const I=t.instrumentos||[];if(o.inst){const x=I.find(i=>i.id===o.inst);if(x&&x.oral)o.propId=x.id;else if(!x){const ant=o.inst;o.regsI['apagado:'+ant]=o.regs;if(ant===o.propId)o.propId=null;o.inst=null;o.regs=o.propId?(o.regsI._proprio||{}):{}}}
   if(o.propId&&!I.some(i=>i.id===o.propId))o.propId=null;if(!o.inst&&o.propId)o.inst=o.propId;if(o.propId&&o.regsI[o.propId]&&!o.regsI._proprio){o.regsI._proprio=o.regsI[o.propId];delete o.regsI[o.propId]}}
  {const k=o.inst&&o.inst!==o.propId?o.inst:'_proprio';o.cfg=o.cfgI[k]||o.cfgGlob;o.cfg.man=o.cfg.man||{}}return o};
const r2=x=>Math.round(x*100)/100;
const oralMax=(c,k)=>r2((+c.total||0)*(+c.pesos[k]||0)/100);
const oralAuto=(c,k,nv)=>r2(oralMax(c,k)*((ORAL_N.find(x=>x[0]===nv)||[0,0])[1])/12);
const oralPts=(c,k,nv)=>{const m=c.man[k];return m&&m[nv]!=null&&m[nv]!==''?+m[nv]:oralAuto(c,k,nv)};
const fmtP=x=>x==null||x===''?'—':String(r2(+x)).replace('.',',');
function oralProblemas(c){const P=[];const soma=ORAL_P.reduce((s,p)=>s+(+c.pesos[p.k]||0),0);if(Math.abs(soma-100)>0.05)P.push(`Os pesos somam ${fmtP(soma)} % (deviam somar 100 %).`);
  let tot=0;ORAL_P.forEach(p=>{const top=oralPts(c,p.k,'N4');tot+=top;const mx=oralMax(c,p.k);if(Math.abs(top-mx)>0.05)P.push(`${p.n}: o nível N4 vale ${fmtP(top)}, mas pelo peso de ${fmtP(c.pesos[p.k])} % devia valer ${fmtP(mx)}.`);
    const v=ORAL_N.map(([n])=>oralPts(c,p.k,n));for(let i=1;i<v.length;i++)if(v[i]>v[i-1]){P.push(`${p.n}: o nível ${ORAL_N[i][0]} (${fmtP(v[i])}) vale mais do que ${ORAL_N[i-1][0]} (${fmtP(v[i-1])}).`);break}
    if(v.some(x=>x<0))P.push(`${p.n}: há pontuações negativas.`)});
  if(Math.abs(tot-(+c.total||0))>0.05)P.push(`A soma das pontuações máximas (${fmtP(tot)}) não corresponde à cotação total (${fmtP(c.total)}).`);return P}
function oralAjustar(c){const soma=ORAL_P.reduce((s,p)=>s+(+c.pesos[p.k]||0),0);if(soma>0&&Math.abs(soma-100)>0.01)ORAL_P.forEach(p=>c.pesos[p.k]=r2((+c.pesos[p.k]||0)*100/soma));
  ORAL_P.forEach(p=>{const m=c.man[p.k];if(!m)return;const top=oralPts(c,p.k,'N4');const mx=oralMax(c,p.k);const f=top>0?mx/top:0;const nm={};let ant=Infinity;ORAL_N.forEach(([n])=>{let v=m[n]!=null&&m[n]!==''?r2(+m[n]*f):oralAuto(c,p.k,n);if(n==='N4')v=mx;v=Math.max(0,Math.min(v,ant));nm[n]=v;ant=v});c.man[p.k]=nm})}
/* aviso modal acessível (diálogo nativo, foco preso, Esc fecha) */
function avisoModal(titulo,itens,botoes){return new Promise(res=>{const d=document.createElement('dialog');d.className='amodal';d.setAttribute('aria-labelledby','am-t');d.setAttribute('aria-describedby','am-d');
  d.innerHTML=`<div class="amh">${ic('alert',22)}<h2 id="am-t">${esc(titulo)}</h2></div><div id="am-d"><ul>${itens.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="row amb">${botoes.map((b,i)=>`<button type="button" class="btn ${b.c||''}" data-amb="${i}">${b.t}</button>`).join('')}</div>`;
  document.body.appendChild(d);const fim=v=>{try{d.close()}catch(_){}d.remove();res(v)};d.addEventListener('cancel',e=>{e.preventDefault();fim(null)});d.querySelectorAll('[data-amb]').forEach(b=>b.onclick=()=>fim(botoes[+b.dataset.amb].v));
  try{d.showModal()}catch(_){d.setAttribute('open','')}const p=d.querySelector('.btn.pri')||d.querySelector('[data-amb]');if(p)p.focus()})}
async function oralValidar(t,depois){const c=oralM(t).cfg;const P=oralProblemas(c);if(!P.length){save();depois&&depois();return}if(document.querySelector('dialog.amodal'))return;
  const v=await avisoModal('As cotações não estão de acordo com os pesos',P,[{t:ic('check',15)+' Ajustar aos Pesos',c:'pri',v:'aj'},{t:'Manter Assim',v:'ok'}]);
  if(v==='aj'){oralAjustar(c);toast('Cotações ajustadas aos pesos','ok')}save();depois&&depois()}
function oralTotal(t,aid){const o=oralM(t);const r=o.regs[aid];if(!r||!r.n)return null;const ks=ORAL_P.filter(p=>r.n[p.k]!=null&&r.n[p.k]!=='');if(!ks.length)return null;return {pts:r2(ks.reduce((s,p)=>s+oralPts(o.cfg,p.k,r.n[p.k]),0)),completo:ks.length===ORAL_P.length}}
function vOral(){const t=T();if(!t)return go('turmas');const o=oralM(t);const c=o.cfg;const al=alunosFiltro(t);const P=oralProblemas(c);
  barBtns([{id:'b-orpdf',t:ic('file',15)+' Ficha de Registo (PDF)',f:()=>oralPdf(t)},{id:'b-orcsv',t:ic('download',15)+' Exportar CSV',f:()=>download('Oral '+t.nome+'.csv',csv([['N.º','Nome','Guião',...ORAL_P.map(p=>p.n),'Total','Cotação','%'],...al.map(a=>{const r=o.regs[a.id]||{n:{}};const tt=oralTotal(t,a.id);return [a.num,a.nome,r.g||'',...ORAL_P.map(p=>r.n&&r.n[p.k]?r.n[p.k]+' ('+fmtP(oralPts(c,p.k,r.n[p.k]))+')':''),tt?fmtP(tt.pts):'',fmtP(c.total),tt&&c.total?fmtP(100*tt.pts/c.total):'']})]),'text/csv')}]);
  const tots=al.map(a=>oralTotal(t,a.id)).filter(x=>x&&x.completo).map(x=>x.pts);const med=tots.length?tots.reduce((s,x)=>s+x,0)/tots.length:null;
  const cel=(p,n)=>{const m=c.man[p.k]&&c.man[p.k][n]!=null&&c.man[p.k][n]!=='';return `<td><input class="txtin orc ${m?'man':''}" data-orc="${p.k}|${n}" value="${fmtP(oralPts(c,p.k,n))}" inputmode="decimal" aria-label="${esc(p.n)}, nível ${n}: pontos" title="${m?'Valor editado à mão':'Valor proporcional ao peso'}"></td>`};
  $('#view').innerHTML=`<div class="kpis"><div class="kpi"><div class="l">${ic('users',14)} Avaliados</div><div class="v">${tots.length}</div><div class="mut">de ${al.length} alunos</div></div><div class="kpi"><div class="l">${ic('chart',14)} Média</div><div class="v vt">${med!=null?fmtP(med):'—'}</div><div class="mut">em ${fmtP(c.total)} pontos</div></div></div>
  <details class="card orcot" id="or-cot" ${UI.orCot||P.length?'open':''}><summary class="row" style="cursor:pointer;list-style:none"><h2 style="margin:0">${ic('sliders',18)} Cotações e Pesos</h2><span class="tag ${P.length?'bad':'ok'}">${P.length?P.length+' aviso'+(P.length>1?'s':''):'De acordo com os pesos'}</span><span class="sp1"></span><span class="btn sm dsalt">${ic('pencil',13)} Alterar</span><span class="btn sm dsfec">${ic('x',12)} Fechar</span></summary>
    <p class="hint">Critérios oficiais (Inglês 358, Parte D): 5 parâmetros × N4 12 · N3 8 · N2 6 · N1 2 · 0 pontos = 60. Mude a cotação total e os pesos — as pontuações de cada nível são recalculadas em proporção. Pode editar qualquer valor à mão (fica a azul); se deixar de bater certo com os pesos, aparece um aviso.</p>
    <div class="row" style="gap:10px;flex-wrap:wrap;align-items:end;margin-bottom:10px"><div><label for="or-tot">Cotação Total</label><input id="or-tot" type="number" min="1" step="any" value="${c.total}" style="width:110px" inputmode="decimal"></div>
      <div class="seg" role="group" aria-label="Cotações frequentes">${[60,100,200,20].map(v=>`<button type="button" data-ortot="${v}" class="${+c.total===v?'on':''}">${v===20?'20 valores':v+' pontos'}</button>`).join('')}</div><span class="sp1"></span>
      <button type="button" class="btn sm" id="or-eq">${ic('refresh',13)} Pesos Iguais</button><button type="button" class="btn sm" id="or-rep">${ic('refresh',13)} Repor Proporcional</button></div>
    <div class="tblw"><table class="lst orct"><thead><tr><th scope="col">Parâmetro</th><th scope="col">Peso</th>${ORAL_N.map(([n,b])=>`<th scope="col">${n==='0'?'Abaixo de N1':n}<div class="dh">oficial ${b}</div></th>`).join('')}</tr></thead><tbody>
    ${ORAL_P.map(p=>`<tr><th scope="row" style="text-align:left"><b>${esc(p.n)}</b>${p.s?`<div class="dh">${esc(p.s)}</div>`:''}</th><td class="nw"><input class="txtin orw" data-orw="${p.k}" value="${fmtP(c.pesos[p.k])}" inputmode="decimal" aria-label="Peso de ${esc(p.n)} em percentagem" style="width:64px"> %</td>${ORAL_N.map(([n])=>cel(p,n)).join('')}</tr>`).join('')}
    </tbody><tfoot><tr><th scope="row" style="text-align:left">Total</th><td>${fmtP(ORAL_P.reduce((s,p)=>s+(+c.pesos[p.k]||0),0))} %</td><td><b>${fmtP(ORAL_P.reduce((s,p)=>s+oralPts(c,p.k,'N4'),0))}</b></td><td colspan="4"></td></tr></tfoot></table></div>
    ${P.length?`<div class="alert w" role="status" style="margin-top:10px">${P.map(esc).join('<br>')} <button class="btn sm" id="or-aj">Ajustar aos Pesos</button></div>`:''}</details>
  <div class="card"><div class="row" style="flex-wrap:wrap;gap:10px"><h2 style="margin:0">${ic('fala',18)} Ficha de Registo — Componente Oral</h2>${selOrigem(t)}<span class="sp1"></span><label for="or-data" class="mut" style="margin:0">Data</label><input type="date" id="or-data" value="${esc(o.data||'')}" style="width:auto"></div>
    <p class="hint">Assinale, para cada parâmetro, o nível observado (toque longo ou passe o rato para ver o descritor). Um desempenho abaixo de N1 vale 0. Em caso de dúvida entre dois níveis, opte pelo mais elevado.</p>
    ${al.length?`<div class="tblw"><table class="lst orreg"><thead><tr><th scope="col">N.º</th><th scope="col">Aluno</th><th scope="col">Guião</th>${ORAL_P.map(p=>`<th scope="col" title="${esc(p.n+(p.s?' ('+p.s+')':''))}">${esc(p.n.split(/[ /,]/)[0])}<div class="dh">${fmtP(oralMax(c,p.k))}</div></th>`).join('')}<th scope="col">Total</th></tr></thead><tbody>
      ${al.map(a=>{const r=o.regs[a.id]||{n:{}};const tt=oralTotal(t,a.id);return `<tr data-ora="${a.id}"><td class="n">${esc(numAl(a))}</td><td style="text-align:left"><span class="oral-al">${avatar(a,26)}<span>${esc(a.nome)}${tagOrig(t,a)}</span></span></td><td><input class="txtin" data-org="${a.id}" value="${esc(r.g||'')}" style="width:52px;text-align:center" inputmode="numeric" aria-label="Guião de ${esc(a.nome)}"></td>
        ${ORAL_P.map(p=>`<td><div class="orlv" role="radiogroup" aria-label="${esc(p.n)} — ${esc(a.nome)}">${ORAL_N.map(([n])=>`<button type="button" role="radio" aria-checked="${r.n&&r.n[p.k]===n?'true':'false'}" class="${r.n&&r.n[p.k]===n?'on':''}" data-orn="${a.id}|${p.k}|${n}" title="${esc(n==='0'?'Abaixo de N1 — 0 pontos':n+' — '+fmtP(oralPts(c,p.k,n))+' pts: '+p.d[n])}">${n==='0'?'0':n}</button>`).join('')}</div></td>`).join('')}
        <td class="calc orsum" data-ortc="${a.id}"><b>${tt?fmtP(tt.pts):'—'}</b>${tt&&!tt.completo?'<div class="dh">incompleto</div>':''}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">Nenhum aluno frequenta a disciplina.</div>'}</div>`;
  const re=()=>manterPosicao(vOral);
  const det=$('#or-cot');det.addEventListener('toggle',()=>{UI.orCot=det.open});
  $('#or-tot').onchange=e=>{const v=parseFloat(String(e.target.value).replace(',','.'));if(!(v>0))return;const f=v/(+c.total||v);c.total=v;Object.values(c.man).forEach(m=>Object.keys(m).forEach(n=>{if(m[n]!=null&&m[n]!=='')m[n]=r2(+m[n]*f)}));oralValidar(t,re)};
  $$('[data-ortot]').forEach(b=>{if(b.tagName!=='BUTTON')return;b.onclick=()=>{const v=+b.dataset.ortot;const f=v/(+c.total||v);c.total=v;Object.values(c.man).forEach(m=>Object.keys(m).forEach(n=>{if(m[n]!=null&&m[n]!=='')m[n]=r2(+m[n]*f)}));oralValidar(t,re)}});
  $('#or-eq').onclick=()=>{ORAL_P.forEach(p=>c.pesos[p.k]=20);c.man={};save();re()};$('#or-rep').onclick=()=>{c.man={};save();toast('Pontuações proporcionais aos pesos','ok');re()};
  const aj=$('#or-aj');if(aj)aj.onclick=()=>{oralAjustar(c);save();re()};
  $$('[data-orw]').forEach(i=>i.onchange=()=>{const v=parseFloat(String(i.value).replace(',','.'));c.pesos[i.dataset.orw]=isNaN(v)?0:v;delete c.man[i.dataset.orw];oralValidar(t,re)});
  $$('[data-orc]').forEach(i=>i.onchange=()=>{const [k,n]=i.dataset.orc.split('|');const v=parseFloat(String(i.value).replace(',','.'));c.man[k]=c.man[k]||{};if(isNaN(v)||i.value.trim()===''){delete c.man[k][n]}else c.man[k][n]=v;if(!Object.keys(c.man[k]).length)delete c.man[k];oralValidar(t,re)});
  const dt=$('#or-data');if(dt)dt.onchange=()=>{o.data=dt.value;save()};
  $$('[data-org]').forEach(i=>i.onchange=()=>{const r=o.regs[i.dataset.org]=o.regs[i.dataset.org]||{n:{}};r.g=i.value.trim();save()});
  $$('[data-orn]').forEach(b=>b.onclick=()=>{const [aid,k,n]=b.dataset.orn.split('|');const r=o.regs[aid]=o.regs[aid]||{n:{}};r.n=r.n||{};r.n[k]=r.n[k]===n?'':n;save();
    const g=b.parentElement;g.querySelectorAll('button').forEach(x=>{const on=x.dataset.orn===b.dataset.orn&&r.n[k]===n;x.classList.toggle('on',on);x.setAttribute('aria-checked',on?'true':'false')});
    const tt=oralTotal(t,aid);const cell=$(`[data-ortc="${aid}"]`);if(cell)cell.innerHTML=`<b>${tt?fmtP(tt.pts):'—'}</b>${tt&&!tt.completo?'<div class="dh">incompleto</div>':''}`;anunciar(tt?'Total '+fmtP(tt.pts):'')});
}
function oralPdf(t){const o=oralM(t);const c=o.cfg;const al=alunosFiltro(t);const e=escolaDe(t);
  return pdfDocumento({titulo:'Ficha de Registo — Componente Oral',subtitulo:t.nome+' · '+t.disciplina+(o.data?' · '+fmtD(o.data):''),escola:e,turma:t,paisagem:true,
    blocos:[{p:'Pontuações por nível: '+ORAL_P.map(p=>p.n+' '+ORAL_N.map(([n])=>n+' '+fmtP(oralPts(c,p.k,n))).join('/')).join(' · ')+'. Cotação total: '+fmtP(c.total)+'.'},
      {tabela:{cab:['N.º','Nome','Guião',...ORAL_P.map(p=>p.n.split(/[ /,]/)[0]),'Total'],linhas:al.map(a=>{const r=o.regs[a.id]||{n:{}};const tt=oralTotal(t,a.id);return [a.num,a.nome,r.g||'',...ORAL_P.map(p=>r.n&&r.n[p.k]?r.n[p.k]+' · '+fmtP(oralPts(c,p.k,r.n[p.k])):''),tt?fmtP(tt.pts):'']}),larg:[.05,.29,.06,.11,.11,.11,.11,.11,.05]}}],
    assinaturas:[profAssin(profGenProfX()==='F'?'A Professora Classificadora':profGenProfX()==='M'?'O Professor Classificador':'O(A) Professor(a) Classificador(a)')]},'Oral '+t.nome)}
if(!ICONS.mic)ICONS.mic='<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>';
TITLES.oral='Produção oral';NEEDS_T.push('oral');
{const _go=go;go=function(v){const r=_go.apply(this,arguments);if(go._f&&!go._f.oral)go._f.oral=vOral;return r}}
{const h=$('#tnavHold');const ref=h&&h.querySelector('[data-v="instrumentos"]');if(ref&&!h.querySelector('[data-v="oral"]')){ref.insertAdjacentHTML('afterend',`<button class="nav tnav" data-v="oral" title="Produção oral"><span data-ico="mic"></span><span class="lbl">Produção Oral</span></button>`);const b=h.querySelector('[data-v="oral"] [data-ico]');if(b)b.innerHTML=ic('fala',18)}}
AJUDA.push({id:'oral',ic:'mic',t:'Produção Oral (Componente Oral de Inglês)',gif:null,txt:`<p>Turma › <b>Produção Oral</b> segue os critérios da Parte D (Componente Oral) de Inglês 358: cinco parâmetros — Âmbito, Correção/Controlo, Fluência, Desenvolvimento Temático/Coerência/Coesão e Interação — com os níveis N4 (12), N3 (8), N2 (6), N1 (2) e 0.</p><ul><li><b>Cotações e Pesos</b>: mude a cotação total (60, 100, 200 pontos ou 20 valores) e o peso de cada parâmetro; as pontuações de cada nível mudam em proporção.</li><li>Pode editar qualquer pontuação à mão; se deixar de bater certo com os pesos (ou os pesos não somarem 100 %), aparece um aviso com a opção <b>Ajustar aos Pesos</b>.</li><li><b>Ficha de Registo</b>: para cada aluno indique o guião e toque no nível de cada parâmetro (o descritor aparece na dica); o total é somado automaticamente. Exporta em PDF (como a ficha oficial) e CSV.</li></ul>`});

/* Avaliação Final › Vista para o Conselho de Turma: turmas juntas separadas lado a lado, com miniaturas e a nota do período */
function ctDados(t,p){const al=alunosAval(t);const grupos=t.origens&&t.origens.length?t.origens.map(o=>({nome:o,al:al.filter(a=>a.origem===o)})):[{nome:t.nome,al}];
  grupos.forEach(g=>{g.L=g.al.map(a=>{const nf=ponderada(t,pctsFinal(t,a.id,p));const atr=((t.atrib||{})[p]||{})[a.id];return {a,nf,niv:nivel(t,nf),atr:atr!==''&&atr!=null?atr:null}}).sort((x,y)=>(+(x.a.numOrig!=null&&x.a.numOrig!==''?x.a.numOrig:x.a.num)||0)-(+(y.a.numOrig!=null&&y.a.numOrig!==''?y.a.numOrig:y.a.num)||0));
    const ns=g.L.map(l=>l.nf).filter(x=>x!=null);g.media=ns.length?ns.reduce((s,x)=>s+x,0)/ns.length:null;g.neg=g.L.filter(l=>l.nf!=null&&negativa(t,l.nf)).length;g.av=ns.length});return grupos}
function vAvaliacaoCT(){const t=T();const P=periodos();if(!UI.per||!P.includes(UI.per))UI.per=perAtual(t);const p=UI.per;const G=ctDados(t,p);
  barBtns([{id:'b-ctv',t:ic('grid',15)+' Ver Pauta',f:()=>{UI.avCT=false;vAvaliacao()}},{id:'b-ctpdf',t:ic('file',15)+' Exportar PDF',f:()=>ctPdf(t,p)}]);
  $('#view').innerHTML=`<div class="card wide"><div class="row" style="flex-wrap:wrap;gap:10px"><h2 style="margin:0">${ic('users',18)} Conselho de Turma — ${esc(perNome(p))}</h2><div class="tabs" style="margin:0">${P.map(x=>`<button data-ctp="${x}" class="${x===p?'on':''}">${perNome(x)}</button>`).join('')}</div><span class="sp1"></span><span class="mut">${esc(t.disciplina)} · ${isSec(t)?'nota final (0–20) e nível proposto':'nível final'}${t.bloq&&t.bloq[p]?' · '+ic('shield',13)+' bloqueado':''}</span></div>
    <p class="hint">Uma coluna por turma${G.length>1?' (turmas juntas na disciplina, conselhos de turma separados)':''}, para confirmar as classificações em cada conselho. A vermelho as negativas; “atribuída” mostra o nível dado em conselho quando difere do proposto.</p>
    <div class="ctcols" style="--n:${G.length}">${G.map(g=>`<section class="ctcol" aria-labelledby="ct-${esc(g.nome).replace(/\W/g,'')}"><header class="cth"><h3 id="ct-${esc(g.nome).replace(/\W/g,'')}">${esc(g.nome)}</h3><span class="mut">${g.al.length} alunos · média ${g.media!=null?fmtNota(t,g.media):'—'} · ${g.neg} negativa${g.neg===1?'':'s'}</span></header>
      <ul class="ctl">${g.L.map(l=>`<li class="cti ${l.nf!=null&&negativa(t,l.nf)?'neg':''}"><span class="ctf">${avatar(l.a,40)}</span><span class="ctn"><b>${esc(numAl(l.a))}.</b> ${esc(l.a.nome)}</span><span class="ctv"><b class="ctnota">${l.nf!=null?(isSec(t)?fmtNota(t,l.nf):l.niv):'—'}</b>${isSec(t)&&l.nf!=null?`<span class="mut">nível ${esc(l.niv)}</span>`:''}${l.atr!=null&&String(l.atr)!==String(l.niv)?`<span class="tag bad">atribuída ${esc(l.atr)}</span>`:''}</span></li>`).join('')||'<li class="mut">Sem alunos.</li>'}</ul></section>`).join('')}</div></div>`;
  $$('[data-ctp]').forEach(b=>b.onclick=()=>{UI.per=+b.dataset.ctp;vAvaliacaoCT()})}
function ctPdf(t,p){const G=ctDados(t,p);const spec={titulo:'Classificações para o Conselho de Turma',subtitulo:t.disciplina+' · '+perNome(p)+' · '+profNome(S.cfg.professor),escola:escolaDe(t),turma:t,blocos:[],assinaturas:[profAssin()]};
  G.forEach((g,i)=>{if(i)spec.blocos.push({pb:true});spec.blocos.push({h:'Turma '+g.nome+' — média '+(g.media!=null?fmtNota(t,g.media):'—')+' · '+g.neg+' negativa(s)'},{fotos:g.L.map(l=>({src:fotoSrc(l.a),leg:l.a.num+'. '+l.a.nome.split(' ')[0]+' '+l.a.nome.split(' ').slice(-1)[0],sub:l.nf!=null?(isSec(t)?fmtNota(t,l.nf)+' · nível '+l.niv:'Nível '+l.niv)+(l.atr!=null&&String(l.atr)!==String(l.niv)?' (atrib. '+l.atr+')':''):'—',ini:l.a.nome.split(' ').map(w=>w[0]).slice(0,2).join('')}))})});
  return pdfDocumento(spec,'Conselho de Turma '+t.nome+' '+p+'.º')}
{const _va=vAvaliacao;vAvaliacao=function(){if(UI.avCT)return vAvaliacaoCT();const r=_va.apply(this,arguments);try{const bx=$('#barx');if(bx&&!$('#b-ctv')){const b=document.createElement('button');b.className='btn pri';b.id='b-ctv';b.innerHTML=ic('users',15)+' Vista Conselho de Turma';b.onclick=()=>{UI.avCT=true;vAvaliacao()};bx.prepend(b)}}catch(_){}return r}}
{const _ev=exportarVistaPdf;exportarVistaPdf=function(){if(VIEW==='avaliacao'&&UI.avCT&&T())return ctPdf(T(),UI.per||perAtual(T()));return _ev.apply(this,arguments)}}

