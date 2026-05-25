# ADR-20260525-discriminative-decision-surfaces

Date: 2026-05-25
Status: Accepted

## Context

Monedario empezó a usar superficies guiadas (`DecisionWizard`, entry guides, wizards procedurales) para reducir ambigüedad y derivar mejor a artículos, herramientas o pasos oficiales.

El riesgo observado en el primer piloto fue claro: si una pregunta no cambia la salida, el usuario paga el costo de responderla sin recibir una respuesta más precisa. Eso genera fricción, sensación de pseudo-personalización y complejidad editorial innecesaria.

## Decision

Se adopta la siguiente regla transversal para superficies de decisión del repo:

**Toda pregunta en un wizard, orientador o flujo guiado debe cambiar al menos una de estas dos cosas:**

1. la salida final alcanzable por el usuario en ese flujo; o
2. el comportamiento inmediatamente posterior del mismo flujo de forma verificable.

Corolarios:

- Si todas las opciones de un paso llevan al mismo conjunto de resultados, el paso es defectuoso y debe eliminarse, fusionarse o reordenarse.
- Si una pregunta solo recolecta contexto "por si acaso", no debe mostrarse.
- Si la mejor salida depende de menos preguntas, el flujo debe usar `early exit`.
- "Más personalización" no justifica más pasos si no aumenta discriminación real.

## Consequences

Positivo:

- Menos fricción y abandono.
- Flujos más honestos: la personalización visible coincide con la personalización real.
- Menor costo de mantenimiento del árbol.

Trade-off:

- Algunos árboles tendrán menos combinaciones aparentes.
- La cobertura fina deberá ganarse con mejores rutas o más contenido útil, no con preguntas cosméticas.

## Enforcement

- Nuevo helper de dominio: `src/domain/wizard/analyzeWizardConfig.ts`
- Regla de revisión: todo wizard reusable debería poder analizarse con esta regla.
- Pruebas del piloto de ahorro deben fallar si aparece un paso no discriminativo.

## Related

- `src/components/DecisionWizard.astro`
- `src/config/articleEntryGuides.ts`
- `docs/backlog/PLAN-entry-guide-ahorro-inversion-2026-05-25.md`
