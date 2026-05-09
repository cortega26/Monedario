import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/accessibility",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:4321",
    headless: true,
  },
  webServer: {
    command: "pnpm exec astro preview --port 4321",
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
});
