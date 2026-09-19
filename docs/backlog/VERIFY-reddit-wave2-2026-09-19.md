# VERIFY — reddit-monitor Wave 2 (RM-006–RM-012)

- Date: 2026-09-19. Reviewer: fresh, zero prior context, disk-only.
- Scope: `docs/backlog/PLAN-reddit-monitor-2026-09-19.md` + ROADMAP
  Wave 2 = RM-006–RM-012.
- Method: adversarial. Full read of `monitor.py` (1038 lines),
  `schema.sql`, `discord.ts`, `index.ts`, all closeout scripts/docs;
  `git diff` for tracked files; inline runtime probes for untested
  Python paths; ran both suites myself (numbers below).
- Workdir note: `reddit-monitor/` is untracked, so there is no
  `git diff` for it — reviewed by direct read. `output/` shows 100+
  deleted files in `git status`; that noise is out of scope and was
  not reviewed (flagged once in residuals, not per file).

## 1. Retry/backoff — ACCEPT (code), TEST-GAP (gate)

- Python `api_get` (`monitor.py:331–366`): `_is_retryable_status`
  retries only 429/5xx; 401/403/404 re-raise immediately (fail-fast,
  no sleep). `Retry-After` honored with `min(max(float, 0), 60s)` cap;
  unparsable/absent header falls back to `1.5*(attempt+1)` capped at
  60s. Timeout stays 20s (`API_TIMEOUT_S`, asserted in probe).
  Per-sub isolation preserved (`run()`: try/except per sub + continue).
- Worker `postAlert` (`discord.ts:108–145`): 429 with parseable
  `Retry-After` retried exactly once, then the batch is given up to
  the next cron; 429 without/unparseable header fails the batch with
  no sleep. `parseRetryAfterMs` caps at 30s; null on absent/negative/
  NaN. `AbortSignal.timeout(timeoutMs)` still threaded (preserved).
- Probes I ran myself (throwaway, not checked in): 401 one call no
  sleep; 403 one call no sleep; 429-then-200 two calls one sleep;
  delay-cap matrix (`3600→60.0`, `junk→backoff`, `attempt 99→60.0`).
  All passed.
- Gap: `test_monitor.py` (24 tests, all pass) contains ZERO
  references to retry/refresh/degraded/dead-letter/rotation
  (confirmed by search). So no checked-in test covers any of the
  above on the Python side. Worker side IS covered (new vitest
  tests, 37 pass). Wave-2 gate says "chaos tests" — the Python half
  of that gate is unmet. See R-01.

## 2. Token refresh — ACCEPT

- `run()` (`monitor.py:882–911`): `token_refreshed` flag, one refresh
  per run, only on 401, then the SAME sub is retried via a second
  `collect_items` call; later subs use the new token. Second 401 (flag
  set) records the error and continues — no loop possible. Refresh
  failure itself is caught and recorded per sub (isolation intact).
  Non-401 (403/5xx/4xx) never triggers refresh. Exactly-once
  confirmed by structure + the `exc.code != 401 or token_refreshed`
  guard. No checked-in test (see R-01); verified by read + guard
  assertion in probe.

## 3. Degraded path — ACCEPT

- Python (`monitor.py:803–991` + `main`): `write_to_db` failure →
  `write_degraded_run` inserts `scan_runs` status `degraded` (falls
  back to `error` + prefix on pre-RM-008 DBs whose CHECK rejects the
  value) → `DB_DEGRADED_MARKER` appended to the day digest →
  `COMMIT:` includes the digest → `runs.log` records `degraded`.
  E2E probe with mocked `write_to_db` raising: digest contains the
  RM-008 marker, `scan_runs` row is `degraded` with `db_degraded:`
  detail. No silent Markdown-ahead-of-DB. (Side note: `db.py`
  `connect` auto-applies `schema.sql`, so dropping a table
  self-heals — my first probe attempt did not raise for that reason;
  the mock-based probe is the valid one.)
- Worker markSeen (`index.ts:167–178`): per-ID try/catch inside the
  fan-out, so one KV failure can never reject the post-delivery batch;
  failed marks stay unseen and re-alert next run (at-least-once).
  Covered by new `manualTrigger.test.ts` RM-011b test (passes).
- Minor blemishes (residuals, not rejections): R-04.

## 4. Scope — REJECT (one out-of-scope tracked change)

- Alert semantics: stop-on-first-failure PRESERVED in `postAlert`
  (returns on first permanently-failed batch) and DOCUMENTED in code
  comment (`discord.ts:97–107`) + worker README batch-policy paragraph.
  No semantics change, no ADR needed. Pass.
