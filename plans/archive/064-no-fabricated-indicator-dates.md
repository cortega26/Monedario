# Plan 064: No fabricar fecha "hoy" para indicadores sin fecha en el snapshot económico

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- workers/economic-snapshot-refresh/src/buildSnapshot.ts tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: correctness (frescura de datos — YMYL)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

Cuando un indicador llega del upstream **sin fecha** (p. ej. mindicador
devuelve valor pero no `fecha`, o el override SII falla), `buildSnapshot`
fabrica `indicatorUpdatedAt.<indicator> = <hoy>` vía los fallbacks `todayIso`/
`lastUpdated`. El gate de frescura UTM (recién endurecido,
`check-economic-snapshot-freshness.mjs:86-101`) compara `indicatorUpdatedAt.utm`
contra el mes corriente: con la fecha fabricada, `utmMonth === currentMonth`
y **el gate pasa** sobre un valor que puede ser stale — exactamente el fallo
que el gate fue construido para detectar. Los badges de frescura del sitio
("actualizado hoy") también mienten. El fix: cuando la fecha de un indicador
falte o sea inválida, **omitir** `indicatorUpdatedAt.<indicator>` para que el
gate falle ruidosamente (el gate ya errorea cuando falta `indicatorUpdatedAt.utm`).

## Estado actual

- `workers/economic-snapshot-refresh/src/buildSnapshot.ts:102-107`:
```ts
function toIsoDate(value: string | undefined, fallback: string): string {
  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }
  return fallback;
}
```
- `:213-241`:
```ts
  const lastUpdated = getLatestIsoDate(
    [payload?.fecha, rawDates.uf, rawDates.utm, rawDates.uta, rawDates.ipc, rawDates.tmc, rawDates.dolar],
    todayIso
  );
  ...
  const indicatorUpdatedAt: EconomicSnapshot["indicatorUpdatedAt"] = {
    uf: toIsoDate(rawDates.uf, lastUpdated),
    utm: toIsoDate(rawDates.utm, lastUpdated),
    uta: toIsoDate(rawDates.uta, lastUpdated),
  };
```
- El tipo `EconomicSnapshot` permite `uta`/`ipc`/etc. opcionales
  (`indicatorUpdatedAt.uta?: string`, ver provider `EconomicParameterProvider.ts:34,161`),
  y `check-economic-snapshot-freshness.mjs:88-90` ya errorea cuando
  `indicatorUpdatedAt.utm` falta o no parsea.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests del worker | `pnpm exec vitest run tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts` | todos pasan |
| Typecheck worker | `npx tsc --noEmit -p workers/economic-snapshot-refresh/tsconfig.json` | exit 0 |
| Suite completa | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts`
- `tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts`

**Fuera de alcance** (NO tocar):
- `src/utils/economicFreshness.ts` y `check-economic-snapshot-freshness.mjs` (el plan 063)
- `lastUpdated` global (sí debe seguir cayendo a `todayIso` — es la fecha del snapshot, distinto de las fechas por indicador)
- El provider y las páginas (ya manejan campos opcionales)

## Git workflow

- Rama: `advisor/064-no-fabricated-indicator-dates`
- Commit: `fix(editorial): omitir fecha por indicador cuando el upstream no la entrega (fresco=real)`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: `toIsoDate` sin fallback por indicador

Cambia la construcción de `indicatorUpdatedAt` para que solo incluya fechas
reales. Reemplaza el bloque `:237-241` por:
```ts
  const indicatorUpdatedAt: EconomicSnapshot["indicatorUpdatedAt"] = {};
  for (const [key, value] of Object.entries(rawDates) as Array<[keyof typeof rawDates, string | undefined]>) {
    const date = toRealIsoDate(value);
    if (date) indicatorUpdatedAt[key] = date;
  }
