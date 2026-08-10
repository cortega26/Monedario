# Plan 068: Tests de caracterización para `check-frontmatter.mjs` (el gate editorial más grande)

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- scripts/check-frontmatter.mjs tests/scripts/`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.
> NOTA: el plan 067 puede haber agregado una regla `seoTitle` a este script —
> si `tests/scripts/check-frontmatter.test.ts` ya existe, reconcilia (no dupliques).

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: 067 (opcional — solo si su regla seotitle ya está en el script)
- **Category**: tests (gate editorial)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

`scripts/check-frontmatter.mjs` (~700 líneas) es un gate CI obligatorio
(`package.json:30`, corre en `ci.yml`): TITLE_RANGE, DESCRIPTION_RANGE,
DEPRECATED_FIELDS, allowlist de categorías, cluster/topic-role policy,
`lang: es-CL`, reglas advisory e imágenes inline. **No tiene ningún test**
(`grep -l check-frontmatter tests/` → vacío). El único "test" con nombre
similar, `tests/scripts/frontmatter-schema.test.ts`, prueba el **parser js-yaml**
(comportamiento de la librería), no las reglas del script — confianza falsa
bajo un nombre engañoso. Cualquier regla del gate puede romperse, relajarse o
borrarse sin que nada falle, en el gate que protege la totalidad del
frontmatter de los posts YMYL.

## Estado actual

- `scripts/check-frontmatter.mjs:20-24`:
```js
const TITLE_RANGE = { min: 20, max: 110 };
const DESCRIPTION_RANGE = { min: 120, max: 200 };

