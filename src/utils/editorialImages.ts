import manifest from "@/generated/editorial-images.json";
import { getPath } from "./getPath";

export interface EditorialImageAsset {
  src: string;
  hash: string;
  width: number;
  height: number;
  bytes: number;
}

export interface EditorialImageEntry {
  sourcePath: string;
  sourceHash: string;
  assets: Record<"hero" | "tablet" | "mobile" | "og", EditorialImageAsset>;
}

export interface EditorialImage {
  src: string;
  srcset?: string;
  og?: string;
  version?: string;
}

type ImageInput = string | { src: string } | undefined;
const images: Record<string, EditorialImageEntry> = manifest.images;

/** Slug is public identity; fallbacks never invent nonexistent derivatives. */
export function resolveEditorialImage(
  slug: string,
  fallback?: ImageInput
): EditorialImage | undefined {
  const entry = images[slug];
  if (entry) {
    const { hero, tablet, mobile, og } = entry.assets;
    return {
      src: getPath(hero.src),
      srcset: [mobile, tablet, hero]
        .map(asset => `${getPath(asset.src)} ${asset.width}w`)
        .join(", "),
      og: getPath(og.src),
      version: hero.hash.slice(0, 16),
    };
  }
  const src = typeof fallback === "string" ? fallback : fallback?.src;
  return src ? { src: getPath(src) } : undefined;
}
