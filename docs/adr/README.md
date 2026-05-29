# ADR Index

## Purpose

Esta carpeta guarda el registro canonico de decisiones arquitectonicas del repositorio.

## Cuando crear un ADR

Crea un ADR cuando cambie alguno de estos ejes:

- boundaries entre capas
- contratos o lifecycle de campos
- estrategia de URL, canonical o RSS
- semantica de gates en CI
- guardrails de performance o gobernanza con efecto estructural

## Decisiones activas destacadas

| ADR | Status | Topic | Area |
|---|---|---|---|
| `ADR-20260304-documentation-restructure.md` | Accepted | Reestructura de documentacion | docs, context |
| `ADR-20260411-competitive-adaptation-policy.md` | Accepted | Gobernanza para benchmarking externo | editorial, governance |
| `ADR-20260412-external-link-ci-gate.md` | Accepted | Gate de links externos en CI | validation, CI |
| `ADR-20260511-editorial-artifact-location-policy.md` | Accepted | Politica de ubicacion de artefactos editoriales | editorial, governance |
| `ADR-20260529-repo-self-healing-maintenance.md` | Accepted | Mantenimiento auto-reparable: gate diario en main, auto-PR de drift mecanico, deteccion de codigo muerto | CI, governance |

## Convencion minima

Cada ADR debe incluir:

- Context
- Decision
- Consequences
- Alternatives considered
- Verification

Usa `docs/adr/_TEMPLATE.md` como base para nuevas decisiones.
