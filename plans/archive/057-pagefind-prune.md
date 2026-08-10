# Plan 057: Purgar el índice pagefind en cada build para que no se acumulen generaciones muertas

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- package.json public/pagefind dist/pagefind`
> Si `package.json` cambió en el build chain, compara los excerpts contra el
> código vivo antes de seguir; ante cualquier desajuste, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

El comando `pagefind --site dist` se re-ejecuta sobre el output del build
anterior (que vive en `dist/` persistido por el cache de Actions y por builds
locales sucesivos). Pagefind **nunca borra** sus archivos previos: cada
contenido editado deposita una generación nueva de `index/*.pf_index` y
`fragment/*.pf_fragment` con hash de contenido, y el set crece sin límite.
Hoy `dist/pagefind` pesa **33 MB con 600 archivos de índice y 1.780 fragments**
cuando un run limpio del mismo binario produce **1.3 MB y 52 fragments** (verificado
en `/tmp/opencode/pf-audit`). Cada build copia esos 33 MB a `public/` y de vuelta,
el deploy se acerca a los límites de assets estáticos de Cloudflare y el costo
compone con cada post editado. El fix es una línea.

## Estado actual

- `package.json:10` (script `build`) y `package.json:11` (`build:ci`) contienen:
  `pagefind --site dist && node -e "...appendFileSync..." && cp -r dist/pagefind public/`
- `dist/pagefind` acumula generaciones: re-ejecutar pagefind en su lugar **no**
  reduce el set (medido: 600→607 índices tras un re-run).
- `public/pagefind/` es una copia commiteada del índice (el sitio sirve la
  búsqueda desde ahí; `src/pages/buscar.astro` la consume vía
  `pagefind-entry.json`).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Build completo | `pnpm run build:ci` | exit 0; log de pagefind sin errores |
| Test suite | `pnpm test` | todos pasan |
| Verificación de tamaño | `du -sh dist/pagefind` | ≤ ~2 MB tras build limpio |
| Conteo de archivos | `find dist/pagefind -type f | wc -l` | ≤ ~100 tras build limpio |

## Alcance

**En alcance** (únicos archivos que puedes modificar):
- `package.json` (solo las cadenas del comando pagefind en `build` y `build:ci`)
- `public/pagefind/` y `dist/pagefind/` (eliminación one-time del set obsoleto)

**Fuera de alcance** (NO tocar, aunque parezcan relacionados):
- `src/pages/buscar.astro`, `public/pagefind/pagefind.js`, la UI de search
- `scripts/` (no hay script de pagefind que cambiar)
- Cambiar la configuración de pagefind (idiomas, `data-pagefind-body`)

## Git workflow

- Rama: `advisor/057-pagefind-prune`
- Un solo commit, mensaje al estilo del repo (conventional commits, ver `git log --oneline -10`):
  `fix(perf): purgar índice pagefind en cada build para evitar acumulación de generaciones`
- NO hacer push ni abrir PR salvo que el operador lo pida.

## Pasos

### Paso 1: Verificar la magnitud del problema antes de tocar nada

**Verificar**: `du -sh dist/pagefind && find dist/pagefind -type f | wc -l`
→ esperado: `33M` y un conteo de ~600+ (o el número actual). Si `dist/` no
existe, corre primero `pnpm run build:ci` y repite la medición.

### Paso 2: Hacer que el build limpie el índice antes de re-indexar

En `package.json`, en **ambos** scripts `build` y `build:ci`, reemplaza:
```
pagefind --site dist
```
por:
```
rm -rf dist/pagefind && pagefind --site dist
```
(deja intacto el `node -e "...appendFileSync..."` y el `cp -r dist/pagefind public/` que le siguen).

**Verificar**: `grep -n "pagefind" package.json` → ambas líneas contienen
`rm -rf dist/pagefind && pagefind --site dist`.

### Paso 3: Purgar el set acumulado una sola vez

Elimina `dist/pagefind/` (si existe) y `public/pagefind/`:

**Verificar**: `git status --short` muestra las eliminaciones de
`public/pagefind/**` como staged-ready (deleted), y `ls public/pagefind` no existe.

### Paso 4: Rebuild y verificación final

**Verificar**:
- `pnpm run build` → exit 0.
- `du -sh dist/pagefind` → ≤ ~2 MB (esperado ≈1.3 MB).
- `find dist/pagefind -type f | wc -l` → ≤ ~100.
- `ls dist/pagefind/pagefind-entry.json public/pagefind/pagefind-entry.json` → ambos existen.
- `pnpm test` → todos pasan.

## Test plan

No se requieren tests nuevos: es un cambio de cadena de comandos del build.
Los tests existentes (`pnpm test`) deben seguir pasando sin modificaciones.

## Done criteria

- [ ] `grep -n "pagefind" package.json` muestra `rm -rf dist/pagefind` en `build` y `build:ci`
- [ ] `du -sh dist/pagefind` ≤ 2 MB tras un build limpio
- [ ] `git status` solo muestra cambios en `package.json` y eliminaciones de `public/pagefind/**`
- [ ] `pnpm test` exit 0
- [ ] Fila de este plan actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta (no improvises) si:

- El build falla después del cambio (el `rm -rf` es seguro, pero un error de pagefind real podría estar enmascarado).
- `buscar.astro` o la UI de búsqueda requieren algo más que `pagefind-entry.json` + el set de archivos (no toques el markup).
- `du -sh dist/pagefind` tras el build limpio es > 5 MB (algo más está mal — reporta en vez de ajustar).

## Maintenance notes

- El hallazgo PERF-02 (pagefind solo indexa posts — 52 de 327 páginas, sin
  `data-pagefind-body` en las otras layouts) sigue **sin planificar** (dirección,
  no fix); si se decide indexar guías/calculadoras/glosario, debe ejecutarse
  **después** de este plan: el índice limpio es la base para medir el
  crecimiento real y se necesita decidir el alcance intencional primero.
- Si algún día se sube el límite de generaciones (p. ej. se indexan guías/calculadoras), revisar también el TTL/estrategia de fragmentos — hoy el problema es solo la acumulación, no la estrategia.
- En review, revisar que el `rm -rf` no borre nada que un futuro paso del build quiera leer antes de pagefind (hoy el orden del chain es seguro).
