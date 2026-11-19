/* ===================== 1.142 · boas-vindas animadas do Spruce It, Formulários e Provas (como no SpruceNote) =====================
   Aparece uma vez a cada utilizador (S.cfg.bvVisto[k]) e volta no botão «Ver exemplo». Tudo original e fictício.
   As maquetes (bvMaq) também são usadas pelo gerador das páginas eduspruce.app/spruceit, /formularios e /provas. */
function bvBicho(c1,c2,o){o=o||'';/* personagem original: cubo arredondado com olhos */
  return`<svg viewBox="0 0 60 60" class="bv-bi" aria-hidden="true"><rect x="6" y="10" width="48" height="44" rx="12" fill="${c1}" stroke="${c2}" stroke-width="3"/>${o==='o'?`<circle cx="14" cy="10" r="6" fill="${c1}" stroke="${c2}" stroke-width="3"/><circle cx="46" cy="10" r="6" fill="${c1}" stroke="${c2}" stroke-width="3"/>`:''}${o==='a'?`<path d="M22 10 L18 1 M38 10 L42 1" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>`:''}<circle cx="22" cy="28" r="6" fill="#fff"/><circle cx="38" cy="28" r="6" fill="#fff"/><circle class="bv-pu" cx="23" cy="29" r="3" fill="#111827"/><circle class="bv-pu" cx="39" cy="29" r="3" fill="#111827"/><path d="M24 41 Q30 46 36 41" stroke="#111827" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`}
