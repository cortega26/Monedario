#!/usr/bin/env bash
# 10_verify_external.sh — verificacion EXTERNA (paso 6): pasa por Internet -> Cloudflare Access -> tunel -> llama-server.
# Necesita TUS credenciales de Access en variables de entorno, puestas por ti en tu terminal (nunca en el chat ni en un archivo):
#     read -rp  "CF Client ID: "     CF_ACCESS_CLIENT_ID
#     read -rsp "CF Client Secret: " CF_ACCESS_CLIENT_SECRET ; echo
#     export CF_ACCESS_CLIENT_ID CF_ACCESS_CLIENT_SECRET
# (pega desde tu gestor de contrasenas; con 'read' no queda en el historial). La clave de llama-server la lee del archivo
# ~/.config/llama-server.key (o de LOCAL_LLM_API_KEY si la defines tu). Ninguna credencial se imprime ni se guarda:
# las cabeceras van a archivos temporales modo 600 (curl -H @archivo) que se borran al terminar.
# Uso:   bash "Claude outputs/10_verify_external.sh"            (con RUN_LATENCY=0 solo hace las pruebas de acceso, ~1 min)
# Resultado (lo leo yo): tunnel_verify_result.txt y latency_tunel_result.txt junto a este script.
set -uo pipefail
export LC_ALL=C

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULT="$OUT_DIR/tunnel_verify_result.txt"
: > "$RESULT"
exec > >(tee -a "$RESULT") 2>&1

HOST_FQDN="${HOSTNAME_FQDN:-llm.monedario.cl}"
BASE="https://$HOST_FQDN"
KEYFILE="${KEYFILE:-$HOME/.config/llama-server.key}"
ALIAS="qwen3.5-35b-a3b"
RUN_LATENCY="${RUN_LATENCY:-1}"

step() { printf '\n== %s ==\n' "$1"; }
die()  { echo "ERROR: $*"; exit 1; }

step "Comprobaciones previas (no se muestra ningun valor)"
[ -n "${CF_ACCESS_CLIENT_ID:-}" ] && [ -n "${CF_ACCESS_CLIENT_SECRET:-}" ] || {
  echo "Faltan CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET en el entorno de esta terminal. Ponlas asi (sin que se vean ni queden en el historial):"
  echo '    read -rp  "CF Client ID: "     CF_ACCESS_CLIENT_ID'
  echo '    read -rsp "CF Client Secret: " CF_ACCESS_CLIENT_SECRET ; echo'
  echo '    export CF_ACCESS_CLIENT_ID CF_ACCESS_CLIENT_SECRET'
  exit 2; }
if [ -z "${LOCAL_LLM_API_KEY:-}" ]; then
  [ -s "$KEYFILE" ] || die "no hay LOCAL_LLM_API_KEY ni $KEYFILE"
  LOCAL_LLM_API_KEY="$(<"$KEYFILE")"
fi
echo "CF_ACCESS_CLIENT_ID: definido (${#CF_ACCESS_CLIENT_ID} caracteres) | CF_ACCESS_CLIENT_SECRET: definido (${#CF_ACCESS_CLIENT_SECRET} caracteres) | clave llama-server: definida (${#LOCAL_LLM_API_KEY} caracteres)"
systemctl --user is-active --quiet cloudflared-llm || echo "AVISO: cloudflared-llm no figura activo"
systemctl --user is-active --quiet llama-server   || echo "AVISO: llama-server no figura activo"

