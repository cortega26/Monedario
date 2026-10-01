// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class ImageObserver {
  static current: ImageObserver;
  disconnected = false;
  targets: Element[] = [];
  constructor(private callback: IntersectionObserverCallback) {
    ImageObserver.current = this;
  }
  observe(target: Element) {
    this.targets.push(target);
  }
  disconnect() {
    this.disconnected = true;
  }
  emit(target: Element, ratio: number) {
    this.callback(
      [
        {
          target,
          isIntersecting: ratio > 0,
          intersectionRatio: ratio,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver
    );
  }
}

let installed = false;
let visibility: DocumentVisibilityState;
let rect: DOMRect;
let image: HTMLImageElement;
let anchor: HTMLAnchorElement;

function imageEvents() {
  return (window.dataLayer ?? []).filter(
    (entry: unknown) =>
      typeof entry === "object" &&
      entry !== null &&
      "event" in entry &&
      String(entry.event).startsWith("editorial_image_")
  ) as Array<{ event: string; image_version: string; device_class: string }>;
}

beforeEach(async () => {
  vi.useFakeTimers();
  visibility = "visible";
  vi.spyOn(document, "visibilityState", "get").mockImplementation(
    () => visibility
  );
  vi.stubGlobal("IntersectionObserver", ImageObserver);
  window.requestIdleCallback = callback =>
    window.setTimeout(
      () => callback({ didTimeout: false, timeRemaining: () => 0 }),
      0
    );
  document.body.innerHTML = `<main data-analytics-page-type="home"><a href="/posts/que-es-la-uf/" data-image-version="12345678abcdefab" data-image-article="que-es-la-uf" data-image-surface="article_card"><img src="/image.avif" alt=""><span>UF</span></a></main>`;
  anchor = document.querySelector("a")!;
  image = document.querySelector("img")!;
  rect = new DOMRect(0, 0, 300, 157);
  vi.spyOn(image, "getBoundingClientRect").mockImplementation(() => rect);
  Object.defineProperties(image, {
    complete: { get: () => true, configurable: true },
    naturalWidth: { get: () => 1200, configurable: true },
  });
  window.dataLayer = [];
  document.documentElement.removeAttribute("data-analytics-transport");
  if (!installed) {
    await import("../../src/scripts/analytics");
    installed = true;
  } else document.dispatchEvent(new Event("astro:page-load"));
  await vi.advanceTimersByTimeAsync(0);
});

afterEach(() => {
  document.dispatchEvent(new Event("astro:before-swap"));
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("editorial image exposure", () => {
  it("requires 50% visibility continuously for a second, then deduplicates by view", async () => {
    const observer = ImageObserver.current;
    observer.emit(image, 0.49);
    await vi.advanceTimersByTimeAsync(1100);
    expect(imageEvents()).toHaveLength(0);
    observer.emit(image, 0.5);
    await vi.advanceTimersByTimeAsync(600);
    observer.emit(image, 0.1);
    observer.emit(image, 0.5);
    await vi.advanceTimersByTimeAsync(999);
    expect(imageEvents()).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(imageEvents()).toMatchObject([
      {
        event: "editorial_image_impression",
        image_version: "img-1234-5678-abcd-efab",
      },
    ]);
    document.dispatchEvent(new Event("astro:after-swap"));
    document.dispatchEvent(new Event("astro:page-load"));
    await vi.advanceTimersByTimeAsync(0);
    expect(ImageObserver.current).toBe(observer);
    observer.emit(image, 0.8);
    await vi.advanceTimersByTimeAsync(2000);
    expect(imageEvents()).toHaveLength(1);
  });

  it("cancels dwell while hidden and starts a fresh dwell on return", async () => {
    ImageObserver.current.emit(image, 0.8);
    await vi.advanceTimersByTimeAsync(600);
    visibility = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(2000);
    expect(imageEvents()).toHaveLength(0);
    visibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(999);
    expect(imageEvents()).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(imageEvents()).toHaveLength(1);
  });

  it("pairs fast visible clicks with exposure and deduplicates clicks", () => {
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(imageEvents().map(event => event.event)).toEqual([
      "editorial_image_impression",
      "editorial_image_click",
    ]);
  });

  it("does not attribute an offscreen, never-exposed image to a title click", () => {
    rect = new DOMRect(0, -1000, 300, 157);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(imageEvents()).toHaveLength(0);
  });

  it("does not count unloaded images and disconnects pending dwell before navigation", async () => {
    Object.defineProperty(image, "naturalWidth", {
      get: () => 0,
      configurable: true,
    });
    ImageObserver.current.emit(image, 1);
    await vi.advanceTimersByTimeAsync(1100);
    expect(imageEvents()).toHaveLength(0);
    Object.defineProperty(image, "naturalWidth", {
      get: () => 1200,
      configurable: true,
    });
    image.dispatchEvent(new Event("load"));
    const observer = ImageObserver.current;
    document.dispatchEvent(new Event("astro:before-swap"));
    await vi.advanceTimersByTimeAsync(2000);
    expect(observer.disconnected).toBe(true);
    expect(imageEvents()).toHaveLength(0);
  });
});
