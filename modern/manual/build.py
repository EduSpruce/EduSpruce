#!/usr/bin/env python3
# Constrói o manual (HTML) a partir de m*.txt; páginas do índice vêm de paginas.json (2.ª passagem)
import re,html,json,os,sys,base64
V=sys.argv[1] if len(sys.argv)>1 else '1.034'
PAG=json.load(open('paginas.json')) if os.path.exists('paginas.json') else {}
src=''.join(open(f).read()+'\n' for f in sorted(f for f in os.listdir('.') if re.match(r'm\d+\.txt$',f)))
def inl(s):
    s=html.escape(s,quote=False)
    s=re.sub(r'\[\[(.+?)\]\]',lambda m:'<span class="mn">'+m.group(1)+'</span>',s)
    s=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s)
    return s
out=[];toc=[];cap=0;parte=None;lst=None;nimg=0
def fecha():
    global lst
    if lst: out.append('</%s>'%lst);lst=None
def imgtag(n,cls=''):
    p='img/%s.jpg'%n
    if not os.path.exists(p): print('FALTA imagem',n,file=sys.stderr);return ''
    if re.match(r'(tel-|al-|login-tel)',n): cls+=' tel'
    return '<img class="%s" src="%s" loading="eager">'%(cls,p)
for raw in src.split('\n'):
    l=raw.rstrip()
    if not l.strip(): fecha();continue
    if l.startswith('@parte '):
        fecha();num,tit,sub=[x.strip() for x in l[7:].split('|')]
        parte=(num,tit);toc.append(('p',num,tit,None))
        out.append(f'<section class="parte" id="pt{num}"><div class="pnum">Parte {num}</div><h1 class="ptit">{inl(tit)}</h1><p class="psub">{inl(sub)}</p></section>');continue
    if l.startswith('# '):
        fecha();cap+=1;t=l[2:].strip();toc.append(('c',cap,t,None))
        out.append(f'<h1 class="cap" id="c{cap}"><span class="cn">{cap}</span>{inl(t)}</h1>');continue
    if l.startswith('## '):
        fecha();out.append(f'<h2>{inl(l[3:])}</h2>');continue
    m=re.match(r'^(!{1,3})\s*([^|]+?)\s*\|\s*(.*)$',l)
    if m:
        fecha();ns=[x.strip() for x in m.group(2).split(',')];leg=m.group(3);nimg+=len(ns)
        k=len(m.group(1))
        if k==1: out.append(f'<figure class="f1">{imgtag(ns[0])}<figcaption>{inl(leg)}</figcaption></figure>')
        else: out.append(f'<figure class="fn f{len(ns)}"><div class="row">'+''.join(f'<div>{imgtag(n)}</div>' for n in ns)+f'</div><figcaption>{inl(leg)}</figcaption></figure>')
        continue
    if l.startswith('> '):
        fecha();tx=re.sub(r'^Exemplo[^:]*:\s*','',l[2:]);out.append('<div class="ex"><span class="tag">Exemplo</span>'+inl(tx)+'</div>');continue
    if l.startswith('? '): fecha();out.append(f'<div class="dica"><span class="tag">Dica</span>{inl(l[2:])}</div>');continue
    m=re.match(r'^(\d+)\.\s+(.*)$',l)
    if m:
        if lst!='ol': fecha();out.append('<ol>');lst='ol'
        out.append(f'<li>{inl(m.group(2))}</li>');continue
    if l.startswith('- '):
        if lst!='ul': fecha();out.append('<ul>');lst='ul'
        out.append(f'<li>{inl(l[2:])}</li>');continue
    if l.startswith('|'):
        cells=[c.strip() for c in l.strip('|').split('|')]
        if lst!='table': fecha();out.append('<table class="tb">');lst='table';out.append('<tr>'+''.join(f'<th>{inl(c)}</th>' for c in cells)+'</tr>');continue
        out.append('<tr>'+''.join(f'<td>{inl(c)}</td>' for c in cells)+'</tr>');continue
    fecha();out.append(f'<p>{inl(l)}</p>')
fecha()
# índice
ti=[]
for k,n,t,_ in toc:
    if k=='p': ti.append(f'<div class="tp"><span>Parte {n} · {inl(t)}</span></div>')
    else:
        pg=PAG.get(str(n),'')
        ti.append(f'<a class="tc" href="#c{n}"><span class="tn">{n}</span><span class="tt">{inl(t)}</span><span class="dots"></span><span class="tpg">{pg}</span></a>')
logo=base64.b64encode(open('/home/claude/eduspruce/docs/logo.png','rb').read()).decode()
capa=f'''<section class="capa"><div class="cbg"></div><div class="cin">
<img class="clogo" src="data:image/png;base64,{logo}">
<div class="cmarca">EduSpruce</div>
<h1>Manual de Instruções</h1>
<p class="csub">Guia completo de todos os menus, ecrãs e funcionalidades — com exemplos e {nimg} imagens, para quem usa a app pela primeira vez.</p>
<div class="cgrid"><img src="img/inicio-simples.jpg"><img src="img/avaliacao.jpg"><img src="img/meucal-Mês.jpg"><img src="img/provas-av-editor.jpg"></div>
<p class="cver">Versão {V} · novembro de 2026 · eduspruce.pt</p></div></section>'''
css=open('manual.css').read()
open('capa.html','w').write(f'<!DOCTYPE html><html lang="pt-PT"><head><meta charset="utf-8"><style>{css}</style></head><body>{capa}</body></html>')
doc=f'''<!DOCTYPE html><html lang="pt-PT"><head><meta charset="utf-8"><title>EduSpruce — Manual de Instruções</title><style>{css}</style></head><body>
<section class="indice"><h1 class="ih">Índice</h1><div class="icols">{''.join(ti)}</div></section>
<main>{''.join(out)}</main></body></html>'''
open('manual.html','w').write(doc)
print('capítulos',cap,'imagens',nimg)
json.dump([(k,n,t) for k,n,t,_ in toc],open('toc.json','w'),ensure_ascii=False)
