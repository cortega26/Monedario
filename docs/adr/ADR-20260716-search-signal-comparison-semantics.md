# ADR-20260716: Search signal comparison semantics

Date: 2026-07-16
Status: Accepted

## Context

The weekly search scorecard can read JSON exports for the requested GSC week,
but it currently reports every week-over-week delta as zero. That turns a
single-period snapshot into false comparative evidence. The report also treats
malformed optional analytics, Cloudflare, and URL Inspection artifacts as if
they were absent. Separately, the catalog CTR audit aggregates every historical
artifact and labels a uniform 3.5% threshold as expected missed clicks.

Search operations need to distinguish observed facts, unavailable comparisons,
missing optional inputs, invalid present inputs, and planning heuristics.

## Decision

### Weekly GSC comparison

- JSON-backed reports compare the requested ISO week with the immediately
  previous ISO week, including year rollover such as `2026-W01` to `2025-W52`.
- Both page and query artifacts validate `schemaVersion`, `source`, `week`,
  `window`, and `data` before their values are used. A present artifact with
  invalid JSON, schema, source, week, window, or row data fails generation with
  its path and a reason.
- Page identity uses the report's canonical path normalization. Query identity
  uses trimmed, collapsed whitespace and locale-independent lowercase; it does
  not apply stemming, accent folding, or other conflating transformations.
- When a valid previous page/query pair exists, current rows absent from that
  pair compare with numeric zero. Previous-only rows are retained as removals
  with current metrics equal to numeric zero.
- Click, impression, and CTR percentage-point deltas compare identity
  transitions with numeric zero. Average-position deltas are computed only for
  identities present in both validated periods; new and removed identities use
  `positionDelta: null` and render their transition explicitly because zero is
  not a meaningful synthetic rank.
- When the entire previous pair is genuinely absent, comparison status is
  `unavailable`; deltas are `null`, totals are `null`, and classifiers, movers,
  headlines, and actions must not manufacture zero movement.
- A partial previous pair is invalid rather than absent and fails generation.

### Optional signal inputs

- A genuinely absent analytics, Cloudflare RUM/traffic, or URL Inspection
  artifact remains optional and is represented visibly as missing in report
  provenance/caveats.
- A present optional artifact must validate its documented schema, source,
  requested week, window, and data shape. Invalid present input fails before
  either scorecard output is written.
- Error messages include the input path and actionable reason but never include
  artifact contents, credentials, tokens, or environment values.

### CTR opportunity audit

- The default audit window is the latest four complete weekly page artifacts.
  An explicit all-history discovery option is available for intentional
  lifetime exploration.
- Selected week labels and window mode are persisted in both Markdown and JSON
  output so every finding has reproducible provenance.
- The 3.5% value is an opportunity-screening heuristic, not a KPI, expected CTR,
  or forecast. The audit may rank the heuristic gap but does not translate it
  into projected or missed clicks.
- Zero-click pages and conversion/current-value queries receive no universal
  click forecast. Editorial or experiment decisions remain downstream work.

## Consequences

Weekly JSON scorecards become genuinely comparative when evidence exists and
explicitly non-comparative when it does not. New and removed identities remain
visible without treating a missing week as zero demand. Corrupt operational
inputs stop the run instead of silently degrading the evidence.

The CTR audit becomes bounded and reproducible by default. Its prioritization
remains useful as a heuristic, but it cannot be read as a traffic promise.
Operators who want lifetime discovery must opt in explicitly.

The stricter contract can expose previously ignored invalid artifacts and
require upstream collectors to repair their metadata or schema.

## Alternatives considered

- Keep zero deltas for JSON: rejected because it presents absence of comparison
  as observed stability.
- Treat a missing previous week as an empty valid week: rejected because it
  manufactures growth and winner classifications.
- Continue silently ignoring malformed optional inputs: rejected because
  absence and corruption have different operational meanings.
- Keep an unbounded CTR window and missed-click projection: rejected because
  seasonality and position/query intent make the uniform projection misleading.

## Verification

- Focused Vitest coverage for ISO rollover, changed/new/removed identities,
  missing and corrupt comparisons, invalid optional inputs, bounded CTR
  provenance, and heuristic wording.
- `pnpm exec vitest run tests/scripts/build-weekly-search-report.test.ts tests/scripts/audit-ctr-opportunities.test.ts`
- ESLint on the four scoped script/test files.
- `pnpm run check:docs`
- `pnpm test`
- `pnpm run check:boundaries`
- `pnpm run format:check`
