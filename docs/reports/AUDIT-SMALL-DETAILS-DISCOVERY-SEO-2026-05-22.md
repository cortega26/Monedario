# Audit Small Details - Discovery and SEO Details - 2026-05-22

Source plan: `docs/backlog/PLAN-audit-small-details-2026-05-22.md`

## Scope

Audit small discovery and SEO details without changing URLs or content. This lane covers breadcrumbs, hub ownership, related posts, internal links, search labels, snippets, route/RSS continuity, and ownership drift.

## Evidence

- `pnpm run check:routes`: pass, 11 known additions, 0 removals, `before=39 after=50`.
- `pnpm run check:rss`: pass, 35 known additions, 0 removals, `baseline=14 current=49`.
- `pnpm run check:no-postid-urls`: pass, scanned 205 source files.
- `pnpm run check-internal-links`: pass, 218 links, no broken links.
- `pnpm run audit:topic-overlap`: pass non-blocking, 50 articles, 35 candidates.
- `pnpm run check-editorial-structure`: pass, no long description warnings.

## Findings

| ASD | Priority | Severity | Finding | Disposition |
|---|---:|---:|---|---|
| ASD-201 | P0 | 3 | Breadcrumbs, related links, and ownership decisions need a drift pass against clusters and canonical topics. | `fix-now`; maps to `TD-0088`, `TD-0090`, `TD-0092`. |
| ASD-202 | P1 | 2 | Meta descriptions pass length checks, but promise/content mismatch still requires manual review. | `batch-later`. |
| ASD-203 | P1 | 3 | Homepage, hubs, search, archives, tags, and calculators index can drift through stale/manual destinations. | `batch-later`; maps to `TD-0089`. |
| ASD-204 | P1 | 3 | Public route/RSS identity checks are healthy in this audit. | `accepted-risk`; keep gates mandatory for remediation. |

## Topic-Overlap Detail

High candidate:

- `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` vs `como-invertir-en-etfs-desde-chile`.

Medium candidates include:

- `el-poder-del-interes-compuesto` vs `interes-compuesto-nota-metodologica`.
- `operacion-renta-centro` vs `operacion-renta-f22-checklist`.
- `seguro-cesantia-cuenta-individual-vs-fondo-solidario` vs `seguro-de-cesantia`.
- `como-calcular-sueldo-liquido` vs `sueldo-imponible-chile`.
- `descuentos-de-sueldo` vs `sueldo-imponible-chile`.
- `que-es-el-ipc-chile-como-se-calcula` vs `reajuste-arriendo-uf-ipc-chile`.

## Route and RSS Guardrail Result

The route/RSS gates show additions against old baselines, but no removals. This preserves:

- `ROUTES.NO_SILENT_CHANGES`.
- `RSS.NO_REMOVALS`.
- `URL.PUBLIC.NO_POST_ID`.

Do not refresh baselines in this audit-only pass.
