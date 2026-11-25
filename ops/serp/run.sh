#!/usr/bin/env bash
# Ejecuta el colector SERP de forma desatendida (timer `systemd --user`).
#
# El timer corre todos los días; el propio colector decide si hoy toca
# (lunes, jueves o cierre del ciclo de facturación) y se niega otros días, por lo
# que una corrida en un día que no toca termina en "skipped" sin gastar nada.
#
# Qué hace:
#   1. Actualiza el worktree dedicado a origin/main (solo si está limpio).
#   2. Ejecuta `scripts/collect-serp-snapshot.mjs --auto --run`.
#   3. Guarda el estado en output/external-intelligence/serp/ (last-run.json,
#      last-run.log, runs.log, last-ok) y avisa por notify-send si falla o si
#      pasan demasiados días sin una corrida exitosa.
#
# Solo uso local: nunca en CI (contrato de inteligencia externa). La clave
# SERPAPI_API_KEY la lee el colector desde .env.local; este script no la toca
# ni la imprime.
#
# Variables opcionales:
#   MONEDARIO_SERP_REPO        worktree con el repo (default: ~/VS_Code_Projects/products/monedario-ops)
#   MONEDARIO_SERP_NO_UPDATE   1 = no hace git fetch/checkout antes de correr
#   MONEDARIO_SERP_STALE_DAYS  días sin corrida exitosa antes de avisar (default 8)

set -uo pipefail
umask 077

REPO="${MONEDARIO_SERP_REPO:-$HOME/VS_Code_Projects/products/monedario-ops}"
STALE_DAYS="${MONEDARIO_SERP_STALE_DAYS:-8}"
STATE_DIR="$REPO/output/external-intelligence/serp"
COLLECTOR="$REPO/scripts/collect-serp-snapshot.mjs"
RUN_LOG="$STATE_DIR/last-run.log"
NOW_EPOCH="$(date +%s)"
NOW_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

log() { printf '[serp-run] %s\n' "$*"; }

notify() {
  # $1 = título, $2 = mensaje. Sin sesión de escritorio solo queda el log.
  if command -v notify-send >/dev/null 2>&1 && [ -n "${DBUS_SESSION_BUS_ADDRESS:-}" ]; then
    notify-send -a Monedario "$1" "$2" || true
  fi
}

find_node() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi
  # systemd --user no hereda el PATH de nvm: se busca la versión más reciente.
  local candidate
  candidate="$(ls -1d "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | sort -V | tail -n 1)"
  if [ -n "$candidate" ] && [ -x "$candidate" ]; then
    printf '%s\n' "$candidate"
    return 0
  fi
  return 1
}

write_state() {
  # $1 = status, $2 = código de salida, $3 = capturas
  mkdir -p "$STATE_DIR"
  printf '{"at":"%s","status":"%s","exit":%s,"captured":%s}\n' \
    "$NOW_ISO" "$1" "$2" "$3" >"$STATE_DIR/last-run.json"
  printf '%s %s exit=%s captured=%s\n' "$NOW_ISO" "$1" "$2" "$3" >>"$STATE_DIR/runs.log"
  if [ -f "$STATE_DIR/runs.log" ]; then
    tail -n 200 "$STATE_DIR/runs.log" >"$STATE_DIR/runs.log.tmp" && mv "$STATE_DIR/runs.log.tmp" "$STATE_DIR/runs.log"
  fi
}

check_stale() {
  # Avisa si pasaron más de STALE_DAYS desde la última corrida exitosa (o desde la instalación).
  local base_file="$STATE_DIR/last-ok"
  [ -f "$base_file" ] || base_file="$STATE_DIR/installed-at"
  if [ ! -f "$base_file" ]; then
    printf '%s\n' "$NOW_EPOCH" >"$STATE_DIR/installed-at"
    return 0
  fi
  local last age_days
  last="$(cat "$base_file" 2>/dev/null || echo "$NOW_EPOCH")"
  case "$last" in '' | *[!0-9]*) last="$NOW_EPOCH" ;; esac
  age_days=$(((NOW_EPOCH - last) / 86400))
  if [ "$age_days" -gt "$STALE_DAYS" ]; then
    notify "SERP: sin corridas exitosas" "Hace $age_days días que no hay una corrida exitosa del colector SERP."
    log "aviso: $age_days días sin corrida exitosa"
  fi
}

if [ ! -f "$COLLECTOR" ]; then
  log "no existe $COLLECTOR"
  notify "SERP: no se pudo ejecutar" "Falta el colector en $REPO"
  exit 1
fi
mkdir -p "$STATE_DIR"

# 1) Código al día (solo si el worktree está limpio; si no, se usa lo que hay).
if [ "${MONEDARIO_SERP_NO_UPDATE:-0}" != "1" ] && git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if [ -z "$(git -C "$REPO" status --porcelain 2>/dev/null)" ]; then
    if git -C "$REPO" fetch --quiet origin main 2>/dev/null; then
      git -C "$REPO" checkout --quiet --detach origin/main 2>/dev/null || log "aviso: no se pudo actualizar el worktree"
    else
      log "aviso: sin red para git fetch; se usa el código actual"
    fi
  else
    log "aviso: el worktree tiene cambios locales; no se actualiza"
  fi
fi

# 2) El colector debe soportar el modo automático (versión previa a --auto = no correr).
if ! grep -q -- '--auto' "$COLLECTOR"; then
  log "el colector no soporta --auto (código desactualizado)"
  write_state "error" 1 0
  notify "SERP: código desactualizado" "El colector no soporta --auto; actualiza el worktree $REPO a main."
  exit 1
fi

NODE_BIN="$(find_node)" || {
  log "no se encontró node"
  write_state "error" 1 0
  notify "SERP: falta node" "No se encontró node para ejecutar el colector."
  exit 1
}

# 3) Corrida.
(cd "$REPO" && "$NODE_BIN" scripts/collect-serp-snapshot.mjs --auto --run) >"$RUN_LOG" 2>&1
CODE=$?
CAPTURED="$(grep -c '^\[serp\] capturado:' "$RUN_LOG" || true)"
ERRORS="$(grep -c '^\[serp\] error' "$RUN_LOG" || true)"
cat "$RUN_LOG"

if [ "$CODE" -ne 0 ]; then
  write_state "error" "$CODE" "${CAPTURED:-0}"
  notify "SERP: la corrida falló" "$(tail -n 2 "$RUN_LOG" | tr '\n' ' ')"
  exit "$CODE"
fi

if grep -q 'hoy no es día de corrida' "$RUN_LOG"; then
  write_state "skipped" 0 0
  check_stale
  exit 0
fi

if grep -q 'colector omitido' "$RUN_LOG"; then
  # El colector sale con 0 cuando se omite (sin clave, sin lista, etc.): aquí es un fallo.
  write_state "error" 0 0
  notify "SERP: colector omitido" "$(grep 'colector omitido' "$RUN_LOG" | head -n 1)"
  exit 1
fi

if [ "${ERRORS:-0}" -gt 0 ] && [ "${CAPTURED:-0}" -eq 0 ]; then
  write_state "error" 0 0
  notify "SERP: sin capturas por errores" "$(grep '^\[serp\] error' "$RUN_LOG" | head -n 1)"
  exit 1
fi

write_state "ok" 0 "${CAPTURED:-0}"
printf '%s\n' "$NOW_EPOCH" >"$STATE_DIR/last-ok"
if [ "${CAPTURED:-0}" -gt 0 ]; then
  notify "SERP: corrida lista" "${CAPTURED} capturas nuevas. Brief en output/external-intelligence/serp/."
fi
check_stale
exit 0
