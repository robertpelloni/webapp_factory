import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run e2e.test.js automatically using vitest run since the others are custom scripts
    include: ['tests/e2e.test.js', 'tests/embed.test.js', 'tests/embed-integration.test.js', 'tests/seo.test.js', 'tests/docs.test.js', 'tests/dynamic-data.test.js', 'tests/prompts.test.js', 'tests/scheduler.test.js', 'tests/injection-sandbox.test.js', 'tests/load.test.js', 'tests/dashboard.test.js', 'tests/staging-deployment.test.js', 'tests/producthunt.test.js'],
  },
});
