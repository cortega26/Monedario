# VERIFY — fondos-afp-a-b-c-d-e remediation (2026-09-17)

**Scope:** uncommitted workdir diff of `src/data/blog/fondos-afp-a-b-c-d-e.md` only.
**Role:** ComplianceAgent, fresh session, zero prior context. I did not write the
changes under review. Read-only except for this report. No commit.
**Inputs read from disk:** `git diff` for the target file; audit context
`docs/reports/AUDIT-fondos-afp-a-b-c-d-e-2026-09-17.md`; sibling numerical
reference `src/data/blog/reforma-previsional-2025-que-cambia-y-como-te-afecta.md`
(L62, L90–92). SP primaries re-fetched live by me (see §1).

**Verdict: ACCEPT DIFF** — 8/8 hunks ACCEPT, 0 REJECT, 0 blockers.
Residuals (§4) are pre-existing audit findings outside the claimed scope, plus
two new observations (R7 sibling stale copy, R8 post-deadline re-check). None
blocks this diff.

## 1. Spot re-fetch (done by me, 2026-09-17/18 session)

### SP-10906 — cotización de cargo del empleador

- 1 % entre 01-08-2025 y julio 2026 (0,1 % cuenta individual + 0,9 % FAPP):
  confirmed, page uses past tense ("fue de 1 %").
