# Follow-Up Task: `feat-phase6-triage`

## Overview
While the core widget generator logic, DOM encapsulations, testing integrations, and Phase 5 Programmatic SEO modules are all fully verified and merged onto the `main` branch, a review of the final CI test coverage reveals minor edge case gaps outside of the core LLM factory generation loop.

## Edge Case Coverage Gaps for Refinement

1. **`src/dashboard/src/app` (Next.js Interactive UI)**
   - The interactive Next.js Dashboard features (like the actual `onClick` handler simulating the "Copy Iframe Snippet" function) are currently untested, as Vitest only evaluates the isolated backend Node modules.
   - **Task:** Implement an isolated UI Playwright testing script running against `http://localhost:3000` to simulate clicks and verify clipboard behaviors to ensure frontend stability.

2. **Google Indexing Credentials Failure Mocking**
   - The SEO index module appropriately throws to a `mock` fallback when credentials aren't found, which is correctly tested. However, we have not formally tested the internal `googleapis` catch block behavior for *invalid* credentials.
   - **Task:** Add a mocking suite inside `tests/seo.test.js` using `proxyquire` or `vi.mock` to actively feed a mocked `google.indexing` object an invalid 401 response and assert the `success: false` catch-block fires.

## Action Plan
These items are exclusively non-blocking testing and coverage expansions. The core generator architecture is 100% production-ready. These tasks should be prioritized during the next refinement sprint.
