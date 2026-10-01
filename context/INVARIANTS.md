# Context Invariants Registry

Last updated: 2026-04-25
Status: Active

## 1. Introduction

An invariant is a non-negotiable condition that must hold after every change.

Authority order for this file:
1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `context/*.md`
4. Source code/comments

This file centralizes enforceable invariants only. It references canonical definitions instead of duplicating full constitutional text.

Related context docs:
- `context/CONTRACTS.md`
- `context/MODULE_INDEX.md`
- `context/CURRENT_STATE.md`

Change proposal protocol:
1. Reference affected invariant ID(s).
2. Explain reason and expected behavioral impact.
3. Update enforcement and detection evidence.
4. If architectural semantics change, create ADR in `docs/adr/`.

Change log:
- 2026-03-01: initial minimum viable registry for routing/URL/RSS/frontmatter guards.
- 2026-03-01: added enforceable editorial invariants and gates (`check:editorial-structure`, `check:dialect`).
- 2026-03-01: editorial hardening v2 (`NO_EMPTY_SECTIONS` raised to 8 real words, substantive H2 filtering, dialect exceptions).
- 2026-03-01: added SEO meta description editorial invariants (required + length + duplicate detection).
- 2026-03-02: added warning-first internal linking invariant with explicit frontmatter escape hatch.
- 2026-03-02: added cluster-awareness invariants (declared cluster, valid cluster registry, intra-cluster linking warning).
- 2026-03-02: formalized inter-cluster linking policy invariants (hub required, intra-cluster min-1 alias, inter-cluster max-per-edit) with human-enforced review boundaries.
- 2026-03-03: added editorial AI pipeline invariants (cut-off date, source traceability, separation of duties, math/compliance mandatory triggers).
- 2026-03-05: added hero-image publication invariant (published article requires resolvable hero image + canonical public asset).
- 2026-03-05: added hero-image semantic selection invariant (image choice must derive from article reading, not metadata-only matching).
- 2026-03-07: added inline article image format invariant (AVIF by default with justified exception allowlist).
- 2026-03-22: added editorial timeliness invariant and scheduled audit workflow.
- 2026-04-11: added competitive adaptation invariants for external benchmarking authority, differentiation, and ownership-before-expansion.
- 2026-04-12: added external link policy invariant (INVARIANT.URLCHECK.EXTERNAL_LINK_POLICY) and CI gate for official/trusted host validation; see ADR-20260412-external-link-ci-gate.
- 2026-04-25: updated INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES — role-identity framing replaced with agent-instance framing; added fresh-session requirement for same-family auditors; removed Gemini from canonical role examples; updated `context/EDITORIAL_AI_PIPELINE.md` with new role table (ChatGPT for ResearchAgent/MathAuditAgent; Claude Code fresh session for ComplianceAgent; Claude for all writing roles).
- 2026-09-29: added indexability contract invariant (`INVARIANT.SEO.INDEXABILITY.CONTRACT`) with build guards; see ADR-20260929-declarative-indexability-contract.
- 2026-09-29: added privacy invariant (`INVARIANT.PRIVACY.NO_FINANCIAL_EGRESS`) with `test:privacy` suite; see `docs/reports/AUDIT-PRIVACY-2026-09-29.md`.
- 2026-09-29: added resilience invariants (`INVARIANT.RESILIENCE.*`) with `test:resilience` suite; see `docs/reports/AUDIT-RESILIENCE-2026-09-29.md`.
- 2026-10-01: added risk-tier policy, registry and coverage/provenance gate (`INVARIANT.EDITORIAL.RISK_TIERS`); see `docs/editorial/RISK_TIERS.md`.

## 2. Invariant Index

