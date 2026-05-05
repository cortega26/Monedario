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
| **05** | **MathAuditAgent — ChatGPT** | ✓ COMPLETADO — ver `05-math-audit.md` (`FAIL`; remediación DraftAgent requerida) |
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

- **Gate 05 (ChatGPT)**: ejecutado 2026-05-05. Resultado en `05-math-audit.md` con veredicto `FAIL`.
- **Gate 06 (nueva sesión Claude Code)**: playbook Stage 06. Leer: `NORMA_YMYL.md`, `briefs/igc.md`, `04-draft.md`, `05-math-audit.md`. Verificar que ganancias de capital estén explícitamente declaradas fuera del scope.

### Remediación requerida para DraftAgent antes de reabrir Gate 06

1. Reemplazar la URL BCN de la LIR en el artículo: no usar `idNorma=8657`; la referencia verificada en esta auditoría es `idNorma=6368`.
2. Completar el artículo con los valores ya verificados para 2026: UTA `CLP $834.504`, tramo exento anual `CLP $11.265.804` y retención de honorarios `15,25%`.
3. Si se publica tabla de tramos anual, usar sólo la tabla oficial SII AT 2026 ya verificada en esta auditoría; no dejar placeholders ni equivalencias aproximadas.
4. Reescribir la sección APV antes de publicar: la formulación actual A/B no quedó cerrada. Mantener sólo lo que esté sustentado por artículo 42 bis y FAQ SII, con topes en UF.
5. No publicar como regla cerrada la deducción de contribuciones para arrendadores mientras no exista en este artefacto una instrucción oficial SII/F22 que la respalde expresamente.
