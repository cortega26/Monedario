# PLAN — Asistente de análisis y borradores del monitor de Reddit

**Estado:** IMPLEMENTADO EN LOCAL, PENDIENTE DE DESPLIEGUE · **Fecha:** 2026-09-20 · **Owner:** Carlos Ortega
**Contexto:** `PLAN-reddit-monitor-2026-09-19.md`, `docs/adr/ADR-20260919-reddit-single-monitor.md`, `docs/operations/reddit-monitor/REPLY_GUIDE.md`.

## Objetivo

Reducir el trabajo manual de revisar la cola de `reddit.monedario.cl`: después de cada escaneo, un proceso separado analiza los hilos pendientes, descarta (solo en modo automático) los claramente ajenos a finanzas, prepara borradores en español chileno para los financieros y deja pendiente todo lo ambiguo. **Publicar en Reddit sigue siendo 100 % manual.**

## Alcance

En alcance: `reddit-monitor/` (código, esquema, plantillas, unidades systemd, config de ejemplo), sus pruebas y `docs/operations/reddit-monitor/PLAYBOOK.md`.
Fuera de alcance: sitio Astro, artículos, calculadoras, URLs públicas, `monitor.py` (el escaneo no se toca), servicios de otras apps de la VM.

## Change Control Record

1. **Scope:** ver arriba.
2. **Impacted modules:** `assist.py`, `assist_provider.py` (nuevos); `schema.sql`, `app.py`, `templates/queue.html`, `templates/atendidos.html`, `config.json`, `deploy.sh`; `reddit-assist.service/.timer`; `requirements-assist.txt`; `.env.example`; tests `test_assist.py`.
3. **Invariant preservation:** sin rutas/URLs públicas; listen-only intacto (nada escribe en Reddit; solo GET de lectura con las credenciales OAuth existentes); separación de deberes: el asistente **no** registra auditoría ni aprobación, sus borradores se marcan "IA, sin revisar".
4. **Contract preservation:** `human_reviews`, `reviews.MOTIVOS`, `dataset.py` y `eval_filter.py` no cambian ni reciben filas automáticas.
5. **Boundary integrity:** Python fuera de `src/`; `check:boundaries` no afectado.
6. **Test coverage:** `test_assist.py` (contrato, sin red ni credenciales; el proveedor se inyecta).
7. **Rollback:** ver sección final.
8. **Regression risk:** BAJO. Esquema aditivo (tablas nuevas `CREATE IF NOT EXISTS`, sin subir `schema_version`), servicio y timer nuevos e independientes de `reddit-monitor.service`.

## Decisiones

