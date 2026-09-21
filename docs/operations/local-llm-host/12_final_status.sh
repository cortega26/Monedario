#!/usr/bin/env bash
# 12_final_status.sh — foto FINAL de solo lectura para el informe de entrega: versiones, estado de ambos servicios de usuario,
# persistencia (enabled + linger), sockets (solo loopback), ausencia de secretos en linea de comandos/unidades/journal,
# conexiones del tunel y bloqueo externo sin credenciales. NO necesita credenciales, NO cambia nada, NO reinicia nada.
# Uso:   bash "Claude outputs/12_final_status.sh"       Resultado (lo leo yo): final_status_result.txt junto a este script.
set -uo pipefail
export LC_ALL=C

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULT="$OUT_DIR/final_status_result.txt"
: > "$RESULT"
exec > >(tee -a "$RESULT") 2>&1

KEYFILE="${KEYFILE:-$HOME/.config/llama-server.key}"
LLAMA="${LLAMA_BIN:-$HOME/llama.cpp/build/bin/llama-server}"
HOST_FQDN="${HOSTNAME_FQDN:-llm.monedario.cl}"
UNITS="$HOME/.config/systemd/user"
ME="$(id -un)"
step() { printf '\n== %s ==\n' "$1"; }
has()  { command -v "$1" >/dev/null 2>&1; }
# filtro que elimina de cualquier texto las lineas que contengan la clave de llama-server (por si acaso)
nokey() { if [ -s "$KEYFILE" ]; then grep -vFf "$KEYFILE" || true; else cat; fi; }

echo "fecha: $(date '+%F %T %Z') | usuario: $ME | kernel: $(uname -sr)"

step "1. Versiones"
if [ -x "$LLAMA" ]; then echo "llama-server: $("$LLAMA" --version 2>&1 | grep -iE 'version|build' | head -2 | paste -sd' | ')"; else echo "llama-server: no encontrado en $LLAMA"; fi
has cloudflared && echo "cloudflared:  $(cloudflared --version 2>&1 | head -1)" || echo "cloudflared: no encontrado"
echo "systemd:      $(systemctl --version | head -1)"
echo "modelo:       $(ls -l "$HOME"/models/qwen3.5-35b-a3b/*.gguf 2>/dev/null | awk '{printf "%s (%d bytes) ", $NF, $5}')"

step "2. Servicios de usuario: activo / habilitado / reinicios"
for s in llama-server cloudflared-llm; do
  echo "$s: activo=$(systemctl --user is-active $s 2>&1) | habilitado=$(systemctl --user is-enabled $s 2>&1) | reinicios=$(systemctl --user show -p NRestarts --value $s 2>/dev/null) | desde: $(systemctl --user show -p ActiveEnterTimestamp --value $s 2>/dev/null)"
done
echo "linger: $(loginctl show-user "$ME" -p Linger 2>/dev/null)   (yes = arrancan tambien sin sesion abierta y tras reiniciar)"
echo; echo "-- systemctl --user status llama-server:";   systemctl --user status llama-server   --no-pager -n 0 2>&1 | head -12 | nokey
echo; echo "-- systemctl --user status cloudflared-llm:"; systemctl --user status cloudflared-llm --no-pager -n 0 2>&1 | head -12 | nokey

step "3. Exposicion: sockets en escucha de estos dos procesos (solo deben ser 127.0.0.1 / ::1)"
ss -ltnp 2>/dev/null | grep -E 'llama-server|cloudflared|:8080\b' | awk '{print $4, $6}' | nokey
echo "-- cualquier socket que escuche en 0.0.0.0 o [::] en :8080?  $(ss -ltn 2>/dev/null | awk '$4 ~ /(^0\.0\.0\.0|^\*|^\[::\]):8080$/' | wc -l) (debe ser 0)"

