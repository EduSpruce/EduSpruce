# EduSpruce — Alojamento, domínio, contas e sincronização (notas de referência)

*Registado a 4 de novembro de 2026 (versão 0.81). Guia prático para voltar a configurar, resolver problemas ou explicar a outra pessoa.*

---

## 1. Onde está tudo

| O quê | Onde |
|---|---|
| Repositório (código da app, público) | **github.com/EduSpruce/EduSpruce** (ramo `main`) |
| Site | GitHub Pages do repositório; domínio próprio **eduspruce.app** (ficheiro `CNAME`) |
| Configuração central (IDs Microsoft/Google) | `eduspruce-config.json` na raiz do repositório |
| Política de Privacidade | `https://eduspruce.app/privacidade.html` |
| Termos de Serviço | `https://eduspruce.app/termos.html` |
| Guia técnico completo | `docs/guias/CONFIGURAR_SINCRONIZACAO.md` (e, na app, Definições › Dados e Segurança › Sincronização › Guia de configuração) |
| Logótipo (SVG/PNG) | `docs/logotipo/` no repositório |
| Projeto Google Cloud | n.º **275856895734** |
| ID de cliente Google | `275856895734-48n60vhatvltml3t601o24cbak7ndjq2.apps.googleusercontent.com` (público, não é segredo) |
| ID da aplicação Microsoft | *(por criar)* |

> Os IDs de cliente OAuth são públicos. **Nunca** colocar no repositório cópias de segurança, Excel, CSV ou PDF com dados de alunos — o `.gitignore` bloqueia `*.json` (exceto `manifest.webmanifest` e `eduspruce-config.json`), `*.xlsx`, `*.csv`, `*.pdf`.

---

## 2. Publicar no GitHub Pages (feito)

1. Conta GitHub com verificação em dois passos.
2. Repositório público `EduSpruce` com o conteúdo do zip (o `index.html` na raiz).
3. **Settings › Pages** › Source: *Deploy from a branch* › Branch `main` / `(root)` › Save.
4. **Atualizar uma versão à mão:** *Add file › Upload files* › arrastar o novo `index.html` › *Commit changes*. Não apagar `CNAME` nem `eduspruce-config.json`.

### Publicação automática pelo Claude (feita)
- O GitHub está ligado ao Claude e a **aplicação Claude do GitHub está instalada na conta/organização EduSpruce** (repositório EduSpruce). O Claude envia cada versão diretamente para `main`, com CHANGELOG e README atualizados.
- Se voltar a dar «Claude doesn't have GitHub access…»: instalar/rever em **github.com/apps/claude/installations/select_target** › conta **EduSpruce** › *Only select repositories* › EduSpruce.
- Etiquetas (`v0.xx`) e *releases* não podem ser criadas pelo Claude; fazem-se no site: **Releases › Draft a new release**.

---

## 3. Domínio próprio eduspruce.app

1. Comprar o domínio num registador (Cloudflare, Porkbun, Namecheap, Hostinger…).
2. **Verificar o domínio no GitHub** (conta › Settings › Pages › *Add a domain*) com o registo TXT `_github-pages-challenge-<utilizador>`.
3. **DNS no registador** (apagar registos A/AAAA/CNAME de «estacionamento» em `@` e `www`):

| Tipo | Nome | Valor |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 · 2606:50c0:8001::153 · 2606:50c0:8002::153 · 2606:50c0:8003::153 |
| CNAME | www | `<utilizador>.github.io` (sem https nem caminho) |

4. Na Cloudflare: nuvem **cinzenta (DNS only)**.
5. Repositório › Settings › Pages › *Custom domain* `eduspruce.app` › Save (cria o `CNAME`).
6. Verificar propagação em **dnschecker.org** (tipo A) ou `dig eduspruce.app +short`; depois **Check again** e marcar **Enforce HTTPS**. `.app` só abre com HTTPS.
7. Erro «Both eduspruce.app and its alternate name are improperly configured / NotServedByPagesError» = DNS ainda não aponta para o GitHub (registos em falta, antigos ou a propagar).

---

## 4. Google (Entrar com Google + Google Drive) — configurado

