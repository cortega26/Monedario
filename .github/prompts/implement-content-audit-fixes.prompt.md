---
description: Implement all P0 content (YMYL) fixes from the 2026-04-08 content audit
applyTo: 'src/data/blog/**'
---

## Task Brief
- **Objective:** Implement all P0 content fixes identified in `output/audit/content-audit-20260408.md`
- **In scope:** `src/data/blog/` (12 P0 articles), `artifacts/editorial/` (1 scaffold), frontmatter `nextStep` fields (6 articles)
- **Out of scope:** P1 articles, routes, layouts, components, scripts, tests, SEO and Functionality audit items
- **Invariants to preserve:** `FRONTMATTER.VALID`, `EDITORIAL.STRUCTURE_MIN`, `EDITORIAL.CLUSTER_DECLARED`, `URL.PUBLIC.NO_POST_ID`, Chilean dialect `es-CL`
- **Required gates (all must pass after ALL edits):**
  - `pnpm run check:frontmatter`
  - `pnpm run check:editorial`
  - `pnpm run check:dialect`
  - `pnpm run check:reader-facing-copy`
  - `pnpm run audit:reader-copy`
- **Deliverable:** All 6 fixes implemented; all 5 gates pass with 0 blocking errors
- **Benchmark observed:** `N/A` unless a fix intentionally adapts an external pattern
- **Why it worked externally:** `N/A`
- **Proposed local delta:** `N/A`
- **What will not be copied:** `reader-facing text, normative claims, public URL strategy`
- **Owner/surface affected:** existing article owners only; no new owner creation
- **Success signal:** audit findings closed with no new ownership conflict

## Authority Check (AGENTS.md Rule 1.1)
Before starting, read these files in order:
1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `docs/editorial/NORMA_YMYL.md` — scoring rubric and all 8 MUST criteria
4. `context/INVARIANTS.md` — invariants to preserve
5. `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` — benchmark-driven work remains subordinate to ownership and source authority
6. `context/INTER_CLUSTER_LINKING.md` — cluster linking policy for nextStepHref decisions
7. `output/audit/content-audit-20260408.md` — full audit report with all P0 findings

---

## Fix 1 — Scaffold missing artifact folder (CA-002)

Run this command first (non-destructive):

```bash
pnpm run scaffold:editorial-artifacts -- --slug licencia-medica-desde-que-dia-pagan
```

Verify the folder `artifacts/editorial/licencia-medica-desde-que-dia-pagan/` is created with scaffold files.

---

## Fix 2 — Batch vigencia header patch (CA-003, 5 articles)

These articles score low on NORMA_YMYL criterion 3 (Vigencia Explícita). Add the following callout block immediately after the opening paragraph in each article — it must appear within the first 2 screens of content:

```markdown
> **Información vigente al [ARTICLE'S updatedDate].** Ante cambios normativos o de política pública, verifique en las fuentes oficiales referenciadas al final de este artículo.
```

Use the actual `updatedDate` from the article's frontmatter. If `updatedDate` is absent, use `pubDate`. Read each file before editing to find the right insertion point.

**Target articles (read each before editing):**
1. `src/data/blog/que-es-el-ipc-chile-como-se-calcula.md` — score 8.7 — no vigencia marker in body
2. `src/data/blog/reajuste-arriendo-uf-ipc-chile.md` — score 8.5 — footer date only, not header
3. `src/data/blog/liquidacion-de-sueldo.md` — score 8.9 — verify vigencia note vs actual `updatedDate`
4. `src/data/blog/como-invertir-en-etfs-desde-chile.md` — score 8.9 — no inline vigencia in body header
5. `src/data/blog/deposito-a-plazo-uf-vs-pesos.md` — score 8.75 — scenario-based; add vigencia anchor

---

## Fix 3 — "Resumen orientativo" labels (CA-005, CA-006, 3 articles)

NORMA_YMYL criterion 7: normative or inferential statements not sourced to official regulations must be labeled.

