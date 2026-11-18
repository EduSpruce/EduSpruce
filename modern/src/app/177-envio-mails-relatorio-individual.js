/* ===================== v0.55 · Envio de e-mails (relatório individual e outros) ===================== */
/* Vias: Outlook/Microsoft 365 (Graph, permissão Mail.Send), Gmail (API, gmail.send) ou a app de e-mail do dispositivo
   (partilha com o PDF em anexo; no computador abre o e-mail e descarrega o PDF para anexar). Nada passa por servidores do EduSpruce. */
CAMPOS_COMUNS.push('emailAluno');
const EMAIL_CFG=()=>{if(S.cfg.email&&typeof S.cfg.email==='object'){S.cfg.emailEnvio={...S.cfg.email,...(S.cfg.emailEnvio||{})};S.cfg.email=''}const c=S.cfg.emailEnvio=S.cfg.emailEnvio&&typeof S.cfg.emailEnvio==='object'?S.cfg.emailEnvio:{};c.via=c.via||'app';c.assunto=c.assunto||'Relatório individual de {nome} — {disciplina} ({periodo})';
  c.corpo=c.corpo||'Exmo.(a) Sr.(a) Encarregado(a) de Educação,\n\nEnvio em anexo o relatório individual de {nome} ({turma}), relativo ao {periodo}, na disciplina de {disciplina}.\n\nEstou ao dispor para qualquer esclarecimento.\n\nCom os melhores cumprimentos,\n{professor}\n{escola}\n{email}';
  c.corpoAl=c.corpoAl||'Olá, {primeiro}!\n\nEnvio em anexo o teu relatório individual de {disciplina} relativo ao {periodo}. Lê-o com atenção e fala comigo se tiveres dúvidas.\n\nBom trabalho,\n{professor}';return c};
setTimeout(()=>{try{if(S.cfg.email&&typeof S.cfg.email==='object'){EMAIL_CFG();save()}const pf=typeof perfil==='function'?perfil():null;Object.values((pf&&pf.porEscola)||{}).forEach(o=>{if(o&&o.email&&typeof o.email!=='string')o.email=''})}catch(_){}},0);
if(nvL().msMail&&typeof MS_SCOPE==='string'&&!MS_SCOPE.includes('Mail.Send'))MS_SCOPE+=' Mail.Send';
const b64de=u8=>{let s='';const c=0x8000;for(let i=0;i<u8.length;i+=c)s+=String.fromCharCode.apply(null,u8.subarray(i,i+c));return btoa(s)};
const emailOk=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||'').trim());
function emailVars(t,x,per,txt){const w=perW().toLowerCase();const e=escolaDe(t)||{};return String(txt||'').replace(/\{nome\}/g,x.nome).replace(/\{primeiro\}/g,x.nome.split(' ')[0]).replace(/\{turma\}/g,x.origem||t.nome).replace(/\{disciplina\}/g,t.disciplina).replace(/\{periodo\}/g,per+'.º '+w).replace(/\{professor\}/g,S.cfg.professor||'').replace(/\{escola\}/g,e.escola||S.cfg.escola||'').replace(/\{ee\}/g,x.eeNome||'').replace(/\{email\}/g,emailDe(t))}
function emailDe(t){try{return emailProf(t?escId(escolaDe(t)):escAtiva())||''}catch(_){return ''}}
async function gmTok(){const c=gsCfg();if(!c.clientId)throw new Error('Para usar o Gmail indique o ID de cliente OAuth da Google em Definições › Segurança › Sincronização.');if(!nvHttps())throw new Error('O envio pelo Gmail precisa que a app esteja alojada num endereço https.');
  if(gmTok._t&&gmTok._t.exp>Date.now()+60000)return gmTok._t.t;await gsCarregar();return await new Promise((ok,ko)=>{const cli=google.accounts.oauth2.initTokenClient({client_id:c.clientId,scope:'https://www.googleapis.com/auth/gmail.send',callback:r=>{if(r&&r.access_token){gmTok._t={t:r.access_token,exp:Date.now()+(+r.expires_in||3600)*1000};ok(r.access_token)}else ko(new Error('Sem autorização para enviar pelo Gmail'))},error_callback:()=>ko(new Error('Janela da Google fechada'))});cli.requestAccessToken({prompt:gmTok._t?'':'consent'})})}
