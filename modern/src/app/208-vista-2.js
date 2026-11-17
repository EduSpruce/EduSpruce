/* ---------- vista ---------- */
function cpdHTML(a,C,vista){const N=cpmNomes(a,C);if(!N.length)return cpmMatrizHTML(a,C);const nome=UI.cpmT&&N.includes(UI.cpmT)?UI.cpmT:N[0];UI.cpmT=nome;
  const M=cpmM(nome);const modo=UI.cpdModo||'atual';const S_=cpdSim(a,nome,{ini:modo==='ini'});const S0=modo==='ini'?S_:cpdSim(a,nome,{ini:true});
  const sel=`<div class="row cpm-sel noprint" style="gap:8px;flex-wrap:wrap">${N.map(n=>`<button type="button" class="chip ${n===nome?'on':''}" data-cpmt="${esc(n)}">${esc(n)}</button>`).join('')}</div>`;
  if(!S_.h)return sel+`<section class="card empty">${ic('calendar',28)}<br><b>Falta o horário da turma</b><br><span class="mut">Importe o horário da turma (PDF ou Excel) em «Matriz e Ponto de Situação» para simular os tempos de cada professor.</span></section>`;
  if(!S_.D.length)return sel+`<section class="card empty">${ic('grid',28)}<br><b>A matriz ainda não tem horas</b><br><span class="mut">Preencha as horas das disciplinas e UFCD em «Matriz e Ponto de Situação».</span></section>`;
  const FD=f=>f==='feito'?'<span class="tag ok">concluída</span>':f?fmtIsoL(f):'<span class="neg">não acaba</span>';
  const sem=cpdSemanasFalta(S_,S_.hoje>S_.L.ini?S_.hoje:S_.L.ini);
  const fct=M.fct||{};
  const glob=`<section class="card cpd-g"><div class="row" style="gap:10px;flex-wrap:wrap;align-items:flex-start"><div style="flex:1;min-width:260px"><div class="cpm-tit">${esc(M.curso||'Curso PROFIJ — '+nome)}</div>
      <div class="mut">${fmtIsoL(S_.L.ini)} a ${fmtIsoL(S_.L.fim)} · ${S_.aulas.length} tempos por semana no horário${S_.P0&&modo!=='ini'?` · desde o ponto de situação de ${fmtIsoL(S_.P0.data)}`:''}</div></div>
      <div class="cpd-seg noprint" role="group" aria-label="Simulação"><button type="button" data-cpdm="atual" class="${modo!=='ini'?'on':''}">Situação atual</button><button type="button" data-cpdm="ini" class="${modo==='ini'?'on':''}">Planeamento inicial</button></div></div>
    <div class="cpm-kp"><div class="${S_.falta?'bad':''}"><small>A turma acaba</small><b>${S_.turmaFim==='feito'?'concluída':S_.turmaFim?fmtIsoL(S_.turmaFim):'não acaba'}</b>${S_.falta?`<small class="neg">faltam ${S_.falta} tempos a ${fmtIsoL(S_.L.fim)}</small>`:''}</div>
      <div><small>Planeamento inicial</small><b>${S0.turmaFim==='feito'?'—':S0.turmaFim?fmtIsoL(S0.turmaFim):'não acaba'}</b></div>
      <div><small>Tempos livres até ao fim</small><b>${S_.livres.filter(l=>l.iso>=S_.hoje).length}</b><small>de quem já acabou</small></div>
      <div class="${fct.ini&&fct.fim?'':'w'}"><small>FPCT</small><b>${fct.ini&&fct.fim?cpdDM(fct.ini)+' a '+cpdDM(fct.fim):'por marcar'}</b>${fct.horas?`<small>${cpmCalc(a,nome).fctH} h de ${fct.horas} h</small>`:''}</div></div>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap;margin-top:10px"><button class="btn sm" id="cpd-ced">${ic('repeat',14)} Ceder Tempos</button><button class="btn sm" id="cpd-sub">${ic('user',14)} Substituir Professor(a)</button><button class="btn sm" id="cpm-fct">${ic('building',14)} Período da FPCT</button>
      <label class="chk" style="margin:0 6px"><input type="checkbox" id="cpd-pool" ${M.pool!==false?'checked':''}> <span>Quando uma disciplina acaba, os tempos passam para as outras do mesmo professor</span></label>
      <span class="sp1"></span><button class="btn sm" id="cpd-x-cron">${ic('download',14)} Cronogramas</button><button class="btn sm" id="cpd-x-sem">${ic('calendar',14)} Horários Semanais</button><button class="btn sm pri" id="cpd-x-mat">${ic('printer',14)} Matriz e Distribuição de Serviço</button></div></section>`;
  /* professores (contagem global) */
  const PR=Object.values(S_.P).sort((x,y)=>x.nome.localeCompare(y.nome,'pt'));
  const prof=`<section class="card"><h2 style="margin:0 0 8px">${ic('users',18)} Professores — Contagem Global</h2><div class="cpm-tw"><table class="lst cpd-t"><thead><tr><th>Professor(a)</th><th>Disciplinas e UFCD</th><th class="n">Tempos</th><th class="n">Dados até hoje</th><th class="n">Ficam por dar</th><th>Acaba</th><th>Plano inicial</th><th class="noprint">Simulação</th></tr></thead><tbody>${PR.map(p=>{const p0=S0.P[p.nome];
      const pre=p.falta?Math.ceil(p.falta/sem):0;const lv=S_.livres.filter(l=>l.iso>=S_.hoje).length;
      return `<tr class="${p.falta?'bad':''}"><td><b>${esc(p.nome)}</b></td><td><small>${p.disc.map(d=>`${esc(d.nome)} <span class="mut">(${S_.need[d.id]})</span>`).join(' + ')}</small></td><td class="n"><b>${p.need}</b></td><td class="n">${p.dh}</td><td class="n ${p.falta?'neg':'mut'}">${p.falta}</td><td>${FD(p.fim)}</td><td>${p0?FD(p0.fim):'—'}</td>
        <td class="noprint">${p.falta?`<small>precisa de mais ${pre} tempo(s) por semana${lv?` · há ${lv} livre(s)`:''}</small> <button class="btn sm" data-cpdlv="${esc(p.nome)}">${ic('plus',13)} Dar Tempos Livres</button>`:`<small class="mut">${p.fim==='feito'?'concluído':'chega ao fim'}</small>`}</td></tr>`}).join('')}</tbody></table></div>
    <p class="hint">Cada professor conta a totalidade dos tempos (45 min) de todas as suas disciplinas e UFCD. Quando uma acaba, os tempos dela continuam com as outras do mesmo professor (se a opção acima estiver ligada).</p></section>`;
  /* disciplinas */
  const disc=`<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('grid',18)} Disciplinas e UFCD</h2><span class="sp1"></span>${S_.D.some(cpdMinha)?`<button class="btn sm noprint" id="cpd-my">${ic('user',14)} Criar as Minhas no Modo Professor</button>`:''}</div><p class="hint" style="margin:4px 0 8px">Assinale na coluna «Eu» as disciplinas e UFCD que leciona: essas passam para o modo professor (avaliação, sumários); o resto fica só na coordenação.</p><div class="cpm-tw"><table class="lst cpd-t"><thead><tr><th>Disciplina / UFCD</th><th>Professor(a)</th><th class="n">Tempos</th><th class="n">Dados até hoje</th><th class="n">Ficam por dar</th><th>Fim previsto</th><th>Fim marcado</th><th class="noprint" title="Disciplinas que eu leciono (passam para o modo professor)">Eu</th><th class="noprint"></th></tr></thead><tbody>${S_.D.map(d=>{const f=S_.fim[d.id];const fa=Math.max(0,S_.need[d.id]-S_.done[d.id]);const atr=d.fimMan&&f&&f!=='feito'&&f>d.fimMan;
      return `<tr class="${fa?'bad':atr?'w':''}"><td><b>${esc(d.nome)}</b>${d.det?` <span class="mut">${esc(d.det)}</span>`:''}</td><td>${esc(d.prof||'—')}${(d.subs||[]).map(s=>`<div class="hint">→ ${esc(s.prof)} desde ${cpdDM(s.desde)}</div>`).join('')}</td><td class="n">${S_.need[d.id]}</td><td class="n">${Math.min(Math.max(0,S_.dh[d.id]),S_.need[d.id])}</td><td class="n ${fa?'neg':'mut'}">${fa}</td><td>${FD(f)}</td>
        <td class="noprint"><input type="date" class="cpd-fm" data-cpdfm="${d.id}" value="${esc(d.fimMan||'')}" title="Data de fim marcada à mão (deixe vazio para automática)">${atr?`<div class="hint neg">a previsão passa a data marcada</div>`:''}</td><td class="noprint"><input type="checkbox" data-cpdmy="${d.id}" ${cpdMinha(d)?'checked':''} aria-label="Eu leciono ${esc(d.nome)}"></td><td class="noprint"><button class="btn sm ghost" data-cpdsub="${d.id}" title="Substituir professor a partir de uma data">${ic('user',14)}</button></td></tr>`}).join('')}</tbody></table></div></section>`;
  /* cedências */
  const RE=(M.reat||[]);const dn=id=>{const d=M.disc.find(x=>x.id===id);return d?d.nome:'—'};
  const ced=`<section class="card"><div class="row"><h2 style="margin:0">${ic('repeat',18)} Cedências de Tempos</h2><span class="sp1"></span><button class="btn sm noprint" id="cpd-ced2">${ic('plus',14)} Nova</button></div>
    ${RE.length?`<ul class="cpd-rl">${RE.map(r=>`<li><span>${r.origem==='*'?'<b>Tempos livres</b>':`Tempos de <b>${esc(dn(r.origem))}</b>`} → <b>${esc(dn(r.destino))}</b> <span class="mut">${r.quando==='fim'&&r.origem!=='*'?'quando acabar':''}${r.desde?' desde '+fmtIsoL(r.desde):''}${r.ate?' até '+fmtIsoL(r.ate):''}</span></span><button class="btn sm ghost noprint" data-cpdrx="${r.id}" title="Apagar">${ic('trash',13)}</button></li>`).join('')}</ul>`:`<p class="mut" style="margin:8px 0 0">Ex.: quando TIC acabar, os tempos de TIC passam para Inglês. A app recalcula logo a nova data de fim de cada um.</p>`}</section>`;
  if(vista==='equipa'){const eq=`<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('users',18)} Equipa Pedagógica · ${esc(nome)}</h2><span class="sp1"></span><button class="btn sm" id="cpd-sub">${ic('user',14)} Substituir Professor(a)</button><button class="btn sm pri" id="cpd-x-mat">${ic('printer',14)} Matriz e Distribuição de Serviço</button></div><p class="hint" style="margin:6px 0 0">Quem leciona cada disciplina e UFCD, a contagem global de tempos de cada professor e quando acaba no planeamento inicial. Assinale na coluna «Eu» o que leciona (passa para o modo professor).</p>
      <label class="chk" style="margin:8px 0 0"><input type="checkbox" id="cpd-pool" ${M.pool!==false?'checked':''}> <span>Quando uma disciplina acaba, os tempos passam para as outras do mesmo professor</span></label></section>`;return sel+eq+disc+prof}
  return sel+glob+ced+cpdSemanaHTML(a,nome,S_)+prof}
