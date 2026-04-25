# Artifact: Centro Operación Renta

**Status: UNPUBLISHED**

---

## benchmarkSet

`monedario-dr-24042026-deepseek.md` (external deep research, 2026-04-24). Treated as strategic input only; the benchmark source carries no editorial authority over this repository.

---

## patternHypothesis

The annual Operación Renta (income tax return) is the single highest-traffic financial event on the Chilean calendar, concentrated in April–May each year. Query volume spikes sharply during the Operación Renta window. Users need a single hub that answers: "¿Debo declarar?", "¿Cuánto me devuelven?", and "¿Cuándo me pagan?". Monedario already has a calculator at `/calculadoras/operacion-renta/` that handles the computation. A dedicated content hub that contextualises the calculator, explains eligibility, and explains the refund timeline would convert calculator users into a broader editorial audience and improve the site's topical authority on impuestos-personas queries.

---

## localDelta

Monedario has `/calculadoras/operacion-renta/` and a hub at `/guias/impuestos-personas/`. The calculator is already linked from the hub. The gap is a deeper content layer: eligibility explainer, timeline, Form 22 sections explained, and a "qué hacer si debo" flow. This content would live in the `/guias/impuestos-personas/` cluster, not competing with the calculator.

---

## nonCopyBoundaries

No competitor copy reproduced. All procedural and deadline information sourced from SII and TGR official channels. No commercial tax advisory content reproduced.

---

## ownerTarget

A canonical centro / hub guide at a slug within the `/guias/impuestos-personas/` cluster, once the NORMA_YMYL.md editorial pipeline is complete and human sign-off is granted. Deep internal linking from the existing calculator and from the impuestos-personas hub.

---

## successSignal

Post-publish: organic visibility on at least two "operación renta 2025" (or current year) queries within one full April–May window; measurable referral clicks from calculator result page to the hub guide; no YMYL compliance defect in post-publish audit.

---

## officialSources

- **SII (Servicio de Impuestos Internos)**: Form 22 instructions, eligibility rules, filing deadlines, refund timeline, Renta Líquida Imponible definition, tax table (tabla de impuesto único de segunda categoría).
- **TGR (Tesorería General de la República)**: refund payment schedule and account registration procedures.

---

## riskLevel

**HIGH** — YMYL: financial/tax. Incorrect eligibility, deadline, or refund information could lead to late filing penalties or missed refunds. Full NORMA_YMYL.md scorecard (≥ 9.5/10) and ComplianceAgent review required.

---

## ownershipDecision

**Cluster extension** — coexistencia válida with `/calculadoras/operacion-renta/`. The calculator computes; this guide explains. Distinct information needs, no cannibalization. Decision per NON_CANNIBALIZATION_PROCESS.md taxonomy: `coexistencia válida` (cluster sano — calculator and guide serve complementary intents).

---

## mathAuditRequired

**Yes** — any tax rate table references, tramo calculations, or refund estimation figures must be verified by MathAuditAgent against the current SII tax year data before draft submission.

---

## complianceReviewRequired

**Yes** — eligibility rules, filing obligations, and penalty structures are year-specific and legally binding. ComplianceAgent review required. Human editorial sign-off required per NORMA_YMYL.md before publication.
