# Plan 062: Preservar `<` literales y desincronización de stacks en inline-link-spacing

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- src/integrations/inline-link-spacing.ts tests/unit/inline-link-spacing.test.ts astro.config.ts`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW/MED
- **Depends on**: none
- **Category**: correctness (render)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

La integración `inline-link-spacing` (post-procesa **todos** los `dist/**/*.html`
en cada build) tokeniza con `TAG_OR_TEXT = /(<[^>]*>)|([^<]+)/g`. Verificado
empíricamente: `"a<b"` tokeniza a `["a","b"]` — el `<` **se elimina** del HTML
de salida. Peor: en `"<script>if (a < b) x()</script>"`, el `<` dentro del
script hace que `</script>` se trague en un tag bogus, `excludedStack` nunca
hace pop y el pass se desactiva en silencio para el resto del documento
(además de corromper el bookkeeping `needsSpaceAfterAnchor`). Hoy la
exposición es limitada (Astro escapa los `<` textuales; los `is:inline`
script son JSON-LD), pero el fallo es silencioso y permanente: cualquier `<`
futuro (comparación en un script inline, `set:html`, markdown sin escapar)
corrompe contenido o deriva el pass sin señal. El fix es acotar la
alternativa de tag a formas plausibles y añadir una alternativa final que
conserve el `<` como texto.

## Estado actual

- `src/integrations/inline-link-spacing.ts:34`:
```ts
const TAG_OR_TEXT = /(<[^>]*>)|([^<]+)/g;
```
- El bucle (`:82-130`) usa `const [, tag, text] = match` y trata todo match
  con `tag === undefined` como texto (`:118-129`).
- `EXCLUDED_TAGS` incluye `script`/`style`/`code`/`pre`/`textarea` (`:16`);
  el stack se empuja en apertura y se popea en cierre (`:107-114`).
- `tests/unit/inline-link-spacing.test.ts` (75 líneas): 7 tests de strings
  exactos (puntuación, tags excluidos, idempotencia).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Tests de la integración | `pnpm exec vitest run tests/unit/inline-link-spacing.test.ts` | todos pasan |
| Suite completa | `pnpm test` | todos pasan |
| Typecheck | `pnpm run astro check` | 0 errores (hint preexistente de content.config.ts no es tuyo) |

## Alcance

**En alcance**:
- `src/integrations/inline-link-spacing.ts` (solo el tokenizador y el bucle)
- `tests/unit/inline-link-spacing.test.ts` (tests nuevos)

**Fuera de alcance** (NO tocar):
- `astro.config.ts` (orden de integraciones — no cambia)
- La semántica de spacing (`NEEDS_SPACE_BEFORE_LINK`, `STARTS_WITH_WORD`, las reglas de puntuación)
- `src/integrations/csp-hashes.ts` y `sw-version.ts`

## Git workflow

- Rama: `advisor/062-inline-link-spacing-tokenizer`
- Commit: `fix(render): preservar '<' literal y stacks en inline-link-spacing (tokenizer robusto)`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Endurecer el tokenizador

Reemplaza la constante y el bucle en `src/integrations/inline-link-spacing.ts`:

```ts
// Tag plausible: '<' seguido de letra (apertura/cierre), '/' (cierre) o '!'
// (comentarios/declaraciones). Todo lo demás es texto — incluye '<' literal.
const TAG_OR_TEXT = /(<[a-zA-Z\/!][^>]*>)|([^<]+)|(.)/g;
```
y en el bucle:
```ts
  for (const match of html.matchAll(TAG_OR_TEXT)) {
    const [, tag, text, stray] = match;

    if (tag !== undefined) {
      // ... lógica existente de tags, sin cambios ...
      continue;
    }

    const textPart = text ?? stray;
    if (textPart !== undefined) {
      // ... lógica existente de texto, usando textPart ...
    }
  }
```
Nota: la tercera alternativa `(.)` captura un único carácter (incluido `<`
literal) cuando las dos primeras no matchean. Para HTML bien formado el
comportamiento es idéntico: todo tag con `>` cae en la alternativa 1; todo
texto sin `<` en la 2; la 3 solo se alcanza con `<` huérfano o carácter
sobrante.

**Verificar**: los 7 tests existentes siguen pasando:
`pnpm exec vitest run tests/unit/inline-link-spacing.test.ts` → todos pasan.

### Paso 2: Tests de regresión nuevos

Agrega a `tests/unit/inline-link-spacing.test.ts` (mismo estilo de strings
exactos):

1. `<` literal en texto: `normalizeInlineLinkSpacing('<p>a < b</p>')` → devuelve
   `<p>a < b</p>` (el `<` se conserva).
2. `<` en contenido de script excluido: input con
   `<script>if (a < b) c()</script><p>hola</p>` → el script completo se
   conserva byte-a-byte y el `<p>hola</p>` se procesa (spacing activo después
   del script — el stack de exclusión sí hace pop).
3. `<` en `pre`: `<pre>1 < 2</pre>` intacto.
4. Idempotencia con `<` literal: aplicar dos veces devuelve lo mismo (el
   spacing no añade espacios espurios alrededor del `<`).

**Verificar**: `pnpm exec vitest run tests/unit/inline-link-spacing.test.ts`
→ todos pasan, incluidos los 4 nuevos.

### Paso 3: Gates finales

**Verificar**:
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `pnpm run lint` → exit 0
- `git status` → solo los 2 archivos en alcance

## Test plan

- Tests nuevos (Paso 2) modelados sobre los 7 existentes del archivo
  (strings exactos, sin mocking).
- Casos: `<` literal en párrafo; `<` dentro de script excluido + procesamiento
  posterior; `<` en pre; idempotencia.

## Done criteria

- [ ] `TAG_OR_TEXT` incluye la alternativa `(.)` y el tag requiere `[a-zA-Z\/!]` tras `<`
- [ ] Los 7 tests existentes + 4 nuevos pasan en `tests/unit/inline-link-spacing.test.ts`
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Algún test existente cambia de output tras el Paso 1 (el tokenizador debe
  ser transparente para HTML bien formado — si no lo es, la regex de tag
  está mal y hay que revisarla, no "arreglar" los tests).
- El build (`pnpm run build:ci`) produce diff visible en páginas reales
  (compara `dist/` de una página antes/después con el mismo contenido fuente;
  deben ser idénticos).
- `tagDetails` recibe un tag sin `>` (no debería ocurrir con la regex nueva —
  si ocurre, reporta el caso).

## Maintenance notes

- Esta integración reescribe todo el HTML de salida: cualquier cambio futuro
  en la regex debe volver a pasar por la batería de tests de strings exactos
  y por un build con diff-check de `dist/`.
- El plan 081 (capa post-build) puede agregar una aserción de integridad sobre
  el output de esta integración (p. ej. "ningún `<p>` perdió un `<`") — hasta
  entonces la garantía son los tests unitarios.
- En review: verificar que la alternativa `(.)` no altera el comportamiento de
  `needsSpaceAfterAnchor` (el path de texto ahora recibe `textPart` en vez de
  `text` — mismo tratamiento).
