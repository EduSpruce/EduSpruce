/* ================= v0.36 (B) ================= */
const isoHoje=()=>isoData(new Date());
/* ---- dias nacionais e internacionais ---- */
const DIAS_COMEM={'01-01':['Dia Mundial da Paz','Ano Novo'],'01-06':['Dia de Reis'],'01-24':['Dia Internacional da Educação'],'01-27':['Dia Internacional em Memória das Vítimas do Holocausto'],'01-30':['Dia Escolar da Não-Violência e da Paz'],
'02-04':['Dia Mundial contra o Cancro'],'02-11':['Dia Internacional das Mulheres e Raparigas na Ciência'],'02-14':['Dia de São Valentim'],'02-20':['Dia Mundial da Justiça Social'],'02-21':['Dia Internacional da Língua Materna'],
'03-08':['Dia Internacional da Mulher'],'03-14':['Dia do Pi (π)'],'03-15':['Dia Mundial dos Direitos do Consumidor'],'03-20':['Dia Internacional da Felicidade'],'03-21':['Dia Mundial da Poesia','Dia Internacional das Florestas','Dia da Árvore','Dia Mundial da Síndrome de Down'],'03-22':['Dia Mundial da Água'],'03-27':['Dia Mundial do Teatro'],
'04-02':['Dia Internacional do Livro Infantil','Dia Mundial da Consciencialização do Autismo'],'04-07':['Dia Mundial da Saúde'],'04-22':['Dia da Terra'],'04-23':['Dia Mundial do Livro e dos Direitos de Autor'],'04-25':['Dia da Liberdade'],'04-29':['Dia Internacional da Dança'],
'05-01':['Dia do Trabalhador'],'05-03':['Dia Mundial da Liberdade de Imprensa'],'05-05':['Dia Mundial da Língua Portuguesa'],'05-09':['Dia da Europa'],'05-15':['Dia Internacional da Família'],'05-18':['Dia Internacional dos Museus'],'05-22':['Dia Internacional da Biodiversidade'],'05-31':['Dia Mundial sem Tabaco'],
'06-01':['Dia Mundial da Criança'],'06-05':['Dia Mundial do Ambiente'],'06-08':['Dia Mundial dos Oceanos'],'06-10':['Dia de Portugal, de Camões e das Comunidades Portuguesas'],'06-20':['Dia Mundial do Refugiado'],'06-21':['Dia Europeu da Música'],
'07-11':['Dia Mundial da População'],'07-18':['Dia Internacional de Nelson Mandela'],'07-30':['Dia Internacional da Amizade'],'08-12':['Dia Internacional da Juventude'],'08-19':['Dia Mundial da Fotografia'],
'09-08':['Dia Internacional da Literacia'],'09-21':['Dia Internacional da Paz'],'09-26':['Dia Europeu das Línguas'],'09-27':['Dia Mundial do Turismo'],
'10-01':['Dia Mundial da Música','Dia Internacional do Idoso'],'10-04':['Dia Mundial do Animal'],'10-05':['Dia Mundial do Professor','Implantação da República'],'10-10':['Dia Mundial da Saúde Mental'],'10-16':['Dia Mundial da Alimentação'],'10-24':['Dia das Nações Unidas'],'10-31':['Dia Mundial da Poupança','Halloween'],
'11-01':['Dia de Todos os Santos'],'11-11':['Dia de São Martinho'],'11-16':['Dia Internacional da Tolerância'],'11-20':['Dia Internacional dos Direitos da Criança'],'11-24':['Dia Nacional da Cultura Científica'],'11-25':['Dia Internacional para a Eliminação da Violência contra as Mulheres'],
'12-01':['Restauração da Independência','Dia Mundial de Luta contra a SIDA'],'12-03':['Dia Internacional das Pessoas com Deficiência'],'12-05':['Dia Internacional do Voluntariado'],'12-08':['Imaculada Conceição'],'12-10':['Dia dos Direitos Humanos'],'12-24':['Véspera de Natal'],'12-25':['Natal'],'12-31':['Véspera de Ano Novo']};
/* ---- épocas (temas sazonais) ---- */
const SAZ={natal:{n:'Natal',e:'🎄',ac:['#b91c1c','#f87171'],g:['#c0262d','#14532d']},halloween:{n:'Halloween',e:'🎃',ac:['#c2410c','#fb923c'],g:['#c2410c','#3b0764']},professor:{n:'Dia do Professor',e:'🍎',ac:['#a16207','#facc15'],g:['#b7791f','#1e3a8a']},
  inverno:{n:'Inverno',e:'❄️',ac:['#0369a1','#7dd3fc'],g:['#0284c7','#1e3a8a']},primavera:{n:'Primavera',e:'🌸',ac:['#15803d','#86efac'],g:['#16a34a','#9d174d']},verao:{n:'Verão',e:'☀️',ac:['#0e7490','#67e8f9'],g:['#d97706','#0e7490']},outono:{n:'Outono',e:'🍂',ac:['#b45309','#fbbf24'],g:['#b45309','#7c2d12']}};
