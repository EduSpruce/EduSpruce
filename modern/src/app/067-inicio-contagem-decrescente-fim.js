/* ---------- Início: contagem decrescente para o fim do período ---------- */
function fimPeriodoAlvo(a){const c=a&&a.calendario;if(!c||!c.periodos.length)return null;const hj=isoData(new Date());
  const p=c.periodos.find(p=>hj>=p.ini&&hj<=p.fim)||c.periodos.find(p=>hj<p.ini);if(!p)return null;
  // hora de fim: fim da última aula desse dia (no seu horário), senão 17:00
  let fimMin=0;const dow=dataDeIso(p.fim).getDay();
  (a.turmas||[]).forEach(t=>aulasTurma(t,a).forEach(x=>{if(x.dia===dow&&x.fim>fimMin)fimMin=x.fim}));((a.horProf||{}).aulas||[]).forEach(x=>{if(x.dia===dow&&x.fim>fimMin)fimMin=x.fim});
  if(!fimMin)fimMin=17*60;const d=dataDeIso(p.fim);d.setHours(Math.floor(fimMin/60),fimMin%60,0,0);return {p,alvo:d,antes:hj<p.ini}}
/* ===================== REUNIÕES: mapa, gestão, lembretes e avisos ===================== */
const REUN_T={ct:{n:'Conselho de Turma',ab:'CT',cor:'#0f8b8d'},avl:{n:'Reunião de Avaliação',ab:'RA',cor:'#0b6e70'},dep:{n:'Departamento',ab:'DP',cor:'#7a4fd0'},grupo:{n:'Grupo Disciplinar',ab:'GD',cor:'#2f7fd0'},
  ped:{n:'Conselho Pedagógico',ab:'CP',cor:'#c0392b'},dt:{n:'Diretores de Turma',ab:'DT',cor:'#d35400'},ee:{n:'Encarregados de Educação',ab:'EE',cor:'#e07a00'},geral:{n:'Reunião Geral',ab:'RG',cor:'#5b6b7f'},
  equipa:{n:'Equipa / Projeto',ab:'EQ',cor:'#b8860b'},form:{n:'Formação',ab:'FO',cor:'#1a7f37'},outra:{n:'Outra',ab:'•',cor:'#8e8e93'}};
