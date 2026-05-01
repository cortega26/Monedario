# HEROIMAGE Prompt Regression Audit

Date: 2026-05-01  
Author: Codex audit session  
Scope: report-only audit of HeroImage prompt direction after latest generator/planner update  
Out of scope: regenerating assets, replacing assets, editing articles, changing scripts/docs

## 1. Executive diagnosis

Verdict: **should be frozen/reverted until redesigned.**

Direct answer to the main question:

> The latest HeroImage prompt direction changed from **human scene recognition** to **mechanism-first semantic diagrams**, while keeping and intensifying the same anti-AI flattening constraints. The result is not merely "cleaner" imagery. It is a prompt system that strips away the exact visual tools that make editorial scenes feel human, warm, memorable, and worth stopping for.

This is not a minor tuning problem. Repo evidence shows a strategic shift toward document/process/comparison diagrams, a much heavier negative-constraint stack, and a scoring system that still rewards flatness, simplicity, and compliance more than human appeal. That combination can absolutely explain why a human editor would reject every image after the update.

## 2. Timeline / version reconstruction

### Reconstructed evolution

| Date / evidence | What changed | Audit reading |
|---|---|---|
| Early migration script: `scripts/migrate-images.mjs` | Icon-only AVIF generation on solid backgrounds | Pre-v2 baseline prioritized technical cleanliness over editorial richness. |
| `scripts/migrate-images-v2.mjs` | Texture layer, icon rotation, palette rotation, still icon-first | v2 improved grid variety but remained fundamentally symbolic and cold. |
| `scripts/migrate-images-v3.mjs` and `docs/operations/reports/migrations/FEATURED_IMAGE_MIGRATION_REPORT.md` | Introduced Templates A/B/C, narrative icons, expanded palette, abstract characters | v3 explicitly tried to fix v2 coldness by adding scenes and emotional recognizability. |
| 2026-04-15: `context/EDITORIAL_IMAGE_SYSTEM.md` header | `Version: 3.5`, `Last updated: 2026-04-15` | Official doctrine says credibility now comes from closeness and recognition, not sobriety alone. |
| 2026-04-15: commit `41f0c71d` | Manual-final-asset workflow; automatic generation disabled in normal commands | Operational change, not the regression itself. |
| 2026-04-25: `context/EDITORIAL_AI_PIPELINE.md` | Human editor remains final sign-off; mixed enforcement remains explicit | Human rejection is still the intended terminal quality gate. |
| 2026-04-30: commit `3fe9e06c` | `feat: Refactor hero image prompt system and implement deterministic scene ID generation` | This is the likely regression inflection point. |
| 2026-04-30: `docs/backlog/HERO_IMAGE_SYSTEM_REMEDIATION_2026-04-30.md` | Explicit shift to hybrid YMYL direction and "semantic austerity" for sensitive topics | This document states the strategic move directly. |

### What changed on 2026-04-30

`context/EDITORIAL_IMAGE_SYSTEM.md` was changed in substance without changing the visible version header or last-updated line. The key doctrinal sentence moved from:

- "las imágenes representen situaciones, no conceptos"

to a hybrid rule where many topics should represent:

- "el mecanismo central"
- "documento o desglose visual"
- "comparación, statement o flujo"
- "calendario, checklist o secuencia"

This is the core strategic turn.

### Current generator-state evidence

- Previous prompt library (`git show 41f0c71d:scripts/hero-images/prompts.json`): 35 of 43 prompts used a `geometric human figure`; only 1 Template A prompt was object-only.
- Current prompt library (`scripts/hero-images/prompts.json`): only 4 of 43 prompts use a `geometric human figure`; 32 of 36 Template A prompts are now object-only.
- Template counts did **not** materially change: still 36 Template A + 7 Template C.
- Therefore the regression is not "Template B took over." The regression is worse: **Template A was hollowed out from inside and converted into mechanism diagrams while still wearing the label of a scene template.**

### Uncertainty

- Repo evidence does **not** include a structured archive of rejected generated outputs.
- Repo evidence does **not** include a formal acceptance-rate dashboard for hero images.
- Therefore this audit cannot prove rejection per individual slug. It can prove a plausible and strong mechanism for systematic rejection, and the prompt/library evidence is sufficient to treat the editor signal as credible.

