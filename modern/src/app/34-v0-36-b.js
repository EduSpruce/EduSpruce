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

/* ---------- Horário da turma: grelha nova (blocos contínuos, turnos lado a lado, cor por disciplina) ---------- */
/* 0.924 · cor por disciplina: tons fixos e bem separados para as disciplinas habituais (antes várias saíam no mesmo verde) */
const COR_DISC=[[/^(PORT|PT|LP|PLNM)/,215],[/^MAT|^MACS/,28],[/^(ING|LE ?I(?!I)|LEI\b)/,195],[/^(FRAN|LE ?II|LEII|ALEM|ESP|FR\b)/,338],[/^FIL/,258],[/^(EF|ED\.? ?F)/,46],[/^(BIO|CN|CIEN|BG)/,138],[/^(FQ|FIS|QUI|CFQ)/,2],[/^(HIST|HGP|HCA)/,178],[/^GEO/,292],[/^(TIC|INF|APLIC|AI\b|PROG)/,88],[/^(EV|ET|EDV|DES|GD|ART|HCA)/,318],[/^(MUS|EM\b)/,272],[/^(EMRC|EMR|REL)/,60],[/^(CID|DAC|OF|OC)/,160],[/^(ECON|ECO|SOC|PSI)/,232]];
const corSigla=ab=>{const k=String(ab||'').trim().toUpperCase();for(const [r,h] of COR_DISC)if(r.test(k))return h;let h=0;for(const c of k)h=(h*31+c.charCodeAt(0))%997;return [8,22,52,72,105,120,150,168,205,225,245,265,282,305,328,350][h%16]};
function grelhaTurma(aulas,o){o=o||{};if(!aulas.length)return '<div class="empty">Sem aulas.</div>';
  const ds=[1,2,3,4,5,...(aulas.some(a=>a.dia===6)?[6]:[])];const S_=[];aulas.forEach(a=>{if(!S_.some(s=>s.ini===a.ini))S_.push({ini:a.ini,fim:a.fim})});S_.sort((x,y)=>x.ini-y.ini);
  /* linhas: tempos + intervalos (≥15 min) */
  const R=[];S_.forEach((s,i)=>{if(i&&s.ini-S_[i-1].fim>=15)R.push({pausa:true,ini:S_[i-1].fim,fim:s.ini});R.push(s)});
  const rowDe=ini=>R.findIndex(r=>!r.pausa&&r.ini===ini);
  const hoje=new Date().getDay(),mins=new Date().getHours()*60+new Date().getMinutes();
  const chave=L=>L.map(a=>a.ab+'@'+(a.sala||'')).sort().join('|');
  let blocos='';
  ds.forEach((d,ci)=>{let i=0;while(i<R.length){const r=R[i];if(r.pausa){i++;continue}const L=aulas.filter(a=>a.dia===d&&a.ini===r.ini);if(!L.length){i++;continue}
    /* junta tempos seguidos com as mesmas aulas */
    let j=i,k=chave(L);while(true){let n=j+1;if(n<R.length&&R[n].pausa)break;if(n>=R.length)break;const L2=aulas.filter(a=>a.dia===d&&a.ini===R[n].ini);if(!L2.length||chave(L2)!==k)break;j=n}
    const ini=r.ini,fim=R[j].fim;const now=d===hoje&&ini<=mins&&fim>mins;const n=j-i+1;
    blocos+=`<div class="htb ${now?'agora':''}" style="grid-column:${ci+2};grid-row:${i+2}/${j+3}">${L.map(a=>{const m=o.minha&&o.minha(a);return `<div class="htc ${m?'minha':''}" style="--h:${corSigla(a.ab)}" title="${esc((o.titulo?o.titulo(a):a.ab)+' · '+fmtHM(ini)+'–'+fmtHM(fim)+(a.sala?' · Sala '+a.sala:''))}"><b>${esc(a.ab)}</b>${a.sala?`<span class="hts">${esc(a.sala)}</span>`:''}${n>1?`<span class="htt">${fmtHM(ini)}–${fmtHM(fim)}</span>`:''}</div>`}).join('')}</div>`;i=j+1}});
  const cab=`<div class="hth hhd"></div>${ds.map((d,ci)=>`<div class="hth ${d===hoje?'hj':''}" style="grid-column:${ci+2}">${DIAS[d]}</div>`).join('')}`;
  const tms=R.map((r,i)=>r.pausa?`<div class="htp" style="grid-row:${i+2};grid-column:1/-1"><span>${r.fim-r.ini>=45?'Almoço':'Intervalo'} · ${fmtHM(r.ini)}–${fmtHM(r.fim)}</span></div>`:`<div class="htm" style="grid-row:${i+2}"><b>${fmtHM(r.ini)}</b><span>${fmtHM(r.fim)}</span></div>`).join('');
  const fundos=R.map((r,i)=>r.pausa?'':ds.map((d,ci)=>`<div class="htf ${d===hoje?'hj':''}" style="grid-row:${i+2};grid-column:${ci+2}"></div>`).join('')).join('');
  const rows=R.map(r=>r.pausa?'22px':'minmax(54px,auto)').join(' ');
  return `<div class="htw" role="region" aria-label="Horário semanal" tabindex="0"><div class="htg" style="grid-template-columns:62px repeat(${ds.length},minmax(110px,1fr));grid-template-rows:auto ${rows}">${cab}${fundos}${tms}${blocos}</div></div>`}
{const _vh=vHorario;vHorario=function(){const r=_vh.apply(this,arguments);try{const t=T(),a=A();const h=horarioDe(a,UI.horC);if(!h)return r;
  const old=$('#view .card.wide div[style*="overflow:auto"]:has(> table.hor)')||($('#view table.hor')||{}).parentElement;if(!old)return r;
  const minhas=aulasTurma(t);const sig=t.horAbs&&t.horAbs.length?t.horAbs:siglasDaDisciplina(h,t.disciplina);
  const tit=x=>{const l=h.legenda.find(l=>l.ab===x.ab);return l?l.nome+(l.profs.length?' — '+l.profs.join(', '):''):x.ab};
  const wrap=document.createElement('div');wrap.innerHTML=grelhaTurma(h.aulas,{minha:x=>sig.includes(x.ab)&&(!minhas.some(m=>m.prof)||minhas.some(m=>m.dia===x.dia&&m.ini===x.ini)),titulo:tit});old.replaceWith(wrap.firstElementChild);
  const usadas=[...new Set(h.aulas.map(x=>x.ab))];const leg=h.legenda.filter(l=>usadas.includes(l.ab));
  const g=$('#view .htw');if(g&&leg.length)g.insertAdjacentHTML('afterend',`<div class="htleg">${leg.map(l=>`<span class="htl ${sig.includes(l.ab)?'minha':''}" style="--h:${corSigla(l.ab)}"><b>${esc(l.ab)}</b> ${esc(l.nome)}${l.profs.length?` <span class="mut">· ${esc(l.profs.map(p=>profNome(p)).join(', '))}</span>`:''}</span>`).join('')}</div>`);
  const lg=$('#view .card.wide .leg');if(lg)lg.innerHTML=`<span class="htl minha" style="--h:0;padding:2px 8px"><b>${esc(t.disciplina)}</b></span>`;
  }catch(e){console.warn(e)}return r}}

