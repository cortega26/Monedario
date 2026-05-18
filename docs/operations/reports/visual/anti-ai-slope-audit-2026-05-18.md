# Anti-AI-Slope Audit

Date: 2026-05-18  
Scope: report-only audit of representative website surfaces  
Author: Codex audit session

## Executive Verdict

Overall risk: **moderate, not critical**.

Monedario does not currently read like a generic AI-generated fintech site. The strongest signals are positive: the site is restrained, fast-looking, Chile-specific, and grounded in practical user situations. The calculator surface in particular feels functional rather than ornamental, and the sampled article has real editorial substance.

The main anti-AI-slope risk is **pattern fatigue**. Across the representative pages, many surfaces use the same combination of pale panels, rounded cards, uppercase micro-labels, compact badges, and generic trust phrases. That repetition can make otherwise useful pages feel assembled from the same template. The second risk is visual: the hero-image system has largely recovered human/editorial warmth, but listing surfaces can still feel homogenous when several teal/yellow illustrations or mechanism-like images appear together.

No `P1` trust-breaking issue was found in the sampled pages.

## Evidence Base

Rendered pages reviewed at desktop `1440x1000` and mobile `390x844`:

- `/`
- `/calculadoras/`
- `/calculadoras/sueldo-liquido/`
- `/guias/`
- `/guias/sueldo-remuneraciones/`
- `/posts/`
- `/posts/liquidacion-de-sueldo/`

Screenshot artifacts:

- `artifacts/audits/anti-ai-slope/2026-05-18/`

Static scan counts across `src/pages`, `src/components`, and `src/layouts`:

| Marker | Count |
|---|---:|
| `rounded-xl` | 141 |
| `rounded-2xl` | 14 |
| `rounded-full` | 35 |
| `tracking-widest` | 56 |
| `uppercase` | 108 |
| `bg-accent/5` | 58 |
| `bg-surface-muted` | 44 |
| `Sin registro` | 8 |

Reference constraints used:

- `docs/AI_ENGINEERING_CONSTITUTION.md`
- `docs/development/AGENT_EXECUTION_PROTOCOL.md`
- `context/EDITORIAL_IMAGE_SYSTEM.md`
- `docs/operations/reports/visual/HEROIMAGE_PROMPT_REGRESSION_AUDIT.md`

## Ranked Findings

### P2-01 - Repeated card/eyebrow/panel grammar makes distinct surfaces blur together

Affected surfaces: `/`, `/guias/`, `/guias/sueldo-remuneraciones/`, `/posts/liquidacion-de-sueldo/`, calculator follow-up sections.

Evidence:

- `src/components/ProblemCards.astro:57` uses uppercase/tracking eyebrow copy above a six-card grid.
- `src/pages/guias/index.astro:119` to `src/pages/guias/index.astro:129` repeats rounded cards with a pill label `Sección` and CTA `Ir a la sección`.
- `src/pages/guias/sueldo-remuneraciones/index.astro:131` to `src/pages/guias/sueldo-remuneraciones/index.astro:178` uses three similar rounded entry cards with uppercase micro-labels.
- `src/components/ArticleDecisionIntro.astro:36` to `src/components/ArticleDecisionIntro.astro:96` uses a rounded pale panel plus nested cards and uppercase labels.
- Static scan found 141 `rounded-xl`, 56 `tracking-widest`, and 108 `uppercase` markers.

Why this reads as AI-slope:

The pieces are individually clean, but the repeated pattern is a common AI/Codex UI default: small uppercase label, rounded bordered card, pale tinted panel, short paragraph, CTA. It reduces page-specific character and makes hubs, articles, and calculator support blocks feel like variants of one component prompt.

Recommended direction:

- Reserve uppercase micro-labels for places where they carry real taxonomy or safety value.
- Convert generic card groups into denser lists, tables, or decision rows where the task is navigational.
- Give each major surface one dominant local structure rather than repeating the same card grammar.

