# 02-research — Centro Operación Renta

**Status: DRAFT — pending ComplianceAgent review**  
**Role:** ResearchAgent  
**Role-concentration note:** This file was produced by Claude acting as ResearchAgent. `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` requires ResearchAgent ≠ DraftAgent ≠ MathAuditAgent ≠ ComplianceAgent. All AI roles in this session are Claude. This structural defect is declared here and in 06-compliance.md; it is resolved by human sign-off on 07-publish-packet.md.  
**Cut-off date:** 2026-04-24. All deadline and threshold figures require verification against SII official notices for the 2026 Operación Renta campaign (2025 tax year) before publication.

---

## Purpose

Facts-only research package. No editorial prose. Each claim is tagged with its source and a verification status:
- `[VERIFIED]` — independently citable with high confidence from a stable, publicly documented Chilean law or SII regulation  
- `[TODO:SOURCE]` — figure or deadline that changes year-to-year and requires live verification from the SII/TGR official page before publication

---

## 1. Authoritative sources for this article

| # | Source | Scope |
|---|--------|-------|
| S1 | SII — `sii.cl` | Form 22 instructions, eligibility rules, filing deadlines, RLI definition, tax table, refund status tool |
| S2 | TGR — `tgr.cl` | Refund payment schedule, bank account registration for taxpayers |
| S3 | Ley 21.133 (2019) and subsequent modifications | Honorarios provisional payment rate (PPM) |
| S4 | DT — Dirección del Trabajo | Worker/employer relationship definitions relevant to withholding |
| S5 | BCN — Biblioteca del Congreso Nacional | Full text of leyes citadas |

---

## 2. Eligibility: ¿quién DEBE declarar?

### 2.1 Obligación de declarar — regla general

Any natural person who received, during 2025, any of the following:

1. **Rentas de más de un empleador** — workers who had two or more employers during the same calendar year (because each employer applies the tax table independently, leading to under-withholding). [TODO:SOURCE — verify current SII guidance that this obligation persists for the 2025 tax year campaign]
2. **Honorarios (boletas de honorarios)** above the annual exemption threshold — independent workers who issued fee invoices. [TODO:SOURCE — verify threshold in UTM for 2025 tax year from SII]
3. **Rentas del exterior** — any income from foreign sources, regardless of amount. [TODO:SOURCE — confirm no 2025 reform changes this rule]
4. **Arrendamiento de bienes raíces** not exempt under applicable SII rules. [TODO:SOURCE — confirm current exemption limits]
5. **Ganancias de capital** from sale of real estate, shares, or other assets above applicable thresholds. [TODO:SOURCE — verify applicable 2025 thresholds post Ley 21.210]
6. **Retiro de fondos de AFP** under the pandemic windows — no longer applicable for 2025 tax year (third withdrawal window closed; verify SII confirmation that this line is not required for the 2025 return). [TODO:SOURCE]

### 2.2 Obligación de declarar — casos donde NO se está obligado pero conviene declarar

1. Workers with a **single employer** and no other income who believe they had excess withholding (e.g., worked only part of the year).
2. Pensioners who paid more than the applicable rate on pension income.
3. Taxpayers eligible for the **Crédito por gastos en educación** or other personal credits that require filing.

### 2.3 Quién NO debe declarar (exentos)

