---
description: Run automated Puppeteer E2E tests to verify DOM/HTML states after UI changes. Use this skill to validate UI components, routing, and buttons visually/structurally instead of just relying on code compilation.
---

# E2E Tester Skill

This skill provides a standardized way to execute and manage Puppeteer-based end-to-end tests to verify UI changes in the `toss-contract-app`.

## When to use this skill
- Whenever you make a change to a UI component, page layout, or interactive element.
- Whenever the `AGENTS.md` "Verification Gate" requires HTML/DOM verification of UI components.
- When you need to simulate user clicks, navigation, or verify if a button is rendered correctly under specific state conditions.

## How to use this skill

1. **Write or Modify the Test Script**
   The primary test script is located at `.claude/commands/e2e-tester/references/scripts/run-e2e.cjs`.
   If you need to test a specific flow (e.g. Employer Dashboard, Worker Contract Sign), modify this script using `replace_file_content` to match the target URL and DOM elements you want to test.
   *Ensure the dev server (`npm run dev`) is running on `http://localhost:5173` before testing!*

2. **Execute the Test**
   Run the test script via the `run_command` tool:
   ```bash
   node .claude/commands/e2e-tester/references/scripts/run-e2e.cjs
   ```
   Wait for the background task to complete and review the DOM output/logs.

3. **Verify and Report**
   - If the script outputs `✅ SUCCESS`, the UI verification is complete.
   - If the script outputs `❌ FAILED`, analyze the outputted HTML/DOM state, fix the React code, and run the test again.

## Guidelines for Puppeteer Scripts
- Always use `--no-sandbox` and `--disable-setuid-sandbox` args.
- The `executablePath` should point to the installed chrome binary (e.g. `/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome`).
- Use `await new Promise(r => setTimeout(r, ms))` instead of `waitForTimeout` since it's deprecated in newer Puppeteer versions.
- For iframes (like Toss Mini-app worker pages), always search for the frame by URL: `page.frames().find(f => f.url().includes('worker/contracts'))`
- If an element is intercepted or hard to click, use `.evaluate(el => el.click())`.
