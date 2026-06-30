# Technical Readiness & QA: Domain Report

This report consolidates the deep iterative analysis performed on the Technical Readiness & QA domain for the Toss Contract App.

## 1. Frontend TS & UI Issues

### TypeScript Compilation Errors
* **False Positives in Prior Knowledge:** Previous reports mentioned TS errors regarding `Flex` spacing and `Badge` color mismatch. However, the codebase uses native `display: 'flex'` (the `<Flex>` component is not imported), and the `<Badge>` color mappings are perfectly aligned with `@toss/tds-mobile`'s `ParagraphBadgeProps` (e.g., in `utils/badgeUtils.ts`).
* **Actual TS Errors (CRITICAL):**
  - **File:** `src/pages/employer/ContractFormPage.tsx` (Lines 236, 271)
  - **Issue:** `error TS2339: Property 'Content' does not exist on type 'ExportedBottomSheet'.` The code uses `<BottomSheet.Content>`, which is not a valid export from the `@toss/tds-mobile` library's BottomSheet.

### PDF Download Logic Unhooked
* **Core Logic:** The logic to generate and download the PDF exists correctly in `src/utils/pdf.ts`.
* **Missing UI Integration:**
  - **Employer View (`src/pages/employer/ContractDetailPage.tsx`):** The function `downloadContractPDF` is imported but never used. The 'Completed' state renders a success banner but lacks the "Download PDF" button.
  - **Worker View (`src/pages/worker/ContractDetailPage.tsx`):** The download function is not imported, and the button is missing.
  - **Dead Code:** `src/components/contract/ContractPreview.tsx` properly implements the button but is completely unused.
* **Required Fix:** A CTA button invoking `downloadContractPDF(contract)` must be added to the `status === 'completed'` state in both the Employer and Worker `ContractDetailPage.tsx` files.

## 2. Backend, Data & Security Issues

### Mock-to-Real Data Mismatch
* **Case Mismatch:** Zod schemas strictly enforce `camelCase` (e.g., `contractType`), while the current mock objects and types use `snake_case` (e.g., `contract_type`).
* **Enum Violations:** The `weekly_holiday` property in mock data uses comma-separated strings or empty strings, which breaks the strict `DayOfWeekSchema` enum.

### Missing Edge Function Implementations
* **`contracts-send`:** Completely skips SMS delivery. It must be updated to call `_shared/solapi.ts` to actually send an SMS to the worker.
* **`contracts-sign`:** Triggers mTLS Smart Message to the employer but fails to notify the worker that their signature was recorded.
* **`contracts-complete`:** Successfully advances the DB state but lacks the crucial notification layer for both the employer and worker.

### CORS Misconfigurations
* **Duplication & Hardcoding:** CORS headers and origin restrictions are duplicated across every Edge Function rather than centralized in a helper. The origins are hardcoded, which will likely break preview deployments.

## 3. QA & Test Coverage

### Testing Framework
* **Vitest** is correctly set up as a devDependency (`^4.1.8`) and configured via npm scripts (`"test": "vitest run"`).

### Missing Coverage in `validation.ts`
* **Minimum Wage Calculation for Non-Hourly Wages:** Currently, only the `hourly` wage is tested. Tests must be added for `daily`, `weekly`, and `monthly` wage conversions to ensure they are accurately compared against the minimum wage.
* **Invalid Work Hours Error:** A test must be added to ensure that `INVALID_WORK_HOURS` is thrown when `startTime` equals `endTime`.
* **Uncovered Utility Functions:** `calcWeeklyWorkHours` and `calcWeeklyHoursFromSchedule` currently have no direct unit tests. Dedicated tests for various inputs and schedules are required.

## Next Steps
1. Resolve the `BottomSheet.Content` TS error.
2. Hook up the PDF download buttons in both Employer and Worker detail pages.
3. Align mock data with Zod schemas (convert to camelCase and fix enums).
4. Implement SMS/push notification logic in the three edge functions and centralize CORS configs.
5. Add the missing Vitest test cases in `validation.test.ts`.

[AUDIT PASSED]
