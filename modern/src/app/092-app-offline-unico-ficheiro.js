/* ===== App offline: um único ficheiro .html com a app e os dados (todos os anos ou só um), para guardar como cópia e abrir sem internet ===== */
function exportarOfflineDlg(){const anos=(S.anos||[]).slice();if(!anos.length)return toast('Sem dados para exportar','erro');
  openDrawer('Exportar App Offline',`<div class="ed">
    <p class="mut" style="margin-top:0">Cria um ficheiro que abre em qualquer browser, mesmo sem internet, com a app e os dados escolhidos — para consulta e cópia de segurança. A app online e os dados na conta ficam exatamente como estão.</p>
    <label class="lbl">O que exportar</label><select id="ox-q" style="width:100%"><option value="__tudo" selected>Tudo (${anos.length} ano${anos.length>1?'s':''} letivo${anos.length>1?'s':''})</option>${anos.map(a=>`<option value="${esc(a.id)}">Ano letivo ${esc(a.nome)}</option>`).join('')}</select>
    <label class="lbl" style="margin-top:10px">Palavra-passe do ficheiro <span class="mut">(recomendado: tem dados de alunos)</span></label><input id="ox-p1" type="password" autocomplete="new-password" placeholder="mínimo 6 caracteres" style="width:100%"><input id="ox-p2" type="password" autocomplete="new-password" placeholder="repetir" style="width:100%;margin-top:6px">
    <p class="hint">Sem palavra-passe, qualquer pessoa que tenha o ficheiro vê os dados. Quem não souber a palavra-passe não consegue abrir.</p>
    <div class="row" style="justify-content:flex-end;gap:8px;margin-top:12px"><button class="btn" id="ox-c">Cancelar</button><button class="btn pri" id="ox-ok">${ic('download',15)} Exportar</button></div></div>`);
  const o=$('#drawer');const fe=()=>closeDrawer();o.querySelector('#ox-c').onclick=fe;
  o.querySelector('#ox-ok').onclick=async()=>{const q=o.querySelector('#ox-q').value,p1=o.querySelector('#ox-p1').value,p2=o.querySelector('#ox-p2').value;
    if(p1||p2){if(p1.length<6)return toast('A palavra-passe precisa de pelo menos 6 caracteres','erro');if(p1!==p2)return toast('As palavras-passe não coincidem','erro')}
    else if(!confirm('Exportar SEM palavra-passe? Quem tiver o ficheiro vê todos os dados dos alunos.'))return;
    const b=o.querySelector('#ox-ok');b.disabled=true;b.textContent='A preparar…';try{await exportarOffline(q==='__tudo'?null:q,p1||null);fe()}catch(e){console.error(e);toast('Não foi possível exportar: '+(e.message||e),'erro');b.disabled=false;b.textContent='Exportar'}}}
