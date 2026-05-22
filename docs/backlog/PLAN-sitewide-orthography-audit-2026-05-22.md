# PLAN — Sitewide Orthography Audit — 2026-05-22

Status: completed
Owner: Codex
Scope type: editorial copy remediation

## Objective

Detectar y corregir errores de ortografía en textos visibles del website con diffs mínimos, sin alterar lógica, rutas, contratos, cifras ni contenido regulatorio/material.

## Authority

- `docs/AI_ENGINEERING_CONSTITUTION.md` §1, §2.3 `URL.PUBLIC.NO_POST_ID`
- `AGENTS.md` §2 Rule 2.1, 2.2, 2.3, 2.13
- `context/EDITORIAL_AI_PIPELINE.md` §1 (este pase no cambia números, reglas, interpretación ni decisiones de publicación)

## Scope

In scope:
- `src/pages/**`
- `src/data/blog/**`
- `src/data/glossary/**`
- metadatos y schema embebidos en esos archivos cuando contengan copy visible

Out of scope:
- `src/domain/**`
- `src/application/**`
- `src/infrastructure/**`
- rutas, slugs, canonicals, RSS
- cambios de tono/estilo no motivados por ortografía
- refresh YMYL sustantivo

## Method

1. Detectar candidatos con barrido semiautomático y revisión manual.
2. Corregir solo errores ortográficos evidentes en copy visible.
3. Verificar diff final por archivo para evitar cambios semánticos involuntarios.

## Risks

- Falsos positivos en términos técnicos, nombres propios o texto intencionalmente sin tilde.
- Mezclar ortografía con reescritura editorial.

## Mitigations

- Revisar cada hunk manualmente antes de cerrar.
- Mantener cambios pequeños y localizados.

## Progress Log

- 2026-05-22: plan creado.
- 2026-05-22: pendiente barrido inicial de candidatos en contenido visible.
- 2026-05-22: barrido inicial completado en `src/pages/**`, `src/data/blog/**` y `src/data/glossary/**` con enfoque en copy visible.
- 2026-05-22: correcciones aplicadas en hubs `uf-costo-de-vida` y `deuda-credito`, más remediaciones puntuales en artículos y contenido de glosario.
- 2026-05-22: verificación final hecha con búsqueda dirigida de cadenas problemáticas; sin cambios funcionales ni estructurales.
