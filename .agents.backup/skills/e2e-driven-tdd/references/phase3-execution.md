# Phase 3: Execution & QA Auditing

## Objective
Run the E2E scripts to expose hidden runtime bugs in the application. Do not assume the app works just because it compiled successfully (TSC pass != UI pass).

## Execution Protocol
1. **Verify Dev Server State:**
   - Before executing tests, verify that the target environment is actually running. For example, use `curl -I http://localhost:5173` to check if the server is up. If it is occupied or failing, fix the environment first.
2. **Explicit Timeout Configurations:**
   - The OS command must have a hard timeout (e.g., `timeout 60 node --test tests/e2e/case1.js`) to prevent hanging.
   - Puppeteer code must also have explicit timeouts (e.g., `page.setDefaultTimeout(10000)`).
3. **Capture Outputs:**
   - Command stdout (Look for the `node --test` TAP output and Exit Code).
   - `[Browser Console]` logs forwarded from Puppeteer. Watch out for React `Warning:`, `Failed to fetch`, or `500 Internal Server Error`.

## Dynamic Subagent Triage
If a test fails, **analyze the root cause before fixing**:
- **Selector/Timing Issue?** You may fix the test script yourself (e.g., use `waitForSelector`).
- **Domain Logic / API Error?** Invoke a domain expert subagent.
  - Example: If a Supabase Edge Function returns 500, invoke `toss-app-dev:supabase`.
- **Complex React State / Hook Errors?** Invoke `robustness-auditor` to deeply inspect the component code causing the crash.

Pass the captured browser logs and the failed test step to the subagent to get an actionable fix.
