#!/usr/bin/env python3
"""es — ferramentas da EduSpruce para as sessões do Claude (saídas curtas, para gastar poucos tokens).

  ./es onde PADRÃO [-n 25] [-c 60] [-a] [-l] [-w]   procurar no código (regex; minúsculas = sem distinguir maiúsculas)
                                                    -a inclui dados/, -l só ficheiros e contagens, -w palavra inteira
  ./es ver FICHEIRO LINHA [N=30] [-c 400]           mostrar N linhas a partir de LINHA (cada uma cortada a -c colunas)
  ./es fn NOME [-m 3000]                            definição de uma função/constante e de todas as redefinições
  ./es troca FICHEIRO <<'X' … X                     trocas exatas, em blocos  <<<< antigo ==== novo >>>>
  ./es novo NOME [--css] [--depois PEÇA]            nova peça: JS no fim do programa, --css no fim dos estilos
  ./es testa [--sem-browser]                        construir, verificar a sintaxe e abrir todas as vistas sem ecrã (sem e com base de dados)
  ./es pub "novidade 1|novidade 2" [-m MENSAGEM] [--cl "linha|linha"] [--sem-espelho]
                                                    publicar a versão seguinte (eduspruce.pt + espelho)
  ./es mapa                                         vista → título → função → peças (a última peça é a que vale)
  ./es estado                                       versão, alterações por publicar, publicações de outras sessões
  ./es junta [SAIDA]                                a app (sem base de dados) num só ficheiro

Caminhos relativos a modern/src/ (app/101-planta-sala-aula.js, moderno/provas.js); /aluno.html = raiz do repositório."""
import sys,os,re,json,glob,subprocess,datetime,shutil
import signal;signal.signal(signal.SIGPIPE,signal.SIG_DFL)
from decimal import Decimal
R=os.path.realpath(os.path.join(os.path.dirname(os.path.realpath(__file__)),'..','..'))
SRC=os.path.join(R,'modern','src');APP=os.path.join(SRC,'app');T='/tmp/es';os.makedirs(T,exist_ok=True)
PARTIR=os.path.join(R,'modern','scripts','partir.py');DB=os.path.join(R,'modern','scripts','db.mjs')
GERADOS=['index.html','arquivo.html','eduschedule.html','horarios.html','spruceit.html','arena.html','pulso.html','versao.json','app','esm','supabase-config.json']

def sh(*a,cwd=R,ok=True):
    r=subprocess.run(a,cwd=cwd,capture_output=True,text=True)
    if ok and r.returncode:sys.exit(f'ERRO ({" ".join(a[:3])}): '+(r.stderr or r.stdout).strip()[-800:])
    return r
def rel(p):
    p=os.path.relpath(p,R)
    return p[len('modern/src/'):] if p.startswith('modern/src/') else '/'+p
def res(p):
    if p.startswith('/') and os.path.exists(p):return p
    for c in (os.path.join(SRC,p),os.path.join(R,p.lstrip('/'))):
        if os.path.exists(c):return c
    m=sorted(set(glob.glob(os.path.join(SRC,p+'*'))+glob.glob(os.path.join(APP,'*'+os.path.basename(p)+'*'))+glob.glob(os.path.join(SRC,'moderno','*'+os.path.basename(p)+'*'))))
    m=[x for x in m if os.path.isfile(x)]
    if len(m)==1:return m[0]
    sys.exit('ficheiro não encontrado: '+p+(' (vários: '+', '.join(rel(x) for x in m[:6])+')' if m else ''))
def ordem():return [n for n in open(os.path.join(APP,'ordem.txt'),encoding='utf-8').read().split('\n') if n.strip()]
def fontes(dados=False):
    f=[os.path.join(APP,n) for n in ordem() if dados or not n.startswith('dados/')]
    f+=sorted(glob.glob(os.path.join(SRC,'moderno','*.js')))+[os.path.join(SRC,'moderno','patches.json')]
    f+=sorted(glob.glob(os.path.join(SRC,'arena','*.html'))+glob.glob(os.path.join(SRC,'pulso','*.html'))+glob.glob(os.path.join(SRC,'edutime','*')))
    f+=[os.path.join(SRC,'esm',x) for x in ('arranque.mjs','migracao.mjs','supabase-prov.mjs')]
    f+=[os.path.join(R,x) for x in ('aluno.html','forms.html','provas.html','sw.js')]
    f+=sorted(glob.glob(os.path.join(R,'modern','supabase','migrations','*.sql')))
    return [x for x in f if os.path.isfile(x)]
