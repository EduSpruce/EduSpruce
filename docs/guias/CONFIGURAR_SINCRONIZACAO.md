# Configurar a sincronização (uma vez, por quem aloja a app)

A sincronização deixa cada professor usar a EduSpruce no computador, no iPad e no iPhone com os mesmos dados.
Os dados são **encriptados no dispositivo** (AES-256, com uma palavra-passe que só o professor conhece) e ficam
na **pasta privada da app** no OneDrive ou no Google Drive **do próprio professor**. Nada passa por servidores da EduSpruce.

Para que os professores só tenham de "entrar com a conta", quem aloja a app regista **uma vez** a aplicação na
Microsoft (e, se quiser, na Google) e escreve os IDs no ficheiro `eduspruce-config.json`, na raiz do site.

```json
{
  "microsoftClientId": "00000000-0000-0000-0000-000000000000",
  "googleClientId": ""
}
```

> Recomendação: use o **OneDrive** (contas Microsoft 365 das escolas). A ligação dura um dia inteiro e renova-se sozinha
> ao abrir a app. Com a Google, a ligação dura 1 hora e, no iPhone/iPad, pode pedir um toque para renovar.

---

## 1. Microsoft (OneDrive) — 10 minutos, grátis

1. Entre em **portal.azure.com** com uma conta Microsoft (pode ser pessoal) › **Microsoft Entra ID** › **Registos de aplicações** › **Novo registo**.
2. **Nome:** EduSpruce.
3. **Tipos de conta suportados:** *Contas em qualquer diretório organizacional e contas Microsoft pessoais*.
4. **URI de redirecionamento:** plataforma **Aplicação de página única (SPA)** com o endereço exato da app, **com a barra final**:
   - `https://<utilizador>.github.io/eduspruce/`
   - e, se tiver domínio próprio, adicione também `https://eduspruce.app/` (em *Autenticação › Adicionar URI*).
5. **Permissões de API** › Adicionar › Microsoft Graph › **Permissões delegadas**: `Files.ReadWrite.AppFolder`, `User.Read`, `offline_access`.
6. Copie o **ID da aplicação (cliente)** (página *Descrição geral*) para `microsoftClientId` no `eduspruce-config.json`.
7. No GitHub, abra o ficheiro `eduspruce-config.json` › lápis (Editar) › cole o ID › **Commit changes**. Em 1 minuto está ativo.

**Contas da escola:** algumas escolas não deixam os utilizadores aprovar apps sozinhos. Se aparecer
*"Precisa de aprovação do administrador"*, peça ao administrador do Microsoft 365 da escola/agrupamento para
**conceder consentimento** à app EduSpruce (uma vez, para todos). A permissão `Files.ReadWrite.AppFolder` só dá
acesso à pasta *Aplicações › EduFlow* de cada professor — não aos outros ficheiros.

## 2. Google (Drive) — opcional

1. **console.cloud.google.com** › criar projeto › **APIs e serviços** › ativar **Google Drive API**.
2. **Ecrã de consentimento OAuth:** tipo *Externo*; âmbitos `drive.appdata` e `userinfo.email`.
   Em modo *Teste* só funciona para até 100 utilizadores de teste (tem de os adicionar); para mais, publique a app
   (a Google pode pedir verificação).
3. **Credenciais** › Criar **ID de cliente OAuth** › *Aplicação Web*:
   - **Origens JavaScript autorizadas:** `https://<utilizador>.github.io` (e `https://eduspruce.app`, se aplicável).
   - **URIs de redirecionamento autorizados:** `https://<utilizador>.github.io/eduspruce/` (e `https://eduspruce.app/`).
4. Copie o ID de cliente para `googleClientId` no `eduspruce-config.json`.

---

## 3. O que cada professor faz (2 minutos)

1. Abre a app › **Definições › Dados e Segurança › Sincronização na Nuvem** › escolhe **OneDrive** › **Ligar ao OneDrive** › entra com a conta da escola.
2. Define a **palavra-passe de encriptação** (mínimo 8 caracteres) — e guarda-a: sem ela ninguém consegue abrir os dados.
3. Toca em **Ligar Outro Dispositivo** e envia o link para o iPad/iPhone (AirDrop, Mail, Mensagens).
4. No iPad/iPhone: abre o link no Safari › **Partilhar › Adicionar ao ecrã principal** › abre a app pelo ícone ›
   **Ligar ao OneDrive** › mesma conta › **mesma palavra-passe**. Os dados aparecem em segundos.

O **ícone da nuvem** na barra superior mostra o estado: verde (sincronizado), azul (alterações por enviar),
amarelo (ligação a renovar — tocar), vermelho (erro), cinzento (sem internet; envia quando a rede voltar).

## 4. Como funciona (resumo técnico)

- Dados divididos por partes (definições, cada ano letivo, cada turma, auditoria, fotografias), cada uma num ficheiro `ef-*.bin` encriptado; um `ef-manifest.json` lista as versões.
- Alterações em partes diferentes juntam-se; a mesma parte alterada em dois aparelhos fica com a mais recente e a outra é guardada em *Versões guardadas de conflitos* (pode repor-se).
- O manifesto no OneDrive é escrito com **ETag** (`If-Match`): se dois aparelhos sincronizarem ao mesmo tempo, um repete e nada se perde.
- Início de sessão OAuth 2.0 com PKCE; por pop-up no computador e por redirecionamento no iPhone/iPad. A Microsoft limita a 24 h a sessão de apps web: a app renova sozinha (`prompt=none`) ao abrir.
- Sincroniza 20 s depois de cada alteração, ao abrir, ao sair, ao voltar à app e a cada 5 minutos.
