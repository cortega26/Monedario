import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const digest = bytes => createHash("sha256").update(bytes).digest("hex");

export async function checkImageCuration(root = process.cwd()) {
  const registry = JSON.parse(
    await fs.readFile(
      path.join(root, "scripts/hero-images/asset-reviews.json"),
      "utf8"
    )
  );
  const { entries: prompts } = JSON.parse(
    await fs.readFile(
      path.join(root, "scripts/hero-images/prompts.json"),
      "utf8"
    )
  );
  const errors = [];
  if (
    registry.schemaVersion !== 1 ||
    !registry.entries ||
    typeof registry.entries !== "object" ||
    Array.isArray(registry.entries)
  ) {
    return ["Unsupported image curation registry"];
  }
  const sourcesDir = path.join(root, "scripts/hero-images/sources");
  let sources = [];
  try {
    sources = await fs.readdir(sourcesDir);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  for (const file of sources.filter(file => file.endsWith(".webp"))) {
    const slug = file.slice(0, -5);
    if (!registry.entries[slug])
      errors.push(`${slug}: curated source has no review record`);
  }
  for (const [slug, entry] of Object.entries(registry.entries)) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${slug}: invalid review record`);
      continue;
    }
    const prompt = prompts.find(candidate => candidate.slug === slug);
    if (entry.slug !== slug || entry.review?.status !== "accepted") {
      errors.push(`${slug}: image awaits visual review`);
    }
    if (!prompt || entry.sourceContentHash !== prompt.sourceContentHash) {
      errors.push(
        `${slug}: article changed; image review required (no automatic regeneration)`
      );
    }
    if (
      typeof entry.prompt !== "string" ||
      digest(entry.prompt) !== entry.promptHash ||
      entry.promptHash !== prompt?.promptHash ||
      entry.styleVersion !== prompt?.styleVersion
    ) {
      errors.push(
        `${slug}: final prompt/style does not match the curated image record`
      );
    }
    for (const [kind, expectedPath] of [
      ["source", `scripts/hero-images/sources/${slug}.webp`],
      ["asset", `public/images/hero/${slug}.avif`],
    ]) {
      const record = entry[kind];
      if (record?.path !== expectedPath) {
        errors.push(`${slug}: invalid ${kind} path`);
        continue;
      }
      try {
        if (
          digest(await fs.readFile(path.join(root, record.path))) !==
          record.hash
        ) {
          errors.push(`${slug}: ${kind} bytes differ from the reviewed file`);
        }
      } catch (error) {
        errors.push(`${slug}: cannot read ${kind} (${error.code})`);
      }
    }
  }
  return errors;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const errors = await checkImageCuration();
    if (errors.length) throw new Error(errors.join("\n"));
    console.log(
      "[image-curation] Reviewed prompts, article fingerprints and asset bytes match."
    );
  } catch (error) {
    console.error(`[image-curation] ${error.message}`);
    process.exitCode = 1;
  }
}
