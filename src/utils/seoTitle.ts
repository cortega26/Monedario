/**
 * Resolves the SERP <title> from the editorial title and the optional seoTitle
 * override. seoTitle, when present, is used verbatim (no suffix): its length
 * IS the rendered title length — the 65-char budget enforced by the schema
 * (z.max(65)) and scripts/check-frontmatter.mjs (SEO_TITLE_MAX). The H1 always
 * renders the editorial title (or term, in the glossary) — never seoTitle.
 */
export function resolvePageTitle(
  base: string,
  siteTitle: string,
  seoTitle?: string
): string {
  return seoTitle ?? `${base} | ${siteTitle}`;
}
