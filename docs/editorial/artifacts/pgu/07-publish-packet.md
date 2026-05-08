# Gate 07 — Publish Packet: pgu-pension-garantizada-universal

Status: SIGNED OFF — HumanEditor approved
HumanEditor: Carlos Ortega
Sign-off date: 2026-05-08
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
| **05** | **MathAuditAgent — ChatGPT** | ✓ COMPLETADO — ver `05-math-audit.md` (`FAIL`; remediación DraftAgent requerida) |
| **06** | **ComplianceAgent — Claude Code fresh session** | ✓ COMPLETADO — ver `06-compliance.md` (CONDITIONAL; DEFECT #1 resuelto en blog file) |
| 07 | HumanEditor | ✓ SIGNED OFF — Carlos Ortega, 2026-05-08 (regulatory_sensitivity=alta) |

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

## Estado de Gates

- **Gate 05 (ChatGPT)**: Completado 2026-05-05. Veredicto `FAIL`. Remediación DraftAgent aplicó todos los items (residencia 20+4 años, montos $231.732/$250.275, umbrales $789.139/$1.252.602, Ley 21.419 citada).
- **Gate 06 (ComplianceAgent)**: Completado 2026-05-06. Veredicto CONDITIONAL (score 9.175). DEFECT #1 (Ley 21.419) resuelto en blog file.
- **Gate 07 (HumanEditor)**: **SIGNED OFF** — Carlos Ortega, 2026-05-08.

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | Carlos Ortega |
| Rol | HumanEditor |
| Fecha | 2026-05-08 |
| Decisión | **Aprobado** — `regulatory_sensitivity=alta`. Montos y umbrales revisados y aceptados para publicación. |
| Notas | El editor confirma verificación de montos $231.732/$250.275 en IPS y umbrales $789.139/$1.252.602 en SP vigentes al 2026-05-03. Re-verificar al momento de activar `draft:false`. |
