import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const POLICY_PATH = path.resolve("src/config/editorial-timeliness-policy.json");
const REGISTRY_PATH = path.resolve(
  "src/config/editorial-volatile-data-registry.json"
);

const REQUIRED_HARD_FACTS = [
  "tax.iusc.tramos_utm",
  "economic.uf.value",
  "superir.art260.obligaciones_diversas",
  "dap.retention.non_resident_4pct",
  "honorarios.boleta.retencion_rate",
  "finiquito.topes_y_recargos",
];

type Policy = {
  semantics?: {
    notVerification?: boolean;
    staleMeans?: string;
    statement?: string;
    veracitySignals?: string[];
  };
  hardFacts?: Record<
    string,
    {
      label?: string;
      owner?: string;
      verification?: string;
      cadenceDays?: number;
      dataset?: string;
      auditRounds?: string[];
    }
  >;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

describe("timeliness veracity contract (TD-0107)", () => {
  it("declares that stale=0 is cadence compliance, not verification", () => {
    const policy = readJson<Policy>(POLICY_PATH);

    expect(policy.semantics?.notVerification).toBe(true);
    expect(policy.semantics?.staleMeans?.trim()).not.toBe("");
    expect(policy.semantics?.statement).toContain("no certifica veracidad");
    expect(policy.semantics?.veracitySignals?.length).toBeGreaterThan(0);
    expect(
      policy.semantics?.veracitySignals?.some(signal => signal.includes("auditoría"))
    ).toBe(true);
  });

  it("covers every repeated hard fact with owner and verification", () => {
    const policy = readJson<Policy>(POLICY_PATH);

    for (const id of REQUIRED_HARD_FACTS) {
      const fact = policy.hardFacts?.[id];
      expect(fact, `hardFacts.${id} must exist`).toBeDefined();
      expect(fact?.label?.trim()).not.toBe("");
      expect(fact?.owner?.trim()).not.toBe("");
      expect(fact?.verification?.trim()).not.toBe("");
      const hasAnchor =
        (fact?.cadenceDays ?? 0) > 0 ||
        (fact?.dataset?.trim() ?? "") !== "" ||
        (fact?.auditRounds?.length ?? 0) > 0;
      expect(hasAnchor, `hardFacts.${id} needs cadence, dataset or auditRounds`).toBe(
        true
      );
    }
  });

  it("registers an owner for every volatile dataset", () => {
    const registry = readJson<{
      datasets?: Record<string, { owner?: string }>;
    }>(REGISTRY_PATH);
    const datasets = Object.entries(registry.datasets ?? {});

    expect(datasets.length).toBeGreaterThan(0);
    for (const [id, dataset] of datasets) {
      expect(dataset.owner?.trim(), `dataset ${id} must declare an owner`).not.toBe(
        ""
      );
    }
  });

  it("points every hardFacts dataset reference at a registered dataset", () => {
    const policy = readJson<Policy>(POLICY_PATH);
    const registry = readJson<{ datasets?: Record<string, unknown> }>(
      REGISTRY_PATH
    );

    for (const [id, fact] of Object.entries(policy.hardFacts ?? {})) {
      if (!fact.dataset) continue;
      expect(
        registry.datasets?.[fact.dataset],
        `hardFacts.${id} dataset ${fact.dataset} must exist in the registry`
      ).toBeDefined();
    }
  });
});
