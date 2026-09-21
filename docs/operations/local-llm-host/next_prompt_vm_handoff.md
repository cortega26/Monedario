# Traspaso a la tarea de la VM: LLM local de Monedario ya publicado

Contexto minimo para la conversacion nueva (la de la VM del monitor de Reddit). El PC de Carlos ya sirve el modelo por un tunel protegido.
No incluye ningun secreto: Carlos los pone el mismo en la VM.

## 1. Endpoint listo (verificado 2026-09-21)

- URL base: `https://llm.monedario.cl/v1`  ->  `POST /v1/chat/completions` (SSE con `stream: true`, `response_format: json_schema`, `chat_template_kwargs: {"enable_thinking": false}`)
- Modelo (alias): `qwen3.5-35b-a3b` (Qwen3.5-35B-A3B Q4_K_M, solo CPU, llama.cpp commit ce8caa6)
- Cabeceras obligatorias:
  - `Authorization: Bearer <LOCAL_LLM_API_KEY>` -> la clave esta en el PC de Carlos, `~/.config/llama-server.key` (64 hex). Carlos la copia el mismo a la VM.
  - `CF-Access-Client-Id` y `CF-Access-Client-Secret` -> Service Token `reddit-assist` de Cloudflare Access; estan en el gestor de contrasenas de Carlos (el secreto se roto el 2026-09-21). El token vence el **2027-09-21**: poner recordatorio para renovarlo.
  - **`User-Agent` propio (NUEVO Y CRITICO).** Cloudflare responde **403 (error 1010)** al User-Agent por defecto de `urllib` (`Python-urllib/3.x`) *antes* de mirar el token.
    Verificado en el PC de Carlos: `curl` con UA `Python-urllib/3.13` -> 403; `urllib` por defecto -> 403; `urllib` con UA `monedario-reddit-assist/1.0` -> 200.
    `assist_provider.call_openai_compat` usa `urllib` sin User-Agent propio (cabeceras en `assist_provider.py` ~linea 104), asi que **desde la VM recibiria 403** tal como esta.
    Dos salidas (decide Carlos; no se toco nada del repo ni del asistente):
    1. (recomendada) enviar `"User-Agent": "monedario-reddit-assist/1.0"` en las cabeceras de `call_openai_compat`.
    2. En Cloudflare, una regla de configuracion que desactive Browser Integrity Check solo para el host `llm.monedario.cl` (ajuste de seguridad de la cuenta; solo Carlos).

## 2. Mediciones por el tunel (hilo sintetico de ~2.000 palabras = ~3.000 tokens; system prompt y esquema reales del asistente)

| Caso | Primer dato SSE | Total | Decodificacion | JSON / esquema |
|---|---|---|---|---|
| A: frio (0 tokens en cache) | 43,6 s | 98,5 s | 7,6 tok/s | valido / OK |
| A2: system prompt cacheado (regimen normal con `--cache-reuse`) | 30,5 s | 90,1 s | 7,6 tok/s | valido / OK |
| C: hilo corto no financiero | 6,8 s (con cache parcial) | 16,8 s | 8,7 tok/s | valido / OK, `draft` null |

- Local (sin tunel), mismo prompt: A 42,0 s, A2 35,0 s. El tunel no anade tiempo apreciable. Cloudflare **no** almacena el SSE en bufer (primer dato a 0,6 s en la corrida con cache; el texto llega a medida que se genera).
- Sin 524 en ninguna corrida. El riesgo de 524 es un hueco de ~100 s sin ningun byte de llama-server; con ~70 tok/s de prefill en frio eso equivale a un prompt de ~7.000 tokens (contexto configurado: 16.384).
- Las cabeceras HTTP llegan por el tunel a ~30 s (en local a 0,1 s); causa no determinada y sin efecto sobre lo medido.
- Configuracion del asistente (`config.json`): `timeout_s` 90 s entre bytes (mayor hueco medido ~44 s: holgado) y `total_timeout_s` 240 s (medido 90-99 s con ~420 tokens de salida; estimacion, NO medida, del peor caso ~175-190 s con prompt de ~4.000 tokens y `max_tokens` 900 -> margen fino).
- Limitaciones: hilos sinteticos, no reales; la maquina tenia carga de fondo (load average ~5) durante las pruebas.
- Calidad (fuera del despliegue): los borradores salieron con 136 y 157 palabras, sobre el limite de 100 del playbook.

## 3. Restricciones operativas para el asistente

- Una sola ranura (`-np 1`): las peticiones concurrentes se encolan. El asistente debe llamar de forma secuencial.
- Tras un reinicio de llama-server la cache de prompts esta vacia: la primera peticion paga el prefill completo (~35-45 s).
- El PC de Carlos debe estar encendido. Ambos servicios son de usuario con linger; **la prueba de reinicio del equipo NO se ha ejecutado**.
- El asistente sigue sin publicar nada (solo Carlos publica).

## 4. Que NO hacer / pendiente en la VM

- No pegar secretos en el chat ni en logs; Carlos escribe LOCAL_LLM_API_KEY, CF_ACCESS_CLIENT_ID y CF_ACCESS_CLIENT_SECRET directamente en el entorno de la VM.
- Decidir la salida del punto 1 (User-Agent) antes de habilitar el proveedor `openai_compat`.
- Probar desde la VM (no ejecutado): sin cabeceras -> 403; con las tres credenciales y User-Agent propio -> 200.
