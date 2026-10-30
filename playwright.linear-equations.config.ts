import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: [
    "linear-equations.spec.ts",
    "linear-equations-operations.spec.ts",
  ],
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    channel: "chrome",
    headless: true,
  },
  timeout: 90_000,
  expect: { timeout: 20_000 },
});
