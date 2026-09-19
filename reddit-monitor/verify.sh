#!/usr/bin/env bash
#
# Verificación end-to-end del despliegue de reddit-monitor en la VM.
# Corre esto DESDE TU PC (usa tu acceso SSH ya vigente).
#
# Uso:
#   bash verify.sh
#
set -uo pipefail

VM_HOST="ubuntu@159.112.147.154"
VM_KEY="$HOME/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key"
REMOTE_DIR="/home/ubuntu/reddit-monitor"

PASS=0
FAIL=0

check() {
    local desc="$1"
    local result="$2"
    if [ "$result" = "0" ]; then
        echo "  [OK]   $desc"
        PASS=$((PASS+1))
    else
        echo "  [FAIL] $desc"
        FAIL=$((FAIL+1))
    fi
}

ssh_cmd() {
    ssh -i "$VM_KEY" -o ConnectTimeout=10 "$VM_HOST" "$1"
}

echo "== 1. Conectividad SSH =="
ssh_cmd "echo ok" >/dev/null 2>&1
check "Se puede conectar por SSH a la VM" $?

echo
echo "== 2. Archivos presentes en la VM =="
ssh_cmd "test -f $REMOTE_DIR/monitor.py"
check "monitor.py existe" $?
ssh_cmd "test -f $REMOTE_DIR/credentials.json"
check "credentials.json existe" $?
ssh_cmd "test -f $REMOTE_DIR/config.json"
check "config.json existe" $?
ssh_cmd "test -f $REMOTE_DIR/.env"
check ".env con NTFY_TOPIC existe" $?

echo
echo "== 3. credentials.json NO quedó en git (si aplica) =="
HAS_GIT="$(ssh_cmd "test -d $REMOTE_DIR/.git && echo yes || echo no")"
if [ "$HAS_GIT" = "yes" ]; then
    ssh_cmd "cd $REMOTE_DIR && ! git ls-files --error-unmatch credentials.json >/dev/null 2>&1"
    check "credentials.json no está trackeado por git" $?
else
    echo "  [--]   No hay repo git en la VM (esperado si no activaste el push) — se omite"
fi

echo
echo "== 4. Permisos de credentials.json =="
PERM="$(ssh_cmd "stat -c '%a' $REMOTE_DIR/credentials.json" 2>/dev/null)"
if [ "$PERM" = "600" ] || [ "$PERM" = "400" ]; then
    check "credentials.json con permisos restringidos ($PERM)" 0
else
    echo "  [WARN] credentials.json con permisos $PERM — recomendado: chmod 600"
fi

echo
echo "== 5. systemd timers instalados y activos =="
ssh_cmd "systemctl is-enabled reddit-monitor.timer" >/dev/null 2>&1
check "reddit-monitor.timer habilitado" $?
ssh_cmd "systemctl is-active reddit-monitor.timer" >/dev/null 2>&1
check "reddit-monitor.timer activo" $?
ssh_cmd "systemctl is-enabled reddit-weekly-report.timer" >/dev/null 2>&1
check "reddit-weekly-report.timer habilitado" $?
ssh_cmd "systemctl is-active reddit-weekly-report.timer" >/dev/null 2>&1
check "reddit-weekly-report.timer activo" $?

echo
echo "== 6. Próximas corridas programadas =="
ssh_cmd "systemctl list-timers 'reddit-*' --no-pager" 2>/dev/null

echo
echo "== 7. Última corrida del monitor: éxito y sin errores =="
LAST_STATUS="$(ssh_cmd "systemctl show reddit-monitor.service -p Result --value" 2>/dev/null)"
if [ "$LAST_STATUS" = "success" ]; then
    check "Última corrida de reddit-monitor.service = success" 0
else
    check "Última corrida de reddit-monitor.service = success (fue: $LAST_STATUS)" 1
fi

echo
echo "== 8. Output real de la última corrida (revisar a ojo) =="
ssh_cmd "journalctl -u reddit-monitor.service -n 25 --no-pager" 2>/dev/null

echo
echo "== 9. runs.log tiene una entrada reciente =="
LAST_RUN_LINE="$(ssh_cmd "tail -n1 $REMOTE_DIR/runs.log" 2>/dev/null)"
if [ -n "$LAST_RUN_LINE" ]; then
    check "runs.log tiene entradas (última: $LAST_RUN_LINE)" 0
else
    check "runs.log tiene entradas" 1
fi

echo
echo "== 10. Tests unitarios del código (por si el rsync corrompió algo) =="
ssh_cmd "cd $REMOTE_DIR && python3 -m pytest test_monitor.py -q" >/tmp/pytest_out_$$.txt 2>&1
PYTEST_RC=$?
check "python3 -m pytest test_monitor.py pasa" $PYTEST_RC
if [ $PYTEST_RC -ne 0 ]; then
    tail -n 20 /tmp/pytest_out_$$.txt
fi
rm -f /tmp/pytest_out_$$.txt

echo
echo "== 11. La app Pogo-lab/tooltician sigue sana (no la tocamos, pero confirmamos) =="
ssh_cmd "curl -fsS -o /dev/null -w '%{http_code}' http://localhost 2>/dev/null || echo 000" > /tmp/httpcode_$$.txt
HTTP_CODE="$(cat /tmp/httpcode_$$.txt)"
rm -f /tmp/httpcode_$$.txt
if [ "$HTTP_CODE" != "000" ]; then
    check "nginx/Pogo-lab responde localmente (HTTP $HTTP_CODE)" 0
else
    echo "  [--]   No se pudo chequear (puede requerir ajustar el comando a tu setup) — verifica manual si te preocupa"
fi

echo
echo "════════════════════════════════════════"
echo " Resultado: $PASS OK / $FAIL FAIL"
echo "════════════════════════════════════════"
echo
echo "Falta un chequeo manual que este script no puede hacer solo:"
echo " -> ¿Te llegó la notificación push a tu celular (ntfy) en la prueba del paso 7"
echo "    de deploy.sh, o en la corrida más reciente si hubo coincidencias nuevas?"
echo "    Si 'Sin novedades' fue el resultado, no debería haberte llegado nada —"
echo "    y eso también es correcto."

if [ $FAIL -gt 0 ]; then
    exit 1
fi
