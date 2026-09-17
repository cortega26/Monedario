# VERIFY — `donde-ver-si-estoy-en-dicom-gratis` (2026-09-17)

Status: ComplianceAgent, fresh session, zero prior context, disk-only.
Scope — in: `src/data/blog/donde-ver-si-estoy-en-dicom-gratis.md`
workdir diff, run `2026-09-17-lote1-02` (`04-draft.md`,
`06-compliance.md`), pilot bar
(`informe-deudas-cmf-vs-dicom/2026-09-16-pilot-01/06-compliance-delta2.md`),
live re-fetch of primary sources. Out: article edits, code, commits,
slug/route/title changes. No file was edited except this report.

Bar applied (pilot delta2): attributions to Ley 19.628 (not 20.575 for
deletion), CMF-sin-papel channel discipline, lag rule with NO "10-20"
magnitude, employer carve-out, no OS-9/PDI, no "ilimitado".

## 1. Diff under review (7 hunks, `git diff HEAD`)

H1: `updatedDate: 2026-04-12T18:30:00Z` → `2026-09-17T12:00:00Z`.
H2: `validAsOf: 2026-04-12` → `2026-09-17`.
H3: heading `### Informe de Deudas CMF — gratis, ilimitado` → `gratis`.
H4: `muestra todas las deudas vigentes con bancos, cooperativas,
emisores de tarjetas y otras entidades supervisadas` → `muestra las
deudas vigentes con bancos, cooperativas y demás entidades sujetas a
fiscalización de la CMF`.
H5: `Puedes descargarlo las veces que quieras, sin costo` →
`Puedes descargarlo sin costo`.
H6: `con tu RUT y número de serie del carnet.` → `con tu RUT.`
H7 (FAQ lag): `se actualiza semanalmente, pero los datos pueden venir
con un desfase de 10 a 20 días hábiles desde la operación real` →
`se actualiza semanalmente, con antecedentes al cierre de cada viernes
y al último día del mes`.

## 2. Primary-source re-fetch (2026-09-17, this session)

- CMF Educa `w3-article-27663.html`: FETCH OK. Literal: debts
  with "las entidades sujetas a la fiscalización de la CMF, en
  general bancos y cooperativas" go in the weekly Estado de
  Deudores; data "referida al cierre de cada viernes y al último
  día del mes"; natural person enters with "Clave Única otorgada
  por el Registro Civil", RUN + clave, "obtendrá su Informe de
  Deudas inmediatamente"; Boletín and DICOM-Equifax follow
  "D.S. N° 950" and "Leyes 19.628 y 19.812", are "empresas
  privadas, no sujetas a fiscalización de este Organismo". No
  mention of Ley 20.575, no "ilimitado", no "10-20", no
  "emisores de tarjetas", no "número de serie".
- CMF institucional `w4-article-95399.html` (Personas Naturales):
  FETCH OK. `Costo: Gratuito`; online needs only ClaveÚnica;
  `§8 ¿Qué vigencia tiene?`: "se actualiza semanalmente, con un
  desfase de entre 10 y 20 días respecto de la fecha en que se
  realiza la consulta" (no "hábiles").
