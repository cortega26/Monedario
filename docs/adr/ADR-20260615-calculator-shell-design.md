# ADR-20260615: CalculatorShell shared layout component

Date: 2026-06-15
Status: Accepted (design spike)

## Context

The site has 19 calculator pages (`src/pages/calculadoras/*.astro` excluding `index.astro`), totaling ~14,000 lines of Astro templates. Every page reimplements the same structural boilerplate:

- `Layout` wrapper with `<title>` and `<meta name="description">`
- `CalculatorJsonLd` for schema.org WebApplication + FAQPage
- `Header`, `Breadcrumb`, `CalculatorTrustBadge`
- `<main>` block with `data-analytics-*` attributes
- `CalculatorHero` with title and description
- `PrimaryCTA`, `ShareCalculatorResult`, `MethodologyBlock`, `NextSteps` (or `NextBestStep`)
- `Footer`

This boilerplate accounts for 200-350 lines per calculator file. Adding a new calculator means copying the same 10-import preamble, the same 7-component page shell, the same NextStep derivation from `CALCULATOR_PORTFOLIO`, and the same footer chain.

## Decision

Create a single `CalculatorShell.astro` component at `src/components/calculator/CalculatorShell.astro` that provides all shared structural boilerplate through props and named slots.

### Target API

The shell accepts:

| Prop | Required | Default | Purpose |
|---|---|---|---|
| `title` | yes | — | `<title>` and og:title |
| `description` | yes | — | `<meta name="description">` + JSON-LD |
| `slug` | yes | — | analytics / data attributes |
| `calculatorName` | yes | — | analytics display name |
| `heroTitle` | yes | — | H1 in CalculatorHero |
| `heroDescription` | yes | — | subtitle |
| `heroDescriptionClass` | no | undefined | CSS class override |
| `jsonLdName` | no | `title` | schema name |
| `faqs` | no | undefined | FAQ schema + inline FAQ section |
| `ctaText` / `ctaHref` / `ctaContext` | no | undefined | PrimaryCTA |
| `methodologyNotes` / `methodologySources` | no | undefined | MethodologyBlock |
| `nextBestStepSlug` | no | undefined | NextBestStep component |
| `layout` | no | `"split"` | `"single"` (max-w-xl) or `"split"` (2-col grid) |
| `siteTitle` | no | undefined | `data-site-title` attribute |

Named slots:

| Slot | Purpose | Required? |
|---|---|---|
| `form` | Input fields, banners, quick-reference tables | yes |
| `result` | Result panel (for split layout, right column) | only if layout=split |
| `explainer` | Prose educational content below the form | no |

