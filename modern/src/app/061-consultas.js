/* ---------- consultas ---------- */
const CAL=()=>(A()||{}).calendario||null;
const tipoDia=iso=>{const c=CAL();return c?c.dias[iso]||null:null};
function inicioTurma(t,c){c=c||CAL();if(!c)return '';return c.inicio2&&t&&['3c','sec'].includes(t.ciclo)?c.inicio2:c.inicio}
function termoTurma(t,c){c=c||CAL();if(!c)return '';const n=t?parseInt(t.anoEsc):NaN;const T_=(c.termos||[]).find(x=>x.anos.includes(n));
  const fimP=(c.periodos[c.periodos.length-1]||{}).fim||'';return T_?T_.data:fimP}
function letivoPara(t,d){const c=CAL();if(!c)return true;const iso=typeof d==='string'?d:isoData(d);const tp=c.dias[iso];
  if(!tp)return false;if(!LETIVOS.includes(tp))return false;if(t){const a=inicioTurma(t,c),b=termoTurma(t,c);if(a&&iso<a)return false;if(b&&iso>b)return false}return true}
function periodoDe(iso){const c=CAL();if(!c||!c.periodos.length)return null;iso=iso||isoData(new Date());
  const p=c.periodos.find(p=>iso>=p.ini&&iso<=p.fim);if(p)return p.n;const nx=c.periodos.find(p=>iso<p.ini);return nx?nx.n:c.periodos[c.periodos.length-1].n}
function diasLetivosEntre(a,b,t){const c=CAL();if(!c)return 0;return Object.keys(c.dias).filter(i=>i>=a&&i<=b&&letivoPara(t,i)).length}
/* sequências de dias (interrupções, feriados) → eventos */
function eventosCalendario(c){c=c||CAL();if(!c)return [];const ev=[];const isos=Object.keys(c.dias).sort();
  isos.forEach(i=>{const tp=c.dias[i];if(!['interrupcao','feriadoN','feriadoR','feriadoM','inicio','inicio2','termo'].includes(tp))return;
    // interrupções seguidas (incluindo fins de semana e feriados pelo meio) num só evento
    const p=tp==='interrupcao'?ev.filter(e=>e.t==='interrupcao').pop():null;
    if(p&&diasNaoLetivosAte(c,p.fim,i)){p.fim=i;if(!p.nota&&(c.notas||{})[i])p.nota=c.notas[i]}
    else ev.push({t:tp,ini:i,fim:i,nota:(c.notas||{})[i]||''})});
  (c.termos||[]).forEach(x=>{if(!ev.some(e=>e.t==='termo'&&e.ini===x.data))ev.push({t:'termo',ini:x.data,fim:x.data})});
  ev.forEach(e=>{if(e.t==='interrupcao'&&!e.nota){const k=Object.keys(c.notas||{}).sort().find(i=>i>=e.ini&&i<=e.fim);if(k)e.nota=c.notas[k]}});
  ev.forEach(e=>{if(e.t==='termo'){const x=(c.termos||[]).find(t=>t.data===e.ini);e.nota=x?anosTxt(x.anos):''}});
  return ev.sort((a,b)=>a.ini.localeCompare(b.ini));
}
function diasNaoLetivosAte(c,a,b){const d0=dataDeIso(a);d0.setDate(d0.getDate()+1);for(let d=d0;isoData(d)<b;d.setDate(d.getDate()+1)){if(LETIVOS.includes(c.dias[isoData(d)]))return false}return true}
const anosTxt=L=>!L||!L.length?'':L.map(n=>n===0?'pré-escolar':n+'.º').join(', ')+(L.length?' ano'+(L.length>1?'s':''):'');
/* ---------- criação manual ---------- */
function calendarioManual(an,ps){
  const dias={},perDia={};const[y1,y2]=an.split('/').map(Number);
  for(let d=new Date(y1,8,1);d<=new Date(y2,6,31);d.setDate(d.getDate()+1)){const i=isoData(d);const dow=d.getDay();
    const p=ps.find(p=>i>=p.ini&&i<=p.fim);dias[i]=p&&dow>0&&dow<6?'letivo':(dow>0&&dow<6&&i>ps[0].ini&&i<ps[ps.length-1].fim?'interrupcao':'nao');if(p)perDia[i]=p.n}
  dias[ps[0].ini]='inicio';
  return montarCalendario({dias,notas:{},perDia,termos:[],anoLetivo:an,ficheiro:'(manual)'});
}