def opt(a,nome,omissao=None,flag=False):
    if nome in a:
        i=a.index(nome)
        if flag:a.pop(i);return True
        a.pop(i);return a.pop(i)
    return omissao

# ---------------------------------------------------------------- procurar e ler
def onde(a):
    n=int(opt(a,'-n',25));c=int(opt(a,'-c',60));tudo=opt(a,'-a',flag=True);so_f=opt(a,'-l',flag=True);pal=opt(a,'-w',flag=True)
    if not a:sys.exit('uso: ./es onde PADRÃO')
    pat=a[0];rx=re.compile((r'(?<![\w$])'+pat+r'(?![\w$])') if pal else pat,0 if pat!=pat.lower() else re.I)
    tot=0;nf=0;mostra=0;por={}
    for f in fontes(tudo):
        try:L=open(f,encoding='utf-8',errors='replace').read().split('\n')
        except Exception:continue
        k=0
        for i,l in enumerate(L):
            m=rx.search(l)
            if not m:continue
            k+=1;tot+=1
            if so_f or mostra>=n:continue
            a0=max(0,m.start()-c);b0=min(len(l),m.end()+c)
            print(f'{rel(f)}:{i+1}: '+('…' if a0 else '')+l[a0:b0].strip()+('…' if b0<len(l) else ''));mostra+=1
        if k:nf+=1;por[rel(f)]=k
    if so_f:
        for f,k in sorted(por.items(),key=lambda x:-x[1])[:n]:print(f'{k:4d}  {f}')
    if tot>mostra and not so_f:print(f'(+{tot-mostra} resultados; total {tot} em {nf} ficheiros — -n para mais, -l por ficheiro)')
    if not tot:print('sem resultados'+('' if tudo else ' (-a procura também em dados/)'))
def ver(a):
    c=int(opt(a,'-c',400))
    if len(a)<2:sys.exit('uso: ./es ver FICHEIRO LINHA [N]')
    f=res(a[0]);i=int(a[1]);n=int(a[2]) if len(a)>2 else 30
    L=open(f,encoding='utf-8',errors='replace').read().split('\n')
    for k in range(max(1,i),min(len(L),i+n-1)+1):
        l=L[k-1];print(f'{k}: '+(l if len(l)<=c else l[:c]+f'…[+{len(l)-c}]'))
    print(f'({rel(f)}: {len(L)} linhas)')
def fim_bloco(s,i,maxc):
    """a partir de s[i], fim do primeiro bloco {…} (ignora texto entre aspas, modelos `…${}` e comentários)"""
    j=s.find('{',i,i+400)
    if j<0:k=s.find('\n',i);return k if k>0 else len(s)
    d=0;k=j;pilha=[];N=min(len(s),i+maxc*4)
    while k<N:
        ch=s[k]
        if pilha and pilha[-1]=='`':
            if ch=='\\':k+=2;continue
            if ch=='`':pilha.pop()
            elif ch=='$' and s[k+1:k+2]=='{':pilha.append('{');d+=1;k+=1
            k+=1;continue
        if ch in '"\'':
            q=ch;k+=1
            while k<N and s[k]!=q and s[k]!='\n':k+=2 if s[k]=='\\' else 1
        elif ch=='`':pilha.append('`')
        elif ch=='/' and s[k+1:k+2]=='/':
            k=s.find('\n',k);k=N if k<0 else k
        elif ch=='/' and s[k+1:k+2]=='*':
            k=s.find('*/',k+2);k=N if k<0 else k+1
        elif ch=='{':d+=1;(pilha.append('{') if pilha else None)
        elif ch=='}':
            d-=1
            if pilha and pilha[-1]=='{':pilha.pop()
            if d==0:return k+1
        k+=1
    return N
