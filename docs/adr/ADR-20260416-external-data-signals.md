# ADR-20260416-external-data-signals

Date: 2026-04-16
Status: Accepted
Notes: DATA1 (GSC) y DATA2 (Cloudflare) en setup. DATA3 (Ahrefs) BLOQUEADO por licencia — 2026-04-17.

## Context

Hasta 2026-04-16 Monedario consume data externa de forma manual:

- GSC: descarga de CSV semanal + `scripts/build-weekly-search-report.mjs` (repo-driven, sin API). Runbook: `docs/operations/runbooks/weekly-search-performance-ritual.md`.
- Ahrefs: no integrado. Consultas ad-hoc vía UI.
- Cloudflare: no integrado. Analytics ignorado.

La Phase 2 (`docs/backlog/PHASE_2_NEXT_BEST_STEP.md`) y el ritual semanal necesitan data más frecuente, más estructurada y reproducible. Specifically:

- Priorizar reglas del `next-best-step` requiere comparar CTR por query contra CTR por CTA — hoy es un join manual entre CSV GSC + scorecard de analytics.
- Detectar canibalización (invariante `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`) pide observar variaciones de posición/clicks por URL a nivel diario, no semanal — el CSV manual pierde granularidad.
- Competitive adaptation (`docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`) requiere señales de competidores que hoy solo están en Ahrefs UI.
- Cloudflare expone métricas de performance real (RUM) que Lighthouse no captura y que son el contrato de `Mobile Perf ≥ 99` observado en producción.

Restricciones (ordenadas por impacto):

1. **Repo-driven.** Las señales deben aterrizar como artefactos en el repo (JSON/CSV versionados), no como dashboards externos. `docs/AI_ENGINEERING_CONSTITUTION.md` §Context Engineering exige "external knowledge must be committed to repo before it can guide agent work".
2. **Secrets fuera del repo.** API tokens viven en `.env` local y GitHub Actions secrets — nunca commiteados.
3. **Costo:** GSC API gratis, Cloudflare Analytics API gratis, Ahrefs API **paga** y requiere suscripción Advanced+. Si no hay suscripción, Ahrefs queda out-of-scope automático.
4. **SSRF y egress policy.** Commit `d62364f` ("enhance SSRF guard") endureció egress; cualquier scraper nuevo debe pasar por el guard existente o justificar bypass en ADR.

## Decision

Tres integraciones opt-in, cada una con su propio script y su propio artefacto versionado. Todas siguen el mismo patrón:

```
scripts/data-signals/<source>.mjs
  → lee secrets de env
  → llama API
  → normaliza a JSON estable (diffable)
  → escribe en output/operations/data-signals/<source>/<week>.json
  → artefacto se commitea semanalmente (o se consume in-flight por el scorecard)
```

### Fuente 1: Google Search Console (API)

- **Estado:** reemplaza (no elimina) el flujo manual CSV. El manual queda como fallback.
- **Auth:** Service Account con permiso `read-only` sobre la property de `monedario.cl`. Credenciales en `GOOGLE_APPLICATION_CREDENTIALS_JSON` (GHA secret).
- **Script:** `scripts/data-signals/gsc-fetch.mjs`.
- **Output:** `output/operations/data-signals/gsc/{week}-queries.json`, `{week}-pages.json`, `{week}-sitemaps.json`.
- **Frecuencia:** diaria en GitHub Actions (cron `0 6 * * *` UTC), bundle semanal al cerrar la semana ISO.
- **Consumo:** `build-weekly-search-report.mjs` pasa a consumir JSON en vez de CSV cuando está disponible.

### Fuente 2: Cloudflare Analytics (GraphQL Analytics API)

- **Auth:** Zone API token con scope `Analytics:Read`. Env var `CLOUDFLARE_ANALYTICS_TOKEN`.
- **Script:** `scripts/data-signals/cloudflare-fetch.mjs`.
- **Output:** `output/operations/data-signals/cloudflare/{week}-rum.json` (Web Analytics: pageviews, LCP p75, CLS p75 por ruta), `{week}-cache.json` (ratio hit/miss para invalidación de headers).
- **Frecuencia:** diaria.
- **Consumo:** feed a un nuevo bloque "Performance real" en el scorecard semanal; alertas si LCP p75 > 2.5 s (soft) o > 4 s (hard).

### Fuente 3: Ahrefs (Site Explorer API — **BLOQUEADA**)

