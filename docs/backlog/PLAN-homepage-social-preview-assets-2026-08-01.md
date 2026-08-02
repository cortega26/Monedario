# Plan: Homepage social preview and installable icon assets

Status: blocked — repository CI bootstrap and Cloudflare WAF action pending
Owner: repository owner
Started: 2026-08-01

## Task Brief

- Objective: repair the homepage social-preview crawler failure and add standard raster favicon, Apple touch icon, and Web App Manifest metadata.
- In scope: `src/layouts/Layout.astro`, `public/` icon/manifest assets, service-worker static-asset recognition, focused regression coverage, and this plan.
- Out of scope: routes, canonical strategy, RSS, editorial/YMYL copy, dependencies, and Cloudflare account security configuration.
- Invariants/contracts: Constitution §§1 and 4; `URL.PUBLIC.NO_POST_ID`; `CONTRACT.PUBLIC_URLS`. Canonical and Open Graph public URLs remain unchanged.
- Assumption: `@monedario_cl` is the official X account, based on repository social links.

## Change Control Record

1. Scope declaration
- In scope: paths named in Task Brief.
- Out of scope: paths and capabilities named in Task Brief.

2. Impacted modules
- `src/layouts/Layout.astro`: emits icon, manifest, and Twitter attribution metadata.
- `public/`: raster icon assets and Web App Manifest.
- `public/sw.js`: recognizes added static assets.
- `tests/scripts/homepage-social-preview-assets.test.ts`: preserves the asset/metadata contract.

3. Invariant preservation
- Referenced: Constitution §§1, 4 and `URL.PUBLIC.NO_POST_ID`.
- Preservation proof: no post identity, canonical path, or route construction changed.

4. Contract preservation
- Referenced: `CONTRACT.PUBLIC_URLS` and existing layout metadata contract.
- Breaking changes: no.

5. Boundary integrity
- Layer boundary check: pass.
- Unauthorized cross-layer imports introduced: no.

6. Test coverage impact
- Changed runtime layers: presentation/layout and static assets only.
- Related tests: `tests/scripts/homepage-social-preview-assets.test.ts`.
- Coverage threshold status: not applicable to domain/application/infrastructure; focused and full tests pass.

7. Rollback strategy
- Revert unit: source and public-asset changes as one commit.
- Data/content rollback needed: no.

8. Regression risk
- Risk level: low.
- Primary regression vectors: invalid manifest JSON or mismatched image dimensions.
- Mitigations: Sharp-backed asset test, build, route/RSS snapshots.

## Competitive Adaptation Appendix

- benchmarkSet: none; defect repair from an OG audit.
- patternHypothesis: not applicable.
- localDelta: standards-compliant discoverability assets with existing brand identity.
- nonCopyBoundaries: no competitor copy, structure, or URL strategy adopted.
- ownerTarget: homepage technical metadata.
- successSignal: generated homepage contains requested metadata and assets; deployed social crawler gets HTTP 200 `image/jpeg` for `/og.jpg`.
- ownership conflict check: not applicable; no editorial surface created.

## Progress log

- 2026-08-01: Normal `/og.jpg` requests return HTTP 200 `image/jpeg`; Facebook-crawler-shaped requests return Cloudflare error 1011. Required raster icons and manifest were absent.
- 2026-08-01: The `pnpm run test` baseline was blocked before Vitest by the package-manager release-age policy. The attempted automatic policy edit was reverted; recorded as TD-0097.
- 2026-08-01: Added raster brand-icon derivatives, a solid-background 180×180 Apple touch icon, manifest, metadata, service-worker coverage, and a regression test. No canonical, OG URL, route, or RSS behavior changed.
- 2026-08-01: Direct validation passed: focused test (2/2), full test suite (1,081/1,081), Prettier, targeted ESLint, boundary check, Astro check (0 errors; one pre-existing deprecation hint), Astro build (327 pages), post-id URL check, and unchanged route/RSS snapshots. The generated homepage contains all expected tags and `dist/og.jpg` is a 1200×630 JPEG.
- 2026-08-01: Deployment action remains: inspect Cloudflare Security > Events for `/og.jpg`, then allow the verified social crawler or configure a narrow approved-bot exception supported by the plan. The available shell/API credential could not authenticate a direct Cloudflare API request.
- 2026-08-02: Opened PR #376 from `fix/homepage-social-preview-assets` at
  commit `64b1dbee`. Required GitHub CI jobs failed before tests/build during
  `pnpm install --frozen-lockfile`, reproducing TD-0097 for
  `@napi-rs/wasm-runtime@1.2.2`, `js-yaml@5.2.3`, and `postcss@8.5.25`.
  Security scans and Python CI passed; Cloudflare Pages and the automated
  review workflow failed independently. No merge may bypass these required
  checks.
