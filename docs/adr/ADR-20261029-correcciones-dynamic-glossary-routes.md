# ADR-20261029-correcciones-dynamic-glossary-routes

Date: 2026-10-29  
Status: Proposed

## Context

pnpm run check:correcciones valida que cada URL del registro de correcciones
resuelva a una superficie local. La regla de
[NORMA_YMYL.md §5.4](../editorial/NORMA_YMYL.md#54-registro-publico-de-correcciones)
requiere mantener enlaces internos válidos para las correcciones materiales.

El validador resolvía posts y páginas Astro estáticas, pero rechazaba
/glosario/utm/, aunque Astro la genera desde
src/pages/glosario/[slug].astro y src/data/glossary/utm.md. Cambiar el registro
para apuntar al índice /glosario/ habría perdido el enlace directo a la ficha
corregida.

## Decision

El resolver reconoce /glosario/<slug>/ cuando se cumplen ambas condiciones:

1. Existe la plantilla src/pages/glosario/[slug].astro.
2. Existe src/data/glossary/<slug>.md o .mdx.

El slug debe cumplir el formato kebab-case. Las reglas existentes para posts y
páginas estáticas no cambian. Una prueba de regresión cubre la ruta válida y
cada condición faltante.

## Consequences

- El registro conserva la URL exacta de la ficha UTM.
- No se crea ni modifica ninguna ruta pública.
- El gate comprueba que el source route template y el archivo de contenido
  existan; no sustituye una verificación de build/render ni valida el
  frontmatter de la colección.
- La modificación sigue el contrato de preservación de superficies públicas de
  docs/AI_ENGINEERING_CONSTITUTION.md §1.1 y el registro de correcciones de
  docs/editorial/NORMA_YMYL.md §5.4.

## Verification

- pnpm exec vitest run tests/scripts/check-correcciones.test.ts
- pnpm run check:correcciones
