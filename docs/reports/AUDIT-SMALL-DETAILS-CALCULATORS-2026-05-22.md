# Audit Small Details - Calculator Experience Details - 2026-05-22

Source plan: `docs/backlog/PLAN-audit-small-details-2026-05-22.md`

## Scope

Audit calculator trust details without changing formulas or UI. This lane covers labels, helper text, defaults, validation copy, result units, rounding explanations, exclusions, methodology blocks, source alignment, sharing, and next actions.

## Evidence

- Calculator pages present under `src/pages/calculadoras/`: 19.
- Calculator components present under `src/components/calculator/`.
- `pnpm run test`: pass, 87 files and 639 tests.
- `pnpm run check`: pass.
- `pnpm run format:check`: fail on pre-existing formatting drift in several calculator files and utilities; not remediated in this audit-only pass.
- Existing `TD-0087` and `TD-0094` may affect methodology/source labels.

## Findings

| ASD | Priority | Severity | Finding | Disposition |
|---|---:|---:|---|---|
| ASD-101 | P0 | 3 | Calculator microcopy needs a page-by-page pass for unit labels, rounding language, helper text, validation, and exclusions. | `fix-now`; copy-only remediation can be batched if formulas remain untouched. |
| ASD-102 | P0 | 4 | Methodology/source blocks may inherit source drift from economic-source and official-host registries. | `needs-human-review`; maps to `TD-0087`, `TD-0094`. |
| ASD-103 | P1 | 3 | Defaults, placeholders, example values, and edge input states are not covered by current gates. | `batch-later`; use manual/Playwright calculator scenarios. |
| ASD-104 | P2 | 2 | Share/result next-action copy should be reviewed for overpromising and event-label consistency. | `batch-later`. |

## Remediation Boundaries

- No formula changes in an ASD copy batch.
- No legal/tax/pension/labor interpretation changes without YMYL review.
- If a label or explanation changes the reader's understanding of a calculation, treat it as substantive and add tests plus editorial/source review.

## Suggested Representative Pass

Use one pass per calculator family:

- Salary/employment: `sueldo-liquido`, `finiquito-indemnizacion`, `seguro-cesantia`, `boleta-honorarios-liquido`.
- Debt/credit: `credito-consumo`, `tarjeta-credito`, `prepago-credito`, `simulador-renegociacion`, `dividendo-hipotecario`.
- Tax/economic units: `operacion-renta`, `impuesto-segunda-categoria`, `conversor-uf`, `conversor-utm`, `reajuste-arriendo`.
- Investment/pension: `apv`, `simulador-jubilacion`, `comisiones-afp`, `deposito-a-plazo`, `interes-compuesto`.
