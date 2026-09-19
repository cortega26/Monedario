#!/usr/bin/env bash
#
# Backup atomico de reddit_monitor.db (usa el comando ".backup" de sqlite3,
# seguro incluso con la DB en uso gracias a WAL) + rotacion de los ultimos
# N backups. Corre via systemd timer (ver backup-reddit-db.service/.timer).
set -euo pipefail
cd "$(dirname "$0")"

DB_FILE="reddit_monitor.db"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

if [ ! -f "$DB_FILE" ]; then
    echo "No existe $DB_FILE todavia — nada que respaldar." >&2
    exit 0
fi

mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/reddit_monitor-${STAMP}.db"

sqlite3 "$DB_FILE" ".backup '${OUT}'"
gzip "$OUT"

# Rotacion: borra backups mas viejos que RETENTION_DAYS.
find "$BACKUP_DIR" -name 'reddit_monitor-*.db.gz' -mtime "+${RETENTION_DAYS}" -delete

echo "Backup OK: ${OUT}.gz"
