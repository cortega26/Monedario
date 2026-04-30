// scripts/check-ts7-readiness.mjs
//
// Weekly readiness check: has TypeScript 7 stable shipped?
// Has @astrojs/check been updated to support TS7?
//
// No pnpm dependencies required — uses native Node.js fetch (Node 22+).
// Exit codes: 0 = check ran successfully (inspect stdout for status);
//             1 = network/fetch error (workflow step will fail and alert).
//
// In CI, writes structured key=value pairs to GITHUB_OUTPUT so the workflow
// can gate the issue-creation step on `ts7_released == 'true'`.

import { appendFileSync } from "node:fs";

const REGISTRY = "https://registry.npmjs.org";

async function fetchLatest(pkg) {
  const url = `${REGISTRY}/${encodeURIComponent(pkg)}/latest`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json();
}

let tsMeta, astroCheckMeta;
try {
  [tsMeta, astroCheckMeta] = await Promise.all([
    fetchLatest("typescript"),
    fetchLatest("@astrojs/check"),
  ]);
} catch (err) {
  console.error(`Fetch error: ${err.message}`);
  process.exit(1);
}

const tsVersion = tsMeta.version ?? "unknown";
const tsMajor = parseInt(tsVersion.split(".")[0], 10);
const tsIsV7 = tsMajor >= 7;

const astroCheckVersion = astroCheckMeta.version ?? "unknown";
// Peer dep may be a range like ">=5.0.0" or "^5.9.3"
const astroPeerTs =
  astroCheckMeta.peerDependencies?.typescript ?? "(none declared)";

const report = {
  checkedAt: new Date().toISOString(),
  typescript: { latest: tsVersion, isV7: tsIsV7 },
  astroCheck: { latest: astroCheckVersion, peerTypescript: astroPeerTs },
  ts7Released: tsIsV7,
};

// Write structured outputs for GitHub Actions
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    [
      `ts7_released=${tsIsV7}`,
      `ts_latest=${tsVersion}`,
      `astro_check_latest=${astroCheckVersion}`,
      `astro_peer_ts=${astroPeerTs}`,
    ].join("\n") + "\n"
  );
}

console.log(JSON.stringify(report, null, 2));
console.log();

if (tsIsV7) {
  console.log("✅ TypeScript 7 stable has shipped — execute the audit.");
  console.log(`   typescript@${tsVersion} is the stable release.`);
  console.log(
    `   @astrojs/check@${astroCheckVersion} peerDep typescript: "${astroPeerTs}"`
  );
  console.log("   → docs/backlog/TS7_COMPATIBILITY_AUDIT_2026-04-30.md");
} else {
  console.log(
    `⏳ TypeScript stable is still ${tsVersion} — TS7 not released yet.`
  );
  console.log(
    `   @astrojs/check@${astroCheckVersion} peerDep typescript: "${astroPeerTs}"`
  );
}
