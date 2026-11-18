# CI offloading plan (Cloudflare + Oracle VM)

Status: proposed; the repo-side enablers are in `main`, the host-side work is
pending (Oracle VM shape and Cloudflare Worker rewrite).

## Current topology

| Surface | Runs where | Notes |
| --- | --- | --- |
| Blocking gates (lint, tests, typecheck, build) | i5 host, one isolated runner | serialized, warm local disk, 16 threads |
| Non-blocking audits (a11y, external URL check, reports) | same single slot | they queue behind blocking jobs and can hit the 15‑min timeout |
| Production build | Cloudflare Pages | independent of CI; deploy on push |
| Snapshot refresh | Cloudflare Worker + cron | already offloaded |
| Scheduled reports | self-hosted runner | checkout + pnpm install per run |

The single serialized slot is the bottleneck: a 15‑minute a11y run blocks every
other job.

## Decision matrix

| Workload | Cloudflare Worker | Oracle VM (self-hosted runner) | Keep on i5 |
| --- | --- | --- | --- |
| Stateless HTTP/cron check (< 30 s CPU, no filesystem) | **yes** | possible but wasteful | no |
| Needs repo checkout + pnpm install | no | **yes** | yes (warm caches) |
| Needs Chromium/Playwright | no | **yes** (native arch) | yes |
| Security binaries (Trivy/Gitleaks/Opengrep) | no | **yes** | yes |
| Heavy build (Astro) | no | possible | **yes** (local disk, fastest) |
| GitHub issue/PR writes | yes (token) | yes | yes |

## Cloudflare candidates

Workers run in V8 isolates: 128 MB memory, 30 s CPU (scheduled), no filesystem,
no `child_process`, no Docker. Only stateless jobs fit.

1. **Deploy health — done (2026-11-18).** `workers/deploy-health` fetches the
   published site, the raw snapshot and `docs/governance/url-freeze-exceptions.json`;
   the pure evaluators live in `scripts/lib/deploy-health-evaluators.mjs` and are
   shared with the Node diagnostic. The Worker exposes `GET /status` and a 6 h
   cron. The GitHub workflow is now a ~20 s curl + issue sync (no pnpm, no
   full checkout), so the checks keep running even when the runner is busy.
   Deploy: `pnpm run worker:deploy-health:deploy`.
2. **Status aggregator**: a cron Worker that writes `{ lastSnapshotCommit,
   lastDeploy, lastChecks }` to KV and exposes `GET /status`. Feeds a status
   page or an uptime monitor.
3. **Uptime/HEAD probes** for a small URL set (home, `/uf-hoy/`, one
   calculator, `/api/indicadores-hoy.json`) with KV history.
4. **IndexNow** ping from the deployed sitemap.

Do **not** move: the 9.5k-link URL check (network/CPU), the Astro build,
Playwright, or the security scans.

## Oracle VM candidates

The VM is a natural **second runner**, not a replacement:

- Add a distinct label (e.g. `monedario-ci-heavy`) and route only non-blocking
  jobs: `a11y-audit`, `external-url-check-pr`, `external-url-audit`, and the
  report-only audits.
- Keep blocking gates on the i5: it has the warm caches and the local disk.
- Reuse the same isolation model (`ops/ci-runner/run-one.sh`): JIT registration,
  `--read-only`, cap-drop, no host mounts, tmpfs work volume.

Two host shapes change the plan:

| Shape | Feasible work |
| --- | --- |
| Ampere A1 (arm64, 4 OCPU / 24 GB) | Second runner for most jobs; needs an **arm64** runner image (the current `pcp-ci-isolated` base is x86) and arm64 Playwright browsers. |
| AMD micro (x86, 1/8 OCPU / 1 GB) | Too small for builds/tests; only a lightweight cron runner or a Cloudflare-like status probe. |

The network matters more than the CPU: the i5 restores caches at ~0.5 MB/s. If
the Oracle VM has better egress, route the dependency-heavy jobs there and keep
only the build on the i5.

## Routing enabler

`ci.yml` already uses
`runs-on: ${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-24.04' }}` for every job. To
split traffic without editing every workflow:

1. Add repository variable `ACTIONS_RUNNER_LABEL_HEAVY`.
2. Route the heavy/non-blocking jobs with
   `runs-on: ${{ vars.ACTIONS_RUNNER_LABEL_HEAVY || vars.ACTIONS_RUNNER_LABEL || 'ubuntu-24.04' }}`.
3. Extend `tests/static-analysis/actions-runner-portability.e2e.test.ts` with an
   explicit allowlist of jobs that may use the heavy expression.
4. If the variable is unset, the jobs stay on the primary runner: no outage.

## Warm caches in the runner image

The image is `monedario-ci-isolated:2.338.0-a11y`, derived from the external
`pcp-ci-isolated:2.338.0` (no node/pnpm/uv). A warm-cache image needs a
multi-stage build:

```dockerfile
# build from the repo root: docker build -f ops/ci-runner/Dockerfile -t monedario-ci-isolated:2.338.0-a11y .
FROM node:22-bookworm-slim AS pnpm-store
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack pnpm fetch --frozen-lockfile
# store at /root/.local/share/pnpm/store/v*/files

FROM pcp-ci-isolated:2.338.0
COPY --from=pnpm-store /root/.local/share/pnpm /opt/pnpm-store
```

`bootstrap-pnpm` already seeds `RUNNER_TEMP/pnpm-store` from `/opt/pnpm-store`
when present (no-op otherwise). Pin the base image by digest and rebuild only
in a quiet window; the launcher refuses to start if the image is missing.

## Suggested sequence

1. (done) Typecheck in the first job, snapshot contract test, deploy workflow.
2. Provision the Oracle runner with a `heavy` label; route a11y + external URL
   check first (they are the biggest queue offenders and are non-blocking).
3. (done) Deploy-health Worker + lightweight issue-sync workflow.
4. Add the status aggregator + uptime probes.
5. Evaluate GitHub Pro: 1 GB storage and hosted minutes would remove the
   self-hosted artifact/quota pressure and enable required-reviewer
   environments (GitHub Free does not support them on private repos).
