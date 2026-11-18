# ADR-20260516-economic-snapshot-cloudflare-worker

Date: 2026-05-16
Status: Accepted

## Context

`refresh-economic-snapshot.yml` ejecuta diariamente `pnpm run economic:snapshot:refresh` y abre/auto-mergea un PR con el snapshot actualizado en `src/infrastructure/economic/economic-parameters.snapshot.json`. El snapshot alimenta la página pública [/guias/uf-costo-de-vida/indicadores-economicos/](../../src/pages/guias/uf-costo-de-vida/indicadores-economicos.astro) y las calculadoras.

El 2026-05-15 y 2026-05-16 las corridas programadas fallaron con `recent account payments have failed or your spending limit needs to be increased` — GitHub Actions cortó la ejecución por billing antes del primer step. Resultado: snapshot anclado al 14/05 hasta intervención manual. La causa raíz no es código: es el plan gratuito (2.000 min/mes en repos privados) y los 14 workflows del repo agotan o bloquean el cupo cuando hay incidentes de pago.

Necesitamos un mecanismo de refresh que sea independiente de los minutos de GitHub Actions y que no dependa de una máquina personal encendida.

## Decision

Mover el refresh automatizado del snapshot económico a un **Cloudflare Worker con Cron Trigger**, co-locado en el monorepo bajo `workers/economic-snapshot-refresh/`. El Worker:

1. Ejecuta diariamente a `15 10 * * *` UTC (idéntico al schedule actual de la CI).
2. Llama a `https://mindicador.cl/api` y a `https://mindicador.cl/api/utm/<año>` para construir el snapshot con la misma forma que `scripts/refresh-economic-snapshot.mjs`.
3. Si el payload difiere del archivo actual en `main`, hace un commit vía GitHub Contents API con autor `monedario-snapshot-bot` y mensaje `chore(editorial): refresh economic snapshot (worker)`.
4. Si el payload es idéntico, exit sin commit (idempotente, sin commits vacíos).

El workflow `refresh-economic-snapshot.yml` se reduce a `workflow_dispatch` only y se mantiene como **fallback manual** (re-habilitable a schedule en una línea si el Worker falla).

El refresh de `editorial-volatile-data` (scraping HTML de spensiones.cl, ~297 líneas) **queda fuera del scope V1**. Se mantiene en `refresh-economic-snapshot.yml` (renombrado conceptualmente como "editorial volatile data only" al perder el snapshot económico) y/o se migra a un timer local con `Persistent=true` si el cupo de Actions sigue siendo problemático.

Plataforma: Cloudflare Workers en el mismo account que hospeda el sitio (Cloudflare Pages). Cron Triggers son gratuitos hasta 5 schedules; Worker invocations 100k/día gratis; outbound fetch sin límite en plan free. Costo operativo esperado: $0.

Autenticación a GitHub: PAT fine-grained scoped a `cortega26/Monedario`, permiso *Contents: Read & Write*, expiración 1 año, almacenado como Worker Secret (`GITHUB_TOKEN`). Procedimiento de rotación documentado en el README del Worker.

## Consequences

### Positive

- Refresh diario deja de depender de los 2.000 min/mes de GitHub Actions.
- Refresh deja de depender de una máquina personal encendida (vs. la alternativa local-cron).
- Mismo schema de snapshot en el mismo path: cero cambios en consumidores (página, calculadoras, tests, editorial guards).
- Auditabilidad preservada: commits en `main` con autor distintivo, idempotencia (no commits vacíos), historial git intacto.
- Rollback en 1 comando (`wrangler delete`) + re-habilitar el `schedule:` en `refresh-economic-snapshot.yml`.
- Cloudflare Pages ya despliega al detectar push a `main`; no requiere wiring adicional.

### Trade-offs

- Nuevo lenguaje de runtime (Workers) introduce una pieza más de infra que mantener (dependencias `wrangler`, `@cloudflare/workers-types`, secrets rotation).
- Dos rutas para actualizar el mismo archivo (Worker + workflow_dispatch manual) requieren disciplina: usar dispatch solo cuando el Worker falla.
- Observabilidad V1 es pasiva (Workers Logs en dashboard); fallos silenciosos hasta que alguien mire. Mitigación V2 (alerta email/Discord) queda como follow-up.
- Si Cloudflare presenta un incidente regional el día del cron, el snapshot se atrasa 24h. Riesgo aceptable dado que el contenido es informativo (no transaccional) y la página ya tolera staleness moderada por diseño.

### Risks

