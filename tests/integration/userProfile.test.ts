import { beforeEach, describe, expect, it } from "vitest";

import {
  PROFILE_SCHEMA_VERSION,
  PROFILE_STORAGE_KEY,
  clearProfile,
  getProfile,
  isKnownProfileField,
  updateProfile,
} from "@/utils/userProfile";

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

describe("userProfile", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = installLocalStorage();
  });

  it("returns an empty profile when localStorage is empty", () => {
    const profile = getProfile();
    expect(profile.v).toBe(PROFILE_SCHEMA_VERSION);
    expect(profile.sueldoImponible).toBeUndefined();
  });

  it("round-trips a patch through update + get", () => {
    updateProfile({ sueldoImponible: 1_200_000, afpId: "habitat" });
    const profile = getProfile();
    expect(profile.sueldoImponible).toBe(1_200_000);
    expect(profile.afpId).toBe("habitat");
    expect(profile.ts).toBeGreaterThan(0);
  });

  it("discards stored data when the schema version does not match", () => {
    storage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ v: 999, sueldoImponible: 5_000_000 })
    );
    const profile = getProfile();
    expect(profile.sueldoImponible).toBeUndefined();
    expect(profile.v).toBe(PROFILE_SCHEMA_VERSION);
  });

  it("ignores unknown fields on write", () => {
    updateProfile({
      sueldoImponible: 900_000,
      bogus: 42,
    } as unknown as Parameters<typeof updateProfile>[0]);
    const profile = getProfile();
    expect(profile.sueldoImponible).toBe(900_000);
    expect(
      (profile as unknown as Record<string, unknown>).bogus
    ).toBeUndefined();
  });

  it("removes a field when its value is cleared", () => {
    updateProfile({ sueldoImponible: 800_000 });
    updateProfile({ sueldoImponible: undefined });
    expect(getProfile().sueldoImponible).toBeUndefined();
  });

  it("clears the entire profile", () => {
    updateProfile({ sueldoImponible: 1_000_000 });
    clearProfile();
    expect(storage.getItem(PROFILE_STORAGE_KEY)).toBeNull();
    expect(getProfile().sueldoImponible).toBeUndefined();
  });

  it("recognizes catalog field names and rejects unknown ones", () => {
    expect(isKnownProfileField("sueldoImponible")).toBe(true);
    expect(isKnownProfileField("apvRegimenBAnual")).toBe(true);
    expect(isKnownProfileField("totallyMadeUpField")).toBe(false);
  });
});
