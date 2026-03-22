#!/usr/bin/env node
/**
 * png-to-avif.mjs — Conversión por lotes de PNG → AVIF para Monedario
 *
 * Uso:
 *   node scripts/png-to-avif.mjs                        # convierte public/images/**\\/*.png
 *   node scripts/png-to-avif.mjs --dir public/images/hero
 *   node scripts/png-to-avif.mjs --file public/images/hero/mi-imagen.png
 *   node scripts/png-to-avif.mjs --quality 55 --effort 9
 *   node scripts/png-to-avif.mjs --keep-original        # no borra los PNG
 *   node scripts/png-to-avif.mjs --dry-run              # muestra qué haría sin hacerlo
 *
 * Dependencia: sharp (ya en package.json de Monedario)
 */

import { readdir, stat, unlink } from "node:fs/promises";
import { extname, join, relative, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

// ─── Configuración por defecto ────────────────────────────────────────────────

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const DEFAULT_DIR = join(PROJECT_ROOT, "public", "images");

const DEFAULTS = {
  quality: 64,      // 0–100. 50–60 = equilibrio tamaño/visual para hero images web
  effort: 2,        // 0–9. Benchmark en imágenes reales muestra que effort 2 = mismo
                    // tamaño que effort 7–9, pero hasta 16× más rápido. No subir de 2.
  chromaSubsampling: "4:2:0", // Reduce canal de color: más compresión, imperceptible en fotos
  keepOriginal: false,
  dryRun: false,
};

// ─── Args ─────────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    dir:             { type: "string" },
    file:            { type: "string" },
    quality:         { type: "string" },
    effort:          { type: "string" },
    "keep-original": { type: "boolean", default: false },
    "dry-run":       { type: "boolean", default: false },
    help:            { type: "boolean", default: false },
  },
  strict: false,
});

if (args.help) {
  console.log(`
  png-to-avif.mjs — Convierte PNG → AVIF con alta compresión

  Opciones:
    --dir <ruta>       Directorio a procesar (recursivo). Default: public/images
    --file <ruta>      Archivo PNG individual
    --quality <n>      Calidad AVIF 0–100. Default: ${DEFAULTS.quality}
    --effort <n>       Esfuerzo de compresión 0–9. Default: ${DEFAULTS.effort}
    --keep-original    No elimina los PNG originales
    --dry-run          Muestra qué se convertiría sin hacerlo
    --help             Esta ayuda
  `);
  process.exit(0);
}

const CONFIG = {
  quality: args.quality ? parseInt(args.quality, 10) : DEFAULTS.quality,
  effort: args.effort ? parseInt(args.effort, 10) : DEFAULTS.effort,
  chromaSubsampling: DEFAULTS.chromaSubsampling,
  keepOriginal: args["keep-original"] ?? DEFAULTS.keepOriginal,
  dryRun: args["dry-run"] ?? DEFAULTS.dryRun,
};

// ─── Utilidades ───────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pct(original, converted) {
  const reduction = ((original - converted) / original) * 100;
  const sign = reduction >= 0 ? "-" : "+";
  return `${sign}${Math.abs(reduction).toFixed(1)}%`;
}

async function collectPngs(dirPath) {
  const results = [];
  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectPngs(full)));
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".png") {
      results.push(full);
    }
  }
  return results;
}

// ─── Conversión ───────────────────────────────────────────────────────────────

async function convertFile(pngPath, sharp) {
  const avifPath = join(dirname(pngPath), `${basename(pngPath, ".png")}.avif`);
  const relPath = relative(PROJECT_ROOT, pngPath);

  const originalSize = (await stat(pngPath)).size;

  if (CONFIG.dryRun) {
    console.log(`  [dry-run] ${relPath} → ${basename(avifPath)}`);
    return { skipped: false, dryRun: true, originalSize };
  }

  await sharp(pngPath)
    .avif({
      quality: CONFIG.quality,
      effort: CONFIG.effort,
      chromaSubsampling: CONFIG.chromaSubsampling,
    })
    .toFile(avifPath);

  const convertedSize = (await stat(avifPath)).size;

  if (!CONFIG.keepOriginal) {
    await unlink(pngPath);
  }

  return { skipped: false, dryRun: false, originalSize, convertedSize, avifPath };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Importar sharp dinámicamente (está en node_modules del proyecto)
  let sharp;
  try {
    const mod = await import("sharp");
    sharp = mod.default;
  } catch {
    console.error(
      "\n  ✗ No se encontró 'sharp'. Ejecuta: pnpm install\n"
    );
    process.exit(1);
  }

  // Recopilar archivos
  let files = [];
  if (args.file) {
    if (extname(args.file).toLowerCase() !== ".png") {
      console.error("  ✗ El archivo debe ser un .png");
      process.exit(1);
    }
    files = [args.file];
  } else {
    const targetDir = args.dir ?? DEFAULT_DIR;
    try {
      await stat(targetDir);
    } catch {
      console.error(`  ✗ Directorio no encontrado: ${targetDir}`);
      process.exit(1);
    }
    files = await collectPngs(targetDir);
  }

  if (files.length === 0) {
    console.log("  No se encontraron archivos PNG en la ruta indicada.");
    process.exit(0);
  }

  // Header
  const mode = CONFIG.dryRun ? " [DRY RUN]" : "";
  console.log(`\n  PNG → AVIF${mode}`);
  console.log(`  Calidad: ${CONFIG.quality} | Effort: ${CONFIG.effort} | Chroma: ${CONFIG.chromaSubsampling}`);
  console.log(`  Mantener originales: ${CONFIG.keepOriginal ? "sí" : "no"}`);
  console.log(`  Archivos encontrados: ${files.length}\n`);

  // Procesar
  let totalOriginal = 0;
  let totalConverted = 0;
  let errors = 0;
  const startTime = Date.now();

  for (const [i, file] of files.entries()) {
    const relPath = relative(PROJECT_ROOT, file);
    const n = String(i + 1).padStart(String(files.length).length, " ");
    process.stdout.write(`  [${n}/${files.length}] ${relPath} ... `);

    try {
      const result = await convertFile(file, sharp);

      if (result.dryRun) {
        process.stdout.write("ok\n");
      } else {
        totalOriginal += result.originalSize;
        totalConverted += result.convertedSize;
        const reduction = pct(result.originalSize, result.convertedSize);
        process.stdout.write(
          `${formatBytes(result.originalSize)} → ${formatBytes(result.convertedSize)} (${reduction})\n`
        );
      }
    } catch (err) {
      process.stdout.write(`ERROR\n`);
      console.error(`      ${err.message}`);
      errors++;
    }
  }

  // Resumen
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const success = files.length - errors;

  console.log(`\n  ──────────────────────────────────────────`);
  if (!CONFIG.dryRun && totalOriginal > 0) {
    console.log(`  Total original:   ${formatBytes(totalOriginal)}`);
    console.log(`  Total convertido: ${formatBytes(totalConverted)}`);
    console.log(`  Ahorro total:     ${formatBytes(totalOriginal - totalConverted)} (${pct(totalOriginal, totalConverted)})`);
  }
  console.log(`  Convertidos: ${success}/${files.length} | Errores: ${errors} | Tiempo: ${elapsed}s\n`);

  if (errors > 0) process.exit(1);
}

main().catch(err => {
  console.error(`\n  Error fatal: ${err.message}\n`);
  process.exit(1);
});
