import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { baselineWindows } from "../../scripts/data-signals/gsc-baseline-fetch.mjs";
import {
  classifyPage,
  normalizePage,
  runBaseline,
} from "../../scripts/data-signals/build-gsc-baseline.mjs";

const required = [
  "28d-page.json",
  "28d-query.json",
  "28d-country.json",
  "28d-device.json",
  "previous-28d-page.json",
  "previous-28d-query.json",
  "3m-page.json",
  "3m-query.json",
  "sitemaps.json",
];

function dimensionFor(filename: string) {
  return filename
    .replace(/^(?:28d|previous-28d|3m)-/, "")
    .replace(/\.json$/, "");
}

function makeBaseline() {
  const directory = mkdtempSync(path.join(tmpdir(), "monedario-gsc-baseline-"));
  for (const filename of required) {
    if (filename === "sitemaps.json") {
      writeFileSync(
        path.join(directory, filename),
        JSON.stringify({ data: [{ path: "https://monedario.cl/sitemap-index.xml" }] }),
      );
      continue;
    }
    const dimension = dimensionFor(filename);
    const value =
      dimension === "page"
        ? "https://monedario.cl/calculadoras/conversor-utm"
        : dimension === "query"
          ? "valor utm"
          : dimension === "country"
            ? "chl"
            : "mobile";
    writeFileSync(
      path.join(directory, filename),
      JSON.stringify({
        schemaVersion: 1,
        source: "google-search-console",
        window: { from: "2026-07-03", to: "2026-07-30" },
        data: [
          {
            [dimension]: value,
            clicks: 0,
            impressions: 0,
            ctr: 0,
            position: 0,
          },
        ],
      }),
    );
  }
  return directory;
}

describe("GSC baseline windows", () => {
  it("uses a three-day final-data lag and non-overlapping comparison", () => {
    expect(baselineWindows(new Date("2026-08-02T12:00:00Z"))).toEqual({
      "28d": { from: "2026-07-03", to: "2026-07-30" },
      "previous-28d": { from: "2026-06-05", to: "2026-07-02" },
      "3m": { from: "2026-05-01", to: "2026-07-30" },
    });
  });
});

describe("GSC page normalization", () => {
  it("normalizes origins, query strings and trailing slashes", () => {
    expect(normalizePage("https://monedario.cl/calculadoras/conversor-utm?x=1")).toBe("/calculadoras/conversor-utm/");
    expect(normalizePage("/posts/que-es-la-utm/")).toBe("/posts/que-es-la-utm/");
  });

  it.each([
    ["/", "home"], ["/calculadoras/conversor-utm/", "calculator"],
    ["/posts/utm/", "article"], ["/guias/ahorro/", "guide"],
    ["/glosario/uf/", "glossary"], ["/leyes/ley-uno/", "law"], ["/autor/", "other"],
  ])("classifies %s as %s", (page, type) => expect(classifyPage(page)).toBe(type));
});

describe("GSC baseline validation", () => {
  it("handles zero clicks and impressions without NaN or division by zero", () => {
    const directory = makeBaseline();
    const result = runBaseline(directory);
    expect(result.validation.status).toBe("GREEN");
    expect(result.scorecard.acquisition.utmShare).toBe(0);
    expect(result.scorecard.acquisition.positions.top10).toBe(0);
    expect(JSON.stringify(result)).not.toContain("NaN");
  });

  it("halts for an empty required export", () => {
    const directory = makeBaseline();
    const file = path.join(directory, "28d-query.json");
    const document = JSON.parse(readFileSync(file, "utf8"));
    document.data = [];
    writeFileSync(file, JSON.stringify(document));

    expect(() => runBaseline(directory)).toThrow(/integrity 89% < 95%/);
    const validation = JSON.parse(
      readFileSync(path.join(directory, "validation.json"), "utf8"),
    );
    expect(validation.errors).toContain(
      "28d-query.json: empty required export",
    );
  });

  it("halts for normalized duplicate URLs and malformed dates", () => {
    const directory = makeBaseline();
    const file = path.join(directory, "28d-page.json");
    const document = JSON.parse(readFileSync(file, "utf8"));
    document.window.from = "2026/07/03";
    document.data.push({
      ...document.data[0],
    });
    writeFileSync(file, JSON.stringify(document));

    expect(() => runBaseline(directory)).toThrow(/duplicate dimension rows/);
    const validation = JSON.parse(
      readFileSync(path.join(directory, "validation.json"), "utf8"),
    );
    expect(validation.errors.join(" ")).toMatch(/ordered YYYY-MM-DD dates/);
  });

  it("keeps --json stdout machine-readable and sends diagnostics to stderr", () => {
    const directory = makeBaseline();
    const script = path.resolve("scripts/data-signals/build-gsc-baseline.mjs");
    const result = spawnSync(
      process.execPath,
      [script, `--input=${directory}`, "--json"],
      { encoding: "utf8" },
    );

    expect(result.status).toBe(0);
    expect(() => JSON.parse(result.stdout)).not.toThrow();
    expect(result.stderr).toBe("");
  });
});
