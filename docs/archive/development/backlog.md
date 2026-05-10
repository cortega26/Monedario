# Monedario Backlog

Priority Score Formula: `Impact x Confidence / Effort`

## Phase 1 - Acquisition Engine

### MB-001 - Establish SEO baseline dashboard
- **Description:** Define the core KPI set for the next 90 days and create a baseline snapshot covering impressions, clicks, CTR, average position, top landing pages, calculator entries, and indexed pages.
- **Impact:** 5
- **Effort:** 2
- **Confidence:** 5
- **Priority Score:** 12.5
- **Status:** DONE
- **Dependencies:** None
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-002 - Search platform validation umbrella
- **Description:** Umbrella task for real search-platform execution. Platform-specific operational work is split into `MB-036` for Google Search Console and `MB-037` for Bing Webmaster so backlog truth can reflect platform-specific progress instead of an all-or-nothing fiction. Sprint 2E restored a reusable authenticated automation path by signing in inside the dedicated persistent profile `output/playwright/search-platform-profile-2e`, exporting `output/playwright/search-platform-state-2e-authenticated.json`, and reloading that state in a fresh browser session. Both platform-specific execution tasks were then completed with real authenticated dashboard access and real sitemap submission evidence.
- **Impact:** 5
- **Effort:** 2
- **Confidence:** 5
- **Priority Score:** 12.5
- **Status:** DONE
- **Dependencies:** MB-036, MB-037
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-031 - Obtain Search Console and Bing access prerequisites
- **Description:** Obtain authenticated Google Search Console and Bing Webmaster access, or complete the domain/site ownership validation steps required so MB-002 can verify submission and coverage with real platform data. Founder-confirmed manual ownership verification satisfied the prerequisite-validation requirement; any remaining missing agent-side access is tracked separately.
- **Impact:** 5
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 10.0
- **Status:** DONE
- **Dependencies:** None
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-032 - Obtain authenticated agent-side Search Console and Bing access

- **Description:** Secure reusable authenticated operational access for the execution environment so future work can submit sitemaps, inspect coverage, and read platform diagnostics directly without relying on founder-side confirmation only. Sprint 2E created a dedicated persistent automation profile at `output/playwright/search-platform-profile-2e`, the founder signed in manually inside that exact profile for both Google and Microsoft, and the session was exported to `output/playwright/search-platform-state-2e-authenticated.json`. That saved state was then loaded into a fresh browser session, which reopened the authenticated Google Search Console property `sc-domain:monedario.cl` and the authenticated Bing Webmaster site `https://monedario.cl/` without manual re-login. Reusable authenticated agent-side access is now restored.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 8.0
- **Status:** DONE
- **Dependencies:** MB-031
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-036 - Execute Google Search Console validation and sitemap submission
- **Description:** Using a reusable authenticated Google Search Console session for `sc-domain:monedario.cl`, reach the property, inspect the sitemap state, submit or resubmit `https://monedario.cl/sitemap-index.xml` if needed, and document verified coverage/indexing observations in the Google runbook. Sprint 2E executed this from the restored authenticated state: the Search Console sitemap table initially showed `0-0 de 0`, `https://monedario.cl/sitemap-index.xml` was submitted successfully, and the post-submit row now shows the sitemap entry dated `8 mar 2026` with status `No se ha podido obtener`, `0` discovered pages, and `0` discovered videos while the indexation reports are still processing.
- **Impact:** 5
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 10.0
- **Status:** DONE
- **Dependencies:** MB-001, MB-032
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-037 - Execute Bing Webmaster validation and sitemap submission
- **Description:** Using a reusable authenticated Bing Webmaster session for Monedario, reach the site dashboard, inspect sitemap and validation state, submit or resubmit `https://monedario.cl/sitemap-index.xml` if needed, and document verified platform observations in the Bing report. Sprint 2E executed this from the restored authenticated state: the Bing `Sitemaps` page for `https://monedario.cl/` initially showed no known sitemaps and `0 rows`, `https://monedario.cl/sitemap-index.xml` was submitted successfully, and the post-submit row now shows `Submitted` on `3/8/2026` with status `Processing`.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 8.0
- **Status:** DONE
- **Dependencies:** MB-001, MB-032
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-003 - Configure analytics events for content and calculator journeys
- **Description:** Track article scroll depth, outbound official-source clicks, calculator starts, calculator completions, and CTA clicks so SEO traffic can be evaluated beyond pageviews.
- **Impact:** 4
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 5.3
- **Status:** DONE
- **Dependencies:** MB-001
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-004 - Build the keyword universe and URL map

