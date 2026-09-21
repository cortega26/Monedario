#!/usr/bin/env bash
# 09_setup_tunnel.sh — crea el tunel NUEVO "llm-monedario", ~/.cloudflared/llm-monedario.yml, la ruta DNS llm.monedario.cl (con --config) y el servicio
# de usuario cloudflared-llm (Restart=always). NO necesita ningun secreto tuyo: solo usa tu cert.pem existente (nunca se imprime).
# Si algo no cuadra, se detiene ANTES de crear nada y dice por que. Es re-ejecutable (idempotente).
# NO toca el tunel existente "reddit-monitor" ni el registro reddit.monedario.cl. Escucha solo en 127.0.0.1 (llama-server ya lo hace).
# Requisitos: llama-server activo; app de Access "llm-monedario" ya creada en el panel (ya lo esta).
# Uso:   bash "Claude outputs/09_setup_tunnel.sh"
# Resultado (lo leo yo): tunnel_setup_result.txt junto a este script.
# Reversion completa:
#   systemctl --user disable --now cloudflared-llm ; rm -f ~/.config/systemd/user/cloudflared-llm.service ; systemctl --user daemon-reload
#   cloudflared tunnel delete llm-monedario   (y borra el registro CNAME "llm" en el DNS de monedario.cl y la app/token en Zero Trust)
set -uo pipefail
export LC_ALL=C

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULT="$OUT_DIR/tunnel_setup_result.txt"
: > "$RESULT"
exec > >(tee -a "$RESULT") 2>&1

NAME="${TUNNEL_NAME:-llm-monedario}"
HOST_FQDN="${HOSTNAME_FQDN:-llm.monedario.cl}"
ORIGIN="http://127.0.0.1:8080"
# IDs de la zona monedario.cl y de tu cuenta, leidos del panel de Cloudflare (no son secretos; sirven para comprobar el cert.pem)
EXPECT_ZONE="${EXPECT_ZONE:-9d53871bed75e9ad5d4cc5da84a18fcf}"
EXPECT_ACCOUNT="${EXPECT_ACCOUNT:-7e153214690ac7430fde021f1f2b2916}"
CF="$(command -v cloudflared || true)"
CFDIR="$HOME/.cloudflared"
CFG="$CFDIR/llm-monedario.yml"   # config PROPIA del tunel (antes: config.yml, que cambiaba el comportamiento de cloudflared en el PC)
CERT="$CFDIR/cert.pem"
UNIT_DIR="$HOME/.config/systemd/user"
UNIT="$UNIT_DIR/cloudflared-llm.service"
ME="$(id -un)"

step() { printf '\n== %s ==\n' "$1"; }
die()  { echo "ERROR: $*"; echo "(Detenido. El script es re-ejecutable: cuando se resuelva, vuelve a correrlo. Lo ya creado no se duplica.)"; exit 1; }
warn() { echo "AVISO: $*"; }
code() { curl -s -o /dev/null -m 30 -w '%{http_code}' "$@" || true; }

step "1. Comprobaciones previas (solo lectura)"
[ -n "$CF" ] || die "cloudflared no esta en el PATH"
echo "cloudflared: $CF | $("$CF" --version 2>&1 | head -1)"
command -v jq >/dev/null 2>&1 || die "falta jq"
systemctl --user is-active --quiet llama-server || die "llama-server no esta activo (systemctl --user status llama-server)"
c="$(curl -s -o /dev/null -m 5 -w '%{http_code}' http://127.0.0.1:8080/health || true)"
[ "$c" = "200" ] || die "llama-server no responde 200 en /health (dio '$c')"
echo "llama-server: activo y /health=200"
echo "escucha en :8080 -> $(ss -ltn 2>/dev/null | grep -E ':8080\b' | awk '{print $4}' | paste -sd' ')   (debe ser solo 127.0.0.1:8080)"
if systemctl --user is-active --quiet cloudflared-llm 2>/dev/null; then echo "cloudflared-llm ya estaba activo: se reutiliza"; fi

step "2. Flags de ESTA version de cloudflared (verificados con --help)"
need_flag() { # $1 = texto de ayuda, $2 = flag, $3 = descripcion
  grep -qE -- "(^|[[:space:],])$2([[:space:],=]|\$)" <<<"$1" && echo "ok     $3: $2" || return 1
}
H_TUN="$("$CF" tunnel --help 2>&1)"
H_LIST="$("$CF" tunnel list --help 2>&1)"
H_ROUTE="$("$CF" tunnel route dns --help 2>&1)"
for w in create list route run; do
  grep -qE "^ +${w}( |\$)" <<<"$H_TUN" && echo "ok     subcomando tunnel $w" || die "esta version no lista el subcomando 'tunnel $w'"
