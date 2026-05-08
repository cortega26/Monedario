# Gate 07 — Publish Packet: impuesto-global-complementario-chile

Status: SIGNED OFF — HumanEditor approved
HumanEditor: Carlos Ortega
Sign-off date: 2026-05-08
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
| **05** | **MathAuditAgent — ChatGPT** | ✓ COMPLETADO — ver `05-math-audit.md` (`FAIL`; remediación DraftAgent requerida) |
| **06** | **ComplianceAgent — Claude Code fresh session** | ✓ COMPLETADO — ver `06-compliance.md` (CONDITIONAL; DEFECT #1 resuelto en blog file) |
| 07 | HumanEditor | ✓ SIGNED OFF — Carlos Ortega, 2026-05-08 (regulatory_sensitivity=alta) |

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

## Estado de Gates

- **Gate 05 (ChatGPT)**: Completado 2026-05-05. Veredicto `FAIL`. Remediación DraftAgent completada (BCN idNorma=6368 corregido, UTA $834.504 verificado, retención 15,25% insertada, APV con topes UF, contribuciones deferidas a F22/contador).
- **Gate 06 (ComplianceAgent)**: Completado 2026-05-06. Veredicto CONDITIONAL (score 9.175). DEFECT #1 (APV topes 50 UF/600 UF) resuelto en blog file. DEFECT #2 (contribuciones LIR) deferido a decisión editorial.
- **Gate 07 (HumanEditor)**: **SIGNED OFF** — Carlos Ortega, 2026-05-08.

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | Carlos Ortega |
| Rol | HumanEditor |
| Fecha | 2026-05-08 |
| Decisión | **Aprobado** — `regulatory_sensitivity=alta`. Valores UTA, tramos y retención revisados y aceptados. DEFECT #2 (contribuciones LIR) aceptado como deferral editorial. |
| Notas | El editor confirma verificación de UTA $834.504 y retención 15,25% AT 2026 en SII. Re-verificar al momento de activar `draft:false`. |
