# Gate 07 — Publish Packet: contribuciones-bienes-raices-chile

Status: BLOCKED — pending human sign-off
Slug: contribuciones-bienes-raices-chile
Pipeline: 2026-05-03
Cluster: impuestos-personas
requires_calculation: true
regulatory_sensitivity: media-alta

---

## Role Identity Map

| Stage | Tool | Status |
|---|---|---|
| PRE-02 | Claude Code Sprint 2B | ✓ |
| 02–04 | DraftAgent — Claude Code Sprint 2B | ✓ — TODO:SOURCE en tasas, exenciones, calendario |
| **05** | **MathAuditAgent — ChatGPT** | ⬜ OBLIGATORIO |
| **06** | **ComplianceAgent — Claude Code fresh session** | ⬜ PENDIENTE |
| 07 | HumanEditor | ⬜ PENDIENTE |

---

## Publication Gates

- [ ] G1 — Tasas confirmadas (1,2%/1,0%), calendario TGR 2026 exacto
- [ ] G2 — Exenciones primera vivienda y adultos mayores con valores verificados
- [ ] G3 — Deducibilidad F22 para arrendadores verificada con instrucción SII
- [ ] G4 — Gate 05 MathAuditAgent PASS
- [ ] G5 — Gate 06 ComplianceAgent PASS
- [ ] G6 — Fecha de corte visible
- [ ] G7 — Hero image `/public/images/hero/contribuciones-bienes-raices-chile.avif`
- [ ] G8 — `draft: false`, `check:frontmatter` OK, `check:links` OK
- [ ] G9 — HumanEditor sign-off

---

## Inbound links (deferred)

| Fuente | Texto ancla | Estado |
|---|---|---|
| `operacion-renta-f22-checklist` | "contribuciones como línea deducible en el F22" | ⬜ PENDIENTE |

---

## Handoff Gate 05 y 06

- **Gate 05 (ChatGPT)**: playbook Stage 05, `context/EDITORIAL_AI_PIPELINE.md` §8. Inputs: `04-draft.md` + `02-research.md`.
- **Gate 06 (nueva sesión)**: playbook Stage 06. Leer: `NORMA_YMYL.md`, brief, `04-draft.md`, `05-math-audit.md`.
