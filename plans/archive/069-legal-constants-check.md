# Plan 069: Check de consistencia de constantes legales espejadas (IMM, topes AFC/previsional)

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- src/domain/economic/immConstants.ts scripts/refresh-economic-snapshot.mjs workers/economic-snapshot-refresh/src/buildSnapshot.ts src/infrastructure/economic/EconomicParameterProvider.ts src/application/use-cases/CalculateMonthlyPayrollBase.ts`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt (constantes legales)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

El IMM ($553.553) vive en **3 bundles** con comentarios "keep in sync" a mano:
`src/domain/economic/immConstants.ts` (app runtime), 
`workers/economic-snapshot-refresh/src/buildSnapshot.ts:7-8` (worker) y
`scripts/refresh-economic-snapshot.mjs:35-37` (script Node). El tope AFC
(135.2 UF) vive en 4 archivos. El próximo reajuste legal exige editar 3-4
archivos en lockstep; si uno se omite, un bundle sirve una cifra legal vieja
sin que ningún gate lo detecte (`check:economic-source-consistency` valida
emisores, no valores). El refactor a fuente única (JSON compartido) es MED
riesgo (worker con bundle separado); la **verificación mecánica** de la
consistencia es barata y cierra el riesgo de drift hoy. Este plan entrega el
check; el refactor a fuente única queda como decisión del operador.

## Estado actual

- `src/domain/economic/immConstants.ts:16-23`:
```ts
 * NOTE: two generators keep their own mirrors for runtime reasons and must be
 * updated in lockstep when a new ley reajusta el IMM:
 *   - scripts/refresh-economic-snapshot.mjs (Node script, cannot import .ts)
 *   - workers/economic-snapshot-refresh/src/buildSnapshot.ts (separate Worker bundle)
```
  `export const DEFAULT_IMM = 553_553;` / `DEFAULT_IMM_EFFECTIVE_DATE = "2026-05-01";`
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts:7-9`:
```ts
// Mirror of src/domain/economic/immConstants.ts DEFAULT_IMM (separate Worker bundle). Keep in sync.
const DEFAULT_IMM = 553_553;
const DEFAULT_IMM_EFFECTIVE_DATE = "2026-05-01";
```
- `scripts/refresh-economic-snapshot.mjs:35-37`: mismo espejo.
- Topes: `buildSnapshot.ts:1-2` (`DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF = 135.2`,
  `DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90`),
  `scripts/refresh-economic-snapshot.mjs:28-29`,
  `src/infrastructure/economic/EconomicParameterProvider.ts:75` (135.2),
  `src/application/use-cases/CalculateMonthlyPayrollBase.ts:48`.
- `scripts/check-economic-source-consistency.mjs` existe (valida emisores/URLs).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Check nuevo | `node scripts/check-legal-constants.mjs` | exit 0 (constantes consistentes) |
| Suite completa | `pnpm test` | todos pasan |
| Gate existente | `node scripts/check-economic-source-consistency.mjs` | exit 0 (regresión) |

## Alcance

**En alcance**:
- `scripts/check-legal-constants.mjs` (nuevo)
- `tests/scripts/check-legal-constants.test.ts` (nuevo)
- `package.json` (script `check:legal-constants` + inclusión en `check` y/o en CI)
- `.github/workflows/ci.yml` (solo si se decide sumar al job lint-and-test — ver Paso 4)

**Fuera de alcance** (NO tocar):
- Refactor a fuente única (compuerta del operador — mencionado en Maintenance)
- Los valores de las constantes (ninguno cambia en este plan)
- `check-economic-source-consistency.mjs`

## Git workflow

- Rama: `advisor/069-legal-constants-check`
- Commit: `feat(ci): verificar consistencia de constantes legales espejadas (IMM, topes)`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Inventariar los espejos exactos

Con grep, enumera TODOS los sitios de las 3 constantes:
**Verificar**:
- `grep -rn "553_553\|DEFAULT_IMM" src/ workers/ scripts/` → lista los espejos.
- `grep -rn "135\.2\|TAXABLE_CAP_UF" src/ workers/ scripts/` → lista los topes.
Anota el inventario real (puede diferir en detalle de lo citado arriba — usa el
inventario real como base del check).

### Paso 2: Escribir el check

