# Plan 073: Ampliar el gate de cobertura vitest a todo `src/` (con caracterización previa)

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- vitest.config.ts tests/ src/integrations src/utils src/contracts src/scripts`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S (el gate) + M (caracterización de los archivos bajo umbral)
- **Risk**: MED
- **Depends on**: 067, 068, 071, 072 (para que los archivos nuevos de esa zona ya tengan tests; opcional pero recomendado)
- **Category**: tests (infraestructura de verificación)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

El gate de cobertura (`vitest.config.ts:17-24`) incluye solo
`src/application/**` y `src/domain/**` — el código que más cambió en el último
mes (integrations post-build, `src/utils/indicadores.ts`, el contrato
`analytics-events.ts`, `src/scripts/analytics.ts`) está **estructuralmente
fuera del radar**: "cobertura OK" en CI no significa nada para esas capas. Este
plan amplía el alcance a `src/**/*.ts` y agrega tests de caracterización a los
archivos que caigan bajo el umbral de 80% líneas, SIN relajar el umbral.

## Estado actual

- `vitest.config.ts:17-24`:
```ts
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "coverage",
      include: ["src/application/**/*.ts", "src/domain/**/*.ts"],
      thresholds: {
        lines: 80,
      },
    },
```
- `pnpm run test:coverage` (package.json:17) corre vitest con `--coverage`.
- Candidatos conocidos bajo umbral hoy (medir en Paso 1):
  `src/integrations/*.ts` (csp-hashes/collectHashes sin tests, inline-link-spacing
  parcial, sw-version), `src/utils/indicadores.ts`, `src/contracts/analytics-events.ts`,
  `src/scripts/analytics.ts` (parcial), `src/utils/economicFreshness.ts` (parcial).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Medición actual | `pnpm run test:coverage` | salida con % por archivo (puede tardar ~1-2 min) |
| Tests específicos | `pnpm exec vitest run tests/<archivo>` | todos pasan |
| Suite completa | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `vitest.config.ts` (solo `coverage.include`)
- `src/integrations/*` y `src/utils/*` y `src/contracts/*` (tests de caracterización SOLO donde el Paso 1 muestre <80%)
- `tests/` (archivos de test nuevos)
- El script `test:coverage` de `package.json` (sin cambios de umbral)

**Fuera de alcance** (NO tocar):
- `src/domain/**` y `src/application/**` (ya cubiertos)
- El umbral (80% líneas) — NO se relaja
- `src/pages/**` y `src/components/**` (los `.astro` no entran en vitest de Node)
- `workers/**` (bundles separados con su propio typecheck; el plan 072 cubre el collector)

## Git workflow

- Rama: `advisor/073-coverage-widen`
- Commit: `test(ci): ampliar gate de cobertura a src/** con caracterización bajo umbral`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Medir el estado actual

**Verificar**: `pnpm run test:coverage` → exit 0 con el gate actual. Guarda la
salida (o el `coverage/coverage-summary.json`) — la comparación del Paso 4 se
hace contra esta línea base.

### Paso 2: Ampliar el include

En `vitest.config.ts`, cambia:
```ts
      include: ["src/application/**/*.ts", "src/domain/**/*.ts"],
```
por:
```ts
      include: ["src/**/*.ts"],
```
**Verificar**: `pnpm run test:coverage` → el run FALLA (esperado: hay archivos
bajo 80% — anota la lista completa de archivos <80% de la salida). Si por
casualidad pasa, salta al Paso 5 (el gate ya estaba limpio) y anótalo.

### Paso 3: Caracterización de los archivos bajo umbral

Para CADA archivo de la lista del Paso 2 (esperado: 3-6 archivos; si son >8,
STOP y reporta), agrega tests de comportamiento en la ruta correspondiente de
`tests/`:

- `src/integrations/csp-hashes.ts` → `tests/integration/csp-hashes.test.ts`
  (extender el existente): casos para `isExecutable` (JSON-LD excluido,
  ejecutable incluido, vacío), `sha256base64` (determinismo), `collectHashes`
  contra un HTML fixture en temp dir (script con contenido → hash presente;
  sin scripts → set vacío).
- `src/integrations/inline-link-spacing.ts` → el archivo de tests ya existe;
  solo agregar casos si la cobertura lo pide (cubre `normalizeInlineLinkSpacing`
  — el hook `inlineLinkSpacingIntegration` puede quedar bajo umbral: si es así,
  agrega un test que invoque el hook con un `dir` fixture y un `logger` stub
  y verifique que escribe/omite archivos).
- `src/integrations/sw-version.ts` → test simple: hook con dir fixture →
  `dist/sw.js` con el placeholder reemplazado.
- `src/utils/indicadores.ts` → cubierto por el plan 071; si se ejecutó antes,
  verificar que alcanza 80%; si no, cubre `fmtFecha` y `getIndicadores` aquí.
- `src/contracts/analytics-events.ts` → tests de los validadores/constantes
  (mirar qué exports tiene y cubrir los no triviales: allowlist, `SAFE_TOKEN_RE`,
  `sanitizeAnalyticsEvent`, `isTransmissibleEvent`).
- `src/scripts/analytics.ts` → si está bajo umbral, verificar qué funciones
  puras exporta (`getAnalyticsEventNameForCta`, `getReachedScrollMilestones`,
  etc.) y cubrir las no cubiertas (el runtime del DOM no — solo las puras).

Cada test sigue el patrón de los tests existentes de su zona (fixtures en
temp dir con `mkdtempSync`, estilo de `tests/integration/csp-hashes.test.ts`).

**Verificar**: `pnpm run test:coverage` → exit 0 (gate ampliado verde) o una
lista corta residual que reportes en el reporte final con el % exacto.

### Paso 4: Gates finales

**Verificar**:
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `pnpm run lint` → exit 0
- `git status` → solo archivos en alcance

## Test plan

- Tests de caracterización por archivo bajo umbral (Paso 3), con la línea
  base del Paso 1 como referencia de "lo que no se debe romper".
- La suite completa debe seguir verde.

## Done criteria

- [ ] `coverage.include = ["src/**/*.ts"]`
- [ ] `pnpm run test:coverage` exit 0 (gate verde con el alcance ampliado)
- [ ] Ningún archivo de `src/integrations/` ni `src/utils/indicadores.ts` ni `src/contracts/analytics-events.ts` bajo 80% (salvo lista residual reportada)
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- La lista de archivos <80% del Paso 2 supera los 8 (el esfuerzo de
  caracterización se desborda — reporta la lista, el operador decide orden).
- Algún archivo bajo umbral tiene lógica de DOM/document que no es testeable
  en Node puro (p. ej. `src/scripts/theme.ts`) — exclúyelo del análisis,
  anótalo, y NO intentes mockear el DOM entero.
- Para llegar a 80% necesitas "arreglar" lógica productiva (bug real
  descubierto al escribir tests): reporta el bug con el diff — los tests
  reflejan el comportamiento real, el fix es otro plan.
- El umbral parece inalcanzable sin relajarlo — relajar el umbral NO es una
  opción en este plan: reporta.

## Maintenance notes

- El gate ampliado es la red para las integraciones post-build (planes 062,
  065, 081): un cambio futuro en `csp-hashes` o `inline-link-spacing` ahora
  quiebra CI si no trae tests.
- `src/scripts/*.ts` (runtime del cliente) es parcial por diseño (código de
  DOM): si molesta el % global, usar `exclude` selectivo documentado en vez de
  bajar el umbral.
- En review: verificar que los tests de caracterización no son tautológicos
  (asserts sobre strings exactos o comportamientos, no `expect(true)`).
