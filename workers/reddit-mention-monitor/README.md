# Reddit mention monitor (Cloudflare Worker)

Listen-only monitor: every 15 min it searches Reddit for keyword groups Monedario can answer and
pushes **new** matches to a Discord channel, with the suggested calculator to share. It never posts
to Reddit — replying is human work using `docs/operations/COMMUNITY_SEEDING_KIT.md`.

See `docs/adr/ADR-20260601-reddit-mention-monitor.md` for the rationale and viability analysis.

## How it works

`scheduled()` → app-only OAuth token → search each group in `src/keywords.ts` → drop NSFW / below
`MIN_SCORE` / already-seen (KV) → post new matches to Discord → mark them seen (after a successful
alert, so a Discord failure retries next run).

| Piece | File |
|---|---|
| Reddit OAuth + search + normalize | `src/redditClient.ts` |
| Keyword → calculator intent map | `src/keywords.ts` |
| KV dedup | `src/dedup.ts` |
| Discord embeds + delivery | `src/discord.ts` |
| Orchestrator (cron + `/__check`) | `src/index.ts` |

## One-time setup (manual)

1. **Register a Reddit app** at <https://www.reddit.com/prefs/apps> → "create app" → type **script**
   (or **web app**). Note the **client id** (under the app name) and **secret**. Update the `/u/`
   handle in `REDDIT_USER_AGENT` (in `wrangler.toml`) to the owning account.

2. **Create a Discord webhook**: target channel → Edit Channel → Integrations → Webhooks → New
   Webhook → Copy URL.

3. **Create the KV namespace** and paste its id into `wrangler.toml` (`[[kv_namespaces]] id`):
   ```bash
   wrangler kv namespace create REDDIT_SEEN --config workers/reddit-mention-monitor/wrangler.toml
   ```

4. **Set the secrets**:
   ```bash
   cd workers/reddit-mention-monitor
   wrangler secret put REDDIT_CLIENT_ID
   wrangler secret put REDDIT_CLIENT_SECRET
   wrangler secret put DISCORD_WEBHOOK_URL
   wrangler secret put CHECK_SECRET        # any random string, gates /__check
   ```

5. **Deploy**:
   ```bash
   wrangler deploy --config workers/reddit-mention-monitor/wrangler.toml
   ```

## Verify

- Unit tests (pure functions): `pnpm exec vitest run tests/workers/reddit-mention-monitor/`
- Local dry-run with a token in `.dev.vars` / env:
  ```bash
  wrangler dev workers/reddit-mention-monitor/wrangler.toml --test-scheduled
  curl "http://localhost:8787/__check?secret=<CHECK_SECRET>"
  ```
  Run it twice: the second run should report `alerted: 0` (dedup working).
- Production: trigger once from the Cloudflare dashboard; confirm an embed arrives in Discord and,
  after 24h, no duplicate alerts in Workers Logs.

## Tuning

- Keywords / suggested calculators: `src/keywords.ts`.
- Cadence: `crons` in `wrangler.toml`.
- Noise floor: `MIN_SCORE`, `SEARCH_TIME_WINDOW`, `SEARCH_LIMIT` in `[vars]`.

## Rollback

`wrangler delete --config workers/reddit-mention-monitor/wrangler.toml` (optionally delete the KV
namespace, revoke the Reddit app and the Discord webhook).
