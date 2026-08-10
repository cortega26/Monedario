# Plan 063: Calendario chileno (America/Santiago) en el fetcher SII y los gates de frescura

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- workers/economic-snapshot-refresh/src/sources/siiUtm.ts src/utils/economicFreshness.ts scripts/check-economic-snapshot-freshness.mjs tests/utils/economicFreshness.test.ts tests/workers/economic-snapshot-refresh/siiUtm.test.ts`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (si se ejecuta tras el 060: `siiUtm.ts` solo suma, no rompe)
- **Category**: correctness (boundary de tiempo — YMYL)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

Chile (UTC-3/-4) decide mes y día por calendario local, pero tres sitios usan
UTC: `createSiiUtmFetcher` selecciona el mes de la página SII con
`getUTCMonth()`/`getUTCFullYear()`, y los gates de frescura
(`evaluateCriticalMonthlyFreshness` y `check-economic-snapshot-freshness.mjs`)
usan `toISOString().slice(0,7)` y `getUTCDate()`. En la frontera de mes (las
primeras 3-4h del mes UTC = todavía el mes anterior en Chile), el fetcher puede
adoptar el valor del mes siguiente que la página SII ya pre-publica (verificado
el 2026-08-10: la página ya listaba septiembre), y el gate puede declarar
"stale" hasta 4h antes de que termine la gracia de 7 días en Chile — un
hard-fail que bloquea builds dentro de una ventana que la política concede. El
patrón correcto ya existe en el repo: `calendarDateInTimeZone` en
`workers/analytics-collector/src/index.ts:147-165` (Intl con `America/Santiago`).

## Estado actual

- `workers/economic-snapshot-refresh/src/sources/siiUtm.ts:50-57`:
```ts
    const now = options.now?.() ?? new Date();
    const year = now.getUTCFullYear();
    const monthIndex = now.getUTCMonth();
```
- `src/utils/economicFreshness.ts:17-27`:
```ts
  const currentMonth = now.toISOString().slice(0, 7);
  const indicatorMonth = indicatorDate.slice(0, 7);
  ...
  if (now.getUTCDate() <= graceDays) {
```
- `scripts/check-economic-snapshot-freshness.mjs:86-101`: mismo patrón
  (`ref.toISOString().slice(0, 7)` y `ref.getUTCDate() > UTM_MONTH_BOUNDARY_GRACE_DAYS`).
- `tests/utils/economicFreshness.test.ts` existe (39 líneas, agregado en el delta).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests afectados | `pnpm exec vitest run tests/utils/economicFreshness.test.ts tests/workers/economic-snapshot-refresh` | todos pasan |
| Suite completa | `pnpm test` | todos pasan |
| Typecheck worker | `npx tsc --noEmit -p workers/economic-snapshot-refresh/tsconfig.json` | exit 0 |

## Alcance

**En alcance**:
- `workers/economic-snapshot-refresh/src/sources/siiUtm.ts`
- `src/utils/economicFreshness.ts`
- `scripts/check-economic-snapshot-freshness.mjs`
- `tests/utils/economicFreshness.test.ts` (+ `tests/workers/economic-snapshot-refresh/siiUtm.test.ts` si existe)

**Fuera de alcance** (NO tocar):
- `workers/analytics-collector` (su `calendarDateInTimeZone` es el patrón, no el objetivo)
- La semántica de la gracia (7 días, `UTM_MONTH_BOUNDARY_GRACE_DAYS`)
- `buildSnapshot.ts` (el plan 060 cubre la UTA)

## Git workflow

- Rama: `advisor/063-chile-calendar-tz`
- Commit: `fix(editorial): calendario America/Santiago en fetcher SII y gates de frescura UTM`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Helper de calendario local en `siiUtm.ts`

En `workers/economic-snapshot-refresh/src/sources/siiUtm.ts`, agrega:
```ts
export function calendarPartsInTz(now: Date, timeZone = "America/Santiago"): { year: number; monthIndex: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? "0");
  return { year: get("year"), monthIndex: get("month") - 1, day: get("day") };
}
```
Úsalo en `createSiiUtmFetcher`:
```ts
    const now = options.now?.() ?? new Date();
    const { year, monthIndex } = calendarPartsInTz(now);
