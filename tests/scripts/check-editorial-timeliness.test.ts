import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT_PATH = path.resolve("scripts/check-editorial-timeliness.mjs");
const tempRoots: string[] = [];

function createTempProject() {
  const root = mkdtempSync(path.join(tmpdir(), "tpi-check-editorial-timeliness-"));
  tempRoots.push(root);
  mkdirSync(path.join(root, "src", "data", "blog"), { recursive: true });
  mkdirSync(path.join(root, "src", "config"), { recursive: true });
  mkdirSync(path.join(root, "src", "infrastructure", "economic"), {
    recursive: true,
  });
  writeFileSync(
    path.join(root, "src", "config", "editorial-timeliness-policy.json"),
    JSON.stringify(
      {
        defaultCadenceDays: 60,
        defaultSourceMode: "manual_review",
        categoryPolicies: {
          general: {
            cadenceDays: 60,
            sourceMode: "manual_review",
          },
          prevision: {
            cadenceDays: 30,
            sourceMode: "manual_review_with_official_sources",
          },
        },
        slugOverrides: {
          "demo-runtime-snapshot": {
            cadenceDays: 30,
            sourceMode: "runtime_snapshot_plus_editorial_review",
          },
        },
      },
      null,
      2
    ),
    "utf8"
  );
  writeFileSync(
    path.join(
      root,
      "src",
      "infrastructure",
      "economic",
      "economic-parameters.snapshot.json"
    ),
    JSON.stringify(
      {
        uf: 39841.72,
        utm: 69889,
        lastUpdated: "2026-03-22",
      },
      null,
      2
    ),
    "utf8"
  );
  return root;
}

function writeArticle(root: string, fileName: string, frontmatter: string, body = "Body") {
  writeFileSync(
    path.join(root, "src", "data", "blog", fileName),
    `---\n${frontmatter}\n---\n\n${body}\n`,
    "utf8"
  );
}

function runTimelinessCheck(rootDir: string, today = "2026-03-22") {
  return spawnSync("node", [SCRIPT_PATH], {
    env: {
      ...process.env,
      EDITORIAL_TIMELINESS_ROOT: rootDir,
      EDITORIAL_TIMELINESS_TODAY: today,
    },
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("check-editorial-timeliness", () => {
  it("passes when a published article stays within SLA and has sources for strict modes", () => {
    const root = createTempProject();
    writeArticle(
      root,
      "demo-runtime-snapshot.md",
      `title: "Demo runtime snapshot"
description: "Demo article"
slug: demo-runtime-snapshot
pubDate: "2026-03-01T00:00:00Z"
updatedDate: "2026-03-20T00:00:00Z"
author: "Equipo Monedario"
category: prevision
cluster: pensiones-afp
lang: es-CL
articleLead:
  answer: "Respuesta suficientemente larga para pasar el schema local."
  validAsOf: "2026-03-20"
  officialSources:
    - label: "Fuente oficial"
      href: "https://example.com/oficial"`,
      "Contenido"
    );

    const result = runTimelinessCheck(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[check-editorial-timeliness] OK.");
    const report = JSON.parse(
      readFileSync(
        path.join(root, "output", "validation", "editorial-timeliness", "report.json"),
        "utf8"
      )
    ) as { staleCount: number; economicSnapshotLastUpdated: string };
    expect(report.staleCount).toBe(0);
    expect(report.economicSnapshotLastUpdated).toBe("2026-03-22");
  });

  it("fails when a review SLA is stale", () => {
    const root = createTempProject();
    writeArticle(
      root,
      "stale.md",
      `title: "Articulo stale"
description: "Demo article"
slug: stale
pubDate: "2026-01-01T00:00:00Z"
updatedDate: "2026-01-15T00:00:00Z"
author: "Equipo Monedario"
category: prevision
cluster: pensiones-afp
lang: es-CL
articleLead:
  answer: "Respuesta suficientemente larga para pasar el schema local."
  validAsOf: "2026-01-15"
  officialSources:
    - label: "Fuente oficial"
      href: "https://example.com/oficial"`,
      "Contenido"
    );

    const result = runTimelinessCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("review SLA expired");
  });

  it("fails when a source-assisted mode that requires official sources has none", () => {
    const root = createTempProject();
    writeArticle(
      root,
      "demo-strict-sources.md",
      `title: "Demo strict sources"
description: "Demo article"
slug: demo-strict-sources
pubDate: "2026-03-01T00:00:00Z"
updatedDate: "2026-03-20T00:00:00Z"
author: "Equipo Monedario"
category: prevision
cluster: pensiones-afp
lang: es-CL
articleLead:
  answer: "Respuesta suficientemente larga para pasar el schema local."
  validAsOf: "2026-03-20"`,
      "Contenido"
    );

    const result = runTimelinessCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('requires articleLead.officialSources');
  });
});
