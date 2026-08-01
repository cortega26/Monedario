# PLAN: Migrate scheduled jobs off GitHub Actions

**Created:** 2026-08-01
**Status:** Draft — analysis complete, awaiting implementation session
**Goal:** Eliminate the ~600-900 min/month base consumption of scheduled
GitHub Actions workflows by migrating them to Cloudflare Workers (Cron Triggers)
or other non-billable infrastructure.

## Background

The monedario and noticiencias_news_collector projects share a private GitHub
org with a 2,000 min/month Actions budget. Despite installing a self-hosted
runner for monedario (which eliminated billing for that repo), the structural
problem remains:

1. **Noticiencias has no self-hosted runner** — all its workflows consume
   billable minutes on `ubuntu-latest`.
2. **If monedario's self-hosted runner goes offline**, jobs silently fall back
   to `ubuntu-latest` via `${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-latest' }}`,
   burning billable minutes.
3. **Daily scheduled jobs are fundamentally inefficient on CI** — they
   install dependencies from scratch, checkout the repo, and run scripts
   that could execute in milliseconds on a warm Worker.

## Candidates for migration

### Priority 1: `daily_collector.yml` (noticiencias) — ~500-900 min/month

- **What it does:** Runs `scripts/run_collector.py`, scrapes news sources,
  commits results to git.
- **Current cost:** 30 runs/month × 15-30 min = 500-900 min.
- **Recent optimization:** Reduced to 3×/week, timeout 60→15 min.
- **Why migrate:** Python scraping + git commit doesn't belong in CI.
  A Cloudflare Worker with a Cron Trigger, or a Queued Worker for longer
  runs, would consume ZERO Actions minutes.
- **Target:** Cloudflare Worker + D1 (store results) + Cron Trigger.

### Priority 2: `data-signals.yml` (monedario) — ~80 min/month

- **What it does:** Fetches GSC data, Cloudflare analytics, R2 exports,
  validates PII-free schema, commits to repo.
- **Current cost:** 8 runs/month × 10 min = 80 min (after Phase 1 reduction).
- **Why migrate:** Already runs on Cloudflare infrastructure. The Node.js
  fetch + validate + commit logic is a natural fit for a Worker.
- **Target:** Cloudflare Worker + Cron Trigger (2×/week).

### Priority 3: Weekly maintenance workflows — ~100 min/month

- `ci.yml` scheduled (monedario, Monday): lint + build + URL audit
- `security-scans.yml` (monedario, Wednesday): gitleaks + opengrep + trivy
- `self-heal.yml` (monedario): mechanical drift auto-fix
- `weekly-search-ops.yml` (monedario): search ops bundle

These are harder to migrate because they need the full repo checkout and
build toolchain. Options:
- Keep on self-hosted runner (zero billing while runner is online)
- Add an uptime monitor for the self-hosted runner to detect fallback
- Use a larger GitHub-hosted runner only for the weekly full scan

## Implementation plan

1. **Verify Cloudflare Workers Cron Trigger limits** (free tier: 1 trigger
   per account? Need to check current plan).
2. **Prototype a Worker** for `data-signals` (simpler, Node.js-compatible).
3. **Prototype a Worker** for `daily_collector` (Python → JS port or
   use Cloudflare Containers for Python).
4. **Run shadow mode** for 2 weeks: Worker writes to a parallel path,
   compare results with Actions jobs.
5. **Disable Actions schedules** once shadow mode confirms parity.
6. **Document self-hosted runner healthcheck** as a separate task.

## Invariants

- **Determinism:** The Worker must produce identical output to the Actions job.
- **Secrets:** GSC credentials, Cloudflare API tokens, and R2 credentials
  must be stored as Worker secrets (not in git).
- **Observability:** Worker failures must be surfaced (Discord webhook,
  issue creation, or Cloudflare Analytics).
- **No silent data loss:** If the Worker fails, the project must know
  within 24 hours.

## References

- [[cloudflare-token-scope]] — R2 write permissions require specific token rules
- [[GSC programmatic access]] — GSC is accessible via service account
- [[W28 organic growth]] — search ops cadence and measurement
