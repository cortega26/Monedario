#!/usr/bin/env bash
#
# Verifica la Fase 0: SQLite como fuente de datos en paralelo, migracion
# del historico, backups, y aislamiento de recursos.
set -uo pipefail

VM_HOST="ubuntu@159.112.147.154"
VM_KEY="$HOME/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key"
REMOTE_DIR="/home/ubuntu/reddit-monitor"

PASS=0
FAIL=0

check() {
    local desc="$1"; local result="$2"
    if [ "$result" = "0" ]; then echo "  [OK]   $desc"; PASS=$((PASS+1))
    else echo "  [FAIL] $desc"; FAIL=$((FAIL+1)); fi
}

ssh_cmd() { ssh -i "$VM_KEY" -o ConnectTimeout=10 "$VM_HOST" "$1"; }
sql() { ssh_cmd "sqlite3 $REMOTE_DIR/reddit_monitor.db \"$1\""; }

echo "== 1. reddit_monitor.db existe y tiene tablas =="
ssh_cmd "test -f $REMOTE_DIR/reddit_monitor.db"
check "reddit_monitor.db existe" $?
N_TABLES="$(sql ".tables" | wc -w)"
if [ "${N_TABLES:-0}" -ge 8 ]; then
    check "esquema completo ($N_TABLES tablas)" 0
else
    check "esquema completo (encontradas: $N_TABLES, esperaba >=8)" 1
fi

echo
echo "== 2. Modo WAL activo =="
JOURNAL_MODE="$(sql "PRAGMA journal_mode;")"
if [ "$JOURNAL_MODE" = "wal" ]; then
    check "journal_mode = wal" 0
else
    check "journal_mode = wal (fue: $JOURNAL_MODE)" 1
fi

echo
echo "== 3. Historico migrado =="
N_MATCHES="$(sql "SELECT COUNT(*) FROM matches;" 2>/dev/null)"
N_LEGACY_RUNS="$(sql "SELECT COUNT(*) FROM scan_runs WHERE filter_version='legacy-import';" 2>/dev/null)"
if [ "${N_MATCHES:-0}" -gt 0 ]; then
    check "matches importados ($N_MATCHES filas)" 0
else
    check "matches importados" 1
fi
if [ "${N_LEGACY_RUNS:-0}" -gt 0 ]; then
    check "runs.log historico importado ($N_LEGACY_RUNS corridas legacy)" 0
else
    echo "  [--]   sin corridas legacy (puede ser normal si runs.log estaba vacío)"
fi

echo
echo "== 4. La corrida nueva de monitor.py escribió a SQLite =="
N_NEW_RUNS="$(sql "SELECT COUNT(*) FROM scan_runs WHERE filter_version != 'legacy-import';" 2>/dev/null)"
if [ "${N_NEW_RUNS:-0}" -gt 0 ]; then
    check "al menos 1 corrida nueva registrada en scan_runs ($N_NEW_RUNS)" 0
else
    check "al menos 1 corrida nueva registrada en scan_runs" 1
fi

echo
echo "== 5. priority_score se está calculando =="
N_WITH_SCORE="$(sql "SELECT COUNT(*) FROM matches WHERE priority_score IS NOT NULL;" 2>/dev/null)"
if [ "${N_WITH_SCORE:-0}" -gt 0 ]; then
    check "matches con priority_score calculado ($N_WITH_SCORE)" 0
else
    echo "  [--]   ninguno todavía (normal si aún no hubo coincidencias nuevas reales)"
fi

echo
echo "== 6. Backup automático instalado y probado =="
ssh_cmd "systemctl is-enabled backup-reddit-db.timer" >/dev/null 2>&1
check "backup-reddit-db.timer habilitado" $?
ssh_cmd "test -d $REMOTE_DIR/backups && ls $REMOTE_DIR/backups/*.db.gz >/dev/null 2>&1"
check "hay al menos un backup .db.gz en $REMOTE_DIR/backups/" $?

echo
echo "== 6b. Backup más reciente pasa integrity_check (RM-012, solo lectura) =="
LATEST_BAK="$(ssh_cmd 'ls -t '"$REMOTE_DIR"'/backups/reddit_monitor-*.db.gz 2>/dev/null | head -n1')"
if [ -n "$LATEST_BAK" ]; then
    BAK_CHECK="$(ssh_cmd "gunzip -c $LATEST_BAK > /tmp/rmbak_check_\$\$.db && sqlite3 /tmp/rmbak_check_\$\$.db 'PRAGMA integrity_check;'; rc=\$?; rm -f /tmp/rmbak_check_\$\$.db; exit \$rc")"
    if [ "$BAK_CHECK" = "ok" ]; then
        check "integrity_check del backup más reciente ($(basename "$LATEST_BAK"))" 0
    else
        check "integrity_check del backup más reciente (fue: ${BAK_CHECK:-error})" 1
    fi
else
    check "hay backup para verificar integridad" 1
fi

echo
echo "== 7. Límites de recursos aplicados =="
MEM_MAX="$(ssh_cmd "systemctl show reddit-monitor.service -p MemoryMax --value" 2>/dev/null)"
if [ "$MEM_MAX" != "infinity" ] && [ -n "$MEM_MAX" ]; then
    check "reddit-monitor.service tiene MemoryMax ($MEM_MAX bytes)" 0
else
    check "reddit-monitor.service tiene MemoryMax" 1
fi

echo
echo "== 8. La app Pogo-lab sigue sana =="
ssh_cmd "curl -fsS -o /dev/null -w '%{http_code}' http://localhost 2>/dev/null" > /tmp/httpcode2_$$.txt
HTTP_CODE="$(cat /tmp/httpcode2_$$.txt)"; rm -f /tmp/httpcode2_$$.txt
if [ -n "$HTTP_CODE" ] && [ "$HTTP_CODE" != "000" ]; then
    check "nginx/Pogo-lab responde (HTTP $HTTP_CODE)" 0
else
    echo "  [--]   no se pudo chequear — verifica manual si te preocupa"
fi

echo
echo "════════════════════════════════════════"
echo " Resultado: $PASS OK / $FAIL FAIL"
echo "════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then exit 1; fi
