import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["polynomials.spec.ts", "polynomials-bank.spec.ts"],
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001",
    channel: "chrome",
    headless: true,
  },
  timeout: 60_000,
  expect: { timeout: 20_000 },
});
