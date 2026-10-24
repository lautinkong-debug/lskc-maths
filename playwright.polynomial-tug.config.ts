import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "polynomial-tug.spec.ts",
  globalSetup: "./tests/e2e/polynomial-tug-setup.ts",
  workers: 1,
  outputDir: join(tmpdir(), "lskc-polynomial-tug-tests"),
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3027",
    channel: "chrome",
    headless: true,
    launchOptions: { chromiumSandbox: true },
  },
  timeout: 120000,
  expect: { timeout: 20000 },
});
