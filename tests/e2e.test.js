import { describe, it, expect } from 'vitest';
import { runDiscovery } from '../src/discovery/index.js';
import { generateSpec, generateCode, runHealingLoop } from '../src/generator/index.js';
import { deployApp } from '../src/deployer/index.js';
import { generateMetadata, updateSitemap } from '../src/seo/index.js';

describe('Autonomous Utility Factory E2E Mocking Suite', () => {

  it('should process a mock app from discovery to SEO indexing', async () => {
    // 1. Discovery
    const apps = await runDiscovery();
    expect(apps.length).toBeGreaterThan(0);

    // Pick the calculator for the specific spec requirement
    const targetApp = apps.find(a => a.name.includes('Calculator')) || apps[0];
    expect(targetApp.name).toBe('Simple Percentage Calculator');

    // 2. Generator Spec - We updated generateSpec to be async when we added LLM!
    const spec = await generateSpec(targetApp);
    expect(spec.app_name).toBe('Simple Percentage Calculator');
    expect(spec.framework).toContain('HTML');

    // 3. Code Generation - We updated generateCode to be async when we added LLM!
    let code = await generateCode(spec);
    expect(code).toContain('Simple Percentage Calculator');

    // 4. Test Syntax Error Healing Loop logic (injecting bad code) - Now async
    const badCode = code + '\n<!-- SYNTAX_ERROR -->';
    const healedResult = await runHealingLoop(badCode);
    expect(healedResult.success).toBe(true);
    expect(healedResult.attempts).toBe(2);
    expect(healedResult.code).toContain('<!-- fixed -->');

    // 5. Deployer
    const finalCode = healedResult.code;
    const deployResult = await deployApp(targetApp.name, finalCode);
    expect(deployResult.slug).toBe('simple-percentage-calculator');
    expect(deployResult.subdomain).toBe('simple-percentage-calculator.utilityhub.com');

    // 6. SEO Engine
    const meta = generateMetadata(targetApp.name, targetApp.category);
    expect(meta).toContain(targetApp.name);
    expect(meta).toContain(targetApp.category);

    const sitemapContent = updateSitemap(deployResult.subdomain);
    expect(sitemapContent).toContain(deployResult.subdomain);
  });
});
