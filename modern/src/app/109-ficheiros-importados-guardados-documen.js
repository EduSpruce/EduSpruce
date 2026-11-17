/* =====================================================================
   v0.35 — ficheiros importados guardados nos Documentos; importar
   reuniões de PDF/imagem (texto ou OCR) e interpretar
   ===================================================================== */
/* ---------- notas dos feriados municipais em maiúsculas (dados antigos) ---------- */
function corrigirNotasFer(){if(corrigirNotasFer._s===S)return;corrigirNotasFer._s=S;const fx=c=>{if(!c)return;Object.keys(c.notas||{}).forEach(k=>{if(/^Feriado municipal/.test(c.notas[k]))c.notas[k]=c.notas[k].replace(/^Feriado municipal/,'Feriado Municipal')});(c.feriadosLoc||[]).forEach(x=>{if(x.nota)x.nota=x.nota.replace(/^Feriado municipal/,'Feriado Municipal')})};
  S.anos.forEach(a=>{fx(a.calendario);Object.values(a.porEscola||{}).forEach(o=>fx(o&&o.calendario))})}
/* ---------- ficheiros importados → Documentos › Ficheiros Importados ---------- */
const _impPend={};
const importados=()=>S.importados=S.importados||[];
function marcarImport(f){try{if(f&&f.name&&f.size!=null)_impPend[f.name]=f}catch(_){}}
async function guardarImportado(tipo,f){if(!f||f.size>15*1048576)return;const L=importados();const ex=L.find(x=>x.nome===f.name&&x.tam===f.size);const a=A();
  if(ex){ex.q=Date.now();ex.tipo=tipo;return}const u=await lerFicheiroURL(f);L.push({id:uid(),doc:guardarDoc(u),nome:f.name,tipo,tam:f.size,mime:f.type||'',q:Date.now(),ano:a?a.nome:'',esc:escAtiva()});save()}
{const w=fn=>function(file){marcarImport(file);return fn.apply(this,arguments)};lerXlsx=w(lerXlsx);lerFicheiro=w(lerFicheiro);lerCalendarioPdf=w(lerCalendarioPdf);lerHorarioXlsx=w(lerHorarioXlsx);lerHorarioProfPdf=w(lerHorarioProfPdf)}
{const _rg2=regista;regista=function(tipo,ficheiro){try{if(ficheiro&&!/^(Sessão|Exportação|Cópia de segurança|Juntar turmas)/.test(tipo||'')){String(ficheiro).split(/\s*(?:,|\+)\s*/).forEach(n=>{const f=_impPend[n.trim()];if(f){delete _impPend[n.trim()];guardarImportado(tipo,f)}})}}catch(_){}return _rg2.apply(this,arguments)}}
function cartaoImportados(){const L=importados().slice().sort((x,y)=>y.q-x.q);const G=[...new Set(L.map(x=>x.tipo))];
  return `<div class="card"><div class="row"><h2 style="margin:0">${ic('upload',18)} Ficheiros Importados</h2><span class="sp1"></span><span class="mut">${L.length} ficheiro(s) · ${fmtBytes(L.reduce((s,x)=>s+(x.tam||0),0))}</span></div>
    <p class="hint">Os ficheiros originais usados para importar turmas, horários, calendário, reuniões e critérios ficam guardados aqui (neste dispositivo e na cópia de segurança completa).</p>
    ${L.length?G.map(g=>`<h3>${esc(g)}</h3>${L.filter(x=>x.tipo===g).map(x=>`<div class="lin"><span class="fdi">${ic(/pdf/i.test(x.mime+x.nome)?'file':/sheet|xls|csv/i.test(x.mime+x.nome)?'grid':/image/.test(x.mime)?'image':'folder',16)}</span><b>${esc(x.nome)}</b><span class="mut">${esc(fmtBytes(x.tam))} · ${new Date(x.q).toLocaleDateString('pt-PT')}${x.ano?' · '+esc(x.ano):''}</span><span class="sp1"></span><button class="btn sm" data-impab="${x.id}">${ic('access',13)} Abrir</button><button class="btn sm ico dng" data-impx="${x.id}" aria-label="Apagar">${ic('x',12)}</button></div>`).join('')}`).join(''):'<p class="mut">Ainda não importou ficheiros nesta versão. A partir de agora, cada importação fica guardada aqui.</p>'}</div>`}
{const _bd=bindDocumentos;bindDocumentos=function(tab){_bd.apply(this,arguments);$$('[data-impab]').forEach(b=>b.onclick=()=>{const x=importados().find(z=>z.id===b.dataset.impab);if(x)abrirDoc(x.doc,x.nome)});
  $$('[data-impx]').forEach(b=>b.onclick=()=>{const x=importados().find(z=>z.id===b.dataset.impx);if(!x||!confirm('Apagar “'+x.nome+'”?'))return;delete FOTOS[x.doc];try{IDB&&IDB.transaction('fotos','readwrite').objectStore('fotos').delete(x.doc)}catch(_){}S.importados=importados().filter(z=>z!==x);save();audit('Documentos','Ficheiro importado apagado',x.nome);vDocumentos()})}}