function epocaDe(d){d=d||new Date();const m=d.getMonth()+1,dd=d.getDate(),md=m*100+dd;
  if(md===1005)return 'professor';if(md>=1201||md<=106)return 'natal';if(md===1030||md===1031||md===1101)return 'halloween';
  if(md>=1221||md<=319)return 'inverno';if(md<=620)return 'primavera';if(md<=922)return 'verao';return 'outono'}
const epocaAtiva=()=>{const c=S.cfg;if(c.sazonal===false)return null;return c.sazForcar||epocaDe()};
function aplicarEpoca(){const r=document.documentElement;Object.keys(SAZ).forEach(k=>r.classList.remove('saz-'+k));const e=epocaAtiva();
  if(e&&SAZ[e]){r.classList.add('saz-'+e);r.style.setProperty('--accL',SAZ[e].ac[0]);r.style.setProperty('--accD',SAZ[e].ac[1]);r.style.setProperty('--sazA',SAZ[e].g[0]);r.style.setProperty('--sazB',SAZ[e].g[1])}
  const b=$('#brandEsc');const bd=$('.brand .bnm');if(bd){let s=bd.querySelector('.sazb');if(e&&SAZ[e]){if(!s){s=document.createElement('span');s.className='sazb';s.setAttribute('aria-hidden','true');bd.appendChild(s)}s.textContent=SAZ[e].e;bd.title=SAZ[e].n}else if(s)s.remove()}
  neve(e==='natal'&&S.cfg.neve!==false)}
{const _ap=aplicarPrefs;aplicarPrefs=function(){const r=_ap.apply(this,arguments);try{aplicarEpoca()}catch(_){}return r}}
/* neve (só no Natal; desliga com Reduzir Movimento) */
function neve(on){let cv=$('#neve');const rm=document.documentElement.classList.contains('a11y-rm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!on||rm){if(cv){cancelAnimationFrame(neve._r);cv.remove()}return}if(cv)return;cv=document.createElement('canvas');cv.id='neve';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);const ctx=cv.getContext('2d');let W,H,F=[];
  const tam=()=>{const dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);const n=Math.round(Math.min(110,W*H/16000));F=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.6,v:.35+Math.random()*.9,o:Math.random()*6.28,a:.45+Math.random()*.5}))};tam();addEventListener('resize',tam);
  const passo=()=>{if(!document.hidden){ctx.clearRect(0,0,W,H);for(const f of F){f.y+=f.v;f.o+=.012;f.x+=Math.sin(f.o)*.45;if(f.y>H+5){f.y=-5;f.x=Math.random()*W}ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.283);ctx.fillStyle=`rgba(255,255,255,${f.a})`;ctx.shadowColor='rgba(120,150,190,.6)';ctx.shadowBlur=2;ctx.fill()}}neve._r=requestAnimationFrame(passo)};passo()}
/* Definições › Aparência: temas sazonais */
{const _da=defAparencia;defAparencia=function(){let h=_da.apply(this,arguments);const c=S.cfg;const e=epocaDe();
  const bloco=`<div class="pref"><b>Temas sazonais</b><div style="display:grid;gap:6px"><label class="chk"><input type="checkbox" id="ap-saz" ${c.sazonal!==false?'checked':''}> Mudar as cores consoante a época (Natal, Halloween, Inverno, Primavera, Verão, Outono e Dia do Professor) — agora: <b>${SAZ[e].e} ${SAZ[e].n}</b></label>
    <label class="chk"><input type="checkbox" id="ap-neve" ${c.neve!==false?'checked':''} ${c.sazonal===false?'disabled':''}> Efeito de neve no Natal</label>
    <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><label for="ap-sazf" class="mut" style="margin:0">Experimentar</label><select id="ap-sazf" style="width:auto" ${c.sazonal===false?'disabled':''}><option value="">Automático (pela data)</option>${Object.entries(SAZ).map(([k,v])=>`<option value="${k}" ${c.sazForcar===k?'selected':''}>${v.e} ${v.n}</option>`).join('')}</select></div></div></div>`;
  return h.replace(/(<div class="pref"><b>Estilo da interface<\/b>[\s\S]*?<\/div><\/div>)/,'$1'+bloco)}}
