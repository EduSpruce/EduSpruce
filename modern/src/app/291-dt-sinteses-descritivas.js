/* Direção de Turma › Sínteses Descritivas: o DT dá a cada aluno uma nota de 0 a 10 em vários parâmetros
   e a ferramenta escreve a síntese de final de período/semestre. As frases variam entre alunos da turma
   (escolhe sempre a variante menos usada) e o texto pode depois ser alterado à mão.
   Dados: dtDados(a,n).sintDT[per][chaveAluno] = {n:{param:0..10}, txt, ed:true se alterado à mão} */
const SDT_P=[
 {k:'apr',n:'Aproveitamento',
  E:['um aproveitamento excelente','resultados escolares de grande qualidade','um aproveitamento muito bom em todas as áreas'],
  B:['um bom aproveitamento','resultados escolares bons','um aproveitamento consistente'],
  F:['O aproveitamento ficou aquém do esperado, sendo necessário mais estudo regular.','Os resultados escolares revelam dificuldades que exigem um estudo mais sistemático.','O aproveitamento precisa de melhorar, com um estudo diário e mais organizado.'],
  M:['O aproveitamento é muito insuficiente, pelo que precisa urgentemente de mudar a sua forma de estudar e de recorrer aos apoios disponíveis.','Os resultados escolares são preocupantes e exigem um esforço muito maior e o recurso aos apoios da escola.','O aproveitamento foi muito fraco, sendo indispensável um plano de estudo acompanhado em casa e na escola.']},
 {k:'ass',n:'Assiduidade',
  E:['uma assiduidade exemplar','uma presença regular e exemplar nas aulas','uma assiduidade irrepreensível'],
  B:['uma boa assiduidade','uma presença regular nas aulas','assiduidade'],
  F:['A assiduidade deve melhorar, uma vez que as faltas prejudicam a aprendizagem.','Registou faltas que comprometem o acompanhamento das matérias.','Deve ser mais assídu{o}, pois as faltas dificultam o acompanhamento das aulas.'],
  M:['A falta de assiduidade é preocupante e coloca em risco o sucesso escolar.','O elevado número de faltas compromete seriamente a aprendizagem e exige atenção imediata da família.','As faltas frequentes são motivo de grande preocupação e põem em causa o aproveitamento.']},
 {k:'pon',n:'Pontualidade',
  E:['uma pontualidade exemplar','pontualidade constante','uma pontualidade irrepreensível'],
  B:['pontualidade','uma boa pontualidade','chegar a horas às aulas'],
  F:['Precisa de ser mais pontual na chegada às aulas.','Os atrasos frequentes devem ser corrigidos.','A pontualidade deve ser melhorada.'],
  M:['Os atrasos sistemáticos perturbam o funcionamento das aulas e têm de ser corrigidos.','A falta de pontualidade é recorrente e precisa de ser corrigida com urgência.','Chega frequentemente atrasad{o}, o que prejudica a sua aprendizagem e a da turma.']},
 {k:'com',n:'Comportamento',
  E:['um comportamento exemplar','uma postura irrepreensível em sala de aula','um comportamento muito correto'],
  B:['um bom comportamento','uma postura adequada em sala de aula','um comportamento correto'],
  F:['O comportamento nem sempre foi adequado, devendo cumprir melhor as regras da sala de aula.','Deve melhorar o comportamento, evitando conversas e distrações.','Precisa de adotar uma postura mais correta em sala de aula.'],
  M:['O comportamento foi inadequado e perturbador, sendo indispensável uma mudança de atitude.','A postura em sala de aula é muito preocupante e prejudica a turma.','O comportamento desrespeitou com frequência as regras, o que tem de mudar.']},
 {k:'par',n:'Participação',
  E:['uma participação muito ativa e pertinente','uma participação oral empenhada e de qualidade','uma participação muito interessada'],
  B:['uma participação interessada','uma participação regular e oportuna','participação ativa nas aulas'],
  F:['Deve participar mais nas aulas, expondo as suas dúvidas e opiniões.','A participação é ainda reduzida e deve ser mais frequente.','Precisa de intervir mais nas aulas e de forma mais organizada.'],
  M:['A participação é praticamente inexistente, sendo necessário um maior envolvimento nas atividades.','Mostra-se alhead{o} das atividades das aulas e precisa de se envolver muito mais.','Não participa nas aulas, o que limita a sua aprendizagem.']},
 {k:'emp',n:'Empenho',
  E:['um empenho notável','grande dedicação e esforço','um empenho constante e exemplar'],
  B:['empenho','um bom nível de esforço','dedicação ao trabalho'],
  F:['Precisa de se empenhar mais e de cumprir as tarefas propostas.','O empenho foi irregular e deve ser mais constante.','Deve investir mais esforço no trabalho de aula e de casa.'],
  M:['A falta de empenho é evidente e compromete os resultados.','Mostrou muito pouco esforço, sendo necessária uma mudança clara de atitude.','O desinteresse pelas tarefas propostas tem de ser ultrapassado.']},
 {k:'tpc',n:'Trabalho autónomo',
  E:['hábitos de trabalho e estudo muito consolidados','grande autonomia no trabalho','um estudo regular e autónomo exemplar'],
  B:['bons hábitos de trabalho','autonomia no trabalho','regularidade nos trabalhos de casa'],
  F:['Deve criar hábitos de estudo regulares e cumprir os trabalhos de casa.','Precisa de ganhar mais autonomia e regularidade no estudo.','Os trabalhos de casa nem sempre foram feitos, o que deve ser corrigido.'],
  M:['Não revela hábitos de estudo nem cumpre os trabalhos de casa, o que é preocupante.','A ausência de estudo autónomo compromete seriamente a aprendizagem.','Precisa de criar, com urgência, uma rotina diária de estudo.']},
 {k:'org',n:'Organização e material',
  E:['grande organização e cuidado com o material','um caderno e material sempre organizados','muito cuidado na organização do trabalho'],
  B:['organização','cuidado com o material','um material organizado'],
  F:['Deve trazer sempre o material necessário e organizar melhor o caderno.','A organização do material deve ser melhorada.','Esquece com alguma frequência o material, o que deve corrigir.'],
  M:['Falta frequentemente com o material e não organiza o trabalho, o que prejudica muito a aprendizagem.','A desorganização e a falta de material são constantes e têm de ser corrigidas.','Raramente traz o material necessário para as aulas.']},
 {k:'rel',n:'Relacionamento',
  E:['um relacionamento exemplar com colegas e adultos','grande respeito e espírito de entreajuda','uma relação muito positiva com todos'],
  B:['um bom relacionamento com colegas e professores','respeito pelos outros','espírito de colaboração'],
  F:['Deve melhorar a forma como se relaciona com os colegas.','Precisa de ser mais respeitos{o} nas relações com colegas e adultos.','O relacionamento com os colegas nem sempre foi adequado.'],
  M:['O relacionamento com colegas e adultos tem sido conflituoso, o que tem de mudar.','Revela atitudes de desrespeito que são inaceitáveis e têm de ser corrigidas.','As relações com os outros têm sido marcadas por conflitos frequentes.']},
 {k:'res',n:'Responsabilidade',
  E:['um elevado sentido de responsabilidade','grande maturidade e responsabilidade','responsabilidade exemplar no cumprimento das tarefas'],
  B:['sentido de responsabilidade','responsabilidade no cumprimento das tarefas','maturidade'],
  F:['Precisa de cumprir com mais rigor os prazos e compromissos.','Deve revelar mais responsabilidade nas tarefas que lhe são pedidas.','O cumprimento de regras e prazos deve ser mais rigoroso.'],
  M:['Revela pouca responsabilidade, não cumprindo prazos nem compromissos.','A falta de responsabilidade é preocupante e exige acompanhamento próximo.','Não cumpre os compromissos assumidos, o que tem de mudar.']}
];
const SDT_AB={
 E:['Ao longo d{o_per}, {N} teve um percurso muito positivo.','{N} concluiu {o_per} com um balanço muito positivo.','O balanço d{o_per} é muito positivo para {o} {aluno} {N}.','{N} fez um trabalho de grande qualidade ao longo d{o_per}.'],
 B:['Ao longo d{o_per}, {N} teve um percurso positivo.','{N} concluiu {o_per} com um balanço globalmente positivo.','O balanço d{o_per} é positivo para {o} {aluno} {N}.','{N} fez um bom trabalho ao longo d{o_per}.'],
 S:['Ao longo d{o_per}, {N} teve um percurso satisfatório, com aspetos a melhorar.','{N} concluiu {o_per} com um balanço suficiente, embora possa fazer mais.','O balanço d{o_per} é satisfatório para {o} {aluno} {N}, que pode ainda melhorar.','{N} fez um trabalho razoável ao longo d{o_per}, com margem para progredir.'],
 F:['Ao longo d{o_per}, {N} revelou dificuldades em várias áreas.','{N} concluiu {o_per} com um balanço pouco satisfatório.','O balanço d{o_per} é pouco positivo para {o} {aluno} {N}.','{N} trabalhou abaixo das suas capacidades ao longo d{o_per}.'],
 M:['Ao longo d{o_per}, {N} teve um percurso preocupante.','{N} concluiu {o_per} com um balanço negativo.','O balanço d{o_per} é preocupante para {o} {aluno} {N}.','{N} ficou muito aquém do esperado ao longo d{o_per}.']};
