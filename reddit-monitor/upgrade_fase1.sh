#!/usr/bin/env bash
#
# Despliega la Fase 1: la interfaz web (FastAPI, formularios planos, sin
# JS). Requiere que la Fase 0.6 ya este aplicada (necesita reddit_monitor.db
# con el esquema completo). NO configura el subdominio publico — eso es
# un paso aparte (ver cloudflared_setup.sh), porque requiere login
# interactivo tuyo en el navegador.
#
# Corre esto DESDE TU PC.
#
# Uso:
#   cd ~/VS_Code_Projects/products/monedario/reddit-monitor
#   bash /ruta/a/upgrade_fase1.sh
#
set -euo pipefail
set -x

trap 'echo; echo "❌ FALLÓ en la línea $LINENO. Revisa el mensaje de error justo arriba."; exit 1' ERR

VM_HOST="ubuntu@159.112.147.154"
VM_KEY="$HOME/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key"
REMOTE_DIR="/home/ubuntu/reddit-monitor"
HERE="$(cd "$(dirname "$0")" && pwd)"

for f in app.py requirements-web.txt reddit-monitor-web.service \
         templates/base.html templates/queue.html templates/wikis.html templates/atendidos.html; do
    if [ ! -f "$HERE/$f" ]; then
        echo "Falta $f junto a upgrade_fase1.sh — descarga la carpeta completa." >&2
        exit 1
    fi
done

echo "== 0. Verificando que la Fase 0.6 ya este aplicada =="
ssh -i "$VM_KEY" "$VM_HOST" "sqlite3 $REMOTE_DIR/reddit_monitor.db \"SELECT 1 FROM matches LIMIT 0\"" >/dev/null 2>&1 || {
    echo "No encuentro un reddit_monitor.db con el esquema completo — corre primero upgrade_fase0.sh y upgrade_fase06.sh." >&2
    exit 1
}

echo "== 1. Contraseña para la interfaz web =="
echo "Esta contraseña protege tu cola de Reddit — que no quede en el historial de la terminal."
read -rsp "Elige una contraseña (no se muestra en pantalla): " WEB_PASSWORD
echo
if [ -z "$WEB_PASSWORD" ]; then
    echo "La contraseña no puede estar vacía." >&2
    exit 1
fi

echo "== 2. Instalando dependencias de la web (FastAPI/uvicorn) =="
scp -i "$VM_KEY" "$HERE/requirements-web.txt" "$VM_HOST:$REMOTE_DIR/"
ssh -i "$VM_KEY" "$VM_HOST" "
    python3 -m pip install -r $REMOTE_DIR/requirements-web.txt -q \$(python3 -m pip install --help | grep -q break-system-packages && echo --break-system-packages)
"

echo "== 3. Copiando la app y los templates =="
ssh -i "$VM_KEY" "$VM_HOST" "mkdir -p $REMOTE_DIR/templates"
scp -i "$VM_KEY" "$HERE/app.py" "$VM_HOST:$REMOTE_DIR/"
scp -i "$VM_KEY" "$HERE"/templates/*.html "$VM_HOST:$REMOTE_DIR/templates/"

echo "== 4. Guardando la contraseña en .env (sin pisar NTFY_TOPIC) =="
set +x # RM-002: WEB_PASSWORD se expande localmente — fuera de xtrace
ssh -i "$VM_KEY" "$VM_HOST" "
    touch $REMOTE_DIR/.env
    grep -v '^WEB_PASSWORD=' $REMOTE_DIR/.env > $REMOTE_DIR/.env.tmp || true
    mv $REMOTE_DIR/.env.tmp $REMOTE_DIR/.env
    echo 'WEB_PASSWORD=$WEB_PASSWORD' >> $REMOTE_DIR/.env
    chmod 600 $REMOTE_DIR/.env
"
set -x

echo "== 5. Instalando el servicio systemd (proceso persistente, no timer) =="
scp -i "$VM_KEY" "$HERE/reddit-monitor-web.service" "$VM_HOST:$REMOTE_DIR/"
ssh -i "$VM_KEY" "$VM_HOST" "
    sudo cp $REMOTE_DIR/reddit-monitor-web.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable --now reddit-monitor-web.service
"

echo "== 6. Prueba local (solo dentro de la VM, todavia sin dominio publico) =="
sleep 2
set +x # RM-002: WEB_PASSWORD se expande localmente — fuera de xtrace
ssh -i "$VM_KEY" "$VM_HOST" "curl -sS -o /dev/null -w 'HTTP %{http_code}\n' -u carlos:'$WEB_PASSWORD' http://127.0.0.1:8088/"
set -x
ssh -i "$VM_KEY" "$VM_HOST" "sudo systemctl status reddit-monitor-web.service --no-pager -l | head -15"

echo
echo "Fase 1 desplegada. La app corre en la VM pero SOLO es accesible desde"
echo "adentro de la VM todavía (127.0.0.1:8088) — para verla desde tu"
echo "celular/navegador falta el subdominio publico. Sigue con:"
echo "  bash cloudflared_setup.sh"
