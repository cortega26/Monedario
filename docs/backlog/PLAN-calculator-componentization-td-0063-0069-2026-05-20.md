# Plan: componentizacion de calculadoras TD-0063 + TD-0069

Fecha: 2026-05-20
Estado: Completed 2026-05-20
Fuente: `docs/TECH_DEBT_BACKLOG.md` (`TD-0063`, `TD-0069`) + medicion local 2026-05-20.

## Proposito

Reducir el tamano y la duplicacion de las calculadoras Astro sin cambiar rutas publicas, formulas, resultados, SEO, RSS, canonical ni contenido YMYL publicado.

Este plan no autoriza redisenos visuales, reescrituras completas ni cambios de formulas. La unidad de trabajo es refactor estructural con paridad funcional.

## Scope block

In scope:

- `src/pages/calculadoras/sueldo-liquido.astro`
- `src/pages/calculadoras/apv.astro`
- `src/pages/calculadoras/finiquito-indemnizacion.astro`
- Pares con duplicacion medida por `jscpd`, empezando por:
  - `src/pages/calculadoras/deposito-a-plazo.astro`
  - `src/pages/calculadoras/interes-compuesto.astro`
  - `src/pages/calculadoras/credito-consumo.astro`
  - `src/pages/calculadoras/tarjeta-credito.astro`
  - `src/pages/calculadoras/conversor-uf.astro`
  - `src/pages/calculadoras/conversor-utm.astro`
- Nuevos componentes compartidos bajo `src/components/calculator/`.
- Tests existentes de aplicacion/calculadoras y snapshots de rutas/RSS solo para verificacion.
- `docs/TECH_DEBT_BACKLOG.md` y `docs/backlog/README.md` al cerrar estado/evidencia.

Out of scope:

- Crear, eliminar o renombrar rutas publicas.
- Cambiar slugs, canonical URLs, RSS, sitemap o snapshots base.
- Cambiar formulas, parametros economicos, tasas, montos, textos legales o criterios YMYL.
- Refactorizar use-cases de aplicacion (`TD-0067`) salvo si un import queda mecanicamente necesario.
- Adoptar `inlineStylesheets`, prefetch, View Transitions o cambios de performance que requieren ADR/medicion (`TD-0075`, `TD-0077`).
- Arreglar la falla preexistente de `tests/e2e/redirect-links.e2e.test.ts` sobre `"/cambios/"`.

## Autoridad e invariantes

- Constitucion: `docs/AI_ENGINEERING_CONSTITUTION.md`.
- Protocolo agente: `docs/development/AGENT_EXECUTION_PROTOCOL.md`.
- Invariantes preservadas:
  - `URL.PUBLIC.NO_POST_ID`
  - `ROUTES.NO_SILENT_CHANGES`
  - `RSS.NO_REMOVALS`
  - `FRONTMATTER.VALID`
- Contratos preservados:
  - `CONTRACT.PUBLIC_URLS`
  - `CONTRACT.ROUTES_SNAPSHOT`
  - `CONTRACT.RSS_POLICY`
  - `CONTRACT.FRONTMATTER_POLICY`

## Baseline actual 2026-05-20

LOC calculadoras (`wc -l src/pages/calculadoras/*.astro | sort -rn | head -n 20`):

| Archivo | LOC |
|---|---:|
| `sueldo-liquido.astro` | 2134 |
| `apv.astro` | 1026 |
| `finiquito-indemnizacion.astro` | 943 |
| `simulador-renegociacion.astro` | 855 |
| `prepago-credito.astro` | 804 |
| `operacion-renta.astro` | 799 |
| `seguro-cesantia.astro` | 791 |
| `dividendo-hipotecario.astro` | 708 |
| `reajuste-arriendo.astro` | 664 |
| `interes-compuesto.astro` | 653 |
| `simulador-jubilacion.astro` | 652 |
| `deposito-a-plazo.astro` | 629 |

Duplicacion (`npx --yes jscpd src/pages/calculadoras src/components --min-lines 15 --min-tokens 100 --reporters console`):

