import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/config";
import { getCanonicalPathFromSlug } from "@/domain/content/path";
import { toArticleView } from "@/utils/articleView";
import { interpolateEconomicText } from "@/utils/economicInterpolation";
import getSortedPosts from "@/utils/getSortedPosts";
import {
  bodyToPlainMarkdown,
  buildLlmsHeader,
  buildLlmsInstructions,
  buildLlmsScope,
} from "@/utils/llmsTxt";

const isoDate = (date: Date): string => date.toISOString().slice(0, 10);

async function buildLlmsFullTxt(site: URL): Promise<string> {
  const base = site.href.replace(/\/$/, "");
  // getSortedPosts filtra borradores/no listados y ordena por fecha desc,
  // igual que el RSS y el sitemap: misma superficie de URLs, sin divergencias.
  const posts = getSortedPosts(await getCollection("blog"));

  const latest = posts[0] ? toArticleView(posts[0]) : null;
  const lastUpdated = latest
    ? isoDate(latest.updatedDate ?? latest.pubDate)
    : null;

  const intro = `> **Documento completo.** Este archivo concatena el texto íntegro de los ${
    posts.length
  } artículos publicados de ${SITE.title}.cl en markdown. Es el complemento de \`/llms.txt\` (el índice de navegación).${
    lastUpdated ? ` Última actualización del contenido: ${lastUpdated}.` : ""
  } Las cifras con fecha de vigencia pueden haber cambiado desde entonces: cada artículo enlaza su URL original, que es siempre la fuente vigente.`;

  const articles = posts
    .map(post => {
      const article = toArticleView(post);
      const url = `${base}${getCanonicalPathFromSlug(article.slug, {
        includeBase: false,
      })}`;
      const updated = article.updatedDate
        ? ` · Actualizado: ${isoDate(article.updatedDate)}`
        : "";
      const hasDatedFigures =
        (post.data.volatileData?.length ?? 0) > 0 ||
        Boolean(post.data.articleLead?.validAsOf);
      const advisory = hasDatedFigures
        ? "\n- ⚠️ Contiene cifras con fecha de vigencia (tramos, tasas, UF/UTM); verifica los valores actuales en la URL original."
        : "";

      return `## ${article.title}

- URL original: ${url}
- Publicado: ${isoDate(article.pubDate)}${updated}
- Resumen: ${article.description}${advisory}

${interpolateEconomicText(bodyToPlainMarkdown(post.body ?? ""))}`;
    })
    .join("\n\n---\n\n");

  return `${buildLlmsHeader()}

${intro}

${buildLlmsScope()}

---

${articles}

---

${buildLlmsInstructions(base)}
`;
}

export const GET: APIRoute = async ({ site }) => {
  const body = await buildLlmsFullTxt(site ?? new URL(SITE.website));
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
