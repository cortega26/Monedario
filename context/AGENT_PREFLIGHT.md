# Agent Pre-flight

**Synthesized for token efficiency — non-authoritative.**
Authoritative order: `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` → `context/*.md` → source code.
When any item here conflicts with those sources, the sources win.

Last updated: 2026-04-23

---

## Hard stops — never do these

| What | Why | Authoritative source |
|---|---|---|
| Derive a public URL from `post.id` | Breaks invariant `URL.PUBLIC.NO_POST_ID` | `docs/AI_ENGINEERING_CONSTITUTION.md` + `context/INVARIANTS.md` |
| Move `fetch` calls into `src/domain/**` | Violates side-effect isolation, Constitution §2.2 | `docs/AI_ENGINEERING_CONSTITUTION.md` |
| Ship YMYL content without pipeline artifacts | Violates `AGENTS.md` §2.8 and editorial separation-of-duties | `docs/editorial/NORMA_YMYL.md` + `context/EDITORIAL_AI_PIPELINE.md` |
| Change a public slug without route/RSS snapshot + ADR | Silent public URL change | `context/INVARIANTS.md` (`ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`) |
| Let the same agent role draft and audit/comply a YMYL piece | Violates `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` | `context/INVARIANTS.md` + `AGENTS.md` §2.9 |
| Create a new visible/indexable surface without ownership resolution | Violates `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION` | `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` |

---

## Mandatory pre-edit checklist

- [ ] Scope declared: in-scope paths and out-of-scope paths listed.
- [ ] Authority check recorded: `Constitution > AGENTS > context > code`.
- [ ] Relevant invariants cited by ID (see table below or `context/INVARIANTS.md`).
- [ ] Required gates identified from the gate map below.
- [ ] If task touches routes/canonical/RSS/guard gates: re-read `context/CONTRACTS.md` + `context/INVARIANTS.md`.
- [ ] If task creates a new visible surface or benchmarks externally: re-read `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`.
- [ ] If task changes architecture/CI semantics: create or update an ADR in `docs/adr/`.

---

## Gate map — minimum gate set by task type

| Task type | Minimum required gate set |
|---|---|
| Bootstrap / local setup | `pnpm run test` + `pnpm run check` |
| Add or refresh article | `check:frontmatter` · `check:hero-images` · `check:hero-prompts` · `check:editorial` · `check:editorial-timeliness` |
| Calculator / domain logic | `test` · `check:boundaries` · `lint` |
| Route / URL / slug change | `check:no-postid-urls` · `check:routes` · `check:rss` |
| Docs / governance update | `check:docs` |
| CI / guardrails / ops automation | `check:policy-registry` · `check:docs` · `check:context` |
| Any merge-ready change | `lint` · `format:check` · `test` · `check` |
| CI / validation failure | Reproduce failing command locally; see `docs/codebase/TESTING.md` |

Full gate command list: `docs/operations/GATE_MANIFEST.json`
Full intent index: `docs/operations/AGENT_TASK_INDEX.md`
Fast intent map: `context/AGENT_ENTRYPOINTS.md`

---

## Known pre-existing gate failures (not introduced by your change)

No pre-existing blocking gate failures are currently registered.

If you see a failure that is not explained by current scope or debt records, investigate before merging.

---

## Key invariant IDs (quick reference)

| ID | Short meaning |
|---|---|
| `URL.PUBLIC.NO_POST_ID` | Public URLs never derived from `post.id` |
| `ROUTES.NO_SILENT_CHANGES` | Public route deletions/additions must be detected |
| `RSS.NO_REMOVALS` | RSS feed entries cannot be silently removed |
| `FRONTMATTER.VALID` | Blog frontmatter must pass schema policy |
| `INVARIANT.EDITORIAL.STRUCTURE_MIN` | Articles must meet minimum structural shape |
| `INVARIANT.EDITORIAL.DIALECT_ES_CL` | Chilean Spanish dialect rules enforced |
| `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` | Draft agent ≠ audit/compliance agent |
| `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION` | Ownership resolved before any new indexable surface |

Full registry: `context/INVARIANTS.md`

---

## Environment variables that affect gates

| Variable | Default | Effect |
|---|---|---|
| `TPI_ECONOMIC_PROVIDER_MODE` | `snapshot` | `snapshot` = deterministic fixtures; `live` = Mindicador API call |
| `EDITORIAL_ENFORCE` | `0` | Set to `1` for blocking mode in `check:editorial-artifacts` |
| `EDITORIAL_SCOPE` | `all` | Set to `changed` to scope `check:reader-facing-copy` to modified files |
| `HERO_PROMPTS_STRICT_FALLBACK` | `0` | Keep warn-first during rollout. Promote to `1` only when fallback warnings are intentionally resolved. |

Full variable reference: `.env.example`

---

## Context first-read sequence (full onboarding)

1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `context/INVARIANTS.md`
4. `context/CONTRACTS.md`
5. `context/AGENT_ENTRYPOINTS.md`
6. Relevant script(s) in `scripts/`
7. `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` ← new visible features or benchmark-driven work only
