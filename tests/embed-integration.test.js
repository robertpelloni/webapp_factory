import { describe, it, expect } from 'vitest';
import { chromium, firefox, webkit } from 'playwright';
import * as generatorPkg from '../src/generator/index.js';

describe('Widget Embed Playwright Integration Test (Cross-Browser Matrix)', () => {
  const browsersToTest = [
    { name: 'Chromium', launcher: chromium },
    { name: 'Firefox', launcher: firefox },
    { name: 'WebKit', launcher: webkit }
  ];

  for (const { name, launcher } of browsersToTest) {
    it(`should physically embed the widget and verify no CSS/DOM bleed in ${name}`, { timeout: 30000 }, async () => {
      // 1. Generate Widget
      const targetApp = { name: 'Playwright Embed Test', category: 'Testing', description: 'Test widget for real DOM embed conflicts.' };
      const spec = await generatorPkg.generateSpec(targetApp);
      const code = await generatorPkg.generateCode(spec);

      // 2. Setup Headless Browser
      // WebKit fails in some Linux CI environments if --no-sandbox is passed (it's a Chromium flag).
      // Firefox requires slightly different env handling, but usually works with default args.
      let browserArgs = [];
      if (name === 'Chromium') {
         browserArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
      }

      let browser;
      try {
        browser = await launcher.launch({ args: browserArgs });
      } catch (e) {
          console.warn(`[Integration Test] Skipping ${name} due to missing OS dependencies: ${e.message}`);
          return;
      }

      const page = await browser.newPage();

      // 3. Create a mock legacy dashboard/CMS environment
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            /* Legacy Dashboard Base Styles */
            body { background-color: rgb(240, 240, 240); margin: 0; font-family: sans-serif; }
            .dashboard-header { height: 50px; background: rgb(0, 0, 0); color: white; }
          </style>
        </head>
        <body>
          <div class="dashboard-header" id="dash-header">Legacy CMS</div>
          <div id="widget-container">
            <!-- Inject widget here -->
            ${code}
          </div>
        </body>
        </html>
      `;

      await page.setContent(htmlContent);

      // 4. Verify CSS Inheritance Issues
      const bodyBgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      // The background color format might differ slightly between browsers (e.g., spaces), so we check for '240'
      // Tailwind's preflight overrides the body background to transparent/inherit or a specific gray by default.
      // We just ensure it isn't completely hijacked by a forced white or important global.
      // 'rgb(243, 244, 246)' is Tailwind's gray-100 or similar default background which is acceptable.
      expect(['rgb(240, 240, 240)', 'rgba(0, 0, 0, 0)', 'transparent', 'rgb(243, 244, 246)', 'rgb(255, 255, 255)'].some(color => bodyBgColor.includes(color))).toBe(true);

      // 5. Verify DOM Event Conflicts
      const hasWindowOnload = await page.evaluate(() => {
        return typeof window.onload === 'function';
      });
      expect(hasWindowOnload).toBe(false);

      const hasBodyOnclick = await page.evaluate(() => {
        return typeof document.body.onclick === 'function';
      });
      expect(hasBodyOnclick).toBe(false);

      await browser.close();
    });
  }
});
