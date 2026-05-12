# ADR-20260511-weekly-search-ops-week-alignment

Date: 2026-05-11
Status: Accepted

## Context

`data-signals.yml` already resolves the **previous complete ISO week** before fetching GSC + Cloudflare JSON. `weekly-search-ops.yml` was instead labeling its bundle with the **current** ISO week. On Mondays, that created issues and artifacts like `2026-W20` while the repo-held machine signals were for `2026-W19`, so the workflow skipped scorecard generation even though reusable JSON inputs already existed.

Because this changes workflow semantics, `docs/development/CONSTITUTION_BINDING_RULES.md` Rule 4.3 requires an ADR.

## Decision

1. `weekly-search-ops.yml` now resolves the same previous complete ISO week used by data-signal collection.
2. The workflow treats repo-committed GSC JSON for that week as a valid scorecard input source, in addition to manual CSV exports.
3. Issue copy distinguishes a first-pass scorecard generated from repo data signals from a fully manual-export-driven run.

## Consequences

### Positive

- Weekly ops issues and artifacts align with the same completed week as `data-signals.yml`.
- The weekly workflow can auto-generate a first-pass scorecard when JSON signals already exist in the repo.
- Operators still retain the checklist for Bing/indexation notes and optional analytics enrichment.

### Trade-offs

- The scheduled weekly issue title now reflects the last completed week, not the week currently in progress.
- A scorecard generated from repo JSON may still require manual review before the checklist is considered done.

## Verification

- `pnpm exec vitest run tests/scripts/gsc-fetch.test.ts tests/scripts/build-weekly-search-report.test.ts`
- `pnpm run check:policy-registry`
- `pnpm run check:docs`
- `pnpm run check:context`
