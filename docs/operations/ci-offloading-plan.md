# CI offloading plan (Cloudflare + Oracle VM)

Status: **partly implemented; Oracle VM option rejected** (updated 2026-11-18).
The original 2026-10 proposal is preserved below for context; the update section
is authoritative.

## Update 2026-11-18

The repository is now public. Decisions since the proposal:

| Decision | State |
| --- | --- |
| Second runner slot | **Done.** `monedario-isolated-ci-2.service` runs a second 3 CPU / 8 GB slot on the same i5; the watchdog maps each lease to its slot. Non-blocking audits no longer serialize behind blocking gates. |
| Oracle VM as a Monedario runner | **Rejected.** `pogo-lab-prod-a1` is a 2 OCPU / 12 GB production host shared with Pogo-lab and the Fintual executor; no Docker/node, and the 2026-11-18 storage cleanup left no headroom for CI. It stays out of Monedario CI. |
| Deploy-health Worker | **Live, no cron.** `/status` runs on demand; the account is at the Workers Free 5-trigger limit, so `deploy-health.yml` calls it every 6 h. It reads the public `/api/deploy-health.json` artifact, not `raw.githubusercontent.com`. |
| Warm pnpm store | **Done.** The runner image bakes an 823 MB store at `/opt/pnpm-store`; a lockfile-change install measured `reused 932, downloaded 0, Done in 13s` (was ~6 min). |
| Public repository | **Since 2026-11-18.** GitHub-hosted standard runners and artifact storage are free for public repos; the self-hosted slots remain for capacity and local caches. Re-evaluate hosted runners in the next capacity review. |
| Remaining Cloudflare candidates | Status aggregator, uptime/HEAD probes, IndexNow ping. |

The original proposal's "single serialized slot" premise no longer holds; the
rest of the analysis (what fits in a Worker vs. a runner) is still the
reference.

## Original proposal (2026-10)

### Current topology

| Surface | Runs where | Notes |
| --- | --- | --- |
| Blocking gates (lint, tests, typecheck, build) | i5 host, one isolated runner | serialized, warm local disk, 16 threads |
| Non-blocking audits (a11y, external URL check, reports) | same single slot | they queue behind blocking jobs and can hit the 15‑min timeout |
| Production build | Cloudflare Pages | independent of CI; deploy on push |
| Snapshot refresh | Cloudflare Worker + cron | already offloaded |
| Scheduled reports | self-hosted runner | checkout + pnpm install per run |

The single serialized slot is the bottleneck: a 15‑minute a11y run blocks every
other job.

### Decision matrix

| Workload | Cloudflare Worker | Oracle VM (self-hosted runner) | Keep on i5 |
| --- | --- | --- | --- |
| Stateless HTTP/cron check (< 30 s CPU, no filesystem) | **yes** | possible but wasteful | no |
| Needs repo checkout + pnpm install | no | **yes** | yes (warm caches) |
| Needs Chromium/Playwright | no | **yes** (native arch) | yes |
| Security binaries (Trivy/Gitleaks/Opengrep) | no | **yes** | yes |
| Heavy build (Astro) | no | possible | **yes** (local disk, fastest) |
| GitHub issue/PR writes | yes (token) | yes | yes |

### Cloudflare candidates

Workers run in V8 isolates: 128 MB memory, 30 s CPU (scheduled), no filesystem,
no `child_process`, no Docker. Only stateless jobs fit.

1. **Deploy health — done (2026-11-18).** `workers/deploy-health` fetches the
   published site, the public `/api/deploy-health.json` artifact and the
   URL-freeze exceptions; the pure evaluators live in
   `scripts/lib/deploy-health-evaluators.mjs` and are shared with the Node
   diagnostic. The Worker exposes `GET /status` and runs on demand (no cron:
   the account is at the Workers Free 5-trigger limit). The GitHub workflow is
   a ~20 s curl + issue sync (no pnpm, no full checkout), so the checks keep
   running even when the runner is busy.
   Deploy: `pnpm run worker:deploy-health:deploy`.
2. **Status aggregator**: a cron Worker that writes `{ lastSnapshotCommit,
   lastDeploy, lastChecks }` to KV and exposes `GET /status`. Feeds a status
   page or an uptime monitor.
3. **Uptime/HEAD probes** for a small URL set (home, `/uf-hoy/`, one
   calculator, `/api/indicadores-hoy.json`) with KV history.
4. **IndexNow** ping from the deployed sitemap.

Do **not** move: the 9.5k-link URL check (network/CPU), the Astro build,
Playwright, or the security scans.

### Oracle VM candidates

The VM was evaluated as a **second runner**, not a replacement. It was rejected
on 2026-11-18 (see the update section): 2 OCPU / 12 GB shared with production
services and no Docker/node. The historical analysis is kept for the next host
decision:

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
a future VM has better egress, route the dependency-heavy jobs there and keep
only the build on the i5.

### Routing enabler

`ci.yml` already uses
`runs-on: ${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-24.04' }}` for every job. To
split traffic without editing every workflow:

1. Add repository variable `ACTIONS_RUNNER_LABEL_HEAVY`.
2. Route the heavy/non-blocking jobs with:

   ```yaml
   runs-on: >-
     ${{ vars.ACTIONS_RUNNER_LABEL_HEAVY ||
     vars.ACTIONS_RUNNER_LABEL || 'ubuntu-24.04' }}
   ```
3. Extend `tests/static-analysis/actions-runner-portability.e2e.test.ts` with an
   explicit allowlist of jobs that may use the heavy expression.
4. If the variable is unset, the jobs stay on the primary runner: no outage.

The second slot was implemented without the heavy label (both slots share the
same label); the watchdog maps each lease to its systemd slot.

### Warm caches in the runner image

**Implemented 2026-11-18.** The image is
`monedario-ci-isolated:2.338.0-a11y`, derived from the external
`pcp-ci-isolated:2.338.0`, plus a `node:22-bookworm-slim` builder stage:

```dockerfile
# build from the repo root:
#   docker build -f ops/ci-runner/Dockerfile \
#     -t monedario-ci-isolated:2.338.0-a11y .
FROM node:22-bookworm-slim AS pnpm-store
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack pnpm fetch --frozen-lockfile

FROM pcp-ci-isolated:2.338.0
COPY --from=pnpm-store /pnpm-store /opt/pnpm-store
```

`bootstrap-pnpm` seeds `RUNNER_TEMP/pnpm-store` from `/opt/pnpm-store` when
present (no-op otherwise). Measured on 2026-11-18: store 823 MB, install
`reused 932, downloaded 0, Done in 13s` (was ~6 min and a timeout). Pin the
base image by digest and rebuild only in a quiet window; the launcher refuses
to start if the image is missing.

### Suggested sequence

1. (done) Typecheck in the first job, snapshot contract test, deploy workflow.
2. (rejected 2026-11-18) Provision the Oracle runner with a `heavy` label;
   route a11y + external URL check first.
3. (done) Deploy-health Worker + lightweight issue-sync workflow.
4. Add the status aggregator + uptime probes.
5. (superseded 2026-11-18) The repository is public, so GitHub-hosted standard
   runners and artifact storage are free. Re-evaluate whether to keep the
   self-hosted slots for capacity or fall back to hosted runners; required
   reviewers are now available on the `production` environment.
