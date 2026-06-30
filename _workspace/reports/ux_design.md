# UX & Design Report: Toss Contract App Release Requirements

This report synthesizes the deep iterative analysis performed on the UX & Design domain of the Toss Contract App. It outlines the specific tasks remaining before the app can be released for production, categorized by sub-domains.

## 1. Tone & Manner (Smart Defaults vs. Legal Constraints)

**Current Status:** The app leverages the Toss Design System (TDS) effectively with a friendly "해요" (haeyo) tone. However, its "Smart Defaults" and automated validations are currently presented in a way that poses legal risks by acting as definitive legal judgments.

**Tasks Remaining:**
- **Soften Definitive Language:** Adjust texts that imply the system guarantees legal compliance. 
  - *Location:* `src/pages/employer/contract-form/steps/FinalChecklistStep.tsx` 
  - *Fix:* Rephrase "시스템이 자동으로 검증하지 않습니다" to prevent implying that other parts *are* legally verified.
  - *Location:* `src/pages/employer/contract-form/steps/Step4WageInsurance.tsx`
  - *Fix:* Rephrase "자동 적용됩니다" to state that severance is a legal requirement based on guidelines, rather than an automated legal application by the app.
- **Add Legal Disclaimers:** Texts providing legal guidance (e.g., from `validation.ts` logic) must include disclaimers stating "This is for reference only and does not constitute legal advice."

## 2. Rejection & Modification Flow

**Current Status:** **Ready.** Both worker flows correctly implement default fallback reasons and safely lock the UI during asynchronous submissions to prevent duplicate requests.
- Fallback texts (`'수정 요청'`, `'거절됨'`) are correctly implemented in `src/pages/worker/ContractDetailPage.tsx`.
- Double-submission prevention (`rejecting`, `rejectingHard` states) is strictly enforced on the CTA buttons.

**Tasks Remaining:** None.

## 3. Lottie Animations & Visuals

**Current Status:** The app uses a mix of static PNGs and Lottie animations, but the application of these assets is inconsistent across similar states.

**Tasks Remaining:**
- **Standardize Success States:** Update the employer submission success screen to use a Lottie animation to match the worker signature success screen's visual fidelity.
  - *Location:* `src/components/ContractResult.tsx`
- **Enhance Loading States:** Replace plain text loading states (e.g., `<Paragraph>불러오는 중...</Paragraph>`) with a global Lottie loading spinner or visual skeleton loader.
  - *Location:* `ContractTimelinePage.tsx`, `ContractDetailPage.tsx`, `ContractHistoryPage.tsx`
- **Clean up Dead Code:** Remove the unused `test-lottie.js` script from the repository root.

## 4. Accessibility (a11y)

**Current Status:** Critical accessibility failures exist in the core signature interaction and contrast ratios for warning texts.

**Tasks Remaining:**
- **Canvas Signature Accessibility:** The signature pad lacks screen-reader support and keyboard accessibility.
  - *Location:* `src/components/SignaturePad.tsx`
  - *Fix:* Add `aria-label`, `role="img"`, and `tabIndex={0}` to the `<canvas>`. Implement a fallback text `<input>` field ("Type to sign") for users unable to draw with a pointer device.
- **Warning Text Contrast:** The contrast ratio for warning text on light yellow backgrounds fails WCAG AAA standards for small text (currently 4.53:1).
  - *Location:* `src/pages/employer/contract-form/steps/Step6Preview.tsx`
  - *Fix:* Darken the text color `#8B6F00` to a higher contrast shade like `#705A00` or `#5C4A00` against the `#FFF9DB` background.

## 5. Loading & Transitions

**Current Status:** While `@suspensive/react` is used well for skeleton loading in lists, foundational routing and funnel transitions lack smoothness.

**Tasks Remaining:**
- **Fix Global Screen Flicker:** The top-level router lacks a Suspense boundary, causing potential white screens or flickers if authentication or routing suspends.
  - *Location:* `src/App.tsx`
  - *Fix:* Wrap the entire `<Routes>` block in a global `<Suspense>` boundary.
- **Smooth Funnel Transitions:** Step transitions in forms are abrupt and jumpy due to instant unmounting/mounting.
  - *Location:* `src/pages/employer/ContractFormPage.tsx`, `src/pages/worker/ContractSignPage.tsx`
  - *Fix:* Wrap the `<funnel.Render>` blocks in a layout transition wrapper (e.g., Framer Motion's `<AnimatePresence>`) to provide smooth slide or fade animations.

[AUDIT PASSED]
