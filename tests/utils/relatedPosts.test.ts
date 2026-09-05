import { beforeEach, describe, expect, it } from "vitest";

import { toArticleView } from "@/utils/articleView";
import {
  __resetRelatedMatrixCacheForTests,
  computeRelatedMap,
  computeRelatedSlugs,
  getRelatedMatrixBuildCount,
  relatedSlugsFor,
} from "@/utils/relatedPosts";

function entry(slug: string, overrides: Record<string, unknown> = {}) {
  const { data = {}, ...rest } = overrides;
  return {
    id: `posts/${slug}`,
    data: {
      title: `Title ${slug}`,
      description: `Description ${slug}`,
      pubDate: new Date("2026-01-01T12:00:00Z"),
      tags: [],
      draft: false,
      unlisted: false,
      ...(data as Record<string, unknown>),
    },
    ...rest,
  } as never;
}

const current = {
  slug: "actual",
  tags: ["AFP", "Sueldo"],
  cluster: "sueldo-remuneraciones",
  canonicalTopic: "calcular-sueldo-liquido",
};

function dated(iso: string) {
  return new Date(iso);
}

describe("computeRelatedSlugs", () => {
  it("excludes the current post, drafts and unlisted posts", () => {
    const posts = [
      entry("actual", {
        data: {
          tags: ["AFP", "Sueldo"],
          cluster: "sueldo-remuneraciones",
          canonicalTopic: "calcular-sueldo-liquido",
        },
      }),
      entry("borrador", { data: { draft: true, tags: ["AFP"] } }),
      entry("oculto", { data: { unlisted: true, tags: ["AFP"] } }),
      entry("visible", { data: { tags: ["AFP"] } }),
    ];

    expect(computeRelatedSlugs(posts, current)).toEqual(["visible"]);
  });

  it("ranks same canonical topic above cluster above tags above unrelated", () => {
    const posts = [
      entry("actual"),
      entry("no-relacionado", {
        data: {
          pubDate: dated("2026-06-01T12:00:00Z"),
          tags: ["DICOM"],
          cluster: "deuda-credito",
          canonicalTopic: "informe-deudas",
        },
      }),
      entry("solo-tag", {
        data: {
          pubDate: dated("2026-05-01T12:00:00Z"),
          tags: ["AFP"],
          cluster: "pensiones-afp",
          canonicalTopic: "cambio-afp",
        },
      }),
      entry("mismo-cluster", {
        data: {
          pubDate: dated("2026-04-01T12:00:00Z"),
          tags: ["AFP", "Sueldo"],
          cluster: "sueldo-remuneraciones",
          canonicalTopic: "liquidacion-sueldo",
        },
      }),
      entry("mismo-tema", {
        data: {
          pubDate: dated("2026-03-01T12:00:00Z"),
          tags: [],
          cluster: "deuda-credito",
          canonicalTopic: "calcular-sueldo-liquido",
        },
      }),
    ];

    expect(computeRelatedSlugs(posts, current)).toEqual([
      "mismo-tema",
      "mismo-cluster",
      "solo-tag",
    ]);
  });

  it("breaks score ties by newer publication date", () => {
    const posts = [
      entry("actual"),
      entry("antiguo", {
        data: {
          pubDate: dated("2026-01-15T12:00:00Z"),
          tags: ["AFP"],
          cluster: "pensiones-afp",
          canonicalTopic: "cambio-afp",
        },
      }),
      entry("reciente", {
        data: {
          pubDate: dated("2026-06-15T12:00:00Z"),
          tags: ["Sueldo"],
          cluster: "pensiones-afp",
          canonicalTopic: "cambio-afp",
        },
      }),
    ];

    expect(computeRelatedSlugs(posts, current)).toEqual([
      "reciente",
      "antiguo",
    ]);
  });

  it("orders zero-score fallback posts by newer publication date", () => {
    const posts = [
      entry("actual"),
      entry("cero-antiguo", {
        data: {
          pubDate: dated("2026-01-10T12:00:00Z"),
          tags: ["DICOM"],
          cluster: "deuda-credito",
          canonicalTopic: "informe-deudas",
        },
      }),
      entry("destacado", {
        data: {
          pubDate: dated("2025-12-01T12:00:00Z"),
          tags: ["AFP"],
          cluster: "pensiones-afp",
          canonicalTopic: "cambio-afp",
        },
      }),
      entry("cero-reciente", {
        data: {
          pubDate: dated("2026-06-10T12:00:00Z"),
          tags: ["IPC"],
          cluster: "deuda-credito",
          canonicalTopic: "informe-deudas",
        },
      }),
    ];

    expect(computeRelatedSlugs(posts, current)).toEqual([
      "destacado",
      "cero-reciente",
      "cero-antiguo",
    ]);
  });

  it("honors the exclusion set before slicing", () => {
    const posts = [
      entry("actual"),
      entry("top", {
        data: {
          pubDate: dated("2026-06-01T12:00:00Z"),
          tags: [],
          cluster: "deuda-credito",
          canonicalTopic: "calcular-sueldo-liquido",
        },
      }),
      entry("segundo", {
        data: {
          pubDate: dated("2026-05-01T12:00:00Z"),
          tags: ["AFP", "Sueldo"],
          cluster: "sueldo-remuneraciones",
          canonicalTopic: "liquidacion-sueldo",
        },
      }),
      entry("tercero", {
        data: {
          pubDate: dated("2026-04-01T12:00:00Z"),
          tags: ["AFP"],
          cluster: "pensiones-afp",
          canonicalTopic: "cambio-afp",
        },
      }),
      entry("cuarto", {
        data: {
          pubDate: dated("2026-03-01T12:00:00Z"),
          tags: ["DICOM"],
          cluster: "deuda-credito",
          canonicalTopic: "informe-deudas",
        },
      }),
    ];

    expect(
      computeRelatedSlugs(posts, current, { excludedSlugs: ["top"] })
    ).toEqual(["segundo", "tercero", "cuarto"]);
  });

  it("slices to three posts", () => {
    const posts = [
      entry("actual"),
      entry("uno", {
        data: {
          pubDate: dated("2026-06-01T12:00:00Z"),
          tags: ["AFP", "Sueldo", "Extra"],
          cluster: "sueldo-remuneraciones",
          canonicalTopic: "otro-tema",
        },
      }),
      entry("dos", {
        data: {
          pubDate: dated("2026-05-01T12:00:00Z"),
          tags: ["AFP", "Sueldo"],
          cluster: "sueldo-remuneraciones",
          canonicalTopic: "otro-tema",
        },
      }),
      entry("tres", {
        data: {
          pubDate: dated("2026-04-01T12:00:00Z"),
          tags: ["AFP"],
          cluster: "sueldo-remuneraciones",
          canonicalTopic: "otro-tema",
        },
      }),
      entry("cuatro", {
        data: {
          pubDate: dated("2026-03-01T12:00:00Z"),
          tags: ["AFP"],
          cluster: "pensiones-afp",
          canonicalTopic: "otro-tema",
        },
      }),
      entry("cinco", {
        data: {
          pubDate: dated("2026-02-01T12:00:00Z"),
          tags: ["DICOM"],
          cluster: "deuda-credito",
          canonicalTopic: "otro-tema",
        },
      }),
    ];

    expect(computeRelatedSlugs(posts, current)).toEqual([
      "uno",
      "dos",
      "tres",
    ]);
  });

  it("returns an empty list for an empty corpus", () => {
    expect(computeRelatedSlugs([], current)).toEqual([]);
  });

  it("matches with and without precomputed article views", () => {
    const posts = [
      entry("actual", {
        data: {
          tags: ["AFP"],
          cluster: "sueldo-remuneraciones",
          canonicalTopic: "calcular-sueldo-liquido",
        },
      }),
      entry("candidato", {
        data: {
          pubDate: dated("2026-06-01T12:00:00Z"),
          tags: ["AFP"],
          cluster: "pensiones-afp",
          canonicalTopic: "cambio-afp",
        },
      }),
    ];

    const allArticleViews = posts.map(toArticleView);

    expect(computeRelatedSlugs(posts, current)).toEqual(["candidato"]);
    expect(
      computeRelatedSlugs(posts, current, { allArticleViews })
    ).toEqual(["candidato"]);
  });
});

