import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import postFilter from "./postFilter";

interface Tag {
  tag: string;
  tagName: string;
}

interface TagWithCount extends Tag {
  count: number;
}

const getUniqueTags = (posts: CollectionEntry<"blog">[]) => {
  const tagMap = new Map<string, Tag>();
  posts
    .filter(postFilter)
    .flatMap(post => post.data.tags)
    .forEach(tagName => {
      const tag = slugifyStr(tagName);
      if (!tagMap.has(tag)) tagMap.set(tag, { tag, tagName });
    });
  return Array.from(tagMap.values()).sort((tagA, tagB) =>
    tagA.tag.localeCompare(tagB.tag)
  );
};

export const getUniqueTagsWithCount = (posts: CollectionEntry<"blog">[]) => {
  const tagMap = new Map<string, TagWithCount>();

  posts
    .filter(postFilter)
    .flatMap(post => post.data.tags)
    .forEach(tagName => {
      const tag = slugifyStr(tagName);
      const existingTag = tagMap.get(tag);

      if (existingTag) {
        existingTag.count += 1;
        return;
      }

      tagMap.set(tag, { tag, tagName, count: 1 });
    });

  return Array.from(tagMap.values()).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag)
  );
};

export default getUniqueTags;
