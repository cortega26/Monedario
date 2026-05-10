# TS7 Compatibility Audit — 2026-04-30

Status: **blocked** — waiting on TypeScript 7 stable release and `@astrojs/check` TS7 support.
Tracked by: `.github/workflows/check-ts7-readiness.yml` (runs every Monday at 09:30 UTC).

## Objective

Audit the codebase for compatibility with TypeScript 7 (the Go-based native port, "Corsa"),
establish a readiness baseline, and produce a prioritized remediation plan so the migration
can execute as soon as the ecosystem unblocks.

## Scope

- In scope:
  - `tsconfig.json` and inherited `astro/tsconfigs/strict`
  - All `.ts`, `.tsx`, `.mjs` files in `src/`, `scripts/`, `tests/`
  - Ecosystem compatibility: Astro 6, `@astrojs/check`, `typescript-eslint`, Vitest
  - Output: `docs/reports/ts7-compatibility-audit.md`
- Out of scope:
  - Public URLs, routes, RSS, canonical, SEO
  - Editorial content or YMYL pipeline
  - Any source code fixes (those are a follow-up migration task)

## Authority refs

- `docs/AI_ENGINEERING_CONSTITUTION.md`
- `docs/development/AGENT_EXECUTION_PROTOCOL.md`
- `context/INVARIANTS.md`

## Blocking conditions (must be true before executing audit)

- [ ] `typescript` npm `latest` dist-tag is `>=7.0.0`
- [ ] `@astrojs/check` npm `latest` peer dep range includes TS 7 (verify Volar TS7 support)

## Current state snapshot (2026-04-30)

| Package | Version | Notes |
|---|---|---|
| `typescript` | 5.9.3 | `^5.9.3` in package.json |
| `astro` | 6.1.9 | tsconfig extends `astro/tsconfigs/strict` |
| `@astrojs/check` | 0.9.8 | Volar-based type checker, not raw tsc |
| `typescript-eslint` | 8.59.1 | flat config, `recommended` |
| `@typescript-eslint/parser` | 8.59.1 | |
| `vitest` | 4.1.5 | |
| TS 7 native preview | nightly | `@typescript/native-preview` (`tsgo`) |

## Key pre-audit finding

`tsconfig.json` carries `"ignoreDeprecations": "6.0"` — this actively suppresses TS 6.0
deprecation errors. Phase 1 must surface those before the project can fully assess its
exposure to TS 7 breaking changes.

## Audit phases (execute in order once unblocked)

### Phase 1 — Surface TS 6.0 deprecations

1. Temporarily remove `"ignoreDeprecations": "6.0"` from `tsconfig.json`.
2. Run `pnpm astro check` — capture all newly surfaced errors and warnings.
3. Categorize findings: deprecated `moduleResolution`, deprecated `module` value, type-level errors.
4. Restore `"ignoreDeprecations": "6.0"` so the project remains buildable (CI must stay green).
5. Append categorized findings to `docs/reports/ts7-compatibility-audit.md`.

### Phase 2 — Inspect inherited base tsconfig (parallel with Phase 1)

1. Read `node_modules/astro/tsconfigs/strict.json`.
2. Identify `module`, `moduleResolution`, `target`, `lib` values.
3. Flag any values deprecated in TS 7: `node`, `node10`, `commonjs`.
4. Determine whether fixing requires changes in `tsconfig.json` or depends on an Astro upgrade.

### Phase 3 — Erasable-syntax scan (parallel with Phase 2)

Grep `src/`, `scripts/`, `tests/` for constructs incompatible with `--erasableSyntaxOnly`:

- `enum ` declarations
- `namespace ` / `module ` blocks with runtime code
- Parameter properties: `constructor(public|private|protected|readonly`
- `import =` aliases

Document file paths and occurrence counts for each pattern.

### Phase 4 — Run tsgo (TS 7 native preview)

1. `pnpm add -D @typescript/native-preview` (temporary, remove when done).
2. `npx tsgo --noEmit` targeting `.ts`/`.tsx` files in `src/`.
3. Compare output against `pnpm astro check` — log any new or missing errors.
4. Remove `@typescript/native-preview` and restore `pnpm-lock.yaml`.

Note: `.astro` files are not parseable by `tsgo` directly. `--build` mode is not yet
supported in the TS 7 native preview.

### Phase 5 — Ecosystem compatibility matrix (parallel with Phase 4)

Verify latest release notes and peer dep ranges for:

| Package | Check | Signal |
|---|---|---|
| `astro` | tsconfig strict preset values | TS 7 module/moduleResolution safe? |
| `@astrojs/check` | Volar version; release notes | Volar TS 7 language service support |
| `typescript-eslint@8.x` | peer dep range in package.json | `>=7` accepted? |
| `vitest@4.x` | peer dep range | `>=7` accepted? |

### Phase 6 — Compile audit report

Create `docs/reports/ts7-compatibility-audit.md` with:

- Executive Summary
- Current State (versions table)
- Findings by Phase (Phases 1–5)
- Issue Registry (severity 1–5 per `docs/development/TECH_DEBT_GOVERNANCE.md`)
- Recommended Remediation Order
- Blocked-on-ecosystem items

## Acceptance targets

- All six phases executed with findings in `docs/reports/ts7-compatibility-audit.md`.
- Issue Registry contains every finding with a severity 1–5 classification.
- `pnpm astro check` and `pnpm build` CI gates still pass after Phase 1 tsconfig restoration.
- `"ignoreDeprecations": "6.0"` is present and restored in `tsconfig.json` post-audit.
- `@typescript/native-preview` is removed from `package.json` post-Phase 4.
