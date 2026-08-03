# Plan 053: Completar el baseline de medición GSC (gate de semanas faltantes + exports de país/dispositivo)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> ```bash
> git diff --stat 0bd51540..HEAD -- \
>   scripts/data-signals/gsc-fetch.mjs \
>   scripts/data-signals/gsc-utils.mjs \
>   tests/scripts/gsc-fetch.test.ts \
>   .github/workflows/data-signals.yml
> ```
> If any of these files changed since 0bd51540, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it
> as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (extends the pattern of the already-archived plan 036, but nothing is blocked)
- **Category**: direction
- **Planned at**: commit `0bd51540`, 2026-08-02

## Why this matters

El memo de viabilidad estratégica del 2026-08-02
(`output/audits/strategic-viability-2026-08-02/monedario-strategic-viability-audit.html`,
untracked) fija una ventana de experimentos de 90 días en la que **ningún
resultado se declara con menos muestra de la indicada** y la **integridad de
medición ≥95% es condición de parada** ("si falla, detener producto y arreglar
datos"). El baseline exigido incluye "GSC 28 días y tres meses, país/dispositivo".

Hoy hay tres brechas verificadas:

1. **Falta el export de la semana 2026-W29** en `output/operations/data-signals/gsc/`
   (solo existen `2026-W28-*` parciales y `2026-W30-*` completos). La brecha pasó
   desapercibida: el issue #338 se cerró como stale por exactamente esta ausencia.
2. **No hay detección de semanas faltantes**: `scripts/data-signals/gsc-fetch.mjs`
   escribe los archivos de la semana objetivo sin mirar si semanas anteriores
   faltan. Una semana perdida no produce ninguna señal.
3. **No hay dimensiones de país ni dispositivo** en los exports GSC, así que el
   baseline "país/dispositivo" del memo no se puede construir.

Al aterrizar esto, una semana perdida hace fallar el job de datos en vez de
pasar en silencio (mismo patrón que el plan 036 aplicó al export de analytics),
y los exports ganan las dos dimensiones que el memo exige.

## Current state

- `scripts/data-signals/gsc-fetch.mjs` — CLI script (Node, sin dependencias
  externas) que fetchea Search Analytics + Sitemaps y escribe JSON normalizado
  en `output/operations/data-signals/gsc/`. Report types actuales (líneas 193–201):

  ```js
  const [queryRows, pageRows, queryPageRows, sitemapEntries] = await Promise.all([
    fetchSearchAnalytics(site, from, to, ["query"], token),
    fetchSearchAnalytics(site, from, to, ["page"], token),
    fetchSearchAnalytics(site, from, to, ["query", "page"], token),
    fetchSitemaps(site, token),
  ]);
  ```

  Escritura (líneas 239–249):

  ```js
  for (const [filename, doc] of [
    [`${week}-queries.json`, queriesDoc],
    [`${week}-pages.json`, pagesDoc],
    [`${week}-query-page.json`, queryPageDoc],
    [`${week}-sitemaps.json`, sitemapsDoc],
  ]) {
    const filePath = path.join(dir, filename);
    writeFileSync(filePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
    console.error(
      `[gsc-fetch] wrote ${filePath}  (${doc.data.length} rows)`
    );
  }
  ```

  El CLI ya soporta `--week=YYYY-Www` (parseArgs, líneas 80–107) y `--dry-run`.
  `OUTPUT_BASE = "output/operations/data-signals/gsc"` (línea 17). El flujo de
  `main()` (líneas 153–…): valida credenciales → calcula `week` → autentica →
  fetch en paralelo → escribe. **El gate de brechas debe ir entre el cálculo de
  `week` y `fetchAccessToken`** (así es testeable sin credenciales).

- `scripts/data-signals/gsc-utils.mjs` — helpers puros ya existentes:
  - `isExportOverdue(week, now = new Date(), graceDays = 2)` (línea 71) — true si
    la semana ya superó su domingo + grace; usado por `fetch-analytics-export.mjs:232`
    que hace `process.exit(1)` con mensaje "OVERDUE" cuando el export de analytics
    falta.
  - `isoWeekToDateRange(week)` (línea 39) — devuelve `{ from, to }` (lunes–domingo).
  - `dateToISOWeek(date)` — usado en tests; convierte una fecha a `YYYY-Www`.
  - Normalizadores: `normalizeQueryRow` (127), `normalizePageRow` (142),
    `normalizeQueryPageRow` (157), `normalizeSitemapEntry` (332). Ejemplo
    (`normalizePageRow`):

  ```js
  export function normalizePageRow(row) {
    return {
      key: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    };
  }
  ```

- `.github/workflows/data-signals.yml` — 2×/semana (lun+mié 06:00 UTC) +
  `workflow_dispatch` con input `week` (ya permite backfill manual de una semana
  específica). El step "Fetch GSC signals" corre `node scripts/data-signals/gsc-fetch.mjs --week="$WEEK"`
  **sin** `|| true` — un exit code ≠ 0 hace fallar el job. No requiere cambios.

- Brecha real: `ls output/operations/data-signals/gsc/` → no existe ningún
  `2026-W29-*.json`.

- Patrones de test: `tests/scripts/gsc-fetch.test.ts` (414 líneas) — mezcla de
  tests puros de helpers de `gsc-utils.mjs` y tests CLI con `spawnSync` que
  borran `GOOGLE_APPLICATION_CREDENTIALS_JSON` del env. Ver el import block y la
  función `run()` del archivo; ese es el patrón a seguir. También
  `tests/scripts/analytics-export-staleness.test.ts` (tests de `isExportOverdue`).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Tests del archivo objetivo | `pnpm exec vitest run tests/scripts/gsc-fetch.test.ts` | all pass (los existentes + los nuevos) |
| Suite completa | `pnpm test` | exit 0 |
| Lint | `pnpm exec eslint scripts/data-signals/gsc-fetch.mjs scripts/data-signals/gsc-utils.mjs tests/scripts/gsc-fetch.test.ts` | exit 0 |
| Formato | `pnpm exec prettier --check scripts/data-signals/gsc-fetch.mjs scripts/data-signals/gsc-utils.mjs tests/scripts/gsc-fetch.test.ts` | exit 0 |
| Chequeo de módulos leaf (convención del repo) | `pnpm run check:boundaries` | exit 0 |

## Scope

**In scope** (the only files you should modify):
- `scripts/data-signals/gsc-utils.mjs` — helper puro `missingExportWeeks` +
  normalizadores `normalizeCountryRow` / `normalizeDeviceRow`
- `scripts/data-signals/gsc-fetch.mjs` — gate de brechas + 2 report types nuevos
  + override `GSC_OUTPUT_BASE` para tests
- `tests/scripts/gsc-fetch.test.ts` — tests nuevos
- `plans/README.md` — fila de estado (una línea)

**Out of scope** (do NOT touch, even though they look related):
- `.github/workflows/data-signals.yml` — no requiere cambio (el exit 1 del
  script ya falla el job); no lo edites.
- `scripts/data-signals/fetch-analytics-export.mjs` y el worker de analytics —
  el lado analytics ya tiene su gate (plan 036); esto es solo el lado GSC.
- El backfill de la semana 2026-W29 es un paso **operativo** (Step 5) que se
  documenta, no se ejecuta con credenciales dentro del worktree.
- Cualquier cambio en el esquema de eventos de analytics, la scorecard semanal
  o el reporte de search ops.

## Git workflow

- Rama: `advisor/053-gsc-measurement-baseline`
- Commit por unidad lógica; estilo convencional del repo (ver `git log --oneline -5`):
  `feat(data-signals): detectar semanas GSC faltantes y exportar país/dispositivo (plan 053)`
- NO hagas push ni abras PR salvo que el operador lo indique.

## Steps

### Step 1: helper puro `missingExportWeeks` en gsc-utils.mjs

Añade en `scripts/data-signals/gsc-utils.mjs` (junto a `isExportOverdue`):

```js
/**
 * Semanas ISO continuas entre la semana objetivo y `lookbackWeeks` semanas
 * atrás (ambas inclusive) que NO están en `availableWeeks`.
 * @param {string[]} availableWeeks - etiquetas YYYY-Www presentes, p.ej. ["2026-W30"]
 * @param {string} targetWeek - etiqueta YYYY-Www de la semana objetivo
 * @param {number} [lookbackWeeks=12] - cuántas semanas hacia atrás mirar
 * @returns {string[]} etiquetas faltantes en orden cronológico
 */
export function missingExportWeeks(availableWeeks, targetWeek, lookbackWeeks = 12) { ... }
```

Semántica y reglas de implementación:
- Valida `targetWeek` con el mismo chequeo que `isoWeekToDateRange` (si lanza,
  deja propagar el error — los tests existentes de `isoWeekToDateRange` ya
  fijan el formato `^\d{4}-W\d{2}$`).
- Genera la lista de semanas desde `targetWeek` hacia atrás `lookbackWeeks − 1`
  semanas usando `isoWeekToDateRange` + `dateToISOWeek`: para avanzar una semana
  atrás, restar 7 días a la fecha `from` de la semana actual. `dateToISOWeek`
  ya está exportado en el mismo archivo (verificado en los imports de
  `tests/scripts/gsc-fetch.test.ts`).
- Devuelve las semanas de esa lista que no estén en `availableWeeks`, en orden
  cronológico (la más antigua primero). `availableWeeks` puede contener
  etiquetas fuera de rango o malformadas — ignóralas.
- `lookbackWeeks` mínimo razonable: 1.

**Verify**: `pnpm exec vitest run tests/scripts/gsc-fetch.test.ts` → los tests
nuevos de Step 2 pasan (escríbelos en el mismo Step o justo después; ver Test plan).

### Step 2: tests del helper (primero, TDD)

En `tests/scripts/gsc-fetch.test.ts`, bajo un `describe("missingExportWeeks")`
nuevo, importa `missingExportWeeks` y cubre como mínimo:
- semana anterior inmediata ausente → `["2026-W29"]` para target `2026-W30` con
  `available = ["2026-W28", "2026-W30"]`
- brecha en el medio (faltan W27 y W28, target W30, disponibles W26 y W30) →
  `["2026-W27", "2026-W28"]`
- brecha más allá del lookback excluida (lookback 2, target W30, disponible W26)
  → `["2026-W29"]` (W28 queda fuera de la ventana)
- lista vacía de disponibles → todas las semanas de la ventana
- todas presentes → `[]`
- formato inválido de target → `toThrow` (mismo patrón que los tests de
  `isoWeekToDateRange`)

**Verify**: `pnpm exec vitest run tests/scripts/gsc-fetch.test.ts` → los tests
de `missingExportWeeks` pasan.

### Step 3: gate de brechas en gsc-fetch.mjs

En `main()`, **después** de calcular `week` (línea `const week = args.week ?? previousCompleteISOWeek();`)
y **antes** de `fetchAccessToken`:

1. Lee el directorio de salida (honrando un override de env para tests):
   `const outputBase = process.env.GSC_OUTPUT_BASE || OUTPUT_BASE;` y usa
   `outputBase` en `mkdirSync`/`writeFileSync` del bloque final (reemplaza el
   uso actual de `OUTPUT_BASE` en la escritura).
2. Deriva las semanas disponibles: `readdirSync(outputBase, { withFileTypes: true })`
   filtrando archivos que matcheen `/^(\d{4}-W\d{2})-(?:pages|queries)\.json$/`;
   si el directorio no existe, trátalo como lista vacía (usa try/catch en el
   `readdirSync`).
3. `const missing = missingExportWeeks(availableWeeks, week);`
4. Regla del gate (documentada en un comentario):
   - **Modo por defecto** (sin `--week` explícito): si `missing` incluye la
     semana anterior a `week` **y** `isExportOverdue(semanaAnterior)` → imprime
     en stderr un mensaje `[gsc-fetch] GAP: ...` nombrando las semanas faltantes
     y el comando de backfill (`--week=<semana>` o el `workflow_dispatch` con el
     input `week`), y `process.exit(1)`.
   - **Modo backfill** (`--week` explícito): la misma brecha produce solo un
     `console.error` de advertencia "GAP (backfill mode): ...", sin salir ≠ 0.
   - Cualquier brecha más antigua (no es la semana anterior) → advertencia en
     stderr en ambos modos, listando las semanas.
5. Imprime siempre una línea de estado `[gsc-fetch] weeks_present=N missing=[...]`
   (con `[]` vacío si no hay brechas) — así el log del workflow deja evidencia
   de que el gate corrió.

Para "la semana anterior a `week`": calcula `isoWeekToDateRange(week).from`,
resta 7 días y `dateToISOWeek` (misma técnica que el Step 1). Importa
`missingExportWeeks` y `dateToISOWeek` desde `./gsc-utils.mjs` (extiende el
import block existente de la línea 7–15).

**Verify**: 
- `GSC_OUTPUT_BASE=$(mktemp -d) node scripts/data-signals/gsc-fetch.mjs` (sin
  credenciales, dir vacío) → exit 1, stderr contiene `GAP` y menciona la semana
  anterior; **no** contiene "Missing env var" (el gate corre antes de auth).
- `GSC_OUTPUT_BASE=$(mktemp -d) node scripts/data-signals/gsc-fetch.mjs --week=2026-W17`
  → exit 1 por credenciales ("Missing env var"), stderr **sí** contiene la
  advertencia "GAP (backfill mode)" (backfill es permisivo).
- Repite con un fixture que tenga `2026-W30-pages.json` (archivo vacío `{}`
  basta) → el mensaje `weeks_present=1 missing=[]` aparece (o al menos el gate
  no dispara) y el exit es por credenciales.

### Step 4: exports de país y dispositivo

1. En `gsc-utils.mjs`, añade dos normalizadores con la misma forma que
   `normalizePageRow` (fallback `?? ""` / `?? 0` idéntico):
   - `normalizeCountryRow(row)` → `{ key: row.keys?.[0] ?? "", clicks, impressions, ctr, position }`
     (GSC devuelve códigos de país ISO en minúscula, p. ej. `"chl"`).
   - `normalizeDeviceRow(row)` → misma forma (GSC devuelve
     `"MOBILE" | "DESKTOP" | "TABLET"`).
2. En `gsc-fetch.mjs`, extiende el `Promise.all` (líneas 193–201) con dos
   fetches más: `fetchSearchAnalytics(site, from, to, ["country"], token)` y
   `fetchSearchAnalytics(site, from, to, ["device"], token)`.
3. Construye `countriesDoc` y `devicesDoc` con el mismo `buildSchemaHeader("gsc", week, from, to)`
   y los normalizadores nuevos.
4. Actualiza: el bloque `printUsage` (líneas 40–57: añade las dos líneas de
   output), el bloque de dry-run (añade los dos `--- country ---` / `--- device ---`
   separators), y el loop de escritura (añade `${week}-countries.json` y
   `${week}-devices.json`).

**Verify**:
- `pnpm exec vitest run tests/scripts/gsc-fetch.test.ts` → tests nuevos de
  normalizadores pasan (Step del Test plan).
- `GSC_OUTPUT_BASE=$(mktemp -d) node scripts/data-signals/gsc-fetch.mjs --help`
  → la salida de Usage lista `countries` y `devices`.

### Step 5: documentar el backfill de 2026-W29 (no ejecutarlo)

Añade al commit un bloque de notas (puede ser en el cuerpo del mensaje de
commit o un comentario en el README del plan — elige un lugar y dilo en el
reporte final) con el paso operativo:

```
Backfill de la semana faltante (requiere credenciales — operador):
  opción A (workflow):  despacho manual de .github/workflows/data-signals.yml con input week=2026-W29
  opción B (local):     pnpm run data-signals:gsc:local -- --week=2026-W29
                        (lee GOOGLE_APPLICATION_CREDENTIALS_JSON de .env.local; luego commit de output/operations/data-signals/gsc/)
```

NO ejecutes este paso tú mismo: requiere credenciales fuera del worktree y el
output se commitea desde el árbol principal. Déjalo documentado para el operador.

**Verify**: el reporte final del ejecutor incluye el bloque de backfill (grep
del commit o del doc elegido → presente).

## Test plan

Tests nuevos en `tests/scripts/gsc-fetch.test.ts`:
- `describe("missingExportWeeks")` — 5–6 casos listados en el Step 2.
- `describe("normalizeCountryRow")` — fila con `keys: ["chl"]` → `key === "chl"`;
  fila sin keys → `key === ""`; ceros por defecto.
- `describe("normalizeDeviceRow")` — `["MOBILE"]` → `key === "MOBILE"`; sin keys
  → `""`.
- Tests CLI nuevos (patrón `spawnSync` + `run()` existente, que borra las
  credenciales del env): los tres casos del Step 3 (gate en modo default,
  gate en modo backfill, dir con fixture). Usa `GSC_OUTPUT_BASE` con
  `fs.mkdtempSync(path.join(os.tmpdir(), "gsc-"))` y limpia en `afterEach`.

Patrón estructural: `tests/scripts/gsc-fetch.test.ts` (CLI + helpers) y
`tests/scripts/analytics-export-staleness.test.ts` (casos de `isExportOverdue`).

**Verify**: `pnpm exec vitest run tests/scripts/gsc-fetch.test.ts` → all pass;
`pnpm test` → suite completa verde.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec vitest run tests/scripts/gsc-fetch.test.ts` → exit 0, tests nuevos presentes y pasando
- [ ] `pnpm test` → exit 0
- [ ] `pnpm exec eslint scripts/data-signals/gsc-fetch.mjs scripts/data-signals/gsc-utils.mjs tests/scripts/gsc-fetch.test.ts` → exit 0
- [ ] `pnpm exec prettier --check scripts/data-signals/gsc-fetch.mjs scripts/data-signals/gsc-utils.mjs tests/scripts/gsc-fetch.test.ts` → exit 0
- [ ] `pnpm run check:boundaries` → exit 0
- [ ] `grep -n "missingExportWeeks" scripts/data-signals/gsc-fetch.mjs scripts/data-signals/gsc-utils.mjs` → 2+ matches (definición + uso)
- [ ] `grep -n 'countries\|devices' scripts/data-signals/gsc-fetch.mjs` → matches en usage, dry-run y write loop
- [ ] `git status` limpio salvo los archivos del Scope
- [ ] Fila del plan en `plans/README.md` actualizada (salvo instrucción en contrario del reviewer)

## STOP conditions

Stop and report back (do not improvise) if:

- Los archivos en "Current state" no coinciden con los extractos (drift desde `0bd51540`).
- `pnpm exec vitest run tests/scripts/gsc-fetch.test.ts` no pasa **antes** de tu cambio (baseline roto — no es tu regresión; repórtalo).
- El gate del Step 3 falla en modo default pero el fixture parece correcto: verifica que `readdirSync` con `withFileTypes` y tu regex de `(?:pages|queries)` matcheen — no relajes el gate para que pase el test.
- Descubres que la GSC API no acepta la dimensión `"country"` o `"device"` (no debería — son dimensiones estándar de searchAnalytics; si responde 400, detente y reporta con el cuerpo del error).

## Maintenance notes

- La scorecard semanal y el reporte de search ops NO consumen todavía
  `countries`/`devices`; cuando se integren, los archivos nuevos ya estarán ahí
  sin migración.
- Si el workflow de data-signals vuelve a perder una semana, el job ahora
  fallará con "GAP" — el siguiente paso humano es el backfill documentado en el
  Step 5, no silenciar el gate.
- Si alguien cambia el esquema de nombres de archivo (p. ej. añadir sufijos),
  el regex de derivación de semanas en el Step 3 debe actualizarse junto.
- El memo de viabilidad exige también un export de 3 meses (GSC 28 días y tres
  meses); ese rango mayor es un fetch distinto (rango de fechas, no `--week`) y
  queda deliberadamente fuera de este plan.

## Revisión de auditoría post-ejecución (2026-08-02, ronda 1 — aplicada)

Auditoría de edge cases del trabajo ejecutado (commits `f1e37560` +
`bc979708`, rama `advisor/053-gsc-measurement-baseline`). Dos hallazgos
corregidos vía re-despacho al mismo ejecutor; el resto, observaciones
registradas sin corrección:

- **[ALTO — corregido] El gate nunca disparaba en CI**: `.github/workflows/data-signals.yml:111-123`
  invoca el script **siempre** con `--week="$WEEK"` (incluso en el caso
  programado donde `$WEEK` es la semana completa anterior). La regla original
  ("modo backfill si `--week` explícito") dejaba al pipeline entero en modo
  permisivo → una semana perdida seguía pasando silenciosa, frustrando el
  propósito del plan. Corregido en `bc979708`: la regla es ahora por objetivo
  (`strictGate = week === previousCompleteISOWeek()`), no por flag — el caso
  normal de CI (objetivo = semana completa anterior) es estricto aunque el
  workflow pase `--week` explícito; los backfills reales (semanas viejas)
  siguen permisivos.
- **[MEDIO — corregido junto con el anterior] Tests CLI acoplados al
  calendario real**: dos tests usaban `--week=2026-W30`, que es la semana
  completa anterior el día que se corren en determinadas fechas (p. ej. un
  domingo) → habrían caído en modo estricto tras la corrección y fallado.
  Migrados a la semana vieja fija `2026-W17`; añadido test nuevo
  "explicit --week equal to the previous complete week is still strict".
- **[BAJO — registrado, sin corrección]** `missingExportWeeks` con
  `lookbackWeeks ≤ 0` devuelve `[]` silencioso (sin call site real; default 12).
- **[BAJO — por diseño]** Una semana presente solo con `sitemaps`/`url-inspection`
  (sin `pages`/`queries`) no cuenta como presente — el regex es `pages|queries`;
  comportamiento defensivo (un job parcial no debe enmascarar una semana).
- **[BAJO — cosmético]** El mensaje `WARNING: older missing exports` también se
  imprime si la semana previa está en missing pero dentro de su grace window —
  el comportamiento (advertir y continuar) es correcto; solo el wording es
  impreciso en ese caso teórico.
- **[INFO]** `isExportOverdue(prevWeek)` es redundante bajo la regla nueva
  (la previa de la semana completa anterior siempre está overdue), se mantiene
  como defensa ante cambios futuros de semántica.

Verificación final tras la corrección: `vitest run tests/scripts/gsc-fetch.test.ts`
→ 51/51; `pnpm test` → 136 archivos / 1092 tests; eslint/prettier/check:boundaries
exit 0; manual estricto (`--week=<previous complete>`, dir vacío) → GAP + exit 1
sin "Missing env var"; manual permisivo (`--week=2026-W17`) → advertencia y exit
por credenciales.