def fn(a):
    m=int(opt(a,'-m',3000))
    if not a:sys.exit('uso: ./es fn NOME')
    n=re.escape(a[0])
    rx=re.compile(rf'(?:(?<![\w$.])function\s*\*?\s*{n}\s*\(|(?<![\w$.])(?:const|let|var)\s+{n}\s*=|(?<![\w$.]){n}\s*=\s*(?:async\s*)?(?:function\b|\([^()]*\)\s*=>|[\w$]+\s*=>)|(?:window|EduGest|go\._f)\.{n}\s*=)')
    achou=0
    for f in fontes():
        s=open(f,encoding='utf-8',errors='replace').read()
        for mt in rx.finditer(s):
            if achou>=6:print('(mais definições: ./es onde '+a[0]+')');return
            achou+=1;i=mt.start();e=fim_bloco(s,i,m);txt=s[i:e]
            print(f'── {rel(f)}:{s.count(chr(10),0,i)+1}  ({len(txt)} car.)')
            print(txt if len(txt)<=m else txt[:m]+f'\n…[+{len(txt)-m} car.; ./es ver para o resto]')
    if not achou:print('não encontrei a definição de '+a[0]+' (tente ./es onde '+a[0]+')')

# ---------------------------------------------------------------- alterar
def troca(a):
    if not a:sys.exit("uso: ./es troca FICHEIRO <<'X'\n<<<<\nantigo\n====\nnovo\n>>>>\nX")
    f=res(a[0]);txt=sys.stdin.read();s=open(f,encoding='utf-8').read()
    blocos=re.findall(r'<<<<\n(.*?)\n====\n(.*?)\n?>>>>',txt,re.S)
    if not blocos:sys.exit('nenhum bloco <<<< … ==== … >>>> encontrado')
    for k,(x,y) in enumerate(blocos):
        c=s.count(x)
        if c!=1:sys.exit(f'bloco {k+1}: o texto antigo aparece {c}× em {rel(f)} (tem de ser 1×) — nada foi alterado')
        s=s.replace(x,y,1)
    open(f,'w',encoding='utf-8').write(s);print(f'ok: {len(blocos)} troca(s) em {rel(f)}')
def novo(a):
    dep=opt(a,'--depois');css=opt(a,'--css',flag=True)
    if not a:sys.exit('uso: ./es novo NOME [--css] [--depois PEÇA]')
    import unicodedata
    t=unicodedata.normalize('NFD',a[0]);t=''.join(c for c in t if unicodedata.category(c)!='Mn').lower();nome=re.sub(r'[^a-z0-9]+','-',t).strip('-')[:40]
    o=ordem();num=max(int(re.match(r'(?:dados/)?(\d+)',x).group(1)) for x in o if re.match(r'(?:dados/)?\d+',x))+1
    p=f'{num:03d}-{nome}.'+('css' if css else 'js')
    if dep:i=next((k for k,x in enumerate(o) if dep in x),None);i=None if i is None else i+1
    elif css:
        i0=next((k for k,x in enumerate(o) if '<style id="css965">' in open(os.path.join(APP,x),encoding='utf-8',errors='replace').read()),None)
        i=None if i0 is None else next((k for k in range(i0+1,len(o)) if o[k].endswith('.html')),None)
    else:i=next((k for k,x in enumerate(o) if x.endswith('-fim-do-programa.js')),None)
    if i is None:sys.exit('não encontrei onde pôr a peça')
    o.insert(i,p);open(os.path.join(APP,p),'w',encoding='utf-8').write(f'/* ===================== {a[0]} ===================== */\n')
    open(os.path.join(APP,'ordem.txt'),'w',encoding='utf-8').write('\n'.join(o)+'\n');print('nova peça: app/'+p)

# ---------------------------------------------------------------- construir e testar
def junta(a=None):
    out=(a[0] if a else os.path.join(T,'plano.html'))
    sh('python3',PARTIR,'juntar',APP,out);return out
def principal(html):
    s=open(html,encoding='utf-8').read();i=s.find('pdfgz-wk');i=s.find('<script>',i)+8;j=s.find('</script>',i)
    p=os.path.join(T,'principal.js');open(p,'w',encoding='utf-8').write(s[i:j]);return p
