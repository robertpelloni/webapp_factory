import { describe, it, expect } from 'vitest';
import * as productHuntPkg from '../src/discovery/producthunt.js';

describe('Discovery Module: Product Hunt Scraper', () => {

  it('should successfully scrape mock apps when running in a test environment', async () => {
    // In our Vitest setup, NODE_ENV is automatically set to 'test',
    // so we expect the explicit fallback array to be returned.
    const results = await productHuntPkg.scrapeProductHunt();

    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('name');
    expect(results[0]).toHaveProperty('description');
    expect(results[0]).toHaveProperty('category');
    expect(results[0].name).toBe('CSS Gradient Generator');
  });

});
