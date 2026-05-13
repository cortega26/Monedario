import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT_PATH = path.resolve("scripts/check-internal-links.mjs");
const tempRoots: string[] = [];

function createTempProject() {
  const root = mkdtempSync(path.join(tmpdir(), "tpi-check-internal-links-"));
  tempRoots.push(root);

  mkdirSync(path.join(root, "src", "data", "blog"), { recursive: true });
  mkdirSync(path.join(root, "src", "pages", "guias", "uf-costo-de-vida"), {
    recursive: true,
  });
  mkdirSync(path.join(root, "src", "pages", "calculadoras"), {
    recursive: true,
  });
  mkdirSync(path.join(root, "src", "data", "laws"), { recursive: true });
  mkdirSync(path.join(root, "src", "data", "glossary"), { recursive: true });

  return root;
}

function writeArticle(root: string, body: string) {
  writeFileSync(
    path.join(root, "src", "data", "blog", "demo.md"),
    `---
title: "Demo"
description: "Demo article description"
slug: demo
pubDate: "2026-03-07T00:00:00Z"
author: "Equipo Monedario"
category: general
cluster: uf-costo-de-vida
lang: es-CL
---

${body}
`,
    "utf8"
  );
}

function runInternalLinkCheck(rootDir: string) {
  return spawnSync("node", [SCRIPT_PATH], {
    encoding: "utf8",
    env: {
      ...process.env,
      INTERNAL_LINKS_CHECK_ROOT: rootDir,
    },
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("check-internal-links script", () => {
  it("accepts nested guide routes backed by an Astro page file", () => {
    const root = createTempProject();
    writeFileSync(
      path.join(
        root,
        "src",
        "pages",
        "guias",
        "uf-costo-de-vida",
        "indicadores-economicos.astro"
      ),
      "---\nconst title = 'Indicadores';\n---\n<h1>{title}</h1>\n",
      "utf8"
    );
    writeArticle(
      root,
      "Valida el [panel de indicadores economicos](/guias/uf-costo-de-vida/indicadores-economicos/)."
    );

    const result = runInternalLinkCheck(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("No broken links found");
  });

  it("still fails when a nested guide route is missing", () => {
    const root = createTempProject();
    writeArticle(
      root,
      "Valida el [panel de indicadores economicos](/guias/uf-costo-de-vida/indicadores-economicos/)."
    );

    const result = runInternalLinkCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'Broken /guias/ link: subdirectory "uf-costo-de-vida/indicadores-economicos" not found in src/pages/guias/.'
    );
  });
});