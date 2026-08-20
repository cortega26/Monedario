/**
 * E2E tests for CI build isolation.
 *
 * Verifies that follow-up jobs consume the build output of the current run
 * attempt via the site-build-handoff cache instead of rebuilding, and that
 * the handoff is strictly scoped to the same run_id + run_attempt (a cache
 * miss fails loudly instead of silently restoring a previous build).
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const workflowPath = path.join(process.cwd(), ".github", "workflows", "ci.yml");
function extractJobSection(content: string, jobName: string, nextJobName?: string) {
  const start = content.indexOf(`${jobName}:`);
  if (start === -1) {
    return "";
  }

  const end = nextJobName ? content.indexOf(`${nextJobName}:`, start) : -1;
  return end === -1 ? content.slice(start) : content.slice(start, end);
}

describe("ci workflow — build isolation", () => {
  it("PR follow-up jobs depend on build and restore dist via the handoff cache", () => {
    const content = fs.readFileSync(workflowPath, "utf8");
    const externalUrlPrSection = extractJobSection(
      content,
      "external-url-check-pr",
      "a11y-audit",
    );
    const a11ySection = extractJobSection(content, "a11y-audit");
    const buildSection = extractJobSection(content, "build", "external-url-audit");

    // The build job saves dist/ to the per-attempt handoff cache for
    // downstream consumers (upload-artifact is not used for this handoff).
    expect(buildSection).toContain("actions/cache/save@");
    expect(buildSection).toContain(
      "site-build-handoff-${{ github.run_id }}-${{ github.run_attempt }}",
    );
    expect(buildSection).toContain('run: pnpm run build:ci');
    expect(buildSection).not.toContain("actions/upload-artifact@");

    // Downstream jobs restore the exact handoff key instead of rebuilding,
    // saving ~2 min of compute per job. A cache miss fails the job instead
    // of reusing a dist/ from a previous attempt.
    expect(externalUrlPrSection).toContain("needs: [lint-and-test, build]");
    expect(externalUrlPrSection).toContain("actions/cache/restore@");
    expect(externalUrlPrSection).toContain("fail-on-cache-miss: true");
    expect(externalUrlPrSection).not.toContain('run: pnpm run build:ci');

    expect(a11ySection).toContain("needs: build");
    expect(a11ySection).toContain("actions/cache/restore@");
    expect(a11ySection).toContain("fail-on-cache-miss: true");
    expect(a11ySection).not.toContain('run: pnpm run build:ci');
  });
});