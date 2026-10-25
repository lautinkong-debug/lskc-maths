import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: [
    "similarity-debugger.spec.ts",
    "similarity-parts.spec.ts",
    "similarity-givens.spec.ts",
    "similarity-correspondence.spec.ts",
    "similarity-classroom.spec.ts",
    "similarity.spec.ts",
    "similarity-proof.spec.ts",
    "similarity-games.spec.ts",
    "lesson-layout.spec.ts",
  ],
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    channel: "chrome",
    headless: true,
  },
  timeout: 60_000,
  expect: { timeout: 20_000 },
});