async function exportarOffline(anoId,pw){
  const r=await fetch('arquivo.html?_v='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('não foi possível obter a app ('+r.status+')');let app=await r.text();
  const sv=S.anoAtivo;let txt;try{if(anoId)S.anoAtivo=anoId;txt=dadosCopia(!!anoId)}finally{S.anoAtivo=sv}
  const d=JSON.parse(txt);const st=d.estado;st.cfg={...st.cfg};delete st.cfg.gsync;delete st.cfg.pinHash;if(anoId){st.anoAtivo=anoId}
  const ano=anoId?((S.anos.find(a=>a.id===anoId)||{}).nome||''):'';const quando=new Date();
  const emb=JSON.stringify({estado:st,fotos:d.fotos||{},data:quando.toISOString(),ano}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const faixa=`<div id="es-off" style="position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#7c2d12;color:#fff;font:600 13px/1.3 system-ui,sans-serif;padding:6px 12px;text-align:center">Cópia offline${ano?' · Ano letivo '+esc(ano):' · todos os anos letivos'} · exportada a ${quando.toLocaleString('pt-PT')} — só para consulta: as alterações não ficam guardadas</div>`;
  const ini='<script>window.__ES_OFF='+emb+';document.addEventListener("DOMContentLoaded",function(){document.body.insertAdjacentHTML("beforeend",'+JSON.stringify(faixa).replace(/</g,'\\u003c')+')});<\/script>';
  const ih=app.search(/<head[^>]*>/i);if(ih<0)throw new Error('app inválida');const fh=app.indexOf('>',ih)+1;app=app.slice(0,fh)+ini+app.slice(fh);
  let saida=app;
  if(pw){const enc=new TextEncoder();let bytes=enc.encode(app);
    if(typeof CompressionStream!=='undefined'){bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer())}
    const sal=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
    const km=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveKey']);const k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:sal,iterations:250000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt']);
    const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,bytes));
    const b64=u=>{let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)};
    const P={v:1,gz:typeof CompressionStream!=='undefined',s:b64(sal),i:b64(iv),c:b64(ct)};
    saida=`<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EduSpruce · Cópia Offline</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f3557;font:16px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1d2733}.c{background:#fff;border-radius:18px;padding:28px;width:min(420px,calc(100vw - 32px));box-sizing:border-box;box-shadow:0 20px 50px rgba(0,0,0,.3)}h1{font-size:22px;margin:0 0 4px}p{color:#5b6775;margin:0 0 16px;font-size:14px}input{width:100%;box-sizing:border-box;font:inherit;padding:12px;border:1px solid #b9c4d0;border-radius:10px}button{margin-top:12px;width:100%;font:600 16px inherit;padding:12px;border:0;border-radius:10px;background:#127fa6;color:#fff;cursor:pointer}#e{color:#c0392b;font-size:14px;min-height:20px;margin-top:8px}</style></head>
<body><form class="c" id="f"><h1>EduSpruce · Cópia Offline</h1><p>${ano?'Ano letivo '+esc(ano):'Todos os anos letivos'} · exportada a ${esc(quando.toLocaleString('pt-PT'))}. Funciona sem internet.</p><input id="p" type="password" placeholder="Palavra-passe do ficheiro" autofocus autocomplete="current-password"><button>Abrir</button><div id="e"></div></form>
<script type="application/json" id="d">${JSON.stringify(P)}<\/script>
<script>
document.getElementById('f').onsubmit=async function(ev){ev.preventDefault();var E=document.getElementById('e');E.textContent='A abrir…';
 try{var P=JSON.parse(document.getElementById('d').textContent);var u=function(b){var s=atob(b),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a};
  var km=await crypto.subtle.importKey('raw',new TextEncoder().encode(document.getElementById('p').value),'PBKDF2',false,['deriveKey']);
  var k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:u(P.s),iterations:250000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
  var b;try{b=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:u(P.i)},k,u(P.c)))}catch(_){E.textContent='Palavra-passe errada.';return}
  if(P.gz)b=new Uint8Array(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  var h=new TextDecoder().decode(b);document.open();document.write(h);document.close()}catch(x){E.textContent='Não foi possível abrir: '+(x&&x.message||x)}};
<\/script></body></html>`}
  const nome='EduSpruce-offline-'+(ano?'ano-'+ano.replace(/[\/\\]/g,'-'):'tudo')+'-'+isoData(quando)+'.html';
  download(nome,saida,'text/html');S.cfg.ultimaCopia=S.cfg.ultimaCopiaOff=Date.now();save();audit('Dados','App offline exportada',(ano||'todos os anos')+(pw?' · com palavra-passe':' · sem palavra-passe'));toast('App offline exportada','ok')}
async function exportarCopia(opc){saveNow();let txt=dadosCopia(opc.soAno);const nome='EduSpruce-'+(opc.soAno?'ano-'+(A()||{}).nome.replace('/','-')+'-':'copia-')+isoData(new Date());
  if(opc.pw){txt=await encriptar(txt,opc.pw)}download(nome+(opc.pw?'.egcrypt.json':'.json'),txt,'application/json');S.cfg.ultimaCopia=Date.now();save();toast('Cópia exportada','ok')}
