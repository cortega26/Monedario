#!/usr/bin/env bash
#
# Wrapper de ejecución para monitor.py, pensado para correr desatendido
# en una VM (systemd timer / cron). Reemplaza el flujo actual que depende
# del bridge Claude <-> escritorio.
#
# Qué hace:
#   1. Corre monitor.py en este directorio.
#   2. Lee la línea "COMMIT: archivo1,archivo2,..." que imprime el script.
#   3. Si hay archivos para commitear, hace git add/commit/push (nunca
#      credentials.json).
#   4. Si el output indica coincidencias nuevas (no "Sin novedades"),
#      manda una notificación push vía ntfy.sh.
#
# Requisitos antes de usarlo:
#   - Este directorio debe ser un repo git con remoto configurado
#     (o ajusta/quita el bloque de git más abajo si no quieres
#     versionar los digests).
#   - export NTFY_TOPIC=<tu-topic-privado-e-impredecible>  (en un .env
#     que cargues, o directo en el .service — ver reddit-monitor.service)
#   - credentials.json debe estar en .gitignore (ver .gitignore.example)
#
set -euo pipefail

cd "$(dirname "$0")"

LOG_PREFIX="[reddit-monitor $(date -u +%Y-%m-%dT%H:%M:%SZ)]"

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

# --- 1. Correr el script ---------------------------------------------------
OUTPUT="$(python3 monitor.py . 2>&1)" || {
    echo "$LOG_PREFIX ERROR: monitor.py falló" >&2
    echo "$OUTPUT" >&2
    if [ -n "${NTFY_TOPIC:-}" ]; then
        NTFY_DETAIL="monitor.py falló en $(hostname): $(echo "$OUTPUT" | tail -c 300)"
        curl -fsS -d "$NTFY_DETAIL" \
            "https://ntfy.sh/${NTFY_TOPIC}" >/dev/null || \
            { ntfy_deadletter "run_monitor:monitor-fallo" "$NTFY_DETAIL"; true; }
    fi
    exit 1
}

echo "$OUTPUT"

# --- 2. Extraer archivos a commitear ---------------------------------------
COMMIT_LINE="$(echo "$OUTPUT" | grep -m1 '^COMMIT:' || true)"
CHANGED_FILES=""
if [ -n "$COMMIT_LINE" ]; then
    CHANGED_FILES="$(echo "$COMMIT_LINE" | sed 's/^COMMIT: *//' | tr ',' ' ')"
fi

# --- 3. Git commit + push (opcional, comenta este bloque si no aplica) -----
if [ -n "$CHANGED_FILES" ] && [ -d .git ]; then
    # Filtro de seguridad: nunca commitear credentials.json aunque
    # apareciera por error en la lista.
    SAFE_FILES=""
    for f in $CHANGED_FILES; do
        if [ "$f" != "credentials.json" ]; then
            SAFE_FILES="$SAFE_FILES $f"
        fi
    done
    if [ -n "$SAFE_FILES" ]; then
        git add $SAFE_FILES
        if ! git diff --cached --quiet; then
            git commit -m "monitor: actualización automática $(date -u +%Y-%m-%dT%H:%M:%SZ)" >/dev/null
            git push >/dev/null 2>&1 || echo "$LOG_PREFIX WARN: git push falló (revisar remoto/credenciales)" >&2
        fi
    fi
fi

# --- 4. Notificación push si hubo novedades ---------------------------------
if [ -n "${NTFY_TOPIC:-}" ]; then
    if echo "$OUTPUT" | grep -qi 'coincidencias nuevas'; then
        SUMMARY="$(echo "$OUTPUT" | grep -i 'coincidencias nuevas' | tail -n1)"
        curl -fsS \
            -H "Title: Monedario · Reddit monitor" \
            -H "Priority: default" \
            -d "$SUMMARY" \
            "https://ntfy.sh/${NTFY_TOPIC}" >/dev/null || \
            { ntfy_deadletter "run_monitor:novedades" "$SUMMARY"; \
              echo "$LOG_PREFIX WARN: no se pudo enviar notificación ntfy (ver ntfy_failures.jsonl)" >&2; }
    fi
    # "Sin novedades" -> no se notifica, igual que el comportamiento actual.
fi

echo "$LOG_PREFIX listo"
