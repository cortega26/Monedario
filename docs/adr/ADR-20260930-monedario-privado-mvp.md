# ADR — Monedario Privado MVP

**Date:** 2026-09-30

**Status:** Accepted
**Trigger:** New non-indexable product route and a stricter privacy boundary.

## Context

Monedario needs a cheap way to validate whether visitors value personal-finance
analysis that does not require uploading financial data. The repository is also
under an indexable-URL freeze through 2026-11-02 and already enforces
`INVARIANT.PRIVACY.NO_FINANCIAL_EGRESS`.

The MVP therefore has to prove product utility without becoming a new SEO owner,
without weakening existing analytics/privacy contracts, and without introducing
a backend or heavy dependency before demand is established.

## Decision

1. Create `/privado/` as a direct-access experimental surface.
2. Declare it `noindex,follow` and exclude it from the sitemap through the
   centralized indexability contract.
3. Add an opt-in `privacyMode` to `Layout.astro`. In that mode the layout
   does not bootstrap first-party analytics or the service worker.
4. Add route-scoped Cloudflare Pages headers for `/privado/*` with
   `connect-src 'none'`, `form-action 'none'` and `Referrer-Policy:
   no-referrer`.
5. Keep financial parsing and aggregation in a pure domain module. Browser
   File/DOM APIs remain in the page layer.
6. Support CSV only, cap input at 10 MiB/100,000 rows, and do not persist files,
   transactions or derived results.
7. Make the public promise precise: financial inputs and derived results are
   processed locally and are not sent to Monedario or third parties. Do not
   claim that loading the webpage itself creates zero network traffic.

## Forward architecture

The MVP keeps one intentionally small implementation seam today, but future
capabilities are expected to evolve through four explicit stages rather than
growing ad hoc inside the page:

1. **Ingestion adapters** normalize generic CSV and, later, bank-specific
   CSV/XLSX/OFX/PDF exports into the same transaction shape.
2. **Validation and enrichment** resolve direction, categories, recurring
   movements and internal-transfer semantics with deterministic rules first.
3. **User review** exposes classifications and lets the user correct or persist
   local rules before totals are treated as trusted.
4. **Private history** may add opt-in encrypted local persistence and
   multi-period trends without making cloud sync the default.

A local assistant or other heavier compute remains optional and downstream of
those boundaries. It must not become a prerequisite for deterministic parsing
or weaken the no-financial-egress invariant.

The MVP page exposes this roadmap with explicit Available / Planned / Evaluating
states so future intent is visible without representing unfinished capability as
already shipped.

## Alternatives rejected

- **Use the normal analytics-enabled layout:** rejected because it weakens the
  product's strongest trust proposition and makes verification harder.
- **Ship DuckDB/WASM or local AI in v1:** rejected as premature complexity; the
  MVP can validate demand with deterministic TypeScript and no new dependency.
- **Launch as an indexable product page now:** rejected because it conflicts
  with the current utility-led/indexable-URL governance.
- **Persist imported data by default:** rejected because a shared device would
  turn a convenience feature into a privacy risk.

## Consequences

### Positive

- The privacy promise is backed by application structure, browser CSP and tests.
- No server-side financial-data liability is introduced.
- The feature is reversible and has no migration cost.
- Future bank-specific parsers can extend the pure domain boundary.

### Negative

- In-flow product telemetry is intentionally unavailable.
- Generic CSV inference will reject or misread some bank formats; the MVP must
  fail visibly rather than silently invent direction or meaning.
- Qualitative feedback and explicit future opt-in diagnostics will be needed to
  learn which formats fail in real use.

## Invariants and contracts

- `URL.PUBLIC.NO_POST_ID`: preserved; route is literal.
- `ROUTES.NO_SILENT_CHANGES`: route addition is covered by route verification.
- `INVARIANT.SEO.INDEXABILITY.CONTRACT`: central noindex declaration.
- `INVARIANT.PRIVACY.NO_FINANCIAL_EGRESS`: strengthened for this route.
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`: `/privado/` owns the
  experimental private-analysis surface without displacing an article,
  calculator or hub.

## Verification

See `docs/backlog/PLAN-monedario-privado-mvp-2026-09-30.md` for the executable
verification table and full change-control record.

## Rollback

Revert the feature PR. No user data, schema migration or persistent application
state requires cleanup.