```
con un helper nuevo:
```ts
// Fecha real observada del upstream; undefined si falta o es inválida.
// A diferencia de toIsoDate, NUNCA fabrica "hoy": un indicador sin fecha debe
// hacer fallar los gates de frescura, no pasar con una fecha inventada.
function toRealIsoDate(value: string | undefined): string | undefined {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return undefined;
}
```
Mantén `toIsoDate`/`getLatestIsoDate` intactos para `lastUpdated` (la fecha
global del snapshot sí puede ser hoy).

**Verificar**: `npx tsc --noEmit -p workers/economic-snapshot-refresh/tsconfig.json` → exit 0.
`grep -n "toRealIsoDate" workers/economic-snapshot-refresh/src/buildSnapshot.ts` → definido y usado.

### Paso 2: Revisar los consumidores del campo

Verifica que el provider y las páginas tratan `indicatorUpdatedAt.utm` opcional:
`grep -n "indicatorUpdatedAt" src/infrastructure/economic/EconomicParameterProvider.ts`
→ el provider usa `indicatorUpdatedAt?.uta ?? lastUpdated` y similar (líneas
~161, ~251): los campos opcionales ya tienen fallback. Si algún consumidor
asume el campo presente para `uf`/`utm` (los obligatorios del type), NO lo
cambies — anótalo en el reporte final (los campos `uf`/`utm` siguen siendo
obligatorios en el type y con el flujo normal siempre tienen fecha real).

**Verificar**: `pnpm exec vitest run tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts` → todos pasan.

### Paso 3: Tests nuevos

En `tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts` (patrón de
deps inyectadas):

1. **Fecha fabricada se omite**: payload con `utm` valor pero sin `fecha` (y
   sin override) → el snapshot resultante NO tiene `indicatorUpdatedAt.utm`.
2. **Fechas reales se conservan**: payload normal con `fecha` en uf/utm → los
   campos se escriben tal cual (regresión del happy path).
3. **`lastUpdated` global sigue cayendo a hoy**: payload sin fechas en ningún
   indicador → `snapshot.lastUpdated` es la fecha de hoy (comportamiento
   intencional que NO cambia).

**Verificar**: `pnpm exec vitest run tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts` → todos pasan.

### Paso 4: Gates finales

**Verificar**:
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `git status` → solo los 2 archivos en alcance

## Test plan

- Tests nuevos (Paso 3) modelados sobre `buildSnapshot.test.ts`.
- Casos: fecha faltante omitida; happy path intacto; `lastUpdated` global con fallback a hoy.

## Done criteria

- [ ] `toRealIsoDate` definido y `indicatorUpdatedAt` construido solo con fechas reales
- [ ] `grep -n "indicatorUpdatedAt.utm = toIsoDate" ...` sin matches del patrón viejo
- [ ] 3 tests nuevos pasando
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Algún consumidor de `indicatorUpdatedAt.uf`/`.utm` asume presencia (type
  error o crash en runtime) — NO lo "arregles" cambiando el consumidor sin
  reportar: es un cambio de contrato.
- El snapshot actual en el repo tiene `indicatorUpdatedAt.utm` fabricado (fecha
  == fecha de hoy de un día hábil sin publicar) — el próximo refresh del worker
  lo corregirá solo; no edites el snapshot a mano.
- El test 1 no reproduce la omisión (el payload con `fecha` viene del override
  aunque el upstream no lo dé) — ajusta el fixture para forzar el camino sin fecha.

## Maintenance notes

- La regla: **frescura = fecha real observada**. Cualquier valor sin fecha es
  un incidente de pipeline que debe verse en CI, no un badge "hoy".
- Cuando se integren nuevas fuentes (SII/INE/BCCh), validar que entreguen
  fecha; si no, este mecanismo los expone automáticamente.
- En review: verificar que `lastUpdated` global conserva su fallback a hoy
  (cambio NO autorizado) y que `ipc`/`tmc`/`dolar`/`uta` opcionales siguen
  opcionales.
