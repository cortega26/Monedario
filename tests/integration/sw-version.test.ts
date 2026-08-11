import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { swVersionIntegration } from "@/integrations/sw-version";

const tempDirs: string[] = [];

function fixtureDist(swContent: string | null): string {
  const dir = mkdtempSync(join(tmpdir(), "sw-version-"));
  tempDirs.push(dir);
  if (swContent !== null) {
    writeFileSync(join(dir, "sw.js"), swContent, "utf8");
  }
  return dir;
}

function runHook(dir: string): string[] {
  const logs: string[] = [];
  const integration = swVersionIntegration();
  const hook = integration.hooks["astro:build:done"];
  hook!(
    {
      dir: new URL(`file://${dir}/`),
      logger: {
        info: (m: string) => logs.push(`info: ${m}`),
        warn: (m: string) => logs.push(`warn: ${m}`),
      },
    } as never,
  );
  return logs;
}

afterEach(() => {
  vi.unstubAllEnvs();
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true });
  }
});

describe("swVersionIntegration", () => {
  it("reemplaza el placeholder con el SHA de GITHUB_SHA", () => {
    vi.stubEnv("GITHUB_SHA", "abc1234");
    const dir = fixtureDist('const CACHE = "monedario-__SW_CACHE_VERSION__";');
    const logs = runHook(dir);
    const output = existsSync(join(dir, "sw.js"))
      ? readFileSync(join(dir, "sw.js"), "utf8")
      : "";
    expect(output).toContain("monedario-abc1234");
    expect(output).not.toContain("__SW_CACHE_VERSION__");
    expect(logs.some(l => l.startsWith("info:"))).toBe(true);
  });

  it("advierte y no crashea cuando dist/sw.js no existe", () => {
    const dir = fixtureDist(null);
    const logs = runHook(dir);
    expect(logs.some(l => l.startsWith("warn:"))).toBe(true);
  });
});
