# Plan 049: Align analytics weeks to Chile time and report event ratios honestly

> **Executor instructions**: Execute every step and verification. Do not migrate
> storage or add user/session identity without an approved follow-up design.
>
> **Drift check**: `git diff --stat efe021c7..HEAD -- workers/analytics-collector/src/index.ts workers/analytics-collector/wrangler.toml scripts/build-weekly-search-report.mjs tests/workers/analytics-collector/schema.test.ts tests/scripts/build-weekly-search-report.test.ts docs/adr/`

## Status

- **Execution**: DONE — merged in PR #331 (`ac0c4a17`), deployed as Worker
  version `dbc273e9-4f89-48f8-b572-fff6e536ff81`, and smoke-verified
- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: PR #330 merged and deployed
- **Category**: bug / data contract
- **Planned at**: commit `efe021c7`, 2026-07-16
- **Origin**: Issue #315 W28 analytics incident and `/improve deep`

## Why this matters

The Worker declares `America/Santiago` but derives counter dates and default ISO
weeks from UTC. Events near Chilean midnight and scheduled exports near a week
boundary can therefore land in the wrong local day/week. Separately, the weekly
report calls `completes / starts` a conversion/completion rate even though the
privacy-safe counters have no user identity and one start can emit multiple
complete events. Values over 100% are valid event ratios, not impossible users.

## Current state

- `workers/analytics-collector/wrangler.toml` declares
  `EXPORT_TIMEZONE = "America/Santiago"`.
- `workers/analytics-collector/src/index.ts:294` derives dates from UTC calendar
  fields. `dateToISOWeekUTC` at about line 377 is used by `scheduled()` around
  line 897 without the configured timezone.
- `scripts/build-weekly-search-report.mjs:794-878` labels
  `completes / starts` as `Completion rate`.
- `scripts/build-weekly-search-report.mjs:1086-1200` can recommend tool UX work
  based on that ratio being below 35%.
- W27 evidence includes `112 starts / 186 completes` and `31 / 100`; this is
  compatible with repeated calculations and disproves user-conversion semantics.
- ADR `docs/adr/ADR-20260628-first-party-analytics.md` explicitly accepts
  privacy-preserving aggregated events and eventual counter loss at current scale.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Worker tests | `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` | all pass |
| Report tests | `pnpm exec vitest run tests/scripts/build-weekly-search-report.test.ts` | all pass |
| Lint | `pnpm exec eslint workers/analytics-collector/src/index.ts scripts/build-weekly-search-report.mjs tests/workers/analytics-collector/schema.test.ts tests/scripts/build-weekly-search-report.test.ts` | exit 0 |
| Docs | `pnpm run check:docs` | exit 0 |
| Full tests | `pnpm test` | 0 failures |
| Boundaries | `pnpm run check:boundaries` | exit 0 |
| Format | `pnpm run format:check` | exit 0 |

## Scope

**In scope**:

- `workers/analytics-collector/src/index.ts`
- `workers/analytics-collector/wrangler.toml`
- `scripts/build-weekly-search-report.mjs`
- `tests/workers/analytics-collector/schema.test.ts`
- `tests/scripts/build-weekly-search-report.test.ts`
- `docs/adr/ADR-20260716-analytics-calendar-and-event-ratios.md` (create)

**Out of scope**:

- KV/Durable Object/storage migration or reopening the accepted eventual-
  consistency decision without its review threshold.
- Cookies, fingerprints, IPs, session/user IDs, or any new PII.
- Public routes, calculator product behavior, and historical artifact rewrites.

## Git workflow

- Branch: `advisor/049-analytics-calendar-event-ratios`
- Commit: `fix(analytics): align weeks and event-ratio semantics`
- Do not push or open a PR unless instructed.

## Steps

### 1. Define calendar and metric contracts in an ADR

Specify that ingestion keys and default export selection use the local calendar
date in `EXPORT_TIMEZONE`; artifact windows remain explicit ISO dates. Document
compatibility for existing UTC-keyed history (no silent destructive rewrite).
Define `completes / starts` as `results per start` or an equivalent event ratio,
not user conversion. Reaffirm zero-PII and the existing aggregation boundary.

**Verify**: `pnpm run check:docs` exits 0.

### 2. Centralize timezone-aware calendar conversion

