# Hero Image System Remediation

Fecha: 2026-04-30
Estado: Implementado en planner + prompts; pendiente remediación manual de assets finales por lotes

## Summary

This change aligns the hero-image planner with a hybrid YMYL direction:

- keep closeness where a lived situation helps comprehension;
- move sensitive, procedural, or comparison-heavy topics toward more austere semantic compositions;
- stop relying on manual edits to `scripts/hero-images/prompts.json` for prompt uniqueness.

The planner now generates deterministic article-specific `sceneId` values, article-specific prompt variants for structurally duplicated clusters, and a prompt library with zero duplicate `prompt` or `sceneId` entries.

## Delta: current system vs audit findings

| Area | Previous state | Adopted direction |
|---|---|---|
| Core visual doctrine | v3 favored narrative scenes by default | Hybrid YMYL: narrative where useful, semantic austerity where trust/precision matters more |
| Duplicate prompt handling | Manual fix in generated `prompts.json` | Fix in `prompt-plan.mjs`; generated output is now the source of truth |
| `sceneId` semantics | Shared base scene IDs reused across articles | Deterministic article-specific `sceneId = Template:approvedModelId--slug` |
| Technical/comparison topics | Often mapped to broad cluster scenes | Many high-risk topics now use document, comparison, timeline, calendar, or statement metaphors |
| Operational guardrail | Checker validated approved model membership only | Checker now blocks duplicate `prompt` and duplicate `sceneId` as required by `INV-015` |

## Structural problem taxonomy

1. Generic scene reuse
- Symptom: multiple articles in one cluster received the same posture/props pair.
- Rule: any article that would otherwise share a prompt must get an article-specific prompt variant in the planner.

2. Wrong family match from coarse keywords
- Symptom: `AFP`, `impuesto`, or `sueldo` mentions in body text misrouted unrelated articles.
- Rule: when article intent differs from the first keyword hit, add a slug override and keep the decision in code.

3. Over-narration on sensitive YMYL topics
- Symptom: debt, tax, payroll, and health topics drifted toward generic “person + object” scenes.
- Rule: use document, timeline, comparison, calendar, or statement metaphors when the article is procedural, institutional, or high-stakes.

4. Planner/checker contract drift
- Symptom: the runbook assumed hand-edited `prompts.json`; the checker did not enforce `INV-015`.
- Rule: prompt uniqueness must be guaranteed by planner output and verified automatically.

5. Thumbnail ambiguity
- Symptom: similar topics did not differentiate at a glance.
- Rule: prefer one strong semantic mechanism per image over generic financial props.

## Implementation changes

- `scripts/hero-images/prompt-plan.mjs`
  - added deterministic article-specific `sceneId` generation;
  - added `ARTICLE_PROMPT_VARIANTS` for high-risk and duplicate-prone slugs;
  - added targeted slug overrides for misrouted topics such as budgeting, honorarios, payroll deductions, and CAE.
- `scripts/hero-images/config.mjs`
  - extended prompt builders with structured prompt options (`sceneLine`, `propsLine`, `compositionLine`, `extraLines`, `negativeLine`, etc.).
- `scripts/check-hero-prompts.mjs`
  - now validates deterministic `sceneId` format and blocks duplicate `prompt` / duplicate `sceneId`.
- `scripts/hero-images/prompts.json`
  - regenerated from the updated planner; current result is `0` duplicate prompt groups and `0` duplicate scene groups.

## Manual asset backlog

The planner and prompt library are now ready for batch visual replacement, but this document does not claim that all final AVIF assets have already been redrawn.

Recommended production order:

1. Payroll / salary / deductions
2. Debt / credit / DICOM / renegotiation
3. Tax / refund / F22
4. Health / leave / coverage comparison
5. Savings / investment comparison and methodology articles

## P0 production worklist

This is the first batch to redraw manually. The goal is to improve the most trust-sensitive and semantically fragile hero images first.

