# Plan 040: Brief de refresh de title/snippet en calculadoras — evidencia + candidatos + compuerta de firma humana

> **Executor / maintainer instructions**: This is a **decision brief**, not a
> blind executor task. It changes reader-facing copy on a YMYL finance site, so
> the candidate titles/descriptions below are a *starting point for the copy
> authority to approve or replace* — they are NOT approved copy. Do not merge a
> title change without the copy sign-off gate (Step 4). Update this plan's row in
> `plans/README.md` when the decision is made.
>
> **Drift check (run first)**:
> `git diff --stat 520a8685..HEAD -- src/pages/calculadoras/seguro-cesantia.astro src/pages/calculadoras/apv.astro src/pages/calculadoras/conversor-uf.astro`

## Status

- **Priority**: P3
- **Effort**: S (the code change is a one-line prop edit per page; the cost is copy approval + measurement)
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction (SEO / reader-facing copy)
- **Planned at**: commit `520a8685`, 2026-07-10

## Why this matters — and an honest downgrade

This brief came out of the 2026-07-10 traffic review. The original framing was
"~3× traffic by fixing CTR on high-impression pages." **The query-level data does
not support that framing**, and this plan says so plainly:

- The flagship "sueldo líquido" cluster carries most impressions but sits at
  **position 73–95** (page 8–10), where even a perfect title earns ~0% CTR. That
  is a **ranking/authority** problem, not a title problem — it belongs in the
  editorial pipeline (new/upgraded content + internal links), not here.
- Of the three tool pages originally named, two have **structural ceilings** a
  title change will not move (see below). Only **seguro-cesantia** has a small,
  genuinely-winnable delta — and it is *already* the strongest performer.

So this plan is deliberately small: one grounded title/snippet experiment where
the data supports it, plus explicit "measure, don't over-invest" flags on the
other two, plus a pointer to where the real lever lives.

## Current state — the evidence (W27, `output/operations/data-signals/gsc/2026-W27-query-page.json`)

**`/calculadoras/seguro-cesantia/`** — already winning on head terms; upside is
the "simulador" / "solidario" intent at positions 4–8.

- `calcular seguro de cesantia` — pos 2, 83 impr, **29 clicks** (healthy)
- `simulador seguro cesantia` — pos 5, 124 impr, 5 clicks
- `simular seguro de cesantia` — pos 4, 88 impr, 6 clicks
- `simular seguro de cesantía solidario` — pos 8, 52 impr, 0 clicks
- Current title: `Calculadora de Seguro de Cesantía | CIC y Fondo Solidario`
- Current description: `Estima tu cobertura del seguro de cesantía en Chile según sueldo, cotizaciones, causal y saldo CIC.`
- **Observation**: users search **"simulador"/"simular"** far more than "calculadora"; the title leads with "Calculadora" and buries "solidario" jargon. A snippet that mirrors the searched intent is the testable lever.

**`/calculadoras/apv/`** — **low expected value** (do not over-invest).

- Best query `simulador apv` — pos 21, 10 impr, 0 clicks; others (`simulador apv habitat`, `apv provida simulador`) pos 13–16, ≤7 impr.
- This is a **page-2 ranking problem with tiny impressions** and AFP-brand intent (Habitat, Provida). A title tweak will not move a page-2 ranking. Ceiling is ~10 impr/wk. **Measure only.**

**`/calculadoras/conversor-uf/`** — **structural ceiling** (do not over-invest).

- Queries are value lookups: `600 uf` (pos 6), `500 uf` (pos 10), `80 uf` (pos 10) — 0 clicks. Google answers these **inline in the SERP**, so the click rarely comes regardless of title. **Measure only.**

**How titles are set**: each page passes `title` / `description` to the `<Layout>`
component (e.g. `src/pages/calculadoras/seguro-cesantia.astro:82-83`). Changing
copy = editing those two props. The repo gates reader-facing copy with
`node scripts/check-reader-facing-copy.mjs` (part of `pnpm run check:editorial`)
and `scripts/check-dialect.mjs` (español neutral, no voseo).

