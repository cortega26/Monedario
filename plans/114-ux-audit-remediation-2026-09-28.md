# Plan 114: Remediación auditoría UX/UI 2026-09-28 — Fase 1 (P1 + guardas)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Update the status row for this plan in
> `plans/README.md` as work advances.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: UX/a11y correctness + regression guards
- **Planned at**: commit `224b6f74`, 2026-09-28
- **Status**: Fase 1 DONE y Fase 2 parcial (F-05, F-06, F-08 en 17 páginas,
  guard de IDs). Pendientes: F-07, F-08 completo, F-09/F-10 y estructural
  (2026-09-28).
- **Evidence**: `docs/reports/AUDIT-UX-2026-09-28.md`

## Scope

**In scope (Fase 1)**

- `src/utils/calculatorResultState.ts` (nuevo, helper de estado de resultado)
- `src/utils/sueldo-liquido/{formController.ts,resultRenderer.ts}`
- `src/pages/calculadoras/sueldo-liquido.astro`
- Las 15 calculadoras restantes con `data-is-example`: `reajuste-arriendo`,
  `deposito-a-plazo`, `boleta-honorarios-liquido`, `dividendo-hipotecario`,
  `operacion-renta`, `simulador-renegociacion`, `seguro-cesantia`,
  `impuesto-segunda-categoria`, `credito-consumo`, `simulador-jubilacion`,
  `iva`, `tarjeta-credito`, `interes-compuesto`, `apv`, `prepago-credito`
- `src/pages/buscar.astro` (F-02)
- `src/data/glossary/{apv.md,sbif.md,tpm.md}` (F-04, tarea de contenido explícita)
- `scripts/check-postbuild.mjs` + `tests/scripts/check-postbuild.test.ts` (guarda F-04)
- `tests/accessibility/{calculator-states,form-labels,search}.test.ts`
- `tests/unit/calculator-result-state.test.ts` (parte pura del helper)
- `docs/reports/AUDIT-UX-2026-09-28.md`, `plans/README.md`

**Out of scope**

- F-05 (declaración de accesibilidad), F-06 rollout visual completo, F-07, F-08,
  F-09, F-10 → Fase 2/3 del plan.
- `src/domain/**`, `src/application/**`, `src/infrastructure/**` (sin cambios).
- Sustituir la UI de Pagefind (ver F-02, limitación aceptada).
- URLs, slugs, RSS, sitemap (sin cambios).

## F-01 + F-06 — Estado de resultado explícito

Contrato único: el contenedor de resultado lleva
`data-result-state="example|invalid|result"`; `data-is-example="true"` solo en
estado inicial.

1. Helper `src/utils/calculatorResultState.ts`:
   - `buildInvalidStateModel()` (puro, testeable en Vitest).
   - `renderInvalidResultState({container?, message?, hint?})`: reemplaza el
     contenido del contenedor por "Corrige los datos para calcular", fija
     `data-result-state="invalid"`, retira `data-is-example` y oculta
     `#result-actions`, `#calculator-result-next-actions`,
     `#share-calculator-result`.
   - `markResultState(container, state)`.
   - Resolución de contenedor: `[data-is-example="true"], [data-result-state]`
     o `#resultado-contenido`.
2. `sueldo-liquido`: `updateResultDisplay()` llama `markResultState(..., "result")`;
   `formController.handleCalculate()` llama `renderInvalidResultState()` en
   `rawInput <= 0` y en errores capturados.
3. Rollout: en cada calculadora, el estado inválido se invoca en la función de
   error local (`showError`/`showInlineError`) o en el retorno de validación, y
   `markResultState(container, "result")` en el render válido. El input primario
   recibe `aria-invalid` + `aria-describedby` cuando el error es de campo.
4. Etiqueta inicial "Ejemplo ilustrativo" y contenedor diferenciado (F-06).

## F-02 — Estados del buscador

- `buscar.astro`: `role="status"` + `aria-live="polite"` en
  `.pagefind-ui__message`; `aria-busy` en la región mientras existan
  `.pagefind-ui__loading`; bloque de recuperación para cero resultados
  ("Limpiar búsqueda" + temas frecuentes) vía MutationObserver.
- Limitación documentada: Pagefind hace OR por tokens; la relevancia no se
  modifica en esta fase.

## F-03 — Nombres accesibles

- `credito-consumo`: `CalculatorRadioGroup` para "Tipo de tasa" (elimina el
  `for` colgante) + label propio para `#tasa`.
