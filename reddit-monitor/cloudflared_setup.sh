#!/usr/bin/env bash
#
# Expone la interfaz web (Fase 1) en https://reddit.monedario.cl via
# Cloudflare Tunnel — sin abrir NINGUN puerto nuevo en la VM ni tocar el
# Security List de OCI. Requiere que upgrade_fase1.sh ya haya corrido.
#
# Tiene UN paso interactivo (el login de Cloudflare) que te va a pedir
# abrir una URL en tu navegador y autorizar ahi — el script espera a que
# lo hagas, no hace falta partirlo en dos.
#
# Corre esto DESDE TU PC.
#
set -euo pipefail
set -x

trap 'echo; echo "❌ FALLÓ en la línea $LINENO. Revisa el mensaje de error justo arriba."; exit 1' ERR

VM_HOST="ubuntu@159.112.147.154"
VM_KEY="$HOME/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key"
REMOTE_DIR="/home/ubuntu/reddit-monitor"
HOSTNAME_PUBLICA="reddit.monedario.cl"
TUNNEL_NAME="reddit-monitor"

echo "== 0. Verificando que la Fase 1 ya este corriendo =="
set +x # RM-002: el grep expone WEB_PASSWORD en el lado remoto — fuera de xtrace
ssh -i "$VM_KEY" "$VM_HOST" "curl -sf -o /dev/null http://127.0.0.1:8088/ -u carlos:\$(grep WEB_PASSWORD $REMOTE_DIR/.env | cut -d= -f2-)" || {
    echo "La app web no responde en el puerto 8088 — corre primero upgrade_fase1.sh." >&2
    exit 1
}
set -x

echo "== 1. Instalando cloudflared (si no esta) =="
ssh -i "$VM_KEY" "$VM_HOST" "
    if ! command -v cloudflared >/dev/null 2>&1; then
        curl -L --output /tmp/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
        chmod +x /tmp/cloudflared
        sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
    fi
    cloudflared --version
"

echo "== 2. Login en Cloudflare (PASO INTERACTIVO) =="
echo ""
echo ">>> En unos segundos va a aparecer una URL de cloudflare.com."
echo ">>> Ábrela en tu navegador, elige la cuenta/zona de monedario.cl,"
echo ">>> y autoriza. El script espera a que termines."
echo ""
ssh -t -i "$VM_KEY" "$VM_HOST" "
    if [ ! -f ~/.cloudflared/cert.pem ]; then
        cloudflared tunnel login
    else
        echo 'Ya habia un login previo (~/.cloudflared/cert.pem existe) — se reusa.'
    fi
"

echo "== 3. Creando el tunnel (si no existe) =="
ssh -i "$VM_KEY" "$VM_HOST" "
    cloudflared tunnel list | grep -q '$TUNNEL_NAME' || cloudflared tunnel create $TUNNEL_NAME
"

TUNNEL_ID="$(ssh -i "$VM_KEY" "$VM_HOST" "cloudflared tunnel list | awk '\$2==\"$TUNNEL_NAME\" {print \$1}'")"
echo "Tunnel ID: $TUNNEL_ID"
if [ -z "$TUNNEL_ID" ]; then
    echo "No pude determinar el ID del tunnel — revisa 'cloudflared tunnel list' a mano en la VM." >&2
    exit 1
fi

echo "== 4. Configurando el tunnel (ingress -> localhost:8088) =="
ssh -i "$VM_KEY" "$VM_HOST" "
    sudo mkdir -p /etc/cloudflared
    sudo cp ~/.cloudflared/${TUNNEL_ID}.json /etc/cloudflared/
    sudo tee /etc/cloudflared/config.yml > /dev/null << EOF
tunnel: ${TUNNEL_ID}
credentials-file: /etc/cloudflared/${TUNNEL_ID}.json
ingress:
  - hostname: ${HOSTNAME_PUBLICA}
    service: http://localhost:8088
  - service: http_status:404
EOF
"

echo "== 5. Creando el registro DNS en Cloudflare (CNAME automatico) =="
ssh -i "$VM_KEY" "$VM_HOST" "cloudflared tunnel route dns $TUNNEL_NAME $HOSTNAME_PUBLICA" || \
    echo "aviso: puede que el registro ya exista de un intento anterior — seguimos."

echo "== 6. Instalando cloudflared como servicio systemd =="
ssh -i "$VM_KEY" "$VM_HOST" "
    sudo cloudflared service install || true
    sudo systemctl enable --now cloudflared
    sleep 2
    sudo systemctl status cloudflared --no-pager -l | head -15
"

echo
echo "Listo. En 1-2 minutos deberías poder abrir:"
echo "  https://${HOSTNAME_PUBLICA}"
echo "desde tu navegador o celular, con el usuario 'carlos' y la contraseña"
echo "que elegiste en upgrade_fase1.sh."
