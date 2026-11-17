import pypdf,json,re
r=pypdf.PdfReader('corpo.pdf');res={}
def walk(L):
  for o in L:
    if isinstance(o,list): walk(o);continue
    m=re.match(r'^(\d+)\s*(.*)',o.title)
    if m and m.group(1) not in res: res[m.group(1)]=r.get_destination_page_number(o)+1
walk(r.outline);json.dump(res,open('paginas.json','w'));print(len(res),list(res.items())[:5])
