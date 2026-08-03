# ADR-20260716: Analytics Worker deployment parity

Date: 2026-07-16
Status: Accepted

## Context

The W28 missed-export incident showed that the repository and the live Worker
can diverge silently. Local source had the `Authorization: Bearer` export
handler and the `57 7 * * MON` schedule, while the live Worker still ran an
older build with query-string credentials and a Sunday trigger. Every
repository gate passed because nothing verified the deployed version, the
exact cron, the authentication behavior, or the expected R2 freshness.

PR #330 was merged as `353fa875`, deployed as Worker version
`73e72057-cf67-430e-b4e4-2fa5610807a1`, and manually verified on 2026-07-16
with the exact `57 7 * * MON` schedule and a header-only export smoke. That
satisfies the one-time prerequisite; automated deployment parity is the
subject of this ADR.

`ADR-20260716-temporary-self-hosted-actions-bridge.md` governs runner routing.
Its retirement clause is fulfilled on/after 2026-08-01: the self-hosted runner
was deregistered and `ACTIONS_RUNNER_LABEL` deleted on that date. August 1
changes runner routing, not deploy semantics.

## Decision

1. **Source of truth.** `workers/analytics-collector/wrangler.toml` and
   `workers/analytics-collector/src/index.ts` on `main` are the canonical
   definition of the Worker: schedule, routes, bindings, auth contract, and
   artifact schema. A live deployment that disagrees with them is an incident
   to fix, not a configuration to bless.
2. **Deploy trigger.** Manual `workflow_dispatch` only, via
   `.github/workflows/deploy-analytics-collector.yml`. The repository has no
   protected production environment, so auto-deploy on `main` pushes is not
   enabled; deployment stays human-initiated until a protected environment
   and a branch policy exist. No PR-secret deploys, no scheduled deploys.
3. **Runner routing.** Workflows run on `ubuntu-latest`. After 2026-08-01 the
   temporary self-hosted runner no longer exists and the
   `ACTIONS_RUNNER_LABEL` variable fallback is a retired disaster-recovery
   control only; runner routing never changes deploy semantics or this ADR's
   parity contract.
4. **Token scope.** The deploy and verification flows require a minimally
   scoped token, not a broad account token:
   - Workers Scripts:Edit (deploy + rollback),
   - Worker Routes:Edit — zone-scoped permission
     (Zone → Worker Routes → Edit, scope: monedario.cl) for the route
     `monedario.cl/api/analytics/*`,
   - Workers R2 Storage:Read (verifier freshness checks; optional
     Storage:Write if the export is regenerated outside the Worker).
   The verifier needs no Observability scope. The worker secret
   `EXPORT_SECRET` is only ever passed by header or `wrangler secret put`;
   never in a URL, never in tracked files, never in logs.
5. **Post-deploy parity checks.** After every deploy, the verifier
   `scripts/data-signals/verify-analytics-worker-deployment.mjs` must pass:
   - active deployment/version is not older than the deploy start
     (`--deployed-not-before`, clock-skew tolerance 15 min);
   - `GET /schedules` returns exactly `57 7 * * MON`;
   - the manual export endpoint rejects query-string credentials (HTTP 401);
   - the authenticated header-only export smoke returns 200 with metadata only
     (`week`, `window`, `rows`, `totalEvents`) — never `data` or `r2Key`;
   - the R2 artifact `analytics-exports/{week}.json` exists and was written
     after the expected instant (cron run or smoke start), verified via
     `If-Modified-Since` metadata (HTTP 200 fresh / 304 stale / 404 missing)
     without downloading the artifact body.
   A stale deployment must produce an explicit failed check, not a
   week-later surprise.
6. **Cron propagation.** The verifier polls the schedules endpoint with
   bounded polling: up to 15 minutes, intervals of 20 s (never over 60 s).
7. **Rollback.** Rollback targets a known Worker version:
   `wrangler rollback` (previous deployment) or redeploying a pinned version
   from the deployment history; then re-run the parity verifier. Rollback
   does not change the source of truth and is recorded in the runbook.
8. **Weekly freshness ownership.** The weekly "export missing" signal remains
   owned by the existing data-signals/weekly-search-ops gates; the deploy
   verifier checks freshness at deploy time only.

## Consequences

- Deploying the analytics Worker becomes an explicit, serialized, auditable
  path with an automated post-deploy parity check.
- A live stale build (wrong cron, query-string auth, old artifact) fails the
  workflow run immediately.
- No secret values or external identifiers (token, account ID, worker URL) are
  embedded in tracked files; the verifier redacts auth headers, account IDs,
  and response bodies.
- Manual dispatch remains a human step: no CI event deploys to production
  without an operator.

## Verification

- Wrangler dry-run succeeds from a clean checkout.
- Focused static tests assert trusted triggers (manual only), pinned immutable
  action SHAs, no PR-secret deploy, explicit `--config` path, dry-run before
  deploy, and no secret interpolation in URLs.
- Unit tests of the verifier mock current, stale, unauthorized, and
  propagation states (25 cases).
- Full gate set: worker tests, static-analysis tests, full `pnpm test`, lint,
  format, docs, boundaries.

## Rollback

Revert this ADR's operational assets (workflow, verifier, scripts, docs) as a
single change. The Worker itself keeps a valid deployment; no data migration
is required. If the parity check becomes operationally impossible, deployment
reverts to the manual procedure documented before this ADR (wrangler login +
`wrangler deploy` + manual smoke), which is exactly the pre-incident state this
ADR replaces.

## Change Control Record

1. **Scope declaration:** analytics Worker deployment automation, parity
   verifier, workflow, co-located tests/docs, and this ADR only.
2. **Impacted modules:** `package.json`, `.github/workflows/deploy-analytics-collector.yml`,
   `scripts/data-signals/verify-analytics-worker-deployment.mjs`,
   `workers/analytics-collector/README.md`, the operations runbook.
3. **Invariant preservation:** `URL.PUBLIC.NO_POST_ID`, YMYL/editorial gates,
   public routes, and zero-PII analytics boundaries are unchanged. The export
   artifact schema and counter architecture are untouched.
4. **Contract preservation:** the ingestion payload and export schema do not
   change; the manual export keeps its header-only auth contract.
5. **Boundary integrity:** no new production dependency or cross-layer import;
   the verifier is a repo-side tool that reads the public Cloudflare API.
6. **Test coverage impact:** adds static workflow assertions and 25 verifier
   unit cases covering current/stale/unauthorized/propagation states.
7. **Rollback strategy:** single-change revert of operational assets; Worker
   data needs no migration.
8. **Regression risk:** medium around workflow semantics and verifier
   strictness; focused tests, exact-cron pinning, and the full gate set
   mitigate it.

Competitive adaptation is not applicable: this internal deployment automation
creates no public surface.