function validarCopia(st){const err=[];if(!st||!Array.isArray(st.anos))err.push('falta a lista de anos letivos');else st.anos.forEach((a,i)=>{if(!a.nome)err.push('ano '+(i+1)+' sem nome');if(!Array.isArray(a.turmas))err.push('ano '+(a.nome||i+1)+' sem turmas');else a.turmas.forEach(t=>{if(!Array.isArray(t.alunos)||!Array.isArray(t.instrumentos))err.push('turma '+(t.nome||'?')+' incompleta')})});return err}
async function importarCopia(f){try{let o=JSON.parse(await f.text());
    if(o.encriptado){const pw=prompt('Esta cópia está protegida. Palavra-passe:');if(!pw)return;try{o=JSON.parse(await desencriptar(o,pw))}catch(_){return alert('Palavra-passe errada ou ficheiro danificado.')}}
    if(o.definicoes&&!o.estado){if(!confirm('Importar só as definições (escola, disciplinas, tipos, aparência)?'))return;Object.assign(S.cfg,o.definicoes);saveNow();aplicarPrefs();toast('Definições importadas','ok');go('definicoes');return}
    const st=o.estado||o;const err=validarCopia(st);if(err.length)return alert('A cópia tem problemas e não foi importada:\n• '+err.slice(0,8).join('\n• '));
    const nT=st.anos.reduce((s,a)=>s+a.turmas.length,0),nA=st.anos.reduce((s,a)=>s+a.turmas.reduce((q,t)=>q+t.alunos.length,0),0);
    const parc=o.parcial;if(!confirm(`Cópia de ${o.data?new Date(o.data).toLocaleString('pt-PT'):'data desconhecida'}:\n${st.anos.length} ano(s) letivo(s), ${nT} turmas, ${nA} alunos, ${Object.keys(o.fotos||{}).length} fotografias.\n\n${parc?'Cópia parcial: o ano letivo será acrescentado (ou substituído se já existir).':'Substituir TODOS os dados atuais?'}`))return;
    Object.entries(o.fotos||{}).forEach(([k,v])=>{FOTOS[k]=v;idbPor(k,v)});
    if(parc){{const sv=S;try{S=migrate(JSON.parse(JSON.stringify(st)));if(!S.esquema)S.esquema=+st.esquema||1;migrarDados(true);st.anos=S.anos}catch(e){console.error(e)}finally{S=sv}}st.anos.forEach(a=>{S.anos=S.anos.filter(x=>x.nome!==a.nome);S.anos.push(a)});S.anos.sort((p,q)=>q.nome.localeCompare(p.nome));S.anoAtivo=st.anos[0].id;S=migrate(S)}else S=migrate(st);
    saveNow();aplicarPrefs();regista('Cópia de segurança',f.name,nT+' turmas, '+nA+' alunos');toast('Cópia importada','ok');go('inicio')}
  catch(e){alert('Ficheiro inválido.\n\n'+e.message+'\n\nSugestão: use um ficheiro exportado em Definições › Dados.')}}

