import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    name: "monedario/global-ignores",
    ignores: [
      "dist/**",
      ".astro/**",
      "**/.wrangler/**",
      "public/pagefind/**",
      ".venv/**",
      "archive/scripts/**",
      "**/.claude/worktrees/**",
      "**/.codex/worktrees/**",
      "**/.agents/worktrees/**",
      "coverage/**",
      "coverage-*/**",
      ".nyc_output/**",
      "playwright-report/**",
      "test-results/**",
      // Evidencia de auditorías (harness propios con su vitest config); no es
      // código del sitio, igual que en tsconfig/vitest.
      "docs/editorial/audits/**",
    ],
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  { rules: { "no-console": "error" } },
  {
    files: ["scripts/**/*.mjs", "test-*.mjs"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["workers/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
];
