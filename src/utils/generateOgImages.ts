import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
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

export async function generateOgImageForSite(): Promise<Uint8Array> {
  const png = await generateOgImageForSitePng();
  return pngBufferToJpegBuffer(png);
}

export async function generateOgImageForSitePng(): Promise<Uint8Array> {
  const svg = await siteOgImage();
  return svgBufferToPngBuffer(svg);
}