| ID | Short name | Status | Gate/Enforcement |
|---|---|---|---|
| `URL.PUBLIC.NO_POST_ID` | Public URL identity without `post.id` | Active | `pnpm run check:no-postid-urls` |
| `ROUTES.NO_SILENT_CHANGES` | Public route deltas are detected | Active | `pnpm run check:routes` |
| `RSS.NO_REMOVALS` | RSS snapshot does not allow removals | Active | `pnpm run check:rss` |
| `FRONTMATTER.VALID` | Blog frontmatter meets required policy | Active | `pnpm run check:frontmatter` |
| `INVARIANT.STRATEGY.EXTERNAL_PATTERNS_NON_AUTHORITATIVE` | External patterns never replace official sources, public contracts, or canonical policies | Active (manual) | PR review + `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` |
| `INVARIANT.STRATEGY.DIFFERENTIATED_ADOPTION_REQUIRED` | Substantive adaptations must state the local improvement and explicit non-copy boundaries | Active (manual) | Task Brief + artifact review |
| `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION` | New visible/indexable surfaces require explicit ownership resolution before expansion | Active (manual) | PR review + ownership policy review |
| `INVARIANT.EDITORIAL.STRUCTURE_MIN` | Articles meet minimum structural shape | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.DIALECT_ES_CL` | Editorial dialect guard for Chilean Spanish | Active | `pnpm run check:dialect` |
| `INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED` | YMYL content must display explicit cut-off date | Active | Manual review + `context/EDITORIAL_AI_PIPELINE.md` |
| `INVARIANT.EDITORIAL.NO_UNSOURCED_NUMBERS` | Critical numbers require source traceability or explicit TODO marker before publish | Active | Manual review + MathAuditReport |
| `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` | Drafting cannot be audited/compliance-reviewed by the same agent role | Active | Manual review + publish packet role check |
| `INVARIANT.EDITORIAL.MATH_AUDIT_REQUIRED_WHEN_CALC` | Calculation-heavy content requires math audit before publish | Active | Manual review + `requires_calculation` gate in publish packet |
| `INVARIANT.EDITORIAL.COMPLIANCE_REVIEW_REQUIRED_WHEN_HIGH_RISK` | High regulatory sensitivity requires compliance report and human sign-off | Active | Manual review + `regulatory_sensitivity=alta` gate |
| `INVARIANT.EDITORIAL.RISK_TIERS` | Published articles and calculators declare R1–R4; R4 requires primary-source provenance and cut-off date | Active | `pnpm run check:risk-tiers` |
| `INVARIANT.EDITORIAL.NO_EMPTY_SECTIONS` | H2 sections cannot be empty | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.META_DESCRIPTION_REQUIRED` | Description metadata is mandatory | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.META_DESCRIPTION_LENGTH` | Description length stays in SEO range | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.META_DESCRIPTION_NO_DUPLICATES` | Description text cannot be duplicated | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.TITLE_REQUIRED` | Each article must define non-empty frontmatter title | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.TITLE_MEANINGFUL` | Title must be non-empty, specific, and non-generic | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.NO_MARKDOWN_H1` | Markdown body must not contain H1 headings | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.TITLE_SLUG_COHERENCE` | Title should overlap with significant slug terms | Active | `pnpm run check:editorial-structure` (warning) |
| `INVARIANT.EDITORIAL.INTERNAL_LINKS_MIN` | Articles should include minimum internal linking | Active | `pnpm run check:editorial` (warning) |
| `INVARIANT.EDITORIAL.CLUSTER_DECLARED` | Every article declares non-empty string `cluster` in frontmatter | Active (rollout) | `pnpm run check:editorial-structure` (warning-first) |
| `INVARIANT.EDITORIAL.CLUSTER_VALID` | `cluster` belongs to registered cluster set | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.TOPIC_OWNER_UNIQUENESS` | A cluster/topic cannot have two publishable `owner` pages | Active | `pnpm run check:frontmatter` |
| `INVARIANT.EDITORIAL.TOPIC_OWNERSHIP_METADATA_HARDENED_CLUSTERS` | Hardened clusters require ownership metadata | Active | `pnpm run check:frontmatter`, `pnpm run audit:topic-overlap` |
| `INVARIANT.EDITORIAL.CANONICAL_TOPIC_REGISTRY_HARDENED_CLUSTERS` | Hardened clusters must use registered canonical topics | Active | `pnpm run check:frontmatter`, `pnpm run audit:topic-overlap` |
| `INVARIANT.EDITORIAL.CLUSTER_INTERNAL_LINK_MIN` | Article should link to at least one same-cluster article | Active (Canonical) | `pnpm run check:editorial-structure` (warning) |
| `INVARIANT.EDITORIAL.LINKING.HUB_REQUIRED` | Clustered article should include a link to its hub `/guias/<cluster>/` | Active (manual) | PR review + `pnpm run check:editorial` |
| `INVARIANT.EDITORIAL.LINKING.INTRA_CLUSTER_MIN_1` | Alias for intra-cluster min rule | Deprecated (Alias) | Reference `INVARIANT.EDITORIAL.CLUSTER_INTERNAL_LINK_MIN` |
| `INVARIANT.EDITORIAL.LINKING.INTER_CLUSTER_MAX_2_PER_EDIT` | Inter-cluster links added in one edit should not exceed 2 per article | Active (manual) | PR review + `pnpm run check:editorial` |
| `INVARIANT.EDITORIAL.NO_DUPLICATE_TITLES` | Duplicate frontmatter titles are forbidden | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.NO_DUPLICATE_SLUGS` | Duplicate filename-derived slugs are forbidden | Active | `pnpm run check:editorial-structure` |
| `INVARIANT.EDITORIAL.TIMELINESS_REVIEW_SLA` | Published articles must remain within their configured review cadence | Active | `pnpm run check:editorial-timeliness` |
| `INVARIANT.EDITORIAL.HERO_IMAGE_PUBLISHED_REQUIRED` | Published article must have resolvable hero image and canonical public hero asset | Active | `node scripts/check-hero-images.mjs` |
| `INVARIANT.EDITORIAL.HERO_IMAGE_TEXT_MATCH_REQUIRED` | Hero image selection must derive from article text and preserve situation-level match | Active | `node scripts/check-hero-prompts.mjs` + artifact review |
| `INVARIANT.EDITORIAL.INLINE_IMAGE_AVIF_REQUIRED` | Inline article images must use AVIF unless explicitly justified | Active | `pnpm run check:images` |
| `INVARIANT.URLCHECK.EXTERNAL_LINK_POLICY` | External links to official/trusted hosts must resolve live within the expected host family | Active (phase 1 non-blocking) | `pnpm run check:urls:external:ci` |
| `INVARIANT.SEO.INDEXABILITY.CONTRACT` | Path-based indexability is declared in one contract consumed by Layout, sitemap and utility pages | Active | `pnpm run build` (check-postbuild guards) + `pnpm run test` |
| `INVARIANT.PRIVACY.NO_FINANCIAL_EGRESS` | Financial inputs/results never leave the browser (URL, requests, cookies, identifiers) | Active | `pnpm run test:privacy` |
| `INVARIANT.RESILIENCE.CONTENT_WITHOUT_JS` | Essential content renders without JavaScript | Active | `pnpm run test:resilience` |
| `INVARIANT.RESILIENCE.CALC_LOCAL_DEPS` | Calculator runtime has no third-party/API dependencies | Active | `pnpm run test:resilience` |
| `INVARIANT.RESILIENCE.INPUT_STATE_COHERENT` | Result matches current inputs; invalid required input never yields a valid-looking result; submit is idempotent | Active | `pnpm run test:resilience` |
| `INVARIANT.RESILIENCE.SAVED_STATE_ISOLATED` | Blocked/unavailable storage never breaks the calculation | Active | `pnpm run test:resilience` |

## 3. Invariants

### `URL.PUBLIC.NO_POST_ID`

- Statement: Public URL identity is derived from `slug`, never from `post.id`.
- Canonical source: `docs/AI_ENGINEERING_CONSTITUTION.md` (`URL.PUBLIC.NO_POST_ID`, sections 2.3 and 4.3).
- Rationale:
  - Decouples public identity from technical content IDs.
  - Prevents runtime SEO regressions from implementation details.
  - Keeps route strategy stable across internal refactors.
- Enforcement: `pnpm run check:no-postid-urls` (primary), `pnpm run check:routes` (regression guard).
- Detection:
  - Compliant output includes: `[check-no-postid-urls] OK. Scanned <N> source files...`
  - Failure output includes: `[check-no-postid-urls] Found <N> forbidden pattern(s):` and exit code `1`.
- Examples:
  - Compliant: `getCanonicalPathFromSlug(article.slug)`
  - Violation: `` `/posts/${post.id}/` ``

### `ROUTES.NO_SILENT_CHANGES`

- Statement: Route removals are blocking; route additions or no-change states are always surfaced by the route comparison gate.
- Canonical source: `AGENTS.md` Rule 3.2 + scripts `snapshot-routes`/`compare-routes`.
- Rationale:
  - Prevents accidental disappearance of public URLs.
  - Makes route expansion explicit in CI/local checks.
  - Preserves deterministic route baseline management.
- Enforcement: `pnpm run check:routes`.
- Detection:
  - No delta: `[compare-routes] No route changes detected.`
  - Additions (non-blocking): `[compare-routes] Added routes: <N>`
  - Blocking condition: `[compare-routes] Removed routes detected:` with exit code `1`.
- Examples:
  - Compliant: Add one new post route; command reports `Added routes: 1`.
  - Violation: Existing route missing from snapshot; command fails on removed routes.

### `RSS.NO_REMOVALS`

- Statement: RSS link removals against baseline are forbidden; additions are allowed and reported.
- Canonical source: scripts `rss-to-json` and `compare-rss`; policy aligned with AGENTS route-impact verification.
- Rationale:
  - Protects feed continuity for subscribers and aggregators.
  - Allows growth without blocking new publication entries.
  - Makes feed diffs explicit and auditable.
- Enforcement: `pnpm run check:rss`.
- Detection:
  - Blocking condition: `[compare-rss] Removed items detected (<N>):` with exit code `1`.
  - Allowed addition: `[compare-rss] Added items (<N>) are allowed:`
  - Compliant summary: `[compare-rss] OK. baseline=<N> current=<N> removed=0 added=<N>`
- Examples:
  - Compliant: New item appears in RSS; command reports `added=1`.
  - Violation: Baseline link disappears; command fails with removed items.

### `FRONTMATTER.VALID`

- Statement: Every blog entry frontmatter must satisfy required fields/types and block deprecated fields.
- Canonical source: `scripts/check-frontmatter.mjs`; domain references in `docs/domain/CONTENT/INVARIANTS.md` (INV-001..INV-014).
- Rationale:
  - Keeps content contract machine-valid for build/runtime.
  - Prevents schema drift from deprecated editorial keys.
  - Enforces explicit publish metadata (`slug`, `category`, dates).
