# RESTORE.md — Restaurar reddit_monitor.db desde un backup (RM-012)

1. Desde tu PC trae el backup más nuevo (ver "Copia offsite" en PLAYBOOK.md).
2. `gunzip -k reddit_monitor-<STAMP>.db.gz` (conserva el .gz original).
3. `sqlite3 reddit_monitor-<STAMP>.db "PRAGMA integrity_check;"` → debe decir `ok`.
4. En la VM detén los timers: `sudo systemctl stop reddit-monitor.timer reddit-weekly-report.timer backup-reddit-db.timer`.
5. Reemplaza `/home/ubuntu/reddit-monitor/reddit_monitor.db` (+ borra `-wal`/`-shm`) o usa `sqlite3 db_actual ".recover" | sqlite3 db_nueva`.
6. Repite el `integrity_check` sobre la DB restaurada.
   Si el backup es anterior al esquema v3, migra antes de arrancar (el código falla rápido ante una versión distinta): `cd /home/ubuntu/reddit-monitor && python3 migrate_fase06_schema.py . && python3 migrate_v3_reviews.py .` (ambos idempotentes; ver "Esquema y migraciones" en PLAYBOOK.md).
7. `sudo systemctl start reddit-monitor.timer reddit-weekly-report.timer backup-reddit-db.timer`.
8. Verifica: `journalctl -u reddit-monitor.service -n 20 --no-pager` y `bash verify_fase0.sh`.
9. Si algo falla, revierte al backup anterior (conserva los últimos 14 días).
10. Anota fecha/motivo del restore en `runs.log` con una línea manual.
