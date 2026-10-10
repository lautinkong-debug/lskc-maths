import { defineConfig } from "@playwright/test";

// Exercise the actual Next.js production bundle and real local Firestore reads.
// The shared setup refuses to seed anything except demo-lskc-maths emulators.
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "statistical-charts.spec.ts",
  globalSetup: "./tests/e2e/global-setup.ts",
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://localhost:3000", channel: "chrome", headless: true },
  webServer: {
    command: 'npx concurrently -k "npm:start" "npm:emulators"',
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
