import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

describe("homepage social-preview assets", () => {
  it("publishes the required installable and social metadata", () => {
    const layout = readFileSync(path.join(rootDir, "src/layouts/Layout.astro"), "utf8");

    expect(layout).toContain('href={getPath("/favicon.ico")}');
    expect(layout).toContain('href={getPath("/favicon-32x32.png")}');
    expect(layout).toContain('href={getPath("/apple-touch-icon.png")}');
    expect(layout).toContain('href={getPath("/site.webmanifest")}');
    expect(layout).toContain('name="twitter:site" content="@monedario_cl"');
    expect(layout).toContain('name="twitter:image:alt" content={description}');
  });

  it("ships manifest icons at their declared dimensions", async () => {
    const manifest = JSON.parse(
      readFileSync(path.join(rootDir, "public/site.webmanifest"), "utf8")
    ) as { icons: Array<{ sizes: string; src: string; type: string }> };

    for (const size of ["192x192", "512x512"]) {
      const icon = manifest.icons.find(candidate => candidate.sizes === size);
      expect(icon).toMatchObject({ type: "image/png" });
      const [width, height] = size.split("x").map(Number);
      const metadata = await sharp(path.join(rootDir, `public${icon?.src}`)).metadata();
      expect(metadata.width).toBe(width);
      expect(metadata.height).toBe(height);
    }

    for (const [file, width, height] of [
      ["apple-touch-icon.png", 180, 180],
      ["favicon-16x16.png", 16, 16],
      ["favicon-32x32.png", 32, 32],
    ] as const) {
      const metadata = await sharp(path.join(rootDir, "public", file)).metadata();
      expect(metadata.format).toBe("png");
      expect(metadata.width).toBe(width);
      expect(metadata.height).toBe(height);
    }

    const ico = readFileSync(path.join(rootDir, "public/favicon.ico"));
    expect(ico.subarray(0, 4).toString("hex")).toBe("00000100");
  });
});
