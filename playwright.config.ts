import { defineConfig } from '@playwright/test';
const production = process.env.TEST_PRODUCTION === '1';
const origin = production ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5173';
export default defineConfig({
  testDir: './tests',
  use: {
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  },
  projects: ['react', 'angular'].map((name) => ({ name, use: { baseURL: `${origin}/${name}/` } })),
  webServer: {
    command: production ? 'npm run preview' : 'npm run dev -- --host 127.0.0.1',
    url: `${origin}/angular/`,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
