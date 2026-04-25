# Monedario Phase 2 High-Value Roadmap 2026-04-24

Status: Waves 1–4 complete (2026-04-24) — Wave 5 next
Owner target: Monedario product, SEO, calculator UX, hubs, and editorial pipeline
Source benchmark: `/home/carlos/Documentos/monedario-dr-24042026-deepseek.md`

## 1. Purpose

This document is the self-contained implementation roadmap for the high- and
medium-value opportunities that were intentionally left outside the first
Monedario 2026 package.

The goal is to execute the next improvements in careful, auditable waves:

1. technical UX and SEO improvements that do not create new YMYL claims;
2. calculator journey improvements that do not change formulas;
3. glossary and interlinking improvements with explicit overlinking controls;
4. hub/pillar-page preparation using existing approved material first;
5. editorial pipeline preparation for high-demand YMYL opportunities.

This roadmap does not authorize publishing new YMYL content by itself.
Editorial publication requires the canonical editorial pipeline, official
sources, ownership review, and human sign-off where required.

## 2. Scope Declaration

In scope for this roadmap:

- homepage reorganization plan;
- search experience improvement plan;
- technical schema inventory and implementation plan;
- title/meta optimization inventory process;
- post-result calculator journey plan;
- glossary tooltip/inline-link plan;
- hub/pillar-page component and migration plan;
- editorial artifact preparation plan for high-demand YMYL opportunities;
- analytics and verification plan;
- rollback and closure criteria.

Out of scope for this roadmap:

- publishing new YMYL articles;
- changing calculator formulas or domain/application calculation logic;
- changing public URL identity;
- removing routes or RSS entries;
- adding heavy charting/tooltip dependencies in the first implementation pass;
- introducing invasive cookies, accounts, or PII capture;
- using the DeepSeek document as legal, tax, labor, pension, or financial
  authority.

Allowed operation type:

- documentation, technical planning, small UX/template implementation waves, and
  editorial artifact scaffolding.

Blocked operation type without a separate editorial package:

- new or substantively refreshed YMYL content in `src/data/blog/**` or new
  indexable YMYL pages.

## 3. Authority Check

Referenced invariants:

