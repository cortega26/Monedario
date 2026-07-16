# ADR-20260716: Weekly search operations at current scale

Date: 2026-07-16
Status: Accepted
Review date: 2026-08-01

## Context

The Monday search-operations workflow was scheduled weekly but skipped odd ISO
weeks. That parity guard was based on an earlier operating assumption of roughly
1,400 impressions and single-digit clicks per week. The same assumption also
deferred behavioral analytics until traffic exceeded an approximate threshold.

The current evidence is materially different. The validated W28 calibration has
498 GSC clicks and 94,443 impressions. Its first-party analytics export is valid
and contains 310 aggregate rows, 2,044 events, and six event types. The prior
missing-export condition was an operational incident; the collection/export path
has since been repaired and its recovery is a prerequisite already satisfied by
the deployed PR #330.

The repository also has a temporary, serial self-hosted Actions bridge through
July. `ADR-20260716-temporary-self-hosted-actions-bridge.md` requires hosted-runner
fallback and retirement review on or after August 1. Restoring the weekly search
loop must not broaden that bridge or allow a job to remain queued beyond GitHub's
documented 24-hour self-hosted queue timeout.

Changing the parity gate changes CI/operations semantics, so
`docs/development/CONSTITUTION_BINDING_RULES.md` Rule 4.3 requires this ADR.

## Decision

1. Run `weekly-search-ops.yml` every Monday through the end of July 2026. Remove
   only the ISO-week parity short-circuit; both scheduled and manual runs execute
   the existing bundle, scorecard, artifact, and issue flow.
2. Preserve the existing cron, `workflow_dispatch`, previous-complete-week
   resolution, permissions, action pins, timeout, concurrency policy, and
   `ACTIONS_RUNNER_LABEL || 'ubuntu-latest'` fallback.
3. Classify the repo-local first-party analytics JSON as `available`, `missing`,
   or `invalid` in the generated issue. Missing is a collection/export incident;
   invalid is a data-quality incident. Neither state is a traffic-based deferral,
   and absence must never be interpreted as zero events.
4. Close each weekly review with no more than three decisions. Use comparable
   multiweek evidence; W28 is a dated calibration, not a permanent threshold.
5. In the final July issue and on 2026-08-01, choose one measured cadence:
   retain weekly collection and review; collect weekly and review with people
   every two weeks; or collect and review every two weeks.
6. Treat automated collection and human review as separable after August 1. The
   choice depends on useful signal, operating load, and observed queue time.
7. Keep the temporary runner serial and retain the hosted fallback. If weekly
   scheduling would push a job beyond the 24-hour queue limit, stop and reassess
   rather than expanding runner scope or making self-hosting permanent.

## Consequences

- Odd ISO weeks no longer disappear from the operating record during July.
- Search and aggregate behavioral evidence can inform the same weekly scorecard.
- Missing/invalid analytics becomes visible operational debt instead of an
  implicit postponement.
- Weekly issues add review load for a time-bounded period. The August 1 decision
  prevents the temporary cadence from becoming permanent by inertia.
- No route, canonical, RSS, public URL, YMYL content, topic ownership, analytics
  schema, collection implementation, or runner permission changes.

## Alternatives considered

1. **Keep the even-week parity guard.** Rejected because it preserves a cadence
   derived from obsolete scale assumptions and halves the evidence available for
   the August decision.
2. **Make weekly cadence permanent now.** Rejected because operating load and
   multiweek decision quality have not yet been measured at the current scale.
3. **Collect weekly and immediately mandate biweekly human review.** Deferred as
   one of the August 1 options; July provides the evidence needed to choose it.
4. **Treat missing analytics as optional enrichment.** Rejected because the
   first-party path is active and a missing or invalid artifact is an incident.
5. **Expand or permanently retain the self-hosted runner.** Rejected by the
   temporary bridge ADR; this decision preserves serial execution and fallback.

## Verification

- `pnpm exec vitest run tests/static-analysis`
- Parse `.github/workflows/weekly-search-ops.yml` as YAML.
- `pnpm run check:docs`
- `pnpm run check:context`
- `pnpm run check:policy-registry`
- `pnpm test`
- `pnpm run lint`
- `pnpm run format:check`
- `pnpm run check:boundaries`

The focused test asserts the weekly cron, absence of parity gating, exact trigger
and permission sets, hosted runner fallback, analytics state classification,
decision cap, August review, and removal of the obsolete traffic deferral.

## Rollback

Revert this ADR, the focused test, the workflow hunk, and the aligned current
policy/context/runbook/backlog hunks as one commit. Do not silently restore the old
threshold or parity gate: any replacement cadence must document its current
evidence and preserve the temporary runner ADR. No data or content rollback is
required.

## Change Control Record

1. **Scope declaration:** limited to the weekly workflow, its runbook, Gate 00
   calibration/template, current context/backlog summaries, this ADR, and one
   static test. Routes, YMYL content, analytics implementation, and permanent
   runner policy are out of scope.
2. **Impacted modules:** operations automation and documentation only; each path
   either implements, explains, indexes, or regression-tests this cadence.
3. **Invariant preservation:** `URL.PUBLIC.NO_POST_ID`, route/RSS continuity,
   editorial separation of duties, ownership-before-expansion, and viability
   rules are unaffected. No public URL construction is touched.
4. **Contract preservation:** no public, content, analytics-schema, or runtime
   contract changes; this is a time-bounded workflow semantic change.
5. **Boundary integrity:** no imports or runtime layers change; verify with
   `pnpm run check:boundaries`.
6. **Test coverage impact:** one static workflow regression test is added; no
   runtime coverage threshold is affected.
7. **Rollback strategy:** revert the single conventional commit; no data/content
   migration is needed.
8. **Regression risk:** medium. Primary risks are accidental trigger/permission
   drift, parity remnants, analytics absence being treated as deferral, and July
   cadence becoming permanent. Exact static assertions, the August review date,
   full gates, and the rollback unit mitigate those risks.

Competitive adaptation is not applicable: this decision uses repo-local operating
evidence and does not create or adapt a public surface.
