# VERIFY — `cuanto-descuenta-la-afp-de-tu-sueldo` (fresh session)

- **Verification date:** 2026-09-19 (UTC), zero prior context, disk only.
- **File verified:** `src/data/blog/cuanto-descuenta-la-afp-de-tu-sueldo.md`
- **Diff inspected:** `git diff -- src/data/blog/cuanto-descuenta-la-afp-de-tu-sueldo.md`
  (UNCOMMITTED workdir diff; per-file stat: 6 insertions, 6 deletions).
- **Scope of this verifier:** READ-ONLY on the article plus this report.
  No edits to the article or any other file. No commit.
- **Stale-report note:** an untracked report under this same path already
  existed (describing a 3+/3- state with L68/L80/L86 still stale). The
  workdir has since moved on: all six expected hunks are now present.
  This report overwrites it with a fresh from-disk verification.

## 1. Source re-fetch (Superintendencia de Pensiones)

Re-fetched by this verifier on 2026-09-19:

- `https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-10906.html`
  ("Cotización de cargo del empleador")

Literal SP quotes (gradualidad del aporte):

> "entre el 1 de agosto de 2025 y julio de 2026 el aporte del empleador
> fue de 1% de la remuneración de la o el trabajador, distribuyéndose
> en un 0,1% para la cuenta de capitalización individual de
> cotizaciones obligatorias, que es la que administra la AFP, y el 0,9%
> restante para el FAPP."

> "A partir del 1 de agosto de 2026 y hasta julio de 2027 la cotización
> de cargo del empleador será de 3,5%: un 0,1% irá a la cuenta de
> capitalización individual obligatoria en la AFP y el resto al FAPP.
> En este caso, la distribución será la siguiente: un 2,5% se usará
> para financiar el Seguro de Invalidez y Sobrevivencia (SIS) y la
> Compensación por Diferencias de Expectativa de Vida (CEV), mientras
> que el restante 0,9% se destinará a la nueva Cotización con
> Rentabilidad Protegida".

Adversarial note: the SP page phrases the 3,5% window as "A partir del
1 de agosto de 2026"; the article (and both sibling files) phrase it as
"desde las remuneraciones de agosto de 2026". Same month, same rate,
same breakdown — remuneration-month phrasing, no semantic gap.
Verification date (2026-09-18/19) falls inside the SP Aug-2026–Jul-2027
window, so present-tense "es de 3,5%" is correct today.

## 2. Per-hunk disposition (6 hunks, `git diff` order)

- **H1 — frontmatter `validAsOf: 2026-04-22` → `2026-09-18`: ACCEPT.**
  Declared hunk; date-only, matches body cutoff (H6).
- **H2 — frontmatter `updatedDate: 2026-09-13` → `2026-09-18`: ACCEPT.**
  Declared hunk; date-only, no other frontmatter line touched.
- **H3 — L68, 1% historicized: ACCEPT.**
  Old: "Desde agosto de 2025 existe una cotización adicional del
  empleador de 1%". New: "Entre agosto de 2025 y julio de 2026 rigió
  una cotización adicional del empleador de 1%". Matches the SP window
  literally (§1, first quote). Present-tense-1% remnant eliminated.
- **H4 — L71, 3,5% since Aug-2026 with breakdown: ACCEPT.**
  New: "Desde las remuneraciones de agosto de 2026 la cotización
  adicional del empleador es de 3,5% (0,1% a tu cuenta individual, 0,9%
  a CRP y 2,5% a SIS/CEV; entre agosto de 2025 y julio de 2026 fue de
  1%), con alzas posteriores hasta 7%." Rate (3,5%), breakdown
  (0,1/0,9/2,5 with matching destinations, order-only difference), and
  both windows match the SP quotes literally. "Hasta 7%" matches the SP
  final-regime 7% additional contribution (8,5% total employer charge
  including the pre-existing 1,5% SIS).