- `dividendo-hipotecario`: `for="propertyValue"`.
- `simulador-renegociacion`: `aria-label` en los 4 inputs de deuda y en las
  filas dinámicas; `aria-label="Eliminar deuda"` en el botón "×".
- Test `form-labels.test.ts` sobre todas las páginas `/calculadoras/*` del
  sitemap, usando `el.labels.length || aria-label/aria-labelledby` (ignora
  placeholder, `type=hidden` y `aria-hidden`), con fila dinámica incluida.

## F-04 — Jerarquía de headings

- `src/data/glossary/{apv,sbif,tpm}.md`: 5× `####` → `###`.
- `comisiones-afp.astro`: `h3` → `h2` conservando clases.
- `scripts/check-postbuild.mjs`: check `heading-hierarchy` (saltos > 1 dentro
  de `<main>` en todo `dist`), helper puro exportado + tests Vitest.

## Verification table

| Purpose | Command | Expected |
|---|---|---|
| Unit | `pnpm run test` | green |
| Lint/format | `pnpm run lint` + `pnpm run format:check` | exit 0 |
| Types | `pnpm run astro check` | 0 errors |
| Boundaries | `pnpm run check:boundaries` | pass |
| Full build + postbuild guard | `pnpm run build` | exit 0, 0 heading jumps |
| A11y E2E | `pnpm exec astro preview --port 4321` then `pnpm exec playwright test tests/accessibility/` | all pass |
| CI mirror | `pnpm run check:ci` | pass |

## Done criteria

- [x] 16 calculadoras muestran `data-result-state="invalid"` (sin ejemplo) ante
      input inválido y `data-result-state="result"` tras cálculo válido.
- [x] Fronteras de sueldo cubiertas por test: vacío, 0, negativo, decimal, alto,
      válido (texto no aplica a `input[type=number]`).
- [x] Buscador: cero-resultados con recuperación funcional y anuncio accesible.
- [x] 0 controles sin nombre programático en calculadoras.
- [x] 0 saltos de heading en `dist` (guard en check-postbuild).
- [x] Gates de la tabla en verde.
- [x] `plans/README.md` actualizado.

## Progress log

### 2026-09-28 — Fase 1 completada

- **F-01/F-06**: `src/utils/calculatorResultState.ts` (contrato
  `data-result-state`, `renderInvalidResultState`, `markResultState`); wiring en
  `sueldo-liquido` (formController + resultRenderer) y rollout a las 15
  calculadoras restantes con `data-is-example`. Etiqueta inicial "Ejemplo
  ilustrativo — no es tu resultado".
- **Hallazgo colateral corregido en `iva.astro`**: `#resultado` estaba duplicado
  (panel + contenido), por lo que `getElementById` operaba sobre el wrapper y el
  ejemplo visible nunca se invalidaba ni se restauraba. El contenido pasó a
  `#resultado-contenido`.
- **F-02**: `buscar.astro` con `role="status"`/`aria-live` en el mensaje de
  Pagefind, `aria-busy` mientras hay skeletons y estado vacío con "Limpiar
  búsqueda" + temas frecuentes. Limitación documentada: la relevancia la define
  Pagefind (OR por tokens); `xyzzy-no-results-audit` sí coincide con 5 páginas.
- **F-03**: fieldset/legend para "Tipo de tasa" y label de `#tasa` en
  `credito-consumo`; `for="propertyValue"` en `dividendo-hipotecario`;
  `aria-label` en los 4 inputs de deuda (estáticos y dinámicos) y en el botón
  eliminar de `simulador-renegociacion`.
- **F-04**: 5× `####`→`###` en `src/data/glossary/{apv,sbif,tpm}.md`;
  `h3`→`h2` en `comisiones-afp`; guard `heading-hierarchy` en
  `check-postbuild` con helper puro y tests.
- **Tests**: `tests/accessibility/calculator-states.test.ts` (21),
  `tests/accessibility/form-labels.test.ts` (23),
  `tests/accessibility/search.test.ts` (+3),
  `tests/unit/calculator-result-state.test.ts` (6),
  `tests/scripts/check-postbuild.test.ts` (+4).

### Evidencia de gates

- `pnpm run lint` exit 0; `pnpm run format:check` exit 0.
- `pnpm run test` (vitest): suite verde.
- `pnpm run build`: `[check-postbuild] OK. 7 checks passed over 332 HTML pages.`
- `pnpm exec playwright test tests/accessibility/`: **116 passed** (contra
  `astro preview` con el `dist` del build).