const REUN_EST={agendada:{n:'Agendada',cor:'#2f7fd0'},realizada:{n:'Realizada',cor:'#1a7f37'},adiada:{n:'Adiada',cor:'#e07a00'},cancelada:{n:'Cancelada',cor:'#8e8e93'}};
const REUN_LEMB=[[15,'15 min'],[60,'1 hora'],[180,'3 horas'],[1440,'1 dia'],[2880,'2 dias'],[10080,'1 semana']];
const reunioes=a=>(a&&(a.reunioes=a.reunioes||[]))||[];
const reunInicio=r=>{const d=dataDeIso(r.data);d.setHours(Math.floor((r.ini||0)/60),(r.ini||0)%60,0,0);return d};
const reunFim=r=>{const d=dataDeIso(r.data);const f=r.fim!=null?r.fim:(r.ini||0)+60;d.setHours(Math.floor(f/60),f%60,0,0);return d};
const reunTipo=r=>REUN_T[r.tipo]||REUN_T.outra;
const reunTurmas=(r,a)=>[...new Set([...(r.turmas||[]),...(r.turma?[r.turma]:[])])].map(id=>a.turmas.find(t=>t.id===id)).filter(Boolean);
const reunTurma=(r,a)=>reunTurmas(r,a)[0]||null;
const reunTurmasTxt=(r,a)=>[...new Set(reunTurmas(r,a).map(t=>t.nome))].join(', ');
const reunAtiva=r=>r.estado==='agendada'||r.estado==='adiada';
const pendAta=r=>r.estado==='realizada'&&!(r.notas||'').trim();
const reunTitulo=(r,a)=>r.titulo||(reunTipo(r).n+((x=>x?' · '+x:'')(reunTurmasTxt(r,a))));
const durTxt=m=>m>=60?(Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':'')):m+' min';
function quandoTxt(r){const ms=reunInicio(r)-Date.now();if(ms<0&&reunFim(r)>Date.now())return 'a decorrer';if(ms<0)return contagem(r.data);
  const m=Math.round(ms/6e4);if(m<60)return 'daqui a '+m+' min';if(m<24*60&&r.data===isoData(new Date()))return 'daqui a '+durTxt(Math.round(m/5)*5);return contagem(r.data)}
/* datas de reunião vindas da Marcação de Testes (reuniões de avaliação) — mostradas no mapa */
function reunDeAval(a){return (a.datasAval||[]).filter(d=>d.tipo==='reuniao'&&d.data).map(d=>{const t=d.turma?a.turmas.find(x=>x.id===d.turma):null;const ini=hm(d.hora||'')??null;
  return {id:'av:'+d.id,ext:true,tipo:'avl',titulo:'Reunião de Avaliação'+(d.per?' · '+d.per+'.º '+(a.org==='semestre'?'semestre':'período'):'')+(t?' · '+t.nome:''),data:d.data,ini:ini??0,fim:ini!=null?ini+90:null,semHora:ini==null,local:d.local||'',turma:d.turma||null,estado:d.data<isoData(new Date())?'realizada':'agendada',lembretes:[1440],ordem:[],prep:[],decisoes:[]}})}
function todasReunioes(a){if(!a)return [];return reunioes(a).concat(reunDeAval(a)).sort((x,y)=>x.data.localeCompare(y.data)||(x.ini||0)-(y.ini||0))}
/* ocupação do professor num dia (aulas + tempos não letivos + outras reuniões) */
function ocupacaoDia(a,iso,excluirId){const dow=dataDeIso(iso).getDay();const L=[];const c=a.calendario;const letivo=!c||!c.dias||['letivo','inicio','inicio2'].includes(c.dias[iso]);
  if(letivo){(a.turmas||[]).forEach(t=>aulasTurma(t,a).forEach(x=>{if(x.dia===dow)L.push({ini:x.ini,fim:x.fim,lbl:'Aula '+t.nome+' · '+t.disciplina,k:'aula'})}));
    ((a.horProf||{}).aulas||[]).filter(x=>x.dia===dow&&!(a.horProf.mapa||{})[chaveAula(x)]).forEach(x=>L.push({ini:x.ini,fim:x.fim,lbl:'Aula '+x.turma+' · '+x.sig,k:'aula'}));
    (a.naoLetivos||[]).filter(n=>n.dia===dow&&nlAtivoHoje(n,iso)).forEach(n=>L.push({ini:n.ini,fim:n.fim,lbl:(n.nome||n.sig),k:'nl'}))}
  todasReunioes(a).filter(r=>r.data===iso&&r.id!==excluirId&&reunAtiva(r)&&!r.semHora).forEach(r=>L.push({ini:r.ini,fim:r.fim!=null?r.fim:r.ini+60,lbl:reunTitulo(r,a),k:'reun'}));
  const seen=new Set();return L.filter(x=>{const k=x.ini+'|'+x.lbl;if(seen.has(k))return false;seen.add(k);return true})}
function conflitosReuniao(a,r){if(!r.data||r.ini==null||r.semHora)return [];const f=r.fim!=null?r.fim:r.ini+60;const M={};
  ocupacaoDia(a,r.data,r.id).filter(x=>x.ini<f&&x.fim>r.ini).sort((x,y)=>x.ini-y.ini).forEach(x=>{const m=M[x.lbl];if(m){m.ini=Math.min(m.ini,x.ini);m.fim=Math.max(m.fim,x.fim)}else M[x.lbl]={...x}});return Object.values(M)}
/* avisos do mapa de reuniões */
function avisosReunioes(a){const L=[];if(!a)return L;const agora=Date.now(),hj=isoData(new Date());const am=isoData(new Date(Date.now()+864e5));
  const serieVista=new Map();
  reunioes(a).forEach(r=>{const nm=esc(reunTitulo(r,a));
    if(reunAtiva(r)&&r.data>=hj){const c=conflitosReuniao(a,r);let rep=false;if(c.length&&r.serie){if(serieVista.has(r.serie)){serieVista.get(r.serie).n++;rep=true}else serieVista.set(r.serie,{n:0,i:L.length})}if(c.length&&!rep)L.push({g:'erro',r,t:`<b>${nm}</b> (${esc(fmtIsoL(r.data))}, ${fmtHM(r.ini)}) sobrepõe-se a ${c.map(x=>esc(x.lbl)).slice(0,2).join(' e ')}${c.length>2?'…':''}.`})}
    if(reunAtiva(r)&&(r.data===hj||r.data===am)){const f=(r.prep||[]).filter(p=>!p.ok).length;if(f)L.push({g:'aviso',r,t:`<b>${nm}</b> é ${r.data===hj?'hoje':'amanhã'} e faltam <b>${f}</b> ${f===1?'tarefa':'tarefas'} de preparação.`})}
    if(r.estado==='agendada'&&reunFim(r)<agora&&r.data>=isoData(new Date(Date.now()-30*864e5)))L.push({g:'aviso',r,t:`<b>${nm}</b> (${esc(fmtIsoL(r.data))}) já passou — marque como realizada e registe a ata.`,acao:'realizada'});
    if(pendAta(r)&&r.data>=isoData(new Date(Date.now()-60*864e5)))L.push({g:'info',r,t:`<b>${nm}</b> foi realizada mas ainda não tem notas / ata.`});
    (r.decisoes||[]).forEach(d=>{if(!d.ok&&d.prazo&&d.prazo<hj)L.push({g:'erro',r,t:`Tarefa em atraso: <b>${esc(d.t)}</b>${d.resp?' ('+esc(d.resp)+')':''} — prazo ${esc(fmtIsoL(d.prazo))} · ${nm}.`})})});
  serieVista.forEach(v=>{if(v.n)L[v.i].t=L[v.i].t.replace(/\.$/,'')+` <span class="mut">(e mais ${v.n} ${v.n===1?'reunião':'reuniões'} desta série)</span>.`});
  return L}
/* ---------- lembretes (enquanto a app está aberta) + notificações do sistema ---------- */
let _reunTimer=null;
function verificarLembretes(silencioso){const a=A();if(!a)return;const agora=Date.now();let mud=false;
  reunioes(a).filter(reunAtiva).forEach(r=>{const ini=reunInicio(r).getTime();if(ini+5*6e4<agora)return;r.avisados=r.avisados||{};
    const lst=[...(r.lembretes||[]),0];lst.forEach(L=>{const k=String(L);if(r.avisados[k])return;if(agora>=ini-L*6e4){r.avisados[k]=1;mud=true;
      // só o lembrete mais próximo do início é mostrado quando vários já passaram
      const outros=lst.filter(x=>x<L&&agora>=ini-x*6e4);if(outros.length)return;
      const msg=(L===0?'A começar: ':'Lembrete: ')+reunTitulo(r,a)+' · '+(r.data===isoData(new Date())?'hoje':fmtIsoL(r.data))+' às '+fmtHM(r.ini)+(r.local?' · '+r.local:'');
      if(!silencioso)avisoReuniao(msg,r)}})});
  if(mud)save()}
function avisoReuniao(msg,r){toast(msg,'ok');try{if('Notification' in window&&Notification.permission==='granted')window.__ntNotif('EduSpruce — Reunião',{body:msg,tag:'eg-'+r.id})}catch(_){}
  try{const c=new (window.AudioContext||window.webkitAudioContext)();const o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.08,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.5);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.55)}catch(_){}
  const b=document.getElementById('reunBan');if(b)b.remove();const d=document.createElement('div');d.id='reunBan';d.className='reunban';d.setAttribute('role','alert');
  d.innerHTML=`<span class="rbi">${ic('bell',18)}</span><span class="rbt">${esc(msg)}</span><button class="btn sm" data-rb="ver">Ver</button><button class="btn sm ico" data-rb="x" aria-label="Fechar">${ic('x',14)}</button>`;document.body.appendChild(d);
  d.onclick=e=>{const k=(e.target.closest('[data-rb]')||{}).dataset;if(!k)return;if(k.rb==='ver'){UI.reTab='prox';go('reunioes');setTimeout(()=>reuniaoVer(r.id),60)}d.remove()};setTimeout(()=>d.remove&&d.remove(),60000)}
