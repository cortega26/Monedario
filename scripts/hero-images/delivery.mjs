/** Deterministic local image delivery. No generation services or network I/O. */
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import {
  listArticleFiles,
  parseFrontmatter,
  splitFrontmatter,
} from "./lib.mjs";

export const DELIVERY_RECIPE_VERSION = 1;
export const HERO_MAX_BYTES = 80 * 1024;
export const DELIVERY_MANIFEST = "src/generated/editorial-images.json";
const SIZES = { hero: [1200, 630], tablet: [800, 420], mobile: [600, 315] };

export function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function readOptional(file) {
  try {
    return await fs.readFile(file);
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
}

async function writeChanged(file, bytes) {
  const previous = await readOptional(file);
  if (previous?.equals(Buffer.from(bytes))) return;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, bytes);
}

async function sourcesFromArticles(root) {
  const sources = [];
  for (const file of await listArticleFiles(path.join(root, "src/data/blog"))) {
    const { frontmatterRaw } = splitFrontmatter(
      await fs.readFile(file, "utf8")
    );
    const article = parseFrontmatter(frontmatterRaw, file);
    if (!article.heroImage && article.draft === true) continue;
    const { slug, heroImage } = article;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? "")) {
      throw new Error(`Invalid public slug in ${file}`);
    }
    if (typeof heroImage !== "string" || !/\.(avif|webp)$/i.test(heroImage)) {
      throw new Error(`A local AVIF/WebP heroImage is required for ${slug}`);
    }
    const sourcePath = heroImage.startsWith("/")
      ? path.join(root, "public", heroImage)
      : path.resolve(path.dirname(file), heroImage);
    const relative = path.relative(root, sourcePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`heroImage escapes project for ${slug}`);
    }
    // Enumerating articles, never derivative directories, prevents recursive
    // generation and ensures one social image per actual article.
    if (path.basename(sourcePath, path.extname(sourcePath)) !== slug) {
      throw new Error(
        `heroImage must use the canonical slug filename: ${slug}`
      );
    }
    sources.push({ slug, sourcePath: relative.replaceAll("\\", "/") });
  }
  sources.sort((a, b) => a.slug.localeCompare(b.slug));
  if (new Set(sources.map(source => source.slug)).size !== sources.length) {
    throw new Error("Duplicate article slugs in image delivery inputs");
  }
  return sources;
}

async function loadAssetReviews(root) {
  const bytes = await readOptional(
    path.join(root, "scripts/hero-images/asset-reviews.json")
  );
  if (!bytes) return {};
  const registry = JSON.parse(bytes);
  if (
    registry.schemaVersion !== 1 ||
    !registry.entries ||
    Array.isArray(registry.entries) ||
    typeof registry.entries !== "object"
  ) {
    throw new Error("Invalid image asset review registry");
  }
  return registry.entries;
}

async function selectSource(root, slug, canonical, reviews) {
  const review = reviews[slug];
  if (review?.review?.status !== "accepted") {
    return {
      sourcePath: canonical,
      source: await fs.readFile(path.join(root, canonical)),
    };
  }
  const expectedSourcePath = `scripts/hero-images/sources/${slug}.webp`;
  if (
    review.source?.path !== expectedSourcePath ||
    review.asset?.path !== canonical ||
    !/^[a-f0-9]{64}$/.test(review.source?.hash ?? "") ||
    !/^[a-f0-9]{64}$/.test(review.asset?.hash ?? "")
  ) {
    throw new Error(`Invalid accepted image provenance for ${slug}`);
  }
  const source = await fs.readFile(path.join(root, expectedSourcePath));
  const canonicalBytes = await fs.readFile(path.join(root, canonical));
  if (digest(source) !== review.source.hash) {
    throw new Error(
      `Accepted source hash mismatch for ${slug}; review the changed original`
    );
  }
  if (digest(canonicalBytes) !== review.asset.hash) {
    throw new Error(
      `Accepted canonical hash mismatch for ${slug}; review the changed hero`
    );
  }
  return {
    sourcePath: expectedSourcePath,
    source,
    expectedHeroHash: review.asset.hash,
  };
}

async function encodeAvif(source, width, height) {
  for (const quality of [65, 60, 55, 50, 45, 40, 35]) {
    const bytes = await sharp(source)
      .rotate()
      .resize(width, height, { fit: "cover", position: "centre" })
      .avif({ quality, effort: 6 })
      .toBuffer();
    if (bytes.length <= HERO_MAX_BYTES) return bytes;
  }
  throw new Error(`AVIF ${width}×${height} cannot meet the 80 KiB budget`);
}

