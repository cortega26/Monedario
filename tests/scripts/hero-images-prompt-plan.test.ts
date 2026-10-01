import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  articleContentHash,
  buildPromptEntry,
  selectPromptPlan,
  validateBrief,
  validateEditReference,
} from "../../scripts/hero-images/prompt-plan.mjs";
import { EDITORIAL_STYLE_VERSION } from "../../scripts/hero-images/config.mjs";

const catalog = JSON.parse(fs.readFileSync("scripts/hero-images/briefs.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("scripts/hero-images/manifest.json", "utf8"));
function fixture(slug = "bancos-y-fintech-chile") {
  return {
    article: manifest.articles.find((item: { slug: string }) => item.slug === slug),
    brief: catalog.entries.find((item: { slug: string }) => item.slug === slug),
  };
}

describe("reviewed editorial briefs", () => {
  it("does not classify banking as unemployment merely because its body mentions sueldo", () => {
    const { article, brief } = fixture();
    const entry = buildPromptEntry(article, brief);
    expect(entry.readerSituation).toContain("ingresos");
    expect(entry.prompt).toContain("debit card");
    expect(entry.prompt).toContain("smartphone");
    expect(entry.selectors.ruleId).toBe("explicit-reviewed-brief");
    expect(entry.selectors.matchedKeywords).toEqual([]);
  });

  it("keeps the payslip dominant in the salary calculation prompt", () => {
    const { article, brief } = fixture("como-calcular-sueldo-liquido");
    const entry = buildPromptEntry(article, brief);
    expect(entry.prompt).toContain("The payslip is dominant and remains clearly present");
    expect(entry.prompt).not.toContain("NEXT REVISION GOAL");
    expect(entry.prompt).not.toContain("WITHOUT document");
  });

  it("requires explicit review for both drafts and published articles", () => {
    const { article, brief } = fixture();
    expect(() => selectPromptPlan(article)).toThrow("Missing reviewed brief");
    expect(() => selectPromptPlan({ ...article, draft: true })).toThrow("Missing reviewed brief");
    expect(() => selectPromptPlan(article, { ...brief, review: { status: "proposed" } })).toThrow("unreviewed");
  });

  it("blocks stale briefs instead of silently accepting changed article content", () => {
    const { article, brief } = fixture();
    expect(validateBrief({ ...article, sourceContentHash: "changed" }, brief).join(" ")).toContain("stale");
    expect(() => buildPromptEntry({ ...article, sourceContentHash: "changed" }, brief)).toThrow("stale");
  });

  it("hashes body and editorial promise while ignoring hero and review metadata", () => {
    const fm = { title: "Título", description: "Descripción", articleLead: { answer: "Respuesta" }, heroImage: "old.avif", updatedDate: "2026-01-01" };
    const initial = articleContentHash(fm, "Texto.\r\n");
    expect(articleContentHash({ ...fm, heroImage: "new.avif", heroImageAlt: "", updatedDate: "2026-09-30" }, "Texto.\n")).toBe(initial);
    expect(articleContentHash(fm, "Texto distinto.")).not.toBe(initial);
    expect(articleContentHash({ ...fm, articleLead: { answer: "Otra promesa" } }, "Texto.")).not.toBe(initial);
    expect(articleContentHash({ ...fm, title: "Otro título" }, "Texto.")).not.toBe(initial);
  });

  it("produces identical final prompts and hashes from the same reviewed source", () => {
    const { article, brief } = fixture();
    expect(buildPromptEntry(article, brief)).toEqual(buildPromptEntry(article, brief));
    expect(buildPromptEntry(article, brief).styleVersion).toBe(EDITORIAL_STYLE_VERSION);
  });

  it("routes numerical methodology to a reproducible render without contradictory imagegen instructions", () => {
    const { article, brief } = fixture("interes-compuesto-nota-metodologica");
    const entry = buildPromptEntry(article, brief);
    expect(entry.generationMethod).toBe("data-render");
    expect(entry.prompt).toContain("not an image generator");
    expect(entry.prompt).not.toContain("Do not render text");
  });

  it("keeps a preservation edit separate from the v5 restyling prompt", () => {
    const { article, brief } = fixture("primer-empleo-chile-guia-completa");
    const entry = buildPromptEntry(article, brief);
    expect(entry.generationMethod).toBe("image-edit");
    expect(entry.prompt).toContain("remove only the black side bars");
    expect(entry.prompt).toContain("Preserve the original person, doorway, briefcase");
    expect(entry.prompt).not.toContain("Create an original editorial illustration");
    expect(entry.prompt).not.toContain("soft shadows");
    expect(entry.referenceImagePath).toBe(brief.referenceImagePath);
    expect(validateBrief(article, { ...brief, referenceImagePath: undefined }).join(" ")).toContain("referenceImagePath");
    expect(validateBrief(article, { ...brief, referenceImageHash: undefined }).join(" ")).toContain("referenceImageHash");
  });

  it("requires the preserved reference bytes for edits and detects missing or changed originals", async () => {
    const { brief } = fixture("primer-empleo-chile-guia-completa");
    expect(await validateEditReference(brief)).toEqual([]);
    expect(await validateEditReference({ ...brief, referenceImageHash: "0".repeat(64) })).toEqual([expect.stringContaining("bytes changed")]);
    expect(await validateEditReference({ ...brief, referenceImagePath: "scripts/hero-images/references/missing.avif" })).toEqual([expect.stringContaining("Cannot read")]);
    expect(await validateEditReference({ ...brief, referenceImagePath: "scripts/hero-images/references/../../secret.avif" })).toEqual([expect.stringContaining("Invalid")]);
    expect(await validateEditReference(fixture().brief)).toEqual([]);
  });

  it("requires all brief semantics and a deliberate decorative or informative alt", () => {
    const { article, brief } = fixture();
    expect(validateBrief(article, { ...brief, alt: undefined }).join(" ")).toContain("brief.alt");
    expect(validateBrief(article, { ...brief, requiredElements: [] }).join(" ")).toContain("requiredElements");
    expect(validateBrief(article, { ...brief, styleVersion: "old" }).join(" ")).toContain("outdated");
  });
});