- **Drift de schema:** si alguien modifica el shape esperado de `economic-parameters.snapshot.json` sin actualizar el Worker, los commits del Worker introducirán regresiones. Mitigación: el Worker importa el mismo tipo TS que el resto del repo y el test unitario del builder valida la forma contra una fixture compartida.
- **PAT comprometido:** el token tiene permisos de escritura a Contents en el repo. Mitigación: scope mínimo (solo Contents, solo este repo), expiración 1 año, rotación documentada, almacenado solo como Worker Secret (no en repo).
- **API rate limit GitHub Contents:** 5.000 req/hora autenticado. Estamos en 2 req/día (GET + PUT). Margen sobrado.

## Alternatives considered

- **Local cron con systemd timer + `Persistent=true`:** descartado como solución primaria. Requiere máquina del usuario encendida o linger; el usuario explicitó preferencia por la ruta autónoma de Cloudflare. Se conserva como fallback de emergencia documentado.
- **Self-hosted runner GitHub Actions en VM gratuita (Oracle Free Tier):** funciona pero suma una VM más que mantener y un canal de seguridad nuevo (runner con secrets). Cloudflare Worker es más liviano y nativo al stack actual.
- **Comprar minutos / upgrade Pro:** la solución más barata en tiempo de ingeniería ($3-4/mes) pero no resuelve el root cause (dependencia de un único proveedor + billing risk recurrente). Queda como opción siempre disponible.
- **Eliminar el snapshot y leer mindicador.cl en runtime/build:** refactor significativo. Perdemos la trazabilidad git del dato (relevante para contenido YMYL) y atamos cada build a la disponibilidad de un tercero. Descartado.

## Verification

- `pnpm exec vitest run workers/economic-snapshot-refresh/test/buildSnapshot.test.ts` — valida el builder puro contra el snapshot del 2026-05-16.
- `wrangler dev --test-scheduled` + `curl http://localhost:8787/__scheduled` localmente.
- Primera corrida en producción: trigger manual desde el dashboard de Cloudflare; verificar commit creado y que `Cloudflare Pages` redeploya.
- Una semana después: verificar 7 corridas exitosas en Workers Logs y 7 commits del bot (o menos, si hubo días sin cambios).

## Rollback

1. Cloudflare dashboard → eliminar el Cron Trigger del Worker (o `wrangler delete`).
2. En `.github/workflows/refresh-economic-snapshot.yml`, restaurar el bloque `schedule: - cron: "15 10 * * *"` (sigue presente como comentario tras esta ADR).
3. Revocar el PAT en GitHub si la migración se cancela definitivamente.

## Appendix: Banco Central as primary for UF + USD; Scrapling/Python rechazado (2026-05-16)

### Mapeo final de fuentes (revisado)

| Indicador | Fuente primaria | Fallback |
|---|---|---|
| UF | **BCCh SiETE** (`F073.UFF.PRE.Z.D`) | mindicador.cl/api |
| USD observado | **BCCh SiETE** (`F073.TCO.PRE.Z.D`) | mindicador.cl/api |
| IPC | **INE** (scrape HTML) | mindicador.cl/api |
| UTM | mindicador.cl/api | — |
| UTA | mindicador.cl `/utm/<año>` (dic × 12) | UTM corriente × 12 |
| TMC | mindicador.cl/api | constante 3,49 |

**Sumando:** mindicador.cl deja de ser primaria para 3 de 6 indicadores. Para el resto (UTM y TMC) sigue siendo primaria hasta Fase 2B (SII + CMF). El snapshot tolera fallo de cualquier override sin abortar — degrada gracefully a mindicador.cl indicador por indicador.

### Scrapling / Python rechazado

Se evaluó adoptar `scrapling` (Python) como dependencia de scraping por su resistencia a 403s en sitios `.gob.cl` (caso de uso real reportado: SII, Chile Atiende, BCN). **Rechazado** por incompatibilidad de runtime: Cloudflare Workers ejecuta V8 isolates, sin soporte para extensiones C/lxml/Playwright que Scrapling necesita. Python Workers (Pyodide) está en beta y no corre Scrapling.

En su lugar, se adoptó una "escalera de defensa" de tres niveles, todos dentro del ecosistema Workers:

- **L1 — Browser-like headers** (`src/govFetch.ts`): UA Chrome, `Accept-Language: es-CL`, `Accept-Encoding: gzip,deflate,br`, Referer opcional. Cubre el ~80% de bot detection básico. Aplicado uniformemente a INE y BCCh.
- **L2 — Rotación de UA + retries con backoff** (no implementado V1; se activa si vemos 403s sistemáticos en logs).
- **L3 — Cloudflare Browser Rendering** (no implementado V1; binding nativo, headless Chromium real, $0.09/sesión). Para sitios con Turnstile o challenges JS.
- **L4 (último recurso) — Servicio Python separado en Cloud Run.** Documentado como fuga si L1+L2+L3 no alcanzan, pero solo si hay evidencia concreta de bloqueo. YAGNI hasta que aparezca.