document.addEventListener('change',e=>{const id=e.target&&e.target.id;if(id==='ap-saz'){S.cfg.sazonal=e.target.checked;save();aplicarEpoca();go('definicoes')}else if(id==='ap-neve'){S.cfg.neve=e.target.checked;save();aplicarEpoca()}else if(id==='ap-sazf'){S.cfg.sazForcar=e.target.value;save();aplicarEpoca();toast(e.target.value?'A experimentar: '+SAZ[e.target.value].n:'Tema pela data','ok')}});
setTimeout(()=>{try{aplicarEpoca()}catch(_){}},0);setInterval(()=>{try{if(!S.cfg.sazForcar){const e=epocaAtiva();if(!document.documentElement.classList.contains('saz-'+e))aplicarEpoca()}}catch(_){}},60*60*1000);
/* ---- Início: widget “Hoje” ---- */
function widgetHojeInfo(){const d=new Date();const iso=isoHoje();const md=iso.slice(5);const a=A();const L=[];
  const cal=a&&a.calendario;const tp=cal&&cal.dias&&cal.dias[iso];const nota=cal&&cal.notas&&cal.notas[iso];
  if(tp&&tp!=='letivo'&&TIPOS_DIA[tp])L.push({ic:'flag',t:nomeTipo(tp)+(nota?' — '+nota:''),c:'esc'});else if(nota)L.push({ic:'flag',t:nota,c:'esc'});
  (DIAS_COMEM[md]||[]).forEach(n=>L.push({ic:/Professor/.test(n)?'grad':'sparkle',t:n,c:/Professor/.test(n)?'prof':''}));
  const p=perfil();if(p.nascimento&&p.nascimento.slice(5)===md)L.unshift({ic:'sparkle',t:'Hoje é o seu aniversário! Parabéns 🎂',c:'prof'});
  let an=0;if(a)a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.nasc&&x.nasc.slice(5)===md)an++}));if(an)L.push({ic:'users',t:an+' aniversário'+(an>1?'s':'')+' de alunos',c:''});
  const e=epocaDe(d);const wd=d.toLocaleDateString('pt-PT',{weekday:'long'});
  return `<div class="card whoje"><div class="whd"><span class="whn">${d.getDate()}</span><span class="whm"><b>${wd[0].toUpperCase()+wd.slice(1)}</b><span>${d.toLocaleDateString('pt-PT',{month:'long',year:'numeric'})}</span></span><span class="whe" title="${SAZ[e].n}" aria-label="Época: ${SAZ[e].n}">${SAZ[e].e}</span></div>
    ${L.length?`<ul class="whl">${L.map(x=>`<li class="${x.c}">${ic(x.ic,14)}<span>${esc(x.t)}</span></li>`).join('')}</ul>`:`<p class="mut" style="margin:6px 0 0;font-size:13px">Sem efemérides para hoje.</p>`}</div>`}
{const _pi=posInicio;posInicio=function(){const r=_pi.apply(this,arguments);try{const f=$('.in-fav');if(f&&!f.querySelector('.whoje'))f.insertAdjacentHTML('afterbegin',widgetHojeInfo());
  if(epocaDe()==='professor'&&S.cfg.sazonal!==false&&!$('.diaprof')){const h=$('.in-hero')||$('.inlay');if(h)h.insertAdjacentHTML('afterbegin',`<div class="card diaprof" role="status"><span class="dpi" aria-hidden="true">🍎</span><div><b>Feliz Dia Mundial do Professor, ${esc(profNome(S.cfg.professor)||'Professor(a)')}!</b><span>Obrigado por tudo o que faz pelos seus alunos — hoje a app veste-se a rigor por si.</span></div></div>`);confetes()}
  const vz=[...document.querySelectorAll('.inlay .empty')].find(e=>/Ainda sem turmas|Sem turmas de/.test(e.textContent));if(vz&&!vz.querySelector('[data-goview]'))vz.insertAdjacentHTML('beforeend',`<div class="row" style="justify-content:center;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn pri" data-nt-excel>${ic('upload',15)} Turma a partir do Excel</button><button class="btn" data-nt-vazia>${ic('plus',15)} Turma Vazia</button><button class="btn" data-goview="turmas">${ic('school',15)} Ano Letivo e Turmas</button></div>`)}catch(e){console.warn(e)}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-nt-vazia],[data-nt-excel]');if(!b)return;go('turmas');setTimeout(()=>{const x=$(b.hasAttribute('data-nt-vazia')?'#t-new':'#t-pdf');if(x)x.click()},120)});
function confetes(){if(document.documentElement.classList.contains('a11y-rm')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const w=document.createElement('div');w.className='confw';w.setAttribute('aria-hidden','true');const cs=['#facc15','#2563eb','#dc2626','#16a34a','#a855f7','#f97316'];
  for(let i=0;i<90;i++){const s=document.createElement('i');s.style.cssText=`left:${Math.random()*100}%;background:${cs[i%cs.length]};animation-delay:${Math.random()*1.2}s;animation-duration:${2.4+Math.random()*2}s;transform:rotate(${Math.random()*360}deg)`;w.appendChild(s)}document.body.appendChild(w);setTimeout(()=>w.remove(),5200)}
/* ---- aniversário do professor: parabéns em ecrã inteiro (fecha com 3 toques no ×) ---- */
function parabensProf(){const p=perfil();const iso=isoHoje();if(!p.nascimento||p.nascimento.slice(5)!==iso.slice(5)||S.cfg.parabensVisto===iso||document.body.classList.contains('login-on')||$('#parabens'))return;
  const anos=new Date().getFullYear()-(+p.nascimento.slice(0,4));let n=3;const nome=(S.cfg.professor||'').trim().split(/\s+/)[0]||'';
  const d=document.createElement('div');d.id='parabens';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','pb-t');
  d.innerHTML=`<div class="pbb"><div class="pbe" aria-hidden="true">🎂🎉🎈</div><h1 id="pb-t">Parabéns${nome?', '+esc(nome):''}!</h1>${anos>15&&anos<100?`<p class="pba">${anos} anos — e cada vez melhor.</p>`:''}<p class="pbq">Fazes anos hoje… achas mesmo que precisas de trabalhar? 😏</p><p class="pbs">Fecha a app, liga a quem gostas e vai comer bolo. Os sumários esperam por amanhã.</p>
    <button type="button" class="pbx" aria-label="Fechar (toque 3 vezes)">${ic('x',26)}</button><p class="pbc" aria-live="polite">Para fechar, toque 3 vezes no ×</p></div>`;
  document.body.appendChild(d);['#main','#side'].forEach(s=>{const e=$(s);if(e)e.inert=true});confetes();setTimeout(confetes,2500);
  const x=d.querySelector('.pbx');x.focus();x.onclick=()=>{n--;const c=d.querySelector('.pbc');if(n>0){c.textContent=n===2?'Tem a certeza? Mais 2 toques…':'Último aviso: hoje é dia de festa! Mais 1 toque…';x.classList.remove('abana');void x.offsetWidth;x.classList.add('abana');return}
    S.cfg.parabensVisto=iso;save();d.classList.add('sai');setTimeout(()=>{d.remove();const m=$('#main');if(m)m.inert=false;a11ySide()},350);toast('Bom trabalho… e bom aniversário! 🎂','ok')};
  d.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();x.focus()}})}
{const _g3=go;go=function(v){const r=_g3.apply(this,arguments);setTimeout(()=>{try{parabensProf()}catch(_){}},400);return r}}
/* ---- perfil: data de nascimento ---- */
{const _dp=defProf;defProf=function(){const h=_dp.apply(this,arguments);const p=perfil();return h.replace(/(<div><label>Género<\/label><select data-pf="genero"[\s\S]*?<\/select><\/div>)/,`$1<div><label>Data de nascimento 🎂</label><input data-pf="nascimento" type="date" value="${esc(p.nascimento||'')}" title="No dia de anos a app dá-lhe os parabéns" aria-describedby="pf-nasc-h"><small id="pf-nasc-h" class="mut" style="font-size:12px">No dia de anos a app dá-lhe os parabéns.</small></div>`)}}
/* ---- ficha do aluno: separador “Turma” ---- */
try{const T_=FICHA_TABS.find(x=>x[0]==='turma');if(T_)T_[2]='Turma'}catch(_){}
/* ---- Acessibilidade: sem opções repetidas (o tamanho do texto e o alto contraste estão em Aparência) ---- */
{const _ca=cartaoA11y;cartaoA11y=function(){return _ca.apply(this,arguments).replace(/<div><label>Tamanho do Texto<\/label>[\s\S]*?<\/div><\/div>\s*<div><label>Movimento/,'<div><label>Movimento').replace(/<div><label>Contraste<\/label>[\s\S]*?<\/div><\/div>\s*<div><label>Ligações/,'<div><label>Ligações').replace('A app segue também as definições','O tamanho do texto e o alto contraste estão em Aparência. A app segue também as definições')}}
/* ---- ensino profissional: disciplinas e motor de busca do Catálogo ---- */
const DISC_PROF=[['Sociocultural',['Português','Inglês','Francês','Espanhol','Alemão','Área de Integração','Tecnologias da Informação e Comunicação','Educação Física','Cidadania e Desenvolvimento','Educação Moral e Religiosa Católica (EMRC)']],
  ['Científica',['Matemática','Física e Química','Biologia','Química','Física','Geografia','Economia','História da Cultura e das Artes','Psicologia','Sociologia','Direito','Geometria Descritiva','Desenho']],
  ['Tecnológica',['Componente Tecnológica (UFCD)','Componente Tecnológica (UC)']],['Formação em Contexto de Trabalho',['Formação em Contexto de Trabalho (FCT)','Prova de Aptidão Profissional (PAP)']]];
