/* ===================== v1.026 · Modo «Em teste»: abaixo da turma, só quando há teste — relógio, temporizador e nome do teste =====================
   Aparece no menu, por baixo da turma, no dia de um teste (instrumento do tipo teste, prova escrita ou questão-aula com a data de hoje)
   e só na janela das aulas dessa turma (se houver horário). Abre um ecrã para projetar: hora certa, tempo que falta, hora de fim,
   tempo adicional (sem nomes) e regras. Leve: atualiza uma vez por segundo, sem animações pesadas. */
const EMT=()=>S.emt=(S.emt&&typeof S.emt==='object')?S.emt:{};
const emtEhTeste=i=>{try{const ab=TIPO_AB(i.tipo||'');return ab==='T'||/^Q/.test(ab)}catch(_){return /teste|prova escrita|quest/i.test(i.tipo||'')}};
function emtBlocos(a,t,d){d=d||new Date();try{const H=a.horProf;if(!H||!Array.isArray(H.aulas))return [];const L=H.aulas.filter(x=>x.dia===d.getDay()&&(H.mapa||{})[chaveAula(x)]===t.id).map(x=>({ini:+x.ini,fim:+x.fim,sala:x.sala||''})).sort((p,q)=>p.ini-q.ini);
    const B=[];L.forEach(x=>{const u=B[B.length-1];if(u&&x.ini-u.fim<=15){u.fim=Math.max(u.fim,x.fim)}else B.push({...x})});return B}catch(_){return []}}
function emtHoje(){const a=A();if(!a)return [];const hj=isoData(new Date());const now=new Date();const mn=now.getHours()*60+now.getMinutes();const R=[];
  (a.turmas||[]).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(i.data!==hj||!emtEhTeste(i))return;const B=emtBlocos(a,t,now);const st=EMT()[i.id];
    if(B.length&&!(st&&st.ini&&!st.fechado)){const ok=B.some(b=>mn>=b.ini-60&&mn<=b.fim+30);if(!ok)return}R.push({t,i,B})}));return R}
function emtNav(){document.querySelectorAll('#side .emtnav').forEach(e=>e.remove());const L=emtHoje();emtNav._k=L.map(o=>o.i.id).join();if(!L.length)return;
  const tree=$('#tTree');L.forEach(o=>{const st=EMT()[o.i.id];const corre=st&&st.ini&&!st.pz;
    const html=`<button type="button" class="nav emtnav ${corre?'corre':''}" data-emt="${o.i.id}" data-emtt="${o.t.id}" title="Em teste: ${esc(o.i.nome)} — ${esc(o.t.nome)} · ${esc(o.t.disciplina)}"><span class="emtdot" aria-hidden="true"></span><span class="lbl"><b>Em teste</b><span class="tdisc">${esc(o.i.nome)} · ${esc(o.t.nome)}</span></span></button>`;
    let ref=null;if(tree&&tree.children.length&&!tree.classList.contains('uma')){ref=tree.querySelector(`.tnode[data-tt="${CSS.escape(o.t.id)}"]`)||[...tree.querySelectorAll('.tnode.tgrp')].find(b=>(b.dataset.tgk||'').split('|')[0]===o.t.nome);
      if(ref){let n=ref;while(n.nextElementSibling&&n.nextElementSibling.matches('.tdsel,.tkids,.emtnav'))n=n.nextElementSibling;n.insertAdjacentHTML('afterend',html);return}}
    if(tree&&tree.classList.contains('uma'))tree.insertAdjacentHTML('afterbegin',html);else{const h=$('#navTurmas')||$('#grpT');if(h)h.insertAdjacentHTML('afterend',html)}});
  document.querySelectorAll('#side .emtnav').forEach(b=>b.onclick=e=>{e.stopPropagation();emtAbrir(b.dataset.emt,b.dataset.emtt)})}
{const _nTe=navTurmas;navTurmas=function(){const r=_nTe.apply(this,arguments);clearTimeout(navTurmas._emt);navTurmas._emt=setTimeout(()=>{try{emtNav();ufcdRotulos()}catch(e){console.warn(e)}},0);return r}}
setInterval(()=>{try{const k=emtHoje().map(o=>o.i.id).join();if(k!==emtNav._k)emtNav()}catch(_){}},60000);
/* a árvore das turmas é redesenhada por vários passos: volta a pôr «Em teste» no sítio certo sempre que muda */
{let _emtMo=null;const liga=()=>{const tr=document.getElementById('tTree');if(!tr||_emtMo)return;_emtMo=new MutationObserver(L=>{const so=L.every(r=>[...r.addedNodes,...r.removedNodes].every(n=>n.nodeType!==1||n.classList.contains('emtnav')));if(so)return;clearTimeout(liga._t);liga._t=setTimeout(()=>{try{emtNav();ufcdRotulos()}catch(_){}},0)});_emtMo.observe(tr,{childList:true})};liga();setTimeout(liga,1500)}
function emtSt(i,t,a){const E=EMT();let s=E[i.id];if(!s){const now=new Date(),mn=now.getHours()*60+now.getMinutes();const B=emtBlocos(a,t,now);const b=B.find(x=>mn>=x.ini&&mn<x.fim)||B.find(x=>x.ini>mn);
    let dur=b?(mn>=b.ini?b.fim-mn:b.fim-b.ini):(/^Q/.test((()=>{try{return TIPO_AB(i.tipo)}catch(_){return ''}})())?20:90);dur=Math.max(5,Math.min(240,Math.round(dur)));
    s=E[i.id]={dur,ini:null,acum:0,pz:null,extra:25,regras:'Telemóveis desligados e guardados na mochila.\nEscreve o nome e o número em todas as folhas.\nSem conversas: dúvidas, levanta o braço.\nNo fim, verifica as respostas antes de entregar.'};}
  return s}
