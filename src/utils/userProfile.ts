// User profile persisted in localStorage to share inputs across calculators.
// Authoritative spec: docs/adr/ADR-20260416-calculator-profile-persistence.md
// Schema field catalog: docs/backlog/PHASE_1_PROFILE_PERSISTENCE.md

const STORAGE_KEY = "monedario_profile";
const SCHEMA_VERSION = 1 as const;

export type SaludRegimen = "fonasa" | "isapre";
export type ContratoTipo = "indefinido" | "plazo-fijo" | "obra";

export interface UserProfileV1 {
  v: typeof SCHEMA_VERSION;
  ts: number;
  sueldoImponible?: number;
  afpId?: string;
  saludRegimen?: SaludRegimen;
  isapreAdicionalPct?: number;
  contratoTipo?: ContratoTipo;
  gratificacion?: number;
  horasExtra?: number;
  apvRegimenBAnual?: number;
  time_horizon?: "short-term" | "medium-term" | "long-term";
  has_emergency_fund?: "yes" | "no";
  primary_goal?: "liquidity" | "inflation" | "growth" | "tax-benefit";
  intent_mode?: "learn" | "calculate";
}

export type UserProfileField = Exclude<keyof UserProfileV1, "v" | "ts">;

const KNOWN_FIELDS: ReadonlySet<UserProfileField> = new Set([
  "sueldoImponible",
  "afpId",
  "saludRegimen",
  "isapreAdicionalPct",
  "contratoTipo",
  "gratificacion",
  "horasExtra",
  "apvRegimenBAnual",
  "time_horizon",
  "has_emergency_fund",
  "primary_goal",
  "intent_mode",
]);

export function isKnownProfileField(name: string): name is UserProfileField {
  return KNOWN_FIELDS.has(name as UserProfileField);
}

function emptyProfile(): UserProfileV1 {
  return { v: SCHEMA_VERSION, ts: 0 };
}

function readRaw(): UserProfileV1 {
  if (typeof localStorage === "undefined") return emptyProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw) as Partial<UserProfileV1> | null;
    if (!parsed || parsed.v !== SCHEMA_VERSION) return emptyProfile();
    const clean = emptyProfile();
    if (typeof parsed.ts === "number" && Number.isFinite(parsed.ts)) {
      clean.ts = parsed.ts;
    }
    for (const [key, value] of Object.entries(parsed)) {
      if (!isKnownProfileField(key)) continue;
      (clean as unknown as Record<string, unknown>)[key] = value;
    }
    return clean;
  } catch {
    return emptyProfile();
  }
}

function writeRaw(profile: UserProfileV1): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Quota exceeded, private mode, etc. — silent degrade.
  }
}

export function getProfile(): UserProfileV1 {
  return readRaw();
}

export type ProfilePatch = Partial<Omit<UserProfileV1, "v" | "ts">>;

export function updateProfile(patch: ProfilePatch): UserProfileV1 {
  const current = readRaw();
  const next: UserProfileV1 = { ...current, v: SCHEMA_VERSION, ts: Date.now() };
  const mutable = next as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    if (!isKnownProfileField(key)) continue;
    if (value === undefined || value === null || value === "") {
      delete mutable[key];
      continue;
    }
    mutable[key] = value;
  }
  writeRaw(next);
  return next;
}

export function clearProfile(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent degrade.
  }
}

export const PROFILE_STORAGE_KEY = STORAGE_KEY;
export const PROFILE_SCHEMA_VERSION = SCHEMA_VERSION;
export const PROFILE_FIELDS = [...KNOWN_FIELDS];
