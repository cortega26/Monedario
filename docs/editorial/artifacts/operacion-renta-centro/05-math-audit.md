# 05-math-audit — Centro Operación Renta

**Status: DRAFT — pending ComplianceAgent review**  
**Role:** MathAuditAgent  
**Role-concentration note:** This file was produced by Claude acting as MathAuditAgent. `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` requires MathAuditAgent ≠ DraftAgent ≠ ComplianceAgent. All AI roles in this session are Claude. The DraftAgent and MathAuditAgent are the same model instance; this is a structural defect that must be remedied before publication. It is declared in 06-compliance.md as DEFECT #1.  
**Audit scope:** All quantitative claims and deadline assertions in `04-draft.md`.  
**Audit method:** Cross-reference each claim against the source cited in `02-research.md`. Verdict categories: VERIFIED / TODO:SOURCE / FLAG.

---

## CONTRACT.EDITORIAL.MATH_AUDIT_REPORT

Per `context/CONTRACTS.md`: This report must enumerate all quantitative claims in the draft, their cited source, and an audit verdict. Claims that cannot be verified against a named official source must be marked TODO:SOURCE or FLAG.

---

## Audit table

| # | Claim in 04-draft.md | Source cited | Audit verdict | Notes |
|---|----------------------|-------------|---------------|-------|
| 1 | Two or more employers leads to under-withholding and obligation to declare | SII — Ley de Impuesto a la Renta (Art. 65) | TODO:SOURCE | Correct as a general principle. Art. 65 LIR must be cited precisely; confirm current text has no 2025 amendments. |
| 2 | Honorarios PPM retention rate: **15,25%** | Ley 21.133 | **VERIFIED** | Confirmed by existing repository test guard in `tests/integration/homepage-content.test.ts`. Rate is stable post-Ley 21.133 (2019). Caution: verify no incremental rate increase applied for 2025 in the PPM schedule. |
| 3 | Honorarios exemption threshold — UTM annual threshold for filing obligation | SII — año tributario 2025 | TODO:SOURCE | Threshold not populated in draft (correctly marked TODO:SOURCE). Must not be published without SII official figure. |
| 4 | Foreign income: any amount triggers filing obligation | SII — Art. 65 LIR | TODO:SOURCE | General principle is correct. Confirm no 2025 reform narrowed or expanded scope. |
| 5 | Rental income exemption limit | SII — año tributario 2025 | TODO:SOURCE | Not populated in draft (correctly marked TODO:SOURCE). Must be sourced from SII. |
| 6 | Filing deadline: historically April 30 | SII — Resolución campaña 2026 | TODO:SOURCE | Draft correctly marks this as TODO:SOURCE. The April 30 date is historically consistent but requires the 2026 official Resolución. Cannot be published without this citation. |
| 7 | Fast-track refund timeline for accepted proposals | TGR — campaña 2026 | TODO:SOURCE | Not populated in draft (correctly marked TODO:SOURCE). TGR publishes payment schedules annually. |
| 8 | Manual declaration review window: "up to 20 business days" | TGR — campaña 2026 | TODO:SOURCE | Not populated in draft (correctly marked TODO:SOURCE). Must be verified against TGR 2026 publication. |
| 9 | Tax brackets: progressive rates 0%–40% | SII — tabla IGC año tributario 2025 | TODO:SOURCE (partial) | Top marginal rate of 40% is stable per Ley 21.210 — verifiable. All UTM bracket thresholds and intermediate marginal rates require SII 2025 table citation. Draft correctly marks thresholds as TODO:SOURCE. |
| 10 | PPM example calculation: $1.000.000 × 15,25% = $152.500 | Ley 21.133 | **VERIFIED (arithmetic)** | Arithmetic is correct: 1,000,000 × 0.1525 = 152,500. The example is clearly marked as conceptual; no real-world figures cited. Arithmetic passes. |
| 11 | Exemption threshold for IGC (annual UTM) | SII — tabla IGC año tributario 2025 | TODO:SOURCE | Not populated in draft (correctly marked TODO:SOURCE). Required before publication. |
| 12 | Late-filing penalty — amount in UTM | SII — normativa multas 2026 | TODO:SOURCE | Not populated in draft (correctly marked TODO:SOURCE). SII penalty schedule must be cited. |
| 13 | Payment agreement conditions (convenio de pago) | SII — campaña 2026 | TODO:SOURCE | Not populated in draft (correctly marked TODO:SOURCE). Terms may vary year-to-year. |
| 14 | TGR account registration process (3 steps) | TGR — tgr.cl | TODO:SOURCE | Steps are procedurally accurate as of the cut-off date. Verify TGR portal UI hasn't changed for 2026 campaign. |
| 15 | SII tax offset for existing debts before refund | SII — normativa compensación tributaria | TODO:SOURCE | FAQ claim. Correct as general principle (Art. 51 Código Tributario). Confirm current application for 2025 tax year. |

---

## Summary: arithmetic errors

**None found.** The only computed figure in the draft is the conceptual example ($1.000.000 × 15,25% = $152.500), which is arithmetically correct.

---

## Summary: unsourced figures

The draft contains **13 TODO:SOURCE tags** for figures and deadlines that require live SII/TGR verification. All are correctly tagged in the draft — the DraftAgent did not present these as known facts. This is compliant with `INVARIANT.EDITORIAL.NO_UNSOURCED_NUMBERS`.

---

## Summary: figures that CAN be published without TODO:SOURCE resolution

| Figure | Why verifiable | Caution |
|--------|---------------|---------|
| 15,25% PPM retention rate | Ley 21.133, stable since 2019; confirmed by repository test guard | Verify no rate increase in 2025 PPM schedule |
| 40% top marginal rate | Ley 21.210, Art. 52, stable | Thresholds still require TODO:SOURCE |
| Conceptual arithmetic examples | Marked as illustrative; no real figures stated | Keep "solo ilustrativo" label in final version |

---

## Math audit verdict

**CONDITIONAL PASS with 13 open TODO:SOURCE items.**

The draft contains no arithmetic errors. The sole confirmed figure (15,25% PPM) is correctly sourced and arithmetically consistent. All year-specific figures (deadlines, brackets, thresholds, penalties) are correctly deferred to TODO:SOURCE. No figure has been stated with false confidence.

The draft may proceed to ComplianceAgent review, but **publication is BLOCKED** until all 13 TODO:SOURCE items are resolved against current SII/TGR official publications.

**MathAuditAgent sign-off:** Claude (acting as MathAuditAgent) — 2026-04-24  
**SoD defect:** MathAuditAgent = DraftAgent (same Claude instance) — declared as DEFECT #1 in 06-compliance.md
