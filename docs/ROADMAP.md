> Nota: a app chamou-se EduGest; desde então chama-se **EduFlow** (com um breve período como EduPulse, nas v0.40–0.41).

# EduFlow — Futuro da app (guardado a 01/11/2026)

## Objetivo
EduFlow em **iPad/iPhone, Mac e browser**, com versões adaptadas a cada um, mas **dados partilhados** numa nuvem do professor (**OneDrive** e **Google Drive**).

## Decisão (01/11/2026): Nível 1 — ferramenta pessoal do professor
- **Sem servidor próprio**: os dados vivem nos dispositivos do professor e numa cópia **encriptada** na nuvem dele (OneDrive ou Google Drive); não passam por terceiros.
- **Dados da escola entram por exportações do SGE** (Excel/PDF), como hoje. **Nada é escrito no SGE** (sumários, faltas e avaliação oficiais continuam a ser lançados no SGE).
- iPad, Mac e browser ficam iguais através da sincronização pela nuvem.
- Não é preciso autorização da escola; só manter os dados dos alunos protegidos (encriptação + palavra-passe).
- Postos de parte (por agora): **Nível 2** — servidor na escola a ler a base de dados (DBGEP.FDB) só para consulta, com autorização da direção/Direção Regional e do DPO; **Nível 3** — serviço para várias escolas (empresa, alojamento na UE, contratos RGPD, certificação), como a Edubox.
- Ideia a explorar: pedir à direção/Direção Regional uma API ou exportação regular do SGE (tornaria a importação automática e um eventual Nível 2 mais simples).

## Arquitetura proposta
- **Núcleo único** (o HTML/JavaScript atual): toda a lógica (avaliação, horários, sumários…). O que se faz uma vez serve os três.
- **Cascas por plataforma**
  - Browser: app web instalável (PWA), como hoje.
  - iPad/iPhone: app nativa com **Capacitor** (App Store; acesso a Ficheiros, notificações, câmara, Pencil, partilha).
  - Mac: a app de iPad em Macs Apple Silicon, ou app própria com **Tauri** (menus, atalhos, janelas).
  - Ajustes de interface por plataforma (iPhone: separadores em baixo; iPad: coluna lateral; Mac: barra de menus).

## Dados e sincronização
1. Dividir os dados por partes (ano letivo, turma, alunos, fotografias), cada uma com data de alteração.
2. Motor de sincronização: envia só o que mudou, junta alterações de vários dispositivos, só pergunta em conflitos reais.
3. Destinos: **OneDrive** (Microsoft 365 — provavelmente o principal nas escolas) e **Google Drive** (já existe; migrar para o novo formato).
4. **Encriptação no dispositivo** antes de enviar (dados de menores).
- Sem servidor próprio: os dados não passam por terceiros (RGPD e custos mais simples).

## A confirmar antes
- RGPD: preferir o OneDrive da conta da escola; falar com o DPO do agrupamento.
- Custos: Apple Developer ~99 €/ano; Microsoft (registo de app) grátis; Google pode exigir verificação da app.
- Dividir o ficheiro único em módulos antes das versões nativas (manutenção e testes).

## Ordem sugerida
1. Novo formato de dados + sincronização por partes + OneDrive (na versão web).
2. PWA completa e offline.
3. App iPad/iPhone (Capacitor, TestFlight → App Store).
4. Versão Mac.

## Quando fazer
- As **cascas nativas** (passos 3–4) podem ficar para o fim, quando as funcionalidades estiverem estáveis.
- O **formato de dados e a sincronização** (passo 1) não devem ficar para o fim: quanto mais dados reais houver (vários anos, turmas, fotos) e mais dispositivos em uso, mais trabalhosa e arriscada é a migração. Fazer antes de usar a app a sério em vários dispositivos ou com vários anos letivos.
