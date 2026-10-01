import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import HeroPromptWorkspace from "../../src/tools/hero-images/HeroPromptWorkspace.jsx";

const entry = {
  slug: "test-article",
  title: "Artículo",
  prompt: "The one final prompt.\nNo appended operational notes.",
  promptHash: "test-hash",
  styleVersion: "monedario-editorial-v5",
  targetImagePath: "/images/hero/test-article.avif",
  palette: { hex: "#0d9488" },
  generationMethod: "imagegen",
  referenceImagePath: "",
  referenceImageHash: "",
  canCopyPrompt: true,
  briefErrors: [] as string[],
  batchConcept: "This operational panel must never enter the copied prompt.",
  batchRevisionGoal: "Legacy instruction that conflicts with the prompt.",
};

// The application keeps its React UI in JSX without React declaration packages.
// Load the real runtime through Node and type only the test harness surface.
const require = createRequire(import.meta.url);
const { createElement } = require("react") as {
  createElement: (component: unknown, props: { entries: Array<typeof entry> }) => unknown;
};
const { renderToStaticMarkup } = require("react-dom/server") as {
  renderToStaticMarkup: (element: unknown) => string;
};

function render(overrides: Partial<typeof entry> = {}) {
  return renderToStaticMarkup(createElement(HeroPromptWorkspace, { entries: [{ ...entry, ...overrides }] }));
}

describe("hero prompt workspace", () => {
  it("shows the exact final prompt without concatenating operational metadata", () => {
    const markup = render();
    const textarea = markup.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/)?.[1];
    expect(textarea).toBe(entry.prompt);
    expect(markup).toContain("test-hash");
  });
  it("disables imagegen copy and explains stale briefs", () => {
    const markup = render({ canCopyPrompt: false, briefErrors: ["Brief is stale"] });
    expect(markup).toMatch(/<button[^>]+disabled=""[^>]*>Copiar prompt/);
    expect(markup).toContain("Brief is stale");
  });
  it("shows the required original and its hash for a scoped edit without appending it to the prompt", () => {
    const markup = render({ generationMethod: "image-edit", referenceImagePath: "scripts/hero-images/references/original.avif", referenceImageHash: "original-hash" });
    expect(markup).toContain("Edición acotada");
    expect(markup).toContain("scripts/hero-images/references/original.avif");
    expect(markup).toContain("original-hash");
    expect(markup).toContain("Conservar estilo original");
    expect(markup.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/)?.[1]).toBe(entry.prompt);
  });
  it("directs numerical graphics to reproducible rendering instead of imagegen", () => {
    const markup = render({ canCopyPrompt: false, generationMethod: "data-render" });
    expect(markup).toMatch(/<button[^>]+disabled=""[^>]*>Copiar prompt/);
    expect(markup).toContain("No generar con imagegen");
  });
});
