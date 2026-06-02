import { describe, expect, it } from "vitest";
import {
  buildSearchUrl,
  normalizeListing,
  type RedditPost,
} from "../../../workers/reddit-mention-monitor/src/redditClient";

describe("normalizeListing", () => {
  it("normalizes a real-shape listing and derives fullname id", () => {
    const json = {
      data: {
        children: [
          {
            kind: "t3",
            data: {
              name: "t3_abc123",
              title: "¿Cuál AFP tiene la comisión más baja?",
              subreddit: "chile",
              permalink: "/r/chile/comments/abc123/afp/",
              author: "user1",
              score: 12,
              created_utc: 1_716_000_000,
              over_18: false,
            },
          },
          {
            // missing `name` but has `id` → id derived as t3_<id>
            kind: "t3",
            data: {
              id: "def456",
              title: "UF a pesos hoy",
              subreddit: "merval",
              permalink: "/r/merval/comments/def456/uf/",
              score: 3,
            },
          },
        ],
      },
    };
    const posts = normalizeListing(json);
    expect(posts).toHaveLength(2);
    expect(posts[0].id).toBe("t3_abc123");
    expect(posts[0].permalink).toBe("https://www.reddit.com/r/chile/comments/abc123/afp/");
    expect(posts[1].id).toBe("t3_def456");
    expect(posts[1].author).toBe("");
    expect(posts[1].nsfw).toBe(false);
  });

  it("drops entries without id or permalink, and tolerates empty input", () => {
    const json = { data: { children: [{ data: { title: "no id no permalink" } }] } };
    expect(normalizeListing(json)).toEqual([]);
    expect(normalizeListing({})).toEqual([]);
    expect(normalizeListing(null)).toEqual([]);
  });

  it("flags NSFW posts", () => {
    const json = {
      data: {
        children: [
          { data: { name: "t3_x", title: "x", permalink: "/r/x/comments/x/", over_18: true } },
        ],
      },
    };
    expect(normalizeListing(json)[0].nsfw).toBe(true);
  });
});

describe("buildSearchUrl", () => {
  it("builds an all-Reddit search with defaults", () => {
    const url = new URL(buildSearchUrl("comisión afp"));
    expect(url.origin + url.pathname).toBe("https://oauth.reddit.com/search");
    expect(url.searchParams.get("q")).toBe("comisión afp");
    expect(url.searchParams.get("sort")).toBe("new");
    expect(url.searchParams.get("restrict_sr")).toBe("false");
    expect(url.searchParams.get("include_over_18")).toBe("false");
  });

  it("restricts to a subreddit when given", () => {
    const url = new URL(buildSearchUrl("uf", { restrictSubreddit: "chile", limit: 10, timeWindow: "week" }));
    expect(url.pathname).toBe("/r/chile/search");
    expect(url.searchParams.get("restrict_sr")).toBe("true");
    expect(url.searchParams.get("limit")).toBe("10");
    expect(url.searchParams.get("t")).toBe("week");
  });
});

// Type sanity: RedditPost shape is exercised above; keep a reference so unused
// import lint stays clean if the suite is trimmed.
const _sample: RedditPost = {
  id: "t3_x",
  title: "x",
  subreddit: "x",
  permalink: "x",
  author: "x",
  score: 0,
  created: 0,
  nsfw: false,
};
void _sample;
