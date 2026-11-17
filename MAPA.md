# EduSpruce · mapa (convenções do código e notas de cada módulo)

Regras do utilizador, ferramentas (`./es`) e onde está cada coisa: **CLAUDE.md**, na raiz do repositório (carregado sozinho em cada sessão).
Aqui ficam só as convenções e as notas de cada módulo: ler apenas a secção precisa (`grep -n "^## " MAPA.md` mostra as secções).

## Página leve (1.041) — ficheiros separados na versão publicada
- O `db.mjs` (função `separar`) tira do `index.html` publicado: código principal → `app/app.<impressão>.js`, estilos grandes → `app/estilosN.<impressão>.css`, dados (GIF da Ajuda, pdf.js, MRA) → `app/<id>.<impressão>.txt` (carregados só quando precisos, via `data-src`), manifesto → `manifest.webmanifest`. O `index.html` passa de 8,2 MB para ~75 KB.
- O código-fonte não muda (continua em `modern/src/app`); `arquivo.html` e a exportação offline continuam num ficheiro só.
- `sw.js`: ficheiros `app/*.<12 hex>.*` servidos da cache (nunca mudam de conteúdo); fica a versão atual e a anterior. `espelho.sh` copia `app/`.
- Cabeçalho (1.040): na passagem para «Mais», os botões `.pri` são os últimos a sair. Tema SGE: regra de cantos retos em `app/039-modo-leve-computadores-antigos.css` (fim do bloco css965).

## Convenções
- Desempenho (1.026): NUNCA `:has()` com `[style…]` lá dentro (nem `:not(:has(...[style]))`) — obriga a recalcular o estilo da página inteira a cada medição do cabeçalho (deixava a app lenta nos PCs antigos). Modo leve: `html.leve` (Definições › Aparência › Desempenho, `localStorage es.leve`).
- Privacidade no modo de apresentação (1.026): `apresPrep`/`apresAplicar` + observador do documento filtram tudo o que aparece (texto, atributos, valores, listas, canvas). Memória por turma em `S.cfg.apresT[turmaId]` (`auto` = liga ao abrir a turma).
- Privacidade de cada aluno (1.043): `S.cfg.apres.privAl={id:{n,f}}` (Notas/Foto; «Tudo» = `ocultos`). `apPvPrep`/`apPvAplicar` marcam a linha/cartão do aluno (`apres-pn`, `apres-pf`; células a manter `apnm`, folhas com nota `apgr`) e a ficha (`#dw-b.apres-pnd/pfd`). Botões na janela por `apPvUI` (envolve `apresDlg`). Nunca chamar `apresCfg()` com a janela aberta (substitui `S.cfg.apres`).
- Planta da Sala (1.048): `vPlanta` reescrita (`app/101-planta-sala-robusta.js`); `pl.tipo={"r-c":'v'|'p'|'porta'|'jan'}` (omissão = lugar; `pl.vazios` mantido para compatibilidade), `pl.fix[aid]` lugares fixos, `plModelo`/`plDistribuir`/`plLugares` (frente = secretária). Atenção: `html body .oc` é do O Meu Calendário — nunca usar a classe `.oc` sem seletor forte.
- Perfis (1.044–1.046): `perfilEvol` (ao lado do radar, injetado por `perfilRadar`), `perfilImprimir` (impressão completa, intercepta `#pa-pr`).
- Menu lateral, turma + disciplina (1.042): espaço entre linhas por regra `#side .tnode .lbl` em `app/020-in-main.css`.
- Em teste (1.026): `S.emt[instId]`; entrada `.emtnav` por baixo da turma. Turmas só de coordenação: `CP().y.coordT` (nunca em `a.turmas`). `criarDemo()` cria 3 anos letivos. Forms: tipos `vf`, `lacunas`, `ligar` e `defs.exame`. Código da 1.026 nas peças `app/239`–`244`.
- Código novo: `./es novo NOME` (peça antes de `app/245-fim-do-programa.js`).
- CSS novo: `./es novo NOME --css` (fica no bloco `<style id="css965">`), com seletores fortes (`html body …`) por causa do tema SGE.
- Vistas: `TITLES.x`, envolver `go` e `go._f.x=vX`; módulos desativáveis põem o interruptor em `#def-mods`.
- Cores próprias de elementos (ex.: dias do calendário) não podem depender do ajuste automático de contraste: ele só repõe o que mudou (`data-cgc`/`data-cgb`).
- Menu lateral (1.020): estrutura em `MENU_ORIG()` / `S.cfg.menu` (grupos `{id,nome,ic,f:[…]}` e itens `{v}`; especiais `@turmas`, `@prof`, `@bloq`, `@sep`), desenhado por `menuRender()` dentro de `#mnav`; editor em Definições › Menu Lateral (`defMenu`/`bindMenu`). Um botão novo com `data-v` na barra lateral entra sozinho no fim do menu; para o pôr num grupo, juntá-lo a `MENU_ORIG()` e dar-lhe nome/ícone em `MN_NOME`/`MN_IC`.
- Escolas (1.021): cada escola tem calendário e organização próprios (`a.porEscola[id]`, cópia independente da principal ao primeiro acesso, aviso enquanto `calCopia`); cargos de DT só da escola ativa (`minhasDT`).

