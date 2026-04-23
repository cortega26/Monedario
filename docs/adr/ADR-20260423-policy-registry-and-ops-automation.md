# ADR-20260423-policy-registry-and-ops-automation

Date: 2026-04-23
Status: Accepted

## Context

El repositorio ya tenía múltiples gates, workflows programados y runbooks operativos, pero la verdad operativa estaba repartida entre `package.json`, `GATE_MANIFEST`, `AGENT_TASK_INDEX`, `AGENT_PREFLIGHT`, workflows de GitHub y políticas manuales.

Eso producía tres problemas:

- drift documental y operativo difícil de detectar antes de que rompiera sesiones de agente;
- mantenimiento repetitivo todavía muy dependiente de memoria humana;
- costo de arranque alto para agentes nuevos, que debían leer demasiados archivos para elegir el entrypoint correcto.

Además, este cambio altera semántica de CI/gobernanza al introducir un nuevo guardrail bloqueante (`check:policy-registry`) y nuevos workflows programados. Bajo `docs/development/CONSTITUTION_BINDING_RULES.md` Rule 4.3, eso requiere ADR.

## Decision

Se adopta una capa operativa única compuesta por:

1. `docs/operations/POLICY_REGISTRY.json` como inventario autoritativo de guardrails y políticas mixtas/manuales.
2. `scripts/check-policy-registry.mjs` como verificador de drift entre:
   - `package.json`
   - `docs/operations/GATE_MANIFEST.json`
   - `docs/operations/AGENT_TASK_INDEX.md`
   - `context/AGENT_PREFLIGHT.md`
   - `context/AGENT_ENTRYPOINTS.{md,json}`
   - workflows y docs referenciados por la policy registry
3. Nuevos workflows programados:
   - `guardrail-drift-audit.yml`
   - `doc-gardening.yml`
   - `dependency-automerge.yml`
   - `weekly-search-ops.yml`
4. Un mapa de entrada para agentes (`context/AGENT_ENTRYPOINTS.{md,json}`) y plantillas operativas cortas.
5. Cuatro skills locales orientadas al proyecto para routing, preflight, refresh editorial y weekly ops.

## Consequences

### Positivas

- El drift entre scripts, docs y workflows se detecta antes.
- Las tareas repetitivas quedan institucionalizadas en workflows e issues actualizables.
- El arranque de sesiones de agente requiere menos contexto y menos reconstrucción manual.
- Dependabot queda agrupado y el auto-merge se limita a patches de bajo riesgo con CI verde.

### Trade-offs

- Se agrega una nueva capa documental/operativa que también debe mantenerse.
- `check:policy-registry` aumenta la fricción para cambios de gobernanza mal sincronizados.
- Los workflows programados agregan ruido operativo si los títulos/labels no se mantienen disciplinados.

## Alternatives considered

### Mantener el estado actual

Descartado porque conserva el problema central: la verdad operativa seguiría repartida y el drift se detectaría demasiado tarde.

### Generar toda la documentación de agentes automáticamente

Descartado por ahora. Se eligió una validación fuerte entre archivos canónicos antes que una generación total, para mantener el cambio incremental y reviewable.

### Automatizar completamente hero images y publicación YMYL

Descartado por política. Ambas superficies siguen requiriendo intervención humana final.

## Verification

- `pnpm run check:policy-registry`
- `pnpm run check:hero-prompts`
- `pnpm run test`
- `pnpm run check:docs`
- `pnpm run check:context`