const BVM={
  spruceit:{nome:'Spruce It',ic:'star',tit:'Aprender é o melhor jogo.',sub:'Jogos de perguntas com Bichos, modos de jogo e corridas ao pódio — a revisão que os alunos pedem para repetir.',
    pe:'Escolha um conjunto de perguntas, um modo de jogo e mostre o código à turma · nunca conta para a nota.',
    maq:()=>{const J=[['Leo','#f97316','#c2410c','o'],['Bia','#4ade80','#16a34a',''],['Rui','#60a5fa','#1d4ed8','a'],['Inês','#f472b6','#be185d','o'],['Tomás','#facc15','#a16207',''],['Rita','#c084fc','#7e22ce','a'],['Duarte','#2dd4bf','#0f766e','o'],['Matilde','#fb7185','#be123c','']];
      const C=[['Rita',920],['Leo',860],['Bia',740],['Duarte',610],['Rui',480]];
      return`<div class="bv-si"><div class="bv-sitop"><b class="bv-silogo">Spruce<i>It</i></b><span class="bv-chip">${ic('target',13)} Corrida ao Cume</span><span class="bv-sp"></span><span class="bv-tempo">⏱ 0:18</span><span class="bv-chip">${ic('users',13)} 8 jogadores</span></div>
      <div class="bv-sigr"><div class="bv-sic bv-lob"><small>Entrar em</small><b class="bv-url">eduspruce.pt/spruceit</b><small>com o código</small><div class="bv-cod">482 913</div>
        <div class="bv-jog">${J.map((j,i)=>`<div class="bv-j" style="--d:${.4+i*.28}s">${bvBicho(j[1],j[2],j[3])}<span>${j[0]}</span></div>`).join('')}</div></div>
      <div class="bv-sic bv-per"><div class="bv-pnum">Pergunta 4 de 10</div><div class="bv-ptxt">Quanto é 7 × 8?</div><div class="bv-res">${[['54','#facc15'],['56','#3b82f6'],['63','#22c55e'],['48','#ef4444']].map((r,i)=>`<div class="bv-r${i===1?' ok':''}" style="--c:${r[1]};--d:${1.2+i*.12}s"><i>${'▲◆●■'[i]}</i>${r[0]}</div>`).join('')}</div><div class="bv-barra"><span></span></div></div>
      <div class="bv-sic bv-cla"><h5>${ic('award',14)} Pódio</h5>${C.map((c,i)=>`<div class="bv-cl" style="--d:${1.6+i*.15}s;--w:${c[1]/9.2}%"><b>${i+1}</b><span>${c[0]}</span><div><i></i></div><em>${c[1]}</em></div>`).join('')}<div class="bv-pod"><div style="--d:2.6s">${bvBicho('#f97316','#c2410c','o')}<b>2</b></div><div style="--d:2.9s">${bvBicho('#c084fc','#7e22ce','a')}<b>1</b></div><div style="--d:2.4s">${bvBicho('#4ade80','#16a34a','')}<b>3</b></div></div></div></div>
      <div class="bv-modos">${['Corrida ao Cume','Pesca no Lago','Rainha do Pinhal','Ao teu ritmo','Torre de Blocos'].map((m,i)=>`<span style="--d:${2.2+i*.12}s">${m}</span>`).join('')}</div></div>`}},
  forms:{nome:'Formulários',ic:'clipboard',tit:'Pergunte. Recolha. Analise.',sub:'Formulários e testes online: os alunos respondem pelo QR code, sem contas, e os testes corrigem-se sozinhos.',
    pe:'Crie um questionário ou formulário, partilhe o código com a turma e veja as respostas a chegar em direto.',
    maq:()=>`<div class="bv-fm"><div class="bv-fmtop"><b>${ic('clipboard',16)} Formulários</b><span class="bv-sp"></span><span class="bv-fmtb on">Perguntas</span><span class="bv-fmtb">Respostas <em>24</em></span><span class="bv-fmbt">${ic('send',13)} Recolher</span></div>
      <div class="bv-fmgr"><div class="bv-fmed"><div class="bv-fmcab"><b>Visita de estudo ao porto</b><small>Diga-nos como correu — demora 2 minutos.</small></div>
        <div class="bv-fq" style="--d:.3s"><b>1. Gostaste da visita de estudo?</b>${['Muito','Mais ou menos','Pouco'].map((o,i)=>`<label class="${i?'':'bv-sel'}"><span></span>${o}</label>`).join('')}</div>
        <div class="bv-fq" style="--d:.6s"><b>2. Classifica a atividade</b><div class="bv-est">${[0,1,2,3,4].map(i=>`<i style="--d:${1.4+i*.18}s">★</i>`).join('')}</div></div>
        <div class="bv-fq" style="--d:.9s"><b>3. O que mudarias?</b><div class="bv-txt"><span>Mais tempo no navio-escola!</span></div></div></div>
      <div class="bv-fmres"><div class="bv-fc" style="--d:.5s"><h5>Gostaste da visita de estudo?</h5><div class="bv-dn"><svg viewBox="0 0 42 42"><circle r="15.9" cx="21" cy="21" class="a"/><circle r="15.9" cx="21" cy="21" class="b"/><circle r="15.9" cx="21" cy="21" class="c"/></svg><ul><li><i style="background:#0e7490"></i>Muito <b>17</b></li><li><i style="background:#f59e0b"></i>Mais ou menos <b>5</b></li><li><i style="background:#e11d48"></i>Pouco <b>2</b></li></ul></div></div>
        <div class="bv-fc" style="--d:.8s"><h5>Classifica a atividade <em>média 4,3 ★</em></h5>${[[5,62],[4,25],[3,9],[2,4]].map((b,i)=>`<div class="bv-hb" style="--w:${b[1]}%;--d:${1.2+i*.12}s"><span>${b[0]}★</span><div><i></i></div><em>${b[1]}%</em></div>`).join('')}</div>
        <div class="bv-fc bv-qr" style="--d:1.1s"><div class="bv-qrc">${Array.from({length:49},(_,i)=>`<i${[0,1,2,4,6,7,9,13,14,16,18,20,21,23,26,28,31,33,35,36,38,40,41,42,43,45,47,48].includes(i)?' class="p"':''}></i>`).join('')}</div><div><small>Os alunos respondem em</small><b>eduspruce.pt/forms</b><small>código <b>7KQ2</b> · sem contas</small><span class="bv-novo">+1 resposta</span></div></div></div></div></div>`},
  provas:{nome:'Provas',ic:'award',tit:'Avaliar em minutos. Ensinar o resto do tempo.',sub:'Crie a prova, agende-a para a turma e deixe a correção automática fazer o trabalho repetitivo — as classificações seguem para a avaliação.',
    pe:'Criar · Agendar · Corrigir — com banco de exercícios, correção automática e classificações de 0 a 20 valores.',
    maq:()=>`<div class="bv-pv"><div class="bv-pvlado">${['grid','pen','calendar','chart','layers','gear'].map((n,i)=>`<i class="${i===1?'on':''}">${ic(n,17)}</i>`).join('')}</div><div class="bv-pvm">
      <div class="bv-pvtop"><div><small>Bom dia,</small><b>Prof. Rui Mendes</b></div><span class="bv-sp"></span><span class="bv-pvbt">${ic('plus',13)} Nova prova</span></div>
      <div class="bv-pvgr"><div class="bv-pvc bv-pvt" style="--d:.2s"><div class="bv-pvh"><span class="bv-pvic">${ic('bookopen',18)}</span><div><b>Teste de História — 8.º B</b><small>A Revolução Liberal · 12 questões · 45 min</small></div></div>
        <div class="bv-pass">${[['Criar','12 questões','pen'],['Agendar','12 dez · 10:05','calendar'],['Corrigir','24 / 24 corrigidos','checks']].map((p,i)=>`<div class="bv-p" style="--d:${.6+i*.5}s"><span>${ic(p[2],15)}</span><b>${p[0]}</b><small>${p[1]}</small></div>`).join('<i class="bv-seta"></i>')}</div>
        <div class="bv-prog"><div><i></i></div><small>Correção automática · <b>pronto em 2 min</b></small></div></div>
       <div class="bv-pvc bv-pvr" style="--d:.5s"><h5>Resultados <em>média 13,6 valores</em></h5><div class="bv-hist">${[1,2,3,6,8,4].map((n,i)=>`<div style="--h:${n*11}%;--d:${2+i*.1}s"><i></i><small>${['0–4','5–9','10–12','13–15','16–18','19–20'][i]}</small></div>`).join('')}</div></div>
       <div class="bv-pvc bv-pvq" style="--d:.8s"><h5>Por questão</h5>${[['Q1 · Escolha múltipla',92],['Q2 · Verdadeiro/Falso',85],['Q4 · Ordenar acontecimentos',71],['Q7 · Legenda do mapa',58],['Q9 · Associação',63],['Q11 · Resposta curta',44]].map((q,i)=>`<div class="bv-q" style="--w:${q[1]}%;--d:${2.3+i*.12}s"><span>${q[0]}</span><div><i></i></div><em>${q[1]}%</em></div>`).join('')}</div>
       <div class="bv-pvc bv-pva" style="--d:1.1s"><h5>Alunos</h5>${[['Afonso',17],['Beatriz',15],['Carolina',12],['Diogo',9]].map((a,i)=>`<div class="bv-al" style="--d:${2.6+i*.12}s"><span>${a[0][0]}</span><b>${a[0]}</b><em class="${a[1]<10?'neg':''}">${a[1]}</em></div>`).join('')}<div class="bv-pexp">${ic('download',13)} Enviar para a avaliação</div></div></div></div></div>`}
};

