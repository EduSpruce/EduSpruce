/* ---------- ligações ao resto da app ---------- */
{const nav=$('#side [data-v="jornal"]');if(nav)nav.onclick=()=>go('jornal')}
{const _g=go;go=function(v){if(v==='jornal'&&!jnOn())v='inicio';const r=_g.apply(this,arguments);try{jnNav();jnBadge()}catch(_){}return r}}
{const _ap=aplicarPrefs;aplicarPrefs=function(){const r=_ap.apply(this,arguments);try{jnNav()}catch(_){}return r}}
{const _au=avisosUrgentes;avisosUrgentes=function(){const L=_au.apply(this,arguments);try{const V=avVistos(),agora=Date.now();jnAvisos().filter(x=>x.u).forEach(x=>{const k=x.k+':'+jnHoje();if(V[k]&&V[k]>agora)return;L.push({k,g:'jornal',ic:x.ic,cor:x.cor,t:x.t,s:x.s,ir:()=>{UI.jnTab='painel';go('jornal');setTimeout(()=>jnAbrirAviso(x),60)}})})}catch(err){console.warn(err)}return L}}
WIDGETS.push(['jornal','Jornal Escolar','news']);
{const _pi=posInicio;posInicio=function(){try{const main=$('.in-main');if(main&&jnOn()&&!$('.jn-w0')){const {y,cfg}=JN();const AV=jnAvisos();const hj=jnHoje();const X=y.ativ.filter(a=>!a.foraPAA&&a.dec!=='ignorar'&&jnPrecEf(a)==='dia'&&jnDatasEf(a).some(d=>d.fim>=hj&&d.ini<=jnAdd(hj,cfg.dias))).sort((a,b)=>jnIni(a).localeCompare(jnIni(b))).slice(0,5);
    main.insertAdjacentHTML('beforeend',`<div class="card jn-w0" data-w="jornal"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">${ic('news',18)} ${esc(cfg.nome)}</h2><span class="sp1"></span><button class="btn sm" id="jw-go">Abrir</button></div>
     ${!y.ativ.length?`<p class="mut" style="margin:0">Importe o PAA para receber avisos das atividades a cobrir.</p>`:''}
     ${AV.filter(x=>x.u).slice(0,4).map(x=>`<div class="jn-wl" style="--ac:${x.cor}">${ic(x.ic,14)} <b>${esc(x.t)}</b> <span class="mut">${esc(x.s)}</span></div>`).join('')}
     ${X.length?`<div class="mut" style="margin:8px 0 4px;font-size:12px">Próximos ${cfg.dias} dias no PAA</div>${X.map(a=>`<div class="jn-wl"><span class="jn-dc dia">${esc(jnLbl(a))}</span> ${esc(a.titulo)} ${a.dec==='cobrir'?'<span class="tag">a cobrir</span>':a.dec==null?'<span class="tag jn-w">por decidir</span>':''}</div>`).join('')}`:''}</div>`);
    const b=$('#jw-go');if(b)b.onclick=()=>{UI.jnTab='painel';go('jornal')}}}catch(err){console.warn(err)}return _pi.apply(this,arguments)}}
{const _ca=cartaoAvisosDef,_ba=bindAvisosDef;cartaoAvisosDef=function(){return _ca.apply(this,arguments)+`<div class="card ed" id="def-mods"><h2>${ic('layers',18)} Módulos Opcionais</h2><p class="hint" style="margin-top:0">Ative só o que usa. Desativar um módulo esconde-o da barra lateral, do Início e dos avisos — os dados ficam guardados.</p>
    <label class="chk"><input type="checkbox" id="mod-jn" ${jnOn()?'checked':''}> ${ic('news',15)} <span><b>Jornal Escolar</b><br><span class="mut">Plano Anual de Atividades, pauta de peças, edições, redação, calendário e avisos</span></span></label></div>`};
  bindAvisosDef=function(){const r=_ba.apply(this,arguments);const c=$('#mod-jn');if(c)c.onchange=()=>{jnAtivar(c.checked);toast(c.checked?'Módulo Jornal Escolar ativado':'Módulo Jornal Escolar desativado','ok')};return r}}