- Total: 14 clones, 342 duplicated lines, 1.69% duplicated lines.
- Clones relevantes:
  - `deposito-a-plazo` ↔ `interes-compuesto`: helpers de formato/error/render de resultado.
  - `credito-consumo` ↔ `tarjeta-credito`: render/resultado y estructura comun de calculadora de deuda.
  - `conversor-uf` ↔ `conversor-utm`: markup de formularios/conversion.
  - `boleta-honorarios-liquido` ↔ `finiquito-indemnizacion`: helpers de render/resultado.
  - Clones secundarios entre `reajuste-arriendo`, `prepago-credito`, `simulador-renegociacion`, `dividendo-hipotecario` y `simulador-jubilacion`.

Baseline de tests:

- `pnpm run check`: PASS en la reconciliacion previa.
- `pnpm run build`: PASS en la reconciliacion previa.
- `pnpm run check:routes`: PASS, 0 removals; 11 altas conocidas frente al baseline.
- `pnpm run check:rss`: PASS, 0 removals; 35 altas permitidas.
- `pnpm run test`: FAIL por deuda ajena a este plan: `tests/e2e/redirect-links.e2e.test.ts` espera `"/cambios/"` en `HeroHomepage.astro`, pero la ruta no existe y el componente enlaza `"/metodologia/"`.

## Estrategia

### Fase 0 — Preparacion

- Confirmar que no hay cambios no relacionados en los archivos de calculadoras antes de editar.
- Ejecutar subset de tests de use-cases relacionados:
  - `tests/application/CalculateNetSalary.test.ts`
  - `tests/application/EstimateFiniquito.test.ts`
  - `tests/application/CalculateApvComparison.test.ts` si existe; si no, test equivalente del use-case APV.
  - `tests/application/CalculateCompoundInterest.test.ts`
  - `tests/application/CalculateTermDeposit.test.ts`
  - `tests/application/CalculatorPortfolio.test.ts`
- Registrar la falla global de `pnpm run test` como deuda preexistente, no como regresion de este bloque.

### Fase 1 — Componentes compartidos de bajo riesgo

Crear `src/components/calculator/` con componentes de presentacion, sin logica financiera:

- `CalculatorShell.astro`: layout comun opcional para header/badge/main/footer si reduce LOC sin forzar todas las paginas a migrar.
- `CalculatorExplainerSection.astro`: wrapper de secciones explicativas con `content-visibility`.
- `CalculatorResultPanel.astro`: contenedor del panel de resultado con heading accesible y slot.
- `CalculatorField.astro`: label/input/help/error pattern para campos simples.
- `CalculatorRadioGroup.astro`: radio cards accesibles para modos como finiquito/vacaciones e impuesto si aplica.

Regla: no extraer scripts inline de calculo en esta fase; solo markup estable.

### Fase 2 — Top 3 por tamano (`TD-0063`)

Orden recomendado:

1. `finiquito-indemnizacion.astro`: extraer modo selector, campos repetidos y secciones explicativas. Riesgo medio-bajo porque `EstimateFiniquito` ya esta cubierto.
2. `apv.astro`: extraer bloques informativos y estructura de resultado, cuidando no tocar formula ni textos tributarios.
3. `sueldo-liquido.astro`: extraer solo componentes de markup estables. Mantener la logica inline y helpers de render hasta que exista un plan separado para scripts.

Criterio por PR/lote:

- Cada archivo debe tener diff revisable y preservar IDs usados por JS (`resultado`, `resultado-heading`, inputs, radios, botones).
- No buscar <800 LOC en una sola pasada si eso obliga a mover scripts grandes o reescribir funciones; preferir progreso incremental documentado.

### Fase 3 — Duplicacion entre pares (`TD-0069`)

Orden recomendado:

1. `deposito-a-plazo` + `interes-compuesto`: extraer helpers de resultado o markup compartido de panel/rows si no rompe el script.
2. `credito-consumo` + `tarjeta-credito`: extraer presentacion comun de resultados de deuda.
3. `conversor-uf` + `conversor-utm`: extraer formulario/conversion card.
4. Re-medir clones secundarios y decidir si el beneficio justifica tocar mas paginas.

Meta de cierre:

- `jscpd` total <0.5% duplicacion o justificar por que los clones restantes son aceptados.
- Ningun par calc-calc del set inicial mantiene >10 lineas duplicadas sin decision documentada.

### Fase 4 — Verificacion y cierre documental

Gates esperados:

- `pnpm run check`
- `pnpm run build`
- `pnpm run check:routes`
- `pnpm run check:rss`
- Tests focalizados de use-cases/calculadoras tocadas.
- `npx --yes jscpd src/pages/calculadoras src/components --min-lines 15 --min-tokens 100 --reporters console`
- Lighthouse mobile en rutas refactorizadas si el cambio toca layout above-the-fold o assets críticos.

Gate conocido no limpio:

- `pnpm run test` completo puede seguir fallando por `tests/e2e/redirect-links.e2e.test.ts` (`"/cambios/"`) hasta que se resuelva fuera de este plan.

## Change Control Record

1. Scope declaration
- In scope: calculadoras y componentes compartidos listados arriba; docs de cierre.
- Out of scope: rutas/RSS/canonical/frontmatter/YMYL formulas/textos legales.

2. Impacted modules
- `src/pages/calculadoras/**`: refactor markup/presentacion.
- `src/components/calculator/**`: componentes compartidos nuevos.
- `tests/application/**`: solo si un refactor requiere actualizar imports o agregar regression focalizada.
- `docs/TECH_DEBT_BACKLOG.md`, `docs/backlog/README.md`: cierre de estado/evidencia.

3. Invariant preservation
- No se derivan URLs desde `post.id`.
- No se agregan/remueven rutas.
- No se modifica RSS.
- No se modifica frontmatter.

4. Contract preservation
- Public URLs, canonical, RSS y snapshots base preservados.
- IDs DOM usados por scripts deben mantenerse o migrarse con test/manual smoke equivalente.

5. Boundary integrity
- Componentes Astro de presentacion no importan dominio directamente.
- Use-cases financieros permanecen en `src/application/use-cases/**`.

6. Test coverage impact
- No se cambian formulas.
- Tests de use-cases deben permanecer verdes.
- Si se extrae logica JS reusable, agregar test focalizado antes de cerrar.

7. Rollback strategy
- Revertir componentes nuevos y restaurar paginas Astro tocadas.
- Sin migraciones de datos ni contenido.

8. Regression risk
- Riesgo: medio.
- Vectores principales: IDs DOM rotos, listeners que dejan de encontrar elementos, eventos analytics perdidos, cambios visuales involuntarios en mobile.
- Mitigacion: preservar IDs, smoke manual/browser en rutas tocadas, build + URL checks + tests focalizados.

## Definition of Done

- [x] Top 3 calculadoras reducidas materialmente, idealmente <800 LOC cada una o con excepcion documentada para scripts inline.
- [x] Al menos 3 componentes compartidos existen en `src/components/calculator/`.
- [x] `jscpd` baja a <0.5% o quedan clones aceptados con decision documentada.
- [x] `pnpm run check` pasa.
- [x] `pnpm run build` pasa.
- [x] `pnpm run check:routes` pasa sin removals.
- [x] `pnpm run check:rss` pasa sin removals.
- [x] Tests focalizados pasan.
- [x] `docs/TECH_DEBT_BACKLOG.md` y `docs/backlog/README.md` quedan actualizados con cierre, evidencia, riesgo y rollback.

## Cierre

- 2026-05-20: Plan ejecutado y reconciliado con `docs/TECH_DEBT_BACKLOG.md`. `TD-0063` y `TD-0069` quedaron cerrados: 5 componentes compartidos creados en `src/components/calculator/`, 15 calculadoras refactorizadas, aproximadamente 760 lineas removidas de paginas y duplicacion de markup reducida de 0.84% a 0.29%.
- 2026-07-07: Reconciliacion documental. El indice `docs/backlog/README.md` y `docs/TECH_DEBT_BACKLOG.md` ya registraban el plan como completado; se actualiza este artifact para eliminar el desfase de estado. No se aplican cambios de calculadoras, formulas, rutas, RSS ni frontmatter.

## Competitive Adaptation Appendix

- benchmarkSet: no aplica.
- patternHypothesis: no aplica.
- localDelta: mejora interna de mantenibilidad; no crea superficie visible nueva.
- nonCopyBoundaries: no aplica.
- ownerTarget: calculadoras existentes; no hay owner editorial nuevo.
- successSignal: menos LOC/duplicacion con rutas, formulas y resultados preservados.