### P2-02 - Trust signals are useful but sometimes presented as repeated slogans

Affected surfaces: homepage and calculator header.

Evidence:

- `src/components/HeroHomepage.astro:60` to `src/components/HeroHomepage.astro:68` lists `Sin publicidad`, `Fuentes oficiales`, `Sin registro requerido`, `Legislación chilena vigente`, and last update.
- `src/components/CalculatorTrustBadge.astro:13` to `src/components/CalculatorTrustBadge.astro:21` repeats `Sin registro`, `Sin publicidad`, `Calculo local`, and `No almacenamos tus datos`.
- Static scan found `Sin registro` 8 times across sampled source areas.

Why this reads as AI-slope:

The claims are true and relevant, but repeated abstract trust chips can feel like generic SaaS credibility copy. Monedario is strongest when it shows proof: date of cutoff, source family, calculation locality, and editorial process.

Recommended direction:

- Keep the claims, but make them contextual: for calculators, foreground local computation and data non-storage; for articles, foreground cutoff date and source category.
- Avoid showing the same trust bundle on adjacent surfaces unless the user is about to enter data or make a YMYL decision.
- Prefer one proof-bearing sentence over several slogan-like chips.

### P2-03 - Guide hub pages risk becoming component inventories instead of editorial maps

Affected surfaces: `/guias/` and `/guias/sueldo-remuneraciones/`.

Evidence:

- `/guias/` renders many similar cards labeled `Sección`, each with `Ir a la sección`.
- `src/pages/guias/index.astro:117` to `src/pages/guias/index.astro:131` shows the repeated pattern.
- `/guias/sueldo-remuneraciones/` is more useful, but still repeats label-card blocks for entry cards, reading order, calculators, clarifications, and adjacent sections.

Why this reads as AI-slope:

AI-generated hubs often over-structure content with repeated cards because cards are easy to generate and visually safe. For a finance site, too many equal-weight cards make the page feel less like an expert map and more like an index dump.

Recommended direction:

- On `/guias/`, remove the `Sección` badge and make the page feel like a categorized directory.
- On topic hubs, keep the first decision row, but make later sections more compact.
- Use task language as structure: `Si tienes liquidación`, `Si quieres calcular`, `Si el problema cambió`, then avoid repeating type labels unless needed for disambiguation.

### P2-04 - Article/listing imagery is warmer than before, but grid variety is still fragile

Affected surfaces: `/`, `/posts/`, `/posts/liquidacion-de-sueldo/`.

Evidence:

- Homepage recent articles show three editorial illustrations with human presence or situational context.
- `/posts/liquidacion-de-sueldo/` uses a human + document scene, aligned with `context/EDITORIAL_IMAGE_SYSTEM.md` v4 scene-first direction.
- `/posts/` shows several large image cards in sequence; when multiple teal/yellow scenes appear together, the grid starts to feel same-family in a good way but close to same-template in a risky way.

Why this reads as AI-slope:

The current images avoid the worst AI markers: no glossy 3D, no neon fintech, no fake dashboard, no photoreal faces. The risk is subtler: repeated flat teal backgrounds, simplified people, document blocks, and large single-column image cards can make the archive look generated as a batch.

Recommended direction:

- Keep the v4 human/editorial scene direction.
- Audit image grids in groups, not only per image, because AI-slope appears through repetition.
- For future redraws, require adjacent-card differentiation: background rhythm, scale, gesture, and focal object should vary across a listing page.

### P3-01 - Generic CTAs weaken otherwise specific decision flows

Affected surfaces: guide index, next-step cards, calculator and hub cards.

Evidence:

- `src/pages/guias/index.astro:125` to `src/pages/guias/index.astro:129` uses `Ir a la sección`.
- `src/components/NextSteps.astro:89` to `src/components/NextSteps.astro:95` uses `Abrir` for all next-step cards.
- Calculator cards commonly use `Abrir calculadora`.

Why this reads as AI-slope:

Generic CTAs are not a visual defect, but they are a common sign of templated content. The surrounding copy is specific; the CTA often becomes less specific right at the action point.

Recommended direction:

- Replace generic CTAs with task-specific verbs where space allows: `Calcular líquido`, `Auditar liquidación`, `Revisar descuentos`, `Comparar AFP`.
- Keep generic `Abrir` only for low-priority fallback cards.

### P3-02 - Mobile homepage has useful content but creates stacking fatigue

Affected surface: `/` mobile.

Evidence:

- The mobile homepage stacks hero CTAs, trust signals, indicators, six problem cards, a calculator CTA, and three large article cards.
- The problem-card section is practical, but the six equal cards create a long uniform run before articles.

Why this reads as AI-slope:

Mobile AI layouts often become a long stack of identical cards. Monedario avoids excess ornament, but the uniformity still dulls the human editorial feel.

Recommended direction:

- Consider showing the top three problem cards first, with the rest behind a compact row/list.
- Let article imagery arrive sooner or reduce card height in the problem-card block.
- Preserve the user-situation framing; the issue is density, not intent.

## Page Scorecard

| Page | UI pattern risk | Copy risk | Visual risk | Chile-specific usefulness | Notes |
|---|---|---|---|---|---|
| `/` | Medium | Medium | Low-Medium | High | Strong practical entry; repeated trust chips and six-card stack create mild template feel. |
| `/calculadoras/` | Medium | Low | Low | High | Good index utility; family jump cards are plain and useful. |
| `/calculadoras/sueldo-liquido/` | Low-Medium | Low | N/A | High | Calculator feels functional and credible; downstream recommendation panels inherit card-pattern fatigue. |
| `/guias/` | Medium-High | Medium | N/A | Medium-High | Most template-like sampled page due repeated `Sección` badge cards. |
| `/guias/sueldo-remuneraciones/` | Medium | Low | N/A | High | Good decision logic, but many repeated label-card sections. |
| `/posts/` | Medium | Low | Medium | High | Strong content inventory; image grid needs adjacent-card variety checks. |
| `/posts/liquidacion-de-sueldo/` | Low-Medium | Low | Low-Medium | High | Best sampled editorial surface; article substance and official-source framing offset template risk. |

## Positive Patterns To Preserve

- The site uses a restrained palette and avoids the worst AI-fintech markers: glossy gradients, fake dashboards, neon, decorative metrics, and oversized hero spectacle.
- Calculator controls are practical and familiar. The salary calculator feels like a tool, not a marketing page.
- The sampled article copy is specific, sourced, and operational. It does not read like filler.
- The homepage problem framing is human: `Me contrataron`, `Tengo deudas`, and similar labels start from the reader's situation.
- The visual system is moving in the right direction: sampled article images include human or editorial anchors and avoid compliance-diagram sterility in the first viewport.

## Suggested Follow-Up Order

1. **Reduce global label/card repetition.** Start with `/guias/` and shared blocks that use `Sección`, uppercase eyebrows, and rounded cards without adding decision value.
2. **Make CTAs more task-specific.** This is a low-risk copy pass that would immediately reduce template feel.
3. **Contextualize trust claims.** Keep proof, reduce slogan repetition.
4. **Run an image-grid adjacency audit.** Score article images in the context of listing pages, not only individually.
5. **Revisit mobile homepage density.** Preserve the six user situations, but reduce the same-card run.

## Validation And Closure Notes

- Dev server used for rendered inspection: `pnpm run dev -- --host 127.0.0.1`.
- Screenshots captured with Playwright CLI into `artifacts/audits/anti-ai-slope/2026-05-18/`.
- Static scan performed with `rg` over `src/pages`, `src/components`, and `src/layouts`.
- Public interfaces changed: **none**.
- Source code/content/routes changed: **none**.
- Report-only artifact added: `docs/operations/reports/visual/anti-ai-slope-audit-2026-05-18.md`.

Rollback:

- Delete this report and the screenshot artifact directory.

