import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { SITE } from "../../src/config";
import { GET as getHotlinkSafeOgImage } from "../../src/pages/og-image";
import { GET as getLegacyPngOgImage } from "../../src/pages/og.png";
import { getRobotsTxt } from "../../src/pages/robots.txt";

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
    expect(SITE.ogImage).toBe("og-image");
    expect(SITE.ogImageType).toBe("image/jpeg");
  });

  it("serves a truthful, cacheable JPEG from the hotlink-safe endpoint", async () => {
    const response = await getHotlinkSafeOgImage({} as never);
    const body = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(body).metadata();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("cache-control")).toContain("s-maxage=604800");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(metadata).toMatchObject({ format: "jpeg", width: 1200, height: 630 });
  });

  it("keeps the legacy PNG endpoint truthful and social assets crawlable", async () => {
    const response = await getLegacyPngOgImage({} as never);
    const body = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(body).metadata();
    const robots = getRobotsTxt(new URL("https://monedario.cl/sitemap-index.xml"));

    expect(response.headers.get("content-type")).toBe("image/png");
    expect(metadata).toMatchObject({ format: "png", width: 1200, height: 630 });
    expect(robots).not.toContain("Disallow: /og-image");
    expect(robots).not.toContain("Disallow: /og.jpg");
    expect(robots).not.toContain("Disallow: /og.png");
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
