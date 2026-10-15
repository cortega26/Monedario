# Edge CSP monitor — Cloudflare Precursor / JSD

**Existing incident:** [Monedario #675](https://github.com/cortega26/Monedario/issues/675).
**Default:** SHADOW. Merely merging this code does **not** activate monitoring.

Cloudflare Precursor supersedes JavaScript Detections and adds its own browser code. The historical JSD API switch (`bot_management.enable_js`) does **not** fully describe Precursor. This standalone Worker runs **Chromium Browser Run** against the real custom domain with distinct cache-busting queries; detects known injected edge script signatures and challenge-platform paths; and requires normal page markup. It never changes zone settings, security policies, TTLs or application code.

## Set up / activate (authorized Cloudflare deployment required)

1. `pnpm run test:edge-guard` — pure Node tests (no network or secrets).
2. `pnpm exec wrangler deploy --config workers/edge-csp-monitor/wrangler.toml`. The new Worker is independent of Cloudflare Pages and GitHub Actions; Wrangler defaults to `MONITOR_MODE="shadow"` and requires **no GitHub token** to take a read-only baseline.
3. After the shadow baseline passes, set `EDGE_MONITOR_GITHUB_TOKEN` via `pnpm exec wrangler secret put EDGE_MONITOR_GITHUB_TOKEN --config workers/edge-csp-monitor/wrangler.toml`. Use a fine-grained Monedario token with **Issues Read/Write** only; never commit it.
4. Test `scheduled()` with Wrangler's scheduled testing endpoint (or observe the first Cron Trigger). Inspect `[edge-csp-monitor]` logs, require **3 of 3 ok**, confirm no Challenge/Browser Run failures, and check Browser Run usage. Browser Run is recognizable as an automated client and can see different behavior from a normal visitor.
5. Only after the real baseline is successful, change `MONITOR_MODE` to `active` and redeploy. Verify delivery using a controlled test; **never reenable Precursor on the live site just to test alerts**.
6. Observe at least **two Cron Trigger runs** and verify a normal-visitor Chromium CSP test independently before closing #675.

## Schedule, notification, and limitations

- Cron: 09:15 / 21:15 **UTC** (Cloudflare Worker), 3 pages serially per run, no GitHub Actions billable minutes. Verify the account's Browser Run quota (free tier: 10 minutes/day as of October 2026).
- Browser Run `quickAction("content")` returns rendered HTML; it does **not** capture browser console CSP errors. Match known JSD/Precursor-related paths as an early warning; future injection patterns may differ. Independent normal Chromium console checks and an authorized Cloudflare dashboard audit remain necessary.
- `shadow` writes only to Worker observability logs. `active` posts a drift/inconclusive alert to **existing issue #675**, once per state transition or daily until resolved. When subsequent checks recover, posts a recovery notice. No new issue, automated toggle change or auto-rollback.
- `inconclusive` = HTML invalid, challenge, browser exception or quota issue. It is **not** evidence that Precursor switched on. Missing GitHub token in active mode, missing browser binding or failed GitHub notification throws a hard error and must be investigated via Worker observability.
- **Never** add `no-transform` as an automated workaround: Cloudflare then stops compressing HTML. Don't weaken CSP with `unsafe-inline` or static nonces. See `docs/operations/runbooks/CSP_CLOUDFLARE_JSD_2026-08-02.md`.

**Acceptance gate:** code + tests green; shadow Worker deployed; real baseline 3/3; active notifications verified; two scheduled runs observed; independent Chromium CSP 0 violations; authorized Cloudflare Precursor/JSD toggle checks. Until then: **NOT OPERATIONAL**, and keep #675 open.
