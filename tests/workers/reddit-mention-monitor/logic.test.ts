import { describe, expect, it } from "vitest";
import { buildEmbed, chunkEmbeds, type Match } from "../../../workers/reddit-mention-monitor/src/discord";
import { filterUnseen } from "../../../workers/reddit-mention-monitor/src/dedup";
import { passesFilter } from "../../../workers/reddit-mention-monitor/src/index";
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
