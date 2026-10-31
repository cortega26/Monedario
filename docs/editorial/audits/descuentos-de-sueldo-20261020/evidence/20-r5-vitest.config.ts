import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: process.cwd(),
  resolve: {
    alias: { "@": resolve(process.cwd(), "src") },
  },
  test: {
    include: [
      "docs/editorial/audits/descuentos-de-sueldo-20261020/evidence/21-r5-engine-probe.test.ts",
    ],
  },
});
