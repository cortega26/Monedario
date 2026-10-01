#!/usr/bin/env node
import { parseArgs } from "node:util";
import { buildDelivery } from "./delivery.mjs";

const { values } = parseArgs({
  options: {
    check: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
  },
});

try {
  const result = await buildDelivery({
    check: values.check,
    dryRun: values["dry-run"],
    force: values.force,
  });
  console.log(
    `[image-delivery] ${result.total} articles, ${result.changed} changed${values.check ? " (verified)" : values["dry-run"] ? " (dry run)" : ""}.`
  );
  for (const slug of result.pending) console.log(`- ${slug}`);
} catch (error) {
  console.error(`[image-delivery] ${error.message}`);
  process.exitCode = 1;
}