/* ecrãs muito largos: coluna à esquerda (Horário da turma: Aulas Previstas e Próximas Aulas) */
const LADO_ESQ={horario:[/^Aulas Previstas/,/^Próximas Aulas/]};
{const _ll=layoutLado;layoutLado=function(){const r=_ll.apply(this,arguments);try{const v=$('#view');const lay=v&&v.querySelector(':scope>.vlay');const R=LADO_ESQ[VIEW];
  if(!lay||!R)return r;let esq=lay.querySelector(':scope>.vesq');const larga=v.clientWidth>=1780;
  const cards=[...lay.querySelectorAll(':scope>.vside>.card,:scope>.vmain>.card,:scope>.vesq>.card')].filter(c=>{const h=c.querySelector('h2');return h&&R.some(x=>x.test(h.textContent.trim()))});
  if(larga){if(!esq){esq=document.createElement('div');esq.className='vesq';lay.prepend(esq)}cards.forEach(c=>{if(c.parentElement!==esq)esq.appendChild(c)});lay.classList.add('vlay3')}
  else if(esq){const s=lay.querySelector(':scope>.vside');cards.forEach(c=>s&&s.appendChild(c));esq.remove();lay.classList.remove('vlay3')}}catch(e){console.warn(e)}return r}}
addEventListener('resize',()=>{clearTimeout(layoutLado._e);layoutLado._e=setTimeout(()=>{try{layoutLado()}catch(_){}},120)});

/* Nova Turma (curso profissional): disciplina principal e outras disciplinas do ensino profissional */
function ntProfDisc(){const sd=$('#nt-disc');const b=$('#nt-ofw [data-of].on');const of=b?b.dataset.of:'regular';if(!sd)return;
  if(of==='profissional'){if(!sd.dataset.orig)sd.dataset.orig=sd.innerHTML;const todos=DISC_PROF.flatMap(([g,L])=>L.map(n=>[g,n]));const meus=todos.filter(([,n])=>discAno().includes(discKey(n,'sec')));const L=meus.length?meus:todos;const cur=sd.value;
    sd.innerHTML=DISC_PROF.map(([g])=>{const X=L.filter(x=>x[0]===g);return X.length?`<optgroup label="Componente ${esc(g)}">${X.map(([,n])=>`<option value="${esc(discKey(n,'sec'))}">${esc(n)}</option>`).join('')}</optgroup>`:''}).join('')+'<option value="__outra">Outra…</option>';
    if([...sd.options].some(o=>o.value===cur))sd.value=cur;sd.dispatchEvent(new Event('change'))}
  else if(sd.dataset.orig){sd.innerHTML=sd.dataset.orig;delete sd.dataset.orig;sd.dispatchEvent(new Event('change'))}}
{const _nt4=novaTurmaDlg;novaTurmaDlg=function(r){const res=_nt4.apply(this,arguments);try{const ow=$('#nt-ofw');if(ow)ow.addEventListener('click',()=>setTimeout(ntProfDisc,20));setTimeout(ntProfDisc,30);
  const lb=$('#nt-modw label');if(lb)lb.innerHTML='Módulos / UFCD / UC desta turma <span class="mut">(da disciplina que leciona — marque no quadro do curso ou escreva: código ; designação ; horas)</span>'}catch(e){console.warn(e)}return res}}

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tvadd]');if(!b)return;e.preventDefault();go('turmas');setTimeout(()=>{const c=[...document.querySelectorAll('#view .card')].find(x=>x.querySelector('#t-pdf,#t-new'));if(c){c.scrollIntoView({behavior:'smooth',block:'start'});const f=c.querySelector('#t-pdf')||c.querySelector('#t-new');if(f)f.focus({preventScroll:true})}},150)});

/* Barra lateral: turmas com várias disciplinas agrupadas (uma linha por turma, disciplinas como sub-escolha) */
navTurmas=function(){const tree=$('#tTree'),hold=$('#tnavHold'),hd=$('#navTurmas');if(!tree||!hold||!hd)return;
  const a=A();const TF=a?turmasFiltradas(a):[];const ab=S.cfg.navTurmas!==false;
  const exp=S.turmaAtiva&&UI.navTFech!==S.turmaAtiva?S.turmaAtiva:null;
  hd.classList.toggle('aberto',ab);hd.setAttribute('aria-expanded',String(ab));hd.querySelector('.chev').innerHTML=ic('chev',13);
  const kids=[...document.querySelectorAll('#side .tnav')];kids.forEach(k=>hold.appendChild(k));
  const gT=$('#grpT');const uma=TF.length===1;hd.style.display=uma?'none':'';if(gT)gT.style.display=uma?'':'none';tree.classList.toggle('uma',uma);
  if(uma){const t=TF[0];if(S.turmaAtiva!==t.id){S.turmaAtiva=t.id}if(gT)gT.innerHTML=anoBadge(t,'sm')+' Turma '+esc(t.nome);tree.innerHTML='';kids.forEach(k=>{tree.appendChild(k);k.disabled=false});navModular();return}
  if(!ab){tree.innerHTML='';return}
  if(!TF.length){tree.innerHTML='<div class="tvazio"><span class="lbl">Sem turmas</span><button type="button" class="btn sm tvadd" data-tvadd title="Adicionar turma">'+ic('plus',14)+'<span class="lbl">Adicionar Turma</span></button></div>';return}
  /* agrupar por turma (nome + escola) mantendo a ordem */
  const G=[];TF.forEach(t=>{const k=t.nome+'|'+escId(escolaDe(t));let g=G.find(x=>x.k===k);if(!g){g={k,nome:t.nome,L:[]};G.push(g)}g.L.push(t)});
  tree.innerHTML=G.map(g=>{const t0=g.L[0];
    if(g.L.length===1){const t=t0;return `<button class="nav tnode ${t.id===exp?'aberto':''} ${t.id===S.turmaAtiva?'cur':''}" data-tt="${t.id}" title="${esc(t.nome+' · '+t.disciplina)}" aria-expanded="${t.id===exp}">${anoBadge(t,'sm')}<span class="lbl"><b>${esc(t.nome)}</b><span class="tdisc">${esc(t.disciplina)}</span></span><span class="chev">${ic('chev',12)}</span></button><div class="tkids" data-tk="${t.id}"></div>`}
    const ativa=g.L.find(t=>t.id===S.turmaAtiva);const aberto=!!(ativa&&exp===ativa.id);
    return `<button class="nav tnode tgrp ${aberto?'aberto':''} ${ativa?'cur':''}" data-tgk="${esc(g.k)}" title="${esc(g.nome+' · '+g.L.map(t=>t.disciplina).join(', '))}" aria-expanded="${aberto}">${anoBadge(t0,'sm')}<span class="lbl"><b>${esc(g.nome)}</b><span class="tdisc">${ativa&&aberto?esc(ativa.disciplina):g.L.length+' disciplinas'}</span></span><span class="tcnt" aria-hidden="true">${g.L.length}</span><span class="chev">${ic('chev',12)}</span></button>
      ${aberto?`<div class="tdsel" role="radiogroup" aria-label="Disciplina em ${esc(g.nome)}">${g.L.map(t=>`<button type="button" role="radio" aria-checked="${t.id===S.turmaAtiva}" class="tdsb ${t.id===S.turmaAtiva?'on':''}" data-tt="${t.id}" title="${esc(t.disciplina)}"><span class="tdd" style="--h:${corSigla(siglaDe(t))}"></span><span class="lbl">${esc(t.disciplina)}</span></button>`).join('')}</div><div class="tkids" data-tk="${ativa.id}"></div>`:''}`}).join('');
  if(exp){const box=tree.querySelector(`[data-tk="${exp}"]`);if(box)kids.forEach(k=>box.appendChild(k))}
  const escolhe=id=>{if(S.turmaAtiva===id&&UI.navTFech!==id){UI.navTFech=id;navTurmas();return}
    UI.navTFech=null;const menu=document.body.classList.contains('menu');
    if(S.turmaAtiva!==id){S.turmaAtiva=id;save();UI.inst=null;go('painel')}else{navTurmas();if(VIEW!=='painel'&&!NEEDS_T.includes(VIEW))go('painel')}
    if(menu)document.body.classList.add('menu');const box=tree.querySelector(`[data-tk="${id}"]`);if(box&&box.animate)box.animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'none'}],{duration:180,easing:'ease-out'})};
  tree.querySelectorAll('.tnode[data-tt]').forEach(b=>b.onclick=()=>escolhe(b.dataset.tt));
  tree.querySelectorAll('.tdsb[data-tt]').forEach(b=>b.onclick=()=>{const id=b.dataset.tt;if(S.turmaAtiva===id)return;UI.navTFech=null;escolhe(id)});
  tree.querySelectorAll('[data-tgk]').forEach(b=>b.onclick=()=>{const g=G.find(x=>x.k===b.dataset.tgk);const ativa=g.L.find(t=>t.id===S.turmaAtiva);if(ativa)escolhe(ativa.id);else{UI.navTFech=null;escolhe(g.L[0].id)}})};
