#!/bin/bash
# Já não é preciso preparar nada: o fluxo é o ./es na raiz do repositório (ver CLAUDE.md).
# Fica por compatibilidade com instruções antigas: cria /tmp/es/pubm.sh, que agora chama ./es pub (número de versão automático).
R="$(cd "$(dirname "$0")/../../.." && pwd)"
mkdir -p /tmp/es
cat > /tmp/es/pubm.sh <<S
#!/bin/bash
# compatibilidade: pubm.sh VERSAO "novidades" "changelog" "mensagem"  →  ./es pub
cd "$R" && ./es pub "\$2" --cl "\$3" -m "\$4"
S
chmod +x /tmp/es/pubm.sh
echo "Fluxo novo (ver CLAUDE.md): ./es estado · ./es onde · ./es fn · ./es ver · ./es testa · ./es pub \"novidade\""
