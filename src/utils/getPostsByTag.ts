import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll } from "./slugify";

const getPostsByTag = (
  posts: CollectionEntry<"blog">[],
  tag: string,
  sortedPosts?: CollectionEntry<"blog">[]
) => {
  const source = sortedPosts ?? getSortedPosts(posts);
  return source.filter(post => slugifyAll(post.data.tags).includes(tag));
};

export default getPostsByTag;
