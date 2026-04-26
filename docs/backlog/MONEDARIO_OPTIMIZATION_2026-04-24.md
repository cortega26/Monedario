# Monedario Optimization 2026-04-24

Status: complete

## Scope declaration

In scope:

- `spec.md`
- `todo.md`
- `docs/backlog/MONEDARIO_OPTIMIZATION_2026-04-24.md`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/components/ArticleJsonLd.astro`
- `src/components/RelatedPosts.astro`
- `src/components/CalculatorTrustBadge.astro`
- `src/components/NextSteps.astro`
- `src/layouts/PostDetails.astro`
- `src/pages/buscar.astro`
- `src/pages/calculadoras/*.astro`
- `src/scripts/analytics.ts`
- `src/utils/analytics.ts`
- `src/utils/relatedPosts.ts`
- `tests/e2e/monedario-optimization.e2e.test.ts`
- `tests/integration/analytics-utils.test.ts`
- `tests/integration/related-posts.test.ts`

Out of scope:

- New YMYL articles or substantive YMYL refreshes.
- Calculator formulas and domain/application use cases.
- Public URL migrations or route removals.
- New third-party dependencies.
- New invasive analytics, cookies, or PII capture.

Allowed operation type: minimal code and test edits that implement the scoped UX, schema, interlinking, and analytics improvements.

## Authority check

Referenced invariants:

- `URL.PUBLIC.NO_POST_ID`
- `ROUTES.NO_SILENT_CHANGES`
- `RSS.NO_REMOVALS`
- `FRONTMATTER.VALID`
- `INVARIANT.STRATEGY.DIFFERENTIATED_ADOPTION_REQUIRED`
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`

Referenced contracts:

- `CONTRACT.PUBLIC_URLS`
- `CONTRACT.EDITORIAL.META_DESCRIPTION`

Preservation proof:

- All public article links must continue to use slug-based helpers such as `getCanonicalPathFromSlug` or literal route constants, never `post.id`.
- No route files are removed.
- No blog frontmatter is edited.
- No new indexable editorial surface is added.

## Competitive Adaptation Appendix

- `benchmarkSet`: `/home/carlos/Documentos/monedario-dr-24042026-deepseek.md`.
- `patternHypothesis`: clearer navigation, explicit trust signals, and next-step modules reduce abandonment after articles and calculators.
- `localDelta`: implement only low-risk surfaces already supported by the Astro codebase, using existing hub/calculator metadata instead of copying competitor copy or adding unaudited YMYL content.
- `nonCopyBoundaries`: do not copy reader-facing text, claims, URL structures, financial advice, or normative assertions from external competitors or the DeepSeek report.
- `ownerTarget`: existing Monedario hubs, article layout, calculator pages, and analytics instrumentation.
- `successSignal`: tests pass for trust, next steps, schema dedupe, analytics mapping, related scoring, and URL guard commands.
- `ownership conflict check`: pass; this task does not create new owner pages or indexable editorial content.

## Implementation phases

1. Add tests and helper utilities for analytics and related scoring.
2. Add reusable trust and next-step components.
3. Integrate article and calculator next steps while excluding duplicate related links.
4. Deduplicate article breadcrumb JSON-LD.
5. Improve header/footer discovery links and analytics labels.
6. Run focused tests, then required guard commands.

## Rollback strategy

Revert unit:

- The scoped files listed above can be reverted as one feature patch.

Data/content rollback needed:

- No. The task does not edit published article content, frontmatter, calculator formulas, or route baselines.

Regression risk:

- Medium. The main risks are visual layout regressions on calculator pages, duplicate links, schema duplication, and stale imports.

Mitigations:

- Focused file tests for expected integration.
- Unit tests for scoring and analytics event mapping.
- `astro check`, `pnpm run check:links`, and `pnpm run check:no-postid-urls`.

## Verification plan

Focused commands:

```bash
pnpm vitest run tests/e2e/monedario-optimization.e2e.test.ts tests/integration/analytics-utils.test.ts tests/integration/related-posts.test.ts
```

Final commands:

```bash
pnpm run check:no-postid-urls
pnpm run check:links
pnpm run check:boundaries
pnpm run format:check
pnpm run test
pnpm exec astro check
```

## Verification evidence

Initial focused and full validation passed before the review-loop fixes:

- `pnpm vitest run tests/e2e/monedario-optimization.e2e.test.ts tests/integration/analytics-utils.test.ts tests/integration/related-posts.test.ts`
- `pnpm run check:no-postid-urls`
- `pnpm run check:links`
- `pnpm run check:boundaries`
- `pnpm run format:check`
- `pnpm run test`
- `pnpm exec astro check`
- `pnpm run lint`
- `pnpm run check:frontmatter`
- `pnpm run check:routes`
- `pnpm run build`
- `pnpm run check:rss`

Review-loop fixes added after this evidence:

- unignored this backlog artifact explicitly;
- changed calculator next steps so `/calculadoras/` is a fallback only when fewer than two related items exist;
- removed the article calculator CTA from `NextSteps` to avoid duplicating `CalculatorCTA`;
- derived article `NextSteps` from contextual cluster sections and filtered those sections afterward to avoid duplicate destinations.

Post-review validation passed:

- `pnpm vitest run tests/e2e/monedario-optimization.e2e.test.ts tests/integration/analytics-utils.test.ts tests/integration/related-posts.test.ts`
- `pnpm run format:check`
- `pnpm exec astro check`
- `pnpm run check:no-postid-urls`
- `pnpm run check:links`
- `pnpm run lint`
- `pnpm run check:boundaries`
- `pnpm run check:frontmatter`
- `pnpm run check:routes`
- `pnpm run test`
- `pnpm run build`
- `pnpm run check:rss`

Observed non-blocking notes:

- `astro check` reports one existing CommonJS hint in `skills/webapp-testing/assets/test-helper.js`.
- `check:links` reports four orphan-article warnings, with no broken links.
- `check:frontmatter` reports one documented transitional placement note.
- `check:routes` reports four allowed added routes and no removed routes.
- `check:rss` reports allowed added RSS items and zero removals.

Responsive visual verification:

- `http://localhost:4321/calculadoras/sueldo-liquido/` at 375px, 768px, and 1440px.
- `http://localhost:4321/posts/como-calcular-sueldo-liquido/` at 375px, 768px, and 1440px.
- Screenshots showed header, footer, trust badge, `NextSteps`, contextual sections, and related-content blocks rendering without visible overlap.
