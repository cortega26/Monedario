#!/usr/bin/env bash
#
# Aplica la Fase 0 (datos) sobre el reddit-monitor que YA esta corriendo en
# la VM: agrega SQLite como fuente de datos (en paralelo al Markdown, que
# se mantiene sin cambios), migra el historico existente, instala backups
# automaticos, y aisla los servicios de Pogo-lab con limites de recursos.
#
# No reemplaza a deploy.sh — es un upgrade incremental sobre un despliegue
# que ya funciona. Corre esto DESDE TU PC.
#
# Uso:
#   cd ~/VS_Code_Projects/products/monedario/reddit-monitor
#   bash /ruta/a/upgrade_fase0.sh
#
set -euo pipefail
set -x

trap 'echo; echo "❌ FALLÓ en la línea $LINENO. Revisa el mensaje de error justo arriba."; exit 1' ERR

VM_HOST="ubuntu@159.112.147.154"
VM_KEY="$HOME/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key"
REMOTE_DIR="/home/ubuntu/reddit-monitor"
HERE="$(cd "$(dirname "$0")" && pwd)"

for f in schema.sql db.py migrate_history.py backup_db.sh \
         backup-reddit-db.service backup-reddit-db.timer \
         reddit-monitor.service reddit-weekly-report.service monitor.py; do
    if [ ! -f "$HERE/$f" ]; then
        echo "Falta $f junto a upgrade_fase0.sh — descarga la carpeta completa." >&2
        exit 1
    fi
done

echo "== 0. Verificando que sqlite3 este instalado en la VM =="
ssh -i "$VM_KEY" "$VM_HOST" "command -v sqlite3 >/dev/null 2>&1 || sudo apt-get update -qq && sudo apt-get install -y sqlite3"

echo "== 1. Copiando archivos de la Fase 0 (schema, db.py, migracion, backups) =="
scp -i "$VM_KEY" \
    "$HERE/schema.sql" \
    "$HERE/db.py" \
    "$HERE/migrate_history.py" \
    "$HERE/backup_db.sh" \
    "$VM_HOST:$REMOTE_DIR/"

echo "== 2. Reemplazando monitor.py por la version que escribe a SQLite =="
# Backup del monitor.py anterior por si hay que revertir.
ssh -i "$VM_KEY" "$VM_HOST" "cp $REMOTE_DIR/monitor.py $REMOTE_DIR/monitor.py.pre-fase0.bak"
scp -i "$VM_KEY" "$HERE/monitor.py" "$VM_HOST:$REMOTE_DIR/monitor.py"

echo "== 3. Migrando el historico existente a SQLite (idempotente) =="
ssh -i "$VM_KEY" "$VM_HOST" "cd $REMOTE_DIR && python3 migrate_history.py ."

echo "== 4. Instalando backup automatico (04:00 todos los dias, retiene 14 dias) =="
scp -i "$VM_KEY" \
    "$HERE/backup-reddit-db.service" \
    "$HERE/backup-reddit-db.timer" \
    "$VM_HOST:$REMOTE_DIR/"
ssh -i "$VM_KEY" "$VM_HOST" "
    chmod +x $REMOTE_DIR/backup_db.sh
    sudo cp $REMOTE_DIR/backup-reddit-db.service $REMOTE_DIR/backup-reddit-db.timer /etc/systemd/system/
"

echo "== 5. Actualizando los servicios existentes con limites de recursos =="
scp -i "$VM_KEY" \
    "$HERE/reddit-monitor.service" \
    "$HERE/reddit-weekly-report.service" \
    "$VM_HOST:$REMOTE_DIR/"
ssh -i "$VM_KEY" "$VM_HOST" "
    sudo cp $REMOTE_DIR/reddit-monitor.service $REMOTE_DIR/reddit-weekly-report.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable --now backup-reddit-db.timer
"

echo "== 6. Corrida de prueba con el monitor.py nuevo =="
ssh -i "$VM_KEY" "$VM_HOST" "sudo systemctl start reddit-monitor.service && sleep 2 && sudo journalctl -u reddit-monitor.service -n 30 --no-pager"

echo "== 7. Backup de prueba inmediato =="
ssh -i "$VM_KEY" "$VM_HOST" "sudo systemctl start backup-reddit-db.service && sudo journalctl -u backup-reddit-db.service -n 10 --no-pager"

echo
echo "Fase 0 aplicada. Corre verify_fase0.sh para confirmar que todo quedó bien."
