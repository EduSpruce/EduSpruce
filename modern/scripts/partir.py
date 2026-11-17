#!/usr/bin/env python3
"""Peças do código-fonte da app (modern/src/app).

A app publicada nasce de um só index.html; o código vive em peças pequenas, com nome, pela ordem de ordem.txt.
Juntas, as peças dão esse ficheiro byte a byte (confirmado por SHA-256). As peças em dados/ são dados embutidos
(imagens, bibliotecas, novidades, versão): não é preciso lê-las.

  partir.py juntar      PASTA SAIDA.html      junta as peças pela ordem de PASTA/ordem.txt
  partir.py partir      FONTE.html PASTA      reparte um index.html editado pelas peças que já existem
                                              (compatibilidade com sessões antigas que editavam o ficheiro junto)
  partir.py conferir    FONTE.html PASTA      confirma que as peças juntas são iguais a FONTE
  partir.py reorganizar FONTE.html PASTA      refaz a divisão do zero (só quando se quer mudar a divisão)
"""
import sys,os,re,hashlib,unicodedata,difflib

def ler_ordem(pasta):
    return [n for n in open(os.path.join(pasta,'ordem.txt'),encoding='utf-8').read().split('\n') if n.strip()]
def junto(pasta):
    return b''.join(open(os.path.join(pasta,n),'rb').read() for n in ler_ordem(pasta))
def sha(b):return hashlib.sha256(b).hexdigest()
def conferir(fonte,pasta):
    a=sha(open(fonte,'rb').read());b=sha(junto(pasta))
    if a!=b:sys.exit('ERRO: as peças juntas NÃO são iguais ao original ('+a[:12]+' ≠ '+b[:12]+')')
    return a

# ---------------------------------------------------------------- reorganizar (divisão do zero)
DADOS=2000            # linhas maiores do que isto (em JS/HTML) são dados embutidos → dados/
MIN_MAIOR,MIN_MENOR=12,70   # cortar num cabeçalho /* ===== */ se a peça já tem ≥12 linhas; num /* ----- */ se tem ≥70
PARAGEM={'de','e','a','o','do','da','dos','das','em','no','na','nos','nas','para','com','por','ao','aos','os','as','um','uma','que','se','sem','sao','mais','ou','pelo','pela'}
NOMES_DADOS={b'EF_LOGOS':'logotipos',b'NOVOS':'logotipos-novos',b'EFEM_MUNDO':'efemerides',b'PROF_SINT':'sinteses-profij',
  b'gifs-json':'gifs-ajuda',b'pdfgz-lib':'pdfjs',b'pdfgz-wk':'pdfjs-worker',b'mragz':'ficha-mra',b'hashwasm':'hash-wasm',
  b'apple-touch-icon':'icone-apple',b'rel="icon"':'icone',b'rel="manifest"':'manifesto'}
def slug(t):
    t=unicodedata.normalize('NFD',t);t=''.join(c for c in t if unicodedata.category(c)!='Mn').lower()
    t=re.sub(r'\bv?\d+\.\d+(\.\d+)?[a-z]?\b','',t)          # números de versão
    p=[w for w in re.sub(r'[^a-z0-9]+',' ',t).split() if w not in PARAGEM and not w.isdigit()]
    while p and re.fullmatch(r'[a-z]\d?',p[0]):p.pop(0)        # «(B)», «C2» — letras de lote, sem significado
    return '-'.join(p[:4])[:38].strip('-')
def titulo(L,k):
    m=re.match(rb'\s*/\*\s*[=-]{3,}\s*(.*?)\s*[=-]*\s*(\*/)?\s*$',L[k])
    t=(m.group(1) if m else b'').decode('utf-8','ignore')
    if not t.strip() and k+1<len(L):t=L[k+1].decode('utf-8','ignore').strip(' */\n=-')
    t=re.sub(r'^\s*\d+\.\s+','',t)                            # «5. INÍCIO …»
    return slug(t)