## Testar sem ecrã (quando pedido; «sem testar» = não testar)
- `./es testa`: constrói as duas versões, verifica a sintaxe e abre todas as vistas da versão sem base de dados num Chromium sem ecrã, com os dados de demonstração; só mostra erros.
- Testes à medida: `EduGest.ev("código")` corre código dentro da app; o `INIT` de `modern/tests/comum.mjs` salta a entrada (ver `modern/tests/vistas.mjs`). Se o Playwright não encontrar o browser: `chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'})`.
- Versão com base de dados sem rede: servir a pasta por HTTP, trocar `esm/arranque.mjs` por um fornecedor falso em memória (sessao/autorizado/lerDados/ler/escrever/criar/apagar), semear `localStorage['eduspruce.sb']` e servir um `eduspruce-config.json` com o hash (`'eduspruce:'+email`) da conta de teste.
- PostgreSQL 16 local: dá para correr os scripts SQL (com stubs de `auth`, `storage`, `cron`, `net`, papéis anon/authenticated) e jogar a Arena de ponta a ponta.

## Onde está cada parte (caminhos relativos a modern/src/)
- `./es mapa`: vista → título → função → peças (gerado na hora, nunca desatualizado). `./es fn NOME` mostra a definição e as redefinições.
- Núcleo (estado `S`, `A()`, `T()`, `save`, `prepAno`, `CTX_ESC`): `app/049-estado.js`. Navegação (`TITLES`, `go._f`, `NEEDS_T`): `app/052-navegacao.js`.
- Menu lateral (`MENU_ORIG`, `MN_NOME`, `MN_IC`, `menuRender`): `app/220-menu-lateral-organizado-grupos.js`; editor em Definições › Menu Lateral (`defMenu`/`bindMenu`): `app/221-meu-calendario-reunioes-tarefas.js`.
- Módulos Opcionais (interruptores em `#def-mods`): `app/186-ligacoes-resto-app.js`; cada módulo acrescenta o seu (procurar `def-mods`).
- Modo de apresentação e privacidade: `app/054-modo-apresentacao.js`, `235-…`, `236-…`. Perfis: `237-…`, `238-…`. Planta da Sala: `app/101-planta-sala-robusta.js`.
- O Meu Calendário: `app/221-…`, `222-meu-calendario-estilo-calendario.js`. Ajuda: `app/088-ajuda.js` (+ textos por versão em `113`, `216`, `225`, `244`).
- Estilos: peças `.css` de `006` a `039`; o bloco `css965` vai de `036` a `039` (as regras mais recentes no fim de `039`). CSS novo: `./es novo NOME --css`.
- Só na versão com base de dados: `moderno/` (ordem em `moderno/ordem.txt`): base de dados, cópia no Drive, palavra-passe → `basedados.js` (+ `esm/supabase-prov.mjs`); Formulários → `forms.js`; Arena, Pulso, banco de perguntas, autoavaliação, Provas, avisos, Apps → os ficheiros com esse nome.

