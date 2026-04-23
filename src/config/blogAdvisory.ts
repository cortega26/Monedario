import type { CollectionEntry } from "astro:content";

export const DEFAULT_BLOG_ARTICLE_ADVISORY =
  "Contenido informativo; no reemplaza asesoría profesional personalizada.";

export const BLOG_ARTICLE_ADVISORY_MAX_LENGTH = 220;

export function resolveBlogArticleAdvisory(
  post: CollectionEntry<"blog">
): string {
  return post.data.articleAdvisory?.trim() || DEFAULT_BLOG_ARTICLE_ADVISORY;
}
