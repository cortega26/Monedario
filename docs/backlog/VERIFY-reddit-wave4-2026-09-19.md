# VERIFY — reddit-monitor Wave 4 (RM-020–RM-022)

- Date: 2026-09-20. Reviewer: fresh, zero prior context, disk-only.
- Scope: `docs/backlog/PLAN-reddit-monitor-2026-09-19.md` + ROADMAP
  Wave 4 = RM-020 content_gaps writer, RM-021 calibrate.py,
  RM-022 pins + MemoryMax; all default-off / non-behavioral.
- Method: adversarial. Full read of `weekly_report.py` (412 lines),
  `calibrate.py` (216 lines), `requirements-ml.txt`, both `.service`
  / verify hunks, `schema.sql` content_gaps block, and the new tests;
  `git diff` for tracked files (plus direct reads — note below);
  ran both suites myself plus a live empty-DB calibrate probe
  (numbers below).
- Workdir note: `git status` shows `reddit-monitor/` files as
  Modified (tracked), not untracked, so `git diff` WAS usable for
  them; `calibrate.py` is the only Wave-4 NEW (untracked) file and
  was reviewed by direct read. `output/` deletions, `package.json`,
  `NextSteps.astro`, `spike_gaps.py` / `catalog.json` /
  `export-reddit-catalog` are separate workstreams — noted in §6,
  not reviewed.

## 1. RM-020 content_gaps writer — ACCEPT

- Gate default-off PROVEN (`weekly_report.py:151-153`):
  `os.environ.get("CONTENT_GAPS_ENABLED", "") == "1"`.
  Unset and any value other than `"1"` (incl. `"0"`) → False.
  Call site (`:381`) skips the writer entirely when False, and the
  checked-in test asserts unset→False, `"1"`→True, `"0"`→False.
- Idempotent per (keyword, week) (`:160-199`): week maps to a
  `[gap-week:AAAA-WNN]` tag appended to `notes`; a re-run whose tag
  is already present (`tag in (row["notes"] or "")`) is a no-op
  (`skipped`). New week → `times_seen += hits`, tag appended
  (`updated`). Bracketed tag avoids prefix collision between weeks
  (e.g. W3 vs W38 cannot false-match). Empty/blank keywords and
  non-positive hits are skipped.
- Human dispositions NEVER overwritten: the UPDATE (`:191-195`)
  sets only `times_seen`, `last_seen_at`, `notes`. `status`,
  `content_url`, `first_seen_at` appear in no UPDATE; INSERT is the
  only writer of `status` and always `'detectado'`. The test proves
  `publicado` + `content_url` survive a later week accumulation
  (`times_seen` 5→14, status/url intact). `en_backlog` /
  `descartado` are equally untouched by construction.
- Writer failure cannot fail the report (`:371-392`): the Markdown
  is written BEFORE the gated block; the block is wrapped in
  try/except → fallback line `content_gaps: OMITIDO por error`.
  Outer except only covers pre-report failures. Report path,
  `runs.log`, and `COMMIT:` list are unaffected by writer errors.
- No schema change: `schema.sql` unmodified in workdir;
  `content_gaps` already provides every touched column (`keyword`
  UNIQUE, `first_seen_at`, `times_seen`, `last_seen_at`, `status`
  CHECK incl. `detectado/en_backlog/publicado/descartado`,
  `content_url`, `notes`). INSERT/SELECT/UPDATE column sets are all
  subsets of that table. No migration file touched; version stays
  v3. Shared `keyword_ranking()` (`:126-129`) feeds both the
  Markdown table and the writer, so both see identical numbers.

## 2. RM-021 calibrate.py — ACCEPT

- Report-only PROVEN by full read: DB access is exclusively via
  `dataset.open_readonly` (`mode=ro` URI, no `schema.sql`, no
  version check). The ONLY file write is appending one jsonl line
  to `calibration_history.jsonl` (`:209-210`). `config.json` is
  opened read-only inside `prototype_inventory()` (counts +
  `semantic.MODEL_VERSION`); no write path to config, prototypes,
  or embeddings exists in the file. Cutoffs are derived live from
  `monitor.confidence_label` (`current_cutoffs`), never hardcoded.
- Empty `human_reviews` → prints `insufficient labels`, exit 0,
  nothing fabricated: verified BOTH by read (`:201-205`) and by a
  live run I did myself on a fresh empty DB (no spacy/torch
  installed — imports did not block: top imports are only
  `dataset`, `eval_filter`, `monitor`, all stdlib-only;
  `semantic` is lazily imported inside `prototype_inventory`).
  Probe: exit 0, stdout contained `insufficient labels`, and NO
  `calibration_history.jsonl` was created. A second probe with a
  `config.json` present showed byte-identical md5 before/after —
  config untouched. Human action stays manual: candidate cutoffs
  print with `[no concluyente]` below `MIN_N` and an ADR reminder.
