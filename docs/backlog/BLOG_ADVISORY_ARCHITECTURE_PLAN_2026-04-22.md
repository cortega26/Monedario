# Blog Advisory Architecture Plan

Date: 2026-04-22
Status: proposed
Horizon: mediano plazo

## Scope

- In scope:
  - planificación de arquitectura para disclaimers/advisories de cierre en `src/data/blog/**`
  - propuesta de contrato editorial/técnico
  - secuencia de implementación futura
- Out of scope:
  - implementación inmediata
  - cambios en `src/pages/guias/**`, `src/pages/calculadoras/**`, `src/data/laws/**`
  - cambios de rutas, RSS, canonical o SEO público
- Operation type:
  - documentation-only backlog plan

## Authority Check

- `docs/AI_ENGINEERING_CONSTITUTION.md` §1:
  - preservar contratos públicos
  - no refactorizar módulos no relacionados
- `docs/development/AGENT_EXECUTION_PROTOCOL.md`:
  - Rule 2.1 scope declaration
  - Rule 2.13 plan artifact in `docs/backlog/`
- `docs/development/CONSTITUTION_BINDING_RULES.md`:
  - Rule 4.3 ADR required for contract field lifecycle changes
- `context/CONTRACTS.md`:
  - `CONTRACT.FRONTMATTER_POLICY`
  - `CONTRACT.ARTICLE_STRUCTURE`
  - `CONTRACT.EDITORIAL.TONE`

## Executive Summary

La dirección correcta para el mediano plazo es un modelo de **presentación centralizada + contenido declarado junto al artículo + fallback estándar del sistema**.

El estado actual resuelve el problema visual, pero deja una deuda de arquitectura: el texto variable vive en un registro técnico por `slug` (`src/config/blogAdvisory.ts`) en vez de vivir cerca del contenido editorial al que pertenece. Eso escala peor, aumenta el riesgo de desalineación entre artículo y aviso, y encarece futuras ediciones por parte de trabajo editorial.

La propuesta recomendada es migrar a un sistema con:

1. **Un único componente visual compartido** para todos los advisories del blog.
2. **Un contrato de frontmatter explícito** para advisory de cierre.
3. **Un fallback central del sistema** para artículos que no requieran override.
4. **Validación automática** para evitar HTML ad hoc, longitud excesiva, links metidos en el disclaimer y drift editorial.

## Current State

### Qué está bien

- El tratamiento visual ya está centralizado mediante `src/components/ArticleAdvisory.astro`.
- El punto de render compartido ya existe en `src/layouts/PostDetails.astro`.
- Se eliminaron varias duplicaciones visibles dentro del markdown.

### Qué no está bien a mediano plazo

- El texto variable está acoplado a un mapa técnico por `slug` en `src/config/blogAdvisory.ts`.
- La fuente de verdad editorial no está junto al artículo.
- El formato actual acepta HTML inline, lo que abre espacio a variaciones difíciles de auditar.
- Algunas piezas hoy mezclan disclaimer real con:
  - fecha de corte
  - links de apoyo
  - notas metodológicas
  - advertencias operativas
- Eso hace que “advisory” y “nota editorial adicional” no estén bien separados conceptualmente.

## Target Architecture

## Principles

- **Un solo estilo visual** para todos los advisories del blog.
- **Contenido local al artículo** cuando el texto difiere del default.
- **Contrato mínimo y explícito**: el advisory debe ser un cierre breve, no un mini-bloque editorial.
- **Plain text first**: no HTML arbitrario en metadata.
- **Fallback seguro**: si un artículo no declara advisory propio, usa el default del sistema.
- **Guardrails automatizados**: CI debe prevenir drift.

## Recommended Data Model

Agregar un nuevo campo de frontmatter al collection schema de blog:

```yaml
articleAdvisory:
  variant: default | custom
  text: "..."
```

### Contract rules

- `variant: default`
  - usa el texto estándar central del sistema
  - `text` omitido
- `variant: custom`
  - requiere `text`
  - `text` debe ser plain text
  - sin HTML
  - sin markdown links
  - longitud máxima recomendada: `220`
  - longitud máxima dura: `300`

### Why this model

- Es suficientemente simple para el equipo editorial.
- Mantiene la fuente de verdad al lado del artículo.
- Evita un catálogo técnico por `slug` difícil de mantener.
- No sobrediseña el problema con taxonomías prematuras de 8-12 presets.

## Explicit Non-Goals

- No usar HTML libre en frontmatter.
- No convertir el advisory en un bloque rico con listas, fuentes o CTA.
- No usar un registry central por `slug` como diseño final.
- No mezclar el advisory con “fuentes”, “vigencia” o “nota metodológica”.

## Editorial Contract Recommendation

El advisory de cierre debe cumplir esta definición:

- Es una **frase breve de alcance/limitación**.
- Puede mencionar que el contenido es informativo, educativo o orientativo.
- Puede mencionar el tipo de asesoría que no reemplaza.
- Puede incluir una advertencia breve sobre complejidad del caso.
- **No** debe contener links.
- **No** debe repetir la sección de fuentes.
- **No** debe duplicar la fecha de corte si ya existe en el cuerpo.
- **No** debe funcionar como “basurero” de excepciones editoriales.

### Consecuencia práctica

Si un artículo necesita además una advertencia operativa o una fuente clave:

- esa información debe vivir en el cuerpo del artículo, normalmente en la sección final, FAQ o bloque de vigencia;
- el advisory de cierre debe seguir siendo corto y homogéneo.

## Proposed Runtime Shape

### Components