try{AJUDA.push({id:'jornal',ic:'news',t:'Jornal Escolar e Plano Anual de Atividades',gif:null,txt:`<p>O módulo <b>Jornal Escolar</b> (barra lateral) ajuda o responsável pelo jornal a não perder nenhuma atividade da escola.</p><ul><li><b>Importar PAA…</b> lê o documento Word do Plano Anual de Atividades: todas as tabelas (departamentos, clubes, equipas), com atividade, responsáveis e calendarização. As datas escritas por extenso são reconhecidas («12 a 16 de outubro», «8 e 12 de fevereiro», «Março/Abril», «2.º período», «Ao longo do ano letivo»). Pode importar de novo uma versão revista: as decisões e peças mantêm-se e as alterações de data ficam assinaladas.</li><li>Em cada atividade escolha <b>Cobrir</b> ou não: ao cobrir, é criada uma peça na pauta com prazo de entrega. Confirme as datas que no PAA só têm o mês ou o período.</li><li><b>Peças</b>: quadro por estado (ideia, atribuída, em escrita, em revisão, pronta, publicada) — arraste os cartões. <b>Edições</b>: data de fecho e de publicação, lista de verificação. <b>Redação</b>: alunos e professores da equipa.</li><li><b>Avisos</b>: decidir cobertura, atribuir repórter, hoje há atividade, pedir texto e fotos depois da atividade, confirmar datas, peças em atraso e fecho de edição. Os urgentes aparecem na janela de Avisos Urgentes; «Exportar .ics» põe tudo no Calendário do iPad/Mac com alarmes.</li><li>O módulo pode ser desativado em Definições › Módulos Opcionais.</li></ul>`})}catch(_){}

