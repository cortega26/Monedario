import { describe, expect, it } from "vitest";

import { getPath } from "@/utils/getPath";

describe("getPath", () => {
  it("normalizes internal paths with a leading slash", () => {
    expect(getPath("posts/mi-articulo")).toBe("/posts/mi-articulo");
    expect(getPath("/posts/mi-articulo")).toBe("/posts/mi-articulo");
  });

  it("preserves absolute URLs", () => {
    expect(getPath("https://www.ips.gob.cl/")).toBe("https://www.ips.gob.cl/");
    expect(getPath("mailto:hola@example.com")).toBe("mailto:hola@example.com");
    expect(getPath("//cdn.example.com/asset.css")).toBe("//cdn.example.com/asset.css");
  });
});

describe("getPath with BASE_URL", () => {
  it("prefija la base y evita duplicarla", async () => {
    const { vi } = await import("vitest");
    vi.stubEnv("BASE_URL", "/blog");
    try {
      const { getPath } = await import("@/utils/getPath");
      expect(getPath("posts/x")).toBe("/blog/posts/x");
      expect(getPath("/blog/posts/x")).toBe("/blog/posts/x");
      expect(getPath("/")).toBe("/blog/");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
