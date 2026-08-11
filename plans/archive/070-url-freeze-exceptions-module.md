# Plan 070: Un solo módulo para las excepciones del URL-freeze (esquema compartido)

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- scripts/compare-routes.mjs scripts/check-indexable-url-freeze.mjs scripts/compare-rss.mjs tests/scripts/`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW/MED
- **Depends on**: none
- **Category**: tech-debt (governance de URLs)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

La governance de URLs (freeze estricto del foco Q3) se apoya en tres gates con
tres mecanismos de excepción que pueden divergir: el esquema de 12 campos de
`url-freeze-exceptions.json` está **duplicado verbatim** en
`scripts/compare-routes.mjs:42-64` y `scripts/check-indexable-url-freeze.mjs:6-19`
(con criterios de validación idénticos pero copias independientes), y las
políticas de adición difieren por gate (routes/indexable requieren excepción
aprobada; `compare-rss.mjs:70-75` permite adiciones sin condición). Si el
esquema gana un campo, un script acepta entradas que el otro rechaza. El fix
es extraer un módulo compartido de parsing/validación — refactor de scripts
con tests existentes como red de seguridad, comportamiento idéntico.

## Estado actual

- `scripts/check-indexable-url-freeze.mjs:6-19`:
```js
const REQUIRED_EXCEPTION_FIELDS = [
  "url",
  "problem",
  "evidence",
  "hypothesis",
  "cost",
  "maintenance",
  "metric",
  "threshold",
  "decision",
  "approvedBy",
  "approvedAt",
  "expiresAt",
];
```
- `scripts/compare-routes.mjs:42-64` (`loadApprovedExceptions`): misma lista de
  12 campos inline + filtro `decision === "APPROVED"` + `Date.parse(expiresAt) >= now`.
- `scripts/compare-rss.mjs:70-75`: adiciones permitidas sin excepción.
- Ambos leen `docs/governance/url-freeze-exceptions.json`.
- `scripts/lib/` ya existe con 2 módulos (`editorial-timeliness-policy.mjs`,
  `spanish-date.mjs`) — la convención de módulos compartidos está establecida.
- Tests existentes: `tests/scripts/check-indexable-url-freeze.test.ts`,
  `tests/scripts/check-obs01-freeze-paths-sync.test.ts` (red de seguridad).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests de los gates | `pnpm exec vitest run tests/scripts/check-indexable-url-freeze.test.ts tests/scripts/compare-routes.test.ts 2>/dev/null` | todos pasan |
| Gates en vivo | `node scripts/check-indexable-url-freeze.mjs` (con dist existente) y `node scripts/compare-routes.mjs docs/reports/routes_snapshot_before.json output/validation/routes_snapshot_after.json` | mismos resultados que antes del refactor |
| Suite completa | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `scripts/lib/url-freeze-exceptions.mjs` (nuevo)
- `scripts/check-indexable-url-freeze.mjs` (usar el módulo)
- `scripts/compare-routes.mjs` (usar el módulo)
- `tests/scripts/url-freeze-exceptions.test.ts` (nuevo)
- `scripts/compare-rss.mjs` (SOLO comentario de cabecera documentando la política de adición, si se decide)

**Fuera de alcance** (NO tocar):
- La semántica de los gates (qué URLs se comparan, cuándo fallan)
- `docs/governance/url-freeze-exceptions.json` (no hay excepciones vigentes)
- La política de adición del RSS (decisión de governance — se documenta, no se cambia)
- `scripts/check-obs01-freeze.mjs` (otro freeze, otro mecanismo)

## Git workflow

- Rama: `advisor/070-url-freeze-exceptions-module`
- Commit: `refactor(ci): esquema único de excepciones URL-freeze en scripts/lib`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Crear el módulo compartido

`scripts/lib/url-freeze-exceptions.mjs`:
```js
// Esquema único de excepciones del URL-freeze (docs/governance/url-freeze-exceptions.json).
// Consumido por check-indexable-url-freeze.mjs y compare-routes.mjs — si el
// esquema gana un campo, se edita SOLO aquí.
const REQUIRED_EXCEPTION_FIELDS = [
  "url", "problem", "evidence", "hypothesis", "cost", "maintenance",
  "metric", "threshold", "decision", "approvedBy", "approvedAt", "expiresAt",
];

export function loadApprovedExceptionUrls(filePath) {
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));
  const now = Date.now();
  return new Set(
    (parsed.exceptions ?? [])
      .filter(entry =>
        REQUIRED_EXCEPTION_FIELDS.every(key => String(entry[key] ?? "").trim().length > 0) &&
        entry.decision === "APPROVED" &&
        Date.parse(entry.expiresAt) >= now
      )
      .map(entry => entry.url)
  );
}

