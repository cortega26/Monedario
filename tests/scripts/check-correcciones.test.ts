import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const SOURCE_SCRIPT = path.resolve("scripts/check-correcciones.mjs");
const tempRoots: string[] = [];

function createFixture({
  includeRoute = true,
  includeEntry = true,
}: { includeRoute?: boolean; includeEntry?: boolean } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "check-correcciones-"));
  tempRoots.push(root);

  const scriptsDir = path.join(root, "scripts");
  mkdirSync(scriptsDir, { recursive: true });
  const scriptPath = path.join(scriptsDir, "check-correcciones.mjs");
  copyFileSync(SOURCE_SCRIPT, scriptPath);

  if (includeRoute) {
    const routePath = path.join(root, "src", "pages", "glosario", "[slug].astro");
    mkdirSync(path.dirname(routePath), { recursive: true });
    writeFileSync(routePath, "---\n---\n", "utf8");
  }

  if (includeEntry) {
    const entryPath = path.join(root, "src", "data", "glossary", "utm.md");
    mkdirSync(path.dirname(entryPath), { recursive: true });
    writeFileSync(entryPath, "# UTM\n", "utf8");
  }

  const registryPath = path.join(root, "src", "data", "correcciones.json");
  mkdirSync(path.dirname(registryPath), { recursive: true });
  writeFileSync(
    registryPath,
    JSON.stringify({
      corrections: [
        {
          id: "utm-copy",
          date: "2026-10-29",
          title: "Corrección UTM",
          pages: [{ href: "/glosario/utm/", label: "Glosario: UTM" }],
          wrong: ["Regla temporal sin respaldo"],
          fixed: ["Reajuste mensual según IPC"],
          affected: "Lectores del glosario",
          sources: "SII",
          prevention: "Verificar fuente oficial",
        },
      ],
    }),
    "utf8"
  );

  return { scriptPath };
}

function run(scriptPath: string) {
  return spawnSync("node", [scriptPath], { encoding: "utf8" });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("check-correcciones dynamic glossary route resolution", () => {
  it("accepts a glossary route when its template and content entry exist", () => {
    const { scriptPath } = createFixture();
    const result = run(scriptPath);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("OK. 1 entradas válidas");
  });

  it.each([
    ["route template", { includeRoute: false, includeEntry: true }],
    ["glossary entry", { includeRoute: true, includeEntry: false }],
  ])("rejects the route when its %s is missing", (_missing, options) => {
    const { scriptPath } = createFixture(options);
    const result = run(scriptPath);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('"/glosario/utm/" no resuelve');
  });
});
