# Publish packet — `informe-deudas-cmf-vs-dicom` (run `2026-09-16-pilot-01`)

Status: BLOCKED — pending human sign-off
Decision: [ ] publish / [ ] hold

> Prepared by agent as unsigned scaffold. No gate is marked. Only the
> HumanEditor may check a box or record the decision. Marking any `[X]`
> by an agent violates `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` and
> `AGENTS.md` hard stops.

## 1. Artifact map

| # | Artifact | Path | State |
|---|---|---|---|
| 01 | Brief | `01-brief.yaml` | Complete (`requires_calculation=false`, `regulatory_sensitivity=alta`, cut-off `2026-09-16`, competitive-adaptation fields N/A — non-benchmark refresh) |
| 02 | Dossier | `02-dossier.md` | Complete (3 CMF fetches 2026-09-16; benchmark observations N/A and separated; Source Trust / Prompt Injection Notes clean, zero candidates) |
| 03 | Outline | `03-outline.md` | Complete (anchor answer, vigencia, differentiation line, owner/support boundary) |
| 04 | Draft v2 | `04-draft.md` | Complete, `TODO:SOURCE = 0` (12/12 resolved + R3 magnitude withdrawn 2026-09-17; 4 sub-items scope-reduced, not asserted) |
| 05 | Math audit | N/A — justified | `requires_calculation=false` confirmed by compliance §1 and delta2 §4 (no arithmetic in draft) |
| 06 | Compliance v1 | `06-compliance.md` | HOLD (14 flags: 6 alta / 7 media / 1 baja), superseded by deltas below |
| 06d1 | Compliance delta | `06-compliance-delta.md` | Stale-observation (audited pre-fix workdir; 2 ex-residuals fixed post-audit in same commit — see delta2 §adjudication) |
| 06d2 | Compliance delta2 | `06-compliance-delta2.md` | LIFT HOLD article-side, 14/14 CLOSED against final text |
| 06p | Pre-sign review | `06-presign-review.md` | Advisory only (external session). R3 accepted + fixed; integrity charge adjudicated stale-observation; browser-correlation closed per confirmation below |
| HV | Human verification | `HUMAN-VERIFY-checklist.md`, `HUMAN-VERIFY-results.md`, `HUMAN-BROWSER-CONFIRMATION.md` | 12 items A–L adjudicated; personal browser opening confirmed by owner 2026-09-17 |

## 2. Role separation map (`DraftAgent ≠ MathAuditAgent ≠ ComplianceAgent`)

| Stage | Agent / session |
|---|---|
| 01-brief, 02-dossier, 03-outline, 04-draft | Muse Spark (OpenCode), session 2026-09-16 |
| 05-math-audit | N/A justified (see above) |
| 06-compliance v1 | Fresh session 2026-09-16, disk-only, zero draft context |
| Remediation (hotfix + R3 fix) | Main session, owner-directed, human-verified sources only |
| 06-compliance-delta | Fresh session 2026-09-16, disk-only |
| 06-compliance-delta2 | Fresh session 2026-09-17, disk-only |
| 06-presign-review | External session 2026-09-16 (advisory, no gates touched) |
| 07-publish-packet + gate signatures | HumanEditor (Carlos Ortega) — PENDING |

Same-family auditors ran in fresh sessions with no prior draft context,
per `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` (agent-instance framing).
Git authorship is uniform (single-operator machine) and is not session
evidence; session boundaries are attested by the Task-dispatch record
and the role lines in each artifact header.

## 3. Gate checklist (HUMAN-ONLY — do not mark unless you are the HumanEditor)

- [ ] `TODO:SOURCE = 0` confirmed in draft v2 and live article
- [ ] 14/14 flags verified CLOSED against live text (delta2 table)
- [ ] R3 magnitude ("10–20 días") absent; replacement wording sourced (CMF Educa weekly/cierre + art. 19)
- [ ] 4 scope-reduced sub-items absent (alegación procesal, sigla OS-9/PDI, glosa castigos, doc-number) — grep-verified by delta2
- [ ] No slug/canonical/title/hero change beyond `updatedDate`/`validAsOf` → 2026-09-16
- [ ] `check:frontmatter`, `check:editorial-structure`, `check:dialect`, `check:reader-facing-copy`, `check:internal-links`, `check:editorial-timeliness` green at sign time
- [ ] `check:routes` + `check:rss` no-regression at sign time
- [ ] Prompt-injection review completed (dossier §Source Trust clean; no quoted examples to label)
- [ ] No unresolved owner/support/reference/tool conflict (queue audit: 0 double-owners; this slug is sole owner of its canonicalTopic)
- [ ] Benchmark observations remained separate from official sources (run is non-benchmark; N/A recorded)
- [ ] `localDelta` visible in final article (re-attributed law, CMF-sin-papel channel, split lag rule, RDC boundary)
- [ ] Decision publish/hold recorded at top of this file

## 4. Command evidence (re-run at sign time; last green 2026-09-17 pre-packet)

- `check:frontmatter` OK · `check:editorial-structure` OK (53 validated) · `check:dialect` OK (53) · `check:reader-facing-copy` OK (0 issues) · `check:internal-links` OK (no broken) · `check:editorial-timeliness` OK (stale=0)
- `check:routes` / `check:rss`: TO BE RE-RUN BY HUMAN AT SIGN TIME (release gates, not yet executed post-hotfix)

## 5. Known residual risks accepted or deferred (human judgment)

1. R10 wording ("demás entidades financieras bajo su fiscalización") is a bounded generalization beyond the literal confirmed quote — non-blocking per delta2.
2. Article carries paraphrase-with-attribution rather than literal block quotes for the four load-bearing statutes (presign advisory, non-blocking).
3. ley-19628 internal ficha (`src/data/laws/`) not refreshed to cite art. 18 inc. 2.° / art. 19 explicitly — candidate follow-up, not a publication blocker for this slug.

## 6. Human sign-off (HUMAN-ONLY)

- HumanEditor:
- Date:
- Decision (publish / hold + conditions):
- Signature (gate boxes above checked by hand):
