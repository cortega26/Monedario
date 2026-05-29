# ADR-20260529-repo-self-healing-maintenance

Date: 2026-05-29
Status: Accepted

## Context

A staleness audit on 2026-05-29 found drift that had reached `main` undetected:
two failing tests (stale structural guards) and 34 files of Prettier drift, plus
an orphaned `indicadoresDiarios` subsystem and stale fallback constants. Root
cause was structural in the automation, not a one-off:

1. **No scheduled job ran the full gate against `main`.** `ci.yml`'s `build` job
   was gated `if: github.event_name != 'schedule'`, so the daily cron only ran
   the external-URL audit — never `test`/`format`/`editorial` against `main`. A
   failing test that landed on `main` was caught by nothing.
2. **Mechanical drift was detected but never auto-fixed.** `doc-gardening.yml`
   runs `format:check`/`lint` weekly and opens an issue, but it is alert-only
   (and does not run `test`). Deterministic drift accumulated because a human had
   to act on each issue.
3. **The YMYL economic snapshot refresh was manual.** `refresh-economic-snapshot.yml`
   had its daily schedule commented out after migration to a Cloudflare Worker
   (ADR-20260516) that is not yet deployed.
4. **No dead-code/orphan detection** existed; nothing would have flagged the
   orphaned `indicadoresDiarios` files.

## Decision

Adopt a two-tier maintenance model — **self-heal what is deterministic, alert on
what needs judgment** — reusing existing repo patterns
(`peter-evans/create-pull-request`, `enable-safe-automerge`,
`upsert-issue-by-title`, `run-command-with-log`).

1. **Authoritative daily gate on `main`** — `ci.yml`'s `build` job now also runs
   on the existing `0 5 * * *` schedule (PR gate == main gate, no divergence). A
   scheduled failure opens/updates a single tracking issue ("CI: scheduled gate
   failing on main") and closes it when green.
2. **Self-heal mechanical drift** — new `self-heal.yml` (daily `0 4 * * *`) runs
   `astro sync`, `prettier --write`, and regenerates the published-articles and
   page-lastmod indexes, then proposes the fixes as an auto-PR that runs through
   CI and squash auto-merges when green. A clean tree produces no PR. Fixes are
   never pushed directly to `main` (respects branch protection, squash-merge-only,
   and change control).
3. **Economic snapshot refresh** — the interim GHA schedule re-enabled on
   2026-05-29 was **reverted the same day**: the Cloudflare Worker (ADR-20260516)
   was confirmed deployed and committing the snapshot daily as
   `monedario-snapshot-bot` (crons 15 10/14/18 UTC), so the GHA schedule was a
   redundant double refresh. `refresh-economic-snapshot.yml` is manual-only again
   and remains the manual path for editorial-volatile-data + review policies
   (not ported to the Worker).
4. **Dead-code detection (warning-first)** — add `knip` + `knip.json` +
   `check:dead-code`, wired into `self-heal.yml` as a non-blocking step that
   opens/closes an issue. Config focuses on unused **files** and **dependencies**
   (the high-signal `indicadoresDiarios` case); noisy `exports`/`types` rules are
   off, and structural false positives (client `<script>` files, dev pages,
   manual tools) are ignored.

## Consequences

- Drift on `main` is now caught within ~24h and mechanical drift self-heals via
  reviewable PR — no standing human chore.
- Cost: ~2 extra scheduled Actions runs/day; a possible daily bot-PR (idempotent,
  no PR on a clean tree). Issue noise is bounded to one issue per concern via
  title-based upsert.
- The initial `knip` baseline surfaces four genuine orphan candidates for human
  triage (`src/data/changelog.ts`, `src/utils/getPostsByGroupCondition.ts`,
  `src/components/GlossaryInlineLink.astro`, `src/components/RevealOnScroll.astro`).
  These are intentionally **not** deleted here — triage is a separate decision.
- `check:dead-code` is deliberately **not** registered in `POLICY_REGISTRY.json`
  yet: it is warning-first and non-blocking, and registering it as a governance
  gate would imply blocking semantics. Promote it (and register it) once the
  report is clean.

## Alternatives considered

- **Direct-commit self-heal** (like `data-signals.yml`): rejected for source/
  content/generated files because it bypasses the PR gate and the squash-merge +
  change-control policy. Acceptable only for opaque operational data.
- **Extend `doc-gardening.yml` to run `test`**: would have closed the test gap
  but kept the alert-only model and weekly cadence; it would also diverge from
  the PR gate's exact step list. Running the real `ci.yml` build job on schedule
  guarantees parity.
- **Promote `knip` to blocking immediately**: rejected — first-run false-positive
  risk; the repo's guardrail policy is warning-first.

## Verification

- `pnpm run check:dead-code` exits non-zero only on unused files/deps and
  produces a focused report (currently 4 candidates).
- `pnpm exec prettier --check .` is clean, so `self-heal.yml` is a no-op on a
  clean tree.
- `pnpm run check:context`, `pnpm run check:policy-registry`, `pnpm run lint`,
  `pnpm run test`, `pnpm run check:frontmatter` all green.
- Post-merge: `workflow_dispatch` `self-heal.yml` (expect no PR on a clean tree),
  `refresh-economic-snapshot.yml` (expect a snapshot PR), and confirm the
  scheduled `ci.yml` failure path upserts an issue.