- Enforcement: `pnpm run check:frontmatter` (also included in `pnpm run check` and `pnpm run build`).
- Detection:
  - Blocking condition: `[check-frontmatter] Errors: <N>` with exit code `1`.
  - Non-blocking quality output: `[check-frontmatter] Warnings: <N>`
  - Compliant summary: `[check-frontmatter] OK (no blocking errors).`
- Examples:
  - Compliant: article defines `slug`, `category`, `pubDate` with timezone, valid types.
  - Violation: missing `slug` or use of deprecated `canonicalURL`.

### `INVARIANT.STRATEGY.EXTERNAL_PATTERNS_NON_AUTHORITATIVE`

- Statement: External benchmarks may inform structure or packaging, but they must never replace official sources, public contracts, or canonical internal policies as the basis for correctness.
- Canonical source: `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`, `docs/editorial/NORMA_YMYL.md`.
- Rationale:
  - Prevents benchmark-driven drift from overriding repo truth sources.
  - Preserves YMYL reliability where only official sources can support critical claims.
  - Keeps strategic inspiration subordinate to constitutional and contract constraints.
- Enforcement: Manual review via Task Brief, dossier, publish packet, and PR notes (warning-first).
- Detection:
  - Benchmark observations are explicitly separated from official sources.
  - YMYL claims still point to official/primary sources, not competitor pages.
  - Missing separation or benchmark-as-authority treatment is a policy violation.
- Examples:
  - Compliant: use competitor layout as input, but cite SII/SPensiones for the rule itself.
  - Violation: justify a tax rule because “other sites explain it that way”.

### `INVARIANT.STRATEGY.DIFFERENTIATED_ADOPTION_REQUIRED`

- Statement: Every substantive benchmark-informed adaptation must explicitly state what is improved, simplified, or reordered locally, plus what will not be copied.
- Canonical source: `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`, `AGENTS.md`.
- Rationale:
  - Prevents shallow imitation with no local advantage.
  - Makes the adaptation reviewable as a product/editorial decision instead of taste.
  - Creates a durable record of why the pattern belongs in this repo.
- Enforcement: Manual review through Task Brief fields, editorial artifacts, and change control appendix.
- Detection:
  - Required fields include `localDelta` and `nonCopyBoundaries`.
  - Missing or empty differentiation statement is a policy violation.
  - “Improve later” without a defined local delta is non-compliant.
- Examples:
  - Compliant: adopt a comparison widget pattern but simplify decision branches for Chilean users.
  - Violation: “we copied the competitor flow because it works”.

### `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`

- Statement: No new visible or indexable surface may expand into an existing canonical owner space without an explicit ownership decision.
- Canonical source: `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`, `docs/editorial/NON_CANNIBALIZATION_PROCESS.md`, `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`.
- Rationale:
  - Prevents benchmark-inspired expansion from creating internal cannibalization.
  - Protects the site's owner/support/reference/tool architecture before new surfaces are added.
  - Forces differentiation decisions to happen before publication or implementation.
- Enforcement: Manual review through ownership policy review and publish packet/PR review (warning-first).
- Detection:
  - New owner-like surface must declare `ownerTarget`.
  - If ownership conflict exists and is unresolved, work must halt.
  - Publish packet or PR notes must record the ownership decision for adjacent surfaces.
- Examples:
  - Compliant: reframe a new support article under an existing owner after overlap review.
  - Violation: publish a “better” second head-term page without redefining canonical ownership.

### `INVARIANT.EDITORIAL.STRUCTURE_MIN`

- Statement: Every article must have at least two substantive non-TOC H2 sections, non-empty meta description, and valid publication date.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Enforces a minimum readable structure for long-form content.
  - Avoids publishing entries without basic SEO/document metadata.
  - Keeps editorial quality checks deterministic and fast.
- Enforcement: `pnpm run check:editorial-structure` (included in `pnpm run check` through `check:editorial`).
- Detection:
  - Blocking output starts with: `[check-editorial-structure] FAIL:`
  - Blocking condition includes: fewer than 2 substantive H2 sections after excluding trivial headings (`Introduccion`, `Resumen`, `Conclusion`, `Cierre` variants).
  - Passing output starts with: `[check-editorial-structure] OK.`
- Examples:
  - Compliant: article with frontmatter `title/description/pubDate`, and 2+ substantive non-TOC `##` sections.
  - Violation: article with only `## Introducción` and `## Conclusión`.

### `INVARIANT.EDITORIAL.TITLE_REQUIRED`

- Statement: Every article must define a non-empty `title` in frontmatter.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Frontmatter `title` is the source of truth for rendered public H1.
  - Prevents publishable entries without clear top-level intent.
  - Keeps H1 policy aligned with Astro Paper rendering model.
- Enforcement: `pnpm run check:editorial-structure`.
- Detection:
  - Blocking condition: `title_missing>0`.
  - Passing output includes: `title_missing=0`.
- Examples:
  - Compliant: frontmatter includes `title: "..."`.
  - Violation: missing/blank `title`.

### `INVARIANT.EDITORIAL.TITLE_MEANINGFUL`

- Statement: `title` must be specific and non-generic (`Artículo`, `Post`, `Guía`, `Contenido`, case-insensitive), and contain at least `4` real words.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Blocks placeholder titles that degrade clarity and SEO.
  - Enforces a minimal semantic signal for article intent.
  - Keeps checks deterministic without NLP tooling.
- Enforcement: `pnpm run check:editorial-structure`.
- Detection:
  - Blocking condition: `title_meaningless>0`.
  - Failure examples include: `title is not meaningful` with word count below threshold or blacklisted generic text.
- Examples:
  - Compliant: `title: "Cómo calcular tu sueldo líquido en Chile"`.
  - Violation: `title: "Guía"` or `title: "Post"`.

### `INVARIANT.EDITORIAL.NO_MARKDOWN_H1`

- Statement: Markdown body must not contain H1 headings (`# ...`), because public H1 is rendered from `frontmatter.title`.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Prevents accidental double-H1 output in rendered article HTML.
  - Keeps Markdown hierarchy clean (starts at H2 and below).
  - Aligns editorial source with runtime heading strategy.
- Enforcement: `pnpm run check:editorial-structure`.
- Detection:
  - Blocking condition: `markdown_h1_present>0`.
  - Failure output includes: `contains <N> markdown H1 heading(s); markdown H1 is forbidden...`.
- Examples:
  - Compliant: body starts with prose and `## ...` sections, no `# ...`.
  - Violation: body contains one or more `# ...` headings outside code fences.

### `INVARIANT.EDITORIAL.TITLE_SLUG_COHERENCE`

- Statement: `title` must have basic coherence with article slug: at least one significant slug token (hyphen split, simple stopwords removed) should appear in `title`.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Preserves minimum topical alignment between URL identity and article title.
  - Flags drift where title and slug describe different intents.
  - Keeps validation lightweight and deterministic.
- Enforcement: `pnpm run check:editorial-structure` (warning-only).
- Detection:
  - Warning condition: no overlap between significant slug tokens and title tokens.
  - Warning counter: `title_slug_warning=<N>`; non-blocking (exit code unaffected by this invariant alone).
- Examples:
  - Compliant: slug `como-calcular-sueldo-liquido` and title containing `calcular` or `sueldo`.
  - Warning: slug tokens and title tokens have zero overlap.

