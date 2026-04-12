import { afterEach, describe, expect, it } from "vitest";
import { readFile, rm } from "node:fs/promises";
import { writeExternalArtifacts } from "../../scripts/urlcheck/external-artifacts.mjs";
import { URLCHECK_ARTIFACT_DIR } from "../../scripts/urlcheck/constants.mjs";

const GENERATED_FILES = [
  "external-hard-fail.json",
  "external-soft-404.json",
  "external-host-mismatch.json",
  "external-non-blocking.json",
  "external-summary.json",
  "external-full.csv",
];

afterEach(async () => {
  await Promise.all(
    GENERATED_FILES.map(fileName =>
      rm(`${URLCHECK_ARTIFACT_DIR}/${fileName}`, { force: true })
    )
  );
});

describe("writeExternalArtifacts", () => {
  it("preserves source_url and reports only non-ok totals", async () => {
    await writeExternalArtifacts(
      [
        {
          source_url: "https://www.dt.gob.cl/legislacion/1624/w3-article-999999.html",
          final_url: "https://www.dt.gob.cl/legislacion/1624/w3-article-999999.html",
          referrer_url: "https://monedario.cl/posts/test/",
          anchor_text: "Dirección del Trabajo",
          link_type: "structured",
          host_category: "official_source",
          classification: "hard_fail",
          blocking: true,
          matched_signal: "HTTP_404",
          expected_host_family: ["www.dt.gob.cl", "dt.gob.cl"],
          status: 404,
          error: null,
        },
        {
          source_url: "https://www.cmfchile.cl/educa/621/w3-propertyvalue-44868.html",
          final_url: "https://www.cmfchile.cl/educa/621/w3-propertyvalue-44868.html",
          referrer_url: "https://monedario.cl/posts/test/",
          anchor_text: "CMF",
          link_type: "structured",
          host_category: "official_source",
          classification: "ok",
          blocking: false,
          matched_signal: null,
          expected_host_family: null,
          status: 200,
          error: null,
        },
      ],
      { mode: "ci" }
    );

    const hardFail = JSON.parse(
      await readFile(`${URLCHECK_ARTIFACT_DIR}/external-hard-fail.json`, "utf8")
    );
    const summary = JSON.parse(
      await readFile(`${URLCHECK_ARTIFACT_DIR}/external-summary.json`, "utf8")
    );
    const csv = await readFile(`${URLCHECK_ARTIFACT_DIR}/external-full.csv`, "utf8");

    expect(hardFail).toHaveLength(1);
    expect(hardFail[0].source_url).toBe(
      "https://www.dt.gob.cl/legislacion/1624/w3-article-999999.html"
    );
    expect(summary.scannedExternalLinks).toBe(2);
    expect(summary.totalNonOk).toBe(1);
    expect(summary.blockingFailures).toBe(1);
    expect(csv).toContain("source_url,final_url,referrer_url,link_type,host_category,classification");
    expect(csv).toContain("https://www.dt.gob.cl/legislacion/1624/w3-article-999999.html");
  });
});
