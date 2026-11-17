/* ===================== v0.981 · Módulo «Contactos»: e-mails dos colegas (importados do Excel da escola) ===================== */
if(!ICONS.mail)ICONS.mail='<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>';
TITLES.contactos='Contactos';
const contOn=()=>S.cfg.contOn!==false;
const contL=()=>{if(!Array.isArray(S.contactos))S.contactos=[];return S.contactos};
const contNorm=x=>normT(String(x||'')).replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();
/* contacto de uma pessoa pelo nome (igual, ou mesmo primeiro e último nome); prefere o do ano letivo ativo */
function contDe(nome){if(!nome)return null;const n=contNorm(String(nome).replace(/^prof(\.|essor|essora)?\s+/i,''));if(!n)return null;const L=contL();const an=(A()||{}).nome||'';
  const C=L.filter(c=>contNorm(c.nome)===n);const C2=C.length?C:L.filter(c=>mesmoNome(c.nome,n));if(!C2.length)return null;return C2.find(c=>c.ano===an)||C2[C2.length-1]}
function contEmailHtml(nome){if(!contOn())return '';const c=contDe(nome);if(!c||!c.email)return '';return `<small class="dtmail"><a href="mailto:${esc(c.email)}" title="Escrever a ${esc(c.nome)}">${ic('mail',12)} ${esc(c.email)}</a></small>`}
/* turmas de que a pessoa é Diretor(a) de Turma, pelos horários importados */
function contDTs(nome){const a=A();if(!a||!a.horarios)return [];return Object.keys(a.horarios).filter(k=>{const d=a.horarios[k]&&a.horarios[k].diretor;return d&&(contNorm(d)===contNorm(nome)||mesmoNome(d,nome))})}
async function contImportar(f){ocupado&&ocupado('A ler '+f.name+'…');let F;try{F=await lerXlsxCru(f)}catch(e){try{livre&&livre()}catch(_){}return toast('Não foi possível ler o ficheiro: '+e.message,'erro')}try{livre&&livre()}catch(_){}
  const novos=[];const col=r=>r.replace(/\d+/g,''),lin=r=>+r.replace(/\D+/g,'');
  Object.values(F).forEach(C=>{const rows={};Object.entries(C).forEach(([r,v])=>{(rows[lin(r)]=rows[lin(r)]||{})[col(r)]=v});const ks=Object.keys(rows).map(Number).sort((a,b)=>a-b);if(!ks.length)return;
    /* encontra o cabeçalho (Nome / Email / Ano Letivo) nas primeiras linhas; sem cabeçalho, deduz pelas colunas */
    let H=null,h0=0;for(const k of ks.slice(0,6)){const r=rows[k];const m={};Object.entries(r).forEach(([c,v])=>{const x=contNorm(v);if(/^nome/.test(x))m.nome=c;else if(/mail/.test(x))m.email=c;else if(/ano/.test(x))m.ano=c;else if(/telef|telem|contacto/.test(x))m.tel=c;else if(/grupo|departamento|disciplina/.test(x))m.grupo=c});if(m.nome&&m.email){H=m;h0=k;break}}
    if(!H){const r=rows[ks[0]];const cs=Object.keys(r);const ce=cs.find(c=>/@/.test(String(r[c])));if(!ce)return;H={email:ce,nome:cs.find(c=>c!==ce&&/[a-z]{2,} [a-z]{2,}/i.test(String(r[c])))};h0=ks[0]-1;if(!H.nome)return}
    ks.filter(k=>k>h0).forEach(k=>{const r=rows[k];const email=String(r[H.email]||'').trim().toLowerCase();const nome=String(r[H.nome]||'').trim().replace(/\s+/g,' ');if(!nome||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return;
      novos.push({nome,email,ano:H.ano?String(r[H.ano]||'').trim():((A()||{}).nome||''),tel:H.tel?String(r[H.tel]||'').trim():'',grupo:H.grupo?String(r[H.grupo]||'').trim():''})})});
  if(!novos.length)return toast('Não encontrei nomes e e-mails neste ficheiro (precisa de colunas «Nome» e «Email»)','erro');
  const L=contL();let n=0,a=0;novos.forEach(x=>{const e=L.find(c=>c.email===x.email&&(c.ano||'')===(x.ano||''))||L.find(c=>c.email===x.email);if(e){if(e.nome!==x.nome||(x.tel&&e.tel!==x.tel)||(x.grupo&&e.grupo!==x.grupo)){Object.assign(e,{nome:x.nome,ano:x.ano||e.ano},x.tel?{tel:x.tel}:{},x.grupo?{grupo:x.grupo}:{});a++}}else{L.push({id:uid(),...x});n++}});
  L.sort((x,y)=>x.nome.localeCompare(y.nome,'pt'));save();audit('Contactos','Importação de contactos',f.name+' · '+n+' novos, '+a+' atualizados');toast(n+' contacto'+(n!==1?'s':'')+' novo'+(n!==1?'s':'')+(a?' · '+a+' atualizado'+(a!==1?'s':''):''),'ok');if(VIEW==='contactos')vContactos()}
