import { defineConfig } from "@playwright/test";

// Suite de resiliencia (plan 122, auditoría 04): validación de inputs, estado,
// degradación sin JS, terceros bloqueados y viewports.
export default defineConfig({
  testDir: "./tests/resilience",
  timeout: 45000,
  use: {
    baseURL: process.env.RESILIENCE_BASE_URL ?? "http://localhost:4321",
    headless: true,
  },
  webServer: process.env.RESILIENCE_BASE_URL
    ? undefined
    : {
        command: "pnpm exec astro preview --port 4321",
        port: 4321,
        reuseExistingServer: true,
      },
});
