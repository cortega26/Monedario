// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PROFILE_STORAGE_KEY } from "../../src/utils/userProfile";

function seedProfile(patch: Record<string, unknown>): void {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({ v: 1, ts: Date.now(), ...patch })
  );
}

function readStored(): Record<string, unknown> {
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

function bindInput(name: string): HTMLInputElement {
  const el = document.querySelector<HTMLInputElement>(
    `[data-profile-bind='${name}']`
  );
  if (!el) throw new Error(`missing bound input: ${name}`);
  return el;
}

async function typeAndFlush(
  input: HTMLInputElement,
  value: string
): Promise<void> {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await vi.runOnlyPendingTimersAsync();
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

  it("stores native number-input values without Chilean regrouping", async () => {
    document.body.innerHTML = `
      <main data-analytics-page-type="calculator">
        <input type="number" data-profile-bind="sueldoImponible" />
        <input type="number" data-profile-bind="isapreAdicionalPct" />
      </main>
    `;

    await import("../../src/scripts/calculator-prefill");
    await vi.runOnlyPendingTimersAsync();

    const sueldo = bindInput("sueldoImponible");
    const isapre = bindInput("isapreAdicionalPct");

    await typeAndFlush(isapre, "2.5");
    expect(readStored().isapreAdicionalPct).toBe(2.5);

    await typeAndFlush(sueldo, "1500000");
    expect(readStored().sueldoImponible).toBe(1500000);

    await typeAndFlush(sueldo, "1.5e6");
    expect(readStored().sueldoImponible).toBe(1500000);

    // A legitimate zero must survive as zero, not as "empty".
    await typeAndFlush(isapre, "0");
    expect(readStored().isapreAdicionalPct).toBe(0);
    expect("isapreAdicionalPct" in readStored()).toBe(true);
  });

  it("does not store NaN, Infinity or a false zero for empty/unreadable number inputs", async () => {
    document.body.innerHTML = `
      <main data-analytics-page-type="calculator">
        <input type="number" data-profile-bind="isapreAdicionalPct" />
      </main>
    `;
    seedProfile({ isapreAdicionalPct: 2 });

    await import("../../src/scripts/calculator-prefill");
    await vi.runOnlyPendingTimersAsync();

    const input = bindInput("isapreAdicionalPct");
    // Seeded value restores into the empty field on reopen.
    expect(input.value).toBe("2");

    await typeAndFlush(input, "");
    expect("isapreAdicionalPct" in readStored()).toBe(false);

    await typeAndFlush(input, "abc");
    expect("isapreAdicionalPct" in readStored()).toBe(false);
    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).not.toMatch(
      /NaN|Infinity/
    );
  });

  it("keeps Chilean parsing for text inputs", async () => {
    document.body.innerHTML = `
      <main data-analytics-page-type="calculator">
        <input type="text" data-profile-bind="sueldoImponible" />
      </main>
    `;

    await import("../../src/scripts/calculator-prefill");
    await vi.runOnlyPendingTimersAsync();

    const input = bindInput("sueldoImponible");

    await typeAndFlush(input, "1.500.000");
    expect(readStored().sueldoImponible).toBe(1500000);

    await typeAndFlush(input, "1.500,25");
    expect(readStored().sueldoImponible).toBe(1500.25);
  });

  it("restores saved select/radio values and leaves non-empty defaults intact", async () => {
    document.body.innerHTML = `
      <main data-analytics-page-type="calculator">
        <input data-profile-bind="sueldoImponible" />
        <input type="number" data-profile-bind="isapreAdicionalPct" value="2" />
        <select data-profile-bind="afpId">
          <option value=""></option>
          <option value="capital">Capital</option>
        </select>
        <input type="radio" name="salud" value="fonasa" data-profile-bind="saludRegimen" />
        <input type="radio" name="salud" value="isapre" data-profile-bind="saludRegimen" />
      </main>
    `;
    seedProfile({
      sueldoImponible: 1200000,
      isapreAdicionalPct: 7,
      afpId: "capital",
      saludRegimen: "isapre",
    });

    await import("../../src/scripts/calculator-prefill");
    await vi.runOnlyPendingTimersAsync();

    expect(bindInput("sueldoImponible").value).toBe("1200000");
    // Non-empty default stays intact even though the profile holds another value.
    expect(bindInput("isapreAdicionalPct").value).toBe("2");
    const select = document.querySelector<HTMLSelectElement>(
      "[data-profile-bind='afpId']"
    );
    expect(select?.value).toBe("capital");
    const checked = document.querySelector<HTMLInputElement>(
      "input[name='salud']:checked"
    );
    expect(checked?.value).toBe("isapre");
    expect(document.getElementById("profile-prefill-hint")).not.toBeNull();
  });
});