def sintaxe(js):
    r=subprocess.run(['node','--check',js],capture_output=True,text=True)
    if r.returncode:sys.exit('ERRO de sintaxe:\n'+r.stderr.strip()[:900])
def construir(saida):
    p=junta();sintaxe(principal(p))
    r=subprocess.run(['node',DB,p,saida],capture_output=True,text=True)
    if r.returncode:sys.exit('ERRO a construir a versão com base de dados:\n'+(r.stderr or r.stdout).strip()[-900:])
    r=subprocess.run(['node',os.path.join(SRC,'eduschedule','build.js'),os.path.dirname(saida)],capture_output=True,text=True)
    if r.returncode:sys.exit('ERRO a construir o EduSchedule:\n'+(r.stderr or r.stdout).strip()[-900:])
    r=subprocess.run(['node',os.path.join(R,'modern','scripts','csp.mjs'),os.path.dirname(saida)],capture_output=True,text=True)
    if r.returncode:sys.exit('ERRO na política de conteúdo (CSP):\n'+(r.stderr or r.stdout).strip()[-900:])
    return p
def testa(a):
    semb=opt(a,'--sem-browser',flag=True);d=os.path.join(T,'build');shutil.rmtree(d,ignore_errors=True);os.makedirs(d)
    p=construir(os.path.join(d,'index.html'))
    js=[x for x in glob.glob(os.path.join(d,'app','app.*.js'))];[sintaxe(x) for x in js]
    print('construção e sintaxe: ok')
    if semb:return
    r=subprocess.run(['node',os.path.join(R,'modern','tests','vistas.mjs'),p],capture_output=True,text=True)
    print((r.stdout or '').strip()[-2500:] or (r.stderr or '').strip()[-1500:])
    if r.returncode:sys.exit(1)
    # as classificações: casos das fórmulas + valores de referência dos dados de demonstração (tests/notas.mjs)
    r=subprocess.run(['node',os.path.join(R,'modern','tests','notas.mjs'),p],capture_output=True,text=True)
    print((r.stdout or '').strip()[-2500:] or (r.stderr or '').strip()[-1500:])
    if r.returncode:sys.exit(1)
    # a versão com base de dados, servida por HTTP com a política de conteúdo ativa e uma base de dados falsa (tests/bd.mjs)
    r=subprocess.run(['node',os.path.join(R,'modern','tests','bd.mjs'),d],capture_output=True,text=True)
    print((r.stdout or '').strip()[-2500:] or (r.stderr or '').strip()[-1500:])
    if r.returncode:sys.exit(1)
    # respostas dos alunos feitas para atacar (Provas, Formulários, autoavaliação): não correm, não estragam, e as normais chegam inteiras
    r=subprocess.run(['node',os.path.join(R,'modern','tests','respostas.mjs'),d],capture_output=True,text=True)
    print((r.stdout or '').strip()[-2500:] or (r.stderr or '').strip()[-1500:])
    if r.returncode:sys.exit(1)
    # percurso completo de uma prova e de um formulário: professor abre → aluno responde na página dele → professor importa
    r=subprocess.run(['node',os.path.join(R,'modern','tests','percurso.mjs'),d],capture_output=True,text=True)
    print((r.stdout or '').strip()[-2500:] or (r.stderr or '').strip()[-1500:])
    if r.returncode:sys.exit(1)
    r=subprocess.run(['node',os.path.join(R,'modern','tests','semhas.mjs'),d],capture_output=True,text=True)
    print((r.stdout or '').strip()[-2500:] or (r.stderr or '').strip()[-1500:])
    if r.returncode:sys.exit(1)
    # funções da base de dados (Spruce It, Pulso) num PostgreSQL local; se não houver PostgreSQL instalado, avisa e segue
    r=subprocess.run(['sh',os.path.join(R,'modern','tests','sql','correr.sh')],capture_output=True,text=True)
    print((r.stdout or '').strip()[-1500:] or (r.stderr or '').strip()[-800:])
    if r.returncode:sys.exit(1)


# ---------------------------------------------------------------- publicar
def peca_com(txt):
    for n in ordem():
        f=os.path.join(APP,n)
        if txt in open(f,encoding='utf-8').read():return f
    sys.exit('não encontrei a peça com '+txt)