### `INVARIANT.EDITORIAL.INTERNAL_LINKS_MIN`

- Statement: Cada artículo debe incluir al menos `1` link interno relevante.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Refuerza navegación interna entre contenidos relacionados.
  - Mejora señales de autoridad temática y descubrimiento SEO interno.
  - Mantiene una validación editorial liviana y determinista.
- Enforcement: `pnpm run check:editorial` (`check:editorial-structure` warning-only; no bloqueante).
- Detection:
  - Warning condition: `internal_links_warning=<N>` cuando el artículo tiene menos de `1` link interno.
  - Escape hatch explícito: frontmatter `internalLinks: ignore` o `internal_links: ignore`.
  - Skip counter: `skipped_internal_links=<N>`.
  - Diseño desacoplado de runtime: el gate no importa `src/**`; `SITE_HOSTNAME` (env) es opcional para contar absolutos del mismo host.
  - Si `SITE_HOSTNAME` no está definido, solo links relativos (`/`, `./`, `../`) cuentan como internos.
  - Exit code: este invariante no falla el comando por sí solo (warning-first).
- Notes:
  - Política warning-first, candidata a endurecerse a bloqueante en una fase futura.
- Examples:
  - Compliant: artículo con link markdown interno relativo (por ejemplo, `/ruta`, `./ruta`, `../ruta`).
  - Warning: artículo sin links internos y sin escape hatch.

### `INVARIANT.EDITORIAL.TOPIC_OWNER_UNIQUENESS`

- Statement: Dentro del mismo `cluster`, solo una URL publicable puede declarar `topicRole: owner` para un mismo `canonicalTopic`.
- Canonical source: `scripts/check-frontmatter.mjs`, `docs/editorial/NON_CANNIBALIZATION_PROCESS.md`.
- Rationale:
  - Evita double-owners que compiten por la misma necesidad primaria.
  - Convierte ownership editorial en una regla verificable, no solo documental.
  - Mantiene la detección con muy bajo falso positivo porque depende de metadata explícita.
- Enforcement: `pnpm run check:frontmatter`.
- Detection:
  - Blocking output includes: `Duplicate topic owner for "<cluster>::<canonicalTopic>"`.
  - Exit code: `1`.
- Examples:
  - Compliant: una sola pieza `owner` para `sueldo-remuneraciones::calcular-sueldo-liquido`.
  - Violation: dos artículos publicados con `topicRole: owner` y el mismo `canonicalTopic`.

### `INVARIANT.EDITORIAL.TOPIC_OWNERSHIP_METADATA_HARDENED_CLUSTERS`

- Statement: Los artículos publicados en clusters endurecidos (`sueldo-remuneraciones`, `pensiones-afp`, `ahorro-e-inversion`, `uf-costo-de-vida`) deben declarar `topicRole` y `canonicalTopic`.
- Canonical source: `scripts/check-frontmatter.mjs`, `scripts/audit-topic-overlap.mjs`.
- Rationale:
  - Añade fricción real donde la canibalización ya fue observada o el cluster tiene más riesgo de deriva.
  - Limita el costo editorial al subconjunto donde el retorno es alto.
  - El corpus endurecido ya está anotado, por lo que mantenerlo warning-only solo dejaba una incoherencia contractual.
- Enforcement:
  - `pnpm run check:frontmatter` (blocking)
  - `pnpm run audit:topic-overlap`
- Detection:
  - Blocking output includes: `must declare both "topicRole" and "canonicalTopic"`.
  - Exit code: `1`.
- Examples:
  - Compliant: artículo publicado en `pensiones-afp` con `topicRole` y `canonicalTopic`.
  - Violation: artículo publicado en `ahorro-e-inversion` sin metadata de ownership.

### `INVARIANT.EDITORIAL.CANONICAL_TOPIC_REGISTRY_HARDENED_CLUSTERS`

- Statement: En clusters endurecidos, `canonicalTopic` debe pertenecer al registro central definido en `src/config/editorial-topic-policy.mjs`.
- Canonical source: `src/config/editorial-topic-policy.mjs`, `scripts/check-frontmatter.mjs`, `scripts/audit-topic-overlap.mjs`.
- Rationale:
  - El formato kebab-case por sí solo no evita variantes casi equivalentes para la misma necesidad.
  - Un registro chico por cluster reduce drift sin introducir NLP ni taxonomías pesadas.
  - Hace auditable la incorporación de nuevos topics endurecidos.
- Enforcement:
  - `pnpm run check:frontmatter`
  - `pnpm run audit:topic-overlap`
- Detection:
  - Blocking output includes: `Unregistered canonicalTopic`.
  - Audit warning output includes: `canonicalTopic="<topic>" is not registered`.
- Examples:
  - Compliant: `ahorro-e-inversion::interes-compuesto-caso`.
  - Violation: `ahorro-e-inversion::interes-compuesto-2026` si no está en el registro.

### `INVARIANT.EDITORIAL.INLINE_IMAGE_AVIF_REQUIRED`

- Statement: Inline images embedded in article bodies must use `.avif` by default; non-AVIF formats are allowed only through an explicit justified exception declared in frontmatter.
- Canonical source: `scripts/check-images.mjs`, `src/content.config.ts`, `docs/adr/ADR-20260307-inline-article-image-avif-gate.md`.
- Rationale:
  - Prevents stale or ad-hoc image formats from bypassing editorial/media guardrails.
  - Keeps article-body media policy deterministic and reviewable.
  - Forces exceptions to be documented instead of silently tolerated.
- Enforcement: `pnpm run check:images`.
- Detection:
  - Blocking output includes: `inline image "<src>" must use .avif`.
  - Blocking output includes unresolved local paths and unused exception entries.
  - Passing output includes: `[check:images] ✅ All blog images pass format and size constraints.`
- Examples:
  - Compliant: `![Grafico](/images/posts/demo/chart.avif)`
  - Compliant exception: frontmatter `inlineImageExceptions` entry for `/images/posts/demo/legacy-chart.webp` with a concrete `reason`.
  - Violation: inline `.webp`, `.png`, remote image, or missing local image without matching justified exception.

### `INVARIANT.EDITORIAL.CLUSTER_DECLARED`

- Statement: Every article should declare frontmatter `cluster` as non-empty string scalar.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Makes thematic architecture explicit in machine-readable metadata.
  - Prevents silent editorial drift outside declared topical clusters.
  - Enables deterministic cluster-level CI verification.
- Enforcement: `pnpm run check:editorial-structure`.
- Detection:
  - Current phase (warning-first rollout): `cluster_missing>0` is reported as warning and does not block by itself.
  - Failure output includes: `missing required "cluster"` or `"cluster" must be a string scalar`.
  - Summary includes: `cluster_missing=<N>`, `cluster_with_value=<N>`, `cluster_coverage_pct=<N>`.
- Rollout / Sunset Policy:
  - This invariant becomes blocking when `cluster_coverage_pct >= 95` for 2 consecutive PRs, or when repository coverage reaches `100%`.
  - Coverage metric source is the `check:editorial-structure` summary counters.
- Examples:
  - Compliant: frontmatter contains `cluster: ahorro-inversion`.
  - Violation: missing, blank, list/object, boolean/number `cluster`.

### `INVARIANT.EDITORIAL.CLUSTER_VALID`

