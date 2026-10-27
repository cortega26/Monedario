import { describe, expect, it } from "vitest";
import {
  buildAuthorEntity,
  buildReview,
} from "@/utils/articleStructuredData";

const urls = { authorUrl: "https://monedario.cl/autor/", imageUrl: "https://monedario.cl/a.jpg" };

describe("buildAuthorEntity", () => {
  it("emite Organization cuando la firma es del equipo", () => {
    const entity = buildAuthorEntity("Equipo Monedario", urls);
    expect(entity["@type"]).toBe("Organization");
    expect(entity.name).toBe("Equipo Monedario");
    expect(entity.image).toBeUndefined();
  });

  it("emite Person para una firma personal", () => {
    const entity = buildAuthorEntity("Carlos Ortega", urls);
    expect(entity["@type"]).toBe("Person");
    expect(entity.image).toBe(urls.imageUrl);
    expect(entity.sameAs?.length).toBeGreaterThan(0);
  });

  it("usa el autor del sitio cuando no hay firma", () => {
    expect(buildAuthorEntity(undefined, urls)["@type"]).toBe("Person");
  });
});

describe("buildReview", () => {
  it("no publica revisión a partir de computedAt (D18)", () => {
    expect(buildReview({ computedAt: "2026-10-04" })).toEqual({});
  });

  it("publica lastReviewed solo con reviewedAt", () => {
    const review = buildReview({ computedAt: "2026-10-04", reviewedAt: "2026-10-27" });
    expect(review.lastReviewed).toBe("2026-10-27T00:00:00.000Z");
    expect(review.reviewedBy).toBeUndefined();
  });

  it("incluye reviewedBy cuando existe la persona revisora", () => {
    const review = buildReview({ reviewedAt: "2026-10-27", reviewedBy: "Carlos Ortega" });
    expect(review.reviewedBy).toEqual({ "@type": "Person", name: "Carlos Ortega" });
  });

  it("ignora fechas inválidas en vez de publicar algo falso", () => {
    expect(buildReview({ reviewedAt: "no-fecha" })).toEqual({});
  });

  it("no publica nada sin reviewPolicy", () => {
    expect(buildReview(undefined)).toEqual({});
  });
});