Client-side `<script>` stays in the page file (Astro doesn't process scripts passed through slots).

### Which calculators fit which layout

- **`layout="single"`**: conversor-uf, conversor-utm, comisiones-afp — all have inline result display within the form area.
- **`layout="split"` (default)**: the remaining 16 calculators — form in left column, `CalculatorResultPanel` in right column.

### How much boilerplate is eliminated

The prototype in `conversor-uf.astro` went from 443 lines to ~280 lines (37% reduction). The frontmatter imports dropped from 11 to 3. The template section dropped from 225 lines to ~40 lines of shell props + 165 lines of form/explainer slots. The client script (133 lines) was unchanged.

For a typical split-layout calculator like `boleta-honorarios-liquido.astro` (436 lines), the expected reduction is similar: ~150 lines of boilerplate eliminated.

## Consequences

### Positive

- **New calculators are ~3x faster to create**: from ~2000 lines to ~600 lines (form HTML + explainer prose + client JS).
- **Structural consistency**: all calculators share the same Hero, CTA, Share, Methodology, NextSteps chain in the same order. No "oops, forgot the trust badge."
- **Single change point** for modifications to the shared shell (e.g., adding a new analytics attribute, changing the NextSteps default wording).
- **All structural tests still pass**: the invariant "every calculator has trust badge + next steps" is enforced transitively through the shell.

### Negative

- **Indirection**: a developer reading a calculator page must understand that some components come from the shell. This is a standard Astro pattern (similar to how `Layout.astro` works as a wrapper).
- **Shell complexity**: the component has ~20 props and 3 named slots, which is medium complexity. The docs and the type-checked `Props` interface mitigate this.
- **Migrating existing calculators requires a rewrite** of each page's template section. The form content and explainer prose are preserved, but the wrapper imports, Layout, and footer chain are replaced with shell props.

### Mitigations

- The component is in `src/components/calculator/CalculatorShell.astro` — colocated with existing calculator components.
- All props are type-checked via the exported `Props` interface.
- Migration can be done one calculator at a time, in any order, without breaking existing pages.
- No behavioral changes: the shell renders the same HTML structure, the same analytics attributes, and the same component chain.

## Alternatives considered

### Status quo (no shell)

Each calculator page is fully self-contained. New calculators require copying boilerplate from an existing one. Risk of missing a component (e.g., `CalculatorTrustBadge`) or having inconsistent wrappers. Already observed: some calculators use `NextSteps`, others use `NextBestStep`, and a few have `data-profile-prefill-host` which others lack.

**Rejected because**: 19 calculators with ~14,000 lines of duplicated structure is a maintenance tax that grows with each new calculator.

### React-based forms (Preact / Solid)

Render the form client-side with a reactive framework. Would enable client-side validation, live recalculation, and shared state without manual DOM manipulation.

**Rejected because**: it's a much larger architectural change that requires dual-rendering (SSR + client), introduces a new JS dependency, and would need to coexist with Astro's existing client-side script pattern. This is orthogonal to the structural shell concern and can be explored later.

### Web components

Define `<calculator-form>`, `<calculator-result>`, `<calculator-banner>` as custom elements. Reusable across frameworks but adds complexity of custom element lifecycle and Shadow DOM.

**Rejected because**: the calculators already use Astro components (`.astro` templates) which compile to HTML at build time. Adding web components would serve a different use case (client-side interactivity patterns) than the structural shell pattern we need here.

### Progressive enhancement via Astro islands

Use `client:load` Astro islands for the interactive parts of the form, keeping the shell static.

**Not pursued in this spike**: this is compatible with CalculatorShell and can be explored in a future iteration. The shell is layout-only and doesn't interfere with island architectures.

## Verification

1. **Build**: `pnpm run build` exits 0 — the prototype page compiles with the shell.
2. **Tests**: `pnpm run test` passes 689 tests — no regressions. The structural test for calculator imports was updated to accept CalculatorShell as a proxy.
3. **Visual comparison**: the prototyped `conversor-uf.astro` renders the same HTML structure (same CSS classes, same data attributes, same component hierarchy) as the original. Verified by diffing the built HTML output against a built baseline of the original.

### What was verified in the prototype

- All `data-analytics-*` attributes are present on `<main>`.
- `CalculatorJsonLd` renders both WebApplication and FAQPage schemas.
- `CalculatorHero`, `PrimaryCTA`, `ShareCalculatorResult`, `MethodologyBlock`, `NextSteps` appear in the correct order.
- The client-side script (`<script>`) continues to work because the HTML IDs (`uf-input`, `pesos-input`, `swap-btn`, `resultado`, `resultado-texto`, `resultado-sub`, `economic-parameters`, `tabla-ref`) are preserved in the slot content.

## Open questions for future iterations

1. **Inverse/reverse mode** (e.g., sueldo-líquido→bruto, swappable UF↔CLP): should the shell provide a standard "swap mode" button, or is this calculator-specific? Current verdict: calculator-specific (too varied in UX).
2. **URL prefill** (`data-profile-bind`, `data-profile-prefill-host`): should the shell expose a `profilePrefillHost` prop? Currently only 3 calculators use it (comisiones-afp, apv, sueldo-liquido). It could be an optional prop in a minor shell iteration.
3. **Multi-step calculators** (finiquito-indemnizacion, simulador-renegociacion): the single-form layout doesn't fit well. Would need a `steps` slot or a completely separate layout path. These calculators may always remain outside the shell.
4. **Scenario panel** (`CalculatorScenarios`): used by ~7 calculators. The scenario panel UI is shared but its data model is per-calculator. Should the shell include it as an optional slot or as a client-side script import? Deferred to a follow-up.
5. **FAQ heading customization**: the shell renders "Preguntas frecuentes" as the heading. Some calculators use "Preguntas frecuentes sobre {topic}". Could add a `faqTitle` prop.
