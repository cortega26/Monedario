#!/usr/bin/env bash
# diag_llm_host.sh — diagnostico de SOLO LECTURA para el despliegue de llama-server + cloudflared.
# No instala, no escribe, no cambia nada. No lee secretos: de ~/.config/llama-server.env,
# ~/.cloudflared/* y del historial de la shell solo mira si existen y su modo, nunca el contenido.
# Uso:   bash diag_llm_host.sh > diag_llm_host.txt 2>&1
# Luego adjunta diag_llm_host.txt en el chat (no contiene secretos).
set -u
export LC_ALL=C

sec() { printf '\n===== %s =====\n' "$1"; }
has() { command -v "$1" >/dev/null 2>&1; }

sec "Fecha y usuario"
date -Is; echo "user=$(id -un) uid=$(id -u) home=$HOME"; uname -srm
[ -r /etc/os-release ] && . /etc/os-release && echo "distro=${PRETTY_NAME:-?}"

sec "CPU / RAM / disco"
has lscpu && lscpu | grep -E 'Model name|^CPU\(s\)|Thread|Core|Socket|Flags' | sed -E 's/(Flags:).*/\1 (avx2:'"$(grep -c -m1 avx2 /proc/cpuinfo)"' avx512f:'"$(grep -c -m1 avx512f /proc/cpuinfo)"' fma:'"$(grep -c -m1 ' fma' /proc/cpuinfo)"')/'
free -h
echo "-- disco (home y /tmp):"; df -h "$HOME" /tmp 2>/dev/null

sec "GPU"
if has nvidia-smi; then nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader; else echo "nvidia-smi: no encontrado"; fi
has lspci && lspci 2>/dev/null | grep -iE 'vga|3d|display' || echo "lspci: no disponible o sin GPU listada"

sec "Herramientas de compilacion y utilidades"
for t in git cmake make gcc g++ ninja pkg-config curl openssl python3 jq pip3 huggingface-cli hf ollama; do
  if has "$t"; then
    if [ "$t" = openssl ]; then v="$(openssl version 2>&1 | head -1)"; else v="$($t --version 2>&1 | head -1)"; fi
    printf '%-16s %s\n' "$t" "$v"
  else printf '%-16s (no encontrado)\n' "$t"; fi
done

sec "llama.cpp"
for b in llama-server llama-cli; do
  if has "$b"; then echo "$b -> $(command -v "$b")"; "$b" --version 2>&1 | head -3; else echo "$b: no encontrado en PATH"; fi
done
echo "-- candidatos en disco (nombre, sin ejecutar):"
find "$HOME" -maxdepth 6 \( -name 'llama-server' -o -name 'llama-cli' \) -type f -perm -u+x 2>/dev/null | head -10
find "$HOME" -maxdepth 4 -type d -name 'llama.cpp*' 2>/dev/null | head -5
if has llama-server; then
  echo "-- flags relevantes en 'llama-server --help':"
  llama-server --help 2>&1 | grep -E -- '--(host|port|api-key|api-key-file|jinja|ctx-size|parallel|cache-reuse|threads|threads-batch|n-gpu-layers|flash-attn|mlock|no-mmap|chat-template-kwargs|reasoning|json-schema)\b|^ *-(c|np|t|tb|ngl|fa|m),' | head -40
fi

sec "GGUF presentes (>1 GB, nombre y tamano)"
find "$HOME" -maxdepth 6 -type f -iname '*.gguf' -size +1G -printf '%s\t%p\n' 2>/dev/null | sort -rn | head -15 | awk -F'\t' '{printf "%.1f GB\t%s\n",$1/1073741824,$2}'
has ollama && { echo "-- ollama list:"; ollama list 2>&1 | head -15; }

sec "cloudflared"
if has cloudflared; then echo "$(command -v cloudflared)"; cloudflared --version 2>&1 | head -2; else echo "cloudflared: no encontrado en PATH"; fi
echo "-- ~/.cloudflared (solo nombres, modo y tamano; NO contenido):"
ls -la "$HOME/.cloudflared" 2>&1 | sed -E 's/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/<UUID-TUNEL>/g'
[ -e "$HOME/.cloudflared/cert.pem" ] && echo "cert.pem: EXISTE (login previo; 'tunnel login' podria sobrescribirlo)" || echo "cert.pem: no existe"
[ -e "$HOME/.cloudflared/config.yml" ] && echo "config.yml: EXISTE (no se muestra; revisar antes de sobrescribir)" || echo "config.yml: no existe"
has cloudflared && echo "-- servicios cloudflared del sistema:" && systemctl list-units --all --no-legend 'cloudflared*' 2>/dev/null

sec "systemd de usuario"
systemctl --user --version 2>&1 | head -1
echo "-- unidades de usuario presentes:"; ls -la "$HOME/.config/systemd/user" 2>&1 | head -30
echo "-- llama-server / cloudflared-llm ya definidos?"
systemctl --user list-unit-files --no-legend 'llama-server*' 'cloudflared-llm*' 2>&1
echo "-- linger:"; loginctl show-user "$(id -un)" -p Linger 2>&1
echo "-- archivo de entorno (solo existencia y modo; NO contenido):"
if [ -e "$HOME/.config/llama-server.env" ]; then stat -c '%a %U %s bytes %n' "$HOME/.config/llama-server.env"; else echo "~/.config/llama-server.env: no existe"; fi

sec "Red local"
echo "-- quien escucha en 8080 (si alguien):"; (ss -ltnp 2>/dev/null || ss -ltn 2>/dev/null) | grep -E ':8080\b' || echo "nadie escucha en :8080"
echo "-- resolucion DNS de llm.monedario.cl (todavia no deberia existir):"; getent hosts llm.monedario.cl || echo "sin registro"
echo "-- salida a Cloudflare (solo codigo HTTP):"; curl -s -o /dev/null -m 10 -w 'https://www.cloudflare.com -> %{http_code}\n' https://www.cloudflare.com || echo "sin salida HTTPS"

sec "Fin"
echo "Diagnostico completo. Nada fue modificado."