| # | Decisión | Razón |
|---|---|---|
| D1 | Proceso separado `assist.py` con su propio `reddit-assist.timer` (cada 90 min, desfasado del escaneo) y `MemoryMax=256M`. | Un fallo de IA no puede frenar la captura ni el panel. No se toca `run_monitor.sh`. |
| D2 | Proveedor único **por configuración** (`assist.provider`): **`openai_compat`** (modelo local Qwen3.5-35B-A3B en el PC de Carlos vía llama-server + Cloudflare Tunnel saliente, decisión 2026-09-20 por CGNAT/IP rotativa; ver `LOCAL_LLM.md`) o **Anthropic Messages API** vía el SDK oficial `anthropic` (dependencia nueva, solo en `requirements-assist.txt`, import perezoso). Modelo configurable, por defecto `claude-sonnet-5`. Salida estructurada con `output_config.format` (JSON schema) y **validación estricta propia** antes de tocar estado. | No había integración de LLM. El SDK ya trae reintentos, timeouts y errores tipados. Sin frameworks de agentes ni multi-proveedor. Sin herramientas: el modelo no ejecuta nada. |
| D3 | Esquema aditivo, **sin subir `schema_version`**: tablas `ai_assessments`, `ai_holds`, `ai_budget`, `ai_failures`, `ai_runs` en `schema.sql` (`CREATE IF NOT EXISTS`, como `subreddit_wiki_status`). | Una DB v3 las recibe en el próximo `connect()`; no hay migración que olvidar ni fail-fast que rompa el panel. Rollback = ignorarlas. |
| D4 | Descarte automático = `matches.status='descartado'` + `status_note='ia_no_financiero'`. **Nunca** se llama a `reviews.record_review` ni se escribe en `human_reviews`. | La ruta humana atribuye la etiqueta a `carlos`; mezclar contaminaría el dataset de entrenamiento. `status_note` con prefijo `ia_` identifica y permite restaurar. |
| D5 | Unidad de análisis = hilo (`threads.thread_key`). Contexto por la API de Reddit ya autorizada (`monitor.get_token`/`api_get`, `/comments/<id>`), acotado en tamaño y cantidad; se guarda huella (SHA-256), fecha y procedencia. | Snippets de 220 caracteres no bastan. |
| D6 | Modos en `config.json` → `assist.mode`: `desactivado` (por defecto si falta), `observacion` (instalado), `automatico`. Solo `automatico` puede descartar y solo sobre análisis hechos en ese modo (no es retroactivo). No hay promoción por tiempo. | Requisito. |
| D7 | Descarte solo si `classification == no_financiero` **y** `context_sufficient` **y** el contexto se recuperó de Reddit sin limitaciones. La confianza autodeclarada no existe en el contrato. | Requisito; el clasificador semántico existente no se usa como regla. |
| D8 | Precedencia humana: (a) antes de aplicar, en `BEGIN IMMEDIATE`, se comprueba por fila `status='pendiente' AND status_changed_at IS NULL` y ausencia de `ai_holds`; (b) restaurar crea un `ai_holds` por hilo que excluye ese hilo de todo procesamiento posterior. | Evita pisar decisiones humanas y ciclos de descarte. |
| D9 | Idempotencia: `UNIQUE(thread_key, context_fingerprint, prompt_version)`; `flock` para una sola ejecución a la vez; reintentos limitados por `ai_failures`. | Sin llamadas duplicadas. |
| D13 | Modelo inalcanzable (`ProviderUnavailable`: conexión rechazada, timeout, 408/429/5xx incl. 502/524) no gasta intentos, libera la reserva y corta el lote; el hilo se reintenta en la siguiente corrida. Salida del modelo local restringida al esquema JSON (gramática) y validada igual. | El PC o el túnel pueden caer horas; abandonar hilos por eso sería pérdida silenciosa. |
| D10 | Presupuesto mensual persistente en `ai_budget` (micro-USD enteros): reserva estimada (entrada por caracteres/3 + `max_output_tokens`) dentro de `BEGIN IMMEDIATE`, liquidada con el `usage` real. Al agotarse, todo queda pendiente. | Sobrevive reinicios y ejecuciones concurrentes. Es una **estimación**: la garantía dura es el límite de gasto del workspace en la consola de Anthropic (se documenta). |
| D11 | Borradores pasan por `reply_lint.revisar`; un `ERROR` bloquea la exhibición (se guarda para auditoría, la UI muestra el motivo). Enlaces solo del catálogo `resource_map`, con UTM y divulgación. | `REPLY_GUIDE.md`. |
| D12 | Cola y "Atendidos" muestran clasificación, motivo, borrador copiable (`<textarea readonly>`), advertencias y botón **Restaurar** para descartes IA. | Cambios mínimos a las plantillas. Jinja escapa todo. |

## Contratos

Salida del modelo (validada; cualquier desvío = fallo, el hilo queda pendiente):
`classification` ∈ {financiero, no_financiero, incierto}; `reason` (≤ 300); `context_sufficient` bool; `opportunity` ∈ {si, no, incierta}; `draft` (≤ 1200) o null; `resource_url` null o URL del `resource_map`; `pending_verification` lista (≤ 8 × 200).

Definición de finanzas (prompt): presupuesto, ahorro, deudas, créditos, inversiones, pensiones, impuestos, seguros y decisiones económicas personales. Una palabra aislada no basta. Pertinencia ≠ oportunidad: financiero sin oportunidad sigue siendo `financiero`.

## Aceptación

- Los hilos nuevos se analizan solos en el servidor; los financieros muestran borrador; los inciertos siguen pendientes.
- `automatico` descarta solo `no_financiero` con contexto suficiente, con traza y restauración.
- `human_reviews` y su dataset permanecen intactos; una decisión humana o restauración prevalece.
- Timeout, error del proveedor, JSON inválido o presupuesto agotado no interrumpen el monitor.
- Nada se publica.

## Pruebas

`python3 -m pytest test_assist.py` (contrato, sin red). La calidad real del modelo **no** se demuestra con mocks: se mide con la muestra sintética (`assist_samples.json`, `python3 assist.py . --eval-samples`, facturable y explícito) y con el informe `--report` sobre datos reales en observación.

## Rollback

1. `sudo systemctl disable --now reddit-assist.timer` (o `assist.mode: "desactivado"`).
2. Restaurar descartes IA: `python3 assist.py . --restore-all-auto` (los devuelve a pendiente y crea holds).
3. Código anterior: las tablas `ai_*` son ignoradas por la versión previa; `human_reviews`, `matches` y etiquetas no se modifican por este proceso, así que no hay nada que revertir en los datos humanos.

## Progress log

- 2026-09-20 — Segundo proveedor `openai_compat` (modelo local + Cloudflare Tunnel) y `LOCAL_LLM.md`. Tunel SSH inverso y Tailscale descartados (CGNAT con IP rotativa y VM compartida).
- 2026-09-20 — Especificación e implementación local. Despliegue pendiente de `ANTHROPIC_API_KEY` en el `.env` de la VM y de autorización.
