#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import {
  BLOG_DIR,
  PUBLISHED_HERO_MAX_BYTES,
  isPublishable,
  listArticleFiles,
  normalizeSlug,
  parseArgs,
  parseFrontmatter,
  readArticleFile,
  resolveHeroImageFile,
  splitFrontmatter,
  toRepoRelative,
} from "./hero-images/lib.mjs";
import sharp from "sharp";

const ALLOWED_EXTENSIONS = new Set([".avif", ".webp"]);
const HERO_DIMENSIONS = {
  base: { width: 1200, height: 630 },
  variants: [
    { suffix: "@mobile", width: 600, height: 315 },
    { suffix: "@tablet", width: 800, height: 420 },
  ],
};

async function fileStat(filePath) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

async function checkImageDimensions(filePath, expected, errors) {
  let metadata;
  try {
    metadata = await sharp(filePath).metadata();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`${toRepoRelative(filePath)}: cannot read image metadata (${message}).`);
    return;
  }

  if (metadata.width !== expected.width || metadata.height !== expected.height) {
    errors.push(
      `${toRepoRelative(filePath)}: invalid dimensions ${metadata.width}x${metadata.height}; expected ${expected.width}x${expected.height}.`
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const requirePublicPath = args.has("--require-public-path");
  const maxBytes = Number.parseInt(
    args.get("--max-bytes", String(PUBLISHED_HERO_MAX_BYTES)),
    10
  );

  const files = await listArticleFiles(BLOG_DIR);
  const errors = [];
  let checked = 0;

  for (const filePath of files) {
    const source = await readArticleFile(filePath);
    const { frontmatterRaw } = splitFrontmatter(source);
    if (!frontmatterRaw) continue;

    const frontmatter = parseFrontmatter(frontmatterRaw, filePath);
    if (!isPublishable(frontmatter)) continue;

    const slug = normalizeSlug(frontmatter, filePath);
    const relPath = toRepoRelative(filePath);
    const heroImage =
      typeof frontmatter.heroImage === "string" ? frontmatter.heroImage.trim() : "";

    checked += 1;

    if (!heroImage) {
      errors.push(`${relPath}: missing required heroImage for published article (${slug}).`);
      continue;
    }

    if (requirePublicPath && !heroImage.startsWith("/images/hero/")) {
      errors.push(
        `${relPath}: heroImage must use public path '/images/hero/...'. Found: ${heroImage}`
      );
      continue;
    }

    const resolved = resolveHeroImageFile(filePath, heroImage);
    if (!resolved) {
      errors.push(`${relPath}: cannot resolve heroImage path '${heroImage}'.`);
      continue;
    }

    const stat = await fileStat(resolved);
    if (!stat || !stat.isFile()) {
      errors.push(`${relPath}: heroImage file does not exist -> ${toRepoRelative(resolved)}`);
      continue;
    }

    const ext = path.extname(resolved).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      errors.push(
        `${relPath}: invalid heroImage extension '${ext}'. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`
      );
      continue;
    }

    if (stat.size > maxBytes) {
      errors.push(
        `${relPath}: heroImage exceeds max size (${stat.size} bytes > ${maxBytes} bytes).`
      );
      continue;
    }

    await checkImageDimensions(resolved, HERO_DIMENSIONS.base, errors);

    if (heroImage.startsWith("/images/hero/")) {
      const expectedBase = `${slug}${ext}`;
      const actualBase = path.basename(heroImage);
      if (actualBase !== expectedBase) {
        errors.push(
          `${relPath}: heroImage file name should match slug. expected=${expectedBase} actual=${actualBase}`
        );
      }
    }

    const publicCandidates = [
      path.join(process.cwd(), "public", "images", "hero", `${slug}.avif`),
      path.join(process.cwd(), "public", "images", "hero", `${slug}.webp`),
    ];
    let publicAssetFound = false;
    let publicAssetPath = "";

    for (const candidate of publicCandidates) {
      const publicStat = await fileStat(candidate);
      if (!publicStat || !publicStat.isFile()) continue;
      publicAssetFound = true;
      publicAssetPath = candidate;

      const publicExt = path.extname(candidate).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(publicExt)) {
        errors.push(
          `${relPath}: public hero asset extension '${publicExt}' is invalid (${toRepoRelative(candidate)}).`
        );
      }

      if (publicStat.size > maxBytes) {
        errors.push(
          `${relPath}: public hero asset exceeds max size (${publicStat.size} bytes > ${maxBytes} bytes).`
        );
      }
      break;
    }

    if (!publicAssetFound) {
      errors.push(
        `${relPath}: missing canonical public asset (expected public/images/hero/${slug}.avif|.webp).`
      );
    } else {
      await checkImageDimensions(publicAssetPath, HERO_DIMENSIONS.base, errors);

      if (path.extname(publicAssetPath).toLowerCase() === ".avif") {
        const baseWithoutExt = publicAssetPath.replace(/\.avif$/i, "");
        for (const variant of HERO_DIMENSIONS.variants) {
          const variantPath = `${baseWithoutExt}${variant.suffix}.avif`;
          const variantStat = await fileStat(variantPath);
          if (!variantStat || !variantStat.isFile()) {
            errors.push(
              `${relPath}: missing responsive hero variant ${toRepoRelative(variantPath)}.`
            );
            continue;
          }

          if (variantStat.size > maxBytes) {
            errors.push(
              `${relPath}: responsive hero variant exceeds max size (${variantStat.size} bytes > ${maxBytes} bytes): ${toRepoRelative(variantPath)}.`
            );
            continue;
          }

          await checkImageDimensions(variantPath, variant, errors);
        }
      }
    }
  }

  console.log(`[check-hero-images] Checked published articles: ${checked}`);
  console.log(
    `[check-hero-images] Path mode: ${requirePublicPath ? "public-only" : "legacy-compatible"}`
  );

  if (errors.length > 0) {
    console.error(`[check-hero-images] FAIL: ${errors.length} issue(s)`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("[check-hero-images] OK");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
