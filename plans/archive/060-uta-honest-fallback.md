# Plan 060: UTA con fallback honesto — derivar diciembre desde SII y avisar cuando se anualiza UTM×12

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- workers/economic-snapshot-refresh/src/buildSnapshot.ts workers/economic-snapshot-refresh/src/sources/siiUtm.ts workers/economic-snapshot-refresh/src/index.ts`
> Si las zonas citadas cambiaron, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: correctness (YMYL — valor anual UTA)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

Cuando falla la búsqueda de la UTM de diciembre (`fetchDecemberUtm`, que usa
mindicador.cl), el snapshot fabrica `uta = utm × 12` con la UTM **corriente**
(ya reajustada a mitad de año) y además etiqueta `indicatorUpdatedAt.uta` con
la fecha de la UTM del mes vigente. El banner UTA de `conversor-utm.astro`
muestra entonces un valor anual equivocado (~3-8% de desvío) presentado como
vigente, y ningún gate lo atrapa (`assertPlausibleDelta` no valida UTA). El
fallo es silencioso por diseño (`fetchDecemberUtm` devuelve `null` en cualquier
error). Este plan hace dos cosas: (1) cuando mindicador falle, intentar sacar
el valor de diciembre de la página SII que el worker **ya sabe parsear**
(`parseSiiUtm(html, year, 11)` = fila "Diciembre" de `utm{year}.htm` — cero
código de parsing nuevo), y (2) si ambos fallan, mantener el fallback UTM×12
pero **logueando un warn** en vez de callar.

## Estado actual

- `workers/economic-snapshot-refresh/src/buildSnapshot.ts:301-314` (`fetchDecemberUtm` en la fábrica de deps):
```ts
  const fetchDecemberUtm: BuildSnapshotDeps["fetchDecemberUtm"] = async year => {
    try {
      const response = await fetch(`${baseUrl}/utm/${year}`, {
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) return null;
      const payload = (await response.json()) as UtmSerieResponse;
      const decEntry = payload?.serie?.find(e => e.fecha?.startsWith(`${year}-12`));
      const value = decEntry?.valor;
      return typeof value === "number" && Number.isFinite(value) ? value : null;
    } catch {
      return null;
    }
  };
```
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts:167-169`:
```ts
  const utaRefYear = getUtaReferenceYear(now);
  const decUtm = await deps.fetchDecemberUtm(utaRefYear);
  const uta = decUtm !== null ? decUtm * 12 : utm * 12;
```
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts:207`:
  `uta: decUtm !== null ? \`${utaRefYear}-12-01\` : payload?.utm?.fecha,`
- `workers/economic-snapshot-refresh/src/sources/siiUtm.ts` expone
  `parseSiiUtm(html, year, monthIndex)` (regex sobre la fila del mes, incluye
  `"Diciembre"` en `MONTHS`) y `createSiiUtmFetcher`. `siiUtm.ts:50-57` usa
  `now.getUTCFullYear()`/`getUTCMonth()` (el plan 063 corrige el timezone —
  no toques ese aspecto aquí).
- `buildSnapshot.test.ts` ya cubre el happy path y usa deps inyectadas
  (patrón a seguir para los tests nuevos).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests del worker | `pnpm exec vitest run tests/workers/economic-snapshot-refresh` | todos pasan |
| Typecheck del worker | `npx tsc --noEmit -p workers/economic-snapshot-refresh/tsconfig.json` | exit 0 |
| Suite completa | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `workers/economic-snapshot-refresh/src/buildSnapshot.ts`
- `workers/economic-snapshot-refresh/src/sources/siiUtm.ts` (solo export de un helper, si hace falta)
- `tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts` (tests nuevos)

**Fuera de alcance** (NO tocar):
- El timezone de `siiUtm.ts` (es el plan 063)
- `scripts/refresh-economic-snapshot.mjs` (espejo Node — el fallback no aplica igual; solo el worker)
- La lógica de `getUtaReferenceYear`, el provider, las páginas `.astro`

## Git workflow

- Rama: `advisor/060-uta-honest-fallback`
- Commit: `fix(editorial): UTA con fallback a SII diciembre y warn cuando se anualiza UTM×12`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Extraer un helper puro `fetchDecemberUtmWithSiiFallback`

En `buildSnapshot.ts`, junto a la fábrica de deps, agrega un helper exportado
(para testearlo sin red):
```ts
export async function fetchDecemberUtmWithSiiFallback(
  fetchImpl: typeof fetch,
  baseUrl: string,
  timeoutMs: number,
  year: number,
): Promise<number | null> {
  // 1. mindicador (comportamiento actual)
  try {
    const response = await fetchImpl(`${baseUrl}/utm/${year}`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.ok) {
      const payload = (await response.json()) as UtmSerieResponse;
      const decEntry = payload?.serie?.find(e => e.fecha?.startsWith(`${year}-12`));
      const value = decEntry?.valor;
      if (typeof value === "number" && Number.isFinite(value)) return value;
    }
  } catch {
    // cae al fallback SII
  }
  // 2. SII: la página utm{year}.htm lista los 12 meses; "Diciembre" = monthIndex 11
  try {
    const response = await fetchImpl(
      `https://www.sii.cl/valores_y_fechas/utm/utm${year}.htm`,
      { signal: AbortSignal.timeout(timeoutMs) },
    );
    if (response.ok) {
      const reading = parseSiiUtm(await response.text(), year, 11);
      if (reading) return reading.value;
    }
  } catch {
    // fallback final abajo
  }
  return null;
}
```
Importa `parseSiiUtm` desde `./sources/siiUtm` (ya exportada — no necesita
cambios). Luego reescribe el cuerpo de `fetchDecemberUtm` (buildSnapshot.ts:301-314)
para delegar:
```ts
  const fetchDecemberUtm: BuildSnapshotDeps["fetchDecemberUtm"] = async year =>
    fetchDecemberUtmWithSiiFallback(fetch, baseUrl, timeoutMs, year);