BVM.pulso={nome:'Pulso',ic:'chart',tit:'Veja em direto o que a turma já aprendeu.',sub:'Perguntas rápidas com correção automática e uma grelha que se preenche à medida que os alunos respondem — para intervir no momento certo.',
  pe:'Lance uma sala, os alunos entram com o código e as respostas aparecem em direto · sempre formativo, só conta se o professor quiser.',
  maq:()=>{const Q=[['A','B'],['Clorofila','Folhas','Cloroplasto','Pigmento'],['B','A'],['V','F'],['53','170']];
   const AL=[['Afonso Lima',[1,1,1,1,1]],['Beatriz Sousa',[0,0,1,0,null]],['Carlos Pires',[1,0,0,1,1]],['Diana Rocha',[0,0,1,0,0]],['Eva Martins',[0,1,1,0,null]],['Filipe Costa',[0,null,1,0,null]]];
   const cel=(q,ok,r)=>ok===null?'<td class="vz"></td>':`<td class="${ok?'ok':'no'}"><span>${ok?'✓':'✗'} ${ok?Q[q][0]:Q[q][1+((q+r)%(Q[q].length-1))]}</span></td>`;
   const pct=r=>Math.round(r.filter(x=>x===1).length/5*100);
   const tot=q=>Math.round(AL.filter(a=>a[1][q]===1).length/AL.length*100);
   let d=.5;return`<div class="bv-pu2"><div class="bv-puc"><div class="bv-puh"><b>Quiz de Ciências Naturais <i>i</i></b><span class="bv-sp"></span><span class="bv-pub l"><em>❚❚</em> Pausar</span><span class="bv-pub l">${ic('check',14)} Terminar</span><span class="bv-pub">${ic('users',14)} Convidar alunos</span></div>
   <div class="bv-putg">${['Mostrar nomes','Mostrar respostas','Mostrar resultados'].map((t,i)=>`<span style="--d:${.2+i*.1}s"><i></i>${t}</span>`).join('')}</div>
   <table class="bv-put"><thead><tr><th class="n">NOME ↓</th><th class="s">PONTOS ⌄</th>${[1,2,3,4,5].map((n,i)=>`<th style="--c:${['#f5b942','#f2683c','#f5b942','#4f5fa8','#f2683c'][i]}">${n}</th>`).join('')}</tr></thead>
   <tbody>${AL.map((a,r)=>`<tr style="--d:${.3+r*.08}s"><td class="n"><i></i>${a[0]}</td><td class="s">${pct(a[1])}%</td>${a[1].map((ok,q)=>{const c=cel(q,ok,r);d+=.09;return c.replace('<td ',`<td style="--e:${(1+q*.55+r*.12).toFixed(2)}s" `)}).join('')}</tr>`).join('')}
   <tr class="tot"><td class="n">${AL.length} &nbsp;Total da turma</td><td class="s"></td>${[0,1,2,3,4].map(q=>`<td style="--e:${(4.4+q*.1).toFixed(2)}s"><span>${tot(q)}%</span></td>`).join('')}</tr></tbody></table></div>
   <div class="bv-puexp" style="--d:3.2s"><b>${ic('check',14)} Correto!</b><small>Pergunta</small><p>A clorofila dá a cor verde às plantas.</p><small>Explicação</small><p>A clorofila absorve a luz para a fotossíntese.</p></div></div>`}};
