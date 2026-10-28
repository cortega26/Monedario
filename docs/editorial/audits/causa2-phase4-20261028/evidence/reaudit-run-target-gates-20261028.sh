#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../../../../../" && pwd)"
EVIDENCE="$SCRIPT_DIR"
LOG="$EVIDENCE/reaudit-target-gates-20261028.log"
ROUTE_PATH="$ROOT/output/validation/routes_snapshot_after.json"
RSS_PATH="$ROOT/output/validation/rss_snapshot_after.json"
ROUTE_EVIDENCE="$EVIDENCE/reaudit-routes_snapshot_after-20261028.json"
RSS_EVIDENCE="$EVIDENCE/reaudit-rss_snapshot_after-20261028.json"
BACKUP_DIR="$(mktemp -d /tmp/monedario-reaudit-gates.XXXXXX)"
ROUTE_BACKUP="$BACKUP_DIR/routes_snapshot_after.json"
RSS_BACKUP="$BACKUP_DIR/rss_snapshot_after.json"
HAD_ROUTE=0
HAD_RSS=0
FAILED=0

restore_generated_paths() {
  if [[ -L "$ROUTE_PATH" ]] && [[ "$(readlink "$ROUTE_PATH")" == "$ROUTE_EVIDENCE" ]]; then
    rm -f "$ROUTE_PATH"
  fi
  if [[ -L "$RSS_PATH" ]] && [[ "$(readlink "$RSS_PATH")" == "$RSS_EVIDENCE" ]]; then
    rm -f "$RSS_PATH"
  fi
  if [[ "$HAD_ROUTE" -eq 1 ]]; then
    mv "$ROUTE_BACKUP" "$ROUTE_PATH"
  fi
  if [[ "$HAD_RSS" -eq 1 ]]; then
    mv "$RSS_BACKUP" "$RSS_PATH"
  fi
  rm -rf "$BACKUP_DIR"
}
trap restore_generated_paths EXIT

if [[ -e "$ROUTE_PATH" || -L "$ROUTE_PATH" ]]; then
  mv "$ROUTE_PATH" "$ROUTE_BACKUP"
  HAD_ROUTE=1
fi
if [[ -e "$RSS_PATH" || -L "$RSS_PATH" ]]; then
  mv "$RSS_PATH" "$RSS_BACKUP"
  HAD_RSS=1
fi
if [[ -e "$ROUTE_EVIDENCE" || -e "$RSS_EVIDENCE" ]]; then
  printf 'Fresh evidence target already exists; refusing to overwrite it.\n' >&2
  exit 2
fi
ln -s "$ROUTE_EVIDENCE" "$ROUTE_PATH"
ln -s "$RSS_EVIDENCE" "$RSS_PATH"

cd "$ROOT"
{
  printf 'Target-gate re-audit run — 2026-10-28\n'
  printf 'HEAD: '
  git rev-parse HEAD
  printf 'Node executable: '
  command -v node
  printf 'Node: '
  node --version
  printf 'pnpm: '
  pnpm --version
  printf 'Temporary output routing: routes/RSS checks write fresh output to evidence files.\n'
  printf 'Pre-existing ignored output files were moved aside and will be restored byte-for-byte.\n\n'
} > "$LOG"

run_check() {
  local label="$1"
  shift
  {
    printf '\n$ %s\n' "$label"
    printf 'command:'
    printf ' %q' "$@"
    printf '\n'
  } >> "$LOG"
  if "$@" >> "$LOG" 2>&1; then
    printf 'exit=0\n' >> "$LOG"
    return 0
  else
    local status=$?
    printf 'exit=%s\n' "$status" >> "$LOG"
    FAILED=$((FAILED + 1))
    return "$status"
  fi
}

run_check 'node scripts/check-payroll-consistency.mjs' pnpm run check:payroll-consistency || true
run_check 'pnpm run check:audit-artifacts' pnpm run check:audit-artifacts || true
run_check 'pnpm run check:correcciones' pnpm run check:correcciones || true
run_check 'pnpm run check:frontmatter' pnpm run check:frontmatter || true
run_check 'pnpm run check:legal-citations' pnpm run check:legal-citations || true
run_check 'EDITORIAL_ENFORCE=1 EDITORIAL_SCOPE=changed EDITORIAL_DIFF_BASE_REF=main pnpm run check:editorial' \
  env EDITORIAL_ENFORCE=1 EDITORIAL_SCOPE=changed EDITORIAL_DIFF_BASE_REF=main pnpm run check:editorial || true

if run_check 'pnpm run build' pnpm run build; then
  run_check 'pnpm run check:rss (after successful build)' pnpm run check:rss || true
else
  printf '\n$ pnpm run check:rss\nSKIPPED: build failed; no stale dist/rss.xml used.\n' >> "$LOG"
fi

run_check 'pnpm run check:routes' pnpm run check:routes || true
run_check 'pnpm run check:no-postid-urls' pnpm run check:no-postid-urls || true
run_check 'pnpm run check:urls:ci' pnpm run check:urls:ci || true
run_check 'pnpm run check:ci' pnpm run check:ci || true

{
  printf '\nFresh RSS evidence file: %s\n' "$RSS_EVIDENCE"
  printf 'Fresh routes evidence file: %s\n' "$ROUTE_EVIDENCE"
  printf 'failures=%s\n' "$FAILED"
  if [[ "$HAD_ROUTE" -eq 1 ]]; then
    printf 'previous route output preserved for restoration: yes\n'
  else
    printf 'previous route output existed: no\n'
  fi
  if [[ "$HAD_RSS" -eq 1 ]]; then
    printf 'previous RSS output preserved for restoration: yes; its content was not read as evidence\n'
  else
    printf 'previous RSS output existed: no\n'
  fi
} >> "$LOG"

cat "$LOG"
if [[ "$FAILED" -gt 0 ]]; then
  exit 1
fi
