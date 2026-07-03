# Intent Reframing Examples

This file provides few-shot examples of how the `intent-analyzer` should reframe user requests.

## Example 1: Resolving a Vague UI Request with Underlying Architectural Constraints

**User Request:**
"알바생이 근로계약서 볼 때 화면 아래쪽에 '사장님에게 수정 요청하기' 버튼을 빨간색으로 하나 대충 추가해줘. 누르면 바로 사장님 폰으로 알림 가게."

**Intent-Analyzer Output:**

```markdown
### Intent Analysis Report

**[Current State (Point A)]**
- You requested to add a direct 'Request Edit' red button for Workers that sends immediate push notifications to the Employer.
- *Codebase Check*: Worker contract views are currently read-only (`ContractViewer.tsx`). Push notification hooks do not exist on the client side for security reasons; they are handled via Supabase edge functions triggered by state changes.

**[Identified Goal (The "Why")]**
- You want to provide a way for Workers to reject or request modifications to a contract before signing it, ensuring smooth communication.

**[Proposed Alternatives]**
Instead of forcefully injecting a button and client-side notification logic, I propose:

*   **Candidate C (Recommended): State Machine Transition**
    - Add a `Request Revision` action in the worker's action sheet.
    - Clicking it changes the contract status in Supabase from `sent_to_worker` to `revision_requested` and adds an audit log entry.
    - A Supabase Database Webhook automatically detects this state change and dispatches the notification safely.
    - *Why*: This respects our state machine architecture, keeps client code clean, and ensures notifications are secure.

*   **Candidate D: Form-based Feedback**
    - Create a modal using `@toss/tds-mobile` where the worker can type *what* needs to be fixed.
    - This saves a `comment` to the contract record and flags it.
    - *Why*: Gives the employer context on what to fix, rather than just a generic ping.

**[Target Subagents for Candidate C]**
- `toss-app-dev-supabase`: To update the contract state enum and trigger the DB webhook.
- `ui-builder`: To add the `Request Revision` list item in `ContractViewer.tsx` using TDS components.
```