setTimeout(()=>{try{navTurmas()}catch(_){}},0);

/* Código interno obrigatório nas turmas de curso profissional */
{const _nt5=novaTurmaDlg;novaTurmaDlg=function(r){const res=_nt5.apply(this,arguments);try{const of=()=>{const b=$('#nt-ofw [data-of].on');return b?b.dataset.of:'regular'};
  const rot=()=>{const lb=$('label[for="nt-cod"]');const i=$('#nt-cod');if(!lb||!i)return;const pr=of()==='profissional';lb.innerHTML=pr?'Código interno <span class="obr" aria-hidden="true">*</span>':'Código interno <span class="mut">(opcional)</span>';i.required=pr;i.setAttribute('aria-required',pr?'true':'false')};
  rot();const ow=$('#nt-ofw');if(ow)ow.addEventListener('click',()=>setTimeout(rot,30));
  const ok=$('#nt-ok');if(ok){const orig=ok.onclick;ok.onclick=function(){const i=$('#nt-cod');if(of()==='profissional'&&i&&!i.value.trim()){i.classList.add('erro');i.focus();toast('Indique o código interno da turma (obrigatório nos cursos profissionais).','erro');return}return orig.apply(this,arguments)}}
  const i=$('#nt-cod');if(i)i.addEventListener('input',()=>i.classList.remove('erro'))}catch(e){console.warn(e)}return res}}

/* introdução de códigos: teclado numérico com pontos (substitui as caixas do browser) */
function pinDialog(o){o=o||{};const N=o.n||4;return new Promise(res=>{let v='';let ocup=false;const d=document.createElement('dialog');d.className='pindlg';d.setAttribute('aria-labelledby','pd-t');d.setAttribute('aria-describedby','pd-s');
  const teclas=['1','2','3','4','5','6','7','8','9','x','0','⌫'];
  d.innerHTML=`<div class="pdh"><span class="pdi">${ic('shield',26)}</span><h2 id="pd-t">${esc(o.t||'Código')}</h2><p id="pd-s" class="mut">${esc(o.s||'')}</p></div>
    <div class="pdots" role="status" aria-live="polite" aria-label="0 de ${N} algarismos">${Array.from({length:N},()=>'<i></i>').join('')}</div><p class="pderr" role="alert"></p>
    <div class="pdk">${teclas.map(k=>k==='x'?`<button type="button" class="pdc" data-pk="x" aria-label="Cancelar">Cancelar</button>`:k==='⌫'?`<button type="button" class="pdb" data-pk="b" aria-label="Apagar">${ic('arrowL',22)||'⌫'}</button>`:`<button type="button" data-pk="${k}">${k}</button>`).join('')}</div>`;
  document.body.appendChild(d);const dots=d.querySelector('.pdots'),er=d.querySelector('.pderr');
  const pinta=()=>{dots.querySelectorAll('i').forEach((x,i)=>x.classList.toggle('on',i<v.length));dots.setAttribute('aria-label',v.length+' de '+N+' algarismos')};
  const fim=x=>{try{d.close()}catch(_){}d.remove();document.removeEventListener('keydown',kb,true);res(x)};
  const abana=m=>{er.textContent=m||'';dots.classList.remove('abana');void dots.offsetWidth;dots.classList.add('abana');if(navigator.vibrate)try{navigator.vibrate(120)}catch(_){}};
  const tecla=async k=>{if(ocup)return;if(k==='x')return fim(null);if(k==='b'){v=v.slice(0,-1);pinta();return}if(v.length>=N)return;v+=k;er.textContent='';pinta();
    if(v.length===N){ocup=true;await new Promise(r=>setTimeout(r,140));const ok=o.verifica?await o.verifica(v):true;if(ok){dots.classList.add('ok');setTimeout(()=>fim(v),160)}else{abana(o.erro||'Código incorreto.');setTimeout(()=>{v='';pinta()},380)}ocup=false}};
  const kb=e=>{if(!d.isConnected)return;if(e.target&&e.target.closest&&e.target.closest('dialog')!==d&&(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.closest('dialog')))return;if(/^\d$/.test(e.key)){e.preventDefault();tecla(e.key)}else if(e.key==='Backspace'){e.preventDefault();tecla('b')}else if(e.key==='Escape'){e.preventDefault();fim(null)}};document.addEventListener('keydown',kb,true);
  d.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{tecla(b.dataset.pk);b.classList.remove('prem');void b.offsetWidth;b.classList.add('prem')});d.addEventListener('cancel',e=>{e.preventDefault();fim(null)});
  try{d.showModal()}catch(_){d.setAttribute('open','')}const f=d.querySelector('[data-pk="1"]');if(f)f.focus()})}
if(!ICONS.arrowL)ICONS.arrowL='<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="M17 9l-6 6M11 9l6 6"/>';


/* =====================================================================
   Sincronização na nuvem — OneDrive (Microsoft 365) e Google Drive
   dados divididos por partes (geral, ano, turma, auditoria, fotografias),
   encriptados no dispositivo (AES-256-GCM), junção por parte entre dispositivos
   ===================================================================== */