/* horário semanal com datas */
function cpdSemanaHTML(a,nome,S_){const M=S_.M;const hj=S_.hoje<S_.L.ini?S_.L.ini:S_.hoje>S_.L.fim?S_.L.fim:S_.hoje;const seg=UI.cpdSem||cpdSeg(hj);
  return `<section class="card cpd-sw"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('calendar',18)} Horário Semanal</h2><span class="sp1"></span>
    <div class="row noprint" style="gap:4px"><button class="btn sm" data-cpdw="-7" aria-label="Semana anterior">${ic('back',14)}</button><button class="btn sm" data-cpdw="0">Esta Semana</button><button class="btn sm" data-cpdw="7" aria-label="Semana seguinte"><span style="display:inline-block;transform:rotate(180deg)">${ic('back',14)}</span></button></div></div>
    ${cpdGrelha(S_,seg,true)}<p class="hint noprint">Toque num tempo para o mudar só nesta semana (outra disciplina, ou livre). O número é o tempo dessa disciplina (ex.: 31/94). Em baixo, o que falta a cada professor no fim da semana.</p></section>`}
function cpdGrelha(S_,seg,edit){const M=S_.M;const dias=CPD_DS.map(w=>cpdMais(seg,w-1));const T=[...new Set(S_.aulas.map(x=>x.ini))].sort((x,y)=>x-y);
  const E={};S_.log.forEach(e=>{if(e.iso>=seg&&e.iso<=dias[4])E[e.iso+'|'+e.sk]=e});const wk=(M.sem||{})[seg]||{};
  const dd=id=>S_.D.find(d=>d.id===id);
  const cab=`<tr><th></th>${dias.map((iso,i)=>{const t=cpmTipo(iso,M,S_.L,S_.c);return `<th class="${t!=='let'?'cpd-nl':''}">${DIAS_C[i+1]} ${cpdDM(iso)}${t!=='let'?`<div class="cpd-tp">${{fer:'feriado',int:'interrupção',fct:'FPCT',nl:'sem aulas',fora:'fora do ano',fds:''}[t]||''}</div>`:''}</th>`}).join('')}</tr>`;
  const lin=T.map(ini=>{const x0=S_.aulas.find(x=>x.ini===ini);return `<tr><th class="cpd-h">${cpdHm(ini)}<small>${x0?cpdHm(x0.fim):''}</small></th>${dias.map((iso,i)=>{const w=i+1;const x=S_.aulas.find(z=>z.dia===w&&z.ini===ini);if(!x)return '<td class="cpd-v"></td>';
      const sk=cpdSk(x);const t=cpmTipo(iso,M,S_.L,S_.c);const e=E[iso+'|'+sk];const ov=wk[sk]!=null&&wk[sk]!=='';
      if(t!=='let')return `<td class="cpd-nl"><small>${esc(x.ab)}</small></td>`;
      if(!e)return `<td class="cpd-v"><small>${esc(x.ab)}</small></td>`;
      const d=e.id&&dd(e.id);const at=edit?` data-cpdc="${esc(seg+'|'+sk)}" tabindex="0" role="button"`:'';
      return d?`<td class="cpd-c ${ov?'ov':''} v-${e.via}"${at} style="--dc:${corDisc(d.nome)}"${e.hist?` title="Aula já contada no ponto de situação de ${S_.P0?esc(fmtIsoL(S_.P0.data)):''}"`:''}><b>${esc(cpdCurto(d))}</b><small>${esc(e.prof.split(' ')[0])}${e.prof.split(' ').length>1?' '+esc(e.prof.split(' ').slice(-1)[0]):''}</small><i>${e.n}/${S_.need[d.id]}</i>${e.via==='professor'||e.via==='cedido'||e.via==='livre'?`<em title="tempo de ${esc(x.ab)}">${esc(x.ab)}</em>`:''}</td>`
        :`<td class="cpd-c livre ${ov?'ov':''}"${at}><b>livre</b><small>${esc(x.ab)}</small></td>`}).join('')}</tr>`}).join('');
  const fimS=dias[4];const n=cpdAte(S_,fimS);const PR={};S_.D.forEach(d=>{const p=cpdProfEm(d,fimS);PR[p]=(PR[p]||0)+Math.max(0,S_.need[d.id]-n[d.id])});
  const rod=`<div class="cpd-rod">${Object.entries(PR).sort((x,y)=>x[0].localeCompare(y[0],'pt')).map(([p,f])=>`<span class="${f?'':'ok'}"><b>${esc(p)}</b> ${f?'faltam '+f:'acabou'}</span>`).join('')}</div>`;
  return `<div class="cpm-tw"><table class="cpd-gr"><thead>${cab}</thead><tbody>${lin}</tbody></table></div>${rod}`}