const mimeEnc=s=>'=?UTF-8?B?'+btoa(unescape(encodeURIComponent(s)))+'?=';
async function enviarGmail(m){const tk=await gmTok();const bd='ef'+Math.random().toString(36).slice(2);const L=[...(m.de?['From: '+mimeEnc(S.cfg.professor||'')+' <'+m.de+'>','Reply-To: '+m.de]:[]),'To: '+m.para.join(', '),'Subject: '+mimeEnc(m.assunto),'MIME-Version: 1.0','Content-Type: multipart/mixed; boundary="'+bd+'"','','--'+bd,'Content-Type: text/plain; charset="UTF-8"','Content-Transfer-Encoding: base64','',btoa(unescape(encodeURIComponent(m.texto)))];
  (m.anexos||[]).forEach(a=>L.push('--'+bd,'Content-Type: '+a.tipo+'; name="'+mimeEnc(a.nome)+'"','Content-Disposition: attachment; filename="'+mimeEnc(a.nome)+'"','Content-Transfer-Encoding: base64','',b64de(a.dados).replace(/.{76}/g,'$&\r\n')));L.push('--'+bd+'--');
  const raw=btoa(unescape(encodeURIComponent(L.join('\r\n')))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const r=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json'},body:JSON.stringify({raw})});if(!r.ok)throw new Error('Gmail: '+r.status+' '+((await r.json().catch(()=>({}))).error||{}).message)}
async function enviarOutlook(m){if(!nvL().ms)throw new Error('Ligue primeiro a conta Microsoft (Definições › Segurança › Sincronização com o OneDrive).');const tk=await msTok();
  const r=await fetch('https://graph.microsoft.com/v1.0/me/sendMail',{method:'POST',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json'},body:JSON.stringify({message:{subject:m.assunto,body:{contentType:'Text',content:m.texto},toRecipients:m.para.map(a=>({emailAddress:{address:a}})),...(m.de?{replyTo:[{emailAddress:{address:m.de,name:S.cfg.professor||''}}]}:{}),attachments:(m.anexos||[]).map(a=>({'@odata.type':'#microsoft.graph.fileAttachment',name:a.nome,contentType:a.tipo,contentBytes:b64de(a.dados)}))},saveToSentItems:true})});
  if(r.status===401||r.status===403){const e=new Error('A conta Microsoft ainda não autorizou o envio de e-mails.');e.mail=1;throw e}if(!r.ok)throw new Error('Outlook: '+r.status)}
async function msAutorizarMail(){nvSet({msMail:true});if(!MS_SCOPE.includes('Mail.Send'))MS_SCOPE+=' Mail.Send';await msLigar();toast('Envio de e-mails autorizado na conta Microsoft','ok')}
async function enviarApp(m,passo){const f=(m.anexos||[])[0];const file=f?new File([f.dados],f.nome,{type:f.tipo}):null;try{await navigator.clipboard.writeText(m.para.join(', '))}catch(_){}
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:m.assunto,text:m.texto});return 'partilhado'}
  if(f)download(f.nome,f.dados,f.tipo);const url='mailto:'+encodeURIComponent(m.para.join(','))+'?subject='+encodeURIComponent(m.assunto)+'&body='+encodeURIComponent(m.texto+(f?'\n\n[Anexe o ficheiro «'+f.nome+'», acabado de descarregar.]':''));const a=document.createElement('a');a.href=url;a.click();return 'aberto'}
async function emailDlg(t,lista,per){t=t||T();if(!t)return;const a=A();ligarClasse(a);per=per||UI.relPer||perAtual(t);const c=EMAIL_CFG();lista=(lista||alunosAval(t)).slice();
  const sel={};lista.forEach(x=>{sel[x.id]={ee:emailOk(x.email),al:false}});
  const draw=()=>{const vias=[['app','App de e-mail do dispositivo','No iPad e no telemóvel abre a partilha com o PDF anexado; no computador abre o e-mail e descarrega o PDF para anexar.'],['ms','Outlook / Microsoft 365','Envia diretamente pela sua conta Microsoft (precisa da app em https e da conta ligada).'],['google','Gmail','Envia diretamente pela sua conta Google (precisa da app em https e do ID de cliente).']];
    const nSel=lista.filter(x=>sel[x.id].ee||sel[x.id].al).length;
    openDrawer('Enviar por E-mail',`<div class="ed emd">
      <p class="hint" style="margin-top:0">${ic('shield',13)} Os relatórios contêm dados de menores: confirme os endereços e use, de preferência, o e-mail institucional. O envio faz-se pela sua conta ou pela app de e-mail do dispositivo — nada passa por servidores do EduSpruce. Fica registado no Dossiê do aluno (contactos com o EE).</p>
      ${(()=>{const de=emailDe(t);const conta=c.via==='ms'?nvL().conta:c.via==='google'?(gsCfg().email||''):'';return `<div class="emde"><span>${ic('user',14)} De: <b>${de?esc(de):'sem e-mail institucional'}</b> <span class="mut">(${esc(nomeEscola(escolaDe(t)))})</span></span>${!de?`<a href="#" class="lnk" id="em-pf">Definir na minha ficha ›</a>`:conta&&conta.toLowerCase()!==de.toLowerCase()?`<span class="tag w" title="As respostas vão para o e-mail institucional (Responder-a)">conta ligada: ${esc(conta)} · respostas para o institucional</span>`:''}</div>`})()}
      <label>Enviar por</label><div class="emvias">${vias.map(([k,l,d])=>`<button type="button" data-emv="${k}" class="${c.via===k?'on':''}"><b>${l}</b><small>${d}</small></button>`).join('')}</div>
      ${c.via==='ms'?`<div class="row" style="gap:8px;margin-top:6px">${nvL().ms?`<span class="tag ok">${ic('check',11)} ${esc(nvL().conta||'conta ligada')}</span>`:'<span class="tag w">conta Microsoft não ligada</span>'}<button type="button" class="btn sm" id="em-msa">${ic('shield',13)} Autorizar Envio de E-mails</button></div>`:''}
      <div class="row" style="margin:14px 0 6px;gap:8px"><b>Destinatários</b><span class="tag">${nSel}/${lista.length}</span><span class="sp1"></span><button type="button" class="btn sm" data-ema="ee">Todos os EE</button><button type="button" class="btn sm" data-ema="nenhum">Nenhum</button></div>
      <div class="emls">${lista.map(x=>{const s_=sel[x.id];const aut=x.contactoAutorizado!==false;return `<div class="emr"><span class="emn">${esc(numAl(x))}. ${esc(x.nome)}${!x.contactoAutorizado?` <button type="button" class="tag w emrg" data-emrg="${x.id}" title="O encarregado de educação autorizou o contacto por e-mail? Toque para registar a autorização (RGPD)">sem autorização RGPD · registar</button>`:''}</span>
        ${emailOk(x.email)?`<label class="chk"><input type="checkbox" data-eme="${x.id}|ee" ${s_.ee?'checked':''}> EE <small>${esc(x.email)}</small> <button type="button" class="btn sm ico emed" data-emed="${x.id}|ee" aria-label="Alterar o e-mail do EE" title="Alterar">${ic('pencil',12)}</button></label>`:`<label class="emin"><span>EE</span><input type="email" inputmode="email" autocomplete="off" data-emi="${x.id}|ee" placeholder="e-mail do encarregado de educação" aria-label="E-mail do encarregado de educação de ${esc(x.nome)}"></label>`}
        ${emailOk(x.emailAluno)?`<label class="chk"><input type="checkbox" data-eme="${x.id}|al" ${s_.al?'checked':''}> Aluno <small>${esc(x.emailAluno)}</small> <button type="button" class="btn sm ico emed" data-emed="${x.id}|al" aria-label="Alterar o e-mail do aluno" title="Alterar">${ic('pencil',12)}</button></label>`:`<label class="emin"><span>Aluno</span><input type="email" inputmode="email" autocomplete="off" data-emi="${x.id}|al" placeholder="e-mail do aluno" aria-label="E-mail do aluno ${esc(x.nome)}"></label>`}</div>`}).join('')}</div>
      <p class="hint">Os endereços preenchem-se na Ficha do aluno › Contactos (E-mail do encarregado de educação e E-mail do aluno).</p>
      <label>Assunto</label><input id="em-as" value="${esc(c.assunto)}">
      <div class="g2"><div><label>Mensagem para o EE</label><textarea id="em-co" rows="9">${esc(c.corpo)}</textarea></div><div><label>Mensagem para o aluno</label><textarea id="em-ca" rows="9">${esc(c.corpoAl)}</textarea></div></div>
      <p class="hint">Variáveis: {nome}, {primeiro}, {turma}, {disciplina}, {periodo}, {professor}, {escola}, {email} (o seu e-mail institucional nesta escola), {ee}.</p>
      <label class="chk"><input type="checkbox" id="em-pdf" checked> Anexar o relatório individual do ${per}.º ${perW().toLowerCase()} (PDF)</label>
      <div id="em-prog"></div>
      <div class="row" style="gap:8px;margin-top:14px"><button type="button" class="btn" id="em-pre">${ic('access',14)} Pré-visualizar</button><span class="sp1"></span><button type="button" class="btn" id="em-can">Cancelar</button><button type="button" class="btn pri" id="em-ok" ${nSel?'':'disabled'}>${ic('chat',14)} Enviar (${nSel})</button></div></div>`);
    const ler=()=>{c.assunto=$('#em-as').value;c.corpo=$('#em-co').value;c.corpoAl=$('#em-ca').value;save()};
    $$('#dw-b [data-emv]').forEach(b=>b.onclick=()=>{ler();c.via=b.dataset.emv;save();draw()});
    $$('#dw-b [data-eme]').forEach(x=>x.onchange=()=>{const [id,k]=x.dataset.eme.split('|');sel[id][k]=x.checked;ler();draw()});
    const gravaEm=(id,k,v)=>{const x=lista.find(y=>y.id===id);if(!x)return false;v=String(v||'').trim();if(v&&!emailOk(v)){toast('Endereço de e-mail inválido','aviso');return false}const campo=k==='ee'?'email':'emailAluno';x[campo]=v;try{alunoNoAno(x).forEach(({x:y})=>{y[campo]=v})}catch(_){}try{typeof sincComuns==='function'&&sincComuns()}catch(_){}save();if(v){sel[id][k]=true;toast((k==='ee'?'E-mail do EE':'E-mail do aluno')+' guardado na ficha de '+x.nome.split(' ')[0],'ok')}return true};
    $$('#dw-b [data-emi]').forEach(inp=>{const fim=()=>{if(inp.dataset.feito)return;const v=inp.value.trim();if(!v)return;const [id,k]=inp.dataset.emi.split('|');ler();if(gravaEm(id,k,v)){inp.dataset.feito=1;setTimeout(draw,0)}};inp.onchange=fim;inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();fim()}}});
    $$('#dw-b [data-emed]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const [id,k]=b.dataset.emed.split('|');const x=lista.find(y=>y.id===id);const v=prompt('E-mail '+(k==='ee'?'do encarregado de educação':'do aluno')+' — '+x.nome,k==='ee'?x.email:x.emailAluno);if(v==null)return;ler();if(gravaEm(id,k,v))draw()});
    $$('#dw-b [data-emrg]').forEach(b=>b.onclick=()=>{const x=lista.find(y=>y.id===b.dataset.emrg);if(!x)return;if(!confirm('Confirma que o encarregado de educação de '+x.nome+' autorizou o contacto por e-mail (RGPD)?\nFica registado na ficha do aluno.'))return;x.contactoAutorizado=true;x.contactoAutorizadoEm=isoData(new Date());try{alunoNoAno(x).forEach(({x:y})=>{y.contactoAutorizado=true;y.contactoAutorizadoEm=x.contactoAutorizadoEm})}catch(_){}save();ler();draw();toast('Autorização registada','ok')});
    $$('#dw-b [data-ema]').forEach(b=>b.onclick=()=>{ler();lista.forEach(x=>{sel[x.id].ee=b.dataset.ema==='ee'&&emailOk(x.email);sel[x.id].al=false});draw()});
    const msa=$('#em-msa');if(msa)msa.onclick=async()=>{try{ler();await msAutorizarMail();draw()}catch(e){toast(e.message,'erro')}};
    $('#em-can').onclick=()=>{ler();closeDrawer()};const pf=$('#em-pf');if(pf)pf.onclick=e=>{e.preventDefault();closeDrawer();UI.defTab='professor';go('definicoes')};
    $('#em-pre').onclick=()=>{ler();const x=lista.find(y=>sel[y.id].ee||sel[y.id].al)||lista[0];if(!x)return;const p=$('#em-prog');p.innerHTML=`<div class="empv"><small>Para: ${esc([sel[x.id].ee?x.email:'',sel[x.id].al?x.emailAluno:''].filter(Boolean).join(', ')||'—')}</small><b>${esc(emailVars(t,x,per,c.assunto))}</b><pre>${esc(emailVars(t,x,per,sel[x.id].ee||!sel[x.id].al?c.corpo:c.corpoAl))}</pre>${$('#em-pdf').checked?`<span class="tag">${ic('file',11)} Relatório ${esc(x.nome)}.pdf</span>`:''}</div>`};
    $('#em-ok').onclick=async()=>{ler();const fila=[];lista.forEach(x=>{if(sel[x.id].ee&&emailOk(x.email))fila.push({x,para:[x.email.trim()],quem:'EE',corpo:c.corpo});if(sel[x.id].al&&emailOk(x.emailAluno))fila.push({x,para:[x.emailAluno.trim()],quem:'aluno',corpo:c.corpoAl})});if(!fila.length)return;
      if(fila.some(f=>!f.x.contactoAutorizado)&&!confirm('Alguns alunos não têm os contactos assinalados como autorizados (RGPD) na ficha. Enviar mesmo assim?'))return;
      if(c.via==='app')toast('Toque em «Abrir E-mail» em cada destinatário; o endereço fica copiado para colar','info');
      const p=$('#em-prog');p.innerHTML=`<div class="emq">${fila.map((f,k)=>`<div class="emqi" data-q="${k}"><span class="emst">${ic('clock',12)}</span><span>${esc(f.x.nome)} <small class="mut">${f.quem} · ${esc(f.para[0])}</small></span><span class="emres mut">em espera</span></div>`).join('')}</div><div class="ctpb"><i style="width:0%"></i></div>`;
      $('#em-ok').disabled=true;let ok=0,err=0;const pdfs={};
      for(let k=0;k<fila.length;k++){const f=fila[k];const li=p.querySelector(`[data-q="${k}"]`);const st=(cls,txt)=>{li.className='emqi '+cls;li.querySelector('.emres').textContent=txt};st('on','a preparar…');
        try{const anexos=[];if($('#em-pdf').checked){if(!pdfs[f.x.id])pdfs[f.x.id]=await pdfDocumento(relSpec(t,[f.x],per),'',{blob:true});try{livre&&livre()}catch(_){}if(pdfs[f.x.id])anexos.push({nome:nomeFich('Relatório '+f.x.nome+' - '+t.disciplina+' '+per+'.º '+perW())+'.pdf',tipo:'application/pdf',dados:pdfs[f.x.id]})}
          const m={de:emailDe(t),para:f.para,assunto:emailVars(t,f.x,per,c.assunto),texto:emailVars(t,f.x,per,f.corpo),anexos};st('on','a enviar…');
          let res='enviado';if(c.via==='ms')await enviarOutlook(m);else if(c.via==='google')await enviarGmail(m);else{res=await new Promise((r,j)=>{st('on','pronto');const b=document.createElement('button');b.className='btn sm pri';b.innerHTML=ic('chat',12)+' Abrir E-mail';b.onclick=async()=>{b.remove();try{r(await enviarApp(m))}catch(e){j(e)}};li.appendChild(b);b.focus()})}
          st('ok',res==='enviado'?'enviado':res==='partilhado'?'partilhado':'aberto no e-mail');ok++;
          try{const L=contactosEE(a,f.x.cid);L.unshift({id:uid(),data:isoHoje(),meio:'E-mail',assunto:'Envio do relatório individual ('+per+'.º '+perW().toLowerCase()+')',sintese:'Enviado '+(c.via==='app'?'pela app de e-mail do dispositivo':c.via==='ms'?'pelo Outlook':'pelo Gmail')+' para '+f.para.join(', ')+' ('+f.quem+').',compromisso:'',acomp:'',disc:t.disciplina,turma:t.nome,autor:S.cfg.professor||'',criado:Date.now()})}catch(_){}
        }catch(e){err++;st('bad',e.message||'erro');if(e.mail){p.insertAdjacentHTML('beforeend',`<div class="alert w">${ic('alert',14)} A conta Microsoft precisa de autorizar o envio de e-mails. <button class="btn sm" id="em-msa2">Autorizar</button></div>`);const b2=$('#em-msa2');if(b2)b2.onclick=()=>msAutorizarMail().catch(x=>toast(x.message,'erro'));break}}
        p.querySelector('.ctpb i').style.width=Math.round((k+1)/fila.length*100)+'%'}
      save();audit('E-mail','Relatórios enviados',ok+' enviado(s) · '+err+' erro(s) · '+t.nome);toast(err?`${ok} enviado(s), ${err} com erro`:`${ok} e-mail${ok>1?'s':''} ${c.via==='app'?'preparado'+(ok>1?'s':''):'enviado'+(ok>1?'s':'')}`,err?'aviso':'ok');$('#em-ok').disabled=false}};
  draw()}
{const _vRE=vRelatorios;vRelatorios=function(){const r=_vRE.apply(this,arguments);try{const bx=$('#barx');if(bx&&!$('#b-relmail')){bx.insertAdjacentHTML('beforeend',`<button class="btn" id="b-relmail">${ic('chat',15)} Enviar por E-mail…</button>`);$('#b-relmail').onclick=()=>{const t=T();const al=alunosFiltro(t);emailDlg(t,UI.relAluno&&UI.relAluno!=='all'?al.filter(x=>x.id===UI.relAluno):al,UI.relPer)}}}catch(e){console.warn(e)}return r};if(go._f)go._f.relatorios=vRelatorios}
{const _dsE=dossieAluno;dossieAluno=function(cid,tab){const r=_dsE.apply(this,arguments);try{const h=$('#dw-b .dos .dsh');if(h&&!h.querySelector('.dsmail')){const a=A();const C=copiasDe(a,cid);const c=C.find(([t])=>t.id===S.turmaAtiva)||C[0];if(c){h.insertAdjacentHTML('beforeend',`<span class="dsacts"><button type="button" class="btn sm dsperf">${ic('idcard',14)} Perfil</button><button type="button" class="btn sm dsmail">${ic('chat',13)} Enviar Relatório por E-mail</button></span>`);h.querySelector('.dsperf').onclick=()=>{S.turmaAtiva=c[0].id;fichaAluno(c[1].id,'geral')};h.querySelector('.dsmail').onclick=()=>emailDlg(c[0],[c[1]])}}}catch(e){console.warn(e)}return r}}

