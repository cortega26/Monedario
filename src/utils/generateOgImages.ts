import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

function svgBufferToPngBuffer(svg: string): Uint8Array {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return new Uint8Array(pngData.asPng());
}

async function pngBufferToJpegBuffer(png: Uint8Array): Promise<Uint8Array> {
  const jpeg = await sharp(Buffer.from(png))
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
  return new Uint8Array(jpeg);
}

export async function generateOgImageForPost(
  post: CollectionEntry<"blog">
): Promise<Uint8Array> {
  const svg = await postOgImage(post);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite(): Promise<Uint8Array> {
  const svg = await siteOgImage();
  const png = svgBufferToPngBuffer(svg);
  return pngBufferToJpegBuffer(png);
}
