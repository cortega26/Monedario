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
| `ADR-20260716-temporary-self-hosted-actions-bridge.md` | Accepted | Puente temporal de runner self-hosted ante agotamiento de minutos | CI, operations |
| `ADR-20260929-effective-dated-economic-parameters.md` | Accepted | Parámetros fiscales congelados por año tributario y modelo effective-dated | domain, data, tax |
| `ADR-20261001-utm-month-boundary-freshness.md` | Accepted | Frescura UTM en cambio de mes y gracia de 7 días | domain, data, YMYL |
| `ADR-20260929-calculator-field-migration.md` | Accepted | Migración de inputs de calculadoras a `CalculatorField` por lotes | components, UX, maintenance |
| `ADR-20260929-ai-independent-audit-protocol.md` | Accepted | Auditorías independientes por IA con protocolo anti-alucinación como pre-gate YMYL | editorial, governance, YMYL |

## Convencion minima

Cada ADR debe incluir:

- Context
- Decision
- Consequences
- Alternatives considered
- Verification

Usa `docs/adr/_TEMPLATE.md` como base para nuevas decisiones.