TMP="$(mktemp -d)"; chmod 700 "$TMP"
trap 'rm -rf "$TMP"' EXIT
# archivos de cabeceras (printf es interno del shell: los valores no pasan por ninguna linea de comandos visible en 'ps')
printf 'CF-Access-Client-Id: %s\nCF-Access-Client-Secret: %s\n' "$CF_ACCESS_CLIENT_ID" "$CF_ACCESS_CLIENT_SECRET" > "$TMP/access.h"
printf 'Authorization: Bearer %s\n' "$LOCAL_LLM_API_KEY" > "$TMP/bearer.h"
printf 'CF-Access-Client-Id: %s\nCF-Access-Client-Secret: %s\n' "0000000000000000000000000000000f.access" "0000000000000000000000000000000000000000000000000000000000000000" > "$TMP/badaccess.h"
printf 'Authorization: Bearer %s\n' "clave-incorrecta" > "$TMP/badbearer.h"
chmod 600 "$TMP"/*.h

BODY='{"model":"'"$ALIAS"'","messages":[{"role":"user","content":"Responde solo con la palabra: ok"}],"max_tokens":16,"temperature":0,"stream":false,"chat_template_kwargs":{"enable_thinking":false}}'
code() { curl -s -o /dev/null -m 60 -w '%{http_code}' "$@" || true; }
POST() { code -X POST -H 'Content-Type: application/json' -d "$BODY" "$@" "$BASE/v1/chat/completions"; }

step "Pruebas de acceso (codigos HTTP)"
r1="$(code "$BASE/v1/models")"
r2="$(POST)"
r3="$(POST -H @"$TMP/badaccess.h" -H @"$TMP/bearer.h")"
r4="$(code -H @"$TMP/access.h" "$BASE/v1/models")"
r5="$(POST -H @"$TMP/access.h")"
r6="$(POST -H @"$TMP/access.h" -H @"$TMP/badbearer.h")"
r7="$(code -H @"$TMP/access.h" -H @"$TMP/bearer.h" "$BASE/v1/models")"
echo "1. GET  /v1/models  sin cabeceras                         -> $r1   (esperado: 302/401/403 de Access, NUNCA 200)"
echo "2. POST /v1/chat    sin cabeceras                         -> $r2   (esperado: 302/401/403, NUNCA 200)"
echo "3. POST /v1/chat    token Access FALSO + Bearer correcto  -> $r3   (esperado: 302/401/403, NUNCA 200)"
echo "4. GET  /v1/models  token Access correcto, sin Bearer     -> $r4   (esperado: 401 de llama-server: Access deja pasar, el origen exige clave)"
echo "5. POST /v1/chat    token Access correcto, sin Bearer     -> $r5   (esperado: 401)"
echo "6. POST /v1/chat    token Access correcto, Bearer malo    -> $r6   (esperado: 401)"
echo "7. GET  /v1/models  token Access + Bearer correctos       -> $r7   (esperado: 200)"
fail=0
for v in "$r1" "$r2" "$r3"; do case "$v" in 302|401|403) ;; *) fail=1;; esac; done
for v in "$r4" "$r5" "$r6"; do [ "$v" = "401" ] || fail=1; done
[ "$r7" = "200" ] || fail=1
if [ "$fail" = 0 ]; then echo "resultado de acceso: OK (sin credenciales/token falso no entra; con token pero sin clave, 401; con ambas, 200)"
else echo "resultado de acceso: HAY DIFERENCIAS con lo esperado (ver codigos). 200 en 1-3 seria exposicion: en ese caso  systemctl --user disable --now cloudflared-llm  y avisame."; fi

step "Peticion pequena completa por el tunel (no streaming)"
curl -s -m 180 -H @"$TMP/access.h" -H @"$TMP/bearer.h" -H 'Content-Type: application/json' -d "$BODY" -o "$TMP/resp.json" \
     -w 'http=%{http_code} primer_byte=%{time_starttransfer}s total=%{time_total}s\n' "$BASE/v1/chat/completions" || echo "curl fallo"
echo "-- respuesta del modelo: $(jq -r '.choices[0].message.content // "(sin contenido)"' "$TMP/resp.json" 2>/dev/null | head -1)"

if [ "$RUN_LATENCY" = "1" ]; then
  step "Latencia por el tunel con el mismo cliente del paso 3 (hilo real de ~2.000 palabras, streaming; tarda ~8-12 min)"
  echo "Umbrales: >80 s al primer byte = reportar; ~100 s = Cloudflare corta con 524 (proxy read timeout)."
  echo "Referencia local (sin tunel): primer byte A = 42.0 s en frio, 35.0 s con cache; decodificacion ~6.7-8.0 tok/s."
  LOCAL_LLM_API_KEY="$LOCAL_LLM_API_KEY" python3 "$OUT_DIR/05_latency_test.py" --base-url "$BASE/v1" --label tunel
  echo
  if grep -qE '\b524\b|HTTP 5[0-9][0-9]|Error|error' "$OUT_DIR/latency_tunel_result.txt" 2>/dev/null; then
    echo "-- lineas con posibles errores en latency_tunel_result.txt (busca 524):"
    grep -nE '\b524\b|HTTP 5[0-9][0-9]|Error|error' "$OUT_DIR/latency_tunel_result.txt" | head -10
  else
    echo "no se detectaron errores HTTP (ni 524) en latency_tunel_result.txt"
  fi
else
  echo; echo "(RUN_LATENCY=0: no medi latencia por el tunel; ejecuta:  python3 \"Claude outputs/05_latency_test.py\" --base-url $BASE/v1 --label tunel)"
fi
step "Fin"
