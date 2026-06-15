# Implementation Plans

Auditoría inicial: `/improve deep` el 2026-06-11 (commit `8256c9d2`) → planes 001–019.
Re-auditoría: `/improve deep` el 2026-06-15 (commit `57ad5261`) → planes 020–023.

Ejecutar en el orden de la tabla salvo que las dependencias indiquen lo contrario.
Cada ejecutor: leer el plan completo antes de empezar, honrar sus condiciones de
STOP, y actualizar la columna de estado al terminar.

## Orden de ejecución y estado

### Re-auditoría 2026-06-15 (planes nuevos — pendientes)

| Plan | Título | Prioridad | Esfuerzo | Depende de | Estado |
|------|--------|-----------|----------|------------|--------|
| [020](020-afp-comparison-cheapest-name.md) | Corregir nombre de AFP cableado ("AFP Uno") en la nota de comparación | P2 | S | — | TODO |
| [021](021-economic-snapshot-hardening.md) | Endurecer worker de snapshot económico (IPC ausente, deriva, timeouts) | P2 | M | — | TODO |
| [022](022-consolidate-clp-formatter.md) | Consolidar formateador CLP en módulo leaf único | P3 | S | — | TODO |
| [023](023-gate-floor-and-reddit-alert-atomicity.md) | Guardas anti-paso-vacío en gates rutas/RSS + alerta Reddit atómica | P3 | S | — | TODO |

### Auditoría 2026-06-11 (ejecutados)

| Plan | Título | Prioridad | Esfuerzo | Estado |
|------|--------|-----------|----------|--------|
| [001](001-csp-kofi-domain.md) | Agregar `storage.ko-fi.com` al CSP | P1 | S | DONE |
| [002](002-pin-setup-node-sha.md) | Pinear `actions/setup-node` por SHA | P2 | S | DONE |
| [003](003-page-lastmod-pr-gate.md) | Convertir `page-lastmod.yml` a PR-gate | P2 | M | DONE |
| 004 | Higiene de dependencias (5 correcciones) | P1 | S | DONE |
| 005 | Limpieza de duplicación de código (6 correcciones) | P1 | S | DONE |
| 006 | Correcciones de rendimiento (O(n²), re-sorting, ArticleView) | P1 | S | DONE |
| 007 | Fundación de DX (pre-commit, editorconfig, knip, CI timeout) | P1 | S | DONE |
| 008 | Infraestructura de testing + cobertura crítica | P1 | M | DONE |
| 009 | Endurecer CSP a hash-based | P2 | M | DONE |
| 010 | Cache poisoning del proveedor económico + null assertions | P2 | S | DONE |
| 011 | Reemplazar `innerHTML` con DOM safe APIs + try/catch AFP | P2 | M | DONE |
| 012 | Docs | P2 | S | DONE |
| 013 | Paralelizar CI + caching de build | P2 | M | DONE |
| 014 | Refactor `sueldo-liquido.astro` (god file 2318 LOC) | P2 | M | DONE |
| 015 | Expandir paneles de escenarios | P2 | M | DONE |
| 016 | Centralizar share-result | P2 | M | DONE |
| 017 | Diseño: calculator shell (prototipo, sin activar) | P2 | M | DONE |
| 018 | Diseño: activación MDX (DecisionTree/InlineCalculator, sin activar) | P2 | M | DONE |
| 019 | Diseño: dashboard AFP (sin activar) | P2 | M | DONE |

