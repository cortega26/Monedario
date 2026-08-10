import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

// check-frontmatter.mjs runs over the whole BLOG_DIR; FRONTMATTER_REPO_ROOT
// points it at a fixture tree (src/data/blog + src/config/clusters.ts) so the
// seoTitle rule can be tested in isolation. The fixture post is a verbatim
// copy of a real, passing post — any mutation below isolates the seoTitle rule.

const SCRIPT = path.resolve("scripts/check-frontmatter.mjs");
const REAL_BLOG_DIR = path.resolve("src/data/blog");
const tempRoots: string[] = [];

function firstRealPost(): string {
  const posts = readdirSync(REAL_BLOG_DIR).filter(file => file.endsWith(".md"));
  if (posts.length === 0) {
    throw new Error(`No blog posts found in ${REAL_BLOG_DIR}`);
  }
  return path.join(REAL_BLOG_DIR, posts[0]);
}

function makeFixture(seoTitle?: string): string {
  const root = mkdtempSync(path.join(tmpdir(), "frontmatter-"));
  tempRoots.push(root);
  mkdirSync(path.join(root, "src", "data", "blog"), { recursive: true });
  mkdirSync(path.join(root, "src", "config"), { recursive: true });

  const sourcePost = readFileSync(firstRealPost(), "utf8");
  const cluster = sourcePost.match(/^cluster:\s*([a-z0-9-]+)/m)?.[1] ?? "ahorro-e-inversion";
  writeFileSync(
    path.join(root, "src", "config", "clusters.ts"),
    `export const CLUSTERS = ["${cluster}"];\n`,
    "utf8"
  );

  const body = seoTitle
    ? sourcePost.replace(
        /^(title:)/m,
        `seoTitle: ${JSON.stringify(seoTitle)}\n$1`
      )
    : sourcePost;
  writeFileSync(path.join(root, "src", "data", "blog", "post.md"), body, "utf8");
  return root;
}

function run(root: string) {
  return spawnSync("node", [SCRIPT], {
    encoding: "utf8",
    env: { ...process.env, FRONTMATTER_REPO_ROOT: root },
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("check-frontmatter seoTitle rule", () => {
  it("rejects a seoTitle over the 65-char budget", () => {
    const root = makeFixture(
      "Consejos de inversión en Chile: guía completa para elegir entre varias opciones de ahorro"
    );
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain("max 65");
  });

  it("accepts a post without seoTitle", () => {
    const root = makeFixture();
    const result = run(root);
    expect(result.status).toBe(0);
  });

  it("accepts a seoTitle within the budget (63 chars, with the | Monedario brand suffix)", () => {
    const root = makeFixture(
      "Operación Renta: Checklist del Formulario 22 | Monedario"
    );
    const result = run(root);
    expect(result.status).toBe(0);
  });

  it("accepts the longest real seoTitle (61 chars)", () => {
    const root = makeFixture(
      "Descuentos de Sueldo en Chile: Cuáles Son Legales | Monedario"
    );
    const result = run(root);
    expect(result.status).toBe(0);
  });

  it("keeps the gate budget in sync with the content schema (both 65)", () => {
    const script = readFileSync(SCRIPT, "utf8");
    const schema = readFileSync(path.resolve("src/content.config.ts"), "utf8");
    const gateMax = Number(script.match(/SEO_TITLE_MAX = (\d+)/)?.[1]);
    const schemaMax = schema.match(/seoTitle: z\.string\(\)\.trim\(\)\.min\(1\)\.max\((\d+)\)/g)?.map(
      match => Number(match.match(/\.max\((\d+)\)/)?.[1])
    );
    expect(gateMax).toBe(65);
    expect(schemaMax).toEqual([65, 65]);
  });
});
