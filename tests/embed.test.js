import { describe, it, expect } from 'vitest';
import * as generatorPkg from '../src/generator/index.js';

describe('Widget Embed Compatibility Test Harness', () => {

  it('should generate a widget free of global DOM and CSS conflicts', async () => {
    // 1. Mock Spec
    const targetApp = { name: 'Embed Test Calculator', category: 'Finance', description: 'Test widget for embed conflicts.' };
    const spec = await generatorPkg.generateSpec(targetApp);

    // 2. Generate Code
    const code = await generatorPkg.generateCode(spec);

    // 3. Check for Global CSS Bleeds
    // Should not contain body { ... !important } or similar global unscoped selectors
    const hasGlobalBodyStyles = /body\s*{[^}]*!important[^}]*}/i.test(code);
    expect(hasGlobalBodyStyles).toBe(false);

    // 4. Check for Global DOM Event Overrides
    // Should not reassign window.onload or document.body.onclick directly
    const hasWindowOnload = /window\.onload\s*=/i.test(code);
    expect(hasWindowOnload).toBe(false);

    const hasBodyOnclick = /document\.body\.onclick\s*=/i.test(code);
    expect(hasBodyOnclick).toBe(false);

    // 5. Check for proper isolation
    // Ideally it has an isolated container, but checking for HTML framework first
    expect(spec.framework).toContain('HTML');

  });
});
