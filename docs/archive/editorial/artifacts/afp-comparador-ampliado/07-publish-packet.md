# Publish Packet: Comparador AFP Ampliado

**Status: BLOCKED — pending human sign-off**

---

## Purpose

This packet is the final gate before any content from this artifact pack is published to a public URL. It must be completed in order by the roles defined in `context/EDITORIAL_AI_PIPELINE.md`. No automated agent may mark any gate complete; all sign-offs require human review.

---

## Publish Gate Checklist

- [ ] **Source traceability** — Every factual claim in the draft can be traced to a named section or URL in one of the official sources declared in `01-artifact.md` (Superintendencia de Pensiones, official AFP fee data). No claim references a source not listed. Commission rate figures include the publication date of the source.

- [ ] **Role separation** — Draft was produced by a designated DraftAgent; math figures were independently verified by MathAuditAgent; legal/compliance claims were independently reviewed by ComplianceAgent. No single agent performed more than one of these roles on the same claim.

- [ ] **Compliance result** — ComplianceAgent review completed with zero open compliance defects. All AFP comparison claims confirmed non-promotional, accurate, and sourced to the most recent Superintendencia de Pensiones quarterly publication.

- [ ] **Math audit result** — MathAuditAgent review completed with zero open math defects. All commission rate figures, multifund return percentages, and peso-cost computations verified against the most recent Superintendencia de Pensiones quarterly data.

- [ ] **Human editorial sign-off** — A human editor has reviewed the final draft, confirmed source traceability, confirmed role separation, reviewed the compliance result, reviewed the math audit result, and authorises publication. This gate constitutes the `human sign-off` required by `docs/editorial/NORMA_YMYL.md`.

---

## Pre-Publication Checklist (complete before assigning a public URL)

- [ ] NORMA_YMYL.md scorecard completed and score ≥ 9.5/10
- [ ] Frontmatter (`title`, `description`, `pubDate`, `updatedDate`) valid per `docs/editorial/FRONTMATTER_SCHEMA.md`
- [ ] Meta description 70–155 characters (CONTRACT.EDITORIAL.META_DESCRIPTION)
- [ ] No new URL registered without updating internal links from `/guias/pensiones-afp/` hub and `/calculadoras/comisiones-afp/` (ROUTES.NO_SILENT_CHANGES)
- [ ] No RSS feed entry added without confirming RSS.NO_REMOVALS compliance
- [ ] Build passes: `pnpm run build` exits 0

---

## Sign-off Record

| Gate | Reviewer | Date | Notes |
|------|----------|------|-------|
| Source traceability | — | — | — |
| Role separation | — | — | — |
| Compliance result | — | — | — |
| Math audit result | — | — | — |
| Human editorial sign-off | — | — | — |

---

*This packet was scaffolded by Wave 5 of the Phase 2 High-Value Roadmap (2026-04-24). No content from this artifact pack is published until all gates above are marked complete and human sign-off is recorded.*