## 3. Prompt constraint audit

The official doctrine lives in `context/EDITORIAL_IMAGE_SYSTEM.md` section 12, but the actual generated prompts in `scripts/hero-images/prompts.json` go even further. The table below classifies the constraint language that now shapes outputs.

| Constraint | Classification | Diagnosis |
|---|---|---|
| `geometric shapes only` | Useful but over-applied | Good anti-photorealism guardrail. Bad when read literally enough to kill gesture, material contrast, and scene character. |
| `no gradients` | Useful but over-applied | Safe default for backgrounds. Harmful as an absolute ban on any tonal modulation. It pushes every image toward sticker-flatness. |
| `no shadows` | Likely regression driver | Removes grounding, overlap, and atmosphere. Section 6.1 of the visual system even allows one simple shadow, but prompt outputs prohibit all shadows. |
| `no highlights` | Likely regression driver | Eliminates focal emphasis and visual hierarchy. |
| `no depth` | Likely regression driver | Turns scenes into diagrams. A scene without depth is not a scene; it is a layout of symbols. |
| `3 colors maximum` | Useful but over-applied | Good for compression and consistency. Too strict when the goal is warmth or editorial nuance. |
| `flat uniform background only` | Useful but over-applied | Safe for anti-AI control. Overused, it removes atmosphere and foreground/background separation. |
| `no extra objects` | Useful but over-applied | Reasonable clutter control. Applied rigidly, it removes context and consequence. |
| `all elements within central 80%` | Essential technical constraint | Valid crop/safe-area rule. Not the regression by itself. |
| `no facial features` | Ambiguous / needs human decision | Good anti-AI safeguard for some cases. Absolute enforcement erases emotional recognizability. |
| `shown from behind` | Likely regression driver | This removes eye-line, expression, and human connection. It was used in 34 previous prompts; current system largely removed humans entirely instead of solving this problem. |
| `simple circle for head, rectangles for body` | Likely regression driver | As a hard prompt phrase, it invites generic clipart anatomy instead of editorial illustration. |
| `no decorative framing` | Candidate for relaxation | Some framing can add hierarchy and card distinction without becoming clutter. |
| `low cognitive load` / `under 2 seconds` | Useful but over-applied | Fast recognition matters. Making it primary turns editorial imagery into infographics. |
| `low friction` / anti-UI / anti-dashboard warnings | Useful but over-applied | Good as a backstop. Bad as the dominant design philosophy. |

### Constraints that drifted beyond the official visual doctrine

The prompt layer is more severe than the broader system:

- `context/EDITORIAL_IMAGE_SYSTEM.md` section 5.3 says gradients are "No recomendado," not forbidden in all cases.
- Section 6.1 allows "máximo una sombra sólida simple a 15% de opacidad."
- The generated prompts still enforce `No shadows, no highlights, no depth, no soft shading, and no translucent surfaces.` across the library.

That is not neutral implementation. That is a stricter aesthetic doctrine than the system prose admits.

### Mechanical prompt drift

24 object-only Template A prompts still inherit composition copy written for human scenes, including `figure placed left-of-center`. This is not just a wording mistake. It shows the planner is mass-producing object diagrams inside a scene-template shell.

## 4. Missing positive direction

The current prompt system is rich in prohibitions and poor in positive editorial instruction.

What it consistently fails to ask for:

- A recognizable **human situation**, not just a financial mechanism.
- A visible **moment**: before decision, during doubt, after consequence, or at the point of relief.
- **Gesture**: hands, posture, orientation, and object handling that imply tension or intent.
- **Warmth** without sentimentality: controlled softness, not only prohibition.
- **Visual hierarchy** built through overlap, depth separation, or one permitted tonal cue.
- **Foreground/background relationship** that feels like a cover illustration instead of a schematic.
- **Curiosity**: one visual question that makes the user want to read the headline.
- **Distinctiveness inside the grid** beyond changing the object in the center.

Concrete prompt language that is missing:

