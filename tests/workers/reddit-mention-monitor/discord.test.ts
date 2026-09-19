import { afterEach, describe, expect, it, vi } from "vitest";
import {
  parseRetryAfterMs,
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

  it("honors Retry-After once: waits, retries the batch, and delivers", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("rate limited", { status: 429, headers: { "Retry-After": "2" } })
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const sleep = vi.fn(async () => {});

    const result = await postAlert(
      "https://example.com/webhook",
      makeMatches(3),
      10_000,
      sleep
    );

    expect(result.delivered).toHaveLength(3);
    expect(result.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(2000);
  });

  it("gives up the batch to the next cron when the retry also fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("slow down", { status: 429, headers: { "Retry-After": "0" } })
      )
      .mockResolvedValueOnce(
        new Response("still limited", { status: 429, headers: { "Retry-After": "5" } })
      );
    vi.stubGlobal("fetch", fetchMock);
    const sleep = vi.fn(async () => {});

    const result = await postAlert(
      "https://example.com/webhook",
      makeMatches(12),
      10_000,
      sleep
    );

    expect(result.delivered).toHaveLength(0);
    expect(result.error).toBeInstanceOf(Error);
    // One initial attempt + exactly one Retry-After retry, then stop.
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it("retries a 5xx once when Retry-After is present, then delivers", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("bad gateway", { status: 502, headers: { "Retry-After": "1" } })
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const sleep = vi.fn(async () => {});

    const result = await postAlert(
      "https://example.com/webhook",
      makeMatches(3),
      10_000,
      sleep
    );

    expect(result.delivered).toHaveLength(3);
    expect(result.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(1000);
  });

  it("fails a 5xx batch without Retry-After with no sleep (stop preserved)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    const sleep = vi.fn(async () => {});

    const result = await postAlert(
      "https://example.com/webhook",
      makeMatches(3),
      10_000,
      sleep
    );

    expect(result.delivered).toHaveLength(0);
    expect(result.error).toBeInstanceOf(Error);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });
});

describe("parseRetryAfterMs", () => {
  it("returns null when absent or unparsable", () => {
    expect(parseRetryAfterMs(null)).toBeNull();
    expect(parseRetryAfterMs("not-a-number")).toBeNull();
    expect(parseRetryAfterMs("-3")).toBeNull();
  });

  it("converts delay-seconds to milliseconds", () => {
    expect(parseRetryAfterMs("2")).toBe(2000);
    expect(parseRetryAfterMs("0")).toBe(0);
  });

  it("caps very large values to protect the worker budget", () => {
    expect(parseRetryAfterMs("3600")).toBe(30_000);
  });
});
