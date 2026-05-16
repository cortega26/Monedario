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