- "Show a recognizable financial moment, not only the mechanism."
- "Let one human gesture explain the emotional stakes."
- "Use one dominant focal object and one supporting contextual cue that implies consequence."
- "Create separation between foreground and background through overlap, scale, or one controlled shadow block."
- "The image should feel like an editorial cover illustration, not a process diagram."
- "At thumbnail size, it should spark recognition first and explanation second."
- "Differentiate this card from adjacent cards through composition rhythm, not only through icon substitution."

What the current system asks instead:

- `Use only...`
- `Do not add...`
- `Avoid...`
- `not a UI panel`
- `not a floating checklist`
- `not a dashboard`
- `not a to-do app`

Those lines are defensive. They prevent bad outputs. They do not instruct the model how to make a good one.

## 5. Rubric capture diagnosis

Yes. The evaluation system rewards the wrong things.

### Evidence

The current manual quality rubric in `docs/operations/runbooks/hero-images-runbook.md` scores only:

1. `BACKGROUND`
2. `STYLE`
3. `TEXT`
4. `ELEMENTS`
5. `COMPOSITION`
6. `INDUSTRY`
7. `SIMPLICITY`

Pass threshold: **5 / 7**.

Human appeal is absent. Warmth is absent. Editorial value is absent. Memorability is absent. Tension is absent.

The deprecated automatic evaluator in `scripts/hero-images/pipeline.mjs` uses the same philosophy:

- flat solid background
- max 3 elements
- flat 2D only
- clean right-third empty space
- zero text
- clearly personal finance
- understandable in under 2 seconds
- pass at `score >= 5`

### Why this is a capture problem

A sterile payroll diagram can pass because it is:

- flatter,
- cleaner,
- text-free,
- semantically explicit,
- less noisy,
- easier to classify.

That same image can still fail the real editorial job because it is:

- visually lifeless,
- emotionally unreadable,
- indistinct in a grid,
- not worth stopping for.

The rubric structurally over-scores compliance and under-scores appeal. It does not merely omit warmth. It **teaches the operator to treat warmth as optional.**

### Overclaiming problem

`docs/operations/reports/migrations/FEATURED_IMAGE_MIGRATION_REPORT.md` says the site "perfectly adheres to the v3 emotional & technical requirements" and foregrounds an average image size of 7.26 KB. That report overclaims emotional success without any stored human-validation evidence.

## 6. Human rejection evidence

Input fact from the editor:

- After the latest prompt update, the human editor reports rejecting **all** generated images.

This is valid editorial evidence, not noise.

Why:

- `context/EDITORIAL_AI_PIPELINE.md` keeps the `HumanEditor` as the final publication decision role.
- `context/EDITORIAL_IMAGE_SYSTEM.md` section 13.6 explicitly states that text-image correspondence is still enforced through a mixed model: artifact + human review.
- Repeated rejection across a batch is not random taste drift. It is the expected detection mechanism when automated controls optimize the wrong proxy.

In editorial visual systems, consistent human rejection means one of two things:

1. the prompts no longer encode the real taste/quality target, or
2. the rubric is passing outputs that the publication does not actually want.

This audit finds both.

## 7. Regression mechanism

Likely mechanism:

> The updated planner tells the model to represent the article's mechanism with precise, article-specific diagrams, while the anti-AI prompt stack removes nearly every visual tool that makes a scene feel human. The model solves the task by producing low-risk, low-noise, semantically explicit diagrams. They are technically compliant and editorially dead.

The mechanism is visible in four linked moves:

1. **Doctrine shift**
   - The system moved from "situations, not concepts" to "mechanism-first" for many sensitive topics.

2. **Scene depletion**
   - Previous prompt library: 35/43 human-figure prompts.
   - Current prompt library: 4/43 human-figure prompts.

3. **Constraint intensification**
   - Current prompts add pervasive `zero gradient`, `zero texture`, `zero noise`, `zero glow`, `no shadows`, `no highlights`, `no depth`, `Use only`, `Avoid`.

4. **Rubric mismatch**
   - The scoring system still rewards what got stricter: simplicity, flatness, clarity, cleanliness.

