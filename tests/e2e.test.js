import { describe, it, expect } from 'vitest';
import * as discoveryPkg from '../src/discovery/index.js';
import * as generatorPkg from '../src/generator/index.js';
import * as deployerPkg from '../src/deployer/index.js';
import * as seoPkg from '../src/seo/index.js';

describe('Autonomous Utility Factory E2E Mocking Suite', () => {

  it('should process a mock app from discovery to SEO indexing', async () => {
    // 1. Discovery
    const apps = await discoveryPkg.runDiscovery();
    expect(apps.length).toBeGreaterThan(0);

    // Pick the calculator for the specific spec requirement
    const targetApp = apps.find(a => a.name.includes('Calculator')) || apps[0];
    expect(targetApp.name).toBe('Simple Percentage Calculator');

    // 2. Generator Spec - We updated generateSpec to be async when we added LLM!
    const spec = await generatorPkg.generateSpec(targetApp);
    expect(spec.app_name).toBe('Simple Percentage Calculator');
    expect(spec.framework).toContain('HTML');

    // 3. Code Generation - We updated generateCode to be async when we added LLM!
    let code = await generatorPkg.generateCode(spec);
    expect(code).toContain('Simple Percentage Calculator');

    // 4. Test Syntax Error Healing Loop logic (injecting bad code) - Now async
    const badCode = code + '\n<script>// SYNTAX_ERROR</script>';
    const healedResult = await generatorPkg.runHealingLoop(badCode);
    expect(healedResult.success).toBe(true);
    expect(healedResult.attempts).toBe(2);
    expect(healedResult.code).toContain('/* fixed */');

    // 5. Deployer
    const finalCode = healedResult.code;
    const deployResult = await deployerPkg.deployApp(targetApp.name, finalCode);
    expect(deployResult.slug).toBe('simple-percentage-calculator');
    expect(deployResult.subdomain).toBe('simple-percentage-calculator.utilityhub.com');

    // 6. SEO Engine
    const meta = seoPkg.generateMetadata(targetApp.name, targetApp.category);
    expect(meta).toContain(targetApp.name);
    expect(meta).toContain(targetApp.category);

    const sitemapContent = seoPkg.updateSitemap(deployResult.subdomain);
    expect(sitemapContent).toContain(deployResult.subdomain);
  });
});
