---
name: hero-image-audit
description: "Audit, generate, and evaluate hero images for Monedario articles. Use when: a new article needs a hero image, an existing image fails the quality rubric, the pipeline shows error or failed status entries, or you want to run a batch quality review of all hero images. Covers: pre-generation checks, pipeline run commands, 7-point automated rubric, 3-point human review, and post-generation verification."
argument-hint: "Optional: a specific article slug to scope the audit"
---

# Hero Image Audit

## When to Use

- New article published and needs a hero image
- `pnpm run check:hero-images` reports missing or oversized images
- `scripts/hero-images/status.json` shows `"state": "error"` or `"state": "failed"` entries
- Batch quality review of all 34 hero images

## Quality Criteria

Two layers — automated and human. Both must pass before an image is considered production-ready.

### Layer 1: Automated (7-point AI rubric, evaluated by GPT-4o vision)

| #   | Criterion   | Pass condition                                                                 |
| --- | ----------- | ------------------------------------------------------------------------------ |
| 1   | BACKGROUND  | Single flat solid color — zero gradients, textures, vignette, or noise         |
| 2   | ELEMENTS    | ≤ 3 distinct visual elements total                                             |
| 3   | STYLE       | Flat 2D illustration only — zero 3D, shadows, or photorealism                  |
| 4   | COMPOSITION | Main subject left/center-left, clean empty space on the right third            |
| 5   | TEXT        | Zero letters, numbers, or readable symbols                                     |
| 6   | INDUSTRY    | Clearly communicates personal finance — not confusable with tech or healthcare |
| 7   | SIMPLICITY  | Core concept understandable in under 2 seconds                                 |

**Pass threshold:** score ≥ 5/7. Pipeline retries up to 3 times with progressive enforcement of failed criteria.

### Layer 2: Human spot-check (3 questions, ~2 minutes total)

These cannot be automated. Answer Pass or Fail for each:

1. **"Esto es para mí" test:** Before reading the article title, does the image make a working Chilean adult think "this article is for someone like me"?
2. **Card-crop test:** View the article list (homepage or `/posts/`). Is the visually important content of the image still clearly visible when cropped to a 16:9 card? (The pipeline designs for a 1200×630 OG canvas; the safe zone for card display is the central 1134×596px.)
3. **Scroll-stop test:** Would a reader slow down their scan to look at this image, or does it blend into the background?

**Pass threshold:** ≥ 2/3 human questions pass.

An image must pass both layers to be production-ready.

---

## Procedure

### 1. Check Current Status

```bash
node -e "
const s = JSON.parse(require('fs').readFileSync('scripts/hero-images/status.json','utf8'));
const byState = {};
Object.values(s).forEach(e => { byState[e.state] = (byState[e.state]||0)+1; });
console.log('State breakdown:', byState);
const problems = Object.entries(s).filter(([,e])=>e.state!=='done');
problems.forEach(([slug,e])=>console.log(slug, e.state, e.score||'', e.error||''));
"
```

Then run the CI check:

```bash
pnpm run check:hero-images
```

This confirms all published articles have a valid `.avif` file under `public/images/hero/` within the 80KB budget.

### 2. Generate Images

**All images not yet marked "done" (including errors):**

```bash
pnpm run images:generate
```

**Retry only "failed" quality images:**

```bash
pnpm run images:generate:retry
```

**Single article:**

```bash
pnpm run images:generate:one --slug=<article-slug>
```

**Force regenerate everything:**

```bash
pnpm run images:generate:force
```

Requires `OPENAI_API_KEY` in `.env`. Model: `gpt-image-1`, size: `1536×1024`, output: `.avif` at 80-quality AVIF to `public/images/hero/`.

### 3. Review Pipeline Output

After a run, check:

```bash
cat scripts/hero-images/status.json | node -e "
const s = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
const done = Object.values(s).filter(e=>e.state==='done').length;
const failed = Object.entries(s).filter(([,e])=>e.state==='failed');
const errors = Object.entries(s).filter(([,e])=>e.state==='error');
console.log('done:', done, '| failed:', failed.length, '| error:', errors.length);
failed.forEach(([slug,e])=>console.log('FAILED:', slug, 'score:', e.score, 'criteria:', e.failures?.join(', ')));
errors.forEach(([slug,e])=>console.log('ERROR:', slug, e.error?.slice(0,100)));
"
```

All entries should reach `"state": "done"` before deploying.

### 4. Human Review

For each image that passed the automated rubric, open it directly:

```
public/images/hero/<slug>.avif
```

Or view it on the live site (article card on homepage/listing, and in the article's OG preview). Answer the 3 human check questions from Layer 2 above. A failed human check means:

- If 0/3: Regenerate and re-evaluate — the scene model may be wrong for this article.
- If 1/3: Often fixable by adjusting the `readerSituation` or `primaryIntent` fields in `scripts/hero-images/prompts.json` and regenerating that slug.

### 5. Handle Persistently Failing Images

If an image fails 3 automated attempts (score < 5/7), check:

1. Read the `failures` array in `status.json` for this slug.
2. Open `scripts/hero-images/prompts.json` and find the entry for this slug.
3. Check `sceneId`, `toneClass`, and `primaryIntent` — are they appropriate for this article?
4. If the wrong scene is assigned: update the prompt entry in `prompts.json` to use a better-matched approved model from `src/tools/hero-images/config.mjs`.
5. Then regenerate: `pnpm run images:generate:one --slug=<slug>`.

If failures persist across 3 full cycles, escalate to manual scene design using a vector tool — do not publish with a failed image in place.

### 6. Post-Generation Verification

```bash
pnpm run check:hero-images
pnpm run check:hero-prompts
```

Both must exit 0 before the change is merged.

---

## Key Files

| File                                  | Purpose                                                    |
| ------------------------------------- | ---------------------------------------------------------- |
| `scripts/hero-images/pipeline.mjs`    | Generation + evaluation engine (gpt-image-1, 1536×1024)    |
| `scripts/hero-images/status.json`     | Per-slug pipeline state (done/failed/error)                |
| `public/hero-images-status.json`      | Public copy for the dev monitor UI                         |
| `scripts/hero-images/prompts.json`    | Per-slug prompt metadata (scene, tone, intent)             |
| `scripts/hero-images/prompt-plan.mjs` | Default model plan (gpt-image-1, 1536×1024, quality: auto) |
| `public/images/hero/<slug>.avif`      | Canonical hero image files                                 |
| `src/tools/hero-images/config.mjs`    | Approved scene models (Templates A/B/C)                    |
| `scripts/check-hero-images.mjs`       | CI validation (presence, format, size budget)              |
| `scripts/check-hero-prompts.mjs`      | CI validation (prompt metadata completeness)               |

## Canvas Dimensions

| Parameter       | Value                                                 |
| --------------- | ----------------------------------------------------- |
| Generation size | 1536×1024 (gpt-image-1)                               |
| Output canvas   | 1200×630 (resized by `postprocess-images.mjs`)        |
| Max file size   | 80KB (build-enforced); target ≤ 50KB                  |
| Card display    | 16:9 crop from center — safe zone: central 1134×596px |

## Adding a New Article

Checklist for every new published article:

- [ ] Frontmatter `heroImage` field set to `/images/hero/<slug>.avif`
- [ ] Entry exists in `scripts/hero-images/prompts.json` with valid `sceneId`, `primaryIntent`, `toneClass`
- [ ] `pnpm run check:hero-prompts` passes
- [ ] `pnpm run images:generate:one --slug=<slug>` completes with score ≥ 5/7
- [ ] Human spot-check: ≥ 2/3 Layer 2 questions pass
- [ ] `pnpm run check:hero-images` passes
- [ ] File size in `public/images/hero/<slug>.avif` is ≤ 80KB
