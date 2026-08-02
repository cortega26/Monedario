# TS7 Compatibility Audit Report

**Date:** 2026-08-01
**Auditor:** Claude Code (automated audit, human review pending)
**TS7 version evaluated:** 7.0.2 (stable)
**Conclusion:** **BLOCKED** — ecosystem not ready. Do not attempt migration yet.

## Executive Summary

TypeScript 7.0.2 shipped stable. The monedario codebase is structurally clean
(no enums, namespaces, parameter properties, or `import =` aliases) and uses
`verbatimModuleSyntax` + `isolatedModules` — it would compile cleanly under TS7.

**However, two critical ecosystem packages do not yet accept TS7 as a peer
dependency:**

1. **`@astrojs/check@0.9.9`** — peer dep: `"typescript": "^5.0.0 || ^6.0.0"`
2. **`typescript-eslint@8.65.0`** — peer dep: `"typescript": ">=4.8.4 <6.1.0"`

Forcing TS7 installation results in 12 ESLint test failures
(`eslint-global-ignores.e2e.test.ts`) with `TypeError: Cannot read properties of undefined`.

**Recommendation:** Wait for ecosystem updates. Re-run audit when:
- `@astrojs/check` releases a version with `|| ^7.0.0` in peer deps
- `typescript-eslint` releases a version with `>=7.0.0` in peer deps
- Astro updates its internal TS dependency to `^7.0.0`

The `check-ts7-readiness.yml` workflow (Monday 09:30 UTC) will continue
monitoring these conditions automatically.

## Current State

| Package | Version | TS7 Ready? |
|---|---|---|
| `typescript` | 6.0.3 (current) / 7.0.2 (target) | ✅ (stable) |
| `astro` | 7.1.3 | ❌ (internal dep `^6.0.3`) |
| `@astrojs/check` | 0.9.9 | ❌ (peer `^5 \|\| ^6`) |
| `typescript-eslint` | 8.65.0 | ❌ (peer `<6.1.0`) |
| `@typescript-eslint/parser` | 8.63.0 | ❌ (peer `<6.1.0`) |
| `vitest` | 4.1.10 | ✅ (no TS peer dep) |

## Phase 1: TS 6.0 Deprecations

- **`baseUrl`** is deprecated and will stop functioning in TS 7.0.
  Our `tsconfig.json` line 7: `"baseUrl": "."` needs migration to `paths`
  (with explicit `./src/*` mappings) before TS7 adoption.
- Currently suppressed by `"ignoreDeprecations": "6.0"`.
- **0 errors, 0 warnings** in `astro check` after removing suppress flag.

## Phase 2: Inherited Base Tsconfig

Astro's `strict.json` → `base.json` uses TS7-safe values:
- `target: ESNext` ✅
- `module: ESNext` ✅
- `moduleResolution: Bundler` ✅
- `verbatimModuleSyntax: true` ✅
- No deprecated `node`, `node10`, or `commonjs` values.

## Phase 3: Erasable Syntax Scan

- **`enum` declarations:** 0
- **`namespace`/`module` blocks:** 0
- **Parameter properties:** 0
- **`import =` aliases:** 0

The codebase is fully compatible with `--erasableSyntaxOnly`.

## Phase 4: tsgo / TS7 Native Compilation

Skipped — `@typescript/native-preview` is obsolete now that TS7 stable ships.
Installing `typescript@7.0.2` directly and running `pnpm astro check` would
be the equivalent test, but `@astrojs/check` rejects TS7 as a peer dep,
making this test impossible without `--force`.

Forced installation was tested separately on branch `dependabot/npm_and_yarn/typescript-7.0.2`
(PR #350, closed). Results:
- `pnpm astro check`: passed (0 errors)
- `pnpm test`: **12 failures** in `eslint-global-ignores.e2e.test.ts`
- Root cause: `typescript-eslint` API breakage with TS7

## Phase 5: Ecosystem Compatibility Matrix

See table in Current State above. Two blockers:
1. `@astrojs/check` — Volar layer needs TS7 language service support
2. `typescript-eslint` — AST/type-checking API needs TS7 compatibility

## Issue Registry

| # | Severity | Finding | Action |
|---|---|---|---|
| 1 | **BLOCKER** | `@astrojs/check` peer dep excludes TS7 | Wait for upstream release |
| 2 | **BLOCKER** | `typescript-eslint` peer dep excludes TS7 | Wait for upstream release |
| 3 | 3-Medium | `baseUrl` deprecated in TS7 | Migrate to `paths` before adoption |
| 4 | 5-Trivial | `z.string().url()` deprecated (Zod) | Unrelated to TS7; cosmetic |

## Recommended Remediation Order

1. Wait for `typescript-eslint` release with `>=7.0.0` peer dep (blocks CI).
2. Wait for `@astrojs/check` release with `^7.0.0` peer dep (blocks type-checking).
3. Migrate `baseUrl: "."` to explicit `paths` mappings.
4. Test `pnpm astro check` + `pnpm test` with TS7.
5. Merge TS7 upgrade PR.

## Blocked-on-Ecosystem Items

- `typescript-eslint` GitHub: watch for TS7 support in release notes
- `@astrojs/check` / Volar: watch for TS7 language service support
- `astro` itself: watch for internal TS dep bump to `^7.0.0`

## Verification

- `pnpm astro check`: 0 errors, 0 warnings (current TS6)
- `pnpm test`: 131 files, 1079 tests pass (current TS6)
- `pnpm build`: passes (current TS6)
- `"ignoreDeprecations": "6.0"` is PRESENT and RESTORED in `tsconfig.json`
- No temporary packages installed
