# Plan 067: Tests y enforcement del mecanismo `seoTitle` (título SERP ≤ 65, H1 intacto)

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- src/content.config.ts src/layouts/PostDetails.astro scripts/check-frontmatter.mjs src/pages/glosario/`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests + seo governance
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

El commit `c7bf4832` (2026-08-10) introdujo `seoTitle` (override de
`<title>`/meta para SERP, H1 intacto) aplicado a 41 posts — el camino SERP más
importante del sitio. **Cero tests y cero enforcement**: el esquema permite
`seoTitle.max(70)` (por encima del presupuesto de 65 chars que motivó el
feature), `check-frontmatter.mjs` no valida `seoTitle`, y ningún test asegura
la relación `<title>`/`<h1>` — la clase exacta de regresión que motivó el
feature (títulos desacoplados del H1, incidente del título de seguro-cesantia
y PR #354 revertido). Este plan fija el presupuesto en el esquema, valida en
el gate editorial y prueba la resolución del título.

## Estado actual

- `src/content.config.ts:43-46` (posts):
```ts
        // Optional SEO title override for <title>/meta only. ...
        seoTitle: z.string().trim().min(1).max(70).optional(),
```
- `src/content.config.ts:323` (glosario): `seoTitle: z.string().trim().min(1).max(70).optional(),`
- `src/layouts/PostDetails.astro:109`:
```ts
  title: seoTitle ?? `${title} | ${SITE.title}`,
