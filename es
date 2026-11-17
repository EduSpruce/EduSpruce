#!/bin/sh
exec python3 "$(dirname "$(readlink -f "$0")")/modern/scripts/es.py" "$@"