/* ---------- feriados nacionais (para o calendário criado à mão) ---------- */
function pascoa(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1;return new Date(y,mes-1,dia)}
function feriadosNacionais(y1,y2){const out={};
  [[y1,10,5],[y1,11,1],[y1,12,1],[y1,12,8],[y1,12,25],[y2,1,1],[y2,4,25],[y2,5,1],[y2,6,10]].forEach(([y,m,d])=>out[isoD(y,m,d)]='');
  const p=pascoa(y2),dd=n=>isoData(new Date(p.getFullYear(),p.getMonth(),p.getDate()+n));
  out[dd(-2)]='Sexta-feira Santa';out[dd(0)]='Páscoa';out[dd(60)]='Corpo de Deus';return out}
/* ---------- importação do PDF ---------- */
const pickCalendario=()=>{const f=$('#calIn');f.value='';f.onchange=async()=>{const file=f.files[0];if(!file)return;ocupado('A ler '+file.name+'…');
  try{const c=await lerCalendarioPdf(file);livre();importarCalendarioDlg(c)}catch(e){livre();alert('Não foi possível ler o calendário.\n\n'+e.message+'\n\nSugestão: '+sugestaoErro(e.message))}};f.click()};
function importarCalendarioDlg(c){
  const a=A();const ev=eventosCalendario(c);const n=k=>Object.values(c.dias).filter(x=>x===k).length;
  const difAno=c.anoLetivo&&a.nome!==c.anoLetivo;
  openDrawer('Importar Calendário Escolar',`<div class="ed">
    <p class="hint" style="margin-top:0">${ic('file',14)} ${esc(c.ficheiro)} · ano letivo <b>${esc(c.anoLetivo)}</b></p>
    ${difAno?`<div class="alert w">${ic('alert',15)} O calendário é de ${esc(c.anoLetivo)} mas o ano letivo ativo é ${esc(a.nome)}.${S.anos.some(x=>x.nome===c.anoLetivo)?' Mude o ano letivo ativo antes de importar, ou importe assim mesmo.':''}</div>`:''}
    ${a.calendario?`<div class="alert w">${ic('alert',15)} Substitui o calendário atual (${esc(a.calendario.ficheiro||'')}).</div>`:''}
    <table class="lst"><thead><tr><th>${c.periodos.length===2?'Semestre':'Período'}</th><th>Início</th><th>Fim</th><th>Dias Letivos</th></tr></thead><tbody>
    ${c.periodos.map(p=>`<tr><td><b>${p.n}.º</b></td><td>${esc(fmtIsoL(p.ini))}</td><td>${esc(fmtIsoL(p.fim))}</td><td><b>${p.dias}</b></td></tr>`).join('')}</tbody></table>
    <div class="cal-res">
      <div><span class="sw" style="background:${TIPOS_DIA.inicio.cor}"></span>Início: <b>${esc(fmtIsoL(c.inicio))}</b>${c.inicio2?` · 3.º Ciclo e Secundário: <b>${esc(fmtIsoL(c.inicio2))}</b>`:''}</div>
      ${(c.termos||[]).slice().sort((x,y)=>x.data.localeCompare(y.data)).map(t=>`<div><span class="sw" style="background:${TIPOS_DIA.termo.cor}"></span>Termo: <b>${esc(fmtIsoL(t.data))}</b> — ${esc(anosTxt(t.anos))}</div>`).join('')}
      <div><span class="sw" style="background:${TIPOS_DIA.interrupcao.cor}"></span>Interrupções: ${ev.filter(e=>e.t==='interrupcao').map(e=>`<b>${esc(fmtIso(e.ini))}${e.fim!==e.ini?'–'+esc(fmtIso(e.fim)):''}</b>${e.nota?' ('+esc(e.nota)+')':''}`).join(' · ')||'—'}</div>
      <div><span class="sw" style="background:${TIPOS_DIA.feriadoN.cor}"></span>Feriados nacionais: ${n('feriadoN')} · <span class="sw" style="background:${TIPOS_DIA.feriadoR.cor}"></span>regionais: ${n('feriadoR')}</div>
    </div>
    ${c.preview?`<details class="pdfprev" open><summary>${ic('file',14)} O PDF lido (para comparar)</summary><img src="${esc(c.preview)}" alt="Pré-visualização do calendário em PDF"></details>`:''}
    <p class="hint">Confira com o PDF. Depois de guardar, pode corrigir qualquer dia em Calendário Escolar → “Editar Dias”.</p>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="cal-ok">${ic('check',15)} Guardar Calendário</button></div></div>`);
  $('#cal-ok').onclick=()=>{delete c.preview;regista('Calendário escolar (PDF)',c.ficheiro,c.periodos.map(p=>p.n+'.º '+p.dias+' dias').join(', '));guardarCalendario(c);closeDrawer();go('calendario');toast('Calendário guardado · '+c.periodos.map(p=>p.n+'.º '+p.dias+' dias').join(' · '))};
}
function guardarCalendario(c){const a=A();delete c.periodos3;delete c.periodos2;a.calendario=c;ajustarOrgCalendario(a);saveNow()}
/* ---------- criação manual ---------- */
function calendarioManualDlg(){
  const a=A();const[y1,y2]=a.nome.split('/').map(Number);
  const sem=a.org==='semestre';
  const def=sem?[[isoD(y1,9,14),isoD(y2,1,29)],[isoD(y2,2,1),isoD(y2,6,18)]]:[[isoD(y1,9,14),isoD(y1,12,18)],[isoD(y2,1,4),isoD(y2,3,19)],[isoD(y2,4,5),isoD(y2,6,18)]];
  openDrawer('Criar Calendário',`<div class="ed"><p class="hint" style="margin-top:0">Indique o início e o fim de cada ${sem?'semestre':'período'}. Os dias úteis ficam letivos, os intervalos entre ${sem?'semestres':'períodos'} ficam como interrupções e os feriados nacionais são marcados automaticamente. Depois pode ajustar dia a dia.</p>
    <table class="lst"><thead><tr><th>${sem?'Semestre':'Período'}</th><th>Início</th><th>Fim</th></tr></thead><tbody>
    ${def.map((p,k)=>`<tr><td><b>${k+1}.º</b></td><td><input type="date" id="cm-i${k}" value="${p[0]}"></td><td><input type="date" id="cm-f${k}" value="${p[1]}"></td></tr>`).join('')}</tbody></table>
    <label class="row" style="margin-top:12px;gap:8px"><input type="checkbox" id="cm-fer" checked> Marcar feriados nacionais</label>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="cm-ok">${ic('check',15)} Criar Calendário</button></div></div>`);
  $('#cm-ok').onclick=()=>{const ps=def.map((_,k)=>({n:k+1,ini:$('#cm-i'+k).value,fim:$('#cm-f'+k).value}));
    if(ps.some(p=>!p.ini||!p.fim||p.fim<p.ini)||ps.some((p,k)=>k&&p.ini<=ps[k-1].fim))return alert('Verifique as datas (cada um começa depois do anterior terminar).');
    const c=calendarioManual(a.nome,ps);
    if($('#cm-fer').checked)Object.entries(feriadosNacionais(y1,y2)).forEach(([i,nota])=>{if(c.dias[i]&&dataDeIso(i).getDay()%6){c.dias[i]='feriadoN';if(nota)c.notas[i]=nota}});
    montarCalendario(c);guardarCalendario(c);closeDrawer();go('calendario');toast('Calendário criado')};
}