done
for w in delete ingress; do
  grep -qE "^ +${w}( |\$)" <<<"$H_TUN" && echo "ok     subcomando tunnel $w" || warn "no veo 'tunnel $w' en la ayuda (no es imprescindible)"
done
NOAUTO=""; need_flag "$H_TUN" --no-autoupdate "tunnel" && NOAUTO="--no-autoupdate" || warn "--no-autoupdate no aparece en la ayuda: no lo uso"
need_flag "$H_TUN" --config "tunnel" || die "esta version no reconoce --config en 'tunnel'"
LIST_JSON=0; need_flag "$H_LIST" --output "tunnel list" && LIST_JSON=1 || warn "'tunnel list --output' no disponible: leo la tabla de texto"
grep -qiE 'overwrite-dns' <<<"$H_ROUTE" && echo "ok     tunnel route dns: --overwrite-dns existe (NO lo uso)"

step "3. cert.pem: ¿corresponde a la zona monedario.cl y a tu cuenta? (no se imprime su contenido)"
[ -r "$CERT" ] || die "no hay $CERT. Ejecuta primero:  cloudflared tunnel login   (elige monedario.cl en el navegador) y vuelve a correr este script"
blob="$(sed -n '/BEGIN ARGO TUNNEL TOKEN/,/END ARGO TUNNEL TOKEN/p' "$CERT" | grep -v -- '-----' | tr -d '\n ')"
[ -n "$blob" ] || die "el cert.pem no tiene el formato esperado (bloque ARGO TUNNEL TOKEN)"
json="$(printf '%s' "$blob" | base64 -d 2>/dev/null || true)"
zid="$(printf '%s' "$json" | jq -r '.zoneID // empty' 2>/dev/null || true)"
aid="$(printf '%s' "$json" | jq -r '.accountID // empty' 2>/dev/null || true)"
unset json blob
[ -n "$zid" ] && [ -n "$aid" ] || die "no pude leer zoneID/accountID del cert.pem"
if [ "$zid" = "$EXPECT_ZONE" ]; then echo "zona del cert.pem = monedario.cl (${zid:0:4}…${zid: -4}): OK"
else
  echo "zona del cert.pem = ${zid:0:4}…${zid: -4}   (esperada ${EXPECT_ZONE:0:4}…${EXPECT_ZONE: -4})"
  die "el cert.pem es de OTRA zona. 'route dns' crearia el registro en la zona equivocada (p. ej. llm.monedario.cl.otrodominio.com). Renombra el cert y vuelve a iniciar sesion:  mv ~/.cloudflared/cert.pem ~/.cloudflared/cert.pem.bak-\$(date +%Y%m%d) && cloudflared tunnel login   (elige monedario.cl)"
fi
[ "$aid" = "$EXPECT_ACCOUNT" ] && echo "cuenta del cert.pem = tu cuenta (${aid:0:4}…${aid: -4}): OK" || die "el cert.pem es de otra cuenta de Cloudflare"
unset zid aid

step "4. Tuneles existentes en la cuenta (nombres e IDs; no se toca ninguno que no sea $NAME)"
LISTTXT="$(timeout 60 "$CF" tunnel list 2>&1)" || die "'cloudflared tunnel list' fallo: $(head -3 <<<"$LISTTXT")"
echo "$LISTTXT" | head -20
tunnel_id() {
  if [ "$LIST_JSON" = 1 ]; then
    timeout 60 "$CF" tunnel list --output json 2>/dev/null | jq -r --arg n "$NAME" '[.[]? | select(.name==$n)][0].id // empty'
  else
    timeout 60 "$CF" tunnel list 2>/dev/null | awk -v n="$NAME" '$2==n {print $1; exit}'
  fi
}
ID="$(tunnel_id)"
if [ -n "$ID" ]; then
  echo "el tunel '$NAME' YA existe (${ID:0:8}…)"
  [ -f "$CFDIR/$ID.json" ] || die "existe '$NAME' en Cloudflare pero no tengo su archivo de credenciales local ($ID.json). Si es un intento anterior tuyo sin uso:  cloudflared tunnel delete $NAME  y vuelve a ejecutar este script"
  echo "credenciales locales presentes: se reutiliza"
else
  echo "el tunel '$NAME' no existe todavia"
fi

step "5. Crear el tunel (si hace falta)"
if [ -z "$ID" ]; then
  out="$(timeout 90 "$CF" tunnel create "$NAME" 2>&1)" || { echo "$out" | sed -E 's/[0-9a-f]{8}-[0-9a-f-]{27}/<UUID>/g' | head -8; die "'tunnel create' fallo"; }
  echo "$out" | sed -E 's/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/<UUID>/g' | head -6
  ID="$(tunnel_id)"
  [ -n "$ID" ] || die "cree el tunel pero no logro leer su ID con 'tunnel list'"
  [ -f "$CFDIR/$ID.json" ] || die "cree el tunel pero no aparece $CFDIR/$ID.json"
