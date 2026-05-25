# PLAN — Entry Guide Ahorro e Inversion (2026-05-25)

Status: completed

## Objetivo

Implementar un piloto de orientacion previa en el owner `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` usando el wizard existente para derivar a articulos y calculadoras ya publicadas.

## Alcance

- Extender el contrato del wizard con CTA principal, enlaces secundarios, `resultKey`, perfil minimo y analytics configurables.
- Montar un orientador en el owner de ahorro e inversion sin crear una nueva URL indexable.
- Persistir señales minimas en `monedario_profile`.
- Agregar pruebas de perfil y del arbol del orientador.

## Restricciones

- Sin nuevas rutas publicas.
- Sin cambios a reglas activas de `next best step`.
- Mantener compatibilidad con wizards existentes.

## Progreso

- 2026-05-25: Se confirma que el owner esta en `.md`; el montaje se hara desde `PostDetails.astro` con `entryGuideId` de frontmatter, evitando migrar el articulo a MDX.
- 2026-05-25: Se extendio `DecisionWizard` con `resultKey`, `primaryCta`, `secondaryLinks`, `profilePatch` y analytics configurables manteniendo compatibilidad con wizards existentes.
- 2026-05-25: Se implemento el orientador `ahorro-inversion-entry-guide` y se monto en el owner `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` via `entryGuideId` + `ArticleEntryGuide.astro`, sin crear rutas nuevas.
- 2026-05-25: Se agregaron señales minimas al perfil (`time_horizon`, `has_emergency_fund`, `primary_goal`, `intent_mode`) y pruebas de arbol/perfil.
- 2026-05-25: Se refactorizo el flujo a `early exit` y branching adaptativo. El guide ya no pregunta horizonte ni modo cuando esas respuestas no cambian la salida.
- 2026-05-25: Se formalizo la regla transversal de preguntas discriminativas en `docs/adr/ADR-20260525-discriminative-decision-surfaces.md` y se agrego analizador reusable en dominio.

## Evidencia

- `pnpm exec vitest run tests/integration/userProfile.test.ts tests/integration/articleEntryGuides.test.ts`
- `pnpm exec astro check`
