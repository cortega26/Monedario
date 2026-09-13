import fs from "node:fs";
import path from "node:path";

import { JSON_SCHEMA, load } from "js-yaml";
import { describe, expect, it } from "vitest";

interface WorkflowStep {
  name?: string;
  run?: string;
  "continue-on-error"?: boolean | string;
}

interface WorkflowJob {
  steps?: WorkflowStep[];
  "continue-on-error"?: boolean | string;
}

interface WorkflowDocument {
  jobs?: Record<string, WorkflowJob>;
}

interface PackageDocument {
  scripts?: Record<string, string>;
}

// Rutas reales por defecto; anulables por env para verificar el poder de
// discriminación con una copia/fixture revertida, sin tocar el workflow real.
const REPO_ROOT = process.cwd();
const WORKFLOW_ENV_VAR = "CI_COVERAGE_CONTRACT_WORKFLOW_PATH";
const PACKAGE_JSON_ENV_VAR = "CI_COVERAGE_CONTRACT_PACKAGE_JSON_PATH";

export function resolveInputPath(envVar: string, fallback: string): string {
  const override = process.env[envVar];
  return override ? path.resolve(REPO_ROOT, override) : fallback;
}

export function loadWorkflow(sourcePath: string): WorkflowDocument {
  const source = fs.readFileSync(sourcePath, "utf8");
  return load(source, { schema: JSON_SCHEMA }) as WorkflowDocument;
}

export function loadPackageScripts(packageJsonPath: string): Record<string, string> {
  const parsed = JSON.parse(
    fs.readFileSync(packageJsonPath, "utf8"),
  ) as PackageDocument;
  return parsed.scripts ?? {};
}

export function findBlockingTestStep(workflow: WorkflowDocument): {
  job: WorkflowJob;
  step: WorkflowStep;
} {
  const job = workflow.jobs?.["lint-and-test"];
  expect(job, "blocking job lint-and-test must exist in ci.yml").toBeDefined();
  const step = job?.steps?.find(testStep => /run tests/iu.test(testStep.name ?? ""));
  expect(step, "blocking job must declare a Run tests step").toBeDefined();
  return { job: job as WorkflowJob, step: step as WorkflowStep };
}

export function resolveRunScriptName(step: WorkflowStep): string {
  const match = /^\s*pnpm run ([\w:@/.-]+)\s*$/u.exec(step.run ?? "");
  expect(
    step.run,
    "Run tests step must invoke exactly one pnpm script (no chaining)",
  ).toMatch(/^\s*pnpm run [\w:@/.-]+\s*$/u);
  return match?.[1] ?? "";
}

const workflowPath = resolveInputPath(
  WORKFLOW_ENV_VAR,
  path.join(REPO_ROOT, ".github", "workflows", "ci.yml"),
);
const packageJsonPath = resolveInputPath(
  PACKAGE_JSON_ENV_VAR,
  path.join(REPO_ROOT, "package.json"),
);

describe("ci coverage contract (ADR-20260906)", () => {
  it("runs the blocking test step through a script that activates coverage", () => {
    const { step } = findBlockingTestStep(loadWorkflow(workflowPath));
    const scripts = loadPackageScripts(packageJsonPath);
    const scriptName = resolveRunScriptName(step);
    const command = scripts[scriptName] ?? "";
    expect(command, `script ${scriptName} must activate coverage`).toContain(
      "--coverage",
    );
  });

  it("does not tolerate test failures in the blocking job or step", () => {
    const { job, step } = findBlockingTestStep(loadWorkflow(workflowPath));
    expect(job["continue-on-error"] ?? false).toBe(false);
    expect(step["continue-on-error"] ?? false).toBe(false);
    expect(step.run ?? "").not.toMatch(/\|\|\s*true/u);
    expect(JSON.stringify(job)).not.toContain("continue-on-error");
  });

  it("invokes coverage exactly once in check:ci without duplicating the plain suite", () => {
    const scripts = loadPackageScripts(packageJsonPath);
    const checkCi = scripts["check:ci"] ?? "";
    expect(checkCi, "check:ci script must exist").not.toBe("");
    const invocations = [...checkCi.matchAll(/pnpm run ([\w:@/.-]+)/gu)].map(
      match => match[1],
    );
    const coverageInvocations = invocations.filter(name =>
      (scripts[name] ?? "").includes("--coverage"),
    );
    const bareInvocations = invocations.filter(name => name === "test");
    expect(coverageInvocations).toEqual(["test:coverage"]);
    expect(bareInvocations).toEqual([]);
  });

  it("keeps test as the fast command without coverage", () => {
    const scripts = loadPackageScripts(packageJsonPath);
    expect(scripts["test"] ?? "").not.toBe("");
    expect(scripts["test"] ?? "").not.toContain("--coverage");
  });
});
