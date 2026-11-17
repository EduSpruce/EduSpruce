/* =====================================================================
   v0.34 (A) — EduSpruce: nome do professor, escolas e feriados dos Açores,
               auditoria, widgets/favoritos/tarefas no Início
   ===================================================================== */
/* ---------- nome do professor: "Prof. Primeiro Último" ---------- */
function profNome(n){n=String(n||'').trim().replace(/\s+/g,' ');if(!n)return '';if(/^prof(\.|essor|essora)?\s/i.test(n))n=n.replace(/^prof(\.|essor|essora)?\s+/i,'');const p=n.split(' ');return 'Prof. '+(p.length>1?p[0]+' '+p[p.length-1]:p[0])}

/* ---------- concelhos dos Açores e feriados ---------- */
const CONCELHOS_ACORES=[
 ['Vila do Porto','Santa Maria',{f:'06-24'}],['Ponta Delgada','São Miguel',{p:36,n:'Senhor Santo Cristo dos Milagres'}],['Lagoa','São Miguel',{f:'04-11'}],['Ribeira Grande','São Miguel',{f:'06-29'}],
 ['Vila Franca do Campo','São Miguel',{f:'06-24'}],['Povoação','São Miguel',{x:1}],['Nordeste','São Miguel',{nseg:[7,2],n:'Festas do Nordeste'}],
 ['Angra do Heroísmo','Terceira',{f:'06-24'}],['Praia da Vitória','Terceira',{f:'08-11'}],['Calheta','São Jorge',{f:'11-25'}],['Velas','São Jorge',{f:'04-23'}],
 ['Santa Cruz da Graciosa','Graciosa',{segApsDom:[8,2]}],['Horta','Faial',{f:'06-24'}],['Madalena','Pico',{f:'07-22'}],['Lajes do Pico','Pico',{f:'06-29'}],['São Roque do Pico','Pico',{f:'08-16'}],
 ['Santa Cruz das Flores','Flores',{nseg:[8,1],n:'Festa do Cais das Poças'}],['Lajes das Flores','Flores',{segApsDom:[7,3]}],['Corvo','Corvo',{f:'06-20'}]];
const nesimoDia=(y,m,dow,n)=>{const d=new Date(y,m-1,1);while(d.getDay()!==dow)d.setDate(d.getDate()+1);d.setDate(d.getDate()+7*(n-1));return d};
function feriadoMunicipal(conc,y){const c=CONCELHOS_ACORES.find(x=>x[0]===conc);if(!c)return null;const r=c[2];const outro=(S.cfg.feriadosExtra||{})[conc+'|'+y];if(outro)return outro;
  if(r.f)return y+'-'+r.f;if(r.p!=null){const d=pascoa(y);d.setDate(d.getDate()+r.p);return isoData(d)}if(r.nseg)return isoData(nesimoDia(y,r.nseg[0],1,r.nseg[1]));
  if(r.segApsDom){const d=nesimoDia(y,r.segApsDom[0],0,r.segApsDom[1]);d.setDate(d.getDate()+1);return isoData(d)}return null}
function feriadosLocais(conc,ini,fim){const L=[];const y1=+ini.slice(0,4),y2=+fim.slice(0,4);const acores=CONCELHOS_ACORES.some(x=>x[0]===conc);
  for(let y=y1;y<=y2;y++){if(acores){const es=pascoa(y);es.setDate(es.getDate()+50);L.push({data:isoData(es),tipo:'feriadoR',nota:'Dia dos Açores (Segunda-feira do Espírito Santo)'})}
    const m=feriadoMunicipal(conc,y);const rr=((CONCELHOS_ACORES.find(x=>x[0]===conc)||[])[2])||{};if(m)L.push({data:m,tipo:'feriadoM',nota:'Feriado Municipal — '+conc+(rr.n?' ('+rr.n+')':'')})}
  return L.filter(x=>x.data>=ini&&x.data<=fim)}
