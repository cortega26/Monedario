#!/usr/bin/env bash
#
# Verifica la Fase 1: la app web corriendo, y (si ya corriste
# cloudflared_setup.sh) el subdominio publico respondiendo de verdad.
set -uo pipefail

VM_HOST="ubuntu@159.112.147.154"
VM_KEY="$HOME/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key"
REMOTE_DIR="/home/ubuntu/reddit-monitor"
HOSTNAME_PUBLICA="reddit.monedario.cl"

PASS=0
FAIL=0
check() {
    local desc="$1"; local result="$2"
    if [ "$result" = "0" ]; then echo "  [OK]   $desc"; PASS=$((PASS+1))
    else echo "  [FAIL] $desc"; FAIL=$((FAIL+1)); fi
}
ssh_cmd() { ssh -i "$VM_KEY" -o ConnectTimeout=10 "$VM_HOST" "$1"; }

echo "== 1. Servicio web activo =="
ssh_cmd "systemctl is-active reddit-monitor-web.service" >/dev/null 2>&1
check "reddit-monitor-web.service activo" $?
ssh_cmd "systemctl is-enabled reddit-monitor-web.service" >/dev/null 2>&1
check "reddit-monitor-web.service habilitado (sobrevive reinicios)" $?

echo
echo "== 2. WEB_PASSWORD configurada =="
HAS_PASS="$(ssh_cmd "grep -c '^WEB_PASSWORD=' $REMOTE_DIR/.env" 2>/dev/null)"
check "WEB_PASSWORD presente en .env" $([ "${HAS_PASS:-0}" -gt 0 ] && echo 0 || echo 1)

echo
echo "== 3. App responde localmente en la VM (con auth) =="
# RM-002: WEB_PASSWORD nunca se expande localmente (no aparece en argv/ps);
# grep + curl corren en una sola invocación remota, leyendo el .env modo 600.
LOCAL_CODE="$(ssh_cmd "WEB_PASS=\$(grep '^WEB_PASSWORD=' $REMOTE_DIR/.env | cut -d= -f2-); curl -sS -o /dev/null -w '%{http_code}' -u \"carlos:\$WEB_PASS\" http://127.0.0.1:8088/" 2>/dev/null)"
check "http://127.0.0.1:8088/ responde 200 (fue: $LOCAL_CODE)" $([ "$LOCAL_CODE" = "200" ] && echo 0 || echo 1)

echo
echo "== 4. cloudflared instalado y corriendo =="
ssh_cmd "command -v cloudflared" >/dev/null 2>&1
if [ $? -eq 0 ]; then
    check "cloudflared instalado" 0
    ssh_cmd "systemctl is-active cloudflared" >/dev/null 2>&1
    check "servicio cloudflared activo" $?
else
    echo "  [--]   cloudflared no instalado todavía — corre cloudflared_setup.sh"
fi

echo
echo "== 5. El subdominio público responde (desde tu PC, no desde la VM) =="
PUBLIC_CODE="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "https://${HOSTNAME_PUBLICA}/" 2>/dev/null)"
if [ "$PUBLIC_CODE" = "401" ]; then
    check "https://${HOSTNAME_PUBLICA}/ responde (401 = pide contraseña, correcto)" 0
elif [ -n "$PUBLIC_CODE" ] && [ "$PUBLIC_CODE" != "000" ]; then
    echo "  [WARN] https://${HOSTNAME_PUBLICA}/ respondió HTTP $PUBLIC_CODE (esperaba 401 pidiendo auth)"
else
    echo "  [--]   no responde todavía — normal si el DNS recién se creó (puede tardar 1-2 min) o si aún no corriste cloudflared_setup.sh"
fi

echo
echo "== 6. La app Pogo-lab sigue sana =="
HTTP_CODE="$(ssh_cmd "curl -fsS -o /dev/null -w '%{http_code}' http://localhost 2>/dev/null")"
if [ -n "$HTTP_CODE" ] && [ "$HTTP_CODE" != "000" ]; then check "nginx/Pogo-lab responde (HTTP $HTTP_CODE)" 0
else echo "  [--]   no se pudo chequear"; fi

echo
echo "════════════════════════════════════════"
echo " Resultado: $PASS OK / $FAIL FAIL"
echo "════════════════════════════════════════"
[ $FAIL -gt 0 ] && exit 1 || exit 0