/* v0.55: O Meu Horário — tocar numa aula abre o sumário dessa aula na semana atual */
function aulaDaSemana(t,a,dia,ini){let L=[];try{L=listaAulas(t,a)}catch(_){}const h=new Date();const seg=new Date(h);seg.setHours(0,0,0,0);seg.setDate(seg.getDate()-((seg.getDay()+6)%7));const d=new Date(seg);d.setDate(seg.getDate()+dia-1);const iso=isoData(d);
  return L.find(x=>x.data===iso&&x.ini===ini)||L.find(x=>x.data===iso&&Math.abs(x.ini-ini)<46)||null}
document.addEventListener('click',e=>{if(VIEW!=='meuhorario')return;const el=e.target.closest&&e.target.closest('#view .aula[data-aula]');if(!el)return;const p=el.dataset.aula.split('|');if(p[0]!=='t')return;
  e.stopPropagation();e.preventDefault();const a=A();const t=a.turmas.find(x=>x.id===p[3]);if(!t)return;const x=aulaDaSemana(t,a,+p[1],+p[2]);
  if(!x){toast('Esta semana não há aula nesse tempo (interrupção, feriado ou fora do período)','aviso');return}S.turmaAtiva=t.id;save();aulaDlg(t,x.k,'sum')},true);