### Batch acceptance rule

An item is complete only when all of these are true:

- final asset exists at the target path;
- the image follows the prompt concept without adding extra props;
- the concept is understandable in about 2 seconds at thumbnail size;
- no text, numbers, logos, gradients, or pseudo-3D cues appear;
- `pnpm run check:hero-images` passes after the batch update.

### Batch order

1. Payroll mechanics
2. Debt-report comparison
3. Medical leave payment timing
4. Tax workflow and refund timing

### Work items

| Priority | Slug | Target asset | Why first | Visual concept to produce | Template / palette | Pass cues |
|---|---|---|---|---|---|---|
| P0-1 | `como-calcular-sueldo-liquido` | `/images/hero/como-calcular-sueldo-liquido.avif` | Core payroll explainer; needs precision before warmth | Vertical payslip with five stacked deduction blocks flowing into one final net deposit block | `A` / `#0d9488` | Reader immediately sees gross-to-net transformation, not generic “money” |
| P0-2 | `liquidacion-de-sueldo` | `/images/hero/liquidacion-de-sueldo.avif` | Audit/document article; current family must read as document review | Vertical payslip with three highlighted lines and one magnifier | `A` / `#0d9488` | Feels like line-by-line verification, not salary calculation |
| P0-3 | `cuanto-descuenta-la-afp-de-tu-sueldo` | `/images/hero/cuanto-descuenta-la-afp-de-tu-sueldo.avif` | High-frequency payroll doubt; confusion between 10% and commission | Horizontal deduction strip split into one large pension segment and one smaller commission segment beside a payslip edge | `A` / `#0d9488` | Difference between cotización and comisión is visually obvious |
| P0-4 | `descuentos-de-sueldo` | `/images/hero/descuentos-de-sueldo.avif` | Legal vs autorizado vs prohibido is a trust-critical distinction | Three deduction cards in a row: mandatory, consent-based, blocked | `A` / `#0d9488` | The trio reads as classification, not as one undifferentiated payroll scene |
| P0-5 | `informe-deudas-cmf-vs-dicom` | `/images/hero/informe-deudas-cmf-vs-dicom.avif` | High-stigma topic; image must clarify without dramatizing debt | Two overlapping debt-report cards inside one large magnifier | `A` / `#d97706` | Reads as report comparison and clarity, never punishment or panic |
| P0-6 | `licencia-medica-desde-que-dia-pagan` | `/images/hero/licencia-medica-desde-que-dia-pagan.avif` | Procedural YMYL topic; timing rule matters more than health symbolism | Horizontal calendar strip with shaded leave days and one payment-start marker | `A` / `#0284c7` | Reader instantly sees “from which day payment starts” |
| P0-7 | `operacion-renta-f22-checklist` | `/images/hero/operacion-renta-f22-checklist.avif` | Institutional workflow article; must feel methodical and official | Flat tax checklist form with five checked boxes and one review magnifier | `A` / `#d97706` | Feels like revisión previa al envío, not generic taxes |
| P0-8 | `devolucion-impuestos-fechas-compensaciones` | `/images/hero/devolucion-impuestos-fechas-compensaciones.avif` | Refund timing is one of the clearest “when do they pay me?” intents | Calendar page connected to a deposit arrow and one offset/status block | `A` / `#d97706` | Conveys timing plus possible delay/compensation in a single glance |

### Operator notes by subgroup

- Payroll mechanics:
  keep all four images in the same visual family, but do not reuse composition. The distinction must come from mechanism: flow, audit, split deduction, classification.
- Debt-report comparison:
  avoid prison, chains, broken people, red alarms, or anything that moralizes debt. The metaphor is clarity.
- Medical leave:
  avoid hospital bed, medicine, doctor, or facial suffering cues. The article is about subsidy timing and claims.