const NV_KEY='edugest.nuvem',NV_CONF='edugest.nuvem.conf',NV_PREF='ef-';
const nvL=()=>{try{return JSON.parse(localStorage.getItem(NV_KEY)||'{}')}catch(_){return {}}};
const nvSet=o=>{const x={...nvL(),...o};try{localStorage.setItem(NV_KEY,JSON.stringify(x))}catch(_){}return x};
const nvHash=s=>{let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (h2>>>0).toString(36)+(h1>>>0).toString(36)};
const NV_LOCAIS=['anoAtivo','turmaAtiva','escolaAtiva','filtroOferta','_ts'];const NV_CFG_LOC=['gsync','sazForcar'];
const nvDisp=()=>{let d=nvL().disp;if(!d){d=(/iPad/.test(navigator.userAgent)||navigator.maxTouchPoints>1&&/Mac/.test(navigator.userAgent)?'iPad':/iPhone/.test(navigator.userAgent)?'iPhone':/Mac/.test(navigator.platform)?'Mac':/Win/.test(navigator.platform)?'Windows':'Browser')+' '+Math.random().toString(36).slice(2,6);nvSet({disp:d})}return d};
/* --- partes --- */
function nvPartes(){const P={};const st=JSON.parse(JSON.stringify(S));const g={};Object.keys(st).forEach(k=>{if(!NV_LOCAIS.includes(k)&&k!=='anos'&&k!=='audit')g[k]=st[k]});g.cfg={...(st.cfg||{})};NV_CFG_LOC.forEach(k=>delete g.cfg[k]);
  g.anosOrdem=(st.anos||[]).map(a=>a.id);P.geral=g;(st.anos||[]).forEach(a=>{const o={...a};o.turmasOrdem=(a.turmas||[]).map(t=>t.id);delete o.turmas;P['ano-'+a.id]=o;(a.turmas||[]).forEach(t=>{P['turma-'+t.id]={...t,_ano:a.id}})});P.audit=st.audit||[];return P}
function nvMontar(P){const g=P.geral||{};const st={...g};delete st.anosOrdem;const anoIds=[...new Set([...(g.anosOrdem||[]),...Object.keys(P).filter(k=>k.startsWith('ano-')).map(k=>k.slice(4))])];
  st.anos=anoIds.map(id=>{const a=P['ano-'+id];if(!a)return null;const o={...a};const ord=o.turmasOrdem||[];delete o.turmasOrdem;const tids=[...new Set([...ord,...Object.keys(P).filter(k=>k.startsWith('turma-')&&P[k]._ano===id).map(k=>k.slice(6))])];
    o.turmas=tids.map(tid=>{const t=P['turma-'+tid];if(!t||t._ano!==id)return null;const x={...t};delete x._ano;return x}).filter(Boolean);return o}).filter(Boolean);
  st.audit=P.audit||[];NV_LOCAIS.forEach(k=>{if(S[k]!==undefined)st[k]=S[k]});st.cfg={...(st.cfg||{})};NV_CFG_LOC.forEach(k=>{if(S.cfg[k]!==undefined)st.cfg[k]=S.cfg[k]});
  if(!st.anoAtivo||!st.anos.some(a=>a.id===st.anoAtivo))st.anoAtivo=(st.anos[st.anos.length-1]||{}).id||null;{const an=st.anos.find(a=>a.id===st.anoAtivo);if(an&&(!st.turmaAtiva||!an.turmas.some(t=>t.id===st.turmaAtiva)))st.turmaAtiva=(an.turmas[0]||{}).id||null}return st}
