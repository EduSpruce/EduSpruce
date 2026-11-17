/* ---------- exportação (documento para imprimir ou guardar em PDF) ---------- */
const CPD_CSS=`body{font:11px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;color:#111;margin:0}h1{font-size:16px;margin:0 0 2px}h2{font-size:13px;margin:14px 0 6px}.m{color:#555;margin:0 0 8px}
table{border-collapse:collapse;width:100%;margin:0 0 8px}th,td{border:1px solid #9aa4ad;padding:3px 5px;text-align:left;vertical-align:top}th{background:#eef2f5}td.n,th.n{text-align:right}
.pg{break-after:page;page-break-after:always}.pg:last-child{break-after:auto}.cpd-gr td,.cpd-gr th{text-align:center;width:18%}.cpd-gr th:first-child{width:8%}.cpd-gr b{display:block}.cpd-gr small{display:block;color:#555}.cpd-gr i{font-style:normal;font-weight:700}
.nl{background:#f1f1f1;color:#888}.lv{background:#fff7d6}.rod span{display:inline-block;margin:0 12px 0 0}.ass{margin-top:28px;display:flex;justify-content:flex-end}.ass div{text-align:center;min-width:240px}.ass i{display:block;border-top:1px solid #333;margin-bottom:4px}
@page{size:A4;margin:12mm}@page land{size:A4 landscape}.land{page:land}`;
/* logótipos da escola (canto superior direito e centrado em baixo) em todas as páginas dos documentos impressos */
function docLogosHTML(corpo,sel){const e=(typeof EC==='function'&&EC())||{};if(!e.logoDir&&!e.logoBaixo)return corpo;const D=e.logoDir?`<img class="lgD" src="${e.logoDir}" alt="">`:'',B=e.logoBaixo?`<img class="lgB" src="${e.logoBaixo}" alt="">`:'';
  const css=`<style>.lgpg{position:relative;display:flex;flex-direction:column;box-sizing:border-box}.lgpg>*{flex:none}.lgpg>h1,.lgpg>.hdr{padding-right:46mm}.lgD{position:absolute;top:0;right:0;max-height:14mm;max-width:42mm;object-fit:contain}.lgB{margin-top:auto;align-self:center;max-height:12mm;max-width:60mm;object-fit:contain;padding-top:4mm}@media print{.lgpg{min-height:265mm}.lgpg.land{min-height:180mm}}</style>`;
  let n=0;const out=corpo.replace(new RegExp('<section class="('+(sel||'pg')+')([^"]*)"','g'),(m,a,b)=>{n++;return `<section class="${a}${b} lgpg"`}).replace(/<section class="([^"]*\blgpg\b[^"]*)"([^>]*)>/g,(m)=>m+D);
  if(!n)return css+D+corpo+`<div style="text-align:center">${B}</div>`;
  /* rodapé: antes do fecho de cada página */
  let k=0;const partes=out.split('</section>');return css+partes.map((p,i)=>i<partes.length-1&&/lgpg/.test(p.slice(p.lastIndexOf('<section')))?p+B:p).join('</section>')}
function cpdDoc(tit,corpo){corpo=docLogosHTML(corpo);const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';document.body.appendChild(f);
  const w=f.contentWindow;w.document.open();w.document.write(`<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><title>${esc(tit)}</title><style>${CPD_CSS}</style></head><body>${corpo}</body></html>`);w.document.close();
  setTimeout(()=>{try{w.focus();w.print()}catch(e){console.warn(e)}setTimeout(()=>f.remove(),60000)},300)}