- Taxes:
  separate the two tax images clearly. `operacion-renta-f22-checklist` is a review workflow; `devolucion-impuestos-fechas-compensaciones` is a payment-timing/status image.

### Production checklist per item

- [ ] Open the slug entry in `scripts/hero-images/prompts.json`
- [ ] Generate or curate the image manually
- [ ] Export to AVIF at `1200x630`, under `80 KB`
- [ ] Replace the target file in `public/images/hero/`
- [ ] Review at thumbnail size and full size
- [ ] Confirm no forbidden visual artifacts
- [ ] Run `pnpm run check:hero-images`

## Change Control Record

1. Scope declaration
- In scope: `.gitignore`, `context/EDITORIAL_IMAGE_SYSTEM.md`, `docs/operations/runbooks/hero-images-runbook.md`, `scripts/hero-images/**`, `scripts/check-hero-prompts.mjs`, `tests/scripts/**`, `docs/TECH_DEBT_BACKLOG.md`, this backlog artifact, generated `scripts/hero-images/prompts.json`.
- Out of scope: public routes, article body content, RSS/canonical/sitemap, final AVIF redraw workflow, new dependencies.

2. Impacted modules
- `scripts/hero-images/prompt-plan.mjs`: source of truth for article-level prompt differentiation.
- `scripts/hero-images/config.mjs`: richer prompt construction primitives.
- `scripts/check-hero-prompts.mjs`: automated enforcement for `INV-015`.
- `scripts/hero-images/prompts.json`: regenerated artifact.
- `.gitignore`: unignore only this backlog artifact so the plan remains versioned.
- docs: visual doctrine and operations alignment.

3. Invariant preservation
- Referenced invariants: Constitution §1, Rule 2.2 minimal diff, Rule 2.10 manual hero-image workflow, Rule 2.13 durable plan artifact, `INV-015` unique prompt/scene.
- Preservation proof: no public URL logic changed; prompt generation remains deterministic; uniqueness is now enforced in CI tooling.

4. Contract preservation
- Referenced contracts: `docs/domain/CONTENT/CONTRACTS.md` (`heroImage` remains unchanged).
- Breaking changes: no.

5. Boundary integrity
- Layer boundary check (`pnpm run check:boundaries`): not applicable yet; no domain/application/infrastructure runtime boundaries touched.
- Unauthorized cross-layer imports introduced: no.

6. Test coverage impact
- Changed runtime layers: repo scripts and supporting docs only.
- Related tests added/updated: `tests/scripts/hero-images-prompt-plan.test.ts`, `tests/scripts/check-hero-prompts.test.ts`.
- Coverage threshold status: targeted script tests updated; full `pnpm run test` remains blocked by pre-existing unrelated editorial artifact failures.

7. Rollback strategy
- Revert unit: planner/checker/config doc set plus regenerated `prompts.json`.
- Data/content rollback needed: no.

8. Regression risk
- Risk level: medium.
- Primary regression vectors: unexpected prompt wording drift; manual hero-image production may still lag behind prompts; downstream operators may still follow the old runbook if docs are not aligned.
- Mitigations: deterministic `sceneId`, duplicate checks in CI, backlog artifact documenting the new workflow.

## Competitive Adaptation Appendix

- benchmarkSet: `private/image-issues/deep-research-report (7).md`, `private/image-issues/Monedario.cl Hero Image Audit.md`
- patternHypothesis: Monedario gains trust when sensitive YMYL topics use cleaner semantic visual anchors instead of generic personal-finance scenes.
- localDelta: keep Monedario’s approachable tone, but tighten high-stakes topics toward more precise visual metaphors.
- nonCopyBoundaries: no competitor copy, URL structure, or visual asset copied; only structural audit signals were used.
- ownerTarget: internal hero-image system only.
- successSignal: zero duplicate prompts, zero duplicate scene IDs, clearer batch-remediation queue for manual asset replacement.
- ownership conflict check: pass
