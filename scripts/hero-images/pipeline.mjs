// scripts/hero-images/pipeline.mjs
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getAllScenes, buildPromptFromScene } from "../../src/tools/hero-images/config.mjs";

const apiKey = process.env.OPENAI_API_KEY || "";
if (!apiKey.startsWith("sk-")) {
  throw new Error("OPENAI_API_KEY does not appear to be a valid OpenAI key (expected sk-… prefix).");
}
const client     = new OpenAI({ apiKey });
const STATUS_FILE = "scripts/hero-images/status.json";
const PUBLIC_STATUS = "public/hero-images-status.json";
const OUTPUT_DIR  = "public/images/hero";
const MAX_ATTEMPTS = 3;
const PASS_THRESHOLD = 5; // score >= 5 out of 7 is acceptable

// ── Status ─────────────────────────────────────────────────────────────────────

function loadStatus() {
  try { return JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8")); }
  catch { return {}; }
}

function saveStatus(status) {
  const json = JSON.stringify(status, null, 2);
  fs.writeFileSync(STATUS_FILE, json);
  // Keep public copy in sync for the dev monitor UI
  try { fs.writeFileSync(PUBLIC_STATUS, json); } catch { /* ignore */ }
}

// ── Evaluación con GPT-4o vision ───────────────────────────────────────────────

const EVAL_PROMPT = `You are a strict quality evaluator for hero images of a Chilean personal finance website called Monedario.

Evaluate the image against ALL 7 criteria. Be precise and consistent.

1. BACKGROUND — background is a single completely flat solid color with zero gradients, zero textures, zero vignette, zero noise
2. ELEMENTS — maximum 3 distinct visual elements total in the image
3. STYLE — flat 2D illustration only: zero 3D rendering, zero drop shadows, zero glassmorphism, zero photorealism
4. COMPOSITION — main subject is in the left or center-left area, with clean empty space on the right third
5. TEXT — absolutely zero letters, numbers, words, or readable symbols anywhere in the image
6. INDUSTRY — the image clearly communicates personal finance (money, savings, taxes, employment, debt) — not confusable with tech, healthcare, or generic SaaS
7. SIMPLICITY — the core concept is understandable in under 2 seconds with no explanation needed

Score each criterion as pass (1) or fail (0). Sum them for the total score.

Respond with JSON only, no markdown, no explanation outside the JSON:
{
  "pass": true if score >= 5 else false,
  "score": integer from 0 to 7,
  "failures": ["CRITERION_NAME for each failed criterion"],
  "reason": "one sentence describing the most critical failure or confirming pass"
}`;

async function evaluateImage(base64) {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: EVAL_PROMPT },
        { type: "image_url", image_url: { url: `data:image/png;base64,${base64}`, detail: "high" } },
      ],
    }],
    response_format: { type: "json_object" },
    temperature: 0,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ── Generación ─────────────────────────────────────────────────────────────────

// Refuerzo de fondo que se añade a TODOS los prompts — crítico para evitar gradientes
const BACKGROUND_ENFORCEMENT = `ABSOLUTE REQUIREMENT FOR BACKGROUND: Paint the entire background as one single uniform flat color. No gradient. No color transition. No texture. No noise. No vignette. No variation from edge to edge. Identical color value at every pixel of the background.`;

// Refuerzo adicional para reintentos cuando falla BACKGROUND o INDUSTRY
function getRetryEnforcement(attempt, failures) {
  if (attempt === 1) return "";

  const parts = [];

  if (failures.includes("BACKGROUND")) {
    parts.push(`RETRY CORRECTION — BACKGROUND FAILED: The previous attempt had a gradient or textured background. This is strictly forbidden. The background must be a single flat solid color — every background pixel must be identical. No gradient whatsoever.`);
  }

  if (failures.includes("INDUSTRY")) {
    parts.push(`RETRY CORRECTION — INDUSTRY FAILED: The previous attempt looked too generic (could be tech, healthcare, or SaaS). This image must be unambiguously about personal finance — money, salary, savings, taxes, pension, or debt. The visual metaphor must be specific to financial concepts.`);
  }

  if (failures.includes("TEXT")) {
    parts.push(`RETRY CORRECTION — TEXT FOUND: The previous attempt contained letters, numbers, or readable symbols. Include absolutely zero text of any kind.`);
  }

  if (failures.includes("STYLE")) {
    parts.push(`RETRY CORRECTION — STYLE WRONG: The previous attempt used 3D rendering, glassmorphism, or photoreal polish. Return to a flat editorial vector style. A single simple grounding shadow or tonal separation is allowed if it improves hierarchy, but avoid realistic depth, glossy effects, and cinematic lighting.`);
  }

  if (failures.includes("ELEMENTS")) {
    parts.push(`RETRY CORRECTION — TOO COMPLEX: The previous attempt had more than 3 elements. Simplify to maximum 3 distinct visual elements total.`);
  }

  return parts.join("\n\n");
}

