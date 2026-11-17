/* ---------- Página Escolas ---------- */
function vEscolas(){const L=todasEscolas();UI.escEd=escAtiva();const a=A();
  const cnt=e=>a?a.turmas.filter(t=>escolaDe(t)===e).length:0;
  return `<div class="card"><div class="row"><h2 style="margin:0">${ic('building',18)} As Minhas Escolas ${a?'<span class="mut" style="font-weight:500">· '+esc(a.nome)+'</span>':''}</h2><span class="sp1"></span><button class="btn" id="es-nova">${ic('plus',15)} Adicionar Escola</button></div>
    <p class="hint" style="margin:10px 0 0">Pode lecionar em mais do que uma escola no mesmo ano letivo. A <b>tipologia</b> de cada escola define as ofertas das suas turmas e a forma de avaliar (disciplinas e períodos, PROFIJ por UFCD, ou cursos profissionais por módulos).</p>
    <div class="escl">${L.map(e=>`<button class="escc ${escId(e)===UI.escEd?'on':''}" data-esed="${escId(e)}">${e.logo?`<img src="${e.logo}" alt="">`:`<span class="besi">${ic(TIPOS_ESCOLA[tipoEscola(e)].ic,18)}</span>`}<span><b>${esc(nomeEscola(e))}</b><span class="mut">${TIPOS_ESCOLA[tipoEscola(e)].n} · ${cnt(e)} turma${cnt(e)===1?'':'s'}${e===S.cfg?' · principal':''}</span></span></button>`).join('')}</div></div>`}
function cartaoTipologia(e){const tp=tipoEscola(e);return `<div class="card ed"><div class="row"><h2 style="margin:0">${ic('layers',18)} Tipologia da Escola</h2><span class="sp1"></span>${e!==S.cfg?`<button class="btn dng" id="es-del">${ic('trash',15)} Remover Escola</button>`:''}</div>
  <div class="tipos">${Object.entries(TIPOS_ESCOLA).map(([k,v])=>`<button type="button" class="tipoc ${tp===k?'on':''}" data-tpe="${k}">${ic(v.ic,22)}<b>${v.n}</b><span>${v.d}</span></button>`).join('')}</div></div>`}

/* =====================================================================
   v0.29 — datas (escrita), aniversários, envio de matrizes, modelos de critérios
   ===================================================================== */
/* ---------- 1. Campos de data: só aplicam a alteração quando se termina de escrever ---------- */
(()=>{const valida=v=>!v||/^(19|20)\d\d-\d\d-\d\d$/.test(v);
  document.addEventListener('focusin',e=>{const el=e.target;if(el&&el.type==='date'){el.dataset.egPrev=el.value;el._egDirty=false}},true);
  const segurar=e=>{const el=e.target;if(!el||el.type!=='date'||el._egPass)return;if(document.activeElement===el){e.stopImmediatePropagation();el._egDirty=true;clearTimeout(el._egT);if(valida(el.value)&&el.value)el._egT=setTimeout(()=>soltar(el),1500)}else if(!valida(el.value)){e.stopImmediatePropagation();el.value=el.dataset.egPrev||''}};
  document.addEventListener('change',segurar,true);document.addEventListener('input',segurar,true);
  const soltar=el=>{clearTimeout(el._egT);if(!el._egDirty)return;el._egDirty=false;if(!valida(el.value)){el.value=el.dataset.egPrev||'';toast('Data incompleta ou inválida — foi reposta a anterior','erro');return}
    if(el.value===el.dataset.egPrev)return;el._egPass=true;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el._egPass=false;el.dataset.egPrev=el.value};
  document.addEventListener('focusout',e=>{const el=e.target;if(el&&el.type==='date'&&el._egDirty)setTimeout(()=>soltar(el),0)},true);
  document.addEventListener('keydown',e=>{const el=e.target;if(el&&el.type==='date'&&e.key==='Enter'){e.preventDefault();soltar(el)}},true)})();

