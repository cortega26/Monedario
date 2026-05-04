# Gate 07 — Publish Packet: pgu-pension-garantizada-universal

Status: BLOCKED — pending human sign-off
Slug: pgu-pension-garantizada-universal
Pipeline: 2026-05-03
Cluster: pensiones-afp (HARDENED)
requires_calculation: true
regulatory_sensitivity: alta

---

## Role Identity Map

| Stage | Tool | Status |
|---|---|---|
| PRE-02 | Claude Code Sprint 2B | ✓ |
| 02–04 | DraftAgent — Claude Code Sprint 2B | ✓ — TODO:SOURCE críticos en monto PGU y fórmula complemento |
| **05** | **MathAuditAgent — ChatGPT** | ⬜ OBLIGATORIO (requires_calculation=true) |
| **06** | **ComplianceAgent — Claude Code fresh session** | ⬜ OBLIGATORIO (regulatory_sensitivity=alta + human sign-off requerido) |
| 07 | HumanEditor | ⬜ PENDIENTE — **sign-off explícito obligatorio por alta sensibilidad YMYL** |

---

## Publication Gates

- [ ] G1 — Monto PGU vigente confirmado y en el artículo
- [ ] G2 — Fórmula complemento AFP verificada por MathAuditAgent
- [ ] G3 — Requisito de residencia verificado con texto legal
- [ ] G4 — Percentil 90% y criterio de medición verificados
- [ ] G5 — Gate 05 MathAuditAgent PASS o CONDITIONAL resuelto
- [ ] G6 — Gate 06 ComplianceAgent PASS
- [ ] G7 — HumanEditor sign-off explícito (obligatorio por regulatory_sensitivity=alta)
- [ ] G8 — Fecha de corte visible y prominente
- [ ] G9 — Sin recomendación de AFP específica
- [ ] G10 — Sin predicción de monto individual definitivo
- [ ] G11 — Hero image `/public/images/hero/pgu-pension-garantizada-universal.avif`
- [ ] G12 — `draft: false`, `check:frontmatter` OK, `check:links` OK
- [ ] G13 — HumanEditor aprueba publicación

---

## Inbound links (deferred)

| Fuente | Texto ancla | Estado |
|---|---|---|
| `reforma-previsional-2025-que-cambia-y-como-te-afecta` | "PGU en el contexto de la reforma" | ⬜ PENDIENTE |
| `fondos-afp-a-b-c-d-e` | "PGU para quienes no acumularon suficiente" | ⬜ PENDIENTE |

---

## Handoff

- **Gate 05 (ChatGPT)**: playbook Stage 05. Inputs: `04-draft.md` + `02-research.md`. Énfasis en verificar monto PGU y fórmula complemento AFP.
- **Gate 06 (nueva sesión Claude Code)**: playbook Stage 06. Leer: `NORMA_YMYL.md`, `briefs/pgu.md`, `04-draft.md`, `05-math-audit.md`.
