#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

function parseEnvFile(filePath) {
  const entries = new Map();
  const content = readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);

    if (key) {
      entries.set(key, value);
    }
  }

  return entries;
}

function loadLocalEnv(repoRoot) {
  const merged = new Map();
  const candidates = [
    path.join(repoRoot, ".env"),
    path.join(repoRoot, ".env.local"),
  ];

  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      continue;
    }

    for (const [key, value] of parseEnvFile(candidate)) {
      merged.set(key, value);
    }
  }

  return merged;
}

function printUsage(code = 0) {
  console.error(
    "Usage: node scripts/data-signals/run-with-local-env.mjs <script> [args...]"
  );
  process.exit(code);
}

async function main() {
  const [targetScript, ...rawArgs] = process.argv.slice(2);
  const args = rawArgs[0] === "--" ? rawArgs.slice(1) : rawArgs;

  if (!targetScript || targetScript === "--help" || targetScript === "-h") {
    printUsage(targetScript ? 0 : 1);
  }

  const repoRoot = process.cwd();
  const env = { ...process.env };

  for (const [key, value] of loadLocalEnv(repoRoot)) {
    if (!env[key]) {
      env[key] = value;
    }
  }

  const child = spawn(process.execPath, [path.resolve(repoRoot, targetScript), ...args], {
    env,
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});