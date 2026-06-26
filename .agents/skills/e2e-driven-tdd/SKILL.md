---
name: e2e-driven-tdd
description: Execute a rigorous 4-step E2E-driven Test-Driven Debugging (TDD) and stabilization workflow. Orchestrates planning, E2E test scaffolding, automated execution, and dynamic subagent-driven bug fixing loops.
---
# E2E-Driven TDD & Stabilization Playbook

## Core Philosophy
Do not just write code and assume it works. This skill forces a rigorous 4-step pipeline: **[1. Planning -> 2. Automation -> 3. Execution -> 4. Stabilization]**. The goal is absolute stability, verified by headless browser E2E tests.

Crucially, **do not do everything yourself**. You must act as an orchestrator and dynamically invoke specialized subagents (e.g., `ux-auditor`, `functional-qa`, `robustness-auditor`, or domain experts) to assist in planning, code review, and deep-dive debugging.

## When to use this skill
- When starting a new feature and you want to ensure it is robust from day one.
- When refactoring a complex flow (e.g., Auth, Multi-step Wizards, Payment).
- When the user explicitly requests "버그 픽스 우선" (Bug fix priority) or "테스트 자동화" (Test automation).

## The 4-Phase Pipeline

### Phase 1: Planning & Specification (E2E UX Flow)
**Reference:** `skill://e2e-driven-tdd/references/phase1-planning.md`
- Do not jump into test writing.
- **Dynamic Subagent Action:** Invoke `ux-auditor` to review the current components and output a highly detailed markdown spec (e.g., `ux-flow-e2e-spec.md`) detailing Happy Paths, Edge Cases, validations, and Modals/BottomSheets.

### Phase 2: E2E Automation Scaffolding
**Reference:** `skill://e2e-driven-tdd/references/phase2-automation.md`
- Based on the spec, generate headless browser scripts (e.g., Puppeteer) for each test case.
- Ensure proper environment isolation (e.g., mocking authentication using `sessionStorage`, overriding external API calls).

### Phase 3: Execution & QA Auditing
**Reference:** `skill://e2e-driven-tdd/references/phase3-execution.md`
- Execute the E2E scripts locally. 
- Capture DOM dumps, console logs, or screenshots on failure.
- **Dynamic Subagent Action:** If a test fails in a specific domain (e.g., Supabase 500 error, Vite HMR issue, complex CSS), invoke the corresponding domain expert agent (e.g., `toss-app-dev:supabase`) or `robustness-auditor` to analyze the error logs.

### Phase 4: App Stabilization (The TDD Loop)
**Reference:** `skill://e2e-driven-tdd/references/phase4-stabilization.md`
- Fix the **actual application code**, not just the test script. 
- Add Route Guards, Mock fallbacks (`IS_MOCK`), and DEV-only debug window hooks (e.g., `window.__openModal`) to bypass untestable UI layers.
- Loop back to Phase 3 until all tests pass 100%.

## Case Study / Example
- `skill://e2e-driven-tdd/examples/toss-contract-success.md` — Real-world example of stabilizing the Toss Contract App using this exact pipeline, including debug hooks and mock bypass strategies.