- **Description:** Create the initial keyword set for core Chilean financial decisions and map each term cluster to an existing or planned landing page to avoid cannibalization.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 5
- **Priority Score:** 8.3
- **Status:** DONE
- **Dependencies:** MB-001
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-005 - Rewrite homepage metadata and hero positioning

- **Description:** Replace generic homepage title, description, and H1 framing with a Chile-specific value proposition that clearly signals calculators, guides, and practical financial education.
- **Impact:** 5
- **Effort:** 2
- **Confidence:** 5
- **Priority Score:** 12.5
- **Status:** DONE
- **Dependencies:** MB-004
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-006 - Restructure homepage around problem-based entry points

- **Description:** Reorganize the homepage so users can enter by intent cluster such as sueldo, AFP/APV, crédito, cesantía, impuestos, and presupuesto instead of relying primarily on recency.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 6.7
- **Status:** DONE
- **Dependencies:** MB-004, MB-005
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-007 - Normalize canonical, OG, and metadata consistency
- **Description:** Audit core templates to ensure canonical URLs, Open Graph URLs, Twitter URLs, schema URLs, titles, and descriptions are absolute, consistent, and cluster-aware.
- **Impact:** 5
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 10.0
- **Status:** DONE
- **Dependencies:** MB-025
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-008 - Audit tag indexation and sitemap hygiene
- **Description:** Review tag pages, paginated archives, and any low-value URLs to decide which should remain indexable, which should be deprioritized, and which should be excluded from sitemap or indexing paths.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 6.7
- **Status:** DONE
- **Dependencies:** MB-025, MB-007
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-025 - Run full technical SEO crawl
- **Description:** Run a full crawl with Screaming Frog, Sitebulb, or an equivalent crawler to detect broken links, redirect chains, duplicate titles, duplicate descriptions, orphan pages, canonical conflicts, thin pages, and pagination issues, then document results and create follow-up tasks if needed.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 5
- **Priority Score:** 8.3
- **Status:** DONE
- **Dependencies:** None
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-027 - Structured data audit
- **Description:** Review schema implementation for Article, FAQ, HowTo, Breadcrumb, and calculator pages, and verify that each implementation aligns with Google's supported structured data types and page intent.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 5
- **Priority Score:** 10.0
- **Status:** DONE
- **Dependencies:** None
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-029 - Repair broken citation and link targets found in Sprint 1A crawl
- **Description:** Replace or update the broken official-source URLs found in laws and articles, verify the author profile link behavior, and remove the broken `/cdn-cgi/l/email-protection` internal-link pattern detected on article pages.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 8.0
- **Status:** DONE
- **Dependencies:** MB-025
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-030 - Remediate structured data on article, glossary, calculator, and hub templates

- **Description:** Remove duplicate `BlogPosting` output on article pages, make article schema URLs absolute, add `BreadcrumbList` where missing, and add justified glossary/hub schema such as `DefinedTerm` or `CollectionPage` only where appropriate.
- **Impact:** 4
- **Effort:** 3
- **Confidence:** 5
- **Priority Score:** 6.7
- **Status:** DONE
- **Dependencies:** MB-027, MB-007
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-028 - SERP intent analysis for priority keywords

- **Description:** Analyze dominant content formats, calculator presence, featured snippets, FAQ boxes, government sources, and ranking patterns for each priority keyword cluster, then update cluster strategy based on observed SERP intent.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 6.7
- **Status:** DONE
- **Dependencies:** MB-004
- **Roadmap Phase:** Phase 1 - Acquisition Engine

