/**
 * E2E tests del workflow de despliegue del worker analytics-collector.
 *
 * Verifica que el despliegue sea confiable (manual, mínimo, serializado,
 * auditable) y que ningún gate de seguridad se debilite: triggers solo
 * manuales, acciones pinnadas a SHAs, config explícita, dry-run antes de
 * desplegar, y ningún secreto interpolado en URLs.
 *
 * Ver docs/adr/ADR-20260716-analytics-worker-deployment-parity.md.
 */
import fs from "node:fs";
import path from "node:path";

import { JSON_SCHEMA, load } from "js-yaml";
import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = path.join(
  process.cwd(),
  ".github",
  "workflows",
  "deploy-analytics-collector.yml",
);
const source = fs.readFileSync(WORKFLOW_PATH, "utf8");
const packageJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
) as { devDependencies?: Record<string, string> };
const pnpmLock = fs.readFileSync(path.join(process.cwd(), "pnpm-lock.yaml"), "utf8");
const workflow = load(source, { schema: JSON_SCHEMA }) as {
  on: Record<string, unknown>;
  permissions: Record<string, string>;
  concurrency: { group: string; "cancel-in-progress": boolean };
  jobs: Record<
    string,
    {
      "runs-on": string;
      "timeout-minutes": number;
      permissions?: Record<string, string>;
      steps: Array<{ name?: string; uses?: string; run?: string; if?: string }>;
    }
  >;
};

function jobSteps(jobName: string) {
  return workflow.jobs[jobName]?.steps ?? [];
}

describe("deploy-analytics-collector workflow — deployment parity", () => {
  it("es desplegable manualmente y solo manualmente (sin PR, push ni schedule)", () => {
    expect(Object.keys(workflow.on).sort()).toEqual(["workflow_dispatch"]);
    expect(source).not.toMatch(/^\s*pull_request:/m);
    expect(source).not.toMatch(/^\s*push:/m);
    expect(source).not.toMatch(/^\s*schedule:/m);
    expect(source).not.toContain("github.event.pull_request");
  });

  it("usa permisos mínimos (contents: read)", () => {
    expect(workflow.permissions).toEqual({ contents: "read" });
  });

  it("serializa los despliegues con concurrency y sin cancelar el anterior", () => {
    expect(workflow.concurrency.group).toBe("deploy-analytics-collector");
    expect(workflow.concurrency["cancel-in-progress"]).toBe(false);
  });

  it("corre en ubuntu-latest con timeout acotado (runner self-hosted retirado)", () => {
    const deploy = workflow.jobs["deploy"];
    expect(deploy["runs-on"]).toBe("ubuntu-latest");
    // 30 min: pasos de deploy (~5 min) + ventana completa del verifier
    // (hasta 15 min de polling de propagación del cron) con holgura. Un tope
    // menor cortaría el job antes de agotar la ventana de propagación.
    expect(deploy["timeout-minutes"]).toBeLessThanOrEqual(30);
    expect(source).not.toContain("ACTIONS_RUNNER_LABEL");
  });

  it("pinea toda action de terceros a un SHA inmutable", () => {
    const usesLines = source
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("uses:"))
      .map((line) => line.replace(/^uses:\s*/, ""));

    expect(usesLines.length).toBeGreaterThan(0);

    for (const uses of usesLines) {
      if (uses.startsWith("./")) {
        continue; // actions locales del repo, no pinnables
      }
      // Formato: owner/repo@<sha40> [# vX.Y.Z]
      const match = /^[\w.-]+\/[\w.-]+@([0-9a-f]{40})(?:\s+#\s+v[\d.]+)?$/.exec(uses);
      expect(
        match,
        `la action "${uses}" debe usar un SHA inmutable de 40 caracteres`,
      ).not.toBeNull();
    }
  });

  it("pinea Wrangler a una versión exacta que pasó la API real", () => {
    const version = packageJson.devDependencies?.wrangler ?? "";
    expect(version).toBe("4.138.0");

    expect(pnpmLock).toContain(`specifier: ${version}`);
    expect(pnpmLock).toContain(`version: ${version}(`);
  });

  it("usa la config explícita del worker en dry-run y deploy", () => {
    const runCommands = jobSteps("deploy")
      .map((step) => step.run ?? "")
      .join("\n");

    expect(runCommands).toContain(
      "wrangler deploy --dry-run --config workers/analytics-collector/wrangler.toml",
    );
    expect(runCommands).toContain(
      "wrangler deploy --config workers/analytics-collector/wrangler.toml",
    );
  });

  it("ejecuta el dry-run de wrangler antes del deploy", () => {
    const steps = jobSteps("deploy");
    const dryRunIndex = steps.findIndex(
      (step) => step.name === "🧪 Wrangler dry run (antes de desplegar)",
    );
    const deployIndex = steps.findIndex((step) => step.name === "🚀 Desplegar worker");

    expect(dryRunIndex).toBeGreaterThan(-1);
    expect(deployIndex).toBeGreaterThan(dryRunIndex);
  });

  it("corre los tests enfocados del worker antes de desplegar", () => {
    const steps = jobSteps("deploy");
    const testsIndex = steps.findIndex(
      (step) => step.name === "🧪 Tests enfocados del worker",
    );
    const deployIndex = steps.findIndex((step) => step.name === "🚀 Desplegar worker");

    expect(testsIndex).toBeGreaterThan(-1);
    expect(deployIndex).toBeGreaterThan(testsIndex);
  });

  it("nunca interpola secretos dentro de una URL", () => {
    const urlLines = source
      .split("\n")
      .filter((line) => /https?:\/\//.test(line));

    for (const line of urlLines) {
      expect(
        line,
        `la línea con URL no debe interpolar secretos: ${line.trim()}`,
      ).not.toMatch(/\$\{\{\s*secrets\./);
    }

    // El workflow tampoco invoca curl con secretos en la línea de comando.
    for (const line of source.split("\n")) {
      if (line.includes("curl") || line.includes("wget")) {
        expect(
          line,
          `el comando de red no debe llevar secretos: ${line.trim()}`,
        ).not.toMatch(/secrets\./);
      }
    }
  });

  it("verifica la paridad post-deploy con el verifier y el cron exacto", () => {
    const steps = jobSteps("deploy");
    const verifySteps = steps.filter((step) =>
      step.run?.includes("verify-analytics-worker-deployment.mjs"),
    );

    expect(verifySteps.length).toBeGreaterThanOrEqual(2);
    for (const step of verifySteps) {
      expect(step.run).toContain("--week=");
      expect(step.run).toContain("--deployed-not-before=");
    }

    // El smoke autenticado solo corre con EXPORT_SECRET configurado.
    const fullVerify = verifySteps.find((step) => step.run?.includes("--smoke-export"));
    expect(fullVerify?.if).toBe("env.EXPORT_SECRET != ''");
    const readOnly = verifySteps.find((step) => !step.run?.includes("--smoke-export"));
    expect(readOnly?.if).toBe("env.EXPORT_SECRET == ''");
  });

  it("documenta el cron exacto 30 5 * * MON en el workflow", () => {
    // El verifier exige el cron exacto; el workflow debe declararlo para que el
    // desfase schedule-vs-fuente-de-verdad sea visible en la revisión.
    expect(source).toContain("30 5 * * MON");
  });
});
