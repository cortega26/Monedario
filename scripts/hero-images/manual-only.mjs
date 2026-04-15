#!/usr/bin/env node

const attemptedCommand = process.argv[2] || "images:generate";

console.error(`[hero-images] Command '${attemptedCommand}' is deprecated and blocked by policy.`);
console.error("[hero-images] Automatic API generation is disabled.");
console.error("[hero-images] Use manual creation workflow: build prompts, create/curate asset, then run check:hero-images.");

process.exit(1);