def nome_codigo(L,i,f):
    for l in L[i:min(f,i+40)]:
        m=re.match(rb'\s*(?:async )?function ([A-Za-z_$][\w$]*)',l) or re.match(rb'\s*(?:const|let) ([A-Za-z_$][\w$]*)\s*=',l) or re.match(rb'\s*[.#]([a-zA-Z][\w-]*)',l)
        if m:return slug(re.sub(rb'([a-z])([A-Z])',rb'\1 \2',m.group(1)).decode().replace('_',' ').replace('$',' '))
    return ''
def nome_dados(l):
    for k,v in NOMES_DADOS.items():
        if k in l[:400] or (k==b'hashwasm' and k in l):return v
    m=re.match(rb'\s*\{?\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)',l)
    return slug(m.group(1).decode().replace('_',' ')) if m else 'dados'
def e_cabecalho(l):
    s=l.lstrip()
    return 2 if s.startswith(b'/* =====') else 1 if s.startswith(b'/* -----') else 0
def cortar(L,a,b,tipo,P,nome0=''):
    """divide L[a:b] em peças: cabeçalhos de secção (css/js) e linhas de dados (js/html) → P[(nome,ext,ini,fim,dados)]"""
    ext={'css':'.css','js':'.js','html':'.html'}[tipo];ini=a;nome=nome0;k=a
    def fecha(f,seg=None):
        """fecha a peça em f; a seguinte fica com o nome seg (por omissão, continua a secção atual)"""
        nonlocal ini,nome
        if f>ini:
            nome=nome or nome_codigo(L,ini,f) or tipo;P.append((nome,ext,ini,f,False))
        ini=f;nome=nome if seg is None else seg
    while k<b:
        l=L[k]
        if tipo=='js' and l.startswith(b'function novidades(){'):
            fecha(k);c=0;f=k
            while f<b:
                c+=L[f].count(b'`')
                if c%2==0:break
                f+=1
            P.append(('novidades',ext,k,f+1,True));ini=k=f+1;continue
        if tipo=='js' and l.startswith(b"const VERSAO='"):
            fecha(k);P.append(('versao',ext,k,k+1,True));ini=k=k+1;continue
        if tipo=='js' and l==b'})();\n' and all(not x.strip() or x==b'})();\n' for x in L[k:b]):
            fecha(k);P.append(('fim-do-programa',ext,k,b,False));ini=k=b;break
        if tipo!='css' and len(l)>DADOS:
            fecha(k);P.append((nome_dados(l),ext,k,k+1,True));ini=k=k+1;continue
        h=e_cabecalho(l) if tipo!='html' else 0
        if h:
            n=k-ini
            if (h==2 and n>=MIN_MAIOR) or (h==1 and n>=MIN_MENOR):fecha(k,titulo(L,k))
            elif not nome or n<=2:nome=titulo(L,k) or nome
        k+=1
    fecha(b)
