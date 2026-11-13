#!/bin/bash
# Copia a app publicada (eduspruce.pt) para o espelho https://eduspruce.github.io/ (para redes que bloqueiam o domínio).
# Só ficheiros da app; sem código-fonte, sem dados. Uso: espelho.sh [mensagem]
set -e
SRC=/home/claude/eduspruce; DST=/home/claude/eduspruce.github.io
cd "$DST"; git fetch -q --depth 1 origin main && git reset -q --hard origin/main
find "$DST" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cd "$SRC"
for f in index.html arquivo.html aluno.html arena.html pulso.html sw.js versao.json manifest.webmanifest favicon.png eduspruce-config.json supabase-config.json privacidade.html termos.html .nojekyll LICENSE; do [ -e "$f" ] && cp -p "$f" "$DST/"; done
git ls-files esm icons ajuda manual | while read -r f; do mkdir -p "$DST/$(dirname "$f")"; cp -p "$f" "$DST/$f"; done
cat > "$DST/README.md" <<'R'
# EduSpruce — espelho

Cópia da app publicada em **https://eduspruce.pt**, servida em **https://eduspruce.github.io** para redes que não deixam abrir o domínio principal.
É a mesma app e a mesma conta: os dados estão na base de dados, não neste repositório. Não editar aqui — é atualizado automaticamente a cada versão.
R
cd "$DST"; git add -A
if git diff --cached --quiet; then echo "espelho: sem alterações"; exit 0; fi
git commit -qm "${1:-Atualizar espelho} ($(cat versao.json))

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015dy178Uw5yoCwPqMyhg4Ad"
git push -q origin HEAD:main 2>&1 | grep -iv "moved\|location\|\.git$" || true
echo "espelho: $(git log --oneline -1)"
