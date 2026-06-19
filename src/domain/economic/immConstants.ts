/**
 * Ingreso Mínimo Mensual (IMM) — managed legal constant.
 *
 * mindicador.cl does NOT publish the IMM, so it is maintained by hand. This is
 * the single source of truth for the APP RUNTIME (the economic provider and the
 * client-side salary calculator fallbacks). It is dependency-free on purpose so
 * it can be imported into client bundles without pulling Node APIs (see Plan
 * 022 for the same leaf-module constraint).
 *
 * NOTE: two generators keep their own mirrors for runtime reasons and must be
 * updated in lockstep when a new ley reajusta el IMM:
 *   - scripts/refresh-economic-snapshot.mjs (Node script, cannot import .ts)
 *   - workers/economic-snapshot-refresh/src/buildSnapshot.ts (separate Worker bundle)
 * The provider test (tests/infrastructure/EconomicParameterProvider.test.ts) also
 * keeps an independent IMM_LEGAL_FLOOR regression guard.
 */

/** IMM en pesos. Reajuste despachado a ley 2026-06-16, vigente desde 2026-05-01. */
export const DEFAULT_IMM = 553_553;

/** Fecha de vigencia legal del IMM (ISO YYYY-MM-DD). */
export const DEFAULT_IMM_EFFECTIVE_DATE = "2026-05-01";
