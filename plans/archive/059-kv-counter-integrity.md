# Plan 059: Superficie de fallos KV y documentación de aproximación en contadores de analytics

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- workers/analytics-collector/src/index.ts workers/analytics-collector/wrangler.toml tests/workers/analytics-collector/schema.test.ts`
> Si `index.ts` cambió en las zonas citadas, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P1
- **Effort**: S–M
- **Risk**: LOW/MED
- **Depends on**: none
- **Category**: correctness (integridad de datos de decisión)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

Los contadores de eventos (`calculator_complete`, `calculator_view`,
`next_step_*`) se incrementan con read-modify-write sobre KV
(`kv.get` → `parseInt` → `kv.put(count+1)`) sin primitiva atómica. KV es
eventualmente consistente: lecturas pueden devolver un valor stale (el contador
puede *bajar*: 5→4) y dos ingesta concurrentes en la misma clave pierden un
incremento. Además, el `catch {}` en `ingestEvent` **traga en silencio** los
fallos de escritura: cuando KV falla, el evento se pierde sin señal alguna.
Estos contadores alimentan el scorecard semanal y los gates de la validación
utility-led (el foco estratégico vigente); el repo tiene historial documentado
de "jobs que fallan en silencio escribiendo cero". Este plan convierte el
silencio en ruido y deja la aproximación documentada con un ACK explícito.
La migración a Durable Objects (atómico real) queda detrás de una compuerta
humana — no es parte de este plan.

## Estado actual

- `workers/analytics-collector/src/index.ts:308-330` (`checkRateLimit`):
  read-modify-write sobre clave `rate_limit:{ip}:{minute}`, y `catch { return true }`
  (fail-open documentado).
- `workers/analytics-collector/src/index.ts:333-355` (`ingestEvent`):
```ts
  try {
    const current = await kv.get(key);
    const count = current ? parseInt(current, 10) : 0;
    await kv.put(key, String(count + 1), { expirationTtl: KV_TTL_SECONDS });
  } catch {
    // KV write failure: silently drop. We don't have a dead-letter queue at
    // this scale. The export will show a gap if persistent.
  }
```
- `workers/analytics-collector/wrangler.toml` ya tiene `[observability] enabled = true`
  (los `console.error` llegan a Cloudflare Workers Logs).
- `tests/workers/analytics-collector/schema.test.ts` usa un `MockKV` local
  (clase con `Map` interno) y llama `analyticsCollector.fetch(request, env)` —
  patrón a seguir para los tests nuevos.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests del worker | `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` | todos pasan |
| Typecheck del worker | `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` | exit 0 |
| Suite completa | `pnpm test` | todos pasan |
| Lint | `pnpm exec eslint workers/analytics-collector/src/index.ts tests/workers/analytics-collector/schema.test.ts` | exit 0 |

## Alcance

**En alcance**:
- `workers/analytics-collector/src/index.ts`
- `workers/analytics-collector/wrangler.toml` (solo comentario)
- `tests/workers/analytics-collector/schema.test.ts` (tests nuevos)
- `workers/analytics-collector/README.md` (nota de aproximación, si el archivo existe)

**Fuera de alcance** (NO tocar, aunque parezcan relacionados):
- Migrar contadores a Durable Objects o Workers Analytics Engine — es una
  compuerta de decisión humana (ver "Condiciones de STOP").
- `src/contracts/analytics-events.ts`, la taxonomía de eventos, el export semanal.
- Cambiar el fail-open del rate limit (decisión documentada).
- Los otros dos workers.

## Git workflow

- Rama: `advisor/059-kv-counter-integrity`
- Un commit: `fix(analytics): superficializar fallos KV en contadores y documentar aproximación`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Superficializar el fallo de escritura en `ingestEvent`

Reemplaza el `catch {}` de `ingestEvent` (index.ts:347-350) por:
```ts
  } catch (error) {
    // Fail-open (el evento no bloquea la respuesta), pero NUNCA en silencio:
    // un fallo persistente de KV debe ser visible en Workers Logs, no solo
    // como un gap en el export.
    console.error(
      `[analytics-collector] KV write failed for counter ${key}:`,
      error instanceof Error ? error.message : String(error)
    );
  }