**Article A: `src/data/blog/fondos-afp-a-b-c-d-e.md`** — score 8.9

Find the section advising fund selection based on age (e.g. "si eres joven conviene Fondo A" or similar). Add after that block:

```markdown
> **Resumen orientativo:** La elección del fondo depende de tu perfil de riesgo personal y horizonte de inversión, no solo de la edad. Este análisis es una guía general; para una decisión informada considera consultar a un asesor previsional registrado en la Superintendencia de Pensiones.
```

**Article B: `src/data/blog/el-poder-del-interes-compuesto.md`** — score 8.6 — TWO issues:

Issue 1: The anchor result (e.g. "$125 millones") is buried mid-article. Strengthen the existing "Respuesta rápida" callout at the top, or add one if absent, so the concrete number is visible within the first 2 screens. Keep existing content — only add/strengthen the upfront callout.

Issue 2: Add to the simulation/result section:

```markdown
> **Resumen orientativo:** Esta simulación es educativa y no garantiza rentabilidades futuras. Los rendimientos históricos del índice S&P 500 no son representativos de opciones de inversión disponibles en Chile. Verifique condiciones actuales con una corredora registrada en la CMF.
```

**Article C: `src/data/blog/fondos-mutuos-comisiones-rescate-impuestos.md`** — score 8.8

Find the section about rescate/withdrawal timing (where it says timing "depende del reglamento" or similar). Add immediately after:

```markdown
> **Nota:** El plazo exacto de rescate varía según el reglamento interno de cada fondo. Los plazos indicados son los máximos permitidos por la CMF; el fondo específico puede ofrecer plazos menores. Verifique en el reglamento del fondo o en el sitio de la CMF.
```

---

## Fix 4 — APV anchor rule fix (CA-003, 1 article)

**Article: `src/data/blog/que-es-el-apv.mdx`** — score 8.95

Read the article top-to-bottom. Locate the Régimen A vs B comparison. If a concrete "Respuesta rápida" callout is absent from the body (it may only be in `articleLead` frontmatter), add it as a body callout so it is visible within the first 2 screens:

```markdown
> **En resumen:** Si tu tasa marginal efectiva supera el 15%, Régimen B (rebaja de base imponible) suele ser más beneficioso. Si no la supera, Régimen A (bonificación estatal del 15%) es la opción general. Tope combinado A+B: 50 UF mensuales (600 UF anuales).
```

If a strong upfront anchor already exists in the body, do not duplicate — only add if the callout is absent or too weak.

---

## Fix 5 — Internal linking sprint (CA-004, 6 articles with 0 internal links)

Add `articleLead.nextStepHref` and `articleLead.nextStepLabel` fields to these 6 articles' frontmatter. If an `articleLead` block exists, add/update the nextStep fields only. If no `articleLead` block exists, add one with only the nextStep fields.

Before writing any links, read `context/INTER_CLUSTER_LINKING.md`. Verify each target slug exists in `src/data/blog/` before using it.

| Article | nextStepHref | nextStepLabel |
|---|---|---|
| `cae-costo-real-credito-chile.md` | `/posts/renegociacion-superir/` | Conoce el proceso de renegociación Superir |
| `donde-ver-si-estoy-en-dicom-gratis.md` | `/posts/informe-deudas-cmf-vs-dicom/` | Obtén tu informe de deudas CMF gratis |
| `fondos-afp-a-b-c-d-e.md` | `/posts/como-cambiarse-de-afp/` | Cómo cambiarte de AFP paso a paso |
| `que-es-el-apv.mdx` | `/posts/que-es-la-cuenta-2-afp/` | Cuenta 2 AFP: ahorro voluntario adicional |
| `que-es-la-cuenta-2-afp.md` | `/posts/que-es-el-apv/` | APV: beneficio tributario complementario |
| `renegociacion-superir.md` | `/posts/cae-costo-real-credito-chile/` | Entiende el CAE antes de renegociar |

