import { describe, it, expect } from 'vitest';
import { chromium } from 'playwright';

describe('Widget Sandbox: Dynamic Injection & Event Binding Resilience', () => {

  it('should safely process dynamic postMessage injection without breaking internal event bindings', { timeout: 30000 }, async () => {

    // We simulate the output of a generated widget designed to receive dynamic config data via postMessage.
    // The widget inherently must use safe try/catch event listeners.
    const widgetCode = `
      <!DOCTYPE html>
      <html>
      <body>
        <div id="dynamic-content">Waiting for data...</div>
        <button id="action-btn">Click Me</button>
        <script>
          let clickCount = 0;

          // Resilient Event Binding
          const btn = document.getElementById('action-btn');
          if (btn) {
              btn.addEventListener('click', () => {
                 clickCount++;
                 document.getElementById('dynamic-content').innerText = 'Clicked ' + clickCount;
              });
          }

          // Dynamic Data Injection (e.g., config from parent CMS)
          window.addEventListener('message', (event) => {
             try {
                if (event.data && event.data.type === 'WIDGET_CONFIG') {
                    // Safe injection preventing XSS
                    const safeText = event.data.payload.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    document.getElementById('dynamic-content').innerHTML = 'Injected: ' + safeText;
                }
             } catch(e) {
                console.error("Failed to parse dynamic data", e);
             }
          });
        </script>
      </body>
      </html>
    `;

    const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Load the widget directly into the sandbox
    await page.setContent(widgetCode);

    // 1. Validate Initial Event Binding
    await page.click('#action-btn');
    let content = await page.locator('#dynamic-content').textContent();
    expect(content).toBe('Clicked 1');

    // 2. Simulate Dynamic Data Injection from a "Parent" window
    await page.evaluate(() => {
        window.postMessage({ type: 'WIDGET_CONFIG', payload: '<script>alert(1)</script>Safe Data' }, '*');
    });

    // Allow event loop to process message
    await page.waitForTimeout(500);

    // 3. Verify safe rendering (preventing XSS payload while rendering data)
    content = await page.locator('#dynamic-content').innerHTML();
    expect(content).toContain('Injected: &lt;script&gt;alert(1)&lt;/script&gt;Safe Data');

    // 4. Verify Event Binding Resilience (Ensure clicking still works after heavy data injection)
    await page.click('#action-btn');
    content = await page.locator('#dynamic-content').textContent();
    // It should overwrite the injected text back to the click state
    expect(content).toBe('Clicked 2');

    await browser.close();
  });
});
