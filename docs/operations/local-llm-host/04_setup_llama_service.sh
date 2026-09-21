#!/usr/bin/env bash
# 04_setup_llama_service.sh — crea y arranca el servicio de usuario llama-server y hace pruebas de acceso.
# Requisitos: 02_install_llama_cpp.sh y 03_download_model.sh terminados, y la clave creada por TI:
#     ( umask 077; openssl rand -hex 32 > ~/.config/llama-server.key ); chmod 600 ~/.config/llama-server.key
# La clave NUNCA se imprime: llama-server la lee con --api-key-file (asi no aparece en 'ps' ni en 'systemctl status').
# Solo toca: ~/.config/systemd/user/llama-server.service (con backup si ya existia) y el servicio de usuario.
# Escucha SOLO en 127.0.0.1. No abre puertos, no toca el router.
# Uso:   bash "Claude outputs/04_setup_llama_service.sh"
# Resultado (lo leo yo): service_result.txt junto a este script.
set -euo pipefail
export LC_ALL=C

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULT="$OUT_DIR/service_result.txt"
: > "$RESULT"
exec > >(tee -a "$RESULT") 2>&1

BIN="${LLAMA_BIN:-$HOME/llama.cpp/build/bin/llama-server}"
MODEL="${MODEL:-$HOME/models/qwen3.5-35b-a3b/Qwen3.5-35B-A3B-Q4_K_M.gguf}"
KEYFILE="${KEYFILE:-$HOME/.config/llama-server.key}"
UNIT_DIR="$HOME/.config/systemd/user"
UNIT="$UNIT_DIR/llama-server.service"
PORT="${PORT:-8080}"
ALIAS="qwen3.5-35b-a3b"
THREADS="${THREADS:-8}"          # PROVISIONAL: se ajusta despues con llama-bench
CTX=16384
EXPECT_SIZE=22016023168
ME="$(id -un)"
BASE="http://127.0.0.1:$PORT"

step() { printf '\n== %s ==\n' "$1"; }
fail() { echo "ERROR: $*"; exit 1; }
safe_journal() { journalctl --user -u llama-server -n "$1" --no-pager -o cat 2>&1 | grep -vFf "$KEYFILE" || true; }

step "Comprobaciones previas"
[ -x "$BIN" ] || fail "no existe $BIN (¿corrio 02_install_llama_cpp.sh?)"
if [ ! -f "$MODEL" ] || [ "$(stat -c %s "$MODEL")" != "$EXPECT_SIZE" ]; then
  fail "modelo ausente o con tamano distinto a $EXPECT_SIZE: $MODEL (¿termino 03_download_model.sh?)"
fi
if [ ! -s "$KEYFILE" ]; then
  echo "Falta la clave de API. Crea la TU (no la pegues en el chat) y vuelve a ejecutar este script:"
  echo "    ( umask 077; openssl rand -hex 32 > ~/.config/llama-server.key ); chmod 600 ~/.config/llama-server.key"
  exit 2
fi
mode="$(stat -c %a "$KEYFILE")"
[ "$mode" = "600" ] || fail "el archivo de clave tiene modo $mode; debe ser 600 (chmod 600 $KEYFILE)"
grep -qE '^[0-9a-f]{64}$' "$KEYFILE" || fail "formato de clave inesperado (se esperaba la salida de 'openssl rand -hex 32')"
echo "clave: presente, modo 600, formato OK (no se muestra)"
if ss -ltn 2>/dev/null | grep -qE ":$PORT\b"; then
  systemctl --user is-active --quiet llama-server 2>/dev/null || fail "el puerto $PORT ya esta ocupado por otro proceso"
fi

step "Verificar cada flag contra 'llama-server --help' de ESTA version"
HELP="$("$BIN" --help 2>&1 || true)"
missing=0
for f in -m --alias --host --port --api-key-file --jinja -c -np --cache-reuse -t --no-webui; do
  if grep -qE -- "(^|[[:space:],])${f}([[:space:],]|\$)" <<<"$HELP"; then echo "ok     $f"; else echo "FALTA  $f"; missing=1; fi
done
[ "$missing" = 0 ] || fail "esta version no reconoce algun flag; no escribo el servicio"

step "Escribir la unidad de usuario"
mkdir -p "$UNIT_DIR"
if [ -e "$UNIT" ]; then cp -p "$UNIT" "$UNIT.bak-$(date +%Y%m%d-%H%M%S)"; echo "ya existia: guarde backup"; fi
cat > "$UNIT" <<EOF
[Unit]
Description=llama-server (asistente Reddit de Monedario) - Qwen3.5-35B-A3B
After=network-online.target

[Service]
ExecStart=$BIN \\
  -m $MODEL \\
  --alias $ALIAS \\
  --host 127.0.0.1 --port $PORT \\
  --api-key-file $KEYFILE \\
  --jinja -c $CTX -np 1 --cache-reuse 256 \\
  -t $THREADS --no-webui