/* ---------- 2. Aniversários dos alunos ---------- */
function aniversarios(a,dias){if(!a)return [];const hj=new Date();hj.setHours(0,0,0,0);const vis=new Map();
  turmasFiltradas(a).forEach(t=>t.alunos.forEach(x=>{if(!x.nasc||!/^(19|20)\d\d-\d\d-\d\d$/.test(x.nasc)||+x.nasc.slice(0,4)>new Date().getFullYear())return;const k=normT(x.nome)+'|'+x.nasc;const o=vis.get(k);if(o){if(!o.turmas.includes(t.nome))o.turmas.push(x.origem||t.nome);return}
    const [y,m,d]=x.nasc.split('-').map(Number);let prox=new Date(hj.getFullYear(),m-1,d);if(m===2&&d===29&&prox.getMonth()!==1)prox=new Date(hj.getFullYear(),1,28);
    let dif=Math.round((prox-hj)/864e5);if(dif<-1){prox=new Date(hj.getFullYear()+1,m-1,d);dif=Math.round((prox-hj)/864e5)}
    vis.set(k,{x,turmas:[x.origem||t.nome],dif,data:prox,idade:prox.getFullYear()-y})}));
  return [...vis.values()].filter(v=>v.dif>=-1&&v.dif<=dias).sort((p,q)=>p.dif-q.dif||p.x.nome.localeCompare(q.x.nome,'pt'))}
function cartaoAniversarios(a){if(!a||S.cfg.anivOculto)return '';const L=aniversarios(a,S.cfg.anivDias||14);const temNasc=a.turmas.some(t=>t.alunos.some(x=>x.nasc));if(!temNasc)return '';
  const quando=v=>v.dif===0?'Hoje':v.dif===1?'Amanhã':v.dif===-1?'Ontem':DIAS_C[v.data.getDay()]+', '+v.data.getDate()+' '+MESES[v.data.getMonth()+1].slice(0,3).toLowerCase();
  return `<div class="card anivc"><div class="row"><h2 style="margin:0">${ic('star',18)} Aniversários</h2><span class="sp1"></span><span class="mut" style="font-size:12.5px">próximos ${S.cfg.anivDias||14} dias</span></div>
    ${L.length?L.slice(0,8).map(v=>`<div class="aniv ${v.dif===0?'hoje':''}"><span class="anf">${avatar(v.x,32)}</span><span class="ann"><b>${esc(v.x.nome)}</b><span class="mut">${esc(v.turmas.join(', '))} · <span class="sens">faz ${v.idade} anos</span></span></span><span class="anq">${v.dif===0?'🎂 ':''}${quando(v)}</span></div>`).join('')+(L.length>8?`<p class="mut" style="margin:8px 0 0;font-size:12.5px">… e mais ${L.length-8}</p>`:'')
      :`<p class="mut" style="margin:8px 0 0">Sem aniversários nos próximos ${S.cfg.anivDias||14} dias.</p>`}</div>`}

/* ---------- 3. Envio da matriz antes de cada teste ---------- */
const cfgMatriz=()=>Object.assign({ativo:true,dias:10},S.cfg.matriz||{});
function dataMatriz(iso){const m=cfgMatriz();const d=dataDeIso(iso);d.setDate(d.getDate()-(+m.dias||0));while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()-1);return isoData(d)}
function matrizes(a,lista){const m=cfgMatriz();if(!a||!m.ativo)return [];const L=[];(lista||turmasFiltradas(a)).forEach(t=>t.instrumentos.forEach(i=>{if(!i.data||!ehTeste(i)||i.semMatriz||i.oral||/oral/i.test(i.tipo||'')||/oral/i.test(i.nome||''))return;L.push({t,i,data:dataMatriz(i.data),enviada:!!i.matrizEnviada})}));return L.sort((x,y)=>x.data.localeCompare(y.data))}
function cartaoMatrizes(a){const hj=isoData(new Date());const lim=isoData(new Date(Date.now()+7*864e5));const L=matrizes(a).filter(x=>!x.enviada&&x.i.data>=hj&&x.data<=lim);if(!L.length)return '';
  return `<div class="card mzc"><div class="row"><h2 style="margin:0">${ic('file',18)} Matrizes a Enviar</h2><span class="sp1"></span><span class="mut" style="font-size:12.5px">${cfgMatriz().dias} dias antes de cada teste</span></div>
    ${L.map(x=>{const atr=x.data<hj;return `<div class="mzi ${atr?'atr':x.data===hj?'hoje':''}"><span class="mzd"><b>${dataDeIso(x.data).getDate()}</b><span>${MESES[dataDeIso(x.data).getMonth()+1].slice(0,3)}</span></span><span class="mzt"><b>${esc(x.i.nome)} · ${esc(x.t.nome)}</b><span class="mut">${esc(x.t.disciplina)} · teste ${esc(fmtIsoL(x.i.data))} · ${atr?'<b style="color:#c5221f">envio em atraso ('+esc(contagem(x.data))+')</b>':'enviar '+esc(contagem(x.data))}</span></span><button class="btn sm" data-mzok="${x.t.id}|${x.i.id}">${ic('check',14)} Enviada</button></div>`}).join('')}</div>`}
