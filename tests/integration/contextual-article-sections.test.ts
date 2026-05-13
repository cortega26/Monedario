import { describe, expect, it } from "vitest";

import { getArticleContextualSections } from "../../src/config/contextualArticleSections";

describe("Article contextual sections registry", () => {
  it("returns existing sueldo sections through the shared registry", () => {
    const sections = getArticleContextualSections("como-calcular-sueldo-liquido");

    expect(sections).toHaveLength(2);
    expect(sections[0]?.items.some(item => item.href === "/calculadoras/sueldo-liquido/")).toBe(true);
  });

  it("returns existing deuda sections through the shared registry", () => {
    const sections = getArticleContextualSections("informe-deudas-cmf-vs-dicom");

    expect(sections).toHaveLength(1);
    expect(sections[0]?.items.some(item => item.href === "/posts/renegociacion-superir/")).toBe(true);
  });

  it("returns pension sections so owner articles are not orphaned", () => {
    const sections = getArticleContextualSections(
      "reforma-previsional-2025-que-cambia-y-como-te-afecta"
    );

    expect(sections).toHaveLength(2);
    expect(
      sections[0]?.items.some(item => item.href === "/calculadoras/apv/")
    ).toBe(true);
    expect(
      sections[1]?.items.some(
        item => item.href === "/posts/como-cambiarse-de-afp/"
      )
    ).toBe(true);
  });

  it("returns no sections for unrelated slugs", () => {
    expect(getArticleContextualSections("slug-inexistente")).toEqual([]);
  });
});