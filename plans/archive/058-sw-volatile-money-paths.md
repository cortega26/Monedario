# Plan 058: Servir network-first las páginas de dinero en el service worker (UF/UTM/dólar vigente)

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- public/sw.js src/integrations/sw-version.ts`
> Si `public/sw.js` cambió, compara los excerpts contra el código vivo; ante
> cualquier desajuste, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: correctness (YMYL — valores monetarios)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

El service worker (registrado desde `src/layouts/Layout.astro:338`) sirve las
páginas HTML con **Stale-While-Revalidate**: un visitante recurrente ve la
copia en caché y la revalidación solo corrige la *próxima* visita. Las tres
páginas cuyo contenido principal es un valor económico del día —
`conversor-uf`, `conversor-utm` y `uf-hoy` — quedan así fuera de la lista de
rutas volátiles, mientras que el CDN (`public/_headers`, `max-age=300`) sí las
trata como volátiles. Resultado: un usuario que vuelve dentro de la vida de la
caché del SW ve la UF/UTM/dólar de ayer como dato vigente en páginas YMYL de
~160K impresiones/semana combinadas. La infraestructura del fix ya existe:
`VOLATILE_HTML_PATHS` + la rama network-first del SW.

## Estado actual

- `public/sw.js:5-13`:
```js
const VOLATILE_HTML_PATHS = new Set([
  "/guias/uf-costo-de-vida/indicadores-economicos/",
  "/guias/uf-costo-de-vida/indicadores-economicos/index.html",
]);
```
- `public/sw.js:100-136` (aprox.): la rama `isNavigation` de `fetch` tiene dos
  caminos — si `VOLATILE_HTML_PATHS.has(url.pathname)` → network-first
  (fetch → cache.put → cache fallback → "Offline" 503); si no → stale-while-revalidate.
- Páginas afectadas (renderizan el valor del día en contenido primario):
  `src/pages/calculadoras/conversor-uf.astro`, `src/pages/calculadoras/conversor-utm.astro`,
  `src/pages/uf-hoy.astro`.
- `src/integrations/sw-version.ts` reemplaza `__SW_CACHE_VERSION__` en el build
  (stamp de versión) — no tocar.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Build (para el sw.js final) | `pnpm run build:ci` | exit 0 |
| Verificación del artefacto | `grep -n "conversor-uf" dist/sw.js` | la ruta aparece en VOLATILE |
| Tests | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `public/sw.js` (solo el Set `VOLATILE_HTML_PATHS`)

**Fuera de alcance** (NO tocar):
- `public/_headers` (la política de cache del CDN ya es correcta: `max-age=300`)
- `src/integrations/sw-version.ts`, `src/layouts/Layout.astro`, `public/sw-register.js`
- El orden/lógica de la rama network-first (ya funciona y está probada para el hub)
- Las páginas `.astro` de los conversores (no necesitan cambios)

## Git workflow

- Rama: `advisor/058-sw-volatile-money-paths`
- Commit: `fix(perf): servir network-first UF/UTM/dólar en el service worker (rutas volátiles)`
- NO hacer push ni abrir PR salvo que el operador lo pida.

## Pasos

### Paso 1: Ampliar la lista de rutas volátiles

En `public/sw.js`, reemplaza el Set para que quede:
```js
const VOLATILE_HTML_PATHS = new Set([
  "/calculadoras/conversor-uf/",
  "/calculadoras/conversor-uf/index.html",
  "/calculadoras/conversor-utm/",
  "/calculadoras/conversor-utm/index.html",
  "/uf-hoy/",
  "/uf-hoy/index.html",
  "/guias/uf-costo-de-vida/indicadores-economicos/",
  "/guias/uf-costo-de-vida/indicadores-economicos/index.html",
]);
```

**Verificar**: `grep -n "conversor-uf/\|uf-hoy/\|conversor-utm/" public/sw.js`
→ las 6 rutas nuevas aparecen dentro del Set (no en otro lado del archivo).

### Paso 2: Verificar que la rama network-first aplica a estas rutas

Lee la rama de `fetch` en `public/sw.js` (~líneas 85-136) y confirma que usa
`VOLATILE_HTML_PATHS.has(url.pathname)` (o equivalente sobre `pathname`) —
debe ser el mismo predicado que ya cubre al hub de indicadores, así que las
rutas nuevas caen automáticamente en el mismo tratamiento.

**Verificar**: `grep -n "VOLATILE_HTML_PATHS" public/sw.js` → aparece en la
definición y en ≥1 sitio de uso.

### Paso 3: Build y verificación del artefacto

**Verificar**:
- `pnpm run build:ci` → exit 0.
- `grep -n "conversor-uf" dist/sw.js` → las rutas están en el `dist/sw.js` final.
- `grep -c "__SW_CACHE_VERSION__" dist/sw.js` → `0` (el stamp se aplicó; si hay
  matches, reporta en vez de seguir).
- `pnpm test` → todos pasan.

## Test plan

No hay infraestructura de tests para el SW (archivo estático de `public/`).
Los tests existentes deben pasar intactos (`pnpm test`). La verificación real
es el build + el grep sobre `dist/sw.js` del Paso 3.

## Done criteria

- [ ] `public/sw.js` contiene las 3 rutas nuevas (con y sin `/index.html`)
- [ ] `pnpm run build:ci` exit 0
- [ ] `grep -n "conversor-uf" dist/sw.js` confirma el set en el artefacto
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- La rama network-first no existe o no usa `VOLATILE_HTML_PATHS` (el archivo
  cambió más de lo esperado desde el drift check).
- `dist/sw.js` conserva `__SW_CACHE_VERSION__` sin reemplazar.
- Encontraras una cuarta página de valores vivos que deba incluirse (p. ej.
  `conversor-utm` FAQ) — no la agregues por tu cuenta: reporta con la ruta.

## Maintenance notes

- Mantener esta lista sincronizada con `public/_headers` (`max-age` corto):
  la regla es "todo lo que el CDN trata como volátil debe estar también en
  `VOLATILE_HTML_PATHS`". Un candidato futuro a consolidador: un módulo
  compartido que genere ambas listas (hoy no es viable: `sw.js` es estático
  en `public/` y `_headers` también; se menciona en el plan 081 como
  refactor posible dentro de la capa post-build).
- En review: verificar que el orden de entradas no importa (Set), y que no se
  copiaron rutas de calculadoras no volátiles.
- Si se agrega una calculadora nueva con valor del día, este Set es un punto
  de actualización obligatorio.