### MB-033 - Resolve semantic cluster taxonomy before cluster build
- **Description:** Define the canonical cluster ownership and future hub URL strategy for `sueldo liquido y remuneraciones`, `cesantia y proteccion social`, `UF / inflacion / costo de vida`, and `presupuesto / control financiero`, while deciding how APV relates to pensions vs ahorro. Sprint 2B resolved this by keeping the `/guias/<cluster>/` strategy, introducing `sueldo-remuneraciones` as a dedicated canonical cluster, and clarifying that `empleo-ingresos` remains the labor-contingency cluster.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 6.7
- **Status:** DONE
- **Dependencies:** MB-004, MB-028
- **Roadmap Phase:** Phase 1 - Acquisition Engine

## Phase 2 - Authority Building

### MB-026 - Build internal linking architecture map
- **Description:** For each core cluster hub, map the supporting articles, relevant calculators, glossary definitions, and legal explainers, then design the internal linking structure that reinforces topical authority and next-step navigation.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 5
- **Priority Score:** 8.3
- **Status:** DONE
- **Dependencies:** MB-004, MB-028
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-009 - Create cluster hub for sueldo liquido y remuneraciones
- **Description:** Build a hub page that consolidates sueldo líquido, descuentos, liquidación, impuesto único, and related calculator entry points into one authoritative cluster. Sprint 2B shipped the production hub at `/guias/sueldo-remuneraciones/` and connected it to the sueldo guide, calculator, glossary/legal supports, and the AFP discount article.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 6.7
- **Status:** DONE
- **Dependencies:** MB-006, MB-026
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-010 - Create cluster hub for AFP y APV
- **Description:** Build a hub page for AFP, APV, Cuenta 2, fondos, cambio de AFP, and retirement planning, with clear paths to related guides and calculators. The production hub now lives at `/guias/pensiones-afp/` and routes APV as a related cross-cluster asset instead of duplicating ownership.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 6.7
- **Status:** DONE
- **Dependencies:** MB-006, MB-026
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-011 - Create cluster hub for credito y deuda
- **Description:** Build a hub page connecting CAE, crédito de consumo, prepago, tarjetas, renegociación, and debt diagnosis content into one decision-support structure. The production hub now lives at `/guias/deuda-credito/`; remaining content gaps belong to supporting-article work, not hub creation.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 6.7
- **Status:** DONE
- **Dependencies:** MB-006, MB-026
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-012 - Resolve public entry point for cesantia y proteccion social
- **Description:** Resolve the public entry point for seguro de cesantía, AFC, saldo CIC, access conditions, and adjacent employment-shock support content. Repo truth keeps this cluster inside `/guias/empleo-ingresos/` instead of opening a separate public hub.
- **Impact:** 4
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 5.3
- **Status:** DONE
- **Dependencies:** MB-006, MB-026
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-013 - Create future cluster hub for UF, inflacion y costo de vida
- **Description:** Build the productive hub page linking UF explainers, calculator tools, arriendo adjustments, inflation context, and practical household impact scenarios. The hub now lives at `/guias/uf-costo-de-vida/`, the three base articles were hardened into the canonical cluster on 2026-03-12, and the remaining work is bridge/taxonomy refinement only if a real new need appears.
- **Impact:** 4
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 5.3
- **Status:** DONE
- **Dependencies:** MB-006, MB-026
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-014 - Create cluster hub for impuestos personales
- **Description:** Build a hub page for Operación Renta, devolución, boletas de honorarios, impuesto único, and official tax guidance for individuals in Chile. The production hub now lives at `/guias/impuestos-personas/`.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 6.7
- **Status:** DONE
- **Dependencies:** MB-006, MB-026
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-015 - Create future cluster hub for presupuesto y control financiero
- **Description:** Build a future hub page around presupuesto, gastos hormiga, control financiero, and basic planning habits, designed as an entry point for less technical users. Sprint Phase2-A shipped `/guias/presupuesto-control-financiero/` with pillar article, sueldo calculator link, StartHere steps, and hub nav entry. Article `como-hacer-presupuesto-mensual-chile` updated to link back. Hub added to Header dropdown.
- **Impact:** 4
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 5.3
- **Status:** DONE
- **Dependencies:** MB-006, MB-026
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-016 - Add article-to-calculator internal link modules
- **Description:** Implement v1 of the structured article-to-calculator module pattern for the sueldo/remuneraciones cluster, connecting sueldo-related articles to the matching calculator and documenting the reusable pattern for later AFP/APV, crédito, cesantía, UF, and arriendo rollouts.
- **Impact:** 5
- **Effort:** 3
- **Confidence:** 5
- **Priority Score:** 8.3
- **Status:** DONE
- **Dependencies:** MB-009
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-017 - Add contextual glossary and legal explainer link blocks
- **Description:** Implement v1 of the contextual glossary/legal support block pattern for the sueldo/remuneraciones cluster, adding standardized support modules on sueldo pages and documenting how the same pattern should roll out to later clusters.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 8.0
- **Status:** DONE
- **Dependencies:** MB-009
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-034 - Create supporting article for descuentos de sueldo obligatorios
- **Description:** Publish a dedicated supporting article for `descuentos sueldo` / descuentos obligatorios, positioned under the `sueldo-remuneraciones` hub so the cluster no longer depends on AFP-only wording to answer that intent. Sprint 2C shipped `/posts/descuentos-de-sueldo/`, connected it to the hub, calculator, sueldo pilar, liquidación explainer, glossary/legal support, and refreshed related sueldo-cluster links.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 8.0
- **Status:** DONE
- **Dependencies:** MB-009, MB-016, MB-017
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-035 - Create supporting explainer for liquidación de sueldo
- **Description:** Publish a dedicated explainer focused on `liquidación de sueldo`, including field-by-field reading guidance and explicit links back to the sueldo hub and calculator. Sprint 2C shipped `/posts/liquidacion-de-sueldo/`, wired it into the sueldo cluster, and added supporting links from the hub and related sueldo pages.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 8.0
- **Status:** DONE
- **Dependencies:** MB-009, MB-016, MB-017
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-018 - Refresh top high-intent evergreen articles
- **Description:** Update the highest-intent pages with improved intros, FAQ sections, stronger source citations, calculator links, and explicit freshness markers. Sprint Phase2-A refreshed 4 articles: boleta-honorarios-2026-retencion-cobertura, como-calcular-sueldo-liquido (fixed Capital AFP comisión 1.44%→0.58%, recalculated table), finiquito-e-indemnizaciones-en-chile, seguro-de-cesantia. All `updatedDate` and `validAsOf` set to 2026-04-10. operacion-renta-f22-checklist confirmed up-to-date (updatedDate 2026-04-04, 5 FAQs). Revisions logged in BACKLOG_EDITORIAL.md.
- **Impact:** 5
- **Effort:** 4
- **Confidence:** 5
- **Priority Score:** 6.3
- **Status:** DONE
- **Dependencies:** MB-004, MB-016, MB-017
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-019 - Strengthen cluster navigation and next-step pathways
- **Description:** Improve local navigation, related-content logic, breadcrumbs, and "next best action" pathways so users can move from discovery to understanding to tool usage. Sprint Final Phase 2 executed 2026-04-11: discovery confirmed all 9 hubs have StartHere blocks and Breadcrumb; 8/9 hubs link to their cluster calculator in StartHere; seguridad-financiera has no calculator in portfolio (TODO comment added); all 4 refresh articles have ArticleDecisionIntro rendering primary CTA (calculator) + secondary CTA (nextStep).
- **Impact:** 4
- **Effort:** 3
- **Confidence:** 4
- **Priority Score:** 5.3
- **Status:** DONE
- **Dependencies:** MB-009, MB-010, MB-011, MB-012, MB-013, MB-014, MB-015
- **Roadmap Phase:** Phase 2 - Authority Building

