import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as dbPkg from '../src/discovery/db.js';
import * as deployerPkg from '../src/deployer/index.js';

describe('Concurrency & Load Handling', () => {

  beforeEach(async () => {
      await dbPkg.initDb();
      await deployerPkg.initDeployDb();
  });

  afterEach(async () => {
      // We do not close the db mid-suite as it breaks the shared module memory db connection
  });

  it('should safely process 1000+ simultaneous tracking queries without database locking or corruption', async () => {
     // Simulate 1000 simultaneous apps being discovered and tracked in the SQLite DB
     const promises = [];
     for(let i = 0; i < 1000; i++) {
        promises.push(dbPkg.markAppProcessed(`High Load App Variant ${i}`));
     }

     // Resolve all concurrent promises
     await Promise.all(promises);

     // Verify a random sampling to ensure no data corruption or locking occurred
     const check1 = await dbPkg.isAppProcessed(`High Load App Variant 500`);
     const check2 = await dbPkg.isAppProcessed(`High Load App Variant 999`);
     const check3 = await dbPkg.isAppProcessed(`High Load App Variant 0`);

     expect(check1).toBe(true);
     expect(check2).toBe(true);
     expect(check3).toBe(true);
  });

  it('should safely process 1000+ simultaneous deployer route mappings without collisions', async () => {
     const promises = [];
     for(let i = 0; i < 1000; i++) {
        promises.push(deployerPkg.saveRoute(`load-app-${i}`, `load-app-${i}.utilityhub.com`));
     }

     // Resolve all concurrent promises
     await Promise.all(promises);

     // Verify route mapping extraction
     const route500 = await deployerPkg.getRoute(`load-app-500`);
     const route999 = await deployerPkg.getRoute(`load-app-999`);

     expect(route500).toBe(`load-app-500.utilityhub.com`);
     expect(route999).toBe(`load-app-999.utilityhub.com`);
  });

});
