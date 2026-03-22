import { readFileSync, rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import path from "node:path";

const snapshotPath = path.resolve(
  "src/infrastructure/editorial/editorial-volatile-data.snapshot.json"
);
const backupPath = `${snapshotPath}.bak-test`;

afterAll(() => {
  rmSync(backupPath, { force: true });
});

describe("editorial volatile snapshot contract", () => {
  it("contains the expected datasets and review trigger dates", () => {
    const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as {
      lastUpdated: string;
      datasets: Record<string, { value: number; reviewTriggerDate: string }>;
    };

    expect(snapshot.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(snapshot.datasets["economic.uf.value"].value).toBeTypeOf("number");
    expect(snapshot.datasets["pensions.afp.uno_commission"].value).toBe(0.46);
    expect(
      snapshot.datasets["pensions.afp.uno_commission"].reviewTriggerDate
    ).toBe("2025-10-01");
    expect(
      snapshot.datasets["pensions.afp.worker_mandatory_contribution"].value
    ).toBe(10);
  });
});
