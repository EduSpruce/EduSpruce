/* ---------- diagnóstico ---------- */
function diagnostico(){const L=[];const a=A();if(!a)return [{g:'aviso',t:'Ainda não há ano letivo.',f:()=>go('turmas')}];const hj=isoData(new Date());
  if(!S.cfg.professor)L.push({g:'aviso',t:'Falta o seu nome em Definições — é necessário para reconhecer as suas aulas nos horários.',f:()=>{UI.defTab='geral';go('definicoes')}});
  if(!a.calendario)L.push({g:'aviso',t:'Sem calendário escolar: períodos, aulas previstas e contagens não estão disponíveis.',f:()=>go('calendario')});
  if(!S.cfg.ultimaCopia||Date.now()-S.cfg.ultimaCopia>14*864e5)L.push({g:'aviso',t:'Não exporta uma cópia de segurança há mais de 14 dias.',f:()=>{UI.defTab='dados';go('definicoes')}});
  a.turmas.forEach(t=>{const nm=esc(t.nome+' · '+t.disciplina);const abrir=v=>()=>{S.turmaAtiva=t.id;save();go(v)};
    const ws=t.dominios.reduce((s,d)=>s+(+d.peso||0),0);if(t.dominios.length&&Math.round(ws)!==100)L.push({g:'erro',t:nm+': as ponderações somam '+ws+'% (devem somar 100%).',f:()=>{normalizarPesos(t);toast('Ponderações corrigidas para 100%','ok');go(VIEW)}});
    if(!aulasTurma(t,a).length)L.push({g:'aviso',t:nm+': sem aulas no horário.',f:abrir('horario')});
    if(!t.alunos.some(x=>x.frequenta))L.push({g:'aviso',t:nm+': nenhum aluno assinalado como frequentando.',f:abrir('alunos')});
    t.instrumentos.forEach(i=>{if(!i.itens.length)L.push({g:'erro',t:nm+' · '+esc(i.nome)+': sem itens/cotações.',f:()=>{S.turmaAtiva=t.id;UI.inst=i.id;UI.instTab='itens';save();go('instrumentos')}});
      if(!i.data)L.push({g:'aviso',t:nm+' · '+esc(i.nome)+': sem data.',f:()=>{S.turmaAtiva=t.id;UI.inst=i.id;save();go('instrumentos')}});
      const acima=Object.entries(i.notas||{}).some(([aid,n])=>i.itens.some(it=>num(n[it.id])>(+it.cot||0)));if(acima)L.push({g:'erro',t:nm+' · '+esc(i.nome)+': há cotações acima do máximo do item.',f:()=>{S.turmaAtiva=t.id;UI.inst=i.id;UI.instTab='notas';save();go('instrumentos')}});
      if(i.data&&a.calendario&&ehTeste(i)){const oc=ocorrenciasTurma(t,a);if(!oc[i.data])L.push({g:'aviso',t:nm+' · '+esc(i.nome)+': marcado a '+fmtIso(i.data)+', dia sem aula desta turma.',f:abrir('testes')})}});
  });return L}
function normalizarPesos(t){const ws=t.dominios.reduce((s,d)=>s+(+d.peso||0),0);if(!ws)return;let acc=0;t.dominios.forEach((d,k)=>{if(k<t.dominios.length-1){d.peso=Math.round(100*(+d.peso||0)/ws);acc+=d.peso}else d.peso=100-acc});save()}
/* ---------- testes automáticos dos cálculos ---------- */
function autoTestes(){const err=[];let ok=0;const chk=(n,v,e)=>{try{window.__regT&&window.__regT(n,v,e)}catch(_){}if(Math.abs((v==null?NaN:v)-e)<1e-6)ok++;else err.push(n+': obtido '+v+', esperado '+e)};
  const doms=[{id:'d1',ab:'A',nome:'A',peso:50},{id:'d2',ab:'B',nome:'B',peso:50}];
  const t={id:'tt',nome:'T',ciclo:'sec',anoEsc:'10.º',disciplina:'X',dominios:doms,mencoes:MENCOES_DEF.map(m=>({...m})),regra:{2:'media',3:'media'},alunos:[{id:'a1',frequenta:true}],
    instrumentos:[{id:'i1',periodo:1,itens:[{id:'x1',dom:'d1',cot:10},{id:'x2',dom:'d2',cot:10}],notas:{a1:{x1:8,x2:6}}},{id:'i2',periodo:2,itens:[{id:'y1',dom:'d1',cot:20}],notas:{a1:{y1:10}}}]};
  try{const p1=pctsPer(t,'a1',1);chk('% domínio A (1.º)',p1.d1,0.8);chk('% domínio B (1.º)',p1.d2,0.6);chk('nota 1.º',ponderada(t,p1),0.7);
    const f2=pctsFinal(t,'a1',2);chk('média acumulada A (2.º)',f2.d1,0.65);chk('B mantém 1.º',f2.d2,0.6);chk('nota final 2.º',ponderada(t,f2),0.625);
    chk('menção 49,4 % = Insuficiente',(mencao(t,0.494)||{}).nome==='Insuficiente'?1:0,1);chk('menção 69,5 % = Bom',(mencao(t,0.695)||{}).nome==='Bom'?1:0,1);
    const t2={...t,regra:{2:'periodo',3:'media'}};chk('regra “só o período”',pctsFinal(t2,'a1',2).d1,0.5)}catch(e){err.push('erro: '+e.message)}
  return {ok,f:err.length,err}}
/* ---------- novidades ---------- */
