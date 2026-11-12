#!/bin/bash
# Prepara uma sessão nova do Claude para trabalhar na EduSpruce (o ambiente da nuvem é temporário).
#   1) clonar:  git clone https://github.com/EduSpruce/eduspruce.git /home/claude/eduspruce
#               git clone https://github.com/EduSpruce/eduspruce.github.io.git /home/claude/eduspruce.github.io
#   2) correr:  bash /home/claude/eduspruce/modern/scripts/sessao/preparar.sh
# Recria /home/claude/edugest/index.html (fonte) a partir dos módulos modern/src/app (cópia byte a byte) e os scripts de publicação em /tmp/es.
set -e
R=/home/claude/eduspruce; mkdir -p /home/claude/edugest/web /tmp/es/eduspruce-app/app
python3 $R/modern/scripts/partir.py juntar $R/modern/src/app /home/claude/edugest/index.html
cp $R/docs/ESPECIFICACAO.md $R/docs/FORMATO_DADOS.md /home/claude/edugest/ 2>/dev/null || true
cp $R/modern/scripts/sessao/pub.py $R/modern/scripts/sessao/chk.py $R/modern/scripts/sessao/pubm.sh /tmp/es/ && chmod +x /tmp/es/pubm.sh
python3 /tmp/es/chk.py
echo "Pronto. Publicar: /tmp/es/pubm.sh 0.9XX \"novidade1|novidade2\" \"changelog\" \"mensagem do commit\""
