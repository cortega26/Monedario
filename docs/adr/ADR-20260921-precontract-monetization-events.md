# ADR-20260921-precontract-monetization-events

Date: 2026-09-21
Status: Accepted

## Context

La Fase 2 del programa de medición definió no instalar GA4 hasta firmar un
contrato de monetización que lo exija. Para que ese día activar sea un
switch y no un proyecto, el contrato de eventos debe tipar desde ya los dos
eventos de monetización — sin emisores, sin transporte, sin recolección.

## Decision

Dos eventos en `ANALYTICS_EVENT_ALLOWLIST`, estado "definido, no emitido"
(precedente: `support_confirmed`):

- `affiliate_click`: `[calculator_id, page_type, affiliate_slot, app_version]`.
  El slot es un token acotado (`SAFE_TOKEN`, p. ej. `utm-bajo-resultado`); el
  mapeo slot→URL del partner vive fuera del payload porque el contrato solo
  admite `destination_url` internas.
- `lead_submit`: `[calculator_id, page_type, lead_type, app_version]` con
  `lead_type` enum `["newsletter", "alert", "contact"]` (qué formulario,
  nunca quién ni con qué datos).

Prueba PII-free: `affiliate_slot` y `lead_type` no matchean ninguna
alternativa de `FORBIDDEN_KEY_PATTERN`; valores acotados a strings ≤80
(`SAFE_TOKEN` / enum). Sin CTA mappings, sin emisores: el worker acepta por
contrato pero nada lo emite. Copias sincronizadas en
`fetch-analytics-export.mjs` y `build-weekly-search-report.mjs` (gate:
`data-signals-allowed-events-sync.test.ts`); filas en el diccionario de
eventos con estado explícito.

## Consequences

Positivo: el día de la firma solo se agrega el emisor + validación de
atribución del partner. Trade-off: el allowlist crece con eventos de conteo
cero — los exports los muestran en cero hasta la activación, lo cual es la
señal correcta (cero ≠ roto). Costo operativo: nulo.

## Alternatives considered

Tipar solo al firmar: descartado — reintroduce el proyecto justo cuando el
tiempo apremia (partner esperando). Reutilizar `next_step_click`/`cta_click`
para afiliados: descartado — mezcla intención editorial con comercial y
contamina los funnels existentes.

## Verification

- `pnpm exec vitest run tests/integration/analytics-sanitizer.test.ts`
  (round-trip cliente + boundary estricto del worker para ambos eventos).
- `pnpm exec vitest run tests/static-analysis/data-signals-allowed-events-sync.test.ts`.
- `pnpm run check:ci` verde.
