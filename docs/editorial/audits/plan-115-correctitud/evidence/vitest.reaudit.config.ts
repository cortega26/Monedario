import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../../../../../src", import.meta.url)),
    },
  },
  test: {
    root: fileURLToPath(new URL(".", import.meta.url)),
    include: ["reaudit.independent.audit.test.ts"],
    environment: "node",
  },
});