- `URL.PUBLIC.NO_POST_ID`
- `ROUTES.NO_SILENT_CHANGES`
- `RSS.NO_REMOVALS`
- `FRONTMATTER.VALID`
- `INVARIANT.STRATEGY.EXTERNAL_PATTERNS_NON_AUTHORITATIVE`
- `INVARIANT.STRATEGY.DIFFERENTIATED_ADOPTION_REQUIRED`
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`
- `INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`
- `INVARIANT.EDITORIAL.NO_UNSOURCED_NUMBERS`
- `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`
- `INVARIANT.EDITORIAL.MATH_AUDIT_REQUIRED_WHEN_CALC`
- `INVARIANT.EDITORIAL.COMPLIANCE_REVIEW_REQUIRED_WHEN_HIGH_RISK`

Referenced contracts:

- `CONTRACT.PUBLIC_URLS`
- `CONTRACT.ROUTES_SNAPSHOT`
- `CONTRACT.RSS_POLICY`
- `CONTRACT.FRONTMATTER_POLICY`
- `CONTRACT.ARTICLE_STRUCTURE`
- `CONTRACT.EDITORIAL.META_DESCRIPTION`
- `CONTRACT.YMYL_RESPONSE_STRUCTURE`

Preservation proof required after each implementation wave:

- public links must still use slug-based helpers or literal stable route
  constants, never `post.id`;
- route and RSS checks must report no removals;
- blog frontmatter checks must remain passing;
- editorial changes must not bypass `docs/editorial/NORMA_YMYL.md`;
- benchmark observations must remain separate from official sources.

## 4. Competitive Adaptation Appendix

- `benchmarkSet`: `/home/carlos/Documentos/monedario-dr-24042026-deepseek.md`.
- `patternHypothesis`: the benchmark identifies unmet value in clearer
  homepage orientation, better search discovery, calculator post-result actions,
  glossary integration, richer hubs, and demand-led editorial surfaces.
- `localDelta`: Monedario will adapt only the user need behind those patterns,
  using existing Astro components, existing hubs/calculators/glossary data, and
  the repository's YMYL governance instead of copying competitor structure or
  claims.
- `nonCopyBoundaries`: do not copy reader-facing text, claims, public URL
  structure, legal/tax/labor/pension assertions, or competitor information
  architecture verbatim.
- `ownerTarget`: homepage, `/buscar/`, calculator templates, glossary layer,
  existing `/guias/*` hubs, and editorial artifacts for future YMYL work.
- `successSignal`: higher exploration events, cleaner search usage, clicks on
  post-result actions, glossary link engagement, no duplicate schema, no URL/RSS
  regressions, and completed editorial artifacts before publication.
- `ownership conflict check`: every new visible/indexable YMYL surface must pass
  `docs/editorial/NON_CANNIBALIZATION_PROCESS.md` and
  `docs/editorial/TOPIC_OWNERSHIP_POLICY.md` before implementation.

## 5. Execution Model

This roadmap should be implemented in small waves. Each wave should have its
own change control record or ticket note, tests, and rollback statement.

Recommended order:

1. Wave 1: homepage, search, schema inventory, and title/meta proposal.
2. Wave 2: calculator post-result journeys and anonymous measurement.
3. Wave 3: glossary/interlinking layer.
4. Wave 4: reusable hub pattern and existing-hub consolidation.
5. Wave 5: editorial artifact scaffolding for strategic YMYL opportunities.

Do not combine Wave 5 publication with Waves 1-4 product work. Structural tasks
and content publication tasks must remain separate.

## 6. Wave 1: UX and Technical SEO Without New YMYL

### 6.1 Homepage

Target surfaces:

- `src/pages/index.astro`
- `src/components/HeroHomepage.astro`
- `src/components/ProblemCards.astro`
- `src/components/IndicadoresHoy.astro`
- `src/components/ResumeWidget.astro`

Implementation intent:

- reorganize the homepage around one primary question: "¿Qué necesitas resolver
  hoy?";
- limit primary hero routes to four choices;
- keep `IndicadoresHoy` as secondary context, not the main decision surface;
- keep recent articles to a compact section;
- preserve trust signals: no registration, no ads, official sources, update
  signal via `/cambios/`;
- avoid a marketing landing page; the homepage remains a usable discovery
  surface.

Acceptance criteria:

- at most four primary hero CTAs;
- problem cards remain visible below the hero;
- no route removals;
- homepage analytics labels remain explicit;
- responsive check passes at 375px, 768px, and 1440px.

### 6.2 Search Experience

Target surface:

- `src/pages/buscar.astro`

Implementation intent:

- update placeholder to examples such as "Ej: sueldo líquido, AFP, DICOM";
- group chips by intent:
  - ingresos;
  - deudas;
  - impuestos;
  - previsión;
  - glosario;
- add visual category labels for direct-access suggestions:
  - calculadora;
  - guía;
  - glosario;
  - ley;
- keep Pagefind as the search engine;
- keep current `search_submit` and `search_result_click` behavior;
- add anonymous events for suggestion/category clicks if not already covered by
  generic CTA tracking.

Acceptance criteria:

- no search term is recorded except user-entered search terms already handled by
  search analytics;
- chip clicks use explicit `data-analytics-cta`;
- result clicks do not send result snippets or private form values;
- Pagefind still builds during `pnpm run build`.

### 6.3 Schema Inventory and Technical Additions

Target surfaces:

- homepage layout or page-level JSON-LD;
- calculator JSON-LD component;
- existing procedural guides only.

Implementation intent:

- add or confirm `Organization` and `WebSite` schema without duplicating global
  schema if it already exists;
- add `WebApplication` or equivalent calculator schema only if it does not
  duplicate existing `CalculatorJsonLd`;
- add `HowTo` only to pages that already have explicit steps in approved
  content, with no invented procedural claims;
- keep `BreadcrumbList` emitted from the contextual breadcrumb source only.

Acceptance criteria:

- tests prove no duplicate `BreadcrumbList` on article pages;
- JSON-LD remains valid JSON;
- no new YMYL claim is introduced only for schema.

### 6.4 Titles and Meta Descriptions

Target artifact:

- create an inventory/proposal document before edits, for example
  `docs/backlog/MONEDARIO_PHASE_2_TITLE_META_PROPOSALS_2026-04-24.md`.

Implementation intent:

- inventory priority pages:
  - homepage;
  - `/buscar/`;
  - calculator index and top calculators;
  - top hubs;
  - top articles already published;
- propose improved titles/descriptions for CTR;
- mark each proposal as:
  - no-claim-change;
  - editorial-review-needed;
  - YMYL-source-needed;
- apply only no-claim-change proposals in technical PRs.

Acceptance criteria:

- `CONTRACT.EDITORIAL.META_DESCRIPTION` still passes;
- no description duplicates;
- no title creates a new promise not supported by page content.

## 7. Wave 2: Calculators as Journeys

Target surfaces:

- calculator detail pages;
- `src/config/calculatorPortfolio.ts`;
- `src/components/ShareCalculatorResult.astro`;
- new reusable post-result component.

Initial calculators:

- `/calculadoras/sueldo-liquido/`
- `/calculadoras/finiquito-indemnizacion/`
- `/calculadoras/operacion-renta/`
- `/calculadoras/credito-consumo/`
- `/calculadoras/tarjeta-credito/`
- `/calculadoras/apv/`

Implementation intent:

- create `CalculatorResultNextActions` or equivalent reusable component;
- show 2-3 post-result actions after the calculator produces a result;
- actions should point to existing pages or calculator-related entries;
- include print action using `window.print()` before considering PDF output;
- reuse existing share behavior where available;
- do not change calculation formulas, parameters, use cases, or result math.

Analytics events:

- `calculator_result_action_click`
- `calculator_print_click`
- `calculator_share_click`
- `calculator_completed`

Privacy constraints:

- do not send salary, debt, tax, APV, credit amounts, or any user input value;
- event parameters may include calculator slug, action label, location, and
  destination href;
- run analytics params through existing cleaning utilities.

Acceptance criteria:

- each initial calculator has post-result actions;
- tests verify no event sends money/input field names as analytics parameters;
- existing calculator tests still pass;
- `pnpm run check:boundaries` passes, proving domain calculation boundaries
  remain intact.

## 8. Wave 3: Glossary and Interlinking Layer

Target surfaces:

- glossary pages under `src/pages/glosario/**`;
- article/calculator rendering layer;
- new glossary data utility or generated static allowlist.

Initial allowlist:

- AFP
- AFC
- UF
- UTM
- CAE
- DICOM
- Finiquito
- APV
- IPC
- SII
- CMF

Implementation intent:

- build a small glossary-term data layer from existing approved glossary pages;
- implement `GlossaryInlineLink` or `GlossaryTooltip`;
- desktop behavior: tooltip or small hover/focus popover;
- mobile behavior: accessible inline link or disclosure, not hover-only;
- never replace existing manual links;
- avoid headings, code blocks, tables where link injection would reduce
  readability, and existing anchors.

Overlinking policy:

- maximum one automatic link per term per page;
- maximum total automatic links should be conservative in v1;
- manual links always take precedence over automatic links;
- no automatic links inside headings.

Acceptance criteria:

- tests prove one-link-per-term behavior;
- tests prove no links are injected in headings;
- accessibility snapshot shows keyboard-reachable tooltip/link behavior;
- no broken internal glossary links.

## 9. Wave 4: Hubs and Pillar-Page Pattern

Target hubs:

- `/guias/sueldo-remuneraciones/`
- `/guias/deuda-credito/`
- `/guias/empleo-ingresos/`
- `/guias/impuestos-personas/`
- `/guias/pensiones-afp/`

Implementation intent:

- create or consolidate a reusable hub pattern using existing components:
  - brief intro;
  - recommended route;
  - core/support/tools groups;
  - common mistakes;
  - related calculators;
  - FAQ only where already approved;
  - compatible schema without duplication;
- improve existing hub pages using approved current content and existing config
  data first;
- avoid turning hubs into unaudited long-form YMYL pages in this wave.

Acceptance criteria:

- each target hub exposes a clear recommended route;
- hub links are valid and do not duplicate dominant destinations excessively;
- no new owner/support conflict is introduced;
- route checks report no removals;
- any new substantive YMYL paragraph is blocked unless it has editorial
  artifacts and review.

## 10. Wave 5: Editorial Pipeline Preparation

This wave creates editorial artifacts only. It does not publish new YMYL pages.

Use:

```bash
pnpm run scaffold:editorial-artifacts -- --slug <slug> --cut-off-date YYYY-MM-DD
```

Strategic opportunities:

1. salir de DICOM / Boletín Comercial;
2. revisar cotizaciones previsionales impagas;
3. wizard licencia médica;
4. centro Operación Renta;
5. comparador AFP ampliado;
6. fraude/cargo no reconocido 24 horas.

Each artifact pack must include:

- `benchmarkSet`;
- `patternHypothesis`;
- `localDelta`;
- `nonCopyBoundaries`;
- `ownerTarget`;
- `successSignal`;
- official sources required;
- risk level;
- ownership/no-cannibalization decision;
- whether math audit is required;
- whether compliance review is required;
- human sign-off placeholder.

Minimum official-source families by opportunity:

- DICOM / Boletín Comercial: CMF, ChileAtiende where applicable, Equifax/Boletín
  issuer only for process facts, consumer law sources where relevant.
- Cotizaciones impagas: Superintendencia de Pensiones, AFC, ChileAtiende,
  Dirección del Trabajo where applicable.
- Licencia médica: SUSESO, COMPIN/ChileAtiende, Fonasa where applicable.
- Operación Renta: SII, TGR where applicable.
- AFP comparator: Superintendencia de Pensiones and official AFP fee data.
- Fraud/cargo no reconocido: CMF, SERNAC, Ley 20.009/BCN, institutional
  emergency channels where official.

Publish block:

- do not publish until `07-publish-packet.md` confirms source traceability,
  role separation, compliance result, math audit result where needed, and human
  editorial sign-off.

## 11. Tickets

Recommended execution tickets:

| ID | Wave | Title | Type | Risk | Done when |
| --- | --- | --- | --- | --- | --- |
| PH2-001 | 1 | Homepage decision-first redesign | UX | Medium | Hero has <=4 primary CTAs and responsive tests pass | ✅ done 2026-04-24 |
| PH2-002 | 1 | Search suggestions and category UI | UX/Search | Low | Chips grouped, Pagefind works, events tested | ✅ done 2026-04-24 |
| PH2-003 | 1 | Schema inventory and safe additions | SEO technical | Medium | JSON-LD valid and no duplicates | ✅ done 2026-04-24 — BreadcrumbList deduplication fix in GlossaryJsonLd.astro |
| PH2-004 | 1 | Title/meta proposal inventory | SEO/editorial | Medium | Proposal doc exists with review flags | ✅ done 2026-04-24 — 1 no-claim-change applied, 1 editorial-review-needed deferred |
| PH2-005 | 2 | Calculator post-result actions component | Calculator UX | Medium | Component integrated in six initial calculators | ✅ done 2026-04-24 |
| PH2-006 | 2 | Calculator journey analytics | Analytics | Medium | Events emit no PII or input values | ✅ done 2026-04-24 |
| PH2-007 | 3 | Glossary term data layer | Content infra | Medium | Allowlist resolves to existing glossary pages | ✅ done 2026-04-24 |
| PH2-008 | 3 | Accessible glossary inline links/tooltips | UX/Content | Medium | No overlinking and keyboard behavior works | ✅ done 2026-04-24 |
| PH2-009 | 4 | Reusable hub/pillar pattern | IA/SEO | Medium | Five target hubs use the pattern safely | ✅ done 2026-04-24 |
| PH2-010 | 5 | DICOM editorial artifact pack | Editorial YMYL | High | Pack complete, unpublished |
| PH2-011 | 5 | Cotizaciones impagas artifact pack | Editorial YMYL | High | Pack complete, unpublished |
| PH2-012 | 5 | Licencia médica wizard artifact pack | Editorial YMYL | High | Pack complete, unpublished |
| PH2-013 | 5 | Operación Renta center artifact pack | Editorial YMYL | High | Pack complete, unpublished |
| PH2-014 | 5 | AFP comparator artifact pack | Editorial YMYL | High | Pack complete, unpublished |
| PH2-015 | 5 | Fraud 24-hour artifact pack | Editorial YMYL | High | Pack complete, unpublished |

## 12. Strategic Parking Lot

These items are worth preserving from the benchmark, but they should not block
the five execution waves above. Promote them into tickets only when there is a
clear owner, acceptance criteria, and the required editorial or technical
guardrails are ready.

| ID | Idea | Value | Execution note |
| --- | --- | --- | --- |
| PARK-001 | Public official sources page (`/fuentes/`) | Strengthens E-E-A-T and gives calculators/articles a stable trust destination | Start as a non-index-risk utility page only if sources are official/trusted and links pass external policy |
| PARK-002 | Per-article "Fuentes consultadas" disclosure | Makes YMYL source traceability visible to readers | Requires article-level source metadata or editorial artifact mapping before template rollout |
| PARK-003 | Anonymous usefulness feedback ("¿Te sirvió?") | Helps prioritize editorial refreshes beyond navigation analytics | Binary feedback only; no free-text PII capture in v1 |
| PARK-004 | More visible freshness indicators | Turns update discipline into a trust signal | Use existing dates/parameters; do not update `updatedDate` for cosmetic freshness |
| PARK-005 | Cross-hub learning routes | Builds journeys such as sueldo → presupuesto → ahorro → APV | Needs an explicit route map to avoid noisy cross-linking |
| PARK-006 | Orphan article remediation micro-backlog | Directly supports the interlinking diagnosis and current link-check warnings | Prioritize the four current orphan warnings before broad linking automation |
| PARK-007 | Lighthouse/Core Web Vitals design gate | Protects the site's speed advantage when homepage/search/tooltips/charts change | Add when a visual/performance-affecting wave starts; record mobile evidence |
| PARK-008 | Lightweight comparators without live-market promises | Captures AFP, credit, Fonasa/Isapre comparison demand without pretending to be real-time | Must label ranges/scenarios clearly and pass YMYL source review before publication |

Parking lot acceptance criteria:

- every promoted item must become a ticket with owner, scope, rollback, and
  tests;
- YMYL-facing items require official sources and editorial artifacts;
- analytics/feedback items must remain anonymous and avoid free-text collection
  unless a separate privacy review approves it;
- performance-sensitive items must include mobile Lighthouse or equivalent
  evidence before merge.

## 13. Test Plan

Base gates after each wave:

```bash
pnpm run lint
pnpm run check:boundaries
pnpm run format:check
pnpm run test
pnpm exec astro check
pnpm run build
```

Route, RSS, URL, and editorial guards:

```bash
pnpm run check:no-postid-urls
pnpm run check:routes
pnpm run check:rss
pnpm run check:links
pnpm run check:frontmatter
pnpm run check:editorial
```

Focused tests to add by wave:

- homepage order, route count, and trust-signal presence;
- search chips, suggestion categories, and analytics events;
- calculator post-result actions and no-PII analytics params;
- glossary overlinking prevention and no heading injection;
- schema presence and duplicate prevention;
- roadmap artifact completeness, including the strategic parking lot.

Responsive verification:

- homepage at 375px, 768px, 1440px;
- `/buscar/` at 375px, 768px, 1440px;
- one calculator with post-result actions at 375px, 768px, 1440px;
- one article with glossary links at 375px, 768px, 1440px;
- one target hub at 375px, 768px, 1440px.

## 14. Rollback Strategy

Rollback unit by wave:

- Wave 1: homepage/search/schema/title-meta proposal changes can be reverted as
  one technical UX patch.
- Wave 2: calculator post-result component and per-calculator integrations can
  be reverted without touching formulas.
- Wave 3: glossary automatic linking can be disabled by removing the integration
  point while keeping glossary pages intact.
- Wave 4: reusable hub pattern can be reverted to previous hub pages because no
  route identity should change.
- Wave 5: editorial artifact folders can be archived or removed before
  publication because no public route depends on them.

No rollback should remove existing public URLs or RSS entries.

## 15. Deterministic Closure Criteria

This roadmap is complete only when:

- each wave has its own implementation evidence;
- no URL, route, RSS, frontmatter, or editorial guard regression remains;
- analytics additions are anonymous and do not include user input values;
- no new YMYL surface was published without artifact pack and required reviews;
- responsive verification was recorded for the affected templates;
- rollback notes exist for every wave;
- final PR or change record cites this roadmap and the relevant invariants.

## 16. Current Decision Defaults

- Repository artifact location: `docs/backlog/`.
- Editorial depth: prepare pipeline and artifacts, do not publish new YMYL.
- Implementation posture: balanced product/SEO work first, editorial expansion in
  a separate lane.
- Dependencies: no new charting or tooltip dependency in the first pass.
- Delivery shape: small wave-based changes, not one large feature diff.