- Statement: When `cluster` is declared, its value must be registered either by folder under `src/pages/guias/` or explicit listing in `context/MODULE_INDEX.md`.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Aligns article-level metadata with canonical thematic architecture.
  - Prevents ad-hoc cluster names with no navigational/structural backing.
  - Keeps cluster vocabulary auditable and centralized.
- Enforcement: `pnpm run check:editorial-structure`.
- Detection:
  - Blocking condition: `cluster_invalid>0`.
  - Failure output includes: `"cluster" value "<value>" is not registered...`.
  - Summary includes: `cluster_invalid=<N>`.
- Examples:
  - Compliant: `cluster` matches a valid registry entry.
  - Violation: `cluster` value not present in folder/index registry.

### `INVARIANT.EDITORIAL.CLUSTER_INTERNAL_LINK_MIN`

- Status: Active (Canonical)
- Aliases:
  - `INVARIANT.EDITORIAL.LINKING.INTRA_CLUSTER_MIN_1` (deprecated alias)
- Statement: Each article with valid cluster assignment should include at least `1` internal markdown link to another article in the same cluster.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Reinforces topical authority through explicit intra-cluster linkage.
  - Supports discoverability and crawl depth within thematic groups.
  - Provides measurable cluster cohesion without runtime coupling.
- Enforcement: `pnpm run check:editorial-structure` (warning-first).
- Detection:
  - Warning condition: `cluster_link_warning=<N>` when intra-cluster links are below minimum.
  - Counting policy:
    - Uses existing internal-link rules (relative links + same-host absolutes when `SITE_HOSTNAME` is set).
    - Ignores fenced code blocks and images.
    - Counts links only when target article shares identical cluster and is not self-link.
  - Exit behavior: warning-only (non-blocking) while `cluster_missing=0` and `cluster_invalid=0`.
- Examples:
  - Compliant: article links to at least one `/posts/<slug>/` in same cluster.
  - Warning: article has zero same-cluster internal links.

### `INVARIANT.EDITORIAL.LINKING.HUB_REQUIRED`

- Statement: Todo artículo con `frontmatter.cluster` debe incluir al menos un link al hub canónico de su clúster (`/guias/<cluster>/`).
- Rationale:
  - Mantiene conexión explícita entre nivel artículo y nivel hub.
  - Mejora discovery temático sin depender de navegación incidental.
  - Evita islas de contenido dentro de clústeres.
- Enforcement (humano):
  - Revisión de PR obligatoria: validar presencia de link hub cuando se crea o edita artículo clusterizado.
  - Referencia canónica de política: `context/INTER_CLUSTER_LINKING.md`.
- Detection:
  - Señal de salud editorial general: `pnpm run check:editorial`.
  - Verificación puntual en diff del artículo editado (link `/guias/<cluster>/` visible en contenido).
- Examples:
  - Compliant: artículo `cluster: deuda-credito` contiene link a `/guias/deuda-credito/`.
  - Violation: artículo clusterizado sin ningún link al hub de su propio clúster.

### `INVARIANT.EDITORIAL.LINKING.INTRA_CLUSTER_MIN_1`

- Status: Deprecated (Alias)
- Canonical ID: `INVARIANT.EDITORIAL.CLUSTER_INTERNAL_LINK_MIN`
- Reason: Avoid duplication and semantic drift.
- Behavior: No operational difference; reference canonical ID moving forward.
- Notes:
  - Keep this alias only for backward-compatible reading of previous PR discussions.
  - New references must use the canonical ID.

### `INVARIANT.EDITORIAL.LINKING.INTER_CLUSTER_MAX_2_PER_EDIT`

- Statement: En una sola edición de artículo, los links inter-cluster agregados no deben exceder `2`.
- Rationale:
  - Previene link stuffing y desvío temático por optimización SEO mecánica.
  - Obliga a priorizar links inter-cluster por necesidad real de lectura.
  - Mantiene una relación señal/ruido estable para usuarios y buscadores.
- Enforcement (humano):
  - Regla de revisión de PR: contar links inter-cluster añadidos por artículo en el diff.
  - Requiere justificación causal (prerrequisito, dependencia de decisión o mitigación de riesgo).
- Detection:
  - `pnpm run check:editorial` para validar integridad editorial general.
  - Inspección manual del diff para confirmar que `inter-cluster added <= 2` por artículo.
- Examples:
  - Compliant: se agrega 1 link a otro clúster por dependencia de decisión.
  - Violation: en una sola edición se agregan 3+ links inter-cluster sin necesidad causal explícita.

### `INVARIANT.EDITORIAL.NO_DUPLICATE_TITLES`

- Statement: Duplicate `frontmatter.title` values are forbidden (exact match after normalization).
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Prevents internal SEO cannibalization between articles.
  - Reduces ambiguous intent clustering in listings/search.
  - Keeps editorial identity unique and deterministic.
- Enforcement: `pnpm run check:editorial-structure`.
- Detection:
  - Normalization: `trim` + whitespace collapse + `toLowerCase`.
  - Blocking condition: `duplicate_titles>0`.
  - Failure output includes: `duplicate title "<normalized>"` and affected files.
- Examples:
  - Compliant: all titles normalize to unique values.
  - Violation: two or more files share same normalized title.

### `INVARIANT.EDITORIAL.NO_DUPLICATE_SLUGS`

- Statement: Duplicate slugs are forbidden.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Prevents URL identity collisions in content modeling.
  - Avoids ambiguous route/canonical semantics across entries.
  - Keeps slug strategy deterministic and auditable.
- Enforcement: `pnpm run check:editorial-structure`.
- Detection:
  - Slug source: filename without extension.
  - Blocking condition: `duplicate_slugs>0`.
  - Failure output includes: `duplicate slug "<slug>"` and affected files.
- Examples:
  - Compliant: unique filename-derived slug per article.
  - Violation: two files derive the same slug.

### `INVARIANT.EDITORIAL.TIMELINESS_REVIEW_SLA`

- Statement: Every published article must have a deterministic review date and remain within the review cadence configured by the editorial timeliness policy, unless its resolved `sourceMode` is `evergreen` — in which case no cadence SLA applies, but a deterministic review date is still required. Calendar freshness is not factual verification: a passing run (`stale=0`) certifies cadence compliance only, never that the hard facts are true; veracity relies on volatile datasets, `articleLead.officialSources`, the legal/economic gates and independent adversarial audit rounds.
- Canonical source: `src/config/editorial-timeliness-policy.json`, `scripts/check-editorial-timeliness.mjs`, `docs/adr/ADR-20260322-editorial-timeliness-pipeline.md`, `docs/adr/ADR-20260701-editorial-evergreen-tier.md`.
- Rationale:
  - Prevents volatile editorial values from drifting silently after publication.
  - Turns periodic review from tribal memory into an auditable pipeline rule.
  - Aligns machine-refreshable snapshots and human-reviewed editorial claims under one freshness discipline.
  - Exempts genuinely atemporal content from a recurring SLA that would otherwise dilute the signal for articles that do carry real drift risk.
  - Makes explicit that the calendar gate alone cannot certify YMYL correctness, so `stale=0` is never reported as factual verification.
- Enforcement: `pnpm run check:editorial-timeliness`; scheduled workflow `editorial-timeliness-audit.yml`.
- Detection:
  - Passing output includes: `[check-editorial-timeliness] OK.`
  - Blocking output includes: `[check-editorial-timeliness] FAIL:` plus stale or missing review-date entries.
  - Artifact output: `output/validation/editorial-timeliness/report.json`.
