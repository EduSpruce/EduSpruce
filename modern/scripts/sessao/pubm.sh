#!/bin/bash
# uso: pubm.sh VERSAO "nov" "cl" "commit"
SP=/tmp/es
cd /home/claude/edugest && python3 $SP/chk.py | head -3 && python3 $SP/pub.py "$1" "$2" "$3" "" "$4" 2>&1 | tail -1
cd /home/claude/eduspruce && git checkout -q modernizacao && git merge -q main -m "merge main" && git push -q origin modernizacao 2>/dev/null; git checkout -q main; git log --oneline -1; cat versao.json
/home/claude/eduspruce/modern/scripts/espelho.sh "$4" | tail -1
