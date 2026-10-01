import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { checkImageCuration } from "../../scripts/check-image-curation.mjs";

const roots: string[] = [];
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "image-curation-"));
  roots.push(root);
  const slug = "test-article";
  const prompt = {
    slug,
    prompt: "Final reviewed prompt",
    promptHash: digest("Final reviewed prompt"),
    styleVersion: "v5",
    sourceContentHash: "reviewed-article",
  };
  const review = {
    ...prompt,
    source: {
      path: `scripts/hero-images/sources/${slug}.webp`,
      hash: digest("source"),
    },
    asset: { path: `public/images/hero/${slug}.avif`, hash: digest("asset") },
    review: { status: "accepted" },
  };
  for (const [file, value] of Object.entries({
    "scripts/hero-images/prompts.json": JSON.stringify({ entries: [prompt] }),
    "scripts/hero-images/asset-reviews.json": JSON.stringify({
      schemaVersion: 1,
      entries: { [slug]: review },
    }),
    [review.source.path]: "source",
    [review.asset.path]: "asset",
  })) {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await fs.writeFile(path.join(root, file), value);
  }
  return { root, prompt, review };
}
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map(root => fs.rm(root, { recursive: true, force: true }))
  );
});
describe("image curation provenance", () => {
  it("rejects removal of a record while a curated source remains", async () => {
    const { root } = await fixture();
    await fs.writeFile(
      path.join(root, "scripts/hero-images/asset-reviews.json"),
      JSON.stringify({ schemaVersion: 1, entries: {} })
    );
    expect(await checkImageCuration(root)).toEqual([
      expect.stringContaining("curated source has no review record"),
    ]);
  });
  it.each([[], null, "invalid"])(
    "rejects invalid registry shape %s",
    async entries => {
      const { root } = await fixture();
      await fs.writeFile(
        path.join(root, "scripts/hero-images/asset-reviews.json"),
        JSON.stringify({ schemaVersion: 1, entries })
      );
      expect(await checkImageCuration(root)).toEqual([
        "Unsupported image curation registry",
      ]);
    }
  );
  it("accepts matching records", async () => {
    const { root } = await fixture();
    expect(await checkImageCuration(root)).toEqual([]);
  });
  it("requires review after editorial drift without changing assets", async () => {
    const { root, prompt, review } = await fixture();
    await fs.writeFile(
      path.join(root, "scripts/hero-images/prompts.json"),
      JSON.stringify({
        entries: [{ ...prompt, sourceContentHash: "changed-article" }],
      })
    );
    expect(await checkImageCuration(root)).toEqual([
      expect.stringContaining("image review required"),
    ]);
    expect(await fs.readFile(path.join(root, review.asset.path), "utf8")).toBe(
      "asset"
    );
  });
  it("rejects tampering with source or final asset bytes", async () => {
    const { root, review } = await fixture();
    await fs.writeFile(path.join(root, review.source.path), "different source");
    await fs.writeFile(path.join(root, review.asset.path), "different asset");
    expect(await checkImageCuration(root)).toEqual([
      expect.stringContaining("source bytes differ"),
      expect.stringContaining("asset bytes differ"),
    ]);
  });
  it("rejects appended prompt instructions", async () => {
    const { root, prompt } = await fixture();
    await fs.writeFile(
      path.join(root, "scripts/hero-images/prompts.json"),
      JSON.stringify({
        entries: [{ ...prompt, promptHash: digest(prompt.prompt + " extra") }],
      })
    );
    expect(await checkImageCuration(root)).toEqual([
      expect.stringContaining("final prompt/style"),
    ]);
  });
});
