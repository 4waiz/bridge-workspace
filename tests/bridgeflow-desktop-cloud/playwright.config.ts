import { testResultDir } from '@bridgeflow-test/kit/playwright';
import type { PlaywrightTestConfig } from '@playwright/test';
// import { devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './e2e',
  fullyParallel: true,
  timeout: process.env.CI ? 300_000 : 60_000,
  outputDir: testResultDir,
  use: {
    viewport: { width: 1440, height: 800 },
  },
  reporter: process.env.CI ? 'github' : 'list',
  webServer: [
    // Intentionally not building the web, reminds you to run it by yourself.
    {
      command: 'yarn run -T bridgeflow dev -p @bridgeflow/electron-renderer',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      env: {
        COVERAGE: process.env.COVERAGE || 'false',
        DISTRIBUTION: 'desktop',
      },
      url: 'http://localhost:8080',
    },
    {
      command: 'yarn run -T bridgeflow dev -p @bridgeflow/server',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        DATABASE_URL:
          process.env.DATABASE_URL ??
          'postgresql://bridgeflow:bridgeflow@localhost:5432/bridgeflow',
        NODE_ENV: 'test',
        BRIDGEFLOW_ENV: process.env.BRIDGEFLOW_ENV ?? 'dev',
        DEBUG: 'bridgeflow:*',
        FORCE_COLOR: 'true',
        DEBUG_COLORS: 'true',
        MAILER_SENDER: 'noreply@toeverything.info',
      },
      url: 'http://localhost:3010/graphql',
    },
  ],
};

if (process.env.CI) {
  config.retries = 3;
  config.workers = '50%';
}

export default config;
