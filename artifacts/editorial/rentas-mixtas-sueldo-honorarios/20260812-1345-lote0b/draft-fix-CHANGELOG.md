# Draft fix change log — 2026-10-02

## Scope

- Updated `src/data/blog/rentas-mixtas-sueldo-honorarios.md` for DEFECT #1–#4.
- Added the complete five-page text extraction of the SII AT2026 Línea 23 PDF
  at `source-extract-l23-at2026.txt` for auditability.
- Registered the material changes in `src/data/correcciones.json` under
  `rentas-mixtas-apv-y-convenios`.
- Preserved the existing APV A/B descriptions, IGC `$11.265.804`, title, slug,
  H1, canonical, and AT2026 scope of the 14.5% withholding. No new amount was
  derived.

## Diff summary

```diff
- APV limits described separately without the shared 600 UF boundary,
- priority across A/B, or 10x cotization condition for the A bonus.
+ Shared 600 UF ceiling; imputation in order B monthly via employer, B direct,
+ A; excess eligible for neither. B monthly employer deduction is limited to
+ 50 UF. A bonus eligibility also states the same-year 10x mandatory
+ cotization condition.
```

```diff
- TGR's 10%-30% down payment and guarantee criterion presented as a general
- convenio rule.
+ The range and guarantee criterion are tied only to the TGR agreement for
+ overdue Impuestos Fiscales y Aduaneros.
```

```diff
- 14.5% references could be read outside income earned in 2025.
+ Each such reference is limited to boletas issued in 2025 for AT2026.
```

## Live sources fetched 2026-10-02

- SII F22 AT2026, Línea 23, exact requested PDF: https://www.sii.cl/servicios_online/renta/2026/archivos/l23_instruccion.pdf. Downloaded from that URL on 2026-10-02; `pdfinfo` confirmed five pages; `pdftotext -layout` extracted the full PDF to `source-extract-l23-at2026.txt` (274 lines, 3,228 words). Section 23.4 confirms the 600 UF aggregate limit across either regime, the priority order (monthly employer deduction, direct APV B, APV A), and that excess cannot use either regime. §§23.2 and 23.4 confirm the monthly 50 UF ceiling.
- SII F22 AT2025, corroborating prior version: https://www.sii.cl/servicios_online/renta/2025/archivos/l23_instruccion.pdf — live-refetched and text-extracted; checked for the same limit and priority rule.
- Superintendencia de Pensiones, Compendio Chapter XII, general APV: https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html — live-refetched; checked the 15%/6 UTM bonus and the condition limiting eligible annual savings to ten times mandatory cotizations for the same year.
- Superintendencia de Pensiones, Compendio Chapter XI, APVC: https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html — live-refetched; retained only for collective APV (APVC) context.
- SII APV FAQ 001.140.5883.011: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm — live-refetched to confirm the existing A/B explanations.
- TGR exact page requested: https://tgr.gob.cl/convenios-de-pago/ — live-refetched. The 10%–30% down payment, up to 24 monthly installments, and criterion involving payment behavior and a guarantee appear under the product for overdue Impuestos Fiscales y Aduaneros; the text now scopes those terms to that product.
- SII IGC values for AT2026: https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html — live-refetched; confirms the existing 13.5 UTA / `$11.265.804` exemption figure.
- SII boleta withholding rates: https://www.sii.cl/destacados/boletas_honorarios/ — live-refetched; confirms 14.5% for boletas issued in 2025, and higher rates for 2026 and 2027. The article keeps 14.5% limited to its 2025/AT2026 context.
- SII AT2027 status: https://www.sii.cl/destacados/renta/2026/ and https://www.sii.cl/noticias/2026/index.html — fetched and searched on 2026-10-02; no AT2027 calendar was present in the current Renta landing page or 2026 news index. The article states the pages and date checked.

## Freshness-date criterion

