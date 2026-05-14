#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)
REPO_ROOT=$(cd -- "$SCRIPT_DIR/.." >/dev/null 2>&1 && pwd)

if ! command -v rsync >/dev/null 2>&1; then
  echo "Error: rsync no esta disponible en el sistema." >&2
  exit 1
fi

if [[ ! -d "$REPO_ROOT/node_modules" ]]; then
  echo "Error: node_modules no existe en el repo. Ejecuta 'pnpm install' antes de correr Codacy ESLint." >&2
  exit 1
fi

TMP_DIR=$(mktemp -d /tmp/monedario-codacy-XXXXXX)

cleanup() {
  if [[ "${KEEP_CODACY_SANDBOX:-0}" == "1" ]]; then
    echo "Sandbox preservado en: $TMP_DIR"
    return
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

rsync -a --delete \
  --exclude '.git' \
  --exclude '.venv' \
  --exclude 'node_modules' \
  --exclude '.astro' \
  --exclude 'dist' \
  --exclude 'public/pagefind' \
  --exclude 'output' \
  "$REPO_ROOT/" "$TMP_DIR/"

ln -s "$REPO_ROOT/node_modules" "$TMP_DIR/node_modules"

cd "$TMP_DIR"
bash .codacy/cli.sh analyze --tool eslint "$@"
