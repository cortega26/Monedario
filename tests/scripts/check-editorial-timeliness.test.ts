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
  mkdirSync(path.join(root, "src", "infrastructure", "editorial"), {
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
          "demo-evergreen": {
            sourceMode: "evergreen",
          },
        },
      },
      null,
      2
    ),
    "utf8"
  );
  writeFileSync(
    path.join(root, "src", "config", "editorial-volatile-data-registry.json"),
    JSON.stringify(
      {
        datasets: {
          "economic.uf.value": {
            label: "Valor UF",
            refreshStrategy: "economic_snapshot",
            unit: "clp",
            sourceUrls: ["https://mindicador.cl/api"],
          },
          "pensions.afp.uno_commission": {
            label: "Comisión AFP Uno",
            refreshStrategy: "official_page_extract",
            unit: "percent",
            sourceUrls: ["https://www.spensiones.cl/portal/institucional/594/w3-article-16714.html"],
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
  writeFileSync(
    path.join(
      root,
      "src",
      "infrastructure",
      "editorial",
      "editorial-volatile-data.snapshot.json"
    ),
    JSON.stringify(
      {
        lastUpdated: "2026-03-22",
        datasets: {
          "economic.uf.value": {
            value: 39841.72,
            reviewTriggerDate: "2026-03-22",
            lastObservedAt: "2026-03-22",
          },
          "pensions.afp.uno_commission": {
            value: 0.46,
            reviewTriggerDate: "2025-10-01",
            lastObservedAt: "2026-03-22",
          },
        },
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
      href: "https://example.com/oficial"
volatileData:
  - id: "pensions.afp.uno_commission"
    sync: strict
    expectedValue: 0.46`,
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
    ) as {
      staleCount: number;
      driftCount: number;
      economicSnapshotLastUpdated: string;
      volatileSnapshotLastUpdated: string;
    };
    expect(report.staleCount).toBe(0);
    expect(report.driftCount).toBe(0);
    expect(report.economicSnapshotLastUpdated).toBe("2026-03-22");
    expect(report.volatileSnapshotLastUpdated).toBe("2026-03-22");
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
      href: "https://example.com/oficial"
volatileData:
  - id: "pensions.afp.uno_commission"
    sync: strict
    expectedValue: 0.46`,
      "Contenido"
    );

    const result = runTimelinessCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("review SLA expired");
  });

  it("ignores frontmatter reviewPolicy maxDays when computing the SLA cadence", () => {
    const root = createTempProject();
    writeArticle(
      root,
      "demo-review-policy-override.md",
      `title: "Demo review policy override"
description: "Demo article"
slug: demo-review-policy-override
pubDate: "2026-03-01T00:00:00Z"
updatedDate: "2026-03-20T00:00:00Z"
author: "Equipo Monedario"
category: general
cluster: demo
lang: es-CL
reviewPolicy:
  cadenceLabel: daily
  maxDays: 1
  dataTriggers: []
  derivationFactors: []
  computedAt: "2026-03-21"`,
      "Contenido"
    );

    // TODAY = 2026-03-22; updatedDate = 2026-03-20
    // If reviewPolicy.maxDays were used, this would be stale (due 2026-03-21).
    const result = runTimelinessCheck(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[check-editorial-timeliness] OK.");
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
  validAsOf: "2026-03-20"
volatileData:
  - id: "pensions.afp.uno_commission"
    sync: strict
    expectedValue: 0.46`,
      "Contenido"
    );

    const result = runTimelinessCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('requires articleLead.officialSources');
  });

  it("fails when a strict volatile dataset expectedValue no longer matches the snapshot", () => {
    const root = createTempProject();
    writeArticle(
      root,
      "demo-drift.md",
      `title: "Demo drift"
description: "Demo article"
slug: demo-drift
pubDate: "2026-03-01T00:00:00Z"
updatedDate: "2026-03-22T00:00:00Z"
author: "Equipo Monedario"
category: prevision
cluster: pensiones-afp
lang: es-CL
articleLead:
  answer: "Respuesta suficientemente larga para pasar el schema local."
  validAsOf: "2026-03-22"
  officialSources:
    - label: "Fuente oficial"
      href: "https://example.com/oficial"
volatileData:
  - id: "pensions.afp.uno_commission"
    sync: strict
    expectedValue: 0.49`,
      "Contenido"
    );

    const result = runTimelinessCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('expectedValue=0.49 does not match snapshot value=0.46');
  });

  it("passes for a runtime_snapshot article whose frontmatter date is stale but the volatile snapshot was refreshed within the cadence", () => {
    // Scenario: article has updatedDate = 2026-01-01 (>30 days ago), but the
    // volatile snapshot was refreshed on 2026-03-10 (12 days before TODAY).
    // The snapshot freshness should serve as the effective review date,
    // keeping the SLA from expiring.
    const root = createTempProject();
    // Override the volatile snapshot to have a recent lastUpdated
    writeFileSync(
      path.join(root, "src", "infrastructure", "editorial", "editorial-volatile-data.snapshot.json"),
      JSON.stringify(
        {
          lastUpdated: "2026-03-10",
          datasets: {
            "economic.uf.value": {
              value: 39841.72,
              reviewTriggerDate: "2026-03-10",
              lastObservedAt: "2026-03-10",
            },
          },
        },
        null,
        2
      ),
      "utf8"
    );
    writeArticle(
      root,
      "demo-runtime-snapshot.md",
      `title: "Demo runtime snapshot"
description: "Demo article"
slug: demo-runtime-snapshot
pubDate: "2026-01-01T00:00:00Z"
updatedDate: "2026-01-01T00:00:00Z"
author: "Equipo Monedario"
category: general
cluster: uf-costo-de-vida
lang: es-CL
volatileData:
  - id: "economic.uf.value"
    sync: reference`,
      "Contenido"
    );

    // TODAY = 2026-03-22; snapshot lastUpdated = 2026-03-10; cadence = 30d
    // effectiveReviewDate = max(2026-01-01, 2026-03-10) = 2026-03-10
    // dueDate = 2026-04-09 → not stale
    const result = runTimelinessCheck(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[check-editorial-timeliness] OK.");
  });

  it("fails for a runtime_snapshot article when both frontmatter date and snapshot lastUpdated are beyond the cadence", () => {
    const root = createTempProject();
    // Snapshot is also old (60 days ago relative to TODAY 2026-03-22)
    writeFileSync(
      path.join(root, "src", "infrastructure", "editorial", "editorial-volatile-data.snapshot.json"),
      JSON.stringify(
        {
          lastUpdated: "2026-01-20",
          datasets: {
            "economic.uf.value": {
              value: 39841.72,
              reviewTriggerDate: "2026-01-20",
              lastObservedAt: "2026-01-20",
            },
          },
        },
        null,
        2
      ),
      "utf8"
    );
    writeArticle(
      root,
      "demo-runtime-snapshot.md",
      `title: "Demo runtime snapshot"
description: "Demo article"
slug: demo-runtime-snapshot
pubDate: "2026-01-01T00:00:00Z"
updatedDate: "2026-01-01T00:00:00Z"
author: "Equipo Monedario"
category: general
cluster: uf-costo-de-vida
lang: es-CL
volatileData:
  - id: "economic.uf.value"
    sync: reference`,
      "Contenido"
    );

    // effectiveReviewDate = max(2026-01-01, 2026-01-20) = 2026-01-20
    // dueDate = 2026-02-19 → stale (TODAY = 2026-03-22)
    const result = runTimelinessCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("review SLA expired");
  });

  it("fails when a runtime snapshot article omits volatileData dependencies", () => {
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

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('requires volatileData dependencies');
  });

  it("passes for an evergreen article even when its review date is far in the past", () => {
    const root = createTempProject();
    writeArticle(
      root,
      "demo-evergreen.md",
      `title: "Demo evergreen"
description: "Demo article"
slug: demo-evergreen
pubDate: "2020-01-01T00:00:00Z"
updatedDate: "2020-01-01T00:00:00Z"
author: "Equipo Monedario"
category: general
cluster: demo
lang: es-CL`,
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
    ) as { records: Array<{ slug: string; dueDate: string | null; stale: boolean }> };
    const record = report.records.find(r => r.slug === "demo-evergreen");
    expect(record?.dueDate).toBeNull();
    expect(record?.stale).toBe(false);
  });

  it("fails when an evergreen article declares volatileData", () => {
    const root = createTempProject();
    writeArticle(
      root,
      "demo-evergreen.md",
      `title: "Demo evergreen"
description: "Demo article"
slug: demo-evergreen
pubDate: "2026-03-01T00:00:00Z"
updatedDate: "2026-03-20T00:00:00Z"
author: "Equipo Monedario"
category: general
cluster: demo
lang: es-CL
volatileData:
  - id: "economic.uf.value"
    sync: reference`,
      "Contenido"
    );

    const result = runTimelinessCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'sourceMode "evergreen" is incompatible with declared volatileData dependencies'
    );
  });

  it("fails when policy sets evergreen at the category level", () => {
    const root = createTempProject();
    const policyPath = path.join(root, "src", "config", "editorial-timeliness-policy.json");
    const policy = JSON.parse(readFileSync(policyPath, "utf8"));
    policy.categoryPolicies.general.sourceMode = "evergreen";
    writeFileSync(policyPath, JSON.stringify(policy, null, 2), "utf8");

    const result = runTimelinessCheck(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      'Category "general" cannot use "evergreen" sourceMode'
    );
  });

  it("fails when policy sets evergreen as defaultSourceMode", () => {
    const root = createTempProject();
    const policyPath = path.join(root, "src", "config", "editorial-timeliness-policy.json");
    const policy = JSON.parse(readFileSync(policyPath, "utf8"));
    policy.defaultSourceMode = "evergreen";
    writeFileSync(policyPath, JSON.stringify(policy, null, 2), "utf8");

    const result = runTimelinessCheck(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      '"evergreen" sourceMode is not allowed as defaultSourceMode'
    );
  });

  it("fails when an evergreen article has no review date", () => {
    const root = createTempProject();
    writeArticle(
      root,
      "demo-evergreen.md",
      `title: "Demo evergreen"
description: "Demo article"
slug: demo-evergreen
author: "Equipo Monedario"
category: general
cluster: demo
lang: es-CL`,
      "Contenido"
    );

    const result = runTimelinessCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("missing review date");
  });
});
