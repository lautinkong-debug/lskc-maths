import { defineConfig } from "@playwright/test";

// Runs against the production build: `npx next build` first.
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: [
    "circle-site-load.spec.ts",
    "circle-two-chords.spec.ts",
    "circle-chord-condition.spec.ts",
    "circle-reason-gallery.spec.ts",
  ],
  outputDir: "./out/circle-site-tests",
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://127.0.0.1:3310",
    channel: "msedge",
    headless: true,
  },
  webServer: {
    command: "npx next start -p 3310",
    url: "http://127.0.0.1:3310/apps",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