const SDT_POS=['Destacou-se por {L}.','Revelou {L}.','Demonstrou {L}.','Merecem destaque {L}.','Evidenciou {L}.','Mostrou {L}.'];
const SDT_POS2=['Revelou ainda {L}.','Mostrou também {L}.','Demonstrou igualmente {L}.','Há ainda a assinalar {L}.'];
const SDT_MED=['Em termos de {L}, o desempenho foi satisfatório, mas pode melhorar.','Ao nível de {L}, mostrou um desempenho suficiente, que deve consolidar.','Em matéria de {L}, revelou um desempenho razoável, com margem para progredir.'];
const SDT_FE={
 E:['Parabéns pelo excelente trabalho: deve manter este nível no próximo {per}.','Deve continuar com a mesma dedicação, que é um exemplo para a turma.','Está de parabéns e deve manter esta atitude.'],
 B:['Deve manter o empenho e procurar melhorar ainda mais.','Com a mesma atitude, poderá alcançar resultados ainda melhores.','Deve continuar a trabalhar com regularidade para consolidar o bom percurso.'],
 S:['Com mais empenho e regularidade, poderá melhorar os resultados.','Espera-se uma evolução positiva no próximo {per}, com mais esforço e estudo.','Tem capacidades para fazer melhor, se trabalhar com mais regularidade.'],
 F:['É fundamental mudar de atitude e recorrer aos apoios disponíveis, contando com o acompanhamento da família.','Precisa de se esforçar muito mais no próximo {per}, com o apoio da família e da escola.','Espera-se uma mudança clara de atitude, com estudo diário e acompanhamento em casa.'],
 M:['É urgente uma mudança de atitude, com um acompanhamento próximo da família e da escola.','A situação exige uma intervenção imediata e um esforço muito maior no próximo {per}.','Só com um compromisso sério com o estudo e com o apoio da família poderá inverter esta situação.']};
