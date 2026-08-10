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

// ── Caracterización por clase de regla (plan 068) ───────────────────────────
// Cada clase de regla del gate con su severidad REAL (leída del script, no
// asumida): TITLE_RANGE y DESCRIPTION_RANGE son warnings (exit 0 con texto en
// stderr); las reglas bloqueantes son las que terminan en `errors` (exit 1).

const MINIMAL_POST = `---
title: "Caracterización del gate editorial"
description: "Descripción de prueba del gate editorial de frontmatter para los tests de caracterización."
slug: caracterizacion-gate-editorial
author: "Equipo Monedario"
pubDate: 2026-08-01T12:00:00Z
tags:
  - impuestos
category: impuestos
cluster: impuestos
lang: es-CL
---`;

function makeMinimalFixture(mutations: (fm: string) => string): string {
  const root = mkdtempSync(path.join(tmpdir(), "frontmatter-class-"));
  tempRoots.push(root);
  mkdirSync(path.join(root, "src", "data", "blog"), { recursive: true });
  mkdirSync(path.join(root, "src", "config"), { recursive: true });
  writeFileSync(
    path.join(root, "src", "config", "clusters.ts"),
    'export const CLUSTERS = ["impuestos"];\n',
    "utf8"
  );
  writeFileSync(
    path.join(root, "src", "data", "blog", "post.md"),
    `${mutations(MINIMAL_POST)}\n# Título\n\nCuerpo.\n`,
    "utf8"
  );
  return root;
}

describe("check-frontmatter rule classes (characterization)", () => {
  it("canary: a minimal valid post passes", () => {
    const result = run(makeMinimalFixture(fm => fm));
    expect(result.status).toBe(0);
  });

  it("deprecated fields are a blocking error (pubDatetime)", () => {
    const result = run(
      makeMinimalFixture(fm => fm.replace("pubDate:", "pubDatetime:"))
    );
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain('Deprecated field "pubDatetime"');
  });

  it("a category outside the allowlist is a blocking error", () => {
    const result = run(
      makeMinimalFixture(fm => fm.replace("category: impuestos", "category: cocina"))
    );
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain("must be one of");
  });

  it("a missing lang is a blocking error", () => {
    const result = run(makeMinimalFixture(fm => fm.replace("\nlang: es-CL", "")));
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain('Missing required field "lang"');
  });

  it("title range is a warning, not blocking (15 chars)", () => {
    const result = run(
      makeMinimalFixture(fm => fm.replace('title: "Caracterización del gate editorial"', 'title: "Título corto"'))
    );
    expect(result.status).toBe(0);
    expect(result.stdout + result.stderr).toContain("outside recommended range");
  });

  it("short description is a warning, not blocking", () => {
    const result = run(
      makeMinimalFixture(fm => fm.replace("Descripción de prueba del gate editorial de frontmatter para los tests de caracterización.", "Corta."))
    );
    expect(result.status).toBe(0);
    expect(result.stdout + result.stderr).toContain("outside recommended range");
  });
});
