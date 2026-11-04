# Configurar a sincronização e o início de sessão (OneDrive e Google Drive)

*Atualizado em novembro de 2026 — Microsoft Entra admin center e Google Auth Platform.*

A EduSpruce sincroniza os dados de cada professor entre o computador, o iPad e o iPhone. Os dados são
**encriptados no próprio dispositivo** (AES-256, com uma palavra-passe que só o professor conhece) e ficam na
**pasta privada da app** no OneDrive ou no Google Drive **do próprio professor**. Nada passa por servidores da EduSpruce.

Para isso, quem aloja a app regista-a **uma vez** na Microsoft e/ou na Google e escreve os IDs no ficheiro
`eduspruce-config.json`, na raiz do site. A partir daí, os professores só têm de «Entrar com a conta».

```json
{
  "microsoftClientId": "1a2b3c4d-....-....-....-............",
  "googleClientId": "1234567890-abc....apps.googleusercontent.com"
}
```

> **Qual escolher?** Para escolas com Microsoft 365, o **OneDrive**: a ligação dura um dia inteiro e renova-se
> sozinha ao abrir a app. A Google limita as ligações de apps web a 1 hora (a app renova sozinha; no iPhone/iPad pode
> pedir um toque). Pode configurar os dois — cada professor escolhe.

Os endereços a usar abaixo são os da sua app. Exemplos:

| Onde está a app | URI de redirecionamento | Origem |
|---|---|---|
| GitHub Pages | `https://<utilizador>.github.io/eduspruce/` | `https://<utilizador>.github.io` |
| Domínio próprio | `https://eduspruce.app/` | `https://eduspruce.app` |

Dentro da app, em **Definições › Dados e Segurança › Sincronização na Nuvem › Guia de configuração**, estes
endereços aparecem já preenchidos, com botão para copiar.

---

## 1. Microsoft (OneDrive) — cerca de 10 minutos, gratuito

1. **Abrir o portal.** Vá a <https://entra.microsoft.com> e entre com uma conta Microsoft (pode ser pessoal, ex.: @outlook.com).
2. **Registos de aplicações.** Menu da esquerda: **Entra ID › Registos de aplicações** (*App registrations*; em contas antigas: *Identity › Applications › App registrations*) › **+ Novo registo**.
3. **Preencher o registo:**
   - **Nome:** `EduSpruce` (é o que os professores veem ao autorizar).
   - **Tipos de conta suportados:** *Contas em qualquer diretório organizacional (qualquer inquilino do Microsoft Entra ID — multi-inquilino) e contas Microsoft pessoais*.
   - **URI de redirecionamento:** plataforma **Aplicação de página única (SPA)** — não «Web» — com o endereço exato da app, **com a barra final**.
   - **Registar**.
4. **Outros endereços.** Se a app abrir em mais do que um endereço: **Autenticação › Aplicação de página única › Adicionar URI** (um por endereço). Não ative «Concessão implícita».
5. **Permissões de API › + Adicionar uma permissão › Microsoft Graph › Permissões delegadas**:
   - `Files.ReadWrite.AppFolder` — só a pasta *Aplicações* da app (não os outros ficheiros);
   - `User.Read` — nome e e-mail;
   - `offline_access` — manter a ligação.
   
   › **Adicionar permissões**.
6. **Descrição geral** › copie o **ID da aplicação (cliente)**. Não crie «segredo do cliente» — não é usado.
7. **No GitHub**: ficheiro `eduspruce-config.json` › lápis › cole em `microsoftClientId` › **Commit changes**. Fica ativo em 1–2 minutos.

### Contas da escola (Microsoft 365)

Muitos inquilinos escolares só permitem que os utilizadores aprovem apps de **editores verificados**. Se um professor vir
**«Precisa da aprovação do administrador»**, o administrador do Microsoft 365 do agrupamento faz, uma vez:
**Entra ID › Aplicações empresariais › EduSpruce › Permissões › Conceder consentimento de administrador para …**
(ou aprova o pedido em **Pedidos de consentimento de administrador**). Em alternativa, quem registou a app pode fazer
a **verificação de editor** (precisa de um ID do Microsoft AI Cloud Partner Program).

### Se algo correr mal (Microsoft)

| Erro | Causa e solução |
|---|---|
| `AADSTS50011` (redirect URI mismatch) | O endereço registado não é igual ao da app: https, barra final, caminho. |
| `AADSTS9002326` (cross-origin token redemption) | O endereço foi registado como «Web» em vez de «Aplicação de página única (SPA)». |
| `AADSTS700016` (application not found) | ID errado, ou o registo não é multi-inquilino. |
| «Precisa de aprovação do administrador» | Ver *Contas da escola* acima. |
| Pede para entrar todos os dias | Normal: a Microsoft limita a 24 h as ligações de apps web; a app renova sozinha ao abrir. |