describe("computeRelatedMap / relatedSlugsFor amortization", () => {
  beforeEach(() => {
    __resetRelatedMatrixCacheForTests();
  });

  function corpus() {
    const posts = [
      entry("actual", {
        data: {
          pubDate: dated("2026-01-01T12:00:00Z"),
          tags: ["AFP", "Sueldo"],
          cluster: "sueldo-remuneraciones",
          canonicalTopic: "calcular-sueldo-liquido",
        },
      }),
      entry("mismo-tema", {
        data: {
          pubDate: dated("2026-03-01T12:00:00Z"),
          tags: [],
          cluster: "deuda-credito",
          canonicalTopic: "calcular-sueldo-liquido",
        },
      }),
      entry("mismo-cluster", {
        data: {
          pubDate: dated("2026-04-01T12:00:00Z"),
          tags: ["AFP", "Sueldo"],
          cluster: "sueldo-remuneraciones",
          canonicalTopic: "liquidacion-sueldo",
        },
      }),
      entry("solo-tag", {
        data: {
          pubDate: dated("2026-05-01T12:00:00Z"),
          tags: ["AFP"],
          cluster: "pensiones-afp",
          canonicalTopic: "cambio-afp",
        },
      }),
      entry("cero-reciente", {
        data: {
          pubDate: dated("2026-06-10T12:00:00Z"),
          tags: ["IPC"],
          cluster: "deuda-credito",
          canonicalTopic: "informe-deudas",
        },
      }),
      entry("borrador", { data: { draft: true, tags: ["AFP"] } }),
      entry("oculto", { data: { unlisted: true, tags: ["AFP"] } }),
    ];
    const allArticleViews = posts.map(toArticleView);
    return { posts, allArticleViews };
  }

  it("stores FULL ranked lists (unsliced, owner included) with drafts/unlisted filtered", () => {
    const { posts, allArticleViews } = corpus();
    const map = computeRelatedMap(posts, { allArticleViews });

    // One entry per corpus post, each holding every visible candidate.
    expect(map.size).toBe(posts.length);
    const visibleSlugs = ["actual", "mismo-tema", "mismo-cluster", "solo-tag",
      "cero-reciente"];
    for (const slug of visibleSlugs) {
      const ranked = map.get(slug);
      expect(ranked).toBeDefined();
      // FULL list: all 5 visible slugs including the owner (self-exclusion
      // happens per page in relatedSlugsFor, not at matrix time).
      expect(ranked).toHaveLength(visibleSlugs.length);
      expect(ranked).toContain(slug);
      expect(ranked).not.toContain("borrador");
      expect(ranked).not.toContain("oculto");
    }
  });

  it("amortizes: K lookups on ONE shared reference compute the matrix once and match computeRelatedSlugs", () => {
    const { posts, allArticleViews } = corpus();
    const slugs = [
      "actual",
      "mismo-tema",
      "mismo-cluster",
      "solo-tag",
      "cero-reciente",
    ];
    // Per-page exclusions differ per page (prev/next): vary them on purpose.
    const exclusions: Record<string, string[]> = {
      actual: [],
      "mismo-tema": ["solo-tag"],
      "mismo-cluster": ["actual"],
      "solo-tag": ["mismo-tema", "cero-reciente"],
      "cero-reciente": [],
    };

    const viaLookup = slugs.map(slug =>
      relatedSlugsFor(posts, slug, exclusions[slug], { allArticleViews })
    );
    expect(getRelatedMatrixBuildCount()).toBe(1);

    // Repeat lookups must still hit the memoized matrix.
    for (const slug of slugs) {
      relatedSlugsFor(posts, slug, exclusions[slug], { allArticleViews });
    }
    expect(getRelatedMatrixBuildCount()).toBe(1);

    // Slug-for-slug equivalence with the per-page reference implementation.
    for (const [i, slug] of slugs.entries()) {
      const article = allArticleViews.find(a => a.slug === slug)!;
      const found = posts.find(p => toArticleView(p).slug === slug)!;
      const foundData = found as unknown as {
        data: { canonicalTopic?: string };
      };
      const reference = computeRelatedSlugs(
        posts,
        {
          slug,
          tags: article.tags,
          cluster: article.cluster,
          canonicalTopic: foundData.data.canonicalTopic,
        },
        { allArticleViews, excludedSlugs: exclusions[slug] }
      );
      expect(viaLookup[i]).toEqual(reference);
    }
  });

  it("recomputes for a DISTINCT array identity (simulates Astro per-page arrays)", () => {
    const { posts, allArticleViews } = corpus();
    relatedSlugsFor(posts, "actual", [], { allArticleViews });
    expect(getRelatedMatrixBuildCount()).toBe(1);

    // Same content, different array references (what [...slug]/index.astro
    // produces per page via getCollection + filter/sort + map).
    const postsCopy = [...posts];
    const viewsCopy = [...allArticleViews];
    relatedSlugsFor(postsCopy, "solo-tag", [], { allArticleViews: viewsCopy });
    expect(getRelatedMatrixBuildCount()).toBe(2);
  });

  it("matches computeRelatedSlugs without precomputed views", () => {
    const { posts } = corpus();
    const slug = "actual";
    const found = posts.find(p => toArticleView(p).slug === slug)!;
    const article = toArticleView(found);
    const foundData = found as unknown as {
      data: { canonicalTopic?: string };
    };
    const reference = computeRelatedSlugs(posts, {
      slug,
      tags: article.tags,
      cluster: article.cluster,
      canonicalTopic: foundData.data.canonicalTopic,
    });
    expect(relatedSlugsFor(posts, slug)).toEqual(reference);
    expect(getRelatedMatrixBuildCount()).toBe(1);
  });

  it("falls back to single-row scoring for corpus-external slugs (unlisted pages)", () => {
    const { posts, allArticleViews } = corpus();
    // Simulate PostDetails corpus: getSortedPosts/postFilter already removed
    // drafts + unlisted, so the unlisted current is NOT a matrix key.
    const visiblePosts = posts.filter(
      p => !toArticleView(p).draft && !toArticleView(p).unlisted
    );
    const visibleViews = allArticleViews.filter(
      a => !a.draft && !a.unlisted
    );
    const external = {
      slug: "nota-metodologica",
      tags: ["ahorro", "interes-compuesto"],
      cluster: "ahorro-e-inversion",
      canonicalTopic: "interes-compuesto-caso",
    };

    const viaLookup = relatedSlugsFor(visiblePosts, external.slug, [], {
      allArticleViews: visibleViews,
      current: external,
    });
    const reference = computeRelatedSlugs(visiblePosts, external, {
      allArticleViews: visibleViews,
    });
    expect(viaLookup).toEqual(reference);
    expect(viaLookup).toHaveLength(3);
    // Matrix built once; the fallback row does not rebuild it.
    expect(getRelatedMatrixBuildCount()).toBe(1);
  });

  it("returns an empty list for unknown slugs without current input", () => {
    const { posts, allArticleViews } = corpus();
    expect(
      relatedSlugsFor(posts, "inexistente", [], { allArticleViews })
    ).toEqual([]);
  });
});
