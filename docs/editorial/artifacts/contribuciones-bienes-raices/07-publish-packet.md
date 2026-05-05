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
| **05** | **MathAuditAgent — ChatGPT** | ✓ COMPLETADO — ver `05-math-audit.md` (`FAIL`; remediación DraftAgent requerida) |
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

- **Gate 05 (ChatGPT)**: ejecutado 2026-05-05. Resultado en `05-math-audit.md` con veredicto `FAIL`.
- **Gate 06 (nueva sesión)**: playbook Stage 06. Leer: `NORMA_YMYL.md`, brief, `04-draft.md`, `05-math-audit.md`.

### Remediación requerida para DraftAgent antes de reabrir Gate 06

1. Reescribir la apertura del artículo: no afirmar que toda persona con propiedad “paga contribuciones”, porque el propio tema contempla exenciones totales o parciales.
2. Actualizar el calendario con las fechas exactas ya verificadas en TGR 2026: `30 de abril`, `30 de junio`, `30 de septiembre` y `30 de noviembre`.
3. No publicar tasas `1,2%` ni `1,0%` mientras no haya fuente oficial SII cerrada a la fecha de corte; si no se consigue, reformular el artículo como guía procedimental centrada en avalúo, consulta y pago.
4. Si se mantiene la mención a DFL-2, usar sólo lo verificado en BCN: norma correcta `decreto 1101` (`i=16842`), vivienda económica con superficie edificada no superior a `140 m²`, beneficio restringido a personas naturales y a un máximo de dos viviendas.
5. No publicar la sección de deducibilidad en F22 como regla cerrada hasta que exista instrucción oficial SII que la respalde en este artefacto.