Nice=10
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
EOF
echo "escrita: $UNIT"
echo "--- contenido (no contiene secretos):"; cat "$UNIT"

step "Habilitar y arrancar"
systemctl --user daemon-reload
systemctl --user enable --now llama-server
loginctl enable-linger "$ME"
echo "linger: $(loginctl show-user "$ME" -p Linger)"

step "Esperar a que cargue el modelo (hasta 300 s)"
t0="$(date +%s)"; ready=0
while [ $(( $(date +%s) - t0 )) -lt 300 ]; do
  c="$(curl -s -o /dev/null -m 3 -w '%{http_code}' "$BASE/health" || true)"
  if [ "$c" = "200" ]; then ready=1; break; fi
  if ! systemctl --user is-active --quiet llama-server; then echo "el servicio se detuvo mientras cargaba"; break; fi
  sleep 2
done
echo "listo=$ready | tiempo hasta /health=200: $(( $(date +%s) - t0 )) s"
if [ "$ready" != 1 ]; then
  echo "-- ultimas lineas del journal (filtradas):"; safe_journal 60 | tail -40
  fail "llama-server no quedo listo"
fi

HDR="$(mktemp)"; RESP="$(mktemp)"; chmod 600 "$HDR" "$RESP"
trap 'rm -f "$HDR" "$RESP"' EXIT
printf 'Authorization: Bearer %s\n' "$(<"$KEYFILE")" > "$HDR"     # 'printf' es interno: la clave no pasa por ninguna linea de comandos
code() { curl -s -o /dev/null -m 60 -w '%{http_code}' "$@" || true; }

step "Pruebas de acceso locales (codigos HTTP)"
BODY='{"model":"'"$ALIAS"'","messages":[{"role":"user","content":"Responde solo con la palabra: ok"}],"max_tokens":16,"temperature":0,"stream":false,"chat_template_kwargs":{"enable_thinking":false}}'
echo "GET  /health               sin clave -> $(code "$BASE/health")      (publico por diseno)"
echo "GET  /v1/models            sin clave -> $(code "$BASE/v1/models")      (el encargo esperaba 401; ver nota abajo)"
echo "GET  /v1/models            con clave -> $(code -H @"$HDR" "$BASE/v1/models")      (esperado 200)"
echo "POST /v1/chat/completions  sin clave -> $(code -X POST -H 'Content-Type: application/json' -d "$BODY" "$BASE/v1/chat/completions")      (esperado 401)"
echo "POST /v1/chat/completions  clave mala-> $(code -X POST -H 'Authorization: Bearer clave-incorrecta' -H 'Content-Type: application/json' -d "$BODY" "$BASE/v1/chat/completions")      (esperado 401)"
echo "NOTA: en algunas versiones de llama-server /v1/models es publico aunque haya clave; lo decisivo es el POST."

step "Peticion pequena con clave (tiempos y velocidad)"
curl -s -m 180 -H @"$HDR" -H 'Content-Type: application/json' -d "$BODY" -o "$RESP" \
     -w 'http=%{http_code} primer_byte=%{time_starttransfer}s total=%{time_total}s\n' "$BASE/v1/chat/completions" || echo "curl fallo"
echo "-- respuesta del modelo y uso:"
jq -r '.choices[0].message.content // "(sin contenido)"' "$RESP" 2>/dev/null | head -3
jq -c '.usage // empty' "$RESP" 2>/dev/null | head -1
jq -c '.timings // empty | {prompt_n, prompt_per_second, predicted_n, predicted_per_second}' "$RESP" 2>/dev/null | head -1
echo "-- nombre del modelo que anuncia /v1/models:"
curl -s -m 20 -H @"$HDR" "$BASE/v1/models" | jq -r '.data[]?.id' 2>/dev/null | head -3

step "Exposicion y secretos"
echo "-- sockets en :$PORT (debe ser SOLO 127.0.0.1):"
ss -ltnp 2>/dev/null | grep -E ":$PORT\b" || echo "(no se pudo listar)"
PID="$(systemctl --user show -p MainPID --value llama-server 2>/dev/null || echo 0)"
if [ -n "$PID" ] && [ "$PID" != "0" ] && [ -r "/proc/$PID/cmdline" ]; then
  n="$(tr '\0' '\n' < "/proc/$PID/cmdline" | grep -cFf "$KEYFILE" || true)"
  echo "apariciones de la clave en la linea de comandos del proceso $PID: ${n:-0}   (debe ser 0)"
  awk '/VmRSS/{printf "memoria residente (RSS): %.1f GB\n",$2/1048576}' "/proc/$PID/status"
fi
echo "-- systemctl --user status:"
systemctl --user status llama-server --no-pager -n 0 2>&1 | head -14
echo "-- journal filtrado (lineas utiles; sin la clave):"
safe_journal 400 | grep -E 'system_info|n_threads|arch|n_ctx|n_slots|listening|error|warn|flash|CPU' | head -25

step "Fin"
echo "OK: servicio creado, habilitado y arrancado. Falta (otro script): latencia con prompt real y medicion de hilos."
