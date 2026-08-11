# Plan 080: Unificar formateadores CLP en las calculadoras y guardar la divergencia

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- src/pages/calculadoras src/utils/formatCLP.ts scripts/check-no-postid-urls.mjs`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P3
- **Effort**: S–M
- **Risk**: MED
- **Depends on**: none (NO incluye el refactor a `CalculatorShell` — fuera de alcance)
- **Category**: tech-debt (duplicación de formato)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

Cada calculadora redefine su formateador CLP: ~13 páginas definen
`const fmt`/`const fmtClp = (n) => "$" + Math.round(n).toLocaleString("es-CL")`
— byte-idénticos a `src/utils/formatCLP.ts`, que solo 1 archivo de
calculadoras importa — y **dos son divergentes**: `iva.astro:301`
(`"$" + n.toLocaleString("es-CL")` **sin** `Math.round`) y
`gratificacion-legal.astro:27` (idem). El mismo número puede renderizar con
decimales en IVA/gratificación y redondeado en el resto — y cada página nueva
copia el patrón de nuevo. Este plan migra las definiciones a `formatCLP`,
corrige las dos divergentes y agrega un guard de estilo (patrón
`check-no-postid-urls.mjs`) que impide formateadores inline nuevos. El
refactor mayor (shell compartida de calculadoras) queda como decisión
separada.

## Estado actual

- `src/utils/formatCLP.ts:2-3`:
```ts
export function formatCLP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}
```
- Sitios divergentes (sin Math.round — el bug):
  - `src/pages/calculadoras/iva.astro:301`: `const fmt = (n: number) => "$" + n.toLocaleString("es-CL");`
  - `src/pages/calculadoras/gratificacion-legal.astro:27`: `const fmt = (n: number) => "$" + n.toLocaleString("es-CL");`
- Definiciones redundantes (con Math.round, equivalentes a formatCLP): ~13
  sitios — `apv.astro:31,618`, `boleta-honorarios-liquido.astro:20`,
  `actualizador-inflacion.astro:317`, `comisiones-afp.astro:340`,
  `conversor-uf.astro:397`, `conversor-utm.astro:408`,
  `credito-consumo.astro:22,393`, `deposito-a-plazo.astro:398`,
  `dividendo-hipotecario.astro:28,441`, `impuesto-segunda-categoria.astro:29,405`,
  `interes-compuesto.astro:413`, `gratificacion-legal.astro:413`, etc.
  (verificar con grep — el inventario real manda).
- Expresiones inline de un solo uso `"$" + Math.round(x).toLocaleString("es-CL")`
  (p. ej. `conversor-uf.astro:66`, `conversor-utm.astro:70`) — equivalentes,
  se pueden migrar o dejar; el guard NO las prohíbe.
- Ejemplar de guard de estilo: `scripts/check-no-postid-urls.mjs`
  (arreglo declarativo de reglas regex + recorrido de `src/pages|components|layouts`).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Inventario | `grep -rn 'const fmt\|const fmtClp\|"\$" + ' src/pages/calculadoras/*.astro` | lista real |
| Guard | `node scripts/check-no-inline-clp-formatters.mjs` | exit 0 |
| Typecheck | `pnpm run astro check` | 0 errores (hint preexistente no es tuyo) |
| Tests | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `src/pages/calculadoras/*.astro` (solo las definiciones de formateador)
- `scripts/check-no-inline-clp-formatters.mjs` (nuevo)
- `tests/scripts/check-no-inline-clp-formatters.test.ts` (nuevo)
- `package.json` (script `check:no-inline-clp-formatters` + inclusión en `check`)

**Fuera de alcance** (NO tocar):
- El refactor a `CalculatorShell` (decisión separada — Maintenance)
- Las expresiones `"$" + Math.round(...)` inline de un solo uso (equivalentes; el guard las permite)
- `src/utils/formatCLP.ts` (es el destino, no cambia)
- `src/utils/sueldo-liquido/*` (ya usan formatCLP)

## Git workflow

- Rama: `advisor/080-clp-formatter-unify`
- Commit: `refactor(calculadoras): unificar formateadores CLP en formatCLP + guard de estilo`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Inventario exacto

**Verificar**: `grep -rn 'const fmt\|const fmtClp' src/pages/calculadoras/*.astro` → anota la lista completa (esperado ~15-20 sitios). Si hay >30, STOP y reporta.

### Paso 2: Migrar las definiciones a `formatCLP`

Para CADA archivo del inventario:
1. Importa `formatCLP` (mira si el archivo ya importa de `@/utils/...` — usa el alias `@/utils/formatCLP`).
2. Reemplaza la definición `const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CL")` (y `fmtClp`) por un alias simple:
   `const fmt = formatCLP;` (o `const fmtClp = formatCLP;`) — conserva el nombre local para no tocar los call sites.
3. En los sitios divergentes (`iva.astro:301`, `gratificacion-legal.astro:27`): el alias `formatCLP` **corrige** el redondeo faltante — este es el cambio de comportamiento intencional del plan.
4. En los sitios con `return "$" + Math.round(n).toLocaleString("es-CL");` dentro de funciones (p. ej. `credito-consumo.astro:393`): reemplaza el `return` por `return formatCLP(n);` y elimina la definición local si era la única función.
5. NO toques las expresiones inline `"$" + Math.round(x).toLocaleString(...)` de un solo uso (no son definiciones).

**Verificar**: 
- `grep -rn 'const fmt\|const fmtClp' src/pages/calculadoras/*.astro` → solo `const fmt = formatCLP;`-style (sin `toLocaleString` en la definición).
- `grep -rn '"\$" + n.toLocaleString' src/pages/calculadoras/` → sin matches (las dos divergentes corregidas).
- `pnpm run astro check` → 0 errores (o solo el hint preexistente).

### Paso 3: Guard de estilo

`scripts/check-no-inline-clp-formatters.mjs` (patrón `check-no-postid-urls.mjs`: reglas declarativas + recorrido de archivos):
```js
const RULES = [
  {
    id: "inline-clp-formatter-def",
    message: "Formateador CLP inline prohibido: usa formatCLP (src/utils/formatCLP.ts).",
    regex: /const\s+(?:fmt|fmtClp)\s*=\s*(?:\([^)]*\)\s*=>\s*)?"\$"/g,
  },
  {
    id: "divergent-clp-no-round",
    message: "Formato CLP sin Math.round prohibido: usar formatCLP.",
    regex: /(?<!Math\.round\()"\$"\s*\+\s*\w+(?:\.\w+)?\.toLocaleString\("es-CL"/g,
  },
];
```
recorre `src/pages/calculadoras/**/*.astro` (+ `src/components/calculator/**/*.astro`
si aplica) y falla con `archivo:regla` al primer match (reporta todos).

**Verificar**: `node scripts/check-no-inline-clp-formatters.mjs` → exit 0 sobre el repo migrado.

### Paso 4: Tests del guard

`tests/scripts/check-no-inline-clp-formatters.test.ts` (fixtures en temp dir;
el guard debe aceptar env `NO_INLINE_CLP_ROOT` con default al repo — patrón de
los planes 068/069):
1. Fixture con `const fmt = (n) => "$" + n.toLocaleString("es-CL")` → exit 1 (rule 2).
2. Fixture con `const fmtClp = (n) => "$" + Math.round(n).toLocaleString("es-CL")` → exit 1 (rule 1 — inline def).
3. Fixture sin formateadores → exit 0.
4. Fixture con `formatCLP(x)` y `"$" + Math.round(x).toLocaleString(...)` inline → exit 0 (no prohibido).

**Verificar**: `pnpm exec vitest run tests/scripts/check-no-inline-clp-formatters.test.ts` → todos pasan.

### Paso 5: Cablear y gates finales

- `package.json`: `"check:no-inline-clp-formatters": "node scripts/check-no-inline-clp-formatters.mjs"` y agrégalo a la cadena de `check` (junto a check:no-postid-urls).
- **Verificar**:
  - `pnpm run check:no-inline-clp-formatters` → exit 0
  - `pnpm test` → todos pasan
  - `pnpm run format:check` → exit 0
  - `pnpm run lint` → exit 0
  - `git status` → solo archivos en alcance

## Test plan

- 4 casos del guard (Paso 4).
- La suite existente (incluidos los tests de las calculadoras si existen,
  p. ej. `tests/application`/`homepage-content.test.ts`) debe pasar sin
  cambios — el output renderizado no cambia salvo en iva/gratificación con
  decimales (ese es el fix, no una regresión).

## Done criteria

- [ ] Sin definiciones `const fmt/fmtClp` con `toLocaleString` en `calculadoras` (solo aliases de formatCLP)
- [ ] `iva.astro:301` y `gratificacion-legal.astro:27` corregidos (ahora redondean)
- [ ] Guard nuevo en `package.json` y en `check`
- [ ] 4 tests del guard pasando; `node scripts/check-no-inline-clp-formatters.mjs` exit 0
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- El output renderizado de alguna página NO está en alcance (p. ej. una
  calculadora usa un formateador en un contexto de input donde `Math.round`
  rompería la edición) — verifica que los formateadores migrados son solo de
  **salida**; si encuentras un formateador de input con `"$"`, no lo migres y
  repórtalo.
- `gratificacion-legal.astro:27` es un formatter de entrada (no de salida) —
  mismo tratamiento: reporta.
- El guard nuevo false-positivéa sobre el repo migrado (regex demasiado
  amplia) — ajusta la regex, no el código.
- El refactor a `CalculatorShell` aparece como paso "obvio" — NO: es una
  decisión aparte con riesgo sobre páginas en freeze de medición.

## Maintenance notes

- Regla: formateadores CLP de salida SOLO vía `formatCLP`; el guard lo impone.
- El refactor a `CalculatorShell` (absorber JSON-LD/trust badge/breadcrumb en
  un layout compartido) queda como candidato futuro — las páginas bajo freeze
  OBS-01 (4 journeys) deben excluirse de ese refactor hasta el cierre de
  ventana.
- Si `formatCLP` algún día cambia (p. ej. formato oficial con 2 decimales),
  los tests del plan 071 fijan el contrato y este plan garantiza que el
  cambio aplica a todas las calculadoras de una vez.
- En review: verificar que los alias `const fmt = formatCLP;` no quedaron
  huérfanos (call sites intactos) y que no se tocó ningún renderizado de
  ejemplo calculado.
