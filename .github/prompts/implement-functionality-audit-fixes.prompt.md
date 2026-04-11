---
description: Implement all P0/P1 functionality fixes from the 2026-04-08 functionality audit
applyTo: 'src/**,tests/**,.github/workflows/**,Dockerfile'
---

## Task Brief
- **Objective:** Implement all critical/high functionality fixes from `output/audit/functionality-audit-20260408.md`
- **In scope:** `src/layouts/PostDetails.astro` (format fix), `.github/workflows/deploy.yml` (timeout + approval gate), `Dockerfile` (pin + security headers + non-root), `tests/application/` (6 new test files)
- **Out of scope:** Content edits, SEO items, `src/data/blog/`, URL routing, content audit items
- **Invariants to preserve:** `TEST.DOMAIN_COVERAGE`, `CI.GATE_SET`, `ARCH.LAYER_BOUNDARIES`
- **Required gates (all must pass after ALL edits):**
  - `pnpm run format:check` — must change from FAIL to PASS (8/8 gates)
  - `pnpm run test` — must pass with ≥172 tests (166 existing + 6 new minimum)
  - `pnpm run lint`
  - `pnpm run check:boundaries`
  - `pnpm astro check`
- **Deliverable:** format:check unblocked; 3 YMYL use-cases with tests; Dockerfile hardened; deploy.yml timeout pinned; all 5 gates pass
- **Benchmark observed:** document only if a visible feature/UX pattern is borrowed; otherwise `N/A`
- **Why it worked externally:** `N/A`
- **Proposed local delta:** any borrowed visible pattern must be adapted to repo constraints and ownership model
- **What will not be copied:** reader-facing copy, public URL strategy, unreviewed IA patterns
- **Owner/surface affected:** state the feature, view, or workflow touched
- **Success signal:** functionality audit closes with no new ownership or boundary conflict

## Authority Check (AGENTS.md Rule 1.1)
Before starting, read these files in order:
1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `context/INVARIANTS.md`
4. `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` — required if any visible feature pattern is adapted from outside
5. `docs/TECH_DEBT_BACKLOG.md`
6. `output/audit/functionality-audit-20260408.md` — full functionality audit report

---

## Fix 1 — Unblock `format:check`: PostDetails.astro L442 (FN-004, HIGH — DO FIRST)

**Context:** `pnpm run format:check` (Prettier) fails with "Line exceeds print-width" on `src/layouts/PostDetails.astro` around line 442. This blocks CI gate 8/8. This must be fixed first.

**Action:**
1. Read `src/layouts/PostDetails.astro` lines 430–460 to see the violation.
2. Break the long template literal or JSX expression into a multi-line form that Prettier accepts.
3. Do NOT reformat the entire file — minimal hunk only (AGENTS.md Rule 2.2).
4. Run immediately after editing:

```bash
pnpm run format:check
```

It must pass before proceeding to other fixes.

Note: If the violation is a long string inside a template literal, use a variable or break it across lines. If it's an attribute, move it to a new line per Prettier's JSX rules. Do not run `pnpm run format` (autoformat) on the whole file — it may produce unwanted diffs in unrelated lines.

---

## Fix 2 — Pin deploy.yml timeouts (FN-005, HIGH)

**Context:** `.github/workflows/deploy.yml` has `build` and `deploy` jobs with no `timeout-minutes`. This means a hung job can consume GitHub Actions minutes for up to 6 hours.

**Action:** Read `.github/workflows/deploy.yml`. Add `timeout-minutes` to each job:

```yaml
jobs:
  build:
    timeout-minutes: 15
    ...
  deploy:
    timeout-minutes: 10
    ...
```

Place `timeout-minutes` as a sibling of `runs-on`, not inside a step. Do NOT change any other lines.

---

## Fix 3 — Pin Dockerfile base image (FN-006, HIGH)

**Context:** `Dockerfile` uses `FROM node:lts` (floating tag). This violates supply-chain pinning best practices — a future LTS release could silently break the build.

**Action:** Read `Dockerfile`. Change the base image line:

```dockerfile
# Before:
FROM node:lts

# After:
FROM node:22-alpine
```

If the Dockerfile has a multi-stage build with multiple `FROM` lines, update only the `node:lts` line(s). Do NOT change the nginx base image line if one exists.

