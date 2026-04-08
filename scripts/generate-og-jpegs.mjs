#!/usr/bin/env node
/**
 * generate-og-jpegs.mjs — Genera versiones JPEG de hero images para og:image
 *
 * Los crawlers de LinkedIn y otras redes sociales no admiten AVIF/WebP como
 * formato de og:image. Este script convierte todas las imágenes AVIF/WebP de
 * /public/images/hero/ a JPEG 1200×630 en /public/images/og/, que es el
 * tamaño estándar para Open Graph.
 *
 * El script es idempotente: omite archivos cuyo JPEG ya existe y está
 * actualizado respecto al AVIF fuente.
 *
 * Uso:
 *   node scripts/generate-og-jpegs.mjs           # convierte imágenes nuevas o desactualizadas
 *   node scripts/generate-og-jpegs.mjs --force   # reconvierte todos los archivos
 *   node scripts/generate-og-jpegs.mjs --dry-run # muestra qué haría sin ejecutar
 */

import { readdir, mkdir, stat } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import sharp from "sharp";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const HERO_DIR = join(PROJECT_ROOT, "public", "images", "hero");
const OG_DIR = join(PROJECT_ROOT, "public", "images", "og");

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_QUALITY = 85;

const { values: args } = parseArgs({
  options: {
    force: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
  },
  strict: false,
});

const force = args["force"];
const dryRun = args["dry-run"];

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isOutdated(srcPath, destPath) {
  try {
    const [src, dest] = await Promise.all([stat(srcPath), stat(destPath)]);
    return src.mtimeMs > dest.mtimeMs;
  } catch {
    return true;
  }
}

async function main() {
  if (!dryRun) {
    await mkdir(OG_DIR, { recursive: true });
  }

  let files;
  try {
    files = await readdir(HERO_DIR);
  } catch {
    console.error(`[generate-og-jpegs] Hero directory not found: ${HERO_DIR}`);
    process.exit(1);
  }

  const candidates = files.filter(f => /\.(avif|webp)$/i.test(f));

  if (candidates.length === 0) {
    console.log("[generate-og-jpegs] No AVIF/WebP hero images found.");
    return;
  }

  let converted = 0;
  let skipped = 0;
  const errors = [];

  for (const file of candidates) {
    const slug = basename(file, extname(file));
    const srcPath = join(HERO_DIR, file);
    const destPath = join(OG_DIR, `${slug}.jpg`);

    if (!force && (await fileExists(destPath)) && !(await isOutdated(srcPath, destPath))) {
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`  [dry-run] ${file} → ${slug}.jpg`);
      converted++;
      continue;
    }

    try {
      await sharp(srcPath)
        .resize(OG_WIDTH, OG_HEIGHT, {
          fit: "cover",
          position: "attention",
          withoutEnlargement: false,
        })
        .jpeg({ quality: OG_QUALITY, mozjpeg: true })
        .toFile(destPath);

      console.log(`  ✓ ${file} → ${slug}.jpg`);
      converted++;
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      errors.push(file);
    }
  }

  const qualifier = dryRun ? " (dry-run)" : "";
  console.log(
    `[generate-og-jpegs] ${converted} converted, ${skipped} up-to-date${errors.length ? `, ${errors.length} errors` : ""}${qualifier}.`
  );

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("[generate-og-jpegs] Fatal:", err.message);
  process.exit(1);
});