DISC_PROF.forEach(([,L])=>L.forEach(n=>{const d=DISCIPLINAS.find(x=>x.n===n);if(d){if(!d.c.includes('sec'))d.c.push('sec')}else DISCIPLINAS.push({n,c:['sec'],t:'gen',prof:true})}));
const escolaProfissional=()=>{try{return tipoEscola(escolaPorId(escAtiva()))==='profissional'}catch(_){return false}};
{const _cd=cartaoDisciplinas;cartaoDisciplinas=function(){let h=_cd.apply(this,arguments);if(!escolaProfissional())return h;
  const box=document.createElement('div');box.innerHTML=h;const card=box.firstElementChild;
  card.querySelectorAll('h3').forEach(h3=>{if(/1\.º Ciclo|2\.º Ciclo|3\.º Ciclo|Ensino Secundário/.test(h3.textContent)){const g=h3.nextElementSibling;if(g&&g.classList.contains('disc-grid'))g.remove();h3.remove()}});
  const dk=n=>discKey(n,'sec');const html=`${DISC_PROF.map(([g,L])=>`<h3>Ensino Profissional · Componente ${esc(g)}</h3><div class="disc-grid">${L.map(n=>{const k=dk(n);return `<label class="${discAno().includes(k)?'on':''}"><input type="checkbox" data-disc="${esc(k)}" ${discAno().includes(k)?'checked':''}> ${esc(n)}</label>`}).join('')}</div>`).join('')}`;
  const ref=[...card.querySelectorAll('h3')].find(x=>/PROFIJ|Outras disciplinas/i.test(x.textContent));if(ref)ref.insertAdjacentHTML('beforebegin',html);else card.insertAdjacentHTML('beforeend',html);
  const p=card.querySelector('.hint');if(p)p.innerHTML='Escola profissional: escolha as disciplinas e componentes que leciona nos cursos profissionais. Na Componente Tecnológica pode procurar o curso no Catálogo Nacional de Qualificações e marcar as UFCD ou UC. <b>Cada ano letivo tem a sua lista.</b>';
  return box.innerHTML}}
{const _bd2=bindDisciplinas;bindDisciplinas=function(re){const r=_bd2.apply(this,arguments);try{if($('#disc-card .cnqdisc'))return r;const ks=[discKey(UFCD_N,'sec'),discKey(UC_N,'sec')].filter(k=>discAno().includes(k));if(!ks.length)return r;
  const ch=[...$$('[data-disc]')].find(e=>ks.includes(e.dataset.disc));const g=ch&&ch.closest('.disc-grid');if(!g)return r;const box=document.createElement('div');box.className='cnq cnqdisc';g.after(box);
  cnqPainel(box,{tipos:()=>[discAno().includes(discKey(UFCD_N,'sec'))?'UFCD':null,discAno().includes(discKey(UC_N,'sec'))?'UC':null].filter(Boolean),sel:()=>new Set(ufcdAno().map(u=>u.cod)),set:(u,on)=>{const L=ufcdAno();const i=L.findIndex(x=>x.cod===u.cod);if(i>=0)L.splice(i,1);if(on)L.push({cod:u.cod,nome:u.nome,horas:u.horas,tipo:u.tipo,curso:UI.cnqCurso||''});save();try{ufcdSinc(u,on)}catch(e){console.warn(e)}},
    rodape:()=>`<p class="hint" style="margin:8px 0 0">${ufcdAno().length?ufcdAno().length+' unidades escolhidas para '+esc(A().nome)+' — ':''}As unidades marcadas aparecem já selecionadas ao criar uma turma.</p>`})}catch(e){console.warn(e)}return r}}