After editing, verify no other lines reference `node:lts` (grep is sufficient).

---

## Fix 4 — Add nginx security headers + non-root user (FN-009/013, MEDIUM)

**Context:** The Dockerfile's nginx stage is missing security headers and runs as root. This is a defense-in-depth gap.

**Action:** Read the full Dockerfile to understand its nginx stage. Add:

**A — Security headers via inline nginx config:**

Add a `COPY` or `RUN` that places a custom nginx snippet:

```dockerfile
# In the nginx stage, after the default config:
RUN printf 'add_header X-Frame-Options "SAMEORIGIN" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;\nadd_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;\n' > /etc/nginx/conf.d/security-headers.conf
```

**B — Non-root nginx user:**

At the end of the nginx stage, before `CMD`:

```dockerfile
RUN addgroup -S app && adduser -S app -G app
# nginx worker processes run as the configured user; we only drop privilege for the master process
USER app
```

Note: Check if the default nginx image already drops to a non-root user (some official images do). Read the Dockerfile carefully first — if `nginx:alpine` is the base and it already defines a non-root user, add only the headers portion.

---

## Fix 5 — CRITICAL: Add tests for 3 YMYL use-cases (FN-001/002/003)

**Context:** 3 use-cases that perform financial calculations for Chilean users have zero test coverage. These are YMYL-critical (direct financial impact on users). Per AGENTS.md Rule 5.2, touching `src/application/**` without test updates in the same PR is a violation.

Before writing tests, read each use-case file to understand its API (input/output types, exported function names). Use `src/application/` to find the files.

### Test file A: `tests/application/CalculateMonthlyPayrollBase.test.ts`

This use-case calculates net salary / sueldo líquido. Read the source file first. Write tests that:
- Cover at least 3 known input/output pairs using real Chilean payroll examples (verify thresholds against current values in the use-case or `src/domain/` constants)
- Test the minimum wage boundary (sueldo mínimo Chile 2026)
- Test APV deduction if the use-case supports it
- Use `describe` / `it` blocks, `expect(...).toBe(...)` or `.toBeCloseTo(...)` for financial values
- Do NOT mock domain constants — use the real ones

```typescript
import { describe, it, expect } from 'vitest';
// import the actual use-case — find the correct path by reading src/application/
```

### Test file B: `tests/application/SimulateOperacionRenta.test.ts`

This use-case simulates Chilean income tax (Operación Renta F-22). Read the source file first. Write tests that:
- Cover at least 3 bracket scenarios (below exempt threshold, mid-bracket, top bracket) using SII 2026 UTM values
- Test exact tax due for known incomes (use SII 2026 bracket table — read from `src/domain/` constants, do not hardcode outdated values)
- Test the exempt threshold (income ≤ threshold → tax = 0)

### Test file C: `tests/application/CalculateConsumerCredit.test.ts`

This use-case calculates consumer credit CAE/TMC. Read the source file first. Write tests that:
- Cover at least 3 scenarios: low-risk credit, high-interest revolving credit, debt renegotiation
- Verify output matches CMF published examples if any exist in the source code comments
- Test boundary: CAE must never exceed the TMC (Tasa Máxima Convencional) limit

For all 3 test files: after writing them, run `pnpm run test` and verify each new test passes. All 166 existing tests must continue to pass.

---

## Fix 6 — Add tests for 2 medium-priority use-cases (FN-007, MEDIUM)

After Fix 5 is passing, add tests for 2 additional use-cases:

### Test file D: `tests/application/SimulateCreditCardCost.test.ts`

Read the source use-case. Write tests for:
- Minimum payment scenario (CAE compounding)
- Full monthly payment scenario (cost = 0 interest)
- Partial payment scenario

### Test file E: `tests/application/CalculateRentAdjustment.test.ts`

Read the source use-case. Write tests for:
- Current year IPC-based adjustment
- UF-indexed adjustment
- Zero-inflation edge case

---

## Fix 7 — Manual approval gate for production deploy (FN-008, MEDIUM)

**Context:** `deploy.yml` deploys to GitHub Pages on every push to `main` without a manual approval step. For a YMYL financial site, a gating step prevents accidental deploys of bad builds.

**Per AGENTS.md Rule 4.3:** This is an architectural decision. Create an ADR before implementing.

**Action A — Create ADR:**

