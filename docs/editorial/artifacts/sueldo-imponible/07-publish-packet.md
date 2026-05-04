# Gate 07 — Publish Packet: sueldo-imponible-chile

Status: BLOCKED — pending human sign-off
Slug: sueldo-imponible-chile
Pipeline opened: 2026-05-03
Cluster: sueldo-remuneraciones (HARDENED)
requires_calculation: true
regulatory_sensitivity: media

---

## Role Identity Map

| Stage | Role | Tool / Session | Status |
|---|---|---|---|
| PRE-02 | Claude Code Sprint 2B | editorial-topic-policy.mjs | ✓ |
| 02–04 | DraftAgent | Claude Code Sprint 2B | ✓ — TODO:SOURCE en tope UF, tramos ISC, tope APV |
| **05** | **MathAuditAgent** | **ChatGPT — sesión fresca** | ⬜ PENDIENTE — OBLIGATORIO |
| **06** | **ComplianceAgent** | **Claude Code fresh session** | ⬜ PENDIENTE |
| 07 | HumanEditor | Human | ⬜ PENDIENTE |

---

## Publication Gates

- [ ] G1 — TODO:SOURCE resueltos: tope UF, tramos ISC, tope APV Modalidad A
- [ ] G2 — Gate 05 MathAuditAgent PASS (ChatGPT)
- [ ] G3 — Gate 06 ComplianceAgent PASS (fresh session)
- [ ] G4 — Fecha de corte visible en artículo
- [ ] G5 — Ejemplo numérico completo con valores verificados
- [ ] G6 — Artículo no calcula sueldo líquido completo (redirige a owner)
- [ ] G7 — Hero image `/public/images/hero/sueldo-imponible-chile.avif`
- [ ] G8 — `draft: false`, `check:frontmatter` OK, `check:links` OK
- [ ] G9 — HumanEditor sign-off

---

## TODO:SOURCE

| # | Claim | Acción | Bloqueante |
|---|---|---|---|
| R1 | Tope máximo imponible UF exacto | Verificar en Superintendencia de Pensiones | Sí |
| R2 | Tabla ISC 7 tramos vigente 2026 | Verificar en SII | Sí |
| R3 | Tope APV Modalidad A en UTM | Verificar en SII instrucción circular APV | Sí |

---

## Inbound links (deferred a publicación)

| Fuente | Texto ancla | Estado |
|---|---|---|
| `como-calcular-sueldo-liquido` | "base imponible como paso previo" | ⬜ PENDIENTE |
| `liquidacion-de-sueldo` | "línea de remuneración imponible" | ⬜ PENDIENTE |
| `descuentos-de-sueldo` | "base sobre la que se aplican los descuentos" | ⬜ PENDIENTE |

---

## Handoff Gate 05 y 06

- **Gate 05 (ChatGPT)**: usar playbook `context/EDITORIAL_AI_PIPELINE.md` §8 Stage 05. Inputs: `04-draft.md` + `02-research.md`. Output → `05-math-audit.md`.
- **Gate 06 (Claude Code nueva sesión)**: usar playbook Stage 06. Leer: `NORMA_YMYL.md`, brief, `04-draft.md`, `05-math-audit.md`. Output → `06-compliance.md`.