function recontarPeriodos(c){const conta=p=>({...p,dias:diasLetivosCal(c,p.ini,p.fim)});c.periodos=c.periodos.map(conta);if(c.periodos3)c.periodos3=c.periodos3.map(conta)}
function aplicarFeriadosLocais(a,silencioso){const e=EC();const conc=e.concelho;const c=a&&a.calendario;if(!c||!c.periodos||!c.periodos.length)return 0;
  if(!proprioEsc(a,'calendario')&&escAtiva()!=='principal'){a.calendario=JSON.parse(JSON.stringify(c))}const cal=a.calendario;
  (cal.feriadosLoc||[]).forEach(x=>{if(cal.dias[x.data]===x.tipo){cal.dias[x.data]=x.antes||'letivo';if(cal.notas&&cal.notas[x.data]===x.nota)delete cal.notas[x.data]}});cal.feriadosLoc=[];
  if(!conc){recontarPeriodos(cal);return 0}
  const ini=(cal.periodos3||cal.periodos)[0].ini,fim=(cal.periodos3||cal.periodos).slice(-1)[0].fim;let n=0;
  feriadosLocais(conc,ini.slice(0,4)+'-09-01',fim.slice(0,4)+'-08-31').forEach(x=>{const d=dataDeIso(x.data).getDay();const atual=cal.dias[x.data];if(d===0||d===6)return;if(atual&&!LETIVOS.includes(atual)&&atual!=='nao')return;
    cal.feriadosLoc.push({...x,antes:atual||'nao'});cal.dias[x.data]=x.tipo;cal.notas=cal.notas||{};cal.notas[x.data]=x.nota;n++});
  recontarPeriodos(cal);if(a.org==='semestre'&&cal.periodos3)cal.periodos=semestresDe(cal);saveNow();if(!silencioso)toast(n+' feriado(s) de '+conc+' aplicados ao calendário','ok');audit('Calendário','Feriados locais aplicados',conc+' · '+n);return n}

/* ---------- escolas dos Açores (listas editáveis) ---------- */
const ESCOLAS_ACORES_BASE={
 regular:[['Escola Básica e Secundária de Santa Maria','Vila do Porto'],['Escola Básica Integrada de Água de Pau','Lagoa'],['Escola Básica Integrada da Lagoa','Lagoa'],['Escola Secundária da Lagoa','Lagoa'],
  ['Escola Básica e Secundária do Nordeste','Nordeste'],['Escola Secundária Antero de Quental','Ponta Delgada'],['Escola Secundária Domingos Rebelo','Ponta Delgada'],['Escola Secundária das Laranjeiras','Ponta Delgada'],
  ['Escola Básica Integrada Canto da Maia','Ponta Delgada'],['Escola Básica Integrada Roberto Ivens','Ponta Delgada'],['Escola Básica Integrada de Arrifes','Ponta Delgada'],['Escola Básica Integrada de Vila de Capelas','Ponta Delgada'],
  ['Escola Básica Integrada de Ginetes','Ponta Delgada'],['Conservatório Regional de Ponta Delgada','Ponta Delgada'],['Escola Básica e Secundária da Povoação','Povoação'],['Escola Secundária da Ribeira Grande','Ribeira Grande'],
  ['Escola Básica Integrada da Maia','Ribeira Grande'],['Escola Básica Integrada de Rabo de Peixe','Ribeira Grande'],['Escola Básica Integrada da Ribeira Grande','Ribeira Grande'],['Escola Básica e Secundária Armando Côrtes-Rodrigues','Vila Franca do Campo'],
  ['Escola Básica Integrada da Ponta Garça','Vila Franca do Campo'],['Escola Básica Integrada de Angra do Heroísmo','Angra do Heroísmo'],['Escola Básica Integrada Francisco Ferreira Drummond','Angra do Heroísmo'],
  ['Escola Básica e Secundária Tomás de Borba','Angra do Heroísmo'],['Escola Secundária Jerónimo Emiliano de Andrade','Angra do Heroísmo'],['Escola Secundária Vitorino Nemésio','Praia da Vitória'],['Escola Básica Integrada da Praia da Vitória','Praia da Vitória'],
  ['Escola Básica Integrada dos Biscoitos','Praia da Vitória'],['Escola Básica e Secundária da Graciosa','Santa Cruz da Graciosa'],['Escola Básica e Secundária da Calheta','Calheta'],['Escola Básica Integrada de Vila do Topo','Calheta'],
  ['Escola Básica e Secundária de Velas','Velas'],['Escola Básica e Secundária da Madalena','Madalena'],['Escola Básica e Secundária de São Roque do Pico','São Roque do Pico'],['Escola Básica e Secundária das Lajes do Pico','Lajes do Pico'],
  ['Escola Básica Integrada da Horta','Horta'],['Escola Secundária Manuel de Arriaga','Horta'],['Escola Básica e Secundária das Flores','Santa Cruz das Flores'],['Escola Básica e Secundária Mouzinho da Silveira','Corvo']],
 profissional:[['ENTA — Escola de Novas Tecnologias dos Açores','Ponta Delgada'],['Escola de Formação Turística e Hoteleira','Ponta Delgada'],['Escola Profissional da Câmara de Comércio e Indústria de Ponta Delgada','Ponta Delgada'],
  ['Escola Profissional das Capelas','Ponta Delgada'],['Escola Profissional do Sindicato de Escritório e Comércio da R. A. Açores','Ponta Delgada'],['Escola Profissional de Atividade Lúdica e Social da Santa Casa da Misericórdia de Ponta Delgada','Ponta Delgada'],
  ['INETESE — Instituto de Educação Técnica — Escola Profissional de Lagoa','Lagoa'],['Escola Profissional da Ribeira Grande','Ribeira Grande'],['Escola Profissional de Vila Franca do Campo','Vila Franca do Campo'],
  ['Escola Profissional do Nordeste','Nordeste'],['Escola Profissional da Santa Casa da Misericórdia de Angra do Heroísmo','Angra do Heroísmo'],['Escola Profissional da Praia da Vitória','Praia da Vitória'],
  ['Escola Profissional da Ilha de São Jorge',''],['Escola Profissional da Horta','Horta'],['Escola Profissional do Pico',''],['Escola Profissional Monsenhor João Maurício de Azevedo Ferreira','']]};