## Provas (1.030) — módulo independente (clone do Intuitivo)
- Código: `modern/src/moderno/provas.js` (juntado depois do forms.js pelo `db.mjs`); página dos alunos: `provas.html` (cópia adaptada do forms.html, chaves `es-pv-…`, resposta `{pv:1}`).
- Não usa funções do Forms: a infraestrutura (sessões cifradas em `eduspruce_autoav`, correção, respostas, ligação a turmas/momentos) foi copiada com prefixo `pv`/classes `pq`.
- Dados: `S.pv = {ex:[banco], av:[avaliações], rub:[rubricas], grupos:[{nome,code}]}`; agendamentos em `av.ag[codigo]={tid,ini,fim}`.
- Tipos: escolha, vf, texto (curta/longa, contar, mat, rub), lacunas (modo arrastar/escolher/escrever, extraP), ordem (parc), ligar, tabela (cols, lins, marc, porLinha), legendar (img, marcas), segmentos (img, zonas); `dico` = dicotómica; `just`, `extra`, `resol`.
- SQL: `modern/supabase/migrations/0015_provas.sql` (sessões até 4 MB e 62 dias, respostas até 200 000 caracteres, partilha `eduspruce_provas_partilha` + `provas_partilhar/importar/grupo/despartilhar`).
- O Forms deixou de oferecer V/F, preencher e ligar e o modo exame (só aparecem em formulários antigos).

## O Meu Calendário (1.031) — clone do Outlook
- Código em `app/221-meu-calendario-reunioes-tarefas.js` e `app/222-meu-calendario-estilo-calendario.js`: `OCAL()` = `S.cal {ev, cals, cat, src, cfg}`; eventos `{d0,d1,h0,h1 (minutos),dia,rep{f,int,dias,ate,n},exc,ov,lemb,est,priv,cat,esc}`; `ocColetar(A,B)` junta aulas, reuniões, testes, tarefas, Provas e calendário escolar.
- Tema SGE (`body.est-sge`): cantos retos nas Provas, no calendário e em `provas.html` (`D.quad`). Nunca usar o nome `A_` (é a configuração de autenticação).

## Avisos com a app fechada (1.036) — notificações push
- App: `modern/src/moderno/avisos.js` (juntado no fim pelo `db.mjs`); `sw.js` tem o evento `push`. Cartão «Com a App Fechada» em Definições › Notificações (envolve `defNotif`/`bindNotif`).
- `psLista()` calcula os avisos dos próximos 21 dias (chaves `a:` aulas, `r:` resumo, `t:` avaliações de amanhã, `m:` reuniões, `av:` avisos) com `ntCfg()` e `ntSilencio`; `S.cfg.notif.pushDisc` = avisos discretos. `psSync()` guarda-a com `eduspruce_avisos_definir` (só se a conta tiver aparelhos). Com push ligado no aparelho (`es.push.on`), `ntAgora` deixa de repetir `a:`/`r:`/`t:` e as reuniões.
- Supabase: `modern/supabase/migrations/0016_avisos_push.sql` (tabelas, funções, pg_cron de minuto a minuto) + Edge Function `modern/supabase/functions/eduspruce-avisos/index.ts` (Verify JWT desligado; cria as chaves VAPID sozinha). Guia: `docs/guias/AVISOS_COM_A_APP_FECHADA.md`.

## Apps (1.052) — página inicial com as apps em mosaicos
- Código: `modern/src/moderno/hub.js` (juntado pelo `db.mjs`, ordem em `moderno/ordem.txt`); vista `hub` («Apps»), botão no menu lateral a seguir a Início (`patches.json` mexe no `MENU_ORIG`; `hubMenu()` põe-no nos menus personalizados uma vez, `S.cfg.hubMenu`).
- Grupos fixos em `HUB_GRUPOS`/`HUB_APPS` (Gestão: turmas, avaliacao, sumarios · Recreio: arena, pulso, forms, provas · Organização: sprucenote). O EduTime ainda não entra (juntar a `HUB_APPS` com `gr:'org'`).
- `S.cfg.hub = {ini (abrir nas Apps ao entrar, omissão NÃO — o Início é a primeira página; 1.057), est ('cheio'|'suave'|'linha'), ic:{id:{g,c,e,img,n}}}`; imagem própria reduzida a 128 px (webp). Editor em `hubEditar` (gaveta).
- Ao entrar: `go('inicio')` passa para `hub` até o professor navegar (`go._hubU`). Atenção: a classe `.hbtag` era escondida por uma regra global — usar `.hblig`.
- 1.053–1.055: tema SGE em `vHub` (painéis `.hub-gr` com título `.hub-sec`, mosaicos planos com faixa de cor, mosaicos alinhados à esquerda); caixa «Turma» (`#hb-tur`, muda `S.turmaAtiva`) no painel Gestão — apps com `turma:1` pedem a turma. Início: `dashTopo` envolvido para pôr a barra `.hub-mini` (ícones pequenos à direita, `data-hubmini`).

