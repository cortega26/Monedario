import type { CollectionEntry } from "astro:content";

const DEFAULT_BLOG_ARTICLE_ADVISORY =
  "Contenido informativo; no reemplaza asesoría profesional personalizada.";

export function resolveBlogArticleAdvisory(
  post: CollectionEntry<"blog">
): string {
  return post.data.articleAdvisory?.trim() || DEFAULT_BLOG_ARTICLE_ADVISORY;
}
