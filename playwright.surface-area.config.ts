import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: [
    "surface-area.spec.ts",
    "surface-area-bank.spec.ts",
    "surface-area-classroom.spec.ts",
    "surface-area-thin-strip.spec.ts",
    "surface-area-label-layout.spec.ts",
    "surface-area-label-sweep.spec.ts",
    "surface-area-ordered-dimensions.spec.ts",
    "surface-area-water.spec.ts",
    "surface-area-values.spec.ts",
    "surface-area-base-working.spec.ts",
    "surface-area-lateral-working.spec.ts",
    "surface-area-total-working.spec.ts",
  ],
  // Chrome downloads complete in the Windows temporary folder. The protected
  // repository artifact folder can report completion but deny file reads.
  outputDir: join(tmpdir(), "lskc-surface-area-playwright"),
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004",
    channel: "chrome",
    headless: true,
  },
});
