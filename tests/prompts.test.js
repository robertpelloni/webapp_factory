import { describe, it, expect } from 'vitest';
import * as promptsPkg from '../src/discovery/prompts.js';

describe('Discovery Module: Prompts Scraper', () => {

  it('should successfully scrape mock prompts when running in a test environment', async () => {
    // In our Vitest setup, NODE_ENV is automatically set to 'test',
    // so we expect the explicit fallback array to be returned.
    const results = await promptsPkg.scrapeTrendingPrompts();

    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('name');
    expect(results[0]).toHaveProperty('description');
    expect(results[0]).toHaveProperty('category');
    expect(results[0].name).toBe('Act as an English Translator and Improver');
  });

});
