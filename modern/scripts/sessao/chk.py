import re,subprocess
s=open('/home/claude/edugest/index.html').read()
big=max(re.findall(r'<script>(.*?)</script>',s,re.S),key=len);f='/tmp/es/chk.js';open(f,'w').write(big)
print(subprocess.run(['node','--check',f],capture_output=True,text=True).stderr[:600] or 'ok')
