#!/bin/bash
# Copia a app publicada (eduspruce.pt) para o espelho https://eduspruce.github.io/ (para redes que bloqueiam o domínio).
# Só ficheiros da app; sem código-fonte, sem dados. Uso: espelho.sh [mensagem]
set -e
SRC="$(cd "$(dirname "$0")/../.." && pwd)"; DST="${ES_ESPELHO:-$(dirname "$SRC")/eduspruce.github.io}"
[ -d "$DST/.git" ] || git clone -q --depth 1 https://github.com/EduSpruce/eduspruce.github.io.git "$DST"
cd "$DST"; git fetch -q --depth 1 origin main && git reset -q --hard origin/main
# apps independentes publicadas no mesmo site (não fazem parte da EduSpruce): nunca apagar nem substituir
MANTER="${ES_ESPELHO_MANTER:-boxdoc voa-cagarro}"
excl=(! -name .git); for m in $MANTER; do excl+=(! -name "$m"); done
find "$DST" -mindepth 1 -maxdepth 1 "${excl[@]}" -exec rm -rf {} +
cd "$SRC"
for f in index.html arquivo.html aluno.html forms.html provas.html review.html eduschedule.html horarios.html spruceit.html arena.html pulso.html sw.js versao.json manifest.webmanifest favicon.png favicon.ico 404.html eduspruce-config.json supabase-config.json privacidade.html termos.html licencas.html .nojekyll LICENSE; do [ -e "$f" ] && cp -p "$f" "$DST/"; done
git ls-files esm app icons review ajuda manual fontes licencas formularios live exam .well-known | while read -r f; do mkdir -p "$DST/$(dirname "$f")"; cp -p "$f" "$DST/$f"; done
# a extensão do Chrome (SpruceNote Web Clipper), para se poder instalar também a partir da rede da escola
[ -e extensao/sprucenote-web-clipper.zip ] && mkdir -p "$DST/extensao" && cp -p extensao/sprucenote-web-clipper.zip "$DST/extensao/"
cat > "$DST/README.md" <<'R'
# EduSpruce — espelho

Cópia da app publicada em **https://eduspruce.pt**, servida em **https://eduspruce.github.io** para redes que não deixam abrir o domínio principal.
É a mesma app e a mesma conta: os dados estão na base de dados, não neste repositório. Não editar aqui — é atualizado automaticamente a cada versão.
R
cd "$DST"; git add -A
if git diff --cached --quiet; then echo "espelho: sem alterações"; exit 0; fi
git commit -qm "${1:-Atualizar espelho} ($(cat versao.json))

Co-Authored-By: ${ES_COAUTOR:-Claude Opus 5.5 <noreply@anthropic.com>}
Claude-Session: ${CLAUDE_SESSION:-https://claude.ai/code}"
git push -q origin HEAD:main 2>&1 | grep -iv "moved\|location\|\.git$" || true
echo "espelho: $(git log --oneline -1)"
