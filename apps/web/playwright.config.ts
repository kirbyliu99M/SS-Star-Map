import { defineConfig, devices } from "@playwright/test";

const port = 3100;

// Smoke tests run against a production build of the local app.
// Run `pnpm build` and `pnpm db:start` first.
export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${port}` },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // 375 px wide, matches the AGENTS.md mobile check.
    { name: "mobile", use: { ...devices["iPhone SE"], defaultBrowserType: "chromium" } },
  ],
  webServer: {
    command: `pnpm exec next start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
