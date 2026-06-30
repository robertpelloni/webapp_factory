import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run e2e.test.js automatically using vitest run since the others are custom scripts
    include: ['tests/e2e.test.js'],
  },
});
