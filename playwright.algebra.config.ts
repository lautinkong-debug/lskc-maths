import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "algebra-simplification.spec.ts",
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  expect: { timeout: 20_000 },
  outputDir: `${process.env.ALGEBRA_OUTPUT_DIR || "./out/algebra-preview"}/test-results`,
  use: {
    baseURL: process.env.ALGEBRA_BASE_URL || "http://localhost:3034",
    channel: "chrome",
    headless: true,
  },
});