### Validación empírica del 2026-05-16

- BCCh SiETE responde HTTP 200 a query sin User-Agent custom (curl/8.5 default). **No nos bloqueó.**
- INE responde HTTP 200 con HTML completo a `curl` simple. **No nos bloqueó.**
- Datos cruzados: BCCh UF 16-05-2026 = 40357,67 (== snapshot actual); USD 15-05-2026 = 891 (== snapshot). Fuentes coherentes en el momento de adopción.

## Appendix: Multi-cron self-healing (2026-05-16)

**Decisión:** tres cron triggers diarios en lugar de uno.

```toml
crons = ["15 10 * * *", "15 14 * * *", "15 18 * * *"]
```

**Por qué:** una sola ventana de ejecución crea SPOF. Si por cualquier razón (Cloudflare incident, upstream slow, transient network) la corrida de las 10:15 falla, el snapshot queda stale hasta el día siguiente. Con tres triggers:

- **10:15 UTC** — corrida primaria. La mayoría de los días termina acá.
- **14:15 UTC** — primera recuperación. Si el primer run falló, este reintenta. Idempotente (payload-diff ignora `capturedAt`), así que si el primero sí funcionó, este es no-op silencioso.
- **18:15 UTC** — última red de seguridad antes de que cierre el día hábil chileno.

**Costo:** 3 invocaciones × 30 días = 90/mes vs cuota gratis de 100 000/día. Esencialmente cero.

**No se introduce lógica de "es día hábil"** porque sería sobre-ingeniería: en fines de semana o feriados las APIs upstream devuelven el último valor publicado (no cambian), el snapshot diff resulta vacío, y los runs son no-op gratuitos. La idempotencia hace el trabajo solita.

**Lo que NO se hace:** un workflow de GitHub Actions adicional con health-check externo. Sumar Actions vuelve a meternos en el quota problem que originó esta migración. Si vemos que los tres crons no son suficientes, escalamos a un monitor externo gratuito (Healthchecks.io) antes que reintroducir Actions.

## Appendix: IPC sourced directly from INE (2026-05-16)

Durante el deploy se detectó que el IPC en `mindicador.cl` está congelado en diciembre 2025 (su pipeline no publicó nada en enero–abril 2026), mientras INE sí publicó IPC de abril 2026 (1,3%) el 2026-05-08.

**Decisión:** el Worker fetchea IPC directamente de `https://www.ine.gob.cl/.../indice-de-precios-al-consumidor` y sobrescribe el valor de `mindicador.cl` cuando el scrape es exitoso. Si el scrape falla (timeout, HTML cambia, INE caído), se loggea un warning y se conserva el IPC de mindicador.cl como fallback — el snapshot no se rompe, solo queda con IPC stale visible.

**Por qué INE y no Banco Central:** el BCCh tiene API JSON pero requiere registro/credenciales y agrega un secret más a rotar. INE es la fuente canónica (el BCCh redistribuye INE) y su página es estable. El scrape se ancla al `<h1>` "Índice de Precios al Consumidor" y luego al par `.cifraV3` / `.periodoCifraV3` adyacente, evitando confundirse con otros índices que INE publica en la misma página (ICT, IPP, …).

**Trade-offs:** HTML scraping es más frágil que una API; mitigado con (a) anchoring al heading IPC, (b) tolerancia a variaciones de atributos/clases, (c) fallback silencioso a mindicador.cl, (d) tests con fixture real. Cuando INE cambie su template — eventualmente ocurrirá — los logs `ipc.override.empty` lo señalarán y hay que actualizar la regex.

## Appendix: cache headers analysis

**Versión revisada 2026-05-16 tras incidente de propagación.** Una versión anterior de este apéndice afirmaba que Cloudflare Pages purga automáticamente el edge cache en cada deploy — eso es **parcialmente cierto y nos llevó a un bug observable**. Se corrige a continuación.

### Comportamiento real del cache en producción

1. **URLs `*.pages.dev`:** Pages purga el edge automáticamente en cada deploy.
2. **Custom domains (caso `monedario.cl`):** el edge respeta los `Cache-Control` que defina `public/_headers`. **Pages no purga la zona del dominio custom** en cada deploy. Si el HTML lleva `s-maxage=N`, el objeto cacheado vive hasta `N` segundos independientemente del deploy.

### Incidente observado (2026-05-16)

- Commit `56d773b1` con snapshot actualizado y typo corregido se mergeó a las 21:23 UTC.
- Cloudflare Pages buildeó y desplegó correctamente. El origen servía contenido fresco (`?cb=…` confirmaba `Úsalo` + `15/05` + `16/05`).
- El edge servía `cf-cache-status: HIT` con `age: 1749 s`, objeto poblado a las 21:10 UTC — **antes del deploy** — con `s-maxage=3600` reteniéndolo ~30 min adicionales.
- Resultado: usuarios veían `Usalo` + `14/05` durante ~30 min post-deploy.

