/* ===================== v0.46: relatórios individuais — PDF único, um por aluno ou ZIP ===================== */
function relAutoBlocos(t,x,per){const AV=((x.autoavD||{})[per])||{};const dom=AV.dom||{};const nota=AV.nota||((x.autoav||{})[per])||'';const L=(t.dominios||[]).filter(d=>dom[d.id]);
  if(!L.length&&!nota&&!AV.forte&&!AV.melhorar)return [];const lab=k=>{const z=AUTO_N.find(q=>String(q[0])===String(k));return z?z[1]:String(k)};
  const R=[{h:'Autoavaliação'}];if(L.length)R.push({tabela:{cab:['Domínio','Autoavaliação'],linhas:L.map(d=>[d.nome,lab(dom[d.id])])}});
  const tx=[nota?'Classificação que propõe: '+nota+'.':'',AV.forte?'O que fiz bem: '+AV.forte:'',AV.melhorar?'O que posso melhorar: '+AV.melhorar:''].filter(Boolean);tx.forEach(z=>R.push({p:z}));return R}
function relBlocos(t,x,per){const P=relPers(t,per);const nfin=ponderada(t,pctsFinal(t,x.id,per));const men=temMencoes(t);
  return [{h:'Relatório Individual — '+x.nome},{kv:[['Nome',x.nome],['N.º',x.num],['Turma',x.origem||t.nome],['Disciplina',t.disciplina]],foto:fotoSrc(x)},
    {tabela:{cab:['Domínio','Ponderação',...P.map(p=>relPerNome(t,p)),...(men?['Menção']:[])],linhas:[...t.dominios.flatMap((d,k)=>relGrpLin(t,d,k,P.length+(men?1:0))).map(d=>d.__g?d.__g:[d.grupo?'   '+d.nome:d.nome,d.peso+'%',...P.map(p=>pctD(t,domPer(t,x.id,d.id,p))||'—'),...(men?[(mencao(t,pctsFinal(t,x.id,per)[d.id])||{}).nome||'—']:[])]),
      ['Classificação','',...P.map(p=>fmtNota(t,ponderada(t,pctsPer(t,x.id,p)))||'—'),...(men?[nfin!=null?'Nível '+nivel(t,nfin):'']:[])]]}},
    ...relAutoBlocos(t,x,per),{h:'Síntese Descritiva'},{p:(x.sintese&&x.sintese[per])||sintese(t,x,per),just:1,ind:1},...((x.obsPer||{})[per]?[{h:'Observações'},{p:x.obsPer[per],just:1}]:[])]}
function relSpec(t,L,per){const spec={titulo:'Relatórios Individuais',subtitulo:t.nome+' · '+t.disciplina+' · '+perNome(per),escola:escolaDe(t),turma:t,blocos:[],assinaturas:[profAssin(),'O(A) Encarregado(a) de Educação']};
  L.forEach((x,i)=>{if(i)spec.blocos.push({pb:true});spec.blocos.push(...relBlocos(t,x,per))});if(L.length===1){spec.titulo='Relatório Individual';spec.subtitulo=L[0].nome+' · '+t.nome+' · '+t.disciplina+' · '+perNome(per)}return spec}
const nomeFich=x=>String(x).replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,' ').trim();
/* ZIP mínimo (sem compressão) */
const CRCT=(()=>{const T_=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;T_[n]=c>>>0}return T_})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRCT[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function zipCriar(files){const enc=new TextEncoder();const parts=[],cen=[];let off=0;const d=new Date();const dt=((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1))&0xFFFF,dd=(((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate())&0xFFFF;
  files.forEach(f=>{const nm=enc.encode(f.nome);const data=f.dados instanceof Uint8Array?f.dados:new Uint8Array(f.dados);const crc=crc32(data);const h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,dt,true);h.setUint16(12,dd,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,nm.length,true);h.setUint16(28,0,true);
    parts.push(new Uint8Array(h.buffer),nm,data);const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint16(12,dt,true);c.setUint16(14,dd,true);c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
    cen.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+data.length});
  const csz=cen.reduce((s,x)=>s+x.length,0);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,csz,true);e.setUint32(16,off,true);
  return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/zip'})}
async function relExportar(){const t=T();if(!t)return;const per=UI.relPer||perAtual(t);const todos=alunosAval(t);const sel=UI.relAluno&&UI.relAluno!=='all'?todos.filter(x=>x.id===UI.relAluno):todos;if(!sel.length)return toast('Sem alunos para exportar','aviso');
  const v=sel.length===1?'um':await avisoModal('Exportar relatórios ('+sel.length+' alunos)',['PDF único: todos os relatórios num só ficheiro, um por página.','Um PDF por aluno: descarrega cada relatório num ficheiro separado.','ZIP: um único ficheiro .zip com um PDF por aluno (recomendado para enviar ou arquivar).'],[{t:ic('file',15)+' PDF Único',v:'um'},{t:ic('download',15)+' Um PDF por Aluno',v:'cada'},{t:ic('folder',15)+' ZIP por Aluno',c:'pri',v:'zip'},{t:'Cancelar',v:null}]);
  if(!v)return;const base=nomeFich(t.nome+' '+t.disciplina+' '+per+'.º '+perW());
  if(v==='um')return pdfDocumento(relSpec(t,sel,per),sel.length===1?nomeFich('Relatório '+String(sel[0].num).padStart(2,'0')+' '+sel[0].nome+' - '+base):'Relatórios '+base);
  const out=[];for(let k=0;k<sel.length;k++){const x=sel[k];try{ocupado&&ocupado('A criar '+(k+1)+' de '+sel.length+'…')}catch(_){}const bytes=await pdfDocumento(relSpec(t,[x],per),'',{blob:true});if(bytes)out.push({nome:nomeFich(String(x.num).padStart(2,'0')+' - '+x.nome)+'.pdf',dados:bytes})}
  try{livre&&livre()}catch(_){}if(!out.length)return toast('Não foi possível criar os PDF','erro');
  if(v==='zip'){download('Relatórios '+base+'.zip',zipCriar(out.map(f=>({nome:'Relatórios '+base+'/'+f.nome,dados:f.dados}))),'application/zip');toast(out.length+' relatórios num ZIP','ok');return}
  for(const f of out){download('Relatório '+f.nome.replace(/\.pdf$/,'')+' - '+base+'.pdf',f.dados,'application/pdf');await new Promise(r=>setTimeout(r,350))}toast(out.length+' PDF exportados','ok')}
{const _vR=vRelatorios;vRelatorios=function(){const r=_vR.apply(this,arguments);try{const bx=$('#barx');if(bx&&!$('#b-relexp')){bx.insertAdjacentHTML('beforeend',`<button class="btn" id="b-relexp">${ic('folder',15)} Exportar Todos…</button>`);$('#b-relexp').onclick=relExportar}}catch(_){}return r};if(go._f)go._f.relatorios=vRelatorios}

