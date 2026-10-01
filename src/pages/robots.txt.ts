import type { APIRoute } from "astro";
import { SITE } from "@/config";

// Derive base path from the configured website URL (e.g. "/" or "/subpath")
const BASE = new URL(SITE.website).pathname.replace(/\/$/, "");

export const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /

# Los assets de vista previa social deben ser rastreables. Sus respuestas usan
# X-Robots-Tag: noindex para evitar que aparezcan como resultados independientes.
# El índice de búsqueda interna no necesita rastreo.
Disallow: ${BASE}/pagefind/

# /buscar/, /search/ y /tags/ quedan crawlables para que los bots vean el noindex
# pero se excluyen del sitemap y de los objetivos de indexación.

# ── Crawlers de IA ──────────────────────────────────────────────────────────
# Los bots de recuperación y cita (OAI-SearchBot, PerplexityBot,
# Claude-SearchBot, ChatGPT-User, Perplexity-User, Claude-User, Amzn-SearchBot,
# Amzn-User, MistralAI-User) quedan permitidos vía "User-agent: *": generan
# tráfico de citación hacia Monedario.
# Los bots siguientes se usan para entrenar modelos de IA y se bloquean.
# Revisión mensual 2026-10 (issue #637): se añaden anthropic-ai (identificador
# legado de Anthropic), cohere-ai y cohere-training-data-crawler, Diffbot y
# omgili/omgilibot (agregadores de datasets), alineados con la política de
# bloquear entrenamiento y permitir recuperación/cita.
# Nota: Google-Extended solo afecta a Gemini; no afecta a Googlebot ni al
# ranking en Google Search. Amazonbot entrena modelos (Nova); Amzn-SearchBot
# y Amzn-User son crawlers separados de Amazon (Alexa/citación) y quedan
# permitidos.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: anthropic-ai
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
User-agent: meta-externalagent
User-agent: Bytespider
User-agent: Amazonbot
User-agent: cohere-ai
User-agent: cohere-training-data-crawler
User-agent: Diffbot
User-agent: omgili
User-agent: omgilibot
Disallow: /

# La URL canónica del sitio está en el sitemap
Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};
