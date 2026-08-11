# Plan 081: Capa de verificación post-build (aserciones sobre `dist/` en el propio build)

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- package.json scripts/ tests/scripts/`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.
> NOTA: este plan asume que 057 (pagefind) y 062 (spacing) ya están en `main`;
> si no, adapta las aserciones marcadas y anótalo.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: 057 (asertión de tamaño pagefind), 062 (asertión de spacing), 065 (asertión JSON-LD), 067 (asertión seoTitle) — las aserciones de cada uno se activan solo si su plan ya está en main; el script debe tolerar la ausencia
- **Category**: tests (verificación de artefacto final)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

Las tres integraciones post-build (inline-link-spacing, csp-hashes, sw-version)
y el mecanismo seoTitle mutan o dependen del HTML final, y **nadie verifica el
artefacto**: solo hay tests de funciones puras y el Playwright de a11y (que no
mira títulos ni headers). Un hook desregistrado, una regex que deja de
matchear o un `_headers` sin hashes despliega un sitio roto con CI verde —
exactamente el modo de falla que la integración CSP existe para prevenir
(script inline bloqueado por la propia CSP). Este plan agrega
`scripts/check-postbuild.mjs`, un validador declarativo del `dist/` final,
ejecutado como último paso de `build`/`build:ci`.

## Estado actual

- `package.json:10-11` — `build` y `build:ci` terminan en
  `pagefind --site dist && ... && cp -r dist/pagefind public/` (+ `check:urls` en build).
- `dist/_headers` — generado en build con los hashes sha256 (verificado: ~13
  tokens hoy) vía `src/integrations/csp-hashes.ts`.
- `dist/sitemap-0.xml` — sitemap de Astro (327 URLs).
- `tests/static-analysis/*.e2e.test.ts` — escanean el source, excluyen dist.
- `tests/integration/csp-hashes.test.ts:16-68` — solo la función `updateHeadersFile`.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Verificador (local) | `node scripts/check-postbuild.mjs dist` | exit 0 sobre un dist reciente |
| Build completo | `pnpm run build:ci` | exit 0 (incluye el nuevo paso) |
| Tests | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `scripts/check-postbuild.mjs` (nuevo)
- `tests/scripts/check-postbuild.test.ts` (nuevo — helpers puros)
- `package.json` (paso final de `build` y `build:ci` + script suelto)

**Fuera de alcance** (NO tocar):
- Las integraciones (sus fixes son los planes 057/062/065/067)
- `ci.yml` (el `build:ci` ya es el gate; no se agregan jobs nuevos)
- LHCI/Playwright (capas distintas)

## Git workflow

- Rama: `advisor/081-postbuild-verification`
- Commit: `feat(ci): verificación declarativa del artefacto post-build (dist/)`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Escribir el verificador

`scripts/check-postbuild.mjs` (recibe el dir por argumento; default `dist`),
estructura declarativa `{ id, message, run(distDir): string[] }` — cada check
devuelve lista de errores, el script imprime `archivo:regla` y exit 1 si hay
alguno (reporta TODOS):

1. **`csp-hashes-injected`** (activo si `dist/_headers` existe): `_headers`
   contiene ≥1 `sha256-` en `script-src` y NO contiene `unsafe-inline` ni
   `strict-dynamic` en `script-src`.
2. **`csp-hashes-dist-consistency`**: si la integración del plan 065 cambió
   algo aquí — NO; este check solo valida (1).
3. **`sitemap-pages-render-noindex-free`**: cada `<loc>` de
   `dist/sitemap-0.xml` (normalizar trailing slash) → el archivo HTML existe
   en `dist` y su contenido NO incluye `content="noindex"`.
4. **`seoTitle-rendered`** (activo si el mecanismo existe): para 3 posts
   conocidos con `seoTitle` (elígelos del frontmatter real: `grep -rl seoTitle
   src/data/blog | head -3` al momento de escribir el plan — anota los slugs
   elegidos en el script como constante), el `<title>` del HTML en dist es
   exactamente el `seoTitle` del frontmatter; y para 1 post sin `seoTitle`, el
   `<title>` termina en `| Monedario` y su `<h1>` es el `title` del frontmatter.
5. **`pagefind-bounded`** (activo si `dist/pagefind` existe): tamaño total del
   directorio < 5 MB y `pagefind-entry.json` presente (regresión del plan 057).
6. **`jsonld-no-script-breakout`** (activo tras el plan 065): ningún
   `dist/**/*.html` contiene la secuencia `</script>` DENTRO del contenido de
   un bloque `<script type="application/ld+json">` (parse simple: extraer el
   bloque y verificar que no contiene `</script>`).
7. **`spacing-sanity`** (activo tras el plan 062): ninguna página contiene
   `</a><p` (anchor cerrado pegado a párrafo sin espacio — la firma del bug
   de tokenizer sería distinta, así que mejor: ninguna página contiene
   `<p>a < b</p>` corrupto — usa una aserción pragmática: el conteo de `<` en
   texto plano no cambió... simplifica: verificar que ninguna página perdió
   un `</p>` vs la cuenta de `<p>` — conteos balanceados por página).

Estructura: funciones puras exportadas (`collectNoindexPages(distDir)`,
`readTitleFromHtml(html)`, `countTags(html, tag)`, etc.) para testearlas.

**Verificar**: `node scripts/check-postbuild.mjs dist` → exit 0 sobre el dist actual (si dist existe; si no, build primero). Si una aserción falla por un estado real del dist, NO la debilites: reporta el hallazgo (puede ser un bug real).

### Paso 2: Tests de los helpers

`tests/scripts/check-postbuild.test.ts` (fixtures en temp dir):
1. `collectNoindexPages`: fixture con sitemap XML + páginas con/sin noindex → lista correcta.
2. `readTitleFromHtml`: `<title>` con/ sin espacios, ausente → behavior definido.
3. `countTags`: `<p>`/`</p>` balanceados y desbalanceados.
4. `_headers` parsing: script-src con/sin hashes → booleans correctos.
5. Un mini-dist fixture completo (5 archivos) que pase todos los checks → exit 0 del runner; y uno roto (sin hashes) → errores listados con sus ids.

**Verificar**: `pnpm exec vitest run tests/scripts/check-postbuild.test.ts` → todos pasan.

### Paso 3: Cablear en el build

En `package.json:10-11`, agrega `&& node scripts/check-postbuild.mjs dist` al
FINAL de `build` y `build:ci` (después del `cp -r dist/pagefind public/`).
Agrega también el script suelto:
`"check:postbuild": "node scripts/check-postbuild.mjs dist"`.

**Verificar**: `grep -n "check-postbuild" package.json` → en build, build:ci y script suelto.

### Paso 4: Build completo y gates finales

**Verificar**:
- `pnpm run build:ci` → exit 0 (el paso nuevo corre y pasa)
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `pnpm run lint` → exit 0
- `git status` → solo archivos en alcance

## Test plan

- 5 grupos de tests de helpers (Paso 2), patrón fixture+spawn de los
  `tests/scripts/*` existentes.
- El build completo como verificación end-to-end del Paso 3.

## Done criteria

- [ ] `scripts/check-postbuild.mjs` con los 7 checks declarativos
- [ ] `node scripts/check-postbuild.mjs dist` exit 0 sobre el dist actual
- [ ] `check:postbuild` en package.json y como paso final de `build`/`build:ci`
- [ ] Tests de helpers pasando
- [ ] `pnpm run build:ci` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Un check falla sobre el dist actual por un estado REAL (no por bug del
  script) — reporta el hallazgo con el archivo:regla; NO debilites la
  aserción sin aprobación del operador.
- La aserción `spacing-sanity` (balance de tags) produce falsos positivos con
  HTML legítimo (void tags, comentarios) — ajusta el contador solo si es
  defensible; si no, cambia a una aserción más débil y anótalo.
- El tiempo del build crece >60s por el nuevo paso (debería ser <5s — si no,
  hay un problema de implementación).
- Algún check depende de un plan que no está en main (057/062/065/067):
  deja el check en el script pero desactivado hasta que el plan aterrice,
  y anótalo en el reporte.

## Maintenance notes

- Esta capa es el lugar canónico para aserciones de artefacto: los planes
  futuros que toquen el build (nuevas integraciones, seoTitle v2) deben
  agregar su check aquí — no en Playwright.
- El check `seoTitle-rendered` usa slugs hardcodeados: al editar/borrar esos
  posts, actualizar la constante (fallará ruidosamente si no).
- En review: verificar que el script es determinista (sin red, sin reloj
  salvo donde se indique) y que los mensajes siguen `archivo:regla`.
