import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "polynomial-quest.spec.ts",
  workers: 1,
  outputDir: join(tmpdir(), "lskc-polynomial-quest-tests"),
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3028",
    channel: "chrome",
    headless: true,
    launchOptions: { chromiumSandbox: true },
  },
  timeout: 60000,
  expect: { timeout: 10000 },
});