const nvNomeF=id=>NV_PREF+'f-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'_')+'.bin';
/* --- encriptação --- */
let _nvK=null;
async function nvChaveDe(pw,saltB64){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:unb64(saltB64),iterations:210000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},true,['encrypt','decrypt'])}
async function nvChave(){if(_nvK)return _nvK;const L=nvL();if(L.k){_nvK=await crypto.subtle.importKey('raw',unb64(L.k),'AES-GCM',false,['encrypt','decrypt']);return _nvK}return null}
async function nvGuardarChave(k){const raw=await crypto.subtle.exportKey('raw',k);nvSet({k:b64(raw)});_nvK=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt'])}
async function nvZip(txt){if(!window.CompressionStream)return {z:0,b:new TextEncoder().encode(txt)};const s=new Blob([txt]).stream().pipeThrough(new CompressionStream('gzip'));return {z:1,b:new Uint8Array(await new Response(s).arrayBuffer())}}
async function nvUnzip(u,z){if(!z)return new TextDecoder().decode(u);const s=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));return await new Response(s).text()}
async function nvCifrar(txt,k){const {z,b}=await nvZip(txt);const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},k||await nvChave(),b);return 'EF1.'+z+'.'+b64(iv)+'.'+b64(ct)}
async function nvDecifrar(s,k){const p=String(s).split('.');if(p[0]!=='EF1')throw new Error('Ficheiro desconhecido na nuvem');const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(p[2])},k||await nvChave(),unb64(p[3]));return await nvUnzip(new Uint8Array(pt),+p[1])}
/* --- fornecedores --- */
let MS_SCOPE='Files.ReadWrite.AppFolder User.Read offline_access';const MS_AUTH='https://login.microsoftonline.com/common/oauth2/v2.0';const MS_G='https://graph.microsoft.com/v1.0/me/drive/special/approot';
const nvRedirect=()=>location.origin+location.pathname.replace(/index\.html?$/i,'').replace(/^\/app\/$/,'/').replace(/([^/])$/,'$1/');
const nvHttps=()=>/^https:/.test(location.protocol)||/^http:\/\/(localhost|127\.0\.0\.1)/.test(location.href);
async function pkce(){const v=b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return {v,c:b64(d).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}}
/* janela de autorização Microsoft: volta a esta página com ?code= e entrega-o à janela principal */
(()=>{try{const q=new URLSearchParams(location.search);const st=q.get('state')||'';if(st.startsWith('nvms')&&!st.startsWith('nvmsR')&&window.opener){window.opener.postMessage({nvms:{code:q.get('code'),state:st,error:q.get('error_description')||q.get('error')}},location.origin);document.documentElement.innerHTML='<p style="font:16px system-ui;padding:24px">A ligar ao OneDrive… pode fechar esta janela.</p>';setTimeout(()=>window.close(),300)}}catch(_){}})();
async function msLigar(){const L=nvL();if(!L.msId)throw new Error('Indique o ID da aplicação (cliente) da Microsoft.');if(!nvHttps())throw new Error('A ligação ao OneDrive precisa que a app esteja num endereço https (servidor web).');
  const {v,c}=await pkce();const state='nvms'+Math.random().toString(36).slice(2);const url=`${MS_AUTH}/authorize?client_id=${encodeURIComponent(L.msId)}&response_type=code&redirect_uri=${encodeURIComponent(nvRedirect())}&response_mode=query&scope=${encodeURIComponent(MS_SCOPE)}&state=${state}&code_challenge=${c}&code_challenge_method=S256&prompt=select_account`;
  const w=window.open(url,'nvms','width=520,height=700');if(!w)throw new Error('Permita janelas pop-up para ligar ao OneDrive.');
  const code=await new Promise((ok,ko)=>{const t=setInterval(()=>{if(w.closed){clearInterval(t);removeEventListener('message',m);ko(new Error('Janela da Microsoft fechada.'))}},700);const m=e=>{if(e.origin!==location.origin||!e.data||!e.data.nvms)return;const r=e.data.nvms;if(r.state!==state)return;clearInterval(t);removeEventListener('message',m);if(r.error||!r.code)ko(new Error(r.error||'Sem autorização'));else ok(r.code)};addEventListener('message',m)});
  const r=await fetch(MS_AUTH+'/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:L.msId,grant_type:'authorization_code',code,redirect_uri:nvRedirect(),code_verifier:v,scope:MS_SCOPE})});const j=await r.json();if(!j.access_token)throw new Error(j.error_description||'Não foi possível ligar ao OneDrive');
  nvSet({ms:{at:j.access_token,rt:j.refresh_token,exp:Date.now()+(+j.expires_in||3600)*1000}});try{const me=await (await fetch('https://graph.microsoft.com/v1.0/me',{headers:{Authorization:'Bearer '+j.access_token}})).json();nvSet({conta:me.mail||me.userPrincipalName||''})}catch(_){}}
async function msTok(){const L=nvL();const m=L.ms;if(!m)throw new Error('OneDrive não ligado');if(m.exp>Date.now()+60000)return m.at;if(!m.rt)throw new Error('Sessão do OneDrive expirada — volte a ligar.');
  const r=await fetch(MS_AUTH+'/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:L.msId,grant_type:'refresh_token',refresh_token:m.rt,scope:MS_SCOPE})});const j=await r.json();if(!j.access_token){nvSet({ms:null});throw new Error('Sessão do OneDrive expirada — volte a ligar.')}nvSet({ms:{at:j.access_token,rt:j.refresh_token||m.rt,exp:Date.now()+(+j.expires_in||3600)*1000}});return j.access_token}
async function msF(path,opt){const t=await msTok();const r=await fetch(path,{...(opt||{}),headers:{...((opt||{}).headers||{}),Authorization:'Bearer '+t}});return r}
const PROV={
  onedrive:{n:'OneDrive',async lista(){const out={};let u=MS_G+':/EduFlow:/children?$select=name,size&$top=999';while(u){const r=await msF(u);if(r.status===404)return out;if(!r.ok)throw new Error('OneDrive: erro '+r.status);const j=await r.json();(j.value||[]).forEach(f=>out[f.name]=f.size||0);u=j['@odata.nextLink']}return out},
    async ler(n){const r=await msF(MS_G+':/EduFlow/'+encodeURIComponent(n)+':/content');if(r.status===404)return null;if(!r.ok)throw new Error('OneDrive: erro '+r.status+' ao ler '+n);return await r.text()},
    async escrever(n,txt){const r=await msF(MS_G+':/EduFlow/'+encodeURIComponent(n)+':/content',{method:'PUT',headers:{'Content-Type':'text/plain'},body:txt});if(!r.ok)throw new Error('OneDrive: erro '+r.status+' ao guardar '+n)},
    async apagar(n){const r=await msF(MS_G+':/EduFlow/'+encodeURIComponent(n),{method:'DELETE'});if(!r.ok&&r.status!==404)throw new Error('OneDrive: erro '+r.status)}},
  google:{n:'Google Drive',_ids:null,async _mapa(f){if(this._ids&&!f)return this._ids;const m={};let tok='';do{const r=await gsFetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&pageSize=1000&fields=nextPageToken,files(id,name,size)'+(tok?'&pageToken='+tok:''));const j=await r.json();(j.files||[]).forEach(x=>{if(x.name.startsWith(NV_PREF))m[x.name]={id:x.id,s:+x.size||0}});tok=j.nextPageToken||''}while(tok);this._ids=m;return m},
    async lista(){const m=await this._mapa(true);const o={};Object.entries(m).forEach(([k,v])=>o[k]=v.s);return o},
    async ler(n){let m=await this._mapa();let f=m[n];if(!f&&!this._fresco){m=await this._mapa(true);f=m[n];this._fresco=1;setTimeout(()=>{this._fresco=0},4000)}if(!f)return null;const r=await gsFetch('https://www.googleapis.com/drive/v3/files/'+f.id+'?alt=media');return await r.text()},
    async escrever(n,txt){const m=await this._mapa();const f=m[n];if(f){await gsFetch('https://www.googleapis.com/upload/drive/v3/files/'+f.id+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':'text/plain'},body:txt});return}
      const b='ef'+Math.random().toString(36).slice(2);const body=`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:n,parents:['appDataFolder']})}\r\n--${b}\r\nContent-Type: text/plain\r\n\r\n${txt}\r\n--${b}--`;
      const r=await gsFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body});const j=await r.json();m[n]={id:j.id,s:txt.length}},
    async apagar(n){const m=await this._mapa();const f=m[n];if(!f)return;await gsFetch('https://www.googleapis.com/drive/v3/files/'+f.id,{method:'DELETE'}).catch(()=>{});delete m[n]}}};
const nvProv=()=>PROV[nvL().prov]||null;
/* --- estado --- */
let _nvBusy=false,_nvT=null;
const nvEstadoTxt=t=>{const e=$('#nv-est');if(e)e.textContent=t;const b=$('#nv-badge');if(b)b.title='Nuvem: '+t};
const nvConflitos=()=>{try{return JSON.parse(localStorage.getItem(NV_CONF)||'[]')}catch(_){return []}};
const nvGuardaConflito=(parte,dados,de)=>{const L=nvConflitos();L.unshift({parte,q:Date.now(),de,dados});try{localStorage.setItem(NV_CONF,JSON.stringify(L.slice(0,12)))}catch(_){try{localStorage.setItem(NV_CONF,JSON.stringify(L.slice(0,3)))}catch(_){}}};
const nvRotulo=k=>{if(k==='geral')return 'Definições e dados gerais';if(k==='audit')return 'Auditoria';if(k.startsWith('ano-')){const a=S.anos.find(x=>x.id===k.slice(4));return 'Ano letivo '+(a?a.nome:'')}if(k.startsWith('turma-')){let t=null;S.anos.forEach(a=>a.turmas.forEach(x=>{if(x.id===k.slice(6))t=x}));return t?'Turma '+t.nome+' · '+t.disciplina:'Turma'}return k};
/* --- sincronizar --- */
/* junta dois estados JSON: listas de registos com id juntam-se por id, objetos campo a campo; em caso de valor diferente fica o de «b» (o mais recente) */
function nvJuntar(a,b){if(b===undefined)return a;if(a===undefined)return b;
  if(Array.isArray(a)&&Array.isArray(b)){const idd=x=>x&&typeof x==='object'&&x.id!=null?'i:'+x.id:null;
    if(a.length&&b.length&&a.every(idd)&&b.every(idd)){const M=new Map(a.map(x=>[idd(x),x]));const vis=new Set();const out=b.map(x=>{const k_=idd(x);vis.add(k_);return M.has(k_)?nvJuntar(M.get(k_),x):x});a.forEach(x=>{if(!vis.has(idd(x)))out.push(x)});return out}
    if(a.every(x=>x===null||typeof x!=='object')&&b.every(x=>x===null||typeof x!=='object')){const o=b.slice();a.forEach(x=>{if(!o.includes(x))o.push(x)});return o}
    return b}
  if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){const o={...a};Object.keys(b).forEach(k_=>{o[k_]=nvJuntar(a[k_],b[k_])});return o}
  return b}
async function nvPool(L,n,fn){let i=0;const w=async()=>{while(i<L.length){const x=L[i++];await fn(x)}};await Promise.all(Array.from({length:Math.min(n,L.length)},w))}
async function nvSincronizar(interativo){const prov=nvProv();if(!prov||_nvBusy)return null;const k=await nvChave();if(!k){if(interativo)toast('Defina a palavra-passe de encriptação da nuvem.','erro');return null}
  _nvBusy=true;nvEstadoTxt('a sincronizar…');const res={env:0,rec:0,conf:0,fotosEnv:0,fotosRec:0};
  try{const L=nvL();const base={...(L.base||{})};const primeira=!L.base;
    let manTxt=await prov.ler(NV_PREF+'manifest.json');let man=manTxt?JSON.parse(manTxt):null;
    if(man&&man.chk){try{if(await nvDecifrar(man.chk,k)!=='eduflow')throw 0}catch(_){throw new Error('A palavra-passe de encriptação não corresponde à dos dados na nuvem.')}}
    if(!man)man={v:1,salt:L.salt,chk:await nvCifrar('eduflow',k),partes:{},fotos:{},rev:0};man.partes=man.partes||{};man.fotos=man.fotos||{};
    const P=nvPartes();const loc={};Object.keys(P).forEach(n=>loc[n]=nvHash(JSON.stringify(P[n])));const mod=L.mod||{};
    const todos=new Set([...Object.keys(loc),...Object.keys(man.partes),...Object.keys(base)]);let mudouLocal=false;let _pi=0;const _pt=Math.max(1,todos.size);const agora=Date.now(),disp=nvDisp();
    await nvPool([...todos],12,async n=>{try{window.__nvProg&&window.__nvProg(0.8*(++_pi)/_pt)}catch(_){}const l=loc[n],r=man.partes[n]?man.partes[n].h:undefined,b=base[n];if(l===r){base[n]=l;return}
      const lm=l!==b,rm=r!==b;let usar=null;
      if(n==='audit'&&lm&&rm&&l!==undefined&&r!==undefined){/* auditoria: junta os registos dos dois lados */const txt=await prov.ler(NV_PREF+'audit.bin');const R=txt?JSON.parse(await nvDecifrar(txt,k)):[];const vis=new Set();const M=[...(P.audit||[]),...R].filter(e=>{const id=e.q+'|'+e.area+'|'+e.acao+'|'+e.det;if(vis.has(id))return false;vis.add(id);return true}).sort((x,y)=>y.q-x.q).slice(0,5000);
        P.audit=M;const h=nvHash(JSON.stringify(M));if(h===r){/* este aparelho não tinha registos novos: fica com os da nuvem, sem gravar nada */base.audit=h;mudouLocal=true;res.rec++;res._aud=(res._aud||0)+1;return}await prov.escrever(NV_PREF+'audit.bin',await nvCifrar(JSON.stringify(M),k));man.partes.audit={h,ts:agora,dev:disp};base.audit=h;mudouLocal=true;res.env++;(res._up=res._up||[]).push('audit');return}
      if(primeira&&window.__esAbrirBD&&manTxt&&r===undefined){/* v0.940 · ao abrir, a base de dados manda: o que só existe neste aparelho (restos de versões antigas) não sobe */usar='remoto'}
      else if(primeira&&r!==undefined){/* primeiro contacto deste dispositivo: fica com o que está na nuvem; guarda cópia só de turmas/anos que existam aqui */if(l!==undefined&&/^(turma|ano)-/.test(n))nvGuardaConflito(n,P[n],'este dispositivo (antes de ligar)');usar='remoto'}
      else if(lm&&!rm)usar='local';else if(rm&&!lm)usar='remoto';else{const lt=primeira?0:(mod[n]||S._ts||0),rt=man.partes[n]?man.partes[n].ts:0;
        /* 0.910: alterações nos dois aparelhos → junta-as (registo a registo; no mesmo campo fica a mais recente) e não cria conflito */
        if(l!==undefined&&r!==undefined){let R_=null;try{const tx=await prov.ler(NV_PREF+n+'.bin');if(tx!=null)R_=JSON.parse(await nvDecifrar(tx,k))}catch(_){}
          if(R_!=null&&P[n]!=null&&typeof R_==='object'&&typeof P[n]==='object'){const M_=rt>lt?nvJuntar(P[n],R_):nvJuntar(R_,P[n]);P[n]=M_;const h=nvHash(JSON.stringify(M_));await prov.escrever(NV_PREF+n+'.bin',await nvCifrar(JSON.stringify(M_),k));man.partes[n]={h,ts:agora,dev:disp};base[n]=h;mudouLocal=true;res.env++;res.rec++;res.junt=(res.junt||0)+1;(res._up=res._up||[]).push(n);return}}
        (res.cp=res.cp||[]).push(n);usar=(r===undefined&&l!==undefined)?'local':(l===undefined&&r!==undefined)?'remoto':(rt>lt?'remoto':'local');res.conf++;
        if(usar==='remoto'&&P[n]!==undefined)nvGuardaConflito(n,P[n],'este dispositivo');else if(usar==='local'&&r!==undefined){try{nvGuardaConflito(n,JSON.parse(await nvDecifrar(await prov.ler(NV_PREF+n+'.bin'),k)),(man.partes[n]||{}).dev||'outro dispositivo')}catch(_){}}}
      if(usar==='local'){if(l===undefined){await prov.apagar(NV_PREF+n+'.bin');delete man.partes[n];delete base[n]}else{await prov.escrever(NV_PREF+n+'.bin',await nvCifrar(JSON.stringify(P[n]),k));man.partes[n]={h:l,ts:mod[n]||agora,dev:disp};base[n]=l}res.env++;(res._up=res._up||[]).push(n)}
      else{if(r===undefined){delete P[n];delete base[n]}else{const txt=await prov.ler(NV_PREF+n+'.bin');if(txt==null)return;P[n]=JSON.parse(await nvDecifrar(txt,k));base[n]=r}mudouLocal=true;res.rec++;if(n==='audit')res._aud=(res._aud||0)+1}});
    /* fotografias e anexos: imutáveis — envia as que faltam, recebe as que não existem aqui */
    if(!window.__nvSemFotos)await nvPool(Object.keys(FOTOS),10,async id=>{if(!man.fotos[id]){try{await prov.escrever(nvNomeF(id),await nvCifrar(FOTOS[id],k));man.fotos[id]=1;res.fotosEnv++}catch(e){(res.fotosFalha=res.fotosFalha||[]).push(id);console.warn('[EduSpruce] ficheiro não enviado',id,e)}}});
    {const _F=Object.keys(man.fotos);let _fi=0;var _fprog=()=>{try{window.__nvProg&&window.__nvProg(0.8+0.2*(++_fi)/Math.max(1,_F.length))}catch(_){}}}if(!window.__nvSemFotos)await nvPool(Object.keys(man.fotos),10,async id=>{_fprog();if(!FOTOS[id]){let txt=null;try{txt=await prov.ler(nvNomeF(id))}catch(e){console.warn('[EduSpruce] ficheiro não recebido',id,e);return}if(txt!=null){const v=await nvDecifrar(txt,k);FOTOS[id]=v;idbPor(id,v);res.fotosRec++}}});
    if(mudouLocal){const st=nvMontar(P);const ok=validarCopia(st);if(ok.length)throw new Error('Dados recebidos incompletos: '+ok[0]);S=migrate(st);_semHist=true;saveNow();_semHist=false;const P2=nvPartes();Object.keys(P2).forEach(n=>{const h2=nvHash(JSON.stringify(P2[n]));if(man.partes[n]&&base[n]===man.partes[n].h&&h2!==base[n]){man.partes[n].h=h2;base[n]=h2;res._fix=1}})}
    if(res.env||res.conf||res.fotosEnv||res._fix||!manTxt){/* evita escrever por cima de outro dispositivo que sincronizou entretanto */const atual=await prov.ler(NV_PREF+'manifest.json');if(atual&&manTxt&&atual!==manTxt){_nvBusy=false;const b0=L.base||{};(res._up||[]).forEach(n=>{if(b0[n]===undefined)delete base[n];else base[n]=b0[n]});nvSet({base,mod:L.mod||{}});return await nvSincronizar(interativo)}
      man.rev=(man.rev||0)+1;man.q=agora;man.dev=disp;await prov.escrever(NV_PREF+'manifest.json',JSON.stringify(man))}
    nvSet({base,mod:{},ultimo:agora,erro:''});const t=res.rec||res.env||res.fotosRec||res.fotosEnv?`sincronizado · ${res.env} enviadas · ${res.rec} recebidas${res.conf?' · '+res.conf+' conflito(s)':''}`:'sincronizado — tudo igual';nvEstadoTxt(t);
    if(mudouLocal&&res.rec-(res._aud||0)>0){aplicarPrefs();go(VIEW);toast('Recebidas alterações de outro dispositivo ('+(res.rec-(res._aud||0))+')','ok')}else if(interativo)toast('Sincronizado'+(res.env?' — '+res.env+' parte(s) enviada(s)':''),'ok');
    if(res.conf)toast(res.conf+' conflito(s): ficou a versão mais recente; a outra está em Definições › Sincronização','aviso');if(res.junt)try{audit('Sincronização','Alterações de dois aparelhos juntadas',res.junt+' parte(s)')}catch(_){}if(res.fotosFalha&&interativo)toast(res.fotosFalha.length+' fotografia(s)/documento(s) muito grande(s) ou com erro — os restantes dados foram sincronizados; volta a tentar sozinha.','aviso');
    window.__nvUlt=res;return res}
  catch(e){nvSet({erro:e.message});nvEstadoTxt('erro: '+e.message);if(interativo)toast(e.message,'erro');console.warn(e);return null}finally{_nvBusy=false}}
/* registo da hora de alteração de cada parte (para decidir conflitos pela versão mais recente) */
{const _sv3=saveNow;saveNow=function(){const r=_sv3.apply(this,arguments);try{const L=nvL();if(L.prov&&L.base){const P=nvPartes();const mod=L.mod||{};let m=false;Object.keys(P).forEach(n=>{const h=nvHash(JSON.stringify(P[n]));if(h!==L.base[n]&&!mod[n]){mod[n]=Date.now();m=true}});if(m)nvSet({mod});if(L.auto!==false&&_nvK){clearTimeout(_nvT);_nvT=setTimeout(()=>nvSincronizar(false),250)}}}catch(_){}return r}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&nvL().prov&&_nvK&&nvL().auto!==false){clearTimeout(_nvT);nvSincronizar(false)}else if(document.visibilityState==='visible'&&nvL().prov&&_nvK&&nvL().auto!==false)setTimeout(()=>nvSincronizar(false),1500)});
addEventListener('online',()=>{if(nvL().prov&&_nvK)nvSincronizar(false)});
setInterval(()=>{if(nvL().prov&&_nvK&&nvL().auto!==false&&!document.hidden)nvSincronizar(false)},5*60*1000);
setTimeout(async()=>{try{if(nvL().prov&&await nvChave()&&nvL().auto!==false)nvSincronizar(false)}catch(_){}},4000);
/* a sincronização antiga (ficheiro único na Google) fica desligada quando a nova está ativa */
{const _sg=sincronizarGoogle;sincronizarGoogle=function(){if(nvL().prov)return Promise.resolve();return _sg.apply(this,arguments)}}
/* --- palavra-passe de encriptação --- */
async function nvDefinirPalavra(pw){const prov=nvProv();if(!prov)throw new Error('Escolha primeiro onde guardar.');let man=null;try{const t=await prov.ler(NV_PREF+'manifest.json');man=t?JSON.parse(t):null}catch(e){throw e}
  const salt=man&&man.salt?man.salt:b64(crypto.getRandomValues(new Uint8Array(16)));const k=await nvChaveDe(pw,salt);
  if(man&&man.chk){let ok=false;try{ok=await nvDecifrar(man.chk,k)==='eduflow'}catch(_){}if(!ok)throw new Error('Palavra-passe errada: não corresponde à dos dados já guardados na nuvem.')}
  await nvGuardarChave(k);nvSet({salt,base:null,mod:{}});return !!man}
/* --- cartão em Definições › Dados e Segurança --- */
function cartaoNuvem(){const L=nvL();const prov=PROV[L.prov];const lig=prov&&(L.prov==='google'?!!(gsCfg().clientId):!!L.ms);const C=nvConflitos();const https=nvHttps();
  const ultimo=L.ultimo?new Date(L.ultimo).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'}):'nunca';
  return `<div class="card" id="nv-card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('refresh',18)} Sincronização na Nuvem</h2><span class="tag ${lig&&L.k?'ok':''}">${lig&&L.k?'Ativa · '+esc(prov.n):'Desligada'}</span><span class="sp1"></span>${lig&&L.k?`<button class="btn pri" id="nv-agora">${ic('refresh',15)} Sincronizar Agora</button>`:''}</div>
    <p class="hint" style="margin-top:6px">Os mesmos dados no iPad, no Mac e no browser. Tudo é <b>encriptado neste dispositivo</b> antes de sair (AES-256), com uma palavra-passe só sua; a Microsoft ou a Google guardam apenas ficheiros ilegíveis, na pasta privada da app${L.prov==='onedrive'?' (OneDrive › Aplicações › EduFlow)':''}. Os dados são divididos por partes (cada turma, cada ano letivo, definições, fotografias) para que alterações em dispositivos diferentes se juntem sem se perderem.</p>
    ${!https?`<div class="alert w">${ic('alert',15)} A ligação à conta Microsoft ou Google só funciona com a app num endereço <b>https</b> (servidor web). Aberta como ficheiro no computador, a sincronização não está disponível.</div>`:''}
    <div class="nvprov" role="radiogroup" aria-label="Onde guardar">${[['onedrive','OneDrive','Conta Microsoft 365 (escola) ou pessoal'],['google','Google Drive','Conta Google']].map(([k,n,d])=>`<button type="button" role="radio" aria-checked="${L.prov===k}" class="nvp ${L.prov===k?'on':''}" data-nvp="${k}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>
    ${L.prov==='onedrive'?`<div class="g2" style="margin-top:12px"><div><label for="nv-msid">ID da aplicação (cliente) — Microsoft Entra</label><input id="nv-msid" value="${esc(L.msId||'')}" placeholder="00000000-0000-0000-0000-000000000000" autocapitalize="none" spellcheck="false"></div><div style="display:flex;align-items:flex-end;gap:8px"><button class="btn ${L.ms?'':'pri'}" id="nv-msl">${ic('link',15)} ${L.ms?'Voltar a Ligar':'Ligar ao OneDrive'}</button>${L.ms?`<span class="mut">${esc(L.conta||'ligado')}</span>`:''}</div></div>
      <details class="nvaj"><summary>Como obter o ID da aplicação (uma vez, grátis)</summary><ol><li>Entre em <b>portal.azure.com</b> › Microsoft Entra ID › <b>Registos de aplicações</b> › Novo registo.</li><li>Nome: EduSpruce · Tipos de conta: <b>contas de qualquer organização e contas Microsoft pessoais</b>.</li><li>URI de redirecionamento: plataforma <b>Aplicação de página única (SPA)</b> com o endereço <code>${esc(nvRedirect())}</code>.</li><li>Em Permissões de API, adicione Microsoft Graph › Delegadas › <b>Files.ReadWrite.AppFolder</b> e User.Read.</li><li>Copie o <b>ID da aplicação (cliente)</b> para aqui. Se a conta for da escola, o administrador pode ter de aprovar.</li></ol></details>`:''}
    ${L.prov==='google'?`<div class="g2" style="margin-top:12px"><div><label for="nv-gid">ID de cliente OAuth (Google Cloud)</label><input id="nv-gid" value="${esc(gsCfg().clientId||'')}" placeholder="…apps.googleusercontent.com" autocapitalize="none" spellcheck="false"></div><div style="display:flex;align-items:flex-end;gap:8px"><button class="btn pri" id="nv-gl">${ic('link',15)} Ligar ao Google Drive</button>${gsCfg().email?`<span class="mut">${esc(gsCfg().email)}</span>`:''}</div></div>
      <details class="nvaj"><summary>Como obter o ID de cliente (uma vez, grátis)</summary><ol><li>Em <b>console.cloud.google.com</b> crie um projeto e ative a <b>Google Drive API</b>.</li><li>Ecrã de consentimento OAuth: tipo Externo, âmbito <code>drive.appdata</code>.</li><li>Credenciais › Criar ID de cliente OAuth › <b>Aplicação Web</b> com a origem JavaScript <code>${esc(location.origin)}</code>.</li><li>Copie o ID de cliente para aqui.</li></ol></details>`:''}
    ${L.prov?`<div class="nvpw"><h3 style="margin:14px 0 6px">Palavra-passe de encriptação</h3>${L.k?`<p class="mut" style="margin:0">${ic('check',14)} Definida neste dispositivo (a chave fica guardada aqui para sincronizar sozinho). Use a mesma palavra-passe nos outros dispositivos.</p><button class="btn sm" id="nv-pwm" style="margin-top:8px">Mudar neste dispositivo</button>`:
      `<p class="hint" style="margin:0 0 8px">Escolha uma palavra-passe forte e guarde-a: sem ela ninguém (nem você) consegue abrir os dados na nuvem. Nos outros dispositivos use a mesma.</p><div class="row" style="gap:8px;flex-wrap:wrap"><input type="password" id="nv-pw1" placeholder="Código numérico (mín. 8 algarismos)" autocomplete="new-password" style="max-width:240px"><input type="password" id="nv-pw2" placeholder="Repetir" autocomplete="new-password" style="max-width:240px"><button class="btn pri" id="nv-pwok">${ic('shield',15)} Guardar e Sincronizar</button></div>`}</div>`:''}
    ${L.prov&&L.k?`<div class="row" style="gap:12px;flex-wrap:wrap;margin-top:14px;align-items:center"><label class="chk"><input type="checkbox" id="nv-auto" ${L.auto!==false?'checked':''}> Sincronizar automaticamente (ao alterar, a cada minuto, ao abrir e ao sair)</label><span class="sp1"></span><span class="mut" id="nv-est">${L.erro?'erro: '+esc(L.erro):'última sincronização: '+esc(ultimo)}</span></div>
      <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><span class="mut" style="font-size:12.5px">Este dispositivo: ${esc(nvDisp())}</span><span class="sp1"></span><button class="btn sm dng" id="nv-off">${ic('x',13)} Desligar Este Dispositivo</button></div>`:''}
    ${C.length?`<details class="nvaj" open><summary>${C.length} versão(ões) guardadas de conflitos</summary><p class="hint" style="margin:6px 0">Quando a mesma parte foi alterada em dois dispositivos, fica a mais recente; a outra fica aqui e pode repô-la.</p>${C.map((c,i)=>`<div class="lin"><b>${esc(nvRotulo(c.parte))}</b><span class="mut"> · de ${esc(c.de)} · ${new Date(c.q).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'})}</span><span class="sp1"></span><button class="btn sm" data-nvrep="${i}">Repor Esta Versão</button><button class="btn sm ico" data-nvdel="${i}" aria-label="Descartar">${ic('x',12)}</button></div>`).join('')}</details>`:''}
  </div>`}
function bindNuvem(){const re=()=>{const c=$('#nv-card');if(!c)return;const d=document.createElement('div');d.innerHTML=cartaoNuvem();c.replaceWith(d.firstElementChild);bindNuvem()};
  $$('[data-nvp]').forEach(b=>b.onclick=()=>{nvSet({prov:b.dataset.nvp,base:null,mod:{}});PROV.google._ids=null;re()});
  const mi=$('#nv-msid');if(mi)mi.onchange=()=>nvSet({msId:mi.value.trim()});const gi=$('#nv-gid');if(gi)gi.onchange=()=>{gsCfg().clientId=gi.value.trim();save()};
  const ml=$('#nv-msl');if(ml)ml.onclick=async()=>{if(mi)nvSet({msId:mi.value.trim()});try{await msLigar();toast('OneDrive ligado','ok');re()}catch(e){toast(e.message,'erro')}};
  const gl=$('#nv-gl');if(gl)gl.onclick=async()=>{if(gi){gsCfg().clientId=gi.value.trim();save()}try{await gsToken(true);toast('Google Drive ligado','ok');re()}catch(e){toast(e.message,'erro')}};
  const pw=$('#nv-pwok');if(pw)pw.onclick=async()=>{const a=$('#nv-pw1').value,b=$('#nv-pw2').value;{const _e=nvPinErro(a,'nv-pw1');if(_e)return toast(_e,'erro')}if(a!==b)return toast('As palavras-passe não coincidem.','erro');pw.disabled=true;
    try{const exist=await nvDefinirPalavra(a);toast(exist?'Palavra-passe confirmada — a receber os dados da nuvem…':'Palavra-passe definida — a enviar os dados…','ok');await nvSincronizar(true)}catch(e){toast(e.message,'erro')}pw.disabled=false;re()};
  const pm=$('#nv-pwm');if(pm)pm.onclick=()=>{if(!confirm('Esquecer a chave neste dispositivo? Terá de voltar a escrever a palavra-passe.'))return;_nvK=null;nvSet({k:null});re()};
  const ag=$('#nv-agora');if(ag)ag.onclick=async()=>{ag.disabled=true;await nvSincronizar(true);ag.disabled=false;re()};
  const au=$('#nv-auto');if(au)au.onchange=()=>nvSet({auto:au.checked});
  const of=$('#nv-off');if(of)of.onclick=()=>{if(!confirm('Desligar a sincronização neste dispositivo? Os dados ficam aqui e na nuvem.'))return;_nvK=null;localStorage.removeItem(NV_KEY);re()};
  $$('[data-nvrep]').forEach(b=>b.onclick=()=>{const C=nvConflitos();const c=C[+b.dataset.nvrep];if(!c||!confirm('Repor a versão de '+c.de+' de '+nvRotulo(c.parte)+'? A versão atual passa para esta lista.'))return;const P=nvPartes();if(P[c.parte]!==undefined)nvGuardaConflito(c.parte,P[c.parte],'antes de repor');P[c.parte]=c.dados;S=migrate(nvMontar(P));saveNow();const C2=nvConflitos().filter(x=>x.q!==c.q);localStorage.setItem(NV_CONF,JSON.stringify(C2));toast('Versão reposta','ok');re()});
  $$('[data-nvdel]').forEach(b=>b.onclick=()=>{const C=nvConflitos();C.splice(+b.dataset.nvdel,1);localStorage.setItem(NV_CONF,JSON.stringify(C));re()})}
{const _cs=cartaoSyncGoogle;cartaoSyncGoogle=function(){return cartaoNuvem()}}
{const _bdd=bindDados;bindDados=function(){const r=_bdd.apply(this,arguments);try{bindNuvem()}catch(e){console.warn(e)}return r}}

