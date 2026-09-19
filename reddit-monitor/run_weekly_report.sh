#!/usr/bin/env bash
#
# Wrapper para weekly_report.py (reporte de los lunes 09:00).
set -euo pipefail
cd "$(dirname "$0")"

LOG_PREFIX="[reddit-weekly-report $(date -u +%Y-%m-%dT%H:%M:%SZ)]"

# --- Dead-letter local de fallos ntfy (RM-009 follow-up shell) ----------------
# Los curl a ntfy.sh pueden fallar (red, rate-limit) y antes se tragaban con
# `|| true`. Cada fallo se agrega a ntfy_failures.jsonl (tope 50 lineas via
# tail, se descartan las mas viejas). Nunca tumba el wrapper (retorna 0).
NTFY_FAILURES_FILE="ntfy_failures.jsonl"
NTFY_FAILURES_CAP=50
ntfy_deadletter() {
    local context="$1" detail="$2" ts safe
    ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    safe="$(printf '%s' "$detail" | tr '\n' ' ' | sed 's/"/'"'"'/g')"
    printf '{"ts":"%s","context":"%s","detail":"%s"}\n' "$ts" "$context" "$safe" \
        >> "$NTFY_FAILURES_FILE" 2>/dev/null || true
    tail -n "$NTFY_FAILURES_CAP" "$NTFY_FAILURES_FILE" > "$NTFY_FAILURES_FILE.tmp" 2>/dev/null && \
        mv "$NTFY_FAILURES_FILE.tmp" "$NTFY_FAILURES_FILE" 2>/dev/null || true
    return 0
}

OUTPUT="$(python3 weekly_report.py . 2>&1)" || {
    echo "$LOG_PREFIX ERROR: weekly_report.py falló" >&2
    echo "$OUTPUT" >&2
    if [ -n "${NTFY_TOPIC:-}" ]; then
        NTFY_DETAIL="weekly_report.py falló en $(hostname): $(echo "$OUTPUT" | tail -c 300)"
        curl -fsS -d "$NTFY_DETAIL" \
            "https://ntfy.sh/${NTFY_TOPIC}" >/dev/null || \
            { ntfy_deadletter "weekly:reporte-fallo" "$NTFY_DETAIL"; true; }
    fi
    exit 1
}

echo "$OUTPUT"

COMMIT_LINE="$(echo "$OUTPUT" | grep -m1 '^COMMIT:' || true)"
if [ -n "$COMMIT_LINE" ] && [ -d .git ]; then
    CHANGED_FILES="$(echo "$COMMIT_LINE" | sed 's/^COMMIT: *//' | tr ',' ' ')"
    SAFE_FILES=""
    for f in $CHANGED_FILES; do
        [ "$f" != "credentials.json" ] && SAFE_FILES="$SAFE_FILES $f"
    done
    if [ -n "$SAFE_FILES" ]; then
        git add $SAFE_FILES
        if ! git diff --cached --quiet; then
            git commit -m "weekly-report: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >/dev/null
            git push >/dev/null 2>&1 || echo "$LOG_PREFIX WARN: git push falló" >&2
        fi
    fi
fi

if [ -n "${NTFY_TOPIC:-}" ]; then
    NTFY_DETAIL="Nuevo reporte semanal generado. Revisa index.md en la VM."
    curl -fsS \
        -H "Title: Monedario · Reporte semanal Reddit" \
        -H "Priority: default" \
        -d "$NTFY_DETAIL" \
        "https://ntfy.sh/${NTFY_TOPIC}" >/dev/null || \
        { ntfy_deadletter "weekly:reporte" "$NTFY_DETAIL"; \
          echo "$LOG_PREFIX WARN: no se pudo enviar notificación ntfy (ver ntfy_failures.jsonl)" >&2; }
fi

echo "$LOG_PREFIX listo"
