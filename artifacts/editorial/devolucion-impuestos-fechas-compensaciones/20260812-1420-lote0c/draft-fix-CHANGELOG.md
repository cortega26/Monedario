# Draft fix change log — 2026-10-02

## Scope

- Updated `src/data/blog/devolucion-impuestos-fechas-compensaciones.md` for
  DEFECT #1 and #2.
- Registered the material changes in `src/data/correcciones.json` under
  `devolucion-impuestos-plazo-y-multas`, as required by NORMA_YMYL §5.4.
- Appended `## Addendum 2026-10-02` to the existing
  `07-publish-packet.md`; no historical checklist text or gates were changed.
- The calendar table, `$3.000.000` threshold, slug, title, H1, and canonical
  remain unchanged.

## Diff summary

```diff
- Rectificatoria refund timing of around three weeks without its specific FAQ.
+ Around three weeks after SII authorizes the amount to TGR, citing FAQ
+ 001.140.0516.011 adjacent to the claim, in articleLead.officialSources,
+ and in “Fuentes y referencias primarias”.
```

```diff
- Late filing: individual fine/interest left wholly unspecified.
+ Payment: SII lists 10% through five months, then 2% per month/fraction
+ up to 30%, plus penal interest. Refund/no payment: 1 UTM–1 UTA fine;
+ the corresponding FAQ subsections do not list penal interest. The article
+ explicitly defers the individual amount and any condonation eligibility.
```

```diff
- Article cutoff 2026-08-13; packet checklist cutoff 2026-08-12.
+ Article freshness fields and visible review date: 2026-10-02 after live
+ substantive re-verification. The packet preserves its original checklist
+ and records both historic cutoffs plus the current article cutoff in a new
+ Addendum 2026-10-02.
```

## Live sources fetched 2026-10-02

- SII FAQ 001.140.0516.011, updated 2026-04-13: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0516.htm — still says a refund from a rectificatoria is paid around three weeks after SII authorizes the amount to TGR.
- SII FAQ 001.140.3095.025, updated 2025-07-03: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3095.htm — checked the three distinct payment/refund/no-payment subsections and transcribed their published ranges without calculating an individual outcome.
- SII AT2026 calendar: https://www.sii.cl/noticias/2026/310326noti01pcr.htm — checked against the dates retained in the article; its table was not edited.
- SII AT2027 status check: https://www.sii.cl/destacados/renta/2026/ and https://www.sii.cl/noticias/2026/index.html — fetched and searched on 2026-10-02; the Renta landing page remained on AT2026 and the news index had no AT2027 calendar. The article records what was checked and when.

## Wording options for the human editor

The official ranges are clear; only the desired level of detail is editorially
ambiguous. Both alternatives defer an individual outcome:

- **Short:** “La multa depende del resultado: si la declaración atrasada arroja
  pago, el SII informa una multa de 10% y aumentos mensuales hasta 30%, además
  de interés penal; si arroja devolución o no hay pago, informa una multa de
  1 UTM a 1 UTA. El monto aplicable depende de tu caso.”
- **Long:** “Con pago, la FAQ del SII informa una multa de 10% sobre impuestos
  reajustados cuando el atraso no supera cinco meses; después sube 2% por mes
  o fracción, hasta 30%, y se agrega interés penal. Con devolución o sin pago,
  informa una multa de 1 UTM a 1 UTA; esas subsecciones no enumeran interés
  penal. El monto individual y la elegibilidad de condonación dependen de tu
  situación.”

The article uses the long variant for precision and includes the FAQ citation
next to the claim.

## Freshness-date criterion

This is a substantive correction to a benefit/timing claim and to late-filing
penalty guidance. Under NORMA_YMYL §5.1, `updatedDate`,
`articleLead.validAsOf`, and the visible review date are aligned to
2026-10-02 after the source checks above, including AT2027 status. The AT2026
date table remains intact. The packet addendum records the previous article
cutoff of 2026-08-13 against the checklist's historical 2026-08-12 cutoff and
the new article cutoff; it does not rewrite the prior checklist.

## Session provenance

- DraftAgent: Codex (OpenAI GPT-6), root instance `/root`, work continued on
  2026-10-02. This run resumed with existing worktree edits and reviewed the
  current article and `git diff HEAD`; it is not represented as a zero-exposure
  DraftAgent session.
- ComplianceAgent: the requested fresh round 8 was performed by a separate
  agent instance with no conversation history forked; see
  `06-compliance-round8.md`.
- HumanEditor: pending; no publication gate was signed.