### MB-020 - Define content refresh cadence and cluster ownership
- **Description:** Establish a lightweight operating cadence for updating priority clusters, including review frequency, source-check expectations, and ownership by content area. Sprint Final Phase 2 created `docs/operations/runbooks/content-refresh-cadence.md` on 2026-04-11: 9 clusters with scheduled cadence and official sources, 5 out-of-cycle triggers (AFP rates, UF/UTM, legislation, honorarios retention, Operación Renta), per-cycle checklist, and ownership rule.
- **Impact:** 3
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 6.0
- **Status:** DONE
- **Dependencies:** MB-018
- **Roadmap Phase:** Phase 2 - Authority Building

## Phase 3 - Conversion and Distribution Readiness

### MB-021 - Define the newsletter or email capture offer
- **Description:** Decide the value proposition for owned audience capture, such as weekly financial clarity, calculator updates, or practical alerts, and align it with Monedario's trust positioning. Decision (2026-04-11): definitively deferred until MB-039 (localStorage persistence) generates return-visit data. If localStorage shows strong unaided return rate, newsletter value prop weakens; if return rate is low, newsletter becomes the primary retention mechanism. Do not reopen this item before MB-039 has at least 4 weeks of restore-event data.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 8.0
- **Status:** IDEA
- **Dependencies:** MB-001, MB-018, MB-039
- **Roadmap Phase:** Phase 3 - Conversion and Distribution Readiness

