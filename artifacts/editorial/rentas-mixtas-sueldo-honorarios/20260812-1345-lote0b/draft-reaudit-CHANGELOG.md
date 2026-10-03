# Draft re-audit changelog — rentas mixtas

## Scope

- Edited only `src/data/blog/rentas-mixtas-sueldo-honorarios.md` and this changelog.
- Added the missing visible sections `Errores comunes`, `Preguntas frecuentes`, and `Fuentes y vigencia normativa`.
- Preserved the IGC threshold `$11.265.804`, the APV block, the slug, title, H1, canonical, and the post-`2b1f681f` correction that uses 14,5% for boletas issued on 2025 income.

## Sources reused from the run

- SII, AT2026 personal income values and IGC exemption: <https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html>.
- SII, 2026 Second Category tax table: <https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm>.
- SII, APV regimes under LIR article 42 bis: <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm>.
- Superintendencia de Pensiones, APV fiscal bonus: <https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html>.
- TGR, payment agreements: <https://tgr.gob.cl/convenios-de-pago/>.

These sources and their prior retrieval notes are recorded in `02-dossier.md`, `05-math-audit-round2.md`, and `07-publish-packet.md` in this run. No additional figure or calculation was needed; no `requires_calculation=true` blocker was raised. No new normative date was introduced; the existing AT2026 and income-year context was retained.

## Date criterion

`updatedDate` changed from `2026-09-29` to `2026-10-02`. NORMA YMYL §5.1 treats FAQ expansion as a substantive coverage change. This line records the change, reason, and supporting official sources as required by §5.3. `articleLead.validAsOf` remains `2026-08-12`; no new live source retrieval was performed for this structural drafting pass.

## Verification

- `pnpm run check:frontmatter` — passed; scanned 54 articles, no blocking errors.
- `pnpm run check:links` — passed; scanned 277 internal links, no broken links. One unrelated orphan warning: `cotizacion-voluntaria-afp-independiente.md`.
- `pnpm run format:check` — passed; Prettier reported all files formatted.

## Blockers

None identified for these three structural additions. No compliance review, audit verdict, gate mark, or signature was produced in this DraftAgent session.