These are substantive corrections to the shared APV ceiling, eligibility for
the A bonus, the scope of a payment product, and the time scope of a published
rate. Under NORMA_YMYL §5.1, `updatedDate`, `articleLead.validAsOf`, and the
visible review date are aligned to 2026-10-02 after the source checks above,
including IGC, APV, the withholding-rate period, and AT2027 status. The
AT2026 figures remain explicitly scoped to income earned in 2025.

## Calculation boundary

`requires_calculation=false`. This patch adds no derived figure or worked
calculation; it transcribes published caps, percentages, and priority from the
official sources. No `05-*` file was created or changed.

After Compliance round 5 identified that the article lacked the example
required by DoD §2, an orientative AT2026 example was added using the SII's
published 14.5% withholding rate for boletas issued in 2025. It does not derive
tax, refund, additional payment, or an individual amount; `requires_calculation`
remains `false`.

## Session provenance

- DraftAgent: Codex (OpenAI GPT-6), root instance `/root`, work continued on
  2026-10-02. This run resumed with existing worktree edits and reviewed the
  current article and `git diff HEAD`; it is not represented as a zero-exposure
  DraftAgent session.
- ComplianceAgent: the requested fresh round 5 is assigned to a separate
  agent instance with no conversation history forked; its report is kept
  separate from this changelog.
- HumanEditor: pending; no publication gate was signed.

## Follow-up after Compliance round 6 — 2026-10-02

The historical `06-compliance-round6.md` remains a FAIL for the version it
reviewed. Its substantive findings were corrected in the article before this
follow-up review:

- Replaced the claim that anyone with salary plus honorarios must always file
  with the AT2026 threshold rule: taxable income above 13.5 UTA is mandatory
  under the cited honorarios rule; at or below it, filing may be voluntary to
  request eligible withholding or credit refunds. Other legal filing grounds
  remain possible.
- Replaced the claim that the SII proposal automatically omits honorarios.
  The article now says the proposal uses information reported by withholding
  agents and informants, should be checked for missing or incorrect data, and
  can be corrected before filing.
- Replaced the calculation over gross salary plus gross honorarios with a
  distinction between gross honorarios, applicable expenses/adjustments, the
  taxable bases, and credits or withholdings compared in the F22.
- Replaced the example with an official threshold example at 13.5 UTA
  (`$11.265.804`). It uses no derived arithmetic or personal result;
  `requires_calculation=false`.

## Additional live sources fetched 2026-10-02

- SII FAQ 001.140.0972.009, https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0972.htm — confirms the AT2026 filing threshold for honorarios and voluntary filing under the threshold to request withholding refunds.
- SII FAQ 001.140.2772.027, https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2772.htm — confirms the proposal uses reported agent/informant data and can be reviewed or corrected when information is missing or incorrect.
- SII Practical Guide AT2026, https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf — refetched; checked filing threshold and honorarios taxable-base treatment.
- SII Independent Workers Guide AT2026, https://www.sii.cl/destacados/renta/2026/documents/pr_independiente.pdf — refetched; checked the reported-data proposal and its review/correction path.
- SII Formulario 22 AT2026, https://www.sii.cl/ayudas/formularios/f22_at2026.pdf — refetched; checked distinction between gross honorarios, expenses, and taxable amount.
- SII AT2026 natural-person values, https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html — refetched; reconfirmed 13.5 UTA / `$11.265.804`.

## Date criterion and closure

These are substantive factual changes under NORMA_YMYL §5.1. The freshness
fields remain aligned at `updatedDate: 2026-10-02`,
`articleLead.validAsOf: 2026-10-02`, and visible review date 2026-10-02. The
same-day checks of the SII Renta 2026 landing page and 2026 news index found
no AT2027 calendar; the article records those pages and the check date. No
new amount was derived and no `05-*` artifact was created. The earlier round
6 report remains unchanged; a separate fresh Compliance round 7 must review
this follow-up version. Drafting provenance remains the root instance
continuing existing worktree edits, not a fresh DraftAgent session.
HumanEditor signature and publication gates remain pending.

## Follow-up after Compliance round 7 — 2026-10-02

