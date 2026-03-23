import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["html", { outputFolder: "reports/playwright", open: "never" }]],
  use: {
    baseURL: "http://localhost:3200",
    trace: "on-first-retry",
    permissions: ["geolocation"],
    geolocation: { latitude: 24.7136, longitude: 46.6753 },
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npx next dev --port 3200",
    url: "http://localhost:3200",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
