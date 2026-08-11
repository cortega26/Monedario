# Plan 071: Tests para el endpoint `indicadores-hoy` y `src/utils/indicadores.ts`

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- src/pages/api/indicadores-hoy.json.ts src/utils/indicadores.ts tests/`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests (ruta de dinero)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

`/api/indicadores-hoy.json` alimenta UF/UTM/dólar del día (homepage, badges de
frescura, deltas ▲▼) y **no tiene un solo test**: ni los formateadores
(`fmtDiaMesCorto`, `fmtDelta`, `fmtClp`, `buildDelta`, `buildTitle`) ni
`getIndicadores` (spread condicional del dólar, carry de `prev`). Es la ruta
donde una regresión de locale (p. ej. `toLocaleString("es-CL")` con un
runtime distinto), del null-branch de `prev` o del fallback de fuente
produciría un error visible en la página de dinero sin que CI lo detecte.

## Estado actual

- `src/pages/api/indicadores-hoy.json.ts:19-69` — funciones puras en el módulo
  del endpoint (`fmtDiaMesCorto`, `fmtMesCorto`, `fmtDelta`, `fmtClp`,
  `buildDelta`, `buildTitle`, `OFFICIAL_SOURCES`) + handler `GET`.
- `src/utils/indicadores.ts:31-51` — `getIndicadores()` (usa `getEconomicParameters`).
- `src/utils/indicadores.ts:53-54` — `fmt` deprecated alias de `formatCLP`.
- `src/utils/formatCLP.ts:2-3` — `"$" + Math.round(n).toLocaleString("es-CL")`.
- No existe `tests/utils/indicadores.test.ts` ni tests de `pages/api` (grep).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests nuevos | `pnpm exec vitest run tests/utils/indicadores.test.ts tests/pages/indicadores-hoy.test.ts` | todos pasan |
| Suite completa | `pnpm test` | todos pasan |
| Typecheck | `pnpm run astro check` | 0 errores (hint preexistente no es tuyo) |

## Alcance

**En alcance**:
- `src/pages/api/indicadores-hoy.json.ts` (exportar las funciones puras — sin cambio de comportamiento)
- `src/utils/indicadores.ts` (SOLO si hace falta un export adicional para testear `getIndicadores` con deps inyectadas — ver Paso 3; si no, sin cambios)
- `tests/utils/indicadores.test.ts` y `tests/pages/indicadores-hoy.test.ts` (nuevos)

**Fuera de alcance** (NO tocar):
- `src/utils/formatCLP.ts` (plan 080 cubre la consolidación)
- `getEconomicParameters` y el provider
- `uf-historico-lookup.json.ts` (ya cubierto por tests de LookupHistoricalUf)

## Git workflow

- Rama: `advisor/071-indicadores-hoy-tests`
- Commit: `test(api): cubrir endpoint indicadores-hoy y formateadores`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Exportar las funciones puras del endpoint

En `src/pages/api/indicadores-hoy.json.ts`, agrega `export` a
`fmtDiaMesCorto`, `fmtMesCorto`, `fmtDelta`, `fmtClp`, `buildDelta`,
`buildTitle` (y a `OFFICIAL_SOURCES` si un test lo usa). No cambies su lógica.
Verifica que el archivo `.json.ts` (endpoint estático prerenderizado) sigue
buildando — el export no altera el output.

**Verificar**: `pnpm run astro check` → 0 errores (o solo el hint preexistente).

### Paso 2: Tests de los formateadores

`tests/pages/indicadores-hoy.test.ts` (o `tests/utils/`, según convención de
ubicación — mira si existen tests de `pages/api` en el repo; si no, usa
`tests/utils/`):

1. `fmtClp(1234.5, 0)` → `"$1.235"` (redondeo) y `fmtClp(1234.56, 2)` → `"$1.234,56"` (formato es-CL exacto).
2. `fmtDelta(110, 100)` → `"10"` y `fmtDelta(90, 100)` → `"-10"` (sin signo manual — toLocaleString es-CL).
3. `buildDelta(110, { valor: 100, fecha: "2026-08-01" }, fmtDiaMesCorto)` →
   `{ text: "▲ 10% vs. 1 AGO", direction: "up" }` (verifica el formato exacto contra el código real y usa ese).
4. `buildDelta(90, prev)` → `direction: "down"`.
5. `buildDelta(x, undefined)` → `null`.
6. `buildTitle("uf", "primary", "desc")` → `"Banco Central de Chile — desc"`;
   `buildTitle("utm", ...)` → `"SII — desc"`; `buildTitle("uf", "fallback", ...)` → `"Valor de referencia aproximado"`.
7. `fmtDiaMesCorto("2026-08-01")` → `"1 AGO"` (meses en mayúscula, índice seguro).

### Paso 3: Test de `getIndicadores` (si es factible sin refactor)

Si `getIndicadores` se puede testear mockeando `getEconomicParameters`
(`vi.mock` de `@/application/use-cases/GetEconomicParameters` — verifica que
el alias funciona en vitest, vitest.config.ts ya lo define): 
1. Con `dolar` presente → `indicadores.dolar` definido y `prev.dolar` propagado.
2. Sin `dolar` → la key no existe en `indicadores`.
3. `prev` ausente → `indicadores.prev` ausente (sin crash).

Si el mock del módulo ESM no funciona limpio, exporta un factory opcional
`getIndicadoresWith(loader)` en `src/utils/indicadores.ts` (aditivo, sin
cambiar `getIndicadores` público) y pruébalo con un loader stub. NO
rearquitectes nada más.

**Verificar**: `pnpm exec vitest run tests/utils/indicadores.test.ts` → todos pasan.

### Paso 4: Gates finales

**Verificar**:
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `pnpm run lint` → exit 0
- `git status` → solo archivos en alcance

## Test plan

- ~10 aserciones entre formateadores, delta/título y `getIndicadores`.
- Sin red, sin build: todos los tests son de módulo puro.

## Done criteria

- [ ] Funciones puras exportadas (sin cambio de lógica)
- [ ] Tests de formateadores/delta/title cubriendo los casos listados
- [ ] `getIndicadores` con 3 casos (dolar sí/no, prev ausente)
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Los formatos exactos de string en el código real difieren de los asumidos
  (los tests deben reflejar el comportamiento REAL — verifícalo leyendo las
  funciones antes de escribir las expectativas; el test 3 es el más frágil).
- `vi.mock` sobre el use-case no funciona con el alias `@/` — usa la vía
  factory del Paso 3 (documentada) y anótalo.
- El endpoint deja de prerenderizar con los exports (astro check o build
  falla) — revierte los exports y reporta.

## Maintenance notes

- Si `fmtClp` se consolida con `formatCLP` (plan 080), estos tests fijan el
  contrato de salida — actualizarlos si el consolidado cambia decimales.
- Cualquier indicador nuevo (dólar, IPC en el payload) debe sumar su caso
  aquí: es el contrato de la ruta de dinero.
- En review: verificar que el test de buildTitle cubre el fallback `"fallback"`
  (la ruta de degradación que el sitio muestra cuando la fuente oficial falla).
