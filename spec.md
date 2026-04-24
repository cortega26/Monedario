# Spec: Monedario 2026 UX, Trust, Interlinking, and Measurement Improvements

**Date:** 2026-04-24  
**Status:** In progress  
**Source plan:** Plan Optimo de Mejoras Monedario 2026, derived from `/home/carlos/Documentos/monedario-dr-24042026-deepseek.md`.

## Objective

Implement the first high-ROI improvements from the Monedario 2026 plan without publishing new YMYL content or changing public URL identity:

- improve orientation through existing navigation and footer surfaces;
- make calculator privacy/trust signals visible;
- remove duplicate breadcrumb JSON-LD;
- add contextual next steps after articles and calculator journeys;
- improve related-content ranking by cluster and canonical topic;
- expand anonymous analytics for continuity and discovery actions;
- add tests that prove the implementation is present and keeps the URL/schema guardrails intact.

## Authority and Invariants

The implementation must preserve:

- `URL.PUBLIC.NO_POST_ID`
- `ROUTES.NO_SILENT_CHANGES`
- `RSS.NO_REMOVALS`
- `FRONTMATTER.VALID`
- `INVARIANT.STRATEGY.DIFFERENTIATED_ADOPTION_REQUIRED`
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`
- `CONTRACT.PUBLIC_URLS`
- `CONTRACT.EDITORIAL.META_DESCRIPTION`

The DeepSeek document is a benchmark and product input only. It is not an editorial, legal, tax, pension, or financial authority. No new YMYL claims, articles, calculators, or indexable editorial surfaces are introduced in this task.

## Scope

### In Scope

- Create a versioned execution artifact in `docs/backlog/`.
- Update `Header` and `Footer` discovery surfaces using existing hubs, calculators, glossary, changes, about, and contact routes.
- Add reusable `CalculatorTrustBadge` and render it on calculator pages.
- Add reusable `NextSteps` and render it in article layout and calculator pages.
- Deduplicate article breadcrumb schema so a rendered article has one contextual `BreadcrumbList`.
- Improve related post scoring with same-cluster and same-canonical-topic preference.
- Add anonymous analytics for next-step, related-content, calculator trust, hub route, and search chip/result actions.
- Add focused tests under `tests/e2e/` and existing integration tests where lower-level utilities are required.
- Update `todo.md` throughout execution.

### Out of Scope

- No new YMYL articles or substantive YMYL refreshes.
- No new graph/chart dependencies.
- No glossary tooltip engine.
- No URL migrations.
- No public route removals.
- No changes to domain/application calculator math.
- No tracker that captures PII or requires invasive cookies.

## Goals

G1. Add visible trust and privacy signals to all calculator detail pages.
G2. Add article and calculator next-step modules that avoid duplicate destinations.
G3. Keep article breadcrumb schema emitted from one contextual source only.
G4. Prefer same canonical topic and same cluster in related-content ranking.
G5. Emit explicit anonymous analytics events for continuity, trust, hub-route, and search-chip actions.
G6. Preserve public URL, route, RSS, frontmatter, and editorial contracts.

## Implementation Plan

### Phase 1

Create `spec.md`, `todo.md`, focused e2e/integration tests, and `docs/backlog/MONEDARIO_OPTIMIZATION_2026-04-24.md`.

### Phase 2

Implement reusable components and utilities: `CalculatorTrustBadge`, `NextSteps`, analytics CTA event mapping, and related-post scoring.

### Phase 3

Integrate runtime surfaces: calculator pages, article layout, `RelatedPosts`, `ArticleJsonLd`, header/footer discovery, and search chips.

### Phase 4

Run focused tests, guardrail commands, full suite, and Astro validation. Fix any gap before final handoff.

## Ongoing Execution Rules

R1. Consult `spec.md` before every implementation change.
R2. Update `todo.md` as tasks complete.
R3. Run focused tests after each meaningful implementation batch.
R4. Approximately every 20 implementation iterations, call a fresh sub-agent with "review spec.md and the current implementation for gaps" and loop on its feedback until alignment is reached.

## Implementation Details

### 1. Execution Artifact

Create `docs/backlog/MONEDARIO_OPTIMIZATION_2026-04-24.md` with:

- scope declaration;
- referenced invariants and contracts;
- Competitive Adaptation Appendix;
- phased implementation checklist;
- rollback and verification plan.

### 2. Navigation and Footer

Update existing components instead of replacing them:

- `src/components/Header.astro`
  - keep the existing guide dropdown;
  - add or preserve direct access to calculators, glossary/search, about, and contact where it fits the existing compact design;
  - mark guide links with `data-analytics-cta="hub-route"` and a route label so analytics can emit `hub_route_click`.
- `src/components/Footer.astro`
  - expand into a compact exploration footer with grouped links:
    - Explora por tema;
    - Herramientas;
    - Confianza;
  - keep existing social and copyright surfaces.

### 3. Calculator Trust

Add `src/components/CalculatorTrustBadge.astro`:

- props:
  - `location?: string`
  - `aboutHref?: string`
- visible copy:
  - "Sin registro"
  - "Sin publicidad"
  - "Calculo local"
  - "No almacenamos tus datos"
- link to `/about/`;
- link uses `data-analytics-cta="calculator-trust-link"` so analytics emits `calculator_trust_link_click`.

Render this component near the top of every calculator page that has `data-analytics-page-type="calculator"`.

### 4. Next Steps

Add `src/components/NextSteps.astro`:

- props:
  - `currentHref: string`
  - `cluster?: string`
  - `items?: NextStepItem[]`
  - `excludeHrefs?: string[]`
  - `title?: string`
  - `description?: string`
  - `location?: string`
- `NextStepItem` shape:
  - `href: string`
  - `title: string`
  - `description?: string`
  - `label?: string`
- remove duplicate hrefs and the current page href;
- render at most 3 items;
- links use `data-analytics-cta="next-step"` so analytics emits `next_step_click`.

Article integration in `src/layouts/PostDetails.astro`:

- derive items from `articleLead.calculatorHref`, `articleLead.nextStepHref`, contextual cluster sections, next article, and the hub;
- avoid duplicate links already shown in contextual sections or related posts;
- add generated next-step hrefs to the related-post exclusions.

Calculator integration:

- use `CALCULATOR_PORTFOLIO` to derive related calculator next steps by current slug;
- include the calculator index as a fallback item only when fewer than 2 related items exist;
- render near the end of the calculator page before `Footer`.

### 5. Related Content

Update `src/components/RelatedPosts.astro`:

- accept optional `currentCluster?: string` and `currentCanonicalTopic?: string`;
- scoring order:
  - same canonical topic: strongest;
  - same cluster: strong;
  - shared tags: medium;
  - updated publication date as tie-breaker;
- keep excluded slugs respected.

### 6. Schema Deduplication

Update `src/components/ArticleJsonLd.astro`:

- keep `BlogPosting`;
- keep auto/frontmatter `FAQPage`;
- remove the hard-coded `BreadcrumbList`.

`src/components/Breadcrumb.astro` remains the single contextual source of `BreadcrumbList`.

### 7. Analytics

Update `src/scripts/analytics.ts`:

- map generic `data-analytics-cta` values to explicit event names:
  - `next-step` -> `next_step_click`
  - `related-post` -> `related_content_click`
  - `calculator-trust-link` -> `calculator_trust_link_click`
  - `hub-route` -> `hub_route_click`
  - fallback remains `cta_click`;
- keep `cleanAnalyticsParams` filtering undefined values;
- do not collect salary, debt, tax, search result snippets, or form input values beyond existing search terms.

Update `src/pages/buscar.astro`:

- add analytics to search chips as `search_chip_click`;
- keep existing `search_submit` and `search_result_click` events.

## Verification Matrix

| ID | Requirement | Proof Method | Pass Criteria |
|----|-------------|--------------|---------------|
| V1 | Execution artifact exists | e2e file test | `docs/backlog/MONEDARIO_OPTIMIZATION_2026-04-24.md` exists and includes scope, invariants, rollback, Competitive Adaptation Appendix |
| V2 | Trust component exists | e2e file test | `CalculatorTrustBadge.astro` exists with required trust copy and analytics cta |
| V3 | Trust rendered on calculator pages | e2e file test | every calculator page except index imports/renders `CalculatorTrustBadge` |
| V4 | NextSteps component exists | e2e file test | component has required props, dedup/current href logic, max 3 behavior |
| V5 | Articles render NextSteps | e2e file test | `PostDetails.astro` imports/renders `NextSteps` and excludes next-step links from related posts |
| V6 | Calculators render NextSteps | e2e file test | every calculator page except index imports/renders `NextSteps` with portfolio-derived items |
| V7 | Breadcrumb schema is deduplicated | e2e file test | `ArticleJsonLd.astro` does not emit `BreadcrumbList`; `Breadcrumb.astro` does |
| V8 | RelatedPosts scoring improved | integration/unit test | same canonical topic and same cluster outrank tag-only matches |
| V9 | Analytics emits named events | integration/unit test | cta mapping returns explicit event names for plan ctAs and fallback `cta_click` |
| V10 | Search chips tracked | e2e file test | search chips include `data-analytics-cta="search-chip"` and script emits/uses `search_chip_click` |
| V11 | URL invariant preserved | command | `pnpm run check:no-postid-urls` exits 0 |
| V12 | Internal links valid | command | `pnpm run check:links` exits 0 |
| V13 | Type and Astro validity | command | `astro check` exits 0 |
| V14 | Regression suite passes | command | `pnpm test` exits 0 |

## Commands

Run after each meaningful implementation batch:

```bash
pnpm vitest run tests/e2e/monedario-optimization.e2e.test.ts tests/integration/analytics-utils.test.ts tests/integration/related-posts.test.ts
```

Run before final handoff:

```bash
pnpm run check:no-postid-urls
pnpm run check:links
pnpm run check:boundaries
pnpm run format:check
pnpm run test
pnpm exec astro check
```

If time or environment blocks full validation, record the exact blocker in the final response and leave `todo.md` unchecked for that gate.

## Definition of Done

- `spec.md`, `todo.md`, and e2e tests describe and verify the implemented work.
- `docs/backlog/MONEDARIO_OPTIMIZATION_2026-04-24.md` exists.
- Calculator trust and next-step surfaces render on the intended templates.
- Article breadcrumb schema is emitted once.
- Analytics event mapping is explicit and tested.
- Related content ranking prefers canonical topic and cluster.
- Required focused tests pass.
- Final response reports all gates run and any remaining risk.
