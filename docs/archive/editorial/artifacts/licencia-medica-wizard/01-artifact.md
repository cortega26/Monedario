# Artifact: Wizard Licencia Médica

**Status: UNPUBLISHED**

---

## benchmarkSet

`monedario-dr-24042026-deepseek.md` (external deep research, 2026-04-24). Treated as strategic input only; the benchmark source carries no editorial authority over this repository.

---

## patternHypothesis

Navigating a medical leave in Chile involves multiple institutions (employer, COMPIN, Fonasa/ISAPRE, AFP) and conditional branching logic that differs for dependent workers vs. independent workers (boleta de honorarios). Users search for "cómo tramitar licencia médica" with high urgency and low tolerance for ambiguous answers. A wizard-style step-by-step guide that identifies the user's regime (Fonasa / ISAPRE / independiente) and then surfaces only the relevant procedure dramatically reduces cognitive load compared to flat prose. No authoritative site currently provides this conditional structure in one place.

---

## localDelta

Monedario has a hub at `/guias/empleo-ingresos/` and a `seguro-cesantia` calculator. Neither addresses medical leave procedures. The gap is a complete absence of YMYL content for this high-urgency query cluster.

---

## nonCopyBoundaries

No competitor copy or phrasing reproduced. The conditional branching structure is derived from SUSESO, COMPIN, and Fonasa official procedural documentation. No editorial content sourced from ISAPRE commercial materials.

---

## ownerTarget

A wizard-style guide (could be static HTML with progressive disclosure or an interactive Astro component) at a slug within the `/guias/empleo-ingresos/` cluster, once the NORMA_YMYL.md editorial pipeline is complete and human sign-off is granted.

---

## successSignal

Post-publish: organic visibility on at least two "licencia médica tramitar" queries within 90 days; measurable reduction in hub bounce rate as users find the answer they need; no YMYL compliance defect in post-publish audit.

---

## officialSources

- **SUSESO (Superintendencia de Seguridad Social)**: medical leave regulations, benefit calculation rules, employer and worker obligations.
- **COMPIN / ChileAtiende**: procedural guides for submitting and processing medical leave forms (Licencia Médica tipo 1–11).
- **Fonasa**: specific procedures for Fonasa-covered workers, subsidy calculation base.

---

## riskLevel

**HIGH** — YMYL: health/financial. Incorrect information about deadlines for submitting licencias, benefit calculation bases, or employer notification obligations could cause workers to lose benefits or face disciplinary action. Full NORMA_YMYL.md scorecard (≥ 9.5/10) and ComplianceAgent review required.

---

## ownershipDecision

**Valid new territory** — coexistencia válida with `/guias/empleo-ingresos/`. No existing Monedario page covers medical leave procedures. No cannibalization risk. Decision per NON_CANNIBALIZATION_PROCESS.md taxonomy: `coexistencia válida`.

---

## mathAuditRequired

**Yes** — benefit subsidy calculations (base salary × coverage rate × days), employer co-payment thresholds, and any statutory day-count figures must be verified by MathAuditAgent against current SUSESO regulations.

---

## complianceReviewRequired

**Yes** — conditional branching rules for different regimes (Fonasa, ISAPRE, independiente) and all legal claim deadlines require ComplianceAgent review. Human editorial sign-off required per NORMA_YMYL.md before publication.