Create `docs/adr/ADR-20260408-deploy-approval-gate.md` with:

```markdown
# ADR: Add manual approval gate to deploy.yml
- **Date:** 2026-04-08
- **Status:** Accepted
- **Context:** Monedario.cl is a YMYL financial site. Automated deploy on push to main risks publishing broken builds to end users without human review.
- **Decision:** Add a `production` GitHub Environment with required reviewers to the `deploy` job in `.github/workflows/deploy.yml`.
- **Consequences:** Deploy requires at least one reviewer approval via GitHub's environment protection rules. Requires setting up the `production` environment in GitHub repo settings (Settings > Environments > production > Required reviewers).
- **Alternatives considered:** External deployment approval services — rejected as overkill for a static site.
```

**Action B — Update deploy.yml:**

In the `deploy` job, add:

```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://monedario.cl
    timeout-minutes: 10
    ...
```

Note: The GitHub Environment `production` must be created in the repository settings and reviewers must be added there. Document this in the ADR.

---

## Verification

Run all gates in this exact order and post their output:

```bash
pnpm run format:check     # Must PASS (was 7/8 — must now be 8/8)
pnpm run test             # Must pass ≥172 tests (166 existing + 6 new min)
pnpm run lint
pnpm run check:boundaries
pnpm astro check
```

Additionally, verify no new high/critical CVEs were introduced:

```bash
# Run Codacy CLI trivy scan if available, or:
docker build -t monedario-test . --no-cache
# Confirm build succeeds with node:22-alpine base
```

All gates must pass with 0 blocking errors before declaring done.

---

## Test Baseline Note (AGENTS.md Rule 5.5)

Before starting any edits, run `pnpm run test` to confirm the 166-test baseline. If any tests fail on the unmodified branch, log them in `docs/TECH_DEBT_BACKLOG.md` as pre-existing failures (do NOT fix them in this PR unless they fall within declared scope).

---

## Change Control Record (AGENTS.md Rule 3.1)

1. **Scope:** In scope: `src/layouts/PostDetails.astro` (L442 only), `.github/workflows/deploy.yml`, `Dockerfile`, `tests/application/` (5 new files), `docs/adr/` (1 new ADR). Out of scope: `src/data/blog/`, `src/domain/`, routes, layouts (except PostDetails line fix), sitemap, RSS.
2. **Impacted modules:**
   - `src/layouts/PostDetails.astro` — formatting fix (1 line)
   - `.github/workflows/deploy.yml` — timeout + environment gate
   - `Dockerfile` — base image pin + security headers + user
   - `tests/application/` — 5 new test files
   - `docs/adr/ADR-20260408-deploy-approval-gate.md` — new ADR
3. **Invariant preservation:** `TEST.DOMAIN_COVERAGE` (adding tests for untested use-cases), `CI.GATE_SET` (format:check must pass), `ARCH.LAYER_BOUNDARIES` (tests import from `src/application/` only, not `src/domain/` directly). Verified by gates.
4. **Contract preservation:** No Zod schema changes. No slug changes. No public URL changes. Breaking changes: NO.
5. **Boundary integrity:** Run `pnpm run check:boundaries` — test imports must stay within allowed cross-layer patterns.
6. **Test coverage impact:** 5 new test files for `src/application/**` — satisfies AGENTS.md Rule 5.2. Coverage increases from ~40% to ~73% of use-cases.
7. **Rollback:** Revert via `git checkout -- <file>`. Deploy environment gate requires manual rollback in GitHub repo settings if removed. Docker image re-pinning is forward-only (no regression — `node:22` was already the LTS).
8. **Regression risk:** MEDIUM for `deploy.yml` (first deploy after merge requires reviewer approval — ensure reviewer is set up in GitHub Environments before merging). LOW for all other changes.

## Competitive Adaptation Appendix

- **benchmarkSet:** `N/A` unless a visible feature intentionally reuses an external pattern
- **patternHypothesis:** `N/A`
- **localDelta:** adapt only if the repo ships a clearer or safer local implementation
- **nonCopyBoundaries:** no copied copywriting, URL structure, or owner-colliding IA
- **ownerTarget:** declare the product surface or feature affected
- **successSignal:** functionality fix lands without visible duplication or ownership drift
- **ownership conflict check:** PASS required before merge
