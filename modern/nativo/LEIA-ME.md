# Spruce It! — apps para iOS e Android

App própria do Spruce It! (aspeto original, roxo e amarelo): os alunos entram nos jogos e nos estudos com o **código** ou lendo o **QR** com a câmara; o botão «Sou professor» abre a EduSpruce no navegador do sistema (o «Entrar com Google» não funciona dentro de apps). Se a rede da escola bloquear eduspruce.pt, a app usa o espelho eduspruce.github.io. Ligações `spruceit://jogo/ABC123` abrem a app.

## Obter as apps
- **Automático (GitHub Actions)** — sempre que `modern/nativo` muda, ou em *Actions › Apps móveis (Spruce It!) › Run workflow*:
  - Android: `app-debug.apk` (instala-se diretamente no telemóvel, com «instalar apps desconhecidas»). Com os segredos `ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASS`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASS`, sai também `spruce-it.apk` e `app-release.aab` assinados para a Google Play.
  - iOS: compilação para o simulador (prova que compila). Para iPhone é preciso assinar com uma conta Apple Developer.
- **No Mac**: `sh modern/nativo/build-ios.sh` abre o projeto no Xcode → *Signing & Capabilities* → equipa → ▶ (iPhone ligado) ou *Product › Archive* (App Store / TestFlight).
- **Android no computador**: `sh modern/nativo/build-android.sh`.

## Publicar nas lojas (o que falta, fora do código)
- Google Play: conta de programador (25 USD, uma vez), chave de assinatura (segredos acima), ficha da app, política de privacidade (`https://eduspruce.pt/privacidade.html`).
- App Store: Apple Developer Program (99 USD/ano), identificador `app.eduspruce.spruceit`, ícones (gerados de `assets/`), capturas de ecrã.
