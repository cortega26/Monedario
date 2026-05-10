# Artifact: Comparador AFP Ampliado

**Status: UNPUBLISHED**

---

## benchmarkSet

`monedario-dr-24042026-deepseek.md` (external deep research, 2026-04-24). Treated as strategic input only; the benchmark source carries no editorial authority over this repository.

---

## patternHypothesis

Workers in Chile can switch AFP once per year. The decision is high-stakes and driven primarily by commission rates and historical returns. Existing comparators on competitor sites either show only current commission rates (missing return history) or show return history without contextualising it against the worker's specific salary and years to retirement. A comparator that shows commission cost in pesos (not just percentages) for a given salary, alongside a long-run return comparison, gives workers a more actionable answer than any current resource. Monedario already has a `comisiones-afp` calculator — a comparador ampliado would extend it with editorial context and a deeper data table.

---

## localDelta

Monedario has `/calculadoras/comisiones-afp/` that computes monthly commission cost. The gap is: (1) no comparison table showing all 6 AFPs side-by-side for a given salary, (2) no editorial explanation of the return-vs-cost tradeoff, (3) no guidance on the switch window or how to exercise it. This content is in the `/guias/pensiones-afp/` cluster.

---

## nonCopyBoundaries

No competitor data tables, copy, or specific phrasing reproduced. All commission rates and return data sourced directly from Superintendencia de Pensiones official publications. No commercial AFP promotional content reproduced.

---

## ownerTarget

A comparador guide at a slug within the `/guias/pensiones-afp/` cluster, once the NORMA_YMYL.md editorial pipeline is complete and human sign-off is granted. Deep internal linking from `/calculadoras/comisiones-afp/` result page and from the pensiones-afp hub.

---

## successSignal

Post-publish: organic visibility on at least two "comparar AFP comisiones" or "mejor AFP Chile" queries within 90 days; measurable calculator-to-guide referral path visible in analytics; no YMYL compliance defect in post-publish audit.

---

## officialSources

- **Superintendencia de Pensiones**: official AFP commission rate table (updated quarterly), multifund return history by fund type (A–E), official AFP market-share statistics, and traspaso (transfer) process documentation.
- **Official AFP fee data**: published by each AFP via the Superintendencia de Pensiones portal — used only for factual rate figures, not for promotional claims.

---

## riskLevel

**HIGH** — YMYL: financial. Commission rate figures and return comparisons directly influence pension switching decisions worth tens of millions of pesos over a career. Data must be current, sourced, and dated. Full NORMA_YMYL.md scorecard (≥ 9.5/10) and ComplianceAgent review required.

---

## ownershipDecision

**Cluster extension** — coexistencia válida with `/calculadoras/comisiones-afp/`. The calculator computes cost for one AFP; this guide compares all AFPs. Distinct information needs, no cannibalization. Decision per NON_CANNIBALIZATION_PROCESS.md taxonomy: `coexistencia válida` (cluster sano).

---

## mathAuditRequired

**Yes** — all commission rate figures, return percentages, and any peso-cost computations must be verified by MathAuditAgent against the most recent Superintendencia de Pensiones quarterly publication before draft submission.

---

## complianceReviewRequired

**Yes** — any claim comparing AFP performance or recommending a switch strategy is a financially sensitive claim. ComplianceAgent review required. Human editorial sign-off required per NORMA_YMYL.md before publication.
