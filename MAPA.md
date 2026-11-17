# EduSpruce · mapa rápido para uma conversa nova do Claude

Responder sempre em português, curto. Versões 0.900–0.999 (nunca 1.0); a atual está em `versao.json`.

## Regras do utilizador
- Publicar diretamente, sem perguntar.
- Sem dados no aparelho: tudo na base de dados Supabase, sem o utilizador ver sincronização.
- Nunca escrever no SGE/DB da escola; nunca dados de alunos no GitHub; o e-mail nunca passa pela EduSpruce.
- Nunca nomes reais em código, ajuda ou exemplos. Nunca a chave secreta do Supabase (só a publicável).
- Não mexer no eduspruce.app nem no PDF até à versão final.
- Arena: nunca conta para a nota. Pulso: sempre formativo, só conta se o professor escolher um domínio.
- Arena: personagens e nomes de modos sempre originais (inspirados no Blooket, nunca copiados).

## Onde está cada coisa
- Fonte da app: `modern/src/app/` (módulos = index.html byte a byte; `modern/scripts/partir.py juntar|partir|conferir`). Na sessão: `/home/claude/edugest/index.html`.
- Só na versão com base de dados: `modern/src/moderno/` (basedados, autoav, digit, arena-comum + arena, pulso), juntados por `modern/scripts/db.mjs`, que também aplica `modern/src/moderno/patches.json` (agora versionado no Git).
- Páginas dos alunos: `aluno.html`, `modern/src/arena/arena.html` → `arena.html`, `modern/src/pulso/pulso.html` → `pulso.html`.
- SQL para correr no Supabase: `modern/supabase/migrations/` (último: `0016_avisos_push.sql`).
- Espelho para a rede da escola: repositório `EduSpruce/eduspruce.github.io`.

## Página leve (1.041) — ficheiros separados na versão publicada
- O `db.mjs` (função `separar`) tira do `index.html` publicado: código principal → `app/app.<impressão>.js`, estilos grandes → `app/estilosN.<impressão>.css`, dados (GIF da Ajuda, pdf.js, MRA) → `app/<id>.<impressão>.txt` (carregados só quando precisos, via `data-src`), manifesto → `manifest.webmanifest`. O `index.html` passa de 8,2 MB para ~75 KB.
- O código-fonte não muda (continua em `modern/src/app`); `arquivo.html` e a exportação offline continuam num ficheiro só.
- `sw.js`: ficheiros `app/*.<12 hex>.*` servidos da cache (nunca mudam de conteúdo); fica a versão atual e a anterior. `espelho.sh` copia `app/`.
- Cabeçalho (1.040): na passagem para «Mais», os botões `.pri` são os últimos a sair. Tema SGE: regra de cantos retos no fim de `12-estilos-css965.css`.

