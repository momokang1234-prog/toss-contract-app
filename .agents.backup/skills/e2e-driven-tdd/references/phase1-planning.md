# Phase 1: Planning & Specification (E2E UX Flow)

## Objective
Before writing any test scripts, you must define exactly what the application is supposed to do. This phase creates the blueprint (`ux-flow-e2e-spec.md`) that will guide the entire TDD loop.

## Subagent Orchestration
Do not generate the spec based solely on your own assumptions. 
**You MUST invoke a specialized subagent** (e.g., `ux-auditor` or a domain expert) to analyze the specific frontend components (`src/pages`, `src/hooks`) and output the spec.

**Example Invocation Prompt:**
> "Invoke `ux-auditor` to read `src/pages/employer/ContractFormPage.tsx` and its child steps. Generate `ux-flow-e2e-spec.md` containing all Happy Paths, Edge Cases, validation error triggers, and Modal/BottomSheet interactions."

## Spec Requirements (`ux-flow-e2e-spec.md`)
The output document must contain:
1. **Happy Paths:** The ideal end-to-end user journey (e.g., Login -> Fill Form -> Sign -> Send).
2. **Edge Cases:** Validation errors (e.g., Minimum wage violations, empty fields).
3. **UI Triggers:** Explicit mention of when Modals, BottomSheets, or Toasts should appear.
4. **Auth / State Boundaries:** How the route is protected (e.g., `RequireAuth` redirects if `mock_role` is missing).

## Verification Gate
Before moving to Phase 2, ensure the spec aligns with the actual codebase capabilities. If the user requested a feature that violates domain logic (e.g., removing a legally required signature), use `intent-analyzer` to push back.
