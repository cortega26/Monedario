import { describe, expect, it } from "vitest";
import { GET } from "@/pages/api/deploy-health.json";

describe("public deploy-health artifact", () => {
  it("exposes the published snapshot heartbeat without private data", async () => {
    const response = await GET({} as never);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");

    const body = (await response.json()) as Record<string, unknown>;
    expect(String(body.capturedAt)).toMatch(/^\d{4}-\d{2}-\d{2}T/u);
    expect(String(body.lastUpdated)).toMatch(/^\d{4}-\d{2}-\d{2}/u);
    expect(Number(body.uf)).toBeGreaterThan(0);
    expect(body).not.toHaveProperty("exceptions");
    expect(body).not.toHaveProperty("utm");
  });
});