/* ---------- Importar reuniões (PDF com texto, PDF digitalizado ou imagem → OCR) ---------- */
let _tess=null;
async function ocrTesseract(){if(window.Tesseract)return window.Tesseract;await new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=ok;s.onerror=()=>ko(new Error('Não foi possível carregar o reconhecimento de texto (OCR). É preciso ligação à internet para documentos digitalizados.'));document.head.appendChild(s)});return window.Tesseract}
async function ocrImagem(src,prog){const T_=await ocrTesseract();if(!_tess)_tess=await T_.createWorker('por',1,{logger:m=>{if(prog&&m.status==='recognizing text')prog(Math.round(m.progress*100))}});
  const {data}=await _tess.recognize(src);const it=[];(data.words||[]).forEach(w=>{if(w.text&&w.text.trim())it.push({s:w.text.trim(),x:w.bbox.x0,y:w.bbox.y0,w:w.bbox.x1-w.bbox.x0,h:w.bbox.y1-w.bbox.y0})});return {items:it,texto:data.text||''}}
/* agrupa os pedaços de texto em linhas (y crescente = para baixo) e junta palavras próximas em células */
function linhasDeItens(items){const I=items.slice().sort((a,b)=>a.y-b.y||a.x-b.x);const L=[];
  I.forEach(i=>{const l=L.find(l=>Math.abs(l.y-i.y)<Math.max(3,Math.min(l.h,i.h)*0.55));if(l){l.it.push(i);l.y=(l.y*(l.it.length-1)+i.y)/l.it.length}else L.push({y:i.y,h:i.h,it:[i]})});
  L.forEach(l=>{l.it.sort((a,b)=>a.x-b.x);const C=[];l.it.forEach(i=>{const c=C[C.length-1];const esp=Math.max(4,(i.h||8)*0.9);if(c&&i.x-(c.x+c.w)<esp){c.s+=(i.x-(c.x+c.w)>1?' ':'')+i.s;c.w=i.x+i.w-c.x}else C.push({s:i.s,x:i.x,w:i.w,h:i.h})});l.cel=C;l.txt=C.map(c=>c.s).join('  ')});
  return L.sort((a,b)=>a.y-b.y)}
async function lerDocumentoTexto(file,prog){const P=[];let ocr=false;
  if(/pdf/i.test(file.type)||/\.pdf$/i.test(file.name)){const lib=await getPdfLib();const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;let n=0;const pag=[];
    for(let pn=1;pn<=doc.numPages;pn++){const page=await doc.getPage(pn);const vp=page.getViewport({scale:1});const tc=await page.getTextContent();
      const it=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>{const t=i.transform;const h=Math.hypot(t[2],t[3])||8;return {s:i.str.replace(/\s+/g,' ').trim(),x:t[4],y:vp.height-t[5]-h,w:i.width||0,h}});n+=it.reduce((s,i)=>s+i.s.length,0);pag.push({page,it})}
    if(n>=60)pag.forEach(p=>P.push(linhasDeItens(p.it)));
    else{ocr=true;for(let k=0;k<pag.length;k++){const vp=pag[k].page.getViewport({scale:2.2});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await pag[k].page.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;
      const r=await ocrImagem(cv,v=>prog&&prog('Página '+(k+1)+'/'+pag.length+' · '+v+'%'));P.push(linhasDeItens(r.items))}}}
  else{ocr=true;const u=await lerFicheiroURL(file);const r=await ocrImagem(u,v=>prog&&prog(v+'%'));P.push(linhasDeItens(r.items))}
  return {paginas:P,linhas:P.flat(),ocr}}