const corDisc=n=>{let h=0;for(const ch of String(n))h=(h*31+ch.charCodeAt(0))%360;return `hsl(${h} 55% 45%)`};
/* ---------- diálogos ---------- */
function cpdCedDlg(nome,pre){const M=cpmM(nome);const D=M.disc.filter(d=>cpmAulas(d.horas)>0);const op=(v,s)=>D.map(d=>`<option value="${d.id}" ${v===d.id?'selected':''}>${esc(d.nome)}${d.prof?' · '+esc(d.prof):''}</option>`).join('');pre=pre||{};
  openDrawer('Ceder Tempos · '+nome,`<div class="ed"><label>Os tempos de</label><select id="cd-o"><option value="*" ${pre.origem==='*'?'selected':''}>Qualquer tempo livre (de quem já acabou)</option>${op(pre.origem)}</select>
    <label>passam para</label><select id="cd-d">${op(pre.destino)}</select>
    <label>Quando</label><select id="cd-q"><option value="fim">Quando a disciplina de origem acabar</option><option value="data">Já, a partir da data indicada (mesmo que a origem não tenha acabado)</option></select>
    <div class="row" style="gap:10px"><div style="flex:1"><label>Desde</label><input type="date" id="cd-i" value="${esc(pre.desde||'')}"></div><div style="flex:1"><label>Até (opcional)</label><input type="date" id="cd-f"></div></div>
    <p class="hint">A app volta a simular o ano e mostra a nova data de fim de cada professor. Pode apagar a cedência a qualquer momento.</p>
    <div class="row" style="margin-top:12px"><span class="sp1"></span><button class="btn" id="cd-x">Cancelar</button><button class="btn pri" id="cd-ok">Guardar</button></div></div>`);
  $('#cd-x').onclick=closeDrawer;$('#cd-ok').onclick=()=>{const o=$('#cd-o').value,d=$('#cd-d').value;if(o===d)return toast('Escolha disciplinas diferentes.','aviso');
    M.reat=M.reat||[];M.reat.push({id:uid(),origem:o,destino:d,quando:$('#cd-q').value,desde:$('#cd-i').value,ate:$('#cd-f').value});save();closeDrawer();vCProfij();toast('Cedência guardada: datas recalculadas.')}}