> **Nota de reconciliación (2026-06-15):** los planes 004–019 se generaron el
> 2026-06-11 y se ejecutaron vía ramas `advisor/0NN-*` integradas en
> `advisor/integration-2026-06-15` (ver git log: "apply Plan 015", "Plan 011,
> 014, 016", etc.). El árbol de trabajo sólo conserva los archivos 001–003; los
> archivos 004–019 viven en el historial git de sus ramas. Numeración monotónica
> continúa en 020.

Status: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED (razón)` · `REJECTED (razón)`

## Notas de dependencia

- **020–023 son independientes entre sí** y de los planes previos; pueden
  ejecutarse en paralelo o en cualquier orden.
- Recomendación de prioridad: **020 y 021 primero** (ambos tocan rutas YMYL —
  texto de calculadora y datos económicos que alimentan todas las calculadoras).
  **022 y 023** son defensa-en-profundidad de bajo riesgo.
- 021 toca tres archivos del worker `economic-snapshot-refresh`; 023 toca el
  worker `reddit-mention-monitor` y dos scripts `compare-*`. No se solapan.

## Hallazgos considerados y rechazados

*(Para que auditorías futuras no re-investiguen lo mismo.)*

Auditoría 2026-06-11:
- **SEC-001 (Cloudflare IDs hardcodeados)**: resuelto; requiere env vars. No abierto.
- **SEC-002 (security headers ausentes)**: resuelto; `public/_headers` con CSP, HSTS, XFO, nosniff. No abierto.
- **SEC-003 (.env en historial git)**: trackeado pero vacío/template; sin secretos en el diff. No abierto.
- **uuid vulnerable via @lhci/cli**: moderate en dep de dev tool (LHCI), no en producción. Se resolverá al actualizar LHCI.
- **innerHTML con datos calculados**: los valores interpolados son números calculados por el use-case (no input raw). Patrón seguro.

Re-auditoría 2026-06-15:
- **Math de las calculadoras (todos los use-cases)**: auditoría dedicada de
  CalculateNetSalary, SimulateRetirementProjection, CalculateApvComparison,
  EstimateFiniquito, CalculateMortgage, EstimateUnemploymentCoverage y dominio
  tributario/económico — **0 bugs de cálculo**. Topes, tramos, redondeo y
  continuidad en bordes verificados contra los tests. No abierto.
- **Escape de embeds Discord (reddit-monitor)**: `JSON.stringify` ya escapa todos
  los campos del embed; el markdown de Discord es intencional y no ejecuta script.
  No abierto.
- **Secreto `/__refresh` reusa `GITHUB_TOKEN` (economic worker)**: el endpoint no
  está ruteado y el token se compara (no se expone); higiene menor reconocida en
  el propio comentario del código. No abierto (bajo valor).
- **CalculatorShell / DecisionTree / InlineCalculator sin importar**: NO es código
  muerto — son prototipos de los planes de diseño 017/018/019, pendientes de un
  plan de activación. Ver "Dirección" abajo. No abierto como bug.

## Dirección (decisión del mantenedor — no planificado aún)

- **Activar los prototipos de diseño (017/018/019).** `CalculatorShell.astro`,
  `DecisionTree.astro` e `InlineCalculator.astro` fueron entregados por planes de
  diseño pero no se importan en ninguna página. Mientras tanto ~19 páginas de
  calculadora repiten la derivación de "próximos pasos" que `CalculatorShell` fue
  diseñado para absorber. El trabajo adyacente es un plan de migración que cablea
  el shell y elimina la duplicación (M–L, toca muchas páginas). Decisión de
  producto/esfuerzo: planificar sólo si se decide comprometer la migración.

## Backlog confirmado vigente (no en estos planes — ya en TECH_DEBT_BACKLOG.md)

| TD ID | Título | Severidad |
|-------|--------|-----------|
| TD-0067 | Refactor use-cases >200 LOC (SimulateRetirementProjection, CalculateApvComparison, EstimateFiniquito) | P2 |
| TD-0081 | Paralelizar checks pre-build en `package.json` | P3 |
| TD-0075 | Evaluar `inlineStylesheets: "auto"` vs `"never"` con medición LCP | P2 |
| TD-0077 | ADR sobre Astro features: prefetch, viewTransitions | P2 |

Confirmados vigentes en la re-auditoría 2026-06-15. Gestionar en
`TECH_DEBT_BACKLOG.md` directamente.
