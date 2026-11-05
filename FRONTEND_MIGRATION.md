# Widget Integration & Migration Guide for CMS/Dashboard

## Overview
As part of Phase 3, the Autonomous Web Application Factory no longer outputs heavy Next.js applications for the generated utilities. Instead, we have migrated to a lightweight, single-file Vanilla JS and HTML structure using Tailwind CSS via CDN.

## Key DOM Structure Changes
1. **Single File Output:** The generated tools are now contained entirely within a single block of HTML/JS.
2. **Iframe Integration (Required):** To integrate these widgets into the legacy CMS or monitoring dashboard, you **must** use an `<iframe>`. Direct DOM injection (`innerHTML`) is no longer supported and could cause CSS conflicts.
3. **Tailwind Preflight Reset:** The widgets utilize Tailwind CSS via CDN, which includes a preflight that resets baseline styles. By embedding via iframe, we protect the host CMS from these resets.
4. **Global Isolation:** The code generation prompt has been updated to explicitly forbid overriding global DOM properties (like `window.onload` or `document.body.onclick`) and unscoped global CSS (like `body !important`). This ensures the widget logic stays contained.

## Implementation Example
To embed a discovered widget, locate its Vercel subdomain from the monitoring dashboard and use the following snippet:

```html
<iframe
  src="https://{subdomain}.utilityhub.com"
  width="100%"
  height="600px"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  title="Generated Utility"
></iframe>
```

## Validation & Compatibility
We have implemented a cross-browser Playwright test matrix (Chromium, Firefox, WebKit) in our CI pipeline (`tests/embed-integration.test.js`) to continuously verify that generated widgets do not bleed CSS styling onto host `body` elements and do not override global DOM window events.