/* v0.63 · Demonstração do Jornal Escolar (só se o jornal deste ano ainda estiver vazio) */
function criarDemoJornal(){try{if(!jnOn())return;const {j,y}=JN();if(y.ativ.length||y.pecas.length||y.edicoes.length)return;const MN=JN_MESES.map(m=>m==='marco'?'março':m);
  const dia=n=>{const d=new Date();d.setDate(d.getDate()+n);while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+(n<0?-1:1));return d};const txt=d=>d.getDate()+' de '+MN[d.getMonth()];
  const ate=(a,b)=>{const x=dia(a),z=dia(b);return x.getMonth()===z.getMonth()?x.getDate()+' a '+z.getDate()+' de '+MN[x.getMonth()]:txt(x)+' a '+txt(z)};
  const L=[['Departamento de Línguas','Semana das Línguas Europeias','Atividades nas aulas e exposição no átrio.','Departamento de Línguas',ate(-40,-36)],
    ['Biblioteca Escolar','Feira do Livro','Venda e troca de livros; sessão com autor açoriano.','Equipa da Biblioteca',ate(-12,-8)],
    ['Desporto Escolar','Corta-Mato Escolar','Fase escola; apuramento para a fase de ilha.','Grupo de Educação Física',txt(dia(3))],
    ['Ciências Experimentais','Dia da Ciência — laboratórios abertos','Experiências demonstrativas para o 1.º ciclo.','Departamento de Ciências',txt(dia(6))],
    ['Cidadania','Assembleia de Delegados de Turma','Eleição da mesa e plano de ação.','Direção',txt(dia(10))],
    ['Ensino Profissional','Visita de estudo — Técnico de Turismo','Roteiro turístico da ilha com os formandos da TT 2.','Curso Profissional de Técnico de Turismo',txt(dia(15))],
    ['Expressões','Concerto de Natal','Coro e orquestra da escola no auditório.','Grupo de Música','Dezembro'],
    ['Biblioteca Escolar','Concurso Nacional de Leitura — fase escola','Provas escritas e orais.','Equipa da Biblioteca','2.º período'],
    ['Cidadania','Semana da Saúde Mental','Palestras e workshops com a psicóloga escolar.','SPO','Fevereiro'],
    ['Departamento de Línguas','Spelling Bee','Concurso de soletração em inglês (2.º e 3.º ciclos).','Departamento de Línguas','Março/Abril'],
    ['Direção','Dia do Patrono','Cerimónia, exposições e sessão solene.','Direção','3.º período'],
    ['Clubes','Clube de Robótica','Sessões semanais e participação em concursos.','Clube de Robótica','Ao longo do ano letivo']].map(([sec,titulo,det,resp,cal])=>({sec,titulo,det,resp,cal,rec:'',ind:'',obj:''}));
  jnImportar(L,'PAA (demonstração).docx');
  [['Ana Sofia Medeiros','Repórter','10.º A'],['Tomás Rocha Sousa','Fotógrafo/a','11.º B'],['Leonor Furtado','Revisor/a','12.º A'],['Duarte Câmara','Paginador/a','11.º C'],[S.cfg.professor||'Professor(a) responsável','Editor/a','']].forEach(([nome,funcao,turma])=>j.equipa.push({id:uid(),nome,funcao,turma,contacto:'',demo:true}));
  const E=j.equipa;const hj=isoData(new Date());
  const e1={id:uid(),num:'1',titulo:'Edição de outono',fecho:isoData(dia(-25)),pub:isoData(dia(-20)),estado:'publicada',check:JN_CHECK.map((_,k)=>k),notas:'',demo:true};
  const e2={id:uid(),num:'2',titulo:'Edição de Natal',fecho:isoData(dia(12)),pub:isoData(dia(18)),estado:'planeada',check:[0],notas:'Capa: Concerto de Natal.',demo:true};y.edicoes.push(e1,e2);
  const porT=t=>y.ativ.find(a=>a.titulo===t);
  ['Semana das Línguas Europeias','Feira do Livro','Corta-Mato Escolar','Dia da Ciência — laboratórios abertos','Visita de estudo — Técnico de Turismo','Concerto de Natal','Clube de Robótica'].forEach(t=>{const a=porT(t);if(a)jnCobrir(a,'cobrir')});
  const ig=porT('Assembleia de Delegados de Turma');if(ig)jnCobrir(ig,'ignorar');
  const est={'Semana das Línguas Europeias':['publicada',e1,0,1],'Feira do Livro':['revisao',e2,0,1],'Corta-Mato Escolar':['atribuida',e2,1,1],'Dia da Ciência — laboratórios abertos':['ideia',e2,0,null],'Visita de estudo — Técnico de Turismo':['atribuida',e2,0,1],'Concerto de Natal':['ideia',e2,null,null],'Clube de Robótica':['escrita',e2,0,1]};
  y.pecas.forEach(p=>{const a=y.ativ.find(x=>x.id===p.ativ);const s=a&&est[a.titulo];if(!s)return;p.estado=s[0];p.edicao=s[1].id;if(s[2]!=null)p.autor=E[s[2]].id;if(s[3]!=null)p.foto=E[s[3]].id;p.demo=true;if(a.titulo==='Feira do Livro'){p.tipo='Reportagem';p.prazo=isoData(dia(2))}if(a.titulo==='Clube de Robótica'){p.tipo='Entrevista';p.prazo=isoData(dia(-1))}});
  y.pecas.push({id:uid(),titulo:'Passatempo: palavras cruzadas de Natal',tipo:'Passatempo',estado:'escrita',ativ:'',prazo:isoData(dia(8)),autor:E[2].id,foto:'',edicao:e2.id,notas:'',criada:Date.now(),demo:true},
    {id:uid(),titulo:'Opinião: telemóveis nos intervalos',tipo:'Opinião',estado:'pronta',ativ:'',prazo:isoData(dia(5)),autor:E[0].id,foto:'',edicao:e2.id,notas:'',criada:Date.now(),demo:true});
  save()}catch(err){console.warn('demo jornal',err)}}
{const _cDj=criarDemo;criarDemo=function(){const n0=S.anos.length;const r=_cDj.apply(this,arguments);try{if(S.anos.length>n0){criarDemoJornal();saveNow()}}catch(err){console.warn(err)}return r}}

/* v0.63 · Perfis de animação: sem · minimalista · cheio */
const ANIM_P=[['sem','Sem Animações','Nada se mexe: ideal para apresentar, para quem prefere calma ou para poupar bateria.'],['min','Minimalista','Só transições curtas e discretas (fade) ao mudar de secção e ao abrir painéis.'],['cheio','Cheio de Animações','Entradas em cascata, números a contar, barras e gráficos a crescer, efeitos ao tocar, confetes nas conquistas e muito mais.']];
const animPerfil=()=>{const v=S.cfg.animPerfil;return v==='sem'||v==='min'||v==='cheio'?v:'cheio'};
function animAplicar(){const r=document.documentElement,p=animPerfil();['sem','min','cheio'].forEach(k=>r.classList.toggle('anim-'+k,k===p));
  /* «Sem» liga o modo de movimento reduzido (o mesmo da Acessibilidade); os outros respeitam a Acessibilidade */
  if(p==='sem')r.classList.add('a11y-rm');else{r.classList.remove('a11y-rm');try{_aA11(true)}catch(_){}}}
