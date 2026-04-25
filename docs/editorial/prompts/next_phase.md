You are starting a new Claude Code session for the Monedario editorial pipeline.

Read these files before writing anything:
1. CLAUDE.md — authority order, hard stops, blocked pipeline summary
2. context/EDITORIAL_AI_PIPELINE.md — full pipeline, role playbooks (§8), blocked pipeline protocol (§9)
3. context/INVARIANTS.md — invariants that apply to all editorial work

Current project state (as of 2026-04-25):
- Phase 2 roadmap (Waves 1–5) is complete. Six editorial artifact scaffolds exist in
  docs/editorial/artifacts/ — each has 01-artifact.md and 07-publish-packet.md.
- Phase 3 ran pipeline stages 02–06 for `operacion-renta-centro`. That artifact is BLOCKED:
    - 13 TODO:SOURCE items require live SII/TGR verification by a human editor (Bucket A).
    - Stages 05–06 need fresh-session re-audits (Bucket B) before publication.
- The other 5 slugs have only 01-artifact.md and 07-publish-packet.md — stages 02–06 not yet run.
  Slugs ready for pipeline stages 02–06:
    dicom-salida | cotizaciones-impagas | licencia-medica-wizard |
    afp-comparador-ampliado | fraude-cargo-no-reconocido

Choose one task and confirm with the user before proceeding:

Option A — Triage the blocked operacion-renta-centro pipeline:
  Follow context/EDITORIAL_AI_PIPELINE.md §9. Emit a Triage Report. Resolve Bucket C items only.

Option B — Run pipeline stages 02–06 for a new slug:
  Slug: <slug>
  Read docs/editorial/artifacts/<slug>/01-artifact.md, then follow §8 playbooks in order.
  DraftAgent = Claude (this session).
  MathAuditAgent = ChatGPT (provide the §8 Stage 05 playbook prompt for the human to run).
  ComplianceAgent = fresh Claude Code session (provide the §8 Stage 06 playbook prompt).

Constraints that apply to both options:
- Do not mark any gate [X] in 07-publish-packet.md.
- Do not add public URLs or publish any content.
- Never invent figures — mark unverified values TODO:SOURCE.
- For any blocked pipeline, emit a Triage Report (§9.4) before taking action.
- After any structural change: pnpm vitest run && pnpm run check:frontmatter