### MB-022 - Implement CTA framework by page intent
- **Description:** Define which CTA appears on each template type. Research refinement (2026-04-11): CTAs should be segmented by user diagnosis type, not just template type. Debt-cluster pages → "¿Cuánto debo realmente?" (calculator entry). AFP/pension cluster → "¿Tu fondo está bien elegido?" (simulador). Labor/cesantía cluster → "¿A cuánto tienes derecho?" (finiquito/cesantía calculator). Avoid generic newsletter CTA until MB-021 is resolved. Loss aversion framing (MB-042) should be woven into result-block CTAs, not treated separately.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 8.0
- **Status:** IDEA
- **Dependencies:** MB-016, MB-019, MB-021
- **Roadmap Phase:** Phase 3 - Conversion and Distribution Readiness

### MB-023 - Build weekly keyword and performance reporting ritual
- **Description:** Build a repo-driven weekly reporting ritual that uses `scripts/build-weekly-search-report.mjs`, the strategic watchlist in `docs/operations/runbooks/weekly-search-performance-watchlist.json`, and the runbook in `docs/operations/runbooks/weekly-search-performance-ritual.md` to consolidate weekly GSC page/query exports, Bing/Google indexation notes, and analytics event summaries into a markdown + JSON scorecard with winners, losers, watchlist items, refresh candidates, and internal-link/packaging actions. The script can also initialize the weekly input bundle under `output/operations/weekly-search-performance/<week>/`.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 5
- **Priority Score:** 10.0
- **Status:** DONE
- **Dependencies:** MB-001, MB-002, MB-003, MB-004
- **Roadmap Phase:** Phase 3 - Conversion and Distribution Readiness

### MB-024 - Run limited distribution tests for flagship assets
- **Description:** Promote only the strongest cluster pages and calculators on selected channels such as X, LinkedIn, Reddit, or niche communities, then measure assisted traffic and repeat visits. Research refinement (2026-04-11): the natural PR candidates are MB-040 (simulador FES/CAE at launch, first-mover window) and MB-041 (comparador SOAP in March seasonal window). Do not use generic evergreen pages as first distribution push — regulatory novelty is the hook that earns organic sharing.
- **Impact:** 4
- **Effort:** 3
- **Confidence:** 3
- **Priority Score:** 4.0
- **Status:** IDEA
- **Dependencies:** MB-018, MB-021, MB-022, MB-023, MB-040, MB-041
- **Roadmap Phase:** Phase 3 - Conversion and Distribution Readiness

