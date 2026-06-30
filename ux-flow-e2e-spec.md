# UX Flow & E2E Test Specification: Contract Negotiation

This specification defines the exact user flows, state transitions, and edge cases for when a worker requests modifications (`change_requested`) or fully rejects (`rejected`) a contract. It serves as Phase 1 (Test Spec) of the E2E-driven TDD process.

## 1. State Machine Transitions

### Flow A: Change Requested (수정 요청)
- **Start State**: `sent` or `viewed`
- **Worker Action**: Clicks "수정 요청하기" -> Fills reason -> Submits
- **Intermediate State**: `change_requested`
- **Employer Action**: Clicks "계약서 수정하기" from the status banner -> Navigates to edit form -> Submits changes
- **Intermediate State**: `draft` (Contract is updated, `rejection_reason` is cleared)
- **Employer Action**: Clicks "근로자에게 공유하기"
- **End State**: `sent` (Cycle repeats until signed or rejected)

### Flow B: Hard Reject (거절)
- **Start State**: `sent` or `viewed`
- **Worker Action**: Clicks "계약 거절하기" -> Fills reason -> Submits
- **End State**: `rejected`
- **Employer View**: Sees red banner "🚫 근로자가 계약을 거절했습니다". Contract cannot proceed directly.
- *Edge Case (Employer override)*: The employer can technically open the "관리 (Manage)" menu -> click "수정하기 (Edit)", returning the contract to `draft` status.

---

## 2. Happy Paths

### 2.1. Requesting Changes
1. **[Worker]** Opens `WorkerContractDetailPage` for a `sent` contract.
2. **[Worker]** Clicks the list row labeled "수정 요청하기" (rejectPrompt).
3. **[Worker]** The BottomSheet `isBottomSheetOpen` becomes `true`.
4. **[Worker]** Types "급여일이 잘못되었습니다" into the text field.
5. **[Worker]** Clicks "수정 요청하기" CTA button.
6. **[System]** `requestChangeContract` API is called.
7. **[Worker]** BottomSheet closes, page re-renders, header updates to default, and actions disappear.
8. **[Employer]** Opens `EmployerContractDetailPage` for the contract.
9. **[Employer]** Sees the blue `change_requested` banner displaying "요청 사유: 급여일이 잘못되었습니다".
10. **[Employer]** Clicks "계약서 수정하기" CTA within the banner.
11. **[Employer]** Modifies the form (`useContractForm`) and saves.
12. **[System]** Contract becomes `draft`, `rejection_reason` is cleared (`""`).

### 2.2. Rejecting the Contract
1. **[Worker]** Opens `WorkerContractDetailPage` for a `sent` contract.
2. **[Worker]** Clicks the list row labeled "계약 거절하기" (rejectHardPrompt).
3. **[Worker]** The BottomSheet `isHardRejectBottomSheetOpen` becomes `true`.
4. **[Worker]** Types "조건이 맞지 않습니다" into the text field.
5. **[Worker]** Clicks "거절하기" CTA button.
6. **[System]** `rejectContract` API is called.
7. **[Employer]** Opens `EmployerContractDetailPage`.
8. **[Employer]** Sees the red `rejected` banner with "거절 사유: 조건이 맞지 않습니다".

---

## 3. Edge Cases & Validation Triggers

### 3.1. Empty Reason Fallback
- **Scenario**: Worker leaves the text field blank in either BottomSheet.
- **Expected Behavior**: 
  - Change Request uses fallback string: `"수정 요청"`
  - Hard Reject uses fallback string: `"거절됨"`
- **Assertion**: API payload must include these default strings if `rejectionReason` or `rejectHardReason` is empty.

### 3.2. Double Submission Prevention
- **Scenario**: Worker rapid-clicks the submit CTA button in the BottomSheet.
- **Expected Behavior**: 
  - `rejecting` / `rejectingHard` state becomes `true`.
  - The CTA button becomes `disabled` during the async API call.
  - The button text changes to "처리 중..." (Processing).

### 3.3. Browser Confirm Dialog
- **Scenario**: Worker clicks the submit CTA.
- **Expected Behavior**: A `window.confirm` dialog appears before the API is called.
  - If user clicks "Cancel" -> State resets, BottomSheet remains open.
  - If user clicks "OK" -> Proceeds to API call.

### 3.4. Employer Edit Override on Rejected State
- **Scenario**: Employer opens a `rejected` contract.
- **Expected Behavior**: 
  - There is no direct "수정하기" button in the red banner.
  - However, `canEdit` evaluates to `true` (since `status === 'rejected'`), meaning the "관리 (Manage)" TextButton in the Top header is visible.
  - Clicking "관리" -> "수정하기" successfully navigates to the edit form.
  - Saving the form resets the state to `draft`.
  
### 3.5. Form Validation Blocking Draft
- **Scenario**: Employer attempts to save a modified `change_requested` contract but leaves the wage blank.
- **Expected Behavior**: 
  - `validateStep` returns `false`.
  - Contract remains in form state; API is not called.
  - Error message "금액을 입력해주세요" appears under the input.

---

## 4. Auth & State Boundaries

- **Worker Persona (`WorkerContractDetailPage`)**:
  - Can only view components enclosed in the page.
  - Action visibility (`canSign`) is strictly bound to `status === 'sent' || status === 'viewed'`.
  - Re-fetches the contract on load; uses Supabase Realtime channel `worker-contract-${id}` to auto-update UI if Employer modifies it simultaneously.
- **Employer Persona (`EmployerContractDetailPage`)**:
  - `canEdit` boundary strictly defined as `draft`, `rejected`, or `change_requested`.
  - Cannot directly mutate state to `change_requested`; only the worker's `requestChangeContract` API can transition it to this state.
  - Re-fetches contract on load; uses Supabase Realtime channel `contract-${id}`.
