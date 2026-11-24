#!/bin/sh
# Spruce It! para iPhone e iPad, no Mac (precisa do Xcode e do Node.js).
#   sh build-ios.sh            → prepara o projeto e abre-o no Xcode (escolha a equipa em Signing & Capabilities e carregue em ▶)
set -e
cd "$(dirname "$0")"
npm install
[ -d ios ] || npx cap add ios
npx capacitor-assets generate --ios --iconBackgroundColor '#6d28d9' --splashBackgroundColor '#6d28d9'
python3 ci/ajustar.py
npx cap sync ios
npx cap open ios