def subir_versao(v,nov,cl):
    MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];import zoneinfo
    agora=datetime.datetime.now(zoneinfo.ZoneInfo('Atlantic/Azores'));hoje=f'{agora.day} {MES[agora.month-1]} {agora.year}'
    fv=peca_com("const VERSAO='");s=open(fv,encoding='utf-8').read()
    old=re.search(r"const VERSAO='([0-9.]+)';",s).group(1)
    s=s.replace(f"const VERSAO='{old}';",f"const VERSAO='{v}';",1)
    s=re.sub(r"const VERSAO_DATA='\d*';","const VERSAO_DATA='"+agora.strftime('%Y%m%d%H%M')+"';",s,count=1)
    open(fv,'w',encoding='utf-8').write(s)
    fn_=peca_com('<details class="nvver" open><summary><b>Versão '+old+'</b>');s=open(fn_,encoding='utf-8').read()
    s=s.replace('<details class="nvver" open><summary><b>Versão '+old+'</b><span class="mut"> · ','<details class="nvver"><summary><b>Versão '+old+'</b><span class="mut"> · ',1)
    s=re.sub(r'(<details class="nvver"><summary><b>Versão '+re.escape(old)+r'</b><span class="mut"> · [^<]*</span>)<span class="tag ok">atual</span>',r'\1',s,count=1)
    i=s.find('<details class="nvver"><summary><b>Versão '+old+'</b>')
    if i<0:sys.exit('novidades: não encontrei a versão '+old)
    s=s[:i]+'<details class="nvver" open><summary><b>Versão '+v+'</b><span class="mut"> · '+hoje+'</span><span class="tag ok">atual</span></summary><ul>'+''.join('<li>'+x+'</li>' for x in nov.split('|'))+'</ul></details>'+s[i:]
    open(fn_,'w',encoding='utf-8').write(s)
    c=os.path.join(R,'CHANGELOG.md');t=open(c,encoding='utf-8').read();k=t.find('\n## ')+1
    t=t[:k]+'## '+v+'\n'+''.join('- '+re.sub(r'<[^>]+>','',x)+'\n' for x in (cl or nov).split('|'))+'\n'+t[k:];open(c,'w',encoding='utf-8').write(t)
    return [fv,fn_,c]
def atualizar():
    """traz o que outras sessões publicaram, sem perder as alterações desta sessão"""
    sh('git','fetch','-q','origin','main')
    if sh('git','rev-parse','HEAD').stdout==sh('git','rev-parse','origin/main').stdout:return
    sujo=bool(sh('git','status','--porcelain').stdout.strip())
    if sujo:sh('git','stash','push','-u','-q')
    meus=sh('git','rev-list','origin/main..HEAD').stdout.split()
    r=sh('git','rebase','-q','origin/main',ok=False) if meus else sh('git','merge','-q','--ff-only','origin/main',ok=False)
    if r.returncode:
        sh('git','rebase','--abort',ok=False)
        if sujo:sh('git','stash','pop','-q',ok=False)
        sys.exit('ERRO: não consegui juntar com o que foi publicado entretanto:\n'+(r.stderr or r.stdout)[-600:])
    if sujo:
        r=sh('git','stash','pop','-q',ok=False)
        if r.returncode:sys.exit('CONFLITO: outra sessão mexeu nas mesmas linhas. Resolver os ficheiros em conflito (git status) e voltar a publicar.\n'+r.stdout[-500:])
def desfazer(bump):
    sh('git','reset','-q','--mixed','HEAD~1')
    sh('git','checkout','-q','HEAD','--',*[os.path.relpath(x,R) for x in bump],*[g for g in GERADOS if os.path.exists(os.path.join(R,g)) or g=='app'],ok=False)
    sh('git','clean','-fdq','app',ok=False)
