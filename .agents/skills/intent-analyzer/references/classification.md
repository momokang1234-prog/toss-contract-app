# Request Classification and Routing

This document defines the classification criteria for user requests and how they map to specific development workflows and specialized agents.

## 1. Intent Classification Matrix

| Category | Indicators / Keywords | Common Affected Files | Recommended Subagents |
|---|---|---|---|
| **Bug Fix** | "error", "bug", "not working", "glitch", "broken", "malfunction" | `src/pages/`, `src/hooks/`, `src/components/` | `robustness-auditor`, `ux-auditor`, `functional-qa` |
| **Feature Addition** | "add", "new", "create", "develop", "make" | `src/pages/`, `src/components/`, `supabase/` | `ux-auditor`, `toss-app-dev-supabase` |
| **Refactoring** | "improve", "organize", "optimize", "refactor", "clean up" | `src/utils/`, `src/hooks/` | `robustness-auditor` |
| **Testing & QA** | "test", "QA", "verify", "scenario" | `src/dev/`, `test-results/` | `functional-qa` |

---

## 2. Intent Analysis Framework

Use this checklist to analyze the user's intent:

### 1. Identify Target Persona & Stage
- **Employer Flow (사장님)**: Does the request impact contract creation, workspace setup, or signing validation?
- **Worker Flow (근로자)**: Does it impact contract viewing, rejection, or digital signature submission?
- **Contract State Machine**: Which states are involved? (e.g. modifying states, transitions, cron jobs for expiration).

### 2. Identify Technical Domain
- **UI / Frontend**: Requires TDS styling guidelines and standard React state management.
- **Backend / Supabase**: Requires DB schema changes, Edge Function deployment, or RLS policies.
- **Build / Packaging**: Requires Vite config, plugin updates, or bundler troubleshooting.

### 3. Determine Risk Level
- **High Risk**: Modifying core state transitions, authentication flow, RLS policies, or database schemas.
- **Medium Risk**: Changing form validation logic, adding fields, or editing common components.
- **Low Risk**: Adjusting styling, typos, adding comments, or creating standalone docs.

---

## 3. Subagent Recommendation Guide

- **toss-app-dev-toss-mini-app**: Use for TDS Component usage questions, mobile container rules, and bridge API issues.
- **toss-app-dev-supabase**: Use for DB schema migration, RLS policies, and Edge Functions.
- **toss-app-dev-vite**: Use for build failures, module imports, and configuration issues.
- **ux-auditor**: Use for UI/UX reviews, styling inconsistencies, and typography issues.
- **robustness-auditor**: Use for edge cases, error handling, state validation, and Zod schemas.
- **functional-qa**: Use for E2E testing scenarios, mock validation, and unit tests.