async function generateImage(scene, attempt, previousFailures = []) {
  console.log(`    attempt ${attempt}/${MAX_ATTEMPTS} — generating...`);

  const basePrompt = buildPromptFromScene(scene);
  const retryNote  = getRetryEnforcement(attempt, previousFailures);
  const fullPrompt = [basePrompt, BACKGROUND_ENFORCEMENT, retryNote]
    .filter(Boolean)
    .join("\n\n");

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt: fullPrompt,
    size: "1536x1024",
    quality: "high",
    n: 1,
  });

  return response.data[0].b64_json;
}

// ── Conversión y guardado ───────────────────────────────────────────────────────

async function saveAsAvif(base64, slug) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, `${slug}.avif`);
  await sharp(Buffer.from(base64, "base64"))
    .avif({ quality: 80, effort: 6 })
    .toFile(outputPath);
  return outputPath;
}

// ── Procesar una escena ─────────────────────────────────────────────────────────

async function processScene(scene, status) {
  console.log(`\n→ [${scene.cluster}] ${scene.slug}`);

  let previousFailures = [];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const base64     = await generateImage(scene, attempt, previousFailures);
      console.log(`    evaluating...`);
      const evaluation = await evaluateImage(base64);
      const passed     = evaluation.score >= PASS_THRESHOLD;

      console.log(`    score: ${evaluation.score}/7 — ${passed ? "✓ PASS" : "✗ FAIL"} — ${evaluation.reason}`);

      if (passed) {
        const saved = await saveAsAvif(base64, scene.slug);
        console.log(`    saved: ${saved}`);
        status[scene.slug] = {
          state: "done",
          score: evaluation.score,
          attempts: attempt,
          savedAt: new Date().toISOString(),
        };
        saveStatus(status);
        return true;
      }

      console.log(`    failures: ${evaluation.failures.join(", ")}`);
      previousFailures = evaluation.failures;

      if (attempt === MAX_ATTEMPTS) {
        status[scene.slug] = {
          state: "failed",
          score: evaluation.score,
          failures: evaluation.failures,
          reason: evaluation.reason,
          attempts: MAX_ATTEMPTS,
          failedAt: new Date().toISOString(),
        };
        saveStatus(status);
        console.log(`    ✗ max attempts reached — flagged for manual review`);
        return false;
      }

    } catch (err) {
      console.error(`    error: ${err.message}`);
      if (attempt === MAX_ATTEMPTS) {
        status[scene.slug] = {
          state: "error",
          error: err.message,
          attempts: MAX_ATTEMPTS,
          failedAt: new Date().toISOString(),
        };
        saveStatus(status);
        return false;
      }
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────────────

async function run() {
  const status    = loadStatus();
  const allScenes = getAllScenes();
  const args      = process.argv.slice(2);

  const slugFilter = args.find(a => a.startsWith("--slug="))?.split("=")[1];
  const force      = args.includes("--force");
  const cluster    = args.find(a => a.startsWith("--cluster="))?.split("=")[1];
  const retryFailed = args.includes("--retry-failed");

  const toProcess = allScenes.filter(scene => {
    if (slugFilter)    return scene.slug === slugFilter;
    if (cluster)       return scene.cluster === cluster;
    if (retryFailed)   return status[scene.slug]?.state === "failed";
    if (force)         return true;
    // Default: skip scenes already done
    return status[scene.slug]?.state !== "done";
  });

  console.log(`\nMonedario Hero Image Pipeline`);
  console.log(`${"─".repeat(40)}`);
  console.log(`Total scenes in library : ${allScenes.length}`);
  console.log(`Already done            : ${Object.values(status).filter(v => v.state === "done").length}`);
  console.log(`To process now          : ${toProcess.length}`);
  console.log(`Pass threshold          : ${PASS_THRESHOLD}/7`);
  console.log(`${"─".repeat(40)}`);

  if (toProcess.length === 0) {
    console.log("Nothing to process.");
    console.log("Use --force to regenerate all, or --retry-failed for failed ones.");
    return;
  }

  let passed = 0;
  let failed = 0;

  for (const scene of toProcess) {
    const ok = await processScene(scene, status);
    if (ok) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n${"─".repeat(40)}`);
  console.log(`Passed : ${passed}`);
  console.log(`Failed : ${failed}`);

  if (failed > 0) {
    console.log(`\nNeeds manual review (run with --retry-failed to retry):`);
    Object.entries(status)
      .filter(([, v]) => v.state === "failed")
      .forEach(([slug, v]) => {
        console.log(`  • ${slug}`);
        console.log(`    score: ${v.score}/7 | failures: ${v.failures?.join(", ")}`);
        console.log(`    reason: ${v.reason}`);
      });
  }

  if (passed > 0) {
    console.log(`\nGenerated images saved to: ${OUTPUT_DIR}/`);
  }
}

run().catch(console.error);