```

**Verificar**: `npx tsc --noEmit -p workers/economic-snapshot-refresh/tsconfig.json` → exit 0.

### Paso 2: Warn explícito cuando se anualiza

En `buildSnapshot.ts`, donde se calcula `uta` (líneas 167-169), reemplaza por:
```ts
  const utaRefYear = getUtaReferenceYear(now);
  const decUtm = await deps.fetchDecemberUtm(utaRefYear);
  const uta = decUtm !== null ? decUtm * 12 : utm * 12;
  if (decUtm === null) {
    // Fallback no silencioso: la UTA anualizada con UTM corriente es aproximada
    // y solo debe ocurrir cuando mindicador Y SII fallan.
    console.warn(
      `[economic-snapshot] UTA fallback: UTM de diciembre ${utaRefYear} no disponible; UTA anualizada = UTM corriente × 12`
    );
  }
```

**Verificar**: `grep -n "UTA fallback" workers/economic-snapshot-refresh/src/buildSnapshot.ts` → match.

### Paso 3: Tests nuevos en `buildSnapshot.test.ts`

Siguiendo el patrón de deps inyectadas del archivo:

1. **Fallback SII cuando mindicador falla**: `fetchImpl` devuelve
   `{ ok: false }` para `/utm/{year}` y un `Response` con HTML real de SII
   (fixture pequeño con fila "Diciembre" → valor) para la URL SII →
   `fetchDecemberUtmWithSiiFallback` devuelve `diciembre × 1` (el valor crudo).
   Nota: usa un fixture HTML mínimo: `<th>Diciembre</th><td>37.000</td>`.
2. **Fallback final null**: ambas URLs fallan → `null`.
3. **Regresión del valor anualizado**: con `fetchDecemberUtm` devolviendo
   `null`, `buildSnapshot` produce `uta === utm * 12` (comportamiento existente,
   ahora con warn — spia `console.warn` con `vi.spyOn`).

**Verificar**: `pnpm exec vitest run tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts`
→ todos pasan, incluidos los 3 nuevos.

### Paso 4: Gates finales

**Verificar**:
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `git status` → solo los archivos en alcance

## Test plan

- Tests nuevos (Paso 3) modelados sobre `buildSnapshot.test.ts` (deps inyectadas).
- Casos: mindicador falla + SII responde; ambos fallan; regresión del UTM×12 con warn.
- `parseSiiUtm(html, 2026, 11)` ya está cubierto por `siiUtm.test.ts` para el
  mes corriente; el caso "Diciembre" queda cubierto por el test 1.

## Done criteria

- [ ] `fetchDecemberUtmWithSiiFallback` exportado y usado por `fetchDecemberUtm`
- [ ] `grep -n "UTA fallback" workers/economic-snapshot-refresh/src/buildSnapshot.ts` → match
- [ ] 3 tests nuevos pasando
- [ ] `npx tsc --noEmit -p workers/economic-snapshot-refresh/tsconfig.json` exit 0
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- `parseSiiUtm` no está exportada o su firma cambió (el plan 063 puede haberla
  tocado — verifica el drift primero).
- La fábrica de deps no recibe `fetch` global accesible (si `fetch` no está en
  scope de la fábrica, usa `globalThis.fetch` y anótalo en el reporte).
- El fixture HTML de SII no matchea con la regex (el HTML real usa
  `<th>Diciembre</th>` — si el fixture falla, reporta el formato real visto).

## Maintenance notes

- Si el plan 063 (timezone) se ejecuta después, su cambio en `siiUtm.ts` no
  debe romper el helper de este plan (parseSiiUtm conserva su firma).
- La advertencia de annualización queda en Workers Logs (`[observability]` del
  snapshot worker) — en el runbook de monitoreo semanal, un "UTA fallback"
  en logs es señal de que ambos upstreams (mindicador y SII) fallaron.
- En review: verificar que el fallback SII solo agrega una request extra en el
  camino de error (mindicador OK → sin request SII).
