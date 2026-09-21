# Plan: analítica propia lista para monetizar (sin GA4, sin cookies, sin banner)

Fecha: 2026-09-21
Estado: Completado 2026-09-21 (implementación + `check:ci` verde; PR con
change control record y evidencia de tests)

## Origen

Fase 2 del programa de medición (auditoría 2026-09-20): Monedario conserva su
recolector first-party + GSC + Cloudflare como stack. Decisión del operador:
no instalar GA4 hasta firmar un contrato de monetización que lo exija.

## Objetivos

1. Que solo producción (`monedario.cl`) transmita al collector; previews, dev,
   localhost y E2E nunca contaminen los agregados.
2. Contrato con `affiliate_click` y `lead_submit` tipados pero SIN emisores:
   activar monetización el día de la firma es un switch, no un proyecto.
3. Autoridad de métricas escrita: qué responde cada fuente y qué denominadores
   está prohibido mezclar.
4. Cero regresiones: suite verde + gates del repo.

## Alcance (Regla 2.1)

In-scope (editar):
- `docs/backlog/PLAN-monetization-ready-analytics-2026-09-21.md` (este spec)
- `docs/adr/ADR-20260921-production-only-transport.md` (nuevo)
- `docs/adr/ADR-20260921-precontract-monetization-events.md` (nuevo)
- `src/scripts/analytics.ts` (gate por hostname en `isTransportEnabled`)
- `src/contracts/analytics-events.ts` (`affiliate_click`, `lead_submit` + props)
- `scripts/data-signals/fetch-analytics-export.mjs` (`ALLOWED_EVENTS` += 2)
- `scripts/build-weekly-search-report.mjs` (`ANALYTICS_EVENT_NAMES` += 2)
- `docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md` (2 filas,
  estado "definido, no emitido" según precedente `support_confirmed`)
- `docs/operations/analytics/METRICS_AUTHORITY.md` (nuevo)
- `tests/integration/analytics-script.test.ts` (opt-in explícito + 3 tests
  del gate por hostname)
- `tests/integration/analytics-sanitizer.test.ts` (2 casos round-trip)

Out-of-scope (no tocar):
- `workers/**` (valida contra el contrato dinámicamente; sin copia propia)
- `src/config.ts`, `src/layouts/Layout.astro` (flag build-time = master switch)
- GA4, emisores nuevos, pipeline de export, editorial, rutas, `.env`

## Detalle de implementación

### 1. Gate productivo en `isTransportEnabled()`

Orden: (a) `window.__monedarioAnalyticsTransport === true` → on (opt-in
explícito: tests, verificación manual en preview, tests a11y existentes);
(b) DOM flag != `"enabled"` → off (master switch build-time intacto);
(c) DOM on → hostname en `{monedario.cl, www.monedario.cl}`.
Sin banners, sin cookies nuevas: el beacon de Cloudflare sigue como baseline.

### 2. Eventos pre-contrato (PII-free probado contra FORBIDDEN_KEY_PATTERN)

- `affiliate_click`: `[calculator_id, page_type, affiliate_slot, app_version]`.
  Slot = token acotado (`SAFE_TOKEN`); el mapeo slot→URL vive en el contrato
  con el partner, nunca en el payload. Sin `destination_url` (el contrato
  solo admite URLs internas).
- `lead_submit`: `[calculator_id, page_type, lead_type, app_version]` con
  `lead_type` enum `["newsletter", "alert", "contact"]` (etiquetas, no PII).
- Sin emisores, sin CTA mappings, sin cambios en el worker (acepta por
  contrato pero nada lo emite). Diccionario con estado "definido, no emitido".

### 3. Autoridad de métricas

GSC = demanda, recolector = comportamiento, Cloudflare = baseline anti-adblock;
denominadores prohibidos de mezclar; cadencia semanal; retención 90 días.

## Tabla de verificación (Regla 2.14)

| # | Comando | Resultado esperado |
|---|---|---|
| 1 | `pnpm exec vitest run tests/integration/analytics-script.test.ts` | pass, incl. localhost-bloqueado / prod-envía / opt-in-override |
| 2 | `pnpm exec vitest run tests/integration/analytics-sanitizer.test.ts` | pass, incl. round-trip de los 2 eventos nuevos |
| 3 | `pnpm exec vitest run tests/static-analysis/data-signals-allowed-events-sync.test.ts` | pass (copias del allowlist sincronizadas) |
| 4 | `pnpm run check:ci` | verde (espejo local de CI) |
| 5 | `pnpm run check:workers` | OK (worker intacto) |
| 6 | Inspección: `output/operations/data-signals/analytics/2026-W37.json` presente | continuidad del export (sin tráfico de prueba a prod: contaminaría agregados reales) |

No se envía tráfico de prueba al collector productivo en ningún paso.