- Examples:
  - Compliant: published article with `articleLead.validAsOf` or `updatedDate`, official sources when required by source mode, and review window still open.
  - Compliant: published article with `sourceMode: evergreen` resolved via `slugOverrides`, a deterministic review date, and no `volatileData` entries — never marked stale regardless of age.
  - Violation: published article whose review date is older than the configured cadence, or a source-assisted article with no official sources.
  - Violation: published article with `sourceMode: evergreen` that also declares `volatileData` — the two are mutually exclusive.

### `INVARIANT.EDITORIAL.VOLATILE_DATA_ALIGNMENT`

- Statement: Published articles that declare strict volatile datasets must remain aligned with the registered snapshot value and its material-change date.
- Canonical source: `src/config/editorial-volatile-data-registry.json`, `src/infrastructure/editorial/editorial-volatile-data.snapshot.json`, `scripts/refresh-editorial-volatile-data.mjs`, `scripts/check-editorial-timeliness.mjs`, `docs/adr/ADR-20260322-editorial-volatile-data-pipeline.md`.
- Rationale:
  - Prevents silently stale numeric claims after a source dataset changes.
  - Makes volatile editorial maintenance explicit at article level instead of relying on body-text memory.
  - Connects scheduled source refreshes to blocking editorial verification.
- Enforcement: `pnpm run check:editorial-timeliness`; scheduled refresh workflow `refresh-economic-snapshot.yml`.
- Detection:
  - Blocking output includes `volatileData "<id>" changed on <date>` when a strict article lags the dataset.
  - Blocking output includes `expectedValue=<x> does not match snapshot value=<y>` when a strict article declares a stale number.
  - Artifact output remains `output/validation/editorial-timeliness/report.json`.
- Examples:
  - Compliant: article declares `volatileData` for AFP Uno commission with `expectedValue: 0.46` and review date at or after the snapshot trigger date.
  - Violation: article still declares `0.49` after the official snapshot moved to `0.46`.

### `INVARIANT.EDITORIAL.HERO_IMAGE_PUBLISHED_REQUIRED`

- Statement: Every published article (`draft !== true`) must define a resolvable `heroImage` and have a canonical public hero asset in `public/images/hero/<slug>.avif|.webp`.
- Canonical source: `scripts/check-hero-images.mjs`, `context/EDITORIAL_IMAGE_SYSTEM.md`.
- Rationale:
  - Avoids published entries without visual identity.
  - Guarantees deterministic social/card rendering availability.
  - Keeps image contract auditable and CI-enforced.
- Enforcement: `node scripts/check-hero-images.mjs`.
- Detection:
  - Blocking condition: missing/invalid `heroImage` in published article frontmatter.
  - Blocking condition: missing canonical public asset by slug.
  - Blocking condition: unsupported extension or file size budget violation.
- Examples:
  - Compliant: publishable article with valid `heroImage` and existing `public/images/hero/<slug>.avif`.
  - Violation: publishable article with missing hero image or missing canonical public asset.

### `INVARIANT.EDITORIAL.HERO_IMAGE_TEXT_MATCH_REQUIRED`

- Statement: Every new or refreshed hero image must follow a reviewed reading of
  the complete article and match its reader need, editorial promise and intended
  message; metadata or keyword matching alone cannot approve a selection.
- Canonical source: `context/EDITORIAL_IMAGE_SYSTEM.md` (v5, §§3–5).
- Rationale:
  - Prevents generic finance imagery and materially misleading interpretations.
  - Makes article→brief→prompt→selected-image decisions traceable.
  - Allows distinct scenes within a coherent visual identity without forcing a
    decorative person or a closed legacy scene catalog.
- Enforcement: `node scripts/check-hero-prompts.mjs` checks reviewed briefs,
  source/brief/prompt hashes and prompt integrity; `check:image-curation` checks
  the recorded selection against current prompt/source/asset bytes. Recorded
  visual review by the authorized curator checks the final scene. These controls
  do not replace YMYL auditing.
- Detection:
  - Evidence identifies `readerNeed`, `editorialPromise`, `visualMessage`,
    `scene`, `requiredElements`, `avoidInterpretations` and review metadata.
  - Missing/unreviewed briefs or drift in the full editorial input block prompts.
  - The copied prompt must equal the validated prompt; hidden additions fail.
  - Reject a final image that misstates the article, is interchangeable with a
    different topic, or carries fabricated financial data or institutional cues.
- Examples:
  - Compliant: a payroll article uses a reviewed payslip scene because its body
    teaches how deductions connect to the deposit; review confirms that message.
  - Violation: a banking comparison receives a cesantía scene merely because its
    text mentions sueldo, even if the image is visually polished.

### `INVARIANT.EDITORIAL.DIALECT_ES_CL`

- Statement: Editorial source must not contain blacklisted rioplatense voseo forms (for example: `calculá`, `invertí`, `podés`, `querés`) outside controlled exceptions.
- Canonical source: `scripts/check-dialect.mjs`.
- Rationale:
  - Preserves dialect consistency with target audience (`es-CL`).
  - Prevents style drift in iterative content updates.
  - Keeps tone checks explicit and machine-enforceable.
- Enforcement: `pnpm run check:dialect` (included in `pnpm run check` through `check:editorial`).
- Detection:
  - Blocking output starts with: `[check-dialect] FAIL:`
  - Allowed exceptions:
    - Blockquote lines (`> ...`) are ignored.
    - Whole-file opt-out is allowed with `<!-- dialect-ignore -->` in the first 10 lines.
  - Passing output starts with: `[check-dialect] OK.`
- Examples:
  - Compliant: `puedes comparar costos antes de invertir`.
  - Violation: `podés comparar costos antes de invertir`.

### `INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`

- Statement: Every YMYL article must include a visible cut-off date (`Fecha de corte`) in public-facing content.
- Canonical source: `context/EDITORIAL_AI_PIPELINE.md`, `docs/editorial/NORMA_YMYL.md`.
- Rationale:
  - Prevents temporal ambiguity in sensitive financial/legal guidance.
  - Makes freshness limits explicit for readers and reviewers.
  - Reduces risk of stale-rule interpretation.
- Enforcement: Manual review (current phase), tied to YMYL editorial pipeline publish gate.
- Detection:
  - Required evidence in `07-publish-packet.md`: cut-off date value + location in final article.
  - Missing visible date blocks publication.
- Examples:
  - Compliant: visible block `Fecha de corte: 2026-03-03`.
  - Violation: YMYL article with no explicit cut-off date.

### `INVARIANT.EDITORIAL.NO_UNSOURCED_NUMBERS`

- Statement: Every critical numeric claim must include source traceability; draft-phase unresolved numbers must be marked `TODO:SOURCE`.
- Canonical source: `context/EDITORIAL_AI_PIPELINE.md`, `CONTRACT.EDITORIAL.MATH_AUDIT_REPORT`.
- Rationale:
  - Prevents unsupported numerical claims in YMYL content.
  - Creates deterministic reviewer workflow for citation closure.
  - Improves credibility and auditability of published numbers.
