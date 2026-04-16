# Hero Images Runbook

## Overview

The hero image system builds deterministic prompt artifacts and validates final AVIF hero images for every published article. Final assets are created/curated manually; automatic API generation is out of policy.

Core artifacts:

- `scripts/hero-images/prompts.json` — pre-built prompt library (one entry per article)
- `scripts/hero-images/status.json` — per-slug operational state (`pending`, `done`, `error`, `failed`)
- `public/images/hero/<slug>.avif` — final 1200×630 AVIF images served to users

Key scripts:
- `scripts/hero-images/prompt-plan.mjs` — routing rules that map article content → scene recipe
- `scripts/hero-images/config.mjs` — approved scene models (postures, objects, icons, colors)
- `scripts/hero-images/build-prompts.mjs` — regenerates `prompts.json` from manifest + routing rules
- `scripts/check-hero-images.mjs` — blocking gate for published assets (presence, format, size)

---

## Commands

### Step 1 — Rebuild the prompt library (router miniApp)

Run this whenever routing rules, scene models, or article content change:

```bash
pnpm run images:build-prompts
```

Reads `scripts/hero-images/manifest.json`, applies routing in `prompt-plan.mjs`, and writes `scripts/hero-images/prompts.json`.

### Step 2 — Create image manually

1. Open the entry for your slug in `scripts/hero-images/prompts.json`.
2. Create or curate the visual manually in your design workflow.
3. Save the final file as:

```text
public/images/hero/<slug>.avif
```

4. Keep the file within 80 KB and aligned to 1200×630 output requirements.

### Step 3 — Verify

```bash
pnpm run check:hero-images
```

Confirms all 34 published articles have a valid AVIF file under 80 KB. Must exit 0 before publishing.

---

## Typical workflow: fix a failing slug

1. Identify the failure in `status.json` or quality review notes
2. Check which rule matched in `prompt-plan.mjs` (look at `selectors.ruleId` in `prompts.json`)
3. If wrong scene: fix routing rule in `prompt-plan.mjs` or add a slug-level override
4. Rebuild prompts: `pnpm run images:build-prompts`
5. Recreate the image manually for the slug and replace `public/images/hero/<slug>.avif`
6. Verify: `pnpm run check:hero-images`

---

## Typical workflow: new article

1. Run `pnpm run images:build-prompts` after the article is added to the manifest
2. Create/curate `public/images/hero/<new-slug>.avif` manually using the generated prompt as guidance
3. Inspect the image manually (see Quality Rubric below)
4. If quality is not acceptable, fix the prompt or routing and recreate the image
5. Run `pnpm run check:hero-images`

---

## Prompt Uniqueness

**Invariant:** every entry in `prompts.json` must have a distinct `prompt` text and a distinct `sceneId`. See `docs/domain/CONTENT/INVARIANTS.md` § INV-015 for the formal rule.

**Why this breaks silently:** `build-prompts.mjs` routes articles by keyword match. Multiple articles in the same cluster (e.g. several cesantía articles) will match the same rule and receive identical prompts. The router is not aware of cross-article uniqueness — that responsibility falls on the human operator.

**When to check:** before creating/updating hero assets any time `build-prompts` has been re-run or new articles have been added.

**Check command:**
```bash
python3 -c "
import json
from collections import defaultdict
with open('scripts/hero-images/prompts.json') as f:
    data = json.load(f)
by_prompt = defaultdict(list)
for e in data['entries']:
    by_prompt[e['prompt']].append(e['slug'])
dupes = {p: slugs for p, slugs in by_prompt.items() if len(slugs) > 1}
print(f'Duplicate groups: {len(dupes)}')
for p, slugs in dupes.items():
    print('  DUPLICATES:', slugs)
    print('  Prompt:', p[:80])
"
```

**How to fix a duplicate group:**

1. Identify what makes each article's topic distinct (different props, posture, or composition).
2. Edit each duplicate entry's `"prompt"` in `prompts.json` directly — do **not** re-run `build-prompts` (it will overwrite your fixes).
3. For each change, also update:
   - `"sceneId"` → unique identifier, format `Template:topic-specific-scene`
   - `"promptHash"` → SHA-256 of the new prompt string
4. Re-run the check command above to confirm zero duplicates.
5. Then proceed to manual image creation for each affected slug.

**Scene prop vocabulary (for unique differentiation):**

| Topic pattern | Distinguishing props |
|---|---|
| Comparison (A vs B) | balance scale / two side-by-side containers / two bars |
| Payment / settlement | coin stack + document + signing gesture |
| Checklist / process | checkbox list with checkmarks |
| Protection / coverage | umbrella arc + shield |
| Compound growth | stepped pyramid / parabolic arrow |
| Fees / costs | funnel with coin in / coin out |
| Fraud / blocked | card with X + shield / cracked ID + question mark |
| Rent / housing | house silhouette + upward arrow |
| Prepayment / payoff | descending staircase of blocks + calendar |
| Reform / change | document + gear cog |
| Multiple deductions | strips peeling off a rectangle |
| Renegotiation | extended arm / handshake + signature line |

---

## Quality Rubric (manual review, 7 points)

| # | Criterion | Pass condition |
|---|-----------|----------------|
| 1 | BACKGROUND | Single flat solid color, no gradients |
| 2 | STYLE | 2D flat vector only, no 3D / photorealism |
| 3 | TEXT | No letters, numbers, logos, watermarks |
| 4 | ELEMENTS | ≤ 3 distinct visual objects |
| 5 | COMPOSITION | Subject occupies 30–70 % of canvas area |
| 6 | INDUSTRY | Clearly communicates personal finance |
| 7 | SIMPLICITY | Understandable concept within 2 seconds |

Pass threshold: **5 / 7** minimum. Images scoring below 5 must be redesigned before publish.

---

## Routing rules (`prompt-plan.mjs`)

Rules are evaluated in declaration order; first keyword match wins. Rule priority (top to bottom):

1. `fraude` — fraud, scam, phishing topics
2. `renta` — tax declaration, F22, SII
3. `uf` — UF, IPC, inflation indicators
4. `deuda` — debt, credit, DICOM
5. `ahorro` — savings, budget, emergency fund
6. `empleo` — payroll, salary, finiquito, honorarios
7. `prevision` — AFP, pension, cuenta 2
8. `salud` — FONASA, ISAPRE, medical leave
9. fallback — category-based fallback

**Common misrouting:** articles that mention "impuesto" in a payroll context (e.g. `impuesto único al trabajo`) match rule #2 (`renta`) instead of rule #6 (`empleo`). Fix by adding a slug-level override or tightening the `renta` keyword list.

---

## Failure modes

### `images:generate*` command blocked
Automatic generation commands are intentionally deprecated.
**Fix:** follow the manual workflow in this runbook and run `pnpm run check:hero-images`.

### `400 Invalid value` (dimension error)
Old `prompts.json` entries with DALL-E 3 size `1792x1024` — incompatible with `gpt-image-1`.
**Fix:** `pnpm run images:build-prompts` to regenerate with correct `1536x1024`.

### `score < 5/7` in manual review
Visual does not meet style constraints (3D, gradients, text leak, weak clarity).
**Fix:** Inspect `selectors.ruleId` and `sceneId` in `prompts.json`. Update routing rules if needed, rebuild prompts, and recreate the image manually.
