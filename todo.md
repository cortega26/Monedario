# Working Todo — Monedario 2026 UX, Trust, Interlinking, and Measurement

## Phase 0 — Spec and Test Harness

- [x] Replace stale `spec.md` with the Monedario 2026 implementation spec
- [x] Replace stale `todo.md` with this running task list

## End-to-End Coverage Tasks

- [x] Add e2e tests for execution artifact, trust badge, next steps, schema dedupe, and calculator coverage
- [x] Add focused integration tests for analytics event mapping
- [x] Add focused integration tests for related-content scoring

## Phase 1 — Execution Artifact

- [x] Create `docs/backlog/MONEDARIO_OPTIMIZATION_2026-04-24.md`
- [x] Include scope declaration
- [x] Include invariant and contract references
- [x] Include Competitive Adaptation Appendix
- [x] Include rollback and verification plan

## Phase 2 — Components and Utilities

- [x] Add `CalculatorTrustBadge.astro`
- [x] Add `NextSteps.astro`
- [x] Add related-post scoring utility or equivalent testable scoring path
- [x] Add analytics CTA event-name mapping utility

## Phase 3 — Runtime Integration

- [x] Deduplicate `BreadcrumbList` schema from `ArticleJsonLd.astro`
- [x] Render `NextSteps` in `PostDetails.astro`
- [x] Pass cluster/canonical-topic context to `RelatedPosts`
- [x] Render `CalculatorTrustBadge` on every calculator detail page
- [x] Render `NextSteps` on every calculator detail page
- [x] Improve `Header.astro` discovery analytics for hub routes
- [x] Expand `Footer.astro` exploration links
- [x] Add search chip analytics in `buscar.astro`

## Validation Loop

- [x] Run focused tests after first implementation batch
- [x] Fix focused test failures
- [x] Run `pnpm run check:no-postid-urls`
- [x] Run `pnpm run check:links`
- [x] Run `pnpm run check:boundaries`
- [x] Run `pnpm run format:check`
- [x] Run `pnpm run test`
- [x] Run `pnpm exec astro check`
- [x] Run `pnpm run lint`
- [x] Run `pnpm run check:frontmatter`
- [x] Run `pnpm run check:routes`
- [x] Run `pnpm run check:rss`
- [x] Run `pnpm run build`

## Review Loop Tracking

- [x] Iteration review #1: fresh sub-agent reviewed `spec.md` and current implementation for gaps
- [x] Incorporate review-loop gap fixes for backlog tracking, calculator fallback, and article duplicate avoidance
- [x] Rerun focused tests after review-loop fixes
- [x] Rerun affected gates after review-loop fixes

## Future Optimization Backlog

- [ ] Use the new anonymous analytics events to decide the next visual optimization batch after production data exists
