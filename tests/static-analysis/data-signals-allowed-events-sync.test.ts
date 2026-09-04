/**
 * The data-signals pipeline keeps two independent copies of the current
 * analytics event allowlist — scripts/data-signals/fetch-analytics-export.mjs
 * (validates the weekly R2 export before commit) and
 * scripts/build-weekly-search-report.mjs (validates it again when building
 * the scorecard) — instead of importing the real contract in
 * src/contracts/analytics-events.ts.
 *
 * Motivo (2026-09-04): article_calculator_cta_click was added to the
 * contract on 2026-08-10 (ec6a6b33) but neither copy was updated, so every
 * weekly Data Signals run failed validation for a month, silently
 * discarding GSC/Cloudflare/analytics data that had already been fetched.
 * This test fails if a current contract event is ever missing from either
 * script's allowlist again.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { ANALYTICS_EVENT_ALLOWLIST } from "../../src/contracts/analytics-events";

const CONTRACT_EVENT_NAMES = Object.keys(ANALYTICS_EVENT_ALLOWLIST);

function extractAllowedEventsSet(filePath: string, setName: string): Set<string> {
  const source = readFileSync(path.resolve(filePath), "utf8");
  const match = new RegExp(
    `const ${setName}\\s*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\)`
  ).exec(source);
  if (!match) {
    throw new Error(`Could not find "const ${setName} = new Set([...])" in ${filePath}`);
  }
  const literals = [...match[1].matchAll(/"([a-z0-9_]+)"/g)].map(m => m[1]);
  return new Set(literals);
}

describe("data-signals analytics allowlists stay in sync with the event contract", () => {
  it("fetch-analytics-export.mjs's ALLOWED_EVENTS covers every current contract event", () => {
    const allowed = extractAllowedEventsSet(
      "scripts/data-signals/fetch-analytics-export.mjs",
      "ALLOWED_EVENTS"
    );
    const missing = CONTRACT_EVENT_NAMES.filter(name => !allowed.has(name));
    expect(missing).toEqual([]);
  });

  it("build-weekly-search-report.mjs's ANALYTICS_EVENT_NAMES covers every current contract event", () => {
    const allowed = extractAllowedEventsSet(
      "scripts/build-weekly-search-report.mjs",
      "ANALYTICS_EVENT_NAMES"
    );
    const missing = CONTRACT_EVENT_NAMES.filter(name => !allowed.has(name));
    expect(missing).toEqual([]);
  });
});