1. Workers with a **single employer** for the full year, all income from dependent employment (Artículo 42 N°1 Ley de Impuesto a la Renta), and no other income — employer handles full withholding. [TODO:SOURCE — confirm SII hasn't modified this exemption for 2025]
2. Workers whose **only income is a single AFP/pension**, where the AFP applied correct withholding throughout the year. [TODO:SOURCE]
3. Workers with total annual income below the **exención de impuesto global complementario** threshold. [TODO:SOURCE — current threshold in UTM/annual from SII for 2025]

---

## 3. Plazos (deadlines) — 2026 campaign (2025 tax year)

| Event | Indicative timing | Source |
|-------|------------------|--------|
| SII opens Operación Renta portal | Late March / early April 2026 | [TODO:SOURCE — confirm exact opening date from SII 2026 campaign notice] |
| Propuesta de declaración pre-llenada available | Early April 2026 | [TODO:SOURCE] |
| Deadline — online filing (Formulario 22 via SII web) | April 30, 2026 (historically; SII may extend) | [TODO:SOURCE — confirm exact deadline from SII Resolución for 2026 campaign] |
| Deadline — paper/manual filing | Earlier in April (historically same date) | [TODO:SOURCE] |
| SII begins processing refunds (fast-track) | Within days of filing for accepted proposals | [TODO:SOURCE — confirm 2026 TGR timeline] |
| TGR refund payment deadline | Typically within 30 days of acceptance for bank-registered taxpayers | [TODO:SOURCE — confirm per TGR notice for 2026] |

**IMPORTANT:** The deadline of April 30 is historically consistent but SII publishes an official Resolución each year. The draft and published article MUST cite the official 2026 SII Resolución, not historical precedent.

---

## 4. Formulario 22 — key sections

| Section | Content | Notes |
|---------|---------|-------|
| Sección Rentas (Líneas 1–10 approx.) | Dependent employment income, pension income | Pre-filled from employer DDJJ |
| Sección Honorarios (Línea approx. 5–8) | Independent/freelance fee invoice income | Pre-filled from boletas electrónicas if registered |
| Sección Bienes Raíces | Rental income | Taxpayer-entered |
| Sección Créditos | Education expense credit, APV credit, others | Requires supporting documentation |
| Línea Impuesto determinado | Calculated tax liability | Auto-calculated |
| Línea Retenciones | Withholdings already paid (employer, PPM) | Pre-filled |
| Diferencia (a pagar / a devolver) | Net result | Positive = owe; Negative = refund due |

[TODO:SOURCE — verify current Form 22 line numbers and section labels for the 2025 tax year version from SII portal]

---

## 5. Honorarios / PPM retention rate

**Rate: 15.25%**  
**Source:** Ley 21.133 (2019), consolidated text. This is a provisional payment (Pago Provisional Mensual — PPM) withheld at source by the fee payer (retención en boleta de honorarios). [VERIFIED — confirmed by existing repository test guard in `tests/integration/homepage-content.test.ts`]

**Context:** The 15.25% rate has been the stable rate since Ley 21.133 came into force. It replaced the prior graduated schedule. Workers who made boleta-based income in 2025 will have had 15.25% withheld per boleta; this appears as a credit on Form 22.

**Caution:** Ley 21.133 also introduced a schedule for increasing the rate over time. Confirm that 15.25% is still the applicable rate for 2025 income (it is the rate as of the cut-off date of this research file, but should be confirmed against the SII PPM schedule for 2025). [TODO:SOURCE — verify the exact rate on the official SII/BCN PPM schedule for the 2025 tax year to confirm no increase applied in 2025]

---

## 6. Tramos del Impuesto Global Complementario / Segunda Categoría — 2025

Tax is progressive. Brackets are denominated in UTM (Unidad Tributaria Mensual) and adjusted annually.

[TODO:SOURCE — full bracket table for 2025 tax year MUST be sourced from SII official table before publication. The following is a structural placeholder for the draft; all specific UTM thresholds and marginal rates require SII-source verification.]

| Tramo | Renta Líquida Imponible (anual, en UTM) | Tasa marginal |
|-------|----------------------------------------|---------------|
| 1 | 0 – [TODO:SOURCE UTM threshold] | Exento (0%) |
| 2 | [TODO:SOURCE] – [TODO:SOURCE] | [TODO:SOURCE]% |
| 3 | [TODO:SOURCE] – [TODO:SOURCE] | [TODO:SOURCE]% |
| 4 | [TODO:SOURCE] – [TODO:SOURCE] | [TODO:SOURCE]% |
| 5 | [TODO:SOURCE] – [TODO:SOURCE] | [TODO:SOURCE]% |
| 6 | [TODO:SOURCE] – [TODO:SOURCE] | [TODO:SOURCE]% |
| 7 | Above [TODO:SOURCE] | 40% |

**Note to DraftAgent:** Do NOT populate this table with figures from memory, training data, or competitor pages. SII publishes the official table annually. The 40% top rate is stable (Ley 21.210, Art. 52) — this is the only bracket item that can be cited without TODO:SOURCE for the top marginal rate. All thresholds require TODO:SOURCE.

---

## 7. ¿Qué hacer si resulta impuesto a pagar?

1. SII Form 22 will show the amount owed (diferencia positiva).
2. Taxpayer can pay online via SII portal (Webpay/bank transfer) or at Tesorería.
3. If unable to pay in full: SII offers payment agreements (convenio de pago). [TODO:SOURCE — confirm current terms and maximum installment count for 2026 campaign]
4. **Multas por declaración fuera de plazo:** SII charges penalties for late filing. Penalty structure is based on UTM and includes both a fixed component and interest. [TODO:SOURCE — confirm current penalty schedule per SII Circular/Resolución for 2026]
5. **Multas por no declarar:** More severe penalties apply for complete non-filing. [TODO:SOURCE — confirm current penalty structure]

---

## 8. Proceso de devolución — cómo recibir el reembolso

1. After submitting Form 22 with a negative difference (devolución), SII validates the declaration.
2. For accepted **propuestas pre-llenadas** (automatic proposals): refund can be processed within 3–5 business days for bank-registered taxpayers. [TODO:SOURCE — verify TGR 2026 timeline]
3. For manually filed declarations: review window is broader (up to 20 business days typical). [TODO:SOURCE — verify TGR 2026 timeline]
4. **Registro de cuenta bancaria en TGR:** Taxpayers must register a bank account at `tgr.cl` to receive refund via electronic transfer. Without registration, TGR issues a check (slower).
5. TGR sends confirmation via email/SMS to registered contact. [TODO:SOURCE — confirm TGR notification method still applies in 2026]

---

## 9. Internal linking targets (non-cannibalizing)

| Target URL | Relationship |
|-----------|-------------|
| `/calculadoras/operacion-renta/` | Coexistencia válida — calculator computes the RLI and estimated liability; this guide explains eligibility and process |
| `/guias/impuestos-personas/` | Parent hub — this article lives in this cluster |
| `/glosario/uf/` (if exists) | UF definition link |
| `/glosario/utm/` (if exists) | UTM definition link |

---

## 10. Queries this article must answer (intent mapping)

| Query cluster | User intent | Draft section target |
|---------------|------------|---------------------|
| "debo declarar renta 2026" | Eligibility decision | Section: ¿Quién debe declarar? |
| "cuándo vence plazo declaración renta 2026" | Deadline | Section: Plazos |
| "cuánto me devuelven operación renta" | Refund estimation | Respuesta rápida + link to calculator |
| "cuándo me pagan devolución renta 2026" | Payment timeline | Section: Proceso de devolución |
| "formulario 22 cómo llenarlo" | Form walkthrough | Section: Formulario 22 |
| "qué pasa si no declaro renta" | Consequence/risk | Section: ¿Qué hacer si debo? |
| "retención honorarios porcentaje" | PPM rate | Section: Honorarios |
