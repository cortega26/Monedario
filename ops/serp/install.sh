#!/usr/bin/env bash
# Instala (o quita) el timer `systemd --user` del colector SERP de Monedario.
#
# Uso:
#   ops/serp/install.sh [--repo RUTA]   # instala y activa el timer
#   ops/serp/install.sh --status        # estado del timer y de la última corrida
#   ops/serp/install.sh --uninstall     # desactiva y borra lo instalado
#
# RUTA = worktree LIMPIO del repo (por defecto ~/VS_Code_Projects/products/monedario-ops)
# con .env.local (o SERPAPI_API_KEY) disponible. El worktree se actualiza solo a
# origin/main en cada corrida, así que no debe tener cambios locales.

set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$HOME/VS_Code_Projects/products/monedario-ops"
MODE="install"
DEST_BIN="$HOME/.local/share/monedario/serp"
DEST_UNITS="$HOME/.config/systemd/user"
DEST_ENV="$HOME/.config/monedario/serp.env"

while [ $# -gt 0 ]; do
  case "$1" in
    --repo)
      REPO="$2"
      shift 2
      ;;
    --status)
      MODE="status"
      shift
      ;;
    --uninstall)
      MODE="uninstall"
      shift
      ;;
    -h | --help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo "argumento desconocido: $1" >&2
      exit 2
      ;;
  esac
done

if ! command -v systemctl >/dev/null 2>&1; then
  echo "systemctl no está disponible: este instalador requiere systemd." >&2
  exit 1
fi

case "$MODE" in
  status)
    systemctl --user list-timers monedario-serp-snapshot.timer --no-pager || true
    if [ -f "$REPO/output/external-intelligence/serp/last-run.json" ]; then
      echo "última corrida: $(cat "$REPO/output/external-intelligence/serp/last-run.json")"
    else
      echo "todavía no hay corridas registradas en $REPO"
    fi
    exit 0
    ;;
  uninstall)
    systemctl --user disable --now monedario-serp-snapshot.timer 2>/dev/null || true
    rm -f "$DEST_UNITS/monedario-serp-snapshot.service" "$DEST_UNITS/monedario-serp-snapshot.timer" \
      "$DEST_BIN/run.sh" "$DEST_ENV"
    systemctl --user daemon-reload
    echo "timer SERP desinstalado (los datos en $REPO/output no se tocan)."
    exit 0
    ;;
esac

# --- Comprobaciones previas ---------------------------------------------------
if [ ! -d "$REPO" ] || ! git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "$REPO no es un worktree de git. Crea uno limpio, por ejemplo:" >&2
  echo "  git worktree add --detach $REPO origin/main" >&2
  exit 1
fi
if [ ! -f "$REPO/scripts/collect-serp-snapshot.mjs" ] || ! grep -q -- '--auto' "$REPO/scripts/collect-serp-snapshot.mjs"; then
  echo "El colector de $REPO no soporta --auto. Actualiza el worktree a origin/main antes de instalar." >&2
  exit 1
fi
if [ -n "$(git -C "$REPO" status --porcelain)" ]; then
  echo "$REPO tiene cambios locales; el timer actualiza el worktree solo si está limpio." >&2
  exit 1
fi
if [ -z "${SERPAPI_API_KEY:-}" ] && ! grep -qs '^SERPAPI_API_KEY=' "$REPO/.env.local"; then
  echo "No se encontró SERPAPI_API_KEY en $REPO/.env.local ni en el entorno." >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1 && ! ls "$HOME"/.nvm/versions/node/*/bin/node >/dev/null 2>&1; then
  echo "No se encontró node (ni en PATH ni en nvm)." >&2
  exit 1
fi

# --- Instalación ---------------------------------------------------------------
install -Dm700 "$SRC_DIR/run.sh" "$DEST_BIN/run.sh"
install -Dm600 "$SRC_DIR/monedario-serp-snapshot.service" "$DEST_UNITS/monedario-serp-snapshot.service"
install -Dm600 "$SRC_DIR/monedario-serp-snapshot.timer" "$DEST_UNITS/monedario-serp-snapshot.timer"
mkdir -p "$(dirname "$DEST_ENV")"
printf 'MONEDARIO_SERP_REPO=%s\n' "$REPO" >"$DEST_ENV"
chmod 600 "$DEST_ENV"

mkdir -p "$REPO/output/external-intelligence/serp"
date +%s >"$REPO/output/external-intelligence/serp/installed-at"

systemctl --user daemon-reload
systemctl --user enable --now monedario-serp-snapshot.timer
echo "timer SERP instalado. Repo: $REPO"
systemctl --user list-timers monedario-serp-snapshot.timer --no-pager || true
