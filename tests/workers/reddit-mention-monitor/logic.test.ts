import { afterEach, describe, expect, it, vi } from "vitest";
import { buildEmbed, chunkEmbeds, type Match } from "../../../workers/reddit-mention-monitor/src/discord";
import { filterUnseen } from "../../../workers/reddit-mention-monitor/src/dedup";
import {
  DEFAULT_MIN_SCORE,
  DEFAULT_SEARCH_LIMIT,
  parseMonitorConfig,
  passesFilter,
} from "../../../workers/reddit-mention-monitor/src/index";
import { SUBREDDIT_SCOPE, TARGET_SUBREDDITS } from "../../../workers/reddit-mention-monitor/src/keywords";
import type { RedditPost } from "../../../workers/reddit-mention-monitor/src/redditClient";

function post(overrides: Partial<RedditPost> = {}): RedditPost {
  return {
    id: "t3_a",
    title: "¿Cuánto descuenta la AFP?",
    subreddit: "chile",
    permalink: "https://www.reddit.com/r/chile/comments/a/",
    author: "u",
    score: 5,
    created: 0,
    nsfw: false,
    ...overrides,
  };
}

describe("SUBREDDIT_SCOPE", () => {
  it("joins every target subreddit with '+' for a single restrict_sr search", () => {
    expect(SUBREDDIT_SCOPE).toBe(TARGET_SUBREDDITS.join("+"));
    expect(SUBREDDIT_SCOPE).toContain("chile");
    expect(SUBREDDIT_SCOPE.split("+")).toHaveLength(TARGET_SUBREDDITS.length);
  });
});

describe("passesFilter", () => {
  it("rejects NSFW regardless of score", () => {
    expect(passesFilter(post({ nsfw: true, score: 999 }), 0)).toBe(false);
  });
  it("rejects below the score floor", () => {
    expect(passesFilter(post({ score: 2 }), 5)).toBe(false);
    expect(passesFilter(post({ score: 5 }), 5)).toBe(true);
  });
});

describe("buildEmbed", () => {
  it("links the post and suggests the calculator", () => {
    const match: Match = {
      post: post(),
      calculator: "https://monedario.cl/calculadoras/comisiones-afp/",
      calculatorLabel: "Comparador de comisiones AFP",
    };
    const embed = buildEmbed(match);
    expect(embed.url).toBe(match.post.permalink);
    expect(embed.title).toContain("AFP");
    expect(embed.fields[0].value).toContain(match.calculator);
    expect(embed.description).toContain("r/chile");
  });

  it("truncates very long titles", () => {
    const embed = buildEmbed({
      post: post({ title: "a".repeat(300) }),
      calculator: "x",
      calculatorLabel: "y",
    });
    expect(embed.title.length).toBeLessThanOrEqual(240);
    expect(embed.title.endsWith("…")).toBe(true);
  });
});

describe("chunkEmbeds", () => {
  it("splits into batches of 10", () => {
    const embeds = Array.from({ length: 23 }, (_, i) => ({
      title: String(i),
      url: "x",
      description: "d",
      fields: [],
    }));
    const chunks = chunkEmbeds(embeds);
    expect(chunks.map(c => c.length)).toEqual([10, 10, 3]);
  });
});

describe("parseMonitorConfig", () => {
  afterEach(() => vi.restoreAllMocks());

  function silenceWarn() {
    return vi.spyOn(console, "warn").mockImplementation(() => {});
  }

  it("falls back to safe defaults (with a warn log) for NaN numerics", () => {
    const warn = silenceWarn();
    const config = parseMonitorConfig({ MIN_SCORE: "not-a-number", SEARCH_LIMIT: "NaN" });
    expect(config.minScore).toBe(DEFAULT_MIN_SCORE);
    expect(config.limit).toBe(DEFAULT_SEARCH_LIMIT);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain("config.invalid_min_score");
    expect(warn.mock.calls[1][0]).toContain("config.invalid_search_limit");
  });

  it("falls back for out-of-range SEARCH_LIMIT (below 1 or above 100)", () => {
    silenceWarn();
    expect(parseMonitorConfig({ SEARCH_LIMIT: "0" }).limit).toBe(DEFAULT_SEARCH_LIMIT);
    expect(parseMonitorConfig({ SEARCH_LIMIT: "500" }).limit).toBe(DEFAULT_SEARCH_LIMIT);
    expect(parseMonitorConfig({ SEARCH_LIMIT: "-5" }).limit).toBe(DEFAULT_SEARCH_LIMIT);
  });

  it("falls back for a negative MIN_SCORE", () => {
    silenceWarn();
    expect(parseMonitorConfig({ MIN_SCORE: "-1" }).minScore).toBe(DEFAULT_MIN_SCORE);
  });

  it("passes valid values through (flooring fractional limits)", () => {
    const warn = silenceWarn();
    const config = parseMonitorConfig({ MIN_SCORE: "3", SEARCH_LIMIT: "25.9" });
    expect(config.minScore).toBe(3);
    expect(config.limit).toBe(25);
    expect(warn).not.toHaveBeenCalled();
  });

  it("uses defaults silently when vars are unset", () => {
    const warn = silenceWarn();
    expect(parseMonitorConfig({})).toEqual({
      minScore: DEFAULT_MIN_SCORE,
      limit: DEFAULT_SEARCH_LIMIT,
      timeWindow: "day",
    });
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("filterUnseen", () => {
  // Minimal in-memory KV mock matching the one method filterUnseen uses. Typed
  // structurally (not as KVNamespace) so this test does not need
  // @cloudflare/workers-types, which isn't in the repo tsconfig that astro check uses.
  function fakeKV(seen: Set<string>) {
    return {
      get: async (key: string) => (seen.has(key) ? "seen" : null),
    } as unknown as Parameters<typeof filterUnseen>[0];
  }

  it("keeps only ids not already in KV, preserving order", async () => {
    const kv = fakeKV(new Set(["t3_b"]));
    const posts = [post({ id: "t3_a" }), post({ id: "t3_b" }), post({ id: "t3_c" })];
    const unseen = await filterUnseen(kv, posts);
    expect(unseen.map(p => p.id)).toEqual(["t3_a", "t3_c"]);
  });

  it("returns empty when all seen", async () => {
    const kv = fakeKV(new Set(["t3_a"]));
    expect(await filterUnseen(kv, [post({ id: "t3_a" })])).toEqual([]);
  });
});