This is how the system produces "technically correct, emotionally inert" images at scale.

## 8. Recommended immediate action

**Freeze latest prompt direction.**

Specific action:

- Stop replacing any legacy hero asset using the current 2026-04-30 prompt direction.
- Stop treating the current `scripts/hero-images/prompts.json` as production-safe for new redraw batches.
- Keep existing approved legacy assets in place unless a human explicitly asks for a one-off replacement.
- Require adversarial human review before any prompt from the current planner is used to replace a published image.

Do **not** run a bulk redraw from the current library. The repo already has qualitative evidence that the current direction is failing in practice.

## 9. Proposed v4 direction

Compact replacement principle:

> Monedario hero images should be **editorial cover illustrations**, not compliance diagrams. Start from a recognizable human moment or a consequential financial mechanism, then render it with a controlled vector language that preserves trust without erasing warmth.

Operational v4 direction:

- Keep flat/vector discipline, but allow **one controlled depth cue**: overlap, a tonal shift, or a single soft shadow block.
- Allow **4-5 colors when needed** instead of enforcing 3 as a default ceiling.
- Keep `no fake text`, `no photorealism`, `no cripto/neon`, `no clutter`.
- Split the system into two explicit tracks:
  - `Human Editorial Scene`: person + gesture + one consequential object + one contextual cue.
  - `Editorial Mechanism`: document/process/comparison visual, but with a situational anchor so it still reads like an editorial image, not a wireframe.
- For mechanism-heavy topics, require one of these anchors:
  - human trace,
  - consequential gesture,
  - before/after tension,
  - scale contrast,
  - diagnostic focus point.
- Evaluate grid distinctiveness intentionally. A prompt should not be approved if it becomes "another flat rectangle with a symbol."

## 10. New scoring rubric

Hard fail rule:

> If **Human Appeal < 6/10**, the image fails regardless of semantic clarity or negative-friction control.

Weighted rubric:

| Criterion | Weight | Pass question |
|---|---:|---|
| Human appeal | 25% | Would a human editor call this worth publishing as a card image? |
| Editorial value | 20% | Does it feel like a cover illustration for a serious article, not a diagram stub? |
| Scene / tension quality | 15% | Is there a readable moment, consequence, comparison, or stake? |
| Memorability / grid differentiation | 15% | Would it still stand out next to five adjacent Monedario cards? |
| Trust / YMYL fit | 10% | Is it serious, non-sensational, and non-AI-looking? |
| Semantic clarity | 10% | Can the topic be recognized quickly without reading the title? |
| Negative friction control | 5% | Does it avoid fake text, clutter, neon, stock-photo drift, and obvious AI artifacts? |

Additional gate rules:

- `Human Appeal < 6/10` = fail.
- `Editorial Value < 6/10` = fail.
- `Trust / YMYL Fit < 7/10` = fail.
- The generator agent must never self-score the image alone. Scoring requires adversarial review.

## 11. Pilot plan

Recommend exactly these 3 articles for controlled redesign:

| Article | Why this is a good test case | Current / prompt failure likely affecting it | Visual direction to test |
|---|---|---|---|
| `como-hacer-presupuesto-mensual-chile` | Pure scene-first article about everyday financial behavior; best test of warmth and recognition | Current prompt turned it into a top-down desk arrangement. It explains budgeting tools, but it no longer feels like a person's budgeting moment. | `Human Editorial Scene`: one person mid-decision at a kitchen or home table, with visible sorting gesture and one supporting savings cue. |
| `como-calcular-sueldo-liquido` | Hybrid article: technical enough to need mechanism, human enough to need recognition | Current prompt became a strict payroll-flow diagram. It reads like an infographic block system, not a lived payroll question. | `Hybrid Scene + Mechanism`: person reviewing a payslip while one deduction-to-net flow is embedded in the composition, not isolated as a bare chart. |
| `informe-deudas-cmf-vs-dicom` | High-stigma comparison topic where trust and neutrality matter; strong test of editorial tension without melodrama | Current prompt neutralized drama by flattening the topic into overlapped report cards and a magnifier. It may be clear, but it risks looking generic and forgettable. | `Editorial Mechanism`: comparison anchored by one human investigative cue or diagnostic gesture so the image feels clarifying, not schematic. |

