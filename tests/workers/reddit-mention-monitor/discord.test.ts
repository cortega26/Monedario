import { afterEach, describe, expect, it, vi } from "vitest";
import {
  postAlert,
  type Match,
} from "../../../workers/reddit-mention-monitor/src/discord";

afterEach(() => vi.unstubAllGlobals());

function makeMatches(count: number): Match[] {
  return Array.from({ length: count }, (_, index) => ({
    post: {
      id: `t3_${index}`,
      title: `Post ${index}`,
      subreddit: "chile",
      permalink: "https://example.com/post",
      author: "example-user",
      score: 10,
      created: 0,
      nsfw: false,
    },
    calculator: "https://monedario.cl/calculadoras/sueldo-liquido/",
    calculatorLabel: "Sueldo líquido",
  }));
}

describe("postAlert", () => {
  it("reports every match delivered when all batches succeed", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await postAlert("https://example.com/webhook", makeMatches(12));

    expect(result.delivered).toHaveLength(12);
    expect(result.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reports only completed batches when a later batch fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await postAlert("https://example.com/webhook", makeMatches(15));

    expect(result.delivered).toHaveLength(10);
    expect(result.error).toBeInstanceOf(Error);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not fetch when there are no matches", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(postAlert("https://example.com/webhook", [])).resolves.toEqual({
      delivered: [],
      error: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
