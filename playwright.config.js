import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './test/browser',
  use: {
    baseURL: 'http://127.0.0.1:4178',
    browserName: 'chromium',
  },
  webServer: {
    command: 'python3 -m http.server 4178 --directory site',
    url: 'http://127.0.0.1:4178',
    reuseExistingServer: !process.env.CI,
  },
});
