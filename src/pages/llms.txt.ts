import type { APIRoute } from "astro";
import { SITE } from "@/config";
import { CALCULATOR_PORTFOLIO } from "@/config/calculatorPortfolio";
import { GUIDE_HUB_ORDER, GUIDE_HUBS } from "@/config/clusters";
import {
  INDICADORES_PATH,
  buildLlmsHeader,
  buildLlmsScope,
  buildLlmsInstructions,
} from "@/utils/llmsTxt";

function buildLlmsTxt(site: URL): string {
  const base = site.href.replace(/\/$/, "");

  const guides = GUIDE_HUB_ORDER.map(
    slug =>
      `- [${GUIDE_HUBS[slug].nombre}](${base}/guias/${slug}/) — ${GUIDE_HUBS[slug].descripcion}`
  ).join("\n");

  const calcs = CALCULATOR_PORTFOLIO.map(
    c => `- [${c.title}](${base}${c.href}) — ${c.description}`
  ).join("\n");

  return `${buildLlmsHeader()}

## Guías

- [Guías de finanzas personales](${base}/guias/) — índice de todas las guías
${guides}

## Calculadoras

- [Calculadoras de finanzas personales](${base}/calculadoras/) — índice completo
${calcs}

## Indicadores económicos

- [Indicadores económicos de Chile](${base}${INDICADORES_PATH}) — UF diaria, UTM, IPC, dólar, euro, tasas de interés

## Leyes y normativa

- [Leyes relevantes para finanzas personales](${base}/leyes/) — resúmenes de la normativa chilena aplicable

## Glosario

- [Glosario de finanzas personales](${base}/glosario/) — términos financieros explicados en español chileno

## Acerca del sitio

- [Metodología editorial](${base}/metodologia/) — proceso editorial de 7 etapas, fuentes utilizadas y cómo auditar cada cifra
- [Autor: ${SITE.authorFullName}](${base}/autor/)
- [Accesibilidad](${base}/accessibilidad/)
- [Política de privacidad](${base}/privacidad/)
- [Contenido completo en markdown](${base}/llms-full.txt) — texto íntegro de todos los artículos publicados, para ingestión por modelos

${buildLlmsScope()}

${buildLlmsInstructions(base)}
`;
}

export const GET: APIRoute = ({ site }) => {
  return new Response(buildLlmsTxt(site ?? new URL(SITE.website)), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