def pub(a):
    msg=opt(a,'-m');cl=opt(a,'--cl');sem_esp=opt(a,'--sem-espelho',flag=True)
    if not a or not a[0].strip():sys.exit('uso: ./es pub "novidade 1|novidade 2" [-m MENSAGEM]')
    nov=a[0]
    for tentativa in range(3):
        atualizar()
        v_old=json.load(open(os.path.join(R,'versao.json')))['v'];v=f'{Decimal(v_old)+Decimal("0.001"):.3f}'
        bump=subir_versao(v,nov,cl)
        construir(os.path.join(R,'index.html'))
        m='EduSpruce '+v+': '+(re.sub(r'^EduSpruce [0-9.]+:\s*','',msg) if msg else re.sub(r'<[^>]+>','',nov.split('|')[0])[:90])
        m+='\n\nCo-Authored-By: '+os.environ.get('ES_COAUTOR','Claude Opus 5.5 <noreply@anthropic.com>')+(('\nClaude-Session: '+os.environ['CLAUDE_SESSION']) if os.environ.get('CLAUDE_SESSION') else '')
        sh('git','add','-A');sh('git','commit','-qm',m)
        r=sh('git','push','-q','origin','HEAD:main',ok=False)
        if r.returncode==0:break
        print(f'(outra sessão publicou entretanto — a refazer a {v})');desfazer(bump)
    else:sys.exit('ERRO: não consegui publicar depois de 3 tentativas:\n'+r.stderr[-500:])
    h=sh('git','rev-parse','--short','HEAD').stdout.strip();out=f'{v} publicada · {h}'
    if not sem_esp:
        e=subprocess.run(['bash',os.path.join(R,'modern','scripts','espelho.sh'),m.split('\n')[0]],capture_output=True,text=True)
        out+=' · '+((e.stdout.strip().split('\n') or ['espelho?'])[-1] if e.returncode==0 else 'ESPELHO FALHOU: '+(e.stderr or e.stdout).strip()[-300:])
    print(out)
def mapa(a):
    """vista → título → função → peças onde a função é definida (a última é a que vale)"""
    tit={};fun={};defs={}
    fs=fontes()
    for f in fs:
        t=open(f,encoding='utf-8',errors='replace').read()
        m=re.search(r'const TITLES=\{(.*?)\};',t)
        if m:tit.update(re.findall(r"(\w+):'([^']*)'",m.group(1)))
        tit.update(re.findall(r"TITLES\.(\w+)='([^']*)'",t))
        m=re.search(r'go\._f=go\._f\|\|\{(.*?)\}',t)
        if m:
            for k,v in re.findall(r'(\w+):(v\w+)',m.group(1)):fun.setdefault(k,v)
        for k,v in re.findall(r'go\._f\.(\w+)\s*=\s*(v\w+)',t):fun.setdefault(k,v)
    alvo=set(fun.values())
    for f in fs:
        t=open(f,encoding='utf-8',errors='replace').read()
        for n in re.findall(r'(?:(?<![\w$.])function\s+(v\w+)\s*\(|(?<![\w$.])(v\w+)\s*=\s*(?:async\s*)?function\b)',t):
            n=n[0] or n[1]
            if n in alvo:defs.setdefault(n,[]).append(re.sub(r'\.(js|html)$','',rel(f).replace('app/','')))
    for k in sorted(set(tit)|set(fun)):
        v=fun.get(k,'?');d=defs.get(v,[])
        print(f"{k} · {tit.get(k,'')} → {v}: "+(', '.join(dict.fromkeys(d)) or '—'))
def estado(a):
    sh('git','fetch','-q','origin','main',ok=False)
    v=json.load(open(os.path.join(R,'versao.json')))['v'];st=sh('git','status','--porcelain').stdout.strip().split('\n')
    st=[x for x in st if x];novos=sh('git','log','--format=%h %ci %s','HEAD..origin/main').stdout.strip()
    print('versão:',v,'· alterações por publicar:',len(st))
    for x in st[:15]:print('  '+x)
    print('publicado por outras sessões desde o início desta:',('\n'+novos) if novos else 'nada')
    print('últimas publicações:\n'+sh('git','log','-3','--format=  %h %ci %s','origin/main').stdout.rstrip())

if __name__=='__main__':
    a=sys.argv[1:]
    cmd={'onde':onde,'ver':ver,'fn':fn,'mapa':mapa,'troca':troca,'novo':novo,'testa':testa,'pub':pub,'estado':estado,'junta':lambda x:print(junta(x))}
    if not a or a[0] not in cmd:sys.exit(__doc__)
    cmd[a[0]](a[1:])
