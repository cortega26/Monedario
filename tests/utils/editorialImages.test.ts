import { describe, expect, it, vi } from "vitest";

vi.mock("@/generated/editorial-images.json", () => ({
  default: {
    images: {
      example: {
        assets: {
          hero: {
            src: "/images/editorial/example/hero.avif",
            hash: "1234567890abcdef1234",
            width: 1200,
          },
          tablet: { src: "/images/editorial/example/tablet.avif", width: 800 },
          mobile: { src: "/images/editorial/example/mobile.avif", width: 600 },
          og: { src: "/images/editorial/example/og.jpg", width: 1200 },
        },
      },
    },
  },
}));

import { resolveEditorialImage } from "../../src/utils/editorialImages";

describe("resolveEditorialImage", () => {
  it("uses the manifest for hero, responsive sources, social image and exposure version", () => {
    const image = resolveEditorialImage("example", "/images/hero/old.avif");
    expect(image).toEqual({
      src: "/images/editorial/example/hero.avif",
      srcset:
        "/images/editorial/example/mobile.avif 600w, /images/editorial/example/tablet.avif 800w, /images/editorial/example/hero.avif 1200w",
      og: "/images/editorial/example/og.jpg",
      version: "1234567890abcdef",
    });
  });

  it("keeps legacy and imported sources without inventing responsive variants", () => {
    expect(
      resolveEditorialImage("legacy", { src: "/_astro/picture.hash.webp" })
    ).toEqual({ src: "/_astro/picture.hash.webp" });
    expect(
      resolveEditorialImage("legacy", "https://example.com/image.webp")
    ).toEqual({ src: "https://example.com/image.webp" });
    expect(resolveEditorialImage("missing")).toBeUndefined();
  });
});