/* ---------- Definições em separadores ---------- */
function vDefinicoes(){
  const tab=UI.defTab||'geral';
  const tabs=`<div class="tabs noprint deftabs">${[['geral','gear','Geral'],['prof','user','Professor'],['modelos','sliders','Domínios e Ponderações'],['conta','user','Conta e Acesso'],['aparencia','palette','Aparência'],['dados','shield','Segurança'],['sync','cloud','Sincronização'],['auditoria','list','Auditoria'],['ferr','search','Ferramentas']].map(([k,i,l])=>`<button data-dt2="${k}" class="${tab===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>`;
  if(tab==='geral'){vDefGeral();$('#view').insertAdjacentHTML('afterbegin',tabs);$('#view').insertAdjacentHTML('beforeend',cartaoAvisosDef());bindAvisosDef()}
  else{$('#view').innerHTML=tabs+({prof:defProf,modelos:defModelos,conta:defConta,aparencia:defAparencia,dados:defDados,sync:defSync,auditoria:defAuditoria,ferr:()=>cartaoIntegridade()+defFerramentas()})[tab]();({prof:bindProf,modelos:bindModelos,conta:bindConta,aparencia:bindAparencia,dados:bindDados,sync:bindSync,auditoria:bindAuditoria,ferr:()=>{bindIntegridade();bindFerramentas()}})[tab]()}
  $$('[data-dt2]').forEach(b=>b.onclick=()=>{UI.defTab=b.dataset.dt2;vDefinicoes()});
}
function defAparencia(){const c=S.cfg;const seg=(id,opts,cur)=>`<div class="seg" id="${id}">${opts.map(([k,l,i])=>`<button type="button" data-v="${k}" class="${String(cur)===String(k)?'on':''}">${i?ic(i,15)+' ':''}${l}</button>`).join('')}</div>`;
  return `<div class="card"><h2>${ic('palette',18)} Aparência</h2>
    <div class="prefs">
      <div class="pref"><b>Tema</b>${seg('ap-tema',[['auto','Automático','auto'],['light','Claro','sun'],['dark','Escuro','moon']],c.tema||'auto')}</div>
      <div class="pref"><b>Cor de destaque</b><div class="acs">${Object.entries(ACENTOS).map(([k,v])=>`<button type="button" class="acb ${(c.acento||'azul')===k?'on':''}" data-ac="${k}" style="--c1:${v[0]};--c2:${v[1]}" aria-label="${k}" title="${k[0].toUpperCase()+k.slice(1)}"></button>`).join('')}</div></div>
      <div class="pref"><b>Estilo da interface</b>${seg('ap-est',[['eg','EduSpruce','sparkle'],['azul','Azul Corporativo','folder']],c.estilo||ESTILO_DEF)}</div>
      <div class="pref"><b>Densidade</b>${seg('ap-den',[['conf','Confortável'],['compacto','Compacta']],c.densidade||'conf')}</div>
      <div class="pref"><b>Tamanho do texto</b>${seg('ap-let',[['90','A−'],['100','A'],['112','A+'],['125','A++'],['sistema','Do sistema']],c.letra||'100')}</div>
      <div class="pref"><b>Alto contraste</b><label class="chk"><input type="checkbox" id="ap-hc" ${c.altoContraste?'checked':''}> Texto e contornos mais fortes</label></div>
      <div class="pref"><b>Cores para daltonismo</b><label class="chk"><input type="checkbox" id="ap-dal" ${c.daltonico?'checked':''}> Paleta Okabe‑Ito e letras nos dias do calendário</label></div>
    </div></div>
  <div class="card"><h2>${ic('list',18)} Barra Lateral</h2><p class="hint" style="margin-top:0">Esconda as secções que não usa (podem voltar a ser mostradas aqui).</p>
    <div class="disc-grid">${NAV_OPC.map(([k,l])=>`<label class="${(c.navOculto||[]).includes(k)?'':'on'}"><input type="checkbox" data-nv="${k}" ${(c.navOculto||[]).includes(k)?'':'checked'}> ${l}</label>`).join('')}</div></div>
  <div class="card"><h2>${ic('image',18)} Fotografias dos Alunos</h2><p class="hint" style="margin-top:0">Qualidade das fotografias importadas a partir de agora (menos qualidade = menos espaço).</p>${seg('ap-fq',[['alta','Alta (320 px)'],['media','Média (240 px)'],['baixa','Baixa (160 px)']],c.fotoQ||'media')}</div>
  <div class="card"><h2>${ic('grad',18)} Avaliação e Marcações</h2><div class="prefs">
    <div class="pref"><b>Casas decimais nas notas (0–20)</b>${seg('ap-arr',[['0','0'],['1','1'],['2','2']],c.arred==null?1:c.arred)}</div>
    <div class="pref"><b>Limite de testes por semana e turma</b>${seg('ap-lim',[['2','2'],['3','3'],['4','4'],['0','Sem limite']],c.limTestes==null?3:c.limTestes)}</div></div></div>`}
function bindAparencia(){const c=S.cfg;const s=(id,cb)=>$$('#'+id+' [data-v]').forEach(b=>b.onclick=()=>{cb(b.dataset.v);save();aplicarPrefs();vDefinicoes()});
  s('ap-tema',v=>c.tema=v);s('ap-est',v=>c.estilo=v);s('ap-den',v=>c.densidade=v);s('ap-let',v=>c.letra=v);s('ap-fq',v=>c.fotoQ=v);s('ap-arr',v=>c.arred=+v);s('ap-lim',v=>c.limTestes=+v);
  $$('[data-ac]').forEach(b=>b.onclick=()=>{c.acento=b.dataset.ac;save();aplicarPrefs();vDefinicoes()});
  $('#ap-hc').onchange=e=>{c.altoContraste=e.target.checked;save();aplicarPrefs()};$('#ap-dal').onchange=e=>{c.daltonico=e.target.checked;save();aplicarPrefs();vDefinicoes()};
  $$('[data-nv]').forEach(x=>x.onchange=()=>{c.navOculto=(c.navOculto||[]).filter(k=>k!==x.dataset.nv);if(!x.checked)c.navOculto.push(x.dataset.nv);save();aplicarPrefs();vDefinicoes()})}