## Spruce It (1.060) — antiga Arena, com o aspeto do design «EduSpruce Arena»
- Nome visível: **Spruce It** (código interno continua `arena`: `arena.js`, `arena-comum.js`, `arena.html`, tabelas `eduspruce_arena_*`). Abre sem o menu lateral (`body.spruceit`, ligado em `go`/`vArena`) com o botão «← Voltar à EduSpruce» (`spVoltar` → Apps).
- Temas do jogo (`AR.TEMAS`: spruce, arena, papel, neon; `AR.temaCss`) escolhidos ao lançar (`cfg.tema`), aplicados à página dos alunos e ao ecrã projetado (`#arhost.v2`). Tipos de letra alojados em `fontes/` (sem Google Fonts).
- Lançar em 2 passos (`arLancarDlg`: grelha de modos com `AR.emblema` → definições: termina por tempo/objetivo `AR_OBJ`, ordem aleatória/sequencial/até dominar, equipas, interruptores mostrar/tardias/alcunhas aleatórias/silêncio). Biblioteca em linhas (Editar · Atribuir = TPC · Lançar jogo).
- 6 modos novos (`AR.NOVOS`): cume, cofre, mare, duelo, expedicao, estafeta. Servidor: `modern/supabase/migrations/0017_arena_modos_cume.sql` (`arena_pergunta2`, `arena_responder2`, `arena_acao_modo`, `arena_equipas`, `arena_versao()=17`, coluna `sala.equipas`). Os modos antigos continuam nas funções antigas (as novas delegam). Sem o SQL 0017, os modos novos dão aviso ao lançar.
- Testar: PostgreSQL local com stubs (`auth.uid()` via `test.uid`) + servidor Python que mapeia `/rest/v1/rpc/<fn>`; o professor testa-se com `EduGest.ev` (`SESSAO=…`, remover `#login`, `vArena()`).

## EduSchedule (1.062) — antigo EduTime (horários da escola, como o Untis), módulo desligável
- Fonte: `modern/src/eduschedule/` (`src/engine.js` motor, `src/app1–3.js` base, `src/paginas/NN-*.js` uma secção por ficheiro, ordem em `src/ordem.json`; `build.js` corre o Tailwind/daisyUI e faz `/eduschedule.html` e `/horarios.html`). Testes do motor: `node modern/src/eduschedule/test/t1.js` (t1, t2, t4, t5, t6).
- Ponte (`src/ponte.js`): o código usa `ESTORE` em vez de `localStorage` (o `build.js` troca). O horário e as cópias diárias vão para a conta em `S.esched {estado:"JSON", copias:{'ph-bk-…'}}` (máx. 10 cópias); só tema e letra ficam no aparelho. Aberto fora da EduSpruce, só mostra a ligação para a app.
- Na EduSpruce: `moderno/eduschedule.js` — vista `eduschedule` (iframe, sem menu lateral, `body.esched`), botão no menu, mosaico em Apps › Organização, interruptor `S.cfg.eschedOn` em Módulos Opcionais, `window.__esched` (ler/gravar/copias/rpc/email/sge/publico). Tema SGE da EduSpruce → tema `sge` do EduSchedule por omissão.
- Equipa e publicação (antes o servidor Node do EduTime): `paginas/22-servidor.js` chama as funções do `0018_eduschedule.sql` (`eduschedule_eu/criar/ler/versao/gravar/publicar/membros/membro_guardar/membro_apagar/sair`; `eduschedule_publico` para anónimos). Colegas por e-mail (contas autorizadas), papéis admin/editor/leitor; gravar com versão (conflito → fusão a três do próprio EduSchedule). Com horário partilhado, `PONTE.equipa=true` e o horário deixa de ir para `S.esched`.
- Consulta pública: `/horarios.html#<código>[/<página>.html]`; calendários `.ics` pela Edge Function `modern/supabase/functions/eduschedule-ics` (Verify JWT desligado).
