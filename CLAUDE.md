# CLAUDE.md — Claude Code entry point

This file is read automatically by Claude Code at session start.

## Authority order

1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `context/*.md`
4. Source code

When any instruction conflicts with a higher-authority document, stop and emit a conflict report. Never work around constitutional constraints.

## Hard stops — never do these

| What | Source |
|---|---|
| Derive a public URL from `post.id` | `URL.PUBLIC.NO_POST_ID` |
| Publish YMYL content without completed pipeline + human sign-off | `AGENTS.md` §2.8, `NORMA_YMYL.md` |
| Mark a gate `[X]` in `07-publish-packet.md` | `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` |
| Draft and audit/comply the same YMYL piece in one session | `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` |
| Change a public slug without route/RSS snapshot + ADR | `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS` |

Full hard-stop list: `context/AGENT_PREFLIGHT.md`

## Blocked pipeline — what to do

If `06-compliance.md` shows `BLOCKED` or `07-publish-packet.md` has unchecked gates:

1. Read `06-compliance.md` and `07-publish-packet.md` for the slug.
2. Classify every open item: **A** = human-only · **B** = fresh-session re-audit · **C** = this session.
3. Emit a Triage Report (format in `context/EDITORIAL_AI_PIPELINE.md` §9.4).
4. Resolve only Bucket C items. Do not touch Bucket A or B.

Full protocol: `context/EDITORIAL_AI_PIPELINE.md` §9

## Key file map

| What you need | Where to look |
|---|---|
| Invariants and prohibitions | `context/INVARIANTS.md` |
| Contracts and schemas | `context/CONTRACTS.md` |
| Editorial pipeline + role playbooks | `context/EDITORIAL_AI_PIPELINE.md` |
| Blocked pipeline protocol | `context/EDITORIAL_AI_PIPELINE.md` §9 |
| YMYL quality standard | `docs/editorial/NORMA_YMYL.md` |
| Competitive adaptation rules | `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` |
| Pre-flight checklist + gate map | `context/AGENT_PREFLIGHT.md` |
| Module index | `context/MODULE_INDEX.md` |
