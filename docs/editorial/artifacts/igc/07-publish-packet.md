# Gate 07 — Publish Packet: impuesto-global-complementario-chile

Status: BLOCKED — pending human sign-off
Slug: impuesto-global-complementario-chile
Pipeline: 2026-05-03
Cluster: impuestos-personas
requires_calculation: true
regulatory_sensitivity: alta

---

## Role Identity Map

| Stage | Tool | Status |
|---|---|---|
| PRE-02 | Claude Code Sprint 2B | ✓ |
| 02–04 | DraftAgent — Claude Code Sprint 2B | ✓ — TODO:SOURCE en tabla UTA, retenciones, APV |
| **05** | **MathAuditAgent — ChatGPT** | ⬜ OBLIGATORIO (requires_calculation=true) |
| **06** | **ComplianceAgent — Claude Code fresh session** | ⬜ OBLIGATORIO (regulatory_sensitivity=alta) |
| 07 | HumanEditor | ⬜ PENDIENTE — sign-off explícito obligatorio |

---

## Publication Gates

- [ ] G1 — Tabla IGC 7 tramos con UTA 2026 verificada y en el artículo
- [ ] G2 — Valor UTA 2026 confirmado
- [ ] G3 — Tasa retención honorarios 2026 verificada
- [ ] G4 — Condiciones APV Modalidad A/B verificadas
- [ ] G5 — Decisión de excluir ganancias de capital documentada en artículo (ya presente)
- [ ] G6 — Gate 05 MathAuditAgent PASS o CONDITIONAL resuelto
- [ ] G7 — Gate 06 ComplianceAgent PASS
- [ ] G8 — Fecha de corte visible
- [ ] G9 — Sin simulación de resultado exacto de F22
- [ ] G10 — Separación clara de head term F22 vs IGC
- [ ] G11 — Hero image `/public/images/hero/impuesto-global-complementario-chile.avif`
- [ ] G12 — `draft: false`, `check:frontmatter` OK, `check:links` OK
- [ ] G13 — HumanEditor sign-off

---

## Inbound links (deferred)

| Fuente | Texto ancla | Estado |
|---|---|---|
| `boleta-honorarios-2026-retencion-cobertura` | "honorarios que pueden gatillar IGC" | ⬜ PENDIENTE |
| `operacion-renta-f22-checklist` | "el F22 liquida el IGC para rentas mixtas" | ⬜ PENDIENTE |

---

## Handoff

- **Gate 05 (ChatGPT)**: playbook Stage 05. Inputs: `04-draft.md` + `02-research.md`. Énfasis en tabla UTA, créditos APV y retenciones de honorarios.
- **Gate 06 (nueva sesión Claude Code)**: playbook Stage 06. Leer: `NORMA_YMYL.md`, `briefs/igc.md`, `04-draft.md`, `05-math-audit.md`. Verificar que ganancias de capital estén explícitamente declaradas fuera del scope.