const listaEscolas=tp=>(S.cfg.listaEscolas&&S.cfg.listaEscolas[tp])||ESCOLAS_ACORES_BASE[tp].map(x=>x.slice());
function novaEscolaDlg(){let tp='regular';const html=()=>`<div class="ed"><label>Tipologia</label><div class="tipos">${Object.entries(TIPOS_ESCOLA).map(([k,v])=>`<button type="button" class="tipoc ${tp===k?'on':''}" data-nt="${k}">${ic(v.ic,22)}<b>${v.n}</b><span>${v.d}</span></button>`).join('')}</div>
   <div class="row" style="margin-top:14px"><h3 style="margin:0">${tp==='regular'?'Escolas públicas dos Açores':'Escolas profissionais dos Açores'}</h3><span class="sp1"></span><button class="btn sm" id="ne-gerir">${ic('pencil',14)} Editar Lista</button></div>
   <input id="ne-q" type="search" placeholder="Procurar ou escrever o nome de uma escola…" style="margin-top:8px">
   <div class="nelist" id="ne-l"></div>
   <div class="row" style="margin-top:12px"><button class="btn pri" id="ne-ok">${ic('plus',15)} Criar Escola</button><span class="hint" style="margin:0">Pode escolher da lista ou escrever outro nome.</span></div></div>`;
  let sel=null;const desenha=()=>{const q=normT($('#ne-q').value);const L=listaEscolas(tp).filter(x=>!q||normT(x[0]+' '+x[1]).includes(q));
    $('#ne-l').innerHTML=L.map(x=>`<button type="button" class="ner ${sel&&sel[0]===x[0]?'on':''}" data-ne="${esc(x[0])}"><b>${esc(x[0])}</b><span class="mut">${esc(x[1]||'concelho por indicar')}</span></button>`).join('')||`<p class="mut" style="margin:8px 0">Nenhuma escola na lista — será criada “${esc($('#ne-q').value)}”.</p>`;
    $$('[data-ne]').forEach(b=>b.onclick=()=>{sel=listaEscolas(tp).find(x=>x[0]===b.dataset.ne);$('#ne-q').value=sel[0];desenha()})};
  const abre=()=>{openDrawer('Nova Escola',html());$$('[data-nt]').forEach(b=>b.onclick=()=>{tp=b.dataset.nt;sel=null;abre()});$('#ne-q').oninput=()=>{sel=null;desenha()};desenha();
    $('#ne-gerir').onclick=()=>gerirListaEscolas(tp,abre);
    $('#ne-ok').onclick=()=>{const nome=$('#ne-q').value.trim();if(!nome)return alert('Escolha ou escreva o nome da escola.');const conc=sel&&sel[0]===nome?sel[1]:'';
      const e={id:uid(),escola:nome,tipoEscola:tp,concelho:conc};escolas().push(e);if(!listaEscolas(tp).some(x=>x[0]===nome)){S.cfg.listaEscolas=S.cfg.listaEscolas||{};S.cfg.listaEscolas[tp]=listaEscolas(tp).concat([[nome,conc]])}
      UI.escEd=e.id;S.escolaAtiva=e.id;S.turmaAtiva=null;saveNow();closeDrawer();audit('Escolas','Escola criada',nome);const a=A();if(a&&conc)aplicarFeriadosLocais(a,true);go('escola');toast(nome+' criada'+(conc?' · feriados de '+conc+' aplicados':''),'ok')}};abre()}
