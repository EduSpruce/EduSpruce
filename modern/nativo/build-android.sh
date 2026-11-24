#!/bin/sh
# Spruce It! para Android (precisa do Node.js e do Android Studio ou do JDK 21 + Android SDK).
#   sh build-android.sh        → gera app/build/outputs/apk/debug/app-debug.apk (instala-se diretamente no telemóvel)
set -e
cd "$(dirname "$0")"
npm install
[ -d android ] || npx cap add android
npx capacitor-assets generate --android --iconBackgroundColor '#6d28d9' --splashBackgroundColor '#6d28d9'
python3 ci/ajustar.py
npx cap sync android
cd android && ./gradlew assembleDebug && echo "APK: $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