- Enforcement: Manual review via math audit and publish packet (current phase).
- Detection:
  - `05-math-audit.md` must map each critical number to source/recalculation status.
  - `07-publish-packet.md` must declare unresolved `TODO:SOURCE = 0` for publish-ready state.
- Examples:
  - Compliant: claim includes source link or citation ID tied to dossier.
  - Violation: critical number without source and without `TODO:SOURCE` marker.

### `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`

- Statement: `DraftAgent` must not be the same agent instance as `MathAuditAgent` or `ComplianceAgent` for the same editorial run. When the DraftAgent and an audit role share the same model family, the auditor must operate in a fresh session with zero exposure to the draft context or conversation history.
- Canonical source: `context/EDITORIAL_AI_PIPELINE.md`.
- Rationale:
  - Reduces self-verification bias in sensitive YMYL content.
  - Enforces independent control points before publication.
  - Makes review accountability explicit and auditable.
  - A fresh-session same-family auditor (e.g. Claude Code with no prior draft context) is genuinely independent because it cannot unconsciously confirm what it generated.
- Enforcement: Manual review-enforced (role and session declaration in artifact bundle).
- Detection:
  - `07-publish-packet.md` must include a role identity map declaring the tool and session for each stage, and an explicit statement that DraftAgent ≠ MathAuditAgent ≠ ComplianceAgent by agent instance.
  - For same-family auditors, the fresh-session requirement must be documented (e.g. "new Claude Code terminal session, no prior draft context loaded").
  - Any undeclared role collision blocks publication.
- Examples:
  - Compliant: `draft_agent=claude`, `math_audit_agent=chatgpt`, `compliance_agent=claude-code-fresh-session`.
  - Compliant: `draft_agent=claude`, `compliance_agent=claude-code-fresh-session` (same family, but fresh session documented).
  - Violation: `draft_agent=claude` and `compliance_agent=claude` in the same continuous session.
  - Violation: `draft_agent` and `math_audit_agent` produced in the same ChatGPT conversation thread.

### `INVARIANT.EDITORIAL.MATH_AUDIT_REQUIRED_WHEN_CALC`

- Statement: If brief declares `requires_calculation=true`, publication requires a completed math audit report.
- Canonical source: `context/EDITORIAL_AI_PIPELINE.md`, `CONTRACT.EDITORIAL.BRIEF`, `CONTRACT.EDITORIAL.MATH_AUDIT_REPORT`.
- Rationale:
  - Prevents publication of unverified calculations.
  - Forces explicit numerical validation on formula-driven content.
  - Aligns YMYL quality control with calculation risk.
- Enforcement: Manual gate in publish packet (current phase).
- Detection:
  - `01-brief.yaml` includes `requires_calculation`.
  - When value is `true`, `05-math-audit.md` must exist and include verdict.
  - Missing report blocks publication.
- Examples:
  - Compliant: tax/AFP calculation article with complete math audit.
  - Violation: `requires_calculation=true` and no math audit artifact.

### `INVARIANT.EDITORIAL.COMPLIANCE_REVIEW_REQUIRED_WHEN_HIGH_RISK`

- Statement: If brief declares `regulatory_sensitivity=alta`, publication requires compliance report and explicit human sign-off.
- Canonical source: `context/EDITORIAL_AI_PIPELINE.md`, `CONTRACT.EDITORIAL.COMPLIANCE_REPORT`.
- Rationale:
  - Adds legal/regulatory safety control for high-risk YMYL updates.
  - Prevents automated publication without policy/legal sanity check.
  - Makes accountability explicit for sensitive guidance.
- Enforcement: Manual gate in publish packet (current phase).
- Detection:
  - `01-brief.yaml` includes `regulatory_sensitivity`.
  - When value is `alta`, `06-compliance.md` plus `HumanEditor` approval must be present in `07-publish-packet.md`.
  - Missing evidence blocks publication.
- Examples:
  - Compliant: high-risk article with compliance findings and human approval.
  - Violation: high-risk article published without compliance artifact or sign-off.

### `INVARIANT.EDITORIAL.NO_EMPTY_SECTIONS`

- Statement: Substantive non-TOC H2 sections cannot be empty; each must have at least `8` real words after removing whitespace, code blocks, and images.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Prevents placeholder headings shipped without body content.
  - Reduces regressions from partial/unfinished edits.
  - Allows deterministic enforcement without NLP/LLM tooling.
- Enforcement: `pnpm run check:editorial-structure`.
- Detection:
  - Blocking output includes: `section "<title>" has only <N> words (min 8, excluding code/images)`
  - Passing output starts with: `[check-editorial-structure] OK.`
- Examples:
  - Compliant: `## Costos` followed by paragraph/list/table with substantive text.
  - Violation: `## Costos` immediately followed by another `##` heading.

### `INVARIANT.EDITORIAL.META_DESCRIPTION_REQUIRED`

- Statement: Every article must define a non-empty meta description.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Ensures every published entry has snippet-ready SEO metadata.
  - Avoids ambiguous or empty previews in search surfaces.
  - Keeps metadata enforcement deterministic in editorial pipelines.
- Enforcement: `pnpm run check:editorial-structure` (included by `pnpm run check:editorial`).
- Detection:
  - Blocking output includes: `missing or empty "description"`
  - Summary counter: `missing=<N>`
- Examples:
  - Compliant: frontmatter contains `description: "..."`.
  - Violation: frontmatter missing `description` or with blank value.

### `INVARIANT.EDITORIAL.META_DESCRIPTION_LENGTH`

- Statement: Meta description length (trimmed) must be at least `70` Unicode characters, with hard maximum `200`; the recommended band is `70..155`, while `156..200` is allowed with warning.
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Keeps snippets concise while preserving enough context.
  - Reduces truncation risk on common search result layouts.
  - Provides objective and testable editorial boundary.
- Enforcement: `pnpm run check:editorial-structure`.
- Detection:
  - Blocking output includes: `description too short` or `description too long (... hard max 200)`
  - Non-blocking warning output includes: `description length <N> exceeds recommended max 155`
  - Summary counters: `short=<N>`, `long_fail=<N>`, `long_warning=<N>`
- Examples:
  - Compliant: description length `136`.
  - Warning-only: description length `183`.
  - Violation: description length `52` or `221`.

### `INVARIANT.EDITORIAL.META_DESCRIPTION_NO_DUPLICATES`

- Statement: Meta descriptions must be unique by normalized exact match (`toLowerCase` + `trim` + internal whitespace collapse).
- Canonical source: `scripts/check-editorial-structure.mjs`.
- Rationale:
  - Prevents template-like duplication across distinct articles.
  - Improves SEO differentiation and SERP clarity.
  - Keeps duplicate detection deterministic and fast.
- Enforcement: `pnpm run check:editorial-structure`.
- Detection:
  - Blocking output includes: `duplicate description: "<normalized>" -> <file list>`
  - Summary counter: `duplicates=<N>`
- Examples:
  - Compliant: each article has unique normalized description.
  - Violation: two files share the same normalized description text.

### `INVARIANT.URLCHECK.EXTERNAL_LINK_POLICY`

- Statement: External links in published articles to `official_source` and `trusted_reference` hosts must resolve to a live, non-soft-404 page within the expected host family.
- Canonical source: `docs/adr/ADR-20260412-external-link-ci-gate.md`, `scripts/urlcheck/host-registry.mjs`.
- Rationale:
  - YMYL editorial credibility depends on official source links being live and correct.
  - Redirect hijacking (link silently redirects to a different institution) erodes trust.
  - Soft-404 pages appear as 200 OK to automated Tools but deliver no content to readers.
