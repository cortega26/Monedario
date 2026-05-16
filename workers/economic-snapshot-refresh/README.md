# `economic-snapshot-refresh` Cloudflare Worker

Refreshes `src/infrastructure/economic/economic-parameters.snapshot.json` on a daily cron. Replaces the scheduled GitHub Actions job that was failing when the free-tier Actions quota was exhausted. See `docs/adr/ADR-20260516-economic-snapshot-cloudflare-worker.md` for the architectural rationale.

## What it does

1. Daily at `15 10 * * *` UTC, fetches indicators from `https://mindicador.cl/api` and `https://mindicador.cl/api/utm/<año>`.
2. Builds a snapshot with the same shape produced by `scripts/refresh-economic-snapshot.mjs`.
3. Compares with the current file on `main` (excluding `capturedAt`, which is non-deterministic).
4. If different, commits the new content to `main` via the GitHub Contents API as `monedario-snapshot-bot`. Cloudflare Pages auto-deploys on push.
5. If identical, exits silently (no empty commits).

## First-time setup

### 1. Install dependencies in the repo root

```bash
pnpm add -D wrangler @cloudflare/workers-types
```

### 2. Create the GitHub PAT

1. https://github.com/settings/personal-access-tokens/new
2. **Fine-grained token**, expiration **1 year** (max), Repository access = **Only select repositories** → `cortega26/Monedario`.
3. Repository permissions:
   - **Contents: Read and write** (the only permission needed)
   - Metadata: Read-only (automatically granted)
4. Save the token value — you will not see it again.

### 3. Authenticate wrangler with Cloudflare

```bash
pnpm exec wrangler login
```

Use the same Cloudflare account that hosts the Pages project.

### 4. Set the GitHub token as a Worker secret

```bash
pnpm exec wrangler secret put GITHUB_TOKEN --config workers/economic-snapshot-refresh/wrangler.toml
# paste the PAT when prompted
```

### 5. Deploy

```bash
pnpm run worker:economic-snapshot:deploy
```

Wrangler prints the assigned `*.workers.dev` URL. The cron trigger registers automatically on deploy.

### 6. Verify the first run manually

In the Cloudflare dashboard → **Workers & Pages** → `monedario-economic-snapshot-refresh` → **Triggers** → **Cron Triggers** → **Run now**.

Alternatively, trigger via HTTP (gated by the PAT for safety):

```bash
curl "https://monedario-economic-snapshot-refresh.<your-subdomain>.workers.dev/__refresh?secret=<PAT>"
```

Expected outcomes:

- **First production run after deploy:** if the in-repo snapshot is stale, you'll see a commit from `monedario-snapshot-bot` on `main`. Cloudflare Pages picks it up and redeploys within a few minutes.
- **Same-day repeat run:** `refresh.noop` log entry, no commit.

## Local development

```bash
pnpm run worker:economic-snapshot:dev
```

Wrangler boots a local Worker with the cron emulator. Trigger the scheduled handler:

```bash
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

For `--test-scheduled` to actually commit, you need a valid `GITHUB_TOKEN` in `.dev.vars` (do **not** commit this file):

```ini
# workers/economic-snapshot-refresh/.dev.vars
GITHUB_TOKEN = "ghp_yourtoken"
```

## Observability

- **Logs:** Cloudflare dashboard → Worker → **Logs** (live tail). Structured JSON: `event` = `refresh.committed | refresh.noop | refresh.failed`.
- **Tail from terminal:** `pnpm run worker:economic-snapshot:tail`.
- **Failure visibility:** failures throw inside `ctx.waitUntil`, which surfaces them in the dashboard. No email/Discord alerting in V1 — review logs weekly or after a snapshot looks stale on the site.

## PAT rotation

Recommended cadence: **every 11 months** (1 month buffer before the 1-year hard expiry).

1. Generate a new PAT with the same scope (see step 2 above).
2. `pnpm exec wrangler secret put GITHUB_TOKEN --config workers/economic-snapshot-refresh/wrangler.toml` — paste the new token.
3. Trigger a manual run from the dashboard to verify it works.
4. Revoke the old PAT in GitHub settings.

Add a calendar reminder for this date.

## Manual fallback (when the Worker is down)

The original GitHub Actions workflow `.github/workflows/refresh-economic-snapshot.yml` is now `workflow_dispatch` only. To force a refresh from CI:

```bash
gh workflow run refresh-economic-snapshot.yml
```

This still consumes GitHub Actions minutes, so reserve it for incidents.

If you also need the script to run locally:

```bash
pnpm run economic:snapshot:refresh
git add src/infrastructure/economic/economic-parameters.snapshot.json
git commit -m "chore(editorial): refresh economic snapshot (manual)"
git push
```

## Full rollback

1. Disable the cron trigger: Cloudflare dashboard → Worker → **Triggers** → remove the cron, or `pnpm exec wrangler delete --config workers/economic-snapshot-refresh/wrangler.toml`.
2. Restore the `schedule:` block in `.github/workflows/refresh-economic-snapshot.yml` (commented in place for easy revert).
3. Revoke the PAT in GitHub if the migration is being cancelled definitively.

## File map

| File | Purpose |
|---|---|
| `src/buildSnapshot.ts` | Pure builder. Takes injected fetchers, returns the typed snapshot. No CF-specific imports. |
| `src/githubClient.ts` | Minimal GitHub Contents API client (GET sha + PUT new content). |
| `src/index.ts` | Worker entry — `scheduled` handler + `fetch` handler for manual trigger. |
| `wrangler.toml` | Worker config, cron trigger, non-secret env vars. |
| `tsconfig.json` | Worker-scoped TS config with `@cloudflare/workers-types`. |
| `../../tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts` | Unit tests over the pure builder. Run via `pnpm exec vitest`. |

## Why not also port `editorial:volatile-data:refresh`?

Out of scope for V1. The editorial volatile data refresh scrapes HTML pages on spensiones.cl (~297 lines, fragile to upstream layout changes). Porting it to the Workers runtime is significantly higher risk and effort than this Worker, with no benefit to the visible problem (the public indicators page). The editorial refresh remains in `.github/workflows/refresh-economic-snapshot.yml` as `workflow_dispatch` only.
