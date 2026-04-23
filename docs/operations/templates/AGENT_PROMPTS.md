# Agent Prompt Templates

Plantillas cortas para tareas recurrentes. Ajusta scope, paths y gates, pero no cambies la estructura base.

## Bugfix

```md
## Task Brief
- Objective: corregir un bug específico sin ampliar scope.
- In scope:
- Out of scope:
- Invariants/Contracts to preserve:
- Required gates: `pnpm run test`, `pnpm run lint`
- Deliverable: fix mínimo + evidencia de validación
```

## Editorial Refresh

```md
## Task Brief
- Objective: refrescar una URL publicada por cambio real de datos, norma o proceso.
- In scope:
- Out of scope: expansión editorial o nuevos slugs
- Invariants/Contracts to preserve: `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`, `INVARIANT.EDITORIAL.TIMELINESS_REVIEW_SLA`
- Required gates: `pnpm run check:frontmatter`, `pnpm run check:hero-images`, `pnpm run check:hero-prompts`, `pnpm run check:editorial`, `pnpm run check:editorial-timeliness`
- Deliverable: refresh + artefactos/editorial packet si aplica
```

## Sprint Docs

```md
## Task Brief
- Objective: documentar un sprint o cierre sin tocar runtime.
- In scope:
- Out of scope: cambios funcionales
- Invariants/Contracts to preserve: autoridad documental, truthfulness del backlog/log
- Required gates: `pnpm run check:docs`, `pnpm run check:context`
- Deliverable: reporte/cierre pequeño y verificable
```

## Governance Change

```md
## Task Brief
- Objective: cambiar o crear un guardrail/documento/workflow de gobernanza.
- In scope:
- Out of scope: refactors de runtime
- Invariants/Contracts to preserve: `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`
- Required gates: `pnpm run check:policy-registry`, `pnpm run check:docs`, `pnpm run check:context`
- Deliverable: cambio mínimo + ADR si cambia semántica de CI
```

## Ops Audit

```md
## Task Brief
- Objective: ejecutar una auditoría operativa y dejar artefacto repo-local o issue trazable.
- In scope:
- Out of scope: cambios productivos no justificados por la auditoría
- Invariants/Contracts to preserve: no afirmar acceso o resultados no verificados
- Required gates: `pnpm run check:policy-registry`, `pnpm run check:docs`
- Deliverable: scorecard, runbook update, issue o report con siguientes acciones
```