/* nomes longos na lista de alunos: a caixa cresce com o texto */
/* (primeiro todas a «auto», depois todas as medições, depois todas as alturas: um só cálculo da página em vez de um por aluno) */
function autoAltura(root){const L=[...(root||document).querySelectorAll('table.alst textarea[data-k="nome"]')];L.forEach(ta=>{ta.style.height='auto'});const H=L.map(ta=>ta.scrollHeight);L.forEach((ta,i)=>{ta.style.height=H[i]+'px';if(!ta._ah){ta._ah=1;ta.addEventListener('input',()=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px'})}})}
{const _vAA=vAlunos;vAlunos=function(){const r=_vAA.apply(this,arguments);try{requestAnimationFrame(()=>autoAltura($('#view')))}catch(_){}return r};if(go._f)go._f.alunos=vAlunos}
addEventListener('resize',()=>{if(VIEW==='alunos')autoAltura($('#view'))});

/* v0.55: grelha de classificações — nunca acima da cotação do item (nem abaixo de zero) */
document.addEventListener('input',e=>{const x=e.target;if(!x.matches||!x.matches('#grid input[data-i]'))return;const t=T();const i=t&&t.instrumentos.find(z=>z.id===UI.inst);if(!i)return;const it=i.itens.find(z=>z.id===x.dataset.i);if(!it)return;
  const raw=String(x.value).replace(',','.').trim();if(raw===''||raw==='-')return;const v=parseFloat(raw);if(isNaN(v))return;const cot=+it.cot||0;
  if(v>cot||v<0){const c=v>cot?cot:0;x.value=String(c).replace('.',',');x.classList.remove('gmax');void x.offsetWidth;x.classList.add('gmax');clearTimeout(x._gm);x._gm=setTimeout(()=>x.classList.remove('gmax'),1400);toast(v>cot?`Máximo ${String(cot).replace('.',',')} — é a cotação de «${it.rot}»`:'A classificação não pode ser negativa','aviso');x.dispatchEvent(new Event('input',{bubbles:true}))}},true);

/* v0.55: o cabeçalho alinha com o conteúdo da página (mesmas margens) */
function barCompacto(){const x=$('#barx');if(!x)return;x.classList.remove('cmp','cmp2');const linhas=()=>{const t=[...x.children].filter(e=>e.offsetWidth).map(e=>Math.round(e.offsetTop));return new Set(t).size};if(linhas()<=1)return;x.classList.add('cmp');if(linhas()<=1)return;x.classList.add('cmp2');if(linhas()>1)x.classList.remove('cmp2')}
function alinharEsc(){const b=$('#bar'),ce=$('#ctxEsc');if(!b||!ce)return;b.classList.remove('escalin');ce.style.removeProperty('margin-left');const hero=document.querySelector('#view .in-hero');
  if(VIEW!=='inicio'||!document.body.classList.contains('dev-pc')||!hero||!ce.offsetWidth)return;const h0=b.offsetHeight;b.classList.add('escalin');
  ce.style.setProperty('margin-left','0px','important');const dx=Math.round(hero.getBoundingClientRect().left-ce.getBoundingClientRect().left);if(dx>=0)ce.style.setProperty('margin-left',dx+'px','important');if(b.offsetHeight>h0+1||dx<0){ce.style.marginLeft='';b.classList.remove('escalin')}}
function alinharBar(){const b=$('#bar'),v=$('#view');if(!b||!v)return;if(!document.body.classList.contains('dev-pc')){b.style.paddingLeft=b.style.paddingRight='';return}
  const br=b.getBoundingClientRect();let L=Infinity,R=-Infinity;[...v.children].forEach(c=>{const cs=getComputedStyle(c);if(cs.position==='fixed'||cs.display==='none')return;const r=c.getBoundingClientRect();if(r.width<200||!r.height)return;
    /* usa os cartões visíveis dentro de contentores sem fundo */
    const k=[...c.querySelectorAll(':scope>.card,:scope>*>.card')].map(x=>x.getBoundingClientRect()).filter(x=>x.width>150);const rr=k.length&&(cs.backgroundColor==='rgba(0, 0, 0, 0)'||cs.backgroundColor==='transparent')?{left:Math.min(...k.map(x=>x.left)),right:Math.max(...k.map(x=>x.right))}:r;L=Math.min(L,rr.left);R=Math.max(R,rr.right)});
  if(!isFinite(L))return;const pl=Math.max(16,Math.round(L-br.left)),pr=Math.max(16,Math.round(br.right-R));if(pl+pr>br.width*.6)return;
  /* tudo na mesma linha sempre que possível: só aplica a margem que não faz a barra quebrar */
  const ov=()=>b.querySelectorAll('#barx [data-ovf]').length;const ap=f=>{b.style.paddingLeft=Math.max(16,Math.round(pl*f))+'px';b.style.paddingRight=Math.max(16,Math.round(pr*f))+'px';try{cabecalho()}catch(_){}};
  /* a mesma barra na mesma página e janela já foi alinhada antes: aplica logo a margem encontrada (1 cálculo do cabeçalho em vez de até 7) e só procura de novo se o resultado não for o mesmo */
  const chave=[pl,pr,innerWidth,VIEW,document.body.className,b.textContent,b.querySelectorAll('button:not([hidden])').length].join('\u0001');const c=_alBarMemo.get(chave);
  if(c){ap(c.f);if(b.offsetHeight<=c.h+1&&(cabecalho.aperto||0)<=c.a&&ov()<=c.o)return}
  b.style.paddingLeft=b.style.paddingRight='16px';try{cabecalho()}catch(_){}const h0=b.offsetHeight,a0=cabecalho.aperto||0,o0=ov();let lo=0,hi=1;const bom=()=>b.offsetHeight<=h0+1&&(cabecalho.aperto||0)<=a0&&ov()<=o0;
  const fim=f=>{_alBarMemo.set(chave,{f,h:h0,a:a0,o:o0});if(_alBarMemo.size>60)_alBarMemo.delete(_alBarMemo.keys().next().value)};
  ap(1);if(bom())return fim(1);for(let i=0;i<4;i++){const m=(lo+hi)/2;ap(m);if(bom())lo=m;else hi=m}ap(lo);fim(lo)}
const _alBarMemo=new Map();
{const _gAB=go;go=function(){const r=_gAB.apply(this,arguments);requestAnimationFrame(()=>requestAnimationFrame(alinharBar));setTimeout(alinharBar,400);return r}}
addEventListener('resize',()=>{clearTimeout(alinharBar._t);alinharBar._t=setTimeout(alinharBar,120)});

/* v0.55: Início › Ano Letivo — todas as turmas na mesma grelha (cabem numa linha), com a oferta em etiqueta */
function juntarTcards(){$$('#view .card').forEach(c=>{const G=[...c.querySelectorAll(':scope>.tcards')];const H=[...c.querySelectorAll(':scope>h3.gof')];if(G.length<2||c.querySelector(':scope>.tcall'))return;
  const all=document.createElement('div');all.className='tcards tcall';all.setAttribute('role','group');
  G.forEach((g,k)=>{const h=H[k];const dot=h&&h.querySelector('.dot');const nm=h?h.childNodes[1]&&h.childNodes[1].textContent.trim():'';[...g.children].forEach(b=>{if(nm&&!b.querySelector('.tcof'))b.querySelector('.tch')&&b.querySelector('.tch').insertAdjacentHTML('afterend',`<span class="tcof"><i style="background:${dot?dot.style.background:'var(--acc)'}"></i>${esc(nm)}</span>`);all.appendChild(b)});g.remove()});
  H.forEach(h=>h.remove());const hd=c.querySelector(':scope>.wghd,:scope>.row');(hd||c.firstChild).after?hd.after(all):c.appendChild(all)})}
function alinharDash(){const d=document.querySelector('#view .dashtop'),l=document.querySelector('#view .inlay');if(!d||!l)return;const r=l.getBoundingClientRect();d.style.maxWidth='none';d.style.marginLeft='0px';d.style.marginRight='0px';const x=d.getBoundingClientRect().left;d.style.marginLeft=Math.max(0,Math.round(r.left-x))+'px';d.style.width=Math.round(r.width)+'px'}
addEventListener('resize',()=>{clearTimeout(alinharDash._t);alinharDash._t=setTimeout(alinharDash,60)});
new MutationObserver(()=>{if(VIEW==='inicio'){clearTimeout(juntarTcards._t);juntarTcards._t=setTimeout(()=>{juntarTcards();alinharDash()},30)}}).observe(document.getElementById('view')||document.body,{childList:true,subtree:true});

function contarNumeros(root){if(!animOK())return;const els=[...root.querySelectorAll('.kpi .v,.kpi>b,.kpi>strong,.cdn b,.cdbig,.pnk b,.stk b,.fk b,.dmk b')].slice(0,40);
  els.forEach(e=>{if(e.children.length||e.dataset.cn)return;const t=e.textContent.trim();if(!/^\d{1,4}([.,]\d{1,2})?$/.test(t))return;const dec=(t.split(/[.,]/)[1]||'').length,sep=t.includes(',')?',':'.';const fim=parseFloat(t.replace(',','.'));if(!fim)return;e.dataset.cn=1;const t0=performance.now(),D=700;
    const f=n=>{const k=Math.min(1,(n-t0)/D),q=1-Math.pow(1-k,3);e.textContent=(fim*q).toFixed(dec).replace('.',sep);if(k<1)requestAnimationFrame(f);else e.textContent=t};requestAnimationFrame(f)})}
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn,.tcard,.fgc,.nlb');if(!b||!animOK()||b.disabled)return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*1.2;const o=document.createElement('span');o.className='rpl';o.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;if(getComputedStyle(b).position==='static')b.style.position='relative';b.appendChild(o);setTimeout(()=>o.remove(),600)},{passive:true});

{const _aT56=autoTestes;autoTestes=function(){const r=_aT56.apply(this,arguments);const chk=(n,v,e)=>{try{window.__regT&&window.__regT(n,v,e)}catch(_){}if(Math.abs((v==null?NaN:+v)-e)<1e-6)r.ok++;else{r.err.push(n+': obtido '+v+', esperado '+e);r.f++}};
  try{const tb={id:'tb',nome:'B',ciclo:'3c',anoEsc:'7.º',disciplina:'X',dominios:[{id:'d1',peso:100}],mencoes:MENCOES_DEF.map(m=>({...m})),regra:{},alunos:[],instrumentos:[]};const ts={...tb,id:'ts',ciclo:'sec',anoEsc:'10.º'};
    const sec=isSec(ts)&&!isSec(tb);chk('deteção secundário/básico',sec?1:0,1);
    if(sec){chk('básico 49,5 % → nível 3',nivel(tb,.495),3);chk('básico 49,4 % → nível 2',nivel(tb,.494),2);chk('básico 89,5 % → nível 5',nivel(tb,.895),5);
      chk('secundário 9,5 → 10',nivel(ts,.475),10);chk('secundário 9,4 → 9',nivel(ts,.47),9);
      chk('negativa 49,4 % (básico)',negativa(tb,.494)?1:0,1);chk('positiva 49,5 % (básico)',negativa(tb,.495)?1:0,0);chk('negativa 9,4 (secundário)',negativa(ts,.47)?1:0,1)}
    chk('ponderada sem pesos = vazio',ponderada({dominios:[{id:'a',peso:0}]},{a:.5})==null?1:0,1);
    chk('ponderada 30/70',ponderada({dominios:[{id:'a',peso:30},{id:'b',peso:70}]},{a:1,b:0}),.3);
    chk('ponderada ignora domínio sem dados',ponderada({dominios:[{id:'a',peso:30},{id:'b',peso:70}]},{a:.8,b:null}),.8)}catch(e){r.err.push('erro (v0.56): '+e.message);r.f++}
  return r}}

/* v0.56 · cabeçalho em grelha: [título][escola] ··· [ano][turma][ícones] / ações centradas na linha seguinte */
let HCOL1=0;
function cabecalho(){const b=$('#bar');if(!b)return;const pc=document.body.classList.contains('dev-pc');if(!pc){b.classList.remove('hgrid','hx1','hcomp');b.style.removeProperty('grid-template-columns');return}
  b.classList.add('hgrid');b.classList.remove('hx1','hcomp','hcomp2','hcomp3','bar2','bar1','icwrap');cabecalho.aperto=0;b.style.removeProperty('grid-template-columns');const ce=$('#ctxEsc');if(ce)ce.style.removeProperty('margin-left');
  const cs=getComputedStyle(b),L0=b.getBoundingClientRect().left+parseFloat(cs.paddingLeft),W=b.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),G=12;
  const hero=VIEW==='inicio'&&document.querySelector('#view .in-hero');if(hero){const d=Math.round(hero.getBoundingClientRect().left-L0-G);if(d>150)HCOL1=d;else if(d<20)HCOL1=0}
  const x=$('#barx'),tw=b.querySelector(':scope>.ttlw');if(x)x.classList.remove('cmp','cmp2');
  b.querySelectorAll(':scope>.ctx').forEach(c=>[...c.childNodes].forEach(n=>{if(n.nodeType===3&&n.nodeValue.trim()){const sp=document.createElement('span');sp.className='ctxt';sp.textContent=n.nodeValue.trim();n.replaceWith(sp,' ')}}));
  const larg=e=>{if(!e)return 0;const r=document.createRange();r.selectNodeContents(e);return Math.ceil(r.getBoundingClientRect().width)};
  const nat=tw?Math.max(...[...tw.querySelectorAll('#ttl,.crumb')].map(larg),0)+2+((c=>c&&c.offsetWidth?c.offsetWidth+10:0)(tw.querySelector('#eacasa:not([hidden])'))):0;
  const escV=ce&&getComputedStyle(ce).display!=='none';let escN=0;if(escV){ce.style.setProperty('width','max-content','important');escN=Math.ceil(ce.getBoundingClientRect().width);ce.style.removeProperty('width')}
  const dir=()=>[...b.children].filter(e=>e!==tw&&e!==ce&&e!==x&&e.offsetWidth&&getComputedStyle(e).display!=='none').reduce((s,e)=>s+Math.ceil(e.getBoundingClientRect().width)+G,0);
  const hc=W>=1150?HCOL1:0;let tcol,ecol;const NIV=['hcomp','hcomp2','hcomp3'];
  const escNat=()=>{if(!escV)return 0;ce.style.setProperty('width','max-content','important');const w=Math.ceil(ce.getBoundingClientRect().width);ce.style.removeProperty('width');return w};
  const aplica=()=>b.style.setProperty('grid-template-columns',`${Math.round(tcol)}px ${escV?Math.round(ecol)+'px':'0px'} minmax(0,1fr) auto auto auto`,'important');
  const exc=()=>{const R=L0+W;let m=0;[...b.children].forEach(e=>{if(e===x||!e.offsetWidth)return;m=Math.max(m,e.getBoundingClientRect().right-R)});return m};
  for(let nv=0;nv<=3;nv++){if(nv>0){if(nv===3&&W>=1300)break;b.classList.add(NIV[nv-1])}
    escN=escNat();tcol=Math.max(nat,hc);ecol=escN;let livre=W-dir()-(escV?G:0)-G;
    if(tcol+ecol>livre){tcol=Math.min(tcol,Math.max(nat<=hc?hc:Math.min(nat,Math.max(hc,200)),0));if(tcol+ecol>livre)ecol=Math.max(170,livre-tcol);if(tcol+ecol>livre)tcol=Math.max(140,livre-ecol)}
    aplica();if(exc()<=1&&tcol>=Math.min(nat,hc||nat)-1&&ecol>=escN-1)break}
  let o=exc();if(o>1){const de=Math.min(o,Math.max(0,ecol-150));ecol-=de;o-=de;if(o>0)tcol=Math.max(110,tcol-o);aplica()}
  cabecalho.aperto=(b.classList.contains('hcomp')?1:0)+(tcol<Math.max(nat,hc)-1?1:0)+(escV&&ecol<escN-1?1:0);
  if(x&&x.children.length){b.classList.add('hx1');const xok=()=>x.scrollWidth<=x.clientWidth+1&&new Set([...x.children].filter(e=>e.offsetWidth).map(e=>e.offsetTop)).size<=1&&b.scrollWidth<=b.clientWidth+1;
    /* 0.910: antes de passar os botões para a 2.ª linha, esconde as etiquetas «Ano Letivo»/«Turma» */if(!xok()&&!b.classList.contains('hcomp')){b.classList.add('hcomp');if(!xok())b.classList.remove('hcomp')}
    if(!xok()){x.classList.add('cmp');if(!xok()){x.classList.remove('cmp');b.classList.remove('hx1');barCompacto()}}if(!b.classList.contains('hx1'))cabecalho.aperto+=.5}}
{const _bL=barLayout;barLayout=function(){if(document.body.classList.contains('dev-pc')){try{cabecalho()}catch(_){}return}return _bL.apply(this,arguments)}}

/* v0.57 · UFCD/UC escolhidas em Disciplinas que Leciono passam a ser lecionadas: entram nas turmas com a Componente Tecnológica */
function ufcdCod(c){return String(c||'').replace(/\D+/g,'')}
function ufcdSinc(u,on,sil){const a=A();if(!a||!u)return;const uc=/^uc/i.test(u.tipo||'')||/^UC\b/i.test(String(u.cod));const alvo=uc?UC_N:UFCD_N;const pre=uc?'UC ':'UFCD ';const k=ufcdCod(u.cod);if(!k)return;const mud=[];
  a.turmas.filter(t=>t.disciplina===alvo||(!uc&&t.disciplina===UFCD_N)).forEach(t=>{t.modulos=t.modulos||[];const m=t.modulos.find(x=>ufcdCod(x.cod)===k);
    if(on&&!m){t.modulos.push({id:uid(),cod:pre+String(u.cod).replace(/^\D+/,''),nome:u.nome||'',horas:+u.horas||'',ini:'',fim:'',ufcdAuto:1});mud.push(t.nome)}
    else if(!on&&m&&m.ufcdAuto&&!(t.instrumentos||[]).some(i=>i.modulo===m.id)){t.modulos=t.modulos.filter(x=>x!==m);mud.push(t.nome)}});
  if(mud.length){save();if(!sil)toast((on?'Acrescentada a ':'Retirada de ')+mud.join(', ')+': '+pre+u.cod,'ok')}}
function ufcdSincTodas(){const a=A();if(!a)return;ufcdAno().forEach(u=>{try{ufcdSinc(u,true,true)}catch(_){}})}
setTimeout(()=>{try{ufcdSincTodas()}catch(_){}},1500);

/* v0.57 · Componente Tecnológica (UFCD/UC): cada unidade aparece como "disciplina" e a avaliação é por unidade, não por período */
const ehUnidC=t=>!!t&&(t.disciplina===UFCD_N||t.disciplina===UC_N);
const ehUnid=t=>ehUnidC(t)||(!!t&&ofertaDe(t)==='profissional');
const rotUnid=(m,t)=>{const c=String(m&&m.cod||'').trim();if(!c)return ((m&&m.nome)||'').slice(0,18);if(t&&!ehUnidC(t)&&ofertaDe(t)==='profissional')return /^\d/.test(c)?'Mód. '+c:c;return /^\d/.test(c)?'UFCD '+c:c};
function unidPreparar(t){if(ehUnid(t)&&(t.modulos||[]).length&&!t.porModulo){try{if(!ehUnidC(t)){const M=t.modulos;(t.instrumentos||[]).forEach(i=>{if(i.modulo&&M.some(m=>m.id===i.modulo))return;const m=M.find(m=>m.ini&&i.data>=m.ini&&(!m.fim||i.data<=m.fim))||M[0];i.modulo=m.id})}modAtivar(t);save()}catch(e){console.warn(e)}}}
{const _nT=navTurmas;navTurmas=function(){const r=_nT.apply(this,arguments);try{navUnid()}catch(e){console.warn(e)}return r}}
function navUnid(){const tree=$('#tTree');if(!tree)return;const a=A();if(!a)return;
  const botoes=t=>{const M=t.modulos||[];if(!M.length)return null;unidPreparar(t);const ma=t.id===S.turmaAtiva?modAtivo(t):null;
    return M.map(m=>`<button type="button" role="radio" aria-checked="${!!ma&&ma.id===m.id}" class="tdsb tdsm ${ma&&ma.id===m.id?'on':''}" data-tu="${t.id}" data-tm="${m.id}" title="${esc((ehUnidC(t)?'':t.disciplina+' · ')+rotUnid(m,t)+' · '+(m.nome||'')+(m.horas?' · '+m.horas+' h':''))}"><span class="tdd" style="--h:${corSigla(siglaDe(t))}"></span><span class="lbl">${esc(rotUnid(m,t))}</span></button>`).join('')};
  tree.querySelectorAll('.tdsb[data-tt]').forEach(b=>{const t=a.turmas.find(x=>x.id===b.dataset.tt);if(!ehUnid(t))return;const h=botoes(t);if(h)b.outerHTML=h});
  tree.querySelectorAll('.tnode[data-tt].aberto').forEach(b=>{const t=a.turmas.find(x=>x.id===b.dataset.tt);if(!ehUnid(t)||(b.nextElementSibling&&b.nextElementSibling.classList.contains('tdsel')))return;const h=botoes(t);if(h)b.insertAdjacentHTML('afterend',`<div class="tdsel" role="radiogroup" aria-label="${esc(unidMod(t).p)}">${h}</div>`)});
  tree.querySelectorAll('.tdsb[data-tu]').forEach(b=>b.onclick=()=>{const id=b.dataset.tu;const t=a.turmas.find(x=>x.id===id);if(!t)return;modEscolher(t,b.dataset.tm);if(S.turmaAtiva!==id){S.turmaAtiva=id;save()}UI.navTFech=null;UI.inst=null;
    const v=NEEDS_T.includes(VIEW)||['painel','aula','mra'].includes(VIEW)?VIEW:'instrumentos';go(UNID_REDIR[v]||v)});
  const t=T();if(ehUnid(t)){const m=modAtivo(t);const td=tree.querySelector('.tnode.cur .tdisc');if(m&&td&&ehUnidC(t))td.textContent=rotUnid(m,t)}
  ['avaliacao','intercalar','dominios'].forEach(v=>document.querySelectorAll(`#side [data-v="${v}"]`).forEach(e=>{if(ehUnid(t)){e.dataset.unidOc=1;e.style.display='none'}else if(e.dataset.unidOc){delete e.dataset.unidOc;e.style.display=''}}))}
const UNID_REDIR={avaliacao:'modulos',intercalar:'modulos',dominios:'modulos'};
{const _gU=go;go=function(v){const t=T();if(ehUnid(t)){unidPreparar(t);if(UNID_REDIR[v])v=UNID_REDIR[v]}const r=_gU.apply(this,[v,...[].slice.call(arguments,1)]);try{navUnid();unidTitulo()}catch(_){}return r}}
function unidTitulo(){const t=T();if(!ehUnid(t)||!NEEDS_T.includes(VIEW))return;if(VIEW==='modulos'){const e=$('#ttl');if(e)e.textContent=e.textContent.replace(/\s·\sMód\.\s\S+$/,'').replace(/\s·\s(Componente Tecnológica \((UFCD|UC)\)|(UFCD\s)?\d{3,5}(\s·\s[^·]+)?)$/,'');return}const m=modAtivo(t),e=$('#ttl');if(!m||!e)return;const r=rotUnid(m,t);let x=e.textContent;if(!ehUnidC(t)){x=x.replace(/\s·\sMód\.\s\S+$/,'');if(m.nome)x=x.replace(' · '+m.nome,'');e.textContent=x+' · '+r;return}if(x.includes(t.disciplina))x=x.replace(t.disciplina,r);else if(m.nome&&x.includes(m.nome))x=x.replace(' · '+m.nome,'').replace(m.nome,'');if(!x.includes(r))x+=' · '+r;e.textContent=x.replace(/\s·\s(UFCD\s)?\d{3,5}\s·\s[^·]+$/,' · '+r)}
/* Instrumentos da UFCD/UC ativa num só cartão (sem períodos) */
{const _vI=vInstrumentos;vInstrumentos=function(){const r=_vI.apply(this,arguments);try{const t=T();if(ehUnid(t)&&!UI.inst)instPorUnid(t);if(ehUnid(t)&&UI.inst){const ip=$('#i-per');if(ip){const w=ip.closest('div');w.style.display='none';const g=w.parentElement;if(g&&g.style.gridTemplateColumns)g.style.gridTemplateColumns='2fr 1.3fr 1fr'}}}catch(e){console.warn(e)}return r}}
function instPorUnid(t){const v=$('#view');const U=unidMod(t),m=modAtivo(t);const rows=[...v.querySelectorAll('tr[data-irow]')];const thead=v.querySelector('table.lst thead');const tcls=(v.querySelector('table.lst')||{}).className||'lst';
  const cards=[...v.querySelectorAll(':scope>.card')].filter(c=>!c.classList.contains('alert')&&!c.classList.contains('modbar')&&(c.querySelector('table.lst')||c.querySelector('.empty')));if(!cards.length)return;
  const c=document.createElement('div');c.className='card';c.innerHTML=`<div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${m?esc(rotUnid(m,t)):esc(U.p)}</h2>${m?`<span class="mut">${esc([m.nome,m.horas?m.horas+' h':''].filter(Boolean).join(' · '))}</span>`:''}</div>${rows.length?`<table class="${esc(tcls)}">${thead?thead.outerHTML:''}<tbody></tbody></table>`:`<div class="empty">Sem instrumentos nesta ${esc(U.um)}.</div>`}`;
  const tb=c.querySelector('tbody');rows.forEach(tr=>tb.appendChild(tr));cards[0].before(c);cards.forEach(x=>x.remove())}

