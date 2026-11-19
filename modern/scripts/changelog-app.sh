#!/bin/bash
# Atualiza eduspruce.app/changelog/ (repositório EduSpruce/eduspruce-app) com as Novidades da versão publicada. Uso: changelog-app.sh [mensagem]
set -e
SRC="$(cd "$(dirname "$0")/../.." && pwd)"; DST="${ES_LANDING:-$(dirname "$SRC")/eduspruce-app}"
[ -d "$DST/.git" ] || git clone -q --depth 1 https://github.com/EduSpruce/eduspruce-app.git "$DST"
cd "$DST"; git fetch -q --depth 1 origin main && git reset -q --hard origin/main
node "$SRC/modern/scripts/changelog-app.mjs" "$DST" >/dev/null
git add changelog
if git diff --cached --quiet; then echo "changelog: sem alterações"; exit 0; fi
git commit -qm "Changelog: ${1:-atualizar} ($(cat "$SRC/versao.json"))

Co-Authored-By: ${ES_COAUTOR:-Claude Opus 5.5 <noreply@anthropic.com>}
Claude-Session: ${CLAUDE_SESSION:-https://claude.ai/code}"
git push -q origin HEAD:main 2>&1 | grep -iv "moved\|location\|\.git$" || true
echo "changelog: $(git log --oneline -1)"
