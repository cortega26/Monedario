# Draft fix change log — 2026-10-02

## Scope

- Updated `src/data/blog/operacion-renta-f22-checklist.md` for R5-01 through
  R5-05, retaining its slug, title, H1, canonical, and AT2026 date table.
- Registered the material changes in `src/data/correcciones.json` under
  `operacion-renta-f22-multas-reliquidacion`, as required by NORMA_YMYL §5.4.
- No new amount was calculated. The example classifies outcomes under SII's
  published rules and does not compute an individual's penalty.

## Diff summary

```diff
- “multa e interés” described as a general consequence of late filing
+ payment: 10% through five months, then 2% per month/fraction up to 30%,
+ plus penal interest; refund/no payment: 1 UTM–1 UTA fine, with no interest
+ listed in those FAQ subsections
```

```diff
- two or more simultaneous employers: unconditional declaration trigger;
- likely additional payment
+ simultaneous employers: annual IUSC reliquidation/F22 applies to wages
+ subject to IUSC; the annual reliquidation determines whether a difference
+ remains
```

```diff
+ An obligated non-filer is cited to SII offices and receives the
+ “No declarante F22” annotation (SII p7renta.htm).
+ Added a short rule-based example using only published SII thresholds and
+ rates; no personal fine amount is derived.
```

## Live sources fetched 2026-10-02

- SII FAQ 001.140.3095.025, updated 2025-07-03: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3095.htm — separates late F22 with payment, refund, and no-payment outcomes. The payment subsection gives 10% for delay up to five months, then 2% per month or fraction up to 30%, plus penal interest; refund and no-payment subsections list a 1 UTM–1 UTA fine and do not list penal interest.
- SII FAQ 001.140.2712.022, updated 2025-07-18: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2712.htm — requires annual IUSC reliquidation/F22 for wages subject to IUSC received from multiple simultaneous employers; it does not promise an additional payment.
- SII non-filer information: https://www.sii.cl/contribuyentes/p7renta.htm — says a person obligated to file who does not file will be cited to SII offices and may receive the “No declarante F22” annotation.
- SII AT2026 calendar and current cycle material: https://www.sii.cl/noticias/2026/310326noti01pcr.htm and https://www.sii.cl/destacados/renta/2026/personas/ — checked the fixed AT2026 calendar/date claims retained in the article.
- SII AT2027 status check: https://www.sii.cl/destacados/renta/2026/ and https://www.sii.cl/noticias/2026/index.html — fetched and searched on 2026-10-02; the Renta landing page remained on AT2026 and the 2026 news index had no AT2027 calendar. The article records the pages and date checked rather than asserting a future publication date.

## Freshness-date criterion

The correction changes the answer anchor and material guidance on late-filing
penalties and who must reliquidate IUSC. Under NORMA_YMYL §5.1 this is
substantive, so `updatedDate`, `articleLead.validAsOf`, and the visible review
date are aligned to 2026-10-02 after the live checks above. The article's
AT2026 calendar table remains unchanged.

## Example calculation boundary

`requires_calculation=false`. The example applies published categories and
rates without multiplying a hypothetical tax amount or deriving an individual
penalty.

## Session provenance

- DraftAgent: Codex (OpenAI GPT-6), root instance `/root`, work continued on
  2026-10-02. This run resumed with existing worktree edits and reviewed the
  current article and `git diff HEAD`; it is not represented as a zero-exposure
  DraftAgent session.
- ComplianceAgent: the requested fresh round 6 was performed by a separate
  agent instance with no conversation history forked; see
  `06-compliance-round6.md`.
- HumanEditor: pending; no publication gate was signed.