const sdtNivel=v=>v>=9?'E':v>=7?'B':v>=5?'S':v>=3?'F':'M';
const sdtKey=x=>String(x.cid||x.id||((x.num||'')+'|'+x.nome));
const sdtNome=x=>{const p=String(x.nome||'').trim().split(/\s+/);return p[0]||''};
function sdtHash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function sdtLista(L){return L.length<2?L.join(''):L.slice(0,-1).join(', ')+' e '+L[L.length-1]}
/* gerador: em cada grupo de frases escolhe a variante menos usada na turma (desempate pelo aluno) */
function sdtGerar(x,notas,U,per){const g=x.genero==='F';const sub=s=>s.replace(/\{o\}/g,g?'a':'o').replace(/\{aluno\}/g,g?'aluna':'aluno').replace(/\{N\}/g,sdtNome(x))
   .replace(/\{o_per\}/g,'o '+perNome(per).toLowerCase()).replace(/\{um_per\}/g,'um '+perNome(per).toLowerCase()).replace(/\{per\}/g,perW().toLowerCase());
  const esc1=(id,arr)=>{U[id]=U[id]||{};let best=0,bv=1e9;arr.forEach((_,i)=>{const c=(U[id][i]||0)*1000+((sdtHash(sdtKey(x)+id)+i*7919)%997);if(c<bv){bv=c;best=i}});U[id][best]=(U[id][best]||0)+1;return arr[best]};
  const P=SDT_P.filter(p=>notas[p.k]!=null&&notas[p.k]!=='');if(!P.length)return '';
  const media=P.reduce((a,p)=>a+(+notas[p.k]),0)/P.length;const nm=sdtNivel(Math.round(media));
  const ord=P.slice().sort((a,b)=>(+notas[b.k])-(+notas[a.k])||sdtHash(sdtKey(x)+a.k)-sdtHash(sdtKey(x)+b.k));
  const pos=ord.filter(p=>+notas[p.k]>=7),med=ord.filter(p=>+notas[p.k]>=5&&+notas[p.k]<7),neg=ord.filter(p=>+notas[p.k]<5).reverse();
  const F=[];F.push(esc1('ab'+nm,SDT_AB[nm]));
  const fr=pos.map(p=>esc1(p.k+sdtNivel(+notas[p.k]),p[sdtNivel(+notas[p.k])]));
  if(fr.length){const a=fr.slice(0,3),b=fr.slice(3);const t1=esc1('pos',SDT_POS).replace('{L}',sdtLista(a));F.push(t1);if(b.length)F.push(esc1('pos2',SDT_POS2).replace('{L}',sdtLista(b)))}
  if(med.length)F.push(esc1('med',SDT_MED).replace('{L}',sdtLista(med.map(p=>p.n.toLowerCase()))));
  if(neg.length&&pos.length)F.push(esc1('cont',['No entanto, há aspetos a melhorar.','Ainda assim, há aspetos que exigem atenção.','Há, contudo, aspetos que precisam de mudar.']));
  neg.forEach(p=>F.push(esc1(p.k+sdtNivel(+notas[p.k]),p[sdtNivel(+notas[p.k])])));
  F.push(esc1('fe'+nm,SDT_FE[nm]));
  let s=sub(F.join(' '));s=s.replace(/assídu\{o\}|atrasad\{o\}|alhead\{o\}|respeitos\{o\}/g,m=>m.replace('{o}',g?'a':'o'));return s.replace(/\s+/g,' ').replace(/^./,c=>c.toUpperCase())}
