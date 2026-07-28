import { defineConfig } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const isProduction = baseURL.startsWith("https://");

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  reporter: "line",
  use: {
    baseURL,
    browserName: "chromium",
    launchOptions: {
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: isProduction ? undefined : {
    command: "npm run dev",
    url: "http://127.0.0.1:3000/edit/image/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