```

**Verificar**: `npx tsc --noEmit -p workers/economic-snapshot-refresh/tsconfig.json` → exit 0.

### Paso 2: Frontera local en `economicFreshness.ts`

En `src/utils/economicFreshness.ts`, reemplaza `now.toISOString().slice(0, 7)`
por una derivación de mes local (reimplementa el helper aquí — este módulo es
Node-side y no puede importar el worker; mantenlo deps-free como está):
```ts
function chileMonthKey(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find(p => p.type === "year")?.value ?? "";
  const month = parts.find(p => p.type === "month")?.value ?? "";
  return `${year}-${month}`;
}
```
y usa `chileMonthKey(now)` en lugar de `currentMonth`, y el día local
(equivalente `Intl` con `day`) en lugar de `now.getUTCDate()`.

**Verificar**: `pnpm exec vitest run tests/utils/economicFreshness.test.ts` → todos pasan.

### Paso 3: Mismo cambio en el gate script

En `scripts/check-economic-snapshot-freshness.mjs:88-97`, reemplaza
`ref.toISOString().slice(0, 7)` y `ref.getUTCDate()` por el mismo cálculo
`Intl` con `America/Santiago` (helper local al script, sin importar `src/`).

**Verificar**: `node scripts/check-economic-snapshot-freshness.mjs` (sin args)
→ salida consistente con el estado del snapshot actual (exit 0 si está fresco;
si falla por otra razón, reporta la salida exacta).

### Paso 4: Tests de frontera

En `tests/utils/economicFreshness.test.ts`, agrega:

1. **Frontera de mes UTC pero no chilena**: `evaluateCriticalMonthlyFreshness(
   "2026-08-01", new Date("2026-09-01T00:30:00Z"), 7)` → en Chile (2026-08-31
   20:30) el indicador de agosto sigue en gracia: status `"grace"` (hoy con
   UTC devolvería `"stale"` porque `getUTCDate()=1 ≤ 7`... verifica la
   semántica: mes local agosto ≠ septiembre y día local 31 > 7 → "stale".
   Ajusta el caso a uno no-ambiguo: usa `new Date("2026-09-01T03:00:00Z")`
   → Chile aún 2026-08-31; con la gracia de 7 días, agosto se acepta → el
   test debe afirmar que el resultado NO es `"stale"` por mes futuro. Escribe
   el caso exacto que falle hoy y pase después del fix).
2. **Frontera donde el fix no cambia nada**: mediodía UTC del día 10 → mismo
   resultado antes/después (regresión).

**Verificar**: `pnpm exec vitest run tests/utils/economicFreshness.test.ts`
→ todos pasan, incluidos los nuevos.

### Paso 5: Gates finales

**Verificar**:
- `pnpm exec vitest run tests/workers/economic-snapshot-refresh/siiUtm.test.ts tests/utils/economicFreshness.test.ts` → todos pasan
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `git status` → solo archivos en alcance

## Test plan

- Tests nuevos en `economicFreshness.test.ts` (caso de frontera mes UTC vs mes
  chileno + caso de regresión de mediodía).
- Si `siiUtm.test.ts` fija `createSiiUtmFetcher` con `now` inyectado, agrega un
  caso: `now = new Date("2026-09-01T00:30:00Z")` → `monthIndex` 7 (agosto,
  Chile) en vez de 8.

## Done criteria

- [ ] `calendarPartsInTz` exportado y usado en `createSiiUtmFetcher`
- [ ] `economicFreshness.ts` y `check-economic-snapshot-freshness.mjs` usan `Intl` + `America/Santiago` para mes/día
- [ ] Tests de frontera nuevos pasando (fallan con el código viejo — verifica corriéndolos antes del fix)
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- El snapshot actual en `src/infrastructure/economic/economic-parameters.snapshot.json`
  tiene una fecha de UTM que cambia de veredicto con el fix (frescura) — reporta
  el caso en vez de ajustar el snapshot.
- El worker de analytics (`calendarDateInTimeZone`) usa una firma distinta a la
  descrita — es solo referencia, no lo copies literalmente si difiere.
- El caso de frontera del Paso 4 no falla con el código viejo (la semántica de
  gracia cambió) — redefine el caso con la semántica real y anótalo.

## Maintenance notes

- La regla de oro: **nunca** decidir mes/día por UTC en este repo — Chile vive
  3-4h atrás. Nuevos gates/fetchers deben copiar el patrón `Intl` +
  `America/Santiago`.
- Si algún día el sitio publica para otro país, el timezone debe venir de la
  config, no hardcodeado.
- En review: verificar que `economicFreshness.ts` sigue sin dependencias
  (importable desde cualquier bundle).
