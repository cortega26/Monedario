import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildEditorialPrompt, EDITORIAL_STYLE_VERSION, EDITORIAL_PALETTE } from "./config.mjs";
import { sha256Hex } from "./lib.mjs";

export const DEFAULT_MODEL_PLAN = { provider: "manual", model: "imagegen", quality: "curated", size: "1200x630" };
export const PROMPT_TRACK_LABELS = { A: "Escena cotidiana", B: "Detalle y acción", C: "Objeto o comparación" };

// Metadata concerning images and review dates must not invalidate a brief.
// Body changes are intentionally conservative: semantic equivalence is reviewed,
// never inferred by a keyword selector or silently approved by this function.
export function articleContentHash(frontmatter, body) {
  return sha256Hex(JSON.stringify({
    title: frontmatter.title ?? "",
    description: frontmatter.description ?? "",
    articleLead: frontmatter.articleLead ?? null,
    body: body.replace(/\r\n/g, "\n").trim(),
  }));
}

export function buildArticleSceneId(template, approvedModelId, slug) {
  return `${template}:${approvedModelId}:${slug}`;
}

export function validateBrief(article, brief) {
  const errors = [];
  if (!brief) return ["Missing reviewed brief. Read the article and add its brief to scripts/hero-images/briefs.json; automatic keyword approval is disabled."];
  if (brief.slug !== article.slug) errors.push("Brief slug does not match article.");
  if (brief.styleVersion !== EDITORIAL_STYLE_VERSION) errors.push("Brief styleVersion is outdated.");
  if (brief.review?.status !== "reviewed" || !brief.review?.reviewedBy || !brief.review?.reviewedAt || !brief.review?.method) errors.push("Brief is unreviewed: record an explicit editorial review before building prompts.");
  if (!article.sourceContentHash || brief.sourceContentHash !== article.sourceContentHash) errors.push("Brief is stale: article content changed. Re-read the change, revise the brief and record a new review; do not regenerate automatically.");
  for (const key of ["readerNeed", "editorialPromise", "visualMessage", "scene"]) {
    if (typeof brief[key] !== "string" || !brief[key].trim()) errors.push(`Missing brief.${key}.`);
  }
  for (const key of ["requiredElements", "avoidInterpretations"]) {
    if (!Array.isArray(brief[key]) || !brief[key].length || brief[key].some(value => typeof value !== "string" || !value.trim())) errors.push(`Missing or invalid brief.${key}.`);
  }
  if (brief.generationMethod && !["imagegen", "image-edit", "data-render"].includes(brief.generationMethod)) errors.push("Invalid generationMethod.");
  if (brief.generationMethod === "image-edit") {
    if (!isEditReferencePath(brief.referenceImagePath)) errors.push("image-edit requires a preserved referenceImagePath under scripts/hero-images/references/.");
    if (!/^[a-f0-9]{64}$/.test(brief.referenceImageHash ?? "")) errors.push("image-edit requires referenceImageHash (SHA-256).");
  }
  if (typeof brief.alt !== "string") errors.push("brief.alt must be a string (empty for decorative covers).");
  if (!Object.hasOwn(PROMPT_TRACK_LABELS, brief.promptTrack)) errors.push("brief.promptTrack must be A, B or C.");
  return errors;
}

function isEditReferencePath(value) {
  return typeof value === "string" && /^scripts\/hero-images\/references\/[a-z0-9][a-z0-9.-]*\.(avif|webp|png|jpg)$/.test(value);
}

export async function validateEditReference(brief, root = process.cwd()) {
  if (brief?.generationMethod !== "image-edit") return [];
  if (!isEditReferencePath(brief.referenceImagePath)) return ["Invalid preserved reference image path."];
  try {
    const bytes = await readFile(path.join(root, brief.referenceImagePath));
    return sha256Hex(bytes) === brief.referenceImageHash
      ? []
      : ["Reference image bytes changed; review the edit against the preserved original."];
  } catch (error) {
    return [`Cannot read preserved reference image (${error.code}).`];
  }
}

export function selectPromptPlan(article, brief) {
  const errors = validateBrief(article, brief);
  if (errors.length) throw new Error(`[${article.slug}] ${errors.join(" ")}`);
  return {
    template: brief.promptTrack,
    promptTrack: brief.promptTrack,
    approvedModelId: "reviewed-brief",
    sceneId: buildArticleSceneId(brief.promptTrack, "reviewed-brief", article.slug),
    ruleId: "explicit-reviewed-brief",
    colorKey: "Monedario editorial v5",
    hex: EDITORIAL_PALETTE.teal,
    matchedKeywords: [],
    modelPlan: { ...DEFAULT_MODEL_PLAN },
    brief,
    semantic: {
      readerSituation: brief.readerNeed,
      primaryIntent: brief.primaryIntent ?? "explicar",
      toneClass: brief.toneClass ?? "educativo",
      visualEvidence: [brief.editorialPromise, brief.visualMessage],
    },
  };
}

export function buildPromptFromPlan(plan) {
  if (plan.brief.generationMethod === "data-render") return plan.brief.scene;
  if (plan.brief.generationMethod === "image-edit") {
    return [
      plan.brief.scene,
      "Canvas: 1200x630 pixels, landscape. Keep the existing subject size and position; fill only the side-bar areas with the original background. Preserve the original flat illustration style.",
    ].join("\n");
  }
  return buildEditorialPrompt(plan.brief);
}

export function buildPromptEntry(article, brief) {
  const plan = selectPromptPlan(article, brief);
  const prompt = buildPromptFromPlan(plan);
  return {
    slug: article.slug,
    sourcePath: article.sourcePath,
    targetImagePath: `/images/hero/${article.slug}.avif`,
    generationMethod: brief.generationMethod ?? "imagegen",
    ...(brief.generationMethod === "image-edit" ? {
      referenceImagePath: brief.referenceImagePath,
      referenceImageHash: brief.referenceImageHash,
    } : {}),
    styleVersion: EDITORIAL_STYLE_VERSION,
    sourceContentHash: article.sourceContentHash,
    briefHash: sha256Hex(JSON.stringify(brief)),
    briefReview: brief.review,
    template: plan.template,
    promptTrack: plan.promptTrack,
    promptTrackLabel: PROMPT_TRACK_LABELS[plan.promptTrack],
    approvedModelId: plan.approvedModelId,
    sceneId: plan.sceneId,
    ...plan.semantic,
    alt: brief.alt,
    palette: { category: plan.colorKey, hex: plan.hex, ...EDITORIAL_PALETTE },
    modelPlan: plan.modelPlan,
    prompt,
    promptHash: sha256Hex(prompt),
    selectors: { ruleId: plan.ruleId, category: article.category, cluster: article.cluster, matchedKeywords: [] },
  };
}
