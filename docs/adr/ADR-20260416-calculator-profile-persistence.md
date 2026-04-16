# ADR-20260416: Calculator Profile Persistence (Phase 1 of decision-hub shift)

Date: 2026-04-16
Status: Accepted

## Context

Two external deep researches (Gemini, ChatGPT) and the prior `dr2.md` backlog converged on the same recommendation: convert the site from an "encyclopedia" (read-once content) into a "decision hub" (interactive, returnable). The single highest-leverage step in that direction is **shared input persistence across calculators** — today every calculator is stateless and asks the user to re-type values they already provided to a sibling calculator.

The repo already has a partial persistence layer (`src/utils/resumeState.ts` + `monedario_resume` localStorage key + `ResumeWidget.astro`) that tracks recent pages and last-visited calculator URL, but does **not** persist input values. As a result:

- a user who computes their sueldo líquido and then opens the APV simulator must re-type their imponible, AFP and salud regime;
- the only cross-calculator continuity is a "go back" link;
- there is no mechanism for a "Next Best Step" CTA to read the previous calculator's outputs and tailor the recommendation.

Adding shared input persistence introduces a **new architectural pattern**: client-side cross-page state. Per the Constitution (`docs/AI_ENGINEERING_CONSTITUTION.md` §1) and AGENTS.md §4 (CONSTITUTION_BINDING_RULES), introducing a new architectural surface requires an ADR.

## Decision

Introduce a separate, versioned `monedario_profile` localStorage namespace (distinct from `monedario_resume`) that stores **shared user inputs** across calculators, plus a generic prefill script that wires HTML inputs to that profile via a `data-profile-bind` attribute.

Components:

- `src/utils/userProfile.ts` — typed helpers: `getProfile()`, `updateProfile(partial)`, `clearProfile()`. Schema is versioned (`v: 1`); incompatible reads are discarded silently.
- `src/scripts/calculator-prefill.ts` — inline-style client script that, on `astro:page-load`:
  1. reads the profile;
  2. for each input with `data-profile-bind="<fieldName>"`, fills the value if the input is empty;
  3. attaches a debounced (500 ms) `input`/`change` listener that writes back to the profile;
  4. shows a small "✓ Pre-rellenado de tu última simulación · [limpiar]" hint when at least one field was prefilled.
- One pilot calculator (`sueldo-liquido.astro`) opted in; remaining calculators are out of scope for this ADR and will be added per ticket in `docs/backlog/PHASE_1_PROFILE_PERSISTENCE.md`.

Schema v1 (canonical field names; not all required):

```ts
interface UserProfileV1 {
  v: 1;
  ts: number;            // last update epoch ms
  sueldoImponible?: number;
  afpId?: string;        // capital | cuprum | habitat | modelo | planvital | provida | uno
  saludRegimen?: 'fonasa' | 'isapre';
  isapreAdicionalPct?: number;
  contratoTipo?: 'indefinido' | 'plazo-fijo' | 'obra';
  gratificacion?: number;
  horasExtra?: number;
  apvRegimenBAnual?: number;
}
```

Boundaries:

- The profile is **never** sent to the server; it is read and written exclusively by the client.
- The profile is **not** used to influence editorial content, schemas, sitemaps, or CI gates.
- `clearProfile()` is exposed via the prefill hint UI so users can opt out per-page; a global "borrar historial" already exists in `ResumeWidget` and is extended in scope to also clear the profile.

## Consequences

Positive:

- removes friction across calculator chains (sueldo → APV → impuesto → renta);
- foundation for Phase 2 (NextBestStep contextual CTAs that read the profile);
- foundation for Phase 3 (multi-step wizards that pre-fill from profile);
- low perf risk: a single inline script of <2 KB, deferred to `astro:page-load`.

Trade-offs:

- introduces a new client-side surface that must be versioned carefully (any breaking change to the schema requires bumping `v` and either migrating or discarding old data);
- increases YMYL liability surface marginally — the user now sees prefilled income data from a previous session, so the prefill must be **visibly labeled** and **easy to clear**;
- adds a coupling contract between calculator markup (`data-profile-bind` field names) and the profile schema; renames require coordinated edits.

## Alternatives considered

1. **Use the existing `monedario_resume` key for inputs as well.**
   Rejected: mixes navigation history with sensitive financial inputs; complicates clearing semantics ("clear history" should not necessarily wipe profile data, and vice versa).

2. **Use URL query params instead of localStorage.**
   Rejected: query params would expose income data in browser history and analytics; would also require every calculator to know about every other calculator's params.

3. **Build a centralized client-side state framework (Zustand/Nanostores).**
   Rejected: framework dependency violates §1.3 ("never introduce new dependencies without explicit justification") for a problem solvable with ~80 LOC of vanilla TS.

4. **Server-side accounts.**
   Rejected: contradicts the site's "Sin registro requerido" trust badge (decision MON-4xx).

## Compatibility and Migration

- No public URL, route, RSS, sitemap, schema, or canonical change.
- No frontmatter schema change.
- No new CI gate introduced.
- `src/utils/resumeState.ts` is unchanged; `monedario_resume` continues to coexist.
- Old browsers that block localStorage (private mode, cookies disabled) silently degrade — calculators continue to work statelessly.

## Verification

This ADR is satisfied when:

- `src/utils/userProfile.ts` exists, exports the helpers above, and is covered by at least one unit-level smoke check (manual or vitest).
- `src/scripts/calculator-prefill.ts` exists and is referenced from at least one calculator (`sueldo-liquido.astro` as pilot).
- `pnpm exec astro check` passes with 0 errors.
- `pnpm run check:frontmatter`, `pnpm run lint` (excluding the pre-existing unrelated warning in `tests/e2e/redirect-links.e2e.test.ts`), and `pnpm exec prettier --check` on the changed files all pass.
- Manual smoke: opening `sueldo-liquido` in a fresh browser, entering imponible, then reloading the page shows the prefilled value with the visible hint.
