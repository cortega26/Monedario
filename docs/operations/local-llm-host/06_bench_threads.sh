#!/usr/bin/env bash
# 06_bench_threads.sh — mide con llama-bench que cantidad de hilos rinde mejor en tu CPU y deja los numeros.
# Detiene llama-server unos minutos (para no competir por CPU/RAM) y SIEMPRE lo reinicia al terminar,
# tambien si lo interrumpes con Ctrl+C. Solo lee informacion del sistema; no cambia gobernador, BIOS ni servicios ajenos.
# No usa la clave ni la red. Escribe solo junto a este script: bench_threads_result.txt y bench_threads_raw.log.
# Uso:   bash "Claude outputs/06_bench_threads.sh"          (tarda unos 8-12 minutos)
# Opcional: THREADS_LIST=6,8,10,12,16  PINNED_LIST=6,8,12  NP=512  NG=64  REPS=2
set -uo pipefail
export LC_ALL=C

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULT="$OUT_DIR/bench_threads_result.txt"
RAW="$OUT_DIR/bench_threads_raw.log"
: > "$RESULT"; : > "$RAW"
exec > >(tee -a "$RESULT") 2>&1

BENCH="${LLAMA_BENCH:-$HOME/llama.cpp/build/bin/llama-bench}"
MODEL="${MODEL:-$HOME/models/qwen3.5-35b-a3b/Qwen3.5-35B-A3B-Q4_K_M.gguf}"
SERVICE="llama-server"
PORT="${PORT:-8080}"
THREADS_LIST="${THREADS_LIST:-6,8,10,12,16}"
PINNED_LIST="${PINNED_LIST:-6,8,12}"
NP="${NP:-512}"; NG="${NG:-64}"; REPS="${REPS:-2}"

step() { printf '\n== %s ==\n' "$1"; }
die()  { echo "ERROR: $*"; exit 1; }

was_active=0; restarted=0
restart_service() {
  [ "$was_active" = 1 ] || return 0
  [ "$restarted" = 0 ] || return 0
  restarted=1
  step "Reiniciar $SERVICE"
  systemctl --user start "$SERVICE"
  t0="$(date +%s)"; ok=0
  while [ $(( $(date +%s) - t0 )) -lt 180 ]; do
    c="$(curl -s -o /dev/null -m 3 -w '%{http_code}' "http://127.0.0.1:$PORT/health" || true)"
    [ "$c" = "200" ] && { ok=1; break; }
    sleep 2
  done
  if [ "$ok" = 1 ]; then echo "$SERVICE activo y respondiendo /health (200) tras $(( $(date +%s) - t0 )) s"
  else echo "ATENCION: $SERVICE no respondio /health en 180 s. Revisa: systemctl --user status $SERVICE"; fi
}
trap restart_service EXIT
trap 'echo; echo "Interrumpido por el usuario"; exit 130' INT TERM

step "Comprobaciones previas"
[ -x "$BENCH" ] || die "no existe $BENCH"
[ -f "$MODEL" ] || die "no existe el modelo $MODEL"
HELP="$("$BENCH" --help 2>&1 || true)"
missing=0
for f in --model --threads --n-prompt --n-gen --repetitions; do
  if grep -qE -- "(^|[[:space:],])${f}([[:space:],]|\$)" <<<"$HELP"; then echo "ok     $f"; else echo "FALTA  $f"; missing=1; fi
done
[ "$missing" = 0 ] || die "esta version de llama-bench no reconoce algun flag; no ejecuto nada"
systemctl --user is-active --quiet "$SERVICE" && was_active=1
echo "$SERVICE estaba activo: $([ "$was_active" = 1 ] && echo si || echo no)"

step "Contexto del sistema (solo lectura)"
uptime
echo "-- procesos que mas CPU usan ahora (nombre, sin argumentos):"
ps -eo pcpu,pmem,comm --sort=-pcpu | head -8
free -h | head -3
echo "-- CPU: politica de energia (solo lectura):"
for f in scaling_driver scaling_governor energy_performance_preference; do
  p="/sys/devices/system/cpu/cpu0/cpufreq/$f"; [ -r "$p" ] && echo "$f=$(cat "$p")" || echo "$f=(no disponible)"
done
[ -r /sys/devices/system/cpu/intel_pstate/no_turbo ] && echo "no_turbo=$(cat /sys/devices/system/cpu/intel_pstate/no_turbo) (0 = turbo permitido)"
echo "-- nucleos (CPU logico, nucleo fisico, MHz maximo):"
lscpu -p=CPU,CORE,MAXMHZ 2>/dev/null | grep -v '^#' | awk -F, '{printf "cpu%s core%s %s\n",$1,$2,$3}' | paste -sd' ' | fold -w 110
PLIST=""; ELIST=""
if command -v lscpu >/dev/null 2>&1; then
  read -r PLIST ELIST < <(lscpu -p=CPU,MAXMHZ 2>/dev/null | grep -v '^#' | awk -F, '
     $2!="" {mhz[$1]=$2+0; if ($2+0>max) max=$2+0}
     END { for (c in mhz) { if (mhz[c]>=max*0.95) p=p (p?",":"") c; else e=e (e?",":"") c }
           print (p==""?"-":p), (e==""?"-":e) }')
  [ "$PLIST" = "-" ] && PLIST=""; [ "$ELIST" = "-" ] && ELIST=""
fi
if [ -n "$PLIST" ] && [ -n "$ELIST" ]; then
  P_SORTED="$(tr ',' '\n' <<<"$PLIST" | sort -n | paste -sd,)"; E_SORTED="$(tr ',' '\n' <<<"$ELIST" | sort -n | paste -sd,)"
  echo "nucleos de mayor frecuencia (P, probable): CPU $P_SORTED"; echo "nucleos de menor frecuencia (E, probable): CPU $E_SORTED"
  PLIST="$P_SORTED"
else
  echo "no distingo nucleos P/E (lscpu sin MAXMHZ o CPU no hibrida): omito la variante fijada"; PLIST=""
fi

step "Detener $SERVICE durante la medicion"
[ "$was_active" = 1 ] && systemctl --user stop "$SERVICE"
sleep 3
echo "estado: $(systemctl --user is-active "$SERVICE" 2>/dev/null || true)"

step "Prueba A: hilos sin fijar (el planificador de Linux elige nucleos). pp$NP = prefill (tok/s), tg$NG = decodificacion (tok/s)"
"$BENCH" -m "$MODEL" -t "$THREADS_LIST" -p "$NP" -n "$NG" -r "$REPS" 2>>"$RAW"
echo "(exit=$?)"

if [ -n "$PLIST" ] && command -v taskset >/dev/null 2>&1; then
  step "Prueba B: mismos hilos, procesos fijados SOLO a los nucleos P (taskset -c $PLIST)"
  taskset -c "$PLIST" "$BENCH" -m "$MODEL" -t "$PINNED_LIST" -p "$NP" -n "$NG" -r "$REPS" 2>>"$RAW"
  echo "(exit=$?)"
else
  echo; echo "(Prueba B omitida: sin lista de nucleos P o sin 'taskset')"
fi

restart_service
step "Fin"
echo "Como leerlo: en cada tabla, 'pp$NP' es velocidad de prefill y 'tg$NG' de decodificacion, en tokens/s (mas alto = mejor)."
echo "Referencia actual del servicio (-t 8, sin fijar): prefill ~50 tok/s y decodificacion ~6 tok/s (medido con los hilos de prueba)."