/* re-aplicar a acessibilidade sem perder o perfil «Sem» */
let _aA11=()=>{};{const _a1=aplicarA11yCfg;_aA11=function(){return _a1.apply(this,arguments)};aplicarA11yCfg=function(){const r=_a1.apply(this,arguments);try{if(animPerfil()==='sem')document.documentElement.classList.add('a11y-rm');['sem','min','cheio'].forEach(k=>document.documentElement.classList.toggle('anim-'+k,k===animPerfil()))}catch(_){}return r}}
{const _cn=contarNumeros;contarNumeros=function(){if(animPerfil()!=='cheio')return;return _cn.apply(this,arguments)}}
/* cascata de linhas, barras a crescer e linhas de gráficos a desenhar (perfil cheio) */
function animCheio(root){if(animPerfil()!=='cheio'||!animOK())return;root=root||$('#view');if(!root)return;
  root.querySelectorAll('table.lst tbody, .jn-l, .mral, .jn-eds').forEach(tb=>{[...tb.children].slice(0,28).forEach((tr,k)=>{tr.style.setProperty('--ai',k);tr.classList.add('an-row')})});
  root.querySelectorAll('svg:not(.ic) path,svg:not(.ic) polyline').forEach(p=>{const sv=p.ownerSVGElement;if(sv&&(sv.closest('.ic,button,.btn,.nav')||(sv.width&&sv.width.baseVal&&sv.width.baseVal.value&&sv.width.baseVal.value<40)))return;const cs=getComputedStyle(p);if(cs.fill!=='none'&&p.getAttribute('fill')!=='none')return;if(cs.strokeDasharray&&cs.strokeDasharray!=='none')return;if(!p.getTotalLength)return;let L=0;try{L=p.getTotalLength()}catch(_){}if(L<40)return;p.style.setProperty('--al',L);p.classList.add('an-draw')})}
{const _gAn=go;go=function(){const r=_gAn.apply(this,arguments);try{requestAnimationFrame(()=>animCheio())}catch(_){}return r}}
/* confetes discretos nos toasts de sucesso */
function animConfetes(x,y){if(animPerfil()!=='cheio'||!animOK())return;const cores=['#f59e0b','#10b981','#3b82f6','#ef4444','#a855f7','#ec4899'];const box=document.createElement('div');box.className='an-conf';box.style.left=x+'px';box.style.top=y+'px';
  for(let k=0;k<18;k++){const i=document.createElement('i');const a=Math.random()*Math.PI*2,d=40+Math.random()*70;i.style.cssText=`--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-40}px;--r:${Math.random()*540-270}deg;background:${cores[k%cores.length]};animation-delay:${Math.random()*.08}s`;box.appendChild(i)}
  document.body.appendChild(box);setTimeout(()=>box.remove(),1100)}
{const _tA=toast;toast=function(msg,tipo){const r=_tA.apply(this,arguments);try{if(tipo==='ok'&&animPerfil()==='cheio'){const t=$('#toast');const b=t&&t.getBoundingClientRect();animConfetes(b&&b.width?b.left+b.width/2:innerWidth/2,b&&b.height?b.top:innerHeight-80)}}catch(_){}return r}}
/* cartão nas Definições › Aparência */
function cartaoAnim(){const p=animPerfil();const rm=document.documentElement.classList.contains('a11y-rm')&&p!=='sem';
  return `<div class="card" id="an-cfg"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('sparkle',18)} Animações</h2><span class="sp1"></span><span class="mut" style="font-size:13px">Só neste dispositivo</span></div>
  <div class="angrid" role="radiogroup" aria-label="Perfil de animação">${ANIM_P.map(([k,n,d],i)=>`<button type="button" role="radio" aria-checked="${p===k}" class="anopt ${p===k?'on':''}" data-anp="${k}"><span class="anprev anp-${k}" aria-hidden="true"><i></i><i></i><i></i></span><b>${i+1} · ${n}</b><small>${d}</small></button>`).join('')}</div>
  ${rm?`<p class="hint">${ic('info',13)} A Acessibilidade (ou o sistema) está a pedir para <b>reduzir o movimento</b> — essa escolha prevalece.</p>`:''}</div>`}
{const _vdA=vDefinicoes;vDefinicoes=function(){const r=_vdA.apply(this,arguments);try{if((UI.defTab||'geral')==='aparencia'&&!$('#an-cfg')){const c=$('#view .card');if(c){c.insertAdjacentHTML('beforebegin',cartaoAnim());$$('#an-cfg [data-anp]').forEach(b=>b.onclick=()=>{S.cfg.animPerfil=b.dataset.anp;save();animAplicar();go('definicoes');if(S.cfg.animPerfil==='cheio')toast('Animações: cheio','ok');else toast('Animações: '+(S.cfg.animPerfil==='sem'?'sem':'minimalista'))})}}}catch(e){console.warn(e)}return r}}
animAplicar();


