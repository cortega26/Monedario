# Plan 072: Tests de las ramas del fetch handler del analytics collector

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- workers/analytics-collector/src/index.ts tests/workers/analytics-collector/schema.test.ts`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.
> NOTA: si el plan 059 se ejecutó antes, `ingestEvent`/`checkRateLimit` loguean
> errores — reconcilia los tests de fallo KV con esa versión (el caso 429 no cambia).

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: 059 (opcional — los tests de fallo KV se adaptan a la versión logueada)
- **Category**: tests (worker)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

El fetch handler de `analytics-collector` tiene ~12 ramas de guard
(OPTIONS 204, GET export, disabled 503, no-POST 405, Origin 403, Content-Type
415, Content-Length 413, body 413, JSON inválido 400, payload inválido 422,
rate-limit 429, ingesta 202) y la suite solo ejercita el camino feliz (202) y
el export manual. El rate-limit (control anti-DoS del worker), la verificación
de origen y los guards de tamaño pueden romperse o relajarse y desplegarse
sin que ningún test falle. Este plan parametriza los ~12 caminos.

## Estado actual

- `workers/analytics-collector/src/index.ts:889-975`: el handler `fetch`
  (cadena lineal de guards, ver excerpt en "Por qué importa" del plan 059 —
  lee el archivo para las líneas exactas).
- `tests/workers/analytics-collector/schema.test.ts` (1172 líneas): `MockKV`
  (Map interno), `vi`, y llamadas a `analyticsCollector.fetch(request, env)`
  con `Request` fabricados — patrón a seguir.
- Constantes relevantes: `MAX_BODY_SIZE` (wrangler var 2048),
  `RATE_LIMIT_MAX` (30), `ALLOWED_ORIGIN = "https://monedario.cl"`.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests del worker | `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` | todos pasan |
| Typecheck worker | `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` | exit 0 |
| Suite completa | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `tests/workers/analytics-collector/schema.test.ts` (casos nuevos)

**Fuera de alcance** (NO tocar):
- `workers/analytics-collector/src/index.ts` (ningún cambio de código productivo)
- La taxonomía de eventos, el export (`runExport` ya está cubierto)

## Git workflow

- Rama: `advisor/072-analytics-fetch-branches`
- Commit: `test(analytics): cubrir ramas del fetch handler (guards HTTP)`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Leer el handler y armar el mapa de casos

Lee `index.ts:889-975` y anota para cada rama: condición exacta, status,
headers. Verifica qué constantes se importan para los asserts
(`MAX_BODY_SIZE`, `RATE_LIMIT_MAX`, `ALLOWED_ORIGIN`) — los tests deben usar
las constantes exportadas, no literales.

**Verificar**: `grep -n "export const" workers/analytics-collector/src/index.ts | grep -E "MAX_BODY_SIZE|RATE_LIMIT_MAX|ALLOWED_ORIGIN"` → exportadas (para importarlas en el test).

### Paso 2: Tabla de casos de guard

Agrega a `schema.test.ts` un bloque `describe("fetch handler — guards HTTP")`
con un helper `post(requestInit, env)` que arma `Request("https://monedario.cl/api/analytics/event", init)` + `env` (reutiliza el `env` de los tests existentes). Casos (uno por rama, assert de status + headers CORS):

1. `OPTIONS` → 204.
2. `GET /api/analytics/export` → delega al export (status del export — usa el mock de KV/R2 de los tests existentes o asume 401/403 con secret ausente: el status concreto lo fija el caso ya existente de export; si ya hay test, salta esta rama).
3. `env.ANALYTICS_DISABLED = "1"` → 503.
4. `PUT` → 405.
5. Header `Origin: https://evil.example` → 403.
6. `Content-Type: text/plain` → 415.
7. `Content-Length: 99999` → 413 (sin body).
8. Body de 99999 chars → 413 (tras Content-Length omitido).
9. Body `"not json"` → 400.
10. JSON válido pero payload inválido (`{"foo":1}`) → 422.
11. Rate-limit alcanzado: MockKV pre-poblado con la clave `rate_limit:<ip>:<minuto>` = String(RATE_LIMIT_MAX) → 429. (Calcula la clave igual que `checkRateLimit`: `rate_limit:${ip}:${Math.floor(Date.now()/60_000)}` — el ip default "unknown" si no hay headers CF.)
12. POST válido → 202.

Nota sobre el orden: los guards se evalúan en secuencia — arma cada request
para que pase los guards anteriores (p. ej. el caso 422 necesita Content-Type
json, tamaño ok y Origin correcto o ausente).

**Verificar**: `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` → todos pasan, incluidos los nuevos (conteo crece).

### Paso 3: Tests de fallo de infraestructura (si el plan 059 no los cubrió)

Si `ingestEvent`/`checkRateLimit` no tienen tests de fallo KV (revisa si el
plan 059 se ejecutó: busca `console.error` en el catch):

1. KV cuyo `put` lanza → POST válido devuelve 202 (fail-open) y no crashea.
2. KV cuyo `get` lanza (rate-limit) → 202 (fail-open).

Modela un `ThrowingKV` extendiendo `MockKV` con override de `put`/`get`.

**Verificar**: mismo comando → todos pasan.

### Paso 4: Gates finales

**Verificar**:
- `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `git status` → solo el archivo de test en alcance

## Test plan

- ~12 casos de guard + 2 de fallo KV (si aplica), modelados sobre el patrón
  `fetch(request, env)` existente.
- Sin red: todas las dependencias externas (KV, R2) son mocks locales.

## Done criteria

- [ ] Un test por rama del handler (204/405/403/415/413×2/400/422/429/202; 503 si el env lo permite)
- [ ] Casos de fallo KV (202 con log o fail-open según versión del 059)
- [ ] `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` exit 0
- [ ] `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Algún guard usa una condición que no se puede ejercitar con `Request`
  fabricados (p. ej. depende de la binding de KV en `env`) — reporta la rama,
  no la saltes en silencio.
- Los casos existentes ya cubren alguna rama (no dupliques — verifica con
  `grep -n "429\|415\|413\|405" schema.test.ts`).
- Un caso nuevo revela un bug real (status inesperado): reporta el hallazgo
  con el diff de comportamiento — NO cambies el código productivo en este plan.

## Maintenance notes

- Cada guard nuevo del handler debe venir con su caso aquí — la tabla es el
  contrato HTTP del endpoint público.
- El plan 059 (si se ejecutó) cambió el logging interno: los tests de fallo KV
  del Paso 3 deben afirmar la versión vigente (202 + log o 202 silencioso).
- En review: verificar que los asserts de status usan las constantes
  exportadas y no literales duplicados.
