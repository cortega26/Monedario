---
description: Implement all P0/P1 SEO fixes from the 2026-04-08 SEO audit
applyTo: 'src/**,scripts/**,public/**'
---

## Task Brief
- **Objective:** Implement all critical/high SEO fixes from `output/audit/seo-audit-20260408.md`
- **In scope:** `scripts/generate-og-jpegs.mjs`, `src/layouts/Layout.astro`, `src/data/blog/` (nextStepHref/frontmatter only), `src/components/ArticleJsonLd.astro`
- **Out of scope:** Content rewrites, test files, CI/CD workflows, Dockerfile, functionality audit items
- **Invariants to preserve:** `URL.PUBLIC.NO_POST_ID`, `ROUTE.CANONICAL_SLUG_ONLY`, `SEO.STRUCTURED_DATA_VALID`
- **Required gates (all must pass after ALL edits):**
  - `pnpm run check:no-postid-urls`
  - `pnpm run check:routes`
  - `pnpm run check:links`
  - `pnpm run check:frontmatter`
  - `pnpm run build`
- **Deliverable:** OG fallback live, orphan links resolved, ETF scope callouts added, HowTo schemas implemented; all 5 gates pass

## Authority Check (AGENTS.md Rule 1.1)
Before starting, read these files in order:
1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `context/INVARIANTS.md`
4. `context/INTER_CLUSTER_LINKING.md` — inbound link policy for orphan fixes
5. `output/audit/seo-audit-20260408.md` — full SEO audit report with all findings

---

## Fix 1 — OG image pipeline: static fallback (SEO-001, CRITICAL)

**Context:** 25/34 articles return `400 Billing hard limit` from the image generation API. Until quota is restored, all those articles render without an OG image, degrading social sharing.

**Action A — Add static fallback OG to `src/layouts/Layout.astro`:**

Read `src/layouts/Layout.astro` first. Find the `<meta property="og:image" ...>` tag. It likely references `heroImage` or a generated path. Wrap it with a fallback so that if the primary OG image URL resolves to a 4xx or is absent, the static fallback is used in the HTML output.

At build time (SSG), we cannot do runtime HTTP checks, so the fallback must be logic-based: only use the generated OG path if the article's `heroImageStatus` is `"done"` (read from `public/hero-images-status.json`); otherwise fall back to the global site OG image.

Implement as follows:
1. Read `public/hero-images-status.json` to understand the schema — it maps slug → `{ status: "done"|"error"|"failed"|"pending", ... }`.
2. In `src/layouts/Layout.astro`, in the props destructuring, accept a `slug` prop (it should already be available for article pages).
3. Add import and logic near the top of the frontmatter block:

```typescript
import heroStatusRaw from '../../public/hero-images-status.json';
const heroStatusMap = heroStatusRaw as Record<string, { status: string }>;
const ogImageStatus = slug ? (heroStatusMap[slug]?.status ?? 'unknown') : 'unknown';
const ogImageUrl = (ogImageStatus === 'done' && heroImage)
  ? heroImage
  : `${Astro.site}images/og-fallback.jpg`;  // adjust path to actual site domain + static asset
```

4. Use `ogImageUrl` in the `<meta property="og:image">` and `<meta name="twitter:image">` tags.
5. Create `public/images/og-fallback.jpg` — this should be a 1200×630px fallback image. If one already exists under a different path, reuse it instead of creating a new file. Check `public/images/` first.

**Action B — Add quota telemetry guard to `scripts/generate-og-jpegs.mjs`:**

Read the script first. Find the API call and the error-handling block. After detecting a `400 Billing` or `429` response, immediately stop processing further articles (currently the script likely continues). Add:

```javascript
if (response.status === 400 || response.status === 429) {
  const body = await response.text();
  if (body.includes('Billing') || body.includes('quota') || response.status === 429) {
    console.error(`[OG] Quota/billing limit hit at article ${slug}. Stopping batch. Remaining articles skipped.`);
    process.exit(1);  // fail-fast so CI can surface the error
  }
}
```

Do NOT change the slug logic, the output directory, or the status file schema.

