# Plan: editorial source corrections — 2026-10-02

## Goal

Resolve the specified live-source defects in the F22 checklist, refund timing,
and mixed-income articles, then obtain a fresh independent Compliance review
for each. Preserve the historical compliance packets and all publication gates.

## Decisions and invariants

- Edit the three named articles, append-only addenda to their run packets,
  `src/data/correcciones.json` as required by NORMA §5.4, this plan, one new
  `draft-fix-CHANGELOG.md` per run, the complete source extraction, and
  separate fresh Compliance round reports requested after each fix.
- Fetch each official source live on 2026-10-02 before changing claims. Cite
  critical claims next to the relevant text; record retrieval dates in each
  changelog.
- Update freshness fields only for substantive edits and after checking current
  time-sensitive claims, including whether SII has published AT2027 dates.
- Preserve public slugs, titles, H1s, canonicals, the refund calendar and
  `$3.000.000` threshold, IGC `$11.265.804`, APV description, and the 2025 / AT2026
  scope of the 14.5% withholding rate.
- Register material changes to published content in `src/data/correcciones.json`
  and run its mandated validation gate.
- Do not derive new calculations. If a requested example requires arithmetic,
  mark `requires_calculation=true` in its changelog and stop that example.
- Do not edit historical `05-*`, `06-*`, or publish checklists. New requested
  Compliance reports are written by separate fresh instances. Human publication
  sign-off remains reserved for the HumanEditor.

## Acceptance and verification

- Apply all requested factual corrections, retain source links, and document
  changed lines, source URLs, fetch date, and the §5.1 date rationale.
- Add the refund packet `## Addendum 2026-10-02` without changing historical
  checklist entries.
- Run `pnpm run check:frontmatter`, `pnpm run check:links`, and
  `pnpm run format:check` after the edits.
- Record the outcome and any unresolved issue here; leave gates unchecked and
  do not commit.

## Progress

- [x] Read NORMA §§1.1, 5.1–5.3, 7; DoD §2; requested prior compliance reports;
  current article files and diffs.
- [x] Refetch named official sources and verify AT2027 status; extract the
  complete five-page text of the exact SII AT2026 Línea 23 PDF.
- [x] Make article edits, append packet addenda, write a change log per run,
  and register the three material fixes under NORMA §5.4.
- [x] Complete the requested initial independent Compliance rounds and
  preserve their verdicts; F22 round 6 passed, refund round 8 plus follow-up
  failed only on the unmet fresh-DraftAgent instruction, and rentas round 5
  failed for the missing example and independent source-access limits.
- [x] Add the required rentas example using only the published 2025
  withholding rate, with no derived calculation, and retain a dated text
  observation of the exact TGR product accordion for follow-up review.
- [x] Resolve the round 7 APV A destination finding and expand the existing
  corrections registry entry; Compliance round 8 passed this delta.
- [x] Add the missing DoD §2 H2 and remove the rounded effective-rate summary;
  refetch the SII tables on 2026-10-02 and retain only official marginal rates.
- [x] Complete a fresh holistic Compliance review of the final rentas version;
  round 10 passed 9.58/10 with fetch limitations recorded.
- [x] Run the final requested gates after the Compliance report was written;
  `check:frontmatter`, `check:links`, and `format:check` passed.
- [x] Remediate the article-refresh gates the draft report missed:
  `check:hero-prompts` (scan-articles + re-reviewed briefs, hero meaning
  unchanged, prompts rebuilt) and `check:image-curation` (visual
  re-inspection of the unchanged devolución hero); plus `check:hero-images`,
  `check:image-delivery`, `check:editorial` (strict), `check:editorial-timeliness`,
  `check:correcciones` (12), `check:routes`, `check:docs`,
  `check:audit-artifacts`, `check:article-registration`, `diff --check`.
- [x] Review the final diff and record the final disposition.

## Current disposition

In progress. F22 round 6 passed (9.605/10). Refund round 8 follow-up verified
the substantive claims and resolved its attribution finding, but remains FAIL
because this root instance resumed work with existing edits despite the
explicit fresh-DraftAgent premise. Rentas round 5 independently corroborated
the available claims but found no worked example and could not independently
fetch the AT2026 PDF or exact TGR range from its own web interface. Rentas
round 6 then found an overbroad filing claim, an inaccurate description of
the proposal F22, and conflation of gross honorarios with taxable base. Those
claims and the example were corrected with additional SII sources fetched
2026-10-02. Fresh round 7 confirmed those points but found a missing APV A
pension-destination condition; round 8 passed the correction and confirmed the
existing registry entry. The required DoD H2 is now present and the rounded
effective-rate summary is removed. Fresh holistic Compliance round 10 passed
9.58/10; the report records limits fetching the Línea 23 PDF and exact TGR
page and independently confirming AT2027 status. Final requested gates passed:
frontmatter (54 articles), links (277, no broken links; one existing orphan
warning), format, and the correction registry (12 valid entries). Drafting
provenance is documented honestly and cannot be represented as a zero-exposure
session. HumanEditor sign-off and all publication gates remain pending;
committed on fix/editorial-fixes-2026-10-02-wip for human review via PR, not
merged: F22 R6 PASS and rentas R10 PASS await sign-off; devolución R8
follow-up stays FAIL on the fresh-session instruction and needs a human
override or a zero-exposure redo before publication.

## Split 2026-10-03

HumanEditor signed the F22 and rentas packets. Devolución was split out of
this branch into `fix/devolucion-reaudit-2026-10-02` (article, packet
addendum, registry entry, hero entries, R7/R8 reports) for a redo or an
explicit override. This branch now carries F22 + rentas only (registry: 11
entries). A browser refetch note supplementing R10's fetch limits was
appended to the rentas packet without touching the article, R10, or gates.
