#!/usr/bin/env bash
# 13_move_tunnel_config.sh — mueve la configuracion del tunel llm-monedario a un archivo PROPIO (~/.cloudflared/llm-monedario.yml)
# y deja de usar ~/.cloudflared/config.yml, para restaurar el comportamiento previo de cloudflared en tu PC.
# Por que: cloudflared, cuando no le pasas --config, busca primero ~/.cloudflared/config.yml y luego /etc/cloudflared/config.yml.
# Tu /etc/cloudflared/config.yml (del 4-ago) declara "tunnel: noticiencias-webhook". Yo cree ~/.cloudflared/config.yml para llm-monedario;
# eso hace que cualquier comando manual SIN --config (tunnel run, route dns...) use ahora llm-monedario en vez de noticiencias-webhook.
# El servicio cloudflared-llm ya pasa --config explicito, asi que no depende de ese nombre.
# Que hace: (1) copia la config a llm-monedario.yml y la valida; (2) apunta la unidad de systemd al archivo nuevo (con backup);
# (3) reinicia SOLO cloudflared-llm (unos segundos sin conexion; nadie lo usa aun) y espera a que el tunel reconecte;
# (4) si todo va bien, renombra config.yml a config.yml.bak-<fecha>; si algo falla, restaura la unidad y sigue como estaba.
# No toca /etc, ni el tunel noticiencias-webhook, ni llama-server, ni nada en Cloudflare. Sin sudo. Re-ejecutable.
# Uso:   bash "Claude outputs/13_move_tunnel_config.sh"        Resultado (lo leo yo): move_config_result.txt
set -uo pipefail
export LC_ALL=C

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULT="$OUT_DIR/move_config_result.txt"
: > "$RESULT"
exec > >(tee -a "$RESULT") 2>&1

CFDIR="$HOME/.cloudflared"
OLD="$CFDIR/config.yml"
NEW="$CFDIR/llm-monedario.yml"
UNIT="$HOME/.config/systemd/user/cloudflared-llm.service"
CF="$(command -v cloudflared || true)"
HOST_FQDN="${HOSTNAME_FQDN:-llm.monedario.cl}"
STAMP="$(date +%Y%m%d-%H%M%S)"
UUID_RE='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

step() { printf '\n== %s ==\n' "$1"; }
die()  { echo "ERROR: $*"; echo "(No se cambio nada mas de lo indicado arriba.)"; exit 1; }

step "1. Comprobaciones previas (solo lectura)"
[ -n "$CF" ] || die "cloudflared no esta en el PATH"
[ -f "$UNIT" ] || die "no existe $UNIT"
systemctl --user is-active --quiet cloudflared-llm || die "cloudflared-llm no esta activo ahora; no toco nada"
if [ ! -f "$OLD" ] && [ -f "$NEW" ] && grep -qF -- "--config $NEW" "$UNIT"; then
  echo "Ya esta hecho: la unidad usa $NEW y $OLD no existe. Nada que cambiar."; exit 0
fi
[ -f "$OLD" ] || die "no existe $OLD (y la unidad aun no usa $NEW): estado inesperado, pegame la salida"
grep -qF -- "--config $OLD" "$UNIT" || die "la unidad no usa --config $OLD; estado inesperado"
TID="$(awk -F': *' '$1=="tunnel"{print $2; exit}' "$OLD" | tr -d '\r ')"
RUNID="$(grep -oE "run $UUID_RE" "$UNIT" | awk '{print $2}' | head -1)"
[[ "$TID" =~ ^$UUID_RE$ ]] || die "el 'tunnel:' de $OLD no es un UUID"
[ "$TID" = "$RUNID" ] || die "el UUID de la config (${TID:0:8}…) no coincide con el de la unidad (${RUNID:0:8}…)"
CRED="$(awk -F': *' '$1=="credentials-file"{print $2; exit}' "$OLD" | tr -d '\r')"
[ -f "$CRED" ] || die "no existe el archivo de credenciales indicado en la config"
echo "config actual : tunel ${TID:0:8}…${TID: -4} (coincide con la unidad) | credenciales presentes (no se muestran)"
echo "config global : $(sed -n 's/^tunnel: *//p' /etc/cloudflared/config.yml 2>/dev/null | head -1) (/etc/cloudflared/config.yml, no se toca)"
echo "hoy, sin --config, cloudflared usaria: $("$CF" tunnel ingress validate 2>&1 | sed -n 's/^Validating rules from //p' | head -1)"

