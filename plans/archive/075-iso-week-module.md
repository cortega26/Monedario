# Plan 075: Consolidar la matemática ISO-week en un módulo compartido

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- scripts/audit-ctr-opportunities.mjs scripts/build-weekly-search-report.mjs tests/scripts/`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt (duplicación — datos semanales)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

El algoritmo Jan-4 de semana ISO está **triplicado**: 
`workers/analytics-collector/src/index.ts:394-436` (`dateToISOWeekUTC` +
`isoWeekToDateRangeUTC`, con corrección del jueves/ISO-year — el único que
maneja el caso año-límite en la dirección fecha→semana), 
`scripts/audit-ctr-opportunities.mjs:73-92` (`isoWeekWindow`) y 
`scripts/build-weekly-search-report.mjs:144-178` (`isoWeekToMonday`,
`weekLabelToDateRange`, `isoWeekWindow`, `dateToIsoWeek`). Los dos scripts
reimplementan la misma matemática con semántica de timezone ligeramente
distinta (audit-ctr usa UTC `toISOString().slice(0,10)`). Los artefactos
semanales (`2026-W*.json`, scorecards) son el dato más sensible del pipeline:
un bug de año-límite (W01/W52/W53) se corrige en 3 lugares o se queda en 2.
Este plan extrae el módulo para los dos scripts de `scripts/` (el worker queda
como referencia canónica con su variante TZ — ver "Maintenance notes").

## Estado actual

- `scripts/audit-ctr-opportunities.mjs:73-92`:
```js
function isoWeekWindow(week) {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) return null;
  const year = Number(match[1]);
  const weekNumber = Number(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const weekOneMonday = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
  const monday = new Date(weekOneMonday.getTime() + (weekNumber - 1) * 7 * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  return { from: monday.toISOString().slice(0, 10), to: sunday.toISOString().slice(0, 10) };
}
```
- `scripts/build-weekly-search-report.mjs:144-178`: `isoWeekToMonday(year, week)`,
  `weekLabelToDateRange(weekLabel)` (current/previous), `isoWeekWindow(weekLabel)`,
  `dateToIsoWeek(date)`.
- `scripts/lib/` existe (2 módulos compartidos; convención establecida).
- Tests existentes: `tests/scripts/build-weekly-search-report.test.ts` (531 líneas)
  y `audit-ctr-opportunities.test.ts` (159) — red de seguridad fuerte.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests de los scripts | `pnpm exec vitest run tests/scripts/audit-ctr-opportunities.test.ts tests/scripts/build-weekly-search-report.test.ts` | todos pasan |
| Tests del módulo nuevo | `pnpm exec vitest run tests/scripts/iso-week.test.ts` | todos pasan |
| Suite completa | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `scripts/lib/iso-week.mjs` (nuevo)
- `scripts/audit-ctr-opportunities.mjs` (importar el módulo)
- `scripts/build-weekly-search-report.mjs` (importar el módulo)
- `tests/scripts/iso-week.test.ts` (nuevo)

**Fuera de alcance** (NO tocar):
- `workers/analytics-collector/src/index.ts` (variante TZ canónica — no se duplica aquí; su test ya existe en schema.test.ts)
- La semántica de output (mismos nombres de campos, mismo formato `YYYY-MM-DD`)

## Git workflow

- Rama: `advisor/075-iso-week-module`
- Commit: `refactor(scripts): módulo compartido de semana ISO (Jan-4) para scripts semanales`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Crear el módulo

`scripts/lib/iso-week.mjs` con las funciones extraídas (firma y semántica
idénticas al comportamiento actual de los dos scripts):
```js
// Semana ISO (Jan-4) compartida por los scripts del pipeline semanal.
// La variante TZ del worker (workers/analytics-collector) es la canónica
// para fecha→semana con timezone; aquí solo label→rango y fecha→semana UTC.
export function isoWeekWindow(week) { /* idéntico al de audit-ctr */ }
export function weekLabelToDateRange(weekLabel) { /* idéntico al de build-weekly-search-report */ }
export function dateToIsoWeek(date) { /* idéntico al de build-weekly-search-report */ }
```
(no exportar helpers internos que solo un script usaba, si no se necesitan).

### Paso 2: Migrar los consumidores

- `scripts/audit-ctr-opportunities.mjs`: elimina la definición local de
  `isoWeekWindow` e importa desde `./lib/iso-week.mjs` (o `../lib/...` según
  la ruta relativa real).
- `scripts/build-weekly-search-report.mjs`: elimina las definiciones locales
  (`isoWeekToMonday`, `weekLabelToDateRange`, `isoWeekWindow`, `dateToIsoWeek`)
  e importa desde el módulo. Mantén `toIsoDateString` local si sigue usándose.

**Verificar**: `grep -n "function isoWeekWindow\|function weekLabelToDateRange\|function dateToIsoWeek" scripts/audit-ctr-opportunities.mjs scripts/build-weekly-search-report.mjs` → sin matches; `grep -n "iso-week" scripts/*.mjs` → imports presentes.

### Paso 3: Correr los tests existentes (comportamiento idéntico)

**Verificar**: `pnpm exec vitest run tests/scripts/audit-ctr-opportunities.test.ts tests/scripts/build-weekly-search-report.test.ts` → todos pasan **sin modificar ninguna expectativa**.

### Paso 4: Tests de año-límite del módulo

`tests/scripts/iso-week.test.ts` con fixtures de frontera (derivados de la
implementación canónica del worker — `dateToISOWeekUTC`/`isoWeekToDateRangeUTC`
ya testeados en schema.test.ts):

1. `isoWeekWindow("2025-W01")` → `from: "2024-12-30"` (el lunes cae en el año anterior).
2. `isoWeekWindow("2026-W01")` → `from: "2025-12-29"`.
3. `isoWeekWindow("2027-W01")` → `from: "2027-01-04"` (año normal).
4. `isoWeekWindow("2026-W53")` → `null` (2026 no tiene semana 53 — verifica
   con la matemática real si es null o un rango; usa el resultado real).
5. `dateToIsoWeek(new Date("2026-01-01T00:00:00Z"))` → `2026-W01` (o el valor
   real según la implementación).
6. `weekLabelToDateRange("2025-W01")` → current/previous coherentes (el
   previous cae en 2024).

**Verificar**: `pnpm exec vitest run tests/scripts/iso-week.test.ts` → todos pasan.

### Paso 5: Gates finales

**Verificar**:
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `git status` → solo archivos en alcance

## Test plan

- Tests del módulo (Paso 4) + los 2 archivos de tests existentes sin cambios.
- Cualquier discrepancia entre el módulo y los tests existentes es un STOP.

## Done criteria

- [ ] `scripts/lib/iso-week.mjs` existe con las 3 funciones
- [ ] Sin definiciones locales duplicadas en los 2 scripts
- [ ] `tests/scripts/iso-week.test.ts` con casos de año-límite pasando
- [ ] Tests existentes de ambos scripts pasan SIN modificaciones
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Un test existente falla tras la migración (la "misma matemática" resultó no
  serlo — reporta el caso exacto en vez de ajustar expectativas).
- Los dos scripts usan variantes NO idénticas (p. ej. uno redondea el domingo
  distinto) — documenta la diferencia y unifica solo si el comportamiento del
  consumer lo permite; si no, reporta.
- `dateToIsoWeek` del report difiere del worker en la corrección del jueves —
  usa la versión del script (la del report) y anota la divergencia pendiente.

## Maintenance notes

- La variante TZ del worker (`calendarDateInTimeZone` + `dateToISOWeekUTC`)
  sigue siendo la canónica para el borde lunes 00:00-04:00 UTC; si se
  consolida en el futuro, el módulo de `scripts/lib` debe adoptar esa
  semántica — hoy los scripts trabajan con labels, no con instantes.
- Los artefactos semanales (W01/W52/W53) son el lugar donde aparecería un bug
  de este módulo: al correr `data-signals:gsc:aggregate` tras un año-límite,
  revisar las fechas from/to del primer y último artefacto del año.
- En review: verificar que el output de los dos scripts no cambia (mismo
  formato de fechas y campos).