function bindMatrizes(){$$('[data-mzok]').forEach(b=>b.onclick=()=>{const [tid,iid]=b.dataset.mzok.split('|');const t=A().turmas.find(x=>x.id===tid);const i=t&&t.instrumentos.find(x=>x.id===iid);if(!i)return;i.matrizEnviada=Date.now();saveNow();toast('Matriz de '+i.nome+' marcada como enviada','ok');go(VIEW)})}

/* ---------- 4. Modelos de domínios e ponderações ---------- */
const MOD_BASE=[
 {id:'le',nome:'Línguas Estrangeiras',disc:['Inglês','Francês','Espanhol','Alemão','Comunicar em Inglês'],d:[['PO','Produção Oral',25],['CO','Compreensão Oral',25],['CE','Compreensão Escrita',25],['PE','Produção Escrita',25]]},
 {id:'port-b',nome:'Português (Ensino Básico)',disc:['Português'],cic:['1c','2c','3c'],d:[['OR','Oralidade',20],['LEI','Leitura',20],['EL','Educação Literária',15],['ESC','Escrita',25],['GRA','Gramática',20]]},
 {id:'port-s',nome:'Português (Ensino Secundário)',disc:['Português','Literatura Portuguesa'],cic:['sec','profij'],d:[['OR','Oralidade',15],['LEI','Leitura',20],['EL','Educação Literária',25],['ESC','Escrita',25],['GRA','Gramática',15]]},
 {id:'plnm',nome:'Português Língua Não Materna',disc:['Português Língua Não Materna (PLNM)'],d:[['CO','Compreensão Oral',20],['PIO','Produção e Interação Oral',20],['LEI','Leitura',20],['ESC','Escrita',25],['GRA','Gramática',15]]},
 {id:'mat-b',nome:'Matemática (Ensino Básico)',disc:['Matemática'],d:[['NO','Números e Operações',20],['ALG','Álgebra',20],['GM','Geometria e Medida',20],['DP','Dados e Probabilidades',15],['CM','Capacidades Matemáticas',25]]},
 {id:'mat-s',nome:'Matemática (Ensino Secundário)',disc:['Matemática A','Matemática B','Matemática Aplicada às Ciências Sociais (MACS)'],d:[['CC','Conhecimento e Compreensão',50],['RP','Resolução de Problemas',30],['RC','Raciocínio e Comunicação',20]]},
 {id:'ef',nome:'Educação Física',disc:['Educação Física'],d:[['AF','Atividades Físicas',60],['APF','Aptidão Física',20],['CON','Conhecimentos',20]]},
 {id:'cien',nome:'Ciências Experimentais',disc:['Ciências Naturais','Físico-Química','Física e Química A','Biologia e Geologia','Biologia','Física','Química','Geologia'],d:[['CON','Conhecimentos e Conceitos',50],['PL','Prática Laboratorial e Experimental',25],['CPC','Comunicação e Pensamento Crítico',25]]},
 {id:'hum',nome:'História e Geografia',disc:['História e Geografia de Portugal','História','Geografia','História A','História B','Geografia A','História da Cultura e das Artes','Antropologia'],d:[['CC','Conhecimento e Compreensão',50],['TI','Tratamento de Informação e Fontes',30],['COM','Comunicação',20]]},
 {id:'fil',nome:'Filosofia',disc:['Filosofia'],d:[['PRB','Problematização',35],['CONC','Conceptualização',30],['ARG','Argumentação',35]]},
 {id:'eco',nome:'Economia',disc:['Economia A'],d:[['CC','Conhecimento e Compreensão',60],['AI','Análise e Interpretação de Dados',25],['COM','Comunicação',15]]},
 {id:'art',nome:'Artes Visuais',disc:['Educação Visual','Desenho A','Geometria Descritiva A','Educação Artística — Artes Visuais','Complemento à Educação Artística'],d:[['AR','Apropriação e Reflexão',30],['IC','Interpretação e Comunicação',30],['EC','Experimentação e Criação',40]]},
 {id:'mus',nome:'Música, Dança e Teatro',disc:['Educação Musical','Educação Artística — Música','Educação Artística — Dança','Educação Artística — Expressão Dramática/Teatro'],d:[['EC','Experimentação e Criação',40],['IC','Interpretação e Comunicação',35],['AR','Apropriação e Reflexão',25]]},
 {id:'et',nome:'Educação Tecnológica',disc:['Educação Tecnológica'],d:[['TS','Tecnologia e Sociedade',30],['PT','Processos Tecnológicos',40],['RU','Recursos e Utilizações Tecnológicas',30]]},
 {id:'tic',nome:'TIC e Aplicações Informáticas',disc:['Tecnologias da Informação e Comunicação (TIC)','Aplicações Informáticas B'],d:[['SRR','Segurança, Responsabilidade e Respeito',20],['IP','Investigar e Pesquisar',20],['CC','Comunicar e Colaborar',30],['CI','Criar e Inovar',30]]},
 {id:'cd',nome:'Cidadania e Desenvolvimento',disc:['Cidadania e Desenvolvimento'],d:[['PAR','Participação e Envolvimento',40],['CON','Conhecimentos',30],['AV','Atitudes e Valores',30]]},
 {id:'emrc',nome:'EMRC',disc:['Educação Moral e Religiosa Católica (EMRC)'],d:[['RER','Religião e Experiência Religiosa',35],['CC','Cultura Cristã e Visão Cristã da Vida',35],['EM','Ética e Moral',30]]},
 {id:'em',nome:'Estudo do Meio',disc:['Estudo do Meio'],d:[['SOC','Sociedade',30],['NAT','Natureza',30],['TEC','Tecnologia',20],['SNT','Sociedade / Natureza / Tecnologia',20]]},
 {id:'cla',nome:'Línguas Clássicas',disc:['Latim A','Grego'],d:[['LIN','Língua',40],['TL','Tradução e Leitura',40],['CUL','Cultura',20]]},
 {id:'ae',nome:'Apoio ao Estudo / Oferta Complementar',disc:['Apoio ao Estudo','Oferta Complementar','Oferta de Escola'],d:[['MT','Métodos de Trabalho',40],['AUT','Autonomia',30],['PAR','Participação',30]]},
 {id:'mod',nome:'Módulo / UFCD (cursos profissionais e PROFIJ)',disc:[],of:['profissional','profij'],d:[['CON','Conhecimentos',50],['PRA','Prática e Aplicação',30],['AT','Atitudes e Comportamentos',20]]},
 {id:'gen',nome:'Genérico',disc:[],d:[['CC','Conhecimentos e Capacidades',80],['AT','Atitudes e Valores',20]]}];
