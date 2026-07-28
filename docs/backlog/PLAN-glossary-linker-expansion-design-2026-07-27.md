# Design: glossary linker expansion

Status: **READY FOR MERGE — Phase 1 pilot verified**

## Objective

Evaluate a low-risk extension of glossary inbound links from blog posts to guide
prose. This is WS-B from
[`PLAN-organic-diversification-handoff-2026-07-27.md`](PLAN-organic-diversification-handoff-2026-07-27.md).

## Current boundary

`injectGlossaryLinks()` currently processes rendered blog content through
`GlossaryContentWrapper` in `PostDetails.astro`. It limits new links to five,
never duplicates a glossary term, and excludes headings, code, tables, and
existing links. It does not run on guides or calculator pages.

## Decision

Phase 1 may target only rendered prose in `/guias/`.

- Do not run the linker on calculator pages in Phase 1.
- Do not run it on labels, form controls, results, methodology examples,
  calculators' notices, source lists, or other interactive/UI regions.
- Preserve the existing maximum of five new links per rendered document and the
  one-link-per-term rule.
- Do not add terms to the allowlist as part of this workstream.

Guides are the viable first surface: they are long-form explanatory content,
unlike calculator widgets and their YMYL result/claim areas. The calculator
extension remains a separate design decision after a guide-only measurement
window.

## Proposed implementation shape

1. The guide hubs do not have a shared prose-only layout: their common areas
   contain cards, widgets, and CTAs. The pilot therefore uses two explicitly
   scoped static prose lists instead of a broad layout-level wrapper.
2. Apply `GlossaryContentWrapper` around that prose slot alone.
3. Add focused fixture tests covering:
   - five-link cap;
   - no link in headings, existing anchors, code, or tables;
   - no glossary markup in calculator form/result DOM;
   - accessible link text and unchanged keyboard navigation.
4. Inspect the rendered HTML and mobile desktop views of two guides before merge.

The Phase 1 implementation is limited to `Errores comunes` lists in
`/guias/ahorro-e-inversion/` and `/guias/pensiones-afp/`.
Each wrapped list has `data-glossary-linker-scope="guide-prose"` for rendered-DOM
review. `ResumeWidget`, `StartHere`, cards, controls, and all calculator pages
remain outside the wrapper.

## Required gates before code

```bash
pnpm run check:editorial
pnpm run check:reader-facing-copy
pnpm run test:a11y
pnpm run build
```

Also require a manual rendered-DOM review confirming that injected links occur
only in prose. `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`, and
`CONTRACT.YMYL_RESPONSE_STRUCTURE` remain unchanged.

## Execution record — 2026-07-27

- User approval received for the guide-only pilot.
- Implemented only the two scoped static prose lists above; no allowlist,
  calculator, URL, analytics-event, or editorial-copy change was made.
- Added regression coverage for explicit guide scope, calculator exclusion, and
  preserved accessible link text.
- Baseline and emitted output: `0→4` guide-scoped links on
  `/guias/ahorro-e-inversion/` (`volatilidad`, `rescate`, `custodia`, `afp`);
  `0→2` on `/guias/pensiones-afp/` (`afp`, `apv`).
- Verified: `check:editorial`, `check:reader-facing-copy`, `test:a11y` (53),
  `build`, `check:docs`, `check:boundaries`, focused unit/integration tests
  (61), emitted-DOM scope/cap assertion, and desktop/mobile browser review of
  both guide routes.

## Change control record

1. **Scope:** two marked static prose lists, their source-level regression
   tests, and plan records; calculators, widgets, routes, copy, allowlist, and
   dependencies are out of scope.
2. **Modules:** the two guide pages use the existing
   `GlossaryContentWrapper`; tests protect that boundary.
3. **Invariants:** `URL.PUBLIC.NO_POST_ID` and `ROUTES.NO_SILENT_CHANGES` are
   preserved because no route or URL helper changes; `CONTRACT.YMYL_RESPONSE_STRUCTURE`
   is unchanged because no copy or result logic changes.
4. **Contracts:** no breaking change.
5. **Boundary:** `pnpm run check:boundaries` passed; no cross-layer import was
   introduced.
6. **Coverage:** focused tests (61) and `test:a11y` (53) passed.
7. **Rollback:** revert the two guide-page wrapper imports/slots; no data or
   content migration is needed.
8. **Risk:** low; injection escaping the selected prose surface is mitigated by
   marked-scope assertions, emitted-DOM checks, and browser review.

## Measurement

Before deployment, record editorial inbound-link counts for the selected
glossary terms. At +28 days, classify each term as `SUCCESS`, `INCONCLUSIVE`,
or `NO_EFFECT` from inbound count plus definitional-query clicks/position. Do not
claim a causal ranking effect from a single weekly cut.

## Rollback

Remove the guide-only wrapper in one revert. No URL, data, or content migration
is involved.