## Convenções
- Desempenho (1.026): NUNCA `:has()` com `[style…]` lá dentro (nem `:not(:has(...[style]))`) — obriga a recalcular o estilo da página inteira a cada medição do cabeçalho (deixava a app lenta nos PCs antigos). Modo leve: `html.leve` (Definições › Aparência › Desempenho, `localStorage es.leve`).
- Privacidade no modo de apresentação (1.026): `apresPrep`/`apresAplicar` + observador do documento filtram tudo o que aparece (texto, atributos, valores, listas, canvas). Memória por turma em `S.cfg.apresT[turmaId]` (`auto` = liga ao abrir a turma).
- Privacidade de cada aluno (1.043): `S.cfg.apres.privAl={id:{n,f}}` (Notas/Foto; «Tudo» = `ocultos`). `apPvPrep`/`apPvAplicar` marcam a linha/cartão do aluno (`apres-pn`, `apres-pf`; células a manter `apnm`, folhas com nota `apgr`) e a ficha (`#dw-b.apres-pnd/pfd`). Botões na janela por `apPvUI` (envolve `apresDlg`). Nunca chamar `apresCfg()` com a janela aberta (substitui `S.cfg.apres`).
- Planta da Sala (1.048): `vPlanta` reescrita (módulo 29); `pl.tipo={"r-c":'v'|'p'|'porta'|'jan'}` (omissão = lugar; `pl.vazios` mantido para compatibilidade), `pl.fix[aid]` lugares fixos, `plModelo`/`plDistribuir`/`plLugares` (frente = secretária). Atenção: `html body .oc` é do O Meu Calendário — nunca usar a classe `.oc` sem seletor forte.
- Perfis (1.044–1.046): `perfilEvol` (ao lado do radar, injetado por `perfilRadar`), `perfilImprimir` (impressão completa, intercepta `#pa-pr`).
- Menu lateral, turma + disciplina (1.042): espaço entre linhas por regra `#side .tnode .lbl` no fim de `12-estilos-css965.css`.
- Em teste (1.026): `S.emt[instId]`; entrada `.emtnav` por baixo da turma. Turmas só de coordenação: `CP().y.coordT` (nunca em `a.turmas`). `criarDemo()` cria 3 anos letivos. Forms: tipos `vf`, `lacunas`, `ligar` e `defs.exame`. Código da 1.026 no fim do último módulo JS (antes de `})();`).
- Código novo antes da âncora `/* SpruceNote e JornalNote: ao entrar, o quadro ajusta-se sozinho ao ecrã */`.
- CSS novo em `<style id="css965">`, com seletores fortes (`html body …`) por causa do tema SGE.
- Vistas: `TITLES.x`, envolver `go` e `go._f.x=vX`; módulos desativáveis põem o interruptor em `#def-mods`.
- Cores próprias de elementos (ex.: dias do calendário) não podem depender do ajuste automático de contraste: ele só repõe o que mudou (`data-cgc`/`data-cgb`).
- Menu lateral (1.020): estrutura em `MENU_DEF()` / `S.cfg.menu` (grupos `{id,nome,ic,f:[…]}` e itens `{v}`; especiais `@turmas`, `@prof`, `@bloq`, `@sep`), desenhado por `menuRender()` dentro de `#mnav`; editor em Definições › Menu Lateral (`defMenu`/`bindMenu`). Um botão novo com `data-v` na barra lateral entra sozinho no fim do menu; para o pôr num grupo, juntá-lo a `MENU_DEF()` e dar-lhe nome/ícone em `MN_NOME`/`MN_IC`.
- Escolas (1.021): cada escola tem calendário e organização próprios (`a.porEscola[id]`, cópia independente da principal ao primeiro acesso, aviso enquanto `calCopia`); cargos de DT só da escola ativa (`minhasDT`).