function sdtCorpo(a,n,AL){const D=dtDados(a,n);const per=+UI.sdtPer||perAtual({});const P=periodos();D.sintDT=D.sintDT||{};const R=D.sintDT[per]=D.sintDT[per]||{};
  const feitas=AL.filter(o=>(R[sdtKey(o.x)]||{}).txt).length;
  return `<div class="card sdt"><div class="row" style="flex-wrap:wrap;gap:8px;align-items:center"><h2 style="margin:0">${ic('pen',18)} Sínteses Descritivas</h2><span class="sp1"></span>
    <div class="seg" role="group" aria-label="${esc(perW())}">${P.map(p=>`<button type="button" data-sdtp="${p}" class="${p===per?'on':''}">${esc(perNome(p))}</button>`).join('')}</div>
    <button class="btn sm pri" id="sdt-todas">${ic('refresh',14)} Gerar Todas</button><button class="btn sm" id="sdt-copia">${ic('copy',14)} Copiar Todas</button><button class="btn sm" id="sdt-csv">${ic('download',14)} CSV</button></div>
    <p class="hint">Dê a cada aluno uma nota de <b>0 a 10</b> em cada parâmetro (deixe em branco o que não quer incluir). A síntese é escrita automaticamente, sem repetir as mesmas frases entre alunos, e pode ser alterada à mão: os textos alterados à mão não são substituídos ao gerar de novo. ${feitas} de ${AL.length} sínteses feitas.</p>
    <div class="sdtl">${AL.map(o=>{const k=sdtKey(o.x);const r=R[k]||{};const nt=r.n||{};return `<div class="sdtal" data-sdk="${esc(k)}"><div class="sdth"><b>${esc(o.x.num||'')}. ${esc(o.x.nome)}</b>${r.ed?'<span class="badge">alterada à mão</span>':''}<span class="sp1"></span><button class="btn sm" data-sdtg="${esc(k)}">${ic('refresh',13)} Gerar</button></div>
      <div class="sdtn">${SDT_P.map(p=>`<label><span>${esc(p.n)}</span><input data-sdtn="${p.k}" value="${nt[p.k]??''}" inputmode="numeric" maxlength="2" aria-label="${esc(p.n)} de ${esc(o.x.nome)} (0 a 10)" class="${nt[p.k]!=null&&nt[p.k]!==''?'sdtv'+sdtNivel(+nt[p.k]):''}"></label>`).join('')}</div>
      <textarea data-sdtt rows="4" placeholder="Preencha as notas e carregue em «Gerar».">${esc(r.txt||'')}</textarea></div>`}).join('')}</div></div>`}
