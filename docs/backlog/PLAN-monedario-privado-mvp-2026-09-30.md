# PLAN — Monedario Privado MVP

Date: 2026-09-30
Status: READY FOR PR
Owner: Carlos Ortega
Branch: `feat/monedario-privado-mvp`

## Goal

Ship a directly accessible, non-indexable MVP at `/privado/` that lets a visitor
load a CSV of financial transactions and receive a useful local summary without
sending the file contents, transaction descriptions, amounts, or derived results
to Monedario or a third party.

This is a product-validation surface, not a new SEO landing page.

## Task Brief

### In scope

- `src/pages/privado/index.astro`
- `src/domain/privateFinance/analyzeFinancialCsv.ts`
- `src/layouts/Layout.astro` — explicit privacy mode only
- `src/config/indexability.ts` — declare `/privado/` non-indexable
- `public/_headers` — route-scoped network boundary
- focused unit/privacy/static-analysis tests
- this plan + one ADR for route/privacy-boundary decisions

### Out of scope

- PDF/XLSX/OFX parsing
- bank-specific parsers
- remote AI or local LLM inference
- DuckDB/WASM dependency
- persistence of imported files or transactions
- account creation/sync
- navigation/homepage promotion
- changes to existing calculators or editorial content
- production telemetry inside the private analysis flow

## Architecture

1. The page reads a user-selected CSV through the browser File API.
2. Parsing and aggregation are pure functions under `src/domain/privateFinance/`.
3. The MVP supports:
   - semicolon/comma/tab-separated CSV;
   - signed `monto/amount` columns;
   - separate debit/credit columns;
   - optional movement-type column for positive unsigned amounts;
   - local heuristic expense categories;
   - totals for income, expenses, balance and category mix.
4. File size is capped at 10 MiB and parsed in-memory.
5. No input or result is stored in localStorage/sessionStorage/IndexedDB.
6. `Layout privacyMode` omits analytics and service-worker registration.
7. Cloudflare Pages headers for `/privado/*` set `connect-src 'none'`.
8. The page remains `noindex,follow` and outside the sitemap during the
   utility-led validation freeze.

## Privacy claim

Reader-facing claim:

> Tus archivos, transacciones y resultados se procesan en este navegador y no
> se envían a Monedario ni a terceros.

The page must not claim that literally no network traffic exists while loading
the webpage. It explicitly distinguishes initial page/assets delivery from
financial-data processing.

## Ownership resolution

- Surface type: experimental product tool.
- Owner target: Monedario product layer; no calculator/article/hub owner is
  displaced.
- Canonical status: noindex, direct-access only.
- Promotion/indexation decision: deferred until after validation and the current
  indexable-URL freeze.

## Verification

| Requirement | Command / evidence | Expected |
|---|---|---|
| parser behavior | `pnpm exec vitest run tests/unit/privateFinanceAnalysis.test.ts` | pass |
| indexability/privacy source contracts | `pnpm exec vitest run tests/static-analysis/monedario-private.test.ts` | pass |
| no financial egress | `pnpm run build && pnpm run test:privacy` | pass |
| unit regression | `pnpm run test` | pass |
| boundaries | `pnpm run check:boundaries` | pass |
| lint/format/types | `pnpm run lint && pnpm run format:check && pnpm run astro check` | pass |
| route delta | `pnpm run check:no-postid-urls && pnpm run check:routes && pnpm run check:rss` | only intentional addition; no removals |
| merge-ready gates | `pnpm run check:ci` | pass |

## Change Control Record

1. Scope declaration
- In scope: paths listed above.
- Out of scope: existing financial calculators, editorial/YMYL content, global
  navigation, dependencies and analytics backend.

2. Impacted modules
- Domain: deterministic CSV parsing/aggregation.
- Page/UI: direct-access experimental tool.
- Layout: opt-in privacy mode.
- SEO contract: explicit noindex rule.
- Edge headers: route-scoped network egress block.
- Tests/docs: regression proof and architectural record.

