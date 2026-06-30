# Legal & Compliance Domain Report

## 1. UI Wording & Legal Judgment
**Findings from Research:**
- Definitive legal conclusions are used in the codebase (e.g., in `src/pages/employer/contract-form/steps/FinalChecklistStep.tsx`: "법정 기준에 잘 맞게 작성되었어요."). This implies the app acts as a legal authority and risks violating the Certified Labor Attorneys Act and Attorney-at-Law Act. These must be softened to phrases like "참고 기준 내에 있습니다" (Within reference guidelines).
- The term "법정 검증 결과" (Legal Verification Result) must be replaced with "입력 정보 확인" (Input Information Check) across UI components.
- Mandatory legal wording such as "주휴일을 부여해야 합니다" in `src/domain/contract/validation.ts` (Line 214) must be softened to reference the law (e.g., "관련 규정이 있습니다").
- **Action Item:** There is a complete lack of legal disclaimers. A disclaimer explicitly stating "This service does not replace legal advice" needs to be added. Recommended locations:
  - **Onboarding Flow:** `src/pages/auth/LoginPage.tsx` (near the "시작하기" button or role selection) and `src/pages/shared/LanguageOnboarding.tsx`.
  - **Verification / Terms of Service:** `src/pages/employer/contract-form/steps/FinalChecklistStep.tsx` (before they toggle the `checklist_agreed` switch) and `src/pages/worker/ContractSignPage.tsx` (just above the electronic signature pad).

## 2. Validation Engine Blocking
**Findings from Research:**
- The validation engine strictly categorizes issues like minimum wage mismatches as errors (`src/domain/contract/validation.ts`, Lines 179-184).
- The form wizard's state management hook (`src/pages/employer/contract-form/hooks/useContractForm.ts`, Lines 280-285) explicitly blocks progression if domain-level errors exist by forcing an error message on the `checklist_agreed` field.
- **Action Item:** This functionality implies the app is making a final legal decision. We must allow the user to save despite these warnings. We should either downgrade the mismatch from an `error` to a `warning` in `validation.ts` or remove the block in `useContractForm.ts` so users can acknowledge the checklist and proceed.

## 3. Privacy, Signature Integrity & Anti-Forgery
**Findings from Research:**
- Canvas signatures (handled via `SignaturePad` in `src/components/SignaturePad.tsx`, `ContractSignPage.tsx`, etc.) are saved as plaintext base64 without hashes or cryptographic timestamps.
- The `employer_signed_at` field is defined in types and mock data but is not effectively utilized for timestamping signatures in the saving flow.
- Phone numbers are exposed in plain text without masking.
- CI (Connecting Information) is not utilized to verify the signer's identity.
- **Action Item:** Integrate timestamping (`employer_signed_at`, `worker_signed_at`), hash the base64 signature data, apply PII masking to phone numbers, and implement CI for identity verification to ensure legal validity and protect user privacy.

[AUDIT PASSED]