- **H5 — L80 calendar row `Agosto 2027` → `Agosto 2026`: ACCEPT.**
  New: "| Nueva etapa cotización empleador | Agosto 2026 | Aporte
  adicional sube a 3,5%. |". Matches SP window and H4. The "agosto de
  2027" hike-date remnant is eliminated.
- **H6 — L86 body cutoff `2026-04-22` → `2026-09-18`: ACCEPT.**
  Declared hunk; aligns body cutoff with frontmatter `validAsOf` (H1).

## 3. Three-file numerical agreement (3,5 / 0,1 / 0,9 / 2,5 / Aug-2026)

Target file L71 (quoted in §2, H4) versus the two references:

Reference 1 — `reforma-previsional-2025-que-cambia-y-como-te-afecta.md`:

- L62: "Fue de **1%** entre agosto de 2025 y julio de 2026 y es de
  **3,5%** desde las remuneraciones de agosto de 2026; la ley contempla
  subidas graduales hasta **7%** en agosto de 2033."
- L91 (table): "La cotización es de **3,5%** desde las remuneraciones
  de agosto de 2026 (0,1% a tu cuenta individual, 0,9% a Cotización con
  Rentabilidad Protegida (CRP) y 2,5% al SSP: SIS y Compensación por
  Diferencias de Expectativa de Vida (CEV)); entre agosto de 2025 y
  julio de 2026 fue de 1%."

Reference 2 — `fondos-afp-a-b-c-d-e.md`:

- L67: "La cotización adicional del empleador es de **3,5%** desde las
  remuneraciones de agosto de 2026 (0,1% a tu cuenta individual, 2,5% a
  SIS/CEV y 0,9% a CRP); entre agosto de 2025 y julio de 2026 fue de
  1%."
- L79 (calendar): "Alza aporte empleador a 3,5% | Agosto de 2026 |
  3,5% de cargo empleador: 0,1% cuenta individual + 2,5% SIS/CEV +
  0,9% CRP."

All three files agree on all five values (3,5 / 0,1 / 0,9 / 2,5 /
remuneraciones de agosto de 2026, plus 1% Aug-2025–Jul-2026).
Enumeration order of the breakdown differs; values and destinations do
not. **Agreement confirmed.**

## 4. Banned remnants (grep on the article — all clear)

Patterns grepped (case-insensitive where applicable): `agosto de 2027`,
`Agosto 2027`, `2026-04-22`, present-tense-1%
(`Desde agosto de 2025 existe` / `existe una.*cotización adicional.*de 1%`).

Result: **NO MATCHES.** All three banned classes are gone from the file.

## 5. Scope gate

- Per-file stat: 6 insertions, 6 deletions, exactly the six hunks in §2.
- `+/-` lines contain no `slug`, `title`, `seoTitle`, `description`,
  `heroImage`, `canonicalTopic`, `pubDate`, route, link-href, or code
  changes (verified by grepping the diff `+/-` lines; `officialSources`
  hrefs appear only as unchanged context).
- Frontmatter changes limited to `validAsOf` and `updatedDate`.
- **Scope confirmed:** only the expected hunks.
- Out-of-scope caveat (not a blocker, not judged here): the workdir
  contains other uncommitted changes from parallel passes (other
  articles, `src/components/NextSteps.astro`, deletions under
  `output/`, untracked files). They are outside this verification.

## 6. Residual list

1. (Minor, non-blocking) L71 says "con alzas posteriores hasta 7%"
   without the target date; sibling files pin "7% en agosto de 2033".
   True but less precise — optional hygiene, not a rejection ground.
2. None blocking. No stale 1%-present, no 2027 hike date, no old cutoff.

## 7. Verdict

**ACCEPT DIFF.** All six expected hunks are present and correct; L68 +
L71 + L80 match the re-fetched SP source literally (rate, breakdown,
windows); three-file numerical agreement holds with quotes; banned
remnants are absent; scope stayed bounded to the declared hunks plus
date-only frontmatter.

**STOP triggers:** none. No slug/URL-canonical changes, no new public
URLs, no publication gates signed, no same-session YMYL draft+audit
mixing (read-only verification plus report).
