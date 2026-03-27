/**
 * scripts/download-og-fonts.mjs
 *
 * Script de una sola vez: descarga las fuentes Inter necesarias para Satori
 * y las guarda en public/fonts/ para que el build no dependa de red.
 *
 * Uso:
 *   node scripts/download-og-fonts.mjs
 *
 * Solo necesitas correrlo:
 *   - Una vez al configurar el proyecto
 *   - Si cambias las fuentes del sistema OG
 *   - En un nuevo entorno de desarrollo
 *
 * Las fuentes descargadas van al gitrepo (son estáticas, no cambian).
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = resolve(__dirname, "../public/fonts");

const FONTS = [
  {
    file: "inter-latin-400.ttf",
    family: "Inter",
    weight: 400,
  },
  {
    file: "inter-latin-900.ttf",
    family: "Inter",
    weight: 900,
  },
];

const UA =
  "Mozilla/5.0 (Linux; U; Android 4.4; en-us; Nexus 5 Build/KRT16M) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30";

function isTrustedFontUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.host === "fonts.googleapis.com" ||
        parsed.host === "fonts.gstatic.com")
    );
  } catch {
    return false;
  }
}

// Caracteres representativos para que Google devuelva un subset útil.
// Incluye: números, letras con tilde, signos comunes en finanzas chilenas.
const SAMPLE_TEXT =
  "ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz0123456789%.,áéíóúÁÉÍÓÚ·$€+-";

async function downloadFont(family, weight, outFile) {
  const api = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(SAMPLE_TEXT)}`;

  console.log(`Descargando ${family} ${weight}...`);

  const css = await fetch(api, { headers: { "User-Agent": UA } }).then(r => r.text());

  const match = css.match(/src:\s*url\((.+?)\)/);
  if (!match)
    throw new Error(
      `No se encontró URL de fuente en la respuesta CSS para ${family}:${weight}`
    );

  const fontUrl = match[1];
  console.log(`  URL: ${fontUrl}`);

    if (!isTrustedFontUrl(fontUrl)) {
      throw new Error(`[og-fonts] Untrusted font URL: ${fontUrl}`);
    }
    const fontData = await fetch(fontUrl).then(r => r.arrayBuffer());
  const signature = Buffer.from(fontData).subarray(0, 4).toString("latin1");
  if (signature === "wOF2") {
    throw new Error(
      `Google devolvió WOFF2 para ${family}:${weight}; Satori requiere TTF/OTF/WOFF.`
    );
  }

  const outPath = resolve(FONTS_DIR, outFile);

  writeFileSync(outPath, Buffer.from(fontData));
  console.log(`  Guardado: public/fonts/${outFile} (${Math.round(fontData.byteLength / 1024)} KB)`);
}

async function main() {
  if (!existsSync(FONTS_DIR)) {
    mkdirSync(FONTS_DIR, { recursive: true });
    console.log(`Directorio creado: public/fonts/`);
  }

  for (const { file, family, weight } of FONTS) {
    const outPath = resolve(FONTS_DIR, file);
    if (existsSync(outPath)) {
      console.log(`Ya existe: public/fonts/${file} — omitiendo.`);
      continue;
    }
    await downloadFont(family, weight, file);
  }

  console.log("\n✓ Fuentes OG listas. Commitea public/fonts/inter-latin-*.ttf al repo.");
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
