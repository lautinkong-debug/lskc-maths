import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/statistical-charts",
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3217", channel: "chrome", headless: true },
  webServer: {
    command: "node scripts/serve-statistical-lab.mjs 3217",
    url: "http://127.0.0.1:3217",
    reuseExistingServer: false,
  },
});
