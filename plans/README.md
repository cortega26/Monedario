# Implementation Plans

Generado por `/improve deep` el 2026-06-11 (commit `8256c9d2`).
Ejecutar en el orden de la tabla salvo que las dependencias indiquen lo contrario.
Cada ejecutor: leer el plan completo antes de empezar, honrar sus condiciones de
STOP, y actualizar la columna de estado al terminar.

## Orden de ejecución y estado

| Plan | Título | Prioridad | Esfuerzo | Depende de | Estado |
|------|--------|-----------|----------|------------|--------|
| [001](001-csp-kofi-domain.md) | Agregar `storage.ko-fi.com` al CSP | P1 | S | — | DONE |
| [002](002-pin-setup-node-sha.md) | Pinear `actions/setup-node` por SHA | P2 | S | — | DONE |
| [003](003-page-lastmod-pr-gate.md) | Convertir `page-lastmod.yml` a PR-gate | P2 | M | — | DONE |

Status: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED (razón)` · `REJECTED (razón)`

## Notas de dependencia

Los tres planes son independientes entre sí y pueden ejecutarse en paralelo.
Sin embargo:
- El plan 002 y el plan 003 tocan `.github/workflows/page-lastmod.yml`. Si se
  ejecutan en la misma sesión, hacerlo en orden (primero 002, luego 003) para
  no crear conflictos de edición sobre la misma línea.

## Hallazgos considerados y rechazados

*(Para que auditorías futuras no re-investiguen lo mismo.)*

- **SEC-001 (Cloudflare IDs hardcodeados)**: resuelto en commit previo; ahora
  requiere env vars explícitas. No abierto.
- **SEC-002 (security headers ausentes)**: resuelto; `public/_headers` tiene CSP
  completo, HSTS, XFO, nosniff. No abierto.
- **SEC-003 (.env en historial git)**: `.env` fue trackeado pero vacío/como
  template; sin secretos en el diff. No abierto.
- **uuid vulnerable via @lhci/cli**: vulnerabilidad moderate en dep de dev tool
  (LHCI), no en path de producción. No abierto; se resolverá sola cuando LHCI
  actualice su dep.
- **innerHTML con datos calculados (interes-compuesto.astro, sueldo-liquido.astro)**:
  los valores interpolados (`year`, `balance`, etc.) son números calculados por
  el use-case TypeScript — no user input raw. Patrón seguro. No abierto.

## Backlog confirmado vigente (no en estos planes — ya en TECH_DEBT_BACKLOG.md)

| TD ID | Título | Severidad |
|-------|--------|-----------|
| TD-0067 | Refactor use-cases >200 LOC (SimulateRetirementProjection, CalculateApvComparison, EstimateFiniquito) | P2 |
| TD-0081 | Paralelizar checks pre-build en `package.json` | P3 |
| TD-0075 | Evaluar `inlineStylesheets: "auto"` vs `"never"` con medición LCP | P2 |
| TD-0077 | ADR sobre Astro features: prefetch, viewTransitions | P2 |

Estos 4 TDs se confirmaron vigentes en la auditoría del 2026-06-11 sin cambios
respecto al reporte de mayo 2026. Gestionar en `TECH_DEBT_BACKLOG.md` directamente.
