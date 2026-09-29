import type { Page } from "@playwright/test";

export interface CapturedRequest {
  url: string;
  method: string;
  body: string | null;
}

export function startRequestCapture(page: Page): CapturedRequest[] {
  const captured: CapturedRequest[] = [];
  page.on("request", request => {
    captured.push({
      url: request.url(),
      method: request.method(),
      body: request.postData(),
    });
  });
  return captured;
}

export function requestsContaining(
  requests: CapturedRequest[],
  needle: string
): CapturedRequest[] {
  return requests.filter(
    request =>
      request.url.includes(needle) || (request.body ?? "").includes(needle)
  );
}

// Cloudflare Web Analytics es la única excepción declarada (beacon edge,
// cookieless); cualquier otro origen externo es un fallo del test.
const ALLOWED_EXTERNAL_HOSTS = new Set(["static.cloudflareinsights.com"]);

export function disallowedThirdPartyRequests(
  requests: CapturedRequest[],
  pageHost: string
): CapturedRequest[] {
  return requests.filter(request => {
    try {
      const host = new URL(request.url).hostname;
      return host !== pageHost && !ALLOWED_EXTERNAL_HOSTS.has(host);
    } catch {
      return true;
    }
  });
}

export async function readWebStorage(page: Page): Promise<string> {
  return page.evaluate(() => {
    const all: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      all[`local:${key}`] = localStorage.getItem(key) ?? "";
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)!;
      all[`session:${key}`] = sessionStorage.getItem(key) ?? "";
    }
    return JSON.stringify(all);
  });
}

export function randomAmount(): string {
  return String(Math.floor(100_000 + Math.random() * 9_000_000));
}