function bvAbrir(k){const d=BVM[k];if(!d||$('#mqdemo'))return;
  const o=document.createElement('div');o.id='mqdemo';o.className='bv bv-'+k;o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label',d.nome+' — exemplo');
  o.innerHTML=`<div class="mqd-pn"><button type="button" class="mqd-x" aria-label="Fechar">✕</button>
    <div class="mqd-hero"><div class="mqd-marca">${ic(d.ic,18)} ${d.nome}</div><h2>${d.tit}</h2><p>${d.sub}</p><div class="mqd-bts"><button type="button" class="mqd-go">Começar</button></div></div>
    <div class="mqd-palco"><div class="mqd-mold"><div class="mqd-esc">${d.maq()}</div></div></div><div class="mqd-pe">${d.pe} · volte a ver este exemplo no botão <b>Ver exemplo</b>.</div></div>`;
  document.body.appendChild(o);const esc=o.querySelector('.mqd-esc'),pal=o.querySelector('.mqd-palco');
  const aj=()=>{const s=Math.min(1,(pal.clientWidth-24)/1100,(pal.clientHeight-24)/640);esc.style.transform=`scale(${s})`;esc.parentElement.style.width=(1100*s)+'px';esc.parentElement.style.height=(640*s)+'px'};
  aj();const ro=window.ResizeObserver?new ResizeObserver(aj):null;ro&&ro.observe(pal);
  const fim=()=>{ro&&ro.disconnect();window.removeEventListener('keydown',tec,true);o.classList.add('sai');setTimeout(()=>o.remove(),220);try{S.cfg.bvVisto=S.cfg.bvVisto||{};if(!S.cfg.bvVisto[k]){S.cfg.bvVisto[k]=true;save()}}catch(_){}};
  const tec=e=>{if(e.key==='Escape'){e.stopImmediatePropagation();e.preventDefault();fim()}};window.addEventListener('keydown',tec,true);
  o.querySelector('.mqd-x').onclick=fim;o.querySelector('.mqd-go').onclick=fim;o.onclick=e=>{if(e.target===o)fim()};setTimeout(()=>o.querySelector('.mqd-go').focus(),60)}
/* botão «Ver exemplo» + primeira vez; chamado pelas vistas (moderno/vitrines.js) */
function bvLigar(k){try{const v=$('#view');if(!v)return;let b=$('#bv-ver');if(!b){b=document.createElement('button');b.type='button';b.id='bv-ver';b.className='bv-verb';document.body.appendChild(b)}
  b.dataset.k=k;b.innerHTML=ic('sparkle',15)+'<span>Ver exemplo</span>';b.title='Ver o exemplo de '+BVM[k].nome;b.onclick=()=>bvAbrir(k);
  setTimeout(()=>{try{if(!(S.cfg.bvVisto&&S.cfg.bvVisto[k])&&$('#bv-ver')&&$('#bv-ver').dataset.k===k)bvAbrir(k)}catch(_){}},700)}catch(_){}}
function bvDesligar(){const b=$('#bv-ver');b&&b.remove()}