export function validateExceptionSchema(filePath) {
  // Para el gate indexable: falla si una excepción no cumple el esquema
  // (mismas reglas que loadApprovedExceptionUrls, pero en vez de filtrar, reporta).
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));
  const errors = [];
  for (const [i, entry] of (parsed.exceptions ?? []).entries()) {
    const missing = REQUIRED_EXCEPTION_FIELDS.filter(key => String(entry[key] ?? "").trim().length === 0);
    if (missing.length > 0) errors.push(`exceptions[${i}].url=${entry.url ?? "<sin url>"}: faltan ${missing.join(", ")}`);
    if (entry.decision !== "APPROVED") errors.push(`exceptions[${i}].url=${entry.url ?? "?"}: decision != APPROVED`);
    if (!Number.isFinite(Date.parse(entry.expiresAt))) errors.push(`exceptions[${i}]: expiresAt inválido`);
  }
  return errors;
}
```
(importa `readFileSync` de `node:fs`; usa el estilo de `scripts/lib/spanish-date.mjs`).

### Paso 2: Migrar los dos consumidores

- `scripts/check-indexable-url-freeze.mjs`: reemplaza el bloque `REQUIRED_EXCEPTION_FIELDS`
  + su parsing por `loadApprovedExceptionUrls` y `validateExceptionSchema`
  (import relativo `./lib/url-freeze-exceptions.mjs`). El gate **indexable debe
  usar `validateExceptionSchema`** (falla ante esquema roto) — hoy filtra en
  silencio: preserva el comportamiento si el archivo es válido; si hoy filtra
  entradas inválidas sin fallar, mantenlo equivalente usando el set filtrado y
  agrega los errores de schema al output del gate (comportamiento estricto
  nuevo, documentado en el commit).
- `scripts/compare-routes.mjs`: reemplaza `loadApprovedExceptions` local por
  `loadApprovedExceptionUrls` del módulo (comportamiento idéntico).

**Verificar**:
- `node scripts/check-indexable-url-freeze.mjs` → mismo veredicto que antes del refactor (si no tienes el veredicto previo, corre primero en una rama limpia y compara).
- `node scripts/compare-routes.mjs <before> <after>` → mismo output.

### Paso 3: Tests del módulo

`tests/scripts/url-freeze-exceptions.test.ts` (fixtures en temp dir):
1. Excepciones válidas → set con las URLs aprobadas y no vencidas.
2. Entrada con campo faltante → filtrada (o reportada, según el gate que use `validateExceptionSchema`).
3. `decision != APPROVED` → filtrada.
4. `expiresAt` vencido → filtrada.
5. `validateExceptionSchema` reporta cada violación con índice.

**Verificar**: `pnpm exec vitest run tests/scripts/url-freeze-exceptions.test.ts` → todos pasan.

### Paso 4: Documentar la división de trabajo en cada gate

Agrega un comentario de cabecera en los 3 scripts (routes, rss, indexable):
- `check-indexable-url-freeze.mjs`: "Gate sitemap+HTML renderizado — requiere excepción aprobada (esquema en scripts/lib/url-freeze-exceptions.mjs)."
- `compare-routes.mjs`: "Gate rutas derivadas de contenido — requiere excepción aprobada (mismo módulo)."
- `compare-rss.mjs`: "Gate feed RSS — las adiciones NO requieren excepción (política existente, decisión de governance pendiente de revisión)."

**Verificar**: `grep -n "url-freeze-exceptions" scripts/compare-routes.mjs scripts/check-indexable-url-freeze.mjs scripts/compare-rss.mjs` → menciones presentes.

### Paso 5: Gates finales

**Verificar**:
- `pnpm exec vitest run tests/scripts` → todos pasan
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `git status` → solo archivos en alcance

## Test plan

- `tests/scripts/url-freeze-exceptions.test.ts` (5 casos) + los tests existentes de los gates deben pasar sin cambios (o con ajustes mínimos de imports si mockeaban el parsing local).

## Done criteria

- [ ] `scripts/lib/url-freeze-exceptions.mjs` existe y ambos gates lo importan
- [ ] Sin copias del esquema de 12 campos fuera del módulo (`grep -rn '"evidence"' scripts/ | grep -v lib/` → sin matches en compare-routes/check-indexable)
- [ ] Tests del módulo (5) pasando; gates con mismo veredicto que antes
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Los dos gates aplican criterios de filtrado DIFERENTES hoy (verificado al
  leerlos — el módulo único los unifica y eso es un cambio de comportamiento):
  reporta la diferencia y espera decisión del operador (puede que la
  divergencia sea intencional).
- `compare-rss.mjs` tiene su propia lógica de excepción (no solo la política
  de adición) — no la toques sin reportar.
- Los tests existentes de `check-indexable-url-freeze` mockean el parsing
  interno de tal forma que el refactor los rompe estructuralmente — adapta el
  mock al módulo (mismo comportamiento).

## Maintenance notes

- Regla: el esquema de excepciones vive SOLO en `scripts/lib/url-freeze-exceptions.mjs`.
- La política RSS (adiciones sin excepción) es una decisión abierta de
  governance — si cambia, se toca `compare-rss.mjs` y su comentario de cabecera.
- Cuando se agregue un gate de URLs nuevo, debe consumir este módulo — el
  plan 081 (capa post-build) es un candidato futuro.
- En review: verificar que el comportamiento del gate indexable con schema
  roto es ahora ruidoso (falla) y no silencioso.
