# Plan 122: Remediación de la auditoría de resiliencia y performance observable (2026-09-29)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Update the status row for this plan in
> `plans/README.md` as work advances.

## Status

- **Priority**: P2/P3 + hardening
- **Effort**: M
- **Risk**: LOW (un fix de UI menor, un fallback noscript, tests)
- **Depends on**: none
- **Category**: resiliencia / UX / tests
- **Planned at**: commit `f74ee0e1`, 2026-09-29
- **Status**: DONE — RES-01/02 cerrados como no-defecto con regresión (21 tests
  en `tests/resilience/`); RES-03 corregido (botón oculto ≤360px efectivos);
  RES-04 implementado (`<noscript>` con aviso + formulario atenuado en
  calculadoras); storage/theme endurecidos (try/catch); invariantes
  `INVARIANT.RESILIENCE.*` registrados; `test:resilience` + paso de CI.
  Nota: la restauración de input tras reload del informe es restauración nativa
  del navegador (no reproduce en headless); el test fija la propiedad que
  importa: sin stale state.
- **Evidence**: `docs/reports/AUDIT-RESILIENCE-2026-09-29.md`

## Verificación previa (2026-09-29)

- **RES-01 (P2) → NO REPRODUCIDO**: local y producción, ambos modos;
  empty+Enter muestra error + `aria-invalid` + estado inválido, nunca un `$0`
  válido. Se cierra como no-defecto **con test de regresión** que fija el
  comportamiento (RES-010..013).
- **RES-02 (P2) → NO REPRODUCIDO**: el header es `position: relative`; sin
  intersección con inputs a 1440px. Se cierra como no-defecto con regression
  de solapamiento (RES-043).
- **RES-03 (P3) → CONFIRMADO**: botón "Volver arriba" `fixed … z-50 size-14`
  puede cubrir contenido con viewport efectivo estrecho (zoom 400%).
- **RES-04 (P3) → premisa inexacta, mejora válida**: no existe `<noscript>`;
  añadir fallback explícito en calculadoras.
- **Performance**: baseline ya existe (Lighthouse CI desktop hard gate +
  mobile warn-only, workflow semanal). Brecha: PERF-005 (regresión vs baseline
  móvil).

## Scope

**In scope**

- `src/components/BackToTopButton.astro` (RES-03).
- Fallback sin JS en el shell de calculadoras (RES-04): `Layout.astro` o
  componente de calculadora + `<noscript>`.
- `tests/resilience/` + `playwright.resilience.config.ts` + `test:resilience`.
- `context/INVARIANTS.md` — invariantes de resiliencia (set compacto).
- `.github/workflows/ci.yml` — paso de resiliencia en el job de a11y.
- `plans/README.md`.

**Out of scope**

- Sprint de performance genérico (sin evidencia; el field data es PASS).
- Fast/Slow 3G (el navegador del auditor no lo permite; cubrirlo requiere
  throttling de Playwright, opcional en fase 2).
- Cambios de copy YMYL.

## Steps

1. **F1 — RES-01/02: no-defecto con regresión** (`tests/resilience/`):
   - RES-010/011/012: `""`, `"   "`, `"abc"` en `#sueldo` + Enter/click →
     error visible, `aria-invalid`, estado inválido, sin resultado numérico.
   - RES-013: `0` explícito → decidir y documentar (hoy invalida; si se
     acepta donde sea válido, documentar el caso).
   - RES-043: a 1440px, con el input enfocado tras scroll, ningún elemento
     intersecta su bounding box (header incluido).
2. **F2 — RES-03: botón "Volver arriba"**: ocultarlo o reducirlo cuando el
   viewport efectivo sea muy estrecho (p. ej. `<360px`), garantizando que no
   tape targets interactivos; regression RES-045/046 (400% zoom ≈ 320px
   efectivos y solapamiento con enlaces).
3. **F3 — RES-04: degradación explícita sin JS**: añadir `<noscript>` en el
   shell de calculadoras (mensaje claro + estado no operativo visual del
   formulario), sin romper el render SSR; regression RES-003 (JS-off: el
   fallback es visible y el formulario se identifica como no operativo).
4. **F4 — suite de resiliencia** (subset de alto valor del informe):
   - RES-001/002 (contenido sin JS), RES-004/005/006 (terceros/analytics/
     imágenes bloqueados no cambian el cálculo);
   - RES-020/021/022/024/025 (input rápido, doble click idempotente, Enter,
     sin stale state);
   - RES-030..034 (reload, back/forward, sesión nueva, escenario persiste y es
     local) + RES-035/036/037 (storage/cookies bloqueados no rompen cálculo,
     vía `addInitScript` que lanza excepción en localStorage/sessionStorage);
   - RES-040/041/042 (320/390/768 sin overflow), RES-050/051 (sin errores de
     consola ni requests esenciales fallidos).
   Config `playwright.resilience.config.ts` (mismo patrón que la de
   privacidad) + script `test:resilience` + exclusión en `vitest.config.ts` +
   paso en CI.
5. **F5 — invariantes de resiliencia** en `context/INVARIANTS.md` (set
   compacto, no los 8 literales):
   - `INVARIANT.RESILIENCE.CONTENT_WITHOUT_JS`
   - `INVARIANT.RESILIENCE.CALC_LOCAL_DEPS` (sin terceros/API en runtime)
   - `INVARIANT.RESILIENCE.INPUT_STATE_COHERENT` (resultado ↔ inputs,
     idempotencia, required inválido)
   - `INVARIANT.RESILIENCE.SAVED_STATE_ISOLATED` (storage caído no rompe)
   Enforcement: `pnpm run test:resilience`.
6. **F6 — performance (documental)**: registrar el baseline del informe en el
   propio reporte (ya hecho) y anotar PERF-005 (regresión móvil vs baseline)
   como brecha opcional; no cambiar los gates de Lighthouse sin evidencia.

## Verification table

| Purpose | Command | Expected |
|---|---|---|
| Resiliencia | `pnpm run test:resilience` | verde |
| Privacidad (no regresión) | `pnpm run test:privacy` | verde |
| A11y | `pnpm exec playwright test tests/accessibility/` | verde |
| Unit | `pnpm run test` | verde |
| Build | `pnpm run build` | 20 checks |
| CI mirror | `pnpm run check:ci` | exit 0 |

## Done criteria

- [x] RES-01/02 cerrados como no-defecto con regresión que fija el
      comportamiento (local y reproducible en CI).
- [x] RES-03 corregido y con regression a viewport estrecho/zoom.
- [x] RES-04 implementado (fallback `<noscript>` explícito) con regression.
- [x] `test:resilience` en verde y en CI; invariantes registrados.
- [x] Gates en verde.

## STOP conditions

- RES-01 reaparece en otro navegador/entorno con evidencia reproducible →
  reabrir como P2 y priorizar el fix de coerción.
- El fallback `<noscript>` requiere duplicar lógica de cálculo → detener;
  solo estado visual/mensaje.
- El fix del botón altera la navegación de lectura (a11y) → revisar con axe
  antes de continuar.

## Rollback

Por paso: RES-03/F3 son cambios de UI reversibles con el commit; tests y docs
son aditivos. Sin migración de datos ni URLs.