- Enforcement:
  - `pnpm run check:urls:external:ci` (whole-site blocking PR gate).
  - `pnpm run check:urls:external:audit` (nightly trend audit).
  - Both enforced via `scripts/check-urls-external.mjs`.
- Detection:
  - Per-result `blocking: true` when `host_category` is `official_source` or `trusted_reference` AND `classification` is `hard_fail`, `soft_404`, or `host_mismatch`.
  - Blocking exit: `[check-urls-external] FAIL: external_blocking_failures_detected:count=N`.
  - Non-blocking classes (`brand_profile`, `share_endpoint`, `known_soft_nonblocking`, `unknown`) are written to artifacts but never exit non-zero.
- Self-origin rule: `monedario.cl` and `www.monedario.cl` absolute URLs are excluded from external checks (treated as internal-equivalent).
- Rollout state: Phase 2 – `external-url-check-pr` blocks merge when the engine emits any `blocking=true` result; transient network failures remain non-blocking.
- Examples:
  - Compliant: `https://www.bcentral.cl/estadisticas/` returns 200 with normal Banco Central content.
  - Violation: `https://www.bcentral.cl/publicacion-antigua/` returns 200 with "Página no encontrada" title.
  - Violation: `https://www.sii.cl/old-doc/` returns 404.

### `INVARIANT.SEO.INDEXABILITY.CONTRACT`

- Statement: Path-based indexability (meta robots and sitemap inclusion) is declared once in `src/config/indexability.ts` and consumed by `Layout.astro`, `astro.config.ts` and `search.astro`; pages must not hardcode `noindex` metas.
- Canonical source: `docs/adr/ADR-20260929-declarative-indexability-contract.md`, `docs/reports/AUDIT-SEO-2026-09-28.md` (sistémico 1).
- Rationale:
  - Dispersed indexability produced SEO-01 (tags accidentally indexable).
  - The sitemap must remain `canonical ∩ indexable ∩ successful`.
  - One rule table makes guardrails derivable and reviewable.
- Enforcement:
  - `pnpm run build` → `check-postbuild` guards: `tags-noindex`, `utilitarias-noindex`, `sitemap-indexable-only`, `sitemap-canonical-match`, `no-tracking-params`, `no-future-lastmod`.
  - `pnpm run test` — contract rules and guard helpers.
- Exceptions (documented, outside the contract): `unlisted` posts (`PostDetails.astro` + `SITEMAP_EXCLUDED_PATHS`) and social image routes (`X-Robots-Tag` headers).
- Examples:
  - Compliant: `robotsMetaFor("/tags/afp/")` → `noindex,follow`; `/tags/**` excluded from `sitemap-0.xml`.
  - Violation: a page rendering `<meta name="robots" content="noindex">` inline instead of relying on the contract.

### `INVARIANT.PRIVACY.NO_FINANCIAL_EGRESS`

- Statement: Los inputs y resultados financieros de las calculadoras (sueldo, deuda, saldo, monto, impuesto) no pueden aparecer en URLs, requests salientes, cookies ni identificadores; la telemetría solo transporta eventos categóricos allowlisted.
- Canonical source: `docs/reports/AUDIT-PRIVACY-2026-09-29.md`, `docs/adr/ADR-20260628-first-party-analytics.md`, `src/contracts/analytics-events.ts`.
- Rationale:
  - El usuario espera razonablemente que sus cifras permanezcan locales (YMYL).
  - Una regresión en analytics, una librería nueva o una calculadora nueva podrían degradar la propiedad en silencio.
- Enforcement:
  - `pnpm run test:privacy` (canarios financieros, contrato de analytics, escenarios, metamórfico de 20 montos).
  - Worker `workers/analytics-collector` rechaza claves desconocidas (`rejectUnknown`) y el cliente solo construye payloads allowlisted.
  - `pnpm run check:headers:prod` cubre CSP/headers defensivos en producción (defensa en profundidad).
- Detection:
  - Fallo de `test:privacy`: canario en URL/request/cookie/storage o payload divergente entre montos.
  - Payload de analytics con claves fuera del allowlist.
- Examples:
  - Compliant: `{"event":"calculator_complete","params":{"calculator_id":"sueldo-liquido","outcome":"success","mode":"bruto-a-liquido"}}` (202, sin montos).
  - Violation: cualquier request con `?sueldo=…` o un body que contenga el monto introducido.

### `INVARIANT.RESILIENCE.CONTENT_WITHOUT_JS`

- Statement: el contenido esencial (home, hubs, artículos) se renderiza sin JavaScript; en calculadoras, sin JS el formulario se muestra explícitamente no operativo con un aviso.
- Canonical source: `docs/reports/AUDIT-RESILIENCE-2026-09-29.md`, `src/layouts/Layout.astro` (fallback `<noscript>`).
- Enforcement: `pnpm run test:resilience` (RES-001..003/054 con `javaScriptEnabled: false`).
- Examples:
  - Compliant: artículo legible sin JS; calculadora con aviso "Esta calculadora necesita JavaScript…" y controles atenuados.
  - Violation: calculadora que parece operable sin JS y no responde.

### `INVARIANT.RESILIENCE.CALC_LOCAL_DEPS`

- Statement: el cálculo no depende de terceros, analytics, imágenes ni APIs externas en runtime; bloquearlos no cambia el resultado.
- Canonical source: `docs/reports/AUDIT-RESILIENCE-2026-09-29.md`; arquitectura de snapshots (plan 120 / ADR de snapshot).
- Enforcement: `pnpm run test:resilience` (RES-004..006 con rutas abortadas).
- Examples:
  - Compliant: cálculo correcto con terceros/analytics/imágenes bloqueados.
  - Violation: un resultado que deja de aparecer cuando falla un recurso no esencial.

### `INVARIANT.RESILIENCE.INPUT_STATE_COHERENT`

- Statement: el resultado corresponde a los inputs visibles actuales; un required vacío/espacio/0 no produce un resultado con apariencia válida; doble submit no duplica estado.
- Canonical source: `docs/reports/AUDIT-RESILIENCE-2026-09-29.md` (RES-01 verificado como no-defecto).
- Enforcement: `pnpm run test:resilience` (RES-010..025).
- Examples:
  - Compliant: input vacío → error visible + estado inválido; recalcular con otro monto cambia el resultado; reingresar el monto original reproduce el resultado.
  - Violation: `$0` presentado como resultado válido o resultado viejo con input nuevo.

### `INVARIANT.RESILIENCE.SAVED_STATE_ISOLATED`

- Statement: `localStorage`/`sessionStorage`/cookies bloqueados o lanzando excepciones no rompen el cálculo; el draft efímero no se mezcla con escenarios persistidos.
- Canonical source: `docs/reports/AUDIT-RESILIENCE-2026-09-29.md` (RES-035..037), `src/utils/resumeState.ts`.
- Enforcement: `pnpm run test:resilience` (RES-030..037 con storage lanzando y cookies bloqueadas).
- Examples:
  - Compliant: cálculo correcto con storage bloqueado; sesión nueva no restaura draft.
  - Violation: excepción de storage que impide calcular o restaura un resultado de otra sesión.