3. Invariant preservation
- `URL.PUBLIC.NO_POST_ID`: literal route only.
- `ROUTES.NO_SILENT_CHANGES`: route delta must be verified.
- `INVARIANT.SEO.INDEXABILITY.CONTRACT`: noindex declared centrally.
- `INVARIANT.PRIVACY.NO_FINANCIAL_EGRESS`: inputs/results never enter URL,
  requests, cookies or web storage.
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`: owner resolved above.

4. Contract preservation
- No existing public API or calculator contract changes.
- No breaking change.

5. Boundary integrity
- Pure analysis stays in domain; DOM/File API stays in the page script.
- `pnpm run check:boundaries` required.

6. Test coverage impact
- New domain behavior receives unit tests.
- New privacy surface receives Playwright canary coverage.
- Layout/indexability/header contracts receive static tests.

7. Rollback strategy
- Revert the feature commit/PR. No data migration or persistent user data exists.

8. Regression risk
- Risk: medium.
- Main vectors: unusual CSV formats, incorrect amount-sign inference, accidental
  analytics/network reintroduction, route/indexability drift.
- Mitigation: fail-closed schema detection, explicit errors, route CSP,
  privacy-mode layout, no persistence, focused tests.

## Competitive Adaptation Appendix

- benchmarkSet: local-first browser-compute pattern; existing Monedario
  privacy-safe calculators and 2026 privacy audit. No competitor UI/copy is
  being reproduced.
- patternHypothesis: users are more willing to inspect sensitive financial data
  when useful analysis does not require uploading it to a service.
- localDelta: Chile-focused, no-account, deterministic financial summary with a
  verifiable network boundary and a one-click fake-data demo.
- nonCopyBoundaries: no competitor text, branding, URL structure, proprietary
  categorization or claims.
- ownerTarget: `/privado/` experimental product surface.
- successSignal: users can complete the demo/import flow; privacy tests remain
  local-only; qualitative feedback justifies or rejects bank-specific parsers.
- ownership conflict check: pass.

## Verification evidence

- Focused domain + static contract tests: 13/13 PASS.
- `pnpm run check:ci`: PASS (full repository gate).
- `pnpm run build`: PASS; 333 pages built and 24 post-build checks passed.
- `pnpm run check:no-postid-urls`: PASS.
- `pnpm run check:routes`: PASS; no unapproved public/indexable route delta.
- `pnpm run check:rss`: PASS.
- `pnpm run check:boundaries`: PASS.
- Privacy Playwright suite on an isolated preview port: 10/10 PASS.
- Canary import: the unique test amount appeared in no request URL/body, page
  URL, cookie or web storage; request count did not change after analysis.
- Production-CSP smoke: Chromium executed the demo successfully with the exact
  built `/privado/*` CSP injected; zero CSP violations.
- Built page: `noindex,follow`; absent from sitemap.

The first local privacy-suite attempt reused an unrelated development server
already listening on port 4321 (the Playwright config permits existing-server
reuse), so it returned 404 for `/privado/`. Re-running against this worktree on
an isolated port passed all ten privacy tests; no application regression was
involved.

## Progress

- 2026-09-30: plan created; scope, ownership, privacy claim and noindex strategy
  fixed before code edits.
- 2026-09-30: implemented CSV analysis, privacy-mode layout, route-scoped CSP,
  direct-access UI, unit/static/privacy tests and ADR.
- 2026-09-30: adversarial review changed ambiguous positive-only amount handling,
  unknown movement types and malformed quoted CSV to fail closed instead of
  silently inventing financial meaning.
- 2026-09-30: tightened reader-facing privacy copy to distinguish financial-data
  persistence/analytics from ordinary page assets and theme preferences.
- 2026-09-30: all required gates and production-CSP smoke passed; ready for PR.
