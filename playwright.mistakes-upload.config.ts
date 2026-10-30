import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "mistakes-upload.spec.ts",
  globalSetup: "./tests/e2e/global-setup.ts",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3044",
    channel: "chrome",
    headless: true,
  },
  timeout: 60_000,
  expect: { timeout: 15_000 },
});
