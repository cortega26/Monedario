/**
 * Contrato de indexabilidad (SEO-08, plan 120).
 *
 * Fuente única de verdad para la indexabilidad direccionable por path: meta
 * robots, inclusión en sitemap y razón. Lo consumen `Layout.astro` (meta
 * robots), `astro.config.ts` (filtro del sitemap) y las páginas utilitarias.
 *
 * Excepciones dependientes de datos, documentadas en
 * `docs/adr/ADR-20260929-declarative-indexability-contract.md`:
 * - posts `unlisted`: `PostDetails.astro` emite `noindex,follow` y el post se
 *   excluye del sitemap vía `SITEMAP_EXCLUDED_PATHS`;
 * - rutas de imagen social (`og.*`): `X-Robots-Tag` en headers.
 *
 * Crawl vs indexación: `robots.txt` (crawl) no se deriva de este contrato;
 * las páginas no indexables siguen siendo crawlables para que los bots lean
 * el `noindex`.
 */

export type Indexability = {
  indexable: boolean;
  inSitemap: boolean;
  robotsMeta: string | null;
  reason: string;
};

type Rule = {
  test: (pathname: string) => boolean;
  value: Indexability;
};

const noindexFollow = (reason: string): Indexability => ({
  indexable: false,
  inSitemap: false,
  robotsMeta: "noindex,follow",
  reason,
});

const INDEXABLE: Indexability = {
  indexable: true,
  inSitemap: true,
  robotsMeta: null,
  reason: "contenido indexable",
};

function normalizePathname(pathname: string): string {
  const withSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withSlash.endsWith("/") ? withSlash : `${withSlash}/`;
}

const RULES: Rule[] = [
  {
    test: pathname => pathname === "/tags/" || pathname.startsWith("/tags/"),
    value: noindexFollow("taxonomía de tags (SEO-01)"),
  },
  {
    test: pathname => /^\/posts\/\d+\/$/.test(pathname),
    value: noindexFollow("paginación del archivo de artículos"),
  },
  {
    test: pathname => pathname === "/buscar/" || pathname === "/search/",
    value: noindexFollow("utilitaria de búsqueda interna"),
  },
  {
    test: pathname =>
      pathname === "/privado/" || pathname.startsWith("/privado/"),
    value: noindexFollow("herramienta financiera experimental local-first"),
  },
  {
    test: pathname => pathname.startsWith("/dev/"),
    value: noindexFollow("herramientas de desarrollo"),
  },
  {
    test: pathname => pathname.startsWith("/pagefind/"),
    value: {
      indexable: false,
      inSitemap: false,
      robotsMeta: null,
      reason: "índice de búsqueda interna (Disallow en robots.txt)",
    },
  },
];

export function indexabilityFor(pathname: string): Indexability {
  const normalized = normalizePathname(pathname);
  for (const rule of RULES) {
    if (rule.test(normalized)) return rule.value;
  }
  return INDEXABLE;
}

export function isInSitemap(pathname: string): boolean {
  return indexabilityFor(pathname).inSitemap;
}

export function robotsMetaFor(pathname: string): string | null {
  return indexabilityFor(pathname).robotsMeta;
}
