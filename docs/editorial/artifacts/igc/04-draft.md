# Gate 04 — Draft: impuesto-global-complementario-chile

Status: DRAFT — pending MathAuditAgent (ChatGPT) and ComplianceAgent (fresh Claude Code session)
Role: DraftAgent (Claude Code — Sprint 2B)
Fecha de corte: 2026-05-03
requires_calculation: true
regulatory_sensitivity: alta

> **SoD NOTICE**: DraftAgent = Claude Code Sprint 2B. Gate 05 → ChatGPT (obligatorio). Gate 06 → nueva sesión Claude Code (obligatorio por alta sensibilidad).
> **TODO:SOURCE críticos**: tabla de tramos IGC en UTA, valor UTA 2026, tasa retención honorarios 2026, condiciones exactas APV Modalidad A vs B.

El cuerpo del draft está en `src/data/blog/impuesto-global-complementario-chile.md` (draft: true).

---

## TODO:SOURCE para MathAuditAgent

| # | Claim | Prioridad |
|---|---|---|
| C3/C4 | Tabla 7 tramos IGC con UTA 2026 y equivalencia en pesos | CRÍTICO |
| C4 | Valor exacto UTA 2026 (= 12 × UTM dic. año anterior) | CRÍTICO |
| C6 | Tasa retención honorarios vigente 2026 | Alta |
| C7 | Condiciones APV Modalidad A (crédito 15%) vs Modalidad B (reducción base) — topes vigentes | Alta |
| C8 | Condiciones deducción contribuciones bienes raíces para arrendadores en IGC | Alta |

## Decisión editorial confirmada

- Ganancias de capital: **excluidas del scope** de esta versión. El artículo menciona explícitamente que no las cubre. Esta decisión queda registrada aquí para que ComplianceAgent lo valide como scope decision, no como omisión accidental.
