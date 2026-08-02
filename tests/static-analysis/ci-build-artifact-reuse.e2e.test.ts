/**
 * E2E tests for CI build isolation.
 *
 * Verifies that follow-up jobs build their own site instead of depending on a
 * GitHub Actions artifact, which can be unavailable when storage is over quota.
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
  it("PR follow-up jobs depend on build and pull build output via artifact", () => {
    const content = fs.readFileSync(workflowPath, "utf8");
    const externalUrlPrSection = extractJobSection(
      content,
      "external-url-check-pr",
      "a11y-audit",
    );
    const a11ySection = extractJobSection(content, "a11y-audit");
    const buildSection = extractJobSection(content, "build", "external-url-audit");

    // The build job uploads site-build-output for downstream consumers.
    expect(buildSection).toContain("actions/upload-artifact@");
    expect(buildSection).toContain("name: site-build-output");
    expect(buildSection).toContain('run: pnpm run build:ci');

    // Downstream jobs pull the artifact instead of rebuilding, saving
    // ~2 min of compute per job.
    expect(externalUrlPrSection).toContain("needs: [lint-and-test, build]");
    expect(externalUrlPrSection).toContain("actions/download-artifact@");
    expect(externalUrlPrSection).not.toContain('run: pnpm run build:ci');

    expect(a11ySection).toContain("needs: build");
    expect(a11ySection).toContain("actions/download-artifact@");
    expect(a11ySection).not.toContain('run: pnpm run build:ci');
  });
});
