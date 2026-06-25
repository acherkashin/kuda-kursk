import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 5173",
    env: {
      ...process.env,
      VITE_ANALYTICS_CONSENT_UI_ENABLED: "true",
      VITE_YANDEX_METRIKA_ID: process.env.VITE_YANDEX_METRIKA_ID ?? "123456"
    },
    url: "http://127.0.0.1:5173",
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ]
});