- No cron/timer/migration changes: no `*.timer` added or modified,
  no `migrate_*.py` touched, `schema.sql` untouched, no scheduler
  reference inside `calibrate.py`. Docstring states manual-monthly.

## 3. RM-022 pins + MemoryMax — ACCEPT

- Pins present (`requirements-ml.txt:29-32`): `torch==2.8.0`,
  `sentence-transformers==5.1.0`, `spacy==3.8.7`, `nltk==3.9.1`,
  all `==`-pinned, `--extra-index-url` (not `--index-url`) for the
  CPU-only PyTorch index preserved. Header documents the disposable
  venv check and the metadata-level wheel verification.
- spacy-model step documented (`requirements-ml.txt:18-23`):
  mandatory `python -m spacy download es_core_news_sm` + load check,
  with the regex-fallback consequence stated; `verify_fase06.sh`
  §1 checks exactly those two imports on the VM.
- Numerical consistency BOTH ways: service `MemoryMax=1536M` =
  1536·1024·1024 = 1610612736 bytes = the literal
  `verify_fase06.sh` §6 expects (computed myself via python3).
  `MemoryHigh=1152M` keeps the 75% ratio (1152/1536). Comment in
  each file cross-references the other; changing one without the
  other is now a visible inconsistency.
- No systemd state touched: the `.service` hunk changes only the
  two limit values + comment; no enable/start/daemon-reload
  commands added anywhere; the verify hunk only READS via
  `systemctl show`.

## 4. Tests I ran — all green

- `python3 -m pytest reddit-monitor/test_monitor.py -q`: **46
  passed** (incl. the 2 new RM-020 tests: flag default-off,
  writer idempotency + human-triage preservation).
- `python3 -m pytest reddit-monitor/test_eval.py -q`: **10 passed**
  (incl. the 3 new RM-021 tests: insufficient-labels exit 0,
  sweep-candidate + history append, sweep math).
- Env note: `import spacy` and `import torch` BOTH fail in this
  environment — the suites pass anyway, confirming the new code
  paths (and `monitor.py`'s guarded semantic import) have no hard
  ML dependency. No spacy-missing failures exist to excuse.
- Live probes (throwaway dirs under `/tmp`, not checked in):
  calibrate-on-empty-DB → `insufficient labels`, exit 0, no
  history file; calibrate-with-config → config md5 unchanged.

## 5. Per-file disposition

| File | Disposition |
|---|---|
| `reddit-monitor/weekly_report.py` (+98, RM-020) | ACCEPT — gated, idempotent, fail-safe; no schema change |
| `reddit-monitor/calibrate.py` (NEW, RM-021) | ACCEPT — report-only, exit-0 on empty labels, manual cadence |
| `reddit-monitor/requirements-ml.txt` (RM-022) | ACCEPT — 4× `==` pins + spacy-model step documented |
| `reddit-monitor/reddit-monitor.service` (RM-022) | ACCEPT — 1536M/1152M, comment-linked to verify §6 |
| `reddit-monitor/verify_fase06.sh` (+2, RM-022) | ACCEPT — comment-only + pre-existing byte check intact |
| `reddit-monitor/test_monitor.py` (+52, RM-020) | ACCEPT — default-off + idempotency + triage tests |
| `reddit-monitor/test_eval.py` (+43, RM-021) | ACCEPT — empty-labels + sweep + no-fabrication tests |

## 6. Scope residuals (observed, NOT Wave-4, NOT verdict-blocking)

- `src/components/NextSteps.astro` (one Tailwind class,
  `min-h-[24px]`→`min-h-6`) and `package.json`
  (`export:reddit-catalog` / `check:reddit-catalog` scripts +
  lint-staged hook) belong to separate workstreams (funnel,
  reddit-catalog export: `scripts/export-reddit-catalog.mjs`,
  `tests/scripts/export-reddit-catalog.test.ts`,
  `reddit-monitor/catalog.json`, `reddit-monitor/spike_gaps.py`
  pilot). Wave-4 itself adds NO `src/` / `workers/` / content /
  route edits: `monitor.py`, `db.py`, `dataset.py`,
  `eval_filter.py`, `schema.sql`, all `*.timer`, all migrations
  untouched; no alert-semantics, tracking, or surface change.
- `output/` mass deletions are pre-existing workdir noise,
  out of scope, not reviewed.

## Verdict: WAVE 4 ACCEPT (RM-020, RM-021, RM-022 all green)

- Gates run on this report: `pnpm exec prettier --check`
  on this file — PASS; `git diff --check` — PASS (this file is
  untracked, so the check covers the workdir; no whitespace
  errors introduced by this review — I edited nothing else).
- STOP triggers checked, none tripped: no alert-semantics change
  without ADR (thresholds only SUGGESTED in stdout, never
  applied); no new tracking/user-level persistence (gaps keyed by
  keyword+week, no authors); no auto-posting surface; no public
  URL/slug/route change; no secret reproduced in this report;
  nothing committed; no reviewed file modified.