const cpdCab=(M,nome,t)=>`<h1>${esc(t)}</h1><p class="m">${esc(M.curso||'Curso PROFIJ')} · ${esc(nome)}${S.cfg.escola?' · '+esc(S.cfg.escola):''} · ${fmtIsoL(isoHoje())}</p>`;
const cpdAss=()=>`<div class="ass"><div>${cpAssImg()}<i></i>O(A) Coordenador(a) do PROFIJ<br>${esc(S.cfg.professor||'')}</div></div>`;
function cpdExpCron(a,nome){const S_=cpdSim(a,nome);const M=S_.M;const PR=Object.values(S_.P).sort((x,y)=>x.nome.localeCompare(y.nome,'pt'));
  const dn=id=>{const d=S_.D.find(x=>x.id===id);return d?cpdCurto(d):''};
  const html=PR.map(p=>{const L=S_.log.filter(e=>e.id&&e.prof===p.nome);const porD={};L.forEach(e=>(porD[e.iso]=porD[e.iso]||[]).push(e));let ac=0;
    const lin=Object.keys(porD).sort().map(iso=>{const E=porD[iso];ac+=E.length;const d=dataDeIso(iso);return `<tr><td>${cpdDM(iso)}/${iso.slice(0,4)}</td><td>${DIAS_C[d.getDay()]}</td><td>${E.map(e=>esc(dn(e.id))+' '+e.n).join(' · ')}</td><td class="n">${E.length}</td><td class="n">${ac}</td></tr>`}).join('');
    return `<section class="pg">${cpdCab(M,nome,'Cronograma — '+p.nome)}<p class="m">${p.disc.map(d=>esc(d.nome)+' ('+S_.need[d.id]+' tempos)').join(' + ')} = <b>${p.need} tempos</b> · acaba: <b>${p.fim==='feito'?'concluído':p.fim?fmtIsoL(p.fim):'não acaba (faltam '+p.falta+')'}</b></p>
      <table><thead><tr><th>Data</th><th>Dia</th><th>Tempos (disciplina e n.º do tempo)</th><th class="n">No dia</th><th class="n">Acumulado</th></tr></thead><tbody>${lin||'<tr><td colspan="5">Sem tempos a partir da data de referência.</td></tr>'}</tbody></table>${cpdAss()}</section>`}).join('');
  cpdDoc('Cronogramas '+nome,html);
  const q=v=>{v=v==null?'':String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const R=[['Data','Dia','Hora','Tempo do horário','Disciplina/UFCD','N.º do tempo','Total','Professor(a)','Origem']];
  S_.log.forEach(e=>{const x=S_.aulas.find(z=>cpdSk(z)===e.sk)||{};const d=e.id&&S_.D.find(z=>z.id===e.id);R.push([e.iso,DIAS_C[dataDeIso(e.iso).getDay()],x.ini!=null?cpdHm(x.ini):'',x.ab||'',d?d.nome:'livre',e.n||'',d?S_.need[d.id]:'',e.prof||'',{horario:'horário',professor:'mesmo professor',cedido:'cedência',livre:'tempo livre',semana:'alteração da semana'}[e.via]||e.via])});
  download('cronograma-'+normSig(nome)+'-'+isoHoje()+'.csv','﻿'+R.map(l=>l.map(q).join(';')).join('\n'),'text/csv')}
function cpdExpSem(a,nome){const S_=cpdSim(a,nome);const M=S_.M;const de=prompt('Primeira semana (AAAA-MM-DD):',cpdSeg(S_.hoje<S_.L.ini?S_.L.ini:S_.hoje));if(!de)return;const ate=prompt('Última semana (AAAA-MM-DD):',S_.turmaFim&&S_.turmaFim!=='feito'?S_.turmaFim:S_.L.fim);if(!ate)return;
  let html='';for(let s=cpdSeg(de);s<=ate;s=cpdMais(s,7)){html+=`<section class="pg land">${cpdCab(M,nome,'Horário Semanal — '+fmtIsoL(s)+' a '+fmtIsoL(cpdMais(s,4)))}${cpdGrelha(S_,s,false).replace(/class="cpd-nl"/g,'class="nl"').replace(/cpd-c livre/g,'lv').replace(/<div class="cpd-rod">/,'<p class="rod"><b>No fim da semana:</b> ').replace(/<\/div>$/,'</p>')}${cpdAss()}</section>`}
  cpdDoc('Horários semanais '+nome,html)}
function cpdExpMat(a,nome){const S_=cpdSim(a,nome);const S0=cpdSim(a,nome,{ini:true});const M=S_.M;const K=cpmCalc(a,nome);
  const comp=CPM_COMP.filter(([k])=>k!=='pratica').map(([k,l])=>{const L=S_.D.filter(d=>d.comp===k);if(!L.length)return '';const hh=L.reduce((s,d)=>s+(+d.horas||0),0),tt=L.reduce((s,d)=>s+S_.need[d.id],0);
    return `<tr><th colspan="9">${l}</th></tr>${L.map(d=>{const r=K.R.find(x=>x.d.id===d.id)||{};return `<tr><td>${esc(d.nome)}${d.det?' <small>'+esc(d.det)+'</small>':''}</td><td class="n">${d.horas}</td><td class="n">${S_.need[d.id]}</td><td>${esc(d.prof||'')}${(d.subs||[]).map(s=>'<br><small>→ '+esc(s.prof)+' desde '+cpdDM(s.desde)+'</small>').join('')}</td><td>${esc((d.sig||[]).join(', '))}</td><td class="n">${r.semT||''}</td><td class="n">${Math.min(Math.max(0,S_.dh[d.id]),S_.need[d.id])}</td><td>${S0.fim[d.id]&&S0.fim[d.id]!=='feito'?fmtIsoL(S0.fim[d.id]):'—'}</td><td>${S_.fim[d.id]==='feito'?'concluída':S_.fim[d.id]?fmtIsoL(S_.fim[d.id]):'não acaba'}${d.fimMan?'<br><small>marcada: '+fmtIsoL(d.fimMan)+'</small>':''}</td></tr>`}).join('')}<tr><td><b>Total da componente</b></td><td class="n"><b>${hh}</b></td><td class="n"><b>${tt}</b></td><td colspan="6"></td></tr>`}).join('');
  const f=M.fct||{};
  const mat=`<section class="pg">${cpdCab(M,nome,'Matriz Curricular e Distribuição de Serviço')}<p class="m">${[M.area&&'Área: '+esc(M.area),M.nivel&&'Nível: '+esc(M.nivel),M.anoCurso&&'Ano: '+esc(M.anoCurso),M.ref&&'Referencial: '+esc(M.ref)].filter(Boolean).join(' · ')} · ${fmtIsoL(S_.L.ini)} a ${fmtIsoL(S_.L.fim)}</p>
    <table><thead><tr><th>Disciplina / UFCD</th><th class="n">Horas</th><th class="n">Tempos (45 min)</th><th>Professor(a)</th><th>No horário</th><th class="n">Tempos/sem.</th><th class="n">Dados até hoje</th><th>Fim (plano inicial)</th><th>Fim previsto</th></tr></thead><tbody>${comp}</tbody></table>
    ${f.ini&&f.fim?`<p><b>FPCT:</b> ${fmtIsoL(f.ini)} a ${fmtIsoL(f.fim)} · ${K.fctH} h possíveis${f.horas?' de '+f.horas+' h exigidas':''}</p>`:''}
    <p><b>A turma acaba:</b> ${S_.turmaFim==='feito'?'concluída':S_.turmaFim?fmtIsoL(S_.turmaFim):'não acaba no ano (faltam '+S_.falta+' tempos)'} · plano inicial: ${S0.turmaFim&&S0.turmaFim!=='feito'?fmtIsoL(S0.turmaFim):'—'}</p>
    <h2>Distribuição de Serviço (contagem global por professor)</h2><table><thead><tr><th>Professor(a)</th><th>Disciplinas e UFCD</th><th class="n">Tempos</th><th class="n">Dados até hoje</th><th class="n">Ficam por dar</th><th>Acaba</th></tr></thead><tbody>${Object.values(S_.P).sort((x,y)=>x.nome.localeCompare(y.nome,'pt')).map(p=>`<tr><td>${esc(p.nome)}</td><td>${p.disc.map(d=>esc(d.nome)+' ('+S_.need[d.id]+')').join(' + ')}</td><td class="n">${p.need}</td><td class="n">${p.dh}</td><td class="n">${p.falta}</td><td>${p.fim==='feito'?'concluído':p.fim?fmtIsoL(p.fim):'não acaba'}</td></tr>`).join('')}</tbody></table>${cpdAss()}</section>`;
  /* horário original da turma */
  const T=[...new Set(S_.aulas.map(x=>x.ini))].sort((x,y)=>x-y);const leg=(S_.h.legenda||[]);
  const hor=`<section class="pg land">${cpdCab(M,nome,'Horário Original da Turma')}<table class="cpd-gr"><thead><tr><th></th>${CPD_DS.map(w=>`<th>${DIAS[w]}</th>`).join('')}</tr></thead><tbody>${T.map(ini=>{const x0=S_.aulas.find(x=>x.ini===ini);return `<tr><th>${cpdHm(ini)}<small>${x0?cpdHm(x0.fim):''}</small></th>${CPD_DS.map(w=>{const x=S_.aulas.find(z=>z.dia===w&&z.ini===ini);if(!x)return '<td></td>';const l=leg.find(l=>normSig(l.ab)===normSig(x.ab));return `<td><b>${esc(x.ab)}</b><small>${esc(l?(l.profs||[]).join(', '):'')}${x.sala?' · '+esc(x.sala):''}</small></td>`}).join('')}</tr>`}).join('')}</tbody></table>
    ${leg.length?`<table><thead><tr><th>Sigla</th><th>Atividade</th><th>Professor(a)</th></tr></thead><tbody>${leg.map(l=>`<tr><td>${esc(l.ab)}</td><td>${esc(l.nome||'')}</td><td>${esc((l.profs||[]).join(', '))}</td></tr>`).join('')}</tbody></table>`:''}</section>`;
  cpdDoc('Matriz e distribuição de serviço '+nome,mat+hor)}

const cpdMinha=d=>d.minha!=null?!!d.minha:!!(S.cfg.professor&&d.prof&&String(d.prof).split(/,\s*/).some(p=>mesmoNome(p,S.cfg.professor)));
/* cria no modo professor as turmas·disciplinas que o coordenador leciona (com os formandos da turma, se já existirem) */
function cpdCriarMinhas(a,nome){const M=cpmM(nome);const L=M.disc.filter(cpdMinha);const novas=L.filter(d=>!a.turmas.some(t=>normTurma(t.nome)===normTurma(nome)&&normT(t.disciplina)===normT(d.nome)));
  if(!novas.length)return toast('As suas disciplinas desta turma já estão no modo professor.');
  if(!confirm('Criar no modo professor:\n\n'+novas.map(d=>'· '+nome+' — '+d.nome).join('\n')+'\n\nOs formandos são copiados da turma, se ela já existir.'))return;
  const base=a.turmas.find(t=>normTurma(t.nome)===normTurma(nome)&&t.alunos&&t.alunos.length);
  novas.forEach(d=>{const anoEsc=base?base.anoEsc:'10',ciclo=cicloDoAno(anoEsc);
    const t={id:uid(),nome,anoEsc,ciclo,oferta:'profij',disciplina:d.nome,dominios:mkDominiosDisc(d.nome,'profij',ciclo),mencoes:MENCOES_DEF.map(m=>({...m})),regra:{2:'media',3:'media'},alunos:[],instrumentos:[],modulos:[],cpmDisc:d.id};
    if(base){if(base.origens)t.origens=base.origens.slice();t.alunos=JSON.parse(JSON.stringify(base.alunos)).map(x=>Object.assign(x,{id:uid()+Math.random().toString(36).slice(2,5),frequenta:true,autoav:{},obsPer:{},sintese:{}}))}
    a.turmas.push(t)});
  saveNow();vCProfij();toast(novas.length+' disciplina(s) criada(s) no modo professor.')}

