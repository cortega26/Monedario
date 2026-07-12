// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PROFILE_STORAGE_KEY } from "../../src/utils/userProfile";

function seedProfile(patch: Record<string, unknown>): void {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({ v: 1, ts: Date.now(), ...patch })
  );
}

describe("calculator prefill hint", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    document.body.innerHTML = "";
    localStorage.clear();
    window.requestIdleCallback = callback =>
      window.setTimeout(
        () => callback({ didTimeout: false, timeRemaining: () => 0 }),
        0
      );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete (window as unknown as { requestIdleCallback?: unknown })
      .requestIdleCallback;
    localStorage.clear();
  });

  it("appends the hint to document.body as a fixed, status-role toast when a field is prefilled", async () => {
    document.body.innerHTML = `
      <main data-analytics-page-type="calculator">
        <input data-profile-bind="sueldoImponible" />
      </main>
    `;
    seedProfile({ sueldoImponible: 1200000 });

    await import("../../src/scripts/calculator-prefill");
    await vi.runOnlyPendingTimersAsync();

    const hint = document.getElementById("profile-prefill-hint");
    expect(hint).not.toBeNull();
    // Structural assertion: the hint's parent must be document.body, not the
    // input's container — this is what actually verifies the CLS fix (the
    // old code prepended into a host element inside <main>).
    expect(hint?.parentElement).toBe(document.body);
    expect(hint?.classList.contains("fixed")).toBe(true);
    expect(hint?.getAttribute("role")).toBe("status");
  });

  it("removes the hint and clears the prefilled input when 'Limpiar' is clicked", async () => {
    document.body.innerHTML = `
      <main data-analytics-page-type="calculator">
        <input data-profile-bind="sueldoImponible" />
      </main>
    `;
    seedProfile({ sueldoImponible: 1200000 });

    await import("../../src/scripts/calculator-prefill");
    await vi.runOnlyPendingTimersAsync();

    const input = document.querySelector<HTMLInputElement>(
      "[data-profile-bind='sueldoImponible']"
    );
    expect(input?.dataset.profilePrefilled).toBe("true");
    expect(document.getElementById("profile-prefill-hint")).not.toBeNull();

    document.getElementById("profile-prefill-clear")?.click();

    expect(document.getElementById("profile-prefill-hint")).toBeNull();
    expect(input?.dataset.profilePrefilled).toBeUndefined();
  });

  it("does not create a hint when no saved profile matches a bound field", async () => {
    document.body.innerHTML = `
      <main data-analytics-page-type="calculator">
        <input data-profile-bind="sueldoImponible" />
      </main>
    `;
    // localStorage is empty (cleared in beforeEach) — no matching profile.

    await import("../../src/scripts/calculator-prefill");
    await vi.runOnlyPendingTimersAsync();

    expect(document.getElementById("profile-prefill-hint")).toBeNull();
  });
});