step "4. Secretos: ausencia en linea de comandos, unidades y journal"
PID="$(systemctl --user show -p MainPID --value llama-server 2>/dev/null)"
if [ -n "$PID" ] && [ "$PID" != "0" ] && [ -s "$KEYFILE" ]; then
  echo "clave en la linea de comandos de llama-server (PID $PID): $(tr '\0' '\n' < "/proc/$PID/cmdline" | grep -cFf "$KEYFILE" || true) (debe ser 0)"
  echo "linea de comandos efectiva: $(tr '\0' ' ' < "/proc/$PID/cmdline" | sed -E "s#--api-key-file [^ ]+#--api-key-file <archivo>#")"
fi
for f in "$UNITS/llama-server.service" "$UNITS/cloudflared-llm.service"; do
  [ -f "$f" ] && echo "$(basename "$f"): apariciones de la clave = $(grep -cFf "$KEYFILE" "$f" || true) (debe ser 0) | modo $(stat -c %a "$f")"
done
echo "archivo de clave: modo $(stat -c %a "$KEYFILE" 2>/dev/null) (debe ser 600) | dueño $(stat -c %U "$KEYFILE" 2>/dev/null)"
echo "credenciales del tunel (nombre enmascarado): $(ls -l "$HOME"/.cloudflared/*.json 2>/dev/null | awk '{print $1, $3, $5 " bytes"}' | paste -sd';')"
echo "cert.pem: modo $(stat -c %a "$HOME/.cloudflared/cert.pem" 2>/dev/null)"
echo "config.yml del tunel (sin secretos):"; sed -E 's/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/<UUID>/g' "$HOME/.cloudflared/config.yml" 2>/dev/null | sed 's/^/   /'
echo "variables de Access todavia exportadas en ESTA terminal: CF_ACCESS_CLIENT_ID=$([ -n "${CF_ACCESS_CLIENT_ID:-}" ] && echo si || echo no) CF_ACCESS_CLIENT_SECRET=$([ -n "${CF_ACCESS_CLIENT_SECRET:-}" ] && echo si || echo no)   (si 'si': unset CF_ACCESS_CLIENT_ID CF_ACCESS_CLIENT_SECRET)"

step "5. Tunel: conexiones con el borde de Cloudflare"
if has cloudflared; then
  timeout 60 cloudflared tunnel list 2>&1 | grep -E '^ID|llm-monedario' | sed -E 's/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/<UUID>/' | head -3
fi
echo "-- conexiones registradas en el journal (ultima hora):"
journalctl --user -u cloudflared-llm --since '-1 hour' --no-pager -o cat 2>/dev/null | grep -E 'Registered tunnel connection|Unregistered|Retrying|ERR' | sed -E 's/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/<UUID>/g' | tail -8 | nokey

step "6. Avisos/errores recientes (ultima hora; filtrado; solo las ultimas lineas)"
for s in llama-server cloudflared-llm; do
  echo "-- $s:"; journalctl --user -u $s --since '-1 hour' --no-pager -o cat 2>/dev/null | nokey | grep -iE 'error|ERR |fail|fatal|panic|out of memory|killed' | tail -6
  echo "   (fin)"
done

step "7. Recursos"
[ -n "$PID" ] && [ "$PID" != "0" ] && awk '/VmRSS/{printf "llama-server RSS: %.1f GB\n",$2/1048576}' "/proc/$PID/status"
uptime; free -h | head -3

step "8. Local y externo (sin credenciales: no hace falta ningun secreto)"
echo "local  GET  /health  (publico por diseno, solo 127.0.0.1): $(curl -s -o /dev/null -m 5 -w '%{http_code}' http://127.0.0.1:8080/health)"
echo "local  GET  /v1/models sin clave (esperado 401):          $(curl -s -o /dev/null -m 5 -w '%{http_code}' http://127.0.0.1:8080/v1/models)"
for p in /v1/models /health; do echo "extern GET  $p sin credenciales por $HOST_FQDN (esperado 302/401/403, nunca 200): $(curl -s -o /dev/null -m 20 -w '%{http_code}' "https://$HOST_FQDN$p")"; done
echo "extern POST /v1/chat/completions sin credenciales: $(curl -s -o /dev/null -m 20 -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "https://$HOST_FQDN/v1/chat/completions")"

step "Fin"
echo "Nada fue modificado. NO ejecutado aqui: prueba de reinicio del equipo (ver instrucciones del informe)."
