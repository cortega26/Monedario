# Plan 077: `check:ci` — un comando que reproduce el CI localmente

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- package.json README.md START_HERE.md .github/workflows/ci.yml`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx (reproducibilidad de CI)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

`pnpm run check` **no reproduce el CI**: 7 gates corren solo en el aggregate
local (`check:links`, `check:economic-source-consistency`, `check:catalog-drift`,
`check:article-registration`, `check:official-host-registry`,
`check:homepage-surface-freshness`, `check:small-details`) y NUNCA en ningún
workflow; y 10+ gates corren solo en CI (`lint`, `format:check`,
`check:boundaries`, `check:routes`, `check:urls:ci`, `check:rss`,
`check:indexable-url-freeze`, `check:toc-i18n`, `check:editorial-guard`,
`check:economic-snapshot-freshness`). Cuando CI falla, el issue automático
dice "reproduce localmente con `pnpm run check` y `pnpm run test`"
(`ci.yml:230-231`) — y es imposible. Este plan agrega `check:ci` (el espejo
exacto del CI) y corrige la documentación.

## Estado actual

- `package.json:15`: `"check": "pnpm run check:context && ... && pnpm run check:homepage-surface-freshness && pnpm run check:no-postid-urls && astro check"` (ver el archivo para la cadena completa).
- `ci.yml:75-199` (job `lint-and-test` + `build`): el set real del CI (ver "Por qué importa").
- `ci.yml:230-231`: cuerpo del issue "reproduce localmente con `pnpm run check` y `pnpm run test`".
- `README.md:70-75` y `START_HERE.md:46-50`: recomiendan el set incompleto.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Nuevo aggregate | `pnpm run check:ci` | exit 0 (o solo fallos preexistentes reportados) |
| Aggregate viejo | `pnpm run check` | exit 0 (regresión) |
| Suite | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `package.json` (script `check:ci` + composición)
- `.github/workflows/ci.yml` (texto del issue, línea 230-231)
- `README.md` y `START_HERE.md` (sección de validación local)

**Fuera de alcance** (NO tocar):
- Cambiar QUÉ corre en el CI real (solo espejarlo — el plan 066/069 pueden
  sumar jobs; no reordenar el CI)
- `check:urls:external:*` (requiere red/build — no entra en `check:ci`; se documenta)
- Los scripts individuales

## Git workflow

- Rama: `advisor/077-check-ci-aggregate`
- Commit: `docs(dx): script check:ci que espeja el CI localmente`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Definir `check:ci`

En `package.json`, agrega:
```json
"check:ci": "pnpm run lint && pnpm run format:check && pnpm run test && pnpm run check:boundaries && pnpm run check:context && pnpm run check:policy-registry && pnpm run check:docs && pnpm run check:frontmatter && pnpm run check:no-postid-urls && pnpm run check:routes && pnpm run astro check"
```
(mirror del job `lint-and-test` + los checks baratos de `build` del `ci.yml` —
verifica contra el `ci.yml` actual y ajusta la lista a la realidad; los gates
que requieren build — `check:indexable-url-freeze`, `check:rss`,
`check:toc-i18n`, `check:editorial-guard`, `check:economic-snapshot-freshness`,
`check:urls:ci` — se excluyen y se documentan como "requieren `pnpm run build`").

Además, decide el destino de los 7 gates huérfanos (corren solo local hoy):
- Opción A (recomendada): agregarlos a `check:ci` también (si son rápidos).
- Opción B: agregarlos al job `lint-and-test` del CI (si cabe en los 5 min —
  medir primero con un run local del aggregate).
Elige según velocidad medida localmente (si `check:links` es lento — linkinator
crawl — queda fuera de ambos y se documenta).

**Verificar**: `pnpm run check:ci` → exit 0 (o lista de fallos preexistentes — reporta).

### Paso 2: Corregir el texto del issue en `ci.yml`

Cambia la línea del body del issue (ci.yml:230-231) a:
`Reproduce locally with \`pnpm run check:ci\` and \`pnpm run test\` (o \`pnpm run build\` para gates post-build).`

**Verificar**: `grep -n "check:ci" .github/workflows/ci.yml` → match.

### Paso 3: Corregir la documentación

- `README.md:70-75` y `START_HERE.md:46-50`: reemplaza la recomendación por
  `pnpm run check:ci` (y `pnpm run check` como set editorial/contexto si se
  conserva). Menciona que `check:urls:ci`/gates post-build requieren build.

**Verificar**: `grep -n "check:ci" README.md START_HERE.md` → presentes.

### Paso 4: Gates finales

**Verificar**:
- `pnpm run check` → exit 0 (el aggregate viejo no se rompe)
- `pnpm test` → todos pasan
- `pnpm run format:check` → exit 0
- `git status` → solo archivos en alcance

## Test plan

No hay tests para scripts de package.json. La verificación es ejecutar ambos
aggregates y confirmar que el texto de CI/documentación es coherente.

## Done criteria

- [ ] `check:ci` existe y corre los gates del CI local
- [ ] Los 7 gates huérfanos tienen destino (en `check:ci` o en CI) — documentado
- [ ] `ci.yml:230-231` apunta a `check:ci`
- [ ] `README.md`/`START_HERE.md` actualizados
- [ ] `pnpm run check` exit 0 (sin regresión)
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Algún gate del aggregate falla por razones PREEXISTENTES (no las arregles en
  este plan: reporta cuáles y el fix es un plan aparte).
- `check:links` (linkinator) tarda >3 min localmente — no lo metas en
  `check:ci`; documenta que requiere red.
- El CI real y la lista que espejas difieren de forma que no puedes resolver
  leyendo `ci.yml` (p. ej. gates condicionados a `EDITORIAL_ENFORCE`):
  refleja el modo CI si el env está documentado (`EDITORIAL_ENFORCE=1`) y
  anótalo.

## Maintenance notes

- Regla: **toda** adición a `ci.yml` debe sumarse a `check:ci` en el mismo PR
  (y viceversa para gates locales útiles). La divergencia es el bug.
- `check:urls:external:*` y LHCI quedan explícitamente fuera (red/build):
  si CI los usa, `check:ci` no puede reproducirlos — documentar en README.
- En review: verificar que el issue automático de CI y la doc apuntan al
  mismo comando.