---

## Horizon 1 — Regulatory Accuracy and Behavioral Retention (0–3 months)

Items derived from deep research synthesis (2026-04-11). Founder decision required for IDEA items. MB-038 is a factual correction, not optional.

### MB-038 - Update calculadora sueldo-líquido for Ley 40h (semana de 40 horas)
- **Description:** The Ley 40h (reducción de la jornada laboral) is legally in effect from April 2026. The sueldo-líquido calculator must reflect the 40-hour week as the default legal maximum. Any hardcoded reference to 45h/week in the calculator logic, UI copy, or explanatory articles is now a factual error. Verify the current implementation, correct the default, and add a visible note explaining the transition from 45h to 40h for users comparing old and new contracts.
- **Impact:** 5
- **Effort:** 2
- **Confidence:** 5
- **Priority Score:** 12.5
- **Status:** DONE
- **Completion note:** 2026-04-11 — Calculator logic required no changes (monthly salary math is independent of weekly hours). Updated three editorial sections in `src/pages/calculadoras/sueldo-liquido.astro`: (1) horas extra hint now mentions 42h/week threshold for April 2026 under Ley 40h; (2) FAQ "¿Las horas extra se descuentan de AFP y salud?" updated to note overtime starts at hour 43 (42h step April 2026) with 50% surcharge; (3) new FAQ "¿La Ley 40h cambia mi sueldo líquido?" added explaining gradual reduction (42h in 2026, 40h in 2028) with no direct impact on gross salary.
- **Dependencies:** MB-018
- **Roadmap Phase:** Horizon 1 — Regulatory Accuracy

### MB-039 - localStorage persistence for calculator scenarios
- **Description:** Persist the last-used calculator inputs in localStorage so users who close and return find their scenario pre-filled. Implementation: on input change, write the form state to a namespaced key per calculator (e.g. `monedario:sueldo-liquido:inputs`); on mount, read and restore it silently. Add a subtle "Tus datos se guardaron localmente" note near the form. This item does not depend on the CTA framework (MB-022); it's a standalone retention layer. After 4–6 weeks, use existing analytics events (MB-003) to measure sessions with localStorage restore vs. clean session — that return-visit rate determines whether MB-021 (newsletter) is worth building at all.
- **Impact:** 4
- **Effort:** 3
- **Confidence:** 3
- **Priority Score:** 4.0
- **Status:** IDEA
- **Dependencies:** MB-003
- **Roadmap Phase:** Horizon 1 — Behavioral Retention

### MB-040 - Simulador FES/CAE (Fondo de Educación Superior)
- **Description:** Build a calculator for the Fondo de Educación Superior (FES), the instrument replacing CAE under the reforma de financiamiento estudiantil. The FES reform creates a first-mover search window: high search volume, few reliable tools, and regulatory novelty that naturally generates sharing. The calculator should cover: cuota mensual estimada, plazo, condonación parcial por tramo de ingreso, comparación con deuda CAE vigente (for users with existing debt). Launch must coincide with the first FES enrollment window — this date gates everything. **First step before any development: verify the FES enrollment timeline** (check mineduc.cl or the official FES legislation text — Ley 21.886 or its implementing regulations). If the window is more than 3 months away, the item can be scoped properly; if it is imminent, start immediately and cut scope to cuota + plazo only.
- **Impact:** 5
- **Effort:** 4
- **Confidence:** 4
- **Priority Score:** 5.0
- **Status:** IDEA
- **Dependencies:** MB-024
- **Roadmap Phase:** Horizon 1 — New Tools