The historical `06-compliance-round7.md` remains FAIL for the version it
reviewed. Its material APV A finding was confirmed by a live fetch of
Superintendencia de Pensiones, Compendium Chapter XII on 2026-10-02: numbers
5–6 condition the 15% bonus on savings allocated to advance or increase the
pension, and number 7 sets the ten-times mandatory-contribution limit. The
article's Régimen A explanation and APV FAQ now state that pension destination
condition, with a citation to numbers 5–7. No early-withdrawal treatment was
added because the article does not explain withdrawals.

The round 7 report also said no material correction entry existed. A direct
check of the current worktree found `rentas-mixtas-apv-y-convenios` already
present in `src/data/correcciones.json`, linked to the article, and
`check:correcciones` had validated 12 entries. The existing entry did not yet
record the newly found pension-destination condition, so its `wrong` and
`fixed` descriptions have now been expanded rather than adding a duplicate.
The public-page source imports the registry directly; an independent fresh
round 8 review must verify the current worktree record and the gate result.

These remain substantive changes under NORMA_YMYL §5.1. The aligned freshness
fields stay at 2026-10-02; the source was rechecked on that date. No figure was
derived (`requires_calculation=false`), no `05-*` was created, and no title,
slug, H1, or canonical was changed. A fresh Compliance round 8 must review
this final version. The DraftAgent provenance remains the root instance
continuing prior worktree edits; HumanEditor sign-off and publication gates
remain pending.

## DoD structure and rate-table follow-up — 2026-10-02

A holistic Compliance review communicated two preliminary blockers but did not
save a formal round 9 report: the article lacked the DoD §2 H2 “Qué es / Qué
cambia”, and it questioned the effective-rate column as derived. The article
now has `## Qué es y qué cambia con las rentas mixtas`, with explanation based
on existing claims and citations to the SII proposal FAQ and F22. The table
retains its official UTA brackets and marginal rates and removes only the
one-decimal summary of effective maximum rates.

The source was refetched live on 2026-10-02. The SII AT2026 persons page
publishes the annual IGC table with factors and amounts to deduct; the SII
2026 Second Category table explicitly publishes maximum effective rates for
its brackets to two decimals. The removed article summary rounded these
published rates to one decimal; no calculation was introduced by this draft.
The corrections entry now describes that precision change without calling the
SII rates derived. `requires_calculation=false` remains accurate for this
change; no `05-*` artifact was created.

The article's freshness fields remain aligned to 2026-10-02. No title, slug,
H1, or canonical changed. Fresh holistic Compliance round 10 reviewed the
final article and returned PASS, 9.58/10; see `06-compliance-round10.md`.
The report records the live-fetch limits for the Línea 23 PDF, TGR page, and
independent AT2027 status check. DraftAgent provenance remains the root
instance resuming existing worktree edits. HumanEditor signature and
publication gates remain pending.

## Browser refetch after Compliance R10 — 2026-10-02 (America/Santiago)

After the editor asked for another attempt, Chrome rendered the exact official
sources that the R10 text extractor could not read. The official five-page
SII Línea 23 PDF opened in Chrome; its page 4 §23.4 visibly confirmed the
600-UF aggregate cap, allocation priority (monthly employer APV B, direct APV
B, then APV A), and exclusion of the excess. The exact TGR convenios page
loaded; its expanded “Convenio para deudas vencidas de Impuestos Fiscales y
Aduaneros” states up to 24 monthly installments, a 10%–30% down payment based
on payment behavior and whether there is a guarantee, and a 1-UTM minimum.

The SII Operación Renta portal loaded as the AT2026 portal. The 2026 news index
also loaded and showed a September 1 item about DJ 1965 taking effect from
Renta 2027, but no calendar item was visible in that index. This supports only
the dated, page-bounded status check; it does not establish that no AT2027
calendar exists elsewhere. Source URLs and the full observation are recorded
in `07-publish-packet.md`.

This supplements the R10 fetch limitations with successful browser-rendered
verification. It does not alter the article, freshness dates, or protected
metadata, and does not change the R10 report. No gate was marked or signed.
