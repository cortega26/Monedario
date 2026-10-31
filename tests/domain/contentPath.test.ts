import { describe, expect, it } from "vitest";
import {
  getCanonicalPathFromSlug,
  getSlugParamFromCanonicalSlug,
} from "@/domain/content/path";

describe("content path helpers", () => {
  it("builds canonical post paths from clean or wrapped slugs", () => {
    expect(getCanonicalPathFromSlug("que-es-la-uf")).toBe("/posts/que-es-la-uf/");
    expect(getCanonicalPathFromSlug("/que-es-la-uf/")).toBe(
      "/posts/que-es-la-uf/"
    );
  });

  it("can return local paths without base prefix", () => {
    expect(
      getCanonicalPathFromSlug("que-es-la-uf", { includeBase: false })
    ).toBe("/posts/que-es-la-uf/");
  });

  it("normalizes slug params", () => {
    expect(getSlugParamFromCanonicalSlug("/que-es-la-uf/")).toBe("que-es-la-uf");
  });
});
