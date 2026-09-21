# ADR-20260921-production-only-transport

Date: 2026-09-21
Status: Accepted

## Context

El flag build-time `SITE.analyticsTransport` (inyectado como
`data-analytics-transport="enabled"` en `Layout.astro`) viaja igual en todos
los builds: producción, previews de Cloudflare Pages (`*.pages.dev`, branch
deploys), dev local y E2E. Todo lo que cargue esos builds transmite al
collector productivo y contamina los agregados semanales.

## Decision

Gate por hostname en tiempo de ejecución (`isTransportEnabled`,
`src/scripts/analytics.ts`), en este orden:

1. Opt-in explícito (`window.__monedarioAnalyticsTransport === true`) gana
   siempre: tests unitarios/integración, verificación manual en preview y la
   suite Playwright de accesibilidad ya lo usan en hosts no productivos.
2. Sin el flag DOM `enabled`, apagado (master switch build-time intacto).
3. Con el flag DOM, solo transmiten `monedario.cl` y `www.monedario.cl`.

Sin banners ni cookies nuevas: Cloudflare Web Analytics (beacon del edge)
sigue como baseline siempre activo.

## Consequences

Positivo: agregados productivos libres de tráfico de prueba sin matriz de
builds ni dependencia del dashboard de Pages. Trade-off: un error en la lista
de hosts apagaría la medición en silencio — mitigado por los tests del gate
y porque dataLayer sigue registrando localmente (observabilidad sin
transmisión). Costo operativo: nulo.

## Alternatives considered

Variable de entorno build-time por entorno de Pages (Production vs Preview):
descartada por depender del dashboard y no cubrir previews ad-hoc, E2E
locales ni `wrangler pages dev`. Kill-switch global adicional: innecesario,
el flag DOM ya lo es.

## Verification

- `pnpm exec vitest run tests/integration/analytics-script.test.ts` (7 tests:
  localhost bloqueado, `monedario.cl` transmite, opt-in override).
- Suite a11y sin cambios (ya usa opt-in explícito).
- `pnpm run check:ci` verde.