```
  (si `seoTitle` existe, se usa tal cual — sin sufijo " | Monedario"; el H1
  siempre renderiza `title` del frontmatter).
- `src/pages/glosario/[slug].astro:27,59`: mismo patrón para glosario.
- `scripts/check-frontmatter.mjs:20`: `const TITLE_RANGE = { min: 20, max: 110 };`
  valida solo `title`. `grep seoTitle scripts/` → sin matches.
- `grep -rln "seoTitle" tests/` → solo `src/content.config.ts` (cero tests).
- El `seoTitle` más largo aplicado hoy: 63 chars (bajo 65).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests del gate | `pnpm exec vitest run tests/scripts` | todos pasan |
| Check frontmatter | `node scripts/check-frontmatter.mjs` | exit 0 con los posts actuales |
| Suite completa | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `src/content.config.ts` (solo los `.max(70)` de `seoTitle`)
- `scripts/check-frontmatter.mjs` (regla nueva)
- `tests/scripts/check-frontmatter.test.ts` (nuevo — con fixtures)
- `tests/unit/` o `tests/integration/`: test de la resolución de título
- Los 41 posts con `seoTitle` (solo si algún valor viola la regla nueva — verifica primero)

**Fuera de alcance** (NO tocar):
- `src/layouts/PostDetails.astro` y `glosario/[slug].astro` (la lógica de resolución es correcta — solo se prueba)
- Los títulos `title` de los posts (no cambiar contenido)
- El mecanismo `seoTitle` en sí

## Git workflow

- Rama: `advisor/067-seotitle-tests`
- Commit: `feat(seo): enforce seoTitle ≤ 65 chars y testear resolución title/H1`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Fijar el presupuesto en el esquema

En `src/content.config.ts`, cambia ambos `.max(70)` de `seoTitle` (posts `:46`
y glosario `:323`) a `.max(65)`.

**Verificar**: `grep -n "seoTitle" src/content.config.ts` → ambos `.max(65)`.
`pnpm exec vitest run tests/config` (o el test que cubre content.config — busca
con `grep -rln "content.config" tests/`) → todos pasan.

### Paso 2: Verificar que los 41 posts actuales cumplen

**Verificar**: `node scripts/check-frontmatter.mjs` → exit 0. Si algún post
violara 65, se detectaría en el Paso 3 — el conteo actual máximo es 63, así
que no debería fallar.

### Paso 3: Regla nueva en `check-frontmatter.mjs`

En `scripts/check-frontmatter.mjs`, agrega (junto a TITLE_RANGE):
```js
const SEO_TITLE_MAX = 65;
```
y en el bucle de validación por archivo, para `frontmatter.seoTitle`:
- si está presente: longitud > `SEO_TITLE_MAX` → error
  `seoTitle "${value}" is ${len} chars (max ${SEO_TITLE_MAX}).`
- si contiene `| Monedario` (case-insensitive) → error
  `seoTitle must not duplicate the "| Monedario" suffix (Layout lo añade solo para title).`

**Verificar**: `node scripts/check-frontmatter.mjs` → exit 0 (los 41 valores cumplen).

### Paso 4: Tests del gate (fixtures)

`tests/scripts/check-frontmatter.test.ts` (nuevo, patrón de
`tests/scripts/check-obs01-freeze.test.ts`: fixture en temp dir + `spawnSync`
de `node scripts/check-frontmatter.mjs` con `FRONTMATTER_ROOT`-style env si el
script lo soporta; si no soporta env para el root, verifica cómo localiza
`BLOG_DIR` y usa el patrón que permita apuntar a un fixture — NO cambies el
script para testearlo si hay una vía más simple):

1. post con `seoTitle` de 66 chars → exit 1, mensaje contiene `max 65`.
2. post con `seoTitle` que contiene `| Monedario` → exit 1.
3. post normal (sin seoTitle) → exit 0.
4. post con `seoTitle` de 63 chars → exit 0.

**Verificar**: `pnpm exec vitest run tests/scripts/check-frontmatter.test.ts` → todos pasan.

### Paso 5: Test de la resolución title/H1

Extrae la resolución a una función pura testeable en `src/layouts/PostDetails.astro`
(si no está ya en un util): crea `src/utils/seoTitle.ts`:
```ts
export function resolvePostPageTitle(title: string, seoTitle?: string): string {
  return seoTitle ?? `${title} | ${SITE.title}`;
}
```
(importa `SITE` del config de sitio ya usado por Layout). Úsala en
`PostDetails.astro:109` y en `glosario/[slug].astro` (con su default de
glosario si difiere — respeta el default existente de cada layout).
`tests/unit/seoTitle.test.ts`:
1. sin `seoTitle` → `title | Monedario`.
2. con `seoTitle` → exactamente el valor (sin sufijo).
3. `seoTitle` vacío/whitespace → el schema ya lo bloquea (`.trim().min(1)`), pero la función debe tratar `undefined` solo.

**Verificar**: `pnpm exec vitest run tests/unit/seoTitle.test.ts` → todos pasan.
`pnpm run astro check` → 0 errores (o solo el hint preexistente).

### Paso 6: Gates finales

**Verificar**:
- `pnpm test` → todos pasan
- `pnpm run lint` y `pnpm run format:check` → exit 0
- `git status` → solo archivos en alcance

## Test plan

- `tests/scripts/check-frontmatter.test.ts` (4 casos, patrón fixture+spawn de check-obs01-freeze.test.ts).
- `tests/unit/seoTitle.test.ts` (3 casos).
- La verificación de `<title>`/`<h1>` a nivel dist queda delegada al plan 081
  (capa post-build) — no la implementes aquí.

## Done criteria

- [ ] `.max(65)` en ambos `seoTitle` del schema
- [ ] `check-frontmatter.mjs` rechaza >65 y "| Monedario" duplicado
- [ ] `node scripts/check-frontmatter.mjs` exit 0 sobre el repo actual
- [ ] Tests de fixtures (4) y de resolución (3) pasando
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Algún post actual viola la regla nueva (los 41 se midieron ≤63 — si el
  conteo cambió, NO edites títulos por tu cuenta: reporta la lista).
- `check-frontmatter.mjs` no permite apuntar a un root distinto (BLOG_DIR fijo)
  y no hay forma de testearlo con fixtures — en ese caso solo escribe el test
  de la función pura (Paso 5) y anota el gap del gate.
- `SITE.title` no es importable limpio desde un util (ciclo) — usa el literal
  del Layout y anótalo.

## Maintenance notes

- El presupuesto 65 es para el `<title>` renderizado; `seoTitle` se usa sin
  sufijo, por lo que su longitud == longitud del título SERP.
- Si el plan 081 (post-build) se ejecuta, agregarle la aserción: para N posts
  con `seoTitle`, `<title>` del dist == `seoTitle` y `<h1>` == `title`.
- En review: verificar que `resolvePostPageTitle` no cambia el comportamiento
  del glosario (su default puede incluir "Glosario Financiero").
- Regla futura para editores: si un título necesita >65 chars, se edita el
  `title` y el H1 juntos, o se acepta el largo — `seoTitle` no es para eso.
