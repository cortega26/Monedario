import { readFileSync } from "node:fs";

// Single source of truth for editorial review cadence, shared by
// check-editorial-timeliness.mjs (enforcement) and compute-review-policies.mjs
// (informational frontmatter). Keeping the resolution logic in one place
// prevents the two from drifting apart, as happened when
// compute-review-policies.mjs carried its own hardcoded category cadence map.
export const EDITORIAL_TIMELINESS_SOURCE_MODES = new Set([
  "manual_review",
  "manual_review_with_official_sources",
  "runtime_snapshot_plus_editorial_review",
  "evergreen",
]);

function validateSemantics(semantics) {
  if (semantics === undefined) return;
  if (semantics === null || typeof semantics !== "object" || Array.isArray(semantics)) {
    throw new Error("editorial timeliness policy semantics must be an object when present.");
  }
  if (semantics.notVerification !== true) {
    throw new Error(
      'editorial timeliness policy semantics must declare notVerification: true (stale=0 does not certify veracity).'
    );
  }
  if (typeof semantics.staleMeans !== "string" || semantics.staleMeans.trim().length === 0) {
    throw new Error("editorial timeliness policy semantics requires a non-empty staleMeans.");
  }
  if (typeof semantics.statement !== "string" || semantics.statement.trim().length < 40) {
    throw new Error(
      "editorial timeliness policy semantics requires a statement of at least 40 characters."
    );
  }
  if (
    !Array.isArray(semantics.veracitySignals) ||
    semantics.veracitySignals.length === 0 ||
    semantics.veracitySignals.some(
      signal => typeof signal !== "string" || signal.trim().length === 0
    )
  ) {
    throw new Error(
      "editorial timeliness policy semantics requires a non-empty veracitySignals array of strings."
    );
  }
}

function validateHardFacts(hardFacts) {
  if (hardFacts === undefined) return;
  if (hardFacts === null || typeof hardFacts !== "object" || Array.isArray(hardFacts)) {
    throw new Error("editorial timeliness policy hardFacts must be an object when present.");
  }
  for (const [id, fact] of Object.entries(hardFacts)) {
    if (!fact || typeof fact !== "object" || Array.isArray(fact)) {
      throw new Error(`hardFacts "${id}" must be an object.`);
    }
    for (const field of ["label", "owner", "verification"]) {
      if (typeof fact[field] !== "string" || fact[field].trim().length === 0) {
        throw new Error(`hardFacts "${id}" requires a non-empty ${field}.`);
      }
    }
    const hasCadence = Number.isInteger(fact.cadenceDays) && fact.cadenceDays > 0;
    const hasDataset = typeof fact.dataset === "string" && fact.dataset.trim().length > 0;
    const hasAuditRounds = Array.isArray(fact.auditRounds) && fact.auditRounds.length > 0;
    if (!hasCadence && !hasDataset && !hasAuditRounds) {
      throw new Error(
        `hardFacts "${id}" requires cadenceDays > 0, a dataset reference, or auditRounds.`
      );
    }
  }
}

export function loadEditorialTimelinessPolicy(policyPath) {
  const raw = JSON.parse(readFileSync(policyPath, "utf8"));
  if (!Number.isInteger(raw.defaultCadenceDays) || raw.defaultCadenceDays <= 0) {
    throw new Error("editorial timeliness policy requires defaultCadenceDays > 0.");
  }
  if (!EDITORIAL_TIMELINESS_SOURCE_MODES.has(raw.defaultSourceMode)) {
    throw new Error(`Unknown defaultSourceMode "${raw.defaultSourceMode}".`);
  }
  if (raw.defaultSourceMode === "evergreen") {
    throw new Error(
      '"evergreen" sourceMode is not allowed as defaultSourceMode; it must be set per-slug via slugOverrides.'
    );
  }
  for (const [category, policy] of Object.entries(raw.categoryPolicies ?? {})) {
    if (!Number.isInteger(policy.cadenceDays) || policy.cadenceDays <= 0) {
      throw new Error(`Category "${category}" requires cadenceDays > 0.`);
    }
    if (!EDITORIAL_TIMELINESS_SOURCE_MODES.has(policy.sourceMode)) {
      throw new Error(`Category "${category}" has unknown sourceMode "${policy.sourceMode}".`);
    }
    if (policy.sourceMode === "evergreen") {
      throw new Error(
        `Category "${category}" cannot use "evergreen" sourceMode; use a slugOverride instead.`
      );
    }
  }
  for (const [slug, override] of Object.entries(raw.slugOverrides ?? {})) {
    if (
      override.cadenceDays !== undefined &&
      (!Number.isInteger(override.cadenceDays) || override.cadenceDays <= 0)
    ) {
      throw new Error(`Slug override "${slug}" requires cadenceDays > 0 when present.`);
    }
    if (override.sourceMode && !EDITORIAL_TIMELINESS_SOURCE_MODES.has(override.sourceMode)) {
      throw new Error(`Slug override "${slug}" has unknown sourceMode "${override.sourceMode}".`);
    }
  }
  validateSemantics(raw.semantics);
  validateHardFacts(raw.hardFacts);
  return raw;
}

export function resolveEditorialTimelinessPolicy(frontmatter, slug, policy) {
  const categoryPolicy = policy.categoryPolicies?.[frontmatter.category] ?? {};
  const slugOverride = policy.slugOverrides?.[slug] ?? {};

  const cadenceDays =
    slugOverride.cadenceDays ?? categoryPolicy.cadenceDays ?? policy.defaultCadenceDays;

  const policySource =
    slugOverride.cadenceDays !== undefined || slugOverride.sourceMode !== undefined
      ? `slugOverrides.${slug}`
      : categoryPolicy.cadenceDays !== undefined || categoryPolicy.sourceMode !== undefined
        ? `categoryPolicies.${frontmatter.category}`
        : "defaultPolicy";

  return {
    cadenceDays,
    sourceMode: slugOverride.sourceMode ?? categoryPolicy.sourceMode ?? policy.defaultSourceMode,
    policySource,
  };
}
