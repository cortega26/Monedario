# Plan 047: Filtrar el RUM de Cloudflare por hostname (`monedario.cl`) para cerrar GROWTH-005

> **Instrucciones para el ejecutor**: Sigue este plan paso a paso. Corre cada
> comando de verificación y confirma su salida esperada antes de avanzar. Si
> ocurre una condición de la sección "STOP conditions", detente y reporta — no
> improvises. Al terminar, actualiza la fila de este plan en `plans/README.md`,
> salvo que un revisor te haya despachado y te diga que él mantiene el índice.
>
> **La compuerta de viabilidad externa del Step 1 quedó verificada el
> 2026-07-16 durante la auditoría W28.** Una consulta live, read-only, al dataset
> `rumWebVitalsEventsAdaptiveGroups` confirmó que `requestHost` existe como
> filtro y dimensión; el mismo query limitado a `monedario.cl` devolvió solo ese
> hostname. El ejecutor debe repetir el smoke de schema para detectar drift, pero
> ya no debe tratar la capacidad como desconocida. Cumple el
> criterio obligatorio de viabilidad de `docs/development/CRITERIO_VIABILIDAD.md`:
> analiza la viabilidad de forma realista, no solo técnica.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat f34210ff..HEAD -- \
>   scripts/data-signals/cloudflare-fetch.mjs \
>   scripts/data-signals/gsc-utils.mjs \
>   tests/scripts/rum-sanitizer.test.ts
> ```
> Si `cloudflare-fetch.mjs` cambió desde este plan, compara los extractos de
> "Estado actual" contra el código vivo antes de proceder; si no coinciden,
> trátalo como STOP.

## Status

- **Closure**: DONE — implementation and independent review passed; integrated
  by the final Issue #315 change
- **Priority**: P2
- **Effort**: M
- **Risk**: MED (la capacidad `requestHost` fue verificada en vivo el 2026-07-16;
  el riesgo remanente es drift del schema externo o un filtro mal cableado)
- **Depends on**: none
- **Category**: bug (corrección de datos / contaminación cross-hostname)
- **Planned at**: commit `f34210ff`, 2026-07-13
- **Origen**: follow-up especificado por el brief
  `docs/reports/GROWTH-DIRECTION-DELTA-2026-W27.md` §5 (spike 045). GROWTH-005 en
  la auditoría canónica `docs/reports/GROWTH-DIRECTION-AUDIT-2026-06-28.md`.
- **Execution**: implementación y revisión técnica aprobadas el 2026-07-16 en
  `56efa9f0`, integrada como `a3ac9504`; gates locales y cierre atómico aprobados.

## Viabilidad verificada (delta 2026-07-16)

La auditoría W28 ejecutó un query read-only contra Cloudflare GraphQL usando el
mismo dataset de producción. `requestHost` fue aceptado en `filter`, se solicitó
también en `dimensions`, y las filas de control filtradas por `monedario.cl`
contenían únicamente ese host. No se registra ningún token, identificador de
cuenta ni valor secreto en este plan. Resultado: **Opción A confirmada**; el
executor debe implementar `requestHost: $host` y mantener el allowlist de rutas
como defensa en profundidad.

## Why this matters

`fetchRumWebVitals` consulta las métricas RUM (Web Vitals: LCP, INP, CLS) a
**nivel de cuenta** de Cloudflare (`accounts(filter: { accountTag })`), no a
nivel de zona. La cuenta Cloudflare del usuario aloja varios sitios además de
monedario.cl (p. ej. `/llaveros/`, `/limpiezayaseo/`). Un allowlist de rutas
post-fetch (`sanitizeRumRoutes`) descarta rutas que no existen en monedario,
pero **no puede distinguir** `monedario.cl/` de `otrositio.cl/` cuando ambas se
llaman literalmente `/`. Consecuencia: las métricas RUM de rutas **compartidas**
(la home `/`, y cualquier ruta que exista en más de un sitio de la cuenta)
mezclan tráfico cross-hostname en silencio y se presentan como dato limpio en el
scorecard semanal. Rutas **únicas** de monedario (p. ej.
`/calculadoras/conversor-utm/`) sí son confiables.

Cuando esto se cierre, cualquier decisión de producto basada en RUM de rutas
compartidas (que hoy no es confiable) pasa a serlo. Hasta entonces, el checklist
del brief §4 prohíbe usar RUM de rutas compartidas para decidir.

## Current state

Archivos relevantes:

- `scripts/data-signals/cloudflare-fetch.mjs` — script Node que baja tráfico y
  RUM de Cloudflare vía GraphQL y escribe JSON en
  `output/operations/data-signals/cloudflare/`. Contiene el defecto.
- `scripts/data-signals/gsc-utils.mjs` — exporta `sanitizeRumRoutes` (el
  allowlist post-fetch; **defensa en profundidad, no reemplazo del fix**).
- `tests/scripts/rum-sanitizer.test.ts` — único test que toca la ruta RUM (cubre
  `sanitizeRumRoutes`). No hay test que ejercite el armado del query GraphQL.

**El contraste clave** — el tráfico ya está correctamente scopeado por zona, el
RUM no:

`scripts/data-signals/cloudflare-fetch.mjs:120-138` (tráfico, **zona** = un solo
hostname, correcto):
```js
async function fetchDailyTraffic(token, zoneTag, from, to) {
  const data = await gql(token, `
    query Traffic($zoneTag: string!, $from: Date!, $to: Date!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {          // <-- scope por zona
          httpRequests1dGroups( ... ) { ... }
        }
      }
    }
  `, { zoneTag, from, to });
  return data.viewer.zones[0]?.httpRequests1dGroups ?? [];
}
```

`scripts/data-signals/cloudflare-fetch.mjs:140-163` (RUM, **cuenta** = todos los
sitios, contaminado):
```js
async function fetchRumWebVitals(token, accountTag, fromDt, toDt) {
  const data = await gql(token, `
    query RUM($accountTag: string!, $from: DateTime!, $to: DateTime!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {   // <-- scope por CUENTA
          rumWebVitalsEventsAdaptiveGroups(
            limit: 100
            orderBy: [count_DESC]
            filter: { datetime_geq: $from, datetime_leq: $to }   // <-- sin hostname
          ) {
            count
            dimensions { requestPath }                    // <-- sin requestHost
            quantiles { cumulativeLayoutShiftP75 interactionToNextPaintP75 largestContentfulPaintP75 }
          }
        }
      }
    }
  `, { accountTag, from: fromDt, to: toDt });
  return data.viewer.accounts[0]?.rumWebVitalsEventsAdaptiveGroups ?? [];
}
```

Consumo (`scripts/data-signals/cloudflare-fetch.mjs:206-243`):
```js
function normalizeRumRow(row) {
  const q = row.quantiles;
  const clsRaw = q.cumulativeLayoutShiftP75;
  return {
    clsP75:  clsRaw < 0 ? null : Math.round(clsRaw * 1000) / 1000,
    count:   row.count,
    inpP75Ms: usToMs(q.interactionToNextPaintP75),
    lcpP75Ms: usToMs(q.largestContentfulPaintP75),
    path:    row.dimensions.requestPath,
  };
}
// ...
const rumRowsRaw  = rawRum.map(normalizeRumRow);
const { kept: rumRows, discarded: discardedRum } = sanitizeRumRoutes(rumRowsRaw);
```

Config (`scripts/data-signals/cloudflare-fetch.mjs:226-236`):
```js
const token = getRequiredEnv("CLOUDFLARE_ANALYTICS_TOKEN");   // scope: Account Analytics:Read
const zoneId = getRequiredEnv("CLOUDFLARE_ZONE_ID");          // zona de monedario.cl
const accountId = getRequiredEnv("CLOUDFLARE_ACCOUNT_ID");
// ...
fetchRumWebVitals(token, accountId, `${from}T00:00:00Z`, `${to}T23:59:59Z`),
```

Convención del repo a respetar: los queries GraphQL se escriben inline como
template string en `gql(token, query, variables)`; los errores se lanzan (no se
tragan) — ver `gql` en `cloudflare-fetch.mjs:96-114`. Los tests de scripts usan
Vitest y viven en `tests/scripts/` (ver `tests/scripts/rum-sanitizer.test.ts`
como patrón estructural).

## Commands you will need

| Propósito | Comando | Esperado |
|---|---|---|
| Instalar deps | `pnpm install` | exit 0 (worktree fresco) |
| Lint del archivo | `pnpm exec eslint scripts/data-signals/cloudflare-fetch.mjs` | exit 0 |
| Formato | `pnpm run format:check` | exit 0 (o solo la excepción preexistente) |
| Test dirigido | `pnpm exec vitest run tests/scripts/rum-sanitizer.test.ts` | pasa |
| Suite completa | `pnpm test` | 0 failures |
| Sintaxis del script | `node --check scripts/data-signals/cloudflare-fetch.mjs` | exit 0 |

No corras el script contra la API real salvo que tengas `CLOUDFLARE_ANALYTICS_TOKEN`
en `.env.local` y el operador lo autorice — escribe en `output/` (gitignored) y
gasta cuota de API. La verificación del schema (Step 1) se hace con introspección
puntual o contra la documentación pública, no corriendo el pipeline completo.

## Suggested executor toolkit

- Lee el brief que origina este plan:
  `docs/reports/GROWTH-DIRECTION-DELTA-2026-W27.md` §2.3 y §5 (diagnóstico y spec
  del follow-up).
- `docs/development/CRITERIO_VIABILIDAD.md` — criterio obligatorio de viabilidad.
- Documentación del schema GraphQL de Cloudflare Analytics para el dataset
  `rumWebVitalsEventsAdaptiveGroups` (dimensiones y filtros disponibles). Es la
  referencia que resuelve el Step 1.

## Scope

**In scope** (lo único que modificas):
- `scripts/data-signals/cloudflare-fetch.mjs` (el fix del query + normalización
  si aplica).
- `tests/scripts/rum-sanitizer.test.ts` **o** un archivo de test nuevo
  `tests/scripts/cloudflare-rum-query.test.ts` (crear) — ver Test plan.

**Out of scope** (NO tocar, aunque parezca relacionado):
- `scripts/data-signals/gsc-utils.mjs` / `sanitizeRumRoutes` — el allowlist se
  **mantiene** como defensa en profundidad; no lo elimines ni lo reescribas.
- `scripts/build-weekly-search-report.mjs` y el generador del scorecard — el
  consumo aguas abajo del RUM no cambia de forma (el shape de `rumRows` se
  conserva: `{ path, count, clsP75, inpP75Ms, lcpP75Ms }`).
- `output/**` — datos generados; no los edites a mano.
- `fetchDailyTraffic` — ya está correcto (scope por zona); no lo toques.
- Cualquier archivo de producto (`src/`, `workers/`).

## Git workflow

- Branch: `advisor/047-growth-005-rum-hostname-filter`.
- Commit estilo conventional commits, p. ej.
  `fix(data-signals): filtrar RUM de Cloudflare por hostname (GROWTH-005)`.
- NO hagas push ni abras PR salvo que el operador lo pida.

## Steps

### Step 1: Reconfirmar `requestHost` y detectar drift del schema

`rumWebVitalsEventsAdaptiveGroups` hoy se consulta bajo `accounts`. Determina
cuál de estas tres opciones es la que la API realmente soporta, en este orden de
preferencia:

- **Opción A — dimensión/filtro `requestHost`**: el dataset expone una dimensión
  de hostname (nombres candidatos según el schema: `requestHost`,
  `clientRequestHTTPHost`, `host`) que se puede poner en `filter { ... }` y/o en
  `dimensions { ... }`. Es la opción más limpia: se mantiene el query a nivel de
  cuenta y se filtra por `monedario.cl`.
- **Opción B — dataset RUM a nivel de zona**: `rumWebVitalsEventsAdaptiveGroups`
  (o su equivalente) está disponible bajo `zones(filter: { zoneTag })`, igual que
  `httpRequests1dGroups`. Entonces se reusa `zoneId` (ya disponible en `main`) y
  el scope-por-hostname es inherente, sin filtro adicional.
- **Opción C — no soportado**: ni `requestHost` como dimensión filtrable ni un
  path por zona existen para este dataset. → **STOP** (ver STOP conditions):
  documenta la limitación como entregable y no implementes un filtro que la API
  ignora silenciosamente.

Cómo verificar (elige lo que tengas disponible, en este orden):
1. Introspección puntual del schema si tienes `CLOUDFLARE_ANALYTICS_TOKEN` en
   `.env.local` (query `__type(name: "...")` o inspección de los `filter`/
   `dimensions` del nodo). No corras el pipeline completo; solo la introspección.
2. Si no hay credenciales en el worktree: consulta la documentación pública del
   schema GraphQL de Cloudflare Analytics para `rumWebVitalsEventsAdaptiveGroups`
   y confirma los nombres de dimensión/filtro disponibles.
3. Si no puedes confirmarlo de ninguna de las dos formas: **STOP** y reporta que
   la verificación de viabilidad requiere que el operador corra la introspección
   con credenciales — no adivines el nombre del campo.

**Verify**: tienes por escrito cuál opción (A / B / C) aplica, con la evidencia
(salida de introspección o cita de la doc del schema) y, si es A, el nombre
exacto del campo de hostname.

### Step 2: Implementar el scope-por-hostname en `fetchRumWebVitals`

Según el resultado del Step 1:

- **Si Opción A** — añade el campo de hostname al `filter` del query y opcional a
  `dimensions`, y pasa el hostname objetivo. Mantén el query bajo `accounts`.
  Forma objetivo (ajusta el nombre `requestHost` al confirmado en Step 1):
  ```js
  async function fetchRumWebVitals(token, accountTag, host, fromDt, toDt) {
    const data = await gql(token, `
      query RUM($accountTag: string!, $host: string!, $from: DateTime!, $to: DateTime!) {
        viewer {
          accounts(filter: { accountTag: $accountTag }) {
            rumWebVitalsEventsAdaptiveGroups(
              limit: 100
              orderBy: [count_DESC]
              filter: { datetime_geq: $from, datetime_leq: $to, requestHost: $host }
            ) {
              count
              dimensions { requestPath }
              quantiles { cumulativeLayoutShiftP75 interactionToNextPaintP75 largestContentfulPaintP75 }
            }
          }
        }
      }
    `, { accountTag, host, from: fromDt, to: toDt });
    return data.viewer.accounts[0]?.rumWebVitalsEventsAdaptiveGroups ?? [];
  }
  ```
  Y en `main` (línea ~236) pasa el host. Deriva el hostname de una constante o
  env explícita — **no lo hardcodees disperso**. Preferencia: usa una env nueva
  `CLOUDFLARE_SITE_HOST` con default `"monedario.cl"`, o una constante
  `const SITE_HOST = "monedario.cl";` cerca del tope del archivo, documentada. Si
  Cloudflare sirve también `www.monedario.cl`, decide en el brief/plan cómo
  cubrir ambos (filtro por lista o normalización) y documéntalo; no asumas que no
  existe `www`.

- **Si Opción B** — mueve el query a `zones(filter: { zoneTag: $zoneTag })`
  reusando `zoneId` (ya se pasa a `fetchDailyTraffic`). Cambia la firma a
  `fetchRumWebVitals(token, zoneTag, fromDt, toDt)` y en `main` pásale `zoneId`
  en vez de `accountId`. Ajusta el `data.viewer.zones[0]?...` en el return.

**Verify**:
- `node --check scripts/data-signals/cloudflare-fetch.mjs` → exit 0.
- `grep -n "requestHost\|zones(filter\|SITE_HOST\|CLOUDFLARE_SITE_HOST" scripts/data-signals/cloudflare-fetch.mjs`
  → muestra el filtro de hostname/zona añadido.

### Step 3: Conservar `sanitizeRumRoutes` como defensa en profundidad

No elimines la llamada a `sanitizeRumRoutes` en `main` (línea ~243). Sigue siendo
útil: descarta rutas de monedario que ya no existen (404 históricos, typos). El
fix del Step 2 elimina la contaminación cross-hostname *en origen*; el allowlist
queda como segunda capa. Verifica que `normalizeRumRow` sigue devolviendo el
mismo shape (`{ path, count, clsP75, inpP75Ms, lcpP75Ms }`) para no romper el
consumo aguas abajo.

**Verify**: `grep -n "sanitizeRumRoutes" scripts/data-signals/cloudflare-fetch.mjs`
→ la llamada sigue presente en `main`.

### Step 4: Tests

Como el query GraphQL hace red, no se testea contra la API. Testea la lógica que
sí es determinista: el armado del query con el hostname/zona correctos.
Refactoriza lo mínimo para hacer testeable el armado del query (p. ej. exporta
una función pura que construya el string/variables del query, o testea que
`fetchRumWebVitals` pasa el `host`/`zoneTag` correcto mockeando `gql`).

Escribe los tests en `tests/scripts/cloudflare-rum-query.test.ts` (nuevo),
modelado estructuralmente sobre `tests/scripts/rum-sanitizer.test.ts`. Casos:
- El query/variables incluye el hostname objetivo (`monedario.cl`) o el `zoneTag`,
  según la opción elegida (caso positivo — la aserción central del fix).
- El return sigue devolviendo `[]` cuando la cuenta/zona no trae grupos (guard
  `?? []`).
- (Si Opción A con `www`) el filtro cubre el/los host esperados.

**Verify**: `pnpm exec vitest run tests/scripts/cloudflare-rum-query.test.ts` →
pasa, con ≥1 test nuevo que afirma el hostname/zona en el query.

### Step 5: Verificación integral y cierre

Corre la suite completa y los gates de lint/formato.

**Verify**:
- `pnpm test` → 0 failures.
- `pnpm exec eslint scripts/data-signals/cloudflare-fetch.mjs tests/scripts/cloudflare-rum-query.test.ts` → exit 0.
- `pnpm run format:check` → exit 0 (o solo la excepción preexistente).
- `git status` → solo los archivos en scope modificados/creados.

## Test plan

- **Nuevo**: `tests/scripts/cloudflare-rum-query.test.ts` — afirma que el query
  RUM está scopeado por hostname/zona (la corrección de GROWTH-005), más el guard
  de lista vacía. Modelar sobre `tests/scripts/rum-sanitizer.test.ts`.
- No se añaden tests de red (el query real no se ejercita en CI).
- Verificación: `pnpm exec vitest run tests/scripts/cloudflare-rum-query.test.ts`
  → todos pasan, incluidos los nuevos.

## Done criteria

Todas deben cumplirse (salvo STOP en Step 1 con Opción C, que es cierre por
"no viable — limitación documentada"):

- [x] Step 1 resuelto por escrito (opción A / B / C con evidencia del schema).
- [x] `fetchRumWebVitals` scopea el RUM a `monedario.cl` (por `requestHost` o por
  zona), verificable con `grep`.
- [x] `sanitizeRumRoutes` sigue llamándose en `main` (defensa en profundidad).
- [x] `normalizeRumRow` conserva el shape `{ path, count, clsP75, inpP75Ms, lcpP75Ms }`.
- [x] `tests/scripts/cloudflare-rum-query.test.ts` existe y afirma el hostname/zona.
- [x] `pnpm test` → 0 failures.
- [x] `pnpm exec eslint <archivos en scope>` → exit 0; `format:check` → exit 0.
- [x] `git status`: no hay archivos fuera de scope modificados.
- [x] Fila de este plan actualizada en `plans/README.md`.

## STOP conditions

Detente y reporta (no improvises) si:

- **Step 1 = Opción C**: el dataset `rumWebVitalsEventsAdaptiveGroups` no expone
  ninguna dimensión/filtro de hostname ni un path a nivel de zona. NO añadas un
  campo inventado al `filter` (Cloudflare puede ignorarlo o errorar). El
  entregable pasa a ser un reporte de "GROWTH-005 no es cerrable a nivel de query
  GraphQL; requiere otra vía (p. ej. Web Analytics site tokens por sitio, o
  separar el RUM por site token)" — eso es información valiosa para el
  mantenedor, no un fracaso.
- **No puedes verificar el schema** (sin credenciales y sin doc concluyente):
  para y pide al operador que corra la introspección con `CLOUDFLARE_ANALYTICS_TOKEN`.
- El código en "Estado actual" no coincide con el vivo (drift): revalida antes de
  tocar nada.
- El fix te empuja a cambiar el shape de `rumRows` o a tocar el generador del
  scorecard (fuera de scope): para y reporta.

## Maintenance notes

- Este fix corrige la contaminación **en origen**. Tras desplegarlo, la primera
  semana de RUM ya filtrada NO es comparable con las semanas previas para rutas
  compartidas (`/`): las series históricas de esas rutas mezclaban hostnames.
  Anota el corte en el scorecard/README de operaciones para que nadie compare
  pre/post como si fuera la misma serie.
- Un revisor debe escrutar: (1) que el nombre del campo de hostname sea el que el
  schema realmente expone (no adivinado); (2) que `sanitizeRumRoutes` siga
  presente; (3) que el shape de `rumRows` no cambió; (4) que el hostname no quede
  hardcodeado disperso sino en una constante/env única.
- Relación con el brief 045: cerrar este plan tacha el 4º ítem del checklist de
  verificación de baseline (`GROWTH-005 cerrado para rutas compartidas`) en
  `docs/reports/GROWTH-DIRECTION-DELTA-2026-W27.md` §4. Hasta entonces, el RUM de
  rutas compartidas no debe usarse para decidir producto.
- Relación con el plan 046: su premisa usa rutas **únicas** de monedario (no
  contaminadas), así que no depende de este fix; pero cualquier métrica de
  recurrencia sobre rutas compartidas sí lo requiere.
