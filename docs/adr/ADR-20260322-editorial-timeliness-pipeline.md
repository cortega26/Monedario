# ADR-20260322 — Editorial Timeliness Pipeline

## Status

Accepted

## Context

The repository already had an automated refresh path for runtime economic inputs (`economic-parameters.snapshot.json`), but editorial content with time-sensitive variables still depended on ad-hoc human memory. This created an avoidable gap between runtime snapshots and article freshness for values such as AFP commissions, UF-linked explanations, deadlines, thresholds, and periodically changing operational rules.

Under `AGENTS.md` Rule 4.3, changing CI/editorial gate semantics requires an ADR.

## Decision

Introduce a dedicated editorial timeliness pipeline with:

1. A central policy file at `src/config/editorial-timeliness-policy.json`
2. A blocking guard `pnpm run check:editorial-timeliness`
3. A scheduled GitHub Actions workflow `editorial-timeliness-audit.yml`
4. Artifact output at `output/validation/editorial-timeliness/report.json`

The guard computes a review SLA for every published article using:

- `articleLead.validAsOf` when present
- otherwise `updatedDate`
- otherwise `pubDate`

Each article is evaluated against a cadence determined by category policy plus optional slug override. Source-assisted modes such as `runtime_snapshot_plus_editorial_review` and `manual_review_with_official_sources` require `articleLead.officialSources`.

## Consequences

### Positive

- Time-sensitive editorial content becomes auditable in CI instead of relying on memory.
- Review cadence is centralized and easy to tune without touching runtime code.
- Machine-refreshable values and human-reviewed editorial values now share a common governance model.
- Scheduled automation can raise stale-content issues even when no feature branch is active.

### Negative

- Editorial freshness becomes another blocking concern in CI.
- Some articles may require future metadata hardening to satisfy stricter source-assisted modes.
- The mechanism detects stale review windows; it does not fully auto-rewrite legal/editorial prose.

## Rejected alternatives

1. Only rely on `updatedDate`
   Rejected: too weak; no cadence, no systematic audit, no automation.

2. Auto-scrape every official source into article markdown
   Rejected: too brittle, high legal/editorial risk, and not uniformly feasible across sources.

3. Keep the existing economic snapshot workflow as the only freshness system
   Rejected: it covers runtime numeric inputs, not article-level temporal claims.

## Rollback

- Remove `check:editorial-timeliness` from pipeline wiring
- Delete `scripts/check-editorial-timeliness.mjs`
- Remove `editorial-timeliness-audit.yml`
- Revert policy/context documentation updates