Feito na **console.cloud.google.com**, projeto 275856895734:
1. **APIs e serviços › Biblioteca › Google Drive API › Ativar** — *indispensável* (sem isto o Drive dá erro 403, incluindo «Method doesn't allow unregistered callers»). Ligação direta: `console.cloud.google.com/apis/library/drive.googleapis.com?project=275856895734`.
2. **Google Auth Platform** (antigo «Ecrã de consentimento OAuth»): nome EduSpruce, público **Externo**, e-mail de contacto.
3. **Acesso a dados (âmbitos):** `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `.../auth/drive.appdata`.
4. **Clientes › Aplicação Web:**
   - Origens JavaScript autorizadas: `https://eduspruce.app` (e o endereço github.io, se usado).
   - URIs de redirecionamento: `https://eduspruce.app/` (com barra final; necessário no iPhone/iPad).
5. ID de cliente colado em `eduspruce-config.json` › `googleClientId`.
6. **Público-alvo:** em «Teste» só entram utilizadores de teste (até 100) → **Publicar app** para todos.

### Remover o «Unverified» (por fazer)
Só é precisa a **verificação da marca** (âmbitos não sensíveis), 2–3 dias úteis:
1. Domínio `eduspruce.app` a funcionar.
2. **Google Search Console** (search.google.com/search-console): adicionar `eduspruce.app` como propriedade de *Domínio* e criar o registo TXT pedido.
3. **Google Auth Platform › Branding:** logótipo 120×120 (`EduSpruce-logotipo-Google-120.png` em `docs/logotipo/png/`), página inicial `https://eduspruce.app/`, privacidade `https://eduspruce.app/privacidade.html`, termos `https://eduspruce.app/termos.html`, domínio autorizado `eduspruce.app`.
4. **Centro de verificação › Pedir verificação**.

### Onde ficam os dados no Google Drive
Numa **pasta oculta da app** (`appDataFolder`), que não aparece em «O meu disco». Ver em **drive.google.com › Definições › Gerir apps › EduSpruce** («Dados ocultos da aplicação: N KB»); aí também se pode **Eliminar dados de apps ocultos**. Os ficheiros estão encriptados (AES-256).

### Erros Google e solução
| Mensagem | Solução |
|---|---|
| «A Google não devolveu o e-mail da conta» | Deixar marcada a permissão do e-mail; confirmar âmbitos `userinfo.email`/`openid` (corrigido na v0.76). |
| «Google Drive: erro 403 — Method doesn't allow unregistered callers» | Ativar a **Google Drive API** no projeto; ligação antiga sem permissão do Drive (corrigido na v0.79/0.81). |
| «Falta a permissão do Drive» | Tocar em **Ligar ao Google Drive** (antes de Guardar e Sincronizar) e deixar todas as permissões marcadas. |
| redirect_uri_mismatch / origin_mismatch | Endereço/origem no cliente OAuth não coincide (https, barra final). |
| access_denied (app não verificada) | Conta não é utilizador de teste → adicionar ou publicar a app. |
| «A Google não validou esta app» | *Avançadas › Aceder a EduSpruce* (até concluir a verificação). |

---

## 5. Microsoft (OneDrive + Entrar com Microsoft 365) — por fazer

1. **entra.microsoft.com › Entra ID › Registos de aplicações › + Novo registo.**
2. Nome EduSpruce · Tipos de conta: *qualquer diretório organizacional (multi-inquilino) e contas Microsoft pessoais*.
3. URI de redirecionamento: plataforma **Aplicação de página única (SPA)** › `https://eduspruce.app/` (e o github.io, se usado).
4. **Permissões de API › Microsoft Graph › Delegadas:** `Files.ReadWrite.AppFolder`, `User.Read`, `offline_access`.
5. Copiar o **ID da aplicação (cliente)** para `eduspruce-config.json` › `microsoftClientId` (o Claude pode fazer o commit).
6. Contas da escola: se aparecer «Precisa da aprovação do administrador», o administrador do Microsoft 365 do agrupamento faz **Entra ID › Aplicações empresariais › EduSpruce › Permissões › Conceder consentimento de administrador**.
7. Erros: AADSTS50011 (URI diferente), AADSTS9002326 (registado como «Web» em vez de SPA), AADSTS700016 (ID errado ou não multi-inquilino). A Microsoft limita a 24 h a ligação de apps web; a app renova sozinha ao abrir.

---

## 6. O que cada professor faz

1. Abrir a app › **Definições › Dados e Segurança › Sincronização na Nuvem** › escolher **Google Drive** (ou OneDrive) › **Ligar**.
2. Definir a **palavra-passe de encriptação** (mín. 8) e guardá-la — sem ela os dados na nuvem não se recuperam.
3. **Ligar Outro Dispositivo** › enviar o link (AirDrop, Mail) para o iPad/iPhone.
4. No iPad/iPhone: abrir o link no Safari › **Partilhar › Adicionar ao ecrã principal** › Ligar › mesma conta › mesma palavra-passe.
5. **Ícone da nuvem** na barra: verde sincronizado · azul por enviar · amarelo renovar (tocar) · vermelho erro · cinzento sem internet. Com a Google, a ligação dura 1 h (renova sozinha; no iPhone pode pedir um toque).

---

## 7. Antes de distribuir a muitos professores

- Aval da **direção** e do **EPD** do agrupamento (dados de menores, RGPD).
- **Piloto** com 5–10 colegas durante 2–4 semanas.
- Revisão jurídica da Política de Privacidade e dos Termos (contacto público atual: página de *Issues* do GitHub).
- Verificação da marca na Google; registo Microsoft e consentimento do administrador do M365 da escola.
- Considerar um repositório de teste (`eduspruce-teste`) para experimentar versões antes de publicar.

---

## 8. Identidade

- Nome: **EduSpruce** — **S**umários, **P**laneamento, **R**egistos, **U**nidades, **C**alendário, **E**nsino.
- Logótipo predefinido: **Monograma «S.»** (azul `#2f6ea5 → #1c3f63`, dourado `#e3b448`); alternativas na app: Abeto, Livro, Floresta, Ramo.
- Aparência por defeito: tema Claro, estilo Institucional, azul, animações completas.
- Chaves internas mantidas do nome antigo (não mudar): `edugest.*` no armazenamento, `eduflow-ev`, pasta OneDrive `EduFlow`.