---

## Fix 2 — Regenerate OG images for 4 quality failures (SEO-002, HIGH)

**Context:** 4 articles have status `"failed"` (generated an image but it failed the quality check). Their OG prompts produce low-contrast or visually noisy results.

**Target articles and revised prompt guidelines:**
1. `como-calcular-sueldo-liquido` — Current prompt likely uses abstract money visuals. New direction: single, clear concept — a clean payroll stub document icon on a neutral background, bold Chilean peso symbol, no clutter.
2. `liquidacion-de-sueldo` — Similar issue. Direction: stylized document/paper with a magnifying glass, flat design, high contrast, navy + white palette.
3. `cuanto-descuenta-la-afp` — Direction: simple pie chart or donut chart icon showing a percentage slice, clean flat design, blue/green Chilean brand colors.
4. `como-cambiarse-de-afp` — Direction: two institution logos (generic abstract) with an arrow between them, flat iconographic style, no photorealism.

**Action:** Check whether the OG generation pipeline uses a per-article prompt file or inline prompts in `scripts/generate-og-jpegs.mjs`. Read the script to determine the prompt format, then:
- If prompts are per-file in `scripts/hero-images/`: update the 4 corresponding prompt files.
- If prompts are inline in the script: add/update per-slug override logic.
- After updating prompts, note that actual regeneration requires API quota to be restored (Fix 1 prerequisite). Document this dependency directly in the prompt file or as a comment in the script.

---

## Fix 3 — Resolve orphan articles (SEO-003, MEDIUM)

**Context:** 2 articles have zero inbound links from any other published article on the site. Before making edits, verify with `pnpm run check:links` or a grep to confirm each is still an orphan.

**Action:** Add `nextStepHref` and `nextStepLabel` to the frontmatter of the SOURCE articles listed below. Read each source file before editing. Add to the `articleLead` block if it exists, or add a minimal `articleLead` block with only `nextStepHref` and `nextStepLabel`.

| SOURCE article | Add link to TARGET | nextStepLabel |
|---|---|---|
| `src/data/blog/fondos-afp-a-b-c-d-e.md` | `/posts/como-cambiarse-de-afp/` | Cómo cambiarte de AFP paso a paso |
| `src/data/blog/que-es-el-apv.mdx` | `/posts/que-es-la-cuenta-2-afp/` | Cuenta 2 AFP: alternativa de ahorro voluntario |

Verify both target slugs exist in `src/data/blog/` before writing.

---

## Fix 4 — ETF cannibalization: scope differentiation (SEO-004, MEDIUM)

**Context:** `como-invertir-en-etfs-desde-chile.md` (the "how-to" guide) and one other ETF article compete for the same keyword intent. The audit identified this as a HIGH cannibalization pair.

**Action:**
1. Read `output/audit/seo-audit-20260408.md` to find both ETF article slugs in the cannibalization section.
2. Read both articles to understand their scope difference.
3. At the top of **each article** (after the first paragraph), add a scope disambiguation callout:

For the **how-to guide** (`como-invertir-en-etfs-desde-chile.md`):
```markdown
> **¿Qué cubre este artículo?** Esta guía explica el proceso paso a paso para comprar ETFs desde Chile. Si buscas entender qué son los ETFs y compararlos con fondos mutuos, lee [¿Qué es un ETF? Comparación con fondos mutuos](/posts/<other-etf-slug>/).
```

For the **explainer article** (the other ETF slug):
```markdown
> **¿Qué cubre este artículo?** Este artículo explica qué son los ETFs, sus ventajas y cómo se comparan con fondos mutuos. Si ya entiendes los ETFs y quieres empezar a invertir, lee [Cómo invertir en ETFs desde Chile](/posts/como-invertir-en-etfs-desde-chile/).
```

Do NOT rewrite existing sections — only add the scope callout.

---

## Fix 5 — Refresh Lighthouse performance data (SEO-005, MEDIUM)

**Context:** Lighthouse reports in `output/performance/lighthouse/` are >60 days old (last run Feb 2026).

