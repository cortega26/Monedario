import { describe, expect, it } from "vitest";
import { toArticleView, type ArticleView } from "@/utils/articleView";
import getPostsByTag from "@/utils/getPostsByTag";
import getSortedPosts from "@/utils/getSortedPosts";
import getUniqueTags, { getUniqueTagsWithCount } from "@/utils/getUniqueTags";
import { getUiCopyForLocale } from "@/i18n/ui";

function entry(overrides: Record<string, unknown> = {}) {
  const { data = {}, ...rest } = overrides;
  return {
    id: "posts/mi-articulo",
    data: {
      title: "  Mi Artículo  ",
      description: "  Descripción  ",
      pubDate: new Date("2026-08-01T12:00:00Z"),
      updatedDate: new Date("2026-08-05T12:00:00Z"),
      tags: ["  impuestos ", "AFP", ""],
      category: "impuestos",
      draft: false,
      unlisted: false,
      featured: false,
      author: "Equipo Monedario",
      lang: "es-CL",
      ...(data as Record<string, unknown>),
    },
    ...rest,
  } as never;
}

describe("toArticleView", () => {
  it("normaliza slug, fechas, tags y defaults", () => {
    const view: ArticleView = toArticleView(entry());
    expect(view.slug).toBe("mi-articulo");
    expect(view.slugSource).toBe("derived");
    expect(view.pubDate.toISOString()).toBe("2026-08-01T12:00:00.000Z");
    expect(view.updatedDate?.toISOString()).toBe("2026-08-05T12:00:00.000Z");
    expect(view.tags).toEqual(["impuestos", "AFP"]);
    expect(view.title).toBe("Mi Artículo");
    expect(view.heroImage).toBeUndefined();
  });

  it("usa el slug explícito del frontmatter (slugSource frontmatter)", () => {
    const view = toArticleView(entry({ data: { slug: "MI-Slug-Explicito" } }));
    expect(view.slug).toBe("mi-slug-explicito");
    expect(view.slugSource).toBe("frontmatter");
  });

  it("lanza sin fecha de publicación válida", () => {
    expect(() => toArticleView(entry({ data: { pubDate: undefined } }))).toThrow(
      /Missing\/invalid publication date/
    );
  });

  it("trata updatedDate ausente como null", () => {
    const view = toArticleView(entry({ data: { updatedDate: undefined } }));
    expect(view.updatedDate).toBeNull();
  });

  it("resuelve heroImage string u objeto, y defaults de autor/categoría", () => {
    expect(
      toArticleView(entry({ data: { heroImage: "/img/x.avif" } })).heroImage
    ).toBe("/img/x.avif");
    const withObj = toArticleView(
      entry({ data: { heroImage: { src: "/img/y.avif" } } })
    );
    expect(withObj.heroImage).toBe("/img/y.avif");
    const noAuthor = toArticleView(
      entry({ data: { author: undefined, category: undefined } })
    );
    expect(noAuthor.author).toBe("Carlos Ortega");
    expect(noAuthor.category).toBe("general");
  });
});

describe("getSortedPosts / getPostsByTag / getUniqueTags", () => {
  const posts = [
    entry({ id: "posts/uno", data: { title: "Uno", pubDate: new Date("2026-01-01T00:00:00Z"), updatedDate: undefined, tags: ["a"], draft: false } }),
    entry({ id: "posts/dos", data: { title: "Dos", pubDate: new Date("2026-06-01T00:00:00Z"), updatedDate: undefined, tags: ["a", "b"], draft: false } }),
    entry({ id: "posts/draft", data: { title: "Draft", pubDate: new Date("2026-07-01T00:00:00Z"), updatedDate: undefined, tags: ["a"], draft: true } }),
    entry({ id: "posts/unlisted", data: { title: "Oculto", pubDate: new Date("2026-05-01T00:00:00Z"), updatedDate: undefined, tags: ["b"], unlisted: true } }),
  ];

  it("ordena por fecha descendente filtrando draft/unlisted", () => {
    const sorted = getSortedPosts(posts as never);
    expect(sorted.map(p => p.data.title)).toEqual(["Dos", "Uno"]);
  });

  it("filtra posts por tag con slugificación", () => {
    const tagged = getPostsByTag(posts as never, "b");
    expect(tagged.map(p => p.data.title)).toEqual(["Dos"]);
  });

  it("cuenta tags únicos solo sobre posts publicados", () => {
    const tags = getUniqueTagsWithCount(posts as never);
    expect(tags).toEqual([
      { tag: "a", tagName: "a", count: 2 },
      { tag: "b", tagName: "b", count: 1 },
    ]);
  });

  it("getUniqueTags (default) lista tags sin conteo, ordenados alfabéticamente", () => {
    const tags = getUniqueTags(posts as never);
    expect(tags).toEqual([
      { tag: "a", tagName: "a" },
      { tag: "b", tagName: "b" },
    ]);
  });
});

describe("getUiCopyForLocale", () => {
  it("resuelve es y variantes es-* al copy por defecto", () => {
    expect(getUiCopyForLocale()).toBe(getUiCopyForLocale("es"));
    expect(getUiCopyForLocale("es-CL")).toBe(getUiCopyForLocale("es"));
  });

  it("lanza para locales no soportados", () => {
    expect(() => getUiCopyForLocale("en")).toThrow(/Unsupported locale/);
  });
});
