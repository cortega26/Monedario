# Plan 065: Escapar `<` en toda serialización JSON-LD (`set:html`)

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- src/utils src/components src/layouts src/pages | head -40`
> y luego confirma que los sitios citados abajo siguen existiendo. Ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security (XSS latente por contenido)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

Los schemas JSON-LD se inyectan con `set:html={JSON.stringify(...)}`.
`JSON.stringify` **no escapa `<`**: un string de frontmatter (o de cualquier
futuro input) que contenga `</script>` termina el elemento `<script>` dentro
de `<head>` — inyección de contenido/HTML en todas las páginas (posts,
calculadoras, glosario, leyes, guías). Hoy la explotabilidad es baja (autor
único, frontmatter validado por zod sin restricción de charset, CSP con hashes
que bloquea scripts inyectados), pero es una clase XSS latente en el momento
en que cualquier valor venga de una fuente no controlada (CMS, import, input
de usuario), y además corrompe el JSON-LD hoy si un título/descripción
contiene `<`. El fix es mecánico y barato: un serializer compartido que
escapa `<` como `\u003c` (forma estándar, el parser JSON lo revierte solo).

## Estado actual

- Sitios `set:html={JSON.stringify(...)}` (confirmar con grep; esperado ~20):
  - `src/layouts/Layout.astro:252` — `set:html={JSON.stringify(structuredData)}`
  - `src/components/ArticleJsonLd.astro:159,166` — `headline: title`, `description`
  - `src/components/CalculatorJsonLd.astro:74,81`
  - `src/components/GlossaryJsonLd.astro:31`
  - `src/components/Breadcrumb.astro:118`
  - ~15 sitios a nivel página: `src/pages/leyes/[slug].astro:104,111`,
    `src/pages/guias/impuestos-personas/operacion-renta/index.astro:209,214`, etc.
- `src/content.config.ts:40,47`: `title`/`description` son `z.string()` sin
  restricción de caracteres.
- El patrón `is:inline` + `type="application/ld+json"` es el estándar correcto
  (los bloques data no ejecutan) — no hay que cambiar la estructura, solo el escape.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Inventario de sitios | `grep -rn "set:html={JSON.stringify" src/` | lista de ~20 sitios |
| Tests | `pnpm test` | todos pasan |
| Typecheck | `pnpm run astro check` | 0 errores (hint preexistente de content.config.ts no es tuyo) |

## Alcance

**En alcance**:
- `src/utils/serializeJsonLd.ts` (nuevo — módulo leaf, sin dependencias)
- Todos los sitios que `grep -rn "set:html={JSON.stringify" src/` encuentre
  (componentes + páginas)
- `tests/unit/serializeJsonLd.test.ts` (nuevo)

**Fuera de alcance** (NO tocar):
- `public/sw.js`, `_headers`, la CSP
- El contenido de los schemas (las propiedades — solo cambia la serialización)
- Frontmatter existente (no hay que reescribir contenido)

## Git workflow

- Rama: `advisor/065-jsonld-escape`
- Commit: `fix(security): escapar '<' en serialización JSON-LD (serializer compartido)`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Inventariar los sitios exactos

**Verificar**: `grep -rn "set:html={JSON.stringify" src/ | tee /tmp/opencode/jsonld-sites.txt | wc -l`
→ anota el conteo. Si es > 40, STOP y reporta (algo cambió de escala).

### Paso 2: Crear el serializer

`src/utils/serializeJsonLd.ts`:
```ts
/**
 * Serializa JSON-LD de forma segura para inyección vía set:html en
 * <script type="application/ld+json">. JSON.stringify no escapa '<': un
 * valor con '</script>' terminaría el elemento. Escaparlo como \u003c es
 * la mitigación estándar — el parser JSON lo revierte sin cambio semántico.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
```
Sin imports (módulo leaf, importable desde cualquier bundle cliente).

### Paso 3: Reemplazar todos los sitios

En cada sitio del inventario, reemplaza `set:html={JSON.stringify(X)}` por
`set:html={serializeJsonLd(X)}`, importando el helper (`import { serializeJsonLd } from "@/utils/serializeJsonLd"` — respeta el alias `@/` usado en cada archivo).

**Verificar**: `grep -rn "set:html={JSON.stringify" src/` → sin matches.
`grep -rln "serializeJsonLd" src/` → ≥20 archivos.

### Paso 4: Test del serializer

`tests/unit/serializeJsonLd.test.ts`:
1. `serializeJsonLd({ title: "a</script><b>" })` → el string resultante NO
   contiene `</script>` literal (contiene `<\/script>` — en el string JS
   escapado, verifica que `serializeJsonLd(...)` no incluya la secuencia
   `</script>`).
2. Valores normales (título con acentos, `&`, `>`): el output es
   `JSON.stringify` estándar (regresión — `<` solo se escapa, nada más).
3. `JSON.parse(serializeJsonLd(x))` devuelve deep-equal de `x` (round-trip).

**Verificar**: `pnpm exec vitest run tests/unit/serializeJsonLd.test.ts` → todos pasan.

### Paso 5: Gates finales

**Verificar**:
- `pnpm test` → todos pasan
- `pnpm run astro check` → 0 errores (o solo el hint preexistente)
- `pnpm run lint` y `pnpm run format:check` → exit 0
- `git status` → solo archivos en alcance

## Test plan

- Test unitario del serializer (Paso 4).
- El build (`pnpm run build:ci` opcional) no debe producir diff en los JSON-LD
  renderizados salvo el escape — si se verifica, revisar una página con título
  normal: el HTML del `<script>` es idéntico al de antes (los `<` escapados no
  existen en títulos normales).

## Done criteria

- [ ] `src/utils/serializeJsonLd.ts` existe y es leaf
- [ ] `grep -rn "set:html={JSON.stringify" src/` → sin matches
- [ ] `grep -rln "serializeJsonLd" src/` → todos los sitios del inventario
- [ ] Tests del serializer pasando
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Algún sitio usa `set:html` con `JSON.stringify` **dentro de un atributo** o
  en un contexto distinto al `<script type="application/ld+json">` (mismo
  riesgo, distinto fix — reporta la ubicación).
- Hay sitios con `JSON.stringify` sin `set:html` (p. ej. en props de
  componentes) — NO los toques (no hay vector HTML), solo anótalos.
- El conteo del Paso 1 supera 40.

## Maintenance notes

- **Regla**: todo JSON-LD nuevo DEBE usar `serializeJsonLd`. Añadir una
  aserción al plan 081 (capa post-build): ningún `dist/**/*.html` debe
  contener `</script>` dentro de un bloque ld+json.
- Si algún día el frontmatter acepta input externo (CMS), este fix es el
  primer control — el segundo sería restringir charset en zod.
- En review: verificar que no quedó ningún `JSON.stringify` directo en
  `set:html` y que los imports respetan el alias del archivo.