Create one pure helper using the IANA timezone and `Intl.DateTimeFormat` parts.
Pass `env.EXPORT_TIMEZONE` explicitly through ingestion date selection and the
scheduled/default export week calculation. Preserve explicit `?week=YYYY-Www`
behavior. Reject an invalid timezone with a clear configuration error.

For historical compatibility, export must read the documented keys for the
requested local date range. If supporting pre-change UTC keys requires double-
read/deduplication and the artifact lacks enough provenance to do it safely,
STOP and produce a migration design rather than double-counting.

**Verify**: tests cover Santiago summer and winter offsets, local Sunday 23:xx /
Monday 00:xx, UTC date crossover, ISO-year rollover, and invalid timezone.

### 3. Correct report labels and decision rules

Rename `Completion rate` everywhere fed by aggregate counters. Use a label such
as `Results/start` and render it as a ratio (`1.66×`) or clearly named percent
that may exceed 100%. Remove the `<35% conversion` action classifier; do not
replace it with an arbitrary threshold. Preserve error rate and next-step CTR,
whose event denominators are explicit, and add a caveat that counters are events,
not unique users/sessions.

**Verify**: a fixture with 100 completes / 31 starts renders an honest ratio and
does not generate a false conversion warning.

### 4. Verify end-to-end contracts

Run all Commands. Confirm the Worker artifact schema/version remains unchanged
unless the ADR explicitly introduces a versioned migration. Inspect diff scope.

## Test plan

- `America/Santiago` DST and non-DST boundary timestamps.
- Sunday/Monday and Dec/Jan ISO-week boundaries.
- Invalid timezone configuration.
- More completes than starts.
- Zero starts, missing analytics, and error-rate/next-step metrics unchanged.

## Done criteria

- [x] Calendar date and default export week honor `EXPORT_TIMEZONE`.
- [x] Boundary tests cover Chile summer/winter and ISO-year rollover.
- [x] The report makes no user-conversion claim from aggregate event counters.
- [x] No new identity, PII, or storage architecture is introduced.
- [x] ADR and all focused/full gates pass; scope is clean.

Implementation evidence: commit `ba33fb71`; focused regression coverage passed 86/86, the full
suite passed 1,055/1,055, Worker typecheck passed, and lint/docs/format/boundary
checks passed. The real W28 scorecard now renders `Results/start` event ratios
and the explicit no-user/no-session caveat. The plan remains open until merge,
deployment, smoke verification, and atomic archival.

Late PR review identified a cutover hazard in the first implementation: changing
the date semantics inside the existing `telemetry:v1` prefix would mix legacy UTC
and new local-calendar rows in the first weekly exports. The corrected design
keeps UTC writes/reads on `telemetry:v1` through a configured Monday 00:00 Chile
boundary and begins local-calendar writes/reads on `telemetry:v2` at that exact
boundary. Each ISO week reads exactly one version, so no double-read,
deduplication guess, or historical rewrite is introduced.

Rollback is time-dependent: before the cutover the bounded Worker/config change
can be reverted; after the boundary, set `ANALYTICS_DISABLED=1` and fix forward
on v2 rather than splitting the active week back across namespaces.

Cutover regression evidence: focused Worker/report tests passed 86/86; the full
suite passed 1,061/1,061; Worker typecheck, lint, docs, formatting, boundaries,
frontmatter, `URL.PUBLIC.NO_POST_ID`, routes 53→53, RSS 52→52, Astro check/build
(327 pages), and 1,563-link URL validation all passed.

Production closure: exact merged tree `ac0c4a17` deployed on 2026-07-16 as
`dbc273e9-4f89-48f8-b572-fff6e536ff81`; trigger remained `57 7 * * MON` and
`COUNTER_KEY_CUTOVER_AT=2026-07-20T04:00:00Z`. Header-authenticated W28 export
returned 200 with 310 rows / 2,044 events; missing-header and query-only secret
requests returned 401. No schema, PII, or historical-data migration occurred.

## STOP conditions

- Correct historical reads would double-count or lose counters without a versioned
  storage migration.
- A proposed fix introduces identity or changes the public ingestion payload.
- PR #330 is not deployed and the production/export baseline cannot be separated.
- The implementation would reopen the accepted KV architecture without the ADR's
  explicit scale/reliability review trigger.

## Maintenance notes

Future conversion analysis needs a separately approved privacy design. Until
then, event ratios are useful for operational trends but not user conversion.