function modelosTodos(){const U=S.cfg.modelos||[];const base=MOD_BASE.map(b=>{const o=U.find(u=>u.id===b.id);return o?{...b,...o,base:true,alterado:true}:{...b,base:true}});return base.concat(U.filter(u=>!MOD_BASE.some(b=>b.id===u.id)))}
function modeloPara(disc,ciclo,oferta){const M=modelosTodos();const nd=normT(disc);
  return M.filter(m=>!m.base||true).find(m=>!m.base&&(m.disc||[]).some(x=>normT(x)===nd)&&(!m.cic||!m.cic.length||m.cic.includes(ciclo)))
    ||M.find(m=>m.base&&(m.disc||[]).some(x=>normT(x)===nd)&&(!m.cic||!m.cic.length||m.cic.includes(ciclo)))
    ||(oferta&&oferta!=='regular'&&M.find(m=>(m.of||[]).includes(oferta)))
    ||(()=>{const i=discInfo(disc);const k=i&&i.t;return M.find(m=>m.id===({le:'le',port:ciclo==='sec'?'port-s':'port-b',ef:'ef'}[k]||'gen'))})()}
const dominiosDoModelo=m=>(m?m.d:MODELOS.gen).map(([ab,nome,peso],k)=>({id:uid()+k,ab,nome,peso:+peso}));
const mkDominiosDisc=(disc,ciclo,oferta)=>dominiosDoModelo(modeloPara(disc,ciclo,oferta));
function guardarModelo(m){S.cfg.modelos=S.cfg.modelos||[];const i=S.cfg.modelos.findIndex(x=>x.id===m.id);const o={id:m.id,nome:m.nome,disc:m.disc||[],cic:m.cic||[],of:m.of||[],d:m.d};if(i>=0)S.cfg.modelos[i]=o;else S.cfg.modelos.push(o);saveNow()}
function defModelos(){const M=modelosTodos();const q=normT(UI.modQ||'');const L=M.filter(m=>!q||normT(m.nome+' '+(m.disc||[]).join(' ')).includes(q));const minhas=new Set(minhasDisc());
  const _pl=(()=>{try{const p=domPal();if(Array.isArray(p)&&p.length)return p}catch(_){}return ['#2f7fd0','#d98b00','#7a4fd0','#1a7f37','#c0392b','#0f8b8d','#b8860b','#5b6b7f']})();const cor=k=>_pl[k%_pl.length];
  return `<div class="card"><div class="row"><h2 style="margin:0">${ic('sliders',18)} Modelos de Domínios e Ponderações</h2><span class="sp1"></span><input type="search" id="md-q" placeholder="Procurar disciplina…" value="${esc(UI.modQ||'')}" style="width:220px"><button class="btn pri" id="md-novo">${ic('plus',15)} Novo Modelo</button></div>
    <p class="hint" style="margin:10px 0 0">Ao criar uma turma, os domínios são copiados do modelo da disciplina (e do ciclo). Pode alterar os modelos, criar novos e aplicá-los a turmas existentes em Critérios. Os modelos de base podem ser repostos a qualquer momento.</p></div>
  <div class="mdgrid">${L.map(m=>{const tot=m.d.reduce((s,x)=>s+(+x[2]||0),0);const meu=(m.disc||[]).some(d=>minhas.has(d));return `<div class="card mdmc ${meu?'meu':''}"><div class="row" style="align-items:flex-start"><div style="flex:1;min-width:0"><b class="mdn">${esc(m.nome)}</b><div class="mut mdmd">${(m.disc||[]).length?esc(m.disc.join(' · ')):m.of&&m.of.length?'Turmas '+m.of.map(o=>OFERTAS[o]?OFERTAS[o].nome:o).join(' e '):'Outras disciplinas'}${m.cic&&m.cic.length?' · '+m.cic.map(c=>CICLOS[c]).join(', '):''}</div></div>
      <span class="tag ${m.base?(m.alterado?'dt':''):'ok'}">${m.base?(m.alterado?'Base alterado':'Base'):'Próprio'}</span></div>
    <div class="mdmbar" role="img" aria-label="Ponderações">${m.d.map((x,k)=>`<span style="flex:${+x[2]||0};background:${cor(k)}" title="${esc(x[1])} ${x[2]}%">${(+x[2]||0)>=12?x[2]+'%':''}</span>`).join('')}</div>
    <div class="mdml">${m.d.map((x,k)=>`<span class="mdmi" style="--dc:${cor(k)}"><b>${esc(x[0])}</b><span>${esc(x[1])}</span><em>${x[2]}%</em></span>`).join('')}</div>
    ${tot!==100?`<div class="alert w" style="margin:8px 0 0">${ic('alert',14)} Soma ${tot}%</div>`:''}
    <div class="row" style="gap:6px;margin-top:12px"><button class="btn sm" data-mded="${m.id}">${ic('pencil',14)} Editar</button><button class="btn sm" data-mddup="${m.id}">${ic('copy',14)} Duplicar</button>${m.base&&m.alterado?`<button class="btn sm" data-mdrep="${m.id}">${ic('refresh',14)} Repor</button>`:''}${!m.base?`<button class="btn sm ico dng" data-mddel="${m.id}" aria-label="Apagar">${ic('trash',14)}</button>`:''}</div></div>`}).join('')}</div>`}
