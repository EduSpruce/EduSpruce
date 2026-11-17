/* ---------- ficheiros zip, calendários iCal, site HTML, XML de intercâmbio ---------- */
function zipBlob(files){
  const enc=new TextEncoder(),tab=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;tab[n]=c>>>0;}
  const crc=u=>{let c=~0;for(let i=0;i<u.length;i++)c=tab[(c^u[i])&255]^(c>>>8);return ~c>>>0;},parts=[],cen=[];let off=0;
  const hd=(sig,n,u,c,len,extra)=>{const b=new DataView(new ArrayBuffer(len));let o=0;b.setUint32(o,sig,true);o+=4;if(extra){b.setUint16(o,20,true);o+=2;}b.setUint16(o,20,true);o+=2;b.setUint16(o,0x0800,true);o+=2;b.setUint16(o,0,true);o+=2;b.setUint16(o,0,true);o+=2;b.setUint16(o,0x21,true);o+=2;b.setUint32(o,c,true);o+=4;b.setUint32(o,u.length,true);o+=4;b.setUint32(o,u.length,true);o+=4;b.setUint16(o,n.length,true);o+=2;b.setUint16(o,0,true);o+=2;return [b,o];};
  for(const f of files){const n=enc.encode(f.name),u=typeof f.text==='string'?enc.encode(f.text):f.text,c=crc(u);
    const [lh]=hd(0x04034b50,n,u,c,30,false);parts.push(new Uint8Array(lh.buffer),n,u);
    const [ch,o]=hd(0x02014b50,n,u,c,46,true);ch.setUint32(o+10,off,true);cen.push(new Uint8Array(ch.buffer),n);off+=30+n.length+u.length;}
  let cs=0;for(const x of cen)cs+=x.length;const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
  return new Blob(parts.concat(cen,[new Uint8Array(e.buffer)]),{type:'application/zip'});
}
function deliverBlob(filename,blob){try{const a=h('a',{href:URL.createObjectURL(blob),download:filename});document.body.append(a);a.click();a.remove();toast('Descarregado: '+filename,null,null,'ok');}catch(e){toast('Não foi possível descarregar aqui. Abra o ficheiro HTML diretamente no navegador.',null,null,'bad');}}
const icsEsc=s=>String(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');
const icsFold=l=>{if(l.length<=74)return l;const out=[l.slice(0,74)];for(let i=74;i<l.length;i+=73)out.push(' '+l.slice(i,i+73));return out.join('\r\n');};
function icsFor(kind,e,cardsOv){
  const ix=IX(),K=cicloK(S),wks=semanas();if(!wks.length)return null;
  const mid=new Date((new Date(S.inicio+'T12:00:00').getTime()+new Date(S.fim+'T12:00:00').getTime())/2).toISOString().slice(0,10),d8=x=>x.replace(/-/g,''),t6=x=>x.replace(':','')+'00';
  let tw=0;const wkIdx=wks.map(w=>w.n?(tw++)%K:-1),stamp=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z',FULL=(1<<(2*K))-1;
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EduSpruce EduSchedule//PT','CALSCALE:GREGORIAN','X-WR-CALNAME:'+icsEsc(KINDS[kind][1]+' '+e.name)];let n=0;
  for(const c of cardsOv||cardsFor(kind,e.id)){if(c.day==null)continue;const l=ix.l.get(c.lessonId),p0=tempoDe(l,c.period),p1=tempoDe(l,c.period+c.len-1);if(!p0.start||!p1.end)continue;
    const inf=cardInfo(c,kind,e.id,true),mk=perMask(l.per,K),dates=[];wks.forEach((w,wi)=>{const iso=w.dias[c.day];if(iso&&wkIdx[wi]>=0&&(mk>>perBit(wkIdx[wi],iso<mid?0:1,K)&1))dates.push(iso);});
    if(!dates.length)continue;
    const ev=(d0,extra)=>{L.push('BEGIN:VEVENT','UID:'+c.id+'-'+d8(d0)+'-'+kind+e.id+'@planeador-horarios','DTSTAMP:'+stamp,'DTSTART:'+d8(d0)+'T'+t6(p0.start),'DTEND:'+d8(d0)+'T'+t6(p1.end));for(const x of extra)L.push(icsFold(x));
      L.push(icsFold('SUMMARY:'+icsEsc(inf.title+(kind!=='c'&&inf.cls?' · '+inf.cls:''))),icsFold('LOCATION:'+icsEsc(inf.rms||'')),icsFold('DESCRIPTION:'+icsEsc([inf.cls,inf.tch,inf.per].filter(Boolean).join(' · '))),'END:VEVENT');n++;};
    const pp=perParts(l.per,K);
    if(!pp.w){const set=new Set(dates),ex=[],d=new Date(dates[0]+'T12:00:00'),end=new Date(dates[dates.length-1]+'T12:00:00');for(;d<=end;d.setDate(d.getDate()+7)){const iso=d.toISOString().slice(0,10);if(!set.has(iso))ex.push(d8(iso)+'T'+t6(p0.start));}
      ev(dates[0],dates.length>1?['RRULE:FREQ=WEEKLY;UNTIL='+d8(dates[dates.length-1])+'T235959'].concat(ex.length?['EXDATE:'+ex.join(',')]:[]):[]);}
    else for(const d0 of dates)ev(d0,[]);}
  L.push('END:VCALENDAR');return n?L.join('\r\n'):null;
}
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'')||'x';
function siteFiles(){
  const po=printOpts(),files=[],idx={c:[],t:[],r:[]},mdl=M(),css=printCss(po)+'body{max-width:1100px;margin:14px auto;padding:0 12px}a{color:#1d4ed8}nav{margin-bottom:10px;font-size:12px}ul{columns:4;list-style:none;padding:0}h1{font-size:20px}h2{font-size:15px;margin-top:18px}';
  const page=(title,body)=>'<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>'+css+'</style></head><body>'+body+'</body></html>';
  for(const k of ['c','t','r'])for(const e of list(k)){const r=mdl.resIdx(k,e.id);if(!mdl.cardsOf(r).some(a=>mdl.posOf(a)>=0))continue;const fn=k+'-'+slug(e.name)+'-'+e.id,ics=icsFor(k,e);
    files.push({name:fn+'.html',text:page(KINDS[k][1]+' '+e.name,'<nav><a href="index.html">← Todos os horários</a>'+(ics?' · <a href="ics/'+fn+'.ics">Calendário (.ics)</a>':'')+'</nav>'+printCard(k,e,po).outerHTML)});
    if(ics)files.push({name:'ics/'+fn+'.ics',text:ics});idx[k].push('<li><a href="'+fn+'.html">'+esc(e.name)+'</a></li>');}
  if(!files.length)return null;
  files.unshift({name:'index.html',text:page('Horários '+S.name,'<h1>'+esc(S.name)+' · '+esc(S.ano)+'</h1><input id="q" type="search" placeholder="Procurar turma, professor ou sala" style="font:inherit;font-size:14px;padding:6px 10px;width:100%;max-width:420px;border:1px solid #999;border-radius:6px"><scr'+'ipt>document.getElementById("q").addEventListener("input",function(e){var t=e.target.value.toLowerCase();document.querySelectorAll("li").forEach(function(li){li.style.display=li.textContent.toLowerCase().indexOf(t)<0?"none":"";});});</scr'+'ipt>'+['c','t','r'].map(k=>idx[k].length?'<h2>'+KINDS[k][2]+'</h2><ul>'+idx[k].join('')+'</ul>':'').join('')+'<p style="font-size:11px;color:#666">Gerado em '+new Date().toISOString().slice(0,10)+'.</p>')});
  return files;
}
function siteZip(){const f=siteFiles();return f?zipBlob(f):null;}
function xmlTroca(){
  const ix=IX(),id=(p,s)=>p+'_'+String(s||'').trim().replace(/\s+/g,'_'),d8=x=>(x||'').replace(/-/g,''),t4=x=>(x||'').replace(':',''),now=new Date().toISOString(),L=[];
  const el=(ind,tag,txt)=>{if(txt!==''&&txt!=null)L.push(ind+'<'+tag+'>'+esc(txt)+'</'+tag+'>');};
  L.push('<?xml version="1.0" encoding="UTF-8"?>','<document version="3.4" xmlns="https://untis.at/untis/XmlInterface" date="'+d8(now.slice(0,10))+'" time="'+now.slice(11,19).replace(/:/g,'')+'">');
  L.push(' <general>');el('  ','schoolname',S.name);el('  ','schoolyearbegindate',d8(S.inicio));el('  ','schoolyearenddate',d8(S.fim));el('  ','header1',S.name);el('  ','header2',S.ano);L.push(' </general>');
  L.push(' <timeperiods>');S.days.forEach((d,di)=>S.periods.forEach((p,pi)=>{L.push('  <timeperiod id="TP_'+(di+1)+'_'+(pi+1)+'">');el('   ','day',di+1);el('   ','period',pi+1);el('   ','starttime',t4(p.start));el('   ','endtime',t4(p.end));L.push('  </timeperiod>');}));L.push(' </timeperiods>');
  L.push(' <departments>');uniq(S.classes.map(c=>c.dep).concat(S.teachers.map(t=>t.dep))).forEach(d=>{L.push('  <department id="'+esc(id('DP',d))+'">');el('   ','longname',d);L.push('  </department>');});L.push(' </departments>');
  L.push(' <rooms>');S.rooms.forEach(r=>{L.push('  <room id="'+esc(id('RM',r.name))+'">');el('   ','longname',r.name);el('   ','capacity',r.cap||'');if(r.alt&&ix.r.has(r.alt))L.push('   <room_alternative id="'+esc(id('RM',nm('r',r.alt)))+'"/>');L.push('  </room>');});L.push(' </rooms>');
  L.push(' <subjects>');S.subjects.forEach(s=>{L.push('  <subject id="'+esc(id('SU',s.short||s.name))+'">');el('   ','longname',s.name);L.push('  </subject>');});L.push(' </subjects>');
  L.push(' <teachers>');S.teachers.forEach(t=>{L.push('  <teacher id="'+esc(id('TR',t.short||t.name))+'">');el('   ','surname',t.name);el('   ','payrollnumber',t.proc||'');if(t.dep)L.push('   <teacher_department id="'+esc(id('DP',t.dep))+'"/>');L.push('  </teacher>');});L.push(' </teachers>');
  L.push(' <classes>');S.classes.forEach(c=>{L.push('  <class id="'+esc(id('CL',c.name))+'">');el('   ','longname',c.full||c.name);if(c.dt&&ix.t.has(c.dt))L.push('   <class_teacher id="'+esc(id('TR',sh('t',c.dt)))+'"/>');if(c.roomId&&ix.r.has(c.roomId))L.push('   <class_room id="'+esc(id('RM',nm('r',c.roomId)))+'"/>');if(c.dep)L.push('   <class_department id="'+esc(id('DP',c.dep))+'"/>');L.push('  </class>');});L.push(' </classes>');
  L.push(' <students>');S.alunos.forEach(a=>{L.push('  <student id="'+esc(id('ST',a.num||a.id))+'">');el('   ','longname',a.nome);if(ix.c.has(a.classId))L.push('   <student_class id="'+esc(id('CL',nm('c',a.classId)))+'"/>');L.push('  </student>');});L.push(' </students>');
  L.push(' <lessons>');
  for(const l of S.lessons){if(l.ign)continue;const cards=(ix.cl.get(l.id)||[]).filter(c=>c.day!=null);
    l.linhas.forEach((ln,j)=>{const cls=(ln.cls&&ln.cls.length?ln.cls.filter(x=>l.classIds.includes(x)):l.classIds);
      L.push('  <lesson id="LS_'+l.n+String(j).padStart(2,'0')+'">');el('   ','periods',l.tl);if(ix.s.has(ln.s))L.push('   <lesson_subject id="'+esc(id('SU',sh('s',ln.s)))+'"/>');if(ln.t&&ix.t.has(ln.t))L.push('   <lesson_teacher id="'+esc(id('TR',sh('t',ln.t)))+'"/>');
      if(cls.length)L.push('   <lesson_classes id="'+esc(cls.map(c=>id('CL',nm('c',c))).join(' '))+'"/>');el('   ','effectivebegindate',d8(S.inicio));el('   ','effectiveenddate',d8(S.fim));if(l.per)el('   ','text',perLabel(l.per,cicloK(S)));
      L.push('   <times>');for(const c of cards){const rs=roomsOfCard(c);for(let i=0;i<c.len;i++){const p=tempoDe(l,c.period+i),rm=c.rx&&c.rx[i]?(c.rx[i][j]==='-'?'':c.rx[i][j]):rs[j];L.push('    <time>');el('     ','assigned_day',c.day+1);el('     ','assigned_period',c.period+i+1);el('     ','assigned_starttime',t4(p.start));el('     ','assigned_endtime',t4(p.end));if(rm&&ix.r.has(rm))L.push('     <assigned_room id="'+esc(id('RM',nm('r',rm)))+'"/>');L.push('    </time>');}}
      L.push('   </times>','  </lesson>');});}
  L.push(' </lessons>','</document>');return L.join('\r\n');
}

