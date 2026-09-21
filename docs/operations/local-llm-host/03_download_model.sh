#!/usr/bin/env bash
# 03_download_model.sh — descarga y VERIFICA el GGUF Qwen3.5-35B-A3B Q4_K_M (unsloth) en tu HOME.
# Descarga con reanudacion (si se corta, vuelve a ejecutar el script y continua).
# Compara tamano y sha256 contra lo que publica Hugging Face (API publica; no necesita login ni token).
# No toca servicios ni credenciales. Solo escribe en ~/models/qwen3.5-35b-a3b/ y en su carpeta de resultados.
# Uso:   bash "Claude outputs/03_download_model.sh"
# Resultado (lo leo yo): download_result.txt junto a este script.
set -euo pipefail
export LC_ALL=C

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULT="$OUT_DIR/download_result.txt"
: > "$RESULT"
log()  { echo "$*" | tee -a "$RESULT"; }
fail() { log "ERROR: $*"; exit 1; }

REPO="unsloth/Qwen3.5-35B-A3B-GGUF"
FILE="Qwen3.5-35B-A3B-Q4_K_M.gguf"
DEST_DIR="${DEST_DIR:-$HOME/models/qwen3.5-35b-a3b}"
# Valores que lei antes en la web (solo para cruzar; la fuente de verdad es la API de HF ahora mismo):
HINT_SIZE=22016023168
HINT_SHA=3b46d1066bc91cc2d613e3bc22ce691dd77e6f0d33c9060690d24ce6de494375

for t in curl jq sha256sum stat awk; do command -v "$t" >/dev/null 2>&1 || fail "falta $t"; done
mkdir -p "$DEST_DIR"
PART="$DEST_DIR/$FILE.part"; FINAL="$DEST_DIR/$FILE"

log "== Metadatos publicados por Hugging Face =="
api="$(curl -fsS -m 30 "https://huggingface.co/api/models/$REPO/tree/main")" || fail "no pude consultar la API de Hugging Face"
SIZE="$(jq -r --arg p "$FILE" '.[] | select(.path==$p) | (.lfs.size // .size)' <<<"$api")"
SHA="$(jq -r --arg p "$FILE" '.[] | select(.path==$p) | .lfs.oid' <<<"$api")"
[[ "$SIZE" =~ ^[0-9]+$ ]] || fail "no encontre $FILE en la API (tamano='$SIZE')"
[[ "$SHA" =~ ^[0-9a-f]{64}$ ]] || fail "sha256 invalido en la API ('$SHA')"
log "archivo: $REPO/$FILE"
log "tamano esperado: $SIZE bytes | sha256 esperado: $SHA"
if [ "$SIZE" = "$HINT_SIZE" ] && [ "$SHA" = "$HINT_SHA" ]; then log "coincide con lo que lei antes en la web: OK"
else log "AVISO: NO coincide con lo que lei antes en la web (tamano $HINT_SIZE / sha ${HINT_SHA:0:12}...). Usare el de la API; el archivo pudo actualizarse."; fi

log ""; log "== Disco =="
have=0; [ -f "$PART" ] && have="$(stat -c %s "$PART")"; [ -f "$FINAL" ] && have="$(stat -c %s "$FINAL")"
avail="$(df -PB1 "$DEST_DIR" | awk 'NR==2{print $4}')"
need=$(( SIZE - have + 2*1024*1024*1024 ))   # + 2 GB de margen
log "libre: $((avail/1024/1024/1024)) GB | falta descargar: $(( (SIZE-have)/1024/1024/1024 )) GB"
[ "$avail" -ge "$need" ] || fail "no hay espacio suficiente (se necesitan ~$((need/1024/1024/1024)) GB libres)"

if [ -f "$FINAL" ] && [ "$(stat -c %s "$FINAL")" = "$SIZE" ]; then
  log ""; log "== Ya existe el archivo final con el tamano correcto; solo verifico hash =="
  PART="$FINAL"
else
  log ""; log "== Descargando (reanudable) =="
  curl -fL -C - --retry 5 --retry-delay 5 --retry-connrefused -# -o "$PART" \
       "https://huggingface.co/$REPO/resolve/main/$FILE" || fail "la descarga fallo; vuelve a ejecutar el script para reanudar"
fi

got="$(stat -c %s "$PART")"
[ "$got" = "$SIZE" ] || fail "tamano distinto: descargado $got, esperado $SIZE (vuelve a ejecutar para reanudar)"
log "tamano OK: $got bytes"
log "calculando sha256 (1-3 minutos)..."
calc="$(sha256sum "$PART" | awk '{print $1}')"
if [ "$calc" != "$SHA" ]; then
  fail "sha256 NO coincide. calculado=$calc esperado=$SHA. Conservo $PART; no lo uses."
fi
log "sha256 OK: $calc"
[ "$PART" = "$FINAL" ] || mv -n "$PART" "$FINAL"
log ""; log "== Listo =="
ls -la "$FINAL" | tee -a "$RESULT"
log "libre en disco: $(df -h "$DEST_DIR" | awk 'NR==2{print $4}')"
log "VERIFICADO: tamano y sha256 coinciden con Hugging Face."
