# Modelo local para el asistente IA (PC de Carlos + Cloudflare Tunnel)

Estado: preparado 2026-09-20, **sin desplegar** · Contexto: `PLAYBOOK.md` (sección "Asistente IA") y `docs/backlog/PLAN-reddit-assist-2026-09-20.md`.

El asistente (`assist.py`) corre en la VM. El modelo (Qwen3.5-35B-A3B, MoE con unos 3B parámetros activos) corre en tu PC (128 GB de RAM, siempre encendido) y se publica con un **túnel saliente de Cloudflare**. Se eligió así porque tu ISP (Entel) usa CGNAT con IP rotativa (~29 h): un túnel SSH inverso o cualquier regla por IP se rompería cada rotación, mientras que `cloudflared` solo hace conexiones salientes y no depende de tu IP. Tailscale se descartó para no instalar un demonio en la VM compartida.

```
VM: assist.py ──HTTPS + service token + Bearer──> llm.monedario.cl (Cloudflare) ──túnel saliente── PC: cloudflared ──> llama-server (127.0.0.1:8080)
```

Nada de esto lo puede hacer el repositorio: son pasos en tu PC y en el panel de Cloudflare. Verifica los flags y nombres contra la versión instalada (`llama-server --help`, `cloudflared --help`) y el nombre exacto del GGUF en el repositorio del modelo: no se probaron desde aquí.

## 1. Servidor del modelo (PC)

1. Instala llama.cpp (compilado con soporte de tu CPU/GPU) y descarga un GGUF cuantizado (Q4_K_M ronda los 20 GB para un 35B; cabe de sobra).
2. Genera una clave: `openssl rand -hex 32` (será `LOCAL_LLM_API_KEY`; guárdala solo en el gestor de secretos y en el `.env` de la VM).
3. Servicio de usuario `~/.config/systemd/user/llama-server.service`:

```ini
[Unit]
Description=llama-server (asistente Reddit de Monedario)
After=network-online.target

[Service]
ExecStart=/ruta/a/llama-server -m /ruta/al/modelo.gguf --host 127.0.0.1 --port 8080 \
  --api-key ${LOCAL_LLM_API_KEY} --jinja -c 16384 -np 1 --cache-reuse 256
EnvironmentFile=%h/.config/llama-server.env
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
```

`--jinja` habilita la plantilla de chat (necesaria para apagar el razonamiento con `enable_thinking`), `-np 1` atiende una petición a la vez, `--cache-reuse` reaprovecha el prompt de sistema, que es idéntico en cada llamada. `~/.config/llama-server.env` contiene `LOCAL_LLM_API_KEY=...` (modo 600). Actívalo con `systemctl --user enable --now llama-server` y `loginctl enable-linger $USER` (para que arranque sin sesión abierta).
El servidor escucha **solo en 127.0.0.1**: la única entrada es el túnel.

## 2. Túnel (PC)

1. Instala `cloudflared` y autentícate: `cloudflared tunnel login`.
2. `cloudflared tunnel create llm-monedario` y `cloudflared tunnel route dns llm-monedario llm.monedario.cl` (usa el hostname que prefieras; debe coincidir con `assist.base_url`).
3. `~/.cloudflared/config.yml`:

```yaml
tunnel: llm-monedario
credentials-file: /home/<usuario>/.cloudflared/<ID-del-túnel>.json
ingress:
  - hostname: llm.monedario.cl
    service: http://127.0.0.1:8080
  - service: http_status:404
```

4. Servicio de usuario `cloudflared-llm.service` con `ExecStart=/ruta/a/cloudflared tunnel run llm-monedario`, `Restart=always`, y habilítalo como el anterior.

## 3. Cloudflare Access (obligatorio: el hostname es público)

En Zero Trust → Access:

1. **Service token:** Access → Service Auth → crea "reddit-assist". Guarda el Client ID y el Client Secret (solo se muestran una vez).
2. **Aplicación** self-hosted para `llm.monedario.cl` con una política de acción **Service Auth** que incluya solo ese token. Sin política que permita el token, todo queda bloqueado (es lo que quieres).
3. Dos capas: Access (token) y el `--api-key` de llama-server. Ninguna sola basta.

## 4. VM (`~/reddit-monitor/.env`, modo 600)

```
LOCAL_LLM_API_KEY=<la de llama-server>
CF_ACCESS_CLIENT_ID=<...>.access
CF_ACCESS_CLIENT_SECRET=<...>
```

`config.json` ya viene con `provider: "openai_compat"`, `base_url: "https://llm.monedario.cl/v1"` (cámbialo si usas otro hostname) y `model: "qwen3.5-35b-a3b"`. No se necesita la clave de Anthropic ni el paquete `anthropic`.

Prueba desde la VM (sin imprimir secretos):

```bash
set -a; . ~/reddit-monitor/.env; set +a
curl -s -o /dev/null -w '%{http_code}\n' https://llm.monedario.cl/v1/models \
  -H "Authorization: Bearer $LOCAL_LLM_API_KEY" \
  -H "CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID" -H "CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET"   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://llm.monedario.cl/v1/models                                # debe NO ser 200 (401/403)
```

## Comportamiento y límites que conviene conocer

- **Límite de Cloudflare (~100 s hasta el primer byte, error 524).** El cliente pide siempre streaming para mantener viva la conexión, pero llama-server solo empieza a emitir cuando termina de procesar el prompt. Con hilos largos en CPU podría rozar el límite. Si ves 524 en `ai_runs.note`, reduce `assist.max_context_chars` / `max_comments`, o revisa que `--cache-reuse` funcione. Un 524 se trata como "modelo no disponible": el hilo queda pendiente y se reintenta sin gastar intentos.
- **PC apagado o túnel caído:** mismo trato: la corrida se corta en el primer hilo, `ai_runs.note = modelo_no_disponible` y se reintenta en la siguiente (90 min).
- **Sin costo por token:** `assist.pricing` no aplica; los topes son de tiempo (`timeout_s` entre bytes, `total_timeout_s` por respuesta), tamaño y lote (`max_batch`).
- **Calidad y seguridad:** un modelo de ~3B activos sigue peor las reglas estrictas (tono chileno sin "AI slop", no inventar cifras) y es más sensible a instrucciones inyectadas en el hilo que un modelo grande. La salida se fuerza al esquema JSON y se valida igual, y `reply_lint` bloquea borradores mal escritos, pero la puerta de promoción es más exigente (ver PLAYBOOK): antes de `automatico`, `python3 assist.py . --eval-samples` no debe descartar por error ningún caso financiero, ambiguo ni de inyección.
- **Volver a Anthropic:** en `config.json`, `"provider": "anthropic"`, `"model": "claude-sonnet-5"`, `ANTHROPIC_API_KEY` en `.env` y `pip install -r requirements-assist.txt`. No hace falta tocar el resto.
