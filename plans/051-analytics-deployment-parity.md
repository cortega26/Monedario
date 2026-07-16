# Plan 051: Make analytics Worker deployment reproducible and verifiable

> **Executor instructions**: Implement repository automation only after reading
> the CI/deployment ADRs. Never print, persist, or pass secrets in URLs.
>
> **Drift check**: `git diff --stat efe021c7..HEAD -- package.json .github/workflows/ workers/analytics-collector/ tests/static-analysis/ docs/adr/ docs/operations/runbooks/`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: PR #330 deployed and verified manually once
- **Category**: tests / CI / deployment
- **Planned at**: commit `efe021c7`, 2026-07-16
- **Origin**: W28 missed-export incident and `/improve deep`

## Why this matters

Local source had an Authorization-header export handler and intended schedule,
while the live Worker still ran an older query-string build and a Sunday trigger.
All repository gates could pass because no command/workflow verified deployed
version, cron, authentication behavior, or expected R2 freshness. Deployment
must become an explicit, auditable path with a post-deploy parity check so the
next failure is detected immediately, not a week later.

## Current state

- `package.json` has dev/deploy/tail scripts for the economic and Reddit Workers,
  but none for `workers/analytics-collector/wrangler.toml`.
- No workflow owns analytics-collector deployment.
- PR #330 changes the intended trigger to `57 7 * * MON` and adds a source-config
  regression test; that does not prove live parity.
- `workers/analytics-collector/src/index.ts` accepts the export secret only through
  `Authorization: Bearer`; its tests reject query-string credentials.
- The temporary runner ADR requires trusted internal triggers, immutable actions,
  local tool paths, and retirement of self-hosting on/after August 1.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Wrangler dry run | `pnpm exec wrangler deploy --dry-run --config workers/analytics-collector/wrangler.toml` | exit 0 |
| Worker tests | `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` | all pass |
| Static workflow tests | `pnpm exec vitest run tests/static-analysis` | all pass |
| YAML parse | `ruby -e 'require "yaml"; Dir[".github/workflows/*.{yml,yaml}"].each { |f| YAML.load_file(f, aliases: true) }'` | exit 0 |
| Full tests | `pnpm test` | 0 failures |
| Lint/format/boundaries | `pnpm run lint && pnpm run format:check && pnpm run check:boundaries` | exit 0 |
| Docs | `pnpm run check:docs` | exit 0 |

## Scope

**In scope**:

- `package.json`
- `.github/workflows/deploy-analytics-collector.yml` (create)
- one deployment verifier under `scripts/data-signals/` (create)
- focused tests under `tests/static-analysis/` and/or `tests/scripts/`
- `workers/analytics-collector/README.md`
- `docs/adr/ADR-20260716-analytics-worker-deployment-parity.md` (create)
- an operations runbook under `docs/operations/runbooks/` if README is insufficient

**Out of scope**:

- Product source, routes, article content, or unrelated Workers.
- Embedding Cloudflare identifiers/tokens in tracked files or artifacts.
- Query-string authentication, broad account tokens, automatic secret rotation.
- Changing the analytics artifact schema or counter architecture.

## Git workflow

- Branch: `advisor/051-analytics-deployment-parity`
- Commit: `ci(analytics): verify Worker deployment parity`
- Do not push/open a PR unless instructed.

## Steps

### 1. Record deployment ownership and trust boundaries

Create the ADR. Define source of truth, deploy trigger, minimal Cloudflare token
scope, production environment protection if configured, self-hosted-runner rules,
post-deploy parity checks, and rollback to a known Worker version. State that
August 1 changes runner routing, not deploy semantics.

**Verify**: `pnpm run check:docs` exits 0.

### 2. Add canonical local commands

Add `worker:analytics:dev`, `worker:analytics:deploy`, and
`worker:analytics:tail`, mirroring repository conventions and always passing the
explicit config path. Document `wrangler whoami`, dry-run, deploy, version, cron,
and rollback commands without any secret values.

**Verify**: Wrangler dry-run succeeds from a clean checkout.

### 3. Add a controlled deployment workflow

Use pinned actions, least permissions (`contents: read` unless a demonstrated
need exists), the runner-label fallback, concurrency, timeout, frozen install,
focused tests, and Wrangler dry-run before deploy. Preferred trigger: manual
dispatch plus trusted `main` path changes only after branch checks. If the repo
lacks a protected production environment or a minimally scoped API token, keep
deployment manual-only and document the prerequisite; do not weaken security.

**Verify**: static tests assert trusted triggers, pinned actions, no PR-secret
deploy, explicit config, dry-run-before-deploy, and no secret interpolation in a URL.

### 4. Verify live parity without leaking secrets

Create a small verifier that calls the Cloudflare API using environment variables,
checks the active script/version and exact cron `57 7 * * MON`, then performs an
authenticated header-only export smoke for an explicit week. Confirm the expected
R2 key/freshness using metadata, not artifact contents. Redact auth headers,
account IDs, Worker URLs if private, and response bodies that might contain them.
Allow up to 15 minutes for cron propagation with bounded polling; no sleeps over
60 seconds.

**Verify**: unit tests mock current, stale, unauthorized, and propagation states.

### 5. Run gates and one production smoke

After merge, dispatch once, verify exact deployed commit/version, schedule, auth
rejection for query-string input, authenticated export success, and expected R2
artifact. Do not expose the secret in logs. Record non-secret evidence in the PR.

## Done criteria

- [ ] Canonical analytics Worker commands exist and dry-run succeeds.
- [ ] Deployment is trusted, least-privilege, serialized, and auditable.
- [ ] Post-deploy verification checks version, exact schedule, header auth, and R2 freshness.
- [ ] A live stale deployment causes an explicit failed check.
- [ ] ADR/runbook/tests/full gates pass; no secrets or external IDs are committed.

## STOP conditions

- No minimally scoped Cloudflare token or protected trusted trigger is available.
- The verifier would need to log/pass a credential in a URL.
- Live parity cannot be proven without mutating unrelated R2 data.
- Workflow semantics conflict with the temporary-runner ADR or branch policy.

## Maintenance notes

Keep post-deploy checks deterministic and cheap. A successful Wrangler command is
not sufficient evidence; the active version and trigger must both match.