/* ---- Nova Turma: código interno; um só seletor de curso (as unidades seguem o curso escolhido) ---- */
let NT_CUR=null;
{const _cp=cnqPainel;cnqPainel=function(box,api){if(!api.cursoFixo)return _cp.apply(this,arguments);
  const M=cnqM();let busy=false;const sel=api.sel;
  const des=()=>{const id=api.cursoFixo();const c=id?M.cursos.find(x=>String(x.id)===String(id)):null;if(!c){box.innerHTML=`<p class="mut" style="margin:0">${ic('book',14)} Escolha primeiro o curso acima para ver as UFCD / UC.</p>${typeof api.rodape==='function'?api.rodape():(api.rodape||'')}`;return}
    const U=M.uf[c.id]?M.uf[c.id].L:null;if(!U){box.innerHTML=`<p class="mut" role="status">${ic('refresh',14)} A descarregar as unidades de ${esc(c.nome)}…</p>`;if(!busy){busy=true;cnqCarregarUfcd(c).then(()=>{busy=false;des()}).catch(e=>{busy=false;box.innerHTML=`<p class="hint" style="color:var(--bad)">Não foi possível ler as unidades (${esc(e.message)}).</p>`})}return}
    const K=cnqTipoCurso(c);const S0=sel();const tot=U.filter(u=>S0.has(u.cod)).reduce((s,u)=>s+(+u.horas||0),0);const sc=(box.querySelector('.cnqt')||{}).scrollTop||0;
    box.innerHTML=`<div class="cnqbar"><span class="mut"><b>${esc(c.nome)}</b> · ${U.length} ${K==='UC'?'UC':'UFCD'}</span><span class="sp1"></span><button type="button" class="btn sm" data-fxo>${ic('check',13)} Todas as Obrigatórias</button><button type="button" class="btn sm" data-fxn>Nenhuma</button></div>
      <div class="tblw cnqt"><table class="lst"><thead><tr><th scope="col"><span class="a11y-sr">Selecionar</span></th><th scope="col">Código</th><th scope="col">${K==='UC'?'Unidade de Competência (UC)':'UFCD'}</th><th scope="col">${K==='UC'?'Créditos':'Horas'}</th><th scope="col">Tipo</th></tr></thead><tbody>${U.map((u,i)=>`<tr><td><input type="checkbox" data-fxu="${i}" ${S0.has(u.cod)?'checked':''} aria-label="${esc(u.cod+' '+u.nome)}"></td><td class="nw"><b>${esc(u.cod)}</b></td><td>${esc(u.nome)}</td><td class="nw">${u.k==='UC'?String(u.cred).replace('.',',')+' pts':(u.horas!==''?u.horas+' h':'')}</td><td><span class="tag ${u.tipo==='O'?'':'mut'}">${u.tipo==='O'?'Obrigatória':'Opcional'}</span></td></tr>`).join('')}</tbody></table></div>
      <p class="hint" style="margin:6px 0 0">Selecionadas: <b>${U.filter(u=>S0.has(u.cod)).length}</b>${tot?' · '+(K==='UC'?'≈ ':'')+tot+' h':''}</p>${typeof api.rodape==='function'?api.rodape():(api.rodape||'')}`;
    const t2=box.querySelector('.cnqt');if(t2)t2.scrollTop=sc;
    box.querySelectorAll('[data-fxu]').forEach(ch=>ch.onchange=()=>{const u=U[+ch.dataset.fxu];api.set(u,ch.checked);manterPosicao(des)});
    box.querySelector('[data-fxo]').onclick=()=>{U.filter(u=>u.tipo==='O').forEach(u=>api.set(u,true));des()};box.querySelector('[data-fxn]').onclick=()=>{U.forEach(u=>api.set(u,false));des()}};
  box._des=des;des()}}
{const _mc=montarCNQ;montarCNQ=function(ta){const w=$('#nt-cursow');if(!w||w.hidden)return _mc.apply(this,arguments);if(!ta||ta.dataset.cnq)return;ta.dataset.cnq='1';const box=document.createElement('div');box.className='cnq cnqfx';ta.parentNode.insertBefore(box,ta);ta.rows=3;
  if(!ta.value.trim()&&ufcdAno().length&&ta.id!=='nt-mods'){ta.value=ufcdAno().map(u=>u.cod+';'+u.nome+';'+(u.horas||'')).join('\n');ta.dispatchEvent(new Event('input'))}
  const cod=l=>l.split(/;|\t/)[0].trim().replace(/^UFCD\s*/i,'');const linhas=()=>ta.value.split('\n').map(l=>l.trim()).filter(Boolean);
  cnqPainel(box,{cursoFixo:()=>NT_CUR?NT_CUR.id:null,sel:()=>new Set(linhas().map(cod)),set:(u,on)=>{const L=linhas().filter(l=>cod(l)!==u.cod);if(on)L.push(u.cod+';'+u.nome+';'+(u.horas||''));ta.value=L.join('\n');ta.dispatchEvent(new Event('input'))},rodape:'<label style="margin-top:8px">Unidades desta turma <span class="mut">(também pode escrever à mão: código ; designação ; horas)</span></label>'})}}
{const _nt3=novaTurmaDlg;novaTurmaDlg=function(r){NT_CUR=null;const res=_nt3.apply(this,arguments);try{
  const nm=$('#nt-nome');if(nm&&!$('#nt-cod')){const cell=nm.closest('div');cell.insertAdjacentHTML('afterend',`<div><label for="nt-cod">Código interno <span class="mut">(opcional)</span></label><input id="nt-cod" placeholder="ex.: TTUR2324" autocapitalize="characters"></div>`);const g=cell.parentElement;if(g&&g.classList.contains('g2'))g.classList.replace('g2','g3')}
  const ci=$('#nt-curso');if(ci){const lb=ci.previousElementSibling;if(lb&&lb.tagName==='LABEL')lb.textContent='Nome do curso na escola'}
  /* o seletor de curso alimenta as unidades (UFCD/UC) sem segundo seletor */
  const w=$('#nt-cursow');if(w){const obs=new MutationObserver(()=>{});obs.disconnect()}
  const ok=$('#nt-ok');if(ok){const orig=ok.onclick;ok.onclick=function(){const a0=A();const ids=new Set(a0?a0.turmas.map(t=>t.id):[]);const cod=(($('#nt-cod')||{}).value||'').trim();const rr=orig.apply(this,arguments);const a=A();if(a&&cod){a.turmas.filter(t=>!ids.has(t.id)).forEach(t=>t.codigo=cod);save()}return rr}}
  }catch(e){console.warn(e)}return res}}
