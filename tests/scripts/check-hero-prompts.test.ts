import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { buildArticleSceneId } from "../../scripts/hero-images/prompt-plan.mjs";

const SCRIPT_PATH = path.resolve("scripts/check-hero-prompts.mjs");
const tempRoots: string[] = [];

function createTempDir(): string {
  const root = mkdtempSync(path.join(tmpdir(), "tpi-hero-prompts-"));
  tempRoots.push(root);
  return root;
}

function writeJson(filePath: string, value: unknown) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sha256(input: string) {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

function runCheck(rootDir: string, extraArgs: string[] = []) {
  return spawnSync("node", [SCRIPT_PATH, ...extraArgs], {
    env: {
      ...process.env,
      HERO_MANIFEST_PATH: path.join(rootDir, "manifest.json"),
      HERO_PROMPTS_PATH: path.join(rootDir, "prompts.json"),
    },
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("check-hero-prompts script", () => {
  it("passes when prompts include text-backed semantic evidence", () => {
    const root = createTempDir();
    const prompt =
      "Create a flat editorial vector illustration for a trusted personal finance publication. Scene: one strong editorial mechanism built around a rising line chart with a small coin symbol, aligned to the right third of the canvas.";

    writeJson(path.join(root, "manifest.json"), {
      articles: [
        {
          slug: "que-es-la-uf",
          sourcePath: "src/data/blog/que-es-la-uf.md",
        },
      ],
    });
    writeJson(path.join(root, "prompts.json"), {
      entries: [
        {
          slug: "que-es-la-uf",
          sourcePath: "src/data/blog/que-es-la-uf.md",
          template: "C",
          promptTrack: "C",
          approvedModelId: "uf-indicadores",
          sceneId: buildArticleSceneId("C", "uf-indicadores", "que-es-la-uf"),
          readerSituation: "Persona entendiendo un indicador economico que afecta pagos cotidianos.",
          primaryIntent: "explicar",
          toneClass: "educativo",
          visualEvidence: [
            "text contains 'uf' in article body/title context",
            "primary intent classified as 'explicar' from article text",
          ],
          prompt,
          promptHash: sha256(prompt),
          selectors: {
            ruleId: "uf",
            matchedKeywords: ["uf"],
          },
        },
      ],
    });

    const result = runCheck(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[check-hero-prompts] OK");
  });

  it("fails when evidence is metadata-only", () => {
    const root = createTempDir();
    const prompt =
      "Create a flat editorial vector illustration for a trusted personal finance publication. Scene: a simplified person is facing a stack of debt documents.";

    writeJson(path.join(root, "manifest.json"), {
      articles: [
        {
          slug: "deuda-generica",
          sourcePath: "src/data/blog/deuda-generica.md",
        },
      ],
    });
    writeJson(path.join(root, "prompts.json"), {
      entries: [
        {
          slug: "deuda-generica",
          sourcePath: "src/data/blog/deuda-generica.md",
          template: "A",
          promptTrack: "A",
          approvedModelId: "deuda-credito",
          sceneId: buildArticleSceneId("A", "deuda-credito", "deuda-generica"),
          readerSituation: "Persona enfrentando documentos, cuotas o decisiones de deuda.",
          primaryIntent: "explicar",
          toneClass: "serio",
          visualEvidence: ["metadata fallback matched 'deuda'"],
          prompt,
          promptHash: sha256(prompt),
          selectors: {
            ruleId: "deuda",
            matchedKeywords: ["deuda"],
          },
        },
      ],
    });

    const result = runCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Metadata-only fallback detected");
    expect(result.stderr).toContain("visualEvidence must include at least one article-text-backed reason");
  });

  it("warns on fallback scene by default and fails in strict fallback mode", () => {
    const root = createTempDir();
    const prompt =
      "Create a flat editorial vector illustration for a trusted personal finance publication. Scene: one clear editorial finance object built around a rectangular card shape with two horizontal stripes and a small chip symbol.";

    writeJson(path.join(root, "manifest.json"), {
      articles: [
        {
          slug: "general",
          sourcePath: "src/data/blog/general.md",
        },
      ],
    });
    writeJson(path.join(root, "prompts.json"), {
      entries: [
        {
          slug: "general",
          sourcePath: "src/data/blog/general.md",
          template: "B",
          promptTrack: "C",
          approvedModelId: "cuenta-corriente-banco",
          sceneId: buildArticleSceneId("B", "cuenta-corriente-banco", "general"),
          readerSituation: "Persona revisando informacion financiera practica para tomar una decision.",
          primaryIntent: "explicar",
          toneClass: "neutral",
          visualEvidence: [
            "text contains 'decision' in article body/title context",
            "used fallback scene after reading article without a dominant visual cue",
          ],
          prompt,
          promptHash: sha256(prompt),
          selectors: {
            ruleId: "fallback",
            matchedKeywords: [],
          },
        },
      ],
    });

    const warnResult = runCheck(root);
    expect(warnResult.status).toBe(0);
    expect(warnResult.stderr).toContain("Warnings: 1");

    const strictResult = runCheck(root, ["--strict-fallback"]);
    expect(strictResult.status).toBe(1);
    expect(strictResult.stderr).toContain("Fallback scene detected after article read (strict mode)");
  });

  it("fails when prompt entry references a model outside the approved catalog", () => {
    const root = createTempDir();
    const prompt =
      "Create a flat editorial vector illustration for a trusted personal finance publication. Scene: a simplified person is reviewing a financial decision.";

    writeJson(path.join(root, "manifest.json"), {
      articles: [
        {
          slug: "invalid-model",
          sourcePath: "src/data/blog/invalid-model.md",
        },
      ],
    });
    writeJson(path.join(root, "prompts.json"), {
      entries: [
        {
          slug: "invalid-model",
          sourcePath: "src/data/blog/invalid-model.md",
          template: "A",
          promptTrack: "A",
          approvedModelId: "custom-scene",
          sceneId: buildArticleSceneId("A", "custom-scene", "invalid-model"),
          readerSituation: "Persona revisando informacion financiera practica para tomar una decision.",
          primaryIntent: "explicar",
          toneClass: "neutral",
          visualEvidence: [
            "text contains 'decision' in article body/title context",
          ],
          prompt,
          promptHash: sha256(prompt),
          selectors: {
            ruleId: "fallback",
            matchedKeywords: [],
          },
        },
      ],
    });

    const result = runCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("is not part of the approved template catalog");
  });

  it("fails when prompts are duplicated across multiple slugs", () => {
    const root = createTempDir();
    const prompt =
      "Create a flat editorial vector illustration for a trusted personal finance publication.\nScene: a simplified person is organizing savings around one jar and one notebook.\nBackground: solid color #059669.";

    writeJson(path.join(root, "manifest.json"), {
      articles: [
        { slug: "slug-a", sourcePath: "src/data/blog/slug-a.md" },
        { slug: "slug-b", sourcePath: "src/data/blog/slug-b.md" },
      ],
    });
    writeJson(path.join(root, "prompts.json"), {
      entries: [
        {
          slug: "slug-a",
          sourcePath: "src/data/blog/slug-a.md",
          template: "A",
          promptTrack: "A",
          approvedModelId: "ahorro",
          sceneId: buildArticleSceneId("A", "ahorro", "slug-a"),
          readerSituation: "Persona organizando ahorro o controlando gastos cotidianos.",
          primaryIntent: "explicar",
          toneClass: "progreso",
          visualEvidence: ["text contains 'ahorro' in article body/title context"],
          prompt,
          promptHash: sha256(prompt),
          selectors: {
            ruleId: "ahorro",
            matchedKeywords: ["ahorro"],
          },
        },
        {
          slug: "slug-b",
          sourcePath: "src/data/blog/slug-b.md",
          template: "A",
          promptTrack: "A",
          approvedModelId: "ahorro",
          sceneId: buildArticleSceneId("A", "ahorro", "slug-b"),
          readerSituation: "Persona organizando ahorro o controlando gastos cotidianos.",
          primaryIntent: "explicar",
          toneClass: "progreso",
          visualEvidence: ["text contains 'meta' in article body/title context"],
          prompt,
          promptHash: sha256(prompt),
          selectors: {
            ruleId: "ahorro",
            matchedKeywords: ["meta"],
          },
        },
      ],
    });

    const result = runCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Duplicate prompt detected in prompts.json");
  });

  it("fails when a human-scene track loses its human anchor", () => {
    const root = createTempDir();
    const prompt =
      "Create a flat editorial vector illustration for a trusted personal finance publication. Scene: one centered debt document with two abstract bars.";

    writeJson(path.join(root, "manifest.json"), {
      articles: [
        { slug: "deuda-sin-ancla", sourcePath: "src/data/blog/deuda-sin-ancla.md" },
      ],
    });
    writeJson(path.join(root, "prompts.json"), {
      entries: [
        {
          slug: "deuda-sin-ancla",
          sourcePath: "src/data/blog/deuda-sin-ancla.md",
          template: "A",
          promptTrack: "B",
          approvedModelId: "deuda-credito",
          sceneId: buildArticleSceneId("A", "deuda-credito", "deuda-sin-ancla"),
          readerSituation: "Persona enfrentando documentos, cuotas o decisiones de deuda.",
          primaryIntent: "explicar",
          toneClass: "serio",
          visualEvidence: ["text contains 'deuda' in article body/title context"],
          prompt,
          promptHash: sha256(prompt),
          selectors: {
            ruleId: "deuda",
            matchedKeywords: ["deuda"],
          },
        },
      ],
    });

    const result = runCheck(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("requires a human/editorial anchor");
  });
});
