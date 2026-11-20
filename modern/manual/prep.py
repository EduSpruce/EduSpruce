import os,sys
from PIL import Image,ImageStat
import numpy as np
src=['cap4','cap','cap1b','cap2','cap3','capN']  # later overrides earlier
KEEP={'menu','inicio-simples','hub','menu-nomes'}
os.makedirs('img',exist_ok=True)
files={};DR=[]
for d in src:
  for f in os.listdir(d):
    if f.endswith('.jpg'): files[f[:-4]]=os.path.join(d,f)
for n,p in files.items():
  im=Image.open(p).convert('RGB');W,H=im.size
  a=np.asarray(im).astype(np.int16)
  if W>2000 and n not in KEEP:
    med=np.median(a[300:H-100,:W//3].sum(axis=2),axis=0)
    if med[20]<250:
      x=int(np.argmax(med>450))
      if 300<x<W//3: im=im.crop((x,0,W,H));W-=x
  # cortar fundo vazio em baixo
  if W>1500:
    g=np.asarray(im.convert('L')).astype(np.int16)
    d=np.abs(np.diff(g[:,:W-640],axis=1)).mean(axis=1)  # actividade por linha
    y=H-1
    while y>H*0.45 and d[y]<1.2: y-=1
    y=min(H,y+40)
    if y<H-120: im=im.crop((0,0,W,y))
  w=1400 if W>1500 else 700
  if n=='menu-nomes': w=360
  if im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
  if im.width==1400:
    g=np.asarray(im.convert('L')).astype(int);Hh,Ww=g.shape;best=(0,0)
    for x in range(int(Ww*.33),int(Ww*.7)):
      sc=np.median(np.abs(g[60:,x+2]-g[60:,x-2]));best=max(best,(sc,x))
    if best[0]>65 and g[:,:best[1]-5].mean()+8<g[:,best[1]+5:].mean():
      im=im.crop((best[1]+2,0,Ww,Hh));DR.append(n)
  im.save('img/%s.jpg'%n,quality=70,optimize=True)
print(len(files));print('gavetas',DR)