---

## Fix 6 — CRITICAL additions: `como-hacer-presupuesto-mensual-chile` (CA-001, score 7.8)

3 MUST criteria failures. Apply targeted additions only — do NOT do a full rewrite, do NOT remove existing sections.

**Failure 1 — Criterion 1 (Respuesta Ancla missing):** Add a "Respuesta rápida" callout at the top of the body before the first paragraph:

```markdown
> **Respuesta rápida:** Una guía de base ampliamente utilizada en educación financiera es la regla 50/30/20: destinar hasta un 50% del ingreso neto a gastos fijos (arriendo, deudas, servicios), hasta un 30% a gastos variables (alimentación, ocio) y al menos un 20% a ahorro o reducción de deudas. Es un punto de partida, no una obligación, y debe ajustarse a tu situación real.
>
> **Resumen orientativo:** Esta distribución es una referencia orientativa de educación financiera, no una norma legal. Adáptala según tu ingreso, carga familiar y metas.
```

**Failure 2 — Criterion 4 (Fuentes oficiales missing):** Add a `### Fuentes y recursos oficiales` section at the end of the article body (before any existing FAQ):

```markdown
### Fuentes y recursos oficiales

- [CMF Educa — Educación financiera](https://www.cmfeduca.cl/) — Comisión para el Mercado Financiero
- [SERNAC — Guías de finanzas personales](https://www.sernac.cl/) — Servicio Nacional del Consumidor
- [Banco Central de Chile](https://www.bcentral.cl/) — contexto macroeconómico de referencia
```

**Failure 3 — Criterion 7 (Unsourced inferences not labeled):** Find sections about "gasto hormiga" or behavioral spending patterns. Add before each:

```markdown
> **Resumen orientativo:** Los patrones de gasto descritos a continuación son referencias de educación financiera basadas en comportamiento general del consumidor. No representan datos estadísticos oficiales de Chile.
```

**After all three additions:** update `updatedDate` in the frontmatter to `2026-04-08`.
Do NOT change: slug, cluster, category, or any other frontmatter fields.

---

## Verification

After all 6 fixes are complete, run each gate and post its output:

```bash
pnpm run check:frontmatter
pnpm run check:editorial
pnpm run check:dialect
pnpm run check:reader-facing-copy
pnpm run audit:reader-copy
```

All 5 must pass with 0 blocking errors before declaring done.

---

## Change Control Record (AGENTS.md Rule 3.1)

1. **Scope:** In scope: `src/data/blog/` (12 articles), `artifacts/editorial/` (1 scaffold). Out of scope: all other paths.
2. **Impacted modules:** `src/data/blog/<slug>.md|.mdx` — editorial content edits only (no runtime code).
3. **Invariant preservation:** `FRONTMATTER.VALID`, `EDITORIAL.STRUCTURE_MIN`, `EDITORIAL.CLUSTER_DECLARED`, `URL.PUBLIC.NO_POST_ID`, `EDITORIAL.CLUSTER_VALID` — all must hold. Verified by gates above.
4. **Contract preservation:** No schema field additions outside Zod spec. No slug changes. Breaking changes: NO.
5. **Boundary integrity:** No runtime layer touched — N/A.
6. **Test coverage:** No runtime changes — no test updates required.
7. **Rollback:** Revert individual file edits via `git checkout -- <file>`; no data migration needed.
8. **Regression risk:** LOW — content-only edits, no routing or schema changes.

## Competitive Adaptation Appendix

- **benchmarkSet:** `N/A`
- **patternHypothesis:** `N/A`
- **localDelta:** keep fixes aligned to existing owner/support structure; no benchmark-driven reshaping in this prompt
- **nonCopyBoundaries:** do not import competitor copy, claims, or URL choices
- **ownerTarget:** preserve current article ownership and cluster placement
- **successSignal:** content audit issues close without creating a new cannibalization conflict
- **ownership conflict check:** PASS required before merge
