#!/bin/sh
# Testes das funções da base de dados (Spruce It, Pulso…) num PostgreSQL local, sem tocar no Supabase.
#   uso: sh modern/tests/sql/correr.sh        (precisa de PostgreSQL 16 instalado; não faz parte do ./es testa)
# Cria uma base de dados nova, com imitações mínimas do que o Supabase traz (auth, storage, cron, net — stubs.sql),
# corre todos os scripts de modern/supabase/migrations pela ordem e depois cada teste *.teste.sql desta pasta.
set -e
AQUI=$(cd "$(dirname "$0")" && pwd); MIG="$AQUI/../../supabase/migrations"
B=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1); [ -n "$B" ] || { echo "PostgreSQL não instalado: testes da base de dados não corridos"; exit 0; }
D=${ES_PG_DIR:-/tmp/es-pg}; P=${ES_PG_PORTA:-54331}; U=postgres
como() { if [ "$(id -u)" = 0 ]; then su postgres -c "$1"; else sh -c "$1"; fi; }
[ "$(id -u)" = 0 ] || U=$(id -un)
if [ ! -f "$D/PG_VERSION" ]; then mkdir -p "$D"; [ "$(id -u)" = 0 ] && chown postgres "$D"; como "$B/initdb -D $D -U $U -A trust >/dev/null"; fi
como "$B/pg_ctl -D $D status >/dev/null 2>&1" || como "$B/pg_ctl -D $D -o '-p $P -c listen_addresses=127.0.0.1' -l $D/registo.log -w start >/dev/null"
Q="psql -h 127.0.0.1 -p $P -U $U -q -v ON_ERROR_STOP=1"
$Q -d postgres -c "drop database if exists es_teste" -c "create database es_teste" >/dev/null
$Q -d es_teste -f "$AQUI/stubs.sql" >/dev/null 2>&1
for f in "$MIG"/*.sql; do grep -v -i "create extension if not exists pg_cron\|create extension if not exists pg_net" "$f" | $Q -d es_teste >/dev/null 2>"$D/erro.txt" || { echo "ERRO em $(basename "$f"):"; head -5 "$D/erro.txt"; exit 1; }; done
echo "scripts da base de dados: $(ls "$MIG"/*.sql | wc -l) aplicados sem erros"
# cada teste corre numa cópia limpa
F=0; for t in "$AQUI"/*.teste.sql; do [ -f "$t" ] || continue; $Q -d postgres -c "drop database if exists es_copia" -c "create database es_copia template es_teste" >/dev/null 2>&1; if $Q -d es_copia -At -f "$t" >"$D/saida.txt" 2>"$D/erro.txt"; then tail -1 "$D/saida.txt"; else F=1; echo "FALHOU $(basename "$t"):"; grep -m3 "ERROR\|ERRO" "$D/erro.txt"; fi; done
como "$B/pg_ctl -D $D -m fast stop >/dev/null"
exit $F
