# Plan 111: Spike — decide the next-step vehicle (A-first vs B) before the window closes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 159ee045..HEAD -- docs/backlog/JOURNEY-THESIS-VEHICLE-2026-09-04.md plans/RECONCILIATION-2026-09-12.md docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md output/operations/data-signals/analytics/`
> On mismatch with "Current state", STOP. (Reconciled base: the `0e506a8b`
> check showed exactly one delta — new `2026-W37.json` export (57 KB,
> force-added). That is WANTED evidence, not invalidating drift: W37 is
> the first complete post-083 week. Dossier, registry and reconciliation
> texts are byte-identical to planning.)

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (read-only spike; no code dependency. Informational input: post-083 W36+ exports)
- **Category**: direction
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Reconciled at**: commit `159ee045`, 2026-09-15 — dossier refs
  (`:299-310` Opción A, `:346` Opción B, Q-lines `:483+`), reconciliation
  `:73-79`, registry `n_min` table all re-read live and confirmed; weekly
  exports W26–W37 all tracked and present (worktree-safe). Week map:
  W36 = partial cutover week (083 merged 2026-09-04, EXCLUDE from
  comparable sets); W37 (2026-09-07→13) = first complete post-083 week.
  Date the record for the real execution day (`JOURNEY-THESIS-DECISION-
  2026-09-*.md` glob covers it).
- **BLOCKED 2026-09-15** — dispatched once (`advisor/111-vehicle-decision-
  spike` worktree, since removed); executor STOPPED correctly on the
  plan's explicit STOP condition, verified independently by the reviewer:
  `2026-W37.json` holds only 5 dates (Mon 09-07 → Fri 09-11; Sat/Sun
  missing) while W34/W35/W36 all hold 7 — truncated export, not zero
  weekend traffic. With W36 excluded, ZERO complete post-083 weeks exist.
  RE-RUN CONDITION: dispatch again once a complete 7-day post-083 week
  exists in `output/operations/data-signals/analytics/` (either a
  complete W37 re-export or W38+, verifying 7 dates first). Do NOT
  annualize the 5-day partial. No files were changed by the stopped run.
- **Issue**: —

## Why this matters

The journey-thesis dossier leaves one operator decision open: Option A (move
`<UtmPostResultActions />` next to the result block in `conversor-utm`) vs
Option B (extend `next-best-step.ts` rules to mid-funnel calculators) — with
B conditioned on what A teaches. The utility-led window closes 2026-11-02
(~7 weeks from planning); every unallocated week is unrecoverable measurement
time, and W36 (0/58 UTM next-step clicks, partial post-083 week) decides
nothing alone. This spike recomputes the dossier's Section-4 projections on
complete post-083 weeks and records the operator's A-first-then-conditional-B
(or D-refocus) answer to dossier Q1–Q4. Spike only: a dated decision record,
no code move, no new surface.

## Current state

Facts the executor needs, inlined (verified by reading):

- Dossier: `docs/backlog/JOURNEY-THESIS-VEHICLE-2026-09-04.md:299-344`
  (Option A: move `<UtmPostResultActions />` from `:340` to after `:203`, no
  route/title/content change; ~360–400 persons/week, ~720–800
  `next_step_shown` events/week, crosses `n_min=99` in week one) and `:346+`
  (Option B: extend `src/data/nextBestStep/rules.ts` to `prepago-credito` /
  `operacion-renta` / `credito-consumo`).
- Reconciliation (`plans/RECONCILIATION-2026-09-12.md:73-79`): vehicle choice
  still an open recommendation, not a registered decision; panel/page UTM
  unchanged since the spike.
- Demand context: GSC W35 `conversor-utm` 571/773 clicks (~74%), 121300/150899
  impressions (~80%), CTR 0.47% — high volume, low intent, one-datum queries
  completing at 99% with no next step.
- Registry: `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` thresholds
  (`n_min`, HALT/GREEN) count events, not persons.
- Freeze: `docs/backlog/UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md:7` — no new
  URL/surface; both options fit (position move + rule extension, no
  route/title/meta change). Do NOT reopen 046 (SUPERSEDED — return-hook
  question already instrumented as aggregate interest).

