#!/usr/bin/env python3
"""Divide o código-fonte da app (um só index.html) em módulos — e junta-os de volta SEM mudar um único byte.

  partir.py partir  FONTE.html  PASTA     corta o ficheiro em módulos (css/js/html) dentro de PASTA
  partir.py juntar  PASTA  SAIDA.html     volta a juntar os módulos, pela ordem de PASTA/ordem.txt
  partir.py conferir FONTE.html PASTA     confirma que os módulos juntos são byte a byte iguais a FONTE

Só se corta em fronteiras de linha: juntar os módulos devolve exatamente o ficheiro original (confirmado por SHA-256).
A app publicada continua a ser um único ficheiro; isto só organiza o código para se ler e rever por partes."""
import sys,os,re,hashlib,unicodedata
MIN_JS,MIN_CSS=260,420
def slug(t):
    t=unicodedata.normalize('NFD',t);t=''.join(c for c in t if unicodedata.category(c)!='Mn').lower()
    t=re.sub(r'v?0\.\d{3}\b','',t);t=re.sub(r'[^a-z0-9]+','-',t).strip('-');return '-'.join(t.split('-')[:6])[:48] or 'parte'
def titulo(l):
    m=re.match(rb'\s*/\*\s*=+\s*(.*?)\s*=*\s*\*/',l) or re.match(rb'\s*/\*\s*=+\s*(.*)',l);return m.group(1).decode('utf-8','ignore') if m else ''
def cortar(linhas,a,b,minimo,ext,pref):
    """linhas[a:b] → [(nome,ini,fim)] cortando nos cabeçalhos /* ===== … */ quando o bloco já tem tamanho"""
    P=[];ini=a;nome=pref
    for k in range(a,b):
        if linhas[k].lstrip().startswith(b'/* =====') and k-ini>=minimo:
            P.append((nome,ini,k));ini=k;nome=slug(titulo(linhas[k]))
    P.append((nome,ini,b))
    def melhor(n,i,f):
        if n and n!='parte':return n
        # sem título no cabeçalho: usa o nome da primeira função/regra do bloco
        for l in linhas[i:min(f,i+60)]:
            m=re.match(rb'(?:async )?function ([A-Za-z_$][\w$]*)',l) or re.match(rb'(?:const|let) ([A-Za-z_$][\w$]*)=',l) or re.match(rb'[.#]([a-zA-Z][\w-]*)',l)
            if m:return 'bloco-'+slug(re.sub(rb'([a-z])([A-Z])',rb'\1-\2',m.group(1)).decode())
        return pref
    return [(melhor(n,i,f)+ext,i,f) for n,i,f in P]
def partir(fonte,pasta):
    dados=open(fonte,'rb').read();L=dados.splitlines(keepends=True);N=len(L);P=[];pos=0
    def ate(k,nome):
        nonlocal pos
        if k>pos:P.append((nome,pos,k));pos=k
    acha=lambda pred,de=0:next(i for i in range(de,N) if pred(L[i]))
    # 1) cabeça até ao <style> principal
    s1=acha(lambda l:l.startswith(b'<style>'));e1=acha(lambda l:l.startswith(b'</style>'),s1)
    ate(s1+1,'cabeca.html')
    for n,i,f in cortar(L,s1+1,e1,MIN_CSS,'.css','estilos'):P.append((n,i,f))
    pos=e1
    # 2) restantes folhas de estilo, uma a uma
    while True:
        try:s=acha(lambda l:l.startswith(b'<style'),pos+1)
        except StopIteration:break
        sc=acha(lambda l:l.startswith(b'<script'),pos)
        if s>sc:break
        e=acha(lambda l:l.startswith(b'</style>'),s);m=re.search(rb'id="([^"]+)"',L[s]);nm=slug((m.group(1).decode() if m else 'estilos'))
        ate(s+1,'entre-estilos.html');P.append(('estilos-'+nm+'.css',s+1,e));pos=e
    # 3) scripts pequenos e bibliotecas embutidas (blocos de dados) até ao <script> principal
    princ=max((i for i in range(N) if L[i].rstrip()==b'<script>'),key=lambda i:acha(lambda l:l.startswith(b'</script>'),i)-i)
    fim=acha(lambda l:l.startswith(b'</script>'),princ)
    for i in range(pos,princ):
        m=re.match(rb'<script type="application/[a-z-]+" id="([^"]+)"',L[i])
        if m and len(L[i])>20000:ate(i,'corpo.html');P.append(('dados-'+slug(m.group(1).decode())+'.html',i,i+1));pos=i+1
    ate(princ+1,'corpo-fim.html')
    # 4) o programa, por secções
    for n,i,f in cortar(L,princ+1,fim,MIN_JS,'.js','nucleo'):P.append((n,i,f))
    pos=fim;ate(N,'fecho.html')
    # nomes únicos e escrita
    os.makedirs(pasta,exist_ok=True)
    for f in os.listdir(pasta):
        if re.search(r'\.(js|css|html|txt)$',f):os.remove(os.path.join(pasta,f))
    vistos={};ordem=[]
    for n,i,f in P:
        nome=f'{len(ordem)+1:02d}-{n}'
        open(os.path.join(pasta,nome),'wb').write(b''.join(L[i:f]));ordem.append(nome)
    open(os.path.join(pasta,'ordem.txt'),'w').write('\n'.join(ordem)+'\n')
    conferir(fonte,pasta);return len(ordem)
def junto(pasta):
    return b''.join(open(os.path.join(pasta,n),'rb').read() for n in open(os.path.join(pasta,'ordem.txt')).read().split('\n') if n)
def conferir(fonte,pasta):
    a=hashlib.sha256(open(fonte,'rb').read()).hexdigest();b=hashlib.sha256(junto(pasta)).hexdigest()
    if a!=b:sys.exit('ERRO: os módulos juntos NÃO são iguais ao original ('+a[:12]+' ≠ '+b[:12]+')')
    return a
if __name__=='__main__':
    op=sys.argv[1]
    if op=='partir':n=partir(sys.argv[2],sys.argv[3]);print(n,'módulos · iguais ao original:',conferir(sys.argv[2],sys.argv[3])[:16])
    elif op=='juntar':open(sys.argv[3],'wb').write(junto(sys.argv[2]));print('junto:',hashlib.sha256(open(sys.argv[3],'rb').read()).hexdigest()[:16])
    elif op=='conferir':print('igual:',conferir(sys.argv[2],sys.argv[3])[:16])