- No new tracking/indexable surface: worker `fetch` still serves only
  `/__check`; no new KV keys, no analytics additions, no pages/routes/
  content/public/sitemap changes (`git diff --name-only` on those
  paths is empty). Python adds only a local dead-letter jsonl and a
  `scan_runs` status value — no user-level tracking. Frontmatter N/A
  (no content files touched). Pass.
- `scripts/bcn-cite.mjs` untouched (no `scripts/` diff at all). Pass.
- FAIL: `src/components/NextSteps.astro` has a tracked modification
  (`min-h-[24px]` → `min-h-6`) that is NOT in the listed Wave-2 files
  and is unrelated to this review. Visually equivalent, but out of
  scope — revert it or justify it separately. See R-02.

## 5. Banned regressions — PASS with one observation

- No secret values in code/logs: worker logs never include the webhook
  URL, token, or secret (verified by search); Python error strings embed
  only `r/<sub>` + exception text (Bearer token travels in headers, not
  URLs). `record_ntfy_failure`/dead-letter entries carry context + tail
  text, never credentials. No private-key/token literals found.
- Observation (not a secret value): PLAYBOOK/verify hardcode the VM
  host and key path (infra detail, pre-existing pattern, no key
  material). No behavior change beyond spec found in the diffs; the
  `NextSteps.astro` class change is the only out-of-spec behavior-adjacent
  item and it is flagged under scope, not stealth.

## Per-file disposition

| File | Disposition | Reason |
|---|---|---|
| `reddit-monitor/monitor.py` | ACCEPT | Retry split, cap, fail-fast, timeout, isolation, exactly-once refresh, degraded closeout all verified by probe + read |
| `reddit-monitor/schema.sql` | ACCEPT | `scan_runs` CHECK gains `degraded` with fallback documented; no other change |
| `workers/reddit-mention-monitor/src/discord.ts` | ACCEPT | 429-once + 30s cap; stop-on-first-failure preserved + documented; generic `chunkEmbeds` behavior-preserving |
| `workers/reddit-mention-monitor/src/index.ts` | ACCEPT | `parseMonitorConfig` safe defaults + warn; per-ID markSeen tolerance; no route/KV-surface change |
| `workers/reddit-mention-monitor/README.md` | ACCEPT | Batch policy (stop-first, at-least-once) documented in 4 lines |
| `tests/workers/reddit-mention-monitor/*.test.ts` | ACCEPT | New 429/cap/config/markSeen tests; suite green (37) |
| `reddit-monitor/RESTORE.md` | ACCEPT | 10-step restore with integrity_check both sides; consistent with PLAYBOOK |
| `reddit-monitor/PLAYBOOK.md` | ACCEPT | Offsite pull one-liner + 90d rotation correct; archive exclusion claim verified against non-recursive globs |
| `reddit-monitor/archive/.gitkeep` | ACCEPT | Placeholder documents rotation + glob behavior; correct |
| `reddit-monitor/run_monitor.sh` | ACCEPT | ntfy dead-letter (cap 50, never fails run); credentials filter kept |
| `reddit-monitor/run_weekly_report.sh` | ACCEPT | Symmetric dead-letter; credentials filter kept |
| `reddit-monitor/verify_fase0.sh` | ACCEPT | New §6b integrity_check on latest backup, read-only via temp file; correct |
| `reddit-monitor/test_monitor.py` | REJECT (gap) | Unchanged: 24/24 pass but zero Wave-2 coverage (R-01) |
| `src/components/NextSteps.astro` | REJECT (scope) | Out-of-scope tracked change, not a listed file (R-02) |

## Residuals

- R-01 (gate-blocking): no checked-in Python tests for RM-006/007/
  008/009/010. My throwaway probes pass but are not in the repo.
  Wave-2 "chaos tests" gate is half-unmet until RM-023–037 lands
  Python sad-path tests.
- R-02 (gate-blocking): `src/components/NextSteps.astro` out-of-scope
  change must be reverted or moved to its own change record.
- R-03 (owner callout, not blocking): worker retries only 429 while
  Python retries 429+5xx. Preserves pre-existing worker semantics, but
  the RM-006 literal text ("split 429/5xx-vs-401/403, ambos sistemas")
  reads as both-systems — confirm 429-only is the intended worker
  interpretation or file a follow-up.
- R-04 (trivial): `f"degraded: {combined}" or "degraded"` dead fallback;
  digest marker duplicates on repeated degraded runs; `runs.log` says
  `error` (not `degraded`) when sub-errors and DB failure coincide.
- R-05 (environmental): `output/` shows 100+ unstaged deletions —
  unrelated noise in the workdir, noted not reviewed.
