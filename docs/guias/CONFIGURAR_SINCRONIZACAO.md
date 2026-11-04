# Configurar a sincronização (OneDrive ou Google Drive)

A sincronização exige que a app esteja num endereço **https** (ver `PUBLICAR_GITHUB_PAGES.md`).

## OneDrive / Microsoft 365
1. Entre no [portal do Azure](https://portal.azure.com) com a conta da escola (ou peça ao administrador informático).
2. **Microsoft Entra ID › Registos de aplicações › Novo registo**
   - Nome: `EduFlow`
   - Tipos de conta: *Contas apenas neste diretório organizacional* (ou *qualquer diretório*, se vários agrupamentos o usarem)
   - URI de redirecionamento: **Single-page application (SPA)** → o endereço https da app, exatamente como aparece no navegador
3. **Permissões de API › Adicionar › Microsoft Graph › Permissões delegadas**: `User.Read` e `Files.ReadWrite.AppFolder`. Se a escola o exigir, peça o consentimento de administrador.
4. Copie o **ID da aplicação (cliente)** e o **ID do diretório (inquilino)**.
5. Na app: **Definições › Conta e Acesso › Microsoft 365** — cole os dois IDs.
6. No ecrã de entrada passa a aparecer **Entrar com Microsoft 365**; na primeira vez, defina a **palavra-passe de cifragem**.

Os dados ficam no OneDrive em *Aplicações › EduFlow*, cifrados.

## Google Drive
1. Na [Google Cloud Console](https://console.cloud.google.com) crie um projeto (`EduFlow`).
2. **APIs e serviços › Biblioteca** › ative a **Google Drive API**.
3. **Ecrã de consentimento OAuth**: tipo *Interno* (Google Workspace da escola) ou *Externo*; acrescente o âmbito `.../auth/drive.appdata`.
4. **Credenciais › Criar › ID de cliente OAuth › Aplicação Web** — em *Origens JavaScript autorizadas*, o endereço https da app (sem a parte do caminho).
5. Na app, em **Definições › Dados e Segurança**, indique o ID do cliente no cartão da nuvem e ligue.

## Em cada dispositivo
Entre com a **mesma conta** e use a **mesma palavra-passe de cifragem**. A app sincroniza ao abrir, ao guardar e periodicamente; alterações feitas em dois dispositivos ao mesmo tempo são fundidas e os conflitos ficam guardados para rever.

> As evidências (fotografias e áudio) não são sincronizadas: ficam no dispositivo onde foram registadas.
