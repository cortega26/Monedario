import { afterEach, describe, expect, it } from "vitest";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  utimes,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import {
  buildDelivery,
  DELIVERY_MANIFEST,
  digest,
  HERO_MAX_BYTES,
  renderDelivery,
} from "../../scripts/hero-images/delivery.mjs";

const roots: string[] = [];
const sourcePath = "public/images/hero/example.avif";

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "monedario-delivery-"));
  roots.push(root);
  await mkdir(path.join(root, "src/data/blog"), { recursive: true });
  await mkdir(path.join(root, "public/images/hero"), { recursive: true });
  await writeFile(
    path.join(root, "src/data/blog/example.md"),
    "---\nslug: example\nheroImage: /images/hero/example.avif\n---\nArticle\n"
  );
  await writeFile(path.join(root, sourcePath), await solid("#0d9488"));
  return root;
}

function solid(background: string) {
  return sharp({
    create: { width: 1200, height: 630, channels: 3, background },
  })
    .avif({ quality: 65 })
    .toBuffer();
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map(root => rm(root, { recursive: true, force: true }))
  );
});

describe("editorial image delivery", () => {
  it("builds one OG per article, preserves canonical bytes and verifies dimensions and hashes", async () => {
    const root = await fixture();
    const source = await readFile(path.join(root, sourcePath));
    // These are not article sources and must never acquire their own OG.
    await writeFile(
      path.join(root, "public/images/hero/example@mobile.avif"),
      source
    );
    await writeFile(
      path.join(root, "public/images/hero/example-deadbeef.avif"),
      source
    );
    const { manifest, total } = await buildDelivery({ root });
    const entry = manifest.images.example;
    expect(total).toBe(1);
    expect(entry.sourceHash).toBe(digest(source));
    expect(await readFile(path.join(root, sourcePath))).toEqual(source);
    expect(await readdir(path.join(root, "public/images/og"))).toEqual([
      "example.jpg",
    ]);
    for (const [kind, asset] of Object.entries(entry.assets)) {
      const bytes = await readFile(path.join(root, "public", asset.src));
      expect(digest(bytes)).toBe(asset.hash);
      expect(asset.src).toContain(asset.hash);
      const metadata = await sharp(bytes).metadata();
      expect([metadata.width, metadata.height]).toEqual([
        asset.width,
        asset.height,
      ]);
      if (kind !== "og")
        expect(bytes.length).toBeLessThanOrEqual(HERO_MAX_BYTES);
    }
    const manifestBefore = await readFile(path.join(root, DELIVERY_MANIFEST));
    expect((await buildDelivery({ root })).changed).toBe(0);
    expect(await readFile(path.join(root, DELIVERY_MANIFEST))).toEqual(
      manifestBefore
    );
    await expect(buildDelivery({ root, check: true })).resolves.toMatchObject({
      changed: 0,
    });
  });

  it("detects changed bytes with preserved timestamps and retains the previous version for rollback", async () => {
    const root = await fixture();
    const previous = await buildDelivery({ root });
    const oldImage = previous.manifest.images.example.assets.hero;
    const oldManifest = await readFile(path.join(root, DELIVERY_MANIFEST));
    const filename = path.join(root, sourcePath);
    const before = await stat(filename);
    await writeFile(filename, await solid("#213449"));
    await utimes(filename, before.atime, before.mtime);
    await expect(buildDelivery({ root, check: true })).rejects.toThrow(
      "Image delivery is stale"
    );
    expect(await readFile(path.join(root, DELIVERY_MANIFEST))).toEqual(
      oldManifest
    );
    const refreshed = await buildDelivery({ root });
    expect(refreshed.manifest.images.example.assets.hero.src).not.toBe(
      oldImage.src
    );
    expect(
      digest(await readFile(path.join(root, "public", oldImage.src)))
    ).toBe(oldImage.hash);
    expect(
      await readFile(
        path.join(
          root,
          "output/hero-images/delivery-manifests",
          `${digest(oldManifest)}.json`
        )
      )
    ).toEqual(oldManifest);
  });

  it("repairs missing or corrupt derivatives even when the source is unchanged", async () => {
    const root = await fixture();
    const { manifest } = await buildDelivery({ root });
    const mobile = manifest.images.example.assets.mobile;
    await writeFile(path.join(root, "public", mobile.src), "corrupt");
    await expect(buildDelivery({ root, check: true })).rejects.toThrow(
      "Image delivery is stale"
    );
    expect((await buildDelivery({ root })).changed).toBe(1);
    expect(digest(await readFile(path.join(root, "public", mobile.src)))).toBe(
      mobile.hash
    );
  });

  it("dry run does not change files or invent outputs", async () => {
    const root = await fixture();
    const result = await buildDelivery({ root, dryRun: true });
    expect(result.pending).toEqual(["example"]);
    await expect(
      readFile(path.join(root, DELIVERY_MANIFEST))
    ).rejects.toMatchObject({ code: "ENOENT" });
    await expect(
      readdir(path.join(root, "public/images/editorial"))
    ).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("rejects an unreviewed crop instead of reframing it during build", async () => {
    const source = await sharp({
      create: { width: 800, height: 800, channels: 3, background: "#0d9488" },
    })
      .png()
      .toBuffer();
    await expect(renderDelivery(source)).rejects.toThrow(
      "already be framed at 1200×630"
    );
  });
});

describe("curated lossless image sources", () => {
  async function acceptedFixture() {
    const root = await fixture();
    const sourcePath = "scripts/hero-images/sources/example.webp";
    const source = await sharp({
      create: { width: 1200, height: 630, channels: 3, background: "#0d9488" },
    })
      .webp({ lossless: true })
      .toBuffer();
    const rendered = await renderDelivery(source);
    await mkdir(path.join(root, "scripts/hero-images/sources"), {
      recursive: true,
    });
    await writeFile(path.join(root, sourcePath), source);
    await writeFile(
      path.join(root, "public/images/hero/example.avif"),
      rendered.hero
    );
    const review = {
      source: { path: sourcePath, hash: digest(source) },
      asset: {
        path: "public/images/hero/example.avif",
        hash: digest(rendered.hero),
      },
      review: { status: "accepted" },
    };
    await writeFile(
      path.join(root, "scripts/hero-images/asset-reviews.json"),
      JSON.stringify({ schemaVersion: 1, entries: { example: review } })
    );
    return { root, sourcePath, source, rendered, review };
  }

  it("derives hero, responsive and OG bytes from the same accepted lossless source", async () => {
    const { root, sourcePath, source, rendered } = await acceptedFixture();
    const { manifest } = await buildDelivery({ root });
    const entry = manifest.images.example;
    expect(entry.sourcePath).toBe(sourcePath);
    expect(entry.sourceHash).toBe(digest(source));
    for (const [kind, bytes] of Object.entries(rendered)) {
      expect(entry.assets[kind as keyof typeof entry.assets].hash).toBe(
        digest(bytes)
      );
    }
    await expect(buildDelivery({ root, check: true })).resolves.toMatchObject({
      changed: 0,
    });
  });

  it("rejects lossless source changes with preserved mtime until provenance is reviewed", async () => {
    const { root, sourcePath } = await acceptedFixture();
    await buildDelivery({ root });
    const file = path.join(root, sourcePath);
    const before = await stat(file);
    await writeFile(
      file,
      await sharp(await solid("#213449"))
        .webp({ lossless: true })
        .toBuffer()
    );
    await utimes(file, before.atime, before.mtime);
    await expect(buildDelivery({ root, check: true })).rejects.toThrow(
      "Accepted source hash mismatch"
    );
    await expect(buildDelivery({ root })).rejects.toThrow(
      "Accepted source hash mismatch"
    );
  });

  it("rejects a canonical hero that no longer matches its acceptance record", async () => {
    const { root } = await acceptedFixture();
    await writeFile(
      path.join(root, "public/images/hero/example.avif"),
      await solid("#213449")
    );
    await expect(buildDelivery({ root })).rejects.toThrow(
      "Accepted canonical hash mismatch"
    );
  });

  it("rejects a self-consistent registry whose accepted hero was not rendered from its source", async () => {
    const { root, review } = await acceptedFixture();
    const wrong = await solid("#213449");
    await writeFile(path.join(root, review.asset.path), wrong);
    review.asset.hash = digest(wrong);
    await writeFile(
      path.join(root, "scripts/hero-images/asset-reviews.json"),
      JSON.stringify({ schemaVersion: 1, entries: { example: review } })
    );
    await expect(buildDelivery({ root })).rejects.toThrow(
      "Rendered hero differs from accepted asset"
    );
  });
});
