/* ---------- Definições › Módulos Opcionais (1.058): separador próprio ----------
   O cartão #def-mods (criado pelo cartaoAvisosDef no Geral) passa para o separador «mods»; no Geral deixa de aparecer.
   Os módulos da versão com base de dados (Spruce It!, Spruce Live, Spruce Exam, Digitalização, Autoavaliação) acrescentam-se sozinhos ao #def-mods. */
{const _vdMo=vDefinicoes;vDefinicoes=function(){const quer=UI.defTab==='mods';if(quer)UI.defTab='geral';let r;try{r=_vdMo.apply(this,arguments)}finally{if(quer)UI.defTab='mods'}
  try{const v=$('#view');const tb=v&&v.querySelector('.deftabs');
    if(tb&&!tb.querySelector('[data-dt2="mods"]')){const ref=tb.querySelector('[data-dt2="geral"]');const b=document.createElement('button');b.dataset.dt2='mods';b.innerHTML=ic('layers',15)+' Os Meus Módulos';ref?ref.after(b):tb.appendChild(b)}
    if(tb){tb.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',UI.defTab==='notif'?!!b.dataset.dtn:b.dataset.dt2===UI.defTab);if(b.dataset.dt2)b.onclick=()=>{UI.defTab=b.dataset.dt2;vDefinicoes()};else if(b.dataset.dtn)b.onclick=()=>{UI.defTab='notif';vDefinicoes()}})}
    const m=v&&v.querySelector('#def-mods');
    if(quer){if(v){v.innerHTML='';if(tb)v.appendChild(tb);if(m){m.querySelector('h2')&&m.querySelector('h2').remove();m.classList.add('defmods-tab');v.appendChild(m)}else v.insertAdjacentHTML('beforeend',`<div class="card empty">${ic('layers',30)}<br><b>Sem módulos opcionais</b></div>`);try{alinharTabsTopo()}catch(_){}}}
    else if(m)m.remove()}catch(e){console.warn(e)}return r}
  if(go._f)go._f.definicoes=vDefinicoes}
{const _gMo=go;go=function(v){if(go._f&&go._f.definicoes!==vDefinicoes)go._f.definicoes=vDefinicoes;return _gMo.apply(this,arguments)}}
/* Spruce Notes e Jornal Notes: ao entrar, o quadro ajusta-se sozinho ao ecrã */
{const _gMQ=go;go=function(v){const ant=VIEW;const r=_gMQ.apply(this,arguments);try{if((v==='sprucenote'||v==='snjornal')&&ant!==v){let n=0;const f=()=>{const b=document.getElementById('mq-zf');if(b&&document.querySelector('[data-mq]')){b.click()}else if(b&&n>6){}else if(n++<12)setTimeout(f,120)};setTimeout(f,150)}}catch(_){}return r};if(_gMQ._f)go._f=_gMQ._f}
/* Jornal Notes: o quadro principal antigo passa a chamar-se Jornal Notes */
setTimeout(()=>{try{const q=S.snj&&S.snj.quadros;const r=q&&q.find(x=>x.id==='raiz');if(r&&(r.nome==='SpruceNote do Jornal'||r.nome==='JornalNote')){r.nome='Jornal Notes';save()}const q2=S.sn&&S.sn.quadros;const r2=q2&&q2.find(x=>x.id==='raiz');if(r2&&r2.nome==='SpruceNote'){r2.nome='Spruce Notes';save()}}catch(_){}},1200);

