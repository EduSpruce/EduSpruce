// Gera eduspruce.app/changelog/ a partir das Novidades da app (modern/src/app/dados/095-novidades.js). Uso: node changelog-app.mjs PASTA_DO_SITE
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {join,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
const R=join(dirname(fileURLToPath(import.meta.url)),'..','src','app','dados','095-novidades.js');const s=readFileSync(R,'utf8');
const i=s.indexOf('`')+1,j=s.indexOf('`',i);const html=s.slice(i,j).replace(/^<div class="ed ajt nvv">/,'').replace(/<\/div>\s*$/,'');
const vs=[...html.matchAll(/<details class="nvver"[^>]*><summary><b>Versão ([^<]+)<\/b><span class="mut"> · ([^<]*)<\/span>[\s\S]*?<\/summary>(<ul>[\s\S]*?<\/ul>)?[\s\S]*?<\/details>/g)].map(m=>({v:m[1],d:m[2],ul:m[3]||''}));
if(vs.length<5)throw new Error('poucas versões lidas: '+vs.length);
const anos={};for(const x of vs){const k=x.v.split('.')[0]+'.'+(x.v.split('.')[1]||'').slice(0,1);(anos[k]=anos[k]||[]).push(x)}
const out=`<!DOCTYPE html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Changelog · EduSpruce</title><link rel="canonical" href="https://eduspruce.app/changelog/"><meta property="og:title" content="Changelog · EduSpruce"><meta property="og:url" content="https://eduspruce.app/changelog/"><meta property="og:type" content="website"><meta property="og:locale" content="pt_PT"><meta property="og:site_name" content="EduSpruce"><meta property="og:image" content="https://eduspruce.app/img/og/eduspruce.jpg"><meta name="twitter:card" content="summary_large_image"><meta name="description" content="Todas as alterações à EduSpruce desde a primeira versão."><meta name="theme-color" content="#e6f3fa"><link rel="icon" href="../favicon.png">
<style>
@font-face{font-family:Bricolage;src:url(../fonts/bricolage.woff2) format("woff2");font-weight:200 800;font-display:swap}
@font-face{font-family:Figtree;src:url(../fonts/figtree.woff2) format("woff2");font-weight:300 900;font-display:swap}
:root{--ink:#0c2f42;--ink2:#3d5a69;--sge:#1b93c6;--sge2:#11698f;--sun:#f39200;--sky:#e6f3fa;--line:#0c2f4222;--disp:Bricolage,"Avenir Next","Segoe UI",system-ui,sans-serif;--body:Figtree,"Segoe UI",system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--sky);color:var(--ink);font:400 16px/1.55 var(--body);-webkit-font-smoothing:antialiased}
.w{max-width:960px;margin:0 auto;padding:0 clamp(18px,4vw,40px)}
.bar{position:sticky;top:0;z-index:5;background:#e6f3fad1;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.bar .w{display:flex;align-items:center;gap:14px;height:62px;max-width:1240px}.logo{display:flex;align-items:center;gap:10px;font:800 20px var(--disp);letter-spacing:-.02em;color:var(--ink);text-decoration:none}
.logo i{width:34px;height:34px;border-radius:9px;background:var(--sge);color:#fff;display:grid;place-items:center;font:800 18px var(--disp);font-style:normal;position:relative}.logo i::after{content:"";position:absolute;right:7px;bottom:8px;width:5px;height:5px;border-radius:50%;background:var(--sun)}
.bt{margin-left:auto;font:600 14.5px var(--body);text-decoration:none;color:#fff;background:var(--ink);padding:9px 16px;border-radius:10px;box-shadow:0 5px 0 -1px var(--sun)}
h1{font:800 clamp(38px,7vw,64px)/1 var(--disp);letter-spacing:-.035em;margin:48px 0 10px}.lead{color:var(--ink2);font-size:18px;margin:0 0 22px}
.f{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:26px}.f input{flex:1;min-width:220px;font:inherit;padding:11px 14px;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--ink)}
.v{background:#fff;border-radius:16px;box-shadow:0 30px 60px -34px rgba(12,47,66,.35),0 0 0 1px var(--line);padding:16px 20px;margin-bottom:12px}
.v h2{font:800 19px var(--disp);letter-spacing:-.02em;margin:0 0 6px;display:flex;gap:10px;align-items:baseline}.v h2 small{font:400 13.5px var(--body);color:var(--ink2)}.v h2 em{font:700 11px var(--body);font-style:normal;background:var(--sun);color:var(--ink);padding:2px 8px;border-radius:99px}
.v ul{margin:0;padding-left:20px;font-size:15px}.v li{margin:4px 0}.v li::marker{color:var(--sge)}
footer{margin-top:50px;background:#0c2f42;color:#9fb9c6;font-size:14.5px;padding:26px 0 34px}footer .w{display:flex;gap:10px 22px;flex-wrap:wrap;justify-content:space-between;max-width:1240px}footer a{color:#e9f3f8}
</style></head><body>
<header class="bar"><div class="w"><a class="logo" href="../"><i>S</i>EduSpruce</a><a class="bt" href="https://eduspruce.pt/">Abrir a app</a></div></header>
<main class="w"><h1>Changelog</h1><p class="lead">Todas as alterações à EduSpruce desde a primeira versão: ${vs.length} versões, da ${vs[vs.length-1].v} à ${vs[0].v}.</p>
<div class="f"><input type="search" id="q" placeholder="Procurar nas alterações…" aria-label="Procurar nas alterações"></div>
<div id="l">${vs.map((x,k)=>`<section class="v"><h2>Versão ${x.v}<small>${x.d}</small>${k?'':'<em>atual</em>'}</h2>${x.ul}</section>`).join('\n')}</div></main>
<footer><div class="w"><span>© 2026 EduSpruce · Orgulhosamente feito nos Açores</span><span><a href="../">Início</a> &nbsp; <a href="../privacidade.html">Privacidade</a> &nbsp; <a href="../termos.html">Termos</a></span></div></footer>
<script>document.getElementById('q').oninput=e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.v').forEach(v=>{let a=false;v.querySelectorAll('li').forEach(li=>{const ok=!q||li.textContent.toLowerCase().includes(q);li.style.display=ok?'':'none';if(ok)a=true});v.style.display=!q||a||v.querySelector('h2').textContent.toLowerCase().includes(q)?'':'none'})}</script>
</body></html>`;
mkdirSync(join(process.argv[2],'changelog'),{recursive:true});writeFileSync(join(process.argv[2],'changelog','index.html'),out);console.log('changelog: '+vs.length+' versões');