function bindModelos(){const q=$('#md-q');if(q)q.oninput=()=>{UI.modQ=q.value;const p=q.selectionStart;vDefinicoes();const n=$('#md-q');n.focus();n.setSelectionRange(p,p)};
  $('#md-novo').onclick=()=>modeloDlg({id:'m'+uid(),nome:'',disc:[],cic:[],d:[['CC','Conhecimentos e Capacidades',80],['AT','Atitudes e Valores',20]]},true);
  $$('[data-mded]').forEach(b=>b.onclick=()=>modeloDlg(JSON.parse(JSON.stringify(modelosTodos().find(m=>m.id===b.dataset.mded))),false));
  $$('[data-mddup]').forEach(b=>b.onclick=()=>{const m=JSON.parse(JSON.stringify(modelosTodos().find(m=>m.id===b.dataset.mddup)));m.id='m'+uid();m.nome=m.nome+' (cópia)';delete m.base;delete m.alterado;modeloDlg(m,true)});
  $$('[data-mdrep]').forEach(b=>b.onclick=()=>{if(!confirm('Repor o modelo de base?'))return;S.cfg.modelos=(S.cfg.modelos||[]).filter(m=>m.id!==b.dataset.mdrep);saveNow();vDefinicoes();toast('Modelo reposto','ok')});
  $$('[data-mddel]').forEach(b=>b.onclick=()=>{if(!confirm('Apagar este modelo?'))return;S.cfg.modelos=(S.cfg.modelos||[]).filter(m=>m.id!==b.dataset.mddel);saveNow();vDefinicoes()})}
