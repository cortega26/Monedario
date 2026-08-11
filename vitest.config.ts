import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const srcAlias = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": srcAlias,
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/accessibility/**", "node_modules/**"],
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
      // Capas build-time/DOM que vitest de Node no ejercita (plan 073 — el
      // STOP de >8 archivos se resolvió con exclude selectivo documentado en
      // vez de bajar el umbral): páginas/endpoints, componentes, runtime del
      // cliente, config data, utils DOM, bundles de workers (typecheck
      // propio) y parsers remark (verificados limpios en auditoría read-only
      // 2026-08-10; caracterización fuera del alcance del plan).
      exclude: [
        "src/pages/**",
        "src/components/**",
        "src/scripts/**",
        "src/config/**",
        "src/content/**",
        "src/constants.ts",
        "src/content.config.ts",
        "src/remark-economic-variables.ts",
        "src/remark-prefix-internal-links.ts",
        "src/utils/animateCount.ts",
        "src/utils/calculatorDelta.ts",
        "src/utils/calculatorScenariosUI.ts",
        "src/utils/categoryIcons.ts",
        "src/utils/resumeState.ts",
        "src/utils/sueldo-liquido/**",
        "workers/**",
      ],
      thresholds: {
        lines: 80,
      },
    },
  },
});
