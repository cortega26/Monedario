# Hero Images Runbook

## Overview

The hero image system builds deterministic prompt artifacts for manual image generation and validates final AVIF hero images for every published article. Final assets are created/curated manually; automatic API generation is out of policy.

Core artifacts:

- `scripts/hero-images/prompts.json` — pre-built prompt library (one entry per article)
- `scripts/hero-images/status.json` — per-slug operational state (`pending`, `done`, `error`, `failed`)
- `public/images/hero/<slug>.avif` — final 1200×630 AVIF images served to users

Prompt tracks:

- `A — Human Editorial Scene` — default for most reader-facing money topics
- `B — Hybrid Scene + Mechanism` — process/calc topics with obvious human stakes
- `C — Editorial Mechanism` — technical/reference topics where a human scene would reduce clarity

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
3. If the prompt is too sterile, check `promptTrack`, `sceneId`, and the generated prompt language before touching any asset
4. If wrong scene: fix routing rule in `prompt-plan.mjs` or add a slug-level override
5. Rebuild prompts: `pnpm run images:build-prompts`
6. Recreate the image manually for the slug and replace `public/images/hero/<slug>.avif`
7. Verify: `pnpm run check:hero-images`

---

## Typical workflow: new article

1. Run `pnpm run images:build-prompts` after the article is added to the manifest
2. Inspect the generated prompt first: confirm the selected `promptTrack`, the human/editorial anchor, and the mechanism/context balance
3. Create/curate `public/images/hero/<new-slug>.avif` manually using the generated prompt as guidance
4. Inspect the image manually (see Quality Rubric below)
5. If quality is not acceptable, fix the prompt or routing and recreate the image
6. Run `pnpm run check:hero-images`

---

## Prompt Uniqueness

**Invariant:** every entry in `prompts.json` must have a distinct `prompt` text and a distinct `sceneId`. See `docs/domain/CONTENT/INVARIANTS.md` § INV-015 for the formal rule.

**Current rule of thumb:** prompt uniqueness should be solved in `scripts/hero-images/prompt-plan.mjs`, not by long-lived manual edits to generated JSON. `sceneId` is article-specific and deterministic: `Template:approvedModelId--slug`.

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

1. Identify what makes each article's topic distinct (different props, posture, document type, comparison shape, or timeline).
2. Update `scripts/hero-images/prompt-plan.mjs`:
   - add or refine a slug override if the article is misrouted;
   - add an article-specific prompt variant if the routing family is correct but the scene is too generic.
3. Rebuild prompts with `pnpm run images:build-prompts`.
4. Re-run the duplicate check and confirm zero repeated `prompt` / `sceneId`.
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

## Prompt Quality Rubric (manual review before generation)

The prompt is the product. Do not move to image generation if the prompt itself fails this review.

Hard fail rules:

- If **Human Appeal likely from prompt < 6/10**, the prompt fails even if it is clean, sober, or low-friction.
- Prompt likely produces a sterile diagram for a human topic.
- Prompt has no human/editorial anchor where the article clearly needs one.
- Prompt relies only on centered objects or abstract blocks.
- Prompt prioritizes low cognitive load over editorial pull.
- Prompt forbids all visual tools needed for warmth, hierarchy, or tension.
- Prompt can pass without human appeal.

Weighted rubric:

| Criterion | Weight | Pass condition |
|---|---:|---|
| Human appeal likely from prompt | 25% | The prompt describes a recognizable financial moment with enough warmth or tension to feel worth looking at. |
| Editorial value | 20% | The image direction feels like article art direction, not a compliance diagram or UI placeholder. |
| Scene/tension quality | 15% | The prompt includes a lived stake, gesture, comparison, consequence, or before/after tension. |
| Memorability / grid differentiation | 15% | The composition would stand apart in a grid instead of collapsing into another centered finance object. |
| Trust / YMYL fit | 10% | Serious, clean, non-sensational, and free of fake text, logos, or hype-finance aesthetics. |
| Semantic clarity | 10% | The article topic is still immediately legible without flattening the image into a diagram. |
| Negative-friction control | 5% | The prompt avoids clutter, malformed UI, photorealism, and obvious AI artifacts without over-sanitizing the scene. |

Minimum operating rule:

- A prompt may not pass on cleanliness alone.
- Rework any prompt that scores high on clarity but low on human appeal or editorial pull.

## Final Image Rubric (manual review after generation)

Use this after the editor generates or curates the asset from the prompt.

| Criterion | Pass condition |
|---|---|
| Human appeal | The image feels recognizable, warm, or consequential enough to survive a homepage/grid scan. |
| Editorial scene quality | Human or situational anchor is visible whenever the article has obvious lived stakes. |
| Trust fit | No fake text, no logos, no photorealism, no neon/crypto/stock-finance cues. |
| Controlled richness | Flat editorial style is preserved while still allowing overlap, tonal separation, or one simple grounding shape. |
| Clarity | The main moment reads in about 2 seconds without collapsing into a sterile icon. |
| Performance | 1200×630 AVIF and within the size budget. |

---

## Routing rules (`prompt-plan.mjs`)

Slug overrides are evaluated first. After that, rules are evaluated in declaration order; first keyword match wins. Current rule priority (top to bottom):

1. `fraude` — fraud, scam, phishing topics
2. `prevision` — AFP, pension, cuenta 2
3. `liquidacion` — payroll statements / pay stub interpretation
4. `sueldo` — salary calculation / gross-to-net topics
5. `empleo` — payroll, salary, finiquito, cesantía, honorarios
6. `renta` — tax declaration, F22, SII
7. `uf` — UF, IPC, inflation indicators
8. `deuda` — debt, credit, DICOM
9. `ahorro` — savings, budget, emergency fund
10. `salud` — FONASA, ISAPRE, medical leave
11. fallback — category-based fallback

**Common misrouting:** articles that mention "impuesto" in a payroll context (e.g. `impuesto único al trabajo`) match rule #2 (`renta`) instead of rule #6 (`empleo`). Fix by adding a slug-level override or tightening the `renta` keyword list.

---

## Failure modes

### `images:generate*` command blocked
Automatic generation commands are intentionally deprecated.
**Fix:** follow the manual workflow in this runbook and run `pnpm run check:hero-images`.

### `400 Invalid value` (dimension error)
Old `prompts.json` entries with DALL-E 3 size `1792x1024` — incompatible with `gpt-image-1`.
**Fix:** `pnpm run images:build-prompts` to regenerate with correct `1536x1024`.

### Prompt passes cleanliness but fails editorial pull
Prompt or image is clean but editorially weak, sterile, or diagram-first.
**Fix:** Inspect `promptTrack`, `selectors.ruleId`, and `sceneId` in `prompts.json`. Update routing rules or slug variants first, rebuild prompts, and only then recreate the image manually.