---

## 2. Google (Google Drive e «Entrar com Google») — cerca de 15 minutos, gratuito

1. **Projeto.** <https://console.cloud.google.com/projectcreate> › nome `EduSpruce` › **Criar**; confirme que está selecionado no topo.
2. **Ativar a API.** **APIs e serviços › Biblioteca** › *Google Drive API* › **Ativar**.
3. **Google Auth Platform** (antigo «Ecrã de consentimento OAuth») › **Começar**:
   - **Informações da app:** nome `EduSpruce`, e-mail de apoio;
   - **Público-alvo:** **Externo** (qualquer escola ou conta pessoal). Escolha **Interno** só se todos os professores forem do mesmo Google Workspace — sem limite de utilizadores nem verificação;
   - **Contacto:** o seu e-mail › aceitar a política › **Criar**.
4. **Acesso a dados › Adicionar ou remover âmbitos:** `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `.../auth/drive.appdata` › **Atualizar** › **Guardar**.
   `drive.appdata` é a pasta escondida da app no Drive: a app não vê os outros ficheiros do professor.
5. **Clientes › + Criar cliente:**
   - **Tipo de aplicação:** Aplicação Web; nome `EduSpruce web`;
   - **Origens JavaScript autorizadas:** a origem da app (ex.: `https://eduspruce.app`);
   - **URIs de redirecionamento autorizados:** o endereço da app com barra final (ex.: `https://eduspruce.app/`) — necessário no iPhone/iPad;
   - **Criar** › copie o **ID de cliente** (`….apps.googleusercontent.com`). O segredo do cliente não é usado.
6. **Público-alvo › Publicar app.** Em «Teste» só entram os utilizadores de teste (até 100). Publicada («Em produção»), qualquer conta pode entrar; com estes âmbitos não sensíveis, normalmente não é precisa a verificação completa da Google (pode ser pedida a confirmação da marca).
7. **No GitHub**: `eduspruce-config.json` › cole em `googleClientId` › **Commit changes**.

### Se algo correr mal (Google)

| Erro | Causa e solução |
|---|---|
| `Erro 400: redirect_uri_mismatch` | O URI de redirecionamento não é igual ao da app (https, barra final, caminho). |
| `origin_mismatch` | Falta a origem em «Origens JavaScript autorizadas». |
| `Erro 403: access_denied` (app não verificada) | A app está em Teste e a conta não é utilizador de teste — adicione-a ou publique a app. |
| Conta do Workspace da escola bloqueada | O administrador permite a app em **admin.google.com › Segurança › Acesso e controlo de dados › Controlos de API**. |

---

## 3. O que cada professor faz (2 minutos)

1. Abre a app › **Definições › Dados e Segurança › Sincronização na Nuvem** › **OneDrive** (ou Google Drive) › **Ligar** › entra com a conta da escola.
2. Define a **palavra-passe de encriptação** (mínimo 8 caracteres) e guarda-a: sem ela ninguém consegue abrir os dados.
3. Toca em **Ligar Outro Dispositivo** e envia o link para o iPad/iPhone (AirDrop, Mail, Mensagens).
4. No iPad/iPhone: abre o link no Safari › **Partilhar › Adicionar ao ecrã principal** › abre a app pelo ícone › **Ligar** › mesma conta › **mesma palavra-passe**.

O **ícone da nuvem** na barra superior: verde sincronizado · azul alterações por enviar · amarelo renovar a ligação (tocar) · vermelho erro · cinzento sem internet.

## 4. Como funciona (resumo técnico)

- Partes separadas (definições, cada ano letivo, cada turma, auditoria, fotografias) em ficheiros `ef-*.bin` encriptados + `ef-manifest.json`.
- Alterações em partes diferentes juntam-se; a mesma parte alterada em dois aparelhos fica com a mais recente e a outra fica em *Versões guardadas de conflitos*.
- OneDrive: manifesto escrito com ETag (`If-Match`) — se dois aparelhos sincronizarem ao mesmo tempo, um repete e nada se perde.
- OAuth 2.0 (PKCE na Microsoft); pop-up no computador, redirecionamento no iPhone/iPad; renovação silenciosa (`prompt=none`) ao abrir.
- Sincroniza 20 s depois de cada alteração, ao abrir, ao sair, ao voltar à app e a cada 5 minutos.

Referências: [Microsoft — registo de SPA](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-app-registration) · [Google — gerir clientes OAuth](https://support.google.com/cloud/answer/15544987).
