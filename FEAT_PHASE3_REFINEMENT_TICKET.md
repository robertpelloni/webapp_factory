# Ticket: `feat-phase3-refinement` - Edge Case Refinements

## Overview
While the primary integration of the single-file Vanilla JS HTML widget generator (Phase 3) is complete, passing all deep DOM and CI pipeline checks, test coverage metrics indicate a few minor areas for robustness improvements moving forward.

## Identified Edge Cases & Reproduction Steps

### 1. WebKit `--no-sandbox` E2E Limitations
- **Issue:** The integration test matrix (`tests/embed-integration.test.js`) gracefully skips the WebKit rendering checks because the containerized environment struggles to launch the Apple engine with `--no-sandbox` flags.
- **Reproduction:**
  1. Run `npm run test` in the Docker/CI container.
  2. Observe the stderr log: `Skipping WebKit due to missing OS dependencies... Cannot parse arguments: Unknown option --no-sandbox`.
- **Action Required:** Update the Playwright WebKit launcher args or the underlying Dockerfile OS dependencies to ensure WebKit executes fully headless in the CI, ensuring 100% test coverage across all three browser engines.

### 2. Vercel Mock Deployer Fallbacks
- **Issue:** The deployer unit test (`tests/vercel.test.js`) strictly assumes successful URL formatting, but if the Vercel API is rate-limited or fails (falling back to the `catch(err)` block), it generates a `prj_fallback_...` URL.
- **Reproduction:**
  1. Forcibly throw an error in `src/deployer/vercel.js` inside the `fetch` block.
  2. Observe the `vercel.test.js` failure as it expects standard formatted success strings.
- **Action Required:** Add specific test coverage blocks for the Vercel deployer's error-handling and fallback logic to ensure robustness during API outages.

### 3. Generator Healing Loop Infinite Recursion Safeguards
- **Issue:** The healing loop currently correctly caps at 3 attempts (`maxAttempts = 3`). However, if the LLM output is entirely empty on the third attempt, it currently falls back to `/* fixed */` string replacement, which might mask a catastrophic LLM API failure.
- **Reproduction:**
  1. Mock `callGemini` to return an empty string/null.
  2. Run `tests/generator.test.js` against the bad syntax string.
- **Action Required:** Introduce an explicit failure threshold where an empty LLM patch response throws a fatal error rather than applying the generic string fallback, ensuring bad widgets are never published.

## Next Steps
These edge cases do not block the current release but should be prioritized in the `feat-phase3-refinement` sprint to ensure 100% coverage and pipeline resilience.