export async function renderDelivery(source) {
  const metadata = await sharp(source).metadata();
  if (metadata.width !== 1200 || metadata.height !== 630) {
    throw new Error("Selected hero must already be framed at 1200×630");
  }
  if (metadata.compression === "av1" && source.length > HERO_MAX_BYTES) {
    throw new Error("Selected AVIF hero exceeds the 80 KiB budget");
  }
  const hero =
    metadata.compression === "av1"
      ? source
      : await encodeAvif(source, ...SIZES.hero);
  // Every rendition starts from the selected source, avoiding cascade loss.
  const [tablet, mobile, og] = await Promise.all([
    encodeAvif(source, ...SIZES.tablet),
    encodeAvif(source, ...SIZES.mobile),
    sharp(source)
      .flatten({ background: "#f8f6f0" })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer(),
  ]);
  return { hero, tablet, mobile, og };
}

function assetRecord(slug, kind, bytes) {
  const hash = digest(bytes);
  const [width, height] = kind === "og" ? SIZES.hero : SIZES[kind];
  return {
    src: `/images/editorial/${slug}/${hash}.${kind === "og" ? "jpg" : "avif"}`,
    hash,
    width,
    height,
    bytes: bytes.length,
  };
}

function canonicalPath(slug, kind) {
  if (kind === "og") return `public/images/og/${slug}.jpg`;
  const suffix = kind === "hero" ? "" : `@${kind}`;
  return `public/images/hero/${slug}${suffix}.avif`;
}

async function assetsAreIntact(root, slug, entry) {
  if (!entry?.assets) return false;
  for (const kind of ["hero", "tablet", "mobile", "og"]) {
    const asset = entry.assets[kind];
    if (!asset?.src?.startsWith(`/images/editorial/${slug}/`)) return false;
    for (const file of [
      path.join(root, "public", asset.src),
      path.join(root, canonicalPath(slug, kind)),
    ]) {
      const bytes = await readOptional(file);
      if (!bytes || digest(bytes) !== asset.hash) return false;
    }
  }
  return true;
}

export async function buildDelivery({
  root = process.cwd(),
  check = false,
  dryRun = false,
  force = false,
} = {}) {
  const manifestPath = path.join(root, DELIVERY_MANIFEST);
  const previousBytes = await readOptional(manifestPath);
  const previous = previousBytes ? JSON.parse(previousBytes) : undefined;
  const sources = await sourcesFromArticles(root);
  const reviews = await loadAssetReviews(root);
  /** @type {{ schemaVersion: number, recipeVersion: number, images: Record<string, import("../../src/utils/editorialImages").EditorialImageEntry> }} */
  const manifest = {
    schemaVersion: 1,
    recipeVersion: DELIVERY_RECIPE_VERSION,
    images: {},
  };
  let changed = 0;
  const pending = [];
  for (const { slug, sourcePath: canonical } of sources) {
    const { sourcePath, source, expectedHeroHash } = await selectSource(
      root,
      slug,
      canonical,
      reviews
    );
    const sourceHash = digest(source);
    const old = previous?.images?.[slug];
    const current =
      !force &&
      previous?.recipeVersion === DELIVERY_RECIPE_VERSION &&
      old?.sourceHash === sourceHash &&
      old?.sourcePath === sourcePath &&
      (await assetsAreIntact(root, slug, old));
    if (current) {
      manifest.images[slug] = old;
      continue;
    }
    changed++;
    if (check || dryRun) {
      pending.push(slug);
      continue;
    }
    const rendered = await renderDelivery(source);
    if (expectedHeroHash && digest(rendered.hero) !== expectedHeroHash) {
      throw new Error(
        `Rendered hero differs from accepted asset for ${slug}; review the delivery recipe`
      );
    }
    const assets = {};
    for (const [kind, bytes] of Object.entries(rendered)) {
      const asset = assetRecord(slug, kind, bytes);
      assets[kind] = asset;
      // Old hashed paths are retained: deployed caches and rollback stay valid.
      await writeChanged(path.join(root, "public", asset.src), bytes);
      await writeChanged(path.join(root, canonicalPath(slug, kind)), bytes);
    }
    manifest.images[slug] = { sourcePath, sourceHash, assets };
  }
  const bytes = `${JSON.stringify(manifest, null, 2)}\n`;
  if (check) {
    if (pending.length || previousBytes?.toString() !== bytes) {
      throw new Error(
        `Image delivery is stale; run images:build-delivery.${pending.length ? ` Pending: ${pending.join(", ")}` : ""}`
      );
    }
  } else if (!dryRun) {
    if (previousBytes && previousBytes.toString() !== bytes) {
      await writeChanged(
        path.join(
          root,
          "output/hero-images/delivery-manifests",
          `${digest(previousBytes)}.json`
        ),
        previousBytes
      );
    }
    await writeChanged(manifestPath, bytes);
  }
  return { total: sources.length, changed, pending, manifest };
}