def reorganizar(fonte,pasta):
    dados=open(fonte,'rb').read();L=dados.splitlines(keepends=True);N=len(L);P=[];pos=0
    acha=lambda pred,de=0:next(i for i in range(de,N) if pred(L[i]))
    def html(ate,nome=''):
        nonlocal pos
        if ate>pos:
            n0=len(P);cortar(L,pos,ate,'html',P)
            if nome:
                c=0
                for j in range(n0,len(P)):
                    if not P[j][4]:c+=1;P[j]=(nome if c==1 else nome+'-'+str(c),)+P[j][1:]
            pos=ate
    s1=acha(lambda l:l.startswith(b'<style>'));e1=acha(lambda l:l.startswith(b'</style>'),s1)
    html(s1+1,'cabeca');cortar(L,s1+1,e1,'css',P);pos=e1
    while True:                                                  # restantes folhas de estilo
        try:s=acha(lambda l:l.startswith(b'<style'),pos+1)
        except StopIteration:break
        if s>acha(lambda l:l.startswith(b'<script'),pos):break
        e=acha(lambda l:l.startswith(b'</style>'),s);m=re.search(rb'id="([^"]+)"',L[s])
        html(s+1,'entre-estilos');cortar(L,s+1,e,'css',P,'estilos-'+(m.group(1).decode() if m else 'extra'));pos=e
    princ=max((i for i in range(N) if L[i].rstrip()==b'<script>'),key=lambda i:acha(lambda l:l.startswith(b'</script>'),i)-i)
    fim=acha(lambda l:l.startswith(b'</script>'),princ)
    html(princ+1,'corpo');cortar(L,princ+1,fim,'js',P);pos=fim;html(N,'fecho')
    # nomes únicos, numerados pela ordem
    os.makedirs(os.path.join(pasta,'dados'),exist_ok=True)
    antigos=ler_ordem(pasta) if os.path.exists(os.path.join(pasta,'ordem.txt')) else []
    for n in antigos:
        f=os.path.join(pasta,n)
        if os.path.exists(f):os.remove(f)
    for f in os.listdir(os.path.join(pasta,'dados')):os.remove(os.path.join(pasta,'dados',f))
    vistos={};ordem=[]
    for i,(n,ext,a,b,d) in enumerate(P):
        n=n or 'parte';vistos[n]=vistos.get(n,0)+1
        if vistos[n]>1:n=f'{n}-{vistos[n]}'
        rel=('dados/' if d else '')+f'{i+1:03d}-{n}{ext}'
        open(os.path.join(pasta,rel),'wb').write(b''.join(L[a:b]));ordem.append(rel)
    open(os.path.join(pasta,'ordem.txt'),'w',encoding='utf-8').write('\n'.join(ordem)+'\n')
    conferir(fonte,pasta);return len(ordem)

# ---------------------------------------------------------------- partir (repartir um ficheiro junto editado)
def repor(fonte,pasta):
    """Distribui um index.html editado pelas peças existentes: cada linha nova fica na peça da linha que substituiu,
    ou na peça da linha anterior quando é acrescentada. Peças que ficam vazias saem de ordem.txt."""
    ordem=ler_ordem(pasta);velho=[];dono=[]
    for j,n in enumerate(ordem):
        ls=open(os.path.join(pasta,n),'rb').read().splitlines(keepends=True);velho+=ls;dono+=[j]*len(ls)
    novo=open(fonte,'rb').read().splitlines(keepends=True)
    if velho==novo:return 0
    saida=[[] for _ in ordem]
    for tag,i1,i2,j1,j2 in difflib.SequenceMatcher(None,velho,novo,autojunk=False).get_opcodes():
        if tag=='equal':
            for d in range(i2-i1):saida[dono[i1+d]].append(novo[j1+d])
        else:
            alvo=dono[i1] if i1<i2 else (dono[i1-1] if i1>0 else 0)
            saida[alvo]+=novo[j1:j2]
    mudou=0;fica=[]
    for j,n in enumerate(ordem):
        c=b''.join(saida[j]);f=os.path.join(pasta,n)
        if not c:
            os.remove(f);mudou+=1;print('peça vazia retirada:',n);continue
        if open(f,'rb').read()!=c:open(f,'wb').write(c);mudou+=1
        fica.append(n)
    open(os.path.join(pasta,'ordem.txt'),'w',encoding='utf-8').write('\n'.join(fica)+'\n')
    conferir(fonte,pasta);return mudou

if __name__=='__main__':
    op=sys.argv[1] if len(sys.argv)>1 else ''
    if op=='juntar':
        open(sys.argv[3],'wb').write(junto(sys.argv[2]));print('junto:',sha(open(sys.argv[3],'rb').read())[:16])
    elif op=='partir':
        if os.path.exists(os.path.join(sys.argv[3],'ordem.txt')):n=repor(sys.argv[2],sys.argv[3]);print(n,'peças alteradas · iguais ao original')
        else:n=reorganizar(sys.argv[2],sys.argv[3]);print(n,'peças · iguais ao original')
    elif op=='reorganizar':n=reorganizar(sys.argv[2],sys.argv[3]);print(n,'peças · iguais ao original:',conferir(sys.argv[2],sys.argv[3])[:16])
    elif op=='conferir':print('igual:',conferir(sys.argv[2],sys.argv[3])[:16])
    else:sys.exit(__doc__)
