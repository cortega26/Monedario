import { describe, expect, it } from "vitest";
import {
  buildPromptA,
  buildPromptB,
  buildPromptC,
} from "../../scripts/hero-images/config.mjs";

describe("hero-images prompt builders", () => {
  it("buildPromptA is deterministic and preserves the repaired editorial direction", () => {
    const first = buildPromptA(
      "#0d9488",
      "seated at a table, leaning slightly forward",
      "calculator, stacked papers"
    );
    const second = buildPromptA(
      "#0d9488",
      "seated at a table, leaning slightly forward",
      "calculator, stacked papers"
    );

    expect(first).toBe(second);
    expect(first).toContain("Background: solid color #0d9488.");
    expect(first).toContain(
      "Scene: one simplified human figure seated at a table, leaning slightly forward, in a recognizable everyday money situation."
    );
    expect(first).toContain(
      "Place one dominant financial object near the figure: calculator, stacked papers."
    );
    expect(first).toContain(
      "Allow one controlled depth cue through overlap, scale contrast, or a simple grounding shape."
    );
    expect(first).toContain(
      "Lighting: soft and even. One simple shadow block or grounding shape is allowed if it helps hierarchy."
    );
    expect(first).toContain(
      "Keep shapes crisp, controlled, and simplified, with enough variation in scale and overlap to feel editorial rather than diagrammatic clipart."
    );
    expect(first).toContain("Color palette: 4 to 5 flat colors maximum.");
    expect(first).toContain("Composition: build the main action in the left or center-left area");
    expect(first).toContain("Canvas: 1200x630 pixels, landscape.");
    expect(first).toContain("Avoid photorealism, 3D rendering, CGI, neon, fake UI, clutter");
  });

  it("buildPromptB keeps technical prompts editorial instead of sterile", () => {
    const prompt = buildPromptB("#4f46e5", "activity pulse line");

    expect(prompt).toContain(
      "Scene: one clear editorial finance object built around activity pulse line, dominant in frame and composed to feel like an article cover rather than a plain centered icon."
    );
    expect(prompt).toContain("Background: solid color #4f46e5.");
    expect(prompt).toContain("Color palette: 3 to 4 flat colors maximum");
    expect(prompt).toContain("slightly offset rather than perfectly centered");
    expect(prompt).toContain("Canvas: 1200x630 pixels, landscape.");
  });

  it("buildPromptC reserves left area for post-production text", () => {
    const prompt = buildPromptC("#059669", "bar chart icon");

    expect(prompt).toContain("Background: solid color #059669");
    expect(prompt).toContain("aligned to the right third of the canvas");
    expect(prompt).toContain("left two-thirds quiet enough for hierarchy");
    expect(prompt).toContain("Color palette: 3 to 4 flat colors maximum");
    expect(prompt).toContain("Canvas: 1200x630 pixels, landscape.");
  });
});