const emtDecorrido=s=>s.ini?Math.max(0,((s.pz||Date.now())-s.ini-(s.acum||0))):0;
const emtFmt=ms=>{const neg=ms<0;ms=Math.abs(ms);const h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),sg=Math.floor(ms%60000/1000);return (neg?'+':'')+(h?h+':'+String(m).padStart(2,'0'):String(m))+':'+String(sg).padStart(2,'0')};
const emtHora=d=>String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
let EMT_IV=null,EMT_WL=null;
function emtFechar(){clearInterval(EMT_IV);EMT_IV=null;const o=$('#emteste');if(o)o.remove();document.body.classList.remove('emt-on');try{EMT_WL&&EMT_WL.release()}catch(_){}EMT_WL=null;try{if(document.fullscreenElement)document.exitFullscreen()}catch(_){}try{emtNav()}catch(_){}}
function emtBip(n){try{const C=new (window.AudioContext||window.webkitAudioContext)();for(let k=0;k<(n||3);k++){const o=C.createOscillator(),g=C.createGain();o.frequency.value=880;o.connect(g);g.connect(C.destination);const t0=C.currentTime+k*.45;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.3,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+.32);o.start(t0);o.stop(t0+.35)}setTimeout(()=>C.close(),2500)}catch(_){}}
function emtAbrir(iid,tid){const a=A();const t=a&&(a.turmas||[]).find(x=>x.id===tid);const i=t&&(t.instrumentos||[]).find(x=>x.id===iid);if(!i)return toast('Teste não encontrado','erro');
  emtFechar();const s=emtSt(i,t,a);const B=emtBlocos(a,t);const sala=(B[0]&&B[0].sala)||'';
  const nExtra=alunosAval(t).filter(x=>(x.acomod||[]).some(z=>/tempo/i.test(z))).length;
  const o=document.createElement('div');o.id='emteste';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Modo em teste: '+i.nome);
  o.innerHTML=`<div class="emt-top"><span class="emt-tag"><i></i> Em teste</span><span class="emt-tur">${esc(t.nome)} · ${esc(t.disciplina)}${sala?' · Sala '+esc(sala):''}</span><span class="sp1"></span>
      <button type="button" class="emt-b" id="emt-fs" title="Ecrã inteiro">${ic('arrowUp',18)}<span>Ecrã inteiro</span></button><button type="button" class="emt-b" id="emt-x" title="Sair (Esc)">${ic('x',18)}<span>Sair</span></button></div>
    <h1 class="emt-nome">${esc(i.nome)}</h1><p class="emt-sub">${esc(i.tipo||'Teste')}${i.periodo?' · '+i.periodo+'.º período':''}</p>
    <div class="emt-grid"><div class="emt-cx emt-rel"><small>Hora</small><div class="emt-num"><b id="emt-h">--:--</b><span id="emt-s">:--</span></div><small id="emt-dt"></small></div>
      <div class="emt-cx emt-tmp"><small id="emt-lbl">Tempo do teste</small><div class="emt-num"><b id="emt-r">--:--</b></div><div class="emt-bar" aria-hidden="true"><i id="emt-bar"></i></div><small id="emt-fim"></small><small id="emt-ex"></small></div></div>
    <div class="emt-regras" id="emt-rg"></div>
    <div class="emt-ctl"><button type="button" class="emt-b pri" id="emt-go"></button><button type="button" class="emt-b" id="emt-m5" title="Menos 5 minutos">−5 min</button><button type="button" class="emt-b" id="emt-p5" title="Mais 5 minutos">+5 min</button>
      <label class="emt-dur">Duração <input type="number" id="emt-d" min="5" max="300" step="5" value="${s.dur}"> min</label>${nExtra?`<label class="emt-dur">Tempo adicional <select id="emt-xs">${[0,10,15,20,25,30,50].map(p=>`<option value="${p}" ${+s.extra===p?'selected':''}>${p?'+'+p+' %':'sem'}</option>`).join('')}</select></label>`:''}
      <button type="button" class="emt-b" id="emt-rs" title="Recomeçar">${ic('refresh',16)} Recomeçar</button><button type="button" class="emt-b" id="emt-re" title="Editar as regras">${ic('pencil',16)} Regras</button></div>`;
  document.body.appendChild(o);document.body.classList.add('emt-on');
  const rg=()=>{const L=String(s.regras||'').split('\n').map(x=>x.trim()).filter(Boolean);$('#emt-rg').innerHTML=L.length?`<ul>${L.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''};rg();
  let bipou=false,bip5=false;
  const tick=()=>{const now=new Date();$('#emt-h').textContent=emtHora(now);$('#emt-s').textContent=':'+String(now.getSeconds()).padStart(2,'0');
    $('#emt-dt').textContent=now.toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'});
    const tot=s.dur*60000,el=emtDecorrido(s),rest=tot-el;const corre=s.ini&&!s.pz;
    $('#emt-r').textContent=emtFmt(s.ini?rest:tot);$('#emt-lbl').textContent=!s.ini?'Tempo do teste':s.pz?'Em pausa':rest>0?'Tempo restante':'Tempo terminado';
    $('#emt-bar').style.width=(s.ini?Math.min(100,Math.max(0,el/tot*100)):0)+'%';
    const fim=s.ini?new Date(now.getTime()+Math.max(0,rest)):new Date(now.getTime()+tot);
    $('#emt-fim').textContent=(s.ini?'Termina às ':'Se começar agora, termina às ')+emtHora(fim)+(s.pz?' (em pausa)':'');
    const ex=$('#emt-ex');if(nExtra&&+s.extra){const fx=new Date(fim.getTime()+tot*(+s.extra)/100);ex.textContent='Tempo adicional (+'+s.extra+' %): '+nExtra+(nExtra===1?' aluno':' alunos')+' até às '+emtHora(fx)}else ex.textContent='';
    o.classList.toggle('emt-10',!!s.ini&&rest<=600000&&rest>300000);o.classList.toggle('emt-5',!!s.ini&&rest<=300000&&rest>0);o.classList.toggle('emt-0',!!s.ini&&rest<=0);o.classList.toggle('emt-pz',!!s.pz);
    if(corre&&rest<=300000&&rest>290000&&!bip5){bip5=true;emtBip(1)}if(corre&&rest<=0&&!bipou){bipou=true;emtBip(3)}
    $('#emt-go').innerHTML=!s.ini?ic('play',18)+' Começar':s.pz?ic('play',18)+' Continuar':ic('pause',18)+' Pausa'};
  const guarda=()=>{save();tick();try{emtNav()}catch(_){}};
  $('#emt-go').onclick=()=>{if(!s.ini){s.ini=Date.now();s.acum=0;s.pz=null;bipou=bip5=false;try{audit('Em teste','Início do teste',i.nome+' · '+t.nome)}catch(_){}}else if(s.pz){s.acum=(s.acum||0)+(Date.now()-s.pz);s.pz=null}else s.pz=Date.now();guarda()};
  $('#emt-m5').onclick=()=>{s.dur=Math.max(5,s.dur-5);$('#emt-d').value=s.dur;guarda()};$('#emt-p5').onclick=()=>{s.dur=Math.min(300,s.dur+5);$('#emt-d').value=s.dur;bipou=false;guarda()};
  $('#emt-d').onchange=e=>{s.dur=Math.max(5,Math.min(300,+e.target.value||s.dur));bipou=false;guarda()};
  const xs=$('#emt-xs');if(xs)xs.onchange=()=>{s.extra=+xs.value;guarda()};
  $('#emt-rs').onclick=()=>{if(s.ini&&!confirm('Recomeçar o temporizador deste teste?'))return;s.ini=null;s.acum=0;s.pz=null;bipou=bip5=false;guarda()};
  $('#emt-re').onclick=()=>{const v=prompt('Regras a mostrar durante o teste (uma por linha; use \\n para mudar de linha):',String(s.regras||'').replace(/\n/g,'\\n'));if(v==null)return;s.regras=v.replace(/\\n/g,'\n');rg();save()};
  $('#emt-x').onclick=emtFechar;$('#emt-fs').onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else o.requestFullscreen&&o.requestFullscreen()}catch(_){}};
  o.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.fullscreenElement){e.preventDefault();emtFechar()}if(e.key===' '&&e.target===o){e.preventDefault();$('#emt-go').click()}});o.tabIndex=-1;o.focus();
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>EMT_WL=w).catch(()=>{})}catch(_){}
  tick();EMT_IV=setInterval(()=>{if(!document.getElementById('emteste')){clearInterval(EMT_IV);return}tick()},1000)}

