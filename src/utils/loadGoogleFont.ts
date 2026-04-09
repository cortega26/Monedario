/**
 * loadGoogleFont.ts — v2
 *
 * Lee fuentes exclusivamente desde el filesystem local.
 * Elimina la dependencia de red en build time y el riesgo de fallo en CI.
 *
 * Fuentes requeridas por el sistema visual v3 (Satori):
 *   - Inter 400 → texto UI, labels, pills
 *   - Inter 900 → número/dato ancla en Template C
 *
 * Los archivos .ttf deben estar en public/fonts/.
 * Ejecutar el script de descarga una sola vez:
 *
 *   node scripts/download-og-fonts.mjs
 *
 * Si un archivo no existe en disco, se lanza un error con la instrucción
 * para regenerar las fuentes locales. Esto mantiene el flujo OG libre de red.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const FONTS_DIR = resolve(process.cwd(), "public/fonts");

interface FontConfig {
  name: string;
  file: string; // nombre del archivo en public/fonts/
  weight: number;
  style: string;
}

const FONTS_CONFIG: FontConfig[] = [
  {
    name: "Inter",
    file: "inter-latin-400.ttf",
    weight: 400,
    style: "normal",
  },
  {
    name: "Inter",
    file: "inter-latin-900.ttf",
    weight: 900,
    style: "normal",
  },
];

const TTF_SIGNATURE = "\x00\x01\x00\x00";
const OTF_SIGNATURE = "OTTO";
const WOFF_SIGNATURE = "wOFF";
const WOFF2_SIGNATURE = "wOF2";
function readFontFromDisk(file: string): ArrayBuffer {
  const filePath = resolve(FONTS_DIR, file);
  if (!existsSync(filePath)) {
    throw new Error(
      `[og-fonts] Missing local font file ${file}. Run "node scripts/download-og-fonts.mjs" to regenerate committed font assets.`
    );
  }

  const buffer = readFileSync(filePath);
  const signature = buffer.subarray(0, 4).toString("latin1");
  if (signature === WOFF2_SIGNATURE) {
    throw new Error(
      `[og-fonts] ${file} is WOFF2, which is incompatible with Satori. Use TTF/OTF/WOFF instead.`
    );
  }

  if (
    signature !== TTF_SIGNATURE &&
    signature !== OTF_SIGNATURE &&
    signature !== WOFF_SIGNATURE
  ) {
    throw new Error(
      `[og-fonts] Unrecognized font signature for ${file}: ${JSON.stringify(signature)}.`
    );
  }

  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
}

// ─── EXPORT PRINCIPAL ─────────────────────────────────────────────────────────

async function loadGoogleFonts(): Promise<
  Array<{ name: string; data: ArrayBuffer; weight: number; style: string }>
> {
  const fonts = await Promise.all(
    FONTS_CONFIG.map(async ({ name, file, weight, style }) => ({
      name,
      data: readFontFromDisk(file),
      weight,
      style,
    }))
  );

  return fonts;
}

export default loadGoogleFonts;
