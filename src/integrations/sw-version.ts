import type { AstroIntegration } from "astro";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const PLACEHOLDER = "__SW_CACHE_VERSION__";

function buildVersion(): string {
  return process.env.GITHUB_SHA?.slice(0, 7) ?? Date.now().toString(36);
}

export function swVersionIntegration(): AstroIntegration {
  return {
    name: "sw-version",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const swPath = join(fileURLToPath(dir), "sw.js");
        if (!existsSync(swPath)) {
          logger.warn("sw-version: dist/sw.js not found — skipping");
          return;
        }
        const version = buildVersion();
        const src = readFileSync(swPath, "utf8");
        const updated = src.replaceAll(PLACEHOLDER, version);
        writeFileSync(swPath, updated, "utf8");
        logger.info(`sw-version: cache stamped with version "${version}"`);
      },
    },
  };
}
