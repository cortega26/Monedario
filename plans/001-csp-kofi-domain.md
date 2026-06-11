# Plan 001: Agregar storage.ko-fi.com al CSP para que el widget de donaciones funcione

> **Executor instructions**: Sigue este plan paso a paso. Ejecuta cada comando
> de verificación y confirma el resultado esperado antes de pasar al siguiente
> paso. Si ocurre alguna condición de STOP, detente y reporta — no improvises.
> Al terminar, actualiza la fila de estado de este plan en `plans/README.md`.
>
> **Drift check (ejecutar primero)**:
> `git diff --stat 8256c9d2..HEAD -- public/_headers src/pages/apoyar.astro src/integrations/csp-hashes.ts`
> Si alguno de esos tres archivos cambió desde que se escribió este plan,
> compara los excerpts de "Estado actual" con el código vivo antes de continuar.
> Si no coinciden, trátalo como condición de STOP.

## Estado

- **Prioridad**: P1
- **Esfuerzo**: S
- **Riesgo**: LOW
- **Depende de**: ninguno
- **Categoría**: security / bug
- **Planned at**: commit `8256c9d2`, 2026-06-11

## Por qué importa

El widget de Ko-fi en `/apoyar` llama dinámicamente a un `<script>` externo de
`https://storage.ko-fi.com/cdn/widget/Widget_2.js` (creado en runtime vía
`document.createElement`). La integración `csp-hashes.ts` hashea los scripts
inline del build y **elimina explícitamente `'strict-dynamic'`** del CSP —
lo que hace que los scripts cargados dinámicamente solo sean permitidos si su
dominio de origen aparece en `script-src`. El dominio `storage.ko-fi.com` no
está en el CSP, por lo tanto el script es bloqueado en producción. El
placeholder del widget se muestra pero nunca carga el botón de donación.
El fix es agregar dos dominios a `public/_headers`.

## Estado actual

Los tres archivos relevantes y lo que cada uno hace:

- `public/_headers` — headers HTTP servidos por Cloudflare Pages para todos los
  paths. Contiene el CSP estático que el build enriquece con hashes.
- `src/pages/apoyar.astro` — la única página que carga el widget Ko-fi.
- `src/integrations/csp-hashes.ts` — integración Astro que, al finalizar el
  build, escanea `dist/**/*.html` y reemplaza `script-src` con hashes de cada
  script inline. Preserva los tokens que no sean `'unsafe-inline'` ni
  `'strict-dynamic'`.

**Línea exacta a modificar** (`public/_headers:2`):
```
  Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://static.cloudflareinsights.com https://api.web3forms.com; font-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'
```

**Script injection en `src/pages/apoyar.astro:353`** (solo lectura — no tocar):
```js
const script = document.createElement("script");
script.src = "https://storage.ko-fi.com/cdn/widget/Widget_2.js";
document.head.appendChild(script);
```

**Lógica relevante de `src/integrations/csp-hashes.ts:49-55`** (solo lectura):
```ts
const cleaned = rest
  .replace(/'unsafe-inline'\s*/g, "")
  .replace(/'strict-dynamic'\s*/g, "")
  .replace(/\s+/g, " ")
  .trim();
return `script-src ${hashTokens} ${cleaned}`;
```
`rest` es el contenido después de `script-src` — todo lo que no sea unsafe-inline
ni strict-dynamic se preserva. El dominio nuevo que agreguemos sobrevivirá el build.

**Rol de `@kindspells/astro-shield`**: el repo usa `astro-shield` configurado
solo con `sri: { enableStatic: true, ... }` — sin bloque `csp`. Solo agrega
atributos `integrity` a assets estáticos; **no emite ni modifica el CSP**.
`public/_headers` es la única autoridad CSP. Verificado en `astro.config.ts:255-261`.

**Convención del repo**: los headers HTTP se configuran en `public/_headers`.
No existe archivo `.well-known/security.txt` ni ninguna override por path
que afecte `/*`.

## Comandos necesarios

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Lint YAML/formato | `pnpm run format:check` | exit 0 |
| Tests | `pnpm test` | exit 0, todos pasan |
| Verificar CSP en _headers | `grep "script-src" public/_headers` | contiene `storage.ko-fi.com` |
| Verificar img-src en _headers | `grep "img-src" public/_headers` | contiene `cdn.ko-fi.com` |

## Scope

