import { defineConfig } from "@playwright/test";

// Suite de privacidad (plan 121): canarios financieros, contrato de analytics,
// escenarios y metamórfico. Local por defecto; para diagnóstico contra
// producción:
//   PRIVACY_BASE_URL=https://monedario.cl pnpm exec playwright test \
//     --config playwright.privacy.config.ts
export default defineConfig({
  testDir: "./tests/privacy",
  timeout: 45000,
  use: {
    baseURL: process.env.PRIVACY_BASE_URL ?? "http://localhost:4321",
    headless: true,
  },
  webServer: process.env.PRIVACY_BASE_URL
    ? undefined
    : {
        command: "pnpm exec astro preview --port 4321",
        port: 4321,
        reuseExistingServer: true,
      },
});