function iniciarLembretes(){clearInterval(_reunTimer);verificarLembretes(false);_reunTimer=setInterval(()=>verificarLembretes(false),30000)}
async function pedirNotificacoes(){if(!('Notification' in window))return alert('Este navegador não permite notificações a partir de um ficheiro local.\n\nPara receber lembretes mesmo com a app fechada, use “Exportar para o Calendário (.ics)”: as reuniões entram no Calendário do iPad/computador com os alarmes definidos.');
  const p=await Notification.requestPermission();toast(p==='granted'?'Notificações ativadas':'As notificações não foram autorizadas',p==='granted'?'ok':'erro');if(VIEW==='reunioes')vReunioes()}
/* ---------- exportar para calendário (.ics, com alarmes) ---------- */
function icsData(d){const p=n=>String(n).padStart(2,'0');return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'T'+p(d.getHours())+p(d.getMinutes())+'00'}
const icsEsc=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,m=>'\\'+m);
function exportarICS(lista,nome){const a=A();const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EduSpruce//Reunioes//PT','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  lista.forEach(r=>{const t=reunTitulo(r,a);const desc=[(r.ordem||[]).length?'Ordem de trabalhos:\n'+r.ordem.map((o,i)=>(i+1)+'. '+o.t).join('\n'):'',(r.prep||[]).length?'Preparar:\n'+r.prep.map(p=>'- '+p.t).join('\n'):'',r.participantes?'Participantes: '+r.participantes:'',r.link?'Ligação: '+r.link:''].filter(Boolean).join('\n\n');
    L.push('BEGIN:VEVENT','UID:'+r.id+'@edugest','DTSTAMP:'+icsData(new Date()),'DTSTART:'+icsData(reunInicio(r)),'DTEND:'+icsData(reunFim(r)),'SUMMARY:'+icsEsc(t));
    if(r.local)L.push('LOCATION:'+icsEsc(r.local));if(desc)L.push('DESCRIPTION:'+icsEsc(desc));if(r.link)L.push('URL:'+r.link);if(r.estado==='cancelada')L.push('STATUS:CANCELLED');
    (r.lembretes||[]).forEach(m=>L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(t),'TRIGGER:-PT'+m+'M','END:VALARM'));L.push('END:VEVENT')});
  L.push('END:VCALENDAR');download((nome||'Reuniões')+'.ics',L.join('\r\n'),'text/calendar');toast(lista.length+(lista.length===1?' reunião exportada':' reuniões exportadas')+' — abra o ficheiro para as adicionar ao Calendário','ok')}
