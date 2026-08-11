# Plan 082: Implementar los conjuntos de NextSteps contextuales (diseño 056) — paso 1, sin post-result

> **Instrucciones para el ejecutor**: plan de implementación derivado del spike
> 056 (`docs/backlog/DECISION-PATHS-AFC-PREPAGO-CREDITO-2026-08-02.md`, §2 y §5,
> decisiones del operador 2026-08-11). **Alcance acotado al paso 1**: los sets de
> NextSteps por página. El patrón post-resultado (`UtmPostResultActions`
> parametrizado) y la alerta de interés quedan **fuera de este plan** — se
> re-evalúan solo si 2 semanas comparables del registry cruzan los umbrales.
>
> **Decisiones del operador que este plan honra** (sesión 2026-08-11):
> - Copy aprobado de los 3 ítems (tabla abajo).
> - NO enlace externo `tramite-afc` en NextSteps (afc.cl sigue en la página, no
>   en el componente).
> - NO crear superficie de reempleo (freeze de URLs vigente hasta 2026-11-02).
> - NO despliegue del bloque de interés/alerta en esta iteración.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat HEAD -- \
>   src/config/calculatorPortfolio.ts \
>   src/pages/calculadoras/seguro-cesantia.astro \
>   src/pages/calculadoras/prepago-credito.astro \
>   src/components/NextSteps.astro \
>   tests/integration/homepage-content.test.ts
> ```
> El ejecutor parte de `main` limpio (2026-08-11, `f2c64ce7`). Si algo de esto
> cambió respecto de lo citado, revalida antes de escribir. Mismatch = STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW (solo datos de configuración + copy; sin cambio de componentes ni rutas)
- **Depends on**: spike 056 (DONE, entregable `docs/backlog/DECISION-PATHS-AFC-PREPAGO-CREDITO-2026-08-02.md`)
- **Category**: growth (utility-led, piloto de next-steps)
- **Planned at**: 2026-08-11

## Por qué importa

El memo de viabilidad estratégica (2026-08-02) exige "un CTA contextual, no una
parrilla genérica" como motor de crecimiento, con recorridos explícitos para
AFC/cesantía y crédito/prepago. El spike 056 mapeó los recorridos y diseñó los
sets de 3 ítems por página con `next_step_id` verificados contra `SAFE_TOKEN`.
Este plan aterriza el **paso 1**: los ítems en `calculatorPortfolio.ts`
(`related`), que alimentan `calculatorRelatedItems` → `calculatorNextStepItems`
→ `NextSteps` en cada página. Es el cambio más barato y reversible del diseño;
habilita la medición de `next_step_shown/click` (umbral ≥8% del registry) sobre
estas superficies sin tocar componentes.

## Estado actual (verificado 2026-08-11)

- `src/config/calculatorPortfolio.ts`:
  - `seguro-cesantia` (líneas ~216-222): `related` = 1 ítem (`sueldo-liquido`).
    Con <2 ítems, `calculatorNextStepItems` añade el fallback "Ver todas las
    calculadoras" (`seguro-cesantia.astro:46-53`).
  - `prepago-credito` (líneas ~368-382): `related` = 2 ítems (`credito-consumo`,
    `simulador-renegociacion`). Ya muestra 2 sin fallback.
- `NextSteps.astro` renderiza hasta 3 ítems (`visibleItems.slice(0, 3)`, línea
  55) excluyendo la URL actual; CTA por defecto según tipo de ruta.
- Ambas páginas emiten `calculator:result` (seguro-cesantia.astro:812,
  prepago-credito.astro:724) — relevante solo para el paso 2 (post-result),
  fuera de alcance.
- `next_step_id` existentes en el repo: `convert-uf`, `adjust-inflation` (solo
  en `UtmPostResultActions.astro`). Los propuestos no colisionan.
- Tests que tocan `related`: `tests/integration/homepage-content.test.ts`
  (usa slugs de calculadoras, no aserta `related`); `related-posts.test.ts` y
  `contextual-article-sections.test.ts` (posts, no calculadoras). No hay test
  que aserte el contenido de `calculatorRelatedItems`.

## Copy aprobado por el operador (2026-08-11)

Ítems nuevos a añadir a `related`:

| Página | href | label | when (descripción del CTA) |
|---|---|---|---|
| prepago-credito | `/guias/ahorro-e-inversion/` | "Ahorro: qué hago con la cuota liberada" | "Dónde colocar el monto que dejas de pagar, según tu horizonte." |
| seguro-cesantia | `/calculadoras/finiquito-indemnizacion/` | "Calcular tu finiquito" | "Si ya terminó la relación laboral, revisa qué te corresponde por años de servicio." |
| seguro-cesantia | `/posts/seguro-cesantia-cuenta-individual-vs-fondo-solidario/` | "Cuenta individual vs. Fondo Solidario" | "Cuándo el FCS complementa tu CIC y qué requisitos exige." |

Notas de diseño:
- En `seguro-cesantia`, con 3 ítems (`sueldo-liquido` + los 2 nuevos) el
  fallback "Ver todas las calculadoras" deja de aplicarse (condición `<2`).
- En `prepago-credito`, `ahorro-meta` entra como 3º ítem; el orden de
  `related` es el orden de render (recorrido: costo → prepago → ahorro →
  renegociación; el ítem `ahorro-meta` debe ir **entre** `credito-consumo` y
  `simulador-renegociacion` para respetar el recorrido del memo).
- No se usa `next_step_id` explícito en `NextSteps` (el componente no lo
  emite; los eventos `next_step_shown/click` los emite el patrón post-result,
  paso 2). La medición de esta iteración usa `data-analytics-cta="next-step"`
  ya existente en `NextSteps.astro:96` + el `location="calculator_next_steps"`
  ya cableado en ambas páginas.

## Scope

**In scope** (únicos archivos que modificas):
- `src/config/calculatorPortfolio.ts` — bloques `related` de `seguro-cesantia`
  y `prepago-credito` (añadir los 3 ítems aprobados).
- `tests/integration/homepage-content.test.ts` — aserciones nuevas del
  contenido de `related` (ver Test plan).
- `plans/README.md` — fila de estado de este plan.

**Out of scope** (NO tocar):
- `src/components/NextSteps.astro`, `UtmPostResultActions.astro` — sin cambios.
- `src/pages/calculadoras/*.astro` — sin cambios (los ítems fluyen del config).
- Post-result parametrizado, alerta de interés, enlace externo, reempleo —
  decisiones diferidas del diseño 056.
- Cualquier URL nueva o ruta — `check:routes`, `check:rss` y el freeze de
  indexables no deben verse afectados (no hay cambios de ruta).

## Comandos de verificación

| Propósito | Comando | Esperado |
|---|---|---|
| Drift check | ver encabezado | vacío |
| Tests enfocados | `pnpm exec vitest run tests/integration/homepage-content.test.ts` | todos pasan |
| Suite completa | `pnpm run test` | todos pasan |
| Type check | `npx astro check` | 0 errores |
| Lint/format de archivos tocados | `pnpm exec eslint src/config/calculatorPortfolio.ts tests/integration/homepage-content.test.ts` y `pnpm exec prettier --check` sobre ambos | exit 0 |
| Gates de rutas | `pnpm run check:routes` | sin diffs (no se tocan rutas) |
| Interlinks | `pnpm exec node scripts/audit-calculator-interlinks.mjs` | sin under-linked nuevos (seguro-cesantia y prepago ya están sobre el floor) |

## Steps

### Step 1: Drift check y lectura de estado

Corre el drift check del encabezado. Confirma que `related` de ambas
calculadoras sigue como en "Estado actual". Si `calculatorPortfolio.ts` cambió
desde la cita (líneas ~216 y ~368), revalida las posiciones exactas.

**Verify**: drift vacío o desviación anotada antes de tocar.

### Step 2: Añadir los ítems a `calculatorPortfolio.ts`

1. `seguro-cesantia` (bloque `related` actual con 1 ítem):
   - Añadir `finiquito-indemnizacion` con el copy aprobado.
   - Añadir `seguro-cesantia-cuenta-individual-vs-fondo-solidario` con el copy
     aprobado.
   - Orden del array: `sueldo-liquido` (existente), `finiquito-indemnizacion`,
     `seguro-cesantia-cuenta-individual-vs-fondo-solidario`.
2. `prepago-credito` (bloque `related` actual con 2 ítems):
   - Insertar `ahorro-e-inversion` (guía) **entre** `credito-consumo` y
     `simulador-renegociacion` con el copy aprobado.
   - Orden final: `credito-consumo`, `ahorro-e-inversion`,
     `simulador-renegociacion`.

**Verify**: `git diff` muestra solo adiciones en los 2 bloques `related`;
ningún otro campo del portfolio cambiado.

### Step 3: Tests de la nueva configuración

En `tests/integration/homepage-content.test.ts` (o un test de integración
existente de portfolio si aplica), añadir aserciones que:
- `seguro-cesantia` tiene 3 ítems de `related` con los hrefs
  `/calculadoras/sueldo-liquido/`, `/calculadoras/finiquito-indemnizacion/` y
  `/posts/seguro-cesantia-cuenta-individual-vs-fondo-solidario/`.
- `prepago-credito` tiene 3 ítems con `/calculadoras/credito-consumo/`,
  `/guias/ahorro-e-inversion/` y `/calculadoras/simulador-renegociacion/`, en
  ese orden.
- El ítem de guía (`/guias/ahorro-e-inversion/`) tiene CTA "Explorar sección →"
  (defaultCta de NextSteps para `/guias/`).

**Verify**: tests nuevos pasan y no son vacíos (aserciones sobre hrefs y orden
reales, no solo conteo).

### Step 4: Verificación completa y cierre

Corre los comandos de verificación. Actualiza la fila de este plan en
`plans/README.md` (IN PROGRESS → estado final). NO push ni PR salvo que el
operador lo pida.

**Verify**: suite completa + astro check + eslint/prettier + `check:routes`
sin diffs; `git status` solo con los archivos en scope.

## Test plan

- Nuevos: aserciones de `related` en `homepage-content.test.ts` (Step 3).
- Regresión: suite completa `pnpm run test` (no debe romperse ningún test que
  asuma el estado viejo — verificable: `calculatorRelatedItems` no está
  asertado hoy).
- Gates: `check:routes` sin diffs (no se tocan rutas); `check:rss` no aplica
  (sin cambios de contenido ni rutas); freeze indexable intacto.

## Done criteria

Todas deben cumplirse:

- [ ] `calculatorPortfolio.ts`: 3 ítems en `related` de `seguro-cesantia` y 3
  en `prepago-credito`, con el copy aprobado y el orden del recorrido del memo.
- [ ] Tests nuevos en `homepage-content.test.ts` (hrefs + orden + CTA de guía).
- [ ] `pnpm run test` completo en verde.
- [ ] `astro check` 0 errores; eslint/prettier limpios en archivos tocados.
- [ ] `check:routes` sin diffs; ninguna URL nueva.
- [ ] `git status` solo con los archivos en scope + `plans/README.md`.
- [ ] Fila de este plan actualizada en `plans/README.md`.

## STOP conditions

Detente y reporta (no improvises) si:

- `calculatorPortfolio.ts` cambió la forma de `related` (tipo
  `CalculatorAlternative`) respecto de lo citado — revalida antes de tocar.
- Alguna de las 3 superficies destino no existe (guía `ahorro-e-inversion`,
  calculadora `finiquito-indemnizacion`, post
  `seguro-cesantia-cuenta-individual-vs-fondo-solidario`) — verificar
  existencia antes de enlazar.
- Un test existente asume el estado viejo de `related` (2 ítems en prepago,
  1 en cesantía) y rompe — reporta el conflicto, no lo silencies.
- El copy aprobado contradice un gate del repo (`check:reader-facing-copy` /
  `check:dialect`) — ajustar solo si es por forma (acentos/tono) y anotarlo;
  no cambiar el sentido aprobado.

## Notas de mantenimiento

- La medición de esta iteración es `data-analytics-cta="next-step"` +
  `location="calculator_next_steps"` (ya instrumentado). Los eventos
  `next_step_shown/click` del contrato v2 solo los emite el patrón post-result
  (paso 2, fuera de alcance).
- **Re-evaluación del paso 2** (post-result parametrizado): solo si 2 semanas
  comparables del registry muestran `next_step_click / next_step_shown ≥ 8%`
  (registry línea 10) o complete/start sostenido ≥65% en prepago (línea 8),
  con integridad ≥95% (línea 15). Registrar la lectura semanal en
  `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`.
- El hueco de reempleo (AFC) y la alerta de interés quedan diferidos por
  decisión del operador (freeze de URLs hasta 2026-11-02).
- Cierre atómico: al pasar a DONE y ser mergeado, mover este archivo a
  `plans/archive/` y actualizar ambos índices (política del repo).
