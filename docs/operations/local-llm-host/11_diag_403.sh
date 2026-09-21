#!/usr/bin/env bash
# 11_diag_403.sh — diagnostico del HTTP 403 que dio 05_latency_test.py por el tunel (curl SI pasaba con las mismas credenciales).
# Hipotesis: Cloudflare (Browser Integrity Check / firma de bot) rechaza el User-Agent por defecto de urllib ("Python-urllib/3.x"),
# que es el que usa 05 y tambien el cliente del asistente (call_openai_compat, solo urllib). Este script lo comprueba con peticiones
# MINIMAS (max_tokens 16; ~2 s cada una), variando SOLO el User-Agent. Es de solo lectura: no cambia nada en Cloudflare ni en tu PC.
# Necesita las mismas variables exportadas que 10_verify_external.sh (CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET).
# Imprime codigos HTTP y, de las respuestas de ERROR, solo las cabeceras content-type/server/cf-mitigated/cf-ray y los primeros
# 200 caracteres del cuerpo (una pagina de error de Cloudflare: no contiene tus credenciales). Nunca imprime credenciales.
# Uso:   bash "Claude outputs/11_diag_403.sh"        Resultado (lo leo yo): diag_403_result.txt junto a este script.
set -uo pipefail
export LC_ALL=C

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULT="$OUT_DIR/diag_403_result.txt"
: > "$RESULT"
exec > >(tee -a "$RESULT") 2>&1

BASE="${BASE_URL:-https://llm.monedario.cl}"
KEYFILE="${KEYFILE:-$HOME/.config/llama-server.key}"
ALIAS="qwen3.5-35b-a3b"
PYV="$(python3 -c 'import sys;print("Python-urllib/%d.%d"%sys.version_info[:2])')"

step() { printf '\n== %s ==\n' "$1"; }
[ -n "${CF_ACCESS_CLIENT_ID:-}" ] && [ -n "${CF_ACCESS_CLIENT_SECRET:-}" ] || {
  echo "Faltan CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET en esta terminal (las mismas que usaste con 10_verify_external.sh)."; exit 2; }
[ -s "$KEYFILE" ] || { echo "no hay $KEYFILE"; exit 2; }

TMP="$(mktemp -d)"; chmod 700 "$TMP"; trap 'rm -rf "$TMP"' EXIT
printf 'CF-Access-Client-Id: %s\nCF-Access-Client-Secret: %s\n' "$CF_ACCESS_CLIENT_ID" "$CF_ACCESS_CLIENT_SECRET" > "$TMP/access.h"
printf 'Authorization: Bearer %s\n' "$(<"$KEYFILE")" > "$TMP/bearer.h"
chmod 600 "$TMP"/*.h
BODY='{"model":"'"$ALIAS"'","messages":[{"role":"user","content":"Responde solo con la palabra: ok"}],"max_tokens":16,"temperature":0,"stream":false,"chat_template_kwargs":{"enable_thinking":false}}'
echo "$(date '+%F %T') | destino: $BASE | urllib de este Python anuncia: $PYV"

step "A. curl (mismas credenciales) variando SOLO el User-Agent"
curl_ua() { # $1 = etiqueta, $2 = valor de -A (vacio = sin cabecera User-Agent)
  local c
  c="$(curl -s -o "$TMP/body.txt" -m 60 -w '%{http_code}' -A "$2" -X POST -H @"$TMP/access.h" -H @"$TMP/bearer.h" \
       -H 'Content-Type: application/json' -H 'Accept: text/event-stream' -d "$BODY" "$BASE/v1/chat/completions" || true)"
  printf '%-44s -> %s' "$1" "$c"
  if [ "$c" != "200" ]; then printf '   | cuerpo: %s' "$(head -c 160 "$TMP/body.txt" | tr '\n\r' '  ')"; fi
  printf '\n'
}
curl_ua "curl, UA por defecto (curl/x.y)" "curl/8.5.0"
curl_ua "curl, UA = $PYV (el de urllib)" "$PYV"
curl_ua "curl, sin User-Agent" ""
curl_ua "curl, UA = monedario-reddit-assist/1.0" "monedario-reddit-assist/1.0"

step "B. urllib (el mismo cliente que 05 y que el asistente): UA por defecto frente a UA propio"
python3 - "$BASE" "$KEYFILE" <<'PY'
import json, os, sys, urllib.request, urllib.error
base, keyfile = sys.argv[1], sys.argv[2]
key = open(keyfile).read().strip()
body = json.dumps({"model": "qwen3.5-35b-a3b", "stream": False, "max_tokens": 16, "temperature": 0,
                   "messages": [{"role": "user", "content": "Responde solo con la palabra: ok"}],
                   "chat_template_kwargs": {"enable_thinking": False}}).encode()
def go(label, ua):
    h = {"Content-Type": "application/json", "Accept": "text/event-stream", "Authorization": "Bearer " + key,
         "CF-Access-Client-Id": os.environ["CF_ACCESS_CLIENT_ID"], "CF-Access-Client-Secret": os.environ["CF_ACCESS_CLIENT_SECRET"]}
    if ua: h["User-Agent"] = ua
    req = urllib.request.Request(base.rstrip("/") + "/v1/chat/completions", data=body, headers=h, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            print(f"{label:<44} -> {r.status}")
    except urllib.error.HTTPError as e:
        raw = e.read(200).decode("utf-8", "replace").replace("\n", " ").replace("\r", " ")
        hd = {k.lower(): v for k, v in e.headers.items()}
        keep = {k: hd[k] for k in ("content-type", "server", "cf-mitigated", "cf-ray") if k in hd}
        print(f"{label:<44} -> {e.code}   | cabeceras: {keep} | cuerpo: {raw}")
    except Exception as e:
        print(f"{label:<44} -> fallo de red: {type(e).__name__}")
go("urllib, UA por defecto (como 05/asistente)", None)
go("urllib, UA = monedario-reddit-assist/1.0", "monedario-reddit-assist/1.0")
PY

step "Como leerlo"
echo "Si 'curl con UA de urllib' y 'urllib por defecto' dan 403 pero los UA propios dan 200: es el User-Agent (regla de Cloudflare sobre firmas de bot / Browser Integrity Check)."
echo "Si TODAS dan 403 salvo curl por defecto: distinto patron; pegame la salida y lo miramos."
step "Fin"