fi
chmod 600 "$CFDIR/$ID.json" 2>/dev/null || true
echo "tunel '$NAME': ${ID:0:8}…${ID: -4} | credenciales: $(stat -c '%a %U' "$CFDIR/$ID.json") (no se muestran)"
[[ "$ID" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]] || die "el ID del tunel no tiene formato UUID"

step "6. Archivo de configuracion PROPIO del tunel ($CFG)"
# Se escribe ANTES de 'route dns' y se pasa con --config: cloudflared, sin --config, lee primero ~/.cloudflared/config.yml y luego
# /etc/cloudflared/config.yml; en tu PC el de /etc declara 'tunnel: noticiencias-webhook' y 'route dns llm-monedario ...' creo el CNAME
# apuntando a ESE tunel. Con --config <este archivo> no depende de ningun otro. No se usa ~/.cloudflared/config.yml.
mkdir -p "$CFDIR"
if [ -e "$CFG" ]; then cp -p "$CFG" "$CFG.bak-$(date +%Y%m%d-%H%M%S)" && echo "ya existia config.yml: backup guardado"; fi
cat > "$CFG" <<EOF
tunnel: $ID
credentials-file: $CFDIR/$ID.json

ingress:
  - hostname: $HOST_FQDN
    service: $ORIGIN
  - service: http_status:404
EOF
chmod 600 "$CFG"
echo "--- $CFG (no contiene secretos):"; sed -E "s/$ID/<UUID>/g" "$CFG"
"$CF" tunnel --config "$CFG" ingress validate 2>&1 | head -5
"$CF" tunnel --config "$CFG" ingress rule "https://$HOST_FQDN/v1/chat/completions" 2>&1 | head -4
"$CF" tunnel --config "$CFG" ingress validate >/dev/null 2>&1 || die "la configuracion $CFG no valida; no sigo (no se creo ningun registro DNS)"
CFGID="$(awk -F': *' '$1=="tunnel"{print $2; exit}' "$CFG" | tr -d '\r ')"
[ "$CFGID" = "$ID" ] || die "el 'tunnel:' de $CFG no coincide con el ID de $NAME"

step "7. Ruta DNS: $HOST_FQDN -> tunel $NAME (con --config propio)"
rout="$(timeout 60 "$CF" tunnel --config "$CFG" route dns "$NAME" "$HOST_FQDN" 2>&1)"; rc=$?
echo "$rout" | sed -E 's/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/<UUID>/g' | head -6
if [ $rc -eq 0 ]; then
  if grep -qF "$HOST_FQDN which" <<<"$rout" || grep -qiE "already|exists" <<<"$rout"; then :; else
    warn "el mensaje de cloudflared no menciona exactamente '$HOST_FQDN': revisa en el panel que el registro no quedo en otra zona (p. ej. $HOST_FQDN.otrodominio.com)"
  fi
elif grep -qiE 'already exists|record with that host already exists' <<<"$rout"; then
  warn "ya habia un registro para $HOST_FQDN (¿ejecucion anterior?). Verifica en el panel DNS que apunta a ${ID:0:8}….cfargotunnel.com; no lo sobrescribo"
else
  die "'route dns' fallo (ver mensaje arriba)"
fi
echo "VERIFICA EN EL PANEL (DNS > monedario.cl): el CNAME '${HOST_FQDN%%.*}' debe apuntar a ${ID:0:8}….cfargotunnel.com (el de este tunel), con proxy activado."

step "8. Servicio de usuario cloudflared-llm.service"
mkdir -p "$UNIT_DIR"
if [ -e "$UNIT" ]; then cp -p "$UNIT" "$UNIT.bak-$(date +%Y%m%d-%H%M%S)" && echo "ya existia: backup guardado"; fi
cat > "$UNIT" <<EOF
[Unit]
Description=cloudflared tunnel $NAME (LLM local de Monedario -> $HOST_FQDN)
After=network-online.target llama-server.service
Wants=network-online.target

[Service]
ExecStart=$CF tunnel ${NOAUTO:+$NOAUTO }--config $CFG run $ID
Restart=always
RestartSec=5
TimeoutStopSec=20

[Install]
WantedBy=default.target
EOF
echo "--- contenido (sin secretos):"; sed -E "s/$ID/<UUID>/g" "$UNIT"
systemctl --user daemon-reload || die "daemon-reload fallo"
systemctl --user enable --now cloudflared-llm || die "no pude habilitar/arrancar cloudflared-llm"
systemctl --user restart cloudflared-llm || true
loginctl enable-linger "$ME" 2>/dev/null || true
echo "linger: $(loginctl show-user "$ME" -p Linger 2>/dev/null)"

