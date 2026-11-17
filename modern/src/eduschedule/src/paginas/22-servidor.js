/* ---------- trabalho em equipa e publicação, pela base de dados da EduSpruce (antes: servidor do EduTime) ---------- */
const srv={on:false,id:'',pub:'',dono:false,user:'',role:'',v:0,pend:false,conflito:false,t:null,envio:false,base:null,tp:null};
/* fusão a três: junta as minhas alterações e as dos outros a partir da versão comum; nos campos mudados pelos dois fica a minha e conta-se o conflito */
function fundir3(b,m,t,conf,path){
  const J=JSON.stringify,eq=(x,y)=>J(x)===J(y),obj=x=>x&&typeof x==='object'&&!Array.isArray(x),ids=x=>Array.isArray(x)&&x.every(e=>e&&typeof e==='object'&&'id' in e);
  if(eq(m,t))return m;if(eq(b,m))return t;if(eq(b,t))return m;
  if(ids(m)&&ids(t)){const B=new Map((ids(b)?b:[]).map(e=>[e.id,e])),Mm=new Map(m.map(e=>[e.id,e])),Tm=new Map(t.map(e=>[e.id,e])),out=[],seen=new Set();
    for(const id of t.map(e=>e.id).concat(m.map(e=>e.id))){if(seen.has(id))continue;seen.add(id);const bi=B.get(id),mi=Mm.get(id),ti=Tm.get(id);
      if(mi&&ti)out.push(fundir3(bi,mi,ti,conf,path+'/'+id));else if(mi){if(!bi)out.push(mi);else if(!eq(bi,mi)){out.push(mi);conf.push(path+'/'+id);}}else if(ti){if(!bi)out.push(ti);else if(!eq(bi,ti)){out.push(ti);conf.push(path+'/'+id);}}}
    return out;}
  if(obj(m)&&obj(t)){const B=obj(b)?b:{},out={};for(const k of new Set(Object.keys(t).concat(Object.keys(m)))){const hm=k in m,ht=k in t,hb=k in B;
      if(hm&&ht)out[k]=fundir3(B[k],m[k],t[k],conf,path+'/'+k);else if(hm){if(!hb)out[k]=m[k];else if(!eq(B[k],m[k])){out[k]=m[k];conf.push(path+'/'+k);}}else if(ht){if(!hb)out[k]=t[k];else if(!eq(B[k],t[k])){out[k]=t[k];conf.push(path+'/'+k);}}}
    return out;}
  conf.push(path);return m;
}
async function srvFundir(){
  const r=await api('GET','api/estado');if(!r.ok||!r.j.state)return false;const conf=[],base=srv.base?JSON.parse(srv.base):null,meu=JSON.parse(JSON.stringify(S));delete meu.log;const deles=r.j.state;
  const junto=base?fundir3(base,meu,deles,conf,''):deles;S=normalize(junto);syncCards(S);srv.v=r.j.v|0;srv.base=JSON.stringify(deles);srv.conflito=false;MV++;ui.sel=null;render();
  toast('Alterações de '+(r.j.quem||'outra pessoa')+' juntas com as suas.'+(conf.length?' Em '+conf.length+' pontos mexeram os dois: ficou a sua versão.':''),null,null,conf.length?null:'ok');
  srv.envio=false;await srvEnviar();return true;
}
async function api(metodo,caminho,corpo){
  /* as mesmas operações do antigo servidor, agora funções da base de dados (modern/supabase/migrations/0018_eduschedule.sql) */
  if(!PONTE)return {ok:false,status:0,j:{erro:'Sem ligação à EduSpruce.'}};
  const c=caminho.replace(/^\/?api\//,''),id=srv.id,R=(fn,a)=>PONTE.rpc(fn,a),ok=j=>({ok:true,status:200,j:j==null?{}:j});
  try{
    if(c==='eu'){const r=await R('eduschedule_eu',{});if(!r)return {ok:false,status:404,j:{}};srv.id=r.id;srv.pub=r.pub||'';srv.dono=!!r.dono;return ok({user:PONTE.email(),role:r.papel,v:r.v});}
    if(c==='estado'&&metodo==='GET')return ok(await R('eduschedule_ler',{p_id:id}));
    if(c==='estado'&&metodo==='PUT'){const r=await R('eduschedule_gravar',{p_id:id,p_base:corpo.base|0,p_estado:corpo.state});return r&&r.ok?ok(r):{ok:false,status:409,j:r||{}};}
    if(c==='versao')return ok(await R('eduschedule_versao',{p_id:id}));
    if(c==='publicar'){const r=await R('eduschedule_publicar',{p_id:id,p_ficheiros:corpo.files});srv.pub=r.codigo;return ok(r);}
    if(c==='utilizadores'&&metodo==='GET')return ok(await R('eduschedule_membros',{p_id:id}));
    if(c==='utilizadores'&&metodo==='POST'){await R('eduschedule_membro_guardar',{p_id:id,p_email:String(corpo.user||'').trim().toLowerCase(),p_papel:corpo.role});return ok();}
    if(c==='utilizadores'&&metodo==='DELETE'){await R('eduschedule_membro_apagar',{p_id:id,p_email:corpo.user});return ok();}
    if(c==='sair'){await R('eduschedule_sair',{p_id:id});return ok();}
  }catch(e){return {ok:false,status:500,j:{erro:String(e&&e.message||e)}};}
  return {ok:false,status:404,j:{}};
}
function srvEstado(){const el=$('#status');if(el&&srv.on)el.textContent=(srv.conflito?'Conflito com o horário partilhado':srv.pend?'A guardar no horário partilhado…':'Horário partilhado · '+srv.user+' ('+({admin:'administrador',editor:'editor',leitor:'só consulta'}[srv.role]||srv.role)+')');}
async function srvCarregar(msg){const r=await api('GET','api/estado');if(!r.ok)return false;srv.v=r.j.v|0;srv.conflito=false;srv.pend=false;if(r.j.state){srv.base=JSON.stringify(r.j.state);S=normalize(r.j.state);if(srv.role==='leitor')S.ro=true;undo=[];redo=[];MV++;ui.sel=null;render();if(msg)toast(msg,null,null,'ok');}srvEstado();return true;}
async function srvEnviar(){
  if(!srv.on||srv.role==='leitor'||srv.conflito||srv.envio)return;srv.envio=true;srv.pend=true;srvEstado();
  try{const enviado=JSON.stringify(S),r=await api('PUT','api/estado',{base:srv.v,state:JSON.parse(enviado)});
    if(r.ok){srv.v=r.j.v;srv.pend=false;srv.base=enviado;if(S.autoPub){clearTimeout(srv.tp);srv.tp=setTimeout(()=>srvPublicar(true),15000);}}
    else if(r.status===409){srv.envio=false;if(!(await srvFundir())){srv.conflito=true;toast((r.j.quem||'Outra pessoa')+' guardou uma versão mais recente e não foi possível juntar as alterações.','Carregar a versão partilhada',()=>srvCarregar('Versão partilhada carregada.'),'bad');}return;}
    else if(r.status===401){srv.on=false;srvLogin();}
  }catch(e){}
  srv.envio=false;srvEstado();
}
function srvAgendar(){if(!srv.on||srv.role==='leitor')return;srv.pend=true;clearTimeout(srv.t);srv.t=setTimeout(srvEnviar,1200);srvEstado();}
function srvLogin(){toast('A sessão da EduSpruce terminou: volte a entrar.',null,null,'bad');}
async function srvIniciar(){
  if(!PONTE)return;let r;try{r=await api('GET','api/eu');}catch(e){return;}
  if(!r.ok||!r.j.user)return;
  srv.on=true;PONTE.equipa=true;srv.user=r.j.user;srv.role=r.j.role;await srvCarregar();
  if(!srv.v&&srv.role!=='leitor')srvEnviar();
  setInterval(async()=>{if(!srv.on||srv.envio)return;try{const q=await api('GET','api/versao');if(q.ok&&q.j.v>srv.v){if(srv.pend||srv.conflito){if(!srv.envio)srvFundir();}else srvCarregar((q.j.quem||'Outra pessoa')+' atualizou o horário.');}}catch(e){}},8000);
}
async function srvPublicar(calado){const f=siteFiles();if(!f){if(!calado)toast('Não há horários colocados para publicar.');return;}const r=await api('POST','api/publicar',{files:f});if(calado===true){if(r.ok)srv.pubEm=new Date().toLocaleTimeString('pt-PT').slice(0,5);return;}toast(r.ok?'Publicado: '+r.j.n+' ficheiros em '+PONTE.publico(srv.pub):(r.j.erro||'Não foi possível publicar.'),null,null,r.ok?'ok':'bad');}
{const g=save;save=function(){g.apply(this,arguments);srvAgendar();};}
(function(){
  const o=PAGES.definicoes;PAGES.definicoes=m=>{o(m);
    if(!srv.on){m.append(panel('Trabalho em equipa e publicação',h('p',{class:'text-sm opacity-80'},'Este horário é só seu e fica na sua conta. Para colegas editarem o mesmo horário (cada um com a sua conta da EduSpruce) e para publicar os horários e calendários para professores e alunos, partilhe-o: passa a ficar num espaço partilhado da base de dados.'),
      h('div',{class:'flex flex-wrap gap-2'},btn('Partilhar este horário',async()=>{if(!PONTE)return;try{await PONTE.rpc('eduschedule_criar',{p_nome:S.name||'Horário',p_estado:JSON.parse(JSON.stringify(S))});location.reload();}catch(e){toast('Não foi possível partilhar: '+(e&&e.message||e),null,null,'bad');}},'btn-sm btn-primary')),
      h('p',{class:'text-xs opacity-60'},'Se um colega o juntar a um horário partilhado (pelo seu e-mail), esse horário abre aqui sozinho.')));return;}
    const pub=srv.pub?PONTE.publico(srv.pub):'',box=h('div',{id:'srv-users',class:'text-sm'},'A carregar…');
    m.append(panel('Trabalho em equipa e publicação',h('div',{class:'flex flex-wrap items-center gap-2'},badge('Ligado como '+srv.user,'ok'),badge({admin:'administrador',editor:'editor',leitor:'só consulta'}[srv.role],'info'),badge('versão '+srv.v+' do horário','mute'),h('span',{class:'grow'}),
        srv.role!=='leitor'?h('label',{class:'flex items-center gap-2 text-sm'},h('input',{type:'checkbox',id:'srv-auto',class:'toggle toggle-sm',checked:!!S.autoPub,onchange:e=>{const v=e.target.checked;mutate(()=>{S.autoPub=v;},true);}}),'Publicar sozinho quando o horário muda'+(srv.pubEm?' (última: '+srv.pubEm+')':'')):null,
        srv.role!=='leitor'?btn('Publicar horários e calendários',()=>srvPublicar(),'btn-sm btn-primary'):null,btn(srv.dono?'Deixar de partilhar':'Sair da equipa',async()=>{if(!confirm(srv.dono?'Deixar de partilhar? O horário volta a ser só seu e os colegas deixam de o ver.':'Sair deste horário partilhado?'))return;if(srv.dono){PONTE.equipa=false;PONTE.gravar(JSON.stringify(S));}await api('POST','api/sair');location.reload();},'btn-sm')),
      pub?h('p',{class:'text-sm'},'Consulta pública, sem conta: ',h('a',{href:pub,class:'link',target:'_blank',rel:'noopener'},pub),'. Cada página tem o endereço do calendário (.ics), que se pode subscrever no telemóvel e se atualiza a cada publicação.'):h('p',{class:'text-sm opacity-70'},'Ainda não publicado.'),
      srv.role==='admin'?h('div',{class:'flex flex-col gap-2'},h('span',{class:'font-medium text-sm'},'Colegas com acesso'),box,h('div',{class:'flex flex-wrap items-end gap-2'},field('E-mail (conta autorizada na EduSpruce)',h('input',{type:'email',id:'su-u',class:'input input-sm w-64'})),field('Papel',selEl('su-r','editor',[['editor','Editor'],['leitor','Só consulta'],['admin','Administrador']],()=>{},'Papel')),
        btn('Dar ou mudar acesso',async()=>{const r=await api('POST','api/utilizadores',{user:$('#su-u').value,role:$('#su-r').value});toast(r.ok?'Acesso guardado.':(r.j.erro||'Não foi possível.'),null,null,r.ok?'ok':'bad');if(r.ok)render();},'btn-sm'))):null));
    if(srv.role==='admin')api('GET','api/utilizadores').then(r=>{if(!r.ok)return;box.replaceChildren(h('ul',{class:'flex flex-col gap-1'},r.j.map(x=>h('li',{class:'flex items-center gap-2'},h('b',{},x.user),badge(x.role,'mute'),x.user!==srv.user?btn('Apagar',async()=>{await api('DELETE','api/utilizadores',{user:x.user});render();},'btn-xs btn-ghost text-error'):null))));});
  };
})();
setTimeout(srvIniciar,300);
{const g=setStatus;setStatus=function(){g.apply(this,arguments);srvEstado();};}
