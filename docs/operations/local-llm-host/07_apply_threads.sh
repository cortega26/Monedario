#!/usr/bin/env bash
# 07_apply_threads.sh — aplica hilos (-t decodificacion, -tb prefill) y afinidad a nucleos P en la unidad de llama-server,
# reinicia el servicio y RE-MIDE el hilo largo con el mismo cliente del paso 3 para comparar con lo anterior.
# Solo modifica ~/.config/systemd/user/llama-server.service (con backup) y reinicia ese servicio de usuario. Sin sudo.
# Uso:   bash "Claude outputs/07_apply_threads.sh"
# Valores por defecto (los que recomiendo segun 06_bench_threads): T=6 TB=12 AFF=0-11
# Otras opciones, por ejemplo: T=12 TB=12 bash ...   |   AFF= bash ...  (sin afinidad)   |   RUN_LATENCY=0 bash ...
# Reversion: el backup queda como llama-server.service.bak-<fecha>; cópialo de vuelta, luego
#   systemctl --user daemon-reload && systemctl --user restart llama-server
set -uo pipefail
export LC_ALL=C

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULT="$OUT_DIR/tuning_result.txt"
: > "$RESULT"
exec > >(tee -a "$RESULT") 2>&1

BIN="${LLAMA_BIN:-$HOME/llama.cpp/build/bin/llama-server}"
UNIT="${UNIT:-$HOME/.config/systemd/user/llama-server.service}"
PORT="${PORT:-8080}"
T="${T:-6}"; TB="${TB:-12}"
AFF="${AFF-0-11}"
RUN_LATENCY="${RUN_LATENCY:-1}"

step() { printf '\n== %s ==\n' "$1"; }
die()  { echo "ERROR: $*"; exit 1; }

step "Comprobaciones previas"
[ -f "$UNIT" ] || die "no existe $UNIT (¿corrio 04_setup_llama_service.sh?)"
[[ "$T" =~ ^[0-9]+$ && "$TB" =~ ^[0-9]+$ ]] || die "T y TB deben ser enteros"
if [ -n "$AFF" ]; then [[ "$AFF" =~ ^[0-9,-]+$ ]] || die "AFF debe ser una lista de CPU tipo 0-11"; fi
HELP="$("$BIN" --help 2>&1 || true)"
for f in -t -tb --no-webui; do
  grep -qE -- "(^|[[:space:],])${f}([[:space:],]|\$)" <<<"$HELP" && echo "ok     $f" || die "esta version no reconoce $f"
done
grep -qE '^  -t [0-9]+( -tb [0-9]+)? --no-webui$' "$UNIT" || die "no reconozco la linea de hilos en la unidad (¿la editaste a mano?)"
echo "hilos antes  : $(grep -E '^  -t ' "$UNIT" | sed 's/^ *//')"
echo "afinidad antes: $(grep -E '^CPUAffinity=' "$UNIT" || echo '(ninguna)')"
echo "hilos despues: -t $T -tb $TB --no-webui | afinidad: ${AFF:-(ninguna)}"

step "Backup y edicion de la unidad"
BK="$UNIT.bak-$(date +%Y%m%d-%H%M%S)"
cp -p "$UNIT" "$BK" && echo "backup: $BK"
sed -E -i "s|^  -t [0-9]+( -tb [0-9]+)? --no-webui\$|  -t $T -tb $TB --no-webui|" "$UNIT"
sed -i '/^CPUAffinity=/d' "$UNIT"
if [ -n "$AFF" ]; then sed -i "/^Nice=10\$/a CPUAffinity=$AFF" "$UNIT"; fi
echo "--- unidad resultante (sin secretos):"; cat "$UNIT"

step "Reiniciar"
systemctl --user daemon-reload || die "daemon-reload fallo"
systemctl --user restart llama-server || die "restart fallo"
t0="$(date +%s)"; ok=0
while [ $(( $(date +%s) - t0 )) -lt 180 ]; do
  c="$(curl -s -o /dev/null -m 3 -w '%{http_code}' "http://127.0.0.1:$PORT/health" || true)"
  [ "$c" = "200" ] && { ok=1; break; }
  systemctl --user is-active --quiet llama-server || break
  sleep 2
done
echo "listo=$ok tras $(( $(date +%s) - t0 )) s"
if [ "$ok" != 1 ]; then
  echo "El servicio no arranco. Para volver atras:  cp -p \"$BK\" \"$UNIT\" && systemctl --user daemon-reload && systemctl --user restart llama-server"
  exit 1
fi

step "Verificacion del proceso en ejecucion"
PID="$(systemctl --user show -p MainPID --value llama-server)"
echo "linea de comandos efectiva: $(tr '\0' ' ' < "/proc/$PID/cmdline")"
command -v taskset >/dev/null 2>&1 && taskset -cp "$PID"
echo "hilos del proceso: $(ls "/proc/$PID/task" | wc -l)"
echo "escucha: $(ss -ltn 2>/dev/null | grep -E ":$PORT\b" | awk '{print $4}' | paste -sd' ')"

if [ "$RUN_LATENCY" = "1" ]; then
  step "Re-medicion del hilo largo (warm + A + A2, tarda ~6-8 min)"
  echo "Referencia ANTES (-t 8, sin fijar): A primer byte 57.4 s, prefill 52.6 tok/s, decodificacion 6.2 tok/s; A2 primer byte 44.8 s."
  python3 "$OUT_DIR/05_latency_test.py" --only warm,A,A2 --label tuned
else
  echo; echo "(RUN_LATENCY=0: no re-mido; ejecuta:  python3 \"Claude outputs/05_latency_test.py\" --only warm,A,A2 --label tuned)"
fi
step "Fin"