/* captar o curso escolhido no seletor da Nova Turma */
document.addEventListener('change',e=>{const s=e.target;if(!s.matches||!s.matches('#nt-cursow [data-cnqc]'))return;const M=cnqM();NT_CUR=M.cursos.find(x=>String(x.id)===s.value)||null;setTimeout(()=>{$$('#dw-b .cnqfx').forEach(b=>{const bx=b;if(bx._des)bx._des()})},30)},true);
/* código interno visível na lista de turmas e em Editar Turma */
/* ---- produção oral: só quando os critérios têm uma componente oral; lança no instrumento ---- */
const RX_ORAL=/oral|oralidade|\bPO\b|\bCO\b|\bIO\b|intera[cç][aã]o/i;
let domOral=t=>t&&(t.dominios||[]).find(d=>/produ[cç][aã]o.*oral|intera[cç][aã]o.*oral|oral/i.test(d.nome||'')||/^(PO|IO|PIO|O)$/i.test(d.ab||''))||(t&&(t.dominios||[]).find(d=>RX_ORAL.test((d.nome||'')+' '+(d.ab||''))));
function navOral(){const t=T();const tem=!!domOral(t);$$('#side [data-v="oral"],#tnavHold [data-v="oral"]').forEach(b=>{b.hidden=!tem;b.style.display=tem?'':'none'})}
{const _g4=go;go=function(v){if(v==='oral'&&T()&&!domOral(T())){toast('Os critérios desta turma não têm uma componente oral (Critérios › Domínios).');v='criterios'}const r=_g4.call(this,v);try{navOral()}catch(_){}return r}}
function oralSync(t){const o=oralM(t);const dom=domOral(t);if(!dom)return null;const per=o.per||perAtual(t);let i=o.inst&&t.instrumentos.find(x=>x.id===o.inst);
  const al=alunosAval(t);const algum=al.some(a=>{const r=o.regs[a.id];return r&&r.n&&ORAL_P.some(p=>r.n[p.k])});if(!i&&!algum)return null;
  if(!i){i={id:uid(),nome:'Produção Oral',tipo:'Prova Oral',periodo:per,data:o.data||isoHoje(),itens:[],notas:{},oral:true};t.instrumentos.push(i);o.inst=i.id}
  i.periodo=per;if(o.data)i.data=o.data;const c=o.cfg;
  i.itens=ORAL_P.map((p,k)=>{const ex=(i.itens||[]).find(x=>x.oral===p.k);return {id:ex?ex.id:uid()+k,rot:p.n,dom:dom.id,cot:oralMax(c,p.k),oral:p.k}});
  al.forEach(a=>{const r=o.regs[a.id];if(!r||!r.n||!ORAL_P.some(p=>r.n[p.k])){delete i.notas[a.id];return}const n=i.notas[a.id]={};i.itens.forEach(it=>{const nv=r.n[it.oral];if(nv)n[it.id]=oralPts(c,it.oral,nv)})});return i}
{const _vo=vOral;vOral=function(){const t=T();if(t&&!domOral(t)){$('#view').innerHTML=`<div class="card empty">${ic('fala',30)}<br><b>Os critérios desta turma não têm componente oral</b><br><span class="mut">A produção oral aparece quando os domínios incluem a oralidade (ex.: “Produção e Interação Oral”, PO, CO).</span><div class="row" style="justify-content:center;margin-top:12px"><button class="btn pri" data-goview="criterios">${ic('sliders',15)} Abrir Critérios</button></div></div>`;return}
  const r=_vo.apply(this,arguments);try{const o=oralM(t);const dom=domOral(t);const P=periodos();const i=oralSync(t);save();
    const card=[...document.querySelectorAll('#view .card')].find(c=>/Ficha de Registo/.test(c.textContent));if(card){card.querySelector('.hint').insertAdjacentHTML('afterend',`<div class="orsync"><span>${ic('link',14)} Os totais entram na avaliação no domínio <b>${esc(dom.nome)}</b> (${esc(dom.ab||'')} · ${dom.peso}%) como o instrumento <b>“Produção Oral”</b> do</span><select id="or-per" aria-label="Período do instrumento">${P.map(p=>`<option value="${p}" ${(o.per||perAtual(t))==p?'selected':''}>${perNome(p)}</option>`).join('')}</select>${i?`<button type="button" class="btn sm" data-goview="instrumentos">${ic('clipboard',13)} Ver Instrumento</button>`:'<span class="mut">— criado ao registar o primeiro aluno.</span>'}</div>`);
      const ps=$('#or-per');if(ps)ps.onchange=()=>{o.per=+ps.value;oralSync(t);save();toast('Instrumento no '+perNome(o.per),'ok')}}
    $$('[data-orn]').forEach(b=>b.addEventListener('click',()=>{oralSync(t);save()}));
  }catch(e){console.warn(e)}return r}}
{const _ov=oralValidar;oralValidar=async function(t,depois){return _ov.call(this,t,()=>{try{oralSync(t);save()}catch(_){}depois&&depois()})}}
setTimeout(()=>{try{navOral()}catch(_){}},0);

/* data de nascimento do professor (guardada no perfil) */
document.addEventListener('change',e=>{const el=e.target;if(!el||!el.matches||!el.matches('[data-pf="nascimento"]'))return;const p=perfil();p.nascimento=el.value;S.cfg.perfil=p;if(p.nascimento&&p.nascimento.slice(5)===isoHoje().slice(5))S.cfg.parabensVisto='';save();audit('Professor','Perfil alterado','nascimento');toast(el.value?'Data de nascimento guardada':'Data de nascimento removida','ok')});