### MB-042 - Loss aversion framing in calculator result blocks
- **Description:** Reframe calculator result displays to surface the cost of inaction alongside the answer. Pilot on **simulador-jubilacion** first: retirement adequacy is inherently loss-framed and users calculating a low projected pension are already primed — add a line like "Con tu fondo actual, recibirás $X/mes menos que el promedio de tu tramo etario". Instrument using existing MB-003 analytics events: record CTA click-through rate in the result block for 4 weeks before and 4 weeks after the framing change. If click-through uplift is ≥15%, scale the pattern to simulador-finiquito and calculadora-deuda. If uplift is below threshold, discard — do not add loss framing to other calculators speculatively. Component changes are minimal; effort is primarily copywriting and event tagging.
- **Impact:** 3
- **Effort:** 2
- **Confidence:** 3
- **Priority Score:** 4.5
- **Status:** IDEA
- **Dependencies:** MB-003, MB-022
- **Roadmap Phase:** Horizon 1 — Behavioral UX

### MB-046 - Artículo explicativo: Regla de 50 transferencias
- **Description:** The CMF rule limiting free inter-bank electronic transfers affects how Chilean users move money between accounts, including CuentaRUT and digital wallets. Many users don't know the limit exists or what triggers a fee. Publish a short explainer covering: what the rule is, which accounts and banks it applies to, how to track your count, and how to avoid unnecessary charges. Link to the deuda-credito and seguridad-financiera clusters. This is an article, not a calculator — effort is editorial, not development.
- **Impact:** 3
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 6.0
- **Status:** IDEA
- **Dependencies:** None
- **Roadmap Phase:** Horizon 1 — Regulatory Clarity

### MB-047 - Conversor UF: decisión estratégica ante riesgo de AI Overview
- **Description:** The UF conversor is a commodity query ("UF a pesos hoy") that Google's AI Overview answers directly — the existing tool will lose organic clicks regardless of quality. This item is a decision task, not development: choose one of three paths and implement it. Path A (enrich): expand the conversor into a UF hub tool covering IPC history, arriendo adjustment table, and projected UF for the next 3 months — differentiated enough that AI cannot replicate it inline. Path B (redirect): demote the conversor from its current URL emphasis, redirect SEO effort to the UF cluster hub at `/guias/uf-costo-de-vida/`, and accept the conversor as a utility with no SEO ambition. Path C (deprecate): remove the conversor from the homepage navigation and let it decay naturally while the hub captures the cluster's search demand. Recommendation: Path A if development time exists; Path B if it doesn't.
- **Impact:** 4
- **Effort:** 2
- **Confidence:** 4
- **Priority Score:** 8.0
- **Status:** IDEA
- **Dependencies:** MB-013
- **Roadmap Phase:** Horizon 1 — Strategic Decision

---

## Horizon 2 — Monetization and Topical Expansion (3–6 months)

### MB-041 - Comparador SOAP con modelo CPA
- **Description:** Build a SOAP vehicle insurance comparador with CPA affiliate structure. The 2026 seasonal window (March–April) has already passed; target launch is February 2027, ahead of the 2027 renewal peak. The comparador should: show side-by-side annual premium by insurer (sourced from CMF public data or affiliate API), display coverage equivalence, and link to purchase via CPA affiliate. This is Monedario's first monetization proof-of-concept; execution validates whether the affiliate model is viable before investing in larger comparadores (MB-044). Deferred until Monedario has sufficient organic traffic to negotiate an affiliate partnership from a position of value.
- **Impact:** 4
- **Effort:** 3
- **Confidence:** 3
- **Priority Score:** 4.0
- **Status:** IDEA
- **Dependencies:** MB-022, MB-024
- **Roadmap Phase:** Horizon 2 — Monetization Proof

### MB-048 - Deuda multi-stage playbook con seguimiento de etapa
- **Description:** A journey-based tool for users working through debt resolution across multiple sessions. The journey has three stages: (1) Diagnóstico — total deuda, número de acreedores, relación deuda/ingreso; (2) Acción — renegociación, prepago, priorización de cuotas; (3) Recuperación — control de avance, historial crediticio. Each stage surfaces different calculators and articles from the deuda-credito cluster. State is persisted via localStorage (gate on MB-039 proving the model). This is a UX architecture decision before a development task: the first step is a wireframe of the three stages and what tool/article appears at each. Do not build until MB-039 is live and shows meaningful return-visit rates on debt-cluster calculators.
- **Impact:** 4
- **Effort:** 4
- **Confidence:** 3
- **Priority Score:** 3.0
- **Status:** IDEA
- **Dependencies:** MB-039, MB-011
- **Roadmap Phase:** Horizon 2 — Journey Tools