```

**Verificar**: `grep -n "silently drop" workers/analytics-collector/src/index.ts`
→ sin matches; `grep -n "console.error" workers/analytics-collector/src/index.ts`
→ ≥1 match dentro de `ingestEvent`.

### Paso 2: Mismo tratamiento en `checkRateLimit`

En el `catch` de `checkRateLimit` (index.ts:324-328), agrega un
`console.error` equivalente (clave `rate_limit:{ip}` truncada — NO loguear la IP
completa: usa solo los primeros octetos o el sufijo de minuto, p. ej. loguea
`suffix = key.split(":").at(-1)`). Mantén el fail-open `return true`.

**Verificar**: `grep -n "console.error" workers/analytics-collector/src/index.ts`
→ ≥2 matches (ingestEvent + checkRateLimit).

### Paso 3: Documentar la aproximación

- En `workers/analytics-collector/wrangler.toml`, en el comentario del bloque
  `# ── KV Namespace ──`, agrega una línea:
  `# Contadores aproximados: read-modify-write no atómico sobre KV eventualmente consistente (ver README).`
- En `workers/analytics-collector/README.md`, agrega una sección corta
  "Precisión de contadores" que diga: los contadores son **aproximados** por
  diseño (KV eventualmente consistente, sin incremento atómico); pueden
  subestimar bajo concurrencia o perder incrementos durante fallos de KV
  (ahora logueados, no silenciosos); para exactitud por evento se evalúa una
  migración a Durable Objects — decisión del operador, no implementada.

**Verificar**: `grep -n "aproximad" workers/analytics-collector/README.md`
→ match; `grep -n "aproximados" workers/analytics-collector/wrangler.toml` → match.

### Paso 4: Tests nuevos

En `tests/workers/analytics-collector/schema.test.ts`, siguiendo el patrón
existente (MockKV + `analyticsCollector.fetch`):

1. **Test: fallo de KV en ingesta no rompe la respuesta y sí loguea** — MockKV
   cuyo `put` lanza (subclase con override), `vi.spyOn(console, "error")`;
   POST válido → status 202, y el spy recibió ≥1 llamada con la clave del
   contador en el mensaje.
2. **Test: rate-limit activo devuelve 429** — MockKV pre-poblado con
   `rate_limit:{ip}:{minuto}` = `30` (el valor de `RATE_LIMIT_MAX`); POST
   válido → status 429.
3. **Test: fallo de KV en rate-limit es fail-open y loguea** — MockKV cuyo
   `get` lanza; POST válido → status 202 (no 500), con spy de console.error.

**Verificar**: `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts`
→ todos pasan, incluyendo los 3 nuevos (el conteo total crece).

### Paso 5: Gates finales

**Verificar**:
- `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` → exit 0
- `pnpm test` → todos pasan
- `pnpm exec eslint workers/analytics-collector/src/index.ts tests/workers/analytics-collector/schema.test.ts` → exit 0
- `pnpm run format:check` → exit 0
- `git status` → solo los archivos en alcance

## Test plan

- Tests nuevos (Paso 4) modelados sobre los casos existentes de
  `schema.test.ts` (que ya ejercita el fetch handler con MockKV).
- Casos: (1) fallo de put → 202 + log, (2) rate-limit alcanzado → 429,
  (3) fallo de get en rate-limit → 202 + log.
- Ningún test existente debe cambiar de expectativa.

## Done criteria

- [ ] `grep -n "silently drop" workers/analytics-collector/src/index.ts` → sin matches
- [ ] `console.error` presente en `ingestEvent` y en `checkRateLimit`
- [ ] README del worker documenta la aproximación de contadores
- [ ] 3 tests nuevos en `schema.test.ts` pasando
- [ ] `npx tsc --noEmit -p workers/analytics-collector/tsconfig.json` exit 0
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta (no improvises) si:

- Para completar el plan necesitas tocar la lógica de agregación del export
  (`runExport`, `aggregateWindow`) — fuera de alcance.
- La migración a Durable Objects aparece como necesaria para "hacer bien" el
  fix — es una compuerta de decisión humana, NO la implementes.
- El README del worker no existe (no lo crees con otra estructura: reporta).
- Un test existente deja de pasar por el cambio de `ingestEvent`.

## Maintenance notes

- El plan 073 (tests de ramas del fetch handler) extiende la misma suite —
  si se ejecuta después de este plan, sus tests de rate-limit pueden
  reutilizar el MockKV con fallo del Paso 4.
- La decisión DO (atomicidad real) debe revisarse cuando el volumen cruce el
  umbral operativo del ADR de KV (consistencia eventual aceptada a la escala
  actual) o cuando el scorecard dependa de exactitud, no de ranking relativo.
- En review: verificar que la IP no se loguea completa en el Paso 2, y que el
  fail-open de rate-limit se conserva (cambio de comportamiento NO autorizado).
