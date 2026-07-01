# ADR-20260701-editorial-snapshot-schedule

Date: 2026-07-01
Status: Accepted

## Context

`INVARIANT.EDITORIAL.TIMELINESS_REVIEW_SLA` and
`INVARIANT.EDITORIAL.VOLATILE_DATA_ALIGNMENT` depend on
`src/infrastructure/editorial/editorial-volatile-data.snapshot.json`.

The Cloudflare Worker introduced by
`ADR-20260516-economic-snapshot-cloudflare-worker` refreshes and commits the
economic snapshot, but it does not regenerate the editorial projection. When
the GitHub Actions workflow was changed to manual-only to avoid duplicating the
Worker, the editorial snapshot stopped on 2026-05-29. Five articles using
`runtime_snapshot_plus_editorial_review` consequently exhausted their 30-day
SLA on 2026-06-28 even though the underlying economic snapshot continued to
refresh.

A one-time snapshot refresh makes the gate green but does not remove this
recurring failure mode.

## Decision

Run `.github/workflows/refresh-economic-snapshot.yml` weekly on Sunday at
06:20 UTC.

Scheduled runs:

- reuse the economic snapshot already maintained by the Cloudflare Worker;
- run `editorial:volatile-data:refresh`;
- run `editorial:review-policies:compute`;
- open and safely auto-merge the resulting snapshot PR.

Manual dispatch remains the disaster-recovery path and additionally runs
`economic:snapshot:refresh`. This preserves the fallback without allowing the
secondary `mindicador.cl` script to overwrite the Worker's BCCh/INE-enriched
snapshot during routine scheduled runs.

Weekly cadence leaves at least 23 days of margin inside the shortest configured
30-day article review SLA while consuming one small Actions run per week.

## Consequences

- Editorial snapshot freshness is maintained automatically and the scheduled
  CI gate no longer depends on a human remembering a manual dispatch.
- The Worker remains the sole routine writer of the economic snapshot.
- GitHub Actions usage increases by approximately four short runs per month.
- A failed weekly refresh still has multiple retries before a 30-day SLA can
  expire; the Monday timeliness audit makes failures visible the next day.

## Verification

- `pnpm run check:editorial-timeliness`
- Validate the workflow syntax through the repository CI gate.
- After the first scheduled run, confirm that it skips the economic refresh,
  opens or updates the snapshot PR, and that the Monday timeliness audit passes.

## Rollback

Remove the `schedule` trigger and the event guard from
`.github/workflows/refresh-economic-snapshot.yml`. Manual dispatch remains
available, and no content or snapshot schema migration is required.
