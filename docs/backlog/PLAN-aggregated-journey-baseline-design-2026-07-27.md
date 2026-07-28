# Design: aggregated journey baseline

Status: **PROPOSED — reporting definition only**

## Objective

Define WS-C metrics now that OBS-01 is closed, without treating aggregate event
counts as user-level retention or collecting new data.

## Data boundary

The first-party export is aggregated by week, page/calculator, event, and
allowlisted dimensions. It contains no user identifier, session identifier,
cookie, raw event log, or cross-week join key. Therefore, this design must not
refer to "user retention", cohorts, repeat users, or conversion attribution.

## Baseline metrics

| Metric | Formula | Minimum sample | Interpretation |
|---|---|---:|---|
| Start rate | `calculator_start / calculator_view` | 100 views | Form-entry propensity for one tool/week. |
| Completion per start | `calculator_complete / calculator_start` | 50 starts | Completion of recorded starts; not a user conversion rate. |
| Next-step CTR | `next_best_step_click / next_best_step_shown` | 30 shown | Engagement with an offered next step. |
| Share action rate | `share_result_click / calculator_complete` | 30 completes | Result-sharing behavior among recorded completes. |

Use `n/d` when the denominator is zero or data is unavailable, and
`INCONCLUSIVE` below the stated minimum. Counts must be read alongside the
existing acquisition and RUM sources, not combined into a single funnel claim.

## Reporting protocol

1. Consume the versioned weekly export already used by the scorecard.
2. Report each metric as an aggregate event ratio with numerator, denominator,
   week, and sample status.
3. Compare only like-for-like complete weeks after instrumentation is stable.
4. Escalate a tool only when the threshold is met and the pattern persists for
   two weekly cuts; otherwise keep it in observation.
5. Use the OBS-02 success threshold for intervention evaluation: next-step CTR
   at least 5% with at least 30 completes, with no organic/a11y/CWV regression.

## Explicit non-goals

- No new event names, dimensions, cookies, IDs, or storage.
- No individual retention, cohort, lifetime-value, or attribution claim.
- No journey or CTA change is authorized by this baseline alone.

## Viability

Viable now: the required aggregate events already exist and OBS-01 verified
`views > starts ≥ completes` for the priority cohort in W29/W30. The smaller
tools remain below sample thresholds, so their metric state is
`INCONCLUSIVE`, not negative.

## Rollback

This is a reporting convention. If a metric is misleading, remove it from the
weekly readout; no telemetry or data deletion is required.