### Decisión

Eliminar `s-maxage` de las reglas de HTML en `public/_headers`. Queda solo `Cache-Control: public, max-age=300`:

- Browser cachea 5 min (revalidación automática después).
- Edge **no** cachea más allá de `max-age=300` (sin `s-maxage`, el edge respeta el mismo valor).
- Deploys propagan al edge en ≤ 5 min sin necesidad de purga programática.

### Trade-offs aceptados

- Más revalidaciones contra el origen (Pages). En un sitio static servido por Pages, costo operativo ~$0 y latencia desdeñable (HTML cacheado en R2 distribuido).
- Se pierde el "edge cache de 1h" como optimización de carga, pero ese beneficio nunca fue real porque Pages auto-purga en deploys para sus URLs internas y nadie golpea esas URLs en producción.

### Reglas que NO cambian

- `/_astro/*`, `/fonts/*`, `/images/*` → `max-age=31536000, immutable`. Astro hashea estos paths en cada build; URLs nuevas no chocan con cache viejo.
- `/.well-known/security.txt`, `/security.txt` → `max-age=300`. Ya estaba sin `s-maxage`.

### Alternativa considerada y descartada

**Cache purge automático post-deploy** (CF API + token + hook). Mantiene `s-maxage=3600` para reducir carga, pero suma:
- Token Cloudflare API a rotar.
- Lógica de "qué paths purgar" (todas las HTML, o selectivo por changed files).
- Punto de falla adicional (si el purge falla silenciosamente, el bug reaparece).

Para un sitio static sin presión de carga, la opción simple (`max-age=300` sin `s-maxage`) tiene mejor relación complejidad/beneficio.

### Latencia worst-case end-to-end (revisada)

| Etapa | Duración |
|---|---|
| Cron Worker fires + commit GitHub | ~5–30 s |
| Cloudflare Pages build + publish | 2–5 min |
| Edge cache (max-age=300, sin s-maxage) | ≤ 5 min |
| Browser cache residual | ≤ 5 min (overlapping con edge) |
| **Total worst case** | **~10 min** desde el cron |

### Cuándo sí habría que volver a evaluarlo

- Migración a SSR/ISR donde el HTML se genere por request.
- Snapshot expuesto como endpoint público (API móvil, terceros) — ahí sí necesitarías `s-maxage` + purge automático.
- Datos sub-minuto.

## Amendment 2026-11-18 — carry-forward cuando el agregador está caído

El Worker dependía de `mindicador.cl` para el payload base: `buildSnapshot`
hacía `await deps.fetchApi()` sin protección. El 2026-11-18 mindicador respondió
**HTTP 522** durante todo el día; los tres crons fallaron con
`TimeoutError` (12 s) y **no se commiteó ningún snapshot**, así que el sitio
siguió mostrando la UF y el dólar del 17-NOV aunque el BCCh ya publicaba los
valores del 18-NOV.

**Decisión:** si el fetch base falla, el Worker reconstruye el payload desde el
snapshot ya commiteado (`payloadFromSnapshot`) y sigue adelante. Los overrides
autoritativos se aplican igual (BCCh UF/USD, SII UTM, INE IPC); solo los campos
que mindicador aporta (TMC y los valores de respaldo) se arrastran. El snapshot
resultante registra `source: "snapshot.carry-forward"` para que la degradación
sea visible y la siguiente corrida limpia lo revierta a `mindicador.cl/api`.

Consecuencias:

- Una caída del agregador deja de congelar todos los indicadores: UF y dólar
  siguen actualizándose desde el emisor oficial.
- El archivo puede arrastrar TMC hasta que mindicador vuelva (valor mensual,
  bajo riesgo).
- El commit de carry-forward cambia `source`; no genera commits repetidos
  porque `capturedAt` se ignora en el diff.

**Alarmas asociadas** (mismo cambio):

- `check-economic-snapshot-freshness`: `capturedAt` ≤ 2 días, UF ≤ 3 días,
  dólar ≤ 4 días (antes 7/10/10).
- `check-deploy-health`: nuevo heartbeat del snapshot de `main`
  (`SNAPSHOT_MAX_AGE_HOURS = 36`), independiente de las fechas de la portada.
  Detecta un Worker caído aunque el sitio aún muestre fechas aceptables.

**Verificación:** tests de `payloadFromSnapshot` y `withMindicadorFallback`
(passthrough, fallback y overrides aplicados sobre el payload arrastrado),
`check:workers`, `wrangler deploy --dry-run` y los tests de ambos scripts de
alarmas.
