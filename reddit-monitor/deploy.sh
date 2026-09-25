#!/usr/bin/env bash
#
# Corre esto DESDE TU PC (no desde Claude) — la VM solo acepta SSH desde
# tu IP actual según el Security List de OCI, y por eso Claude no pudo
# conectarse directo desde su sandbox en la nube (timeout en el puerto 22).
#
# Uso:
#   cd ~/VS_Code_Projects/products/monedario/reddit-monitor
#   bash /ruta/a/deploy.sh
#
set -euo pipefail
set -x   # <- traza cada comando; si algo falla, verás EXACTAMENTE dónde

trap 'echo; echo "❌ FALLÓ en la línea $LINENO. Revisa el mensaje de error justo arriba."; exit 1' ERR

VM_HOST="ubuntu@159.112.147.154"
VM_KEY="$HOME/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key"
REMOTE_DIR="/home/ubuntu/reddit-monitor"
LOCAL_DIR="$(pwd)"

if [ ! -f "$VM_KEY" ]; then
    echo "No encuentro la llave SSH en $VM_KEY — ajusta VM_KEY al inicio del script." >&2
    exit 1
fi
chmod 600 "$VM_KEY" 2>/dev/null || true

if [ ! -f "$LOCAL_DIR/monitor.py" ]; then
    echo "Corre este script desde la carpeta reddit-monitor (no se encontró monitor.py aquí)." >&2
    echo "Ejemplo: cd ~/VS_Code_Projects/products/monedario/reddit-monitor && bash /ruta/a/deploy.sh" >&2
    exit 1
fi

if [ ! -f "$LOCAL_DIR/credentials.json" ]; then
    echo "No hay credentials.json en $LOCAL_DIR — no puedo continuar sin él." >&2
    exit 1
fi

for f in run_monitor.sh run_weekly_report.sh reddit-monitor.service reddit-monitor.timer \
         reddit-weekly-report.service reddit-weekly-report.timer; do
    if [ ! -f "$(dirname "$0")/$f" ]; then
        echo "Falta $f junto a deploy.sh — descarga la carpeta completa, no solo este script." >&2
        exit 1
    fi
done

echo "== 1. Creando carpeta remota =="
ssh -i "$VM_KEY" "$VM_HOST" "mkdir -p $REMOTE_DIR"

echo "== 2. Copiando código y estado (sin credentials.json) =="
rsync -avz --exclude credentials.json --exclude __pycache__ --exclude '.pytest_cache' \
    -e "ssh -i $VM_KEY" \
    "$LOCAL_DIR"/ "$VM_HOST:$REMOTE_DIR/"

echo "== 3. Copiando credentials.json por separado =="
scp -i "$VM_KEY" "$LOCAL_DIR/credentials.json" "$VM_HOST:$REMOTE_DIR/credentials.json"

echo "== 4. Copiando los archivos de despliegue (wrapper + systemd) =="
scp -i "$VM_KEY" \
    "$(dirname "$0")/run_monitor.sh" \
    "$(dirname "$0")/run_weekly_report.sh" \
    "$(dirname "$0")/reddit-monitor.service" \
    "$(dirname "$0")/reddit-monitor.timer" \
    "$(dirname "$0")/reddit-monitor-web.service" \
    "$(dirname "$0")/reddit-weekly-report.service" \
    "$(dirname "$0")/reddit-weekly-report.timer" \
    "$(dirname "$0")/reddit-assist.service" \
    "$(dirname "$0")/reddit-assist.timer" \
    "$VM_HOST:$REMOTE_DIR/"

echo "== 5. Preguntando tu topic de ntfy.sh =="
read -rp "Topic ntfy.sh a usar (ej: monedario-reddit-$(openssl rand -hex 4) — recomendado, no lo compartas): " NTFY_TOPIC
set +x # RM-002: NTFY_TOPIC es secreto — fuera de xtrace y sin eco del valor
# Actualiza SOLO NTFY_TOPIC: el .env remoto puede traer WEB_PASSWORD u otras
# claves, y un `cat >` las borraba (la app quedaba sin auth).
ssh -i "$VM_KEY" "$VM_HOST" bash -s <<REMOTE
set -e
touch "$REMOTE_DIR/.env"
chmod 600 "$REMOTE_DIR/.env"
grep -v '^NTFY_TOPIC=' "$REMOTE_DIR/.env" > "$REMOTE_DIR/.env.tmp" || true
printf 'NTFY_TOPIC=%s\n' "$NTFY_TOPIC" >> "$REMOTE_DIR/.env.tmp"
mv "$REMOTE_DIR/.env.tmp" "$REMOTE_DIR/.env"
chmod 600 "$REMOTE_DIR/.env"
REMOTE
echo "Topic guardado en el .env remoto (modo 600, claves previas preservadas). Suscríbete en la app ntfy con el topic que escribiste (no se muestra aquí por seguridad)."
set -x

echo "== 6. Permisos e instalación de systemd =="
ssh -i "$VM_KEY" "$VM_HOST" "
    chmod +x $REMOTE_DIR/run_monitor.sh $REMOTE_DIR/run_weekly_report.sh
    sudo cp $REMOTE_DIR/reddit-monitor.service $REMOTE_DIR/reddit-monitor.timer \
           $REMOTE_DIR/reddit-monitor-web.service \
           $REMOTE_DIR/reddit-weekly-report.service $REMOTE_DIR/reddit-weekly-report.timer \
           $REMOTE_DIR/reddit-assist.service $REMOTE_DIR/reddit-assist.timer \
           /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable --now reddit-monitor.timer
    sudo systemctl enable --now reddit-weekly-report.timer
    # La interfaz web (siembra/modmail/cola): se reinicia para tomar el código
    # nuevo; el contenido de seed_content.py se importa solo al arrancar.
    sudo systemctl enable --now reddit-monitor-web.service
    sudo systemctl restart reddit-monitor-web.service
    # reddit-assist.timer NO se activa aqui: necesita ANTHROPIC_API_KEY en .env
    # (ver PLAYBOOK, seccion \"Asistente IA\").
"

echo "== 7. Prueba inmediata =="
ssh -i "$VM_KEY" "$VM_HOST" "sudo systemctl start reddit-monitor.service && sleep 2 && sudo journalctl -u reddit-monitor.service -n 40 --no-pager"

echo "== 8. Chequeo del servicio web =="
ssh -i "$VM_KEY" "$VM_HOST" "sudo systemctl is-active reddit-monitor-web.service"

echo
echo "Listo. Deberías haber visto el output de monitor.py arriba y, si hubo"
echo "coincidencias nuevas, una notificación en tu celular vía ntfy en unos segundos."
echo
echo "Interfaz web (Basic Auth, usuario carlos):"
echo "  Cola:     https://reddit.monedario.cl/"
echo "  Siembra:  https://reddit.monedario.cl/siembra   ← borradores + UTM, un clic copia y abre"
echo "  Modmail:  https://reddit.monedario.cl/modmail   ← solicitudes de wiki"
echo
echo "Para revisar logs después:"
echo "  ssh -i $VM_KEY $VM_HOST 'journalctl -u reddit-monitor-web.service -n 50 --no-pager'"