`scripts/check-legal-constants.mjs` (estilo de los otros `check-*.mjs`:
root resolution con `fileURLToPath`, `console.error` + `process.exit(1)` con
mensaje `file:rule` — ver `check-no-postid-urls.mjs` como ejemplar de estilo):

1. **IMM**: parsea `DEFAULT_IMM = 553_553` de los 3 archivos (regex sobre el
   fuente; en `immConstants.ts` es `export const`). Todos deben coincidir.
2. **IMM effective date**: `DEFAULT_IMM_EFFECTIVE_DATE` de los 3 archivos.
3. **Topes AFC/previsional**: los valores `135.2`/`90` (o el nombre de
   constante real usado en cada sitio) de los 4 archivos.
4. Al primer desajuste: imprime `check-legal-constants: mismatch <constante>
   <archivo>:<valor esperado> vs <archivo>:<valor actual>` y exit 1.

Estructura: un arreglo declarativo `[{ constant: "DEFAULT_IMM", files: [...], pattern: /DEFAULT_IMM\s*=\s*([\d_]+)/ }]`
para que agregar una constante futura sea una línea.

**Verificar**: `node scripts/check-legal-constants.mjs` → exit 0 y sin output (repo consistente).

### Paso 3: Tests del check

`tests/scripts/check-legal-constants.test.ts` (patrón spawn+fixtures de
`check-obs01-freeze.test.ts`):
1. Archivos consistentes → exit 0.
2. Un espejo con valor distinto (p. ej. IMM 553_554) → exit 1 y mensaje con el nombre de la constante.
3. Falta un archivo → exit 1 (el check debe fallar si no encuentra un espejo esperado — no pasar en silencio).

**Verificar**: `pnpm exec vitest run tests/scripts/check-legal-constants.test.ts` → todos pasan.

### Paso 4: Cablear el gate

- `package.json`: agrega `"check:legal-constants": "node scripts/check-legal-constants.mjs"`.
- Agrégalo a la cadena del script `check` (package.json:15) en la posición de
  los checks de consistencia económica, y como paso en `ci.yml` job
  `lint-and-test` (junto a `check:context`/`check:policy-registry` — cabe en el
  presupuesto de 5 min: es un parse de 7 archivos).

**Verificar**:
- `pnpm run check:legal-constants` → exit 0.
- `grep -n "check:legal-constants" package.json .github/workflows/ci.yml` → presente en ambos.
- `pnpm run check` → exit 0 (o solo fallos preexistentes NO relacionados — si los hay, repórtalos).

### Paso 5: Gates finales

**Verificar**:
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `git status` → solo archivos en alcance

## Test plan

- 3 casos (consistente / desajuste / archivo faltante) con fixtures en temp dir
  (el check debe aceptar `LEGAL_CONSTANTS_ROOT` env o paths por argumento para
  testear — agrega ese soporte aditivo como en el plan 068, con default al repo).

## Done criteria

- [ ] `node scripts/check-legal-constants.mjs` exit 0 sobre el repo actual
- [ ] 3 tests pasando (incluido el desajuste que falla)
- [ ] `check:legal-constants` en `package.json` y en `ci.yml`
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- El inventario real de espejos difiere sustancialmente (constante con otro
  nombre/forma en algún sitio) — usa el inventario real y anota las
  discrepancias de nomenclatura en el reporte.
- Algún espejo usa una constante derivada (no un literal) que la regex no
  pueda validar — reporta el sitio; no fuerces la regex.
- El refactor a fuente única aparece como "obvio" durante el trabajo — NO lo
  hagas: es una compuerta del operador (cambia bundling del worker).

## Maintenance notes

- Cuando se reajuste el IMM/ley: editar los espejos + correr
  `pnpm run check:legal-constants`; el check debe pasar como parte del DoD.
- Refactor pendiente (decisión del operador): un `legal-constants.json`
  consumido por worker y script, con el check transformado en verificación de
  paridad build-time. El plan 060/063 tocan `buildSnapshot.ts` — si se
  ejecutan antes, los valores no cambian, el check sigue aplicando.
- En review: verificar que el check falla ruidosamente con mensajes
  `archivo:constante` (requisito de los lint scripts del repo según AGENTS.md §7).