function gerirListaEscolas(tp,volta){const L=listaEscolas(tp);const conc=CONCELHOS_ACORES.map(c=>c[0]);
  const linhas=()=>L.map((x,i)=>`<tr><td><input data-le="${i}|0" value="${esc(x[0])}"></td><td><select data-le="${i}|1"><option value="">—</option>${conc.map(c=>`<option ${x[1]===c?'selected':''}>${esc(c)}</option>`).join('')}</select></td><td><button class="btn sm ico dng" data-lx="${i}" aria-label="Remover">${ic('x',13)}</button></td></tr>`).join('');
  openDrawer('Editar Lista de Escolas',`<div class="ed"><p class="hint" style="margin-top:0">${tp==='regular'?'Escolas públicas':'Escolas profissionais'} da região. Pode corrigir nomes, indicar o concelho e acrescentar escolas.</p>
    <div class="tblw"><table class="lst"><thead><tr><th>Nome</th><th>Concelho</th><th></th></tr></thead><tbody id="le-b">${linhas()}</tbody></table></div>
    <div class="row" style="margin-top:10px;gap:8px"><button class="btn sm" id="le-add">${ic('plus',14)} Escola</button><button class="btn sm" id="le-rep">${ic('refresh',14)} Repor Lista Original</button><span class="sp1"></span><button class="btn pri" id="le-ok">${ic('check',15)} Guardar</button></div></div>`);
  const bind=()=>{$$('[data-le]').forEach(el=>el.onchange=el.oninput=()=>{const [i,k]=el.dataset.le.split('|').map(Number);L[i][k]=el.value});$$('[data-lx]').forEach(b=>b.onclick=()=>{L.splice(+b.dataset.lx,1);$('#le-b').innerHTML=linhas();bind()})};bind();
  $('#le-add').onclick=()=>{L.unshift(['','']);$('#le-b').innerHTML=linhas();bind();$('[data-le="0|0"]').focus()};
  $('#le-rep').onclick=()=>{if(!confirm('Repor a lista original?'))return;if(S.cfg.listaEscolas)delete S.cfg.listaEscolas[tp];saveNow();volta()};
  $('#le-ok').onclick=()=>{S.cfg.listaEscolas=S.cfg.listaEscolas||{};S.cfg.listaEscolas[tp]=L.filter(x=>x[0].trim()).sort((a,b)=>a[0].localeCompare(b[0],'pt'));saveNow();audit('Escolas','Lista de escolas editada',TIPOS_ESCOLA[tp].n);volta()}}

