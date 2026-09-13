# ADR-20260906: analytics body byte limit

Date: 2026-09-06
Status: Accepted

## Context

`POST /api/analytics/event` (worker `analytics-collector`) aplica un límite
local de 2 KB (`MAX_BODY_SIZE = 2048`, `workers/analytics-collector/src/index.ts`).
El límite tiene dos huecos: sin `Content-Length` el Worker lee el cuerpo
completo con `request.text()` antes de rechazarlo, y el guard compara
`text.length` (unidades UTF-16) en vez de bytes, de modo que un cuerpo con
multibyte puede superar los 2 KB retenidos sin ser rechazado.

## Decision

1. El límite se aplica sobre **bytes recibidos del body**, no sobre
   caracteres: la lectura acumula `Uint8Array.byteLength` por chunk hasta MAX.
2. Un cuerpo de **exactamente MAX bytes se acepta** (sigue a validación);
   **MAX+1 bytes se rechaza** con 413 y CORS, cancelando la lectura sin pedir
   los chunks restantes.
3. Los caracteres UTF-8 que cruzan chunks se decodifican correctamente dentro
   de la cota; un cuerpo por encima de MAX bytes pero por debajo de MAX
   caracteres se rechaza con 413. Un 422 del schema nunca se convierte en 400
   por partir una secuencia multibyte.
4. Se conservan el fast reject por `Content-Length` declarado excesivo, el
   orden relativo (lectura → validación → rate limit → agregación) y las
   respuestas CORS/HTTP existentes: 400 para lectura rota, cuerpo vacío o JSON
   inválido; 422 para schema; 202 para ingesta válida. Sin cambios al contrato
   de eventos (`src/contracts/analytics-events.ts`).

## Consequences

- Se completa un límite ya existente con un cambio local verificable; ningún
  rechazo de tamaño toca contadores KV.
- La cota real incluye el chunk ya entregado por el runtime: no se promete
  impedir la asignación de ese chunk antes de recibirlo, solo no retener ni
  seguir leyendo más allá de la cota.
- La cancelación del stream es limpieza best-effort documentada: nunca
  sustituye el 413/400 ni deja un rechazo de Promise sin manejar.

## Alternatives considered

- Mantener `request.text()` + `text.length`: descartado, lee todo el cuerpo
  sin `Content-Length` y mide UTF-16, no bytes.
- Rechazar por `Content-Length` declarado únicamente: descartado, el header
  es declarativo y puede ausentarse (chunked); la lectura real manda.
- Añadir productos antiabuso (fingerprinting, bloqueo): descartado, fuera de
  alcance; el plan solo acota lo retenido/leído.

## Verification

- `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts`
  → exit 0, incl. matriz: cancelación temprana sin cierre del productor,
  202 en MAX bytes exactos / 413 en MAX+1 (bytes via `TextEncoder`),
  UTF-8 multibyte partida decodificada dentro de la cota, 400 sin
  escrituras KV, fast reject de `Content-Length` conservado.
- `pnpm exec tsc -p workers/analytics-collector/tsconfig.json` → exit 0.
- `pnpm run check:docs`, `pnpm run check:context`,
  `pnpm run check:policy-registry` → exit 0.
