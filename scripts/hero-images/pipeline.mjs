#!/usr/bin/env node
// Retired: automatic approval and appended prompts contradicted curation policy.
console.error("[hero-images] Automatic pipeline retired. Run scan-articles.mjs and build-prompts.mjs, then use /dev/hero-images/ for explicit imagegen generation and editorial curation. No images were generated or changed.");
process.exitCode = 1;