Pilot rules:

- Generate only these three.
- Score them with the new rubric.
- Review them side-by-side against the current assets and against each other at thumbnail size.
- Do not extrapolate to the rest of the site until the editor explicitly accepts the direction.

## 12. Non-goals

The next phase should **not**:

- regenerate all images;
- run a bulk migration;
- optimize only for file size;
- treat low cognitive load as the primary success metric;
- allow the same generator agent to self-score its own images without adversarial review.

## Appendix A — Files read

Governance / policy:

- `docs/AI_ENGINEERING_CONSTITUTION.md`
- `AGENTS.md`
- `docs/development/AGENT_EXECUTION_PROTOCOL.md`
- `context/EDITORIAL_AI_PIPELINE.md`
- `context/INVARIANTS.md`

Visual doctrine / reports:

- `context/EDITORIAL_IMAGE_SYSTEM.md`
- `docs/operations/reports/migrations/FEATURED_IMAGE_MIGRATION_REPORT.md`
- `docs/operations/runbooks/hero-images-runbook.md`
- `docs/backlog/HERO_IMAGE_SYSTEM_REMEDIATION_2026-04-30.md`

Image migration / hero-image scripts:

- `scripts/migrate-images.mjs`
- `scripts/migrate-images-v2.mjs`
- `scripts/migrate-images-v3.mjs`
- `scripts/check-images.mjs`
- `scripts/check-hero-images.mjs`
- `scripts/check-hero-prompts.mjs`
- `scripts/hero-images/build-prompts.mjs`
- `scripts/hero-images/prompt-plan.mjs`
- `scripts/hero-images/config.mjs`
- `scripts/hero-images/scan-articles.mjs`
- `scripts/hero-images/generate-images.mjs`
- `scripts/hero-images/manual-only.mjs`
- `scripts/hero-images/postprocess-images.mjs`
- `scripts/hero-images/apply-images.mjs`
- `scripts/hero-images/pipeline.mjs`
- `scripts/hero-images/prompts.json`

Tests / supporting evidence:

- `tests/scripts/hero-images-config.test.ts`
- `tests/scripts/check-hero-prompts.test.ts`
- `tests/scripts/hero-images-prompt-plan.test.ts`

Repo-history evidence:

- `git log` and `git diff` for `context/EDITORIAL_IMAGE_SYSTEM.md`, `scripts/hero-images/**`, and the migration report
- `git show 41f0c71d:scripts/hero-images/prompts.json`

## Appendix B — Evidence found

- The latest doctrinal shift happened on **2026-04-30** in commit `3fe9e06c`, but `context/EDITORIAL_IMAGE_SYSTEM.md` still displays `Last updated: 2026-04-15` and `Version: 3.5`.
- The doctrine explicitly changed from **situations over concepts** to **hybrid / mechanism-first** for many YMYL topics.
- Previous prompt library: **35/43** prompts had a human figure.
- Current prompt library: **4/43** prompts have a human figure.
- Current Template A library: **32/36** prompts are object-only.
- **24** object-only Template A prompts still inherit the stale composition phrase `figure placed left-of-center`.
- Current runbook rubric has **no human appeal criterion** and still passes at **5/7**.
- The migration report claims emotional success without stored human-validation evidence.

## Appendix C — Decision summary

Should the latest prompt direction be frozen? **Yes.**

Top 5 likely regression drivers:

1. The 2026-04-30 shift from scene recognition to mechanism-first imagery.
2. The collapse of human presence: 35/43 human-scene prompts down to 4/43.
3. Over-applied anti-AI constraints: zero gradients, zero texture, zero shadows, zero depth.
4. A planner that solves uniqueness with article-specific diagrams and negative constraints instead of editorial appeal.
5. A scoring rubric that rewards cleanliness and simplicity while ignoring human appeal.

Recommended next step:

- Freeze the current direction immediately, then design and test a **v4 two-track system** on the 3-article pilot above before any broader hero-image replacement resumes.
