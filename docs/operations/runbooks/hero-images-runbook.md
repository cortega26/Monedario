# Hero Images Runbook

## Overview

The hero image system generates, evaluates, and post-processes AVIF hero images for every published article. It uses OpenAI `gpt-image-1` for generation and GPT-4o vision for automated quality evaluation against a 7-point rubric.

Core artifacts:
- `scripts/hero-images/prompts.json` — pre-built prompt library (one entry per article)
- `scripts/hero-images/status.json` — per-slug pipeline state (`pending`, `done`, `error`, `failed`)
- `public/images/hero/<slug>.avif` — final 1200×630 AVIF images served to users

Key scripts:
- `scripts/hero-images/prompt-plan.mjs` — routing rules that map article content → scene recipe
- `scripts/hero-images/config.mjs` — approved scene models (postures, objects, icons, colors)
- `scripts/hero-images/build-prompts.mjs` — regenerates `prompts.json` from manifest + routing rules
- `scripts/hero-images/pipeline.mjs` — generation + evaluation engine (idempotent)

---

## Commands

### Step 1 — Rebuild the prompt library (router miniApp)

Run this whenever routing rules, scene models, or article content change:

```bash
pnpm run images:build-prompts
```

Reads `scripts/hero-images/manifest.json`, applies routing in `prompt-plan.mjs`, and writes `scripts/hero-images/prompts.json`.

### Step 2 — Generate images

```bash
pnpm run images:generate
```

Processes all slugs not yet in `done` state. Idempotent — safe to re-run.

```bash
pnpm run images:generate:retry
```

Retries only slugs in `failed` or `error` state.

```bash
pnpm run images:generate:one --slug=<slug>
```

Generate a single image by slug (append slug value directly, e.g. `pnpm run images:generate:one --slug=como-calcular-sueldo-liquido`).

```bash
pnpm run images:generate:cluster --cluster=<cluster>
```

Generate all images for one content cluster (e.g. `sueldo-remuneraciones`).

```bash
pnpm run images:generate:force
```

Regenerate all images, including ones already in `done` state.

### Step 3 — Verify

```bash
pnpm run check:hero-images
```

Confirms all 34 published articles have a valid AVIF file under 80 KB. Must exit 0 before publishing.

---

## Typical workflow: fix a failing slug

1. Identify the failure in `status.json` or pipeline output (`score < 5/7`)
2. Check which rule matched in `prompt-plan.mjs` (look at `selectors.ruleId` in `prompts.json`)
3. If wrong scene: fix routing rule in `prompt-plan.mjs` or add a slug-level override
4. Rebuild prompts: `pnpm run images:build-prompts`
5. Retry: `pnpm run images:generate:retry`
6. Verify: `pnpm run check:hero-images`

---

## Typical workflow: new article

1. Run `pnpm run images:build-prompts` after the article is added to the manifest
2. Run `pnpm run images:generate:one --slug=<new-slug>`
3. Inspect the generated image manually (see Quality Rubric below)
4. If score < 5/7, fix the prompt or routing and retry
5. Run `pnpm run check:hero-images`

---

## Prompt Uniqueness

**Invariant:** every entry in `prompts.json` must have a distinct `prompt` text and a distinct `sceneId`. See `docs/domain/CONTENT/INVARIANTS.md` § INV-015 for the formal rule.

**Why this breaks silently:** `build-prompts.mjs` routes articles by keyword match. Multiple articles in the same cluster (e.g. several cesantía articles) will match the same rule and receive identical prompts. The router is not aware of cross-article uniqueness — that responsibility falls on the human operator.

**When to check:** before running `images:generate` any time `build-prompts` has been re-run or new articles have been added.

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
5. Then proceed to `images:generate` or `images:generate:one`.

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

## Quality Rubric (automated, 7 points)

| # | Criterion | Pass condition |
|---|-----------|----------------|
| 1 | BACKGROUND | Single flat solid color, no gradients |
| 2 | STYLE | 2D flat vector only, no 3D / photorealism |
| 3 | TEXT | No letters, numbers, logos, watermarks |
| 4 | ELEMENTS | ≤ 3 distinct visual objects |
| 5 | COMPOSITION | Subject occupies 30–70 % of canvas area |
| 6 | INDUSTRY | Clearly communicates personal finance |
| 7 | SIMPLICITY | Understandable concept within 2 seconds |

Pass threshold: **5 / 7**. Images scoring below 5 are flagged for manual review.

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

### `400 Invalid value` (dimension error)
Old `prompts.json` entries with DALL-E 3 size `1792x1024` — incompatible with `gpt-image-1`.
**Fix:** `pnpm run images:build-prompts` to regenerate with correct `1536x1024`.

### `400 Billing hard limit has been reached`
OpenAI account spend cap reached.
**Fix:** Raise the hard limit at <https://platform.openai.com/account/billing>, then re-run `pnpm run images:generate:retry`.

### `429 quota exceeded`
Rate limit or quota exhausted.
**Fix:** Wait and retry: `pnpm run images:generate:retry`.

### `score < 5/7` after 3 attempts (state: `failed`)
Prompt produces wrong style (3D, gradients, text leak).
**Fix:** Inspect `selectors.ruleId` and `sceneId` in `prompts.json`. Likely wrong scene matched. Update routing rules, rebuild prompts, retry.
