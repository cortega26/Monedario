# Plan: Homepage social preview and installable icon assets

Status: complete — merged, deployed, and production-verified
Owner: repository owner
Started: 2026-08-01

## Task Brief

- Objective: repair the homepage social-preview crawler failure, including Cloudflare hotlink behavior, and add standard raster favicon, Apple touch icon, and Web App Manifest metadata.
- In scope: `src/config.ts`, `src/layouts/Layout.astro`, homepage OG image endpoints/generation, `src/pages/robots.txt.ts`, `public/` icon/manifest assets and headers, service-worker static-asset recognition, focused regression coverage, and this plan.
- Out of scope: public page routes/slugs, canonical strategy, RSS, editorial/YMYL copy, dependencies, and broad Cloudflare account security configuration.
- Invariants/contracts: Constitution §§1 and 4; `URL.PUBLIC.NO_POST_ID`; `ROUTES.NO_SILENT_CHANGES`; `CONTRACT.PUBLIC_URLS`. Canonical page URLs remain unchanged; the social image asset URL may move to an additive, extensionless endpoint to avoid extension-based hotlink blocking.
- Assumption: `@monedario_cl` is the official X account, based on repository social links.

## Change Control Record

1. Scope declaration
- In scope: paths named in Task Brief.
- Out of scope: paths and capabilities named in Task Brief.

2. Impacted modules
- `src/layouts/Layout.astro`: emits icon, manifest, and Twitter attribution metadata.
- `src/config.ts`: selects the hotlink-safe default social image URL and MIME type.
- `src/pages/og-image.ts`, `src/pages/og.jpg.ts`, `src/pages/og.png.ts`, `src/utils/generateOgImages.ts`: serve truthful, cacheable social-image representations.
- `src/pages/robots.txt.ts`: keeps social preview assets crawlable while endpoint headers prevent indexing.
- `public/`: raster icon assets and Web App Manifest.
- `public/_headers`: preserves crawler-friendly cache policy at the Cloudflare Pages edge.
- `public/sw.js`: recognizes added static assets.
- `tests/scripts/homepage-social-preview-assets.test.ts`: preserves the asset/metadata contract.

3. Invariant preservation
- Referenced: Constitution §§1, 4 and `URL.PUBLIC.NO_POST_ID`.
- Preservation proof: no post identity, canonical page path, or slug construction changes; the added endpoint is a non-page media asset.

4. Contract preservation
- Referenced: `CONTRACT.PUBLIC_URLS` and existing layout metadata contract.
- Breaking changes: no; `/og.jpg` remains available for compatibility and `/og-image` is additive.

5. Boundary integrity
- Layer boundary check: pass.
- Unauthorized cross-layer imports introduced: no.

6. Test coverage impact
- Changed runtime layers: presentation/layout and media endpoints only.
- Related tests: `tests/scripts/homepage-social-preview-assets.test.ts`.
- Coverage threshold status: not applicable to domain/application/infrastructure; focused and full tests pass.

7. Rollback strategy
- Revert unit: metadata, endpoint, robot/header, test, and plan changes as one commit.
- Data/content rollback needed: no.

8. Regression risk
- Risk level: medium.
- Primary regression vectors: incorrect social-image MIME type, crawler-blocking robot policy, or missing generated endpoint.
- Mitigations: response-level tests, Sharp format/dimension checks, generated-HTML inspection, crawler-shaped HTTP requests, build, and route/RSS snapshots.

## Competitive Adaptation Appendix

- benchmarkSet: none; defect repair from an OG audit.
- patternHypothesis: not applicable.
- localDelta: standards-compliant discoverability assets with existing brand identity.
- nonCopyBoundaries: no competitor copy, structure, or URL strategy adopted.
- ownerTarget: homepage technical metadata.
- successSignal: generated homepage contains requested metadata and assets; its extensionless `og:image` endpoint returns HTTP 200 `image/jpeg` to crawler-shaped requests without triggering Cloudflare's extension-based hotlink rule.
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
- 2026-08-01: Reproduced the production failure precisely: `/og.jpg` returns
  HTTP 403 for `facebookexternalhit` when an external `Referer` is present,
  while the same asset returns 200 without that referrer. The response is from
  Cloudflare Hotlink Protection. Chosen remediation: retain `/og.jpg` for
  compatibility, move homepage metadata to an extensionless JPEG endpoint,
  make social assets crawlable in `robots.txt`, and enforce response integrity
  in tests.
- 2026-08-01: Implemented `/og-image` as an extensionless 1200×630 JPEG,
  updated homepage OG/Twitter metadata to use it, retained `/og.jpg`, corrected
  `/og.png` to return genuine PNG bytes, removed OG assets from `robots.txt`
  disallows, and added explicit cache/no-index response headers.
- 2026-08-01: Verification passed: focused social-preview suite 4/4; full
  Vitest suite 1,083/1,083; ESLint; Prettier; boundary check; frontmatter gate;
  Astro check (0 errors, one pre-existing deprecation hint); production build
  (327 pages); internal URL check (1,558 links, 0 broken); post-id URL gate;
  route snapshot unchanged; RSS snapshot unchanged.
- 2026-08-01: Cloudflare Pages local-runtime verification passed for Facebook,
  Twitter, and LinkedIn crawler user agents with external referrers: all
  received HTTP 200, `image/jpeg`, the expected cache policy, and a valid
  1200×630 JPEG body from `/og-image`. Raster favicons, Apple touch icon, and
  Web App Manifest also returned HTTP 200 with correct MIME types.
- 2026-08-01: Rollback remains a single revert of the metadata, endpoint,
  robots/header, service-worker, test, and plan changes. No data migration is
  required. Production remains on the prior metadata until these changes pass
  normal review and are deployed by Cloudflare Pages.
- 2026-08-01: PR #378 passed all GitHub gates and was squash-merged as
  `a3df0106`. Cloudflare Pages production deployment
  `e24082d3-fd4a-4f61-83b0-e68c226777a9` completed successfully.
- 2026-08-01: Production verification passed on the canonical bare homepage:
  Open Graph and Twitter metadata reference `https://monedario.cl/og-image`.
  Facebook, Twitter, and LinkedIn crawler requests with external referrers all
  receive HTTP 200, `image/jpeg`, and a valid 1200×630 JPEG. Favicons, Apple
  touch icon, and Web App Manifest return HTTP 200 with correct MIME types.
  The custom-domain homepage cache refreshed from the prior `/og.jpg` tag to
  `/og-image`; no broad cache purge was performed.
