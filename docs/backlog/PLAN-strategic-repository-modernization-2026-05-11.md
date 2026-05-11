# Strategic Repository Modernization Plan — 2026-05-11

Status: Completed  
Owner: Codex  
Scope type: targeted modernization pass

## Authority And Constraints

- Authority order: `docs/AI_ENGINEERING_CONSTITUTION.md` > `AGENTS.md` > `context/*.md` > source code.
- Referenced invariants/contracts:
  - `URL.PUBLIC.NO_POST_ID`
  - `ROUTES.NO_SILENT_CHANGES`
  - `RSS.NO_REMOVALS`
  - `FRONTMATTER.VALID`
  - `CONTRACT.PUBLIC_URLS`
  - `CONTRACT.ARTICLE_STRUCTURE`
  - `CONTRACT.EDITORIAL.TONE`
- No public route, slug, RSS, canonical helper, calculator formula, or editorial publication gate semantics are intentionally changed.

## Architectural Intake

Monedario is an Astro-based static educational finance site for Chile. It combines editorial YMYL content, calculators, glossary/law references, and static search. The critical operating model is trust: public URL stability, financial correctness, official-source traceability, deterministic builds, and clear governance for agent/human work.

Architecture baseline:
- Presentation: `src/pages/`, `src/layouts/`, `src/components/`
- Application: `src/application/use-cases/`
- Domain: `src/domain/`
- Infrastructure: `src/infrastructure/`
- Content: `src/data/blog/`, `src/data/glossary/`, `src/data/laws/`
- Gates/scripts: `scripts/`
- Tests: `tests/`
- Governance/context: `docs/`, `context/`

Validation baseline observed before edits:
- `pnpm run check:docs`: PASS
- `pnpm run check:context`: PASS
- `pnpm run check:boundaries`: PASS
- `pnpm run lint`: PASS
- `pnpm run test`: FAIL, one deprecated bare CMF URL pattern remains in `src/`
- `EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts`: FAIL pre-existing repo-wide canonical artifact absence; not changed in this task

## Strategic Questions

1. Project goal: make Chilean personal finance understandable and actionable without collecting personal data or offering personalized advice.
2. Stakeholders: readers in Chile, maintainers, editors, search visitors, and agents/contributors working under repo governance.
3. Critical success areas: URL stability, calculator correctness, official-source traceability, editorial freshness, deterministic CI, and contributor navigation.
4. Highest risks: noisy failing gates, stale docs that mislead contributors, public-route regressions, YMYL content drift, and calculator/data snapshot errors.
5. Highest ROI now: restore the test gate, align docs with current Astro/tooling/source structure, and record remaining known debt.
6. Strategically wasteful work: broad file moves, aesthetic refactors, dependency churn, or artifact migrations without an editorial governance decision.

## Prioritized Plan

| Priority | Area | Problem | Impact | Effort | Risk | Proposed Fix | Validation |
|---|---|---|---|---|---|---|---|
| P0 | Regression gate | Deprecated bare CMF URLs still exist in `src/`, failing `redirect-links` test | Makes `pnpm run test` noisy and hides future regressions | S | Low | Replace bare CMF links with existing canonical CMF portal URL | `pnpm run test -- --run tests/e2e/redirect-links.e2e.test.ts`, `pnpm run test` |
| P1 | Documentation accuracy | README/context/codebase docs mention stale stack, counts, paths, or artifact locations | Slows contributors and causes agent mis-scoping | S | Low | Align docs with package/source tree and mark noncanonical artifact debt | `pnpm run check:docs`, `pnpm run check:context`, `pnpm run format:check` |
| P1 | Debt visibility | Existing strict editorial artifact gate fails repo-wide, but quick plan needs explicit tracking | Prevents false closure claims | S | Low | Add/update backlog note with priority and mitigation | `pnpm run check:docs` |
| P2 | Source organization | Legacy image migration scripts and artifact-location drift may remain | Future maintenance cost | M/L | Medium | Document remaining work, do not migrate in this pass | Final report only |

## Progress Log

- 2026-05-11: Intake completed; plan opened before multi-file edits per Rule 2.13.
- 2026-05-11: Replaced deprecated bare CMF source links with the canonical CMF portal URL.
- 2026-05-11: Aligned README/codebase/context docs with Astro 6, TypeScript 6, current CI behavior, source collections, and editorial artifact path policy.
- 2026-05-11: Logged remaining repo-wide editorial artifact drift as `TD-0057`; closed URL regression as `TD-0058` after full test pass.
- 2026-05-11: Restored `format:check` by applying Prettier-only table normalization to three existing article files.
- 2026-05-11: Added `.gitignore` exception so this plan artifact is versionable.
- 2026-05-11: Accepted ADR-20260511 to keep `artifacts/editorial/<slug>/<run-id>/` as the only canonical full-pipeline location and classify `docs/editorial/artifacts/**` as legacy/SEO sprint evidence.
- 2026-05-11: Updated `TD-0057` from ambiguous location drift to explicit canonical backfill debt.

## Validation Evidence

- `pnpm run format:check`: PASS
- `pnpm run lint`: PASS
- `pnpm run test`: PASS
- `pnpm run check:docs`: PASS
- `pnpm run check:context`: PASS
- `pnpm run check:boundaries`: PASS
- `pnpm run check`: PASS
- `pnpm run build`: PASS
- `pnpm run check:routes`: PASS; reported 11 additive routes, 0 removals
- `pnpm run check:rss`: PASS; reported 35 additive RSS entries, 0 removals

## Closure Notes

- Regression risk was constrained to source-link targets, documentation, and mechanical Markdown formatting.
- No public slug, route helper, RSS policy, calculator formula, or editorial publication gate was changed.
- Remaining strategic debt is tracked as `TD-0057`.
- Artifact-location policy decision is complete; canonical artifact backfill remains intentionally open.
