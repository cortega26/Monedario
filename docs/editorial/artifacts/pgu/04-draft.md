# Gate 04 — Draft: pgu-pension-garantizada-universal

Status: DRAFT — pending MathAuditAgent (ChatGPT) and ComplianceAgent (fresh Claude Code session)
Role: DraftAgent (Claude Code — Sprint 2B)
Fecha de corte: 2026-05-03
requires_calculation: true
regulatory_sensitivity: alta

> **SoD NOTICE**: DraftAgent = Claude Code Sprint 2B. Gate 05 → ChatGPT (obligatorio por requires_calculation). Gate 06 → nueva sesión Claude Code (obligatorio por regulatory_sensitivity=alta).
> **TODO:SOURCE críticos**: monto PGU vigente (C1), fórmula de complemento AFP (C5), texto exacto del requisito de residencia (C3), percentil vigente (C4).

El cuerpo completo del draft está en `src/data/blog/pgu-pension-garantizada-universal.md` (draft: true).

---

## TODO:SOURCE para MathAuditAgent (ChatGPT)

| # | Claim | Descripción | Prioridad |
|---|---|---|---|
| C1 | Monto PGU vigente | Verificar en IPS el monto mensual vigente al 2026-05-03 | CRÍTICO — sin esto no se puede publicar |
| C5 | Fórmula complemento PGU/AFP | Verificar en Superintendencia de Pensiones la fórmula exacta de reducción | CRÍTICO — sección de interacción AFP depende de esto |
| C3 | Texto exacto requisito de residencia | Verificar en BCN ley vigente que crea la PGU | Alta |
| C4 | Percentil 90% y criterio de medición | Verificar en Ministerio Desarrollo Social si sigue siendo percentil 90% | Alta |
| C7 | Condiciones extranjeros residentes | Verificar si IPS tiene condiciones adicionales para extranjeros | Media |
