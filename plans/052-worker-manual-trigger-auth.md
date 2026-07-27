# Plan 052: Remove Worker manual-trigger secrets from URLs

> **Executor instructions**: Treat this as a credential-transport change. Never
> echo a secret, paste one into a command line URL, or reuse a repository-write
> credential as a manual-trigger credential.
>
> **Drift check**: `git diff --stat efe021c7..HEAD -- workers/economic-snapshot-refresh workers/reddit-mention-monitor tests/workers package.json docs/adr/`

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW for code; MED operationally because secrets must be coordinated
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `efe021c7`, 2026-07-16
- **Origin**: `/improve deep` security audit during Issue #315
- **Execution**: implementación local revisada y aprobada en `ae9246bd`; el
  plan sigue `IN PROGRESS` porque los secretos dedicados aún no se desplegaron,
  falta el smoke productivo y la rotación/revocación del PAT requiere autoridad
  de emisión a nivel de cuenta GitHub.

## Why this matters

Two Workers authenticate manual smoke endpoints through query parameters. URLs
can persist in shell history, request/proxy logs, browser history, and telemetry.
The economic Worker reuses its GitHub repository-write PAT as the trigger secret,
so one leaked URL can expose repository write authority. Both endpoints should
follow the already-tested analytics pattern: dedicated secret, Authorization
header, constant-time comparison, and query-string rejection.

## Current state

- `workers/economic-snapshot-refresh/src/index.ts:203-213` reads
  `?secret=<GITHUB_TOKEN>` for `/__refresh`.
- `workers/economic-snapshot-refresh/README.md:91-95` documents a URL containing
  the PAT. `GITHUB_TOKEN` is also used for legitimate GitHub API writes.
- `workers/reddit-mention-monitor/src/index.ts:133-142` reads
  `?secret=<CHECK_SECRET>` for `/__check` and its README documents the URL.
- `workers/analytics-collector/src/index.ts:756+` is the repository exemplar:
  Authorization header plus constant-time comparison; its tests explicitly reject
  a query-string secret.
- No tracked live credential was found and `pnpm audit --prod` is clean; this
  plan addresses transport and credential separation, not an alleged confirmed leak.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Worker tests | `pnpm exec vitest run tests/workers/economic-snapshot-refresh tests/workers/reddit-mention-monitor` | all pass |
| Search regression | `rg -n "searchParams\.get\(\"secret\"\)|[?&]secret=|<PAT>" workers/economic-snapshot-refresh workers/reddit-mention-monitor tests/workers/economic-snapshot-refresh tests/workers/reddit-mention-monitor` | no credential-in-URL implementation/docs; intentional negative-test URLs are reviewed separately |
| Lint | `pnpm exec eslint workers/economic-snapshot-refresh/src workers/reddit-mention-monitor/src tests/workers` | exit 0 |
| Full tests | `pnpm test` | 0 failures |
| Security audit | `pnpm audit --prod --audit-level high` | no known high/critical vulnerabilities |
| Docs/format/boundaries | `pnpm run check:docs && pnpm run format:check && pnpm run check:boundaries` | exit 0 |

## Scope

**In scope**:

- `workers/economic-snapshot-refresh/src/index.ts`
- `workers/economic-snapshot-refresh/README.md`
- `workers/economic-snapshot-refresh/wrangler.toml` comments only if needed
- `workers/reddit-mention-monitor/src/index.ts`
- `workers/reddit-mention-monitor/README.md`
- `workers/reddit-mention-monitor/wrangler.toml` comments only if needed
- focused endpoint tests under the corresponding `tests/workers/` directories
- `docs/adr/ADR-20260716-worker-manual-trigger-auth.md` (create)

**Out of scope**:

- GitHub API authorization behavior used by the economic refresh itself.
- Reddit/Discord provider logic, schedules, content, routes, or analytics Worker.
- Printing, committing, or returning any credential.
- Broad shared-auth refactor across unrelated services.

## Git workflow

- Branch: `advisor/052-worker-manual-trigger-auth`
- Commit: `fix(security): move Worker trigger auth out of URLs`
- Do not push/open a PR unless instructed.

## Steps

### 1. Document the credential boundary

Create the ADR: economic refresh gains a dedicated `TRIGGER_SECRET`, separate
from `GITHUB_TOKEN`; Reddit retains its dedicated `CHECK_SECRET`. Both accept only
`Authorization: Bearer <secret>`, compare without early secret-dependent exit,
and reject query-string credentials. Record coordinated deploy/rotation/rollback.

**Verify**: `pnpm run check:docs` exits 0.

### 2. Implement a header-only verifier in each Worker

Follow the analytics endpoint behavior and status semantics. Missing header,
wrong scheme, wrong secret, and query-only secret must be unauthorized/forbidden
without revealing which bytes differ. Use a small local constant-time helper or
a repository utility only if that does not broaden scope. The economic endpoint
must never compare manual auth against `env.GITHUB_TOKEN`.

**Verify**: endpoint tests cover valid header, missing, wrong, malformed scheme,
query-only, wrong route, and the downstream error response.

### 3. Update safe operator documentation

Document setting the dedicated secrets through Wrangler. Example smoke commands
must read the secret from a protected environment variable or stdin-derived shell
variable and place it only in the header; warn that command-line headers may still
enter process/history on some systems and prefer Cloudflare dashboard “Run now”
when possible. Never include a realistic token prefix.

**Verify**: regression `rg` command returns no implementation/documentation
URL-secret pattern. A literal query URL is allowed only inside a negative test
that proves the endpoint rejects it; review that assertion separately.

### 4. Coordinate deploy and rotation

Before deploying economic Worker code, set `TRIGGER_SECRET`; preserve
`GITHUB_TOKEN` solely for GitHub API use. Set/rotate `CHECK_SECRET` for Reddit.
Deploy, verify old query URLs fail, header smoke succeeds, then rotate the GitHub
PAT if URL-based smoke was ever used or log exposure cannot be ruled out. PAT
rotation requires updating the Worker secret and revoking the old token; do not
mark this operational step done on assumption.

**Verify**: non-secret deployment evidence records status codes and Worker version,
not request headers/URLs containing credentials.

### 5. Run all gates and inspect scope

Run Commands and confirm only in-scope files changed.

## Done criteria

- [ ] Neither endpoint accepts a secret through query parameters.
- [ ] Economic manual auth no longer reuses `GITHUB_TOKEN`.
- [ ] Dedicated secrets are deployed before the new code becomes active.
- [ ] Old URL form fails and valid header form succeeds in production.
- [ ] If prior URL use cannot be excluded, the GitHub PAT is rotated/revoked.
- [ ] Tests, docs, audit, lint, format, boundaries, and full suite pass.

## STOP conditions

- A dedicated secret cannot be set before deploying the code.
- PAT rotation requires user/account authority unavailable to the executor.
- Any proposed test or log would reveal a real credential.
- A shared auth refactor or unrelated Worker change becomes necessary.

## Maintenance notes

Credential transport and credential scope are separate controls; both are
required here. Query-string rejection should remain a permanent regression test.
