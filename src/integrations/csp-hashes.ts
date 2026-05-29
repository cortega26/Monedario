import type { AstroIntegration } from "astro";
import { readFileSync, writeFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

// Matches <script> tags that are executable (not data blocks like JSON-LD).
// Captures: [1] attributes string, [2] inline content.
const SCRIPT_RE = /<script([^>]*)>([\s\S]*?)<\/script>/gi;

// Types excluded from script-src enforcement.
const NON_EXEC_TYPES =
  /^(?:application\/(?!ecmascript|javascript)|text\/(?!javascript))/i;

function isExecutable(attrs: string): boolean {
  const m = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
  return !m || !NON_EXEC_TYPES.test(m[1]);
}

function sha256base64(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("base64");
}

async function collectHashes(distDir: string): Promise<Set<string>> {
  const hashes = new Set<string>();
  for await (const file of glob("**/*.html", { cwd: distDir })) {
    const html = readFileSync(join(distDir, file), "utf8");
    SCRIPT_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = SCRIPT_RE.exec(html)) !== null) {
      const [, attrs, content] = m;
      if (content.trim() && isExecutable(attrs)) {
        hashes.add(`'sha256-${sha256base64(content)}'`);
      }
    }
  }
  return hashes;
}

export function updateHeadersFile(
  headersPath: string,
  hashes: Set<string>
): void {
  const hashTokens = [...hashes].join(" ");
  let src = readFileSync(headersPath, "utf8");

  // Replace the script-src value: inject hashes and drop unsafe-inline.
  src = src.replace(/\bscript-src\s+([^;"\n]+)/g, (_, rest: string) => {
    const cleaned = rest
      .replace(/'unsafe-inline'\s*/g, "")
      .replace(/'strict-dynamic'\s*/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return `script-src ${hashTokens} ${cleaned}`;
  });

  writeFileSync(headersPath, src, "utf8");
}

export function cspHashesIntegration(): AstroIntegration {
  return {
    name: "csp-hashes",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const headersPath = join(distDir, "_headers");

        const hashes = await collectHashes(distDir);
        if (hashes.size === 0) {
          logger.warn(
            "csp-hashes: no inline scripts found — _headers unchanged"
          );
          return;
        }

        updateHeadersFile(headersPath, hashes);
        logger.info(
          `csp-hashes: injected ${hashes.size} sha256 hash(es) into script-src`
        );
      },
    },
  };
}