- 3,5 % from 01-08-2026 until July 2027: confirmed ("A partir del 1 de agosto
  de 2026 y hasta julio de 2027 la cotización… será de 3,5 %"), breakdown
  confirmed verbatim: 0,1 % cuenta individual AFP + 2,5 % SIS/CEV + 0,9 % CRP
  (vía CRP financia el BAC). De cargo del empleador, no del sueldo líquido.
- 7 % total new contribution + gradual rollout over nine years (up to 11):
  confirmed. The year-by-year calendar table did not extract into my fetch
  (page truncated at ~129 KB before the calendar rows), so the exact
  "agosto de 2033" endpoint month is verified via the designated sibling
  reference (identical string in both files), not directly from SP text in
  this session. No contradiction found.

### SP-17076 — propuesta Régimen de Inversión FG (Santiago, 03/07/2026)

- Proposal-only framing confirmed: "publica para consulta propuesta",
  comments deadline "31 de julio" (= 31-07-2026 given dateline).
- 10 FG by birth year confirmed: 1 Inicial (≤35), 8 intermedios (cohortes de
  5 años), 1 Consolidación (75+). Glide path + carteras de referencia
  confirmed.
- Legal deadline for definitive regime 01-09-2026 + transition April 2027:
  confirmed ("fecha máxima de publicación el 1 de septiembre de 2026…
  en abril de 2027 se producirá la transición").
- New text says the definitive regime "estaba pendiente al cierre de la
  consulta (31-07-2026)" — past-tense anchored at consulta close, literally
  true and proposal-only. Whether the definitive regime has been published
  since the 01-09-2026 deadline is NOT verified in this session → R8.

### SP-9909 — fondos de pensiones (extra fetch for the age-restriction hunk)

- "a partir de los 51 años en el caso de las mujeres y de los 56 años en el
  caso de los hombres no podrán elegir el Fondo A… Asimismo, las pensionadas
  y los pensionados sólo pueden elegir los fondos C, D y E" — confirmed
  verbatim. (Nuance: page also notes a post-55 Fondo-A-for-surplus exception
  the insertion omits → R6, minor, not a blocker.)

## 2. Per-hunk disposition (target file only, 8 logical hunks)

| # | Hunk | Disposition + reason |
|---|---|---|
| H1 | Frontmatter `updatedDate` 2026-03-12 → 2026-09-17 | **ACCEPT.** Claimed scope; now satisfies `updatedDate ≥ validAsOf` (audit F13 resolved). |
| H2 | Frontmatter `articleLead.validAsOf` 2026-04-12 → 2026-09-17 | **ACCEPT.** Claimed scope; real refresh date, matches H1. No other frontmatter key touched (title/seoTitle/slug/heroImage/canonicalTopic/category/all dates otherwise identical). |
| H3 | "Qué cambia hoy" bullet: 3,5 % desde remuneraciones ago-2026 (0,1 / 2,5 / 0,9) + 1 % historicized to ago-2025/jul-2026 | **ACCEPT.** Rate, window, breakdown, and past-tense 1 % all match SP-10906 verbatim (§1). Audit F2 resolved. |
| H4 | FG bullet: keeps abril-2027 transition + adds "SP publicó en consulta (03-07-2026) una propuesta de 10 fondos asignados por año de nacimiento; régimen definitivo pendiente al cierre (31-07-2026)" | **ACCEPT.** Every element matches SP-17076 (§1); proposal-anchored, no definitive-regime claim. Audit F6 partially addressed as claimed. |
| H5 | "En paralelo" line → gradual climb to 7 % en agosto de 2033 (drops the false "agosto de 2027 → 3,5 %" clause) | **ACCEPT.** Banned "agosto de 2027 for the 3,5 % hike" removed; endpoint string identical to corrected sibling L62/L91 (see §3). Audit F1 resolved. |
| H6 | Calendar table: 1 % row windowed "(entre ago-2025 y jul-2026)"; 3,5 % row moved 2027 → "Agosto de 2026" with 0,1/2,5/0,9 breakdown | **ACCEPT.** Both rows match SP-10906 (§1). Claimed 2027→2026 fix confirmed present. |
| H7 | Age-restriction insertion after cambio-de-fondo paragraph (51/56 Fondo-A ban + pensionados C/D/E) | **ACCEPT.** Matches SP-9909 verbatim-compatible (§1). Compact, no overclaim. Audit F3 addressed as claimed. |
| H8 | Sources list +3 SP links (10906 rate, 9909 limits/restrictions, 17076 FG proposal); ChileAtiende + 16668 + BCN Ley 21.735 retained | **ACCEPT.** All three URLs are the correct primaries fetched in §1; no dead/renamed links introduced. |

REJECT count: 0. No hunk misstates a source, overclaims definitive status, or
touches out-of-scope surface.

## 3. Banned-remnant grep + cross-file consistency + scope gates

- `agosto de 2027` for the 3,5 % hike in target file: **absent** (only remaining
  2027 mention is the correct abril-2027 FG transition). PASS.
- `1%` as current rate in target file: **absent** — both occurrences are
  historicized ("fue de 1 %", "entre ago-2025 y jul-2026"). PASS.
- Missing age restrictions: **present** (H7, SP-verified). PASS.
- Cross-file figures fondos vs reforma-previsional (L62/L91–92): 3,5 / 0,1 /
  0,9 / 2,5 / ago-2026 / 1 %-ago-2025-jul-2026 / 7 %-ago-2033 — **identical,
  zero divergence**. PASS. (Ordering differs: fondos lists 0,1/2,5/0,9,
  sibling lists 0,1/0,9/2,5. Same numbers, same destinations. Not a
  divergence.)
- Scope: `git diff` for the target file contains **only** H1–H8. No slug /
  canonical / title / hero / route / code change. Frontmatter delta limited
  to `updatedDate` + `validAsOf`. No F4 aprobado/rige layers, no F5
  `volatileData`/dataset/`dataTriggers` change (`dataTriggers: []`
  untouched), no F9-style statistical labels added. **PGU amount absent**
  (no PGU match in file). PASS.
- Workdir hygiene note (not a blocker, not attributed to this pass): other
  dirty paths exist (`src/components/NextSteps.astro`,
  `src/config/editorial-topic-policy.mjs`,
  `como-hacer-presupuesto-mensual-chile.md`, `renegociacion-superir.md`,
  untracked `cotizacion-voluntaria-afp-independiente.*` + `reddit-monitor/`).
  None is touched by the H1–H8 diff; all are out of scope for this verdict.

## 4. Residual list (not blockers — carry forward, do not reject H1–H8)

- R1 (audit F4, unclaimed): "Vigencia general de la reforma | Septiembre 2025"
  row retained without aprobado/rige layers. Still needs BCN-human verify.
- R2 (audit F5, unclaimed): still no `volatileData` / dated `dataTriggers`.
- R3 (audit F7, unclaimed): "Menores de 35 años → Fondo B" (L179) still
  excludes age 35; SP-9909 says "hasta 35 años".
- R4 (audit F8/F9/F10/F11/F12, unclaimed): "mayoría" Fondo C, unattributed
  afiliados stat, 2008 −40 % figure, "gratuito e ilimitado" sourcing,
  missing "resumen orientativo" label on the calendar table.
- R5 (audit NHV-1…NHV-4): all BCN-dependent verifications still open.
- R6 (new, minor): H7 omits SP-9909's post-55 Fondo-A-for-surplus exception.
  Conservative omission (restricts more than the law), not a falsehood.
- R7 (new, cross-article): `cuanto-descuenta-la-afp-de-tu-sueldo.md` L71 still
  states the stale "Desde agosto de 2027 … sube a 3,5 %". Same F1-class error
  now fixed here but alive in a sibling. Recommend queued refresh; out of
  this diff's scope.
- R8 (new, freshness): definitive FG regime deadline 01-09-2026 has passed
  relative to `validAsOf` 2026-09-17; H4's past-anchored wording stays true,
  but confirm whether the definitive regime is now published and refresh the
  sentence if so.

## 5. Gate outputs

- `pnpm exec prettier --check` on this report: PASS (see final message).
- `git diff --check`: PASS, no whitespace errors (see final message).
- No article file edited, nothing committed, per instructions.

STOP triggers: none fired (no Constitution/AGENTS hard-stop collision; no
slug/route/RSS surface touched; no YMYL draft+audit same-session violation —
this session performed verification only).