### MB-043 - B2B lead CTAs on renegociación and DICOM simulators
- **Description:** Add conditional CTAs at the calculator result step for users whose inputs signal a deuda crisis (e.g., deuda total > 6 sueldos, multiple creditors, DICOM lookup intent). CTA pattern: "¿Necesitas asesoría profesional? Habla con un experto →" linking to a lead-capture form or affiliate (estudio de abogados, empresa de renegociación). Do not add the CTA without a functional destination. Gate on MB-041 validating the affiliate model first. Deferred: requires an affiliate or B2B partner, which will not be pursued until Monedario has sufficient traffic to negotiate from a position of value.
- **Impact:** 3
- **Effort:** 2
- **Confidence:** 2
- **Priority Score:** 3.0
- **Status:** IDEA
- **Dependencies:** MB-022, MB-041
- **Roadmap Phase:** Horizon 2 — B2B Monetization Seed

### MB-044 - Comparadores de productos financieros (TAC/CAE/DAP)
- **Description:** Build rate comparators for consumer credit (using CAE/TAC from CMF), deposit accounts (DAP), and possibly mortgages (dividendo mensual vs. plazo). Data sourced from CMF public datasets or affiliate APIs. Affiliate CPA on product application. This is a significant commitment: CMF data requires ongoing maintenance; comparadores only retain credibility if rates are current (max 30-day staleness). Gate on MB-041 (SOAP comparador) proving the comparador model works at lower complexity before investing in this. The TAC comparador alone is a category-defining asset if executed with real data fidelity. Deferred: requires affiliate partnerships and data-maintenance commitment; revisit once MB-041 is complete and traffic justifies the investment.
- **Impact:** 4
- **Effort:** 5
- **Confidence:** 3
- **Priority Score:** 2.4
- **Status:** IDEA
- **Dependencies:** MB-041
- **Roadmap Phase:** Horizon 2 — Comparadores

---

## Horizon 3 — Infrastructure for Scale (6–12 months)

### MB-049 - SEO title rewrite: simulador-renegociacion
- **Description:** Rewrote the SEO title, meta description, and CalculatorJsonLd on `/calculadoras/simulador-renegociacion/` to target head queries ("renegociación de deudas", "Chile", "2026") after GSC showed 0 head-term impressions despite position 4.82 at day 33. Previous title led with institutional jargon ("Simulador de Renegociación de Deudas | Superir"); new title: "Renegociación de Deudas Chile 2026 | Simulador Superir". H1 and calculator logic unchanged.
- **Status:** DONE
- **Completed:** 2026-04-11
- **Roadmap Phase:** Horizon 1 — SEO Quick Wins

### MB-045 - B2B embeddable calculator widgets
- **Description:** Package priority calculators (sueldo-liquido, finiquito) as embeddable iFrame or web component widgets for HR platforms, contadores, media sites, and colegios profesionales. Revenue model: license fee or usage-based B2B pricing. Value proposition: Monedario handles regulatory updates; partners embed without maintenance burden. SERP-independent revenue stream — insulates against AI Overview CTR erosion on informational queries. Requires: dedicated B2B landing page, pricing model decision, support commitment, and at least one design partner willing to test the integration. Do not build before MB-044 validates the data-maintenance commitment Monedario can sustain. Deferred: long-horizon item requiring B2B market validation; not actionable at current traffic levels.
- **Impact:** 4
- **Effort:** 5
- **Confidence:** 2
- **Priority Score:** 1.6
- **Status:** IDEA
- **Dependencies:** MB-044
- **Roadmap Phase:** Horizon 3 — B2B Infrastructure