step "2. Crear $NEW y validarla"
if [ ! -f "$NEW" ]; then cp -p "$OLD" "$NEW"; else cp -p "$NEW" "$NEW.bak-$STAMP"; cp -p "$OLD" "$NEW"; echo "ya existia: backup $NEW.bak-$STAMP"; fi
chmod 600 "$NEW"
"$CF" tunnel --config "$NEW" ingress validate 2>&1 | head -3
"$CF" tunnel --config "$NEW" ingress validate >/dev/null 2>&1 || { rm -f "$NEW"; die "la configuracion nueva no valida; borre la copia y no cambie nada mas"; }
"$CF" tunnel --config "$NEW" ingress rule "https://$HOST_FQDN/v1/chat/completions" 2>&1 | head -4

step "3. Apuntar la unidad al archivo nuevo (con backup) y reiniciar SOLO cloudflared-llm"
cp -p "$UNIT" "$UNIT.bak-$STAMP" && echo "backup: $UNIT.bak-$STAMP"
sed -i "s#--config $OLD#--config $NEW#" "$UNIT"
grep -qF -- "--config $NEW" "$UNIT" || { cp -p "$UNIT.bak-$STAMP" "$UNIT"; die "no pude editar la unidad; restaurada"; }
echo "ExecStart ahora: $(grep '^ExecStart=' "$UNIT" | sed -E "s/$UUID_RE/<UUID>/g")"
T0="$(date '+%F %T')"
systemctl --user daemon-reload
systemctl --user restart cloudflared-llm
n=0; t0="$(date +%s)"
while [ $(( $(date +%s) - t0 )) -lt 90 ]; do
  n="$(journalctl --user -u cloudflared-llm --since "$T0" --no-pager -o cat 2>/dev/null | grep -c 'Registered tunnel connection' || true)"
  [ "${n:-0}" -ge 4 ] && break
  systemctl --user is-active --quiet cloudflared-llm || break
  sleep 3
done
echo "conexiones registradas tras el reinicio: ${n:-0} (esperado 4) en $(( $(date +%s) - t0 )) s"
if [ "${n:-0}" -lt 1 ] || ! systemctl --user is-active --quiet cloudflared-llm; then
  echo "FALLO: el tunel no reconecto con la config nueva. Restauro la unidad anterior y reinicio."
  cp -p "$UNIT.bak-$STAMP" "$UNIT"; systemctl --user daemon-reload; systemctl --user restart cloudflared-llm
  sleep 8; echo "estado tras restaurar: $(systemctl --user is-active cloudflared-llm)"
  journalctl --user -u cloudflared-llm --since "$T0" --no-pager -o cat 2>/dev/null | grep -E 'ERR|error|failed' | tail -5
  exit 1
fi
[ "${n:-0}" -ge 4 ] || echo "AVISO: solo ${n} conexion(es) por ahora; cloudflared suele abrir 4 (puede tardar unos segundos mas)"

step "4. Retirar el config.yml de ~/.cloudflared (renombrar, no borrar)"
mv -n "$OLD" "$OLD.bak-$STAMP" && echo "renombrado a $OLD.bak-$STAMP"
echo "ahora, sin --config, cloudflared usaria: $("$CF" tunnel ingress validate 2>&1 | sed -n 's/^Validating rules from //p' | head -1)   (esperado: /etc/cloudflared/config.yml, como antes de mi cambio)"
ls -l "$CFDIR" | awk 'NR>1{print $1, $NF}' | sed -E "s/$UUID_RE/<UUID>/g"

step "5. Verificacion final"
echo "servicio: activo=$(systemctl --user is-active cloudflared-llm) habilitado=$(systemctl --user is-enabled cloudflared-llm)"
sleep 3
for p in /v1/models /health; do echo "externo GET $p sin credenciales -> $(curl -s -o /dev/null -m 20 -w '%{http_code}' "https://$HOST_FQDN$p")   (esperado 302/401/403, nunca 200)"; done
echo
echo "Nota para el futuro: para operar el tunel llm-monedario a mano usa siempre  cloudflared tunnel --config $NEW ...  (p. ej. route dns)."
echo "Para volver atras: cp -p \"$UNIT.bak-$STAMP\" \"$UNIT\" && mv \"$OLD.bak-$STAMP\" \"$OLD\" && systemctl --user daemon-reload && systemctl --user restart cloudflared-llm"
step "Fin"