**En scope** (el único archivo que debes modificar):
- `public/_headers`

**Fuera de scope** (NO tocar):
- `src/pages/apoyar.astro` — la página funciona correctamente; el bug está en el CSP, no ahí
- `src/integrations/csp-hashes.ts` — la integración funciona bien; no necesita cambios
- Cualquier otro archivo de `src/`, `scripts/`, `.github/`

## Flujo git

- Rama: `fix/csp-kofi-domain`
- Commit style del repo: conventional commits, e.g. `fix(csp): add storage.ko-fi.com to script-src`
- NO hacer push ni abrir PR a menos que el operador lo pida.

## Pasos

### Paso 1: Agregar `storage.ko-fi.com` a `script-src` en `public/_headers`

Abre `public/_headers`. La línea 2 (bajo `/*`) contiene el CSP completo.
Localiza la directiva `script-src`:
```
script-src 'self' https://static.cloudflareinsights.com
```

Cámbiala a:
```
script-src 'self' https://static.cloudflareinsights.com https://storage.ko-fi.com
```

La línea completa resultante del CSP debe quedar así (una sola línea):
```
  Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com https://storage.ko-fi.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.ko-fi.com; connect-src 'self' https://static.cloudflareinsights.com https://api.web3forms.com; font-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'
```

(En el mismo paso: la directiva `img-src` pasa de `'self' data:` a
`'self' data: https://cdn.ko-fi.com` — el widget Ko-fi carga imágenes del
botón desde ese CDN. Ajústala en la misma edición.)

**Verifica**:
```bash
grep "script-src" public/_headers
```
Resultado esperado: la línea contiene `https://storage.ko-fi.com`.

```bash
grep "img-src" public/_headers
```
Resultado esperado: la línea contiene `https://cdn.ko-fi.com`.

### Paso 2: Verificar que el archivo sigue siendo válido

```bash
pnpm run format:check
```
Resultado esperado: exit 0. Si el formateador reformatea `_headers`, confirma
que el contenido es idéntico semánticamente antes de continuar.

### Paso 3: Correr tests

```bash
pnpm test
```
Resultado esperado: exit 0, **689 tests pasando** (línea base verificada en
commit `8256c9d2` + fix de `plans/` en `check-docs-structure.mjs`). El cambio
es solo en un archivo de headers HTTP — no hay tests que dependan de su
contenido literal, pero la suite no debe romperse.

## Plan de tests

No se requieren tests nuevos para este cambio — `public/_headers` no tiene
suite de tests propia y el cambio es aditivo. Sin embargo:

- Si el repositorio añade en el futuro un test que valide el contenido de
  `_headers`, debe incluir `storage.ko-fi.com` y `cdn.ko-fi.com` como tokens
  esperados en el CSP.

## Criterios de cierre

Todos deben cumplirse:

- [ ] `grep "script-src" public/_headers` contiene `https://storage.ko-fi.com`
- [ ] `grep "img-src" public/_headers` contiene `https://cdn.ko-fi.com`
- [ ] `pnpm run format:check` exit 0
- [ ] `pnpm test` exit 0 (689 tests pasando)
- [ ] Ningún archivo fuera del scope fue modificado (`git diff --name-only HEAD`)
- [ ] Fila de estado actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Los excerpts de "Estado actual" no coinciden con el código vivo (el repo
  evolucionó desde que se escribió el plan).
- El paso de format:check falla por razones no relacionadas con este cambio.
- Descubres que `public/_headers` tiene overrides por path que afecten a
  `/apoyar/` y que podrían requerir cambios adicionales.
- El paso 1 rompe algún test existente — no improvises el arreglo sin entender
  por qué el test falla.

## Notas de mantenimiento

- Si en el futuro se agrega otro widget de terceros con script externo, el
  patrón a seguir es el mismo: agregar el dominio de origen a `script-src` en
  `public/_headers`. Nunca agregar `'strict-dynamic'` sin entender que
  `csp-hashes.ts` lo elimina en cada build.
- La directiva `img-src` puede necesitar nuevas entradas si Ko-fi cambia sus
  CDN URLs. Revisarlo si el widget muestra imágenes rotas en el futuro.
- Este cambio modifica el CSP estático; el CSP del build (después de que
  `csp-hashes.ts` lo enriquece con hashes) incluirá además los hashes de cada
  script inline. El dominio `storage.ko-fi.com` sobrevive esa transformación.
