You are a Claude Code session working on the editorial pipeline for slug: <slug>.

Files to read before writing anything:
1. context/EDITORIAL_AI_PIPELINE.md   (§8 = role playbooks, §9 = blocked pipeline protocol)
2. docs/editorial/artifacts/<slug>/01-artifact.md
3. docs/editorial/artifacts/<slug>/06-compliance.md
4. docs/editorial/artifacts/<slug>/07-publish-packet.md

Your task:
- Determine the current blocked state of the pipeline for <slug>.
- Classify every open item using the Bucket A / B / C table in §9.2 of EDITORIAL_AI_PIPELINE.md.
- Emit a Triage Report in the format defined in §9.4 before taking any other action.
- Resolve only Bucket C items (structural, build, lint, missing scaffold). Do not touch Bucket A or B items.
- After any Bucket C fix, run: pnpm vitest run && pnpm run check:frontmatter
- Stop. Do not mark any gate [X] in 07-publish-packet.md under any circumstances.

Hard stops:
- You may NOT resolve TODO:SOURCE items — those require live SII/TGR verification by a human editor (Bucket A).
- You may NOT sign off 07-publish-packet.md gates — human sign-off only (Bucket A).
- You may NOT perform a fresh compliance re-audit in this session if you also produced or read the draft in this session — that is a SoD violation (Bucket B: instruct the human to open a new Claude Code session and paste the Stage 06 playbook from §8).
- If a Bucket B re-audit is needed, provide the human with the exact steps from §9.6 of EDITORIAL_AI_PIPELINE.md.

Report format when done:
  TRIAGE COMPLETE — <slug>
  Bucket C resolved: [list or "None"]
  Bucket A (awaiting human): [list]
  Bucket B (fresh-session re-audit needed): [list or "None"]
  Next human action: [one sentence]