/* ---------- interpretação ---------- */
const DIAS_ABR={seg:1,ter:2,qua:3,qui:4,sex:5,sab:6,dom:0};
const RE_TURMA=/\b(\d{1,2})\s*\.?\s*[ºo°]\s*([A-Z]{1,2})\b|\bpr[eé][- ]?escolar\b|\bocupacional\b|\bprofij\s*[ivx\d]+(?:\s*[A-Z])?\b|\bPF\b|\bCEF\b/gi;
function horaMin(s){const m=String(s).match(/(\d{1,2})\s*(?:h|:|H)\s*(\d{2})?/);return m?(+m[1])*60+(+(m[2]||0)):null}
function dataDe(s,anoRef){const m=String(s).match(/\b(\d{1,2})\s*[\/.-]\s*(\d{1,2})(?:\s*[\/.-]\s*(\d{2,4}))?\b/);if(!m)return null;const d=+m[1],mes=+m[2];if(mes<1||mes>12||d<1||d>31)return null;
  let y=m[3]?(+m[3]<100?2000+(+m[3]):+m[3]):anoRef(mes);return y+'-'+String(mes).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
function horasDe(s){const r=String(s).match(/(\d{1,2})\s*[h:H]\s*(\d{2})?\s*(?:[–—-]|às|a)\s*(\d{1,2})\s*[h:H]\s*(\d{2})?/);if(r)return [(+r[1])*60+(+(r[2]||0)),(+r[3])*60+(+(r[4]||0))];const u=horaMin((String(s).match(/\d{1,2}\s*[h:H]\s*\d{0,2}/)||[''])[0]);return u!=null?[u,null]:[null,null]}
function turmasDe(s){const out=[];String(s).split(/\s*[·•,;|]\s*|\s{2,}/).forEach(p=>{p=p.trim();if(!p)return;const m=p.match(RE_TURMA);if(m)m.forEach(x=>out.push(normTxtTurma(x)));else if(/^(pr[eé]|ocup|profij|pf$)/i.test(p))out.push(p)});return [...new Set(out)]}
const normTxtTurma=x=>x.replace(/\s+/g,' ').replace(/^(\d{1,2})\s*\.?\s*[ºo°]\s*/i,'$1.º ').replace(/^pr[eé][- ]?escolar$/i,'Pré-escolar').trim();
function interpretarReunioes(doc,file){const a=A();const linhas=doc.linhas;const texto=linhas.map(l=>l.txt).join('\n');
  const y1=a?+a.nome.slice(0,4):new Date().getFullYear();const mY=texto.match(/\b(?:de\s+)?(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(20\d\d)/i);
  const anoRef=mes=>{if(mY){const mm=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'].indexOf(mY[1].toLowerCase().replace('marco','março'))+1;const yy=+mY[2];return mes>=mm-3&&mes<=mm+3?yy:(mes>=9?yy-(mm<9?1:0):yy+(mm>=9?1:0))}return mes>=8?y1:y1+1};
  const titulo=(linhas.find(l=>/reuni|conselho|calend/i.test(l.txt))||{}).txt||'';const tipo=/avalia/i.test(titulo+texto.slice(0,400))?'avl':/conselho de turma/i.test(texto)?'ct':/departamento/i.test(titulo)?'dep':/pedag/i.test(titulo)?'ped':'outra';
  const R={};const chave=(t,d)=>normT(t)+'|'+d;const put=o=>{const k=chave(o.turma,o.data);const r=R[k]=R[k]||{turma:o.turma,data:o.data};Object.entries(o).forEach(([q,v])=>{if(v!=null&&v!==''&&(r[q]==null||r[q]===''))r[q]=v})};
  /* B) linhas de resumo: data + hora(s) + lista de turmas */
  linhas.forEach(l=>{const d=dataDe(l.txt,anoRef);if(!d)return;const [ini,fim]=horasDe(l.txt);if(ini==null)return;const resto=l.cel.filter(c=>!/\d{1,2}\s*[\/.-]\s*\d{1,2}/.test(c.s)&&!/\d{1,2}\s*[h:H]/.test(c.s)).map(c=>c.s).join(' · ');
    turmasDe(resto).forEach(t=>put({turma:t,data:d,ini,fim}))});
  /* A) tabela com cabeçalho (Turma | Início/Data | Diretor | Secretário | Comissão | Local …) */
  const COLS=[['turma',/^turmas?$/i],['quando',/in[ií]cio|^data|^dia|^hora|quando/i],['dt',/diretor|^dt$/i],['sec',/secret/i],['com',/comiss|verifica/i],['local',/^local|^sala/i],['pres',/presid/i]];
  let cols=null,cur=null;const fecha=()=>{if(cur&&cur.turma){const d=dataDe(cur.quando||'',anoRef);if(d){const [ini,fim]=horasDe(cur.quando||'');put({turma:normTxtTurma(cur.turma),data:d,ini,fim,dt:cur.dt,sec:cur.sec,com:cur.com,local:cur.local,pres:cur.pres})}}cur=null};
  linhas.forEach(l=>{const hd=l.cel.map(c=>{const k=COLS.find(([,re])=>re.test(c.s.trim()));return k?{k:k[0],x:c.x}:null});
    if(hd.filter(Boolean).length>=2&&hd[0]&&hd[0].k==='turma'){fecha();cols=hd.filter(Boolean).sort((p,q)=>p.x-q.x);return}
    if(!cols)return;if(/^(resumo|conselho de turma|calend)/i.test(l.txt.trim())&&l.cel.length===1){fecha();return}
    if(cur&&cur.yUlt!=null&&l.y-cur.yUlt>Math.max(28,(l.h||10)*3.2)){fecha()}
    const row={};l.cel.forEach(c=>{let k=cols[0].k;cols.forEach(col=>{if(c.x>=col.x-12)k=col.k});row[k]=(row[k]?row[k]+' ':'')+c.s});
    if(row.turma&&/^turma$/i.test(row.turma.trim())&&Object.keys(row).length<=2)return;
    const tm=row.turma&&row.turma.match(RE_TURMA)||row.turma&&/^(pr[eé]|ocup|pf|profij)/i.test(row.turma.trim());
    if(row.turma&&tm&&(row.quando||!cur)){fecha();cur={...row,yUlt:l.y}}else if(row.turma&&!tm){fecha();cols=null}else if(cur){Object.entries(row).forEach(([k,v])=>{cur[k]=(cur[k]?cur[k]+' ':'')+v});cur.yUlt=l.y}});fecha();
  const L=Object.values(R).filter(r=>r.data&&r.turma).map(r=>({...r,fim:r.fim!=null&&r.fim>r.ini?r.fim:(r.ini!=null?r.ini+120:null)})).sort((x,y)=>x.data.localeCompare(y.data)||(x.ini||0)-(y.ini||0)||x.turma.localeCompare(y.turma,'pt',{numeric:true}));
  const eu=S.cfg.professor?(p=>[p[0],p[p.length-1]].join(' '))(normT(S.cfg.professor).split(/\s+/)):'';const temEu=s=>!!(eu&&s&&normT(s).replace(/\s+/g,' ').includes(eu));
  L.forEach(r=>{r.minha=a?a.turmas.filter(t=>turmasDaClasse(t).some(c=>normTurma(c)===normTurma(r.turma))):[];r.papel=[temEu(r.dt)&&tituloDT(S.cfg.professor),temEu(r.sec)&&'Secretário(a)',temEu(r.com)&&'Comissão de verificação',temEu(r.pres)&&'Presidente'].filter(Boolean);
    r.dup=a?reunioes(a).some(x=>x.data===r.data&&x.ini===r.ini&&((x.turmas||[]).some(id=>r.minha.some(t=>t.id===id))||normT(x.titulo||'').includes(normT(r.turma)))):false});
  return {L,tipo,titulo,ocr:doc.ocr,ficheiro:file.name}}
function importarReunioesDlg(){const f=document.createElement('input');f.type='file';f.accept='.pdf,application/pdf,image/*';f.onchange=async()=>{const file=f.files[0];if(!file)return;marcarImport(file);
    openDrawer('Importar Reuniões',`<div class="ed"><p id="ir-st" class="mut">${ic('refresh',15)} A ler “${esc(file.name)}”…</p></div>`);
    try{const doc=await lerDocumentoTexto(file,p=>{const s=$('#ir-st');if(s)s.innerHTML=ic('refresh',15)+' A reconhecer o texto (OCR) · '+esc(p)});const r=interpretarReunioes(doc,file);importarReunioesPrev(r,file)}
    catch(e){console.error(e);const s=$('#ir-st');if(s)s.innerHTML=`<span style="color:var(--bad)">${esc(e.message)}</span>`}};f.click()}
function importarReunioesPrev(R,file){const a=A();let filtro=R.L.some(r=>r.minha.length||r.papel.length)?'minhas':'todas';
  const html=()=>{const V=R.L.filter(r=>filtro==='todas'||r.minha.length||r.papel.length);return `<div class="ed"><div class="alert">${ic('info',15)} ${R.ocr?'Texto reconhecido por OCR — confirme as datas e as horas.':'Texto lido do PDF.'} Encontradas <b>${R.L.length}</b> reuniões${R.titulo?' em “'+esc(R.titulo)+'”':''}.</div>
    <div class="row" style="gap:8px;margin:10px 0;flex-wrap:wrap"><div class="seg"><button data-irf="minhas" class="${filtro==='minhas'?'on':''}">As Que Me Dizem Respeito</button><button data-irf="todas" class="${filtro==='todas'?'on':''}">Todas</button></div><span class="sp1"></span><label style="margin:0">Tipo</label><select id="ir-tp">${Object.entries(REUN_T).map(([k,v])=>`<option value="${k}" ${k===R.tipo?'selected':''}>${v.n}</option>`).join('')}</select></div>
    <div class="tblw"><table class="lst irt"><thead><tr><th><input type="checkbox" id="ir-all" checked aria-label="Todas"></th><th>Turma</th><th>Data</th><th>Hora</th><th>Diretor(a) / Secretário(a) / Comissão</th><th>O Meu Papel</th></tr></thead><tbody>
    ${V.map(r=>{const i=R.L.indexOf(r);return `<tr class="${r.dup?'off':''}"><td><input type="checkbox" data-iri="${i}" ${r.dup?'':'checked'}></td><td><b>${esc(r.turma)}</b>${r.minha.length?' <span class="tag ok">minha turma</span>':''}${r.dup?' <span class="tag">já existe</span>':''}</td><td><input type="date" data-ird="${i}" value="${esc(r.data)}"></td><td class="nw"><input type="time" data-irh="${i}" value="${r.ini!=null?fmtHM(r.ini):''}" style="width:100px"> – <input type="time" data-irh2="${i}" value="${r.fim!=null?fmtHM(r.fim):''}" style="width:100px"></td>
      <td class="mut" style="font-size:12.5px">${[r.dt&&'DT: '+esc(r.dt),r.sec&&'Sec.: '+esc(r.sec),r.com&&'Comissão: '+esc(r.com)].filter(Boolean).join('<br>')||'—'}</td><td>${r.papel.map(p=>`<span class="tag">${esc(p)}</span>`).join(' ')||(r.minha.length?'<span class="mut">conselho de turma</span>':'')}</td></tr>`}).join('')||'<tr><td colspan="6" class="mut">Nada encontrado com este filtro.</td></tr>'}</tbody></table></div>
    <div class="row" style="margin-top:14px;gap:8px"><button class="btn pri" id="ir-ok">${ic('check',15)} Importar Selecionadas</button><span class="hint" style="margin:0">Ficam com lembretes (1 dia e 1 hora antes) e o original fica em Documentos › Ficheiros Importados.</span></div></div>`};
  const abre=()=>{openDrawer('Importar Reuniões — '+file.name,html());
    $$('[data-irf]').forEach(b=>b.onclick=()=>{filtro=b.dataset.irf;abre()});$('#ir-tp').onchange=e=>{R.tipo=e.target.value};
    $('#ir-all').onchange=e=>$$('[data-iri]').forEach(c=>c.checked=e.target.checked);
    $$('[data-ird]').forEach(el=>el.onchange=()=>{R.L[+el.dataset.ird].data=el.value});$$('[data-irh]').forEach(el=>el.onchange=()=>{R.L[+el.dataset.irh].ini=horaMin(el.value)});$$('[data-irh2]').forEach(el=>el.onchange=()=>{R.L[+el.dataset.irh2].fim=horaMin(el.value)});
    $('#ir-ok').onclick=()=>{const sel=$$('[data-iri]').filter(c=>c.checked).map(c=>R.L[+c.dataset.iri]);if(!sel.length)return toast('Nenhuma reunião escolhida','erro');
      sel.forEach(r=>{const tp=R.tipo;reunioes(a).push({id:uid(),tipo:tp,titulo:r.minha.length?'':REUN_T[tp].n+' — '+r.turma,data:r.data,ini:r.ini!=null?r.ini:17*60,fim:r.fim!=null?r.fim:(r.ini||17*60)+120,semHora:r.ini==null,local:r.local||'',link:'',turma:r.minha[0]?r.minha[0].id:null,turmas:r.minha.map(t=>t.id),convocante:r.pres||'',
        participantes:[r.dt&&'Diretor(a) de turma: '+r.dt,r.sec&&'Secretário(a): '+r.sec,r.com&&'Comissão de verificação: '+r.com].filter(Boolean).join('\n'),lembretes:[1440,60],ordem:[],prep:r.papel.includes('Secretário(a)')?[{t:'Levar o modelo da ata',ok:false}]:[],notas:(r.papel.length?'O meu papel: '+r.papel.join(', ')+'\n':'')+'Importado de '+file.name,decisoes:[],estado:'agendada'})});
      saveNow();regista('Reuniões (PDF)',file.name,sel.length+' reuniões');audit('Reuniões','Importação',file.name+' · '+sel.length);closeDrawer();toast(sel.length+' reunião(ões) importada(s)','ok');go('reunioes')}};abre()}
{const _bb2=barBtns;barBtns=function(arr){if(VIEW==='reunioes'&&arr&&arr.some(b=>b.id==='b-rn')&&!arr.some(b=>b.id==='b-rimp')){arr=arr.slice();arr.splice(1,0,{id:'b-rimp',t:ic('upload',15)+' Importar PDF…',f:importarReunioesDlg})}return _bb2.call(this,arr)}}
AJUDA.push({id:'reunimp',ic:'meet',t:'Importar Reuniões de um PDF',gif:null,txt:`<p>Em Reuniões › <b>Importar PDF…</b> escolha o calendário de reuniões (PDF ou fotografia). A app lê o texto — ou reconhece-o por OCR quando o documento é digitalizado (precisa de internet) — e interpreta as tabelas: turma, dia, hora de início e fim, diretor(a) de turma, secretário(a) e comissão de verificação.</p><ul><li>Por omissão mostra só as reuniões das suas turmas e aquelas em que o seu nome aparece (com o seu papel: secretário(a), comissão…).</li><li>Pode corrigir datas e horas antes de importar; as que já existem ficam desmarcadas.</li><li>O ficheiro original fica em Documentos › Ficheiros Importados.</li></ul>`});