- **Estado:** ❌ **BLOQUEADO por licencia** — confirmado 2026-04-17. Sin suscripción Advanced+ activa. Ticket MON-ENV-DATA3 marcado como `blocked:license`.
- **Gate:** esta fuente queda documentada pero **no implementada** hasta que se confirme suscripción con acceso API.
- **Auth (pendiente):** API token en `AHREFS_API_TOKEN`.
- **Script (pendiente):** `scripts/data-signals/ahrefs-fetch.mjs`.
- **Output (pendiente):** `output/operations/data-signals/ahrefs/{week}-backlinks.json`, `{week}-competitors.json` (top 10 competidores por hub), `{week}-keywords-gap.json`.
- **Frecuencia:** semanal (evitar quemar quota).
- **Consumo:** feed a `docs/research/seo/` como input para `COMPETITIVE_ADAPTATION_POLICY`.
- **Desbloqueo:** cuando se confirme suscripción API, re-abrir ticket y ejecutar setup (crear token, guardar `AHREFS_API_TOKEN` en GHA secrets, activar script).

### Normalización transversal

Todos los scripts deben:
- Emitir JSON con keys ordenadas alfabéticamente (diff-friendly).
- Truncar timestamps a día (no hora) salvo que la métrica lo requiera.
- Incluir header `{ "source": "...", "fetchedAt": "...", "schemaVersion": 1 }`.
- Rechazar respuestas sin `schemaVersion` esperada (fail-loud en CI).

## Consequences

**Positivo:**
- Señales auditables en el repo: cualquier agente (humano o IA) puede responder "¿qué pasó la semana del 12?" con `git log` + `jq`.
- Phase 2 gana input cuantitativo para priorizar reglas.
- Elimina dependencia de "abro Ahrefs y miro" como única forma de inteligencia competitiva.
- Detección temprana de regresiones de LCP real (RUM), no simulado.

**Trade-offs:**
- Repo crece ~2–5 MB/mes en JSONs versionados. Mitigación: `.gitattributes` marca la carpeta como `-diff` para no hacer blame ruidoso; rotación trimestral a `output/archive/`.
- Nuevas credenciales = nuevo vector de riesgo. Mitigación: tokens con scope mínimo, rotación semestral, no se exponen en logs de GHA.
- Ahrefs API cuesta (≥ USD 500/mes según tier). Decisión de compra queda fuera de este ADR.

**Costo operativo:**
- Setup inicial: ~4 h (crear Service Account GSC, crear Cloudflare token, configurar GHA secrets).
- Mantenimiento: ~30 min/mes revisar fallos de cron.

## Alternatives considered

1. **Un único ETL custom con base de datos.** Descartado — introduce backend, viola `OWNERSHIP_BEFORE_EXPANSION`, y no aporta valor sobre JSON versionado a este volumen.
2. **Looker Studio / Metabase sobre GA4.** Descartado como **fuente canónica** porque no es repo-driven; admisible como dashboard de apoyo.
3. **Seguir solo con CSV manual.** Descartado — la latencia (1 semana) ya está causando pérdida de señal en Phase 2 priorización.
4. **Plausible/Simple Analytics.** Descartado — no reemplazan GSC ni Ahrefs; Cloudflare ya cubre RUM básico.

## Verification

- `pnpm run data-signals:gsc -- --week=2026-W16` produce `output/operations/data-signals/gsc/2026-W16-*.json` válido (schema check en el script).
- `pnpm run data-signals:cloudflare -- --week=2026-W16` produce RUM JSON con al menos 6 rutas owner.
- `pnpm run data-signals:ahrefs -- --week=2026-W16` (si licencia): backlinks JSON con ≥ 1 registro.
- Workflow GHA `.github/workflows/data-signals.yml` corre green en su primer run.
- `build-weekly-search-report.mjs` detecta los JSONs y los mergea al scorecard sin romper el flujo CSV preexistente.

## Related

- `docs/backlog/PHASE_2_DATA_SIGNALS.md` — plan de implementación + tickets.
- `docs/operations/runbooks/weekly-search-performance-ritual.md` — ritual que consume los outputs.
- `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` — política que consume Ahrefs.
- `docs/AI_ENGINEERING_CONSTITUTION.md` §Context Engineering — exige artefactos en repo.
- Commit `d62364f` — SSRF guard (referencia para egress policy).