function modeloDlg(m,novo){const todas=[...new Set([...DISCIPLINAS.map(d=>d.n),...(S.cfg.extra||[]),...m.disc||[]])].sort((x,y)=>x.localeCompare(y,'pt'));
  const linhas=()=>m.d.map((x,k)=>`<tr><td><input data-mdk="${k}|0" value="${esc(x[0])}" style="width:80px"></td><td><input data-mdk="${k}|1" value="${esc(x[1])}"></td><td><input data-mdk="${k}|2" value="${esc(x[2])}" inputmode="numeric" style="width:70px;text-align:center"></td><td><button class="btn sm ico dng" data-mdx="${k}" aria-label="Remover domínio">${ic('x',13)}</button></td></tr>`).join('');
  openDrawer(novo?'Novo Modelo':'Editar Modelo',`<div class="ed"><label>Nome do modelo</label><input id="mo-nome" value="${esc(m.nome)}" placeholder="ex.: Inglês 3.º ciclo — departamento">
    <label style="margin-top:12px">Disciplinas a que se aplica</label><div class="mddisc">${todas.map(d=>`<label class="chk"><input type="checkbox" data-mdd="${esc(d)}" ${(m.disc||[]).includes(d)?'checked':''}> ${esc(d)}</label>`).join('')}</div>
    <label style="margin-top:12px">Ciclos <span class="mut">(nenhum = todos)</span></label><div class="row" style="gap:6px;flex-wrap:wrap">${Object.entries(CICLOS).map(([k,l])=>`<button type="button" class="chip ${(m.cic||[]).includes(k)?'on':''}" data-mdc="${k}">${l}</button>`).join('')}</div>
    <h3>Domínios</h3><table class="lst"><thead><tr><th>Abrev.</th><th>Designação</th><th>Peso %</th><th></th></tr></thead><tbody id="mo-dom">${linhas()}</tbody></table>
    <div class="row" style="margin-top:8px;gap:8px"><button class="btn sm" id="mo-add">${ic('plus',14)} Domínio</button><button class="btn sm" id="mo-eq">Pesos iguais</button><span class="sp1"></span><b id="mo-tot"></b></div>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="mo-ok">${ic('check',15)} Guardar Modelo</button></div></div>`);
  const tot=()=>{const s=m.d.reduce((a,x)=>a+(+x[2]||0),0);const e=$('#mo-tot');e.textContent='Total: '+s+'%';e.style.color=s===100?'#1a7f37':'#c5221f'};
  const bindL=()=>{$$('[data-mdk]').forEach(i=>i.oninput=()=>{const [k,c]=i.dataset.mdk.split('|').map(Number);m.d[k][c]=c===2?(+i.value.replace(',','.')||0):i.value;tot()});$$('[data-mdx]').forEach(b=>b.onclick=()=>{m.d.splice(+b.dataset.mdx,1);$('#mo-dom').innerHTML=linhas();bindL();tot()})};bindL();tot();
  $('#mo-add').onclick=()=>{m.d.push(['','',0]);$('#mo-dom').innerHTML=linhas();bindL();tot()};
  $('#mo-eq').onclick=()=>{const n=m.d.length;if(!n)return;const b=Math.floor(100/n);m.d.forEach((x,k)=>x[2]=b+(k<100-b*n?1:0));$('#mo-dom').innerHTML=linhas();bindL();tot()};
  $$('[data-mdc]').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
  $('#mo-ok').onclick=()=>{m.nome=$('#mo-nome').value.trim();if(!m.nome)return alert('Indique o nome do modelo.');m.d=m.d.filter(x=>String(x[1]).trim());if(!m.d.length)return alert('Indique pelo menos um domínio.');
    const s=m.d.reduce((a,x)=>a+(+x[2]||0),0);if(s!==100&&!confirm('Os pesos somam '+s+'% (deviam somar 100%). Guardar assim?'))return;
    m.disc=$$('[data-mdd]').filter(x=>x.checked).map(x=>x.dataset.mdd);m.cic=$$('[data-mdc].on').map(b=>b.dataset.mdc);guardarModelo(m);closeDrawer();vDefinicoes();toast('Modelo guardado','ok')}}
