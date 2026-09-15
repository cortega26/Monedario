import { beforeEach, describe, expect, it } from "vitest";

import {
  clearResumeData,
  getResumeData,
  saveCalculatorResult,
  savePageVisit,
} from "@/utils/resumeState";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

function installLocalStorage(): MemoryStorage {
  const stub = new MemoryStorage();
  Object.defineProperty(globalThis, "localStorage", {
    value: stub,
    writable: true,
    configurable: true,
  });
  return stub;
}

// Mirrors the module's STORAGE_KEY ("monedario_resume", not exported).
const KEY = "monedario_resume";

describe("resumeState", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = installLocalStorage();
  });

  it("returns empty defaults when nothing is stored", () => {
    expect(getResumeData()).toEqual({ pages: [] });
  });

  it("round-trips page visits and calculator results", () => {
    savePageVisit("/a/", "A");
    saveCalculatorResult("sueldo-liquido", "Sueldo líquido");
    const data = getResumeData();
    expect(data.pages).toHaveLength(1);
    expect(data.pages[0].url).toBe("/a/");
    expect(data.calculator?.id).toBe("sueldo-liquido");
  });

  it("falls back to empty defaults on corrupted payloads without throwing", () => {
    const raws = [
      '{"pages": "not-an-array"}',
      '{"a": 1}',
      "[1, 2, 3]",
      '"just-a-string"',
      "not-json{",
      '{"pages": [{"url": 42, "title": "B", "ts": 2}]}',
    ];
    for (const raw of raws) {
      storage.setItem(KEY, raw);
      expect(() => getResumeData()).not.toThrow();
      expect(getResumeData()).toEqual({ pages: [] });
    }
  });

  it("drops mistyped entries but keeps well-shaped ones", () => {
    const good = { url: "/a/", title: "A", ts: 1 };
    storage.setItem(
      KEY,
      JSON.stringify({
        pages: [good, { url: 42, title: "B", ts: 2 }, "nope", null],
        calculator: { id: "sueldo-liquido", label: "Sueldo líquido", ts: 3 },
      })
    );
    expect(getResumeData()).toEqual({
      pages: [good],
      calculator: { id: "sueldo-liquido", label: "Sueldo líquido", ts: 3 },
    });
  });

  it("drops a mistyped calculator but keeps well-shaped pages", () => {
    const good = { url: "/a/", title: "A", ts: 1 };
    storage.setItem(
      KEY,
      JSON.stringify({ pages: [good], calculator: { id: 42 } })
    );
    expect(getResumeData()).toEqual({ pages: [good] });
  });

  it("recovers after clearing corrupted data", () => {
    storage.setItem(KEY, '{"pages": "not-an-array"}');
    expect(getResumeData()).toEqual({ pages: [] });
    clearResumeData();
    savePageVisit("/b/", "B");
    expect(getResumeData().pages.map(p => p.url)).toEqual(["/b/"]);
  });
});
