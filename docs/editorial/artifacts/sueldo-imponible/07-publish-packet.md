# Gate 07 — Publish Packet: sueldo-imponible-chile

Status: SIGNED OFF — HumanEditor approved
HumanEditor: Carlos Ortega
Sign-off date: 2026-05-08
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
| **05** | **MathAuditAgent** | **ChatGPT — sesión fresca** | ✓ COMPLETADO — ver `05-math-audit.md` (`FAIL`; remediación DraftAgent requerida) |
| **06** | **ComplianceAgent** | **Claude Code fresh session** | ✓ COMPLETADO — ver `06-compliance.md` (CONDITIONAL → PASS ciclo 4) |
| 07 | HumanEditor | Human | ✓ SIGNED OFF — Carlos Ortega, 2026-05-08 |

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

| # | Claim | Acción | Bloqueante | Estado |
|---|---|---|---|---|---|
| R1 | Tope máximo imponible UF exacto | Verificado en Superintendencia de Pensiones: 90,0 UF (AFP/salud) y 135,2 UF (AFC) | Sí | ✓ RESUELTO |
| R2 | Tabla ISC 7 tramos vigente 2026 | Verificado en SII AT 2026. 4° tramo: 13,5–30 UTM, tasa 4%, rebaja $38.117,52 | Sí | ✓ RESUELTO |
| R3 | Tope APV Modalidad A en UF | Verificado art. 42 bis: 50 UF mensual / 600 UF anual | Sí | ✓ RESUELTO |

---

## Inbound links (deferred a publicación)

| Fuente | Texto ancla | Estado |
|---|---|---|
| `como-calcular-sueldo-liquido` | "base imponible como paso previo" | ⬜ PENDIENTE |
| `liquidacion-de-sueldo` | "línea de remuneración imponible" | ⬜ PENDIENTE |
| `descuentos-de-sueldo` | "base sobre la que se aplican los descuentos" | ⬜ PENDIENTE |

---

## Handoff Gate 05 y 06

- **Gate 05 (ChatGPT)**: ejecutado 2026-05-05. Resultado en `05-math-audit.md` con veredicto `FAIL`. Remediación realizada en ciclos 1-2 DraftAgent.
- **Gate 06 (Claude Code)**: ejecutado 2026-05-06 → CONDITIONAL. Ciclo 4 (2026-05-08): DEFECT #2 resuelto (tramos ISC explicitados). Veredicto final: **PASS**. Artículo elegible para Gate 07 humano.

### Remediación completada (ciclos 1-4)

Todos los defectos de Gate 05 y 06 están resueltos. Ver `06-compliance.md` para el detalle.

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | Carlos Ortega |
| Rol | HumanEditor |
| Fecha | 2026-05-08 |
| Decisión | **Aprobado** — todos los defectos de pipeline resueltos. Artículo eligible para publicación. |
| Notas | Verificar `check:frontmatter`, `check:links` y hero image antes de `draft: false`. Inbound links diferidos a post-publicación. |
