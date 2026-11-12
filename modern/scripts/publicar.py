# uso: python3 pub.py VERSAO "nov1|nov2|..." "changelog linha1|linha2" "texto ESPECIFICACAO" "mensagem do commit"
import datetime
MESES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];_d=datetime.date.today();HOJE_PT=f'{_d.day} {MESES[_d.month-1]} {_d.year}'
import sys,subprocess,re
V,NOV,CL,ESP,MSG=sys.argv[1:6]
SP='/tmp/claude-0/-home-claude/8c3d7033-b32e-57fd-bf5a-8daed9fc7342/scratchpad'
p='/home/claude/edugest/index.html'
# código-fonte em módulos (modern/src/app): se os módulos forem mais recentes do que o index.html, juntam-se primeiro
import os,glob
APP='/home/claude/eduspruce/modern/src/app';PARTIR='/home/claude/eduspruce/modern/scripts/partir.py'
_m=[os.path.getmtime(f) for f in glob.glob(APP+'/*') if not f.endswith('ordem.txt')]
if _m and max(_m)>os.path.getmtime(p)+1:subprocess.run(['python3',PARTIR,'juntar',APP,p],check=True)
s=open(p).read()
old=re.search(r"const VERSAO='([0-9.]+)';",s).group(1)
s=s.replace(f"const VERSAO='{old}';",f"const VERSAO='{V}';",1)
s=s.replace('<details class="nvver" open><summary><b>Versão '+old+'</b><span class="mut"> · ','<details class="nvver"><summary><b>Versão '+old+'</b><span class="mut"> · ',1)
s=re.sub(r'(<details class="nvver"><summary><b>Versão '+re.escape(old)+r'</b><span class="mut"> · [^<]*</span>)<span class="tag ok">atual</span>',r'\1',s,count=1)
i=s.find('<details class="nvver"><summary><b>Versão '+old+'</b>')
assert i>0
lis=''.join('<li>'+x+'</li>' for x in NOV.split('|'))
s=s[:i]+'<details class="nvver" open><summary><b>Versão '+V+'</b><span class="mut">'+' · '+HOJE_PT+'</span><span class="tag ok">atual</span></summary><ul>'+lis+'</ul></details>'+s[i:]
open(p,'w').write(s)
c='/home/claude/eduspruce/CHANGELOG.md';t=open(c).read();k=t.find('\n## ')+1;t=t[:k]+'## '+V+'\n'+''.join('- '+x+'\n' for x in CL.split('|'))+'\n'+t[k:];open(c,'w').write(t)
open('/home/claude/edugest/ESPECIFICACAO.md','a').write('\n\n## v'+V+'\n'+ESP+'\n')
i=s.find('pdfgz-wk');i=s.find('<script>',i)+8;j=s.find('</script>',i);open(SP+'/main.js','w').write(s[i:j])
subprocess.run(['node','--check',SP+'/main.js'],check=True)
subprocess.run(['python3',PARTIR,'partir',p,APP],check=True)  # módulos = cópia exata (byte a byte) do index.html
for d in ['/home/claude/edugest/web/index.html','/home/claude/edugest/EduSpruce.html',SP+'/eduspruce-app/app/index.html',SP+'/index-plano.html']:
    open(d,'w').write(s)
# eduspruce.pt = versão com base de dados (vX.XXXDB); a versão anterior fica congelada em /old
subprocess.run(['node','/home/claude/eduspruce/modern/scripts/db.mjs',SP+'/index-plano.html','/home/claude/eduspruce/index.html'],check=True)
for f in ['ESPECIFICACAO.md','FORMATO_DADOS.md']:
    open('/home/claude/eduspruce/docs/'+f,'w').write(open('/home/claude/edugest/'+f).read())
msg=MSG+'\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015dy1762oecfNm11xnNLKDJ'
sh=lambda *a:subprocess.run(a,cwd='/home/claude/eduspruce',check=True,capture_output=True,text=True)
sh('git','add','-A');sh('git','commit','-qm',msg);sh('git','fetch','-q');sh('git','rebase','-q','origin/main');sh('git','push','-q','origin','HEAD:main')
print(subprocess.run(['git','log','--oneline','-1'],cwd='/home/claude/eduspruce',capture_output=True,text=True).stdout)
# eduspruce.app (app/ com a mesma versão)
import shutil,os
if False and os.path.isdir('/home/claude/eduspruce-app/.git'):  # eduspruce.app congelado até à versão final
    open('/home/claude/eduspruce-app/app/index.html','w').write(s)
    sa=lambda *a:subprocess.run(a,cwd='/home/claude/eduspruce-app',capture_output=True,text=True)
    sa('git','add','-A');r=sa('git','commit','-qm','app '+V+'\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015dy1762oecfNm11xnNLKDJ')
    sa('git','fetch','-q');sa('git','rebase','-q','origin/main');print('app repo:',sa('git','push','-q','origin','HEAD:main').returncode)
