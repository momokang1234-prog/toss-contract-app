### Intent Analysis Report

**[Current State (Point A)]**
- The user is trying to view individual steps of the `ContractFormPage` funnel (steps 2~9) in the `FlowViewerPage` (분기 시뮬레이션).
- Currently, when clicking a step, the iframe loads the URL (e.g. `?contract-form-wizard=workConditions`), but the `@use-funnel/browser` library detects a missing history state/context for that step and forces a redirect back to the `initial` step (`basicInfo`).

**[Identified Goal (The "Why")]**
- The user wants to directly view the UI design of intermediate funnel steps without having to manually fill out the preceding steps each time in the development/simulation environment.

**[Proposed Alternatives]**
- **Candidate 1 (Recommended):** In `ContractFormPage.tsx`, dynamically set the `initial.step` of `useFunnel` based on the `contract-form-wizard` URL query parameter, **only when in the dev bypass environment** (`sessionStorage.getItem('force_mock') === 'true'`). This tricks `useFunnel` into treating the requested step as the valid entry point, allowing direct rendering of the UI.
- **Candidate 2:** Remove strict funnel state entirely for the whole app. (Not recommended, as production needs step validation).
- **Candidate 3:** Create a separate dummy page for UI preview. (Not recommended, leads to duplicated code).

**[Actionable Execution]**
- Modify `src/pages/employer/ContractFormPage.tsx` to read the query param and conditionally set `initial.step` if `force_mock` is active.