- R-06 (pre-existing): `check:docs` FAILS repo-wide on 6 untracked
  `reddit-monitor/*.md` offenders (PLAYBOOK, README, RESTORE, 2
  digests, index). This report adds NO new offender: it lives under
  `docs/backlog/` (allowed dir) and is git-ignored per `.gitignore:84`
  unless force-added (do not force-add; do not touch `.gitignore`).

## Tests I ran myself + gate outputs

- `python3 -m pytest reddit-monitor/test_monitor.py -v`: 24 passed.
  Runnable subset = all pre-existing; none covers Wave-2 (see R-01).
- `pnpm exec vitest run tests/workers/reddit-mention-monitor/`:
  4 files, 37 tests, all passed.
- Inline probes (retry split, caps, 401/403 fail-fast, timeout kwarg,
  429-then-success, refresh-guard structure, degraded E2E with mocked
  `write_to_db`): all passed; scripts were throwaway (`python3 - <<EOF`,
  nothing written).
- `pnpm run check:docs`: FAIL (pre-existing, 6 `reddit-monitor/*.md`
  offenders listed above; my report is git-ignored, adds none).
- `git diff --check` on reviewed tracked paths: clean.
- `pnpm exec prettier --check` on this report: clean.

## Verdict: REJECT (fixable, no STOP triggered)

- No roadmap STOP triggered by the reviewed files (alert semantics
  preserved + documented; no new tracking; listen-only intact; no new
  public surface).
- REJECT grounds: R-01 (Python Wave-2 ships without checked-in tests —
  Wave-2 test gate unmet) and R-02 (out-of-scope `NextSteps.astro`
  change in the workdir). Both are fixable without touching the
  reviewed logic, which itself is ACCEPTED as correct.
- Do not commit. Reviewed files and all other files left unedited;
  this report is the only write.

## Addendum — re-verify of fix delta (2026-09-19, same reviewer, disk-only)

Scope: ONLY the fix delta for R-01/R-03/R-04. No re-audit of Wave 2.

- R-01 (test gap) FIXED: `test_monitor.py` now 33/33 pass (was 24/24) —
  9 new Wave-2 tests, all green: 429-with-cap, 429-backoff, 401/403
  fail-fast (parametrized), 5xx-retry, RM-007 exactly-once + no-loop,
  RM-009 dead-letter cap-50, RM-010 rotation. File now has 20
  retry/refresh/degraded/dead-letter/rotation references (was 0).
  RM-008 covered by 4 new tests in `test_fase06.py`, all pass
  (degraded row + marker + runs.log; marker dedup; degraded-dominates;
  old-schema fallback).
- R-03 (429-only) FIXED: `discord.ts` now retries 429 OR 5xx once when
  `Retry-After` parses (`res.status === 429 || (500–599)`); stop-policy
  preserved and still documented (code comment + README batch paragraph,
  now reading "a 429 or 5xx with `Retry-After`"). New 5xx tests (2) pass;
  vitest suite 39/39 green (was 37); `tsc --noEmit` clean (exit 0).
- R-04 (trivials) FIXED — spot-read `monitor.py`: (1) dead fallback gone,
  line 841 is a live ternary (`... if combined else "degraded"`);
  (2) marker dedup guarded (`if DB_DEGRADED_MARKER not in
  existing_digest`, lines 982–985); (3) degraded dominates on
  sub-errors + DB failure (lines 989–991, `run_status = "degraded"`,
  rc 0). All three behaviors are covered by the new RM-008 tests above.
- `test_fase06.py` overall: 8 passed / 8 failed. The 8 failures are
  pre-existing baseline, NOT caused by the new tests: 5 fail at
  `import spacy` in `lexicon.py` (spacy not installed — confirmed),
  3 fail on `matches has no column named keyword_match_methods`
  (monitor.py writes ML columns `schema.sql` lacks — grep: 15 refs in
  monitor.py, 0 in schema.sql). Failing tests are the old ML-field
  tests by name; new RM-008 tests mock `write_to_db` and pass.
- NextSteps.astro + output/ dirt: untouched by this wave, present but
  out of scope. `NextSteps.astro` still carries the same single
  out-of-scope line (`min-h-[24px]` → `min-h-6`); `output/` deletions
  remain pre-existing workdir noise. Neither grew in this delta.
  R-02 (revert-or-justify NextSteps) stays an open owner item.

Gates I ran: pytest test_monitor.py 33 passed; pytest test_fase06.py
8 passed + 8 pre-existing env/baseline failures (above); vitest
4 files 39 passed; tsc exit 0; 5xx-focused vitest run 2 passed.

Verdict on fix delta: LIFT REJECT. R-01/R-03/R-04 verified resolved.
No STOP triggered. Remaining (not this wave): R-02 NextSteps
revert-or-justify; spacy-env + schema-drift baselines; R-06 check:docs.
Do not commit.
