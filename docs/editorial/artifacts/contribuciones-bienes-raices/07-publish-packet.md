# Gate 07 — Publish Packet: contribuciones-bienes-raices-chile

Status: SIGNED OFF — HumanEditor approved
HumanEditor: Carlos Ortega
Sign-off date: 2026-05-08
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
| **05** | **MathAuditAgent — ChatGPT** | ✓ COMPLETADO — ver `05-math-audit.md` (`FAIL`; remediación DraftAgent requerida) |
| **06** | **ComplianceAgent — Claude Code fresh session** | ✓ COMPLETADO — ver `06-compliance.md` (CONDITIONAL; DEFECT #1 resuelto, DEFECT #2 decisión editorial) |
| 07 | HumanEditor | ✓ SIGNED OFF — Carlos Ortega, 2026-05-08 |

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

## Estado de Gates

- **Gate 05 (ChatGPT)**: Completado 2026-05-05. Veredicto `FAIL`. Remediación DraftAgent completada (apertura corregida con exenciones, calendario TGR 2026, enfoque procedimental sin tasas, DFL-2 con Decreto 1101, F22 deferido a SII/contador).
- **Gate 06 (ComplianceAgent)**: Completado 2026-05-06. Veredicto CONDITIONAL (score 8.9). DEFECT #1 (DL 3.063) resuelto en blog file. DEFECT #2 (tasas) deferido a decisión editorial.
- **Gate 07 (HumanEditor)**: **SIGNED OFF** — Carlos Ortega, 2026-05-08.

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | Carlos Ortega |
| Rol | HumanEditor |
| Fecha | 2026-05-08 |
| Decisión | **Aprobado** — enfoque procedimental sin tasas SII aceptado como política editorial. |
| Notas | DEFECT #2 (tasas) queda como mejora futura. Verificar `check:frontmatter`, `check:links` y hero image antes de `draft:false`. |
