# Audit Small Details - Governance and Automation Details - 2026-05-22

Source plan: `docs/backlog/PLAN-audit-small-details-2026-05-22.md`

## Scope

Audit governance details that cause recurring small regressions: hardcoded registries, warning budgets, duplicate source definitions, stale plan status, and candidates for new scripts.

## Evidence

- Existing drift plan: `docs/backlog/PLAN-drift-audit-2026-05-20.md`.
- Existing technical debt: `docs/TECH_DEBT_BACKLOG.md`, especially `TD-0084`..`TD-0094`.
- `pnpm run check:context`: pass inside `pnpm run check`.
- `pnpm run check:policy-registry`: pass inside `pnpm run check`.
- `pnpm run check:docs`: pass before adding this plan.
- `pnpm run check:urls:external:audit`: pass non-blocking, 4 non-OK network findings after accessibility link cleanup.
- `pnpm run audit:topic-overlap`: pass non-blocking, 35 candidates.
- `pnpm run check:small-details`: warning-first guardrail added; accepted external network-error budget documented for known official/public hosts.

## Findings

| ASD | Priority | Severity | Finding | Disposition |
|---|---:|---:|---|---|
| ASD-401 | P0 | 3 | Existing drift findings must remain under `TD-0084`..`TD-0094`; ASD tickets should link to them rather than duplicate them. | `fix-now`; implemented in the parent plan. |
| ASD-402 | P1 | 3 | Repeated manual findings deserve script candidates before future audits repeat them. | `batch-later`. |
| ASD-403 | P1 | 3 | Warning budgets are not yet explicit for external URLs, topic overlap, reader-copy warnings, or future meta budgets. | `batch-later`. |
| ASD-404 | P2 | 2 | Active/closed backlog status needs lightweight upkeep whenever this program advances. | `fix-now`; this plan is indexed in `docs/backlog/README.md`. |

## Candidate Checks

Carry forward from the drift plan, with ASD ownership:

- `check:small-details` for calculator trust surfaces, validation/error wiring, reader-copy warning carry-forward, and external URL audit artifact presence.
- `check:legal-privacy-claims` for analytics/legal page consistency.
- `check:ymyl-freshness-claims` for placeholders and untraced volatile YMYL values.
- `check:economic-source-consistency` for source labels across ADR, Worker, registry, and UI.
- `check:catalog-drift` for hubs, calculators, header, footer, home, breadcrumbs, and real routes.
- `check:homepage-surface-freshness` for manual freshness dates.
- `check:external-semantic-official-hosts` for official-host 404s, redirects, and migrations.
- `check:topic-ownership-drift` for high-overlap pairs without ownership decision.
- `check:meta-description-budget` if snippet length warnings need hardening.

## External URL Non-OK Summary

From `output/validation/urlcheck/external-summary.json` after the 2026-05-22 cleanup:

- `www.tta.cl`: 1 network error.
- `www.superir.gob.cl`: 3 network errors.

Classification:

- These are not confirmed 404/403 failures. The audit artifact reports `status: null`, `error: "network"`.
- `www.superir.gob.cl` fails normal `curl` with SSL issuer-chain verification, but `curl -k` returns 200 for all three URLs.
- `www.tta.cl` returns 200 with direct `curl -I -L`.
- `check:small-details` accepts this exact network-error budget and will warn again if the count, classification, host, or blocking status changes.

Resolved in this pass:

- Removed the public `/accessibilidad/` link to the private or non-public GitHub report URL.
- Rebuilt `dist` and regenerated the external URL audit; the GitHub hard fail and LinkedIn host issue no longer appear.

## Warning Budget Recommendation

Do not promote warnings directly to blocking gates in the same change that discovers them. For each candidate:

1. Record current count and false-positive examples.
2. Decide whether the finding is product/editorial correctness or hygiene.
3. Add a script/test with stable file, rule, and remediation output.
4. Run in warning mode before making it blocking, unless it protects a constitutional invariant.
