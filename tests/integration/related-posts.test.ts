import { describe, expect, it } from "vitest";

import { scoreRelatedPostCandidate } from "@/utils/relatedPosts";

describe("related post scoring", () => {
  const current = {
    tags: ["AFP", "Sueldo"],
    cluster: "sueldo-remuneraciones",
    canonicalTopic: "calcular-sueldo-liquido",
  };

  it("prioritizes same canonical topic over cluster and tag matches", () => {
    const sameTopic = scoreRelatedPostCandidate(current, {
      tags: [],
      cluster: "deuda-credito",
      canonicalTopic: "calcular-sueldo-liquido",
    });
    const sameCluster = scoreRelatedPostCandidate(current, {
      tags: ["AFP", "Sueldo"],
      cluster: "sueldo-remuneraciones",
      canonicalTopic: "descuento-afp-trabajador",
    });

    expect(sameTopic).toBeGreaterThan(sameCluster);
  });

  it("prioritizes same cluster over tag-only matches", () => {
    const sameCluster = scoreRelatedPostCandidate(current, {
      tags: [],
      cluster: "sueldo-remuneraciones",
      canonicalTopic: "liquidacion-sueldo",
    });
    const tagOnly = scoreRelatedPostCandidate(current, {
      tags: ["AFP", "Sueldo"],
      cluster: "pensiones-afp",
      canonicalTopic: "descuento-afp-trabajador",
    });

    expect(sameCluster).toBeGreaterThan(tagOnly);
  });

  it("keeps shared tags as a positive secondary signal", () => {
    const tagged = scoreRelatedPostCandidate(current, {
      tags: ["AFP"],
      cluster: "pensiones-afp",
      canonicalTopic: "cambio-afp",
    });
    const unrelated = scoreRelatedPostCandidate(current, {
      tags: ["DICOM"],
      cluster: "deuda-credito",
      canonicalTopic: "informe-deudas",
    });

    expect(tagged).toBeGreaterThan(unrelated);
  });
});