step "9. Esperar conexiones del tunel con el borde de Cloudflare (hasta 90 s)"
t0="$(date +%s)"; n=0
while [ $(( $(date +%s) - t0 )) -lt 90 ]; do
  n="$(journalctl --user -u cloudflared-llm --since '-2 min' --no-pager -o cat 2>/dev/null | grep -c 'Registered tunnel connection' || true)"
  [ "${n:-0}" -ge 1 ] && break
  systemctl --user is-active --quiet cloudflared-llm || { echo "el servicio se detuvo"; break; }
  sleep 3
done
echo "conexiones registradas: ${n:-0} (cloudflared abre normalmente 4) tras $(( $(date +%s) - t0 )) s"
echo "-- journal (lineas utiles; ids y ubicaciones del borde, sin secretos):"
journalctl --user -u cloudflared-llm --since '-3 min' --no-pager -o cat 2>/dev/null | grep -E 'Registered tunnel connection|protocol|ERR|error|Unable|failed' | sed -E 's/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/<UUID>/g' | tail -12
[ "${n:-0}" -ge 1 ] || warn "el tunel no registro conexiones. Revisa:  journalctl --user -u cloudflared-llm -n 50 --no-pager   (puerto 7844 saliente)"

step "10. Prueba externa SIN credenciales (no hace falta ningun secreto): debe NO ser 200"
BODY='{"model":"qwen3.5-35b-a3b","messages":[{"role":"user","content":"ok"}],"max_tokens":8,"stream":false}'
ok_set() { case "$1" in 302|401|403) return 0;; *) return 1;; esac; }
# el DNS nuevo puede tardar unos segundos: reintento hasta 60 s mientras el resultado no sea uno de los esperados
t0="$(date +%s)"
while :; do
  g="$(code "https://$HOST_FQDN/v1/models")"
  p="$(code -X POST -H 'Content-Type: application/json' -d "$BODY" "https://$HOST_FQDN/v1/chat/completions")"
  h="$(code "https://$HOST_FQDN/health")"
  { [ "$g" = "200" ] || [ "$p" = "200" ] || [ "$h" = "200" ]; } && break
  ok_set "$g" && ok_set "$p" && ok_set "$h" && break
  [ $(( $(date +%s) - t0 )) -ge 60 ] && break
  sleep 6
done
echo "resolucion de $HOST_FQDN: $(getent hosts "$HOST_FQDN" | awk '{print $1}' | paste -sd' ' || true)"
echo "GET  /v1/models            sin cabeceras -> $g"
echo "POST /v1/chat/completions  sin cabeceras -> $p"
echo "GET  /health               sin cabeceras -> $h   (es publico en llama-server: Access debe bloquearlo tambien)"
loc="$(curl -s -o /dev/null -m 30 -D - "https://$HOST_FQDN/v1/models" | tr -d '\r' | awk 'tolower($1)=="location:"{print $2; exit}')"
locdom=""
if [ -n "$loc" ]; then locdom="$(sed -E 's#^(https?://[^/]+).*#\1#' <<<"$loc")"; echo "redireccion hacia: $locdom   (solo el dominio; esperado *.cloudflareaccess.com)"; fi
if [ "$g" = "200" ] || [ "$p" = "200" ] || [ "$h" = "200" ]; then
  echo "!!! ALGUNA RUTA DIO 200 SIN CREDENCIALES: el tunel esta expuesto sin proteccion. Apagalo YA:"
  echo "    systemctl --user disable --now cloudflared-llm"
  echo "    y revisa en Zero Trust que la app llm-monedario tenga la politica Service Auth y el dominio correcto."
  exit 2
fi
if ok_set "$g" && ok_set "$p" && ok_set "$h" && { [ "$g" != "302" ] || grep -q 'cloudflareaccess\.com' <<<"$locdom"; }; then
  echo "resultado: sin credenciales ninguna ruta dio 200 y Access respondio (302/401/403) -> bloqueo de Access VERIFICADO"
else
  echo "resultado: NO VERIFICADO. Codigos fuera de lo esperado (302/401/403): $g / $p / $h."
  echo "  530/1033/502/000 = el tunel o el DNS aun no estan listos (espera 1-2 min y ejecuta de nuevo el script); 404 = revisar hostname del ingress."
  echo "  Mientras tanto, ninguna ruta respondio 200, asi que no hay exposicion."
fi

step "11. Estado final"
systemctl --user status cloudflared-llm --no-pager -n 0 2>&1 | head -10
echo "habilitado: $(systemctl --user is-enabled cloudflared-llm 2>&1) | activo: $(systemctl --user is-active cloudflared-llm 2>&1)"
echo "procesos cloudflared (sin argumentos): $(ps -C cloudflared -o pid=,etime= | paste -sd';' )"
echo
echo "Siguiente (necesita TUS secretos, en tu terminal): 10_verify_external.sh con las credenciales de Access. Este script no lo ejecuta."
step "Fin"
