# ADR-20260412-external-link-ci-gate.md

**Date:** 2026-04-12  
**Status:** Accepted (phase 2 – blocking PR gate)
**Supersedes:** —  
**Trigger condition:** CI gate semantics change (new whole-site external-link job, new blocking category for `official_source` / `trusted_reference` links).

---

## Context

The site references Chilean government institutions, AFP providers, and international bodies via anchor links in article content, methodology blocks, and official-source lists. Until now, no automated gate verified that those external links actually resolve, point to the intended institution, or lack soft-404 redirection. Broken or misdirected external links degrade editorial credibility directly on YMYL content.

The existing `check:urls:ci` job (linkinator + local Python server) covers only internal links. External links were status-checked passively during nightly runs via linkinator but without:
- Destination content analysis (soft-404 detection).
- Host-family redirect validation.
- Per-host blocking classification.
- Machine-readable artifact output per failure class.

This ADR records the decision to add a dedicated external link validation layer with staged rollout.

---

## Decision

### Engine

A new engine (`scripts/check-urls-external.mjs` + `scripts/urlcheck/{host-registry,extract-external,probe-external,classify-external,external-artifacts}.mjs`) replaces the linkinator-based external check with direct HTML parsing and destination-aware HTTP probing.

Key design choices:

1. **Self-origin normalisation** — `monedario.cl` / `www.monedario.cl` absolute URLs are excluded from external checks; they are treated as internal-equivalent.

2. **Host classification** (registry-owned, not `.linkinatorrc`-based):
   - `official_source` — Chilean government/regulatory institutions; blocking.
   - `trusted_reference` — IMF, World Bank, Wikipedia, etc.; blocking.
   - `brand_profile` — Monedario social profiles; non-blocking telemetry.
   - `share_endpoint` — WhatsApp/messaging share URLs; non-blocking telemetry.
   - `known_soft_nonblocking` — Sites known to aggressively block bots (Google); non-blocking.
   - `unknown` — Unclassified; non-blocking.

3. **Failure classes** with stable `classification` field in artifacts:
   - `hard_fail` — HTTP 404/410/5xx on the final URL.
   - `soft_404` — 200/3xx but title/H1/body matches bilingual soft-404 phrase set or host-specific markers.
   - `host_mismatch` — Structured link on official/trusted host that redirects outside the allowed host family (high confidence, blocking).
   - `redirect_mismatch` — Redirect lands on a different domain (lower confidence, non-blocking in phase 1).
   - `non_blocking_host_issue` — Any failure on brand_profile / share_endpoint / known_soft_nonblocking.
   - `network_error` — DNS/timeout/TLS errors; non-blocking for stability.

4. **`blocking` field** — computed per-result; determines exit code in `--ci` mode. A result is blocking iff its `host_category` is `official_source` or `trusted_reference` AND its `classification` is `hard_fail`, `soft_404`, or `host_mismatch`.

5. **SSRF guard** — URL scheme must be `http:` or `https:`. After redirect following, the final URL is checked; private/loopback hostnames (10.x, 192.168.x, 127.x, ::1, localhost) cause the probe to return `ssrf_guard_private_redirect` (non-blocking).

6. **Canary mode** — `node scripts/check-urls-external.mjs --canary` starts an in-process HTTP server, probes known-good / known-bad fixture paths, and asserts expected failure patterns are detected (hard_fail for 404, soft_404 for "Página no encontrada" page). Canary is wired into `check:urls:canary`.

### Commands

| Command | Purpose | Exit behaviour |
|---------|---------|----------------|
| `check:urls:external:ci` | Whole-site blocking PR validation | Exit 1 if any `blocking=true` result |
| `check:urls:external:audit` | Nightly/manual full audit | Always exit 0 |
| `check:urls:canary` | Smoke-test internal + external engines | Exit 1 if expected failures not detected |

### CI jobs

| Job | Trigger | Gate | Phase |
|-----|---------|------|-------|
| `build` (existing) | PR, dispatch | Internal links hard-blocking | In production |
| `external-url-audit` (updated) | schedule, dispatch | Non-blocking; uses new engine | Phase 1 |
| `external-url-check-pr` | PR | Blocks on results classified with `blocking=true` | Phase 2 |

**Phase 2 activation (2026-06-19):** `continue-on-error: true` was removed after the engine had run against the full corpus and the remaining official-source hard failure was remediated. Network/DNS/timeout failures remain non-blocking by classifier policy.

### Artifact contract

All external check artifacts are written to `output/validation/urlcheck/`. Stable fields per record:

| Field | Type | Description |
|-------|------|-------------|
| `source_url` | string | Original href from rendered HTML |
| `final_url` | string | URL after all redirects |
| `referrer_url` | string\|null | First page that contains the link |
| `link_type` | `structured`\|`inline` | Whether the link has `target=_blank`/`noopener` |
| `host_category` | string | Registry classification |
| `classification` | string | Failure class (see above) |
| `blocking` | boolean | Whether this result should fail CI |
| `matched_signal` | string\|null | Phrase or pattern that triggered the failure |
| `expected_host_family` | string[]\|null | Allowed final hostnames for redirect validation |
| `status` | number\|null | Final HTTP status |
| `error` | string\|null | Network error code |

---

## Alternatives Considered

