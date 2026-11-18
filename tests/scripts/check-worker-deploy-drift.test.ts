import { describe, expect, it } from "vitest";
import {
  evaluateDeployDrift,
  TOLERANCE_HOURS,
} from "../../scripts/check-worker-deploy-drift.mjs";

const deploy = (createdOn: string, triggeredBy = "deployment") => ({
  created_on: createdOn,
  annotations: { "workers/triggered_by": triggeredBy },
});

describe("worker deploy drift", () => {
  it("passes when the last commit is older than the last code deploy", () => {
    expect(
      evaluateDeployDrift({
        deployments: [deploy("2026-11-18T19:23:15.000Z")],
        lastCommitAt: "2026-11-18T19:10:00.000Z",
      })
    ).toEqual([]);
  });

  it("flags a merged commit that was never deployed", () => {
    const problems = evaluateDeployDrift({
      deployments: [deploy("2026-08-11T18:03:31.000Z")],
      lastCommitAt: "2026-09-14T21:38:25.000Z",
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("cambios sin desplegar");
    expect(problems[0]).toContain("worker:economic-snapshot:deploy");
  });

  it("does not count a secret change as a code deploy", () => {
    // 2026-11-18 19:23:48 fue un cambio de secreto: el código desplegado seguía
    // siendo el de agosto. Ese es exactamente el agujero que este chequeo cierra.
    const problems = evaluateDeployDrift({
      deployments: [
        deploy("2026-08-11T18:03:31.000Z"),
        deploy("2026-11-18T19:23:48.000Z", "secret"),
      ],
      lastCommitAt: "2026-09-14T21:38:25.000Z",
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("2026-08-11");
  });

  it("tolerates a deploy that is still inside the window", () => {
    expect(
      evaluateDeployDrift({
        deployments: [deploy("2026-11-18T19:23:15.000Z")],
        lastCommitAt: "2026-11-19T06:00:00.000Z",
        toleranceHours: TOLERANCE_HOURS,
      })
    ).toEqual([]);
  });

  it("reports a missing code deploy instead of passing silently", () => {
    const problems = evaluateDeployDrift({
      deployments: [deploy("2026-11-18T19:23:48.000Z", "secret")],
      lastCommitAt: "2026-09-14T21:38:25.000Z",
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("no se puede verificar el drift");
  });

  it("reports an unreadable last commit", () => {
    const problems = evaluateDeployDrift({
      deployments: [deploy("2026-11-18T19:23:15.000Z")],
      lastCommitAt: null,
    });
    expect(problems).toHaveLength(1);
  });
});
