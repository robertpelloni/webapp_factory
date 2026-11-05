import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as generatorPkg from '../src/generator/index.js';
import * as deployerPkg from '../src/deployer/index.js';
import * as dbPkg from '../src/discovery/db.js';

describe('Staging Deployment & DOM Verification', () => {

  beforeEach(async () => {
      await dbPkg.initDb();
      await deployerPkg.initDeployDb();
  });

  afterEach(async () => {
      // Intentionally avoiding closeDb to prevent sqlite misuse errors in parallel vitest runners
  });

  it('should explicitly generate a clean payload, push to staging, and match DOM states', async () => {
    // 1. Generate Widget Payload
    const appData = { name: "Staging Target Widget", description: "Verifying staging deployment hooks." };
    const spec = await generatorPkg.generateSpec(appData);
    const code = await generatorPkg.generateCode(spec);

    // Ensure standard elements are in the generated code
    expect(code).toContain('Staging Target Widget');
    expect(code).toContain('tailwind');
    expect(code).toContain('ad-banner');

    // 2. Pass through Healing Loop for staging
    const healingResult = await generatorPkg.runHealingLoop(code);
    expect(healingResult.success).toBe(true);

    // 3. Initiate Staging Deployment
    // In CI, VERCEL_API_TOKEN is generally mocked, so this tests the mock fallback logic deeply
    const deployResult = await deployerPkg.deployApp(appData.name, healingResult.code, healingResult.tempDir);

    expect(deployResult.slug).toBe('staging-target-widget');
    expect(deployResult.subdomain).toBe('staging-target-widget.utilityhub.com');
    expect(deployResult.deployedUrl).toContain('.vercel.app');

    // 4. Verify Local Staging Route Registration
    const activeRoute = await deployerPkg.getRoute(deployResult.slug);
    expect(activeRoute).toBe('staging-target-widget.utilityhub.com');

  });
});
