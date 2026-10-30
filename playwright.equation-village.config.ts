import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const host = new URL(baseURL).hostname;
if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) {
  throw new Error("Equation Village verification requires a local preview.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "equation-village.spec.ts",
  workers: 1,
  outputDir: join(tmpdir(), "lskc-equation-village-tests"),
  reporter: [
    ["list"],
    [
      "json",
      { outputFile: "out/equation-village-verification/browser-results.json" },
    ],
  ],
  use: {
    baseURL,
    channel: "chrome",
    headless: true,
    launchOptions: { chromiumSandbox: true },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  timeout: 60_000,
  expect: { timeout: 10_000 },
});