function cpdSubDlg(nome,id){const M=cpmM(nome);const d=M.disc.find(x=>x.id===id)||M.disc[0];if(!d)return;
  openDrawer('Substituir Professor(a)',`<div class="ed"><label>Disciplina / UFCD</label><select id="sb-d">${M.disc.map(x=>`<option value="${x.id}" ${x.id===d.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select>
    <label>Novo(a) professor(a)</label><input id="sb-p" placeholder="nome"><label>A partir de</label><input type="date" id="sb-i" value="${isoHoje()}">
    <div id="sb-l">${(d.subs||[]).length?`<p class="hint">Já registadas: ${(d.subs||[]).map(s=>esc(s.prof)+' desde '+fmtIsoL(s.desde)).join(' · ')} <button class="btn sm ghost" id="sb-lx">Limpar</button></p>`:''}</div>
    <p class="hint">Os tempos dados até essa data contam para o(a) professor(a) anterior; os seguintes contam para o(a) novo(a), também na contagem global dele(a).</p>
    <div class="row" style="margin-top:12px"><span class="sp1"></span><button class="btn" id="sb-x">Cancelar</button><button class="btn pri" id="sb-ok">Guardar</button></div></div>`);
  const lx=$('#sb-lx');if(lx)lx.onclick=()=>{d.subs=[];save();closeDrawer();vCProfij()};
  $('#sb-x').onclick=closeDrawer;$('#sb-ok').onclick=()=>{const x=M.disc.find(z=>z.id===$('#sb-d').value);const p=$('#sb-p').value.trim(),i=$('#sb-i').value;if(!p||!i)return toast('Indique o professor e a data.','aviso');x.subs=x.subs||[];x.subs.push({desde:i,prof:p});save();closeDrawer();vCProfij()}}
function cpdCelDlg(nome,seg,sk){const M=cpmM(nome);M.sem=M.sem||{};const W=M.sem[seg]=M.sem[seg]||{};const D=M.disc.filter(d=>cpmAulas(d.horas)>0);const [w,ini]=sk.split('|').map(Number);const v=W[sk]||'';
  openDrawer(DIAS[w]+' '+cpdDM(cpdMais(seg,w-1))+' · '+cpdHm(ini),`<div class="ed"><p class="hint" style="margin-top:0">Muda só este tempo, só nesta semana.</p><div class="cpd-op">
    <label class="chk"><input type="radio" name="cpdo" value="" ${!v?'checked':''}> <span>Automático (horário e cedências)</span></label>
    <label class="chk"><input type="radio" name="cpdo" value="livre" ${v==='livre'?'checked':''}> <span>Livre (não há aula)</span></label>
    ${D.map(d=>`<label class="chk"><input type="radio" name="cpdo" value="${d.id}" ${v===d.id?'checked':''}> <span>${esc(d.nome)} <small class="mut">${esc(d.prof||'')}</small></span></label>`).join('')}</div>
    <div class="row" style="margin-top:12px"><button class="btn" id="cc-all">Limpar a Semana</button><span class="sp1"></span><button class="btn" id="cc-x">Cancelar</button><button class="btn pri" id="cc-ok">Guardar</button></div></div>`);
  $('#cc-x').onclick=closeDrawer;$('#cc-all').onclick=()=>{delete M.sem[seg];save();closeDrawer();vCProfij()};
  $('#cc-ok').onclick=()=>{const r=document.querySelector('input[name=cpdo]:checked');const x=r?r.value:'';if(x)W[sk]=x;else delete W[sk];if(!Object.keys(W).length)delete M.sem[seg];save();closeDrawer();vCProfij()}}
function cpdBind(v,a){const nome=UI.cpmT;const M=cpmM(nome);const q=s=>v.querySelector(s);
  v.querySelectorAll('[data-cpmt]').forEach(b=>b.onclick=()=>{UI.cpmT=b.dataset.cpmt;vCProfij()});
  v.querySelectorAll('[data-cpdm]').forEach(b=>b.onclick=()=>{UI.cpdModo=b.dataset.cpdm;manterPosicao(vCProfij)});
  [q('#cpd-ced'),q('#cpd-ced2')].forEach(b=>b&&(b.onclick=()=>cpdCedDlg(nome)));
  const sb=q('#cpd-sub');if(sb)sb.onclick=()=>cpdSubDlg(nome);v.querySelectorAll('[data-cpdsub]').forEach(b=>b.onclick=()=>cpdSubDlg(nome,b.dataset.cpdsub));
  const fc=q('#cpm-fct');if(fc)fc.onclick=()=>cpmFctDlg(nome);
  const pl=q('#cpd-pool');if(pl)pl.onchange=()=>{M.pool=pl.checked;save();manterPosicao(vCProfij)};
  v.querySelectorAll('[data-cpdfm]').forEach(i=>i.onchange=()=>{const d=M.disc.find(x=>x.id===i.dataset.cpdfm);if(d){d.fimMan=i.value;save();manterPosicao(vCProfij)}});
  v.querySelectorAll('[data-cpdrx]').forEach(b=>b.onclick=()=>{M.reat=(M.reat||[]).filter(r=>r.id!==b.dataset.cpdrx);save();manterPosicao(vCProfij)});
  v.querySelectorAll('[data-cpdlv]').forEach(b=>b.onclick=()=>{const S_=cpdSim(a,nome);const p=S_.P[b.dataset.cpdlv];const d=p&&p.disc.find(x=>S_.done[x.id]<S_.need[x.id]);if(d)cpdCedDlg(nome,{origem:'*',destino:d.id,desde:isoHoje()})});
  v.querySelectorAll('[data-cpdw]').forEach(b=>b.onclick=()=>{const n=+b.dataset.cpdw;UI.cpdSem=n?cpdMais(UI.cpdSem||cpdSeg(isoHoje()),n):cpdSeg(isoHoje());manterPosicao(vCProfij)});
  v.querySelectorAll('[data-cpdc]').forEach(c=>{const f=()=>{const [s,sk]=[c.dataset.cpdc.slice(0,10),c.dataset.cpdc.slice(11)];cpdCelDlg(nome,s,sk)};c.onclick=f;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}});
  v.querySelectorAll('[data-cpdmy]').forEach(i=>i.onchange=()=>{const d=M.disc.find(x=>x.id===i.dataset.cpdmy);if(d){d.minha=i.checked;save();manterPosicao(vCProfij)}});
  const my=q('#cpd-my');if(my)my.onclick=()=>cpdCriarMinhas(a,nome);
  const xc=q('#cpd-x-cron');if(xc)xc.onclick=()=>cpdExpCron(a,nome);const xs=q('#cpd-x-sem');if(xs)xs.onclick=()=>cpdExpSem(a,nome);const xm=q('#cpd-x-mat');if(xm)xm.onclick=()=>cpdExpMat(a,nome)}