function defDados(){const c=S.cfg;const dias=c.ultimaCopia?Math.floor((Date.now()-c.ultimaCopia)/864e5):null;
  return `<div class="card"><h2>${ic('download',18)} Cópia de Segurança</h2>
    <p class="mut" style="margin:0 0 10px">Os dados estão encriptados e sincronizados na sua conta; uma cópia exportada serve de reserva extra. ${dias==null?'<b class="neg">Ainda não exportou nenhuma cópia.</b>':'Última cópia exportada: <b>'+(dias===0?'hoje':'há '+dias+' dia'+(dias>1?'s':''))+'</b>.'}</p>
    <div class="row"><button class="btn pri" id="bk-exp">${ic('download',15)} Exportar Tudo</button><button class="btn" id="bk-ano">${ic('calendar',15)} Só Este Ano Letivo</button><button class="btn" id="bk-cr">${ic('shield',15)} Exportar Encriptada…</button><button class="btn" id="bk-imp">${ic('upload',15)} Importar Cópia…</button>${window.__ES_OFF?'':`<button class="btn" id="bk-off">${ic('download',15)} App Offline…</button>`}<button class="btn" id="bk-def">${ic('download',15)} Só as Definições</button><span class="sp1"></span><button class="btn dng" id="bk-zero">${ic('trash',14)} Apagar todos os dados</button><input type="file" id="bk-f" accept=".json,application/json" hidden></div>

    <p class="hint">A cópia encriptada usa AES‑256 com a sua palavra‑passe — sem ela não é possível abrir o ficheiro.</p></div>
  <div class="card"><h2>${ic('shield',18)} Código de Acesso</h2><p class="hint" style="margin-top:0">Pede um código de 4 dígitos ao abrir a app neste dispositivo. Protege contra olhares curiosos; não encripta os dados (para isso use a cópia encriptada).</p>
    <div class="row">${c.pinHash?`<span class="tag">Ativo</span><button class="btn" id="pin-mud">Mudar Código</button><button class="btn dng" id="pin-off">Desativar</button>`:`<button class="btn pri" id="pin-on">${ic('shield',15)} Definir Código</button>`}</div>${privCfgHTML()}</div>
  <div class="card"><h2>${ic('layers',18)} Espaço Utilizado</h2><div id="espaco" class="mut">A calcular…</div></div>
  <div class="card"><h2>${ic('trash',18)} Caixote do Lixo <span class="mut" style="font-weight:400;font-size:13px">· 30 dias</span></h2>
    ${(S.lixo||[]).length?(S.lixo||[]).map(x=>`<div class="lin"><span class="tag">${x.tipo==='ano'?'Ano letivo':x.tipo==='turma'?'Turma':x.tipo==='reuniao'?'Reunião':'Instrumento'}</span><b>${esc(x.tipo==='turma'?x.obj.nome+' · '+x.obj.disciplina:x.tipo==='reuniao'?(x.obj.titulo||(REUN_T[x.obj.tipo]||REUN_T.outra).n)+' · '+fmtIsoL(x.obj.data):x.obj.nome)}</b><span class="mut">${new Date(x.quando).toLocaleDateString('pt-PT')}</span><span class="sp1"></span><button class="btn sm" data-rl="${x.id}">${ic('refresh',14)} Restaurar</button></div>`).join(''):'<p class="mut" style="margin:0">Vazio. Turmas, instrumentos e anos letivos apagados ficam aqui durante 30 dias.</p>'}</div>
  <div class="card"><h2>${ic('file',18)} Registo de Importações</h2>${(S.registo||[]).length?`<div class="tblw"><table class="lst"><thead><tr><th>Quando</th><th>Tipo</th><th>Ficheiro</th><th>Resultado</th></tr></thead><tbody>${S.registo.slice(0,30).map(r=>`<tr><td>${new Date(r.quando).toLocaleString('pt-PT')}</td><td>${esc(r.tipo)}</td><td class="mut">${esc(r.ficheiro)}</td><td>${esc(r.resumo)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mut" style="margin:0">Sem importações registadas.</p>'}</div>
  <div class="card"><h2>${ic('info',18)} Privacidade (RGPD)</h2><div class="ajt" style="font-size:14px">
    <p>O EduSpruce guarda dados pessoais de alunos (nomes, fotografias, contactos) e <b>dados de categoria especial</b> (medidas de suporte à aprendizagem). Tudo fica <b>neste dispositivo</b> e, se ligar a sincronização, encriptado na sua própria nuvem: nada é enviado para servidores da EduSpruce.</p>
    <ul><li>Use um dispositivo pessoal protegido por código; ative o código de acesso da app.</li><li>Exporte cópias <b>encriptadas</b> quando as guardar na nuvem ou numa pen.</li><li>Não partilhe exportações (CSV, pautas, relatórios) fora dos canais da escola.</li><li>No fim do ano, arquive ou apague os dados que já não são necessários.</li></ul><p style="margin-top:10px">${legalLinks()}</p></div></div>`}
function bindDados(){
  $('#bk-exp').onclick=()=>exportarCopia({});$('#bk-ano').onclick=()=>A()?exportarCopia({soAno:true}):toast('Sem ano letivo','erro');
  $('#bk-cr').onclick=()=>{const p1=prompt('Palavra-passe para a cópia (mínimo 6 caracteres):');if(!p1)return;if(p1.length<6)return alert('Use pelo menos 6 caracteres.');if(prompt('Repita a palavra-passe:')!==p1)return alert('As palavras-passe não coincidem.');exportarCopia({pw:p1})};
  {const bo=$('#bk-off');if(bo)bo.onclick=exportarOfflineDlg}
  $('#bk-imp').onclick=()=>$('#bk-f').click();$('#bk-f').onchange=e=>{const f=e.target.files[0];if(f)importarCopia(f)};
  $('#bk-def').onclick=()=>{const d={...S.cfg};delete d.logo;delete d.pinHash;download('EduSpruce-definicoes.json',JSON.stringify({app:'EduGest',definicoes:{...d,logo:S.cfg.logo}}),'application/json')};
  $('#bk-zero').onclick=()=>{const t=prompt('Para apagar TODOS os anos letivos, turmas, alunos e classificações escreva APAGAR:');if(t!=='APAGAR')return;S.anos.forEach(a=>paraLixo('ano',a));S={cfg:S.cfg,anos:[],anoAtivo:null,turmaAtiva:null,lixo:S.lixo,registo:S.registo};saveNow();toast('Dados apagados (ficam 30 dias no caixote do lixo)','aviso');go('inicio')};
  const novoPin=async()=>{if(S.cfg.pinHash){const at=await pinDialog({t:'Código atual',s:'Para mudar o código, introduza primeiro o atual.',verifica:async v=>await pinOk(v)});if(at==null)return}const p=await pinDialog({t:'Novo código de acesso',s:'Escolha 4 algarismos que só você saiba.'});if(p==null)return;const r=await pinDialog({t:'Repita o código',s:'Introduza novamente os mesmos 4 algarismos.',verifica:async v=>v===p,erro:'Os códigos não coincidem — tente de novo.'});if(r==null)return;S.cfg.pinHash=await hashSenha(p);saveNow();toast('Código de acesso ativo','ok');vDefinicoes()};
  const on=$('#pin-on');if(on)on.onclick=novoPin;const mu=$('#pin-mud');if(mu)mu.onclick=novoPin;const off=$('#pin-off');if(off)off.onclick=async()=>{const v=await pinDialog({t:'Desativar o código',s:'Introduza o código atual para o desativar.',verifica:async x=>await pinOk(x)});if(v==null)return;delete S.cfg.pinHash;saveNow();toast('Código de acesso desativado','ok');vDefinicoes()};
  $$('[data-rl]').forEach(b=>b.onclick=()=>restaurarLixo(b.dataset.rl));
  (async()=>{const el=$('#espaco');if(!el)return;let est=null;try{est=await navigator.storage.estimate()}catch(_){}
    let j=0;try{j=new Blob([JSON.stringify(S)]).size}catch(_){j=(localStorage.getItem(KEY)||'').length}const f=Object.values(FOTOS).reduce((s,x)=>s+(x||'').length,0);const tot=j+f;
    const lim=est&&est.quota?est.quota:1073741824;const fmtB=b=>b>=1073741824?(b/1073741824).toFixed(2).replace('.',',')+' GB':b>=1048576?(b/1048576).toFixed(1).replace('.',',')+' MB':Math.max(1,Math.round(b/1024))+' KB';
    const pc=v=>100*v/lim;const pt=pc(tot);const pTxt=pt<0.01?'menos de 0,01%':pt<10?pt.toFixed(2).replace('.',',')+'%':Math.round(pt)+'%';const w=v=>v?Math.max(.4,pc(v)):0;
    el.innerHTML=`<div class="esp-tot"><b>${fmtB(tot)}</b> ocupados <span>de ${fmtB(lim)} · ${pTxt}</span></div>
      <div class="esp-bar" role="img" aria-label="${fmtB(tot)} ocupados de ${fmtB(lim)}"><span class="esp-d" style="width:${w(j)}%" title="Dados: ${fmtB(j)}"></span><span class="esp-f" style="width:${w(f)}%" title="Fotografias e anexos: ${fmtB(f)}"></span></div>
      <div class="esp-leg"><span><i class="esp-d"></i>Dados <b>${fmtB(j)}</b></span><span><i class="esp-f"></i>Fotografias e anexos <b>${fmtB(f)}</b></span><span><i class="esp-l"></i>Livre <b>${fmtB(Math.max(0,lim-tot))}</b></span></div>${pt>80?'<div class="alert w">O espaço está quase cheio: exporte uma cópia e apague anos letivos antigos.</div>':''}`;
    try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(_){}})();
}
function defFerramentas(){return `<div class="card"><h2>${ic('search',18)} Diagnóstico dos Dados</h2><p class="hint" style="margin-top:0">Procura problemas comuns: ponderações, itens, notas impossíveis, testes em dias sem aula…</p><div id="diag"></div></div>
  <div class="card"><h2>${ic('check',18)} Verificar os Cálculos</h2><p class="hint" style="margin-top:0">Corre casos de teste conhecidos nas fórmulas de avaliação (domínios, ponderações, períodos, menções).</p><button class="btn" id="ft-calc">${ic('check',15)} Executar Testes</button><div id="calcres"></div></div>
  <div class="card"><h2>${ic('sparkle',18)} Dados de Demonstração</h2><p class="hint" style="margin-top:0">Cria um ano letivo de exemplo (“Demonstração”) com duas turmas, alunos fictícios, calendário, horário e classificações, para experimentar sem dados reais. Pode apagá-lo depois.</p><button class="btn" id="ft-demo">${ic('sparkle',15)} Criar Demonstração</button></div>
  <div class="card"><h2>${ic('help',18)} Ajuda e Novidades</h2><div class="row"><button class="btn" id="ft-tour">${ic('target',15)} Visita Guiada</button><button class="btn" id="ft-nov">${ic('star',15)} Novidades desta Versão</button><button class="btn" id="ft-rep">${ic('chat',15)} Enviar Sugestão ou Problema</button></div></div>`}
function bindFerramentas(){
  const L=diagnostico();$('#diag').innerHTML=L.length?L.map(x=>`<div class="lin ${x.g}"><span class="dgi">${ic(x.g==='erro'?'alert':'info',16)}</span><span>${x.t}</span><span class="sp1"></span>${x.f?`<button class="btn sm" data-dg="${L.indexOf(x)}">Corrigir</button>`:''}</div>`).join(''):`<div class="lin ok"><span class="dgi">${ic('check',16)}</span>Não foram encontrados problemas.</div>`;
  $$('[data-dg]').forEach(b=>b.onclick=()=>L[+b.dataset.dg].f());
  $('#ft-calc').onclick=calcMostrar;
  $('#ft-demo').onclick=criarDemo;$('#ft-tour').onclick=()=>{go('inicio');setTimeout(visitaGuiada,200)};$('#ft-nov').onclick=novidades;
  $('#ft-rep').onclick=()=>{const info=`EduSpruce ${VERSAO} · ${navigator.userAgent} · ${innerWidth}×${innerHeight} · anos ${S.anos.length}`;try{navigator.clipboard.writeText(info)}catch(_){}location.href='mailto:'+encodeURIComponent(S.cfg.emailSuporte||'')+'?subject='+encodeURIComponent('EduSpruce — sugestão/problema')+'&body='+encodeURIComponent('Descreva a sugestão ou o problema:\n\n\n---\n'+info)}}
