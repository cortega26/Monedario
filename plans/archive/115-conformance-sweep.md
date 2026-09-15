# Plan 115: Conformance sweep — runbook titular line + backlog gitignore exception

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ab44d813..HEAD -- docs/operations/runbooks/weekly-search-performance-ritual.md .gitignore`
> On mismatch with "Current state", STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW (two one-line conformance edits, prose + ignore rule)
- **Depends on**: none (follows plans 112/113 findings; no code dependency)
- **Category**: dx
- **Planned at**: commit `ab44d813`, 2026-09-15
- **Issue**: —

## Why this matters

Two one-line leftovers contradict landed work. The weekly ritual runbook
still documents the OLD collapsed titular (`WATCH / INPUT_REQUIRED`) that
plan 113 split into three distinct states — any operator following the
runbook re-learns the collapsed semantics. And the APV spike deliverable
(`docs/backlog/APV-ERROR-INSTRUMENTATION-2026-09-14.md`) only stays
tracked via `git add -f` because `docs/backlog/*` is blanket-gitignored
with no `APV-*` exception (unlike `DIAGNOSTICO-*`, `JOURNEY-THESIS-*`,
`CALCULATOR-*`). One line each, zero behavior change.

## Current state

Facts, inlined (verified by reading live files at `ab44d813`):

- Runbook `docs/operations/runbooks/weekly-search-performance-ritual.md:170`:
  "Si falta, el estado utility-led queda `WATCH / INPUT_REQUIRED` y no se
  decide expansión." (Stale: post-113 the titular shows `INPUT_REQUIRED`
  distinctly and the Gate-D line shows `SIN REGISTRO`; `WATCH` is now
  breach-only.)
- `.gitignore:84` blankets `docs/backlog/*`; exceptions exist for
  `DIAGNOSTICO-*` (`:95`), `JOURNEY-THESIS-VEHICLE-*` (`:96`),
  `CALCULATOR-*` (`:94`) and others — but none for `APV-*`.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Docs gate | `pnpm run check:docs` | declared | exit 0 |
| Format check (scoped) | `pnpm exec prettier --check docs/operations/runbooks/weekly-search-performance-ritual.md .gitignore` | declared | exit 0 |

## Scope

**In scope** (exactly two one-line edits):

1. Runbook `:170`: replace "`WATCH / INPUT_REQUIRED`" with
   "`INPUT_REQUIRED` (titular) con `Gate D: SIN REGISTRO`" (minimal edit —
   surrounding sentence untouched).
2. `.gitignore`: add `!docs/backlog/APV-*.md` after the
   `JOURNEY-THESIS-VEHICLE` exception line (groups with the other
   spike/diagnostic exceptions).

**Out of scope**: any other runbook wording; any other ignore rule;
anything beyond these two lines (if either line turns out to mean
something else live, STOP instead of reinterpreting).

## Git workflow

- Branch: `advisor/115-conformance-sweep`
- One commit, e.g. `docs(ops): conform runbook titular line; track APV backlog docs`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Baseline

Re-read both lines live; confirm they match Current state. `check:docs`
green unmodified.

**Verify**: excerpts match; gate green.

### Step 1: The two lines

Apply the two edits exactly as scoped. Then verify: `git check-ignore -v
docs/backlog/APV-ERROR-INSTRUMENTATION-2026-09-14.md` → NOT ignored
(no output, exit 1); `git status --short` shows no unexpected files
(the spike doc stays tracked, nothing new appears); `check:docs` +
scoped prettier green.

**Verify**: all three checks green.

## Test plan

- No vitest changes (prose + ignore rule). Verification is docs-gate +
  prettier + the `check-ignore` proof.

## Done criteria

- [ ] Runbook line conforms to the three-way titular taxonomy
- [ ] `APV-*.md` tracked by rule, not by force-add
- [ ] `check:docs` + prettier green; diff is exactly two lines;
  `plans/README.md` updated (reviewer handles — skip it)

## STOP conditions

- Drift; either line means something different live than cited (STOP —
  do not reinterpret); `check-ignore` still ignores after the edit
  (STOP — rule ordering issue, report); `declared` baseline broken.

## Maintenance notes

- New backlog doc families need their own `!`-exception at creation
  time — force-adds rot silently on the next delete + re-add cycle.
- Reviewer: confirm the runbook edit changed nothing beyond the titular
  fragment.
