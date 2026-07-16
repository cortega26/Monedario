# Plan 048: Make weekly search signals comparative, explicit, and bounded

> **Executor instructions**: Follow this plan exactly. Run each verification and
> stop on any STOP condition. Maintain `plans/README.md` only if the reviewer has
> not reserved that responsibility.
>
> **Drift check**: `git diff --stat efe021c7..HEAD -- scripts/build-weekly-search-report.mjs scripts/audit-ctr-opportunities.mjs tests/scripts/build-weekly-search-report.test.ts tests/scripts/audit-ctr-opportunities.test.ts docs/adr/`

## Status

- **Closure**: DONE — implementation `e472ea43` independently reviewed and
  integrated by the final Issue #315 change
- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug / tests
- **Planned at**: commit `efe021c7`, 2026-07-16
- **Origin**: Issue #315 W28 traffic analysis and `/improve deep`

## Why this matters

The normal JSON-backed W28 scorecard reads only the current GSC week and assigns
zero to every delta. Its winners, losers, headline, and recommended actions are
therefore not week-over-week analysis. The same reporting surface silently turns
present-but-invalid JSON into an ordinary missing source, while the CTR audit
uses an ever-growing lifetime window and presents a uniform 3.5% heuristic as a
missed-click estimate. Decisions must distinguish comparison, absence, invalid
data, and a prioritization heuristic.

## Current state

- `scripts/build-weekly-search-report.mjs:527-567`: `readGscJson` loads only
  `${week}-pages.json` and `${week}-queries.json`; all four deltas are literal 0.
- `scripts/build-weekly-search-report.mjs:570-744`: malformed analytics, RUM,
  traffic, or URL-inspection JSON becomes `null` through `catch {}` or schema
  checks, indistinguishable from a missing optional file.
- `scripts/build-weekly-search-report.mjs:1086-1200,1273-1349`: classifications,
  movers, totals, and headline consume those values as real comparisons.
- `scripts/audit-ctr-opportunities.mjs:25-43`: every historical `*-pages.json`
  file is aggregated. Lines 116-179 describe a 3.5% target and a four-week
  follow-up even though the aggregation window never rolls forward.
- `tests/scripts/build-weekly-search-report.test.ts:302-348` covers a single JSON
  week and never asserts deltas.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Focused tests | `pnpm exec vitest run tests/scripts/build-weekly-search-report.test.ts tests/scripts/audit-ctr-opportunities.test.ts` | all pass |
| Lint | `pnpm exec eslint scripts/build-weekly-search-report.mjs scripts/audit-ctr-opportunities.mjs tests/scripts/build-weekly-search-report.test.ts tests/scripts/audit-ctr-opportunities.test.ts` | exit 0 |
| Docs | `pnpm run check:docs` | exit 0 |
| Full tests | `pnpm test` | 0 failures |
| Boundaries | `pnpm run check:boundaries` | exit 0 |
| Format | `pnpm run format:check` | exit 0 |

## Scope

**In scope**:

- `scripts/build-weekly-search-report.mjs`
- `scripts/audit-ctr-opportunities.mjs`
- `tests/scripts/build-weekly-search-report.test.ts`
- `tests/scripts/audit-ctr-opportunities.test.ts` (create if absent)
- `docs/adr/ADR-20260716-search-signal-comparison-semantics.md` (create)

**Out of scope**:

- `src/**`, `workers/**`, public routes, metadata, article copy, and generated
  `output/**` artifacts.
- Changing page ownership, applying title edits, or treating a 3.5% CTR as a KPI.
- Broadly refactoring the report generator.

## Git workflow

- Branch: `advisor/048-search-signal-integrity`
- Conventional commit: `fix(search-ops): restore trustworthy weekly comparisons`
- Do not push or open a PR unless instructed.

## Steps

### 1. Record the comparison contract

Create the ADR. Define: previous ISO week is the comparison source; current-only
rows compare with numeric zero only when a valid previous artifact exists and the
identity is absent; when the whole prior artifact is missing, deltas are
unavailable, never zero. A file that exists but fails JSON/schema/source/week/
window validation is `invalid` and must fail report generation with its path and
reason. A genuinely absent optional source remains visible as `missing`.

**Verify**: `pnpm run check:docs` exits 0.

### 2. Load and validate both GSC weeks

Resolve the preceding ISO week across year boundaries. Validate both page and
query documents (`schemaVersion`, `source`, `week`, window shape, and data array),
normalize page identity with the existing helper, and join current and previous
rows. Compute clicks, impressions, CTR percentage-point, and average-position
deltas. Keep query identity case/whitespace-normalized without conflating distinct
queries. Make missing prior-week status explicit so classifiers and `topMovers`
do not manufacture movers.

**Verify**: focused tests cover W01→prior-year W52/W53, changed rows, additions,
removals, and a missing prior artifact.

### 3. Preserve invalid versus missing source state

Replace silent parse catches in analytics, Cloudflare, and URL-inspection readers
with a small explicit result contract. Present optional missing inputs as a
caveat. Throw on a present invalid artifact before writing a scorecard. Do not
include secret-bearing environment data in errors.

**Verify**: focused tests assert missing succeeds visibly and malformed/wrong-
schema present files fail with a redacted path/reason.

### 4. Bound and relabel the CTR audit

Add an explicit rolling-week option (default four complete artifacts, plus an
explicit `all` discovery mode). Persist selected week labels in JSON/Markdown.
Rename the 3.5% calculation to an opportunity heuristic, not expected or missed
clicks. Either calibrate targets by a documented position/intent bucket or omit
the click projection; zero-click current-value/conversion queries must not receive
a universal click forecast.

**Verify**: fixtures prove an old fifth week does not affect a four-week run and
the report contains no unqualified `missed clicks` claim.

### 5. Run the repository gates

Run every command in the Commands table. Inspect `git status --short`; only the
in-scope files plus the reviewer-owned plan index may differ.

## Test plan

- Exact W28/W27 totals and representative page/query deltas.
- New URL/query versus removed URL/query.
- Missing prior week versus corrupt prior week.
- Wrong source/schema/week metadata.
- Rolling-window selection and recorded provenance.
- Uniform zero-click forecast regression.

## Done criteria

- [x] JSON scorecards produce real deltas when a valid prior week exists.
- [x] Missing comparison is never rendered as zero movement.
- [x] Present invalid signal artifacts fail loudly; absent optional inputs remain visible.
- [x] CTR audit window and heuristic semantics are explicit and tested.
- [x] ADR, focused tests, full tests, lint, format, docs, and boundaries pass.
- [x] No public route/content change and no files outside scope.

Implementation evidence: focused tests 14/14 and full suite 1,043/1,043 passed;
the real W28 bundle produced 498 clicks (`+1`) and 94,443 impressions
(`+11,703`) with analytics, RUM, traffic, and URL Inspection all explicitly
available. The final Issue #315 change closes and archives this plan atomically.

## STOP conditions

- Existing downstream consumers require a numeric delta when comparison is absent;
  stop and inventory them before changing the contract.
- GSC artifacts do not have enough metadata to prove week/source identity.
- Correctness requires editing generated W28 evidence by hand.
- Any test fails twice for a reason outside this bounded change.

## Maintenance notes

Reviewers should scrutinize ISO-week rollover, URL normalization, null handling,
and whether report prose differentiates fact, heuristic, and unavailable data.
The UTM experiment itself belongs to Issue #315 and the editorial governance
pipeline, not this technical fix.
