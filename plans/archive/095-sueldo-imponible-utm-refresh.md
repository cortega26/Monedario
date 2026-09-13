# Plan 095: Revalidar sueldo-imponible-chile contra la UTM de septiembre (71721)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ece35800..HEAD -- src/data/blog/sueldo-imponible-chile.md src/infrastructure/editorial/editorial-volatile-data.snapshot.json scripts/check-editorial-timeliness.mjs scripts/compute-review-policies.mjs`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S–M
- **Risk**: LOW (content change, YMYL-adjacent — minimal diff + editorial gates; see Authority)
- **Depends on**: plans/096-*.md MERGED (this plan's executor needs a working `pnpm install` to run gates and to commit through the husky hook; without 096 the toolchain fails before any step)
- **Category**: docs (editorial data refresh — unblocks `check:ci`)
- **Planned at**: commit `ece35800`, 2026-09-12
- **Origen:** breakage preexistente detectado al cerrar el plan 087 (`check:editorial-timeliness` falla; probado idéntico en árbol prístino)

## Why this matters

`check:editorial-timeliness` — part of `check:ci` — is red because
`sueldo-imponible-chile.md` still pins the August UTM (71649, reviewed
2026-08-19) while the September UTM (71721, effective 2026-09-01) is live in
the volatile snapshot. The strict-sync contract is doing its job: readers see
a "vigente al 2026-08-19" notice with a stale figure. A focused editorial
re-validation (confirm body figures against 71721, move `validAsOf` +
`expectedValue` + the vigencia notice) restores the gate with a minimal,
reviewable diff. No prose rewriting, no scope creep into other stale articles.

## Current state

The contract (inlined from the repo's decided docs — the executor has not read them):

- `context/CONTRACTS.md:550` — every published article resolves to a
  deterministic review date using `articleLead.validAsOf`, `updatedDate`, or `pubDate`.
- `context/CONTRACTS.md:577-581` — `volatileData` is `{ id, sync, expectedValue? }`;
  `expectedValue`, when present, must be a number or non-empty string.
- `context/CONTRACTS.md:590` — timeliness failures block stale strict review
  dates and mismatched strict `expectedValue`.
- `context/INVARIANTS.md:551-552` — blocking outputs are literally
  `volatileData "<id>" changed on <date>` and `expectedValue=<x> does not match snapshot value=<y>`.

The checker logic (`scripts/check-editorial-timeliness.mjs:195,358-377`):

```js
const reviewDate = validAsOf ?? updatedDate ?? pubDate;   // line 195: validAsOf wins
// strict sync: fail when the article review predates the dataset trigger…
if (dataset.sync === "strict" && record.reviewDate < dataset.reviewTriggerDate) // line 358
// …or when the pinned figure differs from the snapshot value
if (dataset.sync === "strict" && dataset.expectedValue !== undefined && dataset.valueMatches !== true) // line 367
```

The article (`src/data/blog/sueldo-imponible-chile.md`):

```md
articleLead:
  ...
  validAsOf: 2026-08-19          # line 27 → reviewDate = 2026-08-19
...
volatileData:                     # lines 44-47
  - id: economic.utm.value
    sync: strict
    expectedValue: 71649
reviewPolicy:                     # lines 48-57, GENERATED — see below
  cadenceLabel: monthly
  ...
  computedAt: "2026-09-06"
updatedDate: 2026-09-06T00:00:00Z  # line 57 — does NOT satisfy the gate (validAsOf wins)
```

```md
> **Información vigente al 2026-08-19.** El tope máximo imponible en UF ...  # line 60
```

The snapshot (`src/infrastructure/editorial/editorial-volatile-data.snapshot.json`,
`lastUpdated: 2026-09-06`, refreshed by commit `84ce7c80`):

```json
"economic.utm.value": {
  "label": "Valor UTM",
  "value": 71721,
  "unit": "clp",
  "lastObservedAt": "2026-09-06",
  "reviewTriggerDate": "2026-09-01",
  "sourceUrl": "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm"
}
```

Corroboration (advisor-verified 2026-09-12; executor must still confirm the
snapshot value is unchanged before editing): the SII official 2026 table lists
Agosto 71.649 and **Septiembre 71.721** (`https://www.sii.cl/valores_y_fechas/utm/utm2026.htm`),
independently matched by valor-utm.cl, leydirecta.cl and utmapp.cl. So the
expected end state is `expectedValue: 71721` — unless the snapshot moved again
(see STOP).

Body audit (advisor-grepped 2026-09-12): the ONLY August-pinned items are
`validAsOf` (line 27), `expectedValue` (line 47) and the vigencia notice
(line 60). No other `71649`/`71.649` figure appears in the file. The executor
must still read the full body (160 lines) and list every peso figure derived
from UTM — the tope imponible is expressed in UF (month-invariant), which is
why only the three items need to move. If the body contains a UTM-derived peso
figure the grep missed, it must be recomputed with 71721, not ignored.

Generator behavior (observed by the advisor — load-bearing):
`scripts/compute-review-policies.mjs` REWRITES the `reviewPolicy` block and
bumps `updatedDate`, has NO `--help`/`--dry-run` (running it with `--help`
EXECUTED it and modified 9 blog files), and must be run AFTER the manual
frontmatter edit so `reviewPolicy`/`updatedDate` stay consistent. Any file
outside the in-scope article that the generator touches must be reverted.

Authority: this is a data refresh of a finance article, not a rewrite.
Constitution > AGENTS.md > context > code. Keep the diff to dates/figures;
run the repo's own editorial gates as verification (they encode NORMA_YMYL).
Do not touch prose, links, or structure.

## Commands you will need

| Purpose   | Command | Provenance | Resultado esperado |
| --- | --- | --- | --- |
| Toolchain | `node --version`, `pnpm --version` | executed | Node 22 per `.nvmrc` (advisor saw 24.19.0 / pnpm 11.7.0; use repo's Node 22) |
| Deps | `pnpm install --frozen-lockfile` | executed | exit 0 (requires plan 096 merged; advisor saw `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` pre-096) |
| Timeliness | `node scripts/check-editorial-timeliness.mjs` | executed | exit 0 (advisor saw exit 1 with exactly the 2 failures quoted in Why) |
| ReviewPolicy | `node scripts/compute-review-policies.mjs` | executed | exit 0; re-runs the generator (CAUTION: rewrites `updatedDate` broadly — see Step 2) |
| Editorial | `pnpm run check:editorial` | declared | exit 0 |
| Frontmatter | `pnpm run check:frontmatter` | declared | exit 0 |
| Docs idx | `pnpm run check:docs` | executed | exit 0 |
| Suite | `pnpm run test` | executed | 1442/1442 (requires plan 094 merged for the last test; if 094 is not merged, 1441/1442 with the SOLE failure in `actions-runner-portability` is the expected intermediate state — record it, do not fix it here) |

`executed` = advisor ran it on 2026-09-12 (main at/after `ece35800`).
`declared` = read from `package.json` but not run by the advisor in this recon.

## Scope

**In scope** (the only file you may modify):

- `src/data/blog/sueldo-imponible-chile.md` (frontmatter dates/figures + vigencia notice + generator-managed `reviewPolicy`/`updatedDate` within this file only)

**Out of scope** (do NOT touch):

- Any other article under `src/data/` — several show August dates but are NOT
  failing any gate (different cadences/modes). Each is its owner's review, not
  this plan. If the generator modifies them, REVERT (see Step 2).
- `src/infrastructure/editorial/editorial-volatile-data.snapshot.json` and any
  refresh script — the snapshot is correct and corroborated; regenerating data
  is a different job.
- `scripts/check-editorial-timeliness.mjs`, `scripts/compute-review-policies.mjs`,
  registry/policy JSON — the checker is correct; the content lagged it.
- `pnpm-workspace.yaml`, lockfiles — plan 096. Workflows — plan 094.

## Git workflow

- Branch: `advisor/095-sueldo-imponible-utm-refresh`
- Conventional commits, e.g. `chore(editorial): revalidar sueldo-imponible contra UTM septiembre (71721)`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline y confirmación del dato

Run the drift check first. Then confirm the snapshot still says what this
plan assumes (it refreshes daily — a October value would change everything):

1. `python3 -c "import json; d=json.load(open('src/infrastructure/editorial/editorial-volatile-data.snapshot.json'))['datasets']['economic.utm.value']; print(d['value'], d['reviewTriggerDate'])"` → must print `71721 2026-09-01`. Otherwise STOP (re-derive).
2. `pnpm install --frozen-lockfile` → exit 0. If it fails with minimumReleaseAge: 096 not merged — STOP ("blocked on 096").
3. `node scripts/check-editorial-timeliness.mjs` → exit 1 with EXACTLY the two
   known failures (`changed on 2026-09-01 ... behind`, `expectedValue=71649 ...
   snapshot value=71721`). Record output. Any additional failure = STOP (drift).

**Verify**: snapshot prints `71721 2026-09-01`; install exit 0; gate fails only as documented.

### Step 1: Revalidar el cuerpo y mover las tres marcas de vigencia

1. Read the FULL article body (lines 59–160). List every peso figure derived
   from UTM (tope imponible conversions, examples). The advisor found none
   besides frontmatter — confirm independently.
2. For each UTM-derived peso figure found: recompute with 71721 and update it.
   Figures expressed in UF need no change (month-invariant) — record that
   judgment explicitly per figure.
3. Apply the three known moves:
   - `articleLead.validAsOf: 2026-08-19` → the date of YOUR review (today's
     date in `YYYY-MM-DD`; must be ≥ 2026-09-01).
   - `expectedValue: 71649` → `71721`.
   - Line-60 notice `vigente al 2026-08-19` → same review date as `validAsOf`.
4. Change NOTHING else: no prose, no links, no sources, no structure.

**Verify**: `grep -n "71649\|2026-08-19" src/data/blog/sueldo-imponible-chile.md` returns no matches; `grep -n "71721" <file>` shows the expectedValue line.

### Step 2: Regenerar reviewPolicy con alcance quirúrgico

1. Snapshot the tree first: `git diff --name-only > /tmp/095-before.txt`.
2. Run `node scripts/compute-review-policies.mjs` (no flags — it takes none;
   DO NOT pass `--help`, it executes anyway). Exit 0 expected.
3. `git diff --name-only > /tmp/095-after.txt; diff /tmp/095-before.txt /tmp/095-after.txt` —
   the ONLY newly modified file beyond Step 1 must be the in-scope article
   (generator updating its `reviewPolicy`/`updatedDate`). Revert anything else:
   `git checkout -- <other files>`.
4. Confirm the article's `reviewPolicy` block is still coherent (monthly,
   triggers include `economic.utm.value`).

**Verify**: `git diff --name-only` lists exactly `src/data/blog/sueldo-imponible-chile.md`.

### Step 3: Gates de cierre

1. `node scripts/check-editorial-timeliness.mjs` → exit 0.
2. `pnpm run check:editorial` → exit 0.
3. `pnpm run check:frontmatter` → exit 0.
4. `pnpm run check:docs` → exit 0.
5. `pnpm run test` → 1442/1442, or 1441/1442 with the SOLE failure in
   `actions-runner-portability` when plan 094 is not yet merged (record which).

**Verify**: all five with recorded outputs.

## Test plan

No new tests: the checker itself is the acceptance test (red→green pair
recorded in Steps 0/3). Existing pattern: `check:editorial-timeliness` is a
config-content contract gate like the frontmatter and policy-registry checks.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node scripts/check-editorial-timeliness.mjs` exits 0
- [ ] `pnpm run check:editorial`, `pnpm run check:frontmatter`, `pnpm run check:docs` exit 0
- [ ] `pnpm run test` exits 0, or 1441/1442 with the only failure in `actions-runner-portability` (094 pending)
- [ ] `git diff --name-only <base>...HEAD` lists only `src/data/blog/sueldo-imponible-chile.md`
- [ ] No `71649`/`2026-08-19` remains in the file; `expectedValue: 71721` present; `validAsOf` ≥ 2026-09-01
- [ ] `plans/README.md` status row updated (unless reviewer maintains the index)

## STOP conditions

Stop and report back (do not improvise) if:

- The snapshot no longer reads `71721 / 2026-09-01` (a newer refresh landed — the whole derivation changes).
- The SII source value cannot be reconciled with 71721 (snapshot corruption — never "fix" data to match).
- The body contains a UTM-derived figure you cannot recompute or corroborate.
- Fixing the gate would require touching any out-of-scope file.
- `pnpm install --frozen-lockfile` fails (096 not merged).
- Any gate in Step 3 fails twice after a reasonable attempt (record exact output).

## Maintenance notes

For the human/agent who owns this code after the change lands:

- This is a MONTHLY recurring review by design (`cadenceLabel: monthly`,
  strict sync on `economic.utm.value`): every UTM change re-triggers it. The
  automated snapshot refresh deliberately does NOT move `validAsOf` — a human
  must confirm the prose still holds. Do not "fix" that separation.
- Sibling articles with August dates are on their own cadences; each will
  trigger its own review when due. Do not batch them here.
- **Deferred:** nothing.

## Registro de control de cambios — completar al ejecutar

- Estado de implementación y commit(s): pendiente.
- Baseline real (Node, pnpm, comandos y salidas): pendiente.
- Cambios y correspondencia con el alcance: pendiente.
- Evidencia de aceptación y gates: pendiente.
- Riesgo residual y rollback probado/documentado: pendiente.
- Despliegue (cuando aplique), revisión y actualización del índice: pendiente.
