# Prior Knowledge Report: Toss Contract App Release Requirements

This report outlines the additional work needed before the "toss-contract-app" (Toss 전자 근로계약서 미니앱) can be released for production, based on analysis of the PRD, Code Review, Legal Risk Analysis, Design/UX guidelines, and E2E test specs.

---

## 1. Technical Readiness & QA

**Current Status:** The MVP frontend is approximately 80% complete, but the backend is severely lacking, operating entirely in Mock mode (`IS_MOCK=true`).

*   **Mock-to-Real Data Mismatch (CRITICAL):** Mock data values (e.g., `contract_type`, `wage_payment_method`, `work_days`) do not match the expected Zod Schema enums. Switching `IS_MOCK` to `false` will result in immediate runtime crashes due to validation failures.
*   **Backend & Edge Functions Missing:** 
    *   The `contracts-complete` Edge Function is completely missing, making the final employer confirmation impossible in Real mode.
    *   Existing functions (`contracts-send`, `contracts-sign`) lack actual implementation for push/SMS notifications (only stubs exist).
*   **Notification System:** There is no actual notification system (SMS/Push/Inbox) hooked up, meaning workers have no automated way of knowing they received a contract unless shared manually.
*   **Test Coverage (0%):** There are no frontend or validation tests. Core logic in `validation.ts` (minimum wage calculations, break times) lacks unit testing.
*   **TypeScript Errors:** At least 6 TS compilation errors remain unresolved (e.g., `spacing` prop on `Flex`, `Badge` color mismatch).
*   **PDF Download Hookup:** The PDF download logic exists (`utils/pdf.ts`) but is not hooked up to the "Download PDF" button in the `completed` state.
*   **Security (CORS):** Edge Functions currently use `*` for CORS. This must be restricted to the specific Toss mini-app domain.

## 2. Legal & Compliance

**Current Status:** The application is at risk of violating the Certified Labor Attorneys Act (공인노무사법) and Attorney-at-Law Act (변호사법) by acting as a legal authority rather than an informational tool.

*   **UI Wording & Legal Judgment (CRITICAL):** 
    *   Terms like "법정 검증 결과" (Legal Verification Result) must be changed to "입력 정보 확인" (Input Information Check). 
    *   Definitive legal conclusions like "법정 요건을 충족하는 계약서입니다" (This contract satisfies legal requirements) must be softened to "참고 기준 내에 있습니다" (Within reference guidelines).
    *   Mandatory wording ("부여해야 합니다") must be changed to reference the law ("관련 규정이 있습니다").
*   **Validation Blocking:** The app currently blocks saving a contract if it triggers a validation warning (e.g., minimum wage mismatch). This implies the app is making a final legal decision. Warnings should alert the user but **allow** them to save.
*   **Disclaimers:** The app completely lacks legal disclaimers. A disclaimer stating "This service does not replace legal advice" must be added to the onboarding flow, verification results, and Terms of Service.
*   **Security & Anti-Forgery:** The canvas signature is saved as plaintext base64 without hashes or timestamps (`employer_signed_at` is unused). This compromises legal validity.
*   **Privacy:** Phone numbers are exposed in plain text (no masking), and CI (Connecting Information) is not utilized to verify the signer's identity.

## 3. UX & Design

**Current Status:** The app leverages the Toss Design System (TDS Mobile) successfully and follows standard Toss UX patterns, but requires polish on edge cases and animations.

*   **Tone & Manner:** Consistently uses friendly "해요" (haeyo) speech. The app intends to provide "Smart Defaults" so users don't have to manually calculate complex labor laws, but this must be balanced with the legal constraints mentioned above.
*   **Rejection & Modification Flow:** A solid worker flow exists for "Change Requested" (`change_requested` - blue banner) and "Reject" (`rejected` - red banner). However, fallback text for empty rejection reasons needs verification, and double-submission prevention (disabling buttons and showing "Processing...") must be strictly enforced.
*   **Lottie Animations & Visuals:** References to Lottie scripts (`test-lottie.js`) and 3D PNG illustrations exist. 3D PNGs are prioritized for Hero/Empty states, but Lottie animations need QA to ensure they render smoothly across states (e.g., Success checks, Loading states).
*   **Accessibility (a11y):** The Canvas signature lacks a keyboard/screen-reader alternative. Color contrast on warning texts (e.g., `#8B6F00`) needs to be audited to meet TDS accessibility guidelines.
*   **Loading & Transitions:** While `@suspensive/react` was introduced for skeleton loading on lists, transition states (e.g., `Suspense fallback` missing in `App.tsx` causing screen flicker) still need resolution. Ensure Funnel transitions are smooth without jumping.