## Candidate copy (for the copy authority to approve or replace — NOT approved)

Only `seguro-cesantia` has a grounded experiment. Candidates (pick/edit one):

- Title A: `Simulador de Seguro de Cesantía: calcula tu cobertura (AFC y Fondo Solidario)`
- Title B: `Simulador Seguro de Cesantía en Chile: cuánto te pagan y por cuántos meses`
- Description candidate: `Simula tu seguro de cesantía: cuánto te pagan, por cuántos meses y con qué causal, según tu sueldo y saldo CIC. Incluye Fondo de Cesantía Solidario.`

Rationale: leads with "Simulador" (the searched term), keeps "Seguro de Cesantía"
exact-match, surfaces the "cuánto/meses/solidario" intent the pos-4–8 queries
imply. Keep it factual (YMYL) — no promises of amounts.

## Steps

### Step 1: Confirm the evidence is still current

Re-read the latest `*-query-page.json` under
`output/operations/data-signals/gsc/` and confirm seguro-cesantia still shows
"simulador"-intent queries at positions 4–8 with weak CTR. If the picture
changed materially, STOP and re-brief.

### Step 2: Apply ONE approved title/description to seguro-cesantia only

After sign-off (Step 4), edit the `title` and `description` props in
`src/pages/calculadoras/seguro-cesantia.astro` (both the `<Layout>` and any
mirrored `<CalculatorHero>`/OG description on that page — grep the file for the
old string to catch every copy). Do **not** touch apv or conversor-uf.

### Step 3: Gates

- `node scripts/check-reader-facing-copy.mjs` → passes
- `node scripts/check-dialect.mjs` → passes (español neutral)
- `astro check` → 0 errors
- `pnpm run format:check` → exit 0

### Step 4: Human copy sign-off (mandatory gate — do not skip)

The copy authority (site maintainer) must approve the final title/description
text before merge. This is a reader-facing YMYL change; an executor agent may
prepare the diff but must NOT merge it on its own authority. Record the approval
in the PR.

### Step 5: Schedule the measurement follow-up

Two–four weeks after deploy, compare seguro-cesantia's CTR and position for the
"simulador"/"solidario" queries in the new weekly scorecard vs. this brief's
baseline. If CTR on those queries did not improve, revert or iterate — and treat
it as evidence that title copy was not the lever.

## Done criteria

- [ ] seguro-cesantia title/description updated to the **approved** copy (sign-off recorded in the PR), or the brief closed as "not pursued" with a one-line reason.
- [ ] apv and conversor-uf **unchanged** (`git status`).
- [ ] `check:reader-facing-copy`, `check:dialect`, `astro check`, `format:check` all pass.
- [ ] Measurement follow-up scheduled/noted.
- [ ] `plans/README.md` status row for 040 updated.

## STOP conditions

- No copy sign-off obtained → do not merge; leave as a draft brief.
- The evidence in Step 1 no longer holds → re-brief, don't apply stale candidates.
- You are tempted to "also refresh apv/conversor-uf while here" → don't; the data
  says low/zero expected value. That temptation is the failure mode this brief
  exists to prevent.

## Maintenance notes

- **The real traffic lever is not here.** The buried "sueldo líquido" cluster
  (pos 73–95) is an authority/content problem for the editorial pipeline
  (`context/EDITORIAL_AI_PIPELINE.md`) — upgraded content, internal links, and
  E-E-A-T, not metadata. Route it there; do not try to solve it with titles.
- Title/snippet experiments are cheap but slow to read (CTR needs weeks of GSC
  data). Change one variable at a time so the scorecard can attribute the effect.
- If a future experiment targets a SERP-answered query (UF/UTM value lookups),
  expect little movement — that intent is captured by Google's inline answer.
