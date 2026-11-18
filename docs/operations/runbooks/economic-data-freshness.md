# Economic data freshness — SLO, failure modes and runbook

Scope: the daily UF / USD observado / UTM values shown on the site, from the
Cloudflare Worker commit to the published page.

## SLO

| Stage | Target |
| --- | --- |
| Snapshot commit | Every day by **12:00 America/Santiago** (3 crons: 10:15/14:15/18:15 UTC) |
| Cloudflare Pages deploy | ≤ 10 min after the snapshot commit |
| Degraded mode (aggregator down) | UF/USD still refresh from the BCCh; `source` records `snapshot.carry-forward` |
| Detection of a dead Worker | ≤ 36 h (snapshot heartbeat) |
| Detection of a stale site | ≤ 3 days for UF, ≤ 4 days for USD (weekend-tolerant) |

## Failure-mode matrix

Each failure mode has **one** detector with a threshold tight enough to catch
it. A new incident must add a row here, a detector, and a regression test.

| # | Failure mode | Detector | Threshold | Where |
| --- | --- | --- | --- | --- |
| 1 | Worker never runs (cron gone) | snapshot `capturedAt` heartbeat | 36 h | `workers/deploy-health` + `deploy-health.yml` |
| 2 | Worker runs but the aggregator is down | carry-forward path + `source: snapshot.carry-forward` | immediate | Worker `index.ts`, `payloadFromSnapshot` |
| 3 | Worker commits but the official override fails | `*.override.failed` log + `provenance` | per run | Worker logs (`wrangler tail`) |
| 4 | Worker commits but Pages fails | site dates vs today | UF 3 d / USD 4 d | `check-deploy-health` |
| 5 | **Code merged but Worker not deployed** | last commit vs last `wrangler deploy` | 12 h (checked every 6 h) | `check-worker-deploy-drift.mjs`, `worker-deploy-drift.yml` |
| 6 | Snapshot stale in the repo | `capturedAt` / indicator dates | 2 d / UF 3 d / USD 4 d | `check-economic-snapshot-freshness.mjs` |
| 7 | Wrong data (not stale) | source consistency + legal/economic gates | per gate | `check:economic-source-consistency`, etc. |

## Why the 2026-11-18 incident was not prevented by the 2026-11-10 fix

`ADR-20261110-deploy-health-and-ingestion-resilience` fixed three things:
the URL-freeze exception that blocked Pages builds, the missing BCCh secrets,
and the historical UF/IPC **ingestion** resilience. It also added
`deploy-health`, which watches the **published site**.

The 2026-11-18 failure was a different mode:

- The **snapshot Worker** (not the historical ingestion) hard-depended on
  `mindicador.cl` and aborted on timeout.
- The Worker had **not been redeployed since August**, so the September fixes
  were never live.
- `deploy-health` tolerated 6 days for USD and the weekly CI 10 days, so a
  1-day miss was invisible.

In short: the previous fix added a detector for "repo fresh, site stale". The
new failure was "repo stale because the Worker could not fetch". The matrix
above exists so every mode has its own detector.

## Deploy del Worker

Hay dos caminos equivalentes:

1. **Workflow (recomendado):** `Actions → Deploy economic snapshot worker →
   Run workflow`, input `confirm=deploy`. Hace typecheck, dry-run, deploy y
   verifica que el deployment de código sea reciente. Queda registrado en el
   environment `production`.
2. **Local:** `pnpm run worker:economic-snapshot:deploy`.

El environment `production` hoy **no tiene required reviewers**: GitHub Free no
soporta esa protección en repos privados (requiere Pro/Team). El gate humano es
la confirmación explícita del workflow. Si el repo pasa a Pro, activar
required reviewers en `Settings → Environments → production` sin cambiar el
workflow.

## Deploy health Worker (`/status`)

The checks run in `workers/deploy-health` every 6 h and are exposed at
`https://monedario-deploy-health.carlosortega77.workers.dev/status`. The GitHub
workflow only curls that endpoint and syncs the tracking issue.

```bash
pnpm run worker:deploy-health:deploy
curl -sS https://monedario-deploy-health.carlosortega77.workers.dev/status | jq .
```

If the account subdomain changes, set the repository variable
`DEPLOY_HEALTH_STATUS_URL`; the workflow falls back to the URL above.

## Runbook: "the site shows yesterday's value"

1. **Is the repo stale too?**
   ```bash
   curl -s https://raw.githubusercontent.com/cortega26/Monedario/main/src/infrastructure/economic/economic-parameters.snapshot.json \
     | jq '{uf, dolar, lastUpdated, capturedAt, source}'
   ```
   - `source: snapshot.carry-forward` → the aggregator is down; UF/USD should
     still be current from the BCCh. Check the official value below.
   - `capturedAt` old → go to step 3.
2. **Does the official source have a newer value?**
   - UF: <https://www.sii.cl/valores_y_fechas/uf/uf2026.htm>
   - USD/UF diarios: <https://si3.bcentral.cl/indicadoressiete/secure/IndicadoresDiarios.aspx>
3. **Is the Worker running?**
   ```bash
   pnpm exec wrangler tail monedario-economic-snapshot-refresh --format pretty
   # or inspect the last deployment
   pnpm exec wrangler deployments list --config workers/economic-snapshot-refresh/wrangler.toml
   ```
   - `refresh.failed` + `TimeoutError` → aggregator/network; the fallback should
     have prevented it (check the deployed version).
   - No invocations → triggers missing; redeploy.
4. **Is the deployed code current?**
   ```bash
   pnpm exec wrangler deployments list --config workers/economic-snapshot-refresh/wrangler.toml
   git log -1 --format=%cI -- workers/economic-snapshot-refresh
   ```
   If the last `triggered_by=deployment` is older than the last commit:
   `pnpm run worker:economic-snapshot:deploy`.
5. **Is Pages deploying?**
   `pnpm exec wrangler pages deployment list --project-name monedario` → latest
   Production for `main` must be `Active`; otherwise read the build log.

## Guardrails added after 2026-11-18

- `withMindicadorFallback` + `payloadFromSnapshot`: an aggregator outage no
  longer freezes the snapshot; BCCh/SII/INE overrides still apply.
- `aggregatorOutage.test.ts`: handler-level regression test that fails without
  the fallback (it reproduces the `TimeoutError`).
- `check-worker-deploy-drift.mjs` + `worker-deploy-drift.yml`: daily check that
  the deployed Worker includes the last commit; ignores secret-change
  deployments.
- Tighter thresholds: snapshot `capturedAt` ≤ 2 d, UF ≤ 3 d, USD ≤ 4 d; site
  heartbeat 36 h.

## Rule for future incidents

A fix is not complete until it adds:

1. a row in the failure-mode matrix,
2. a detector with an explicit threshold and an owning workflow,
3. a regression test that **fails without the fix** (prefer the real handler,
   not a reimplementation),
4. for Worker changes, a deploy step and the drift check above.