## Sessão nova
```
git clone https://github.com/EduSpruce/eduspruce.git /home/claude/eduspruce
git clone https://github.com/EduSpruce/eduspruce.github.io.git /home/claude/eduspruce.github.io
bash /home/claude/eduspruce/modern/scripts/sessao/preparar.sh
```
Se o envio para o GitHub der 403 («not in this session's authorized repository set»), o repositório tem de ser acrescentado às fontes da sessão (os dois: `eduspruce` e `eduspruce.github.io`, senão o espelho não é enviado).

## Publicar
```
CLAUDE_SESSION=<link da sessão> /tmp/es/pubm.sh 1.0XX "novidade 1|novidade 2" "changelog" "mensagem do commit"
```
Antes de publicar: `git fetch` e confirmar que nenhuma outra sessão publicou entretanto. Depois: confirmar com `git ls-remote origin main` nos dois repositórios.

## Testar sem ecrã (quando pedido)
- Chrome + Playwright disponíveis; a app corre dentro de uma função fechada: usar `EduGest.ev("código")` (ou injetar `window.__ev=x=>eval(x);` numa cópia); para saltar a entrada, usar o `INIT` de `modern/tests/comum.mjs`. Se o Playwright não encontrar o browser: `chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'})`.
- Versão com base de dados sem rede: servir a pasta por HTTP, trocar `esm/arranque.mjs` por um fornecedor falso em memória (sessao/autorizado/lerDados/ler/escrever/criar/apagar), semear `localStorage['eduspruce.sb']` e servir um `eduspruce-config.json` com o hash (`'eduspruce:'+email`) da conta de teste.
- PostgreSQL 16 local: dá para correr os scripts SQL (com stubs de `auth`, `storage`, `cron`, `net`, papéis anon/authenticated) e jogar a Arena de ponta a ponta.

## Índice: onde está cada parte (modern/src/app)
Os módulos mais recentes (número maior) reescrevem funções dos anteriores: procurar sempre com `grep -l "texto visível" modern/src/app/*` e editar o último que aparecer.
- Estilos: CSS novo em `12-estilos-css965.css`. Cabeçalho, menu e HTML base: `01-cabeca.html`, `13-corpo.html`.
- Dados embutidos (não abrir, são enormes): `14`–`17` (gifs, pdf.js, MRA).
- Núcleo (estado `S`, `A()`, `T()`, escolas por ano `prepAno`/`CTX_ESC`, cálculos): `19-nucleo.js`.
- Início: `20` (vInicio0), `31` (vInicio, tarefas), `40` (cartões), `37` (desempenho), `48` (telemóvel). Turmas/ano letivo: `20` (vTurmas).
- Calendário escolar, aulas previstas, intercalar: `21`. O Meu Calendário: `55`. Menu lateral: `55`.
- Reuniões, marcação de testes: `22`. Horário da turma e O Meu Horário: `23`, grelha nova `39`.
- Alunos, fotos, MSAI: `24`, catálogo MSAI `56`. Critérios, instrumentos, avaliação, relatórios: `25`, relatórios PDF/intercalar da turma `42`.
- Escola e escolas (dados, procurar na internet, tipologia), módulos profissionais: `26`.
- Definições: `27`, `28` (também `VERSAO` e Novidades). Ajuda: `27`, `54`.
- Sumários e planta da sala: `29`. Direção de Turma, documentos, biblioteca: `30`.
- Oral e conselho de turma: `33`. Entrar/autenticação: `35`. Google Drive: `36`.
- Perfis de utilizador e muitas funções mistas (575 KB, evitar ler): `41`.
- Aula e turma completa: `43`. Transferências de escola: `45`. Jornal/PAA: `46`. Segurança: `47`.
- Conselho PROFIJ e cargos: `49`. SpruceNote: `50`. Contactos e sorteio: `51`. Análise de resultados: `52`.
- PROFIJ: planos de recuperação (`vPrecup`, Portaria 52/2016) e MRA: `53`, `37`. Pautas PROFIJ/FPCT: `57`. FCT e PAP no calendário: `54`.
- Só na versão com base de dados (`modern/src/moderno/`): base de dados, cópia no Drive, palavra-passe → `basedados.js` (+ `modern/src/esm/supabase-prov.mjs` = `esm/`); Forms → `forms.js`; Arena, Pulso, banco de perguntas, autoavaliação → os ficheiros com esse nome.

## Para gastar menos (pedidos)
- Uma conversa nova por lote de pedidos; nunca duas sessões a publicar ao mesmo tempo.
- Procurar pelo texto exato do ecrã; não ler módulos inteiros nem o index.html.
- Testar no browser só mudanças de lógica; «sem testar» = não testar.

## Para gastar menos (trabalho)
- Mudanças pequenas: procurar com grep pelo texto visível no ecrã e editar só essa linha.
- Sem capturas de teste quando o utilizador disser «sem testar».

## Provas (1.030) — módulo independente (clone do Intuitivo)
- Código: `modern/src/moderno/provas.js` (juntado depois do forms.js pelo `db.mjs`); página dos alunos: `provas.html` (cópia adaptada do forms.html, chaves `es-pv-…`, resposta `{pv:1}`).
- Não usa funções do Forms: a infraestrutura (sessões cifradas em `eduspruce_autoav`, correção, respostas, ligação a turmas/momentos) foi copiada com prefixo `pv`/classes `pq`.
- Dados: `S.pv = {ex:[banco], av:[avaliações], rub:[rubricas], grupos:[{nome,code}]}`; agendamentos em `av.ag[codigo]={tid,ini,fim}`.
- Tipos: escolha, vf, texto (curta/longa, contar, mat, rub), lacunas (modo arrastar/escolher/escrever, extraP), ordem (parc), ligar, tabela (cols, lins, marc, porLinha), legendar (img, marcas), segmentos (img, zonas); `dico` = dicotómica; `just`, `extra`, `resol`.
- SQL: `modern/supabase/migrations/0015_provas.sql` (sessões até 4 MB e 62 dias, respostas até 200 000 caracteres, partilha `eduspruce_provas_partilha` + `provas_partilhar/importar/grupo/despartilhar`).
- O Forms deixou de oferecer V/F, preencher e ligar e o modo exame (só aparecem em formulários antigos).

## O Meu Calendário (1.031) — clone do Outlook
- Código no fim de `56-…menu-lateral…js` (antes da âncora SpruceNote): `OCAL()` = `S.cal {ev, cals, cat, src, cfg}`; eventos `{d0,d1,h0,h1 (minutos),dia,rep{f,int,dias,ate,n},exc,ov,lemb,est,priv,cat,esc}`; `ocColetar(A,B)` junta aulas, reuniões, testes, tarefas, Provas e calendário escolar.
- Tema SGE (`body.est-sge`): cantos retos nas Provas, no calendário e em `provas.html` (`D.quad`). Nunca usar o nome `A_` (é a configuração de autenticação).

## Avisos com a app fechada (1.036) — notificações push
- App: `modern/src/moderno/avisos.js` (juntado no fim pelo `db.mjs`); `sw.js` tem o evento `push`. Cartão «Com a App Fechada» em Definições › Notificações (envolve `defNotif`/`bindNotif`).
- `psLista()` calcula os avisos dos próximos 21 dias (chaves `a:` aulas, `r:` resumo, `t:` avaliações de amanhã, `m:` reuniões, `av:` avisos) com `ntCfg()` e `ntSilencio`; `S.cfg.notif.pushDisc` = avisos discretos. `psSync()` guarda-a com `eduspruce_avisos_definir` (só se a conta tiver aparelhos). Com push ligado no aparelho (`es.push.on`), `ntAgora` deixa de repetir `a:`/`r:`/`t:` e as reuniões.
- Supabase: `modern/supabase/migrations/0016_avisos_push.sql` (tabelas, funções, pg_cron de minuto a minuto) + Edge Function `modern/supabase/functions/eduspruce-avisos/index.ts` (Verify JWT desligado; cria as chaves VAPID sozinha). Guia: `docs/guias/AVISOS_COM_A_APP_FECHADA.md`.

## Apps (1.052) — página inicial com as apps em mosaicos
- Código: `modern/src/moderno/hub.js` (juntado no fim pelo `db.mjs`); vista `hub` («Apps»), botão no menu lateral a seguir a Início (`patches.json` mexe no `MENU_ORIG`; `hubMenu()` põe-no nos menus personalizados uma vez, `S.cfg.hubMenu`).
- Grupos fixos em `HUB_GRUPOS`/`HUB_APPS` (Gestão: turmas, avaliacao, sumarios · Recreio: arena, pulso, forms, provas · Organização: sprucenote). O EduTime ainda não entra (juntar a `HUB_APPS` com `gr:'org'`).
- `S.cfg.hub = {ini (abrir nas Apps ao entrar, omissão NÃO — o Início é a primeira página; 1.057), est ('cheio'|'suave'|'linha'), ic:{id:{g,c,e,img,n}}}`; imagem própria reduzida a 128 px (webp). Editor em `hubEditar` (gaveta).
- Ao entrar: `go('inicio')` passa para `hub` até o professor navegar (`go._hubU`). Atenção: a classe `.hbtag` era escondida por uma regra global — usar `.hblig`.
- 1.053–1.055: tema SGE em `vHub` (painéis `.hub-gr` com título `.hub-sec`, mosaicos planos com faixa de cor, mosaicos alinhados à esquerda); caixa «Turma» (`#hb-tur`, muda `S.turmaAtiva`) no painel Gestão — apps com `turma:1` pedem a turma. Início: `dashTopo` envolvido para pôr a barra `.hub-mini` (ícones pequenos à direita, `data-hubmini`).
