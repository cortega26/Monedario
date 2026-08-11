# ADR-20260716: Worker manual-trigger auth outside URLs

Date: 2026-07-16
Status: Accepted
Re-implemented: 2026-08-11 (plan 052; the original implementation was lost
with its branch — see `plans/README.md` and TD-0105)

## Context

Two Workers authenticate manual smoke endpoints through query parameters, and
URLs persist in shell history, request/proxy logs, browser history, and
telemetry:

- `workers/economic-snapshot-refresh/src/index.ts` — `/__refresh` gated by
  `?secret=<GITHUB_TOKEN>`. The economic Worker **reuses its GitHub
  repository-write PAT as the trigger secret**: one leaked URL exposes
  repository write authority.
- `workers/reddit-mention-monitor/src/index.ts` — `/__check` gated by
  `?secret=<CHECK_SECRET>`.

The analytics Worker already implements the correct pattern
(`workers/analytics-collector/src/index.ts`): dedicated secret, `Authorization:
Bearer` header, constant-time comparison without early secret-dependent exit,
and query-string rejection (query-only requests are unauthorized).

## Decision

1. The economic Worker gains a dedicated `TRIGGER_SECRET`, separate from
   `GITHUB_TOKEN`. `GITHUB_TOKEN` remains solely for GitHub API writes.
2. Both `/__refresh` and `/__check` accept credentials only via
   `Authorization: Bearer <secret>`.
3. Comparison is constant-time (XOR over padded lengths, no early exit).
4. Query-string credentials are rejected: only the header is read, so the old
   `?secret=` form returns `401 missing_secret`.
5. Status semantics mirror the analytics endpoint: `503` when the secret is
   not configured, `401` missing header, `403` invalid secret, `404` wrong
   route, `500` downstream failure.
6. The economic endpoint never compares manual auth against `env.GITHUB_TOKEN`.

## Coordinated deploy/rotation

Order matters — the new code fails closed (`503 trigger_not_configured`) until
`TRIGGER_SECRET` exists, so secrets can be set before or after the deploy:

1. `wrangler secret put TRIGGER_SECRET` (economic) and rotate/re-set
   `CHECK_SECRET` (reddit) before or with the deploy.
2. Deploy both Workers; verify the old query-URL form fails (401) and the
   header smoke succeeds.
3. If URL-based smoke was ever used or log exposure cannot be ruled out,
   rotate/revoke the GitHub PAT (account-level authority — human gate).

## Consequences

- Credential transport (header vs URL) and credential scope (dedicated secret
  vs repo-write PAT) are separate controls; both are required.
- Query-string rejection stays as a permanent regression test in each worker's
  test suite.
- The old URL form is dead: operators must use the header form or the
  Cloudflare dashboard "Run now" trigger.