function aplicarModeloTurma(t,id){const m=modelosTodos().find(x=>x.id===id);if(!m)return;const us=t.instrumentos.some(i=>i.itens.length);
  if(us&&!confirm('Aplicar o modelo “'+m.nome+'”? Os itens dos instrumentos são religados pelos domínios com a mesma abreviatura; os restantes ficam sem domínio.'))return;
  const ant=Object.fromEntries(t.dominios.map(d=>[d.id,normT(d.ab)]));const novo=dominiosDoModelo(m);const porAb=Object.fromEntries(novo.map(d=>[normT(d.ab),d.id]));
  t.instrumentos.forEach(i=>i.itens.forEach(it=>{it.dom=porAb[ant[it.dom]]||''}));t.dominios=novo;saveNow();toast('Modelo “'+m.nome+'” aplicado','ok')}

function cartaoAvisosDef(){const m=cfgMatriz();return `<div class="card ed" id="def-avisos"><h2>${ic('bell',18)} Avisos Automáticos</h2>
  <div class="prefs"><div class="pref"><b>Envio da matriz antes de cada teste</b><div class="row" style="gap:10px;flex-wrap:wrap"><label class="chk"><input type="checkbox" id="mz-on" ${m.ativo?'checked':''}> Marcar automaticamente</label>
    <span class="row" style="gap:6px"><input id="mz-d" type="number" min="1" max="60" value="${m.dias}" inputmode="numeric" style="width:76px;text-align:center"> <span>dias antes</span></span>
    <div class="seg mini">${[5,7,10,14].map(n=>`<button type="button" data-mzd="${n}" class="${+m.dias===n?'on':''}">${n}</button>`).join('')}</div></div>
    <span class="hint">Aparece no Início (“Matrizes a Enviar”), nas Datas Importantes e no calendário da Marcação de Testes. Se calhar ao fim de semana, passa para a sexta-feira anterior.</span></div>
  <div class="pref"><b>Aniversários dos alunos no Início</b><div class="row" style="gap:10px;flex-wrap:wrap"><label class="chk"><input type="checkbox" id="an-on" ${S.cfg.anivOculto?'':'checked'}> Mostrar</label><span class="row" style="gap:6px">próximos <input id="an-d" type="number" min="1" max="60" value="${S.cfg.anivDias||14}" inputmode="numeric" style="width:70px;text-align:center"> dias</span></div></div></div></div>`}
function bindAvisosDef(){const up=()=>{S.cfg.matriz={ativo:$('#mz-on').checked,dias:Math.max(1,Math.min(60,+$('#mz-d').value||10))};save();$$('[data-mzd]').forEach(b=>b.classList.toggle('on',+b.dataset.mzd===S.cfg.matriz.dias))};
  $('#mz-on').onchange=up;$('#mz-d').onchange=up;$$('[data-mzd]').forEach(b=>b.onclick=()=>{$('#mz-d').value=b.dataset.mzd;up();toast('Matriz: '+b.dataset.mzd+' dias antes do teste','ok')});
  $('#an-on').onchange=e=>{S.cfg.anivOculto=!e.target.checked;save()};$('#an-d').onchange=e=>{S.cfg.anivDias=Math.max(1,Math.min(60,+e.target.value||14));save()}}

