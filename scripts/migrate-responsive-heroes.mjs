#!/usr/bin/env node
/**
 * migrate-responsive-heroes.mjs — One-off migration: generate responsive variants
 * from existing desktop AVIF hero images.
 *
 * The png-to-avif.mjs pipeline now outputs 3 variants per source PNG
 * (@desktop, @tablet, @mobile). Existing heroes are single .avif files at
 * full resolution. This script generates the @tablet and @mobile variants
 * from the existing @desktop AVIFs.
 *
 * Usage:
 *   node scripts/migrate-responsive-heroes.mjs
 */

import { readdir, stat } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const HERO_DIR = join(PROJECT_ROOT, "public", "images", "hero");

const VARIANTS = [
  { suffix: "@tablet", width: 800, height: 420 },
  { suffix: "@mobile", width: 600, height: 315 },
];

async function main() {
  let sharp;
  try {
    const mod = await import("sharp");
    sharp = mod.default;
  } catch {
    console.error("\n  ✗ 'sharp' not found. Run: pnpm install\n");
    process.exit(1);
  }

  const entries = await readdir(HERO_DIR);
  const avifFiles = entries.filter(
    f => extname(f).toLowerCase() === ".avif" && !f.includes("@")
  );

  if (avifFiles.length === 0) {
    console.log("  No single-resolution AVIF files found. Already migrated?");
    process.exit(0);
  }

  console.log(`\n  Generating responsive variants from ${avifFiles.length} heroes\n`);

  let created = 0;
  let errors = 0;

  for (const file of avifFiles) {
    const srcPath = join(HERO_DIR, file);
    const base = basename(file, ".avif");
    const originalSize = (await stat(srcPath)).size;

    for (const v of VARIANTS) {
      const outPath = join(HERO_DIR, `${base}${v.suffix}.avif`);
      process.stdout.write(`  ${file} → ${basename(outPath)} ... `);

      try {
        await sharp(srcPath)
          .resize({ width: v.width, height: v.height, fit: "cover", position: "centre" })
          .avif({ quality: 64, effort: 2 })
          .toFile(outPath);

        const outSize = (await stat(outPath)).size;
        const pct = ((1 - outSize / originalSize) * 100).toFixed(1);
        process.stdout.write(`${formatBytes(outSize)} (${pct}% smaller)\n`);
        created++;
      } catch (err) {
        process.stdout.write(`ERROR: ${err.message}\n`);
        errors++;
      }
    }
  }

  console.log(`\n  ──────────────────────────────────────────`);
  console.log(`  Created: ${created} | Errors: ${errors}\n`);
  if (errors > 0) process.exit(1);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

main().catch(err => {
  console.error(`\n  Error: ${err.message}\n`);
  process.exit(1);
});
