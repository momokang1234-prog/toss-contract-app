# Phase 4: App Stabilization (The TDD Loop)

## Objective
The ultimate goal of this skill. A failed test usually indicates a fragile application architecture, not a bad test script. **Fix the application code** to handle the edge case gracefully.

## Core Stabilization Strategies

### 1. Architectural Fencing (Route Guards)
If a test fails because it navigates to a forbidden page and crashes, do not just change the test to avoid that page. **Fix the App** by implementing robust Route Guards (e.g., `RequireAuth.tsx`) that redirect users safely back to a valid state.

### 2. Environment Fencing (Mock Bypasses)
If an E2E test running locally crashes because it tries to call a production API (like Supabase Edge Functions or external Storage):
- Introduce a runtime environment check (e.g., `const isMock = () => import.meta.env.DEV && sessionStorage.getItem('force_mock') === 'true'`). 
- **CRITICAL:** Do NOT evaluate `IS_MOCK` as a top-level module constant. In React/Vite environments, it evaluates only once on module load. Always evaluate it at runtime inside the function or component.
- **Fix the App** by returning fake data or skipping the network request when `isMock()` is true.

### 3. UI Layer Interaction (The Right Way)
If a test fails because a complex UI component (like an animated BottomSheet, a Portal, or a third-party Design System Modal) cannot be reliably clicked or awaited by Puppeteer:
- **Do NOT pollute production code.** Exposing React internal state setters (`setIsCompletionModalOpen`) to the global `window` object purely to bypass E2E limitations is a severe anti-pattern.
- **Fix the Test (not the App):** 
  - Inject CSS to disable animations: `* { animation: none !important; transition: none !important; }`
  - Use accessible selectors (`[role="dialog"]`) or wait for the element to become visible using Puppeteer's native capabilities.

## The Iterative Loop
After applying a stabilization fix to the React application, return to **Phase 3 (Execution)** and re-run the test. Repeat this loop until the test passes 100% reliably. Only then can you declare the feature "Done".