1. **Extend linkinator with custom callbacks** — Linkinator does not expose redirect chain or response body, making soft-404 and host-family checks impossible without a full fork.

2. **Use an external SaaS link checker** — Adds external dependencies and increases supply-chain risk; no benefit over a thin in-house prober given our host profile.

3. **Hard-block from day 1** — Too risky: the current corpus may have existing external failures (known anti-bot 403s, historic redirects) that would permanently break PR CI until remediated.

---

## Consequences

**Positive:**
- Editorial YMYL links to official sources are verified to resolve and point to the correct institution after every PR, once phase 2 is enabled.
- Soft-404 content analysis prevents credibility-damaging "ghost links" that return HTTP 200 but show error pages.
- Artifacts give a machine-readable audit trail for external link health over time (nightly trend).
- No changes to `pnpm run build` build time; external checks are CI-only.

**Negative / trade-offs:**

- Live external checks can block a PR when an official/trusted destination returns a deterministic hard failure.
- External HTTP requests introduce nondeterminism in nightly runs (transient DNS, anti-bot 429).
- Nightly job timeout set to 15 minutes; sites with very large link counts may need concurrency tuning.

---

## Implementation

Files added / modified:

- `scripts/urlcheck/host-registry.mjs` — Host classification data and pure detection functions.
- `scripts/urlcheck/extract-external.mjs` — External anchor extractor from built HTML.
- `scripts/urlcheck/probe-external.mjs` — HTTP prober with redirect tracking and SSRF guard.
- `scripts/urlcheck/classify-external.mjs` — Result classification logic.
- `scripts/urlcheck/external-artifacts.mjs` — Artifact writer for external failure classes.
- `scripts/check-urls-external.mjs` — Main entrypoint (--ci / --audit / --canary).
- `tests/scripts/urlcheck-host-registry.test.ts` — Unit tests for classification and detection.
- `tests/scripts/urlcheck-extract-external.test.ts` — Unit tests for HTML extractor.
- `tests/scripts/urlcheck-classify-external.test.ts` — Unit tests for classifier.
- `package.json` — New commands `check:urls:external:ci`, `check:urls:external:audit`; updated `check:urls:canary`.
- `.github/workflows/ci.yml` — Updated `external-url-audit` job; new `external-url-check-pr` job.
- `context/INVARIANTS.md` — Added `INVARIANT.URLCHECK.EXTERNAL_LINK_POLICY`.
- `context/CONTRACTS.md` — Added `CONTRACT.EXTERNAL_URLCHECK`.

Phase 2 amendment (2026-06-19):

- `.github/workflows/ci.yml` — Promoted `external-url-check-pr` to a blocking PR gate.
- `docs/development/CALCULATOR_CREATION_CHECKLIST.md` — Requires built-output external-source validation before calculator publication.

---

## Related

- AGENTS.md Rule 4.3 (ADR trigger for CI gate semantics change).
- `docs/ADR-20260304-urlcheck-operational-hardening.md` (internal link gate).
- `context/CONTRACTS.md CONTRACT.INTERNAL_URLCHECK`.


## October 2026: Redirect observability addendum (Ahrefs project 9684282)

Ahrefs' 2026-10-15 crawl reported **36 pages with links to redirects**, **32 external 3XX targets**, **one external 5XX** and **four external timeouts**, with 422 internal URLs analyzed and Health Score 99. Its Site Audit API returned `Insufficient plan` for detailed URL lists. The email's **six errors** are an overall error count, not automatically six redirecting URLs.

**Existing gap:** `probeUrl()` follows external redirects and reports the final HTTP code. When a redirect ultimately returns 200, `classifyExternalResult()` marks it `ok`; the prior artifacts exported only non-`ok` rows, so successful redirects were invisible, even if Ahrefs flagged them.

**Remedy:** the non-blocking `external-redirects.json` artifact now inventories every successful external URL whose fetched final URL differs from the original href, including its complete referrer-page list, final destination, host category and a review label. Shares through `wa.me`, `facebook.com/sharer`, `x.com/intent/`, `t.me/share/`, and `linkedin.com/sharing/` are labeled `intentional_share`; these must not trigger auto-rewrites or make CI fail. Other redirects are labeled `review_destination`. Cross-host or misdirected official references retain the existing blocking semantics. We do **not** claim that all historical Ahrefs items are resolved until a new real crawl confirms them.

Run against a current, already-built `dist/`:

```bash
pnpm run check:urls:external:audit
node -e "const fs=require('node:fs'); const p='output/validation/urlcheck/external-redirects.json';const rows=JSON.parse(fs.readFileSync(p));console.table(rows.filter(x=>x.review==='review_destination').map(({source_url,final_url,affected_pages})=>({source_url,final_url,affected_pages})));"
```

Inspect `output/validation/urlcheck/external-hard-fail.json` for actual official-source HTTP 5XX, `external-non-blocking.json` for timeouts/bot defenses, and `external-redirects.json` for 3XXs ending in success. A timeout is not by itself a broken page. Adjust outbound citations only after validating the final destination's correctness and authorship; never change canonical Monedario routes or server redirects to silence a crawler.

The GitHub Actions `urlcheck-artifacts-external-audit` upload includes the new artifact; if Actions minutes are exhausted, execute the same `pnpm` command on an authorized local machine or self-hosted runner and inspect the JSON locally.