**Action:** Run a fresh Lighthouse batch on the 3 most critical pages (home, a representative article, the sitemap):

```bash
pnpm run lighthouse -- --url https://monedario.cl --output output/performance/lighthouse/$(date +%Y%m%d)-home.json
pnpm run lighthouse -- --url https://monedario.cl/posts/como-calcular-sueldo-liquido/ --output output/performance/lighthouse/$(date +%Y%m%d)-article.json
```

If `pnpm run lighthouse` is not available, check `package.json` for the correct script name. If Lighthouse is not wired to pnpm scripts, note it as a gap to document in `docs/TECH_DEBT_BACKLOG.md` (severity 2).

Thresholds required (per `AGENTS.md` Rule 5.4): Mobile Performance ≥ 99, LCP ≤ 1.7s, Speed Index ≤ 3.0s, CLS = 0, TBT = 0ms.

---

## Fix 6 — Add HowTo schema to how-to articles (SEO-006, LOW)

**Context:** Articles structured as step-by-step guides are eligible for Google's HowTo rich result, which significantly increases CTR. The audit found 3 articles without this schema.

**Action:** Read `src/components/ArticleJsonLd.astro` (or wherever structured data is emitted). Check if a `HowTo` schema branch already exists. If not, add one triggered by a frontmatter flag (e.g., `schemaType: "HowTo"`) or by article category.

For each of the 3 target articles, add `schemaType: howto` to frontmatter (use the exact field name defined in `src/content.config.ts` — read it first):
1. `src/data/blog/como-calcular-sueldo-liquido.md`
2. `src/data/blog/boleta-honorarios-2026.md` (if it exists — verify the slug)
3. `src/data/blog/operacion-renta-f22-checklist.md` (if it has clear step structure — read it first)

Then in the schema component, emit a `HowTo` LD+JSON block when `schemaType === 'howto'`, extracting steps from the article's H2/H3 headings or from frontmatter-defined steps if available.

Validate structured data output with: `pnpm run build && node -e "..."` or manually check the built HTML for the `application/ld+json` block.

---

## Verification

After all fixes are complete:

```bash
pnpm run check:no-postid-urls
pnpm run check:routes
pnpm run check:links
pnpm run check:frontmatter
pnpm run build
```

All 5 must pass with 0 blocking errors. Post the output of each.

Additionally, inspect the built HTML for one article with `ogImageStatus !== "done"` and confirm it shows the fallback OG image URL.

---

## Change Control Record (AGENTS.md Rule 3.1)

1. **Scope:** In scope: `src/layouts/Layout.astro`, `scripts/generate-og-jpegs.mjs`, `src/data/blog/` (5 articles, frontmatter only), `src/components/ArticleJsonLd.astro`, `scripts/hero-images/` (4 prompt files). Out of scope: all other paths.
2. **Impacted modules:**
   - `src/layouts/Layout.astro` — OG fallback logic
   - `scripts/generate-og-jpegs.mjs` — quota guard
   - 5 `.md`/`.mdx` files — orphan nextStep + ETF scope callout + schema flag
   - `src/components/ArticleJsonLd.astro` — HowTo schema
3. **Invariant preservation:** `URL.PUBLIC.NO_POST_ID` (no post.id in URLs), `ROUTE.CANONICAL_SLUG_ONLY` (no slug changes), `SEO.STRUCTURED_DATA_VALID`. Verified by gates.
4. **Contract preservation:** No new required frontmatter fields added without Zod optional. Breaking changes: NO.
5. **Boundary integrity:** Layout.astro is infrastructure; importing a JSON file (hero-images-status.json) remains within Astro's static import boundary. Run `pnpm run check:boundaries` if in doubt.
6. **Test coverage:** No domain/application layer changes — no new tests required. If `ArticleJsonLd.astro` has unit tests, update them.
7. **Rollback:** Revert via `git checkout -- <file>`. No data migration. OG image fallback is additive.
8. **Regression risk:** MEDIUM for `Layout.astro` (affects every page). Validate with `pnpm run build` + spot-check 3 built HTML files. LOW for all other changes.
