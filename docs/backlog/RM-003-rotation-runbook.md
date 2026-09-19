# RM-003 — Rotation runbook (accepted residual: no rotation executed)

**Date:** 2026-09-19 · **Wave:** 0 · **Status:** accepted residual —
no secret was rotated while writing this runbook. Rotate only when
there is a reason (suspected leak, owner change, scheduled hygiene).

Scope: `reddit-monitor/` (Python on Oracle VM) + worker
`reddit-mention-monitor` (Discord webhook only). No alert semantics
change; rotation only swaps secret values.

General rule after any step below: confirm delivery once
(ntfy push / web login / Discord message) and never paste secret
values into chat, docs, or shell history.

## 1. Reddit app secret (`credentials.json`)

1. Create the new secret in Reddit (app preferences) — do not delete
   the old one yet.
2. Update the local `reddit-monitor/credentials.json` (mode `600`,
   git-ignored) with the new value.
3. Copy to the VM and fix perms in the same pass:
   `scp <local>/credentials.json <vm>:<remote>/ && ssh <vm>
   "chmod 600 <remote>/credentials.json"`
4. Wait for one hourly run (`runs.log`), then revoke the old secret
   in Reddit.

## 2. ntfy topic (`NTFY_TOPIC` in remote `.env`)

1. Pick a new unguessable topic (e.g. output of `openssl rand -hex 8`).
2. On the VM, replace the line in `<remote>/.env` (mode `600`,
   same `grep -v` pattern `upgrade_fase1.sh` uses for `WEB_PASSWORD`)
   and restart `reddit-monitor.service`.
3. Subscribe the new topic in the ntfy app; unsubscribe the old one.
4. Trigger one test notification before abandoning the old topic.

## 3. `WEB_PASSWORD` (local record + VM; cloudflared unaffected)

1. Choose a new password and update the local record (password
   manager) — the only "local" copy; it never lives in the repo.
2. On the VM, replace `WEB_PASSWORD` in `<remote>/.env` (same
   `grep -v` + `chmod 600` pattern), then
   `sudo systemctl restart reddit-monitor-web.service`.
3. Verify: `curl -u carlos:<new> http://127.0.0.1:8088/` → 200,
   then `bash verify_fase1.sh` §3.
4. cloudflared needs no change: the tunnel forwards to
   `localhost:8088` and never sees the password.

## 4. Discord webhook (worker `reddit-mention-monitor`)

1. Regenerate the webhook in Discord channel settings (old URL dies).
2. `wrangler secret put DISCORD_WEBHOOK_URL --config
   workers/reddit-mention-monitor/wrangler.toml` with the new URL.
3. Confirm with one live alert cycle; unrelated worker secrets
   (`REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `CHECK_SECRET`)
   are untouched.