const DEPRECATED_FIELDS = [
  "pubDatetime",
  "modDatetime",
  "canonicalURL",
  "ogImage",
];
```
- `:10-13`: `BLOG_DIR = path.join(REPO_ROOT, "src", "data", "blog")` — el script
  escanea el directorio real (verificar si acepta env para el root; si no,
  el test puede escribir fixtures **temporales** y copiar... NO — ver STOP).
- `tests/scripts/frontmatter-schema.test.ts:4-40`: asserts sobre js-yaml
  (block scalars, arrays, fechas).
- Patrón de tests de scripts existente y a seguir:
  `tests/scripts/check-obs01-freeze.test.ts` (fixtures en `mkdtempSync` +
  `spawnSync("node", [SCRIPT], { env })` con variables de entorno para inyectar
  paths/changed-files).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests de scripts | `pnpm exec vitest run tests/scripts` | todos pasan |
| Suite completa | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `tests/scripts/check-frontmatter.test.ts` (nuevo)
- `tests/scripts/frontmatter-schema.test.ts` (renombrar a `yaml-parser.test.ts` o similar y/o repuntar su propósito con un comentario de cabecera — NO borrar sus asserts)
- `scripts/check-frontmatter.mjs` (SOLO si hace falta exponer un hook de test sin cambiar comportamiento: p. ej. leer `process.env.FRONTMATTER_ROOT` para el directorio raíz, con default al actual)

**Fuera de alcance** (NO tocar):
- Las reglas del script (sin cambios de comportamiento)
- `src/data/blog/**` (no escribir fixtures dentro del repo real)
- El plan 067 (regla seotitle) — si no existe aún su test, no lo escribas aquí

## Git workflow

- Rama: `advisor/068-frontmatter-characterization`
- Commit: `test(editorial): caracterización de check-frontmatter.mjs (6 clases de reglas)`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Verificar el modo de testeo viable

Lee `scripts/check-frontmatter.mjs` completo y determina:
- ¿Acepta `process.env` para localizar `BLOG_DIR`? 
- Si NO: agrega un soporte mínimo y retrocompatible:
```js
const BLOG_DIR = process.env.FRONTMATTER_ROOT
  ? path.resolve(process.env.FRONTMATTER_ROOT)
  : path.join(REPO_ROOT, "src", "data", "blog");
```
(comportamiento idéntico sin env; el cambio es aditivo y no altera reglas).
También verifica si el script imprime con `console.error`/`exit 1` — el test
asertará sobre `status` y `stderr`.

**Verificar**: `node scripts/check-frontmatter.mjs` sin env → exit 0 (sobre el repo actual).

### Paso 2: Escribir los fixtures y el harness

`tests/scripts/check-frontmatter.test.ts` con el patrón de
`check-obs01-freeze.test.ts`:
- helper `writePost(root, filename, frontmatterYaml)` que escribe
  `{root}/<slug>.md` con `---\n<yaml>\n---\n# Title\n\nBody.` 
- helper `run(root)` → `spawnSync("node", [SCRIPT], { env: { ...process.env, FRONTMATTER_ROOT: root }, encoding: "utf8" })`
- `afterEach` limpia los temp dirs.

Cubre 6 clases de reglas (PASS/FAIL cada una):

1. **TITLE_RANGE**: título de 15 chars → exit 1; título de 80 → exit 0.
2. **DEPRECATED_FIELDS**: frontmatter con `pubDatetime` → exit 1 y mensaje
   "Deprecated field".
3. **Categoría no permitida**: `category: cocina` (fuera de `ALLOWED_CATEGORIES`)
   → exit 1.
4. **`lang`**: sin `lang: es-CL` (si la regla exige presencia) → exit 1; con
   `lang: es-CL` → exit 0. (Verifica primero si la regla existe y su forma
   exacta en el script — adapta el caso a la regla real).
5. **Regla advisory** (si el script distingue severidad): un caso que dispare
   warning → exit 0 (no bloquea) con el texto del warning en stderr.
6. **Descripción corta**: `description` < 120 chars → exit 1.

Además: un post totalmente válido (mínimo realista: title, description, slug,
pubDate, category válida, lang) → exit 0 (caso canario — si esto falla, las
reglas que exige el script no son las asumidas: STOP y reporta).

**Verificar**: `pnpm exec vitest run tests/scripts/check-frontmatter.test.ts` → todos pasan.

### Paso 3: Repuntar `frontmatter-schema.test.ts`

Renombra el archivo a `tests/scripts/yaml-parser.test.ts` (git mv) y actualiza
su cabecera/comentarios para decir que valida el parser js-yaml, no las reglas
del gate (que viven en `check-frontmatter.test.ts`). No cambies los asserts.

**Verificar**: `pnpm exec vitest run tests/scripts/yaml-parser.test.ts` → todos pasan.

### Paso 4: Gates finales

**Verificar**:
- `pnpm exec vitest run tests/scripts` → todos pasan
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `node scripts/check-frontmatter.mjs` → exit 0 (sin env — el repo real sigue limpio)
- `git status` → solo archivos en alcance

## Test plan

- ~7 casos (6 clases + canario) en `tests/scripts/check-frontmatter.test.ts`.
- Patrón estructural: `check-obs01-freeze.test.ts` (spawn + env + fixtures).
- Sin red, sin mutar el repo real, sin cambiar reglas.

## Done criteria

- [ ] `tests/scripts/check-frontmatter.test.ts` con ≥7 casos (PASS/FAIL por clase)
- [ ] `FRONTMATTER_ROOT` soportado (o vía de testeo equivalente documentada)
- [ ] `frontmatter-schema.test.ts` renombrado/re-punteado
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- El caso canario (post válido) falla — las reglas reales difieren de lo
  asumido; NO escribas fixtures "al reves" para que pasen: reporta la regla real.
- `check-frontmatter.mjs` escanea otros directorios además de `BLOG_DIR`
  (glosario, etc.) y la vía env no los cubre — extiende el soporte de forma
  equivalente o reporta.
- Alguien (plan 067) ya creó `tests/scripts/check-frontmatter.test.ts`:
  reconcilia agregando tus casos ahí en vez de duplicar el archivo.

## Maintenance notes

- Cada regla nueva del gate DEBE venir con su caso PASS/FAIL aquí — esta suite
  es el contrato de comportamiento del frontmatter.
- El hook `FRONTMATTER_ROOT` es aditivo: si el script se refactoriza a
  módulos, los tests deben sobrevivir al refactor (siguen siendo black-box).
- En review: verificar que ningún test depende de la ruta absoluta del repo
  (solo de los temp dirs) y que `afterEach` limpia.