function sdtUso(R,excl){/* contagem das variantes já usadas pelos outros alunos (para não repetir) */const U={};Object.entries(R).forEach(([k,r])=>{if(k===excl||!r||!r.u)return;Object.entries(r.u).forEach(([id,i])=>{U[id]=U[id]||{};U[id][i]=(U[id][i]||0)+1})});return U}
function sdtGerarUm(R,o,per){const k=sdtKey(o.x);const r=R[k]=R[k]||{};const U=sdtUso(R,k);const U0=JSON.parse(JSON.stringify(U));const txt=sdtGerar(o.x,r.n||{},U,per);
  const u={};Object.keys(U).forEach(id=>Object.keys(U[id]).forEach(i=>{if((U[id][i]||0)>((U0[id]||{})[i]||0))u[id]=+i}));r.u=u;r.txt=txt;delete r.ed;return txt}
{const k=DT_TABS.findIndex(x=>x[0]==='inter');if(!DT_TABS.some(x=>x[0]==='sdt'))DT_TABS.splice(k>=0?k+1:DT_TABS.length,0,['sdt','pen','Sínteses Descritivas'])}
{const _vDs=vDirecao;vDirecao=function(){const r=_vDs.apply(this,arguments);try{if((UI.dtTab||'painel')!=='sdt')return r;const a=A();const L=minhasDT(a);const n=UI.dtT;if(!a||!L.includes(n))return r;
  const AL=alunosDaClasse(a,n);const v=$('#view');const hd=v.querySelector('.dthead');if(!hd)return r;while(hd.nextSibling)hd.nextSibling.remove();hd.insertAdjacentHTML('afterend',sdtCorpo(a,n,AL));
  const D=dtDados(a,n);const per=+UI.sdtPer||perAtual({});const R=D.sintDT[per];const oDe=k=>AL.find(o=>sdtKey(o.x)===k);
  $$('#view [data-sdtp]').forEach(b=>b.onclick=()=>{UI.sdtPer=+b.dataset.sdtp;vDirecao()});
  $$('#view .sdtal').forEach(box=>{const k=box.dataset.sdk;const r=()=>R[k]=R[k]||{};
    box.querySelectorAll('[data-sdtn]').forEach(i=>i.onchange=()=>{const s=i.value.trim();const o=r();o.n=o.n||{};if(s===''){delete o.n[i.dataset.sdtn];i.className='';save();return}const v=+s;if(!Number.isInteger(v)||v<0||v>10){toast('Nota inteira de 0 a 10.','erro');i.value=o.n[i.dataset.sdtn]??'';return}o.n[i.dataset.sdtn]=v;i.className='sdtv'+sdtNivel(v);save()});
    box.querySelector('[data-sdtt]').oninput=e=>{const o=r();o.txt=e.target.value;o.ed=true;save()};
    box.querySelector('[data-sdtg]').onclick=()=>{const o=r();if(!Object.keys(o.n||{}).length)return toast('Dê primeiro as notas de 0 a 10.','aviso');if(o.ed&&!confirm('Esta síntese foi alterada à mão. Substituir pelo texto gerado?'))return;sdtGerarUm(R,oDe(k),per);save();vDirecao()}});
  $('#sdt-todas').onclick=()=>{let n2=0,ign=0;AL.forEach(o=>{const z=R[sdtKey(o.x)];if(!z||!Object.keys(z.n||{}).length)return;if(z.ed){ign++;return}sdtGerarUm(R,o,per);n2++});save();vDirecao();toast(n2+' síntese(s) gerada(s)'+(ign?' · '+ign+' alterada(s) à mão mantida(s)':''),'ok')};
  $('#sdt-copia').onclick=()=>{const t=AL.map(o=>{const z=R[sdtKey(o.x)];return z&&z.txt?`${o.x.num}. ${o.x.nome}\n${z.txt}`:''}).filter(Boolean).join('\n\n');if(!t)return toast('Ainda não há sínteses.','aviso');navigator.clipboard.writeText(t).then(()=>toast('Sínteses copiadas.','ok'),()=>toast('Não foi possível copiar.','erro'))};
  $('#sdt-csv').onclick=()=>{const rows=[['N.º','Nome',...SDT_P.map(p=>p.n),'Síntese']];AL.forEach(o=>{const z=R[sdtKey(o.x)]||{};rows.push([o.x.num,o.x.nome,...SDT_P.map(p=>(z.n||{})[p.k]??''),z.txt||''])});const b=new Blob([csv(rows)],{type:'text/csv'});const u=URL.createObjectURL(b);const l=document.createElement('a');l.href=u;l.download='Sinteses_'+n.replace(/\W+/g,'_')+'_'+per+'.csv';l.click();setTimeout(()=>URL.revokeObjectURL(u),2000)};
}catch(e){console.warn(e)}return r};if(go._f)go._f.direcao=vDirecao}
