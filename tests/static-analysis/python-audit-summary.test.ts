/**
 * Python audit summary integrity — CLEAN / VULNERABILITIES / INCOMPLETE.
 *
 * Executes the real `run` blocks from `.github/workflows/security-scans.yml`
 * in temp dirs with Bash/jq (the same tools the job uses). Never invokes the
 * real pip-audit: the audit block runs against a `uv` stub on PATH.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { load } from "js-yaml";

const workflowPath = path.join(
  process.cwd(),
  ".github",
  "workflows",
  "security-scans.yml"
);

type AuditSteps = {
  auditRun: string;
  summaryRun: string;
  summaryEnv: Record<string, unknown>;
  auditUsesUvAudit: boolean;
  jobContinueOnError: unknown;
  jobIf: unknown;
};

function getAuditSteps(): AuditSteps {
  const raw = fs.readFileSync(workflowPath, "utf8");
  const doc = load(raw) as {
    jobs?: Record<string, { steps?: Array<Record<string, unknown>> } & Record<string, unknown>>;
  };
  const job = doc.jobs?.["python-audit"];
  if (!job) throw new Error("python-audit job not found");
  const steps = (job.steps ?? []) as Array<{
    id?: string;
    name?: string;
    run?: string;
    env?: Record<string, unknown>;
  }>;
  const audit = steps.find(s => s.id === "audit");
  const summary = steps.find(
    s => typeof s.name === "string" && s.name.includes("Publish Python audit")
  );
  if (!audit?.run) throw new Error("audit step run block not found");
  if (!summary?.run) throw new Error("summary step run block not found");
  return {
    auditRun: audit.run,
    summaryRun: summary.run,
    summaryEnv: (summary.env ?? {}) as Record<string, unknown>,
    auditUsesUvAudit: audit.run.includes("uv run pip-audit"),
    jobContinueOnError: (job as Record<string, unknown>)["continue-on-error"],
    jobIf: (job as Record<string, unknown>).if,
  };
}

function runAuditWithStub(stubExit: number): {
  githubOutput: string;
  reportExists: boolean;
} {
  const { auditRun } = getAuditSteps();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "py-audit-"));
  const stubDir = fs.mkdtempSync(path.join(os.tmpdir(), "py-uv-stub-"));
  try {
    fs.mkdirSync(path.join(dir, "output", "security"), { recursive: true });
    // Stale report from a previous run must not survive: the block removes it.
    fs.writeFileSync(
      path.join(dir, "output", "security", "python-audit.json"),
      "stale",
      "utf8"
    );
    fs.writeFileSync(
      path.join(stubDir, "uv"),
      `#!/bin/bash\nexit ${stubExit}\n`,
      { mode: 0o755 }
    );
    const githubOutput = path.join(dir, "github-output.txt");
    fs.writeFileSync(githubOutput, "", "utf8");
    execFileSync("/bin/bash", ["-c", auditRun], {
      cwd: dir,
      stdio: "pipe",
      env: {
        ...process.env,
        PATH: `${stubDir}:${process.env.PATH ?? ""}`,
        GITHUB_OUTPUT: githubOutput,
      },
    });
    return {
      githubOutput: fs.readFileSync(githubOutput, "utf8"),
      reportExists: fs.existsSync(
        path.join(dir, "output", "security", "python-audit.json")
      ),
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(stubDir, { recursive: true, force: true });
  }
}

function runSummary(options: {
  auditCode?: string;
  report?: string;
  absent?: boolean;
}): string {
  const { summaryRun } = getAuditSteps();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "py-summary-"));
  try {
    fs.mkdirSync(path.join(dir, "output", "security"), { recursive: true });
    if (!options.absent) {
      fs.writeFileSync(
        path.join(dir, "output", "security", "python-audit.json"),
        options.report ?? "",
        "utf8"
      );
    }
    const summaryFile = path.join(dir, "step-summary.md");
    fs.writeFileSync(summaryFile, "", "utf8");
    const env: Record<string, string | undefined> = {
      ...process.env,
      GITHUB_STEP_SUMMARY: summaryFile,
    };
    if (options.auditCode === undefined) {
      delete env.AUDIT_EXIT_CODE;
    } else {
      env.AUDIT_EXIT_CODE = options.auditCode;
    }
    execFileSync("/bin/bash", ["-c", summaryRun], {
      cwd: dir,
      stdio: "pipe",
      env: env as Record<string, string>,
    });
    return fs.readFileSync(summaryFile, "utf8");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const CLEAN_FIXTURE = JSON.stringify({
  dependencies: [
    { name: "alpha", version: "1.0", vulns: [] },
    { name: "beta", version: "2.0", vulns: [] },
  ],
  fixes: [],
});

const ONE_DEP_TWO_CVES = JSON.stringify({
  dependencies: [
    {
      name: "alpha",
      version: "1.0",
      vulns: [
        { id: "CVE-0001", fix_versions: ["1.1"], description: "first" },
        { id: "CVE-0002", fix_versions: ["1.1"], description: "second" },
      ],
    },
    { name: "beta", version: "2.0", vulns: [] },
  ],
  fixes: [],
});

const SKIP_ONLY = JSON.stringify({
  dependencies: [
    { name: "alpha", version: "1.0", vulns: [] },
    { name: "beta", skip_reason: "editable install, cannot audit" },
  ],
  fixes: [],
});

const VULN_PLUS_SKIP = JSON.stringify({
  dependencies: [
    { name: "alpha", version: "1.0", vulns: [{ id: "CVE-0001", fix_versions: [] }] },
    { name: "beta", skip_reason: "editable install" },
  ],
  fixes: [],
});

describe("python-audit workflow — exit code capture", () => {
  it("keeps the audit step wired to pip-audit JSON output", () => {
    const { auditRun, auditUsesUvAudit } = getAuditSteps();
    expect(auditUsesUvAudit).toBe(true);
    expect(auditRun).toContain("--format json");
    expect(auditRun).toContain("output/security/python-audit.json");
  });

  it("does not mask failures and removes only its own stale report", () => {
    const { auditRun } = getAuditSteps();
    expect(auditRun).toContain("audit_exit=0");
    expect(auditRun).toContain("|| audit_exit=$?");
    expect(auditRun).toContain('echo "audit_exit=${audit_exit}"');
    expect(auditRun).toContain("rm -f output/security/python-audit.json");
    expect(auditRun).not.toContain("|| true");
  });

  it.each([0, 1, 2])("propagates stub exit code %i intact to GITHUB_OUTPUT", code => {
    const { githubOutput, reportExists } = runAuditWithStub(code);
    expect(githubOutput).toContain(`audit_exit=${code}`);
    // The stub creates no report, so the stale file must be gone, never reused.
    expect(reportExists).toBe(false);
  });
});

describe("python-audit workflow — summary wiring", () => {
  it("passes the step output via env, not interpolation inside the shell", () => {
    const { summaryEnv, summaryRun } = getAuditSteps();
    expect(summaryEnv.AUDIT_EXIT_CODE).toBe(
      "${{ steps.audit.outputs.audit_exit }}"
    );
    expect(summaryRun).toContain("AUDIT_EXIT_CODE");
    expect(summaryRun).not.toContain("steps.audit.outputs");
  });

  it("preserves the weekly tolerant policy of the job", () => {
    const { jobContinueOnError, jobIf } = getAuditSteps();
    expect(jobContinueOnError).toBe(true);
    expect(String(jobIf)).toContain("schedule");
    expect(String(jobIf)).toContain("workflow_dispatch");
    const raw = fs.readFileSync(workflowPath, "utf8");
    expect(raw).toContain("contents: read");
    expect(raw).toContain("30 5 * * 3");
    expect(raw).toContain("artifact-name: python-audit-report");
  });
});

describe("python-audit summary — three states", () => {
  it("reports CLEAN with zero vulnerable packages for two healthy deps", () => {
    const summary = runSummary({ auditCode: "0", report: CLEAN_FIXTURE });
    expect(summary).toContain("- Status: CLEAN");
    expect(summary).toContain("- Vulnerable packages: 0");
    expect(summary).toContain("- Skipped dependencies: 0");
    expect(summary).toContain("No vulnerabilities found.");
  });

  it("counts packages, not CVEs: one dep with two CVEs is 1, not 2", () => {
    const summary = runSummary({ auditCode: "1", report: ONE_DEP_TWO_CVES });
    expect(summary).toContain("- Status: VULNERABILITIES");
    expect(summary).toContain("- Vulnerable packages: 1");
    expect(summary).not.toContain("- Vulnerable packages: 2");
  });

  it.each([
    ["absent report", { auditCode: "0", absent: true }],
    ["empty report", { auditCode: "0", report: "" }],
    ["broken JSON", { auditCode: "0", report: "{not json" }],
    ["shape without dependencies", { auditCode: "0", report: '{"fixes": []}' }],
    ["empty object", { auditCode: "0", report: "{}" }],
  ])("marks %s as INCOMPLETE, never clean", (_label, opts) => {
    const summary = runSummary(opts);
    expect(summary).toContain("- Status: INCOMPLETE");
    expect(summary).not.toContain("No vulnerabilities found.");
  });

  it("marks operational exit 2 with missing report as INCOMPLETE without cleanup text", () => {
    const summary = runSummary({ auditCode: "2", absent: true });
    expect(summary).toContain("- Status: INCOMPLETE");
    expect(summary).toContain("- Audit exit code: 2");
    expect(summary).not.toContain("No vulnerabilities found.");
    expect(summary).not.toContain("- Status: CLEAN");
  });

  it("marks a missing exit code (skipped audit step) as INCOMPLETE without cleanup text", () => {
    const summary = runSummary({ report: CLEAN_FIXTURE });
    expect(summary).toContain("- Status: INCOMPLETE");
    expect(summary).toContain("- Audit exit code: missing");
    expect(summary).not.toContain("No vulnerabilities found.");
    expect(summary).not.toContain("- Status: CLEAN");
  });

  it.each([
    ["exit 0 contradicts findings", "0", ONE_DEP_TWO_CVES],
    ["exit 1 contradicts a clean report", "1", CLEAN_FIXTURE],
  ])("marks inconsistency as INCOMPLETE: %s", (_label, code, report) => {
    const summary = runSummary({ auditCode: code, report });
    expect(summary).toContain("- Status: INCOMPLETE");
    expect(summary).not.toContain("No vulnerabilities found.");
    expect(summary).not.toContain("- Status: CLEAN");
  });

  it("treats skip_reason as an explicit partial audit, never total cleanup", () => {
    const summary = runSummary({ auditCode: "0", report: SKIP_ONLY });
    expect(summary).toContain("- Status: INCOMPLETE");
    expect(summary).toContain("- Skipped dependencies: 1");
    expect(summary).not.toContain("No vulnerabilities found.");
    expect(summary).not.toContain("- Status: CLEAN");
  });

  it("shows both findings and skips without hiding vulnerabilities", () => {
    const summary = runSummary({ auditCode: "1", report: VULN_PLUS_SKIP });
    expect(summary).toContain("- Status: VULNERABILITIES");
    expect(summary).toContain("- Vulnerable packages: 1");
    expect(summary).toContain("- Skipped dependencies: 1");
    expect(summary).toContain("Expand CVE details");
  });

  it("discriminates the old bug: root keys counted 2, new logic counts 0", () => {
    const countOld = JSON.parse(
      execFileSync(
        "/bin/bash",
        ["-c", `printf '%s' '${CLEAN_FIXTURE}' | jq 'length'`],
        { encoding: "utf8" }
      ) as unknown as string
    );
    expect(countOld).toBe(2);
    const summary = runSummary({ auditCode: "0", report: CLEAN_FIXTURE });
    expect(summary).toContain("- Vulnerable packages: 0");
    const missing = runSummary({ auditCode: "0", absent: true });
    expect(missing).toContain("- Status: INCOMPLETE");
    expect(missing).not.toContain("No vulnerabilities found.");
  });
});