- `pnpm run check:ci`: **exit 0**.

### 2026-09-28 — Fase 2, ronda 2

- **Hueco de F-01 cerrado**: `finiquito-indemnizacion` era la 17.ª página con
  `data-is-example` y había quedado fuera del rollout de la Fase 1; ahora usa
  el helper (estado inválido + `markResultState` en sus dos renders) y está en
  la suite de estados.
- **F-06**: rótulo "(Ejemplo)" → "(Ejemplo ilustrativo)" en 15 calculadoras y
  guía "Ingresa tus datos para ver tu resultado" en la nota del ejemplo.
- **F-08 (parcial)**: `CalculatorDataFreshness` con variante `result`
  ("Estimación referencial · no es una cotización ni liquidación oficial") en
  10 calculadoras; `CalculatorResultPanel` con prop `disclaimer` para las 7 que
  no usan parámetros económicos (depósito, honorarios, crédito de consumo, IVA,
  tarjeta, interés compuesto, finiquito). Cobertura total: 17/17 páginas con
  resultado interactivo. Quedan fuera los conversores y las calculadoras sin
  ejemplo (Fase 3).
- **Guard nuevo**: `unique-element-ids` en `check-postbuild` (detecta IDs
  duplicados por página; el caso `iva.astro` de la Fase 1 fue el disparador) con
  tests del helper puro.
- **F-05**: declaración de accesibilidad con última verificación
  (28-09-2026), próxima revisión (marzo 2027), conteo real de la suite (134
  pruebas) y changelog de accesibilidad.
- **Evidencia**: `pnpm run build` → `[check-postbuild] OK. 8 checks passed over
  332 HTML pages`; `playwright tests/accessibility` → **134 passed**;
  `check:ci` → exit 0.

### Anexo CI (higiene, fuera del alcance UX)

`check:ci` estaba rojo en `main` por dos tests preexistentes introducidos por
`667fdbc9` (#537) en `.github/workflows/ops-reminders.yml`:
`actions/github-script@v7` sin pin y `runs-on: ubuntu-latest` fuera del
allowlist documentado del test de portabilidad. Se fijó el action a
`f28e40c7f34bde8b3046d885e986cb6290c5673b # v7.0.1` (misma versión, sin salto
de major) y se añadió `ops-reminders.yml` a `fullyOutOfScopeFiles` (archivo
creado después del retiro del bridge 2026-08-01, según el propio comentario del
test y ADR-20260716). Sin cambios de comportamiento.

## STOP conditions

- Falta un `showError`/punto único de validación en una calculadora y el wiring
  exigiría reescribir su controlador (reportar; no refactorizar).
- Un cambio de label altera el layout de forma no absorbible por Tailwind.
- El guard de headings revela saltos en páginas fuera de las 4 documentadas
  (puede ser drift de contenido: reportar antes de tocar).
- Playwright no puede ejecutarse en el entorno (el test estructural debe
  existir y pasar antes de cerrar).

## Fase 2/3 — estado

- [x] **F-05**: `/accessibilidad/` con verificación, próxima revisión, conteo
  real de la suite y changelog.
- [x] **F-06**: "Ejemplo ilustrativo" + guía de ingreso en las 15 calculadoras.
- [x] **F-08 (parcial)**: bloque de estimación referencial en las 17 páginas con
  resultado interactivo (10 con `CalculatorDataFreshness variant="result"`,
  7 con `disclaimer` en el panel). Faltan conversores y calculadoras sin
  ejemplo.
- [x] **Guard de IDs duplicados**: `unique-element-ids` en `check-postbuild`.
- [ ] **F-07**: identificador de tipo de contenido en breadcrumb/encabezado
  (`Guía`, `Artículo`, `Calculadora`, `Glosario`, `Ley`).
- [ ] **F-09/F-10**: contexto de página en hubs y compactación móvil con ancla.
- [ ] **Estructural**: componentes `FinancialField` y `ResultPanel` con variantes
  de estado; migración de las 22 calculadoras; axe sobre todas las plantillas de
  calculadora; pasada manual con NVDA/VoiceOver.
- [ ] **F-08 completo**: fecha, base imponible y topes por calculadora dentro
  del bloque (requiere contrato por página).

## Rollback

Revertir por fase: el helper y las llamadas son aditivas; el contenido de
glosario y el guard son reversibles sin efecto en URLs ni RSS.
