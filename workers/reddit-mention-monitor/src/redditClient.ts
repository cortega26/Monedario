// Reddit app-only OAuth client (read-only search).
//
// Auth: client_credentials grant (no user context, no refresh token). Token is
// requested fresh per run against https://www.reddit.com/api/v1/access_token and
// used against https://oauth.reddit.com. Scope: read.
// Non-commercial use only — compliant because Monedario is free, ad-free and does
// not capture data (see ADR). Usage is far below the 60 req/min free-tier budget.

const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const API_BASE = "https://oauth.reddit.com";

export interface RedditPost {
  /** Fullname id, e.g. "t3_abc123". */
  id: string;
  title: string;
  subreddit: string;
  permalink: string;
  author: string;
  score: number;
  /** Unix seconds (created_utc). */
  created: number;
  /** Whether the post is flagged NSFW (over_18). */
  nsfw: boolean;
}

interface RawChild {
  kind?: string;
  data?: {
    name?: string;
    id?: string;
    title?: string;
    subreddit?: string;
    permalink?: string;
    author?: string;
    score?: number;
    created_utc?: number;
    over_18?: boolean;
  };
}

interface RawListing {
  data?: { children?: RawChild[] };
}

/**
 * Normalizes a raw Reddit listing into RedditPost[]. Pure — safe to unit test.
 * Drops entries without a usable id/permalink.
 */
export function normalizeListing(json: unknown): RedditPost[] {
  const listing = json as RawListing;
  const children = listing?.data?.children ?? [];
  const out: RedditPost[] = [];
  for (const child of children) {
    const d = child?.data;
    if (!d) continue;
    const id = d.name ?? (d.id ? `t3_${d.id}` : undefined);
    if (!id || !d.permalink) continue;
    out.push({
      id,
      title: d.title ?? "(sin título)",
      subreddit: d.subreddit ?? "",
      permalink: `https://www.reddit.com${d.permalink}`,
      author: d.author ?? "",
      score: typeof d.score === "number" ? d.score : 0,
      created: typeof d.created_utc === "number" ? d.created_utc : 0,
      nsfw: d.over_18 === true,
    });
  }
  return out;
}

export interface SearchOptions {
  timeWindow?: string; // hour|day|week
  limit?: number;
  restrictSubreddit?: string;
}

/** Builds the search URL (pure — testable). */
export function buildSearchUrl(query: string, opts: SearchOptions = {}): string {
  const base = opts.restrictSubreddit
    ? `${API_BASE}/r/${opts.restrictSubreddit}/search`
    : `${API_BASE}/search`;
  const params = new URLSearchParams({
    q: query,
    sort: "new",
    limit: String(opts.limit ?? 25),
    t: opts.timeWindow ?? "day",
    type: "link",
    restrict_sr: opts.restrictSubreddit ? "true" : "false",
    include_over_18: "false",
  });
  return `${base}?${params.toString()}`;
}

export async function getAppToken(
  clientId: string,
  clientSecret: string,
  userAgent: string,
  timeoutMs = 10_000
): Promise<string> {
  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`Reddit token request failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Reddit token response missing access_token");
  }
  return data.access_token;
}

export async function searchReddit(
  token: string,
  userAgent: string,
  query: string,
  opts: SearchOptions = {},
  timeoutMs = 10_000
): Promise<RedditPost[]> {
  const res = await fetch(buildSearchUrl(query, opts), {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent,
    },
  });
  if (!res.ok) {
    throw new Error(`Reddit search failed (${res.status}) for "${query}": ${await res.text()}`);
  }
  return normalizeListing(await res.json());
}
