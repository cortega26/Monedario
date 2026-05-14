/**
 * E2E tests for CI build artifact reuse.
 *
 * Verifies that the main CI build uploads the generated site once and that the
 * PR-only non-blocking jobs download the shared artifact instead of rebuilding
 * `dist` independently.
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

describe("ci workflow — build artifact reuse", () => {
  it("uploads the built site artifact from the main build job", () => {
    const content = fs.readFileSync(workflowPath, "utf8");
    expect(content).toContain('name: site-dist');
    expect(content).toContain('path: dist/');
  });

  it("PR follow-up jobs depend on build and download the shared artifact", () => {
    const content = fs.readFileSync(workflowPath, "utf8");
    const externalUrlPrSection = extractJobSection(
      content,
      "external-url-check-pr",
      "a11y-audit",
    );
    const a11ySection = extractJobSection(content, "a11y-audit");

    expect(externalUrlPrSection).toContain("needs: build");
    expect(externalUrlPrSection).toContain(
      "uses: actions/download-artifact@018cc2cf5baa6db3ef3c5f8a56943fffe632ef53",
    );
    expect(externalUrlPrSection).not.toContain('run: pnpm run astro build');

    expect(a11ySection).toContain("needs: build");
    expect(a11ySection).toContain(
      "uses: actions/download-artifact@018cc2cf5baa6db3ef3c5f8a56943fffe632ef53",
    );
    expect(a11ySection).not.toContain('run: pnpm run astro build');
  });
});