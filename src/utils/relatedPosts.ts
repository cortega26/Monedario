import type { CollectionEntry } from "astro:content";
import { toArticleView, type ArticleView } from "./articleView";

export type RelatedPostScoringInput = {
  tags: string[];
  cluster?: string;
  canonicalTopic?: string;
};

function normalizeText(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function scoreRelatedPostCandidate(
  current: RelatedPostScoringInput,
  candidate: RelatedPostScoringInput
): number {
  let score = 0;
  const currentCanonicalTopic = normalizeText(current.canonicalTopic);
  const candidateCanonicalTopic = normalizeText(candidate.canonicalTopic);
  const currentCluster = normalizeText(current.cluster);
  const candidateCluster = normalizeText(candidate.cluster);
  const currentTags = new Set(current.tags.map(tag => normalizeText(tag)));

  if (
    currentCanonicalTopic &&
    candidateCanonicalTopic &&
    currentCanonicalTopic === candidateCanonicalTopic
  ) {
    score += 100;
  }

  if (
    currentCluster &&
    candidateCluster &&
    currentCluster === candidateCluster
  ) {
    score += 40;
  }

  for (const tag of candidate.tags) {
    if (currentTags.has(normalizeText(tag))) score += 5;
  }

  return score;
}

export type RelatedPostsCurrent = {
  slug: string;
  tags: string[];
  cluster?: string;
  canonicalTopic?: string;
};

export type ComputeRelatedSlugsOptions = {
  allArticleViews?: ArticleView[];
  excludedSlugs?: string[];
};

export type ComputeRelatedMapOptions = {
  allArticleViews?: ArticleView[];
};

type RelatedCandidate = {
  post: CollectionEntry<"blog">;
  article: ArticleView;
  score: number;
};

const sortByScoreAndDate = (a: RelatedCandidate, b: RelatedCandidate) =>
  b.score - a.score ||
  b.article.pubDate.getTime() - a.article.pubDate.getTime();

/**
 * Retained as the per-page reference implementation.
 * `relatedSlugsFor` below must stay slug-for-slug equivalent to this
 * function when `current` is derived from the same corpus entry.
 */
export function computeRelatedSlugs(
  allPosts: CollectionEntry<"blog">[],
  current: RelatedPostsCurrent,
  options?: ComputeRelatedSlugsOptions
): string[] {
  const excludedSlugSet = new Set(options?.excludedSlugs ?? []);

  const normalizedPosts = options?.allArticleViews
    ? allPosts.map((post, i) => ({
        post,
        article: options.allArticleViews![i],
      }))
    : allPosts.map(post => ({ post, article: toArticleView(post) }));

  const candidatePosts = normalizedPosts.filter(
    ({ article }) =>
      article.slug !== current.slug &&
      !excludedSlugSet.has(article.slug) &&
      !article.draft &&
      !article.unlisted
  );

  const scoredPosts: RelatedCandidate[] = candidatePosts.map(item => {
    const score = scoreRelatedPostCandidate(
      {
        tags: current.tags,
        cluster: current.cluster,
        canonicalTopic: current.canonicalTopic,
      },
      {
        tags: item.article.tags,
        cluster: item.article.cluster,
        canonicalTopic: item.post.data.canonicalTopic,
      }
    );

    return { ...item, score };
  });

  const tagMatchedPosts = scoredPosts
    .filter(item => item.score > 0)
    .sort(sortByScoreAndDate);

  const fallbackPosts = scoredPosts
    .filter(item => item.score === 0)
    .sort((a, b) => b.article.pubDate.getTime() - a.article.pubDate.getTime());

  return [...tagMatchedPosts, ...fallbackPosts]
    .slice(0, 3)
    .map(item => item.article.slug);
}

let relatedMatrixBuildCount = 0;

type RelatedMapCacheEntry = {
  views: ArticleView[] | undefined;
  map: Map<string, string[]>;
};

let relatedMapCache = new WeakMap<
  CollectionEntry<"blog">[],
  RelatedMapCacheEntry
>();

/** Number of times the related-posts matrix actually recomputed. */
export function getRelatedMatrixBuildCount(): number {
  return relatedMatrixBuildCount;
}

/** Test-only reset: clears the memoized matrix and the build counter. */
export function __resetRelatedMatrixCacheForTests(): void {
  relatedMatrixBuildCount = 0;
  relatedMapCache = new WeakMap();
}

/**
 * Score every ordered pair ONCE and return per-slug FULL ranked slug lists.
 *
 * - Reuses `scoreRelatedPostCandidate` as the single scoring implementation.
 * - Draft/unlisted filtering happens here (corpus-global): drafts and
 *   unlisted posts never appear as candidates in any ranked list.
 * - No slicing and no per-page exclusions here: the current slug and
 *   `excludedSlugs` (prev/next, contextual duplicates) differ per page and
 *   MUST be applied at lookup time in `relatedSlugsFor`, not here. The
 *   ranked lists intentionally include the owner slug so the lookup can
 *   prove self-exclusion per page.
 * - Memoized per build process: keyed by the `allPosts` array reference
 *   (plus the `allArticleViews` reference when provided). Repeated lookups
 *   against ONE shared array reference compute the O(P^2) matrix exactly
 *   once.
 */
export function computeRelatedMap(
  allPosts: CollectionEntry<"blog">[],
  options?: ComputeRelatedMapOptions
): Map<string, string[]> {
  const views = options?.allArticleViews;
  const cached = relatedMapCache.get(allPosts);
  if (cached && cached.views === views) return cached.map;

  relatedMatrixBuildCount += 1;

  const normalized = views
    ? allPosts.map((post, i) => ({ post, article: views[i] }))
    : allPosts.map(post => ({ post, article: toArticleView(post) }));

  const visible = normalized.filter(
    ({ article }) => !article.draft && !article.unlisted
  );

  const map = new Map<string, string[]>();
  for (const current of normalized) {
    const currentInput: RelatedPostScoringInput = {
      tags: current.article.tags,
      cluster: current.article.cluster,
      canonicalTopic: current.post.data.canonicalTopic,
    };
    const scored: RelatedCandidate[] = visible.map(candidate => ({
      ...candidate,
      score: scoreRelatedPostCandidate(currentInput, {
        tags: candidate.article.tags,
        cluster: candidate.article.cluster,
        canonicalTopic: candidate.post.data.canonicalTopic,
      }),
    }));
    const matched = scored
      .filter(item => item.score > 0)
      .sort(sortByScoreAndDate);
    const fallback = scored
      .filter(item => item.score === 0)
      .sort(
        (a, b) => b.article.pubDate.getTime() - a.article.pubDate.getTime()
      );
    map.set(
      current.article.slug,
      [...matched, ...fallback].map(item => item.article.slug)
    );
  }

  relatedMapCache.set(allPosts, { views, map });
  return map;
}

export type RelatedSlugsForOptions = ComputeRelatedMapOptions & {
  /**
   * Scoring input for the current page. Required only when the current
   * slug is NOT part of `allPosts` (e.g. unlisted articles, which
   * `getSortedPosts`/`postFilter` removes from the per-page `posts`
   * corpus). In that case the lookup falls back to a single O(P) scoring
   * pass via `computeRelatedSlugs`, preserving byte-identical output.
   */
  current?: RelatedPostsCurrent;
};

/**
 * Apply per-page exclusions to a precomputed FULL ranked list.
 *
 * Single implementation of the filter-then-slice-3 step used both by
 * `relatedSlugsFor` (matrix path) and by precomputed `getStaticPaths`
 * props. Keeping one helper guarantees slug-for-slug equivalence.
 */
export function filterPrecomputedRelatedRanked(
  ranked: string[],
  slug: string,
  excludedSlugs?: string[]
): string[] {
  const excluded = new Set(excludedSlugs ?? []);
  return ranked
    .filter(candidate => candidate !== slug && !excluded.has(candidate))
    .slice(0, 3);
}

/**
 * Per-page lookup over the memoized matrix.
 *
 * Takes the cached FULL ranked list for `slug`, filters out the current
 * slug plus per-page `excludedSlugs` (prev/next posts differ per page),
 * then slices 3. Callers must pass the same shared `allPosts` (and
 * `allArticleViews`) array references on every page for the matrix to
 * compute exactly once per build process.
 */
export function relatedSlugsFor(
  allPosts: CollectionEntry<"blog">[],
  slug: string,
  excludedSlugs?: string[],
  options?: RelatedSlugsForOptions
): string[] {
  const map = computeRelatedMap(allPosts, options);
  const ranked = map.get(slug);
  if (ranked) {
    return filterPrecomputedRelatedRanked(ranked, slug, excludedSlugs);
  }
  const current = options?.current;
  if (!current) return [];
  return computeRelatedSlugs(allPosts, current, {
    allArticleViews: options?.allArticleViews,
    excludedSlugs,
  });
}
