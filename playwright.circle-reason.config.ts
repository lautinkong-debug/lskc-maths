import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: [
    "circle-reason-challenge.spec.ts",
    "circle-ipad.spec.ts",
    "circle-guided-lessons.spec.ts",
  ],
  outputDir: "./out/circle-reason-tests",
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://127.0.0.1:3217",
    channel: "msedge",
    headless: true,
  },
  webServer: {
    command:
      "node scripts/build-circle-lab.mjs && node scripts/serve-circle-lab.mjs 3217",
    url: "http://127.0.0.1:3217",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