Vocabulary (use exactly): `next_step_shown/click`, `alert_interest_shown`,
`support_shown`, `n_min`, `INPUT_REQUIRED`/`WATCH` (titular — plan 113 owns
its semantics; do not redefine here), "personas expuestas" vs "eventos".

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Docs gate | `pnpm run check:docs` | declared | exit 0 |
| Format check (scoped) | `pnpm exec prettier --check docs/backlog/JOURNEY-THESIS-DECISION-2026-09-*.md` | declared | exit 0 |

## Scope

**In scope** (one new dated record only):

- `docs/backlog/JOURNEY-THESIS-DECISION-2026-09-14.md` (create — decision record)

**Out of scope** (do NOT touch even though adjacent):

- Any code, route, title, meta, copy, rule, component, or instrument change.
- Reopening 046, re-deriving 055 verdicts, extending the 2026-11-02 window,
  redefining titular semantics (plan 113), APV instrumentation (plan 112).

## Git workflow

- Branch: `advisor/111-vehicle-decision-spike`
- One commit, e.g. `docs(direction): vehicle A-vs-B decision record with W36+ projections`
- Do NOT push/PR unless instructed. No deploy authorization flows from this plan.

## Steps

### Step 0: Baseline

Confirm the cited dossier sections/line numbers and the reconciliation
follow-up text match live files; confirm which weekly exports exist beyond
W36 (`output/operations/data-signals/analytics/2026-W3*.json` — read-only
inventory, no recomputation of raw events). `declared` failure → STOP.

**Verify**: excerpts match; week inventory recorded (which weeks are complete
post-083 weeks vs partial).

### Step 1: Recompute projections on comparable post-083 weeks

Using only complete comparable weeks (exclude the partial cutover week),
recompute Section-4 `n_min` timelines for A (UTM persons→events conversion:
1 person ≈ 2 `next_step_shown` events, 1 `alert_interest_shown`, 1
`support_shown`) and B (mid-funnel complete/start denominators from the same
weeks). State weeks-to-`n_min` per signal and what a near-0% CTR over two
comparable weeks would license (demand verdict) vs what it would not (no
APV-style attribution without error signal — cite plan 112).

**Verify**: every number traces to a named export file + event (table with
`week → persons → events → n_min` columns; no uncited projection).

### Step 2: Record the operator-facing decision

Write the decision record: recommended sequence (default hypothesis from the
dossier: A-first-then-conditional-B, or D-refocus if Gate-D/sustainability
dominates — justify from the recomputed numbers, not from taste), the four
dossier Q1–Q4 answers, what ships *after* this spike as separate gated work
(the code move is NOT this plan), and what would change the answer
(pre-registered reversal triggers per signal). Keep MANTENER verdicts (055)
intact; keep 046 superseded.

**Verify**: `check:docs` + scoped prettier → exit 0.

## Test plan

- No vitest changes (design spike). Verification is documentary: every
  projection cites its export file; Q1–Q4 each have an explicit answer or an
  explicit "operator must choose X" flag; reversal triggers listed per signal.

## Done criteria

- [ ] Decision record exists at the dated path with recomputed W36+ projections
- [ ] Q1–Q4 answered or explicitly flagged for the operator; reversal triggers listed
- [ ] No code/route/title/copy change in the diff; `check:docs` + prettier green
- [ ] `plans/README.md` updated

## STOP conditions

- Drift (dossier Q-numbers moved — realign section refs, don't guess); no
  complete post-083 week exists yet (STOP — record "insufficient comparable
  weeks, re-run after N complete weeks" instead of projecting from partials);
  operator input required beyond the record (STOP at the flagged questions —
  do not choose the vehicle yourself); freeze-exception needed (STOP — neither
  option needs one; if the data suggests a new surface, park it as a
  freeze-exception *request*, not a decision).

## Maintenance notes

- The code move (A) or rule extension (B) ships as separate implementation
  plans referencing this record's `n_min` timelines — link, don't merge.
- If instrumentation changes mid-window (any plan-112 emission), split
  pre/post periods before comparing — never pool across the change.
- **Deferred:** titular `INPUT_REQUIRED`/`WATCH` semantics (plan 113);
  APV error signal (plan 112).