/* v0.64 · Avisos Urgentes: os do Jornal Escolar numa secção à parte */
{const _avU=avisosUrgentes;avisosUrgentes=function(){const L=_avU.apply(this,arguments);return L.filter(x=>x.g!=='jornal').concat(L.filter(x=>x.g==='jornal'))}}
{const _maJ=mostrarAvisos;mostrarAvisos=function(){const r=_maJ.apply(this,arguments);try{const o=$('#avpop');if(o&&!o.dataset.jg){o.dataset.jg=1;const L=avisosUrgentes();const its=[...o.querySelectorAll('.avl>.avit')];const nJ=L.filter(x=>x.g==='jornal').length;if(nJ&&its.length===L.length){const lst=o.querySelector('.avl');const nG=L.length-nJ;
    if(nG)lst.insertAdjacentHTML('afterbegin',`<div class="avgh">${ic('bell',13)} Gerais <span>${nG}</span></div>`);const first=its[L.findIndex(x=>x.g==='jornal')];first.insertAdjacentHTML('beforebegin',`<div class="avgh avgj">${ic('news',13)} ${esc((JN().cfg.nome)||'Jornal Escolar')} <span>${nJ}</span><button type="button" class="btn sm" data-avjn>${ic('folder',13)} Abrir o Jornal</button></div>`);
    its.forEach((el,i)=>{if(L[i].g==='jornal')el.classList.add('avj')});const sp=o.querySelector('.avh>div>span');if(sp)sp.textContent=L.length+' aviso'+(L.length>1?'s':'')+' a precisar de atenção'+(nG?' · '+nJ+' do Jornal Escolar':'');
    const b=o.querySelector('[data-avjn]');if(b)b.onclick=()=>{o.remove();UI.jnTab='painel';go('jornal')}}}}catch(e){console.warn(e)}return r}}

/* v0.64 · estilo iOS 27 (Liquid Glass) com o controlo «Transparente ↔ Com cor» */
ESTILOS_X.push(['ios27','iOS 27','sparkle','Inspirado no iOS 27: Liquid Glass, barra lateral até à margem, botões em cápsula e controlos segmentados']);
function iosVidro(){const v=S.cfg.iosVidro;const n=v==null?55:Math.max(0,Math.min(100,+v));document.documentElement.style.setProperty('--lg-a',String(Math.round((.28+n/100*.66)*100)/100));return n}
{const _apI=aplicarPrefs;aplicarPrefs=function(){const r=_apI.apply(this,arguments);try{iosVidro();const m=document.querySelector('meta[name=theme-color]');if(m&&S.cfg.estilo==='ios27')m.setAttribute('content',document.body.classList.contains('escurox')?'#000000':'#f2f2f7')}catch(_){}return r}}
{const _vdI=vDefinicoes;vDefinicoes=function(){const r=_vdI.apply(this,arguments);try{if((UI.defTab||'geral')==='aparencia'&&S.cfg.estilo==='ios27'&&!$('#ios-gl')){const sg=$('#ap-est');const pr=sg&&sg.closest('.pref');if(pr){const n=iosVidro();pr.insertAdjacentHTML('afterend',`<div class="pref" id="ios-gl"><b>Liquid Glass</b><div class="iosgl"><small>Transparente</small><input type="range" min="0" max="100" step="1" value="${n}" id="ios-r" aria-label="Transparência do vidro"><small>Com cor</small><span class="iosprev" aria-hidden="true"><i></i></span></div></div>`);const rg=$('#ios-r');rg.oninput=()=>{S.cfg.iosVidro=+rg.value;iosVidro()};rg.onchange=()=>save()}}}catch(e){console.warn(e)}return r}}
try{aplicarPrefs()}catch(_){}

