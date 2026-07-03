# Phase 2: E2E Automation Scaffolding

## Objective
Translate the `ux-flow-e2e-spec.md` into executable headless browser scripts (e.g., Puppeteer). These scripts will serve as the harsh reality check for the application's stability.

## Core Rules for Automation
1. **Environment Isolation & Mocking (Crucial Timing):**
   - **Do NOT** navigate to a protected route before injecting mock states, as Route Guards will instantly redirect you.
   - Inject necessary mock states using `page.evaluateOnNewDocument()` OR navigate to a public route (like `/` or `/login`) first.
   - **Backend Tokens:** If the app uses real backend auth (e.g., Supabase), do not rely solely on `sessionStorage` custom flags. Inject real JWT tokens into the correct `localStorage` keys or `cookies`.
   - Example: 
     ```javascript
     await page.evaluateOnNewDocument(() => { 
       sessionStorage.setItem('mock_role', 'employer'); 
       sessionStorage.setItem('force_mock', 'true');
       localStorage.setItem('sb-auth-token', 'mock_jwt');
     });
     await page.goto('http://localhost:5173/employer/contracts/new');
     ```
2. **Handle Animations (The Right Way):**
   - DO NOT hack application code to bypass UI. If an animation is blocking a click, inject a global CSS rule to disable animations during testing:
     ```javascript
     await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });
     ```
3. **Structured Reporting (Node Native Test Runner):**
   - Do not rely on brittle `console.log('✅')` emoji parsing.
   - Wrap the test in Node.js Native Test Runner (`node --test`). Use `assert` to verify conditions. A non-zero exit code reliably indicates a failure to the system.

## Integration with existing skills
- Read `skill://e2e-tester/SKILL.md` for detailed Puppeteer boilerplate and setup instructions.
