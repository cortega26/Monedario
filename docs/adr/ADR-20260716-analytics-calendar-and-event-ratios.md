# ADR-20260716: Analytics calendar and event-ratio semantics

Date: 2026-07-16
Status: Accepted

## Context

The analytics Worker declares `EXPORT_TIMEZONE = "America/Santiago"`, but event
counter keys and scheduled default-week selection used UTC calendar fields. An
event around Chilean midnight could therefore be stored under the adjacent UTC
date, and a scheduled/manual default near a Sunday/Monday boundary could select
the wrong complete ISO week.

The weekly scorecard also divided aggregate `calculator_complete` counts by
aggregate `calculator_start` counts and labelled the result a completion or
conversion rate. The privacy-safe store contains neither people nor sessions,
and repeated calculation activity can make completes exceed starts. W27 and W28
both demonstrate that this is an event-count ratio, not a user funnel.

The accepted storage decision in
`ADR-20260628-first-party-analytics.md` remains valid: only allowlisted aggregate
counters are retained, with no user, session, cookie, fingerprint, IP, or raw
input identity.

## Decision

1. Derive ingestion counter dates and the default previous-complete ISO week
   from the IANA timezone configured by `EXPORT_TIMEZONE`; default to
   `America/Santiago` only when the variable is absent.
2. Centralize local-calendar conversion in a pure helper backed by
   `Intl.DateTimeFormat(...).formatToParts()`. An invalid timezone is a clear
   configuration error, not a silent fallback to UTC.
3. Keep artifact windows as explicit ISO dates and preserve the existing
   `schemaVersion: 1` JSON shape.
4. Do not rewrite historical counter keys. Pre-change keys keep their recorded
   dates; future writes use the configured local calendar. A requested export
   continues reading one key prefix for each explicit date in its window, so no
   double-read or deduplication migration is introduced.
5. Label `completes / starts` as `results/start` and render it as an event ratio
   such as `1.66×`. It may exceed `1×` and must not be described as conversion,
   completion probability, users, or sessions.
6. Remove the arbitrary `<35%` tool-friction action. Aggregate event ratios may
   support trend observation, but they do not establish a cohort UX failure.
7. Keep error rate and next-best-step CTR because their event denominators are
   explicit; always disclose that all values are aggregate event counts.

## Consequences

- Chilean midnight and ISO-week boundaries behave consistently across summer
  and winter offsets.
- Existing R2 artifacts and KV history remain readable without destructive
  migration or double counting.
- Weekly scorecards no longer manufacture conversion claims or UX actions from
  privacy-preserving event counters.
- True conversion analysis remains unavailable unless a separately reviewed
  privacy design explicitly introduces an appropriate cohort denominator.

## Verification

- Santiago summer and winter UTC crossovers.
- Local Sunday/Monday and Dec/Jan ISO-year boundaries.
- Invalid timezone failure.
- End-to-end ingestion key selection under a UTC/local-date crossover.
- Scorecard fixture with 100 completes and 31 starts rendering `3.23×` without
  a completion-rate label or friction action.
- Worker/report focused tests, full tests, lint, docs, format, and boundaries.

## Rollback

Revert the Worker helper/call sites, report semantics, tests, and this ADR as
one change. No stored data migration is required. A rollback would
reintroduce the known UTC/local-calendar ambiguity and misleading event-ratio
labels, so it should be used only to contain an identified production defect.

## Change Control Record

1. **Scope declaration:** analytics Worker calendar helpers, scorecard event
   semantics, co-located tests/docs, and this ADR only.
2. **Impacted modules:** first-party counter key selection, scheduled default
   export-week selection, and weekly report interpretation.
3. **Invariant preservation:** `URL.PUBLIC.NO_POST_ID`, YMYL/editorial gates,
   public routes, and zero-PII analytics boundaries are unchanged.
4. **Contract preservation:** ingestion payload and export schema remain
   unchanged; only internal date selection and reader-facing metric semantics
   change.
5. **Boundary integrity:** no new production dependency or cross-layer import.
6. **Test coverage impact:** adds calendar-boundary, invalid-timezone, ingestion,
   and results-per-start regression coverage.
7. **Rollback strategy:** revert the bounded commit; no data migration.
8. **Regression risk:** medium around calendar boundaries and downstream report
   wording; pure helpers, explicit dates, focused fixtures, and the full gate set
   mitigate it.

Competitive adaptation is not applicable: this fixes internal measurement
contracts and does not create or adapt a public surface.