- ChileAtiende ficha 2614 (Informe de deudas del sistema
  financiero): FETCH OK. Same lag sentence ("desfase de entre 10
  y 20 días", no "hábiles"); titular online needs ClaveÚnica,
  presencial needs cédula; tercero autorizado needs poder
  notarial ≤ 1 año; heredero needs posesión efectiva + certs.
- `conocetudeuda.cmfchile.cl/informe-deudas/`: FETCH returns
  title only (JS app, no extractable body). Confirms dossier:
  portal wording/frequency cannot be sourced there.

Nuance recorded: the "10-20" magnitude IS literally sourced on
the CMF institutional page and ChileAtiende (both without
"hábiles"). The dossier's "sin fuente" is precise only for the
exact old string with "hábiles" and for CMF-Educa scope. The
pilot bar nevertheless forbids ANY "10-20" magnitude (delta2
§2), so removal remains the bar-compliant disposition.

## 3. Per-hunk disposition (adversarial; 7 ACCEPT, 0 REJECT)

| Hunk | Disposition | Reason (false→true, source-bound) |
| --- | --- | --- |
| H1 `updatedDate` | ACCEPT | Frescura stamp only, no factual claim. Within annual cadence. |
| H2 `validAsOf` | ACCEPT | Same; pairs with H1, R14 direction. |
| H3 remove `, ilimitado` | ACCEPT | Removes unsourced superlative. No source says "ilimitado"; Costo:Gratuito supports bare "gratis". Strict narrowing. |
| H4 entities scope | ACCEPT | Drops "todas" (overstates; CMF excludes retail/telecom) and unsourced "emisores de tarjetas". Adopts near-literal official formula ("entidades sujetas a fiscalización", "en general bancos y cooperativas"). Does not exceed source. |
| H5 remove `las veces que quieras` | ACCEPT | Drops unsourced frequency. Retained "sin costo" backed by Costo:Gratuito + "de forma gratuita" (Conoce tu deuda). Strict narrowing. |
| H6 remove `y número de serie` | ACCEPT | Drops unverified documentary detail (dossier T3). "con tu RUT" is the minimal residue, consistent with "Escriba su RUN" literal. No new claim. |
| H7 lag → weekly + cierre | ACCEPT | New sentence is near-verbatim CMF Educa (weekly + cierre viernes/fin de mes). Drops "10 a 20 días hábiles": "hábiles" was never in any source; magnitude per se is bar-banned (pilot delta2 §2). Conservative and bar-compliant. |

Rejected hunks: none. No applied hunk exceeds its cited source;
each is a narrowing toward, or a quote of, the literal.

## 4. Banned-string sweep (file, post-diff)

- `"10 a 20"`: ABSENT — PASS (H7 removed).
- `"10-20" / "10–20"`: ABSENT — PASS.
- `"ilimitado"`: ABSENT — PASS (H3 removed).
- `"número de serie" / "numero de serie"`: ABSENT — PASS (H6).
- `"emisores de tarjetas"`: ABSENT — PASS (H4).
- `"las veces que quieras"`: ABSENT — PASS (H5).
- `"Ley 20.575" as deletion/free-consultation basis`: PRESENT
  (L88: "la Ley 20.575 te da derecho a pedir la eliminación…").
  FAIL — residual R1 (see §6). No other 20.575 mention exists.
- `"presencial en la CMF" as exclusive channel`: ABSENT — PASS
  (no exclusivity claim; institutional page confirms online +
  oficina + ChileAtiende all valid).
- `OS-9 / OS9 / PDI`: ABSENT — PASS.
- `arrendador access claims`: NO CMF-access claim present, but
  `arrendador` (L51, L92, L107) and `empleador` (L107 table row)
  remain WITHOUT the Ley 20.575 labor carve-out. Partial FAIL
  — residual R4 (see §6).

19.628/19.812 mentions: 0 (no re-attribution attempted — correct
without BCN literal).

## 5. Scope discipline — PASS

- `git diff --numstat`: 7 insertions / 7 deletions, one file.
- Frontmatter: only `updatedDate` + `articleLead.validAsOf`.
  Title, seoTitle, description, slug, pubDate, tags, category,
  cluster, topicRole, canonicalTopic, heroImage, articleLead
  answer/links, reviewPolicy all byte-identical to HEAD.
- No new sections/blocks/links: link diff is one modified line
  with identical URL (`claveunica.gob.cl`); heading diff is only
  the H3 deletion; no slug/canonical/title/hero/route/code touch.
- `reviewPolicy.computedAt` still `2026-05-06`: correct to leave
  for the publish step (R14), not for this minimal swap pass.

## 6. Residual list (still in file; publication blockers)

- R1-ALTA — L88 attributes protesto deletion to Ley 20.575.
  CMF Educa never mentions 20.575; it cites D.S. 950 + 19.628 /
  19.812. Needs human BCN literal verification + re-attribution
  (19.628 non-communication post-pago candidate) before publish.
- R2-ALTA — L86 "La ley contempla una modalidad de consulta
  básica gratuita" + table L105 "Gratuito básico": no article-level
  legal basis verified (Boletín site JS-blocked). Needs BCN/D.S.
  950 article cite or removal of the legal attribution.
- R4-ALTA — L127 "Ningún tercero puede acceder sin tu
  autorización" is overbroad: ChileAtiende confirms tercero
  autorizado con poder notarial + heredero CAN access. L107 keeps
  "empleador" with no Ley 20.575 art. 1 inc. 3 labor carve-out.
  Needs inciso-level cite or removal of "empleador".
- R5/MED — L82 CCS-admin + protesto definition: unverified in
  this pass (site JS-blocked). Needs boletincomercial.cl +
  normative base.
- R7/MED — L92 private-report composition (Boletín + retail +
  telecom + bienes/vehículos): unsourced per-emisor block.
- R8/MED — L117 reclamo "con número de folio" + "escalar
  directamente a la CMF": procedural, unsourced.
- R9/MED — L75 "El sistema genera el PDF en segundos":
  paraphrase of sourced "inmediatamente"; left untouched, minor.
- R10/MED — FAQ L138/L133 elimination-by-type + "probablemente":
  unsourced branches.
- R11/BAJA — RDC boundary (Ley 21.680): undecided; owner already
  carries it, mirror decision pending (human).

## 7. Left-unapplied review (was the skip genuine?)

Genuine BCN-blocked/structural/judgment: R1 (re-attribution
needs BCN literal — correctly NOT invented), R2 (legal basis),
R4-terceros regime, R5/CCS, R7/privados, R8/folio, R10, RDC.
Correctly left; attempting them from secondary fichas would
have violated the non-copy + literal-first rules.

Safely applicable but skipped (minor, non-blocking for this
diff, flagged for human): (a) deleting the single word
`empleador` from the L107 table row — a sourceless narrowing
that R4 itself offers as fallback ("cita… o retira"); (b)
softening L75 `en segundos` → `inmediatamente` to match the
CMF literal. Neither omission invalidates the 7 applied hunks.

## 8. Verdict

**ACCEPT DIFF.** 7/7 hunks ACCEPT, 0 REJECT; banned-removal
targets all confirmed absent; scope clean. The diff must stay;
nothing applied needs revert.

Publication remains **HOLD** (not lifted): residuals R1, R2, R4
(ALTA) plus MED/BAJA items above, `regulatory_sensitivity=alta`
with no human sign-off, no `07-publish-packet.md`, and the run's
12 TODO:SOURCE still open. Do not publish on this diff alone.

## 9. Gates run

- `pnpm exec prettier --check` on this report: run by agent,
  output recorded in final message.
- `git diff --check`: run by agent, output recorded in final
  message.
- No article file edited, nothing committed (this report is the
  sole new file).

## 10. STOP triggers

- Content STOP (publication): R1/R2/R4 ALTA unresolved; alta
  without human gates signature; 07 packet absent. Active.
- Diff-keeping STOP: none — no hunk is false, no scope breach,
  no new unsourced claim introduced.
