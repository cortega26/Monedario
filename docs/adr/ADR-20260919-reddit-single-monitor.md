# ADR-20260919-reddit-single-monitor

Date: 2026-09-19
Status: Accepted

Supersedes: `ADR-20260601-reddit-mention-monitor`, `ADR-20260919-reddit-scope-contract`.

## Context

Dos sistemas escuchaban Reddit para Monedario: el Worker de Cloudflare
`workers/reddit-mention-monitor/` (alertas por Discord, solo posts, cada 15 min)
y el monitor Python `reddit-monitor/` en la VM (posts y comentarios, cola web,
etiquetas, ntfy). `ADR-20260919-reddit-scope-contract` los dejó separados
("Worker = alertas, Python = investigación") para evitar que un cambio en uno
se leyera como bug del otro.

El 2026-09-19 se verificó, en solo lectura contra Cloudflare y Reddit, que el
Worker **nunca funcionó**:

- El cron `*/15 * * * *` está activo desde el 2026-08-11, pero el Worker solo
  tiene el secreto `CHECK_SECRET`. Faltan `REDDIT_CLIENT_ID`,
  `REDDIT_CLIENT_SECRET` y `DISCORD_WEBHOOK_URL`; `assertEnv` lanza error en
  cada corrida.
- El KV `REDDIT_SEEN` tiene 0 claves (solo se marca tras una alerta exitosa, con
  TTL de 7 días): cero alertas enviadas.
- Sus subreddits no aportan: `RepublicaIndependiente` y `Bolsa` responden 404,
  `merval` es una comunidad argentina (170.000 miembros) y `EstoyBienChile` no
  devuelve posts.

La partición "alertas vs investigación" era, por tanto, una separación teórica:
la mitad de alertas no existía en la práctica, y mantenerla costaba dos listas de
keywords, dos de subreddits y documentación que se desactualizaba.

## Decision

1. **El monitor `reddit-monitor/` es el único sistema que escucha Reddit.** Se
   retira el Worker `monedario-reddit-mention-monitor`: se elimina su código,
   sus tests, sus scripts de `package.json`, su exclusión de cobertura y su
   excepción en `check-docs-structure`.
2. **Se conserva lo único valioso del Worker**: el mapa palabra → calculadora,
   ya portado como `resource_map` en `reddit-monitor/config.json` (`resources.py`,
   PR #508). La cola sugiere la calculadora y prellena la URL.
3. **Canal de aviso: ntfy** (ya existe en el monitor). No se replica Discord.
4. **Dirección**: el monitor deja de ser solo un detector de oportunidades de
   respuesta y pasa a ser un sensor **bidireccional** de crecimiento:
   (a) encontrar dónde aportar información para llevar tráfico e interesados a
   monedario.cl, y (b) usar la conversación de Reddit para medir **brechas de
   contenido** (artículos, calculadoras o guías que faltan). El diseño detallado
   de (b) se documenta aparte; este ADR solo fija que ambas funciones viven en el
   mismo sistema.

## Consequences

### Positive
- Una sola lista de subreddits, un solo léxico y un solo estado (SQLite), sin
  doble aviso ni cobertura desalineada.
- Se elimina código muerto, tests y una superficie de secretos que no se usaba.
- El PLAYBOOK deja de explicar una excepción que no funcionaba.

### Trade-offs / Risks
- La VM pasa a ser el único punto de escucha (también aloja Pogo-lab en
  producción). Mitigación existente: el monitor amplía su ventana tras corridas
  saltadas, avisa por ntfy si falla y hay respaldos diarios de la DB.
- Se pierde la búsqueda `/search` de posts por consulta. Se considera cubierta por
  el sondeo de `/new` de cada sub más el léxico y la desambiguación del monitor;
  medido, solo unos pocos hilos por semana encajan con las 5 calculadoras.

## Alternatives considered

- **Mantener ambos** (opción del ADR anterior): descartada, porque una de las dos
  mitades nunca funcionó y no se pidió corregirla.
- **Arreglar el Worker** (cargar los tres secretos): descartada; sus subreddits
  son mayormente inválidos y duplicaría lo que el monitor ya hace mejor.
- **Consolidar en el Worker**: inviable, el ML (spaCy y embeddings) no corre en
  Workers.

## Verification

- Evidencia del estado del Worker (2026-09-19), API de Cloudflare de solo
  lectura: `GET .../workers/scripts/monedario-reddit-mention-monitor/settings`
  (bindings sin credenciales), `.../schedules` (cron activo) y
  `.../storage/kv/namespaces/<REDDIT_SEEN>/keys` (0 claves).
- Tras el retiro: `pnpm run check:workers`, `pnpm run check:docs`, `pnpm run lint`,
  `pnpm run test` y el CI del PR en verde.
- Baja en Cloudflare (acción manual, fuera de este PR): borrar el Worker
  (`wrangler delete --name monedario-reddit-mention-monitor`, lo que elimina su
  cron y su secreto) y luego el namespace KV `REDDIT_SEEN`.
- **Teardown ejecutado 2026-09-19 por el owner:** worker
  `monedario-reddit-mention-monitor` eliminado (`Successfully deleted`) y
  namespace KV `58a032ea6f754c999f0bceabb29fd887` (`REDDIT_SEEN`) eliminado
  (verificación posterior: `KV gone`). Solo existía `CHECK_SECRET`; no había
  webhook Discord ni secretos Reddit en Cloudflare, nada que revocar.