- Mantener `src/components/ArticleAdvisory.astro` como único punto visual.
- Cambiarlo para recibir `text: string`, no `html: string`.

### Resolver

- Reemplazar la lógica actual de `src/config/blogAdvisory.ts` por algo así:

```ts
export const DEFAULT_BLOG_ARTICLE_ADVISORY =
  "Contenido informativo; no reemplaza asesoría profesional personalizada.";

export function resolveBlogArticleAdvisory(post: CollectionEntry<"blog">): string {
  if (post.data.articleAdvisory?.variant === "custom") {
    return post.data.articleAdvisory.text;
  }

  return DEFAULT_BLOG_ARTICLE_ADVISORY;
}
```

### Schema

Extender `src/content.config.ts` para soportar `articleAdvisory`.

## Migration Strategy

## Phase 0 — ADR and contract definition

Deliverables:

- ADR para introducir el campo `articleAdvisory` en frontmatter.
- definición final del contrato editorial/técnico
- decisión explícita sobre longitud máxima y reglas de formato

Reason:

- agregar un nuevo campo de frontmatter cambia el lifecycle de contrato y debe quedar trazado

## Phase 1 — Schema and runtime

Changes:

- extender `src/content.config.ts`
- actualizar resolver en `src/config/blogAdvisory.ts` o reemplazarlo por `src/utils/articleAdvisory.ts`
- cambiar `ArticleAdvisory.astro` a `text` plain-text
- mantener `PostDetails.astro` como punto único de render

Success signal:

- todos los artículos renderizan advisory con un único componente visual
- ningún advisory depende ya de HTML inline

## Phase 2 — Content migration

Changes:

- mover advisories específicos desde el registry técnico al frontmatter de cada artículo
- eliminar entradas por `slug` del registry intermedio
- mover links/notas/fuentes que hoy estén incrustados en advisories hacia el cuerpo del artículo cuando corresponda

Success signal:

- el registry por `slug` desaparece o queda reducido solo al default
- el advisory específico vive junto al artículo

## Phase 3 — Guardrails

Add checks for:

- advisory presente solo vía sistema compartido
- `articleAdvisory.text` sin HTML
- `articleAdvisory.text` sin URLs
- largo máximo
- advisory no duplicado al final del markdown

Suggested enforcement locations:

- `scripts/check-frontmatter.mjs`
- `scripts/check-reader-facing-copy.mjs`
- test unitario del resolver

Success signal:

- CI falla si un artículo reintroduce un disclaimer inline o rompe el contrato

## Phase 4 — Cleanup and documentation

Changes:

- eliminar deuda remanente de advisories legacy
- documentar el patrón en `docs/editorial/` o `docs/development/`
- agregar ejemplo canónico para autores

Success signal:

- nuevo artículo puede seguir el patrón sin revisar código runtime

## File Plan

### Expected implementation paths

- `src/content.config.ts`
- `src/components/ArticleAdvisory.astro`
- `src/layouts/PostDetails.astro`
- `src/config/blogAdvisory.ts` or `src/utils/articleAdvisory.ts`
- `scripts/check-frontmatter.mjs`
- `scripts/check-reader-facing-copy.mjs`
- selected `src/data/blog/**`
- `docs/adr/ADR-YYYYMMDD-blog-article-advisory-contract.md`
- `docs/editorial/` or `docs/development/` pattern doc

## Risks

### Risk 1 — Overusing custom advisories

If every post gets a custom string, the system degenerates into per-article free-form copy again.

Mitigation:

- make `default` the norm
- use `custom` only when the article truly needs narrower wording

### Risk 2 — Frontmatter bloat

Too many editorial exceptions in frontmatter can make content harder to scan.

Mitigation:

- advisory contract must remain short and plain text
- push richer notes back into the article body

### Risk 3 — Silent drift between body and advisory

An article may change substantively while its custom advisory stays stale.

Mitigation:

- include advisory review in editorial refresh checklist
- keep advisory short so fewer facts can drift

### Risk 4 — Partial migration

The codebase may temporarily mix:

- legacy markdown disclaimers
- slug registry entries
- frontmatter advisories

Mitigation:

- do migration in explicit phases
- add one temporary audit script/report before cleanup

## Recommended Acceptance Criteria For Future Implementation

- Every blog article advisory is rendered by exactly one shared component.
- Advisory visual treatment is identical across all blog articles.
- Default advisory copy is centrally editable in one place.
- Article-specific advisory text lives in article metadata, not in a slug registry.
- Advisory metadata accepts plain text only.
- No article ends with a hardcoded inline advisory in markdown.
- CI includes at least one blocking rule preventing regression.

## Suggested Ticket Breakdown

1. ADR: advisory contract for blog articles.
2. Schema: add `articleAdvisory` to blog collection.
3. Runtime: resolve advisory from frontmatter + default fallback.
4. Migration: move custom advisories from slug registry to article frontmatter.
5. Cleanup: delete slug registry overrides.
6. Guardrails: enforce no-inline-advisory + plain-text advisory rules.
7. Docs: authoring guideline for new posts.

## Recommendation

La recomendación profesional para implementar después es:

- **mantener** el componente visual único;
- **abandonar** el registry por `slug` como arquitectura final;
- **migrar** a advisory declarado en frontmatter con fallback estándar;
- **restringir** el advisory a texto breve y plain text;
- **mover** links, fechas y notas metodológicas al cuerpo del artículo cuando hoy estén mezclados con el disclaimer.

Ese modelo es el que mejor equilibra escalabilidad, mantenibilidad, gobernanza editorial y simplicidad operativa.

## Progress Log

- 2026-04-22: created medium-term architecture plan for blog advisory handling.
